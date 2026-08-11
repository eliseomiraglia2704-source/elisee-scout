# -*- coding: utf-8 -*-
"""
1) Ripristina organici A/B (FIGC) + C (LND) femminili se mancanti
2) Loghi squadre femminili = stemma maschile (copia file),
   ECCETTO Napoli Women e Como Women / Como 1907 Women (loghi dedicati)
3) Non tocca i loghi competizione
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"

KEEP_DEDICATED = {
    "NAPOLI WOMEN": "napoli-women.png",
    "COMO WOMEN": "como-women.png",
    "COMO 1907 WOMEN": "como-1907-women.png",
}

# Organico FIGC Serie A Women 2026-27 (12)
SERIE_A = [
    ("COMO 1907 WOMEN", "COMO", "COMO 1907"),
    ("COMO WOMEN", "COMO", None),  # dedicated only
    ("FIORENTINA WOMEN", "FIRENZE", "FIORENTINA"),
    ("INTER WOMEN", "MILANO", "INTER"),
    ("JUVENTUS WOMEN", "TORINO", "JUVENTUS"),
    ("LAZIO WOMEN", "ROMA", "LAZIO"),
    ("MILAN WOMEN", "MILANO", "MILAN"),
    ("NAPOLI WOMEN", "NAPOLI", None),
    ("PARMA WOMEN", "PARMA", "PARMA"),
    ("ROMA WOMEN", "ROMA", "ROMA"),
    ("SASSUOLO WOMEN", "SASSUOLO", "SASSUOLO"),
    ("TERNANA WOMEN", "TERNI", "TERNANA"),
]

# Organico FIGC Serie B Femminile (14) — da script precedente
SERIE_B = [
    ("AREZZO WOMEN", "AREZZO", "AREZZO"),
    ("BOLOGNA WOMEN", "BOLOGNA", "BOLOGNA"),
    ("BRESCIA WOMEN", "BRESCIA", "BRESCIA"),
    ("CESENA WOMEN", "CESENA", "CESENA"),
    ("FREEDOM FC", "ROMA", None),
    ("FROSINONE WOMEN", "FROSINONE", "FROSINONE"),
    ("GENOA WOMEN", "GENOVA", "GENOA"),
    ("HELLAS VERONA WOMEN", "VERONA", "HELLAS VERONA"),
    ("LUMEZZANE WOMEN", "LUMEZZANE", "LUMEZZANE"),
    ("RES DONNA ROMA", "ROMA", None),
    ("SAN MARINO ACADEMY", "SERRAVALLE", "SAN MARINO"),
    ("TRASTEVERE WOMEN", "ROMA", "TRASTEVERE"),
    ("VENEZIA WOMEN", "VENEZIA", "VENEZIA"),
    ("VICENZA WOMEN", "VICENZA", "VICENZA"),
]

# LND Serie C Femminile 2026-27
SERIE_C = {
    "A": [
        ("ATLETICO URI", "URI", None),
        ("WOMEN TORRES", "SASSARI", None),
        ("SAMPDORIA WOMEN", "GENOVA", "SAMPDORIA"),
        ("ANGELO BAIARDO", "GENOVA", None),
        ("TORINO WOMEN", "TORINO", "TORINO"),
        ("TORINO FC WOMEN", "TORINO", "TORINO"),
        ("CARONNESE", "CARONNO PERTUSELLA", None),
        ("FC SEDRIANO", "SEDRIANO", None),
        ("FC LESMO", "LESMO", None),
        ("PRO SESTO", "SESTO SAN GIOVANNI", "PRO SESTO"),
        ("ALCIONE MILANO", "MILANO", "ALCIONE MILANO"),
        ("REAL MEDA", "MEDA", None),
    ],
    "B": [
        ("OROBICA SHARKS COLOGNO", "COLOGNO MONZESE", None),
        ("PRO PALAZZOLO", "PALAZZOLO SULL'OGLIO", "PRO PALAZZOLO"),
        ("POLISPORTIVA ERBUSCO", "ERBUSCO", None),
        ("AZZURRA S. BARTOLOMEO", "BERGAMO", None),
        ("TRENTO ACADEMY", "TRENTO", None),
        ("SUDTIROL WOMEN", "BOLZANO", "SUDTIROL"),
        ("ALTO LIVENZA ACADEMY", "SACILE", None),
        ("CHIEVOVERONA WOMEN", "VERONA", "CHIEVO"),
        ("REAL VICENZA", "VICENZA", "REAL VICENZA"),
        ("VILLORBA TREVISO", "VILLORBA", None),
        ("VENEZIA 1985", "VENEZIA", "VENEZIA"),
        ("VENEZIA FC WOMEN", "VENEZIA", "VENEZIA"),
        ("ACADEMY CALCIO PAVIA", "PAVIA", None),
    ],
    "C": [
        ("BESURICA", "PARMA", None),
        ("REGGIANA WOMEN", "REGGIO EMILIA", "REGGIANA"),
        ("RINASCITA DOCCIA", "SESTO FIORENTINO", None),
        ("SIENA CF", "SIENA", "SIENA"),
        ("RICCIONE", "RICCIONE", None),
        ("ARZILLA", "PESARO", None),
        ("NUOVA ALBA", "ALBA", None),
        ("PINETO WOMEN", "PINETO", "PINETO"),
        ("ORIGINAL CELTIC BHOYS", "ROMA", None),
        ("ROME CITY", "ROMA", None),
        ("MONTESPACCATO", "ROMA", "MONTESPACCATO"),
        ("GRIFONE GIALLOVERDE", "GROTTAFERRATA", None),
    ],
    "D": [
        ("ROMA CF", "ROMA", "ROMA"),
        ("COLLEFERRO", "COLLEFERRO", None),
        ("VILLARICCA", "VILLARICCA", None),
        ("ACADEMY ABATESE", "SANT'ANTONIO ABATE", None),
        ("SPOT CLUB S. ANTONIO ABATE", "SANT'ANTONIO ABATE", None),
        ("SALERNITANA WOMEN", "SALERNO", "SALERNITANA"),
        ("PINK SPORT TIME", "BARI", None),
        ("WOMEN LECCE", "LECCE", "LECCE"),
        ("CUS UNICAL", "RENDE", None),
        ("RACING CATANIA", "CATANIA", None),
        ("PALERMO FC WOMEN", "PALERMO", "PALERMO"),
        ("CHIETI WOMEN", "CHIETI", "CHIETI"),
    ],
}

MEN_FILE_FALLBACK = {
    "JUVENTUS": ["juventus.png"],
    "ROMA": ["roma.png"],
    "INTER": ["inter.png"],
    "FIORENTINA": ["fiorentina.png"],
    "MILAN": ["milan.png", "ac-milan.png"],
    "SASSUOLO": ["sassuolo.png"],
    "LAZIO": ["lazio.png"],
    "PARMA": ["parma.png"],
    "TERNANA": ["ternana.png"],
    "BOLOGNA": ["bologna.png"],
    "AREZZO": ["arezzo.png"],
    "BRESCIA": ["brescia.png", "union-brescia.png"],
    "CESENA": ["cesena.png"],
    "FROSINONE": ["frosinone.png"],
    "GENOA": ["genoa.png"],
    "HELLAS VERONA": ["hellas-verona.png", "verona.png"],
    "LUMEZZANE": ["lumezzane.png"],
    "VENEZIA": ["venezia.png"],
    "VICENZA": ["vicenza.png", "lr-vicenza.png"],
    "SAMPDORIA": ["sampdoria.png"],
    "TORINO": ["torino.png"],
    "REGGIANA": ["reggiana.png"],
    "SALERNITANA": ["salernitana.png"],
    "PALERMO": ["palermo.png"],
    "CHIETI": ["chieti-fc-1922.png", "chieti.png"],
    "CHIEVO": ["chievo.png"],
    "SUDTIROL": ["sudtirol.png", "fc-sudtirol.png"],
    "PINETO": ["pineto.png"],
    "SIENA": ["siena.png"],
    "SAN MARINO": ["san-marino-calcio.png", "san-marino.png"],
    "TRASTEVERE": ["trastevere.png"],
    "ALCIONE MILANO": ["alcione.png"],
    "PRO SESTO": ["pro-sesto.png"],
    "PRO PALAZZOLO": ["pro-palazzolo.png"],
    "MONTESPACCATO": ["montespaccato-calcio.png", "montespaccato.png"],
    "REAL VICENZA": ["real-vicenza.png", "vicenza.png"],
    "LECCE": ["lecce.png", "us-lecce.png"],
    "COMO 1907": ["como-1907.png", "como.png"],
}


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def abbr(name: str) -> str:
    parts = re.findall(r"[A-Za-zÀ-ÿ]+", name)
    if not parts:
        return "WOM"
    if len(parts) == 1:
        return parts[0][:3].upper()
    return "".join(p[0] for p in parts[:3]).upper()


def pick_men_logo(cat: dict, men_name: str) -> Path | None:
    if not men_name:
        return None
    order = ("SERIE A", "SERIE B", "SERIE C", "SERIE D")
    cands = [
        t
        for t in cat["teams"]
        if t.get("gender") == "m" and t.get("name") == men_name
    ]
    if not cands:
        cands = [
            t
            for t in cat["teams"]
            if t.get("gender") == "m" and men_name in (t.get("name") or "")
        ]

    def score(t):
        lg = t.get("league") or ""
        logo = t.get("logo") or ""
        ok = bool(logo and (ROOT / logo).exists() and (ROOT / logo).stat().st_size > 1500)
        for i, o in enumerate(order):
            if lg.startswith(o):
                return (i, 0 if ok else 1)
        return (80, 0 if ok else 1)

    if cands:
        best = sorted(cands, key=score)[0]
        logo = best.get("logo") or ""
        if logo and (ROOT / logo).exists() and (ROOT / logo).stat().st_size > 1500:
            return ROOT / logo

    for fname in MEN_FILE_FALLBACK.get(men_name, []):
        p = LOGHI / fname
        if p.exists() and p.stat().st_size > 1500:
            return p
    p = LOGHI / (slug(men_name) + ".png")
    if p.exists() and p.stat().st_size > 1500:
        return p
    return None


def make_team(name: str, league: str, city: str, logo_rel: str) -> dict:
    return {
        "id": slug(name) + ("-scf" if "SERIE C FEMMINILE" in league else ""),
        "name": name,
        "country": "ITALIA",
        "league": league,
        "city": city,
        "year": "",
        "abbr": abbr(name),
        "gender": "f",
        "pos": 0,
        "pts": 0,
        "played": 0,
        "logo": logo_rel,
        "primary": "#6b2d5c",
        "secondary": "#f5e6c8",
        "accent": "#ffffff",
        "home": {"body": "#6b2d5c", "sleeve": "#6b2d5c"},
        "away": {"body": "#f5e6c8", "sleeve": "#6b2d5c"},
        "source": (
            "lnd.it/seriecfemminile"
            if "SERIE C FEMMINILE" in league
            else "figc.it"
        ),
        "stadium": "",
        "capacity": None,
        "stadiumImage": "immagini/stadi/_default.jpg",
        "stadiumImageSource": "default",
    }


def resolve_logo(name: str, men_name: str | None, cat: dict) -> tuple[str, str]:
    """Return (relative logo path, note)."""
    dest_name = slug(name) + ".png"
    dest = LOGHI / dest_name

    if name in KEEP_DEDICATED:
        dedicated = LOGHI / KEEP_DEDICATED[name]
        if dedicated.exists() and dedicated.stat().st_size > 1000:
            # ensure dest points to dedicated file content
            if dedicated.resolve() != dest.resolve():
                shutil.copy2(dedicated, dest)
            return f"immagini/squadre-loghi/{dest.name}", "dedicated"

    src = pick_men_logo(cat, men_name) if men_name else None
    if src:
        try:
            if src.resolve() == dest.resolve():
                return f"immagini/squadre-loghi/{dest.name}", f"men:{src.name}"
        except Exception:
            pass
        shutil.copy2(src, dest)
        return f"immagini/squadre-loghi/{dest.name}", f"men:{src.name}"

    # keep existing if any
    if dest.exists() and dest.stat().st_size > 1000:
        return f"immagini/squadre-loghi/{dest.name}", "keep-local"
    # try existing women file from catalog later
    return "", "missing"


def upsert_women(cat: dict, name: str, league: str, city: str, men_name: str | None) -> None:
    logo, note = resolve_logo(name, men_name, cat)
    # find existing f team with same name in any women league / or create
    found = None
    for t in cat["teams"]:
        if t.get("name") == name and t.get("gender") == "f":
            # prefer one already in target league or any f
            if t.get("league") == league or found is None:
                found = t
    if found is None:
        # also reclaim if wrong gender? no
        t = make_team(name, league, city, logo)
        if "SERIE C FEMMINILE" in league:
            t["id"] = slug(name) + "-scf"
        cat["teams"].append(t)
        print(f"CREATE {league} | {name} | {note} | {logo}")
    else:
        found["league"] = league
        found["gender"] = "f"
        found["city"] = city
        if logo:
            found["logo"] = logo
            found["logoSource"] = note
        if "SERIE C FEMMINILE" in league:
            found["id"] = slug(name) + "-scf"
            found["source"] = "lnd.it/seriecfemminile"
        else:
            found["source"] = "figc.it"
        print(f"UPDATE {league} | {name} | {note} | {logo}")


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))

    keep_names: set[str] = set()

    for name, city, men in SERIE_A:
        keep_names.add(name)
        upsert_women(cat, name, "SERIE A FEMMINILE", city, men)

    for name, city, men in SERIE_B:
        keep_names.add(name)
        upsert_women(cat, name, "SERIE B FEMMINILE", city, men)

    for g, clubs in SERIE_C.items():
        league = f"SERIE C FEMMINILE · GIRONE {g}"
        for name, city, men in clubs:
            keep_names.add(name)
            upsert_women(cat, name, league, city, men)

    # Demote women not in official organico for A/B/C
    for t in cat["teams"]:
        if t.get("gender") != "f":
            continue
        lg = t.get("league") or ""
        if "ARCHIVIO" in lg:
            continue
        if lg.startswith("SERIE A FEMMINILE") or lg.startswith("SERIE B FEMMINILE") or lg.startswith(
            "SERIE C FEMMINILE"
        ):
            if t["name"] not in keep_names:
                t["league"] = lg.split("·")[0].strip() + " (ARCHIVIO)" if "GIRONE" not in lg else "SERIE C FEMMINILE (ARCHIVIO)"
                if lg.startswith("SERIE A"):
                    t["league"] = "SERIE A FEMMINILE (ARCHIVIO)"
                elif lg.startswith("SERIE B"):
                    t["league"] = "SERIE B FEMMINILE (ARCHIVIO)"
                else:
                    t["league"] = "SERIE C FEMMINILE (ARCHIVIO)"
                print("ARCHIVIO", t["name"], "from", lg)

    # leagueOrder
    order = list(cat.get("leagueOrder") or [])
    wanted = [
        "SERIE A FEMMINILE",
        "SERIE B FEMMINILE",
        "SERIE C FEMMINILE · GIRONE A",
        "SERIE C FEMMINILE · GIRONE B",
        "SERIE C FEMMINILE · GIRONE C",
        "SERIE C FEMMINILE · GIRONE D",
    ]
    order = [x for x in order if x not in wanted and "SERIE C FEMMINILE" not in x]
    # insert after last non-fem or at end of pro
    insert_at = 0
    for i, x in enumerate(order):
        if "FEMMINILE" in x:
            insert_at = i
            break
        if x.startswith("SERIE"):
            insert_at = i + 1
    # put women leagues after SERIE A FEM if rebuilding clean: after all men's serie?
    # Prefer after SERIE D or after existing first fem slot
    fem_idx = next((i for i, x in enumerate(order) if "FEMMINILE" in x), None)
    if fem_idx is not None:
        insert_at = fem_idx
        order = [x for x in order if "FEMMINILE" not in x]
        # recompute: after SERIE D block
        insert_at = 0
        for i, x in enumerate(order):
            if x.startswith("SERIE"):
                insert_at = i + 1
    for j, lg in enumerate(wanted):
        order.insert(insert_at + j, lg)
    cat["leagueOrder"] = order

    cat["version"] = max(int(cat.get("version") or 29), 30)
    cat["updatedAt"] = "2026-08-07"
    cat.setdefault("stats", {})
    cat["stats"]["womenFromMenLogos"] = True

    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    # summary
    from collections import Counter

    w = [t for t in cat["teams"] if t.get("gender") == "f" and "ARCHIVIO" not in (t.get("league") or "")]
    print("---")
    print(Counter(t["league"] for t in w))
    for t in sorted(w, key=lambda x: (x["league"], x["name"])):
        ok = bool(t.get("logo") and (ROOT / t["logo"]).exists())
        print(
            f"  {t['league'][:32]:32} {t['name'][:28]:28} "
            f"{'OK' if ok else 'NO'} {t.get('logoSource') or ''} {t.get('logo') or ''}"
        )


if __name__ == "__main__":
    main()
