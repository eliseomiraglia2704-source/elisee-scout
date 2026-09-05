/**
 * ELISEE WORLD — Sprite (sez. 6 architettura)
 * Gestisce il ritaglio da spritesheet/atlas e il rendering su canvas.
 */
(function (global) {
  'use strict';

  class Sprite {
    constructor(image, frameWidth, frameHeight) {
      this.image = image || null;
      this.frameWidth = frameWidth || 32;
      this.frameHeight = frameHeight || 32;
    }

    draw(ctx, sx, sy, dx, dy, dw, dh) {
      if (!this.image) return;
      ctx.drawImage(
        this.image,
        sx, sy, this.frameWidth, this.frameHeight,
        dx, dy, dw || this.frameWidth, dh || this.frameHeight
      );
    }
  }

  global.EliseeSprite = Sprite;
})(typeof window !== 'undefined' ? window : this);
