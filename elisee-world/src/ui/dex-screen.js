/**
 * ELISEE WORLD — Dex Screen (sez. 9 design doc)
 * Scheda informativa/scheda tecnica calciatore (INFO | AREA | FORMS).
 */
(function (global) {
  'use strict';

  class DexScreen {
    constructor(engine) {
      this.engine = engine;
      this.isOpen = false;
    }

    open() { this.isOpen = true; }
    close() { this.isOpen = false; }
    handleInput(input) {
      if (!this.isOpen || !input) return;
      if (input.wasJustPressed('B')) this.close();
    }
    render(ctx) {}
  }

  global.EliseeDexScreen = DexScreen;
})(typeof window !== 'undefined' ? window : this);
