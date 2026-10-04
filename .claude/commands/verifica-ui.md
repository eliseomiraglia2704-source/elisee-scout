---
description: Esegue una verifica visuale e di conformità completa alle ancore e ai breakpoint di Elisee Scout attivando le checklist di qa-ui e ui-reviewer.
---

# Verifica UI

Esegui il protocollo di verifica Quality Assurance UI su Elisee Scout:

1. **Verifica Breakpoint Obbligatori**:
   - Desktop standard: `1366 × 768 px`
   - Mobile viewport: `390 × 844 px`
2. **Ispezione Ancore Storiche**:
   - `#hero`: stabilità navbar e gradiente tasti
   - `#profili`: allineamento card 3D, contrasti tema
   - `#chi-siamo` / `#home-about`: trasparenza dello sfondo
   - `#bacheca-annunci`: filtri operativi, assenza di neri pieni
3. **Verifica Switch Tema (`.realistic-switch`)**:
   - Nessun riquadro scuro parassita attorno allo switch
   - Nessun movimento/rotazione della chiave o del contenitore su hover
   - Movimento fluido solo della levetta interna `.rs-thumb`
4. **Accessibilità & Riduzione Movimento**:
   - Anello focus visibile esclusivamente da tastiera (`:focus-visible`)
   - Rispetto di `prefers-reduced-motion: reduce`
5. **Output**:
   - Genera una tabella con lo stato di ciascun controllo (PASS / FAIL) e allega la sintesi delle schermate catturate.
