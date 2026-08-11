# -*- coding: utf-8 -*-
"""Download loghi A/B/C/D da football-logos.cc + aggiorna catalogo organici."""
from __future__ import annotations
import json, re, time, ssl, urllib.request, hashlib
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
OUT.mkdir(parents=True, exist_ok=True)
MAP_PATH = ROOT / "data" / "squadre" / "logo-map.json"
CATALOG = ROOT / "data" / "squadre" / "catalog.json"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://football-logos.cc/",
}
SKIP = {
    "serie-a","serie-b","serie-c","serie-d","italy",
    "1500x1500","700x700","512x512","256x256","128x128","64x64","3000x3000",
}

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()

def fetch_text(url):
    return fetch(url).decode("utf-8", "replace")

def extract_teams(html: str):
    """Return list of (name, slug) from league page team lists."""
    # Prefer content after "All ... Teams"
    idx = re.search(r"All\s+Serie\s+[A-D]\s+Teams", html, re.I)
    chunk = html[idx.start():] if idx else html
    # stop before Matches section if present
    mstop = re.search(r"Matches in Serie", chunk, re.I)
    if mstop:
        chunk = chunk[:mstop.start()]
    pairs = []
    seen = set()
    for m in re.finditer(r'href=["\']/italy/([a-z0-9-]+)/["\'][^>]*>\s*([^<]{1,80}?)\s*<', chunk):
        slug, name = m.group(1), re.sub(r"\s+", " ", m.group(2)).strip()
        if slug in SKIP or re.fullmatch(r"\d+x\d+", slug) or slug.startswith("serie-"):
            continue
        if slug in seen:
            continue
        seen.add(slug)
        if not name or name.startswith("<"):
            name = slug.replace("-", " ").title()
        pairs.append((name, slug))
    # fallback: only slugs
    if not pairs:
        for slug in re.findall(r'/italy/([a-z0-9-]+)/', chunk):
            if slug in SKIP or re.fullmatch(r"\d+x\d+", slug) or slug.startswith("serie-"):
                continue
            if slug in seen:
                continue
            seen.add(slug)
            pairs.append((slug.replace("-", " ").title(), slug))
    return pairs

def logo_url(html: str, slug: str):
    pat = rf'https://assets\.football-logos\.cc/logos/italy/512x512/{re.escape(slug)}\.[a-f0-9]+\.png'
    m = re.search(pat, html, re.I)
    if m:
        return m.group(0)
    m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/\d+x\d+/{re.escape(slug)}\.[a-f0-9]+\.png', html, re.I)
    if m:
        return re.sub(r"/\d+x\d+/", "/512x512/", m.group(0))
    m = re.search(rf'logos/italy/512x512/({re.escape(slug)}\.[a-f0-9]+\.png)', html, re.I)
    if m:
        return "https://assets.football-logos.cc/logos/italy/512x512/" + m.group(1)
    return None

def download(slug, url, force=False):
    dest = OUT / f"{slug}.png"
    if not force and dest.exists() and dest.stat().st_size > 1500:
        return dest
    try:
        data = fetch(url, timeout=30)
        if not data or len(data) < 800 or data[:1] == b"<":
            return None
        dest.write_bytes(data)
        return dest
    except Exception as e:
        print("  DL", slug, e)
        return None

def colors(seed):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + (h >> 16) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"

def abbr(name):
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","THE")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

def make_team(name, league, slug, pos, logo_file, city=None):
    p, s = colors(slug)
    city = (city or name.split()[0]).upper()
    return {
        "id": slug,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": city,
        "year": "1900",
        "abbr": abbr(name),
        "gender": "m",
        "pos": pos,
        "pts": max(0, 60 - pos * 2),
        "played": 28 if "SERIE A" in league or "SERIE B" in league else 30,
        "logo": logo_file,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
    }

