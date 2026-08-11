# -*- coding: utf-8 -*-
"""
Ricostruisce Elisee_Scout.pdf = backup business plan (77 pag) + appendice workflow COMPLETA del sito.
"""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable,
    KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from pypdf import PdfReader, PdfWriter
import io
import os

SITE = Path(r"D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO")
BACKUP = SITE / "Elisee_Scout_backup_pre_workflow.pdf"
MAIN = SITE / "Elisee_Scout.pdf"
# Preferisci backup integro se presente
SOURCE = BACKUP if BACKUP.exists() else MAIN
OUT = SITE / "Elisee_Scout.pdf"

CYAN = HexColor("#38bdf8")
DARK = HexColor("#0a0f1a")
MUTED = HexColor("#475569")
LIGHT = HexColor("#f8fafc")
BORDER = HexColor("#e2e8f0")
NAVY = HexColor("#0f172a")

styles = getSampleStyleSheet()
for name, kwargs in {
    "CoverTitle": dict(fontName="Helvetica-Bold", fontSize=24, leading=30, textColor=DARK, spaceAfter=8),
    "CoverSub": dict(fontName="Helvetica", fontSize=11, leading=15, textColor=MUTED, spaceAfter=6),
    "H1Doc": dict(fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=DARK, spaceBefore=12, spaceAfter=6),
    "H2Doc": dict(fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=HexColor("#0284c7"), spaceBefore=9, spaceAfter=4),
    "H3Doc": dict(fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=DARK, spaceBefore=7, spaceAfter=3),
    "BodyDoc": dict(fontName="Helvetica", fontSize=9, leading=12.5, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=4),
    "BulletDoc": dict(fontName="Helvetica", fontSize=8.8, leading=12, textColor=DARK, leftIndent=6, spaceAfter=1.5),
    "SmallMuted": dict(fontName="Helvetica", fontSize=7.5, leading=10, textColor=MUTED, spaceAfter=2),
    "TableCell": dict(fontName="Helvetica", fontSize=7.8, leading=10.5, textColor=DARK),
    "TableHead": dict(fontName="Helvetica-Bold", fontSize=7.8, leading=10.5, textColor=white),
}.items():
    styles.add(ParagraphStyle(name=name, **kwargs))


def hr():
    return HRFlowable(width="100%", thickness=0.6, color=CYAN, spaceBefore=3, spaceAfter=6)


def bullets(items):
    return [Paragraph(f"• {it}", styles["BulletDoc"]) for it in items]


def tbl(headers, rows, widths):
    data = [[Paragraph(h, styles["TableHead"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), styles["TableCell"]) for c in row])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT, white]),
    ]))
    return t


story = []

# ========== COVER ==========
story.append(Paragraph("ELISEE SCOUT", styles["CoverTitle"]))
story.append(Paragraph(
    "Appendice operativa completa — Workflow digitale del prodotto &amp; del sito prototipo",
    styles["CoverSub"]
))
story.append(Paragraph(
    "Integrazione al Pitch &amp; Business Plan (documento principale, pagine precedenti). "
    "Questa appendice descrive in modo esaustivo tutto il workflow implementato nel progetto "
    "<b>ELISEE SCOUT SITO</b>: macroaree UI, autenticazione, dossier, bacheca, network, ambassador, "
    "admin/garante, anti-fake, cookie, i18n, libreria immagini, convenzione «Aggiorna», stack e roadmap.",
    styles["BodyDoc"]
))
story.append(Paragraph(
    "Data appendice: 2026-07-30 · Localhost: http://127.0.0.1:8765/ · Cartella: Desktop/ELISEE SCOUT SITO",
    styles["SmallMuted"]
))
story.append(hr())

