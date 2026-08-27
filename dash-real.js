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
  function identityCard(user, roleLabel) {
    var name = nameOf(user) || roleLabel;
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name, roleLabel)) + '</div>';
    var club = clubOf(user);
    var bio = val((user.staffProfile && user.staffProfile.bio) || user.bio);
    var tags = '';
    if (club) tags += '<span class="es-pd-tag">' + esc(club) + '</span>';
    if (user.telefono) tags += '<span class="es-pd-tag">' + esc(user.telefono) + '</span>';
    return '<section class="es-pd-card es-pd-indice">' +
      '<div class="es-pd-card-header"><h2>Profilo</h2><span class="es-pd-source-badge es-pd-source-user">Anagrafica</span></div>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#38bdf8;font-weight:700">' + esc(roleLabel) + '</div>' +
      (club ? '<div style="font-size:0.68rem;color:#94a3b8">' + esc(club) + '</div>' : '') +
      '</div></div>' +
      (tags ? '<div class="es-pd-tags">' + tags + '</div>' : '') +
      (bio ? '<div class="es-pd-empty" style="padding-top:0">' + esc(bio) + '</div>' : empty('Completa l\'anagrafica per valorizzare questo spazio.')) +
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
    var tableBody;
    if (recRows.length) {
      tableBody = recRows.map(function (r) {
        return '<tr><td>' + esc(r.a || r.label || '') + '</td><td>' + esc(r.b || r.detail || '') + '</td><td>' + esc(r.c || r.stato || '') + '</td></tr>';
      }).join('');
    } else {
      tableBody = '<tr><td colspan="' + recHeaders.length + '" class="es-pd-empty">Nessun record sul profilo. Si popola con l\'attività reale.</td></tr>';
    }
    var th = recHeaders.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');

    return '<aside class="es-pd-rail">' +
      '<button type="button" data-' + attr + '="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-' + attr + '="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      extraRail +
      '<button type="button" data-' + attr + '="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-' + attr + '="edit" title="Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>' + esc(title) + '</h1><strong>' + esc(roleLabel) + (name ? ': ' + esc(name) : '') + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
        identityCard(user, roleLabel) +
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
          '<table class="es-pd-table"><thead><tr>' + th + '</tr></thead><tbody>' + tableBody + '</tbody></table>' +
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
