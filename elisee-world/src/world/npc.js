/**
 * ELISEE WORLD — NPC Entity (sez. 5 architettura)
 * Estende EliseeEntity, gestisce interazioni e dialoghi.
 */
(function (global) {
  'use strict';

  class NPC extends (global.EliseeEntity || class {}) {
    constructor(x, y, name, dialogue, spriteId) {
      super(x, y, 32, 32);
      this.name = name || 'Mister';
      this.dialogue = dialogue || ['Benvenuto in Elisee World!'];
      this.spriteId = spriteId || null;
    }

    interact(textbox) {
      if (textbox && typeof textbox.show === 'function') {
        textbox.show(this.dialogue);
      }
    }

    render(ctx) {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(this.x + 4), Math.floor(this.y + 4), this.width - 8, 6);
      ctx.restore();
    }
  }

  global.EliseeNPC = NPC;
})(typeof window !== 'undefined' ? window : this);
