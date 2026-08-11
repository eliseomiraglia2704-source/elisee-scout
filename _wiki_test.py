import json, urllib.request, urllib.parse, ssl, re
ctx=ssl.create_default_context()
def wiki(title):
    q=urllib.parse.urlencode({"action":"query","prop":"revisions","rvprop":"content","rvslots":"main","titles":title,"format":"json","redirects":1})
    url="https://it.wikipedia.org/w/api.php?"+q
    req=urllib.request.Request(url, headers={"User-Agent":"EliseeScout/1.0 (local research; stadium data)"})
    data=json.loads(urllib.request.urlopen(req, timeout=20, context=ctx).read().decode("utf-8"))
    pages=data.get("query",{}).get("pages",{})
    for pid,p in pages.items():
        rev=(p.get("revisions") or [{}])[0]
        slot=rev.get("slots",{}).get("main",{})
        return p.get("title"), slot.get("*") or rev.get("*") or ""
    return title, ""
for t in ["Inter","Atalanta BC","Unione Calcio AlbinoLeffe","US Sassuolo Calcio","Bologna FC 1909"]:
    title, text = wiki(t)
    print("===", t, "->", title, "len", len(text or ""))
    if text:
        for key in ["stadio","capacita","capienza","città","citta","sede","ground","capacity"]:
            m=re.search(rf"\|\s*{key}\s*=\s*([^\n]+)", text, re.I)
            if m: print(" ", key, ":", re.sub(r"\[\[|\]\]|'''","", m.group(1)).strip()[:100])
