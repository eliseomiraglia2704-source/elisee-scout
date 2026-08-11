# -*- coding: utf-8 -*-
"""Ripristina squadre maschili sovrascritte e id unici per Serie C Femminile."""
from __future__ import annotations

import json
import re
import shutil
from copy import deepcopy
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
LOGHI = ROOT / "immagini" / "squadre-loghi"

MEN_RESTORE = {
    "ALCIONE MILANO": {
        "id": "alcione-milano",
        "league": "SERIE C · GIRONE A",
        "city": "MILANO",
        "logo": "immagini/squadre-loghi/alcione.png",
        "stadium": "Arena Civica Gianni Brera",
        "capacity": 10000,
        "source": "diretta.it",
    },
    "PRO PALAZZOLO": {
        "id": "pro-palazzolo",
        "league": "SERIE D · GIRONE D",
        "city": "PALAZZOLO SULL'OGLIO",
        "logo": "immagini/squadre-loghi/pro-palazzolo.png",
        "stadium": "Stadio Comunale di Palazzolo",
        "capacity": 2000,
        "source": "diretta.it",
    },
    "PRO SESTO": {
        "id": "pro-sesto",
        "league": "SERIE D · GIRONE D",
        "city": "SESTO SAN GIOVANNI",
        "logo": "immagini/squadre-loghi/pro-sesto.png",
        "stadium": "Stadio Breda",
        "capacity": 3500,
        "source": "diretta.it",
    },
    "MONTESPACCATO": {
        "id": "montespaccato",
        "league": "SERIE D · GIRONE G",
        "city": "ROMA",
        "logo": (
            "immagini/squadre-loghi/montespaccato-calcio.png"
            if (LOGHI / "montespaccato-calcio.png").exists()
            else "immagini/squadre-loghi/montespaccato.png"
        ),
        "stadium": "Stadio Comunale Montespaccato",
        "capacity": 1000,
        "source": "diretta.it",
    },
}


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def make_men(name: str, meta: dict) -> dict:
    logo = meta["logo"] if (ROOT / meta["logo"]).exists() else ""
    return {
        "id": meta["id"],
        "name": name,
        "country": "ITALIA",
        "league": meta["league"],
        "city": meta["city"],
        "year": "",
        "abbr": re.sub(r"[^A-Z]", "", name)[:3] or "CLB",
        "gender": "m",
        "pos": 0,
        "pts": 0,
        "played": 0,
        "logo": logo,
        "primary": "#1e3a5f",
        "secondary": "#ffffff",
        "accent": "#ffffff",
        "home": {"body": "#1e3a5f", "sleeve": "#1e3a5f"},
        "away": {"body": "#ffffff", "sleeve": "#1e3a5f"},
        "source": meta["source"],
        "stadium": meta["stadium"],
        "capacity": meta["capacity"],
        "stadiumImage": "immagini/stadi/_default.jpg",
        "stadiumImageSource": "default",
    }


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))

    # 1) C fem: unique -scf ids + distinct logos for shared names
    for t in cat["teams"]:
        lg = t.get("league") or ""
        if "SERIE C FEMMINILE" not in lg or "ARCHIVIO" in lg:
            continue
        t["gender"] = "f"
        t["source"] = "lnd.it/seriecfemminile"
        want = slug(t["name"]) + "-scf"
        if t.get("id") != want:
            print("fix id", t.get("id"), "->", want)
            t["id"] = want
        if t["name"] in MEN_RESTORE:
            men_logo = MEN_RESTORE[t["name"]]["logo"]
            dest = LOGHI / (want + ".png")
            src = ROOT / men_logo if men_logo else None
            if src and src.exists():
                if not dest.exists() or dest.stat().st_size < 1000:
                    shutil.copy2(src, dest)
                t["logo"] = f"immagini/squadre-loghi/{dest.name}"
                print("  women logo", dest.name)

    # 2) Restore REAL VICENZA placeholder TERZA B if missing
    has_terza_b = any(
        t["name"] == "REAL VICENZA"
        and t.get("gender") == "m"
        and (t.get("league") or "") == "TERZA CATEGORIA · VENETO · GIRONE B"
        for t in cat["teams"]
    )
    if not has_terza_b:
        sample = next(
            (
                t
                for t in cat["teams"]
                if t["name"] == "REAL VICENZA" and t.get("gender") == "m"
            ),
            None,
        )
        if sample:
            newt = deepcopy(sample)
            newt["id"] = "terza-categoria-veneto-girone-b-veneto-b-real-vi"
            newt["league"] = "TERZA CATEGORIA · VENETO · GIRONE B"
            newt["gender"] = "m"
            cat["teams"].append(newt)
            print("RESTORED placeholder REAL VICENZA TERZA B")

    # 3) Restore mens pro entries
    for name, meta in MEN_RESTORE.items():
        any_men_pro = [
            t
            for t in cat["teams"]
            if t["name"] == name
            and t.get("gender") == "m"
            and (
                (t.get("league") or "").startswith("SERIE C")
                or (t.get("league") or "").startswith("SERIE D")
            )
        ]
        if not any_men_pro:
            cat["teams"].append(make_men(name, meta))
            print("RESTORED MEN", name, meta["league"])
        else:
            for t in any_men_pro:
                t["league"] = meta["league"]
                t["city"] = meta["city"]
                t["stadium"] = meta["stadium"]
                t["capacity"] = meta["capacity"]
                if meta["logo"] and (ROOT / meta["logo"]).exists():
                    t["logo"] = meta["logo"]
                t["source"] = meta["source"]
                t["id"] = meta["id"]
                print("OK men", name, t["league"])

    from collections import Counter

    cf = [
        t
        for t in cat["teams"]
        if "SERIE C FEMMINILE" in (t.get("league") or "")
        and "ARCHIVIO" not in (t.get("league") or "")
    ]
    print("C fem", len(cf), dict(Counter(t["league"] for t in cf)))
    for name in list(MEN_RESTORE) + ["REAL VICENZA"]:
        hits = [
            (t.get("gender"), t.get("league"), t.get("id"))
            for t in cat["teams"]
            if t["name"] == name
            and (
                (t.get("league") or "").startswith("SERIE")
                or "FEMMINILE" in (t.get("league") or "")
            )
        ]
        print(name, hits)

    cat["version"] = max(int(cat.get("version") or 27), 28)
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print("saved version", cat["version"])


if __name__ == "__main__":
    main()
