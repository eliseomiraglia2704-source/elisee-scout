# -*- coding: utf-8 -*-
"""Scarica loghi Serie C + D e ricostruisce organici A-D nel catalogo."""
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
    "Accept": "text/html,*/*;q=0.8",
    "Referer": "https://football-logos.cc/",
}
SKIP = {"serie-a","serie-b","serie-c","serie-d","italy"}

def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()

def fetch_text(url):
    return fetch(url).decode("utf-8", "replace")

def is_size(s):
    return bool(re.fullmatch(r"\d+x\d+", s))

def logo_url(html, slug):
    m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/512x512/{re.escape(slug)}\.[a-f0-9]+\.png', html, re.I)
    if m:
        return m.group(0)
    m = re.search(rf'https://assets\.football-logos\.cc/logos/italy/\d+x\d+/{re.escape(slug)}\.[a-f0-9]+\.png', html, re.I)
    if m:
        return re.sub(r"/\d+x\d+/", "/512x512/", m.group(0))
    return None

def download(slug, url):
    dest = OUT / f"{slug}.png"
    if dest.exists() and dest.stat().st_size > 1500:
        return dest
    data = fetch(url, timeout=35)
    if not data or len(data) < 800 or data[:1] in (b"<", b"{"):
        return None
    dest.write_bytes(data)
    return dest

def parse_groups(html, league_key):
    """Parse Group A/B/C... team slugs+names from league page."""
    # Find group header positions
    headers = list(re.finditer(r">Group\s+([A-I])</h4>", html, re.I))
    groups = {}
    for i, h in enumerate(headers):
        g = h.group(1).upper()
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(html)
        # cut at Matches
        part = html[start:end]
        mstop = re.search(r"Matches in Serie", part, re.I)
        if mstop:
            part = part[: mstop.start()]
        pairs = []
        seen = set()
        # flexible: capture anchor blocks
        for m in re.finditer(r'href=["\']/italy/([a-z0-9-]+)/["\']([^>]*)>([\s\S]*?)</a>', part, re.I):
            slug = m.group(1)
            if slug in SKIP or is_size(slug) or slug.startswith("serie-"):
                continue
            if slug in seen:
                continue
            inner = re.sub(r"<[^>]+>", " ", m.group(3))
            name = re.sub(r"\s+", " ", inner).strip()
            if not name:
                name = slug.replace("-", " ").title()
            seen.add(slug)
            pairs.append((name, slug))
        groups[g] = pairs
    return groups

def parse_flat(html):
    idx = re.search(r"All\s+Serie\s+[A-D]\s+Teams", html, re.I)
    chunk = html[idx.start() :] if idx else html
    mstop = re.search(r"Matches in Serie", chunk, re.I)
    if mstop:
        chunk = chunk[: mstop.start()]
    pairs = []
    seen = set()
    for m in re.finditer(r'href=["\']/italy/([a-z0-9-]+)/["\']([^>]*)>([\s\S]*?)</a>', chunk, re.I):
        slug = m.group(1)
        if slug in SKIP or is_size(slug) or slug.startswith("serie-"):
            continue
        if slug in seen:
            continue
        inner = re.sub(r"<[^>]+>", " ", m.group(3))
        name = re.sub(r"\s+", " ", inner).strip() or slug.replace("-", " ").title()
        seen.add(slug)
        pairs.append((name, slug))
    return pairs

def colors(seed):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + (h >> 16) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"

def abbr(name):
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","FBC","USD","ACD","ASD")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

def make_team(name, league, slug, pos, logo_file):
    p, s = colors(slug)
    return {
        "id": slug,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": name.split()[0].upper(),
        "year": "1900",
        "abbr": abbr(name),
        "gender": "m",
        "pos": pos,
        "pts": max(0, 60 - pos * 2),
        "played": 28,
        "logo": logo_file,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
    }

def ensure_logo(slug, by_slug):
    if slug in by_slug and by_slug[slug].get("file") and (OUT / f"{slug}.png").exists() and (OUT / f"{slug}.png").stat().st_size > 1500:
        return by_slug[slug]["file"]
    try:
        th = fetch_text(f"https://football-logos.cc/italy/{slug}/")
        lu = logo_url(th, slug)
    except Exception as e:
        print("  page", slug, e)
        return None
    if not lu:
        print("  no url", slug)
        return None
    p = download(slug, lu)
    if not p:
        print("  dl fail", slug)
        return None
    return f"immagini/squadre-loghi/{slug}.png"

