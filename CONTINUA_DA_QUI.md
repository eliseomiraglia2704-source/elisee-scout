# Elisee Scout — continua da qui

File di passaggio tra sessioni / account Grok.
**Aprilo per primo** se stai riprendendo il progetto.

Ultimo aggiornamento: **2026-08-31**
Ultimo fatto: **Aggiornamento Logo Pontevecchio (Eccellenza Umbria)** — Scaricato e applicato il logo ufficiale in alta risoluzione in `immagini/squadre-loghi/ecc-pontevecchio.png`.
Feature precedente: Aggiornamento Logo Padule 1976 (Eccellenza Umbria).
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

Auth: localStorage + `/api/auth/*`, PBKDF2. Ruoli in registrazione: **ENTE, SQUADRA, GIOCATORE, STAFF, TIFOSO, GIORNALISTA**.
Admin sito: header `X-Elisee-Admin: admin123` (stesso valore usato dal client admin).

---

## Stato attuale (fatto, non rifare)

Flusso recente, dal più nuovo:

- **Eccellenza Veneto Girone B 2026/27** (16 squadre): Arcella Padova (Padova), Liapiave (San Polo di Piave), Borgo Valbelluna, Marosticense (Marostica), Cavarzano Belluno (Belluno), Portogruaro, Dolo 1909, Portomansuè (Mansuè), Eclisse Carenipievigina (Pieve di Soligo), Thiene 1908, Galliera (Galliera Veneta), Union Monte (Montebelluna), Godigese (Castello di Godego), Union Pro (Mogliano Veneto), LeO Oderzo, United Borgoricco Campetra (Borgoricco). Cache `ECCVENB1`.
- **Eccellenza Veneto Girone A 2026/27** (16 squadre): Adriese (Adria), Montecchio Maggiore, Ambrosiana (Sant'Ambrogio di Valpolicella), Montorio FC (Montorio), AQS Borgo Veneto (Borgo Veneto), Oppeano, Berton Bolzano Vicentino (Bolzano Vicentino), Piovese (Piove di Sacco), Castelnuovo del Garda, Pozzonovo, Chiampo, Vigasio, Limena, Villafranca Veronese (Villafranca di Verona), Mestrino United (Mestrino), Villafranchese (Villafranca Padovana). Cache `ECCVENA1`.
- **Eccellenza Toscana Girone B 2026/27** (16 squadre): Antella 99 (Antella), Montespertoli, Audax Rufina (Rufina), Poggibonsi, Baldaccio Bruni (Anghiari), Sangiovannese (San Giovanni Valdarno), Barberino Tavarnelle, Sansovino (Monte San Savino), Castiglionese (Castiglion Fiorentino), Sestese (Sesto Fiorentino), Colligiana (Colle di Val d'Elsa), Signa 1914 (Signa), Figline 1965 (Figline Valdarno), Asta Taverne (Siena; in Tuttocampo «Sport Club»), Lastrigiana (Lastra a Signa), Valentino Mazzola (Siena; in Tuttocampo «Valentino»). Cache `ECCTOSB1`.
- **Eccellenza Toscana Girone A 2026/27** (16 squadre): Belvedere Calcio (Grosseto), Pietrasanta, Camaiore, Real Cerretese (Cerreto Guidi), Castelnuovo Garfagnana, Real Forte Querceta (Forte dei Marmi), Fratres Perignano (Perignano), San Giuliano (San Giuliano Terme), Fucecchio, Sporting Cecina (Cecina), Lampo Meridien (Lamporecchio), Tuttocuoio (San Miniato), Larcianese (Larciano), Viareggio, Mobilieri Ponsacco (Ponsacco), Zenith Prato (Prato). Cache `ECCTOSA1`.
- **Eccellenza Molise 2026/27** (girone unico, 15 squadre): Aesernia Fraterna, FC Matese, Alife, Olympia Agnonese, Atletico Torremaggiore, Pietramontecorvino, Aurora Alto Casertano, Real Guglionesi, Bojano, San Leucio, CNC Sporting, Sesto Campano, Calcio Montenero, United Alife, Castel di Sangro. Cache `ECCMOL1`.
- **Eccellenza Lazio Girone A 2026/27** (18 squadre): Astrea, Grifone Gialloverde, Atletico Ardea, Luiss, Boreale, Montespaccato, Borgo Palidoro, Cavese 1919 (in Tuttocampo «MP Cavese»), Campus Eur, Ottavia, Civitavecchia, Real Monterotondo, Colleferro, Sorianese, FC Rieti, Tivoli Calcio, Fregene, W3 Maccarese. Cache `ECCLAZA1`.
- **Eccellenza Campania Girone A 2026/27** (18 squadre): Albanova 64, Portici 1906, Boys Caivanese, Virtus Puteolana, Castel Volturno, Quarto 2012, Ercolanese 1924, Rangers Qualiano, FC Pompei, Real Bacoli Sibilla, Il Punto di Svolta, Real Casoria, Marianella, Real Grazzanise, Polisportiva Gricignano, Santa Maria la Carità, Pomigliano 1920, Virtus Stabia. Cache `ECCCAMPA1`.
- **Eccellenza Abruzzo 2026/27** (girone unico, 18 squadre): Bacigalupo Vasto Marina, Mosciano, Celano, Ovidiana Sulmona, Chieti 1922, Pontevomano, Forza e Coraggio Avezzano, Pro Vasto, Folgore Delfino Curi, Rosetana, Francavilla 1927, San Giovanni Teatino, Fucense Trasacco, San Salvo, Montesilvano 1954, Torrese, Montorio 88, Virtus Cupello. Cache `ECCABR1`.
- **Eccellenza Campania Girone B + Lazio Girone B 2026/27** (Tuttocampo):
  - Campania B: Agerola, Alta Hirpinia, Apice, Battipagliese, Città di Campagna, Città di Pontecagnano, Città di Solofra, Costa d'Amalfi, Telese Terme, Heraclea, LMM Montemiletto, Poggio de Marinis, Rossoblù Castel San Giorgio, Salernum Baronissi, San Vito Positano, Sanseverinese, Sporting Ponte, US Angri.
  - Lazio B: Alatri, Arce 1932, Cassino, Città di Formia, Città Monte San Giovanni Campano, Ferentino, Lodigiani, Lupa Frascati, Polisportiva Gaeta, Pomezia, Real San Basilio, Roccasecca, Roma City, Salaria FC, SS Romulea, Sterparo, Terracina, Vis Sezze.
  - Rimossi i placeholder (Città di Napoli/Roma/Latina, ecc.). File: `catalog.json`, `focus.html`, `minigioco_clubs.json`, `campionati-agents.js`, `immagini/squadre-loghi/ecc-*.png`. Cache `ECCB1`.
- **UI homepage, niente videogioco**: formazione XI senza oro EA; selettore squadra anello sky non gold; Wall mercato senza carte FIFA oro; minigioco hub/categorie/OVR sulla palette `#38bdf8`.
- **Separazione Rigorosa Carriere Maschili e Femminili Minigioco** (`minigioco-carriera.js`):
  - Scelta esplicita del Genere di carriera (`⚽ Maschile` / `👩 Femminile`) nella schermata di definizione identità e nelle schede del provino.
  - Salvataggio e persistenza del genere nel profilo giocatore.
  - Isolamento totale di tutti i pool di squadre: `clubsByCatalogTier`, `clubsByTier`, `poolFits`, `playerFitsClub`, `transferOffers`, `fillFirstOffers`, `fillOffersFromTiers`, `pickFailMarketClub`, `evolveItalianLeagues`.
  - Nessuna squadra femminile potrà mai apparire nelle offerte di una carriera maschile e viceversa.
  - Badge genere dedicato nella card del giocatore (`⚽ Maschile` / `👩 Femminile`).
  - Trofei differenziati (Serie A Femminile, Coppa Italia Femminile, Supercoppa Femminile, Women's Champions League, Ballon d'Or Féminin, Mondiali/Europei Femminili) e dicitura convocazioni nazionali dedicata.

| Commit | Cosa |
|---|---|
| `a1c94c5` | Serie D Girone I 2026/27 (Serie D 100% completa): quote promozione/salvezza/retrocessione, penalizzazioni, bonus risalita, vincoli e lock `club-storia.js` |
| `e454e27` | Serie D Girone H 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `3520323` | Serie D Girone G 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `d0af3bb` | Serie D Girone F 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `44e3a1b` | Serie D Girone E 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `2c224fa` | Serie D Girone D 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `7e5d317` | Serie D Girone C 2026/27: quote promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `187c95d` | Serie D Girone A & B 2026/27: calcolo probabilità promozione/salvezza/retrocessione, bonus risalita, vincoli e lock `club-storia.js` |
| `66c056d` | Minigioco: simboli SVG genere, loghi categorie, fix girone Serie D/piramide-italia, fix selfCheck/stayWeight club-storia; loghi HD Eccellenza Piemonte e Puglia |
| `7f2645e` | Aggiornato logo ufficiale Cheraschese (668x1034px RGBA) da Tuttocampo e colori sociali |
| `4837a5b` | Aggiornato logo ufficiale Albese (1094x1500px RGBA) da Tuttocampo e colori sociali (Iniziato Girone B) |
| `f729d0e` | Aggiornato logo ufficiale Volpiano Pianese (650x662px RGBA) da Tuttocampo e colori sociali (Girone A completo) |
| `5e8e684` | Aggiornato logo ufficiale Sparta Novaromentino (1000x996px RGBA) da Tuttocampo e colori sociali |
| `cdb983a` | Aggiornato logo ufficiale Settimo (1500x1313px RGBA) da Tuttocampo e colori sociali |
| `7ed2704` | Aggiornato logo ufficiale Rivarolese (1166x1500px RGBA) da Tuttocampo e colori sociali |
| `61946d7` | Aggiornato logo ufficiale Quincinetto Tavagnasco (1098x1339px RGBA) da Tuttocampo e colori sociali |
| `47a5078` | Aggiornato logo ufficiale Pro Eureka (391x429px RGBA) da Tuttocampo e colori sociali |
| `8909bf5` | Aggiornato logo ufficiale Fulgor Chiavazzese (444x562px RGBA) da Tuttocampo e colori sociali |
| `23f19bd` | Aggiornato logo ufficiale Dufour Varallo (1300x1479px RGBA) da Tuttocampo e colori sociali |
| `a87cce5` | Aggiornato logo ufficiale Druentina (535x720px RGBA) da Tuttocampo e colori sociali |
| `53e5734` | Aggiornato logo ufficiale Casale (708x1000px RGBA) da Tuttocampo e colori sociali |
| `8445240` | Aggiornato logo ufficiale Briga (562x563px RGBA) da Tuttocampo e colori sociali |
| `aacc199` | Aggiornato logo ufficiale Borgaro (800x784px RGBA) da Tuttocampo e colori sociali |
| `0ccffdc` | Aggiornato logo ufficiale Baveno Stresa (571x703px RGBA) da Tuttocampo e colori sociali |
| `1f154f4` | Aggiornato logo ufficiale Aygreville (836x720px RGBA) da Tuttocampo e colori sociali |
| `db3960d` | Aggiornato logo ufficiale Autovip San Mauro (979x1000px RGBA) da Tuttocampo e colori sociali |
| `7099a44` | Aggiornato logo ufficiale Accademia Borgomanero (1291x1500px RGBA) da Tuttocampo e colori sociali |
| `0b46799` | Eccellenza Veneto Girone B 2026/27: organico ufficiale 16 squadre, città e loghi Tuttocampo |
| `5ac1f94` | Eccellenza Veneto Girone A 2026/27: organico ufficiale 16 squadre, città e loghi Tuttocampo |
| `8b9971f` | Eccellenza Toscana Girone B 2026/27: organico ufficiale 16 squadre, città e loghi Tuttocampo |
| `cc6e7cd` | Eccellenza Toscana Girone A 2026/27: organico ufficiale 16 squadre, città e loghi Tuttocampo |
| `f5f29cf` | Eccellenza Molise 2026/27: organico ufficiale 15 squadre, città e loghi Tuttocampo |
| `736f44c` | Eccellenza Lazio Girone A 2026/27: organico ufficiale 18 squadre, città e loghi Tuttocampo |
| `52414d0` | Eccellenza Campania Girone A 2026/27: organico ufficiale 18 squadre, città e loghi Tuttocampo |
| `585f41d` | Eccellenza Abruzzo 2026/27: organico ufficiale 18 squadre, città e loghi Tuttocampo |
| `d671502` | Eccellenza Campania B + Lazio B 2026/27 da Tuttocampo; UI XI/selettore/mercato/minigioco allineate alla homepage |
| `3db4114` | Separazione rigorosa carriere maschili e femminili minigioco |
| `d2d990e` | Scopri profili: riordino e allineamento card profili & pulsanti azione (+ Segui / Messaggia / Chi segue) |
| `245ff85` | Profilo Presidente da PDF: Guida operativa, Maglie ufficiali, Rosa Profilo Attivo vs Anteprima, Deleghe, Wall FIFA |
| `0e8c89a` | Profilo DS: hub B2B, Secret List, Wall, AI Advisor Match Index |
| `a57a6f9` | Profilo Calciatore: Card, Album, heatmap, GPS MVP, candidatura geo |
| `5f5eea1` | Logo ufficiale LND Terza Categoria 2026 (competizione) su selettore, minigioco, Focus |
| `307b5fa` | Logo ufficiale LND Seconda Categoria 2026 (competizione) su selettore, minigioco, Focus |
| `8edbf14` | Logo ufficiale LND Prima Categoria 2026 (competizione) su selettore, minigioco, Focus |
| `aaa1a4b` | Logo ufficiale LND Promozione 2026 (competizione) su selettore, minigioco, Focus |
| `3d24fbc` | Logo ufficiale LND Eccellenza 2026 (competizione) su selettore, minigioco, Focus |
| `06f3c12` | Loghi Tuttocampo reali per i 12 gironi Eccellenza 2026/27 |
| `1bce172` | Ruolo Giornalista / Content Creator + feed Stampa + coda staff |
| `b42605c` | OTP: codice solo via email, digitazione manuale, niente auto-fill |
| `16d2b79` | Eccellenza 2026/27 nel selettore squadra e nel minigioco carriera |
| `1d0d408` | Eccellenza: 12 gironi 2026/27 con città e loghi (Focus + catalogo) |
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
- Cache attuale: `?v=20260827_DS1`, SW `elisee-scout-v20260827-ds1`

### Giornalista / Content Creator (sito, non app)

Ruolo famiglia **Giornalista** in `modal-scegli-ruolo`. Non è Ufficio Stampa del club (`pr-dash.js`).
- Badge ciano **Stampa / Giornalista Verificato** solo con `badgeVerificaStato=approved`.
- Articoli con tag scheda giocatore/club, funnel geo Città → Provincia → Regione → Nazionale.
- Sondaggi e hub video (pre/post, acquisti, rubrica settimanale).
- Invio in coda «In attesa di approvazione»; staff/admin approva o rifiuta con checklist + note.
- Feed pubblico `#stampa-portal` (nav **Stampa**).
File: `giorn-dash.js` / `giorn-dash.css`.

### Logo competizione Eccellenza 2026 (LND)

Non è lo stemma delle società: è il marchio ufficiale LND 2026 (E bianca su pentagono blu, scritta LND).
Fonte Wikimedia Commons `File:Eccellenza_Logo_2026.svg` (PD-textlogo). Salvato in `immagini/squadre-loghi/eccellenza.png`.
Wiring: `leagueLogoPath` in `squadre-select.js`, `getLeagueLogoImg` in `minigioco-carriera.js`, header/tab Focus (`CATS.eccellenza.leagueLogo`). Cache `ECCLND1`.

### Logo competizione Promozione 2026 (LND)

Non è lo stemma delle società: è il marchio ufficiale LND 2026 (P bianca su pentagono viola, scritta LND).
Fonte Wikimedia Commons `File:Promozione_Logo_2026.svg` (PD-textlogo). Salvato in `immagini/squadre-loghi/promozione.png`.
Wiring: `leagueLogoPath` in `squadre-select.js`, `getLeagueLogoImg` in `minigioco-carriera.js`, header/tab Focus (`CATS.promozione.leagueLogo`). Cache `PROMLND1`.

### Logo competizione Prima Categoria 2026 (LND)

Non è lo stemma delle società: è il marchio ufficiale LND 2026 (1 bianco su pentagono arancione, scritta LND).
Fonte Wikimedia Commons `File:Prima_Categoria_Logo_2026.png` (PD-textlogo). Salvato in `immagini/squadre-loghi/prima-categoria.png`.
Wiring: `leagueLogoPath` in `squadre-select.js`, `getLeagueLogoImg` in `minigioco-carriera.js`, header/tab Focus (`CATS['prima-cat'].leagueLogo`). Cache `PCATLND1`.

### Logo competizione Seconda Categoria 2026 (LND)

Non è lo stemma delle società: è il marchio ufficiale LND 2026 (2 bianco su pentagono arancione, scritta LND).
Fonte Wikimedia Commons `File:Seconda_Categoria_Logo_2026.png` (PD-textlogo). Salvato in `immagini/squadre-loghi/seconda-categoria.png`.
Wiring: `leagueLogoPath` in `squadre-select.js`, `getLeagueLogoImg` in `minigioco-carriera.js`, header/tab Focus (`CATS['seconda-cat'].leagueLogo`). Cache `SCATLND1`.

### Logo competizione Terza Categoria 2026 (LND)

Non è lo stemma delle società: è il marchio ufficiale LND 2026 (3 bianco su pentagono arancione, scritta LND).
Fonte Wikimedia Commons `File:Terza_Categoria_Logo_2026.png` (PD-textlogo). Salvato in `immagini/squadre-loghi/terza-categoria.png`.
Wiring: `leagueLogoPath` in `squadre-select.js`, `getLeagueLogoImg` in `minigioco-carriera.js`, header/tab Focus (`CATS['terza-cat'].leagueLogo`). Cache `TCATLND1`.

### Profilo Calciatore (PDF 2026-08-27)

Da `presentazione_profilo_calciatore_*.pdf`. Sito, non app nativa.
- **Card collezionabile** in cima alla dashboard calciatore (`player-card.js` / `.css`): foto, età, ruolo, piede, status tesserato/svincolato, badge attitudine. Tap → vista tattica (heatmap, ruoli FM, stats, Video Hub).
- **Album** al posto di Segui per i profili Player. Nav «Album». Storage invariato: `elisee_social_following`.
- **Heatmap fine gara**: auto da ruolo+modulo (4-3-3, 4-2-3-1, …) o tocco zone. `elisee_player_heatmap`.
- **GPS MVP smartphone**: Inizia/Termina allenamento, km, vmax, sprint, acc, grafico, percorso, storico Allenamento→Settimana→Mese→Stagione. `elisee_gps_sessions`. Fase 2 hardware non implementata.
- **Candidatura smart**: imbuto Città/Provincia/Regione/Italia sulla Bacheca; **Candidati Ora** invia dossier Card (non email). `elisee_job_applications` + `elisee_smart_applications`.
File: `player-card.js` / `player-card.css`. Cache `CARD1`.

### Profilo Direttore Sportivo (PDF 2026-08-27)

Da `profilo_direttore_sportivo_*.pdf`. Sito, non app nativa.
- Hub B2B in cima alla dashboard DS (`ds-hub.js` / `.css`): anagrafica, ruolo ufficiale, club oppure «In cerca di progetto / Consulente indipendente», badge FIGC/Scout/Dirigente, geo operativa.
- Strumenti: pubblica posizione aperta, candidature in entrata, database scouting, Album, Secret List stealth, Wall trattative, messaggi, AI Advisor.
- Secret List: priorità **Obiettivo A / Obiettivo B / Svincolato d’emergenza**. Nessuna notifica all’atleta.
- Limiti: il DS non si candida agli annunci calciatori e non ha heatmap/GPS propri.
- AI Scouting Advisor: brief testuale → Match Index % (anagrafica, status, heatmap/ruoli, GPS). Azioni: Secret List, Contatta, Album, Scarta.
File: `ds-hub.js` / `ds-hub.css`. Cache `DS1`.

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

Eliseo manda uno screenshot Tuttocampo Classifica alla volta. Non inventare il prossimo girone. Completati: Campania A/B, Lazio A/B, Abruzzo, Molise, Toscana A/B, Veneto A.

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

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone I — Serie D Completa al 100%):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 17 squadre di Serie D Girone I (Calabria/Sicilia/Campania).
  - Gestione penalizzazioni federali a inizio campionato: Siracusa (-7), Trapani (-5), Gela (-1) con mantenimento del bonus risalita per blasone/rosa.
  - Applicazione vincolo geografico naturale Serie C (Girone C Sud) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Reggina 1914 (Alta), Siracusa (Alta), Trapani 1905 (Alta), Vibonese (Media).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDI1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone H):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 17 squadre di Serie D Girone H (Puglia/Campania/Basilicata).
  - Applicazione vincolo geografico naturale Serie C (Girone C Sud) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Turris (Alta), Fidelis Andria (Alta), Brindisi (Media-Alta), Bisceglie (Media), Francavilla (Media).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDH1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone G):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 16 squadre di Serie D Girone G (Lazio/Sardegna/Campania/Molise).
  - Applicazione vincolo geografico Serie C (Girone C Sud / Girone B Centro) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Gelbison (Alta), Paganese (Alta).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDG1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone F):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 17 squadre di Serie D Girone F (Marche/Abruzzo/Umbria).
  - Applicazione vincolo geografico Serie C (Girone B Centro Italia / Girone C Sud) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Teramo (Alta), Ancona (Alta), Recanatese (Media-Alta), Lanciano FC (Media-Bassa).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDF1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone E):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 17 squadre di Serie D Girone E (Toscana/Emilia-Romagna/Lazio-Umbria).
  - Applicazione vincolo geografico Serie C (Girone B Centro Italia / Toscana) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Siena (Alta), Lucchese (Alta), San Donato Tavarnelle (Media-Bassa), Aquila Montevarchi (Media-Bassa).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDE1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone D):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 18 squadre di Serie D Girone D (Lombardia/Emilia-Romagna/Toscana).
  - Applicazione vincolo geografico Serie C (Girone A Lombardia / Girone B Centro-Toscana-Emilia) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Pro Patria (Alta), Pontedera (Alta), Pro Sesto (Media).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDD1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Girone C):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutte le 16 squadre di Serie D Girone C (Triveneto/Friuli/Trentino-Alto Adige).
  - Applicazione vincolo geografico Serie C (Girone A/B Nord-Est) e retrocessione Eccellenza regionale.
  - Regola speciale *Bonus Risalita* per Triestina (Alta), Union Clodiense (Alta), Legnago Salus (Media).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDC1`.

- **2026-08-31** — Motore Simulazione Serie D 2026/27 (Gironi A e B):
  - Calcolo e assegnazione bande probabilità Promozione / Salvezza / Retrocessione per tutti i club di Serie D Girone A e Girone B.
  - Applicazione vincolo geografico per la destinazione Serie C e Serie D (in caso di retrocessione).
  - Regola speciale *Bonus Risalita* per i club retrocessi non favoriti (Milan Futuro, Sestri Levante, Virtus Verona, Fiorenzuola, Caldiero Terme, Bra, Sanremese).
  - Integrazione pesi storici reali, alias e lucchetti rigidi (HARD ceiling C) in `club-storia.js`.
  - Cache `SERIEDB1`.

- **2026-08-31** — Minigioco + piramide + club-storia: fix recuperati dopo errori API 429:
  - `minigioco-carriera.js`: sostituiti emoji genere (⚽/👩) con simboli SVG inline maschio/femmina; loghi competizione reali nelle schede categoria (al posto delle icone emoji); fix label Serie D per girone corretto (non sempre 'A'); femminile: aggiunta Eccellenza/Promozione Femminile con colori corretti.
  - `piramide-italia.js`: algoritmo girone Serie D migliorato — usa regione dalla stringa campionato, poi geo per nome città, poi fallback area nord/centro/sud.
  - `club-storia.js`: aggiunte funzioni `stayWeight` e `selfCheck` mancanti (bloccavano caricamento JS).
  - Loghi HD Eccellenza Piemonte (Chieri, Fossano, Cuneo 1905 Olmo, CSF Carmagnola, Pro Dronero, Pro Villafranca, Monregale, Moretta, Gaviese, Vanchiglia, Spartak San Damiano, Ovadese, San Domenico Savio Asti) e Puglia (Atletico Acquaviva, Atletico Racale, Brilla Campi, Cosmano Sport Foggia, Nuova Spinazzola, Soccer Trani, Unione Calcio Bisceglie).
  - Cache `GENDERSVG1`.


- **2026-08-31** — Aggiornato Logo Ufficiale Albese (Inizio Girone B):
  - Scaricato e integrato in RGBA (1094x1500px) il logo dell'Albese da Tuttocampo in `immagini/squadre-loghi/ecc-albese.png`, `albese.png`, `albese-calcio.png` e `alba.png`. Allineati colori sociali ufficiali (bianco-azzurro / bluceleste) nel catalogo. Cache `ALBESE1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Volpiano Pianese (Tutto il Girone A completato):
  - Scaricato e integrato in RGBA (650x662px) il logo del Volpiano Pianese da Tuttocampo in `immagini/squadre-loghi/ecc-volpiano-pianese.png`, `volpiano-pianese.png`, `volpiano.png` e `ecc-volpiano.png`. Allineati colori sociali ufficiali (blu-bianco) nel catalogo. Completato al 100% l'aggiornamento loghi HD di tutte le 16 squadre di Eccellenza Girone A. Cache `VOLPIANO1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Sparta Novaromentino:
  - Scaricato e integrato in RGBA (1000x996px) il logo dello Sparta Novaromentino da Tuttocampo in `immagini/squadre-loghi/ecc-sparta-novaromentino.png`, `sparta-novaromentino.png`, `novaromentino.png` e `sparta-novara.png`. Allineati colori sociali ufficiali (nero-verde-bianco) nel catalogo. Cache `SPARTA1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Settimo:
  - Scaricato e integrato in RGBA (1500x1313px) il logo del Settimo da Tuttocampo in `immagini/squadre-loghi/ecc-settimo.png`, `settimo.png`, `settimo-calcio.png` e `settimo-torinese.png`. Allineati colori sociali ufficiali (viola-bianco) nel catalogo. Cache `SETTIMO1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Rivarolese:
  - Scaricato e integrato in RGBA (1166x1500px) il logo della Rivarolese da Tuttocampo in `immagini/squadre-loghi/ecc-rivarolese.png`, `rivarolese.png`, `rivarolese-1906.png`, `ecc-rivarolo.png` e `rivarolo.png`. Allineati colori sociali ufficiali (granata-nero) nel catalogo. Cache `RIVAROLESE1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Quincinetto Tavagnasco:
  - Scaricato e integrato in RGBA (1098x1339px) il logo del Quincinetto Tavagnasco da Tuttocampo in `immagini/squadre-loghi/ecc-quincinetto-tavagnasco.png`, `quincinetto-tavagnasco.png`, `quincinetto.png`, `quinci-tava.png` e `ecc-quincitava.png`. Allineati colori sociali ufficiali (nerostellati / nerobianco) nel catalogo. Cache `QUINCITAVA1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Pro Eureka:
  - Scaricato e integrato in RGBA (391x429px) il logo del Pro Eureka da Tuttocampo in `immagini/squadre-loghi/ecc-pro-eureka.png`, `pro-eureka.png` e `pro-eureka-settimo.png`. Allineati colori sociali ufficiali (blucerchiato / blu-bianco-rosso-oro) nel catalogo. Cache `PROEUREKA1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Fulgor Chiavazzese:
  - Scaricato e integrato in RGBA (444x562px) il logo della Fulgor Chiavazzese da Tuttocampo in `immagini/squadre-loghi/ecc-fulgor-chiavazzese.png`, `fulgor-chiavazzese.png`, `chiavazzese.png`, `fulgor.png` e `ecc-chiavazzese.png`. Allineati colori sociali ufficiali (blu-rosso) nel catalogo. Cache `FULGOR1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Dufour Varallo:
  - Scaricato e integrato in RGBA (1300x1479px) il logo del Dufour Varallo da Tuttocampo in `immagini/squadre-loghi/ecc-dufour-varallo.png`, `dufour-varallo.png`, `dufour.png`, `varallo.png` e `ecc-varallo.png`. Allineati colori sociali ufficiali (neroverde) nel catalogo. Cache `DUFOUR1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Druentina:
  - Scaricato e integrato in RGBA (535x720px) il logo della Druentina da Tuttocampo in `immagini/squadre-loghi/ecc-druentina.png`, `druentina.png`, `druento.png` e `ecc-druento.png`. Allineati colori sociali ufficiali (rossoblù) nel catalogo. Cache `DRUENTINA1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Casale:
  - Scaricato e integrato in RGBA (708x1000px) il logo del Casale da Tuttocampo in `immagini/squadre-loghi/ecc-casale.png`, `casale.png`, `casale-fbc.png` e `casale-calcio.png`. Allineati colori sociali ufficiali (nerostellato) nel catalogo. Cache `CASALE1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Briga:
  - Scaricato e integrato in RGBA (562x563px) il logo del Briga da Tuttocampo in `immagini/squadre-loghi/ecc-briga.png`, `briga.png` e `briga-calcio.png`. Allineati colori sociali ufficiali (azzurro-bianco-rosso) nel catalogo. Cache `BRIGA1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Borgaro:
  - Scaricato e integrato in RGBA (800x784px) il logo del Borgaro da Tuttocampo in `immagini/squadre-loghi/ecc-borgaro.png`, `borgaro.png`, `borgaro-nobis.png` e `ecc-borgaro-nobis.png`. Allineati colori sociali ufficiali (blu-bianco-oro) nel catalogo. Cache `BORGARO1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Baveno Stresa:
  - Scaricato e integrato in RGBA (571x703px) il logo del Baveno Stresa da Tuttocampo in `immagini/squadre-loghi/ecc-baveno-stresa.png`, `baveno-stresa.png`, `baveno.png`, `stresa.png` e `ecc-baveno.png`. Allineati colori sociali ufficiali (biancoblu) nel catalogo. Cache `BAVENO1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Aygreville:
  - Scaricato e integrato in RGBA (836x720px) il logo dell'Aygreville da Tuttocampo in `immagini/squadre-loghi/ecc-aygreville.png`, `aygreville.png` e `aygreville-calcio.png`. Allineati colori sociali ufficiali (rossonero) nel catalogo. Cache `AYGREVILLE1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Autovip San Mauro:
  - Scaricato e integrato in RGBA (979x1000px) il logo dell'Autovip San Mauro da Tuttocampo in `immagini/squadre-loghi/ecc-autovip-san-mauro.png`, `autovip-san-mauro.png`, `san-mauro.png`, `autovip.png` e `ecc-san-mauro.png`. Allineati colori sociali ufficiali (gialloblù) nel catalogo. Cache `SANMAURO1`.