story.append(Paragraph("Indice completo appendice", styles["H1Doc"]))
toc = [
    "A. Relazione col Business Plan (cosa c'è già nel PDF principale)",
    "B. Inventario file del prototipo e stack tecnico",
    "C. Design system luxury editorial (pf- / hero / about-split)",
    "D. Navigazione e switchView — mappa macroaree",
    "E. Home — struttura e sezioni",
    "F. Chi siamo — layout e contenuti",
    "G. Curriculum / Pillars — layout CV e badge",
    "H. Portfolio / Bacheca — filtri, annunci, aside",
    "I. Network — ricerca, follow, card profilo",
    "J. Ambassador — form, firma, contratto",
    "K. Account gate — utente vs admin",
    "L. Dossier utente — campi e step approvazione",
    "M. Admin &amp; Garante Privacy — governance, opzioni, pipeline auto-fix",
    "N. Auth unificata — Email, Google, Apple, SPID providers",
    "O. Registrazione e cookie consent",
    "P. Workflow anti-fake e badge di verifica",
    "Q. Sessioni, localStorage e sicurezza lato client",
    "R. Libreria immagini/ e convenzione «Aggiorna»",
    "S. Internazionalizzazione i18n.js",
    "T. Flussi utente end-to-end (diagrammi testuali)",
    "U. Allineamento pillar/agenti del business plan ↔ schermate sito",
    "V. Gap residui prototipo → prodotto e roadmap",
]
for i, t in enumerate(toc, 1):
    story.append(Paragraph(f"{i}. {t}", styles["BulletDoc"]))

story.append(PageBreak())

# ========== A ==========
story.append(Paragraph("A. Relazione col Business Plan", styles["H1Doc"]))
story.append(hr())
story.append(Paragraph(
    "Il PDF principale (prime ~77 pagine) contiene già la strategia completa: Executive Summary, "
    "analisi mercato, pillar 01–1386, business model, pannello admin (sez. 5 incl. workflow anti-fake 5.3), "
    "agenti IA (203 + estensioni + 500 di pronto intervento), missione voci del calcio, roadmap compliance "
    "GDPR/minori/pagamenti, principi guida, DPIA AI, aree Admin vs Garante. "
    "<b>Questa appendice non riscrive i 1.386 pillar</b>: documenta il <b>workflow implementato nel sito</b> "
    "e come si collega a quelle sezioni.",
    styles["BodyDoc"]
))
story.append(Paragraph("Sezioni business plan già nel documento principale (riferimento)", styles["H2Doc"]))
story.extend(bullets([
    "Sez. 1–2 — Visione e mercato (LinkedIn/Indeed del calcio dilettantistico)",
    "Sez. 3 / 6 — Pillar 01–350 e 351–1350 (+ 1351–1386 missione)",
    "Sez. 4 — Monetizzazione freemium B2C/B2B",
    "Sez. 5 — Governance &amp; Trust (analytics, foto obbligatoria, anti-fake, badge, notifiche, password)",
    "Sez. 7 — Agenti IA per pillar e governance",
    "Sez. 8 — Missione e voci del calcio italiano",
    "Sez. 9–10 — Compliance e principi non negoziabili",
    "Sez. 11 — 500 agenti auto-riparazione",
    "Sez. 14–19 (estese) — Badge, admin/garante, DPIA AI",
]))

# ========== B ==========
story.append(Paragraph("B. Inventario file del prototipo e stack", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["File / cartella", "Ruolo"],
    [
        ["index.html", "Struttura UI, macro-viste, modal auth/registrazione, footer"],
        ["style.css", "Design system, hero, about-split, resume, pf-page luxury"],
        ["app.js", "switchView, network, bacheca, dossier, admin, ambassador, cookie"],
        ["i18n.js", "Dizionari IT/EN/ES/FR + selettore lingua"],
        ["immagini/", "Asset per cartella + aggiorna-immagini.ps1 + INDICE.md"],
        ["Elisee_Scout.pdf", "Business plan + questa appendice"],
        ["pdf_text.txt", "Estratto testuale del business plan (reference)"],
    ],
    [4.5 * cm, 12 * cm]
))
story.append(Spacer(1, 5))
story.append(Paragraph(
    "Stack: HTML5 + CSS + JS vanilla, font Outfit/Inter, icone Lucide, jsPDF CDN, dati demo in localStorage, "
    "server locale python -m http.server porta 8765. Nessun backend di produzione nel prototipo.",
    styles["BodyDoc"]
))

