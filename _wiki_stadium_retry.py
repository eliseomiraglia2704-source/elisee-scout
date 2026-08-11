# -*- coding: utf-8 -*-
"""
Retry foto stadi mancanti: it.wiki + en.wiki + Commons search.
Poi riassegna TUTTE le squadre (stadio > città locale > default).
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
UA = {"User-Agent": "EliseeScout/1.3 (stadium retry; Wikipedia/Commons)", "Accept": "*/*"}
SLEEP = 3.0

# URL dirette note (Commons) per stadi importanti falliti
DIRECT = {
    "Stadio Diego Armando Maradona": [
        "Stadio Diego Armando Maradona",
        "Stadio San Paolo",
        "Diego Armando Maradona Stadium",
    ],
    "Stadio Oreste Granillo": ["Stadio Oreste Granillo"],
    "Stadio Nicola Ceravolo": ["Stadio Nicola Ceravolo"],
    "Stadio del Conero": ["Stadio del Conero"],
    "Stadio Citta di Arezzo": ["Stadio Città di Arezzo", "Stadio Comunale di Arezzo"],
    "Stadio Alberto De Cristofaro": ["Stadio Alberto De Cristofaro"],
    "Stadio Simonetta Lamberti": ["Stadio Simonetta Lamberti"],
    "Stadio Vito Simone Veneziani": ["Stadio Vito Simone Veneziani"],
    "Stadio Alfredo Viviani": ["Stadio Alfredo Viviani"],
    "Stadio Marcello Torre": ["Stadio Marcello Torre"],
    "Stadio Guido D'Ippolito": ["Stadio Guido D'Ippolito"],
    "Stadio Luigi Razza": ["Stadio Luigi Razza"],
    "Stadio Aldo Campo": ["Stadio Comunale Aldo Campo", "Stadio Aldo Campo"],
    "Stadio Pier Cesare Tombolato": ["Stadio Pier Cesare Tombolato"],
    "Stadio Sandro Cabassi": ["Stadio Sandro Cabassi"],
    "Stadio Giuseppe Voltini": ["Stadio Giuseppe Voltini"],
    "Stadio Euganeo": ["Stadio Euganeo"],
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
    return p.exists() and p.stat().st_size > 2000


def api(lang: str, params: dict, retries=4):
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
            with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 503):
                wait = 8 * (attempt + 1)
                print(f"  [{lang}] 429 sleep {wait}s", flush=True)
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
            return p.get("title"), th.split("?")[0]
    return None, None


def commons_search_thumb(query: str, size=960):
    # forza ricerca su stadi; esclude logo/stemmi/pdf
    q = f'intitle:stadio OR intitle:stadium {query}'
    data = api(
        "commons",
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,  # File
            "gsrlimit": 12,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": size,
            "format": "json",
        },
    )
    pages = (data.get("query") or {}).get("pages", {})
    best = None
    for pid, p in pages.items():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("thumburl") or info.get("url")
        title = p.get("title") or ""
        mime = (info.get("mime") or "").lower()
        if not url:
            continue
        low = title.lower()
        if not any(x in low for x in ("stadio", "stadium", "arena ", "arena_", "ground")):
            continue
        if any(x in low for x in ("logo", "crest", "badge", "stemmi", "coat of", ".svg", ".pdf")):
            continue
        if "pdf" in mime or "svg" in mime:
            continue
        score = 5
        # bonus se query words in title
        for w in re.findall(r"[a-zA-Zàèéìòù]{4,}", query):
            if w.lower() in low:
                score += 2
        if best is None or score > best[0]:
            best = (score, title, url.split("?")[0])
    if best and best[0] >= 5:
        return best[1], best[2]
    return None, None


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=55, context=CTX) as r:
        data = r.read()
    if len(data) < 2500:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return True


def local_for(stadium: str):
    sl = slugify(stadium)
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = OUT / f"{sl}{ext}"
        if p.exists() and p.stat().st_size > 2500:
            return f"immagini/stadi/{sl}{ext}"
    return None


def fetch_stadium(stadium: str, team: str, cache: dict) -> str | None:
    if stadium in cache and path_ok(cache[stadium].get("path")):
        return cache[stadium]["path"]
    loc = local_for(stadium)
    if loc:
        cache[stadium] = {"path": loc, "source": "local"}
        return loc

    titles = []
    if stadium in DIRECT:
        titles.extend(DIRECT[stadium])
    titles.append(stadium)
    if not stadium.lower().startswith("stadio"):
        titles.append("Stadio " + stadium)
    if team:
        titles.append(team)
        titles.append(team + " Calcio")
    # unique
    seen = set()
    titles = [t for t in titles if t and t.lower() not in seen and not seen.add(t.lower())]

    slug = slugify(stadium)

    # 1) it + en pageimages
    for title in titles:
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
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            elif ".webp" in url.lower():
                ext = ".webp"
            rel = f"immagini/stadi/{slug}{ext}"
            try:
                if download(url, ROOT / rel):
                    cache[stadium] = {
                        "path": rel,
                        "wikiTitle": real,
                        "url": url,
                        "source": f"wikipedia.{lang}",
                    }
                    print(f"OK {stadium} <- [{lang}] {real}", flush=True)
                    return rel
            except Exception as e:
                print(f"  dl {lang} {title}: {e}", flush=True)
                time.sleep(SLEEP)

    # 2) Commons search
    queries = [stadium, f"Stadio {stadium}", f"{stadium} stadium"]
    if team:
        queries.append(f"{team} stadium")
        queries.append(f"Stadio {team}")
    for q in queries:
        try:
            real, url = commons_search_thumb(q)
        except Exception as e:
            print(f"  commons {q}: {e}", flush=True)
            time.sleep(SLEEP)
            continue
        time.sleep(SLEEP)
        if not url:
            continue
        ext = ".jpg"
        if ".png" in url.lower():
            ext = ".png"
        elif ".webp" in url.lower():
            ext = ".webp"
        rel = f"immagini/stadi/{slug}{ext}"
        try:
            if download(url, ROOT / rel):
                cache[stadium] = {
                    "path": rel,
                    "wikiTitle": real,
                    "url": url,
                    "source": "commons",
                }
                print(f"OK {stadium} <- [commons] {real}", flush=True)
                return rel
        except Exception as e:
            print(f"  commons dl {q}: {e}", flush=True)
            time.sleep(SLEEP)

    return None


def is_pro(t):
    l = (t.get("league") or "").upper()
    if "FEM" in l:
        return False
    return any(l.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if not path_ok(DEFAULT):
        # ensure default exists from previous script
        from importlib.util import spec_from_file_location, module_from_spec

        pass

    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    # stadiums missing a local file
    need = {}
    for t in cat["teams"]:
        st = (t.get("stadium") or "").strip()
        if not st:
            continue
        if st in cache and path_ok(cache[st].get("path")):
            continue
        if local_for(st):
            continue
        need.setdefault(st, t.get("name") or "")

    # prioritize pro leagues
    pro_st = set()
    for t in cat["teams"]:
        if is_pro(t):
            st = (t.get("stadium") or "").strip()
            if st:
                pro_st.add(st)

    ordered = sorted(need.keys(), key=lambda s: (0 if s in pro_st else 1, s))
    print(f"missing stadiums to retry: {len(ordered)}", flush=True)

    ok = 0
    fail = []
    for i, st in enumerate(ordered, 1):
        team = need[st]
        path = fetch_stadium(st, team, cache)
        if path:
            ok += 1
        else:
            fail.append(st)
            print(f"FAIL {st}", flush=True)
        if i % 10 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  progress {i}/{len(ordered)} ok={ok} fail={len(fail)}", flush=True)
        time.sleep(0.4)

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

    # assign all teams
    st_n = cy_n = df_n = 0
    files = {}
    for f in OUT.glob("*"):
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            files[f.stem] = f"immagini/stadi/{f.name}"

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
                    cache[stadium] = {"path": loc, "source": "local"}

        if not path and city:
            sl = slugify(city)
            if sl in files and path_ok(files[sl]) and files[sl] != DEFAULT:
                path = files[sl]
                source = "city"
            ck = "city:" + city
            if not path and ck in cache and path_ok(cache[ck].get("path")):
                path = cache[ck]["path"]
                source = "city"

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

    cat["version"] = max(int(cat.get("version") or 12), 13)
    cat.setdefault("stats", {})
    cat["stats"]["stadiumImages"] = len(cat["teams"])
    cat["stats"]["stadiumImagesStadium"] = st_n
    cat["stats"]["stadiumImagesCity"] = cy_n
    cat["stats"]["stadiumImagesDefault"] = df_n
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"DONE retry ok={ok} fail={len(fail)} | assign stadium={st_n} city={cy_n} default={df_n}",
        flush=True,
    )
    if fail:
        print("still fail sample:", fail[:25], flush=True)


if __name__ == "__main__":
    main()