- **2026-08-31** — Aggiornato Logo Ufficiale Accademia Borgomanero:
  - Scaricato e integrato in RGBA (1291x1500px) il logo dell'Accademia Borgomanero da Tuttocampo in `immagini/squadre-loghi/ecc-accademia-borgomanero.png`, `accademia-borgomanero.png`, `borgomanero.png` e `ecc-borgomanero.png`. Allineati colori sociali ufficiali nel catalogo. Cache `BORGO1`.

- **2026-08-30** — Eccellenza Molise 2026/27 (girone unico 15 squadre): nomi ufficiali, città, loghi Tuttocampo. Cache `ECCMOL1`.
- **2026-08-30** — Eccellenza Lazio Girone A 2026/27 (18 squadre): nomi ufficiali, città, loghi Tuttocampo. Cache `ECCLAZA1`.
- **2026-08-30** — Eccellenza Campania Girone A 2026/27 (18 squadre): nomi ufficiali, città, loghi Tuttocampo. Cache `ECCCAMPA1`.
- **2026-08-30** — Eccellenza Abruzzo 2026/27 (girone unico 18 squadre): nomi ufficiali, città, loghi Tuttocampo. Cache `ECCABR1`.
- **2026-08-30** — Eccellenza Campania Gir. B e Lazio Gir. B 2026/27 da classifiche Tuttocampo (18+18, loghi RGBA). Catalogo, Focus, minigioco. UI: rimosso stile EA/FIFA da formazione, selettore, Wall mercato, hub minigioco. Cache `ECCB1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Urbino (Completata Eccellenza Marche 100%):
  - Scaricato e integrato in RGBA (720x720px) il logo dell'Urbino da Tuttocampo in `immagini/squadre-loghi/ecc-urbino.png` e `urbino.png`. Cache `LOGOURB1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Trodica:
  - Scaricato e integrato in RGBA (1080x1499px) il logo del Trodica da Tuttocampo in `immagini/squadre-loghi/ecc-trodica.png` e `trodica.png`. Cache `LOGOTROD1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Tolentino:
  - Scaricato e integrato in RGBA (1246x1500px) il logo del Tolentino da Tuttocampo in `immagini/squadre-loghi/ecc-tolentino.png` e `tolentino.png`. Cache `LOGOTOL1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Sangiustese:
  - Scaricato e integrato in RGBA (819x888px) il logo della Sangiustese da Tuttocampo in `immagini/squadre-loghi/ecc-sangiustese.png` e `sangiustese.png`. Cache `LOGOSANG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Fano (Nuova Versione):
  - Scaricato e integrato in RGBA (549x635px) il logo aggiornato del Fano da Tuttocampo in `immagini/squadre-loghi/ecc-fano.png` e `fano.png`. Cache `LOGOFAN2`.
- **2026-08-30** — Aggiornato Logo Ufficiale Osimana:
  - Scaricato e integrato in RGBA (880x1145px) il logo dell'Osimana da Tuttocampo in `immagini/squadre-loghi/ecc-osimana.png` e `osimana.png`. Cache `LOGOOSI1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Montegranaro:
  - Scaricato e integrato in RGBA (643x1000px) il logo del Montegranaro da Tuttocampo in `immagini/squadre-loghi/ecc-montegranaro.png` e `montegranaro.png`. Cache `LOGOMONTEG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Montefano:
  - Scaricato e integrato in RGBA (1000x1000px) il logo del Montefano da Tuttocampo in `immagini/squadre-loghi/ecc-montefano.png` e `montefano.png`. Cache `LOGOMONT1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Matelica:
  - Scaricato e integrato in RGBA (517x720px) il logo del Matelica da Tuttocampo in `immagini/squadre-loghi/ecc-matelica.png` e `matelica.png`. Cache `LOGOMAT1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Lunano:
  - Scaricato e integrato in RGBA (624x1000px) il logo del Lunano da Tuttocampo in `immagini/squadre-loghi/ecc-lunano.png` e `lunano.png`. Cache `LOGOLUN1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Jesina:
  - Scaricato e integrato in RGBA (735x994px) il logo della Jesina da Tuttocampo in `immagini/squadre-loghi/ecc-jesina.png` e `jesina.png`. Cache `LOGOJES1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Fermignanese:
  - Scaricato e integrato in RGBA (801x793px) il logo della Fermignanese da Tuttocampo in `immagini/squadre-loghi/ecc-fermignanese.png` e `fermignanese.png`. Cache `LOGOFERMIG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Fermana:
  - Scaricato e integrato in RGBA (518x720px) il logo della Fermana da Tuttocampo in `immagini/squadre-loghi/ecc-fermana.png` e `fermana.png`. Cache `LOGOFERM1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Fano:
  - Scaricato e integrato in RGBA (633x720px) il logo del Fano da Tuttocampo in `immagini/squadre-loghi/ecc-fano.png` e `fano.png`. Cache `LOGOFAN1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Chiesanuova:
  - Scaricato e integrato in RGBA (1370x1500px) il logo del Chiesanuova da Tuttocampo in `immagini/squadre-loghi/ecc-chiesanuova.png` e `chiesanuova.png`. Cache `LOGOCHIE1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Castelfidardo:
  - Scaricato e integrato in RGBA (434x720px) il logo del Castelfidardo da Tuttocampo in `immagini/squadre-loghi/ecc-castelfidardo.png` e `castelfidardo.png`. Cache `LOGOCFID1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Aurora Treia:
  - Scaricato e integrato in RGBA (1493x1500px) il logo dell'Aurora Treia da Tuttocampo in `immagini/squadre-loghi/ecc-aurora-treia.png` e `aurora-treia.png`. Cache `LOGOAUR1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Verolese:
  - Scaricato e integrato in RGBA (993x1000px) il logo della Verolese da Tuttocampo in `immagini/squadre-loghi/ecc-verolese.png` e `verolese.png`. Cache `LOGOVER1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Torre de' Roveri:
  - Scaricato e integrato in RGBA (1000x1000px) il logo del Torre de' Roveri da Tuttocampo in `immagini/squadre-loghi/ecc-torre-de-roveri.png` e `torre-de-roveri.png`. Cache `LOGOTOR1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Sporting Castellana:
  - Scaricato e integrato in RGBA (989x1000px) il logo dello Sporting Castellana da Tuttocampo in `immagini/squadre-loghi/ecc-sporting-castellana.png` e `sporting-castellana.png`. Cache `LOGOSCAS1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Sported Maris:
  - Scaricato e integrato in RGBA (613x720px) il logo dello Sported Maris da Tuttocampo in `immagini/squadre-loghi/ecc-sported-maris.png` e `sported-maris.png`. Cache `LOGOSPO1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Soncinese:
  - Scaricato e integrato in RGBA (601x720px) il logo della Soncinese da Tuttocampo in `immagini/squadre-loghi/ecc-soncinese.png` e `soncinese.png`. Cache `LOGOSONC1`.
