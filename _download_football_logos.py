# -*- coding: utf-8 -*-
"""Scarica loghi Serie A/B/C/D da football-logos.cc e aggiorna catalog.json"""
from __future__ import annotations
import json, re, time, ssl, urllib.request, urllib.error
from pathlib import Path
from collections import defaultdict

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
OUT.mkdir(parents=True, exist_ok=True)
MAP_PATH = ROOT / "data" / "squadre" / "logo-map.json"
CATALOG = ROOT / "data" / "squadre" / "catalog.json"

CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
    "Referer": "https://football-logos.cc/",
}

def fetch(url: str, timeout=22) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()

def fetch_text(url: str) -> str:
    return fetch(url).decode("utf-8", "replace")

LEAGUES = {
    "serie-a": "https://football-logos.cc/italy/serie-a/",
    "serie-b": "https://football-logos.cc/italy/serie-b/",
    "serie-c": "https://football-logos.cc/italy/serie-c/",
    "serie-d": "https://football-logos.cc/italy/serie-d/",
}

# Extract team links under "All ... Teams" sections
def extract_teams(html: str) -> list[tuple[str, str]]:
    # [Name](/italy/slug/)
    pairs = re.findall(r'\[([^\]]+)\]\(/italy/([a-z0-9-]+)/\)', html)
    # also raw href
    pairs2 = re.findall(r'href=["\']/italy/([a-z0-9-]+)/["\'][^>]*>([^<]+)<', html)
    teams = []
    seen = set()
    for name, slug in pairs:
        if slug in ("serie-a","serie-b","serie-c","serie-d","italy") or slug.startswith("serie-"):
            continue
        if slug in seen:
            continue
        seen.add(slug)
        teams.append((name.strip(), slug))
    for slug, name in pairs2:
        if slug in ("serie-a","serie-b","serie-c","serie-d") or slug.startswith("serie-"):
            continue
        if slug in seen:
            continue
        seen.add(slug)
        teams.append((name.strip(), slug))
    return teams

def logo_url_from_team_page(html: str, slug: str) -> str | None:
    # Prefer 512x512 hashed asset for this slug
    pat = rf'https://assets\.football-logos\.cc/logos/italy/512x512/{re.escape(slug)}\.[a-f0-9]+\.png'
    m = re.search(pat, html, re.I)
    if m:
        return m.group(0)
    # any size
    pat2 = rf'https://assets\.football-logos\.cc/logos/italy/\d+x\d+/{re.escape(slug)}\.[a-f0-9]+\.png'
    m = re.search(pat2, html, re.I)
    if m:
        # rewrite to 512 if possible
        u = m.group(0)
        u512 = re.sub(r'/\d+x\d+/', '/512x512/', u)
        return u512
    # data-logo-id + search any italy png for slug
    m = re.search(rf'logos/italy/512x512/({re.escape(slug)}\.[a-f0-9]+\.png)', html, re.I)
    if m:
        return "https://assets.football-logos.cc/logos/italy/512x512/" + m.group(1)
    return None

def download_logo(slug: str, url: str) -> Path | None:
    dest = OUT / f"{slug}.png"
    if dest.exists() and dest.stat().st_size > 1500:
        # re-download if too small/stale? keep if good
        return dest
    try:
        data = fetch(url, timeout=25)
        if not data or len(data) < 800:
            return None
        if data[:20].lstrip().startswith(b"<") or data[:15].startswith(b"<!DOCTYPE"):
            return None
        dest.write_bytes(data)
        return dest
    except Exception as e:
        print("  DL fail", slug, e)
        return None

