# -*- coding: utf-8 -*-
"""Scarica foto reali per gli ultimi stadi pro senza stadiumImage (city/default)."""
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
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "EliseeScout/1.8 (stadium fill; static educational site)",
    "Accept": "*/*",
}
SLEEP = 1.6

# Titoli/query mirati per gli ultimi mancanti
TITLES: dict[str, list[str]] = {
    "Stadio Tommaso Dal Molin": [
        "Stadio Tommaso Dal Molin",
        "Tommaso Dal Molin",
        "Arzignano Valchiampo",
    ],
    "Stadio Giuseppe Voltini": [
        "Stadio Giuseppe Voltini",
        "Stadio Voltini",
        "Giuseppe Voltini",
    ],
    "Stadio Mimmo Pavone": [
        "Stadio Mimmo Pavone",
        "Mimmo Pavone",
        "Pineto Calcio",
    ],
    "Stadio Ferruccio Chittolina": [
        "Stadio Ferruccio Chittolina",
        "Ferruccio Chittolina",
        "Vado F.C.",
    ],
    "Stadio Vito Simone Veneziani": [
        "Stadio Vito Simone Veneziani",
        "Vito Simone Veneziani",
        "SS Monopoli 1966",
    ],
    "Stadio Alfredo Viviani": [
        "Stadio Alfredo Viviani",
        "Alfredo Viviani",
        "Potenza Calcio",
    ],
    "Stadio Giuseppe Sivori": [
        "Stadio Giuseppe Sivori",
        "Giuseppe Sivori",
        "USD Sestri Levante 1919",
    ],
    "Stadio Pietro Fortunati": [
        "Stadio Pietro Fortunati",
        "Pietro Fortunati",
        "A.C. Pavia 1911",
    ],
    "Stadio Giovanni Parisi": [
        "Stadio Giovanni Parisi",
        "Stadio Giovanni Parisi (Voghera)",
        "Vogherese Calcio",
    ],
    "Stadio Rino Mercante": [
        "Stadio Rino Mercante",
        "Rino Mercante",
        "Bassano Virtus",
    ],
    "Stadio Pier Giovanni Mecchia": [
        "Stadio Pier Giovanni Mecchia",
        "Pier Giovanni Mecchia",
        "Calcio Portogruaro Summaga",
    ],
    "Stadio Aldo e Dino Ballarin": [
        "Stadio Aldo e Dino Ballarin",
        "Stadio Ballarin",
        "Union Clodiense Chioggia",
    ],
    "Stadio Romeo Galli": [
        "Stadio Romeo Galli",
        "Romeo Galli",
        "Imolese Calcio 1919",
    ],
    "Stadio Nicola Tubaldi": [
        "Stadio Nicola Tubaldi",
        "Nicola Tubaldi",
        "US Recanatese",
    ],
    "Stadio Vittorio Bachelet": [
        "Stadio Vittorio Bachelet",
        "Vittorio Bachelet (stadio)",
        "Trastevere Calcio",
    ],
    "Stadio Oreste Granillo": [
        "Stadio Oreste Granillo",
        "Oreste Granillo",
        "Reggina 1914",
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


def http_get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45, context=CTX) as r:
        return r.read()


def api(host: str, params: dict) -> dict:
    url = f"https://{host}/w/api.php?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(5):
        try:
            return json.loads(http_get(url).decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 503):
                time.sleep(10 * (attempt + 1))
                continue
            time.sleep(2)
        except Exception as e:
            last = e
            time.sleep(2)
    if last:
        raise last
    return {}


def page_thumb(host: str, title: str, size: int = 960) -> str | None:
    data = api(
        host,
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": size,
            "redirects": 1,
            "pilicense": "any",
        },
    )
    for pid, p in (data.get("query") or {}).get("pages", {}).items():
        if str(pid).startswith("-"):
            continue
        th = (p.get("thumbnail") or {}).get("source")
        if th:
            return th.split("?")[0]
    return None


def search_title(host: str, query: str) -> str | None:
    data = api(
        host,
        {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 5,
        },
    )
    hits = (data.get("query") or {}).get("search") or []
    for h in hits:
        t = h.get("title") or ""
        # prefer stadium-ish
        tl = t.lower()
        if any(x in tl for x in ("stadio", "stadium", "arena", "campo", "ballarin", "granillo", "viviani", "voltini", "fortunati", "mercante", "chittolina", "pavone", "veneziani", "sivori", "tubaldi", "bachelet", "galli", "parisi", "mecchia", "dal molin")):
            return t
    return hits[0]["title"] if hits else None


def commons_file_url(query: str, size: int = 960) -> str | None:
    data = api(
        "commons.wikimedia.org",
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": 15,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": size,
            "format": "json",
        },
    )
    pages = (data.get("query") or {}).get("pages") or {}
    scored: list[tuple[int, str]] = []
    for p in pages.values():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("thumburl") or info.get("url")
        title = (p.get("title") or "").lower()
        mime = (info.get("mime") or "").lower()
        if not url or "image" not in mime:
            continue
        if any(x in title for x in ("logo", "crest", "badge", "stemm", "icon", "flag", "map", "svg")):
            continue
        score = 0
        if any(x in title for x in ("stadio", "stadium", "tribuna", "curva", "campo", "notturna", "panorama")):
            score += 5
        if any(x in title for x in ("calcio", "football", "soccer", "match")):
            score += 2
        w = int(info.get("width") or 0)
        if w >= 600:
            score += 2
        scored.append((score, url.split("?")[0]))
    scored.sort(key=lambda x: -x[0])
    return scored[0][1] if scored else None


