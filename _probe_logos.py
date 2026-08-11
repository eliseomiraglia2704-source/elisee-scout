import re, urllib.request, ssl, json
from pathlib import Path
ctx = ssl.create_default_context()
headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
}
for path in ["italy/serie-a/", "italy/serie-b/", "italy/serie-c/", "italy/serie-d/"]:
    url = "https://football-logos.cc/" + path
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            html = r.read().decode("utf-8", "replace")
        print("===", path, "status ok len", len(html))
        # find logo urls
        imgs = re.findall(r'https?://[^"\']+\.(?:png|svg|webp)', html, re.I)
        assets = re.findall(r'assets\.football-logos[^"\']+', html, re.I)
        srcs = re.findall(r'src=["\']([^"\']+)["\']', html)
        hrefs = re.findall(r'href=["\']([^"\']*logo[^"\']*)["\']', html, re.I)
        print(" imgs sample", imgs[:8])
        print(" assets sample", assets[:8])
        print(" src sample", srcs[:15])
        # alt texts
        alts = re.findall(r'alt=["\']([^"\']+)["\']', html)
        print(" alts", alts[:25])
        # data attributes
        data = re.findall(r'data-[a-z-]+=["\'][^"\']+["\']', html)[:20]
        print(" data", data[:10])
    except Exception as e:
        print("ERR", path, type(e).__name__, e)