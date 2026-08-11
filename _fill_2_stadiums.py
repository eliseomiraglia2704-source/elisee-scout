# -*- coding: utf-8 -*-
"""Retry last 2 stadium photos with longer backoff."""
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
    "User-Agent": "EliseeScout/1.9 (stadium retry; educational static site; contact local)",
    "Accept": "*/*",
}

TARGETS = {
    "Stadio Giuseppe Voltini": [
        "Stadio Giuseppe Voltini",
        "Stadio Voltini Crema",
        "Voltini stadium Crema",
        "Pergolettese stadium",
    ],
    "Stadio Mimmo Pavone": [
        "Stadio Mimmo Pavone",
        "Mimmo Pavone Pineto",
        "Pineto Calcio stadio",
        "Stadio comunale Pineto",
    ],
}


def slugify(name: str) -> str:
    s = name.lower()
    for a, b in (("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("'", ""), ("’", "")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:90]


def get(url: str) -> bytes:
    last = None
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=50, context=CTX) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = e
            wait = 15 * (attempt + 1)
            print(f"  HTTP {e.code} sleep {wait}s", flush=True)
            time.sleep(wait)
        except Exception as e:
            last = e
            time.sleep(8)
    raise last  # type: ignore


def api(host: str, params: dict) -> dict:
    url = f"https://{host}/w/api.php?" + urllib.parse.urlencode(params)
    return json.loads(get(url).decode("utf-8", "replace"))


def save_img(data: bytes, dest: Path) -> bool:
    if len(data) < 2500:
        return False
    if data[:15].lower().startswith(b"<!doctype") or data[:5].lower().startswith(b"<html"):
        return False
    dest.write_bytes(data)
    return dest.stat().st_size > 2500


def try_page(host: str, title: str) -> str | None:
    data = api(
        host,
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages|images",
            "format": "json",
            "pithumbsize": 960,
            "redirects": 1,
            "pilicense": "any",
            "imlimit": 20,
        },
    )
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        if str(p.get("pageid", -1)).startswith("-") or "missing" in p:
            continue
        th = (p.get("thumbnail") or {}).get("source")
        if th:
            return th.split("?")[0]
        # try first file on page that looks like a photo
        for im in p.get("images") or []:
            fn = im.get("title") or ""
            low = fn.lower()
            if not low.startswith("file:"):
                continue
            if any(x in low for x in (".svg", "logo", "crest", "icon", "flag", "coat")):
                continue
            if any(x in low for x in (".jpg", ".jpeg", ".png", ".webp")):
                # resolve imageinfo
                time.sleep(3)
                info = api(
                    host,
                    {
                        "action": "query",
                        "titles": fn,
                        "prop": "imageinfo",
                        "iiprop": "url",
                        "iiurlwidth": 960,
                        "format": "json",
                    },
                )
                for ip in (info.get("query") or {}).get("pages", {}).values():
                    ii = (ip.get("imageinfo") or [{}])[0]
                    u = ii.get("thumburl") or ii.get("url")
                    if u:
                        return u.split("?")[0]
    return None


def commons_search(q: str) -> str | None:
    data = api(
        "commons.wikimedia.org",
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,
            "gsrlimit": 20,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 960,
            "format": "json",
        },
    )
    best = None
    best_score = -1
    for p in ((data.get("query") or {}).get("pages") or {}).values():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("thumburl") or info.get("url")
        title = (p.get("title") or "").lower()
        mime = (info.get("mime") or "").lower()
        if not url or "image" not in mime:
            continue
        if any(x in title for x in ("logo", "crest", "badge", "svg", "icon", "map", "flag")):
            continue
        score = 0
        if any(x in title for x in ("stadio", "stadium", "voltini", "pavone", "crema", "pineto", "tribuna")):
            score += 6
        if int(info.get("width") or 0) >= 500:
            score += 2
        if score > best_score:
            best_score = score
            best = url.split("?")[0]
    return best


def resolve(stadium: str) -> str | None:
    sl = slugify(stadium)
    dest = OUT / f"{sl}.jpg"
    if dest.exists() and dest.stat().st_size > 2500:
        return f"immagini/stadi/{dest.name}"

    for q in TARGETS[stadium]:
        for host in ("it.wikipedia.org", "en.wikipedia.org"):
            print(f"  try page {host} {q}", flush=True)
            time.sleep(4)
            try:
                url = try_page(host, q)
            except Exception as e:
                print("   err", e, flush=True)
                url = None
            if url:
                print("   thumb", url[:90], flush=True)
                time.sleep(3)
                try:
                    if save_img(get(url), dest):
                        return f"immagini/stadi/{dest.name}"
                except Exception as e:
                    print("   dl", e, flush=True)

        print(f"  commons {q}", flush=True)
        time.sleep(5)
        try:
            url = commons_search(q)
        except Exception as e:
            print("   commons err", e, flush=True)
            url = None
        if url:
            print("   commons url", url[:90], flush=True)
            time.sleep(3)
            try:
                if save_img(get(url), dest):
                    return f"immagini/stadi/{dest.name}"
            except Exception as e:
                print("   dl", e, flush=True)

    # city-level last resort: keep city images but mark? No - try openstreetmap / skip
    return None


def main() -> None:
    time.sleep(8)  # cool-off after previous 429s
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            pass

    for st in TARGETS:
        print("===", st, flush=True)
        rel = resolve(st)
        if not rel:
            print("FAIL", st, flush=True)
            continue
        print("OK", st, rel, flush=True)
        cache[st] = {"path": rel, "source": "stadium"}
        cache["st:" + st] = cache[st]
        for t in cat["teams"]:
            if (t.get("stadium") or "").strip() == st:
                t["stadiumImage"] = rel
                t["stadiumImageSource"] = "stadium"
                print("  apply", t["name"], flush=True)

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

    def is_pro(t):
        if t.get("gender") != "m":
            return False
        lg = t.get("league") or ""
        return any(lg.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D")) and "FEMMINILE" not in lg

    def status(t):
        img = t.get("stadiumImage") or ""
        src = t.get("stadiumImageSource") or ""
        p = ROOT / img if img else None
        ok = bool(p and p.exists() and p.stat().st_size > 2500 and "default" not in img)
        if ok:
            return "city" if src == "city" or "city-" in img else "stadium"
        return "miss"

    pro = [t for t in cat["teams"] if is_pro(t)]
    from collections import Counter

    c = Counter(status(t) for t in pro)
    cat["version"] = max(int(cat.get("version") or 42), 43)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{c.get('stadium',0)}/{len(pro)}"
    cat["stats"]["stadiumImagesStadium"] = c.get("stadium", 0)
    cat["stats"]["stadiumImagesCity"] = c.get("city", 0)
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("DONE", dict(c), "of", len(pro), flush=True)
    for t in pro:
        if status(t) != "stadium":
            print("STILL", t["name"], t.get("stadium"), t.get("stadiumImage"))


if __name__ == "__main__":
    main()
