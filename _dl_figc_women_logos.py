# -*- coding: utf-8 -*-
"""Scarica loghi ufficiali Serie A Women da figc.it e aggiorna catalogo."""
from __future__ import annotations

import json
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.figc.it/it/serie-a-women/club",
}

# Fonte: https://www.figc.it/it/serie-a-women/club (12 club)
FIGC_CLUBS = [
    {
        "name": "COMO 1907 WOMEN",
        "id": "como-1907-women",
        "city": "COMO",
        "url": "https://www.figc.it/media/276973/logo_como1907_2025.png",
        "file": "como-1907-women.png",
    },
    {
        "name": "COMO WOMEN",
        "id": "como-women",
        "city": "COMO",
        "url": "https://www.figc.it/media/246779/fccomowomen_2024.png",
        "file": "como-women.png",
    },
    {
        "name": "FIORENTINA WOMEN",
        "id": "fiorentina-women",
        "city": "FIRENZE",
        "url": "https://www.figc.it/media/175282/logo_fiorentina2022.jpg",
        "file": "fiorentina-women.png",
    },
    {
        "name": "INTER WOMEN",
        "id": "inter-women",
        "city": "MILANO",
        "url": "https://www.figc.it/media/136148/logo_femminileintermilano_new2021.png",
        "file": "inter-women.png",
    },
    {
        "name": "JUVENTUS WOMEN",
        "id": "juventus-women",
        "city": "TORINO",
        "url": "https://www.figc.it/media/123436/logo_juventus2020.png",
        "file": "juventus-women.png",
    },
    {
        "name": "LAZIO WOMEN",
        "id": "lazio-women",
        "city": "ROMA",
        "url": "https://www.figc.it/media/143861/logolazio_2021.png",
        "file": "lazio-women.png",
    },
    {
        "name": "MILAN WOMEN",
        "id": "milan-women",
        "city": "MILANO",
        "url": "https://www.figc.it/media/127181/logo_milan_new.jpg",
        "file": "milan-women.png",
    },
    {
        "name": "NAPOLI WOMEN",
        "id": "napoli-women",
        "city": "NAPOLI",
        "url": "https://images.figc.it/view/acePublic/alias/contentid/1smxyt664syiygo4nrf/0/napoli-women-logo-grigio.jpg",
        "file": "napoli-women.png",
    },
    {
        "name": "PARMA WOMEN",
        "id": "parma-women",
        "city": "PARMA",
        "url": "https://www.figc.it/media/175281/logo_parma2022.jpg",
        "file": "parma-women.png",
    },
    {
        "name": "ROMA WOMEN",
        "id": "roma-women",
        "city": "ROMA",
        "url": "https://www.figc.it/media/2588/logo_roma.jpg",
        "file": "roma-women.png",
    },
    {
        "name": "SASSUOLO WOMEN",
        "id": "sassuolo-women",
        "city": "SASSUOLO",
        "url": "https://www.figc.it/media/2589/logo_sassuolo.jpg",
        "file": "sassuolo-women.png",
    },
    {
        "name": "TERNANA WOMEN",
        "id": "ternana-women",
        "city": "TERNI",
        "url": "https://www.figc.it/media/175287/ternana-women.jpg",
        "file": "ternana-women.png",
    },
]

# Logo competizione Serie A Women Athora (sezione Competizioni su figc.it)
LEAGUE_LOGO_URL = (
    "https://images.figc.it/view/acePublic/alias/contentid/"
    "NzRmOWZlYjAtMTI3Ni00/0/logo-serie-a-athora.jpg?f=ORIGINAL&q=0.75&w=1200"
)


