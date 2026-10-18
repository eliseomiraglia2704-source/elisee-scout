/**
 * ELISEE SCOUT — Guardia sessione staff (Admin / Responsabile Privacy).
 *
 * L'unica fonte di verità è il token firmato rilasciato da /api/auth-admin.
 * I flag localStorage `elisee_admin_auth` / `elisee_privacy_auth` sono solo uno
 * specchio per i listener `storage` esistenti: non vanno mai letti per decidere
 * i permessi. Usare sempre window.EliseeAdmin.isAdmin() / isPrivacy() / isStaff().
 *
 * Il ruolo letto dal token lato client serve solo a non far lampeggiare la UI:
 * all'avvio il token viene verificato dal server e, se non è valido, la sessione
 * viene chiusa. I dati admin restano comunque protetti lato server.
 */
(function (root) {
  'use strict';

  var TOKEN_KEY = 'elisee_admin_session_token';
  var FLAG_ADMIN = 'elisee_admin_auth';
  var FLAG_PRIVACY = 'elisee_privacy_auth';

  var verified = null;
  var verifying = null;

  function readToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function decode(token) {
    if (!token || typeof token !== 'string') return null;
    var parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    try {
      var b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) b64 += '=';
      var p = JSON.parse(atob(b64));
      if (!p || typeof p.exp !== 'number') return null;
      if (p.role !== 'admin' && p.role !== 'privacy') return null;
      return { role: p.role, exp: p.exp };
    } catch (_) {
      return null;
    }
  }

  function current() {
    var now = Date.now();
    var tok = readToken();
    if (!tok) return null;
    if (verified && verified.token === tok && verified.exp > now) return verified;
    var p = decode(tok);
    if (p && p.exp > now) return p;
    return null;
  }

  function writeFlags(role) {
    try {
      if (role === 'admin') {
        localStorage.setItem(FLAG_ADMIN, 'true');
        localStorage.removeItem(FLAG_PRIVACY);
      } else if (role === 'privacy') {
        localStorage.setItem(FLAG_PRIVACY, 'true');
        localStorage.removeItem(FLAG_ADMIN);
      } else {
        localStorage.removeItem(FLAG_ADMIN);
        localStorage.removeItem(FLAG_PRIVACY);
      }
    } catch (_) {}
  }

  function clear() {
    verified = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
    writeFlags(null);
  }

  function notify() {
    try {
      document.dispatchEvent(new CustomEvent('elisee:auth-changed', { detail: { role: 'staff' } }));
    } catch (_) {}
  }

  function setSession(token, role) {
    var p = decode(token);
    if (!p) {
      clear();
      return false;
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } catch (_) {}
    verified = { role: p.role, exp: p.exp, token: token };
    writeFlags(verified.role);
    return true;
  }

  /**
   * Verifica il token con il server. cb(ok, data).
   * Errore di rete: la sessione resta com'è (ok = false, data = { network: true }).
   */
  function verify(cb) {
    var token = readToken();
    if (!token || !decode(token)) {
      clear();
      if (cb) cb(false, null);
      return;
    }
    if (!verifying) {
      verifying = fetch('/api/auth-admin', { headers: { Authorization: 'Bearer ' + token } })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            return { status: r.status, data: d || {} };
          });
        })
        .then(function (res) {
          var d = res.data;
          if (res.status === 200 && d.authenticated && (d.role === 'admin' || d.role === 'privacy')) {
            verified = { role: d.role, exp: Number(d.expiresAt) || (decode(token) || {}).exp || 0, token: token };
            writeFlags(verified.role);
            return { ok: true, data: d };
          }
          clear();
          return { ok: false, data: d };
        }, function () {
          return { ok: false, data: { network: true } };
        })
        .then(function (out) {
          verifying = null;
          return out;
        });
    }
    verifying.then(function (out) {
      if (cb) cb(out.ok, out.data);
    });
  }

  var api = {
    token: readToken,
    role: function () { var c = current(); return c ? c.role : null; },
    isAdmin: function () { var c = current(); return !!(c && c.role === 'admin'); },
    isPrivacy: function () { var c = current(); return !!(c && c.role === 'privacy'); },
    isStaff: function () { return !!current(); },
    setSession: setSession,
    clear: clear,
    verify: verify
  };

  root.EliseeAdmin = api;

  // Allinea subito i flag specchio allo stato reale del token.
  var boot = current();
  if (!boot) {
    var hadFlags = false;
    try {
      hadFlags = localStorage.getItem(FLAG_ADMIN) === 'true' || localStorage.getItem(FLAG_PRIVACY) === 'true';
    } catch (_) {}
    clear();
    if (hadFlags) notify();
  } else {
    writeFlags(boot.role);
    verify(function (ok, data) {
      if (ok || (data && data.network)) return;
      notify();
      try {
        var h = String(location.hash || '').toLowerCase();
        if (h === '#admin-portal' || h === '#privacy-portal') location.reload();
      } catch (_) {}
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
