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
      cta: { label: 'Secret List Stealth →', act: 'secret' },
      next: { label: 'Prossima Finestra Mercato' },
      kpi: { label: 'Stato Rosa', items: [['—', 'Tesserati'], ['—', 'In scadenza'], ['—', 'Trattativa']] },
      focus: { label: 'Focus Mercato di Giornata', title: 'Rinnovi e svincolati', sub: 'Mercato, contratti e obiettivi' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'secret', label: 'Secret List Stealth', ico: 'lock', act: 'secret' },
        { id: 'trattative', label: 'Trattative & Contratti', ico: 'brief' },
        { id: 'scouting', label: 'Scouting & Target', ico: 'radar' },
        { id: 'schede', label: 'Schede tecniche', ico: 'file' },
        { id: 'wall', label: 'Wall Trasferimenti', ico: 'file', act: 'wall' },
        { id: 'radar', label: 'Radar & Competenze', ico: 'radar' },
        { id: 'canale', label: 'Canale Staff', ico: 'users' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    tm: {
      area: 'Area Team Manager', staff: 'Staff Organizzativo Ufficiale', clubSub: 'Prima Squadra · Logistica',
      cta: { label: 'Comunicazioni →', act: 'broadcast' },
      next: { label: 'Prossima Trasferta' },
      kpi: { label: 'Stato Logistica', items: [['—', 'Puntualità'], ['—', 'Conferme'], ['—', 'Checklist']] },
      focus: { label: 'Focus di Giornata', title: 'Broadcast e checklist matchday', sub: 'Conferme di lettura in tempo reale' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'broadcast', label: 'Hub comunicazioni', ico: 'mega' },
        { id: 'checklist', label: 'Checklist matchday', ico: 'file' },
        { id: 'logistica', label: 'Calcolatore spostamenti', ico: 'cal' },
        { id: 'convenzioni', label: 'Prenotazioni strutture', ico: 'star' },
        { id: 'kpi', label: 'KPI squadra', ico: 'radar' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'users' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    yg: {
      area: 'Area Settore Giovanile', staff: 'Settore Giovanile Ufficiale', clubSub: 'Vivaio · Tutela Minori',
      cta: { label: 'Settore giovanile →', act: 'talent' },
      next: { label: 'Prossimo Impegno Vivaio' },
      kpi: { label: 'Stato Vivaio', items: [['—', 'Categorie'], ['—', 'Tesserati'], ['—', 'Promozioni']] },
      focus: { label: 'Focus Formativo', title: 'Academy Talent Tracker', sub: 'Fisica, tattica, scolastica' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'talent', label: 'Academy Talent Tracker', ico: 'sprout' },
        { id: 'scoutingyg', label: 'Scouting giovanile', ico: 'radar' },
        { id: 'libretto', label: 'Libretto elettronico', ico: 'file' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'users' },
        { id: 'edit', label: 'Profilo & Abilitazione', ico: 'gear', act: 'edit' }
      ]
    },
    dg: {
      area: 'Area Direzione Generale', staff: 'Direzione Generale Ufficiale', clubSub: 'Governance · Budget',
      cta: { label: 'Modifica profilo', act: 'edit' },
      next: { label: 'Prossimo CDA' },
      kpi: { label: 'Stato Gestionale', items: [['—', 'Budget'], ['—', 'Scostamenti'], ['—', 'Criticità']] },
      focus: { label: 'Focus Direzionale', title: 'Controllo di gestione', sub: 'Budget e scostamenti' },
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
      area: 'Area Procuratore', staff: 'Procuratore', clubSub: 'Portfolio · Mandati',
      cta: { label: 'Modifica profilo', act: 'edit' },
      next: { label: 'Prossima Trattativa' },
      kpi: { label: 'Portfolio', items: [['—', 'Assistiti'], ['—', 'In trattativa'], ['—', 'Rinnovi']] },
      focus: { label: 'Focus Mandati', title: 'Mandati e rinnovi', sub: 'Assistiti, club e scadenze' },
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
      cta: { label: 'Sponsor →', act: 'crm' },
      next: { label: 'Prossimo Evento Commerciale' },
      kpi: { label: 'Revenue B2B', items: [['—', 'Sponsor'], ['—', 'In trattativa'], ['—', 'Vendite oggi']] },
      focus: { label: 'Focus Commerciale', title: 'CRM e store', sub: 'Sponsor e store' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'crm', label: 'CRM commerciale', ico: 'star' },
        { id: 'store', label: 'Analytics store', ico: 'pack' },
        { id: 'loyalty', label: 'Loyalty tifosi', ico: 'heart' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'users' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    pr: {
      area: 'Area Ufficio Stampa', staff: 'Comunicazione Ufficiale', clubSub: 'Media · Comunicati',
      cta: { label: 'Nuovo accredito', act: 'accrediti' },
      next: { label: 'Prossima Conferenza' },
      kpi: { label: 'Stato Media', items: [['—', 'Comunicati'], ['—', 'Bozza'], ['—', 'Accrediti']] },
      focus: { label: 'Focus Comunicazione', title: 'Accrediti e rassegna', sub: 'Tono istituzionale, fonti verificate' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'accrediti', label: 'Accrediti Media Express', ico: 'users' },
        { id: 'rassegna', label: 'Rassegna stampa', ico: 'file' },
        { id: 'calendario', label: 'Content calendar', ico: 'cal' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'mega' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    eq: {
      area: 'Area Magazzino', staff: 'Equipment Manager Ufficiale', clubSub: 'Kit gara · Inventario',
      cta: { label: 'Nuova richiesta', act: 'richieste' },
      next: { label: 'Prossima Gara — Kit' },
      kpi: { label: 'Scorte', items: [['—', 'Kit gara'], ['—', 'Riordini'], ['—', 'Residuo']] },
      focus: { label: 'Focus Magazzino', title: 'Richieste e budget', sub: 'Decurtazione automatica spese' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'richieste', label: 'Richieste materiali', ico: 'pack' },
        { id: 'budget', label: 'Budget & spese', ico: 'brief' },
        { id: 'inventario', label: 'Inventario RFID', ico: 'shield' },
        { id: 'audit', label: 'Audit Presidenza', ico: 'lock' },
        { id: 'manutenzione', label: 'Manutenzioni', ico: 'gear' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'users' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    sg: {
      area: 'Area Segreteria Generale', staff: 'Segreteria Sportiva Ufficiale', clubSub: 'Tesseramenti · Pratiche federali',
      cta: { label: 'Nuova scadenza', act: 'scadenze' },
      next: { label: 'Prossima Scadenza Federale' },
      kpi: { label: 'Pratiche', items: [['—', 'Attive'], ['—', 'Istruttoria'], ['—', 'Alert']] },
      focus: { label: 'Focus Segreteria', title: 'Alert scadenze', sub: 'Visite, svincoli, rinnovi, squalifiche' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'scadenze', label: 'Alert scadenze', ico: 'cal' },
        { id: 'tesseramenti', label: 'Contratti & tesseramenti', ico: 'file' },
        { id: 'archivio', label: 'Archivio firmato', ico: 'lock' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'users' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    bt: {
      area: 'Area Biglietteria', staff: 'Biglietteria & SLO Ufficiale', clubSub: 'Ticketing · Tifoseria',
      cta: { label: 'Biglietteria →', act: 'ticketing' },
      next: { label: 'Prossima Gara — Botteghino' },
      kpi: { label: 'Affluenza', items: [['—', 'Riempimento'], ['—', 'Ingressi'], ['—', 'Coda sud']] },
      focus: { label: 'Focus Ticketing', title: 'Varchi e SLO Hub', sub: 'Controllo accessi GOS' },
      nav: [
        { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
        { id: 'varchi', label: 'Pressione varchi', ico: 'ticket' },
        { id: 'slo', label: 'SLO Hub tifosi', ico: 'users' },
        { id: 'ticketing', label: 'Ticketing nominativo', ico: 'shield' },
        { id: 'anagrafica', label: 'Anagrafica tesserato', ico: 'file' },
        { id: 'edit', label: 'Profilo', ico: 'gear', act: 'edit' }
      ]
    },
    tf: {
      area: 'Area Tifoso', staff: 'Community Elisee Scout', clubSub: 'Squadra del cuore',
      cta: { label: 'Modifica profilo', act: 'edit' },
      next: { label: 'Prossima Gara da Vivere' },
      kpi: { label: 'Fedeltà', items: [['—', 'Presenze'], ['—', 'Trasferte'], ['—', 'Badge']] },
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
      avaHtml = '<div class="es-pd-who-ava-wrap es-dr-ava-wrap">' +
        '<img class="es-dr-ava-img" src="' + esc(ph) + '" alt="" onerror="this.parentNode.classList.add(\'is-broken\')">' +
        '<div class="es-pd-ph es-dr-ava es-dr-ava--fallback">' + initText + '</div>' +
      '</div>';
    } else {
      avaHtml = '<div class="es-pd-ph es-dr-ava">' + initText + '</div>';
    }
    var club = clubOf(user);
    var bio = val((user.staffProfile && user.staffProfile.bio) || user.bio);
    var primaryAction = getPrimaryActionForRole(roleLabel, attr);
    var checks = [user.nome, user.cognome, club, bio, ph, user.email,
      (user.docsAttachedAt || user.badgeDocumentUrl || user.badgeSelfieUrl)];
    var pct = Math.round(100 * checks.filter(function (x) { return !!val(x); }).length / checks.length);
    var verified = String(user.badgeVerificaStato || '') === 'approved';

    return '<section class="es-pd-card es-pd-indice es-dr-card">' +
      '<div class="es-pd-card-header es-dr-head">' +
        '<div class="es-dr-head-title">' +
          '<h2 class="es-dr-h2">Profilo Ufficiale</h2>' +
          '<span class="es-pd-source-badge es-pd-source-user es-dr-badge">' + (verified ? 'Verificato' : 'Profilo') + '</span>' +
        '</div>' +
        '<button type="button" class="es-btn-cos-primary es-dr-primary" data-' + esc(attr || 'pd') + '="' + esc(primaryAction.act) + '">' +
          primaryAction.icon + '<span>' + esc(primaryAction.label) + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="es-pd-who es-dr-who">' +
        avaHtml +
        '<div class="es-dr-who-text">' +
          '<b class="es-dr-name">' + esc(name) + '</b>' +
          '<div class="es-dr-tags">' +
            '<span class="es-dr-role">' + esc(roleLabel) + '</span>' +
            (club ? '<span class="es-dr-club"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="es-pd-onboarding-box es-dr-onb">' +
        '<div class="es-dr-onb-row">' +
          '<span class="es-dr-onb-label">Completamento Anagrafica &amp; Ruolo</span>' +
          '<span class="es-dr-onb-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="es-dr-bar">' +
          '<div class="es-dr-bar-fill" data-pct="' + (Math.round(pct / 5) * 5) + '"></div>' +
        '</div>' +
        '<div class="es-dr-onb-foot">' +
          '<span class="es-dr-muted">' + (pct >= 100 ? 'Profilo completo' : 'Completa i dati mancanti') + '</span>' +
          '<button type="button" class="es-pd-edit es-dr-link" data-' + esc(attr || 'pd') + '="edit">' +
            '<span>Modifica Anagrafica</span> &rarr;' +
          '</button>' +
        '</div>' +
      '</div>' +
      (bio ? '<div class="es-dr-bio">' + esc(bio) + '</div>' : '') +
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
    return '<section class="es-pd-card es-dr-card">' +
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
      registroContent = '<div class="es-dr-empty">' +
        '<div class="es-dr-empty-ico">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        '</div>' +
        '<div class="es-dr-empty-title">Nessuna registrazione recente</div>' +
        '<div class="es-dr-empty-text">Il registro si popola automaticamente con le attività e relazioni operative del ruolo.</div>' +
      '</div>';
    }

    var clubOpsDash = '';
    if (window.EliseeClubOps && typeof window.EliseeClubOps.dashboard === 'function' && /^(tm|yg|sg|eq|bt|pr|mk)$/.test(attr)) {
      clubOpsDash = window.EliseeClubOps.dashboard(attr, user);
    }

    var dashInner =
      (clubOpsDash || '') +
      '<div class="es-pd-grid">' +
        '<div class="es-dr-col">' +
          identityCard(user, roleLabel, attr) +
          '<div id="es-pd-actions-slot"></div>' +
        '</div>' +
        '<div class="es-dr-col">' +
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
        '<div class="es-dr-col">' +
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
      if (n.id === 'schede' && window.EliseeSchede && typeof window.EliseeSchede.requestPanelHtml === 'function') {
        return tabPanel(n.id, window.EliseeSchede.requestPanelHtml(attr === 'ds' ? 'ds' : attr));
      }
      if (window.EliseeClubOps && typeof window.EliseeClubOps.panel === 'function') {
        var opsHtml = window.EliseeClubOps.panel(attr, n.id, user);
        if (opsHtml) return tabPanel(n.id, opsHtml);
      }
      var cta = n.act
        ? '<button type="button" class="es-pro-btn-quick-jump" data-' + attr + '="' + n.act + '">Apri ' + esc(n.label) + '</button>'
        : '';
      return tabPanel(n.id, panelCard(esc(n.label),
        '<p class="es-dr-lead">Modulo operativo di ' + esc(cfg.area) + '. I dati si popolano dalle attività reali del ruolo.</p>' + cta
      ));
    }).join('');

    var kpiHtml = cfg.kpi.items.map(function (it) {
      return '<div><strong>' + it[0] + '</strong><span>' + it[1] + '</span></div>';
    }).join('');

    var logo = val(user.clubLogo || user.squadraLogo || user.logoSquadra || '');
    var clubName = club || 'Squadra non inserita';
    var crest = function (cls) {
      return logo
        ? '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(logo) + '" alt="' + esc(clubName) + '">'
        : '<span class="es-pro-crest-ico' + (cls ? ' ' + cls : '') + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + ICO.shield + '</svg></span>';
    };
    var licenceText = [
      val((user.staffProfile && (user.staffProfile.licence || user.staffProfile.patentino)) || user.patentino || user.licenza || user.abilitazione),
      val(user.matricola || user.tessera || user.nTessera)
    ].filter(Boolean).join(' · ') || 'Abilitazione non inserita';

    return '<div class="es-pro-shell">' +
      '<aside class="es-pro-sidebar">' +
        '<div class="es-pro-brand-header"><div class="es-pro-brand-title">ELISEE <span>SCOUT</span></div><div class="es-pro-brand-sub">' + esc(cfg.area) + '</div></div>' +
        '<nav class="es-pro-sidebar-nav">' +
          cfg.nav.map(function (n) { return renderSideBtn(n, attr, n.id === 'dashboard'); }).join('') +
        '</nav>' +
        '<div class="es-pro-sidebar-badge"><div class="es-pro-sidebar-club-card">' +
          crest('') +
          '<div><strong>' + esc(clubName) + '</strong><span>' + esc(cfg.staff) + '</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-pro-main">' +
        '<div class="es-pro-dash-header">' +
          '<div class="es-pro-header-top-row">' +
            '<button type="button" class="es-pro-mobile-menu-btn" id="btn-toggle-pro-sidebar" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
            '<div class="es-pro-header-identity">' +
              '<div class="es-pro-header-block">' +
                '<div class="es-pro-licence-badge"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ICO.shield + '</svg></div>' +
                '<div class="es-pro-doc-info"><strong>' + esc(name) + '</strong><span class="role">' + esc(roleLabel) + '</span><p class="sub">' + esc(licenceText) + '</p></div>' +
              '</div>' +
              '<div class="es-pro-header-sep"></div>' +
              '<div class="es-pro-header-block es-pro-club-info">' +
                crest('crest') +
                '<div><strong>' + esc(clubName) + '</strong><span>' + esc(cfg.clubSub) + '</span></div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-pro-btn-quick-jump" data-pro-nav="' + esc(cfg.cta.act) + '" data-' + attr + '="' + esc(cfg.cta.act) + '">' + esc(cfg.cta.label) + '</button>' +
          '</div>' +
          '<div class="es-pro-header-match-row">' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.next.label) + '</p><strong>Nessun impegno in programma</strong><span>Si aggiorna con il calendario del club</span></div>' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.kpi.label) + '</p><div class="es-pro-countdown-nums">' + kpiHtml + '</div></div>' +
            '<div class="es-pro-target-box"><p class="label">' + esc(cfg.focus.label) + '</p><strong class="es-dr-accent">' + esc(cfg.focus.title) + '</strong><span>' + esc(cfg.focus.sub) + '</span></div>' +
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