# ========== C ==========
story.append(Paragraph("C. Design system luxury editorial", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Palette: #050608 / #0a0f1a, testo #fff/#94a3b8, accent #38bdf8",
    "Header portfolio trasparente → .is-scrolled solido; nav IT: Home, Chi siamo, Curriculum, Portfolio, Network, Ambassador",
    "Header destra: selettore lingua, Accedi, Iscriviti (email header rimossa)",
    "Classi chiave: hero-portfolio, about-split-page, resume-page, pf-page / pf-header / pf-toolbar / pf-job-card / pf-person-card",
    "Bottoni .btn-outline-pill — niente gradient «infantili» sulle macroaree public",
    "Obiettivo UX: stesso linguaggio di Home/Chi siamo su tutte le macroaree pubbliche",
]))

story.append(PageBreak())

# ========== D ==========
story.append(Paragraph("D. Navigazione e switchView", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["Nav IT", "viewType", "Hash", "Contenuto"],
    [
        ["Home", "home", "#hero", "Hero + sezioni portfolio + join"],
        ["Chi siamo", "about", "#about", "Split testo | ritratto"],
        ["Curriculum", "pillars", "#dashboard-skills", "Skill bars, timeline, badge"],
        ["Portfolio", "bacheca", "#bacheca-annunci", "Bacheca annunci + filtri"],
        ["Network", "persone", "#persone-portal", "Cerca e segui persone"],
        ["Ambassador", "ambassador", "#ambassador-portal", "Form + contratto"],
        ["Account", "account", "#account-portal", "Gate utente / admin"],
        ["—", "user-dossier", "#user-dossier-portal", "Dossier atleta"],
        ["—", "admin", "#admin-portal", "Login + dashboard governance"],
    ],
    [2.8 * cm, 2.8 * cm, 3.8 * cm, 7.1 * cm]
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "switchView: nasconde tutte le macro-viste, attiva la target, aggiorna localStorage elisee_view / elisee_hash, "
    "history.pushState, scroll top, re-icon Lucide, sync mirror trending/leaderboard in bacheca.",
    styles["BodyDoc"]
))

# ========== E ==========
story.append(Paragraph("E. Home — struttura e sezioni", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Hero full-viewport: foto immagini/01-home-hero/hero-workspace.jpg, titolo ELISEE / SCOUT, ruolo i18n, CTA Chi siamo + Portfolio, social",
    "Sezione About teaser (home-about): copy + footballer portrait",
    "Sezione Resume teaser: 1.386 pillar · 715 IA · stats GDPR/Italia",
    "Sezione Portfolio cards: Bacheca, Network, Dossier, Ambassador",
    "Sezione Join: Google, Apple, SPID, email",
    "Host nascosti per JS legacy: trending, leaderboard, news, annunci, skill select, news tabs",
]))

# ========== F ==========
story.append(Paragraph("F. Chi siamo", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Layout about-split: sinistra titolo CHI SIAMO + bio i18n + sede Puglia/Foggia; destra about-portrait.jpg B/N",
    "Host nascosti role-tab / role-display-box per compatibilità app.js (ruoli player/club/staff/agent/parents)",
    "Contenuti roleData in app.js: feature list per Giocatore, Club, Staff, Scout, Genitori (pillar riferiti)",
]))

# ========== G ==========
story.append(Paragraph("G. Curriculum / Pillars", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "3 colonne: Platform Skills (barre %), Lingue, Soft pillars | Roadmap 2023–2026 + Education | What we can do + Domain + Trust badges",
    "Badge click → openBadgeInfoModal(gdpr|figc|video|gps|2fa|derossi)",
    "Header pf- con CTA Portfolio / Chi siamo",
]))

story.append(PageBreak())

# ========== H ==========
story.append(Paragraph("H. Portfolio / Bacheca", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Filtri: dropdown ruolo / categoria / zona; chip Under, vitto-alloggio, svincolato",
    "jobs-container: card da sampleJobs (attaccante, portiere, mezzala, match analyst, difensore, preparatore)",
    "filterAndRenderJobs() su change checkbox e dropdown",
    "CTA Candidati → openCandidateModal(title)",
    "Aside: trending-search-list-bacheca, leaderboard-rows-bacheca, searchScout types",
]))

