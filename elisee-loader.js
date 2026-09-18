/**
 * ELISEE SCOUT — GLOBAL TRANSITION & MACROAREA LOADER
 * Riproduce fedelmente la modalità a punti luminosi con onda glow
 * Palette ufficiale: Deep Dark (#050608) & Cyan Neon (#38bdf8)
 */
(function () {
  'use strict';

  var TOTAL_DOTS = 24;
  var MIN_SIZE = 4.5;
  var MAX_SIZE = 11.5;
  var _activeTimer = null;
  var _safetyTimer = null;
  var _isShowing = false;

  function createLoaderDOM() {
    var existing = document.getElementById('elisee-global-loader');
    if (existing) return existing;

    var container = document.createElement('div');
    container.id = 'elisee-global-loader';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-hidden', 'true');

    var box = document.createElement('div');
    box.className = 'es-loader-box';

    var title = document.createElement('div');
    title.className = 'es-loader-title';
    title.textContent = 'L O A D I N G . . .';

    var sub = document.createElement('div');
    sub.className = 'es-loader-sub';
    sub.id = 'es-loader-sub-label';
    sub.textContent = '';

    var track = document.createElement('div');
    track.className = 'es-loader-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', 'Caricamento area');

    for (var i = 0; i < TOTAL_DOTS; i++) {
      var dot = document.createElement('span');
      dot.className = 'es-loader-dot';
      // Dimensione progressiva da sinistra verso destra come nella foto
      var ratio = i / (TOTAL_DOTS - 1);
      var size = MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE);
      dot.style.setProperty('--dot-i', i.toString());
      dot.style.width = size.toFixed(1) + 'px';
      dot.style.height = size.toFixed(1) + 'px';
      track.appendChild(dot);
    }

    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(track);
    container.appendChild(box);

    document.body.appendChild(container);
    return container;
  }

  function show(label, minDuration) {
    var loader = createLoaderDOM();
    if (!loader) return;

    if (_activeTimer) {
      clearTimeout(_activeTimer);
      _activeTimer = null;
    }
    if (_safetyTimer) {
      clearTimeout(_safetyTimer);
      _safetyTimer = null;
    }

    var subEl = document.getElementById('es-loader-sub-label');
    if (subEl) {
      if (label && typeof label === 'string' && label.trim().length > 0) {
        subEl.textContent = label.trim();
        subEl.style.display = 'block';
        subEl.style.opacity = '1';
      } else {
        subEl.textContent = '';
        subEl.style.display = 'none';
      }
    }

    loader.classList.add('is-active');
    loader.setAttribute('aria-hidden', 'false');
    _isShowing = true;

    // Timeout di sicurezza: non deve mai rimanere bloccato a schermo più di 3.5s
    _safetyTimer = setTimeout(function () {
      hide();
    }, 3500);

    if (typeof minDuration === 'number' && minDuration > 0) {
      _activeTimer = setTimeout(function () {
        hide();
      }, minDuration);
    }
  }

  function hide(callback) {
    var loader = document.getElementById('elisee-global-loader');
    if (!loader || !_isShowing) {
      if (typeof callback === 'function') callback();
      return;
    }

    if (_activeTimer) {
      clearTimeout(_activeTimer);
      _activeTimer = null;
    }
    if (_safetyTimer) {
      clearTimeout(_safetyTimer);
      _safetyTimer = null;
    }

    loader.classList.remove('is-active');
    loader.setAttribute('aria-hidden', 'true');
    _isShowing = false;

    setTimeout(function () {
      if (!_isShowing) {
        var subEl = document.getElementById('es-loader-sub-label');
        if (subEl) subEl.textContent = '';
      }
      if (typeof callback === 'function') callback();
    }, 280);
  }

  function pulse(ms, label) {
    var duration = typeof ms === 'number' && ms > 0 ? ms : 420;
    show(label, duration);
  }

  function wrap(asyncPromiseOrFn, label) {
    show(label);
    if (typeof asyncPromiseOrFn === 'function') {
      try {
        var res = asyncPromiseOrFn();
        if (res && typeof res.then === 'function') {
          return res.finally(function () { hide(); });
        } else {
          setTimeout(hide, 320);
          return Promise.resolve(res);
        }
      } catch (err) {
        hide();
        throw err;
      }
    } else if (asyncPromiseOrFn && typeof asyncPromiseOrFn.then === 'function') {
      return asyncPromiseOrFn.finally(function () { hide(); });
    } else {
      setTimeout(hide, 320);
      return Promise.resolve(asyncPromiseOrFn);
    }
  }

  // Mappatura nomi leggibili per le macroaree del sito
  var AREA_LABELS = {
    'home': 'Home Portfolio',
    'about': 'Chi Siamo & Governance',
    'bacheca': 'Bacheca Annunci & Network',
    'stampa': 'Stampa & Informazione',
    'mappa': 'Mappa Club & Territorio',
    'seguo': 'Album & Preferiti',
    'ambassador': 'Ambassador Program',
    'minigioco': 'Minigiochi Elisee',
    'admin': 'Control Center',
    'account': 'Area Riservata & Accesso',
    'user-dossier': 'Dossier Ruolo Staff / Atleta',
    'tc': 'Pannello Elisee Manager',
    'mercato': 'Hub Mercato B2B',
    'schede': 'Schede Tecniche Scouting',
    'scopri': 'Scopri Profili & Community'
  };

  function getAreaTitle(viewType, hash) {
    var key = (viewType || '').toLowerCase();
    if (AREA_LABELS[key]) return AREA_LABELS[key];
    if (hash) {
      var h = hash.replace(/^#/, '').toLowerCase();
      if (AREA_LABELS[h]) return AREA_LABELS[h];
      if (h.includes('admin')) return 'Control Center';
      if (h.includes('mercato')) return 'Hub Mercato B2B';
      if (h.includes('schede')) return 'Schede Tecniche Scouting';
      if (h.includes('dossier')) return 'Dossier Analitico';
      if (h.includes('tc')) return 'Elisee Manager';
    }
    return 'Area Elisee Scout';
  }

  // Intercetta switchView per fornire transizioni fluide tra macroaree
  function initAutoSwitchHook() {
    if (!window.switchView) return;
    var rawSwitch = window.switchView;
    if (rawSwitch._esLoaderHooked) return;

    var wrappedSwitch = function (viewType, targetHash, opts) {
      try {
        var title = getAreaTitle(viewType, targetHash);
        // Mostra il loader progressivo con una durata minima calibrata (360ms) che copre la transizione
        show(title, 380);
      } catch (_) {}
      return rawSwitch.apply(this, arguments);
    };

    wrappedSwitch._esLoaderHooked = true;
    window.switchView = wrappedSwitch;
  }

  // Esporta API pubblica
  window.EliseeLoader = {
    show: show,
    hide: hide,
    pulse: pulse,
    wrap: wrap,
    getAreaTitle: getAreaTitle
  };

  // Inizializza al caricamento del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      createLoaderDOM();
      initAutoSwitchHook();
    });
  } else {
    createLoaderDOM();
    initAutoSwitchHook();
  }

  // Re-hook periodico qualora switchView venga riassegnata
  setTimeout(initAutoSwitchHook, 800);
  setTimeout(initAutoSwitchHook, 2000);
})();
