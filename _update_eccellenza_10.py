# -*- coding: utf-8 -*-
"""Aggiorna 10 gironi Eccellenza 2026/27: nomi, città, loghi. Catalogo + Focus."""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATALOG = ROOT / "data" / "squadre" / "catalog.json"
LOGO_DIR = ROOT / "immagini" / "squadre-loghi"
FOCUS = ROOT / "focus.html"
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "it-IT,it;q=0.9",
}

# league label in catalog.json → (gironeId, title, region for Tuttocampo)
# teams: (display_name, city)
GIRONI = {
    "ECCELLENZA · EMILIA-ROMAGNA · GIRONE A": {
        "id": "emilia-a",
        "title": "Emilia-Romagna · Girone A",
        "area": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "region": "Emilia-Romagna",
        "teams": [
            ("Agazzanese", "Agazzano"),
            ("Arcetana", "Scandiano"),
            ("Ars et Labor Ferrara", "Ferrara"),
            ("Atletic CDR Mutina", "Castelfranco Emilia"),
            ("Bobbiese", "Bobbio"),
            ("Brescello Piccardo", "Brescello"),
            ("Campagnola", "Campagnola Emilia"),
            ("Castellana Fontana", "Castel San Giovanni"),
            ("Castellarano", "Castellarano"),
            ("Fidentina Borgo San Donnino", "Fidenza"),
            ("Futura Fornovo Medesano", "Fornovo di Taro"),
            ("Medolla San Felice", "Medolla"),
            ("Pontenurese", "Pontenure"),
            ("Rolo Fabbrico", "Rolo"),
            ("Sant'Agostino", "Sant'Agostino"),
            ("Vianese Calcio", "Viano"),
            ("Vis Cittadella", "Modena"),
            ("Calcio Zola Predosa", "Zola Predosa"),
        ],
    },
    "ECCELLENZA · EMILIA-ROMAGNA · GIRONE B": {
        "id": "emilia-b",
        "title": "Emilia-Romagna · Girone B",
        "area": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "region": "Emilia-Romagna",
        "teams": [
            ("Castenaso Calcio", "Castenaso"),
            ("Comacchiese", "Comacchio"),
            ("Fratta Terme", "Bertinoro"),
            ("Futball Cava Ronco", "Forlì"),
            ("Imolese", "Imola"),
            ("Massa Lombarda", "Massa Lombarda"),
            ("Medicina Fossatone", "Medicina"),
            ("Osteria Grande", "Castel San Pietro Terme"),
            ("Pietracuta", "San Leo"),
            ("Rimini", "Rimini"),
            ("Russi", "Russi"),
            ("Sammaurese", "San Mauro Pascoli"),
            ("San Marino", "Acquaviva"),
            ("Sanpaimola", "Conselice"),
            ("Savignanese", "Savignano sul Rubicone"),
            ("Santarcangelo", "Santarcangelo di Romagna"),
            ("Valsanterno", "Borgo Tossignano"),
            ("Vis Novafeltria", "Novafeltria"),
        ],
    },
    "ECCELLENZA · FRIULI-VENEZIA GIULIA": {
        "id": "fvg",
        "title": "Friuli-Venezia Giulia",
        "area": "Eccellenza · girone unico ufficiale 2026/27 (18 squadre)",
        "region": "Friuli-Venezia Giulia",
        "teams": [
            ("Azzurra Premariacco", "Premariacco"),
            ("Teor", "Teor"),
            ("Casarsa", "Casarsa della Delizia"),
            ("Chions", "Chions"),
            ("Fontanafredda", "Fontanafredda"),
            ("Forum Julii", "Cividale del Friuli"),
            ("Juventina Sant'Andrea", "Gorizia"),
            ("Muggia", "Muggia"),
            ("Kras Repen", "Monrupino"),
            ("Pordenone", "Pordenone"),
            ("Codroipo", "Codroipo"),
            ("Tamai", "Brugnera"),
            ("Pro Fagagna", "Fagagna"),
            ("Pro Gorizia", "Gorizia"),
            ("San Luigi", "Trieste"),
            ("Sanvitese", "San Vito al Tagliamento"),
            ("Tolmezzo Carnia", "Tolmezzo"),
            ("UF Monfalcone", "Monfalcone"),
        ],
    },
    "ECCELLENZA · LOMBARDIA · GIRONE A": {
        "id": "lombardia-a",
        "title": "Lombardia · Girone A",
        "area": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "region": "Lombardia",
        "teams": [
            ("Ardor Lazzate", "Lazzate"),
            ("Assago", "Assago"),
            ("Aurora Cantalupo", "Cerro Maggiore"),
            ("Baranzatese", "Baranzate"),
            ("Barona", "Milano"),
            ("Accademy Calvairate", "Milano"),
            ("Besnatese", "Besnate"),
            ("Caronnese", "Caronno Pertusella"),
            ("Legnano", "Legnano"),
            ("Lentatese", "Lentate sul Seveso"),
            ("Magenta", "Magenta"),
            ("Rhodense", "Rho"),
            ("Saronno", "Saronno"),
            ("Sedriano", "Sedriano"),
            ("Tribiano", "Tribiano"),
            ("Vergiatese", "Vergiate"),
        ],
    },
    "ECCELLENZA · LOMBARDIA · GIRONE B": {
        "id": "lombardia-b",
        "title": "Lombardia · Girone B",
        "area": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "region": "Lombardia",
        "teams": [
            ("Arcellasco", "Erba"),
            ("Caravaggio", "Caravaggio"),
            ("Cisanese", "Cisano Bergamasco"),
            ("Città di Albino", "Albino"),
            ("Franco Scarioni", "Milano"),
            ("Juvenes United", "Casnigo"),
            ("Lemine Almenno", "Almenno San Salvatore"),
            ("Luciano Manara", "Barzanò"),
            ("Muggiò", "Muggiò"),
            ("Olginatese", "Olginate"),
            ("Ponte San Pietro Mapello", "Ponte San Pietro"),
            ("Seregno", "Seregno"),
            ("Nuova Sondrio", "Sondrio"),
            ("Trevigliese", "Treviglio"),
            ("Vis Nova Giussano", "Giussano"),
            ("Zingonia Verdellino", "Verdellino"),
        ],
    },
    "ECCELLENZA · LOMBARDIA · GIRONE C": {
        "id": "lombardia-c",
        "title": "Lombardia · Girone C",
        "area": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "region": "Lombardia",
        "teams": [
            ("Breno", "Breno"),
            ("Carpenedolo BSV Garda", "Carpenedolo"),
            ("Sporting Castellana", "Castel Goffredo"),
            ("Castiglione", "Castiglione delle Stiviere"),
            ("Cellatica", "Cellatica"),
            ("Ciliverghe Mazzano", "Mazzano"),
            ("Codogno", "Codogno"),
            ("Offanenghese", "Offanengo"),
            ("Orceana", "Orzinuovi"),
            ("Pianico", "Pianico"),
            ("Poggese", "Poggio Rusco"),
            ("San Pancrazio", "Palazzolo sull'Oglio"),
            ("Soncinese", "Soncino"),
            ("Sported Maris", "Cremona"),
            ("Torre de' Roveri", "Torre de' Roveri"),
            ("Verolese", "Verolanuova"),
        ],
    },
    "ECCELLENZA · MARCHE": {
        "id": "marche",
        "title": "Marche",
        "area": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "region": "Marche",
        "teams": [
            ("Aurora Treia", "Treia"),
            ("Castelfidardo", "Castelfidardo"),
            ("Chiesanuova", "Treia"),
            ("Fano", "Fano"),
            ("Fermana", "Fermo"),
            ("Fermignanese", "Fermignano"),
            ("Jesina", "Jesi"),
            ("Lunano", "Lunano"),
            ("Matelica", "Matelica"),
            ("Montefano", "Montefano"),
            ("Montegranaro", "Montegranaro"),
            ("Osimana", "Osimo"),
            ("Sangiustese", "Monte San Giusto"),
            ("Tolentino", "Tolentino"),
            ("Trodica", "Morrovalle"),
            ("Urbino", "Urbino"),
        ],
    },
    "ECCELLENZA · PIEMONTE / VDA · GIRONE A": {
        "id": "piemonte-a",
        "title": "Piemonte / VdA · Girone A",
        "area": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "region": "Piemonte",
        "teams": [
            ("Accademia Borgomanero", "Borgomanero"),
            ("Autovip San Mauro", "San Mauro Torinese"),
            ("Aygreville", "Aymavilles"),
            ("Baveno Stresa", "Baveno"),
            ("Borgaro", "Borgaro Torinese"),
            ("Briga", "Briga Novarese"),
            ("Casale", "Casale Monferrato"),
            ("Druentina", "Druento"),
            ("Dufour Varallo", "Varallo"),
            ("Fulgor Chiavazzese", "Biella"),
            ("Pro Eureka", "Settimo Torinese"),
            ("Quincinetto Tavagnasco", "Quincinetto"),
            ("Rivarolese", "Rivarolo Canavese"),
            ("Settimo", "Settimo Torinese"),
            ("Sparta Novaromentino", "Novara"),
            ("Volpiano Pianese", "Volpiano"),
        ],
    },
    "ECCELLENZA · PIEMONTE / VDA · GIRONE B": {
        "id": "piemonte-b",
        "title": "Piemonte / VdA · Girone B",
        "area": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "region": "Piemonte",
        "teams": [
            ("Albese", "Alba"),
            ("Csf Carmagnola", "Carmagnola"),
            ("Cheraschese", "Cherasco"),
            ("Cuneo 1905 Olmo", "Cuneo"),
            ("Chieri", "Chieri"),
            ("Fossano", "Fossano"),
            ("Giovanile Centallo", "Centallo"),
            ("Gaviese", "Gavi"),
            ("Monregale", "Mondovì"),
            ("Moretta", "Moretta"),
            ("Ovadese", "Ovada"),
            ("Pro Dronero", "Dronero"),
            ("Pro Villafranca", "Villafranca d'Asti"),
            ("San Domenico Savio Asti", "Asti"),
            ("Spartak San Damiano", "San Damiano d'Asti"),
            ("Vanchiglia", "Torino"),
        ],
    },
    "ECCELLENZA · PUGLIA": {
        "id": "puglia",
        "title": "Puglia",
        "area": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "region": "Puglia",
        "teams": [
            ("Atletico Acquaviva", "Acquaviva delle Fonti"),
            ("Atletico Racale", "Racale"),
            ("Bitonto Calcio", "Bitonto"),
            ("Brilla Campi", "Campi Salentina"),
            ("Canosa Calcio 1948", "Canosa di Puglia"),
            ("Cosmano Sport Foggia", "Foggia"),
            ("Galatina Calcio", "Galatina"),
            ("Novoli Calcio", "Novoli"),
            ("Nuova Spinazzola", "Spinazzola"),
            ("Ostuni Calcio", "Ostuni"),
            ("Polimnia Calcio", "Polignano a Mare"),
            ("Soccer Trani", "Trani"),
            ("Squinzano Calcio", "Squinzano"),
            ("Taranto Calcio", "Taranto"),
            ("Taurisano 1939", "Taurisano"),
            ("A. Toma Maglie", "Maglie"),
            ("Ugento Calcio", "Ugento"),
            ("Unione Calcio Bisceglie", "Bisceglie"),
        ],
    },
}

