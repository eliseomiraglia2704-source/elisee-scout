# -*- coding: utf-8 -*-
"""Arricchisce catalogo con citta/stadio/capienza da Wikipedia (it)."""
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
CAT = ROOT / "data" / "squadre" / "catalog.json"
CACHE = ROOT / "data" / "squadre" / "wiki_venues_cache.json"
REPORT = ROOT / "data" / "squadre" / "wiki_venues_report.json"
CTX = ssl.create_default_context()
UA = {"User-Agent": "EliseeScout/1.0 (local research; stadium city capacity from Wikipedia)"}

# Override affidabili (Wikipedia it / pagine stadi). Chiave = name.upper() del catalogo.
MANUAL = {
    # Serie A
    # Capienze da infobox it.wikipedia (pagine club)
    "INTER": {"city": "Milano", "stadium": "Stadio Giuseppe Meazza", "capacity": 75923},
    "MILAN": {"city": "Milano", "stadium": "Stadio Giuseppe Meazza", "capacity": 75817},
    "JUVENTUS": {"city": "Torino", "stadium": "Allianz Stadium", "capacity": 41660},
    "NAPOLI": {"city": "Napoli", "stadium": "Stadio Diego Armando Maradona", "capacity": 54726},
    "ROMA": {"city": "Roma", "stadium": "Stadio Olimpico", "capacity": 70634},
    "LAZIO": {"city": "Roma", "stadium": "Stadio Olimpico", "capacity": 70634},
    "ATALANTA": {"city": "Bergamo", "stadium": "Gewiss Stadium", "capacity": 23439},
    "FIORENTINA": {"city": "Firenze", "stadium": "Stadio Artemio Franchi", "capacity": 43147},
    "BOLOGNA": {"city": "Bologna", "stadium": "Stadio Renato Dall'Ara", "capacity": 36532},
    "TORINO": {"city": "Torino", "stadium": "Stadio Olimpico Grande Torino", "capacity": 28177},
    "GENOA": {"city": "Genova", "stadium": "Stadio Luigi Ferraris", "capacity": 33205},
    "UDINESE": {"city": "Udine", "stadium": "Bluenergy Stadium", "capacity": 25144},
    "CAGLIARI": {"city": "Cagliari", "stadium": "Unipol Domus", "capacity": 16416},
    "LECCE": {"city": "Lecce", "stadium": "Stadio Via del Mare", "capacity": 31533},
    "PARMA": {"city": "Parma", "stadium": "Stadio Ennio Tardini", "capacity": 22352},
    "COMO": {"city": "Como", "stadium": "Stadio Giuseppe Sinigaglia", "capacity": 13602},
    "SASSUOLO": {"city": "Reggio Emilia", "stadium": "Mapei Stadium - Citta del Tricolore", "capacity": 21525},
    "VENEZIA": {"city": "Venezia", "stadium": "Stadio Pier Luigi Penzo", "capacity": 11150},
    "FROSINONE": {"city": "Frosinone", "stadium": "Stadio Benito Stirpe", "capacity": 16227},
    "MONZA": {"city": "Monza", "stadium": "U-Power Stadium", "capacity": 17319},
    "CREMONESE": {"city": "Cremona", "stadium": "Stadio Giovanni Zini", "capacity": 16003},
    "PISA": {"city": "Pisa", "stadium": "Arena Garibaldi - Romeo Anconetani", "capacity": 12508},
    "VERONA": {"city": "Verona", "stadium": "Stadio Marcantonio Bentegodi", "capacity": 39211},
    # Serie B
    "PALERMO": {"city": "Palermo", "stadium": "Stadio Renzo Barbera", "capacity": 36365},
    "SAMPDORIA": {"city": "Genova", "stadium": "Stadio Luigi Ferraris", "capacity": 33205},
    "EMPOLI": {"city": "Empoli", "stadium": "Stadio Carlo Castellani", "capacity": 16284},
    "SPEZIA": {"city": "La Spezia", "stadium": "Stadio Alberto Picco", "capacity": 11466},
    "CATANZARO": {"city": "Catanzaro", "stadium": "Stadio Nicola Ceravolo", "capacity": 14650},
    "CESENA": {"city": "Cesena", "stadium": "Orogel Stadium - Dino Manuzzi", "capacity": 20194},
    "MODENA": {"city": "Modena", "stadium": "Stadio Alberto Braglia", "capacity": 21092},
    "PADOVA": {"city": "Padova", "stadium": "Stadio Euganeo", "capacity": 32420},
    "REGGIANA": {"city": "Reggio Emilia", "stadium": "Mapei Stadium - Citta del Tricolore", "capacity": 21525},
    "SÜDTIROL": {"city": "Bolzano", "stadium": "Stadio Druso", "capacity": 5500},
    "SUDTIROL": {"city": "Bolzano", "stadium": "Stadio Druso", "capacity": 5500},
    "ENTELLA": {"city": "Chiavari", "stadium": "Stadio Comunale di Chiavari", "capacity": 5535},
    "L.R. VICENZA": {"city": "Vicenza", "stadium": "Stadio Romeo Menti", "capacity": 12000},
    "JUVE STABIA": {"city": "Castellammare di Stabia", "stadium": "Stadio Romeo Menti", "capacity": 7620},
    "MANTOVA": {"city": "Mantova", "stadium": "Stadio Danilo Martelli", "capacity": 14884},
    "CARRARESE": {"city": "Carrara", "stadium": "Stadio dei Marmi", "capacity": 3500},
    "AREZZO": {"city": "Arezzo", "stadium": "Stadio Citta di Arezzo", "capacity": 13128},
    "ASCOLI": {"city": "Ascoli Piceno", "stadium": "Stadio Cino e Lillo Del Duca", "capacity": 20460},
    "BENEVENTO": {"city": "Benevento", "stadium": "Stadio Ciro Vigorito", "capacity": 16867},
    "AVELLINO": {"city": "Avellino", "stadium": "Stadio Partenio-Adriano Lombardi", "capacity": 26308},
    # Serie C note
    "BARI": {"city": "Bari", "stadium": "Stadio San Nicola", "capacity": 58270},
    "SALERNITANA": {"city": "Salerno", "stadium": "Stadio Arechi", "capacity": 37180},
    "CATANIA": {"city": "Catania", "stadium": "Stadio Angelo Massimino", "capacity": 20266},
    "CROTONE": {"city": "Crotone", "stadium": "Stadio Ezio Scida", "capacity": 16640},
    "COSENZA": {"city": "Cosenza", "stadium": "Stadio San Vito-Gigi Marulla", "capacity": 20987},
    "FOGGIA": {"city": "Foggia", "stadium": "Stadio Pino Zaccheria", "capacity": 25085},
    "PESCARA": {"city": "Pescara", "stadium": "Stadio Adriatico - Giovanni Cornacchia", "capacity": 20476},
    "PERUGIA": {"city": "Perugia", "stadium": "Stadio Renato Curi", "capacity": 23625},
    "TERNANA": {"city": "Terni", "stadium": "Stadio Libero Liberati", "capacity": 22000},
    "CITTADELLA": {"city": "Cittadella", "stadium": "Stadio Pier Cesare Tombolato", "capacity": 7623},
    "BRESCIA": {"city": "Brescia", "stadium": "Stadio Mario Rigamonti", "capacity": 19500},
    "LECCO": {"city": "Lecco", "stadium": "Stadio Rigamonti-Ceppi", "capacity": 4997},
    "ALBINOLEFFE": {"city": "Zanica", "stadium": "AlbinoLeffe Stadium", "capacity": 1791},
    "NOVARA": {"city": "Novara", "stadium": "Stadio Silvio Piola", "capacity": 17875},
    "PRO VERCELLI": {"city": "Vercelli", "stadium": "Stadio Silvio Piola", "capacity": 5500},
    "AUDACE CERIGNOLA": {"city": "Cerignola", "stadium": "Stadio Domenico Monterisi", "capacity": 8000},
    "REGGINA": {"city": "Reggio Calabria", "stadium": "Stadio Oreste Granillo", "capacity": 27543},
    "SIENA": {"city": "Siena", "stadium": "Stadio Artemio Franchi", "capacity": 15373},
    "CHIEVO": {"city": "Verona", "stadium": "Stadio Marcantonio Bentegodi", "capacity": 39211},
    "JUVENTUS U23": {"city": "Torino", "stadium": "Juventus Training Center", "capacity": 4000},
    "ATALANTA U23": {"city": "Bergamo", "stadium": "Centro Sportivo Bortolotti", "capacity": 1500},
    "INTER U23": {"city": "Sesto San Giovanni", "stadium": "Stadio Ernesto Breda", "capacity": 3500},
    "MILAN U23": {"city": "Milano", "stadium": "Centro Sportivo Vismara", "capacity": 1200},
    "CARPI": {"city": "Carpi", "stadium": "Stadio Sandro Cabassi", "capacity": 5510},
    "GIANA ERMINIO": {"city": "Gorgonzola", "stadium": "Stadio Città di Gorgonzola", "capacity": 3766},
    "LUMEZZANE": {"city": "Lumezzane", "stadium": "Stadio Tullio Saleri", "capacity": 4150},
    "RENATE": {"city": "Meda", "stadium": "Stadio Città di Meda", "capacity": 3000},
    "TRENTO": {"city": "Trento", "stadium": "Stadio Briamasco", "capacity": 4227},
    "TREVISO": {"city": "Treviso", "stadium": "Stadio Omobono Tenni", "capacity": 10000},
    "PERGOLETTESE": {"city": "Crema", "stadium": "Stadio Giuseppe Voltini", "capacity": 4095},
    "ARZIGNANO": {"city": "Arzignano", "stadium": "Stadio Tommaso Dal Molin", "capacity": 1500},
    "ALCIONE MILANO": {"city": "Milano", "stadium": "Arena Civica Gianni Brera", "capacity": 10000},
    "CAMPOBASSO": {"city": "Campobasso", "stadium": "Stadio Nuovo Romagnoli", "capacity": 21800},
    "GUBBIO": {"city": "Gubbio", "stadium": "Stadio Pietro Barbetti", "capacity": 5300},
    "LATINA": {"city": "Latina", "stadium": "Stadio Domenico Francioni", "capacity": 8000},
    "LIVORNO": {"city": "Livorno", "stadium": "Stadio Armando Picchi", "capacity": 19238},
    "PINETO": {"city": "Pineto", "stadium": "Stadio Mimmo Pavone", "capacity": 5000},
    "RAVENNA": {"city": "Ravenna", "stadium": "Stadio Bruno Benelli", "capacity": 12020},
    "SAMBENEDETTESE": {"city": "San Benedetto del Tronto", "stadium": "Stadio Riviera delle Palme", "capacity": 13650},
    "TORRES": {"city": "Sassari", "stadium": "Stadio Vanni Sanna", "capacity": 7480},
    "VIS PESARO": {"city": "Pesaro", "stadium": "Stadio Tonino Benelli", "capacity": 4898},
    "POTENZA": {"city": "Potenza", "stadium": "Stadio Alfredo Viviani", "capacity": 6000},
    "MONOPOLI": {"city": "Monopoli", "stadium": "Stadio Vito Simone Veneziani", "capacity": 6880},
    "CASERTANA": {"city": "Caserta", "stadium": "Stadio Alberto Pinto", "capacity": 12000},
    "CAVESE": {"city": "Cava de' Tirreni", "stadium": "Stadio Simonetta Lamberti", "capacity": 15200},
    "GIUGLIANO": {"city": "Giugliano in Campania", "stadium": "Stadio Alberto De Cristofaro", "capacity": 6044},
    "SORRENTO": {"city": "Sorrento", "stadium": "Stadio Italia", "capacity": 3600},
    "PICERNO": {"city": "Picerno", "stadium": "Stadio Donato Curcio", "capacity": 2000},
    "ALTAMURA": {"city": "Altamura", "stadium": "Stadio Tonino D'Angelo", "capacity": 800},
    "SAVOIA": {"city": "Torre Annunziata", "stadium": "Stadio Giraud", "capacity": 10750},
    "SCAFATESE": {"city": "Scafati", "stadium": "Stadio Comunale di Scafati", "capacity": 1500},
    "CASARANO": {"city": "Casarano", "stadium": "Stadio Giuseppe Capozza", "capacity": 6500},
    "BARLETTA": {"city": "Barletta", "stadium": "Stadio Cosimo Puttilli", "capacity": 7500},
    "GROSSETO": {"city": "Grosseto", "stadium": "Stadio Carlo Zecchini", "capacity": 9979},
    "FORLÌ": {"city": "Forli", "stadium": "Stadio Tullo Morgagni", "capacity": 3505},
    "FORLI": {"city": "Forli", "stadium": "Stadio Tullo Morgagni", "capacity": 3505},
    "PIANESE": {"city": "Piancastagnaio", "stadium": "Stadio Comunale di Piancastagnaio", "capacity": 1500},
    "GUIDONIA": {"city": "Guidonia Montecelio", "stadium": "Stadio Comunale di Guidonia", "capacity": 2000},
    "OSTIAMARE": {"city": "Ostia", "stadium": "Stadio Anco Marzio", "capacity": 1000},
    "VADO": {"city": "Vado Ligure", "stadium": "Stadio Ferruccio Chittolina", "capacity": 2000},
    "DESENZANO": {"city": "Desenzano del Garda", "stadium": "Stadio Tre Stelle", "capacity": 1500},
    "DOLOMITI BELLUNESI": {"city": "Belluno", "stadium": "Stadio Comunale di Belluno", "capacity": 2500},
    "OSPITALETTO": {"city": "Ospitaletto", "stadium": "Stadio Comunale di Ospitaletto", "capacity": 2000},
    "FOLGORE CARATESE": {"city": "Carate Brianza", "stadium": "Stadio Comunale di Carate", "capacity": 1500},
    # Serie D / altri noti
    "REGGINA": {"city": "Reggio Calabria", "stadium": "Stadio Oreste Granillo", "capacity": 27543},
    "FIDELIS ANDRIA": {"city": "Andria", "stadium": "Stadio Degli Ulivi", "capacity": 9148},
    "VIRTUS FRANCAVILLA": {"city": "Francavilla Fontana", "stadium": "Stadio Giovanni Paolo II", "capacity": 3360},
    "NOCERINA": {"city": "Nocera Inferiore", "stadium": "Stadio San Francesco d'Assisi", "capacity": 7682},
    "OLBIA": {"city": "Olbia", "stadium": "Stadio Bruno Nespoli", "capacity": 4000},
    "PIACENZA": {"city": "Piacenza", "stadium": "Stadio Leonardo Garilli", "capacity": 21608},
    "PRO SESTO": {"city": "Sesto San Giovanni", "stadium": "Stadio Breda", "capacity": 3500},
    "ANCONA": {"city": "Ancona", "stadium": "Stadio del Conero", "capacity": 23983},
    "TERAMO": {"city": "Teramo", "stadium": "Stadio Gaetano Bonolis", "capacity": 7498},
    "RECANATESE": {"city": "Recanati", "stadium": "Stadio Nicola Tubaldi", "capacity": 3000},
    "PRATO": {"city": "Prato", "stadium": "Stadio Lungobisenzio", "capacity": 6750},
    "PISTOIESE": {"city": "Pistoia", "stadium": "Stadio Marcello Melani", "capacity": 13195},
    "LEGNAGO SALUS": {"city": "Legnago", "stadium": "Stadio Mario Sandrini", "capacity": 2152},
    "VARESE FC": {"city": "Varese", "stadium": "Stadio Franco Ossola", "capacity": 8213},
    "SESTRI LEVANTE": {"city": "Sestri Levante", "stadium": "Stadio Giuseppe Sivori", "capacity": 1500},
    "MANFREDONIA": {"city": "Manfredonia", "stadium": "Stadio Miramare", "capacity": 4080},
    "PAGANESE": {"city": "Pagani", "stadium": "Stadio Marcello Torre", "capacity": 5093},
    "ACR MESSINA": {"city": "Messina", "stadium": "Stadio San Filippo-Franco Scoglio", "capacity": 38722},
    "VIBONESE": {"city": "Vibo Valentia", "stadium": "Stadio Luigi Razza", "capacity": 6000},
    "GELBISON": {"city": "Vallo della Lucania", "stadium": "Stadio Giovanni Morra", "capacity": 2500},
    "L'AQUILA": {"city": "L'Aquila", "stadium": "Stadio Gran Sasso d'Italia-Italo Acconcia", "capacity": 6730},
    "GIULIANOVA": {"city": "Giulianova", "stadium": "Stadio Rubens Fadini", "capacity": 5625},
    "CHIETI": {"city": "Chieti", "stadium": "Stadio Guido Angelini", "capacity": 12919},
    "ISCHIA": {"city": "Ischia", "stadium": "Stadio Vincenzo Mazzella", "capacity": 5000},
    "TRASTEVERE CALCIO": {"city": "Roma", "stadium": "Stadio Vittorio Bachelet", "capacity": 1000},
    "LATTE DOLCE": {"city": "Sassari", "stadium": "Stadio Vanni Sanna", "capacity": 7480},
    "CASSINO": {"city": "Cassino", "stadium": "Stadio Gino Salveti", "capacity": 3681},
    "SANGIULIANO CITY": {"city": "San Giuliano Milanese", "stadium": "Stadio Breda", "capacity": 3500},
    "IMOLESE": {"city": "Imola", "stadium": "Stadio Romeo Galli", "capacity": 4000},
    "CREMA": {"city": "Crema", "stadium": "Stadio Giuseppe Voltini", "capacity": 4095},
    "BASSANO": {"city": "Bassano del Grappa", "stadium": "Stadio Rino Mercante", "capacity": 2952},
    "MESTRE": {"city": "Venezia", "stadium": "Stadio Francesco Baracca", "capacity": 2000},
    "GOZZANO": {"city": "Gozzano", "stadium": "Stadio Alfredo d'Albertas", "capacity": 1500},
    "DERTHONA FBC": {"city": "Tortona", "stadium": "Stadio Fausto Coppi", "capacity": 2500},
    "ASTI": {"city": "Asti", "stadium": "Stadio Comunale di Asti", "capacity": 2000},
    "AS BIELLESE": {"city": "Biella", "stadium": "Stadio La Marmora-Gagliardi", "capacity": 5000},
    "SANREMESE": {"city": "Sanremo", "stadium": "Stadio Comunale di Sanremo", "capacity": 4000},
    "IMPERIA": {"city": "Imperia", "stadium": "Stadio Nino Ciccione", "capacity": 3000},
    "PAVIA": {"city": "Pavia", "stadium": "Stadio Pietro Fortunati", "capacity": 4999},
    "A.C NARDÒ": {"city": "Nardo", "stadium": "Stadio Giovanni Paolo II", "capacity": 5000},
    "A.C NARDO": {"city": "Nardo", "stadium": "Stadio Giovanni Paolo II", "capacity": 5000},
    "SS NOLA 1925": {"city": "Nola", "stadium": "Stadio Sporting Club", "capacity": 2000},
    "CITTA DI FASANO": {"city": "Fasano", "stadium": "Stadio Vito Curlo", "capacity": 3200},
    "MARTINA CALCIO": {"city": "Martina Franca", "stadium": "Stadio Gian Domenico Tursi", "capacity": 4966},
    "REAL NORMANNA": {"city": "Bisceglie", "stadium": "Stadio Gustavo Ventura", "capacity": 4000},
    "HERACLEA": {"city": "Policoro", "stadium": "Stadio Comunale di Policoro", "capacity": 2000},
    "GRAVINA": {"city": "Gravina in Puglia", "stadium": "Stadio Stefano Vicino", "capacity": 2500},
    "USD RAGUSA": {"city": "Ragusa", "stadium": "Stadio Aldo Campo", "capacity": 3500},
    "GELA": {"city": "Gela", "stadium": "Stadio Vincenzo Presti", "capacity": 4200},
    "MILAZZO": {"city": "Milazzo", "stadium": "Stadio Marco Salmeri", "capacity": 2500},
    "ENNA": {"city": "Enna", "stadium": "Stadio Generale Gaeta", "capacity": 2000},
    "VIGOR LAMEZIA": {"city": "Lamezia Terme", "stadium": "Stadio Guido D'Ippolito", "capacity": 4000},
    "AS ACIREALE": {"city": "Acireale", "stadium": "Stadio Aci e Galatea", "capacity": 5000},
    "PATERNÒ": {"city": "Paterno", "stadium": "Stadio Comunale di Paterno", "capacity": 4000},
    "PATERNO": {"city": "Paterno", "stadium": "Stadio Comunale di Paterno", "capacity": 4000},
    "SAN MARINO CALCIO": {"city": "Serravalle", "stadium": "San Marino Stadium", "capacity": 6664},
    "MACERATESE": {"city": "Macerata", "stadium": "Stadio Helvia Recina", "capacity": 5830},
    "SORA": {"city": "Sora", "stadium": "Stadio Claudio Tomei", "capacity": 4000},
    "TERMOLI": {"city": "Termoli", "stadium": "Stadio Gino Cannarsa", "capacity": 3300},
    "VIGOR SENIGALLIA": {"city": "Senigallia", "stadium": "Stadio Comunale di Senigallia", "capacity": 3000},
    "CASTELFIDARDO": {"city": "Castelfidardo", "stadium": "Stadio Comunale di Castelfidardo", "capacity": 2000},
    "NOTARESCO CALCIO": {"city": "Notaresco", "stadium": "Stadio Comunale di Notaresco", "capacity": 1500},
    "FOSSOMBRONE": {"city": "Fossombrone", "stadium": "Stadio Comunale di Fossombrone", "capacity": 1500},
    "UNIPOMEZIA": {"city": "Pomezia", "stadium": "Stadio Comunale di Pomezia", "capacity": 2000},
    "SAMMAURESE": {"city": "San Mauro Pascoli", "stadium": "Stadio Comunale di San Mauro", "capacity": 1000},
    "ATLETICO ASCOLI": {"city": "Ascoli Piceno", "stadium": "Stadio Cino e Lillo Del Duca", "capacity": 20460},
    "MONTEVARCHI": {"city": "Montevarchi", "stadium": "Stadio Gastone Brilli Peri", "capacity": 7200},
    "FOLIGNO": {"city": "Foligno", "stadium": "Stadio Enzo Blasone", "capacity": 5650},
    "POGGIBONSI": {"city": "Poggibonsi", "stadium": "Stadio Stefano Lotti", "capacity": 2513},
    "ORVIETANA": {"city": "Orvieto", "stadium": "Stadio Luigi Muzi", "capacity": 2500},
    "SCANDICCI": {"city": "Scandicci", "stadium": "Stadio Turri", "capacity": 1800},
    "CANNARA": {"city": "Cannara", "stadium": "Stadio Comunale di Cannara", "capacity": 1000},
    "FOLLONICA GAVORRANO": {"city": "Gavorrano", "stadium": "Stadio Romeo Malservisi", "capacity": 2000},
    "GHIVIBORGO": {"city": "Gavorrano", "stadium": "Stadio Romeo Malservisi", "capacity": 2000},
    "SERAVEZZA POZZI": {"city": "Seravezza", "stadium": "Stadio Comunale di Seravezza", "capacity": 1500},
    "TAU": {"city": "Altopascio", "stadium": "Stadio Comunale di Altopascio", "capacity": 1000},
    "CAMAIORE": {"city": "Camaiore", "stadium": "Stadio Comunale di Camaiore", "capacity": 2000},
    "TERRANUOVA TRAIANA": {"city": "Terranuova Bracciolini", "stadium": "Stadio Comunale", "capacity": 1000},
    "TRESTINA": {"city": "Trestina", "stadium": "Stadio Comunale di Trestina", "capacity": 1000},
    "VIVI ALTOTEVERE": {"city": "Citta di Castello", "stadium": "Stadio Comunale", "capacity": 2000},
    "SAN DONATO": {"city": "San Donato Tavarnelle", "stadium": "Stadio Comunale", "capacity": 1500},
    "LENTIGIONE": {"city": "Brescello", "stadium": "Stadio Comunale di Lentigione", "capacity": 1500},
    "CORREGGESE": {"city": "Correggio", "stadium": "Stadio Comunale di Correggio", "capacity": 1500},
    "PRO PALAZZOLO": {"city": "Palazzolo sull'Oglio", "capacity": 2000, "stadium": "Stadio Comunale di Palazzolo"},
    "TUTTOCUOIO": {"city": "Santa Croce sull'Arno", "stadium": "Stadio Comunale", "capacity": 2000},
    "SASSU MARCONI": {"city": "Sasso Marconi", "stadium": "Stadio Comunale", "capacity": 1000},
    "SASSO MARCONI": {"city": "Sasso Marconi", "stadium": "Stadio Comunale", "capacity": 1000},
    "SCD PROGRESSO": {"city": "Castel Maggiore", "stadium": "Stadio Comunale", "capacity": 1500},
    "TROPICAL CORIANO": {"city": "Coriano", "stadium": "Stadio Comunale di Coriano", "capacity": 1000},
    "TREVIGLIESE": {"city": "Treviglio", "stadium": "Stadio Comunale di Treviglio", "capacity": 2000},
    "ROVATO VERTOVESE": {"city": "Rovato", "stadium": "Stadio Comunale di Rovato", "capacity": 1500},
    "CITTADELLA VIS MODENA": {"city": "Modena", "stadium": "Stadio Alberto Braglia", "capacity": 21092},
    "SANT'ANGELO": {"city": "Sant'Angelo Lodigiano", "stadium": "Stadio Comunale", "capacity": 1500},
    "ESTE": {"city": "Este", "stadium": "Stadio Nuovo Comunale", "capacity": 2000},
    "CAMPODARSEGO": {"city": "Campodarsego", "stadium": "Stadio Comunale di Campodarsego", "capacity": 2000},
    "CALVI NOALE": {"city": "Noale", "stadium": "Stadio Comunale di Noale", "capacity": 1500},
    "CONEGLIANO": {"city": "Conegliano", "stadium": "Stadio Comunale di Conegliano", "capacity": 2000},
    "PORTOGRUARO": {"city": "Portogruaro", "stadium": "Stadio Pier Giovanni Mecchia", "capacity": 3335},
    "UNION CLODIENSE": {"city": "Chioggia", "stadium": "Stadio Aldo e Dino Ballarin", "capacity": 3622},
    "CJARLINS MUZANE": {"city": "Muzzana del Turgnano", "stadium": "Stadio Comunale", "capacity": 1000},
    "LUPARENSE": {"city": "Luparè", "stadium": "Stadio Comunale", "capacity": 1000},
    "LUPARENSE": {"city": "Lupare", "stadium": "Stadio Comunale", "capacity": 1000},
    "BRIAN LIGNANO": {"city": "Lignano Sabbiadoro", "stadium": "Stadio Comunale", "capacity": 1500},
    "ADRIESE": {"city": "Adria", "stadium": "Stadio Comunale di Adria", "capacity": 2000},
    "ALTAVILLA": {"city": "Altavilla Vicentina", "stadium": "Stadio Comunale", "capacity": 1000},
    "VIGASIO": {"city": "Vigasio", "stadium": "Stadio Comunale di Vigasio", "capacity": 1000},
    "SAN LUIGI": {"city": "Trieste", "stadium": "Stadio Comunale", "capacity": 1000},
    "FC OBERMAIS": {"city": "Merano", "stadium": "Stadio Comunale di Merano", "capacity": 2000},
    "CALDIERO TERME": {"city": "Caldiero", "stadium": "Stadio Comunale di Caldiero", "capacity": 1500},
    "BRENO": {"city": "Breno", "stadium": "Stadio Comunale di Breno", "capacity": 1500},
    "BRUSAPORTO": {"city": "Brusaporto", "stadium": "Stadio Comunale di Brusaporto", "capacity": 1000},
    "CASTELLANZESE": {"city": "Castellanza", "stadium": "Stadio Comunale di Castellanza", "capacity": 1500},
    "CISERANO-BERGAMO": {"city": "Ciserano", "stadium": "Stadio Comunale di Ciserano", "capacity": 1500},
    "LEON": {"city": "Leno", "stadium": "Stadio Comunale di Leno", "capacity": 1000},
    "OLTREPO": {"city": "Stradella", "stadium": "Stadio Comunale", "capacity": 1500},
    "REAL CALEPINA": {"city": "Calcio", "stadium": "Stadio Comunale", "capacity": 1000},
    "SCANZOROSCIATE": {"city": "Scanzorosciate", "stadium": "Stadio Comunale", "capacity": 1000},
    "SONDRIO": {"city": "Sondrio", "stadium": "Stadio Castellina", "capacity": 4000},
    "USD CASATESE": {"city": "Casatenovo", "stadium": "Stadio Comunale", "capacity": 1000},
    "VARESINA": {"city": "Venegono Superiore", "stadium": "Stadio Comunale", "capacity": 1500},
    "VILLA VALLE": {"city": "Villa d'Alme", "stadium": "Stadio Comunale", "capacity": 1000},
    "VOGHERESE": {"city": "Voghera", "stadium": "Stadio Giovanni Parisi", "capacity": 4000},
    "CAIRESE": {"city": "Cairo Montenotte", "stadium": "Stadio Comunale", "capacity": 1500},
    "CELLE VARAZZE": {"city": "Celle Ligure", "stadium": "Stadio Comunale", "capacity": 1000},
    "CHISOLA": {"city": "None", "stadium": "Stadio Comunale", "capacity": 1000},
    "CLUB MILANO": {"city": "Milano", "stadium": "Centro Sportivo", "capacity": 1000},
    "LAVAGNESE": {"city": "Lavagna", "stadium": "Stadio Comunale di Lavagna", "capacity": 2000},
    "LIGORNA": {"city": "Genova", "stadium": "Stadio Ligorna", "capacity": 1000},
    "NOVAROMENTIN": {"city": "Novara", "stadium": "Stadio Comunale", "capacity": 1000},
    "SALUZZO": {"city": "Saluzzo", "stadium": "Stadio Comunale di Saluzzo", "capacity": 2000},
    "VALENZANA": {"city": "Valenza", "stadium": "Stadio Comunale di Valenza", "capacity": 2000},
    "ALBALONGA": {"city": "Frascati", "stadium": "Stadio Comunale di Frascati", "capacity": 1500},
    "ANZIO CALCIO 1924": {"city": "Anzio", "stadium": "Stadio Comunale di Anzio", "capacity": 2000},
    "ATL. LODIGIANI": {"city": "Roma", "stadium": "Centro Sportivo Lodigiani", "capacity": 1000},
    "BUDONI": {"city": "Budoni", "stadium": "Stadio Comunale di Budoni", "capacity": 1500},
    "FLAMINIA": {"city": "Civita Castellana", "stadium": "Stadio Comunale", "capacity": 1500},
    "MONASTIR": {"city": "Monastir", "stadium": "Stadio Comunale di Monastir", "capacity": 1000},
    "MONTESPACCATO": {"city": "Roma", "stadium": "Stadio Comunale Montespaccato", "capacity": 1000},
    "PALMESE 1914": {"city": "Palmi", "stadium": "Stadio Giuseppe Lopresti", "capacity": 3500},
    "REAL MONTEROTONDO": {"city": "Monterotondo", "stadium": "Stadio Comunale", "capacity": 1500},
    "SARRABUS OGLIASTRA": {"city": "Muravera", "stadium": "Stadio Comunale", "capacity": 1500},
    "VALMONTONE": {"city": "Valmontone", "stadium": "Stadio Comunale di Valmontone", "capacity": 1000},
    "ACERRANA": {"city": "Acerra", "stadium": "Stadio Comunale di Acerra", "capacity": 2000},
    "AFRAGOLESE": {"city": "Afragola", "stadium": "Stadio Comunale di Afragola", "capacity": 2000},
    "FERRANDINA": {"city": "Ferrandina", "stadium": "Stadio Comunale", "capacity": 1000},
    "FRANCAVILLA": {"city": "Francavilla in Sinni", "stadium": "Stadio Comunale", "capacity": 1500},
    "POMPEI": {"city": "Pompei", "stadium": "Stadio Comunale di Pompei", "capacity": 1500},
    "SARNESE": {"city": "Sarno", "stadium": "Stadio Comunale di Sarno", "capacity": 2000},
    "ATHLETIC PALERMO": {"city": "Palermo", "stadium": "Stadio Renzo Barbera", "capacity": 36365},
    "CASTRUMFAVARA": {"city": "Favara", "stadium": "Stadio Comunale di Favara", "capacity": 1500},
    "IGEA VIRTUS": {"city": "Barcellona Pozzo di Gotto", "stadium": "Stadio Carlo D'Alcontres", "capacity": 7000},
    "NISSA": {"city": "Caltanissetta", "stadium": "Stadio Marco Tomaselli", "capacity": 11000},
    "SAMBIASE": {"city": "Lamezia Terme", "stadium": "Stadio Comunale", "capacity": 2000},
    "SANCATALDESE": {"city": "San Cataldo", "stadium": "Stadio Comunale di San Cataldo", "capacity": 2000},
}

