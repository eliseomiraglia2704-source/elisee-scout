import re, ssl, urllib.request
from pathlib import Path
ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
OUT.mkdir(parents=True, exist_ok=True)
CTX = ssl.create_default_context()
UA = {"User-Agent":"Mozilla/5.0","Accept":"*/*","Referer":"https://football-logos.cc/"}
for slug in ["serie-a","serie-b","serie-c","serie-d"]:
    page = f"https://football-logos.cc/italy/{slug}/"
    req = urllib.request.Request(page, headers=UA)
    html = urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8","replace")
    m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/512x512/{slug}\.[a-f0-9]+\.png', html)
    print(slug, m.group(0) if m else "NO URL")
    if m:
        data = urllib.request.urlopen(urllib.request.Request(m.group(0), headers=UA), timeout=25, context=CTX).read()
        dest = OUT / f"{slug}.png"
        dest.write_bytes(data)
        print("  saved", len(data), dest)