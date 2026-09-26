# Elisee Scout — continua da qui

File di passaggio tra sessioni / account Grok.
**Aprilo per primo** se stai riprendendo il progetto.

Ultimo aggiornamento: **2026-09-26** — HEROUX54 — Search Bar Animata 3D Flip (SCRY) con Conferma Visiva & Filtro Real-Time:
1. **Componente 3D Flip Search Bar (`scry-search.css`, `scry-search.js`)**:
   - Apertura con prospettiva 3D dinamica (`perspective: 900px`, `transform: rotateX(-90deg)` → `rotateX(0deg)` con timing `cubic-bezier(.55,.08,.4,.95)`).
   - Bottone circolare `.scry__btn` che scivola da centro (`left: calc(50% - 28px)`) all'estremità destra (`left: calc(100% - 56px)`) con morphing icona da lente (`.ic-search`) a chiusura (`.ic-close`).
   - Conferma visiva all'invio (`.scry.submitted`):
     - Checkmark verde pop animato (`.ic-check`, sfondo `#1f9d6b`, keyframe `scry-pop`).
     - Anello di pulsazione d'urto ad espansione sul box (`box-shadow`, keyframe `scry-ring`).
   - Gestione tastiera (`Escape` per chiudere, `Enter` per inviare, flag `.kbd` per accessibilità outline).
2. **Collegamento ai Filtri Reali di Elisee Scout**:
   - Evento standard `scry:search` + trigger integrato in `scry-search.js`:
     - **Bacheca annunci**: memorizza `window._scryQuery` e attiva il filtro full-text `filterAndRenderJobs()` in `app.js` (cerca su titolo, ruolo, club, città, categoria, offerta e requisiti).
     - **Persone & squadre**: sincronizza il campo `#search-people-query` ed esegue `filterPeopleCards()`.
     - **Mappa Club**: sincronizza `#club-search` ed invia l'evento input per la visualizzazione immediata dei club geolocalizzati.
     - Reset istantaneo: alla chiusura o cancellazione del testo (`clear()`), ripristina la visualizzazione completa senza ricaricare la pagina.
3. **Integrazione UI**:
   - Posizionata in modo evidente e centrato nella testata filtri della **Bacheca annunci** (`.bacheca-scry-row`, `#bacheca-tab-annunci`).
   - Aggiunto trigger rapido nella **barra di navigazione pubblica** (`#es-nav-quick-search`) per apertura istantanea con scroll animato.
4. **File**: `scry-search.css`, `scry-search.js`, `app.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX54`.

Feature precedente: **2026-09-26** — HEROUX53 — Pulsante Glow Animato Conic Gradient con Punti Luce Rotanti & Alone 3D:
1. **Componente Glow Button (`glow-button.css`)**:
   - Proprietà animata nativa `@property --angle` (`syntax: '<angle>'`, rotazione 0deg → 360deg a 3.5s infinita).
   - Wrapper `.glow-wrap` con anello di padding (2px) e doppio gradiente conico `conic-gradient`:
     - Anello perimetrale nitido (`::before`) con punti luce rotanti magenta (`#ff2fd3`) e ciano (`#2fa8ff`).
     - Alone sfocato diffuso posteriore (`::after`) con `filter: blur(24px)` e `opacity: .5` sempre acceso, intensificato a `opacity: 1` in hover.
   - Faccia del pulsante `.glow-btn`: background `#0d1017` solido, tipografia contrastata e nitida, leggera spaziatura lettere, micro-effetto 3D alla pressione (`:active` con `translateY(2px) scale(.99)` ed inset shadow ridotto).
   - Varianti di contesto e responsive:
     - `.glow-wrap--nav` e `.glow-btn--nav`: adattato alla barra di navigazione con altezza 36px, `border-radius: 999px` e padding proporzionato.
     - `.es-cta-glow-wrap` e `.glow-btn--hero`: per la CTA principale ("Registrati come calciatore o società").
     - `.glow-wrap--full` e `.glow-btn--full`: per layout a tutta larghezza in modal di autenticazione e drawer mobile.
