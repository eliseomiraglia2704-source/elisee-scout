# -*- coding: utf-8 -*-
"""Riempie i vuoti foto-stadio SOLO professionismo (Serie A-D)."""
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
UA = {"User-Agent": "EliseeScout/1.4 (pro stadium fill; Wikipedia/Commons)", "Accept": "*/*"}
SLEEP = 2.5

# Titoli extra per stadi noti ancora mancanti
EXTRA_TITLES = {
    "Stadio Nicola Ceravolo": ["Stadio Nicola Ceravolo", "Nicola Ceravolo", "Stadio Ceravolo"],
    "Stadio Oreste Granillo": ["Stadio Oreste Granillo", "Oreste Granillo", "Stadio Granillo"],
    "Stadio Sandro Cabassi": ["Stadio Sandro Cabassi", "Sandro Cabassi"],
    "Stadio Giuseppe Voltini": ["Stadio Giuseppe Voltini", "Stadio Voltini", "Stadio Comunale di Crema"],
    "Stadio Alfredo Viviani": ["Stadio Alfredo Viviani", "Alfredo Viviani"],
    "Stadio Vito Simone Veneziani": ["Stadio Vito Simone Veneziani", "Vito Simone Veneziani"],
    "Stadio Aldo e Dino Ballarin": ["Stadio Aldo e Dino Ballarin", "Stadio Ballarin", "Stadio Comunale di Chioggia"],
    "Stadio Pier Giovanni Mecchia": ["Stadio Pier Giovanni Mecchia", "Stadio Mecchia"],
    "Stadio Rino Mercante": ["Stadio Rino Mercante", "Rino Mercante"],
    "Stadio Mario Sandrini": ["Stadio Mario Sandrini", "Mario Sandrini"],
    "Stadio Romeo Galli": ["Stadio Romeo Galli", "Romeo Galli"],
    "Stadio Pietro Fortunati": ["Stadio Pietro Fortunati", "Pietro Fortunati"],
    "Stadio Ferruccio Chittolina": ["Stadio Ferruccio Chittolina", "Ferruccio Chittolina"],
    "Stadio Fausto Coppi": ["Stadio Fausto Coppi", "Stadio Fausto Coppi (Tortona)"],
    "Stadio Giovanni Parisi": ["Stadio Giovanni Parisi"],
    "Stadio Giuseppe Sivori": ["Stadio Giuseppe Sivori"],
    "Stadio Lungobisenzio": ["Stadio Lungobisenzio", "Stadio comunale Lungobisenzio"],
    "Stadio Gastone Brilli Peri": ["Stadio Gastone Brilli Peri"],
    "Stadio Luigi Razza": ["Stadio Luigi Razza"],
    "Stadio Carlo D'Alcontres": ["Stadio Carlo D'Alcontres", "Stadio Carlo D’Alcontres"],
    "Stadio Marco Salmeri": ["Stadio Marco Salmeri"],
    "Stadio Giovanni Paolo II": [
        "Stadio Giovanni Paolo II (Nardò)",
        "Stadio Giovanni Paolo II (Francavilla Fontana)",
        "Stadio Giovanni Paolo II",
    ],
    "Stadio Gustavo Ventura": ["Stadio Gustavo Ventura", "Stadio Comunale di Bisceglie"],
    "Stadio Vito Curlo": ["Stadio Vito Curlo"],
    "Stadio Stefano Vicino": ["Stadio Stefano Vicino"],
    "Stadio Mimmo Pavone": ["Stadio Mimmo Pavone"],
    "Stadio Anco Marzio": ["Stadio Anco Marzio"],
    "Stadio Nicola Tubaldi": ["Stadio Nicola Tubaldi"],
    "Stadio Vittorio Bachelet": ["Stadio Vittorio Bachelet"],
    "Stadio Generale Gaeta": ["Stadio Generale Gaeta", "Stadio comunale di Enna"],
    "Stadio Giovanni Morra": ["Stadio Giovanni Morra"],
    "Stadio Castellina": ["Stadio Castellina", "Stadio Comunale di Sondrio"],
    "Stadio Ligorna": ["Stadio Ligorna", "Campo sportivo Ligorna"],
    "Stadio Tre Stelle": ["Stadio Tre Stelle", "Stadio Comunale di Desenzano"],
    "Stadio Turri": ["Stadio Turri", "Stadio Comunale di Scandicci"],
    "Stadio Luigi Muzi": ["Stadio Luigi Muzi"],
    "Stadio Tonino D'Angelo": ["Stadio Tonino D'Angelo"],
    "Juventus Training Center": [
        "Juventus Training Center",
        "Juventus Training Center (Vinovo)",
        "Vinovo",
    ],
    "Centro Sportivo Bortolotti": ["Centro Sportivo Bortolotti", "Zingonia", "Centro Bortolotti"],
    "Centro Sportivo Vismara": ["Centro Sportivo Vismara", "Centro sportivo Vismara"],
    "Centro Sportivo Lodigiani": ["Centro Sportivo Lodigiani", "Lodigiani"],
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
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:90] or "stadio"