- **2026-08-30** — Aggiornato Logo Ufficiale San Pancrazio:
  - Scaricato e integrato in RGBA (1000x1000px) il logo del San Pancrazio da Tuttocampo in `immagini/squadre-loghi/ecc-san-pancrazio.png` e `san-pancrazio.png`. Cache `LOGOSAN1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Poggese:
  - Scaricato e integrato in RGBA (634x720px) il logo della Poggese da Tuttocampo in `immagini/squadre-loghi/ecc-poggese.png` e `poggese.png`. Cache `LOGOPOG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Pianico:
  - Scaricato e integrato in RGBA (1051x1500px) il logo del Pianico da Tuttocampo in `immagini/squadre-loghi/ecc-pianico.png` e `pianico.png`. Cache `LOGOPIA1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Orceana:
  - Scaricato e integrato in RGBA (586x720px) il logo dell'Orceana da Tuttocampo in `immagini/squadre-loghi/ecc-orceana.png` e `orceana.png`. Cache `LOGOORC1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Offanenghese:
  - Scaricato e integrato in RGBA (751x1000px) il logo dell'Offanenghese da Tuttocampo in `immagini/squadre-loghi/ecc-offanenghese.png` e `offanenghese.png`. Cache `LOGOOFF1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Codogno:
  - Scaricato e integrato in RGBA (447x558px) il logo del Codogno da Tuttocampo in `immagini/squadre-loghi/ecc-codogno.png` e `codogno.png`. Cache `LOGOCOD1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Ciliverghe Mazzano:
  - Scaricato e integrato in RGBA (499x499px) il logo del Ciliverghe Mazzano da Tuttocampo in `immagini/squadre-loghi/ecc-ciliverghe-mazzano.png` e `ciliverghe-mazzano.png`. Cache `LOGOCIL1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Cellatica:
  - Scaricato e integrato in RGBA (796x927px) il logo del Cellatica da Tuttocampo in `immagini/squadre-loghi/ecc-cellatica.png` e `cellatica.png`. Cache `LOGOCEL1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Castiglione:
  - Scaricato e integrato in RGBA (1239x1500px) il logo del Castiglione da Tuttocampo in `immagini/squadre-loghi/ecc-castiglione.png` e `castiglione.png`. Cache `LOGOCAS1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Carpenedolo BSV Garda:
  - Scaricato e integrato in RGBA (500x500px) il logo del Carpenedolo BSV Garda da Tuttocampo in `immagini/squadre-loghi/ecc-carpenedolo-bsv-garda.png` e `carpenedolo-bsv-garda.png`. Cache `LOGOCARP1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Breno:
  - Scaricato e integrato in RGBA (205x246px) il logo del Breno in `immagini/squadre-loghi/ecc-breno.png` e `breno.png`. Cache `LOGOBRE1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Zingonia Verdellino:
  - Scaricato e integrato in RGBA (738x871px) il logo dello Zingonia Verdellino da Tuttocampo in `immagini/squadre-loghi/ecc-zingonia-verdellino.png` e `zingonia-verdellino.png`. Cache `LOGOZIN1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Vis Nova Giussano:
  - Scaricato e integrato in RGBA (858x1000px) il logo del Vis Nova Giussano da Tuttocampo in `immagini/squadre-loghi/ecc-vis-nova-giussano.png` e `vis-nova-giussano.png`. Cache `LOGOVIS1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Trevigliese:
  - Scaricato e integrato in RGBA (620x811px) il logo della Trevigliese da Tuttocampo in `immagini/squadre-loghi/ecc-trevigliese.png` e `trevigliese.png`. Cache `LOGOTREV1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Seregno:
  - Scaricato e integrato in RGBA (718x720px) il logo del Seregno da Tuttocampo in `immagini/squadre-loghi/ecc-seregno.png` e `seregno.png`. Cache `LOGOSER1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Ponte San Pietro Mapello:
  - Scaricato e integrato in RGBA (755x1000px) il logo del Ponte San Pietro Mapello da Tuttocampo in `immagini/squadre-loghi/ecc-ponte-san-pietro-mapello.png` e `ponte-san-pietro-mapello.png`. Cache `LOGOPON1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Olginatese:
  - Scaricato e integrato in RGBA (686x1000px) il logo dell'Olginatese da Tuttocampo in `immagini/squadre-loghi/ecc-olginatese.png` e `olginatese.png`. Cache `LOGOOLG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Nuova Sondrio:
  - Scaricato e integrato in RGBA (707x686px) il logo della Nuova Sondrio da Tuttocampo in `immagini/squadre-loghi/ecc-nuova-sondrio.png` e `nuova-sondrio.png`. Cache `LOGOSON1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Muggiò:
  - Scaricato e integrato in RGBA (500x500px) il logo del Muggiò da Tuttocampo in `immagini/squadre-loghi/ecc-muggio.png` e `muggio.png`. Cache `LOGOMUG1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Luciano Manara:
  - Scaricato e integrato in RGBA (622x1000px) il logo del Luciano Manara da Tuttocampo in `immagini/squadre-loghi/ecc-luciano-manara.png` e `luciano-manara.png`. Cache `LOGOMAN1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Lemine Almenno:
  - Scaricato e integrato in RGBA (592x829px) il logo del Lemine Almenno da Tuttocampo in `immagini/squadre-loghi/ecc-lemine-almenno.png` e `lemine-almenno.png`. Cache `LOGOLEM1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Juvenes United:
  - Scaricato e integrato in RGBA (227x227px) il logo del Juvenes United da Tuttocampo in `immagini/squadre-loghi/ecc-juvenes-united.png` e `juvenes-united.png`. Cache `LOGOJUV1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Franco Scarioni:
  - Scaricato e integrato in RGBA (1000x1000px) il logo del Franco Scarioni da Tuttocampo in `immagini/squadre-loghi/ecc-franco-scarioni.png` e `franco-scarioni.png`. Cache `LOGOSCAR1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Città di Albino:
  - Scaricato e integrato in RGBA (624x1000px) il logo del Città di Albino da Tuttocampo in `immagini/squadre-loghi/ecc-citta-di-albino.png` e `citta-di-albino.png`. Cache `LOGOALB1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Cisanese:
  - Scaricato e integrato in RGBA (798x1000px) il logo della Cisanese da Tuttocampo in `immagini/squadre-loghi/ecc-cisanese.png` e `cisanese.png`. Cache `LOGOCIS1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Caravaggio:
  - Scaricato e integrato in RGBA (777x1000px) il logo del Caravaggio da Tuttocampo in `immagini/squadre-loghi/ecc-caravaggio.png` e `caravaggio.png`. Cache `LOGOCARAV1`.
