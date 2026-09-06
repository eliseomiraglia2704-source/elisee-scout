/**
 * ELISEE WORLD — Textbox GBA
 * Finestra bianca bordo nero, testo nero, freccia ▼, macchina da scrivere.
 */
(function (global) {
  'use strict';

  class Textbox {
    constructor() {
      this.queue = [];
      this.currentText = '';
      this.displayedChars = 0;
      this.charTimer = 0;
      this.charSpeed = 22;
      this.isOpen = false;
      this.onCompleteCallback = null;
      this.accent = null;
    }

    show(text, onComplete, accent) {
      if (Array.isArray(text)) {
        this.queue = text.slice();
      } else {
        this.queue = [String(text || '')];
      }
      this.onCompleteCallback = onComplete || null;
      this.accent = accent || null;
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
      this.accent = null;
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
      if (!this.isOpen || !input) return false;
      if (input.wasJustPressed('A') || input.wasJustPressed('START')) {
        if (this.displayedChars < this.currentText.length) {
          this.displayedChars = this.currentText.length;
        } else {
          this.nextPage();
        }
        return true;
      }
      return false;
    }

    render(ctx, width, height) {
      if (!this.isOpen) return;
      const boxH = 88;
      const boxX = 10;
      const boxY = height - boxH - 8;
      const boxW = width - 20;
      const ui = global.EliseeGbaUi;

      ctx.save();
      if (ui && ui.drawGbaWindow) {
        ui.drawGbaWindow(ctx, boxX, boxY, boxW, boxH);
      } else {
        ctx.fillStyle = '#101010';
        ctx.fillRect(boxX - 3, boxY - 3, boxW + 6, boxH + 6);
        ctx.fillStyle = '#f7f3e8';
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }

      const textToDraw = this.currentText.substring(0, this.displayedChars);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = this.accent || '#101010';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const maxWidth = boxW - 28;
      const words = textToDraw.split(' ');
      let line = '';
      let lineY = boxY + 16;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, boxX + 14, lineY);
          line = words[n] + ' ';
          lineY += 22;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, boxX + 14, lineY);

      if (this.displayedChars >= this.currentText.length && Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = '#101010';
        ctx.beginPath();
        const tx = boxX + boxW - 22;
        const ty = boxY + boxH - 16;
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 10, ty);
        ctx.lineTo(tx + 5, ty + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  global.EliseeTextbox = Textbox;
})(typeof window !== 'undefined' ? window : this);
