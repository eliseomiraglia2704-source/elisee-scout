# -*- coding: utf-8 -*-
import re, ssl, urllib.request
from pathlib import Path

OUT = Path(r"C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO\immagini\squadre-loghi")
CTX = ssl.create_default_context()
UA = {"User-Agent": "Mozilla/5.0", "Accept": "*/*", "Referer": "https://football-logos.cc/"}


def fetch(u):
    req = urllib.request.Request(u, headers=UA)
    return urllib.request.urlopen(req, timeout=25, context=CTX).read()


direct = [
    ("borussia-dortmund.png", "https://assets.football-logos.cc/logos/germany/512x512/borussia-dortmund.ebd95525.png"),
    ("feyenoord.png", "https://assets.football-logos.cc/logos/netherlands/512x512/feyenoord.a7fa4a9f.png"),
    ("boca-juniors.png", "https://assets.football-logos.cc/logos/argentina/512x512/boca-juniors.ea01d4a3.png"),
    ("chivas.png", "https://assets.football-logos.cc/logos/mexico/512x512/cd-guadalajara.08214880.png"),
    ("english-premier-league.png", "https://assets.football-logos.cc/logos/england/512x512/english-premier-league.b597f797.png"),
]
for fn, url in direct:
    dest = OUT / fn
    if dest.exists() and dest.stat().st_size > 800:
        print("HAVE", fn)
        continue
    try:
        data = fetch(url)
        dest.write_bytes(data)
        print("OK", fn, len(data))
    except Exception as e:
        print("IMG", fn, e)
