# -*- coding: utf-8 -*-
import io
import re
import ssl
import urllib.request
from pathlib import Path
from PIL import Image

CTX = ssl.create_default_context()
UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://football-logos.cc/"}
OUT = Path(__file__).resolve().parent / "immagini" / "nazioni-loghi"

TRIES = {
    "IE": [
        "https://football-logos.cc/republic-of-ireland/republic-of-ireland-national-team/",
        "https://football-logos.cc/republic-of-ireland/",
    ],
    "CI": [
        "https://football-logos.cc/cote-divoire/cote-divoire-national-team/",
        "https://football-logos.cc/ivory-coast/cote-divoire-national-team/",
        "https://football-logos.cc/cote-d-ivoire/cote-d-ivoire-national-team/",
    ],
    "AE": [
        "https://football-logos.cc/uae/uae-national-team/",
        "https://football-logos.cc/united-arab-emirates/uae-national-team/",
        "https://football-logos.cc/uae/",
    ],
}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25, context=CTX) as r:
        return r.read()


for code, pages in TRIES.items():
    ok = False
    for page in pages:
        try:
            html = get(page).decode("utf-8", "replace").replace("&quot;", '"')
            print("PAGE", code, page, len(html))
            ms = re.findall(
                r"https://assets\.football-logos\.cc/logos/[^\"'\s]+512x512/[^\"'\s]+\.png",
                html,
            )
            ms = [u for u in ms if "monochrome" not in u.lower()]
            print("  hits", len(ms), ms[:2])
            if not ms:
                continue
            data = get(ms[0])
            im = Image.open(io.BytesIO(data)).convert("RGBA")
            im.thumbnail((128, 128), Image.Resampling.LANCZOS)
            dest = OUT / (code.lower() + ".png")
            im.save(dest, "PNG", optimize=True)
            print("OK", code, dest.stat().st_size)
            ok = True
            break
        except Exception as e:
            print("fail", code, page, type(e).__name__, e)
    if not ok:
        print("MISS", code)
