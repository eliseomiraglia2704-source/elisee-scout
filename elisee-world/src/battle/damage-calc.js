/**
 * ELISEE WORLD — Damage Calculator (sez. 8 e sez. 14 architettura)
 * Formula di danno pura, type chart ruoli e hook Momentum/Formazione/Meteo.
 */
(function (global) {
  'use strict';

  const TYPE_CHART = {
    PUNTA: { DIFESA: 1.5, POR: 1.25, MEDIANO: 0.8 },
    ALA: { TERZINO: 1.5, DIFESA: 1.25, PUNTA: 1.0 },
    TREQ: { MEDIANO: 1.5, DIFESA: 1.2, POR: 1.2 },
    MEDIANO: { TREQ: 1.5, ALA: 1.2, PUNTA: 0.8 },
    TERZINO: { ALA: 1.5, TREQ: 1.0, POR: 0.8 },
    DIFESA: { PUNTA: 1.5, ALA: 0.8, POR: 1.0 },
    POR: { PUNTA: 1.2, ALA: 1.2, TREQ: 1.0 }
  };

  function typeChartMultiplier(moveType, defenderTypes) {
    if (!moveType || !defenderTypes) return 1;
    const defArray = Array.isArray(defenderTypes) ? defenderTypes : [defenderTypes];
    let mult = 1;
    for (const dt of defArray) {
      if (TYPE_CHART[moveType] && TYPE_CHART[moveType][dt] !== undefined) {
        mult *= TYPE_CHART[moveType][dt];
      }
    }
    return mult;
  }

  function calculateDamage({ attacker, defender, move, momentum = 50, formation = null, weather = null }) {
    if (!attacker || !defender || !move) return { dmg: 0, isCrit: false, mult: 1, isMiss: false };

    // Controllo precisione (Miss)
    const accuracy = move.accuracy || 100;
    if (Math.random() * 100 > accuracy) {
      return { dmg: 0, isCrit: false, mult: 1, isMiss: true };
    }

    const power = move.power || 40;
    const atk = attacker.atk || 50;
    const def = Math.max(1, defender.def || 50);

    let baseDmg = Math.floor((((2 * (attacker.level || 5) / 5 + 2) * power * (atk / def)) / 50) + 2);

    // Efficacia tipo
    const mult = typeChartMultiplier(move.type, defender.types || defender.type);
    baseDmg = Math.floor(baseDmg * mult);

    // Hook Formazione
    if (formation && formation.offenseMultiplier) {
      baseDmg = Math.floor(baseDmg * formation.offenseMultiplier);
    }

    // Hook Meteo
    if (weather && typeof weather.getMultiplier === 'function') {
      baseDmg = Math.floor(baseDmg * weather.getMultiplier(move.type, defender.types));
    }

    // Calcolo Critico basato su Momentum
    const critChance = 0.0625 + (momentum > 75 ? 0.10 : 0);
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      baseDmg = Math.floor(baseDmg * 1.5);
    }

    // Variazione casuale (85% - 100%)
    const variance = (Math.floor(Math.random() * 16) + 85) / 100;
    const finalDmg = Math.max(1, Math.floor(baseDmg * variance));

    return {
      dmg: finalDmg,
      isCrit,
      mult,
      isMiss: false
    };
  }

  global.EliseeDamageCalc = {
    calculateDamage,
    typeChartMultiplier,
    TYPE_CHART
  };
})(typeof window !== 'undefined' ? window : this);
