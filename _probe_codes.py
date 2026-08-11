import re, ssl, urllib.request, json, hashlib
from pathlib import Path
from collections import Counter

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGO = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
MAP = ROOT / "data" / "squadre" / "logo-map.json"
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html",
  "Accept-Language": "it-IT,it;q=0.9",
}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8", "replace")

def feed(html, key):
    m = re.search(rf'initialFeeds\["{key}"\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`', html)
    if not m:
        m = re.search(rf"initialFeeds\['{key}'\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`", html)
    return m.group(1) if m else ""

# dump codes from serie a fixtures
html = get("https://www.diretta.it/serie-a/calendario/")
data = feed(html, "fixtures") or feed(html, "summary-fixtures")
print("feed len", len(data))
# first event chunk
print("sample", data[:500])
# count field codes
codes = re.findall(r"¬([A-Z0-9]{1,4})÷", data)
print("top codes", Counter(codes).most_common(40))
# try all codes that look like team names values
for code, cnt in Counter(codes).most_common(30):
    vals = re.findall(rf"¬{code}÷([^¬~]+)", data)
    # filter human names
    human = [v for v in vals if re.search(r"[a-zA-ZÀ-ú]{3,}", v) and not re.fullmatch(r"[A-Za-z0-9]{8}", v) and ".png" not in v]
    human = list(dict.fromkeys(human))
    if human and len(human) >= 5:
        print(f"CODE {code} n={len(human)} sample={human[:25]}")