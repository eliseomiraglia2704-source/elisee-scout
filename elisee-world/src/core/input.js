/**
 * ELISEE WORLD — Input System (sez. 7 architettura)
 * Astrazione a intent unificati: UP, DOWN, LEFT, RIGHT, A, B, START
 */
(function (global) {
  'use strict';

  class Input {
    constructor() {
      this.keys = {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false,
        A: false,
        B: false,
        START: false
      };
      this.justPressed = {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false,
        A: false,
        B: false,
        START: false
      };
      this.boundKeyDown = this.onKeyDown.bind(this);
      this.boundKeyUp = this.onKeyUp.bind(this);
      this.attached = false;
    }

    attach() {
      if (this.attached) return;
      window.addEventListener('keydown', this.boundKeyDown);
      window.addEventListener('keyup', this.boundKeyUp);
      this.attached = true;
    }

    detach() {
      if (!this.attached) return;
      window.removeEventListener('keydown', this.boundKeyDown);
      window.removeEventListener('keyup', this.boundKeyUp);
      this.attached = false;
      this.reset();
    }

    reset() {
      for (const k in this.keys) {
        this.keys[k] = false;
        this.justPressed[k] = false;
      }
    }

    mapKey(e) {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          return 'UP';
        case 'ArrowDown':
        case 'KeyS':
          return 'DOWN';
        case 'ArrowLeft':
        case 'KeyA':
          return 'LEFT';
        case 'ArrowRight':
        case 'KeyD':
          return 'RIGHT';
        case 'Enter':
        case 'Space':
        case 'KeyZ':
        case 'KeyJ':
          return 'A';
        case 'Escape':
        case 'KeyX':
        case 'KeyK':
        case 'Backspace':
          return 'B';
        case 'KeyP':
        case 'KeyM':
          return 'START';
        default:
          return null;
      }
    }

    onKeyDown(e) {
      const intent = this.mapKey(e);
      if (intent) {
        if (!this.keys[intent]) {
          this.justPressed[intent] = true;
        }
        this.keys[intent] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          e.preventDefault();
        }
      }
    }

    onKeyUp(e) {
      const intent = this.mapKey(e);
      if (intent) {
        this.keys[intent] = false;
      }
    }

    isDown(intent) {
      return !!this.keys[intent];
    }

    wasJustPressed(intent) {
      return !!this.justPressed[intent];
    }

    // Richiamato alla fine di ogni frame logico per azzerare i tasti one-shot
    clearJustPressed() {
      for (const k in this.justPressed) {
        this.justPressed[k] = false;
      }
    }

    // Metodi di simulazione per touch / virtual D-Pad
    setTouchIntent(intent, isDown) {
      if (intent in this.keys) {
        if (isDown && !this.keys[intent]) {
          this.justPressed[intent] = true;
        }
        this.keys[intent] = isDown;
      }
    }
  }

  global.EliseeInput = Input;
})(typeof window !== 'undefined' ? window : this);
