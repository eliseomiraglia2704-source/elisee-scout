import re, ssl, urllib.request, json
CTX = ssl.create_default_context()
UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*",
  "Accept-Language": "it-IT,it;q=0.9",
  "Referer": "https://www.diretta.it/",
}
urls = [
  "https://www.diretta.it/serie-a/classifiche/",
  "https://www.diretta.it/serie-b/classifiche/",
  "https://www.diretta.it/calcio/italia/serie-c-girone-a/classifiche/",
  "https://www.diretta.it/calcio/italia/serie-c-girone-b/classifiche/",
  "https://www.diretta.it/calcio/italia/serie-c-girone-c/classifiche/",
]
for url in urls:
  try:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25, context=CTX) as r:
      html = r.read().decode("utf-8", "replace")
    print("===", url, "len", len(html))
    # find tournament ids / feed
    for pat in [r'tournamentId["\']?\s*[:=]\s*["\']?(\d+)', r'data-tournament-id="(\d+)"', r'/x/feed/[^"\']+', r'table__cell--participant[^>]*>[\s\S]{0,200}?>([A-Za-zÀ-ú .\'-]{3,40})<', r'tableCellParticipant__name[^>]*>\s*([^<]+)', r'class="[^"]*teamName[^"]*"[^>]*>([^<]+)', r'"participantName":"([^"]+)"', r'"name":"([A-Z][^"]{2,35})".{0,40}"shortName"']:
      found = re.findall(pat, html)
      if found:
        print(" ", pat[:50], "->", len(found), list(dict.fromkeys(found))[:22])
    # save snippet around standings
    idx = html.find("tableCellParticipant")
    if idx < 0: idx = html.find("standings")
    if idx < 0: idx = html.find("Classifica")
    print("  idx", idx)
    if idx > 0:
      print(html[idx:idx+400].replace("\n"," ")[:350])
  except Exception as e:
    print("ERR", url, e)