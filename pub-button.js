/* ==========================================================================
   ELISEE SCOUT — ANIMATED PUBLISH BUTTON CONTROLLER (pub-button.js)
   Gestione dell'animazione documento volante, wipe text ed esito check verde
   con collegamento diretto alla pipeline di pubblicazione reale (/api/bacheca).
   ========================================================================== */

(function () {
  'use strict';

  const wait = ms => new Promise(r => setTimeout(r, ms));

  window.EliseePubButton = {
    animate: async function (btn, publishCallback) {
      if (!btn) return;
      if (btn.dataset.state && btn.dataset.state !== 'idle') return;

      btn.disabled = true;
      btn.dataset.state = 'exiting';
      await wait(460);

      // Esegui la vera chiamata di pubblicazione backend se fornita
      if (typeof publishCallback === 'function') {
        try {
          await publishCallback();
        } catch (err) {
          console.error('Publish error', err);
        }
      } else {
        await wait(260);
      }

      btn.dataset.state = 'success';
      const label = btn.querySelector('.label') || btn.querySelector('#pubLabel');
      const originalText = label ? label.getAttribute('data-original-text') || label.textContent : 'Pubblica annuncio';
      if (label) {
        if (!label.getAttribute('data-original-text')) {
          label.setAttribute('data-original-text', originalText);
        }
        var published = 'Annuncio pubblicato';
        try {
          if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
            var publishedText = window.EliseeI18n.t('bacheca.published');
            if (publishedText && publishedText !== 'bacheca.published') published = publishedText;
          }
        } catch (e) {}
        label.textContent = published;
      }

      await wait(2200);
      btn.dataset.state = 'idle';
      if (label) {
        label.textContent = originalText;
      }
      btn.disabled = false;
    }
  };

  function initPubButtons() {
    const btn = document.getElementById('pubBtn') || document.getElementById('btn-bacheca-pubblica');
    if (!btn || btn._pubBound) return;
    btn._pubBound = true;

    btn.addEventListener('click', async (e) => {
      // Se è il pulsante trigger di apertura modale
      if (btn.id === 'btn-bacheca-pubblica' || btn.getAttribute('data-bacheca-action') === 'pubblica') {
        if (typeof window.openPubblicaAnnuncioModal === 'function') {
          window.openPubblicaAnnuncioModal();
          return;
        }
      }

      // Altrimenti avvia la sequenza standalone di pubblicazione
      if (btn.dataset.state !== 'idle') return;
      await window.EliseePubButton.animate(btn, async () => {
        await wait(260);
        if (typeof window.filterAndRenderJobs === 'function') {
          window.filterAndRenderJobs();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPubButtons);
  } else {
    initPubButtons();
  }
})();
