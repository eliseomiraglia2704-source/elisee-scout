# -*- coding: utf-8 -*-
"""Riempie vuoti stadi pro: 1 richiesta per chiave, sleep lungo, fallback citta."""
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
UA = {"User-Agent": "EliseeScout/1.5 (pro stadium fill)", "Accept": "*/*"}
SLEEP = 4.0

# stadi importanti con titoli giusti
TITLES = {
    "Stadio Nicola Ceravolo": ["Stadio Nicola Ceravolo"],
    "Stadio Oreste Granillo": ["Stadio Oreste Granillo"],
    "Stadio Sandro Cabassi": ["Stadio Sandro Cabassi"],
    "Stadio Giuseppe Voltini": ["Stadio Giuseppe Voltini", "Stadio Voltini"],
    "Stadio Alfredo Viviani": ["Stadio Alfredo Viviani"],
    "Stadio Vito Simone Veneziani": ["Stadio Vito Simone Veneziani"],
    "Stadio Aldo e Dino Ballarin": ["Stadio Aldo e Dino Ballarin"],
    "Stadio Ferruccio Chittolina": ["Stadio Ferruccio Chittolina"],
    "Stadio Fausto Coppi": ["Stadio Fausto Coppi"],
    "Stadio Pietro Fortunati": ["Stadio Pietro Fortunati"],
    "Stadio Rino Mercante": ["Stadio Rino Mercante"],
    "Stadio Mario Sandrini": ["Stadio Mario Sandrini"],
    "Stadio Pier Giovanni Mecchia": ["Stadio Pier Giovanni Mecchia"],
    "Stadio Romeo Galli": ["Stadio Romeo Galli"],
    "Stadio Lungobisenzio": ["Stadio Lungobisenzio"],
    "Stadio Gastone Brilli Peri": ["Stadio Gastone Brilli Peri"],
    "Stadio Luigi Razza": ["Stadio Luigi Razza"],
    "Stadio Carlo D'Alcontres": ["Stadio Carlo D'Alcontres"],
    "Stadio Marco Salmeri": ["Stadio Marco Salmeri"],
    "Stadio Giovanni Paolo II": ["Stadio Giovanni Paolo II"],
    "Stadio Gustavo Ventura": ["Stadio Gustavo Ventura"],
    "Stadio Vito Curlo": ["Stadio Vito Curlo"],
    "Stadio Mimmo Pavone": ["Stadio Mimmo Pavone"],
    "Stadio Anco Marzio": ["Stadio Anco Marzio"],
    "Juventus Training Center": ["Juventus Training Center (Vinovo)"],
    "Centro Sportivo Bortolotti": ["Zingonia"],
    "Centro Sportivo Vismara": ["Milano"],
    "Centro Sportivo Lodigiani": ["Roma"],
    "Centro Sportivo": ["Milano"],
}


