#!/usr/bin/env python3
"""QA básico del sitio: JSON-LD, metadatos e hipervínculos internos/externos."""

from __future__ import annotations

import argparse
import json
import sys
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
        self.has_description = False

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
        if tag == "meta" and values.get("name") == "description":
            self.has_description = True
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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--external", action="store_true", help="Revisar también URLs http(s)")
    args = ap.parse_args()

    html_files = sorted(ROOT.glob("*.html"))
    failures: list[str] = []
    warnings: list[str] = []
    external_urls: set[str] = set()
    total_jsonld = 0
    total_links = 0

    for page in html_files:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))

        if not parser.has_canonical:
            warnings.append(f"{page.name}: sin canonical")
        if not parser.has_description:
            warnings.append(f"{page.name}: sin meta description")

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
