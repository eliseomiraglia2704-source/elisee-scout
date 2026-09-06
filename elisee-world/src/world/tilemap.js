/**
 * ELISEE WORLD — Tilemap & Overworld Scenery (sez. 1 master prompt)
 * Texture erba campestre procedurale pixel-art con variazione (non scacchiera),
 * elementi di scena (alberi a strati, staccionate di legno, siepi di campo).
 */
(function (global) {
  'use strict';

  class Tilemap {
    constructor(data) {
      this.tileSize = (data && data.tileSize) || 32;
      this.width = (data && data.width) || 24;
      this.height = (data && data.height) || 20;

      // Inizializza mappa di collisione
      this.collision = new Array(this.width * this.height).fill(0);

      // Elementi scenici posizionati
      this.scenery = [
        // Alberi a Nord (Y: 1-2)
        { type: 'tree', x: 2, y: 1 },
        { type: 'tree', x: 6, y: 1 },
        { type: 'tree', x: 17, y: 1 },
        { type: 'tree', x: 21, y: 1 },

        // Alberi a Sud (Y: 17-18)
        { type: 'tree', x: 3, y: 17 },
        { type: 'tree', x: 20, y: 17 },

        // Staccionate lungo i bordi ovest (X: 1, Y: 4-15) ed est (X: 22, Y: 4-15)
        { type: 'fence_v', x: 1, y: 4, len: 12 },
        { type: 'fence_v', x: 22, y: 4, len: 12 },

        // Siepi decorative vicino al campetto
        { type: 'hedge', x: 8, y: 3 },
        { type: 'hedge', x: 9, y: 3 },
        { type: 'hedge', x: 14, y: 3 },
        { type: 'hedge', x: 15, y: 3 },

        // Centro Elisee (ingresso shop)
        { type: 'building', x: 18, y: 7 }
      ];

      this.initCollision();
    }

    initCollision() {
      // Bordi perimetrali = solidi
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            this.collision[y * this.width + x] = 1;
          }
        }
      }

      // Collisioni elementi scenici
      for (const item of this.scenery) {
        if (item.type === 'tree') {
          // Tronco solido (2x2 tile base)
          this.setSolid(item.x, item.y, 2, 2);
        } else if (item.type === 'fence_v') {
          for (let i = 0; i < (item.len || 1); i++) {
            this.setSolid(item.x, item.y + i, 1, 1);
          }
        } else if (item.type === 'hedge') {
          this.setSolid(item.x, item.y, 1, 1);
        } else if (item.type === 'building') {
          this.setSolid(item.x, item.y, 3, 3);
        }
      }
    }

    setSolid(tx, ty, w = 1, h = 1) {
      for (let y = ty; y < ty + h; y++) {
        for (let x = tx; x < tx + w; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.collision[y * this.width + x] = 1;
          }
        }
      }
    }

    isSolid(x, y, w = 1, h = 1) {
      const minTileX = Math.floor(x / this.tileSize);
      const maxTileX = Math.floor((x + w - 1) / this.tileSize);
      const minTileY = Math.floor(y / this.tileSize);
      const maxTileY = Math.floor((y + h - 1) / this.tileSize);

      for (let ty = minTileY; ty <= maxTileY; ty++) {
        for (let tx = minTileX; tx <= maxTileX; tx++) {
          if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
            return true;
          }
          const idx = ty * this.width + tx;
          if (this.collision[idx] === 1) {
            return true;
          }
        }
      }
      return false;
    }

    // Disegno texture erba campestre naturale (nessuna scacchiera piatta)
    renderGround(ctx) {
      const ts = this.tileSize;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const px = x * ts;
          const py = y * ts;

          // Hash deterministico per variazione pixel-art su ogni tile
          const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

          // Tono base prato verde naturale
          if (hash < 0.35) {
            ctx.fillStyle = '#15803d'; // Verde erba principale
          } else if (hash < 0.70) {
            ctx.fillStyle = '#16a34a'; // Verde leggermente più acceso
          } else {
            ctx.fillStyle = '#166534'; // Verde ombra profondo
          }
          ctx.fillRect(px, py, ts, ts);

          // Ciuffi d'erba e micro-dettagli pixel-art
          if (hash > 0.4) {
            ctx.fillStyle = '#22c55e'; // Ciuffo chiaro
            ctx.fillRect(px + 6, py + 12, 2, 4);
            ctx.fillRect(px + 8, py + 10, 2, 6);
            ctx.fillRect(px + 10, py + 14, 2, 2);
          }
          if (hash < 0.25) {
            ctx.fillStyle = '#14532d'; // Dettaglio scuro terroso
            ctx.fillRect(px + 18, py + 20, 3, 2);
            ctx.fillRect(px + 20, py + 18, 2, 4);
          }
        }
      }

      // Linee bianche gesso del campetto da calcio al centro (area di gioco)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;

      const pitchX = 4 * ts;
      const pitchY = 4 * ts;
      const pitchW = 16 * ts;
      const pitchH = 12 * ts;

      // Rettangolo di gioco
      ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

      // Linea di metà campo
      ctx.beginPath();
      ctx.moveTo(pitchX, pitchY + pitchH / 2);
      ctx.lineTo(pitchX + pitchW, pitchY + pitchH / 2);
      ctx.stroke();

      // Cerchio di centrocampo
      ctx.beginPath();
      ctx.arc(pitchX + pitchW / 2, pitchY + pitchH / 2, ts * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Disegno elementi scenici (alberi, staccionate, siepi)
    renderScenery(ctx) {
      const ts = this.tileSize;

      for (const item of this.scenery) {
        const px = item.x * ts;
        const py = item.y * ts;

        if (item.type === 'tree') {
          // Albero 16-bit a strati (2x3 tile, chioma frondosa a cupola)
          const tx = px;
          const ty = py - ts; // Si estende verso l'alto

          // Ombra alla base
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(tx + ts, py + ts * 1.5, ts * 0.9, ts * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tronco in legno scuro
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx + ts * 0.75, py + ts * 0.8, ts * 0.5, ts * 1.0);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx + ts * 0.8, py + ts * 0.8, ts * 0.2, ts * 1.0);

          // Chioma a strati retro
          // Strato 1 (base scura)
          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.arc(tx + ts, ty + ts * 0.9, ts * 1.05, 0, Math.PI * 2);
          ctx.fill();

          // Strato 2 (medio)
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(tx + ts, ty + ts * 0.75, ts * 0.88, 0, Math.PI * 2);
          ctx.fill();

          // Strato 3 (luce alta)
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(tx + ts * 0.85, ty + ts * 0.55, ts * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'fence_v') {
          // Staccionata in legno verticale
          const len = item.len || 1;
          for (let i = 0; i < len; i++) {
            const fy = py + i * ts;

            // Palo verticale
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px + 12, fy + 4, 8, ts - 4);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px + 14, fy + 4, 4, ts - 4);

            // Trave orizzontale di collegamento
            ctx.fillStyle = '#92400e';
            ctx.fillRect(px + 6, fy + 10, ts - 12, 5);
            ctx.fillRect(px + 6, fy + 22, ts - 12, 5);
          }
        } else if (item.type === 'hedge') {
          // Siepe compatta
          ctx.fillStyle = '#14532d';
          ctx.fillRect(px + 2, py + 6, ts - 4, ts - 8);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(px + 4, py + 4, ts - 8, ts - 12);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(px + 6, py + 6, 4, 4);
          ctx.fillRect(px + 16, py + 8, 4, 4);
        } else if (item.type === 'building') {
          const bw = ts * 3;
          const bh = ts * 3;
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(px + 6, py + bh - 8, bw - 8, 10);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(px, py + 12, bw, bh - 12);
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.moveTo(px - 6, py + 16);
          ctx.lineTo(px + bw / 2, py - 10);
          ctx.lineTo(px + bw + 6, py + 16);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + ts + 8, py + bh - 36, 20, 28);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px + ts + 22, py + bh - 24, 3, 3);
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(px + 10, py + 28, 18, 14);
          ctx.fillRect(px + bw - 28, py + 28, 18, 14);
        }
      }
    }

    isNearBuilding(px, py) {
      const ts = this.tileSize;
      for (let i = 0; i < this.scenery.length; i++) {
        const item = this.scenery[i];
        if (item.type !== 'building') continue;
        const doorX = (item.x + 1.5) * ts;
        const doorY = (item.y + 3) * ts;
        const dx = px + 16 - doorX;
        const dy = py + 40 - doorY;
        if (dx * dx + dy * dy < 46 * 46) return true;
      }
      return false;
    }

    render(ctx) {
      ctx.save();
      this.renderGround(ctx);
      this.renderScenery(ctx);
      ctx.restore();
    }
  }

  global.EliseeTilemap = Tilemap;
})(typeof window !== 'undefined' ? window : this);
