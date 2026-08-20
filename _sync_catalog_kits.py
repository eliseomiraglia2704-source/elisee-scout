# -*- coding: utf-8 -*-
"""
Aggiorna ed allinea catalog.json con tutti i file kit 2D ed abbigliamento presenti in immagini/kits-2d/.
Scansiona e indicizza OGNI file di immagine presente nelle cartelle dei club:
- Home, Away, Third, Fourth
- Portiere (Home / Away / Third)
- Polo, Pre-Match (Home / Away), Training, etc.
Genera la lista 'kits' completa per ogni squadra.
"""
import json, re, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT_PATH = ROOT / "data" / "squadre" / "catalog.json"
KITS_DIR = ROOT / "immagini" / "kits-2d"

if not CAT_PATH.exists():
    print("Catalog file not found:", CAT_PATH)
    exit(1)

cat = json.loads(CAT_PATH.read_text(encoding="utf-8"))
teams = cat.get("teams", [])

folder_overrides = {
    "asd-pontedera": "eccellenza-toscana-girone-a-toscana-a-asd-ponted",
    "forl": "forli",
    "s-dtirol": "sudtirol"
}
team_by_id = {t["id"]: t for t in teams}

def slugify(s):
    s = (s or "").lower().strip()
    s = s.replace("à","a").replace("è","e").replace("é","e").replace("ì","i").replace("ò","o").replace("ù","u").replace("ü","u").replace("ö","o")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

LABEL_MAP = {
    "home": "IN CASA",
    "away": "OSPITI",
    "third": "TERZA",
    "fourth": "QUARTA",
    "fifth": "QUINTA",
    "goalkeeper": "PORTIERE (CASA)",
    "goalkeeper-home": "PORTIERE (CASA)",
    "gk": "PORTIERE (CASA)",
    "goalkeeper-away": "PORTIERE (OSPITI)",
    "gk-away": "PORTIERE (OSPITI)",
    "goalkeper-away": "PORTIERE (OSPITI)",
    "goalkeeper-third": "PORTIERE (TERZA)",
    "gk-third": "PORTIERE (TERZA)",
    "polo": "POLO",
    "polo-1": "POLO",
    "polo-2": "POLO 2",
    "polo-style": "POLO (STYLE)",
    "polo-white": "POLO (BIANCA)",
    "polo-black": "POLO (NERA)",
    "polo-blue": "POLO (BLU)",
    "polo-red": "POLO (ROSSA)",
    "pre-match": "PRE-MATCH",
    "pre-match-home": "PRE-MATCH (CASA)",
    "pre-match-away": "PRE-MATCH (OSPITI)",
    "pre-match-third": "PRE-MATCH (TERZA)",
    "pre-partita": "PRE-PARTITA",
    "pre-season": "PRE-SEASON",
    "pre-season-home": "PRE-SEASON (CASA)",
    "pre-season-away": "PRE-SEASON (OSPITI)",
    "pre-stagione": "PRE-STAGIONE",
    "retro": "MAGLIA RETRO",
    "travel-shirt": "MAGLIA VIAGGIO",
    "t-shirt": "T-SHIRT",
    "t-shirt-2": "T-SHIRT 2",
    "training": "ALLENAMENTO",
    "trining": "ALLENAMENTO",
    "training-1": "ALLENAMENTO 1",
    "training-2": "ALLENAMENTO 2",
    "training-3": "ALLENAMENTO 3",
    "training-home": "ALLENAMENTO (CASA)",
    "training-away": "ALLENAMENTO (OSPITI)",
    "training-third": "ALLENAMENTO (TERZA)",
    "training-goalkeeper": "ALLENAMENTO PORTIERE",
    "training-gk": "ALLENAMENTO PORTIERE",
    "training-staff": "ALLENAMENTO STAFF",
    "winter-training": "ALLENAMENTO INVERNALE",
    "winter-training-goalkeeper": "ALLENAMENTO INVERNALE PORTIERE",
    "winter-training-staff": "ALLENAMENTO INVERNALE STAFF",
}

STEM_ALIAS = {
    "gk": "goalkeeper",
    "gk-away": "goalkeeper-away",
    "gk-third": "goalkeeper-third",
    "goalkeper-away": "goalkeeper-away",
    "trining": "training",
}


