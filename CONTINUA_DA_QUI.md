# Elisee Scout — continua da qui

File di passaggio tra sessioni / account Grok.
**Aprilo per primo** se stai riprendendo il progetto.

Ultimo aggiornamento: **2026-08-27**
Ultimo fatto: **Calciatore visibile + OTP riparato in barra in basso**: 1) la dashboard Calciatore non viene più coperta da overlay OTP. 2) OTP non è stato rimosso: Invia codice + 4 cifre + Verifica stanno in una barra fissa in basso; send/verify con challenge firmato; dopo verifica la barra sparisce. File: `verifica-account.js`, `verifica-account.css`, `index.html`, `sw.js`. Cache `OTP_BAR1`.
Feature precedente: Tema luxury con palette ottone (scartata).
Sito pubblico: **https://elisee-scout.vercel.app**
Repo: **https://github.com/eliseomiraglia2704-source/elisee-scout** (`main`)

---

## Come riaprire con un altro account Grok

1. Apri Grok sul secondo account.
2. Apri questa cartella:
   - `C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO`
   - se non c’è: `D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO`
3. Primo messaggio da scrivere:

> Leggi `CONTINUA_DA_QUI.md` e `AGENTS.md` in questa cartella. Continua Elisee Scout da lì. Dopo ogni modifica: aggiorna questo file, commit, push GitHub, `vercel --prod`.

4. Locale: `APRI_SITO.bat` → **http://127.0.0.1:8080/**
5. Online: **https://elisee-scout.vercel.app**

---

## Rituale obbligatorio (ogni modifica)

Non chiudere un task senza questa sequenza:

1. Aggiorna **questa pagina** (data, hash commit, “ultimo fatto”, “prossimo passo”).
2. Se hai toccato HTML/CSS/JS: alza `?v=YYYYMMDD_…` in `index.html` e `CACHE` in `sw.js`.
3. `git add` solo i file della feature (mai `data/autopilot/*`, `data/auth/*`, `data/manager/state.json`).
4. `git commit` con messaggio in italiano, una riga.
5. `git push origin main`
6. Dalla cartella del sito: `vercel --prod` (**senza** `--yes`). Attendi `Aliased https://elisee-scout.vercel.app` e `Ready`.

Push GitHub: se GCM è su `sfondiitaliani23-svg` può dare 403. Username corretto: **eliseomiraglia2704-source**. Il deploy Vercel **non dipende** dal push: pubblica comunque.

---

## Cos’è il progetto

Sito statico HTML/CSS/JS + Python `elisee_up.py` in locale sulla porta **8080**.
Online: Vercel (progetto `eliseeshop/elisee-scout`), API serverless in `api/`.

Catalogo squadre: `data/squadre/catalog.json` (~2901 team). Kit in `team.kits[]`.
Club slim per mappa/scopri: `data/squadre/scopri-clubs.json`.

Auth: localStorage + `/api/auth/*`, PBKDF2. Ruoli in registrazione: **ENTE, SQUADRA, GIOCATORE, STAFF, TIFOSO**.
Admin sito: header `X-Elisee-Admin: admin123` (stesso valore usato dal client admin).

---

## Stato attuale (fatto, non rifare)

Flusso recente, dal più nuovo:

| Commit | Cosa |
|---|---|
| (questo) | Selettore squadra: kit raggruppati (Partita/Portiere/Pre-match/Allenamento) |
| `82552af` | Selettore squadra: tutti i kit 2D in cartella |
| `1c8f08c` | Dashboard Biglietteria: vendite, abbonamenti, affluenza |
| `4e0ac99` | Dashboard Segretario Generale: tesseramenti, pratiche, adempimenti |
| `9750bfa` | Dashboard Magazziniere: inventario, kit, ordini |
| `9b9242b` | Dashboard Nutrizionista: piani alimentari, composizione |
| `0127f31` | Dashboard Ufficio Stampa: comunicazione, media, comunicati |
| `5adecd3` | Dashboard Marketing: sponsor, brand, partnership |
| `e3f459f` | Dashboard Procuratore: agente FIFA, portfolio, trattative |
| `2a0113b` | Dashboard Direttore Generale: direzionale, budget, decisioni |
| `8ea1718` | Trofei minigioco per nazione + maglie home/away |
| `8d99ff0` | Dashboard Preparatore Atletico: fisica, carichi, GPS, prevenzione |
| `56c8c5c` | Dashboard Preparatore Portieri: tecnica, sessioni, vivaio |
| `4a96837` | Dashboard Team Manager: organizzativa, trasferte, pratiche |
| `7cbfa0f` | Dashboard Osservatore: scouting, segnalazioni, Secret List |
| `feb1016` | Dashboard Tifoso: passione, tessera, registro presenze |
| `ad90ff2` | Dashboard Staff Medico: visite, idoneità, compliance |
| `2b4c64c` | Dashboard Match Analyst: report, video, scouting avversari |
| `c0b1ad6` | Dashboard Fisioterapista |
| `cb9d60d` | Hub Mercato: Secret List nel profilo DS/Scout + Wall FIFA |
| `a69b460` | Hub Mercato: Secret List stealth + Wall FIFA |
| `e1435e4` | Privacy v1.3: Titolare + geo / moderazione / Scheda Tecnica IA |
| `6f81fe2` | Pannello TC: panoramica completa e ingresso dall'area account |
| `f00eb09` | Pannello TC Manager: iscrizioni, quote, ruoli, calendario, documenti, soci |
| `9021752` | Ogni utente suggerisce modulo/XI; Admin Accetta/Declina |
| `1da5596` | Seleziona squadra apre formazione XI stile videogioco |
| `aa776ee` | Chi segui / Chi segue, in ogni area utente |
| `0fd8e34` | Mappa club: stemmi come pin + geolocalizzazione |
| `9d5b9a8` | Scopri profili per tutti i ruoli + ricerca avanzata |
| `f42525c` | Messaggi B2B |
| `9deec01` | Follow staff (social) |
| `15ff93e` | Notifiche in ogni area utente |
| `35c5657` | Area Staff: ruolo preciso (Allenatore, Fisioterapista, …) a ogni login |
| `67fb207` | Area Giocatore: “Il mio profilo Player” |
| `cad5dac` | Picker ruolo post-signup |
| `0441783` | Manager Elisee Scout (candidature + proposte anagrafica) |

### Formazione / moduli (ultimo pezzo chiuso)

- **Utente:** da Seleziona squadra → campo XI. Sceglie modulo (`4-3-3`, `4-2-3-1`, `4-4-2`, `3-5-2`) come **bozza**. Pulsante **Suggerisci modulo / formazione** + nota. Serve login. Un solo suggerimento in attesa per squadra.
- **Admin:** area riservata → chip **Manager Elisee** → colonna **Formazioni / moduli** → Accetta / Declina.
- Accettare rende il modulo **ufficiale** per quella squadra.

File:

- `formazione-squadra.js` / `.css` — UI campo, bozza, suggest
- `index.html` — `#view-formazione`, pannello `#es-xi-suggest-btn`
- `manager-runtime.js` / `manager.css` — inbox admin 3 colonne
- `api/manager.js` — Vercel: `propose-lineup`, `view=official`, `decide` kind `lineup`
- `workers/manager_store.py` + `elisee_up.py` — stesso contratto in locale (persistenza `data/manager/state.json`, gitignored)
- Cache attuale: `?v=20260827_LUX2`, SW `elisee-scout-v20260827-lux2`

localStorage:

- `elisee_team_xi` — XI locale / slot reclamati
- `elisee_lineup_proposals` — coda locale (fallback se API assente)
- `elisee_official_xi` — modulo ufficiale accettato
- `elisee_active_user`, `elisee_user_auth`, `elisee_auth_token`
- `elisee_social_following`
- `elisee_b2b_threads_v1`
- `elisee_secret_lists_v1` — Secret List per DS/Scout (solo locale, stealth)
- `elisee_transfer_wall_v1` — Wall trattative chiuse
- `elisee_job_sheets_v1` — schede tecniche IA per annuncio
- `elisee_admin_auth`

Eventi: `elisee:squadra-selected`, `elisee:lineup-official`.

Nota Vercel: lo store manager è su `/tmp` (effimero). In locale `state.json` è duraturo. Il client tiene anche la coda in localStorage così Accetta/Declina resta usabile.

---

## File chiave (non sparpagliare logica)

| Area | File |
|---|---|
| Pagina unica | `index.html` |
| Router viste / hash | `app.js` (`switchView`) |
| Profilo Player/Staff, tab utente | `player-profile.js` / `.css` |
| Dashboard Match Analyst | `ma-dash.js` / `.css` — report, video, scouting |
| Dashboard Staff Medico | `med-dash.js` / `.css` — visite, idoneità, compliance |
| Dashboard Tifoso | `tifoso-dash.js` / `.css` — passione, tessera, presenze |
| Dashboard Osservatore | `obs-dash.js` / `.css` — scouting, segnalazioni |
| Dashboard Team Manager | `tm-dash.js` / `.css` — organizzativa, trasferte |
| Dashboard Preparatore Portieri | `gk-dash.js` / `.css` — tecnica, sessioni |
| Dashboard Preparatore Atletico | `at-dash.js` / `.css` — fisica, carichi, GPS |
| Dashboard Settore Giovanile | `yg-dash.js` / `.css` — vivaio, categorie |
| Dashboard Direttore Generale | `dg-dash.js` / `.css` — direzionale, budget |
| Dashboard Procuratore | `ag-dash.js` / `.css` — agente FIFA, portfolio |
| Dashboard Marketing | `mk-dash.js` / `.css` — sponsor, brand, partnership |
| Dashboard Ufficio Stampa | `pr-dash.js` / `.css` — comunicazione, media |
| Dashboard Nutrizionista | `nu-dash.js` / `.css` — piani alimentari |
| Dashboard Magazziniere | `eq-dash.js` / `.css` — inventario, kit, ordini |
| Dashboard Segretario Generale | `sg-dash.js` / `.css` — tesseramenti, pratiche |
| Dashboard Biglietteria | `bt-dash.js` / `.css` — vendite, abbonamenti, affluenza |
| Scopri / follow | `scopri-profili.js` / `.css` |
| Messaggi | `messaggi.js` / `.css` |
| Mappa | `mappa-club.js` / `.css` |
| Chi segui | `chi-segui.js` |
| Seleziona squadra | `squadre-select.js` / `.css` |
| Formazione XI | `formazione-squadra.js` / `.css` |
| Hub Mercato | `mercato-hub.js` / `.css` — Secret List + Wall |
| Schede tecniche | `schede-tecniche.js` / `.css` — dentro l’annuncio |
| Manager + admin inbox | `manager-runtime.js`, `manager.css`, `api/manager.js`, `workers/manager_store.py` |
| Server locale | `elisee_up.py` porta 8080 |
| SW | `sw.js` |
| Catalogo | `data/squadre/catalog.json` |
| Club mappa/scopri | `data/squadre/scopri-clubs.json` |

Skill deploy (anche in questa cartella): `.grok/skills/elisee-scout-deploy/SKILL.md`
Copia utente Grok: `C:\Users\Eliseo Miraglia\.grok\skills\elisee-scout-deploy\SKILL.md`

---

## Prossimo passo

Nessuna richiesta aperta. Chiedere a Eliseo cosa fare dopo.

Match Analyst: se ruolo staff è Match analyst o Video analyst, al posto del form anagrafica compare la dashboard analitica (radar attività, compliance Wyscout/InStat, registro partite). Cache `MA1`.

