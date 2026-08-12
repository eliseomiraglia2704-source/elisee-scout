# -*- coding: utf-8 -*-
"""Genera data/squadre/catalog.json — piramide completa A→Terza Categoria."""
from __future__ import annotations
import json, re, hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data" / "squadre" / "catalog.json"
LOGO_DIR = ROOT / "immagini" / "squadre-loghi"
KITS_DIR = ROOT / "immagini" / "kits-2d"
LOGO_DIR.mkdir(parents=True, exist_ok=True)
OUT.parent.mkdir(parents=True, exist_ok=True)

def slug(s: str) -> str:
    s = s.lower().strip()
    s = (s.replace("à","a").replace("è","e").replace("é","e").replace("ì","i")
           .replace("ò","o").replace("ù","u").replace("'"," ").replace("."," "))
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:48] or "team"

def abbr(name: str) -> str:
    words = [w for w in re.split(r"\s+", name.upper()) if w and w not in ("FC","AS","US","SSD","ASD","AC","SC","CALCIO","CLUB","SPORTING")]
    if not words:
        return name[:3].upper()
    if len(words) == 1:
        return words[0][:3]
    return ("".join(w[0] for w in words[:3]))[:3]

def colors(seed: str):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:6], 16)
    r, g, b = (h >> 16) & 255, (h >> 8) & 255, h & 255
    # keep readable
    r = 40 + r % 180
    g = 40 + g % 180
    b = 40 + b % 180
    primary = f"#{r:02x}{g:02x}{b:02x}"
    secondary = f"#{(255-r):02x}{(255-g):02x}{(255-b):02x}"
    return primary, secondary

def kit_pair(primary, secondary):
    return {
        "home": {"body": primary, "sleeve": primary},
        "away": {"body": secondary, "sleeve": primary},
    }

def logo_path(sid: str) -> str | None:
    p = LOGO_DIR / f"{sid}.png"
    if p.exists() and p.stat().st_size > 500:
        return f"immagini/squadre-loghi/{sid}.png"
    return None

def make_team(name, league, city, gender="m", pos=None, pts=None, played=None, year="1920", logo_id=None, primary=None, secondary=None):
    sid = logo_id or slug(name)
    p, s = colors(sid) if not primary else (primary, secondary or "#ffffff")
    kits = kit_pair(p, s)
    pos = pos if pos is not None else 1
    pts = pts if pts is not None else max(0, 60 - pos * 2)
    played = played if played is not None else 20
    logo = logo_path(sid)
    return {
        "id": sid,
        "name": name.upper(),
        "country": "ITALIA",
        "league": league,
        "city": city.upper(),
        "year": str(year),
        "abbr": abbr(name),
        "gender": gender,
        "pos": pos,
        "pts": pts,
        "played": played,
        "logo": logo,
        "primary": p,
        "secondary": s,
        "accent": "#ffffff",
        "home": kits["home"],
        "away": kits["away"],
    }

# ---------- PRO: Serie A 2025/26 (Gazzetta) ----------
SERIE_A = [
    ("Napoli", "NAPOLI", "1926", "#12a0d7", "#ffffff"),
    ("Inter", "MILANO", "1908", "#010E80", "#000000"),
    ("Atalanta", "BERGAMO", "1907", "#1d3557", "#000000"),
    ("Juventus", "TORINO", "1897", "#111111", "#ffffff"),
    ("Roma", "ROMA", "1927", "#8B0000", "#f5f0e6"),
    ("Fiorentina", "FIRENZE", "1926", "#4824d6", "#ffffff"),
    ("Lazio", "ROMA", "1900", "#87CEEB", "#ffffff"),
    ("Milan", "MILANO", "1899", "#FB090B", "#000000"),
    ("Bologna", "BOLOGNA", "1909", "#A52A2A", "#003366"),
    ("Como", "COMO", "1907", "#003399", "#ffffff"),
    ("Torino", "TORINO", "1906", "#8B0000", "#ffffff"),
    ("Udinese", "UDINE", "1896", "#000000", "#ffffff"),
    ("Genoa", "GENOVA", "1893", "#CC0000", "#003366"),
    ("Hellas Verona", "VERONA", "1903", "#FFD700", "#003399"),
    ("Cagliari", "CAGLIARI", "1920", "#A52A2A", "#003399"),
    ("Parma", "PARMA", "1913", "#1a3c8b", "#ffd200"),
    ("Lecce", "LECCE", "1908", "#ffd200", "#c41e3a"),
    ("Sassuolo", "SASSUOLO", "1920", "#00A651", "#000000"),
    ("Pisa", "PISA", "1909", "#0a1a3a", "#1e90ff"),
    ("Cremonese", "CREMONA", "1903", "#C8102E", "#808080"),
]

