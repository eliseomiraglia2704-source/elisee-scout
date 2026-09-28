/**
 * Elisee Scout — Realistic Switch Skeuomorphic Theme Toggle
 * File: realistic-switch.js
 * Rispetta data-theme, localStorage['elisee_ui_theme'], prefers-color-scheme e i18n
 */

(function () {
  'use strict';

  function isLightTheme() {
    const rootTheme = document.documentElement.getAttribute('data-theme');
    if (rootTheme) {
      return rootTheme.indexOf('chiaro') !== -1 || rootTheme === 'light';
    }
    const saved = localStorage.getItem('elisee_ui_theme');
    if (saved) {
      return saved.indexOf('chiaro') !== -1 || saved === 'light';
    }
    return false;
  }

  function getLang() {
    return (document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
  }

  function updateSwitchVisual(btn, isLight) {
    if (!btn) return;
    btn.setAttribute('aria-checked', isLight ? 'true' : 'false');
    btn.classList.toggle('is-on', isLight);
    btn.classList.toggle('is-active', isLight);

    const lang = getLang();
    const label = isLight
      ? (lang === 'en' ? 'Switch to dark theme' : 'Passa al tema scuro')
      : (lang === 'en' ? 'Switch to light theme' : 'Passa al tema chiaro');

    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  function syncAllSwitches() {
    const light = isLightTheme();
    const switches = document.querySelectorAll('.realistic-switch');
    switches.forEach(function (sw) {
      updateSwitchVisual(sw, light);
    });
  }

  function handleSwitchTrigger(btn) {
    if (typeof window.toggleSiteTheme === 'function') {
      window.toggleSiteTheme();
    } else if (typeof window.toggleTheme === 'function') {
      window.toggleTheme();
    } else {
      // Fallback minimale se la funzione globale non è ancora pronta
      const current = document.documentElement.getAttribute('data-theme') || 'vault-neon';
      const next = (current.indexOf('chiaro') !== -1 || current === 'light') ? 'vault-neon' : 'mimetico-chiaro';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('elisee_ui_theme', next);
    }
    syncAllSwitches();
  }

  function initRealisticSwitch() {
    if (window.__realisticSwitchInitialized) {
      syncAllSwitches();
      return;
    }
    window.__realisticSwitchInitialized = true;

    syncAllSwitches();

    // Event delegation per pointerdown / pointerup / pointerleave (effetto pressione fisica)
    document.addEventListener('pointerdown', function (e) {
      const sw = e.target.closest('.realistic-switch');
      if (sw) {
        sw.classList.add('is-pressing');
      }
    });

    function releasePress(e) {
      const switches = document.querySelectorAll('.realistic-switch.is-pressing');
      switches.forEach(function (sw) {
        sw.classList.remove('is-pressing');
      });
    }

    document.addEventListener('pointerup', releasePress);
    document.addEventListener('pointercancel', releasePress);

    // Event delegation per click sul realistic-switch
    document.addEventListener('click', function (e) {
      const sw = e.target.closest('.realistic-switch');
      if (!sw) return;
      e.preventDefault();
      handleSwitchTrigger(sw);
    });

    // Supporto tastiera (Enter e Space sono standard su button, ma garantiamo feedback visivo)
    document.addEventListener('keydown', function (e) {
      const sw = e.target.closest('.realistic-switch');
      if (sw && (e.key === ' ' || e.key === 'Enter')) {
        sw.classList.add('is-pressing');
      }
    });

    document.addEventListener('keyup', function (e) {
      const sw = e.target.closest('.realistic-switch');
      if (sw && (e.key === ' ' || e.key === 'Enter')) {
        sw.classList.remove('is-pressing');
      }
    });

    // Observer su variazioni di attributo data-theme (scatenate da altrove)
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          syncAllSwitches();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Sincronizzazione multi-tab via storage event
    window.addEventListener('storage', function (e) {
      if (e.key === 'elisee_ui_theme') {
        const val = e.newValue || '';
        const isLight = val.indexOf('chiaro') !== -1 || val === 'light';
        document.documentElement.setAttribute('data-theme', val || 'vault-neon');
        syncAllSwitches();
      }
    });

    // Ascolto cambio lingua se presente evento personalizzato o reload i18n
    window.addEventListener('languageChanged', syncAllSwitches);
  }

  window.initRealisticSwitch = initRealisticSwitch;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealisticSwitch);
  } else {
    initRealisticSwitch();
  }
})();
