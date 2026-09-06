/**
 * ELISEE WORLD — Party Screen GBA
 * Griglia 2x3, box verdi, selezione rossa, «Che fare con X?» + CANCEL.
 */
(function (global) {
  'use strict';

  class PartyScreen {
    constructor(engine) {
      this.engine = engine;
      this.selectedIndex = 0;
      this.isOpen = false;
      this.mode = 'menu';
      this.forceSelect = false;
      this.party = [];
    }

    getParty() {
      if (this.engine && this.engine.playerParty && this.engine.playerParty.length) {
        return this.engine.playerParty;
      }
      return this.party;
    }

    open(mode, opts) {
      this.isOpen = true;
      this.mode = mode || 'menu';
      this.forceSelect = !!(opts && opts.force);
      this.selectedIndex = 0;
      const p = this.getParty();
      for (let i = 0; i < p.length; i++) {
        if (p[i] && p[i].currentHp > 0) {
          this.selectedIndex = i;
          break;
        }
      }
    }

    close() {
      if (this.forceSelect) return;
      this.isOpen = false;
      this.forceSelect = false;
    }

    playMoveSfx() {
      if (this.engine && this.engine.audio) this.engine.audio.playSFX('cursor');
    }

    handleInput(input) {
      if (!this.isOpen || !input) return;
      const party = this.getParty();

      if (input.wasJustPressed('B') || input.wasJustPressed('SELECT')) {
        if (this.forceSelect) return;
        if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');
        this.close();
        return;
      }

      if (input.wasJustPressed('UP')) {
        if (this.selectedIndex >= 2) {
          this.selectedIndex -= 2;
          this.playMoveSfx();
        }
      } else if (input.wasJustPressed('DOWN')) {
        if (this.selectedIndex <= 3) {
          this.selectedIndex += 2;
          this.playMoveSfx();
        }
      } else if (input.wasJustPressed('LEFT')) {
        if (this.selectedIndex % 2 === 1) {
          this.selectedIndex -= 1;
          this.playMoveSfx();
        }
      } else if (input.wasJustPressed('RIGHT')) {
        if (this.selectedIndex % 2 === 0 && this.selectedIndex < 5) {
          this.selectedIndex += 1;
          this.playMoveSfx();
        }
      }

      if (input.wasJustPressed('A') || input.wasJustPressed('START')) {
        this.confirm();
      }
    }

    handlePointer(px, py) {
      if (!this.isOpen) return false;
      const ui = global.EliseeGbaUi;
      if (!ui) return false;
      if (ui.hitCancel(px, py)) {
        if (!this.forceSelect) {
          if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');
          this.close();
        }
        return true;
      }
      const idx = ui.hitParty(px, py);
      if (idx >= 0) {
        this.selectedIndex = idx;
        this.confirm();
        return true;
      }
      return false;
    }

    confirm() {
      const party = this.getParty();
      const member = party[this.selectedIndex];
      if (!member) return;
      if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');

      if (this.mode === 'switch' && this.engine && this.engine.battle) {
        if (member.currentHp <= 0) {
          if (this.engine.textbox) this.engine.textbox.show(member.name + ' è esausto!');
          return;
        }
        if (this.selectedIndex === this.engine.battle.userActiveIndex) {
          if (this.engine.textbox) this.engine.textbox.show(member.name + ' è già in campo.');
          return;
        }
        this.engine.battle.userActiveIndex = this.selectedIndex;
        this.forceSelect = false;
        this.isOpen = false;
        if (this.engine.textbox) {
          this.engine.textbox.show('Vai, ' + member.name + '!', () => {
            this.engine.battle.subState = 'COMMAND_SELECT';
          });
        } else {
          this.engine.battle.subState = 'COMMAND_SELECT';
        }
        return;
      }

      this.isOpen = false;
      if (this.engine && this.engine.textbox) {
        this.engine.textbox.show([
          member.name + '  Lv.' + member.level + '  ' + (member.role || member.type || ''),
          'HP ' + member.currentHp + '/' + member.hpMax
        ]);
      }
    }

    render(ctx) {
      if (!this.isOpen) return;
      const w = (this.engine && this.engine.canvas && this.engine.canvas.width) || 576;
      const h = (this.engine && this.engine.canvas && this.engine.canvas.height) || 440;
      const ui = global.EliseeGbaUi;
      const party = this.getParty();
      const cur = party[this.selectedIndex];
      const prompt = this.forceSelect
        ? 'Scegli un atleta in campo.'
        : (cur ? ('Che fare con ' + cur.name + '?') : 'Scegli un atleta o annulla.');
      if (ui && ui.drawPartyScreen) {
        ui.drawPartyScreen(ctx, w, h, party, this.selectedIndex, prompt);
      }
    }
  }

  global.EliseePartyScreen = PartyScreen;
})(typeof window !== 'undefined' ? window : this);
