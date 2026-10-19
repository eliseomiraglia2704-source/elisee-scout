/**
 * ELISEE SCOUT — Recupero password con codice email.
 * 1) /api/auth-otp?action=send (purpose=reset)  2) verify → resetToken
 * 3) /api/auth/reset-password → nuova password e accesso.
 * Il codice arriva solo per email: mai nella risposta del server.
 */
(function () {
  'use strict';

  var state = { email: '', busy: false };

  function $(id) { return document.getElementById(id); }
  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var v = window.EliseeI18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }
  function msg(text, ok) {
    var el = $('accesso-reset-msg');
    if (!el) return;
    el.textContent = text || '';
    el.hidden = !text;
    el.classList.toggle('is-ok', !!ok);
  }
  function step(n) {
    var a = $('accesso-reset-step1');
    var b = $('accesso-reset-step2');
    if (a) a.hidden = n !== 1;
    if (b) b.hidden = n !== 2;
  }
  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; });
    });
  }

  function open() {
    var general = $('accesso-error-general');
    if (general) general.style.display = 'none';
    var login = $('accesso-email');
    var field = $('accesso-reset-email');
    if (field && login && login.value && !field.value) field.value = login.value.trim();
    msg('');
    step(1);
    var root = $('accesso-method-reset');
    if (root) root.hidden = false;
    if (typeof window.showAccessoMethod === 'function') window.showAccessoMethod('reset');
    if (field) setTimeout(function () { try { field.focus(); } catch (_) {} }, 50);
  }

  function send() {
    if (state.busy) return;
    var email = String(($('accesso-reset-email') || {}).value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg(tr('auth.emailInvalid', 'Inserisci un indirizzo email valido.'));
      return;
    }
    state.busy = true;
    msg(tr('reset.sending', 'Invio in corso…'), true);
    post('/api/auth-otp?action=send', { email: email, purpose: 'reset', ua: navigator.userAgent, tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '' })
      .then(function (j) {
        state.busy = false;
        if (!j.success) {
          msg(j.error || tr('reset.sendFail', 'Invio non riuscito. Riprova tra poco.'));
          return;
        }
        state.email = email;
        msg('');
        step(2);
        var c = $('accesso-reset-code');
        if (c) c.focus();
      })
      .catch(function () { state.busy = false; msg(tr('admin.login.network', 'Errore di rete: riprova tra poco.')); });
  }

  function save() {
    if (state.busy) return;
    var code = String(($('accesso-reset-code') || {}).value || '').replace(/\D/g, '');
    var pw = String(($('accesso-reset-pw') || {}).value || '');
    if (code.length !== 6) { msg(tr('reset.codeLen', 'Inserisci le 6 cifre del codice.')); return; }
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
      msg(tr('reset.policy', 'Almeno 8 caratteri, una maiuscola, un numero e un carattere speciale.'));
      return;
    }
    state.busy = true;
    msg(tr('reset.saving', 'Verifica in corso…'), true);
    post('/api/auth-otp?action=verify', { email: state.email, code: code, purpose: 'reset' })
      .then(function (v) {
        if (!v.success || !v.resetToken) throw { message: v.error || tr('reset.codeBad', 'Codice non valido.') };
        return post('/api/auth/reset-password', { resetToken: v.resetToken, password: pw });
      })
      .then(function (j) {
        state.busy = false;
        if (!j.ok) {
          var e = j.error;
          if (e === 'account_non_trovato') msg(tr('reset.noAccount', 'Non c’è un account con questa email. Se ti sei registrato con Google, entra con Google.'));
          else if (e === 'staff') msg(tr('reset.staff', 'Per lo staff la password si cambia dalle impostazioni del server.'));
          else if (e === 'account_chiuso') msg(tr('reset.closed', 'Questo account è chiuso. Scrivi a areaeliseescout@gmail.com.'));
          else msg(j.message || tr('reset.fail', 'Password non cambiata. Ripeti dall’inizio.'));
          return;
        }
        msg(tr('reset.done', 'Password cambiata. Accesso in corso…'), true);
        try {
          if (window.EliseeAuth && typeof window.EliseeAuth.applySession === 'function') window.EliseeAuth.applySession(j.user, j.token);
          else { localStorage.setItem('elisee_auth_token', j.token); localStorage.setItem('elisee_user_auth', 'true'); }
        } catch (_) {}
        setTimeout(function () { location.reload(); }, 700);
      })
      .catch(function (err) {
        state.busy = false;
        msg((err && err.message) || tr('admin.login.network', 'Errore di rete: riprova tra poco.'));
      });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#accesso-reset-send')) { e.preventDefault(); send(); }
    else if (t.closest('#accesso-reset-save')) { e.preventDefault(); save(); }
    else if (t.closest('#accesso-reset-again')) { e.preventDefault(); msg(''); step(1); }
  });

  window.EliseePasswordReset = { open: open };
})();