# ========== I ==========
story.append(Paragraph("I. Network", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Campi: search-people-name/surname, role, category → filterPeopleCards / renderPeopleCards",
    "mockPeopleData: 8 profili (calciatori, scout, analyst, direttore, preparatore…)",
    "toggleFollowUser → elisee_followed_users; Dossier → switchView('account')",
    "Card luxury pf-person-card (avatar, status, follower, Segui)",
]))

# ========== J ==========
story.append(Paragraph("J. Ambassador", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Form: amb-name, birthplace, birthdate, cf, address + canvas firma sig-canvas / btn-clear-sig",
    "Submit genera anteprima in contract-render-target",
    "Funzioni correlate: downloadAmbassadorContractPdf / Docx, handleAdminTerminateAmbassador (lato admin)",
    "Business plan: pillar Programma Ambassador / referral",
]))

# ========== K ==========
story.append(Paragraph("K. Account gate", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Due card: Area utente (btn-enter-user-portal → user-dossier) e Admin/Garante (btn-enter-admin-portal → admin)",
    "Accesso anche da nav Accedi / modal email e da menu utente loggato",
]))

# ========== L ==========
story.append(Paragraph("L. Dossier utente — campi e step", styles["H1Doc"]))
story.append(hr())
story.append(Paragraph(
    "updateDossierView() popola i campi da elisee_active_user (DEFAULT_USER + edit modal).",
    styles["BodyDoc"]
))
story.append(tbl(
    ["Gruppo", "Campi / elementi"],
    [
        ["Anagrafica", "nome, cognome, CF, data/luogo nascita, residenza, telefono, email"],
        ["Sport", "ruoloDettagliato, altezzaPeso, presenze, status legale, visita medica"],
        ["GPS", "hardwareGps, topSpeed, distanzaGara, accMax, loadIndex, dataGps"],
        ["Trust", "fotoUrl, consensoTimestamp, hashSha256"],
        ["Step label", "In attesa / 1/2 Selfie AI / 2/2 Audit GDPR / Certificato OK"],
    ],
    [3.5 * cm, 13 * cm]
))
story.append(Spacer(1, 4))
story.extend(bullets([
    "openEditUserModal: form completo salva con saveActiveUser",
    "viewPlayerDetails → user-dossier",
    "nextApprovalStep: 0→1→2 (elisee_approval_step, elisee_mario_rossi_approved al step 2)",
]))

story.append(PageBreak())

# ========== M ==========
story.append(Paragraph("M. Admin &amp; Garante Privacy", styles["H1Doc"]))
story.append(hr())
story.append(Paragraph("Login admin", styles["H2Doc"]))
story.extend(bullets([
    "form-admin-login: admin-user, admin-pass, admin-remember (default demo admin/admin123)",
    "admin-login-guard vs admin-authenticated-dashboard",
    "btn-admin-logout; sessione elisee_admin_auth + activity 2 mesi",
]))
story.append(Paragraph("Dashboard e switcher", styles["H2Doc"]))
story.extend(bullets([
    "btn-show-admin / btn-show-privacy → renderAdminPanel / renderPrivacyPanel in governance-panel-target",
    "Status Admin ONLINE e Garante ONLINE/OFFLINE + presence-last-seen heartbeat 60s",
]))
story.append(Paragraph("Funzioni admin implementate (sintesi da app.js)", styles["H2Doc"]))
story.extend(bullets([
    "confirmAdminOption / executeConfirmedAdminOption — catalogo opzioni governance con form custom getCustomFormHTML",
    "onAdminUserSelectChange — seleziona utente target per opzioni",
    "downloadAdminAuditLogs, terminateUnauthorizedSessions",
    "open2FASetupModal / confirm2FAEnable — 2FA vault demo",
    "openIPAuditModal — audit IP (localhost o IP mock)",
    "triggerDevTeamAutoHealing, triggerJuniorUiFix, triggerJuniorQaScan — pipeline demo",
    "printReportOptional, showOptionResultScreen — report e schermate esito",
    "confirmPrivacyOption — opzioni dedicate Garante",
    "Contratti Ambassador PDF/DOCX e terminate ambassador",
    "Pipeline UI: Router → Diagnoser → Fixer → Verification Agent + pipeline-log-box",
    "Allineamento BP sez. 5 e 11 (governance + 500 agenti pronto intervento)",
]))

