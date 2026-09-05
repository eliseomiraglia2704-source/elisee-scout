/**
 * ELISEE WORLD — AI Controller (sez. 18 design doc)
 * Logica di decisione mossa avversaria basata su priorità ed efficacia.
 */
(function (global) {
  'use strict';

  class AIController {
    static pickMove(aiPlayer, userPlayer, context = {}) {
      if (!aiPlayer || !aiPlayer.moves || !aiPlayer.moves.length) return null;

      // 1. Cerca mosse super efficaci
      for (const m of aiPlayer.moves) {
        if (m.currentPp > 0) {
          const mult = global.EliseeDamageCalc.typeChartMultiplier(m.type, userPlayer.types || userPlayer.type);
          if (mult > 1) {
            return m;
          }
        }
      }

      // 2. Mossa a danno più alto con PP > 0
      const available = aiPlayer.moves.filter((m) => (m.currentPp || m.pp || 1) > 0);
      if (available.length) {
        available.sort((a, b) => (b.power || 0) - (a.power || 0));
        return available[0];
      }

      return aiPlayer.moves[0];
    }
  }

  global.EliseeAIController = AIController;
})(typeof window !== 'undefined' ? window : this);
