# -*- coding: utf-8 -*-
"""ELISEE SCOUT — autenticazione reale (email + Google ID token)."""
from __future__ import annotations

import base64
import hashlib
import json
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUTH_DIR = ROOT / "data" / "auth"
USERS_PATH = AUTH_DIR / "users.json"
SESSIONS_PATH = AUTH_DIR / "sessions.json"
CONFIG_PATH = AUTH_DIR / "config.json"
OAUTH_STATES_PATH = AUTH_DIR / "oauth_states.json"

DEFAULT_SUPABASE_URL = "https://uautnlmnpxgbajtucuko.supabase.co"
DEFAULT_SUPABASE_ANON = "sb_publishable_1e-KMVmQHAf9GduUTMKn8Q_9ibW1BK_"

PBKDF2_ITERS = 180_000


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _read(path: Path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        pass
    return default


def _write(path: Path, data) -> None:
    AUTH_DIR.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def get_config() -> dict:
    cfg = _read(CONFIG_PATH, {})
    if not isinstance(cfg, dict):
        cfg = {}
    changed = False
    if "googleClientId" not in cfg:
        cfg["googleClientId"] = ""
        changed = True
    if not str(cfg.get("supabaseUrl") or "").strip():
        cfg["supabaseUrl"] = DEFAULT_SUPABASE_URL
        changed = True
    if not str(cfg.get("supabaseAnonKey") or "").strip():
        cfg["supabaseAnonKey"] = DEFAULT_SUPABASE_ANON
        changed = True
    if changed:
        _write(CONFIG_PATH, cfg)
    return cfg


def public_auth_config() -> dict:
    cfg = get_config()
    supabase_url = str(cfg.get("supabaseUrl") or "").strip()
    supabase_key = str(cfg.get("supabaseAnonKey") or "").strip()
    google_id = str(cfg.get("googleClientId") or "").strip()
    supabase_on = bool(supabase_url and supabase_key)
    return {
        "ok": True,
        "googleClientId": google_id,
        "googleEnabled": supabase_on or bool(google_id),
        "supabaseUrl": supabase_url,
        "supabaseAnonKey": supabase_key,
        "supabaseEnabled": supabase_on,
    }


def _users() -> list:
    data = _read(USERS_PATH, {"users": []})
    users = data.get("users") if isinstance(data, dict) else data
    return users if isinstance(users, list) else []


def _save_users(users: list) -> None:
    _write(USERS_PATH, {"users": users})


def _sessions() -> dict:
    data = _read(SESSIONS_PATH, {"sessions": {}})
    sess = data.get("sessions") if isinstance(data, dict) else {}
    return sess if isinstance(sess, dict) else {}


def _save_sessions(sess: dict) -> None:
    _write(SESSIONS_PATH, {"sessions": sess})


def _hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), PBKDF2_ITERS
    ).hex()
    return salt, digest


def _public_user(u: dict) -> dict:
    return {
        "id": u.get("id"),
        "email": u.get("email"),
        "nome": u.get("nome") or "",
        "cognome": u.get("cognome") or "",
        "ruolo": u.get("ruolo") or "",
        "role": u.get("ruolo") or "",
        "dob": u.get("dob") or "",
        "provider": u.get("provider") or "email",
        "team": u.get("team") or "",
        "squadra": u.get("squadra") or "",
        "status": u.get("status") or "Senza squadra · iscritto ELISEE",
        "statoTesserato": u.get("statoTesserato") or "Svincolato",
        "categoria": u.get("categoria") or "Iscritto ELISEE",
        "followers": u.get("followers") or 0,
        "consents": u.get("consents") or {},
        "registratoIl": u.get("createdAt"),
        "username": u.get("username") or (u.get("email") or "").split("@")[0],
        "roleConfirmedAt": u.get("roleConfirmedAt") or "",
        "verifyDocsDeadline": u.get("verifyDocsDeadline") or "",
        "docsAttachedAt": u.get("docsAttachedAt") or "",
        "badgeVerificaStato": u.get("badgeVerificaStato") or "none",
        "accountClosed": bool(u.get("accountClosed")),
        "accountClosedReason": u.get("accountClosedReason") or "",
        "needsIdentityDocument": bool(u.get("needsIdentityDocument")),
    }


GRACE_DAYS = 30
_SPECTATOR = ("spettatore", "tifoso")


def _is_spectator(u: dict) -> bool:
    r = str(u.get("ruolo") or u.get("role") or "").strip().lower()
    return r in _SPECTATOR


