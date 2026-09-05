/**
 * ELISEE WORLD — Player Entity (sez. 1 master prompt)
 * Sprite proporzioni umane 32x48px (non quadrato con cappellino),
 * con 2 pose animate (fermo vs cammino con passo alternato) per direzione.
 */
(function (global) {
  'use strict';

  class Player extends (global.EliseeEntity || class {}) {
    constructor(x, y) {
      super(x, y, 32, 44);
      this.speed = 130; // pixel al secondo
      this.direction = 'down'; // 'down', 'up', 'left', 'right'
      this.isMoving = false;
      this.walkTimer = 0;
      this.walkFrame = 0; // 0 = posa neutra, 1 = passo
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
        // Ciclo animazione cammino a 2 frame
        this.walkTimer += dt;
        if (this.walkTimer > 160) {
          this.walkFrame = (this.walkFrame + 1) % 2;
          this.walkTimer = 0;
        }

        // Normalizza diagonali
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        const moveDist = this.speed * (dt / 1000);
        const nextX = this.x + dx * moveDist;
        const nextY = this.y + dy * moveDist;

        // Collision box ai piedi dell'atleta (per permettere alla testa di sovrapporsi leggermente agli ostacoli sopra)
        const footBox = {
          w: 24,
          h: 16,
          offsetX: 4,
          offsetY: 28
        };

        if (!tilemap || !tilemap.isSolid(nextX + footBox.offsetX, this.y + footBox.offsetY, footBox.w, footBox.h)) {
          this.x = nextX;
        }
        if (!tilemap || !tilemap.isSolid(this.x + footBox.offsetX, nextY + footBox.offsetY, footBox.w, footBox.h)) {
          this.y = nextY;
        }
      } else {
        this.walkFrame = 0;
        this.walkTimer = 0;
      }
    }

    render(ctx) {
      ctx.save();

      const px = Math.floor(this.x);
      const py = Math.floor(this.y);
      const isStep = this.isMoving && this.walkFrame === 1;

      // 1. Ombra ai piedi
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 42, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sprite Calciatore Proporzioni Umane (32x48px)
      if (this.direction === 'down') {
        // Vista Frontale (verso la telecamera)
        // Gambe / Calzettoni & Scarpini
        ctx.fillStyle = '#f87171'; // Pelle gambe
        const legLeftY = isStep ? py + 34 : py + 35;
        const legRightY = isStep ? py + 36 : py + 35;
        ctx.fillRect(px + 8, legLeftY, 5, 6);
        ctx.fillRect(px + 19, legRightY, 5, 6);

        // Calzettoni azzurri & Scarpini neri
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px + 8, legLeftY + 3, 5, 4);
        ctx.fillRect(px + 19, legRightY + 3, 5, 4);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 7, legLeftY + 6, 7, 3);
        ctx.fillRect(px + 18, legRightY + 6, 7, 3);

        // Pantaloncini bianchi
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 7, py + 26, 18, 9);

        // Maglia Azzurra
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px + 6, py + 14, 20, 13);
        ctx.fillStyle = '#38bdf8'; // Dettagli spalle
        ctx.fillRect(px + 4, py + 14, 3, 10);
        ctx.fillRect(px + 25, py + 14, 3, 10);

        // Colletto oro
        ctx.fillStyle = '#facc15';
        ctx.fillRect(px + 14, py + 14, 4, 3);

        // Testa / Viso
        ctx.fillStyle = '#fca5a5'; // Viso
        ctx.fillRect(px + 9, py + 4, 14, 11);

        // Occhi
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 11, py + 8, 2, 2);
        ctx.fillRect(px + 19, py + 8, 2, 2);

        // Capelli / Ciuffo scuro
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 8, py + 1, 16, 5);
        ctx.fillRect(px + 7, py + 3, 3, 5);
        ctx.fillRect(px + 22, py + 3, 3, 5);
      } else if (this.direction === 'up') {
        // Vista da dietro (Nuca, Numero 10 oro sul retro)
        // Gambe
        ctx.fillStyle = '#0284c7'; // Calzettoni
        const legLeftY = isStep ? py + 35 : py + 34;
        const legRightY = isStep ? py + 33 : py + 35;
        ctx.fillRect(px + 8, legLeftY, 5, 7);
        ctx.fillRect(px + 19, legRightY, 5, 7);
        ctx.fillStyle = '#0f172a'; // Scarpini
        ctx.fillRect(px + 7, legLeftY + 6, 7, 3);
        ctx.fillRect(px + 18, legRightY + 6, 7, 3);

        // Pantaloncini
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 7, py + 26, 18, 9);

        // Maglia Azzurra col Numero 10 oro
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px + 6, py + 14, 20, 13);
        ctx.fillStyle = '#facc15'; // Numero 10
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('10', px + 16, py + 23);

        // Nuca / Capelli
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 8, py + 1, 16, 13);
      } else {
        // Vista Laterale (left o right)
        const flip = this.direction === 'left';
        ctx.save();
        if (flip) {
          ctx.translate(px + 32, py);
          ctx.scale(-1, 1);
        } else {
          ctx.translate(px, py);
        }

        // Gamba posteriore e anteriore con passo
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(isStep ? 6 : 10, 34, 5, 7);
        ctx.fillRect(isStep ? 16 : 14, 34, 5, 7);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(isStep ? 5 : 9, 40, 7, 3);
        ctx.fillRect(isStep ? 16 : 14, 40, 7, 3);

        // Pantaloncini
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 26, 14, 9);

        // Corpo / Maglia
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(7, 14, 16, 13);
        ctx.fillStyle = '#38bdf8'; // Braccio
        ctx.fillRect(isStep ? 14 : 11, 16, 4, 9);

        // Viso laterale
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(10, 4, 12, 11);
        ctx.fillStyle = '#0f172a'; // Occhio
        ctx.fillRect(18, 8, 2, 2);

        // Capelli
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 1, 14, 5);
        ctx.fillRect(7, 3, 4, 7);

        ctx.restore();
      }

      ctx.restore();
    }
  }

  global.EliseePlayer = Player;
})(typeof window !== 'undefined' ? window : this);
