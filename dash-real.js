/* Elisee Scout — shell comune dashboard ruolo: ordine professionale, solo dati reali. */
(function () {
  'use strict';

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
    return val((u && (u.squadra || u.club || u.squadraCuore)) || '');
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
    var r = String(roleLabel || '').toLowerCase();
    if (/osservatore|scout/.test(r)) return { label: 'Inoltra Target al DS', act: 'secret', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' };
    if (/match analyst|video/.test(r)) return { label: 'Nuovo Report Tattico', act: 'new-report', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' };
    if (/portieri/.test(r)) return { label: 'Nuova Scheda Portieri', act: 'new-session', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' };
    if (/atletico/.test(r)) return { label: 'Registra Carico GPS', act: 'new-gps', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' };
    if (/medico/.test(r)) return { label: 'Nuova Visita Medica', act: 'new-visit', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' };
    if (/fisioterapista/.test(r)) return { label: 'Registra Terapia', act: 'new-treat', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' };
    if (/direttore sportivo/.test(r)) return { label: 'Secret List Stealth', act: 'secret', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' };
    if (/presidente/.test(r)) return { label: 'Nuova Delibera CDA', act: 'new-cda', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' };
    return { label: 'Aggiorna Dati Ruolo', act: 'edit', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' };
  }

  function identityCard(user, roleLabel, attr) {
    var name = nameOf(user) || roleLabel;
    var ph = photoOf(user);
    var initText = esc(initials(name, roleLabel));
    
    // Avatar con fallback infallibile: NESSUN rettangolo nero!
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

      // Blocco Anagrafica: Nessuna duplicazione del club!
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

      // Componente di Onboarding & Completamento Profilo (Sostituisce il testo grigio isolato)
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

  function shell(opts) {
    opts = opts || {};
    var user = opts.user || {};
    var attr = opts.attr || 'pd';
    var roleLabel = opts.roleLabel || 'Staff';
    var title = opts.title || ('Elisee Scout — ' + roleLabel);
    var name = nameOf(user) || roleLabel;
    var extraRail = '';
    if (opts.extraRail === 'secret') {
      extraRail = '<button type="button" data-' + attr + '="secret" title="Secret List">' +
        ico('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="2.5"/>') + '</button>';
    }
    var recTitle = opts.registroTitle || 'Registro attività';
    var recHeaders = opts.registroHeaders || ['Voce', 'Dettaglio', 'Stato'];
    var recRows = Array.isArray(opts.records) ? opts.records : (Array.isArray(user.activityLog) ? user.activityLog : []);
    
    // Empty state professionale al posto di tabelle vuote con solo header
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

    return '<aside class="es-pd-rail">' +
      '<button type="button" data-' + attr + '="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-' + attr + '="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      extraRail +
      '<button type="button" data-' + attr + '="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-' + attr + '="edit" title="Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head" style="margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">' +
        '<div>' +
          '<div style="font-size:0.75rem; color:#64748b; margin-bottom:2px;">Elisee Scout &rsaquo; Area Riservata Professionale</div>' +
          '<h1 style="font-size:1.45rem; font-weight:900; color:#f8fafc; margin:0; line-height:1.2;">' + esc(title) + '</h1>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<span class="es-pd-source-badge" style="background:#071522; border:1px solid #12344a; color:#38bdf8; font-weight:800; padding:4px 10px; border-radius:6px; font-size:0.75rem;">' + esc(roleLabel) + '</span>' +
        '</div>' +
      '</div>' +
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
        '<section class="es-pd-card es-pd-trend">' +
          '<div class="es-pd-card-header"><h2>Andamento</h2><span class="es-pd-source-badge">Vuoto</span></div>' +
          empty('Nessuna serie storica certificata.') +
          '<button type="button" class="es-pd-edit" data-' + attr + '="edit">Modifica anagrafica</button>' +
        '</section>' +
      '</div>' +

      '</div></div>';
  }

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
