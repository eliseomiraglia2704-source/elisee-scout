/**
 * ELISEE WORLD — TEXTBOX
 * Rendering dialoghi stile macchina da scrivere con colori per tono
 * (nero/bianco = normale, rosso = allerta/ostile, ciano = intesa/sistema).
 */
(function (global) {
  'use strict';

  function Textbox() {
    this.queue = [];
    this.currentText = '';
    this.charIndex = 0;
    this.speedMs = 28; // ~28ms per carattere
    this.timer = 0;
    this.isComplete = true;
    this.speaker = '';
    this.tone = 'normal'; // 'normal' | 'alert' | 'accent'
    this.onFinished = null;
    this.active = false;
  }

  Textbox.prototype.say = function (text, speaker, tone, onDone) {
    this.active = true;
    this.currentText = text || '';
    this.speaker = speaker || '';
    this.tone = tone || 'normal';
    this.charIndex = 0;
    this.timer = 0;
    this.isComplete = false;
    this.onFinished = onDone || null;
  };

  Textbox.prototype.queueSay = function (messages) {
    if (!messages || !messages.length) return;
    this.queue = messages.slice();
    this.nextMessage();
  };

  Textbox.prototype.nextMessage = function () {
    if (this.queue.length > 0) {
      var item = this.queue.shift();
      if (typeof item === 'string') {
        this.say(item);
      } else {
        this.say(item.text, item.speaker, item.tone, item.onDone);
      }
    } else {
      this.active = false;
      if (this.onFinished) {
        var cb = this.onFinished;
        this.onFinished = null;
        cb();
      }
    }
  };

  Textbox.prototype.advance = function () {
    if (!this.active) return false;
    if (!this.isComplete) {
      // Fast-forward
      this.charIndex = this.currentText.length;
      this.isComplete = true;
      return true;
    } else {
      // Next message
      this.nextMessage();
      return true;
    }
  };

  Textbox.prototype.update = function (dt) {
    if (!this.active || this.isComplete) return;
    this.timer += dt;
    while (this.timer >= this.speedMs && !this.isComplete) {
      this.timer -= this.speedMs;
      this.charIndex++;
      if (this.charIndex >= this.currentText.length) {
        this.charIndex = this.currentText.length;
        this.isComplete = true;
      }
    }
  };

  Textbox.prototype.render = function (ctx, canvasWidth, canvasHeight) {
    if (!this.active) return;

    var boxHeight = 110;
    var x = 16;
    var y = canvasHeight - boxHeight - 16;
    var width = canvasWidth - 32;

    ctx.save();

    // Box retro 16-bit background
    ctx.fillStyle = '#050a14';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    ctx.fillRect(x, y, width, boxHeight);
    ctx.strokeRect(x, y, width, boxHeight);

    // Inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, width - 8, boxHeight - 8);

    // Speaker badge
    if (this.speaker) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 12, y - 12, ctx.measureText(this.speaker).width + 24, 20);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(x + 12, y - 12, ctx.measureText(this.speaker).width + 24, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Outfit", monospace, sans-serif';
      ctx.fillText(this.speaker, x + 20, y + 2);
    }

    // Text color by tone
    var textColor = '#e2e8f0';
    if (this.tone === 'alert' || this.tone === 'red') textColor = '#ef4444';
    if (this.tone === 'accent' || this.tone === 'blue' || this.tone === 'cyan') textColor = '#38bdf8';
    if (this.tone === 'gold' || this.tone === 'yellow') textColor = '#facc15';

    ctx.fillStyle = textColor;
    ctx.font = '14px "Outfit", monospace, sans-serif';

    // Word wrap & typewriter rendering
    var textToShow = this.currentText.substring(0, this.charIndex);
    var words = textToShow.split(' ');
    var line = '';
    var lineY = y + 30;
    var maxLineWidth = width - 40;

    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        ctx.fillText(line, x + 20, lineY);
        line = words[i] + ' ';
        lineY += 22;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x + 20, lineY);

    // Prompt indicator if complete
    if (this.isComplete) {
      var blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(x + width - 24, y + boxHeight - 18);
        ctx.lineTo(x + width - 14, y + boxHeight - 18);
        ctx.lineTo(x + width - 19, y + boxHeight - 10);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  };

  global.EliseeTextbox = Textbox;

})(typeof window !== 'undefined' ? window : this);
