# -*- coding: utf-8 -*-
"""
Import kit 2D maschili da SortItOutSI SS Kits Megapack.
- File: {fmId}_home.png / _away.png / _third.png
- Mappa FM ID -> nome da sortitoutsi.net (Serie A/B/C/D Italia)
- Solo gender=m, niente femminile
"""
from __future__ import annotations

import io
import json
import re
import ssl
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
ZIP_PATH = Path.home() / "Downloads" / "sortitoutsi SS Kits Megapack 2026.14.zip"
ZIP_PREFIX = "sortitoutsi SS Kits Megapack 2026.14/graphics/kits/"
OUT_KITS = ROOT / "immagini" / "kits-2d"
CAT = ROOT / "data" / "squadre" / "catalog.json"
MAP_CACHE = ROOT / "data" / "squadre" / "fm_id_map_italy.json"
REPORT = ROOT / "data" / "squadre" / "kits_2d_import_report.json"

CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
}

# Competizioni pro Italia (mens) su sortitoutsi FM26
COMPS = [
    (32, "SERIE A", "https://sortitoutsi.net/football-manager-2026/competition/32/italian-serie-a"),
    (33, "SERIE B", "https://sortitoutsi.net/football-manager-2026/competition/33/serie-bkt"),
    (43127172, "SERIE C", "https://sortitoutsi.net/football-manager-2026/competition/43127172/italian-serie-ca"),
    (43127173, "SERIE C", "https://sortitoutsi.net/football-manager-2026/competition/43127173/italian-serie-cb"),
    (43127174, "SERIE C", "https://sortitoutsi.net/football-manager-2026/competition/43127174/italian-serie-cc"),
    (1400400, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400400/italian-serie-d-grp-a"),
    (1400401, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400401/italian-serie-d-grp-b"),
    (1400402, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400402/italian-serie-d-grp-c"),
    (1400403, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400403/italian-serie-d-grp-d"),
    (1400404, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400404/italian-serie-d-grp-e"),
    (1400405, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400405/italian-serie-d-grp-f"),
    (1400406, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400406/italian-serie-d-grp-g"),
    (1400407, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400407/italian-serie-d-grp-h"),
    (1400408, "SERIE D", "https://sortitoutsi.net/football-manager-2026/competition/1400408/italian-serie-d-grp-i"),
]

# Alias nome FM / sortitoutsi -> nome catalogo
ALIASES = {
    "A.C. MILAN": "MILAN",
    "AC MILAN": "MILAN",
    "CASCIAVIT MILANO": "MILAN",
    "F.C. INTERNAZIONALE MILANO": "INTER",
    "FC INTERNAZIONALE MILANO": "INTER",
    "INTERNAZIONALE": "INTER",
    "BLU NERI MILANO": "INTER",
    "A.S. ROMA": "ROMA",
    "ASSOCIAZIONE SPORTIVA ROMA": "ROMA",
    "JUVENTUS F.C.": "JUVENTUS",
    "JUVENTUS FC": "JUVENTUS",
    "S.S.C. NAPOLI": "NAPOLI",
    "SSC NAPOLI": "NAPOLI",
    "PARTHENOPE": "NAPOLI",
    "S.S. LAZIO": "LAZIO",
    "SS LAZIO": "LAZIO",
    "CAPITOLINI CELESTI": "LAZIO",
    "A.C.F. FIORENTINA": "FIORENTINA",
    "ACF FIORENTINA": "FIORENTINA",
    "ATALANTA BERGAMASCA CALCIO": "ATALANTA",
    "BERGAMO": "ATALANTA",
    "BOLOGNA F.C. 1909": "BOLOGNA",
    "BOLOGNA FC 1909": "BOLOGNA",
    "CAGLIARI CALCIO": "CAGLIARI",
    "GENOA C.F.C.": "GENOA",
    "GENOA CFC": "GENOA",
    "GENOA CRICKET AND FOOTBALL CLUB": "GENOA",
    "HELLAS VERONA F.C.": "HELLAS VERONA",
    "HELLAS VERONA FC": "HELLAS VERONA",
    "TORINO F.C.": "TORINO",
    "TORINO FC": "TORINO",
    "UDINESE CALCIO": "UDINESE",
    "U.S. LECCE": "LECCE",
    "US LECCE": "LECCE",
    "UNIONE SPORTIVA LECCE": "LECCE",
    "U.S. SASSUOLO CALCIO": "SASSUOLO",
    "US SASSUOLO CALCIO": "SASSUOLO",
    "U.S. CREMONESE": "CREMONESE",
    "US CREMONESE": "CREMONESE",
    "PARMA CALCIO 1913": "PARMA",
    "PISA S.C.": "PISA",
    "PISA SC": "PISA",
    "PISA SPORTING CLUB": "PISA",
    "COMO 1907": "COMO",
    "F.C. SÜDTIROL": "SUDTIROL",
    "FC SUDTIROL": "SUDTIROL",
    "F.C. SUDTIROL": "SUDTIROL",
    "U.C. SAMPDORIA": "SAMPDORIA",
    "UC SAMPDORIA": "SAMPDORIA",
    "UNIONE CALCIO SAMPDORIA": "SAMPDORIA",
    "A.C. MONZA": "MONZA",
    "AC MONZA": "MONZA",
    "VENEZIA F.C.": "VENEZIA",
    "VENEZIA FC": "VENEZIA",
    "EMPOLI F.C.": "EMPOLI",
    "EMPOLI FC": "EMPOLI",
    "FROSINONE CALCIO": "FROSINONE",
    "SPEZIA CALCIO": "SPEZIA",
    "PALERMO F.C.": "PALERMO",
    "PALERMO FC": "PALERMO",
    "BARI": "BARI",
    "S.S.C. BARI": "BARI",
    "SSC BARI": "BARI",
    "CESENA F.C.": "CESENA",
    "CESENA FC": "CESENA",
    "MODENA F.C.": "MODENA",
    "MODENA FC": "MODENA",
    "BRESCIA CALCIO": "BRESCIA",
    "UNION BRESCIA": "BRESCIA",
    "A.C. REGGIANA 1919": "REGGIANA",
    "AC REGGIANA 1919": "REGGIANA",
    "CARRARESE CALCIO 1908": "CARRARESE",
    "F.C. PRO VERCELLI 1892": "PRO VERCELLI",
    "PRO VERCELLI": "PRO VERCELLI",
    "A.C. BRA": "BRA",
    "CALCIO PADOVA": "PADOVA",
    "DELFINO PESCARA 1936": "PESCARA",
    "PESCARA": "PESCARA",
    "MANTOVA 1911": "MANTOVA",
    "MODENA F.C. 2018": "MODENA",
    "S.S. JUVE STABIA": "JUVE STABIA",
    "SS JUVE STABIA": "JUVE STABIA",
    "U.S. AVELLINO 1912": "AVELLINO",
    "US AVELLINO 1912": "AVELLINO",
    "U.S. CATANZARO 1929": "CATANZARO",
    "US CATANZARO 1929": "CATANZARO",
    "VIRTUS ENTELLA": "VIRTUS ENTELLA",
    "ENTELLA": "VIRTUS ENTELLA",
    "UNION BRESCIA": "BRESCIA",
    "A.C. OSPITALETTO": "OSPITALETTO",
    "A.C. RENATE": "RENATE",
    "A.C. TRENTO 1921": "TRENTO",
    "A.S. CITTADELLA": "CITTADELLA",
    "A.S. GIANA ERMINIO": "GIANA ERMINIO",
    "ALCIONE MILANO S.S.": "ALCIONE MILANO",
    "ALCIONE MILANO": "ALCIONE MILANO",
    "AURORA PRO PATRIA 1919": "PRO PATRIA",
    "PRO PATRIA": "PRO PATRIA",
    "CALCIO LECCO 1912": "LECCO",
    "F.C. ARZIGNANO VALCHIAMPO": "ARZIGNANO",
    "ARZIGNANO VALCHIAMPO": "ARZIGNANO",
    "F.C. LUMEZZANE": "LUMEZZANE",
    "L.R. VICENZA": "VICENZA",
    "LANEROSSI VICENZA": "VICENZA",
    "NOVARA CALCIO": "NOVARA",
    "U.C. ALBINOLEFFE": "ALBINOLEFFE",
    "ALBINOLEFFE": "ALBINOLEFFE",
    "U.S. PERGOLETTESE 1932": "PERGOLETTESE",
    "U.S. TRIESTINA CALCIO 1918": "TRIESTINA",
    "VIRTUSVECOMP VERONA": "VIRTUS VERONA",
    "VIRTUS VERONA": "VIRTUS VERONA",
    "A.C. CARPI": "CARPI",
    "A.C. PERUGIA CALCIO": "PERUGIA",
    "A.S. GUBBIO 1910": "GUBBIO",
    "ASCOLI CALCIO 1898 F.C.": "ASCOLI",
    "ASCOLI": "ASCOLI",
    "CAMPOBASSO F.C.": "CAMPOBASSO",
    "FORLI F.C.": "FORLI",
    "FORLÌ F.C.": "FORLI",
    "GUIDONIA MONTECELIO 1937 FOOTBALL CLUB": "GUIDONIA",
    "PINETO CALCIO": "PINETO",
    "RAVENNA F.C. 1913": "RAVENNA",
    "S.S. AREZZO": "AREZZO",
    "TERNANA CALCIO": "TERNANA",
    "TORRES": "TORRES",
    "U.S. CITTA DI PONTEDERA": "PONTEDERA",
    "U.S. LIVORNO 1915": "LIVORNO",
    "U.S. PIANESE": "PIANESE",
    "U.S. SAMBENEDETTESE": "SAMBENEDETTESE",
    "VIS PESARO DAL 1898": "VIS PESARO",
    "A.Z. PICERNO": "PICERNO",
    "BENEVENTO CALCIO": "BENEVENTO",
    "CALCIO FOGGIA 1920": "FOGGIA",
    "CASARANO CALCIO": "CASARANO",
    "CASERTANA F.C.": "CASERTANA",
    "CATANIA F.C.": "CATANIA",
    "CAVESE 1919": "CAVESE",
    "COSENZA CALCIO": "COSENZA",
    "F.C. CROTONE": "CROTONE",
    "F.C. TRAPANI 1905": "TRAPANI",
    "LATINA CALCIO 1932": "LATINA",
    "POTENZA CALCIO": "POTENZA",
    "S.S. AUDACE CERIGNOLA": "AUDACE CERIGNOLA",
    "S.S. GIUGLIANO CALCIO 1928": "GIUGLIANO",
    "S.S. MONOPOLI 1966": "MONOPOLI",
    "SIRACUSA CALCIO 1924": "SIRACUSA",
    "SORRENTO CALCIO 1945": "SORRENTO",
    "TEAM ALTAMURA": "ALTAMURA",
    "U.S. SALERNITANA 1919": "SALERNITANA",
    "DOLOMITI BELLUNESI": "DOLOMITI BELLUNESI",
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45, context=CTX) as r:
        return r.read().decode("utf-8", "replace")


def parse_comp_teams(html: str) -> list[dict]:
    """Extract team id + display name from competition page."""
    out = []
    # links like /football-manager-2026/team/1139/juventus">Juventus F.C.
    for m in re.finditer(
        r'href="/football-manager-2026/team/(\d+)/([^"]+)"[^>]*>([^<]+)',
        html,
        re.I,
    ):
        tid, slug, name = m.group(1), m.group(2), m.group(3).strip()
        if not name or len(name) < 2:
            continue
        # skip non-team noise
        if name.lower() in ("compare", "view", "search"):
            continue
        out.append({"fmId": tid, "slug": slug, "name": name})
    # dedupe by fmId
    seen = set()
    uniq = []
    for t in out:
        if t["fmId"] in seen:
            continue
        seen.add(t["fmId"])
        uniq.append(t)
    return uniq


def norm(s: str) -> str:
    s = (s or "").upper().strip()
    s = s.replace("’", "'").replace("`", "'")
    for a, b in (
        ("À", "A"),
        ("È", "E"),
        ("É", "E"),
        ("Ì", "I"),
        ("Ò", "O"),
        ("Ù", "U"),
        ("Ü", "U"),
        ("Ö", "O"),
        ("Ä", "A"),
        ("ß", "SS"),
    ):
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s)
    return s


def strip_club_noise(s: str) -> str:
    s = norm(s)
    # remove common prefixes/suffixes
    s = re.sub(
        r"\b(A\.?S\.?D?\.?|S\.?S\.?D?\.?|S\.?S\.?C\.?|F\.?C\.?|A\.?C\.?|U\.?S\.?|U\.?C\.?|A\.?C\.?F\.?|S\.?P\.?A\.?|SRL|SSD|ASD)\b",
        " ",
        s,
    )
    s = re.sub(r"\b(CALCIO|FOOTBALL CLUB|CLUB|1919|1909|1908|1907|1913|1892|1893|1926|1927)\b", " ", s)
    s = re.sub(r"[^A-Z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def build_fm_map(force: bool = False) -> dict:
    if MAP_CACHE.exists() and not force:
        try:
            data = json.loads(MAP_CACHE.read_text(encoding="utf-8"))
            if data.get("teams") and len(data["teams"]) > 50:
                print("Using cached FM map", len(data["teams"]))
                return data
        except Exception:
            pass

    teams = []
    for cid, tier, url in COMPS:
        try:
            html = fetch(url)
            found = parse_comp_teams(html)
            print(f"COMP {tier} {cid}: {len(found)} teams")
            for t in found:
                t["tier"] = tier
                t["compId"] = cid
                teams.append(t)
            time.sleep(0.6)
        except Exception as e:
            print("COMP FAIL", cid, e)

    # dedupe by fmId prefer higher tier
    tier_rank = {"SERIE A": 0, "SERIE B": 1, "SERIE C": 2, "SERIE D": 3}
    by = {}
    for t in teams:
        prev = by.get(t["fmId"])
        if not prev or tier_rank.get(t["tier"], 9) < tier_rank.get(prev["tier"], 9):
            by[t["fmId"]] = t
    data = {"updatedAt": time.strftime("%Y-%m-%d"), "teams": list(by.values())}
    MAP_CACHE.parent.mkdir(parents=True, exist_ok=True)
    MAP_CACHE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("FM map saved", len(data["teams"]))
    return data


def catalog_men_index(cat: dict) -> dict:
    """name_norm -> list of men team dicts (pro first)."""
    idx = {}
    for t in cat["teams"]:
        if t.get("gender") != "m":
            continue
        lg = t.get("league") or ""
        if "FEMMINILE" in lg:
            continue
        # skip pure dilettanti placeholders mass-generated if not pro? keep all men for match
        key = norm(t["name"])
        idx.setdefault(key, []).append(t)
        sk = strip_club_noise(t["name"])
        if sk and sk != key:
            idx.setdefault(sk, []).append(t)
    return idx


def pick_catalog_team(name: str, idx: dict, tier: str) -> dict | None:
    n = norm(name)
    candidates = []
    # alias
    if n in ALIASES:
        n2 = ALIASES[n]
        candidates.extend(idx.get(n2, []))
        candidates.extend(idx.get(norm(n2), []))
    candidates.extend(idx.get(n, []))
    sn = strip_club_noise(name)
    candidates.extend(idx.get(sn, []))
    # unique by id
    seen = set()
    uniq = []
    for t in candidates:
        tid = t.get("id")
        if tid in seen:
            continue
        seen.add(tid)
        uniq.append(t)
    if not uniq:
        # fuzzy: startswith / contained
        for k, ts in idx.items():
            if not k:
                continue
            if sn and (sn == k or sn in k or k in sn) and abs(len(sn) - len(k)) <= 4:
                for t in ts:
                    tid = t.get("id")
                    if tid not in seen:
                        seen.add(tid)
                        uniq.append(t)
    if not uniq:
        return None

    def score(t):
        lg = t.get("league") or ""
        if tier == "SERIE A" and lg.startswith("SERIE A"):
            return 0
        if tier == "SERIE B" and lg.startswith("SERIE B"):
            return 0
        if tier == "SERIE C" and lg.startswith("SERIE C"):
            return 0
        if tier == "SERIE D" and lg.startswith("SERIE D"):
            return 0
        if lg.startswith("SERIE"):
            return 1
        return 5

    return sorted(uniq, key=score)[0]


def save_kit_png(data: bytes, dest: Path, max_side: int = 512) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    # drop pure green chroma leftover if any (ss kits often on green)
    # optional: leave as-is; most already transparent
    w, h = im.size
    m = max(w, h)
    if m > max_side:
        sc = max_side / m
        im = im.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.Resampling.LANCZOS)
    im.save(dest, "PNG", optimize=True)


def main():
    if not ZIP_PATH.exists():
        raise SystemExit(f"ZIP missing: {ZIP_PATH}")

    fm = build_fm_map(force=False)
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    idx = catalog_men_index(cat)

    zf = zipfile.ZipFile(ZIP_PATH)
    # index zip members by fmId
    kit_files: dict[str, dict[str, str]] = {}
    for n in zf.namelist():
        m = re.search(r"/(\d+)_(home|away|third)\.png$", n.replace("\\", "/"), re.I)
        if not m:
            continue
        fid, kind = m.group(1), m.group(2).lower()
        kit_files.setdefault(fid, {})[kind] = n

    matched = []
    unmatched_fm = []
    no_kit = []
    extracted = 0

    for ft in fm["teams"]:
        fid = str(ft["fmId"])
        name = ft["name"]
        tier = ft.get("tier") or ""
        team = pick_catalog_team(name, idx, tier)
        if not team:
            unmatched_fm.append({"fmId": fid, "name": name, "tier": tier})
            continue
        kinds = kit_files.get(fid) or {}
        if not kinds.get("home") and not kinds.get("away"):
            no_kit.append({"fmId": fid, "name": name, "catalog": team["name"]})
            continue

        slug = re.sub(r"[^a-z0-9]+", "-", team["name"].lower()).strip("-")
        dest_dir = OUT_KITS / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        paths = {}
        for kind in ("home", "away", "third"):
            zn = kinds.get(kind)
            if not zn:
                continue
            try:
                data = zf.read(zn)
            except Exception as e:
                print("read fail", zn, e)
                continue
            dest = dest_dir / f"{kind}.png"
            try:
                save_kit_png(data, dest)
                paths[kind] = f"immagini/kits-2d/{slug}/{kind}.png"
                extracted += 1
            except Exception as e:
                print("png fail", fid, kind, e)

        if not paths:
            no_kit.append({"fmId": fid, "name": name, "catalog": team["name"]})
            continue

        team["fmId"] = fid
        team["kitHome"] = paths.get("home") or paths.get("away") or ""
        team["kitAway"] = paths.get("away") or paths.get("home") or ""
        if paths.get("third"):
            team["kitThird"] = paths["third"]
        team["kitSource"] = "sortitoutsi-ss-kits-2026.14"
        matched.append(
            {
                "fmId": fid,
                "fmName": name,
                "catalog": team["name"],
                "league": team.get("league"),
                "paths": paths,
            }
        )
        print(f"OK {tier:8} {name[:28]:28} -> {team['name'][:22]:22} {list(paths)}")

    # report
    report = {
        "zip": str(ZIP_PATH),
        "fmTeams": len(fm["teams"]),
        "matched": len(matched),
        "unmatchedFm": unmatched_fm,
        "noKitFile": no_kit,
        "extractedFiles": extracted,
        "matchedDetail": matched,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    cat["version"] = max(int(cat.get("version") or 31), 32)
    cat.setdefault("stats", {})
    cat["stats"]["kits2dMen"] = len(matched)
    cat["stats"]["kits2dSource"] = "sortitoutsi SS Kits Megapack 2026.14"
    CAT.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    print("---")
    print(f"matched={len(matched)} unmatched_fm={len(unmatched_fm)} no_kit={len(no_kit)} files={extracted}")
    print("report", REPORT)
    # by tier
    from collections import Counter

    print("by league sample", Counter((m.get("league") or "?")[:20] for m in matched).most_common(15))


if __name__ == "__main__":
    main()
