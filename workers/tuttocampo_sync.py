# -*- coding: utf-8 -*-
"""
ELISEE SCOUT — Worker sync Tuttocampo
Aggiorna data/campionati/latest.json in continuo.

Default: ogni 10 secondi (rotazione URL) — automatico, senza intervento utente.

Uso:
  python workers/tuttocampo_sync.py
  python workers/tuttocampo_sync.py --interval 10
  python workers/tuttocampo_sync.py --once
"""
from __future__ import annotations

import argparse
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "campionati"
OUT_FILE = OUT_DIR / "latest.json"
LOG_FILE = OUT_DIR / "sync.log"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
)

# Mappa categoria → URL Tuttocampo da monitorare
TARGETS = {
    "serie-d": [
        "https://www.tuttocampo.it/Italia/SerieD/GironeA/Squadre",
        "https://www.tuttocampo.it/Italia/SerieD/GironeB/Squadre",
        "https://www.tuttocampo.it/Italia/SerieD/GironeA/Classifica",
        "https://www.tuttocampo.it/Italia/SerieD/GironeA/Calendario",
        "https://www.tuttocampo.it/Italia/SerieD/GironeA/Marcatori",
    ],
    "eccellenza": [
        "https://www.tuttocampo.it/Puglia/Eccellenza/GironeA/Squadre",
        "https://www.tuttocampo.it/Calabria/Eccellenza/GironeA/Squadre",
        "https://www.tuttocampo.it/Lombardia/Eccellenza/GironeA/Classifica",
        "https://www.tuttocampo.it/Lazio/Eccellenza/GironeA/Calendario",
        "https://www.tuttocampo.it/Toscana/Eccellenza/GironeA/Marcatori",
    ],
    "promozione": [
        "https://www.tuttocampo.it/Puglia/Promozione/GironeA/Squadre",
        "https://www.tuttocampo.it/Puglia/Promozione/GironeB/Squadre",
        "https://www.tuttocampo.it/Calabria/Promozione/GironeA/Squadre",
        "https://www.tuttocampo.it/Calabria/Promozione/GironeB/Classifica",
        "https://www.tuttocampo.it/Lombardia/Promozione/GironeA/Calendario",
    ],
    "under-19": [
        "https://www.tuttocampo.it/Italia/JunioresNazionaliU19/Squadre",
        "https://www.tuttocampo.it/Puglia/JunioresRegionaliU19/Classifica",
    ],
    "prima-cat": [
        "https://www.tuttocampo.it/Puglia/PrimaCategoria/GironeA/Squadre",
        "https://www.tuttocampo.it/Calabria/PrimaCategoria/GironeA/Classifica",
    ],
    "seconda-cat": [
        "https://www.tuttocampo.it/Puglia/SecondaCategoria/GironeA/Squadre",
        "https://www.tuttocampo.it/Lombardia/SecondaCategoria/GironeA/Classifica",
    ],
    "terza-cat": [
        "https://www.tuttocampo.it/Puglia/TerzaCategoria/Squadre",
        "https://www.tuttocampo.it/Lazio/TerzaCategoria/Classifica",
    ],
    "femminile": [
        "https://www.tuttocampo.it/Italia/FemminileSerieA/Squadre",
        "https://www.tuttocampo.it/Italia/FemminileSerieB/Squadre",
        "https://www.tuttocampo.it/Italia/FemminileSerieA/Classifica",
    ],
    "svincolati": [
        "https://www.tuttocampo.it/Puglia/BachecaAnnunciCalcio",
        "https://www.tuttocampo.it/Italia/BachecaAnnunciCalcio",
    ],
}


