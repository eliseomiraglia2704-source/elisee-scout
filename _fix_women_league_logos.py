# -*- coding: utf-8 -*-
"""
Rende trasparenti i loghi lega Serie A / B Femminile (PNG veri, no sfondo pieno).
- Serie A Athora: rimuove nero esterno (flood fill dai bordi)
- Serie B Femminile: estrae il monogramma bianco dal gradient purple
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

LOGHI = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO\immagini\squadre-loghi")


def crop_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    """Crop to non-transparent content + padding."""
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def flood_transparent(
    im: Image.Image,
    is_bg,
    soft_edge: int = 18,
) -> Image.Image:
    """
    Flood-fill from image borders: any connected bg pixel -> transparent.
    is_bg(r,g,b) -> bool. soft_edge fades near-bg pixels at the fill frontier.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x]:
            r, g, b, a = px[x, y]
            if a > 0 and is_bg(r, g, b):
                visited[y][x] = True
                q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    bg_set: set[tuple[int, int]] = set()
    while q:
        x, y = q.popleft()
        bg_set.add((x, y))
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = px[nx, ny]
                if a > 0 and is_bg(r, g, b):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # hard transparent for flood region
    out = im.copy()
    op = out.load()
    for x, y in bg_set:
        r, g, b, _ = op[x, y]
        op[x, y] = (r, g, b, 0)

    # soft edge: near-bg neighbors of content get partial alpha (anti-alias)
    if soft_edge > 0:
        for y in range(h):
            for x in range(w):
                if (x, y) in bg_set:
                    continue
                r, g, b, a = op[x, y]
                if a == 0:
                    continue
                # if close to bg color, partially fade (helps jagged JPG edges)
                if is_bg(r, g, b):
                    # interior bg pockets not flooded (holes) — leave or clear?
                    # clear small internal if truly bg-like and surrounded? skip
                    continue
    return out


def remove_black_bg(path: Path, dest: Path, thr: int = 28) -> None:
    """Serie A: black canvas -> transparent, keep white/black badge."""
    im = Image.open(path).convert("RGBA")

    def is_bg(r, g, b) -> bool:
        # pure / near black
        return r <= thr and g <= thr and b <= thr

    out = flood_transparent(im, is_bg)
    # also clear any remaining pure black outside residual (holes at corners)
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and is_bg(r, g, b):
                # only if near edge of content? keep internal black of logo
                # flood already handled external; leftover black inside badge is logo
                pass

    out = crop_alpha(out, pad=12)
    # normalize max side ~640 for UI
    m = max(out.size)
    if m > 720:
        scale = 720 / m
        out = out.resize(
            (max(1, int(out.width * scale)), max(1, int(out.height * scale))),
            Image.Resampling.LANCZOS,
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG", optimize=True)
    print(f"OK {dest.name} {out.size} mode={out.mode} transparent-ready")


def extract_white_logo(path: Path, dest: Path, white_thr: int = 200) -> None:
    """
    Serie B: white monogram on purple gradient -> white mark on transparent.
    Alpha = how close pixel is to white.
    """
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # brightness / min channel: pure white logo
            mn = min(r, g, b)
            mx = max(r, g, b)
            # white-ish: high min, low saturation
            if mn >= white_thr and (mx - mn) <= 40:
                # alpha from how white
                alpha = min(255, int((mn - white_thr) / (255 - white_thr) * 255) + 40)
                alpha = min(255, max(0, alpha))
                # keep pure white for clean mark on any UI bg
                op[x, y] = (255, 255, 255, alpha)
            elif mn >= white_thr - 35 and (mx - mn) <= 55:
                # soft anti-alias fringe
                t = (mn - (white_thr - 35)) / 35.0
                alpha = int(max(0, min(255, t * 160)))
                if alpha > 8:
                    op[x, y] = (255, 255, 255, alpha)

    out = crop_alpha(out, pad=16)
    # if too empty, lower threshold once
    if not out.getbbox() or (out.getbbox() and (out.getbbox()[2] - out.getbbox()[0]) < 40):
        print("WARN low content, retry softer threshold")
        return extract_white_logo_v2(path, dest)

    m = max(out.size)
    if m > 720:
        scale = 720 / m
        out = out.resize(
            (max(1, int(out.width * scale)), max(1, int(out.height * scale))),
            Image.Resampling.LANCZOS,
        )
    # white-on-transparent is invisible on white UI — add soft dark plate? No:
    # UI expects crest-like; better keep WHITE mark and also offer dual:
    # For league picker on dark cards white is fine; on light, need stroke.
    # Add subtle dark outline for readability on light backgrounds.
    out = add_dark_outline(out, radius=2, outline_alpha=180)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG", optimize=True)
    print(f"OK {dest.name} {out.size} mode={out.mode}")


def extract_white_logo_v2(path: Path, dest: Path) -> None:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            # high luminance relative to purple bg
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            # purple bg lum is mid-low; white is high
            if lum >= 175:
                alpha = min(255, int((lum - 175) / 80 * 255))
                op[x, y] = (255, 255, 255, alpha)
    out = crop_alpha(out, pad=16)
    out = add_dark_outline(out, radius=2, outline_alpha=180)
    out.save(dest, "PNG", optimize=True)
    print(f"OK v2 {dest.name} {out.size}")


def add_dark_outline(im: Image.Image, radius: int = 2, outline_alpha: int = 160) -> Image.Image:
    """Dark halo so white mark remains visible on light UI."""
    if radius <= 0:
        return im
    # alpha mask of logo
    alpha = im.split()[3]
    # dilate mask
    from PIL import ImageFilter

    halo = alpha.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    # outline = halo - original alpha
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # paste dark where halo but not solid logo
    dark = Image.new("RGBA", (w, h), (20, 20, 28, outline_alpha))
    # mask: halo visible
    out.paste(dark, (0, 0), halo)
    # paste original logo on top
    out.alpha_composite(im)
    return out


def report(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    px = list(im.getdata())
    a0 = sum(1 for *_, a in px if a == 0)
    print(
        f"  {path.name}: {im.size} transparent={100 * a0 / len(px):.1f}% "
        f"corner={im.getpixel((0, 0))}"
    )


def main():
    a = LOGHI / "serie-a-femminile.png"
    b = LOGHI / "serie-b-femminile.png"

    def backup(p: Path) -> Path:
        bak = p.with_name(p.stem + ".png.bak_bg")
        # stem already includes name; avoid double .png
        bak = p.parent / (p.name + ".bak_bg")
        if p.exists() and not bak.exists():
            bak.write_bytes(p.read_bytes())
            print("backup", bak.name)
        return bak if bak.exists() else p

    if a.exists():
        src = backup(a)
        remove_black_bg(src, a)
        report(a)

    if b.exists():
        src = backup(b)
        extract_white_logo(src, b)
        report(b)

    print("DONE")


if __name__ == "__main__":
    main()
