/* ELISEE SCOUT — Integrazioni Runtime (Deprecato & Rimosso su richiesta: funzioni integrate nei rispettivi ruoli) */
(function() {
  'use strict';
  // Rimuovi eventuale root legacy
  var old = document.getElementById('es-int-root');
  if (old) old.remove();

  window.EliseeIntegrazioni = {
    open: function() { /* No-op: schermate rimosse */ },
    close: function() {
      var r = document.getElementById('es-int-root');
      if (r) r.remove();
    },
    isOpen: function() { return false; },
    openCareer: function() {
      if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
    },
    openMinigioco: function() {
      if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
    },
    closeMinigioco: function() {
      if (window.EliseeMinigioco && window.EliseeMinigioco.close) window.EliseeMinigioco.close();
    },
    submitAIFeedback: function() { return true; }
  };
})();