WIKI_TITLES = {
    "Ars et Labor Ferrara": "Ars et Labor Ferrara",
    "Brescello Piccardo": "Polisportiva Brescello",
    "Calcio Zola Predosa": "Calcio Zola Predosa",
    "Imolese": "Imolese Calcio 1919",
    "Rimini": "Rimini Football Club",
    "Russi": "Unione Sportiva Russi",
    "Sammaurese": "Associazione Calcio Sammaurese",
    "San Marino": "San Marino Calcio",
    "Santarcangelo": "Santarcangelo Calcio",
    "Pro Gorizia": "Pro Gorizia",
    "Pordenone": "Pordenone Calcio",
    "Tamai": "Polisportiva Tamai",
    "Sanvitese": "Sanvitese",
    "UF Monfalcone": "Unione Fincantieri Monfalcone",
    "Caronnese": "Società Calcistica Caronnese",
    "Legnano": "Associazione Calcio Legnano",
    "Magenta": "Associazione Calcio Magenta",
    "Rhodense": "Football Club Dilettanti Rhodense",
    "Saronno": "Foot-Ball Club Saronno 1910",
    "Caravaggio": "Unione Sportiva Dilettantistica Caravaggio",
    "Olginatese": "Unione Sportiva Olginatese",
    "Ponte San Pietro Mapello": "Associazione Calcio Ponte San Pietro Mapello",
    "Seregno": "Seregno FBC",
    "Nuova Sondrio": "Sondrio Calcio",
    "Trevigliese": "Circolo Sportivo Trevigliese",
    "Vis Nova Giussano": "Associazione Sportiva Vis Nova Giussano",
    "Breno": "Unione Sportiva Dilettantistica Breno",
    "Carpenedolo BSV Garda": "Football Club Carpenedolo",
    "Sporting Castellana": "Associazione Calcistica Castellana Calcio",
    "Castiglione": "Football Club Castiglione Società Sportiva Dilettantistica",
    "Codogno": "R.C. Codogno 1908",
    "Orceana": "Associazione Sportiva Orceana Calcio",
    "Poggese": "Poggese X Ray One",
    "Castelfidardo": "Società G.S.D. Castelfidardo",
    "Fano": "Alma Juventus Fano 1906",
    "Fermana": "Fermana Football Club",
    "Jesina": "Jesina Calcio",
    "Matelica": "Società Sportiva Matelica Calcio 1921",
    "Osimana": "Osimana",
    "Sangiustese": "Associazione Calcio Sangiustese",
    "Tolentino": "Unione Sportiva Tolentino 1919",
    "Urbino": "LMV Urbino 1921",
    "Accademia Borgomanero": "Associazione Sportiva Dilettantistica Accademia Borgomanero 1961",
    "Casale": "Casale 1909",
    "Rivarolese": "Unione Sportiva Dilettantistica Rivarolese 1906",
    "Settimo": "Associazione Sportiva Dilettantistica Settimo",
    "Volpiano Pianese": "Gruppo Sportivo Dilettantistico Volpiano",
    "Albese": "Albese Calcio",
    "Cuneo 1905 Olmo": "Associazione Calcio Cuneo 1905 Olmo",
    "Chieri": "Associazione Sportiva Dilettantistica Chieri",
    "Fossano": "Fossano Calcio",
    "Bitonto Calcio": "Unione Sportiva Bitonto Calcio",
    "Canosa Calcio 1948": "Canosa Calcio 1948",
    "Galatina Calcio": "Galatina Calcio",
    "Ostuni Calcio": "Ostuni Calcio 24",
    "Soccer Trani": "Soccer Trani",
    "Squinzano Calcio": "Unione Sportiva Squinzano",
    "Taranto Calcio": "Società Sportiva Taranto Calcio",
    "A. Toma Maglie": "Antonio Toma Maglie",
}

