# Backlog UI — Elisee Scout

Registro delle funzionalità e dei task di interfaccia/design da sviluppare in rami paralleli tramite Git Worktree, garantendo isolamento e zero collisioni tra sessioni di lavoro.

---

## Istruzioni Worktree

Per avviare un task:

```powershell
.\scripts\worktree-open.ps1 -BranchName "feature/<nome-task>"
```

A task concluso, verificato e mergiato:

```powershell
.\scripts\worktree-close.ps1 -BranchName "feature/<nome-task>"
```

---

## Elenco Task e Stato

| ID | Task | Sezione / Elemento | Obiettivo Principale | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Carosello "Island" | `#funzioni` (dopo hero) | 5 card demo con scroll-snap, autoplay 5s, pausa su gesto, badge "Esempio". | ✅ Completato (HEROUX67) |
| **UI-02** | Parallax Card 3D | `#profili` (tra #funzioni e #home-about) | 3 card con tilt 3D, pop-out dell'illustrazione centrale, contrasti dark/light. | ✅ Completato (HEROUX68) |
| **UI-03** | Pagina 404 Neon | `404.html` | Pagina d'errore responsive con tema dark neon, glow teal, rientro rapido bacheca. | ✅ Completato (`404.html`) |
| **UI-04** | Fix Realistic Switch | `#es-nav-theme` (`.realistic-switch`) | Reset completo contenitore, levetta interna (`.rs-thumb`), hit area 44px. | ✅ Completato (HEROUX72) |
| **UI-05** | Animazione Logout | Menu utente / Action Menu | Transizione fluida di chiusura sessione con feedback visivo e ripulitura sicura stato client senza layout shift. | ✅ Completato (HEROUX74) |
| **UI-06** | Ricerche & Selezioni UX | Form, Bacheca, Mappa, Filtri | 6 Regole UX: combobox con ricerca, date digitabili fluide, multi-select, portal collisioni, segmented. | ✅ Completato (HEROUX73) |
| **UI-07** | Setup Ambiente Claude Code | `.claude/`, `CLAUDE.md`, `docs/`, `scripts/` | Configurazione completa permessi, hook Windows Node.js, subagents di revisione, script di verifica. | ✅ Completato |

---

## Vincoli Non Negoziabili per Tutti i Task

1. Un solo header / navbar in tutto il documento.
2. Sfondo globale unico (`body.layout-portfolio::before`), sezioni sempre trasparenti.
3. Nessun stile inline, nessun `!important`.
4. Traduzione IT ed EN sempre sincronizzata in `i18n.js`.
5. Verifica obbligatoria su desktop (1366x768) e smartphone (390px), dark e light mode.
