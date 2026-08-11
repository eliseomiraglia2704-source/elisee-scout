import re, ssl, urllib.request, json, hashlib
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGO = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
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

def teams_from_fixtures(data):
    # PX home, PY away - real display names
    names = re.findall(r"¬PX÷([^¬~]+)¬", data) + re.findall(r"¬PY÷([^¬~]+)¬", data)
    # fallback AE/AF
    if len(set(names)) < 10:
        names += re.findall(r"¬AE÷([^¬~]+)¬", data) + re.findall(r"¬AF÷([^¬~]+)¬", data)
    seen = []
    s = set()
    for n in names:
        n = n.strip()
        if not n or n in s: continue
        # skip ids/codes
        if re.fullmatch(r"[A-Z0-9]{2,4}", n): continue
        if re.fullmatch(r"[A-Za-z0-9]{8}", n): continue
        if ".png" in n or "/" in n: continue
        s.add(n)
        seen.append(n)
    return seen

PAGES = {
  "SERIE A": "https://www.diretta.it/serie-a/calendario/",
  "SERIE B": "https://www.diretta.it/serie-b/calendario/",
  "SERIE C · GIRONE A": "https://www.diretta.it/calcio/italia/serie-c-girone-a/calendario/",
  "SERIE C · GIRONE B": "https://www.diretta.it/calcio/italia/serie-c-girone-b/calendario/",
  "SERIE C · GIRONE C": "https://www.diretta.it/calcio/italia/serie-c-girone-c/calendario/",
}

diretta = {}
for league, url in PAGES.items():
    html = get(url)
    data = feed(html, "fixtures") or feed(html, "summary-fixtures")
    teams = teams_from_fixtures(data)
    # also try results page merge
    try:
        html2 = get(url.replace("/calendario/", "/risultati/"))
        data2 = feed(html2, "results") or feed(html2, "summary-results") or feed(html2, "fixtures")
        for t in teams_from_fixtures(data2):
            if t not in teams:
                teams.append(t)
    except Exception as e:
        print("results fail", league, e)
    diretta[league] = teams
    print(league, len(teams), teams)

# map logo files
logo_files = {p.stem: f"immagini/squadre-loghi/{p.name}" for p in LOGO.glob("*.png") if p.stat().st_size > 800}

def slugify(name):
    s = name.lower()
    for a,b in [("à","a"),("è","e"),("é","e"),("ì","i"),("ò","o"),("ù","u"),("ü","u"),("ö","o"),("’","")]:
        s = s.replace(a,b)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

# aliases diretta name -> logo slug
ALIASES = {
    "inter": "inter", "milan": "milan", "juventus": "juventus", "napoli": "napoli",
    "roma": "roma", "lazio": "lazio", "atalanta": "atalanta", "fiorentina": "fiorentina",
    "bologna": "bologna", "torino": "torino", "genoa": "genoa", "udinese": "udinese",
    "cagliari": "cagliari", "lecce": "lecce", "parma": "parma", "como": "como-1907",
    "como 1907": "como-1907", "sassuolo": "sassuolo", "venezia": "venezia",
    "frosinone": "frosinone", "monza": "monza", "hellas verona": "verona", "verona": "verona",
    "cremonese": "cremonese", "pisa": "pisa", "empoli": "empoli",
    "palermo": "palermo", "bari": "bari", "spezia": "spezia", "catanzaro": "catanzaro",
    "cesena": "cesena", "modena": "modena", "sampdoria": "sampdoria", "padova": "padova",
    "carrarese": "carrarese", "mantova": "mantova-1911", "arezzo": "arezzo", "ascoli": "ascoli",
    "benevento": "benevento", "avellino": "us-avellino-1912", "juve stabia": "juve-stabia",
    "sudtirol": "suditrol", "südtirol": "suditrol", "virtus entella": "virtus-entella",
    "entella": "virtus-entella", "reggiana": "reggiana", "cittadella": "cittadella",
    "brescia": "brescia", "lecco": "lecco", "albino leffe": "albinoleffe", "albinoleffe": "albinoleffe",
    "alcione": "alcione", "alcione milano": "alcione", "pro vercelli": "pro-vercelli",
    "audace cerignola": "audace-cerignola", "cerignola": "audace-cerignola",
    "picerno": "az-picerno", "az picerno": "az-picerno", "team altamura": "team-altamura",
    "altamura": "team-altamura", "scafatese": "scafatese-calcio-1922",
    "savoia": "savoia-1908", "barletta": "barletta-1922",
    "atalanta u23": "atalanta", "juventus next gen": "juventus", "milan futuro": "milan",
}

