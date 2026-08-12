# -*- coding: utf-8 -*-
"""
ELISEE SCOUT — Ottimizzazione Immagini & Asset per caricamento istantaneo su Mobile
Riduce i file kit PNG da 10MB a ~80KB preservando nitidezza Retina.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent

def optimize_kits():
    kits = list((ROOT / "immagini" / "kits-2d").rglob("*.png")) + list((ROOT / "immagini" / "kits-2d").rglob("*.jpg"))
    print(f"Scansione di {len(kits)} kit ed abbigliamento...")
    saved_bytes = 0
    count = 0
    
    for p in kits:
        try:
            sz_before = p.stat().st_size
            if sz_before < 200 * 1024: # Salta file già leggeri (<200KB)
                continue
            
            with Image.open(p) as im:
                im.load()
                w, h = im.size
                if max(w, h) > 512:
                    im.thumbnail((512, 512), Image.Resampling.LANCZOS)
                
                if p.suffix.lower() == ".png":
                    if im.mode not in ("RGBA", "LA", "P"):
                        im = im.convert("RGBA")
                    im.save(p, format="PNG", optimize=True)
                else:
                    im.convert("RGB").save(p, format="JPEG", quality=85, optimize=True)
            
            sz_after = p.stat().st_size
            saved = sz_before - sz_after
            if saved > 0:
                saved_bytes += saved
                count += 1
                print(f"  Ottimizzata {p.relative_to(ROOT)}: {sz_before/1024:.1f}KB -> {sz_after/1024:.1f}KB (-{saved/1024:.1f}KB)")
        except Exception as e:
            print(f"  Errore su {p.name}: {e}")
            
    print(f"Risparmio totale Kit: {saved_bytes / (1024*1024):.2f} MB su {count} file!")

def optimize_logos():
    logos = list((ROOT / "immagini" / "squadre-loghi").rglob("*.png"))
    print(f"Scansione di {len(logos)} loghi squadre...")
    saved_bytes = 0
    count = 0
    for p in logos:
        try:
            sz_before = p.stat().st_size
            if sz_before < 100 * 1024:
                continue
            with Image.open(p) as im:
                im.load()
                w, h = im.size
                if max(w, h) > 300:
                    im.thumbnail((300, 300), Image.Resampling.LANCZOS)
                if im.mode not in ("RGBA", "LA", "P"):
                    im = im.convert("RGBA")
                im.save(p, format="PNG", optimize=True)
            sz_after = p.stat().st_size
            saved = sz_before - sz_after
            if saved > 0:
                saved_bytes += saved
                count += 1
                print(f"  Ottimizzato stemma {p.name}: {sz_before/1024:.1f}KB -> {sz_after/1024:.1f}KB (-{saved/1024:.1f}KB)")
        except Exception as e:
            print(f"  Errore su stemma {p.name}: {e}")
    print(f"Risparmio totale Loghi: {saved_bytes / (1024*1024):.2f} MB su {count} loghi!")

if __name__ == "__main__":
    optimize_kits()
    optimize_logos()