def _docs_ok(u: dict) -> bool:
    st = str(u.get("badgeVerificaStato") or "").strip().lower()
    if st in ("pending", "in_review", "approved", "temp_approved"):
        return True
    if u.get("docsAttachedAt"):
        return True
    if u.get("badgeDocumentUrl") or u.get("badgeSelfieUrl"):
        return True
    return False


def _ts(iso: str | None) -> float:
    raw = str(iso or "").strip().replace("Z", "")
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return time.mktime(time.strptime(raw[:19] if "T" in fmt else raw[:10], fmt))
        except Exception:
            continue
    return 0.0


def _plus_days(iso: str | None, days: int) -> str:
    base = _ts(iso) or time.time()
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(base + days * 86400))


def _apply_verify_rules(u: dict) -> bool:
    if not isinstance(u, dict):
        return False
    before = (
        u.get("verifyDocsDeadline"),
        bool(u.get("accountClosed")),
        u.get("roleConfirmedAt"),
        u.get("accountClosedReason"),
    )
    if u.get("accountClosed") or _is_spectator(u) or _docs_ok(u):
        return False
    ruolo = str(u.get("ruolo") or u.get("role") or "").strip()
    if not ruolo:
        return False
    if not u.get("verifyDocsDeadline"):
        u["roleConfirmedAt"] = u.get("roleConfirmedAt") or _now()
        u["verifyDocsDeadline"] = _plus_days(_now(), GRACE_DAYS)
        u["needsIdentityDocument"] = True
    elif _ts(u.get("verifyDocsDeadline")) and _ts(u.get("verifyDocsDeadline")) <= time.time():
        u["accountClosed"] = True
        u["accountClosedAt"] = _now()
        u["accountClosedReason"] = "docs_timeout"
        u["statusLegale"] = "closed_docs_timeout"
    after = (
        u.get("verifyDocsDeadline"),
        bool(u.get("accountClosed")),
        u.get("roleConfirmedAt"),
        u.get("accountClosedReason"),
    )
    return before != after


def _replace_user(u: dict) -> None:
    users = _users()
    uid = u.get("id")
    email = str(u.get("email") or "").strip().lower()
    for i, row in enumerate(users):
        if (uid and row.get("id") == uid) or (
            email and str(row.get("email") or "").strip().lower() == email
        ):
            users[i] = u
            _save_users(users)
            return
    users.append(u)
    _save_users(users)


def _find_by_email(email: str) -> dict | None:
    email = (email or "").strip().lower()
    if not email:
        return None
    for u in _users():
        if str(u.get("email") or "").strip().lower() == email:
            return u
    return None


def _create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    sess = _sessions()
    sess[token] = {"userId": user_id, "createdAt": _now()}
    # keep last 400 sessions
    if len(sess) > 400:
        items = sorted(sess.items(), key=lambda kv: kv[1].get("createdAt") or "")
        sess = dict(items[-400:])
    _save_sessions(sess)
    return token


def get_user_by_token(token: str) -> dict | None:
    if not token:
        return None
    sess = _sessions().get(token)
    if not sess:
        return None
    uid = sess.get("userId")
    for u in _users():
        if u.get("id") == uid:
            if _apply_verify_rules(u):
                _replace_user(u)
            return _public_user(u)
    return None


def revoke_token(token: str) -> None:
    sess = _sessions()
    if token in sess:
        sess.pop(token, None)
        _save_sessions(sess)


def register_email(payload: dict) -> tuple[int, dict]:
    nome = str(payload.get("nome") or "").strip()
    cognome = str(payload.get("cognome") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "")
    dob = str(payload.get("dob") or "").strip()
    ruolo = str(payload.get("ruolo") or payload.get("role") or "").strip()
    consents = payload.get("consents") if isinstance(payload.get("consents"), dict) else {}

    if not nome or not cognome:
        return 400, {"ok": False, "error": "nome_cognome_obbligatori"}
    if "@" not in email or "." not in email.split("@")[-1]:
        return 400, {"ok": False, "error": "email_non_valida"}
    if len(password) < 8:
        return 400, {"ok": False, "error": "password_corta"}
    if not ruolo:
        return 400, {"ok": False, "error": "ruolo_obbligatorio"}
    if _find_by_email(email):
        return 409, {"ok": False, "error": "email_gia_registrata"}

    salt, digest = _hash_password(password)
    user = {
        "id": "u_" + secrets.token_hex(8),
        "email": email,
        "nome": nome,
        "cognome": cognome,
        "ruolo": ruolo,
        "dob": dob,
        "provider": str(payload.get("provider") or "email").strip().lower() or "email",
        "password_salt": salt,
        "password_hash": digest,
        "team": "",
        "squadra": "",
        "status": "Senza squadra · iscritto ELISEE",
        "statoTesserato": "Svincolato",
        "categoria": "Iscritto ELISEE",
        "followers": 0,
        "consents": consents,
        "createdAt": _now(),
    }
    users = _users()
    users.append(user)
    _save_users(users)
    token = _create_session(user["id"])
    return 200, {"ok": True, "token": token, "user": _public_user(user)}


