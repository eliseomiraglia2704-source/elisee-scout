/**
 * ELISEE SCOUT — Piramide italiana (regola fondamentale)
 *
 * Serie C = 3 gironi (A, B, C).
 *   Vince Girone A → Serie B
 *   Vince Girone B → Serie B
 *   Vince Girone C → Serie B
 *
 * Serie D = gironi A–I (9).
 *   Vince ciascun girone → Serie C
 *
 * Unità = GIRONE, non la categoria intera.
 */
(function (root) {
  'use strict';

  var SERIE_C_GIRONI = ['A', 'B', 'C'];
  var SERIE_D_GIRONI = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  var RULES = {
    serieC: {
      name: 'Serie C',
      gironi: SERIE_C_GIRONI.slice(),
      promoteTo: 'Serie B',
      rule: 'Il vincitore di ogni girone (A, B, C) sale in Serie B.'
    },
    serieD: {
      name: 'Serie D',
      gironi: SERIE_D_GIRONI.slice(),
      promoteTo: 'Serie C',
      rule: 'Il vincitore di ogni girone (A–I) sale in Serie C.'
    }
  };

  function summaryText() {
    return (
      'Serie C: 3 gironi (A, B, C). Vince A, B o C → Serie B. ' +
      'Serie D: gironi A–I. Vince ciascun girone → Serie C.'
    );
  }

  function promoteLabel(fromLeague, girone) {
    var g = String(girone || '').toUpperCase();
    var from = String(fromLeague || '').toUpperCase();
    if (from.indexOf('SERIE C') >= 0 || from === 'C' || from === '3') {
      if (SERIE_C_GIRONI.indexOf(g) < 0) g = 'A';
      return 'Vince C Gir. ' + g + ' \u2192 B';
    }
    if (from.indexOf('SERIE D') >= 0 || from === 'D' || from === '4') {
      return 'Vince D Gir. ' + g + ' \u2192 C';
    }
    return 'Vincitore girone ' + g;
  }

  function parseGirone(label) {
    var m = String(label || '').toUpperCase().match(/GIR(?:ONE|\.)\s*([A-I])/);
    return m ? m[1] : '';
  }

  var api = {
    SERIE_C_GIRONI: SERIE_C_GIRONI,
    SERIE_D_GIRONI: SERIE_D_GIRONI,
    RULES: RULES,
    summaryText: summaryText,
    promoteLabel: promoteLabel,
    parseGirone: parseGirone
  };

  root.EliseePiramide = api;
})(typeof window !== 'undefined' ? window : this);
