"""Concurrent, resumable Commons->Openverse candidate discovery for 3CV photo clusters.

All outputs are staged for visual/generation/body verification. NO web catalog edits.
Run queue generator before fetching; Commons is primary, Openverse is fallback.
"""
from __future__ import annotations
import argparse
import csv
import importlib.util
import json
import logging
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

FILE = Path(__file__).resolve().with_name("rindelab-open-photos.py")
spec = importlib.util.spec_from_file_location("rindelab_photo_source", FILE)
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)

# A shared limiter controls REQUEST STARTS across workers (not just each thread).
_lock = threading.Lock()
_last = 0.0


def global_throttle(interval):
    global _last
    if interval <= 0:
        return
    with _lock:
        remaining = interval - (time.monotonic() - _last)
        if remaining > 0:
            time.sleep(remaining)
        _last = time.monotonic()


class BulkFetcher(source.Fetcher):
    def __init__(self, ua, interval, timeout, wikidata):
        super().__init__(ua, 0.0, timeout, wikidata)
        self.interval = interval

    def json_get(self, url, params):
        # Interactive batches should never stall for minutes on a failing
        # Openverse endpoint. Respect HTTP 429 with a capped Retry-After;
        # skip transient HTTP 5xx with at most two attempts.
        last_error = None
        for attempt in range(2):
            global_throttle(self.interval)
            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                if response.status_code in (429, 500, 502, 503, 504):
                    retry = response.headers.get("Retry-After", "")
                    if response.status_code == 429:
                        pause = min(12.0, float(retry)) if retry.isdigit() else 2.0 * (attempt + 1)
                    else:
                        pause = 1.0 + attempt
                    last_error = f"HTTP {response.status_code}"
                    if attempt == 0:
                        time.sleep(pause)
                    continue
                response.raise_for_status()
                return response.json()
            except (source.requests.Timeout, source.requests.ConnectionError,
                    source.requests.HTTPError, ValueError) as exc:
                last_error = str(exc)
                if attempt == 0:
                    time.sleep(1.0 + attempt)
        raise RuntimeError(f"API unavailable {url}: {last_error}")


def group_key(g):
    return "|".join([source.ascii_norm(g["marca"]),
                     source.ascii_norm(g["familia"]),
                     g["cohorte"], g["carroceria"]])


def work(g, *, interval, timeout, ua, wikidata):
    key=group_key(g)
    # A 4-year search window is a discovery cohort, never confirmed generation.
    item=dict(marca=g["marca"],modelo_base=g["familia"],
              anio=g["anio_consulta"],bodies=set())
    body=g["carroceria"]
    if body in {"sedan", "hatchback", "coupe", "convertible", "pickup", "van"}:
        item["bodies"].add(body)
    client=BulkFetcher(ua,interval,timeout,wikidata)
    record=source.blank(g["consulta"])
    candidates=[]
    diagnostics=[]
    try:
        try:
            candidates=client.commons_search(item)
        except (RuntimeError, OSError, ValueError) as exc:
            diagnostics.append("commons:"+str(exc)[:160])
        selected=source.select_best(candidates)
        if selected is None:
            try:
                candidates=client.openverse_search(item)
                selected=source.select_best(candidates)
            except (RuntimeError, OSError, ValueError) as exc:
                diagnostics.append("openverse:"+str(exc)[:160])
        if selected:
            record.update(selected)
    finally:
        client.session.close()
    record.update({
        "cluster_key":key,
        "brand":g["marca"],
        "family":g["familia"],
        "cohort":g["cohorte"],
        "body":g["carroceria"],
        "candidate_fichas":int(g["fichas"]),
        "sample_versions":g["ejemplos"],
        "requires_visual_review":True,
        "requires_generation_review":True,
        "license_rejections":client.license_rejections,
        "errors":diagnostics,
    })
    return key,record


