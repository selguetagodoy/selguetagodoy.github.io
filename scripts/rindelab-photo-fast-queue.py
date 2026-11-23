"""Build a prioritized, generation-aware open-photo discovery queue from missing 3CV entries.

Does NOT assign photos to vehicle records. Buckets of nearby years are search hints,
not proof of shared vehicle generations. Publish only after visual/body/licensing QA.
"""
from __future__ import annotations
import argparse
import csv
import importlib.util
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

SELF = Path(__file__).resolve()
FETCHER = SELF.with_name("rindelab-open-photos.py")
spec = importlib.util.spec_from_file_location("rindelab_photo_fetcher", FETCHER)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


def folded(text):
    return "".join(c for c in unicodedata.normalize("NFKD", str(text or ""))
                   if not unicodedata.combining(c)).lower()


def family(brand, model):
    raw = re.sub(r"[\s_-]+", " ", folded(model).strip())
    if not raw:
        return ""
    normalized_brand = folded(brand).replace("-", " ")
    raw = re.sub(r"^" + re.escape(normalized_brand) + r"\s+", "", raw)
    raw = re.sub(r"^new\s+", "", raw)
    if normalized_brand in ("mercedes-benz", "m. benz", "mercedes benz"):
        x = re.match(r"^(a|b|c|e|s|cla|cls|cle|glb|gla|glc|gle|gls|sl|slk)\s*\d{2,3}\b", raw)
        if x:
            return x.group(1).upper() + "-Class"
    if normalized_brand == "bmw":
        x = re.match(r"^([1-8])(?:1[468]|2[05]|3[05]|4[05]|5[05]|6[05]|7[05]|8[05])(?:[di]|e)?\b", raw)
        if x:
            return x.group(1) + " Series"
    # Special cases: a Tiggo 2 and Tiggo 8 must never share a target group;
    # MINI Countryman/Clubman are different vehicles from the Cooper hatch.
    if normalized_brand in ("chery", "jetour"):
        x = re.match(r"^(tiggo|dashing|x70)\s*(\d{1,2})(?:\b|\s)", raw)
        if x:
            return (x.group(1) + " " + x.group(2)).upper()
    if normalized_brand == "mini":
        for fam in ("countryman", "paceman", "clubman", "roadster"):
            if re.search(r"\b" + fam + r"\b", raw):
                return fam.upper()
        if "cooper" in raw:
            return "COOPER"
    # The output here is a SEARCH CLUSTER, never evidence of image identity.
    # Preserve distinctive compound product names, and don't collapse E-Pace/I-Pace
    # or Grand Cherokee/Grand Cherokee L into the same discovery query.
    raw = re.sub(r"\s+", " ", raw)
    compounds = (
        "range rover evoque", "range rover sport", "range rover velar",
        "range rover", "grand cherokee l", "grand cherokee",
        "grand vitara", "grand nomade", "grand i10", "grand santa fe",
        "grand carnival", "santa fe", "x trail", "sx4 s cross",
        "c3 aircross", "c5 aircross", "c4 picasso",
        "discovery sport", "new discovery", "cerato 5",
        "yaris cross", "corolla cross", "transit custom", "transit courier",
        "ranger raptor", "f 150", "f150", "e pace", "i pace",
        "718 boxster", "718 cayman", "911 gt3 rs",
        "john cooper works countryman", "john cooper works",
        "mini countryman", "mini paceman",
    )
    for compound in compounds:
        if raw == compound or raw.startswith(compound + " "):
            return compound.upper()
    base = helper.model_base(brand, model).upper().replace("-", " ")
    tokens = base.split()
    if not tokens:
        return ""
    if len(tokens) >= 2 and tokens[1] in {
        "UM", "XM", "QL", "SL", "NQ5", "RB", "HC", "DM", "TM", "GD",
        "BD", "RP", "SC", "YP", "AI3", "BA", "LM", "TL", "NX4",
        "F30", "F48", "G30", "W204", "W205", "W212", "W213",
    }:
        return " ".join(tokens[:2])
    return tokens[0]


