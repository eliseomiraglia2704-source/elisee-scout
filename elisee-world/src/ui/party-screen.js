/**
 * ELISEE WORLD — Party Screen (sez. 2 design doc + sez. 1 architettura)
 * Schermata gestione squadra/party (griglia 2 colonne x 3 righe).
 */
(function (global) {
  'use strict';

  class PartyScreen {
    constructor(engine) {
      this.engine = engine;
      this.selectedIndex = 0;
      this.isOpen = false;
    }

    open() {
      this.isOpen = true;
      this.selectedIndex = 0;
    }

    close() {
      this.isOpen = false;
    }

    handleInput(input) {
      if (!this.isOpen || !input) return;
      if (input.wasJustPressed('B')) {
        this.close();
      }
    }

    render(ctx) {
      if (!this.isOpen) return;
      const w = this.engine.canvas.width;
      const h = this.engine.canvas.height;
      ctx.fillStyle = 'rgba(10, 14, 26, 0.95)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  global.EliseePartyScreen = PartyScreen;
})(typeof window !== 'undefined' ? window : this);
