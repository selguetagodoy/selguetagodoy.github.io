#!/usr/bin/env python3
"""Audited batch importer for RINDELAB from CarImages Rights and Wikidata/Commons.
No generative images, no image substitution across body styles, no price changes.
"""
import csv, hashlib, io, json, os, re, sys, time, unicodedata
import urllib.parse as up, urllib.request as ur
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "rindelab/data"
IMGS = ROOT / "rindelab/images/commons"
PHOTOJS = ROOT / "rindelab/v2-photos.js"
URL = "https://carimages.org/media/data/carimages-rights-latest.csv"
HEADERS = {"User-Agent": "RINDELAB-image-import/1.1 (https://selguetagodoy.github.io/rindelab/; contact: e.elguetagodoy@gmail.com)", "Accept": "application/json,text/csv,image/jpeg,*/*"}
TAG = "licensedCarImagesRights20261122"
MAX_PHOTOS = int(os.environ.get("RINDELAB_PHOTO_BATCH", "75"))
WIKIDATA_LIMIT = int(os.environ.get("RINDELAB_WIKIDATA_LIMIT", "35"))
DRY = "--dry-run" in sys.argv
ALNUM = re.compile(r"[a-z0-9]+")

def norm(x):
    x = unicodedata.normalize("NFKD", str(x or "")).encode("ascii", "ignore").decode().lower()
    return " ".join(ALNUM.findall(x))
def words(x):
    return norm(x).split()
def get(url, limit=190_000_000, timeout=35):
    req = ur.Request(url, headers=HEADERS)
    with ur.urlopen(req, timeout=timeout) as r:
        if r.status != 200: raise ValueError("HTTP " + str(r.status))
        if int(r.headers.get("Content-Length", "0")) > limit: raise ValueError("file too large")
        out = r.read(limit + 1)
        if len(out) > limit: raise ValueError("file too large")
        return out
def getjson(url):
    return json.loads(get(url, 10_000_000).decode("utf-8"))

def core_and_qualifiers(family):
    t = words(family)
    t = [x for x in t if x not in ("new", "nuevo", "nueva", "all", "the")]
    qualifiers = [x for x in ("sportback", "coupe", "cabrio", "cabriolet", "convertible", "cargo", "refrigerado", "pasajero", "pickup", "furgon", "hatchback", "sedan") if x in t]
    cut = {"cabina", "simple", "doble", "cargo", "box", "refrigerado", "pasajero", "pickup", "furgon", "sportback", "coupe", "cabrio", "cabriolet", "convertible", "hatchback", "sedan", "hybrid"}
    core = [x for x in t if x not in cut]
    if "serie" in core or "series" in core or len(core) != 1: return None, qualifiers
    if len(core[0]) < 2: return None, qualifiers
    return core[0], qualifiers

def choose(target, records):
    family = target["family"]; make = norm(target["brand"]).replace(" ", "")
    core, qual = core_and_qualifiers(family)
    if not core: return None
    if make == "ram": make_alias = {"ram", "ramtrucks", "dodge"}
    elif make == "alfaromeo": make_alias = {"alfaromeo"}
    elif make == "astonmartin": make_alias = {"astonmartin"}
    elif make == "mercedesbenz": make_alias = {"mercedesbenz"}
    else: make_alias = {make}
    opts = []
    for row in records.get((make, core), []):
        filename = row.get("source_filename", "")
        stem = words(filename.replace("_", " "))
        if core not in stem: continue
        if any(x in stem for x in ("interior", "dashboard", "engine", "motor", "steering", "wheel", "rear", "back", "inside", "logo", "badge", "tail", "headlight")): continue
        if any(q not in stem for q in qual): continue
        if ("new" in words(family) or "nuevo" in words(family)) and not re.search(r"\b202[2-6]\b", " ".join(stem)): continue
        years = [int(y) for y in re.findall(r"\b20(?:1[6-9]|2[0-6])\b", " ".join(stem))]
        if not years: continue
        year = max(years)
        if year < 2019: continue
        if row.get("license_code", "").lower() not in ("cc0", "pd", "cc-by-2.0", "cc-by-3.0", "cc-by-4.0", "cc-by-sa-2.0", "cc-by-sa-3.0", "cc-by-sa-4.0"): continue
        if not row.get("creator_name") or not row.get("source_page_url", "").startswith("https://commons.wikimedia.org/wiki/File:"): continue
        score = 30 + (year - 2019) + (3 if "front" in stem else 0) + (2 if "chile" in stem else 0)
        opts.append((score, year, row))
    opts.sort(key=lambda x: (-x[0], -x[1], x[2].get("source_filename", "")))
    return opts[0][2] if opts else None

