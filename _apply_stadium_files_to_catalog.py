# -*- coding: utf-8 -*-
"""Collega file in immagini/stadi/ alle squadre pro per nome stadio (slug)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
STADI = ROOT / "immagini" / "stadi"


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


def is_pro_m(t: dict) -> bool:
    if t.get("gender") != "m":
        return False
    lg = t.get("league") or ""
    if "FEMMINILE" in lg:
        return False
    return any(lg.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


def path_ok(rel: str) -> bool:
    if not rel or "default" in rel:
        return False
    p = ROOT / rel
    return p.exists() and p.stat().st_size > 2500


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    # index files by stem — skip generic shared plates
    SKIP = {
        "stadio-comunale",
        "centro-sportivo",
        "centro-sportivo-vismara",
        "centro-sportivo-bortolotti",
    }
    files = {}
    for p in STADI.iterdir():
        if p.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        if p.name.startswith("city-") or p.name.startswith("_"):
            continue
        if p.stem in SKIP:
            continue
        files[p.stem] = p

    updated = 0
    for t in cat["teams"]:
        if not is_pro_m(t):
            continue
        st = (t.get("stadium") or "").strip()
        if not st:
            continue
        # already real stadium?
        img = t.get("stadiumImage") or ""
        src = t.get("stadiumImageSource") or ""
        if path_ok(img) and src == "stadium" and "city-" not in img:
            continue

        sl = slugify(st)
        candidates = [
            sl,
            sl.replace("stadio-", ""),
            "stadio-" + sl if not sl.startswith("stadio") else sl,
        ]
        # common variants
        if "d-alcontres" in sl or "dalcontres" in sl:
            candidates.append("stadio-carlo-dalcontres")
        if "palazzolo" in sl:
            candidates.append("stadio-comunale-di-palazzolo")
        if "ceravolo" in sl:
            candidates.append("stadio-nicola-ceravolo")

        hit = None
        for c in candidates:
            if c in files:
                hit = files[c]
                break
            # fuzzy: stem contains key parts
        # fuzzy only if specific enough (avoid matching all "Comunale" to one file)
        if not hit and len(sl) > 18:
            for stem, p in files.items():
                if sl == stem or (sl in stem and len(stem) - len(sl) < 8):
                    hit = p
                    break

        if not hit:
            continue

        rel = f"immagini/stadi/{hit.name}".replace("\\", "/")
        if not path_ok(rel):
            continue
        t["stadiumImage"] = rel
        t["stadiumImageSource"] = "stadium"
        updated += 1
        print("APPLY", t["name"], "->", hit.name)

    pro = [t for t in cat["teams"] if is_pro_m(t)]
    st_n = sum(
        1
        for t in pro
        if path_ok(t.get("stadiumImage") or "")
        and (t.get("stadiumImageSource") or "") == "stadium"
        and "city-" not in (t.get("stadiumImage") or "")
    )
    cy_n = sum(
        1
        for t in pro
        if path_ok(t.get("stadiumImage") or "")
        and (
            (t.get("stadiumImageSource") or "") == "city"
            or "city-" in (t.get("stadiumImage") or "")
        )
    )
    cat["version"] = max(int(cat.get("version") or 38), 39)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{st_n}/{len(pro)}"
    cat["stats"]["stadiumImagesStadium"] = st_n
    cat["stats"]["stadiumImagesCity"] = cy_n
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print("---")
    print(f"updated={updated} PRO stadium={st_n} city={cy_n} total={len(pro)}")


if __name__ == "__main__":
    main()