# ========== N ==========
story.append(Paragraph("N. Auth unificata", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["Canale", "Entry point", "Dettaglio UI"],
    [
        ["Email", "openAccessoModal('email') / Accedi", "email+password, strength bar, requisiti"],
        ["Google", "openGoogleModal / auth-btn-google", "badge provider + form unificato"],
        ["Apple", "openAppleModal", "come Google"],
        ["SPID", "openSpidModal", "grid provider: Poste, Intesa, Aruba, TIM, Namirial, InfoCert"],
    ],
    [2.5 * cm, 5.5 * cm, 8.5 * cm]
))
story.append(Spacer(1, 4))
story.extend(bullets([
    "Asset SPID/Google/Apple in immagini/07–15-auth-*",
    "Validazione email, errori general, submitAccessoForm (prototipo)",
    "closeAccessoModal / selectSpidProvider",
]))

# ========== O ==========
story.append(Paragraph("O. Registrazione e cookie", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "openRegistrazioneModal: nome, cognome, email, DOB, ruolo (select completo), password x2",
    "Checkbox: TOS obbligatorio, Privacy GDPR Art.13 obbligatorio, cookie profilazione opz., newsletter opz.",
    "Social UI Google/Apple in modal iscrizione",
    "Cookie banner: Solo tecnici / Gestisci preferenze / Accetta tutti → elisee_cookie_consent",
    "acceptCookiesAll / Only / Partial con UI preferenze analytics/profiling/marketing",
]))

story.append(PageBreak())

# ========== P ==========
story.append(Paragraph("P. Anti-fake e badge (collegamento BP 5.3)", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Workflow BP 5.3: approvazione anti-fake account — nel sito: step 0/1/2 dossier + admin nextApprovalStep",
    "Badge: GDPR OK, FIGC Legal, Video 30s, 2FA Auth, GPS Mappa, Indice De Rossi",
    "openBadgeInfoModal con testi estesi (registro trattamenti, disclaimer non-affiliazione FIGC, ecc.)",
    "Foto profilo obbligatoria come requisito trust (admin panel / dossier)",
]))

# ========== Q ==========
story.append(Paragraph("Q. Sessioni e localStorage", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["Chiave", "Uso"],
    [
        ["elisee_user_auth", "Sessione utente loggato"],
        ["elisee_admin_auth", "Sessione admin"],
        ["elisee_active_user", "JSON dossier utente attivo"],
        ["elisee_last_activity", "Timestamp attività (scadenza 2 mesi)"],
        ["elisee_view / elisee_hash", "Ultima vista e hash"],
        ["elisee_lang", "Lingua UI"],
        ["elisee_cookie_consent", "all / technical / partial"],
        ["elisee_followed_users", "Array id profili seguiti"],
        ["elisee_approval_step", "0–2 workflow approvazione"],
        ["elisee_mario_rossi_approved", "Flag demo approvazione"],
    ],
    [5 * cm, 11.5 * cm]
))

