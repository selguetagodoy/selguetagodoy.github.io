#!/usr/bin/env python3
from __future__ import annotations

import json
import xml.etree.ElementTree as ET
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "research-portfolio.json"
ATOM = ROOT / "research-feed.xml"
JSON_FEED = ROOT / "research-feed.json"

def build_atom(payload: dict) -> str:
    entries = []
    for project in payload["projects"]:
        date = project["citable_release_date"] + "T00:00:00Z"
        if project["latest_git_release"] != project["latest_citable_version"]:
            note = (
                f" Current GitHub release: {project['latest_git_release']}; "
                f"latest citable snapshot: {project['latest_citable_version']}."
            )
        else:
            note = f" Current and citable release: {project['latest_citable_version']}."
        categories = "\n".join(
            f"    <category term={quoteattr(str(keyword))}/>"
            for keyword in project.get("keywords", [])
        )
        entries.append(
            "  <entry>\n"
            f"    <title>{escape(project['title'])} — {escape(project['latest_citable_version'])}</title>\n"
            f"    <id>{escape(project['version_doi'])}</id>\n"
            f"    <link href={quoteattr(project['landing'])}/>\n"
            f"    <link rel=\"related\" href={quoteattr(project['version_doi'])}/>\n"
            f"    <updated>{date}</updated>\n"
            f"    <published>{date}</published>\n"
            "    <author><name>Sebastián Elgueta Godoy</name><uri>https://selguetagodoy.github.io/</uri></author>\n"
            f"    <summary>{escape(project['description'] + note)}</summary>\n"
            f"{categories}\n"
            "  </entry>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<feed xmlns="http://www.w3.org/2005/Atom">\n'
        '  <title>Sebastián Elgueta Godoy — Research releases</title>\n'
        '  <id>https://selguetagodoy.github.io/research-feed.xml</id>\n'
        '  <link rel="self" href="https://selguetagodoy.github.io/research-feed.xml"/>\n'
        '  <link rel="alternate" href="https://selguetagodoy.github.io/investigacion.html"/>\n'
        f'  <updated>{payload["last_updated"]}T00:00:00Z</updated>\n'
        '  <author><name>Sebastián Elgueta Godoy</name><uri>https://selguetagodoy.github.io/</uri></author>\n'
        + "\n".join(entries)
        + "\n</feed>\n"
    )

def build_json_feed(payload: dict) -> dict:
    items = []
    for project in payload["projects"]:
        if project["latest_git_release"] != project["latest_citable_version"]:
            note = (
                f" Current GitHub release: {project['latest_git_release']}; "
                f"latest citable snapshot: {project['latest_citable_version']}."
            )
        else:
            note = f" Current and citable release: {project['latest_citable_version']}."
        items.append({
            "id": project["version_doi"],
            "url": project["landing"],
            "external_url": project["version_doi"],
            "title": f"{project['title']} — {project['latest_citable_version']}",
            "content_text": project["description"] + note,
            "date_published": project["citable_release_date"] + "T00:00:00Z",
            "tags": project.get("keywords", []),
        })
    return {
        "version": "https://jsonfeed.org/version/1.1",
        "title": "Sebastián Elgueta Godoy — Research releases",
        "home_page_url": "https://selguetagodoy.github.io/investigacion.html",
        "feed_url": "https://selguetagodoy.github.io/research-feed.json",
        "description": "Versioned, citable public research datasets by Sebastián Elgueta Godoy.",
        "authors": [{"name": "Sebastián Elgueta Godoy", "url": "https://selguetagodoy.github.io/"}],
        "items": items,
    }

def main() -> None:
    payload = json.loads(PORTFOLIO.read_text(encoding="utf-8"))
    atom = build_atom(payload)
    ET.fromstring(atom)
    ATOM.write_text(atom, encoding="utf-8")
    JSON_FEED.write_text(
        json.dumps(build_json_feed(payload), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Rendered {len(payload['projects'])} research releases.")

if __name__ == "__main__":
    main()
