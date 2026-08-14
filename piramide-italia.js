/**
 * ELISEE SCOUT — Piramide italiana
 *
 * Serie C = 3 gironi GEOGRAFICI (formula fissa):
 *   Girone A = Nord Italia
 *   Girone B = Centro Italia
 *   Girone C = Sud Italia (e isole)
 *
 * Chi sale in C (da D o da B) o chi scende in C (dalla B)
 * riceve SUBITO il girone della propria area.
 *
 * Serie D = gironi A–I. Il vincitore di ciascun girone sale in C
 * nel girone geografico della società, non in un girone a caso.
 */
(function (root) {
  'use strict';

  var SERIE_C_GIRONI = ['A', 'B', 'C'];
  var SERIE_D_GIRONI = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  var AREA_TO_C = { nord: 'A', centro: 'B', sud: 'C' };

  var AREA = {};

  function keyOf(name) {
    return String(name || '')
      .toUpperCase()
      .replace(/Ü/g, 'U')
      .replace(/Ö/g, 'O')
      .replace(/[.'’`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function putArea(area, names) {
    names.forEach(function (n) {
      AREA[keyOf(n)] = area;
    });
  }

  /* —— NORD: Piemonte, Liguria, Lombardia, Trentino-AA, Veneto, FVG, Emilia-Romagna —— */
  putArea('nord', [
    'INTER', 'MILAN', 'JUVENTUS', 'TORINO', 'ATALANTA', 'MONZA', 'COMO', 'GENOA',
    'SAMPDORIA', 'UDINESE', 'VENEZIA', 'VERONA', 'BOLOGNA', 'PARMA', 'SASSUOLO',
    'CREMONESE', 'MANTOVA', 'MODENA', 'PADOVA', 'VICENZA', 'LR VICENZA', 'L R VICENZA',
    'SUDTIROL', 'ENTELLA', 'VIRTUS ENTELLA', 'SPEZIA', 'CESENA',
    'ALBINOLEFFE', 'ALCIONE', 'ALCIONE MILANO', 'ARZIGNANO', 'BRESCIA', 'CARPI',
    'CITTADELLA', 'DESENZANO', 'DOLOMITI BELLUNESI', 'FOLGORE CARATESE', 'GIANA ERMINIO',
    'JUVENTUS U23', 'LECCO', 'LUMEZZANE', 'NOVARA', 'OSPITALETTO', 'PERGOLETTESE',
    'PRO VERCELLI', 'RENATE', 'TRENTO', 'TREVISO', 'VADO', 'ATALANTA U23', 'INTER U23',
    'MILAN U23', 'FORLI', 'FORLÌ', 'RAVENNA', 'REGGIANA',
    'AS BIELLESE', 'ASTI', 'CAIRESE', 'CELLE VARAZZE', 'CHISOLA', 'CLUB MILANO',
    'DERTHONA FBC', 'DERTHONA', 'GOZZANO', 'IMPERIA', 'LAVAGNESE', 'LIGORNA',
    'NOVAROMENTIN', 'SALUZZO', 'SANREMESE', 'SESTRI LEVANTE', 'VALENZANA', 'VARESE FC', 'VARESE',
    'BRENO', 'BRUSAPORTO', 'CALDIERO TERME', 'CASTELLANZESE', 'CHIEVO', 'CISERANO-BERGAMO',
    'LEON', 'OLTREPO', 'PAVIA', 'REAL CALEPINA', 'SCANZOROSCIATE', 'SONDRIO', 'VARESINA',
    'VILLA VALLE', 'VOGHERESE',
    'ADRIESE', 'ALTAVILLA', 'BASSANO', 'BRIAN LIGNANO', 'CALVI NOALE', 'CAMPODARSEGO',
    'CJARLINS MUZANE', 'CONEGLIANO', 'ESTE', 'FC OBERMAIS', 'LEGNAGO SALUS', 'LEGNAGO',
    'LUPARENSE', 'MESTRE', 'PORTOGRUARO', 'SAN LUIGI', 'UNION CLODIENSE', 'VIGASIO',
    'CITTADELLA VIS MODENA', 'CORREGGESE', 'CREMA', 'IMOLESE', 'LENTIGIONE', 'PIACENZA',
    'PRO PALAZZOLO', 'PRO SESTO', 'ROVATO VERTOVESE', 'SANGIULIANO CITY', 'SANTANGELO',
    'SANT ANGELO', 'SASSO MARCONI', 'SCD PROGRESSO', 'TREVIGLIESE', 'TROPICAL CORIANO'
  ]);

  /* —— CENTRO: Toscana, Umbria, Marche, Lazio —— */
  putArea('centro', [
    'FIORENTINA', 'ROMA', 'LAZIO', 'FROSINONE', 'EMPOLI', 'PISA', 'CARRARESE',
    'AREZZO', 'ASCOLI', 'LIVORNO', 'GROSSETO', 'GUBBIO', 'GUIDONIA', 'LATINA',
    'OSTIAMARE', 'PERUGIA', 'PIANESE', 'SAMBENEDETTESE', 'VIS PESARO',
    'PISTOIESE', 'SIENA', 'PRATO', 'TUTTOCUOIO',
    'CAMAIORE', 'CANNARA', 'FOLIGNO', 'FOLLONICA GAVORRANO', 'GHIVIBORGO',
    'MONTEVARCHI', 'ORVIETANA', 'POGGIBONSI', 'SAN DONATO', 'SCANDICCI',
    'SERAVEZZA POZZI', 'TAU', 'TERRANUOVA TRAIANA', 'TRESTINA', 'VIVI ALTOTEVERE',
    'ANCONA', 'ATLETICO ASCOLI', 'CASTELFIDARDO', 'FOSSOMBRONE', 'MACERATESE',
    'RECANATESE', 'SAMMAURESE', 'SORA', 'UNIPOMEZIA', 'VIGOR SENIGALLIA',
    'ALBALONGA', 'ANZIO CALCIO 1924', 'CASSINO', 'FLAMINIA', 'MONTESPACCATO',
    'REAL MONTEROTONDO', 'TRASTEVERE CALCIO', 'VALMONTONE'
  ]);

  /* —— SUD + ISOLE: Abruzzo, Molise, Campania, Puglia, Basilicata, Calabria, Sicilia, Sardegna —— */
  putArea('sud', [
    'NAPOLI', 'LECCE', 'CAGLIARI', 'PALERMO', 'BARI', 'SALERNITANA', 'CATANZARO',
    'AVELLINO', 'BENEVENTO', 'JUVE STABIA',
    'CAMPOBASSO', 'PESCARA', 'PINETO', 'TORRES',
    'ALTAMURA', 'AUDACE CERIGNOLA', 'BARLETTA', 'CASARANO', 'CASERTANA', 'CATANIA',
    'CAVESE', 'COSENZA', 'CROTONE', 'FOGGIA', 'GIUGLIANO', 'MONOPOLI', 'PICERNO',
    'POTENZA', 'SAVOIA', 'SCAFATESE', 'SORRENTO',
    'CHIETI', 'GIULIANOVA', 'LAQUILA', 'L AQUILA', 'NOTARESCO CALCIO', 'TERAMO',
    'TERMOLI', 'SAN MARINO CALCIO',
    'BUDONI', 'ISCHIA', 'LATTE DOLCE', 'MONASTIR', 'NOCERINA', 'OLBIA',
    'SARRABUS OGLIASTRA',
    'AC NARDO', 'A C NARDO', 'NARDO', 'ACERRANA', 'AFRAGOLESE', 'CITTA DI FASANO',
    'FERRANDINA', 'FIDELIS ANDRIA', 'FRANCAVILLA', 'GRAVINA', 'HERACLEA',
    'MANFREDONIA', 'MARTINA CALCIO', 'MARTINA', 'PAGANESE', 'POMPEI', 'REAL NORMANNA',
    'SARNESE', 'SS NOLA 1925', 'NOLA', 'VIRTUS FRANCAVILLA',
    'ACR MESSINA', 'MESSINA', 'ATHLETIC PALERMO', 'ENNA', 'GELA', 'GELBISON',
    'IGEA VIRTUS', 'MILAZZO', 'NISSA', 'PATERNO', 'PATERNÒ', 'REGGINA', 'SAMBIASE',
    'SANCATALDESE', 'VIBONESE', 'VIGOR LAMEZIA'
  ]);

  function areaOf(clubOrName) {
    var n = clubOrName && typeof clubOrName === 'object'
      ? (clubOrName.n || clubOrName.name)
      : clubOrName;
    var k = keyOf(n);
    if (AREA[k]) return AREA[k];
    if (/U23|PRIMAVERA|NEXT GEN/.test(k)) {
      var parent = k.replace(/\s*(U23|PRIMAVERA|NEXT GEN|UNDER 23).*$/, '').trim();
      if (AREA[parent]) return AREA[parent];
    }
    var stripped = k.replace(/^(AS |AC |US |SSD |FBC |FC |ASD |SS |ACR |LR )/, '');
    if (stripped !== k && AREA[stripped]) return AREA[stripped];
    return '';
  }

  function serieCGironeFromArea(area) {
    return AREA_TO_C[area] || '';
  }

  function serieCGironeFromD(letter) {
    var g = String(letter || '').toUpperCase();
    if ('ABCD'.indexOf(g) >= 0) return 'A';
    if ('EFG'.indexOf(g) >= 0) return 'B';
    return 'C';
  }

  function parseGirone(label) {
    var m = String(label || '').toUpperCase().match(/GIR(?:ONE|\.)\s*([A-I])/);
    return m ? m[1] : '';
  }

  function serieCGironeForClub(club) {
    var area = areaOf(club);
    if (area) return AREA_TO_C[area];
    var dGir = club && (club.catalogDGirone || club.dg || parseGirone(club && (club.catalogL || club.l)));
    if (dGir) return serieCGironeFromD(dGir);
    return 'A';
  }

  function serieDGironeForClub(club) {
    var dGir = club && (club.catalogDGirone || club.dg);
    if (dGir && SERIE_D_GIRONI.indexOf(String(dGir).toUpperCase()) >= 0) {
      return String(dGir).toUpperCase();
    }
    var catL = club && (club.catalogL || club.l);
    var catT = club && club.catalogT;
    if (Number(catT) === 4) {
      var g = parseGirone(catL);
      if (g && SERIE_D_GIRONI.indexOf(g) >= 0) return g;
    }
    var area = areaOf(club);
    if (area === 'nord') return 'B';
    if (area === 'centro') return 'E';
    return 'H';
  }

  function labelSerieC(club) {
    return 'SERIE C · GIRONE ' + serieCGironeForClub(club);
  }

  function labelSerieD(club) {
    return 'SERIE D · GIRONE ' + serieDGironeForClub(club);
  }

  var RULES = {
    serieC: {
      name: 'Serie C',
      gironi: SERIE_C_GIRONI.slice(),
      promoteTo: 'Serie B',
      rule: 'Girone A = Nord, Girone B = Centro, Girone C = Sud. Il vincitore di ogni girone sale in Serie B.'
    },
    serieD: {
      name: 'Serie D',
      gironi: SERIE_D_GIRONI.slice(),
      promoteTo: 'Serie C',
      rule: 'Il vincitore di ciascun girone sale in Serie C nel girone geografico della società (A Nord, B Centro, C Sud).'
    }
  };

  var BRAIN = {
    id: 'elisee-piramide-italia',
    role: 'cervello-pensante',
    mercatoUi: false,
    rules: [
      'In Serie C il vincitore di ogni girone (A, B, C) sale in Serie B.',
      'In Serie D il vincitore di ogni girone (A–I) sale in Serie C.',
      'Serie C Girone A = Nord Italia. Girone B = Centro Italia. Girone C = Sud Italia.',
      'Chi sale o scende in Serie C entra subito nel girone geografico della propria area.',
      'Unita di promozione = il girone, non la categoria intera.',
      'Ogni club si muove di una sola categoria a stagione, in base alla propria storia.',
      'Un top club puo scendere di 2 o 3 categorie in un colpo solo solo se e fallito.',
      'Se un club fallisce va indicato FALLITA e si mostra la categoria in cui riparte.',
      'Serie D ed Eccellenza sono possibili solo se la storia del club lo consente.'
    ],
    summary:
      'In Serie C il vincitore di ogni girone (A, B, C) sale in Serie B; in Serie D il vincitore di ogni girone sale in Serie C.'
  };

  function summaryText() {
    return BRAIN.summary + ' ' +
      'Serie C: Girone A Nord, Girone B Centro, Girone C Sud. ' +
      'Chi sale o scende in C entra nel girone della propria area.';
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

  root.EliseePiramide = {
    SERIE_C_GIRONI: SERIE_C_GIRONI,
    SERIE_D_GIRONI: SERIE_D_GIRONI,
    RULES: RULES,
    BRAIN: BRAIN,
    summaryText: summaryText,
    promoteLabel: promoteLabel,
    parseGirone: parseGirone,
    areaOf: areaOf,
    serieCGironeForClub: serieCGironeForClub,
    serieDGironeForClub: serieDGironeForClub,
    serieCGironeFromD: serieCGironeFromD,
    labelSerieC: labelSerieC,
    labelSerieD: labelSerieD,
    keyOf: keyOf
  };
})(typeof window !== 'undefined' ? window : this);
