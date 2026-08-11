# -*- coding: utf-8 -*-
"""
Riprova stadi pro senza foto reale (stadium).
Priorità: default/name_only, poi city fallback.
Wikipedia it/en + commons, sleep lungo anti-429.
"""
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
OUT = ROOT / "immagini" / "stadi"
CACHE = ROOT / "data" / "squadre" / "wiki_stadium_images.json"
DEFAULT = "immagini/stadi/_default.jpg"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "EliseeScout/1.6 (stadium retry; educational static site)",
    "Accept": "*/*",
}
SLEEP = 5.0

# Titoli Wikipedia mirati per i casi più noti ancora mancanti
EXTRA_TITLES = {
    "Stadio Nicola Ceravolo": [
        "Stadio Nicola Ceravolo",
        "Nicola Ceravolo",
    ],
    "Stadio Sandro Cabassi": ["Stadio Sandro Cabassi", "Sandro Cabassi"],
    "Stadio Tre Stelle": ["Stadio Tre Stelle", "Stadio Tre Stelle (Desenzano)"],
    "Stadio Tommaso Dal Molin": ["Stadio Tommaso Dal Molin"],
    "Stadio Giuseppe Voltini": ["Stadio Giuseppe Voltini", "Stadio Voltini"],
    "Stadio Alfredo Viviani": ["Stadio Alfredo Viviani"],
    "Stadio Vito Simone Veneziani": ["Stadio Vito Simone Veneziani"],
    "Stadio Mimmo Pavone": ["Stadio Mimmo Pavone"],
    "Stadio Ferruccio Chittolina": ["Stadio Ferruccio Chittolina"],
    "Stadio Anco Marzio": ["Stadio Anco Marzio"],
    "Stadio Tonino D'Angelo": ["Stadio Tonino D'Angelo", "Stadio Tonino D’Angelo"],
    "Stadio Oreste Granillo": ["Stadio Oreste Granillo"],
    "Stadio Romeo Galli": ["Stadio Romeo Galli"],
    "Stadio Gastone Brilli Peri": ["Stadio Gastone Brilli Peri"],
    "Stadio Mario Sandrini": ["Stadio Mario Sandrini"],
    "Stadio Nicola Tubaldi": ["Stadio Nicola Tubaldi"],
    "Stadio Giovanni Morra": ["Stadio Giovanni Morra"],
    "Stadio Carlo D'Alcontres": ["Stadio Carlo D'Alcontres", "Stadio Carlo D’Alcontres"],
    "Stadio Vittorio Bachelet": ["Stadio Vittorio Bachelet"],
    "Stadio Comunale Montespaccato": [
        "Stadio Comunale Montespaccato",
        "Montespaccato",
    ],
    "Centro Sportivo Lodigiani": [
        "Centro Sportivo Lodigiani",
        "Atletico Lodigiani",
    ],
    "Stadio Fausto Coppi": ["Stadio Fausto Coppi", "Stadio Fausto Coppi (Tortona)"],
    "Stadio Pietro Fortunati": ["Stadio Pietro Fortunati"],
    "Stadio Rino Mercante": ["Stadio Rino Mercante"],
    "Stadio Aldo e Dino Ballarin": ["Stadio Aldo e Dino Ballarin"],
    "Stadio Pier Giovanni Mecchia": ["Stadio Pier Giovanni Mecchia"],
    "Stadio La Marmora-Gagliardi": [
        "Stadio La Marmora-Gagliardi",
        "Stadio Lamarmora",
    ],
    "Stadio Ligorna": ["Stadio Ligorna", "Ligorna"],
    "Stadio Giuseppe Sivori": ["Stadio Giuseppe Sivori"],
    "Stadio Giovanni Parisi": ["Stadio Giovanni Parisi"],
    "Stadio Castellina": ["Stadio Castellina", "Stadio Castellina (Sondrio)"],
    "Stadio Turri": ["Stadio Turri"],
    "Stadio Luigi Muzi": ["Stadio Luigi Muzi"],
    "Stadio Stefano Vicino": ["Stadio Stefano Vicino"],
    "Stadio Vito Curlo": ["Stadio Vito Curlo"],
    "Stadio Gustavo Ventura": ["Stadio Gustavo Ventura"],
    "Stadio Sporting Club": ["Stadio Sporting Club Nola", "Stadio Sporting Club"],
    "Stadio Giovanni Paolo II": [
        "Stadio Giovanni Paolo II (Nardò)",
        "Stadio Giovanni Paolo II (Francavilla Fontana)",
        "Stadio Giovanni Paolo II",
    ],
    "Stadio Marco Salmeri": ["Stadio Marco Salmeri"],
    "Stadio Comunale di Palazzolo": [
        "Stadio Comunale di Palazzolo sull'Oglio",
        "Stadio Comunale (Palazzolo sull'Oglio)",
    ],
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
        ("'", ""),
        ("’", ""),
    ):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:90] or "x"


def path_ok(rel: str) -> bool:
    if not rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2500


