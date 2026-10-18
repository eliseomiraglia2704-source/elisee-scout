/**
 * ELISEE SCOUT — Modulo di accesso staff (#form-admin-login).
 *
 * Collegato qui, fuori da app.js, perché in app.js il vecchio gestore si trova
 * dentro openEditUserModal e non viene mai attivato al caricamento della pagina.
 * Il gestore usa la fase di cattura e ferma gli altri listener, così non parte
 * una seconda richiesta se quello di app.js dovesse attivarsi.
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

  function el(id) { return document.getElementById(id); }

  function showError(msg) {
    var box = el('admin-login-error-container');
    if (!box) return;
    box.textContent = '';
    var p = document.createElement('p');
    p.className = 'es-admin-login-error';
    p.setAttribute('role', 'alert');
    p.textContent = msg;
    box.appendChild(p);
    box.style.display = 'block';
  }

  function clearError() {
    var box = el('admin-login-error-container');
    if (!box) return;
    box.textContent = '';
    box.style.display = 'none';
  }

  function openDashboard(role) {
    var guard = el('admin-login-guard');
    var dash = el('admin-authenticated-dashboard');
    if (guard) guard.style.display = 'none';
    if (dash) {
      dash.style.display = 'block';
      dash.classList.add('es-cc');
    }
    try {
      if (window.EliseeCC) {
        if (typeof window.EliseeCC.bind === 'function') window.EliseeCC.bind();
        var tab = role === 'privacy' ? 'privacy' : (localStorage.getItem('elisee_active_dashboard_tab') || 'admin');
        if (typeof window.EliseeCC.showPane === 'function') window.EliseeCC.showPane(tab);
        if (typeof window.EliseeCC.refresh === 'function') window.EliseeCC.refresh();
      } else if (typeof window.renderAdminPanel === 'function') {
        window.renderAdminPanel();
      }
    } catch (_) {}
    try { if (typeof window.updateNavbarUserUI === 'function') window.updateNavbarUserUI(); } catch (_) {}
    try { document.dispatchEvent(new CustomEvent('elisee:auth-changed', { detail: { role: 'staff' } })); } catch (_) {}
  }

  function bind() {
    var form = el('form-admin-login');
    if (!form || form.dataset.esAdminLogin === '1') return;
    form.dataset.esAdminLogin = '1';
    var busy = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (busy) return;

      var user = String((el('admin-user') || {}).value || '').trim().toLowerCase();
      var pass = String((el('admin-pass') || {}).value || '').trim();
      var totp = String((el('admin-totp') || {}).value || '').replace(/\s+/g, '');
      var btn = form.querySelector('button[type="submit"]');

      if (!pass) {
        showError(tr('admin.login.missing', 'Inserisci la password.'));
        return;
      }
      clearError();
      busy = true;
      if (btn) btn.disabled = true;

      fetch('/api/auth-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, pin: pass, totp: totp })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) {
          if (data && data.needTotp) {
            var group = el('admin-totp-group');
            if (group) group.hidden = false;
            var t = el('admin-totp');
            if (t) { t.value = ''; t.focus(); }
          }
          if (!data || !data.success || !data.token || !window.EliseeAdmin || !window.EliseeAdmin.setSession(data.token, data.role)) {
            showError((data && data.error) || tr('admin.login.failed', 'Accesso non riuscito.'));
            return;
          }
          var t2 = el('admin-totp');
          if (t2) t2.value = '';
          var p = el('admin-pass');
          if (p) p.value = '';
          openDashboard(data.role);
        })
        .catch(function () {
          showError(tr('admin.login.network', 'Errore di rete: riprova tra poco.'));
        })
        .then(function () {
          busy = false;
          if (btn) btn.disabled = false;
        });
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
