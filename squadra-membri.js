/**
 * ELISEE SCOUT — Staff della squadra (dashboard Allenatore e Vice).
 *
 * Il titolare della squadra (il primo che l'ha aperta) aggiunge o toglie
 * le persone dello staff con la loro email. Le regole le applica il server
 * (/api/squadra, col=membri): qui c'è solo la schermata.
 */
(function () {
  'use strict';

  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var v = window.EliseeI18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function myEmail() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
      return String(u.email || '').toLowerCase();
    } catch (_) { return ''; }
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function shell(inner) {
    return (
      '<div class="es-cos-panel-head"><span class="es-cos-panel-title">' + esc(tr('sqm.title', 'Staff della squadra')) + '</span></div>' +
      '<div class="es-sqm-body">' + inner + '</div>'
    );
  }

  function msg(text, kind) {
    return '<p class="es-sqm-msg' + (kind ? ' es-sqm-msg--' + kind : '') + '" role="' + (kind === 'error' ? 'alert' : 'status') + '">' + esc(text) + '</p>';
  }

  function renderOwner(root, clubId, info, notice) {
    var membri = Array.isArray(info.membri) ? info.membri : [];
    var rows = membri.length
      ? '<ul class="es-sqm-list">' + membri.map(function (m) {
          return '<li class="es-sqm-item"><span class="es-sqm-email">' + esc(m) + '</span>' +
            '<button type="button" class="es-sqm-remove" data-sqm-remove="' + esc(m) + '" aria-label="' + esc(tr('sqm.remove', 'Togli') + ' ' + m) + '">' + esc(tr('sqm.remove', 'Togli')) + '</button></li>';
        }).join('') + '</ul>'
      : msg(tr('sqm.empty', 'Per ora ci sei solo tu.'));
    root.innerHTML = shell(
      '<p class="es-sqm-lead">' + esc(tr('sqm.lead.owner', 'Sei il titolare di questa squadra. Aggiungi le persone dello staff con la loro email: vedranno rosa, schemi e dossier.')) + '</p>' +
      '<p class="es-sqm-team"><span class="es-sqm-label">' + esc(tr('sqm.team', 'Squadra')) + '</span> ' + esc(info.nome || clubId) + '</p>' +
      rows +
      '<form class="es-sqm-form" novalidate>' +
        '<label class="es-sqm-label" for="es-sqm-email">' + esc(tr('sqm.add.label', 'Email della persona da aggiungere')) + '</label>' +
        '<div class="es-sqm-row">' +
          '<input type="email" id="es-sqm-email" class="es-sqm-input" autocomplete="off" placeholder="' + esc(tr('sqm.add.placeholder', 'nome@esempio.it')) + '" required>' +
          '<button type="submit" class="es-btn-cos-primary es-sqm-add">' + esc(tr('sqm.add', 'Aggiungi')) + '</button>' +
        '</div>' +
        '<p class="es-sqm-hint">' + esc(tr('sqm.add.hint', 'La persona deve accedere a Elisee Scout con questa stessa email e avere la stessa squadra nel profilo.')) + '</p>' +
      '</form>' +
      (notice || '')
    );

    var form = root.querySelector('.es-sqm-form');
    form.onsubmit = function (e) {
      e.preventDefault();
      var input = root.querySelector('#es-sqm-email');
      var email = String(input.value || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        renderOwner(root, clubId, info, msg(tr('sqm.err.email', 'Email non valida.'), 'error'));
        return;
      }
      if (email === myEmail()) {
        renderOwner(root, clubId, info, msg(tr('sqm.err.self', 'Sei già il titolare.'), 'error'));
        return;
      }
      change(root, clubId, info, email, false);
    };
    Array.prototype.forEach.call(root.querySelectorAll('[data-sqm-remove]'), function (btn) {
      btn.onclick = function () { change(root, clubId, info, btn.getAttribute('data-sqm-remove'), true); };
    });
  }

  function change(root, clubId, info, email, remove) {
    var api = window.EliseeSupabase;
    var buttons = root.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (b) { b.disabled = true; });
    var p = remove ? api.removeMembro(clubId, email) : api.addMembro(clubId, email);
    p.then(function (r) {
      if (r && r.ok && r.data && Array.isArray(r.data.membri)) {
        info.membri = r.data.membri;
        renderOwner(root, clubId, info, msg(remove ? tr('sqm.ok.removed', 'Persona tolta dallo staff.') : tr('sqm.ok.added', 'Persona aggiunta allo staff.'), 'ok'));
        return;
      }
      renderOwner(root, clubId, info, msg(tr('sqm.err.save', 'Modifica non salvata. Riprova tra poco.'), 'error'));
    });
  }

  function mount(root) {
    if (!root) return;
    var api = window.EliseeSupabase;
    if (!api || typeof api.getSquadraInfo !== 'function') return;
    root.innerHTML = shell(msg(tr('sqm.loading', 'Caricamento…')));
    api.resolveClubId().then(function (clubId) {
      if (!clubId) {
        root.innerHTML = shell(msg(tr('sqm.noteam', 'Nel tuo profilo non c’è una squadra. Aggiungila nel profilo per gestire lo staff.')));
        return;
      }
      return api.getSquadraInfo(clubId).then(function (r) {
        if (r && r.ok && r.data && r.data.titolare) {
          renderOwner(root, clubId, r.data);
          return;
        }
        if (r && r.ok) {
          root.innerHTML = shell(msg(tr('sqm.member', 'Fai parte dello staff di questa squadra. Solo il titolare può aggiungere o togliere persone.')));
          return;
        }
        if (r && r.status === 403) {
          root.innerHTML = shell(msg(tr('sqm.notmember', 'Questa squadra ha già un titolare. Chiedigli di aggiungerti con la tua email:') + ' ' + myEmail()));
          return;
        }
        if (r && r.status === 401) {
          root.innerHTML = shell(msg(tr('sqm.login', 'Accedi di nuovo per gestire lo staff.')));
          return;
        }
        root.innerHTML = shell(msg(tr('sqm.err.load', 'Dati non disponibili. Riprova tra poco.'), 'error'));
      });
    });
  }

  window.EliseeSquadraMembri = { mount: mount };
})();