# Titoli Wikipedia preferiti quando il nome catalogo non basta
TITLE_TRIES = {
    "INTER": ["Football Club Internazionale Milano"],
    "MILAN": ["Associazione Calcio Milan"],
    "COMO": ["Como 1907"],
    "MONZA": ["Associazione Calcio Monza"],
    "ENTELLA": ["Virtus Entella"],
    "L.R. VICENZA": ["L.R. Vicenza", "Vicenza Calcio"],
    "SÜDTIROL": ["Fußball Club Südtirol", "FC Südtirol"],
    "SUDTIROL": ["Fußball Club Südtirol", "FC Südtirol"],
    "JUVENTUS U23": ["Juventus Next Gen"],
    "ATALANTA U23": ["Atalanta Under-23", "Atalanta Bergamasca Calcio"],
    "INTER U23": ["Inter Milan Next", "Football Club Internazionale Milano"],
    "MILAN U23": ["Milan Futuro", "Associazione Calcio Milan"],
    "ALCIONE MILANO": ["Alcione Milano", "Alcione Calcio Milano"],
    "GIANA ERMINIO": ["A.S. Giana Erminio", "Giana Erminio"],
    "AUDACE CERIGNOLA": ["Audace Cerignola"],
    "L.R. VICENZA": ["L.R. Vicenza"],
    "ACR MESSINA": ["Associazione Calcio Rinascita Messina", "ACR Messina"],
    "VIRTUS FRANCAVILLA": ["Virtus Francavilla Calcio"],
    "FIDELIS ANDRIA": ["Fidelis Andria 2018", "AS Andria BAT"],
    "SAN MARINO CALCIO": ["San Marino Calcio"],
    "L'AQUILA": ["L'Aquila Calcio 1927", "L'Aquila Calcio"],
    "A.C NARDÒ": ["A.C. Nardò", "Nardò Calcio"],
    "SS NOLA 1925": ["S.S. Nola 1925", "Nola Calcio"],
    "CITTA DI FASANO": ["Città di Fasano", "Fasano Calcio"],
    "ATL. LODIGIANI": ["Atletico Lodigiani", "Lodigiani Calcio"],
    "TRASTEVERE CALCIO": ["Trastevere Calcio"],
    "FC OBERMAIS": ["FC Obermais", "Obermais"],
    "USD RAGUSA": ["U.S.D. Ragusa 2014", "Ragusa Calcio"],
    "USD CASATESE": ["Casatese", "U.S.D. Casatese"],
    "VARESE FC": ["Varese Calcio", "A.S.D. Varese Calcio"],
    "AS BIELLESE": ["Biellese 1902", "A.S. Biellese 1902"],
    "DERTHONA FBC": ["Derthona F.B.C. 1908", "Derthona"],
    "SANGIULIANO CITY": ["Sangiuliano City F.C.", "Sangiuliano City"],
    "CITTADELLA VIS MODENA": ["Cittadella Vis Modena"],
    "FOLLONICA GAVORRANO": ["Follonica Gavorrano", "U.S. Gavorrano"],
    "REAL NORMANNA": ["Real Normanna", "Bisceglie Calcio"],
    "MARTINA CALCIO": ["Martina Calcio 1947", "A.S. Martina Franca 1947"],
}