def download(url: str, dest: Path) -> bool:
    try:
        data = http_get(url)
        if len(data) < 2500:
            return False
        if data[:15].lower().startswith(b"<!doctype") or data[:5].lower().startswith(b"<html"):
            return False
        # JPEG/PNG/WEBP magic
        if not (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n" or data[:4] == b"RIFF"):
            # still accept if large enough binary
            if len(data) < 8000:
                return False
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return dest.stat().st_size > 2500
    except Exception as e:
        print("  dl fail", type(e).__name__, e, flush=True)
        return False


def resolve(stadium: str) -> tuple[str, str] | None:
    """Return (rel_path, source_url) or None."""
    sl = slugify(stadium)
    # reuse existing good file if present
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        cand = OUT / f"{sl}{ext}"
        if cand.exists() and cand.stat().st_size > 2500:
            # only if not a city- file wrongly named
            if not cand.name.startswith("city-"):
                return f"immagini/stadi/{cand.name}", "local"

    queries = list(TITLES.get(stadium, []))
    queries.append(stadium)
    # dedupe
    seen: set[str] = set()
    qs: list[str] = []
    for q in queries:
        if q and q not in seen:
            seen.add(q)
            qs.append(q)

    hosts = ("it.wikipedia.org", "en.wikipedia.org")
    for q in qs:
        for host in hosts:
            time.sleep(SLEEP)
            try:
                thumb = page_thumb(host, q)
            except Exception as e:
                print("  page err", host, q[:40], e, flush=True)
                thumb = None
            if not thumb:
                time.sleep(SLEEP * 0.4)
                try:
                    found = search_title(host, q + " stadio")
                except Exception:
                    found = None
                if found:
                    time.sleep(SLEEP)
                    try:
                        thumb = page_thumb(host, found)
                    except Exception:
                        thumb = None
            if not thumb:
                continue
            dest = OUT / f"{sl}.jpg"
            if download(thumb, dest):
                return f"immagini/stadi/{dest.name}", thumb

        # Commons search
        time.sleep(SLEEP)
        try:
            c_url = commons_file_url(f"{q} stadio")
        except Exception as e:
            print("  commons err", q[:40], e, flush=True)
            c_url = None
        if c_url:
            dest = OUT / f"{sl}.jpg"
            if download(c_url, dest):
                return f"immagini/stadi/{dest.name}", c_url
    return None


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


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache: dict = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    pro = [t for t in cat["teams"] if is_pro_m(t)]
    miss = [t for t in pro if stadium_status(t) != "stadium"]
    # unique stadiums among miss
    stadiums = sorted({(t.get("stadium") or "").strip() for t in miss if (t.get("stadium") or "").strip()})
    print(f"unique stadiums to fill: {len(stadiums)} (teams miss={len(miss)})", flush=True)

    resolved: dict[str, str] = {}  # stadium -> rel
    for i, st in enumerate(stadiums, 1):
        print(f"[{i}/{len(stadiums)}] {st}", flush=True)
        # cache hit under stadium key or st: key
        for k in (st, "st:" + st):
            if k in cache and path_ok(cache[k].get("path", "")):
                p = cache[k]["path"]
                if "city-" not in p and "default" not in p:
                    resolved[st] = p
                    print(f"  cache {p}", flush=True)
                    break
        if st in resolved:
            continue
        got = resolve(st)
        if got:
            rel, url = got
            resolved[st] = rel
            cache[st] = {"path": rel, "url": url, "source": "stadium"}
            cache["st:" + st] = cache[st]
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  OK {rel}", flush=True)
        else:
            print("  FAIL", flush=True)

    # apply to all teams with that stadium name
    applied = 0
    for t in cat["teams"]:
        st = (t.get("stadium") or "").strip()
        if st in resolved:
            t["stadiumImage"] = resolved[st]
            t["stadiumImageSource"] = "stadium"
            applied += 1

    pro2 = [t for t in cat["teams"] if is_pro_m(t)]
    st_n = sum(1 for t in pro2 if stadium_status(t) == "stadium")
    cy_n = sum(1 for t in pro2 if stadium_status(t) == "city")
    other = len(pro2) - st_n - cy_n
    cat["version"] = max(int(cat.get("version") or 41), 42)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{st_n}/{len(pro2)}"
    cat["stats"]["stadiumImagesStadium"] = st_n
    cat["stats"]["stadiumImagesCity"] = cy_n
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("---", flush=True)
    print(
        f"DONE resolved={len(resolved)}/{len(stadiums)} applied_teams={applied} "
        f"PRO stadium={st_n} city={cy_n} other={other}",
        flush=True,
    )
    still = [t for t in pro2 if stadium_status(t) != "stadium"]
    for t in still:
        print("STILL", t["name"], "|", t.get("stadium"), "|", t.get("stadiumImageSource"), "|", t.get("stadiumImage"))


if __name__ == "__main__":
    main()
