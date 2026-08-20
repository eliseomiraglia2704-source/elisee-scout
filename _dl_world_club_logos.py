# -*- coding: utf-8 -*-
"""Scarica loghi club top europei/mondiali da football-logos.cc."""
from __future__ import annotations
import re, ssl, time, urllib.request
from pathlib import Path

ROOT = Path(r"C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
OUT = ROOT / "immagini" / "squadre-loghi"
OUT.mkdir(parents=True, exist_ok=True)
CTX = ssl.create_default_context()
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,image/png,*/*",
    "Referer": "https://football-logos.cc/",
}

# name, country, slugs to try
CLUBS = [
    ("MANCHESTER CITY", "england", ["manchester-city"]),
    ("LIVERPOOL", "england", ["liverpool"]),
    ("ARSENAL", "england", ["arsenal"]),
    ("CHELSEA", "england", ["chelsea"]),
    ("MANCHESTER UNITED", "england", ["manchester-united"]),
    ("TOTTENHAM", "england", ["tottenham-hotspur", "tottenham"]),
    ("NEWCASTLE", "england", ["newcastle-united", "newcastle"]),
    ("REAL MADRID", "spain", ["real-madrid"]),
    ("BARCELONA", "spain", ["barcelona", "fc-barcelona"]),
    ("ATLETICO MADRID", "spain", ["atletico-madrid", "atletico-de-madrid"]),
    ("ATHLETIC CLUB", "spain", ["athletic-club", "athletic-bilbao"]),
    ("REAL SOCIEDAD", "spain", ["real-sociedad"]),
    ("VILLARREAL", "spain", ["villarreal"]),
    ("BAYERN MONACO", "germany", ["bayern-munich", "fc-bayern-munchen", "bayern-munchen"]),
    ("BORUSSIA DORTMUND", "germany", ["borussia-dortmund"]),
    ("RB LEIPZIG", "germany", ["rb-leipzig"]),
    ("BAYER LEVERKUSEN", "germany", ["bayer-leverkusen"]),
    ("EINTRACHT FRANCOFORTE", "germany", ["eintracht-frankfurt"]),
    ("PSG", "france", ["paris-saint-germain", "psg"]),
    ("OLYMPIQUE MARSEILLE", "france", ["olympique-marseille", "marseille"]),
    ("MONACO", "france", ["as-monaco", "monaco"]),
    ("LYON", "france", ["olympique-lyonnais", "lyon"]),
    ("LILLE", "france", ["lille", "losc-lille"]),
    ("BENFICA", "portugal", ["benfica"]),
    ("PORTO", "portugal", ["fc-porto", "porto"]),
    ("SPORTING CP", "portugal", ["sporting-cp", "sporting"]),
    ("BRAGA", "portugal", ["sc-braga", "braga"]),
    ("AJAX", "netherlands", ["ajax"]),
    ("PSV", "netherlands", ["psv", "psv-eindhoven"]),
    ("FEYENOORD", "netherlands", ["feyenoord"]),
    ("AZ ALKMAAR", "netherlands", ["az-alkmaar", "az"]),
    ("FLAMENGO", "brazil", ["flamengo"]),
    ("PALMEIRAS", "brazil", ["palmeiras"]),
    ("SAO PAULO", "brazil", ["sao-paulo"]),
    ("CORINTHIANS", "brazil", ["corinthians"]),
    ("FLUMINENSE", "brazil", ["fluminense"]),
    ("BOCA JUNIORS", "argentina", ["boca-juniors"]),
    ("RIVER PLATE", "argentina", ["river-plate"]),
    ("RACING CLUB", "argentina", ["racing-club", "racing"]),
    ("INDEPENDIENTE", "argentina", ["independiente"]),
    ("CLUB AMERICA", "mexico", ["club-america", "america"]),
    ("CHIVAS", "mexico", ["chivas", "guadalajara", "chivas-guadalajara"]),
    ("MONTERREY", "mexico", ["monterrey", "cf-monterrey"]),
    ("TIGRES", "mexico", ["tigres", "tigres-uanl"]),
]

LEAGUES = [
    ("premier-league", "england", ["premier-league"]),
    ("la-liga", "spain", ["la-liga", "laliga"]),
    ("bundesliga", "germany", ["bundesliga"]),
    ("ligue-1", "france", ["ligue-1"]),
    ("primeira-liga", "portugal", ["primeira-liga"]),
    ("eredivisie", "netherlands", ["eredivisie"]),
    ("brasileirao", "brazil", ["brasileirao", "serie-a"]),
    ("liga-argentina", "argentina", ["liga-profesional", "primera-division"]),
    ("liga-mx", "mexico", ["liga-mx"]),
]


def fetch(url: str, timeout=22) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def logo_from_page(html: str, country: str, slug: str) -> str | None:
    pat = rf"https://assets\.football-logos\.cc/logos/{re.escape(country)}/512x512/{re.escape(slug)}\.[a-f0-9]+\.png"
    m = re.search(pat, html, re.I)
    if m:
        return m.group(0)
    pat2 = rf"https://assets\.football-logos\.cc/logos/{re.escape(country)}/\d+x\d+/{re.escape(slug)}\.[a-f0-9]+\.png"
    m = re.search(pat2, html, re.I)
    if m:
        return re.sub(r"/\d+x\d+/", "/512x512/", m.group(0))
    m = re.search(
        rf"https://assets\.football-logos\.cc/logos/[^\"']+/512x512/{re.escape(slug)}\.[a-f0-9]+\.png",
        html,
        re.I,
    )
    if m:
        return m.group(0)
    m = re.search(
        r'og:image" content="(https://assets\.football-logos\.cc/logos/[^"]+\.png)"',
        html,
        re.I,
    )
    if m:
        return re.sub(r"/\d+x\d+/", "/512x512/", m.group(1))
    return None


def download_one(label: str, country: str, slugs: list[str], dest_name: str) -> str | None:
    dest = OUT / dest_name
    if dest.exists() and dest.stat().st_size > 800:
        print("HAVE", label, dest.name)
        return dest_name
    for slug in slugs:
        page = f"https://football-logos.cc/{country}/{slug}/"
        try:
            html = fetch(page).decode("utf-8", "replace")
        except Exception as e:
            print("PAGE FAIL", label, slug, e)
            continue
        url = logo_from_page(html, country, slug)
        if not url:
            print("NO ASSET", label, slug)
            continue
        try:
            data = fetch(url)
            if data and len(data) > 800 and data[:8] != b"<!DOCTYP":
                dest.write_bytes(data)
                print("OK", label, dest.name, len(data))
                return dest_name
        except Exception as e:
            print("IMG FAIL", label, url, e)
    print("FAIL", label)
    return None


def main():
    mapping = {}
    for name, country, slugs in CLUBS:
        fn = slugs[0].replace("/", "-") + ".png"
        got = download_one(name, country, slugs, fn)
        if got:
            mapping[name] = "immagini/squadre-loghi/" + got
        time.sleep(0.25)
    league_map = {}
    for name, country, slugs in LEAGUES:
        fn = slugs[0].replace("/", "-") + ".png"
        got = download_one(name, country, slugs, fn)
        if got:
            league_map[name] = "immagini/squadre-loghi/" + got
        time.sleep(0.25)
    print("--- CLUBS ---")
    for k, v in mapping.items():
        print(k, "=>", v)
    print("--- LEAGUES ---")
    for k, v in league_map.items():
        print(k, "=>", v)


if __name__ == "__main__":
    main()
