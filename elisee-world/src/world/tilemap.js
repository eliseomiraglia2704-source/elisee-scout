/**
 * ELISEE WORLD — Tilemap (sez. 5 architettura)
 * Griglia 2D di tile, collisioni O(1) e rendering dei layer.
 */
(function (global) {
  'use strict';

  class Tilemap {
    constructor(data) {
      this.tileSize = (data && data.tileSize) || 32;
      this.width = (data && data.width) || 20;
      this.height = (data && data.height) || 20;
      this.ground = (data && data.layers && data.layers.ground) || [];
      this.objects = (data && data.layers && data.layers.objects) || [];
      this.collision = (data && data.collision) || [];
    }

    isSolid(x, y, w = 1, h = 1) {
      const minTileX = Math.floor(x / this.tileSize);
      const maxTileX = Math.floor((x + w - 1) / this.tileSize);
      const minTileY = Math.floor(y / this.tileSize);
      const maxTileY = Math.floor((y + h - 1) / this.tileSize);

      for (let ty = minTileY; ty <= maxTileY; ty++) {
        for (let tx = minTileX; tx <= maxTileX; tx++) {
          if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
            return true; // Fuori mappa = solido
          }
          const idx = ty * this.width + tx;
          if (this.collision[idx] === 1) {
            return true;
          }
        }
      }
      return false;
    }

    render(ctx) {
      ctx.save();
      // Rendering placeholder griglia campo da calcio / città
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const isBorder = x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
          const isChecker = (x + y) % 2 === 0;

          if (isBorder) {
            ctx.fillStyle = '#1e293b';
          } else {
            ctx.fillStyle = isChecker ? '#15803d' : '#166534';
          }

          ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
      ctx.restore();
    }
  }

  global.EliseeTilemap = Tilemap;
})(typeof window !== 'undefined' ? window : this);