def slugify(name: str) -> str:
    s = (name or "").lower().strip()
    for a, b in (("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("'", ""), ("’", "")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:90] or "x"


def path_ok(rel):
    if not rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2500


def wiki_thumb(title, lang="it"):
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
    url = f"https://{lang}.wikipedia.org/w/api.php?" + q
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
                data = json.loads(r.read().decode())
            for pid, p in data.get("query", {}).get("pages", {}).items():
                if str(pid).startswith("-"):
                    continue
                th = (p.get("thumbnail") or {}).get("source")
                if th:
                    return p.get("title"), th.split("?")[0]
            return None, None
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(12 * (attempt + 1))
                continue
            return None, None
        except Exception:
            time.sleep(3)
    return None, None


def download(url, dest: Path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=50, context=CTX) as r:
        data = r.read()
    if len(data) < 3000:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return True


def fetch_save(key, titles, cache):
    if key in cache and path_ok(cache[key].get("path")):
        return cache[key]["path"]
    sl = slugify(key)
    for ext in (".jpg", ".png", ".webp", ".jpeg"):
        p = OUT / f"{sl}{ext}"
        if p.exists() and p.stat().st_size > 2500:
            rel = f"immagini/stadi/{sl}{ext}"
            cache[key] = {"path": rel, "source": "local"}
            return rel

    for title in titles:
        title = (title or "").strip()
        if not title:
            continue
        for lang in ("it", "en"):
            real, url = wiki_thumb(title, lang)
            time.sleep(SLEEP)
            if not url:
                continue
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            rel = f"immagini/stadi/{sl}{ext}"
            try:
                if download(url, ROOT / rel):
                    cache[key] = {"path": rel, "wikiTitle": real, "url": url, "source": f"wiki.{lang}"}
                    print(f"OK {key} <- {real}", flush=True)
                    return rel
            except Exception as e:
                print(f"  dl {title}: {e}", flush=True)
                time.sleep(2)
    return None


def is_pro(t):
    l = (t.get("league") or "").upper()
    return ("FEM" not in l) and any(l.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


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
            pass

    pro = [t for t in cat["teams"] if is_pro(t)]
    miss = [t for t in pro if not has_real(t)]
    print(f"pro miss {len(miss)}/{len(pro)}", flush=True)

    # 1) stadiums
    by_st = {}
    for t in miss:
        st = (t.get("stadium") or "").strip()
        if st:
            by_st.setdefault(st, t.get("name") or "")

    for i, (st, team) in enumerate(sorted(by_st.items()), 1):
        titles = list(TITLES.get(st, [])) + [st]
        if not st.lower().startswith("stadio") and "centro" not in st.lower() and "training" not in st.lower():
            titles.append("Stadio " + st)
        titles.append(team)
        path = fetch_save(st, titles, cache)
        if not path:
            print(f"FAIL st {st}", flush=True)
        if i % 5 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  st {i}/{len(by_st)}", flush=True)

    # 2) cities for still missing
    still_cities = set()
    for t in pro:
        st = (t.get("stadium") or "").strip()
        if st and st in cache and path_ok(cache[st].get("path")):
            continue
        if has_real(t):
            continue
        city = (t.get("city") or "").strip()
        if city and city.upper() not in ("ITALIA", "NONE", "-", "—"):
            still_cities.add(city)

    print(f"cities fallback {len(still_cities)}", flush=True)
    for i, city in enumerate(sorted(still_cities), 1):
        key = "city:" + city
        pretty = city.title() if city.isupper() else city
        path = fetch_save(key, [pretty, pretty + " (Italia)"], cache)
        if not path:
            print(f"FAIL city {city}", flush=True)
        if i % 5 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  city {i}/{len(still_cities)}", flush=True)

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

    # 3) assign all teams (preserve kits!)
    st_n = cy_n = df_n = 0
    for t in cat["teams"]:
        stadium = (t.get("stadium") or "").strip()
        city = (t.get("city") or "").strip()
        path = None
        source = "default"

        if stadium and stadium in cache and path_ok(cache[stadium].get("path")):
            path = cache[stadium]["path"]
            source = "stadium"
        elif stadium:
            sl = slugify(stadium)
            for ext in (".jpg", ".png", ".webp"):
                rel = f"immagini/stadi/{sl}{ext}"
                if path_ok(rel):
                    path = rel
                    source = "stadium"
                    break

        if not path and city:
            ck = "city:" + city
            if ck in cache and path_ok(cache[ck].get("path")):
                path = cache[ck]["path"]
                source = "city"
            else:
                sl = slugify(city)
                for ext in (".jpg", ".png", ".webp"):
                    rel = f"immagini/stadi/{sl}{ext}"
                    if path_ok(rel):
                        path = rel
                        source = "city"
                        break

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

    pro2 = [t for t in cat["teams"] if is_pro(t)]
    pro_ok = sum(1 for t in pro2 if has_real(t))
    miss_names = [t["name"] + " | " + (t.get("stadium") or "") for t in pro2 if not has_real(t)]

    cat["version"] = max(int(cat.get("version") or 16), 17)
    cat.setdefault("stats", {})
    cat["stats"]["stadiumImagesStadium"] = st_n
    cat["stats"]["stadiumImagesCity"] = cy_n
    cat["stats"]["stadiumImagesDefault"] = df_n
    cat["stats"]["proStadiumCoverage"] = f"{pro_ok}/{len(pro2)}"
    # do NOT wipe kit fields - we only touch stadium fields
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"DONE stadium={st_n} city={cy_n} default={df_n}", flush=True)
    print(f"PRO {pro_ok}/{len(pro2)}", flush=True)
    print("still miss", len(miss_names), flush=True)
    for m in miss_names[:30]:
        print(" ", m, flush=True)


if __name__ == "__main__":
    main()
