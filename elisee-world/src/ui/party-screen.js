/**
 * ELISEE WORLD — Party Screen (sez. 2 design doc + sez. 1 architettura)
 * Schermata gestione squadra/party (griglia 2 colonne x 3 righe).
 * Stile visivo 16-bit coerente con la schermata di battaglia.
 */
(function (global) {
  'use strict';

  class PartyScreen {
    constructor(engine) {
      this.engine = engine;
      this.selectedIndex = 0;
      this.isOpen = false;

      // 3 Giocatori mock coerenti con design doc + 3 slot vuoti
      this.party = [
        {
          name: 'Kvaradona',
          role: 'ALA',
          level: 10,
          currentHp: 45,
          hpMax: 45,
          number: 77,
          status: 'OK'
        },
        {
          name: 'Barella',
          role: 'MEDIANO',
          level: 9,
          currentHp: 28,
          hpMax: 42,
          number: 23,
          status: 'AFFATICATO'
        },
        {
          name: 'Donnarumma',
          role: 'POR',
          level: 12,
          currentHp: 12,
          hpMax: 50,
          number: 1,
          status: 'CRITICO'
        },
        null, // Slot 4 Vuoto
        null, // Slot 5 Vuoto
        null  // Slot 6 Vuoto
      ];
    }

    open() {
      this.isOpen = true;
      this.selectedIndex = 0;
    }

    close() {
      this.isOpen = false;
    }

    handleInput(input) {
      if (!this.isOpen || !input) return;

      if (input.wasJustPressed('B') || input.wasJustPressed('SELECT')) {
        if (this.engine && this.engine.audio) {
          this.engine.audio.playSFX('select');
        }
        this.close();
        return;
      }

      // Navigazione griglia 2x3 (0,1 / 2,3 / 4,5)
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
        if (this.selectedIndex % 2 === 0) {
          this.selectedIndex += 1;
          this.playMoveSfx();
        }
      }

      if (input.wasJustPressed('A') || input.wasJustPressed('START')) {
        if (this.engine && this.engine.audio) {
          this.engine.audio.playSFX('select');
        }
        // Azione su slot selezionato (placeholder interazione)
      }
    }

    playMoveSfx() {
      if (this.engine && this.engine.audio) {
        this.engine.audio.playSFX('cursor');
      }
    }

    render(ctx) {
      if (!this.isOpen) return;

      const w = (this.engine && this.engine.canvas && this.engine.canvas.width) || 640;
      const h = (this.engine && this.engine.canvas && this.engine.canvas.height) || 360;

      // 1. Sfondo scuro con pattern stadium blueprint
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);

      // Linee decorative di campo retro
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      // 2. Header Schermata
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(16, 12, w - 32, 34);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 12, w - 32, 34);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚽ GESTIONE SQUADRA / ROSA ATLETI (PARTY)', 28, 34);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('[B] Indietro', w - 28, 34);

      // 3. Griglia 2x3 Box Atleti
      const gridX = 20;
      const gridY = 56;
      const gridW = w - 40;
      const gridH = h - 130;

      const cardW = Math.floor((gridW - 16) / 2);
      const cardH = Math.floor((gridH - 16) / 3);

      for (let i = 0; i < 6; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = gridX + col * (cardW + 16);
        const by = gridY + row * (cardH + 8);
        const isSelected = this.selectedIndex === i;
        const member = this.party[i];

        // Sfondo Box
        ctx.fillStyle = isSelected ? '#0f172a' : '#0a0f1d';
        ctx.fillRect(bx, by, cardW, cardH);

        // Bordo Box: Giallo evidenziato se selezionato (stesso colore giocatore attivo battaglia) o Ciano
        if (isSelected) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.strokeRect(bx - 1, by - 1, cardW + 2, cardH + 2);

          // Cursore triangolare dorato
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(bx - 8, by + cardH / 2 - 5);
          ctx.lineTo(bx - 2, by + cardH / 2);
          ctx.lineTo(bx - 8, by + cardH / 2 + 5);
          ctx.fill();
        } else {
          ctx.strokeStyle = member ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, cardW, cardH);
        }

        if (member) {
          // Icona Ruolo Badge
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(bx + 8, by + 8, 36, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(member.role, bx + 26, by + 20);

          // Nome Calciatore
          ctx.fillStyle = isSelected ? '#facc15' : '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(member.name, bx + 50, by + 20);

          // Livello
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`Lv.${member.level}`, bx + cardW - 10, by + 20);

          // Barra HP (Punti Forma)
          const hpPct = Math.max(0, Math.min(1, member.currentHp / member.hpMax));
          const barX = bx + 36;
          const barY = by + cardH - 18;
          const barW = cardW - 46;

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('HP', bx + 12, barY + 7);

          // Sfondo barra
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(barX, barY, barW, 8);

          // Barra dinamica: verde >50%, gialla 20-50%, rossa <20%
          ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';
          ctx.fillRect(barX, barY, Math.floor(barW * hpPct), 8);

          // Valori numerici HP
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '9px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${member.currentHp}/${member.hpMax}`, bx + cardW - 10, by + 34);
        } else {
          // Slot vuoto
          ctx.fillStyle = '#475569';
          ctx.font = 'italic 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('--- Slot Vuoto ---', bx + cardW / 2, by + cardH / 2 + 4);
        }
      }

      // 4. Testo Contestuale in basso (Bottom Dialogue Bar)
      const curMember = this.party[this.selectedIndex];
      const botX = 16;
      const botY = h - 62;
      const botW = w - 32;
      const botH = 50;

      ctx.fillStyle = '#0a1020';
      ctx.fillRect(botX, botY, botW, botH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(botX, botY, botW, botH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';

      if (curMember) {
        ctx.fillText(`Che fare con ${curMember.name}?`, botX + 16, botY + 28);
      } else {
        ctx.fillText('Nessun atleta in questo slot della panchina.', botX + 16, botY + 28);
      }
    }
  }

  global.EliseePartyScreen = PartyScreen;
})(typeof window !== 'undefined' ? window : this);
