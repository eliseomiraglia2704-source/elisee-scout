/**
 * ELISEE WORLD — Textbox (sez. 21 design doc + sez. 8 architettura)
 * Rendering dialoghi retro pixel art con effetto macchina da scrivere.
 */
(function (global) {
  'use strict';

  class Textbox {
    constructor() {
      this.queue = [];
      this.currentText = '';
      this.displayedChars = 0;
      this.charTimer = 0;
      this.charSpeed = 25; // ms per carattere
      this.isOpen = false;
      this.onCompleteCallback = null;
    }

    show(text, onComplete) {
      if (Array.isArray(text)) {
        this.queue = [...text];
      } else {
        this.queue = [String(text || '')];
      }
      this.onCompleteCallback = onComplete || null;
      this.isOpen = true;
      this.nextPage();
    }

    nextPage() {
      if (this.queue.length === 0) {
        this.close();
        return;
      }
      this.currentText = this.queue.shift();
      this.displayedChars = 0;
      this.charTimer = 0;
    }

    close() {
      this.isOpen = false;
      this.currentText = '';
      this.displayedChars = 0;
      if (typeof this.onCompleteCallback === 'function') {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    }

    update(dt) {
      if (!this.isOpen) return;
      if (this.displayedChars < this.currentText.length) {
        this.charTimer += dt;
        while (this.charTimer >= this.charSpeed && this.displayedChars < this.currentText.length) {
          this.charTimer -= this.charSpeed;
          this.displayedChars++;
        }
      }
    }

    handleInput(input) {
      if (!this.isOpen || !input) return;
      if (input.wasJustPressed('A') || input.wasJustPressed('START')) {
        if (this.displayedChars < this.currentText.length) {
          // Completa istantaneamente il testo in corso
          this.displayedChars = this.currentText.length;
        } else {
          // Avanza al messaggio successivo
          this.nextPage();
        }
      }
    }

    render(ctx, width, height) {
      if (!this.isOpen) return;
      const boxH = 124;
      const boxY = height - boxH - 16;
      const boxX = 16;
      const boxW = width - 32;

      ctx.save();
      // Box retro con stile identico ai box di battaglia
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Testo visibile
      const textToDraw = this.currentText.substring(0, this.displayedChars);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      // Wrapping
      const maxWidth = boxW - 32;
      const words = textToDraw.split(' ');
      let line = '';
      let lineY = boxY + 18;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, boxX + 16, lineY);
          line = words[n] + ' ';
          lineY += 22;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, boxX + 16, lineY);

      // Indicatore freccia lampeggiante coordinato oro
      if (this.displayedChars >= this.currentText.length && Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('▼', boxX + boxW - 24, boxY + boxH - 24);
      }
      ctx.restore();
    }
  }

  global.EliseeTextbox = Textbox;
})(typeof window !== 'undefined' ? window : this);
