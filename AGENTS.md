# Elisee Scout — istruzioni per qualsiasi agente

Leggi prima **`CONTINUA_DA_QUI.md`**. Quello è lo stato vivo (ultimo commit, cosa è fatto, prossimo passo). Questo file sono le regole fisse.

## Progetto

Cartella: `C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO`
Fallback: `D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO`
Pubblico: https://elisee-scout.vercel.app
GitHub: `eliseomiraglia2704-source/elisee-scout` branch `main`
Locale: http://127.0.0.1:8080/ (`elisee_up.py`, avvio `APRI_SITO.bat`)

Sito statico HTML/CSS/JS. Non introdurre un bundler o un framework.

## Dopo ogni modifica (obbligatorio)

Eliseo ha chiesto esplicitamente: **salva, pubblica, pusha**, e lascia traccia in cartella così un altro account Grok può riprendere.

1. Aggiorna `CONTINUA_DA_QUI.md` (data, hash, ultimo fatto, diario).
2. Cache-bust: `?v=` in `index.html` + `CACHE` in `sw.js` se HTML/CSS/JS.
3. Commit (niente `data/autopilot/*`, `data/auth/*`, `data/manager/state.json`).
4. `git push origin main`
5. `vercel --prod` dalla cartella del sito. **Non** usare `--yes`. Timeout ≥ 5 minuti. Attendi alias su https://elisee-scout.vercel.app

Se il push dà 403 (account Git `sfondiitaliani23-svg`), pubblica comunque su Vercel. Username GitHub corretto: `eliseomiraglia2704-source`.

## Stile di lavoro

- Parla italiano con Eliseo.
- Non rifare le feature elencate in `CONTINUA_DA_QUI.md`.
- Non inventare il prossimo task: chiedi o aspetta.
- Commenti nel codice: solo vincoli non ovvi, niente diario di implementazione.
- Admin Manager: header `X-Elisee-Admin: admin123`.
- Store manager Vercel = `/tmp` (effimero). Locale = `data/manager/state.json`. Il client ha fallback localStorage per le formazioni.
- Anti-fake: dopo il ruolo (non Tifoso) l’utente ha 30 giorni per allegare documento + selfie. Avvisi continui, poi chiusura automatica (`verifica-account.js`).
- Pannello TC Manager (`tc-panel.js`): iscrizioni con link, quote, comunicazioni per ruolo, calendario/presenze, documenti/scadenze, profilo atleta, soci/verbali. Modulo pubblico `#iscrizione-portal?team=ID`.
- Hub Mercato (`mercato-hub.js`): Secret List stealth solo DS/Scout (niente notifiche a atleta/procuratore/club); Wall trattative chiuse stile FIFA (`#mercato-hub`, `#wall-trasferimenti`).
- Schede tecniche IA (`schede-tecniche.js`): raccolte nella candidatura pubblicata (`#schede-tecniche`), non via e-mail. Club consulta, confronta e gestisce gli stati.
- Pubblica candidatura: riservata ai profili Club. Form a due blocchi (Cosa offriamo / Cosa richiediamo) + opzione IA che candida in automatico i profili compatibili.
- Area giocatore: dashboard analitica v3.0 (`player-dash.js`) al posto del solo form. Navbar macroaree su una riga.
- Area Allenatore: dashboard Discorso Allenatore (`coach-dash.js`) se il ruolo staff è Allenatore (non in seconda).
- Area Vice Allenatore: dashboard contributo tecnico (`vice-dash.js`) se il ruolo è Allenatore in seconda / Vice allenatore.
- Area Fisioterapista: dashboard sanitaria (`fisio-dash.js`) se il ruolo staff è Fisioterapista.
- Area Match Analyst: dashboard report/video/scouting (`ma-dash.js`) se il ruolo è Match analyst o Video analyst.
- Area Staff Medico: dashboard sanitaria (`med-dash.js`) se il ruolo è Medico sociale.
- Area Tifoso: dashboard passione/presenze (`tifoso-dash.js`) se il ruolo sito è Tifoso. Distinta da Giocatore e Staff.
- Area Direttore Sportivo: dashboard DS (`ds-dash.js`) se il ruolo staff è Direttore sportivo. Rail: Secret List.
- Area Osservatore: dashboard scouting (`obs-dash.js`) se il ruolo è Scout / Osservatore. Distinta dal DS. Rail: Secret List.
- Area Team Manager: dashboard organizzativa (`tm-dash.js`) se il ruolo è Team manager.
- Area Preparatore Portieri: dashboard tecnica (`gk-dash.js`) se il ruolo è Preparatore dei portieri. Distinta da Allenatore e Preparatore atletico.
- Area Preparatore Atletico: dashboard fisica (`at-dash.js`) se il ruolo è Preparatore atletico. Distinta da Preparatore dei portieri.
- Area Settore Giovanile: dashboard vivaio (`yg-dash.js`) se il ruolo è Responsabile settore giovanile.
- Area Direttore Generale: dashboard direzionale (`dg-dash.js`) se il ruolo è Direttore generale. Distinta da Presidente e DS.
- Area Presidente: dashboard Presidenza (`pres-dash.js`) se il ruolo staff è Presidente.

## Skill

`.grok/skills/elisee-scout-deploy/SKILL.md` — deploy dopo ogni modifica visibile.
