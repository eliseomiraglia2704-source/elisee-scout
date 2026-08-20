# -*- coding: utf-8 -*-
"""Scarica stemmi nazionali da football-logos.cc per minigioco."""
from __future__ import annotations

import io
import json
import re
import ssl
import time
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "nazioni-loghi"
OUT.mkdir(parents=True, exist_ok=True)
MAP = ROOT / "data" / "squadre" / "minigioco_nations.json"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,image/*,*/*",
    "Referer": "https://football-logos.cc/",
}

# (code, display name, country folder, national-team slug)
NATIONS = [
    ("IT", "Italia", "italy", "italy-national-team"),
    ("AR", "Argentina", "argentina", "argentina-national-team"),
    ("BR", "Brasile", "brazil", "brazil-national-team"),
    ("FR", "Francia", "france", "france-national-team"),
    ("DE", "Germania", "germany", "germany-national-team"),
    ("ES", "Spagna", "spain", "spain-national-team"),
    ("PT", "Portogallo", "portugal", "portuguese-football-federation"),
    ("EN", "Inghilterra", "england", "england-national-team"),
    ("NL", "Paesi Bassi", "netherlands", "dutch-national-team"),
    ("BE", "Belgio", "belgium", "belgium-national-team"),
    ("HR", "Croazia", "croatia", "croatia-national-team"),
    ("PL", "Polonia", "poland", "poland-national-team"),
    ("RS", "Serbia", "serbia", "serbia-national-team"),
    ("CH", "Svizzera", "switzerland", "switzerland-national-team"),
    ("AT", "Austria", "austria", "austria-national-team"),
    ("RO", "Romania", "romania", "romania-national-team"),
    ("AL", "Albania", "albania", "albania-national-team"),
    ("NG", "Nigeria", "nigeria", "nigeria-national-team"),
    ("SN", "Senegal", "senegal", "senegal-national-team"),
    ("MA", "Marocco", "morocco", "morocco-national-team"),
    ("US", "Stati Uniti", "usa", "usa-national-team"),
    ("MX", "Messico", "mexico", "mexico-national-team"),
    ("UY", "Uruguay", "uruguay", "uruguay-national-team"),
    ("CL", "Cile", "chile", "chile-national-team"),
    ("CO", "Colombia", "colombia", "colombia-national-team"),
    ("JP", "Giappone", "japan", "japan-national-team"),
    ("KR", "Corea del Sud", "south-korea", "south-korea-national-team"),
    ("TR", "Turchia", "turkey", "turkey-national-team"),
    ("SCO", "Scozia", "scotland", "scotland-national-team"),
    ("WAL", "Galles", "wales", "wales-national-team"),
    ("NIR", "Irlanda del Nord", "northern-ireland", "northern-ireland-national-team"),
    ("IE", "Irlanda", "ireland", "republic-of-ireland-national-team"),
    ("HU", "Ungheria", "hungary", "hungary-national-team"),
    ("CZ", "Repubblica Ceca", "czech-republic", "czech-republic-national-team"),
    ("SK", "Slovacchia", "slovakia", "slovakia-national-team"),
    ("SI", "Slovenia", "slovenia", "slovenia-national-team"),
    ("GR", "Grecia", "greece", "greece-national-team"),
    ("BG", "Bulgaria", "bulgaria", "bulgaria-national-team"),
    ("UA", "Ucraina", "ukraine", "ukraine-national-team"),
    ("RU", "Russia", "russia", "russia-national-team"),
    ("NO", "Norvegia", "norway", "norway-national-team"),
    ("SE", "Svezia", "sweden", "sweden-national-team"),
    ("DK", "Danimarca", "denmark", "denmark-national-team"),
    ("FI", "Finlandia", "finland", "finland-national-team"),
    ("IS", "Islanda", "iceland", "iceland-national-team"),
    ("BA", "Bosnia", "bosnia-and-herzegovina", "bosnia-and-herzegovina-national-team"),
    ("ME", "Montenegro", "montenegro", "montenegro-national-team"),
    ("MK", "Macedonia del Nord", "north-macedonia", "north-macedonia-national-team"),
    ("XK", "Kosovo", "kosovo", "kosovo-national-team"),
    ("CY", "Cipro", "cyprus", "cyprus-national-team"),
    ("LU", "Lussemburgo", "luxembourg", "luxembourg-national-team"),
    ("MD", "Moldavia", "moldova", "moldova-national-team"),
    ("BY", "Bielorussia", "belarus", "belarus-national-team"),
    ("GE", "Georgia", "georgia", "georgia-national-team"),
    ("AM", "Armenia", "armenia", "armenia-national-team"),
    ("AZ", "Azerbaijan", "azerbaijan", "azerbaijan-national-team"),
    ("IL", "Israele", "israel", "israel-national-team"),
    ("LV", "Lettonia", "latvia", "latvia-national-team"),
    ("LT", "Lituania", "lithuania", "lithuania-national-team"),
    ("EE", "Estonia", "estonia", "estonia-national-team"),
    ("MT", "Malta", "malta", "malta-national-team"),
    ("AD", "Andorra", "andorra", "andorra-national-team"),
    ("SM", "San Marino", "san-marino", "san-marino-national-team"),
    ("LI", "Liechtenstein", "liechtenstein", "liechtenstein-national-team"),
    ("GI", "Gibilterra", "gibraltar", "gibraltar-national-team"),
    ("KZ", "Kazakistan", "kazakhstan", "kazakhstan-national-team"),
    ("EC", "Ecuador", "ecuador", "ecuador-national-team"),
    ("PY", "Paraguay", "paraguay", "paraguay-national-team"),
    ("BO", "Bolivia", "bolivia", "bolivia-national-team"),
    ("PE", "Perù", "peru", "peru-national-team"),
    ("VE", "Venezuela", "venezuela", "venezuela-national-team"),
    ("PA", "Panama", "panama", "panama-national-team"),
    ("CR", "Costa Rica", "costa-rica", "costa-rica-national-team"),
    ("HN", "Honduras", "honduras", "honduras-national-team"),
    ("SV", "El Salvador", "el-salvador", "el-salvador-national-team"),
    ("GT", "Guatemala", "guatemala", "guatemala-national-team"),
    ("NI", "Nicaragua", "nicaragua", "nicaragua-national-team"),
    ("JM", "Jamaica", "jamaica", "jamaica-national-team"),
    ("TT", "Trinidad e Tobago", "trinidad-and-tobago", "trinidad-and-tobago-national-team"),
    ("HT", "Haiti", "haiti", "haiti-national-team"),
    ("CU", "Cuba", "cuba", "cuba-national-team"),
    ("DO", "Rep. Dominicana", "dominican-republic", "dominican-republic-national-team"),
    ("CA", "Canada", "canada", "canada-national-team"),
    ("CW", "Curaçao", "curacao", "curacao-national-team"),
    ("SR", "Suriname", "suriname", "suriname-national-team"),
    ("GY", "Guyana", "guyana", "guyana-national-team"),
    ("EG", "Egitto", "egypt", "egypt-national-team"),
    ("GH", "Ghana", "ghana", "ghana-national-team"),
    ("CI", "Costa d'Avorio", "ivory-coast", "ivory-coast-national-team"),
    ("CM", "Camerun", "cameroon", "cameroon-national-team"),
    ("DZ", "Algeria", "algeria", "algeria-national-team"),
    ("TN", "Tunisia", "tunisia", "tunisia-national-team"),
    ("ML", "Mali", "mali", "mali-national-team"),
    ("BF", "Burkina Faso", "burkina-faso", "burkina-faso-national-team"),
    ("GN", "Guinea", "guinea", "guinea-national-team"),
    ("CD", "Congo DR", "dr-congo", "dr-congo-national-team"),
    ("ZM", "Zambia", "zambia", "zambia-national-team"),
    ("ZW", "Zimbabwe", "zimbabwe", "zimbabwe-national-team"),
    ("TZ", "Tanzania", "tanzania", "tanzania-national-team"),
    ("UG", "Uganda", "uganda", "uganda-national-team"),
    ("KE", "Kenya", "kenya", "kenya-national-team"),
    ("MZ", "Mozambico", "mozambique", "mozambique-national-team"),
    ("GA", "Gabon", "gabon", "gabon-national-team"),
    ("AO", "Angola", "angola", "angola-national-team"),
    ("ET", "Etiopia", "ethiopia", "ethiopia-national-team"),
    ("SD", "Sudan", "sudan", "sudan-national-team"),
    ("LY", "Libia", "libya", "libya-national-team"),
    ("TG", "Togo", "togo", "togo-national-team"),
    ("BJ", "Benin", "benin", "benin-national-team"),
    ("ZA", "Sudafrica", "south-africa", "south-africa-national-team"),
    ("CV", "Capo Verde", "cape-verde", "cape-verde-national-team"),
    ("GQ", "Guinea Equatoriale", "equatorial-guinea", "equatorial-guinea-national-team"),
    ("GM", "Gambia", "gambia", "gambia-national-team"),
    ("SL", "Sierra Leone", "sierra-leone", "sierra-leone-national-team"),
    ("LR", "Liberia", "liberia", "liberia-national-team"),
    ("MG", "Madagascar", "madagascar", "madagascar-national-team"),
    ("RW", "Ruanda", "rwanda", "rwanda-national-team"),
    ("NA", "Namibia", "namibia", "namibia-national-team"),
    ("BW", "Botswana", "botswana", "botswana-national-team"),
    ("CN", "Cina", "china", "china-national-team"),
    ("SA", "Arabia Saudita", "saudi-arabia", "saudi-arabia-national-team"),
    ("IR", "Iran", "iran", "iran-national-team"),
    ("IQ", "Iraq", "iraq", "iraq-national-team"),
    ("SY", "Siria", "syria", "syria-national-team"),
    ("JO", "Giordania", "jordan", "jordan-national-team"),
    ("AE", "Emirati Arabi", "united-arab-emirates", "united-arab-emirates-national-team"),
    ("QA", "Qatar", "qatar", "qatar-national-team"),
    ("BH", "Bahrain", "bahrain", "bahrain-national-team"),
    ("KW", "Kuwait", "kuwait", "kuwait-national-team"),
    ("OM", "Oman", "oman", "oman-national-team"),
    ("UZ", "Uzbekistan", "uzbekistan", "uzbekistan-national-team"),
    ("IN", "India", "india", "india-national-team"),
    ("PK", "Pakistan", "pakistan", "pakistan-national-team"),
    ("BD", "Bangladesh", "bangladesh", "bangladesh-national-team"),
    ("VN", "Vietnam", "vietnam", "vietnam-national-team"),
    ("TH", "Thailandia", "thailand", "thailand-national-team"),
    ("ID", "Indonesia", "indonesia", "indonesia-national-team"),
    ("PH", "Filippine", "philippines", "philippines-national-team"),
    ("MY", "Malaysia", "malaysia", "malaysia-national-team"),
    ("SG", "Singapore", "singapore", "singapore-national-team"),
    ("MM", "Myanmar", "myanmar", "myanmar-national-team"),
    ("KH", "Cambogia", "cambodia", "cambodia-national-team"),
    ("LB", "Libano", "lebanon", "lebanon-national-team"),
    ("PS", "Palestina", "palestine", "palestine-national-team"),
    ("YE", "Yemen", "yemen", "yemen-national-team"),
    ("KP", "Corea del Nord", "north-korea", "north-korea-national-team"),
    ("MN", "Mongolia", "mongolia", "mongolia-national-team"),
    ("AF", "Afghanistan", "afghanistan", "afghanistan-national-team"),
    ("NP", "Nepal", "nepal", "nepal-national-team"),
    ("LK", "Sri Lanka", "sri-lanka", "sri-lanka-national-team"),
    ("TJ", "Tagikistan", "tajikistan", "tajikistan-national-team"),
    ("TM", "Turkmenistan", "turkmenistan", "turkmenistan-national-team"),
    ("KG", "Kirghizistan", "kyrgyzstan", "kyrgyzstan-national-team"),
    ("AU", "Australia", "australia", "australia-national-team"),
    ("NZ", "Nuova Zelanda", "new-zealand", "new-zealand-national-team"),
    ("FJ", "Fiji", "fiji", "fiji-national-team"),
    ("PG", "Papua Nuova Guinea", "papua-new-guinea", "papua-new-guinea-national-team"),
    ("PF", "Tahiti", "tahiti", "tahiti-national-team"),
    ("VU", "Vanuatu", "vanuatu", "vanuatu-national-team"),
    ("WS", "Samoa", "samoa", "samoa-national-team"),
    ("SB", "Salomone", "solomon-islands", "solomon-islands-national-team"),
]


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=35, context=CTX) as r:
        return r.read()


