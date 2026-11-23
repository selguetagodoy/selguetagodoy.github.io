"""RindeLab: discover open-licensed car photos WITHOUT modifying the live catalog.

Input CSV/JSON columns: marca, modelo, anio, carroceria, foto_actual.
Output: catalogo_fotos_abiertas.json + auditoria_extraccion.csv.
Wikidata P18 is an optional discovery hint: Commons metadata ALWAYS controls licensing.
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import logging
import os
import re
import tempfile
import time
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup

ALLOW_NC = False
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
OPENVERSE_API = "https://api.openverse.org/v1/images/"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WDQS_API = "https://query.wikidata.org/sparql"
DEFAULT_UA = "RindeLabPhotoFetcher/1.0 (https://selguetagodoy.github.io/rindelab/; public research)"
BLOCKED = re.compile(
    r"\b(interior|dashboard|engine(?:\s+bay)?|logo|emblem|wheel|crash|"
    r"accident|diagram|sketch|toy|scale[\s-]+model|brochure|brochure scan|"
    r"steering|speedometer|instrument cluster|badge|wreck|render|concept)\b", re.I
)
TRIMS = {
    "GLX", "GLS", "EX", "LX", "SE", "SEL", "SX", "XLT", "XL", "LTZ",
    "HIGHLINE", "PREMIUM", "LUXURY", "LIMITED", "FULL", "BASE", "DRIVE", "DUAL", "SHINE",
    "CVT", "AT", "MT", "DCT", "EAT", "DSG", "AWD", "FWD", "RWD",
    "HEV", "PHEV", "MHEV", "EV", "BEV", "TDI", "TSI", "TFSI",
    "TURBO", "TURBODIESEL", "DIESEL", "OTTO", "MPI",
    "4X2", "4X4", "2WD", "4WD", "EURO", "STT", "AUTOMATIC",
    "MANUAL", "AUTOMATICA", "AUTOMATICO", "BENCINA", "NAFTA",
}
BODY_WORDS = {
    "sedan": ("sedan", "berlina", "saloon"),
    "hatchback": ("hatchback", "hatch", "5-door", "5 door", "sportback", "fastback"),
    "coupe": ("coupe", "coupé", "2-door", "2 door"),
    "convertible": ("cabriolet", "convertible", "roadster", "cabrio"),
    "wagon": ("wagon", "estate", "touring", "avant", "variant", "sportwagon"),
    "pickup": ("pickup", "pick-up", "pick up", "camioneta doble cabina"),
    "van": ("van", "furgon", "furgón", "transit", "sprinter"),
    "suv": ("suv", "crossover", "sport utility"),
}
FIELDS = {
    "marca": ("marca", "brand", "make"),
    "modelo": ("modelo", "model", "nombre_modelo"),
    "anio": ("anio", "año", "year"),
    "carroceria": ("carroceria", "carrocería", "body", "body_style"),
    "foto_actual": ("foto_actual", "photo", "photo_url", "imagen", "image_url"),
}


def plain(value: object) -> str:
    if value is None:
        return ""
    return " ".join(BeautifulSoup(html.unescape(str(value)), "html.parser").stripped_strings)


def ascii_norm(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c)).lower()


def model_base(marca: str, modelo: str) -> str:
    """Keep commercial family numbers (208, 3008, X3, i10); drop trims/engines/gearboxes."""
    s = ascii_norm(plain(modelo)).upper().replace("-", " ")
    brand = ascii_norm(marca).upper().replace("-", " ")
    if s.startswith(brand + " "):
        s = s[len(brand):].strip()
    s = re.sub(r"^\s*NEW\s+", "", s)
    s = re.sub(r"(?<=\d),(?=\d)", ".", s)
    s = re.sub(r"[,;()]+", " ", s)
    tokens = s.split()
    out = []
    for token in tokens:
        w = token.strip(". ")
        # Do not remove the number in a model family (Peugeot 208, Audi A5, BMW X3).
        engine = bool(re.fullmatch(r"\d[.]\d(?:[A-Z]{0,3})?|\d[.,]\d+[A-Z]*|\d+\s*HP", w))
        gearbox = bool(re.fullmatch(r"\d+(?:AT|MT|DCT|CVT|DSG)|E[456][A-Z]?", w))
        if (w in TRIMS or engine or gearbox) and out:
            break
        if w in {"LTS", "LITROS"} and out:
            break
        out.append(w)
        if len(out) >= 5:
            break
    return " ".join(out).strip() or s.strip()


def year_of(value: object) -> str:
    match = re.search(r"\b(?:19|20)\d{2}\b", str(value))
    return match.group(0) if match else ""


def body_kind(text: str) -> str:
    s = ascii_norm(plain(text))
    for name, synonyms in BODY_WORDS.items():
        if any(ascii_norm(x) in s for x in synonyms):
            return name
    return ""


def empty_photo(v: object) -> bool:
    return plain(v).strip().lower() in {"", "nan", "none", "null", "n/a", "sin foto", "-"}


def read_rows(input_file: Path) -> list[dict]:
    if input_file.suffix.lower() == ".csv":
        data = pd.read_csv(input_file, dtype=str, keep_default_na=False).to_dict("records")
    elif input_file.suffix.lower() == ".json":
        raw = json.loads(input_file.read_text(encoding="utf-8"))
        if isinstance(raw, list):
            data = raw
        elif isinstance(raw, dict):
            data = next((raw[k] for k in ("records", "data", "fichas") if isinstance(raw.get(k), list)), None)
            if data is None:
                raise ValueError("JSON must be an array or contain records/data/fichas.")
        else:
            raise ValueError("Unsupported JSON structure.")
    else:
        raise ValueError("Only .json and .csv are supported.")
    rows = []
    for i, r in enumerate(data):
        if not isinstance(r, dict):
            raise ValueError(f"Record {i} is not an object.")
        row = {canonical: next((r[x] for x in aliases if x in r), "")
               for canonical, aliases in FIELDS.items()}
        if not empty_photo(row["foto_actual"]):
            continue
        row["marca"] = plain(row["marca"]).strip()
        row["modelo"] = plain(row["modelo"]).strip()
        row["anio"] = year_of(row["anio"])
        if not (row["marca"] and row["modelo"] and row["anio"]):
            logging.warning("Skipping incomplete row %s", i)
            continue
        rows.append(row)
    return rows


def groups_for(rows: list[dict]) -> dict[str, dict]:
    """Group by (brand, model family, year), tracking conflicting body styles."""
    grouped = {}
    for r in rows:
        base = model_base(r["marca"], r["modelo"])
        brand = ascii_norm(r["marca"]).strip()
        key = "|".join([brand, ascii_norm(base), r["anio"]])
        if key not in grouped:
            grouped[key] = {"marca": r["marca"], "modelo_base": base,
                            "anio": r["anio"], "bodies": set(), "count": 0}
        body = body_kind(plain(r["carroceria"]) + " " + r["modelo"])
        if body:
            grouped[key]["bodies"].add(body)
        grouped[key]["count"] += 1
    return grouped


def license_info(name: str, url: str = "", version: str = "") -> tuple[str, str] | None:
    """Closed allowlist; domain and scheme must be official CC. No NC unless opted in."""
    text = re.sub(r"[\s_-]+", " ", plain(name).upper()).strip()
    v = str(version).strip().lower()
    u = str(url or "").lower()
    if any(x in text for x in (" NO DERIV", " ND", " ALL RIGHTS")) or "/by-nd/" in u or "/by-nc-nd/" in u:
        return None
    if "CC0" in text or text in ("CC 0", "PUBLIC DOMAIN ZERO") or "/publicdomain/zero/" in u:
        license_name, path = "CC0", "/publicdomain/zero/1.0/"
    elif text in ("PDM", "PUBLIC DOMAIN", "PUBLIC DOMAIN MARK") or "/publicdomain/mark/" in u:
        license_name, path = "PDM", "/publicdomain/mark/1.0/"
    else:
        form = None
        if re.search(r"\bBY NC SA\b", text) or "/by-nc-sa/" in u:
            form = "BY-NC-SA"
        elif re.search(r"\bBY NC\b", text) or "/by-nc/" in u:
            form = "BY-NC"
        elif re.search(r"\bBY SA\b", text) or "/by-sa/" in u:
            form = "BY-SA"
        elif re.search(r"\bBY\b", text) or "/by/" in u:
            form = "BY"
        if form is None or ("NC" in form and not ALLOW_NC):
            return None
        detected = re.search(r"([234])\.0", text) or re.search(r"/(?:by|by-sa|by-nc|by-nc-sa)/([234])\.0", u)
        if detected:
            v = detected.group(1) + ".0"
        if v not in {"2.0", "3.0", "4.0"}:
            return None
        license_name = f"CC {form} {v}"
        path = f"/{form.lower()}/{v}/"
    parsed = urlparse(url)
    if url and (parsed.scheme != "https" or parsed.hostname not in {"creativecommons.org", "www.creativecommons.org"}):
        # Do not accept a non-official license reference in lieu of official CC terms.
        return None
    canonical = "https://creativecommons.org" + (path if license_name in ("CC0", "PDM") else "/licenses" + path)
    return license_name, canonical


def safe_url(url: str) -> str | None:
    if not url:
        return None
    p = urlparse(str(url))
    return str(url) if p.scheme == "https" and p.hostname else None


def relevant(title: str, description: str, brand: str, base: str,
             year: str, body: str) -> tuple[bool, str]:
    evidence = ascii_norm(plain(title) + " " + plain(description))
    if BLOCKED.search(evidence):
        return False, "unmatched"
    evidence = evidence.replace("-", " ")
    brand_norm = ascii_norm(brand)
    brand_tokens = [t for t in re.findall(r"[a-z0-9]+", brand_norm) if len(t) > 1]
    if brand_norm == "land rover" and "range rover" in evidence:
        brand_tokens = ["rover"]
    if brand_norm in ("mercedes benz", "mercedes-benz") and "mercedes" in evidence:
        brand_tokens = ["mercedes"]
    if brand_tokens and not any(re.search(r"\b" + re.escape(t) + r"\b", evidence) for t in brand_tokens):
        return False, "unmatched"
    family_tokens = [t for t in re.findall(r"[a-z0-9]+", ascii_norm(base)) if t not in {"new"}]
    # Require ordered, adjacent family tokens: E-Pace must NEVER match I-Pace e-Trophy.
    normal = re.sub(r"[^a-z0-9]+", " ", evidence).strip()
    pattern = r"\b" + r"\s+".join(map(re.escape, family_tokens)) + r"\b" if family_tokens else ""
    if not pattern or not re.search(pattern, normal):
        return False, "unmatched"
    title_norm = ascii_norm(plain(title)).replace("-", " ")
    if ("lwb" in title_norm or "long wheelbase" in title_norm) and not (
        "lwb" in ascii_norm(base) or "long wheelbase" in ascii_norm(base)
    ):
        return False, "unmatched"
    seen_bodies = {kind for kind, synonyms in BODY_WORDS.items()
                   if any(ascii_norm(x) in title_norm for x in synonyms)}
    if body and seen_bodies and body not in seen_bodies:
        return False, "unmatched"
    # Special bodies need explicit backing in the source record; never use a
    # Sportbrake, Cabriolet, Avant or Coupe as an unqualified sedan-like reference.
    if not body:
        uncommon = ("sportbrake", "shooting brake", "cabrio", "convertible",
                    "coupe", "coupé", "avant", "estate")
        if any(t in title_norm for t in uncommon) and not any(t in ascii_norm(base) for t in uncommon):
            return False, "unmatched"
    # The first year in a filename is commonly the car's model year; later
    # years can refer to when the photo was taken. Do NOT count later years
    # as an 'exact_year' match.
    years = [int(x) for x in re.findall(r"\b(?:19|20)\d{2}\b", title_norm)]
    if years and abs(years[0] - int(year)) > 4:
        return False, "unmatched"
    photo_event = re.search(r"\b(?:auto show|motor show|genf|geneva|salon|exhibition|mondial|IAA)\b",
                            title_norm, re.I)
    return True, ("exact_year" if years and years[0] == int(year) and not photo_event else "model_family")


class Fetcher:
    def __init__(self, ua: str, delay: float, timeout: float, wikidata: bool = False):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": ua, "Accept": "application/json"})
        self.delay, self.timeout, self.wikidata = delay, timeout, wikidata
        self.license_rejections = 0
        self.last_request = 0.0

    def json_get(self, url: str, params: dict) -> dict:
        last_err = None
        for attempt in range(4):
            remaining = self.delay - (time.monotonic() - self.last_request)
            if remaining > 0:
                time.sleep(remaining)
            try:
                self.last_request = time.monotonic()
                res = self.session.get(url, params=params, timeout=self.timeout)
                if res.status_code in (429, 500, 502, 503, 504):
                    retry = res.headers.get("Retry-After", "")
                    pause = min(60.0, float(retry)) if retry.isdigit() else min(30, 2 ** (attempt + 1))
                    logging.warning("HTTP %s at %s; waiting %.1fs", res.status_code, url, pause)
                    time.sleep(pause)
                    last_err = requests.HTTPError(f"{res.status_code} {url}")
                    continue
                res.raise_for_status()
                return res.json()
            except (requests.Timeout, requests.ConnectionError, requests.HTTPError, ValueError) as e:
                last_err = e
                time.sleep(min(16, 2 ** (attempt + 1)))
        raise RuntimeError(f"API request failed: {url}: {last_err}")

    def parse_commons(self, pages: list[dict], item: dict) -> list[dict]:
        out = []
        for page in pages:
            title = page.get("title", "").removeprefix("File:")
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            licname = plain((meta.get("LicenseShortName") or {}).get("value", ""))
            licurl = (meta.get("LicenseUrl") or {}).get("value", "")
            lic = license_info(licname, licurl)
            if not lic:
                self.license_rejections += 1
                continue
            if info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}:
                continue
            width, height = int(info.get("width") or 0), int(info.get("height") or 0)
            if width < 600 or height <= 0 or width / height < 0.65:
                continue
            body = next(iter(item["bodies"])) if len(item["bodies"]) == 1 else ""
            ok, match = relevant(title, plain((meta.get("ImageDescription") or {}).get("value", "")),
                                 item["marca"], item["modelo_base"], item["anio"], body)
            if not ok:
                continue
            creator = plain((meta.get("Artist") or {}).get("value", ""))
            if not creator and lic[0] not in {"CC0", "PDM"}:
                continue
            src = safe_url(info.get("url", ""))
            page_url = safe_url(info.get("descriptionurl", ""))
            if not src or not page_url or urlparse(page_url).hostname != "commons.wikimedia.org":
                continue
            out.append({"match_level": match, "image_url": src,
                        "thumb_url": safe_url(info.get("thumburl", "")),
                        "source": "wikimedia_commons", "source_page_url": page_url,
                        "author": creator or None, "license": lic[0], "license_url": lic[1]})
        return out

    def wikidata_file_pages(self, item: dict) -> list[dict]:
        if not self.wikidata:
            return []
        name = item["marca"] + " " + item["modelo_base"]
        response = self.json_get(WIKIDATA_API, {
            "action": "wbsearchentities", "search": name, "language": "en",
            "type": "item", "limit": 6, "format": "json"
        })
        labels = []
        family = set(ascii_norm(item["modelo_base"]).split())
        for hit in response.get("search", []):
            label = ascii_norm(hit.get("label", ""))
            if not all(x in label.split() for x in family):
                continue
            qid = hit.get("id", "")
            if re.fullmatch(r"Q\d+", qid):
                labels.append(qid)
        if not labels:
            return []
        query = ("SELECT ?item ?image WHERE { VALUES ?item { " +
                 " ".join("wd:" + q for q in labels[:5]) +
                 " } ?item wdt:P18 ?image. } LIMIT 10")
        sparql = self.json_get(WDQS_API, {"query": query, "format": "json"})
        filenames = []
        for result in sparql.get("results", {}).get("bindings", []):
            raw = result.get("image", {}).get("value", "")
            name = unquote(raw.rsplit("/", 1)[-1]).replace("_", " ")
            if name and "." in name:
                filenames.append("File:" + name)
        if not filenames:
            return []
        response = self.json_get(COMMONS_API, {
            "action": "query", "titles": "|".join(filenames[:10]),
            "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 800, "format": "json", "formatversion": "2"
        })
        return response.get("query", {}).get("pages", [])

    def commons_search(self, item: dict) -> list[dict]:
        query = item["marca"] + " " + item["modelo_base"] + " " + item["anio"]
        pages = []
        try:
            pages += self.wikidata_file_pages(item)
        except RuntimeError as e:
            logging.warning("Wikidata unavailable; continuing with Commons: %s", e)
        response = self.json_get(COMMONS_API, {
            "action": "query", "generator": "search", "gsrnamespace": 6,
            "gsrsearch": query, "gsrlimit": 25,
            "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 800, "format": "json", "formatversion": "2"
        })
        pages += response.get("query", {}).get("pages", [])
        seen = set()
        unique = []
        for p in pages:
            if p.get("title") not in seen:
                seen.add(p.get("title"))
                unique.append(p)
        return self.parse_commons(unique, item)

    def openverse_search(self, item: dict) -> list[dict]:
        query = item["marca"] + " " + item["modelo_base"] + " " + item["anio"]
        response = self.json_get(OPENVERSE_API, {
            "q": query, "page_size": 20, "mature": "false"
        })
        out = []
        for v in response.get("results", []):
            lic = license_info(v.get("license", ""), v.get("license_url", ""),
                               str(v.get("license_version") or ""))
            if not lic:
                self.license_rejections += 1
                continue
            kind = str(v.get("filetype") or "").lower()
            if kind not in {"jpg", "jpeg", "png", "webp", "image/jpeg", "image/png", "image/webp"}:
                continue
            width, height = int(v.get("width") or 0), int(v.get("height") or 0)
            if width < 600 or height <= 0 or width / height < 0.65:
                continue
            body = next(iter(item["bodies"])) if len(item["bodies"]) == 1 else ""
            ok, match = relevant(v.get("title", ""), " ".join(str(x.get("name", "")) for x in v.get("tags") or []),
                                 item["marca"], item["modelo_base"], item["anio"], body)
            if not ok:
                continue
            author = plain(v.get("creator"))
            if not author and lic[0] not in {"CC0", "PDM"}:
                continue
            src = safe_url(v.get("url", ""))
            original = safe_url(v.get("foreign_landing_url", ""))
            if not src or not original:
                continue
            out.append({"match_level": match, "image_url": src,
                        "thumb_url": safe_url(v.get("thumbnail", "")),
                        "source": "openverse", "source_page_url": original,
                        "author": author or None, "license": lic[0], "license_url": lic[1]})
        return out


def blank(query: str) -> dict:
    return dict(query_used=query, match_level="unmatched", image_url=None,
                thumb_url=None, source=None, source_page_url=None,
                author=None, license=None, license_url=None,
                retrieved_at=datetime.now(timezone.utc).isoformat(timespec="seconds"))


def select_best(candidates: list[dict]) -> dict | None:
    if not candidates:
        return None
    return sorted(candidates, key=lambda x: x["match_level"] != "exact_year")[0]


def atomic_json(file: Path, data: dict) -> None:
    file.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=file.parent,
                                     prefix=".photo-tmp-", suffix=".json", delete=False) as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
        tmp = f.name
    os.replace(tmp, file)


def save(outdir: Path, results: dict, rejects: dict) -> None:
    atomic_json(outdir / "catalogo_fotos_abiertas.json", results)
    atomic_json(outdir / ".rindelab_photo_checkpoint.json", rejects)
    audit = defaultdict(lambda: dict(consultados=0, wikimedia=0, openverse=0,
                                     sin_resultado=0, descartados_por_licencia=0))
    for k, v in results.items():
        brand = k.split("|")[0]
        audit[brand]["consultados"] += 1
        source = v["source"]
        if source == "wikimedia_commons":
            audit[brand]["wikimedia"] += 1
        elif source == "openverse":
            audit[brand]["openverse"] += 1
        else:
            audit[brand]["sin_resultado"] += 1
    for brand, n in rejects.items():
        audit[brand]["descartados_por_licencia"] = n
    csvpath = outdir / "auditoria_extraccion.csv"
    with csvpath.open("w", newline="", encoding="utf-8-sig") as f:
        fieldnames = ["marca", "consultados", "encontrados_wikimedia",
                      "encontrados_openverse", "sin_resultado", "descartados_por_licencia"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for brand, x in sorted(audit.items()):
            writer.writerow(dict(marca=brand, consultados=x["consultados"],
                                 encontrados_wikimedia=x["wikimedia"],
                                 encontrados_openverse=x["openverse"],
                                 sin_resultado=x["sin_resultado"],
                                 descartados_por_licencia=x["descartados_por_licencia"]))


def run(args: argparse.Namespace) -> None:
    rows = read_rows(Path(args.input))
    if args.limit:
        rows = rows[:args.limit]
    grouped = groups_for(rows)
    outdir = Path(args.output_dir)
    results_path = outdir / "catalogo_fotos_abiertas.json"
    checkpath = outdir / ".rindelab_photo_checkpoint.json"
    results = json.loads(results_path.read_text("utf-8")) if args.resume and results_path.exists() else {}
    rejects = json.loads(checkpath.read_text("utf-8")) if args.resume and checkpath.exists() else {}
    client = Fetcher(args.user_agent, args.sleep, args.timeout, args.wikidata)
    pending = [(k, v) for k, v in grouped.items() if k not in results]
    logging.info("%s missing records, %s unique family/year groups; %s pending",
                 len(rows), len(grouped), len(pending))
    for i, (key, item) in enumerate(pending, 1):
        query = " ".join([item["marca"], item["modelo_base"], item["anio"]])
        record = blank(query)
        client.license_rejections = 0
        if len(item["bodies"]) > 1:
            logging.warning("%s has incompatible body styles: %s; manual review", key, item["bodies"])
        else:
            candidates = []
            try:
                candidates = client.commons_search(item)
            except RuntimeError as e:
                logging.warning("Wikimedia error for %s: %s", key, e)
            selected = select_best(candidates)
            if selected is None:
                try:
                    selected = select_best(client.openverse_search(item))
                except RuntimeError as e:
                    logging.warning("Openverse error for %s: %s", key, e)
            if selected:
                record.update(selected)
        results[key] = record
        brand = key.split("|")[0]
        rejects[brand] = rejects.get(brand, 0) + client.license_rejections
        logging.info("[%s/%s] %s => %s (%s)", i, len(pending), key,
                     record["match_level"], record["source"] or "-")
        if i % args.checkpoint_every == 0:
            save(outdir, results, rejects)
            logging.info("Checkpoint: %s results saved", len(results))
    save(outdir, results, rejects)
    logging.info("Finished: %s records. Output directory: %s", len(results), outdir)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", required=True, help="CSV or JSON catalog")
    p.add_argument("--output-dir", default=".", help="Folder for manifest, audit, checkpoint")
    p.add_argument("--limit", type=int, default=0, help="First N missing records (pilot: 20)")
    p.add_argument("--sleep", type=float, default=1.0, help="Minimum delay between API calls, seconds")
    p.add_argument("--timeout", type=float, default=20.0)
    p.add_argument("--checkpoint-every", type=int, default=25)
    p.add_argument("--resume", action="store_true", help="Skip existing manifest keys")
    p.add_argument("--wikidata", action="store_true", help="Try Wikidata P18 -> licensed Commons")
    p.add_argument("--user-agent", default=os.getenv("RINDELAB_PHOTO_USER_AGENT", DEFAULT_UA))
    return p


if __name__ == "__main__":
    parser = build_parser()
    arguments = parser.parse_args()
    if arguments.limit < 0 or arguments.checkpoint_every < 1 or arguments.sleep < 0:
        parser.error("--limit must be >=0, --checkpoint-every >=1, --sleep >=0")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    run(arguments)
