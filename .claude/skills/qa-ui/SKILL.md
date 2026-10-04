---
name: qa-ui
description: Protocollo formale di collaudo visivo e verifica di non regressione per Elisee Scout. Attivare a conclusione di ogni task UI prima del rilascio finale.
---

# Skill: Quality Assurance Visiva & Regression Testing

Questa procedura definisce la **Definition of Done** per qualsiasi modifica a interfacce, layout o stili del sito.

## 1. Breakpoint di Verifica Obbligatori

Ogni componente o sezione deve essere catturato e verificato in due contesti precisi:

1. **Desktop**: `1366 × 768 px` (o `1366 × 900 px`)
2. **Mobile**: `390 × 844 px` (standard viewport smartphone moderno)

## 2. Punti di Controllo alle Ancore Fondamentali

Durante la scansione con Playwright o Browser subagent, validare che le ancore storiche della piattaforma non presentino regressioni:

- `#hero`: Titolazione, bottoni primari con gradiente teal, stabilità della navbar superiore.
- `#profili`: Card 3D dei profili, allineamento a 3 colonne su desktop e a 1 colonna su mobile, assenza di pillole piene o emoji.
- `#home-about` / `#chi-siamo`: Testo istituzionale, trasparenza dello sfondo globale.
- `#bacheca-annunci` / `#bacheca`: Tab navigate senza sfondi neri pieni, filtri di ricerca operativi.
- `#mappa-portal`: Rendering dei club e caricamento dei dati geolocalizzati.

## 3. Checklist Controlli di Non Regressione

- [ ] **Navbar Unica**: È presente solo ed esclusivamente il componente `header.public-header` in cima alla pagina.
- [ ] **Sfondo Globale Fisso**: `body.layout-portfolio::before` è attivo, nessuna sezione introduce sfondi neri coprenti (`#000000`).
- [ ] **Switch del Tema (`.realistic-switch`)**: Il pulsante non ha riquadri quadrati scuri attorno, non ruota su hover/active, la sola levetta `.rs-thumb` si muove.
- [ ] **Cambio Tema**: Commutare tra Dark (`vault-neon`) e Light (`mimetico-chiaro`) verificando leggibilità del testo e assenza di flash bianchi improvvisi.
- [ ] **Internazionalizzazione (IT / EN)**: Premere il selettore `#btn-lang` e accertarsi che i testi passino istantaneamente tra italiano e inglese.
- [ ] **Accessibilità da Tastiera**: Verificare che con `Tab` l'anello teal di focus sia chiaramente visibile solo quando si naviga da tastiera e assente al click del mouse.
- [ ] **Touch Target**: Nessun pulsante o link mobile inferiore a 44×44px.
