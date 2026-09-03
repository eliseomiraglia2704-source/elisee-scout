# -*- coding: utf-8 -*-
"""Crea cartelle immagini/kits-2d/<nome-squadra>/ per ogni club del catalogo.

Nome cartella = solo squadra, niente campionato.
Omonimi: nome-2, nome-3.
Chiamare dopo ogni inserimento/sync squadre.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT_PATH = ROOT / "data" / "squadre" / "catalog.json"
KITS_DIR = ROOT / "immagini" / "kits-2d"
MAP_PATH = ROOT / "data" / "squadre" / "kit-folder-map.json"

README_TAIL = (
    "\n\nInserisci qui i PNG delle divise (home.png, away.png, third.png, ...).\n"
    "Poi rilancia _sync_catalog_kits.py per aggiornare il catalogo.\n"
)


def slugify(s: str) -> str:
    s = (s or "").lower().strip()
    for a, b in (("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("ü", "u"), ("ö", "o")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def _unique(base: str, taken: set[str]) -> str:
    name = base or "squadra"
    if name not in taken:
        taken.add(name)
        return name
    n = 2
    while f"{name}-{n}" in taken:
        n += 1
    out = f"{name}-{n}"
    taken.add(out)
    return out


def _load_map() -> dict:
    if not MAP_PATH.exists():
        return {}
    try:
        data = json.loads(MAP_PATH.read_text(encoding="utf-8")) or {}
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _save_map(mapping: dict) -> None:
    MAP_PATH.parent.mkdir(parents=True, exist_ok=True)
    MAP_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_kit_folders(teams, root: Path | None = None) -> dict:
    """Crea la cartella kit 2D per ogni squadra che ancora non ce l'ha.

    Ritorna {created, skipped, mapping}.
    """
    kits_dir = (root or ROOT) / "immagini" / "kits-2d"
    kits_dir.mkdir(parents=True, exist_ok=True)
    mapping = _load_map()
    id_to_folder = {str(v): k for k, v in mapping.items()}
    existing = {p.name.lower(): p for p in kits_dir.iterdir() if p.is_dir()}
    taken = set(existing.keys())
    created = 0
    skipped = 0
    for team in teams or []:
        if not isinstance(team, dict):
            continue
        tid = str(team.get("id") or "").strip()
        name = str(team.get("name") or tid).strip()
        league = str(team.get("league") or "")
        if not tid and not name:
            continue
        slug_name = slugify(name)
        mapped = id_to_folder.get(tid, "")
        if mapped and mapped.lower() in existing:
            skipped += 1
            continue
        if tid and tid.lower() in existing:
            mapping.setdefault(tid.lower(), tid)
            skipped += 1
            continue
        owner = mapping.get(slug_name)
        if slug_name and slug_name in existing and (not owner or owner == tid):
            if tid:
                mapping.setdefault(slug_name, tid)
            skipped += 1
            continue
        dest = _unique(slug_name or slugify(tid) or "squadra", taken)
        folder = kits_dir / dest
        folder.mkdir(parents=True, exist_ok=True)
        readme = folder / "LEGGI_ME.txt"
        if not readme.exists():
            readme.write_text((name or dest) + "\n" + league + README_TAIL, encoding="utf-8")
        existing[dest.lower()] = folder
        if tid:
            mapping[dest] = tid
            id_to_folder[tid] = dest
        created += 1
    _save_map(mapping)
    return {"created": created, "skipped": skipped, "mapping": mapping}


def ensure_kit_folders_from_catalog(root: Path | None = None) -> dict:
    cat_path = (root or ROOT) / "data" / "squadre" / "catalog.json"
    if not cat_path.exists():
        return {"created": 0, "skipped": 0, "mapping": {}}
    cat = json.loads(cat_path.read_text(encoding="utf-8"))
    teams = cat.get("teams") if isinstance(cat, dict) else cat
    return ensure_kit_folders(teams or [], root=root)


if __name__ == "__main__":
    stats = ensure_kit_folders_from_catalog()
    print("created", stats["created"], "already", stats["skipped"])