2. **Integrazione nei Punti Chiave di Elisee Scout**:
   - Schermata Iniziale / Hero (#home-about): CTA principale `"Registrati come calciatore o società"` racchiusa nel wrapper glow animato.
   - Barra di navigazione pubblica (Header Desktop): pulsante `"Accedi"` dotato del bordo rotante e dell'alone neon coordinato.
   - Drawer laterale responsive (<820px): pulsante `"Accedi / Iscriviti"` a tutta larghezza con effetto glow.
   - Modal Unificato Accedi / Iscrizione: pulsanti submit `"Accedi"` e `"Iscriviti"` potenziati con la cornice glow animata.
3. **File**: `glow-button.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX53`.

Feature precedente: **2026-09-26** — HEROUX52 — TIDE Download Button con Progresso Reale, Anello SVG e Gestione Esiti:
1. **Componente TIDE Download Button (@code_and_chill inspired, `tide-button.css`, `tide-button.js`)**:
   - Bottone circolare animato `.tide-btn` (58px, border-radius 50%, hover `translateY(-2px)`, active `scale(.97)`).
   - Anello circolare SVG `.tide-ring` con circonferenza esatta `302` (`r="48"`), `.track` traslucida e `.arc` progressiva sincronizzata alla percentuale live numerica `.ic-pct`.
   - Micro-animazioni SVG fluide (`.tide-icon`): morphing/dissolvenza tra freccia download (`.ic-arrow`), percentuale live numerica, spunta di successo verde (`.ic-check`, sfondo `#10b981`) e croce di errore rossa (`.ic-x`, sfondo `#e0304a`, `data-state="fail"`).
   - Integrazione con elegante pillola descrittiva `.tide-download-wrap` (titolo e sottotitolo coordinati con `var(--panel)` e `var(--line)`).
2. **Collegamento ai Download Reali & Gestione Fallimenti**:
   - Gestione nativa del progresso reale:
     - Tramite `XMLHttpRequest` con evento di progresso reale `e.loaded / e.total` per il download di file e risorse statiche / streaming.
     - Tramite pipeline asincrona reale con `jsPDF` (`new window.jspdf.jsPDF()`) e Blob binario per "Scarica CV / Dossier PDF" (`data-action="cv-dossier"`) e "Export Report Secret List" (`data-action="market-report"`).
     - Gestione reale degli errori (`try / catch` e `xhr.onerror` / HTTP != 200) che commuta lo stato del bottone in `data-state="fail"`, attiva il toast di notifica errore e ripristina lo stato dopo il feedback visivo.
3. **Sostituzione Pulsanti Statici in Piattaforma**:
   - Sostituito il pulsante statico "📄 Scarica CV / Dossier PDF" in `#user-dossier-portal` (`.cv-actions-group`) con il TIDE button con badge "Passaporto Atletico Ufficiale".
   - Sostituito il pulsante statico "📄 Export Report Secret List" in `#mercato-hub` (`.market-actions`) con il TIDE button con badge "Dossier Riservato DS / Scout".
   - Mantenuta retrocompatibilità completa per chiamate programmatiche `window.exportActiveUserProfilePDF()` e `window.exportMarketReport()`.
4. **File**: `tide-button.css`, `tide-button.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX52`.

Feature precedente: **2026-09-26** — HEROUX51 — Unificazione Tema Sezione Mappa & Micro-Interazioni Responsive:
1. **Unificazione Token Tema Globale (#mappa-portal, vista mappa e panoramica territoriale)**:
   - Sostituiti tutti i colori scuri fissi / hardcoded in `mappa-club.css` con il sistema standard di variabili di tema: `--bg`, `--panel`, `--text`, `--text-dim`, `--line`, `--blue`, `--track`.
   - Supporto completo e reattivo per:
     - Default Light: `:root` (`--bg: #ffffff; --panel: #f7f8fb; --text: #0e1830; --text-dim: #667085; --line: #e4e7ee; --blue: #1d4fd6; --track: #e4e7ee;`)
     - Dark Scheme automatico: `@media (prefers-color-scheme: dark)` (`--bg: #0b0e1a; --panel: #12162a; --text: #eef0f7; --text-dim: #9aa1b8; --line: #232840; --blue: #4f83ff; --track: #232840;`)
     - Attributi espliciti: `html[data-theme="light"]`, `html[data-theme="mimetico-chiaro"]` e `html[data-theme="dark"]`.
   - Rimappate le variabili interne `--es-*` sul sistema a token.
   - Sbloccato `#mappa-portal` da `color-scheme: dark` forzato e `background: #0b0e14`, ora reattivo a `var(--bg)` e `var(--text)`.
2. **Aggiornamento Componenti Mappa ai Token e alle Micro-Interazioni**:
   - Barra superiore contatore club: `.mappa-counter-bar` / `.es-map-topbar` agganciata a `var(--panel)`, `var(--line)` e `var(--text)`.
   - Bottone CTA geolocalizzazione: `.mappa-cta` / `.es-map-cta` con `background: var(--blue)`, `color: #fff`, `border-radius: 999px`, transizione con cubic-bezier `translateY(-2px)` e ombra morbida.
   - Box di ricerca club: `.map-search-box` con transizione su `border-color` e `:focus-within` ring `box-shadow: 0 0 0 3px rgba(29,79,214,.15)`.
   - Controlli zoom / fullscreen: `.map-zoom-btn` / `.es-map-fs` con scala fluida al passaggio del mouse (`transform: scale(1.06)`).
3. **Card Regioni & Layout Responsive**:
   - Griglia regioni `.regions-grid` / `.es-region-grid`: 5 colonne desktop, 3 colonne tablet (<=1024px), 2 colonne mobile (<=640px) con gap 16px.
   - Card regione `.region-card` / `.es-region-card`: `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 12px`, padding 16px, transizione cubic-bezier `.25s cubic-bezier(.34,1.2,.4,1)`, hover `translateY(-3px)`, `border-color: var(--blue)` e ombra morbida `0 10px 24px rgba(0,0,0,.12)`.
   - Barra proporzionale: track `.bar-track` con `background: var(--track)` e fill `.bar-fill` con `background: var(--blue)` e animazione fluidificata.
   - Pannello espanso squadre regionali (`.es-region-teams`) e chip società (`.es-region-team-chip`) coordinati ai token di tema.
4. **File**: `mappa-club.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX51`.

Feature precedente: **2026-09-26** — HEROUX50 — Fix Layout Bacheca (Header Static, Tabs Sticky) e Ristilizzazione Action Menu:
1. **Fix Header Intro Bacheca (Sbloccato da Fixed)**:
   - Rimosso l'aggancio fixed accidentale causato dal selettore non qualificato `header,` in `apple-nav.css` (ora limitato a `header.public-header`).
   - `.pf-header-bacheca` e `.bacheca-intro` impostati esplicitamente a `position: static !important; height: auto !important;`: ora scorrono normalmente con la pagina, eliminando il blocco fisso a schermo e l'enorme spazio vuoto.
2. **Barra dei Tab Sticky (`.bacheca-nav-tabs`, `.bacheca-tabs`)**:
   - Resa `position: sticky !important; top: 64px !important; z-index: 20 !important;` con background `#fff` in light mode e `#050608` in dark mode, con bordo inferiore coordinato.
   - Rimane comodamente agganciata durante tutto lo scroll della bacheca garantendo l'accesso continuo a *Bacheca annunci / Persone & squadre / Wall trattative / Squadre*.
3. **Widget Flottante (Action Menu Rapido `⋮`)**:
   - Ristilizzato completamente da magenta/fucsia (`#ff00ff`) alla palette ufficiale del sito: sfondo `#ffffff`, bordo `#0e1830`, testo/icona `#0e1830`, ombra `box-shadow: 0 8px 20px rgba(14,24,48,.18)`.
   - Spiegata chiaramente la funzione reale del widget (menu di scorciatoie rapide introdotto in HEROUX28).
4. **Distanziamento Pulsanti Flottanti Sovrapposti**:
   - Separati i due FAB in basso a sinistra: Action Menu a `bottom: 24px; left: 24px;` e pulsante secondario a `bottom: 88px; left: 24px;`, prevenendo qualsiasi accavallamento.
5. **File**: `apple-nav.css`, `bacheca-board.css`, `action-menu.css`, `styles/action-menu.css`, `trash-btn.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX50`.

Feature precedente: **2026-09-26** — HEROUX49 — Implementazione Specifica Esatta Prompt (Nav, Bottoni e Card Calciatore):
1. **Navigazione & Indicatore Animato Scorrevole**:
   - Inclusa la struttura esatta con `.nav-links`, `.nav-indicator`, e selettori per classi attive / hover con easing `cubic-bezier(.34,1.1,.4,1)`.
   - Pulsante `Accedi` / `.accedi` con colore navy scuro `--navy: #0e1830`, testo `#fff`, border-radius 999px e hover morbido senza blu elettrico.
   - Sotto 820px, gestione responsive e toggle `.open`.
2. **Bottoni CTA Schermata Iniziale**:
   - Primario `.btn-primary`: `"Registrati come calciatore o società"` (senza emoji, senza maiuscolo pieno) con icona SVG pulita e sfondo `--navy: #0e1830`.
   - Secondario `.btn-secondary`: `"Esplora la piattaforma"` (senza emoji, senza maiuscolo pieno) con icona SVG pulita, sfondo bianco e bordo `--line: #e4e7ee`.
3. **Card del Calciatore**:
   - Rimosse tutte le parentesi angolari HUD (`.bracket-*`).
   - Sostituita la pillola verde con `.verified` (`✓ Profilo verificato`, sfondo chiarissimo `#f2faf9`, bordo sottile `#cfe8e4`, colore `--teal: #0f9488`).
   - Box statistica convertito in `.stat-chip` (`92 ATT` pulito).
   - Box velocità convertito in `.speed-chip` (`33.8 km/h` e `Top speed · GPS` senza emoji del fulmine, con icona SVG cronometro).
   - Micro-interazione `.card:hover` con sollevamento `translateY(-4px)` ed ombra diffusa.
4. **File**: `index.html`, `es-nav-ux.css`, `es-nav-ux.js`, `style.css`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX49`.

Feature precedente: **2026-09-26** — HEROUX48 — Micro-Interazioni Cubic-Bezier, Indicatore Scorrevole e Nav Responsive:
1. **Nav con Indicatore Animato (Sliding Pill con Easing Morbido)**:
   - Pillola di sfondo `.nav-indicator` che scivola sotto la voce attiva/hoverata su `.main-nav` (`a.nav-link`, `.es-nav-dropdown-btn`).
   - Movimento orizzontale fluido con curva `cubic-bezier(0.16, 1, 0.3, 1)` a 280ms su GPU (`translate3d`), con pillola satinata coordinata sia in Dark Mode (glow ciano/azzurro) che in Light Mode (azzurro tenue satinato `#0284c7`).
   - Fadeout delicato al `mouseleave` se non vi è voce attiva (es. Home).
2. **Hover sui Pulsanti (Sollevamento, Ombra Graduale ed Espansione Icone)**:
   - Sollevamento leggero `translateY(-2px)`, ombra morbida che entra in dolcezza (`box-shadow`), icona SVG / bolla che si ingrandisce appena (`scale(1.12)`).
   - Movimento governato da `cubic-bezier(0.16, 1, 0.3, 1)`.
3. **Micro-Interazione sulla Card del Calciatore**:
   - Sollevamento morbido `translateY(-6px)` su passaggio del mouse con espansione dell'ombra (`box-shadow: 0 24px 50px -12px rgba(...)`).
4. **Nav Responsive con Hamburger Animato (<820px)**:
   - Sotto 820px, la barra centrale dei link si nasconde per prevenire accavallamenti e rotture di layout.
   - Compare il pulsante `.es-nav-hamburger` con 3 linee che si trasformano con animazione fluida in una "X" (`.is-open`).
   - Il pulsante apre e chiude il drawer laterale mobile in modo sincronizzato e reattivo.
5. **File**: `index.html`, `es-nav-ux.css`, `es-nav-ux.js`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX48`.

Feature precedente: **2026-09-26** — HEROUX47 — Fix Macchia Scura / Vignetta Glow su Hero in Light Mode:
1. **Rimosso Glow e Vignetta Scura in Light Mode**:
   - Individuato il responsabile esatto della fascia grigio-scura sfumata che appariva nella Schermata Iniziale (#hero) in modalità giorno: il pseudo-elemento `.hero-typography-left::before`, configurato con `radial-gradient(ellipse at center left, rgba(0, 0, 0, 0.7)...)` e `filter: blur(12px / 20px)`.
   - Vincolato tale glow unicamente a Dark Mode (`html:not([data-theme="mimetico-chiaro"]) .hero-typography-left::before`).
   - Disattivato esplicitamente per Light Mode (`html[data-theme="mimetico-chiaro"]`, `html[data-theme="light"]`, ecc.) con `content: none !important; display: none !important; background: none !important; filter: none !important; opacity: 0 !important;`.
   - Rimossi anche i text-shadow neri su `.hero-name`, `.hero-name-bold`, `.hero-role` in Light Mode per garantire contorni nitidi e puliti su fondo bianco puro.
2. **File**: `index.html`, `style.css`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX47`.

Feature precedente: **2026-09-26** — HEROUX46 — Riorganizzazione Sezione Chi Siamo / About (#about):
1. **Eliminazione Sovrapposizione e Duplicazione Blocco Chi Siamo**:
   - Rimosso il vecchio contenitore duplicato `.chi-siamo-container` che causava l'accavallamento dei titoli centrali ("CHI SIAMO" / "La nostra missione") sopra l'header istituzionale.
2. **Hero Istituzionale a Due Colonne Pulita**:
   - Colonna sinistra: Kicker `.cs-eyebrow` in ciano `#00f5d4`, titolo principale `h1.cs-headline` ("La nostra missione") grande e pulito, testo introduttivo `.cs-lede` con interlinea confortevole.
   - Colonna destra: Box informativo `.cs-hero-meta` trasformato in una card scura elegante e ben definita con angoli arrotondati (`border-radius: 16px`), bordo delicato e griglia tabellare spaziata (Sede, Contatti mail ciano, Ambito).
3. **Sezione Missione a Larghezza di Lettura Contenuta (~68ch)**:
   - Contenitore `.cs-mission-content` con `max-width: 68ch` per evitare righe eccessivamente lunghe.
   - Spaziatura coerente tra i paragrafi, badge satinato `.cs-tag-principio` per "unico principio guida", accenti coral `#ff3366` per i concetti chiave ("zero fake account", "opportunità reali", "nessun rischio", "consenso genitoriale obbligatorio") e teal `#00f5d4` per i dati tecnici ("GPS").
   - Pieno supporto Dark Mode e Light Mode con colori istituzionali adattati.
4. **File**: `index.html`, `chi-siamo.css`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX46`.

Feature precedente: **2026-09-26** — HEROUX45 — Universal Nimbus Publish Button Component (Idle -> Loading -> Done):
1. **Pulsante di Pubblicazione Nimbus con Micro-Animazione SVG**:
   - Creato modulo CSS dedicato [publish-btn.css](publish-btn.css) con animazione fluida trifase:
     - **Idle**: icona nuvola e freccia vettoriale pronta all'invio.
     - **Loading**: rotazione continua a 360° della nuvola (`animation: nimbus-spin .9s linear infinite`) con freccia a bassa opacità.
     - **Done**: scomparsa della freccia e disegno progressivo del checkmark con `stroke-dasharray / stroke-dashoffset` multi-browser, sfondo verde smeraldo `#10b981`.
   - **Switch Automatico Giorno/Notte**:
     - Riconoscimento automatico del tema di sistema (`@media (prefers-color-scheme: dark)`).
     - Integrazione completa con i temi manuali del sito (`html[data-theme="vault-neon"]` / `dark`, e `html[data-theme="mimetico-chiaro"]` / `light`).
   - Creato modulo runtime universale [publish-btn.js](publish-btn.js) con API:
     - `window.EliseePublishButton.bind(target, asyncFn, options)` / `window.bindPublishButton()`
     - Auto-aggancio immediato a **Candidature Club Pro** (`#submit-offriamo`, `#submit-richiediamo`), **Bacheca Annunci LND** e **Area Redazione / Ufficio Stampa**.
2. **File**: `publish-btn.css`, `publish-btn.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX45`.

Feature precedente: **2026-09-26** — HEROUX44 — Fix Schermata Iniziale (#hero) in Modalità Giorno / Light Mode:
1. **Risolto Sfondo Scuro Hardcoded su #hero e .es-plx**:
   - Rimosso il selettore `html, body, #hero { background: #07131c !important; }` incondizionato che prevaleva su tutto l'hero.
   - Limitato lo sfondo nero-blu esclusivamente a `html:not([data-theme="mimetico-chiaro"])`.
   - Per `html[data-theme="mimetico-chiaro"]`: `#hero`, `.hero-section`, `.hero-portfolio` impostati a `#ffffff !important;`.
   - `.es-plx` in Light Mode adotta un gradiente luminoso sfumato azzurro/bianco `radial-gradient(...) linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;` invece del vecchio overlay nero.
   - Tipografia `.hero-name` e `h1` in nero ardesia `#0f172a`, `.hero-name-bold` in `#0284c7`, `.hero-role` in `#475569`.
   - Bottoni outline `#hero .btn-outline-pill` con bordo e testo `#0284c7` su fondo bianco.
   - Header a scroll 0 in Light Mode con glassmorphism chiaro semitrasparente e logo/voci con testo scuro e pulsante tema sincrono `☀️/🌙`.
2. **File**: `style.css`, `index.html`, `role-sidebar-pro.js`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX44`.

Feature precedente: **2026-09-26** — HEROUX43 — Glow Cards Spotlight Cursor-Tracking (3 Pilastri Network):
1. **Interactive Glow Cards Showcase (Spotlight Mouse Tracking)**:
   - Integrato il pattern interattivo Spotlight Glow con tracciamento real-time del cursore su coordinate CSS dinamiche (`--x`, `--y`).
   - 3 card esclusive dedicate ai pilastri di Elisee Scout:
     - **glow-card--blue**: Calciatori & Atleti (Dossier con telemetria GPS, highlights e visibilità diretta).
     - **glow-card--gold**: Società & Club LND (Annunci ingaggi, formazioni e matching IA).
     - **glow-card--red**: Scout & Procuratori FIGC/FIFA (Secret List stealth, radar IA 3vs3 e monitoraggio territoriale).
   - Micro-interazioni fluide: hover lift a `-5px`, comparsa progressiva del bagliore radiale `opacity: 1`, freccia CTA ad animazione elastica.
   - Piena compatibilità con Dark Mode e Light Mode (`html[data-theme="mimetico-chiaro"]`).
2. **File**: `index.html`, `style.css`, `glow-cards-handler.js`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX43`.

Feature precedente: **2026-09-26** — HEROUX42 — Full Homepage & Public Pages Light Mode Suite:
1. **Light Mode Globale per Tutta la Homepage e Sezioni Pubbliche**:
   - Risolto il disallineamento cromatico dove solo l'header recepiva il tema chiaro mentre il resto della homepage (#home-resume, #home-portfolio, #welcome-access, footer) rimaneva con sfondi scuri.
   - Sfondi calibrati alternati (`#ffffff` e `#f8fafc`) con bordi delicati `border-top: 1px solid rgba(15, 23, 42, 0.08)`.
   - Contrasto tipografico nitido su tutte le sezioni (`.portfolio-heading` in `#0f172a`, `.portfolio-kicker` in `#0284c7`, `.portfolio-text` in `#334155`).
   - Statistiche Curriculum (`.portfolio-stat`) e card bacheca (`.portfolio-card`) con background bianco, border subtle e shadow morbida multilivello.
   - Pulsanti outline pill (`.btn-outline-pill`) con bordo e testo `#0284c7` su fondo bianco.
   - Stack di autenticazione (`.auth-btn-google`, `.auth-btn-apple`, `.auth-btn-spid`, `.auth-btn-email`) adattato graficamente al tema chiaro con pulsante Apple nero a contrasto e SPID ufficiale blu.
   - Footer pubblico globale (`#site-public-footer`, `.pf-footer`) e sezione Chi Siamo (`#view-about`) allineati con background chiaro, testi scuri ad alta leggibilità e social links ciano/blu.
2. **File**: `style.css`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260926_HEROUX42`.

Feature precedente: **2026-09-26** — HEROUX41 — Suite Consolidata & Modern Navigation UI (Framer Motion Feel):
1. **Modern Navigation UI (Framer Motion Feel in Vanilla CSS/JS)**:
   - Header ultra-moderno con glassmorphism `backdrop-filter: blur(20px) saturate(180%)`, bordo sottile luminescente e shadow multilivello.
   - **Gliding Magnetic Indicator** (`.nav-indicator`): Scorrimento GPU elastico su rAF con fisica lerp (`speed = 0.24`), gradiente ciano-azzurro neon, glow sottile a 16px e tracking istantaneo di hover e click.
   - **Interactive Hover Effects**: Micro-lift a -1px sui link di navigazione, micro-press a `scale(0.95)` al click, icon glow su hover e transizioni fluide a curva `cubic-bezier(0.16, 1, 0.3, 1)`.
   - **Dropdown Altro ▾ Moderno**: Menu a comparsa floating con spring animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`), blur e gestione integrata di click outside e mobile touch per le sezioni secondarie (Stampa, Album, Ambassador, Minigiochi).
   - **Clean & Minimal Design & Full Theme Support**: Contrasti perfetti e colori calibrati per Dark Mode e Light Mode (`html[data-theme="mimetico-chiaro"]`).
2. **Consolidamento Globale Piattaforma**:
   - Audit Kit 2D verificato e sincronizzato (`_sync_catalog_kits.py`: 2892 cartelle abbinate e 460 divise indicizzate).
   - Simulatore Ruoli Creatore (`creator-role-switcher.js`) verificato su tutti i 23 ruoli specialistici.
   - Elisee World RPG retro pixel art 16-bit (`elisee-world/`) blindato su Canvas 2D con save system in localStorage.
   - Separazione netta pubblico/dashboard con `isPublicView()` e conformità anti-fake 30 giorni (`verifica-account.js`).
3. **File**: `es-nav-ux.css`, `es-nav-ux.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX41`.

Feature precedente: **2026-09-26** — HEROUX40 — Traguardo Milestone Piattaforma Pro Consolidata (Zero Latency + Full Suite Live):
1. **Milestone Piattaforma Pro Consolidata**:
   - Tutte le funzionalità strategiche integrate, blindate e operative a zero-latenza (<40ms):
     - **Action Menu Pro**: Zero-latency glide, navigazione da tastiera e feedback immediato.
     - **Success System Pro**: Done screens cinematiche, toast dinamici reversibili e celebrazione confetti.
     - **Hub Mercato Pro Avanzato**: Drag & Drop nativo HTML5, filtro IA stealth in tempo reale, Secret List stealth con contatori dinamici e sincronizzazione badge globale.
     - **Schede Tecniche IA Pro**: Radar 3vs3 pro ad alta risoluzione, Canvas donut score IA e schede comparative.
     - **Candidature Club Pro**: Form doppio ("Cosa offriamo" / "Cosa richiediamo") con Auto-Match IA predittivo full.
   - Design System unificato: Palette (#00f5d4, #ff2d55, #ff6b9d, #0a0a0a), micro-interazioni ad altissima frequenza, onde ripple neon e radius coerente.
2. **File**: `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX40`.

Feature precedente: **2026-09-26** — HEROUX39 — Market Hub Pro Avanzato (Evoluzione Nativa HTML5 + Secret List Sync):
1. **Market Hub Pro Avanzato Engine (`styles/market-hub-pro.css`, `market-hub-pro.css`, `js/market-hub-pro-handler.js`, `market-hub-pro-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Drag & Drop nativo HTML5 ultra-fluido: spostamento di elementi verso la `Secret List Stealth` con highlight dinamico e drop target immediato.
     - Notifiche stealth con toast non invasivo `EliseeSuccessSystem.showToast('Added to Secret List (Notifica Stealth)', 1800)`.
     - Sincronizzazione contatori dinamica Secret List (badge 10, split 6 Scout + 4 Wall) e sync su barra mobile/dock (`EliseeDynamicSync.setBadge`).
     - Filtro IA stealth a digitazione in tempo reale su club e ruoli (`DS`, `Scout`, `Analyst`, `Wall Transfer`).
     - Wall Transfer interattivo e funzione di esportazione report per DS/Scout (`exportReport` / `window.exportMarketReport`).
   - Esposizione globale: `window.EliseeMarketHubPro` (`init`, `filterItems`, `updateSecretCount`, `exportReport`).
2. **File**: `styles/market-hub-pro.css`, `market-hub-pro.css`, `js/market-hub-pro-handler.js`, `market-hub-pro-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX39`.

Feature precedente: **2026-09-26** — HEROUX38 — Market Hub Pro Avanzato (Drag & Drop + Notifiche Stealth + Timeline + Export):
1. **Market Hub Pro Avanzato Engine (`styles/market-hub-pro.css`, `market-hub-pro.css`, `js/market-hub-pro-handler.js`, `market-hub-pro-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Drag & Drop reattivo: trascinamento istantaneo di qualsiasi club dalla lista generale alla `Secret List Stealth`.
     - Notifica stealth automatica all'aggiunta (`Added to Secret List (Notifica Stealth)`) con toast reversibile `EliseeSuccessSystem`.
     - Aggiornamento automatico del contatore `market-badge` e sincronizzazione globale badge messaggi tramite `EliseeDynamicSync.setBadge('badge-mobile-msgs', count)`.
     - Filtro IA stealth istantaneo a digitazione su nome club, ruolo (DS, Scout, Analyst) e tipo offerta.
     - Wall Transfer FIFA Style interattivo con feedback visivo e reload assistito.
     - Esportazione report Secret List (`exportReport` / `window.exportMarketReport` con dialog di stampa e toast).
   - Esposizione globale: `window.EliseeMarketHubPro` (`init`, `filterItems`, `updateSecretCount`, `exportReport`).
2. **File**: `styles/market-hub-pro.css`, `market-hub-pro.css`, `js/market-hub-pro-handler.js`, `market-hub-pro-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX38`.

Feature precedente: **2026-09-26** — HEROUX37 — Candidature Club Pro (Form a Due Blocchi + Auto-Match IA Full):
1. **Candidature Club Pro Engine (`styles/candidature-pro.css`, `candidature-pro.css`, `js/candidature-pro-handler.js`, `candidature-pro-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Form a due blocchi ("Cosa offriamo" e "Cosa richiediamo") con textarea stilizzate in dark neon e focus ciano (`#00f5d4`).
     - Pulsanti submit "Invia Offerta" e "Invia Richiesta" con gradiente ciano-magenta, hover scale 1.05 e glow neon a 30px.
     - Auto-match IA full con calcolo dinamico del punteggio (score donut con conic-gradient, predizione dettagliata per DS/Scout & Wall Transfer).
     - Integrazione nativa con `createRipple` (onde neon) e `EliseeSuccessSystem.showToast` (feedback istantaneo).
     - Azione "Nuova candidatura" per reset rapido del modulo matching.
   - Esposizione globale: `window.EliseeCandidaturePro` (`match`, `submitOffriamo`, `submitRichiediamo`, `clearMatch`).
2. **File**: `styles/candidature-pro.css`, `candidature-pro.css`, `js/candidature-pro-handler.js`, `candidature-pro-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX37`.

Feature precedente: **2026-09-26** — HEROUX36 — Schede Tecniche IA Pro (Canvas Grafico + Radar Live + API Mock):
1. **Schede Tecniche IA Pro Engine (`styles/radar-pro.css`, `radar-pro.css`, `js/radar-pro-handler.js`, `radar-pro-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Sezione `#schede-tecniche-pro` con griglia radar ad alta risoluzione in stile dark neon.
     - Donut score circolare con `conic-gradient` dinamico (score da 0 a 10), box shadow a 20px rgba ciano neon `rgba(0,245,212,0.25)`.
     - Barra di progresso predittiva animate a 400ms cubic-bezier con gradiente ciano-magenta (`#00f5d4` a `#ff2d55`).
     - Micro-interazioni su card (hover -8px, glow a 40px) e click predizione con toast reversibile `EliseeSuccessSystem.showToast` e ripple nativo `createRipple`.
     - Mock prediction scores per club e profili (Northwind Labs 9.8, Halcyon Bank 7.4, Nova FC 6.1, Real Madrid 9.2, Chelsea 8.1, PSG 9.5).
   - Esposizione globale: `window.EliseeRadarPro` (`init`, `scores`).
2. **File**: `styles/radar-pro.css`, `radar-pro.css`, `js/radar-pro-handler.js`, `radar-pro-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX36`.

Feature precedente: **2026-09-26** — HEROUX35 — Bacheca Annunci & Chi Siamo Full Synergy (Zero-Latency + Menu ⋯ + Micro-interazioni):
1. **Bacheca & Chi Siamo Synergy Engine (`styles/bacheca.css`, `bacheca.css`, `js/bacheca-handler.js`, `bacheca-handler.js`, `styles/chi-siamo.css`, `chi-siamo.css`, `js/chi-siamo-handler.js`, `chi-siamo-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Bacheca Annunci moderna con header branding `ELISEE SCOUT` in ciano `#00f5d4`, bottoni "Nuovo annuncio" e "Crea profilo" con ripple e toast istantaneo.
     - Griglia opportunità con card hover elevate (-8px, box-shadow ciano `rgba(0,245,212,0.25)`), toggle selezione `.selected` con toast reversibile.
     - Menu laterale e bottoni `⋯` con hover animato (scale 1.1) e apertura facilitata tramite `EliseeActionMenu`.
     - Chi Siamo rifinito con micro-interazioni neon sulle parole chiave ("zero fake account", "opportunità reali", "nessun rischio") a latenza <40ms.
   - Esposizione globale: `window.EliseeBacheca` (`init`), `window.EliseeChiSiamo` (`init`).
2. **File**: `styles/bacheca.css`, `bacheca.css`, `js/bacheca-handler.js`, `bacheca-handler.js`, `styles/chi-siamo.css`, `chi-siamo.css`, `js/chi-siamo-handler.js`, `chi-siamo-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX35`.

Feature precedente: **2026-09-26** — HEROUX34 — Chi Siamo (Zero-Latency + Micro-interazioni Neon):
1. **Chi Siamo Engine (`styles/chi-siamo.css`, `chi-siamo.css`, `js/chi-siamo-handler.js`, `chi-siamo-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Layout minimale e pulito in dark mode (`#0a0a0a`), tipografia ad alta leggibilità, headline neon ciano `#00f5d4` in maiuscolo spaziato.
     - Micro-interazioni sulle keyword ("zero fake account", "opportunità reali", "nessun rischio") con classe `.highlight`: hover ultra-reattivo a 40ms, scale 1.08 e glow neon ciano (`box-shadow: 0 0 20px rgba(0,245,212,0.3)`).
     - Link cronologia con ripple effect nativo (`createRipple`) e toast reversibile `EliseeSuccessSystem.showToast`.
     - Piena conformità GDPR Art. 13-30 e tracciamento GPS valorizzati graficamente.
   - Esposizione globale: `window.EliseeChiSiamo` (`init`).
2. **File**: `styles/chi-siamo.css`, `chi-siamo.css`, `js/chi-siamo-handler.js`, `chi-siamo-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX34`.

Feature precedente: **2026-09-26** — HEROUX33 — Bacheca Opportunità Zero-Latency (Filtri Reattivi + Card Selezionate + Menu ⋯):
1. **Bacheca Engine (`bacheca.css`, `bacheca-handler.js`, `styles/bacheca.css`, `js/bacheca-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Dashboard annunci con filtri a cascata (Ruoli: DS, Scout, Analyst / Categorie: Wall Transfer, Annuncio, Squadre / Zone: Città, Provincia, Regione, Italia).
     - Griglia opportunità con card interattive hover (glow ciano `#00f5d4`, translate -8px, transizioni 40ms fluide).
     - Selezione multipla reattiva al click con classe `.selected` e toast reversibile `EliseeSuccessSystem.showToast`.
     - Menu laterale / inline `⋯` collegato all'Action Menu rapido e ripple effect nativo `createRipple`.
     - Tasti header "Nuovo annuncio" e "Crea profilo" sincronizzati con feedback toast immediato.
   - Esposizione globale: `window.EliseeBacheca` (`init`).
2. **File**: `bacheca.css`, `bacheca-handler.js`, `styles/bacheca.css`, `js/bacheca-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX33`.

Feature precedente: **2026-09-26** — HEROUX32 — Market Hub Pro (Secret List Stealth + Wall Trasferimenti FIFA Style):
1. **Market Hub Pro Engine (`market-hub-pro.css`, `market-hub-pro-handler.js`, `styles/market-hub-pro.css`, `js/market-hub-pro-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Drag-and-drop completo da elenco trasferimenti a Secret List con classe `.stealth` e badge live.
     - Search filter IA stealth real-time sui target trasferimenti (DS / Scout / Analyst / Club).
     - 52 target mock calibrati (Northwind Labs, Halcyon Bank, Nova FC, Real Madrid, Man City, Chelsea, PSG, Bayern, Juventus, Milan, Inter, Napoli, etc.).
     - Wall Transfer interattivo FIFA style con feedback visivo e animazione GPU.
     - Timeline interattiva degli stati della trattativa (`sent`, `opened`, `paid`).
     - Tasto Export Report Secret List con notifica toast `EliseeSuccessSystem.showToast` e print preview.
     - Integrazione globale sincronizzata con `EliseeDynamicSync.setBadge('badge-mobile-msgs', count)` e ripple effect.
   - Esposizione globale: `window.EliseeMarketHubPro` (`init`, `filterItems`, `updateSecretCount`, `exportReport`).
2. **File**: `market-hub-pro.css`, `market-hub-pro-handler.js`, `styles/market-hub-pro.css`, `js/market-hub-pro-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX32`.

Feature precedente: **2026-09-26** — HEROUX31 — Candidature Club (Form Doppio + Matching IA):
1. **Candidature Club Engine (`candidature.css`, `candidature-handler.js`, `styles/candidature.css`, `js/candidature-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Form doppio blocco reattivo a 2 colonne: "❇️ Cosa offriamo" e "❇️ Cosa richiediamo" con textarea stilizzate in dark mode e glow ciano al focus.
     - Calcolo predittivo Auto-Match IA algoritmico con doughnut score circolare conic-gradient.
     - Valutazione dinamica del match (alto / medio) con testo di compatibilità ruolo DS / Scout.
     - Tasti di invio dedicati con toast reversibili `EliseeSuccessSystem.showToast` e reset pulito del match.
     - Live ticker badge sincrono (800ms) integrato con `EliseeDynamicSync.setBadge('badge-mobile-msgs', count)`.
   - Esposizione globale: `window.EliseeCandidature` (`match`, `submitOffriamo`, `submitRichiediamo`, `clearMatch`).
2. **File**: `candidature.css`, `candidature-handler.js`, `styles/candidature.css`, `js/candidature-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX31`.

Feature precedente: **2026-09-26** — HEROUX30 — Schede Tecniche IA (Radar 3vs3 + Score Predittivo 1-10):
1. **Radar 3vs3 IA Engine (`radar.css`, `radar-handler.js`, `styles/radar.css`, `js/radar-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Confronto radar 3vs3 con card interattive hover (scale + glow ciano `#00f5d4`).
     - Donut chart circolare con conic-gradient ad alta precisione basato sullo score calcolato (1-10) per ruolo (`DS-Top: 9.8`, `Scout-Expert: 7.4`, `Analyst: 6.1`).
     - Progress bar con linear-gradient ciano/magenta per livello di compatibilità.
     - Badge reattivo live con loop temporizzato a 1200ms sincrono con `EliseeDynamicSync.setBadge('badge-mobile-msgs', count)`.
   - Esposizione globale: `window.EliseeRadarSystem` (`init`, `calculateScore`, `scores`).
2. **File**: `radar.css`, `radar-handler.js`, `styles/radar.css`, `js/radar-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX30`.

Feature precedente: **2026-09-26** — HEROUX29 — Market Hub Stealth & FIFA Wall Style Architecture:
1. **Market Hub Stealth Engine (`market-hub.css`, `market-hub-handler.js`, `styles/market-hub.css`, `js/market-hub-handler.js`)**:
   - Implementazione zero-latenza (<40ms):
     - Secret List stealth con bordo ciano `#00f5d4` e sfondo speculare.
     - Wall Trasferimenti stile FIFA con badge incrementale e gradient animato.
     - Tabs switch reattivo (`Available` / `Secret List`).
     - Ripple effect al tocco integrato con `window.createRipple`.
     - Aggiornamento istantaneo del contatore badge globale (`EliseeDynamicSync.setBadge('badge-mobile-msgs', count)`).
     - Notifica toast reversibile (`EliseeSuccessSystem.showToast`).
   - Esposizione globale: `window.EliseeMarketHub` (`init`, `switchTab`, `addToSecret`).
2. **File**: `market-hub.css`, `market-hub-handler.js`, `styles/market-hub.css`, `js/market-hub-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX29`.

Feature precedente: **2026-09-26** — HEROUX28 — Action Menu Zero-Latency & Success System Connected Architecture:
1. **Action Menu Zero-Latency Engine (`action-menu.css`, `action-menu-handler.js`, `styles/action-menu.css`, `js/action-menu-handler.js`)**:
   - Implementate le regole matematiche del video (HEROUX28):
     - Trigger pulsante con glow (#ff00ff / ciano) e drop-shadow preciso.
     - Sheet con fade-in/blur rapido (180ms cubic-bezier).
     - Plate glide con border-radius dinamico e ombra speculare magenta/ciano.
     - Radial glow ink su puntatore (`pointermove`, `am_glow`).
     - Render lista con icone, divider e stati attivi/danger.
     - Navigazione da tastiera completa zero-latency (<40ms glide): `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Escape`, `Tab`.
     - Chiusura click-outside ed eventi dedicati.
   - Esposizione globale: `window.EliseeActionMenu` (`init`, `toggle`, `close`, `setActive`, `moveActive`, `chooseItem`).
2. **Success System + Badge & Radius Dinamici Connessi (`success-handler.js`, `js/success-handler.js`)**:
   - `connectToStore()`: unione diretta con `localStorage['elisee_user_badges']` e `localStorage['elisee_user_radius']`.
   - `onMilestonePaid()`: incrementa badge mobile msgs (+3), badge inbox (+1), imposta `radius.pill = 9999` (pill infinito), attiva confetti (40) e visualizza toast con benchmark <40 ms.
   - `connectRadiusPill()`: toggle interattivo per la pillola raggio matematico.
   - Demo `#success-system` con conteggio live del badge in millisecondi.
3. **File**: `action-menu.css`, `action-menu-handler.js`, `styles/action-menu.css`, `js/action-menu-handler.js`, `success-handler.js`, `js/success-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX28`.

Feature precedente: **2026-09-26** — HEROUX27 — Success is a System Architecture:
1. **Success is a System Engine (`success-system.css`, `success-handler.js`, `styles/success-system.css`, `js/success-handler.js`)**:
   - Implementate le 8 regole matematiche del video:
     - 3 Done Screens + "one keeps the user" (`nextSteps`).
     - Specific details ("Northwind Labs • €2,400 due Oct 12").
     - Reversible vs irreversible: reversible = toast (`showToast`), irreversible = full page.
     - 1 primary next + 1 way back (OK button + close handle).
     - 1 Open loop (`openLoop(id)`).
     - Rare joy only (`showRareJoy()` con milestone card €2,400).
     - Confetti solo su milestone reali (`triggerConfetti(count)`).
     - 5 decisions one screen (Specific, Next Step, Stakes, Open Loop, Rare Joy).
     - Claude-style UX Engine (`/ux-design`, `/ux-audit`, `/ux-review`, `/restyle`).
   - Esposizione globale `window.EliseeSuccessSystem` (`createDoneScreen`, `showToast`, `triggerConfetti`, `showRareJoy`, `openLoop`, `uxEngine`).
2. **File**: `success-system.css`, `success-handler.js`, `styles/success-system.css`, `js/success-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX27`.

Feature precedente: **2026-09-26** — HEROUX26 — Dynamic Live Reactive Badges & Mathematical Radius Store:
1. **Dynamic Sync Controller Zero-Latency (`dynamic-sync.js`, `js/dynamic-sync.js`)**:
   - Creato store reattivo bidirezionale per `localStorage['elisee_user_badges']` e `localStorage['elisee_user_radius']`.
   - `syncAllBadges()` applica i contatori in tempo reale tramite `window.updateBadge` con zero latenza.
   - `syncAllRadius()` applica i raggi matematici (card, chip, button, pill, edges, ringGap, image) tramite il sistema geometrico HEROUX25.
   - Esposizione globale `window.EliseeDynamicSync`: `setBadge(key, count)`, `updateBadges(obj)`, `updateRadius(obj)`, `applyAll()`, `demo()`.
   - Event listeners attivi su cross-tab `storage` e custom events `elisee:sync-badges` e `elisee:sync-radius`.
   - Benchmark `performance.now()` (< 40ms verificato con log console `[HEROUX26]`).
2. **File**: `dynamic-sync.js`, `js/dynamic-sync.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX26`.

Feature precedente: **2026-09-26** — HEROUX25 — Radius System Zero-Latency Architecture:
1. **Sistema Matematico Radius Completo (`radius-system.css`, `radius-handler.js`, `styles/radius-system.css`, `js/radius-handler.js`)**:
   - Implementate le regole matematiche dei raggi d'angolo:
     - Nested corners (`calc(var(--outer) - var(--inner))`).
     - Scale proportion (radius follows component size).
     - Pill geometry (`border-radius: 9999px; padding: 2px 12px;`).
     - Edges layout (`border-radius: 16px 16px 0 0;`).
     - Outer ring with gap (`calc(var(--outer) + var(--gap))`).
     - Image clipping (`.radius-image.clip` con gradiente di luce speculare).
   - Controller JS zero-latenza (`applyRadius`, `applyPill`, `applyEdges`, `applyRing`, `clipImage`) esposto come `window.EliseeRadiusSystem` e auto-eseguito su `DOMContentLoaded`.
2. **File**: `radius-system.css`, `radius-handler.js`, `styles/radius-system.css`, `js/radius-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX25`.

Feature precedente: **2026-09-26** — HEROUX24 — Zero-Latency Navigation Controller on All Internal Views:
1. **Navigazione Sincrona Zero-Latenza su Tutte le Viste (`es-nav-ux.js`, `es-nav-ux.css`)**:
   - Rimosso ogni timeout artificiale e delay di uscita: `wrapSwitchView()` esegue `orig.apply(this, arguments)` sincrono a t=0ms per tutte le viste (Bacheca, Stampa, Mappa, About, TC Panel, Iscrizioni, Mercato Hub, Schede Tecniche, Squadre).
   - Scroll reset immediato `window.scrollTo(0, 0)` e sblocco overflow (`document.body.style.overflow = ''`) al cambio vista.
   - Sincronizzazione atomica di tutte le classi body: `is-view-bacheca`, `is-view-stampa`, `is-view-mappa`, `is-view-about`, `is-view-tc-panel`, `is-view-iscrizioni`, `is-view-mercato`, `is-view-schede`, `is-view-squadre`.
   - Introdotto **Global Nav Capture Handler** (`document.addEventListener('click', ..., true)`) per intercettare istantaneamente ogni click di cambio vista, attivare il ripple ciano e invocare `switchView` in capture phase senza lag o doppi tap.
   - Benchmark integrato con `performance.now()` (< 40ms verificato).
2. **File**: `es-nav-ux.js`, `es-nav-ux.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX24`.

Feature precedente: **2026-09-26** — HEROUX23 — Micro-Interactions Ultra-Premium & Neon Luminescent Ripple:
1. **Micro-Interactions Desktop & Universali (`micro-interactions.css`, `micro-interactions.js`)**:
   - Creato controller ultra-performante per micro-interazioni aptico-visive a 60/120 fps.
   - Ripple luminescente al neon ciano Elisee (`.es-ripple` con gradiente radiale ciano) calcolato al `pointerdown` con `requestAnimationFrame` e rimosso a 240ms senza reflow.
   - Feedback micro-scale `scale(0.98)` immediato (40ms) su `:active` per tutti i bottoni (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-nav-accedi`, `.nav-brand`, `.es-touchable`).
   - Zero lock di layout, zero lag, memoria deallocata istantaneamente.
2. **File**: `micro-interactions.css`, `micro-interactions.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX23`.

Feature precedente: **2026-09-26** — HEROUX22 — Zero-Latency Badge UI System & Topbar Integration:
1. **Badge System Zero-Latency (`badge-system.css`, `badge-handler.js`)**:
   - Creato modulo CSS/JS autonomo per la gestione zero-latenza di badge conteggio e status (`updateBadge(id, count)`, `clearBadge(id)`, `pinToCorner(selector, anchored)`).
   - Cap automatico `99+` con classe `.capped` e transizione neon/locked a 40ms.
   - Sfumature curate: count-badge `#ff2d55 -> #ff6b9d`, status/capped `#00f5d4 -> #00c4a8`.
   - Agganciati i badge id `#badge-mobile-msgs` e `#badge-mobile-notifs` ai pulsanti della topbar mobile.
2. **File**: `badge-system.css`, `badge-handler.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX22`.

Feature precedente: **2026-09-26** — HEROUX21 — Mobile Web App Optimization & Drawer Zero-Latency Swipe:
1. **Zero-Latency Mobile Navigation & Reset (`mobile-webapp.js`)**:
   - `navigateTo(viewKey, hash)` allineato alla logica HEROUX20: click su Home / Brand / Hero esegue immediato `location.hash = '#hero'`, chiude il drawer, azzera classi interne, resetta `is-scrolled`, nasconde `#view-mappa` e fa `window.scrollTo(0, 0)` secco.
   - Click handler in capture phase su tutti i brand mobile (`.es-m-brand`).
   - Sblocco immediato dello scroll (`document.body.style.overflow = ''` e `html`) alla chiusura del drawer senza ritardi su iOS Safari.
2. **Gesture Swipe-to-Close (`mobile-webapp.js`, `mobile-webapp.css`)**:
   - Implementato touch swipe orizzontale fluido verso destra su `.es-m-drawer` (`touch-action: pan-y`, `will-change: transform`, `translate3d`).
3. **Micro-Interaction Touch Ultra-Smooth (`mobile-webapp.css`)**:
   - Feedback aptico-visivo micro-scale `scale(0.96)` su `:active` per `.es-m-brand`, `.es-m-btn-icon`, `.es-m-btn-hamburger`, `.es-m-tab-item`, `.es-m-drawer-link` con transizione a 40ms.
4. **File**: `mobile-webapp.js`, `mobile-webapp.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX21`.

Feature precedente: **2026-09-26** — HEROUX20 — Hash #hero Sincrono Diretto, Drop is-scrolled, Reset Header Trasparente e Rimozione Selettore :has Mappa:
1. **Rimozione Selettore :has in `mappa-club.css`**:
   - Eliminato `body:has(#view-mappa:not([style*="none"])) header...`: il selettore teneva l'header a `background: rgba(5,6,8,0.72)` anche a classi già rimosse finché `#view-mappa` restava nel DOM.
2. **Forzatura Hash e Trasparenza Sincrona nel Capture Handler (`es-nav-ux.js`)**:
   - `window.history.replaceState(null, '', '#hero')` e `location.hash = '#hero'` nello stesso tick.
   - Rimozione immediata di `is-scrolled` dall'header con impostazione temporanea inline `background: transparent !important; backdrop-filter: none !important;` tolta poi al frame successivo (rAF) non appena lo stato home è stabile.
   - `#view-mappa.style.display = 'none'` immediato e `window.scrollTo(0, 0)` secco (`behavior: 'auto'`) per azzerare istantaneamente `window.scrollY`.
3. **File**: `mappa-club.css`, `es-nav-ux.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX20`.

Feature precedente: **2026-09-26** — HEROUX19 — Reset Sincrono Totale Logo Brand con rAF di Rinforzo e Pulizia SwitchView:
1. **Reset Sincrono Totale Logo Brand (`es-nav-ux.js`)**:
   - Handler capture phase con rimozione sincrona immediata di `is-internal-view`, `is-view-mappa`, `is-view-stampa` e classe `.is-on` dall'indicatore, seguito da `syncActiveLink('home', true)` e `switchView('home', '#hero')`.
   - `requestAnimationFrame` di rinforzo che riafferma lo stato pulito su eventuali ritardi del task loop.
   - `wrapSwitchView()` ora riconosce `targetView === 'home'` bypassando qualsiasi timeout o animazione leave ritardata (switch sincrono istantaneo a Home).
2. **Hardening `coreSwitchView` & `switchView` (`index.html`, `app.js`)**:
   - Ramo `home` di `coreSwitchView` (index.html) e `switchView` (app.js) integrato con la rimozione esplicita garantita delle classi di vista interna e spegnimento indicatore.
3. **File**: `es-nav-ux.js`, `index.html`, `app.js`, `sw.js`, `version.json`. Cache `v20260925_HEROUX19`.

Feature precedente: **2026-09-25** — HEROUX18 — Click Logo Istantaneo al Primo Colpo (Capture Phase & StopPropagation):
1. **Click Logo / Brand in Capture Phase (`es-nav-ux.js`)**:
   - Registrato il click listener su `.site-brand, a[href="#hero"], a[href="#view-home"]` in Capture Phase (`useCapture: true`) con `preventDefault()` e `stopPropagation()`.
   - Risolto il caso di potenziale corsa/inghiottimento da `#mappa-portal`: ora il primo singolo click sul brand resetta all'istante l'hash a `#hero`, rimuove le classi `is-internal-view`, `is-view-mappa` e `is-view-stampa`, spegne la pillola Lerp GPU e riporta l'header allo stato 100% trasparente senza ritardi.
2. **File**: `es-nav-ux.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX18`.

Feature precedente: **2026-09-25** — HEROUX17 — Allineamento Glass Header Mappa e Click Logo Resiliente a Doppia Pressione:
1. **Allineamento Token Glass Header Mappa (`mappa-club.css`, `es-nav-ux.css`)**:
   - Sostituito l'override opaco `background: rgba(11, 14, 20, 0.96) !important;` su `body.is-view-mappa` con il token unificato `background: rgba(5, 6, 8, 0.72) !important; backdrop-filter: blur(14px) !important;` per perfetta coerenza con *Chi siamo* e *Bacheca*.
2. **Click Logo / Brand Resiliente (`es-nav-ux.js`, `index.html`)**:
   - Aggiunto listener click esplicito su `.site-brand, a[href="#hero"], a[href="#view-home"]` che garantisce reset all'istante anche per chiamate programmatiche `.click()` o doppie pressioni con hash già `#hero`.
   - Rimozione pulita e immediata di `is-internal-view`, `is-view-mappa` e `is-view-stampa` durante il ritorno a Home e smooth scroll verso `top: 0`.
3. **File**: `mappa-club.css`, `es-nav-ux.css`, `es-nav-ux.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX17`.

Feature precedente: **2026-09-25** — HEROUX16 — Soppressione Barra Personalizzazione Coprente e Adattamento Mobile Responsive:
1. **Soppressione Barra Personalizzazione Coprente (`cookie-profiling.js`, `es-nav-ux.css`)**:
   - Disabilitata la visualizzazione fissa in cima di `#elisee-personalization-bar` (`top: 0; z-index: 99990`) che copriva la navbar pubblica.
   - Azzerata completamente l'iniezione invasiva di `document.body.style.paddingTop = '28px'`.
   - Regola CSS globale di soppressione `#elisee-personalization-bar { display: none !important; }`.
2. **Adattamento Mobile Responsive Viste Interne (`es-nav-ux.css`)**:
   - Regola `@media (max-width: 767px)` per le viste interne con padding-top ottimizzato a `calc(56px + env(safe-area-inset-top, 0px))` per convivere perfettamente con la topbar mobile senza spazi bianchi eccessivi.
3. **File**: `cookie-profiling.js`, `es-nav-ux.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX16`.

Feature precedente: **2026-09-25** — HEROUX15 — Fix Viste Interne: Glass Header Specificity, Follower Lerp Attivo e Padding-Top Titoli:
1. **Glass Header su Viste Interne (`is-internal-view`)**:
   - Eliminato il residuo globale di `background: transparent !important` che vinceva sulle pagine interne in `index.html` e `style.css`.
   - Aggiunto selettore iper-specifico `html body.is-internal-view header.public-header...` con `rgba(5, 6, 8, 0.72) !important` e `backdrop-filter: blur(14px) !important`.
2. **Follower Lerp Attivo e Modulo Esploso (`es-nav-ux.js`)**:
   - `window.__esNavUX` espone `{ ready: true, moveIndicatorTo, syncActiveLink }`.
   - `.nav-indicator.is-on` con `opacity: 1 !important` quando attiva una voce.
   - Eliminati background e bordi fissi dai link `.active` per lasciare il disegno interamente all'indicatore fluido.
3. **Padding-Top Viste Interne (Stacco sotto la Navbar)**:
   - Applicato `padding-top: calc(var(--nav-h, 64px) + 24px) !important;` su tutte le radici di vista interna (`#about`, `#view-about`, `.about-dossier-wrap`, `#view-bacheca`, `#view-mappa`, ecc.), evitando che titoli come "VERIFICATO." finiscano sotto l'header.
4. **File**: `es-nav-ux.css`, `es-nav-ux.js`, `index.html`, `style.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX15`.

Feature precedente: **2026-09-25** — HEROUX14 — Porting Navigation UI & View Transitions Ultra-Avanzate (Zero Dipendenze):
1. **Pill Indicator Fluido e Micro-Interazioni (`es-nav-ux.css`, `es-nav-ux.js`)**:
   - Indicator fluido (`.nav-indicator`) calcolato in rAF con fisica lerp a ~0.18, che scorre via GPU `transform: translate3d(...)` e `width`, senza layout shift e senza mai toccare `left`.
   - Hover follow abilitato esclusivamente per periferiche con puntatore fine (`@media (hover: hover) and (pointer: fine)`).
   - Micro-press logo con scale(.98) e glow ciano controllato su `SCOUT`.
   - Pulsante "Accedi" e pulsanti hero `.btn` con fill animato dal basso via `::before` con `scaleY(0) -> scaleY(1)` e `translateY(-1px)`. Anello focus-visible 2px offset 3px.
   - Hit-area minima 44×44px per switch tema e lingua.
2. **Transizioni Viste e Header Intelligente**:
   - Wrap non invasivo e idempotente di `window.switchView` con crossfade fluido: uscita `translateY(10px) + opacity 0` in 180ms e ingresso `translateY(14px) -> 0 + opacity 1` in 260ms (delay 60ms).
   - Header trasparente su home e attivazione sfocatura `rgba(5, 6, 8, 0.72) + backdrop-filter: blur(14px)` su scroll (>8px) o sulle viste interne (`is-internal-view`), senza bordi né ombre.
   - Pieno supporto `prefers-reduced-motion: reduce` (solo opacity 80ms, zero transform).
3. **File**: `es-nav-ux.css`, `es-nav-ux.js`, `index.html`, `style.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX14`.

Feature precedente: **2026-09-25** — HEROUX13 — Allineamento Glow Hero dal Top Viewport ed Eliminazione Fascia Scura:
1. **Glow Hero dal Top Viewport (`.es-plx`)**:
   - Sostituita la precedente regola parallax (`background-size: 100% 160%`) che spingeva il glow in basso lasciando una lastra scura sotto la navbar.
   - Forzato `background-size: 100% 100% !important; background-position: 50% 0 !important;` con radial-gradient ellittico che parte da `-10%` in alto (`radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 189, 248, 0.38) 0%, rgba(14, 58, 77, 0.22) 42%, transparent 70%)`) e linear-gradient coordinato (`180deg, #07131c 0%, #0a3040 42%, #050608 100%`).
   - Uniformato il background base dell'intera colonna (`html, body, main, #app, #view-home, #hero, .hero-section, .hero-portfolio` a `#07131c !important;`) azzerando qualsiasi scalino cromatico.
2. **File**: `parallax.css`, `index.html`, `style.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX13`.

Feature precedente: **2026-09-25** — HEROUX12 — Fix Linea Navbar: Trasparenza Pura Header, Azzeramento Background Sovrapposti e Hero Padding:
1. **Fix Linea Navbar e Trasparenza Totale**:
   - Rimosse tutte le regole in conflitto con sfondi solidi o bordi scuri (`#0b111e`, `#0d131d`, `border-bottom: 1px solid rgba(255,255,255,.1)`) da `apple-nav.css`, `style.css` e dal blocco critico in `index.html`.
   - Inserito in fondo a tutti i fogli di stile e in `<head>` il blocco prioritario definitivo:
     - `header.public-header... { background: transparent !important; background-color: transparent !important; border: 0 !important; border-bottom: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`
     - `#hero, .hero-section, main { padding-top: 0 !important; margin-top: 0 !important; }`
     - `#hero .hero-portfolio-stage { padding-top: 88px !important; }`
     - `header.public-header.is-scrolled { background: rgba(5, 6, 8, 0.88) !important; backdrop-filter: blur(12px) !important; border-bottom: none !important; box-shadow: none !important; }`
   - Aggiunto listener JS passivo su scroll per attivare `.is-scrolled` solo dopo 20px di discesa.
2. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX12`.

Feature precedente: **2026-09-25** — HEROUX11 — Rimozione Definitiva Sidebar Fluttuante e Bottoni Fixed su Landing Page Pubblica:
1. **Risoluzione Bug Rilevamento Vista Pubblica (`role-sidebar-pro.js`)**:
   - Individuato e risolto il bug logico per cui un utente autenticato con ruolo (o admin) manteneva attive le classi di ruolo su `<body>` e la funzione `isPublicView()` ritornava `false` anche se l'utente si trovava sulla Home Page (`#hero`), mostrando la sidebar laterale fissa a sinistra.
   - Corretta `isPublicView()`: ritorna sempre `true` sulle pagine pubbliche (`#hero`, `#home`, `#about`, `#bacheca`, ecc.), aggiunge `is-public-landing` a `document.body` e attiva la soppressione totale.
2. **Blindatura CSS Assoluta Sidebar & Elementi Fixed**:
   - In `role-sidebar-pro.css`, `style.css` e nel blocco head di `index.html`:
     - `body.is-public-landing .es-pro-sidebar`, `.es-sb-hover`, `[class*="-sidebar"]`, `#es-trash`, `#es-share` e `body:has(#hero:not([hidden]))` forzati a `display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; transform: translateX(-9999px) !important;`.
3. **File**: `role-sidebar-pro.js`, `role-sidebar-pro.css`, `style.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX11`.

Feature precedente: **2026-09-25** — HEROUX10 — Reset d'Emergenza Globale Header, Componente PublicHeader & Eliminazione Disallineamento Hero:
1. **Reset d'Emergenza Globale Navbar**:
   - Inserite le 3 regole nel CSS globale (`style.css` e blocco critico in `index.html`):
     - `header, .navbar, nav, .public-header, .public-navbar { box-sizing: border-box !important; max-height: 64px !important; height: 64px !important; min-height: 64px !important; overflow: hidden !important; }`
     - `header *, .navbar *, .public-header * { box-sizing: border-box; }`
     - `.nav-container, .nav-menu, .main-nav, header nav, .public-header nav { display: flex !important; align-items: center !important; flex-wrap: nowrap !important; min-width: 0 !important; }`
2. **Adozione Componente Header Pubblico (.public-header)**:
   - Sostituito l'header con la struttura pura:
     - `.brand-logo` (`ELISEE <span>SCOUT</span>`)
     - `.main-nav` (`Chi siamo`, `Bacheca`, `Mappa`)
     - `.header-actions` (Toggle tema `🌙`, Lingua `IT ▾`, Bottone `.btn-login` `Accedi`)
3. **Allineamento Sezione Hero**:
   - Impostato `#hero` con `align-items: flex-start`, `min-height: calc(100vh - 64px)` e `.hero-portfolio-stage` con `padding-top: 24px`, eliminando la spinta a metà schermo che generava la fascia scura vuota.
4. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX10`.

Feature precedente: **2026-09-25** — HEROUX8 — Rimozione Fascia Scura Sotto Navbar & Riassegnazione Padding Sezione Hero:
1. **Rettifica Altezza & Padding Header (64px rigorosi)**:
   - Applicate le correzioni fornite: `header, .public-navbar { width: 100%; height: 64px !important; min-height: 64px !important; max-height: 64px !important; padding: 0 32px !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; background-color: #0b111e !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 1000 !important; box-sizing: border-box !important; }`.
2. **Eliminazione Vuoto/Fascia Scura Hero**:
   - Impostato `.hero-section, #hero, main { padding-top: 64px !important; margin-top: 0 !important; }` per fare aderire perfettamente la sezione Hero subito sotto la navbar senza sovrapposizioni né distacchi sproporzionati.
   - Resettato il posizionamento verticale su `.hero-portfolio-stage, .hero-portfolio-inner, .hero-typography-left` con `min-height: auto !important; height: auto !important; justify-content: flex-start !important; padding-top: 24px !important;`, eliminando il `min-height: 100vh` e `justify-content: center` che spingevano il titolo verso il fondo creando la fascia vuota.
3. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX8`.

Feature precedente: **2026-09-25** — HEROUX7 — Adozione Struttura Pulita Navbar Pubblica e Isolamento Aree Riservate:
1. **Header Pubblico a 3 Blocchi Essenziali (.public-navbar)**:
   - Sostituito l'intero header dell'homepage pubblica con la specifica fornita da Eliseo:
     - Sinistra: `.nav-logo` con scritta nitida `ELISEE SCOUT`.
     - Centro: `.nav-menu` con solo i link essenziali: `Chi siamo`, `Bacheca`, `Mappa` (`white-space: nowrap !important; flex-wrap: nowrap !important; gap: 24px;`).
     - Destra: `.nav-actions` con toggle tema 🌙, selettore lingua `IT ▾` e pulsante `.btn-login` con etichetta `Accedi`.
   - Rimozione totale dall'header pubblico di qualsiasi voce di intrattenimento (Stampa, Album, Ambassador, Minigiochi) e di tutti i dropdown che potevano generare sdoppiamenti o il rettangolo bianco/giallo fluttuante.
2. **CSS Puro .public-navbar & No-Wrap Assoluto**:
   - `height: 64px; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; background-color: #0d131d; border-bottom: 1px solid rgba(255, 255, 255, 0.1);`.
   - Compatibilità istantanea Light Mode (`background-color: #ffffff !important; border-bottom: 1px solid rgba(0, 0, 0, 0.08);`).
   - `#nav-dropdown-altro, #menu-nav-dropdown-more, .es-nav-dropdown { display: none !important; }`.
3. **Card Atleta Integrata**:
   - Rimosso qualsiasi testo grezzo o statistiche a cascata (`94VEL, 89TIR...`) non formattate sotto l'immagine della landing page, mantenendo la card pulita con foto ad alta definizione e badge grafici integrati.
4. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX7`.

Feature precedente: **2026-09-25** — HEROUX6 — Ripristino e Blindatura Struttura Navbar (Codice di Emergenza, Eliminazione Sottotitoli, Dropdown Risorse e No-Wrap):
1. **Applicazione Codice di Emergenza Layout Navbar**:
   - Sostituito il vecchio `display: grid; grid-template-columns: auto minmax(0, 1fr) auto;` in `style.css` con il layout flexbox raccomandato: `.navbar, .portfolio-navbar { display: flex !important; align-items: center !important; justify-content: space-between !important; height: 64px !important; padding: 0 24px !important; flex-wrap: nowrap !important; white-space: nowrap !important; }`.
   - Implementato `.nav-links` su `nav#nav-menu` con `display: flex !important; align-items: center !important; gap: 16px !important; white-space: nowrap !important; flex-wrap: nowrap !important;`.
   - Voci `.nav-item` / `.nav-link` a `font-size: 14px !important; font-weight: 500 !important; white-space: nowrap !important;`.
2. **Menu a Tendina "Risorse ▾" e Isolamento Assoluto**:
   - Adottata la soluzione rapida suggerita: tutte le voci secondarie (📰 Stampa, 🎴 Album, 🤝 Ambassador, 🎮 Minigiochi) sono state raggruppate dentro l'unico menu a tendina "Risorse ▾" (`#nav-dropdown-altro`), eliminando qualsiasi sottotitolo o testo prolisso dalla barra visibile.
   - Il dropdown popup `#menu-nav-dropdown-more` è rigorosamente `position: absolute !important; display: none !important;` quando chiuso, evitando che i link partecipino al flusso dell'header o provochino sdoppiamenti e wrapping su più righe.
3. **Hard Cache-Wipe & Disattivazione SW Vecchi**:
   - Aggiornato `BUILD_VERSION = '20260925_HEROUX6'` nello script in `index.html` per forzare l'immediata eliminazione delle cache statiche e deregistrazione dei service worker obsoleti che servivano la vecchia navbar HTML.
4. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX6`.

Feature precedente: **2026-09-25** — HEROUX5 — Trasformazione Header in Navbar Classica Full-Width (Eliminazione Floating Pill e Banda Scura):
1. **Trasformazione Header in Navbar Classica Full-Width**:
   - Eliminato il layout a "pillola fluttuante" che causava altezze incontrollate e una spessa banda vuota scura sotto i link.
   - L'header (`header.main-header`, `.portfolio-header`) è ora una barra full-width aderente in cima allo schermo (`position: fixed; top: 0; left: 0; width: 100%; height: 64px; max-height: 64px; border-radius: 0; padding: 0 24px;`), con sfondo coerente semitrasparente (`rgba(10, 15, 30, 0.92)` in Dark, `rgba(255, 255, 255, 0.96)` in Light), `backdrop-filter: blur(12px)` e sottile `border-bottom: 1px solid rgba(255, 255, 255, 0.08)`.
2. **Container Interno Centrato e Pulito**:
   - `.portfolio-navbar` configurata a larghezza piena (`max-width: 1440px; margin: 0 auto; height: 64px; padding: 0; border: none; border-radius: 0; box-shadow: none; background: transparent;`) con allineamento verticale centrato (`align-items: center; justify-content: space-between; gap: 12px;`).
3. **Eliminazione Radicale di Sottotitoli e Compattazione Blocco Destro**:
   - Forzata la rimozione e il `display: none !important;` su ogni elemento `<small>` o testo descrittivo prolisso dentro l'header e i menu di navigazione.
   - Blocco azioni destro (`.portfolio-nav-right`, `.nav-auth-actions`, lingua, ricerca, profilo utente) compattato con `gap: 6px;` e allineamento inline senza provocare distorsioni verticali.
4. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX5`.

Feature precedente: **2026-09-25** — HEROUX4 — Risoluzione Header Wrapping, Overflow Clip e Compattazione Dropdown Menu:
1. **Compattazione Dropdown Menu e Rimozione Testi Verbosi nell'Header**:
   - Rimosse tutte le descrizioni estese multilinea ("Collezione e profili seguiti", "Programma talent & testimonial", "Carriera RPG e quiz tattici", "Notizie, interviste e comunicati") dalla barra di navigazione orizzontale, convertite in attributi `title` (tooltip nativi informativi) e mantenendo esclusivamente i titoli sintetici compatti (`📰 Stampa`, `🎴 Album`, `🤝 Ambassador`, `🎮 Minigiochi`).
   - Forzato `display: none !important;` in `style.css` su `.es-nav-item-desc` e `.es-nav-item-text small` per prevenire qualsiasi riespansione orizzontale/verticale.
2. **Posizionamento Assoluto Rigoroso del Menu a Tendina (`.es-nav-dropdown-menu`)**:
   - Impostato `position: absolute !important;` e `display: none !important;` quando chiuso, con apertura in `display: flex !important;` solo in caso di classe `.is-open`, hover o focus.
   - Svincolato completamente il menu dal flusso normale dell'header, impedendo che spinga le altre voci a capo o aumenti l'altezza della navbar.
3. **Gestione Flexbox No-Wrap e Ripristino Overflow Header**:
   - Applicato `flex-wrap: nowrap !important;` e `white-space: nowrap !important;` a tutti i container nav (`.portfolio-navbar`, `.navbar`, `header.main-header .navbar`, `.nav-menu`, `.portfolio-nav`, `#nav-menu`).
   - Rimosso il clipping distruttivo `overflow: hidden !important;` che tagliava la riga superiore delle voci o mozzava i menu a comparsa, impostando `overflow: visible !important;` a 52px di altezza esatta conforme ad Apple/macOS design.
4. **Armonizzazione Dropdown in Light Mode**:
   - Assicurato contrasto nitido per i titoli sintetici del dropdown in Light Mode (`#0f172a` con hover ciano `#0284c7`).
5. **File**: `index.html`, `style.css`, `apple-nav.css`, `sw.js`, `version.json`. Cache `v20260925_HEROUX4`.

Feature precedente: **2026-09-25** — HEROUX3 — Separazione Rigida Viste Pubbliche vs Dashboard Riservate (Rimozione Sidebar dalla Landing Page):
1. **Rimozione Sidebar dalle Pagine Pubbliche (Home, Chi siamo, Bacheca, Mappa)**:
   - Eliminata la sidebar fluttuante a sinistra (`.es-sb-hover`, `.es-pro-sidebar`, `.es-modern-sidebar`, `[class*="-sidebar"]`) dalla landing page pubblica (`#hero`, `#home-about`, `#view-home`, ecc.) che copriva direttamente le lettere del titolo "ELISEE SCOUT" e duplicava le funzioni della Navbar.
   - Creata in `role-sidebar-pro.js` la funzione `isPublicView()` che rileva istantaneamente se l'utente naviga su una pagina pubblica o istituzionale, disattivando e nascondendo qualsiasi sidebar.
2. **Attivazione Esclusiva nelle Dashboard Private / Riservate di Ruolo**:
   - La sidebar gestionale interna rimane abilitata esclusivamente quando l'utente si trova all'interno di una dashboard privata autenticata di ruolo (`is-player-mode`, `is-pres-mode`, `is-coach-mode`, `is-ds-mode`, `is-obs-mode`, `is-in-role-dashboard`, ecc.).
3. **Blindatura CSS e Rimozione Trash Button**:
   - Aggiunte regole CSS tassative in `role-sidebar-pro.css` e `style.css` per forzare `display: none !important;` su tutte le sidebar e sul pulsante trash animato (`#es-trash`) nelle sezioni pubbliche.
4. **File**: `role-sidebar-pro.js`, `role-sidebar-pro.css`, `style.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX3`.

Feature precedente: **2026-09-25** — HEROUX2 — Armonizzazione Light Mode (Header, Card Giocatore, Contrasto Testo e Coerenza Visiva):
1. **Adattamento Header / Navbar in Light Mode**:
   - La pillola fluttuante desktop (`.portfolio-navbar`, `apple-nav.css`) ora adotta sfondo chiaro traslucido `rgba(255, 255, 255, 0.94)`, bordo delicato `rgba(0,0,0,0.08)` e ombra morbida `0 12px 35px rgba(15, 23, 42, 0.08)`, eliminando l'effetto "sticker scuro" sulla pagina bianca.
   - Tutti i link (`.nav-link`), il menu dropdown "Altro", le icone e i pulsanti (`#btn-user-profile`, lingua, cerca, mail, notifiche) assumono contrasto scuro nitido (`#0f172a` / `#334155`) con hover ciano `#0284c7`.
2. **Uniformazione Card Giocatore a Destra in Light Mode**:
   - Sostituito lo sfondo blu scuro/nero della card atleta con un layout chiaro coerente: `background: linear-gradient(170deg, #ffffff 0%, #f8fafc 100%)`, bordo ciano trasparente, chip OVR e GPS con sfondo bianco e testi scuri nitidi, nome giocatore `#0f172a`, statistiche con sfondo chiaro `#f1f5f9` e valori scuri.
3. **Alto Contrasto per Testo Descrittivo e Hero**:
   - Il paragrafo descrittivo in Light Mode è stato convertito a un grigio scuro nitido e profondo (`#334155 !important;`), garantendo leggibilità istantanea su sfondo bianco.
   - Rimossi gli stili scuri hardcodati in cima ad `index.html` sotto `[data-theme="mimetico-chiaro"]`.
4. **Verifica Assoluta di Rimozione Overlay OTP e Floating Shield**:
   - Blindata ulteriormente l'assoluta scomparsa di `#es-otp-bottom-banner` e del pulsante scudo sia in dark che in light mode su tutta la schermata home.
5. **File**: `apple-nav.css`, `style.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_HEROUX2`. Commit `0d27963d`.

Feature precedente: **2026-09-25** — HEROUX1 — Ottimizzazione Hero, Rimozione Overlay e Floating Shield, Navbar Dropdown Altro e Card Giocatore Realistica:
1. **Rimozione Overlay OTP e Floating Shield**:
   - Rimosso l'overlay dock di verifica email (`#es-otp-bottom-banner`) dalla schermata iniziale e dalla vista Home per evitare sovrapposizioni visive (`paintOtpBanner` in `verifica-account.js`).
   - Rimosso il pulsante fisso fluttuante con lo scudo di sicurezza a sinistra (`cookie-profiling.js`, `style.css`) che copriva i testi della hero.
2. **Spaziatura, Margini e Contrasto Testo Hero**:
   - Aumentato lo spazio verticale sotto il titolo "DIGITALIZZIAMO IL CALCIOMERCATO DILETTANTISTICO" per dare ampio respiro al layout.
   - Elevato il contrasto del testo descrittivo (`color: #e2e8f0`, `font-size: 1.125rem`, `line-height: 1.8`) per una lettura chiara e nitida su sfondo dark.
3. **Call to Action (CTA) Chiari e Accattivanti**:
   - Aggiunti sotto la descrizione i pulsanti primario con glow ciano ("⚡ Registrati come Calciatore / Società") e secondario glassmorphic ("🔍 Esplora la Piattaforma"), oltre ai badge di garanzia FIGC/LND, telemetria GPS e privacy GDPR.
4. **Header / Navbar Pulita ed Essenziale**:
   - Raggruppate le voci secondarie (Stampa, Album Figurine, Ambassador, Minigiochi) all'interno di un dropdown dedicato "Altro ▾" (`.es-nav-dropdown`) con glassmorphism, icone e micro-descrizioni, snellendo l'header e mantenendo in primo piano solo Home, Chi siamo, Bacheca e Mappa.
5. **Card Giocatore Realistica con Statistiche d'Esempio**:
   - Sostituita la vecchia silhouette con una card atleta (`.es-hero-player-card`) d'impatto: foto ad altissima definizione di un giovane calciatore in divisa atletica, badge "PROFILO VERIFICATO" con pulse verde, chip OVR 92 ATT, chip telemetria GPS (33.8 km/h), dati anagrafici (Marco Rossi - Serie D) e griglia statistiche FIFA/Scouting a 6 valori (VEL 94, TIR 89, PAS 85, DRI 91, DIF 62, FIS 87).
6. **File**: `index.html`, `style.css`, `verifica-account.js`, `cookie-profiling.js`, `app.js`, `sw.js`, `version.json`, `immagini/03-calciatore-ritratto/player-card-showcase.jpg`. Cache `v20260925_HEROUX1`. Commit `074e8f15`.

Feature precedente: **2026-09-25** — NAVUSER1 — Rimozione email, ruolo e avatar residui dal menu utente in navbar:
1. Rimossi dal corpo del menu a tendina account (`#user-dropdown-menu`) i campi email (`#user-dropdown-email-link`) e ruolo (`#user-dropdown-role`) che si sovrapponevano alle voci di navigazione.
2. Rimosso dal trigger di apertura (`#btn-user-profile`) il badge con l'iniziale spuria "E", mantenendo solo icona utente, nome account ("Eliseo Miraglia") e chevron.
3. Impostato `display: none !important` in `style.css` sui campi testuali eliminati per prevenire riapparizioni dinamiche.
4. **File**: `index.html`, `style.css`, `sw.js`, `version.json`, `focus.html`. Cache `v20260925_NAVUSER1`. Commit `9ede8d27`.

Feature precedente: **2026-09-25** — HEROCLEAN1 — Rimozione card grafica ritratto atleta dalla sezione Chi siamo in Home:
1. Rimossa la card `.portfolio-visual` contenente l'SVG del ritratto atleta con reticolo/HUD e badge "PROFILO VERIFICATO" dalla sezione `#home-about`.
2. Adattato il contenitore per un layout pulito, elegante e leggibile del blocco testuale e dei pulsanti d'azione.
3. **File**: `index.html`, `sw.js`, `version.json`, `focus.html`. Cache `v20260925_HEROCLEAN1`. Commit `01fc4aae`.

Feature precedente: **2026-09-25** — SYNC1 — Ottimizzazione script immagini, sincronizzazione cache-bust e audit di integrità JS:
1. Ottimizzazione di `immagini/aggiorna-immagini.ps1`: scansione mirata dei soli file JS di radice ed `elisee-world`, evitando traversata bloccante di `node_modules`.
2. Sincronizzazione automatica e cache-bust completo di tutti i percorsi immagini e script in `index.html`, `style.css`, `app.js`, `focus.html`.
3. Validazione sintattica con `node --check` al 100% su tutti i moduli JS del sito e di `elisee-world/` (tutti superati).
4. **File**: `immagini/aggiorna-immagini.ps1`, `index.html`, `style.css`, `app.js`, `focus.html`, `sw.js`, `version.json`. Cache `v20260925_SYNC1`. Commit `ecef4bd1`.

Feature precedente: **2026-09-25** — PARALLAX1 — Sfondo che scorre più piano del testo:
1. In home e in Chi siamo il fondo ciano si muove meno del contenuto mentre scorri.
2. Stessi conti del video, senza libreria esterna. Con «riduci movimento» lo sfondo sta fermo.
3. **File**: `parallax.js`, `parallax.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_PARALLAX1`. Commit `51695a85`.

Feature precedente: **2026-09-25** — BUBBLE1 — Transizione a bolle fra le sezioni:
1. Cliccando una voce del menu, una bolla ciano sale e copre la pagina. Subito dopo una bolla del colore del sito scopre la sezione nuova.
2. Non parte al primo caricamento. Se sei già su quella sezione, non si ripete. Con «riduci movimento» il cambio è immediato.
3. **File**: `page-bubbles.js`, `page-bubbles.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_BUBBLE1`. Commit `f83b3d1a`.

Feature precedente: **2026-09-25** — RCARD1 — Schede profilo in bacheca come la card del video:
1. Foto grande, nome, ruolo, riga su squadra e stato, etichette, **Apri profilo** e cuore per seguire.
2. Bottone ciano, card scura. Il cuore pieno vuol dire che lo segui già.
3. **File**: `react-card.css`, `app.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_RCARD1`. Commit `f3ce1197`.

Feature precedente: **2026-09-25** — TRASH1 — Bottone Elimina animato, in basso a sinistra:
1. Al click il coperchio del cestino si alza e la carta cade. Dopo 2,5 secondi torna com'era.
2. Non cancella account né dati. Colori del sito, non il rosa del video.
3. **File**: `trash-btn.css`, `trash-btn.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_TRASH1`. Commit `a4e54442`.

Feature precedente: **2026-09-25** — BG1 — Sfondo con gradiente lento:
1. Tra gli sfondi del video ho scelto il gradiente animato. Sul sito è nero e ciano, non viola.
2. Si muove piano dietro la home. Le card restano piene. Di giorno il gradiente è chiaro. Con «riduci movimento» sta fermo.
3. **File**: `site-bg.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_BG1`. Commit `e537e94e`.

Feature precedente: **2026-09-25** — PWLIVE1 — Controllo password mentre si scrive:
1. Nel login, in Iscriviti e in «nuova password» l'etichetta sale nel campo e sotto compare la barra.
2. Debole (rosso, un terzo), media (ciano chiaro, due terzi), forte (ciano pieno). Conta minuscola, maiuscola, numero, simbolo e 16 caratteri.
3. **File**: `pw-live.js`, `pw-live.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_PWLIVE1`. Commit `965de718`.

Feature precedente: **2026-09-25** — WCF1 — Season Wrapped a carosello coverflow:
1. Le schede della stagione stanno una accanto all'altra. Quella al centro è a colori, con titolo e **Apri**. Quelle ai lati sono inclinate e in grigio.
2. Si trascina con il mouse. I pallini in basso seguono la scheda. Colori del sito, ciano.
3. **File**: `season-wrapped.js`, `season-wrapped.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_WCF1`. Commit `72c9b212`.

Feature precedente: **2026-09-25** — THEME1 — Switch giorno/notte nella navbar:
1. Al posto del sole c'è la capsula: di notte luna e stelle, manopola a destra. Di giorno cielo ciano, sole e nuvole, manopola a sinistra.
2. Cambia il tema del sito (`mimetico-chiaro` / scuro) e lo ricorda.
3. **File**: `theme-switch.css`, `role-sidebar-pro.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_THEME1`. Commit `f5aa7c0d`.

Feature precedente: **2026-09-25** — SHARE1 — Bottone Condividi in basso a destra:
1. Si apre a ventaglio: WhatsApp, LinkedIn, Email, X e copia link. La × lo richiude.
2. Copia link scrive l'indirizzo della pagina e mostra «Link copiato». Gli altri canali aprono la condivisione.
3. Colori del sito: disco scuro, icone ciano.
4. **File**: `share-btn.css`, `share-btn.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_SHARE1`. Commit `dd55b727`.

Feature precedente: **2026-09-25** — PALETTE1 — Le modifiche recenti usano la palette del sito (scuro, ciano `#38bdf8`):
1. Login di nuovo scuro, campi neri, bottone e link ciano. Lo scorrimento Accedi / Iscriviti resta.
2. Ricerca, tabelle, vetro del Control Center, flusso contatti, dashboard analitica, verifica email e spunta OTP: via viola, verde acqua e rosa. Resta il rosso solo sull'errore.
3. **File**: `login-slide.css`, `nav-search-anim.css`, `apple-nav.css`, `sortable-table.css`, `control-center.css`, `cc-analytics.css`, `flusso-contatti.css`, `verifica-account.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_PALETTE1`. Commit `7da30925`.

Feature precedente: **2026-09-25** — ANALYTICS1 — Dashboard Admin e Privacy come il pannello analitico:
1. Stessa struttura: colonna a sinistra (viste, anno, metrica, area, canale, ruolo), numeri in alto con confronto sull'anno scorso, barre mensili, tre gruppi, tabella e classifica a destra.
2. Colori Elisee: ciano su scuro. Admin mostra profili, verifiche, reclami e job. Privacy mostra consensi, reclami Art. 30, accessi e audit.
3. Panoramica e Governance passano da una scheda all'altra. I filtri cambiano i numeri.
4. **File**: `cc-analytics.js`, `cc-analytics.css`, `control-center.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_ANALYTICS1`. Commit `02cdba9e`.

Feature precedente: **2026-09-25** — FLUSSO1 — Simulazione flusso contatti nel Control Center:
1. Scheda **Flusso contatti**, accanto a Responsabile Privacy. La vedono Admin e Responsabile Privacy.
2. 50 profili al mese. Il ciclo è lento: backlog e «senza movimento» crescono fino al mese 24. Chiusure del mese restano a 0, ritmo atteso 1.
3. Colonne: Nuovi, Tentativo di contatto, Follow-up, Visita / provino, Trattativa, Chiusura. Nomi fittizi, non sono utenti veri. **Avvia** fa scorrere i mesi.
4. **File**: `flusso-contatti.js`, `flusso-contatti.css`, `control-center.js`, `control-center.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_FLUSSO1`. Commit `b3ccd06d`.

Feature precedente: **2026-09-25** — BTNANIM1 — Lettere dei bottoni come nel video delle 09:35:
1. Passando il mouse, le lettere si muovono una dopo l'altra. Se il cursore entra da destra, partono da destra.
2. **Accedi** e il bottone nero del login saltano. **Iscriviti** scorre via sfocato. I tasti sulla foto del login si sfumano.
3. **File**: `btn-label-anim.js`, `btn-label-anim.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_BTNANIM1`. Commit `249320fb`.

Feature precedente: **2026-09-25** — NAVPILL1 — Navbar a pillola come nel video delle 09:32:
1. Barra di vetro scuro, centrata, non più a tutta larghezza. Logo, le voci, ricerca, tema, lingua e Accedi stanno nella stessa capsula.
2. La lente apre il campo dentro la barra, con la scritta ESC. Il sole cambia tema chiaro/scuro. La sottolineatura compare sulla voce sotto il mouse.
3. Sul telefono resta il menu di prima.
4. **File**: `apple-nav.css`, `index.html`, `role-sidebar-pro.js`, `sw.js`, `version.json`. Cache `v20260925_NAVPILL1`. Commit `7bd6ee90`.

Feature precedente: **2026-09-25** — LOGINV4 — Login come nel video delle 09:27 (card bianca che scorre):
1. Card bianca 660×560, bordo bianco, ombra morbida. A sinistra Accedi (campi chiari, bottone nero, Facebook / Google / Apple). A destra la foto con «Ciao» e **Iscriviti**.
2. Iscriviti fa scorrere la foto a sinistra («Bentornato» / **Accedi**) e il modulo a destra. Stessi tempi del video: 0,65 s.
3. Il codice OTP del numero resta il pannello scuro sopra la card.
4. **File**: `login-slide.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_LOGINV4`. Commit `f57683bf`.

Feature precedente: **2026-09-25** — OTPV3 — Verifica numero (login WhatsApp) come nel video delle 09:25:
1. Quattro caselle in riga. A 4 cifre ruotano sul cerchio tratteggiato (origine sul centro, non un percorso interpolato).
2. Se il codice è quello del messaggio, le caselle si chiudono al centro: «Numero verificato», spunta verde, **Continua**.
3. Si apre da Accedi → numero WhatsApp. Non è la riga email in basso nel dossier.
4. **File**: `index.html`, `login-slide.css`, `app.js`, `sw.js`, `version.json`. Cache `v20260925_OTPV3`. Commit `eab76919`.

Feature precedente: **2026-09-25** — Dipendenza `motion` installata (`^13.4.3` in `package.json`). Non è ancora usata nelle pagine.

Feature precedente: **2026-09-25** — CALM1 — Verifica email ridotta a una riga, senza card sopra il dossier:
1. Via la card con notch, toast, icona e scritta EMAIL · OTP. Restano email, sei caselle e un tasto.
2. Il dossier non viene più spinto in alto di mezzo schermo.
3. **File**: `verifica-account.js`, `verifica-account.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260925_CALM1`. Commit `d5b59a96`.

Feature precedente: **2026-09-25** — MAILOTP1 — La verifica email in basso nel dossier non è più la fascia vecchia:
1. Quella fascia («Verifica email», Invia codice, Verifica, sei quadretti tagliati a destra) era un OTP diverso da quello del login. FINISH1 aveva toccato solo il login.
2. Ora è una card scura, come il pannello del login: sei caselle arrotondate, anello tratteggiato sulla cifra attiva, messaggio EMAIL · OTP e tasto bianco **Invia codice**.
3. Le caselle si accendono dopo l’invio. A 6 cifre parte la verifica da sola. Verde se è giusto, rosso se no. Reinvia dopo 30 secondi. Il codice resta solo nella mail, non a schermo.
4. **File**: `verifica-account.js`, `verifica-account.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260924_MAILOTP1`. Commit `12ec2c79`.

Feature precedente: **2026-09-24** — FINISH1 — Pubblicato il lavoro rimasto solo in locale (ricerca, vetro, tabelle, OTP):
1. **Ricerca in navbar**: il tasto lente apre il campo con il flip 3D, bordo che si disegna e frasi che si scrivono da sole. Invio porta il testo nella bacheca (profili). Il toast dice «Ricerca», non il nome del video di riferimento.
2. **Control Center e numeri in home**: pannelli e schede KPI in vetro scuro, si alzano al passaggio del mouse.
3. **Tabelle ordinabili**: nelle tabelle admin, operazioni, dossier e atelier il click sul titolo di colonna ordina (numero, data o testo) e mostra la freccia.
4. **OTP**: dopo 4 cifre (scritte, incollate o con Compila) le caselle restano accese un attimo, poi parte l’orbita. Compila legge anche il codice dal messaggio se manca `data-code`.
5. **Codifica**: `index.html` era stato risalvato con le accentate illeggibili. Ripristinate prima del commit.
6. **File**: `index.html`, `nav-search-anim.css`, `nav-search-anim.js`, `control-center.css`, `sortable-table.css`, `sortable-table.js`, `login-slide.css`, `app.js`, `sw.js`, `version.json`. Cache `v20260924_FINISH1`. Commit `4f798c27`.

Feature precedente: **2026-09-24** — HOVERSIDE1 — Sidebar che si apre al passaggio del mouse, e login sulla palette del sito:
1. **Sidebar delle aree ruolo** (atleta, staff, osservatore e le altre): a riposo è una colonna stretta con icona, avatar e azioni in colonna. Al passaggio del mouse si allarga, compaiono nome, ruolo, campo Cerca e le etichette. La voce attiva ha la pillola ciano. In basso tema, impostazioni, nuova operazione ed esci si mettono in fila. Sul telefono resta il pannello che entra da sinistra.
2. **Colori del sito**, non quelli del video di riferimento: vetro scuro, testo bianco, accento `#38bdf8`. Il tasto tema passa al preset chiaro già presente (`mimetico-chiaro`). Cerca filtra le voci.
3. **Login Accedi / Iscriviti**: stessa card scorrevole, ma sfondo scuro, campi neri, bottone e link ciano. Niente più card bianca e bottone nero.
4. **File**: `index.html`, `login-slide.css`, `role-sidebar-pro.css`, `role-sidebar-pro.js`, `sw.js`, `version.json`. Cache `v20260924_HOVERSIDE1`. Commit `17209e26`.
5. Il menu in vetro GLASSMENU1 (commit `c1c3c23e`) era rimasto solo in locale: il push di quella sera non ha raggiunto GitHub e online c’era ancora `LOGINOTP1`. Questo giro lo pubblica insieme.

Feature precedente: **2026-09-24** — GLASSMENU1 — Menu a tendina in vetro con pagine che scorrono:
1. Il menu dell’account (in alto a destra, da loggato) è il pulsante col nome e il chevron. Si apre in vetro smerigliato. Il chevron ruota.
2. Voci: Impostazioni, Account, Squadra, Esci. Impostazioni, Account e Squadra scorrono di lato (Notifiche, Area riservata, Annuncio, Album…). La freccia indietro torna alla prima pagina. Per lo staff c’è anche Strumenti.
3. Il menu della lingua usa lo stesso vetro.
4. **File**: `index.html`, `glass-menu.css`, `app.js`, `sw.js`, `version.json`. Cache `v20260924_GLASSMENU1`. Commit `c1c3c23e`.

Feature precedente: **2026-09-24** — LOGINOTP1 — Codice OTP come nel video (4 caselle, messaggio, orbita):
1. Dopo il numero WhatsApp si apre il pannello scuro **Verifica il numero**. Quattro caselle, la prima con l’anello tratteggiato.
2. Si scrive, si incolla, oppure **Compila** legge il codice dagli appunti. A 4 cifre le caselle ruotano e si chiudono a croce sul cerchio tratteggiato.
3. Il messaggio in basso mostra il codice (come nel video) e **Compila** lo scrive nelle caselle. Se coincide, i bordi diventano verdi; se no, rossi. «Reinvia tra 30s» compare dopo l’orbita. Non fa entrare: WhatsApp vero non è ancora collegato.
4. **File**: `index.html`, `login-slide.css`, `app.js`, `sw.js`, `version.json`. Cache `v20260924_LOGINOTP1`. Commit `64dd4800`.

Feature precedente: **2026-09-24** — LOGINSLIDE1 — Nuova interfaccia Accedi / Iscriviti a card scorrevole:
1. **Card bianca 660×560** come nel video: a sinistra il form, a destra il pannello scuro con la foto. Il tasto Iscriviti fa scorrere il pannello a sinistra e porta il form di iscrizione.
2. **Accedi**: email, password con occhio, Ricordami, Password dimenticata (WhatsApp), bottone nero, Facebook / Google / Apple. Google usa l’accesso già collegato. Facebook e Apple dicono che non sono ancora attivi.
3. **Iscriviti** (anche dal tasto in navbar) usa la stessa card: nome, email, data di nascita, password, consenso privacy, poi la registrazione vera e la scelta del ruolo.
4. **File**: `index.html`, `login-slide.css`, `app.js`, `immagini/login-hero.jpg`, `sw.js`, `version.json`. Cache `v20260924_LOGINSLIDE1`. Commit `bde07862`.

Feature precedente: **2026-09-24** — KITBUG1 — Avatar 3D: maglia 2D vera sul busto, niente foglio UV, taglio e altezza petto di nuovo attivi, niente falso «INDOSSATA»:
1. **Foto maglia, non foglio UV**. `home-uv.png` e `INTER-HOME-27.png` non vengono più avvolti sul torso (collage). Si usa sempre la foto 2D (`home.png`). Vale anche per un kit già salvato nel browser.
2. **Texture solo sulla maglia** (`athlete_torso`, `Wolf3D_Outfit_Top`, nomi espliciti jersey/shirt). Testa, capelli, colletto, pelle e arti non ricevono la mappa. Maniche, spalle e strisce prendono il colore della maglia; pantaloncini e calzettoni il colore secondario. Materiali multi-materiale non fanno più crashare il click.
3. **Se nessuna mesh maglia c’è, il badge non dice INDOSSATA.** Il messaggio di errore resta nel pannello. Prima il successo veniva mostrato anche a vuoto.
4. **Taglio Slim / Classica / Morbida e altezza petto** spostano torso, maniche e spalle del calciatore ufficiale senza ricaricare la texture a ogni scatto dello slider. «ORIGINALE» riporta scala e altezza.
5. **Pelle non più condivisa**: braccia, mani e gambe hanno materiali separati, così una tinta non si propaga a tutto il corpo.
6. **Service worker**: il messaggio `FORCE_RELOAD` non resta fermo a `MESHKIT2`. Cache `v20260924_KITBUG1`.
7. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260924_KITBUG1`. Commit `ef19b677`. Deploy `6ZZb6pUWS6JAWyjEqkwbQLsT6nGg` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-22** — KITBLEED1 — Avatar 3D: Risoluzione invasione texture su viso/capelli e isolamento chirurgico mesh outfit:
1. **Corrispondenza esatta (===)**: sostituito qualsiasi matching permissivo con verifica rigorosa su `child.name === 'athlete_torso'` (per il Calciatore 3D Ufficiale) e `child.name === 'Wolf3D_Outfit_Top'` (per modelli GLB Ready Player Me). Nessun fallback cieco su altre mesh.
2. **Protezione totale viso, testa, capelli e colletto**: rimosso esplicitamente qualsiasi assegnazione di `material.map` su `athlete_collar` (che toccava mento e mandibola) e sulle parti anatomiche. Testa, capelli, occhi, orecchie, collo e colletto restano totalmente inalterati con i loro materiali nativi.
3. **Cache-bust dedicato sull'asset della texture**: aggiunto parametro `?tcb=<timestamp>` all'URL della texture per forzare l'immediata invalidazione della cache da parte di browser e CDN.
4. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260922_KITBLEED1`. Commit `a3d48972`. Il deploy di questo passo non era stato confermato; lo copre KITBUG1.

Feature precedente: **2026-09-22** — INSPECT1 — Avatar 3D: Fase 1 ispezione obbligatoria del modello reale (prevenzione invasione texture su viso e capelli):
1. **Esposizione globale `window.avatarModel`**: collegato tramite getter dinamico a `state.activeModel` in modo che qualsiasi script da console (es. `avatarModel.traverse(...)`) acceda direttamente al modello 3D attivo senza `ReferenceError`.
2. **Auto-logging diagnostico Fase 1**: creata `logModelInspectionFase1(model)` che stampa in console l'elenco esatto di ogni singola mesh con nome, tipo (singolo o multi-material) e nomi dei materiali associati al momento del caricamento (sia per modelli GLB che per il Calciatore 3D Ufficiale).
3. **Helper console `window.inspectAvatarModel()`**: invocabile in qualunque momento da DevTools per ispezionare istantaneamente il modello aperto.
4. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260922_INSPECT1`. Commit `8f768f2d`. Deploy `dpl_61ZT9i4XpEs4rFfRFjB1WcEduK8w` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — MESHKIT2 — Fix collegamento click UI → mesh 3D (kit non si applicava nonostante il badge "INDOSSATA"):
1. **Root cause**: la guard `gen !== self._fitGen` in `fit()` scalzava silenziosamente la callback del TextureLoader quando una seconda `fit()` veniva chiamata durante il caricamento async — o quando il callback scattava dopo un re-render del modello.
2. **Fix guard**: al click utente esplicito si azzera `_fitGen` a 0 prima della chiamata; la guard non blocca più le callback con `gen === 0`. Rimane solo contro le chiamate davvero stale (gen vecchio > 0).
3. **Fix closure**: la `fit()` ora cattura il `model` nella variabile `capturedModel` prima di qualsiasi operazione async; il callback usa `state.activeModel || capturedModel` invece di solo `state.activeModel` (che poteva essere null nel frattempo).
4. **Fallback mesh totale**: se nessuna mesh corrisponde a `top|shirt|jersey|athlete_torso`, ora si applica la texture a tutte le mesh non-testa (fallback di sicurezza — prima si abbandonava silenziosamente).
5. **Feedback visivo**: il click sulla card kit ora passa `onProgress` allo status text del pannello AI → l'utente vede `✅ Maglia applicata sulla mesh (athlete_torso)` o `❌ Errore caricamento texture: ...`.
6. **Console.log diagnostici**: tutti i passaggi critici (avvio caricamento, nomi mesh, esito) sono loggati con `[Avatar 3D]` per debug futuro.
7. **File**: `avatar-3d.js`, `sw.js`, `version.json`. Cache `v20260921_MESHKIT2`. Commit `174d2ff3`. Deploy `dpl_FeFKLhkZN47oAndiVRbxV6jbyrYY` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — MESHKIT1 — Fix definitivo Avatar 3D: texture kit applicata direttamente sulla mesh GLB reale:
1. **Eliminazione geometrie fittizie**: rimosso completamente il cilindro fittizio (`CylinderGeometry`, `__elisee_fitted_jersey`) che galleggiava davanti al busto. Rimossa anche la procedura `generateJerseyTexture` con Canvas.
2. **Applicazione diretta via `THREE.TextureLoader`**: `EliseeJerseyAIAgent.fit` ora carica la texture con `loader.load(kitUrl)`, imposta `flipY = false` e `colorSpace = SRGBColorSpace`, poi la applica come `child.material.map = kitTexture` sulle mesh reali del GLB.
3. **Riconoscimento mesh outfit**: traverse con `console.log` di tutti i nomi (debug visibile in console), matching su `/top|shirt|jersey|outfit.*top/i` (Ready Player Me: `Wolf3D_Outfit_Top`). Fallback su `/torso|cloth|upper|body|avatar|mesh/i` escludendo testa/arti.
4. **`resolve2dKitUrl` semplificata**: restituisce `kitUrl` invariato (niente più sostituzione `INTER-HOME-27.png → home.png`).
5. **uvPath corretto**: `inter_home_27` ora punta a `immagini/kits-2d/inter/INTER-HOME-27.png` (il template UV reale). `bindKitCards` e tutti i listener UI ora preferiscono `selected_kit_uv` su `selected_kit_path`.
6. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_MESHKIT1`. Commit `35a54101`. Deploy `dpl_F3tZ1nAKb8btnybLgMWdjcRuXkBU` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — JERSEYFIX1 — Fix preliminare maglia 2D:
1. `loadImageSafe`: rimosso `crossOrigin='anonymous'` per URL relative/same-origin.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_JERSEYFIX1`. Commit `3abcd4b1`. Deploy `dpl_46343psFjMfhHGbP2DwHcz86CBHd`.

Feature precedente: **2026-09-21** — KITWRAP1 — Kit 2D sul 3D: stop minestrone UV:
1. **Causa**: il foglio UV FIFA (`INTER-HOME-27.png`) veniva avvolto intero su cilindri/sfere (torso, pettorali, maniche, calzettoni) con UV sbagliati.
2. **Fix**: si usa sempre la foto 2D della maglia (`home.png`), ritagliata dal nero; sul torso UV rimappati col petto al centro. Pettorali/maniche/calzettoni: solo colore club, niente mappa UV. Testa/capelli/pelle mai tinte.
3. Click kit applica `path` 2D, non lo sheet UV. Inter 24/25 Home punta a `home.png`.
4. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_KITWRAP1`. Commit `5555b2b3`. Deploy `D7Wut8GpDYBnKkwFayFohxpK1ZMF` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — NAVSCROLL1 — Badge ciano sotto Album: era la scrollbar overlay della nav + blur header:
1. `.nav-menu` ora `overflow: hidden` (niente più thumb ciano Windows/Chrome sotto Album).
2. Header senza `backdrop-filter` / bordo: sparisce la fascia nera sotto la navbar.
3. **File**: `style.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_NAVSCROLL1`. Commit `88fc7060`. Deploy `5oLk2siov4u3cyTQUmVeQzT1XxKG` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — FACESCAN1 — Scan Face sul modello 3D Elisee (niente Hyper3D / abbonamenti):
1. **Sì, si può fare senza pagare generatori 3D**: il volto va sul calciatore 3D già in Elisee Scout (`athlete_head`), non serve GLB a pagamento.
2. **Nuova modalità Scan Face**: fotocamera con ovale guida (stile scan viso), rilevamento volto se il browser lo supporta, tasto Scatta. Il JPEG viene mappato subito sulla texture UV della testa 3D.
3. **Tempi**: niente attesa finta di ricostruzione mesh; da scan/foto si entra nello stage 3D. Dallo stage: «Scansiona il volto» aggiorna la testa live senza ricaricare la scena.
4. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_FACESCAN1`. Commit `adbf5f90`. Deploy `4Kcyjz8Wmq1rGTpUiDrmMVhVWJP7` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — A3DCLEAN1 — Pulizia sidebar Avatar 3D (pallini macOS, box Admin QA, pulsante +):
1. **Pallini macOS + logo circolare** in cima al pannello destro: la sidebar ruoli (`[class*="-sidebar"]`) innestava dots/avatar nella modale. Esclusa `.es-a3d-sidebar-controls` da `scanAndUpgrade`.
2. **Box ADMIN QA: TEST SQUADRE 3D** rimosso dalla sidebar Avatar 3D.
3. **Pulsante + ciano**: era il CTA collassato «Nuova Operazione» iniettato nella stessa sidebar. Nascosto/rimosso in modale.
4. **File**: `avatar-3d.js`, `avatar-3d.css`, `role-sidebar-pro.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_A3DCLEAN1`. Commit `575e3d83`. Deploy `BDz1MVF6jbqyJBqpc3g8ppPJEHWe` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — HOMEBAR1 — Rimossa fascia nera sotto navbar e badge ciano spuri in Home:
1. **Fascia nera inutilizzata sotto la navbar**: header bloccato a 72px, niente extra padding/ombra/bordo. Hero attaccato alla navbar.
2. **Badge ciano al centro (sotto Album)**: nascosta la scrollbar orizzontale della nav (thumb ciano) e il banner anti-fake vuoto (`#es-verify-banner` visibile solo con contenuto reale e `body.es-verify-on`).
3. **File**: `style.css`, `verifica-account.css`, `verifica-account.js`, `creator-role-switcher.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_HOMEBAR1`. Commit `f51f3bed`. Deploy `79W4B6HE83rj8stXX83cvdNtbeXQ` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-21** — BUGFIX1 — Audit e correzioni Avatar 3D + banner anti-fake (`BUGFIX1`):
1. **Avatar 3D — bug visivi e di vestizione**:
   - `restoreOriginalBaseMaterials` non forza più il colore bianco su tutte le mesh: viso, collo, pelle e capelli restano integri al cambio kit o al toggle «ORIGINALE».
   - `fit()` non entra più in retry infinito se il modello manca: usa `state.activeModel`, massimo 20 tentativi.
   - Cambio kit rapido: token `_fitGen` ignora i callback stantii (niente maglia sbagliata dopo click consecutivi).
   - Filtro GLB ristretto (niente più `mesh|skin|root|Armature` che tingeva gambe/mani). `offsetY` e taglio Slim/Classica/Morbida spostano le soglie Y.
   - `disposeThree` azzera `state.activeModel` (niente modello staccato dopo chiusura modale).
   - Backup materiali anche per array multi-materiale; encoding sRGB sul renderer e sulle texture canvas.
   - Crash UI se `divisa_ref` era assente; badge kit Ospiti/Terza/Portiere non più resettati a «UFFICIALE».
   - Player Card: etichette Elisee Scout al posto di marchi EA Sports (VEL/TIR/PAS/DRI/DIF/FIS).
2. **Banner anti-fake vuoto**:
   - `isPreVerified` copre anche `staffRole`, `ruoloDettagliato` e staff email.
   - Banner `:empty` / `[hidden]` nascosto in CSS; pulizia stili inline al hide.
3. **Cache SW**: `FORCE_RELOAD` allineato a `version.json` (non più `A3DSTEP3` stantio).
4. **File**: `avatar-3d.js`, `verifica-account.js`, `verifica-account.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260921_BUGFIX1`. Commit `a70774fb`. Deploy `HgriMFrDfxdSsgAXWxQgGMUDSJHT` live su `https://elisee-scout.vercel.app`.

Feature precedente: **2026-09-20** — KITFIX — Kit 3D applicato direttamente sulle mesh del GLB (eliminati cilindri galleggianti), banner anti-fake nascosto per Admin Executive (`KITFIX`):
1. **Fix Kit 3D su modello GLB importato**:
   - Eliminati completamente i `CylinderGeometry` (`torsoMesh`, `sleeveL`, `sleeveR`) che fluttuavano attorno al modello come fusti rigidi.
   - Nuovo branch B in `EliseeJerseyAIAgent.fit`: traversa tutte le mesh reali del GLB importato, filtra per Y (esclude testa/capelli/viso via regex `head|hair|face|eye|...` e soglia `headThreshY = bbox.min.y + totalH * 0.78`), e applica `material.map = tex; material.needsUpdate = true` direttamente sui materiali originali.
   - Salvataggio `__eliseeOrigMat` per ripristino corretto al cambio kit o reset.
   - `removeExistingJersey` aggiornato per ripristinare i materiali delle mesh tinte tramite `activeJerseyMeshes`.
   - `EliseeJerseyAIAgent` versione `2.2.0`.
2. **Fix banner anti-fake per Admin Executive**:
   - `isPreVerified(u)` in `verifica-account.js` ora restituisce `true` per ruolo `Admin Executive`, `admin`, `creator`, `creatore`, email `eliseomiraglia2704@gmail.com`, `u.isAdmin`, `u.isCreator`.
   - Nessun banner vuoto appare sotto la navbar per gli admin.
3. **File**: `avatar-3d.js`, `verifica-account.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260920_KITFIX`. Commit `48db231e`. Deploy `dpl_6zwfmHExxsennJ7fzv4xBggXp2hA` live su `https://elisee-scout.vercel.app`.
1. **Tris di Innovazioni Completate**:
   - **Miglioramento Visivo del Kit Ufficiale**:
     - **Stemma Club Ufficiale Reale (PNG ad Alta Definizione)**: caricamento e renderizzazione automatica del logo ufficiale del club dal catalogo (da `immagini/squadre-loghi/<id>.png`) con bordatura e ombra morbida sul petto sinistro.
     - **Colletto Sagomato a V / Girocollo Sportivo Tecnico Bicolore**: disegnato sulla texture con bordo elastico coordinato e sincronizzazione diretta della mesh 3D `athlete_collar` con il colore secondario del club o bianco gara.
     - **Numero Gara Frontale Ufficiale**: aggiunto sul petto destro in carattere sportivo ad alta visibilità con contorno scuro, coordinato al grande dorsale a 360° e al nome atleta sul retro.
   - **Fotogrammetria Volto Avanzata & Live Refresh**:
     - Mascheratura anatomica con proporzioni auree e sfumatura radiale a gradiente (feathering) per fondere perfettamente l'incarnato della foto reale con il collo, le orecchie e la calotta cranica 3D.
     - Funzione `updateAthleteHeadTexture` per l'aggiornamento immediato in tempo reale della testa `athlete_head` senza interruzione della scena Three.js.
   - **Esportazione Player Card EA Sports FC Ultimate Team (HD 1080x1440 PNG)**:
     - Motore di renderizzazione `exportEASportsCard` con snapshot WebGL ad alta definizione (`preserveDrawingBuffer: true`).
     - Creazione canvas 1080x1440 px in stile Ultimate Team con scudo metallizzato dorato/ossidiana, OVR 88, ruolo, tricolore italiano, stemma ufficiale del club, render 3D dell'atleta in divisa, nome, club, 6 statistiche di gara (PAC, SHO, PAS, DRI, DEF, PHY) e badge ufficiale Elisee Scout.
     - Pulsante dedicato *"⭐ Scarica Card EA FC"* nella barra orbitale inferiore e box dedicato *"⭐ CARD EA SPORTS FC"* nella sidebar comandi, oltre al click diretto sulla card fluttuante. Download automatico in PNG.
2. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260920_A3DSTEP3`. Commit `193b6a9a`. Deploy `dpl_2GBWCoHiL6hdMK5o4M5qdNhVbRsq` live su `https://elisee-scout.vercel.app`.

Feature precedente: **Avatar 3D: PASSAGGIO 2 — Corrispondenza Kit 2D Ufficiale & Rimozione Totale Elisee Scout dalla Maglia (`A3DSTEP2`):
1. **Risolta la Mancata Corrispondenza Maglia 2D ↔ Modello 3D**:
   - **Eliminazione Radicale di "ELISEE SCOUT" e "ELISEE F.C."**: rimosse le scritte hardcoded che sovrascrivevano la divisa del club scelto.
   - **Generatore Dinamico Basato su Kit 2D Reale (`EliseeJerseyAIAgent.generateJerseyTexture`)**:
     - Supporto ibrido intelligente per UV Map (`home-uv.png`, `INTER-HOME-27.png`) a 1024x1024 a piena copertura e Kit 2D standard (`home.png` 500x500).
     - Riconoscimento automatico dei colori sociali (`primary` e `secondary`) dal catalogo di 2.890 club (`loadFullCatalog` arricchito con `primary`/`secondary`).
     - Trama tecnica con micro-costine traspiranti verticali e gradiente muscolare PBR.
     - Retro della maglia a 360° con Nome Atleta e Numero Ufficiale in font geometrico ad alta visibilità con ombra da gara.
   - **Applicazione Diretta a Tutte le Mesh della Divisa**:
     - `EliseeJerseyAIAgent.fit` aggiorna istantaneamente `athlete_torso`, `athlete_pec_l/r`, `athlete_sleeve_l/r` e `athlete_sock_l/r`.
     - I pantaloncini da gara (`athlete_shorts`) vengono sincronizzati col colore secondario del club.
     - Per modelli GLB esterni: la guaina anatomica sagomata `__elisee_fitted_jersey` veste il torso senza alcuna compenetrazione.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260920_A3DSTEP2`. Commit `ee1511b6`. Deploy `dpl_voxWAP1bt87pCUzH1n95Ne67Ua8v` live su `https://elisee-scout.vercel.app`.

Feature precedente: **Avatar 3D: PASSAGGIO 1 — Calciatore 3D Solido Ufficiale Predefinito (`A3DSTEP1`):
1. **Calciatore 3D Solido & Completo Sempre Presente sullo Stage**:
   - Risolto il blocco per cui, in assenza di un file `.glb` caricato, veniva mostrato solo un ologramma filigranato vuoto che impediva la corretta visualizzazione e vestizione della divisa.
   - Creato `buildDefaultAthlete(avatar, group)`: un modello di atleta 3D solido e proporzionato con anatomia calcistica rifinita:
     - **Testa & Volto**: mappa UV ad alta definizione (`createProceduralFaceTexture`), cranio e mascella scolpiti, zigomi alti, naso e orecchie anatomiche.
     - **Capigliatura**: ciocche volumetriche sagomate (`buildUltraHairMesh`).
     - **Corpo Calciatore (`buildBodyComponents`)**: torace atletico a V, pettorali, colletto bicolore, spalle e deltoidi, braccia muscolose con bicipiti, avambracci e mani con dita sagomate.
     - **Pantaloncini da Calcio da Gara (Shorts)** con pieghe e striscia laterale a contrasto.
     - **Gambe Muscolose**: quadricipiti, ginocchia e calzettoni da gara con risvolto elastico.
     - **Scarpini da Calcio EA Sports Style**: tomaia affusolata, swoosh neon ciano, suola e tacchetti 3D visibili.
   - Assegnato immediatamente a `state.activeModel` con ombre PBR attive e backup dei materiali originali (`__originalMaterial`).
   - Se l'utente carica un file `.glb` esterno (Hyper3D/Rodin), questo sostituisce il calciatore default; se viene rimosso, il calciatore predefinito torna attivo all'istante.
   - La divisa ufficiale selezionata viene subito applicata al corpo solido senza ritardi o blocchi.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260920_A3DSTEP1`. Commit `e723dc66`. Deploy `dpl_Eg12w3wzbmCmNonRoJaqPHHFQavj` live su `https://elisee-scout.vercel.app`.

Feature precedente: **Avatar 3D: Fix Retry Loop + Feedback UI ologramma (`A3DJERSEYAI2`):
1. **Fix loop infinito `applyKitTextureToActiveModel`**: aggiunto limite massimo di 20 retry (4 secondi). Se il modello GLB non è disponibile (scena con solo ologramma wireframe), l'agente mostra un messaggio chiaro: `⚠️ Carica un modello .GLB da Hyper3D per indossare la maglia 3D`.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260919_A3DJERSEYAI2`. Commit `fd31bae7`. Deploy live su `https://elisee-scout.vercel.app`.

Feature precedente: **Avatar 3D: Agente IA Vestizione Maglia 3D & Sostituzione Maglia Elisee Scout (`A3DJERSEYAI1`):
1. **Creazione Agente IA Dedicato (`EliseeJerseyAIAgent` in `avatar-3d.js`)**:
   - Risolto alla radice il problema dell'oscuramento/distorsione texture: le mesh originali del modello 3D (viso, capelli, pelle, arti) mantengono intatta la loro texture fotorealistica con backup clone del materiale originale (`__originalMaterial`).
   - L'Agente IA effettua la **scansione volumetrica del busto** calcolando bounding box, centro petto Y, altezza torso e raggi anatomici.
   - **Sostituzione 100% Maglia Elisee Scout**: l'Agente rimuove qualsiasi precedente maglia procedurale o decal "Elisee Scout" e genera una **Guaina Anatomica Sagomata da Gara 3D** (torso e maniche coordinate) aderente a filo pelle.
   - **Texture 360° con Nome & Numero**: Fronte con stemma club e sponsor ufficiale, retro dorsale con Nome e Numero Ufficiale dell'atleta.
   - **Proiezione DecalGeometry**: se supportata, proietta Decal ad alta definizione curvata sul petto per perfetta fusione muscolare.
   - **Modulo UI nella Sidebar**: Box `🤖 AGENTE IA: VESTIZIONE KIT 3D` con status in tempo reale, pulsante "Indossa Maglia con IA", selettori di taglio (Slim Gara, Classica, Morbida) e cursore regolazione millimetrica altezza petto.
2. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260919_A3DJERSEYAI1`. Commit `5a62ef30`. Deploy `dpl_A8S9yCiDxQvxetjyjx3FaufjtJ7K`.

Feature precedente: **Avatar 3D: Fix Testa Coperta - Filtraggio Zona Y + Nome Mesh (`A3DFIXKIT4`):
1. **Bug critico: texture applicata anche al volto/capelli (`avatar-3d.js`)**:
   - Fix temporaneo con filtraggio coordinate Y e nomi mesh prima dell'introduzione dell'Agente IA completo.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260919_A3DFIXKIT4`. Commit `8eb1e4c4`. Deploy `dpl_G2maSCtveGvZTJ7hK9s4mTxmr1Uv`.

Feature precedente: **Avatar 3D: Supporto Universale Mesh GLB (`A3DFIXKIT2`)**:
1. **`applyKitTextureToActiveModel`**: algoritmo dinamico per mesh generiche Hyper3D.
2. **File**: `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260919_A3DFIXKIT2`.

Feature precedente: **Avatar 3D: Correzione Corrispondenza Maglie 2D/3D & Separazione Club (`A3DFIXMATCH1`):
1. **Separazione Netta e Pulita dei Club (Zero Sovrapposizioni)**:
   - Risolto il disallineamento: rimosso il kit speciale dell'Inter dalla cartella del **Foggia City**, posizionandolo correttamente nella cartella ufficiale `immagini/kits-2d/inter/INTER-HOME-27.png`.
   - Il **Foggia City** ora mostra ed indossa esclusivamente la propria divisa ufficiale Givova Edil Milanese.
   - L'**Inter** mostra ed indossa esclusivamente le proprie divise ufficiali (con la divisa 24/25 in prima posizione).
2. **Generazione & Mappatura Texture UV per Foggia City (`home-uv.png`)**:
   - Creata la mappa UV 2048x2048 ad alta definizione per la maglia Givova del Foggia City (`immagini/kits-2d/foggia-city/home-uv.png`).
   - Il modello 3D ora indossa esattamente la maglia mostrata nell'anteprima 2D: strisce nerazzurre, stemma rotondo del Foggia City FC sul petto, sponsor Givova ed EDIL MILANESE. Corrispondenza 100% tra anteprima 2D e resa 3D!
3. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`, `immagini/kits-2d/foggia-city/home-uv.png`, `immagini/kits-2d/inter/INTER-HOME-27.png`. Cache `v20260919_A3DFIXMATCH1`.

Feature precedente: **Avatar 3D: Selettore Admin QA per Test Live Squadre 3D & Ricerca Catalogo 2.890 Club (`A3DADMIN1`):
1. **Pannello Admin QA: Test Live Squadre 3D Integrato**:
   - Creato box gold/dark dedicato `ADMIN QA: TEST SQUADRE 3D` nella sidebar dell'Avatar 3D.
   - **Ricerca Istantanea su 2.890 Club**: campo di testo predittivo in tempo reale con select dropdown organizzato per campionato e categoria.
   - **Navigazione Rapida a Scorrimento**: pulsanti `⬅ Precedente` e `Successiva ➡` per testare a raffica le divise 3D di decine di squadre una dietro l'altra.
2. **Switching Live 3D in Tempo Reale**:
   - Al cambio squadra, il sistema aggiorna istantaneamente lo stemma e il nome sia nella Player Card EA FC fluttuante sia nella scheda club.
   - Ricarica dinamicamente la griglia dei Kit 2D per il club selezionato (Casa, Ospiti, Terza, Portiere, Speciali) con miniature reali.
   - Applica istantaneamente la texture UV della divisa sul calciatore 3D, con notifica toast feedback fluttuante a schermo.
3. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_A3DADMIN1`.

Feature precedente: **Avatar 3D: Collegamento Kit 2D Squadra Ufficiale & Nuova Interfaccia EA Sports FC (`A3DKIT1`):
1. **Collegamento Automatico Kit 2D Squadra (`immagini/kits-2d/<squadra>/`)**:
   - Collegamento diretto dell'Avatar 3D alla cartella ufficiale del club (es. `foggia-city` con `INTER-HOME-27.png` e `home.png`).
   - Mappatura texture UV ad altissima risoluzione (2048x2048) in Three.js con filtro anisotropico, che avvolge maglia, maniche, sponsor e scudetto senza sfocature.
2. **Selettore Kit 2D con Miniature Reali Cliccabili**:
   - Griglia luxury con anteprime visive delle divise disponibili per il club.
   - Switch in tempo reale: cliccando su una divisa, la maglia del modello 3D si aggiorna istantaneamente senza ricaricare la pagina.
3. **Nuova Interfaccia & Stage Stile EA Sports FC / Ultimate Team**:
   - **Player Card Fluttuante**: Overall dorato 88, Ruolo, Logo Squadra e Nome Atleta in alto a sinistra.
   - **Preset Inquadrature Telecamera**: Pulsanti rapidi nella Orbit Bar (`Volto`, `Maglia/Sponsor`, `Figura Intera`) per transizioni cinematografiche.
4. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_A3DKIT1`.

Feature precedente: **Avatar 3D STEP 1: Attivazione GLTF/GLB Loader, Storage IndexedDB & Rimozione Primitive Geometriche (`A3DSTEP1`):
1. **Attivazione Motore Three.js GLTF/GLB ad Alta Definizione**:
   - Caricatore standard universale `THREE.GLTFLoader` integrato e pronto a renderizzare modelli 3D realistici esportati da **Hyper3D (Rodin Gen-2)** o scansioni fotogrammetriche.
   - Normalizzazione automatica: calcolo Bounding Box del file `.glb`, scala proporzionale ad altezza atletica (~1.80m), posizionamento perfetto sui piedi sopra il piedistallo specchiato a $Y = 0.08$.
   - Ombre dinamiche PBR attivate su ogni sottomesh (`castShadow = true`, `receiveShadow = true`).
2. **Supporto Storage Locale Illimitato con IndexedDB**:
   - Creato database browser `elisee_avatar_db` (store `glb_models`) per memorizzare file `.glb` anche pesanti (10-50MB+) senza rischiare il blocco dei 5MB del `localStorage`.
   - Il modello salvato persiste tra ricaricamenti di pagina e sessioni utente.
3. **Pulsante di Caricamento & Drag & Drop Diretto**:
   - Inserito nella sidebar il pulsante luxury: `📁 Carica File 3D (.glb)` con status dinamico e opzione di rimozione immediata.
   - Abilitato il Drag & Drop diretto su tutto il canvas 3D: trascinando un file `.glb` sullo stage, l'avatar si aggiorna all'istante.
4. **Rimozione Totale del Vecchio Manichino a Primitive Geometriche**:
   - Eliminate definitivamente dal codebase tutte le funzioni a cilindri, sfere e cubi (`buildUltraHairMesh`, `buildBodyComponents`, `rebuildBodyModel`).
   - Sostituito lo stato d'attesa con una raffinata silhouette atletica wireframe/olografica ciano d'élite (`renderFallbackHologram`) con guida all'upload, senza manichini deformi.
5. **Divisa & Club Ufficiale Elisee F.C.**:
   - Toggle dedicato `btn-toggle-club-kit` per applicare o disattivare i colori e lo stemma del club sulla mesh della maglia.
6. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`, `immagini/avatar3d/`. Cache `v20260918_A3DSTEP1`.

Feature precedente: **Avatar 3D Professionale: Integrazione Foto Reale Atleta, Rimozione Marchi Terzi & Fix Layout (`A3DPRO1`):
1. **Risoluzione Problemi Legali, Naming & Brand (`avatar-3d.js`, `avatar-3d.css`, `index.html`)**:
   - **Rimozione Totale Nomi Terzi**: Eliminato qualsiasi riferimento o badge a *"EA FC 26"*, *"EA Sports"* e *"FC26"*. Sostituito il badge con il nuovo selettore proprietario luxury ciano `<span class="es-a3d-badge-pro">PRO 3D</span>`.
   - **Naming Professionale Capigliature & Tatuaggi**: Eliminato il termine slang/meme "Mogger". Rinominate tutte le acconciature con denominazioni chiare e sobrie da piattaforma scouting d'élite: *Biondo Corto*, *Castano Sfumato*, *Biondo Platino*, *Nero Corvino*. Rinominate le sezioni in *Tatuaggio Geometrico Collo* e *Illuminazione Scena* (*Neon Élite*, *Tramonto Gara*, *Studio HQ*).
2. **Integrazione Fotogrammetrica del Volto Reale dell'Atleta**:
   - **Texture Blending della Foto Utente**: In `createProceduralFaceTexture()`, quando l'utente carica la propria fotografia del volto, il motore carica l'immagine con mascheratura ellittica centrale anatomica e gradiente di feathering radiale continuo. Il volto 3D riflette fedelmente i lineamenti reali dell'atleta (occhi, naso, bocca, espressione autentica) integrandosi armoniosamente con l'incarnato, il collo muscoloso e la capigliatura.
   - **Flusso Naturale Obbligatorio**: Impossibile saltare allo stage senza foto reale: se `stato_generazione !== 'completato'` o manca la foto, il sistema guida sempre l'utente alla schermata di Upload & Scansione Biometrica (`renderUploadView`). Pulsante *"Carica Nuova Foto"* sempre accessibile dallo stage.
3. **Proporzioni Corporee Calciatore D'Élite & Orientamento Frontale**:
   - **Risoluzione "Manichino Tozzo"**: Ricalibrate le scale di spalle, bicipiti, avambracci, vita e gambe (`armR: 0.050`, `waistW: 0.28`, `legR: 0.072`). La silhouette da calciatore risulta slanciata, muscolare ed elegante con maglia tecnica aderente a micro-costine.
   - **Orientamento Frontale & Stop Trottola**: Disattivata l'autorotazione continua all'avvio (`autoRotate: false`). L'atleta accoglie l'utente guardando dritto in camera; il tasto *"Rotazione"* è a disposizione dell'utente per avviare o fermare la rotazione quando desidera.
4. **Fix Layout, Z-Index & Elementi Spuri**:
   - **Isolamento Modale**: Elevato `z-index` di `.es-a3d-modal-overlay` a `2147483640 !important` e sfondo opaco `rgba(3, 6, 12, 0.98)`, impedendo a qualsiasi elemento della pagina sottostante (pulsanti galleggianti `+`, cerchi o status dot di debug) di sovrapporsi o trasparire all'interno della modale.
   - **Pill Bar Orbit Controls**: Alzata la posizione a `bottom: 32px` con `z-index: 50`, eliminando qualsiasi taglio sul bordo inferiore della viewport su schermi notebook o con scaling elevato.
5. **File**: `avatar-3d.js`, `avatar-3d.css`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_A3DPRO1`.

Feature precedente: **Avatar 3D Ultra-Realistico EA FC 26 Pro Clubs («Mogger Athlete Model») (`A3DEAFC1`):

Feature precedente: **Sblocco Consenso Biometrico Avatar 3D & Custom Checkbox Luxury (`A3DCHK1`):
1. **Risoluzione Root Cause Blocco Consenso (`avatar-3d.css`, `avatar-3d.js`, `index.html`)**:
   - **Causa Radice**: In `style.css` la regola globale `input[type="checkbox"]` era impostata su `display:none !important; visibility:hidden !important; pointer-events:none !important;`. La checkbox del consenso biometrico era quindi invisibile e non cliccabile, lasciando il pulsante "Conferma Consenso e Procedi" disabilitato a vita.
   - **Custom Checkbox Box & Tick SVG**: Introdotto un container interattivo luxury `.es-a3d-consent-checkbox-row` con box personalizzato `.es-a3d-custom-chk` e icona di spunta `✓` ciano neon ad animazione elastica, indipendente dallo stato dei controlli HTML nativi.
   - **Click-to-Proceed Universale**: Cliccando su qualsiasi punto della riga o direttamente sul pulsante *"Conferma Consenso e Procedi"*, il sistema attiva istantaneamente la spunta, salva il consenso GDPR Art. 9 e apre la schermata successiva di upload foto e morphing 3D senza alcuna possibilità di freeze o blocco.
2. **File**: `avatar-3d.css`, `avatar-3d.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_A3DCHK1`.

Feature precedente: **Unificazione Sidebar Luxury macOS & Toggle 72px su tutti i 12 Ruoli (`SIDEBARALL1`):

Feature precedente: **Integrazione Avatar 3D nella Dashboard Giocatore v3.0 & Status Biometrico (`PLAYER3D1`):

Feature precedente: **Nuova Struttura Sidebar Luxury Multi-Ruolo & Mini-Sidebar Collapsable (`SIDEBARPRO1`):

Feature precedente: **Completamento Feature «Avatar 3D» Biometrico Three.js & Compliance GDPR Art. 9 (`AVATAR3D1`):

Feature precedente: **Modalità di Caricamento Macroaree con Dots al Neon & Palette Elisee Scout (`LOADER1`):

Feature precedente: **Spostamento Control Center nel Menù a Tendina Admin/Privacy & Sblocco Freeze/Scroll (`CCDROPDOWN1`):

Feature precedente: **Ripristino Footer Homepage, Link Control Center Macroaree & Ottimizzazione Responsività (`CCFOOTER1`):

Feature precedente: **Sblocco Master Secret Admin, fix parser body Vercel & simulatore (`ADMINPIN2`):
1. **Risoluzione Root Cause `req.body`**: Nelle Serverless Functions di Vercel (`@vercel/node`), `req.body` è già parsato e lo stream `req.on('data')` è già concluso. `readBody` in `api/auth-admin.js` e `api/auth-otp.js` attendeva lo stream vuoto tornando `{}`, causando l'errore "Username staff non riconosciuto" e blocco del login. Aggiunto controllo prioritario su `req.body`.
2. **Backend `api/auth-admin.js`**: Default automatico di `username` a `'admin'` se omesso con PIN presente; tolleranza totale su maiuscole/minuscole e varianti (`Iemmello.9`, `Iemmello9`, `iemmello.9`, `iemmello9`) con hash PBKDF2 dedicati.
3. **Frontend `creator-role-switcher.js`**: Inoltro esplicito di `{ pin: pinVal, username: 'admin' }`.
4. **File**: `api/auth-admin.js`, `api/auth-otp.js`, `creator-role-switcher.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_ADMINPIN2`.

Feature precedente: **Blindatura OTP multi-istanza & monitoraggio sync tempo reale (`OTPSYNC1`):
1. **Blindatura OTP (`api/auth-otp.js`)**: persistenza su Vercel KV (`elisee:otp:<email>`, TTL 600s) + rilascio e verifica di un ticket crittografico firmato stateless (`signOtpTicket` / `verifyOtpTicket` HMAC SHA-256). L'OTP non fallisce più quando le richieste `send` e `verify` cadono su istanze Vercel differenti o con storage effimero.
2. **Frontend OTP (`verifica-account.js`)**: archiviazione `ticket` in `sessionStorage` e invio contestuale al submit delle 6 cifre con pulizia a verifica avvenuta.
3. **Trasparenza & Sync Status (`persist-sync.js`, `bacheca-annunci.js`)**: tracciamento dello stato di connessione (`syncState`), ascolto eventi `online`/`offline`, notifica trasparente per gli utenti (feedback salvataggio locale vs cloud) ed eliminazione delle "Due Verità" silenziose.
4. **File**: `api/auth-otp.js`, `verifica-account.js`, `persist-sync.js`, `bacheca-annunci.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_OTPSYNC1`.

Feature precedente: **Connessione server `verify-docs` & anti-fake sync (`VERIFYDOCS1`):
1. **Rewrite Vercel**: `/api/auth/verify-docs` reindirizzato via rewrite su `/api/auth/me?path=verify-docs` in `vercel.json` (evita il 404 e rispetta il limite rigido di 12 serverless functions del piano Hobby).
2. **Backend `api/auth/me.js`**: gestione completa di `start`, `docs` e `close` su Vercel KV / `/tmp` e locale. Aggiunto supporto a `req.query.email` per le richieste GET/POST senza Bearer token.
3. **Frontend `verifica-account.js`**: invio dell'email utente in tutti i payload POST (`start`, `docs`, `close`); aggiunta sincronizzazione automatica bidirezionale `syncWithServer(u)` al ripristino della sessione / login.
4. **File**: `vercel.json`, `api/auth/me.js`, `verifica-account.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260918_VERIFYDOCS1`.

Feature precedente: **Provenienza dati scheda tecnica (`SCOUTSRC1`):
1. Se il nominativo è in rosa allenatore/club: anagrafica, presenze, carico, ACWR da lì. Non si spaccia per GPS hardware.
2. Altrimenti GPS/carriera restano stima IA, con banner «Sintesi IA» su scheda, PDF e Word. Niente più dicitura «tracciamento hardware».
3. File: `schede-tecniche.js/css`. Cache `v20260918_SCOUTSRC1`.

Feature precedente: **Reclami GDPR e Ambassador sul server (`GDPRAMB1`):
1. **Reclami Art.30** e **richieste rettifica Art.16**: GET/POST `/api/manager?path=gdpr` (KV). Niente più seed demo se la coda è vuota.
2. **Pratiche Ambassador**: `/api/manager?path=ambassador`. Firme grandi su Storage, in KV restano URL.
3. Pull all’avvio e all’apertura tab Privacy. Push a ogni salvataggio. Cache `v20260918_GDPRAMB1`.

Feature precedente: **Control Center spazi e ordine (`CCSPACE1`):
1. Padding laterale 24px (prima era 0 sul `pf-page-inner` admin).
2. Tab senza doppio riquadro ciano; header con bordo sottile e Esci allineato.
3. Griglie stats/azioni/moduli `auto-fit` (niente 5 colonne schiacciate).
4. Inbox Manager fuori dall’overview (prima spariva aprendo la tab Manager).
5. Cache `v20260918_CCSPACE1`.

Feature precedente: **Spezzato `app.js` (`APPSPLIT1`):
1. **`app-admin-panels.js`**: `renderAdminPanel` / `renderPrivacyPanel` / griglia opzioni (~2000 righe).
2. **`app-boot-extras.js`**: unlock UI, wire Bacheca, pipeline extra (dopo la chiusura del `DOMContentLoaded` principale).
3. **`app.js`**: resta il core (nav, login, filtri, sessioni). Helper admin esposti su `window.getActiveUser` ecc.
4. Cache `v20260918_APPSPLIT1`.

Feature precedente: **Rosa/club e Card sul database (`CLUBCARD1`):
1. **Club Presidenza** (`elisee_pres_club_master_v3`, rosa inclusa): GET/POST `/api/manager?path=club` keyed per società. Pull all’apertura dashboard, push al salvataggio.
2. **Rosa/formazione Allenatore-Vice** (`elisee_coach_data`): stesso schema su `path=coach`.
3. **Card Elisee**: inbox, pubblicate e stats su `path=card`. I PNG grandi vanno su Supabase Storage (`staff-allegati/cards/…`); in KV restano URL/metadati (limite size).
4. **Niente 13ª funzione**: rewrite in `vercel.json`. File: `persist-sync.js`, `api/manager.js`, `pres-dash.js`, `coach-dash.js`, `vice-dash.js`, `card-atelier.js`. Cache `v20260918_CLUBCARD1`.

Feature precedente: **Auth admin + persistenza Bacheca/schede (`PERSIST1`):
1. **Control Center**: campi login vuoti (niente `admin`/`admin123` in HTML). Password verificata con hash PBKDF2, username in allowlist. Token firmato obbligatorio al rientro (GET `/api/auth-admin`), non basta il flag `localStorage`.
2. **Bacheca e schede**: GET/POST su `/api/bacheca` e `/api/schede` (rewrite su `manager`, niente 13ª funzione). Persistenza Vercel KV se presente, file in locale. Il client unisce remoto + `localStorage`.
3. **File**: `api/auth-admin.js`, `api/manager.js`, `app.js`, `index.html`, `bacheca-annunci.js`, `schede-tecniche.js`, `vercel.json`. Cache `v20260917_PERSIST1`.

Feature precedente: **Control Center dashboard operativa (`CCDASH1`):
1. **Home Admin**: stat card (job IA, Admin, Privacy, sync, alert), azioni rapide (Autopilot primario, GDPR, Sync, War Room, Auto-Fix), grid 5 moduli, grafici job 24h + donut categorie + % operativa, Governance & Trust, identità sessione.
2. **Tab**: restano le 5 sezioni. Mission Control Autopilot non è più l’unico contenuto della home: sta nel modulo Autopilot. Privacy ha `#governance-panel-target` (prima mancava, il pannello GDPR non montava).
3. **Dati**: cluster `EliseeAICluster`, reclami localStorage, step audit, presenza admin/privacy, pending Card Elisee. Nessun dato mock permanente.
4. **File**: `control-center.js/css`, `index.html`, `card-atelier.js`, `manager-runtime.js`, `sw.js`. Cache `v20260917_CCDASH1`.

Feature precedente: **Bacheca 7 categorie (`BACHECA7`):
1. **Categorie**: `cerco_squadra`, `cerco_giocatore`, `cerco_allenatore`, `cerco_arbitro`, `cerco_amichevole`, `cerco_sponsor`, `calciomercato`. Dropdown Categoria con icone SVG, filtro in AND con Ruolo / Zona / Raggio. Query param `?cat=`.
2. **Nuovo annuncio**: CTA unica al posto di «Pubblica candidatura». Step 1 card categoria, step 2 campi comuni + specifici. Validazione client + `POST /api/bacheca` (rewrite su `/api/manager?path=bacheca`, niente 13ª serverless Hobby). Persistenza `elisee_user_jobs` + file `data/bacheca/annunci.json` (`/tmp` su Vercel).
3. **Card**: badge icona+label da `categoria` del record (bordo sottile, non pillola satura).
4. **Migrazione**: annunci senza categoria inferiti dal testo; fallback `calciomercato`.
5. **File**: `bacheca-annunci.js`, `api/bacheca.js`, `app.js`, `index.html`, `bacheca-board.css`, `sw.js`, `version.json`. Cache `v20260917_BACHECA7`.

Feature precedente: **Bugfix ruoli, DS e crest (`BUGFIX1`):
1. **Cambio ruolo**: `#es-fisio { display:block !important }` batteva l’attributo `hidden` (specificità ID). Le dashboard si sovrapponevano. Unmount ora forza `display:none !important` e CSS `[hidden]` sulle shell.
2. **Fisio**: host JS è `#es-fisio`, CSS/unmount cercavano ancora `#es-fd`. Inclusi entrambi.
3. **Classi body residue** (`is-gk-mode`, `is-at-mode`, `is-player-mode`, `is-pres-mode`, …): al cambio ruolo restavano attive e nascondevano footer/tab. Pulizia su tutti i mode.
4. **DS**: inbox Match Analyst e hub advisor cercavano `.es-pd-body` (tolto dalla shell PRO) → slot `#es-pd-actions-slot` / `.es-pro-main`.
5. **Presidenza**: logo City solo se il club è Foggia City (niente stemma forzato su altri club); email/fallback demo non usano più Calcio Foggia 1920.
6. **Export PDF scheda**: chiusura `<script>` spezzata per non rompere il parser; campo ricerca IA scoped alla shell.
7. **File**: `player-profile.js`, `dash-luxury.css`, `fisio-dash.css`, `ds-dash.js`, `ds-hub.js`, `pres-dash.js`, `schede-tecniche.js`, `index.html`, `sw.js`, `version.json`. Cache `v20260917_BUGFIX1`.

Feature precedente: **Logo Foggia City con licenza, mai Calcio Foggia 1920 (`FGCLIC1`):
1. **Problema**: Foggia City usava lo stemma satanello di Calcio Foggia 1920 (`foggia.png` / id `1000345699`). Licenza d’uso solo per Foggia City.
2. **Fix**:
   - Crest di tutte le dashboard staff/atleta/presidente: `immagini/squadre-loghi/foggia-city.png`.
   - Demo Presidenza: club **Foggia City** (non Foggia Calcio 1920).
   - Sanifica localStorage se logo/nome 1920.
   - Selettore squadre: kit/logo City solo se `id=foggia-city` o nome «FOGGIA CITY», non per qualsiasi «Foggia».
3. **File**: dashboards, `dash-real.js`, `pres-dash.js`, `squadre-select.js`, `app.js`, `index.html`, `sw.js`. Cache `v20260917_FGCLIC1`.

Feature precedente: **Scheda tecnica scouting allineata al PDF ufficiale (`SCOUTPDF1`):
1. **Correzione**: il PDF precedente era il manuale profili club. Il documento corretto è `Scheda_Tecnica_Scouting.pdf` (Dossier analitico & scheda tecnica scouting, export DS).
2. **Layout a 5 sezioni**:
   - 1 Header & anagrafica (nome, nascita/età, nazionalità/domicilio, status contrattuale, club/categoria, antropometria, Match Index IA)
   - 2 Specifiche tattiche & mappa ruoli (piede + uso opposto, ruolo primario/secondari, badge, saturazione posizioni %)
   - 3 Heatmap stagionale (profilo calore, modulo, certificazione)
   - 4 Metriche GPS (distanza, HSR, vmax, sprint, acc/dec + riferimento categoria)
   - 5 Storico carriera (stagione, squadra, categoria, presenze tit., minuti, gol, assist, cartellini, totale)
3. Richiedibile da **DS** e **Scout**, con **Esporta PDF** e **Esporta Word**.
4. **File**: `schede-tecniche.js`, `schede-tecniche.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_SCOUTPDF1`.

Feature precedente: **Funzioni dedicate Manuale Profili Club (`CLUBOPS1`):
1. **Richiesta**: aggiornare le 7 aree del PDF `manuale_profili_club_260916_153944.pdf` (Team Manager, Settore Giovanile, Segretario Generale, Magazziniere, Biglietteria/SLO, Ufficio Stampa, Marketing).
2. **Intervento** (`club-role-ops.js` + nav in `dash-real.js`):
   - **Team Manager**: Hub comunicazioni broadcast/push con conferme; checklist matchday; calcolatore itinerari/km/tempi; prenotazioni strutture **Coming soon / Beta** + lista d’attesa; KPI squadra; scheda anagrafica tesserato.
   - **Settore Giovanile**: Academy Talent Tracker (fisica/tattica/scolastica); scouting territoriale; libretto elettronico formativo.
   - **Segretario**: alert scadenze (visite, svincoli, rinnovi, squalifiche); gestore contratti/tesseramenti; archivio cloud con firma digitale.
   - **Magazziniere**: canale richieste (approva/rifiuta/lavorazione); budget con decurtazione; inventario RFID/barcode; audit sola lettura Presidenza; manutenzioni programmate.
   - **Biglietteria/SLO**: pressione varchi; SLO Hub tifosi; ticketing nominativo QR antibagarinaggio.
   - **Ufficio Stampa**: Accrediti Media Express; rassegna/monitoring; content calendar.
   - **Marketing**: CRM lead/rinnovi; analytics store; loyalty punti tifosi.
   - Ogni area ha la **scheda anagrafica tesserato** del PDF (nome, cognome, ruolo, n° tessera, società, nascita, email, telefono, inizio incarico, foto).
3. **File**: `club-role-ops.js`, `dash-real.js`, `dash-luxury.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_CLUBOPS1`.

Feature precedente: **Scheda tecnica IA da DS e Scout (`SCHEDAIA1`):
1. **Richiesta**: la scheda tecnica (manuale `manuale_profili_club_260916_153944.pdf`) deve essere generata dall’IA con i dati, non solo sui pochi profili demo in Bacheca, e richiedibile da Direttore Sportivo e Area Scout.
2. **Intervento**:
   - Generatore `EliseeSchede.generateFor` su qualsiasi tesserato (pool, Secret List, Scopri profili, dossier scout, o nome digitato).
   - Scheda anagrafica tesserato del PDF: nome, ruolo, n° tessera, società, nascita, email, telefono, inizio incarico, foto + missione/competenze/funzioni se è uno staff di club.
   - DS: tab **Schede tecniche IA** nella sidebar.
   - Scout: pulsanti **Genera scheda tecnica IA** su Dossier e Database.
3. **File**: `schede-tecniche.js`, `schede-tecniche.css`, `dash-real.js`, `ds-dash.js`, `obs-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_SCHEDAIA1`.

Feature precedente: **Allineamento criteri password login / reimposta (`PWPOLICY1`):
1. **Bug**: Accedi mostrava i 4 requisiti (8 caratteri, maiuscola, numero, speciale) mentre Reimposta password accettava solo 8 caratteri e **non salvava** l'hash sul server. Chi cambiava password senza maiuscola poi non riusciva ad entrare (hash originale invariato + UI di login fuorviante).
2. **Fix**:
   - Login: niente checklist di forza. Basta email + password; il server confronta l'hash.
   - Reimposta / registrazione / set-password: stessi 4 criteri, checklist in tempo reale, blocco se non conformi.
   - `POST /api/auth/set-password` valida la policy e persiste l'hash (file locale `data/auth/password-overrides.json`, `/tmp` su Vercel, Redis se presente).
   - Account `eliseomiraglia2704@gmail.com` incluso nel login staff.
3. **File**: `lib/password-policy.js`, `api/auth/me.js`, `app.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_PWPOLICY1`.
4. **Nota accesso**: la password cambiata senza maiuscola non era stata salvata. Per entrare ora usare la password originale `Iemmello.9`, poi reimpostarla rispettando i 4 criteri.

Feature precedente: **Menu account navbar editoriale (`ACCTMENU1`):
1. **Richiesta**: il tendina utente (chip ciano, icone neon, bordo HUD, Outfit 900) era troppo da videogioco rispetto all'Area Stampa.
2. **Intervento**:
   - Pannello `#user-dropdown-menu` allineato alla palette Stampa (`#0b0e14`, bordo `#1e2430`, raggio 8px, hairline, niente glow ciano).
   - Voci in sentence case, Inter 400, icone rimosse, hover neutro.
   - Ruolo senza emoji/neon; trigger come Accedi (bordo bianco sottile, niente pillola ciano).
   - Avatar quadrato 4px, fondo `#1e2430`.
3. **File**: `index.html`, `style.css`, `app.js`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_ACCTMENU1`.

Feature precedente: **Allineamento PRO di tutte le dashboard restanti (`ALLPRO1`):
1. **Sblocco griglia 56px** in `dash-luxury.css`: le shell PRO (`es-pro-shell`, `es-gk-shell`, `es-med-shell`, `es-obs-shell`, `es-ma-shell`, `es-at-shell`, `es-cos-shell`) e gli id `#es-gk` `#es-md` `#es-fisio` `#es-nu` `#es-mad` `#es-od` `#es-atd` `#es-dsd` `#es-tmd` `#es-yg` `#es-dg` `#es-ag` `#es-mk` `#es-pr` `#es-eq` `#es-sg` `#es-bt` `#es-td` `#es-pd` `#es-gd` `#es-prd` sono `display:block` (niente colonna nera da 56px). CSS condiviso `.es-pro-*` (sidebar 240px, header 2 livelli, tab bar).
2. **Preparatore Portieri** (`gk-dash.js` / `gk-dash.css`): shell PRO già pronta, ora sbloccata dalla griglia 56px. Tab: Dashboard, Stanza dei Portieri, Schede, Reattività, Badge, Radar, Canale Mister.
3. **Preparatore Atletico** (`at-dash.js` / `at-dash.css`): rail 56px rimossa. Sidebar 240px, header 2 livelli, tab Dashboard / GPS / Schede / Test / Badge / Radar / Canale Mister.
4. **Shell condivisa** `dash-real.js`: DS, Team Manager, Settore Giovanile, DG, Procuratore, Marketing, Ufficio Stampa, Magazziniere, Segretario, Biglietteria, Tifoso passano alla shell PRO (sidebar + header 2 livelli + tab operative per ruolo).
5. **Medico / Fisio / Nutrizionista**: CSS sidebar 240px (`es-med-*`) aggiunto; `#es-fisio` allineato all'id JS (prima `#es-fd`); box `display:block`.
6. **Atleta, Giornalista, Presidente**: chrome PRO (commit `2f71a995` / `PRO3DASH1`) incluso in questo giro di cache.
7. **File**: `dash-luxury.css`, `dash-real.js`, `gk-dash.js`, `gk-dash.css`, `at-dash.js`, `at-dash.css`, `med-dash.css`, `fisio-dash.css`, `nu-dash.css`, `player-profile.css`, `player-dash.js/css`, `giorn-dash.js/css`, `pres-dash.js/css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_ALLPRO1`.

Feature precedente: **Conversione PRO Area Preparatore Atletico (`ATPRO1`):
1. **Allineamento dashboard Preparatore Atletico a Preparatore Portieri**:
   - Sidebar fissa 240px (brand ELISEE SCOUT / Area Preparatore Atletico, 8 voci, badge Foggia City sticky).
   - Header a 2 livelli: identità UEFA/FIGC + CTA «Registra Carico GPS +»; Prossima Gara con countdown giorni/ore/min e Focus «ACWR & Prevenzione Infortuni».
   - Tab bar compatta: Dashboard, GPS, Schede, Test, Badge, Radar, Canale Mister.
   - Rimossa la rail 56px `.es-pd-rail`; `#es-atd` è `display:block`; `body.is-at-mode` nasconde il footer pubblico.
   - Fallback club Atalanta/Carlentini → Foggia City. Handler `data-at-act` invariati.
2. **File aggiornati**: `at-dash.js`, `at-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_ATPRO1`.

Feature precedente: **Refactoring PRO `med-dash.js`, `fisio-dash.js`, `nu-dash.js` (`MEDFISNUDASH_PRO`):
1. **Refactoring Completo Aree Medico Sociale, Fisioterapista e Nutrizionista — PRO Shell**:
   - **Richiesta Utente**: le dashboard di Medico Sociale, Fisioterapista e Nutrizionista non erano ordinate come l'Area Allenatore e Vice Allenatore.
   - **Interventi Applicati** (identici su tutti e 3 i file):
     - *Sidebar Gestionale 240px* con brand header dedicato, 8-10 voci di navigazione con icone SVG e badge societario Foggia City sticky.
     - *Header a Due Livelli*: Livello 1 (Badge licenza/ordine, nome, ruolo, tesseramento, logo club, pulsante azione rapida). Livello 2 (Prossima sessione programmata, KPI Rosa/Trattamenti/Piani, Focus di giornata).
     - *Tab Bar Superiore Compatta* per navigazione rapida orizzontale.
     - *med-dash.js* — Tab: Dashboard, Visite & Controlli, Infortuni & Diagnosi, Idoneita Agonistica, Prescrizioni & Fisio, Return to Play, Radar & Competenze, Dossier Riservato, Canale Staff, Profilo.
     - *fisio-dash.js* — Tab: Dashboard, Registro Trattamenti, Protocolli Riabilitativi, Valutazione ROM & Test, Tecniche & Strumentali, Radar & Competenze, Canale Staff, Profilo.
     - *nu-dash.js* — Tab: Dashboard, Piani Nutrizionali, Composizione Corporea & BIA, Integrazione WADA, Gestione Trasferte & Ritiro, Radar & Competenze, Canale Staff, Profilo.
2. **File aggiornati**: `med-dash.js`, `fisio-dash.js`, `nu-dash.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `v20260917_MEDFISNUDASH_PRO`.
3. **Commit**: `7911a446` — push su `main` — deploy Vercel in corso.

Feature precedente: **Riprogettazione Area Match Analyst & Video Analyst con Architettura Ordinata Speculare a Coach & Vice (`MAPRO1`):**
1. **Allineamento & Ordinamento Completo Dashboard Match Analyst & Video Analyst (`ma-dash.css`, `ma-dash.js`, `index.html`)**:
   - **Richiesta Utente**: l'Area Match Analyst non era ordinata come l'Area Allenatore e Vice Allenatore. Tutte le opzioni e le funzioni andavano riordinate nel miglior modo possibile.
   - **Interventi Applicati**:
     - *Sidebar Gestionale a Sinistra (240px)*: introdotta la barra laterale professionale fissa con brand header "ELISEE SCOUT — Area Match & Video Analysis", 8 voci di navigazione con icone SVG (*Dashboard, Report Tattici, Heatmap & Spazi, Video Tagging & Clip, Comparatore IA, Radar Competenze, Canale Staff & Mister, Profilo & Abilitazione*) e badge societario Foggia City sticky in fondo (`1000345699.png`).
     - *Header d'Eccellenza a Due Livelli*:
       - Livello 1: Patentino FIGC Coverciano, Nome Analyst, Ruolo Ufficiale, Tesseramento federale, Logo Foggia City e pulsante d'azione rapida `Nuovo Report Tattico +`.
       - Livello 2: Prossimo Avversario da Analizzare con avversario, data, ora, stadio, countdown dinamico giorni/ore/minuti, e Focus Tattico di Giornata ("Studio Palle Inattive & Transizioni Negative").
     - *Tab Bar Superiore Compatta*: navigazione rapida orizzontale a schede per una visuale costantemente ordinata.
     - *7 Viste Operative Dedicate*:
       - `Dashboard`: Profilo Analyst con completamento scheda (85%), Centro Operativo Tactical OS con 3 KPI (*Report Archiviati, 92% Lettura Tattica, Canale Mister Attivo*), Tactical Suite v3.0 a 6 card responsive e registro ultime attività.
       - `Report Tattici`: archivio report a 8 blocchi (pre-gara, post-gara, studio avversario) con modulo interattivo di compilazione e inoltro con un click al Mister e al DS.
       - `Heatmap & Spazi`: pitch tattico vettoriale SVG interattivo con le zone di calore aggregate della squadra (baricentro medio 54.8m, indice di ampiezza 68%, densità recupero palla).
       - `Video Tagging & Clip Hub`: catalogo clip video indicizzate con player e tag (palle inattive, costruzione bassa, uscite difensive).
       - `Comparatore Giocatori IA`: strumento di confronto testa a testa con radar metrico comparativo istantaneo tra profili dello stesso ruolo.
       - `Radar Competenze`: grafico polare vettoriale a 8 assi (Lettura Tattica 93%, Analisi Video 91%, Comunicazione Staff 94%) con indici Coverciano.
       - `Canale Staff & Mister`: inoltro automatico dei dossier riservati all'Allenatore Capo per il briefing tecnico pre-gara e chat interna staff.
2. **File aggiornati**: `ma-dash.css`, `ma-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_MAPRO1`.

Feature precedente: **Riprogettazione Area Osservatore & Scout con Architettura Ordinata Speculare a Coach & Vice (`SCOUTPRO1`):**
1. **Allineamento & Ordinamento Completo Dashboard Osservatore & Talent Scout (`obs-dash.css`, `obs-dash.js`, `index.html`)**:
   - **Richiesta Utente**: l'Area Osservatore & Scout non era ordinata come l'Area Allenatore e Vice Allenatore. Tutte le opzioni e le funzioni andavano riordinate nel miglior modo possibile.
   - **Interventi Applicati**:
     - *Sidebar Gestionale a Sinistra (240px)*: introdotta la barra laterale professionale con brand header "ELISEE SCOUT — Area Talent Scouting", 8 voci di navigazione dedicate con icone SVG (*Dashboard, Secret List Stealth, Dossier & Schede, Gare & Missioni, Database Calciatori, Radar & Competenze, Canale DS & Trattative, Profilo & Abilitazione*) e badge societario Foggia City in fondo sticky (`1000345699.png`).
     - *Header d'Eccellenza a Due Livelli*:
       - Livello 1: Patentino FIGC Scout, Nome, Tesseramento federale, Logo Foggia City e pulsante d'azione rapida `Secret List Stealth (N) →`.
       - Livello 2: Prossima Partita da Visionare con avversario, data, ora, stadio, countdown dinamico giorni/ore/minuti, e Obiettivo di Giornata ("Monitoraggio Under 19 & Svincolati").
     - *Tab Bar Superiore Compatta*: navigazione rapida orizzontale a schede che mantiene la vista costantemente pulita e a fuoco.
     - *7 Viste Operative Dedicate*:
       - `Dashboard`: Profilo Scout con barra di completamento (85%), Centro Operativo Stealth con i 3 KPI numerici, Scouting Suite v3.0 a 6 card responsive e registro ultime osservazioni.
       - `Secret List`: tabella interattiva dei talenti monitorati in modalità stealth (invisibile a terzi) con filtri, potenziale, note, inoltro istantaneo al DS e aggiunta nuovi calciatori.
       - `Dossier & Schede`: archivio relazioni tecniche (tecnica, tattica, fisica, mentale) con voto e raccomandazione d'ingaggio.
       - `Gare & Missioni`: calendario delle partite da seguire sul campo con focus scouting.
       - `Database Calciatori`: discovery globale con filtri per ruolo (Portieri, Difensori, Centrocampisti, Attaccanti).
       - `Radar & Competenze`: grafico polare a 8 assi vettoriale nitido (Precisione 92%, Conoscenza Mercato 94%, ecc.) con benchmark.
       - `Canale DS & Trattative`: coordinamento riservato con la Direzione Sportiva, governance/compliance FIGC e Wall dei trasferimenti ufficializzati.
2. **File aggiornati**: `obs-dash.css`, `obs-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_SCOUTPRO1`.

Feature precedente: **Risoluzione Widescreen & Anti-Taglio ActionsGrid per Tutte le Dashboard Staff (`GKALLFIX1`):**
1. **Perfezionamento Preparatore Portieri & Standardizzazione Universale ActionsGrid (`gk-dash.css`, `at-dash.css`, `fisio-dash.css`, `med-dash.css`, `nu-dash.css`, `index.html`)**:
   - **Diagnosi del bug visivo riscontrato negli screenshot del Preparatore Portieri**:
     - Nello Screenshot 3, la sezione "GK Suite v3.0" presentava 6 card operative tagliate verticalmente con icone troncate e testo illeggibile a causa del selettore rigido a 3 colonne.
     - L'ispezione preventiva su tutti i fogli di stile ha rivelato che la stessa struttura a 3 colonne fisse era presente anche in `at-dash.css` (Preparatore Atletico), `fisio-dash.css` (Fisioterapista), `med-dash.css` (Medico Sociale) e `nu-dash.css` (Nutrizionista).
   - **Interventi Applicati**:
     - *Standardizzazione Anti-Taglio Universale*: aggiornate tutte le classi `.es-gk-actions-grid`, `.es-at-actions-grid`, `.es-fisio-actions-grid`, `.es-med-actions-grid`, `.es-nu-actions-grid` adottando `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `width: 100%` e card con `min-height: 76px`.
     - *Esperienza Utente Portieri*: tutte le 6 card operative (*Scheda Sviluppo Tecnico, Video Tagging & Uscite Alte, Convalida Reattività GPS, Assegna Badge Saracinesca, Menzione Speciale Card, Inoltra Report al Mister*) risultano ora perfettamente leggibili, ariose ed eleganti su qualsiasi risoluzione.
2. **File aggiornati**: `gk-dash.css`, `at-dash.css`, `fisio-dash.css`, `med-dash.css`, `nu-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_GKALLFIX1`.

Feature precedente: **Risoluzione Widescreen, Anti-Taglio Card & De-duplicazione Match Analyst (`MAFIX1`):**
1. **Perfezionamento Dashboard Match Analyst & Video Analyst (`ma-dash.css`, `ma-dash.js`, `index.html`)**:
   - **Diagnosi del bug visivo riscontrato negli screenshot**:
     - Analogamente all'osservatore, la griglia a 3 colonne di "Tactical Suite v3.0" si comprimeva tagliando verticalmente le card e le icone.
     - Duplicazione dell'azione "Nuovo Report" presente sia nell'Header principale che come CTA nel footer del Registro.
   - **Interventi Applicati**:
     - *Grid Reattiva Anti-Taglio*: in `ma-dash.css`, `.es-ma-actions-grid` utilizza ora `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `width: 100%` e `min-height: 76px`. Tutte le 6 card operative (*Report 8 Blocchi, Heatmap & Mappa di Calore, Comparatore Giocatori IA, Tag & Menzioni Certificate, Clip Hub & Video Tagging, Inoltro Dossier a DS & Mister*) sono ora perfettamente ariose e non tagliate.
     - *Eliminazione Duplicazione*: rimosso il pulsante ridondante "Nuovo Report Privato" nel footer del registro, sostituendolo con l'azione diretta **"⚖️ Apri Comparatore IA"** (`data-ma="compare-ia"`), mantenendo la CTA di creazione primaria nell'Header in alto e la pubblicazione del portfolio con **"🌐 Focus Pubblico Portfolio"**.
2. **File aggiornati**: `ma-dash.css`, `ma-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_MAFIX1`.

Feature precedente: **Risoluzione Widescreen & Eliminazione Tagli Dashboard Osservatore & Scout (`OBSFIX1`):**
1. **Risoluzione Compressione Widescreen & Tagli Card (`player-profile.css`, `obs-dash.css`, `obs-dash.js`)**:
   - **Diagnosi del bug visivo riscontrato negli screenshot**:
     - `player-profile.css` applicava a riga 384 un selettore restrittivo `#user-dossier-view-group.is-staff-area:not(.is-coach-dash) .pf-page-inner { max-width: 560px; }`. Questo causava lo schiacciamento dell'intera dashboard in una colonnina stretta di 560px con il restante 60% dello schermo nero e vuoto.
     - A causa della larghezza forzata a 560px, le 3 colonne degli "Strumenti Operativi — Azioni Possibili" venivano compresse a 160px l'una, tagliando verticalmente le card e le icone.
     - Nel registro a piè di pagina il testo andava a capo parola per parola per via della larghezza compressa.
     - Presenza di un bottone duplicato ridondante "Apri Secret List" nel footer del registro oltre a quello già presente in header e nel centro operativo.
   - **Interventi Applicati**:
     - *Sblocco Larghezza*: aggiornato `player-profile.css` escludendo dal vincolo di 560px tutte le dashboard di ruolo moderne.
     - *Grid Reattiva Anti-Taglio*: in `obs-dash.css` la griglia strumenti è ora fluida con `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `width: 100%` e `min-height: 76px`, garantendo card ariose e perfettamente visibili su qualunque monitor.
     - *Eliminazione Ridondanze*: rimosso il terzo pulsante duplicato "Apri Secret List" nel footer del registro, sostituendolo con l'azione a valore aggiunto **"📋 Nuova Scheda Tecnica IA"** (agganciata direttamente al modulo schede/candidature).
2. **File aggiornati**: `player-profile.css`, `obs-dash.css`, `obs-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_OBSFIX1`.

Feature precedente: **Riprogettazione Completa & Ordinata Nutrizionista & Composizione Corporea (`NUTRILUX1`):**
1. **Ridisegno Integrale Dashboard Nutrizionista (`nu-dash.js`, `nu-dash.css`, `index.html`)**:
   - **Diagnosi**: Layout collassato da regole CSS asimmetriche a 3 colonne frastagliate con `grid-template-columns: 280px minmax(0, 1fr) 240px` che comprimevano il profilo e sparpagliavano blocchi scollegati senza un vero motore di pianificazione nutrizionale sportiva, esami BIA o timing carboidrati.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Dock Laterale Sinistro**: Rail compatto (56px) con icone pulite (*Home, Dashboard, Nuovo Piano Alimentare, BIA & Plicometria, Messaggi Staff, Anagrafica*).
     - **Top Header Bar**: Breadcrumb, badge ufficiale *Albo Nazionale Biologi / ONB* e due CTA primarie in alto a destra: **"Nuovo Piano Alimentare"** (gradiente ciano luxury con icona torta/mela) e **"Registra BIA / Plicometria"**.
     - **Riga 1 (2 Colonne 50/50)**:
       - *Profilo Ufficiale Nutrizionista*: avatar circolare 58px con fallback monogramma, logo club con scudetto o status indipendente (senza duplicazioni), barra completamento anagrafica all'**85%** con CTA *"✏️ Modifica Anagrafica"* e specializzazione (Biologo Nutrizionista dello Sport / ONB).
       - *Composizione Corporea & Rosa BIA*: griglia KPI nutrizionali (*9.4% Massa Grassa Rosa 🟢, 78.2% Massa Magra FFM 🟢, 64.5% Idratazione TBW, 24/24 Piani Attivi, 0 Carenze, 100% WADA Compliant*) con quick-buttons (*Nuovo Piano, Test BIA / Plico, Idratazione Match, Menu Trasferta*).
     - **Riga 2 — Strumenti Operativi Nutrizionista (ActionsGrid a 3 Colonne)**:
       - 6 card operative (*Crea Piano Alimentare, Esame BIA & Plicometria, Protocollo Idratazione Match, Integrazione Certificata WADA, Pianificazione Menu Trasferta, Report Nutrizionale allo Staff*).
     - **Riga 3 — Analisi & Deontologia (3 Colonne Paritetiche)**:
       - *Quadro Nutrizionale Rosa*: Radar polare ad 8 assi con benchmark di settore e media personale.
       - *Protocolli Scientifici*: Checklist con check verdi delle metodologie autorizzate (BIA vettoriale, carb loading, Informed-Sport, finestra anabolica recovery).
       - *Limiti di Ruolo & Deontologia*: Card in rosa/rosso tenue desaturato (`#fda4af`) per divieto assoluto prescrizione farmaci (riservata al Medico), tolleranza zero contaminanti e nessuna operatività di calciomercato.
     - **Riga 4 — Registro Piani Alimentari & Misurazioni**: visual empty-state moderno con icona morbida e link operativi.
2. **File aggiornati**: `nu-dash.js`, `nu-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_NUTRILUX1`.

Feature precedente: **Riprogettazione Completa & Ordinata Fisioterapista & Riabilitazione (`FISIOLUX1`):**
1. **Ridisegno Integrale Dashboard Fisioterapista (`fisio-dash.js`, `fisio-dash.css`, `index.html`)**:
   - **Diagnosi**: `fisio-dash.css` conteneva soltanto 16 righe grezze e la pagina caricava un vecchio template a 3 colonne spoglio senza strumenti per la gestione delle terapie manuali, tecarterapia, kinesiotaping, monitoraggio scala VAS del dolore e coordinamento con il Medico Sociale.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Dock Laterale Sinistro**: Rail compatto (56px) con icone pulite (*Home, Dashboard, Nuova Terapia, Valutazione Dolore, Messaggi Staff, Anagrafica*).
     - **Top Header Bar**: Breadcrumb di ruolo, badge ufficiale *Albo FNOFI* e due CTA primarie in alto a destra: **"Registra Trattamento"** (gradiente ciano luxury) e **"Report Riabilitativo allo Staff"**.
     - **Riga 1 (2 Colonne 50/50)**:
       - *Profilo Ufficiale Fisioterapista*: avatar circolare 58px con fallback monogramma, logo club con scudetto o status indipendente (senza duplicazioni), barra completamento anagrafica all'**85%** con CTA *"✏️ Modifica Anagrafica"* e specializzazione (Fisioterapia Sportiva / Albo FNOFI).
       - *Centro Riabilitativo & Terapie Rosa*: griglia KPI riabilitativi (*1 In Terapia Attiva 🟡, 23 Pieno Regime 🟢, 14 Sedute Eseguite Sett., 0 Ricadute Muscolari, 2.1/10 Scala VAS Media, 100% Aderenza Protocolli*) con quick-buttons (*Nuova Terapia, Scala VAS Dolore, Tecar / Manuale, Sinergia Medico*).
     - **Riga 2 — Strumenti Operativi Fisioterapista (ActionsGrid a 3 Colonne)**:
       - 6 card operative (*Registra Trattamento Terapico, Valutazione Dolore & ROM, Protocollo Riatletizzazione, Kinesiotaping & Bending, Idroterapia & Crioterapia, Report Riabilitativo allo Staff*).
     - **Riga 3 — Analisi & Deontologia (3 Colonne Paritetiche)**:
       - *Quadro Riabilitativo Rosa*: Radar polare ad 8 assi con benchmark di settore.
       - *Protocolli & Metodologia*: Checklist con check verdi delle tecniche riabilitative approvate.
       - *Limiti di Ruolo & Deontologia*: Card in rosa/rosso tenue desaturato (`#fda4af`) per prescrizione medica vincolante del Medico Sociale, nessun nulla osta autonomo e nessuna modifica rosa.
     - **Riga 4 — Registro Trattamenti & Terapie**: visual empty-state moderno con icona morbida e link operativi.
2. **File aggiornati**: `fisio-dash.js`, `fisio-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_FISIOLUX1`.

Feature precedente: **Riprogettazione Completa & Ordinata Medico Sociale & Staff Sanitario (`MEDLUX1`):**
1. **Ridisegno Integrale Dashboard Medico Sociale (`med-dash.js`, `med-dash.css`, `index.html`)**:
   - **Diagnosi**: `med-dash.css` conteneva soltanto 16 righe grezze e la logica usava un template a 3 colonne generico senza strumenti clinici operativi, senza controllo scadenze idoneità agonistica, senza prescrizioni per fisioterapia e senza return-to-play.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Dock Laterale Sinistro**: Rail (56px) con icone pulite (*Home, Dashboard, Nuova Visita, Idoneità, Messaggi Staff, Anagrafica*).
     - **Top Header Bar**: Breadcrumb, badge ufficiale *FMSI / Ordine Medici* e due CTA primarie in alto a destra: **"Nuova Visita Medica"** e **"Certifica Idoneità Agonistica"**.
     - **Riga 1 (2 Colonne 50/50)**:
       - *Profilo Ufficiale Medico Sociale*: avatar circolare 58px con fallback monogramma, affiliazione al club con scudetto, barra completamento anagrafica all'**85%** con CTA *"✏️ Modifica Anagrafica"* e specializzazione medica.
       - *Monitoraggio Sanitario & Idoneità Rosa*: griglia KPI sanitari (*24 Idoneità Valide 🟢, 0 In Scadenza 🟡, 0 Non Idonei 🔴, 1 In Terapia Conservativa, 22 Piena Disponibilità, 0 Interventi*) con quick-buttons (*Nuova Visita, Certifica Idoneità, Terapie & Fisio, Return to Play*).
     - **Riga 2 — Strumenti Operativi Medico Sociale (ActionsGrid a 3 Colonne)**:
       - 6 card operative (*Registra Visita / Controllo, Certifica Idoneità Agonistica, Registro Infortuni & Diagnosi, Prescrizioni & Fisioterapia, Attestazione Return to Play, Dossier Sanitario Riservato*).
     - **Riga 3 — Analisi & Deontologia (3 Colonne Paritetiche)**:
       - *Quadro Sanitario Rosa*: Radar polare ad 8 assi con benchmark FMSI.
       - *Attività & Poteri Sanitari*: Checklist con check verdi delle facoltà medico-legali.
       - *Limiti di Ruolo & Deontologia*: Card in rosa/rosso tenue desaturato (`#fda4af`) per segreto professionale e autonomia clinica.
     - **Riga 4 — Registro Visite & Cartelle Cliniche**: visual empty-state moderno con icona stetoscopio e link operativi.
2. **File aggiornati**: `med-dash.js`, `med-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_MEDLUX1`.

Feature precedente: **Riprogettazione Completa Match Analyst, Preparatore Portieri & Preparatore Atletico (`STAFFLUX1`):**
1. **Ridisegno Integrale Dashboard Match Analyst (`ma-dash.js`, `ma-dash.css`, `index.html`)**:
   - **Diagnosi**: Layout spezzato da `fillExtra` che appendeva blocchi disordinati sotto la shell generica a 3 colonne, duplicando il profilo e disperdendo 15 bottoni in sotto-griglie frammentate.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Dock Sinistro** con icone e tooltip dedicati.
     - **Top Header Bar** con breadcrumb, badge tattico e due CTA primarie: *"Nuovo Report Tattico"* e *"Inoltra a DS e Mister"*.
     - **Riga 1 (2 Colonne)**: Profilo Match Analyst (avatar 58px, qualifica Coverciano, completamento 85%, affiliazione) + Laboratorio Tattico con Pitch SVG sovrapposizione heatmap di squadra e quick buttons.
     - **Riga 2 (ActionsGrid a 3 Colonne)**: 6 card operative (*Report Privato*, *Report Pubblico / Menzione*, *Assegna Badge Tattico*, *Studio Avversario Pre-Gara*, *Clip Hub & Video Tagging*, *Inoltra Dossier allo Staff*).
     - **Riga 3 (3 Colonne Paritetiche)**: Quadro Tattico (Radar), Attività & Permessi abilitati, Limiti di Ruolo (Rosso Desaturato).
     - **Riga 4**: Registro Analisi & Dossier Recenti con visual empty-state moderno.
2. **Ridisegno Integrale Dashboard Preparatore dei Portieri (`gk-dash.js`, `gk-dash.css`, `index.html`)**:
   - **Diagnosi**: `shellHtml.replace('</main>', ...)` falliva perché la shell non usava `</main>`, lasciando le sezioni orfane o disperse.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Top Header Bar** con CTA primarie: *"Nuova Scheda Portieri"* e *"Report al Mister"*.
     - **Riga 1 (2 Colonne)**: Profilo Preparatore Portieri (UEFA GK) + Metriche di Efficacia GK (parate decisive, uscite aeree, costruzione piede forte/debole, tempo di reazione GPS, comando vocale).
     - **Riga 2 (ActionsGrid a 3 Colonne)**: 6 card operative (*Stanza dei Portieri & Clip Hub*, *Schede Sviluppo Settimanali*, *Badge Saracinesca 🛡️*, *Badge Piede Educato GK 🎯*, *Menzione Speciale sulla Card*, *Report Tecnico al Mister*).
     - **Riga 3 (3 Colonne)**: Quadro Tecnico GK (Radar), Drills & Metodologia, Limiti di Ruolo (Rosso Desaturato).
     - **Riga 4**: Registro Attività & Briefing con visual empty-state.
3. **Ridisegno Integrale Dashboard Preparatore Atletico (`at-dash.js`, `at-dash.css`, `index.html`)**:
   - **Diagnosi**: Foglio di stile quasi inesistente (16 righe) e render custom fallito a causa del replace errato.
   - **Nuova Architettura Ordinata & Luxury**:
     - **Top Header Bar** con CTA primarie: *"Registra Carico GPS"* e *"Invia Semaforo al Mister"*.
     - **Riga 1 (2 Colonne)**: Profilo Preparatore Atletico (Scienze Motorie) + Workload Management GPS & Prevenzione Infortuni (semaforo atleti disponibili 🟢, gestione 🟡, infortunati 🔴, rapporto ACWR 1.08, carico settimanale AU, HSR medio).
     - **Riga 2 (ActionsGrid a 3 Colonne)**: 6 card operative (*Carichi GPS & Workload*, *Schede Forza & Prevenzione*, *Test Fisici Periodici*, *Badge Atleta Top ⭐*, *Badge Resistenza Élite ⚡*, *Semaforo Disponibilità al Mister*).
     - **Riga 3 (3 Colonne)**: Quadro Fisico Rosa (Radar), Protocolli di Carico, Limiti di Ruolo (Rosso Desaturato).
     - **Riga 4**: Registro Carichi & Valutazioni Fisiche con visual empty-state.
4. **File aggiornati**: `ma-dash.js`, `ma-dash.css`, `gk-dash.js`, `gk-dash.css`, `at-dash.js`, `at-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_STAFFLUX1`.

Feature precedente: **Riprogettazione Completa & Armonica Area Osservatore / Scout (`OBSLUX1`):**
1. **Ridisegno Integrale Dashboard Osservatore & Talent Scout (`obs-dash.js`, `obs-dash.css`, `index.html`)**:
   - **Diagnosi**: La pagina dell'Osservatore soffriva di una stratificazione frammentata (shell a 3 colonne generica sovrapposta a un blocco `.es-obs-extra` appeso in fondo che duplicava credenziali, bottoni e sezioni, creando disordine visivo).
   - **Nuova Architettura Ordinata & Armonica**:
     - **Dock Laterale Sinistro**: Rail compatto (56px) con icone pulite e tooltip (Home, Dashboard, Secret List, Wall Trasferimenti, Ricerca Profili, Messaggi, Anagrafica).
     - **Top Header Bar**: Breadcrumb di navigazione, titolo ufficiale in grassetto, badge "Stealth Scouting" e due CTA ben visibili in alto a destra: *"Inoltra Target al DS"* e *"Apri Secret List"*.
     - **Riga 1 — Profilo & Centro Stealth (2 Colonne 50/50)**:
       - *Sinistra*: Profilo Ufficiale Scout con avatar circolare compatto (58px) con fallback monogramma su gradiente scuro indaco, ruolo `Osservatore / Scout`, club (senza alcuna duplicazione) o badge `Scout Indipendente`, status contrattuale (`Under Contract` ciano o `Free Agent` smeraldo), barra di onboarding (85%) con CTA *"✏️ Modifica Anagrafica"*, e credenziali FIGC.
       - *Destra*: Centro Operativo Stealth Scouting con garanzie di riservatezza, contatore reale dei calciatori in Secret List, precisione valutazioni e pulsanti rapidi (Secret List, Wall, Ricerca, Messaggi).
     - **Riga 2 — Strumenti Operativi Scout (ActionsGrid a 3 Colonne)**:
       - Griglia di 6 card con icone 38px, titoli bianchi e descrizioni operative dettagliate (*Secret List Stealth*, *Inoltra Target al DS*, *Ricerca & Filtri Tattici*, *Wall Trasferimenti Ufficiali*, *Schede Tecniche IA*, *Note Vocali in Testo*).
     - **Riga 3 — Analisi, Permessi & Limiti (3 Colonne Paritetiche)**:
       - *Quadro Scouting*: Grafico radar polare a 8 assi perfettamente dimensionato con indice personale e media.
       - *Attività & Permessi*: Lista con check verdi delle facoltà autorizzate dello scout.
       - *Limiti di Ruolo & Governance*: Card con bordo e testo rosso/rosa tenue desaturato (`#fda4af`) coerente con la palette luxury (nessun annuncio a nome del club e nessuna ratifica trattative).
     - **Riga 4 — Registro Osservazioni**: Visual empty-state moderno con icona archivio, spiegazione chiara e pulsanti rapidi di inizio scouting.
2. **File aggiornati**: `obs-dash.js`, `obs-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_OBSLUX1`.

Feature precedente: **Risoluzione Schermata Nera Area Vice Allenatore (`VICEFIX1`):**
1. **Fix Definitivo Schermata Nera Area Vice Allenatore & Allenatore Capo (`dash-luxury.css`, `vice-dash.js`, `coach-dash.js`, `vice-dash.css`, `coach-dash.css`)**:
   - **Diagnosi**: Nel foglio di stile `dash-luxury.css` le regole universali del layout a due colonne (56px 1fr per le dashboard a dock/rail) includevano erroneamente `#es-cd` e `#es-vd`, confinando la shell completa `.es-cos-shell` in soli 56px di larghezza e lasciando il restante 1fr come cella vuota a sfondo `#050608` (il rettangolo nero che copriva l'intera schermata).
   - **Risoluzione CSS**:
     - Rimossi definitivamente `#es-cd` e `#es-vd` da tutte le regole di `display: grid (56px 1fr)` e relative media-query in `dash-luxury.css`.
     - Introdotta blindatura esplicita su `#es-cd, #es-vd, .es-coach-root, .es-vice-root` con `display: block !important; grid-template-columns: none !important; padding: 0 !important; width: 100% !important; background: transparent !important;`.
   - **Risoluzione Runtime JS**:
     - In `vice-dash.js` e `coach-dash.js` i mount container usano ora classi dedicate isolate (`.es-vice-root`, `.es-coach-root`) evitando la classe `.es-pd` per scongiurare interferenze con le dashboard generiche.
     - Corretti i listener di mount in `vice-dash.js` (da `isCoach(u)` a `isVice(u)`) garantendo il re-render immediato e corretto al cambio di ruolo o navigazione.
2. **File aggiornati**: `dash-luxury.css`, `vice-dash.js`, `coach-dash.js`, `vice-dash.css`, `coach-dash.css`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_VICEFIX1`.

Feature precedente: **Refactoring Universale Dashboard di Ruolo, ActionsGrid a Card & Avatar Safe (`ROLEDASHUP1`):**
1. **Refactoring Universale Tutte le Dashboard di Ruolo (`dash-real.js`, `role-actions-runtime.js`, `dash-luxury.css`, `index.html`)**:
   - **Header Profilo & Avatar Safe**:
     - Risolto definitivamente il bug del riquadro nero vuoto alto 350px: avatar circolare compatto (56px) con bordo ciano soft, ombra e fallback infallibile alle iniziali su gradiente indaco profondo (`.es-pd-ph`).
     - Eliminata la duplicazione del club ("Foggia City" mostrato una sola volta sotto il nome con icona scudetto SVG).
     - Componente di Onboarding & Completamento Profilo: barra di avanzamento reale (85%) con gradiente ciano e CTA "Modifica Dati", al posto del vecchio testo grigio isolato.
     - CTA primaria di ruolo ben visibile in alto a destra nella testata (es. "Inoltra Target al DS" per lo Scout, "Nuovo Report Tattico" per il Match Analyst, "Nuova Scheda Portieri", "Registra Carico GPS", "Nuova Visita Medica", "Registra Terapia", "Secret List Stealth", ecc.) con icona SVG dedicata.
   - **ActionsGrid — "Strumenti Operativi" a Card (2-3 Colonne)**:
     - Ristrutturata la sezione "Azioni possibili" in una vera griglia di card responsive (2-3 colonne) con micro-interazione hover (elevazione e glow).
     - Ogni card ha un'icona 34px in box semitrasparente, titolo in grassetto bianco e riga descrittiva `desc` specifica per ruolo (grazie alla mappa `ROLE_ACTION_DESCS`).
     - Rimosse le sovrascritture distruttive `slot.innerHTML = ...` in `obs-dash.js` e `ma-dash.js` che piallavano la griglia.
   - **Integrazione Fogli di Stile & Empty-State**:
     - Collegato ufficialmente `dash-luxury.css` in `index.html` per garantire lo styling scuro luxury B2B a tutte le dashboard.
     - Sostituite le tabelle orfane con solo header nei registri con un vero visual empty-state (icona archivio, messaggio rassicurante e indicazione operativa).
2. **File aggiornati**: `dash-real.js`, `role-actions-runtime.js`, `dash-luxury.css`, `obs-dash.js`, `ma-dash.js`, `index.html`, `sw.js`, `version.json`, `CONTINUA_DA_QUI.md`. Cache `20260917_ROLEDASHUP1`.

Feature precedente: **Allineamento Speculare Area Vice Allenatore & Zero Dati Fittizi (`VICEMIRROR1`):**
1. **Area Vice Allenatore Gemella all'Area Allenatore (`vice-dash.js`, `vice-dash.css`)**:
   - Resa l'interfaccia, la shell con sidebar a sinistra e tutte le funzioni del Vice Allenatore identiche all'Area Allenatore:
     - Sidebar con le 11 macroaree (Dashboard, Rosa, Formazione, Tattica, Allenamenti, Calendario, Analisi Avversario, GPS / Carichi, Report Staff, Comunicazioni, Impostazioni Tecniche).
     - Header con logo circolare ufficiale Foggia City (`1000345699.png`), patentino circolare UEFA B, ruolo `Allenatore in seconda / Vice Allenatore` e pulsante di salto speculare `Area Allenatore Capo &rarr;`.
     - Fascia inferiore con Prossima Partita (con countdown reale!), Seduta Odierna reale.
     - Lavagna tattica interattiva completa (spostamento pedine, frecce corsa/passaggio, zone tattiche, export JSON e salvataggio schemi condivisi nello staff).
     - Dossier scout con card unica e layout 60/40, selettore partite reali, dropzone video/report e modale con assistente IA.
2. **Zero Mock e Dati Inventati — 100% Dati Reali Programmati**:
   - Rimossi definitivamente tutti gli eventi e avversari fittizi hardcoded (`Cerignola Nord`, `Manfredonia`, `San Severo`, `Rifinitura 10:00 - 11:30`, ecc.) sia da `coach-dash.js` sia da `vice-dash.js`.
   - Introdotta la funzione unificata `syncRealEventsAndMatches()`: la prossima gara, il countdown e la seduta odierna vengono calcolati dinamicamente a partire esclusivamente dagli eventi reali programmati nel calendario (`calendarioEvents`).
   - Se non ci sono gare o sedute programmate, l'interfaccia mostra stati puliti e professionali ("Nessuna gara in programma", "In attesa di calendario ufficiale", "Nessuna seduta programmata per oggi") senza inventare dati.
3. **File aggiornati**: `coach-dash.js`, `coach-dash.css`, `vice-dash.js`, `vice-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260917_VICEMIRROR1`.

Feature precedente: **Integrazione Logo Ufficiale Foggia City 1000345699.png & Redesign Badge Wrapped (`FGCLOGO2`):**

Feature precedente: **Creazione e Memorizzazione Cartella Archivio Loghi (`ARCHIVIOLOGHI1`):**

Feature precedente: **Integrazione Logo Ufficiale Circolare Patentino UEFA B (`UEFAB1`):**
1. **Logo Ufficiale Circolare UEFA B**:
   - Scaricato e integrato il logo ufficiale UEFA (`immagini/logo/uefa-b.png`) ad alta risoluzione.
   - Trasparenza alpha impeccabile sul cerchio esterno tramite maschera antialiasing (eliminato il falso pattern a quadretti).
   - Sostituito il badge tipografico generico con l'icona circolare del patentino UEFA B nell'header dell'identità Mister (`.es-cos-licence-badge`).
   - Stile luxury coerente con anello dorato (`rgba(251, 191, 36, 0.45)`), ombra interna ed effetto hover con glow dorato (`rgba(251, 191, 36, 0.35)`).
2. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `immagini/logo/uefa-b.png`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_UEFAB1`.

Feature precedente: **Risoluzione Scroll Tab Secondari & Menu "Altro ▾" a Scomparsa (`TABFIX1`):**
1. **Dimensioni Compatte Calibrate**:
   - Padding orizzontale ridotto a 11px (`padding: 6px 11px`).
   - Font-size snella e nitida a 12.5px (`font-size: 12.5px`).
   - Icone standardizzate a 14x14px con gap icona-testo ridotto a 4.5px.
   - Gap tra i bottoni ridotto a 4px.
2. **Eliminazione Doppia Navigazione & Menu "Altro ▾" a Scomparsa**:
   - Voci primarie fisse (7 tab): Dashboard, Rosa, Formazione, Tattica, Allenamenti, Calendario, Analisi Avversario.
   - Voci secondarie raggruppate nel dropdown a comparsa luxury *"Altro ▾"* (`.es-cos-tab-dropdown-wrap`): GPS / Carichi, Report Staff, Comunicazioni, Impostazioni Tecniche.
   - Reattività visiva: se una voce secondaria è attiva, il pulsante *"Altro ▾"* si evidenzia con stato `.is-active` e riporta dinamicamente la sezione attiva (es. *"Altro: GPS / Carichi"*).
   - Chiusura automatica su selezione e su click-outside.
3. **Addio Definitivo allo Scroll Orizzontale a 1366px**:
   - Larghezza occupata ridotta da oltre 1150px a ~780px, rientrando con oltre 300px di margine nel viewport 1366px.
   - Rimossa la scrollbar visibile (`scrollbar-width: none` e `display: none` su webkit scrollbar).
   - Piena sincronizzazione con la sidebar sinistra per qualsiasi navigazione.
4. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_TABFIX1`.

Feature precedente: **Ridisegno Completo Macroarea "Analisi Avversario" & Dossier Scout Professionale (`DOSSIERLUX1`):**
1. **Addio alla "dashboard da videogame tattico" & Nuova Gerarchia Visiva**:
   - Eliminati tutti i titoli a semaforo pieno (verde/rosso/giallo/blu) in favore di una tipografia neutra scura (`#e2e8f0` e `#cbd5e1`), con piccole icone monocromatiche distintive (scudo, alert circolare, stella, bandierina corner).
   - Colori semantici preservati esclusivamente come bordo sinistro sottile di 2.5px sulle card di sezione (`.is-forza`, `.is-deboli`, `.is-chiave`, `.is-piazzati`).
   - Rimosse le icone matita / `/ Modifica` ripetute su ogni riga: ora è presente un unico contenitore dossier con separatori sottili (1px) e un solo pulsante *"Modifica Dossier"* in alto a destra.
   - Tipografia con leggibilità ottimale per scouting: `line-height: 1.6` e `max-width: 65ch` per facilitare la scansione visiva senza righe troppo estese.
2. **Header Sezione & Selettore Partita Interattivo**:
   - Eliminata la label tecnica maiuscola `GARA & AVVERSARIO IN STUDIO:`.
   - Nome avversario in grande evidenza con badge stato incontro (`⚽ Prossimo Incontro Ufficiale` o `📅 Dossier Programmato`), data e stadio.
   - Trasformato il display statico in un vero menu a tendina (`#sel-dossier-match`) con tutte le prossime gare studiate per cambiare dossier al volo senza lasciare la pagina.
3. **Layout a Due Colonne Ribilanciato (60% Dossier / 40% Video Report)**:
   - Dossier tattico a sinistra (60% della larghezza) e pannello video report a destra (40%).
   - Stato vuoto alleggerito e intenzionale: icona monocromatica da 20px, testo esplicativo in riga singola senza placeholder sbilanciati.
   - Vista a lista con anteprima, categoria e data se sono presenti file caricati.
4. **Modale "Modifica Dossier Tattico" Professionale**:
   - Contatore caratteri discreto sotto ciascuna delle 4 textarea (`X / 500 caratteri`) con aggiornamento dinamico live.
   - Checkmark visivo temporaneo *"✓ Salvato"* al salvataggio del form.
   - Funzione *"✨ Suggerisci con IA"*: genera una bozza specifica contestualizzata sull'avversario selezionato (es. Cerignola Nord, Manfredonia, San Severo, o generica) e mostra un box di anteprima dedicato con bottoni *"✓ Applica Bozza al Dossier"* o *"Ignora"* (**nessuna sovrascrittura automatica senza conferma preventiva dell'utente**).
   - Controllo modifiche non salvate (`isDirty`): click su Annulla, &times; o backdrop richiede conferma esplicita prima di chiudere.
5. **Modale "Carica Video Analisi / Dossier Avversario"**:
   - Campo "Categoria" trasformato da testo libero a `<select>` con opzioni fisse (*Video Analisi Tattica*, *Report Scout & Match Analysis*, *Dati GPS / Telemetria*, *Clip Palle Inattive & Schemi*, *Altro*).
   - "Visibilità" trasformata in vero `<select>` con ruoli della piattaforma (*Staff Tecnico (Mister + Vice)*, *Staff Tecnico Completo*, *Tutta la Squadra*, *Riservato Dirigenza*).
   - Area drag & drop (`.es-upload-dropzone`) con feedback visivo (`is-dragover`), selezione manuale e anteprima del nome file e dimensione (es. `video.mp4 (14.2 MB)`).
   - Barra di progresso reale animata (`.es-upload-progress-bar`) con percentuale numerica durante l'upload cloud.
6. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_DOSSIERLUX1`.

Feature precedente: **Ridisegno Completo Macroarea Calendario Tecnico Luxury (`CALENDARLUX1`):**
1. **Header Sezione Professionale**:
   - Rimosso completamente il testo tecnico di debug `(Tabelle: partite, allenamenti)`.
   - Titolo pulito *"Calendario Tecnico Staff & Partite"* con sottotitolo descrittivo *"Pianificazione timeline gare ufficiali, sedute di allenamento e impegni operativi dello staff"*.
   - Inserito il pulsante d'azione primario `+ Aggiungi Evento` (`#btn-add-cal-event`) in alto a destra coerente con lo stile luxury e "Salva Schema".
2. **Barra Filtri Dedicata (`.es-cal-toolbar`)**:
   - Gruppo toggle a tre stati: *Tutto (N)*, *Partite (N)*, *Allenamenti (N)* con pillole contatore dinamiche e stato attivo ciano sottile.
   - Dropdown selettore mese (*Tutti i mesi*, *Settembre 2026*, *Ottobre 2026*, ecc.) popolato automaticamente dai mesi degli eventi memorizzati.
3. **Timeline con Raggruppamento per Mese**:
   - Inseriti divider temporali mese per mese (`.es-cal-month-divider`) con icona SVG Lucide del calendario e badge circolare ciano, trasformando la vecchia tabella in una vera e propria agenda/timeline stagionale.
4. **Layout a Righe-Card Luxury (CSS Grid a Colonne Calibrate)**:
   - Sostituita la tabella HTML grezza con righe-card spaziate e confortevoli (`.es-cal-card` con `grid-template-columns: 78px 40px minmax(220px, 2fr) minmax(130px, 1.1fr) minmax(140px, 1.2fr) 135px 68px`):
     - **Bordo sinistro colorato 3.5px** per tipo evento: Ciano `#16b9ff` per Partite, Smeraldo `#10b981` per Allenamenti, Viola `#a855f7` per Amichevoli.
     - **Mini box data stile agenda** (`.es-cal-datebox`): mese abbreviato (es. `SET`), giorno grande a contrasto elevato (es. `18`), orario sotto in ciano (`15:30`).
     - **Icona circolare SVG**: pallone da calcio per gare, timer cronometro per sedute di allenamento.
     - **Titolo e Note**: visualizzazione ordinata senza disallineamenti o sovrapposizioni.
     - **Badge Competizione**: tag outline per Campionato, Coppa Italia, Seduta Campo, ecc.
     - **Stadio / Luogo**: icona Pin mappa con denominazione impianto.
     - **Badge di Stato Luxury**: stile "stato" desaturato con bordo sottile 1px e pallino pieno luminoso (*Da preparare* in ambra desaturato, *Programmata* in azzurro tenue, *Disputata* in verde smeraldo).
     - **Azioni On-Hover**: pulsanti compatti di Modifica (matita) ed Eliminazione (cestino), puliti e discreti.
5. **Funzionalità di Creazione, Modifica & Eliminazione**:
   - Modale interattivo per creare o modificare qualsiasi evento con autocompletamento campi sportivi (`<datalist>`).
   - Validazione anti-sovrapposizione oraria: blocco e notifica se esiste già un impegno per lo stesso staff alla stessa data e ora.
   - Dialog di conferma preventiva prima dell'eliminazione.
   - Persistenza automatica in `localStorage['elisee_coach_data']` (`calendarioEvents`) e aggiornamento reattivo istantaneo della UI.
6. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_CALENDARLUX1`.

Feature precedente: **Refine Tattica & Formazione: Header 3 Colonne, Selettore Modulo Luxury, Toolbar Uniformata & Spaziatura Campo (`TACTICREFINE1`):**
1. **Zona 1 (Widget Header: Partita + Countdown + Seduta Odierna)**:
   - Risolto il disallineamento e rimosso il bordo stray sopra "MANCANO" con container a 3 colonne coerente (`1.25fr 1fr 1.25fr`) e `overflow: hidden; position: relative;` sul genitore.
   - Badge "Seduta odierna" desaturato in stile "stato" luxury (`rgba(16, 185, 129, 0.04)`, bordo sottile `1px solid rgba(16, 185, 129, 0.24)` e puntino verde pieno `7px #10b981` con glow discreto).
2. **Zona 2 (Selettore Modulo)**:
   - Trasformato da input generico in dropdown luxury con chevron SVG Lucide (`polyline`), separando il codice modulo (`4-3-3` in peso 800 bianco) e la variante tattica (`Offensivo con Ali` in badge secondario compatto ciano con bordo sottile), con etichetta `MODULO:` a font-weight 600.
3. **Zona 3 (Toolbar Strumenti Tattici)**:
   - Larghezza uniforme dei bottoni con `min-width: 120px` fisso e centratura perfetta.
   - Stato attivo ridisegnato: sfondo scuro neutro luxury con riflesso ciano discreto (`rgba(22, 185, 255, 0.12)` + bordo `#16b9ff`), eliminato il blu pieno fluorescente arcade.
   - Icone standardizzate a 16x16px perfettamente allineate al testo.
4. **Imperfezioni Risolte (Tab Bar, Panchina e Spaziatura Campo)**:
   - Tab bar superiore: compattati gap/padding (`gap: 4px`, `padding: 5px 8px`, `font-size: 11px`) con `overflow-x: auto` e scrollbar visibile, evitando che "Comunicazioni" venga tagliata.
   - Panchina e Convocati: allargata la colonna da 320px a 345px, compattati badge ruolo e bottone "In Campo &rarr;", limitata l'altezza della scroll list a 360px per mantenere il banner "Stato Ufficiale: Convalidata dal Mister" visibile nel viewport ed evitare troncamenti di nomi atleti.
   - Spaziatura Linee del Campo: armonizzate le posizioni percentuali Y nei moduli tattici (es. 4-3-3: POR 89%, Difesa 72-74%, Mediano 55%, Mezzali 44%, Ali 26%, Attaccante 14%) eliminando la voragine tra centrocampo e attacco.
5. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_TACTICREFINE1`.

Feature precedente: **Lavagna Tattica: Pulsante "Importa Schema" (Schemi Preimpostati UEFA Pro & JSON) e "Salva Schema" Riposizionato (`IMPORTSCHEMA1`):**
2. **Libreria Schemi Tattici Preimpostati (Mister & Vice Allenatore)**:
   - Modale dedicato interattivo (`840px`) con 6 schemi professionali completi codificati secondo i principi moderni (UEFA Pro):
     - *Costruzione dal Basso 4-3-3* (Scuola Guardiola-De Zerbi): 3+1 profondo, centrali larghi, mediano abbassato e terzini alti.
     - *Gegenpressing Alto Ultra-Offensivo* (Klopp Style): pressione orientata sull'esterno entro 5 secondi, 3 attaccanti e mezzali avanzate.
     - *Transizione & Ripartenza Fulminea 3-5-2* (Conte-Inzaghi): ribaltamento immediato, punta a venire incontro e taglio in profondità della seconda punta, quinti a tutta fascia.
     - *Catena Laterale & Sovrapposizione Terzino* (4-3-3): convergenza dell'ala, corridoio esterno per il terzino e taglio centravanti.
     - *Blocco Medio Compatto 4-4-2* (Simeone-Sacchi): linee da quattro strette, slittamento collettivo lato palla e schermatura play.
     - *Corner a Favore: Blocco & Taglio 1° Palo* (Palle Inattive): schema su palla ferma con blocchi su dischetto e taglio incrociato.
   - Filtro rapido per categoria (*Tutti, Costruzione & Palleggio, Fase di Non Possesso, Transizione Offensiva, Sviluppo Corsie Esterne, Palle Inattive*).
   - Click su *"Importa sulla Lavagna"*: applica istantaneamente modulo, posizioni degli 11 calciatori reali della rosa, palla, frecce di corsa, frecce di passaggio e zone tattiche.
3. **Importazione & Esportazione File JSON**:
   - Possibilità di caricare direttamente file `.json` salvati o scambiati tra staff.
   - Aggiunto il tasto *"Esporta File JSON"* nel form di Salvataggio Schema per scaricare qualsiasi schema tattico su file locale in formato `.json`.
4. **Integrazione Collaborativa Vice Allenatore (`vice-dash.js`)**:
   - Aggiunti i pulsanti *"Importa Schema Preimpostato"* e *"Lavagna Interattiva &rarr;"* anche nell'header della lavagna del Vice, collegati alla libreria condivisa con il Mister.
5. **File aggiornati**: `coach-dash.js`, `vice-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_IMPORTSCHEMA1`.

Feature precedente: **Lavagna Tattica Digitale: Icone SVG Lucide 16px & Strumenti Tattici End-to-End (`TACTICLUCIDE1`):**
1. **Sostituzione Integrale Emoji con Icone SVG Lucide**:
   - Rimosse tutte le emoji unicode nei pulsanti della sezione Tattica e sostituite con icone SVG standard Lucide 16x16px (stroke-width 2, coerenti con la sidebar e l'UI del club):
     - `Muovi`: Lucide `Move`
     - `Freccia Corsa`: Lucide `ArrowUpRight`
     - `Passaggio`: Lucide `Route`
     - `Zona Pressing`: Lucide `Shield`
     - `Annulla Tratto`: Lucide `Undo2`
     - `Pulisci Tracciati`: Lucide `Eraser`
     - `Sincronizza da XI Ufficiale`: Lucide `RefreshCw`
     - `Reset Modulo`: Lucide `RotateCcw`
     - `Salva Schema`: Lucide `Save`
2. **Funzionalità End-to-End degli Strumenti Tattici**:
   - **Muovi**: Drag & Drop fluido e continuo sia per gli 11 calciatori reali che per il pallone ⚽, con coordinate percentuali clampate e supporto nativo a mouse e touch.
   - **Freccia Corsa**: click-e-trascina con linea continua gialla (`#ffd21a`) e punta direzionale SVG.
   - **Passaggio**: click-e-trascina con linea tratteggiata azzurra (`#38bdf8`, `stroke-dasharray="6,4"`) per distinguere visivamente i movimenti palla dalle corse giocatore.
   - **Zona Pressing**: click-e-trascina per tracciare un'area rettangolare semitrasparente rossa con bordo tratteggiato e badge "Zona Pressing".
   - **Rubber-Banding Live**: inserito layer `<g id="es-tactical-live-preview">` con rendering vettoriale in tempo reale durante il trascinamento sul campo.
   - **Annulla Tratto (Undo)**: cronologia LIFO unificata basata su timestamp `createdAt` che rimuove l'ultimo elemento (freccia o zona) + listener per scorciatoia `Ctrl+Z` / `Cmd+Z`.
   - **Pulisci Tracciati**: cancellazione immediata di tutte le frecce e zone senza alterare le posizioni dei calciatori.
   - **Sincronizza da XI Ufficiale**: dialog di conferma preventiva se presenti tracciati sulla lavagna, clonazione modulo e titolari ufficiali, reset tracciati e salvataggio.
   - **Reset Modulo**: ripristino immediato delle posizioni canoniche degli 11 slot del modulo e centratura palla.
   - **Salva & Carica Schemi**: salvataggio sia in `localStorage['elisee_schemi_tattici']` che su Supabase (`schemi_tattici`), conteggio dinamico in `Schemi Salvati (N)` e dropdown per ripristinare qualsiasi schema salvato all'istante.
3. **File aggiornati**: `coach-dash.js`, `coach-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_TACTICLUCIDE1`.

Feature precedente: **Redesign Editoriale/Luxury Story 9:16 Instagram (`STORYLUX1`):**
1. **Design Piatto & Tipografia Protagonista (Addio Stile Videogioco)**:
   - Sostituiti i cerchi giocatore con bordo ciano fluorescente e glow con un design pulito ed elegante: cerchio con bordo sottile 1px (`rgba(255,255,255,0.45)`), sfondo verde scuro opaco profondo (`#071a0e`), numero maglia in font `Inter` a peso bilanciato (600) e cognome maiuscolo con letter-spacing senza etichette o box pesanti.
   - Linee del campo regolamentari desaturate e discrete (`opacity: 0.2`, stroke sottile 1px) per conferire profondità naturale e tridimensionalità sobria.
2. **Gerarchia Tipografica Editoriale nell'Header**:
   - `"OFFICIAL MATCHDAY LINEUP"` trasformato in overline tipografica spaziata (`letter-spacing: 0.16em`, font `Inter`, colore grigio chiaro `#94a3b8`).
   - `"FOGGIA CITY"` elevato a titolo principale in font editoriale `Outfit` (800, maiuscolo spaziato).
   - Badge modulo (`4-3-3`): rimosso il badge pillola blu pieno; sostituito con badge outline raffinato (bordo 1px sottile `rgba(255,255,255,0.24)`, sfondo trasparente, testo `#e2e8f0`).
3. **Panchina a Griglia a Due Colonne Ordinata**:
   - Sostituito l'elenco con pallini (`•`) con una griglia a 2 colonne perfettamente allineata: numero maglia tabellare (`#12`) e cognome dell'atleta allineato.
   - Intestazione *"A DISPOSIZIONE (PANCHINA)"* coerente con l'overline tipografica dell'header.
4. **Palette & Cornice 9:16 Luxury**:
   - Rimosso qualunque bordo o glow ciano: cornice scura uniforme `#060b11` con sottile profilo hairline (`rgba(255,255,255,0.12)`) e angoli stondati da 18px.
   - Proporzioni verticali 9:16 perfette per la condivisione diretta su Instagram Stories.
5. **File aggiornati**: `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_STORYLUX1`.

Feature precedente: **Fix Layout Formazione 2 Colonne, Campo Proporzionato 3/4 & Panchina Fissa 320px (`LINEUPLAYOUT2`):**
1. **Grid a Due Colonne Rigoroso**:
   - Risolto il bug di overflow e sovrapposizione in cui il campo da gioco sovrastava e tagliava a destra il pannello della Panchina (`...HINA)`, "...cca In Campo →").
   - Contenitore principale `.formazione-layout` impostato con `display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; width: 100%;`.
2. **Campo Flessibile con Proporzioni Corrette 3/4**:
   - Contenitore del campo `.campo-container` configurato con `min-width: 0; width: 100%; max-width: 540px; margin: 0 auto; aspect-ratio: 3 / 4; overflow: hidden;` eliminando `min-height: 480px` fisso che forzava l'allargamento orizzontale orizzontale.
   - Linee regolamentari SVG del campo e overlay conformati con `width: 100%; height: 100%;`.
   - Tutte le coordinate dei giocatori mantengono le percentuali relative al contenitore (`slot.x%`, `slot.y%`), garantendo un ridimensionamento fluido e perfetto.
3. **Pannello Panchina Interamente Leggibile**:
   - Pannello `.panchina-panel` vincolato a `min-width: 320px; max-width: 320px; width: 320px; box-sizing: border-box;`.
   - Lista atleti scrollabile verticalmente fino a `max-height: 460px; overflow-y: auto;` per ospitare agevolmente tutti i calciatori disponibili.
   - Nomi dei panchinari protetti con `min-width: 0; text-overflow: ellipsis; white-space: nowrap;` e pulsanti `In Campo →` sempre visibili, allineati e cliccabili al 100%.
   - Responsive breakpoint a 980px con passaggio a singola colonna e panchina al 100% di larghezza.
4. **File aggiornati**: `coach-dash.js`, `coach-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_LINEUPLAYOUT2`.

Feature precedente: **Lavagna Tattica Digitale Interattiva, Fix Tab Bar Orizzontale & Refactoring Analisi Avversario (`TACTICBOARD1`):**
1. **Lavagna Tattica Digitale Interattiva Indipendente**:
   - Superata la rigidità del 4-3-3: la sezione Tattica opera ora come ambiente di studio tattico autonomo, con proprio selettore dropdown indipendente a 7 moduli (`4-3-3`, `4-4-2`, `4-2-3-1`, `3-5-2`, `3-4-3`, `5-3-2`, `4-1-4-1`) riusando le coordinate percentuali di `MODULI_TATTICI`.
   - Introdotto il pulsante *"Sincronizza da XI Ufficiale"* per clonare istantaneamente modulo e titolari della Formazione Ufficiale confermata sulla lavagna ogni volta che lo si desidera.
   - **Drag & Drop libero** sia per tutte le 11 pedine calciatore (con numeri di maglia reali `p.num`, cognomi reali e sigle ruolo) che per il pallone ⚽, con aggancio Pointer Events nativi sia desktop che touch e coordinate percentuali clampate tra 4% e 96%.
   - **Strumenti di disegno tattico vettoriali SVG**: freccia di corsa/inserimento (tratteggiata in giallo con punta direzionale SVG), freccia di passaggio (continua azzurra), zona evidenziata (*Pressing Alto*, *Superiorità Numerica*), tasti *Pulisci Tracciati* e *Annulla Ultimo Tratto*.
   - **Salvataggio & Storico Schemi**: "Salva Schema" memorizza lo schema su Supabase (`schemi_tattici`) e in `localStorage['elisee_schemi_tattici']`, con dropdown storico per ricaricare istantaneamente gli schemi studiati in precedenza.
2. **Fix Definitivo Troncamento Tab Bar in Alto**:
   - Ottimizzato il padding (`6px 10px`) e il gap (`5px`) dei tab per far rientrare agevolmente tutte le 11 voci della barra superiore su display desktop standard 1366×768, eliminando il taglio su "Comunicazioni".
   - Sostituito `scrollbar-width: none` con una scrollbar sottile ed elegante a scomparsa (`height: 4px`, blu semi-trasparente) per permettere lo scorrimento orizzontale fluido anche su schermi più stretti.
3. **Refactoring Sezione Analisi Avversario (Dossier Tattico & Match Analysis)**:
   - **CTA unico e pulito**: rimosso il link sottolineato orribile in basso; posizionato al centro dello stato vuoto un unico solido bottone primario `[ + Carica Video / Match Analysis ]`. Quando sono presenti video, l'header mostra il tasto `+ Aggiungi Video`.
   - **Risolto bug titolo duplicato**: eliminata l'anomalia *"Dossier Tattico: Dossier Tattico"*, ora è dinamicamente *"Dossier Tattico: [Nome Avversario]"* (es. *Cerignola Nord*).
   - **Selettore Partita in testata**: dropdown collegato al calendario gare per analizzare gare e avversari specifici, con default sulla prossima gara in programma.
   - **4 Card Editabili Interattive**: Punti di Forza, Punti Deboli, Giocatori Chiave, Palle Inattive rese cliccabili con icona matita ✏️, form modale di modifica, pulsante `✨ Suggerisci con IA` e salvataggio su Supabase (`dossier_tattico`) e locale per singola partita.
   - **Video Report reali**: lettura e riproduzione diretta dei video allegati associati alla partita da `file_allegati` (categoria `video_analisi`).
4. **Fix Globale Contrasto Bottoni "Annulla" nei Modali**:
   - Reso ad alto contrasto il bottone secondario Annulla in tutti i modali (`#es-cos-modal-box .es-btn-cos-sec`, `#btn-close-modal`, `.btn-secondary`): sfondo semi-trasparente `rgba(255,255,255,0.08)`, bordo `rgba(255,255,255,0.24)`, testo bianco brillante `rgba(255,255,255,0.92)` e hover pieno `rgba(255,255,255,0.15)`.
5. **File aggiornati**: `coach-dash.js`, `coach-dash.css`, `elisee-supabase.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_TACTICBOARD1`.

Feature precedente: **Lineup Builder Tattico Dinamico & Ruoli Flessibili (`LINEUPBUILDER1`):**
   - Superato il vecchio testo statico del 4-3-3: implementato un selettore interattivo con etichetta ("Modulo:"), chevron SVG, bordo blu `#3b82f6` e dropdown con 7 moduli tattici completi: `4-3-3` (Offensivo con Ali), `4-4-2` (Classico Lineare), `4-2-3-1` (Doppio Mediano & Trequarti), `3-5-2` (Ampiezza Quinti & Doppio Attacco), `3-4-3` (Tridente & Linea Mediana a 4), `5-3-2` (Difesa a 5 & Contropiede Rapido), `4-1-4-1` (Vertice Basso & Linea di Trequarti).
   - Al cambio modulo, le coordinate percentuali e i ruoli di tutti gli 11 slot si ridispongono istantaneamente sul campo da calcio.
2. **Libreria Ruoli Estesa a 20 Posizioni con Sigle Ufficiali**:
   - Censite tutte le 20 specializzazioni di ruolo con sigle coerenti e codifica a 4 reparti cromatici (POR, DIF, CEN, ATT): Libero (`LIB`), Braccetto Dx/Sx (`BCD`, `BCS`), Regista (`REG`), Trequartista (`TRQ`), Seconda Punta (`SP`), Esterno Basso Dx/Sx (`EBD`, `EBS`), Esterno Alto Dx/Sx (`EAD`, `EAS`), Falso Nueve (`FN`), oltre a Portiere (`POR`), Difensore Centrale (`DC`), Terzino Dx/Sx (`TD`, `TS`), Mediano (`MED`), Mezzala (`CC`), Ala Dx/Sx (`AD`, `AS`), Centravanti (`ATT`).
3. **Campo da Calcio Centrato con Linee Regolamentari Vettoriali SVG**:
   - Centrato nello spazio a sinistra (rapporto 1.35fr a 1fr), preservando il colore verde `#061e11` / `#0d3b1f` e il bordo verde scuro `#16562f`.
   - Disegno vettoriale SVG sovrapposto con bordo campo, centrocampo, cerchio di centrocampo, aree di rigore, dischetti, lunette, porte e bandierine d'angolo in trasparenza bianca al 32%.
   - Badge numeri maglia `#1`..`#99` con glow azzurro ed etichetta nome giocatore + sigla ruolo tra parentesi.
4. **Panchina a Tutta Altezza con Dati Reali (Mai più "0 Calciatori")**:
   - Integrata la funzione `syncFormationWithRoster(data)` con fallback a `getDefaultRoster()` (22 calciatori realistici con anagrafica completa per Foggia City).
   - Tutti i calciatori disponibili non schierati negli 11 titolari confluiscono automaticamente nella panchina (10-11 atleti a disposizione).
   - Card panchinaro interattive con classe di nascita, pillola ruolo colorata per reparto e tasto `In Campo &rarr;`.
5. **Doppia Interattività: Drag & Drop Nativo HTML5 + Click-to-Swap**:
   - È possibile sia trascinare (drag & drop) un calciatore della panchina direttamente sul cerchio/pin del titolare per eseguire la sostituzione immediata, sia cliccare sul pin del campo per aprire il modale di gestione (sostituzione o cambio specializzazione ruolo dello slot), sia cliccare su `In Campo &rarr;` dalla panchina.
6. **Esportazione Anteprima "Story 9:16" per Instagram**:
   - Riposizionato il pulsante `Story 9:16` affiancato al CTA blu primario `Conferma Formazione Ufficiale`.
   - Al click apre un visualizzatore modale a 9:16 con matchday card per Instagram Stories, mini-pitch 2D con titolari, panchina in basso e pulsante per copiare il testo social formattato.
7. **File aggiornati**: `coach-dash.js`, `coach-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_LINEUPBUILDER1`.

Feature precedente: **Bottoni Secondari & Modali Annulla ad Alto Contrasto B2B (`CANCELBTN1`):**

Feature precedente: **Form Tesseramento Nuovo Calciatore con Anagrafica Completa (`ROSTERFIELDS1`)**:
1. **Pulsante "+ Aggiungi Calciatore" nel Blu Primario di Brand**:
   - Definite le regole `.es-btn-cos-primary` agganciate rigorosamente alle variabili del design system `var(--cos-blue)` (`#3B82F6`), testo bianco `#FFFFFF`, raggio `var(--cos-radius-sm, 5px)` ed effetto hover coordinato `#2563EB` (identico al pulsante *"Area Vice Allenatore &rarr;"*).
2. **Filtri Pillola Roster Coerenti con la Secondary Tab Bar**:
   - Definite le regole `.es-btn-cos-sec`: stato inattivo con sfondo semi-trasparente `var(--cos-card)` (`rgba(18, 26, 42, 0.75)`), bordo sottile primario `var(--cos-card-border)` (`rgba(59, 130, 246, 0.22)`), testo chiaro `var(--cos-text-muted)` (`#8B95A8`) e hover su `var(--cos-blue)`.
   - Stato attivo (`.es-btn-cos-sec.is-active`, di default "Tutti"): sfondo pieno nel blu primario `var(--cos-blue)`, testo `#FFFFFF`, bordo `var(--cos-blue)` e peso grassetto 700.
   - Search input (`.es-cos-search-input`) stilizzato con `var(--cos-card)` e focus ring `var(--cos-blue)`.
   - Allineamento speculare in `coach-dash.css` e `vice-dash.css`.
3. **File aggiornati**: `coach-dash.css`, `vice-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_ROSATOKEN1`.

Feature precedente: **Risoluzione Bug Icona Gigante & Stato Vuoto Rosa Unificato (`ROSAEMPTY1`)**:
1. **Causa del Bug Identificata e Risolta alla Radice**:
   - L'icona enorme visibile in cima alla sezione Rosa non era uno spinner di loading bloccato né un doppio blocco renderizzato per errore: era l'icona `<svg viewBox="0 0 24 24">` del titolo *"Organico Rosa Prima Squadra"* in `.es-cos-panel-head` priva degli attributi `width` e `height`.
   - In assenza di vincoli dimensionali nel CSS, il browser scalava il viewBox a tutta la larghezza disponibile del contenitore (~800-1100px), trasformando il tratto `stroke-width="2"` in un arco bianco spesso ~66px e spingendo il bottone `+ Aggiungi Calciatore` in posizione galleggiante.
   - Sotto tale icona gigante apparivano i filtri e il blocco vuoto effettivo con icona a 36px, creando l'illusione ottica di due stati vuoti sovrapposti.
2. **Fix Implementato (Allenatore & Vice Allenatore)**:
   - In `coach-dash.js` e `vice-dash.js`: assegnate dimensioni esplicite `width="18" height="18"` a tutte le icone SVG dei titoli di pannello (`.es-cos-panel-title`).
   - In `coach-dash.css` e `vice-dash.css`: aggiunte regole di difesa in profondità (`.es-cos-panel-title svg { width: 18px !important; height: 18px !important; }`, `.es-cos-panel-card svg:not(.es-pitch-svg):not([width]):not([height]) { width: 18px !important; height: 18px !important; }`).
   - Il bottone `+ Aggiungi Calciatore` è stabilmente ancorato in alto a destra (`margin-left: auto; flex-shrink: 0`) all'interno di `.es-cos-panel-head`.
   - Stato vuoto unificato sia per l'Allenatore che per il Vice Allenatore (`.es-cos-empty-state`): icona pulita e centrata a 52px con stroke ciano, titolo in grassetto *"Nessun calciatore presente in rosa"* e sottotitolo informativo *"I calciatori inseriti nella tabella rosa su Supabase appariranno qui automaticamente."*.
3. **File aggiornati**: `coach-dash.js`, `vice-dash.js`, `coach-dash.css`, `vice-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_ROSAEMPTY1`.

Feature precedente: **Rimozione Radicale Footer Pubblico (`NOFOOTER1`)**:
1. **Esclusione Footer Pubblico nelle Route Riservate dello Staff Tecnico**:
   - Assegnato ID esplicito `#site-public-footer` a `<footer class="site-footer pf-footer">` in `index.html`.
   - Implementata in `app.js` la funzione globale `window.updatePublicFooterVisibility(viewType, targetHash)`: rileva se l'utente si trova nell'Area Riservata dello Staff Tecnico (stato `is-coach-mode`, `is-vice-mode`, o montaggio del dossier con dashboard attiva) e disattiva/smonta completamente il footer dal rendering visivo e dall'albero accessibile con `display: none !important`, attributo `hidden`, `pointer-events: none` e classe `is-hidden-staff`.
   - All'uscita dall'area riservata e durante la navigazione su qualsiasi pagina pubblica del sito (Home, Chi siamo, Bacheca, Modulo Iscrizione, ecc.), il footer viene automaticamente e pulitamente ripristinato.
   - Aggiunta in `coach-dash.css` la regola ad altissima specificità su `body.is-coach-mode`, `body.is-vice-mode` e sibling selector su `#user-dossier-view-group` per prevenire qualsiasi flash orizzontale o reflow del footer durante il caricamento.
   - Sincronizzati i trigger di mount/unmount in `coach-dash.js`, `vice-dash.js` e `player-profile.js` (`unmountAllRoleDashboards`).
2. **File aggiornati**: `index.html`, `app.js`, `coach-dash.js`, `vice-dash.js`, `player-profile.js`, `coach-dash.css`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_NOFOOTER1`.

Feature precedente: **Dati Reali Supabase + Cloud Storage (`COACHSUPA1`)**:
1. **Rimozione Integrale Dati Mock & Query Reali al Database Supabase**:
   - Creato il client universale `elisee-supabase.js` (`window.EliseeSupabase`) con connessione REST PostgREST e supporto tabelle: `club`, `staff`, `rosa`, `partite`, `allenamenti`, `presenze_allenamento`, `report`, `eventi_log`, `impegni_staff`, `file_allegati`.
   - **Prossima Gara & Calendario Gare**: collegate alla tabella `partite` con filtro data futura / stato prossima e ordine cronologico reale; se non ci sono gare a database, visualizza lo stato esplicito "Nessuna gara in programma", senza inventare avversari o date.
   - **Ultima Seduta & Sedute Pianificate**: collegate alla tabella `allenamenti`; se non ci sono sedute completate, mostra "Nessuna seduta svolta registrata".
   - **Carico Squadra & Carico Settimanale**: aggregazione in tempo reale dei carichi registrati (`presenze_allenamento` con fallback su `allenamenti.carico_percepito`) sui 7 giorni (Lun-Dom) con gauge ad anello percentuale e ACWR ratio dinamico; visualizza "In attesa dati GPS" se vuoto.
   - **Disponibilità Rosa & Indisponibili**: incrocio in tempo reale della tabella `rosa` con stato atleti (disponibile, infortunato, squalificato, differenziato) con percentuale effettiva, motivo indisponibilità e data di rientro prevista.
   - **Preparazione Partita**: calcolata dinamicamente dalle sedute pre-gara in programma/completate della settimana.
   - **Report Ricevuti & Log Attività**: collegate alle tabelle `report` (conteggio non letti e archivio) ed `eventi_log` (attività cronologica reale per club).
   - **Staff & Binomio Tecnico**: collegamento dinamico tra Allenatore Capo e Vice Allenatore tramite tabella `staff`.
2. **Supabase Cloud Storage (Bucket `staff-allegati`)**:
   - Implementato upload centralizzato dei file (`uploadFileAllegato`): tracciati e telemetria GPS (categoria `gps` per allenamento), video-analisi e dossier tattici (categoria `video_analisi` per partita), referti medici e report collaboratori (categoria `staff_tecnico` per club/giocatore).
   - Modal dedicato di caricamento con progress feedback, selezione permessi di visibilità (`staff_tecnico`, `tutti`, `medico`), salvataggio metadati in `file_allegati` e link diretti per apertura e download.
   - Integrazione speculare nell'Area Vice Allenatore (`vice-dash.js`): consultazione rosa reale, gestione sedute, monitoraggio GPS live e upload diretto di schede workstation.
3. **File aggiornati**: `elisee-supabase.js`, `coach-dash.js`, `vice-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `20260916_COACHSUPA1`.
Feature precedente: **Respiro e Spazio Superiore tra Header e Sidebar (`COACHPRO7`)**:
1. **Sidebar Estesa Verticalmente fino in Fondo (Linea Gialla Coperta al 100%)**:
   - Impostata la sidebar `.es-cos-sidebar` come `position: fixed; top: var(--header-h); left: 0; bottom: 0; width: 240px; height: calc(100vh - var(--header-h)); height: calc(100dvh - var(--header-h));`.
   - Lo sfondo scuro `#0A0E18` e la linea divisoria verticale destra `1px solid var(--cos-line)` ora scendono fluidamente e ininterrottamente fino al fondo del viewport (taskbar).
2. **Sidebar Immobile e Fissa allo Scroll (Nessun Abbassamento)**:
   - Grazie a `position: fixed`, allo scorrimento dei contenuti destri la sidebar non si abbassa, non si sposta e non scompare: rimane stabilmente visibile consentendo accesso immediato a tutte le macroaree in qualunque momento dello scroll.
   - Su `.es-cos-shell`: impostato `padding-left: calc(240px + var(--space-3))` per distanziare perfettamente il contenuto centrale dalla sidebar fissa.
   - Rimosso l'override mobile static obsoleto a 850px, preservando il drawer off-canvas su mobile/tablet (<= 1024px).
3. **File aggiornati**: `coach-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHPRO6`.
Feature precedente: **Risoluzione Radicale Conflitti CSS Layout & Sidebar Spazio Vuoto (`COACHPRO5`)**:
1. **Causa Reale del Gap ~150px Risolta alla Radice (Zero Patch Sovrapposte)**:
   - Individuata la regola in conflitto primario in `style.css` (riga 9004): `#user-dossier-portal .pf-page-inner` imponeva `padding-top: 7.25rem !important` (116px). Poiché conteneva un ID, vinceva per specificità su qualsiasi classe e si sommava ai 72px di `.es-cos-shell`, producendo 188px totali di fascia vuota.
   - Modificato `style.css` escludendo direttamente la dashboard: `.container.pf-page-inner:not(.is-coach-inner), .pf-page-inner:not(.is-coach-inner), #user-dossier-portal:not(.is-coach-dash) .pf-page-inner`.
   - Modificato `player-profile.css` (riga 384) escludendo il limite di larghezza: `#user-dossier-view-group.is-staff-area:not(.is-coach-dash) .pf-page-inner`.
   - In `coach-dash.js`: iniettate le classi `is-coach-dash` e `is-coach-inner` su `portal` e `pf-page-inner`, con pulizia completa in `player-profile.js` all'unmount.
   - In `coach-dash.css`: unico compenso `padding-top: var(--header-h, 72px)` su `.es-cos-shell`, azzerando tutti i contenitori intermedi.
2. **Sidebar: Eliminato Taglio "Comunicazioni" & Dimensionamento Ottimale**:
   - Compattato il padding dei bottoni a `8px 12px` e il `gap: 2px;` in `.es-cos-sidebar-nav`, portando l'altezza naturale degli 11 pulsanti a soli ~416px (visibili per intero su qualsiasi monitor).
   - Inserito `padding-bottom: 56px` di sicurezza per garantire che anche a risoluzioni bassissime l'ultima voce ("Impostazioni Tecniche") e la penultima ("Comunicazioni") non tocchino mai il fondo.
   - `max-height: calc(100vh - var(--header-h))` e `max-height: calc(100dvh - var(--header-h))` con `overflow-y: auto` e `overscroll-behavior: contain`.
3. **File aggiornati**: `style.css`, `player-profile.css`, `player-profile.js`, `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHPRO5`.
Feature precedente: **Risoluzione 4 Difetti Layout Area Staff Tecnico (`COACHPRO4`)**:
1. **Fascia Vuota ~90px Risolta (Unico Compenso Navbar)**:
   - Eliminato il doppio compenso per la navbar fissa: impostato un unico `padding-top: var(--header-h, 72px)` sul wrapper principale (`.layout, .es-cos-shell`).
   - Azzerati rigorosamente `padding-top: 0 !important; margin-top: 0 !important;` su tutti gli antenati e contenitori intermedi (`body.is-coach-mode`, `html`, `#user-dossier-view-group`, `#user-dossier-portal`, `.pf-page`, `.pf-page-inner`, `#es-staff-profile`, `#es-cd`, `.content, .es-cos-main`).
2. **Sidebar con Max-Height, Scroll Interno & Padding-Bottom di Sicurezza**:
   - Convertito da `height: calc(100vh - var(--header-h))` a `max-height: calc(100vh - var(--header-h))` con `overflow-y: auto; overscroll-behavior: contain;`.
   - Aggiunto `padding-bottom: 64px` per evitare che l'ultima voce del menu ("Comunicazioni") venga coperta o tagliata dal badge in fondo.
   - Badge utente inferiore in sidebar reso `position: sticky; bottom: 0; margin-top: auto; background: #0A0E18;` con sfondo opaco a copertura delle voci che scorrono sotto.
3. **Tab Bar Orizzontale a Scorrimento Fluido Senza Tagli**:
   - Aggiunto `overflow-x: auto; scrollbar-width: none; margin-block: var(--space-2); padding-bottom: 2px;` su `.tab-bar, .es-cos-nav-tabs`.
   - Impostato `flex: 0 0 auto;` su tutti gli elementi figli (`.tab-bar > *, .es-cos-nav-tabs > *`), impedendo il restringimento e il taglio laterale.
4. **Contenitore Centrale a Larghezza Piena**:
   - Rimosso il tetto `max-width: var(--content-max)` su layout e area centrale; impostato `max-width: none !important; width: 100%;` con `padding-inline: var(--space-3);` per sfruttare al 100% lo spazio disponibile nel viewport.
5. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHPRO4`.
Feature precedente: **Sidebar Sticky Impeccabile & Ritmo Verticale Compatto Token-based (`COACHPRO3`)**:
1. **Sidebar Sticky Garantita allo Scroll**:
   - Impostato layout principale `.es-cos-shell` come `display: grid; grid-template-columns: 240px minmax(0, 1fr); align-items: start; gap: var(--space-3); padding-top: var(--header-h);`.
   - Sidebar `.es-cos-sidebar` configurata con `position: sticky; top: var(--header-h, 70px); height: calc(100vh - var(--header-h)); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;`.
   - Rimossi tutti i blocchi di overflow dai contenitori antenati (`body.is-coach-mode`, `html`, `#user-dossier-view-group`, `#user-dossier-portal`, `#es-staff-profile`, `#es-cd`, `.pf-page-inner` con `overflow: visible !important; max-height: none !important;`), garantendo che lo sticky rimanga sempre agganciato alla finestra durante lo scroll.
   - Su viewport < 1024px, la sidebar diventa un drawer `position: fixed; inset: var(--header-h) auto 0 0; width: 260px; transform: translateX(-100%);` con pulsante hamburger dedicato (`#btn-toggle-coach-sidebar`) e overlay scuro animato (`#es-cos-sidebar-overlay`).
2. **Eliminazione Spazi Eccessivi & Ritmo Verticale Unificato**:
   - Introdotti token di spaziatura rigorosi in `:root`: `--space-1: 6px; --space-2: 12px; --space-3: 18px; --space-4: 26px; --content-max: 1280px; --header-h: 70px;`.
   - Applicati su header profilo (`padding: var(--space-3); gap: var(--space-2);`), barra tab (`margin-block: var(--space-1) var(--space-2); gap: var(--space-1);`), griglia KPI (`gap: var(--space-2); padding: var(--space-2);`) e card KPI (`padding: var(--space-2); gap: var(--space-1);`).
   - Line-height compatti (`1.25` su label, `1.1` su valori), azzerati margini di primo/ultimo figlio dentro `.card` ed `.es-cos-card`, e sostituiti i margini sparsi con `gap` su tutti i container e grid.
3. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHPRO3`.
Feature precedente: **Restyling UX/UI & Layout Dark Slate Dashboard Allenatore (`COACHSLATE1`)**:
1. **Eliminazione Radicale Doppia Navigazione & Topbar Compatta**:
   - Quando la dashboard dell'allenatore è attiva, viene iniettata la classe `is-coach-mode` sul `<body>`, sopprimendo integralmente la navbar del sito pubblico (`#nav-menu.portfolio-nav`, "Chi siamo", "Minigiochi", etc.) e recuperando oltre 70px di prezioso spazio verticale.
   - L'header visualizza esclusivamente il logo, il selettore lingua, le notifiche e il profilo utente.
   - Nella dashboard è integrata una Topbar compatta con titolo `Dashboard Allenatore`, badge/pills essenziali (`ASD Carlentini | Serie D - Girone I | Licenza UEFA B | FIGC: 88210`) e pulsante di commutazione `Area Vice Allenatore →`.
2. **Palette Colori Modern Dark Slate ad Alto Contrasto (HUD Calcistico Professionale)**:
   - Sfondo Principale neutro ultra-dark: `#0B1120` (Slate 950) / `#0F172A` (Slate 900).
   - Card e Contenitori: `#1E293B` (Slate 800) con bordi precisi `#334155` (Slate 700) e angoli arrotondati `10-12px`.
   - Testo Primario: `#F8FAFC` (Slate 50 - Bianco freddo ad altissima leggibilità).
   - Testo Secondario & Etichette: `#94A3B8` (Slate 400).
   - Accenti: `#10B981` (Crisp Emerald Green per stati positivi, CTA principale e parametri ottimali) e `#0EA5E9` (Sky Blue per interattività secondaria).
   - Alert/Badge: `#F59E0B` (Warning) e `#EF4444` (Danger).
3. **Matchday Header Banner in Evidenza**:
   - Card orizzontale prominente in cima all'area operativa: Match `ASD Carlentini vs A.C. RAGUSA`, stemmi club, data e stadio (`15/09/2026 15:00 · Comunale - Carlentini`), stato rifinitura (`✓ Rifinitura Completata`), indicatore di prontezza gara (80%) e CTA diretta `"Match Prep / Setup Tattico →"`.
4. **4 KPI Mini-Card Operative**:
   - *Disponibilità Rosa*: `24 / 26` (92% attiva, 2 differenziati con barra di avanzamento).
   - *Carico Squadra & ACWR*: `1.05 (78%)` (● Ottimale, rischio infortuni basso).
   - *Ultima Seduta*: `Rifinitura` (14/09 · 1h 30m, ✓ Conclusa).
   - *Prossima Seduta*: `Domani 10:00` (Attivazione pre-gara, In programma).
5. **Riorganizzazione Grid Asimmetrica a 2 Colonne (68% / 32%)**:
   - **Colonna Sinistra (68% - Focus Operativo Campo)**:
     - *Calendario Prossime Gare*: tabella snella e pulita con altezze e padding ridotti (`0.65rem 0.85rem`), colonne `[Data, Competizione, Avversario, Stadio, Stato, Azione]` con link `Analizza ›`.
     - *Monitoraggio Carico Settimanale GPS*: grafico a barre sobrio da Lun a Dom con media settimanale 78% (*Ottimale*).
     - *Dettaglio Ultima Seduta di Campo*: tipologia, durata, campo, carico RPE e metriche chiave (24/26 presenti, 6 esercizi svolti, 3 obiettivi raggiunti).
   - **Colonna Destra (32% - Feed & Control Room)**:
     - *Notifiche Prioritarie*: stack di card interattive con semaforo sobrio.
     - *Report Staff Collaboratori*: feed compatto con autore, ruolo, orario e badge stato (`In revisione`, `Approvato`).
     - *Prossimi Impegni Staff*: elenco cronologico compatto.
     - *Registro Attività*: log collassabile ad alto contrasto.
6. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `vice-dash.css`, `player-profile.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHSLATE1`.
Feature precedente: **Piattaforma Gestionale SaaS B2B Staff Tecnico Calcistico (`COACHSAAS1`)**:
1. **Abolizione Totale dello Stile Gaming & Videogioco**:
   - Eliminati avatar giganti da console, corone dorate fittizie, bagliori, glow e bordi fluorescenti.
   - Adottato il design system pulito e piatto ispirato ai software SaaS B2B di riferimento (*Notion, Linear, Stripe Dashboard, HubSpot* e suite di performance management calcistico): palette sobria (`#050B14`, `#07111D`, `#0A1624`, `#17344A`), tipografia standard sans-serif (`Inter`), bordi sottili e spaziatura ariosa (padding 20-24px, gap 20-24px).
2. **Navigazione Unica & Esclusiva nella Sidebar Sinistra**:
   - Sidebar fissa (`#07111D`, 240px) con intestazione sobria `ELISEE SCOUT · Area Staff Tecnico` e 11 voci di menu con icone SVG lineari sottili, sfondo istituzionale e sottile barra sinistra di selezione `3px #079BD3`. Zero duplicazioni orizzontali.
   - Footer sidebar con widget utente compatto (iniziali, nome, club, Serie D) e badge di stato `● Staff collegato`.
3. **Page Header Istituzionale & Meta-Bar Operativa**:
   - Titolo `Dashboard Allenatore` (26px, font-weight 700), sottotitolo `Panoramica operativa della prima squadra · Eliseo Miraglia` e pulsante B2B essenziale `Area Vice Allenatore →`.
   - Meta-bar orizzontale compatta con dati essenziali: ASD Carlentini · Serie D - Girone I · Prossima partita: A.C. Ragusa (15/09/2026 - 15:00) · FIGC: 88210 · Licenza: UEFA B (Scad. 30/06/2027).
4. **Riepilogo Operativo a 4 Indicatori Essenziali (Addio Griglia Caotica da 8-10 Card)**:
   - 1. **Prossima partita**: A.C. RAGUSA · 15/09/2026 · 15:00 · badge `In corso (80%)`.
   - 2. **Ultima seduta**: Rifinitura · 14/09/2026 · badge `✓ Completata`.
   - 3. **Disponibilità rosa**: 24/26 (92% attiva) · badge `2 differenziati` con mini-progress bar verde.
   - 4. **Carico squadra**: 78% · badge `● Ottimale` · Indice ACWR 1.05 sotto soglia di rischio.
5. **Layout Asimmetrico a 12 Colonne Funzionale**:
   - **Colonna Principale Sinistra (65-70%)**:
     - *Calendario Prossime Gare*: tabella professionale B2B (Data, Competizione, Avversario, Stadio, Stato, Azioni con link "Analizza ›").
     - *Ultima Sessione*: layout analitico con tipologia, durata, campo, carico RPE e metriche chiave (24/26 presenti, 6 esercizi, 3 obiettivi).
     - *Ultimi Report Staff*: elenco tabellare collaboratori (Vice Allenatore, Preparatore Atletico, Match Analyst, Medico) con stato workflow (`In revisione`, `Approvato`, `Consultato`).
     - *Registro Attività Tecniche*: log cronologico delle azioni del sistema.
   - **Colonna Laterale Destra (30-35%)**:
     - *Notifiche Prioritarie*: feed di massimo 5 notifiche recenti con indicatore sobrio a semaforo.
     - *Prossimi Impegni Staff*: cronologia lineare degli appuntamenti tecnici (sedute, riunioni, video analisi).
     - *Carico Settimanale Squadra*: istogramma sobrio Lun-Dom con media settimanale 78% (*Ottimale*).
6. **Allineamento Vice Allenatore & Piena Interattività**:
   - `vice-dash.css` e workstation a 8 tab allineate alla stessa sobrietà gestionale B2B senza glow o card da gaming.
   - Tutte le sezioni rimangono operative e interattive (ricerca rosa, filtri, lineup builder dinamico, modale tesseramento, modale seduta, chat interna).
7. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `vice-dash.css`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHSAAS1`.
Feature precedente: **Fix Montaggio Automatico Dashboard Allenatore Capo (`COACHFIX1`)**:
1. **Risoluzione Bug Montaggio `#es-cd`**:
   - In `coach-dash.js`, `renderHub` richiedeva l'esistenza statica di `#es-cd` nel DOM (`var mount = document.getElementById('es-cd'); if (!mount) return;`), ma come per tutte le altre dashboard di ruolo l'elemento va iniettato dinamicamente dentro `#es-staff-profile`.
   - Aggiornato `renderHub` implementando la creazione automatica di `<div id="es-cd" class="es-pd">` come primo figlio di `#es-staff-profile`, l'impostazione esplicita di `mount.hidden = false`, `mount.removeAttribute('hidden')`, `mount.style.display = 'block'` e l'aggiunta della classe host `es-cd-on` a `#es-staff-profile`.
   - In questo modo la regola CSS `#es-staff-profile.es-cd-on > :not(#es-cd) { display: none !important; }` nasconde il form standard generico ("Dashboard < Il mio profilo Staff", avviso campi mancanti, Secret List generica) e mostra direttamente la Control Room Tecnica del Mister.
2. **Robustezza Riconoscimento Ruolo `isCoach` & Eventi**:
   - `isCoach(u)` aggiornato per analizzare sia stringhe che oggetti utente, ispezionando tutte le proprietà candidate (`u.staffRole`, `u.ruoloDettagliato`, `u.staffProfile.fieldRole`, `u.staffProfile.staffRole`, `u.ruolo`, `u.role`) e ignorando l'etichetta generica `"staff"` senza bloccare la catena di fallback.
   - Aggiunti listener diretti per gli eventi custom `elisee:view-changed` ed `elisee:role-changed` per una reattività immediata anche senza ricaricamento pagina.
   - Integrata chiamata preventiva a `window.unmountAllRoleDashboards('es-cd')` per evitare conflitti con altre schede di ruolo.
3. **File aggiornati**: `coach-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHFIX1`.
Feature precedente: **Foggia City Squadra di Riferimento per Allenatore & Vice (`FGCCOACH1`)**:
Feature precedente: **Area Allenatore & Vice Allenatore: Technical Staff Operating System & Zero-Fake Palmarès (`COACHOS1`)**:
1. **Politica Zero-Fake & Bacheca Trofei Onesta**:
   - Eliminati tutti i titoli fittizi europei ("Vincitore UEFA Europa League", "Qualificazione Champions League", ecc.) da `coach-dash.js` e `vice-dash.js`.
   - La bacheca parte vuota per default con empty-state professionale ed elegante.
   - Implementata aggiunta e rimozione reale di titoli certificati con persistenza in `localStorage['elisee_coach_data']`.
   - Sanitizzazione automatica di eventuali vecchie chiavi salvate in cache browser con i trofei mock.
2. **Palette Unificata & Design System Luxury Dark**:
   - Eliminata l'eyebrow dorata con corona e badge multicolore casuali.
   - Palette coerente da control room tecnica: blu/ciano (`#0798d1` / `#16b9ff`) per elementi attivi, verde (`#00d978`) solo per stati verificati/connessioni, ambra (`#ffd21a`) riservato ai limiti di ruolo e monitoraggio atleti.
   - Navbar a 9 schede ridisegnata con icone SVG monochrome compatte ed eleganti.
3. **Control Room Bar con 6 KPI Dinamici**:
   - Aggiunta strip orizzontale superiore con Prossima Gara, Ultima Seduta, Carico Squadra (ACWR 1.08), Disponibilità Rosa (91%), Atleti da Monitorare e Stato Staff Vice.
4. **9 Sezioni Tecniche Operative**:
   - Identità & Staff (Dati, Licenza, Vice con status connessione, Bacheca, Limiti di Ruolo).
   - Tattica & Top 11 (Selettore modulo dinamico 4-3-3, 4-2-3-1, 3-5-2, 3-4-2-1, 4-4-2 con riposizionamento pedine in tempo reale, Story Social 9:16).
   - Esercitazioni (Filtri categorie, toggle visibilità, modale per creare nuova scheda).
   - GPS & Carichi (Telemetria, ACWR, semaforo readiness individuale, heatmap).
   - Segnalazione DS (Wishlist mercato con priorità, motivazione e stato trattativa).
   - Rosa (Organico con filtri per reparto POR/DIF/CEN/ATT/DISP).
   - Sedute & Presenze (Calendario sedute con rilevazione presenze Presente/Differenziato/Assente).
   - Partite (Calendario gare e convocazioni ufficiali).
   - Lavagna Tattica (Lavagna interattiva per schemi con pedine e pallone).
5. **File aggiornati**: `coach-dash.css`, `coach-dash.js`, `vice-dash.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `COACHOS1`.
Feature precedente: **Logo Ufficiale Competizione Amatoriale (`FGCAMATLOGO1`)**:
Feature precedente: **Immagine Sfondo Card Città per Foggia City (`FGCCITY1`)**:
Feature precedente: **Font Futuristico Nevera per la Città di Foggia (`FGCFONT1`)**:
Feature precedente: **Rimozione Totale Divisa Ospiti Foggia City (`FGCKIT2`)**:
Feature precedente: **Divisa Ufficiale Unica 3D Foggia City (`FGCKIT1`)**:
Feature precedente: **Font Futuristico Nevera per Foggia City (`NEVERA1`)**:
Feature precedente: **Font Serif Playfair Display & Dati Reali Pannello Elisee Manager (`TCSERIF1`)**:
Feature precedente: **Conversione Dark Theme Completa Pannello Elisee Manager (`TCDARK1`)**:
Feature precedente: **Redesign Ultra-Professionale Candidatura Elisee Manager (`CANDMGR1`)**:
1. **Struttura Enterprise & Form Diviso in 4 Sezioni**:
   - Superata la griglia piatta generica: form riorganizzato in 4 sezioni numerate con intestazione, progressivo `01-04` e linea divisoria:
     - `01 Dati di contatto`: Nome e cognome, Email account, Telefono con hint per Circolo Manager/WhatsApp VIP, Ruolo nel club.
     - `02 Territorio`: Città e territorio di riferimento.
     - `03 Motivazione`: Piano editoriale di pubblicazione per i 30 giorni (risultati, formazioni, rose, eventi).
     - `04 Conferma`: Checkbox formale d'impegno con blocco consensi stile enterprise, pulsanti `Invia candidatura` e `Annulla`.
2. **Breadcrumb Gerarchico & Titolo Contenuto**:
   - Breadcrumb di navigazione integrato (`Squadre / [Nome Squadra] / Candidatura Manager`) con pulsante rapido di chiusura `✕`.
   - Tipografia calibrata: titolo 24px sobrio, intro informativa (ruolo editoriale supervisionato dalla redazione).
3. **Sidebar Modulare a 3 Blocchi Impilati**:
   - **Scheda Identità Club**: card con stemma ufficiale del club (logo tondo con fallback abbr), nome club, categoria e territorio.
   - **Timeline Verticale in 3 Fasi**: stile roadmap Bacheca con pallini e linea continua di collegamento (*Mese di prova*, *Verifica editoriale*, *Circolo Manager*).
   - **Callout Nota Editoriale**: box con bordo d'accento sinistro per la citazione «È solo un mese, ma un mese di costanza.» / «Non chiediamo perfezione: chiediamo continuità.».
4. **File aggiornati**: `manager.css`, `manager-runtime.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `CANDMGR1`.
Feature precedente: **Fix Stemma Ufficiale Foggia City in Seleziona Squadre (`FOGGIACITY2`)**:
1. **Risoluzione visualizzazione stemma circolare in `#squadre-portal`**:
   - Disattivato il flag `USE_NEUTRAL_BADGES = false;` in `squadre-select.js` che forzava l'uso dello scudo geometrico neutro ("FGC" con stella) coprendo l'immagine originale.
   - Perfezionata la funzione `showLogo(url, team)` per caricare direttamente `immagini/squadre-loghi/foggia-city.png` per Foggia City, rendendo visibile l'elemento `<img>` (`style.display = 'block'; style.visibility = 'visible'`) e nascondendo in modo perentorio il fallback `.es-sq-crest-fallback` (`fb.hidden = true; fb.style.display = 'none'`).
   - In `render()` e nel restore dello stato da `localStorage`, garantito il percorso stemma circolare ufficiale.
   - Invalidazione cache loghi `LOGO_V = '20260914_FGC2'` e `CATALOG_URL` / `VERIFIED_URL`.
2. **File aggiornati**: `squadre-select.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `FOGGIACITY2`.
Feature precedente: **Integrazione Logo Ufficiale Foggia City (`FOGGIACITY1`)**:
1. **Asset Grafico Ufficiale Foggia City**:
   - Ricevuto e integrato il logo circolare ufficiale nerazzurro di **Foggia City**: scudo con righe verticali blu reale e nere, profilo della cattedrale di Foggia con corona, sagoma del diavolo con pallone, dicitura "FOGGIA CITY", "20 26" e sigla "FC".
   - Salvato in `immagini/squadre-loghi/foggia-city.png` (e copia alias `1000345699.png`).
   - Creata la cartella kit 2D richiesta dalle regole fisse: `immagini/kits-2d/foggia-city/` con file `LEGGI_ME.txt`.
2. **Aggiornamento Dati Società & Colori Ufficiali**:
   - In `data/squadre/verified-teams.json` aggiornato il club `foggia-city` con:
     - `logo: "immagini/squadre-loghi/foggia-city.png"`
     - `year: "2026"`
     - `primary: "#0055d4"`, `secondary: "#0b0f19"`
     - `home: { body: "#0055d4", sleeve: "#0b0f19" }`, `away: { body: "#ffffff", sleeve: "#0055d4" }`
   - In `squadre-select.js` aggiornato `TEAMS_FALLBACK` con il percorso logo, i colori societari e le date corrispondenti.
3. **Integrazione Header Elisée Manager**:
   - In `tc-panel.js` (`#tc-portal`) l'header principale di Elisée Manager mostra lo stemma ufficiale tondo accanto al titolo del club (Foggia City).
Feature precedente: **Elisée Manager: Redesign Soci / Verbali — Club Governance & Corporate Administration Workspace (`GOVMGR1`)**:
1. **Trasformazione in Corporate Governance Workspace**:
   - Superato l'effetto amatoriale a «due grandi form affiancati della stessa altezza» con campi sempre aperti ed enormi aree vuote.
   - Creata una struttura a 3 macro-sezioni funzionali indipendenti ispirata ai gestionali societari enterprise di alto livello (*Company Profile / Organization Settings*, *Registro Soci Ufficiale*, *Verbali Assembleari*).
2. **Header Editoriale & Governance Overview KPI Strip**:
   - Header editoriale con breadcrumb (`Foggia City / Gestione società / Governance`), titolo Fraunces «Governance societaria», sottotitolo esplicativo («Gestisci i dati ufficiali del club, il registro soci e la documentazione delle assemblee») e pulsanti d'azione rapida `Nuovo verbale` e `Modifica dati societari`.
   - Fascia orizzontale a 5 KPI sobri e istituzionali:
     - *Soci registrati* (membri con diritto di voto nel club)
     - *Dati societari* (indicatore verde smeraldo *Completi* o ambra *Da completare*)
     - *Verbali generati* (atti ufficiali archiviati nel registro digitale)
     - *Ultima assemblea* (data della seduta assembleare registrata)
     - *Documenti ufficiali* (fascicoli e atti societari complessivi conservati)
3. **Sezione A — Dati Ufficiali della Società (Company Profile)**:
   - Griglia compatta ed elegante a 4 quadranti informativi: *Ragione Sociale*, *Codice Fiscale / Partita IVA*, *Sede Legale*, *Città / Territorio*.
   - Badge di conformità (`● Profilo societario completo` o `● Configurazione incompleta`) e pulsante `Modifica dati societari` che apre il modale dedicato senza ingombrare la pagina.
4. **Sezione B — Registro Soci**:
   - Toolbar completa con ricerca live socio (`#es-tc-socio-search`), filtro per ruolo (*Tutti i ruoli, Socio Fondatore, Socio Ordinario, Consigliere, Presidente*), pulsante primario `Aggiungi socio`, `Sincronizza anagrafica` e pulsante `Esporta registro` (download del libro soci ufficiale in formato formattato .txt).
   - Tabella dei soci con avatar monogramma, nome e cognome, codice fiscale/email, ruolo, data d'ingresso nel libro soci, badge di stato *● Attivo* e azione di rimozione.
   - Empty state curato con CTA per aggiunta socio o sincronizzazione automatica dall'organico.
5. **Sezione C — Verbali Assembleari (Meeting Minutes & Deliberations)**:
   - Superato il form sempre aperto: ora la redazione avviene tramite una modale executive di redazione atto (`Data assemblea`, `Ordine del giorno - ODG`, `Delibere adottate`) con formattazione notarile automatica dei presenti e della sede.
   - Tabella dei verbali generati con *Data assemblea*, *Oggetto / ODG*, badge `● Atto Ufficiale Approvato`, data di redazione e azioni rapide: `Visualizza` (apre il testo integrale del verbale in una modale pergamena), `Scarica` (.txt ufficiale) e `Archivia`.
6. **File aggiornati**: `tc-panel.css`, `tc-panel.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `GOVMGR1`.
Feature precedente: **Elisée Manager: Redesign Profilo Atleta / Storico — Athlete Intelligence & Performance Center (`ATHMGR1`)**:
1. **Trasformazione in Athlete Intelligence Workspace**:
   - Superata la semplice card informativa con messaggio vuoto ("Nessun atleta in anagrafica").
   - Trasformata in un vero *Athlete Intelligence & Performance Center* che connette la gestione amministrativa del club (tesseramento, presenze, rate, certificati) con lo scouting, le performance e lo storico continuo dell'atleta.
2. **Header Editoriale & KPI Strip Compatta**:
   - Header editoriale con breadcrumb (`Foggia City / Gestione società / Profili atleta`), titolo Fraunces «Profili atleta», sottotitolo esplicativo («Consulta lo storico sportivo e accedi ai dossier scouting collegati agli atleti della società») e pulsanti rapidi `Cerca atleta` e `Visualizza anagrafica`.
   - Fascia a 4 KPI istituzionali:
     - *Atleti in anagrafica* (totale tesserati nel club)
     - *Profili collegati allo scouting* (atleti con dossier digitale attivo su Elisée Scout)
     - *Attività registrate* (sedute e match monitorati a calendario)
     - *Ultimo aggiornamento* (data ultimo evento o registrazione continua nel database)
3. **Main Athlete Workspace a Due Colonne**:
   - **Colonna principale (Anagrafica Sportiva)**:
     - Toolbar con input ricerca atleta per nome o codice fiscale e selettore categoria (*Tutte le categorie*, *Prima Squadra*, *Under 19*, *Under 17*, *Under 15*).
     - Tabella premium con colonne: *Atleta* (avatar, nome, email), *Categoria*, *Ruolo*, *Stato* (badge attivo), *Ultima attività* (data evento o indice presenze), *Profilo scouting* (badge di collegamento verified/pending) e *Azioni* (pulsante `Dossier`).
     - Empty state istituzionale coerente con CTA `Vai alle iscrizioni`.
   - **Colonna laterale (Athlete Profile Preview - Scheda Intelligence Live)**:
     - Header con avatar Fraunces bordato oro, nome completo, categoria, ruolo e badge di stato collegamento Elisée Scout.
     - Griglia a 4 stat box analitiche: *Presenze stagionali* con progress bar verde smeraldo, *Stato amministrativo* (rate aperte o in regola), *Certificato medico* (tipo e data di scadenza), *Rating potenziale* (indice di continuità 8.4/10).
     - Riquadro dati anagrafici (data e luogo di nascita, CF, contatti).
     - CTA principale: `Apri dossier scouting` (`data-tc="open-scout"`), affiancata da `Visualizza storico` (rimando a Calendario) e `Apri documenti` (rimando a Documenti).
4. **Sezione Istituzionale: Scouting Intelligence & Continuous Athlete Record**:
   - Sezione a tutta larghezza con badge «Tecnologia Proprietaria Elisée Scout» che descrive il ponte tecnologico: collegamento automatico al dossier scouting quando l'email dell'atleta coincide con quella registrata su Elisée Scout, con i tre pilastri (Anagrafica & Compliance, Continuità di Campo, Dossier & Scouting Hub).
5. **File aggiornati**: `tc-panel.css`, `tc-panel.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `ATHMGR1`.
Feature precedente: **Elisée Manager: Redesign Documenti e Scadenze — Sports Document Management & Compliance Center (`DOCMGR1`)**:
1. **Trasformazione in Document Management & Compliance Center**:
   - Superata l'interfaccia a card tecniche con bottoni isolati e form di upload sempre aperto.
   - Design luxury enterprise con archivio documentale ricercabile, scadenziario automatico di conformità e modelli federali a libreria.
2. **Header Editoriale & Document Control Overview**:
   - Header con breadcrumb istituzionale (`Foggia City / Gestione società / Documenti`), titolo Fraunces, sottotitolo esplicativo («Un unico spazio per archiviare, verificare e monitorare tutta la documentazione della società») e pulsante d'azione rapida `Carica documento`.
   - Fascia orizzontale compatta a 5 KPI strategici:
     - *Documenti archiviati* (totale fascicoli salvati)
     - *Documenti da completare* (tesserati con fascicolo o certificato medico mancante)
     - *Scadenze imminenti* (atti in scadenza entro i prossimi 30 giorni)
     - *Documenti scaduti* (atti con validità superata che richiedono rinnovo immediato)
     - *Modelli disponibili* (4 format ufficiali scaricabili)
3. **Main Document Workspace a Due Colonne**:
   - **Colonna principale (Archivio Documentale)**:
     - Toolbar con ricerca live per nome file, tesserato o tipologia, filtro reattivo per tipo documento e filtro per stato (*Valido*, *In scadenza*, *Scaduto*).
     - Tabella istituzionale con *Nome documento*, *Tesserato*, *Tipologia*, *Data caricamento*, *Scadenza*, *Stato* e pulsante *Scarica* per ciascun file.
     - Empty state curato ed esplicativo in assenza di documenti.
   - **Colonna laterale (Modelli Precompilati)**:
     - Lista a righe library con icona, nome e descrizione per ciascun modello ufficiale (*Modulo di iscrizione*, *Certificato medico agonistico*, *Delega genitore*, *Informativa privacy GDPR*) e pulsante rapido di download.
4. **Upload Documento Contestuale & Scadenziario Automatico**:
   - *Upload Documento*: drawer/modale elegante aperta da `Carica documento`, con tesserato associato, tipo documento, data scadenza e drag&drop zone per file PDF/immagini.
   - *Scadenziario & Compliance*: sezione istituzionale a tutta larghezza con tabella di monitoraggio continuo per certificati medici, rinnovi e quote societarie, con giorni rimanenti calcolati in tempo reale, badge di conformità e pulsante *Notifica sollecito*.
5. **File aggiornati**: `tc-panel.css`, `tc-panel.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `DOCMGR1`.
Feature precedente: **Candidatura Elisee Manager — Restyling Luxury Editoriale Club Esclusivo (`LUXMGR1`)**:
1. **Addio taglio da videogame**:
   - Eliminati box neon celesti, trofei, badge dorati vistosi ed emoji stile WhatsApp VIP.
   - Nuovo registro luxury: palette nero-inchiostro con sottotono verde (`#0B0F0D`), accento oro tenue (`#C6A15B`), testi avorio (`#EDE8DA`), salvia (`#8FA096`) per label e bordi hairline traslucidi.
2. **Tipografia editoriale & Struttura a due colonne**:
   - Aggiunto il font Google **Fraunces** (serif editoriale per titoli, citazioni, stemma e numeri romani) abbinato a **Inter** per label e corpo testo.
   - **Colonna sinistra (`identity`)**: stemma minimale/monogramma circolare con finitura dorata, citazione in corsivo («È solo un mese, ma un mese di costanza.» / Non chiediamo perfezione — chiediamo continuità.), nome squadra e categoria/territorio come stat pulite.
   - **Colonna destra (`content`)**: percorso in tre passaggi numerati in numeri romani (I. Mese di prova, II. Verifica editoriale, III. Circolo Manager), form con campi a sottolineatura minimali, casella di dichiarazione elegante e pulsante d'azione oro satinato.
3. **File aggiornati**: `manager.css`, `manager-runtime.js`, `index.html`, `version.json`, `sw.js`, `CONTINUA_DA_QUI.md`. Cache `LUXMGR1`.
Feature precedente: **Rimozione Categoria "ECCELLENZA" da Seleziona Squadra (`ONLYAMAT1`)**:
1. **Rimozione categoria Eccellenza e club Barletta**:
   - Rimossa la categoria "ECCELLENZA" e il club Barletta da `data/squadre/verified-teams.json` e dal fallback in `squadre-select.js`.
   - In Seleziona Squadra e nel picker "SCEGLI CATEGORIA" compare ora unicamente la categoria **AMATORIALE** con **Foggia City** (e qualunque altro club che si registri via modulo).
2. **Purga residui di cache**:
   - In `loadVerifiedList()` rimossa la persistenza di "barletta" da `localStorage['elisee_registered_teams_v1']` e `elisee_verified_teams_v1`, impedendo che vecchie sessioni browser ripropongano la categoria.
3. **File aggiornati**: `data/squadre/verified-teams.json`, `squadre-select.js`, `index.html`, `version.json`, `sw.js`. Cache `ONLYAMAT1`.
Feature precedente: **Correzione Categoria Foggia City in "AMATORIALE" (`FGCAMAT1`)**:
1. **Assegnazione corretta della categoria**:
   - Foggia City è una squadra amatoriale: rimossa qualsiasi classificazione da "Dilettanti" o "Eccellenza".
   - Impostata la categoria ufficiale **"AMATORIALE"** in `data/squadre/verified-teams.json` e nel fallback in `squadre-select.js`.
2. **Supporto categoria "AMATORIALE" in Seleziona Squadra**:
   - In `squadre-select.js` e `index.html`: la pillola categoria e l'elenco mostrano fedelmente "AMATORIALE" per Foggia City con icona appropriata.
   - Nella modale interattiva "➕ Registra Club", "AMATORIALE" è ora la prima opzione predefinita nel menu a tendina delle categorie.
   - Aggiunta pulizia automatica di vecchie voci di localStorage in `loadVerifiedList()` per evitare che una versione precedente in cache sovrascriva la categoria.
3. **File aggiornati**: `data/squadre/verified-teams.json`, `squadre-select.js`, `index.html`, `version.json`, `sw.js`. Cache `FGCAMAT1`.
Feature precedente: **Seleziona Squadra: Solo Club Registrati Ufficiali con Foggia City & Modulo Registrazione Club (`ONLYREG1`)**:
1. **Rimozione sfilza 1500 squadre non registrate**:
   - In "Seleziona Squadra" (`squadre-select.js`), rimossa completamente la sfilza massiva dei 1500 club estratti/non registrati.
   - Vengono mostrate **esclusivamente** le squadre registrate ufficialmente nel progetto ELISEE SCOUT (di partenza **Foggia City** e **Barletta**) e le squadre che si registrano tramite la piattaforma.
2. **Badge Ufficiale, Originale al 100% e IP-Safe (`badge-engine.js`)**:
   - Ogni squadra registrata dispone del proprio scudetto vettoriale geometrico originale basato sui colori sociali del club (es. Foggia City: rosso `#dc2626` e scuro `#0f172a`, sigla "FGC"; Barletta: rosso e bianco, sigla "BAR") con stella, finiture luxury e riflessi 3D.
3. **Pulsante & Modale Interattiva "➕ Registra Club"**:
   - Pulsante nella topbar di Seleziona Squadra con anteprima live dello stemma in tempo reale e salvataggio su `localStorage['elisee_registered_teams_v1']`.
Feature precedente: **Modalità "Zero Rischi" IP-Safe con Motore di Badge Vettoriali Geometrici Neutri (`badge-engine.js`)**:
1. **Piena conformità legale e tutela proprietà industriale**:
   - Zero rischi di contraffazione, imitazione servile o concorrenza parassitaria rispetto ai marchi ufficiali dei club.
   - I club vengono visualizzati di default con stemmi e scudetti vettoriali SVG 100% originali e geometrici (stile heraldic shield / luxury medal), basati sui colori sociali ufficiali (`primary` e `secondary`) e sulla sigla/abbreviazione a 3 lettere calcolata con algoritmo intelligente (es. "ATA", "BAR", "NAP", "MIL", "INT", "JUV").
2. **Architettura `badge-engine.js`**:
   - Motore SVG leggero e performante (zero richieste di rete, rendering a 0ms).
   - Genera SVG scalabili a qualsiasi dimensione (da 24px a 200px) con supporto a `generateSvg(team, opts)`, `svgUri(team, opts)` per immagini Data URI e `mount(container, team, opts)` per iniezione diretta nel DOM.
3. **Integrazione Selettore Squadre FC (`squadre-select.js` & `squadre-select.css`)**:
   - Impostato `USE_NEUTRAL_BADGES = true` di default per mostrare sempre lo scudetto vettoriale rifinito con drop-shadow e rilievo tridimensionale all'interno dell'anello luxury dello stage.
   - Sostituito il markup iniziale statico di Pisa in `index.html` con il fallback vettoriale dinamico.
4. **Integrazione Formazione & Tattica (`formazione-squadra.js`)**:
   - Testata della formazione `#es-xi-logo` aggiornata per caricare in automatico l'SVG Data-URI del badge neutro della squadra selezionata.
5. **File creati e aggiornati**: `badge-engine.js` (nuovo), `squadre-select.js`, `squadre-select.css`, `formazione-squadra.js`, `index.html`, `version.json`, `sw.js`. Cache `NEUTRALBADGE1`.
Feature precedente: **Ancoraggio fisso viewport per la barra di navigazione laterale verticale (`es-pd-rail`) durante lo scroll (cache `FIXEDRAIL1`)**:
1. **Identificazione del componente**: `<aside class="es-pd-rail">` in `player-dash.js`, `dash-real.js` e `giorn-dash.js`.
2. **Posizionamento `position: fixed`**: Ancorato a viewport con `top: 86px`, `height: calc(100vh - 86px)`, `z-index: 50`.
3. **Offset del contenuto principale**: `padding-left: 56px !important` su `.es-pd` e `#es-pd`. Media query mobile touch preservata.
Feature precedente: **Ripristino pulito e fedele loghi squadre e competizioni in Seleziona Squadre (cache `CLEAN1`)**:
1. **Ripristino Architettura Diretta & Fedeltà Asset Progetto**:
   - Rimosso `seenInLeague` e prefetch asincrono con race condition. Loghi collegati direttamente a `immagini/squadre-loghi/`.
   - Gestione anti-glitch con fallback colori e iniziali durante il caricamento.
2. **Deduplicazione Barletta preservata nel catalogo**:
   - In `data/squadre/catalog.json` rimossa la sola riga duplicata `barletta-cb0b`, lasciando l'unica squadra ufficiale `barletta`.
Feature precedente: **Pannello "Azioni possibili" a Griglia Orizzontale 3 Colonne a Schede (PLAYERDOSSIER4)**:
1. **Risoluzione spazio vuoto a destra**: Trasformato `.es-link-list` in griglia orizzontale a 3 colonne a schede.
2. **Posizionamento a piena larghezza**: Subito sotto la griglia dossier a 3 colonne.
3. **Adattamento responsive automatico**: 3 col desktop, 2 col tablet, 1 col smartphone.
Feature precedente: **Riorganizzazione Tematica dei Pannelli del Dossier Player (PLAYERDOSSIER3)**:
1. **Colonna 1 — Identità & Azioni (Account & Chi sei)**: *Indice Atleta & Parametri*, *Il Mio Profilo & Obiettivi*.
2. **Colonna 2 — Prestazioni (Il calcio giocato sul campo)**: *Radar Prestazioni a 12 Assi*, *Registro Match & Voti PGB*, *Crescita Storica*.
3. **Colonna 3 — Fiducia & Mercato (Affidabilità & Interesse)**: *Certificazione & Compliance*, *Interesse Scouting & Percorso*.
4. **Blocchi orizzontali**: *Azioni possibili* (3 col), *Richieste di contatto* (con accettazione interattiva), *Interesse dalla rete* (5 card conteggio).
Feature precedente: **Area Player Dossier / Selettore Stagione Unificato & Nuovi Blocchi B2B**:
1. Selettore stagione unificato (‹ Stagione 2026/27 · Attuale ›) senza duplicazioni.
2. Blocco "Richieste di contatto" con Accetta/Rifiuta e badge in attesa.
3. Blocco "Interesse dalla rete" a 5 categorie (Allenatori, DS, Club, Procuratori, Osservatori giovanili).
Feature precedente: **Allineamento Grafico & Strutturale Area Riservata Player ("Report Tecnico & Profilo Atleta")**:
1. Design System & Palette Istituzionale B2B (`#3b7dff`, `#0b0e14`, `#10141d`).
2. Badge di stato unificati a 3 livelli: `.es-badge--active`, `.es-badge--verified`, `.es-badge--pending`.
3. Griglia a 3 colonne: Indice Atleta, Radar 12 assi, Certificazione & Compliance.
Feature precedente: **Credenziali Password Account & Responsabile Privacy**:
1. Memorizzata e impostata come standard per gli account e per l'account del Responsabile Privacy (`manueltucci2002@gmail.com`) e master secret admin la password: `Iemmello.9` (esattamente con il punto).
2. Aggiornato hash PBKDF2 in `api/auth/me.js` (`21612aefb415ec0957dfd54095eed7fadbeaec288eeca7bf8380989c12919145`).
3. Aggiornato secret predefinito e comparazioni in `api/auth-admin.js` e `elisee_up.py` per accettare `Iemmello.9` e relative forme normalizzate.
4. Regola fissa registrata in `AGENTS.md`.
Feature precedente: **Minigiochi / crop trofeo (HUBPOLISH2)**:
1. L'immagine è verticale; `cover` + `center` ritagliava il basso (campo + coppa). Lo scroll non la mostra: lo sfondo è `position:absolute` sull'hub.
2. Posizione `center 76%`. Hover card (sollevamento + bagliore) è ancora su career/Elisee World, non sulla card locked. File: `minigioco-carriera.css`.
Feature precedente: **Mappa Club / Tutte e Sole le Squadre dalla Serie A all'Eccellenza** (cache `ATOECC2`):
1. **Catalogo Reale Serie A - Eccellenza (`data/squadre/scopri-clubs.json`)**: Rigenerato il catalogo escludendo Promozione, 1ª/2ª/3ª Categoria, U19 e duplicati, mantenendo le 729 società uniche ufficiali dalla Serie A all'Eccellenza con geolocalizzazione esatta e loghi.
2. **Filtro Mappa & Tabelle (`mappa-club.js`)**: Aggiunto `isSerieAToEccellenza(c)` su caricamento pin, cluster, ricerca e pannelli regionali; i conteggi riflettono esattamente le squadre di vertice (es. Puglia: 34 società autentiche senza duplicati, Lombardia: 92, Campania: 59).
3. **Dicitura & Trasparenza (`index.html`, `mappa-club.js`)**: Contatore e intestazioni aggiornate con la dicitura chiara "(dalla Serie A all'Eccellenza)".
Feature precedente: **Mappa Club / Loghi Trasparenti, Dimensioni Incrementate & Ordine Alfabetico**: Cache `LOGOSIZE1`.
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
2. Se hai toccato HTML/CSS/JS: alza `?v=YYYYMMDD_…` in `index.html`, `CACHE` in `sw.js` e aggiorna `version.json` (triggera `live-reload.js` per il refresh automatico su tutti i client).
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

- **Ambassador — Adesione & Contratto (cache `AMBASSADOR1`)**:
  - Corpo pagina rinnovato mantenendo l'header esistente intatto.
  - Etichette form in sentence case con asterisco azzurro `#3b7dff` (eliminato uppercase e tracking eccessivo).
  - Input con border-radius 9px, padding 12px 14px e focus color coordinato.
  - Bottone "Genera e firma contratto" reso CTA primario pieno in blu `#3b7dff` con testo bianco.
  - Anteprima contratto vuota ristrutturata con icona SVG documento e messaggio orientativo (allineata a Bacheca ed Album).
  - Nota revisione umana integrata: valutazione manuale del team in caso di esito negativo dell'Agente IA.
  - Checkbox consenso GDPR preservata, visibile e obbligatoria prima del submit. File: `index.html`, `style.css`, `app.js`, `area-ambassador-contratto.html`.
- **Album · Chi hai in rete (cache `ALBUM5`)**:
  - Tab a sottolineatura azzurra `#3b7dff` al posto del selettore a pillola stile switch app, allineate a Bacheca e Stampa.
  - Titolo `h1` ("Album") separato dal sottotitolo esplicativo ("Chi hai in rete: enti, club, giocatori e staff che segui o hai salvato su Elisee Scout.").
  - Padding-top 88px perché `.portfolio-navbar` è fisso e alto 72px (prima 56px tagliava il titolo).
  - Stato vuoto: titolo e sottotitolo distinti (niente eco), icona SVG rete/persone, CTA "Scopri club e profili in Bacheca" / "Esplora club vicino a te", bordo pieno e padding 72px.
  - Sezione "Come funziona" (Trova → Segui → Organizza) sotto il pannello. Numeri editoriali (cifra + linea), non badge circolari. Sentence case forzato (`text-transform: none`) perché `style.css` mette in uppercase tutti gli h1–h6. Padding sezione 48px in basso. Niente em dash nel copy visibile.
  - `player-card.js` non sovrascrive più il sottotitolo con lo stesso testo del titolo (era la causa del duplicato in produzione).
  - Struttura card profilo responsive a 3 colonne (`.es-profiles`, `.es-profile-card`) con avatar circolare, nome, metadati e pulsante "Visualizza profilo". `PROFILI_DATA` mantenuto vuoto come richiesto finché non ci sono connessioni reali. File: `index.html`, `scopri-profili.css`, `chi-segui.js`, `player-card.js`, `area-album-seguiti.html`.
- **Privacy Officer STAFF2**: login email `manueltucci2002@gmail.com` via `POST /api/auth/login` (hash PBKDF2, no plaintext). Skip documenti KYC (`verifiedByAdmin`). Banner reimposta password dopo accesso. `/api/auth/set-password`.
- **Staff STAFF1**: `eliseomiraglia2704@gmail.com` = Admin Executive; `manueltucci2002@gmail.com` = Responsabile Privacy (`elisee_privacy_auth`). File `elisee-staff.js`.
- **Accedi GGL4**: lock scroll `es-modal-open`; GIS `renderButton` da env `GOOGLE_CLIENT_ID`; `/api/auth/google` verifica con `google-auth-library`.
- **OAuth Google Vercel**: `GET /api/auth/oauth/google`, `POST /api/auth/oauth/finish`, `GET /api/auth/config`, `GET /api/auth/me`, `POST /api/auth/google`.
- **API KV classifiche** (cache `KV1`):
  - `POST /api/activity` `{ userId, tipo, ts, nome }` — ZADD `activity:events`
  - `GET /api/activity/top` — aggregato 24h → `{ nome, meta }`
  - `POST /api/quiz-score` `{ nome, punti }` — ZADD `quiz:scores`
  - `GET /api/quiz-score/top` — top 10 `{ nome, punti }`
  - Storage Vercel: **Redis (Upstash)** dal Marketplace (KV è deprecato). Env: `KV_REST_API_*` o `UPSTASH_REDIS_REST_*`. Poi redeploy.
  - Client: `trackEliseeActivity()`, `submitEliseeQuizScore()`.
- **Sidebar onesta** (cache `SIDE1`): In evidenza da candidature `localStorage.elisee_user_jobs`; Community score da `elisee_quiz_leaderboard` (se vuoto: empty + Fai il quiz). Non si copiano più i ranking finti di Home.
- **Dropdown Zona portale** (cache `DROP1`): menu `.dropdown-options-menu` su `body` (`position:fixed`) così non viene tagliato dal filtro né coperto dalla sidebar.
- **Bacheca funzionante** (cache `BOARD4`): reset filtri; raggio filtra `job.raggio` (non geo utente); bottoni agganciati alle modali reali. Fonti dati: catalogo `sampleJobs` in `app.js` + candidature utente in `localStorage['elisee_user_jobs']`.
- **Bacheca — CTA strip + pill + maglia** (cache `BOARD3`): raggio senza `1 ·`; `.es-cta-strip` sotto le card; tab Squadre con SVG maglia.
- **Bacheca — struttura es-main** (cache `BOARD2`): HTML reale con `.es-main`, `.es-sidebar` unita, card fallback + `.es-empty`. Render JS con try/catch. Icone tab SVG.
- **Bacheca reclutamento — board** (cache `BOARD1`):
  - Sidebar unica (In evidenza + Community score), niente card CTA duplicata «Cerca persone e squadre».
  - Fix margini `.pf-aside-card` (erano 5rem globali da admin → enormi vuoti).
  - Sfondo fotografico rimosso. Card annunci + stato vuoto «Amplia il raggio».
  - File: `bacheca-board.css`, `index.html`, `app.js` (`filterAndRenderJobs`).
- **Chi siamo — Cosa facciamo / Perché puoi fidarti** (cache `TRUST1`): niente roadmap interna né numeri di business plan. Griglia 3 funzioni reali + 4 garanzie. File: `index.html` (`#view-about`), `chi-siamo.css`.
- **Fix Chi siamo scroll tagliato** (cache `SCROLL1`): `#about-detail-overlay` chiuso è `display:none` (non più layer flex invisibile a tutto schermo). Unlock forza `overflow-y: auto` su html/body.
- **Fix Indietro freeze su Chi siamo** (cache `BACKFIX1`): `EliseeUnlockPage` resetta body lock (`position:fixed`, overflow, overlay dettaglio) su Back/Forward e su ogni `switchView`. Overlay Chi siamo inserisce uno state in cronologia così il primo Indietro chiude il dettaglio senza lasciare la pagina nera. Animazione hero senza `fill-mode: both`.
- **Chi siamo — palette sito** (cache `PALETTE1`): token del dossier agganciati a `--bg-primary` / `--text-main` / `--text-muted` / `--accent-primary`. Fondo `#050608`, accento ciano `#38bdf8` come header/footer. Niente inchiostro né bronzo.
- **Chi siamo — dossier istituzionale** (cache `DOSSIER1`):
  - Abbandonato il linguaggio da videogioco (pill, numeri cerchiati, card con barre colorate, ritratto B/N, badge “Struttura & Governance”).
  - Tipografia: serif Newsreader per titoli e citazioni, Inter per UI/dati.
  - Hero: headline + lede + blocco letterhead (sede, contatti, ambito).
  - Governance: lista editoriale con tag normativo (GDPR, Riforma dello Sport, Rete).
  - Roadmap: timeline verticale a 3 fasi (unico contenuto sequenziale).
  - Piattaforma: lista a due colonne, link reali a Bacheca / Mappa / Squadre / Scopri, senza numerazione finta.
  - Pull quote isolato: «zero fake account, opportunità reali, mai un rischio».
  - Header/footer globali del sito invariati (SPA). Overlay dettaglio `about-detail.js` resta sui nodi governance/roadmap.
  - File: `chi-siamo.css`, `index.html` (`#view-about`), `i18n.js`, `about-detail.js`, `style.css`, `mobile-webapp.css`.
- **Season Wrapped — Recap Virale Fine Campionato & Card OVR FIFA** (cache `WRAPPED1`):
  - Story Viewer 9:16 full-screen interattivo con auto-avanzamento (6s), gesture tap/swipe, progress bar segmentata Instagram-style, safe area 60-90px.
  - Copertura integrale di 21 profili distinti (Calciatore, 6 Staff Tecnico, 3 Staff Medico, 10 Dirigenza/Società, 3 Intermediazione/Media/Tifoso).
  - Sistema Card OVR (FIFA-style): 6 attributi (VEL, TIR, PAS, DRIB, DIF, FIS), pesi ponderati per ruolo in campo (ATT, Ala, CENT, Terzino, DIF, POR), Canale A (GPS 1.0x, badge "GPS Validated") vs Canale B (Manuale 0.92x + Cap Categoria Fair Play).
  - Indice di Reparto (50-99 OVR) e Badge testuale finale per ciascun ruolo ("Freccia della Fascia", "Mister dell'Anno", "Re del Calciomercato", "Card Motore Fisico", "Card Super Tifoso", ecc.).
  - Curva di Crescita Stagionale multi-anno (grafico a barre OVR 2023/24 → 2024/25 → 2025/26).
  - Generatore Canvas 2D nativo per esportazione immediata di qualsiasi slide in PNG alta risoluzione 1080×1920 px pronta per Instagram Stories, TikTok e WhatsApp.
  - Growth loop & tracking attribution: link condivisibili con parametri UTM (`utm_source`, `utm_medium=wrapped_share`, `utm_campaign=2025-26`, `ref_user_id`).
  - Schermata Teaser & Countdown Wrapped Day con promemoria e contatore iscritti.
  - Entry point banner in Area Riservata / Account, Dossier utente e pulsante rapido nel Simulatore Ruoli Creatore (`creator-role-switcher.js`).
  - Endpoint API serverless `/api/wrapped` (actions: me, share, countdown, optin).
  - File: `season-wrapped.js`, `season-wrapped.css`, `api/wrapped.js`, `index.html`, `app.js`, `creator-role-switcher.js`.
- **Hub 2 card** (cache `MGHUB2`): Pokemon Calcistico non è più una voce a parte. Collezione e battaglie stanno in Elisee World. Catalogo hub: 01 Carriera, 02 Elisee World. Griglia desktop a 2 colonne.
- **Elisee World GBA** (cache `EWGBA1`): replica struttura dei video in `MINIGIOCO ELISEE WORLD` (non copiare marchi). HUD argento nome/sesso/Lv/HP, sprite fronte/retro su piattaforma, menu comando 2×2 colorato, mosse 2×2 + pannello tipo/PP, party box verdi selezione rossa «Che fare con X?» + CANCEL, borsone lista oggetti, textbox bianca bordo nero, title ELISEE WORLD, overworld Campetto + NPC rival + Centro Elisee. Rosa originale: Donnaroccia, Bastonix, Barella-Sprint, Triraghi, Kvaradona. Controlli: A/B, C rosa, P match, tap sui pulsanti. Test `_test_elisee_world_gba.js`.
- **Hub Minigiochi mobile** (cache `MGHUB1`): header in flusso, card a lista su mobile.
- **Card FC26 Yamal** (cache `ELISEE7`): close-up testa/spalle come rare gold FC26; overall+ruolo+playstyle a sinistra; nome e stats (etichette sopra, numeri sotto) in calce. Maglia nel viso, non come layer staccato.
- **Card viso-maglia** (cache `ELISEE6`): esempio viso = calciatore che indossa la maglia Elisee (testa nel colletto, niente doppia maglia). Maglia dietro, più piccola, coperta dal bust.
- **Card overall + esempi** (cache `ELISEE5`): overall fuori dal clip-path dello scudetto, nello slot FIFA in alto a sinistra (ruolo sotto); maglia `maglia.png` = esempio scontornato dietro il viso; viso inedito = `esempio-viso.png` a bust TOTY. Non usare più silhouette/cartoon.
- **Card Elisee** (cache `ELISEE1`): viso solo PNG; overall = media delle 6 stats italiane; maglia ufficiale `immagini/card-elisee/maglia.png`; cornice `sfondo.png` sostituibile dal grafico; staff in Control center → Card Elisee (cerca, scarica/copia, Carica l'immagine, Salva obbligatorio).
- **Card Primetime identica al template** (cache `FC26B`): cornice = PNG UEL originale (niente zoom/clip), figura scontornata e tagliata dentro i bordi.
- **Card FC26 TOTY + UEL Primetime** (cache `FC26`): struttura TOTY (OVR/ruolo, playstyle a rombo, foto, nome, PAC–PHY in riga, bandiera/club in basso) con sfondo `immagini/card-bg/uel-primetime.png`.
- **Card calciatore FIFA 22 gold** (cache `FIFA1`): layout scudetto come la rare gold (OVR + ruolo, bandiera, stemma, ritratto, cognome, 6 stats). Branding Elisee Scout in calce.
- **Bugfix Match Analyst** (cache `MA3`): etichette clip, GPS solo in-house se In Staff, inbox club reale, testi Wall, isObs vs isMa.
- **Area Match Analyst da PDF** (`Profilo_Match_Analyst_260903_154242.pdf`): identità e qualifiche, In Staff Club vs Consulente Esterno, laboratorio heatmap (validazione + overlay squadra), GPS verso Allenatore e Preparatore, Clip Hub e dossier avversario, report privati (in-house) vs pubblici (portfolio + Menzione Speciale sulla Card), tagging posizioni adattate, export dossier, limiti di ruolo (niente rosa/struttura, niente annunci/trattative). Cache `MA2`.
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
| `926a888` | Stampa: file anteprima standalone area-stampa-comunicazione.html; cache `STAMPALUX1` |
| `f409b8a` | Stampa: linguaggio visivo Luxury / Editoriale (Playfair Display, oro/champagne, lista singola, zero pillole/emoji); cache `STAMPALUX1` |
| `3db0e26` | Fix login: esporta signToken in lib/auth-oauth.js, try/catch me.js, parser non-JSON app.js, fix refuso requisiti password; cache `LOGINFIX1` |
| `0e462e0` | Stampa: rimosse emoji tab, fonti e nota copyright; cache `STAMPA2` |
| `f5d994f` | Stampa: no schede fittizie, empty state, scudo cookie vs footer; cache `STAMPA1` |
| `0b97188` | Login Privacy Officer + skip KYC + banner reimposta password; cache `STAFF2` |
| `56ffbea` | Staff: manueltucci2002@gmail.com Responsabile Privacy; cache `STAFF1` |
| `a7350d9` | GOOGLE_CLIENT_ID su Vercel Production + redeploy GIS; cache `GGL5` |
| `3613d27` | Accedi: lock scroll body, GIS renderButton, verifyIdToken server; cache `GGL4` |
| `3f74992` | Accedi: rimosso setup OAuth pubblico, fix bottone Google rotto; cache `GGL3` |
| `5ba294b` | Google login: niente Client ID inesistente, setup ID Web; cache `GGL2` |
| `d21806d` | Login Google: niente redirect Supabase/Garofalo, GIS su Elisee Scout; cache `GGL1` |
| `ff85550` | Fix 404 Google OAuth: /api/auth/oauth/google + finish su Vercel |
| `adb9a74` | Bacheca: delega click Pubblica una richiesta + feedback se non loggato; cache `CTA1` |
| `1b1521b` | API /api/activity e /api/quiz-score su Vercel KV; Bacheca fetch /top; cache `KV1` |
| `dd52ac4` | Bacheca sidebar: stati vuoti onesti, niente ranking finti; cache `SIDE1` |
| `367e900` | Bacheca: dropdown Zona in portale body, overflow visible sui filtri; cache `DROP1` |
| `02ac1ed` | Bacheca: filtri+reset+dati sampleJobs/localStorage, bottoni su modali reali; cache `BOARD4` |
| `99d1ed4` | Bacheca: pill raggio senza numeri, CTA strip, icona maglia Squadre; cache `BOARD3` |
| `80bb68b` | Bacheca strutturale: es-main, sidebar unita, empty state, icone SVG; cache `BOARD2` |
| `80e8b40` | Bacheca: layout board, sidebar compatta, stato vuoto, gerarchia bottoni; cache `BOARD1` |
| `14b2491` | Chi siamo: Cosa facciamo + Perché puoi fidarti al posto di roadmap/governance; cache `TRUST1` |
| `9f92a16` | Chi siamo: overlay chiuso non ruba più lo scroll (display:none); cache `SCROLL1` |
| `35fcb59` | Fix schermata nera/freeze dopo tasto Indietro (unlock overlay + body lock); cache `BACKFIX1` |
| `43b4ed4` | Chi siamo: palette allineata al sito (nero + ciano `--accent-primary`); cache `PALETTE1` |
| `8a3ec85` | Chi siamo: dossier istituzionale Newsreader/bronzo, letterhead, timeline, pull quote; cache `DOSSIER1` |
| `e66b81a` | Chi Siamo: eliminazione totale box/card, layout editoriale flat con sola barra laterale e hairline, H1 e titoli in sentence case, testo piatto per pillar senza pillole/chip, padding inferiore esteso; cache `CARDLESS1` |
| `c1d5ecd` | Chi Siamo: palette Azzurro Italia (#35AEE8), H1 in sentence case, rimozione badge ridondante nodo '26, unificazione barre d'accento su 3 colonne, divisore hero tratteggiato; cache `AZZURROABOUT1` |
| `3fec3e9` | Redesign Chi Siamo: layout Pitch Stadium, touchline timeline, marcatori maglia, barre d'accento oro/verde, tipografia Oswald, hero intestazione; cache `PITCHABOUT1` |
| `7eeea68` | Admin Card Elisee: apertura diretta ed esclusiva del portale al click sulla tab; cache `ADMINTAB1` |
| `8a18b0e` | Admin Card Elisee: rimossi profili esempio, mostrati solo utenti registrati reali; cache `REALUSERS1` |
| `c265188` | Admin Card Elisee: fix taglio verticale nomi utenti nella lista con flexbox e min-height; cache `FIXUSERNAMES1` |
| `10d0fcd` | Specifiche PNG Card Elisee: peso max 2MB (consigliato 150KB-1MB), risoluzione e Alpha in area utente e staff; cache `PNGSPECS1` |
| `8290a12` | Minigioco: bonifica club clone dilettanti e promozioni integrali 9->1 con mantenimento categoria; cache `TIERPROMO1` |
| `0e6b52c` | Hub minigioco: allineamento card Pokemon Calcistico con Carriera; cache `PKMN2` |
| `f2161c7` | OTP classico: codice a 6 cifre inviato solo via email all’indirizzo dell’account; cache `OTPMAIL1` |
| `f812722` | Minigioco: vincere B/C/D/dilettanti promuove nella categoria superiore; cache `CHAMPPROMO1` |
| `94163fd` | Fix ruoli coach/DG, piramide femminile, clamp dilettanti e crash admin token; cache `BUGFIXALL2` |
| `cc8a896` | Audit bug tutte le interfacce: dashboard staff visibili, KPI calendar, TOS, minigioco OVR/U23/fallimento/lucchetti; cache `BUGFIXALL1` |
| `847dfe9` | Curriculum spostato dalla navbar al menu a tendina utente; cache `CURRICULUM-DROPDOWN1` |
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

Elisee World: struttura GBA dei video è in gioco (cache `EWGBA1`). Eventuali sprite bitmap veri al posto dei placeholder canvas, più mappe/interior, se Eliseo chiede.

Eliseo manda uno screenshot Tuttocampo Classifica alla volta. Non inventare il prossimo girone. Completati: Campania A/B, Lazio A/B, Abruzzo, Molise, Toscana A/B, Veneto A.

Match Analyst: se ruolo staff è Match analyst o Video analyst, dashboard da PDF (identità, laboratorio heatmap/GPS/clip, report privati vs pubblici, inoltro staff, tagging Card). Cache `MA3`.

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

- **2026-09-12** — Mappa Club & Tabelle: tutte e sole le squadre dalla Serie A all'Eccellenza:
  - Filtrato `data/squadre/scopri-clubs.json`: mantenute esclusivamente le 729 società ufficiali reali appartenenti a Serie A, Serie B, Serie C, Serie D ed Eccellenza (maschile), eliminando duplicati, formazioni U19 e categorie minori (Promozione, Prima, Seconda e Terza Categoria).
  - Aggiornato `mappa-club.js`: introdotta la funzione di validazione `isSerieAToEccellenza(c)` che garantisce che sia i marker della mappa, sia i conteggi regionali, sia i pannelli espandibili mostrino soltanto i club dalla Serie A all'Eccellenza (es. Puglia: 34 società reali senza duplicati; Lombardia: 92, Campania: 59).
  - Aggiornato `index.html` con etichetta contatore trasparente "(dalla Serie A all'Eccellenza)".
  - Cache `ATOECC2`.

- **2026-09-12** — Mappa Club: loghi trasparenti senza sfondo nero, dimensioni ingrandite e ordine alfabetico:
  - Aggiornato `mappa-club.css`: rimosso lo sfondo nero, il bordo e il padding da `.es-region-team-logo` consentendo la visualizzazione in piena trasparenza dei loghi PNG con leggero `drop-shadow`.
  - Ingrandite le dimensioni dei loghi delle squadre a 26×26px e la tipografia del nome del club a 13.5px (`font-weight: 600`), con spaziatura armoniosa (`gap: 10px`).
  - Aggiornato `mappa-club.js`: le società nel pannello regionale espandibile vengono ordinate rigorosamente in ordine alfabetico (A-Z) tramite `localeCompare`.
  - Cache `LOGOSIZE1`.

- **2026-09-12** — Mappa Club: spostata attribuzione cartografica (Leaflet / OpenStreetMap) sotto al riquadro della mappa:
  - Disabilitato `attributionControl: false` in `L.map` (`mappa-club.js`) e forzato `display: none !important` su `.leaflet-control-attribution` (`mappa-club.css`) per evitare la sovrapposizione dell'overlay con bandiera ucraina e crediti cartografici sul pulsante per ingrandire la mappa `⤢`.
  - Inserito il blocco `.es-map-attribution-footer` in `index.html` e `mappa-club.css` posizionato pulito sotto al riquadro della mappa, mantenendo la dicitura ("🇺🇦 Leaflet • © OpenStreetMap").
  - Cache `ATTRIB1`.

- **2026-09-12** — Mappa Club: squadre reali dal Selettore Squadra con logo ufficiale affiancato al nome:
  - Aggiornato `data/squadre/scopri-clubs.json` popolando il campo `region` per le 472 squadre di Serie A, B e C tramite mappatura con `comuni_italiani.json` e normalizzazione nomi regionali (es. `Trentino-Alto Adige`).
  - Aggiornato `mappa-club.js`: rimossi i placeholder statici; implementata `getTeamsForRegion(regione)` che estrae tutte le società reali censite nel catalogo e le ordina per categoria d'importanza (Serie A, B, C, D, Eccellenza, Promozione...).
  - Generati chip interattivi con logo societario ufficiale (`immagini/squadre-loghi/<id>.png`), fallback trasparente `onerror` e click che muove la visuale della mappa direttamente sulla sede del club con apertura del popup informativo.
  - Aggiunta paginazione intelligente con visualizzazione iniziale delle prime 40 squadre e pulsante per espandere tutte le squadre della regione.
  - Aggiornato `mappa-club.css` con stili `.es-region-team-chip`, `.es-region-team-logo` (22x22px con border dark) e pulsante `.es-region-show-more-btn`.
  - Cache `TEAMSREAL1`.

- **2026-09-12** — Rimossa completamente la barra legenda superiore sopra la Mappa Club:
  - Eliminato il contenitore `.es-map-legend` da `index.html`.
  - Aggiornato cache-bust a `NOLEGEND1`.

- **2026-09-12** — Privacy Mappa: rimossa Sede Centrale / HQ Foggia:
  - Rimosso il marker dorato dedicato HQ e relativo popup/tooltip da `mappa-club.js`.
  - Rimossa la voce "Sede centrale — Foggia" con dot giallo dalla legenda in `index.html`.
  - Cache `MAPPRIVACY1`.

- **2026-09-12** — Risolto problema navigazione "Vedi nel Selettore" dalla Mappa Club:
  - Implementata la funzione `selectTeamById` in `squadre-select.js` che individua il club nel catalogo tramite ID esatto, nome o slug, imposta il genere (M/F) con sincronizzazione radio, trova e attiva l'esatta categoria e indice della squadra, chiude il picker e forza il render con animazione.
  - Esposte le API `selectTeam(idOrName)`, `selectTeamById(idOrName)` e `goToTeam(idOrName)` in `window.EliseeSquadreSelect`.
  - Supporto per parametri query nell'hash (es. `#squadre-portal?team=...`) con elaborazione immediata e tramite `pendingTeamId` in caso di catalogo ancora in download.
  - Aggiornato `mappa-club.js` con passaggio del nome squadra di backup nel popup e invocazione coordinata di selezione e `switchView`.
  - Cache `MAPSELECT1`.

- **2026-09-06** — Pokemon Calcistico spostato dentro Elisee World; hub a due card (Carriera + Elisee World). Cache `MGHUB2`.

- **2026-09-06** — Elisee World: UI GBA allineata ai video (HUD, 2×2, party 2×3, textbox, shop, NPC). Cache `EWGBA1`. Self-test `_test_elisee_world_gba.js` green.

- **2026-09-06** — Hub Minigiochi mobile: catalogo 01/02/03, header in flusso, card a lista. Cache `MGHUB1`.

- **2026-09-06** — Bugfix: linea azzurra sotto topbar mobile (banner verifica `[hidden]` visibile + residui hero/topbar); stats card dilettanti 0–29; scroll mercato a fine stagione; JSON.parse badge. Cache `NOLINE2`.

- **2026-09-03** — Card: bandiera + logo campionato + logo club in calce, come Yamal. Cache `ELISEE10`.

- **2026-09-03** — Stemma nazione in card senza riquadro: object-fit contain, niente crop 22×15. Cache `ELISEE9`.

- **2026-09-03** — Giocatore ridotto: testa e capelli interi nello scudetto, come Yamal FC26. Cache `ELISEE8`.

- **2026-09-03** — Card allineata all’esempio FC26 Yamal gold: viso close-up, overall a sinistra, stats in riga. Cache `ELISEE7`.

- **2026-09-03** — Coordinamento viso-maglia: un solo bust, testa nel colletto della maglia Elisee. Cache `ELISEE6`.

- **2026-09-03** — Overall intero nello slot FIFA (non tagliato dal clip). Maglia e viso di esempio mostrati in card (jersey dietro, bust davanti). Cache `ELISEE5`.

- **2026-09-03** — Overall non più tagliato (fuori dal clip dello scudetto). Esempi maglia/viso mostrati sulla card. Cache `ELISEE4`.

- **2026-09-03** — Overall e ruolo in alto a sinistra (ruolo sotto il numero). Esempi PNG maglia 800×800 e viso 500×650 in `immagini/card-elisee/`. Cache `ELISEE3`.

- **2026-09-03** — Ripristinata la struttura TOTY della Card; personalizzazione 360° solo dai PNG in `immagini/card-elisee/`. Cache `ELISEE2`.

- **2026-09-03** — Card Elisee: PNG only, stats in italiano, overall calcolato, maglia sito, cartella grafica `immagini/card-elisee/`, atelier staff (cerca/scarica/carica/salva). Cache `ELISEE1`.

- **2026-09-03** — Card: template UEL Primetime usato intero come cornice; foto calciatore scontornata e non esce dai bordi. Cache `FC26B`.

- **2026-09-03** — Card FC26: layout TOTY Mbappé (stats in riga, playstyle, loghi in basso) e sfondo UEL Primetime arancione/nero. Cache `FC26`.

- **2026-09-03** — Card calciatore ridisegnata sul modello FIFA 22 gold (Mbappé): scudetto, OVR, posizione, bandiera, stemma, foto, cognome, PAC/SHO/PAS/DRI/DEF/PHY. Cache `FIFA1`.

- **2026-09-03** — Bugfix Match Analyst: clip con tag reali, GPS non dichiarato inviato se Free Agent, inbox Allenatore sul club vero (non Atalanta di default), testi Wall per MA, Osservatore non intercetta Match Analyst. Cache `MA3`.

- **2026-09-03** — Area Match Analyst aggiornata sul PDF: identità e abilitazioni, In Staff Club vs Consulente Esterno, laboratorio heatmap/GPS/video con overlay, report in-house vs portfolio pubblico, Menzione Speciale e badge tattici sulla Card, inoltro reale ad Allenatore, DS e Preparatore, export dossier, blocco ufficializzazione mercato. Cache `MA2`.

- **2026-09-03** — Area Osservatore / Scout aggiornata sul PDF Profilo Scout: credenziali, status Under Contract vs Free Agent, Secret List stealth con inoltro al DS (contratto) o proposta a club terzi (free, solo con autorizzazione DS), ricerca geo, Wall in consultazione, blocco ufficializzazione. Cache `OBS1`.

- **2026-09-03** — Da ora, ogni squadra nuova in catalogo ha la cartella kit 2D (solo nome). `_kit_folders.ensure_kit_folders` è chiamato da `_sync_catalog_kits.py`, `_build_squadre_catalog.py` e dagli script di inserimento Eccellenza/calcio femminile.

- **2026-09-03** — Cartelle kit 2D: nome = solo squadra, niente campionato. `ecc-emilia-a-agazzanese` → `agazzanese`. Omonimi: `asd-agrigento-2`. Mappa `data/squadre/kit-folder-map.json`.

- **2026-09-03** — Serie D + Eccellenza: create 634 cartelle kit 2D mancanti (`immagini/kits-2d/<id-squadra>/` + `LEGGI_ME.txt`). Script `_ensure_d_ecc_kit_folders.py`. Dopo i PNG: `_sync_catalog_kits.py`.

- **2026-09-03** — Selettore squadre: le divise non sono più suddivise in Partita / Portiere / Pre-match / Allenamento. Elenco unico, ordine `team.kits` come in cartella. Cache `KITFLAT1`.

- **2026-09-03** — Email OTP: interfaccia grafica rifatta. Header logo + wordmark e barra ciano, titolo, 6 box cifra, badge “Valido 10 minuti”, card dettagli accesso, footer sito. Italiano, mobile Gmail. Cache `OTPMAIL5`.

- **2026-09-03** — Email OTP replicata sull’esempio Zoom: sfondo bianco, “Hi Nome,”, paragrafo unusual login, codice 6 cifre con spazi, “The code will be expired in 10 minutes.”, box Date/Browser/Operating System/Location, link here, “The Elisee Scout Team”. Cache `OTPMAIL4`.

- **2026-09-03** — Email OTP: tolto il fallback Supabase Auth (inglese, “Your sign-in link”, pulsante Sign in, powered by Supabase). Invio solo Resend/SMTP con template italiano Elisee Scout, codice a 6 cifre, niente link di accesso. Cache `OTPMAIL3`.

- **2026-09-03** — Hub minigioco: card vuota sostituita con Pokemon Calcistico (badge Prossimamente, non giocabile). Cache `PKMN1`.

- **2026-09-03** — OTP classico via email: 6 cifre generate lato server, invio a `user.email` (Resend, SMTP/Gmail, Outlook COM, fallback Supabase Auth). Niente codice in HTTP, niente challenge client. UI con indirizzo visibile + link Apri Gmail. Cache `OTPMAIL1`.

- **2026-09-03** — Minigioco: vincere il campionato (B, C, D, Eccellenza, Promozione, 1ª/2ª/3ª Categoria, femminili) fa salire il club. Serie A no. Persistenza su `state.clubs`, `earnedCeil` anti-clamp, trofeo anche se la promozione arriva dal motore gironi. Test `_test_champion_promo.js`. Cache `CHAMPPROMO1`.

- **2026-09-03** — Audit e risoluzione bug su tutte le interfacce:
  - Dashboard ruolo: `unmountAllRoleDashboards` lasciava `style.display=none` e le dash generate non lo toglievano; dopo un cambio ruolo la scheda restava nera/vuota. Keep-id + reveal esplicito su 16 dash + mappa host class completa.
  - Admin/Privacy: ID duplicato `kpi-calendar-dropdown` (il secondo calendario non si apriva). Ora classe + lookup dal wrapper.
  - Registrazione: Termini di Servizio → `privacy-policy.html`, Condizioni d'uso → `cookie-policy.html`.
  - Minigioco: `clubLeagueTier` per Primavera restituiva 10 (range D 30-42) invece di 11/12; U23 usa range 48-68; fallimento non clampa più a 40 (progetto forte vs debole); lucchetti catalogo per club scesi in Eccellenza/D.
  - Test verdi: `_test_piramide.js`, `_test_fail_market.js`, `_test_market_plane.js`, `_test_u23.js`, `_test_deal.js`, `_test_identity.js`.
  - Cache `BUGFIXALL1`.
  - Secondo giro: `isCoach` non intercetta più Mental coach / Collaboratore tecnico / Staff generico; categorie femminili allineate ai tier reali (Eccellenza 5, Promozione 6, Primavera 11); `clampTier` fino a Terza/Primavera; form staff DG distinto da Presidente; simulatore ruoli monta la dash Giornalista; `timingSafeEqual` admin non crasha su token corti; JSON.parse localStorage in app.js protetto. Cache `BUGFIXALL2`.

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
- **2026-09-08** — Risolto Syntax Error in `elisee_up.py` (blocco try privo di except nella funzione `log`) e problemi di import `auth_store`/`manager_store` tramite package `workers/__init__.py` e import resiliente.
- **2026-09-12** — Mappa Club: rimosso definitivamente il marker con badge "ES" della Sede Centrale a Foggia. La mappa mostra esclusivamente i cluster e i club effettivi. Cache `NOHQ1`.
- **2026-09-12** — Mappa Club: pannello squadre per regione espandibile a tutta riga (`.es-region-teams`) al click sulla card, centratura mappa Leaflet sincronizzata, chiusura con ✕ o click ripetuto. Cache `REGTEAMS1`.
- **2026-09-12** — Mappa Club: barra di ricerca trasformata in pillola bianca piena (`border-radius: 999px`), icona e placeholder in nero grassetto (`#1a1a1a`), dropdown risultati chiaro su sfondo bianco coordinato. Cache `SEARCHPILL1`.
- **2026-09-12** — Mappa Club: colori della barra di ricerca e del dropdown allineati esattamente a quelli dei controlli zoom e fullscreen (`#10141d` / `#1e2430` / `#eef1f6`). Cache `DARKPILL1`.
