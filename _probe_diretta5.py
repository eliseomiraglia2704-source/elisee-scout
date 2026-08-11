import re, ssl, urllib.request
from pathlib import Path
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html",
  "Accept-Language": "it-IT,it;q=0.9",
}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8", "replace")

def extract_feed_block(html, key):
    # data: `....`
    m = re.search(rf'initialFeeds\["{key}"\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`', html)
    if not m:
        m = re.search(rf"initialFeeds\['{key}'\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`", html)
    return m.group(1) if m else ""

def parse_teams_from_feed(data):
    # common flashscore participant names: PX÷ home, PY÷ away or AE/AF
    names = []
    for code in ["PX", "PY", "AE", "AF", "FH", "FK", "WU", "WV"]:
        names += re.findall(rf"¬{code}÷([^¬~]+)", data)
    # also ~AA÷ patterns
    names += re.findall(r"÷([A-Z][A-Za-zÀ-ú0-9 .'\-]{2,35})¬", data)
    # filter junk
    junk = {"ITALIA", "Serie A", "Serie B", "Serie C", "PROGRAMMA", "RISULTATI"}
    clean = []
    seen = set()
    for n in names:
        n = n.strip()
        if len(n) < 3 or n in junk: continue
        if n.upper() in junk: continue
        if re.match(r"^\d", n): continue
        if n not in seen:
            seen.add(n)
            clean.append(n)
    return clean

pages = {
  "SERIE A": "https://www.diretta.it/serie-a/",
  "SERIE B": "https://www.diretta.it/serie-b/",
  "SERIE C · GIRONE A": "https://www.diretta.it/calcio/italia/serie-c-girone-a/",
  "SERIE C · GIRONE B": "https://www.diretta.it/calcio/italia/serie-c-girone-b/",
  "SERIE C · GIRONE C": "https://www.diretta.it/calcio/italia/serie-c-girone-c/",
}
# also calendar pages often list more teams
pages_cal = {k: v.rstrip("/") + "/calendario/" for k,v in pages.items()}
pages_res = {k: v.rstrip("/") + "/risultati/" for k,v in pages.items()}

all_out = {}
for label, url in list(pages.items()) + list(pages_cal.items()) + list(pages_res.items()):
    try:
        html = get(url)
    except Exception as e:
        print("ERR", label, url, e)
        continue
    teams = set()
    for key in ["summary-results", "summary-fixtures", "results", "fixtures"]:
        data = extract_feed_block(html, key)
        if data:
            t = parse_teams_from_feed(data)
            teams.update(t)
            print(label, key, "feed len", len(data), "teams", len(t))
    # also scrape title/alt for clubs
    for m in re.findall(r'title="([^"]{3,40})"', html):
        if any(x in m.lower() for x in ["vs", " - ", "classifica", "risultati"]):
            continue
    print("TOTAL", label, len(teams), sorted(teams)[:30])
    base = label.split(" CAL")[0] if " CAL" in label else label
    # merge into all_out by base league from pages keys
    if label in pages:
        all_out[label] = sorted(teams)

# try archive last season for full tables
print("\n=== ARCHIVE check ===")
for url in [
  "https://www.diretta.it/serie-a/archivio/",
  "https://www.diretta.it/serie-b/archivio/",
]:
    html = get(url)
    # season links
    links = re.findall(r'href="(/serie-[ab]/archivio/[^"]+)"', html)
    print(url, "archive links", links[:15])
    # seasons
    seasons = re.findall(r'20\d{2}/20\d{2}', html)
    print(" seasons", list(dict.fromkeys(seasons))[:10])

Path = __import__("pathlib").Path
Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO\data\squadre\diretta_probe.json").write_text(
  __import__("json").dumps(all_out, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("saved probe")