FL_SLUGS = {
    "Legnano": "legnano",
    "Seregno": "seregno",
    "Fermana": "fermana",
    "Fano": "alma-juventus-fano",
    "Taranto Calcio": "taranto",
    "Casale": "casale",
    "Cuneo 1905 Olmo": "cuneo",
    "Pordenone": "pordenone",
    "Rimini": "rimini",
    "Imolese": "imolese",
    "Bitonto Calcio": "bitonto",
    "Saronno": "saronno",
    "Caronnese": "caronnese",
    "Magenta": "magenta",
    "Chieri": "chieri",
    "Fossano": "fossano",
    "Jesina": "jesina",
    "Castelfidardo": "castelfidardo-calcio",
    "Matelica": "matelica",
    "Urbino": "urbino",
    "San Marino": "san-marino",
    "Breno": "breno",
    "Olginatese": "olginatese",
    "Pro Gorizia": "pro-gorizia",
}


def slug(s: str) -> str:
    s = s.lower().strip()
    for a, b in [("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u"), ("'", " "), (".", " ")]:
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:48] or "team"


def abbr(name: str) -> str:
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC", "AS", "US", "SSD", "ASD", "AC", "SC", "CALCIO", "CLUB", "SPORTING", "A.", "S.S.D.")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]


def colors(seed: str):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = 40 + ((h >> 16) & 255) % 180, 40 + ((h >> 8) & 255) % 180, 40 + (h & 255) % 180
    return f"#{r:02x}{g:02x}{b:02x}", f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"


