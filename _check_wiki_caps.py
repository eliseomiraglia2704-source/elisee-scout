# -*- coding: utf-8 -*-
import json, re, ssl, urllib.request, urllib.parse
from pathlib import Path

CTX = ssl.create_default_context()
UA = {"User-Agent": "EliseeScout/1.0"}
ROOT = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")

def get(title):
    q = urllib.parse.urlencode({
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "titles": title, "format": "json", "redirects": 1,
    })
    req = urllib.request.Request("https://it.wikipedia.org/w/api.php?" + q, headers=UA)
    data = json.loads(urllib.request.urlopen(req, timeout=20, context=CTX).read().decode())
    for pid, p in data["query"]["pages"].items():
        if str(pid).startswith("-"):
            return ""
        rev = (p.get("revisions") or [{}])[0]
        return rev.get("slots", {}).get("main", {}).get("*") or ""
    return ""

def clean(v):
    v = re.sub(r"<ref[\s\S]*?</ref>", "", v or "", flags=re.I)
    m = re.search(r"formatnum:([\d\.\,]+)", v, re.I)
    if m:
        return re.sub(r"[^\d]", "", m.group(1))
    def lr(m):
        return m.group(1).split("|")[-1]
    v = re.sub(r"\[\[([^\]]+)\]\]", lr, v)
    for _ in range(3):
        v2 = re.sub(r"\{\{[^{}]*\}\}", "", v)
        if v2 == v:
            break
        v = v2
    return re.sub(r"\s+", " ", v).strip()

checks = {
    "INTER": "Football Club Internazionale Milano",
    "MILAN": "Associazione Calcio Milan",
    "JUVENTUS": "Juventus Football Club",
    "NAPOLI": "Società Sportiva Calcio Napoli",
    "ROMA": "Associazione Sportiva Roma",
    "LAZIO": "Società Sportiva Lazio",
    "ATALANTA": "Atalanta Bergamasca Calcio",
    "FIORENTINA": "ACF Fiorentina",
    "BOLOGNA": "Bologna Football Club 1909",
    "TORINO": "Torino Football Club",
    "GENOA": "Genoa Cricket and Football Club",
    "UDINESE": "Udinese Calcio",
    "CAGLIARI": "Cagliari Calcio",
    "LECCE": "Unione Sportiva Lecce",
    "PARMA": "Parma Calcio 1913",
    "COMO": "Como 1907",
    "SASSUOLO": "Unione Sportiva Sassuolo Calcio",
    "VENEZIA": "Venezia Football Club",
    "PISA": "Pisa Sporting Club",
    "CREMONESE": "Unione Sportiva Cremonese",
    "PALERMO": "Palermo Football Club",
    "BARI": "Società Sportiva Calcio Bari",
    "SAMPDORIA": "Unione Calcio Sampdoria",
}

cat = json.loads((ROOT / "data/squadre/catalog.json").read_text(encoding="utf-8"))
by = {t["name"]: t for t in cat["teams"]}
mism = []
for name, title in checks.items():
    t = get(title)
    st = re.search(r"\|\s*stadio\s*=\s*([^\n]+)", t, re.I)
    cap = re.search(r"\|\s*capienza\s*=\s*([^\n]+)", t, re.I)
    cit = re.search(r"\|\s*citt[aà]\s*=\s*([^\n]+)", t, re.I)
    wiki_st = clean(st.group(1) if st else "")
    wiki_cap = clean(cap.group(1) if cap else "")
    wiki_cit = clean(cit.group(1) if cit else "")
    c = by.get(name, {})
    same = str(c.get("capacity") or "") == str(wiki_cap or "")
    mark = "OK" if same else "DIFF"
    if not same:
        mism.append((name, c.get("capacity"), wiki_cap, wiki_st, wiki_cit))
    print(f"{mark} {name}: cat={c.get('capacity')} wiki={wiki_cap} | {wiki_st[:50]} | {wiki_cit}")

print("mismatches", len(mism))
for row in mism:
    print(" ", row)
