/**
 * ELISEE WORLD — MAIN INTEGRATION ENTRY POINT
 * Inizializza il canvas, monta i controlli virtuali touch/desktop,
 * e connette Elisee World alla navigazione di Elisee Scout.
 */
(function (global) {
  'use strict';

  var engineInstance = null;
  var modalEl = null;

  function createModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.id = 'elisee-world-modal';
    modalEl.style.display = 'none';

    modalEl.innerHTML =
      '<div class="ew-container">' +
        '<div class="ew-header">' +
          '<div class="ew-title">⚽ ELISEE WORLD <span>FOOTBALL EDITION</span></div>' +
          '<button type="button" class="ew-close-btn" id="ew-modal-close" aria-label="Chiudi">&times;</button>' +
        '</div>' +
        '<div class="ew-canvas-wrapper">' +
          '<canvas id="elisee-world-canvas" width="576" height="440"></canvas>' +
        '</div>' +
        '<div class="ew-controls">' +
          '<div class="ew-dpad">' +
            '<button type="button" class="ew-dpad-btn ew-dpad-up" data-intent="UP">▲</button>' +
            '<button type="button" class="ew-dpad-btn ew-dpad-down" data-intent="DOWN">▼</button>' +
            '<button type="button" class="ew-dpad-btn ew-dpad-left" data-intent="LEFT">◀</button>' +
            '<button type="button" class="ew-dpad-btn ew-dpad-right" data-intent="RIGHT">▶</button>' +
          '</div>' +
          '<div class="ew-center-info">' +
            '<button type="button" class="ew-start-btn" data-intent="START">MENU / START</button>' +
          '</div>' +
          '<div class="ew-action-btns">' +
            '<button type="button" class="ew-action-btn ew-btn-b" data-intent="B">B</button>' +
            '<button type="button" class="ew-action-btn ew-btn-a" data-intent="A">A</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modalEl);

    // Close button
    var closeBtn = modalEl.querySelector('#ew-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        EliseeWorld.close();
      });
    }

    // Touch / Pointer controls binding
    var ctrlButtons = modalEl.querySelectorAll('[data-intent]');
    ctrlButtons.forEach(function (btn) {
      var intent = btn.getAttribute('data-intent');

      var startHandler = function (e) {
        e.preventDefault();
        if (engineInstance && engineInstance.input) {
          engineInstance.input.setTouchIntent(intent, true);
        }
      };
      var endHandler = function (e) {
        e.preventDefault();
        if (engineInstance && engineInstance.input) {
          engineInstance.input.setTouchIntent(intent, false);
        }
      };

      btn.addEventListener('pointerdown', startHandler);
      btn.addEventListener('pointerup', endHandler);
      btn.addEventListener('pointercancel', endHandler);
      btn.addEventListener('pointerleave', endHandler);
    });

    // Tap diretto sul canvas = intent A / START
    var canvasEl = modalEl.querySelector('#elisee-world-canvas');
    if (canvasEl) {
      canvasEl.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (engineInstance && engineInstance.input) {
          engineInstance.input.setTouchIntent('A', true);
          setTimeout(function () {
            if (engineInstance && engineInstance.input) {
              engineInstance.input.setTouchIntent('A', false);
            }
          }, 100);
        }
      });
    }

    // Close on ESC
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalEl && modalEl.style.display === 'flex') {
        EliseeWorld.close();
      }
    });

    return modalEl;
  }

  var EliseeWorld = {
    open: function () {
      var modal = createModal();
      modal.style.display = 'flex';
      document.documentElement.style.overflow = 'hidden';

      var canvas = document.getElementById('elisee-world-canvas');
      if (!engineInstance && canvas && global.EliseeEngine) {
        engineInstance = new global.EliseeEngine(canvas);
        engineInstance.start();
      } else if (engineInstance) {
        engineInstance.start();
      }
    },

    close: function () {
      if (modalEl) {
        modalEl.style.display = 'none';
      }
      document.documentElement.style.overflow = '';
      if (engineInstance) {
        engineInstance.stop();
      }
      if (window.location.hash === '#elisee-world') {
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#minigioco-carriera');
          }
        } catch (e) {}
      }
    },

    reset: function () {
      if (global.EliseeSaveManager) {
        global.EliseeSaveManager.clear();
      }
      if (engineInstance) {
        engineInstance.stateMachine.transition('TITLE');
      }
    }
  };

  // Espone EliseeWorld e mantiene fallback di compatibilità
  global.EliseeWorld = EliseeWorld;
  global.openEliseeWorld = EliseeWorld.open;

  // Auto-bind se hash è #elisee-world su load o hashchange
  function checkHash() {
    if (window.location.hash === '#elisee-world') {
      EliseeWorld.open();
    }
  }
  window.addEventListener('load', checkHash);
  window.addEventListener('hashchange', checkHash);

})(typeof window !== 'undefined' ? window : this);
