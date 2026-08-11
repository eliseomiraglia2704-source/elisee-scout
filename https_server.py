#!/usr/bin/env python3
"""
Server HTTPS locale per Elisee Scout.

- TLS 1.2 / 1.3 (OpenSSL di sistema via Python ssl)
- Certificati self-signed in ssl/cert.pem + ssl/key.pem
- Security headers (HSTS disattivato in locale per evitare lock-in su cert non fidato)
- Redirect HTTP opzionale sulla porta --http-port

Uso:
  python https_server.py
  python https_server.py --port 8443
  python https_server.py --port 8443 --http-port 8765
"""
from __future__ import annotations

import argparse
import os
import ssl
import sys
import threading
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
SSL_DIR = ROOT / "ssl"
CERT_FILE = SSL_DIR / "cert.pem"
KEY_FILE = SSL_DIR / "key.pem"
DEFAULT_HTTPS_PORT = 8443
DEFAULT_HTTP_PORT = 8765

# AutoPilot engine (in-process, same origin → no mixed content)
sys.path.insert(0, str(ROOT / "workers"))
try:
    from autopilot_engine import get_engine  # type: ignore
except Exception as _ap_import_err:  # pragma: no cover
    get_engine = None  # type: ignore
    _AP_IMPORT_ERROR = _ap_import_err
else:
    _AP_IMPORT_ERROR = None


SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=0",  # no HSTS lock-in su self-signed
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob: https:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'self'; "
        "base-uri 'self'; "
        "form-action 'self'"
    ),
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
}


class SecureHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Handler statico + API AutoPilot backend (/api/autopilot/*)."""

    protocol_version = "HTTP/1.1"
    server_version = "EliseeScoutHTTPS/1.1"

    def end_headers(self) -> None:
        for name, value in SECURITY_HEADERS.items():
            self.send_header(name, value)
        # Cache corta su asset statici; HTML sempre revalidato
        path = self.path.split("?", 1)[0]
        # Service worker e HTML: sempre revalidati (evita SW stale + flash errore)
        if path.endswith("/sw.js") or path == "/sw.js" or path.endswith(".html") or path in ("/", ""):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Service-Worker-Allowed", "/")
        elif path.endswith((".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".woff2")):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _json(self, code: int, payload: object) -> None:
        raw = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(raw)

    def _read_json_body(self) -> dict:
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = 0
        if n <= 0:
            return {}
        raw = self.rfile.read(n)
        try:
            data = json.loads(raw.decode("utf-8"))
            return data if isinstance(data, dict) else {"data": data}
        except Exception:
            return {}

    def _handle_autopilot_api(self) -> bool:
        """Return True if request was handled as AutoPilot API."""
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if not path.startswith("/api/autopilot"):
            return False

        if get_engine is None:
            self._json(
                503,
                {
                    "ok": False,
                    "error": "autopilot_engine_unavailable",
                    "detail": str(_AP_IMPORT_ERROR),
                },
            )
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
                self._json(
                    200,
                    {
                        "ok": True,
                        "running": st.get("running"),
                        "enabled": st.get("enabled"),
                        "lastHealth": st.get("lastHealth"),
                        "backend": True,
                    },
                )
                return True

            if path == "/api/autopilot/log" and method in ("GET", "HEAD"):
                try:
                    limit = int((qs.get("limit") or ["80"])[0])
                except ValueError:
                    limit = 80
                self._json(200, {"ok": True, "log": eng.get_log(limit)})
                return True

            if path == "/api/autopilot/config" and method in ("GET", "HEAD"):
                self._json(200, {"ok": True, "cfg": eng.cfg})
                return True

            if path == "/api/autopilot/config" and method == "POST":
                body = self._read_json_body()
                self._json(200, {"ok": True, "status": eng.update_config(body)})
                return True

            if path == "/api/autopilot/start" and method == "POST":
                self._json(200, {"ok": True, "status": eng.start()})
                return True

            if path == "/api/autopilot/stop" and method == "POST":
                body = self._read_json_body()
                self._json(
                    200,
                    {"ok": True, "status": eng.stop(disable=bool(body.get("disable")))},
                )
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
                # Frontend pushes localStorage snapshots for backend ops jobs
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
                            json.dumps(body[key], ensure_ascii=False, indent=2),
                            encoding="utf-8",
                        )
                        written.append(key)
                eng.log("info", "Bridge frontend ricevuto: " + ", ".join(written or ["(vuoto)"]))
                self._json(200, {"ok": True, "written": written})
                return True

            self._json(404, {"ok": False, "error": "unknown_endpoint", "path": path})
            return True
        except Exception as e:
            self._json(500, {"ok": False, "error": str(e)})
            return True

    def do_GET(self) -> None:
        if self._handle_autopilot_api():
            return
        super().do_GET()

    def do_HEAD(self) -> None:
        if self._handle_autopilot_api():
            return
        super().do_HEAD()

    def do_POST(self) -> None:
        if self._handle_autopilot_api():
            return
        self.send_error(405, "Method Not Allowed")

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write(f"[HTTPS] {self.address_string()} - {fmt % args}\n")


class RedirectHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Redirect 301 da HTTP verso HTTPS."""

    protocol_version = "HTTP/1.1"
    https_port = DEFAULT_HTTPS_PORT

    def do_GET(self) -> None:
        self._redirect()

    def do_HEAD(self) -> None:
        self._redirect()

    def do_POST(self) -> None:
        self._redirect()

    def _redirect(self) -> None:
        host = self.headers.get("Host", "127.0.0.1").split(":")[0]
        location = f"https://{host}:{self.https_port}{self.path}"
        self.send_response(301)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write(f"[HTTP→HTTPS] {self.address_string()} - {fmt % args}\n")


def ensure_certs() -> None:
    if CERT_FILE.is_file() and KEY_FILE.is_file():
        return
    gen = SSL_DIR / "generate_certs.py"
    if not gen.is_file():
        print(f"ERRORE: certificati mancanti e non trovo {gen}", file=sys.stderr)
        sys.exit(1)
    print("Certificati assenti: generazione self-signed...")
    import runpy

    runpy.run_path(str(gen), run_name="__main__")
    if not (CERT_FILE.is_file() and KEY_FILE.is_file()):
        print("ERRORE: generazione certificati fallita.", file=sys.stderr)
        sys.exit(1)


def build_ssl_context() -> ssl.SSLContext:
    # TLS 1.2 minimo; 1.3 se supportato da OpenSSL
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    try:
        ctx.maximum_version = ssl.TLSVersion.TLSv1_3
    except (AttributeError, ValueError):
        pass
    # Cipher suite moderne (AES-GCM / CHACHA20)
    try:
        ctx.set_ciphers(
            "ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS"
        )
    except ssl.SSLError:
        pass
    ctx.load_cert_chain(certfile=str(CERT_FILE), keyfile=str(KEY_FILE))
    return ctx


def run_https(port: int, directory: Path) -> ThreadingHTTPServer:
    os.chdir(directory)
    handler = partial(SecureHTTPRequestHandler, directory=str(directory))
    httpd = ThreadingHTTPServer(("0.0.0.0", port), handler)
    httpd.socket = build_ssl_context().wrap_socket(httpd.socket, server_side=True)
    return httpd


def run_http_redirect(http_port: int, https_port: int) -> ThreadingHTTPServer:
    RedirectHTTPRequestHandler.https_port = https_port
    return ThreadingHTTPServer(("0.0.0.0", http_port), RedirectHTTPRequestHandler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Elisee Scout — server HTTPS locale")
    parser.add_argument("--port", type=int, default=DEFAULT_HTTPS_PORT, help="Porta HTTPS (default 8443)")
    parser.add_argument(
        "--http-port",
        type=int,
        default=DEFAULT_HTTP_PORT,
        help="Porta HTTP che reindirizza a HTTPS (0 = disabilita, default 8765)",
    )
    parser.add_argument(
        "--dir",
        type=Path,
        default=ROOT,
        help="Directory radice del sito",
    )
    args = parser.parse_args()

    ensure_certs()
    directory = args.dir.resolve()

    # Avvia AutoPilot backend in-process (vive finché il server è up, anche senza browser)
    ap_status = "non disponibile"
    if get_engine is not None:
        try:
            eng = get_engine()
            st = eng.status()
            ap_status = (
                f"ONLINE · cicli={st.get('cycles')} · fleets={sum(1 for f in st.get('fleets') or [] if f.get('ok'))}"
                if st.get("running")
                else "standby"
            )
        except Exception as e:
            ap_status = f"errore avvio: {e}"
    else:
        ap_status = f"import fail: {_AP_IMPORT_ERROR}"

    https = run_https(args.port, directory)
    print("=" * 60)
    print("  ELISEE SCOUT — Server HTTPS + AutoPilot Backend")
    print("=" * 60)
    print(f"  TLS          : 1.2 / 1.3  (AES-GCM / CHACHA20)")
    print(f"  Certificato  : {CERT_FILE}")
    print(f"  Directory    : {directory}")
    print(f"  URL locale   : https://127.0.0.1:{args.port}/")
    print(f"                 https://localhost:{args.port}/")
    print(f"  AutoPilot API: https://127.0.0.1:{args.port}/api/autopilot/status")
    print(f"  AutoPilot    : {ap_status}")
    print()
    print("  Nota: certificato self-signed → il browser mostrerà un avviso.")
    print("  Clicca 'Avanzate' → 'Procedi a localhost' (solo in sviluppo).")
    print("  Produzione: sostituisci ssl/cert.pem e ssl/key.pem con cert CA.")
    print("=" * 60)

    if args.http_port and args.http_port > 0:
        try:
            http_srv = run_http_redirect(args.http_port, args.port)
            t = threading.Thread(target=http_srv.serve_forever, daemon=True)
            t.start()
            print(f"  Redirect HTTP : http://127.0.0.1:{args.http_port}/ → HTTPS :{args.port}")
        except OSError as e:
            print(f"  (HTTP redirect non avviato su :{args.http_port}: {e})")

    try:
        https.serve_forever()
    except KeyboardInterrupt:
        print("\nArresto server HTTPS + AutoPilot.")
        if get_engine is not None:
            try:
                get_engine().stop()
            except Exception:
                pass
    finally:
        https.server_close()


if __name__ == "__main__":
    main()
