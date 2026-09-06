/**
 * ELISEE WORLD — Battle Engine
 * Campo GBA: piattaforme, HUD argento, menu TATTICA/BORSONE/PANCHINA/RUN.
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
      this.subState = 'INTRO';
      this.selectedCommand = 0;
      this.selectedMove = 0;
      this.turnLog = [];
      this.trainerName = null;
    }

    startBattle(userParty, enemyParty, opts) {
      this.userParty = userParty || [];
      this.enemyParty = enemyParty || [];
      this.userActiveIndex = 0;
      this.enemyActiveIndex = 0;
      this.context.momentum = 50;
      this.subState = 'INTRO';
      this.selectedCommand = 0;
      this.selectedMove = 0;
      this.turnLog = [];
      this.trainerName = (opts && opts.trainerName) || null;

      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      const intro = [];
      if (this.trainerName) {
        intro.push(this.trainerName + ' vuole disputare una partita!');
      } else {
        intro.push('Un calciatore selvatico appare!');
      }
      intro.push("L'avversario schiera " + (enemyP ? enemyP.name : 'Giocatore') + '!');
      intro.push('Vai, ' + (userP ? userP.name : 'Giocatore') + '!');

      if (this.engine && this.engine.textbox) {
        this.engine.textbox.show(intro, () => {
          this.subState = 'COMMAND_SELECT';
        });
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

    sfx(name) {
      if (this.engine && this.engine.audio) this.engine.audio.playSFX(name);
    }

    handleInput(input) {
      if (this.engine.textbox && this.engine.textbox.isOpen) {
        this.engine.textbox.handleInput(input);
        return;
      }
      if (this.engine.partyScreen && this.engine.partyScreen.isOpen) return;
      if (this.engine.bagScreen && this.engine.bagScreen.isOpen) return;

      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      if (!userP || !enemyP) return;

      if (this.subState === 'COMMAND_SELECT') {
        if (input.wasJustPressed('UP') || input.wasJustPressed('DOWN')) {
          this.selectedCommand = (this.selectedCommand + 2) % 4;
          this.sfx('select');
        } else if (input.wasJustPressed('LEFT') || input.wasJustPressed('RIGHT')) {
          this.selectedCommand = (this.selectedCommand % 2 === 0) ? this.selectedCommand + 1 : this.selectedCommand - 1;
          this.sfx('select');
        } else if (input.wasJustPressed('A')) {
          this.confirmCommand();
        } else if (input.wasJustPressed('B')) {
          this.selectedCommand = 0;
        }
      } else if (this.subState === 'MOVE_SELECT') {
        const moves = userP.moves || [];
        if (input.wasJustPressed('B')) {
          this.subState = 'COMMAND_SELECT';
          this.sfx('select');
        } else if (input.wasJustPressed('UP') || input.wasJustPressed('DOWN')) {
          if (moves.length > 2) {
            this.selectedMove = (this.selectedMove + 2) % Math.min(4, moves.length);
            this.sfx('select');
          }
        } else if (input.wasJustPressed('LEFT') || input.wasJustPressed('RIGHT')) {
          if (moves.length > 1) {
            this.selectedMove = (this.selectedMove % 2 === 0)
              ? Math.min(moves.length - 1, this.selectedMove + 1)
              : this.selectedMove - 1;
            this.sfx('select');
          }
        } else if (input.wasJustPressed('A')) {
          const move = moves[this.selectedMove];
          if (move) this.executeTurn(move);
        }
      }
    }

    confirmCommand() {
      this.sfx('click');
      if (this.selectedCommand === 0) {
        this.subState = 'MOVE_SELECT';
        this.selectedMove = 0;
      } else if (this.selectedCommand === 1) {
        if (this.engine.bagScreen) this.engine.bagScreen.open();
        else if (this.engine.textbox) this.engine.textbox.show('Il borsone è vuoto.');
      } else if (this.selectedCommand === 2) {
        if (this.engine.partyScreen) this.engine.partyScreen.open('switch');
      } else if (this.selectedCommand === 3) {
        if (this.engine.textbox) {
          this.engine.textbox.show('Ti ritiri dalla partita!', () => {
            this.engine.stateMachine.transition('OVERWORLD');
          });
        } else {
          this.engine.stateMachine.transition('OVERWORLD');
        }
      }
    }

    handlePointer(px, py) {
      if (this.engine.textbox && this.engine.textbox.isOpen) return false;
      if (this.engine.partyScreen && this.engine.partyScreen.isOpen) return false;
      if (this.engine.bagScreen && this.engine.bagScreen.isOpen) return false;
      const ui = global.EliseeGbaUi;
      if (!ui) return false;

      if (this.subState === 'COMMAND_SELECT') {
        const idx = ui.hitCommand(px, py);
        if (idx >= 0) {
          this.selectedCommand = idx;
          this.confirmCommand();
          return true;
        }
      } else if (this.subState === 'MOVE_SELECT') {
        const idx = ui.hitMove(px, py);
        if (idx >= 0) {
          const userP = this.getUserActive();
          const moves = (userP && userP.moves) || [];
          if (moves[idx]) {
            this.selectedMove = idx;
            this.executeTurn(moves[idx]);
            return true;
          }
        }
      }
      return false;
    }

    executeTurn(userMove) {
      this.subState = 'EXECUTE';
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      if (!userP || !enemyP || !userMove) {
        this.subState = 'COMMAND_SELECT';
        return;
      }
      if (userMove.currentPp != null && userMove.currentPp <= 0) {
        if (this.engine.textbox) this.engine.textbox.show('Non ci sono più PP per questa mossa!');
        this.subState = 'COMMAND_SELECT';
        return;
      }
      if (userMove.currentPp != null) userMove.currentPp -= 1;

      const pick = global.EliseeAIController && global.EliseeAIController.pickMove;
      const enemyMove = pick ? pick(enemyP, userP, this.context) : (enemyP.moves && enemyP.moves[0]);
      if (enemyMove && enemyMove.currentPp != null && enemyMove.currentPp > 0) {
        enemyMove.currentPp -= 1;
      }

      const userFirst = (userP.spd || 50) >= (enemyP.spd || 50);
      const firstActor = userFirst
        ? { p: userP, m: userMove, target: enemyP }
        : { p: enemyP, m: enemyMove, target: userP };
      const secondActor = userFirst
        ? { p: enemyP, m: enemyMove, target: userP }
        : { p: userP, m: userMove, target: enemyP };

      const turnMessages = [];
      const exec = global.EliseeMoveExecutor && global.EliseeMoveExecutor.execute;
      if (!exec) {
        this.subState = 'COMMAND_SELECT';
        return;
      }

      const res1 = exec(firstActor.p, firstActor.target, firstActor.m, this.context);
      turnMessages.push.apply(turnMessages, res1.log || []);

      if (!res1.fainted && secondActor.m) {
        const res2 = exec(secondActor.p, secondActor.target, secondActor.m, this.context);
        turnMessages.push.apply(turnMessages, res2.log || []);
      }

      this.engine.textbox.show(turnMessages, () => this.afterTurn());
    }

    afterTurn() {
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      if (enemyP && enemyP.currentHp <= 0) {
        const xp = 80 + (enemyP.level || 1) * 12;
        const msgs = [
          enemyP.name + ' è esausto!',
          (userP ? userP.name : 'Il tuo atleta') + ' ha ricevuto ' + xp + ' Punti Esperienza!'
        ];
        const nextEnemy = this.enemyParty.findIndex(function (p, i) {
          return p && p.currentHp > 0 && i !== this.enemyActiveIndex;
        }, this);
        if (nextEnemy >= 0) {
          this.engine.textbox.show(msgs.concat(['L\'avversario schiera ' + this.enemyParty[nextEnemy].name + '!']), () => {
            this.enemyActiveIndex = nextEnemy;
            this.subState = 'COMMAND_SELECT';
          });
        } else {
          this.engine.textbox.show(msgs.concat(['Hai vinto la partita!', 'Ottimo lavoro, mister!']), () => {
            this.engine.stateMachine.transition('OVERWORLD');
          });
        }
        return;
      }
      if (userP && userP.currentHp <= 0) {
        const alive = this.userParty.some(function (p) { return p && p.currentHp > 0; });
        if (alive && this.engine.partyScreen) {
          this.engine.textbox.show(userP.name + ' è esausto!', () => {
            this.engine.partyScreen.open('switch', { force: true });
          });
        } else {
          this.engine.textbox.show(['Tutti i tuoi giocatori sono esausti!', 'Torna in panchina a riorganizzarti.'], () => {
            this.healPartyAfterLoss();
            this.engine.stateMachine.transition('OVERWORLD');
          });
        }
        return;
      }
      this.subState = 'COMMAND_SELECT';
    }

    healPartyAfterLoss() {
      (this.userParty || []).forEach(function (p) {
        if (p && p.currentHp <= 0) p.currentHp = Math.max(1, Math.floor((p.hpMax || 1) * 0.25));
      });
    }

    update(dt) {}

    render(ctx) {
      const ui = global.EliseeGbaUi;
      const w = this.engine.canvas.width;
      const h = this.engine.canvas.height;
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();
      const bottomH = 96;
      const fieldH = h - bottomH;

      const sky = ctx.createLinearGradient(0, 0, 0, fieldH);
      sky.addColorStop(0, '#c8dce8');
      sky.addColorStop(0.45, '#e8dcc0');
      sky.addColorStop(1, '#d4c49a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, fieldH);

      ctx.fillStyle = '#c4b48a';
      ctx.fillRect(0, fieldH - 18, w, 18);

      const oppX = w * 0.70;
      const oppY = fieldH * 0.42;
      const userX = w * 0.26;
      const userY = fieldH * 0.88;
      if (ui) {
        ui.drawPlatform(ctx, oppX, oppY, 78, 22);
        ui.drawPlatform(ctx, userX, userY, 108, 30);
        if (enemyP && enemyP.currentHp > 0) {
          ui.drawFrontPlayer(ctx, oppX, oppY - 8, enemyP.jersey || '#1d4ed8', enemyP.hair);
        }
        if (userP && userP.currentHp > 0) {
          ui.drawBackPlayer(ctx, userX, userY - 6, userP.jersey || '#c8102e', userP.name);
        }
        if (enemyP) {
          ui.drawHudBox(ctx, 8, 18, 250, 52, {
            name: enemyP.name,
            gender: enemyP.gender || 'M',
            level: enemyP.level,
            hp: enemyP.currentHp,
            hpMax: enemyP.hpMax,
            showNumbers: false
          });
        }
        if (userP) {
          ui.drawHudBox(ctx, w - 268, fieldH - 78, 258, 68, {
            name: userP.name,
            gender: userP.gender || 'M',
            level: userP.level,
            hp: userP.currentHp,
            hpMax: userP.hpMax,
            showNumbers: true
          });
        }
      }

      const mx = 8;
      const my = h - bottomH + 4;
      const mw = w - 16;
      const mh = bottomH - 10;
      const textOpen = this.engine.textbox && this.engine.textbox.isOpen;
      if (textOpen) {
        ctx.fillStyle = '#d4c49a';
        ctx.fillRect(0, fieldH, w, bottomH);
        return;
      }
      if (this.subState === 'COMMAND_SELECT' && ui) {
        const promptName = userP ? userP.name : 'il giocatore';
        ui.drawCommandMenu(ctx, mx, my, mw, mh, this.selectedCommand, 'Cosa deve fare\n' + promptName + '?');
      } else if (this.subState === 'MOVE_SELECT' && ui) {
        ui.drawMoveMenu(ctx, mx, my, mw, mh, userP ? userP.moves : [], this.selectedMove);
      } else {
        ctx.fillStyle = '#d4c49a';
        ctx.fillRect(0, fieldH, w, bottomH);
      }
    }
  }

  global.EliseeBattleEngine = BattleEngine;
})(typeof window !== 'undefined' ? window : this);