def norm_stem(stem):
    s = (stem or "").lower().strip().replace("_", "-").replace(" ", "-")
    s = re.sub(r"-+", "-", s).strip("-")
    return STEM_ALIAS.get(s, s)

def format_label(stem):
    k = norm_stem(stem)
    if k in LABEL_MAP:
        return LABEL_MAP[k]
    label = k.replace("-", " ").upper()
    label = label.replace("GOALKEEPER", "PORTIERE").replace("GK", "PORTIERE")
    return label

PRIORITY = [
    "home", "away", "third", "fourth", "fifth",
    "goalkeeper", "goalkeeper-home", "goalkeeper-away", "goalkeeper-third",
    "pre-match-home", "pre-match-away", "pre-match", "pre-match-third",
    "polo", "polo-1", "polo-2", "polo-white", "polo-black",
    "training", "training-1", "training-2", "training-3",
    "training-home", "training-away", "training-third",
    "training-goalkeeper", "training-staff",
]

def get_prio(stem):
    s = norm_stem(stem)
    if s in PRIORITY:
        return PRIORITY.index(s)
    return 100

total_indexed_kits = 0
teams_with_extra_kits = 0
matched_folders = 0

if KITS_DIR.exists():
    for folder in KITS_DIR.iterdir():
        if not folder.is_dir():
            continue
        fname = folder.name
        target_id = folder_overrides.get(fname, fname)
        team = team_by_id.get(target_id)
        if not team:
            for t in teams:
                if slugify(t["name"]) == fname or t["id"] == fname:
                    team = t
                    break
        if team:
            matched_folders += 1
            image_files = sorted(
                [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")],
                key=lambda x: (get_prio(x.stem), x.stem.lower())
            )
            
            kits_list = []
            for img in image_files:
                stem = norm_stem(img.stem)
                rel_path = f"immagini/kits-2d/{fname}/{img.name}"
                kits_list.append({
                    "key": stem,
                    "label": format_label(stem),
                    "url": rel_path
                })
                total_indexed_kits += 1

            team["kits"] = kits_list
            if len(kits_list) > 3:
                teams_with_extra_kits += 1
                keys_str = ", ".join(k["key"] for k in kits_list)
                print(f"Club {team['name']} ({fname}): {len(kits_list)} divise/capi -> [{keys_str}]")

            # Backward-compatible single kit properties
            file_dict = {norm_stem(f.stem): f"immagini/kits-2d/{fname}/{f.name}" for f in image_files}
            prop_map = {
                "home": "kitHome",
                "away": "kitAway",
                "third": "kitThird",
                "fourth": "kitFourth",
                "fifth": "kitFifth",
                "goalkeeper": "kitGoalkeeper",
                "goalkeeper-home": "kitGoalkeeper",
                "goalkeeper-away": "kitGoalkeeperAway",
                "goalkeeper-third": "kitGoalkeeperThird",
                "polo": "kitPolo",
                "polo-1": "kitPolo",
                "polo-2": "kitPolo2",
                "pre-match": "kitPreMatch",
                "pre-match-home": "kitPreMatchHome",
                "pre-match-away": "kitPreMatchAway",
                "pre-match-third": "kitPreMatchThird",
                "pre-season": "kitPreSeason",
                "pre-season-home": "kitPreSeasonHome",
                "pre-season-away": "kitPreSeasonAway",
                "training": "kitTraining",
                "training-1": "kitTraining1",
                "training-2": "kitTraining2",
                "training-3": "kitTraining3",
                "training-staff": "kitTrainingStaff",
                "training-goalkeeper": "kitTrainingGoalkeeper",
            }
            for stem, key in prop_map.items():
                if stem in file_dict:
                    team[key] = file_dict[stem]

cat["updatedAt"] = time.strftime("%Y-%m-%d")
CAT_PATH.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Sincronizzazione completata! Cartelle kit abbinate: {matched_folders}")
print(f"Totale capi/divise indicizzati: {total_indexed_kits}")
print(f"Club con divise estese (>3): {teams_with_extra_kits}")