- **2026-08-30** — Aggiornato Logo Ufficiale Arcellasco:
  - Scaricato e integrato in RGBA (726x960px) il logo dell'Arcellasco da Tuttocampo in `immagini/squadre-loghi/ecc-arcellasco.png` e `arcellasco.png`. Cache `LOGOARC1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Vergiatese:
  - Scaricato e integrato in RGBA (700x1000px) il logo della Vergiatese da Tuttocampo in `immagini/squadre-loghi/ecc-vergiatese.png` e `vergiatese.png`. Cache `LOGOVERG1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Tribiano:
  - Scaricato e integrato in RGBA (805x999px) il logo del Tribiano in `immagini/squadre-loghi/ecc-tribiano.png` e `tribiano.png`. Cache `LOGOTRIB1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Sedriano:
  - Scaricato e integrato in RGBA (709x720px) il logo del Sedriano da Tuttocampo in `immagini/squadre-loghi/ecc-sedriano.png` e `sedriano.png`. Cache `LOGOSEDR1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Saronno:
  - Scaricato e integrato in RGBA (517x807px) il logo del Saronno da Wikimedia in `immagini/squadre-loghi/ecc-saronno.png` e `saronno.png`. Cache `LOGOSAR1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Rhodense:
  - Scaricato e integrato in RGBA (688x1000px) il logo della Rhodense da Tuttocampo in `immagini/squadre-loghi/ecc-rhodense.png` e `rhodense.png`. Cache `LOGORHO1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Magenta:
  - Scaricato e integrato in RGBA (604x838px) il logo del Magenta da Tuttocampo in `immagini/squadre-loghi/ecc-magenta.png` e `magenta.png`. Cache `LOGOMAG1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Lentatese:
  - Scaricato e integrato in RGBA (967x1000px) il logo della Lentatese da Tuttocampo in `immagini/squadre-loghi/ecc-lentatese.png` e `lentatese.png`. Cache `LOGOLENT1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Legnano:
  - Scaricato e integrato in RGBA (1280x1280px) il logo del Legnano da Wikimedia in `immagini/squadre-loghi/ecc-legnano.png` e `legnano.png`. Cache `LOGOLEGN1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Caronnese:
  - Scaricato e integrato in RGBA (639x959px) il logo della Caronnese da Wikimedia in `immagini/squadre-loghi/ecc-caronnese.png`, `caronnese.png` e `caronnese-scf.png`. Cache `LOGOCARON1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Besnatese:
  - Scaricato e integrato in RGBA (841x1000px) il logo della Besnatese da Tuttocampo in `immagini/squadre-loghi/ecc-besnatese.png` e `besnatese.png`. Cache `LOGOBESN1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Barona:
  - Scaricato e integrato in RGBA (1053x1500px) il logo del Barona da Tuttocampo in `immagini/squadre-loghi/ecc-barona.png` e `barona.png`. Cache `LOGOBARONA1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Baranzatese:
  - Scaricato e integrato in RGBA (1200x1395px) il logo della Baranzatese da Tuttocampo in `immagini/squadre-loghi/ecc-baranzatese.png` e `baranzatese.png`. Cache `LOGOBAR1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Aurora Cantalupo:
  - Scaricato e integrato in RGBA (654x724px) il logo dell'Aurora Cantalupo da Tuttocampo in `immagini/squadre-loghi/ecc-aurora-cantalupo.png`, `aurora-cantalupo.png` e `cantalupo.png`. Cache `LOGOCANT1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Assago:
  - Scaricato e integrato in RGBA (658x1000px) il logo dell'Assago da Tuttocampo in `immagini/squadre-loghi/ecc-assago.png` e `assago.png`. Cache `LOGOASS1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Ardor Lazzate:
  - Scaricato e integrato in RGBA (640x1000px) il logo dell'Ardor Lazzate da Tuttocampo in `immagini/squadre-loghi/ecc-ardor-lazzate.png`, `ardor-lazzate.png` e `lazzate.png`. Cache `LOGOLAZZ1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Accademy Calvairate:
  - Scaricato e integrato in RGBA (852x1000px) il logo dell'Accademy Calvairate da Tuttocampo in `immagini/squadre-loghi/ecc-accademy-calvairate.png`, `accademy-calvairate.png` e `calvairate.png`. Cache `LOGOCALV1`.