def fetch_bytes(url: str, timeout: int = 8) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            data = r.read()
            if not data or len(data) < 400:
                return None
            head = data[:80].lstrip().lower()
            if head.startswith(b"<!doctype") or head.startswith(b"<html"):
                return None
            return data
    except Exception:
        return None


def fetch_json(url: str):
    data = fetch_bytes(url)
    if not data:
        return None
    try:
        return json.loads(data.decode("utf-8", "replace"))
    except Exception:
        return None


def existing_logo_index() -> dict[str, str]:
    idx = {}
    for p in LOGO_DIR.glob("*.png"):
        if p.stat().st_size < 800:
            continue
        key = re.sub(r"[^a-z0-9]+", "", p.stem.lower())
        idx[key] = f"immagini/squadre-loghi/{p.name}"
    return idx


def match_existing(name: str, idx: dict[str, str]) -> str | None:
    key = re.sub(r"[^a-z0-9]+", "", slug(name))
    if key in idx:
        return idx[key]
    for k, path in idx.items():
        if key and (key in k or k in key) and min(len(key), len(k)) >= 6:
            return path
    return None


def save_logo(sid: str, data: bytes) -> str | None:
    if not data or len(data) < 400:
        return None
    head = data[:80].lstrip().lower()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        ext = "png"
    elif data[:2] == b"\xff\xd8":
        ext = "jpg"
    elif b"<svg" in head:
        ext = "svg"
    else:
        return None
    dest = LOGO_DIR / f"{sid}.{ext}"
    dest.write_bytes(data)
    return f"immagini/squadre-loghi/{dest.name}"


