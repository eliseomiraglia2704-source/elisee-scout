/**
 * ELISEE WORLD — SAVE MANAGER
 * Serializzazione e deserializzazione locale in localStorage['elisee_world_save'].
 * Autosave post-battaglia / level-up / acquisto.
 */
(function (global) {
  'use strict';

  var SAVE_KEY = 'elisee_world_save';

  var SaveManager = {
    save: function (state) {
      try {
        var payload = JSON.stringify({
          version: '1.0',
          savedAt: Date.now(),
          player: state.player || {},
          party: state.party || [],
          bag: state.bag || [],
          dexSeen: state.dexSeen || [],
          dexCaught: state.dexCaught || [],
          progress: state.progress || {},
          settings: state.settings || {}
        });
        localStorage.setItem(SAVE_KEY, payload);
        return true;
      } catch (e) {
        console.error('[EliseeSaveManager] Errore salvataggio:', e);
        return false;
      }
    },

    load: function () {
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.error('[EliseeSaveManager] Errore caricamento:', e);
        return null;
      }
    },

    hasSave: function () {
      try {
        return !!localStorage.getItem(SAVE_KEY);
      } catch (_) {
        return false;
      }
    },

    clear: function () {
      try {
        localStorage.removeItem(SAVE_KEY);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  global.EliseeSaveManager = SaveManager;

})(typeof window !== 'undefined' ? window : this);
