# download serie A/B logos from football-logos if missing (best-effort)
import urllib.request, ssl, re
from pathlib import Path
ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
OUT.mkdir(parents=True, exist_ok=True)
# common slug map on football-logos italy
slugs = [
 "napoli","inter","juventus","milan","roma","lazio","atalanta","fiorentina","bologna","torino",
 "genoa","udinese","cagliari","verona","hellas-verona","lecce","parma","como","sassuolo","pisa","cremonese",
 "palermo","bari","spezia","catanzaro","cesena","modena","sampdoria","brescia","reggiana","frosinone",
 "salernitana","empoli","venezia","monza","padova","cittadella","mantova","carrarese"
]
ctx = ssl.create_default_context()
ua = {"User-Agent":"Mozilla/5.0","Accept":"image/png,image/*"}
ok=0; fail=0
for s in slugs:
    dest = OUT / f"{s}.png"
    if dest.exists() and dest.stat().st_size > 800:
        ok += 1
        continue
    urls = [
        f"https://assets.football-logos.cc/logos/italy/512x512/{s}.png",
        f"https://images.football-logos.cc/logos/italy/512x512/{s}.png",
    ]
    got=False
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=ua)
            with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
                data = r.read()
            if data and len(data) > 800 and data[:8] != b'<!DOCTYP':
                dest.write_bytes(data)
                print("OK", s, len(data))
                ok += 1
                got=True
                break
        except Exception as e:
            pass
    if not got:
        print("FAIL", s)
        fail += 1
print("done ok", ok, "fail", fail)