# -*- coding: utf-8 -*-
"""
Esporta TUTTI i kit nazionali dal pack SS_GAMING + genera minigioco_nations_full.json
per lista scrollabile mondiale.
"""
from __future__ import annotations

import io
import json
import re
import shutil
import tempfile
from pathlib import Path

import py7zr
from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "kits-2d-nazioni"
LOGO_OUT = ROOT / "immagini" / "nazioni-loghi"
MAP_JSON = ROOT / "data" / "squadre" / "minigioco_nations_full.json"
SS_GAMING_7Z = Path(r"D:\Download\kits_by_SS_GAMING_sTudiOs.7z")

# slug file (senza _1/1) -> (ISO code, nome IT, emoji)
# ISO usato per flagcdn e path
NATION_META: dict[str, tuple[str, str, str]] = {
    # UEFA
    "albania": ("AL", "Albania", "🇦🇱"),
    "andorra": ("AD", "Andorra", "🇦🇩"),
    "armenia": ("AM", "Armenia", "🇦🇲"),
    "austria": ("AT", "Austria", "🇦🇹"),
    "azerbaijan": ("AZ", "Azerbaigian", "🇦🇿"),
    "belarus": ("BY", "Bielorussia", "🇧🇾"),
    "belgium": ("BE", "Belgio", "🇧🇪"),
    "bosnia": ("BA", "Bosnia ed Erzegovina", "🇧🇦"),
    "bulgaria": ("BG", "Bulgaria", "🇧🇬"),
    "croatia": ("HR", "Croazia", "🇭🇷"),
    "cyprus": ("CY", "Cipro", "🇨🇾"),
    "czech": ("CZ", "Repubblica Ceca", "🇨🇿"),
    "denmark": ("DK", "Danimarca", "🇩🇰"),
    "england": ("EN", "Inghilterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"),
    "estonia": ("EE", "Estonia", "🇪🇪"),
    "faroe_islands": ("FO", "Isole Fær Øer", "🇫🇴"),
    "finland": ("FI", "Finlandia", "🇫🇮"),
    "france": ("FR", "Francia", "🇫🇷"),
    "georgia": ("GE", "Georgia", "🇬🇪"),
    "germany": ("DE", "Germania", "🇩🇪"),
    "gibraltar": ("GI", "Gibilterra", "🇬🇮"),
    "greece": ("GR", "Grecia", "🇬🇷"),
    "hungary": ("HU", "Ungheria", "🇭🇺"),
    "iceland": ("IS", "Islanda", "🇮🇸"),
    "ireland": ("IE", "Irlanda", "🇮🇪"),
    "israel": ("IL", "Israele", "🇮🇱"),
    "italy": ("IT", "Italia", "🇮🇹"),
    "kazakhstan": ("KZ", "Kazakistan", "🇰🇿"),
    "kosovo": ("XK", "Kosovo", "🇽🇰"),
    "latvia": ("LV", "Lettonia", "🇱🇻"),
    "liechtenstein": ("LI", "Liechtenstein", "🇱🇮"),
    "lithuania": ("LT", "Lituania", "🇱🇹"),
    "luxembourg": ("LU", "Lussemburgo", "🇱🇺"),
    "malta": ("MT", "Malta", "🇲🇹"),
    "moldova": ("MD", "Moldavia", "🇲🇩"),
    "montenegro": ("ME", "Montenegro", "🇲🇪"),
    "netherlands": ("NL", "Paesi Bassi", "🇳🇱"),
    "north_macedonia": ("MK", "Macedonia del Nord", "🇲🇰"),
    "northern_ireland": ("NX", "Irlanda del Nord", "🇬🇧"),
    "norway": ("NO", "Norvegia", "🇳🇴"),
    "poland": ("PL", "Polonia", "🇵🇱"),
    "portugal": ("PT", "Portogallo", "🇵🇹"),
    "romania": ("RO", "Romania", "🇷🇴"),
    "russia": ("RU", "Russia", "🇷🇺"),
    "sanmarino": ("SM", "San Marino", "🇸🇲"),
    "scotland": ("SCT", "Scozia", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"),
    "serbia": ("RS", "Serbia", "🇷🇸"),
    "slovakia": ("SK", "Slovacchia", "🇸🇰"),
    "slovenia": ("SI", "Slovenia", "🇸🇮"),
    "spain": ("ES", "Spagna", "🇪🇸"),
    "sweden": ("SE", "Svezia", "🇸🇪"),
    "switzerland": ("CH", "Svizzera", "🇨🇭"),
    "turkey": ("TR", "Turchia", "🇹🇷"),
    "ukraine": ("UA", "Ucraina", "🇺🇦"),
    "wales": ("WLS", "Galles", "🏴󠁧󠁢󠁷󠁬󠁳󠁿"),
    # CONMEBOL
    "argentina": ("AR", "Argentina", "🇦🇷"),
    "bolivia": ("BO", "Bolivia", "🇧🇴"),
    "brazil": ("BR", "Brasile", "🇧🇷"),
    "chile": ("CL", "Cile", "🇨🇱"),
    "colombia": ("CO", "Colombia", "🇨🇴"),
    "ecuador": ("EC", "Ecuador", "🇪🇨"),
    "paraguay": ("PY", "Paraguay", "🇵🇾"),
    "peru": ("PE", "Perù", "🇵🇪"),
    "uruguay": ("UY", "Uruguay", "🇺🇾"),
    "venezuela": ("VE", "Venezuela", "🇻🇪"),
    # CONCACAF
    "usa": ("US", "Stati Uniti", "🇺🇸"),
    "mexico": ("MX", "Messico", "🇲🇽"),
    "canada": ("CA", "Canada", "🇨🇦"),
    "costarica": ("CR", "Costa Rica", "🇨🇷"),
    "panama": ("PA", "Panama", "🇵🇦"),
    "jamaica": ("JM", "Giamaica", "🇯🇲"),
    "honduras": ("HN", "Honduras", "🇭🇳"),
    "elsalvador": ("SV", "El Salvador", "🇸🇻"),
    "guatemala": ("GT", "Guatemala", "🇬🇹"),
    "haiti": ("HT", "Haiti", "🇭🇹"),
    "cuba": ("CU", "Cuba", "🇨🇺"),
    "trinidadtobago": ("TT", "Trinidad e Tobago", "🇹🇹"),
    "curacao": ("CW", "Curaçao", "🇨🇼"),
    "suriname": ("SR", "Suriname", "🇸🇷"),
    "nicaragua": ("NI", "Nicaragua", "🇳🇮"),
    "dominicanrepublic": ("DO", "Repubblica Dominicana", "🇩🇴"),
    # CAF
    "nigeria": ("NG", "Nigeria", "🇳🇬"),
    "senegal": ("SN", "Senegal", "🇸🇳"),
    "morocco": ("MA", "Marocco", "🇲🇦"),
    "marocco": ("MA", "Marocco", "🇲🇦"),
    "egypt": ("EG", "Egitto", "🇪🇬"),
    "cameroon": ("CM", "Camerun", "🇨🇲"),
    "ghana": ("GH", "Ghana", "🇬🇭"),
    "ivory_coast": ("CI", "Costa d'Avorio", "🇨🇮"),
    "tunisia": ("TN", "Tunisia", "🇹🇳"),
    "algeria": ("DZ", "Algeria", "🇩🇿"),
    "mali": ("ML", "Mali", "🇲🇱"),
    "south_africa": ("ZA", "Sudafrica", "🇿🇦"),
    "congo_dr": ("CD", "RD del Congo", "🇨🇩"),
    "dr_congo": ("CD", "RD del Congo", "🇨🇩"),
    "congo": ("CG", "Congo", "🇨🇬"),
    "kenya": ("KE", "Kenya", "🇰🇪"),
    "uganda": ("UG", "Uganda", "🇺🇬"),
    "zambia": ("ZM", "Zambia", "🇿🇲"),
    "zimbabwe": ("ZW", "Zimbabwe", "🇿🇼"),
    "burkina_faso": ("BF", "Burkina Faso", "🇧🇫"),
    "cape_verde": ("CV", "Capo Verde", "🇨🇻"),
    "guinea": ("GN", "Guinea", "🇬🇳"),
    "libya": ("LY", "Libia", "🇱🇾"),
    "angola": ("AO", "Angola", "🇦🇴"),
    "gabon": ("GA", "Gabon", "🇬🇦"),
    "benin": ("BJ", "Benin", "🇧🇯"),
    "togo": ("TG", "Togo", "🇹🇬"),
    "madagascar": ("MG", "Madagascar", "🇲🇬"),
    # Asia
    "japan": ("JP", "Giappone", "🇯🇵"),
    "southkorea": ("KR", "Corea del Sud", "🇰🇷"),
    "china": ("CN", "Cina", "🇨🇳"),
    "australia": ("AU", "Australia", "🇦🇺"),
    "iran": ("IR", "Iran", "🇮🇷"),
    "saudi": ("SA", "Arabia Saudita", "🇸🇦"),
    "qatar": ("QA", "Qatar", "🇶🇦"),
    "uae": ("AE", "Emirati Arabi", "🇦🇪"),
    "iraq": ("IQ", "Iraq", "🇮🇶"),
    "uzbekistan": ("UZ", "Uzbekistan", "🇺🇿"),
    "india": ("IN", "India", "🇮🇳"),
    "thailand": ("TH", "Thailandia", "🇹🇭"),
    "vietnam": ("VN", "Vietnam", "🇻🇳"),
    "indonesia": ("ID", "Indonesia", "🇮🇩"),
    "malaysia": ("MY", "Malaysia", "🇲🇾"),
    "jordan": ("JO", "Giordania", "🇯🇴"),
    "lebanon": ("LB", "Libano", "🇱🇧"),
    "syria": ("SY", "Siria", "🇸🇾"),
    "palestine": ("PS", "Palestina", "🇵🇸"),
    "northkorea": ("KP", "Corea del Nord", "🇰🇵"),
    "philippines": ("PH", "Filippine", "🇵🇭"),
    "singapore": ("SG", "Singapore", "🇸🇬"),
    "hongkong": ("HK", "Hong Kong", "🇭🇰"),
    "bahrain": ("BH", "Bahrein", "🇧🇭"),
    "kuwait": ("KW", "Kuwait", "🇰🇼"),
    "oman": ("OM", "Oman", "🇴🇲"),
    "yemen": ("YE", "Yemen", "🇾🇪"),
    "pakistan": ("PK", "Pakistan", "🇵🇰"),
    "bangladesh": ("BD", "Bangladesh", "🇧🇩"),
    "kyrgyzstan": ("KG", "Kirghizistan", "🇰🇬"),
    "tajikistan": ("TJ", "Tagikistan", "🇹🇯"),
    "turkmenistan": ("TM", "Turkmenistan", "🇹🇲"),
    "mongolia": ("MN", "Mongolia", "🇲🇳"),
    "nepal": ("NP", "Nepal", "🇳🇵"),
    "srilanka": ("LK", "Sri Lanka", "🇱🇰"),
    "myanmar": ("MM", "Myanmar", "🇲🇲"),
    "cambodia": ("KH", "Cambogia", "🇰🇭"),
    "laos": ("LA", "Laos", "🇱🇦"),
    "maldives": ("MV", "Maldive", "🇲🇻"),
    "afghanistan": ("AF", "Afghanistan", "🇦🇫"),
    # OFC
    "newzealand": ("NZ", "Nuova Zelanda", "🇳🇿"),
    "fiji": ("FJ", "Figi", "🇫🇯"),
    "papuanewguinea": ("PG", "Papua Nuova Guinea", "🇵🇬"),
    "solomonislands": ("SB", "Isole Salomone", "🇸🇧"),
    "tahiti": ("PF", "Tahiti", "🇵🇫"),
    "newcaledonia": ("NC", "Nuova Caledonia", "🇳🇨"),
    "vanuatu": ("VU", "Vanuatu", "🇻🇺"),
    "samoa": ("WS", "Samoa", "🇼🇸"),
    "tonga": ("TO", "Tonga", "🇹🇴"),
    # extras
    "bolivia": ("BO", "Bolivia", "🇧🇴"),
    "ecuador": ("EC", "Ecuador", "🇪🇨"),
    "peru": ("PE", "Perù", "🇵🇪"),
    "paraguay": ("PY", "Paraguay", "🇵🇾"),
    "venezuela": ("VE", "Venezuela", "🇻🇪"),
}


def slug_from_filename(name: str) -> str | None:
    base = name.lower().replace("\\", "/").split("/")[-1]
    if not base.endswith(".png"):
        return None
    base = base[:-4]
    # strip trailing 1 / _1 / 2 etc keep only home (1)
    m = re.match(r"^(.+?)_?1$", base)
    if not m:
        return None
    return m.group(1).replace("-", "_").replace(" ", "_")


def save_kit(data: bytes, dest: Path, max_w: int = 420) -> None:
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    if im.width > max_w:
        h = int(im.height * (max_w / im.width))
        im = im.resize((max_w, h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)


def flagcdn_code(iso: str) -> str:
    c = iso.lower()
    if c == "en":
        return "gb-eng"
    if c == "sct":
        return "gb-sct"
    if c == "wls":
        return "gb-wls"
    if c == "nx":
        return "gb-nir"
    if c == "xk":
        return "xk"
    return c


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    LOGO_OUT.mkdir(parents=True, exist_ok=True)

    # index archive home kits
    print("Indexing 7z…", flush=True)
    with py7zr.SevenZipFile(SS_GAMING_7Z, mode="r") as z7:
        names = [n.replace("\\", "/") for n in z7.getnames()]
        home_files = []
        for n in names:
            if "Nations" not in n or not n.lower().endswith(".png"):
                continue
            if "/alternatives/" in n.lower() or "/alt/" in n.lower():
                # allow only if no better - skip alts for home
                if "alt" in n.split("/")[-1].lower() and not n.split("/")[-1].lower().endswith("1.png"):
                    continue
            slug = slug_from_filename(n)
            if not slug:
                continue
            # only *_1 / *1 home
            base = n.split("/")[-1].lower()
            if not (base.endswith("1.png") or base.endswith("_1.png")):
                continue
            if "alt" in base:
                continue
            home_files.append((slug, n))

        # dedupe slug prefer first
        by_slug: dict[str, str] = {}
        for slug, path in home_files:
            if slug not in by_slug:
                by_slug[slug] = path

        print("home kits found", len(by_slug), flush=True)

        nations = []
        seen_codes = set()

        for slug, arc in sorted(by_slug.items(), key=lambda x: x[0]):
            meta = NATION_META.get(slug)
            if not meta:
                # auto name from slug
                code = slug[:3].upper()
                name = slug.replace("_", " ").title()
                emoji = "🏳️"
            else:
                code, name, emoji = meta

            # unique code folder
            folder = code.lower()
            if folder in seen_codes:
                folder = slug.lower()[:12]
            seen_codes.add(folder)

            # extract kit
            with tempfile.TemporaryDirectory() as td:
                z7.reset()
                try:
                    z7.extract(path=td, targets=[arc])
                except Exception as e:
                    print("extract fail", slug, e, flush=True)
                    continue
                found = list(Path(td).rglob(Path(arc).name))
                if not found:
                    print("not found after extract", slug, flush=True)
                    continue
                data = found[0].read_bytes()

            kit_rel = f"immagini/kits-2d-nazioni/{folder}/home.png"
            save_kit(data, ROOT / kit_rel)

            # flag: prefer local, else flagcdn
            logo_local = LOGO_OUT / f"{folder}.png"
            if logo_local.exists() and logo_local.stat().st_size > 200:
                o = f"immagini/nazioni-loghi/{folder}.png"
            else:
                fc = flagcdn_code(code if meta else folder)
                o = f"https://flagcdn.com/w80/{fc}.png"

            nations.append(
                {
                    "n": name,
                    "c": code if meta else folder.upper()[:3],
                    "o": o,
                    "f": emoji,
                    "k": kit_rel,
                    "slug": folder,
                }
            )
            print("OK", code, name, flush=True)

    # sort: Italia first, then alpha IT
    def sort_key(x):
        if x["c"] == "IT" or x["n"] == "Italia":
            return ("0", x["n"])
        return ("1", x["n"])

    nations.sort(key=sort_key)
    MAP_JSON.write_text(json.dumps(nations, ensure_ascii=False, indent=2), encoding="utf-8")
    print("DONE", len(nations), "->", MAP_JSON, flush=True)


if __name__ == "__main__":
    main()
