# -*- coding: utf-8 -*-
"""
Serie C Femminile 2026/27 da LND ufficiale.
Fonte: https://lnd.it/seriecfemminile/la-composizione-ufficiale-dei-gironi-2026-2027/
49 club, 4 gironi (A 12, B 13, C 12, D 12). Inizio 11/10/2026.
"""
from __future__ import annotations

import io
import json
import re
import shutil
import ssl
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "image/*,*/*;q=0.8",
    "Referer": "https://lnd.it/seriecfemminile/",
}

# Organico ufficiale LND 2026-2027 (testo CU / pagina LND)
# (name, city, optional local logo file to reuse/copy)
GIRONI = {
    "A": [
        ("ATLETICO URI", "URI"),
        ("WOMEN TORRES", "SASSARI"),
        ("SAMPDORIA WOMEN", "GENOVA", "sampdoria.png"),
        ("ANGELO BAIARDO", "GENOVA"),
        ("TORINO WOMEN", "TORINO", "torino.png"),
        ("TORINO FC WOMEN", "TORINO", "torino.png"),
        ("CARONNESE", "CARONNO PERTUSELLA"),
        ("FC SEDRIANO", "SEDRIANO"),
        ("FC LESMO", "LESMO"),
        ("PRO SESTO", "SESTO SAN GIOVANNI", "pro-sesto.png"),
        ("ALCIONE MILANO", "MILANO", "alcione.png"),
        ("REAL MEDA", "MEDA"),
    ],
    "B": [
        ("OROBICA SHARKS COLOGNO", "COLOGNO MONZESE"),
        ("PRO PALAZZOLO", "PALAZZOLO SULL'OGLIO"),
        ("POLISPORTIVA ERBUSCO", "ERBUSCO"),
        ("AZZURRA S. BARTOLOMEO", "SANT'ANTONIO ABATE"),  # fix later if wrong
        ("TRENTO ACADEMY", "TRENTO"),
        ("SUDTIROL WOMEN", "BOLZANO"),
        ("ALTO LIVENZA ACADEMY", "SACILE"),
        ("CHIEVOVERONA WOMEN", "VERONA", "chievo.png"),
        ("REAL VICENZA", "VICENZA"),
        ("VILLORBA TREVISO", "VILLORBA"),
        ("VENEZIA 1985", "VENEZIA", "venezia.png"),
        ("VENEZIA FC WOMEN", "VENEZIA", "venezia.png"),
        ("ACADEMY CALCIO PAVIA", "PAVIA"),
    ],
    "C": [
        ("BESURICA", "PARMA"),
        ("REGGIANA WOMEN", "REGGIO EMILIA", "reggiana.png"),
        ("RINASCITA DOCCIA", "SESTO FIORENTINO"),
        ("SIENA CF", "SIENA", "siena.png"),
        ("RICCIONE", "RICCIONE"),
        ("ARZILLA", "PESARO"),
        ("NUOVA ALBA", "ALBA"),
        ("PINETO WOMEN", "PINETO", "pineto.png"),
        ("ORIGINAL CELTIC BHOYS", "ROMA"),
        ("ROME CITY", "ROMA"),
        ("MONTESPACCATO", "ROMA"),
        ("GRIFONE GIALLOVERDE", "GROTTAFERRATA"),
    ],
    "D": [
        ("ROMA CF", "ROMA", "roma.png"),
        ("COLLEFERRO", "COLLEFERRO"),
        ("VILLARICCA", "VILLARICCA"),
        ("ACADEMY ABATESE", "SANT'ANTONIO ABATE"),
        ("SPOT CLUB S. ANTONIO ABATE", "SANT'ANTONIO ABATE"),
        ("SALERNITANA WOMEN", "SALERNO", "salernitana.png"),
        ("PINK SPORT TIME", "BARI"),
        ("WOMEN LECCE", "LECCE"),
        ("CUS UNICAL", "RENDE"),
        ("RACING CATANIA", "CATANIA"),
        ("PALERMO FC WOMEN", "PALERMO", "palermo.png"),
        ("CHIETI WOMEN", "CHIETI", "chieti-fc-1922.png"),
    ],
}

# Fix Azzurra: typically Azzurra SB is from Bergamo area (S. Bartolomeo) - keep generic
GIRONI["B"][3] = ("AZZURRA S. BARTOLOMEO", "BERGAMO")

LEAGUE_IMG_CANDIDATES = [
    # Immagine social/articolo LND composizione gironi
    "https://lnd.it/wp-content/uploads/2026/08/foto-seriec-pallone-2-scaled.jpg",
    "https://lnd.it/wp-content/uploads/2026/08/foto-seriec-pallone-2.jpg",
]


