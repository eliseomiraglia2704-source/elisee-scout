# -*- coding: utf-8 -*-
"""Estrae loghi + colori home/away dalle grafiche Serie A Women Athora 2025-26."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
ASSETS = Path(
    r"C:\Users\Eliseo Miraglia\.grok\sessions\C%3A%5CWINDOWS%5Csystem32\019fd66d-b937-7bb1-9741-07509105990a\assets"
)
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
OUT_DIR = LOGHI / "_inbox-femminile"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ordine immagini (mtime) e squadre per riga (alto → basso)
SHEETS = [
    {
        "file": "image-c4e0209f-3079-4c61-b7b4-675fa1a0074d.png",
        "teams": [
            ("juventus-women", "JUVENTUS WOMEN", "#111111", "#ffffff"),
            ("roma-women", "ROMA WOMEN", "#8B1A2B", "#F5A623"),
            ("inter-women", "INTER WOMEN", "#0A1E5A", "#0B6BCB"),
        ],
    },
    {
        "file": "image-d83780de-fffb-4519-bb6e-48dfc4a3865f.png",
        "teams": [
            ("fiorentina-women", "FIORENTINA WOMEN", "#5B2C8A", "#FFFFFF"),
            ("milan-women", "MILAN WOMEN", "#C8102E", "#000000"),
            ("como-women", "COMO WOMEN", "#111111", "#FFFFFF"),
        ],
    },
    {
        "file": "image-1ad60b07-188c-4624-8064-e7a2e3a3b239.png",
        "teams": [
            ("lazio-women", "LAZIO WOMEN", "#87CEEB", "#FFFFFF"),
            ("sassuolo-women", "SASSUOLO WOMEN", "#1B7A3D", "#111111"),
            ("napoli-women", "NAPOLI WOMEN", "#6EC1E4", "#FFFFFF"),
        ],
    },
    {
        "file": "image-33554010-1675-4bd8-9258-83805c24509e.png",
        "teams": [
            ("parma-women", "PARMA WOMEN", "#1A1A1A", "#FFD100"),
            ("genoa-women", "GENOA WOMEN", "#8B1A1A", "#0B1F4A"),
            ("ternana-women", "TERNANA WOMEN", "#C8102E", "#1B7A3D"),
        ],
    },
]


def trim_transparent_or_bg(im: Image.Image, bg_tol=28) -> Image.Image:
    """Ritaglia margini grigi chiari."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg(x, y):
        r, g, b, a = px[x, y]
        if a < 20:
            return True
        # grigio chiaro / bordo
        if abs(r - g) < 18 and abs(g - b) < 18 and r > 160:
            return True
        return False

    # find content bbox
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if not is_bg(x, y):
                if x < minx:
                    minx = x
                if y < miny:
                    miny = y
                if x > maxx:
                    maxx = x
                if y > maxy:
                    maxy = y
    if maxx <= minx or maxy <= miny:
        return im
    pad = 4
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w - 1, maxx + pad)
    maxy = min(h - 1, maxy + pad)
    return im.crop((minx, miny, maxx + 1, maxy + 1))


