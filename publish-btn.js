/**
 * ELISEE SCOUT — UNIVERSAL NIMBUS PUBLISH BUTTON
 * Gestisce l'animazione:
 *   [Idle: Nuvola + Freccia] -> [Loading: Nuvola Rotante] -> [Done: Check animato SVG]
 */
(function () {
  'use strict';

  var NIMBUS_SVG_HTML =
    '<svg class="nimbus-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<g class="nimbus-cloud">' +
        '<circle cx="12" cy="11.3" r="7"/>' +
        '<circle cx="6.3" cy="15" r="5.5"/>' +
        '<circle cx="17.7" cy="15" r="5.5"/>' +
        '<rect x="6.3" y="9" width="11.4" height="11.5" rx="2.6"/>' +
      '</g>' +
      '<path class="nimbus-arrow" d="M12 19 12 11 M8 14.8 12 11 16 14.8"/>' +
      '<path class="nimbus-check" d="M7 12.6 10.4 16.6 17 8"/>' +
    '</svg>';

  /**
   * Trasforma un bottone in un Nimbus Publish Button interattivo.
   * @param {HTMLElement|string} target - Elemento o selettore CSS
   * @param {Function} asyncPublishFn - Funzione asincrona o callback di pubblicazione
   * @param {Object} options - { idleText, loadingText, doneText, resetDelay }
   */
  function bindPublishButton(target, asyncPublishFn, options) {
    var btn = typeof target === 'string' ? document.querySelector(target) : target;
    if (!btn || btn.dataset.nimbusBound === 'true') return btn;
    btn.dataset.nimbusBound = 'true';

    options = options || {};
    var initialText = (btn.textContent || '').trim() || 'Pubblica';
    var idleText = options.idleText || btn.getAttribute('data-idle-text') || initialText;
    var loadingText = options.loadingText || btn.getAttribute('data-loading-text') || 'Pubblicazione...';
    var doneText = options.doneText || btn.getAttribute('data-done-text') || 'Pubblicato!';
    var resetDelay = options.resetDelay || 2000;

    // Se non ha già la classe publish-btn, la aggiungiamo
    if (!btn.classList.contains('publish-btn')) {
      btn.classList.add('publish-btn');
    }

    // Strutturiamo il contenuto interno con SVG e label se assenti
    var existingLabel = btn.querySelector('.publish-label');
    var existingSvg = btn.querySelector('.nimbus-icon');

    if (!existingSvg || !existingLabel) {
      btn.innerHTML = NIMBUS_SVG_HTML + '<span class="publish-label">' + idleText + '</span>';
    }

    var label = btn.querySelector('.publish-label');
    btn.dataset.state = 'idle';

    btn.addEventListener('click', async function (e) {
      if (btn.dataset.state !== 'idle') return;

      btn.dataset.state = 'loading';
      if (label) label.textContent = loadingText;
      btn.disabled = true;

      try {
        if (typeof asyncPublishFn === 'function') {
          await asyncPublishFn(e, btn);
        } else {
          // Delay di default
          await new Promise(function (resolve) { setTimeout(resolve, 1400); });
        }

        btn.dataset.state = 'done';
        if (label) label.textContent = doneText;

        setTimeout(function () {
          btn.dataset.state = 'idle';
          if (label) label.textContent = idleText;
          btn.disabled = false;
        }, resetDelay);
      } catch (err) {
        console.error('[NimbusPublish] Errore pubblicazione:', err);
        btn.dataset.state = 'idle';
        if (label) label.textContent = idleText;
        btn.disabled = false;
      }
    });

    return btn;
  }

  /**
   * Scansiona e inizializza tutti i bottoni con classe .publish-btn
   */
  function initAllPublishButtons() {
    var buttons = document.querySelectorAll('.publish-btn:not([data-nimbus-bound="true"])');
    buttons.forEach(function (btn) {
      bindPublishButton(btn, null);
    });

    // Aggancio specifico per Candidature Club Pro (#submit-offriamo, #submit-richiediamo)
    var btnOff = document.getElementById('submit-offriamo');
    if (btnOff && !btnOff.dataset.nimbusBound) {
      bindPublishButton(btnOff, async function (e) {
        if (window.EliseeCandidaturePro && typeof window.EliseeCandidaturePro.submitOffriamo === 'function') {
          window.EliseeCandidaturePro.submitOffriamo(e);
        }
        await new Promise(function (r) { setTimeout(r, 1200); });
      }, {
        idleText: 'Invia Offerta',
        loadingText: 'Matching IA...',
        doneText: 'Offerta Inviata!'
      });
    }

    var btnReq = document.getElementById('submit-richiediamo');
    if (btnReq && !btnReq.dataset.nimbusBound) {
      bindPublishButton(btnReq, async function (e) {
        if (window.EliseeCandidaturePro && typeof window.EliseeCandidaturePro.submitRichiediamo === 'function') {
          window.EliseeCandidaturePro.submitRichiediamo(e);
        }
        await new Promise(function (r) { setTimeout(r, 1200); });
      }, {
        idleText: 'Invia Richiesta',
        loadingText: 'Matching IA...',
        doneText: 'Richiesta Inviata!'
      });
    }

    // Aggancio per Bacheca Annunci (se presente bottone pubblicazione)
    var btnAnnuncio = document.getElementById('btn-submit-annuncio') || document.querySelector('.btn-pubblica-annuncio');
    if (btnAnnuncio && !btnAnnuncio.dataset.nimbusBound) {
      bindPublishButton(btnAnnuncio, async function (e) {
        await new Promise(function (r) { setTimeout(r, 1400); });
        if (window.EliseeSuccessSystem) {
          window.EliseeSuccessSystem.showToast('Annuncio pubblicato con successo in Bacheca LND!', 2500);
        }
      }, {
        idleText: 'Pubblica Annuncio',
        loadingText: 'Pubblicazione in corso...',
        doneText: 'Annuncio Online!'
      });
    }

    // Aggancio per Area Stampa / Ufficio Stampa (se presente bottone pubblicazione articolo)
    var btnStampa = document.getElementById('btn-submit-articolo') || document.querySelector('.btn-pubblica-articolo');
    if (btnStampa && !btnStampa.dataset.nimbusBound) {
      bindPublishButton(btnStampa, async function (e) {
        await new Promise(function (r) { setTimeout(r, 1300); });
        if (window.EliseeSuccessSystem) {
          window.EliseeSuccessSystem.showToast('Articolo inviato alla redazione per approvazione!', 2500);
        }
      }, {
        idleText: 'Pubblica Articolo',
        loadingText: 'Invio redazione...',
        doneText: 'Articolo Inviato!'
      });
    }
  }

  // Registrazione API globale su window
  window.EliseePublishButton = {
    bind: bindPublishButton,
    initAll: initAllPublishButtons,
    NIMBUS_SVG_HTML: NIMBUS_SVG_HTML
  };

  // Alias globale facile
  window.bindPublishButton = bindPublishButton;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPublishButtons);
  } else {
    initAllPublishButtons();
  }
})();