def main():
    by_slug = {}
    if MAP_PATH.exists():
        old = json.loads(MAP_PATH.read_text(encoding="utf-8"))
        by_slug = old.get("bySlug") or {}

    structure = {}  # league -> list or dict groups

    # A / B flat
    for lid, label in [("serie-a", "SERIE A"), ("serie-b", "SERIE B")]:
        print("===", lid)
        html = fetch_text(f"https://football-logos.cc/italy/{lid}/")
        pairs = parse_flat(html)
        print(" teams", len(pairs))
        structure[lid] = pairs
        for i, (name, slug) in enumerate(pairs, 1):
            f = ensure_logo(slug, by_slug)
            by_slug[slug] = {"slug": slug, "name": name, "league": lid, "url": None, "file": f}
            print(f"  [{i}/{len(pairs)}] {slug}: {'OK' if f else 'FAIL'}")
            time.sleep(0.05)

    # C / D groups
    for lid in ("serie-c", "serie-d"):
        print("===", lid)
        html = fetch_text(f"https://football-logos.cc/italy/{lid}/")
        groups = parse_groups(html, lid)
        if not any(groups.values()):
            # fallback flat
            print("  fallback flat")
            structure[lid] = {"ALL": parse_flat(html)}
        else:
            structure[lid] = groups
        for g, pairs in structure[lid].items():
            print(f"  Group {g}: {len(pairs)}")
            for i, (name, slug) in enumerate(pairs, 1):
                f = ensure_logo(slug, by_slug)
                by_slug[slug] = {"slug": slug, "name": name, "league": lid, "group": g, "file": f}
                print(f"  [{g} {i}/{len(pairs)}] {slug}: {'OK' if f else 'FAIL'}")
                time.sleep(0.05)

    MAP_PATH.write_text(json.dumps({"bySlug": by_slug, "structure": {
        k: (v if isinstance(v, list) else {gg: [{"name": n, "slug": s} for n, s in lst] for gg, lst in v.items()})
        for k, v in structure.items()
    }}, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(1 for v in by_slug.values() if v.get("file"))
    print(f"MAP logos {ok}/{len(by_slug)}")

    # Rebuild catalog pro
    cat = json.loads(CATALOG.read_text(encoding="utf-8")) if CATALOG.exists() else {"teams": []}
    keep = []
    for t in cat.get("teams", []):
        lg = t.get("league") or ""
        if "FEMMINILE" in lg:
            keep.append(t)
            continue
        if lg.startswith("SERIE A") or lg.startswith("SERIE B") or lg.startswith("SERIE C") or lg.startswith("SERIE D"):
            continue
        keep.append(t)

    new_pro = []
    order = []

    for name, slug in structure.get("serie-a") or []:
        if "SERIE A" not in order:
            order.append("SERIE A")
        f = (by_slug.get(slug) or {}).get("file")
        new_pro.append(make_team(name, "SERIE A", slug, len([t for t in new_pro if t["league"] == "SERIE A"]) + 1, f))

    for name, slug in structure.get("serie-b") or []:
        if "SERIE B" not in order:
            order.append("SERIE B")
        f = (by_slug.get(slug) or {}).get("file")
        new_pro.append(make_team(name, "SERIE B", slug, len([t for t in new_pro if t["league"] == "SERIE B"]) + 1, f))

    c_struct = structure.get("serie-c") or {}
    if isinstance(c_struct, dict):
        for g in sorted(c_struct.keys()):
            label = f"SERIE C · GIRONE {g}" if g != "ALL" else "SERIE C"
            order.append(label)
            for i, (name, slug) in enumerate(c_struct[g], 1):
                f = (by_slug.get(slug) or {}).get("file")
                new_pro.append(make_team(name, label, slug, i, f))

    d_struct = structure.get("serie-d") or {}
    if isinstance(d_struct, dict):
        for g in sorted(d_struct.keys()):
            label = f"SERIE D · GIRONE {g}" if g != "ALL" else "SERIE D"
            order.append(label)
            for i, (name, slug) in enumerate(d_struct[g], 1):
                f = (by_slug.get(slug) or {}).get("file")
                new_pro.append(make_team(name, label, slug, i, f))

    lo = list(order)
    for t in keep:
        lg = t.get("league")
        if lg and lg not in lo:
            lo.append(lg)

    teams = new_pro + keep
    seen = set()
    uniq = []
    for t in teams:
        tid = t["id"]
        if tid in seen:
            t["id"] = tid + "-" + hashlib.md5((t.get("league") or "").encode()).hexdigest()[:4]
        seen.add(t["id"])
        uniq.append(t)

    out = {
        "version": 3,
        "season": "2025/26–2026/27",
        "source": "https://football-logos.cc/italy/",
        "updatedAt": time.strftime("%Y-%m-%d"),
        "leagueOrder": lo,
        "teams": uniq,
        "stats": {
            "total": len(uniq),
            "leagues": len(lo),
            "logos": sum(1 for t in uniq if t.get("logo")),
            "proTeams": len(new_pro),
            "proLogos": sum(1 for t in new_pro if t.get("logo")),
        },
    }
    CATALOG.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("DONE pro", out["stats"]["proTeams"], "proLogos", out["stats"]["proLogos"], "total", out["stats"]["total"])
    print("A", sum(1 for t in new_pro if t["league"]=="SERIE A"),
          "B", sum(1 for t in new_pro if t["league"]=="SERIE B"),
          "C", sum(1 for t in new_pro if "SERIE C" in t["league"]),
          "D", sum(1 for t in new_pro if "SERIE D" in t["league"]))

if __name__ == "__main__":
    main()