# Serie B 2025/26 (post promozioni: senza Sassuolo, Pisa, Cremonese; + retrocesse + promozioni C)
SERIE_B = [
    ("Palermo", "PALERMO", "1900", "#e6007e", "#000000"),
    ("Bari", "BARI", "1908", "#ffffff", "#c8102e"),
    ("Spezia", "LA SPEZIA", "1906", "#000000", "#ffffff"),
    ("Catanzaro", "CATANZARO", "1929", "#ffcc00", "#c41e3a"),
    ("Cesena", "CESENA", "1940", "#000000", "#ffffff"),
    ("Modena", "MODENA", "1912", "#FFD700", "#003399"),
    ("Sampdoria", "GENOVA", "1946", "#003399", "#C8102E"),
    ("Cittadella", "CITTADELLA", "1973", "#8B0000", "#003399"),
    ("Brescia", "BRESCIA", "1911", "#003399", "#ffffff"),
    ("Südtirol", "BOLZANO", "1974", "#C8102E", "#ffffff"),
    ("Reggiana", "REGGIO EMILIA", "1919", "#8B0000", "#ffffff"),
    ("Juve Stabia", "CASTELLAMMARE", "1907", "#FFD700", "#003399"),
    ("Carrarese", "CARRARA", "1908", "#003399", "#ffffff"),
    ("Mantova", "MANTOVA", "1911", "#C8102E", "#ffffff"),
    ("Frosinone", "FROSINONE", "1906", "#FFD700", "#003399"),
    ("Salernitana", "SALERNO", "1919", "#8B0000", "#ffffff"),
    ("Empoli", "EMPOLI", "1920", "#003399", "#ffffff"),
    ("Venezia", "VENEZIA", "1907", "#FF6600", "#009933"),
    ("Monza", "MONZA", "1912", "#C8102E", "#ffffff"),
    ("Padova", "PADOVA", "1910", "#C8102E", "#ffffff"),
]

# Serie C ~20 per girone (organico tipo 2025/26)
SERIE_C_A = [
    "Vicenza","Atalanta U23","Pro Vercelli","Albinoleffe","Trento","Renate",
    "Lumezzane","Giana Erminio","Novara","Pro Patria","Pergolettese","Arzignano",
    "Triestina","Lecco","Calcio Padova","Union Clodiense","Alcione Milano","Virtus Verona",
    "Caldenzano","Ospitaletto",
]
# fix realistic C A
SERIE_C_A = [
    "Vicenza","Atalanta U23","Pro Vercelli","AlbinoLeffe","Trento","Renate",
    "Lumezzane","Giana Erminio","Novara","Pro Patria","Pergolettese","Arzignano Valchiampo",
    "Triestina","Lecco","Union Clodiense Chioggia","Alcione","Virtus Verona",
    "Pro Sesto","Feralpisalò","Caldiero Terme",
]
SERIE_C_B = [
    "Pescara","Ternana","Entella","Arezzo","Torres","Rimini","Pontedera","Lucchese",
    "Vis Pesaro","Carpi","Campobasso","Ascoli","Gubbio","Pianese","Sestri Levante",
    "Legnago","Perugia","SPAL","Milan Futuro","Juventus Next Gen",
]
SERIE_C_C = [
    "Benevento","Avellino","Audace Cerignola","Crotone","Potenza","Foggia","Taranto",
    "Casertana","Latina","Monopoli","Giugliano","Team Altamura","Cavese","Sorrento",
    "Turris","Messina","Trapani","Picerno","Cosenza","Catania",
]

