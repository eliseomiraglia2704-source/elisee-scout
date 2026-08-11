# -*- coding: utf-8 -*-
import json
from collections import Counter
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
cat = json.loads((ROOT / "data/squadre/catalog.json").read_text(encoding="utf-8"))


def is_pro_m(t):
    if t.get("gender") != "m":
        return False
    lg = t.get("league") or ""
    if "FEMMINILE" in lg:
        return False
    return (
        lg.startswith("SERIE A")
        or lg.startswith("SERIE B")
        or lg.startswith("SERIE C")
        or lg.startswith("SERIE D")
    )


def status(t):
    img = t.get("stadiumImage") or ""
    src = t.get("stadiumImageSource") or ""
    st = t.get("stadium") or ""
    p = ROOT / img if img else None
    ok = bool(p and p.exists() and p.stat().st_size > 2500 and "default" not in img)
    if ok:
        if src == "city" or "city-" in img:
            return "city"
        return "stadium"
    if st:
        return "name_only"
    return "empty"


pro = [t for t in cat["teams"] if is_pro_m(t)]
print("PRO men", len(pro), dict(Counter(status(t) for t in pro)))
by = Counter()
for t in pro:
    lg = t.get("league") or ""
    key = (
        "A"
        if lg.startswith("SERIE A")
        else "B"
        if lg.startswith("SERIE B")
        else "C"
        if lg.startswith("SERIE C")
        else "D"
        if lg.startswith("SERIE D")
        else "?"
    )
    by[key + ":" + status(t)] += 1
print(dict(by))
miss = [t for t in pro if status(t) != "stadium"]
print("--- without real stadium photo", len(miss))
for t in sorted(miss, key=lambda x: (x.get("league") or "", x["name"])):
    print(
        (t.get("league") or "")[:28],
        "|",
        t["name"][:26],
        "|",
        (t.get("stadium") or "-")[:45],
        "|",
        t.get("stadiumImageSource") or "-",
        "|",
        t.get("stadiumImage") or "-",
    )
