import re, ssl, urllib.request, json
from pathlib import Path
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
}
urls = [
  "https://www.diretta.it/calcio/italia/serie-a/",
  "https://www.diretta.it/calcio/italia/serie-a/classifiche/?table=overall",
  "https://www.diretta.it/calcio/italia/serie-b/",
  "https://www.diretta.it/calcio/italia/serie-b/classifiche/?table=overall",
  "https://www.diretta.it/calcio/italia/serie-c/",
  "https://www.diretta.it/calcio/italia/serie-c/girone-a/",
  "https://www.diretta.it/calcio/italia/serie-c/girone-b/",
  "https://www.diretta.it/calcio/italia/serie-c/girone-c/",
]
for url in urls:
  try:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
      html = r.read().decode("utf-8", "replace")
    print("===", url, "status ok len", len(html))
    # team-like links
    teams = re.findall(r'/squadra/([a-z0-9-]+)/', html, re.I)
    names = re.findall(r'tableCellParticipant__name[^>]*>([^<]+)<', html)
    names2 = re.findall(r'class="[^"]*participant[^"]*"[^>]*>([^<]{2,40})<', html)
    print("  squadra slugs", len(set(teams)), list(dict.fromkeys(teams))[:25])
    print("  names", names[:25])
    print("  names2", names2[:15])
    # event row participants
    parts = re.findall(r'data-testid="participant"[^>]*>([^<]+)<', html)
    print("  participant", parts[:20])
  except Exception as e:
    print("ERR", url, type(e).__name__, e)