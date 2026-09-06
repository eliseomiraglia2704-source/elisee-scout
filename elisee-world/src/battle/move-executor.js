/**
 * ELISEE WORLD — Move Executor (sez. 8 architettura)
 * Applica gli effetti di una mossa durante il turno di battaglia.
 */
(function (global) {
  'use strict';

  class MoveExecutor {
    static execute(attacker, defender, move, context = {}) {
      if (!attacker || !defender || !move) return { success: false, log: [] };
      const log = [];
      log.push(`${attacker.name} usa ${move.name}!`);

      if (!move.power) {
        log.push(move.flavor || 'La marcatura si fa più stretta!');
        return { success: true, log, fainted: false };
      }

      // Calcola danno
      const calcResult = global.EliseeDamageCalc.calculateDamage({
        attacker,
        defender,
        move,
        momentum: context.momentum || 50,
        formation: context.formation || null,
        weather: context.weather || null
      });

      if (calcResult.isMiss) {
        log.push('Ma non combina nulla!');
        return { success: false, log, calcResult };
      }

      // Applica danno
      defender.currentHp = Math.max(0, defender.currentHp - calcResult.dmg);

      if (calcResult.isCrit) {
        log.push('Azione da campione! (Colpo critico)');
      }

      if (calcResult.mult > 1) {
        log.push('È super efficace!');
      } else if (calcResult.mult < 1) {
        log.push('Non è molto efficace...');
      }

      if (defender.currentHp <= 0) {
        log.push(`${defender.name} è esausto!`);
      }

      return {
        success: true,
        log,
        calcResult,
        fainted: defender.currentHp <= 0
      };
    }
  }

  global.EliseeMoveExecutor = MoveExecutor;
})(typeof window !== 'undefined' ? window : this);
