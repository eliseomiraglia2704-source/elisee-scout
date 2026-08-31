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
    'AS BIELLESE', 'BIELLESE', 'ASTI', 'ALESSANDRIA', 'BORGOSESIA', 'BRA',
    'CAIRESE', 'CELLE VARAZZE', 'CHISOLA', 'CLUB MILANO',
    'DERTHONA FBC', 'DERTHONA', 'FEZZANESE', 'GOZZANO', 'IMPERIA', 'LASCARIS',
    'LAVAGNESE', 'LIGORNA', 'MILLESIMO',
    'NOVAROMENTIN', 'SALUZZO', 'SANREMESE', 'SESTRI LEVANTE', 'VALENZANA', 'VARESE FC', 'VARESE',
    'BRENO', 'BRUSAPORTO', 'CALDIERO TERME', 'CASTELLANZESE', 'CHIEVO', 'CISERANO-BERGAMO',
    'FIORENZUOLA', 'LEON', 'MILAN FUTURO', 'NIBBIANO & VALTIDONE', 'NIBBIANO',
    'OLTREPO', 'PAVIA', 'PAVONESE', 'REAL CALEPINA', 'ROVATO', 'ROVATO VERTOVESE',
    'SCANZOROSCIATE', 'SONDRIO', 'TRITIUM', 'VARESINA',
    'VILLA VALLE', 'VIRTUS VERONA', 'VOGHERESE',
    'ADRIESE', 'ALTAVILLA', 'BASSANO', 'BRIAN LIGNANO', 'CALVI NOALE', 'CAMPODARSEGO',
    'CJARLINS MUZANE', 'CONEGLIANO', 'ESTE', 'FC OBERMAIS', 'OBERMAIS', 'LME',
    'LEGNAGO SALUS', 'LEGNAGO', 'LUPARENSE', 'MESTRE', 'PORTOGRUARO', 'SANDONA', 'SANDONÀ',
    'SAN LUIGI', 'CALCIO SCHIO', 'SCHIO', 'TRIESTINA', 'UNION CLODIENSE',
    'VIGASIO', 'VIRTUS BOLZANO',
    'ARCONATESE', 'CITTADELLA VIS MODENA', 'CORREGGESE', 'CREMA', 'IMOLESE', 'LENTIGIONE',
    'PIACENZA', 'PONTEDERA', 'PRO PATRIA', 'PRO PALAZZOLO', 'PRO SESTO', 'ROVATO VERTOVESE',
    'SANGIULIANO CITY', 'SANTANGELO', 'SANT ANGELO', 'SOLBIATESE',
    'SASSO MARCONI', 'SCD PROGRESSO', 'TREVIGLIESE', 'TROPICAL CORIANO', 'USD CASATESE', 'CASATESE'
  ]);

  /* —— CENTRO: Toscana, Umbria, Marche, Lazio —— */
  putArea('centro', [
    'FIORENTINA', 'ROMA', 'LAZIO', 'FROSINONE', 'EMPOLI', 'PISA', 'CARRARESE',
    'AREZZO', 'ASCOLI', 'LIVORNO', 'GROSSETO', 'GUBBIO', 'GUIDONIA', 'LATINA',
    'OSTIAMARE', 'PERUGIA', 'PIANESE', 'SAMBENEDETTESE', 'VIS PESARO',
    'PISTOIESE', 'SIENA', 'PRATO', 'TUTTOCUOIO', 'LUCCHESE',
    'CAMAIORE', 'CANNARA', 'FOLIGNO', 'FOLLONICA GAVORRANO', 'GHIVIBORGO',
    'GRASSINA', 'MEZZOLARA', 'MONTEVARCHI', 'NUOVA TERNANA', 'ORVIETANA',
    'POGGIBONSI', 'RONDINELLA', 'SAN DONATO', 'SCANDICCI',
    'SERAVEZZA POZZI', 'TAU', 'TERRANUOVA TRAIANA', 'TRESTINA', 'VIVI ALTOTEVERE',
    'ANCONA', 'ANGELANA', 'ATLETICO ASCOLI', 'CASTELFIDARDO', 'FOSSOMBRONE',
    'K-SPORT MONTECCHIO', 'LANCIANO FC', 'MACERATESE', 'PIETRALUNGHESE',
    'RECANATESE', 'SAMMAURESE', 'SANTEGIDIESE', 'SORA', 'UNIPOMEZIA', 'VIGOR SENIGALLIA',
    'ALBALONGA', 'ANZIO CALCIO 1924', 'ARANOVA', 'ATL. LODIGIANI', 'ATLETICO LODIGIANI',
    'CASSINO', 'CITTA DI ANAGNI', 'CITTÀ DI ANAGNI', 'FLAMINIA', 'MONTESPACCATO',
    'REAL MONTEROTONDO', 'TRASTEVERE CALCIO', 'VALMONTONE', 'VIGOR CAMPAGNANO'
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
    'BUDONI', 'ISCHIA', 'LATTE DOLCE', 'MONASTIR', 'NOCERINA', 'OLBIA', 'OSSESE',
    'SARRABUS OGLIASTRA', 'VENAFRO',
    'AC NARDO', 'A C NARDO', 'NARDO', 'ACERRANA', 'AFRAGOLESE', 'BISCEGLIE', 'BRINDISI',
    'CITTA DI FASANO', 'EBOLITANA', 'FERRANDINA', 'FIDELIS ANDRIA', 'FRANCAVILLA',
    'GLADIATOR', 'GRAVINA', 'HERACLEA',
    'MANFREDONIA', 'MARTINA CALCIO', 'MARTINA', 'MELFI 1929', 'MELFI',
    'PAGANESE', 'PALMESE', 'POMPEI', 'REAL AVERSA', 'REAL FORIO', 'REAL NORMANNA',
    'SARNESE', 'SS NOLA 1925', 'NOLA', 'TURRIS', 'VIRTUS FRANCAVILLA',
    'ACR MESSINA', 'MESSINA', 'ATHLETIC PALERMO', 'CALCIO AVOLA', 'AVOLA',
    'CASTRUMFAVARA', 'DIGIESSE', 'ENNA', 'GELA', 'GELBISON',
    'IGEA VIRTUS', 'LICATA', 'MILAZZO', 'MODICA', 'NISSA',
    'PATERNO', 'PATERNÒ', 'RAGUSA', 'REGGINA', 'SAMBIASE',
    'SANCATALDESE', 'SIRACUSA', 'TRAPANI', 'VIBONESE', 'VIGOR LAMEZIA'
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
    var catL = String((club && (club.catalogL || club.l)) || '').toUpperCase();
    var catT = club && club.catalogT;
    if (Number(catT) === 4) {
      var g = parseGirone(catL);
      if (g && SERIE_D_GIRONI.indexOf(g) >= 0) return g;
    }
    // Analisi da testo campionato regionale (es. Eccellenza Piemonte -> Girone A)
    if (catL.indexOf('PIEMONTE') >= 0 || catL.indexOf('LIGURIA') >= 0 || catL.indexOf('VALLE D') >= 0) return 'A';
    if (catL.indexOf('LOMBARDIA') >= 0) return 'B';
    if (catL.indexOf('VENETO') >= 0 || catL.indexOf('FRIULI') >= 0 || catL.indexOf('TRENTINO') >= 0) return 'C';
    if (catL.indexOf('EMILIA') >= 0 || catL.indexOf('ROMAGNA') >= 0) return 'D';
    if (catL.indexOf('TOSCANA') >= 0 || catL.indexOf('UMBRIA') >= 0) return 'E';
    if (catL.indexOf('MARCHE') >= 0 || catL.indexOf('ABRUZZO') >= 0 || catL.indexOf('MOLISE') >= 0) return 'F';
    if (catL.indexOf('LAZIO') >= 0 || catL.indexOf('SARDEGNA') >= 0) return 'G';
    if (catL.indexOf('PUGLIA') >= 0 || catL.indexOf('BASILICATA') >= 0) return 'H';
    if (catL.indexOf('CALABRIA') >= 0 || catL.indexOf('SICILIA') >= 0) return 'I';
    if (catL.indexOf('CAMPANIA') >= 0) return 'H';

    var cName = String((club && (club.n || club.name || club.city)) || '').toUpperCase();
    if (/POTENZA|MATERA|BARI|FOGGIA|TARANTO|LECCE|BRINDISI|ANDRIA|BITONTO|NARDO|GALLIPOLI|TRANI|CERIGNOLA|ALTAMURA|FRANCAVILLA|FASANO|MANFREDONIA|MELFI|GRAVINA|CASARANO|UGENTO|TAURISANO|SQUINZANO|NOVOLI|GALATINA|CANOSA|CAMPI|RACALE|ACQUAVIVA|MAGLIE|SPINAZZOLA|OSTUNI|POLIMNIA/.test(cName)) return 'H';
    if (/REGGINA|CATANIA|MESSINA|PALERMO|TRAPANI|SIRACUSA|COSENZA|CROTONE|CATANZARO|VIBONESE|LAMEZIA|SAMBIASE|ACIREALE|GELA|ENNA|RAGUSA|LICATA|NISSA|MILAZZO/.test(cName)) return 'I';
    if (/TORINO|CUNEO|CHIERI|FOSSANO|ALBA|ALESSANDRIA|ASTI|NOVARA|VERCELLI|BIELLA|CARMAGNOLA|CENTALLO|MONREGALE|MORETTA|OVADA|DRONERO|VILLAFRANCA|VANCHIGLIA|SAN DAMIANO|SAVIO|GAVI|SAVONA|GENOVA|SANREMO|IMPERIA|LA SPEZIA/.test(cName)) return 'A';
    if (/MILANO|BERGAMO|BRESCIA|MONZA|COMO|LECCO|CREMONA|PAVIA|VARESE|LODI|MANTOVA|SONDRIO/.test(cName)) return 'B';
    if (/VENEZIA|VERONA|PADOVA|VICENZA|TREVISO|BELLUNO|ROVIGO|TRENTO|BOLZANO|TRIESTE|UDINE|PORDENONE|GORIZIA/.test(cName)) return 'C';
    if (/BOLOGNA|PARMA|MODENA|REGGIO EMILIA|FERRARA|RAVENNA|FORLI|CESENA|RIMINI|PIACENZA/.test(cName)) return 'D';
    if (/FIRENZE|PISA|LIVORNO|LUCCA|SIENA|AREZZO|GROSSETO|PISTOIA|PERUGIA|TERNI/.test(cName)) return 'E';
    if (/ANCONA|PESARO|MACERATA|ASCOLI|FERMO|L'AQUILA|PESCARA|CHIETI|TERAMO|CAMPOBASSO|ISERNIA/.test(cName)) return 'F';
    if (/ROMA|LATINA|FROSINONE|VITERBO|RIETI|CAGLIARI|SASSARI|OLBIA|NUORO|ORISTANO/.test(cName)) return 'G';

    var area = areaOf(club);
    if (area === 'nord') return 'A';
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
      'Se il giocatore resta nella squadra fallita, overall e valore crollano. Se accetta un\'altra competizione, overall e prezzo si adeguano a quell\'offerta.',
      'Juve U23, Inter U23, Milan U23 e Atalanta U23 sono seconde squadre, non giovanili. Un giovane puo passare dalla U23 (C o B) alla prima squadra in Serie A.',
      'Serie D ed Eccellenza sono possibili solo se la storia del club lo consente.',
      'Le 3 offerte di mercato devono stare nello stesso piano del giocatore (OVR + categoria). Vietato mescolare un top europeo con C/D.'
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

  var CATEGORY_PRICE_RANGES = {
    'serie-a': { name: 'Serie A', min: 5000000, max: 150000000, minM: 5.0, maxM: 150.0, label: 'min. 5 Mln.€ / max. 150 Mln.€' },
    'serie-b': { name: 'Serie B', min: 250000, max: 4900000, minM: 0.25, maxM: 4.9, label: 'min. 250 mila€ / max. 4,9 Mln.€' },
    'serie-c': { name: 'Serie C', min: 50000, max: 249000, minM: 0.05, maxM: 0.249, label: 'min. 50 mila€ / max. 249 mila€' },
    'serie-d': { name: 'Serie D', min: 9900, max: 49000, minM: 0.0099, maxM: 0.049, label: 'min. 9,9 mila€ / max. 49 mila€' },
    'eccellenza': { name: 'Eccellenza', min: 900, max: 10000, minM: 0.0009, maxM: 0.010, label: 'min. 900€ / max. 10 mila€' },
    'promozione': { name: 'Promozione', min: 450, max: 899, minM: 0.00045, maxM: 0.000899, label: 'min. 450€ / max. 899€' },
    'prima-cat': { name: 'Prima Categoria', min: 300, max: 449, minM: 0.0003, maxM: 0.000449, label: 'min. 300€ / max. 449€' },
    'seconda-cat': { name: 'Seconda Categoria', min: 100, max: 299, minM: 0.0001, maxM: 0.000299, label: 'min. 100€ / max. 299€' },
    'terza-cat': { name: 'Terza Categoria', min: 10, max: 100, minM: 0.00001, maxM: 0.0001, label: 'min. 100€ / max. 100€' }
  };

  var CATEGORY_OVR_RANGES = {
    'serie-a': { name: 'Serie A', min: 76, max: 93, label: 'min. 76 / max. 93' },
    'serie-b': { name: 'Serie B', min: 59, max: 75, label: 'min. 59 / max. 75' },
    'serie-c': { name: 'Serie C', min: 43, max: 58, label: 'min. 43 / max. 58' },
    'serie-d': { name: 'Serie D', min: 30, max: 42, label: 'min. 30 / max. 42' },
    'eccellenza': { name: 'Eccellenza', min: 24, max: 29, label: 'min. 24 / max. 29' },
    'promozione': { name: 'Promozione', min: 19, max: 23, label: 'min. 19 / max. 23' },
    'prima-cat': { name: 'Prima Categoria', min: 12, max: 18, label: 'min. 12 / max. 18' },
    'seconda-cat': { name: 'Seconda Categoria', min: 5, max: 11, label: 'min. 5 / max. 11' },
    'terza-cat': { name: 'Terza Categoria', min: 0, max: 4, label: 'min. 0 / max. 4' }
  };

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
    keyOf: keyOf,
    CATEGORY_PRICE_RANGES: CATEGORY_PRICE_RANGES,
    CATEGORY_OVR_RANGES: CATEGORY_OVR_RANGES
  };
})(typeof window !== 'undefined' ? window : this);
