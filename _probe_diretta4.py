import re, ssl, urllib.request
CTX = ssl.create_default_context()
UA_PAGE = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "text/html",
  "Accept-Language": "it-IT,it;q=0.9",
}

def get_html(url):
    req = urllib.request.Request(url, headers=UA_PAGE)
    return urllib.request.urlopen(req, timeout=25, context=CTX).read().decode("utf-8", "replace")

def extract_stage(html):
    # from initial feed ZA÷ITALIA: Serie A¬ZEE÷COuk57Ci
    m = re.search(r"ZEE÷([A-Za-z0-9]+)", html)
    m2 = re.search(r"¬ZE÷([A-Za-z0-9]+)¬", html)
    m3 = re.search(r"¬ZC÷([A-Za-z0-9]+)¬", html)
    return {
        "zee": m.group(1) if m else None,
        "ze": m2.group(1) if m2 else None,
        "zc": m3.group(1) if m3 else None,
    }

def fetch_feed(path):
    headers = {
        "User-Agent": UA_PAGE["User-Agent"],
        "Accept": "*/*",
        "Accept-Language": "it-IT,it;q=0.9",
        "Referer": "https://www.diretta.it/",
        "X-Fsign": "SW9D1eZo",
        "X-GeoIP": "1",
        "X-Requested-With": "XMLHttpRequest",
    }
    bases = [
        "https://global.flashscore.ninja/2/x/feed/",
        "https://2.ds.lsapp.eu/pq_graphql",
        "https://d.flashscore.com/x/feed/",
        "https://www.diretta.it/x/feed/",
    ]
    for b in bases:
        url = b + path if "graphql" not in b else b
        try:
            if "graphql" in b:
                continue
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15, context=CTX) as r:
                data = r.read().decode("utf-8", "replace")
            print("OK", url, "len", len(data), "head", data[:120].replace("\n"," "))
            return data
        except Exception as e:
            print("fail", url, type(e).__name__, e)
    return None

# Serie A page
html = get_html("https://www.diretta.it/serie-a/classifiche/")
ids = extract_stage(html)
print("A ids", ids)
# fsign from page
fs = re.findall(r'fsign["\']?\s*[:=]\s*["\']([^"\']+)', html, re.I)
print("fsign", fs[:5])
# also try common standings feed formats
for path in [
  f"to_{ids['zee']}",
  f"tf_{ids['zee']}",
  f"tt_{ids['zee']}",
  f"df_sui_{ids['zee']}",
  f"df_sur_{ids['zee']}",
  f"df_suto_{ids['zee']}",
]:
    print("--- try", path)
    data = fetch_feed(path)
    if data and len(data) > 200:
        # parse team names from flashscore feed: typically ZX÷ or ~TN÷
        names = re.findall(r"¬ZN÷([^¬~]+)", data)
        names2 = re.findall(r"¬ZA÷([^¬~]+)", data)
        names3 = re.findall(r"¬GE÷([^¬~]+)", data)
        names4 = re.findall(r"¬TE÷([^¬~]+)", data)
        print(" ZN", names[:25], "count", len(names))
        print(" ZA", names2[:10])
        print(" GE", names3[:10])
        print(" TE", names4[:25], "count", len(names4))
        # any capital team-like
        toks = re.findall(r"÷([A-Z][A-Za-zÀ-ú .'\-]{2,30})¬", data)
        print(" caps", list(dict.fromkeys(toks))[:30])