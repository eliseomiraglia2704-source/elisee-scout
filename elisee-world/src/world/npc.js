/**
 * ELISEE WORLD — NPC
 * Sprite allenatore 16-bit + dialoghi / battaglia.
 */
(function (global) {
  'use strict';

  class NPC extends (global.EliseeEntity || class {}) {
    constructor(x, y, name, dialogue, spriteId) {
      super(x, y, 32, 44);
      this.name = name || 'Mister';
      this.dialogue = dialogue || ['Benvenuto in Elisee World!'];
      this.spriteId = spriteId || null;
      this.startsBattle = false;
      this.enemyParty = null;
      this.trainerName = null;
    }

    interact(textbox) {
      if (textbox && typeof textbox.show === 'function') {
        textbox.show(this.dialogue);
      }
    }

    render(ctx) {
      const px = Math.floor(this.x);
      const py = Math.floor(this.y);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 42, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 10, py + 32, 5, 10);
      ctx.fillRect(px + 17, py + 32, 5, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 9, py + 40, 7, 3);
      ctx.fillRect(px + 16, py + 40, 7, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 8, py + 24, 16, 10);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px + 7, py + 12, 18, 14);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(px + 14, py + 12, 4, 3);

      ctx.fillStyle = '#f1c7a8';
      ctx.fillRect(px + 10, py + 3, 12, 10);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 9, py + 1, 14, 5);
      ctx.fillStyle = '#111';
      ctx.fillRect(px + 12, py + 7, 2, 2);
      ctx.fillRect(px + 18, py + 7, 2, 2);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', px + 16, py - 2);
      ctx.restore();
    }
  }

  global.EliseeNPC = NPC;
})(typeof window !== 'undefined' ? window : this);
