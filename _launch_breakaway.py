# -*- coding: utf-8 -*-
import os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
PY = sys.executable
CREATE_NEW_PROCESS_GROUP = 0x00000200
CREATE_NO_WINDOW = 0x08000000
DETACHED_PROCESS = 0x00000008
flags = CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP | DETACHED_PROCESS
lock = ROOT / "data" / "autopilot" / "watchdog.lock"
try:
    if lock.exists():
        lock.unlink()
except Exception:
    pass
subprocess.Popen(
    [PY, "-u", str(ROOT / "workers" / "server_watchdog.py")],
    cwd=str(ROOT),
    stdin=subprocess.DEVNULL,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    creationflags=flags,
    close_fds=True,
)