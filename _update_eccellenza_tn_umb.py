# -*- coding: utf-8 -*-
"""Aggiorna Eccellenza Trentino-Alto Adige e Umbria 2026/27 da Tuttocampo."""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

import importlib.util

_mod_path = Path(__file__).resolve().parent / "_update_eccellenza_10.py"
_spec = importlib.util.spec_from_file_location("ecc10", _mod_path)
ecc10 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ecc10)
CATALOG = ecc10.CATALOG
LOGO_DIR = ecc10.LOGO_DIR
colors = ecc10.colors
existing_logo_index = ecc10.existing_logo_index
js_escape = ecc10.js_escape
make_team = ecc10.make_team
resolve_logo = ecc10.resolve_logo
slug = ecc10.slug

GIRONI = {
    "ECCELLENZA · TRENTINO-ALTO ADIGE": {
        "id": "trentino",
        "title": "Trentino-Alto Adige",
        "area": "Eccellenza · girone unico ufficiale 2026/27 (16 squadre)",
        "region": "Trentino-Alto Adige",
        "teams": [
            ("Ahrntal", "Valle Aurina"),
            ("Anaune Val Di Non", "Cles"),
            ("Benacense", "Riva del Garda"),
            ("Mori Santo Stefano", "Mori"),
            ("Brunico Bruneck", "Brunico"),
            ("Comano Terme Fiavè", "Comano Terme"),
            ("Levico Terme", "Levico Terme"),
            ("Union Trento Ravinense", "Trento"),
            ("Naturns", "Naturno"),
            ("Tramin Fussball", "Termeno"),
            ("Rovereto", "Rovereto"),
            ("St. Georgen", "San Giorgio"),
            ("St. Pauls", "Appiano"),
            ("Partschins Raiffeisen", "Parcines"),
            ("Vipo Trento", "Trento"),
            ("Bozner", "Bolzano"),
        ],
    },
    "ECCELLENZA · UMBRIA": {
        "id": "umbria",
        "title": "Umbria",
        "area": "Eccellenza · girone unico ufficiale 2026/27 (16 squadre)",
        "region": "Umbria",
        "teams": [
            ("Agape Pierantonio Umbertide", "Umbertide"),
            ("Padule 1976", "Gubbio"),
            ("Cannara", "Cannara"),
            ("Bastia 1924", "Bastia Umbra"),
            ("Ellera Calcio", "Corciano"),
            ("Terni Football Club", "Terni"),
            ("Montone", "Montone"),
            ("Pontevecchio", "Perugia"),
            ("Narnese Calcio", "Narni"),
            ("Nuova Alba", "San Martino in Campo"),
            ("Olympia Thyrus S. Valentino", "Terni"),
            ("Tavernelle Calcio", "Panicale"),
            ("Torgiano Calcio", "Torgiano"),
            ("Atletico BMG", "Bevagna"),
            ("Vivi Altotevere Sansepolcro", "Sansepolcro"),
            ("Spoleto", "Spoleto"),
        ],
    },
}


def build_js_block(g: dict) -> str:
    lines = [f"    G('{g['id']}', '{js_escape(g['title'])}', '{js_escape(g['area'])}', ["]
    for name, city, logo in g["resolved"]:
        lines.append(
            f"      {{ name: '{js_escape(name)}', city: '{js_escape(city)}', logo: '{js_escape(logo)}' }},"
        )
    lines.append("    ]),")
    return "\n".join(lines)


def patch_focus(resolved: dict):
    from pathlib import Path
    focus = Path(__file__).resolve().parent / "focus.html"
    text = focus.read_text(encoding="utf-8")
    for g in resolved.values():
        pat = re.compile(rf"    G\('{re.escape(g['id'])}',[\s\S]*?\n    \]\),", re.M)
        block = build_js_block(g).rstrip(",")
        m = pat.search(text)
        if not m:
            print("WARN no G() block", g["id"])
            continue
        # only first match is Eccellenza (later ones are Promozione etc.)
        text = text[: m.start()] + block + "," + text[m.end():]
        print("patched focus", g["id"], "teams", len(g["resolved"]))
    focus.write_text(text, encoding="utf-8")


def patch_agents():
    from pathlib import Path
    p = Path(__file__).resolve().parent / "campionati-agents.js"
    t = p.read_text(encoding="utf-8")
    for gid, area in {
        "trentino": "Eccellenza · girone unico ufficiale 2026/27 (16 squadre)",
        "umbria": "Eccellenza · girone unico ufficiale 2026/27 (16 squadre)",
    }.items():
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
            time.sleep(0.04)
            new_teams.append(make_team(name, league, city, i, logo, sid))
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
