/**
 * ELISEE WORLD — ENTITIES (PLAYER & NPCS)
 * Rendering procedurale pixel art retro per protagonista e personaggi overworld.
 */
(function (global) {
  'use strict';

  function Player(x, y) {
    this.x = x || 14 * 32;
    this.y = y || 11 * 32;
    this.width = 24;
    this.height = 28;
    this.speed = 2.4; // px per frame
    this.direction = 'DOWN'; // 'UP'|'DOWN'|'LEFT'|'RIGHT'
    this.isMoving = false;
    this.animTimer = 0;
    this.stepFrame = 0;
  }

  Player.prototype.update = function (dt, input, tilemap) {
    var moveX = 0;
    var moveY = 0;

    if (input.isDown('UP')) { moveY -= 1; this.direction = 'UP'; }
    else if (input.isDown('DOWN')) { moveY += 1; this.direction = 'DOWN'; }
    else if (input.isDown('LEFT')) { moveX -= 1; this.direction = 'LEFT'; }
    else if (input.isDown('RIGHT')) { moveX += 1; this.direction = 'RIGHT'; }

    this.isMoving = (moveX !== 0 || moveY !== 0);

    if (this.isMoving) {
      this.animTimer += dt;
      if (this.animTimer > 120) {
        this.animTimer = 0;
        this.stepFrame = (this.stepFrame + 1) % 4;
      }

      var nextX = this.x + moveX * this.speed;
      var nextY = this.y + moveY * this.speed;

      // Collision checks sui 4 angoli del collider
      var padding = 4;
      var canMoveX = !tilemap.isSolid(nextX + padding, this.y + padding) &&
                     !tilemap.isSolid(nextX + this.width - padding, this.y + padding) &&
                     !tilemap.isSolid(nextX + padding, this.y + this.height - padding) &&
                     !tilemap.isSolid(nextX + this.width - padding, this.y + this.height - padding);

      if (canMoveX) {
        this.x = nextX;
      }

      var canMoveY = !tilemap.isSolid(this.x + padding, nextY + padding) &&
                     !tilemap.isSolid(this.x + this.width - padding, nextY + padding) &&
                     !tilemap.isSolid(this.x + padding, nextY + this.height - padding) &&
                     !tilemap.isSolid(this.x + this.width - padding, nextY + this.height - padding);

      if (canMoveY) {
        this.y = nextY;
      }
    } else {
      this.stepFrame = 0;
      this.animTimer = 0;
    }
  };

  Player.prototype.render = function (ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);

    ctx.save();

    // Ombra del giocatore
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 26, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sprite retro 16-bit del Protagonista (Maglia Azzurra Elisee, Pantaloncini Neri)
    // Gambe / Scarpe con animazione passo
    ctx.fillStyle = '#0f172a';
    var legOffset = (this.isMoving && (this.stepFrame === 1 || this.stepFrame === 3)) ? 3 : 0;
    if (this.direction === 'LEFT' || this.direction === 'RIGHT') {
      ctx.fillRect(px + 6, py + 18, 5, 8 + legOffset);
      ctx.fillRect(px + 13, py + 18, 5, 8 - legOffset);
    } else {
      ctx.fillRect(px + 5, py + 18, 5, 8 + (this.stepFrame === 1 ? 2 : 0));
      ctx.fillRect(px + 14, py + 18, 5, 8 + (this.stepFrame === 3 ? 2 : 0));
    }

    // Scarpe da calcio bianche
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 4, py + 24 + (this.stepFrame === 1 ? 2 : 0), 6, 3);
    ctx.fillRect(px + 14, py + 24 + (this.stepFrame === 3 ? 2 : 0), 6, 3);

    // Corpo / Maglia azzurro Elisee
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(px + 4, py + 8, 16, 11);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 6, py + 10, 12, 3);

    // Testa / Volto
    ctx.fillStyle = '#fed7aa'; // Carnagione
    ctx.fillRect(px + 6, py + 2, 12, 8);

    // Capelli castani
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 5, py, 14, 4);

    // Occhi in base alla direzione
    ctx.fillStyle = '#0f172a';
    if (this.direction === 'DOWN') {
      ctx.fillRect(px + 8, py + 5, 2, 2);
      ctx.fillRect(px + 14, py + 5, 2, 2);
    } else if (this.direction === 'UP') {
      // Vista da dietro: capelli coprono il retro
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 6, py + 2, 12, 6);
    } else if (this.direction === 'LEFT') {
      ctx.fillRect(px + 6, py + 5, 2, 2);
    } else if (this.direction === 'RIGHT') {
      ctx.fillRect(px + 16, py + 5, 2, 2);
    }

    ctx.restore();
  };

  // NPC / TRAINERS OVERWORLD
  function NPC(id, x, y, name, role, dialogLines, isTrainer, trainerId) {
    this.id = id;
    this.x = x * 32;
    this.y = y * 32;
    this.width = 24;
    this.height = 28;
    this.name = name;
    this.role = role || 'Cittadino';
    this.dialogLines = dialogLines || ['Benvenuto in Elisee World!'];
    this.isTrainer = !!isTrainer;
    this.trainerId = trainerId || null;
    this.isDefeated = false;
  }

  NPC.prototype.render = function (ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);

    ctx.save();
    // Ombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 26, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo NPC
    ctx.fillStyle = this.isTrainer ? '#b91c1c' : '#059669'; // Rosso per allenatore, verde per scout
    ctx.fillRect(px + 5, py + 9, 14, 11);

    // Gambe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 6, py + 19, 4, 7);
    ctx.fillRect(px + 14, py + 19, 4, 7);

    // Testa
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 6, py + 2, 12, 8);

    // Capelli / Cappello
    ctx.fillStyle = this.isTrainer ? '#1e293b' : '#d97706';
    ctx.fillRect(px + 5, py, 14, 4);

    // Occhi
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 8, py + 5, 2, 2);
    ctx.fillRect(px + 14, py + 5, 2, 2);

    // Punto esclamativo per Trainer sfidabili non ancora battuti
    if (this.isTrainer && !this.isDefeated) {
      var bounce = Math.sin(Date.now() / 200) * 3;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 9, py - 12 + bounce, 6, 8);
      ctx.fillRect(px + 10, py - 2 + bounce, 4, 2);
    }

    ctx.restore();
  };

  global.EliseePlayer = Player;
  global.EliseeNPC = NPC;

})(typeof window !== 'undefined' ? window : this);
