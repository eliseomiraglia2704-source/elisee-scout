# -*- coding: utf-8 -*-
"""
ELISEE SCOUT — Server indistruttibile
http://127.0.0.1:8080/

- Un solo processo
- Mai crash su richiesta fallita
- Loop esterno: se serve_forever esce, riparte
- Path con spazi OK (cwd = cartella script)
- API AutoPilot inclusa
"""
from __future__ import annotations

import json
import os
import socket
import sys
import threading
import time
import traceback
import urllib.error
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
sys.path.insert(0, str(ROOT / "workers"))

PORT = int(os.environ.get("ELISEE_PORT", "8080"))
HOST = "127.0.0.1"
LOG = ROOT / "data" / "autopilot" / "elisee_up.log"

try:
    from autopilot_engine import get_engine  # type: ignore
except Exception:
    get_engine = None  # type: ignore


def log(msg: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    line = time.strftime("%Y-%m-%d %H:%M:%S") + " " + msg
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass
    try:
        print(line, flush=True)
    except Exception:
        pass


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "EliseeUp/3.0"

    def log_message(self, fmt: str, *args) -> None:
        # silenzioso in console; solo errori gravi
        pass

    def log_error(self, fmt: str, *args) -> None:
        try:
            log("ERR " + (fmt % args))
        except Exception:
            pass

    def end_headers(self) -> None:
        # no-store: evita browser/SW che tengono HTML vecchio (es. pagina Squadre vuota)
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Elisee-Server", "up")
        self.send_header("X-Elisee-Build", "20260806_NOCORS")
        super().end_headers()

    def handle_one_request(self) -> None:
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError, OSError):
            pass
        except Exception:
            log("handle_one_request: " + traceback.format_exc()[-300:])

    def _json(self, code: int, payload: object) -> None:
        raw = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
        try:
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(raw)
        except Exception:
            pass

    def _read_json_body(self) -> dict:
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except Exception:
            n = 0
        if n <= 0:
            return {}
        try:
            raw = self.rfile.read(n)
            data = json.loads(raw.decode("utf-8"))
            return data if isinstance(data, dict) else {"data": data}
        except Exception:
            return {}

    def _proxy_fetch(self, target: str) -> bool:
        """Proxy HTTP GET verso host consentiti (evita CORS browser)."""
        try:
            u = urlparse(target)
        except Exception:
            self._json(400, {"ok": False, "error": "bad_url"})
            return True
        host = (u.hostname or "").lower()
        allowed = (
            "www.tuttocampo.it",
            "tuttocampo.it",
            "assets.football-logos.cc",
            "football-logos.cc",
            "images.football-logos.cc",
        )
        if host not in allowed:
            self._json(403, {"ok": False, "error": "host_not_allowed", "host": host})
            return True
        if u.scheme not in ("http", "https"):
            self._json(400, {"ok": False, "error": "bad_scheme"})
            return True
        try:
            req = urllib.request.Request(
                target,
                headers={
                    # UA browser: tuttocampo spesso risponde 403 a bot/UA custom
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/128.0.0.0 Safari/537.36"
                    ),
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
                    "Referer": "https://www.tuttocampo.it/",
                    "Cache-Control": "no-cache",
                },
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                raw = resp.read()
                ctype = resp.headers.get("Content-Type") or "text/html; charset=utf-8"
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(raw)
            return True
        except urllib.error.HTTPError as e:
            # Non inoltrare 403 grezzo: risposta JSON stabile per il client
            self._json(
                502,
                {
                    "ok": False,
                    "error": f"upstream_http_{e.code}",
                    "hint": "usa data/campionati/latest.json dal worker",
                },
            )
            return True
        except Exception as e:
            self._json(502, {"ok": False, "error": str(e), "hint": "worker-local-json"})
            return True

    def _api(self) -> bool:
        parsed = urlparse(self.path)
        path = (parsed.path or "/").rstrip("/") or "/"
        # Proxy generico anti-CORS (Tuttocampo / loghi)
        if path == "/api/proxy" and self.command in ("GET", "HEAD"):
            qs = parse_qs(parsed.query or "")
            target = (qs.get("url") or [""])[0]
            target = unquote(target or "").strip()
            if not target:
                self._json(400, {"ok": False, "error": "missing_url"})
                return True
            return self._proxy_fetch(target)
        if not path.startswith("/api/autopilot"):
            return False
        if get_engine is None:
            self._json(503, {"ok": False, "error": "engine_unavailable"})
            return True
        eng = get_engine()
        method = self.command.upper()
        qs = parse_qs(parsed.query or "")
        try:
            if path in ("/api/autopilot", "/api/autopilot/status") and method in ("GET", "HEAD"):
                self._json(200, {"ok": True, "status": eng.status()})
                return True
            if path == "/api/autopilot/health" and method in ("GET", "HEAD"):
                st = eng.status()
                self._json(200, {"ok": True, "running": st.get("running"), "enabled": st.get("enabled"), "backend": True})
                return True
            if path == "/api/autopilot/log" and method in ("GET", "HEAD"):
                limit = 80
                try:
                    limit = int((qs.get("limit") or ["80"])[0])
                except Exception:
                    pass
                self._json(200, {"ok": True, "log": eng.get_log(limit)})
                return True
            if path == "/api/autopilot/config" and method in ("GET", "HEAD"):
                self._json(200, {"ok": True, "cfg": eng.cfg})
                return True
            if path == "/api/autopilot/config" and method == "POST":
                self._json(200, {"ok": True, "status": eng.update_config(self._read_json_body())})
                return True
            if path == "/api/autopilot/start" and method == "POST":
                self._json(200, {"ok": True, "status": eng.start()})
                return True
            if path == "/api/autopilot/stop" and method == "POST":
                body = self._read_json_body()
                self._json(200, {"ok": True, "status": eng.stop(disable=bool(body.get("disable")))})
                return True
            if path == "/api/autopilot/force-cycle" and method == "POST":
                self._json(200, {"ok": True, "status": eng.force_cycle()})
                return True
            if path == "/api/autopilot/log/clear" and method == "POST":
                eng.clear_log()
                self._json(200, {"ok": True})
                return True
            if path.startswith("/api/autopilot/fleet/") and method == "POST":
                fid = path.split("/api/autopilot/fleet/", 1)[-1].strip("/")
                body = self._read_json_body()
                enabled = body.get("enabled")
                if enabled is None:
                    enabled = body.get("on", True)
                self._json(200, {"ok": True, "status": eng.set_fleet(fid, bool(enabled))})
                return True
            if path == "/api/autopilot/bridge" and method == "POST":
                body = self._read_json_body()
                bridge_dir = ROOT / "data" / "autopilot"
                bridge_dir.mkdir(parents=True, exist_ok=True)
                mapping = {
                    "events": "bridge_events.json",
                    "blocks": "bridge_blocks.json",
                    "art22": "bridge_art22.json",
                    "kpi": "bridge_kpi.json",
                }
                written = []
                for key, fname in mapping.items():
                    if key in body:
                        (bridge_dir / fname).write_text(
                            json.dumps(body[key], ensure_ascii=False, indent=2), encoding="utf-8"
                        )
                        written.append(key)
                try:
                    eng.log("info", "bridge " + ",".join(written or ["empty"]))
                except Exception:
                    pass
                self._json(200, {"ok": True, "written": written})
                return True
            self._json(404, {"ok": False, "error": "unknown_endpoint", "path": path})
            return True
        except Exception as e:
            self._json(500, {"ok": False, "error": str(e)})
            return True

    def do_GET(self) -> None:
        if self._api():
            return
        # default document
        if self.path in ("", "/"):
            self.path = "/index.html"
        try:
            super().do_GET()
        except Exception:
            pass

    def do_HEAD(self) -> None:
        if self._api():
            return
        if self.path in ("", "/"):
            self.path = "/index.html"
        try:
            super().do_HEAD()
        except Exception:
            pass

    def do_POST(self) -> None:
        if self._api():
            return
        self.send_error(405, "Method Not Allowed")


