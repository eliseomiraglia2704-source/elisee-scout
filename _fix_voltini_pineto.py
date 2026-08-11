# -*- coding: utf-8 -*-
"""Fix Voltini (wrong Tempietto) + try Pineto/Voltini from club sites / commons geo."""
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
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "EliseeScout/2.1 (stadium assets; educational static site)",
    "Accept": "text/html,image/*,*/*",
}


def get(url: str, referer: str | None = None) -> bytes:
    h = dict(UA)
    if referer:
        h["Referer"] = referer
    last = None
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, timeout=45, context=CTX) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = e
            time.sleep(10 * (i + 1))
        except Exception as e:
            last = e
            time.sleep(5)
    raise last  # type: ignore


def save_if_photo(data: bytes, dest: Path) -> bool:
    if len(data) < 8000:
        return False
    if data[:15].lower().startswith(b"<!doctype") or data[:5].lower().startswith(b"<html"):
        return False
    # reject tiny icons / png logos
    if data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) < 20000:
        # might still be photo png; check dimensions later via header if needed
        pass
    # reject known bad tempietto if somehow same size
    dest.write_bytes(data)
    # basic: file must look like jpeg or decent png
    ok = data[:3] == b"\xff\xd8\xff" or (data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) > 30000) or data[:4] == b"RIFF"
    if not ok:
        dest.unlink(missing_ok=True)
        return False
    return dest.stat().st_size > 8000


def extract_imgs(html: str, base: str) -> list[str]:
    urls = []
    for m in re.finditer(r'(?:src|data-src|content)=["\']([^"\']+\.(?:jpg|jpeg|png|webp)(?:\?[^"\']*)?)["\']', html, re.I):
        u = m.group(1)
        if u.startswith("//"):
            u = "https:" + u
        elif u.startswith("/"):
            u = urllib.parse.urljoin(base, u)
        elif not u.startswith("http"):
            u = urllib.parse.urljoin(base, u)
        low = u.lower()
        if any(x in low for x in ("logo", "icon", "favicon", "sprite", "avatar", "emoji", "wp-includes", "gravatar")):
            continue
        urls.append(u.split("?")[0] if "pineto" in base else u)
    # dedupe keep order
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def try_club_pages(pages: list[str], dest: Path, keywords: list[str]) -> bool:
    for page in pages:
        print("  page", page, flush=True)
        try:
            html = get(page).decode("utf-8", "replace")
        except Exception as e:
            print("   fail", e, flush=True)
            continue
        imgs = extract_imgs(html, page)
        # rank by keywords in url
        def score(u: str) -> int:
            low = u.lower()
            s = 0
            for k in keywords:
                if k in low:
                    s += 3
            if any(x in low for x in ("stadio", "stadium", "tribuna", "campo", "impianto", "gallery", "foto")):
                s += 4
            if any(x in low for x in ("thumb", "150x", "100x", "32x", "64x")):
                s -= 2
            return s

        imgs.sort(key=score, reverse=True)
        print("   imgs", len(imgs), "top", imgs[:5], flush=True)
        for u in imgs[:12]:
            if score(u) < 1 and "upload" not in u:
                # still try first few high-res looking
                if not re.search(r"\d{3,4}x\d{3,4}|wp-content/uploads|media|gallery", u, re.I):
                    continue
            try:
                time.sleep(1.2)
                data = get(u, referer=page)
                if save_if_photo(data, dest):
                    print("   OK", u[:100], dest.stat().st_size, flush=True)
                    return True
            except Exception as e:
                print("   img fail", type(e).__name__, flush=True)
    return False


def commons_geo(lat: float, lon: float, dest: Path, radius: int = 800) -> bool:
    """Search Commons files near coordinates."""
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "list": "geosearch",
            "gscoord": f"{lat}|{lon}",
            "gsradius": radius,
            "gslimit": 20,
            "gsnamespace": 6,
            "format": "json",
        }
    )
    try:
        data = json.loads(get(url).decode("utf-8", "replace"))
    except Exception as e:
        print("  geo fail", e, flush=True)
        return False
    titles = [x.get("title") for x in (data.get("query") or {}).get("geosearch") or [] if x.get("title")]
    print("  geo hits", titles[:8], flush=True)
    if not titles:
        return False
    time.sleep(2)
    info_url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "titles": "|".join(titles[:12]),
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 960,
            "format": "json",
        }
    )
    try:
        info = json.loads(get(info_url).decode("utf-8", "replace"))
    except Exception as e:
        print("  geo info fail", e, flush=True)
        return False
    for p in (info.get("query") or {}).get("pages", {}).values():
        title = (p.get("title") or "").lower()
        ii = (p.get("imageinfo") or [{}])[0]
        mime = (ii.get("mime") or "").lower()
        u = ii.get("thumburl") or ii.get("url")
        if not u or "image" not in mime:
            continue
        if any(x in title for x in ("logo", "crest", "map", "icon", "flag", "svg", "coa", "stemm")):
            continue
        # prefer outdoor / stadium-ish
        try:
            time.sleep(1.5)
            raw = get(u)
            if save_if_photo(raw, dest):
                print("  geo OK", p.get("title"), dest.stat().st_size, flush=True)
                return True
        except Exception:
            continue
    return False


