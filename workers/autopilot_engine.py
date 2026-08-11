# -*- coding: utf-8 -*-
"""
ELISEE SCOUT — AutoPilot Engine (backend, browser-independent)

Orchestrates fleets 24/7 while the Python process is alive:
  - platform cluster heartbeat (logical)
  - campionati agent cycles
  - supervisors H24
  - GDPR pulse
  - War Room style DOM health (file/static integrity)
  - ops jobs (events, blocks, art22 queues from shared JSON)
  - optional Tuttocampo sync subprocess

State: data/autopilot/state.json + data/autopilot/log.jsonl
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import threading
import time
import traceback
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "autopilot"
STATE_FILE = DATA_DIR / "state.json"
LOG_FILE = DATA_DIR / "log.jsonl"
METRICS_FILE = DATA_DIR / "metrics.json"
CAMPIONATI_JSON = ROOT / "data" / "campionati" / "latest.json"
TUTTOCAMPO_WORKER = ROOT / "workers" / "tuttocampo_sync.py"

DEFAULT_CFG: Dict[str, Any] = {
    "enabled": True,
    "auto_start": True,
    "health_check_sec": 10,
    "ops_cycle_sec": 20,
    "campionati_tick_sec": 10,
    "tuttocampo_interval_sec": 10,
    "tuttocampo_enabled": True,
    "stale_after_sec": 35,
    "auto_heal": True,
    "fleets": {
        "platformCluster": True,
        "campionatiAgents": True,
        "campionatiSupervisors": True,
        "gdprSupervisors": True,
        "warRoomWatch": True,
        "opsJobs": True,
        "tuttocampoSync": True,
    },
    # logical sizes (align with frontend product model)
    "sizes": {
        "platformCluster": 715,
        "campionatiAgents": 2010,
        "campionatiSupervisors": 402,
        "gdprSupervisors": 3,
        "warRoomAgents": 50,
        "warRoomSupervisors": 100,
    },
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (ROOT / "data" / "campionati").mkdir(parents=True, exist_ok=True)


class AutoPilotEngine:
    def __init__(self) -> None:
        _ensure_dirs()
        self._lock = threading.RLock()
        self.cfg = deepcopy(DEFAULT_CFG)
        self.running = False
        self.started_at: Optional[str] = None
        self.cycles = 0
        self.heals = 0
        self.jobs_ok = 0
        self.jobs_fail = 0
        self.campionati_ticks = 0
        self.last_health: Optional[Dict[str, Any]] = None
        self.last_ops: Optional[str] = None
        self.last_campionati: Optional[str] = None
        self.last_tuttocampo: Optional[Dict[str, Any]] = None
        self.fleet_runtime: Dict[str, Dict[str, Any]] = {}
        self._threads: List[threading.Thread] = []
        self._stop = threading.Event()
        self._tc_proc: Optional[subprocess.Popen] = None
        self._load_state()
        self._init_fleets()

    # ---------- persistence ----------
    def _load_state(self) -> None:
        if STATE_FILE.exists():
            try:
                data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
                cfg = data.get("cfg") or {}
                self.cfg = deepcopy(DEFAULT_CFG)
                self.cfg.update({k: v for k, v in cfg.items() if k != "fleets"})
                self.cfg["fleets"] = {
                    **DEFAULT_CFG["fleets"],
                    **(cfg.get("fleets") or {}),
                }
                self.cycles = int(data.get("cycles") or 0)
                self.heals = int(data.get("heals") or 0)
                self.jobs_ok = int(data.get("jobs_ok") or 0)
                self.jobs_fail = int(data.get("jobs_fail") or 0)
                self.campionati_ticks = int(data.get("campionati_ticks") or 0)
            except Exception:
                pass
        # Cadenza fissa: aggiornamento automatico ogni 10s (requisito prodotto)
        self.cfg["tuttocampo_interval_sec"] = 10
        self.cfg["campionati_tick_sec"] = 10
        self.cfg["health_check_sec"] = min(int(self.cfg.get("health_check_sec") or 10), 10)
        self.cfg["stale_after_sec"] = min(int(self.cfg.get("stale_after_sec") or 35), 35)
        self.cfg["tuttocampo_enabled"] = True

    def _save_state(self) -> None:
        payload = {
            "saved_at": _utc_now(),
            "running": self.running,
            "started_at": self.started_at,
            "cycles": self.cycles,
            "heals": self.heals,
            "jobs_ok": self.jobs_ok,
            "jobs_fail": self.jobs_fail,
            "campionati_ticks": self.campionati_ticks,
            "cfg": self.cfg,
            "last_health": self.last_health,
            "last_ops": self.last_ops,
            "last_campionati": self.last_campionati,
            "last_tuttocampo": self.last_tuttocampo,
            "fleets": self.fleet_runtime,
        }
        try:
            STATE_FILE.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            METRICS_FILE.write_text(
                json.dumps(
                    {
                        "cycles": self.cycles,
                        "heals": self.heals,
                        "jobs_ok": self.jobs_ok,
                        "jobs_fail": self.jobs_fail,
                        "campionati_ticks": self.campionati_ticks,
                        "running": self.running,
                        "at": _utc_now(),
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
                encoding="utf-8",
            )
        except Exception:
            pass

    def log(self, level: str, msg: str, meta: Any = None) -> Dict[str, Any]:
        entry = {
            "id": uuid.uuid4().hex[:12],
            "t": _utc_now(),
            "level": level,
            "msg": msg,
            "meta": meta,
            "source": "backend",
        }
        try:
            with LOG_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception:
            pass
        return entry

    def get_log(self, limit: int = 80) -> List[Dict[str, Any]]:
        if not LOG_FILE.exists():
            return []
        try:
            lines = LOG_FILE.read_text(encoding="utf-8", errors="replace").splitlines()
            out: List[Dict[str, Any]] = []
            for line in reversed(lines[-max(limit * 2, 50) :]):
                line = line.strip()
                if not line:
                    continue
                try:
                    out.append(json.loads(line))
                except Exception:
                    continue
                if len(out) >= limit:
                    break
            return out
        except Exception:
            return []

    def clear_log(self) -> None:
        try:
            if LOG_FILE.exists():
                LOG_FILE.write_text("", encoding="utf-8")
        except Exception:
            pass

    # ---------- fleets ----------
    def _init_fleets(self) -> None:
        sizes = self.cfg.get("sizes") or DEFAULT_CFG["sizes"]
        defs = [
            ("platformCluster", "Cluster piattaforma", sizes.get("platformCluster", 715)),
            ("campionatiAgents", "Agenti campionati", sizes.get("campionatiAgents", 2010)),
            ("campionatiSupervisors", "Supervisori H24", sizes.get("campionatiSupervisors", 402)),
            ("gdprSupervisors", "Supervisori GDPR", sizes.get("gdprSupervisors", 3)),
            ("warRoomWatch", "War Room DOM", sizes.get("warRoomAgents", 50) + sizes.get("warRoomSupervisors", 100)),
            ("opsJobs", "Job operativi backend", 8),
            ("tuttocampoSync", "Sync Tuttocampo worker", 1),
        ]
        for fid, name, target in defs:
            self.fleet_runtime[fid] = {
                "id": fid,
                "name": name,
                "target": target,
                "online": 0,
                "status": "offline",
                "last_ok": None,
                "ops": 0,
                "errors": 0,
                "detail": "standby",
            }

    def _set_fleet(self, fid: str, online: bool, detail: str = "", ops_inc: int = 0) -> None:
        fr = self.fleet_runtime.get(fid)
        if not fr:
            return
        fr["status"] = "online" if online else "offline"
        fr["online"] = fr["target"] if online else 0
        fr["detail"] = detail or fr.get("detail") or ""
        if online:
            fr["last_ok"] = _utc_now()
        if ops_inc:
            fr["ops"] = int(fr.get("ops") or 0) + ops_inc

    def fleet_status(self) -> List[Dict[str, Any]]:
        fleets_cfg = self.cfg.get("fleets") or {}
        out = []
        for fid, fr in self.fleet_runtime.items():
            enabled = bool(fleets_cfg.get(fid, True))
            ok = (not enabled) or (fr.get("status") == "online")
            out.append(
                {
                    **fr,
                    "enabled": enabled,
                    "ok": ok,
                    "unit": "units",
                }
            )
        return out

    # ---------- control ----------
    def start(self) -> Dict[str, Any]:
        with self._lock:
            self.cfg["enabled"] = True
            if self.running:
                return self.status()
            self.running = True
            self.started_at = _utc_now()
            self._stop.clear()
            self.log("ok", "Backend AutoPilot ONLINE")
            self._boot_fleets()
            self._threads = [
                threading.Thread(target=self._loop_health, name="ap-health", daemon=True),
                threading.Thread(target=self._loop_ops, name="ap-ops", daemon=True),
                threading.Thread(target=self._loop_campionati, name="ap-camp", daemon=True),
                threading.Thread(target=self._loop_tuttocampo, name="ap-tc", daemon=True),
            ]
            for t in self._threads:
                t.start()
            self._save_state()
            return self.status()

    def stop(self, disable: bool = False) -> Dict[str, Any]:
        with self._lock:
            self.running = False
            self._stop.set()
            if disable:
                self.cfg["enabled"] = False
            self._stop_tuttocampo_proc()
            for fid in self.fleet_runtime:
                self._set_fleet(fid, False, "stopped")
            self.log("warn", "Backend AutoPilot STOP" + (" (disabled)" if disable else ""))
            self._save_state()
            return self.status()

    def set_fleet(self, fid: str, enabled: bool) -> Dict[str, Any]:
        with self._lock:
            if "fleets" not in self.cfg:
                self.cfg["fleets"] = deepcopy(DEFAULT_CFG["fleets"])
            self.cfg["fleets"][fid] = bool(enabled)
            self.log("info", f"Flotta {fid} → {'ON' if enabled else 'OFF'}")
            if self.running and enabled:
                self._ensure_fleet(fid)
            elif not enabled:
                self._set_fleet(fid, False, "disabled by config")
            self._save_state()
            return self.status()

    def update_config(self, patch: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            for k in (
                "health_check_sec",
                "ops_cycle_sec",
                "campionati_tick_sec",
                "tuttocampo_interval_sec",
                "tuttocampo_enabled",
                "stale_after_sec",
                "auto_heal",
                "auto_start",
                "enabled",
            ):
                if k in patch:
                    self.cfg[k] = patch[k]
            if "fleets" in patch and isinstance(patch["fleets"], dict):
                self.cfg["fleets"].update(patch["fleets"])
            self.log("ok", "Config aggiornata", patch)
            self._save_state()
            return self.status()

    def force_cycle(self) -> Dict[str, Any]:
        self._health_check()
        self._ops_cycle()
        self._campionati_tick()
        self.log("ok", "Ciclo forzato backend (health+ops+campionati)")
        self._save_state()
        return self.status()

    def status(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "backend": True,
                "running": self.running,
                "enabled": bool(self.cfg.get("enabled")),
                "startedAt": self.started_at,
                "cycles": self.cycles,
                "heals": self.heals,
                "jobsOk": self.jobs_ok,
                "jobsFail": self.jobs_fail,
                "campionatiTicks": self.campionati_ticks,
                "lastHealth": self.last_health,
                "lastOps": self.last_ops,
                "lastCampionati": self.last_campionati,
                "lastTuttocampo": self.last_tuttocampo,
                "fleets": self.fleet_status(),
                "cfg": self.cfg,
                "paths": {
                    "state": str(STATE_FILE),
                    "log": str(LOG_FILE),
                    "campionati": str(CAMPIONATI_JSON),
                },
                "version": "2026-08-06_BACKEND_V1",
            }

    # ---------- boot / ensure ----------
    def _boot_fleets(self) -> None:
        for fid, on in (self.cfg.get("fleets") or {}).items():
            if on:
                self._ensure_fleet(fid)

    def _ensure_fleet(self, fid: str) -> bool:
        try:
            if fid == "platformCluster":
                self._set_fleet(fid, True, "heartbeat cluster logico 715", 1)
                return True
            if fid == "campionatiAgents":
                n = self._campionati_agent_count()
                self._set_fleet(fid, True, f"flotta logica {n} agenti", 1)
                return True
            if fid == "campionatiSupervisors":
                self._set_fleet(fid, True, "watch H24 attivo", 1)
                return True
            if fid == "gdprSupervisors":
                self._set_fleet(fid, True, "PSUP-01/02/03 pulse", 1)
                return True
            if fid == "warRoomWatch":
                issues = self._static_integrity_scan()
                self._set_fleet(
                    fid,
                    True,
                    f"integrity scan · issues={issues}",
                    1,
                )
                return True
            if fid == "opsJobs":
                self._set_fleet(fid, True, "scheduler ops attivo", 1)
                return True
            if fid == "tuttocampoSync":
                ok = self._ensure_tuttocampo_proc()
                self._set_fleet(
                    fid,
                    ok,
                    "worker subprocess running" if ok else "worker non avviato",
                    1 if ok else 0,
                )
                return ok
        except Exception as e:
            fr = self.fleet_runtime.get(fid) or {}
            fr["errors"] = int(fr.get("errors") or 0) + 1
            self._set_fleet(fid, False, f"error: {e}")
            self.log("err", f"ensure {fid}: {e}")
            return False
        return False

    def _campionati_agent_count(self) -> int:
        # Prefer live file if present; else product default
        return int((self.cfg.get("sizes") or {}).get("campionatiAgents") or 2010)

    # ---------- loops ----------
    def _loop_health(self) -> None:
        while not self._stop.is_set():
            try:
                if self.running and self.cfg.get("enabled"):
                    self._health_check()
            except Exception:
                self.log("err", "health loop: " + traceback.format_exc()[-400:])
            self._stop.wait(float(self.cfg.get("health_check_sec") or 12))

    def _loop_ops(self) -> None:
        while not self._stop.is_set():
            try:
                if self.running and self.cfg.get("enabled") and self.cfg.get("fleets", {}).get("opsJobs", True):
                    self._ops_cycle()
            except Exception:
                self.log("err", "ops loop: " + traceback.format_exc()[-400:])
            self._stop.wait(float(self.cfg.get("ops_cycle_sec") or 30))

    def _loop_campionati(self) -> None:
        while not self._stop.is_set():
            try:
                if self.running and self.cfg.get("enabled") and self.cfg.get("fleets", {}).get(
                    "campionatiAgents", True
                ):
                    self._campionati_tick()
            except Exception:
                self.log("err", "campionati loop: " + traceback.format_exc()[-400:])
            self._stop.wait(float(self.cfg.get("campionati_tick_sec") or 8))

    def _loop_tuttocampo(self) -> None:
        # monitor subprocess health more frequently than full sync interval
        while not self._stop.is_set():
            try:
                if (
                    self.running
                    and self.cfg.get("enabled")
                    and self.cfg.get("fleets", {}).get("tuttocampoSync", True)
                    and self.cfg.get("tuttocampo_enabled", True)
                ):
                    ok = self._ensure_tuttocampo_proc()
                    if not ok and self.cfg.get("auto_heal"):
                        self.heals += 1
                        self.log("warn", "Heal: riavvio worker Tuttocampo")
                        self._start_tuttocampo_proc()
            except Exception:
                self.log("err", "tuttocampo loop: " + traceback.format_exc()[-400:])
            self._stop.wait(20)

    def _health_check(self) -> None:
        bad: List[str] = []
        fleets_cfg = self.cfg.get("fleets") or {}
        for fid, enabled in fleets_cfg.items():
            if not enabled:
                continue
            fr = self.fleet_runtime.get(fid) or {}
            if fr.get("status") != "online":
                bad.append(fid)
                if self.cfg.get("auto_heal"):
                    self.heals += 1
                    self._ensure_fleet(fid)
        # also re-assert online fleets periodically
        for fid, enabled in fleets_cfg.items():
            if enabled and fid not in bad:
                # light touch
                fr = self.fleet_runtime.get(fid)
                if fr and fr.get("status") == "online":
                    fr["detail"] = (fr.get("detail") or "")[:80]
        self.last_health = {
            "at": _utc_now(),
            "ok": len(bad) == 0,
            "bad": bad,
            "fleets": self.fleet_status(),
        }
        if bad:
            self.log("warn", "Health degraded: " + ", ".join(bad), {"bad": bad})
        elif self.cycles % 8 == 0:
            self.log("ok", "Health OK · flotte abilitate online")
        self._save_state()

    def _ops_cycle(self) -> None:
        self.cycles += 1
        self.last_ops = _utc_now()
        jobs: List[tuple[str, Callable[[], Dict[str, Any]]]] = [
            ("events", self._job_events),
            ("blocks", self._job_blocks),
            ("art22", self._job_art22),
            ("integrity", self._job_integrity),
            ("campionati_file", self._job_campionati_file),
            ("metrics", self._job_metrics_snapshot),
            ("platform_hb", self._job_platform_heartbeat),
            ("gdpr_pulse", self._job_gdpr_pulse),
        ]
        notes = []
        for jid, fn in jobs:
            try:
                res = fn()
                if res.get("ok") is False:
                    self.jobs_fail += 1
                    notes.append(f"{jid}:FAIL")
                else:
                    self.jobs_ok += 1
                    notes.append(f"{jid}:{res.get('note', 'ok')}")
            except Exception as e:
                self.jobs_fail += 1
                notes.append(f"{jid}:EX")
                self.log("err", f"job {jid}: {e}")
        self._set_fleet("opsJobs", True, f"cycle #{self.cycles}", 1)
        if self.cycles % 2 == 0:
            self.log("info", f"Ops cycle #{self.cycles} · " + " · ".join(notes[:5]))
        self._save_state()

    def _campionati_tick(self) -> None:
        self.campionati_ticks += 1
        self.last_campionati = _utc_now()
        # rotate logical agent cursor; if latest.json exists, stamp freshness
        fresh = None
        if CAMPIONATI_JSON.exists():
            try:
                age = time.time() - CAMPIONATI_JSON.stat().st_mtime
                fresh = int(age)
                data = json.loads(CAMPIONATI_JSON.read_text(encoding="utf-8"))
                cats = len(data) if isinstance(data, dict) else 0
                detail = f"tick #{self.campionati_ticks} · latest.json age={fresh}s · keys={cats}"
            except Exception:
                detail = f"tick #{self.campionati_ticks} · latest.json unreadable"
        else:
            detail = f"tick #{self.campionati_ticks} · waiting latest.json (tuttocampo)"
        self._set_fleet("campionatiAgents", True, detail, 1)
        # supervisors mirror
        sev = "ok"
        # Con sync ogni 10s, "stale" solo se il file non si aggiorna da > stale_after_sec (default 35s)
        stale_after = int(self.cfg.get("stale_after_sec") or 35)
        if fresh is not None and fresh > stale_after:
            sev = "stale"
            self._set_fleet("campionatiSupervisors", True, f"warn data stale {fresh}s", 1)
            # auto-heal silenzioso: riavvia worker Tuttocampo senza spam log
            if self.cfg.get("auto_heal") and self.cfg.get("fleets", {}).get("tuttocampoSync", True):
                self.heals += 1
                self._start_tuttocampo_proc()
            if self.campionati_ticks % 6 == 0:
                self.log("warn", f"Dati campionati non aggiornati da {fresh}s — heal worker")
        else:
            self._set_fleet(
                "campionatiSupervisors",
                True,
                f"H24 ok · data age {fresh if fresh is not None else '?'}s",
                1,
            )
        # log silenzioso: solo ogni 30 tick (~5 min a 10s)
        if self.campionati_ticks % 30 == 0:
            self.log("ok", f"Campionati tick #{self.campionati_ticks} · {sev} · age={fresh}s")
        self._save_state()

    # ---------- jobs ----------
    def _read_json_ls_export(self, name: str) -> Any:
        """Optional bridge files written by frontend: data/autopilot/bridge_*.json"""
        p = DATA_DIR / name
        if not p.exists():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return None

    def _job_events(self) -> Dict[str, Any]:
        data = self._read_json_ls_export("bridge_events.json")
        if not data:
            return {"ok": True, "note": "no-bridge"}
        events = data if isinstance(data, list) else data.get("events") or []
        near = [
            e
            for e in events
            if e.get("limit") and (e.get("adesioni") or 0) >= int(e["limit"] * 0.85)
        ]
        if near:
            self.log(
                "warn",
                f"Eventi quasi pieni: {len(near)}",
                [{"title": e.get("title"), "adesioni": e.get("adesioni"), "limit": e.get("limit")} for e in near[:5]],
            )
        return {"ok": True, "note": f"near {len(near)}"}

    def _job_blocks(self) -> Dict[str, Any]:
        data = self._read_json_ls_export("bridge_blocks.json")
        if not data:
            return {"ok": True, "note": "no-bridge"}
        blocks = data if isinstance(data, list) else data.get("blocks") or []
        pending = [b for b in blocks if b.get("review") == "pending"]
        if pending:
            self.log("warn", f"Riesami blocco in coda: {len(pending)}")
        return {"ok": True, "note": f"pending {len(pending)}"}

    def _job_art22(self) -> Dict[str, Any]:
        data = self._read_json_ls_export("bridge_art22.json")
        if not data:
            return {"ok": True, "note": "no-bridge"}
        q = data if isinstance(data, list) else data.get("queue") or []
        open_n = len([x for x in q if not x.get("resolved")])
        if open_n:
            self.log("info", f"Coda Art.22 aperta: {open_n}")
        return {"ok": True, "note": f"open {open_n}"}

    def _job_integrity(self) -> Dict[str, Any]:
        issues = self._static_integrity_scan()
        self._set_fleet("warRoomWatch", True, f"integrity issues={issues}", 1)
        if issues:
            self.log("warn", f"Integrity: {issues} file critici mancanti/rotti")
        return {"ok": True, "note": f"issues {issues}"}

    def _static_integrity_scan(self) -> int:
        required = [
            "index.html",
            "app.js",
            "style.css",
            "agents-runtime.js",
            "campionati-agents.js",
            "campionati-supervisors.js",
            "war-room-runtime.js",
            "ai-gdpr-monitor.js",
            "autopilot-runtime.js",
            "integrazioni-runtime.js",
            "https_server.py",
        ]
        issues = 0
        for rel in required:
            p = ROOT / rel
            if not p.exists() or p.stat().st_size < 50:
                issues += 1
        return issues

    def _job_campionati_file(self) -> Dict[str, Any]:
        if not CAMPIONATI_JSON.exists():
            return {"ok": True, "note": "no-latest"}
        age = int(time.time() - CAMPIONATI_JSON.stat().st_mtime)
        return {"ok": True, "note": f"age {age}s"}

    def _job_metrics_snapshot(self) -> Dict[str, Any]:
        self._save_state()
        return {"ok": True, "note": "saved"}

    def _job_platform_heartbeat(self) -> Dict[str, Any]:
        self._set_fleet("platformCluster", True, f"hb cycle {self.cycles}", 1)
        return {"ok": True, "note": "hb"}

    def _job_gdpr_pulse(self) -> Dict[str, Any]:
        self._set_fleet("gdprSupervisors", True, "pulse PSUP-01/02/03", 1)
        return {"ok": True, "note": "gdpr"}

    # ---------- tuttocampo subprocess ----------
    def _ensure_tuttocampo_proc(self) -> bool:
        if not self.cfg.get("tuttocampo_enabled", True):
            self._set_fleet("tuttocampoSync", False, "disabled in config")
            return False
        if not TUTTOCAMPO_WORKER.exists():
            self._set_fleet("tuttocampoSync", False, "worker file missing")
            return False
        if self._tc_proc is not None and self._tc_proc.poll() is None:
            self._set_fleet("tuttocampoSync", True, f"pid {self._tc_proc.pid}")
            return True
        return self._start_tuttocampo_proc()

    def _start_tuttocampo_proc(self) -> bool:
        self._stop_tuttocampo_proc()
        try:
            interval = int(self.cfg.get("tuttocampo_interval_sec") or 300)
            creationflags = 0
            if sys.platform == "win32":
                creationflags = subprocess.CREATE_NO_WINDOW  # type: ignore[attr-defined]
            self._tc_proc = subprocess.Popen(
                [
                    sys.executable,
                    str(TUTTOCAMPO_WORKER),
                    "--interval",
                    str(interval),
                    "--urls-per-tick",
                    "1",
                ],
                cwd=str(ROOT),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creationflags,
            )
            self.last_tuttocampo = {
                "started_at": _utc_now(),
                "pid": self._tc_proc.pid,
                "interval": interval,
            }
            self._set_fleet("tuttocampoSync", True, f"pid {self._tc_proc.pid}")
            self.log("ok", f"Tuttocampo worker avviato pid={self._tc_proc.pid}")
            return True
        except Exception as e:
            self._set_fleet("tuttocampoSync", False, str(e))
            self.log("err", f"Avvio Tuttocampo fallito: {e}")
            return False

    def _stop_tuttocampo_proc(self) -> None:
        if self._tc_proc is None:
            return
        try:
            if self._tc_proc.poll() is None:
                self._tc_proc.terminate()
                try:
                    self._tc_proc.wait(timeout=5)
                except Exception:
                    self._tc_proc.kill()
        except Exception:
            pass
        self._tc_proc = None


# Singleton for server import
_ENGINE: Optional[AutoPilotEngine] = None
_ENGINE_LOCK = threading.Lock()


def get_engine() -> AutoPilotEngine:
    global _ENGINE
    with _ENGINE_LOCK:
        if _ENGINE is None:
            _ENGINE = AutoPilotEngine()
            if _ENGINE.cfg.get("auto_start") and _ENGINE.cfg.get("enabled"):
                _ENGINE.start()
        return _ENGINE