def main():
    logo_map = {}  # slug -> {name, league, file, url}
    all_teams_by_league = {}

    for league_id, page_url in LEAGUES.items():
        print("=== LEAGUE", league_id)
        try:
            html = fetch_text(page_url)
        except Exception as e:
            print(" page fail", e)
            continue
        # markdown-style links from our fetch tool conversion won't be in raw HTML
        # parse HTML anchors
        teams = []
        seen = set()
        for m in re.finditer(r'href=["\']/italy/([a-z0-9-]+)/["\']', html):
            slug = m.group(1)
            if slug in ("serie-a","serie-b","serie-c","serie-d") or slug.startswith("serie-"):
                continue
            if slug in seen:
                continue
            seen.add(slug)
            # try find name nearby
            teams.append(slug)
        # Better: section "All ... Teams" list items
        section = re.search(r'All[\s\S]{0,40}Teams[\s\S]{0,8000}?</(?:ul|ol|div)>', html, re.I)
        if section:
            sec = section.group(0)
            slugs = re.findall(r'/italy/([a-z0-9-]+)/', sec)
            teams = []
            seen = set()
            for s in slugs:
                if s.startswith("serie-") or s in seen:
                    continue
                seen.add(s)
                teams.append(s)
        # Also extract name+slug pairs from list
        pairs = re.findall(r'href=["\']/italy/([a-z0-9-]+)/["\'][^>]*>\s*([^<]{2,60})\s*<', html)
        name_by_slug = {}
        for slug, name in pairs:
            if slug.startswith("serie-"):
                continue
            name = re.sub(r'\s+', ' ', name).strip()
            if name and slug not in name_by_slug:
                name_by_slug[slug] = name
        if not teams:
            teams = list(name_by_slug.keys())
        print(" teams found", len(teams))
        all_teams_by_league[league_id] = []
        for i, slug in enumerate(teams):
            name = name_by_slug.get(slug, slug.replace("-", " ").title())
            turl = f"https://football-logos.cc/italy/{slug}/"
            logo_url = None
            try:
                thtml = fetch_text(turl)
                logo_url = logo_url_from_team_page(thtml, slug)
                if not logo_url:
                    # try without hash brute? no
                    # images CDN pattern sometimes: try find any .png with slug
                    m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/[^"\']*{re.escape(slug)}[^"\']*\.png', thtml)
                    if m:
                        logo_url = re.sub(r'/\d+x\d+/', '/512x512/', m.group(0))
            except Exception as e:
                print("  page", slug, e)
            path = None
            if logo_url:
                path = download_logo(slug, logo_url)
            ok = path is not None
            print(f"  [{i+1}/{len(teams)}] {slug}: {'OK' if ok else 'FAIL'} {logo_url or ''}")
            entry = {
                "slug": slug,
                "name": name,
                "league": league_id,
                "url": logo_url,
                "file": f"immagini/squadre-loghi/{slug}.png" if ok else None,
            }
            logo_map[slug] = entry
            all_teams_by_league[league_id].append(entry)
            time.sleep(0.12)  # be polite

    MAP_PATH.parent.mkdir(parents=True, exist_ok=True)
    MAP_PATH.write_text(json.dumps({"leagues": all_teams_by_league, "bySlug": logo_map}, ensure_ascii=False, indent=2), encoding="utf-8")
    print("map saved", MAP_PATH)
    ok_n = sum(1 for v in logo_map.values() if v.get("file"))
    print(f"downloaded {ok_n}/{len(logo_map)}")

    # Update catalog logos by fuzzy name/slug match for A/B/C/D
    if not CATALOG.exists():
        print("no catalog")
        return
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))

    def norm(s: str) -> str:
        s = s.lower()
        for a,b in [("à","a"),("è","e"),("é","e"),("ì","i"),("ò","o"),("ù","u"),("ü","u"),("ö","o")]:
            s = s.replace(a,b)
        s = re.sub(r"[^a-z0-9]+", " ", s)
        return re.sub(r"\s+", " ", s).strip()

    # build lookup: norm name -> file, slug words
    by_norm = {}
    by_slug = {}
    for slug, e in logo_map.items():
        if not e.get("file"):
            continue
        by_slug[slug] = e["file"]
        by_norm[norm(e["name"])] = e["file"]
        by_norm[norm(slug.replace("-", " "))] = e["file"]
        # short forms
        words = norm(e["name"]).split()
        if words:
            by_norm[words[-1]] = e["file"]  # last word e.g. monza

    # manual aliases catalog name -> slug
    aliases = {
        "hellas verona": "hellas-verona",
        "verona": "hellas-verona",
        "como": "como-1907",
        "como 1907": "como-1907",
        "ac monza": "monza",
        "monza": "monza",
        "frosinone calcio": "frosinone",
        "frosinone": "frosinone",
        "inter": "inter",
        "milan": "milan",
        "juventus": "juventus",
        "napoli": "napoli",
        "roma": "roma",
        "lazio": "lazio",
        "atalanta": "atalanta",
        "fiorentina": "fiorentina",
        "bologna": "bologna",
        "torino": "torino",
        "genoa": "genoa",
        "udinese": "udinese",
        "cagliari": "cagliari",
        "lecce": "lecce",
        "parma": "parma",
        "sassuolo": "sassuolo",
        "pisa": "pisa",
        "cremonese": "cremonese",
        "venezia": "venezia",
        "palermo": "palermo",
        "bari": "bari",
        "spezia": "spezia",
        "catanzaro": "catanzaro",
        "sudtirol": "sudtirol",
        "südtirol": "sudtirol",
        "audace cerignola": "audace-cerignola",
        "juve stabia": "juvestabia",
        "juventus next gen": "juventus-next-gen",
        "milan futuro": "milan-futuro",
        "atalanta u23": "atalanta-u23",
    }

    matched = 0
    for t in cat["teams"]:
        league = t.get("league") or ""
        if not any(x in league for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D")):
            continue
        if "FEMMINILE" in league:
            # try club logo without Women
            pass
        name_n = norm(t.get("name", ""))
        name_n = name_n.replace(" women", "").strip()
        file = None
        # alias
        for k, slug in aliases.items():
            if name_n == k or name_n.endswith(" " + k) or k in name_n:
                file = by_slug.get(slug)
                if file:
                    break
        if not file:
            file = by_norm.get(name_n)
        if not file:
            # try id
            file = by_slug.get(t.get("id", ""))
        if not file:
            # slugify name
            sid = re.sub(r"[^a-z0-9]+", "-", name_n).strip("-")
            file = by_slug.get(sid)
        if not file:
            # partial: any slug contained in name or vice versa
            for slug, f in by_slug.items():
                sn = slug.replace("-", " ")
                if sn in name_n or name_n in sn:
                    file = f
                    break
                # last token match for multiword
                if sn.split()[-1] == name_n.split()[-1] and len(name_n.split()[-1]) > 3:
                    file = f
                    break
        if file:
            t["logo"] = file
            matched += 1

    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"catalog logo matched for pro teams: {matched}")
    # stats
    for lid, arr in all_teams_by_league.items():
        ok = sum(1 for x in arr if x.get("file"))
        print(f"  {lid}: {ok}/{len(arr)}")

if __name__ == "__main__":
    main()