def wiki_logo(title: str, sid: str) -> str | None:
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "pageimages", "piprop": "original", "titles": title, "origin": "*"})
    js = fetch_json(f"https://it.wikipedia.org/w/api.php?{q}")
    if not js:
        return None
    pages = (js.get("query") or {}).get("pages") or {}
    for pg in pages.values():
        orig = (pg.get("original") or {}).get("source")
        if orig and any(orig.lower().endswith(x) for x in (".png", ".jpg", ".jpeg", ".svg")):
            if "pictogram" in orig.lower() or "flag_of" in orig.lower() or "600px" in orig.lower():
                continue
            data = fetch_bytes(orig)
            if data:
                path = save_logo(sid, data)
                if path:
                    return path
    return None


def football_logos(fl_slug: str, sid: str) -> str | None:
    for url in (
        f"https://assets.football-logos.cc/logos/italy/512x512/{fl_slug}.png",
        f"https://images.football-logos.cc/logos/italy/512x512/{fl_slug}.png",
    ):
        data = fetch_bytes(url)
        if data:
            path = save_logo(sid, data)
            if path:
                return path
    return None


def write_svg_fallback(sid: str, name: str, primary: str) -> str:
    letters = abbr(name)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'
        f'<rect width="128" height="128" rx="24" fill="{primary}"/>'
        f'<text x="64" y="78" text-anchor="middle" font-family="Arial,sans-serif" '
        f'font-size="42" font-weight="700" fill="#ffffff">{letters}</text></svg>'
    )
    dest = LOGO_DIR / f"{sid}.svg"
    dest.write_text(svg, encoding="utf-8")
    return f"immagini/squadre-loghi/{dest.name}"