# Serie D — 9 gironi × 18 (nomi tipici organici recenti / aree)
SERIE_D = {
    "A": ["Bra","Chisola","Citta di Varese","Derthona","Fossano","Gozzano","Imperia","Lavagnese",
          "Ligorna","PDHAE","Sanremese","Savona","Sestri Levante","Vado","Valenzana","Asti","Casale","Borgosesia"],
    "B": ["Brusaporto","Castellanzese","Ciliverghe","Crema","Desenzano","Folgore Caratese",
          "Legnano","Lentigione","Maggiorà","Pavia","Ponte San Pietro","Pro Palazzolo","Sangiuliano City",
          "Sondrio","Tritium","Varesina","Villa Valle","Club Milano"],
    "C": ["Bassano","Calvi Noale","Campodarsego","Cjarlins Muzane","Dolomiti Bellunesi","Este",
          "Luparense","Mestre","Montecchio Maggiore","Portogruaro","Real Vicenza","Treviso",
          "Union Feltre","Adriese","Clodiense","Montecchio","Villafranca","Chions"],
    "D": ["Carpi","Correggese","Fiorenzuola","Forlì","Imolese","Lentigione","Mezzolara",
          "Pianese","Pistoiese","Prato","Ravenna","Sammaurese","Sangiovannese","Tau Altopascio",
          "United Riccione","Victor San Marino","Corticella","Sasso Marconi"],
    "E": ["Arezzo","Grosseto","Livorno","Poggibonsi","San Donato Tavarnelle","Siena","Tuttocuoio",
          "Figline","Gavorrano","Orvietana","Seravezza","Sporting Trestina","Terranuova Traiana",
          "Follonica Gavorrano","Montevarchi","Pianese","Sangiovannese","Ghiviborgo"],
    "F": ["Ancona","Ascoli","Avezzano","Chieti","Fermana","L'Aquila","Maceratese","Recanatese",
          "Sambenedettese","Teramo","Termoli","Vigor Senigallia","Castelfidardo","Atletico Ascoli",
          "United Riccione","Sora","Ostia Mare","Notaresco"],
    "G": ["Cassino","Cynthialbalonga","Flaminia","Gelbison","Latina","Monterosi","Ostia Mare",
          "Pomezia","Sora","Trastevere","Viterbese","Atletico Lodigiani","Real Monterotondo",
          "Anzio","Nocerina","Afragolese","Casertana","Savoia"],
    "H": ["Audace Cerignola","Barletta","Brindisi","Fasano","Fidelis Andria","Gravina","Manfredonia",
          "Martina","Matera","Nardò","Nocerina","Paganese","Bitonto","Casarano","Ugento",
          "Ischia","Heraclea","Francavilla"],
    "I": ["Acireale","Akragas","Enna","Igea Virtus","Licata","Messina","Nissa","Paternò",
          "Ragusa","Reggina","Siracusa","Sancataldese","Scafatese","Vibonese","Troina",
          "Locri","Castrovillari","Sambiase"],
}

