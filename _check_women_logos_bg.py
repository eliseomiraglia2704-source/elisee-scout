# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image
import json

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
cat = json.loads((ROOT / "data/squadre/catalog.json").read_text(encoding="utf-8"))

for league in ["SERIE A FEMMINILE", "SERIE B FEMMINILE"]:
    print("===", league)
    for t in cat["teams"]:
        if t.get("league") != league:
            continue
        logo = t.get("logo") or ""
        p = ROOT / logo if logo else None
        if not p or not p.exists():
            print(t["name"], "NO FILE")
            continue
        im = Image.open(p).convert("RGBA")
        px = list(im.getdata())
        a0 = sum(1 for *_, a in px if a == 0)
        nw = sum(1 for r, g, b, a in px if a > 200 and r > 245 and g > 245 and b > 245)
        c = im.getpixel((0, 0))
        n = t["name"][:28]
        tr = 100 * a0 / len(px)
        wh = 100 * nw / len(px)
        print(f"  {n:28} {im.size} tr={tr:5.1f}% white={wh:5.1f}% corner={c}")

print("=== LEAGUE")
for name in ["serie-a-femminile.png", "serie-b-femminile.png"]:
    p = ROOT / "immagini/squadre-loghi" / name
    im = Image.open(p).convert("RGBA")
    px = list(im.getdata())
    a0 = sum(1 for *_, a in px if a == 0)
    print(name, im.size, f"tr={100*a0/len(px):.1f}%", "corner", im.getpixel((0, 0)))