def is_pro_m(t: dict) -> bool:
    if t.get("gender") != "m":
        return False
    lg = t.get("league") or ""
    if "FEMMINILE" in lg:
        return False
    return any(lg.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


def stadium_status(t: dict) -> str:
    img = t.get("stadiumImage") or ""
    src = t.get("stadiumImageSource") or ""
    if path_ok(img) and "default" not in img:
        if src == "city" or "city-" in img:
            return "city"
        return "stadium"
    if t.get("stadium"):
        return "name_only"
    return "empty"


def http_get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
        return r.read()


def wiki_thumb(title: str, lang: str = "it") -> str | None:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": 960,
            "redirects": 1,
            "pilicense": "any",
        }
    )
    url = f"https://{lang}.wikipedia.org/w/api.php?{q}"
    try:
        data = json.loads(http_get(url).decode("utf-8", "replace"))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("  429", lang, title[:40], flush=True)
            time.sleep(25)
            return None
        print("  HTTP", e.code, lang, title[:40], flush=True)
        return None
    except Exception as e:
        print("  net", type(e).__name__, lang, title[:40], flush=True)
        time.sleep(5)
        return None
    pages = data.get("query", {}).get("pages", {})
    for p in pages.values():
        if "missing" in p:
            continue
        thumb = p.get("thumbnail", {}).get("source")
        if thumb:
            return thumb
    return None


def wiki_search_title(query: str, lang: str = "it") -> str | None:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 3,
        }
    )
    url = f"https://{lang}.wikipedia.org/w/api.php?{q}"
    try:
        data = json.loads(http_get(url).decode("utf-8", "replace"))
    except Exception:
        return None
    hits = data.get("query", {}).get("search", [])
    if hits:
        return hits[0].get("title")
    return None


def download_image(url: str, dest: Path) -> bool:
    try:
        data = http_get(url)
        if len(data) < 2500:
            return False
        # skip html errors
        if data[:15].lower().startswith(b"<!doctype") or data[:5].lower().startswith(
            b"<html"
        ):
            return False
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return dest.stat().st_size > 2500
    except Exception as e:
        print("  dl fail", e, flush=True)
        return False


def load_cache() -> dict:
    if CACHE.exists():
        try:
            return json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_cache(cache: dict) -> None:
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def resolve_stadium(stadium: str, city: str, cache: dict) -> tuple[str, str] | None:
    """Return (rel_path, source) or None."""
    key = "st:" + stadium
    if key in cache and path_ok(cache[key].get("path", "")):
        return cache[key]["path"], "stadium"

    titles = list(EXTRA_TITLES.get(stadium, []))
    titles.append(stadium)
    if city and "Comunale" in stadium:
        titles.append(f"Stadio Comunale ({city})")
        titles.append(f"Stadio comunale di {city}")
    # dedupe
    seen = set()
    uniq = []
    for t in titles:
        if t and t not in seen:
            seen.add(t)
            uniq.append(t)

    for title in uniq:
        for lang in ("it", "en"):
            time.sleep(SLEEP)
            thumb = wiki_thumb(title, lang)
            if not thumb:
                # search
                time.sleep(SLEEP * 0.5)
                found = wiki_search_title(title, lang)
                if found and found != title:
                    time.sleep(SLEEP)
                    thumb = wiki_thumb(found, lang)
            if not thumb:
                continue
            # prefer full size
            full = re.sub(r"/\d+px-", "/", thumb)
            full = re.sub(r"/thumb/", "/", full)
            # sometimes removing thumb breaks - try original thumb first
            sl = slugify(stadium)
            dest = OUT / f"{sl}.jpg"
            for try_url in (thumb, full):
                if download_image(try_url, dest):
                    rel = f"immagini/stadi/{dest.name}".replace("\\", "/")
                    cache[key] = {"path": rel, "title": title, "url": try_url, "lang": lang}
                    save_cache(cache)
                    return rel, "stadium"
    return None


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = load_cache()

    pro = [t for t in cat["teams"] if is_pro_m(t)]
    miss = [t for t in pro if stadium_status(t) != "stadium"]
    # priority: default/name_only first
    miss.sort(
        key=lambda t: (
            0 if stadium_status(t) in ("empty", "name_only") else 1,
            t.get("league") or "",
            t["name"],
        )
    )
    print(f"retry targets {len(miss)}", flush=True)

    ok_n = 0
    fail_n = 0
    for i, t in enumerate(miss, 1):
        stadium = (t.get("stadium") or "").strip()
        city = (t.get("city") or "").strip()
        if not stadium:
            fail_n += 1
            print(f"[{i}/{len(miss)}] SKIP no stadium name {t['name']}", flush=True)
            continue
        print(f"[{i}/{len(miss)}] {t['name']} | {stadium}", flush=True)
        try:
            got = resolve_stadium(stadium, city, cache)
        except Exception as e:
            print(f"  ERR {type(e).__name__}: {e}", flush=True)
            got = None
        if got:
            rel, src = got
            t["stadiumImage"] = rel
            t["stadiumImageSource"] = src
            ok_n += 1
            print(f"  OK {rel}", flush=True)
        else:
            fail_n += 1
            print("  FAIL", flush=True)

        # checkpoint every 10
        if i % 10 == 0:
            cat["version"] = max(int(cat.get("version") or 37), 38)
            CAT.write_text(
                json.dumps(cat, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            print(f"  checkpoint ok={ok_n} fail={fail_n}", flush=True)

    pro2 = [t for t in cat["teams"] if is_pro_m(t)]
    st = sum(1 for t in pro2 if stadium_status(t) == "stadium")
    cy = sum(1 for t in pro2 if stadium_status(t) == "city")
    other = len(pro2) - st - cy
    cat["version"] = max(int(cat.get("version") or 37), 38)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{st}/{len(pro2)}"
    cat["stats"]["stadiumImagesStadium"] = st
    cat["stats"]["stadiumImagesCity"] = cy
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print("---", flush=True)
    print(f"DONE new_ok={ok_n} fail={fail_n} PRO stadium={st} city={cy} other={other}", flush=True)


if __name__ == "__main__":
    main()
