#!/usr/bin/env python3
"""QA básico del sitio: JSON-LD, metadatos e hipervínculos internos/externos."""

from __future__ import annotations

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urlparse, unquote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REMOTE_PREFIXES = ("latin-america-digital-infrastructure/",)
SKIP_SCHEMES = ("mailto:", "tel:", "javascript:", "data:")
USER_AGENT = "Mozilla/5.0 (compatible; SEGSiteQA/1.0; +https://selguetagodoy.github.io/)"


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.jsonld: list[str] = []
        self._in_jsonld = False
        self._buffer: list[str] = []
        self.has_canonical = False
        self.canonical_url: str | None = None
        self.has_description = False
        self.og_images: list[str] = []
        self.meta_names: dict[str, str] = {}
        self.html_lang: str | None = None
        self.has_title = False
        self.h1_count = 0
        self.images_without_alt: list[str] = []
        self.describedby_links: list[dict[str, str]] = []
        self.related_links: list[str] = []
        self.type_links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {k.lower(): v for k, v in attrs if v is not None}
        if tag == "html":
            self.html_lang = values.get("lang")
        if tag == "title":
            self.has_title = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "img" and "alt" not in values:
            self.images_without_alt.append(values.get("src", "(sin src)"))
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag in {"img", "script", "source"} and values.get("src"):
            self.links.append(values["src"])
        if tag == "link" and values.get("href"):
            self.links.append(values["href"])
            rel_tokens = set((values.get("rel") or "").split())
            if "describedby" in rel_tokens:
                self.describedby_links.append({
                    "href": values["href"],
                    "type": values.get("type", ""),
                    "profile": values.get("profile", ""),
                })
            if "related" in rel_tokens:
                self.related_links.append(values["href"])
            if "type" in rel_tokens:
                self.type_links.append(values["href"])
            if values.get("rel") == "canonical":
                self.has_canonical = True
                self.canonical_url = values.get("href")
        if tag == "meta" and values.get("name") and values.get("content"):
            self.meta_names[values["name"]] = values["content"]
        if tag == "meta" and values.get("name") == "description":
            self.has_description = True
        if tag == "meta" and values.get("property") == "og:image" and values.get("content"):
            self.og_images.append(values["content"])
        if tag == "script" and values.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._buffer).strip())
            self._in_jsonld = False
            self._buffer = []


def local_target(source: Path, href: str) -> Path | None:
    clean = urldefrag(href.strip())[0]
    if not clean or clean.startswith("#") or clean.startswith("//"):
        return None
    lowered = clean.lower()
    if lowered.startswith(SKIP_SCHEMES):
        return None
    parsed = urlparse(clean)
    if parsed.scheme in {"http", "https"}:
        return None

    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = source.parent / path

    if path.endswith("/"):
        target = target / "index.html"
    return target.resolve()


def check_external(url: str) -> tuple[str, str]:
    req = Request(url, headers={"User-Agent": USER_AGENT}, method="HEAD")
    try:
        with urlopen(req, timeout=12) as response:
            return "OK", str(response.status)
    except HTTPError as exc:
        if exc.code in {401, 403, 405, 429}:
            return "WARN", f"HTTP {exc.code}"
        if exc.code in {404, 410}:
            return "WARN", f"HTTP {exc.code} — posible enlace movido"
        if exc.code >= 500:
            return "WARN", f"HTTP {exc.code}"
        return "WARN", f"HTTP {exc.code}"
    except URLError as exc:
        return "WARN", f"network: {exc.reason}"
    except Exception as exc:  # noqa: BLE001
        return "WARN", str(exc)


