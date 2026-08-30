# -*- coding: utf-8 -*-
"""Organico ufficiale Eccellenza Lazio Girone A 2026/27 + loghi Tuttocampo."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(r"C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
IMG_DIR = Path(
    r"C:\Users\Eliseo Miraglia\.grok\sessions"
    r"\C%3A%5CWINDOWS%5Csystem32\01a052f5-236a-7db0-af7b-f131918b1c4e\assets"
)
LOGO_DIR = ROOT / "immagini" / "squadre-loghi"
DBG = ROOT / "_ecc_logo_debug"
CATALOG = ROOT / "data" / "squadre" / "catalog.json"
MINIG = ROOT / "data" / "squadre" / "minigioco_clubs.json"
FOCUS = ROOT / "focus.html"
AGENTS = ROOT / "campionati-agents.js"

SHOTS = [
    {
        "file": "image-74458964-1bcb-43e9-8210-025cf5b13a24.png",
        "league": "ECCELLENZA · LAZIO · GIRONE A",
        "gid": "lazio-a",
        "title": "Lazio · Girone A",
        "area": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "pairs": [
            (("Astrea", "Roma"), ("Grifone Gialloverde", "Roma")),
            (("Atletico Ardea", "Ardea"), ("Luiss", "Roma")),
            (("Boreale", "Roma"), ("Montespaccato", "Roma")),
            (("Borgo Palidoro", "Fiumicino"), ("Cavese 1919", "Cava de' Tirreni")),
            (("Campus Eur", "Roma"), ("Ottavia", "Roma")),
            (("Civitavecchia", "Civitavecchia"), ("Real Monterotondo", "Monterotondo")),
            (("Colleferro", "Colleferro"), ("Sorianese", "Sora")),
            (("FC Rieti", "Rieti"), ("Tivoli Calcio", "Tivoli")),
            (("Fregene", "Fiumicino"), ("W3 Maccarese", "Fiumicino")),
        ],
    },
]


def slug(s: str) -> str:
    s = s.lower().strip()
    for a, b in [
        ("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"),
        ("'", " "), (".", " "),
    ]:
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:52] or "team"


def abbr(name: str) -> str:
    skip = {"FC", "AS", "US", "SSD", "ASD", "AC", "SC", "GS", "SS", "CITTA", "DI", "CALCIO", "CLUB"}
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in skip]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]


def colors(seed: str):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + ((h >> 16) & 255) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255 - r):02x}{(255 - g):02x}{(255 - b):02x}"


def row_centers(bgr: np.ndarray, n_rows: int) -> list[int]:
    h, w = bgr.shape[:2]
    first = int(h * 0.338)
    last = int(h * 0.812)
    if n_rows <= 1:
        return [first]
    return [int(round(first + i * (last - first) / (n_rows - 1))) for i in range(n_rows)]


def find_logos(bgr: np.ndarray, n_expected: int) -> list[tuple[int, int, int]]:
    h, w = bgr.shape[:2]
    n_rows = n_expected // 2
    ys = row_centers(bgr, n_rows)
    left_x = int(w * 0.132)
    right_x = int(w * 0.550)
    side = 56
    ordered = []
    for y in ys:
        ordered.append((left_x, y, side))
        ordered.append((right_x, y, side))
    return ordered


def crop_logo(bgr: np.ndarray, cx: int, cy: int, side: int) -> Image.Image:
    r = 32
    h, w = bgr.shape[:2]
    x0, y0 = max(0, cx - r), max(0, cy - r)
    x1, y1 = min(w, cx + r), min(h, cy + r)
    cut = bgr[y0:y1, x0:x1]
    rgb = cv2.cvtColor(cut, cv2.COLOR_BGR2RGB)
    im = Image.fromarray(rgb).convert("RGBA")
    arr = np.array(im)
    yy, xx = np.ogrid[: arr.shape[0], : arr.shape[1]]
    cyi, cxi = arr.shape[0] / 2, arr.shape[1] / 2
    rad = min(arr.shape[0], arr.shape[1]) / 2 - 1
    mask = (xx - cxi) ** 2 + (yy - cyi) ** 2 <= rad ** 2
    arr[~mask, 3] = 0
    im = Image.fromarray(arr)
    return im.resize((720, 720), Image.Resampling.LANCZOS)


def make_team(name, league, city, pos, logo_path, sid):
    p, s = colors(sid)
    return {
        "id": sid,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": city.upper(),
        "year": "1920",
        "abbr": abbr(name),
        "gender": "m",
        "pos": pos,
        "pts": 0,
        "played": 0,
        "logo": logo_path,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
        "stadium": "",
        "capacity": None,
        "stadiumImage": "immagini/stadi/_default.jpg",
        "stadiumImageSource": "default",
    }


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def patch_focus(blocks: list[dict]):
    text = FOCUS.read_text(encoding="utf-8")
    for g in blocks:
        lines = [
            f"    G('{g['gid']}', '{js_escape(g['title'])}', '{js_escape(g['area'])}', ["
        ]
        for name, city, logo in g["resolved"]:
            lines.append(
                f"      {{ name: '{js_escape(name)}', city: '{js_escape(city)}', logo: '{js_escape(logo)}' }},"
            )
        lines.append("    ]),")
        block = "\n".join(lines)
        pat = re.compile(
            rf"    G\('{re.escape(g['gid'])}', '{re.escape(g['title'])}', 'Eccellenza ·[^']*', \[[\s\S]*?\n    \]\),",
            re.M,
        )
        m = pat.search(text)
        if not m:
            print("WARN no focus block", g["gid"])
            continue
        text = text[: m.start()] + block + text[m.end() :]
        print("patched focus", g["gid"], "teams", len(g["resolved"]))
    FOCUS.write_text(text, encoding="utf-8")


def patch_agents(blocks: list[dict]):
    t = AGENTS.read_text(encoding="utf-8")
    for g in blocks:
        t = re.sub(
            rf"(campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: '{g['gid']}', title: '[^']+', area: ')[^']+(')",
            rf"\1{g['area']}\2",
            t,
            count=1,
        )
    AGENTS.write_text(t, encoding="utf-8")


def main():
    DBG.mkdir(exist_ok=True)
    LOGO_DIR.mkdir(exist_ok=True)
    extracted = []
    blocks = []

    for shot in SHOTS:
        path = IMG_DIR / shot["file"]
        if not path.exists():
            raise SystemExit(f"MISSING {path}")
        bgr = cv2.imdecode(np.fromfile(str(path), dtype=np.uint8), cv2.IMREAD_COLOR)
        if bgr is None:
            raise SystemExit(f"UNREAD {path}")
        names = []
        cities = []
        for a, b in shot["pairs"]:
            names.extend([a[0], b[0]])
            cities.extend([a[1], b[1]])
        expected = len(names)
        blobs = find_logos(bgr, expected)
        print(shot["file"], bgr.shape, "blobs", len(blobs), "expected", expected)
        dbg = bgr.copy()
        for i, (cx, cy, side) in enumerate(blobs):
            cv2.circle(dbg, (cx, cy), side // 2 + 4, (0, 255, 0), 2)
            cv2.putText(dbg, str(i), (cx - 8, cy + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        cv2.imencode(".jpg", dbg)[1].tofile(str(DBG / (path.stem + "_dbg.jpg")))

        resolved = []
        n = min(len(blobs), len(names))
        for i in range(n):
            cx, cy, side = blobs[i]
            name, city = names[i], cities[i]
            im = crop_logo(bgr, cx, cy, side)
            dest = LOGO_DIR / f"ecc-{slug(name)}.png"
            im.save(dest, "PNG", optimize=True)
            alias = LOGO_DIR / f"{slug(name)}.png"
            if alias != dest:
                im.save(alias, "PNG", optimize=True)
            rel = f"immagini/squadre-loghi/{dest.name}"
            resolved.append((name, city, rel))
            print("  OK", name, dest.name, dest.stat().st_size)
        extracted.extend(resolved)
        blocks.append({**shot, "resolved": resolved})

    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    drop = {s["league"] for s in SHOTS}
    keep = [t for t in cat["teams"] if t.get("league") not in drop]
    new_teams = []
    for g in blocks:
        for i, (name, city, logo) in enumerate(g["resolved"], 1):
            sid = slug(f"ecc-{g['gid']}-{name}")
            new_teams.append(make_team(name, g["league"], city, i, logo, sid))
    cat["teams"] = keep + new_teams
    cat["updatedAt"] = "2026-08-30"
    if isinstance(cat.get("stats"), dict):
        cat["stats"]["total"] = len(cat["teams"])
    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("catalog teams", len(cat["teams"]), "added", len(new_teams))

    if MINIG.exists():
        clubs = json.loads(MINIG.read_text(encoding="utf-8"))
        drop_lg = {s["league"] for s in SHOTS}
        clubs = [c for c in clubs if str(c.get("l") or "") not in drop_lg]
        have = {str(c.get("n") or "").upper() for c in clubs}
        added = 0
        for t in new_teams:
            name = str(t.get("name") or "").strip().upper()
            if not name or name in have:
                continue
            clubs.append({
                "n": name,
                "l": t["league"],
                "o": t.get("logo") or "",
                "t": 5,
                "city": str(t.get("city") or "").title(),
            })
            have.add(name)
            added += 1
        MINIG.write_text(json.dumps(clubs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print("minigioco clubs", len(clubs), "added", added)

    patch_focus(blocks)
    patch_agents(blocks)
    print("DONE", len(extracted))


if __name__ == "__main__":
    main()