def save(out, result):
    source.atomic_json(out/"candidatos_masivos.json",result)
    fields=["marca","familia","cohorte","carroceria","fichas_en_grupo","fuente","coincidencia",
            "estado","descartes_licencia","errores","url_pagina_foto"]
    with (out/"auditoria_masiva.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w=csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in sorted(result.values(),key=lambda v:-v["candidate_fichas"]):
            w.writerow(dict(marca=r["brand"],familia=r["family"],cohorte=r["cohort"],carroceria=r["body"],
                fichas_en_grupo=r["candidate_fichas"],fuente=r["source"],coincidencia=r["match_level"],
                estado=("requiere_revision_visual" if r["image_url"] else "sin_coincidencia"),
                descartes_licencia=r["license_rejections"],errores=";".join(r["errors"]),
                url_pagina_foto=r["source_page_url"]))


def run(args):
    with Path(args.queue).open(encoding="utf-8-sig", newline="") as f:
        queue=list(csv.DictReader(f))
    if args.limit:
        queue=queue[:args.limit]
    out=Path(args.output_dir)
    out.mkdir(parents=True,exist_ok=True)
    path=out/"candidatos_masivos.json"
    results=json.loads(path.read_text("utf-8")) if args.resume and path.exists() else {}
    pending=[g for g in queue if group_key(g) not in results]
    logging.info("Groups %d, pending %d, workers %d, rate 1 request / %.2fs",
                 len(queue),len(pending),args.workers,args.sleep)
    if not pending:
        save(out,results);return
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        jobs={pool.submit(work,g,interval=args.sleep,timeout=args.timeout,
                          ua=args.user_agent,wikidata=args.wikidata):g
              for g in pending}
        for i,future in enumerate(as_completed(jobs),1):
            g=jobs[future]
            try:
                key,row=future.result()
            except Exception as exc:
                key=group_key(g)
                row=source.blank(g["consulta"])
                row.update(cluster_key=key,brand=g["marca"],family=g["familia"],
                           cohort=g["cohorte"],body=g["carroceria"],
                           candidate_fichas=int(g["fichas"]),sample_versions=g["ejemplos"],
                           requires_visual_review=True,requires_generation_review=True,
                           license_rejections=0,errors=["worker:"+str(exc)[:160]])
            results[key]=row
            logging.info("[%d/%d] %-42s  %s",i,len(jobs),key,
                         row["source"] or "not found")
            if i % args.checkpoint_every==0:
                save(out,results)
                logging.info("Checkpoint %d / %d",i,len(jobs))
    save(out,results)
    good=[x for x in results.values() if x["image_url"]]
    print(json.dumps(dict(groups=len(results),candidates=len(good),
       potentially_covered_fichas=sum(x["candidate_fichas"] for x in good),
       validated_for_publication=0,
       catalogue_modified=False),ensure_ascii=False))


def parser():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--queue",default="rindelab/data/fotos-rapidas/cola_fotografica_priorizada.csv")
    p.add_argument("--output-dir",default="rindelab/data/fotos-rapidas/piloto")
    p.add_argument("--limit",type=int,default=30)
    p.add_argument("--workers",type=int,default=4)
    p.add_argument("--sleep",type=float,default=0.8,
                   help="Minimum seconds between ALL API requests combined")
    p.add_argument("--timeout",type=float,default=18.0)
    p.add_argument("--checkpoint-every",type=int,default=10)
    p.add_argument("--resume",action="store_true")
    p.add_argument("--wikidata",action="store_true")
    p.add_argument("--user-agent",default=os.getenv("RINDELAB_PHOTO_USER_AGENT",source.DEFAULT_UA))
    p.add_argument("--verbose",action="store_true")
    a=p.parse_args()
    if a.workers < 1 or a.workers > 6: p.error("--workers must be between 1 and 6")
    if a.sleep < 0.5: p.error("--sleep must be >=0.5 to respect Commons rate limits")
    if a.checkpoint_every < 1: p.error("--checkpoint-every must be >=1")
    return a


if __name__=="__main__":
    a=parser()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(asctime)s %(levelname)s %(message)s")
    run(a)
