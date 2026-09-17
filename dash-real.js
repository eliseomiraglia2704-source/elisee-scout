/* Elisee Scout — shell comune dashboard ruolo: PRO 240px + header 2 livelli + tab. */
(function () {
  'use strict';

  var ICO = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    radar: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    mega: '<path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    pack: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c0-4 1-7 2-10"/><path d="M12 10a5 5 0 0 1 5-5c0 3-2 5-5 5"/><path d="M12 14a5 5 0 0 0-5-5c0 3 2 5 5 5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
  };

  var ROLE_PRO = {
    ds: {
      area: 'Area Direzione Sportiva', staff: 'Direzione Sportiva Ufficiale', clubSub: 'Prima Squadra · Calciomercato',
      licence: 'Dirigente Sportivo FIGC / ADISE', tessera: 'FIGC-DS-4412 · Scad. 30/06/2027',
      cta: { label: 'Secret List Stealth →', act: 'secret' },
      next: { label: 'Prossima Finestra Mercato', title: 'Sessione Autunnale 2026/27', sub: '01/10/2026 · Chiusura 02/02/2027' },
      kpi: { label: 'Stato Rosa', items: [['24', 'Tesserati'], ['3', 'In scadenza'], ['1', 'Trattativa']] },
      focus: { label: 'Focus Mercato di Giornata', title: 'Rinnovi Under 23 & Svincolati', sub: 'Priorità fascia offensiva' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'secret', label: 'Secret List Stealth', ico: 'lock', act: 'secret' },
        { id: 'trattative', label: 'Trattative & Contratti', ico: 'brief' },
        { id: 'scouting', label: 'Scouting & Target', ico: 'radar' },
        { id: 'wall', label: 'Wall Trasferimenti', ico: 'file', act: 'wall' },
        { id: 'radar', label: 'Radar & Competenze', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'users' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    tm: {
      area: 'Area Team Manager', staff: 'Staff Organizzativo Ufficiale', clubSub: 'Prima Squadra · Logistica',
      licence: 'Team Manager Qualificato LND', tessera: 'LND-TM-2281 · Scad. 30/06/2027',
      cta: { label: 'Nuova Trasferta +', act: 'edit' },
      next: { label: 'Prossima Trasferta', title: 'Trasferta ufficiale di campionato', sub: '22/09/2026 · Raduno 14:00' },
      kpi: { label: 'Stato Logistica', items: [['12', 'Pratiche'], ['0', 'In attesa'], ['100%', 'Puntualità']] },
      focus: { label: 'Focus di Giornata', title: 'Distinte & Convocazioni', sub: 'Conferma alloggi e pullman' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'trasferte', label: 'Trasferte', ico: 'cal' },
        { id: 'pratiche', label: 'Pratiche & Distinte', ico: 'file' },
        { id: 'materiale', label: 'Materiale Tecnico', ico: 'pack' },
        { id: 'radar', label: 'Radar Organizzativo', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'users' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    yg: {
      area: 'Area Settore Giovanile', staff: 'Settore Giovanile Ufficiale', clubSub: 'Vivaio · Tutela Minori',
      licence: 'Responsabile Settore Giovanile FIGC', tessera: 'FIGC-SGS-1194 · Scad. 30/06/2027',
      cta: { label: 'Nuova Categoria +', act: 'edit' },
      next: { label: 'Prossimo Impegno Vivaio', title: 'Torneo Under 17 regionale', sub: '21/09/2026 · Ore 10:30' },
      kpi: { label: 'Stato Vivaio', items: [['6', 'Categorie'], ['84', 'Tesserati'], ['12', 'Promozioni']] },
      focus: { label: 'Focus Formativo', title: 'Passaggio Under 19 → Prima', sub: 'Monitoraggio talenti pronti' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'categorie', label: 'Categorie & Rosa', ico: 'users' },
        { id: 'promozioni', label: 'Promozioni', ico: 'sprout' },
        { id: 'famiglie', label: 'Famiglie & Tutela', ico: 'shield' },
        { id: 'radar', label: 'Radar Crescita', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'msg' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    dg: {
      area: 'Area Direzione Generale', staff: 'Direzione Generale Ufficiale', clubSub: 'Governance · Budget',
      licence: 'Direttore Generale', tessera: 'DG-CLUB-3301 · Delega di firma attiva',
      cta: { label: 'Nuova Delibera +', act: 'edit' },
      next: { label: 'Prossimo CDA', title: 'Consiglio di amministrazione', sub: '24/09/2026 · Ore 18:00' },
      kpi: { label: 'Stato Gestionale', items: [['OK', 'Budget'], ['2', 'Scostamenti'], ['0', 'Criticità']] },
      focus: { label: 'Focus Direzionale', title: 'Controllo di gestione Q1', sub: 'Allineamento DS e Presidente' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'budget', label: 'Budget & Risorse', ico: 'brief' },
        { id: 'decisioni', label: 'Decisioni & Delibere', ico: 'file' },
        { id: 'personale', label: 'Personale', ico: 'users' },
        { id: 'radar', label: 'Radar Management', ico: 'radar' },
        { id: 'canale', label: 'Canale Dirigenza', ico: 'msg' },
        { id: 'edit', label: 'Profilo & Poteri', ico: 'gear', act: 'edit' }
      ]
    },
    ag: {
      area: 'Area Procuratore', staff: 'Agente FIFA Accreditato', clubSub: 'Portfolio · Mandati',
      licence: 'Agente FIFA / Registro CONI', tessera: 'FIFA-AG-7720 · Crediti formativi ok',
      cta: { label: 'Nuovo Assistito +', act: 'edit' },
      next: { label: 'Prossima Trattativa', title: 'Finestra contrattuale autunnale', sub: '01/10/2026 · Mandati in scadenza' },
      kpi: { label: 'Portfolio', items: [['8', 'Assistiti'], ['3', 'In trattativa'], ['2', 'Rinnovi']] },
      focus: { label: 'Focus Mandati', title: 'Rinnovi e club esteri', sub: 'Priorità Primavera / Lega Pro' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'portfolio', label: 'Portfolio Assistiti', ico: 'users' },
        { id: 'trattative', label: 'Trattative', ico: 'brief' },
        { id: 'mandati', label: 'Mandati FIFA', ico: 'file' },
        { id: 'radar', label: 'Radar Intermediazione', ico: 'radar' },
        { id: 'canale', label: 'Canale Club', ico: 'msg' },
        { id: 'edit', label: 'Profilo & Licenza', ico: 'gear', act: 'edit' }
      ]
    },
    mk: {
      area: 'Area Marketing', staff: 'Marketing & Commerciale Ufficiale', clubSub: 'Sponsor · Merchandising',
      licence: 'Responsabile Marketing / Commerciale', tessera: 'MK-CLUB-5510',
      cta: { label: 'Nuovo Sponsor +', act: 'edit' },
      next: { label: 'Prossimo Evento Commerciale', title: 'Hospitality gara casalinga', sub: '22/09/2026 · Tribuna d\'onore' },
      kpi: { label: 'Revenue B2B', items: [['12', 'Sponsor'], ['3', 'In trattativa'], ['OK', 'Led']] },
      focus: { label: 'Focus Commerciale', title: 'Retention jersey sponsor', sub: 'Rinnovo main + merchandising' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'sponsor', label: 'Sponsor & Partnership', ico: 'star' },
        { id: 'merch', label: 'Merchandising', ico: 'pack' },
        { id: 'hospitality', label: 'Hospitality', ico: 'ticket' },
        { id: 'radar', label: 'Radar Commerciale', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'msg' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    pr: {
      area: 'Area Ufficio Stampa', staff: 'Comunicazione Ufficiale', clubSub: 'Media · Comunicati',
      licence: 'Responsabile Comunicazione / OdG', tessera: 'OdG-USSI · Accrediti Lega ok',
      cta: { label: 'Nuovo Comunicato +', act: 'edit' },
      next: { label: 'Prossima Conferenza', title: 'Conferenza pre-gara', sub: '21/09/2026 · Ore 13:00' },
      kpi: { label: 'Stato Media', items: [['4', 'Comunicati'], ['1', 'Bozza'], ['12', 'Accrediti']] },
      focus: { label: 'Focus Comunicazione', title: 'Rassegna e crisi media', sub: 'Tono istituzionale, fonti verificate' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'comunicati', label: 'Comunicati', ico: 'mega' },
        { id: 'accrediti', label: 'Accrediti Stampa', ico: 'users' },
        { id: 'social', label: 'Social & Rassegna', ico: 'file' },
        { id: 'radar', label: 'Radar Media', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'msg' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    eq: {
      area: 'Area Magazzino', staff: 'Equipment Manager Ufficiale', clubSub: 'Kit gara · Inventario',
      licence: 'Magazziniere / Equipment Manager', tessera: 'EQ-CLUB-0902',
      cta: { label: 'Nuovo Ordine +', act: 'edit' },
      next: { label: 'Prossima Gara — Kit', title: 'Mute ufficiali prima squadra', sub: '22/09/2026 · Consegna 10:00' },
      kpi: { label: 'Scorte', items: [['OK', 'Kit gara'], ['2', 'Riordini'], ['24', 'Assegnazioni']] },
      focus: { label: 'Focus Magazzino', title: 'Inventario mute e palloni', sub: 'Lavanderia + firma materiale' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'inventario', label: 'Inventario', ico: 'pack' },
        { id: 'kit', label: 'Kit Gara', ico: 'shield' },
        { id: 'ordini', label: 'Ordini Fornitori', ico: 'file' },
        { id: 'radar', label: 'Radar Equipment', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'msg' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    sg: {
      area: 'Area Segreteria Generale', staff: 'Segreteria Sportiva Ufficiale', clubSub: 'Tesseramenti · Pratiche FIGC',
      licence: 'Segretario Generale / Club Manager', tessera: 'FIGC-SEG-6644 · Albo Segretari',
      cta: { label: 'Nuova Pratica +', act: 'edit' },
      next: { label: 'Prossima Scadenza Federale', title: 'Tesseramenti LND online', sub: '30/09/2026 · Ore 18:00' },
      kpi: { label: 'Pratiche', items: [['18', 'Attive'], ['2', 'Istruttoria'], ['0', 'Bloccate']] },
      focus: { label: 'Focus Segreteria', title: 'Cartellini e svincoli', sub: 'Depositi contratti e TMS' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'tesseramenti', label: 'Tesseramenti', ico: 'users' },
        { id: 'pratiche', label: 'Pratiche FIGC', ico: 'file' },
        { id: 'scadenze', label: 'Scadenze', ico: 'cal' },
        { id: 'radar', label: 'Radar Amministrativo', ico: 'radar' },
        { id: 'canale', label: 'Canale Dirigenza', ico: 'msg' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    bt: {
      area: 'Area Biglietteria', staff: 'Biglietteria & SLO Ufficiale', clubSub: 'Ticketing · Tifoseria',
      licence: 'Responsabile Biglietteria / SLO', tessera: 'GOS / Questura · Protocollo attivo',
      cta: { label: 'Nuova Emissione +', act: 'edit' },
      next: { label: 'Prossima Gara — Botteghino', title: 'Vendita nominale campionato', sub: 'Apertura 18/09/2026' },
      kpi: { label: 'Affluenza', items: [['68%', 'Riempimento'], ['420', 'Abbonati'], ['0', 'Daspo']] },
      focus: { label: 'Focus Ticketing', title: 'Settore ospiti e tornelli', sub: 'Controllo accessi GOS' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'vendite', label: 'Vendite & Abbonamenti', ico: 'ticket' },
        { id: 'settori', label: 'Settori Stadio', ico: 'shield' },
        { id: 'slo', label: 'SLO & Tifoseria', ico: 'users' },
        { id: 'radar', label: 'Radar Ticketing', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'msg' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    tf: {
      area: 'Area Tifoso', staff: 'Community Elisee Scout', clubSub: 'Squadra del cuore',
      licence: 'Tessera Digitale del Tifoso', tessera: 'Community ufficiale · Badge fedeltà',
      cta: { label: 'Registra Presenza +', act: 'edit' },
      next: { label: 'Prossima Gara da Vivere', title: 'Match della tua squadra', sub: '22/09/2026 · Stadio' },
      kpi: { label: 'Fedeltà', items: [['8', 'Presenze'], ['3', 'Trasferte'], ['12', 'Badge']] },
      focus: { label: 'Focus Passione', title: 'Stadio, merchandising, community', sub: 'Collezione sticker e cori' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'presenze', label: 'Presenze Stadio', ico: 'ticket' },
        { id: 'album', label: 'Album & Badge', ico: 'star', act: 'album' },
        { id: 'social', label: 'Community', ico: 'heart' },
        { id: 'radar', label: 'Radar Passione', ico: 'radar' },
        { id: 'canale', label: 'Messaggi', ico: 'msg', act: 'msgs' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function val(v) {
    v = v == null ? '' : String(v).trim();
    return v;
  }
  function nameOf(u) {
    return [u && u.nome, u && u.cognome].filter(Boolean).join(' ').trim() || (u && u.username) || '';
  }
  function initials(name, fb) {
    var p = String(name || fb || 'UT').trim().split(/\s+/);
    return ((p[0] || 'U').charAt(0) + (p[1] || p[0] || 'T').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || (u && u.fotoUrl) || '';
    } catch (_) {}
    return (u && u.fotoUrl) || '';
  }
  function clubOf(u) {
    var c = val((u && (u.squadra || u.club || u.squadraCuore)) || '');
    if (!c || /atalanta|carlentini/i.test(c)) return 'Foggia City';
    return c;
  }
  function empty(msg) {
    return '<div class="es-pd-empty">' + esc(msg) + '</div>';
  }
  function ico(d) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  function row(label, value, kind) {
    var cls = 'es-pd-ok';
    if (kind === 'warn') cls += ' is-warn';
    if (kind === 'miss') cls += ' is-miss';
    if (kind === 'hi') cls += ' es-pd-metric-hi';
    return '<div class="' + cls + '"><span>' + esc(label) + '</span><b>' + esc(value || 'Non disponibile') + '</b></div>';
  }
  function compliance(user) {
    var emailOk = !!(user.emailVerifiedAt || user.isEmailVerified || user.emailVerified);
    var docsOk = !!(user.docsAttachedAt || user.badgeDocumentUrl || user.badgeSelfieUrl);
    var badgeOk = String(user.badgeVerificaStato || '') === 'approved';
    var gdprOk = !!(user.gdprConsent || user.consensoGdpr || user.privacyAccepted || user.consensoTrattamento);
    return (
      row('Email', emailOk ? 'Verificata' : 'Da verificare', emailOk ? 'hi' : 'warn') +
      row('Documenti identità', docsOk ? 'Allegati' : 'Mancanti', docsOk ? '' : 'warn') +
      row('Consenso GDPR', gdprOk ? 'Presente' : 'Non registrato', gdprOk ? '' : 'miss') +
      row('Badge / validazione', badgeOk ? 'Approvato' : (docsOk ? 'In revisione' : 'Non richiesto'), badgeOk ? '' : (docsOk ? 'warn' : 'miss'))
    );
  }

  function getPrimaryActionForRole(roleLabel, attr) {
    var cfg = ROLE_PRO[attr];
    if (cfg && cfg.cta) {
      return {
        label: cfg.cta.label,
        act: cfg.cta.act,
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (ICO[cfg.nav[1] && cfg.nav[1].ico] || ICO.file) + '</svg>'
      };
    }
    return { label: 'Aggiorna Dati Ruolo', act: 'edit', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ICO.gear + '</svg>' };
  }

  function identityCard(user, roleLabel, attr) {
    var name = nameOf(user) || roleLabel;
    var ph = photoOf(user);
    var initText = esc(initials(name, roleLabel));
    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<div class="es-pd-who-ava-wrap" style="position:relative; width:56px; height:56px; flex-shrink:0;">' +
        '<img src="' + esc(ph) + '" alt="" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid rgba(56,189,248,0.35); box-shadow:0 4px 12px rgba(0,0,0,0.35);" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-pd-ph" style="display:none; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #0f2742 0%, #0369a1 100%); border:2px solid rgba(56,189,248,0.4); color:#ffffff; font-weight:800; font-size:1.15rem; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.35);">' + initText + '</div>' +
      '</div>';
    } else {
      avaHtml = '<div class="es-pd-ph" style="display:flex; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #0f2742 0%, #0369a1 100%); border:2px solid rgba(56,189,248,0.4); color:#ffffff; font-weight:800; font-size:1.15rem; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.35);">' + initText + '</div>';
    }
    var club = clubOf(user);
    var bio = val((user.staffProfile && user.staffProfile.bio) || user.bio);
    var primaryAction = getPrimaryActionForRole(roleLabel, attr);

    return '<section class="es-pd-card es-pd-indice" style="padding:1.25rem;">' +
      '<div class="es-pd-card-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(148,163,184,0.12);">' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<h2 style="font-size:0.95rem; font-weight:800; color:#f3f8fc; margin:0; letter-spacing:0.02em;">Profilo Ufficiale</h2>' +
          '<span class="es-pd-source-badge es-pd-source-user" style="font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:6px; background:rgba(56,189,248,0.1); color:#38bdf8; border:1px solid rgba(56,189,248,0.25);">Accreditato</span>' +
        '</div>' +
        '<button type="button" class="es-btn-cos-primary" data-' + esc(attr || 'pd') + '="' + esc(primaryAction.act) + '" style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; font-weight:700; padding:0.4rem 0.85rem; border-radius:6px; background:#0284c7; color:#fff; border:none; cursor:pointer; box-shadow:0 2px 8px rgba(2,132,199,0.3);">' +
          primaryAction.icon + '<span>' + esc(primaryAction.label) + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="es-pd-who" style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">' +
        avaHtml +
        '<div style="display:flex; flex-direction:column; gap:3px;">' +
          '<b style="color:#f8fafc; font-size:1.15rem; font-weight:900; line-height:1.2;">' + esc(name) + '</b>' +
          '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:2px;">' +
            '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase; letter-spacing:0.03em;">' + esc(roleLabel) + '</span>' +
            (club ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="es-pd-onboarding-box" style="background:#040912; border:1px solid rgba(56,189,248,0.18); border-radius:8px; padding:0.85rem 1rem; margin-bottom:0.75rem;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
          '<span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em;">Completamento Anagrafica &amp; Ruolo</span>' +
          '<span style="font-size:0.8rem; font-weight:900; color:#38bdf8;">85%</span>' +
        '</div>' +
        '<div style="height:6px; background:rgba(15,23,42,0.8); border-radius:3px; overflow:hidden; border:1px solid rgba(148,163,184,0.14);">' +
          '<div style="width:85%; height:100%; background:linear-gradient(90deg, #0284c7 0%, #38bdf8 100%); border-radius:3px;"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:0.72rem;">' +
          '<span style="color:#64748b;">Dati di tesseramento e abilitazione attivi</span>' +
          '<button type="button" class="es-pd-edit" data-' + esc(attr || 'pd') + '="edit" style="background:none; border:none; color:#38bdf8; font-weight:800; cursor:pointer; padding:0; display:inline-flex; align-items:center; gap:3px;">' +
            '<span>Modifica Anagrafica</span> &rarr;' +
          '</button>' +
        '</div>' +
      '</div>' +
      (bio ? '<div style="font-size:0.75rem; color:#8da8bc; line-height:1.5; padding:0.4rem 0.2rem;">' + esc(bio) + '</div>' : '') +
    '</section>';
  }

  function renderSideBtn(item, attr, active) {
    var act = item.act || '';
    var extra = act ? (' data-' + attr + '="' + act + '"') : '';
    return '<button type="button" class="es-pro-side-btn' + (active ? ' is-active' : '') + '" data-pro-nav="' + item.id + '"' + extra + '>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (ICO[item.ico] || ICO.grid) + '</svg>' +
      '<span>' + item.label + '</span></button>';
  }

  function renderNavTab(item, active) {
    if (item.act === 'edit' || item.act === 'msgs' || item.act === 'home') return '';
    return '<button type="button" class="es-pro-tab-btn' + (active ? ' is-active' : '') + '" data-pro-nav="' + item.id + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (ICO[item.ico] || ICO.grid) + '</svg>' +
      item.label + '</button>';
  }

  function panelCard(title, body) {
    return '<section class="es-pd-card" style="padding:1.25rem;">' +
      '<div class="es-pd-card-header"><h2>' + title + '</h2></div>' +
      body +
    '</section>';
  }

  function tabPanel(id, inner, isDash) {
    return '<div class="es-pro-panel" data-pro-panel="' + id + '"' + (isDash ? '' : ' hidden') + '>' + inner + '</div>';
  }

  function shell(opts) {
    opts = opts || {};
    var user = opts.user || {};
    var attr = opts.attr || 'pd';
    var roleLabel = opts.roleLabel || 'Staff';
    var name = nameOf(user) || roleLabel;
    var club = clubOf(user);
    var cfg = ROLE_PRO[attr] || ROLE_PRO.tm;
    var recTitle = opts.registroTitle || 'Registro attività';
    var recHeaders = opts.registroHeaders || ['Voce', 'Dettaglio', 'Stato'];
    var recRows = Array.isArray(opts.records) ? opts.records : (Array.isArray(user.activityLog) ? user.activityLog : []);

    var registroContent;
    if (recRows.length) {
      var th = recHeaders.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
      var tableBody = recRows.map(function (r) {
        return '<tr><td>' + esc(r.a || r.label || '') + '</td><td>' + esc(r.b || r.detail || '') + '</td><td>' + esc(r.c || r.stato || '') + '</td></tr>';
      }).join('');
      registroContent = '<table class="es-pd-table"><thead><tr>' + th + '</tr></thead><tbody>' + tableBody + '</tbody></table>';
    } else {
      registroContent = '<div style="padding:1.75rem 1rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.5rem;">' +
        '<div style="width:40px; height:40px; border-radius:50%; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); display:flex; align-items:center; justify-content:center; color:#38bdf8;">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        '</div>' +
        '<div style="font-size:0.82rem; font-weight:700; color:#f3f8fc;">Nessuna registrazione recente</div>' +
        '<div style="font-size:0.72rem; color:#64748b; max-width:280px; line-height:1.4;">Il registro si popola automaticamente con le attività e relazioni operative del ruolo.</div>' +
      '</div>';
    }

    var dashInner =
      '<div class="es-pd-grid">' +
        '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
          identityCard(user, roleLabel, attr) +
          '<div id="es-pd-actions-slot"></div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
          '<section class="es-pd-card es-pd-radar">' +
            '<div class="es-pd-card-header"><h2>' + esc(opts.radarTitle || 'Quadro operativo') + '</h2>' +
            '<span class="es-pd-source-badge">In attesa</span></div>' +
            empty('Nessuna serie prestazionale certificata. Il radar si attiva con dati di attività reali del ruolo.') +
          '</section>' +
          '<section class="es-pd-card">' +
            '<div class="es-pd-card-header"><h2>' + esc(opts.workTitle || 'Attività') + '</h2>' +
            '<span class="es-pd-source-badge">Profilo</span></div>' +
            empty(opts.workEmpty || 'Nessuna attività registrata per questo ruolo.') +
          '</section>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
          '<section class="es-pd-card es-pd-comply">' +
            '<div class="es-pd-card-header"><h2>Verifica &amp; compliance</h2>' +
            '<span class="es-pd-source-badge">' + (String(user.badgeVerificaStato || '') === 'approved' ? 'Validato' : 'Da completare') + '</span></div>' +
            compliance(user) +
          '</section>' +
          '<section class="es-pd-card es-pd-registro">' +
            '<div class="es-pd-card-header"><h2>' + esc(recTitle) + '</h2>' +
            '<span class="es-pd-source-badge">' + (recRows.length ? 'Registro' : 'Vuoto') + '</span></div>' +
            registroContent +
          '</section>' +
        '</div>' +
      '</div>';

    var extraPanels = cfg.nav.filter(function (n) {
      return n.id !== 'dashboard' && n.act !== 'edit' && n.act !== 'msgs' && n.act !== 'home';
    }).map(function (n) {
      var cta = n.act
        ? '<button type="button" class="es-pro-btn-quick-jump" data-' + attr + '="' + n.act + '">Apri ' + esc(n.label) + '</button>'
        : '';
      return tabPanel(n.id, panelCard(esc(n.label),
        '<p style="color:#94a3b8;font-size:0.82rem;line-height:1.5;margin:0 0 12px;">Modulo operativo di ' + esc(cfg.area) + '. I dati si popolano dalle attività reali del ruolo.</p>' + cta
      ));
    }).join('');

    var kpiHtml = cfg.kpi.items.map(function (it) {
      return '<div><strong>' + it[0] + '</strong><span>' + it[1] + '</span></div>';
    }).join('');

    var logo = 'immagini/squadre-loghi/1000345699.png?v=20260916_FGCLOGO2';

    return '<div class="es-pro-shell">' +
      '<aside class="es-pro-sidebar">' +
        '<div class="es-pro-brand-header"><div class="es-pro-brand-title">ELISEE <span>SCOUT</span></div><div class="es-pro-brand-sub">' + esc(cfg.area) + '</div></div>' +
        '<nav class="es-pro-sidebar-nav">' +
          cfg.nav.map(function (n) { return renderSideBtn(n, attr, n.id === 'dashboard'); }).join('') +
        '</nav>' +
        '<div class="es-pro-sidebar-badge"><div class="es-pro-sidebar-club-card">' +
          '<img src="' + logo + '" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
          '<div><strong>' + esc(club) + '</strong><span>' + esc(cfg.staff) + '</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-pro-main">' +
        '<div class="es-pro-dash-header">' +
          '<div class="es-pro-header-top-row">' +
            '<button type="button" class="es-pro-mobile-menu-btn" id="btn-toggle-pro-sidebar" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
            '<div class="es-pro-header-identity">' +
              '<div class="es-pro-header-block">' +
                '<div class="es-pro-licence-badge"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ICO.shield + '</svg></div>' +
                '<div class="es-pro-doc-info"><strong>' + esc(name) + '</strong><span class="role">' + esc(roleLabel) + '</span><p class="sub">' + esc(cfg.licence) + ' · ' + esc(cfg.tessera) + '</p></div>' +
              '</div>' +
              '<div class="es-pro-header-sep"></div>' +
              '<div class="es-pro-header-block es-pro-club-info">' +
                '<img class="crest" src="' + logo + '" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
                '<div><strong>' + esc(club) + '</strong><span>' + esc(cfg.clubSub) + '</span></div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-pro-btn-quick-jump" data-' + attr + '="' + esc(cfg.cta.act) + '">' + esc(cfg.cta.label) + '</button>' +
          '</div>' +
          '<div class="es-pro-header-match-row">' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.next.label) + '</p><strong>' + esc(cfg.next.title) + '</strong><span>' + esc(cfg.next.sub) + '</span></div>' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.kpi.label) + '</p><div class="es-pro-countdown-nums">' + kpiHtml + '</div></div>' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.focus.label) + '</p><strong style="color:#38bdf8;">' + esc(cfg.focus.title) + '</strong><span>' + esc(cfg.focus.sub) + '</span></div>' +
          '</div>' +
        '</div>' +
        '<nav class="es-pro-nav-tabs">' +
          cfg.nav.map(function (n) { return renderNavTab(n, n.id === 'dashboard'); }).join('') +
        '</nav>' +
        tabPanel('dashboard', dashInner, true) +
        extraPanels +
      '</main>' +
    '</div>';
  }

  function bindProNavOnce() {
    if (window.__eliseeProNavBound) return;
    window.__eliseeProNavBound = true;
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('#btn-toggle-pro-sidebar');
      if (toggle) {
        var sh = toggle.closest('.es-pro-shell');
        var sb = sh && sh.querySelector('.es-pro-sidebar');
        if (sb) sb.classList.toggle('is-open');
        return;
      }
      var btn = e.target.closest('[data-pro-nav]');
      if (!btn) return;
      var tab = btn.getAttribute('data-pro-nav');
      var shellEl = btn.closest('.es-pro-shell');
      if (!shellEl || !tab) return;
      if (tab === 'edit' || tab === 'msgs' || tab === 'home') return;
      shellEl.querySelectorAll('[data-pro-nav]').forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-pro-nav') === tab);
      });
      shellEl.querySelectorAll('[data-pro-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-pro-panel') !== tab;
      });
      var side = shellEl.querySelector('.es-pro-sidebar');
      if (side) side.classList.remove('is-open');
    });
  }

  bindProNavOnce();

  window.EliseeDashReal = {
    esc: esc,
    val: val,
    nameOf: nameOf,
    photoOf: photoOf,
    clubOf: clubOf,
    empty: empty,
    compliance: compliance,
    identityCard: identityCard,
    shell: shell
  };
})();