def sample_kit_color(im: Image.Image, box) -> str:
    """Media colore body maglia (esclude bianco/nero estremi se possibile)."""
    crop = im.crop(box).convert("RGB")
    w, h = crop.size
    px = crop.load()
    rs = gs = bs = n = 0
    for y in range(int(h * 0.25), int(h * 0.75), 2):
        for x in range(int(w * 0.25), int(w * 0.75), 2):
            r, g, b = px[x, y]
            s = r + g + b
            if s < 40 or s > 720:
                continue
            rs += r
            gs += g
            bs += b
            n += 1
    if n < 10:
        # fallback any
        for y in range(0, h, 3):
            for x in range(0, w, 3):
                r, g, b = px[x, y]
                rs += r
                gs += g
                bs += b
                n += 1
    if n == 0:
        return "#808080"
    return "#{:02x}{:02x}{:02x}".format(rs // n, gs // n, bs // n)


def extract_sheet(path: Path, teams_meta: list):
    im = Image.open(path).convert("RGBA")
    W, H = im.size
    # layout empirico (header + 3 righe)
    header_h = int(H * 0.118)
    row_h = (H - header_h) // 3
    logo_w = int(W * 0.28)
    # area maglie
    kits_x0 = int(W * 0.30)
    kit_w = int((W - kits_x0 - 20) / 3)

    results = []

    # league logo top-right in header
    league_box = (
        int(W * 0.72),
        int(H * 0.02),
        int(W * 0.92),
        int(H * 0.115),
    )
    league = trim_transparent_or_bg(im.crop(league_box))
    league_path = LOGHI / "serie-a-femminile.png"
    # prefer square-ish logo on transparent-ish bg
    league = league.convert("RGBA")
    league.save(league_path)
    league.save(OUT_DIR / "serie-a-femminile.png")
    print("league logo", league_path, league.size)

    for i, (slug, cat_name, home_fb, away_fb) in enumerate(teams_meta):
        y0 = header_h + i * row_h
        y1 = header_h + (i + 1) * row_h
        # logo area left
        logo_box = (
            int(W * 0.04),
            y0 + int(row_h * 0.12),
            int(W * 0.28),
            y0 + int(row_h * 0.78),
        )
        logo = trim_transparent_or_bg(im.crop(logo_box))
        # pad to square transparent
        lw, lh = logo.size
        side = max(lw, lh)
        sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        sq.paste(logo, ((side - lw) // 2, (side - lh) // 2), logo if logo.mode == "RGBA" else None)
        logo_file = LOGHI / f"{slug}.png"
        sq.save(logo_file)
        sq.save(OUT_DIR / f"{slug}.png")

        # home kit (first of three)
        home_box = (
            kits_x0 + 8,
            y0 + int(row_h * 0.12),
            kits_x0 + kit_w - 8,
            y0 + int(row_h * 0.78),
        )
        away_box = (
            kits_x0 + kit_w + 8,
            y0 + int(row_h * 0.12),
            kits_x0 + 2 * kit_w - 8,
            y0 + int(row_h * 0.78),
        )
        home_c = sample_kit_color(im, home_box) or home_fb
        away_c = sample_kit_color(im, away_box) or away_fb
        # if home too light/gray, use fallback
        def ok_color(c, fb):
            c = c or fb
            r, g, b = int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)
            if abs(r - g) < 12 and abs(g - b) < 12 and r > 170:
                return fb
            return c

        home_c = ok_color(home_c, home_fb)
        away_c = ok_color(away_c, away_fb)

        results.append(
            {
                "slug": slug,
                "name": cat_name,
                "logo": f"immagini/squadre-loghi/{slug}.png",
                "home": home_c,
                "away": away_c,
                "primary": home_c,
                "secondary": away_c,
            }
        )
        print(f"OK {cat_name}: logo={logo_file.name} home={home_c} away={away_c}")

    return results


def ensure_team(cat, name, league, city, data):
    """Crea o aggiorna squadra femminile."""
    teams = cat["teams"]
    t = next((x for x in teams if x["name"] == name), None)
    if not t:
        # create
        tid = data["slug"]
        t = {
            "id": tid,
            "name": name,
            "country": "ITALIA",
            "league": league,
            "city": city,
            "year": "",
            "abbr": name.split()[0][:3].upper(),
            "gender": "f",
            "pos": 0,
            "pts": 0,
            "played": 0,
            "logo": data["logo"],
            "primary": data["primary"],
            "secondary": data["secondary"],
            "accent": "#ffffff",
            "home": {"body": data["home"], "sleeve": data["home"]},
            "away": {"body": data["away"], "sleeve": data["home"]},
            "source": "serie-a-women-athora-2025-26",
            "stadium": "",
            "capacity": None,
            "stadiumImage": "immagini/stadi/_default.jpg",
            "stadiumImageSource": "default",
        }
        teams.append(t)
        print("CREATED", name)
    else:
        t["logo"] = data["logo"]
        t["primary"] = data["primary"]
        t["secondary"] = data["secondary"]
        t["home"] = {"body": data["home"], "sleeve": data["home"]}
        t["away"] = {"body": data["away"], "sleeve": data["home"]}
        t["gender"] = "f"
        t["league"] = league
        print("UPDATED", name)
    return t


def main():
    # resolve files by partial name if exact missing
    files = {p.name: p for p in ASSETS.glob("image-*.png")}
    all_results = []
    for sheet in SHEETS:
        path = ASSETS / sheet["file"]
        if not path.exists():
            # fuzzy
            hits = [p for p in ASSETS.glob("image-*.png") if sheet["file"].split("-")[1][:8] in p.name]
            if hits:
                path = hits[0]
            else:
                # use latest 4 by matching order of provided assets
                print("MISSING", sheet["file"])
                continue
        print("SHEET", path.name)
        all_results.extend(extract_sheet(path, sheet["teams"]))

    cat = json.loads(CAT.read_text(encoding="utf-8"))

    city_map = {
        "JUVENTUS WOMEN": "TORINO",
        "ROMA WOMEN": "ROMA",
        "INTER WOMEN": "MILANO",
        "FIORENTINA WOMEN": "FIRENZE",
        "MILAN WOMEN": "MILANO",
        "COMO WOMEN": "COMO",
        "LAZIO WOMEN": "ROMA",
        "SASSUOLO WOMEN": "SASSUOLO",
        "NAPOLI WOMEN": "NAPOLI",
        "PARMA WOMEN": "PARMA",
        "GENOA WOMEN": "GENOVA",
        "TERNANA WOMEN": "TERNI",
    }

    # Serie A Femminile 2025-26 from graphics (12 teams)
    serie_a = {r["name"] for r in all_results}
    for r in all_results:
        league = "SERIE A FEMMINILE"
        # Ternana was B in old catalog - graphics show it in A Women sheet
        ensure_team(cat, r["name"], league, city_map.get(r["name"], ""), r)

    # Move teams no longer in the 12 out of Serie A Femminile if still marked A
    keep = serie_a
    for t in cat["teams"]:
        if t.get("league") == "SERIE A FEMMINILE" and t["name"] not in keep:
            # demote to B or leave B
            if t["name"] in ("SAMPDORIA WOMEN", "POMIGLIANO WOMEN"):
                t["league"] = "SERIE B FEMMINILE"
                print("DEMOT to B", t["name"])

    # Fix Ternana if was B-only
    tern = next((x for x in cat["teams"] if x["name"] == "TERNANA WOMEN"), None)
    if tern:
        tern["league"] = "SERIE A FEMMINILE"
        tern["gender"] = "f"

    cat["version"] = max(int(cat.get("version") or 18), 19)
    cat.setdefault("stats", {})
    cat["stats"]["serieAFemLogos"] = len(all_results)
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("DONE teams", len(all_results), "catalog v", cat["version"])


if __name__ == "__main__":
    main()