class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True
    request_queue_size = 128

    def handle_error(self, request, client_address) -> None:
        # MAI far cadere il server per un client
        pass

    def server_bind(self) -> None:
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()


def run_once() -> None:
    # avvia engine autopilot se disponibile
    if get_engine is not None:
        try:
            get_engine()
            log("AutoPilot engine online")
        except Exception as e:
            log(f"engine warn: {e}")

    httpd = Server((HOST, PORT), partial(Handler, directory=str(ROOT)))
    log(f"LISTENING http://{HOST}:{PORT}/  cwd={ROOT}")
    try:
        httpd.serve_forever(poll_interval=0.5)
    finally:
        try:
            httpd.server_close()
        except Exception:
            pass


def main() -> None:
    log("==== ELISEE UP START ====")
    # loop esterno: se qualcosa fa uscire serve_forever, riparte SUBITO nello stesso processo
    while True:
        try:
            run_once()
            log("serve_forever returned — restart in 0.3s")
        except KeyboardInterrupt:
            log("stop by keyboard")
            break
        except OSError as e:
            # porta occupata o bind fail
            log(f"OSError: {e} — retry 1s")
            time.sleep(1)
        except Exception:
            log("FATAL: " + traceback.format_exc()[-500:])
            time.sleep(1)


if __name__ == "__main__":
    main()
