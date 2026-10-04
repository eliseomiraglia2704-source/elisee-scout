# CLAUDE.md — Memoria Operativa di Elisee Scout

@AGENTS.md
@docs/brand-brain-scout.md

> Il documento `@docs/brand-brain-scout.md` è la baseline per contenuti, prompt e decisioni di prodotto. In caso di conflitto tra brand-brain e altre regole, mostra esplicitamente il conflitto e non scegliere da solo.

---

## 1. Architettura & Stack Tecnologico

- **Stack**: Vanilla HTML5, Vanilla CSS3, Vanilla ES6+ JS puro. Nessun bundler (no Vite, no Webpack), nessuna libreria non necessaria.
- **Deploy & Runtime**: Piattaforma ospitata su **Vercel** (`vercel.json`, Serverless Functions in `/api`). Deploy in produzione: `vercel --prod` (richiede sempre conferma esplicita `ask`).
- **Sviluppo Locale**: `APRI_SITO.bat` o `python elisee_up.py` (porta 8080). Avviare in background con `Ctrl+B` per continuare a lavorare, consultando i log solo al bisogno.
- **Perimetro**: Il codice del sito risiede nella root. Le cartelle `ELISEE-SCOUT/` ed `eliseo2704/` (app mobile Expo) sono **fuori perimetro**: non toccarle né modificare `eliseo2704/.claude/settings.json`.

---

## 2. Regole di Design & Convenzioni di Progetto

- **Direzione Estetica**: Luxury tech e professionale. Tonalità scure profonde con luce diffusa, contrasto rigoroso, tipografia chiara (Inter per dati, Nevera/Outfit/Oswald per titoli).
- **Divieti Assoluti**: Niente stile videogioco, niente emoji, niente colori saturi a blocchi, niente pillole piene ovunque. Nessuna menzione di roadmap interne, pillar o conteggio agenti IA su pagine pubbliche. L'header della pagina Ambassador non si tocca.
- **Eccezione Concessa**: Il minigioco `elisee-world/` (RPG 16-bit retro) è un modulo confinato ed è l'unica eccezione alla regola "niente stile videogioco".
- **Regole d'Oro Strutturali**:
  1. *Navbar Unica*: un solo componente header in pagina (`header.public-header`), switch tema skeuomorfico senza rotazioni parassite del riquadro.
  2. *Sfondo Globale Fisso*: posizionato su `body.layout-portfolio::before` (`position: fixed; inset: 0; z-index: -1`). Tutte le sezioni sono trasparenti (`background: transparent`), nessun nero pieno `#000000` di sezione.
  3. *Token & Temi*: Dark Mode (`vault-neon`) e Light Mode (`mimetico-chiaro`) usano i medesimi token (`--card-bg`, `--card-border`, `--es-ctrl-accent` teal). Card racchiuse con `--card-bg` e `--card-border`.
  4. *CSS Pulito*: Prefissi per componente, variabili CSS, **MAI `!important`**, **MAI stili inline**. Cercare e rimuovere le regole obsolete prima di aggiungerne di nuove.
  5. *i18n Obbligatorio*: Dizionario IT/EN in `i18n.js` obbligatorio per ogni nuova stringa (IT lingua madre, EN sincronizzato).
  6. *Integrità & Dati*: Modifiche estetiche non toccano logica, endpoint, auth o dati. Nessun dato fittizio spacciato per reale (solo esempi etichettati "Esempio"), nessuna foto o logo di terzi non autorizzato.

---

## 3. Compliance GDPR, Minori & Sicurezza

- **Regole Vincolanti**: Zero fake account, verifica documenti d'identità in 30 giorni (`verifica-account.js`), tutela minori con consenso genitoriale (art. 13 e 30 GDPR).
- **Modifiche Sensibili**: Qualsiasi modifica a data di nascita, età (`isMinor()`), consensi, profili o campi anagrafici è classificata come **sensibile** e richiede un piano approvato prima di toccare il codice. Il formato ISO `YYYY-MM-DD` va sempre preservato nei cambi di valore.
- **Problemi Noti (Intoccabili senza piano approvato)**:
  - OTP lato client con codici di fallback.
  - Controlli admin basati su `localStorage` / header `X-Elisee-Admin: admin123`.

---

## 4. Modalità di Lavoro & Flusso Operativo

- **Plan Mode Obbligatoria**: Per qualsiasi task che tocca più di 2 file, per l'unificazione di componenti (navbar, sfondo, controlli selezione), modifiche al tema o a dati personali. Proponi il piano, attendi l'approvazione e poi implementa.
- **Ragionamento Esteso**: Riservato esclusivamente a refactor complessi di architettura; non usarlo per interventi minimi.
- **Gestione Contesto & Sessioni**: Una sessione = un task. A conclusione, comprimere con `/compact` specificando decisioni prese, file modificati e punti aperti. Usare `/clear` tra task non correlati.
- **Checkpointing**: Eseguire checkpoint o commit di sicurezza e usare `/rewind` prima di grandi refactor.
- **Worktrees Paralleli**: Per lavorare più task in parallelo senza collisioni, usa `scripts/worktree-open.ps1` e `scripts/worktree-close.ps1`. Consulta il backlog in `docs/BACKLOG-UI.md`.
- **Stile di Output**: Risposte dirette, asciutte e orientate all'azione. Mostra prima l'elenco dei file toccati, poi il risultato ottenuto e le verifiche (screenshot desktop 1366x768 e mobile 390px, dark/light, IT/EN, tastiera a11y, prefers-reduced-motion).
