/**
 * ELISEE WORLD — Player Entity (sez. 5 architettura)
 * Estende EliseeEntity, gestisce input utente e movimento overworld.
 */
(function (global) {
  'use strict';

  class Player extends (global.EliseeEntity || class {}) {
    constructor(x, y) {
      super(x, y, 32, 32);
      this.speed = 120; // pixel al secondo
      this.isMoving = false;
    }

    handleInput(input, dt, tilemap) {
      if (!input) return;
      let dx = 0;
      let dy = 0;

      if (input.isDown('UP')) {
        dy -= 1;
        this.direction = 'up';
      } else if (input.isDown('DOWN')) {
        dy += 1;
        this.direction = 'down';
      }

      if (input.isDown('LEFT')) {
        dx -= 1;
        this.direction = 'left';
      } else if (input.isDown('RIGHT')) {
        dx += 1;
        this.direction = 'right';
      }

      this.isMoving = dx !== 0 || dy !== 0;

      if (this.isMoving) {
        // Normalizza diagonali
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        const moveDist = this.speed * (dt / 1000);
        const nextX = this.x + dx * moveDist;
        const nextY = this.y + dy * moveDist;

        // Collision check con tilemap
        if (!tilemap || !tilemap.isSolid(nextX, this.y, this.width, this.height)) {
          this.x = nextX;
        }
        if (!tilemap || !tilemap.isSolid(this.x, nextY, this.width, this.height)) {
          this.y = nextY;
        }
      }
    }

    render(ctx) {
      ctx.save();
      // Corpo sprite stilizzato retro
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(Math.floor(this.x + 4), Math.floor(this.y + 4), this.width - 8, 8);
      ctx.restore();
    }
  }

  global.EliseePlayer = Player;
})(typeof window !== 'undefined' ? window : this);
