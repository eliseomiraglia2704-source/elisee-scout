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
    var e = Math.max(0, Number(seasons.e) || 0);
    var tot = a + b + c + d + e || 1;
    var counts = [0, a, b, c, d, e];
    var home = 4;
    var best = -1;
    var t;
    for (t = 1; t <= 5; t++) {
      if (counts[t] >= best) {
        best = counts[t];
        home = t;
      }
    }
    var ceil = 5;
    for (t = 1; t <= 5; t++) {
      if (counts[t] > 0) {
        ceil = t;
        break;
      }
    }
    if (a === 0 && b === 0 && ceil >= 4) ceil = Math.min(ceil, 3);

    var floor = e >= 3 ? 5 : 4;
    for (t = 5; t >= 1; t--) {
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
      seasons: { a: a, b: b, c: c, d: d, e: e },
      fail: false,
      failDest: 0,
      failChance: 0
    };
  }

  /* —— Serie A / grandi —— */
  put(['INTER', 'MILAN', 'ROMA'], { a: 40, b: 0, c: 0, d: 0 });
  put(['JUVENTUS'], { a: 39, b: 1, c: 0, d: 0 });
  put(['NAPOLI'], { a: 36, b: 4, c: 0, d: 0 });
  put(['LAZIO'], { a: 37, b: 3, c: 0, d: 0 });
  put(['ATALANTA'], { a: 30, b: 10, c: 0, d: 0 });
  put(['FIORENTINA'], { a: 32, b: 6, c: 2, d: 0 });
  put(['BOLOGNA'], { a: 28, b: 12, c: 0, d: 0 });
  put(['TORINO'], { a: 28, b: 10, c: 2, d: 0 });
  put(['UDINESE'], { a: 36, b: 4, c: 0, d: 0 });
  put(['GENOA'], { a: 20, b: 16, c: 4, d: 0 });
  put(['CAGLIARI'], { a: 24, b: 16, c: 0, d: 0 });
  put(['SAMPDORIA'], { a: 26, b: 14, c: 0, d: 0 });
  put(['VERONA'], { a: 14, b: 18, c: 8, d: 0 });
  put(['EMPOLI'], { a: 14, b: 18, c: 8, d: 0 });
  put(['LECCE'], { a: 16, b: 14, c: 10, d: 0 });
  put(['VENEZIA'], { a: 5, b: 12, c: 15, d: 8 });
  put(['SASSUOLO'], { a: 11, b: 10, c: 13, d: 6 });
  put(['PARMA'], { a: 18, b: 8, c: 6, d: 8 });
  put(['MONZA'], { a: 4, b: 10, c: 14, d: 12 });
  put(['COMO'], { a: 4, b: 8, c: 10, d: 14, e: 4 });
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
  put(['MILAN U23', 'MILAN FUTURO'], U23_D);

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
  put(['SS NOLA 1925', 'NOLA', 'TURRIS'], { a: 0, b: 2, c: 10, d: 28 });
  put(['TARANTO'], { a: 0, b: 6, c: 18, d: 16 });
  put(['TERNANA', 'NUOVA TERNANA'], { a: 0, b: 16, c: 20, d: 4 });
  put(['SPAL'], { a: 3, b: 14, c: 16, d: 7 });
  put(['TRIESTINA'], { a: 0, b: 10, c: 18, d: 12 });
  put(['ALESSANDRIA'], { a: 13, b: 21, c: 8, d: 6 });
  put(['LUCCHESE'], { a: 8, b: 12, c: 14, d: 8 });
  put(['TRAPANI'], { a: 0, b: 4, c: 16, d: 12 });
  put(['SIRACUSA'], { a: 0, b: 2, c: 16, d: 14 });
  put(['PRO PATRIA'], { a: 10, b: 12, c: 14, d: 6 });
  put(['PONTEDERA'], { a: 0, b: 0, c: 18, d: 16 });
  put(['BRA'], { a: 0, b: 0, c: 12, d: 20 });
  put(['VIRTUS VERONA'], { a: 0, b: 0, c: 16, d: 16 });
  put(['FIORENZUOLA'], { a: 0, b: 0, c: 12, d: 20 });
  put(['PORDENONE'], { a: 0, b: 6, c: 16, d: 18 });

  /* —— Girone A Serie D: profili storici 2026/27 —— */
  // Biellese 1902: storico club piemontese (fondato 1902), ex serie B/C; oggi stabilizzato in D/Eccellenza
  put(['AS BIELLESE 1902', 'BIELLESE 1902', 'BIELLESE'], { a: 0, b: 4, c: 10, d: 26 });
  // Ligorna 1922: tradizione ligure, frequentatore regolare della D con puntate in C
  put(['LIGORNA', 'LIGORNA 1922', 'US LIGORNA'], { a: 0, b: 0, c: 8, d: 32 });
  // Borgosesia: realtà vercellese, storia decente in D ma non di vertice
  put(['BORGOSESIA', 'AS BORGOSESIA'], { a: 0, b: 0, c: 4, d: 36 });
  // Fezzanese: realtà spezzina, alternanza D/Eccellenza Liguria
  put(['FEZZANESE', 'FC FEZZANESE'], { a: 0, b: 0, c: 2, d: 28, e: 10 });
  // Lascaris: piccola realtà torinese, prevalentemente D/Eccellenza Piemonte
  put(['LASCARIS', 'ASD LASCARIS'], { a: 0, b: 0, c: 1, d: 20, e: 19 });
  // Millesimo: piccola realtà savonese, alternanza Eccellenza/D
  put(['MILLESIMO', 'ASD MILLESIMO'], { a: 0, b: 0, c: 0, d: 14, e: 26 });
  // Valenzana Mado: piccola realtà alessandrina, D recente
  put(['VALENZANA MADO', 'VALENZANA'], { a: 0, b: 0, c: 1, d: 18, e: 21 });

  /* —— Girone B Serie D: profili storici 2026/27 —— */
  // ChievoVerona: storia illustre (Serie A/B), ripartito con ambizioni di risalita immediata
  put(['CHIEVO', 'CHIEVOVERONA', 'A.C. CHIEVOVERONA', 'AC CHIEVOVERONA'], { a: 17, b: 10, c: 5, d: 8 });
  // Piacenza: blasone storico prestigioso (Serie A/B), consolidato
  put(['PIACENZA', 'PIACENZA CALCIO', 'PIACENZA CALCIO 1919'], { a: 8, b: 18, c: 10, d: 4 });
  // Pro Palazzolo: club bresciano solido
  put(['PRO PALAZZOLO', 'AC PALAZZOLO', 'PALAZZOLO'], { a: 0, b: 0, c: 4, d: 32, e: 4 });
  // Tritium: tradizione con anni in C, oggi in D
  put(['TRITIUM', 'TRITIUM CALCIO 1908'], { a: 0, b: 0, c: 6, d: 30, e: 4 });
  // Leon: progetto brianzolo in forte crescita
  put(['LEON', 'AC LEON', 'LEON MONZA E BRIANZA'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Real Calepina: bergamasca organizzata
  put(['REAL CALEPINA', 'REAL CALEPINA FC'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Rovato: bresciana stabile
  put(['ROVATO', 'ROVATO VERTOVESE', 'ROVATO CALCIO'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Scanzorosciate: bergamasca
  put(['SCANZOROSCIATE', 'USD SCANZOROSCIATE'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Virtus CiseranoBergamo
  put(['VIRTUS CISERA', 'VIRTUS CISERANOBERGAMO', 'CISERANO-BERGAMO', 'CISERANO'], { a: 0, b: 0, c: 1, d: 25, e: 14 });
  // Villa Valle
  put(['VILLA VALLE', 'VILLAVALLE', 'VILLA D ALME VALLE BREMBANA'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Nibbiano & Valtidone
  put(['NIBBIANO & VALTIDONE', 'NIBBIANO VALTIDONE', 'NIBBIANO'], { a: 0, b: 0, c: 0, d: 10, e: 30 });

  /* —— Girone C Serie D: profili storici 2026/27 —— */
  // Triestina: blasone storico prestigioso (Serie A/B/C), rosa superiore
  put(['TRIESTINA', 'US TRIESTINA CALCIO 1918', 'TRIESTINA CALCIO'], { a: 28, b: 22, c: 18, d: 8 });
  // Union Clodiense: reduce dalla Serie C
  put(['UNION CLODIENSE', 'UNION CLODIENSE CHIOGGIA'], { a: 0, b: 0, c: 8, d: 32 });
  // Mestre: piazza storica veneta
  put(['MESTRE', 'AC MESTRE'], { a: 0, b: 2, c: 12, d: 26 });
  // Legnago Salus: reduce da Serie C recente
  put(['LEGNAGO SALUS', 'LEGNAGO'], { a: 0, b: 0, c: 14, d: 26 });
  // Cjarlins Muzane: realtà friulana solida
  put(['CJARLINS MUZANE', 'CJARLINS'], { a: 0, b: 0, c: 2, d: 28, e: 10 });
  // Bassano Virtus / Bassano
  put(['BASSANO', 'BASSANO VIRTUS', 'FC BASSANO 1903'], { a: 0, b: 0, c: 16, d: 24 });
  // Conegliano
  put(['CONEGLIANO', 'CONEGLIANO 1907'], { a: 0, b: 0, c: 2, d: 26, e: 12 });
  // Luparense
  put(['LUPARENSE', 'LUPARENSE FC'], { a: 0, b: 0, c: 0, d: 28, e: 12 });
  // Este
  put(['ESTE', 'AC ESTE'], { a: 0, b: 0, c: 0, d: 28, e: 12 });
  // Sandonà
  put(['SANDONA', 'SANDONÀ', 'SANDONA 1922'], { a: 0, b: 0, c: 4, d: 26, e: 10 });
  // Calcio Schio
  put(['CALCIO SCHIO', 'SCHIO'], { a: 0, b: 0, c: 2, d: 22, e: 16 });
  // Calvi Noale
  put(['CALVI NOALE'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Campodarsego
  put(['CAMPODARSEGO'], { a: 0, b: 0, c: 2, d: 28, e: 10 });
  // Brian Lignano
  put(['BRIAN LIGNANO', 'BRIAN LIGNANO CALCIO'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // LME
  put(['LME', 'L.M.E.'], { a: 0, b: 0, c: 0, d: 12, e: 28 });
  // Maia Alta (FC Obermais)
  put(['MAIA ALTA', 'FC OBERMAIS', 'OBERMAIS', 'DFK OBERMAIS'], { a: 0, b: 0, c: 0, d: 14, e: 26 });

  /* —— Girone D Serie D: profili storici 2026/27 —— */
  // Pro Patria: storia illustre (Serie A/B/C)
  put(['PRO PATRIA', 'AURORA PRO PATRIA 1919', 'PRO PATRIA 1919'], { a: 12, b: 14, c: 14, d: 6 });
  // Pontedera: storia recente di Serie C stabile
  put(['PONTEDERA', 'US CITTA DI PONTEDERA', 'US PONTEDERA'], { a: 0, b: 0, c: 18, d: 16 });
  // Varese: blasone storico (Serie A/B)
  put(['VARESE', 'VARESE FC', 'CITTA DI VARESE'], { a: 7, b: 21, c: 10, d: 8 });
  // Cittadella Vis Modena
  put(['CITTADELLA VIS MODENA', 'VIS MODENA'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Crema 1908
  put(['CREMA', 'CREMA 1908', 'AC CREMA 1908'], { a: 0, b: 0, c: 4, d: 28, e: 8 });
  // Pro Sesto: reduce da Serie C recente
  put(['PRO SESTO', 'PRO SESTO 1913'], { a: 0, b: 4, c: 16, d: 20 });
  // FC Pistoiese: piazza storica (ex Serie A/B)
  put(['PISTOIESE', 'FC PISTOIESE', 'US PISTOIESE 1921'], { a: 1, b: 19, c: 14, d: 8 });
  // Lentigione
  put(['LENTIGIONE', 'LENTIGIONE CALCIO'], { a: 0, b: 0, c: 0, d: 28, e: 12 });
  // Correggese
  put(['CORREGGESE', 'CORREGGESE CALCIO 1948'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Arconatese
  put(['ARCONATESE', 'GS ARCONATESE 1926'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Solbiatese
  put(['SOLBIATESE', 'SOLBIATESE CALCIO 1911'], { a: 0, b: 0, c: 4, d: 24, e: 12 });
  // Varesina
  put(['VARESINA', 'VARESINA SPORT'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Oltrepò FBC
  put(['OLTREPO', 'OLTREPO FBC', 'OLTREPOVOGHERA'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Casatese
  put(['CASATESE', 'USD CASATESE', 'CASATESE MERATE'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Castellanzese
  put(['CASTELLANZESE', 'USD CASTELLANZESE 1921'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Tropical Coriano
  put(['TROPICAL CORIANO'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Sant'Angelo
  put(['SANTANGELO', 'SANT\'ANGELO', 'ASD SANT\'ANGELO'], { a: 0, b: 0, c: 2, d: 22, e: 16 });
  // Pavia Calcio
  put(['PAVIA', 'PAVIA CALCIO', 'FC PAVIA 1911'], { a: 0, b: 4, c: 14, d: 22 });

  /* —— Girone E Serie D: profili storici 2026/27 —— */
  // Siena: storia illustre (Serie A/B/C)
  put(['SIENA', 'ACN SIENA 1904', 'ROBUR SIENA'], { a: 9, b: 13, c: 12, d: 6 });
  // Lucchese: blasone storico (Serie A/B/C)
  put(['LUCCHESE', 'LUCCHESE 1905', 'AS LUCCHESE LIBERTAS'], { a: 8, b: 19, c: 11, d: 2 });
  // Ghiviborgo
  put(['GHIVIBORGO', 'GHIVIZZANO BORGOAMOZZANO'], { a: 0, b: 0, c: 2, d: 28, e: 10 });
  // Progresso (SCD Progresso)
  put(['PROGRESSO', 'SCD PROGRESSO', 'SCD PROGRESSO CALCIO'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Scandicci
  put(['SCANDICCI', 'SCANDICCI CALCIO'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Tau Calcio
  put(['TAU', 'TAU CALCIO', 'TAU CALCIO ALTOPASCIO'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // San Donato Tavarnelle
  put(['SAN DONATO', 'SAN DONATO TAVARNELLE'], { a: 0, b: 0, c: 6, d: 26, e: 8 });
  // Mezzolara
  put(['MEZZOLARA', 'MEZZOLARA CALCIO'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Prato
  put(['PRATO', 'AC PRATO', 'AC PRATO 1908'], { a: 0, b: 6, c: 22, d: 12 });
  // Seravezza Pozzi
  put(['SERAVEZZA POZZI', 'SERAVEZZA', 'SERAVEZZA POZZI CALCIO'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Rondinella Marzocco
  put(['RONDINELLA', 'RONDINELLA MARZOCCO'], { a: 0, b: 0, c: 4, d: 22, e: 14 });
  // Grassina
  put(['GRASSINA', 'USD GRASSINA'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Sasso Marconi
  put(['SASSO MARCONI', 'SASSO MARCONI 1924'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Flaminia Civita Castellana
  put(['FLAMINIA', 'FLAMINIA CIVITA CASTELLANA', 'CALCIO FLAMINIA'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Terranuova Traiana
  put(['TERRANUOVA TRAIANA'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Follonica Gavorrano
  put(['FOLLONICA GAVORRANO', 'GAVORRANO'], { a: 0, b: 0, c: 6, d: 26, e: 8 });
  // Aquila Montevarchi
  put(['MONTEVARCHI', 'AQUILA MONTEVARCHI', 'AQUILA 1902 MONTEVARCHI'], { a: 0, b: 1, c: 14, d: 25 });

  /* —— Girone F Serie D: profili storici 2026/27 —— */
  // Teramo: piazza storica abruzzese (Serie C/B)
  put(['TERAMO', 'SSD TERAMO CALCIO', 'CITTA DI TERAMO 1913'], { a: 0, b: 2, c: 22, d: 16 });
  // Ancona: blasone storico illustre (Serie A/B/C)
  put(['ANCONA', 'US ANCONA', 'US ANCONA 1905', 'ANCONA 1905'], { a: 2, b: 21, c: 11, d: 6 });
  // L'Aquila 1927: piazza storica (ex Serie B/C)
  put(['LAQUILA', 'L AQUILA', 'L\'AQUILA', 'L\'AQUILA 1927', 'LAQUILA 1927'], { a: 0, b: 3, c: 16, d: 21 });
  // Recanatese: reduce da Serie C recente
  put(['RECANATESE', 'US RECANATESE'], { a: 0, b: 0, c: 8, d: 32 });
  // Maceratese: piazza marchigiana storica (ex Serie C)
  put(['MACERATESE', 'SS MACERATESE 1922'], { a: 0, b: 1, c: 14, d: 25 });
  // Notaresco
  put(['NOTARESCO CALCIO', 'NOTARESCO', 'SN NOTARESCO'], { a: 0, b: 0, c: 0, d: 28, e: 12 });
  // Sporting Club Trestina
  put(['TRESTINA', 'SPORTING CLUB TRESTINA'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Fossombrone
  put(['FOSSOMBRONE', 'FORSEMPRONESE', 'FORSEMPRONESE 1949'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Giulianova: tradizione (ex Serie C)
  put(['GIULIANOVA', 'REAL GIULIANOVA'], { a: 0, b: 0, c: 12, d: 24, e: 4 });
  // Vigor Senigallia
  put(['VIGOR SENIGALLIA', 'SENIGALLIA'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Atletico Ascoli
  put(['ATLETICO ASCOLI'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Foligno 1928: piazza storica umbra (ex Serie C)
  put(['FOLIGNO', 'FOLIGNO 1928', 'FOLIGNO CALCIO'], { a: 0, b: 0, c: 10, d: 24, e: 6 });
  // Santegidiese
  put(['SANTEGIDIESE', 'SANTEGIDIESE 1948'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Pol. Pietralunghese
  put(['PIETRALUNGHESE', 'POL PIETRALUNGHESE'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Angelana
  put(['ANGELANA', 'ASD ANGELANA 1930'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Lanciano FC: nobile decaduta (ex Serie B/C)
  put(['LANCIANO FC', 'LANCIANO', 'VIRTUS LANCIANO'], { a: 0, b: 4, c: 14, d: 22 });
  // K-Sport Montecchio
  put(['K-SPORT MONTECCHIO', 'MONTECCHIO GALLO'], { a: 0, b: 0, c: 0, d: 16, e: 24 });

  /* —— Girone G Serie D: profili storici 2026/27 —— */
  // Gelbison: reduce da Serie C recente
  put(['GELBISON', 'GELBISON CILENTO', 'ASD GELBISON'], { a: 0, b: 0, c: 8, d: 32 });
  // Paganese: blasone storico tra i professionisti (ex Serie C1/C2)
  put(['PAGANESE', 'PAGANESE CALCIO 1926'], { a: 0, b: 0, c: 20, d: 20 });
  // Sassari Latte Dolce
  put(['LATTE DOLCE', 'SASSARI LATTE DOLCE', 'LATTE DOLCE CALCIO'], { a: 0, b: 0, c: 2, d: 26, e: 12 });
  // Albalonga
  put(['ALBALONGA', 'CYNTHIALBALONGA', 'ALBALONGA CALCIO'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Trastevere
  put(['TRASTEVERE', 'TRASTEVERE CALCIO'], { a: 0, b: 0, c: 2, d: 26, e: 12 });
  // Ossese
  put(['OSSESE', 'POL OSSESE'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // UniPomezia
  put(['UNIPOMEZIA', 'UNI POMEZIA', 'UNIPOMEZIA 1938'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Anzio Calcio
  put(['ANZIO CALCIO', 'ANZIO CALCIO 1924', 'ANZIO'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Sarnese
  put(['SARNESE', 'SARNESE 1926', 'POL SARNESE'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Città di Anagni
  put(['CITTA DI ANAGNI', 'CITTÀ DI ANAGNI', 'ANAGNI CALCIO'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Afragolese
  put(['AFRAGOLESE', 'AFRAGOLESE 1944'], { a: 0, b: 0, c: 4, d: 22, e: 14 });
  // Aranova
  put(['ARANOVA', 'ASD ARANOVA'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Atletico Terme Fiuggi
  put(['ATLETICO TERME FIUGGI', 'ATLETICO FIUGGI', 'FIUGGI'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Monastir
  put(['MONASTIR', 'MONASTIR KOSMOTO'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Venafro
  put(['VENAFRO', 'US VENAFRO'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Budoni
  put(['BUDONI', 'POL BUDONI CALCIO'], { a: 0, b: 0, c: 0, d: 18, e: 22 });

  /* —— Girone H Serie D: profili storici 2026/27 —— */
  // Turris: storia importante tra i professionisti (Serie C)
  put(['TURRIS', 'SS TURRIS CALCIO', 'TURRIS CALCIO'], { a: 0, b: 0, c: 20, d: 20 });
  // Fidelis Andria: piazza storica (Serie B/C)
  put(['FIDELIS ANDRIA', 'ANDRIA', 'FIDELIS ANDRIA 2018'], { a: 0, b: 6, c: 18, d: 16 });
  // Nocerina: piazza storica caldissima (Serie B/C)
  put(['NOCERINA', 'ASD NOCERINA 1910', 'NOCERINA 1910'], { a: 0, b: 3, c: 22, d: 15 });
  // Brindisi: storia professionistica (Serie B/C)
  put(['BRINDISI', 'BRINDISI FC', 'FOOTBALL BRINDISI 1912'], { a: 0, b: 6, c: 14, d: 20 });
  // Bisceglie: AS Bisceglie 1913, Serie D Girone H, storia professionistica (ex Serie C)
  put(['BISCEGLIE', 'AS BISCEGLIE', 'AS BISCEGLIE 1913', 'A.S. BISCEGLIE 1913', 'ASD BISCEGLIE'], { a: 0, b: 0, c: 8, d: 32 });
  // Unione Calcio Bisceglie: società distinta fondata nel 2012, milita in Eccellenza Puglia
  put(['UNIONE CALCIO BISCEGLIE', 'UC BISCEGLIE', 'U.C. BISCEGLIE', 'UNIONE BISCEGLIE'], { a: 0, b: 0, c: 0, d: 2, e: 38 });
  // Martina: piazza storica (ex Serie C)
  put(['MARTINA', 'MARTINA CALCIO', 'MARTINA FRANCA'], { a: 0, b: 0, c: 12, d: 28 });
  // Francavilla (Virtus Francavilla / Francavilla)
  put(['FRANCAVILLA', 'VIRTUS FRANCAVILLA', 'FC FRANCAVILLA'], { a: 0, b: 0, c: 12, d: 28 });
  // Nardò
  put(['NARDO', 'AC NARDO', 'A.C NARDO', 'A.C NARDÒ', 'AC NARDÒ'], { a: 0, b: 0, c: 4, d: 32, e: 4 });
  // Real Forio
  put(['REAL FORIO', 'REAL FORIO 2014'], { a: 0, b: 0, c: 0, d: 22, e: 18 });
  // Real Aversa (Real Normanna)
  put(['REAL AVERSA', 'REAL NORMANNA', 'AVERSA NORMANNA'], { a: 0, b: 0, c: 8, d: 26, e: 6 });
  // Palmese
  put(['PALMESE', 'US PALMESE 1914'], { a: 0, b: 0, c: 4, d: 24, e: 12 });
  // FBC Gravina
  put(['GRAVINA', 'FBC GRAVINA'], { a: 0, b: 0, c: 0, d: 26, e: 14 });
  // Melfi 1929: tradizione lucana (ex Serie C)
  put(['MELFI', 'MELFI 1929', 'AS MELFI'], { a: 0, b: 0, c: 14, d: 24, e: 2 });
  // Manfredonia: piazza storica pugliese (ex Serie C)
  put(['MANFREDONIA', 'MANFREDONIA CALCIO 1932'], { a: 0, b: 0, c: 8, d: 28, e: 4 });
  // Ischia: tradizione isolana (ex Serie C)
  put(['ISCHIA', 'ISCHIA CALCIO', 'ISCHIA ISOLAVERDE'], { a: 0, b: 0, c: 12, d: 24, e: 4 });
  // Ebolitana
  put(['EBOLITANA', 'EBOLITANA CALCIO 1925'], { a: 0, b: 0, c: 2, d: 22, e: 16 });
  // Gladiator
  put(['GLADIATOR', 'GLADIATOR 1924'], { a: 0, b: 0, c: 2, d: 22, e: 16 });

  /* —— Girone I Serie D: profili storici 2026/27 —— */
  // Reggina 1914: blasone storico illustre (Serie A/B)
  put(['REGGINA', 'REGGINA 1914', 'LFA REGGIO CALABRIA', 'REGGIO CALABRIA'], { a: 9, b: 23, c: 6, d: 2 });
  // Siracusa: piazza storica importante (Serie B/C) - penalizzazione -7
  put(['SIRACUSA', 'SIRACUSA CALCIO 1924', 'SIRACUSA CALCIO'], { a: 0, b: 7, c: 24, d: 9 });
  // Trapani 1905: storia gloriosa recente (Serie B/C) - penalizzazione -5
  put(['TRAPANI', 'TRAPANI 1905', 'FC TRAPANI 1905'], { a: 0, b: 5, c: 24, d: 11 });
  // Vibonese: reduce da Serie C recente
  put(['VIBONESE', 'US VIBONESE CALCIO'], { a: 0, b: 0, c: 14, d: 26 });
  // Ragusa
  put(['RAGUSA', 'RAGUSA CALCIO'], { a: 0, b: 0, c: 4, d: 26, e: 10 });
  // Milazzo
  put(['MILAZZO', 'SS MILAZZO'], { a: 0, b: 0, c: 6, d: 24, e: 10 });
  // Licata Calcio: piazza storica (ex Serie B)
  put(['LICATA', 'LICATA CALCIO'], { a: 0, b: 2, c: 14, d: 24 });
  // Sambiase
  put(['SAMBIASE', 'ASD SAMBIASE', 'SAMBIASE LAMEZIA 1923'], { a: 0, b: 0, c: 0, d: 24, e: 16 });
  // Athletic Club Palermo
  put(['ATHLETIC PALERMO', 'ATHLETIC CLUB PALERMO'], { a: 0, b: 0, c: 0, d: 20, e: 20 });
  // Modica
  put(['MODICA', 'MODICA CALCIO'], { a: 0, b: 0, c: 2, d: 24, e: 14 });
  // Gela: tradizione (ex Serie C) - penalizzazione -1
  put(['GELA', 'GELA CALCIO', 'CITTA DI GELA'], { a: 0, b: 0, c: 12, d: 24, e: 4 });
  // Nissa F.C.
  put(['NISSA', 'NISSA FC', 'NISSA F.C.'], { a: 0, b: 0, c: 4, d: 24, e: 12 });
  // Enna Calcio
  put(['ENNA', 'ENNA CALCIO'], { a: 0, b: 0, c: 2, d: 22, e: 16 });
  // Calcio Avola
  put(['CALCIO AVOLA', 'AVOLA'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Nuova Igea Virtus: piazza storica (ex Serie C)
  put(['IGEA VIRTUS', 'NUOVA IGEA VIRTUS', 'IGEA VIRTUS BARCELLONA'], { a: 0, b: 0, c: 10, d: 24, e: 6 });
  // Castrum Favara
  put(['CASTRUMFAVARA', 'CASTRUM FAVARA', 'PRO FAVARA'], { a: 0, b: 0, c: 0, d: 18, e: 22 });
  // Digiesse Sala Consilina
  put(['DIGIESSE', 'DIGIESSE SALA CONSILINA', 'SALA CONSILINA'], { a: 0, b: 0, c: 0, d: 16, e: 24 });

  /* —— Serie D di paese: possono vincere il girone (→ C), mai B/A —— */
  var VILLAGE = { a: 0, b: 0, c: 2, d: 30, e: 8 };
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
    'ROVATO', 'ROVATO VERTOVESE', 'SANTANGELO', 'SANT\'ANGELO', 'SASSO MARCONI',
    'SCD PROGRESSO', 'TREVIGLIESE', 'TROPICAL CORIANO', 'TUTTOCUOIO',
    'BORGOSESIA', 'FEZZANESE', 'LASCARIS', 'MILLESIMO',
    'NIBBIANO & VALTIDONE', 'PAVONESE', 'TRITIUM',
    'LME', 'SANDONÀ', 'SANDONA', 'CALCIO SCHIO', 'VIRTUS BOLZANO',
    'ARCONATESE', 'SOLBIATESE', 'USD CASATESE',
    'GRASSINA', 'MEZZOLARA', 'RONDINELLA',
    'ANGELANA', 'K-SPORT MONTECCHIO', 'PIETRALUNGHESE', 'SANTEGIDIESE',
    'ARANOVA', 'VIGOR CAMPAGNANO', 'CITTÀ DI ANAGNI', 'OSSESE', 'VENAFRO',
    'BISCEGLIE', 'EBOLITANA', 'GLADIATOR', 'MELFI 1929', 'REAL FORIO',
    'CALCIO AVOLA', 'DIGIESSE', 'LICATA', 'MODICA',
    'CAMAIORE', 'CANNARA', 'GHIVIBORGO', 'ORVIETANA', 'POGGIBONSI', 'SCANDICCI',
    'SERAVEZZA POZZI', 'TAU', 'TERRANUOVA TRAIANA', 'TRESTINA', 'VIVI ALTOTEVERE',
    'ATLETICO ASCOLI', 'CASTELFIDARDO', 'FOSSOMBRONE', 'NOTARESCO CALCIO',
    'SAMMAURESE', 'SAN MARINO CALCIO', 'SORA', 'TERMOLI', 'UNIPOMEZIA',
    'VIGOR SENIGALLIA',
    'ALBALONGA', 'ANZIO CALCIO 1924', 'ATL. LODIGIANI', 'ATLETICO LODIGIANI',
    'BUDONI', 'FLAMINIA', 'LATTE DOLCE',
    'MONASTIR', 'MONTESPACCATO', 'REAL MONTEROTONDO', 'SARRABUS OGLIASTRA',
    'TRASTEVERE CALCIO', 'VALMONTONE',
    'AC NARDO', 'A.C NARDO', 'A.C NARDÒ', 'NARDO', 'ACERRANA', 'AFRAGOLESE',
    'CITTA DI FASANO', 'FERRANDINA', 'FRANCAVILLA', 'GRAVINA', 'HERACLEA',
    'POMPEI', 'REAL NORMANNA', 'REAL AVERSA', 'SARNESE', 'PALMESE', 'BRINDISI',
    'ATHLETIC PALERMO', 'CASTRUMFAVARA', 'ENNA', 'IGEA VIRTUS', 'MILAZZO', 'NISSA', 'PATERNO',
    'PATERNÒ', 'RAGUSA', 'SAMBIASE', 'SANCATALDESE', 'LANCIANO FC',
    'REAL FORIO', 'BISCEGLIE'
  ], VILLAGE);

  /* Fix: Bisceglie viene gestito dal lock Girone H (ceil C, floor D).
     L'alias 'REAL FORIO' appare anche sopra come standalone — normale, è in più gironi. */

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
  lock(['INTER', 'MILAN', 'JUVENTUS', 'ROMA', 'LAZIO', 'ATALANTA'], 1, 1);
  lock(['UDINESE', 'BOLOGNA', 'CAGLIARI', 'SAMPDORIA'], 1, 2);
  lock(['NAPOLI', 'FIORENTINA', 'TORINO'], 1, 3);
  lock(['GENOA', 'VERONA', 'EMPOLI', 'LECCE', 'SASSUOLO'], 1, 3);
  lock(['PARMA', 'MONZA', 'VENEZIA', 'FROSINONE'], 1, 4);
  lock(['COMO'], 1, 5);
  lock(['MODENA'], 2, 4);
  lock(['FOGGIA'], 3, 4);
  lock(
    ['CALDIERO TERME', 'VIVI ALTOTEVERE', 'FERRANDINA', 'ATHLETIC PALERMO', 'TAU'],
    3,
    4
  );
  lock(['JUVENTUS U23', 'INTER U23', 'ATALANTA U23', 'JUVENTUS NEXT GEN'], 2, 4);
  lock(['MILAN U23', 'MILAN FUTURO'], 2, 4);
  /* Girone A Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['BORGOSESIA', 'AS BORGOSESIA', 'FEZZANESE', 'FC FEZZANESE',
     'LASCARIS', 'ASD LASCARIS', 'MILLESIMO', 'ASD MILLESIMO',
     'VALENZANA MADO', 'CHISOLA', 'CELLE VARAZZE',
     'LIGORNA', 'LIGORNA 1922', 'US LIGORNA', 'GOZZANO'],
    3, 4
  );
  /* Girone B Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['LEON', 'REAL CALEPINA', 'ROVATO', 'ROVATO VERTOVESE',
     'PRO PALAZZOLO', 'TRITIUM', 'SCANZOROSCIATE', 'VIRTUS CISERA',
     'VIRTUS CISERANOBERGAMO', 'CISERANO-BERGAMO', 'VILLA VALLE',
     'CLUB MILANO', 'NIBBIANO & VALTIDONE', 'NIBBIANO VALTIDONE'],
    3, 4
  );
  /* Girone C Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['CJARLINS MUZANE', 'CJARLINS', 'CONEGLIANO', 'LUPARENSE',
     'ESTE', 'SANDONA', 'SANDONÀ', 'CALCIO SCHIO', 'CALVI NOALE',
     'CAMPODARSEGO', 'BRIAN LIGNANO', 'LME', 'MAIA ALTA', 'FC OBERMAIS'],
    3, 4
  );
  /* Girone D Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['CITTADELLA VIS MODENA', 'VIS MODENA', 'CREMA', 'CREMA 1908',
     'LENTIGIONE', 'CORREGGESE', 'ARCONATESE', 'SOLBIATESE',
     'VARESINA', 'OLTREPO', 'OLTREPO FBC', 'CASATESE', 'USD CASATESE',
     'CASTELLANZESE', 'TROPICAL CORIANO', 'SANTANGELO', 'SANT\'ANGELO'],
    3, 4
  );
  /* Girone E Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['GHIVIBORGO', 'GHIVIZZANO BORGOAMOZZANO', 'PROGRESSO', 'SCD PROGRESSO',
     'SCANDICCI', 'TAU', 'TAU CALCIO', 'TAU CALCIO ALTOPASCIO',
     'SAN DONATO', 'SAN DONATO TAVARNELLE', 'MEZZOLARA', 'SERAVEZZA POZZI',
     'SERAVEZZA', 'RONDINELLA', 'RONDINELLA MARZOCCO', 'GRASSINA',
     'SASSO MARCONI', 'FLAMINIA', 'FLAMINIA CIVITA CASTELLANA',
     'TERRANUOVA TRAIANA', 'FOLLONICA GAVORRANO', 'GAVORRANO'],
    3, 4
  );
  /* Girone F Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['NOTARESCO CALCIO', 'NOTARESCO', 'SN NOTARESCO', 'TRESTINA',
     'SPORTING CLUB TRESTINA', 'FOSSOMBRONE', 'FORSEMPRONESE',
     'VIGOR SENIGALLIA', 'SENIGALLIA', 'ATLETICO ASCOLI', 'SANTEGIDIESE',
     'PIETRALUNGHESE', 'POL PIETRALUNGHESE', 'ANGELANA', 'K-SPORT MONTECCHIO'],
    3, 4
  );
  /* Girone G Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['LATTE DOLCE', 'SASSARI LATTE DOLCE', 'ALBALONGA', 'CYNTHIALBALONGA',
     'TRASTEVERE', 'TRASTEVERE CALCIO', 'OSSESE', 'UNIPOMEZIA', 'UNI POMEZIA',
     'ANZIO CALCIO', 'ANZIO CALCIO 1924', 'SARNESE', 'CITTA DI ANAGNI',
     'CITTÀ DI ANAGNI', 'AFRAGOLESE', 'ARANOVA', 'ATLETICO TERME FIUGGI',
     'ATLETICO FIUGGI', 'MONASTIR', 'VENAFRO', 'BUDONI'],
    3, 4
  );
  /* Girone H Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['MARTINA', 'MARTINA CALCIO', 'FRANCAVILLA', 'VIRTUS FRANCAVILLA',
     'FC FRANCAVILLA', 'NARDO', 'AC NARDO', 'A.C NARDO', 'A.C NARDÒ',
     'REAL FORIO', 'REAL AVERSA', 'REAL NORMANNA', 'PALMESE',
     'GRAVINA', 'FBC GRAVINA', 'MELFI', 'MELFI 1929', 'MANFREDONIA',
     'ISCHIA', 'EBOLITANA', 'GLADIATOR', 'BISCEGLIE'],
    3, 4
  );
  /* Girone I Serie D 2026/27 — club senza storia in B/A: ceiling C */
  lock(
    ['VIBONESE', 'RAGUSA', 'MILAZZO', 'SAMBIASE', 'ATHLETIC PALERMO',
     'ATHLETIC CLUB PALERMO', 'MODICA', 'GELA', 'NISSA', 'NISSA FC',
     'ENNA', 'CALCIO AVOLA', 'IGEA VIRTUS', 'NUOVA IGEA VIRTUS',
     'CASTRUMFAVARA', 'CASTRUM FAVARA', 'DIGIESSE', 'DIGIESSE SALA CONSILINA'],
    3, 4
  );

  function addFail(names, dest, chance) {
    names.forEach(function (n) {
      var k = keyOf(n);
      if (!P[k]) return;
      P[k].fail = true;
      P[k].failDest = dest;
      P[k].failChance = chance;
      if (P[k].floor < dest) P[k].floor = dest;
    });
  }
  addFail(['FIORENTINA', 'NAPOLI', 'TORINO'], 4, 0.01);
  addFail(['PARMA', 'PALERMO', 'BARI', 'CATANIA', 'SIENA', 'CESENA', 'ANCONA', 'REGGINA', 'CHIEVO', 'FROSINONE'], 4, 0.016);
  addFail(['MONZA', 'VENEZIA', 'PADOVA', 'VICENZA', 'AVELLINO', 'MANTOVA', 'LIVORNO', 'PERUGIA', 'SALERNITANA'], 4, 0.012);
  addFail(['COMO', 'AREZZO', 'VARESE FC', 'VARESE', 'PISTOIESE', 'PRATO'], 5, 0.014);
  addFail(['FOGGIA', 'MESSINA', 'ACR MESSINA', 'TARANTO', 'TERNANA'], 4, 0.014);

  function setHome(names, home) {
    names.forEach(function (n) {
      var k = keyOf(n);
      if (P[k]) P[k].home = home;
    });
  }
  setHome(
    ['MONZA', 'COMO', 'SASSUOLO', 'PARMA', 'VENEZIA', 'FROSINONE', 'LECCE', 'EMPOLI', 'GENOA', 'VERONA'],
    1
  );

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
    return /U23|NEXT GEN|UNDER 23|FUTURO/.test(keyOf(name));
  }

  function isYouthName(name) {
    return /\b(U19|U20|UNDER 19|UNDER 20|PRIMAVERA|JUNIORES|BERRETTI|ALLIEVI)\b/.test(keyOf(name));
  }

  function lookup(name) {
    var k = keyOf(name);
    if (!k) return null;
    if (P[k]) return P[k];
    if (isYouthName(k)) {
      return {
        home: 10, floor: 10, ceil: 10, rel: 0, promo: 0, stay: 1,
        seasons: { a: 0, b: 0, c: 0, d: 0, e: 0 }, known: true
      };
    }
    if (isU23Name(k)) return derive(U23_C);
    var stripped = k.replace(/^(AS |AC |US |SSD |FBC |FC |ASD |SS |ACR |LR )/, '');
    if (stripped !== k && P[stripped]) return P[stripped];
    return null;
  }

  function eccellenzaHome() {
    var spec = derive({ a: 0, b: 0, c: 0, d: 6, e: 34 });
    spec.ceil = 4;
    spec.floor = 5;
    spec.home = 5;
    spec.promo = 0.12;
    spec.rel = 0;
    spec.stay = 0.88;
    return spec;
  }

  function isEccellenzaClub(club) {
    var lg = String((club && (club.l || club.league)) || '').toUpperCase();
    if (lg.indexOf('ECCELLENZA') === 0) return true;
    var t = Number(club && (club.homeTier != null ? club.homeTier : club.t));
    return t === 5;
  }

  function fallbackFromHome(home, name) {
    if (isU23Name(name)) return derive(home >= 4 ? U23_D : U23_C);
    if (home <= 1) return derive({ a: 28, b: 10, c: 2, d: 0 });
    if (home === 2) return derive({ a: 4, b: 18, c: 16, d: 2 });
    if (home === 3) return derive({ a: 0, b: 4, c: 24, d: 12 });
    if (home >= 5) return eccellenzaHome();
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
    if (!hit && isEccellenzaClub(club)) home = 5;
    var spec = hit
      ? Object.assign({ known: true }, hit)
      : Object.assign({ known: false }, fallbackFromHome(home, n));
    if (!hit && isEccellenzaClub(club)) {
      spec.ceil = 4;
      spec.floor = 5;
      spec.home = 5;
    }
    var hard = HARD[keyOf(n)];
    if (hard) {
      spec.ceil = hard.ceil;
      spec.floor = hard.floor;
      if (spec.home < spec.ceil) spec.home = spec.ceil;
      if (spec.home > spec.floor) spec.home = spec.floor;
    }
    var stored = lookup(n);
    if (stored) {
      spec.fail = !!stored.fail;
      spec.failDest = stored.failDest || 0;
      spec.failChance = stored.failChance || 0;
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
    if (destT === 5) return 'ECCELLENZA';
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
    var n = club && (club.n || club.name);
    if (isYouthName(n)) {
      return { t: 10, l: (club && (club.catalogL || club.l)) || 'PRIMAVERA 1' };
    }
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
    var n = club && (club.n || club.name);
    var t = Number(tier);
    if (isYouthName(n)) return t === 10;
    if (isU23Name(n)) return t >= 2 && t <= 4;
    var s = profile(club);
    return t >= s.ceil && t <= s.floor;
  }

  function clampTierOf(club, current) {
    var s = profile(club);
    var now = Number(current);
    if (!(now >= 1 && now <= 5)) now = s.home;
    if (club && club.failed && now >= s.ceil && now <= s.floor) return now;
    if (now < s.ceil || now > s.floor) return s.home;
    return now;
  }

  function rawWeights(club, fromTier) {
    var s = profile(club);
    var se = s.seasons || { a: 0, b: 0, c: 0, d: 0, e: 0 };
    var counts = [0, se.a || 0, se.b || 0, se.c || 0, se.d || 0, se.e || 0];
    var t = Number(fromTier) || s.home;
    var canUp = t > 1 && (t - 1) >= s.ceil;
    var canDown = t < 5 && (t + 1) <= s.floor;
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

  /**
   * SEASONAL BIAS 2026/27 — basato sui dati di classifica a 2ª giornata.
   * Moltiplicatori applicati ai pesi derivati dalla storia del club.
   * promo > 1 = più probabilità di salire; rel > 1 = più probabilità di scendere.
   * Regola bonus risalita: applica promoBonus ai club retrocessi "non favoriti"
   * che nella stagione corrente ripartono dalla categoria inferiore.
   */
  var SEASONAL_BIAS = {
    /* ======= SERIE B 2026/27 ======= */
    'SASSUOLO':   { promo: 2.8, rel: 0.4 },
    'PISA':       { promo: 2.4, rel: 0.5 },
    'SPEZIA':     { promo: 0.8, rel: 1.8 }, // neopromossa da C — bonus risalita se retrocede
    'CREMONESE':  { promo: 2.2, rel: 0.6 },
    'CATANZARO':  { promo: 2.0, rel: 0.6 },
    'SPAL':       { promo: 0.9, rel: 1.5 },
    'CESENA':     { promo: 1.8, rel: 0.7 },
    'SUDTIROL':   { promo: 1.6, rel: 0.8 },
    'PALERMO':    { promo: 1.4, rel: 0.9 },
    'JUVE STABIA': { promo: 1.4, rel: 0.9 },
    'PADOVA':     { promo: 1.6, rel: 0.9 },
    'REGGIANA':   { promo: 1.2, rel: 0.9 },
    'BRESCIA':    { promo: 1.2, rel: 1.0 },
    'MODENA':     { promo: 1.0, rel: 1.1 },
    'ASCOLI':     { promo: 0.9, rel: 1.3 },
    'SALERNITANA': { promo: 0.8, rel: 1.4 }, // bonus risalita verso A (ex-A)
    'BARI':       { promo: 0.8, rel: 1.6 }, // bonus risalita verso A (ex-A)
    'AVELLINO':   { promo: 0.7, rel: 1.6 },
    'MANTOVA':    { promo: 0.6, rel: 1.8 },
    'FROSINONE':  { promo: 0.6, rel: 1.7 },

    /* ======= SERIE C GIRONE A 2026/27 ======= */
    'UNION BRESCIA': { promo: 1.8, rel: 0.4 },
    'ALCIONE MILANO': { promo: 1.4, rel: 0.4 },
    'JUVENTUS U23':  { promo: 0.5, rel: 0.4 },  // U23 = strutturale
    'JUVENTUS NEXT GEN': { promo: 0.5, rel: 0.4 },
    'DOLOMITI BELLUNESI': { promo: 1.0, rel: 0.5 },
    'ARZIGNANO':    { promo: 1.4, rel: 0.4 },
    'CITTADELLA':   { promo: 2.0, rel: 0.3 },  // blasone B, bonus risalita
    'OSPITALETTO':  { promo: 0.5, rel: 2.2 },
    'ALBINOLEFFE':  { promo: 0.8, rel: 0.8 },
    'TRENTO':       { promo: 0.9, rel: 0.8 },
    'LUMEZZANE':    { promo: 0.5, rel: 1.8 },
    'DESENZANO':    { promo: 0.4, rel: 1.6 },
    'LECCO':        { promo: 1.4, rel: 1.0 },  // bonus risalita (ex-B)
    'PRO VERCELLI': { promo: 1.4, rel: 0.9 },  // bonus risalita (blasone storico)
    'CARPI':        { promo: 0.8, rel: 1.2 },
    'FOLGORE CARATESE': { promo: 0.4, rel: 1.8 },
    'TREVISO':      { promo: 0.8, rel: 1.6 },
    'NOVARA':       { promo: 1.4, rel: 0.9 },  // bonus risalita (ex-A)
    'RENATE':       { promo: 0.4, rel: 1.6 },
    'GIANA ERMINIO': { promo: 0.4, rel: 1.6 },
    'PERGOLETTESE': { promo: 0.3, rel: 2.4 },

    /* ======= SERIE C GIRONE B 2026/27 ======= */
    'PERUGIA':      { promo: 2.4, rel: 0.3 },  // blasone A/B
    'SPEZIA':       { promo: 2.6, rel: 0.2 },  // blasone A/B, bonus risalita
    'REGGIANA':     { promo: 2.0, rel: 0.3 },
    'PESCARA':      { promo: 1.8, rel: 0.4 },
    'GROSSETO':     { promo: 1.6, rel: 0.4 },
    'RAVENNA':      { promo: 1.4, rel: 0.4 },
    'LIVORNO':      { promo: 1.4, rel: 0.4 },
    'TORRES':       { promo: 1.4, rel: 0.5 },
    'CAMPOBASSO':   { promo: 1.0, rel: 0.5 },
    'ATALANTA U23': { promo: 0.5, rel: 0.4 },  // U23 strutturale
    'PINETO':       { promo: 0.9, rel: 0.6 },
    'FORLI':        { promo: 0.8, rel: 0.5 },
    'FORLÌ':        { promo: 0.8, rel: 0.5 },
    'VADO':         { promo: 0.5, rel: 0.5 },
    'SAMBENEDETTESE': { promo: 0.8, rel: 1.4 },
    'VIS PESARO':   { promo: 0.8, rel: 1.5 },
    'LATINA':       { promo: 0.8, rel: 1.5 },
    'PIANESE':      { promo: 0.4, rel: 1.6 },
    'GUBBIO':       { promo: 0.7, rel: 1.6 },
    'GUIDONIA':     { promo: 0.3, rel: 2.2 },
    'OSTIAMARE':    { promo: 0.3, rel: 2.4 },

    /* ======= SERIE C GIRONE C 2026/27 ======= */
    'BARI':         { promo: 2.8, rel: 0.2 },  // blasone B/A, bonus risalita immediata
    'CATANIA':      { promo: 2.4, rel: 0.4 },  // blasone A
    'SALERNITANA':  { promo: 2.2, rel: 0.3 },  // blasone A/B
    'COSENZA':      { promo: 1.8, rel: 0.4 },  // blasone B
    'FOGGIA':       { promo: 1.8, rel: 0.3 },
    'SORRENTO':     { promo: 1.6, rel: 0.4 },
    'POTENZA':      { promo: 1.4, rel: 0.4 },
    'AZ PICERNO':   { promo: 1.4, rel: 0.4 },
    'PICERNO':      { promo: 1.4, rel: 0.4 },
    'CASERTANA':    { promo: 1.4, rel: 0.4 },
    'ALTAMURA':     { promo: 1.4, rel: 0.5 },
    'BARLETTA':     { promo: 1.0, rel: 0.5 },
    'MONOPOLI':     { promo: 0.8, rel: 0.7 },
    'AUDACE CERIGNOLA': { promo: 0.8, rel: 0.7 },
    'INTER U23':    { promo: 0.5, rel: 0.4 },  // U23 strutturale
    'CAVESE':       { promo: 0.8, rel: 0.6 },
    'CASARANO':     { promo: 0.5, rel: 0.5 },
    'GIUGLIANO':    { promo: 0.8, rel: 1.4 },
    'SCAFATESE':    { promo: 0.3, rel: 1.8 },
    'SAVOIA':       { promo: 0.7, rel: 1.6 },
    'CROTONE':      { promo: 0.4, rel: 2.8 }   // penalizzazione -6 punti
  };

  function seasonalBias(club) {
    var n = keyOf((club && (club.n || club.name)) || '');
    return SEASONAL_BIAS[n] || null;
  }

  function rawWeights(club, fromTier) {
    var s = profile(club);
    var se = s.seasons || { a: 0, b: 0, c: 0, d: 0, e: 0 };
    var counts = [0, se.a || 0, se.b || 0, se.c || 0, se.d || 0, se.e || 0];
    var t = Number(fromTier) || s.home;
    var canUp = t > 1 && (t - 1) >= s.ceil;
    var canDown = t < 5 && (t + 1) <= s.floor;
    var bounce = t > s.home ? 5 : 0.35;
    var overreach = t < s.home ? 5 : 0.35;
    var promo = canUp ? counts[t - 1] + bounce : 0;
    var rel = canDown ? counts[t + 1] + overreach : 0;
    var stay = (counts[t] + 1) * (t === s.home ? 1.45 : 0.75);
    var bias = seasonalBias(club);
    if (bias) {
      if (bias.promo != null) promo = promo * bias.promo;
      if (bias.rel != null) rel = rel * bias.rel;
    }
    return { promo: Math.max(0, promo), stay: Math.max(0.01, stay), rel: Math.max(0, rel) };
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
    maybeFail: function (club) {
      var s = profile(club);
      if (club && club.failed) return null;
      var now = Number(club && club.t) || s.home;
      if (now >= 4) return null;
      if (!s.fail) return null;
      if (Math.random() > (s.failChance || 0.01)) return null;
      var dest = 4;
      if ((s.failDest || 4) >= 5 && s.floor >= 5 && Math.random() < 0.4) dest = 5;
      if (dest > s.floor) dest = s.floor >= 4 ? 4 : s.floor;
      if (dest < 4 && s.floor >= 4) dest = 4;
      if (dest <= now) return null;
      return { dest: dest, from: now };
    },
    leagueOdds: function (clubs, tier) {
      var list = (clubs || []).filter(function (c) { return Number(c.t) === tier && !c.world; });
      if (!list.length) return { promo: 0, stay: 1, rel: 0, n: 0 };
      var p = 0, s = 0, r = 0;
      list.forEach(function (c) {
        var o = odds(c, tier);
        p += o.promo;
        s += o.stay;
        r += o.rel;
      });
      var n = list.length;
      return { promo: p / n, stay: s / n, rel: r / n, n: n };
    },
    selfCheck: selfCheck,
    HARD: HARD
  };
})(typeof window !== 'undefined' ? window : this);
