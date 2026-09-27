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

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {k.lower(): v for k, v in attrs if v is not None}
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag in {"img", "script", "source"} and values.get("src"):
            self.links.append(values["src"])
        if tag == "link" and values.get("href"):
            self.links.append(values["href"])
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

        for field in ("repository", "concept_doi", "version_doi", "title", "description", "data_package", "latest_citable_version", "citable_release_date"):
            if not item.get(field):
                failures.append(f"datasets.json: {dataset_id} missing {field}")

    return len(datasets)


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
    external_urls: set[str] = set()
    total_jsonld = 0
    total_links = 0

    for page in html_files:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))

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
