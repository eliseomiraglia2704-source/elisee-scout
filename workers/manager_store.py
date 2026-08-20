# -*- coding: utf-8 -*-
"""ELISEE SCOUT — Manager Elisee Scout (stile TC Manager)."""
from __future__ import annotations

import json
import secrets
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "manager"
STATE_PATH = DATA_DIR / "state.json"
CATALOG_PATH = ROOT / "data" / "squadre" / "catalog.json"

ALLOWED_FIELDS = (
    "name",
    "city",
    "stadium",
    "capacity",
    "logo",
    "year",
    "stadiumImage",
)

FIELD_LABELS = {
    "name": "Nome squadra",
    "city": "Città",
    "stadium": "Stadio",
    "capacity": "Capienza",
    "logo": "Logo (URL o percorso)",
    "year": "Anno fondazione",
    "stadiumImage": "Foto stadio (URL)",
}


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
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def _state() -> dict:
    st = _read(STATE_PATH, {})
    if not isinstance(st, dict):
        st = {}
    st.setdefault("applications", [])
    st.setdefault("proposals", [])
    st.setdefault("managers", [])
    return st


def _save(st: dict) -> None:
    _write(STATE_PATH, st)


def _uid() -> str:
    return time.strftime("%Y%m%d") + "-" + secrets.token_hex(4)


def _public_app(a: dict) -> dict:
    return {
        "id": a.get("id"),
        "teamId": a.get("teamId"),
        "teamName": a.get("teamName"),
        "league": a.get("league") or "",
        "name": a.get("name") or "",
        "email": a.get("email") or "",
        "phone": a.get("phone") or "",
        "roleAtClub": a.get("roleAtClub") or "",
        "motivation": a.get("motivation") or "",
        "userId": a.get("userId") or "",
        "status": a.get("status") or "pending",
        "createdAt": a.get("createdAt"),
        "decidedAt": a.get("decidedAt"),
        "adminComment": a.get("adminComment") or "",
    }


def _public_prop(p: dict) -> dict:
    return {
        "id": p.get("id"),
        "teamId": p.get("teamId"),
        "teamName": p.get("teamName"),
        "league": p.get("league") or "",
        "name": p.get("name") or "",
        "email": p.get("email") or "",
        "userId": p.get("userId") or "",
        "changes": p.get("changes") or {},
        "note": p.get("note") or "",
        "status": p.get("status") or "pending",
        "createdAt": p.get("createdAt"),
        "decidedAt": p.get("decidedAt"),
        "adminComment": p.get("adminComment") or "",
        "applied": bool(p.get("applied")),
    }


def _identity(user: dict | None, body: dict) -> dict:
    user = user or {}
    nome = str(body.get("name") or "").strip()
    if not nome:
        bits = [user.get("nome") or "", user.get("cognome") or ""]
        nome = " ".join(b for b in bits if b).strip() or str(user.get("email") or "").strip()
    email = str(body.get("email") or user.get("email") or "").strip().lower()
    return {
        "name": nome,
        "email": email,
        "userId": str(user.get("id") or ""),
        "phone": str(body.get("phone") or "").strip(),
    }


def is_manager_of(email: str, user_id: str, team_id: str) -> bool:
    st = _state()
    email = (email or "").strip().lower()
    user_id = str(user_id or "")
    team_id = str(team_id or "")
    for m in st["managers"]:
        if m.get("teamId") != team_id:
            continue
        if email and str(m.get("email") or "").lower() == email:
            return True
        if user_id and str(m.get("userId") or "") == user_id:
            return True
    return False


def my_view(user: dict | None, email_hint: str = "") -> dict:
    st = _state()
    email = str((user or {}).get("email") or email_hint or "").strip().lower()
    uid = str((user or {}).get("id") or "")

    def mine(row: dict) -> bool:
        if email and str(row.get("email") or "").lower() == email:
            return True
        if uid and str(row.get("userId") or "") == uid:
            return True
        return False

    apps = [_public_app(a) for a in st["applications"] if mine(a)]
    props = [_public_prop(p) for p in st["proposals"] if mine(p)]
    teams = [
        {"teamId": m.get("teamId"), "teamName": m.get("teamName"), "league": m.get("league") or ""}
        for m in st["managers"]
        if (email and str(m.get("email") or "").lower() == email)
        or (uid and str(m.get("userId") or "") == uid)
    ]
    return {"ok": True, "applications": apps, "proposals": props, "teams": teams, "fields": FIELD_LABELS}