def resolve_logo(name: str, sid: str, region: str, idx: dict[str, str], primary: str) -> str:
    local = match_existing(name, idx)
    if local:
        return local
    dest_png = LOGO_DIR / f"{sid}.png"
    dest_svg = LOGO_DIR / f"{sid}.svg"
    if dest_png.exists() and dest_png.stat().st_size > 800:
        return f"immagini/squadre-loghi/{dest_png.name}"
    if dest_svg.exists() and dest_svg.stat().st_size > 80:
        return f"immagini/squadre-loghi/{dest_svg.name}"
    if name in FL_SLUGS:
        got = football_logos(FL_SLUGS[name], sid)
        if got:
            return got
    if name in WIKI_TITLES:
        got = wiki_logo(WIKI_TITLES[name], sid)
        if got:
            return got
    return write_svg_fallback(sid, name, primary)


def make_team(name, league, city, pos, logo_path, sid):
    p, s = colors(sid)
    return {
        "id": sid,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": city.upper(),
        "year": "1920",
        "abbr": abbr(name),
        "gender": "m",
        "pos": pos,
        "pts": 0,
        "played": 0,
        "logo": logo_path,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": {"body": p, "sleeve": p},
        "away": {"body": s, "sleeve": p},
        "stadium": "",
        "capacity": None,
        "stadiumImage": "immagini/stadi/_default.jpg",
        "stadiumImageSource": "default",
    }


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def build_js_block(g: dict) -> str:
    lines = [f"    G('{g['id']}', '{js_escape(g['title'])}', '{js_escape(g['area'])}', ["]
    for name, city, logo in g["resolved"]:
        lines.append(
            f"      {{ name: '{js_escape(name)}', city: '{js_escape(city)}', logo: '{js_escape(logo)}' }},"
        )
    lines.append("    ]),")
    return "\n".join(lines)


