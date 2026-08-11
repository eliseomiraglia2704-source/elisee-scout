# -*- coding: utf-8 -*-
import re, ssl, urllib.request, json, hashlib
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGO = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
REPORT = ROOT / "data" / "squadre" / "diretta_sync_report.json"
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

def teams_from_feed(data):
    # AE/AF/FH/FK = display names on Diretta/Flashscore
    names = []
    for code in ("AE", "AF", "FH", "FK", "CX"):
        names += re.findall(rf"¬{code}÷([^¬~]+)", data)
    out, seen = [], set()
    for n in names:
        n = n.strip()
        if len(n) < 3:
            continue
        if re.fullmatch(r"[A-Za-z0-9_\-]{6,12}", n) and not re.search(r"[a-z]", n):
            # skip pure IDs
            continue
        if ".png" in n or n.startswith("http"):
            continue
        if n.lower() in {"giornata", "italia", "serie a", "serie b", "serie c"}:
            continue
        key = n.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(n)
    return out

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
    teams = teams_from_feed(data)
    try:
        html2 = get(url.replace("/calendario/", "/risultati/"))
        data2 = feed(html2, "results") or feed(html2, "summary-results") or feed(html2, "fixtures")
        for t in teams_from_feed(data2):
            if t.lower() not in {x.lower() for x in teams}:
                teams.append(t)
    except Exception as e:
        print("results warn", league, e)
    diretta[league] = sorted(teams, key=lambda x: x.lower())
    print(league, len(diretta[league]), diretta[league])

logo_files = {p.stem: f"immagini/squadre-loghi/{p.name}" for p in LOGO.glob("*.png") if p.stat().st_size > 800}

def slugify(name):
    s = name.lower()
    for a, b in [("à","a"),("è","e"),("é","e"),("ì","i"),("ò","o"),("ù","u"),("ü","u"),("ö","o"),("’",""),("'", "")]:
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

ALIASES = {
    "inter": "inter", "milan": "milan", "ac milan": "milan", "as roma": "roma", "roma": "roma",
    "juventus": "juventus", "napoli": "napoli", "lazio": "lazio", "atalanta": "atalanta",
    "fiorentina": "fiorentina", "bologna": "bologna", "torino": "torino", "genoa": "genoa",
    "udinese": "udinese", "cagliari": "cagliari", "lecce": "lecce", "parma": "parma",
    "como": "como-1907", "como 1907": "como-1907", "sassuolo": "sassuolo", "venezia": "venezia",
    "frosinone": "frosinone", "monza": "monza", "ac monza": "monza",
    "hellas verona": "verona", "verona": "verona", "cremonese": "cremonese", "pisa": "pisa",
    "empoli": "empoli", "palermo": "palermo", "bari": "bari", "spezia": "spezia",
    "catanzaro": "catanzaro", "cesena": "cesena", "cesena fc": "cesena", "modena": "modena",
    "sampdoria": "sampdoria", "padova": "padova", "carrarese": "carrarese", "carrarese calcio": "carrarese",
    "mantova": "mantova-1911", "mantova 1911": "mantova-1911", "arezzo": "arezzo", "ascoli": "ascoli",
    "benevento": "benevento", "avellino": "us-avellino-1912", "us avellino": "us-avellino-1912",
    "juve stabia": "juve-stabia", "sudtirol": "suditrol", "südtirol": "suditrol",
    "virtus entella": "virtus-entella", "entella": "virtus-entella", "reggiana": "reggiana",
    "cittadella": "cittadella", "brescia": "brescia", "union brescia": "union-brescia",
    "lecco": "lecco", "albinoleffe": "albinoleffe", "albino leffe": "albinoleffe",
    "alcione": "alcione", "alcione milano": "alcione", "pro vercelli": "pro-vercelli",
    "fc pro vercelli 1892": "pro-vercelli", "audace cerignola": "audace-cerignola",
    "picerno": "az-picerno", "az picerno": "az-picerno", "team altamura": "team-altamura",
    "altamura": "team-altamura", "scafatese": "scafatese-calcio-1922", "scafatese calcio 1922": "scafatese-calcio-1922",
    "savoia": "savoia-1908", "savoia 1908": "savoia-1908", "barletta": "barletta-1922", "barletta 1922": "barletta-1922",
    "atalanta u23": "atalanta", "juventus next gen": "juventus", "milan futuro": "milan",
    "giana erminio": "giana-erminio", "lumezzane": "lumezzane", "novara": "novara",
    "renate": "renate", "trento": "trento", "treviso": "treviso", "pergolettese": "pergolettese",
    "ospitaletto": "ospitaletto", "desenzano": "desenzano", "arzignano": "arzignano-valchiampo",
    "dolomiti bellunesi": "dolomiti-bellunesi", "folgore caratese": "folgore-caratese",
    "campobasso": "campobasso", "carpi": "carpi", "livorno": "livorno", "perugia": "perugia",
    "pescara": "pescara", "pianese": "pianese", "pineto": "pineto", "ravenna": "ravenna",
    "sambenedettese": "sambenedettese", "ternana": "ternana", "torres": "torres",
    "vis pesaro": "vis-pesaro", "gubbio": "gubbio", "guidonia montecelio": "guidonia-montecelio",
    "ostiamare": "ostiamare", "forli": "forli-fc", "forlì": "forli-fc", "forlì fc": "forli-fc",
    "grosseto": "grosseto", "catania": "catania", "casertana": "casertana", "casarano": "casarano",
    "cavese": "cavese", "cosenza": "cosenza", "crotone": "crotone", "giugliano": "giugliano",
    "latina": "latina", "monopoli": "monopoli", "potenza": "potenza", "salernitana": "salernitana",
    "sorrento": "sorrento", "foggia": "foggia", "taranto": "taranto",
}

