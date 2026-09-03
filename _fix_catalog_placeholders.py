import json
import re

def clean_catalog():
    cat_path = 'data/squadre/catalog.json'
    with open(cat_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    teams = data['teams'] if isinstance(data, dict) else data

    # 1. Map of authentic names replacement for fake names
    # Name mappings to real local/amateur clubs
    REPLACEMENTS = {
        # Sardegna
        'PRO CAGLIARI': 'FERRINI CAGLIARI',
        'REAL CAGLIARI': 'SAN MARCO ASSEMINI',
        'FC PORTO TORRES': 'PORTO TORRES CALCIO',
        
        # Piemonte
        'CITTÀ DI TORINO': 'LUCENTO TORINO',
        'PRO TORINO': 'CENISIA TORINO',
        'REAL TORINO': 'POZZOMAINA TORINO',
        'ATLETICO TORINO': 'ATLETICO TORINO 1968',
        'SPORTING TORINO': 'SAN GIORGIO TORINO',
        'FC TORINO': 'VANCHIGLIA 1915',
        
        # Emilia-Romagna
        'CALCIO CESENA': 'DIEGARO CESENA',
        'PRO CESENA': 'GAMBETTOLA CALCIO',
        'REAL CESENA': 'SAVIGNANESE 1932',
        'FC CESENA': 'TORRE DEL MORO',
        'SPORTING CESENA': 'FRATTA TERME',
        
        # Liguria
        'CITTÀ DI LA SPEZIA': 'TARROS SARZANESE',
        'PRO LA SPEZIA': 'CANALETTO SEPOR',
        'REAL LA SPEZIA': 'FOLLO CALCIO',
        'VIRTUS IMPERIA': 'GOLFO DIANESE',
        
        # Basilicata
        'CITTÀ DI POTENZA': 'AVIGLIANO CALCIO',
        'US POTENZA': 'PATERNO LUCANO',
        'REAL POTENZA': 'MELFI 1929',
        'PRO POTENZA': 'VIGGIANO CALCIO',
        
        # Calabria
        'CALCIO CATANZARO': 'SAMBIASE 1923',
        'US CATANZARO': 'ISOLA CAPO RIZZUTO',
        'FC COSENZA': 'PRAIATORTORA',
        'VIRTUS COSENZA': 'RENDE CALCIO 1968',
        'REAL CROTONE': 'COTRONEI CACCURI',
        'UNIONE CROTONE': 'AEK CROTONE',
        
        # Sicilia
        'SPORTING PALERMO': 'RESUTTANA SAN LORENZO',
        'POLISPORTIVA PALERMO': 'ORATORIO SAN CIRO',
        'ASD CATANIA': 'MISTERBIANCO 2023',
        'ATLETICO CATANIA': 'ATLETICO 1994 CATANIA',
        'POLISPORTIVA MESSINA': 'GESCAL MESSINA',
        'FC MESSINA': 'VALLE DEL MELA',
        'PRO MESSINA': 'MESSANA 1966',
        
        # Puglia
        'PRO BARI': 'CAPURSO CALCIO',
        'REAL BARI': 'RINASCITA RUTIGLIANESE',
        'FC LECCE': 'NOVOLI CALCIO',
        'REAL LECCE': 'COPERTINO CALCIO',
        'REAL FOGGIA': 'SAN SEVERO CALCIO',
        'FC MONOPOLI': 'POLIMNIA CALCIO',
        
        # Lombardia
        'CALCIO MONZA': 'CONCOREZZESE',
        'PRO MONZA': 'BIASSONO 1928',
        'FC LECCO': 'COLICO DERVIESE',
        'PRO LECCO': 'LUCIANO MANARA',
        
        # Lazio
        'UNIONE ROMA': 'ROMA VIII',
        'VIRTUS ROMA': 'URBETEVERE CALCIO',
        'PRO ROMA': 'VIGOR PERCONTI',
        'REAL ROMA': 'TOR DI QUINTO',
        'CITTÀ DI LATINA': 'LATINA BORGHI RIUNITI',
        'PRO LATINA': 'COSMOS LATINA',
        'US FROSINONE': 'STERPARO CALCIO',
        'PRO FROSINONE': 'ANAGNI 1970'
    }

    # Professional team logos that should NEVER be used by lower-division amateur clubs
    PRO_LOGOS = {
        'immagini/squadre-loghi/torino.png',
        'immagini/squadre-loghi/cagliari.png',
        'immagini/squadre-loghi/cesena.png',
        'immagini/squadre-loghi/spezia.png',
        'immagini/squadre-loghi/potenza.png',
        'immagini/squadre-loghi/catanzaro.png',
        'immagini/squadre-loghi/cosenza.png',
        'immagini/squadre-loghi/crotone.png',
        'immagini/squadre-loghi/palermo.png',
        'immagini/squadre-loghi/catania.png',
        'immagini/squadre-loghi/monza.png',
        'immagini/squadre-loghi/lecco.png',
        'immagini/squadre-loghi/roma.png',
        'immagini/squadre-loghi/latina.png',
        'immagini/squadre-loghi/frosinone.png',
        'immagini/squadre-loghi/bari.png',
        'immagini/squadre-loghi/lecce.png',
        'immagini/squadre-loghi/foggia.png',
        'immagini/squadre-loghi/monopoli.png',
        'immagini/squadre-loghi/imperia.png',
        'immagini/squadre-loghi/torres.png',
        'immagini/squadre-loghi/juventus.png',
        'immagini/squadre-loghi/milan.png',
        'immagini/squadre-loghi/inter.png',
        'immagini/squadre-loghi/napoli.png',
        'immagini/squadre-loghi/lazio.png',
        'immagini/squadre-loghi/fiorentina.png',
        'immagini/squadre-loghi/bologna.png',
        'immagini/squadre-loghi/atalanta.png',
        'immagini/squadre-loghi/verona.png',
        'immagini/squadre-loghi/genoa.png',
        'immagini/squadre-loghi/sampdoria.png',
        'immagini/squadre-loghi/parma.png',
        'immagini/squadre-loghi/brescia.png',
        'immagini/squadre-loghi/pisa.png',
        'immagini/squadre-loghi/venezia.png',
        'immagini/squadre-loghi/empoli.png',
        'immagini/squadre-loghi/como.png',
        'immagini/squadre-loghi/cremonese.png',
        'immagini/squadre-loghi/modena.png',
        'immagini/squadre-loghi/reggiana.png',
        'immagini/squadre-loghi/salernitana.png',
        'immagini/squadre-loghi/sassuolo.png',
        'immagini/squadre-loghi/sudtirol.png',
        'immagini/squadre-loghi/mantova.png',
        'immagini/squadre-loghi/carrarese.png',
        'immagini/squadre-loghi/juve-stabia.png'
    }

    modified_count = 0
    for t in teams:
        lg = (t.get('league') or t.get('l') or '').upper()
        name = (t.get('name') or t.get('n') or '').strip().upper()
        logo = t.get('logo') or t.get('o') or ''
        
        is_lower = any(k in lg for k in ['ECCELLENZA', 'PROMOZIONE', 'PRIMA CATEGORIA', 'SECONDA CATEGORIA', 'TERZA CATEGORIA'])
        is_pro_division = any(k in lg for k in ['SERIE A', 'SERIE B', 'SERIE C', 'SERIE D']) and 'FEMMINIL' not in lg and 'PRIMAVERA' not in lg
        
        if is_lower and not is_pro_division:
            # Check name replacement
            if name in REPLACEMENTS:
                new_name = REPLACEMENTS[name]
                t['name'] = new_name
                if 'n' in t: t['n'] = new_name
                modified_count += 1
            
            # If logo is a Pro team logo, replace with a generic / amateur badge
            if logo in PRO_LOGOS:
                # Assign neutral dilettanti/eccellenza shield
                t['logo'] = ''
                if 'o' in t: t['o'] = ''
                modified_count += 1

    print(f"Catalog teams processed: {len(teams)}, modifications made: {modified_count}")

    with open(cat_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Saved updated catalog.json")

clean_catalog()
