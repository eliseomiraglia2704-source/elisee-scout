# -*- coding: utf-8 -*-
"""Pulisce catalog squadre: ID unici, loghi femminili, path validi."""
import json, re, hashlib
from pathlib import Path
from collections import Counter

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
LOGO = ROOT / "immagini" / "squadre-loghi"

cat = json.loads(CAT.read_text(encoding="utf-8"))
teams = cat.get("teams") or []

# slug -> existing logo file
logo_files = {p.stem: f"immagini/squadre-loghi/{p.name}" for p in LOGO.glob("*.png") if p.stat().st_size > 800}

def norm(s):
    s = (s or "").lower()
    for a,b in [("à","a"),("è","e"),("é","e"),("ì","i"),("ò","o"),("ù","u"),("ü","u"),("ö","o")]:
        s = s.replace(a,b)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

# name/slug lookup for pro logos
by_name = {}
for stem, path in logo_files.items():
    by_name[norm(stem.replace("-", " "))] = path
    by_name[stem] = path

# known aliases
aliases = {
    "como 1907": "como-1907",
    "como": "como-1907",
    "hellas verona": "verona",
    "verona": "verona",
    "sudtirol": "suditrol",
    "südtirol": "suditrol",
    "juve stabia": "juve-stabia",
    "mantova": "mantova-1911",
    "avellino": "us-avellino-1912",
    "virtus entella": "virtus-entella",
    "audace cerignola": "audace-cerignola",
    "pro vercelli": "pro-vercelli",
    "inter women": "inter",
    "juventus women": "juventus",
    "roma women": "roma",
    "milan women": "milan",
    "napoli women": "napoli",
    "fiorentina women": "fiorentina",
    "lazio women": "lazio",
    "sassuolo women": "sassuolo",
    "como women": "como-1907",
    "parma women": "parma",
    "sampdoria women": "sampdoria",
    "bologna women": "bologna",
    "cagliari women": "cagliari",
    "verona women": "verona",
    "brescia women": "brescia" if "brescia" in logo_files else None,
}

fixed_logo = 0
fixed_missing = 0
for t in teams:
    logo = t.get("logo")
    # validate path
    if logo:
        p = ROOT / logo.replace("/", "\\")
        if not p.exists() or p.stat().st_size < 500:
            t["logo"] = None
            logo = None
            fixed_missing += 1
    if not logo:
        name_n = norm(t.get("name", ""))
        # strip women
        base = name_n.replace(" women", "").strip()
        # try alias
        slug = aliases.get(name_n) or aliases.get(base)
        if slug and slug in logo_files:
            t["logo"] = logo_files[slug]
            fixed_logo += 1
            continue
        if base in by_name:
            t["logo"] = by_name[base]
            fixed_logo += 1
            continue
        # last word
        words = base.split()
        if words and words[-1] in by_name:
            t["logo"] = by_name[words[-1]]
            fixed_logo += 1
            continue
        # id stem
        tid = (t.get("id") or "").split("-")[0]
        if tid in logo_files:
            t["logo"] = logo_files[tid]
            fixed_logo += 1

# unique ids
seen = {}
dup_fixed = 0
for i, t in enumerate(teams):
    base = re.sub(r"[^a-z0-9-]+", "-", (t.get("id") or f"team-{i}").lower()).strip("-")
    # strip repeated hash suffixes like -2cda-2cda-2cda
    base = re.sub(r"(-[a-f0-9]{4})(?:\1)+$", r"\1", base)
    league_slug = re.sub(r"[^a-z0-9]+", "-", (t.get("league") or "").lower())[:24].strip("-")
    candidate = base
    if candidate in seen:
        candidate = f"{base}-{league_slug}" if league_slug else f"{base}-{i}"
        n = 2
        while candidate in seen:
            candidate = f"{base}-{league_slug}-{n}" if league_slug else f"{base}-{n}"
            n += 1
        dup_fixed += 1
    seen[candidate] = True
    t["id"] = candidate
    # ensure required fields
    t["name"] = (t.get("name") or "SQUADRA").upper()
    t["country"] = t.get("country") or "ITALIA"
    t["gender"] = t.get("gender") if t.get("gender") in ("m", "f") else "m"
    t["league"] = t.get("league") or "SERIE A"
    t["city"] = (t.get("city") or t["name"].split()[0]).upper()
    t["abbr"] = t.get("abbr") or (t["name"][:3])
    if t.get("pos") is None:
        t["pos"] = 1
    if t.get("pts") is None:
        t["pts"] = 0
    if t.get("played") is None:
        t["played"] = 0
    # kit defaults
    if not t.get("home"):
        p = t.get("primary") or "#1e3a5f"
        t["home"] = {"body": p, "sleeve": p}
    if not t.get("away"):
        s = t.get("secondary") or "#ffffff"
        t["away"] = {"body": s, "sleeve": t.get("primary") or "#1e3a5f"}
    # null logo -> omit or empty string for JSON cleanliness
    if not t.get("logo"):
        t["logo"] = ""

# rebuild league order: pro first then rest as before, unique
order = []
for lg in cat.get("leagueOrder") or []:
    if lg not in order and any(t["league"] == lg for t in teams):
        order.append(lg)
for t in teams:
    if t["league"] not in order:
        order.append(t["league"])

pro = [t for t in teams if any(t["league"].startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D")) and "FEMMINILE" not in t["league"]]
with_logo = sum(1 for t in teams if t.get("logo"))
pro_logo = sum(1 for t in pro if t.get("logo"))

cat = {
    "version": 4,
    "season": "2025/26–2026/27",
    "source": "https://football-logos.cc/italy/",
    "updatedAt": "2026-08-06",
    "leagueOrder": order,
    "teams": teams,
    "stats": {
        "total": len(teams),
        "leagues": len(order),
        "logos": with_logo,
        "proTeams": len(pro),
        "proLogos": pro_logo,
    },
}
CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("teams", len(teams), "dup_fixed", dup_fixed, "logos_added", fixed_logo, "bad_paths_cleared", fixed_missing)
print("stats", cat["stats"])
print("dup ids now", sum(1 for k,v in Counter(t["id"] for t in teams).items() if v>1))
print("femminile logos", sum(1 for t in teams if "FEMMINILE" in t["league"] and t.get("logo")))