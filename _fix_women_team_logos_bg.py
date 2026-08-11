# -*- coding: utf-8 -*-
"""
Rimuove lo sfondo grigio/bianco FIGC dai loghi squadre Serie A/B Femminile.
PNG RGBA con trasparenza vera (flood fill dai bordi, non tocca il bianco interno degli stemmi).
"""
from __future__ import annotations

import json
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGHI = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
BAK_DIR = LOGHI / "_bak_women_bg"


def is_figc_bg(r: int, g: int, b: int) -> bool:
    """Sfondo tipico FIGC: bianco o grigio-azzurro chiaro (~#E1E8F0)."""
    # pure white
    if r >= 248 and g >= 248 and b >= 248:
        return True
    # light cool gray / blue-gray plate
    if r >= 200 and g >= 210 and b >= 220 and max(r, g, b) - min(r, g, b) <= 35:
        return True
    # slightly darker plate variants
    if r >= 210 and g >= 218 and b >= 228 and abs(r - g) <= 20 and abs(g - b) <= 20:
        return True
    # luminance high + low saturation
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    sat = max(r, g, b) - min(r, g, b)
    if lum >= 215 and sat <= 28:
        return True
    return False


def flood_remove_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x]:
            r, g, b, a = px[x, y]
            if a > 0 and is_figc_bg(r, g, b):
                visited[y][x] = True
                q.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                rr, gg, bb, aa = px[nx, ny]
                if aa > 0 and is_figc_bg(rr, gg, bb):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # soft anti-alias: near-bg fringe at logo edge
    # re-scan: semi-transparent for almost-bg pixels adjacent to transparent
    # (helps JPG compression fringe)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if not is_figc_bg(r, g, b):
                # near-white fringe inside color edges
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                sat = max(r, g, b) - min(r, g, b)
                if lum >= 200 and sat <= 40:
                    # only if neighbor is transparent
                    near_t = False
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                            near_t = True
                            break
                    if near_t:
                        # fade based on how bg-like
                        t = min(1.0, max(0.0, (lum - 200) / 55.0))
                        px[x, y] = (r, g, b, int(a * (1.0 - t * 0.85)))

    return im


def crop_alpha(im: Image.Image, pad: int = 6) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def process_file(path: Path, force: bool = False) -> str:
    if not path.exists():
        return "missing"
    im0 = Image.open(path).convert("RGBA")
    # skip if already mostly transparent
    px = list(im0.getdata())
    a0 = sum(1 for *_, a in px if a == 0) / max(1, len(px))
    if a0 > 0.15 and not force:
        return "skip-already-transparent"

    # only process if corners look like FIGC plate or pure white
    corners = [
        im0.getpixel((0, 0)),
        im0.getpixel((im0.width - 1, 0)),
        im0.getpixel((0, im0.height - 1)),
        im0.getpixel((im0.width - 1, im0.height - 1)),
    ]
    if not any(is_figc_bg(r, g, b) for r, g, b, *_ in corners):
        return "skip-no-bg"

    BAK_DIR.mkdir(parents=True, exist_ok=True)
    bak = BAK_DIR / path.name
    if not bak.exists():
        shutil.copy2(path, bak)

    out = flood_remove_bg(Image.open(bak if bak.exists() else path))
    out = crop_alpha(out, pad=8)
    # keep reasonable size
    m = max(out.size)
    if m > 800:
        s = 800 / m
        out = out.resize(
            (max(1, int(out.width * s)), max(1, int(out.height * s))),
            Image.Resampling.LANCZOS,
        )
    out.save(path, "PNG", optimize=True)
    px2 = list(out.getdata())
    a1 = sum(1 for *_, a in px2 if a == 0) / max(1, len(px2))
    return f"ok tr={a1*100:.0f}% {out.size}"


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    files: set[Path] = set()
    for t in cat["teams"]:
        lg = t.get("league") or ""
        if lg in ("SERIE A FEMMINILE", "SERIE B FEMMINILE"):
            logo = t.get("logo") or ""
            if logo:
                files.add(ROOT / logo)

    # also como-1907-women if present
    for extra in ["como-1907-women.png", "como-women.png"]:
        p = LOGHI / extra
        if p.exists():
            files.add(p)

    print(f"Processing {len(files)} team logos...")
    ok = skip = fail = 0
    for p in sorted(files, key=lambda x: x.name):
        try:
            status = process_file(p)
            print(f"  {p.name}: {status}")
            if status.startswith("ok"):
                ok += 1
            elif status.startswith("skip"):
                skip += 1
            else:
                fail += 1
        except Exception as e:
            print(f"  {p.name}: FAIL {e}")
            fail += 1

    # re-apply league logos fix if bak exists
    print(f"DONE ok={ok} skip={skip} fail={fail}")


if __name__ == "__main__":
    main()