def extract_png_url(html: str, slug: str) -> str | None:
    """Prefer 512x512 crest of the national team slug; avoid monochrome variants."""
    # Clean escaped junk from Next.js payloads
    clean = html.replace("&quot;", '"').replace("\\u0026", "&")
    candidates: list[str] = []
    for m in re.finditer(
        rf"https://assets\.football-logos\.cc/logos/[^\"'\s&]+/{re.escape(slug)}\.[a-f0-9]+\.png",
        clean,
        re.I,
    ):
        u = m.group(0)
        if "monochrome" in u.lower() or "black" in u.lower():
            continue
        candidates.append(u)
    if not candidates:
        m = re.search(
            r'og:image" content="(https://assets\.football-logos\.cc/logos/[^"]+\.png)"',
            clean,
            re.I,
        )
        if m:
            return m.group(1)
        return None
    # prefer 512, then 700, then 256, then 1500
    def score(u: str) -> int:
        if "/512x512/" in u:
            return 0
        if "/700x700/" in u:
            return 1
        if "/256x256/" in u:
            return 2
        if "/1500x1500/" in u:
            return 3
        return 4

    candidates.sort(key=score)
    return candidates[0]


def save_png(data: bytes, dest: Path) -> None:
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((128, 128), Image.Resampling.LANCZOS)
    im.save(dest, "PNG", optimize=True)