def body_type(model):
    x = folded(model)
    # Chilean 3CV uses "5P." for SUVs/wagons/MPVs, not only hatchbacks.
    # Likewise, a "4P." entry can be a truck or a station wagon.
    if re.search(r"\b(?:cabriolet|cabrio|convertible|roadster)\b", x):
        return "convertible"
    if re.search(r"\b(?:coupe|2 puertas)\b", x):
        return "coupe"
    if re.search(r"\b(?:minibus|escolar|(?:1[1-9]|2\d)\s*asientos)\b", x):
        return "minibus"
    if re.search(r"\b(?:camioneta|pick\s?up|pickup|doble\s+cabina|cabina\s+simple)\b", x):
        return "pickup"
    if re.search(r"\b(?:furgon|van\b|cargo)\b", x):
        return "van"
    if re.search(r"\b(?:station wagon|wagon|suv|crossover)\b", x):
        return "suv_or_wagon"
    if re.search(r"\b(?:hatchback|hatch|\bhb\b|sportback)\b", x):
        return "hatchback"
    if re.search(r"\b(?:sedan|sdn\b|sd\b|saloon)\b", x):
        return "sedan"
    return "unspecified"


def window(year):
    y = int(year)
    if y <= 2013:
        return "2010-2013"
    if y <= 2017:
        return "2014-2017"
    if y <= 2021:
        return "2018-2021"
    return "2022-2026"


def build(rows):
    groups = defaultdict(lambda: dict(rows=0, variants=set(), years=set(), samples=[]))
    for row in rows:
        brand, model, year = row["marca"], row["modelo"], row["anio"]
        fam = family(brand, model)
        if not fam or not re.fullmatch(r"(?:19|20)\d{2}", year):
            continue
        body = body_type(model)
        cohort = window(year)
        key = (brand, fam, cohort, body)
        item = groups[key]
        item["rows"] += 1
        item["variants"].add(model)
        item["years"].add(year)
        if len(item["samples"]) < 3:
            item["samples"].append(model)
    output = []
    for (brand, fam, cohort, body), info in groups.items():
        years = sorted(info["years"])
        output.append(dict(marca=brand, familia=fam, cohorte=cohort,
                           carroceria=body, fichas=info["rows"],
                           variantes=len(info["variants"]),
                           anio_min=years[0], anio_max=years[-1],
                           anio_consulta=years[len(years)//2],
                           consulta=f"{brand} {fam} {years[len(years)//2]}",
                           ejemplos=" || ".join(info["samples"]),
                           estado="pendiente_revision_generacion",
                           imagen_url="",
                           licencia=""))
    output.sort(key=lambda x: (-x["fichas"], x["marca"].casefold(), x["familia"], x["cohorte"], x["carroceria"]))
    return output


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", default="rindelab/data/3cv-fichas-sin-foto-20261123.csv")
    p.add_argument("--output-dir", default="rindelab/data/fotos-rapidas")
    p.add_argument("--top", type=int, default=0, help="Number of top clusters in separate pilot")
    a = p.parse_args()
    rows = helper.read_rows(Path(a.input))
    groups = build(rows)
    out = Path(a.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    fields = ["marca", "familia", "cohorte", "carroceria", "fichas", "variantes",
              "anio_min", "anio_max", "anio_consulta", "consulta", "ejemplos",
              "estado", "imagen_url", "licencia"]
    with (out/"cola_fotografica_priorizada.csv").open("w", newline="", encoding="utf-8-sig") as f:
        wr=csv.DictWriter(f,fieldnames=fields)
        wr.writeheader()
        wr.writerows(groups)
    stats = dict(total_sin_foto=len(rows), grupos_busqueda=len(groups),
                 potencial_top_25=sum(x["fichas"] for x in groups[:25]),
                 potencial_top_100=sum(x["fichas"] for x in groups[:100]),
                 potencial_top_300=sum(x["fichas"] for x in groups[:300]),
                 grupos_por_marca={})
    for item in groups:
        stats["grupos_por_marca"].setdefault(item["marca"],0)
        stats["grupos_por_marca"][item["marca"]]+=1
    (out/"resumen_cola.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if a.top:
        with (out/"piloto_grupos_prioritarios.csv").open("w",newline="",encoding="utf-8-sig") as f:
            wr=csv.DictWriter(f,fieldnames=fields);wr.writeheader();wr.writerows(groups[:a.top])
    print(json.dumps({k:v for k,v in stats.items() if k!="grupos_por_marca"},ensure_ascii=False))
    print("TOP TEN:")
    for x in groups[:10]:
        print(f"{x['fichas']:3} fichas — {x['marca']} {x['familia']} [{x['cohorte']} / {x['carroceria']}]")
    print("Esta cola es descubrimiento, NO fotos verificadas; cohorte no equivale a generación.")
if __name__ == "__main__":
    main()