# Regional town banks for dilettanti generation
TOWNS = {
    "lombardia": ["Monza","Bergamo","Brescia","Como","Varese","Pavia","Cremona","Mantova","Lodi","Lecco","Sondrio","Sesto","Legnano","Rho","Cinisello","Desio","Cantù","Treviglio","Seriate","Ghedi","Chiari","Orzinuovi","Segrate","Cologno","Bollate"],
    "piemonte": ["Torino","Novara","Alessandria","Asti","Cuneo","Vercelli","Biella","Verbania","Ivrea","Chieri","Moncalieri","Rivoli","Settimo","Pinerolo","Casale","Bra","Fossano","Savigliano","Alba","Saluzzo","Chivasso","Carmagnola"],
    "veneto": ["Venezia","Verona","Padova","Vicenza","Treviso","Rovigo","Belluno","Mestre","Bassano","Schio","Thiene","Castelfranco","Montebelluna","Conegliano","Portogruaro","Chioggia","Legnago","Este","Cittadella","Mirano"],
    "fvg": ["Trieste","Udine","Pordenone","Gorizia","Monfalcone","Codroipo","Cividale","Gemona","Tolmezzo","Latisana","Sacile","Maniago","Spilimbergo"],
    "trentino": ["Trento","Bolzano","Rovereto","Merano","Bressanone","Riva","Pergine","Arco","Lavis","Mezzocorona","Brunico"],
    "liguria": ["Genova","La Spezia","Savona","Imperia","Sanremo","Chiavari","Rapallo","Sestri","Albenga","Ventimiglia","Sarzana","Lavagna"],
    "emilia": ["Bologna","Parma","Modena","Reggio Emilia","Ravenna","Ferrara","Rimini","Forlì","Piacenza","Cesena","Imola","Carpi","Faenza","Sassuolo","Riccione","Cattolica"],
    "toscana": ["Firenze","Pisa","Livorno","Siena","Arezzo","Prato","Lucca","Pistoia","Grosseto","Massa","Carrara","Viareggio","Empoli","Pontedera","Montecatini","Pescia"],
    "marche": ["Ancona","Pesaro","Urbino","Macerata","Fermo","Ascoli","Civitanova","Jesi","Fano","Senigallia","Recanati","Tolentino","San Benedetto"],
    "umbria": ["Perugia","Terni","Foligno","Spoleto","Città di Castello","Assisi","Orvieto","Gubbio","Narni","Todi"],
    "lazio": ["Roma","Latina","Frosinone","Viterbo","Rieti","Guidonia","Tivoli","Civitavecchia","Anzio","Nettuno","Formia","Cassino","Terracina","Pomezia","Aprilia"],
    "abruzzo": ["L'Aquila","Pescara","Chieti","Teramo","Avezzano","Lanciano","Vasto","Sulmona","Giulianova","Ortona","Francavilla","Roseto"],
    "molise": ["Campobasso","Isernia","Termoli","Venafro","Bojano","Larino","Agnone","Guglionesi"],
    "campania": ["Napoli","Salerno","Caserta","Avellino","Benevento","Torre del Greco","Pozzuoli","Afragola","Nocera","Scafati","Castellammare","Sorrento","Nola","Aversa","Portici"],
    "puglia": ["Bari","Taranto","Lecce","Foggia","Brindisi","Andria","Barletta","Trani","Molfetta","Bitonto","Monopoli","Martina Franca","Fasano","Nardò","Gallipoli","Manfredonia","Cerignola","Gravina"],
    "basilicata": ["Potenza","Matera","Melfi","Pisticci","Policoro","Rionero","Lavello","Irsina","Bernalda"],
    "calabria": ["Reggio Calabria","Catanzaro","Cosenza","Crotone","Lamezia","Vibo","Rossano","Castrovillari","Paola","Siderno","Locri","Palmi"],
    "sicilia": ["Palermo","Catania","Messina","Siracusa","Trapani","Agrigento","Ragusa","Gela","Marsala","Modica","Acireale","Enna","Caltanissetta","Paternò"],
    "sardegna": ["Cagliari","Sassari","Olbia","Alghero","Nuoro","Oristano","Carbonia","Iglesias","Quartu","Selargius","Porto Torres"],
}

PREFIX = ["ASD", "US", "FC", "Pol.", "Virtus", "Real", "Atletico", "Unione", "Pro", "Sporting", "Città di", "Calcio"]

def region_key_from_girone(title: str, girone_id: str) -> str:
    t = (title + " " + girone_id).lower()
    mapping = [
        ("lombardia", "lombardia"), ("piemonte", "piemonte"), ("veneto", "veneto"),
        ("friuli", "fvg"), ("fvg", "fvg"), ("trentino", "trentino"), ("liguria", "liguria"),
        ("emilia", "emilia"), ("toscana", "toscana"), ("marche", "marche"), ("umbria", "umbria"),
        ("lazio", "lazio"), ("abruzzo", "abruzzo"), ("molise", "molise"), ("campania", "campania"),
        ("puglia", "puglia"), ("basilicata", "basilicata"), ("calabria", "calabria"),
        ("sicilia", "sicilia"), ("sardegna", "sardegna"), ("bari", "puglia"), ("brindisi", "puglia"),
        ("foggia", "puglia"), ("lecce", "puglia"), ("maglie", "puglia"), ("taranto", "puglia"),
        ("trani", "puglia"), ("bat", "puglia"),
    ]
    for k, v in mapping:
        if k in t:
            return v
    return "lombardia"