def dl(url: str, dest: Path) -> int:
    req = urllib.request.Request(url, headers=UA)
    data = urllib.request.urlopen(req, timeout=45, context=CTX).read()
    if len(data) < 800:
        raise RuntimeError(f"too small {len(data)}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    # normalize extension from content / url
    dest.write_bytes(data)
    return len(data)


def ensure_png(path: Path) -> Path:
    """Convert jpg to png if needed (keep name .png as requested)."""
    try:
        from PIL import Image
        import io

        data = path.read_bytes()
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        # white-ish bg to transparent for cleaner crest
        # only if mostly photo-like with white corners - skip auto for safety
        out = path.with_suffix(".png")
        im.save(out, "PNG")
        if out != path and path.suffix.lower() in (".jpg", ".jpeg"):
            path.unlink(missing_ok=True)
        return out
    except Exception:
        return path


def main():
    LOGHI.mkdir(parents=True, exist_ok=True)

    # league
    league_dest = LOGHI / "serie-a-femminile.png"
    try:
        n = dl(LEAGUE_LOGO_URL, LOGHI / "serie-a-femminile.jpg")
        print(f"LEAGUE ok {n}")
        ensure_png(LOGHI / "serie-a-femminile.jpg")
        # ensure file is serie-a-femminile.png
        jpg = LOGHI / "serie-a-femminile.jpg"
        png = LOGHI / "serie-a-femminile.png"
        if jpg.exists() and not png.exists():
            jpg.rename(png)
        elif jpg.exists() and png.exists():
            # prefer converted
            if png.stat().st_size < 1000:
                ensure_png(jpg)
            jpg.unlink(missing_ok=True)
        print("LEAGUE file", png.stat().st_size if png.exists() else "missing")
    except Exception as e:
        print("LEAGUE FAIL", e)

    # clubs
    for c in FIGC_CLUBS:
        dest = LOGHI / c["file"]
        try:
            # download original ext then normalize to png name
            raw_ext = ".png" if ".png" in c["url"].lower() else ".jpg"
            tmp = LOGHI / (c["id"] + raw_ext)
            n = dl(c["url"], tmp)
            if tmp.suffix.lower() in (".jpg", ".jpeg"):
                ensure_png(tmp)
                tmp = tmp.with_suffix(".png")
            if tmp.name != c["file"]:
                if dest.exists():
                    dest.unlink()
                tmp.rename(dest)
            print(f"OK {c['name']}: {dest.name} ({dest.stat().st_size})")
        except Exception as e:
            print(f"FAIL {c['name']}: {e}")

    # catalog
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    by_name = {t["name"]: t for t in cat["teams"]}
    keep = set()

    for c in FIGC_CLUBS:
        keep.add(c["name"])
        logo = f"immagini/squadre-loghi/{c['file']}"
        t = by_name.get(c["name"])
        if not t:
            t = {
                "id": c["id"],
                "name": c["name"],
                "country": "ITALIA",
                "league": "SERIE A FEMMINILE",
                "city": c["city"],
                "year": "",
                "abbr": c["name"][:3].replace(" ", ""),
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
                "source": "figc.it/serie-a-women",
                "stadium": "",
                "capacity": None,
                "stadiumImage": "immagini/stadi/_default.jpg",
                "stadiumImageSource": "default",
            }
            cat["teams"].append(t)
            by_name[c["name"]] = t
            print("CREATED", c["name"])
        else:
            t["logo"] = logo
            t["league"] = "SERIE A FEMMINILE"
            t["gender"] = "f"
            t["city"] = c["city"]
            t["source"] = "figc.it/serie-a-women"
            print("UPDATED", c["name"], "->", logo)

    # demote / remove from A if not in official 12
    for t in cat["teams"]:
        if t.get("league") == "SERIE A FEMMINILE" and t["name"] not in keep:
            t["league"] = "SERIE B FEMMINILE"
            print("DEMOT to B", t["name"])

    cat["version"] = max(int(cat.get("version") or 24), 25)
    cat.setdefault("stats", {})["serieAFem"] = 12
    cat["stats"]["serieAFemSource"] = "figc.it"
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("DONE catalog v", cat["version"])


if __name__ == "__main__":
    main()
