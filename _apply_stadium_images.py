# -*- coding: utf-8 -*-
"""Mappa file stadi gia scaricati sul catalogo (senza rete)."""
import json
import re
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
OUT = ROOT / "immagini" / "stadi"
DEFAULT = "immagini/stadi/_default.jpg"
CACHE_P = ROOT / "data" / "squadre" / "wiki_stadium_images.json"


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
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:90] or "stadio"


def path_ok(rel: str | None) -> bool:
    if not rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2000


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE_P.exists():
        try:
            cache = json.loads(CACHE_P.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    files = {}
    for f in OUT.glob("*"):
        if (
            f.is_file()
            and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
            and f.name != "_default.jpg"
        ):
            files[f.stem] = f"immagini/stadi/{f.name}"

    for k, v in cache.items():
        rel = v.get("path")
        if path_ok(rel):
            files[slugify(k.replace("city:", ""))] = rel
            files[slugify(k)] = rel

    st = cy = df = 0
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
                sl = slugify(stadium)
                if sl in files and path_ok(files[sl]):
                    path = files[sl]
                    source = "stadium"

        if not path and city:
            ck = "city:" + city
            if ck in cache and path_ok(cache[ck].get("path")):
                path = cache[ck]["path"]
                source = "city"
            else:
                sl = slugify(city)
                if sl in files and path_ok(files[sl]):
                    path = files[sl]
                    source = "city"

        if not path or not path_ok(path):
            path = DEFAULT
            source = "default"

        t["stadiumImage"] = str(path).replace("\\", "/")
        t["stadiumImageSource"] = source
        if source == "stadium":
            st += 1
        elif source == "city":
            cy += 1
        else:
            df += 1

    cat["version"] = max(int(cat.get("version") or 10), 12)
    cat.setdefault("stats", {})
    cat["stats"]["stadiumImages"] = len(cat["teams"])
    cat["stats"]["stadiumImagesStadium"] = st
    cat["stats"]["stadiumImagesCity"] = cy
    cat["stats"]["stadiumImagesDefault"] = df
    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("assigned stadium", st, "city", cy, "default", df, "total", len(cat["teams"]))
    for n in ("ATALANTA", "INTER", "SCAFATESE", "JUVENTUS", "MILAN"):
        t = next(x for x in cat["teams"] if x["name"] == n)
        print(n, t.get("stadiumImage"), t.get("stadiumImageSource"))


if __name__ == "__main__":
    main()
