/**
 * ELISEE WORLD — AUDIO ENGINE
 * Wrapper Web Audio API nativo per SFX retro 16-bit generati in real-time.
 * Zero asset esterni, nessun ritardo di rete.
 */
(function (global) {
  'use strict';

  var audioCtx = null;
  var isMuted = false;

  function getContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, gainVal, slideToFreq) {
    if (isMuted) return;
    try {
      var ctx = getContext();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideToFreq), ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal || 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  var AudioEngine = {
    init: function () {
      // Inizializza al primo tocco/click
      var unlock = function () {
        getContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
    },

    playSFX: function (name) {
      if (isMuted) return;
      switch (name) {
        case 'select':
          playTone(440, 'square', 0.06, 0.1, 880);
          break;
        case 'confirm':
          playTone(520, 'triangle', 0.08, 0.15, 1040);
          break;
        case 'cancel':
          playTone(330, 'square', 0.08, 0.12, 165);
          break;
        case 'hit':
          playTone(180, 'sawtooth', 0.18, 0.25, 40);
          break;
        case 'crit':
          playTone(320, 'sawtooth', 0.1, 0.25, 640);
          setTimeout(function () { playTone(640, 'square', 0.2, 0.25, 80); }, 80);
          break;
        case 'miss':
          playTone(280, 'sine', 0.2, 0.15, 120);
          break;
        case 'faint':
          playTone(300, 'triangle', 0.35, 0.2, 60);
          break;
        case 'level_up':
          playTone(392, 'square', 0.1, 0.18); // G4
          setTimeout(function () { playTone(523, 'square', 0.1, 0.18); }, 100); // C5
          setTimeout(function () { playTone(659, 'square', 0.1, 0.18); }, 200); // E5
          setTimeout(function () { playTone(784, 'square', 0.25, 0.22); }, 300); // G5
          break;
        case 'victory':
          playTone(523, 'square', 0.12, 0.2); // C5
          setTimeout(function () { playTone(523, 'square', 0.12, 0.2); }, 130);
          setTimeout(function () { playTone(523, 'square', 0.12, 0.2); }, 260);
          setTimeout(function () { playTone(659, 'square', 0.35, 0.25); }, 390); // E5
          setTimeout(function () { playTone(784, 'square', 0.5, 0.25); }, 550); // G5
          break;
        case 'battle_start':
          playTone(150, 'sawtooth', 0.1, 0.25, 300);
          setTimeout(function () { playTone(300, 'sawtooth', 0.15, 0.25, 600); }, 100);
          break;
        default:
          playTone(400, 'square', 0.05, 0.1);
          break;
      }
    },

    toggleMute: function () {
      isMuted = !isMuted;
      return isMuted;
    },

    isMuted: function () {
      return isMuted;
    }
  };

  global.EliseeAudio = AudioEngine;

})(typeof window !== 'undefined' ? window : this);