- **2026-08-29** — Aggiornato Logo Ufficiale UF Monfalcone:
  - Scaricato e integrato in RGBA (1095x1200px) il logo dell'UF Monfalcone da Tuttocampo in `immagini/squadre-loghi/ecc-uf-monfalcone.png`, `uf-monfalcone.png` e `monfalcone.png`. Cache `LOGOMONF1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Tolmezzo Carnia:
  - Scaricato e integrato in RGBA il logo del Tolmezzo Carnia da LND FVG in `immagini/squadre-loghi/ecc-tolmezzo-carnia.png` e `tolmezzo-carnia.png`. Cache `LOGOTOL1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Teor:
  - Scaricato e integrato in RGBA il logo del Teor da LND FVG in `immagini/squadre-loghi/ecc-teor.png` e `teor.png`. Cache `LOGOTEO1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Tamai:
  - Scaricato e integrato in RGBA (999x1000px) il logo del Tamai da Tuttocampo in `immagini/squadre-loghi/ecc-tamai.png` e `tamai.png`. Cache `LOGOTAM1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Sanvitese:
  - Scaricato e integrato in RGBA (567x720px) il logo della Sanvitese da Tuttocampo in `immagini/squadre-loghi/ecc-sanvitese.png` e `sanvitese.png`. Cache `LOGOSANV1`.
- **2026-08-29** — Aggiornato Logo Ufficiale San Luigi:
  - Integrato in RGBA il logo del San Luigi in `immagini/squadre-loghi/ecc-san-luigi-calcio.png`, `ecc-san-luigi.png` e `san-luigi.png`. Cache `LOGOSL1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Pro Gorizia:
  - Scaricato e integrato in RGBA (1323x1500px) il logo della Pro Gorizia da Wikimedia in `immagini/squadre-loghi/ecc-pro-gorizia.png` e `pro-gorizia.png`. Cache `LOGOPG1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Pro Fagagna:
  - Scaricato e integrato in RGBA (811x1000px) il logo della Pro Fagagna da Tuttocampo in `immagini/squadre-loghi/ecc-pro-fagagna.png` e `pro-fagagna.png`. Cache `LOGOPF1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Pordenone:
  - Scaricato e integrato in RGBA (500x500px) il logo del Pordenone da Tuttocampo in `immagini/squadre-loghi/ecc-pordenone.png` e `pordenone.png`. Cache `LOGOPOR1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Muggia:
  - Scaricato e integrato in RGBA (507x720px) il logo del Muggia da Tuttocampo in `immagini/squadre-loghi/ecc-muggia.png` e `muggia.png`. Cache `LOGOMUG1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Kras Repen:
  - Scaricato e integrato in RGBA (1300x1301px) il logo del Kras Repen da Tuttocampo in `immagini/squadre-loghi/ecc-kras-repen.png` e `kras-repen.png`. Cache `LOGOKRAS1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Juventina Sant'Andrea:
  - Scaricato e integrato in RGBA il logo della Juventina Sant'Andrea da LND FVG in `immagini/squadre-loghi/ecc-juventina-sant-andrea.png` e `juventina-sant-andrea.png`. Cache `LOGOJUV1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Forum Julii:
  - Scaricato e integrato in RGBA il logo del Forum Julii da Tuttocampo in `immagini/squadre-loghi/ecc-forum-julii.png` e `forum-julii.png`. Cache `LOGOFJ1`.