def generate_girone_teams(league_label: str, girone_title: str, girone_id: str, n: int, gender="m"):
    rk = region_key_from_girone(girone_title, girone_id)
    towns = TOWNS.get(rk, TOWNS["lombardia"])
    teams = []
    for i in range(n):
        town = towns[i % len(towns)]
        pref = PREFIX[(i * 3 + len(girone_id)) % len(PREFIX)]
        # avoid pure "Città di X" always
        if pref == "Città di":
            name = f"Città di {town}"
        elif pref in ("Virtus", "Real", "Atletico", "Pro", "Sporting", "Unione"):
            name = f"{pref} {town}"
        elif pref == "Pol.":
            name = f"Polisportiva {town}"
        else:
            name = f"{pref} {town}"
        # unique per girone
        sid = slug(f"{league_label}-{girone_id}-{name}-{i}")
        city = town
        t = make_team(name, league_label, city, gender=gender, pos=i + 1, pts=max(0, 50 - i * 2), played=18 if "TERZA" not in league_label else 14, year=str(1900 + (i * 7) % 100), logo_id=sid)
        teams.append(t)
    return teams

# Parse GIRONI from campionati-agents.js
agents_js = (ROOT / "campionati-agents.js").read_text(encoding="utf-8")
# extract objects for dilettanti categories we care about
wanted = {"serie-d", "eccellenza", "promozione", "prima-cat", "seconda-cat", "terza-cat", "serie-a", "serie-b", "serie-c", "femminile"}
gironi = []
for m in re.finditer(r"\{\s*campionatoId:\s*'([^']+)'\s*,\s*campionato:\s*'([^']*)'\s*,\s*gironeId:\s*'([^']+)'\s*,\s*title:\s*'([^']*)'", agents_js):
    cid, camp, gid, title = m.group(1), m.group(2), m.group(3), m.group(4)
    if cid in wanted:
        gironi.append({"campionatoId": cid, "campionato": camp, "gironeId": gid, "title": title})

teams = []
order_leagues = []

def add_league_order(label):
    if label not in order_leagues:
        order_leagues.append(label)

# --- Serie A ---
for i, (name, city, year, p, s) in enumerate(SERIE_A, 1):
    t = make_team(name, "SERIE A", city, pos=i, pts=max(5, 70 - i * 2), played=28, year=year, logo_id=slug(name), primary=p, secondary=s)
    # custom kits for striped teams already simple solid
    if name == "Juventus":
        t["home"] = {"body": "linear-gradient(90deg,#111 0 14%,#fff 14% 28%,#111 28% 42%,#fff 42% 56%,#111 56% 70%,#fff 70% 84%,#111 84%)", "sleeve": "#111"}
    if name == "Inter":
        t["home"] = {"body": "linear-gradient(90deg,#010E80 0 20%,#000 20% 40%,#010E80 40% 60%,#000 60% 80%,#010E80 80%)", "sleeve": "#010E80"}
    if name == "Pisa":
        t["home"] = {"body": "linear-gradient(90deg,#0b1d4a 0 14%,#1e90ff 14% 28%,#0b1d4a 28% 42%,#1e90ff 42% 56%,#0b1d4a 56% 70%,#1e90ff 70% 84%,#0b1d4a 84%)", "sleeve": "#0b1d4a"}
    teams.append(t)
add_league_order("SERIE A")

# --- Serie B ---
for i, (name, city, year, p, s) in enumerate(SERIE_B, 1):
    teams.append(make_team(name, "SERIE B", city, pos=i, pts=max(5, 65 - i * 2), played=30, year=year, logo_id=slug(name), primary=p, secondary=s))
add_league_order("SERIE B")

# --- Serie C ---
for label, names, cities_hint in [
    ("SERIE C · GIRONE A", SERIE_C_A, "NORD"),
    ("SERIE C · GIRONE B", SERIE_C_B, "CENTRO"),
    ("SERIE C · GIRONE C", SERIE_C_C, "SUD"),
]:
    for i, name in enumerate(names[:20], 1):
        city = name.split()[0]
        teams.append(make_team(name, label, city, pos=i, pts=max(5, 58 - i * 2), played=32, year="1920", logo_id=slug(name)))
    add_league_order(label)

