/**
 * ELISEE WORLD — AI CONTROLLER (MVP)
 * Logica di decisione avversaria ponderata:
 * 1) Mossa super efficace con energia sufficiente
 * 2) Mossa a danno più alto
 * 3) Mossa random tra quelle rimaste
 */
(function (global) {
  'use strict';

  var AIController = {
    chooseMove: function (aiPlayer, targetPlayer, movesDb, battleContext) {
      if (!aiPlayer || !aiPlayer.mosse || !aiPlayer.mosse.length) return null;

      var availableMoves = [];
      for (var i = 0; i < aiPlayer.mosse.length; i++) {
        var moveKey = aiPlayer.mosse[i];
        var moveData = movesDb[moveKey] || { id: moveKey, nome: moveKey, potenza: 40, tipo: aiPlayer.ruolo, energia: 10 };
        availableMoves.push(moveData);
      }

      if (!availableMoves.length) return null;

      // 1. Cerca una mossa superefficace
      var bestMove = null;
      var bestMult = 1.0;
      var targetTypes = targetPlayer.tipi || [targetPlayer.ruolo];

      for (var j = 0; j < availableMoves.length; j++) {
        var m = availableMoves[j];
        if (m.potenza > 0) {
          var mult = global.EliseeDamageCalc ? global.EliseeDamageCalc.getTypeMultiplier(m.tipo, targetTypes) : 1.0;
          if (mult > bestMult) {
            bestMult = mult;
            bestMove = m;
          }
        }
      }

      if (bestMove && bestMult > 1.2) {
        return bestMove;
      }

      // 2. Altrimenti mossa con danno più alto
      availableMoves.sort(function (a, b) {
        return (b.potenza || 0) - (a.potenza || 0);
      });

      // Seleziona con priorità tra le top 2 mosse
      var pickIndex = Math.random() < 0.75 ? 0 : Math.min(1, availableMoves.length - 1);
      return availableMoves[pickIndex];
    }
  };

  global.EliseeAIController = AIController;

})(typeof window !== 'undefined' ? window : this);
