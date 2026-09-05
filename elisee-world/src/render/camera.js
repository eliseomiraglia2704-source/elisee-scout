/**
 * ELISEE WORLD — Camera (sez. 4 architettura)
 * Viewport, follow-player, clamping ai bordi mappa.
 */
(function (global) {
  'use strict';

  class Camera {
    constructor(viewportWidth, viewportHeight) {
      this.vw = viewportWidth || 576;
      this.vh = viewportHeight || 1024;
      this.x = 0;
      this.y = 0;
      this.target = null;
    }

    follow(targetEntity) {
      this.target = targetEntity;
    }

    update(mapWidthPx, mapHeightPx) {
      if (this.target) {
        const tx = (this.target.x || 0) + (this.target.width || 32) / 2;
        const ty = (this.target.y || 0) + (this.target.height || 32) / 2;
        this.x = tx - this.vw / 2;
        this.y = ty - this.vh / 2;
      }

      // Clamping ai limiti del mondo/mappa
      if (mapWidthPx > this.vw) {
        this.x = Math.max(0, Math.min(this.x, mapWidthPx - this.vw));
      } else {
        this.x = (mapWidthPx - this.vw) / 2;
      }

      if (mapHeightPx > this.vh) {
        this.y = Math.max(0, Math.min(this.y, mapHeightPx - this.vh));
      } else {
        this.y = (mapHeightPx - this.vh) / 2;
      }
    }
  }

  global.EliseeCamera = Camera;
})(typeof window !== 'undefined' ? window : this);