def login_email(payload: dict) -> tuple[int, dict]:
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "")
    user = _find_by_email(email)
    if not user or not user.get("password_hash"):
        return 401, {"ok": False, "error": "credenziali_non_valide"}
    salt = user.get("password_salt") or ""
    _, digest = _hash_password(password, salt)
    if digest != user.get("password_hash"):
        return 401, {"ok": False, "error": "credenziali_non_valide"}
    if _apply_verify_rules(user):
        _replace_user(user)
    if user.get("accountClosed"):
        return 403, {
            "ok": False,
            "error": "account_chiuso",
            "reason": user.get("accountClosedReason") or "docs_timeout",
        }
    token = _create_session(user["id"])
    return 200, {"ok": True, "token": token, "user": _public_user(user)}


def verify_google_id_token(id_token: str) -> dict | None:
    if not id_token:
        return None
    cfg = get_config()
    client_id = str(cfg.get("googleClientId") or "").strip()
    url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})
    req = urllib.request.Request(url, headers={"User-Agent": "EliseeScoutAuth/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None
    if not isinstance(data, dict) or not data.get("email"):
        return None
    if data.get("email_verified") not in (True, "true"):
        return None
    if client_id and data.get("aud") and data.get("aud") != client_id:
        return None
    return data


def set_password(token: str, password: str) -> tuple[int, dict]:
    password = str(password or "")
    if len(password) < 8:
        return 400, {"ok": False, "error": "password_corta"}
    user_pub = get_user_by_token(token)
    if not user_pub:
        return 401, {"ok": False, "error": "non_autenticato"}
    users = _users()
    for u in users:
        if u.get("id") == user_pub.get("id"):
            salt, digest = _hash_password(password)
            u["password_salt"] = salt
            u["password_hash"] = digest
            _save_users(users)
            return 200, {"ok": True, "user": _public_user(u)}
    return 404, {"ok": False, "error": "utente_non_trovato"}


def save_google_client_id(client_id: str) -> tuple[int, dict]:
    client_id = str(client_id or "").strip()
    if not client_id or "apps.googleusercontent.com" not in client_id:
        return 400, {"ok": False, "error": "client_id_non_valido"}
    cfg = get_config()
    cfg["googleClientId"] = client_id
    _write(CONFIG_PATH, cfg)
    return 200, {"ok": True, "googleClientId": client_id, "googleEnabled": True}


def login_or_register_identity(
    email: str,
    nome: str = "",
    cognome: str = "",
    provider: str = "google",
    extras: dict | None = None,
    provider_sub: str = "",
) -> tuple[int, dict]:
    extras = extras or {}
    email = str(email or "").strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        return 400, {"ok": False, "error": "email_non_valida"}
    nome = str(nome or extras.get("nome") or "").strip() or "Utente"
    cognome = str(cognome or extras.get("cognome") or "").strip() or "Google"
    ruolo = str(extras.get("ruolo") or extras.get("role") or "Calciatore").strip() or "Calciatore"
    dob = str(extras.get("dob") or "").strip()
    user = _find_by_email(email)
    users = _users()
    if not user:
        user = {
            "id": "u_" + secrets.token_hex(8),
            "email": email,
            "nome": nome,
            "cognome": cognome,
            "ruolo": ruolo,
            "dob": dob,
            "provider": provider or "google",
            "google_sub": provider_sub or "",
            "password_salt": "",
            "password_hash": "",
            "team": "",
            "squadra": "",
            "status": "Senza squadra · iscritto ELISEE",
            "statoTesserato": "Svincolato",
            "categoria": "Iscritto ELISEE",
            "followers": 0,
            "consents": extras.get("consents") if isinstance(extras.get("consents"), dict) else {"tos": True, "privacy": True},
            "createdAt": _now(),
        }
        users.append(user)
        _save_users(users)
    else:
        if provider_sub:
            user["google_sub"] = provider_sub
        user["provider"] = user.get("provider") or (provider or "google")
        if nome and not user.get("nome"):
            user["nome"] = nome
        if cognome and not user.get("cognome"):
            user["cognome"] = cognome
        _save_users(users)
    if _apply_verify_rules(user):
        _replace_user(user)
    if user.get("accountClosed"):
        return 403, {
            "ok": False,
            "error": "account_chiuso",
            "reason": user.get("accountClosedReason") or "docs_timeout",
        }
    token = _create_session(user["id"])
    needs_password = not bool(user.get("password_hash"))
    return 200, {
        "ok": True,
        "token": token,
        "user": _public_user(user),
        "needsPassword": needs_password,
    }


def sync_verify_docs(token: str, body: dict | None) -> tuple[int, dict]:
    body = body or {}
    pub = get_user_by_token(token)
    if not pub:
        return 401, {"ok": False, "error": "non_autenticato"}
    raw = _find_by_email(str(pub.get("email") or ""))
    if not raw:
        return 404, {"ok": False, "error": "utente_non_trovato"}
    action = str(body.get("action") or "").strip().lower()
    if action == "start":
        if body.get("ruolo"):
            raw["ruolo"] = str(body.get("ruolo")).strip()
        raw["roleConfirmedAt"] = raw.get("roleConfirmedAt") or _now()
        if not raw.get("verifyDocsDeadline"):
            raw["verifyDocsDeadline"] = _plus_days(_now(), GRACE_DAYS)
        raw["needsIdentityDocument"] = not _is_spectator(raw)
    elif action == "docs":
        raw["docsAttachedAt"] = _now()
        raw["badgeVerificaStato"] = str(body.get("badgeVerificaStato") or "pending")
    elif action == "close":
        raw["accountClosed"] = True
        raw["accountClosedAt"] = _now()
        raw["accountClosedReason"] = str(body.get("reason") or "docs_timeout")
        raw["statusLegale"] = "closed_docs_timeout"
    _apply_verify_rules(raw)
    _replace_user(raw)
    if raw.get("accountClosed"):
        return 403, {
            "ok": False,
            "error": "account_chiuso",
            "reason": raw.get("accountClosedReason") or "docs_timeout",
            "user": _public_user(raw),
        }
    return 200, {"ok": True, "user": _public_user(raw)}


def login_or_register_google(id_token: str, extras: dict | None = None) -> tuple[int, dict]:
    extras = extras or {}
    info = verify_google_id_token(id_token)
    if not info:
        return 401, {"ok": False, "error": "google_token_non_valido"}
    email = str(info.get("email") or "").strip().lower()
    nome = str(extras.get("nome") or info.get("given_name") or "").strip() or "Utente"
    cognome = str(extras.get("cognome") or info.get("family_name") or "").strip() or "Google"
    return login_or_register_identity(
        email,
        nome=nome,
        cognome=cognome,
        provider="google",
        extras=extras,
        provider_sub=str(info.get("sub") or ""),
    )


def _oauth_states() -> dict:
    data = _read(OAUTH_STATES_PATH, {"states": {}})
    states = data.get("states") if isinstance(data, dict) else {}
    return states if isinstance(states, dict) else {}


def _save_oauth_states(states: dict) -> None:
    # keep last 40 pending states
    if len(states) > 40:
        items = sorted(states.items(), key=lambda kv: (kv[1] or {}).get("createdAt") or "")
        states = dict(items[-40:])
    _write(OAUTH_STATES_PATH, {"states": states})


def save_oauth_state(state: str, payload: dict) -> None:
    states = _oauth_states()
    states[state] = payload
    states["_latest"] = dict(payload)
    states["_latest"]["state"] = state
    _save_oauth_states(states)


def peek_oauth_state(state: str | None) -> dict | None:
    states = _oauth_states()
    rec = None
    if state and state in states:
        rec = states.get(state)
    elif states.get("_latest"):
        rec = states.get("_latest")
    return rec if isinstance(rec, dict) else None


def pop_oauth_state(state: str | None) -> dict | None:
    states = _oauth_states()
    rec = None
    if state and state in states:
        rec = states.pop(state, None)
    elif states.get("_latest"):
        rec = states.get("_latest")
        sid = rec.get("state") if isinstance(rec, dict) else None
        if sid:
            states.pop(sid, None)
        states.pop("_latest", None)
    if rec is not None:
        _save_oauth_states(states)
    return rec if isinstance(rec, dict) else None


def _pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


def build_google_oauth_url(redirect_to: str, return_to: str) -> tuple[int, dict]:
    cfg = get_config()
    base = str(cfg.get("supabaseUrl") or "").rstrip("/")
    if not base:
        return 503, {"ok": False, "error": "supabase_non_configurato"}
    verifier, challenge = _pkce_pair()
    state = secrets.token_urlsafe(24)
    callback = redirect_to.split("?")[0]
    save_oauth_state(
        state,
        {
            "verifier": verifier,
            "returnTo": return_to,
            "redirectTo": callback,
            "createdAt": _now(),
        },
    )
    q = urllib.parse.urlencode(
        {
            "provider": "google",
            "redirect_to": callback,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "prompt": "select_account",
            "access_type": "offline",
        }
    )
    return 200, {
        "ok": True,
        "url": base + "/auth/v1/authorize?" + q,
        "state": state,
    }


def exchange_supabase_code(code: str, verifier: str) -> dict | None:
    cfg = get_config()
    base = str(cfg.get("supabaseUrl") or "").rstrip("/")
    key = str(cfg.get("supabaseAnonKey") or "").strip()
    if not base or not key or not code or not verifier:
        return None
    body = json.dumps({"auth_code": code, "code_verifier": verifier}).encode("utf-8")
    req = urllib.request.Request(
        base + "/auth/v1/token?grant_type=pkce",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": key,
            "Authorization": "Bearer " + key,
            "User-Agent": "EliseeScoutAuth/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=18) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def supabase_user_from_access_token(access_token: str) -> dict | None:
    cfg = get_config()
    base = str(cfg.get("supabaseUrl") or "").rstrip("/")
    key = str(cfg.get("supabaseAnonKey") or "").strip()
    if not base or not key or not access_token:
        return None
    req = urllib.request.Request(
        base + "/auth/v1/user",
        headers={
            "apikey": key,
            "Authorization": "Bearer " + access_token,
            "User-Agent": "EliseeScoutAuth/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def finish_supabase_session(code: str, state: str | None) -> tuple[int, dict]:
    rec = peek_oauth_state(state)
    if not rec or not rec.get("verifier"):
        return 400, {"ok": False, "error": "oauth_state_scaduto"}
    payload = exchange_supabase_code(code, str(rec.get("verifier") or ""))
    if not payload:
        return 401, {"ok": False, "error": "oauth_scambio_fallito"}
    pop_oauth_state(state)
    user_info = payload.get("user") if isinstance(payload.get("user"), dict) else None
    if not user_info:
        user_info = supabase_user_from_access_token(str(payload.get("access_token") or ""))
    if not user_info:
        return 401, {"ok": False, "error": "oauth_utente_non_letto"}
    meta = user_info.get("user_metadata") if isinstance(user_info.get("user_metadata"), dict) else {}
    email = str(user_info.get("email") or meta.get("email") or "").strip().lower()
    full = str(meta.get("full_name") or meta.get("name") or "").strip()
    bits = full.split() if full else []
    nome = str(meta.get("given_name") or (bits[0] if bits else "") or "").strip() or "Utente"
    cognome = str(meta.get("family_name") or (" ".join(bits[1:]) if len(bits) > 1 else "") or "").strip() or "Google"
    code_n, body = login_or_register_identity(
        email,
        nome=nome,
        cognome=cognome,
        provider="google",
        extras={"consents": {"tos": True, "privacy": True}},
        provider_sub=str(user_info.get("id") or meta.get("sub") or ""),
    )
    if code_n == 200:
        body["returnTo"] = rec.get("returnTo") or ""
    return code_n, body


def login_or_register_supabase_token(access_token: str, extras: dict | None = None) -> tuple[int, dict]:
    info = supabase_user_from_access_token(access_token)
    if not info:
        return 401, {"ok": False, "error": "supabase_token_non_valido"}
    meta = info.get("user_metadata") if isinstance(info.get("user_metadata"), dict) else {}
    email = str(info.get("email") or meta.get("email") or "").strip().lower()
    full = str(meta.get("full_name") or meta.get("name") or "").strip()
    bits = full.split() if full else []
    nome = str((extras or {}).get("nome") or meta.get("given_name") or (bits[0] if bits else "") or "").strip() or "Utente"
    cognome = str((extras or {}).get("cognome") or meta.get("family_name") or (" ".join(bits[1:]) if len(bits) > 1 else "") or "").strip() or "Google"
    return login_or_register_identity(
        email,
        nome=nome,
        cognome=cognome,
        provider="google",
        extras=extras,
        provider_sub=str(info.get("id") or ""),
    )