- **2026-08-29** — Aggiornati Loghi Ufficiali Codroipo e Fontanafredda:
  - Scaricati e convertiti in RGBA i loghi di Codroipo (`immagini/squadre-loghi/ecc-codroipo.png`, `codroipo.png`) e Fontanafredda (`immagini/squadre-loghi/ecc-fontanafredda.png`, `fontanafredda.png`) da Tuttocampo. Cache `LOGOS5`.
- **2026-08-29** — Aggiornato Logo Ufficiale Chions:
  - Scaricato e convertito in RGBA il logo del Chions da Tuttocampo in `immagini/squadre-loghi/ecc-chions.png` e `chions.png`. Cache `LOGOCHI1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Casarsa:
  - Scaricato e integrato il logo ad alta risoluzione (756x1000px trasparente) del Casarsa da Tuttocampo in `immagini/squadre-loghi/ecc-casarsa.png` e `casarsa.png`. Cache `LOGOCAS1`.
- **2026-08-29** — Aggiornato Logo Ufficiale Azzurra Premariacco:
  - Scaricato e integrato il logo ad alta risoluzione (1500x1500px trasparente) dell'Azzurra Premariacco da Tuttocampo in `immagini/squadre-loghi/ecc-azzurra-premariacco.png` e `azzurra-premariacco.png`. Cache `LOGOAZZ1`.
- **2026-08-29** — Nuovo Flusso Provino Minigioco a Due Fasi (Selezione Categoria Piramide & Genere -> Scelta Squadra):
  - Riprogettata la schermata del Provino per non mostrare squadre alla rinfusa, ma guidare l'utente prima nella scelta della Categoria calcistica:
    - **Calcio Maschile**: Serie A, Serie B, Serie C, Serie D, Eccellenza, Promozione, Prima Categoria, Seconda Categoria, Terza Categoria (tutte e 9 le divisioni ufficiali).
    - **Calcio Femminile**: Serie A Femminile, Serie B Femminile, Serie C Femminile, Eccellenza Femminile, Promozione Femminile, Primavera Femminile.
  - Caricato il catalogo completo (`data/squadre/catalog.json` ~2894 squadre) per popolare tutte le categorie con loghi, gironi e città.
  - Creata interfaccia a schede grafiche (`.es-mg-cat-grid`, `.es-mg-cat-card`, `.es-mg-gender-tabs`) con indicazione di divisione, numero squadre e range OVR ufficiale.
  - Selezionata la categoria, l'utente visualizza l'elenco filtrato delle squadre con barra di ricerca, può cambiare categoria liberamente o sostenere il provino con la squadra scelta. In caso di esito positivo la carriera parte con l'OVR tarato sulla categoria. Cache `CATPROV1`.
- **2026-08-29** — Fix Pulsante Chiudi Minigioco (Chiusura pulita verso Home/Dashboard senza uscire da Chrome):
  - Rimosso il meccanismo `history.back()` in `leaveMinigioco` che su Google Chrome mobile faceva uscire dalla web app chiudendo la scheda o tornando alla home di Chrome.
  - La chiusura del minigioco ora chiude l'overlay (`close()`), sblocca lo scroll e ripristina la vista attiva del sito (`home`, `#hero` o dashboard utente) tramite `window.switchView` in modo fluido e sicuro. Cache `CLOSEFIX1`.
