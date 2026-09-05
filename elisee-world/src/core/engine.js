/**
 * ELISEE WORLD — CORE ENGINE
 * Fixed timestep game loop (60 FPS), orchestratore stati globali:
 * BOOT -> TITLE -> OVERWORLD <-> BATTLE / PARTY_MENU / BAG_MENU
 */
(function (global) {
  'use strict';

  function Engine(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.input = global.EliseeInput;
    this.saveManager = global.EliseeSaveManager;
    this.audio = global.EliseeAudio;

    this.camera = new global.EliseeCamera(this.width, this.height);
    this.textbox = new global.EliseeTextbox();
    this.tilemap = global.EliseeTilemap;
    this.player = new global.EliseePlayer(14 * 32, 11 * 32);

    this.party = [];
    this.bag = [];
    this.movesDb = {};
    this.rosterDb = [];
    this.trainersDb = [];

    this.npcs = [
      new global.EliseeNPC('npc_scout', 12, 11, 'Gianni Scout', 'Osservatore', [
        'Benvenuto nel centro federale di Elisee World!',
        'Puoi allenare i tuoi talenti nell\'erba alta a sud o sfidare i mister allo stadio.'
      ]),
      new global.EliseeNPC('npc_edicola', 5, 17, 'Edicolante', 'Giornalista', [
        'Qui trovi La Guazzetta dello Sport!',
        'Titolo di oggi: "Clamoroso colpo di mercato per la nuova stagione!"'
      ]),
      new global.EliseeNPC('npc_coach_1', 23, 7, 'Mister Allegro', 'Allenatore', [
        'Ti stavo aspettando! Vediamo se la tua squadra sa difendersi dal Corto Muso!'
      ], true, 'mister_allegro'),
      new global.EliseeNPC('npc_coach_2', 15, 4, 'Mister Filosofo', 'Maestro Tattico', [
        'Uomini forti, destini forti! Sei pronto per la grande sfida?'
      ], true, 'mister_spalletti')
    ];

    this.battleEngine = new global.EliseeBattleEngine(this);

    this.running = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.STEP = 1000 / 60; // 60 FPS deterministico

    // Setup State Machine
    var self = this;
    this.stateMachine = new global.EliseeStateMachine({
      BOOT: {
        enter: function () { self.initData(); },
        update: function (dt) {},
        render: function (ctx) { self.renderBoot(ctx); }
      },
      TITLE: {
        enter: function () { self.titleOption = 0; },
        update: function (dt) { self.updateTitle(dt); },
        render: function (ctx) { self.renderTitle(ctx); }
      },
      OVERWORLD: {
        enter: function () {
          self.locationBanner = 'MILANO — CENTRO FEDERALE';
          self.bannerTimer = 2500;
        },
        update: function (dt) { self.updateOverworld(dt); },
        render: function (ctx) { self.renderOverworld(ctx); }
      },
      BATTLE: {
        enter: function () {},
        update: function (dt) { self.battleEngine.update(dt, self.input); },
        render: function (ctx) { self.battleEngine.render(ctx, self.width, self.height); }
      },
      PARTY_MENU: {
        enter: function () { self.partyMenuIndex = 0; },
        update: function (dt) { self.updatePartyMenu(dt); },
        render: function (ctx) { self.renderPartyMenu(ctx); }
      }
    }, 'BOOT');

    // Title selection: 0 = Continua, 1 = Nuova Partita
    this.titleOption = 0;
    this.titleTime = 0;
    this.locationBanner = '';
    this.bannerTimer = 0;
  }

  Engine.prototype.initData = function () {
    var self = this;
    // Caricamento asincrono o fallback locale JSON
    Promise.all([
      fetch('elisee-world/data/roster.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('elisee-world/data/moves.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('elisee-world/data/trainers.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('elisee-world/data/items.json').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (results) {
      self.rosterDb = results[0] || [];
      self.movesDb = results[1] || {};
      self.trainersDb = results[2] || [];
      var items = results[3] || [];

      // Controllo salvataggio esistente
      var saved = self.saveManager.load();
      if (saved && saved.party && saved.party.length) {
        self.party = saved.party;
        self.bag = saved.bag || items;
      } else {
        // Rosa starter di default (primi 3 giocatori)
        self.party = self.rosterDb.slice(0, 3);
        self.bag = items;
      }

      setTimeout(function () {
        self.stateMachine.transition('TITLE');
      }, 400);
    }).catch(function (e) {
      console.warn('[EliseeEngine] Fallback data:', e);
      self.stateMachine.transition('TITLE');
    });
  };

  Engine.prototype.getSaveState = function () {
    return {
      player: { x: this.player.x, y: this.player.y, direction: this.player.direction },
      party: this.party,
      bag: this.bag,
      progress: { defeatedTrainers: [] }
    };
  };

  Engine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.input.init();
    if (this.audio) this.audio.init();

    var self = this;
    function loop(now) {
      if (!self.running) return;
      self.accumulator += now - self.lastTime;
      self.lastTime = now;

      while (self.accumulator >= self.STEP) {
        self.update(self.STEP);
        self.accumulator -= self.STEP;
      }

      self.render();
      self.input.flushFrame();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  Engine.prototype.stop = function () {
    this.running = false;
  };

  Engine.prototype.update = function (dt) {
    this.textbox.update(dt);
    this.stateMachine.update(dt);
  };

  Engine.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.stateMachine.render(this.ctx);
    this.textbox.render(this.ctx, this.width, this.height);
  };

  // --- BOOT SCREEN ---
  Engine.prototype.renderBoot = function (ctx) {
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px "Outfit", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ELISEE ENGINE 2D', this.width / 2, this.height / 2 - 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Outfit", monospace, sans-serif';
    ctx.fillText('Caricamento risorse di gioco...', this.width / 2, this.height / 2 + 18);
    ctx.textAlign = 'start';
  };

  // --- TITLE SCREEN ---
  Engine.prototype.updateTitle = function (dt) {
    this.titleTime += dt;
    var hasSave = this.saveManager.hasSave();

    if (this.input.isJustPressed('UP') || this.input.isJustPressed('DOWN')) {
      this.titleOption = this.titleOption === 0 ? 1 : 0;
      if (this.audio) this.audio.playSFX('select');
    }

    if (this.input.isJustPressed('A') || this.input.isJustPressed('START')) {
      if (this.audio) this.audio.playSFX('confirm');
      if (this.titleOption === 0 && hasSave) {
        // Continua
        var saved = this.saveManager.load();
        if (saved && saved.party) this.party = saved.party;
      } else {
        // Nuova Partita
        this.party = this.rosterDb.slice(0, 3);
      }
      this.stateMachine.transition('OVERWORLD');
    }
  };

  Engine.prototype.renderTitle = function (ctx) {
    // Sfondo radiale viola/blu notte con raggi
    var grad = ctx.createRadialGradient(this.width / 2, this.height / 2, 20, this.width / 2, this.height / 2, this.width / 1.4);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Raggi diagonali retro
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 4;
    for (var r = 0; r < 12; r++) {
      ctx.beginPath();
      ctx.moveTo(this.width, this.height);
      ctx.lineTo(r * (this.width / 6), 0);
      ctx.stroke();
    }

    // Logo principale: ELISEE WORLD
    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(2, 132, 199, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText('ELISEE WORLD', this.width / 2, this.height * 0.32);

    // Sottotitolo
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('FOOTBALL EDITION', this.width / 2, this.height * 0.39);

    // Disclaimer IP originale
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Outfit", monospace, sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('IP ORIGINALE ELISEE SCOUT · PIXEL ART 16-BIT', this.width / 2, this.height * 0.46);

    // Opzioni Menu
    var hasSave = this.saveManager.hasSave();
    var optY = this.height * 0.65;

    if (hasSave) {
      ctx.fillStyle = this.titleOption === 0 ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 15px "Outfit", monospace, sans-serif';
      ctx.fillText((this.titleOption === 0 ? '▶ ' : '  ') + 'CONTINUA PARTITA', this.width / 2, optY);

      ctx.fillStyle = this.titleOption === 1 ? '#38bdf8' : '#94a3b8';
      ctx.fillText((this.titleOption === 1 ? '▶ ' : '  ') + 'NUOVA PARTITA', this.width / 2, optY + 30);
    } else {
      var blink = Math.floor(this.titleTime / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px "Outfit", monospace, sans-serif';
        ctx.fillText('PREMI START O INVIO PER INIZIARE', this.width / 2, optY + 15);
      }
    }

    ctx.textAlign = 'start';
  };

  // --- OVERWORLD ---
  Engine.prototype.updateOverworld = function (dt) {
    if (this.bannerTimer > 0) this.bannerTimer -= dt;

    if (this.textbox.active) {
      if (this.input.isJustPressed('A') || this.input.isJustPressed('B')) {
        this.textbox.advance();
      }
      return;
    }

    // Menu Rosa
    if (this.input.isJustPressed('START')) {
      if (this.audio) this.audio.playSFX('confirm');
      this.stateMachine.transition('PARTY_MENU');
      return;
    }

    var prevX = this.player.x;
    var prevY = this.player.y;

    this.player.update(dt, this.input, this.tilemap);
    this.camera.follow(this.player.x, this.player.y, this.tilemap.widthPx, this.tilemap.heightPx);

    // Controllo interazione con NPC (tasto A)
    if (this.input.isJustPressed('A')) {
      for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        var dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
        if (dist < 42) {
          if (this.audio) this.audio.playSFX('select');
          var self = this;
          if (npc.isTrainer && !npc.isDefeated) {
            var trainerData = this.trainersDb.find(function (t) { return t.id === npc.trainerId; });
            this.textbox.say(npc.dialogLines[0], npc.name, 'alert', function () {
              self.stateMachine.transition('BATTLE');
              self.battleEngine.startBattle(trainerData);
              npc.isDefeated = true;
            });
          } else {
            this.textbox.say(npc.dialogLines[0], npc.name, 'normal');
          }
          break;
        }
      }
    }

    // Incontro selvatico nell'erba alta (con probabilità dopo movimento)
    if (this.player.isMoving && this.tilemap.isTallGrass(this.player.x + 12, this.player.y + 16)) {
      if (Math.random() < 0.012) { // 1.2% chance per frame di movimento
        var wildScout = this.rosterDb[Math.floor(Math.random() * this.rosterDb.length)];
        this.stateMachine.transition('BATTLE');
        this.battleEngine.startBattle(null, wildScout);
      }
    }
  };

  Engine.prototype.renderOverworld = function (ctx) {
    this.camera.apply(ctx);

    // 1. Disegna mappa
    this.tilemap.render(ctx, this.camera);

    // 2. Disegna entità ordinate per coordinata Y (y-sorting per profondità)
    var entities = [this.player].concat(this.npcs);
    entities.sort(function (a, b) { return a.y - b.y; });

    for (var i = 0; i < entities.length; i++) {
      entities[i].render(ctx);
    }

    this.camera.restore(ctx);

    // 3. UI Layer (Coordinate schermo fisse)
    // Banner nome località in alto a sinistra
    if (this.bannerTimer > 0 && this.locationBanner) {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(16, 16, 260, 36);
      ctx.strokeRect(16, 16, 260, 36);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px "Outfit", monospace, sans-serif';
      ctx.fillText(this.locationBanner, 28, 38);
    }

    // Hint controlli in alto a destra
    ctx.fillStyle = 'rgba(5, 10, 20, 0.7)';
    ctx.fillRect(this.width - 150, 16, 134, 26);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Outfit", monospace, sans-serif';
    ctx.fillText('TAB/START: Menu Rosa', this.width - 140, 33);
  };

  // --- PARTY MENU (2x3 GRID) ---
  Engine.prototype.updatePartyMenu = function (dt) {
    if (this.input.isJustPressed('B') || this.input.isJustPressed('START')) {
      if (this.audio) this.audio.playSFX('cancel');
      this.stateMachine.transition('OVERWORLD');
      return;
    }

    var count = this.party.length;
    if (this.input.isJustPressed('UP')) {
      this.partyMenuIndex = (this.partyMenuIndex - 1 + count) % count;
      if (this.audio) this.audio.playSFX('select');
    } else if (this.input.isJustPressed('DOWN')) {
      this.partyMenuIndex = (this.partyMenuIndex + 1) % count;
      if (this.audio) this.audio.playSFX('select');
    }
  };

  Engine.prototype.renderPartyMenu = function (ctx) {
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Outfit", monospace, sans-serif';
    ctx.fillText('LA MIA SQUADRA (PARTY ROSA)', 20, 32);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Outfit", monospace, sans-serif';
    ctx.fillText('Seleziona un giocatore · Premi B per tornare', 20, 50);

    var startY = 65;
    for (var i = 0; i < this.party.length; i++) {
      var p = this.party[i];
      var isSelected = (this.partyMenuIndex === i);
      var bx = 20;
      var by = startY + i * 62;
      var bw = this.width - 40;
      var bh = 54;

      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0b1329';
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Nome e Ruolo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
      ctx.fillText(p.nome, bx + 14, by + 22);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
      ctx.fillText((p.ruolo || 'ALA') + ' · Lv.' + (p.livello || 15), bx + 14, by + 40);

      // Barra HP
      var barX = bx + bw - 160;
      var barY = by + 18;
      var barW = 140;
      var barH = 8;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);

      var ratio = Math.max(0, Math.min(1, p.hp / p.hp_max));
      ctx.fillStyle = p.hp <= 0 ? '#ef4444' : (ratio > 0.5 ? '#22c55e' : '#f59e0b');
      ctx.fillRect(barX, barY, barW * ratio, barH);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 10px "Outfit", monospace, sans-serif';
      ctx.fillText(p.hp <= 0 ? 'ESAUSTO (FNT)' : ('HP: ' + p.hp + '/' + p.hp_max), barX, by + 40);
    }
  };

  global.EliseeEngine = Engine;

})(typeof window !== 'undefined' ? window : this);
