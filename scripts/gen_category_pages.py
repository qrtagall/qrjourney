#!/usr/bin/env python3
"""Generate category branch index.html shells from template."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = (ROOT / "categories" / "_category-template.html").read_text(encoding="utf-8")

CATEGORIES = [
    "1-safety-emergency",
    "2-craft-art-culture",
    "3-education-professional",
    "4-memory-celebrations",
    "5-plants-nature",
    "6-home-property",
    "7-enterprise-operations",
]

for cat_id in CATEGORIES:
    out_dir = ROOT / "categories" / cat_id
    out_dir.mkdir(parents=True, exist_ok=True)
    html = TEMPLATE.replace("{{CATEGORY_ID}}", cat_id)
    (out_dir / "index.html").write_text(html, encoding="utf-8")
    overrides = out_dir / "overrides.json"
    if not overrides.exists():
        overrides.write_text("{}\n", encoding="utf-8")
    print("wrote", out_dir / "index.html")