def check_sitemap_and_robots(failures: list[str], warnings: list[str]) -> tuple[int, int]:
    sitemap = ROOT / "sitemap.xml"
    robots = ROOT / "robots.txt"
    sitemap_count = 0
    duplicate_count = 0

    if not sitemap.exists():
        failures.append("sitemap.xml: missing")
    else:
        try:
            tree = ET.parse(sitemap)
            root = tree.getroot()
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            locs = [node.text.strip() for node in root.findall(".//sm:loc", ns) if node.text]
            sitemap_count = len(locs)
            seen: set[str] = set()
            for url in locs:
                if url in seen:
                    duplicate_count += 1
                    failures.append(f"sitemap.xml: duplicate URL — {url}")
                    continue
                seen.add(url)
                parsed = urlparse(url)
                if parsed.netloc != "selguetagodoy.github.io":
                    warnings.append(f"sitemap.xml: external hostname — {url}")
                    continue
                path = parsed.path.lstrip("/")
                if path.startswith("latin-america-digital-infrastructure/"):
                    continue
                if not path:
                    target = ROOT / "index.html"
                elif path.endswith("/"):
                    if path.startswith("latin-america-digital-infrastructure/"):
                        continue
                    target = ROOT / path / "index.html"
                else:
                    target = ROOT / path
                if not target.exists():
                    failures.append(f"sitemap.xml: target missing — {url}")
        except ET.ParseError as exc:
            failures.append(f"sitemap.xml: invalid XML — {exc}")

    if not robots.exists():
        failures.append("robots.txt: missing")
    else:
        text = robots.read_text(encoding="utf-8", errors="replace")
        expected = "Sitemap: https://selguetagodoy.github.io/sitemap.xml"
        if expected not in text:
            failures.append("robots.txt: canonical sitemap declaration missing")

    return sitemap_count, duplicate_count


def check_research_jsonld(failures: list[str]) -> tuple[int, int]:
    path = ROOT / "research.jsonld"
    if not path.exists():
        failures.append("research.jsonld: missing")
        return 0, 0
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"research.jsonld: invalid JSON — {exc}")
        return 0, 0

    graph = payload.get("@graph", [])
    datasets = [node for node in graph if node.get("@type") == "Dataset"]
    catalogs = [node for node in graph if node.get("@type") == "DataCatalog"]
    if len(datasets) != 6:
        failures.append(f"research.jsonld: expected 6 Dataset nodes, found {len(datasets)}")
    if len(catalogs) != 1:
        failures.append(f"research.jsonld: expected 1 DataCatalog node, found {len(catalogs)}")
    return len(datasets), len(catalogs)


def check_dataset_citation_metadata(failures: list[str]) -> int:
    path = ROOT / "datasets.json"
    if not path.exists():
        return 0
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return 0

    checked = 0
    for item in payload.get("datasets", []):
        landing = item.get("landing")
        if not landing:
            continue
        parsed = urlparse(landing)
        if parsed.netloc != "selguetagodoy.github.io":
            continue
        page_path = ROOT / parsed.path.lstrip("/")
        if not page_path.exists():
            continue

        parser = PageParser()
        parser.feed(page_path.read_text(encoding="utf-8", errors="replace"))
        expected_doi = (item.get("version_doi") or "").removeprefix("https://doi.org/")
        expected_title = item.get("title")
        expected_date = item.get("citable_release_date")

        actual_title = parser.meta_names.get("citation_title")
        actual_doi = parser.meta_names.get("citation_doi")
        actual_date = parser.meta_names.get("citation_publication_date")
        page_text = page_path.read_text(encoding="utf-8", errors="replace")

        if "CITA APA 7" not in page_text:
            failures.append(f"{page_path.name}: missing copy-ready APA citation block")
        expected_version = (item.get("latest_citable_version") or "").removeprefix("v")
        if expected_version and f"Version {expected_version}" not in page_text:
            failures.append(f"{page_path.name}: APA citation version mismatch")
        if expected_doi and f"https://doi.org/{expected_doi}" not in page_text:
            failures.append(f"{page_path.name}: APA citation DOI missing")

        if actual_title != expected_title:
            failures.append(
                f"{page_path.name}: citation_title mismatch — "
                f"{actual_title!r} != {expected_title!r}"
            )
        if actual_doi != expected_doi:
            failures.append(
                f"{page_path.name}: citation_doi mismatch — "
                f"{actual_doi!r} != {expected_doi!r}"
            )
        if actual_date != expected_date:
            failures.append(
                f"{page_path.name}: citation_publication_date mismatch — "
                f"{actual_date!r} != {expected_date!r}"
            )
        checked += 1
    return checked


