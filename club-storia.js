/**
 * ELISEE SCOUT — Storia autonoma di ogni club del minigioco
 *
 * Per ogni squadra si memorizzano le stagioni approssimate (ultimi ~40 anni)
 * in A / B / C / D. Da quei numeri il motore ricava da solo:
 *   - home  = campionato in cui ha passato più tempo
 *   - ceil  = non può salire sopra (1=A … 4=D)
 *   - floor = non può scendere sotto
 *   - odds  = P(promozione), P(permanenza), P(retrocessione) a un dato livello
 *
 * Esempio: Udinese ~36 A + 4 B + 0 C + 0 D
 *   → ceil A, floor B, mai Serie C. Se cade in B, rimbalza quasi sempre.
 *
 * Vivi Altotevere ~0 A + 0 B + 1 C + 39 D
 *   → ceil C (vincitore di girone D), floor D, mai A/B.
 */
(function (root) {
  'use strict';

  var P = {};

  var U23_C = { a: 0, b: 0, c: 40, d: 0 };
  var U23_D = { a: 0, b: 0, c: 6, d: 34 };

  function put(names, seasons) {
    var spec = derive(seasons);
    names.forEach(function (n) {
      P[keyOf(n)] = spec;
    });
  }

  function derive(seasons) {
    var a = Math.max(0, Number(seasons.a) || 0);
    var b = Math.max(0, Number(seasons.b) || 0);
    var c = Math.max(0, Number(seasons.c) || 0);
    var d = Math.max(0, Number(seasons.d) || 0);
    var tot = a + b + c + d || 1;
    var counts = [0, a, b, c, d];
    var home = 4;
    var best = -1;
    var t;
    for (t = 1; t <= 4; t++) {
      if (counts[t] >= best) {
        best = counts[t];
        home = t;
      }
    }
    var ceil = 4;
    for (t = 1; t <= 4; t++) {
      if (counts[t] > 0) {
        ceil = t;
        break;
      }
    }
    if (a === 0 && b === 0 && ceil === 4) ceil = 3;

    var floor = 4;
    for (t = 4; t >= 1; t--) {
      if (counts[t] >= 3) {
        floor = t;
        break;
      }
    }
    if (c === 0 && d === 0) floor = Math.min(floor, 2);
    if (a >= 34 && b <= 2 && c === 0 && d === 0) floor = 1;
    if (a >= 30 && c === 0 && d === 0) floor = Math.min(floor, 2);

    var stay = counts[home] / tot;
    var promo = home > 1 ? counts[home - 1] / tot : 0;
    var rel = home < 4 ? counts[home + 1] / tot : 0;

    return {
      home: home,
      floor: floor,
      ceil: ceil,
      rel: rel,
      promo: promo,
      stay: stay,
      seasons: { a: a, b: b, c: c, d: d }
    };
  }

  /* —— Serie A / grandi —— */
  put(['INTER', 'MILAN', 'ROMA'], { a: 40, b: 0, c: 0, d: 0 });
  put(['JUVENTUS'], { a: 39, b: 1, c: 0, d: 0 });
  put(['NAPOLI'], { a: 36, b: 4, c: 0, d: 0 });
  put(['LAZIO'], { a: 37, b: 3, c: 0, d: 0 });
  put(['ATALANTA'], { a: 30, b: 10, c: 0, d: 0 });
  put(['FIORENTINA'], { a: 34, b: 6, c: 0, d: 0 });
  put(['BOLOGNA'], { a: 28, b: 12, c: 0, d: 0 });
  put(['TORINO'], { a: 30, b: 10, c: 0, d: 0 });
  put(['UDINESE'], { a: 36, b: 4, c: 0, d: 0 });
  put(['GENOA'], { a: 20, b: 16, c: 4, d: 0 });
  put(['CAGLIARI'], { a: 24, b: 16, c: 0, d: 0 });
  put(['SAMPDORIA'], { a: 26, b: 14, c: 0, d: 0 });
  put(['VERONA'], { a: 14, b: 18, c: 8, d: 0 });
  put(['EMPOLI'], { a: 14, b: 18, c: 8, d: 0 });
  put(['LECCE'], { a: 16, b: 14, c: 10, d: 0 });
  put(['VENEZIA'], { a: 5, b: 12, c: 15, d: 8 });
  put(['SASSUOLO'], { a: 11, b: 10, c: 13, d: 6 });
  put(['PARMA'], { a: 20, b: 8, c: 6, d: 6 });
  put(['MONZA'], { a: 8, b: 20, c: 0, d: 0 });
  put(['COMO'], { a: 4, b: 8, c: 10, d: 18 });
  put(['FROSINONE'], { a: 4, b: 12, c: 20, d: 4 });

  /* —— Serie B / yo-yo A-B-C —— */
  put(['PALERMO'], { a: 12, b: 14, c: 8, d: 6 });
  put(['BARI'], { a: 8, b: 16, c: 12, d: 4 });
  put(['SPEZIA'], { a: 4, b: 16, c: 18, d: 2 });
  put(['PISA'], { a: 3, b: 18, c: 17, d: 2 });
  put(['CREMONESE'], { a: 3, b: 18, c: 17, d: 2 });
  put(['CESENA'], { a: 3, b: 14, c: 15, d: 8 });
  put(['CATANZARO'], { a: 2, b: 12, c: 22, d: 4 });
  put(['SALERNITANA'], { a: 4, b: 12, c: 18, d: 6 });
  put(['BRESCIA'], { a: 6, b: 20, c: 12, d: 2 });
  put(['PADOVA'], { a: 3, b: 16, c: 18, d: 3 });
  put(['VICENZA', 'LR VICENZA', 'L.R. VICENZA', 'L R VICENZA'], { a: 4, b: 16, c: 16, d: 4 });
  put(['MODENA'], { a: 0, b: 22, c: 16, d: 2 });
  put(['ASCOLI'], { a: 4, b: 18, c: 14, d: 4 });
  put(['AVELLINO'], { a: 4, b: 12, c: 18, d: 6 });
  put(['BENEVENTO'], { a: 2, b: 10, c: 22, d: 6 });
  put(['SUDTIROL', 'SÜDTIROL'], { a: 0, b: 8, c: 28, d: 4 });
  put(['MANTOVA'], { a: 1, b: 8, c: 18, d: 13 });
  put(['AREZZO'], { a: 0, b: 8, c: 20, d: 12 });
  put(['ENTELLA', 'VIRTUS ENTELLA'], { a: 0, b: 8, c: 20, d: 12 });
  put(['CARRARESE'], { a: 0, b: 6, c: 22, d: 12 });
  put(['JUVE STABIA'], { a: 0, b: 8, c: 22, d: 10 });

  /* —— Serie C storiche (alcune hanno toccato A/B) —— */
  put(['PERUGIA'], { a: 6, b: 12, c: 16, d: 6 });
  put(['PESCARA'], { a: 4, b: 14, c: 16, d: 6 });
  put(['CATANIA'], { a: 8, b: 12, c: 12, d: 8 });
  put(['REGGIANA'], { a: 3, b: 10, c: 20, d: 7 });
  put(['COSENZA'], { a: 0, b: 10, c: 22, d: 8 });
  put(['CROTONE'], { a: 3, b: 10, c: 20, d: 7 });
  put(['FOGGIA'], { a: 0, b: 0, c: 28, d: 12 });
  put(['LIVORNO'], { a: 8, b: 10, c: 12, d: 10 });
  put(['CITTADELLA'], { a: 0, b: 16, c: 22, d: 2 });
  put(['LATINA'], { a: 0, b: 6, c: 22, d: 12 });
  put(['NOVARA'], { a: 1, b: 10, c: 20, d: 9 });
  put(['ALBINOLEFFE'], { a: 0, b: 10, c: 24, d: 6 });
  put(['LECCO'], { a: 0, b: 6, c: 20, d: 14 });
  put(['CARPI'], { a: 1, b: 8, c: 20, d: 11 });
  put(['LUMEZZANE'], { a: 0, b: 0, c: 24, d: 16 });
  put(['GIANA ERMINIO'], { a: 0, b: 0, c: 22, d: 18 });
  put(['RENATE'], { a: 0, b: 0, c: 24, d: 16 });
  put(['PRO VERCELLI'], { a: 0, b: 8, c: 20, d: 12 });
  put(['TRENTO'], { a: 0, b: 0, c: 18, d: 22 });
  put(['CAMPOBASSO'], { a: 0, b: 2, c: 18, d: 20 });
  put(['GUBBIO'], { a: 0, b: 1, c: 24, d: 15 });
  put(['PINETO'], { a: 0, b: 0, c: 16, d: 24 });
  put(['RAVENNA'], { a: 0, b: 4, c: 18, d: 18 });
  put(['SAMBENEDETTESE'], { a: 0, b: 6, c: 18, d: 16 });
  put(['TORRES'], { a: 0, b: 0, c: 20, d: 20 });
  put(['VIS PESARO'], { a: 0, b: 0, c: 20, d: 20 });
  put(['POTENZA'], { a: 0, b: 2, c: 22, d: 16 });
  put(['MONOPOLI'], { a: 0, b: 0, c: 22, d: 18 });
  put(['CASERTANA'], { a: 0, b: 4, c: 22, d: 14 });
  put(['AUDACE CERIGNOLA'], { a: 0, b: 0, c: 16, d: 24 });
  put(['SORRENTO'], { a: 0, b: 2, c: 16, d: 22 });
  put(['GIUGLIANO'], { a: 0, b: 0, c: 14, d: 26 });
  put(['ALTAMURA'], { a: 0, b: 0, c: 10, d: 30 });
  put(['CASARANO'], { a: 0, b: 0, c: 12, d: 28 });
  put(['CAVESE'], { a: 0, b: 2, c: 16, d: 22 });
  put(['PICERNO'], { a: 0, b: 0, c: 14, d: 26 });
  put(['ALCIONE MILANO', 'ALCIONE'], { a: 0, b: 0, c: 6, d: 34 });
  put(['ARZIGNANO'], { a: 0, b: 0, c: 12, d: 28 });
  put(['DOLOMITI BELLUNESI'], { a: 0, b: 0, c: 4, d: 36 });
  put(['FOLGORE CARATESE'], { a: 0, b: 0, c: 6, d: 34 });
  put(['OSPITALETTO'], { a: 0, b: 0, c: 4, d: 36 });
  put(['PERGOLETTESE'], { a: 0, b: 0, c: 18, d: 22 });
  put(['GUIDONIA'], { a: 0, b: 0, c: 4, d: 36 });
  put(['PIANESE'], { a: 0, b: 0, c: 8, d: 32 });
  put(['FORLI', 'FORLÌ'], { a: 0, b: 2, c: 14, d: 24 });
  put(['GROSSETO'], { a: 0, b: 6, c: 16, d: 18 });
  put(['BARLETTA'], { a: 0, b: 2, c: 14, d: 24 });
  put(['SAVOIA'], { a: 0, b: 4, c: 14, d: 22 });
  put(['SCAFATESE'], { a: 0, b: 0, c: 10, d: 30 });
  put(['TREVISO'], { a: 1, b: 8, c: 14, d: 17 });
  put(['DESENZANO'], { a: 0, b: 0, c: 8, d: 32 });
  put(['VADO'], { a: 0, b: 0, c: 10, d: 30 });
  put(['OSTIAMARE'], { a: 0, b: 0, c: 6, d: 34 });

  /* —— U23: bloccate in C (o D→C). Mai A/B. —— */
  put(['JUVENTUS U23', 'INTER U23', 'ATALANTA U23'], U23_C);
  put(['MILAN U23'], U23_D);

  /* —— Serie D con passato C/B/A —— */
  put(['SIENA'], { a: 8, b: 8, c: 10, d: 14 });
  put(['REGGINA'], { a: 9, b: 10, c: 12, d: 9 });
  put(['ACR MESSINA', 'MESSINA'], { a: 3, b: 8, c: 14, d: 15 });
  put(['PIACENZA'], { a: 8, b: 10, c: 10, d: 12 });
  put(['CHIEVO'], { a: 17, b: 10, c: 6, d: 7 });
  put(['ANCONA'], { a: 2, b: 8, c: 14, d: 16 });
  put(['NOCERINA'], { a: 0, b: 4, c: 16, d: 20 });
  put(['TERAMO'], { a: 0, b: 2, c: 18, d: 20 });
  put(['VARESE FC', 'VARESE'], { a: 0, b: 8, c: 14, d: 18 });
  put(['PRATO'], { a: 0, b: 2, c: 18, d: 20 });
  put(['PISTOIESE'], { a: 0, b: 6, c: 16, d: 18 });
  put(['FIDELIS ANDRIA'], { a: 0, b: 4, c: 16, d: 20 });
  put(['VIRTUS FRANCAVILLA'], { a: 0, b: 0, c: 14, d: 26 });
  put(['PAGANESE'], { a: 0, b: 0, c: 14, d: 26 });
  put(['MARTINA CALCIO', 'MARTINA'], { a: 0, b: 2, c: 14, d: 24 });
  put(['OLBIA'], { a: 0, b: 0, c: 16, d: 24 });
  put(['CASSINO'], { a: 0, b: 0, c: 10, d: 30 });
  put(['LAQUILA', 'L AQUILA', 'L\'AQUILA'], { a: 0, b: 2, c: 14, d: 24 });
  put(['MACERATESE'], { a: 0, b: 0, c: 12, d: 28 });
  put(['RECANATESE'], { a: 0, b: 0, c: 12, d: 28 });
  put(['FOLIGNO'], { a: 0, b: 0, c: 12, d: 28 });
  put(['PAVIA'], { a: 0, b: 2, c: 14, d: 24 });
  put(['LEGNAGO SALUS', 'LEGNAGO'], { a: 0, b: 0, c: 12, d: 28 });
  put(['PRO SESTO'], { a: 0, b: 0, c: 14, d: 26 });
  put(['IMOLESE'], { a: 0, b: 0, c: 12, d: 28 });
  put(['MONTEVARCHI'], { a: 0, b: 2, c: 14, d: 24 });
  put(['SESTRI LEVANTE'], { a: 0, b: 0, c: 10, d: 30 });
  put(['SANREMESE'], { a: 0, b: 2, c: 12, d: 26 });
  put(['VIBONESE'], { a: 0, b: 0, c: 14, d: 26 });
  put(['GELA'], { a: 0, b: 0, c: 10, d: 30 });
  put(['MANFREDONIA'], { a: 0, b: 2, c: 12, d: 26 });
  put(['CHIETI'], { a: 0, b: 2, c: 14, d: 24 });
  put(['GIULIANOVA'], { a: 0, b: 2, c: 14, d: 24 });
  put(['ISCHIA'], { a: 0, b: 0, c: 10, d: 30 });
  put(['BASSANO'], { a: 0, b: 0, c: 14, d: 26 });
  put(['MESTRE'], { a: 0, b: 2, c: 10, d: 28 });
  put(['PORTOGRUARO'], { a: 0, b: 4, c: 10, d: 26 });
  put(['UNION CLODIENSE'], { a: 0, b: 0, c: 8, d: 32 });
  put(['SANGIULIANO CITY'], { a: 0, b: 0, c: 6, d: 34 });
  put(['FOLLONICA GAVORRANO'], { a: 0, b: 0, c: 8, d: 32 });
  put(['SAN DONATO'], { a: 0, b: 0, c: 8, d: 32 });
  put(['GOZZANO'], { a: 0, b: 0, c: 8, d: 32 });
  put(['LIGORNA'], { a: 0, b: 0, c: 6, d: 34 });
  put(['DERTHONA FBC', 'DERTHONA'], { a: 0, b: 0, c: 10, d: 30 });
  put(['VIGOR LAMEZIA'], { a: 0, b: 0, c: 10, d: 30 });
  put(['GELBISON'], { a: 0, b: 0, c: 8, d: 32 });
  put(['SS NOLA 1925', 'NOLA'], { a: 0, b: 2, c: 10, d: 28 });
  put(['TARANTO'], { a: 0, b: 6, c: 18, d: 16 });
  put(['TERNANA'], { a: 0, b: 16, c: 20, d: 4 });
  put(['SPAL'], { a: 3, b: 14, c: 16, d: 7 });
  put(['TRIESTINA'], { a: 0, b: 10, c: 18, d: 12 });
  put(['PORDENONE'], { a: 0, b: 6, c: 16, d: 18 });

  /* —— Serie D di paese: possono vincere il girone (→ C), mai B/A —— */
  var VILLAGE = { a: 0, b: 0, c: 2, d: 38 };
  put([
    'AS BIELLESE', 'ASTI', 'CAIRESE', 'CELLE VARAZZE', 'CHISOLA', 'CLUB MILANO',
    'IMPERIA', 'LAVAGNESE', 'NOVAROMENTIN', 'SALUZZO', 'VALENZANA',
    'BRENO', 'BRUSAPORTO', 'CALDIERO TERME', 'CASTELLANZESE', 'CISERANO-BERGAMO',
    'LEON', 'OLTREPO', 'REAL CALEPINA', 'SCANZOROSCIATE', 'SONDRIO', 'VARESINA',
    'VILLA VALLE', 'VOGHERESE',
    'ADRIESE', 'ALTAVILLA', 'BRIAN LIGNANO', 'CALVI NOALE', 'CAMPODARSEGO',
    'CJARLINS MUZANE', 'CONEGLIANO', 'ESTE', 'FC OBERMAIS', 'LUPARENSE',
    'SAN LUIGI', 'VIGASIO',
    'CITTADELLA VIS MODENA', 'CORREGGESE', 'CREMA', 'LENTIGIONE', 'PRO PALAZZOLO',
    'ROVATO VERTOVESE', 'SANTANGELO', 'SANT\'ANGELO', 'SASSO MARCONI',
    'SCD PROGRESSO', 'TREVIGLIESE', 'TROPICAL CORIANO', 'TUTTOCUOIO',
    'CAMAIORE', 'CANNARA', 'GHIVIBORGO', 'ORVIETANA', 'POGGIBONSI', 'SCANDICCI',
    'SERAVEZZA POZZI', 'TAU', 'TERRANUOVA TRAIANA', 'TRESTINA', 'VIVI ALTOTEVERE',
    'ATLETICO ASCOLI', 'CASTELFIDARDO', 'FOSSOMBRONE', 'NOTARESCO CALCIO',
    'SAMMAURESE', 'SAN MARINO CALCIO', 'SORA', 'TERMOLI', 'UNIPOMEZIA',
    'VIGOR SENIGALLIA',
    'ALBALONGA', 'ANZIO CALCIO 1924', 'BUDONI', 'FLAMINIA', 'LATTE DOLCE',
    'MONASTIR', 'MONTESPACCATO', 'REAL MONTEROTONDO', 'SARRABUS OGLIASTRA',
    'TRASTEVERE CALCIO', 'VALMONTONE',
    'AC NARDO', 'A.C NARDO', 'A.C NARDÒ', 'NARDO', 'ACERRANA', 'AFRAGOLESE',
    'CITTA DI FASANO', 'FERRANDINA', 'FRANCAVILLA', 'GRAVINA', 'HERACLEA',
    'POMPEI', 'REAL NORMANNA', 'SARNESE',
    'ATHLETIC PALERMO', 'ENNA', 'IGEA VIRTUS', 'MILAZZO', 'NISSA', 'PATERNO',
    'PATERNÒ', 'SAMBIASE', 'SANCATALDESE'
  ], VILLAGE);

  /* Lucchetti espliciti: non dipendono dai pesi e non si possono bypassare. */
  var HARD = {};
  function lock(names, ceil, floor) {
    names.forEach(function (n) {
      var k = keyOf(n);
      HARD[k] = { ceil: ceil, floor: floor };
      var spec = P[k] ? Object.assign({}, P[k]) : derive({ a: 0, b: 0, c: 0, d: 40 });
      spec.ceil = ceil;
      spec.floor = floor;
      if (spec.home < ceil) spec.home = ceil;
      if (spec.home > floor) spec.home = floor;
      P[k] = spec;
    });
  }
  lock(['INTER', 'MILAN', 'JUVENTUS', 'NAPOLI', 'ROMA', 'LAZIO', 'ATALANTA'], 1, 1);
  lock(['FIORENTINA', 'BOLOGNA', 'TORINO', 'UDINESE'], 1, 2);
  lock(
    ['MONZA', 'COMO', 'SASSUOLO', 'PARMA', 'VENEZIA', 'FROSINONE', 'CAGLIARI', 'GENOA', 'LECCE', 'EMPOLI', 'VERONA', 'SAMPDORIA'],
    1,
    2
  );
  lock(['MODENA'], 2, 3);
  lock(['FOGGIA'], 3, 4);
  lock(
    ['CALDIERO TERME', 'VIVI ALTOTEVERE', 'FERRANDINA', 'ATHLETIC PALERMO', 'TAU'],
    3,
    4
  );
  lock(['JUVENTUS U23', 'INTER U23', 'ATALANTA U23'], 3, 3);
  lock(['MILAN U23'], 3, 4);

  function keyOf(name) {
    return String(name || '')
      .toUpperCase()
      .replace(/Ü/g, 'U')
      .replace(/Ö/g, 'O')
      .replace(/Ä/g, 'A')
      .replace(/[.'’`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isU23Name(name) {
    return /U23|PRIMAVERA|NEXT GEN|UNDER 23/.test(keyOf(name));
  }

  function lookup(name) {
    var k = keyOf(name);
    if (!k) return null;
    if (P[k]) return P[k];
    if (isU23Name(k)) return derive(U23_C);
    var stripped = k.replace(/^(AS |AC |US |SSD |FBC |FC |ASD |SS |ACR |LR )/, '');
    if (stripped !== k && P[stripped]) return P[stripped];
    return null;
  }

  function fallbackFromHome(home, name) {
    if (isU23Name(name)) return derive(home >= 4 ? U23_D : U23_C);
    if (home <= 1) return derive({ a: 28, b: 10, c: 2, d: 0 });
    if (home === 2) return derive({ a: 4, b: 18, c: 16, d: 2 });
    if (home === 3) return derive({ a: 0, b: 4, c: 24, d: 12 });
    return derive(VILLAGE);
  }

  function profile(club) {
    var n = club && (club.n || club.name);
    if (club && club.world) {
      return {
        home: 1, floor: 1, ceil: 1, rel: 0.02, promo: 0, stay: 0.98,
        seasons: { a: 40, b: 0, c: 0, d: 0 }, known: true
      };
    }
    var hit = lookup(n);
    var home = Number((club && club.homeTier) != null ? club.homeTier : (club && club.t) || 4);
    var spec = hit
      ? Object.assign({ known: true }, hit)
      : Object.assign({ known: false }, fallbackFromHome(home, n));
    var hard = HARD[keyOf(n)];
    if (hard) {
      spec.ceil = hard.ceil;
      spec.floor = hard.floor;
      if (spec.home < spec.ceil) spec.home = spec.ceil;
      if (spec.home > spec.floor) spec.home = spec.floor;
    }
    return spec;
  }

  function parseGirone(label) {
    var m = String(label || '').toUpperCase().match(/GIR(?:ONE|\.)\s*([A-I])/);
    return m ? m[1] : '';
  }

  function serieCGirone(letter) {
    var g = String(letter || 'A').toUpperCase();
    if (g === 'A' || g === 'B' || g === 'C') return g;
    return dGironeToSerieC(g);
  }

  function dGironeToSerieC(letter) {
    var g = String(letter || 'A').toUpperCase();
    if ('ABC'.indexOf(g) >= 0) return 'A';
    if ('DEFG'.indexOf(g) >= 0) return 'B';
    return 'C';
  }

  function piramide() {
    return (typeof window !== 'undefined' && window.EliseePiramide) ? window.EliseePiramide : null;
  }

  function labelFor(club, destT, atStart) {
    destT = Number(destT);
    var catL = club && (club.catalogL || club.l);
    var catT = club && club.catalogT;
    var dGir = club && (club.catalogDGirone || club.dg);
    var Pira = piramide();
    if (destT === 1) return 'SERIE A';
    if (destT === 2) return 'SERIE B';
    if (destT === 3) {
      if (atStart && catT === 3 && catL) {
        var g0 = parseGirone(catL);
        return 'SERIE C · GIRONE ' + (g0 && 'ABC'.indexOf(g0) >= 0 ? g0 : 'A');
      }
      if (Pira && Pira.labelSerieC) return Pira.labelSerieC(club);
      return 'SERIE C · GIRONE ' + dGironeToSerieC(parseGirone(catL) || dGir || 'A');
    }
    if (atStart && catT === 4 && catL) return catL;
    if (Pira && Pira.labelSerieD) return Pira.labelSerieD(club);
    if (dGir && 'ABCDEFGHI'.indexOf(String(dGir).toUpperCase()) >= 0) {
      return 'SERIE D · GIRONE ' + String(dGir).toUpperCase();
    }
    var fromC = serieCGirone(parseGirone(catL) || 'A');
    var dFromC = { A: 'B', B: 'E', C: 'H' };
    return 'SERIE D · GIRONE ' + (dFromC[fromC] || 'A');
  }

  function enforce(club, proposedT, atStart) {
    var s = profile(club);
    var catT = club && club.catalogT != null ? Number(club.catalogT) : null;
    var dest;
    if (atStart && catT != null) dest = catT;
    else dest = clampTierOf(club, proposedT);
    if (dest < s.ceil) dest = s.ceil;
    if (dest > s.floor) dest = s.floor;
    if (atStart && catT != null && catT >= s.ceil && catT <= s.floor) dest = catT;
    return { t: dest, l: labelFor(club, dest, !!atStart) };
  }

  function legalTier(club, tier) {
    var s = profile(club);
    var t = Number(tier);
    return t >= s.ceil && t <= s.floor;
  }

  function clampTierOf(club, current) {
    var s = profile(club);
    var now = Number(current);
    if (!(now >= 1 && now <= 4)) now = s.home;
    if (now < s.ceil || now > s.floor) return s.home;
    return now;
  }

  function rawWeights(club, fromTier) {
    var s = profile(club);
    var se = s.seasons || { a: 0, b: 0, c: 0, d: 0 };
    var counts = [0, se.a || 0, se.b || 0, se.c || 0, se.d || 0];
    var t = Number(fromTier) || s.home;
    var canUp = t > 1 && (t - 1) >= s.ceil;
    var canDown = t < 4 && (t + 1) <= s.floor;
    var bounce = t > s.home ? 5 : 0.35;
    var overreach = t < s.home ? 5 : 0.35;
    var promo = canUp ? counts[t - 1] + bounce : 0;
    var rel = canDown ? counts[t + 1] + overreach : 0;
    var stay = (counts[t] + 1) * (t === s.home ? 1.45 : 0.75);
    return { promo: Math.max(0, promo), stay: Math.max(0.01, stay), rel: Math.max(0, rel) };
  }

  function odds(club, fromTier) {
    var w = rawWeights(club, fromTier);
    var tot = w.promo + w.stay + w.rel;
    if (tot <= 0) return { promo: 0, stay: 1, rel: 0 };
    return { promo: w.promo / tot, stay: w.stay / tot, rel: w.rel / tot };
  }

  function promoteWeight(club, fromTier) {
    return rawWeights(club, fromTier).promo;
  }

  function relegateWeight(club, fromTier) {
    return rawWeights(club, fromTier).rel;
  }

  function stayWeight(club, fromTier) {
    return rawWeights(club, fromTier).stay;
  }

  function selfCheck(clubs) {
    var errors = [];
    (clubs || []).forEach(function (c) {
      if (!c || c.world) return;
      var s = profile(c);
      var catT = c.catalogT != null ? Number(c.catalogT) : Number(c.t);
      if (!s.known) errors.push(c.n + ': senza storia');
      if (catT < s.ceil || catT > s.floor) {
        errors.push(c.n + ': catalogo t' + catT + ' fuori da ceil' + s.ceil + '/floor' + s.floor);
      }
      if (catT === 3) {
        var g = parseGirone(c.catalogL || c.l);
        if (g && 'ABC'.indexOf(g) < 0) errors.push(c.n + ': Serie C girone illegale ' + g);
      }
    });
    var must = [
      ['UDINESE', 1, false, 3],
      ['MODENA', 2, false, 1],
      ['CALDIERO TERME', 4, false, 2],
      ['VIVI ALTOTEVERE', 4, false, 1],
      ['INTER', 1, false, 2]
    ];
    must.forEach(function (row) {
      var club = { n: row[0], catalogT: row[1], t: row[1] };
      if (legalTier(club, row[3]) !== row[2]) {
        errors.push(row[0] + ': legal(' + row[3] + ') doveva essere ' + row[2]);
      }
    });
    return errors;
  }

  root.EliseeClubStoria = {
    profile: profile,
    odds: odds,
    promoteWeight: promoteWeight,
    relegateWeight: relegateWeight,
    stayWeight: stayWeight,
    legalTier: legalTier,
    clampTierOf: clampTierOf,
    lookup: lookup,
    keyOf: keyOf,
    labelFor: labelFor,
    enforce: enforce,
    parseGirone: parseGirone,
    serieCGirone: serieCGirone,
    dGironeToSerieC: dGironeToSerieC,
    selfCheck: selfCheck,
    HARD: HARD
  };
})(typeof window !== 'undefined' ? window : this);