def find_logo(name):
    n = name.lower().strip()
    if n in ALIASES and ALIASES[n] in logo_files:
        return logo_files[ALIASES[n]]
    # partial
    for k, slug in ALIASES.items():
        if k in n or n in k:
            if slug in logo_files:
                return logo_files[slug]
    s = slugify(name)
    if s in logo_files:
        return logo_files[s]
    # try last word
    words = re.findall(r"[a-z0-9]+", n)
    for w in reversed(words):
        if w in logo_files:
            return logo_files[w]
        if w in ALIASES and ALIASES[w] in logo_files:
            return logo_files[ALIASES[w]]
    return ""

def colors(seed):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + (h >> 16) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"

def abbr(name):
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","FBC")]
    if not words: return name[:3].upper()
    if len(words)==1: return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

def make_team(name, league, pos):
    sid = slugify(name)
    p, s = colors(sid)
    logo = find_logo(name)
    return {
        "id": sid,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": name.split()[0].upper(),
        "year": "1900",
        "abbr": abbr(name),
        "gender": "m",
        "pos": pos,
        "pts": max(0, 60 - pos*2),
        "played": 0,
        "logo": logo,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
        "source": "diretta.it",
    }

# Load existing catalog and replace only pro A/B/C sections
cat = json.loads(CAT.read_text(encoding="utf-8"))
keep = []
for t in cat.get("teams", []):
    lg = t.get("league") or ""
    if lg.startswith("SERIE A") and "FEMMINILE" not in lg:
        continue
    if lg.startswith("SERIE B") and "FEMMINILE" not in lg:
        continue
    if lg.startswith("SERIE C"):
        continue
    keep.append(t)

pro = []
order_pro = []
report = {"source": "https://www.diretta.it/", "season": "2026/2027", "leagues": {}}

for league, teams in diretta.items():
    order_pro.append(league)
    # sort alpha for stable UX if no standings order
    teams_sorted = sorted(teams, key=lambda x: x.lower())
    # if few teams, warn
    built = []
    for i, name in enumerate(teams_sorted, 1):
        built.append(make_team(name, league, i))
    pro.extend(built)
    report["leagues"][league] = {
        "count": len(built),
        "teams": [t["name"] for t in built],
        "with_logo": sum(1 for t in built if t.get("logo")),
        "missing_logo": [t["name"] for t in built if not t.get("logo")],
    }
    print("===", league, "count", len(built), "logos", report["leagues"][league]["with_logo"])
    print("  teams:", ", ".join(t["name"] for t in built))
    if report["leagues"][league]["missing_logo"]:
        print("  no logo:", report["leagues"][league]["missing_logo"])

# Compare with previous pro names
old_pro = [t for t in cat.get("teams", []) if any(t.get("league","").startswith(x) for x in ("SERIE A","SERIE B","SERIE C")) and "FEMMINILE" not in t.get("league","")]
old_by_lg = {}
for t in old_pro:
    old_by_lg.setdefault(t["league"], set()).add(t["name"].upper())
new_by_lg = {}
for t in pro:
    new_by_lg.setdefault(t["league"], set()).add(t["name"].upper())

report["diff"] = {}
for lg in sorted(set(list(old_by_lg)+list(new_by_lg))):
    o = old_by_lg.get(lg, set())
    n = new_by_lg.get(lg, set())
    report["diff"][lg] = {
        "removed": sorted(o - n),
        "added": sorted(n - o),
        "kept": len(o & n),
    }
    print("DIFF", lg, "kept", len(o&n), "added", sorted(n-o)[:15], "removed", sorted(o-n)[:15])

# league order: pro first then rest
rest_order = [x for x in (cat.get("leagueOrder") or []) if x not in order_pro and not (x.startswith("SERIE A") or x.startswith("SERIE B") or x.startswith("SERIE C"))]
# ensure femminile kept
for t in keep:
    if t["league"] not in rest_order and t["league"] not in order_pro:
        rest_order.append(t["league"])

teams_all = pro + keep
# unique ids
seen = set()
uniq = []
for t in teams_all:
    i = t["id"]
    if i in seen:
        t["id"] = i + "-" + hashlib.md5(t["league"].encode()).hexdigest()[:4]
    seen.add(t["id"])
    uniq.append(t)

out = {
    "version": 5,
    "season": "2026/2027",
    "source": "diretta.it + football-logos.cc",
    "updatedAt": "2026-08-06",
    "leagueOrder": order_pro + [x for x in rest_order if x not in order_pro],
    "teams": uniq,
    "stats": {
        "total": len(uniq),
        "leagues": len(order_pro) + len([x for x in rest_order if x not in order_pro]),
        "logos": sum(1 for t in uniq if t.get("logo")),
        "proTeams": len(pro),
        "proLogos": sum(1 for t in pro if t.get("logo")),
        "direttaAligned": True,
    },
}
CAT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
(ROOT / "data" / "squadre" / "diretta_sync_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print("CATALOG written", out["stats"])