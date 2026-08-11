import re, urllib.request, ssl
ctx = ssl.create_default_context()
UA = {"User-Agent":"Mozilla/5.0","Accept":"text/html","Referer":"https://football-logos.cc/"}
req = urllib.request.Request("https://football-logos.cc/italy/serie-c/", headers=UA)
html = urllib.request.urlopen(req, timeout=25, context=ctx).read().decode("utf-8","replace")
print("Group A count", len(re.findall(r"Group A", html)))
print("h4 samples", re.findall(r"<h4[^>]*>[^<]{0,40}</h4>", html)[:15])
headers = list(re.finditer(r">Group\s+([A-I])</h4>", html, re.I))
print("headers", [(m.group(1), m.start()) for m in headers])
idx = html.find("All Serie C Teams")
chunk = html[idx:]
mstop = re.search(r"Matches in Serie", chunk, re.I)
if mstop:
    chunk = chunk[:mstop.start()]
slugs = []
seen=set()
for m in re.finditer(r'href="/italy/([a-z0-9-]+)/"', chunk):
    s=m.group(1)
    if s.startswith("serie") or re.fullmatch(r"\d+x\d+", s):
        continue
    if s in seen:
        continue
    seen.add(s)
    slugs.append(s)
print("slugs", len(slugs), slugs)
# groups by splitting on group titles
parts = re.split(r'id="italy-serie-c-group-([a-c])-title"', html, flags=re.I)
print("parts", len(parts), parts[1::2] if len(parts)>1 else None)