def check_dataset_catalog(failures: list[str]) -> int:
    path = ROOT / "datasets.json"
    if not path.exists():
        failures.append("datasets.json: missing")
        return 0
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"datasets.json: invalid JSON — {exc}")
        return 0

    datasets = payload.get("datasets", [])
    if len(datasets) != 6:
        failures.append(f"datasets.json: expected 6 datasets, found {len(datasets)}")

    ids: set[str] = set()
    landings: set[str] = set()
    for item in datasets:
        dataset_id = item.get("id")
        landing = item.get("landing")
        if not dataset_id:
            failures.append("datasets.json: dataset without id")
            continue
        if dataset_id in ids:
            failures.append(f"datasets.json: duplicate id — {dataset_id}")
        ids.add(dataset_id)

        if not landing:
            failures.append(f"datasets.json: {dataset_id} missing landing")
            continue
        if landing in landings:
            failures.append(f"datasets.json: duplicate landing — {landing}")
        landings.add(landing)

        parsed = urlparse(landing)
        if parsed.netloc != "selguetagodoy.github.io":
            failures.append(f"datasets.json: non-canonical landing host — {landing}")
            continue
        rel = parsed.path.lstrip("/")
        target = ROOT / rel
        if not target.exists():
            failures.append(f"datasets.json: landing target missing — {landing}")

        for field in ("repository", "concept_doi", "version_doi", "title", "description", "data_package", "ro_crate", "latest_citable_version", "citable_release_date"):
            if not item.get(field):
                failures.append(f"datasets.json: {dataset_id} missing {field}")

    return len(datasets)


def check_research_portfolio(failures: list[str]) -> int:
    portfolio_path = ROOT / "research-portfolio.json"
    schema_path = ROOT / "research-portfolio.schema.json"
    datasets_path = ROOT / "datasets.json"

    for path in (portfolio_path, schema_path, datasets_path):
        if not path.exists():
            failures.append(f"{path.name}: missing")
            return 0

    try:
        portfolio = json.loads(portfolio_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"research-portfolio.json: invalid JSON — {exc}")
        return 0

    try:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"research-portfolio.schema.json: invalid JSON — {exc}")
        return 0

    try:
        public_catalog = json.loads(datasets_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"datasets.json: invalid JSON during portfolio comparison — {exc}")
        return 0

    expected_schema = "https://selguetagodoy.github.io/research-portfolio.schema.json"
    if portfolio.get("$schema") != expected_schema:
        failures.append("research-portfolio.json: unexpected $schema")
    if schema.get("$id") != expected_schema:
        failures.append("research-portfolio.schema.json: unexpected $id")

    projects = portfolio.get("projects", [])
    datasets = public_catalog.get("datasets", [])
    if len(projects) != 6:
        failures.append(f"research-portfolio.json: expected 6 projects, found {len(projects)}")
    if len(datasets) != 6:
        failures.append(f"datasets.json: expected 6 datasets for portfolio comparison, found {len(datasets)}")

    pmap = {p.get("id"): p for p in projects if p.get("id")}
    dmap = {d.get("id"): d for d in datasets if d.get("id")}
    if set(pmap) != set(dmap):
        failures.append(
            "research-portfolio.json / datasets.json ID mismatch — "
            f"portfolio_only={sorted(set(pmap)-set(dmap))} "
            f"datasets_only={sorted(set(dmap)-set(pmap))}"
        )

    compare_fields = (
        "title",
        "scope",
        "landing",
        "repository",
        "concept_doi",
        "version_doi",
        "latest_git_release",
        "latest_citable_version",
        "data_package",
        "ro_crate",
        "citable_release_date",
    )
    for dataset_id in sorted(set(pmap) & set(dmap)):
        p = pmap[dataset_id]
        d = dmap[dataset_id]
        for field in compare_fields:
            if p.get(field) != d.get(field):
                failures.append(
                    f"{dataset_id}: portfolio/catalog mismatch for {field} — "
                    f"{p.get(field)!r} != {d.get(field)!r}"
                )

    interfaces = portfolio.get("interfaces", {})
    expected_interfaces = {
        "research_overview",
        "open_data_catalog",
        "public_dataset_json",
        "methodology",
        "research_status",
        "research_jsonld",
    }
    missing_interfaces = expected_interfaces - set(interfaces)
    if missing_interfaces:
        failures.append(
            f"research-portfolio.json: missing interfaces {sorted(missing_interfaces)}"
        )

    return len(projects)


