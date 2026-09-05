/**
 * ELISEE WORLD — BATTLE ENGINE
 * State machine completa per la battaglia a turni retro 16-bit:
 * BATTLE_INTRO -> COMMAND_SELECT -> [TATTICA / BORSONE / PANCHINA / RUN] -> EXECUTE_TURN -> BATTLE_END
 */
(function (global) {
  'use strict';

  function BattleEngine(engine) {
    this.engine = engine;
    this.active = false;
    this.trainer = null;
    this.opponentTeam = [];
    this.opponentIndex = 0;
    this.playerIndex = 0;

    // Sub-states: 'INTRO' | 'COMMANDS' | 'MOVES' | 'ITEMS' | 'PARTY' | 'EXECUTING' | 'END'
    this.state = 'INTRO';
    this.selectedCommand = 0; // 0: TATTICA, 1: BORSONE, 2: PANCHINA, 3: RUN
    this.selectedMoveIndex = 0;
    this.selectedItemIndex = 0;
    this.selectedPartyIndex = 0;

    this.battleContext = {
      momentum: 50,
      formation: null,
      weather: null,
      isHomeGround: true
    };

    this.animTime = 0;
    this.shakePlayer = 0;
    this.shakeOpponent = 0;
    this.floatDamage = null; // { text, x, y, time, color }
  }

  BattleEngine.prototype.startBattle = function (trainerData, wildPlayer) {
    this.active = true;
    this.state = 'INTRO';
    this.trainer = trainerData || null;
    this.selectedCommand = 0;
    this.selectedMoveIndex = 0;
    this.battleContext.momentum = 50;

    if (trainerData && trainerData.squadra && trainerData.squadra.length) {
      this.opponentTeam = JSON.parse(JSON.stringify(trainerData.squadra));
    } else if (wildPlayer) {
      this.opponentTeam = [JSON.parse(JSON.stringify(wildPlayer))];
    } else {
      // Fallback opponent
      this.opponentTeam = [{
        id: 'wild_scout',
        nome: 'Talento In Attesa',
        ruolo: 'PUNTA',
        tipi: ['PUNTA'],
        livello: 12,
        hp_max: 55,
        hp: 55,
        attacco: 45,
        difesa: 40,
        att_sp: 40,
        dif_sp: 38,
        velocita: 50,
        mosse: ['tunnel', 'tiro_a_giro']
      }];
    }
    this.opponentIndex = 0;

    // Trova il primo giocatore abile del player
    this.playerIndex = 0;
    var party = this.engine.party;
    for (var i = 0; i < party.length; i++) {
      if (party[i].hp > 0) {
        this.playerIndex = i;
        break;
      }
    }

    var activePlayer = this.getActivePlayer();
    var opp = this.getActiveOpponent();

    if (global.EliseeAudio) global.EliseeAudio.playSFX('battle_start');

    var introText = this.trainer ?
      'Inizia la partita contro ' + this.trainer.nome + ' (' + (this.trainer.titolo || 'Mister') + ')!' :
      'È apparso un ' + opp.nome + ' selvatico da visionare!';

    var self = this;
    this.engine.textbox.say(introText, 'TELECRONACA', 'accent', function () {
      self.state = 'COMMANDS';
      self.engine.textbox.say('Cosa deve fare ' + activePlayer.nome + '?', 'MISTER', 'normal');
    });
  };

  BattleEngine.prototype.getActivePlayer = function () {
    return this.engine.party[this.playerIndex] || this.engine.party[0];
  };

  BattleEngine.prototype.getActiveOpponent = function () {
    return this.opponentTeam[this.opponentIndex] || this.opponentTeam[0];
  };

  BattleEngine.prototype.update = function (dt, input) {
    if (!this.active) return;
    this.animTime += dt;

    if (this.shakePlayer > 0) this.shakePlayer -= dt * 0.05;
    if (this.shakeOpponent > 0) this.shakeOpponent -= dt * 0.05;
    if (this.floatDamage) {
      this.floatDamage.time -= dt;
      this.floatDamage.y -= 0.5;
      if (this.floatDamage.time <= 0) this.floatDamage = null;
    }

    var activePlayer = this.getActivePlayer();
    var opp = this.getActiveOpponent();
    var self = this;

    // Gestione comandi in base allo stato
    if (this.state === 'COMMANDS') {
      if (input.isJustPressed('UP') || input.isJustPressed('DOWN')) {
        this.selectedCommand = (this.selectedCommand + 2) % 4;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('LEFT') || input.isJustPressed('RIGHT')) {
        if (this.selectedCommand % 2 === 0) this.selectedCommand += 1;
        else this.selectedCommand -= 1;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      }

      if (input.isJustPressed('A')) {
        if (global.EliseeAudio) global.EliseeAudio.playSFX('confirm');
        if (this.selectedCommand === 0) {
          // TATTICA (Mosse)
          this.state = 'MOVES';
          this.selectedMoveIndex = 0;
        } else if (this.selectedCommand === 1) {
          // BORSONE (Items)
          this.state = 'ITEMS';
          this.selectedItemIndex = 0;
        } else if (this.selectedCommand === 2) {
          // PANCHINA (Party switch)
          this.state = 'PARTY';
          this.selectedPartyIndex = 0;
        } else if (this.selectedCommand === 3) {
          // RUN (Fuga)
          this.executeRun();
        }
      }
    } else if (this.state === 'MOVES') {
      var moveCount = activePlayer.mosse.length;
      if (input.isJustPressed('UP')) {
        this.selectedMoveIndex = (this.selectedMoveIndex - 1 + moveCount) % moveCount;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('DOWN')) {
        this.selectedMoveIndex = (this.selectedMoveIndex + 1) % moveCount;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('B')) {
        if (global.EliseeAudio) global.EliseeAudio.playSFX('cancel');
        this.state = 'COMMANDS';
      } else if (input.isJustPressed('A')) {
        var moveKey = activePlayer.mosse[this.selectedMoveIndex];
        var moveData = this.engine.movesDb[moveKey] || { id: moveKey, nome: moveKey, potenza: 50, tipo: activePlayer.ruolo };
        this.executeTurnWithMove(moveData);
      }
    } else if (this.state === 'ITEMS') {
      var bag = this.engine.bag || [];
      if (input.isJustPressed('UP') && bag.length > 0) {
        this.selectedItemIndex = (this.selectedItemIndex - 1 + bag.length) % bag.length;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('DOWN') && bag.length > 0) {
        this.selectedItemIndex = (this.selectedItemIndex + 1) % bag.length;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('B')) {
        if (global.EliseeAudio) global.EliseeAudio.playSFX('cancel');
        this.state = 'COMMANDS';
      } else if (input.isJustPressed('A') && bag.length > 0) {
        var item = bag[this.selectedItemIndex];
        this.useItemInBattle(item);
      }
    } else if (this.state === 'PARTY') {
      var party = this.engine.party;
      if (input.isJustPressed('UP')) {
        this.selectedPartyIndex = (this.selectedPartyIndex - 1 + party.length) % party.length;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('DOWN')) {
        this.selectedPartyIndex = (this.selectedPartyIndex + 1) % party.length;
        if (global.EliseeAudio) global.EliseeAudio.playSFX('select');
      } else if (input.isJustPressed('B')) {
        if (global.EliseeAudio) global.EliseeAudio.playSFX('cancel');
        this.state = 'COMMANDS';
      } else if (input.isJustPressed('A')) {
        var targetP = party[this.selectedPartyIndex];
        if (targetP.hp <= 0) {
          this.engine.textbox.say(targetP.nome + ' è esausto (FNT) e non può scendere in campo!', 'STAFF', 'alert');
        } else if (this.selectedPartyIndex === this.playerIndex) {
          this.engine.textbox.say(targetP.nome + ' è già in campo!', 'STAFF', 'normal');
        } else {
          this.switchPlayer(this.selectedPartyIndex);
        }
      }
    }
  };

  BattleEngine.prototype.executeTurnWithMove = function (playerMove) {
    this.state = 'EXECUTING';
    var self = this;
    var player = this.getActivePlayer();
    var opp = this.getActiveOpponent();

    // IA sceglie la mossa avversaria
    var aiMove = global.EliseeAIController ?
      global.EliseeAIController.chooseMove(opp, player, this.engine.movesDb, this.battleContext) :
      { id: 'attacco', nome: 'Bordata', potenza: 45, tipo: opp.ruolo };

    // Calcolo ordine turni in base alla Velocità
    var playerFirst = (player.velocita || 50) >= (opp.velocita || 45);

    var first = playerFirst ? { actor: player, target: opp, move: playerMove, isPlayer: true } :
                              { actor: opp, target: player, move: aiMove, isPlayer: false };
    var second = playerFirst ? { actor: opp, target: player, move: aiMove, isPlayer: false } :
                               { actor: player, target: opp, move: playerMove, isPlayer: true };

    // Esegui primo attacco
    this.executeSingleAttack(first, function () {
      if (second.actor.hp <= 0) {
        // Avversario o player andato KO
        self.handleFaint(second.actor, second.isPlayer);
      } else {
        // Esegui secondo attacco
        self.executeSingleAttack(second, function () {
          if (first.actor.hp <= 0) {
            self.handleFaint(first.actor, first.isPlayer);
          } else {
            // Turno completato con entrambi vivi
            self.state = 'COMMANDS';
            self.engine.textbox.say('Cosa deve fare ' + self.getActivePlayer().nome + '?', 'MISTER', 'normal');
          }
        });
      }
    });
  };

  BattleEngine.prototype.executeSingleAttack = function (turnData, callback) {
    var self = this;
    var actor = turnData.actor;
    var target = turnData.target;
    var move = turnData.move;
    var isPlayer = turnData.isPlayer;

    if (global.EliseeAudio) global.EliseeAudio.playSFX('select');

    var actionText = actor.nome + ' usa ' + move.nome + '!';
    this.engine.textbox.say(actionText, 'TELECRONACA', isPlayer ? 'normal' : 'alert', function () {
      // Calcolo danno
      var result = global.EliseeDamageCalc ?
        global.EliseeDamageCalc.calculateDamage({
          attacker: actor,
          defender: target,
          move: move,
          momentum: self.battleContext.momentum
        }) : { dmg: 20, isCrit: false, isMiss: false, typeMult: 1.0, message: '' };

      if (result.isMiss) {
        if (global.EliseeAudio) global.EliseeAudio.playSFX('miss');
        self.engine.textbox.say('Ma non combina nulla! Il tiro finisce a lato.', 'TELECRONACA', 'normal', callback);
        return;
      }

      // Applica danno
      target.hp = Math.max(0, target.hp - result.dmg);

      // Trigger animazioni
      if (isPlayer) {
        self.shakeOpponent = 12;
        self.floatDamage = { text: '-' + result.dmg, x: 380, y: 120, time: 800, color: '#ef4444' };
        self.battleContext.momentum = Math.min(100, self.battleContext.momentum + (result.isCrit ? 15 : 6));
      } else {
        self.shakePlayer = 12;
        self.floatDamage = { text: '-' + result.dmg, x: 140, y: 280, time: 800, color: '#ef4444' };
        self.battleContext.momentum = Math.max(0, self.battleContext.momentum - (result.isCrit ? 15 : 6));
      }

      if (result.isCrit && global.EliseeAudio) global.EliseeAudio.playSFX('crit');
      else if (global.EliseeAudio) global.EliseeAudio.playSFX('hit');

      // Messaggio di efficacia
      var extraMsg = '';
      if (result.isCrit) extraMsg += ' Azione da fuoriclasse (Colpo Critico)!';
      if (result.message) extraMsg += ' ' + result.message;

      if (extraMsg) {
        self.engine.textbox.say(extraMsg.trim(), 'TELECRONACA', isPlayer ? 'accent' : 'alert', callback);
      } else {
        setTimeout(callback, 250);
      }
    });
  };

  BattleEngine.prototype.handleFaint = function (faintedActor, isPlayer) {
    var self = this;
    if (global.EliseeAudio) global.EliseeAudio.playSFX('faint');

    var faintText = faintedActor.nome + ' è esausto e non può proseguire!';
    this.engine.textbox.say(faintText, 'TELECRONACA', 'alert', function () {
      if (!isPlayer) {
        // KO avversario
        self.opponentIndex++;
        if (self.opponentIndex < self.opponentTeam.length) {
          var nextOpp = self.getActiveOpponent();
          var sendMsg = self.trainer ?
            self.trainer.nome + ' sta per schierare ' + nextOpp.nome + '!' :
            'Scende in campo ' + nextOpp.nome + '!';
          self.engine.textbox.say(sendMsg, 'TELECRONACA', 'normal', function () {
            self.state = 'COMMANDS';
            self.engine.textbox.say('Cosa deve fare ' + self.getActivePlayer().nome + '?', 'MISTER', 'normal');
          });
        } else {
          // VITTORIA TOTALE BATTAGLIA
          self.handleVictory();
        }
      } else {
        // KO player
        var hasAlive = false;
        for (var i = 0; i < self.engine.party.length; i++) {
          if (self.engine.party[i].hp > 0) {
            hasAlive = true;
            break;
          }
        }
        if (hasAlive) {
          self.state = 'PARTY';
          self.engine.textbox.say('Scegli il prossimo giocatore da schierare dalla Panchina!', 'MISTER', 'normal');
        } else {
          // SCONFITTA TOTALE
          self.handleDefeat();
        }
      }
    });
  };

  BattleEngine.prototype.handleVictory = function () {
    var self = this;
    if (global.EliseeAudio) global.EliseeAudio.playSFX('victory');

    var expGain = (this.trainer ? this.trainer.ricompensa_forma : 60) || 50;
    var activeP = this.getActivePlayer();
    activeP.livello = (activeP.livello || 15) + 1;
    activeP.hp_max = (activeP.hp_max || 70) + 4;
    activeP.attacco = (activeP.attacco || 50) + 2;
    activeP.difesa = (activeP.difesa || 50) + 2;

    var quote = this.trainer ? (' "' + this.trainer.frase_sconfitta + '"') : '';
    var winMsg = 'Vittoria straordinaria!' + quote + ' ' + activeP.nome + ' sale al Liv. ' + activeP.livello + ' (+Punti Forma)!';

    this.engine.textbox.say(winMsg, 'FINALE GARA', 'accent', function () {
      self.endBattle(true);
    });
  };

  BattleEngine.prototype.handleDefeat = function () {
    var self = this;
    this.engine.textbox.say('Non hai più giocatori da schierare! La partita si conclude qui.', 'ARBITRO', 'alert', function () {
      // Cura automatica rosa per ripresa
      for (var i = 0; i < self.engine.party.length; i++) {
        self.engine.party[i].hp = self.engine.party[i].hp_max;
      }
      self.endBattle(false);
    });
  };

  BattleEngine.prototype.executeRun = function () {
    var self = this;
    if (this.trainer) {
      this.engine.textbox.say('Non puoi ritirare la squadra da una gara ufficiale contro un Allenatore!', 'ARBITRO', 'alert');
    } else {
      this.engine.textbox.say('Squadra rientrata negli spogliatoi senza conseguenze.', 'MISTER', 'normal', function () {
        self.endBattle(false);
      });
    }
  };

  BattleEngine.prototype.switchPlayer = function (newIndex) {
    var self = this;
    var prev = this.getActivePlayer();
    this.playerIndex = newIndex;
    var next = this.getActivePlayer();

    if (global.EliseeAudio) global.EliseeAudio.playSFX('confirm');
    this.state = 'EXECUTING';

    var msg = prev.hp > 0 ?
      'Ottimo lavoro ' + prev.nome + '! Torna in panchina! Vai ' + next.nome + '!' :
      'È il tuo momento, ' + next.nome + '! Scendi in campo!';

    this.engine.textbox.say(msg, 'MISTER', 'accent', function () {
      self.state = 'COMMANDS';
      self.engine.textbox.say('Cosa deve fare ' + next.nome + '?', 'MISTER', 'normal');
    });
  };

  BattleEngine.prototype.useItemInBattle = function (item) {
    var self = this;
    var activeP = this.getActivePlayer();
    var opp = this.getActiveOpponent();

    if (item.categoria === 'Cura') {
      activeP.hp = Math.min(activeP.hp_max, activeP.hp + (item.effetto.valore || 30));
      item.quantita = Math.max(0, item.quantita - 1);
      if (global.EliseeAudio) global.EliseeAudio.playSFX('confirm');
      this.state = 'EXECUTING';
      this.engine.textbox.say('Hai usato ' + item.nome + '! ' + activeP.nome + ' recupera energie.', 'STAFF', 'accent', function () {
        self.state = 'COMMANDS';
      });
    } else if (item.categoria === 'Contratti') {
      if (this.trainer) {
        this.engine.textbox.say('Non puoi tesserare un giocatore già sotto contratto con un club avversario!', 'PROCURATORE', 'alert');
        return;
      }
      item.quantita = Math.max(0, item.quantita - 1);
      this.state = 'EXECUTING';

      // Probabilità di firma mercato
      var hpRatio = opp.hp / opp.hp_max;
      var catchChance = (1.0 - hpRatio * 0.7) * (item.effetto.tasso || 1.0);
      var success = Math.random() < catchChance;

      this.engine.textbox.say('Hai presentato un ' + item.nome + ' a ' + opp.nome + '...', 'CALCIOMERCATO', 'normal', function () {
        if (success) {
          if (global.EliseeAudio) global.EliseeAudio.playSFX('victory');
          self.engine.party.push(JSON.parse(JSON.stringify(opp)));
          self.engine.textbox.say('ACCORDO TROVATO! ' + opp.nome + ' ha firmato e si unisce alla tua rosa!', 'CALCIOMERCATO', 'accent', function () {
            self.endBattle(true);
          });
        } else {
          if (global.EliseeAudio) global.EliseeAudio.playSFX('miss');
          self.engine.textbox.say('Trattativa sfumata! ' + opp.nome + ' ha rifiutato la proposta.', 'CALCIOMERCATO', 'alert', function () {
            self.state = 'COMMANDS';
          });
        }
      });
    }
  };

  BattleEngine.prototype.endBattle = function (won) {
    this.active = false;
    this.state = 'END';
    if (global.EliseeSaveManager) {
      global.EliseeSaveManager.save(this.engine.getSaveState());
    }
    this.engine.stateMachine.transition('OVERWORLD');
  };

  BattleEngine.prototype.render = function (ctx, canvasWidth, canvasHeight) {
    if (!this.active) return;

    var activePlayer = this.getActivePlayer();
    var opp = this.getActiveOpponent();

    ctx.save();

    // 1. Sfondo Stadio Notturno Retro
    var grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#030712');
    grad.addColorStop(0.55, '#0c1a30');
    grad.addColorStop(0.56, '#14532d');
    grad.addColorStop(1, '#052e16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Riflettori stadio
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(40, 0); ctx.lineTo(160, 260); ctx.lineTo(260, 260); ctx.lineTo(120, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 40, 0); ctx.lineTo(canvasWidth - 160, 260); ctx.lineTo(canvasWidth - 260, 260); ctx.lineTo(canvasWidth - 120, 0);
    ctx.fill();

    // Linea campo di gioco
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * 0.56);
    ctx.lineTo(canvasWidth, canvasHeight * 0.56);
    ctx.stroke();

    // 2. Piattaforma Avversario (in alto a destra)
    var oppX = 390 + (this.shakeOpponent > 0 ? (Math.random() - 0.5) * this.shakeOpponent : 0);
    var oppY = 160;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.ellipse(oppX, oppY + 25, 60, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sprite Avversario (Fronte)
    this.drawOpponentSprite(ctx, oppX, oppY, opp);

    // 3. Piattaforma Giocatore Proprio (in basso a sinistra)
    var plX = 140 + (this.shakePlayer > 0 ? (Math.random() - 0.5) * this.shakePlayer : 0);
    var plY = 270;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.ellipse(plX, plY + 25, 70, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sprite Giocatore Proprio (Retro/Spalle)
    this.drawPlayerBackSprite(ctx, plX, plY, activePlayer);

    // 4. HUD Barre HP e Statistiche
    this.drawOpponentHUD(ctx, 30, 30, opp);
    this.drawPlayerHUD(ctx, canvasWidth - 240, canvasHeight * 0.44, activePlayer);

    // 5. Barra Momentum (sez. 25.1)
    this.drawMomentumBar(ctx, canvasWidth / 2 - 80, 12, 160, 10);

    // 6. Floating Damage
    if (this.floatDamage) {
      ctx.fillStyle = this.floatDamage.color;
      ctx.font = 'bold 20px "Outfit", monospace, sans-serif';
      ctx.fillText(this.floatDamage.text, this.floatDamage.x, this.floatDamage.y);
    }

    // 7. Menu Comandi / Sottomenu
    if (this.state === 'COMMANDS') {
      this.drawCommandMenu(ctx, canvasWidth, canvasHeight);
    } else if (this.state === 'MOVES') {
      this.drawMovesSubmenu(ctx, canvasWidth, canvasHeight, activePlayer);
    } else if (this.state === 'ITEMS') {
      this.drawItemsSubmenu(ctx, canvasWidth, canvasHeight);
    } else if (this.state === 'PARTY') {
      this.drawPartySubmenu(ctx, canvasWidth, canvasHeight);
    }

    ctx.restore();
  };

  BattleEngine.prototype.drawOpponentSprite = function (ctx, x, y, opp) {
    ctx.save();
    // Maglia avversaria (Rosso/Nero o Bianco/Nero)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x - 16, y - 24, 32, 28);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 12, y - 20, 24, 6);

    // Carnagione & Capelli
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(x - 12, y - 42, 24, 18);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 14, y - 46, 28, 8);

    // Occhi
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 8, y - 34, 4, 4);
    ctx.fillRect(x + 4, y - 34, 4, 4);

    // Gambe & Scarpe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 14, y + 4, 10, 16);
    ctx.fillRect(x + 4, y + 4, 10, 16);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 16, y + 16, 12, 6);
    ctx.fillRect(x + 4, y + 16, 12, 6);

    ctx.restore();
  };

  BattleEngine.prototype.drawPlayerBackSprite = function (ctx, x, y, player) {
    ctx.save();
    // Giocatore visto di spalle (Maglia Azzurro Elisee)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 22, y - 30, 44, 36);

    // Nome e Numero stilizzato sulla schiena
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Outfit", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10', x, y - 10);
    ctx.textAlign = 'start';

    // Capelli visti da dietro
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x - 18, y - 56, 36, 26);

    // Gambe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 18, y + 6, 14, 20);
    ctx.fillRect(x + 4, y + 6, 14, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 20, y + 20, 16, 8);
    ctx.fillRect(x + 4, y + 20, 16, 8);

    ctx.restore();
  };

  BattleEngine.prototype.drawOpponentHUD = function (ctx, x, y, opp) {
    var boxW = 200;
    var boxH = 56;

    ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeRect(x, y, boxW, boxH);

    // Nome e Livello
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
    ctx.fillText(opp.nome, x + 8, y + 18);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
    ctx.fillText('Lv.' + (opp.livello || 15), x + boxW - 42, y + 18);

    // Barra HP
    var barW = 140;
    var barH = 8;
    var barX = x + 48;
    var barY = y + 26;

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px "Outfit", monospace, sans-serif';
    ctx.fillText('HP', x + 8, barY + 7);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    var hpRatio = Math.max(0, Math.min(1, opp.hp / opp.hp_max));
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.2 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Eliball icons per la squadra avversaria (sez. 3 design doc)
    for (var i = 0; i < this.opponentTeam.length; i++) {
      var alive = this.opponentTeam[i].hp > 0;
      ctx.fillStyle = alive ? '#38bdf8' : '#475569';
      ctx.beginPath();
      ctx.arc(x + 12 + i * 14, y + 44, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  BattleEngine.prototype.drawPlayerHUD = function (ctx, x, y, player) {
    var boxW = 210;
    var boxH = 64;

    ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeRect(x, y, boxW, boxH);

    // Nome e Ruolo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
    ctx.fillText(player.nome, x + 8, y + 18);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
    ctx.fillText('Lv.' + (player.livello || 15), x + boxW - 42, y + 18);

    // Barra HP
    var barW = 140;
    var barH = 8;
    var barX = x + 48;
    var barY = y + 26;

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px "Outfit", monospace, sans-serif';
    ctx.fillText('HP', x + 8, barY + 7);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    var hpRatio = Math.max(0, Math.min(1, player.hp / player.hp_max));
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.2 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Valore HP testuale
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px "Outfit", monospace, sans-serif';
    ctx.fillText(player.hp + '/' + player.hp_max, x + boxW - 64, y + 48);

    // Barra Punti Forma (EXP)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 48, y + 52, barW * 0.65, 3);
  };

  BattleEngine.prototype.drawMomentumBar = function (ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    var ratio = Math.max(0, Math.min(1, this.battleContext.momentum / 100));
    var grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#22c55e');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, (w - 4) * ratio, h - 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Outfit", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOMENTUM ' + Math.round(this.battleContext.momentum) + '%', x + w / 2, y + h - 2);
    ctx.textAlign = 'start';
  };

  BattleEngine.prototype.drawCommandMenu = function (ctx, canvasWidth, canvasHeight) {
    var menuW = 260;
    var menuH = 100;
    var x = canvasWidth - menuW - 16;
    var y = canvasHeight - menuH - 16;

    var cmds = [
      { id: 0, label: 'TATTICA', color: '#ec4899', desc: 'Sferra un attacco' },
      { id: 1, label: 'BORSONE', color: '#f97316', desc: 'Usa oggetti o contratti' },
      { id: 2, label: 'PANCHINA', color: '#22c55e', desc: 'Cambia giocatore' },
      { id: 3, label: 'RUN', color: '#3b82f6', desc: 'Rientra negli spogliatoi' }
    ];

    var btnW = (menuW - 12) / 2;
    var btnH = (menuH - 12) / 2;

    for (var i = 0; i < cmds.length; i++) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      var bx = x + col * (btnW + 8);
      var by = y + row * (btnH + 8);
      var isSelected = (this.selectedCommand === i);

      ctx.fillStyle = isSelected ? cmds[i].color : '#0f172a';
      ctx.strokeStyle = isSelected ? '#ffffff' : cmds[i].color;
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeRect(bx, by, btnW, btnH);

      ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
      ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cmds[i].label, bx + btnW / 2, by + btnH / 2 + 5);
      ctx.textAlign = 'start';
    }
  };

  BattleEngine.prototype.drawMovesSubmenu = function (ctx, canvasWidth, canvasHeight, activePlayer) {
    var menuW = canvasWidth - 32;
    var menuH = 110;
    var x = 16;
    var y = canvasHeight - menuH - 16;

    ctx.fillStyle = '#050a14';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, menuW, menuH);
    ctx.strokeRect(x, y, menuW, menuH);

    var moves = activePlayer.mosse || [];
    var colW = (menuW - 180) / 2;

    for (var i = 0; i < moves.length; i++) {
      var moveKey = moves[i];
      var m = this.engine.movesDb[moveKey] || { nome: moveKey, tipo: activePlayer.ruolo, potenza: 40, precisione: 90 };
      var isSelected = (this.selectedMoveIndex === i);

      var mx = x + 16 + (i % 2) * colW;
      var my = y + 26 + Math.floor(i / 2) * 36;

      if (isSelected) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.fillRect(mx - 4, my - 16, colW - 8, 28);
        ctx.fillStyle = '#ec4899';
        ctx.fillText('▶', mx - 12, my + 2);
      }

      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
      ctx.fillText(m.nome, mx + 4, my + 2);

      // Badge tipo
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(mx + colW - 55, my - 12, 38, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Outfit", monospace, sans-serif';
      ctx.fillText(m.tipo || 'ALA', mx + colW - 48, my);
    }

    // Info panel a destra
    var selectedMove = this.engine.movesDb[moves[this.selectedMoveIndex]] || {};
    var infoX = x + menuW - 160;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
    ctx.fillText('POTENZA: ' + (selectedMove.potenza || '-'), infoX, y + 30);
    ctx.fillText('PRECISIONE: ' + (selectedMove.precisione || 100) + '%', infoX, y + 52);
    ctx.fillText('ENERGIA: ' + (selectedMove.energia || 15), infoX, y + 74);
  };

  BattleEngine.prototype.drawItemsSubmenu = function (ctx, canvasWidth, canvasHeight) {
    var menuW = canvasWidth - 32;
    var menuH = 110;
    var x = 16;
    var y = canvasHeight - menuH - 16;

    ctx.fillStyle = '#050a14';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, menuW, menuH);
    ctx.strokeRect(x, y, menuW, menuH);

    var bag = this.engine.bag || [];
    if (!bag.length) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Outfit", monospace, sans-serif';
      ctx.fillText('Il borsone è vuoto! (Premi B per tornare)', x + 20, y + 45);
      return;
    }

    for (var i = 0; i < Math.min(3, bag.length); i++) {
      var item = bag[i];
      var isSelected = (this.selectedItemIndex === i);
      var iy = y + 26 + i * 26;

      if (isSelected) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
        ctx.fillRect(x + 12, iy - 16, menuW - 24, 24);
        ctx.fillStyle = '#f97316';
        ctx.fillText('▶', x + 16, iy + 2);
      }

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 12px "Outfit", monospace, sans-serif';
      ctx.fillText(item.nome + ' (x' + item.quantita + ')', x + 34, iy + 2);
    }
  };

  BattleEngine.prototype.drawPartySubmenu = function (ctx, canvasWidth, canvasHeight) {
    var menuW = canvasWidth - 32;
    var menuH = 110;
    var x = 16;
    var y = canvasHeight - menuH - 16;

    ctx.fillStyle = '#050a14';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, menuW, menuH);
    ctx.strokeRect(x, y, menuW, menuH);

    var party = this.engine.party || [];
    for (var i = 0; i < Math.min(4, party.length); i++) {
      var p = party[i];
      var isSelected = (this.selectedPartyIndex === i);
      var py = y + 24 + i * 22;

      if (isSelected) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.fillRect(x + 12, py - 14, menuW - 24, 20);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('▶', x + 16, py + 2);
      }

      ctx.fillStyle = p.hp <= 0 ? '#ef4444' : (isSelected ? '#ffffff' : '#cbd5e1');
      ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
      var statusTag = p.hp <= 0 ? ' [FNT]' : (' HP: ' + p.hp + '/' + p.hp_max);
      ctx.fillText(p.nome + ' (Lv.' + p.livello + ')' + statusTag, x + 34, py + 2);
    }
  };

  global.EliseeBattleEngine = BattleEngine;

})(typeof window !== 'undefined' ? window : this);
