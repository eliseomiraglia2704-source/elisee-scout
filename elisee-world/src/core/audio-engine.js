/**
 * ELISEE WORLD — Audio Engine (sez. 9 architettura + sez. 19 design doc)
 * Wrapper Web Audio API per BGM e SFX nativi procedurali retro 16-bit.
 */
(function (global) {
  'use strict';

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.sfxGain = null;
      this.bgmGain = null;
      this.sfxVolume = 0.8;
      this.bgmVolume = 0.5;
      this.muted = false;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();

        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);

        this.sfxGain.connect(this.ctx.destination);
        this.bgmGain.connect(this.ctx.destination);
        this.initialized = true;
      } catch (e) {
        console.warn('[AudioEngine] Web Audio API non disponibile:', e);
      }
    }

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(channel, vol) {
      const val = Math.max(0, Math.min(1, vol));
      if (channel === 'sfx') {
        this.sfxVolume = val;
        if (this.sfxGain && this.ctx) this.sfxGain.gain.setValueAtTime(val, this.ctx.currentTime);
      } else if (channel === 'bgm') {
        this.bgmVolume = val;
        if (this.bgmGain && this.ctx) this.bgmGain.gain.setValueAtTime(val, this.ctx.currentTime);
      }
    }

    playSFX(type) {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
          case 'select':
          case 'click':
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
          case 'hit':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
          case 'miss':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
            break;
          case 'faint':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.4);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
          case 'levelup':
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.08);
            osc.frequency.setValueAtTime(659.25, now + 0.16);
            osc.frequency.setValueAtTime(880, now + 0.24);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
          default:
            break;
        }
      } catch (e) {}
    }

    playBGM(trackName) {
      // Hook predisposto per BGM future
    }

    stopBGM() {}
  }

  global.EliseeAudioEngine = AudioEngine;
})(typeof window !== 'undefined' ? window : this);
