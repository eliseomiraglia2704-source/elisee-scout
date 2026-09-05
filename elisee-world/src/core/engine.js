/**
 * ELISEE WORLD — Core Engine (sez. 0, 2, 3 architettura)
 * Fixed timestep game loop deterministico a 60 FPS con accumulator.
 * State Machine globale: BOOT → TITLE → OVERWORLD ⇄ BATTLE.
 */
(function (global) {
  'use strict';

  const STEP = 1000 / 60; // 60 update/sec logici (16.666ms)

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

      // Sub-sistemi del motore
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

      // Dati di gioco in memoria
      this.playerParty = [];
      this.enemyParty = [];
      this.overworld = null;
      this.battle = new global.EliseeBattleEngine(this);
      this.partyScreen = new global.EliseePartyScreen(this);

      // Inizializza State Machine Globale
      this.initStateMachine();
    }

    initStateMachine() {
      const states = {
        BOOT: {
          enter: () => {
            this.bootTimer = 0;
            this.bootStatus = 'BOOT OK';
          },
          update: (dt) => {
            this.bootTimer += dt;
            // Avanza automaticamente a TITLE dopo breve splash o al primo click/tasto
            if (this.bootTimer > 1200 || this.input.wasJustPressed('A') || this.input.wasJustPressed('START')) {
              this.stateMachine.transition('TITLE');
            }
          },
          render: (ctx) => {
            ctx.fillStyle = '#050a12';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ELISEE WORLD', this.canvas.width / 2, this.canvas.height / 2 - 40);

            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('ENGINE BOOT OK — 60 FPS', this.canvas.width / 2, this.canvas.height / 2);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px monospace';
            ctx.fillText('Fixed Timestep Game Loop Attivo', this.canvas.width / 2, this.canvas.height / 2 + 30);
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
            ctx.fillStyle = '#0a101e';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Titolo
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ELISEE WORLD', this.canvas.width / 2, this.canvas.height * 0.35);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px monospace';
            ctx.fillText('FOOTBALL EDITION', this.canvas.width / 2, this.canvas.height * 0.35 + 30);

            // Prompt lampeggiante
            if (Math.floor(Date.now() / 500) % 2 === 0) {
              ctx.fillStyle = '#38bdf8';
              ctx.font = 'bold 16px monospace';
              ctx.fillText('PREMI START / TOCCA', this.canvas.width / 2, this.canvas.height * 0.65);
            }
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
            this.camera.follow(this.player);
          },
          update: (dt) => {
            // Se il Party Screen è aperto, gestisce input dedicato
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.handleInput(this.input);
              return;
            }

            if (this.textbox.isOpen) {
              this.textbox.update(dt);
              this.textbox.handleInput(this.input);
              return;
            }

            if (this.player) {
              this.player.handleInput(this.input, dt, this.tilemap);
              this.player.update(dt);
            }

            // Tasto SELECT / X per aprire il Party Screen
            if (this.input.wasJustPressed('SELECT') || this.input.wasJustPressed('X')) {
              this.audio.playSFX('select');
              this.partyScreen.open();
              return;
            }

            // Tasto START per triggerare Battaglia di test
            if (this.input.wasJustPressed('START')) {
              this.audio.playSFX('select');
              this.stateMachine.transition('BATTLE');
            }
          },
          render: (ctx) => {
            // Se il Party Screen è aperto, renderizza la schermata party
            if (this.partyScreen && this.partyScreen.isOpen) {
              this.partyScreen.render(ctx);
              return;
            }

            this.renderer.clear();
            this.renderer.beginWorld();

            if (this.tilemap) {
              this.tilemap.render(ctx);
            }

            if (this.player) {
              this.player.render(ctx);
            }

            this.renderer.endWorld();

            // 1. Banner Nome Località (in alto a sinistra, sez. 1)
            const banX = 12;
            const banY = 12;
            const banW = 205;
            const banH = 38;

            ctx.fillStyle = 'rgba(7, 12, 24, 0.92)';
            ctx.fillRect(banX, banY, banW, banH);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(banX, banY, banW, banH);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Campetto San Siro', banX + 10, banY + 16);

            ctx.fillStyle = '#38bdf8';
            ctx.font = '9px monospace';
            ctx.fillText('Settore Giovanile · Erba Naturale', banX + 10, banY + 30);

            // 2. Prompt Comandi Rapidi (in basso)
            const promptW = 240;
            const promptH = 24;
            const promptX = this.canvas.width - promptW - 12;
            const promptY = this.canvas.height - promptH - 12;

            ctx.fillStyle = 'rgba(7, 12, 24, 0.88)';
            ctx.fillRect(promptX, promptY, promptW, promptH);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(promptX, promptY, promptW, promptH);

            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('[SELECT] Rosa Atleti  ·  [START] Match', promptX + promptW / 2, promptY + 16);

            this.textbox.render(ctx, this.canvas.width, this.canvas.height);
          },
          exit: () => {}
        },

        BATTLE: {
          enter: () => {
            // Mock party per test
            const mockUserParty = [
              {
                name: 'Kvaradona',
                type: 'ALA',
                level: 10,
                currentHp: 45,
                hpMax: 45,
                atk: 58,
                def: 35,
                spd: 62,
                moves: [
                  { name: 'Doppia finta', type: 'ALA', power: 40, accuracy: 100, currentPp: 20, pp: 20 },
                  { name: 'Bordata', type: 'PUNTA', power: 55, accuracy: 90, currentPp: 10, pp: 10 }
                ]
              }
            ];
            const mockEnemyParty = [
              {
                name: 'Difensore Roccia',
                type: 'DIFESA',
                level: 8,
                currentHp: 40,
                hpMax: 40,
                atk: 40,
                def: 60,
                spd: 35,
                moves: [
                  { name: 'Tacchetti', type: 'DIFESA', power: 35, accuracy: 95, currentPp: 15, pp: 15 }
                ]
              }
            ];
            this.battle.startBattle(mockUserParty, mockEnemyParty);
          },
          update: (dt) => {
            this.battle.handleInput(this.input);
            this.battle.update(dt);
          },
          render: (ctx) => {
            this.battle.render(ctx);
            this.textbox.render(ctx, this.canvas.width, this.canvas.height);
          },
          exit: () => {}
        }
      };

      this.stateMachine = new global.EliseeStateMachine(states, 'BOOT');
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.input.attach();
      this.lastTime = performance.now();
      this.accumulator = 0;
      this.render(); // Primo render immediato

      const loop = (now) => {
        if (!this.running) return;
        const delta = Math.min(100, now - this.lastTime);
        this.lastTime = now;
        this.accumulator += delta;

        // Fixed timestep deterministic update
        while (this.accumulator >= STEP) {
          this.update(STEP);
          this.accumulator -= STEP;
        }

        // Render frame
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