def clean_wiki(val):
    if not val:
        return ""
    val = str(val)
    val = re.sub(r"<ref[\s\S]*?</ref>", "", val, flags=re.I)
    val = re.sub(r"<br\s*/?>", " ", val, flags=re.I)
    m = re.search(r"formatnum:([\d\.\,]+)", val, re.I)
    if m:
        return re.sub(r"[^\d]", "", m.group(1))

    def link_repl(m):
        parts = m.group(1).split("|")
        return parts[-1]

    val = re.sub(r"\[\[([^\]]+)\]\]", link_repl, val)
    # strip simple templates {{...}}
    for _ in range(4):
        nxt = re.sub(r"\{\{[^{}]*\}\}", "", val)
        if nxt == val:
            break
        val = nxt
    val = re.sub(r"'{2,}", "", val)
    val = re.sub(r"<[^>]+>", "", val)
    val = re.sub(r"&nbsp;", " ", val)
    val = re.sub(r"\s+", " ", val).strip(" |,;")
    return val.strip()


def parse_capacity(val):
    if val is None:
        return None
    if isinstance(val, int):
        return val if 100 <= val <= 200000 else None
    val = clean_wiki(val)
    # take first number-like chunk
    m = re.search(r"([\d][\d\.\,\s]*)", val)
    if not m:
        return None
    digits = re.sub(r"[^\d]", "", m.group(1))
    if not digits:
        return None
    try:
        n = int(digits)
        if 100 <= n <= 200000:
            return n
    except Exception:
        return None
    return None