# --- Serie D real-ish lists ---
for g, names in SERIE_D.items():
    label = f"SERIE D · GIRONE {g}"
    for i, name in enumerate(names[:18], 1):
        teams.append(make_team(name, label, name.split()[0], pos=i, pts=max(3, 50 - i * 2), played=28, year="1925", logo_id=slug(f"sd-{g}-{name}")))
    add_league_order(label)

# --- Eccellenza / Promozione / Prima / Seconda / Terza from gironi ---
SIZES = {
    "eccellenza": 16,
    "promozione": 16,
    "prima-cat": 14,
    "seconda-cat": 14,
    "terza-cat": 12,
}
LABELS = {
    "eccellenza": "ECCELLENZA",
    "promozione": "PROMOZIONE",
    "prima-cat": "PRIMA CATEGORIA",
    "seconda-cat": "SECONDA CATEGORIA",
    "terza-cat": "TERZA CATEGORIA",
}

for g in gironi:
    cid = g["campionatoId"]
    if cid not in SIZES:
        continue
    base = LABELS[cid]
    title = g["title"]
    # league label includes region/girone for navigation
    league = f"{base} · {title.upper()}"
    n = SIZES[cid]
    if cid == "eccellenza" and "puglia" in g["gironeId"]:
        n = 18
    teams.extend(generate_girone_teams(league, title, g["gironeId"], n))
    add_league_order(league)

# --- Femminile (gender f) ---
for i, (name, city) in enumerate([
    ("Juventus Women", "TORINO"), ("Roma Women", "ROMA"), ("Inter Women", "MILANO"),
    ("Fiorentina Women", "FIRENZE"), ("Milan Women", "MILANO"), ("Sassuolo Women", "SASSUOLO"),
    ("Lazio Women", "ROMA"), ("Napoli Women", "NAPOLI"), ("Como Women", "COMO"),
    ("Sampdoria Women", "GENOVA"), ("Pomigliano Women", "POMIGLIANO"), ("Parma Women", "PARMA"),
], 1):
    t = make_team(name, "SERIE A FEMMINILE", city, gender="f", pos=i, pts=max(5, 40 - i * 2), played=18, year="2017", logo_id=slug(name.replace(" Women","")))
    teams.append(t)
add_league_order("SERIE A FEMMINILE")

for i, name in enumerate([
    "Bologna Women","Cagliari Women","Ternana Women","Arezzo Women","Chievo Women",
    "Lumezzane Women","Verona Women","Brescia Women","Pink Bari","San Marino Women",
    "Tavagnacco","Res Roma","Cesena Women","Freedom FC",
], 1):
    teams.append(make_team(name, "SERIE B FEMMINILE", name.split()[0], gender="f", pos=i, pts=max(3, 35 - i * 2), played=16, year="2015"))
add_league_order("SERIE B FEMMINILE")

# Deduplicate ids
seen = set()
uniq = []
for t in teams:
    base = t["id"]
    if base in seen:
        t["id"] = base + "-" + hashlib.md5(t["league"].encode()).hexdigest()[:4]
    seen.add(t["id"])
    uniq.append(t)

catalog = {
    "version": 1,
    "season": "2025/26–2026/27",
    "updatedAt": "2026-08-06",
    "leagueOrder": order_leagues,
    "teams": uniq,
    "stats": {
        "total": len(uniq),
        "leagues": len(order_leagues),
        "byGender": {
            "m": sum(1 for t in uniq if t["gender"] == "m"),
            "f": sum(1 for t in uniq if t["gender"] == "f"),
        },
    },
}

OUT.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("teams", len(uniq), "leagues", len(order_leagues), "bytes", OUT.stat().st_size)
print("sample leagues:", order_leagues[:12])
print("last leagues:", order_leagues[-5:])
# counts by prefix
from collections import Counter
c = Counter()
for t in uniq:
    top = t["league"].split("·")[0].strip()
    c[top] += 1
for k, v in c.most_common():
    print(f"  {k}: {v}")