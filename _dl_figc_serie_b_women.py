# -*- coding: utf-8 -*-
"""Scarica roster + loghi Serie B Femminile da figc.it e aggiorna catalogo."""
from __future__ import annotations

import io
import json
import re
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
    "Referer": "https://www.figc.it/it/serie-b-femminile/club",
}

# Fonte ufficiale: https://www.figc.it/it/serie-b-femminile/club
# 14 club stagione 2026-27
FIGC_B = [
    {"name": "AREZZO WOMEN", "id": "arezzo-women", "city": "AREZZO",
     "url": "https://www.figc.it/media/276952/logo_arezzo.png", "file": "arezzo-women.png"},
    {"name": "BOLOGNA WOMEN", "id": "bologna-women", "city": "BOLOGNA",
     "url": "https://www.figc.it/media/209801/bologna.jpg", "file": "bologna-women.png"},
    {"name": "BRESCIA WOMEN", "id": "brescia-women", "city": "BRESCIA",
     "url": "https://www.figc.it/media/146133/logo_brescia_2021bis.png", "file": "brescia-women.png"},
    {"name": "CESENA WOMEN", "id": "cesena-women", "city": "CESENA",
     "url": "https://www.figc.it/media/98865/logo_cesena.jpg", "file": "cesena-women.png"},
    # Nota: Como 1907 è in Serie A Women sul sito FIGC club A;
    # in lista B compare ancora in alcuni menu: la teniamo fuori da B per evitare doppioni.
    {"name": "FREEDOM FC", "id": "freedom-fc", "city": "ROMA",
     "url": "https://www.figc.it/media/210219/scudetto_freedom_ok.png", "file": "freedom-fc.png"},
    {"name": "FROSINONE WOMEN", "id": "frosinone-women", "city": "FROSINONE",
     "url": "https://www.figc.it/media/276998/logo_frosinone_2025.png", "file": "frosinone-women.png"},
    {"name": "HELLAS VERONA WOMEN", "id": "hellas-verona-women", "city": "VERONA",
     "url": "https://www.figc.it/media/249446/logo_hellasverona2024.png", "file": "hellas-verona-women.png"},
    {"name": "LUMEZZANE WOMEN", "id": "lumezzane-women", "city": "LUMEZZANE",
     "url": "https://www.figc.it/media/246754/lumezzane_2024.png", "file": "lumezzane-women.png"},
    {"name": "RES DONNA ROMA", "id": "res-donna-roma", "city": "ROMA",
     "url": "https://www.figc.it/media/277356/res-donna-roma.png", "file": "res-donna-roma.png"},
    {"name": "SAN MARINO ACADEMY", "id": "san-marino-academy", "city": "SERRAVALLE",
     "url": "https://www.figc.it/media/98363/logo_san_marino_academy.jpg", "file": "san-marino-academy.png"},
    {"name": "TRASTEVERE WOMEN", "id": "trastevere-women", "city": "ROMA",
     "url": "https://www.figc.it/media/276978/logo_trastevere_2025.png", "file": "trastevere-women.png"},
    {"name": "VENEZIA WOMEN", "id": "venezia-women", "city": "VENEZIA",
     "url": "https://www.figc.it/media/276993/logo_venezia_2025.png", "file": "venezia-women.png"},
    {"name": "VICENZA WOMEN", "id": "vicenza-women", "city": "VICENZA",
     "url": "https://www.figc.it/media/278187/logo_vicenza_2025new.png", "file": "vicenza-women.png"},
    # Genoa citata nel calendario B (Bologna-Genoa) e logo da media figc se disponibile
    {"name": "GENOA WOMEN", "id": "genoa-women", "city": "GENOVA",
     "url": "https://www.figc.it/media/2587/logo_genoa.jpg", "file": "genoa-women.png"},
]

# Logo lega: rebrand Serie B Femminile (immagine usata su news ufficiali)
LEAGUE_CANDIDATES = [
    "https://images.figc.it/view/acePublic/alias/contentid/1s5qv2ks3mggw2anfk5/0/seriebfemminile-rebranding-news-serieb-jpg.jpg?f=ORIGINAL&q=0.9&w=1200",
    "https://images.figc.it/view/acePublic/alias/contentid/1spzrs4ms8cwvgsvl1g/0/serieb-femminile-a4-calendario-ss26-27_positive-jpg.jpg?f=ORIGINAL&q=0.9&w=800",
]


def dl(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=45, context=CTX).read()