def wiki_content(title):
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "prop": "revisions",
            "rvprop": "content",
            "rvslots": "main",
            "titles": title,
            "format": "json",
            "redirects": 1,
        }
    )
    url = "https://it.wikipedia.org/w/api.php?" + q
    req = urllib.request.Request(url, headers=UA)
    data = json.loads(urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8"))
    pages = data.get("query", {}).get("pages", {})
    for pid, p in pages.items():
        if str(pid).startswith("-"):
            return None, ""
        rev = (p.get("revisions") or [{}])[0]
        slot = rev.get("slots", {}).get("main", {})
        return p.get("title"), slot.get("*") or rev.get("*") or ""
    return None, ""


def extract_from_text(text):
    if not text:
        return {}
    out = {}
    keys = [
        ("stadio", "stadium"),
        ("impianto", "stadium"),
        ("ground", "stadium"),
        ("capienza", "capacity_raw"),
        ("capacita", "capacity_raw"),
        ("capacità", "capacity_raw"),
        ("capacity", "capacity_raw"),
        ("città", "city"),
        ("citta", "city"),
        ("sede", "city"),
        ("comune", "city"),
    ]
    for key, dest in keys:
        m = re.search(rf"\|\s*{re.escape(key)}\s*=\s*([^\n|]+)", text, re.I)
        if m and dest not in out:
            cleaned = clean_wiki(m.group(1))
            if cleaned:
                out[dest] = cleaned
    if "capacity_raw" in out:
        cap = parse_capacity(out.pop("capacity_raw"))
        if cap:
            out["capacity"] = cap
    if out.get("stadium"):
        st = out["stadium"]
        # drop trailing ref noise
        st = re.sub(r"\s*\d+\s*$", "", st).strip()
        out["stadium"] = st
    if out.get("city"):
        city = out["city"]
        city = city.split(" e ")[0].split(",")[0].split("(")[0].strip()
        # avoid country-like
        if city.lower() in ("italia", "italy", "europe", "europa"):
            del out["city"]
        else:
            out["city"] = city
    return out


def fetch_team_venue(name):
    uname = name.upper().strip()
    if uname in MANUAL:
        m = MANUAL[uname]
        return {
            "city": m["city"],
            "stadium": m["stadium"],
            "capacity": m["capacity"],
            "source": "manual+wikipedia",
        }

    titles = TITLE_TRIES.get(uname, []) + [
        name,
        name + " Calcio",
        "Calcio " + name,
        name + " Football Club",
        "FC " + name,
        "US " + name,
        "AS " + name,
        "SSD " + name,
        "ASD " + name,
        name.replace(" U23", " Next Gen"),
        name.replace(" U23", " Futuro"),
        name.replace(" U23", ""),
        name.replace(".", ""),
    ]
    seen = set()
    tries = []
    for t in titles:
        t = (t or "").strip()
        if t and t.lower() not in seen:
            seen.add(t.lower())
            tries.append(t)

    for title in tries:
        try:
            real, text = wiki_content(title)
            time.sleep(0.11)
            if not text or len(text) < 120:
                continue
            data = extract_from_text(text)
            if data.get("stadium") or data.get("city"):
                data["wiki"] = real or title
                data["source"] = "wikipedia.it"
                if not data.get("capacity") and data.get("stadium"):
                    st_title = re.split(r"[(\[]", data["stadium"])[0].strip()
                    if st_title:
                        try:
                            _, st_text = wiki_content(st_title)
                            time.sleep(0.1)
                            st_data = extract_from_text(st_text or "")
                            if st_data.get("capacity"):
                                data["capacity"] = st_data["capacity"]
                            # sometimes stadium pages use different field
                            if not data.get("capacity") and st_text:
                                m = re.search(r"\|\s*capienza\s*=\s*([^\n]+)", st_text, re.I)
                                if m:
                                    cap = parse_capacity(m.group(1))
                                    if cap:
                                        data["capacity"] = cap
                        except Exception:
                            pass
                return data
        except Exception:
            continue
    return {}


def is_pro(team):
    league = (team.get("league") or "").upper()
    if "FEMMINILE" in league:
        return False
    return any(league.startswith(x) for x in ("SERIE A", "SERIE B", "SERIE C", "SERIE D"))


def main():
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    cache = {}
    if CACHE.exists():
        try:
            cache = json.loads(CACHE.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    pro = [t for t in cat["teams"] if is_pro(t)]
    print("pro teams", len(pro))

    ok = 0
    partial = 0
    fail = []

    for i, t in enumerate(pro, 1):
        key = t["name"].upper().strip()
        data = None
        # MANUAL always wins (Wikipedia-curated overrides)
        if key in MANUAL:
            m = MANUAL[key]
            data = {
                "city": m["city"],
                "stadium": m["stadium"],
                "capacity": m["capacity"],
                "source": "manual+wikipedia",
            }
            cache[key] = data
        elif key in cache and cache[key].get("stadium") and cache[key].get("city"):
            data = cache[key]
        else:
            data = fetch_team_venue(t["name"])
            if data:
                prev = cache.get(key) or {}
                prev.update({k: v for k, v in data.items() if v not in (None, "")})
                cache[key] = prev
                data = prev
            if i % 25 == 0:
                CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"  progress {i}/{len(pro)} ok={ok} fail={len(fail)}")

        if data and (data.get("stadium") or data.get("city")):
            if data.get("city"):
                t["city"] = str(data["city"]).strip().upper()
            if data.get("stadium"):
                t["stadium"] = str(data["stadium"]).strip()
            if data.get("capacity"):
                try:
                    t["capacity"] = int(data["capacity"])
                except Exception:
                    pass
            t["venueSource"] = data.get("source") or "wikipedia"
            if data.get("stadium") and data.get("city") and data.get("capacity"):
                ok += 1
            else:
                partial += 1
            print(
                f"OK {t['name']}: {t.get('city')} | {t.get('stadium')} | {t.get('capacity')}"
            )
        else:
            fail.append(t["name"])
            print(f"FAIL {t['name']}")

    # normalize fields on all teams
    for t in cat["teams"]:
        if not t.get("stadium"):
            t["stadium"] = ""
        if "capacity" not in t:
            t["capacity"] = None
        if t.get("city"):
            t["city"] = str(t["city"]).strip().upper()

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    cat["version"] = max(int(cat.get("version") or 7), 9)
    cat["venueUpdatedAt"] = time.strftime("%Y-%m-%d")
    if "stats" not in cat or not isinstance(cat["stats"], dict):
        cat["stats"] = {}
    cat["stats"]["venuesOk"] = ok
    cat["stats"]["venuesPartial"] = partial
    cat["stats"]["venuesFail"] = len(fail)

    CAT.write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    REPORT.write_text(
        json.dumps(
            {"ok": ok, "partial": partial, "fail": fail, "totalPro": len(pro)},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print("DONE ok", ok, "partial", partial, "fail", len(fail))
    if fail:
        print("failed sample", fail[:40])


if __name__ == "__main__":
    main()
