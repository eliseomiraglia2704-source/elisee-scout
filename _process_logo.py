# -*- coding: utf-8 -*-
import sys, os, urllib.request, json, re
from PIL import Image

def process(team_key, url):
    team_key = team_key.strip().lower()
    
    # 1. Download image
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw_data = resp.read()
        
    tmp = '_tmp_proc.png'
    with open(tmp, 'wb') as f:
        f.write(raw_data)
        
    img = Image.open(tmp).convert('RGBA')
    
    # Clean filename
    clean_name = re.sub(r'[^a-z0-9\-]', '', team_key.replace(' ', '-').replace("'", ''))
    
    target_paths = [
        f'immagini/squadre-loghi/ecc-{clean_name}.png',
        f'immagini/squadre-loghi/{clean_name}.png'
    ]
    
    for p in target_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img.save(p, 'PNG')
        
    if os.path.exists(tmp):
        os.remove(tmp)
        
    print(f"OK: Saved {clean_name} ({img.size}) to {target_paths}")

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        process(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python _process_logo.py <team_name> <url>")