def save_png(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        im.save(dest, "PNG")
    except Exception:
        dest.write_bytes(data)


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def main():
    LOGHI.mkdir(parents=True, exist_ok=True)

    # league logo
    league_ok = False
    for u in LEAGUE_CANDIDATES:
        try:
            data = dl(u)
            if len(data) > 2000:
                save_png(data, LOGHI / "serie-b-femminile.png")
                print("LEAGUE ok", (LOGHI / "serie-b-femminile.png").stat().st_size, u[:80])
                league_ok = True
                break
        except Exception as e:
            print("LEAGUE fail", e)
    if not league_ok:
        print("LEAGUE missing - will use placeholder if any")

    # clubs
    for c in FIGC_B:
        dest = LOGHI / c["file"]
        try:
            data = dl(c["url"])
            save_png(data, dest)
            print(f"OK {c['name']}: {dest.name} ({dest.stat().st_size})")
        except Exception as e:
            # Genoa fallback already on disk maybe
            if dest.exists() and dest.stat().st_size > 2000:
                print(f"KEEP local {c['name']}")
            else:
                print(f"FAIL {c['name']}: {e}")

    # Also try Genoa from other common figc path if failed
    genoa = LOGHI / "genoa-women.png"
    if not genoa.exists() or genoa.stat().st_size < 2000:
        for u in [
            "https://www.figc.it/media/175280/logo_genoa2022.jpg",
            "https://www.figc.it/media/2590/logo_genoa.jpg",
        ]:
            try:
                save_png(dl(u), genoa)
                print("GENOA alt ok", genoa.stat().st_size)
                break
            except Exception as e:
                print("GENOA alt fail", e)

    # catalog rebuild Serie B Femminile roster
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    by = {t["name"]: t for t in cat["teams"]}
    keep = set()

    for c in FIGC_B:
        keep.add(c["name"])
        logo = f"immagini/squadre-loghi/{c['file']}"
        if not (ROOT / logo).exists():
            logo = ""
        t = by.get(c["name"])
        if not t:
            # alias: VERONA WOMEN -> HELLA, PINK BARI etc.
            t = {
                "id": c["id"],
                "name": c["name"],
                "country": "ITALIA",
                "league": "SERIE B FEMMINILE",
                "city": c["city"],
                "year": "",
                "abbr": re.sub(r"[^A-Z]", "", c["name"])[:3] or "WOM",
                "gender": "f",
                "pos": 0,
                "pts": 0,
                "played": 0,
                "logo": logo,
                "primary": "#1e3a5f",
                "secondary": "#ffffff",
                "accent": "#ffffff",
                "home": {"body": "#1e3a5f", "sleeve": "#1e3a5f"},
                "away": {"body": "#ffffff", "sleeve": "#1e3a5f"},
                "source": "figc.it/serie-b-femminile",
                "stadium": "",
                "capacity": None,
                "stadiumImage": "immagini/stadi/_default.jpg",
                "stadiumImageSource": "default",
            }
            cat["teams"].append(t)
            by[c["name"]] = t
            print("CREATED", c["name"])
        else:
            t["logo"] = logo or t.get("logo") or ""
            t["league"] = "SERIE B FEMMINILE"
            t["gender"] = "f"
            t["city"] = c["city"]
            t["source"] = "figc.it/serie-b-femminile"
            print("UPDATED", c["name"])

    # Alias rename old catalog names into official ones where needed
    renames = {
        "VERONA WOMEN": "HELLAS VERONA WOMEN",
        "SAN MARINO WOMEN": "SAN MARINO ACADEMY",
        "RES ROMA": "RES DONNA ROMA",
        "TAVAGNACCO": None,  # not in organico: leave or demote out
        "PINK BARI": None,
        "CHIEVO WOMEN": None,
        "SAMPDORIA WOMEN": None,
        "POMIGLIANO WOMEN": None,
        "CAGLIARI WOMEN": None,
    }
    # Move obsolete B names out of Serie B Femminile if not in keep
    for t in cat["teams"]:
        if t.get("league") != "SERIE B FEMMINILE":
            continue
        if t["name"] in keep:
            continue
        # try rename
        if t["name"] in renames and renames[t["name"]] and renames[t["name"]] in keep:
            # already have official entry
            print("DROP DUP", t["name"])
            t["league"] = "SERIE B FEMMINILE (ARCHIVIO)"
            continue
        print("OUT of B roster", t["name"])
        t["league"] = "SERIE B FEMMINILE (ARCHIVIO)"

    # Ensure Como 1907 stays Serie A if already there
    for t in cat["teams"]:
        if t["name"] == "COMO 1907 WOMEN" and t.get("source", "").startswith("figc.it/serie-a"):
            t["league"] = "SERIE A FEMMINILE"

    cat["version"] = max(int(cat.get("version") or 25), 26)
    cat.setdefault("stats", {})
    cat["stats"]["serieBFem"] = len(keep)
    cat["stats"]["serieBFemSource"] = "figc.it"
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    b = [t for t in cat["teams"] if t.get("league") == "SERIE B FEMMINILE"]
    print("DONE Serie B Femminile", len(b), "teams")
    for t in b:
        ok = (ROOT / (t.get("logo") or "")).exists() if t.get("logo") else False
        print(" ", t["name"], "logo" if ok else "NO LOGO")


if __name__ == "__main__":
    main()
