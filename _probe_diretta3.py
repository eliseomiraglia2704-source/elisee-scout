import re, ssl, urllib.request
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "it-IT,it;q=0.9",
  "Referer": "https://www.diretta.it/serie-a/classifiche/",
  "X-Fsign": "SW9D1eZo",  # often used by flashscore feeds
}
url = "https://www.diretta.it/serie-a/classifiche/"
req = urllib.request.Request(url, headers={k:v for k,v in UA.items() if k!="X-Fsign"})
html = urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8","replace")
# dump interesting tokens
for pat in [
  r'["\']([a-zA-Z0-9]{8})["\']',  # too broad
  r'tournament_stage[^"]{0,40}',
  r'to_([a-zA-Z0-9]+)',
  r'standings_([a-zA-Z0-9_]+)',
  r'data-standings-url="([^"]+)"',
  r'cjs\.initialFeed[^;]{0,200}',
  r'environment\s*=\s*(\{[\s\S]{0,500})',
  r'window\.__INITIAL[^=]*=\s*',
  r'"tournamentId":\s*"?(\d+)"?',
  r'"tournamentStageId":\s*"?([A-Za-z0-9]+)"?',
  r'stage_id["\']?\s*:\s*["\']?([A-Za-z0-9]+)',
  r'/x/feed/([a-z_0-9]+)',
  r'fs_sign["\']?\s*[:=]\s*["\']([^"\']+)',
  r'fsign["\']?\s*[:=]\s*["\']([^"\']+)',
]:
  m = re.findall(pat, html, re.I)
  if m:
    uniq = list(dict.fromkeys(m))[:15]
    print(pat[:40], "->", len(m), uniq)

# search raw for known serie a tournament
for key in ["IJ2iYpX2", "serie-a", "standings", "SA...", "table"]:
  print(key, html.count(key))

# extract script srcs with standings
scripts = re.findall(r'src="([^"]*standings[^"]*)"', html)
print("scripts", scripts[:10])
# any encoded feed
feeds = re.findall(r'https://[^"\']+feed[^"\']+', html)
print("feeds", feeds[:10])
# tournament urls in page
tids = re.findall(r'data-[a-z-]*id="([^"]+)"', html)
print("data-ids sample", tids[:30])
# look for SA
print("SA matches", re.findall(r'SA.{0,30}', html)[:10])