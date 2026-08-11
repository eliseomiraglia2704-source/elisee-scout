# -*- coding: utf-8 -*-
"""Assegna a OGNI squadra un'immagine stadio locale (Wikipedia + fallback)."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
OUT_DIR = ROOT / "immagini" / "stadi"
CACHE = ROOT / "data" / "squadre" / "wiki_stadium_images.json"
REPORT = ROOT / "data" / "squadre" / "wiki_stadium_images_report.json"
DEFAULT_REL = "immagini/stadi/_default.jpg"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "EliseeScout/1.2 (stadium images for local scout app; Wikipedia)",
    "Accept": "application/json,image/*",
}

STADIUM_TITLE = {
    "Gewiss Stadium": "Stadio di Bergamo",
    "Allianz Stadium": "Juventus Stadium",
    "Stadio Diego Armando Maradona": "Stadio Diego Armando Maradona",
    "Stadio Giuseppe Meazza": "Stadio Giuseppe Meazza",
    "Stadio Olimpico": "Stadio Olimpico (Roma)",
    "Stadio Olimpico Grande Torino": "Stadio Olimpico Grande Torino",
    "Bluenergy Stadium": "Stadio Friuli",
    "Unipol Domus": "Unipol Domus",
    "Mapei Stadium - Citta del Tricolore": "Mapei Stadium - Città del Tricolore",
    "U-Power Stadium": "Stadio Brianteo",
    "Arena Garibaldi - Romeo Anconetani": "Stadio Arena Garibaldi-Romeo Anconetani",
    "Orogel Stadium - Dino Manuzzi": "Orogel Stadium-Dino Manuzzi",
    "Stadio Via del Mare": "Stadio Via del Mare",
    "Stadio San Nicola": "Stadio San Nicola",
    "Stadio Renzo Barbera": "Stadio Renzo Barbera",
    "Stadio Luigi Ferraris": "Stadio Luigi Ferraris",
    "Stadio Artemio Franchi": "Stadio Artemio Franchi",
    "Stadio Marcantonio Bentegodi": "Stadio Marcantonio Bentegodi",
    "Stadio Alberto Picco": "Stadio Alberto Picco",
    "Stadio Giovanni Zini": "Stadio Giovanni Zini",
    "Stadio Ennio Tardini": "Stadio Ennio Tardini",
    "Stadio Giuseppe Sinigaglia": "Stadio Giuseppe Sinigaglia",
    "Stadio Pier Luigi Penzo": "Stadio Pier Luigi Penzo",
    "Stadio Benito Stirpe": "Stadio Benito Stirpe",
    "Stadio Renato Dall'Ara": "Stadio Renato Dall'Ara",
    "Stadio Carlo Castellani": "Stadio Carlo Castellani",
    "Stadio Nicola Ceravolo": "Stadio Nicola Ceravolo",
    "Stadio Alberto Braglia": "Stadio Alberto Braglia",
    "Stadio Euganeo": "Stadio Euganeo",
    "Stadio Druso": "Stadio Druso",
    "Stadio Romeo Menti": "Stadio Romeo Menti",
    "Stadio Arechi": "Stadio Arechi",
    "Stadio Angelo Massimino": "Stadio Angelo Massimino",
    "Stadio Ezio Scida": "Stadio Ezio Scida",
    "Stadio San Vito-Gigi Marulla": "Stadio San Vito-Gigi Marulla",
    "Stadio Pino Zaccheria": "Stadio Pino Zaccheria",
    "Stadio Adriatico - Giovanni Cornacchia": "Stadio Adriatico-Giovanni Cornacchia",
    "Stadio Renato Curi": "Stadio Renato Curi",
    "Stadio Mario Rigamonti": "Stadio Mario Rigamonti",
    "Stadio Oreste Granillo": "Stadio Oreste Granillo",
    "Stadio Ciro Vigorito": "Stadio Ciro Vigorito",
    "Stadio Partenio-Adriano Lombardi": "Stadio Partenio-Adriano Lombardi",
    "Stadio Cino e Lillo Del Duca": "Stadio Cino e Lillo Del Duca",
    "Stadio del Conero": "Stadio del Conero",
    "Stadio San Filippo-Franco Scoglio": "Stadio San Filippo",
    "Stadio Leonardo Garilli": "Stadio Leonardo Garilli",
    "San Marino Stadium": "San Marino Stadium",
    "Stadio Ernesto Breda": "Stadio Breda",
    "Stadio Breda": "Stadio Breda",
    "AlbinoLeffe Stadium": "AlbinoLeffe Stadium",
    "Stadio Franco Ossola": "Stadio Franco Ossola",
    "Stadio Silvio Piola": "Stadio Silvio Piola (Novara)",
    "Juventus Training Center": "Juventus Training Center",
    "Centro Sportivo Bortolotti": "Centro Sportivo Bortolotti",
    "Centro Sportivo Vismara": "Centro Sportivo Vismara Milanello",
}


def slugify(name: str) -> str:
    s = (name or "").lower().strip()
    for a, b in (
        ("à", "a"),
        ("è", "e"),
        ("é", "e"),
        ("ì", "i"),
        ("ò", "o"),
        ("ù", "u"),
        ("ä", "a"),
        ("ö", "o"),
        ("ü", "u"),
        ("'", ""),
        ("’", ""),
    ):
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:90] or "stadio"


def ensure_default() -> str:
    dest = ROOT / DEFAULT_REL
    if dest.exists() and dest.stat().st_size > 800:
        return DEFAULT_REL
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image, ImageDraw

        im = Image.new("RGB", (960, 540), (8, 14, 28))
        d = ImageDraw.Draw(im)
        d.ellipse((120, 160, 840, 480), outline=(40, 70, 110), width=6)
        d.ellipse((220, 220, 740, 420), outline=(30, 55, 90), width=4)
        d.rectangle((100, 300, 860, 330), fill=(18, 32, 55))
        d.polygon([(180, 300), (240, 120), (300, 300)], fill=(22, 40, 70))
        d.polygon([(660, 300), (720, 120), (780, 300)], fill=(22, 40, 70))
        d.text((400, 40), "STADIO", fill=(120, 150, 180))
        im.save(dest, "JPEG", quality=85)
    except Exception:
        # solid dark PNG 2x2 expanded by PIL alternative: write tiny jpeg
        dest.write_bytes(
            bytes.fromhex(
                "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707"
                "070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c"
                "1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d"
                "0d1832211c2132323232323232323232323232323232323232323232323232323232"
                "323232323232323232323232323232323232323232ffc00011080001000103011100"
                "02110311ffc40014000100000000000000000000000000000008ffc4001410010000"
                "0000000000000000000000000000ffda000c0301000210031000003f00bf80ffd9"
            )
        )
    print("default created", dest)
    return DEFAULT_REL


def api_get(params, retries=5):
    q = urllib.parse.urlencode(params)
    url = "https://it.wikipedia.org/w/api.php?" + q
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 503):
                wait = 5.0 * (attempt + 1)
                print(f"  rate-limit {e.code}, sleep {wait:.0f}s", flush=True)
                time.sleep(wait)
                continue
            time.sleep(1.2)
        except Exception as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    if last:
        raise last
    return {}


def wiki_thumb(title: str, size: int = 960):
    if not title:
        return None, None
    data = api_get(
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": size,
            "redirects": 1,
            "pilicense": "any",
        }
    )
    pages = (data or {}).get("query", {}).get("pages", {})
    for pid, p in pages.items():
        if str(pid).startswith("-"):
            continue
        thumb = (p.get("thumbnail") or {}).get("source")
        if thumb:
            return p.get("title") or title, thumb.split("?")[0]
    return None, None


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=55, context=CTX) as r:
        data = r.read()
    if len(data) < 2000:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return True


def local_path_for_key(key: str):
    slug = slugify(key.replace("city:", ""))
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = OUT_DIR / f"{slug}{ext}"
        if p.exists() and p.stat().st_size > 2000:
            return f"immagini/stadi/{slug}{ext}"
    # also try with city- prefix slug used before
    if key.startswith("city:"):
        slug2 = slugify(key)
        for ext in (".jpg", ".jpeg", ".png", ".webp"):
            p = OUT_DIR / f"{slug2}{ext}"
            if p.exists() and p.stat().st_size > 2000:
                return f"immagini/stadi/{slug2}{ext}"
    return None


def path_ok(rel: str | None) -> bool:
    if not rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2000


def fetch_and_save(key: str, titles: list[str], cache: dict) -> str | None:
    if key in cache and path_ok(cache[key].get("path")):
        return cache[key]["path"]

    local = local_path_for_key(key)
    if local:
        cache[key] = {"path": local, "source": "local"}
        return local

    slug = slugify(key)
    for title in titles:
        title = (title or "").strip()
        if not title:
            continue
        try:
            real, url = wiki_thumb(title)
        except Exception as e:
            print("  api err", title, e, flush=True)
            time.sleep(1.5)
            continue
        time.sleep(0.7)
        if not url:
            continue
        ext = ".jpg"
        low = url.lower()
        if ".png" in low:
            ext = ".png"
        elif ".webp" in low:
            ext = ".webp"
        rel = f"immagini/stadi/{slug}{ext}"
        dest = ROOT / rel
        try:
            if download(url, dest):
                cache[key] = {
                    "path": rel,
                    "wikiTitle": real,
                    "url": url,
                    "source": "wikipedia",
                }
                print(f"OK {key} <- {real}", flush=True)
                return rel
        except Exception as e:
            print(f"  dl fail {title}: {e}", flush=True)
            time.sleep(1.5)
    return None


def stadium_titles(stadium: str, team: str) -> list[str]:
    st = (stadium or "").strip()
    titles = []
    if st in STADIUM_TITLE:
        titles.append(STADIUM_TITLE[st])
    if st:
        titles.append(st)
        if not st.lower().startswith("stadio") and "stadium" not in st.lower() and "centro" not in st.lower():
            titles.append("Stadio " + st)
        base = re.sub(
            r"^(Allianz|Gewiss|Bluenergy|Unipol|U-Power|Orogel|Mapei)\s+",
            "",
            st,
            flags=re.I,
        ).strip(" -–")
        if base and base != st:
            titles.append(base)
            if not base.lower().startswith("stadio"):
                titles.append("Stadio " + base)
        titles.append(st.split(" - ")[0].split(" – ")[0].strip())
    if team:
        titles.append(team)
        titles.append(team + " Calcio")
    seen = set()
    out = []
    for t in titles:
        t = (t or "").strip()
        if t and t.lower() not in seen:
            seen.add(t.lower())
            out.append(t)
    return out


def city_titles(city: str) -> list[str]:
    c = (city or "").strip()
    if not c or c.upper() in ("ITALIA", "—", "-", "NONE"):
        return []
    pretty = c.title() if c.isupper() else c
    return [pretty, pretty + " (Italia)"]


def league_rank(league: str) -> int:
    u = (league or "").upper()
    if u.startswith("SERIE A"):
        return 0
    if u.startswith("SERIE B"):
        return 1
    if u.startswith("SERIE C"):
        return 2
    if u.startswith("SERIE D"):
        return 3
    return 5


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    default_rel = ensure_default()
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    teams = cat["teams"]
    print("teams", len(teams), flush=True)

    # --- 1) resolve unique stadiums (priority A→D) ---
    by_st: dict[str, list] = {}
    for t in teams:
        st = (t.get("stadium") or "").strip()
        if st:
            by_st.setdefault(st, []).append(t)

    stadium_order = sorted(
        by_st.keys(),
        key=lambda s: min(league_rank(x.get("league")) for x in by_st[s]),
    )
    print("unique stadiums", len(stadium_order), flush=True)

    stadium_path: dict[str, str] = {}
    fail_st = []
    for i, st in enumerate(stadium_order, 1):
        sample = by_st[st][0].get("name") or ""
        path = fetch_and_save(st, stadium_titles(st, sample), cache)
        if path:
            stadium_path[st] = path
        else:
            fail_st.append(st)
            print("FAIL stadium", st, flush=True)
        if i % 15 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  stadium {i}/{len(stadium_order)} ok={len(stadium_path)}", flush=True)

    # --- 2) cities needed by teams without stadium image ---
    need_cities = set()
    for t in teams:
        st = (t.get("stadium") or "").strip()
        if st and st in stadium_path:
            continue
        city = (t.get("city") or "").strip()
        if city and city.upper() not in ("ITALIA", "—", "-", "NONE", ""):
            # skip if city name is same as team-only garbage
            need_cities.add(city)

    print("cities to fetch", len(need_cities), flush=True)
    city_path: dict[str, str] = {}
    for i, city in enumerate(sorted(need_cities), 1):
        path = fetch_and_save("city:" + city, city_titles(city), cache)
        if path:
            city_path[city.upper()] = path
        if i % 25 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  city {i}/{len(need_cities)} ok={len(city_path)}", flush=True)

    # --- 3) assign ALL teams ---
    wiki_count = city_count = default_count = 0
    for t in teams:
        st = (t.get("stadium") or "").strip()
        city = (t.get("city") or "").strip().upper()
        path = None
        source = "default"

        if st and st in stadium_path and path_ok(stadium_path[st]):
            path = stadium_path[st]
            source = "stadium"
        elif st and st in cache and path_ok(cache[st].get("path")):
            path = cache[st]["path"]
            source = "stadium"

        if not path and city and city in city_path and path_ok(city_path[city]):
            path = city_path[city]
            source = "city"
        elif not path and city:
            ck = "city:" + city
            if ck in cache and path_ok(cache[ck].get("path")):
                path = cache[ck]["path"]
                source = "city"
            else:
                local = local_path_for_key(city) or local_path_for_key(ck)
                if local:
                    path = local
                    source = "city"

        if not path or not path_ok(path):
            path = default_rel
            source = "default"

        t["stadiumImage"] = str(path).replace("\\", "/")
        t["stadiumImageSource"] = source
        if source == "stadium":
            wiki_count += 1
        elif source == "city":
            city_count += 1
        else:
            default_count += 1

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    cat["version"] = max(int(cat.get("version") or 10), 12)
    if "stats" not in cat or not isinstance(cat["stats"], dict):
        cat["stats"] = {}
    cat["stats"]["stadiumImages"] = len(teams)
    cat["stats"]["stadiumImagesStadium"] = wiki_count
    cat["stats"]["stadiumImagesCity"] = city_count
    cat["stats"]["stadiumImagesDefault"] = default_count
    cat["stats"]["stadiumFail"] = len(fail_st)
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    REPORT.write_text(
        json.dumps(
            {
                "stadiumOk": len(stadium_path),
                "stadiumFail": fail_st[:80],
                "stadiumFailCount": len(fail_st),
                "assignedStadium": wiki_count,
                "assignedCity": city_count,
                "assignedDefault": default_count,
                "totalTeams": len(teams),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        "DONE total",
        len(teams),
        "stadium",
        wiki_count,
        "city",
        city_count,
        "default",
        default_count,
        "fail_st",
        len(fail_st),
        flush=True,
    )


if __name__ == "__main__":
    main()