- **2026-08-29** — Cap Rigido Overall per Categoria (Fix Eccellenza max 29 OVR):
  - Risolto il bug documentato con screenshot (calciatore del Nuova Spinazzola in Eccellenza che arrivava a OVR 75/76 e valore 61K anziché rimanere nel range dilettanti 24-29).
  - Implementata la funzione `repairCareerOvrAndTier` che corregge e vincola automaticamente le carriere salvate (anche pregresse) e ogni stagione simulata (`seasonSim`) ai tetti min/max della categoria della squadra.
  - Aggiornato calcolo ingaggi `weeklyWage` e valore economico parametrato alla categoria. Cache `ECCFIX1`.
- **2026-08-29** — Parametri di Crescita Overall (OVR) Giocatore/Giocatrice per Categoria:
  - Definita la scala ufficiale dei valori di Overall (min / max) per le 9 categorie:
    - **Serie A**: min. 76 / max. 93
    - **Serie B**: min. 59 / max. 75
    - **Serie C**: min. 43 / max. 58
    - **Serie D**: min. 30 / max. 42
    - **Eccellenza**: min. 24 / max. 29
    - **Promozione**: min. 19 / max. 23
    - **Prima Categoria**: min. 12 / max. 18
    - **Seconda Categoria**: min. 5 / max. 11
    - **Terza Categoria**: min. 0 / max. 4
  - Esportato `EliseePiramide.CATEGORY_OVR_RANGES` in `piramide-italia.js`.
  - Aggiornati `CATEGORY_OVR_RANGES`, `minOvrForClub`, `maxOvrForClub`, `leagueParOvr` e i colori badge `ovrColor` (76+ blu, 59+ rosso, 43+ arancio, 30+ verde, bronzo dilettanti) in `minigioco-carriera.js`. Cache `OVR1`.
