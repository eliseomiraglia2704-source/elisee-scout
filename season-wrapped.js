/**
 * ============================================================================
 * ELISEE SCOUT — SEASON WRAPPED ENGINE (JS)
 * Recap virale di fine campionato stile «Spotify Wrapped» per l'ecosistema club
 * 21 Profili Coperti · Sistema Card OVR FIFA · Curva di Crescita · Export 1080x1920
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  // Stato globale Season Wrapped
  var _wrappedState = {
    isOpen: false,
    activeRole: 'giocatore',
    currentSlideIdx: 0,
    slides: [],
    timerId: null,
    slideDurationMs: 6000,
    startTime: 0,
    elapsedBeforePause: 0,
    isPaused: false,
    currentPayload: null,
    isGpsValidated: true,
    userCategory: 'Eccellenza'
  };

  // --------------------------------------------------------------------------
  // CATALOGO RUOLI & DEFINIZIONI TEMI
  // --------------------------------------------------------------------------
  var ROLE_THEMES = {
    giocatore: { themeClass: 'sw-theme-player', label: 'Calciatore', group: 'Atleta', icon: '⚽' },
    allenatore: { themeClass: 'sw-theme-coach', label: 'Allenatore', group: 'Staff Tecnico', icon: '📋' },
    vice_allenatore: { themeClass: 'sw-theme-coach', label: 'Vice Allenatore', group: 'Staff Tecnico', icon: '⏱️' },
    scout: { themeClass: 'sw-theme-scout', label: 'Scout / Osservatore', group: 'Staff Tecnico', icon: '🔍' },
    match_analyst: { themeClass: 'sw-theme-scout', label: 'Match Analyst', group: 'Staff Tecnico', icon: '📊' },
    prep_portieri: { themeClass: 'sw-theme-coach', label: 'Preparatore Portieri', group: 'Staff Tecnico', icon: '🧤' },
    prep_atletico: { themeClass: 'sw-theme-coach', label: 'Preparatore Atletico', group: 'Staff Tecnico', icon: '⚡' },
    medico: { themeClass: 'sw-theme-medical', label: 'Medico Sociale', group: 'Staff Medico', icon: '🩺' },
    fisioterapista: { themeClass: 'sw-theme-medical', label: 'Fisioterapista', group: 'Staff Medico', icon: '💆' },
    nutrizionista: { themeClass: 'sw-theme-medical', label: 'Nutrizionista', group: 'Staff Medico', icon: '🥗' },
    presidente: { themeClass: 'sw-theme-president', label: 'Presidente', group: 'Società & Governance', icon: '👑' },
    dg: { themeClass: 'sw-theme-president', label: 'Direttore Generale', group: 'Società & Governance', icon: '💼' },
    ds: { themeClass: 'sw-theme-scout', label: 'Direttore Sportivo', group: 'Società & Governance', icon: '📈' },
    segretario: { themeClass: 'sw-theme-president', label: 'Segretario Generale', group: 'Società & Governance', icon: '📄' },
    magazziniere: { themeClass: 'sw-theme-coach', label: 'Magazziniere / Equipment', group: 'Società & Governance', icon: '📦' },
    biglietteria: { themeClass: 'sw-theme-fan', label: 'Resp. Biglietteria / SLO', group: 'Società & Governance', icon: '🎟️' },
    tm: { themeClass: 'sw-theme-president', label: 'Team Manager', group: 'Società & Governance', icon: '🚌' },
    settore_giovanile: { themeClass: 'sw-theme-player', label: 'Resp. Settore Giovanile', group: 'Società & Governance', icon: '🌱' },
    comunicazione: { themeClass: 'sw-theme-press', label: 'Ufficio Stampa', group: 'Società & Governance', icon: '📢' },
    marketing: { themeClass: 'sw-theme-president', label: 'Marketing & Commerciale', group: 'Società & Governance', icon: '🎯' },
    agente: { themeClass: 'sw-theme-scout', label: 'Procuratore / Agente FIFA', group: 'Intermediazione', icon: '🤝' },
    tifoso: { themeClass: 'sw-theme-fan', label: 'Tifoso / Spettatore', group: 'Community', icon: '❤️' },
    giornalista: { themeClass: 'sw-theme-press', label: 'Giornalista / Creator', group: 'Media', icon: '✍️' }
  };

  // --------------------------------------------------------------------------
  // ALGORITMO OVR FIFA (SEZIONE 7 SPECIFICA)
  // --------------------------------------------------------------------------
  var FIFA_OVR_WEIGHTS = {
    attaccante: { TIR: 0.40, VEL: 0.20, DRIB: 0.15, PAS: 0.10, FIS: 0.10, DIF: 0.05 },
    ala: { VEL: 0.30, DRIB: 0.25, TIR: 0.20, PAS: 0.15, DIF: 0.05, FIS: 0.05 },
    centrocampista: { PAS: 0.35, DRIB: 0.15, DIF: 0.15, FIS: 0.15, VEL: 0.10, TIR: 0.10 },
    terzino: { VEL: 0.25, DIF: 0.25, PAS: 0.20, FIS: 0.15, DRIB: 0.10, TIR: 0.05 },
    difensore: { DIF: 0.45, FIS: 0.25, VEL: 0.10, PAS: 0.10, TIR: 0.05, DRIB: 0.05 },
    portiere: { DIF: 0.40, PAS: 0.20, FIS: 0.20, VEL: 0.10, TIR: 0.05, DRIB: 0.05 }
  };

  var CATEGORY_CAPS = {
    'Terza Categoria': 82,
    'Seconda Categoria': 82,
    'Prima Categoria': 86,
    'Promozione': 86,
    'Eccellenza': 90,
    'Serie D': 90,
    'Serie C': 94,
    'Serie B': 97,
    'Serie A': 99
  };

  function calculatePlayerOvr(stats, position, isGps, category) {
    var pos = (position || 'centrocampista').toLowerCase();
    var weights = FIFA_OVR_WEIGHTS[pos] || FIFA_OVR_WEIGHTS.centrocampista;

    // Formule normalizzate scala 50-99
    var vel = Math.min(99, Math.max(50, Math.round(50 + ((stats.top_speed_kmh || 28) / 35 * 35) + ((stats.sprints || 18) / 30 * 14))));
    var fis = Math.min(99, Math.max(50, Math.round(50 + ((stats.distance_km || 120) / 180 * 25) + ((stats.high_intensity_m || 800) / 1200 * 24))));
    var tir = Math.min(99, Math.max(50, Math.round(50 + ((stats.goals || 8) * 3.5) - ((stats.minutes_per_goal || 120) / 100))));
    var pas = Math.min(99, Math.max(50, Math.round(50 + ((stats.assists || 6) * 4) + ((stats.touch_volume || 80) * 0.3))));
    var drib = Math.min(99, Math.max(50, Math.round(50 + ((stats.dribbles || 20) * 1.2))));
    var dif = Math.min(99, Math.max(50, Math.round(50 + ((stats.balls_recovered || 25) * 1.5) - ((stats.red_cards || 0) * 3))));

    // Moltiplicatore Canale GPS (1.0x) vs Manuale (0.92x)
    var mult = isGps ? 1.0 : 0.92;
    vel = Math.round(vel * mult);
    fis = Math.round(fis * mult);

    var weightedOvr = Math.round(
      (vel * weights.VEL) +
      (tir * weights.TIR) +
      (pas * weights.PAS) +
      (drib * weights.DRIB) +
      (dif * weights.DIF) +
      (fis * weights.FIS)
    );

    // Applicazione Cap di categoria per inserimento manuale
    if (!isGps) {
      var cap = CATEGORY_CAPS[category] || 86;
      weightedOvr = Math.min(cap, weightedOvr);
    }

    // Badge testuale finale basato sul punto di forza
    var badge = "Il Metronomo";
    var maxAttr = Math.max(vel, tir, pas, drib, dif, fis);
    if (maxAttr === vel) badge = "Freccia della Fascia";
    else if (maxAttr === tir) badge = "Bomber di Stagione";
    else if (maxAttr === pas) badge = "Regista Totale";
    else if (maxAttr === dif) badge = "L'Invalicabile";
    else if (maxAttr === fis) badge = "Polmone d'Acciaio";
    else if (maxAttr === drib) badge = "Mago del Dribbling";

    return {
      ovr: weightedOvr,
      badge: badge,
      attributes: { VEL: vel, TIR: tir, PAS: pas, DRIB: drib, DIF: dif, FIS: fis }
    };
  }

  // --------------------------------------------------------------------------
  // GENERATORE DATI PER TUTTI I 21 PROFILI (CON FALLBACK SICURI)
  // --------------------------------------------------------------------------
  function getWrappedPayload(role, user) {
    user = user || {};
    var name = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || user.username || 'Atleta Elisee';
    var team = user.club || user.squadraNome || 'Virtus Club';
    var handle = '@' + (user.username || 'elisee.user');
    var isGps = user.gpsValidated !== false;
    var cat = user.categoria || 'Eccellenza';

    // Curva di Crescita Stagionale multi-anno
    var growthHistory = [
      { season: '2023/24', ovr: 72, speed: 27.5 },
      { season: '2024/25', ovr: 78, speed: 29.4 },
      { season: '2025/26', ovr: 84, speed: 32.4 }
    ];

    switch (role) {
      case 'giocatore':
        var stats = {
          distance_km: 142.3,
          top_speed_kmh: 32.4,
          sprints: 24,
          high_intensity_m: 950,
          goals: 9,
          assists: 7,
          dribbles: 26,
          balls_recovered: 34,
          red_cards: 0
        };
        var calc = calculatePlayerOvr(stats, 'centrocampista', isGps, cat);
        growthHistory[2].ovr = calc.ovr;
        growthHistory[2].speed = stats.top_speed_kmh;
        return {
          role: 'giocatore',
          userName: name,
          teamName: team,
          handle: handle,
          category: cat,
          isGps: isGps,
          cardBadge: calc.badge,
          ovr: calc.ovr,
          attributes: calc.attributes,
          growthHistory: growthHistory,
          slides: [
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 1/8',
              sub: 'La tua stagione 2025/26 è pronta',
              hero: 'RECAP',
              text: 'Un anno intero di corse, sudore, contrasti e gol. Ecco com\'è andata sul rettangolo verde.',
              pills: ['Stagione Ufficiale', team, cat]
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 2/8',
              sub: 'Hai corso in totale',
              hero: '142 km',
              text: 'Come percorrere Roma → Napoli di corsa! La tua fascia ha lavorato più di chiunque altro in rosa.',
              cards: [{ label: 'Sessioni Tracciate', val: '38 partite & training', sub: isGps ? 'Canale GPS Validato' : 'Dati Autocertificati' }]
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 3/8',
              sub: 'Punta di velocità record',
              hero: '32.4 km/h',
              text: 'Registrata al 68° minuto contro la Virtus Academy in contropiede fulmineo.',
              cards: [{ label: 'Sprint ad alta intensità', val: '124 sprint > 25 km/h', sub: 'Top 5% del campionato' }]
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 4/8',
              sub: 'Il tuo mese di grazia',
              hero: 'Novembre',
              text: '4 gol e 3 assist in sole 5 partite. Un rullo compressore per le difese avversarie.',
              cards: [{ label: 'Coinvolgimento gol totale', val: '16 reti (9 gol, 7 assist)', sub: 'Fattore decisivo del club' }]
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 5/8',
              sub: 'Heatmap stagionale',
              hero: 'Fascia Sinistra',
              text: 'La tua mappa termica ha infiammato la corsia mancina, con il 68% delle azioni di possesso.',
              cards: [{ label: 'Zona d\'attacco dominante', val: 'Trequarti laterale', sub: '26 cross riusciti verso l\'area' }]
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 6/8',
              sub: 'Curva di crescita stagionale',
              hero: '+6 OVR',
              text: 'Miglioramento netto rispetto alla scorsa stagione. Sei passato da talento a titolare inamovibile.',
              chartType: 'growth'
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 7/8',
              sub: 'Card OVR Season Wrapped',
              hero: calc.ovr + ' OVR',
              text: 'Sbloccata la Card Special Edition 2025/26! Scaricala e condividila con il tuo club.',
              isFifaCard: true
            },
            {
              eyebrow: 'MY PLAYER STORY · SLIDE 8/8',
              sub: 'Il verdetto finale',
              hero: calc.badge,
              text: 'Sei stato promosso ufficialmente a ' + calc.badge + '. I Direttori Sportivi hanno gli occhi puntati su di te!',
              cards: [{ label: 'Overall Start → End', val: '78 → ' + calc.ovr + ' OVR', sub: '+6 Punti Stagione' }],
              isFinale: true
            }
          ]
        };

      case 'allenatore':
        return {
          role: 'allenatore',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Mister dell'Anno",
          ovr: 88,
          growthHistory: [
            { season: '2023/24', ovr: 77 },
            { season: '2024/25', ovr: 83 },
            { season: '2025/26', ovr: 88 }
          ],
          slides: [
            { eyebrow: 'MY COACH STORY · SLIDE 1/6', sub: 'Guida tecnica 2025/26', hero: 'MISTER', text: 'Una stagione da condottiero in panchina. Ecco la tua identità tattica e i numeri della rosa.', pills: [team, 'UEFA B', 'Dominatore Tattico'] },
            { eyebrow: 'MY COACH STORY · SLIDE 2/6', sub: 'Modulo più utilizzato', hero: '4-3-3', text: 'Scelto nel 78% delle partite ufficiali. Linee compatte e ampiezza offensiva costante.', cards: [{ label: 'Punti Conquistati', val: '58 Punti', sub: 'Media 1.93 punti/gara' }] },
            { eyebrow: 'MY COACH STORY · SLIDE 3/6', sub: 'Mister Martello — GPS Squadra', hero: '36 Sessioni', text: '36 allenamenti con carico ad alta intensità superata. Ritmo da categoria superiore.', cards: [{ label: 'Km Squadra Totali', val: '2.450 km percorsi', sub: 'Intensità media HSR 94%' }] },
            { eyebrow: 'MY COACH STORY · SLIDE 4/6', sub: 'Fattore C — Impatto Panchina', hero: '8 Gol', text: '8 reti segnate da calciatori subentrati a partita in corso. Scelte e cambi sempre determinanti.', cards: [{ label: 'Punti guadagnati nei finali', val: '+11 Punti', sub: 'Negli ultimi 15 minuti' }] },
            { eyebrow: 'MY COACH STORY · SLIDE 5/6', sub: 'Curva di Crescita Tattica', hero: '88 OVR', text: 'Efficacia di gioco certificata dall\'algoritmo tattico Elisee.', chartType: 'growth' },
            { eyebrow: 'MY COACH STORY · SLIDE 6/6', sub: 'Il verdetto finale', hero: 'Mister dell\'Anno', text: 'Profilo tattico: Dominatore del Posizionale. Rosa valorizzata del 35%!', isFinale: true }
          ]
        };

      case 'vice_allenatore':
        return {
          role: 'vice_allenatore',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Master Collaboratore",
          ovr: 85,
          growthHistory: [{ season: '2023/24', ovr: 74 }, { season: '2024/25', ovr: 80 }, { season: '2025/26', ovr: 85 }],
          slides: [
            { eyebrow: 'MY TECHNICAL STORY · SLIDE 1/5', sub: 'Collaborazione Tecnica', hero: 'STAFF', text: 'Il braccio destro fondamentale del Mister. Analisi, dettagli e palla inattiva.', pills: ['Specialista Palle Inattive', team] },
            { eyebrow: 'MY TECHNICAL STORY · SLIDE 2/5', sub: 'Sedute tattiche guidate', hero: '94 Ore', text: 'Ore di sedute sul campo per la cura meticolosa delle workstation e riscaldamento.', cards: [{ label: 'Schemi Palla Inattiva', val: '14 Gol da corner/punizione', sub: 'Efficienza record 28%' }] },
            { eyebrow: 'MY TECHNICAL STORY · SLIDE 3/5', sub: 'Report consegnati al Mister', hero: '42 Dossier', text: 'Analisi pre e post gara con raccomandazioni sui carichi e sostituzioni.', cards: [{ label: 'Conformità tattica', val: '96% Schemi Riusciti', sub: 'Valutazione Mister: 10/10' }] },
            { eyebrow: 'MY TECHNICAL STORY · SLIDE 4/5', sub: 'Indice di Reparto Tecnico', hero: '85 OVR', text: 'Crescita costante dell\'influenza sul collettivo.', chartType: 'growth' },
            { eyebrow: 'MY TECHNICAL STORY · SLIDE 5/5', sub: 'Verdetto Finale Staff', hero: 'Master Collaboratore', text: 'Specialista Palle Inattive & Gestione Dinamica della Rosa.', isFinale: true }
          ]
        };

      case 'ds':
        return {
          role: 'ds',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Re del Calciomercato",
          ovr: 92,
          growthHistory: [{ season: '2023/24', ovr: 80 }, { season: '2024/25', ovr: 86 }, { season: '2025/26', ovr: 92 }],
          slides: [
            { eyebrow: 'MY SCOUT STORY · SLIDE 1/6', sub: 'Direzione Sportiva 2025/26', hero: 'MERCATO', text: 'Acquisti, cessioni, trattative e scouting stealth: la tua annata da stratega.', pills: ['FIGC DS', 'Wall Ufficiale', team] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 2/6', sub: 'Card Giocatori Analizzate', hero: '342 Card', text: 'Profili analizzati e 85 Secret List consultate. Un lavoro continuo da talent hunter.', cards: [{ label: 'Secret List Stealth', val: '18 Liste Attive', sub: 'Zero fughe di notizie' }] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 3/6', sub: 'Il tuo colpo dell\'anno', hero: 'L. Bianchi', text: 'Scovato a marzo con il 94% di AI Match Index e tesserato prima della concorrenza.', cards: [{ label: 'Plusvalenza & Valore', val: '+45.000 € stimati', sub: 'Rendimento eccellente' }] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 4/6', sub: 'Ricerca più frequente', hero: 'Under 2005 - SX', text: 'Piede sinistro, classe 2005, terzino o ala. La caccia al fuoriquota perfetto.', cards: [{ label: 'Trattative Chiuse sul Wall', val: '12 Acquisti Ufficiali', sub: '100% depositati' }] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 5/6', sub: 'Curva Reparto Scouting', hero: '92 OVR', text: 'Indice di efficacia trattative al vertice della categoria.', chartType: 'growth' },
            { eyebrow: 'MY SCOUT STORY · SLIDE 6/6', sub: 'Il verdetto finale', hero: 'Re del Calciomercato', text: 'Operazioni impeccabili e rosa rinforzata in ogni singolo reparto.', isFinale: true }
          ]
        };

      case 'scout':
        return {
          role: 'scout',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Segugio dell'Anno",
          ovr: 91,
          growthHistory: [{ season: '2023/24', ovr: 79 }, { season: '2024/25', ovr: 85 }, { season: '2025/26', ovr: 91 }],
          slides: [
            { eyebrow: 'MY SCOUT STORY · SLIDE 1/5', sub: 'Attività di Scouting', hero: 'TALENT', text: 'Occhi sul campo da settembre a maggio. I talenti di domani partono dal tuo taccuino.', pills: ['Osservatore Abilitato', 'Radar Talenti'] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 2/5', sub: 'Giocatori Visionati dal Vivo', hero: '215 Profili', text: 'Partite seguite in tribuna e report dettagliati inseriti nel sistema.', cards: [{ label: 'Giovani Segnalati in Secret List', val: '45 Talenti', sub: '8 finiti in prima squadra' }] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 3/5', sub: 'Colpo Scovato', hero: 'Top Match IA', text: 'Il tuo report con il 96% di attendibilità ha convinto il DS a chiudere l\'operazione.', cards: [{ label: 'Trattative nate da tuo report', val: '7 Affari Chiusi', sub: 'Impatto diretto' }] },
            { eyebrow: 'MY SCOUT STORY · SLIDE 4/5', sub: 'Indice Occhio di Falco', hero: '91 OVR', text: 'Affidabilità dei giudizi tecnici tra le più alte d\'Italia.', chartType: 'growth' },
            { eyebrow: 'MY SCOUT STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Segugio dell\'Anno', text: '45 talenti segnalati, zero scommesse perse. Il fiuto del vero talent scout!', isFinale: true }
          ]
        };

      case 'match_analyst':
        return {
          role: 'match_analyst',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Analista Top",
          ovr: 89,
          growthHistory: [{ season: '2023/24', ovr: 78 }, { season: '2024/25', ovr: 84 }, { season: '2025/26', ovr: 89 }],
          slides: [
            { eyebrow: 'MY ANALYST STORY · SLIDE 1/5', sub: 'Match & Video Analysis', hero: 'DATI', text: 'Frame dopo frame, heatmap dopo heatmap. La tattica scientifica al servizio della squadra.', pills: ['Dossier Video', 'Heatmap Hub', team] },
            { eyebrow: 'MY ANALYST STORY · SLIDE 2/5', sub: 'Dossier Tattici Prodotti', hero: '38 Report', text: 'Analisi avversari consegnate al Mister 48 ore prima del fischio d\'inizio.', cards: [{ label: 'Clip Video Indicizzate', val: '180 Clip', sub: 'Palle inattive e transizioni' }] },
            { eyebrow: 'MY ANALYST STORY · SLIDE 3/5', sub: 'Menzioni Speciali Ricevute', hero: '15 Menzioni', text: 'Riconoscimenti tecnici inseriti direttamente sulle Card dei tuoi atleti.', cards: [{ label: 'Accuratezza Tattica', val: '93%', sub: 'Previsioni schemi avversari' }] },
            { eyebrow: 'MY ANALYST STORY · SLIDE 4/5', sub: 'Indice Accuratezza Tattica', hero: '89 OVR', text: 'Il tuo laboratorio video è ormai un punto di riferimento insostituibile.', chartType: 'growth' },
            { eyebrow: 'MY ANALYST STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Analista Top', text: 'Chiarezza visiva e rigore numerico per vincere le partite a tavolino prima del campo.', isFinale: true }
          ]
        };

      case 'prep_portieri':
        return {
          role: 'prep_portieri',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card GK Mastermind",
          ovr: 87,
          growthHistory: [{ season: '2023/24', ovr: 76 }, { season: '2024/25', ovr: 82 }, { season: '2025/26', ovr: 87 }],
          slides: [
            { eyebrow: 'MY GK STORY · SLIDE 1/5', sub: 'Scuola Portieri Elisee', hero: 'NUMERO 1', text: 'Tra i pali non si scherza: reattività, uscite alte e costruzione dal basso.', pills: ['Stanza dei Portieri', team] },
            { eyebrow: 'MY GK STORY · SLIDE 2/5', sub: 'Clean Sheet Ottenuti', hero: '14 Gare', text: '14 porte inviolate su 30 partite disputate grazie alla guida dei tuoi portieri.', cards: [{ label: '% Parate e Uscite', val: '86% Interventi Positivi', sub: 'Reattività al top' }] },
            { eyebrow: 'MY GK STORY · SLIDE 3/5', sub: 'Crescita Portieri Allenati', hero: '+5 OVR Medio', text: 'Entrambi i portieri della rosa hanno aumentato la sicurezza nelle uscite e con i piedi.', cards: [{ label: 'Badge Sbloccato ai GK', val: 'Saracinesca FIGC', sub: 'Miglior difesa del girone' }] },
            { eyebrow: 'MY GK STORY · SLIDE 4/5', sub: 'Curva Reparto Portieri', hero: '87 OVR', text: 'Costanza e solidità del reparto estremi difensori.', chartType: 'growth' },
            { eyebrow: 'MY GK STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'GK Mastermind', text: 'Specialista Clean Sheet. La porta della squadra è rimasta sbarrata!', isFinale: true }
          ]
        };

      case 'prep_atletico':
        return {
          role: 'prep_atletico',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Motore Fisico",
          ovr: 90,
          growthHistory: [{ season: '2023/24', ovr: 79 }, { season: '2024/25', ovr: 84 }, { season: '2025/26', ovr: 90 }],
          slides: [
            { eyebrow: 'MY STAFF STORY · PREPARATORE ATLETICO', sub: 'La squadra ha corso', hero: '2.140 km', text: 'Con 96 picchi ad alta intensità (HSR) registrati e infortuni muscolari ridotti del 32% rispetto alla scorsa stagione.', pills: ['Squadra Top Runner', team] },
            { eyebrow: 'MY STAFF STORY · SLIDE 2/5', sub: 'Infortuni Muscolari', hero: '-32%', text: 'Grazie al monitoraggio quotidiano del carico GPS e al semaforo prevenzione infortuni.', cards: [{ label: 'Disponibilità Rosa Media', val: '94.2% Giocatori Arruolabili', sub: 'Zero emergenze numeriche' }] },
            { eyebrow: 'MY STAFF STORY · SLIDE 3/5', sub: 'Sessioni HSR Alta Intensità', hero: '96 Sessioni', text: 'Picchi di sprint e reattività sostenuti con recuperi perfetti pre-gara.', cards: [{ label: 'Test Fisici di Controllo', val: '6 Batterie di Test', sub: 'VAM media aumentata di 1.2 km/h' }] },
            { eyebrow: 'MY STAFF STORY · SLIDE 4/5', sub: 'Indice Carico Atletico', hero: '90 OVR', text: 'Squadra con la miglior tenuta fisica nei secondi tempi.', chartType: 'growth' },
            { eyebrow: 'MY STAFF STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Card Motore Fisico', text: 'Carico Atletico — Squadra Top Runner certificata!', isFinale: true }
          ]
        };

      case 'medico':
        return {
          role: 'medico',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Protezione Clinica",
          ovr: 92,
          growthHistory: [{ season: '2023/24', ovr: 82 }, { season: '2024/25', ovr: 88 }, { season: '2025/26', ovr: 92 }],
          slides: [
            { eyebrow: 'MY MEDICAL STORY · SLIDE 1/5', sub: 'Staff Medico Societario', hero: 'SALUTE', text: 'Prevenzione, visite d\'idoneità e gestione tempestiva degli infortuni in conformità FIGC/CONI.', pills: ['Status Guardian', '100% Idoneità'] },
            { eyebrow: 'MY MEDICAL STORY · SLIDE 2/5', sub: 'Rientri nei Tempi Previsti', hero: '95%', text: 'Percentuale record di guarigione clinica nei tempi stimati, senza ricadute stagionali.', cards: [{ label: 'Giorni Medi di Degenza', val: '11 Giorni', sub: '-4 giorni sulla media di lega' }] },
            { eyebrow: 'MY MEDICAL STORY · SLIDE 3/5', sub: 'Certificati & Visite Mediche', hero: '64 Pratiche', text: 'Tutela sanitaria completa per prima squadra e settore giovanile.', cards: [{ label: 'Compliance Sanitaria FIGC', val: '100% In Regola', sub: 'Nessun atleta fuori quota medica' }] },
            { eyebrow: 'MY MEDICAL STORY · SLIDE 4/5', sub: 'Indice Protezione Clinica', hero: '92 OVR', text: 'Affidabilità e sicurezza medica ai massimi standard federali.', chartType: 'growth' },
            { eyebrow: 'MY MEDICAL STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Protezione Clinica', text: 'Status Guardian — 95% Rientri nei tempi e massima tutela della salute.', isFinale: true }
          ]
        };

      case 'fisioterapista':
        return {
          role: 'fisioterapista',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Mani d'Oro",
          ovr: 89,
          growthHistory: [{ season: '2023/24', ovr: 78 }, { season: '2024/25', ovr: 83 }, { season: '2025/26', ovr: 89 }],
          slides: [
            { eyebrow: 'MY REHAB STORY · SLIDE 1/5', sub: 'Fisioterapia & Recupero', hero: 'REHAB', text: 'Mani esperte, terapie mirate e riatletizzazione per rimettere i campioni in campo.', pills: ['Specialista Riatletizzazione', team] },
            { eyebrow: 'MY REHAB STORY · SLIDE 2/5', sub: 'Ore di Terapia Erogate', hero: '310 Ore', text: 'Trattamenti decontratturanti, tecar, laser e sedute posturali personalizzate.', cards: [{ label: 'Trattamenti Manuali', val: '450 Sedute', sub: 'Gestione affaticamenti post-gara' }] },
            { eyebrow: 'MY REHAB STORY · SLIDE 3/5', sub: 'Tesserati Rimessi in Gruppo', hero: '28 Giocatori', text: 'Recuperati dallo status "in dubbio" per essere arruolabili la domenica.', cards: [{ label: 'Tasso di Successo Terapie', val: '96%', sub: 'Plauso da staff e mister' }] },
            { eyebrow: 'MY REHAB STORY · SLIDE 4/5', sub: 'Indice Efficacia Riatletizzazione', hero: '89 OVR', text: 'Recuperi lampo e continuità muscolare garantita.', chartType: 'growth' },
            { eyebrow: 'MY REHAB STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Card Mani d\'Oro', text: 'Specialista Riatletizzazione — Il salvatore del weekend calcistico!', isFinale: true }
          ]
        };

      case 'nutrizionista':
        return {
          role: 'nutrizionista',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Fuel Specialist",
          ovr: 88,
          growthHistory: [{ season: '2023/24', ovr: 76 }, { season: '2024/25', ovr: 82 }, { season: '2025/26', ovr: 88 }],
          slides: [
            { eyebrow: 'MY NUTRITION STORY · SLIDE 1/5', sub: 'Nutrizione Sportiva', hero: 'ENERGIA', text: 'Carboidrati, idratazione, integrazione e peso forma: il carburante del rendimento.', pills: ['Fuel Specialist', 'Albo Professionale'] },
            { eyebrow: 'MY NUTRITION STORY · SLIDE 2/5', sub: 'Rosa in Peso Forma', hero: '98%', text: 'Percentuale della rosa mantenuta in composizione corporea ottimale tutto l\'anno.', cards: [{ label: 'Massa Magra Guadagnata', val: '+2.3% Medio', sub: 'Potenza e resistenza aerobica' }] },
            { eyebrow: 'MY NUTRITION STORY · SLIDE 3/5', sub: 'Piani Alimentari Distribuiti', hero: '52 Schede', text: 'Diete su misura per ruoli ad alto dispendio e protocolli pre-match.', cards: [{ label: 'Idratazione Pre-Gara', val: '100% Conforme', sub: 'Zero crampi a fine partita' }] },
            { eyebrow: 'MY NUTRITION STORY · SLIDE 4/5', sub: 'Indice Efficienza Nutrizionale', hero: '88 OVR', text: 'Forma fisica invidiabile dal primo all\'ultimo minuto.', chartType: 'growth' },
            { eyebrow: 'MY NUTRITION STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Fuel Specialist', text: 'Forma Fisica Rosa: 98% in Peso Forma certificato.', isFinale: true }
          ]
        };

      case 'presidente':
        return {
          role: 'presidente',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Presidente Top Club",
          ovr: 94,
          growthHistory: [{ season: '2023/24', ovr: 82 }, { season: '2024/25', ovr: 89 }, { season: '2025/26', ovr: 94 }],
          slides: [
            { eyebrow: 'MY CLUB STORY · SLIDE 1/6', sub: 'Presidenza Societaria 2025/26', hero: 'CLUB', text: 'Visione, investimenti e governance. Ecco come il tuo club è cresciuto quest\'anno.', pills: ['Presidente Club', team, 'Club Verificato'] },
            { eyebrow: 'MY CLUB STORY · SLIDE 2/6', sub: 'Il vostro profilo ha totalizzato', hero: '15.4K', text: 'Visite ricevute da tifosi e osservatori in tutta la stagione. Il club non è mai stato così visibile!', cards: [{ label: 'Visualizzazioni Rosa Ufficiale', val: '8.200 views', sub: 'Attenzione da club professionisti' }] },
            { eyebrow: 'MY CLUB STORY · SLIDE 3/6', sub: 'Video Highlight più visto', hero: 'Gol al 90°', text: 'vs Club Rivali — Oltre 21.000 visualizzazioni sui canali digitali e social.', cards: [{ label: 'Tesserati a Sistema', val: '185 Atleti', sub: 'Prima squadra + giovanili' }] },
            { eyebrow: 'MY CLUB STORY · SLIDE 4/6', sub: 'Wall Trattative', hero: '12 Acquisti', text: 'Operazioni ufficiali completate e depositate con successo sul Wall federale.', cards: [{ label: 'Valore Brand Societario', val: '+40% Stimato', sub: 'Consolidamento patrimoniale' }] },
            { eyebrow: 'MY CLUB STORY · SLIDE 5/6', sub: 'Club Index Stagionale', hero: '94 OVR', text: 'Punteggio di governance tra i più alti della categoria.', chartType: 'growth' },
            { eyebrow: 'MY CLUB STORY · SLIDE 6/6', sub: 'Il verdetto finale', hero: 'Presidente Top Club', text: 'Club Index: 94 OVR — Gestione virtuosa e blasone consolidato!', isFinale: true }
          ]
        };

      case 'dg':
        return {
          role: 'dg',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Financial Master",
          ovr: 93,
          growthHistory: [{ season: '2023/24', ovr: 81 }, { season: '2024/25', ovr: 87 }, { season: '2025/26', ovr: 93 }],
          slides: [
            { eyebrow: 'MY GOVERNANCE STORY · SLIDE 1/5', sub: 'Direzione Generale', hero: 'STRATEGIA', text: 'Bilancio in ordine, accordi commerciali e pianificazione pluriennale.', pills: ['Financial Master', '100% Sostenibilità'] },
            { eyebrow: 'MY GOVERNANCE STORY · SLIDE 2/5', sub: 'Salute del Bilancio', hero: 'Green Status', text: 'Indice di sostenibilità finanziaria al 100%, con pieno rispetto del Salary Cap stabilito.', cards: [{ label: 'Rispetto Budget Preventivo', val: '99.2%', sub: 'Zero scostamenti critici' }] },
            { eyebrow: 'MY GOVERNANCE STORY · SLIDE 3/5', sub: 'Entrate Sponsor & Store', hero: '+28%', text: 'Crescita marcata delle entrate commerciali da partner e merchandising digitale.', cards: [{ label: 'Fornitori & Contratti', val: '100% Saldati nei tempi', sub: 'Reputazione eccellente' }] },
            { eyebrow: 'MY GOVERNANCE STORY · SLIDE 4/5', sub: 'Indice di Sostenibilità', hero: '93 OVR', text: 'Modello gestionale moderno e sostenibile.', chartType: 'growth' },
            { eyebrow: 'MY GOVERNANCE STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Financial Master', text: 'Bilancio Green Status — 100% Sostenibilità aziendale!', isFinale: true }
          ]
        };

      case 'segretario':
        return {
          role: 'segretario',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Burocrazia Zero",
          ovr: 95,
          growthHistory: [{ season: '2023/24', ovr: 85 }, { season: '2024/25', ovr: 90 }, { season: '2025/26', ovr: 95 }],
          slides: [
            { eyebrow: 'MY ADMIN STORY · SLIDE 1/5', sub: 'Segreteria Generale', hero: 'PRECISIONE', text: 'Tesseramenti federali, moduli LND, contratti e nulla osta evasi senza sbavature.', pills: ['Burocrazia Zero', 'FIGC Compliant'] },
            { eyebrow: 'MY ADMIN STORY · SLIDE 2/5', sub: 'Precisione Tesseramenti', hero: '100%', text: '185 pratiche federali depositate nei tempi. Nessuna sanzione o punto di penalizzazione.', cards: [{ label: 'Sanzioni Amministrative', val: '0 € (Zero)', sub: 'Record di conformità' }] },
            { eyebrow: 'MY ADMIN STORY · SLIDE 3/5', sub: 'Verbali & Moduli Evasi', hero: '74 Atti', text: 'Gestione documentale tempestiva per campionati, tornei e trasferte.', cards: [{ label: 'Tempo Medio Evasione Pratica', val: '< 24 Ore', sub: 'Efficienza da club pro' }] },
            { eyebrow: 'MY ADMIN STORY · SLIDE 4/5', sub: 'Indice Efficienza Segreteria', hero: '95 OVR', text: 'Macchina amministrativa perfettamente oliata.', chartType: 'growth' },
            { eyebrow: 'MY ADMIN STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Burocrazia Zero', text: '100% Precisione Tesseramenti e zero intoppi burocratici!', isFinale: true }
          ]
        };

      case 'magazziniere':
        return {
          role: 'magazziniere',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Kit Master",
          ovr: 91,
          growthHistory: [{ season: '2023/24', ovr: 80 }, { season: '2024/25', ovr: 86 }, { season: '2025/26', ovr: 91 }],
          slides: [
            { eyebrow: 'MY LOGISTICS STORY · SLIDE 1/5', sub: 'Equipment & Magazzino', hero: 'KIT', text: 'Maglie piegate, palloni gonfi, tacchetti pronti. La vittoria nasce dallo spogliatoio.', pills: ['Kit Master', team] },
            { eyebrow: 'MY LOGISTICS STORY · SLIDE 2/5', sub: 'Kit Maglie Distribuiti', hero: '850 Kit', text: 'Completi gara Home, Away e Portiere lavati, stirati e predisposti per ogni match.', cards: [{ label: 'Materiale Tecnico Gestito', val: '1.200 Articoli', sub: 'Pettorine, cinesini, borse' }] },
            { eyebrow: 'MY LOGISTICS STORY · SLIDE 3/5', sub: 'Tempestività di Resa', hero: '100%', text: 'Zero ritardi prima della partenza del pullman o del calcio d\'inizio.', cards: [{ label: 'Valutazione della Squadra', val: '10/10 Elogio Totale', sub: 'Il cuore pulsante del club' }] },
            { eyebrow: 'MY LOGISTICS STORY · SLIDE 4/5', sub: 'Indice Efficienza Magazzino', hero: '91 OVR', text: 'Cura maniacale di ogni dettaglio tecnico.', chartType: 'growth' },
            { eyebrow: 'MY LOGISTICS STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Kit Master', text: 'Spogliatoio impeccabile e resa materiale al 100%!', isFinale: true }
          ]
        };

      case 'biglietteria':
        return {
          role: 'biglietteria',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Sold Out Specialist",
          ovr: 90,
          growthHistory: [{ season: '2023/24', ovr: 77 }, { season: '2024/25', ovr: 83 }, { season: '2025/26', ovr: 90 }],
          slides: [
            { eyebrow: 'MY TICKETING STORY · SLIDE 1/5', sub: 'Biglietteria & SLO Tifoseria', hero: 'SPALTI', text: 'Botteghino, settore ospiti, fidelizzazione e calore del pubblico casalingo.', pills: ['Sold Out Specialist', team] },
            { eyebrow: 'MY TICKETING STORY · SLIDE 2/5', sub: 'Riempimento Stadio Medio', hero: '84%', text: 'Spalti gremiti nelle domeniche chiave di campionato, con 4 giornate da tutto esaurito.', cards: [{ label: 'Biglietti Emessi', val: '12.400 Tagliandi', sub: '+22% rispetto all\'anno scorso' }] },
            { eyebrow: 'MY TICKETING STORY · SLIDE 3/5', sub: 'Crescita Abbonamenti', hero: '+35%', text: 'Campagna abbonamenti record che ha garantito sostegno costante alla squadra.', cards: [{ label: 'Gestione Settore Ospiti', val: 'Zero Incidenti', sub: 'Coordinamento SLO esemplare' }] },
            { eyebrow: 'MY TICKETING STORY · SLIDE 4/5', sub: 'Indice Botteghino & Tifo', hero: '90 OVR', text: 'Entusiasmo alle stelle tra la tifoseria.', chartType: 'growth' },
            { eyebrow: 'MY TICKETING STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Sold Out Specialist', text: 'Stadio pieno, calore incessante e botteghino da record!', isFinale: true }
          ]
        };

      case 'tm':
        return {
          role: 'tm',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Logistica Perfetta",
          ovr: 92,
          growthHistory: [{ season: '2023/24', ovr: 80 }, { season: '2024/25', ovr: 86 }, { season: '2025/26', ovr: 92 }],
          slides: [
            { eyebrow: 'MY TEAM MANAGER STORY · SLIDE 1/5', sub: 'Organizzazione & Trasferte', hero: 'LOGISTICA', text: 'Pullman, hotel, distinte gara e coordinamento terna arbitrale con puntualità millimetrica.', pills: ['Logistica Perfetta', team] },
            { eyebrow: 'MY TEAM MANAGER STORY · SLIDE 2/5', sub: 'Trasferte Organizzate', hero: '16 Gare', text: '16 viaggi fuori casa coordinati senza il minimo contrattempo logistico.', cards: [{ label: 'Puntualità Arrivo Stadio', val: '100% In Orario', sub: 'Almeno 90 min prima del fischio' }] },
            { eyebrow: 'MY TEAM MANAGER STORY · SLIDE 3/5', sub: 'Distinte Gara Compilate', hero: 'Zero Errori', text: 'Consegna agli arbitri tempestiva e zero ammonizioni amministrative per la panchina.', cards: [{ label: 'Presenza Registrata', val: '100% Gara e Allenamenti', sub: 'Punto di riferimento costante' }] },
            { eyebrow: 'MY TEAM MANAGER STORY · SLIDE 4/5', sub: 'Indice Organizzativo', hero: '92 OVR', text: 'Squadra serena e concentrata solo sul campo.', chartType: 'growth' },
            { eyebrow: 'MY TEAM MANAGER STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Logistica Perfetta', text: 'Macchina organizzativa d\'acciaio al servizio dei ragazzi.', isFinale: true }
          ]
        };

      case 'settore_giovanile':
        return {
          role: 'settore_giovanile',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Fabbrica dei Talenti",
          ovr: 93,
          growthHistory: [{ season: '2023/24', ovr: 81 }, { season: '2024/25', ovr: 87 }, { season: '2025/26', ovr: 93 }],
          slides: [
            { eyebrow: 'MY YOUTH STORY · SLIDE 1/5', sub: 'Settore Giovanile & Vivaio', hero: 'TALENTI', text: 'Dalla scuola calcio alla prima squadra: forgiare i calciatori e gli uomini di domani.', pills: ['Fabbrica dei Talenti', 'Cantera Club'] },
            { eyebrow: 'MY YOUTH STORY · SLIDE 2/5', sub: 'Promossi in Prima Squadra', hero: '5 Giovani', text: '5 ragazzi delle giovanili hanno debuttato ufficialmente tra i grandi in questa stagione.', cards: [{ label: 'Campionati Giovanili Disputati', val: '8 Categorie', sub: 'Juniores, Allievi, Giovanissimi...' }] },
            { eyebrow: 'MY YOUTH STORY · SLIDE 3/5', sub: 'Crescita OVR Media Vivaio', hero: '+7 OVR', text: 'Progressi tangibili nei test fisici e nelle abilità tecniche individuali dei ragazzi.', cards: [{ label: 'Coinvolgimento Famiglie', val: '98% Soddisfazione', sub: 'Progetto educativo solido' }] },
            { eyebrow: 'MY YOUTH STORY · SLIDE 4/5', sub: 'Indice Cantera & Vivaio', hero: '93 OVR', text: 'Il futuro del club è in cassaforte.', chartType: 'growth' },
            { eyebrow: 'MY YOUTH STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Fabbrica dei Talenti', text: 'Vivaio d\'élite con 5 esordi in prima squadra!', isFinale: true }
          ]
        };

      case 'comunicazione':
        return {
          role: 'comunicazione',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Media Magnet",
          ovr: 91,
          growthHistory: [{ season: '2023/24', ovr: 79 }, { season: '2024/25', ovr: 85 }, { season: '2025/26', ovr: 91 }],
          slides: [
            { eyebrow: 'MY PRESS STORY · SLIDE 1/5', sub: 'Ufficio Stampa & Media', hero: 'NOTIZIA', text: 'Comunicati, conferenze stampa, rassegne e narrazione quotidiana delle gesta del club.', pills: ['Media Magnet', team] },
            { eyebrow: 'MY PRESS STORY · SLIDE 2/5', sub: 'Comunicati Ufficiali', hero: '115 Lanci', text: 'Pre e post partita, tesseramenti, note societarie e gestione crisi con fermezza.', cards: [{ label: 'Articoli Ripresi dai Quotidiani', val: '85 Uscite Stampa', sub: 'Carta stampata e testate web' }] },
            { eyebrow: 'MY PRESS STORY · SLIDE 3/5', sub: 'Interazioni Social Create', hero: '45.000', text: 'Condivisioni, commenti e visualizzazioni per i format video e le interviste esclusive.', cards: [{ label: 'Media Relationship', val: 'Eccellente', sub: 'Rapporti continui con i giornalisti' }] },
            { eyebrow: 'MY PRESS STORY · SLIDE 4/5', sub: 'Indice Risonanza Mediatica', hero: '91 OVR', text: 'Il brand societario splende sui media.', chartType: 'growth' },
            { eyebrow: 'MY PRESS STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Media Magnet', text: 'Rassegna stampa sempre piena e comunicazione impeccabile!', isFinale: true }
          ]
        };

      case 'marketing':
        return {
          role: 'marketing',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Commercial Top Player",
          ovr: 92,
          growthHistory: [{ season: '2023/24', ovr: 80 }, { season: '2024/25', ovr: 86 }, { season: '2025/26', ovr: 92 }],
          slides: [
            { eyebrow: 'MY MARKETING STORY · SLIDE 1/5', sub: 'Marketing & Commerciale', hero: 'BRAND', text: 'Sponsor di maglia, cartellonistica LED, licensing e vendite merchandise.', pills: ['Commercial Top Player', team] },
            { eyebrow: 'MY MARKETING STORY · SLIDE 2/5', sub: 'Sponsorizzazioni Chiuse', hero: '24 Partner', text: 'Accordi con aziende del territorio che hanno creduto con entusiasmo nel progetto.', cards: [{ label: 'Fatturato Commerciale', val: '+38% vs anno precedente', sub: 'Record storico del club' }] },
            { eyebrow: 'MY MARKETING STORY · SLIDE 3/5', sub: 'Vendite Merchandise Store', hero: '650 Maglie', text: 'Le maglie ufficiali sono andate a ruba tra tifosi, giovani atleti e collezionisti.', cards: [{ label: 'Attivazioni Gara', val: '15 Matchday Sponsor', sub: 'Coinvolgimento attivo' }] },
            { eyebrow: 'MY MARKETING STORY · SLIDE 4/5', sub: 'Indice Valore Commerciale', hero: '92 OVR', text: 'Partnership solide e ricavi in forte espansione.', chartType: 'growth' },
            { eyebrow: 'MY MARKETING STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Commercial Top Player', text: 'Record di sponsorizzazioni e brand posizionato al vertice.', isFinale: true }
          ]
        };

      case 'agente':
        return {
          role: 'agente',
          userName: name,
          teamName: 'Scuderia ' + name,
          handle: handle,
          cardBadge: "Card Top Agent",
          ovr: 92,
          growthHistory: [{ season: '2023/24', ovr: 82 }, { season: '2024/25', ovr: 87 }, { season: '2025/26', ovr: 92 }],
          slides: [
            { eyebrow: 'MY AGENT STORY · SLIDE 1/5', sub: 'Procuratore / Agente FIFA', hero: 'SCUDERIA', text: 'Tutela contrattuale, valorizzazione talenti e operazioni di mercato sul Wall.', pills: ['Top Agent FIFA', 'Scuderia Vincente'] },
            { eyebrow: 'MY AGENT STORY · SLIDE 2/5', sub: 'Operazioni Concluse sul Wall', hero: '15 Trasferimenti', text: 'Accordi chiusi con trasparenza per i tuoi assistiti dalla Serie D alla Serie B.', cards: [{ label: 'Valore Complessivo Rosa Gestita', val: '850.000 €', sub: 'Incremento OVR medio +5.4' }] },
            { eyebrow: 'MY AGENT STORY · SLIDE 3/5', sub: 'Mandati Rinnovati', hero: '100% Fiducia', text: 'Tutti i tuoi assistiti hanno rinnovato la procura, a conferma della serietà mostrata.', cards: [{ label: 'Contratti Blindati', val: '18 Accordi Formalizzati', sub: 'Tutela legale e sportiva' }] },
            { eyebrow: 'MY AGENT STORY · SLIDE 4/5', sub: 'Indice Valutazione Agenzia', hero: '92 OVR', text: 'Tra i procuratori più influenti e stimati del panorama.', chartType: 'growth' },
            { eyebrow: 'MY AGENT STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Top Agent', text: '15 contratti firmati e scuderia in piena ascesa sportiva!', isFinale: true }
          ]
        };

      case 'tifoso':
        return {
          role: 'tifoso',
          userName: name,
          teamName: team,
          handle: handle,
          cardBadge: "Card Super Tifoso",
          ovr: 96,
          growthHistory: [{ season: '2023/24', ovr: 85 }, { season: '2024/25', ovr: 91 }, { season: '2025/26', ovr: 96 }],
          slides: [
            { eyebrow: 'MY FAN STORY · SLIDE 1/5', sub: 'Passione & Tifo 2025/26', hero: 'CUORE', text: 'La sciarpa al collo, la voce spezzata alla domenica. Il vero dodicesimo uomo in campo.', pills: ['Super Tifoso', team, 'Membro dal 2021'] },
            { eyebrow: 'MY FAN STORY · SLIDE 2/5', sub: 'Hai collezionato', hero: '150 Card', text: 'Card salvate nel tuo Album personale di Elisee Scout. Sei tra l\'1% dei collezionisti più attivi!', cards: [{ label: 'Livello Album', val: 'Collezionista Legend', sub: 'Rosa del cuore completa' }] },
            { eyebrow: 'MY FAN STORY · SLIDE 3/5', sub: 'Presenze allo Stadio', hero: '18 Partite', text: 'Su 20 gare casalinghe stagionali. Non hai mai fatto mancare il tuo supporto alla maglia.', cards: [{ label: 'Sondaggi Community Votati', val: '42 Voti Espressi', sub: 'Migliore in campo sempre votato' }] },
            { eyebrow: 'MY FAN STORY · SLIDE 4/5', sub: 'Indice Passione Tifoseria', hero: '96 OVR', text: 'Fede incrollabile nei colori sociali.', chartType: 'growth' },
            { eyebrow: 'MY FAN STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Card Super Tifoso', text: 'Collezionista Legend — La bandiera del tifo sugli spalti!', isFinale: true }
          ]
        };

      case 'giornalista':
        return {
          role: 'giornalista',
          userName: name,
          teamName: 'Press & Media Network',
          handle: handle,
          cardBadge: "Card Press MVP",
          ovr: 91,
          growthHistory: [{ season: '2023/24', ovr: 79 }, { season: '2024/25', ovr: 85 }, { season: '2025/26', ovr: 91 }],
          slides: [
            { eyebrow: 'MY JOURNALIST STORY · SLIDE 1/5', sub: 'Giornalismo & Pagelle', hero: 'CRONACA', text: 'Dalla tribuna stampa al portale: cronache puntuali, voti equilibrati e interviste esclusive.', pills: ['Giornalista Verificato', 'Press Hub'] },
            { eyebrow: 'MY JOURNALIST STORY · SLIDE 2/5', sub: 'Articoli & Pagelle Pubblicate', hero: '68 Pezzi', text: 'Copertura settimanale con tag alle schede tecniche dei calciatori e dei club.', cards: [{ label: 'Letture Totali dei Report', val: '34.500 Visualizzazioni', sub: 'Audience fedele e appassionata' }] },
            { eyebrow: 'MY JOURNALIST STORY · SLIDE 3/5', sub: 'Voto Medio Assegnato', hero: '6.4 Voto', text: 'Grande obiettività nei giudizi. Solo tre 8 in pagella assegnati in tutta la stagione!', cards: [{ label: 'Badge di Verifica Stampa', val: 'Approvato con Lode', sub: 'Badge ciano verificato attivo' }] },
            { eyebrow: 'MY JOURNALIST STORY · SLIDE 4/5', sub: 'Indice Autorevolezza Stampa', hero: '91 OVR', text: 'Firma rispettata da allenatori e tifosi.', chartType: 'growth' },
            { eyebrow: 'MY JOURNALIST STORY · SLIDE 5/5', sub: 'Il verdetto finale', hero: 'Press MVP', text: 'Cronaca di qualità e badge ciano verificato sul petto.', isFinale: true }
          ]
        };

      default:
        return getWrappedPayload('giocatore', user);
    }
  }

  // --------------------------------------------------------------------------
  // RENDER SLIDE HTML NEL VIEWER
  // --------------------------------------------------------------------------
  function renderSlide(idx) {
    var payload = _wrappedState.currentPayload;
    if (!payload || !payload.slides || !payload.slides[idx]) return;

    var s = payload.slides[idx];
    var layer = document.getElementById('sw-slide-layer');
    if (!layer) return;

    // Applica classe tema ruolo
    var theme = ROLE_THEMES[_wrappedState.activeRole] || ROLE_THEMES.giocatore;
    layer.className = 'sw-slide-layer ' + theme.themeClass;

    var html = '';

    // Testata slide: Eyebrow + Titolo
    html += '<div>';
    html += '  <div class="sw-eyebrow">' + (s.eyebrow || 'SEASON WRAPPED 2025/26') + '</div>';
    html += '  <div class="sw-headline-group">';
    if (s.sub) html += '    <div class="sw-headline-sub">' + s.sub + '</div>';
    if (s.hero) html += '    <div class="sw-hero-stat-num">' + s.hero + '</div>';
    html += '  </div>';
    if (s.text) html += '  <div class="sw-comparison-text">' + s.text + '</div>';
    html += '</div>';

    // Contenuto speciale: Card FIFA OVR Finale
    if (s.isFifaCard) {
      html += '<div class="sw-fifa-card-container">';
      html += '  <div class="sw-fifa-card">';
      html += '    <div class="sw-card-ribbon-ovr">' + payload.ovr + '</div>';
      html += '    <div class="sw-card-role-title">' + (theme.label || 'Calciatore') + '</div>';
      html += '    <div class="sw-card-meta-line">' + payload.userName + ' · ' + payload.teamName + '</div>';
      if (payload.isGps) {
        html += '    <div class="sw-gps-badge">⚡ Dati Verificati — GPS Validated</div>';
      } else {
        html += '    <div class="sw-gps-badge is-manual">📋 Dati Autocertificati (Cap ' + (payload.category || 'Eccellenza') + ')</div>';
      }
      if (payload.attributes) {
        html += '    <div class="sw-card-stats-grid">';
        html += '      <div class="sw-stat-row"><span>VEL</span><span>' + payload.attributes.VEL + '</span></div>';
        html += '      <div class="sw-stat-row"><span>TIR</span><span>' + payload.attributes.TIR + '</span></div>';
        html += '      <div class="sw-stat-row"><span>PAS</span><span>' + payload.attributes.PAS + '</span></div>';
        html += '      <div class="sw-stat-row"><span>DRIB</span><span>' + payload.attributes.DRIB + '</span></div>';
        html += '      <div class="sw-stat-row"><span>DIF</span><span>' + payload.attributes.DIF + '</span></div>';
        html += '      <div class="sw-stat-row"><span>FIS</span><span>' + payload.attributes.FIS + '</span></div>';
        html += '    </div>';
      }
      html += '  </div>';
      html += '</div>';
    }

    // Contenuto speciale: Grafico Curva di Crescita Stagionale
    if (s.chartType === 'growth' && payload.growthHistory) {
      html += '<div class="sw-growth-chart-wrap">';
      html += '  <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; text-transform:uppercase; margin-bottom:0.75rem;">Curva di Crescita Stagionale</div>';
      html += '  <div class="sw-chart-bars">';
      payload.growthHistory.forEach(function (pt) {
        var hPercent = Math.max(25, Math.min(100, Math.round(((pt.ovr - 45) / 55) * 100)));
        html += '    <div class="sw-chart-col">';
        html += '      <div class="sw-chart-bar-val">' + pt.ovr + '</div>';
        html += '      <div class="sw-chart-bar-pillar" style="height:' + hPercent + '%;"></div>';
        html += '      <div class="sw-chart-season-lbl">' + pt.season + '</div>';
        html += '    </div>';
      });
      html += '  </div>';
      html += '  <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.6rem; text-align:center;">Valutazione consultabile da Direttori Sportivi & Scout</div>';
      html += '</div>';
    }

    // Card secondarie / Pills
    if (s.cards && s.cards.length) {
      html += '<div>';
      s.cards.forEach(function (c) {
        html += '  <div class="sw-stat-card">';
        html += '    <div class="sw-stat-card-label">' + c.label + '</div>';
        html += '    <div class="sw-stat-card-val">' + c.val + '</div>';
        if (c.sub) html += '    <div class="sw-stat-card-sub">' + c.sub + '</div>';
        html += '  </div>';
      });
      html += '</div>';
    }

    if (s.pills && s.pills.length) {
      html += '<div class="sw-pills-row">';
      s.pills.forEach(function (p) {
        html += '  <div class="sw-pill-item">' + p + '</div>';
      });
      html += '</div>';
    }

    // Footer
    html += '<div class="sw-story-footer">';
    html += '  <div class="sw-user-handle">' + (payload.handle || '@elisee.user') + ' · ' + (payload.teamName || 'Elisee') + '</div>';
    html += '  <div style="display:flex; gap:0.5rem; align-items:center;">';
    html += '    <button type="button" class="sw-btn-share-pill" onclick="window.SeasonWrapped.shareCurrentSlide()"><i data-lucide="share-2" style="width:13px;height:13px;"></i> Condividi</button>';
    html += '  </div>';
    html += '</div>';

    layer.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    updateProgressBars(idx);
  }

  function updateProgressBars(activeIdx) {
    var container = document.getElementById('sw-progress-bar-container');
    if (!container) return;

    var segments = container.querySelectorAll('.sw-progress-segment');
    segments.forEach(function (seg, i) {
      var fill = seg.querySelector('.sw-progress-fill');
      if (i < activeIdx) {
        seg.className = 'sw-progress-segment is-completed';
        if (fill) fill.style.width = '100%';
      } else if (i === activeIdx) {
        seg.className = 'sw-progress-segment is-active';
        if (fill) fill.style.width = '0%';
      } else {
        seg.className = 'sw-progress-segment';
        if (fill) fill.style.width = '0%';
      }
    });

    startSlideTimer();
  }

  // --------------------------------------------------------------------------
  // TIMER & CONTROLLO PLAY/PAUSE (AUTO-AVANZAMENTO INSTAGRAM STYLE)
  // --------------------------------------------------------------------------
  var _animFrame = null;

  function startSlideTimer() {
    cancelAnimationFrame(_animFrame);
    _wrappedState.startTime = performance.now();
    _wrappedState.elapsedBeforePause = 0;
    _wrappedState.isPaused = false;

    function tick(now) {
      if (!_wrappedState.isOpen) return;
      if (!_wrappedState.isPaused) {
        var elapsed = (now - _wrappedState.startTime) + _wrappedState.elapsedBeforePause;
        var pct = Math.min(100, (elapsed / _wrappedState.slideDurationMs) * 100);

        var activeSeg = document.querySelector('.sw-progress-segment.is-active .sw-progress-fill');
        if (activeSeg) activeSeg.style.width = pct + '%';

        if (elapsed >= _wrappedState.slideDurationMs) {
          nextSlide();
          return;
        }
      }
      _animFrame = requestAnimationFrame(tick);
    }
    _animFrame = requestAnimationFrame(tick);
  }

  function pauseStory() {
    if (_wrappedState.isPaused) return;
    _wrappedState.isPaused = true;
    _wrappedState.elapsedBeforePause += performance.now() - _wrappedState.startTime;
  }

  function resumeStory() {
    if (!_wrappedState.isPaused) return;
    _wrappedState.isPaused = false;
    _wrappedState.startTime = performance.now();
  }

  function nextSlide() {
    if (_wrappedState.currentSlideIdx < _wrappedState.slides.length - 1) {
      _wrappedState.currentSlideIdx++;
      renderSlide(_wrappedState.currentSlideIdx);
    } else {
      // Loop o stop all'ultima
      pauseStory();
    }
  }

  function prevSlide() {
    if (_wrappedState.currentSlideIdx > 0) {
      _wrappedState.currentSlideIdx--;
      renderSlide(_wrappedState.currentSlideIdx);
    }
  }

  // --------------------------------------------------------------------------
  // CANVAS 2D EXPORTER AD ALTA RISOLUZIONE (1080x1920 PNG PER STORY SOCIAL)
  // --------------------------------------------------------------------------
  function exportSlideAsPng() {
    var payload = _wrappedState.currentPayload;
    if (!payload) return;

    var s = payload.slides[_wrappedState.currentSlideIdx] || payload.slides[0];
    var theme = ROLE_THEMES[_wrappedState.activeRole] || ROLE_THEMES.giocatore;

    var canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    var ctx = canvas.getContext('2d');

    // 1. Sfondo con gradiente ad alta risoluzione
    var grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    if (_wrappedState.activeRole === 'giocatore') {
      grad.addColorStop(0, '#062b1b');
      grad.addColorStop(0.5, '#0d4a2f');
      grad.addColorStop(1, '#04170e');
    } else if (_wrappedState.activeRole === 'scout' || _wrappedState.activeRole === 'ds' || _wrappedState.activeRole === 'agente') {
      grad.addColorStop(0, '#1e113a');
      grad.addColorStop(0.5, '#3b1d75');
      grad.addColorStop(1, '#110922');
    } else if (_wrappedState.activeRole === 'presidente' || _wrappedState.activeRole === 'dg' || _wrappedState.activeRole === 'marketing') {
      grad.addColorStop(0, '#1a160d');
      grad.addColorStop(0.5, '#2f2510');
      grad.addColorStop(1, '#0c0a06');
    } else if (_wrappedState.activeRole === 'tifoso') {
      grad.addColorStop(0, '#1c0f38');
      grad.addColorStop(0.5, '#581c87');
      grad.addColorStop(1, '#100624');
    } else {
      grad.addColorStop(0, '#3d0e1e');
      grad.addColorStop(0.5, '#781d32');
      grad.addColorStop(1, '#1f050e');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Effetto bagliore circolare
    var radial = ctx.createRadialGradient(540, 600, 50, 540, 600, 650);
    radial.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Header Brand
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Outfit", sans-serif';
    ctx.fillText('ELISEE SCOUT', 100, 150);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 28px "Outfit", sans-serif';
    ctx.fillText('SEASON WRAPPED 2025/26', 640, 150);

    // Linea divisoria sottile
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 190);
    ctx.lineTo(980, 190);
    ctx.stroke();

    // 3. Eyebrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 30px "Outfit", sans-serif';
    ctx.fillText((s.eyebrow || 'MY SEASON STORY').toUpperCase(), 100, 310);

    // 4. Sottotitolo & Statistica Hero
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 48px "Outfit", sans-serif';
    ctx.fillText(s.sub || '', 100, 380);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 130px "Outfit", sans-serif';
    ctx.fillText(s.hero || '', 100, 520);

    // 5. Testo descrittivo (Word wrap semplice)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 36px "Inter", sans-serif';
    var textWords = (s.text || '').split(' ');
    var line = '';
    var yPos = 610;
    for (var n = 0; n < textWords.length; n++) {
      var testLine = line + textWords[n] + ' ';
      var metrics = ctx.measureText(testLine);
      if (metrics.width > 880 && n > 0) {
        ctx.fillText(line, 100, yPos);
        line = textWords[n] + ' ';
        yPos += 52;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, yPos);

    // 6. Riquadro Card FIFA o Stat Box
    if (s.isFifaCard) {
      // Rettangolo dorato Card OVR
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      roundRect(ctx, 240, 800, 600, 820, 40);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 160px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(payload.ovr), 540, 1010);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.fillText(theme.label.toUpperCase(), 540, 1090);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 32px "Inter", sans-serif';
      ctx.fillText(payload.userName + ' · ' + payload.teamName, 540, 1150);

      // Badge GPS
      ctx.fillStyle = payload.isGps ? '#22c55e' : '#eab308';
      ctx.font = 'bold 30px "Outfit", sans-serif';
      ctx.fillText(payload.isGps ? '⚡ Dati Verificati — GPS Validated' : '📋 Dati Autocertificati', 540, 1220);

      // 6 Attributi
      if (payload.attributes) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px "Outfit", sans-serif';
        var attrs = [
          ['VEL', payload.attributes.VEL, 'DRIB', payload.attributes.DRIB],
          ['TIR', payload.attributes.TIR, 'DIF', payload.attributes.DIF],
          ['PAS', payload.attributes.PAS, 'FIS', payload.attributes.FIS]
        ];
        var rowY = 1320;
        attrs.forEach(function (r) {
          ctx.fillStyle = '#cbd5e1'; ctx.fillText(r[0], 310, rowY);
          ctx.fillStyle = '#fef08a'; ctx.fillText(String(r[1]), 410, rowY);
          ctx.fillStyle = '#cbd5e1'; ctx.fillText(r[2], 560, rowY);
          ctx.fillStyle = '#fef08a'; ctx.fillText(String(r[3]), 660, rowY);
          rowY += 65;
        });
      }
      ctx.textAlign = 'left';
    } else if (s.cards && s.cards.length) {
      var boxY = 820;
      s.cards.forEach(function (c) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 3;
        roundRect(ctx, 100, boxY, 880, 180, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px "Outfit", sans-serif';
        ctx.fillText(c.label.toUpperCase(), 140, boxY + 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 54px "Outfit", sans-serif';
        ctx.fillText(c.val, 140, boxY + 120);

        if (c.sub) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '400 28px "Inter", sans-serif';
          ctx.fillText(c.sub, 140, boxY + 158);
        }
        boxY += 210;
      });
    }

    // 7. Footer & Watermark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 1750);
    ctx.lineTo(980, 1750);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Outfit", sans-serif';
    ctx.fillText(payload.handle + ' · ' + payload.teamName, 100, 1820);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#ELISEESCOUT · RECAP 2025/26', 980, 1820);

    // Esporta file PNG
    try {
      var dataUrl = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'Elisee-Season-Wrapped-' + _wrappedState.activeRole + '-slide' + (_wrappedState.currentSlideIdx + 1) + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (window.showToast) window.showToast('Immagine Story 9:16 (1080x1920) scaricata!', 'success');
    } catch (e) {
      console.error('Export PNG failed', e);
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // --------------------------------------------------------------------------
  // CONDIVISIONE NATIVA & GROWTH TRACKING (UTM PARAMETERS)
  // --------------------------------------------------------------------------
  function shareCurrentSlide() {
    var payload = _wrappedState.currentPayload;
    if (!payload) return;

    var shareUrl = 'https://elisee-scout.vercel.app/?utm_source=instagram&utm_medium=wrapped_share&utm_campaign=2025-26&utm_content=' +
      _wrappedState.activeRole + '_slide' + (_wrappedState.currentSlideIdx + 1) +
      '&ref_user_id=' + encodeURIComponent(payload.handle || 'user');

    var shareData = {
      title: 'La mia Season Wrapped 2025/26 — Elisee Scout',
      text: 'Guarda il mio recap ufficiale di fine stagione su Elisee Scout! Valutazione: ' + payload.ovr + ' OVR ' + payload.cardBadge,
      url: shareUrl
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
    } else {
      // Fallback: copia link negli appunti e scarica la card PNG
      navigator.clipboard.writeText(shareUrl).then(function () {
        if (window.showToast) window.showToast('Link copiato negli appunti! Generazione immagine...', 'info');
      }).catch(function () {});
      exportSlideAsPng();
    }
  }

  // --------------------------------------------------------------------------
  // APERTURA / CHIUSURA VIEWER MODAL
  // --------------------------------------------------------------------------
  function openWrappedViewer(role) {
    var modal = document.getElementById('elisee-wrapped-modal');
    if (!modal) return;

    // Seleziona ruolo (da parametro, da utente attivo o da simulatore)
    var activeUser = null;
    try {
      var raw = localStorage.getItem('elisee_user_auth');
      if (raw) activeUser = JSON.parse(raw);
    } catch (e) {}

    var targetRole = role;
    if (!targetRole) {
      if (window.CreatorRoleSwitcher && window.CreatorRoleSwitcher.getActiveRole) {
        targetRole = window.CreatorRoleSwitcher.getActiveRole();
      } else if (activeUser && activeUser.role) {
        targetRole = activeUser.role.toLowerCase();
      }
    }
    if (!ROLE_THEMES[targetRole]) targetRole = 'giocatore';

    _wrappedState.activeRole = targetRole;
    _wrappedState.currentPayload = getWrappedPayload(targetRole, activeUser);
    _wrappedState.slides = _wrappedState.currentPayload.slides;
    _wrappedState.currentSlideIdx = 0;
    _wrappedState.isOpen = true;

    // Popola selettore ruolo nel top bar
    var sel = document.getElementById('sw-role-select');
    if (sel) {
      sel.value = targetRole;
    }

    // Costruisci i segmenti progress bar
    var progressContainer = document.getElementById('sw-progress-bar-container');
    if (progressContainer) {
      var segHtml = '';
      _wrappedState.slides.forEach(function () {
        segHtml += '<div class="sw-progress-segment"><div class="sw-progress-fill"></div></div>';
      });
      progressContainer.innerHTML = segHtml;
    }

    modal.classList.add('is-active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    renderSlide(0);
  }

  function closeWrappedViewer() {
    var modal = document.getElementById('elisee-wrapped-modal');
    if (modal) {
      modal.classList.remove('is-active');
      modal.style.display = 'none';
    }
    _wrappedState.isOpen = false;
    cancelAnimationFrame(_animFrame);
    document.body.style.overflow = '';
  }

  // --------------------------------------------------------------------------
  // COUNTDOWN WRAPPED DAY MODAL
  // --------------------------------------------------------------------------
  function openCountdownModal() {
    var modal = document.getElementById('elisee-wrapped-countdown-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      updateCountdownNumbers();
    }
  }

  function closeCountdownModal() {
    var modal = document.getElementById('elisee-wrapped-countdown-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  function updateCountdownNumbers() {
    // Calcola giorni, ore e minuti fino al 15 Giugno
    var targetDate = new Date('2026-06-15T20:00:00Z').getTime();
    var now = Date.now();
    var diff = Math.max(0, targetDate - now);

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    var dEl = document.getElementById('sw-cd-days');
    var hEl = document.getElementById('sw-cd-hours');
    var mEl = document.getElementById('sw-cd-mins');
    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
  }

  function subscribeCountdownReminder() {
    try {
      localStorage.setItem('elisee_wrapped_reminder_optin', 'true');
      var counterEl = document.getElementById('sw-cd-sub-count');
      if (counterEl) {
        var curr = parseInt(counterEl.getAttribute('data-count') || '8230', 10);
        counterEl.textContent = (curr + 1).toLocaleString('it-IT') + ' utenti';
      }
      var btn = document.getElementById('sw-cd-btn-optin');
      if (btn) {
        btn.textContent = '✓ Iscrizione Attivata!';
        btn.style.background = '#22c55e';
        btn.style.color = '#fff';
      }
      if (window.showToast) window.showToast('Ti invieremo una notifica quando il tuo Season Wrapped sarà pronto!', 'success');
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & INIZIALIZZAZIONE GLOBALE
  // --------------------------------------------------------------------------
  function initEvents() {
    // Navigazione touch / click nelle zone laterali
    document.addEventListener('click', function (e) {
      if (!_wrappedState.isOpen) return;

      var prevZone = e.target.closest('#sw-touch-prev');
      var nextZone = e.target.closest('#sw-touch-next');
      if (prevZone) {
        prevSlide();
        return;
      }
      if (nextZone) {
        nextSlide();
        return;
      }
    });

    // Press & Hold per pausa
    var viewport = document.getElementById('sw-story-viewport');
    if (viewport) {
      viewport.addEventListener('mousedown', pauseStory);
      viewport.addEventListener('mouseup', resumeStory);
      viewport.addEventListener('touchstart', pauseStory, { passive: true });
      viewport.addEventListener('touchend', resumeStory, { passive: true });
    }

    // Tasti tastiera
    document.addEventListener('keydown', function (e) {
      if (!_wrappedState.isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        closeWrappedViewer();
      }
    });

    // Cambio ruolo dal selettore top-bar
    var roleSelect = document.getElementById('sw-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', function () {
        openWrappedViewer(this.value);
      });
    }
  }

  // Esposizione API Globale
  window.SeasonWrapped = {
    open: openWrappedViewer,
    close: closeWrappedViewer,
    next: nextSlide,
    prev: prevSlide,
    pause: pauseStory,
    resume: resumeStory,
    exportPng: exportSlideAsPng,
    shareCurrentSlide: shareCurrentSlide,
    openCountdown: openCountdownModal,
    closeCountdown: closeCountdownModal,
    subscribeReminder: subscribeCountdownReminder,
    calculatePlayerOvr: calculatePlayerOvr,
    getWrappedPayload: getWrappedPayload,
    ROLE_THEMES: ROLE_THEMES
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvents);
  } else {
    initEvents();
  }

})(window, document);