# ========== R ==========
story.append(Paragraph("R. Libreria immagini e «Aggiorna»", styles["H1Doc"]))
story.append(hr())
story.append(Paragraph(
    "Convenzione: l'utente deposita file anche con nomi arbitrari; al comando «Aggiorna» si rinomina al nome ufficiale, "
    "si sincronizza corrente/ e si fa cache-bust. Script: immagini/aggiorna-immagini.ps1.",
    styles["BodyDoc"]
))
story.append(tbl(
    ["Cartella", "File ufficiale", "Uso UI"],
    [
        ["01-home-hero", "hero-workspace.jpg", "Hero Home + sfondi pf-page"],
        ["02-chi-siamo-ritratto", "about-portrait.jpg", "Chi siamo"],
        ["03-calciatore-ritratto", "footballer-portrait.svg", "Teaser / network"],
        ["04-workspace-scout", "scout-workspace.svg", "Join visual"],
        ["05-logo-scout", "logo-scout.svg", "Brand"],
        ["06-placeholder-utente", "user-placeholder.svg", "Avatar default"],
        ["07-auth-google", "google-logo.svg", "Login Google"],
        ["08-auth-apple", "apple-logo.svg", "Login Apple"],
        ["09-auth-spid-logo", "spid-logo.svg", "Badge SPID"],
        ["10–15-auth-spid-*", "spid-*.svg", "Provider SPID"],
    ],
    [4.2 * cm, 4.5 * cm, 8 * cm]
))
story.extend(bullets([
    "Sottostruttura: corrente/, originali/, modifiche/, LEGGI_ME.txt, INDICE.md",
]))

# ========== S ==========
story.append(Paragraph("S. Internazionalizzazione", styles["H1Doc"]))
story.append(hr())
story.extend(bullets([
    "Default IT; opzioni EN, ES, FR nel menu lingua header",
    "applyLanguage: data-i18n su nav, hero, home, about, resume, bacheca title, account CTA",
    "EliseeI18n.t / setLang / getLang esposti globalmente",
    "Brand e termini dominio (Scout, GPS, SPID) spesso invariati",
]))

story.append(PageBreak())

# ========== T ==========
story.append(Paragraph("T. Flussi utente end-to-end", styles["H1Doc"]))
story.append(hr())
story.append(Paragraph("T1. Visitatore → candidatura", styles["H2Doc"]))
story.extend(bullets([
    "Home → Portfolio → filtri → Candidati (modal) → (opz.) Registrazione/Accedi",
]))
story.append(Paragraph("T2. Atleta → dossier verificato", styles["H2Doc"]))
story.extend(bullets([
    "Iscriviti (ruolo Calciatore) → Accedi → Area utente → compila dossier → foto → step approvazione admin/garante → badge",
]))
story.append(Paragraph("T3. Club / DS → ricerca", styles["H2Doc"]))
story.extend(bullets([
    "Portfolio (annunci/filtri Under) + Network (cerca ruoli) + Curriculum (capire pillar/trust)",
]))
story.append(Paragraph("T4. Ambassador", styles["H2Doc"]))
story.extend(bullets([
    "Ambassador → form + firma → anteprima contratto → (admin) download PDF/DOCX o terminate",
]))
story.append(Paragraph("T5. Admin / Garante", styles["H2Doc"]))
story.extend(bullets([
    "Account → Admin login → Dashboard Admin o Garante → opzioni catalogo / privacy / audit / 2FA / auto-fix",
]))

# ========== U ==========
story.append(Paragraph("U. Allineamento Business Plan ↔ Sito", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["Elemento BP", "Dove nel sito"],
    [
        ["Marketplace dilettanti / bacheca", "Portfolio + sampleJobs + filtri"],
        ["Network persone", "Network + follow + card"],
        ["Pillar / metriche / GPS / video", "Curriculum + dossier GPS + badge video"],
        ["SPID / CIE sicurezza", "Modal SPID providers + asset"],
        ["Ambassador referral", "Macroarea Ambassador + admin contratti"],
        ["Governance sez.5", "Admin dashboard + privacy switcher"],
        ["Anti-fake 5.3", "approval step + dossier labels + admin"],
        ["500 agenti auto-fix sez.11", "Pipeline Router/Diagnoser/Fixer/Verification demo"],
        ["GDPR / tutela minori sez.9", "Cookie, privacy modal, badge, testi i18n"],
        ["1.386 pillar / 715 IA", "Copy Curriculum/Home + PDF principale"],
    ],
    [5.5 * cm, 11 * cm]
))

