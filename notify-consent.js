/* Chiede a ogni account, una sola volta, se vuole le notifiche del sito. */
(function () {
  var STORE = 'elisee_notify_consent_v1';
  var root = null;
  var panel = null;
  var titleEl = null;
  var leadEl = null;
  var noteEl = null;
  var acceptBtn = null;
  var laterBtn = null;
  var shownFor = '';
  var focused = false;
  var phase = 'ask';
  var pendingPerm = false;
  var hooked = false;

  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var value = window.EliseeI18n.t(key);
        if (value && value !== key) return value;
      }
    } catch (e) {}
    return fallback;
  }

  function readStore() {
    try {
      var raw = localStorage.getItem(STORE);
      var data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) {}
  }

  function hashKey(value) {
    var h = 5381;
    var text = String(value || '');
    for (var i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  function readUser() {
    try {
      var raw = localStorage.getItem('elisee_active_user');
      var user = raw ? JSON.parse(raw) : null;
      return user && typeof user === 'object' ? user : null;
    } catch (e) {
      return null;
    }
  }

  function currentKey() {
    var authed = false;
    try { authed = localStorage.getItem('elisee_user_auth') === 'true'; } catch (e) {}
    if (!authed) return 'guest';
    var user = readUser();
    var id = user ? String(user.id || user.email || user.username || '').trim().toLowerCase() : '';
    if (!id) return 'account';
    return 'u:' + hashKey(id);
  }

  function entryFor(key) {
    var all = readStore();
    var row = all[key];
    return row && (row.choice === 'granted' || row.choice === 'denied') ? row : null;
  }

  function remember(choice, perm) {
    var key = currentKey();
    var all = readStore();
    var prev = all[key] || {};
    var next = { choice: choice, at: new Date().toISOString() };
    if (perm) next.perm = String(perm).slice(0, 20);
    else if (prev.perm) next.perm = prev.perm;
    all[key] = next;
    writeStore(all);
    syncProfile(choice === 'granted');
  }

  function syncProfile(pushOn) {
    if (currentKey() === 'guest') return;
    var user = readUser();
    if (!user) return;
    var prefs = user.preferenzeNotifiche && typeof user.preferenzeNotifiche === 'object'
      ? user.preferenzeNotifiche
      : {};
    prefs.push = !!pushOn;
    user.preferenzeNotifiche = prefs;
    if (user.playerProfile && user.playerProfile.notify && typeof user.playerProfile.notify === 'object') {
      user.playerProfile.notify.messages = !!pushOn;
      user.playerProfile.notify.opportunities = !!pushOn;
    }
    try {
      var json = JSON.stringify(user);
      localStorage.setItem('elisee_active_user', json);
      localStorage.setItem('elisee_user_data', json);
    } catch (e) {}
  }

  function skipApp() {
    try {
      return /EliseeScoutApp/i.test(navigator.userAgent || '') || window.__ELISEE_MOBILE_APP__ === true;
    } catch (e) {
      return false;
    }
  }

  function cookieBlocking() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return false;
    if (banner.hidden) return false;
    var display = '';
    try { display = window.getComputedStyle(banner).display; } catch (e) {}
    return display !== 'none';
  }

  function blockingOverlay() {
    if (cookieBlocking()) return true;
    if (document.querySelector('#modal-registrazione.is-open, #modal-accesso-unificato.is-open, #candidate-modal.active')) return true;
    var area = document.getElementById('modal-area-riservata');
    if (area && !area.hidden) return true;
    return false;
  }

  function paint() {
    if (!titleEl) return;
    if (phase === 'blocked') {
      titleEl.textContent = tr('notify.title', 'Notifiche del sito');
      leadEl.textContent = tr('notify.blocked', 'Hai autorizzato il sito, ma il browser ha le notifiche bloccate. Puoi abilitarle dalle impostazioni del browser.');
      noteEl.textContent = tr('notify.note', 'Nessun avviso parte finché non scegli Consenti. Se consenti, il browser chiede un secondo permesso. Questa scelta non invia e-mail.');
      acceptBtn.textContent = tr('notify.close', 'Chiudi');
      laterBtn.hidden = true;
      return;
    }
    laterBtn.hidden = false;
    titleEl.textContent = tr('notify.title', 'Notifiche del sito');
    leadEl.textContent = tr('notify.lead', 'Ogni account sceglie da solo se ricevere gli avvisi su candidature e messaggi. La risposta resta su questo browser.');
    noteEl.textContent = tr('notify.note', 'Nessun avviso parte finché non scegli Consenti. Se consenti, il browser chiede un secondo permesso. Questa scelta non invia e-mail.');
    acceptBtn.textContent = tr('notify.accept', 'Consenti');
    laterBtn.textContent = tr('notify.later', 'Non ora');
  }

  function hide() {
    if (!root) return;
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    phase = 'ask';
    focused = false;
  }

  function show() {
    paint();
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    if (!focused) {
      try { panel.focus(); } catch (e) {}
      focused = true;
    }
  }

  function refresh() {
    if (!root || pendingPerm) return;
    if (skipApp()) {
      hide();
      return;
    }
    var key = currentKey();
    if (key !== shownFor) {
      shownFor = key;
      focused = false;
      phase = 'ask';
    }
    if (blockingOverlay()) {
      if (!root.hidden) {
        root.hidden = true;
        root.setAttribute('aria-hidden', 'true');
        focused = false;
      }
      return;
    }
    if (entryFor(key) && phase !== 'blocked') {
      hide();
      return;
    }
    show();
  }

  function askBrowser() {
    try {
      if (!window.Notification || typeof Notification.requestPermission !== 'function') {
        return Promise.resolve('unsupported');
      }
      var result = Notification.requestPermission();
      if (result && typeof result.then === 'function') return result;
      return Promise.resolve(result || 'default');
    } catch (e) {
      return Promise.resolve('unsupported');
    }
  }

  function onAccept() {
    if (phase === 'blocked') {
      hide();
      return;
    }
    pendingPerm = true;
    var pending = askBrowser();
    remember('granted');
    pending.then(function (perm) {
      var value = String(perm || '');
      remember('granted', value);
      pendingPerm = false;
      if (value === 'denied') {
        phase = 'blocked';
        focused = false;
        show();
        return;
      }
      hide();
    }).catch(function () {
      pendingPerm = false;
      hide();
    });
  }

  function onLater() {
    remember('denied');
    hide();
  }

  function onKey(ev) {
    if (!root || root.hidden) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (phase === 'blocked') hide();
      else onLater();
      return;
    }
    if (ev.key !== 'Tab') return;
    var nodes = phase === 'blocked' ? [acceptBtn] : [acceptBtn, laterBtn];
    var index = nodes.indexOf(document.activeElement);
    if (ev.shiftKey) {
      if (index <= 0) {
        ev.preventDefault();
        nodes[nodes.length - 1].focus();
      }
    } else if (index === -1 || index === nodes.length - 1) {
      ev.preventDefault();
      nodes[0].focus();
    }
  }

  function onProfileSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'form-edit-user') return;
    var box = document.getElementById('pref-push');
    if (!box) return;
    if (box.checked) {
      var pending = askBrowser();
      remember('granted');
      pending.then(function (perm) { remember('granted', perm); }).catch(function () {});
      return;
    }
    remember('denied');
    if (phase === 'blocked') phase = 'ask';
    hide();
  }

  function hookPaint() {
    if (hooked || typeof window.paintLoggedInUser !== 'function') return;
    if (window.paintLoggedInUser.__esNotify) {
      hooked = true;
      return;
    }
    var prev = window.paintLoggedInUser;
    var wrapped = function (user) {
      var result = prev.apply(this, arguments);
      refresh();
      return result;
    };
    wrapped.__esNotify = true;
    if (prev.__esVerify) wrapped.__esVerify = true;
    window.paintLoggedInUser = wrapped;
    hooked = true;
  }

  function bind() {
    root = document.getElementById('es-notify');
    panel = document.getElementById('es-notify-panel');
    titleEl = document.getElementById('es-notify-title');
    leadEl = document.getElementById('es-notify-lead');
    noteEl = document.getElementById('es-notify-note');
    acceptBtn = document.getElementById('es-notify-accept');
    laterBtn = document.getElementById('es-notify-later');
    if (!root || !panel || !acceptBtn || !laterBtn) return;
    acceptBtn.addEventListener('click', onAccept);
    laterBtn.addEventListener('click', onLater);
    document.addEventListener('keydown', onKey);
    document.addEventListener('submit', onProfileSubmit, true);
    document.addEventListener('elisee:lang-changed', paint);
    document.addEventListener('elisee:auth-changed', refresh);
    window.addEventListener('storage', refresh);
    var banner = document.getElementById('cookie-banner');
    if (banner && window.MutationObserver) {
      var observer = new MutationObserver(refresh);
      observer.observe(banner, { attributes: true, attributeFilter: ['style', 'hidden', 'class'] });
    }
    document.addEventListener('click', function () { setTimeout(refresh, 0); });
    hookPaint();
    setInterval(function () {
      hookPaint();
      refresh();
    }, 1500);
    var wait = 500;
    try {
      if (!localStorage.getItem('elisee_cookie_consent_v2') && !localStorage.getItem('elisee_cookie_consent')) wait = 1400;
    } catch (e) {}
    setTimeout(refresh, wait);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