def flag_fallback(code: str) -> bytes | None:
    c = code.lower()
    if c == "en":
        c = "gb-eng"
    for u in (f"https://flagcdn.com/w160/{c}.png", f"https://flagcdn.com/w80/{c}.png"):
        try:
            d = get(u)
            if len(d) > 200 and d[:4] == b"\x89PNG":
                return d
        except Exception:
            continue
    return None


def main():
    results = []
    for code, name, country, slug in NATIONS:
        dest = OUT / f"{code.lower()}.png"
        rel = f"immagini/nazioni-loghi/{code.lower()}.png"
        if dest.exists() and dest.stat().st_size > 500:
            print("SKIP", code, name)
            results.append({"c": code, "n": name, "o": rel, "ok": True})
            continue
        ok = False
        pages = [
            f"https://football-logos.cc/{country}/{slug}/",
            f"https://football-logos.cc/{country}/{country}-national-team/",
            f"https://football-logos.cc/{country}/",  # NL/PT: dutch-national-team / portuguese-football-federation
            f"https://football-logos.cc/national-teams/{slug}/",
        ]
        for page in pages:
            try:
                html = get(page).decode("utf-8", "replace")
                url = extract_png_url(html, slug)
                if not url:
                    # any 512 png on page
                    m = re.search(
                        r"https://assets\.football-logos\.cc/logos/[^\"'\s]+512x512/[^\"'\s]+\.png",
                        html,
                        re.I,
                    )
                    url = m.group(0) if m else None
                if not url:
                    print("NO URL", code, page[:60])
                    continue
                data = get(url)
                if len(data) < 400:
                    continue
                # if svg, skip to next / fallback
                if data[:5] == b"<?xml" or data[:4] == b"<svg":
                    print("SVG skip", code)
                    continue
                save_png(data, dest)
                print("OK", code, name, dest.stat().st_size, url[:90])
                ok = True
                break
            except Exception as e:
                print("fail", code, page[:50], type(e).__name__, e)
            time.sleep(0.2)

        if not ok:
            fb = flag_fallback(code)
            if fb:
                try:
                    save_png(fb, dest)
                    print("OK flag", code, name, dest.stat().st_size)
                    ok = True
                except Exception as e:
                    print("flag fail", code, e)

        results.append({"c": code, "n": name, "o": rel if ok else "", "ok": ok})
        time.sleep(0.15)

    MAP.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("DONE", sum(1 for r in results if r["ok"]), "/", len(results))


if __name__ == "__main__":
    main()
