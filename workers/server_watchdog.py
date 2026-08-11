# -*- coding: utf-8 -*-
"""ELISEE SCOUT — Watchdog stabile su http://127.0.0.1:8080 (elisee_up.py)."""
from __future__ import annotations

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
PY = sys.executable
LOG = ROOT / "data" / "autopilot" / "watchdog.log"
LOCK = ROOT / "data" / "autopilot" / "watchdog.lock"
PORT = int(os.environ.get("ELISEE_PORT", "8080"))
FAIL_THRESHOLD = 3
CHECK_EVERY_SEC = 6
START_GRACE_SEC = 3


def log(msg: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    line = time.strftime("%Y-%m-%d %H:%M:%S") + " " + msg
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def port_up() -> bool:
    for _ in range(3):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        try:
            s.connect(("127.0.0.1", PORT))
            s.close()
            return True
        except Exception:
            try:
                s.close()
            except Exception:
                pass
            time.sleep(0.15)
    return False


def acquire_lock() -> bool:
    try:
        LOCK.parent.mkdir(parents=True, exist_ok=True)
        if LOCK.exists():
            try:
                old = int((LOCK.read_text(encoding="utf-8") or "0").strip())
            except Exception:
                old = 0
            if old and old != os.getpid():
                try:
                    import ctypes

                    h = ctypes.windll.kernel32.OpenProcess(0x00100000, 0, old)  # type: ignore
                    if h:
                        ctypes.windll.kernel32.CloseHandle(h)  # type: ignore
                        return False
                except Exception:
                    pass
        LOCK.write_text(str(os.getpid()), encoding="utf-8")
        return True
    except Exception:
        return True


def start_server():
    """Avvia elisee_up.py (HTTP 8080) con path relative + cwd=ROOT (spazi OK)."""
    creation = 0
    if sys.platform == "win32":
        creation = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)
        creation |= getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0x00000200)
    # Preferisci pythonw se disponibile (niente console)
    exe = PY
    try:
        if sys.platform == "win32" and PY.lower().endswith("python.exe"):
            cand = PY[:-10] + "pythonw.exe"
            if os.path.isfile(cand):
                exe = cand
    except Exception:
        pass
    return subprocess.Popen(
        [exe, "elisee_up.py"],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        creationflags=creation,
    )


def main() -> None:
    if not acquire_lock():
        log("another watchdog running — exit")
        return
    log(f"WATCHDOG START pid={os.getpid()} root={ROOT} port={PORT}")
    proc = None
    fails = 0
    if port_up():
        log("port already UP — monitor only")
    else:
        log("starting elisee_up.py")
        proc = start_server()
        time.sleep(START_GRACE_SEC)
        log("port after start: " + ("UP" if port_up() else "DOWN"))

    while True:
        try:
            if port_up():
                fails = 0
            else:
                fails += 1
                log(f"port down {fails}/{FAIL_THRESHOLD}")
                if fails >= FAIL_THRESHOLD:
                    if proc is not None:
                        try:
                            if proc.poll() is None:
                                proc.terminate()
                                time.sleep(0.4)
                                if proc.poll() is None:
                                    proc.kill()
                        except Exception:
                            pass
                    log("restarting elisee_up.py")
                    proc = start_server()
                    time.sleep(START_GRACE_SEC)
                    fails = 0
                    log("port after restart: " + ("UP" if port_up() else "DOWN"))
            time.sleep(CHECK_EVERY_SEC)
        except KeyboardInterrupt:
            log("watchdog stop")
            break
        except Exception as e:
            log(f"watchdog loop err: {e}")
            time.sleep(CHECK_EVERY_SEC)


if __name__ == "__main__":
    main()
