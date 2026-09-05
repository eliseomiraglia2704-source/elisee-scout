/**
 * ELISEE WORLD — Main Entry Point (sez. 1 architettura)
 * Istanzia il motore di gioco, gestisce il bootstrap e avvia il game loop.
 */
(function (global) {
  'use strict';

  let engineInstance = null;

  function initEliseeWorld(canvasId = 'elisee-world-canvas') {
    if (engineInstance) {
      engineInstance.stop();
      engineInstance = null;
    }

    try {
      engineInstance = new global.EliseeEngine(canvasId);
      engineInstance.start();
      console.log('[EliseeWorld] Motore avviato con successo (Fixed Timestep 60 FPS).');
      return engineInstance;
    } catch (err) {
      console.error('[EliseeWorld] Errore inizializzazione motore:', err);
      return null;
    }
  }

  function getEngine() {
    return engineInstance;
  }

  global.EliseeWorld = {
    init: initEliseeWorld,
    getEngine: getEngine
  };
})(typeof window !== 'undefined' ? window : this);