# ========== V ==========
story.append(Paragraph("V. Gap residui e roadmap", styles["H1Doc"]))
story.append(hr())
story.append(tbl(
    ["Area", "Nel prototipo", "Manca per produzione"],
    [
        ["Auth", "UI multi-provider mock", "OAuth reali, SPID AgID, JWT server"],
        ["Dati", "localStorage mock", "DB, API, ricerca, moderazione"],
        ["Media", "Campi foto/GPS UI", "Storage, CDN, pipeline video 30s"],
        ["Pagamenti", "Solo BP", "Stripe/PayPal/Satispay live"],
        ["Agenti IA", "Copy + demo auto-fix", "Orchestrazione reale 715+500"],
        ["Compliance", "Testi e bozze DPIA in BP", "DPO, policy firmate, audit legale"],
        ["i18n", "UI principale", "Copertura 100% stringhe + admin"],
    ],
    [3.2 * cm, 5.5 * cm, 8 * cm]
))

story.append(Spacer(1, 10))
story.append(hr())
story.append(Paragraph(
    "<b>Checklist completezza appendice (audit)</b>: macroaree Home/About/Curriculum/Portfolio/Network/"
    "Ambassador/Account; dossier campi e step; auth Email/Google/Apple/SPID; registrazione e cookie; "
    "admin/garante/pipeline; anti-fake/badge; localStorage; immagini+Aggiorna; i18n; flussi E2E; "
    "mappa BP↔sito; gap roadmap. Tutto il dettaglio strategico pillar-by-pillar resta nelle pagine del business plan principale.",
    styles["BodyDoc"]
))
story.append(Paragraph(
    "© 2026 ELISEE SCOUT — Appendice workflow digitale completa del prototipo web",
    styles["SmallMuted"]
))


def page_num(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(A4[0] / 2, 1.15 * cm, f"ELISEE SCOUT — Appendice Workflow · {doc.page}")
    canvas.setStrokeColor(CYAN)
    canvas.setLineWidth(0.5)
    canvas.line(1.8 * cm, A4[1] - 1.1 * cm, A4[0] - 1.8 * cm, A4[1] - 1.1 * cm)
    canvas.restoreState()


buf = io.BytesIO()
doc = SimpleDocTemplate(
    buf, pagesize=A4,
    leftMargin=1.7 * cm, rightMargin=1.7 * cm,
    topMargin=1.6 * cm, bottomMargin=1.6 * cm,
    title="ELISEE SCOUT — Appendice Workflow Completa",
    author="ELISEE SCOUT",
)
doc.build(story, onFirstPage=page_num, onLaterPages=page_num)
appendix_bytes = buf.getvalue()

# Merge from SOURCE (backup preferred)
writer = PdfWriter()
reader_main = PdfReader(str(SOURCE))
for p in reader_main.pages:
    writer.add_page(p)
reader_app = PdfReader(io.BytesIO(appendix_bytes))
for p in reader_app.pages:
    writer.add_page(p)

tmp = SITE / "_elisee_merge_tmp.pdf"
with open(tmp, "wb") as f:
    writer.write(f)
os.replace(tmp, OUT)

# Audit
r = PdfReader(str(OUT))
app_start = len(reader_main.pages)
thin = []
for i in range(app_start, len(r.pages)):
    n = len(r.pages[i].extract_text() or "")
    if n < 400:
        thin.append((i + 1, n))
app_chars = sum(len(r.pages[i].extract_text() or "") for i in range(app_start, len(r.pages)))

print("SOURCE", SOURCE.name, "pages", len(reader_main.pages))
print("APPENDIX pages", len(reader_app.pages), "chars", app_chars)
print("TOTAL", len(r.pages))
print("OUT", OUT, "bytes", OUT.stat().st_size)
print("THIN_PAGES", thin if thin else "none")
# keywords check in appendix
app_text = "".join((r.pages[i].extract_text() or "") for i in range(app_start, len(r.pages)))
for kw in [
    "switchView", "localStorage", "SPID", "Ambassador", "dossier", "aggiorna-immagini",
    "Cookie", "2FA", "pipeline", "sampleJobs", "i18n", "pf-page", "Garante", "anti-fake",
    "hero-workspace", "openBadgeInfoModal", "500 agenti",
]:
    print(("OK" if kw.lower() in app_text.lower() else "MISS"), kw)
