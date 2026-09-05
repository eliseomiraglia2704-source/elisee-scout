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

      // 1. Sfondo a gradiente: Prato verde diurno (Sez. 3)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#38bdf8');   // Cielo azzurro
      bgGrad.addColorStop(0.35, '#7dd3fc'); // Orizzonte luminoso
      bgGrad.addColorStop(0.36, '#15803d'); // Linea del campo
      bgGrad.addColorStop(0.65, '#166534'); // Erba centrale
      bgGrad.addColorStop(1, '#0f3d1e');    // Erba in primo piano
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Righe decorative del campo da calcio sullo sfondo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, h * 0.36, w, 2);
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.36, 45, 0, Math.PI, true);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Piattaforme di combattimento 3D (isole di terreno con prospettiva)
      // Piattaforma Avversario (in alto a destra)
      const oppX = w * 0.72;
      const oppY = h * 0.28;
      const oppRx = 95;
      const oppRy = 32;

      // Ombra piattaforma avversario
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(oppX, oppY + 12, oppRx + 4, oppRy + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spessore bordo inferiore 3D
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(oppX, oppY + 6, oppRx, oppRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Superficie superiore
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(oppX, oppY, oppRx, oppRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Piattaforma Giocatore proprio (in basso a sinistra)
      const userX = w * 0.28;
      const userY = h * 0.58;
      const userRx = 125;
      const userRy = 42;

      // Ombra piattaforma giocatore
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(userX, userY + 16, userRx + 6, userRy + 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spessore bordo inferiore 3D
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(userX, userY + 8, userRx, userRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Superficie superiore
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(userX, userY, userRx, userRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Sprite Calciatori (proporzioni umane 2:3 stilizzati)
      const userP = this.getUserActive();
      const enemyP = this.getEnemyActive();

      // Sprite Avversario (in piedi su piattaforma oppX, oppY)
      if (enemyP && enemyP.currentHp > 0) {
        const sw = 36;
        const sh = 56;
        const sx = oppX - sw / 2;
        const sy = oppY - sh + 8;

        // Ombra ai piedi
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(oppX, oppY + 4, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo avversario (testa, maglia rossa, pantaloncini bianchi)
        ctx.fillStyle = '#dc2626'; // Maglia rossa
        ctx.fillRect(sx + 6, sy + 16, sw - 12, 22);
        ctx.fillStyle = '#ffffff'; // Pantaloncini
        ctx.fillRect(sx + 8, sy + 38, sw - 16, 10);
        ctx.fillStyle = '#fca5a5'; // Gambe/Viso
        ctx.fillRect(sx + 10, sy + 48, 5, 8);
        ctx.fillRect(sx + sw - 15, sy + 48, 5, 8);
        ctx.fillRect(sx + 10, sy + 2, sw - 20, 14);
        ctx.fillStyle = '#1e293b'; // Capelli
        ctx.fillRect(sx + 8, sy, sw - 16, 6);
        ctx.fillRect(sx + 8, sy, 4, 10);
      }

      // Sprite Giocatore proprio (visto di spalle, in primo piano su userX, userY)
      if (userP && userP.currentHp > 0) {
        const sw = 48;
        const sh = 72;
        const sx = userX - sw / 2;
        const sy = userY - sh + 12;

        // Ombra ai piedi
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(userX, userY + 8, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo giocatore (visto di spalle: nuca, maglia azzurra col numero 10 oro, pantaloncini neri)
        ctx.fillStyle = '#0284c7'; // Maglia azzurra
        ctx.fillRect(sx + 8, sy + 20, sw - 16, 28);
        ctx.fillStyle = '#facc15'; // Numero 10 sul retro
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('10', userX, sy + 38);

        ctx.fillStyle = '#0f172a'; // Pantaloncini scuri
        ctx.fillRect(sx + 10, sy + 48, sw - 20, 14);
        ctx.fillStyle = '#f87171'; // Gambe
        ctx.fillRect(sx + 12, sy + 62, 7, 10);
        ctx.fillRect(sx + sw - 19, sy + 62, 7, 10);
        ctx.fillStyle = '#1e293b'; // Nuca / Capelli visti da dietro
        ctx.fillRect(sx + 12, sy + 2, sw - 24, 18);
      }

      // 4. Box Nome / HP (stile scheda con bordo netto retro)
      if (enemyP) {
        // Box Avversario (in alto a sinistra)
        const bx = 16;
        const by = 16;
        const bw = 220;
        const bh = 54;

        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(enemyP.name, bx + 10, by + 18);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Lv.${enemyP.level || 5}`, bx + bw - 48, by + 18);

        // Barra HP
        const hpPct = Math.max(0, Math.min(1, enemyP.currentHp / (enemyP.hpMax || 50)));
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('HP', bx + 10, by + 36);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx + 32, by + 28, bw - 42, 10);
        ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(bx + 32, by + 28, Math.floor((bw - 42) * hpPct), 10);
      }

      if (userP) {
        // Box Giocatore proprio (in basso a destra)
        const bx = w - 236;
        const by = h * 0.40;
        const bw = 220;
        const bh = 64;

        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(userP.name, bx + 10, by + 18);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Lv.${userP.level || 5}`, bx + bw - 48, by + 18);

        // Barra HP
        const hpPct = Math.max(0, Math.min(1, userP.currentHp / (userP.hpMax || 50)));
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('HP', bx + 10, by + 36);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx + 32, by + 28, bw - 42, 10);
        ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(bx + 32, by + 28, Math.floor((bw - 42) * hpPct), 10);

        // Testo HP numerico
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${userP.currentHp}/${userP.hpMax || 50} HP`, bx + bw - 10, by + 52);
      }

      // 5. Menu Comandi / Mosse (in basso)
      if (this.subState === 'COMMAND_SELECT') {
        const menuY = h - 140;
        const menuH = 124;
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(16, menuY, w - 32, menuH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, menuY, w - 32, menuH);

        const btns = [
          { label: 'TATTICA', x: 26, y: menuY + 14, col: '#f43f5e' },
          { label: 'BORSONE', x: w / 2 + 6, y: menuY + 14, col: '#f97316' },
          { label: 'PANCHINA', x: 26, y: menuY + 66, col: '#22c55e' },
          { label: 'RUN', x: w / 2 + 6, y: menuY + 66, col: '#3b82f6' }
        ];

        btns.forEach((b, idx) => {
          const isSel = this.selectedCommand === idx;
          ctx.fillStyle = isSel ? b.col : '#1e293b';
          ctx.fillRect(b.x, b.y, w / 2 - 32, 44);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'left';
          ctx.fillText((isSel ? '▶ ' : '') + b.label, b.x + 12, b.y + 27);
        });
      } else if (this.subState === 'MOVE_SELECT') {
        const menuY = h - 140;
        const menuH = 124;
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(16, menuY, w - 32, menuH);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, menuY, w - 32, menuH);

        const moves = userP ? userP.moves || [] : [];
        moves.forEach((m, idx) => {
          const isSel = this.selectedMove === idx;
          const colX = (idx % 2 === 0) ? 26 : w / 2 + 6;
          const rowY = (idx < 2) ? menuY + 14 : menuY + 66;

          ctx.fillStyle = isSel ? '#166534' : '#1e293b';
          ctx.fillRect(colX, rowY, w / 2 - 32, 44);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'left';
          ctx.fillText((isSel ? '▶ ' : '') + m.name, colX + 8, rowY + 20);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`${m.type} · ${m.currentPp || m.pp || 15} PP`, colX + 8, rowY + 35);
        });
      }
    }
  }

  global.EliseeBattleEngine = BattleEngine;
})(typeof window !== 'undefined' ? window : this);