def path_ok(rel: str | None) -> bool:
    if not rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2500


def api(lang: str, params: dict, retries=5):
    host = {
        "it": "it.wikipedia.org",
        "en": "en.wikipedia.org",
        "commons": "commons.wikimedia.org",
    }[lang]
    url = f"https://{host}/w/api.php?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=45, context=CTX) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 503):
                wait = 10 * (attempt + 1)
                print(f"  [{lang}] rate {e.code} sleep {wait}s", flush=True)
                time.sleep(wait)
                continue
            time.sleep(2)
        except Exception as e:
            last = e
            time.sleep(2)
    if last:
        raise last
    return {}


def page_thumb(lang: str, title: str, size=960):
    data = api(
        lang,
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
            # skip tiny icons sometimes
            return p.get("title"), th.split("?")[0]
    return None, None


def commons_search(query: str, size=960):
    q = f'(intitle:stadio OR intitle:stadium OR intitle:arena) {query}'
    data = api(
        "commons",
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,
            "gsrlimit": 15,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": size,
            "format": "json",
        },
    )
    best = None
    for pid, p in (data.get("query") or {}).get("pages", {}).items():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("thumburl") or info.get("url")
        title = (p.get("title") or "").lower()
        mime = (info.get("mime") or "").lower()
        if not url:
            continue
        if any(x in title for x in ("logo", "crest", "badge", "stemmi", ".svg", ".pdf", "coat")):
            continue
        if "pdf" in mime or "svg" in mime:
            continue
        if not any(x in title for x in ("stadio", "stadium", "arena", "campo", "sportivo", "ground")):
            continue
        score = 3
        for w in re.findall(r"[a-zA-Zàèéìòù]{4,}", query):
            if w.lower() in title:
                score += 2
        if best is None or score > best[0]:
            best = (score, p.get("title"), url.split("?")[0])
    if best and best[0] >= 3:
        return best[1], best[2]
    return None, None


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
        data = r.read()
    if len(data) < 3000:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return True


def save_from_url(key: str, url: str, real: str, source: str, cache: dict) -> str | None:
    slug = slugify(key)
    ext = ".jpg"
    low = url.lower()
    if ".png" in low:
        ext = ".png"
    elif ".webp" in low:
        ext = ".webp"
    rel = f"immagini/stadi/{slug}{ext}"
    try:
        if download(url, ROOT / rel):
            cache[key] = {"path": rel, "wikiTitle": real, "url": url, "source": source}
            print(f"OK {key} <- [{source}] {real}", flush=True)
            return rel
    except Exception as e:
        print(f"  dl fail {key}: {e}", flush=True)
    return None


def local_for(key: str):
    sl = slugify(key.replace("city:", ""))
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = OUT / f"{sl}{ext}"
        if p.exists() and p.stat().st_size > 2500:
            return f"immagini/stadi/{sl}{ext}"
    return None


def fetch_key(key: str, titles: list[str], cache: dict, allow_city_page=False) -> str | None:
    if key in cache and path_ok(cache[key].get("path")):
        return cache[key]["path"]
    loc = local_for(key)
    if loc:
        cache[key] = {"path": loc, "source": "local"}
        return loc

    seen = set()
    titles2 = []
    for t in titles:
        t = (t or "").strip()
        if t and t.lower() not in seen:
            seen.add(t.lower())
            titles2.append(t)

    for title in titles2:
        for lang in ("it", "en"):
            try:
                real, url = page_thumb(lang, title)
            except Exception as e:
                print(f"  api {lang} {title}: {e}", flush=True)
                time.sleep(SLEEP)
                continue
            time.sleep(SLEEP)
            if not url:
                continue
            # for stadium keys, prefer pages that look like stadiums if title has stadio
            rel = save_from_url(key, url, real or title, f"wikipedia.{lang}", cache)
            if rel:
                return rel

    # commons
    for title in titles2[:4]:
        try:
            real, url = commons_search(title)
        except Exception as e:
            print(f"  commons {title}: {e}", flush=True)
            time.sleep(SLEEP)
            continue
        time.sleep(SLEEP)
        if not url:
            continue
        rel = save_from_url(key, url, real or title, "commons", cache)
        if rel:
            return rel

    return None