def commons_info(filename):
    params = up.urlencode({"action": "query", "titles": "File:" + filename, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "720", "format": "json"})
    j = getjson("https://commons.wikimedia.org/w/api.php?" + params)
    info = next(iter(j.get("query", {}).get("pages", {}).values()), {}).get("imageinfo", [{}])[0]
    md = info.get("extmetadata", {})
    def plain(v):
        return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(v or ""))).strip()
    lic = plain(md.get("LicenseShortName", {}).get("value", ""))
    author = plain(md.get("Artist", {}).get("value", ""))
    lic_url = md.get("LicenseUrl", {}).get("value", "").replace("http://", "https://")
    if not hasattr(commons_info, "_debug"): commons_info._debug = 0
    if commons_info._debug < 3:
        print("COMMONS DEBUG", filename, json.dumps({"keys": list(info), "lic": lic, "author": author[:90], "licenseUrl": lic_url, "descriptionUrl": info.get("descriptionurl"), "thumburl": info.get("thumburl"), "metadata": list(md)}, ensure_ascii=False), flush=True)
        commons_info._debug += 1
    if not re.fullmatch(r"CC0|CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?|Public domain", lic, re.I): return None
    if not author or not info.get("thumburl") or not lic_url.startswith("https://creativecommons.org/"): return None
    if not info.get("descriptionurl", "").startswith("https://commons.wikimedia.org/wiki/File:"): return None
    if not info["thumburl"].startswith(("https://upload.wikimedia.org/", "https://thumb.wikimedia.org/", "https://commons.wikimedia.org/")): return None
    return {"author": author, "license": lic, "licenseUrl": lic_url, "source": info["descriptionurl"], "thumburl": info["thumburl"]}

def get_wikidata(target):
    """CarAPI's Wikidata P18 idea as conservative fall-through, no server needed."""
    name = target["brand"] + " " + target["family"]
    qs = up.urlencode({"action": "wbsearchentities", "search": name, "language": "en", "limit": 5, "format": "json"})
    hits = getjson("https://www.wikidata.org/w/api.php?" + qs).get("search", [])
    wanted = norm(name)
    for hit in hits:
        if norm(hit.get("label")) != wanted: continue
        ent = getjson("https://www.wikidata.org/w/api.php?" + up.urlencode({"action": "wbgetentities", "ids": hit["id"], "props": "claims", "format": "json"})).get("entities", {}).get(hit["id"], {})
        claims = ent.get("claims", {})
        if "P176" not in claims or "P18" not in claims or "P31" not in claims: continue
        file = claims["P18"][0].get("mainsnak", {}).get("datavalue", {}).get("value")
        if isinstance(file, str) and file.lower().endswith((".jpg", ".jpeg")):
            return {"source_filename": file, "origin": "wikidata-p18", "qid": hit["id"]}
    return None

