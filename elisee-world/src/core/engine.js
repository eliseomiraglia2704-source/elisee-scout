/**
 * ELISEE WORLD — Core Engine
 * Fixed timestep 60 FPS. BOOT → TITLE → OVERWORLD ⇄ BATTLE / SHOP.
 * UI GBA allineata ai video di riferimento (HUD, 2x2, party 2x3, textbox).
 */
(function (global) {
  'use strict';

  const STEP = 1000 / 60;

  function mv(name, type, power, accuracy, pp, flavor) {
    return {
      name: name,
      type: type,
      power: power,
      accuracy: accuracy,
      currentPp: pp,
      pp: pp,
      flavor: flavor || null
    };
  }

  function athlete(cfg) {
    return {
      id: cfg.id,
      name: cfg.name,
      role: cfg.role,
      type: cfg.role,
      types: cfg.types || [cfg.role],
      level: cfg.level,
      currentHp: cfg.hp,
      hpMax: cfg.hp,
      atk: cfg.atk,
      def: cfg.def,
      spd: cfg.spd,
      gender: cfg.gender || 'M',
      jersey: cfg.jersey,
      hair: cfg.hair || '#1e293b',
      number: cfg.number || 10,
      moves: cfg.moves || []
    };
  }

  class Engine {
    constructor(canvasTarget) {
      if (typeof canvasTarget === 'string') {
        this.canvas = document.getElementById(canvasTarget);
      } else if (canvasTarget && canvasTarget.getContext) {
        this.canvas = canvasTarget;
      } else {
        this.canvas = document.getElementById('elisee-world-canvas');
      }

      if (!this.canvas) {
        throw new Error('[Engine] Canvas non trovato: ' + canvasTarget);
      }
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      this.input = new global.EliseeInput();
      this.audio = new global.EliseeAudioEngine();
      this.loader = new global.EliseeAssetLoader();
      this.renderer = new global.EliseeRenderer(this.canvas);
      this.camera = new global.EliseeCamera(this.canvas.width, this.canvas.height);
      this.textbox = new global.EliseeTextbox();
      this.renderer.setCamera(this.camera);

      this.running = false;
      this.accumulator = 0;
      this.lastTime = 0;
      this.animationFrameId = null;

      this.playerParty = this.makeStarterParty();
      this.overworldMap = 'field';
      this.savedFieldPos = null;
      this.npcs = [];
      this.shopClerk = null;

      this.battle = new global.EliseeBattleEngine(this);
      this.partyScreen = new global.EliseePartyScreen(this);
      this.bagScreen = new global.EliseeBagScreen(this);

      this.initStateMachine();
    }

    makeStarterParty() {
      return [
        athlete({
          id: 'donnaroccia', name: 'Donnaroccia', role: 'POR', level: 15, hp: 75,
          atk: 35, def: 70, spd: 42, jersey: '#16a34a', hair: '#0f172a', number: 1,
          moves: [
            mv('Barriera', 'POR', 40, 100, 20),
            mv('Presa bassa', 'POR', 50, 95, 15),
            mv('Riflesso', 'POR', 0, 100, 20, 'I riflessi coprono tutta la porta!'),
            mv('Chioccia', 'POR', 35, 100, 20)
          ]
        }),
        athlete({
          id: 'bastonix', name: 'Bastonix', role: 'DIFESA', types: ['DIFESA', 'TERZINO'],
          level: 15, hp: 70, atk: 48, def: 62, spd: 55, jersey: '#1d4ed8', number: 32,
          moves: [
            mv('Tacchetti', 'DIFESA', 35, 95, 15),
            mv('Marcatura', 'DIFESA', 0, 100, 20, 'La marcatura si fa più stretta!'),
            mv('Trappola', 'DIFESA', 40, 90, 15),
            mv('Sgroppata', 'TERZINO', 50, 90, 10)
          ]
        }),
        athlete({
          id: 'barella_sprint', name: 'Barella-Sprint', role: 'MEDIANO', level: 16, hp: 68,
          atk: 58, def: 55, spd: 68, jersey: '#1d4ed8', hair: '#3f2a14', number: 23,
          moves: [
            mv('Elastico', 'MEDIANO', 45, 95, 20),
            mv('Raddoppio', 'MEDIANO', 40, 100, 20),
            mv('Secondo tempo', 'MEDIANO', 55, 90, 15),
            mv('Fucilata', 'MEDIANO', 70, 80, 10)
          ]
        }),
        athlete({
          id: 'triraghi', name: 'Triraghi', role: 'TERZINO', types: ['TERZINO', 'ALA'],
          level: 14, hp: 65, atk: 52, def: 50, spd: 60, jersey: '#1d4ed8', number: 22,
          gender: 'M',
          moves: [
            mv('Biraggiro', 'TERZINO', 40, 95, 20),
            mv('Traversone', 'TERZINO', 50, 90, 15),
            mv('Marcatura', 'DIFESA', 0, 100, 20, 'Chiude la fascia!'),
            mv('Tacchetti', 'DIFESA', 35, 95, 15)
          ]
        }),
        athlete({
          id: 'kvaradona', name: 'Kvaradona', role: 'ALA', types: ['ALA', 'TREQ'],
          level: 16, hp: 64, atk: 70, def: 40, spd: 75, jersey: '#0ea5e9', hair: '#111827', number: 77,
          moves: [
            mv('Tunnel', 'ALA', 45, 95, 15),
            mv('Doppia finta', 'ALA', 55, 90, 20),
            mv('Tiro a giro', 'ALA', 70, 85, 15),
            mv('Sforbiciata', 'PUNTA', 75, 80, 10)
          ]
        }),
        null
      ];
    }

    makeRivalParty() {
      return [
        athlete({
          id: 'skrinix', name: 'Skrinix', role: 'DIFESA', level: 14, hp: 72,
          atk: 50, def: 68, spd: 40, jersey: '#2563eb', hair: '#f8fafc', number: 37,
          gender: 'M',
          moves: [
            mv('Espulsione', 'DIFESA', 60, 85, 10),
            mv('Tacchetti', 'DIFESA', 35, 95, 15),
            mv('Marcatura', 'DIFESA', 0, 100, 20, 'Non lascia uno spiraglio!'),
            mv('Dominio Aereo', 'DIFESA', 50, 90, 5)
          ]
        })
      ];
    }

    makeWildEnemy() {
      const pool = [
        athlete({
          id: 'bordalotelli', name: 'Bordalotelli', role: 'PUNTA', level: 12, hp: 58,
          atk: 70, def: 40, spd: 55, jersey: '#dc2626', hair: '#1c1917', number: 9,
          moves: [
            mv('Bordata', 'PUNTA', 80, 75, 10),
            mv('Rovesciata', 'PUNTA', 90, 70, 8),
            mv('Tiro della Tigre', 'PUNTA', 85, 75, 10),
            mv('Esultanza', 'PUNTA', 0, 100, 20, 'Infiamma lo stadio!')
          ]
        }),
        athlete({
          id: 'ricefox', name: 'Ricefox', role: 'MEDIANO', level: 11, hp: 52,
          atk: 48, def: 50, spd: 60, jersey: '#ffffff', hair: '#78350f', number: 4,
          moves: [
            mv('Raddoppio', 'MEDIANO', 40, 100, 20),
            mv('Intercetto', 'MEDIANO', 35, 95, 20),
            mv('Fucilata', 'MEDIANO', 70, 80, 10),
            mv('Copertura', 'MEDIANO', 0, 100, 20, 'Chiude ogni linea di passaggio!')
          ]
        })
      ];
      return [pool[Math.floor(Math.random() * pool.length)]];
    }

    spawnFieldNpcs() {
      this.npcs = [];
      if (!global.EliseeNPC) return;
      const rival = new global.EliseeNPC(420, 210, 'Mister Rival', [
        'Ancora tu!',
        'Non te la caverai stavolta sul campetto!'
      ], 'trainer');
      rival.startsBattle = true;
      rival.enemyParty = this.makeRivalParty();
      rival.trainerName = 'Mister Rival';
      this.npcs.push(rival);
    }

    initStateMachine() {
      const states = {
        BOOT: {
          enter: () => {
            this.bootTimer = 0;
          },
          update: (dt) => {
            this.bootTimer += dt;
            if (this.bootTimer > 900 || this.input.wasJustPressed('A') || this.input.wasJustPressed('START')) {
              this.stateMachine.transition('TITLE');
            }
          },
          render: (ctx) => {
            const ui = global.EliseeGbaUi;
            if (ui && ui.drawTitle) ui.drawTitle(ctx, this.canvas.width, this.canvas.height, true);
            else {
              ctx.fillStyle = '#0b1a3a';
              ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
          },
          exit: () => {}
        },

        TITLE: {
          enter: () => {},
          update: (dt) => {
            if (this.input.wasJustPressed('START') || this.input.wasJustPressed('A')) {
              this.audio.unlock();
              this.audio.playSFX('select');
              this.stateMachine.transition('OVERWORLD');
            }
          },
          render: (ctx) => {
            const ui = global.EliseeGbaUi;
            const blink = Math.floor(Date.now() / 500) % 2 === 0;
            if (ui && ui.drawTitle) ui.drawTitle(ctx, this.canvas.width, this.canvas.height, blink);
          },
          exit: () => {}
        },

        OVERWORLD: {
          enter: () => {
            if (!this.tilemap) {
              this.tilemap = new global.EliseeTilemap({ width: 24, height: 20, tileSize: 32 });
            }
            if (!this.player) {
              this.player = new global.EliseePlayer(220, 200);
            }
            if (!this.npcs.length) this.spawnFieldNpcs();
            this.overworldMap = this.overworldMap || 'field';
            this.camera.follow(this.player);
          },
          update: (dt) => {
            if (this.textbox.isOpen) {
              this.textbox.update(dt);
              this.textbox.handleInput(this.input);
              return;
            }
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.handleInput(this.input);
              return;
            }
            if (this.bagScreen && this.bagScreen.isOpen) {
              this.bagScreen.handleInput(this.input);
              return;
            }

            if (this.overworldMap === 'shop') {
              this.updateShop(dt);
              return;
            }

            if (this.player) {
              this.player.handleInput(this.input, dt, this.tilemap);
              this.player.update(dt);
            }
            if (this.camera && this.tilemap) {
              this.camera.update(
                this.tilemap.width * this.tilemap.tileSize,
                this.tilemap.height * this.tilemap.tileSize
              );
            }

            if (this.input.wasJustPressed('SELECT')) {
              this.audio.playSFX('select');
              this.partyScreen.open('menu');
              return;
            }
            if (this.input.wasJustPressed('START')) {
              this.audio.playSFX('select');
              this.stateMachine.transition('BATTLE', { wild: true });
              return;
            }
            if (this.input.wasJustPressed('A')) {
              this.tryOverworldInteract();
            }
          },
          render: (ctx) => {
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.render(ctx);
              this.textbox.render(ctx, this.canvas.width, this.canvas.height);
              return;
            }
            if (this.bagScreen && this.bagScreen.isOpen) {
              this.bagScreen.render(ctx);
              this.textbox.render(ctx, this.canvas.width, this.canvas.height);
              return;
            }
            if (this.overworldMap === 'shop') {
              this.renderShop(ctx);
              this.textbox.render(ctx, this.canvas.width, this.canvas.height);
              return;
            }

            this.renderer.clear();
            this.renderer.beginWorld();
            if (this.tilemap) this.tilemap.render(ctx);
            this.npcs.forEach(function (n) { n.render(ctx); });
            if (this.player) this.player.render(ctx);
            this.renderer.endWorld();

            const ui = global.EliseeGbaUi;
            if (ui && ui.drawLocationBanner) {
              ui.drawLocationBanner(ctx, 10, 10, 'Campetto Elisee', 'Settore giovanile');
            }

            if (!this.textbox.isOpen) {
              if (ui && ui.drawGbaWindow) {
                ui.drawGbaWindow(ctx, this.canvas.width - 250, this.canvas.height - 36, 238, 26);
                ctx.fillStyle = '#101010';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('[C] Rosa   [P] Match   [A] Parla', this.canvas.width - 131, this.canvas.height - 23);
              }
            }

            this.textbox.render(ctx, this.canvas.width, this.canvas.height);
          },
          exit: () => {}
        },

        BATTLE: {
          enter: (payload) => {
            const user = this.playerParty;
            let enemy;
            let trainerName = null;
            if (payload && payload.enemyParty) {
              enemy = payload.enemyParty;
              trainerName = payload.trainerName || null;
            } else {
              enemy = this.makeWildEnemy();
            }
            this.battle.startBattle(user, enemy, { trainerName: trainerName });
          },
          update: (dt) => {
            if (this.textbox.isOpen) {
              this.textbox.update(dt);
              this.battle.handleInput(this.input);
              return;
            }
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.handleInput(this.input);
              return;
            }
            if (this.bagScreen && this.bagScreen.isOpen) {
              this.bagScreen.handleInput(this.input);
              return;
            }
            this.battle.handleInput(this.input);
            this.battle.update(dt);
          },
          render: (ctx) => {
            this.battle.render(ctx);
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.render(ctx);
            } else if (this.bagScreen && this.bagScreen.isOpen) {
              this.bagScreen.render(ctx);
            }
            this.textbox.render(ctx, this.canvas.width, this.canvas.height);
          },
          exit: () => {}
        }
      };

      this.stateMachine = new global.EliseeStateMachine(states, 'BOOT');
    }

    near(a, b, dist) {
      if (!a || !b) return false;
      const dx = (a.x + (a.width || 32) / 2) - (b.x + (b.width || 32) / 2);
      const dy = (a.y + (a.height || 32) / 2) - (b.y + (b.height || 32) / 2);
      return dx * dx + dy * dy <= dist * dist;
    }

    tryOverworldInteract() {
      const p = this.player;
      if (!p) return;
      for (let i = 0; i < this.npcs.length; i++) {
        const npc = this.npcs[i];
        if (this.near(p, npc, 48)) {
          const lines = npc.dialogue ? npc.dialogue.slice() : ['...'];
          this.textbox.show(lines, () => {
            if (npc.startsBattle) {
              this.stateMachine.transition('BATTLE', {
                enemyParty: npc.enemyParty || this.makeRivalParty(),
                trainerName: npc.trainerName || npc.name
              });
            }
          });
          return;
        }
      }
      if (this.tilemap && this.tilemap.isNearBuilding && this.tilemap.isNearBuilding(p.x, p.y)) {
        this.enterShop();
      }
    }

    enterShop() {
      this.savedFieldPos = this.player ? { x: this.player.x, y: this.player.y } : null;
      this.overworldMap = 'shop';
      if (this.player) {
        this.player.x = 270;
        this.player.y = 300;
        this.player.direction = 'up';
      }
      this.textbox.show([
        'Benvenuto nel Centro Elisee!',
        'Ti ho messo a disposizione tre portieri di grande qualità!'
      ]);
    }

    exitShop() {
      this.overworldMap = 'field';
      if (this.player && this.savedFieldPos) {
        this.player.x = this.savedFieldPos.x;
        this.player.y = this.savedFieldPos.y + 36;
      }
    }

    updateShop(dt) {
      if (this.player) {
        this.player.handleInput(this.input, dt, null);
        this.player.update(dt);
        this.player.x = Math.max(40, Math.min(this.canvas.width - 72, this.player.x));
        this.player.y = Math.max(80, Math.min(this.canvas.height - 80, this.player.y));
        if (this.player.y > this.canvas.height - 90 && this.input.isDown('DOWN')) {
          this.exitShop();
          return;
        }
      }
      if (this.input.wasJustPressed('B')) {
        this.exitShop();
        return;
      }
      if (this.input.wasJustPressed('SELECT')) {
        this.partyScreen.open('menu');
        return;
      }
      if (this.input.wasJustPressed('A')) {
        this.textbox.show([
          'Spallex ha riordinato il magazzino.',
          'Pozioni, contratti e tre portieri pronti per te.'
        ]);
      }
    }

    renderShop(ctx) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.fillStyle = '#c8c4b8';
      ctx.fillRect(0, 0, w, h);
      const ts = 32;
      for (let y = 64; y < h; y += ts) {
        for (let x = 0; x < w; x += ts) {
          ctx.fillStyle = ((x + y) / ts) % 2 === 0 ? '#d4d0c4' : '#c8c4b8';
          ctx.fillRect(x, y, ts, ts);
          ctx.strokeStyle = 'rgba(160,156,148,0.5)';
          ctx.strokeRect(x + 0.5, y + 0.5, ts - 1, ts - 1);
        }
      }
      ctx.fillStyle = '#e8e0c8';
      ctx.fillRect(0, 0, w, 64);
      ctx.fillStyle = '#b8b090';
      ctx.fillRect(0, 56, w, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(20, 18, 70, 36);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(28, 24, 22, 16);
      ctx.fillRect(54, 24, 22, 16);

      ctx.fillStyle = '#d97706';
      ctx.fillRect(120, 20, 90, 34);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(128, 26, 74, 22);

      ctx.fillStyle = '#334155';
      ctx.fillRect(w - 160, 16, 130, 40);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w - 150, 22, 50, 28);
      ctx.fillRect(w - 90, 22, 50, 28);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(80, 150, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(80, 150, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(w - 200, 160, 90, 28);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(w - 175 + i * 22, 174, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (this.player) this.player.render(ctx);

      const ui = global.EliseeGbaUi;
      if (ui && ui.drawLocationBanner) {
        ui.drawLocationBanner(ctx, 10, 10, 'Centro Elisee', 'Magazzino atleti');
      }
    }

    handlePointer(px, py) {
      if (this.partyScreen && this.partyScreen.isOpen) {
        return this.partyScreen.handlePointer(px, py);
      }
      if (this.bagScreen && this.bagScreen.isOpen) {
        return this.bagScreen.handlePointer(px, py);
      }
      const st = this.stateMachine && this.stateMachine.getCurrent();
      if (st === 'BATTLE' && this.battle && this.battle.handlePointer) {
        return this.battle.handlePointer(px, py);
      }
      return false;
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.input.attach();
      this.lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      this.accumulator = 0;
      this.render();

      const loop = (now) => {
        if (!this.running) return;
        const delta = Math.min(100, now - this.lastTime);
        this.lastTime = now;
        this.accumulator += delta;
        while (this.accumulator >= STEP) {
          this.update(STEP);
          this.accumulator -= STEP;
        }
        this.render();
        this.animationFrameId = requestAnimationFrame(loop);
      };

      this.animationFrameId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.input.detach();
    }

    update(dt) {
      this.stateMachine.update(dt);
      this.input.clearJustPressed();
    }

    render() {
      this.stateMachine.render(this.ctx, this.renderer);
      this.renderer.drawOverlay();
    }
  }

  global.EliseeEngine = Engine;
})(typeof window !== 'undefined' ? window : this);
