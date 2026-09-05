/**
 * ELISEE WORLD — Command Menu (sez. 4 design doc)
 * Menu a 4 pulsanti (TATTICA, BORSONE, PANCHINA, RUN).
 */
(function (global) {
  'use strict';

  class CommandMenu {
    constructor(engine) {
      this.engine = engine;
      this.selectedIndex = 0;
    }

    render(ctx, x, y, width, height) {}
  }

  global.EliseeCommandMenu = CommandMenu;
})(typeof window !== 'undefined' ? window : this);
