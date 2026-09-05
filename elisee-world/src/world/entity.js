/**
 * ELISEE WORLD — Entity (sez. 5 architettura)
 * Classe base per entità nel mondo 2D (Player, NPC, oggetti).
 */
(function (global) {
  'use strict';

  class Entity {
    constructor(x, y, width = 32, height = 32) {
      this.x = x || 0;
      this.y = y || 0;
      this.width = width;
      this.height = height;
      this.sprite = null;
      this.animator = null;
      this.solid = true;
      this.direction = 'down'; // 'down', 'up', 'left', 'right'
    }

    update(dt) {
      if (this.animator) {
        this.animator.update(dt);
      }
    }

    render(ctx) {
      // Placeholder di rendering entità
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
      ctx.restore();
    }
  }

  global.EliseeEntity = Entity;
})(typeof window !== 'undefined' ? window : this);
