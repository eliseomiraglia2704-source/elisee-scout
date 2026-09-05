/**
 * ELISEE WORLD — Battle Engine (sez. 8 architettura + sez. 3 design doc)
 * State machine dedicata per il ciclo di battaglia a turni.
 */
(function (global) {
  'use strict';

  class BattleEngine {
    constructor(engine) {
      this.engine = engine;
      this.userParty = [];
      this.enemyParty = [];
      this.userActiveIndex = 0;
      this.enemyActiveIndex = 0;
      this.context = {
        momentum: 50,
        formation: null,
        weather: null,
        isHomeGround: false
      };
      this.subState = 'INTRO'; // 'INTRO', 'COMMAND_SELECT', 'MOVE_SELECT', 'EXECUTE', 'VICTORY', 'DEFEAT'
      this.selectedCommand = 0; // 0: TATTICA, 1: BORSONE, 2: PANCHINA, 3: RUN
      this.selectedMove = 0;
      this.turnLog = [];
    }

    startBattle(userParty, enemyParty) {
      this.userParty = userParty || [];
      this.enemyParty = enemyParty || [];
      this.userActiveIndex = 0;
      this.enemyActiveIndex = 0;
      this.context.momentum = 50;
      this.subState = 'INTRO';
      this.selectedCommand = 0;
      this.selectedMove = 0;
      this.turnLog = [];

      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();

      if (this.engine && this.engine.textbox) {
        this.engine.textbox.show(
          [`Inizia la partita!`, `L'avversario schiera ${enemyP ? enemyP.name : 'Giocatore'}!`, `Vai, ${userP ? userP.name : 'Giocatore'}!`],
          () => {
            this.subState = 'COMMAND_SELECT';
          }
        );
      } else {
        this.subState = 'COMMAND_SELECT';
      }
    }

    getUserActive() {
      return this.userParty[this.userActiveIndex] || null;
    }

    getEnemyActive() {
      return this.enemyParty[this.enemyActiveIndex] || null;
    }

    handleInput(input) {
      if (this.engine.textbox && this.engine.textbox.isOpen) {
        this.engine.textbox.handleInput(input);
        return;
      }

      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      if (!userP || !enemyP) return;

      if (this.subState === 'COMMAND_SELECT') {
        if (input.wasJustPressed('UP') || input.wasJustPressed('DOWN')) {
          this.selectedCommand = (this.selectedCommand + 2) % 4;
          this.engine.audio.playSFX('select');
        } else if (input.wasJustPressed('LEFT') || input.wasJustPressed('RIGHT')) {
          this.selectedCommand = (this.selectedCommand % 2 === 0) ? this.selectedCommand + 1 : this.selectedCommand - 1;
          this.engine.audio.playSFX('select');
        } else if (input.wasJustPressed('A')) {
          this.engine.audio.playSFX('click');
          if (this.selectedCommand === 0) {
            // TATTICA
            this.subState = 'MOVE_SELECT';
            this.selectedMove = 0;
          } else if (this.selectedCommand === 3) {
            // RUN
            this.engine.textbox.show('Ti ritiri dalla partita!', () => {
              this.engine.stateMachine.transition('OVERWORLD');
            });
          }
        }
      } else if (this.subState === 'MOVE_SELECT') {
        const moves = userP.moves || [];
        if (input.wasJustPressed('B')) {
          this.subState = 'COMMAND_SELECT';
          this.engine.audio.playSFX('select');
        } else if (input.wasJustPressed('UP') || input.wasJustPressed('DOWN')) {
          if (moves.length > 2) {
            this.selectedMove = (this.selectedMove + 2) % Math.min(4, moves.length);
            this.engine.audio.playSFX('select');
          }
        } else if (input.wasJustPressed('LEFT') || input.wasJustPressed('RIGHT')) {
          if (moves.length > 1) {
            this.selectedMove = (this.selectedMove % 2 === 0) ? Math.min(moves.length - 1, this.selectedMove + 1) : this.selectedMove - 1;
            this.engine.audio.playSFX('select');
          }
        } else if (input.wasJustPressed('A')) {
          const move = moves[this.selectedMove];
          if (move) {
            this.executeTurn(move);
          }
        }
      }
    }

    executeTurn(userMove) {
      this.subState = 'EXECUTE';
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      const enemyMove = global.EliseeAIController.pickMove(enemyP, userP, this.context);

      // Ordine basato su velocità
      const userFirst = (userP.spd || 50) >= (enemyP.spd || 50);
      const firstActor = userFirst ? { p: userP, m: userMove, isUser: true, target: enemyP } : { p: enemyP, m: enemyMove, isUser: false, target: userP };
      const secondActor = userFirst ? { p: enemyP, m: enemyMove, isUser: false, target: userP } : { p: userP, m: userMove, isUser: true, target: enemyP };

      const turnMessages = [];

      // 1° Azione
      const res1 = global.EliseeMoveExecutor.execute(firstActor.p, firstActor.target, firstActor.m, this.context);
      turnMessages.push(...res1.log);

      if (!res1.fainted) {
        // 2° Azione
        const res2 = global.EliseeMoveExecutor.execute(secondActor.p, secondActor.target, secondActor.m, this.context);
        turnMessages.push(...res2.log);
      }

      this.engine.textbox.show(turnMessages, () => {
        if (enemyP.currentHp <= 0) {
          this.engine.textbox.show([`Hai vinto la partita!`, `Ottimo lavoro, mister!`], () => {
            this.engine.stateMachine.transition('OVERWORLD');
          });
        } else if (userP.currentHp <= 0) {
          this.engine.textbox.show([`Tutti i tuoi giocatori sono esausti!`, `Torna in panchina a riorganizzarti.`], () => {
            this.engine.stateMachine.transition('OVERWORLD');
          });
        } else {
          this.subState = 'COMMAND_SELECT';
        }
      });
    }

    update(dt) {}

    render(ctx) {
      const w = this.engine.canvas.width;
      const h = this.engine.canvas.height;

      // Sfondo stadio retro
      ctx.fillStyle = '#061325';
      ctx.fillRect(0, 0, w, h);

      // Campo verde
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(w * 0.7, h * 0.25, 140, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.55, 160, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      // UI Battle Bars
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();

      if (enemyP) {
        // Enemy bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 20, 220, 60);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`${enemyP.name} Lv.${enemyP.level || 5}`, 28, 40);

        // HP bar enemy
        const enemyHpPct = Math.max(0, enemyP.currentHp / (enemyP.hpMax || 50));
        ctx.fillStyle = '#334155';
        ctx.fillRect(28, 50, 180, 10);
        ctx.fillStyle = enemyHpPct > 0.5 ? '#22c55e' : enemyHpPct > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(28, 50, Math.floor(180 * enemyHpPct), 10);
      }

      if (userP) {
        // User bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w - 240, h * 0.42, 220, 70);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`${userP.name} Lv.${userP.level || 5}`, w - 232, h * 0.42 + 22);

        // HP bar user
        const userHpPct = Math.max(0, userP.currentHp / (userP.hpMax || 50));
        ctx.fillStyle = '#334155';
        ctx.fillRect(w - 232, h * 0.42 + 34, 180, 10);
        ctx.fillStyle = userHpPct > 0.5 ? '#22c55e' : userHpPct > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(w - 232, h * 0.42 + 34, Math.floor(180 * userHpPct), 10);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(`${userP.currentHp}/${userP.hpMax || 50} HP`, w - 232, h * 0.42 + 58);
      }

      // Battle Menu
      if (this.subState === 'COMMAND_SELECT') {
        const menuY = h - 160;
        const menuH = 140;
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(16, menuY, w - 32, menuH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, menuY, w - 32, menuH);

        const btns = [
          { label: 'TATTICA', x: 30, y: menuY + 20, col: '#f43f5e' },
          { label: 'BORSONE', x: w / 2 + 10, y: menuY + 20, col: '#f97316' },
          { label: 'PANCHINA', x: 30, y: menuY + 75, col: '#22c55e' },
          { label: 'RUN', x: w / 2 + 10, y: menuY + 75, col: '#3b82f6' }
        ];

        btns.forEach((b, idx) => {
          const isSel = this.selectedCommand === idx;
          ctx.fillStyle = isSel ? b.col : '#1e293b';
          ctx.fillRect(b.x, b.y, w / 2 - 40, 45);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px monospace';
          ctx.fillText((isSel ? '▶ ' : '') + b.label, b.x + 15, b.y + 28);
        });
      } else if (this.subState === 'MOVE_SELECT') {
        const menuY = h - 160;
        const menuH = 140;
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(16, menuY, w - 32, menuH);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, menuY, w - 32, menuH);

        const moves = userP ? userP.moves || [] : [];
        moves.forEach((m, idx) => {
          const isSel = this.selectedMove === idx;
          const colX = (idx % 2 === 0) ? 30 : w / 2 + 10;
          const rowY = (idx < 2) ? menuY + 20 : menuY + 75;

          ctx.fillStyle = isSel ? '#166534' : '#1e293b';
          ctx.fillRect(colX, rowY, w / 2 - 40, 45);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px monospace';
          ctx.fillText((isSel ? '▶ ' : '') + m.name, colX + 10, rowY + 22);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px monospace';
          ctx.fillText(`${m.type} · ${m.currentPp || m.pp || 15} PP`, colX + 10, rowY + 38);
        });
      }
    }
  }

  global.EliseeBattleEngine = BattleEngine;
})(typeof window !== 'undefined' ? window : this);
