/* ELISEE SCOUT — 30 giorni per allegare i documenti anti-fake, poi chiusura account. */
(function () {
  var GRACE_MS = 30 * 24 * 60 * 60 * 1000;
  var WARN_EVERY_MS = 12 * 60 * 60 * 1000;
  var CLOSED_KEY = 'elisee_closed_accounts';

  function now() { return Date.now(); }
  function iso(t) { return new Date(t).toISOString(); }
  function user() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function saveUser(u) {
    try {
      localStorage.setItem('elisee_active_user', JSON.stringify(u));
      localStorage.setItem('elisee_user_data', JSON.stringify(u));
    } catch (_) {}
    return u;
  }
  function emailOf(u) {
    return String((u && u.email) || '').trim().toLowerCase();
  }
  function isSpectator(u) {
    if (window.isSpectatorRole) return window.isSpectatorRole(u);
    var r = String((u && (u.ruolo || u.role || u.siteRoleFamily)) || '').toLowerCase();
    return r === 'tifoso' || r === 'spettatore';
  }
  function hasRole(u) {
    return !!(u && (u.siteRoleConfirmed || u.siteRoleFamily || u.ruolo || u.role));
  }
  function docsOk(u) {
    if (!u) return false;
    var st = String(u.badgeVerificaStato || '');
    if (st === 'pending' || st === 'in_review' || st === 'approved' || st === 'temp_approved') return true;
    if (u.docsAttachedAt) return true;
    if (u.badgeDocumentUrl || u.badgeSelfieUrl) return true;
    return false;
  }
  function closedMap() {
    try { return JSON.parse(localStorage.getItem(CLOSED_KEY) || '{}') || {}; } catch (_) { return {}; }
  }
  function markClosedStore(u, reason) {
    var em = emailOf(u);
    if (!em) return;
    var m = closedMap();
    m[em] = { at: iso(now()), reason: reason || 'docs_timeout', nome: ((u.nome || '') + ' ' + (u.cognome || '')).trim() };
    try { localStorage.setItem(CLOSED_KEY, JSON.stringify(m)); } catch (_) {}
  }
  function isEmailClosed(email) {
    var em = String(email || '').trim().toLowerCase();
    if (!em) return null;
    return closedMap()[em] || null;
  }

  function parseTime(s) {
    var t = Date.parse(s || '');
    return isNaN(t) ? 0 : t;
  }

  function startClock(u, opts) {
    opts = opts || {};
    if (!u || isSpectator(u)) return u;
    if (docsOk(u) || u.accountClosed) return u;
    if (!u.roleConfirmedAt) u.roleConfirmedAt = iso(now());
    if (!u.verifyDocsDeadline) {
      var start = opts.fromNow ? now() : (parseTime(u.roleConfirmedAt) || now());
      u.verifyDocsDeadline = iso(start + GRACE_MS);
    }
    u.needsIdentityDocument = true;
    return saveUser(u);
  }

  function daysLeft(u) {
    var end = parseTime(u && u.verifyDocsDeadline);
    if (!end) return 30;
    return Math.max(0, Math.ceil((end - now()) / (24 * 60 * 60 * 1000)));
  }

  function warnCopy(u) {
    var d = daysLeft(u);
    var ruolo = (u && (u.siteRoleFamily || u.ruolo || u.role)) || 'ruolo';
    if (d <= 0) {
      return {
        title: 'Account in chiusura',
        body: 'Non hai allegato i documenti di verifica entro 30 giorni. L’account viene chiuso in automatico.'
      };
    }
    if (d <= 3) {
      return {
        title: 'Ultimi ' + d + ' giorni per i documenti',
        body: 'Hai ancora ' + d + (d === 1 ? ' giorno' : ' giorni') + ' per allegare documento d’identità e selfie anti-fake. Senza questi file l’account ' + ruolo + ' verrà chiuso.'
      };
    }
    return {
      title: 'Verifica anti-fake: ' + d + ' giorni rimanenti',
      body: 'Hai 30 giorni dalla scelta del ruolo per allegare tutti i documenti e dimostrare che non è un account fake. Poi, dopo avvisi continui, l’account si chiude da solo.'
    };
  }

  function pushWarn(u, force) {
    if (!u || isSpectator(u) || docsOk(u) || u.accountClosed) return;
    var last = parseTime(u.lastVerifyWarnAt);
    if (!force && last && (now() - last) < WARN_EVERY_MS) return;
    u.lastVerifyWarnAt = iso(now());
    saveUser(u);
    var copy = warnCopy(u);
    if (window.EliseeUserNotifs && typeof window.EliseeUserNotifs.push === 'function') {
      var nid = 'verify-' + (u.verifyDocsDeadline || '').slice(0, 10) + '-' + daysLeft(u);
      var already = (window.EliseeUserNotifs.list(u) || []).some(function (n) { return n.id === nid; });
      if (!already) {
        window.EliseeUserNotifs.push({
          id: nid,
          title: copy.title,
          body: copy.body
        }, u);
      }
    }
    if (typeof window.showToast === 'function') window.showToast(copy.title, dToastKind(u));
  }

  function dToastKind(u) {
    return daysLeft(u) <= 3 ? 'error' : 'warning';
  }

  function paintBanner(u) {
    var el = document.getElementById('es-verify-banner');
    if (!el) return;
    if (!u || !hasRole(u) || isSpectator(u) || docsOk(u) || u.accountClosed) {
      el.hidden = true;
      el.innerHTML = '';
      document.body.classList.remove('es-verify-on');
      paintCard(u);
      return;
    }
    startClock(u, { fromNow: true });
    var d = daysLeft(u);
    var copy = warnCopy(u);
    document.body.classList.add('es-verify-on');
    el.hidden = false;
    el.className = 'es-verify-banner' + (d <= 3 ? ' is-urgent' : '');
    el.innerHTML =
      '<div class="es-verify-inner">' +
        '<strong>' + copy.title + '</strong>' +
        '<span>' + copy.body + '</span>' +
        '<button type="button" class="es-verify-go" id="es-verify-go">Allega documenti</button>' +
      '</div>';
    paintCard(u);
  }

  function paintCard(u) {
    var card = document.getElementById('es-verify-card');
    var txt = document.getElementById('es-verify-card-text');
    if (!card) return;
    if (!u || isSpectator(u) || u.accountClosed) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    if (!txt) return;
    if (docsOk(u)) {
      txt.textContent = 'Documenti ricevuti. L’account non verrà chiuso per mancanza file mentre la verifica è in corso.';
      return;
    }
    if (!hasRole(u)) {
      txt.textContent = 'Dopo la registrazione con un ruolo specifico hai un mese per allegare documento d’identità e selfie. Se dopo avvisi continui i file non arrivano, l’account viene chiuso automaticamente.';
      return;
    }
    var d = daysLeft(startClock(u, { fromNow: !u.verifyDocsDeadline }));
    txt.textContent = d <= 0
      ? 'Termine scaduto: senza documenti l’account viene chiuso automaticamente.'
      : ('Hai ancora ' + d + (d === 1 ? ' giorno' : ' giorni') + ' per allegare documento d’identità e selfie anti-fake. Senza file, dopo avvisi continui, l’account si chiude da solo.');
  }

  function closeAccount(u) {
    if (!u) u = user();
    if (!u || isSpectator(u) || docsOk(u)) return;
    u.accountClosed = true;
    u.accountClosedAt = iso(now());
    u.accountClosedReason = 'docs_timeout';
    u.statusLegale = 'closed_docs_timeout';
    saveUser(u);
    markClosedStore(u, 'docs_timeout');
    try {
      fetch('/api/auth/verify-docs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action: 'close', reason: 'docs_timeout' })
      }).catch(function () {});
    } catch (_) {}
    enforceClosed(u);
  }

  function authHeaders() {
    var h = { 'Content-Type': 'application/json' };
    try {
      var tok = localStorage.getItem('elisee_auth_token');
      if (tok) h.Authorization = 'Bearer ' + tok;
    } catch (_) {}
    return h;
  }

  function enforceClosed(u) {
    showClosedModal(u);
    try {
      if (window.EliseeAuth && typeof window.EliseeAuth.clearSession === 'function') {
        window.EliseeAuth.clearSession();
      } else {
        localStorage.removeItem('elisee_user_auth');
        localStorage.removeItem('elisee_active_user');
        localStorage.removeItem('elisee_user_data');
        localStorage.removeItem('elisee_auth_token');
      }
      localStorage.removeItem('elisee_site_role_confirmed');
    } catch (_) {}
    if (typeof window.updateNavbarUserUI === 'function') window.updateNavbarUserUI();
    paintBanner(null);
  }

  function showClosedModal(u) {
    var old = document.getElementById('es-verify-closed');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.id = 'es-verify-closed';
    wrap.className = 'es-verify-closed';
    wrap.innerHTML =
      '<div class="es-verify-closed-sheet" role="alertdialog" aria-modal="true">' +
        '<h2>Account chiuso</h2>' +
        '<p>Dopo un mese di avvisi non sono stati allegati i documenti di verifica (documento d’identità e selfie anti-fake). L’account è stato chiuso automaticamente per prevenire profili fake.</p>' +
        '<p class="es-verify-closed-mail">' + (emailOf(u) || '') + '</p>' +
        '<button type="button" class="es-verify-go" id="es-verify-closed-ok">Ho capito</button>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target.id === 'es-verify-closed-ok' || e.target === wrap) wrap.remove();
    });
  }

  function tick(u, opts) {
    opts = opts || {};
    u = u || user();
    if (!u) {
      paintBanner(null);
      return u;
    }
    var closedHit = isEmailClosed(u.email);
    if (closedHit || u.accountClosed) {
      u.accountClosed = true;
      if (u.email) saveUser(u);
      enforceClosed(u);
      return u;
    }
    if (!u.email && !u.id) {
      paintBanner(null);
      return u;
    }
    if (isSpectator(u) || !hasRole(u)) {
      paintBanner(null);
      return u;
    }
    if (docsOk(u)) {
      paintBanner(u);
      return u;
    }
    u = startClock(u, { fromNow: !u.verifyDocsDeadline });
    var end = parseTime(u.verifyDocsDeadline);
    if (end && now() >= end) {
      closeAccount(u);
      return u;
    }
    paintBanner(u);
    paintCard(u);
    pushWarn(u, !!opts.forceWarn);
    return u;
  }

  function markDocs(u) {
    u = u || user();
    if (!u) return u;
    u.docsAttachedAt = iso(now());
    if (!u.badgeVerificaStato || u.badgeVerificaStato === 'none') u.badgeVerificaStato = 'pending';
    saveUser(u);
    try {
      fetch('/api/auth/verify-docs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action: 'docs', badgeVerificaStato: u.badgeVerificaStato })
      }).catch(function () {});
    } catch (_) {}
    paintBanner(u);
    if (window.EliseeUserNotifs && window.EliseeUserNotifs.push) {
      window.EliseeUserNotifs.push({
        title: 'Documenti inviati',
        body: 'Abbiamo ricevuto gli allegati. L’account non verrà chiuso per mancanza documenti mentre la verifica è in corso.'
      }, u);
    }
    return u;
  }

  function openDocs() {
    if (typeof window.openRequestBadgeModal === 'function') window.openRequestBadgeModal();
    else if (typeof window.switchView === 'function') window.switchView('user-dossier', '#user-dossier-portal');
  }

  function bind() {
    document.addEventListener('click', function (e) {
      if (e.target && (e.target.id === 'es-verify-go' || e.target.id === 'es-verify-card-go')) openDocs();
    });
    document.addEventListener('elisee:user-revealed', function (e) {
      tick((e && e.detail && e.detail.user) || user(), { forceWarn: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') tick(user());
    });
    setInterval(function () { tick(user()); }, 10 * 60 * 1000);
  }

  function wrapAuth() {
    if (!window.EliseeAuth) return;
    if (!window.EliseeAuth.login.__esVerify) {
      var prevLogin = window.EliseeAuth.login;
      window.EliseeAuth.login = function (email, password) {
        var hit = isEmailClosed(email);
        if (hit) {
          showClosedModal({ email: email });
          return Promise.reject({ payload: { error: 'account_chiuso' }, message: 'account_chiuso' });
        }
        return prevLogin.call(this, email, password).then(function (res) {
          if (res && res.user) {
            tick(res.user, { forceWarn: true });
            if (res.user.accountClosed || isEmailClosed(res.user.email)) {
              enforceClosed(res.user);
              throw { payload: { error: 'account_chiuso' }, message: 'account_chiuso' };
            }
          }
          return res;
        });
      };
      window.EliseeAuth.login.__esVerify = true;
    }
    if (!window.EliseeAuth.applySession.__esVerify) {
      var prevApply = window.EliseeAuth.applySession;
      window.EliseeAuth.applySession = function (u, token) {
        if (u && typeof u === 'object') {
          var local = user();
          if (local && u.email && local.email && String(local.email).toLowerCase() === String(u.email).toLowerCase()) {
            u.verifyDocsDeadline = u.verifyDocsDeadline || local.verifyDocsDeadline;
            u.roleConfirmedAt = u.roleConfirmedAt || local.roleConfirmedAt;
            u.docsAttachedAt = u.docsAttachedAt || local.docsAttachedAt;
            u.badgeVerificaStato = u.badgeVerificaStato || local.badgeVerificaStato;
            u.accountClosed = u.accountClosed || local.accountClosed;
          }
        }
        var out = prevApply.call(this, u, token);
        setTimeout(function () { tick(u, { forceWarn: false }); }, 0);
        return out;
      };
      window.EliseeAuth.applySession.__esVerify = true;
    }
    if (typeof window.paintLoggedInUser === 'function' && !window.paintLoggedInUser.__esVerify) {
      var prevPaint = window.paintLoggedInUser;
      window.paintLoggedInUser = function (u) {
        var out = prevPaint.apply(this, arguments);
        try { tick(u || user()); } catch (_) {}
        return out;
      };
      window.paintLoggedInUser.__esVerify = true;
    }
    if (window.EliseeAuth.restore && !window.EliseeAuth.restore.__esVerify) {
      var prevRestore = window.EliseeAuth.restore;
      window.EliseeAuth.restore = function () {
        return prevRestore.apply(this, arguments).then(function (u) {
          if (u) tick(u, { forceWarn: true });
          return u;
        });
      };
      window.EliseeAuth.restore.__esVerify = true;
    }
  }

  function wrapRoleAndBadge() {
    if (typeof window.confirmSiteRole === 'function' && !window.confirmSiteRole.__esVerify) {
      var prev = window.confirmSiteRole;
      window.confirmSiteRole = function () {
        var r = prev.apply(this, arguments);
        var u = user();
        if (u && hasRole(u) && !isSpectator(u)) {
          u = startClock(u, { fromNow: true });
          try {
            fetch('/api/auth/verify-docs', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ action: 'start', ruolo: u.ruolo || u.siteRoleFamily })
            }).catch(function () {});
          } catch (_) {}
          if (typeof window.showToast === 'function') {
            window.showToast('Hai 30 giorni per allegare i documenti di verifica. Senza file l’account verrà chiuso.', 'warning');
          }
          tick(u, { forceWarn: true });
        }
        return r;
      };
      window.confirmSiteRole.__esVerify = true;
    }
    if (typeof window.submitBadgeRequest === 'function' && !window.submitBadgeRequest.__esVerify) {
      var prevSub = window.submitBadgeRequest;
      window.submitBadgeRequest = function () {
        var doc = document.getElementById('badge-doc-upload');
        var selfie = document.getElementById('badge-selfie-upload');
        var hasDoc = doc && doc.files && doc.files[0];
        var hasSelfie = selfie && selfie.files && selfie.files[0];
        if (!hasDoc || !hasSelfie) {
          if (typeof window.showToast === 'function') {
            window.showToast('Allega documento d’identità e selfie anti-fake per completare la verifica.', 'error');
          }
          return;
        }
        var u = user();
        if (u) {
          u.badgeDocumentUrl = hasDoc ? (doc.files[0].name || 'documento') : '';
          u.badgeSelfieUrl = hasSelfie ? (selfie.files[0].name || 'selfie') : '';
          saveUser(u);
        }
        var r = prevSub.apply(this, arguments);
        markDocs(user());
        return r;
      };
      window.submitBadgeRequest.__esVerify = true;
    }
    if (typeof window.onSiteRoleSelectChange === 'function' && !window.onSiteRoleSelectChange.__esVerify) {
      var prevHint = window.onSiteRoleSelectChange;
      window.onSiteRoleSelectChange = function (value) {
        prevHint(value);
        var hint = document.getElementById('scegli-ruolo-hint');
        if (!hint) return;
        if (window.isSpectatorRole && window.isSpectatorRole(value)) {
          hint.hidden = false;
          hint.style.display = 'block';
          hint.textContent = 'Il Tifoso naviga e interagisce. Non deve allegare il documento di identità e non può inviare candidature.';
        } else if (String(value || '').toLowerCase() === 'giornalista') {
          hint.hidden = false;
          hint.style.display = 'block';
          hint.textContent = 'Il Giornalista ha 30 giorni per i documenti anti-fake. Solo con badge Stampa / Giornalista Verificato può inviare articoli, sondaggi e video in pubblicazione.';
        } else if (value) {
          hint.hidden = false;
          hint.style.display = 'block';
          hint.textContent = 'Dopo la registrazione hai 30 giorni per allegare tutti i documenti di verifica (anti-fake). Se non li carichi, dopo avvisi continui l’account viene chiuso automaticamente.';
        }
      };
      window.onSiteRoleSelectChange.__esVerify = true;
    }
  }

  function otpEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function isOtpVerified(u) {
    if (!u) return false;
    return !!(u.emailVerifiedAt && (u.emailVerified || u.isEmailVerified || u.email_verified));
  }

  function killOtpOverlay() {
    var ids = ['es-otp-modal-overlay', 'es-otp-modal'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll('.es-otp-modal-backdrop').forEach(function (el) { el.remove(); });
  }

  var otpBound = false;

  function otpEmailOf(u) {
    u = u || user();
    return String((u && (u.email || u.user_email)) || localStorage.getItem('elisee_user_email') || '').trim().toLowerCase();
  }

  function otpFeedback(text, isErr) {
    var errMsg = document.getElementById('otp-error-msg');
    var infoMsg = document.getElementById('otp-info-msg');
    if (isErr) {
      if (infoMsg) { infoMsg.style.display = 'none'; infoMsg.setAttribute('hidden', ''); }
      if (errMsg) {
        errMsg.textContent = text;
        errMsg.removeAttribute('hidden');
        errMsg.style.display = 'block';
      }
    } else {
      if (errMsg) { errMsg.style.display = 'none'; errMsg.setAttribute('hidden', ''); }
      if (infoMsg) {
        infoMsg.textContent = text;
        infoMsg.removeAttribute('hidden');
        infoMsg.style.display = 'block';
      }
    }
  }

  function otpDigits() {
    return document.querySelectorAll('#es-otp-bottom-banner .es-otp-digit');
  }

  function sendOtpRequest() {
    var userEmail = otpEmailOf();
    if (!userEmail) {
      otpFeedback('Nessun indirizzo email associato all\'account. Esci e accedi di nuovo.', true);
      return;
    }
    var btnSend = document.getElementById('btn-trigger-otp');
    if (btnSend) btnSend.disabled = true;
    otpDigits().forEach(function (inp) { inp.value = ''; });
    otpFeedback('Invio del codice a ' + userEmail + ' in corso…', false);

    fetch('/api/auth-otp?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, action: 'send' })
    })
    .then(function (res) { return res.json().then(function (data) { data._http = res.status; return data; }); })
    .then(function (data) {
      otpDigits().forEach(function (inp) { inp.value = ''; });
      if (btnSend) btnSend.disabled = false;
      if (data.success) {
        otpFeedback('Ti abbiamo inviato un codice a 6 cifre su ' + userEmail + '. Aprilo nella casella (anche Spam) e inseriscilo qui. Non è un SMS.', false);
        var first = document.getElementById('otp-d-0');
        if (first) first.focus();
      } else {
        otpFeedback(data.error || 'Errore durante l\'invio del codice OTP', true);
      }
    })
    .catch(function () {
      if (btnSend) btnSend.disabled = false;
      otpFeedback('Servizio temporaneamente non disponibile. Riprova.', true);
    });
  }

  function doVerifyOtp() {
    var userEmail = otpEmailOf();
    var inputs = otpDigits();
    var entered = Array.prototype.map.call(inputs, function (i) { return i.value; }).join('');
    if (entered.length < 6) {
      otpFeedback('Inserisci tutte le 6 cifre del codice ricevuto via email', true);
      return;
    }
    var btnSubmit = document.getElementById('btn-submit-otp');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Verifica...';
    }
    fetch('/api/auth-otp?action=verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, code: entered, action: 'verify' })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Verifica';
      }
      if (data.success && data.verified) {
        var currUser = user() || {};
        currUser.emailVerified = true;
        currUser.isEmailVerified = true;
        currUser.email_verified = true;
        currUser.emailVerifiedAt = data.verifiedAt || new Date().toISOString();
        saveUser(currUser);
        killOtpOverlay();
        var banner = document.getElementById('es-otp-bottom-banner');
        if (banner) banner.remove();
        if (window.showToast) window.showToast('Indirizzo email verificato.', 'success');
        try { document.dispatchEvent(new CustomEvent('elisee:email-verified', { detail: { user: currUser } })); } catch (_) {}
        try { document.dispatchEvent(new CustomEvent('elisee:auth-changed', { detail: { user: currUser } })); } catch (_) {}
      } else {
        otpFeedback(data.error || 'Codice OTP non valido o scaduto', true);
      }
    })
    .catch(function () {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Verifica';
      }
      otpFeedback('Errore di connessione. Riprova.', true);
    });
  }

  function bindOtpBanner(root) {
    if (!root || root.dataset.otpBound === '1') return;
    root.dataset.otpBound = '1';
    var inputs = root.querySelectorAll('.es-otp-digit');
    inputs.forEach(function (inp, idx) {
      inp.addEventListener('input', function () {
        var val = inp.value.replace(/[^0-9]/g, '');
        inp.value = val ? val.slice(-1) : '';
        if (val && idx < inputs.length - 1) inputs[idx + 1].focus();
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
      });
      inp.addEventListener('paste', function (e) {
        e.preventDefault();
        var paste = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/[^0-9]/g, '');
        for (var i = 0; i < inputs.length; i++) inputs[i].value = paste[i] || '';
      });
    });
    var send = root.querySelector('#btn-trigger-otp');
    if (send) send.addEventListener('click', function (e) { e.preventDefault(); sendOtpRequest(); });
    var verify = root.querySelector('#btn-submit-otp');
    if (verify) verify.addEventListener('click', function (e) { e.preventDefault(); doVerifyOtp(); });
  }

  function paintOtpBanner(u) {
    u = u || user();
    killOtpOverlay();
    var existing = document.getElementById('es-otp-bottom-banner');
    var isAuth = false;
    try {
      isAuth = localStorage.getItem('elisee_user_auth') === 'true' && !!(u && (u.email || u.id));
    } catch (_) {}

    if (!isAuth || isOtpVerified(u) || (u && u.accountClosed)) {
      if (existing) existing.remove();
      return;
    }

    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'es-otp-bottom-banner';
      existing.className = 'es-otp-bottom-banner';
      var mail = otpEmailOf(u);
      var gmailLink = /@gmail\.com$/.test(mail)
        ? ' <a href="https://mail.google.com/mail/u/0/#search/Elisee+Scout" target="_blank" rel="noopener" class="es-otp-inbox-link">Apri Gmail</a>'
        : '';
      existing.innerHTML =
        '<div class="es-otp-banner-inner es-otp-banner-flow">' +
          '<div class="es-otp-banner-text">' +
            '<strong>Verifica email</strong>' +
            '<span>Invieremo un codice OTP a <b class="es-otp-mail">' + otpEsc(mail || '—') + '</b>. Aprilo nella casella e inseriscilo qui. Non è un SMS.' + gmailLink + '</span>' +
          '</div>' +
          '<div class="es-otp-inputs-wrap es-otp-inputs-inline" role="group" aria-label="Codice OTP a 6 cifre">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-0" autocomplete="one-time-code" aria-label="Cifra 1">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-1" autocomplete="off" aria-label="Cifra 2">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-2" autocomplete="off" aria-label="Cifra 3">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-3" autocomplete="off" aria-label="Cifra 4">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-4" autocomplete="off" aria-label="Cifra 5">' +
            '<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="es-otp-digit" id="otp-d-5" autocomplete="off" aria-label="Cifra 6">' +
          '</div>' +
          '<div class="es-otp-banner-actions">' +
            '<button type="button" class="es-otp-btn-send" id="btn-trigger-otp">Invia codice</button>' +
            '<button type="button" class="es-otp-btn-verify" id="btn-submit-otp">Verifica</button>' +
          '</div>' +
          '<p id="otp-error-msg" hidden></p>' +
          '<p id="otp-info-msg" hidden></p>' +
        '</div>';
      document.body.appendChild(existing);
      bindOtpBanner(existing);
    }
  }

  function openOtpModal(u) {
    paintOtpBanner(u || user());
  }

  window.openEmailOtpModal = openOtpModal;
  window.paintEmailOtpBanner = paintOtpBanner;

  window.EliseeVerify = {
    tick: tick,
    startClock: startClock,
    markDocs: markDocs,
    closeAccount: closeAccount,
    isEmailClosed: isEmailClosed,
    daysLeft: daysLeft,
    docsOk: docsOk,
    noticeClosed: showClosedModal,
    openEmailOtp: openOtpModal,
    paintOtpBanner: paintOtpBanner
  };

  function boot() {
    wrapAuth();
    wrapRoleAndBadge();
    bind();
    var u = user();
    tick(u);
    paintOtpBanner(u);

    document.addEventListener('elisee:view-changed', function () {
      paintOtpBanner(user());
    });
    document.addEventListener('elisee:auth-changed', function () {
      paintOtpBanner(user());
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(wrapAuth, 0);
  setTimeout(wrapRoleAndBadge, 0);
  setTimeout(wrapAuth, 800);
  setTimeout(wrapRoleAndBadge, 800);
  setTimeout(function () { 
    var u = user();
    tick(u);
    paintOtpBanner(u);
  }, 600);
})();

