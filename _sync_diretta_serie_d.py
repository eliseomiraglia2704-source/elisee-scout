# -*- coding: utf-8 -*-
"""Allinea Serie D (gironi A-I) a Diretta.it + scarica loghi dove possibile."""
import re, ssl, urllib.request, json, hashlib, time
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
LOGO = ROOT / "immagini" / "squadre-loghi"
CAT = ROOT / "data" / "squadre" / "catalog.json"
REPORT = ROOT / "data" / "squadre" / "diretta_serie_d_report.json"
LOGO.mkdir(parents=True, exist_ok=True)
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html,*/*",
  "Accept-Language": "it-IT,it;q=0.9",
  "Referer": "https://www.diretta.it/",
}

GIRONI = "ABCDEFGHI"
PAGES = {
  f"SERIE D · GIRONE {g}": f"https://www.diretta.it/calcio/italia/serie-d-girone-{g.lower()}/calendario/"
  for g in GIRONI
}

def get(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout, context=CTX).read()

def get_text(url):
    return get(url).decode("utf-8", "replace")

def feed(html, key):
    m = re.search(rf'initialFeeds\["{key}"\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`', html)
    if not m:
        m = re.search(rf"initialFeeds\['{key}'\]\s*=\s*\{{[\s\S]*?data:\s*`([^`]*)`", html)
    return m.group(1) if m else ""

def teams_from_feed(data):
    names = []
    for code in ("AE", "AF", "FH", "FK", "CX"):
        names += re.findall(rf"¬{code}÷([^¬~]+)", data)
    out, seen = [], set()
    for n in names:
        n = n.strip()
        if len(n) < 2:
            continue
        if re.fullmatch(r"[A-Za-z0-9_\-]{6,12}", n) and not re.search(r"[a-z]", n):
            continue
        if ".png" in n or n.startswith("http"):
            continue
        low = n.lower()
        if low in {"giornata", "italia", "serie d", "serie a", "serie b", "serie c"}:
            continue
        if low in seen:
            continue
        seen.add(low)
        out.append(n)
    return out

def slugify(name):
    s = name.lower()
    for a, b in [("à","a"),("è","e"),("é","e"),("ì","i"),("ò","o"),("ù","u"),("ü","u"),("ö","o"),("’",""),("'",""),(".",""),("ł","l")]:
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:56]

def colors(seed):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + (h >> 16) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"

def abbr(name):
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","FBC","USD","ACD","THE","SSDARL")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

# --- scrape Diretta Serie D ---
diretta = {}
for league, url in PAGES.items():
    try:
        html = get_text(url)
        data = feed(html, "fixtures") or feed(html, "summary-fixtures")
        teams = teams_from_feed(data)
        try:
            html2 = get_text(url.replace("/calendario/", "/risultati/"))
            data2 = feed(html2, "results") or feed(html2, "summary-results") or feed(html2, "fixtures")
            for t in teams_from_feed(data2):
                if t.lower() not in {x.lower() for x in teams}:
                    teams.append(t)
        except Exception as e:
            print("results warn", league, e)
        diretta[league] = sorted(teams, key=lambda x: x.lower())
        print(league, len(diretta[league]), diretta[league][:8], "...")
        time.sleep(0.15)
    except Exception as e:
        print("FAIL", league, e)
        diretta[league] = []

# --- try download logos from football-logos (best effort) ---
def try_download_logo(slug, name):
    dest = LOGO / f"{slug}.png"
    if dest.exists() and dest.stat().st_size > 800:
        return f"immagini/squadre-loghi/{slug}.png"
    # football-logos team page
    candidates = [slug]
    # also simplify
    words = re.findall(r"[a-z0-9]+", name.lower())
    if words:
        candidates.append(words[-1])
        candidates.append("-".join(words[:3]))
    for cand in candidates:
        if not cand:
            continue
        page = f"https://football-logos.cc/italy/{cand}/"
        try:
            req = urllib.request.Request(page, headers=UA)
            html = urllib.request.urlopen(req, timeout=12, context=CTX).read().decode("utf-8", "replace")
            m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/512x512/{re.escape(cand)}\.[a-f0-9]+\.png', html, re.I)
            if not m:
                m = re.search(r'https://assets\.football-logos\.cc/logos/italy/512x512/([a-z0-9-]+\.[a-f0-9]+\.png)', html, re.I)
            if m:
                img_url = m.group(0) if m.group(0).startswith("http") else "https://assets.football-logos.cc/logos/italy/512x512/" + m.group(1)
                # if cand mismatch, use slug for file
                data = urllib.request.urlopen(urllib.request.Request(img_url, headers=UA), timeout=15, context=CTX).read()
                if data and len(data) > 800 and data[:1] != b"<":
                    dest.write_bytes(data)
                    print("  logo OK", name, "->", dest.name, len(data))
                    return f"immagini/squadre-loghi/{slug}.png"
        except Exception:
            pass
    return ""

logo_files = {p.stem: f"immagini/squadre-loghi/{p.name}" for p in LOGO.glob("*.png") if p.stat().st_size > 800}

def find_logo(name, slug):
    if slug in logo_files:
        return logo_files[slug]
    n = name.lower()
    # partial match existing
    for stem, path in logo_files.items():
        if stem in slug or slug in stem or stem.replace("-", " ") in n:
            return path
    words = re.findall(r"[a-z0-9]+", n)
    for w in reversed(words):
        if len(w) >= 4 and w in logo_files:
            return logo_files[w]
    # download attempt
    path = try_download_logo(slug, name)
    if path:
        logo_files[slug] = path
        return path
    return ""

def make_team(name, league, pos):
    sid = slugify(name)
    p, s = colors(sid + league)
    logo = find_logo(name, sid)
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
        "pts": max(0, 50 - pos * 2),
        "played": 0,
        "logo": logo,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
        "source": "diretta.it",
    }

# --- rebuild catalog: keep all non Serie D, replace Serie D ---
cat = json.loads(CAT.read_text(encoding="utf-8"))
keep = []
for t in cat.get("teams", []):
    lg = t.get("league") or ""
    if lg.startswith("SERIE D"):
        continue
    keep.append(t)

serie_d = []
order_d = []
report = {"source": "https://www.diretta.it/", "season": "2025/2026–2026/2027", "leagues": {}}

for league, teams in diretta.items():
    order_d.append(league)
    built = [make_team(name, league, i) for i, name in enumerate(teams, 1)]
    serie_d.extend(built)
    report["leagues"][league] = {
        "count": len(built),
        "teams": [t["name"] for t in built],
        "with_logo": sum(1 for t in built if t.get("logo")),
        "missing_logo": [t["name"] for t in built if not t.get("logo")],
        "url": PAGES[league],
    }
    print("===", league, "n=", len(built), "logos=", report["leagues"][league]["with_logo"])
    print(" ", ", ".join(t["name"] for t in built))

# league order: keep pro A/B/C first, then D, then rest
order = []
for lg in cat.get("leagueOrder") or []:
    if lg.startswith("SERIE D"):
        continue
    if lg not in order:
        order.append(lg)
# insert D after C
insert_at = 0
for i, lg in enumerate(order):
    if lg.startswith("SERIE C"):
        insert_at = i + 1
if insert_at == 0:
    for i, lg in enumerate(order):
        if lg.startswith("SERIE B"):
            insert_at = i + 1
order = order[:insert_at] + order_d + order[insert_at:]
for lg in order_d:
    if lg not in order:
        order.append(lg)
for t in keep + serie_d:
    if t["league"] not in order:
        order.append(t["league"])

seen = set()
uniq = []
for t in keep + serie_d:
    i = t["id"]
    if i in seen:
        t["id"] = i + "-" + hashlib.md5((t.get("league") or "").encode()).hexdigest()[:4]
    seen.add(t["id"])
    uniq.append(t)

# stats
pro_prefixes = ("SERIE A", "SERIE B", "SERIE C", "SERIE D")
pro = [t for t in uniq if any(t["league"].startswith(p) for p in pro_prefixes) and "FEMMINILE" not in t["league"]]
out = {
    "version": 7,
    "season": "2026/2027",
    "source": "diretta.it (A/B/C/D) + football-logos.cc",
    "updatedAt": time.strftime("%Y-%m-%d"),
    "leagueOrder": order,
    "teams": uniq,
    "stats": {
        "total": len(uniq),
        "leagues": len(order),
        "logos": sum(1 for t in uniq if t.get("logo")),
        "proTeams": len(pro),
        "proLogos": sum(1 for t in pro if t.get("logo")),
        "direttaAligned": True,
        "serieD": sum(len(v.get("teams") or []) for v in report["leagues"].values()),
        "serieDLogos": sum(v.get("with_logo") or 0 for v in report["leagues"].values()),
    },
}
CAT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print("DONE stats", out["stats"])
total_d = sum(v["count"] for v in report["leagues"].values())
print("Serie D total teams", total_d)