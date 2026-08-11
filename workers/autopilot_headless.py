# -*- coding: utf-8 -*-
"""Headless AutoPilot (no HTTPS site). Useful as Windows service / scheduled task."""
from __future__ import annotations
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "workers"))
from autopilot_engine import get_engine  # noqa: E402

def main() -> None:
    eng = get_engine()
    print("ELISEE SCOUT AutoPilot headless ONLINE")
    print("State:", eng.status().get("paths"))
    try:
        while True:
            st = eng.status()
            print(
                f"[{st.get('cycles')}] running={st.get('running')} "
                f"heals={st.get('heals')} camp={st.get('campionatiTicks')}",
                flush=True,
            )
            time.sleep(30)
    except KeyboardInterrupt:
        eng.stop()
        print("Stopped.")

if __name__ == "__main__":
    main()