def dl(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=45, context=CTX).read()


def save_png(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        # crop center square-ish if very wide banner
        w, h = im.size
        if w > h * 1.6 and w > 400:
            side = h
            left = (w - side) // 2
            im = im.crop((left, 0, left + side, h))
        im.thumbnail((512, 512), Image.Resampling.LANCZOS)
        im.save(dest, "PNG")
    except Exception:
        dest.write_bytes(data)


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = s.replace("ü", "u").replace("ö", "o").replace("ä", "a").replace("ß", "ss")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def abbr(name: str) -> str:
    parts = re.findall(r"[A-Za-zÀ-ÿ]+", name)
    if not parts:
        return "SCF"
    if len(parts) == 1:
        return parts[0][:3].upper()
    return "".join(p[0] for p in parts[:3]).upper()


def probe_lnd_images() -> list[str]:
    urls = []
    for page in [
        "https://lnd.it/seriecfemminile/la-composizione-ufficiale-dei-gironi-2026-2027/",
        "https://lnd.it/seriecfemminile/",
    ]:
        try:
            html = dl(page).decode("utf-8", "replace")
        except Exception as e:
            print("probe fail", page, e)
            continue
        found = re.findall(
            r"https?://lnd\.it/wp-content/uploads/[^\s\"'<>]+", html
        )
        for u in found:
            u = u.rstrip("\\).,;")
            if u not in urls:
                urls.append(u)
        # og:image
        for pat in [
            r'property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
            r'content=["\']([^"\']+)["\'][^>]+property=["\']og:image',
        ]:
            for m in re.findall(pat, html, re.I):
                if m not in urls:
                    urls.append(m)
    return urls


def ensure_team_logo(name: str, reuse_file: str | None) -> str:
    """Copy men's/shared crest if available; return relative logo path or empty."""
    dest_name = slugify(name) + ".png"
    dest = LOGHI / dest_name
    if dest.exists() and dest.stat().st_size > 1500:
        return f"immagini/squadre-loghi/{dest_name}"

    if reuse_file:
        src = LOGHI / reuse_file
        if src.exists() and src.stat().st_size > 1500:
            shutil.copy2(src, dest)
            print(f"  logo reuse {reuse_file} -> {dest_name}")
            return f"immagini/squadre-loghi/{dest_name}"

    # try fuzzy local match without -women
    base = slugify(name.replace(" WOMEN", "").replace(" FC", "").replace(" CF", ""))
    for cand in [
        f"{base}.png",
        f"{base}-fc.png",
        f"{slugify(name)}.png",
    ]:
        src = LOGHI / cand
        if src.exists() and src.stat().st_size > 1500 and src != dest:
            shutil.copy2(src, dest)
            print(f"  logo fuzzy {cand} -> {dest_name}")
            return f"immagini/squadre-loghi/{dest_name}"

    return ""


def make_team(name: str, league: str, city: str, logo: str) -> dict:
    return {
        "id": slugify(name),
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
        "logo": logo,
        "primary": "#6b2d5c",
        "secondary": "#f5e6c8",
        "accent": "#ffffff",
        "home": {"body": "#6b2d5c", "sleeve": "#6b2d5c"},
        "away": {"body": "#f5e6c8", "sleeve": "#6b2d5c"},
        "source": "lnd.it/seriecfemminile",
        "stadium": "",
        "capacity": None,
        "stadiumImage": "immagini/stadi/_default.jpg",
        "stadiumImageSource": "default",
    }


def main():
    LOGHI.mkdir(parents=True, exist_ok=True)

    # League logo
    league_dest = LOGHI / "serie-c-femminile.png"
    league_ok = False
    candidates = list(LEAGUE_IMG_CANDIDATES)
    try:
        probed = probe_lnd_images()
        print("probed images", len(probed))
        for u in probed:
            low = u.lower()
            if any(k in low for k in ("serie", "femmin", "pallone", "logo", "brand", "c-fem")):
                if u not in candidates:
                    candidates.insert(0, u)
                print("  cand", u[:120])
    except Exception as e:
        print("probe error", e)

    for u in candidates:
        try:
            data = dl(u)
            if len(data) > 3000:
                save_png(data, league_dest)
                print("LEAGUE ok", league_dest.stat().st_size, u[:90])
                league_ok = True
                break
        except Exception as e:
            print("LEAGUE fail", e)

    if not league_ok and league_dest.exists():
        print("LEAGUE keep existing")
        league_ok = True
    if not league_ok:
        # Fallback: reuse serie-b-femminile style placeholder is wrong;
        # try LND site logo from common path
        for u in [
            "https://lnd.it/wp-content/uploads/2021/07/logo-lnd.png",
            "https://lnd.it/wp-content/themes/lnd/assets/images/logo.svg",
        ]:
            try:
                data = dl(u)
                if len(data) > 500:
                    save_png(data, league_dest)
                    print("LEAGUE fallback", league_dest.stat().st_size, u)
                    league_ok = True
                    break
            except Exception as e:
                print("LEAGUE fb fail", e)

    cat = json.loads(CAT.read_text(encoding="utf-8"))
    # Match only existing women's / SCF entries — never overwrite men's clubs with same name
    by_scf = {
        t["name"]: t
        for t in cat["teams"]
        if t.get("gender") == "f"
        and (
            "SERIE C FEMMINILE" in (t.get("league") or "")
            or (t.get("source") or "").startswith("lnd.it/seriecfemminile")
            or str(t.get("id") or "").endswith("-scf")
        )
    }
    keep_names: set[str] = set()
    created = updated = 0

    for girone, clubs in GIRONI.items():
        league = f"SERIE C FEMMINILE · GIRONE {girone}"
        for entry in clubs:
            name = entry[0]
            city = entry[1]
            reuse = entry[2] if len(entry) > 2 else None
            keep_names.add(name)
            logo = ensure_team_logo(name, reuse)
            t = by_scf.get(name)
            if not t:
                t = make_team(name, league, city, logo)
                t["id"] = slugify(name) + "-scf"
                cat["teams"].append(t)
                by_scf[name] = t
                created += 1
                print("CREATED", league, name, "logo" if logo else "no-logo")
            else:
                t["id"] = slugify(name) + "-scf"
                t["league"] = league
                t["gender"] = "f"
                t["city"] = city
                t["source"] = "lnd.it/seriecfemminile"
                if logo:
                    t["logo"] = logo
                updated += 1
                print("UPDATED", league, name)

    # Demote previous C fem teams not in organico
    for t in cat["teams"]:
        lg = t.get("league") or ""
        if "SERIE C FEMMINILE" in lg and "(ARCHIVIO)" not in lg:
            if t["name"] not in keep_names:
                t["league"] = "SERIE C FEMMINILE (ARCHIVIO)"
                print("ARCHIVIO", t["name"])

    # leagueOrder: insert after SERIE B FEMMINILE
    order = list(cat.get("leagueOrder") or [])
    new_leagues = [
        "SERIE C FEMMINILE · GIRONE A",
        "SERIE C FEMMINILE · GIRONE B",
        "SERIE C FEMMINILE · GIRONE C",
        "SERIE C FEMMINILE · GIRONE D",
    ]
    # remove old
    order = [x for x in order if not x.startswith("SERIE C FEMMINILE")]
    # find insert after B fem
    insert_at = None
    for i, x in enumerate(order):
        if x == "SERIE B FEMMINILE":
            insert_at = i + 1
            break
    if insert_at is None:
        # after SERIE A FEMMINILE
        for i, x in enumerate(order):
            if "FEMMINILE" in x:
                insert_at = i + 1
        if insert_at is None:
            insert_at = len(order)
    for j, lg in enumerate(new_leagues):
        order.insert(insert_at + j, lg)
    cat["leagueOrder"] = order

    cat["version"] = max(int(cat.get("version") or 26), 27)
    cat["season"] = cat.get("season") or "2026/2027"
    cat["updatedAt"] = "2026-08-07"
    cat.setdefault("stats", {})
    cat["stats"]["serieCFem"] = len(keep_names)
    cat["stats"]["serieCFemSource"] = "lnd.it"
    cat["stats"]["serieCFemGironi"] = {g: len(clubs) for g, clubs in GIRONI.items()}

    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    print("---")
    print(f"DONE Serie C Femminile: {len(keep_names)} teams (created={created}, updated={updated})")
    print(f"league logo: {league_ok} -> {league_dest.name if league_dest.exists() else 'MISSING'}")
    for g, clubs in GIRONI.items():
        lg = f"SERIE C FEMMINILE · GIRONE {g}"
        n = sum(1 for t in cat["teams"] if t.get("league") == lg)
        logos = sum(
            1
            for t in cat["teams"]
            if t.get("league") == lg and t.get("logo") and (ROOT / t["logo"]).exists()
        )
        print(f"  {lg}: {n} squadre, {logos} loghi")


if __name__ == "__main__":
    main()
