# -*- coding: utf-8 -*-
"""Copia i gironi Eccellenza 2026/27 aggiornati in minigioco_clubs.json."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT = ROOT / "data" / "squadre" / "catalog.json"
OUT = ROOT / "data" / "squadre" / "minigioco_clubs.json"

PREFIXES = (
    "ECCELLENZA · EMILIA-ROMAGNA",
    "ECCELLENZA · FRIULI",
    "ECCELLENZA · LOMBARDIA",
    "ECCELLENZA · MARCHE",
    "ECCELLENZA · PIEMONTE",
    "ECCELLENZA · PUGLIA",
    "ECCELLENZA · TRENTINO",
    "ECCELLENZA · UMBRIA",
)


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    clubs = json.loads(OUT.read_text(encoding="utf-8"))
    have = {str(c.get("n") or "").upper() for c in clubs}
    # drop previous eccellenza of these regions if re-run
    clubs = [
        c
        for c in clubs
        if not str(c.get("l") or "").upper().startswith("ECCELLENZA")
    ]
    have = {str(c.get("n") or "").upper() for c in clubs}
    added = 0
    for t in cat.get("teams") or []:
        lg = str(t.get("league") or "")
        if not any(lg.startswith(p) for p in PREFIXES):
            continue
        name = str(t.get("name") or "").strip().upper()
        if not name or name in have:
            continue
        row = {
            "n": name,
            "l": lg,
            "o": t.get("logo") or "",
            "t": 5,
            "city": str(t.get("city") or "").title(),
        }
        clubs.append(row)
        have.add(name)
        added += 1
    OUT.write_text(json.dumps(clubs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("minigioco clubs", len(clubs), "added ecc", added)


if __name__ == "__main__":
    main()