def main():
    groups = json.loads((DATA / "catalog-coverage-20261122.json").read_text(encoding="utf-8"))["allGroups"]
    missing = [g for g in groups if not g["photo"]]
    assert len(missing) >= 100, "Unexpected commercial group count"
    source = PHOTOJS.read_text(encoding="utf-8")
    if TAG in source: raise SystemExit("Importer already applied: do not duplicate batch")
    print("Downloading rights manifest:", URL, flush=True)
    csv_bytes = get(URL, timeout=120)
    print("Downloaded", len(csv_bytes), "bytes", flush=True)
    indexed = {}; rows = 0
    for row in csv.DictReader(io.StringIO(csv_bytes.decode("utf-8-sig"))):
        rows += 1
        link = row.get("carimages_url", "")
        m = re.search(r"/cars/([^/?#]+)/([^/?#]+)/", link)
        if not m: continue
        make = norm(m.group(1)).replace(" ", "")
        model = norm(m.group(2)).replace(" ", "")
        indexed.setdefault((make, model), []).append(row)
    print("Indexed", rows, "photos", "keys", len(indexed), flush=True)
    chosen = []; declined = []; stats = {"datasetRows": rows, "missingBefore": len(missing), "selectedFromRights": 0, "selectedFromWikidata": 0, "downloaded": 0}
    catalog = sorted(missing, key=lambda x: (-x.get("priority", 0), x["brand"], x["family"]))
    for item in catalog:
        found = choose(item, indexed)
        if found: chosen.append((item, found, "carimages-rights"))
        else: declined.append({"brand": item["brand"], "family": item["family"], "reason": "no high-confidence dataset match"})
    print("High-confidence candidates in rights manifest:", len(chosen), flush=True)
    # Automatically add only evidence-strong Commons files. No stock/dealer images.
    entries = []; audit = []; used = set()
    for item, candidate, origin in chosen:
        if len(entries) >= MAX_PHOTOS: break
        filename = candidate["source_filename"]
        if filename in used: continue
        try:
            info = commons_info(filename)
            if not info: raise ValueError("Commons attribution/license not verified")
            data = get(info["thumburl"], 1_500_000)
            if len(data) < 12_000 or len(data) > 1_000_000 or not data.startswith(b"\xff\xd8") or not data.endswith(b"\xff\xd9"):
                raise ValueError("not valid compact JPEG")
            stem = re.sub(r"[^a-z0-9]+", "-", norm(item["brand"] + " " + item["family"])).strip("-")
            dest = "rindelab-" + stem[:72] + "-carimages-20261122.jpg"
            local = "./images/commons/" + dest
            if (IMGS / dest).exists(): raise ValueError("duplicate local filename")
            entry = {"brand": item["brand"], "pattern": r"\b" + r"\s+".join(re.escape(w) for w in words(item["family"])) + r"\b",
                     "from": "2026", "to": "2026", "file": filename,
                     "model": item["brand"] + " " + item["family"] + " (fotografía referencial de familia; verificar versión)",
                     "author": info["author"], "license": info["license"], "licenseUrl": info["licenseUrl"],
                     "source": info["source"], "localSrc": local}
            if not DRY: (IMGS / dest).write_bytes(data)
            entries.append(entry); used.add(filename)
            audit.append({**entry, "origin": origin, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), "carimagesPage": candidate.get("carimages_url")})
            stats["selectedFromRights"] += 1
            print("OK", len(entries), item["brand"], item["family"], filename, flush=True)
            time.sleep(0.08)
        except Exception as e:
            declined.append({"brand": item["brand"], "family": item["family"], "reason": "image verification failed", "detail": str(e)[:160]})
            print("SKIP", item["brand"], item["family"], str(e)[:130], flush=True)
    # Wikidata / Commons fallback uses the P176 + P31 + P18 checks in CarAPI.
    if len(entries) < MAX_PHOTOS:
        for item in catalog[:WIKIDATA_LIMIT]:
            if len(entries) >= MAX_PHOTOS: break
            if any(e["brand"] == item["brand"] and norm(e["model"]).startswith(norm(item["brand"] + " " + item["family"])) for e in entries): continue
            try:
                fallback = get_wikidata(item)
                if not fallback or fallback["source_filename"] in used: continue
                info = commons_info(fallback["source_filename"])
                if not info: continue
                data = get(info["thumburl"], 1_500_000)
                if len(data) < 12_000 or len(data) > 1_000_000 or not data.startswith(b"\xff\xd8") or not data.endswith(b"\xff\xd9"): continue
                dest = "rindelab-" + re.sub(r"[^a-z0-9]+", "-", norm(item["brand"] + " " + item["family"]))[:72].strip("-") + "-wikidata-20261122.jpg"
                if (IMGS / dest).exists(): continue
                entry = {"brand": item["brand"], "pattern": r"\b" + r"\s+".join(re.escape(w) for w in words(item["family"])) + r"\b",
                         "from": "2026", "to": "2026", "file": fallback["source_filename"],
                         "model": item["brand"] + " " + item["family"] + " (Wikidata P18, fotografía referencial)",
                         "author": info["author"], "license": info["license"], "licenseUrl": info["licenseUrl"], "source": info["source"],
                         "localSrc": "./images/commons/" + dest}
                if not DRY: (IMGS / dest).write_bytes(data)
                entries.append(entry); used.add(fallback["source_filename"]); stats["selectedFromWikidata"] += 1
                audit.append({**entry, "origin": "wikidata-p18", "qid": fallback["qid"], "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
                print("WIKIDATA", item["brand"], item["family"], flush=True)
            except Exception as e:
                print("Wikidata skipped:", item["brand"], item["family"], str(e)[:95], flush=True)
            time.sleep(0.15)
    stats["downloaded"] = len(entries)
    manifest = {"provider": "CarImages Rights + CarAPI-style Wikidata/Commons metadata", "dataset": URL, "copyright": "images individually licensed, metadata CC0", "status": "verified", "stats": stats, "photos": audit, "unmatched": declined[:407]}
    if not DRY:
        (DATA / "carimages-rights-import-20261122.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if entries:
            marker = "const entries=localEntries.concat("
            assert marker in source
            source = source.replace(marker, "const " + TAG + "=" + json.dumps(entries, ensure_ascii=False, indent=2) + ";\n" + marker)
            old = "licensedNovember2026,licensedNovember2026B).map("
            assert old in source
            source = source.replace(old, "licensedNovember2026,licensedNovember2026B," + TAG + ").map(")
            anchor = "const neutralFamilyPhotoSources=new Set(["
            assert anchor in source
            source = source.replace(anchor, anchor + "\n" + "".join("  " + json.dumps(e["localSrc"]) + ",\n" for e in entries))
            PHOTOJS.write_text(source, encoding="utf-8")
            for fn in ("index.html", "cotizador.html", "electromovilidad.html"):
                page = ROOT / "rindelab" / fn
                html = page.read_text(encoding="utf-8")
                old = "v2-photos.js?v=20261122-licensed33"
                assert old in html
                page.write_text(html.replace(old, "v2-photos.js?v=20261122-carimages"), encoding="utf-8")
    print("FINAL", json.dumps(stats, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
