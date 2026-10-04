---
name: ui-component
description: Checklist e standard tecnici obbligatori per la progettazione e implementazione di nuovi componenti UI su Elisee Scout. Attivare prima di scrivere codice HTML, CSS o JS per interfacce.
---

# Skill: Progettazione Componenti UI (Elisee Scout)

Ogni nuovo componente deve rispettare rigorosamente questa checklist prima di essere approvato.

## 1. Naming & Prefissi CSS

- Utilizzare una convenzione rigorosa di prefissi coerenti per evitare collisioni nello scope globale:
  - Componenti generici: `.es-<nome-componente>` (es. `.es-ctrl-trigger`, `.es-portal-panel`)
  - BEM consigliato: `.es-blocco__elemento--modificatore`
- **MAI `!important`**: usa la specificità dei selettori (es. `.container .es-btn`).
- **MAI stili inline**: nessun attributo `style="..."` nell'HTML. Sposta tutto nei file `.css` dedicati.
- **Pulizia Preventiva**: prima di aggiungere una nuova regola o variante, cerca e rimuovi le regole obsolete non più utilizzate.

## 2. Adozione Token di Design

Non cablare mai colori esadecimali o rgba statici per sfondi e bordi delle card. Usa sempre i token:

- `background: var(--card-bg);`
- `border: 1px solid var(--card-border);`
- `color: var(--es-ctrl-text);`
- `border-radius: var(--card-radius, 14px);`
- Accento interattivo: `var(--es-ctrl-accent, #2fe0c8);`

## 3. Accessibilità (A11y ARIA 1.2)

- **Tastiera**: Tutti gli elementi interattivi devono essere navigabili con `Tab`, attivabili con `Enter` o `Space`, e richiudibili con `Escape`.
- **Focus Ring**: Utilizzare `:focus-visible` con anello outline teal statico (`outline: 2px solid #2fe0c8; outline-offset: 2px`). Non mostrare anelli sgradevoli al click del mouse (`:focus:not(:focus-visible) { outline: none; }`).
- **Touch Target**: Minimo **44×44px** per qualsiasi bottone o elemento cliccabile su dispositivi mobili. Se l'elemento visivo è più piccolo, estendere l'area con uno pseudo-elemento trasparente `::before`.
- **Ruoli & Attributi**: Includere `role`, `aria-expanded`, `aria-haspopup`, `aria-selected` o `aria-disabled` in modo coerente.

## 4. Responsive & Reduced Motion

- Progettare con approccio mobile-first o responsive desktop/mobile:
  - Desktop standard: `1366×768px`
  - Mobile standard: `390×844px`
- **Motion**: Durata transizioni fluide `<=150ms` (o `<=300ms` per pannelli complessi). Includere sempre:

  ```css
  @media (prefers-reduced-motion: reduce) {
    .es-mio-componente, .es-mio-componente * {
      animation: none !important;
      transition: none !important;
    }
  }
  ```

## 5. Internazionalizzazione (i18n)

- Nessun testo hardcoded in italiano o inglese nei file HTML o JS.
- Aggiungere sempre la coppia di traduzioni (IT obbligatorio come lingua base, EN sempre sincronizzato) in `i18n.js` e agganciare con `data-i18n="chiave"` o tramite `t('chiave')`.
