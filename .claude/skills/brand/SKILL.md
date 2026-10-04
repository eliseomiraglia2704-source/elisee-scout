---
name: brand
description: Linee guida visive, tono di voce, palette colori e vincoli estetici ufficiali di Elisee Scout. Attivare quando si creano o modificano elementi grafici, card, testi, colori o componenti UI.
---

# Skill: Brand & Visual Identity di Elisee Scout

Riferimento baseline: `@docs/brand-brain-scout.md`.

## 1. Direzione Estetica & Tono di Voce

- **Stile**: **Luxury Tech / Professionale**. Ispirato alle grandi piattaforme sportive e di recruitment corporate (TransferRoom, LinkedIn Pro), ma calibrato sul calcio italiano.
- **Tono di Voce**: Autorevole, sobrio, diretto, sportivo ed essenziale. Nessuna enfasi pubblicitaria aggressiva o infantile.

## 2. Divieti Assoluti Non Negoziabili

- **NIENTE Stile Videogioco**: Nessun font pixel art, nessun bordo da console o HUD futuristico nei componenti pubblici o nelle dashboard.
  *Eccezione Esclusiva*: Il modulo `elisee-world/` (RPG 16-bit retro) è un minigioco confinato ed è l'unica area in cui tale stile è consentito.
- **NIENTE Emoji**: Mai emoji nei titoli, nelle card di presentazione, nei badge o nei menu. Usa icone SVG lineari e minimali (<3KB).
- **NIENTE Colori Saturi a Blocchi o Pillole Piene Ovunque**: Evita bottoni multicolor sgargianti. La call-to-action principale usa il gradiente teal elegante (`#2fe0c8` → `#0d9488`).
- **NIENTE Roadmap o Agenti IA Visibili**: Vietato mostrare all'utente finale elenchi di roadmap interne, conteggi di pillar strategici ("350 pillar") o conteggi di agenti IA ("715 agenti IA") sulle pagine pubbliche.
- **Header Ambassador Intoccabile**: La testata e la struttura grafica della pagina Ambassador non devono mai essere modificate.

## 3. Palette Colori & Token

- **Tema Scuro (`vault-neon` - Default)**:
  - Sfondo Base: `--bg-base: #060b13`
  - Sfondo Card: `--card-bg: rgba(11, 18, 32, 0.85)`
  - Bordo Card: `--card-border: rgba(56, 189, 248, 0.28)`
  - Accento Primario: Teal `#2fe0c8` / Glow `#00f5d4`
  - Testo Primario: `#f8fafc` | Testo Muted: `#94a3b8`
- **Tema Chiaro (`mimetico-chiaro`)**:
  - Sfondo Base: `#f8fafc`
  - Sfondo Card: `--card-bg: rgba(255, 255, 255, 0.95)`
  - Bordo Card: `--card-border: rgba(20, 184, 166, 0.35)`
  - Accento Primario: Teal scuro `#0d9488`
  - Testo Primario: `#0f172a` | Testo Muted: `#64748b`

## 4. Tipografia Ufficiale

- Dati, tabelle, form e testi correnti: **Inter** (font-display: swap).
- Titolazioni, statistiche, numeri maglia e card sportive: **Nevera**, **Outfit**, **Oswald**.
