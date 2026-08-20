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
from urllib.parse import parse_qs, quote, unquote, urlencode, urlparse

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
sys.path.insert(0, str(ROOT / "workers"))

PORT = int(os.environ.get("ELISEE_PORT", "8080"))
OAUTH_BRIDGE_PORT = int(os.environ.get("ELISEE_OAUTH_BRIDGE_PORT", "3000"))
HOST = "127.0.0.1"
LOG = ROOT / "data" / "autopilot" / "elisee_up.log"
OAUTH_BRIDGE_UP = False

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
        qs = parse_qs(parsed.query or "")
        # Google/Supabase può tornare su /?code=... — va scambiato SUBITO
        if self.command.upper() in ("GET", "HEAD") and (qs.get("code") or [""])[0]:
            if path in ("/", "/index.html", "/auth/callback"):
                return self._oauth_callback()
        # Proxy generico anti-CORS (Tuttocampo / loghi)
        if path == "/api/proxy" and self.command in ("GET", "HEAD"):
            qs = parse_qs(parsed.query or "")
            target = (qs.get("url") or [""])[0]
            target = unquote(target or "").strip()
            if not target:
                self._json(400, {"ok": False, "error": "missing_url"})
                return True
            return self._proxy_fetch(target)
        if path.startswith("/api/auth") or path == "/auth/callback":
            return self._auth_api(path, self.command.upper())
        if path.startswith("/api/manager"):
            return self._manager_api(path, self.command.upper())
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
        parsed = urlparse(self.path)
        if parsed.path in ("", "/"):
            self.path = "/index.html" + (("?" + parsed.query) if parsed.query else "")
        try:
            super().do_GET()
        except Exception:
            pass

    def do_HEAD(self) -> None:
        if self._api():
            return
        parsed = urlparse(self.path)
        if parsed.path in ("", "/"):
            self.path = "/index.html" + (("?" + parsed.query) if parsed.query else "")
        try:
            super().do_HEAD()
        except Exception:
            pass

    def _bearer(self) -> str:
        h = self.headers.get("Authorization") or self.headers.get("authorization") or ""
        if h.lower().startswith("bearer "):
            return h[7:].strip()
        return ""

    def _auth_api(self, path: str, method: str) -> bool:
        try:
            from auth_store import (
                build_google_oauth_url,
                finish_supabase_session,
                get_user_by_token,
                login_email,
                login_or_register_google,
                login_or_register_supabase_token,
                public_auth_config,
                register_email,
                revoke_token,
                save_google_client_id,
                set_password,
            )
        except Exception as e:
            self._json(503, {"ok": False, "error": "auth_store_unavailable", "detail": str(e)})
            return True
        try:
            if path == "/api/auth/config" and method in ("GET", "HEAD"):
                self._json(200, public_auth_config())
                return True
            if path == "/api/auth/oauth/google" and method in ("GET", "HEAD"):
                return self._start_google_oauth()
            if path == "/auth/callback" and method in ("GET", "HEAD"):
                return self._oauth_callback()
            if path == "/api/auth/oauth/finish" and method == "POST":
                body = self._read_json_body()
                status, payload = finish_supabase_session(
                    str(body.get("code") or ""),
                    str(body.get("state") or body.get("es_state") or "") or None,
                )
                self._json(status, payload)
                return True
            if path == "/api/auth/me" and method in ("GET", "HEAD"):
                user = get_user_by_token(self._bearer())
                if not user:
                    self._json(401, {"ok": False, "error": "non_autenticato"})
                    return True
                self._json(200, {"ok": True, "user": user})
                return True
            if path == "/api/auth/register" and method == "POST":
                code, payload = register_email(self._read_json_body())
                self._json(code, payload)
                return True
            if path == "/api/auth/login" and method == "POST":
                code, payload = login_email(self._read_json_body())
                self._json(code, payload)
                return True
            if path == "/api/auth/google" and method == "POST":
                body = self._read_json_body()
                code, payload = login_or_register_google(str(body.get("idToken") or ""), body)
                self._json(code, payload)
                return True
            if path == "/api/auth/logout" and method == "POST":
                revoke_token(self._bearer())
                self._json(200, {"ok": True})
                return True
            if path == "/api/auth/set-password" and method == "POST":
                body = self._read_json_body()
                code, payload = set_password(self._bearer(), str(body.get("password") or ""))
                self._json(code, payload)
                return True
            if path == "/api/auth/supabase" and method == "POST":
                body = self._read_json_body()
                code, payload = login_or_register_supabase_token(
                    str(body.get("accessToken") or body.get("access_token") or ""),
                    body,
                )
                self._json(code, payload)
                return True
            if path == "/api/auth/config" and method == "POST":
                body = self._read_json_body()
                code, payload = save_google_client_id(str(body.get("googleClientId") or ""))
                self._json(code, payload)
                return True
            self._json(404, {"ok": False, "error": "unknown_auth_endpoint", "path": path})
            return True
        except Exception as e:
            log("auth_api: " + str(e))
            self._json(500, {"ok": False, "error": str(e)})
            return True

    def _manager_user(self):
        try:
            from auth_store import get_user_by_token
            return get_user_by_token(self._bearer())
        except Exception:
            return None

    def _is_admin_req(self) -> bool:
        key = (self.headers.get("X-Elisee-Admin") or self.headers.get("x-elisee-admin") or "").strip()
        if key in ("admin123", "1", "true", "admin"):
            return True
        # stesso modello dell'area admin attuale
        return False

    def _manager_api(self, path: str, method: str) -> bool:
        try:
            from manager_store import admin_inbox, apply_as_manager, decide, my_view, propose_change
        except Exception as e:
            self._json(503, {"ok": False, "error": "manager_store_unavailable", "detail": str(e)})
            return True
        if method == "OPTIONS":
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Elisee-Admin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.end_headers()
            return True
        try:
            user = self._manager_user()
            if path in ("/api/manager", "/api/manager/me") and method in ("GET", "HEAD"):
                parsed = urlparse(self.path)
                qs = parse_qs(parsed.query or "")
                view = (qs.get("view") or ["me"])[0]
                if view == "admin":
                    if not self._is_admin_req():
                        self._json(401, {"ok": False, "error": "admin_richiesto"})
                        return True
                    self._json(200, admin_inbox())
                    return True
                email = (qs.get("email") or [""])[0]
                self._json(200, my_view(user, email))
                return True
            if path == "/api/manager" and method == "POST":
                body = self._read_json_body()
                action = str(body.get("action") or "").strip()
                if action == "apply":
                    code, payload = apply_as_manager(user, body)
                    self._json(code, payload)
                    return True
                if action == "propose":
                    code, payload = propose_change(user, body)
                    self._json(code, payload)
                    return True
                if action == "decide":
                    if not self._is_admin_req():
                        self._json(401, {"ok": False, "error": "admin_richiesto"})
                        return True
                    kind = str(body.get("kind") or "proposal")
                    item_id = str(body.get("id") or "")
                    accept = bool(body.get("accept"))
                    comment = str(body.get("comment") or "")
                    code, payload = decide(kind, item_id, accept, comment)
                    self._json(code, payload)
                    return True
                self._json(400, {"ok": False, "error": "azione_sconosciuta"})
                return True
            self._json(404, {"ok": False, "error": "unknown_manager_endpoint", "path": path})
            return True
        except Exception as e:
            log("manager_api: " + str(e))
            self._json(500, {"ok": False, "error": str(e)})
            return True

    def _site_origin(self) -> str:
        host = (self.headers.get("Host") or f"{HOST}:{PORT}").split(",")[0].strip()
        if "localhost:3000" in host or host.endswith(":3000"):
            return f"http://{HOST}:{PORT}"
        if host:
            return "http://" + host
        return f"http://{HOST}:{PORT}"

    def _append_query(self, url: str, extra: dict) -> str:
        """Metti SEMPRE i query param prima del fragment.
        Mai produrre #hero?elisee_token=... (il browser lo tratta come hash)."""
        raw = (url or "").strip() or "/"
        frag = ""
        if "#" in raw:
            raw, frag = raw.split("#", 1)
            frag = frag.split("?", 1)[0]
        query = ""
        if "?" in raw:
            raw, query = raw.split("?", 1)
        qs = parse_qs(query, keep_blank_values=False)
        for key, val in extra.items():
            if val is None or val == "":
                qs.pop(key, None)
            else:
                qs[key] = [str(val)]
        clean_q = urlencode({k: v[0] for k, v in qs.items() if v}, doseq=False)
        out = raw + (("?" + clean_q) if clean_q else "")
        if frag:
            out += "#" + frag.lstrip("#")
        return out

    def _safe_return_to(self, raw: str) -> str:
        origin = f"http://{HOST}:{PORT}"
        raw = (raw or "").strip()
        if not raw:
            return origin + "/"
        if raw.startswith("/") and not raw.startswith("//"):
            raw = origin + raw
        try:
            p = urlparse(raw)
        except Exception:
            return origin + "/"
        if p.scheme in ("http", "https") and p.hostname in ("127.0.0.1", "localhost"):
            qs = parse_qs(p.query or "")
            for junk in (
                "code",
                "state",
                "es_state",
                "elisee_token",
                "elisee_oauth_error",
                "needsPassword",
            ):
                qs.pop(junk, None)
            clean_q = urlencode({k: v[0] for k, v in qs.items() if v}, doseq=False)
            path = p.path or "/"
            frag = (p.fragment or "").split("?", 1)[0].lstrip("#")
            blocked = ("minigioco", "dossier", "account", "admin")
            if any(bit in frag.lower() for bit in blocked):
                frag = "hero"
            out = f"{p.scheme}://{p.hostname}{(':' + str(p.port)) if p.port else ''}{path}"
            if clean_q:
                out += "?" + clean_q
            if frag:
                out += "#" + frag
            return out
        return origin + "/"

    def _redirect(self, location: str) -> bool:
        self.send_response(302)
        self.send_header("Location", location)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        return True

    def _start_google_oauth(self) -> bool:
        from auth_store import build_google_oauth_url

        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query or "")
        next_url = (qs.get("next") or [""])[0]
        return_to = self._safe_return_to(next_url)
        # Google/Supabase in questo progetto torna su 127.0.0.1:8080/?code=
        redirect_to = f"http://{HOST}:{PORT}/"
        code, payload = build_google_oauth_url(redirect_to, return_to)
        if code != 200 or not payload.get("url"):
            err = quote(str(payload.get("error") or "oauth_start_fail"))
            return self._redirect(self._append_query(return_to, {"elisee_oauth_error": err}))
        return self._redirect(str(payload["url"]))

    def _oauth_callback(self) -> bool:
        from auth_store import finish_supabase_session

        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query or "")
        err = (qs.get("error_description") or qs.get("error") or [""])[0]
        origin = f"http://{HOST}:{PORT}"
        if err:
            return self._redirect(origin + "/index.html?elisee_oauth_error=" + quote(err))
        code = (qs.get("code") or [""])[0]
        state = (qs.get("es_state") or qs.get("state") or [""])[0]
        if not code:
            return self._redirect(origin + "/index.html?elisee_oauth_error=" + quote("Accesso Google annullato."))
        status, payload = finish_supabase_session(code, state)
        if status != 200 or not payload.get("token"):
            msg = str(payload.get("error") or "oauth_callback_fail")
            return self._redirect(origin + "/index.html?elisee_oauth_error=" + quote(msg))
        return_to = self._safe_return_to(str(payload.get("returnTo") or (origin + "/")))
        loc = self._append_query(
            return_to,
            {
                "elisee_token": str(payload.get("token") or ""),
                "needsPassword": "1" if payload.get("needsPassword") else "0",
            },
        )
        return self._redirect(loc)

    def do_POST(self) -> None:
        if self._api():
            return
        self.send_error(405, "Method Not Allowed")

    def do_OPTIONS(self) -> None:
        if self._api():
            return
        self.send_response(204)
        self.end_headers()


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


def start_oauth_bridge() -> None:
    global OAUTH_BRIDGE_UP
    if OAUTH_BRIDGE_UP:
        return
    try:
        bridge = Server((HOST, OAUTH_BRIDGE_PORT), partial(Handler, directory=str(ROOT)))
    except OSError as e:
        log(f"oauth bridge skip port {OAUTH_BRIDGE_PORT}: {e}")
        OAUTH_BRIDGE_UP = False
        return
    t = threading.Thread(target=bridge.serve_forever, kwargs={"poll_interval": 0.5}, daemon=True)
    t.start()
    OAUTH_BRIDGE_UP = True
    log(f"OAUTH BRIDGE http://localhost:{OAUTH_BRIDGE_PORT}/auth/callback")


def run_once() -> None:
    # avvia engine autopilot se disponibile
    if get_engine is not None:
        try:
            get_engine()
            log("AutoPilot engine online")
        except Exception as e:
            log(f"engine warn: {e}")

    start_oauth_bridge()
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
