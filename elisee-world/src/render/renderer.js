/**
 * ELISEE WORLD — Renderer (sez. 4 architettura)
 * Disegna a strati (Background, Tile, Entity y-sorted, UI, Overlay).
 */
(function (global) {
  'use strict';

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;
      this.camera = null;
      this.overlayAlpha = 0;
      this.overlayColor = '#000000';
    }

    setCamera(camera) {
      this.camera = camera;
    }

    clear() {
      this.ctx.fillStyle = '#050a12';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Modalità Mondo (applica traslazione camera per i layer 1-3)
    beginWorld() {
      this.ctx.save();
      if (this.camera) {
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));
      }
    }

    endWorld() {
      this.ctx.restore();
    }

    // Disegno entità ordinate per Y
    drawEntitiesSorted(entities) {
      if (!entities || !entities.length) return;
      const sorted = [...entities].sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const e of sorted) {
        if (typeof e.render === 'function') {
          e.render(this.ctx);
        }
      }
    }

    // Overlay globale per transizioni fade
    setFade(alpha, color = '#000000') {
      this.overlayAlpha = Math.max(0, Math.min(1, alpha));
      this.overlayColor = color;
    }

    drawOverlay() {
      if (this.overlayAlpha > 0.001) {
        this.ctx.save();
        this.ctx.globalAlpha = this.overlayAlpha;
        this.ctx.fillStyle = this.overlayColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      }
    }
  }

  global.EliseeRenderer = Renderer;
})(typeof window !== 'undefined' ? window : this);
