/**
 * ELISEE SCOUT - Cookie Consent + Analytics + Profilazione + Marketing
 * GDPR Art. 6/7/21 - attivazione solo dopo consenso granulare.
 */
(function (global) {
  'use strict';

  // Testo del banner nella lingua scelta (chiavi cookie.* in i18n.js).
  function ctr(key, fallback) {
    try {
      if (global.EliseeI18n && typeof global.EliseeI18n.t === 'function') {
        var v = global.EliseeI18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }

  var STORAGE_KEY = 'elisee_cookie_consent_v2';
  var LEGACY_KEY = 'elisee_cookie_consent';
  var PROFILE_KEY = 'elisee_user_profile';
  var ANALYTICS_KEY = 'elisee_analytics_events';
  var CONSENT_LOG_KEY = 'elisee_consent_log';
  var MARKETING_KEY = 'elisee_marketing';
  var SESSION_KEY = 'elisee_session_id';
  var COOKIE_DAYS = 365;

  var DEFAULT_CONSENT = {
    version: 2,
    technical: true,
    analytics: false,
    profiling: false,
    marketing: false,
    updatedAt: null,
    source: null
  };

  /* ------------------------------------------------------------------ */
  /* Cookie helpers                                                      */
  /* ------------------------------------------------------------------ */
  function setCookie(name, value, days) {
    var maxAge = (days || COOKIE_DAYS) * 24 * 60 * 60;
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      name +
      '=' +
      encodeURIComponent(String(value)) +
      '; path=/; max-age=' +
      maxAge +
      '; SameSite=Lax' +
      secure;
  }

  function getCookie(name) {
    var parts = (document.cookie || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      if (p.indexOf(name + '=') === 0) {
        return decodeURIComponent(p.substring(name.length + 1));
      }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie =
      name +
      '=; path=/; max-age=0; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function lsSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* quota */ }
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return (
      (prefix || 'id') +
      '-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 9)
    );
  }

  /* ------------------------------------------------------------------ */
  /* Consent                                                             */
  /* ------------------------------------------------------------------ */
  function migrateLegacy() {
    var v2 = lsGet(STORAGE_KEY, null);
    if (v2 && typeof v2 === 'object') return v2;
    var legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    if (legacy === 'all') {
      return {
        version: 2,
        technical: true,
        analytics: true,
        profiling: true,
        marketing: true,
        updatedAt: nowISO(),
        source: 'legacy-all'
      };
    }
    if (legacy === 'technical') {
      return {
        version: 2,
        technical: true,
        analytics: false,
        profiling: false,
        marketing: false,
        updatedAt: nowISO(),
        source: 'legacy-technical'
      };
    }
    if (legacy === 'partial') {
      return {
        version: 2,
        technical: true,
        analytics: false,
        profiling: false,
        marketing: false,
        updatedAt: nowISO(),
        source: 'legacy-partial'
      };
    }
    return null;
  }

  function getConsent() {
    var c = lsGet(STORAGE_KEY, null) || migrateLegacy();
    if (!c) return Object.assign({}, DEFAULT_CONSENT);
    return Object.assign({}, DEFAULT_CONSENT, c);
  }

  function hasDecision() {
    var c = lsGet(STORAGE_KEY, null) || migrateLegacy();
    return !!(c && c.updatedAt);
  }

  function logConsent(consent, action) {
    var log = lsGet(CONSENT_LOG_KEY, []);
    if (!Array.isArray(log)) log = [];
    log.unshift({
      id: uid('CL'),
      action: action || 'update',
      technical: !!consent.technical,
      analytics: !!consent.analytics,
      profiling: !!consent.profiling,
      marketing: !!consent.marketing,
      source: consent.source || 'ui',
      ua: navigator.userAgent.slice(0, 160),
      path: location.pathname + location.hash,
      protocol: location.protocol,
      ts: nowISO()
    });
    if (log.length > 200) log = log.slice(0, 200);
    lsSet(CONSENT_LOG_KEY, log);
  }

  function applyCookiesFromConsent(consent) {
    // Technical (always)
    var sid = getCookie('elisee_sid') || sessionStorage.getItem(SESSION_KEY) || uid('SESS');
    sessionStorage.setItem(SESSION_KEY, sid);
    setCookie('elisee_sid', sid, 1);
    setCookie('elisee_consent', [
      consent.technical ? 'T' : '-',
      consent.analytics ? 'A' : '-',
      consent.profiling ? 'P' : '-',
      consent.marketing ? 'M' : '-'
    ].join(''), COOKIE_DAYS);
    setCookie('elisee_consent_ts', consent.updatedAt || nowISO(), COOKIE_DAYS);

    if (consent.analytics) {
      var aid = getCookie('elisee_aid') || uid('AID');
      setCookie('elisee_aid', aid, COOKIE_DAYS);
    } else {
      deleteCookie('elisee_aid');
    }

    if (consent.profiling) {
      var pid = getCookie('elisee_pid') || uid('PID');
      setCookie('elisee_pid', pid, COOKIE_DAYS);
    } else {
      deleteCookie('elisee_pid');
      // wipe profile when profiling revoked
      try { localStorage.removeItem(PROFILE_KEY); } catch (e) {}
    }

    if (consent.marketing) {
      var mid = getCookie('elisee_mid') || uid('MID');
      setCookie('elisee_mid', mid, COOKIE_DAYS);
      captureUtm();
    } else {
      deleteCookie('elisee_mid');
      try { localStorage.removeItem(MARKETING_KEY); } catch (e) {}
    }

    if (!consent.analytics) {
      // keep aggregated history only if admin needs it? purge events for privacy
      try { localStorage.removeItem(ANALYTICS_KEY); } catch (e) {}
    }
  }

  function saveConsent(partial, source) {
    var prev = getConsent();
    var next = Object.assign({}, DEFAULT_CONSENT, prev, partial, {
      version: 2,
      technical: true,
      updatedAt: nowISO(),
      source: source || 'ui'
    });
    lsSet(STORAGE_KEY, next);
    try {
      localStorage.setItem(
        LEGACY_KEY,
        next.analytics && next.profiling && next.marketing
          ? 'all'
          : !next.analytics && !next.profiling && !next.marketing
            ? 'technical'
            : 'partial'
      );
    } catch (e) {}
    logConsent(next, 'save');
    applyCookiesFromConsent(next);
    hideBanner();
    startEngines();
    applyPersonalization();
    dispatchConsentEvent(next);
    return next;
  }

  function acceptAll() {
    return saveConsent(
      { analytics: true, profiling: true, marketing: true },
      'accept-all'
    );
  }

  function acceptTechnicalOnly() {
    return saveConsent(
      { analytics: false, profiling: false, marketing: false },
      'technical-only'
    );
  }

  function savePreferencesFromUI() {
    var a = document.getElementById('pref-analytics');
    var p = document.getElementById('pref-profiling');
    var m = document.getElementById('pref-marketing');
    return saveConsent(
      {
        analytics: !!(a && a.checked),
        profiling: !!(p && p.checked),
        marketing: !!(m && m.checked)
      },
      'preferences-panel'
    );
  }

  function opposeProfiling() {
    var c = getConsent();
    var next = saveConsent(
      {
        analytics: c.analytics,
        profiling: false,
        marketing: c.marketing
      },
      'art21-opposition'
    );
    logConsent(next, 'art21-oppose-profiling');
    return next;
  }

  function revokeAllOptional() {
    return saveConsent(
      { analytics: false, profiling: false, marketing: false },
      'revoke-optional'
    );
  }

  function dispatchConsentEvent(consent) {
    try {
      global.dispatchEvent(
        new CustomEvent('elisee:consent', { detail: consent })
      );
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /* Analytics                                                           */
  /* ------------------------------------------------------------------ */
  function pushEvent(name, props) {
    var c = getConsent();
    if (!c.analytics) return null;
    var events = lsGet(ANALYTICS_KEY, []);
    if (!Array.isArray(events)) events = [];
    var ev = {
      id: uid('EV'),
      name: name,
      props: props || {},
      path: location.pathname + location.search + location.hash,
      referrer: document.referrer || '',
      title: document.title,
      session: sessionStorage.getItem(SESSION_KEY) || getCookie('elisee_sid'),
      aid: getCookie('elisee_aid'),
      ts: nowISO()
    };
    events.unshift(ev);
    if (events.length > 500) events = events.slice(0, 500);
    lsSet(ANALYTICS_KEY, events);
    setCookie('elisee_last_ev', name, 7);
    return ev;
  }

  function trackPageView() {
    return pushEvent('page_view', {
      hash: location.hash,
      lang: document.documentElement.lang || 'it',
      screen: (screen.width || 0) + 'x' + (screen.height || 0),
      theme: document.documentElement.getAttribute('data-theme') || ''
    });
  }

  /* ------------------------------------------------------------------ */
  /* Profiling                                                           */
  /* ------------------------------------------------------------------ */
  function getProfile() {
    return (
      lsGet(PROFILE_KEY, null) || {
        interests: {},
        roles: {},
        regions: {},
        categories: {},
        searches: [],
        pages: {},
        scoreTags: [],
        lastUpdated: null,
        visitCount: 0
      }
    );
  }

  function bumpMap(map, key, n) {
    if (!key) return;
    var k = String(key).toLowerCase().trim();
    if (!k) return;
    map[k] = (map[k] || 0) + (n || 1);
  }

  function topKeys(map, limit) {
    return Object.keys(map || {})
      .map(function (k) {
        return { key: k, n: map[k] };
      })
      .sort(function (a, b) {
        return b.n - a.n;
      })
      .slice(0, limit || 8);
  }

  function updateProfile(kind, value, meta) {
    var c = getConsent();
    if (!c.profiling) return null;
    var p = getProfile();
    p.visitCount = (p.visitCount || 0) + (kind === 'page' ? 1 : 0);
    if (kind === 'page' || kind === 'section') {
      bumpMap(p.pages, value, 1);
      // infer interests from hash/section names
      var v = String(value || '').toLowerCase();
      if (/portfolio|curriculum|network|ambassador|hero|home/.test(v))
        bumpMap(p.interests, v.replace(/[^a-z0-9_-]/gi, ''), 1);
      if (/scout|calciatore|allenatore|agente|club|staff/.test(v))
        bumpMap(p.roles, (v.match(/scout|calciatore|allenatore|agente|club|staff/) || [])[0], 2);
    }
    if (kind === 'role') bumpMap(p.roles, value, 2);
    if (kind === 'region') bumpMap(p.regions, value, 2);
    if (kind === 'category') bumpMap(p.categories, value, 2);
    if (kind === 'interest') bumpMap(p.interests, value, 2);
    if (kind === 'search') {
      p.searches = p.searches || [];
      p.searches.unshift({
        q: String(value || '').slice(0, 80),
        ts: nowISO()
      });
      if (p.searches.length > 40) p.searches = p.searches.slice(0, 40);
      // extract keywords
      String(value || '')
        .split(/\s+/)
        .forEach(function (w) {
          if (w.length > 2) bumpMap(p.interests, w, 1);
        });
    }
    if (meta && meta.role) bumpMap(p.roles, meta.role, 1);
    if (meta && meta.region) bumpMap(p.regions, meta.region, 1);
    if (meta && meta.category) bumpMap(p.categories, meta.category, 1);

    p.scoreTags = topKeys(p.interests, 6)
      .concat(topKeys(p.roles, 4))
      .map(function (x) {
        return x.key;
      });
    p.lastUpdated = nowISO();
    lsSet(PROFILE_KEY, p);
    setCookie('elisee_ptags', p.scoreTags.slice(0, 5).join('|').slice(0, 120), 30);
    return p;
  }

  function profileFromLocation() {
    var hash = (location.hash || '#home').replace(/^#/, '') || 'home';
    updateProfile('page', hash);
    pushEvent('section_view', { section: hash });
  }

  /* ------------------------------------------------------------------ */
  /* Marketing / UTM                                                     */
  /* ------------------------------------------------------------------ */
  function captureUtm() {
    var c = getConsent();
    if (!c.marketing) return;
    var params = new URLSearchParams(location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'gclid', 'fbclid'];
    var found = {};
    var any = false;
    keys.forEach(function (k) {
      var v = params.get(k);
      if (v) {
        found[k] = v;
        any = true;
      }
    });
    if (!any) return;
    var m = lsGet(MARKETING_KEY, { touches: [] });
    m.last = Object.assign({ ts: nowISO(), landing: location.href }, found);
    m.touches = m.touches || [];
    m.touches.unshift(m.last);
    if (m.touches.length > 20) m.touches = m.touches.slice(0, 20);
    lsSet(MARKETING_KEY, m);
    if (found.utm_source) setCookie('elisee_utm_src', found.utm_source, 30);
    if (found.utm_campaign) setCookie('elisee_utm_cmp', found.utm_campaign, 30);
    pushEvent('campaign_touch', found);
  }

  /* ------------------------------------------------------------------ */
  /* Personalization UI                                                  */
  /* ------------------------------------------------------------------ */
  var personalizationHideTimer = null;

  function hidePersonalizationBar() {
    var bar = document.getElementById('elisee-personalization-bar');
    if (bar) {
      bar.style.display = 'none';
      bar.style.opacity = '0';
    }
    document.body.style.paddingTop = '';
    if (personalizationHideTimer) {
      clearTimeout(personalizationHideTimer);
      personalizationHideTimer = null;
    }
  }

  function applyPersonalization() {
    var c = getConsent();
    hidePersonalizationBar();
    if (!c.profiling) {
      document.documentElement.removeAttribute('data-profiled');
      return;
    }
    document.documentElement.setAttribute('data-profiled', '1');
    // Overlay bar disabilitato per non coprire la navbar di navigazione
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------ */
  /* Banner / Preferences UI                                             */
  /* ------------------------------------------------------------------ */
  // Aspetto del banner: classi es-ck-* in style.css (niente stili scritti nel codice).
  function ensureBannerEl() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cookie-banner';
      document.body.appendChild(banner);
    }
    banner.classList.add('es-ck-banner');
    banner.removeAttribute('style');
    return banner;
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.remove('is-open');
    banner.setAttribute('aria-hidden', 'true');
  }

  function showBanner() {
    var banner = ensureBannerEl();
    banner.classList.add('is-open');
    banner.setAttribute('aria-hidden', 'false');
  }

  function isBannerOpen() {
    var banner = document.getElementById('cookie-banner');
    return !!(banner && banner.classList.contains('is-open'));
  }

  function consentStatusLabel(c) {
    if (!hasDecision()) return null;
    var parts = [];
    parts.push('Tecnici: attivi');
    parts.push('Analitici: ' + (c.analytics ? 'accettati' : 'rifiutati'));
    parts.push('Profilazione: ' + (c.profiling ? 'accettata' : 'rifiutata'));
    parts.push('Marketing: ' + (c.marketing ? 'accettato' : 'rifiutato'));
    var when = c.updatedAt
      ? new Date(c.updatedAt).toLocaleString('it-IT')
      : '';
    return {
      summary: parts.join(' · '),
      when: when,
      full:
        c.analytics && c.profiling && c.marketing
          ? 'Tutti i cookie facoltativi accettati'
          : !c.analytics && !c.profiling && !c.marketing
            ? 'Solo cookie tecnici (obbligatori)'
            : 'Preferenze personalizzate salvate'
    };
  }

  function acceptedAllOptional(c) {
    return !!(c && c.analytics && c.profiling && c.marketing);
  }

  /** Bottone verde luminoso al posto di Accetta tutti se consenso gia espresso */
  function consentAlreadyBtnHtml() {
    return (
      '<button type="button" class="es-ck-btn es-ck-btn--done" disabled aria-disabled="true" ' +
      'title="' + ctr('cookie.doneTitle', 'Hai già espresso le tue preferenze sui cookie') + '">' +
      '\u2713 ' + ctr('cookie.done', 'Consenso già espresso') + '</button>'
    );
  }


  function showPreferencesPanel() {
    var banner = ensureBannerEl();
    var c = getConsent();
    var acceptOrDone = hasDecision()
      ? consentAlreadyBtnHtml()
      : '<button type="button" class="es-ck-btn es-ck-btn--outline" onclick="EliseeCookies.acceptAll()">' + ctr('cookie.accept', 'Accetta tutti') + '</button>';
    banner.innerHTML =
      '<div class="es-ck-inner es-ck-inner--prefs">' +
      '<div class="es-ck-prefs-head">' +
      '<p class="es-ck-title">' + ctr('cookie.prefTitle', 'Gestisci le tue preferenze sui cookie (GDPR)') + '</p>' +
      '<button type="button" class="es-ck-btn es-ck-btn--small" onclick="EliseeCookies.hideBanner()">' + ctr('cookie.close', 'Chiudi') + '</button>' +
      '</div>' +
      '<div class="es-ck-checks">' +
      prefCheck('tech', ctr('cookie.prefTech', 'Cookie tecnici (obbligatori)'), true, true) +
      prefCheck('pref-analytics', ctr('cookie.prefAnalytics', 'Cookie analitici'), c.analytics, false) +
      prefCheck('pref-profiling', ctr('cookie.prefProfiling', 'Cookie di profilazione'), c.profiling, false) +
      prefCheck('pref-marketing', ctr('cookie.prefMarketing', 'Cookie marketing'), c.marketing, false) +
      '</div>' +
      '<div class="es-ck-actions">' +
      '<button type="button" class="es-ck-btn es-ck-btn--primary" onclick="EliseeCookies.savePreferencesFromUI()">' + ctr('cookie.save', 'Salva preferenze') + '</button>' +
      acceptOrDone +
      '<button type="button" class="es-ck-btn es-ck-btn--ghost" onclick="EliseeCookies.acceptTechnicalOnly()">' + ctr('cookie.tech', 'Solo tecnici') + '</button>' +
      '<button type="button" class="es-ck-btn es-ck-btn--ghost" onclick="EliseeCookies.openCookieBanner()">' + ctr('cookie.initial', 'Banner iniziale') + '</button>' +
      '<a class="es-ck-link" href="cookie-policy.html">' + ctr('cookie.noticeCookie', 'Informativa cookie') + '</a>' +
      '<a class="es-ck-link" href="privacy-policy.html">' + ctr('cookie.noticePrivacy', 'Informativa privacy') + '</a>' +
      '</div></div>';
    showBanner();
  }

  function prefCheck(id, label, checked, disabled) {
    return (
      '<label class="es-ck-check">' +
      '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '> ' +
      label +
      '</label>'
    );
  }

  // Cambio lingua: ridisegna il banner nella nuova lingua senza cambiarne la visibilità.
  document.addEventListener('elisee:lang-changed', function () {
    var banner = document.getElementById('cookie-banner');
    if (!banner || !banner.innerHTML) return;
    if (document.getElementById('pref-analytics')) {
      if (isBannerOpen()) showPreferencesPanel();
    } else {
      restoreMainBanner();
    }
  });

  /**
   * Apre il banner cookie come alla prima visita.
   * Se le preferenze sono gia state salvate, le indica chiaramente.
   */
  function openCookieBanner() {
    try {
      restoreMainBanner();
      showBanner();
      try {
        document.getElementById('cookie-banner').scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch (e2) {}
      return true;
    } catch (err) {
      console.error('EliseeCookies.openCookieBanner', err);
      return false;
    }
  }

  /**
   * Voce footer / top bar Preferenze cookie:
   * mostra sempre il banner; se gia accettato, con stato + possibilita di modificare.
   */
  function openPreferences() {
    return openCookieBanner();
  }

  function restoreMainBanner() {
    var banner = ensureBannerEl();
    var decided = hasDecision();
    var primaryBtn = decided
      ? consentAlreadyBtnHtml()
      : '<button type="button" class="es-ck-btn es-ck-btn--primary" onclick="acceptCookiesAll()">✓ ' + ctr('cookie.accept', 'Accetta tutti') + '</button>';
    banner.innerHTML =
      '<div class="es-ck-inner">' +
      '<div class="es-ck-text">' +
      '<p><strong>ELISEE SCOUT</strong><span data-i18n="cookie.before">' + ctr('cookie.before', ' utilizza cookie tecnici, analitici e di profilazione. Leggi l\'') + '</span>' +
      '<a href="cookie-policy.html" data-i18n="cookie.linkCookies">' + ctr('cookie.linkCookies', 'informativa estesa sui cookie') + '</a><span data-i18n="cookie.mid">' + ctr('cookie.mid', ' e l\'') + '</span>' +
      '<a href="privacy-policy.html" data-i18n="cookie.linkPrivacy">' + ctr('cookie.linkPrivacy', 'informativa sul trattamento dei dati personali') + '</a><span data-i18n="cookie.after">' + ctr('cookie.after', ' (artt. 12 e 13 GDPR).') + '</span></p></div>' +
      '<div class="es-ck-actions">' +
      '<button type="button" class="es-ck-btn es-ck-btn--ghost" onclick="acceptCookiesOnly()">' + ctr('cookie.tech', 'Solo tecnici') + '</button>' +
      '<button type="button" class="es-ck-btn es-ck-btn--soft" onclick="if(window.EliseeCookies&&EliseeCookies.showPreferencesPanel){EliseeCookies.showPreferencesPanel();}else{acceptCookiesPartial();}">' + ctr('cookie.manage', 'Gestisci preferenze') + '</button>' +
      primaryBtn +
      (decided ? '<button type="button" class="es-ck-btn es-ck-btn--small" onclick="EliseeCookies.hideBanner()">' + ctr('cookie.close', 'Chiudi') + '</button>' : '') +
      '</div></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Policy modals                                                       */
  /* ------------------------------------------------------------------ */
  function ensurePolicyModal() {
    var el = document.getElementById('elisee-policy-modal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'elisee-policy-modal';
    el.className = 'es-ck-modal';
    el.onclick = function (e) {
      if (e.target === el) el.classList.remove('is-open');
    };
    document.body.appendChild(el);
    return el;
  }

  function openPolicy(title, html) {
    var el = ensurePolicyModal();
    el.innerHTML =
      '<div class="es-ck-modal-box">' +
      '<div class="es-ck-modal-head">' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      '<button type="button" class="es-ck-btn es-ck-btn--small" onclick="document.getElementById(\'elisee-policy-modal\').classList.remove(\'is-open\')">' + ctr('cookie.close', 'Chiudi') + '</button>' +
      '</div>' +
      '<div class="es-ck-modal-body">' + html + '</div></div>';
    el.classList.add('is-open');
  }

  function openCookiePolicy() {
    // Documento esteso dedicato (struttura professionale personalizzata ELISEE SCOUT)
    try {
      global.location.href = 'cookie-policy.html';
    } catch (e) {
      openPolicy(
        'Informativa estesa sui cookie - ELISEE SCOUT',
        '<p>Apri l\'' + '<a href="cookie-policy.html">informativa estesa sui cookie</a>.</p>'
      );
    }
  }

  function openPrivacyPolicy() {
    try {
      global.location.href = 'privacy-policy.html';
    } catch (e) {
      openPolicy(
        'Informativa sul trattamento dei dati personali - ELISEE SCOUT',
        '<p>Apri l\'' + '<a href="privacy-policy.html">informativa ex artt. 12 e 13 GDPR</a>.</p>'
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Event wiring                                                        */
  /* ------------------------------------------------------------------ */
  var enginesStarted = false;

  function startEngines() {
    var c = getConsent();
    applyCookiesFromConsent(c);

    if (c.analytics || c.profiling || c.marketing) {
      trackPageView();
      if (c.profiling) profileFromLocation();
      if (c.marketing) captureUtm();
    }

    if (enginesStarted) return;
    enginesStarted = true;

    // hash / SPA section changes
    global.addEventListener('hashchange', function () {
      if (getConsent().analytics) trackPageView();
      if (getConsent().profiling) profileFromLocation();
    });

    // clicks (analytics)
    document.addEventListener(
      'click',
      function (e) {
        var c2 = getConsent();
        if (!c2.analytics && !c2.profiling) return;
        var t = e.target.closest('a, button, [data-track], .focus-girone-btn, .pf-chip-btn, .garofalo-nav-item');
        if (!t) return;
        var label =
          t.getAttribute('data-track') ||
          t.getAttribute('aria-label') ||
          (t.textContent || '').trim().slice(0, 60) ||
          t.id ||
          t.className;
        if (c2.analytics) {
          pushEvent('click', {
            tag: t.tagName,
            id: t.id || '',
            label: label,
            href: t.getAttribute('href') || ''
          });
        }
        if (c2.profiling) {
          var href = (t.getAttribute('href') || '').replace(/^#/, '');
          if (href) updateProfile('section', href);
          // focus / campionati heuristics
          var txt = (t.textContent || '').toLowerCase();
          if (/serie d|eccellenza|promozione|under|prima cat|seconda cat|terza cat|femminile|svincolati/.test(txt)) {
            var cat = (txt.match(/serie d|eccellenza|promozione|under 19|prima cat|seconda cat|terza cat|femminile|svincolati/) || [])[0];
            updateProfile('category', cat);
          }
          if (/puglia|lazio|lombardia|campania|sicilia|toscana|veneto|piemonte|emilia|calabria|sardegna|liguria|marche|umbria|abruzzo|basilicata|molise|friuli|trentino|valle d/.test(txt)) {
            var reg = (txt.match(/puglia|lazio|lombardia|campania|sicilia|toscana|veneto|piemonte|emilia|calabria|sardegna|liguria|marche|umbria|abruzzo|basilicata|molise|friuli|trentino|valle d'aosta|valle d'aosta/) || [])[0];
            if (reg) updateProfile('region', reg);
          }
          if (/portiere|difensore|centrocampista|attaccante|allenatore|scout|agente/.test(txt)) {
            var role = (txt.match(/portiere|difensore|centrocampista|attaccante|allenatore|scout|agente/) || [])[0];
            updateProfile('role', role);
          }
        }
      },
      true
    );

    // search inputs
    document.addEventListener(
      'change',
      function (e) {
        var el = e.target;
        if (!el || !el.matches) return;
        if (!getConsent().profiling && !getConsent().analytics) return;
        if (
          el.matches(
            'input[type="search"], #leaderboard-search, .search-input, input[placeholder*="Cerca"], input[placeholder*="cerca"]'
          )
        ) {
          var q = el.value;
          if (getConsent().analytics) pushEvent('search', { q: q });
          if (getConsent().profiling) updateProfile('search', q);
        }
      },
      true
    );

    // form submits
    document.addEventListener(
      'submit',
      function (e) {
        if (!getConsent().analytics) return;
        var f = e.target;
        pushEvent('form_submit', {
          id: f.id || '',
          name: f.getAttribute('name') || ''
        });
      },
      true
    );

    // visibility / engagement
    document.addEventListener('visibilitychange', function () {
      if (!getConsent().analytics) return;
      pushEvent(document.hidden ? 'tab_hide' : 'tab_show', {});
    });
  }

  /* ------------------------------------------------------------------ */
  /* Admin / export helpers                                              */
  /* ------------------------------------------------------------------ */
  function getConsentLog() {
    return lsGet(CONSENT_LOG_KEY, []);
  }

  function getAnalyticsEvents() {
    return lsGet(ANALYTICS_KEY, []);
  }

  function getMarketing() {
    return lsGet(MARKETING_KEY, null);
  }

  function exportConsentCsv() {
    var rows = getConsentLog();
    var header = 'id,action,technical,analytics,profiling,marketing,source,ts,path\n';
    var body = rows
      .map(function (r) {
        return [
          r.id,
          r.action,
          r.technical,
          r.analytics,
          r.profiling,
          r.marketing,
          r.source,
          r.ts,
          '"' + String(r.path || '').replace(/"/g, '""') + '"'
        ].join(',');
      })
      .join('\n');
    return header + body;
  }

  function downloadConsentCsv() {
    var csv = exportConsentCsv();
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'elisee_consent_log_' + Date.now() + '.csv';
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 2000);
  }

  function summaryForAdmin() {
    var c = getConsent();
    var events = getAnalyticsEvents();
    var profile = getProfile();
    var log = getConsentLog();
    return {
      consent: c,
      eventsCount: events.length,
      lastEvents: events.slice(0, 10),
      profile: profile,
      consentLogCount: log.length,
      lastConsents: log.slice(0, 10),
      marketing: getMarketing(),
      cookies: document.cookie
    };
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  function clearNavProfileBoxes() {
    try {
      document.querySelectorAll('a.nav-link, a.brand-logo, a.site-brand, .portfolio-nav a, nav a').forEach(function (a) {
        if (a.style && (a.style.boxShadow || a.style.borderRadius)) {
          a.style.boxShadow = '';
          a.style.borderRadius = '';
        }
      });
    } catch (e) {}
  }

  function init() {
    // Rimuovi riquadri indesiderati su logo/nav da personalizzazioni precedenti
    clearNavProfileBoxes();

    // In ambiente app nativa / WebView mobile non mostrare banner o badge invasivi
    var isMobileApp = /EliseeScoutApp/i.test(navigator.userAgent) || window.__ELISEE_MOBILE_APP__;
    if (isMobileApp) {
      applyCookiesFromConsent(DEFAULT_CONSENT);
      hideBanner();
      return;
    }

    // migrate + apply technical cookies always
    var c = getConsent();
    if (hasDecision()) {
      applyCookiesFromConsent(c);
      startEngines();
      applyPersonalization();
      hideBanner();
      // Dopo il toast, ripulisci di nuovo eventuali stili inline residui
      setTimeout(clearNavProfileBoxes, 2000);
    } else {
      // technical session only until decision
      applyCookiesFromConsent(DEFAULT_CONSENT);
      setTimeout(function () {
        restoreMainBanner();
        showBanner();
      }, 900);
    }

    // Il pulsante flottante con lo scudo a sinistra è stato rimosso per evitare interferenze visive con i testi e la hero section.
    // L'accesso alle preferenze cookie e privacy GDPR rimane disponibile nel footer del sito.
    var oldBtn = document.getElementById('elisee-cookie-settings-btn');
    if (oldBtn) oldBtn.remove();
  }

  function hideCookieBtnOverFooter(btn) {
    var footer = document.querySelector('footer.site-footer, footer.pf-footer, .site-footer');
    if (!btn || !footer) return;
    if (!('IntersectionObserver' in window)) {
      footer.style.paddingLeft = '4.5rem';
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var hit = entries.some(function (en) { return en.isIntersecting && en.intersectionRatio > 0.08; });
      btn.style.opacity = hit ? '0' : '1';
      btn.style.pointerEvents = hit ? 'none' : 'auto';
      btn.setAttribute('aria-hidden', hit ? 'true' : 'false');
    }, { threshold: [0, 0.08, 0.2] });
    io.observe(footer);
  }

  var API = {
    getConsent: getConsent,
    hasDecision: hasDecision,
    acceptAll: acceptAll,
    acceptTechnicalOnly: acceptTechnicalOnly,
    savePreferencesFromUI: savePreferencesFromUI,
    saveConsent: saveConsent,
    openPreferences: openPreferences,
    openCookieBanner: openCookieBanner,
    showPreferencesPanel: showPreferencesPanel,
    hideBanner: hideBanner,
    showBanner: showBanner,
    restoreMainBanner: restoreMainBanner,
    opposeProfiling: opposeProfiling,
    revokeAllOptional: revokeAllOptional,
    track: pushEvent,
    trackPageView: trackPageView,
    updateProfile: updateProfile,
    getProfile: getProfile,
    getConsentLog: getConsentLog,
    getAnalyticsEvents: getAnalyticsEvents,
    getMarketing: getMarketing,
    exportConsentCsv: exportConsentCsv,
    downloadConsentCsv: downloadConsentCsv,
    summaryForAdmin: summaryForAdmin,
    openCookiePolicy: openCookiePolicy,
    openPrivacyPolicy: openPrivacyPolicy,
    applyPersonalization: applyPersonalization,
    init: init,
    setCookie: setCookie,
    getCookie: getCookie
  };

  global.EliseeCookies = API;

  // Global aliases used by HTML onclick
  global.acceptCookiesAll = function () {
    acceptAll();
  };
  global.acceptCookiesOnly = function () {
    acceptTechnicalOnly();
  };
  global.acceptCookiesPartial = function () {
    showPreferencesPanel();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