def check_research_feeds(failures: list[str]) -> tuple[int, int]:
    portfolio_path = ROOT / "research-portfolio.json"
    atom_path = ROOT / "research-feed.xml"
    json_path = ROOT / "research-feed.json"

    if not portfolio_path.exists():
        failures.append("research-portfolio.json: missing for feed validation")
        return 0, 0

    try:
        portfolio = json.loads(portfolio_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"research-portfolio.json: invalid JSON for feed validation — {exc}")
        return 0, 0

    expected_ids = {p["version_doi"] for p in portfolio.get("projects", []) if p.get("version_doi")}

    atom_count = 0
    if not atom_path.exists():
        failures.append("research-feed.xml: missing")
    else:
        try:
            root = ET.parse(atom_path).getroot()
            ns = {"a": "http://www.w3.org/2005/Atom"}
            entries = root.findall("a:entry", ns)
            atom_count = len(entries)
            atom_ids = {
                node.text.strip()
                for entry in entries
                for node in [entry.find("a:id", ns)]
                if node is not None and node.text
            }
            if atom_count != 6:
                failures.append(f"research-feed.xml: expected 6 entries, found {atom_count}")
            if atom_ids != expected_ids:
                failures.append(
                    "research-feed.xml: DOI set differs from research portfolio"
                )
        except ET.ParseError as exc:
            failures.append(f"research-feed.xml: invalid Atom XML — {exc}")

    json_count = 0
    if not json_path.exists():
        failures.append("research-feed.json: missing")
    else:
        try:
            feed = json.loads(json_path.read_text(encoding="utf-8"))
            if feed.get("version") != "https://jsonfeed.org/version/1.1":
                failures.append("research-feed.json: unexpected JSON Feed version")
            items = feed.get("items", [])
            json_count = len(items)
            json_ids = {item.get("id") for item in items if item.get("id")}
            if json_count != 6:
                failures.append(f"research-feed.json: expected 6 items, found {json_count}")
            if json_ids != expected_ids:
                failures.append(
                    "research-feed.json: DOI set differs from research portfolio"
                )
        except json.JSONDecodeError as exc:
            failures.append(f"research-feed.json: invalid JSON — {exc}")

    return atom_count, json_count