def patch_focus(resolved: dict):
    text = FOCUS.read_text(encoding="utf-8")
    # CSS for logos
    if ".focus-team-logo" not in text:
        css = """
    .focus-team-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
      border-radius: 6px;
      background: rgba(255,255,255,0.04);
    }
    .focus-team-logo-empty {
      display: inline-block;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(148,163,184,0.12);
    }
    .focus-team-meta {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      min-width: 0;
    }
    .focus-team-city {
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 500;
    }
"""
        text = text.replace("    .focus-girone-detail-head p {", css + "    .focus-girone-detail-head p {")
    old_row = """  function teamRow(name, zone, i) {
    return (
      '<li class="focus-team-item" aria-disabled="true">' +
      '<span class="focus-team-idx">' + (i + 1) + '</span>' +
      '<span class="focus-team-name">' + esc(name) + '</span>' +
      '<span class="focus-team-zone">' + esc(zone || '') + '</span>' +
      '<span class="focus-team-badge">Non iscritta</span>' +
      '</li>'
    );
  }"""
    new_row = """  function teamRow(t, zone, i) {
    var name = (t && typeof t === 'object') ? (t.name || '') : String(t || '');
    var city = (t && typeof t === 'object') ? (t.city || '') : '';
    var logo = (t && typeof t === 'object') ? (t.logo || '') : '';
    var zoneText = city || zone || '';
    var logoHtml = logo
      ? '<img class="focus-team-logo" src="' + esc(logo) + '" alt="" width="28" height="28">'
      : '<span class="focus-team-logo focus-team-logo-empty" aria-hidden="true"></span>';
    return (
      '<li class="focus-team-item" aria-disabled="true">' +
      '<span class="focus-team-idx">' + (i + 1) + '</span>' +
      logoHtml +
      '<span class="focus-team-meta">' +
      '<span class="focus-team-name">' + esc(name) + '</span>' +
      (city ? '<span class="focus-team-city">' + esc(city) + '</span>' : '') +
      '</span>' +
      '<span class="focus-team-zone">' + esc(zoneText) + '</span>' +
      '<span class="focus-team-badge">Non iscritta</span>' +
      '</li>'
    );
  }"""
    if old_row in text:
        text = text.replace(old_row, new_row)
    order = [
        "lombardia-a", "lombardia-b", "lombardia-c",
        "piemonte-a", "piemonte-b", "fvg", "emilia-a", "emilia-b",
        "marche", "puglia",
    ]
    by_id = {v["id"]: v for v in resolved.values()}
    for gid in order:
        g = by_id[gid]
        pat = re.compile(
            rf"    G\('{re.escape(gid)}',[\s\S]*?\n    \]\),",
            re.M,
        )
        block = build_js_block(g).rstrip(",")
        m = pat.search(text)
        if not m:
            print("WARN no G() block", gid)
            continue
        text = text[: m.start()] + block + "," + text[m.end():]
        print("patched focus", gid, "teams", len(g["resolved"]))
    FOCUS.write_text(text, encoding="utf-8")


def patch_agents():
    p = ROOT / "campionati-agents.js"
    t = p.read_text(encoding="utf-8")
    repl = {
        "lombardia-a": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "lombardia-b": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "lombardia-c": "Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)",
        "piemonte-a": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "piemonte-b": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "fvg": "Eccellenza · girone unico ufficiale 2026/27 (18 squadre)",
        "emilia-a": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "emilia-b": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
        "marche": "Eccellenza · organico ufficiale 2026/27 (16 squadre)",
        "puglia": "Eccellenza · organico ufficiale 2026/27 (18 squadre)",
    }
    for gid, area in repl.items():
        t = re.sub(
            rf"(campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: '{gid}', title: '[^']+', area: ')[^']+(')",
            rf"\1{area}\2",
            t,
            count=1,
        )
    p.write_text(t, encoding="utf-8")


def main():
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    idx = existing_logo_index()
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    keep = [t for t in cat["teams"] if t.get("league") not in GIRONI]
    new_teams = []
    resolved = {}
    for league, meta in GIRONI.items():
        resolved_teams = []
        for i, (name, city) in enumerate(meta["teams"], 1):
            sid = slug(f"ecc-{meta['id']}-{name}")
            p, _ = colors(sid)
            print("logo", name, "...", flush=True)
            logo = resolve_logo(name, sid, meta["region"], idx, p)
            time.sleep(0.05)
            team = make_team(name, league, city, i, logo, sid)
            new_teams.append(team)
            resolved_teams.append((name, city, logo))
        resolved[league] = {**meta, "resolved": resolved_teams}
        print(league, len(resolved_teams))
    cat["teams"] = keep + new_teams
    cat["updatedAt"] = "2026-08-27"
    cat["stats"]["total"] = len(cat["teams"])
    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    from _kit_folders import ensure_kit_folders
    ensure_kit_folders(cat.get("teams") or [])
    print("catalog teams", len(cat["teams"]))
    patch_focus(resolved)
    patch_agents()
    print("DONE")


if __name__ == "__main__":
    main()