Staff Medico: se ruolo staff è Medico sociale, dashboard visite mediche, idoneità, compliance FIGC/CONI. Distinta dal Fisioterapista. Cache `MD1`.

Tifoso: se il ruolo sito è Tifoso, dashboard passione sportiva (stadio, social, merchandising, trasferte), tessera del tifoso e registro presenze. Distinta da Giocatore e Staff. Cache `TF1`.

Osservatore: se ruolo staff è Scout / Osservatore, dashboard scouting (valutazioni, partite visionate, segnalazioni), distinta dal DS. Rail Secret List. Cache `OB1`.

Team Manager: se ruolo staff è Team manager, dashboard organizzativa (trasferte, pratiche, logistica). Cache `TM1`.

Preparatore Portieri: se ruolo staff è Preparatore dei portieri, dashboard tecnica (uscite, lavoro sui piedi, vivaio). Distinta da Allenatore e Preparatore atletico. Cache `GK1`.

Preparatore Atletico: se ruolo staff è Preparatore atletico, dashboard fisica (carichi, GPS, prevenzione infortuni). Distinta dal Preparatore dei portieri. Cache `AT1`.

Settore Giovanile: se ruolo staff è Responsabile settore giovanile, dashboard vivaio (categorie, promozioni, famiglie). Ruolo aggiunto in anagrafica. Cache `YG1`.

Direttore Generale: se ruolo staff è Direttore generale, dashboard direzionale (strategia, budget, decisioni). Distinta da Presidente e DS. Cache `DG1`.

Procuratore: se ruolo staff è Procuratore / Agente FIFA, dashboard portfolio e trattative. Distinta da DS e Osservatore. Cache `AG1`.

Marketing: se ruolo staff è Responsabile marketing / commerciale, dashboard sponsor, merchandising, partnership. Cache `MK1`.

Ufficio Stampa: se ruolo staff è Responsabile comunicazione / ufficio stampa, dashboard media, comunicati, social. Distinta dal Marketing. Cache `PR2`.

Nutrizionista: se ruolo staff è Nutrizionista, dashboard piani alimentari e composizione corporea. Distinta da Medico e Fisioterapista. Cache `NU1`.

Magazziniere: se ruolo staff è Magazziniere / Equipment Manager, dashboard inventario, kit gara, ordini fornitori. Cache `EQ1`.

Segretario Generale: se ruolo staff è Segretario generale / Club Manager (anche Segretario sportivo), dashboard tesseramenti, pratiche societarie, adempimenti. Distinta da Direttore generale e Team manager. Cache `SG1`.

Biglietteria: se ruolo staff è Responsabile biglietteria / tifoseria, dashboard vendite, abbonamenti, affluenza. Distinta dal Tifoso (ruolo sito). Ruolo aggiunto in anagrafica. Cache `BT1`.

Schede tecniche: da ogni annuncio in Bacheca → pulsante **Schede tecniche**. Le schede IA restano nella candidatura (`#schede-tecniche`), non via e-mail. Club: lista, scheda completa, confronto (fino a 3), stati (nuova / in valutazione / shortlist / scartata). Cache `ST1`.

Privacy: punti 4.6 + 6.l/m per Secret List e Wall.

---

## Diario sessioni

