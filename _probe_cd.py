import re, urllib.request, ssl
ctx = ssl.create_default_context()
headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html",
  "Accept-Language": "en",
  "Referer": "https://football-logos.cc/",
}
for path in ["serie-c", "serie-d"]:
    url = f"https://football-logos.cc/italy/{path}/"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
        html = r.read().decode("utf-8", "replace")
    print("===", path, "len", len(html))
    # find All Teams text
    for m in re.finditer(r'All.{0,30}Teams', html, re.I):
        print(" marker", m.group(0), "at", m.start())
    # all /italy/ links
    links = re.findall(r'/italy/([a-z0-9-]+)/', html)
    from collections import Counter
    c = Counter(links)
    # unique non league
    uniq = [x for x in dict.fromkeys(links) if not x.startswith("serie-")]
    print(" unique non-serie links", len(uniq), uniq[:40])
    # look for logoId patterns in json
    logo_ids = re.findall(r'"logoId"\s*:\s*"([a-z0-9-]+)"', html)
    print(" logoIds", len(logo_ids), logo_ids[:30])
    logo_ids2 = re.findall(r'data-logo-id="([a-z0-9-]+)"', html)
    print(" data-logo-id", logo_ids2[:20])
    # __NEXT or astro payload
    for key in ["teams", "relatedTeams", "children", "logoId"]:
        print(key, html.lower().count(key.lower()))
    # save snippet around Teams
    idx = html.lower().find("teams season")
    if idx < 0:
        idx = html.lower().find("all serie")
    print("idx", idx)
    if idx >= 0:
        snip = html[idx:idx+2000]
        print(snip[:1500])
    # try alternate size section
    assets = re.findall(r'assets\.football-logos\.cc/logos/italy/512x512/([a-z0-9-]+)\.[a-f0-9]+\.png', html)
    print(" assets 512", len(assets), assets[:20])