/**
 * ELISEE WORLD — Save Manager (sez. 11 architettura + sez. 15 design doc)
 * Gestisce salvataggio e caricamento dello stato in localStorage['elisee_world_save'].
 */
(function (global) {
  'use strict';

  const SAVE_KEY = 'elisee_world_save';

  class SaveManager {
    static save(state) {
      try {
        if (!state) return false;
        const payload = JSON.stringify({
          version: 1,
          updatedAt: new Date().toISOString(),
          data: state
        });
        localStorage.setItem(SAVE_KEY, payload);
        return true;
      } catch (err) {
        console.warn('[SaveManager] Errore salvataggio:', err);
        return false;
      }
    }

    static load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && parsed.data ? parsed.data : parsed;
      } catch (err) {
        console.warn('[SaveManager] Errore lettura salvataggio:', err);
        return null;
      }
    }

    static hasSave() {
      try {
        return !!localStorage.getItem(SAVE_KEY);
      } catch (e) {
        return false;
      }
    }

    static wipe() {
      try {
        localStorage.removeItem(SAVE_KEY);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  global.EliseeSaveManager = SaveManager;
})(typeof window !== 'undefined' ? window : this);