def log(msg: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    line = f"{datetime.now(timezone.utc).isoformat()} {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def fetch(url: str, timeout: int = 12) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Referer": "https://www.tuttocampo.it/",
            "Upgrade-Insecure-Requests": "1",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")


def extract_teams(html: str) -> list[str]:
    teams: list[str] = []
    seen: set[str] = set()
    patterns = [
        r'data-squadra=["\']([^"\']{2,60})["\']',
        r'class="[^"]*team[^"]*"[^>]*>([^<]{2,60})<',
        r'href="[^"]*/Squadra/[^"]*"[^>]*>([^<]{2,60})<',
        r'<h[23][^>]*>([^<]{2,60})</h[23]>',
    ]
    skip = {
        "home", "login", "news", "risultati", "classifica", "calendario",
        "marcatori", "squadre", "statistiche", "cartellini", "mappa", "mercato",
    }
    for pat in patterns:
        for m in re.finditer(pat, html, flags=re.I):
            name = re.sub(r"\s+", " ", m.group(1)).strip()
            if not name or name.lower() in skip:
                continue
            if len(name) < 3 or len(name) > 55:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            teams.append(name)
            if len(teams) >= 48:
                return teams
    return teams


def empty_bucket() -> dict:
    return {
        "teams": [],
        "groups": [],
        "calendar": [],
        "standings": [],
        "scorers": [],
        "stats": {},
        "discipline": [],
        "market": [],
        "meta": {
            "lastSync": None,
            "source": "https://www.tuttocampo.it",
            "errors": 0,
            "ok": 0,
            "urls": [],
        },
    }


def load_existing() -> dict:
    if OUT_FILE.exists():
        try:
            data = json.loads(OUT_FILE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                data.setdefault("categories", {})
                return data
        except Exception:
            pass
    return {
        "version": 2,
        "updatedAt": None,
        "source": "https://www.tuttocampo.it",
        "worker": "tuttocampo_sync.py",
        "categories": {},
        "cycle": 0,
    }


def flat_targets() -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for cat_id, urls in TARGETS.items():
        for url in urls:
            out.append((cat_id, url))
    return out


FLAT = flat_targets()


def apply_url_to_bucket(bucket: dict, url: str, teams: list[str], now: str, ok: bool, err: str | None = None) -> None:
    kind = url.rstrip("/").split("/")[-1].lower()
    note = {"updatedAt": now, "source": url, "extracted": len(teams)}
    if ok:
        bucket["meta"]["ok"] = int(bucket["meta"].get("ok") or 0) + 1
        bucket["meta"]["urls"].append({"url": url, "status": "ok", "teams": len(teams), "at": now})
        if "classifica" in kind:
            bucket["standings"] = (bucket.get("standings") or [])[-4:] + [note]
        elif "calendario" in kind:
            bucket["calendar"] = (bucket.get("calendar") or [])[-4:] + [note]
        elif "marcatori" in kind:
            bucket["scorers"] = (bucket.get("scorers") or [])[-4:] + [note]
        elif "statistiche" in kind:
            bucket["stats"] = {"updatedAt": now, "source": url}
        elif "annunci" in kind or "bacheca" in kind:
            bucket["market"] = (bucket.get("market") or [])[-4:] + [note]
        # merge teams
        seen = {t.lower() for t in bucket.get("teams") or []}
        for t in teams:
            if t.lower() not in seen:
                seen.add(t.lower())
                bucket.setdefault("teams", []).append(t)
    else:
        bucket["meta"]["errors"] = int(bucket["meta"].get("errors") or 0) + 1
        bucket["meta"]["urls"].append({"url": url, "status": "error", "error": err or "?", "at": now})
    # keep url history short
    if len(bucket["meta"]["urls"]) > 30:
        bucket["meta"]["urls"] = bucket["meta"]["urls"][-30:]
    bucket["meta"]["lastSync"] = now


def write_payload(payload: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def sync_once() -> dict:
    """Ciclo completo (tutte le URL) — più lento; usato da --once."""
    now = datetime.now(timezone.utc).isoformat()
    payload = load_existing()
    payload["version"] = 2
    payload["updatedAt"] = now
    payload["worker"] = "tuttocampo_sync.py"
    payload["source"] = "https://www.tuttocampo.it"
    for cat_id, url in FLAT:
        if cat_id not in payload["categories"]:
            payload["categories"][cat_id] = empty_bucket()
        bucket = payload["categories"][cat_id]
        try:
            html = fetch(url)
            teams = extract_teams(html)
            apply_url_to_bucket(bucket, url, teams, now, True)
            log(f"OK {cat_id} {url} teams={len(teams)}")
            time.sleep(0.4)
        except Exception as e:  # noqa: BLE001
            apply_url_to_bucket(bucket, url, [], now, False, str(e))
            log(f"ERR {cat_id} {url} {e}")
            time.sleep(0.6)
    write_payload(payload)
    log(f"WROTE full {OUT_FILE}")
    return payload


def sync_tick(cursor: int, urls_per_tick: int = 1) -> int:
    """
    Aggiornamento naturale ogni intervallo:
    1) heartbeat immediato su latest.json (mai stale se il processo gira)
    2) fetch di poche URL a rotazione (veloce, sostenibile)
    3) riscrittura finale con eventuali dati nuovi
    """
    now = datetime.now(timezone.utc).isoformat()
    payload = load_existing()
    payload["version"] = 2
    payload["worker"] = "tuttocampo_sync.py"
    payload["source"] = "https://www.tuttocampo.it"
    payload["cycle"] = int(payload.get("cycle") or 0) + 1
    payload["updatedAt"] = now
    payload["lastTick"] = {
        "at": now,
        "cursor": cursor,
        "processed": [],
        "phase": "heartbeat",
        "intervalMode": "rotate-10s",
    }
    # Heartbeat PRIMA dei fetch: il file resta fresco ogni 10s anche se la rete è lenta
    write_payload(payload)

    n = len(FLAT) or 1
    processed = []
    for i in range(max(1, urls_per_tick)):
        idx = (cursor + i) % n
        cat_id, url = FLAT[idx]
        if cat_id not in payload["categories"]:
            payload["categories"][cat_id] = empty_bucket()
        bucket = payload["categories"][cat_id]
        try:
            html = fetch(url, timeout=5)
            teams = extract_teams(html)
            apply_url_to_bucket(bucket, url, teams, now, True)
            processed.append(f"{cat_id}:ok:{len(teams)}")
            log(f"TICK {payload['cycle']} OK {cat_id} teams={len(teams)}")
        except Exception as e:  # noqa: BLE001
            apply_url_to_bucket(bucket, url, [], now, False, str(e))
            processed.append(f"{cat_id}:err")
            log(f"TICK {payload['cycle']} ERR {cat_id} {e}")

    now2 = datetime.now(timezone.utc).isoformat()
    payload["updatedAt"] = now2
    payload["lastTick"] = {
        "at": now2,
        "cursor": cursor,
        "processed": processed,
        "phase": "done",
        "intervalMode": "rotate-10s",
    }
    write_payload(payload)
    return (cursor + max(1, urls_per_tick)) % n


def main() -> None:
    ap = argparse.ArgumentParser(description="Sync continuo Tuttocampo → data/campionati (default 10s)")
    ap.add_argument("--once", action="store_true", help="Ciclo completo e esci")
    ap.add_argument("--interval", type=int, default=10, help="Secondi tra i tick (default 10)")
    ap.add_argument("--urls-per-tick", type=int, default=1, help="URL per tick a rotazione (default 1)")
    args = ap.parse_args()

    if args.once:
        sync_once()
        return

    interval = max(1, int(args.interval))
    urls_per_tick = max(1, int(args.urls_per_tick))
    log(f"START continuous interval={interval}s urls_per_tick={urls_per_tick} targets={len(FLAT)}")
    cursor = 0
    # primo tick immediato
    while True:
        t0 = time.time()
        try:
            cursor = sync_tick(cursor, urls_per_tick=urls_per_tick)
        except Exception as e:  # noqa: BLE001
            log(f"CYCLE FATAL {e}")
            # heartbeat minimo: tocca comunque il file se possibile
            try:
                payload = load_existing()
                payload["updatedAt"] = datetime.now(timezone.utc).isoformat()
                payload["lastError"] = str(e)
                write_payload(payload)
            except Exception:
                pass
        elapsed = time.time() - t0
        sleep_for = max(0.2, interval - elapsed)
        time.sleep(sleep_for)


if __name__ == "__main__":
    main()