def check_dataset_discovery_links(failures: list[str]) -> int:
    path = ROOT / "datasets.json"
    if not path.exists():
        failures.append("datasets.json: missing for metadata discovery validation")
        return 0
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"datasets.json: invalid JSON for metadata discovery validation — {exc}")
        return 0

    checked = 0
    for item in payload.get("datasets", []):
        landing = item.get("landing")
        repository = item.get("repository")
        version_doi = item.get("version_doi")
        if not landing or not repository or not version_doi:
            continue
        parsed = urlparse(landing)
        page_path = ROOT / parsed.path.lstrip("/")
        if not page_path.exists():
            continue

        parser = PageParser()
        parser.feed(page_path.read_text(encoding="utf-8", errors="replace"))
        raw_base = repository.replace(
            "https://github.com/", "https://raw.githubusercontent.com/"
        ).rstrip("/") + "/main"

        expected = {
            f"{raw_base}/CITATION.cff",
            f"{raw_base}/CITATION.bib",
            f"{raw_base}/codemeta.json",
            f"{raw_base}/datapackage.json",
            f"{raw_base}/ro-crate-metadata.json",
        }
        actual = {link["href"] for link in parser.describedby_links}
        missing = expected - actual
        if missing:
            failures.append(
                f"{page_path.name}: missing describedby metadata links — {sorted(missing)}"
            )

        crate = next(
            (
                link
                for link in parser.describedby_links
                if link["href"].endswith("/ro-crate-metadata.json")
            ),
            None,
        )
        if not crate or crate.get("profile") != "https://w3id.org/ro/crate/1.2":
            failures.append(
                f"{page_path.name}: RO-Crate describedby profile missing or incorrect"
            )

        if version_doi not in parser.related_links:
            failures.append(
                f"{page_path.name}: version DOI missing as related scholarly identifier"
            )
        if "https://schema.org/Dataset" not in parser.type_links:
            failures.append(
                f"{page_path.name}: Dataset type discovery link missing"
            )
        checked += 1
    return checked


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--external", action="store_true", help="Revisar también URLs http(s)")
    args = ap.parse_args()

    html_files = sorted(ROOT.glob("*.html"))
    failures: list[str] = []
    warnings: list[str] = []
    sitemap_locs: set[str] = set()
    sitemap_path = ROOT / "sitemap.xml"
    if sitemap_path.exists():
        try:
            sitemap_tree = ET.parse(sitemap_path)
            sitemap_root = sitemap_tree.getroot()
            sitemap_ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sitemap_locs = {
                node.text.strip()
                for node in sitemap_root.findall(".//sm:loc", sitemap_ns)
                if node.text
            }
        except ET.ParseError:
            pass
    sitemap_count, duplicate_sitemap_urls = check_sitemap_and_robots(failures, warnings)
    dataset_count = check_dataset_catalog(failures)
    jsonld_dataset_count, jsonld_catalog_count = check_research_jsonld(failures)
    citation_dataset_count = check_dataset_citation_metadata(failures)
    portfolio_project_count = check_research_portfolio(failures)
    atom_entry_count, json_feed_item_count = check_research_feeds(failures)
    discovery_dataset_count = check_dataset_discovery_links(failures)
    external_urls: set[str] = set()
    total_jsonld = 0
    total_links = 0

    for page in html_files:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))

        if not parser.html_lang:
            failures.append(f"{page.name}: falta atributo lang en <html>")
        if not parser.has_title:
            failures.append(f"{page.name}: falta <title>")
        if parser.h1_count != 1:
            failures.append(f"{page.name}: se esperaba 1 <h1>, encontrados {parser.h1_count}")
        if parser.images_without_alt:
            failures.append(
                f"{page.name}: imágenes sin alt — {parser.images_without_alt}"
            )

        if not parser.has_canonical:
            warnings.append(f"{page.name}: sin canonical")
        elif parser.canonical_url and parser.canonical_url not in sitemap_locs:
            failures.append(
                f"{page.name}: canonical no está en sitemap — {parser.canonical_url}"
            )
        if not parser.has_description:
            warnings.append(f"{page.name}: sin meta description")

        if not parser.og_images:
            warnings.append(f"{page.name}: sin og:image")
        for og_image in parser.og_images:
            parsed_og = urlparse(og_image)
            if parsed_og.netloc == "selguetagodoy.github.io":
                og_path = unquote(parsed_og.path).lstrip("/")
                og_target = ROOT / og_path
                if not og_target.exists():
                    failures.append(
                        f"{page.name}: og:image local inexistente — {og_image}"
                    )

        for block in parser.jsonld:
            total_jsonld += 1
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                failures.append(f"{page.name}: JSON-LD inválido — {exc}")

        for href in parser.links:
            total_links += 1
            clean = href.strip()
            if clean.startswith(("http://", "https://")):
                external_urls.add(clean)
                continue

            target = local_target(page, clean)
            if target is None:
                continue

            try:
                rel = target.relative_to(ROOT)
            except ValueError:
                failures.append(f"{page.name}: enlace sale del repositorio — {href}")
                continue

            rel_text = rel.as_posix()
            if rel_text.startswith(REMOTE_PREFIXES):
                warnings.append(f"{page.name}: ruta servida por proyecto externo — {href}")
                continue

            if not target.exists():
                failures.append(f"{page.name}: enlace/asset local inexistente — {href}")

    print(f"# Site QA\n")
    print(f"- HTML revisados: {len(html_files)}")
    print(f"- enlaces/recursos inspeccionados: {total_links}")
    print(f"- bloques JSON-LD validados: {total_jsonld}")
    print(f"- URLs en sitemap: {sitemap_count}")
    print(f"- datasets en catálogo JSON: {dataset_count}")
    print(f"- Dataset nodes en research.jsonld: {jsonld_dataset_count}")
    print(f"- DataCatalog nodes en research.jsonld: {jsonld_catalog_count}")
    print(f"- fichas de dataset con metadatos de citación validados: {citation_dataset_count}")
    print(f"- proyectos en research-portfolio.json: {portfolio_project_count}")
    print(f"- entradas en Atom research feed: {atom_entry_count}")
    print(f"- ítems en JSON research feed: {json_feed_item_count}")
    print(f"- fichas con metadata discovery links validados: {discovery_dataset_count}")
    print(f"- duplicados en sitemap: {duplicate_sitemap_urls}")
    print(f"- fallos locales: {len(failures)}")
    print(f"- advertencias: {len(warnings)}")

    if args.external and external_urls:
        print(f"- URLs externas a comprobar: {len(external_urls)}")
        results: list[tuple[str, str, str]] = []
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = {pool.submit(check_external, url): url for url in sorted(external_urls)}
            for future in as_completed(futures):
                url = futures[future]
                label, detail = future.result()
                results.append((label, url, detail))
        ext_warn = [(u, d) for label, u, d in results if label != "OK"]
        print(f"- advertencias externas: {len(ext_warn)}")
        for url, detail in ext_warn[:60]:
            print(f"  - WARN {detail}: {url}")

    if warnings:
        print("\n## Advertencias locales")
        for item in warnings[:80]:
            print(f"- WARN {item}")

    if failures:
        print("\n## Fallos")
        for item in failures:
            print(f"- ERROR {item}")
        return 1

    print("\nResultado: QA local aprobado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
