/**
 * ELISEE WORLD — Bag Screen GBA
 * Lista oggetti del borsone, quantità, descrizione, CANCEL.
 */
(function (global) {
  'use strict';

  const DEFAULT_ITEMS = [
    { id: 'pozione_segreta', name: 'Pozione Segreta', qty: 3, desc: 'Ripristina 40 HP a un calciatore.', heal: 40 },
    { id: 'fiala_elettroliti', name: 'Fiala Elettrolitica', qty: 2, desc: 'Ripristina 10 PP alla prima mossa.', pp: 10 },
    { id: 'contratto_base', name: 'Contratto Base', qty: 5, desc: 'Proposta di tesseramento per giovani talenti.' },
    { id: 'contratto_argento', name: "Contratto d'Argento", qty: 2, desc: 'Offerta con bonus rendimento. Più efficace.' },
    { id: 'contratto_oro', name: "Contratto d'Oro", qty: 1, desc: 'Contratto top. Altissima percentuale di firma.' },
    { id: 'caramella_rara', name: 'Caramella Rara', qty: 1, desc: 'Fa salire di 1 Livello il calciatore prescelto.', levelUp: 1 },
    { id: 'fascia_capitano', name: 'Fascia da Capitano', qty: 1, desc: 'Simbolo di leadership. +10 Momentum in campo.' }
  ];

  class BagScreen {
    constructor(engine) {
      this.engine = engine;
      this.isOpen = false;
      this.selectedIndex = 0;
      this.items = DEFAULT_ITEMS.map(function (it) {
        return { id: it.id, name: it.name, qty: it.qty, desc: it.desc, heal: it.heal, pp: it.pp, levelUp: it.levelUp };
      });
    }

    open() {
      this.isOpen = true;
      this.selectedIndex = 0;
    }

    close() {
      this.isOpen = false;
    }

    visibleItems() {
      return this.items.filter(function (it) { return it.qty > 0; });
    }

    handleInput(input) {
      if (!this.isOpen || !input) return;
      const vis = this.visibleItems();
      if (input.wasJustPressed('B')) {
        if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');
        this.close();
        return;
      }
      if (input.wasJustPressed('UP')) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          if (this.engine && this.engine.audio) this.engine.audio.playSFX('cursor');
        }
      } else if (input.wasJustPressed('DOWN')) {
        if (this.selectedIndex < vis.length - 1) {
          this.selectedIndex += 1;
          if (this.engine && this.engine.audio) this.engine.audio.playSFX('cursor');
        }
      } else if (input.wasJustPressed('A')) {
        this.useSelected();
      }
    }

    handlePointer(px, py) {
      if (!this.isOpen) return false;
      const ui = global.EliseeGbaUi;
      if (!ui) return false;
      if (ui.hitCancel(px, py)) {
        if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');
        this.close();
        return true;
      }
      const idx = ui.hitBag(px, py);
      if (idx >= 0) {
        this.selectedIndex = idx;
        this.useSelected();
        return true;
      }
      return false;
    }

    useSelected() {
      const vis = this.visibleItems();
      const it = vis[this.selectedIndex];
      if (!it) return;
      if (this.engine && this.engine.audio) this.engine.audio.playSFX('select');

      const battle = this.engine && this.engine.battle;
      const active = battle && battle.getUserActive && battle.getUserActive();
      const target = active || (this.engine && this.engine.playerParty && this.engine.playerParty[0]);

      if (it.heal && target) {
        const before = target.currentHp;
        target.currentHp = Math.min(target.hpMax, target.currentHp + it.heal);
        it.qty -= 1;
        this.close();
        if (this.engine.textbox) {
          this.engine.textbox.show(target.name + ' recupera ' + (target.currentHp - before) + ' HP!');
        }
        return;
      }
      if (it.pp && target && target.moves && target.moves[0]) {
        const mv = target.moves[0];
        mv.currentPp = Math.min(mv.pp, (mv.currentPp || 0) + it.pp);
        it.qty -= 1;
        this.close();
        if (this.engine.textbox) this.engine.textbox.show('PP di ' + mv.name + ' ripristinati!');
        return;
      }
      if (it.levelUp && target) {
        target.level += 1;
        it.qty -= 1;
        this.close();
        if (this.engine.textbox) this.engine.textbox.show(target.name + ' sale al Lv.' + target.level + '!');
        return;
      }
      if (this.engine.textbox) {
        this.engine.textbox.show('Non puoi usare ' + it.name + ' ora.');
      }
    }

    render(ctx) {
      if (!this.isOpen) return;
      const w = (this.engine && this.engine.canvas && this.engine.canvas.width) || 576;
      const h = (this.engine && this.engine.canvas && this.engine.canvas.height) || 440;
      const ui = global.EliseeGbaUi;
      if (ui && ui.drawBagScreen) {
        ui.drawBagScreen(ctx, w, h, this.visibleItems(), this.selectedIndex, 'BORSONE');
      }
    }
  }

  global.EliseeBagScreen = BagScreen;
})(typeof window !== 'undefined' ? window : this);
