import json, re, ssl, urllib.request
from pathlib import Path
ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
CATALOG = ROOT / "data" / "squadre" / "catalog.json"
MAP = ROOT / "data" / "squadre" / "logo-map.json"
CTX = ssl.create_default_context()
UA = {"User-Agent":"Mozilla/5.0","Referer":"https://football-logos.cc/","Accept":"*/*"}
slug = "teramo-calcio-1913"
try:
    req = urllib.request.Request(f"https://football-logos.cc/italy/{slug}/", headers=UA)
    html = urllib.request.urlopen(req, timeout=40, context=CTX).read().decode("utf-8","replace")
    m = re.search(rf"https://assets\.football-logos\.cc/logos/italy/512x512/{slug}\.[a-f0-9]+\.png", html)
    print("url", m.group(0) if m else None)
    if m:
        data = urllib.request.urlopen(urllib.request.Request(m.group(0), headers=UA), timeout=40, context=CTX).read()
        (OUT / f"{slug}.png").write_bytes(data)
        print("saved", len(data))
        file = f"immagini/squadre-loghi/{slug}.png"
        cat = json.loads(CATALOG.read_text(encoding="utf-8"))
        n=0
        for t in cat["teams"]:
            if t.get("id") == slug or "TERAMO" in (t.get("name") or ""):
                t["logo"] = file
                n += 1
        print("patched", n)
        cat["stats"]["logos"] = sum(1 for t in cat["teams"] if t.get("logo"))
        cat["stats"]["proLogos"] = sum(1 for t in cat["teams"] if t.get("logo") and any((t.get("league") or "").startswith(x) for x in ("SERIE A","SERIE B","SERIE C","SERIE D")))
        CATALOG.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
except Exception as e:
    print("teramo err", e)

# cache bump
js = ROOT / "squadre-select.js"
t = js.read_text(encoding="utf-8")
t = re.sub(r"catalog\.json\?v=[^\"]+", "catalog.json?v=20260806_LOGOS", t)
js.write_text(t, encoding="utf-8")
hpath = ROOT / "index.html"
h = hpath.read_text(encoding="utf-8")
h = re.sub(r"squadre-select\.(js|css)\?v=[^\"]+", r"squadre-select.\1?v=20260806_LOGOS", h)
hpath.write_text(h, encoding="utf-8")
print("cache ok")
cat = json.loads(CATALOG.read_text(encoding="utf-8"))
print("stats", cat.get("stats"))
print("png", len(list(OUT.glob("*.png"))))
# sample pro with logos
pro = [t for t in cat["teams"] if (t.get("league") or "").startswith("SERIE A")]
print("serieA first", [(t["name"], bool(t.get("logo"))) for t in pro[:5]])