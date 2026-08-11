# -*- coding: utf-8 -*-
"""Watchdog: tiene elisee_up.py sempre su 127.0.0.1:8080"""
import os, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PY = sys.executable
PORT = 8080
LOG = ROOT / "data" / "autopilot" / "watchdog.log"
LOG.parent.mkdir(parents=True, exist_ok=True)

def log(msg):
    line = time.strftime("%Y-%m-%d %H:%M:%S") + " " + msg
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass
    print(line, flush=True)

def alive():
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/", timeout=2) as r:
            return r.status == 200
    except Exception:
        return False

def start_server():
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    # CREATE_NO_WINDOW on Windows
    flags = 0
    if sys.platform == "win32":
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)
    p = subprocess.Popen(
        [PY, "-u", str(ROOT / "elisee_up.py")],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
        creationflags=flags,
    )
    log(f"started elisee_up pid={p.pid}")
    return p

def main():
    log("==== WATCHDOG START ====")
    proc = None
    while True:
        try:
            if proc is not None and proc.poll() is not None:
                log(f"elisee_up exited code={proc.returncode}")
                proc = None
            if not alive():
                if proc is not None:
                    try:
                        proc.terminate()
                    except Exception:
                        pass
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    proc = None
                    time.sleep(0.5)
                proc = start_server()
                # wait up to 8s for listen
                for _ in range(16):
                    time.sleep(0.5)
                    if alive():
                        log("http ok")
                        break
                else:
                    log("http still down after start")
            time.sleep(3)
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"watch loop err: {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()