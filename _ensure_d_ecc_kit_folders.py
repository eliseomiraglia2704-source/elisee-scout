# -*- coding: utf-8 -*-
"""Crea cartelle kits-2d mancanti per Serie D ed Eccellenza."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT_PATH = ROOT / "data" / "squadre" / "catalog.json"
KITS_DIR = ROOT / "immagini" / "kits-2d"

FOLDER_OVERRIDES = {
    "asd-pontedera": "eccellenza-toscana-girone-a-toscana-a-asd-ponted",
    "forl": "forli",
    "s-dtirol": "sudtirol",
    "folgore caratese": "folgore-caratese",
    "milan-futuro": "milan",
}


def slugify(s: str) -> str:
    s = (s or "").lower().strip()
    for a, b in (("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("ü", "u"), ("ö", "o")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def is_d_or_ecc(league: str) -> bool:
    low = str(league or "").upper()
    return "SERIE D" in low or "ECCELLENZA" in low


def main() -> None:
    cat = json.loads(CAT_PATH.read_text(encoding="utf-8"))
    teams = cat.get("teams") or []
    KITS_DIR.mkdir(parents=True, exist_ok=True)
    existing = {p.name.lower(): p for p in KITS_DIR.iterdir() if p.is_dir()}
    created = 0
    skipped = 0
    for team in teams:
        if not is_d_or_ecc(team.get("league")):
            continue
        tid = str(team.get("id") or "").strip()
        if not tid:
            continue
        name = str(team.get("name") or tid)
        league = str(team.get("league") or "")
        candidates = [
            tid.lower(),
            slugify(tid),
            slugify(name),
            str(FOLDER_OVERRIDES.get(tid) or "").lower(),
        ]
        found = None
        for c in candidates:
            if c and c in existing:
                found = existing[c]
                break
        if found:
            skipped += 1
            continue
        folder = KITS_DIR / tid
        folder.mkdir(parents=True, exist_ok=True)
        readme = folder / "LEGGI_ME.txt"
        if not readme.exists():
            readme.write_text(
                name + "\n" + league + "\n\n"
                "Inserisci qui i PNG delle divise (home.png, away.png, third.png, ...).\n"
                "Poi rilancia _sync_catalog_kits.py per aggiornare il catalogo.\n",
                encoding="utf-8",
            )
        existing[tid.lower()] = folder
        created += 1
        print("OK", tid, "|", name)
    print("created", created, "already", skipped)


if __name__ == "__main__":
    main()