def find_logo(name):
    n = name.lower().strip()
    if n in ALIASES and ALIASES[n] in logo_files:
        return logo_files[ALIASES[n]]
    for k, slug in ALIASES.items():
        if k in n or n in k:
            if slug in logo_files:
                return logo_files[slug]
    s = slugify(name)
    if s in logo_files:
        return logo_files[s]
    for w in reversed(re.findall(r"[a-z0-9]+", n)):
        if len(w) < 4:
            continue
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
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","FBC","THE")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

def make_team(name, league, pos):
    sid = slugify(name)
    p, s = colors(sid + league)
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
        "pts": max(0, 60 - pos * 2),
        "played": 0,
        "logo": logo,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
        "source": "diretta.it",
    }

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

# If previous wipe left zero pro, keep already excludes them - good
# Also restore Serie D and dilettanti as-is in keep

pro = []
order_pro = []
report = {"source": "https://www.diretta.it/", "season": "2026/2027", "leagues": {}, "notes": []}

for league, teams in diretta.items():
    if len(teams) < 15:
        report["notes"].append(f"{league}: few teams extracted ({len(teams)})")
    order_pro.append(league)
    built = [make_team(name, league, i) for i, name in enumerate(teams, 1)]
    pro.extend(built)
    report["leagues"][league] = {
        "count": len(built),
        "teams": [t["name"] for t in built],
        "with_logo": sum(1 for t in built if t.get("logo")),
        "missing_logo": [t["name"] for t in built if not t.get("logo")],
        "url": PAGES[league],
    }
    print("===", league, len(built), "logos", report["leagues"][league]["with_logo"])
    print(" ", ", ".join(t["name"] for t in built))
    if report["leagues"][league]["missing_logo"]:
        print("  NOLOGO", report["leagues"][league]["missing_logo"])

# Sanity: Serie A should be ~20
if report["leagues"].get("SERIE A", {}).get("count", 0) != 20:
    report["notes"].append(f"Serie A count={report['leagues'].get('SERIE A',{}).get('count')} expected 20")
if report["leagues"].get("SERIE B", {}).get("count", 0) != 20:
    report["notes"].append(f"Serie B count={report['leagues'].get('SERIE B',{}).get('count')} expected 20")

rest_order = []
for x in cat.get("leagueOrder") or []:
    if x in order_pro:
        continue
    if x.startswith("SERIE A") or x.startswith("SERIE B") or x.startswith("SERIE C"):
        if "FEMMINILE" not in x:
            continue
    if x not in rest_order:
        rest_order.append(x)
for t in keep:
    if t["league"] not in rest_order and t["league"] not in order_pro:
        rest_order.append(t["league"])

seen = set()
uniq = []
for t in pro + keep:
    i = t["id"]
    if i in seen:
        t["id"] = i + "-" + hashlib.md5((t.get("league") or "").encode()).hexdigest()[:4]
    seen.add(t["id"])
    uniq.append(t)

out = {
    "version": 6,
    "season": "2026/2027",
    "source": "diretta.it (calendario fixtures AE/AF) + football-logos.cc",
    "updatedAt": "2026-08-06",
    "leagueOrder": order_pro + rest_order,
    "teams": uniq,
    "stats": {
        "total": len(uniq),
        "leagues": len(order_pro) + len(rest_order),
        "logos": sum(1 for t in uniq if t.get("logo")),
        "proTeams": len(pro),
        "proLogos": sum(1 for t in pro if t.get("logo")),
        "direttaAligned": True,
        "serieA": report["leagues"].get("SERIE A", {}).get("count"),
        "serieB": report["leagues"].get("SERIE B", {}).get("count"),
        "serieCA": report["leagues"].get("SERIE C · GIRONE A", {}).get("count"),
        "serieCB": report["leagues"].get("SERIE C · GIRONE B", {}).get("count"),
        "serieCC": report["leagues"].get("SERIE C · GIRONE C", {}).get("count"),
    },
}
CAT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print("DONE", out["stats"])
print("notes", report["notes"])