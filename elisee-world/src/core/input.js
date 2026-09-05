/**
 * ELISEE WORLD — INPUT MANAGER
 * Astrazione intent unificata: input.isDown('UP'|'DOWN'|'LEFT'|'RIGHT'|'A'|'B'|'START')
 * Tastiera desktop + touch virtuale mobile generano gli stessi intent.
 */
(function (global) {
  'use strict';

  var keysDown = {};
  var keysPressed = {}; // Single-frame trigger
  var touchIntents = {};

  var KEY_MAP = {
    'ArrowUp': 'UP',
    'KeyW': 'UP',
    'w': 'UP',
    'W': 'UP',

    'ArrowDown': 'DOWN',
    'KeyS': 'DOWN',
    's': 'DOWN',
    'S': 'DOWN',

    'ArrowLeft': 'LEFT',
    'KeyA': 'LEFT',
    'a': 'LEFT',
    'A': 'LEFT',

    'ArrowRight': 'RIGHT',
    'KeyD': 'RIGHT',
    'd': 'RIGHT',
    'D': 'RIGHT',

    'Enter': 'A',
    'Space': 'A',
    ' ': 'A',
    'KeyZ': 'A',
    'z': 'A',
    'Z': 'A',

    'Escape': 'B',
    'KeyX': 'B',
    'x': 'B',
    'X': 'B',
    'Backspace': 'B',

    'KeyM': 'START',
    'Tab': 'START'
  };

  function initKeyboard() {
    window.addEventListener('keydown', function (e) {
      var intent = KEY_MAP[e.code] || KEY_MAP[e.key];
      if (intent) {
        if (!keysDown[intent]) {
          keysPressed[intent] = true;
        }
        keysDown[intent] = true;
        // Non bloccare F5, F12, o combinazioni di sistema
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F5') {
          // Prevenire scrolling della pagina con frecce / spazio
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) {
            e.preventDefault();
          }
        }
      }
    });

    window.addEventListener('keyup', function (e) {
      var intent = KEY_MAP[e.code] || KEY_MAP[e.key];
      if (intent) {
        keysDown[intent] = false;
      }
    });
  }

  var Input = {
    init: function () {
      initKeyboard();
    },

    isDown: function (intent) {
      return !!(keysDown[intent] || touchIntents[intent]);
    },

    isJustPressed: function (intent) {
      return !!keysPressed[intent];
    },

    setTouchIntent: function (intent, isDown) {
      if (isDown) {
        if (!touchIntents[intent]) {
          keysPressed[intent] = true;
        }
        touchIntents[intent] = true;
      } else {
        touchIntents[intent] = false;
      }
    },

    flushFrame: function () {
      keysPressed = {};
    },

    reset: function () {
      keysDown = {};
      keysPressed = {};
      touchIntents = {};
    }
  };

  global.EliseeInput = Input;

})(typeof window !== 'undefined' ? window : this);