def is_pro(t):
    l = (t.get("league") or "").upper()
    if "FEM" in l:
        return False
    return any(l.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


def has_real(t):
    p = t.get("stadiumImage") or ""
    return p and "_default" not in p and path_ok(p)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    pro = [t for t in cat["teams"] if is_pro(t)]
    miss = [t for t in pro if not has_real(t)]
    print(f"pro miss {len(miss)} / {len(pro)}", flush=True)

    # unique stadiums then cities
    by_st = {}
    for t in miss:
        st = (t.get("stadium") or "").strip()
        if st:
            by_st.setdefault(st, []).append(t)

    print("unique missing stadiums", len(by_st), flush=True)
    st_ok = 0
    for i, (st, teams) in enumerate(sorted(by_st.items()), 1):
        titles = list(EXTRA_TITLES.get(st, []))
        titles.append(st)
        if not st.lower().startswith("stadio") and "centro" not in st.lower() and "training" not in st.lower():
            titles.append("Stadio " + st)
        # team names
        for t in teams[:2]:
            titles.append(t.get("name") or "")
            titles.append((t.get("name") or "") + " Calcio")
        path = fetch_key(st, titles, cache)
        if path:
            st_ok += 1
        else:
            print(f"FAIL stadium {st}", flush=True)
        if i % 8 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  stadium progress {i}/{len(by_st)} ok={st_ok}", flush=True)
        time.sleep(0.5)

    # cities for remaining
    still = [t for t in pro if not has_real(t) and not (
        (t.get("stadium") or "").strip() in cache and path_ok(cache[(t.get("stadium") or "").strip()].get("path"))
    )]
    # recompute still after stadium fetch
    def team_has_stadium_path(t):
        st = (t.get("stadium") or "").strip()
        if st and st in cache and path_ok(cache[st].get("path")):
            return True
        if st and local_for(st):
            return True
        return False

    need_city = {}
    for t in pro:
        if team_has_stadium_path(t) or has_real(t):
            # will be assigned stadium
            continue
        city = (t.get("city") or "").strip()
        if city and city.upper() not in ("ITALIA", "NONE", "—", "-"):
            need_city.setdefault(city, []).append(t)

    print("cities to fetch for remaining pro", len(need_city), flush=True)
    cy_ok = 0
    for i, city in enumerate(sorted(need_city.keys()), 1):
        key = "city:" + city
        pretty = city.title() if city.isupper() else city
        path = fetch_key(key, [pretty, pretty + " (Italia)", city], cache, allow_city_page=True)
        if path:
            cy_ok += 1
        else:
            print(f"FAIL city {city}", flush=True)
        if i % 10 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  city progress {i}/{len(need_city)} ok={cy_ok}", flush=True)
        time.sleep(0.4)

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

    # assign ALL teams (keep existing), pro get best available
    st_n = cy_n = df_n = 0
    for t in cat["teams"]:
        stadium = (t.get("stadium") or "").strip()
        city = (t.get("city") or "").strip()
        path = None
        source = "default"

        if stadium:
            if stadium in cache and path_ok(cache[stadium].get("path")):
                path = cache[stadium]["path"]
                source = "stadium"
            else:
                loc = local_for(stadium)
                if loc:
                    path = loc
                    source = "stadium"

        if not path and city:
            ck = "city:" + city
            if ck in cache and path_ok(cache[ck].get("path")):
                path = cache[ck]["path"]
                source = "city"
            else:
                loc = local_for(city) or local_for(ck)
                if loc:
                    path = loc
                    source = "city"

        # keep previous good assignment if better
        prev = t.get("stadiumImage") or ""
        if (not path or source == "default") and prev and "_default" not in prev and path_ok(prev):
            path = prev
            source = t.get("stadiumImageSource") or "stadium"

        if not path or not path_ok(path):
            path = DEFAULT
            source = "default"

        t["stadiumImage"] = path.replace("\\", "/")
        t["stadiumImageSource"] = source
        if source == "stadium":
            st_n += 1
        elif source == "city":
            cy_n += 1
        else:
            df_n += 1

    # pro stats
    pro2 = [t for t in cat["teams"] if is_pro(t)]
    pro_ok = sum(1 for t in pro2 if has_real(t))
    pro_miss = [t["name"] + " | " + (t.get("stadium") or "") for t in pro2 if not has_real(t)]

    cat["version"] = max(int(cat.get("version") or 13), 14)
    cat.setdefault("stats", {})
    cat["stats"]["stadiumImagesStadium"] = st_n
    cat["stats"]["stadiumImagesCity"] = cy_n
    cat["stats"]["stadiumImagesDefault"] = df_n
    cat["stats"]["proStadiumCoverage"] = f"{pro_ok}/{len(pro2)}"
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    print(f"DONE assign stadium={st_n} city={cy_n} default={df_n}", flush=True)
    print(f"PRO coverage {pro_ok}/{len(pro2)}", flush=True)
    if pro_miss:
        print("PRO still miss", len(pro_miss), flush=True)
        for m in pro_miss[:40]:
            print(" ", m, flush=True)


if __name__ == "__main__":
    main()
