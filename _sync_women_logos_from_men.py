# -*- coding: utf-8 -*-
"""
Copia i loghi maschili sulle squadre femminili (stesso stemma club).
Eccezioni: NAPOLI WOMEN, COMO WOMEN, COMO 1907 WOMEN (loghi dedicati).
Le competizioni non si toccano.
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"

# Keep women's dedicated crests
KEEP_WOMEN_LOGOS = {
    "NAPOLI WOMEN",
    "COMO WOMEN",
    "COMO 1907 WOMEN",
}

# Explicit name -> men catalog name or logo file
MANUAL_MAP = {
    "JUVENTUS WOMEN": "JUVENTUS",
    "ROMA WOMEN": "ROMA",
    "INTER WOMEN": "INTER",
    "FIORENTINA WOMEN": "FIORENTINA",
    "MILAN WOMEN": "MILAN",
    "SASSUOLO WOMEN": "SASSUOLO",
    "LAZIO WOMEN": "LAZIO",
    "PARMA WOMEN": "PARMA",
    "TERNANA WOMEN": "TERNANA",
    "BOLOGNA WOMEN": "BOLOGNA",
    "AREZZO WOMEN": "AREZZO",
    "LUMEZZANE WOMEN": "LUMEZZANE",
    "BRESCIA WOMEN": "BRESCIA",
    "CESENA WOMEN": "CESENA",
    "GENOA WOMEN": "GENOA",
    "FROSINONE WOMEN": "FROSINONE",
    "HELLAS VERONA WOMEN": "HELLAS VERONA",
    "VENEZIA WOMEN": "VENEZIA",
    "VICENZA WOMEN": "VICENZA",
    "SAMPDORIA WOMEN": "SAMPDORIA",
    "TORINO WOMEN": "TORINO",
    "TORINO FC WOMEN": "TORINO",
    "REGGIANA WOMEN": "REGGIANA",
    "SALERNITANA WOMEN": "SALERNITANA",
    "PALERMO FC WOMEN": "PALERMO",
    "CHIETI WOMEN": "CHIETI",
    "CHIEVOVERONA WOMEN": "CHIEVO",
    "SUDTIROL WOMEN": "SUDTIROL",
    "PINETO WOMEN": "PINETO",
    "SIENA CF": "SIENA",
    "ROMA CF": "ROMA",
    "ALCIONE MILANO": "ALCIONE MILANO",
    "PRO SESTO": "PRO SESTO",
    "PRO PALAZZOLO": "PRO PALAZZOLO",
    "MONTESPACCATO": "MONTESPACCATO",
    "REAL VICENZA": "REAL VICENZA",
    # optional fuzzy
    "SAN MARINO ACADEMY": "SAN MARINO",
    "TRASTEVERE WOMEN": "TRASTEVERE",
}

# Fallback file names if catalog men entry missing
FILE_FALLBACK = {
    "JUVENTUS": ["juventus.png", "juventus-fc.png"],
    "ROMA": ["roma.png", "as-roma.png"],
    "INTER": ["inter.png", "inter-milan.png", "fc-internazionale-milano.png"],
    "FIORENTINA": ["fiorentina.png", "acf-fiorentina.png"],
    "MILAN": ["milan.png", "ac-milan.png"],
    "SASSUOLO": ["sassuolo.png", "us-sassuolo-calcio.png"],
    "LAZIO": ["lazio.png", "ss-lazio.png"],
    "PARMA": ["parma.png", "parma-calcio-1913.png"],
    "TERNANA": ["ternana.png", "ternana-calcio.png"],
    "BOLOGNA": ["bologna.png", "bologna-fc-1909.png"],
    "AREZZO": ["arezzo.png", "ss-arezzo.png", "us-arezzo.png"],
    "LUMEZZANE": ["lumezzane.png"],
    "BRESCIA": ["brescia.png", "brescia-calcio.png"],
    "CESENA": ["cesena.png", "cesena-fc.png"],
    "GENOA": ["genoa.png", "genoa-cfc.png"],
    "FROSINONE": ["frosinone.png", "frosinone-calcio.png"],
    "HELLAS VERONA": ["hellas-verona.png", "verona.png", "hellas-verona-fc.png"],
    "VENEZIA": ["venezia.png", "venezia-fc.png"],
    "VICENZA": ["vicenza.png", "lr-vicenza.png"],
    "SAMPDORIA": ["sampdoria.png"],
    "TORINO": ["torino.png", "torino-fc.png"],
    "REGGIANA": ["reggiana.png"],
    "SALERNITANA": ["salernitana.png"],
    "PALERMO": ["palermo.png", "palermo-fc.png"],
    "CHIETI": ["chieti-fc-1922.png", "chieti.png"],
    "CHIEVO": ["chievo.png", "ac-chievo-verona.png"],
    "SUDTIROL": ["sudtirol.png", "fc-sudtirol.png"],
    "PINETO": ["pineto.png"],
    "SIENA": ["siena.png"],
    "SAN MARINO": ["san-marino.png", "san-marino-calcio.png"],
    "TRASTEVERE": ["trastevere.png", "trastevere-calcio.png"],
    "ALCIONE MILANO": ["alcione.png", "alcione-milano.png"],
    "PRO SESTO": ["pro-sesto.png"],
    "PRO PALAZZOLO": ["pro-palazzolo.png"],
    "MONTESPACCATO": ["montespaccato-calcio.png", "montespaccato.png"],
    "REAL VICENZA": ["real-vicenza.png", "vicenza.png"],
}


def pick_men_team(cat: dict, men_name: str) -> dict | None:
    order_pref = ("SERIE A", "SERIE B", "SERIE C", "SERIE D")
    cands = [
        t
        for t in cat["teams"]
        if t.get("gender") == "m" and t.get("name") == men_name
    ]
    if not cands:
        # partial
        cands = [
            t
            for t in cat["teams"]
            if t.get("gender") == "m"
            and men_name in (t.get("name") or "")
            and not (t.get("league") or "").startswith(
                ("ECCELLENZA", "PROMOZIONE", "PRIMA", "SECONDA", "TERZA")
            )
        ]
    if not cands:
        return None

    def score(t):
        lg = t.get("league") or ""
        for i, o in enumerate(order_pref):
            if lg.startswith(o):
                logo = t.get("logo") or ""
                exists = (ROOT / logo).exists() if logo else False
                return (i, 0 if exists else 1)
        return (50, 0 if (t.get("logo") and (ROOT / t["logo"]).exists()) else 1)

    return sorted(cands, key=score)[0]


def resolve_logo_file(men_name: str, men_team: dict | None) -> Path | None:
    if men_team:
        logo = men_team.get("logo") or ""
        if logo and (ROOT / logo).exists() and (ROOT / logo).stat().st_size > 1500:
            return ROOT / logo
    for fname in FILE_FALLBACK.get(men_name, []):
        p = LOGHI / fname
        if p.exists() and p.stat().st_size > 1500:
            return p
    # slug guess
    slug = re.sub(r"[^a-z0-9]+", "-", men_name.lower()).strip("-") + ".png"
    p = LOGHI / slug
    if p.exists() and p.stat().st_size > 1500:
        return p
    return None


def women_dest_path(team: dict) -> Path:
    """Prefer existing women logo filename; else slug-women.png."""
    cur = team.get("logo") or ""
    if cur and "squadre-loghi" in cur:
        # keep same path so catalog path unchanged when possible
        p = ROOT / cur
        # but if it's the exclusive napoli/como keep
        return p
    slug = re.sub(r"[^a-z0-9]+", "-", team["name"].lower()).strip("-")
    return LOGHI / f"{slug}.png"


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    women = [
        t
        for t in cat["teams"]
        if t.get("gender") == "f" and "ARCHIVIO" not in (t.get("league") or "")
    ]

    updated = kept = missing = 0
    for t in sorted(women, key=lambda x: (x.get("league") or "", x["name"])):
        name = t["name"]
        if name in KEEP_WOMEN_LOGOS:
            print(f"KEEP  {name} ({t.get('logo')})")
            kept += 1
            continue

        men_name = MANUAL_MAP.get(name)
        if not men_name:
            # derive: strip WOMEN / FC WOMEN / CF
            base = name
            for suf in (" WOMEN", " FC WOMEN", " CF", " FC"):
                if base.endswith(suf):
                    base = base[: -len(suf)].strip()
                    break
            men_name = base

        men_team = pick_men_team(cat, men_name)
        # try alternates for Hellas etc.
        if not men_team and men_name == "HELLAS VERONA":
            men_team = pick_men_team(cat, "VERONA") or pick_men_team(
                cat, "HELLAS VERONA"
            )
        if not men_team and men_name == "MILAN":
            men_team = pick_men_team(cat, "AC MILAN") or pick_men_team(cat, "MILAN")
        if not men_team and men_name == "INTER":
            men_team = pick_men_team(cat, "INTER") or pick_men_team(
                cat, "INTERNATIONALE"
            )

        src = resolve_logo_file(men_name, men_team)
        if not src:
            # last resort: any file matching slug
            print(f"MISS  {name} (no men logo for {men_name})")
            missing += 1
            continue

        dest = women_dest_path(t)
        # Always write into a women-named file to avoid overwriting men assets
        # when catalog currently points at men path.
        dest_name = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") + ".png"
        dest = LOGHI / dest_name

        # If current logo is a dedicated women file that equals men path, still overwrite content
        try:
            if dest.resolve() == src.resolve():
                # same file — just ensure catalog points to it
                t["logo"] = f"immagini/squadre-loghi/{dest.name}"
                print(f"SAME  {name} -> {dest.name}")
                updated += 1
                continue
        except Exception:
            pass

        shutil.copy2(src, dest)
        t["logo"] = f"immagini/squadre-loghi/{dest.name}"
        t["logoSource"] = f"men:{src.name}"
        print(f"COPY  {name:28} <- {src.name:30} -> {dest.name}")
        updated += 1

    cat["version"] = max(int(cat.get("version") or 28), 29)
    cat.setdefault("stats", {})
    cat["stats"]["womenLogosFromMen"] = updated
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print("---")
    print(f"updated={updated} kept={kept} missing={missing} version={cat['version']}")


if __name__ == "__main__":
    main()
