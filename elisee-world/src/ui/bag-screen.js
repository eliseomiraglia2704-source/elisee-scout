/**
 * ELISEE WORLD — Bag Screen (sez. 7 e 10 design doc)
 * Schermata Borsone per gestione oggetti, contratti e consumabili.
 */
(function (global) {
  'use strict';

  class BagScreen {
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

  global.EliseeBagScreen = BagScreen;
})(typeof window !== 'undefined' ? window : this);
