/**
 * ELISEE WORLD — DAMAGE CALCULATOR & TYPE CHART
 * Calcolo danno puro, type chart ruoli calcistici, critici, miss,
 * e hook per Momentum, Formazione e Meteo (sez. 14 architettura & sez. 25 design doc).
 */
(function (global) {
  'use strict';

  // TYPE EFFECTIVENESS TABLE TRA RUOLI CALCISTICI
  // Moltiplicatori: 1.5 = "Giocata perfetta!", 0.65 = "Giocata poco incisiva...", 1.0 = Neutro
  var TYPE_CHART = {
    PUNTA: {
      DIFESA: 1.5,   // Punta supera il difensore nell'1-contro-1
      POR: 1.5,      // Punta ha il tiro per battere il portiere
      TERZINO: 1.2,
      MEDIANO: 0.8,  // Mediano fa filtro e chiude la linea
      TREQ: 1.0,
      ALA: 1.0
    },
    ALA: {
      TERZINO: 1.5,  // Ala salta il terzino sulla fascia
      DIFESA: 1.2,
      MEDIANO: 1.0,
      POR: 1.0,
      PUNTA: 0.8,
      TREQ: 1.0
    },
    TREQ: {
      MEDIANO: 1.5,  // Trequartista gioca tra le linee alle spalle dei mediani
      DIFESA: 1.4,
      POR: 1.1,
      TERZINO: 1.0,
      ALA: 1.0,
      PUNTA: 1.0
    },
    MEDIANO: {
      TREQ: 1.5,     // Mediano recupera e pressa il trequartista
      ALA: 1.2,
      TERZINO: 1.0,
      DIFESA: 0.9,
      POR: 0.8,
      PUNTA: 1.1
    },
    TERZINO: {
      ALA: 1.4,      // Terzino blocca l'avanzata dell'ala
      MEDIANO: 1.1,
      TREQ: 0.9,
      DIFESA: 1.0,
      POR: 0.8,
      PUNTA: 0.8
    },
    DIFESA: {
      PUNTA: 1.4,    // Difensore chiude la punta e intercetta
      TREQ: 1.1,
      ALA: 0.9,
      MEDIANO: 1.0,
      TERZINO: 1.0,
      POR: 1.0
    },
    POR: {
      PUNTA: 1.3,    // Portiere si esalta sulle conclusioni ravvicinate
      ALA: 1.1,
      DIFESA: 1.0,
      MEDIANO: 1.0,
      TERZINO: 1.0,
      TREQ: 0.9
    }
  };

  function getTypeMultiplier(moveType, defenderTypes) {
    if (!moveType || !defenderTypes || !defenderTypes.length) return 1.0;
    var moveTable = TYPE_CHART[moveType] || {};
    var totalMult = 1.0;
    for (var i = 0; i < defenderTypes.length; i++) {
      var targetRole = defenderTypes[i];
      if (moveTable[targetRole] != null) {
        totalMult *= moveTable[targetRole];
      }
    }
    return totalMult;
  }

  function calculateDamage(params) {
    var attacker = params.attacker;
    var defender = params.defender;
    var move = params.move;
    var momentum = params.momentum != null ? params.momentum : 50;
    var formation = params.formation || null;
    var weather = params.weather || null;

    if (!move || move.potenza <= 0) {
      return { dmg: 0, isCrit: false, isMiss: false, typeMult: 1.0, message: '' };
    }

    // Miss check
    var accuracy = move.precisione || 90;
    if (weather && weather.getAccuracyModifier) {
      accuracy += weather.getAccuracyModifier(move.tipo);
    }
    if (Math.random() * 100 > accuracy) {
      return {
        dmg: 0,
        isCrit: false,
        isMiss: true,
        typeMult: 1.0,
        message: 'Ma non combina nulla!'
      };
    }

    // Base damage formula
    var atkStat = move.categoria === 'speciale' ? (attacker.att_sp || attacker.attacco) : attacker.attacco;
    var defStat = move.categoria === 'speciale' ? (defender.dif_sp || defender.difesa) : defender.difesa;
    atkStat = Math.max(10, atkStat || 30);
    defStat = Math.max(10, defStat || 30);

    var level = attacker.livello || 15;
    var baseDmg = (((2 * level / 5 + 2) * move.potenza * (atkStat / defStat)) / 50) + 2;

    // Type effectiveness
    var typeMult = getTypeMultiplier(move.tipo, defender.tipi || [defender.ruolo]);
    var finalDmg = baseDmg * typeMult;

    // Formation hook (sez. 25.2)
    if (formation && formation.offenseMultiplier) {
      finalDmg *= formation.offenseMultiplier;
    }

    // Weather hook (sez. 25.3)
    if (weather && weather.getDamageMultiplier) {
      finalDmg *= weather.getDamageMultiplier(move.tipo);
    }

    // Critical hit chance (influenced by Momentum, sez. 25.1)
    var critChance = 0.0625 + (momentum > 75 ? 0.12 : 0);
    var isCrit = Math.random() < critChance;
    if (isCrit) {
      finalDmg *= 1.5;
    }

    // Random variance (0.85 - 1.0)
    var variance = 0.85 + Math.random() * 0.15;
    finalDmg = Math.max(1, Math.round(finalDmg * variance));

    var message = '';
    if (typeMult > 1.2) {
      message = 'Giocata perfetta!';
    } else if (typeMult < 0.85) {
      message = 'Giocata poco incisiva...';
    }

    return {
      dmg: finalDmg,
      isCrit: isCrit,
      isMiss: false,
      typeMult: typeMult,
      message: message
    };
  }

  global.EliseeDamageCalc = {
    calculateDamage: calculateDamage,
    getTypeMultiplier: getTypeMultiplier,
    TYPE_CHART: TYPE_CHART
  };

})(typeof window !== 'undefined' ? window : this);