- **2026-08-27** — Palette ufficiale ripristinata sulle dashboard ruolo (`#050608` + `#38bdf8`). Layout professionale, colori di progetto. Cache `LUX2`.
- **2026-08-27** — Tema luxury su tutte le interfacce ruolo (Calciatore, staff, tifoso, TC, mister). Niente neon da videogioco. Cache `LUX1`.
- **2026-08-27** — Calciatore: cruscotto visibile (niente schermata nera). OTP riparato, non disattivato: niente bypass Eliseo, challenge firmato, banner in basso. Cache `PD_OTP2`.
- **2026-08-27** — Bugfix routing dashboard: leftover viste al cambio ruolo, Presidente che apriva DG/SG, Calciatore che lasciava `display:none` sullo staff, login admin senza verifica password, doppio popstate. War Room riattivata. Cache `BUGFIX1`.
- **2026-08-23** — Dashboard Nutrizionista: piani alimentari, composizione corporea, albo. Cache `NU1`.
- **2026-08-23** — Dashboard Ufficio Stampa / Comunicazione: media, comunicati, interviste. Cache `PR2`.
- **2026-08-23** — Dashboard Marketing / Commerciale: sponsor, brand, registro partnership. Cache `MK1`.
- **2026-08-23** — Dashboard Procuratore / Agente FIFA: portfolio assistiti, trattative, licenza FIFA. Cache `AG1`.
- **2026-08-23** — Dashboard Direttore Generale: visione strategica, budget, registro decisioni. Distinta da Presidente e DS. Cache `DG1`.
- **2026-08-23** — Audit cartelle: trofei minigioco in sottocartelle nazione (JS aggiornato); maglie Albinoleffe/Empoli/Juve Stabia rinominate home/away. 14 cartelle kits ancora con nomi Picsart/numerici.
- **2026-08-20** — Dashboard Responsabile Settore Giovanile: vivaio, categorie, promozioni. Cache `YG1`.
- **2026-08-20** — Dashboard Preparatore Atletico: fisica, carichi, GPS, prevenzione. Cache `AT1`.
- **2026-08-20** — Dashboard Preparatore Portieri: tecnica, sessioni, vivaio. Cache `GK1`.
- **2026-08-20** — Dashboard Team Manager: organizzativa, trasferte, pratiche FIGC. Cache `TM1`.
- **2026-08-20** — Dashboard Osservatore (Scout): scouting, segnalazioni, Secret List. Cache `OB1`.
- **2026-08-20** — Dashboard Tifoso: passione sportiva, tessera, registro presenze. Cache `TF1`.
- **2026-08-20** — Dashboard Staff Medico (Medico sociale): visite, idoneità, compliance sanitaria. Cache `MD1`.
- **2026-08-20** — Dashboard Match Analyst: report, video, scouting avversari, registro analisi partite. Cache `MA1`.
- **2026-08-20** — Dashboard Fisioterapista: attività sanitaria, registro trattamenti, efficienza recuperi. Cache `FT1`.
- **2026-08-25** — Simulatore Ruoli Creatore: pillola fluttuante + voce nel menu utente per switchare al volo tra tutti i 23 ruoli (Giocatore, Allenatore, Vice, Scout, DS, Presidente, DG, Match Analyst, Medico, Fisio, Nutrizionista, Portieri, Atletico, Giovanile, Team Manager, Agente, Marketing, Stampa, Magazziniere, Segretario, Biglietteria, Tifoso, Club TC) mostrando direttamente la dashboard attiva e registrata (con mock completi, zero blocchi di registrazione o form vuoti). File: `creator-role-switcher.js` / `.css`, `index.html`, `sw.js`. Cache `CR1`.
- **2026-08-25** — Seleziona squadra: risolto disallineamento logo/cerchio pulsante nell'overlay stadio (`.es-sq-load-crest` unificato e sovrapposto, fix fallback nascosto). File: `squadre-select.js` / `.css`, `index.html`. Cache `SQCREST`.
- **2026-08-23** — Selettore squadre: kit organizzati per gruppi (Partita, Portiere, Pre-match, Allenamento, Extra). File: `squadre-select.js` / `.css`, `index.html`. Cache `KITGRP`.
- **2026-08-20** — Dashboard Vice Allenatore (Allenatore in seconda): contributo tecnico, registro sessioni. Cache `VA1`.
- **2026-08-20** — Dashboard Presidenza: governance societaria, valore club, compliance, registro decisioni. Cache `PR1`.
- **2026-08-20** — Dashboard Direttore Sportivo: performance dirigenziale, valore rosa, registro trattative. Cache `DS1`.
- **2026-08-20** — Dashboard Allenatore: Discorso pre-partita, indice di efficacia, compliance staff, registro discorsi. Cache `CD1`.
- **2026-08-20** — Dashboard analitica giocatore v3.0 (radar FIFA, indice, mercato, compliance, registro). Navbar macroaree su una riga. Cache `PD1`.
- **2026-08-20** — Pubblica candidatura (Club): form Cosa offriamo / Cosa richiediamo, opzione IA auto-candidatura. Cache `ST3`.
- **2026-08-20** — Scheda tecnica IA completa: anagrafica, contatti solo se autorizzati, esperienze, formazione, competenze, lingue, disponibilità, CV, foto/video, compatibilità e punti di forza. Cache `ST2`.
- **2026-08-20** — Schede tecniche IA raccolte nella candidatura pubblicata. File: `schede-tecniche.js` / `.css`. Ingresso da Bacheca. Cache `ST1`.
- **2026-08-20** — Hub Mercato: Secret List nel profilo Staff DS/Scout; Wall FIFA con ribbon UFFICIALE, maglia, card e ticker. Cache `MKT2`.
- **2026-08-20** — Hub Mercato B2B: Secret List stealth per DS/Scout (colonne POR/DIF/CEN/ATT, priorità, note private, zero notifiche) e Wall trattative chiuse stile FIFA (card, maglia, TRASFERITO). File: `mercato-hub.js` / `.css`. Cache `MKT1`.
- **2026-08-20** — Informativa privacy v1.3: punto 3 (Titolare) con chat e area riservata; geolocalizzazione (punti 4 e 6), moderazione messaggi (punti 6 e 14), Scheda Tecnica IA per Club (punti 6, 7, 15, 17 Art. 22). Numerazione allineata all’indice (14–19). File: `privacy-policy.html`. Cache SW `priv1`.
- **2026-08-20** — Chiuso suggest modulo/XI + admin (`9021752`). Poi `CONTINUA_DA_QUI.md` + `AGENTS.md` + skill deploy in `.grok/skills/` (`7ec3186`) per cambiare account Grok senza perdere il filo.
- **2026-08-20** — Corretto italiano mojibake in Ambassador e `index.html` (`66d33c0`).
- **2026-08-20** — Anti-fake: 30 giorni per allegare documenti (CI + selfie). Banner + notifiche ogni 2 giorni. Scaduto → account chiuso, login bloccato. Tifoso escluso. File: `verifica-account.js` / `.css`, `workers/auth_store.py` (`sync_verify_docs`), `elisee_up.py` `POST /api/auth/verify-docs`. Cache `VF1`.
- **2026-08-20** — Seleziona squadra: overlay 2s stadio della squadra (`stadiumImage`) + logo pulsante, poi formazione. `squadre-select.js` / `.css`, cache `STAD1`.
- **2026-08-20** — Messaggi B2B: tema dark, header pf-page, shell inbox|chat. `messaggi.css` / `.js`, cache `MSG1`.
- **2026-08-20** — Omogeneità colori homepage: Scopri, Chi segui, Mappa, Player/Staff, Notifiche, picker ruolo. Cache `DARK1`.
- **2026-08-20** — Regola 30 giorni documenti resa visibile (banner sotto header, card in dossier, avvisi ogni 12h, chiusura a scadenza). Cache `VF2`.
- **2026-08-20** — Loading stadio 2s rinforzato: overlay su `document.body`, z-index 3e6, poi formazione. Cache `STAD2`.
- **2026-08-20** — Scopri solo da account loggato (tab utente / menu account). Navbar pubblica senza Scopri. `requireEliseeLogin`. Cache `SCO1`.
- **2026-08-20** — Pannello TC Manager: `tc-panel.js` / `.css`, `#tc-portal`, modulo pubblico `#iscrizione-portal?team=`. Cache `TC1`.
