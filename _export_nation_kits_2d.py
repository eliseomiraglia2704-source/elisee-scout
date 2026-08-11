# -*- coding: utf-8 -*-
"""
Esporta kit 2D REALI per ogni nazionale del minigioco.
Fonte prioritaria: kits_by_SS_GAMING (cartelle Nations UEFA/CAF/…)
Fallback: megapack sortitoutsi con ID FM nazione corretti.
"""
from __future__ import annotations

import io
import json
import re
import zipfile
from pathlib import Path

import py7zr
from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "kits-2d-nazioni"
MAP_JSON = ROOT / "data" / "squadre" / "minigioco_nation_kits.json"

SS_GAMING_7Z = Path(r"D:\Download\kits_by_SS_GAMING_sTudiOs.7z")
SS_MEGA_ZIP = Path(r"D:\Download\sortitoutsi SS Kits Megapack 2026.14.zip")

# path home kit nel pack SS_GAMING (kit 2D nazionali reali)
SS_GAMING_HOME = {
    "IT": "kits/kit23/Nations - UEFA/italy1.png",
    "AR": "kits/kit23/Nations - CONMEBOL/argentina1.png",
    "BR": "kits/kit23/Nations - CONMEBOL/brazil1.png",
    "FR": "kits/kit23/Nations - UEFA/france1.png",
    "DE": "kits/kit23/Nations - UEFA/germany1.png",
    "ES": "kits/kit23/Nations - UEFA/spain1.png",
    "PT": "kits/kit23/Nations - UEFA/portugal1.png",
    "EN": "kits/kit23/Nations - UEFA/england1.png",
    "NL": "kits/kit23/Nations - UEFA/netherlands1.png",
    "BE": "kits/kit23/Nations - UEFA/belgium1.png",
    "HR": "kits/kit23/Nations - UEFA/croatia1.png",
    "PL": "kits/kit23/Nations - UEFA/poland1.png",
    "RS": "kits/kit23/Nations - UEFA/serbia1.png",
    "CH": "kits/kit23/Nations - UEFA/switzerland1.png",
    "AT": "kits/kit23/Nations - UEFA/austria1.png",
    "RO": "kits/kit23/Nations - UEFA/romania1.png",
    "AL": "kits/kit23/Nations - UEFA/albania1.png",
    "NG": "kits/kit23/Nations - CAF/nigeria_1.png",
    "SN": "kits/kit23/Nations - CAF/senegal_1.png",
    "MA": "kits/kit23/Nations - CAF/morocco_1.png",
    "US": "kits/kit23/Nations - CONCACAF/usa1.png",
    "MX": "kits/kit23/Nations - CONCACAF/mexico1.png",
    "UY": "kits/kit23/Nations - CONMEBOL/uruguay1.png",
    "CL": "kits/kit23/Nations - CONMEBOL/chile1.png",
    "CO": "kits/kit23/Nations - CONMEBOL/colombia1.png",
    "JP": "kits/kit23/Nations - Asia/japan_1.png",
    "KR": "kits/kit23/Nations - Asia/southkorea_1.png",
    "TR": "kits/kit23/Nations - UEFA/turkey1.png",
}

# fallback FM nation unique ID (lista sortitoutsi / FM)
FM_IDS = {
    "IT": 776,
    "FR": 769,
    "EN": 765,
    "DE": 771,
    "NL": 784,
    "BE": 757,
    "HR": 761,
    "AT": 755,
    "AL": 752,
    "SN": 41,
}

NATION_NAMES = {
    "IT": "Italia",
    "AR": "Argentina",
    "BR": "Brasile",
    "FR": "Francia",
    "DE": "Germania",
    "ES": "Spagna",
    "PT": "Portogallo",
    "EN": "Inghilterra",
    "NL": "Paesi Bassi",
    "BE": "Belgio",
    "HR": "Croazia",
    "PL": "Polonia",
    "RS": "Serbia",
    "CH": "Svizzera",
    "AT": "Austria",
    "RO": "Romania",
    "AL": "Albania",
    "NG": "Nigeria",
    "SN": "Senegal",
    "MA": "Marocco",
    "US": "Stati Uniti",
    "MX": "Messico",
    "UY": "Uruguay",
    "CL": "Cile",
    "CO": "Colombia",
    "JP": "Giappone",
    "KR": "Corea del Sud",
    "TR": "Turchia",
}


def save_kit(data: bytes, dest: Path, max_w: int = 420) -> None:
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    if im.width > max_w:
        h = int(im.height * (max_w / im.width))
        im = im.resize((max_w, h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}

    # --- 1) estrai da SS_GAMING Nations (estrazione selettiva file-per-file) ---
    import shutil
    import tempfile

    print("Opening SS_GAMING 7z…", flush=True)
    wanted_names = set(SS_GAMING_HOME.values())
    # py7zr filter by basename for extractall callback style: extract each alone
    with py7zr.SevenZipFile(SS_GAMING_7Z, mode="r") as z7:
        all_names = z7.getnames()
        name_map = {n.replace("\\", "/"): n for n in all_names}
        for code, rel in SS_GAMING_HOME.items():
            key = rel.replace("\\", "/")
            arc = name_map.get(key)
            if not arc:
                print("missing in 7z", code, rel, flush=True)
                continue
            with tempfile.TemporaryDirectory() as td:
                # extract single file via extractall + filter (more reliable with spaces)
                z7.reset()
                z7.extract(path=td, targets=[arc])
                found = list(Path(td).rglob(Path(arc).name))
                if not found:
                    print("extract fail", code, arc, flush=True)
                    continue
                data = found[0].read_bytes()
            dest = OUT / code.lower() / "home.png"
            save_kit(data, dest)
            report[code] = {
                "c": code,
                "n": NATION_NAMES[code],
                "home": f"immagini/kits-2d-nazioni/{code.lower()}/home.png",
                "source": f"ss_gaming:{rel}",
                "bytes": dest.stat().st_size,
            }
            print("OK gaming", code, dest.stat().st_size, flush=True)

    # --- 2) fallback megapack per eventuali mancanti ---
    still = [c for c in NATION_NAMES if c not in report]
    if still and SS_MEGA_ZIP.exists():
        print("Fallback megapack for", still, flush=True)
        with zipfile.ZipFile(SS_MEGA_ZIP) as z:
            homes = {}
            for n in z.namelist():
                m = re.search(r"/(\d+)_home\.png$", n.replace("\\", "/"))
                if m:
                    homes[int(m.group(1))] = n
            for code in still:
                fid = FM_IDS.get(code)
                if not fid or fid not in homes:
                    print("STILL MISS", code, flush=True)
                    continue
                data = z.read(homes[fid])
                dest = OUT / code.lower() / "home.png"
                save_kit(data, dest)
                report[code] = {
                    "c": code,
                    "n": NATION_NAMES[code],
                    "home": f"immagini/kits-2d-nazioni/{code.lower()}/home.png",
                    "source": f"ss_mega:{fid}",
                    "bytes": dest.stat().st_size,
                }
                print("OK mega", code, fid, dest.stat().st_size, flush=True)

    MAP_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("DONE", len(report), "/", len(NATION_NAMES), flush=True)
    miss = [c for c in NATION_NAMES if c not in report]
    if miss:
        print("MISSING", miss, flush=True)


if __name__ == "__main__":
    main()