def apply(cat: dict, stadium: str, rel: str, source: str = "stadium") -> int:
    n = 0
    for t in cat["teams"]:
        if (t.get("stadium") or "").strip() == stadium:
            t["stadiumImage"] = rel
            t["stadiumImageSource"] = source
            n += 1
    return n


def main() -> None:
    cat = json.loads(CAT.read_text(encoding="utf-8"))

    # --- Voltini: remove bad Tempietto, try better sources ---
    voltini = OUT / "stadio-giuseppe-voltini.jpg"
    print("=== Voltini", flush=True)
    # delete bad small/wrong file
    if voltini.exists():
        data = voltini.read_bytes()
        bad = b"Tempietto" in data or len(data) < 30000 or data[:8] == b"\x89PNG\r\n\x1a\n"
        # check if it's the tempietto (often small png)
        print("  current size", len(data), "png?", data[:4], flush=True)
        if data[:8] == b"\x89PNG\r\n\x1a\n" or len(data) < 25000:
            voltini.unlink()
            print("  removed bad file", flush=True)
            # restore city for now
            apply(cat, "Stadio Giuseppe Voltini", "immagini/stadi/city-crema.png", "city")

    ok_v = False
    # club sites
    ok_v = try_club_pages(
        [
            "https://www.pergolettese1932.com/",
            "https://www.pergolettese1932.com/stadio/",
            "https://www.pergolettese1932.it/",
            "https://uspergolettese1932.it/",
        ],
        voltini,
        ["voltini", "stadio", "crema", "campo", "tribuna"],
    )
    if not ok_v:
        ok_v = commons_geo(45.35778, 9.67556, voltini, 1200)
    if not ok_v:
        # Wikimedia static map is not a stadium photo - skip
        # leave city
        city = OUT / "city-crema.png"
        if city.exists():
            apply(cat, "Stadio Giuseppe Voltini", "immagini/stadi/city-crema.png", "city")
            print("  keep city-crema", flush=True)
    else:
        apply(cat, "Stadio Giuseppe Voltini", "immagini/stadi/stadio-giuseppe-voltini.jpg", "stadium")

    # --- Pineto ---
    print("=== Pineto", flush=True)
    pineto = OUT / "stadio-mimmo-pavone.jpg"
    ok_p = try_club_pages(
        [
            "https://www.pinetocalcio.it/stadio-pavone-mariani/",
            "https://www.pinetocalcio.it/stadio/",
            "https://www.pinetocalcio.it/",
            "https://www.asdpinetocalcio.it/stadio/",
        ],
        pineto,
        ["pavone", "mariani", "stadio", "pineto", "tribuna", "campo"],
    )
    if not ok_p:
        ok_p = commons_geo(42.610242, 14.053523, pineto, 1500)
    if ok_p:
        apply(cat, "Stadio Mimmo Pavone", "immagini/stadi/stadio-mimmo-pavone.jpg", "stadium")
    else:
        print("  keep city-pineto", flush=True)

    # stats
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

    from collections import Counter

    pro = [t for t in cat["teams"] if is_pro(t)]
    c = Counter(status(t) for t in pro)
    cat["version"] = max(int(cat.get("version") or 43), 44)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{c.get('stadium',0)}/{len(pro)}"
    cat["stats"]["stadiumImagesStadium"] = c.get("stadium", 0)
    cat["stats"]["stadiumImagesCity"] = c.get("city", 0)
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("DONE", dict(c), "of", len(pro), flush=True)
    for t in pro:
        if status(t) != "stadium":
            print("STILL", t["name"], "|", t.get("stadium"), "|", t.get("stadiumImageSource"), "|", t.get("stadiumImage"))


if __name__ == "__main__":
    main()
