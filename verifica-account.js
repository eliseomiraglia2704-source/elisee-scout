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
  function isPreVerified(u) {
    if (!u) return false;
    if (u.verifiedByAdmin || u.skipDocVerify) return true;
    if (u.isAdmin || u.isCreator) return true;
    var em = emailOf(u);
    if (em === 'eliseomiraglia2704@gmail.com') return true;
    if (window.EliseeStaff && window.EliseeStaff.isStaffEmail(em)) return true;
    try {
      if (localStorage.getItem('elisee_admin_auth') === 'true' &&
          window.EliseeStaff && window.EliseeStaff.isStaffEmail(em)) return true;
    } catch (_) {}
    var blob = [u.ruolo, u.role, u.staffRole, u.ruoloDettagliato, u.siteRole, u.siteRoleFamily]
      .filter(Boolean).join(' ').toLowerCase();
    if (blob.indexOf('admin executive') !== -1) return true;
    if (/(^|\s)admin(\s|$)/.test(blob) || blob === 'admin') return true;
    if (blob.indexOf('creator') !== -1 || blob.indexOf('creatore') !== -1) return true;
    return false;
  }

  function docsOk(u) {
    if (!u) return false;
    if (isPreVerified(u)) return true;
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
    if (isPreVerified(u)) {
      u.skipDocVerify = true;
      u.verifiedByAdmin = true;
      u.badgeVerificaStato = u.badgeVerificaStato && u.badgeVerificaStato !== 'none' ? u.badgeVerificaStato : 'approved';
      u.needsIdentityDocument = false;
      return saveUser(u);
    }
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
    if (!u || !hasRole(u) || isSpectator(u) || isPreVerified(u) || docsOk(u) || u.accountClosed) {
      el.hidden = true;
      el.innerHTML = '';
      el.style.display = 'none';
      document.body.classList.remove('es-verify-on');
      paintCard(u);
      return;
    }
    startClock(u, { fromNow: true });
    var d = daysLeft(u);
    var copy = warnCopy(u);
    document.body.classList.add('es-verify-on');
    el.hidden = false;
    el.style.display = '';
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
      var closePayload = { action: 'close', reason: 'docs_timeout' };
      var closeEm = emailOf(u);
      if (closeEm) closePayload.email = closeEm;
      fetch('/api/auth/verify-docs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(closePayload)
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
    if (isPreVerified(u)) {
      u.skipDocVerify = true;
      u.verifiedByAdmin = true;
      u.badgeVerificaStato = 'approved';
      u.needsIdentityDocument = false;
      saveUser(u);
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
      var docsPayload = { action: 'docs', badgeVerificaStato: u.badgeVerificaStato };
      var docsEm = emailOf(u);
      if (docsEm) docsPayload.email = docsEm;
      fetch('/api/auth/verify-docs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(docsPayload)
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

  function syncWithServer(u) {
    u = u || user();
    var em = emailOf(u);
    if (!em || isSpectator(u)) return;
    try {
      fetch('/api/auth/verify-docs?email=' + encodeURIComponent(em), {
        headers: authHeaders()
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res || !res.ok || !res.record) return;
        var rec = res.record;
        var changed = false;
        if (rec.action === 'close' || rec.closedAt) {
          u.accountClosed = true;
          u.accountClosedAt = rec.closedAt || u.accountClosedAt || iso(now());
          u.accountClosedReason = rec.reason || 'docs_timeout';
          markClosedStore(u, u.accountClosedReason);
          saveUser(u);
          enforceClosed(u);
          return;
        }
        if (rec.badgeVerificaStato && rec.badgeVerificaStato !== u.badgeVerificaStato) {
          u.badgeVerificaStato = rec.badgeVerificaStato;
          changed = true;
        }
        if (rec.docsAt && !u.docsAttachedAt) {
          u.docsAttachedAt = rec.docsAt;
          changed = true;
        }
        if (rec.startedAt && !u.roleConfirmedAt) {
          u.roleConfirmedAt = rec.startedAt;
          changed = true;
        }
        if (changed) {
          saveUser(u);
          paintBanner(u);
        }
      }).catch(function () {});
    } catch (_) {}
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
      var u = (e && e.detail && e.detail.user) || user();
      tick(u, { forceWarn: true });
      syncWithServer(u);
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
        setTimeout(function () {
          tick(u, { forceWarn: false });
          syncWithServer(u);
        }, 0);
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
          if (u) {
            tick(u, { forceWarn: true });
            syncWithServer(u);
          }
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
            var startPayload = { action: 'start', ruolo: u.ruolo || u.siteRoleFamily };
            var startEm = emailOf(u);
            if (startEm) startPayload.email = startEm;
            fetch('/api/auth/verify-docs', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify(startPayload)
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
    var infoMsg = document.getElementById('otp-info-msg');
    var root = document.getElementById('es-otp-bottom-banner');
    if (infoMsg) infoMsg.textContent = text;
    if (root) root.classList.toggle('is-bad', !!isErr);
  }

  var mailOtpLeft = 0;
  var mailOtpTimer = null;

  function mailOtpRoot() {
    return document.getElementById('es-otp-bottom-banner');
  }

  function otpDigits() {
    return document.querySelectorAll('#es-otp-bottom-banner .es-mailotp-slot input');
  }

  function paintMailFocus() {
    var active = document.activeElement;
    otpDigits().forEach(function (el) {
      var slot = el && el.parentNode;
      if (!slot) return;
      slot.classList.toggle('is-on', el === active || !!el.value);
      slot.classList.toggle('is-spin', el === active && !el.value);
    });
  }

  function mailCode() {
    return Array.prototype.map.call(otpDigits(), function (el) {
      return String((el && el.value) || '').replace(/\D/g, '').slice(0, 1);
    }).join('');
  }

  function setMailSlotsEnabled(on) {
    otpDigits().forEach(function (inp) { inp.disabled = !on; });
    var root = mailOtpRoot();
    if (root) root.classList.toggle('is-ready', !!on);
  }

  function tickMailResend() {
    var count = document.getElementById('es-mailotp-count');
    var btn = document.getElementById('btn-trigger-otp');
    var resend = document.getElementById('es-mailotp-resend');
    if (count) count.textContent = mailOtpLeft > 0 ? ('tra ' + mailOtpLeft + 's') : '';
    if (resend) resend.hidden = !(btn && btn.dataset.sent === '1');
    if (btn && btn.dataset.sent === '1') {
      btn.disabled = mailOtpLeft > 0;
      btn.textContent = 'Reinvia';
    }
  }

  function startMailTimer() {
    mailOtpLeft = 30;
    tickMailResend();
    clearInterval(mailOtpTimer);
    mailOtpTimer = setInterval(function () {
      mailOtpLeft -= 1;
      if (mailOtpLeft <= 0) {
        mailOtpLeft = 0;
        clearInterval(mailOtpTimer);
      }
      tickMailResend();
    }, 1000);
  }

  function writeMailDigits(raw) {
    var digits = String(raw || '').replace(/\D/g, '').slice(0, 6).split('');
    var list = otpDigits();
    var root = mailOtpRoot();
    if (root) {
      root._esWriting = true;
      root.classList.remove('is-bad', 'is-ok', 'is-filled');
    }
    list.forEach(function (el, i) {
      if (!el || el.disabled) return;
      el.value = digits[i] || '';
    });
    if (root) root._esWriting = false;
    paintMailFocus();
    if (digits.length === 6) {
      if (root) root.classList.add('is-filled');
      setTimeout(function () { doVerifyOtp(); }, 450);
    } else if (list[digits.length] && !list[digits.length].disabled) {
      list[digits.length].focus();
    }
  }

  function sendOtpRequest() {
    var userEmail = otpEmailOf();
    if (!userEmail) {
      otpFeedback('Nessun indirizzo email associato all\'account. Esci e accedi di nuovo.', true);
      return;
    }
    var btnSend = document.getElementById('btn-trigger-otp');
    if (btnSend) {
      if (btnSend.dataset.sent === '1' && mailOtpLeft > 0) return;
      btnSend.disabled = true;
      btnSend.textContent = 'Invio…';
    }
    otpDigits().forEach(function (inp) { inp.value = ''; });
    var root = mailOtpRoot();
    if (root) root.classList.remove('is-bad', 'is-ok', 'is-filled');
    otpFeedback('Invio del codice a ' + userEmail + ' in corso…', false);

    var u = user() || {};
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}
    fetch('/api/auth-otp?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        action: 'send',
        nome: u.nome || u.firstName || '',
        ua: navigator.userAgent || '',
        tz: tz
      })
    })
    .then(function (res) { return res.json().then(function (data) { data._http = res.status; return data; }); })
    .then(function (data) {
      otpDigits().forEach(function (inp) { inp.value = ''; });
      if (data.success) {
        if (data.ticket) {
          try { sessionStorage.setItem('elisee_otp_ticket_' + userEmail, data.ticket); } catch (_) {}
          window.__lastOtpTicket = data.ticket;
        }
        if (btnSend) btnSend.dataset.sent = '1';
        setMailSlotsEnabled(true);
        startMailTimer();
        otpFeedback('Codice inviato a ' + userEmail + '. Controlla la casella, anche Spam. Non è un SMS.', false);
        var first = document.getElementById('otp-d-0');
        if (first) first.focus();
        paintMailFocus();
      } else {
        if (btnSend) {
          btnSend.disabled = false;
          btnSend.textContent = btnSend.dataset.sent === '1' ? 'Reinvia' : 'Invia codice';
        }
        otpFeedback(data.error || 'Errore durante l\'invio del codice OTP', true);
      }
    })
    .catch(function () {
      if (btnSend) {
        btnSend.disabled = false;
        btnSend.textContent = btnSend.dataset.sent === '1' ? 'Reinvia' : 'Invia codice';
      }
      otpFeedback('Servizio temporaneamente non disponibile. Riprova.', true);
    });
  }

  function doVerifyOtp() {
    var userEmail = otpEmailOf();
    var root = mailOtpRoot();
    if (root && root._esVerifying) return;
    var entered = mailCode();
    if (otpDigits()[0] && otpDigits()[0].disabled) {
      otpFeedback('Prima premi Invia codice. Il codice arriva solo via email.', true);
      return;
    }
    if (entered.length < 6) {
      otpFeedback('Inserisci tutte le 6 cifre del codice ricevuto via email.', true);
      return;
    }
    if (root) root._esVerifying = true;
    otpFeedback('Verifica del codice in corso…', false);
    var ticket = window.__lastOtpTicket || '';
    if (!ticket) {
      try { ticket = sessionStorage.getItem('elisee_otp_ticket_' + userEmail) || ''; } catch (_) {}
    }
    fetch('/api/auth-otp?action=verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, code: entered, ticket: ticket, action: 'verify' })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (root) root._esVerifying = false;
      if (data.success && data.verified) {
        try { sessionStorage.removeItem('elisee_otp_ticket_' + userEmail); } catch (_) {}
        delete window.__lastOtpTicket;
        var currUser = user() || {};
        currUser.emailVerified = true;
        currUser.isEmailVerified = true;
        currUser.email_verified = true;
        currUser.emailVerifiedAt = data.verifiedAt || new Date().toISOString();
        saveUser(currUser);
        if (root) {
          root.classList.remove('is-bad', 'is-filled');
          root.classList.add('is-ok');
        }
        otpFeedback('Indirizzo email verificato.', false);
        killOtpOverlay();
        setTimeout(function () {
          var banner = document.getElementById('es-otp-bottom-banner');
          if (banner) banner.remove();
        }, 700);
        if (window.showToast) window.showToast('Indirizzo email verificato.', 'success');
        try { document.dispatchEvent(new CustomEvent('elisee:email-verified', { detail: { user: currUser } })); } catch (_) {}
        try { document.dispatchEvent(new CustomEvent('elisee:auth-changed', { detail: { user: currUser } })); } catch (_) {}
      } else {
        if (root) {
          root.classList.remove('is-filled', 'is-ok');
          root.classList.add('is-bad');
        }
        otpFeedback(data.error || 'Codice OTP non valido o scaduto', true);
      }
    })
    .catch(function () {
      if (root) root._esVerifying = false;
      otpFeedback('Errore di connessione. Riprova.', true);
    });
  }

  function bindOtpBanner(root) {
    if (!root || root.dataset.otpBound === '1') return;
    root.dataset.otpBound = '1';
    root.addEventListener('input', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT' || el.disabled) return;
      var d = (el.value || '').replace(/\D/g, '');
      if (d.length > 1) { writeMailDigits(d); return; }
      el.value = d.slice(0, 1);
      paintMailFocus();
      var list = otpDigits();
      var i = Array.prototype.indexOf.call(list, el);
      if (d && i >= 0 && list[i + 1]) list[i + 1].focus();
      if (mailCode().length === 6 && !root._esWriting) {
        root.classList.add('is-filled');
        setTimeout(function () { doVerifyOtp(); }, 450);
      } else {
        root.classList.remove('is-filled', 'is-ok', 'is-bad');
      }
    });
    root.addEventListener('keydown', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT') return;
      if (e.key !== 'Backspace' || el.value) return;
      var list = otpDigits();
      var i = Array.prototype.indexOf.call(list, el);
      if (i > 0) {
        list[i - 1].value = '';
        list[i - 1].focus();
        paintMailFocus();
        root.classList.remove('is-filled', 'is-ok', 'is-bad');
      }
    });
    root.addEventListener('paste', function (e) {
      var text = (e.clipboardData && e.clipboardData.getData('text')) || '';
      if (!/\d/.test(text)) return;
      e.preventDefault();
      writeMailDigits(text);
    });
    root.addEventListener('focusin', paintMailFocus);
    root.addEventListener('focusout', function () { setTimeout(paintMailFocus, 0); });
    var send = root.querySelector('#btn-trigger-otp');
    if (send) send.addEventListener('click', function (e) { e.preventDefault(); sendOtpRequest(); });
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
      existing.className = 'es-mailotp-dock';
      var mail = otpEmailOf(u);
      var gmailLink = /@gmail\.com$/.test(mail)
        ? '<a href="https://mail.google.com/mail/u/0/#search/subject%3A%22Codice+di+verifica+Elisee+Scout%22" target="_blank" rel="noopener" class="es-mailotp-gmail">Apri Gmail</a>'
        : '';
      var slots = '';
      for (var si = 0; si < 6; si++) {
        slots += '<label class="es-mailotp-slot"><input type="text" maxlength="1" inputmode="numeric" autocomplete="' + (si === 0 ? 'one-time-code' : 'off') + '" class="es-mailotp-digit" id="otp-d-' + si + '" aria-label="Cifra ' + (si + 1) + '" disabled></label>';
      }
      existing.innerHTML =
        '<div class="es-mailotp" id="es-mailotp">' +
          '<span class="es-mailotp-notch" aria-hidden="true"></span>' +
          '<h2>Verifica email</h2>' +
          '<p class="es-mailotp-sub">Codice a 6 cifre inviato a <strong>' + otpEsc(mail || '—') + '</strong>. Non è un SMS.</p>' +
          '<div class="es-mailotp-slots" role="group" aria-label="Codice OTP a 6 cifre">' + slots + '</div>' +
          '<p class="es-mailotp-resend" id="es-mailotp-resend" hidden>Puoi reinviare <span id="es-mailotp-count"></span></p>' +
          '<div class="es-mailotp-toast">' +
            '<span class="es-mailotp-bubble" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg></span>' +
            '<span class="es-mailotp-toast-txt"><small>EMAIL · OTP</small><strong id="otp-info-msg">Premi Invia codice, poi scrivi le 6 cifre della mail.</strong></span>' +
            '<button type="button" class="es-mailotp-fill" id="btn-trigger-otp">Invia codice</button>' +
          '</div>' +
          gmailLink +
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