def apply_as_manager(user: dict | None, body: dict) -> tuple[int, dict]:
    ident = _identity(user, body)
    team_id = str(body.get("teamId") or "").strip()
    team_name = str(body.get("teamName") or "").strip()
    if not team_id or not team_name:
        return 400, {"ok": False, "error": "squadra_mancante"}
    if not ident["email"] or not ident["name"]:
        return 400, {"ok": False, "error": "nome_email_obbligatori"}
    role = str(body.get("roleAtClub") or "").strip()
    motivation = str(body.get("motivation") or "").strip()
    if len(motivation) < 12:
        return 400, {"ok": False, "error": "motivazione_troppo_corta"}
    st = _state()
    if is_manager_of(ident["email"], ident["userId"], team_id):
        return 409, {"ok": False, "error": "gia_manager"}
    for a in st["applications"]:
        if a.get("status") != "pending":
            continue
        same_team = a.get("teamId") == team_id
        same_person = str(a.get("email") or "").lower() == ident["email"]
        if same_team and same_person:
            return 409, {"ok": False, "error": "candidatura_gia_inviata"}
    row = {
        "id": _uid(),
        "teamId": team_id,
        "teamName": team_name,
        "league": str(body.get("league") or "").strip(),
        "roleAtClub": role or "Dirigente / collaboratore",
        "motivation": motivation,
        "status": "pending",
        "createdAt": _now(),
        **ident,
    }
    st["applications"].insert(0, row)
    _save(st)
    return 200, {"ok": True, "application": _public_app(row)}


def propose_change(user: dict | None, body: dict) -> tuple[int, dict]:
    ident = _identity(user, body)
    team_id = str(body.get("teamId") or "").strip()
    team_name = str(body.get("teamName") or "").strip()
    if not team_id:
        return 400, {"ok": False, "error": "squadra_mancante"}
    if not is_manager_of(ident["email"], ident["userId"], team_id):
        return 403, {"ok": False, "error": "non_sei_manager"}
    raw = body.get("changes") if isinstance(body.get("changes"), dict) else {}
    changes = {}
    for key in ALLOWED_FIELDS:
        if key not in raw:
            continue
        val = raw.get(key)
        if val is None:
            continue
        text = str(val).strip()
        if not text:
            continue
        if key == "capacity":
            try:
                changes[key] = int(str(text).replace(".", "").replace(",", ""))
            except Exception:
                continue
        else:
            changes[key] = text
    if not changes:
        return 400, {"ok": False, "error": "nessuna_modifica"}
    st = _state()
    row = {
        "id": _uid(),
        "teamId": team_id,
        "teamName": team_name or team_id,
        "league": str(body.get("league") or "").strip(),
        "changes": changes,
        "note": str(body.get("note") or "").strip(),
        "status": "pending",
        "createdAt": _now(),
        "applied": False,
        **ident,
    }
    st["proposals"].insert(0, row)
    _save(st)
    return 200, {"ok": True, "proposal": _public_prop(row)}


def admin_inbox() -> dict:
    st = _state()
    pending_a = sum(1 for a in st["applications"] if a.get("status") == "pending")
    pending_p = sum(1 for p in st["proposals"] if p.get("status") == "pending")
    return {
        "ok": True,
        "counts": {
            "applicationsPending": pending_a,
            "proposalsPending": pending_p,
            "managers": len(st["managers"]),
        },
        "applications": [_public_app(a) for a in st["applications"]],
        "proposals": [_public_prop(p) for p in st["proposals"]],
        "managers": st["managers"],
        "fields": FIELD_LABELS,
    }


def _apply_to_catalog(team_id: str, changes: dict) -> bool:
    cat = _read(CATALOG_PATH, {})
    teams = cat.get("teams") if isinstance(cat, dict) else None
    if not isinstance(teams, list):
        return False
    hit = None
    for t in teams:
        if str(t.get("id") or "") == team_id:
            hit = t
            break
    if not hit:
        return False
    for key, val in changes.items():
        if key not in ALLOWED_FIELDS:
            continue
        hit[key] = val
    cat["updatedAt"] = time.strftime("%Y-%m-%d")
    CATALOG_PATH.write_text(
        json.dumps(cat, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    return True


def decide(kind: str, item_id: str, accept: bool, comment: str = "") -> tuple[int, dict]:
    st = _state()
    bucket = "applications" if kind == "application" else "proposals"
    rows = st.get(bucket) or []
    row = None
    for r in rows:
        if r.get("id") == item_id:
            row = r
            break
    if not row:
        return 404, {"ok": False, "error": "non_trovata"}
    if row.get("status") != "pending":
        return 409, {"ok": False, "error": "gia_decisa"}
    row["status"] = "accepted" if accept else "declined"
    row["decidedAt"] = _now()
    row["adminComment"] = str(comment or "").strip()
    applied = False
    if accept and kind == "application":
        st["managers"].append(
            {
                "teamId": row.get("teamId"),
                "teamName": row.get("teamName"),
                "league": row.get("league") or "",
                "email": row.get("email"),
                "userId": row.get("userId") or "",
                "name": row.get("name") or "",
                "since": _now(),
            }
        )
    if accept and kind == "proposal":
        applied = _apply_to_catalog(str(row.get("teamId") or ""), row.get("changes") or {})
        row["applied"] = applied
    _save(st)
    out = _public_app(row) if kind == "application" else _public_prop(row)
    return 200, {"ok": True, "item": out, "applied": applied}