def main():
    leagues_pages = {
        "serie-a": ("https://football-logos.cc/italy/serie-a/", "SERIE A"),
        "serie-b": ("https://football-logos.cc/italy/serie-b/", "SERIE B"),
        "serie-c": ("https://football-logos.cc/italy/serie-c/", "SERIE C"),  # groups later
        "serie-d": ("https://football-logos.cc/italy/serie-d/", "SERIE D"),
    }
    by_slug = {}
    by_league = {}

    # Also parse C/D group structure for correct league labels
    for lid, (url, label) in leagues_pages.items():
        print("===", lid)
        html = fetch_text(url)
        if lid in ("serie-c", "serie-d"):
            # parse groups
            groups = {}
            for gm in re.finditer(r'Group\s+([A-I])</h4>([\s\S]*?)(?=Group\s+[A-I]</h4>|Matches in Serie|$)', html, re.I):
                g = gm.group(1).upper()
                part = gm.group(2)
                pairs = []
                seen = set()
                for m in re.finditer(r'href=["\']/italy/([a-z0-9-]+)/["\'][^>]*>\s*([^<]{1,80}?)\s*<', part):
                    slug, name = m.group(1), re.sub(r"\s+", " ", m.group(2)).strip()
                    if slug in SKIP or re.fullmatch(r"\d+x\d+", slug):
                        continue
                    if slug in seen:
                        continue
                    seen.add(slug)
                    pairs.append((name, slug))
                groups[g] = pairs
                print(f"  Group {g}: {len(pairs)}")
            by_league[lid] = groups
            # download all unique
            for g, pairs in groups.items():
                for i, (name, slug) in enumerate(pairs, 1):
                    if slug in by_slug and by_slug[slug].get("file"):
                        continue
                    try:
                        th = fetch_text(f"https://football-logos.cc/italy/{slug}/")
                        lu = logo_url(th, slug)
                    except Exception as e:
                        print("  page fail", slug, e)
                        lu = None
                    file = None
                    if lu:
                        p = download(slug, lu)
                        if p:
                            file = f"immagini/squadre-loghi/{slug}.png"
                    by_slug[slug] = {"slug": slug, "name": name, "league": lid, "group": g, "url": lu, "file": file}
                    print(f"  {lid} {g} {i}/{len(pairs)} {slug}: {'OK' if file else 'FAIL'}")
                    time.sleep(0.08)
        else:
            pairs = extract_teams(html)
            print("  teams", len(pairs))
            by_league[lid] = pairs
            for i, (name, slug) in enumerate(pairs, 1):
                if slug in by_slug and by_slug[slug].get("file") and (OUT / f"{slug}.png").exists():
                    # refresh map only
                    by_slug[slug] = {"slug": slug, "name": name, "league": lid, "url": by_slug.get(slug, {}).get("url"), "file": f"immagini/squadre-loghi/{slug}.png"}
                    # ensure file
                    if (OUT / f"{slug}.png").stat().st_size > 1500:
                        print(f"  skip existing {slug}")
                        continue
                try:
                    th = fetch_text(f"https://football-logos.cc/italy/{slug}/")
                    lu = logo_url(th, slug)
                except Exception as e:
                    print("  page fail", slug, e)
                    lu = None
                file = None
                if lu:
                    p = download(slug, lu)
                    if p:
                        file = f"immagini/squadre-loghi/{slug}.png"
                by_slug[slug] = {"slug": slug, "name": name, "league": lid, "url": lu, "file": file}
                print(f"  {lid} {i}/{len(pairs)} {slug}: {'OK' if file else 'FAIL'}")
                time.sleep(0.08)

    # merge previous A/B if any missing from map
    if MAP_PATH.exists():
        old = json.loads(MAP_PATH.read_text(encoding="utf-8"))
        for slug, e in (old.get("bySlug") or {}).items():
            if slug not in by_slug and e.get("file"):
                by_slug[slug] = e

    MAP_PATH.write_text(json.dumps({"bySlug": by_slug, "leagues": {k: (v if not isinstance(v, dict) else {gg: [{"name":n,"slug":s} for n,s in lst] for gg,lst in v.items()}) for k,v in by_league.items()}}, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(1 for v in by_slug.values() if v.get("file"))
    print(f"TOTAL logos ok {ok}/{len(by_slug)}")

    # Rebuild catalog pro sections from official lists
    cat = json.loads(CATALOG.read_text(encoding="utf-8")) if CATALOG.exists() else {"teams": [], "leagueOrder": [], "version": 1}
    keep = [t for t in cat.get("teams", []) if not any(x in (t.get("league") or "") for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D")) or "FEMMINILE" in (t.get("league") or "")]
    # keep femminile; drop pro
    keep = [t for t in cat.get("teams", []) if (
        "FEMMINILE" in (t.get("league") or "") or
        not any((t.get("league") or "").startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))
    )]

    new_pro = []
    order = []

    # Serie A
    a_pairs = by_league.get("serie-a") or []
    if a_pairs and isinstance(a_pairs, list):
        order.append("SERIE A")
        for i, (name, slug) in enumerate(a_pairs, 1):
            f = (by_slug.get(slug) or {}).get("file")
            new_pro.append(make_team(name, "SERIE A", slug, i, f))

    # Serie B
    b_pairs = by_league.get("serie-b") or []
    if b_pairs and isinstance(b_pairs, list):
        order.append("SERIE B")
        for i, (name, slug) in enumerate(b_pairs, 1):
            f = (by_slug.get(slug) or {}).get("file")
            new_pro.append(make_team(name, "SERIE B", slug, i, f))

    # Serie C groups
    c_groups = by_league.get("serie-c") or {}
    if isinstance(c_groups, dict):
        for g in sorted(c_groups.keys()):
            label = f"SERIE C · GIRONE {g}"
            order.append(label)
            for i, (name, slug) in enumerate(c_groups[g], 1):
                f = (by_slug.get(slug) or {}).get("file")
                new_pro.append(make_team(name, label, slug, i, f))

    # Serie D groups
    d_groups = by_league.get("serie-d") or {}
    if isinstance(d_groups, dict):
        for g in sorted(d_groups.keys()):
            label = f"SERIE D · GIRONE {g}"
            order.append(label)
            for i, (name, slug) in enumerate(d_groups[g], 1):
                f = (by_slug.get(slug) or {}).get("file")
                new_pro.append(make_team(name, label, slug, i, f))

    # rebuild league order: pro first then rest
    old_order = cat.get("leagueOrder") or []
    rest = [x for x in old_order if x not in order and not any(x.startswith(p) for p in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))]
    # also femminile at end of pro
    fem = [x for x in old_order if "FEMMINILE" in x]
    league_order = order + [x for x in old_order if x not in order and "FEMMINILE" not in x and not any(x.startswith(p) for p in ("SERIE A", "SERIE B", "SERIE C ·", "SERIE D ·", "SERIE A", "SERIE B"))]
    # cleaner: order + eccellenza... from keep teams
    from collections import OrderedDict
    lo = list(order)
    for t in keep:
        lg = t.get("league")
        if lg and lg not in lo:
            lo.append(lg)

    teams = new_pro + keep
    # dedupe ids
    seen = set()
    uniq = []
    for t in teams:
        i = t["id"]
        if i in seen:
            t["id"] = i + "-" + hashlib.md5((t.get("league") or "").encode()).hexdigest()[:4]
        seen.add(t["id"])
        uniq.append(t)

    cat = {
        "version": 2,
        "season": "2025/26–2026/27",
        "source": "football-logos.cc",
        "updatedAt": time.strftime("%Y-%m-%d"),
        "leagueOrder": lo,
        "teams": uniq,
        "stats": {
            "total": len(uniq),
            "leagues": len(lo),
            "logos": sum(1 for t in uniq if t.get("logo")),
            "proLogos": sum(1 for t in new_pro if t.get("logo")),
            "proTeams": len(new_pro),
        },
    }
    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("catalog total", cat["stats"]["total"], "pro", cat["stats"]["proTeams"], "pro logos", cat["stats"]["proLogos"])
    print("A", sum(1 for t in new_pro if t["league"]=="SERIE A"),
          "B", sum(1 for t in new_pro if t["league"]=="SERIE B"),
          "C", sum(1 for t in new_pro if t["league"].startswith("SERIE C")),
          "D", sum(1 for t in new_pro if t["league"].startswith("SERIE D")))

if __name__ == "__main__":
    main()