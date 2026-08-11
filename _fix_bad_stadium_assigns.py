# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"

GOOD_MAP = {
    "CARPI": "immagini/stadi/stadio-sandro-cabassi.jpg",
    "DESENZANO": "immagini/stadi/stadio-tre-stelle.jpg",
    "OSPITALETTO": "immagini/stadi/stadio-comunale-di-ospitaletto.jpg",
    "OSTIAMARE": "immagini/stadi/stadio-anco-marzio.jpg",
    "CISERANO-BERGAMO": "immagini/stadi/stadio-comunale-di-ciserano.jpg",
    "LEGNAGO SALUS": "immagini/stadi/stadio-mario-sandrini.jpg",
    "PRO PALAZZOLO": "immagini/stadi/stadio-comunale-di-palazzolo.jpg",
    "TROPICAL CORIANO": "immagini/stadi/stadio-comunale-di-coriano.jpg",
    "SAMMAURESE": "immagini/stadi/stadio-comunale-di-san-mauro.jpg",
    "MONASTIR": "immagini/stadi/stadio-comunale-di-monastir.jpg",
    "MONTESPACCATO": "immagini/stadi/stadio-comunale-montespaccato.jpg",
    "VALMONTONE": "immagini/stadi/stadio-comunale-di-valmontone.jpg",
    "GELBISON": "immagini/stadi/stadio-giovanni-morra.jpg",
    "IGEA VIRTUS": "immagini/stadi/stadio-carlo-dalcontres.jpg",
    "PATERNÒ": "immagini/stadi/stadio-comunale-di-paterno.jpg",
    "SANCATALDESE": "immagini/stadi/stadio-comunale-di-san-cataldo.jpg",
    "DOLOMITI BELLUNESI": "immagini/stadi/stadio-comunale-di-belluno.jpg",
}

BAD_FILES = {
    "immagini/stadi/stadio-comunale.jpg",
    "immagini/stadi/centro-sportivo.jpg",
}


def slug_city(city: str) -> str:
    s = (city or "").lower().strip()
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
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def city_image(city: str) -> str | None:
    sl = slug_city(city)
    if not sl:
        return None
    for ext in (".jpg", ".png", ".webp"):
        rel = f"immagini/stadi/city-{sl}{ext}"
        p = ROOT / rel
        if p.exists() and p.stat().st_size > 2500:
            return rel
    return None


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    fixed = reverted = 0
    for t in cat["teams"]:
        if t.get("gender") != "m":
            continue
        name = t.get("name") or ""
        img = (t.get("stadiumImage") or "").replace("\\", "/")
        if name in GOOD_MAP and (ROOT / GOOD_MAP[name]).exists():
            t["stadiumImage"] = GOOD_MAP[name]
            t["stadiumImageSource"] = "stadium"
            fixed += 1
            continue
        if img in BAD_FILES or img.endswith("/stadio-comunale.jpg") or img.endswith(
            "/centro-sportivo.jpg"
        ):
            cy = city_image(t.get("city") or "")
            if cy:
                t["stadiumImage"] = cy
                t["stadiumImageSource"] = "city"
            else:
                t["stadiumImage"] = "immagini/stadi/_default.jpg"
                t["stadiumImageSource"] = "default"
            reverted += 1
            print("REVERT", name, "->", t["stadiumImage"])

    def is_pro(t):
        if t.get("gender") != "m":
            return False
        lg = t.get("league") or ""
        return any(
            lg.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D")
        ) and "FEMMINILE" not in lg

    def st_ok(t):
        img = t.get("stadiumImage") or ""
        src = t.get("stadiumImageSource") or ""
        p = ROOT / img
        return (
            p.exists()
            and p.stat().st_size > 2500
            and "default" not in img
            and src == "stadium"
            and "city-" not in img
            and not img.endswith("stadio-comunale.jpg")
        )

    pro = [t for t in cat["teams"] if is_pro(t)]
    st = sum(1 for t in pro if st_ok(t))
    cy = sum(
        1
        for t in pro
        if "city-" in (t.get("stadiumImage") or "")
        or t.get("stadiumImageSource") == "city"
    )
    cat["version"] = max(int(cat.get("version") or 40), 41)
    cat.setdefault("stats", {})
    cat["stats"]["proStadiumCoverage"] = f"{st}/{len(pro)}"
    cat["stats"]["stadiumImagesStadium"] = st
    cat["stats"]["stadiumImagesCity"] = cy
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"fixed_good={fixed} reverted={reverted} PRO stadium={st}/{len(pro)} city={cy}")


if __name__ == "__main__":
    main()
