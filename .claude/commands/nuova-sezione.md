---
description: Guida la creazione di una nuova sezione della landing o dell'app conforme a token di design, trasparenza sfondo, internazionalizzazione IT/EN e accessibilità.
arguments:
  - name: id
    description: ID identificativo della sezione (es. 'nuova-area')
    required: true
---

# Nuova Sezione

Crea una nuova sezione conforme all'architettura di Elisee Scout per l'identificativo `$ARGUMENTS`.

Segui rigorosamente questa procedura:

1. **Markup HTML**:
   - Definisci la sezione `<section id="$ARGUMENTS" class="es-section-$ARGUMENTS">`.
   - La sezione deve avere `background: transparent;` per mostrare lo sfondo globale fisso su `body::before`. Nessun blocco nero pieno `#000000`.
   - Inserisci un container centratore (`max-width: 1200px; margin: 0 auto; padding: 4rem 1.5rem;`).
2. **Design Tokens & Card**:
   - Se crei card o riquadri, usa solo `background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px;`.
   - Accenti interattivi e bottoni con teal `--es-ctrl-accent` (`#2fe0c8`). Nessuna pillola piena o colore saturo.
3. **Internazionalizzazione (IT / EN)**:
   - Aggiungi i testi in `i18n.js` con le relative chiavi sia per la lingua `it` sia per `en`.
   - Collega gli elementi tramite attributo `data-i18n="chiave"`.
4. **Accessibilità (A11y)**:
   - Gerarchia heading corretta (`h2` o `h3`).
   - Touch target minimo 44×44px su mobile.
5. **Output**:
   - Mostra il diff dei file toccati (`index.html`, CSS dedicato, `i18n.js`).
