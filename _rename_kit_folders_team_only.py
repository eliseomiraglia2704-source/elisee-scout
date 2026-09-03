# -*- coding: utf-8 -*-
"""Rinomina cartelle kits-2d: solo nome squadra, niente campionato."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT_PATH = ROOT / "data" / "squadre" / "catalog.json"
KITS_DIR = ROOT / "immagini" / "kits-2d"
MAP_PATH = ROOT / "data" / "squadre" / "kit-folder-map.json"

COMP_RE = re.compile(r"^(ecc-|eccellenza-|serie-d-)|-girone-", re.I)


def slugify(s: str) -> str:
    s = (s or "").lower().strip()
    for a, b in (("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("ü", "u"), ("ö", "o")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def unique_name(base: str, taken: set[str]) -> str:
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


def main() -> None:
    cat = json.loads(CAT_PATH.read_text(encoding="utf-8"))
    teams = cat.get("teams") or []
    by_id = {str(t.get("id") or ""): t for t in teams}

    folders = [p for p in KITS_DIR.iterdir() if p.is_dir()]
    to_rename = [p for p in folders if COMP_RE.search(p.name)]
    keep = [p for p in folders if p not in to_rename]
    taken = {p.name.lower() for p in keep}

    plan: list[tuple[Path, str, dict]] = []
    for src in sorted(to_rename, key=lambda p: p.name.lower()):
        team = by_id.get(src.name) or {}
        base = slugify(str(team.get("name") or src.name))
        dest = unique_name(base, taken)
        plan.append((src, dest, team))

    # Phase 1: move to temp names to avoid Windows collisions
    temps: list[tuple[Path, Path, str, dict]] = []
    for i, (src, dest, team) in enumerate(plan):
        tmp = src.with_name(f"__ren_{i:04d}__")
        if tmp.exists():
            raise SystemExit("temp exists " + str(tmp))
        src.rename(tmp)
        temps.append((tmp, src, dest, team))

    mapping: dict[str, str] = {}
    if MAP_PATH.exists():
        try:
            mapping = json.loads(MAP_PATH.read_text(encoding="utf-8")) or {}
        except Exception:
            mapping = {}

    done = 0
    for tmp, src, dest, team in temps:
        final = KITS_DIR / dest
        if final.exists():
            raise SystemExit("dest exists " + dest)
        tmp.rename(final)
        name = str(team.get("name") or dest)
        league = str(team.get("league") or "")
        tid = str(team.get("id") or src.name)
        (final / "LEGGI_ME.txt").write_text(
            name + "\n" + league + "\n\n"
            "Inserisci qui i PNG delle divise (home.png, away.png, third.png, ...).\n"
            "Poi rilancia _sync_catalog_kits.py per aggiornare il catalogo.\n",
            encoding="utf-8",
        )
        mapping[dest] = tid
        print("REN", src.name, "->", dest)
        done += 1

    MAP_PATH.parent.mkdir(parents=True, exist_ok=True)
    MAP_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("renamed", done, "map", len(mapping))


if __name__ == "__main__":
    main()