- **2026-08-29** — Tetto Stimato Minimo e Massimo di Prezzo per Categoria:
  - Definita la tabella ufficiale dei tetti di valutazione economica per tutte le 9 categorie:
    - **Serie A**: min. 5 Mln.€ / max. 150 Mln.€
    - **Serie B**: min. 250 mila€ / max. 4,9 Mln.€
    - **Serie C**: min. 50 mila€ / max. 249 mila€
    - **Serie D**: min. 9,9 mila€ / max. 49 mila€
    - **Eccellenza**: min. 900€ / max. 10 mila€
    - **Promozione**: min. 450€ / max. 899€
    - **Prima Categoria**: min. 300€ / max. 449€
    - **Seconda Categoria**: min. 100€ / max. 299€
    - **Terza Categoria**: min. 10€ / max. 100€
  - Esportato `EliseePiramide.CATEGORY_PRICE_RANGES` in `piramide-italia.js`.
  - Aggiornato calcolo valore dinamico `calcRealisticValueM` e formattatore `formatValue` (Mln.€, mila€, €) in `minigioco-carriera.js`. Cache `VAL1`.
- **2026-08-29** — Nomenclatura Ufficiale & Mappatura Completa Trofei per Nazione e Premi Individuali:
  - **Italia**: Supercoppa Italia, Coppa Italia, Man Of the Match Serie A, Serie A, Serie B, Supercoppa di Serie C, Coppa Italia Serie C, Serie C, Supercoppa di Serie D, Coppa Italia Serie D, Serie D, Coppa Eccellenza (più dilettanti Promozione, 1ª/2ª/3ª Categoria).
  - **Mondo / Internazionali**: Pallone d'oro (Miglior giocatore con più prestazioni ottimali nella stagione), Scarpa d'oro (Miglior realizzatore top campionati), Mondiali, Europei, Mondiale per Club, Champions League, Europa League, Conference League, Supercoppa UEFA, Guanto d'oro (miglior portiere), Man Of the Match Champions League, Michelob ULTRA Superior Player of the Match (Migliore in campo gara mondiali), Giocatore dell'Anno.
  - **Francia**: Ligue 1, Coupe De France.
  - **Germania**: Bundesliga, DFB Pokal (Coppa di Germania), DFL Supercup (Supercoppa di Germania).
  - **Inghilterra**: EFL Cup, FA Community Shield, FA Cup, Man Of The Match Premier League, Premier League.
  - **Spagna**: Copa del Rey (Coppa Spagnola), La Liga, Supercopa de Espana.
  - Integrazione completa in `TROPHIES_MAP`, simulazione stagioni e vetrina palmarès in `minigioco-carriera.js` e documentazione ufficiale in `immagini/minigioco/loghi-trofei/README.txt`. Cache `TROPHIES1`.
- **2026-08-27** — Profilo Allenatore & Profilo Vice Allenatore da PDF ufficiale (`Profilo_Allenatore_Vice_Allenatore_260827_203503.pdf`):
  - **Allenatore**: Dati ufficiali, qualifica UEFA, status Disponibile/Club, collegamento diretto bidirezionale con il Vice Allenatore, Moduli Preferiti (Principale/Secondario) con Mappa Posizionale FM (motore Heatmap), Formazione della Settimana (Top 11) con apertura Player Card al click sui calciatori schierati e condivisione Story Social 9:16 (Instagram / TikTok), Hub Esercitazioni Pre-Partita con toggle Privato/Pubblico, Bacheca Digitale Trofei Palmarès, Dashboard GPS Squadra, Analisi Heatmap Tattica Sovrapposta e Segnalazioni Calciomercato al DS (Wishlist).
  - **Vice Allenatore**: Dati e licenza UEFA B / Collaboratore, collegamento diretto con l'Allenatore Capo (Mister), Aree di Specializzazione Tecnica (Palle inattive, Difesa/Reparti, Match analysis, Riscaldamento), Schede Workstation operative pre-seduta, Palmarès di Staff, Bozza Formazione della Settimana, Co-Gestione GPS con alert fatica e Analisi Heatmap individuali. Cache `COACH1`.
- **2026-08-27** — Scopri profili: riordino estetico e strutturale delle card profili in `#scopri-portal`. Allineamento orizzontale pulito e coerente per i pulsanti azione (`+ Segui`, `Messaggia`, `Chi segue`, `Secret List`), avatar a raggio squadrato moderno, sottotitoli anagrafici puliti (senza scritte residue "Calcio"). Cache `CARDORDER1`.
- **2026-08-27** — Scopri profili: sostituito il selettore "Sport / Tutti gli sport" con il filtro "Categoria / Tutte le categorie" (Serie A, Serie B, Serie C, Serie D, Eccellenza, Promozione, 1ª/2ª/3ª Categoria, Primavera, Juniores, Allievi, Giovanissimi, Femminile, Amatori). Cache `CAT1`.
- **2026-08-27** — Bugfix switch ruoli (DS &rarr; Presidente): risolto blocco e leftover dashboard Direttore Sportivo quando si passa a Presidente; rimosso parsing `blob` concatenato e adottato `primary` role check, ripulito `creator-role-switcher.js` e allineato `applyStaffIdentity` in `player-profile.js`. Cache `ROLEFIX1`.
- **2026-08-27** — Profilo Presidente da PDF: Guida operativa societaria (5 pag.), dati club & foto 3 maglie ufficiali (Home/Away/GK), gestione Rosa con distinzione Profilo Attivo (link Card completa) vs Non Registrato (Anteprima Limitata), organigramma deleghe, ufficializzazione mercato sul Wall FIFA, CTA Pubblica Candidatura. Cache `PRES1`.
- **2026-08-27** — Profilo Direttore Sportivo da PDF: hub B2B, Album scouting, Secret List, Wall, AI Advisor Match Index. Cache `DS1`.
- **2026-08-27** — Profilo Calciatore da PDF: Card collezionabile, Album, heatmap fine gara, GPS MVP, candidatura a imbuto + dossier. Cache `CARD1`.
- **2026-08-27** — Logo ufficiale Terza Categoria 2026 (LND) come logo campionato: selettore, minigioco, Focus. File `immagini/squadre-loghi/terza-categoria.png`. Cache `TCATLND1`.
- **2026-08-27** — Logo ufficiale Seconda Categoria 2026 (LND) come logo campionato: selettore, minigioco, Focus. File `immagini/squadre-loghi/seconda-categoria.png`. Cache `SCATLND1`.
- **2026-08-27** — Logo ufficiale Prima Categoria 2026 (LND) come logo campionato: selettore, minigioco, Focus. File `immagini/squadre-loghi/prima-categoria.png`. Cache `PCATLND1`.
- **2026-08-27** — Logo ufficiale Promozione 2026 (LND) come logo campionato: selettore, minigioco, Focus. File `immagini/squadre-loghi/promozione.png`. Cache `PROMLND1`.
- **2026-08-27** — Logo ufficiale Eccellenza 2026 (LND) come logo campionato: selettore, minigioco, Focus. File `immagini/squadre-loghi/eccellenza.png`. Cache `ECCLND1`.
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
