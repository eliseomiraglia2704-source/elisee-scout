/* Area utente Giocatore — profilo Player (layout Club and Player) */
(function () {
  var SPORTS = {
    'Calcio': ['Portiere', 'Difensore centrale', 'Terzino destro', 'Terzino sinistro', 'Mediano', 'Mezzala destra', 'Mezzala sinistra', 'Centrocampista', 'Trequartista', 'Esterno destro', 'Esterno sinistro', 'Ala destra', 'Ala sinistra', 'Seconda punta', 'Centravanti'],
    'Calcio a 5': ['Portiere', 'Laterale', 'Universale', 'Pivot'],
    'Calcio a 7': ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'],
    'Calcio a 8': ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'],
    'Beach soccer': ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'],
    'Pallavolo': ['Palleggiatore', 'Schiacciatore', 'Opposto', 'Centrale', 'Libero'],
    'Beach volley': ['Blocco', 'Difesa'],
    'Basket': ['Playmaker', 'Guardia', 'Ala piccola', 'Ala grande', 'Centro'],
    'Rugby': ['Pilone', 'Tallonatore', 'Seconda linea', 'Terza linea', 'Mediano di mischia', "Mediano d'apertura", 'Centro', 'Ala', 'Estremo'],
    'Tennis': ['Singolare', 'Doppio'],
    'Padel': ['Destro', 'Sinistro'],
    'Pallamano': ['Portiere', 'Terzino', 'Centrale', 'Ala', 'Pivot'],
    'Hockey': ['Portiere', 'Difensore', 'Attaccante'],
    'Pallanuoto': ['Portiere', 'Difensore', 'Attaccante', 'Centroboa'],
    'Nuoto': ['Stile libero', 'Dorso', 'Rana', 'Farfalla', 'Misti'],
    'Atletica': ['Velocità', 'Mezzofondo', 'Fondo', 'Ostacoli', 'Salti', 'Lanci'],
    'Football americano': ['Quarterback', 'Running back', 'Wide receiver', 'Linebacker', 'Defensive back', 'Kicker'],
    'Baseball': ['Lanciatore', 'Ricevitore', 'Interno', 'Esterno'],
    'Boxe': ['Pesi mosca', 'Pesi gallo', 'Pesi piuma', 'Pesi leggeri', 'Pesi welter', 'Pesi medi', 'Pesi massimi'],
    'Judo': ['-60 kg', '-66 kg', '-73 kg', '-81 kg', '-90 kg', '-100 kg', '+100 kg'],
    'Golf': ['Amatore', 'Professionista'],
    'Altro': ['Atleta']
  };

  var CATEGORIES = [
    'Serie A', 'Serie B', 'Serie C', 'Serie D', 'Eccellenza', 'Promozione',
    'Prima Categoria', 'Seconda Categoria', 'Terza Categoria',
    'Primavera', 'Juniores Nazionali', 'Juniores Regionali',
    'Allievi Nazionali', 'Allievi Regionali', 'Giovanissimi', 'Esordienti', 'Pulcini', 'Piccoli Amici',
    'Femminile Serie A', 'Femminile Serie B', 'Femminile Serie C', 'Femminile Eccellenza',
    'Amatori', 'CSI', 'Altro'
  ];

  var NATIONS = [
    'Italia', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Belgio',
    'Bosnia ed Erzegovina', 'Brasile', 'Bulgaria', 'Camerun', 'Canada', 'Cile', 'Cina',
    'Colombia', 'Costa d\'Avorio', 'Croazia', 'Danimarca', 'Egitto', 'Finlandia', 'Francia',
    'Germania', 'Ghana', 'Giappone', 'Grecia', 'Inghilterra', 'Irlanda', 'Kosovo', 'Marocco',
    'Messico', 'Nigeria', 'Norvegia', 'Paesi Bassi', 'Paraguay', 'Perù', 'Polonia', 'Portogallo',
    'Repubblica Ceca', 'Romania', 'Senegal', 'Serbia', 'Slovacchia', 'Slovenia', 'Spagna',
    'Stati Uniti', 'Svezia', 'Svizzera', 'Tunisia', 'Turchia', 'Ucraina', 'Ungheria', 'Uruguay',
    'Venezuela', 'Altro'
  ];

  var COUNTRIES = ['Italia', 'San Marino', 'Svizzera', 'Francia', 'Germania', 'Spagna', 'Portogallo',
    'Belgio', 'Paesi Bassi', 'Austria', 'Inghilterra', 'Albania', 'Romania', 'Croazia', 'Slovenia', 'Altro'];

  var GEO = {
    'Abruzzo': { 'Chieti': ['Chieti', 'Lanciano', 'Vasto', 'Ortona', 'Francavilla al Mare'], "L'Aquila": ["L'Aquila", 'Avezzano', 'Sulmona', 'Celano'], 'Pescara': ['Pescara', 'Montesilvano', 'Spoltore', 'Città Sant\'Angelo'], 'Teramo': ['Teramo', 'Giulianova', 'Roseto degli Abruzzi', 'Atri'] },
    'Basilicata': { 'Matera': ['Matera', 'Pisticci', 'Policoro', 'Bernalda'], 'Potenza': ['Potenza', 'Melfi', 'Lavello', 'Rionero in Vulture'] },
    'Calabria': { 'Catanzaro': ['Catanzaro', 'Lamezia Terme', 'Soverato'], 'Cosenza': ['Cosenza', 'Corigliano-Rossano', 'Castrovillari', 'Paola', 'Rende'], 'Crotone': ['Crotone', 'Isola di Capo Rizzuto', 'Cirò Marina'], 'Reggio Calabria': ['Reggio Calabria', 'Gioia Tauro', 'Palmi', 'Siderno', 'Locri'], 'Vibo Valentia': ['Vibo Valentia', 'Tropea', 'Serra San Bruno'] },
    'Campania': { 'Avellino': ['Avellino', 'Ariano Irpino', 'Mercogliano', 'Atripalda'], 'Benevento': ['Benevento', 'Montesarchio', 'San Giorgio del Sannio'], 'Caserta': ['Caserta', 'Aversa', 'Marcianise', 'Maddaloni', 'Santa Maria Capua Vetere'], 'Napoli': ['Napoli', 'Giugliano in Campania', 'Torre del Greco', 'Pozzuoli', 'Casoria', 'Castellammare di Stabia', 'Afragola', 'Portici', 'Ercolano', 'Sorrento'], 'Salerno': ['Salerno', 'Cava de\' Tirreni', 'Battipaglia', 'Nocera Inferiore', 'Scafati', 'Eboli', 'Pagani'] },
    'Emilia-Romagna': { 'Bologna': ['Bologna', 'Imola', 'San Lazzaro di Savena', 'Casalecchio di Reno'], 'Ferrara': ['Ferrara', 'Cento', 'Comacchio'], 'Forlì-Cesena': ['Forlì', 'Cesena', 'Cesenatico', 'Savignano sul Rubicone'], 'Modena': ['Modena', 'Carpi', 'Sassuolo', 'Formigine', 'Mirandola'], 'Parma': ['Parma', 'Fidenza', 'Salsomaggiore Terme'], 'Piacenza': ['Piacenza', 'Fiorenzuola d\'Arda', 'Castel San Giovanni'], 'Ravenna': ['Ravenna', 'Faenza', 'Lugo', 'Cervia'], 'Reggio Emilia': ['Reggio Emilia', 'Correggio', 'Scandiano', 'Guastalla'], 'Rimini': ['Rimini', 'Riccione', 'Cattolica', 'Bellaria-Igea Marina'] },
    'Friuli-Venezia Giulia': { 'Gorizia': ['Gorizia', 'Monfalcone', 'Grado'], 'Pordenone': ['Pordenone', 'Sacile', 'Cordenons'], 'Trieste': ['Trieste', 'Muggia'], 'Udine': ['Udine', 'Codroipo', 'Gemona del Friuli', 'Tolmezzo', 'Cervignano del Friuli'] },
    'Lazio': { 'Frosinone': ['Frosinone', 'Cassino', 'Alatri', 'Sora', 'Anagni'], 'Latina': ['Latina', 'Aprilia', 'Terracina', 'Formia', 'Fondi', 'Gaeta'], 'Rieti': ['Rieti', 'Fara in Sabina', 'Poggio Mirteto'], 'Roma': ['Roma', 'Guidonia Montecelio', 'Fiumicino', 'Pomezia', 'Tivoli', 'Velletri', 'Civitavecchia', 'Anzio', 'Nettuno', 'Ostia'], 'Viterbo': ['Viterbo', 'Civitavecchia', 'Tarquinia', 'Vetralla'] },
    'Liguria': { 'Genova': ['Genova', 'Rapallo', 'Chiavari', 'Sestri Levante'], 'Imperia': ['Imperia', 'Sanremo', 'Ventimiglia', 'Bordighera'], 'La Spezia': ['La Spezia', 'Sarzana', 'Lerici'], 'Savona': ['Savona', 'Albenga', 'Finale Ligure', 'Loano'] },
    'Lombardia': { 'Bergamo': ['Bergamo', 'Treviglio', 'Seriate', 'Dalmine', 'Romano di Lombardia'], 'Brescia': ['Brescia', 'Desenzano del Garda', 'Lumezzane', 'Chiari', 'Montichiari'], 'Como': ['Como', 'Cantù', 'Erba', 'Mariano Comense'], 'Cremona': ['Cremona', 'Crema', 'Casalmaggiore'], 'Lecco': ['Lecco', 'Merate', 'Calolziocorte'], 'Lodi': ['Lodi', 'Codogno', 'Casalpusterlengo'], 'Mantova': ['Mantova', 'Castiglione delle Stiviere', 'Suzzara', 'Viadana'], 'Milano': ['Milano', 'Sesto San Giovanni', 'Cinisello Balsamo', 'Legnano', 'Rho', 'Cologno Monzese', 'Paderno Dugnano', 'Rozzano', 'San Giuliano Milanese', 'Segrate'], 'Monza e Brianza': ['Monza', 'Seregno', 'Desio', 'Cesano Maderno', 'Lissone', 'Brugherio'], 'Pavia': ['Pavia', 'Vigevano', 'Voghera', 'Stradella'], 'Sondrio': ['Sondrio', 'Morbegno', 'Tirano', 'Bormio'], 'Varese': ['Varese', 'Busto Arsizio', 'Gallarate', 'Saronno', 'Tradate'] },
    'Marche': { 'Ancona': ['Ancona', 'Senigallia', 'Jesi', 'Falconara Marittima', 'Osimo'], 'Ascoli Piceno': ['Ascoli Piceno', 'San Benedetto del Tronto', 'Grottammare'], 'Fermo': ['Fermo', 'Porto Sant\'Elpidio', 'Porto San Giorgio'], 'Macerata': ['Macerata', 'Civitanova Marche', 'Recanati', 'Tolentino'], 'Pesaro e Urbino': ['Pesaro', 'Fano', 'Urbino', 'Mondolfo'] },
    'Molise': { 'Campobasso': ['Campobasso', 'Termoli', 'Bojano'], 'Isernia': ['Isernia', 'Venafro', 'Agnone'] },
    'Piemonte': { 'Alessandria': ['Alessandria', 'Casale Monferrato', 'Novi Ligure', 'Tortona', 'Acqui Terme'], 'Asti': ['Asti', 'Canelli', 'Nizza Monferrato'], 'Biella': ['Biella', 'Cossato'], 'Cuneo': ['Cuneo', 'Alba', 'Bra', 'Fossano', 'Mondovì', 'Saluzzo'], 'Novara': ['Novara', 'Borgomanero', 'Trecate', 'Arona'], 'Torino': ['Torino', 'Moncalieri', 'Rivoli', 'Collegno', 'Nichelino', 'Settimo Torinese', 'Grugliasco', 'Chieri', 'Pinerolo', 'Ivrea'], 'Verbano-Cusio-Ossola': ['Verbania', 'Domodossola', 'Omegna'], 'Vercelli': ['Vercelli', 'Borgosesia', 'Santhià'] },
    'Puglia': { 'Bari': ['Bari', 'Altamura', 'Molfetta', 'Bitonto', 'Monopoli', 'Modugno', 'Corato', 'Gravina in Puglia', 'Conversano', 'Putignano'], 'Barletta-Andria-Trani': ['Barletta', 'Andria', 'Trani', 'Bisceglie', 'Canosa di Puglia', 'Margherita di Savoia'], 'Brindisi': ['Brindisi', 'Fasano', 'Ostuni', 'Francavilla Fontana', 'Mesagne', 'Ceglie Messapica'], 'Foggia': ['Foggia', 'San Severo', 'Cerignola', 'Manfredonia', 'Lucera', 'San Giovanni Rotondo', 'San Marco in Lamis', 'Apricena', 'Vieste', 'Monte Sant\'Angelo', 'Orta Nova', 'Torremaggiore', 'San Nicandro Garganico', 'Stornara', 'Stornarella', 'Troia', 'Bovino', 'Peschici', 'Rodi Garganico', 'Mattinata'], 'Lecce': ['Lecce', 'Nardò', 'Galatina', 'Copertino', 'Gallipoli', 'Casarano', 'Maglie', 'Tricase', 'Otranto'], 'Taranto': ['Taranto', 'Martina Franca', 'Massafra', 'Grottaglie', 'Manduria', 'Pulsano', 'Castellaneta'] },
    'Sardegna': { 'Cagliari': ['Cagliari', 'Quartu Sant\'Elena', 'Selargius', 'Assemini', 'Capoterra'], 'Nuoro': ['Nuoro', 'Siniscola', 'Macomer', 'Oliena'], 'Oristano': ['Oristano', 'Terralba', 'Cabras'], 'Sassari': ['Sassari', 'Alghero', 'Porto Torres', 'Sorso', 'Olbia', 'Tempio Pausania'], 'Sud Sardegna': ['Carbonia', 'Iglesias', 'Villacidro', 'Guspini', 'Sant\'Antioco'] },
    'Sicilia': { 'Agrigento': ['Agrigento', 'Sciacca', 'Licata', 'Canicattì', 'Favara', 'Porto Empedocle'], 'Caltanissetta': ['Caltanissetta', 'Gela', 'Niscemi', 'San Cataldo'], 'Catania': ['Catania', 'Acireale', 'Paternò', 'Misterbianco', 'Giarre', 'Caltagirone', 'Aci Catena'], 'Enna': ['Enna', 'Piazza Armerina', 'Nicosia'], 'Messina': ['Messina', 'Barcellona Pozzo di Gotto', 'Milazzo', 'Taormina', 'Capo d\'Orlando'], 'Palermo': ['Palermo', 'Bagheria', 'Carini', 'Monreale', 'Termini Imerese', 'Cefalù', 'Partinico'], 'Ragusa': ['Ragusa', 'Vittoria', 'Modica', 'Comiso', 'Scicli'], 'Siracusa': ['Siracusa', 'Augusta', 'Avola', 'Noto', 'Lentini', 'Pachino'], 'Trapani': ['Trapani', 'Marsala', 'Mazara del Vallo', 'Alcamo', 'Castelvetrano', 'Erice'] },
    'Toscana': { 'Arezzo': ['Arezzo', 'Montepulciano', 'Cortona', 'Sansepolcro'], 'Firenze': ['Firenze', 'Scandicci', 'Sesto Fiorentino', 'Empoli', 'Campi Bisenzio', 'Bagno a Ripoli'], 'Grosseto': ['Grosseto', 'Follonica', 'Orbetello', 'Castiglione della Pescaia'], 'Livorno': ['Livorno', 'Piombino', 'Cecina', 'Rosignano Marittimo'], 'Lucca': ['Lucca', 'Viareggio', 'Capannori', 'Camaiore', 'Pietrasanta'], 'Massa-Carrara': ['Massa', 'Carrara', 'Montignoso', 'Aulla'], 'Pisa': ['Pisa', 'Cascina', 'San Giuliano Terme', 'Pontedera', 'Volterra'], 'Pistoia': ['Pistoia', 'Montecatini Terme', 'Pescia', 'Quarrata'], 'Prato': ['Prato', 'Montemurlo'], 'Siena': ['Siena', 'Poggibonsi', 'Colle di Val d\'Elsa', 'Montepulciano', 'Montalcino'] },
    'Trentino-Alto Adige': { 'Bolzano': ['Bolzano', 'Merano', 'Bressanone', 'Brunico'], 'Trento': ['Trento', 'Rovereto', 'Pergine Valsugana', 'Arco', 'Riva del Garda'] },
    'Umbria': { 'Perugia': ['Perugia', 'Foligno', 'Città di Castello', 'Spoleto', 'Gubbio', 'Assisi', 'Bastia Umbra'], 'Terni': ['Terni', 'Orvieto', 'Narni', 'Amelia'] },
    "Valle d'Aosta": { 'Aosta': ['Aosta', 'Saint-Vincent', 'Courmayeur', 'Chatillon'] },
    'Veneto': { 'Belluno': ['Belluno', 'Feltre', 'Cortina d\'Ampezzo'], 'Padova': ['Padova', 'Abano Terme', 'Cittadella', 'Este', 'Monselice', 'Piove di Sacco'], 'Rovigo': ['Rovigo', 'Adria', 'Porto Viro'], 'Treviso': ['Treviso', 'Conegliano', 'Castelfranco Veneto', 'Montebelluna', 'Vittorio Veneto', 'Oderzo'], 'Venezia': ['Venezia', 'Mestre', 'Chioggia', 'San Donà di Piave', 'Mira', 'Jesolo', 'Spinea'], 'Verona': ['Verona', 'Villafranca di Verona', 'San Giovanni Lupatoto', 'Legnago', 'Bussolengo', 'Peschiera del Garda'], 'Vicenza': ['Vicenza', 'Bassano del Grappa', 'Schio', 'Valdagno', 'Arzignano', 'Thiene'] }
  };

  var bound = false;
  var filling = false;
  var saveTimer = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var STAFF_ROLES_CALCIO = [
    'Allenatore', 'Allenatore in seconda', 'Collaboratore tecnico',
    'Preparatore atletico', 'Preparatore dei portieri',
    'Match analyst', 'Video analyst', 'Scout / Osservatore',
    'Fisioterapista', 'Medico sociale', 'Nutrizionista', 'Mental coach',
    'Presidente', 'Direttore sportivo', 'Team manager', 'Dirigente accompagnatore',
    'Magazziniere', 'Segretario sportivo'
  ];
  var STAFF_ROLES_DEFAULT = [
    'Allenatore', 'Allenatore in seconda', 'Collaboratore tecnico',
    'Preparatore atletico', 'Match analyst', 'Scout / Osservatore',
    'Fisioterapista', 'Medico sociale', 'Team manager', 'Dirigente', 'Presidente'
  ];
  var ALL_STAFF_ROLES = STAFF_ROLES_CALCIO.concat(['Statistico', 'Dirigente']);
  var ISO = {
    Italia: 'IT', Francia: 'FR', Germania: 'DE', Spagna: 'ES', Portogallo: 'PT',
    Inghilterra: 'GB', 'Regno Unito': 'GB', Belgio: 'BE', 'Paesi Bassi': 'NL',
    Austria: 'AT', Svizzera: 'CH', 'San Marino': 'SM', Albania: 'AL', Romania: 'RO',
    Croazia: 'HR', Slovenia: 'SI', Argentina: 'AR', Brasile: 'BR', Polonia: 'PL',
    'Stati Uniti': 'US', Turchia: 'TR', Grecia: 'GR', Svezia: 'SE', Norvegia: 'NO',
    Danimarca: 'DK', Serbia: 'RS', Ucraina: 'UA', Marocco: 'MA', Tunisia: 'TN',
    Senegal: 'SN', Nigeria: 'NG', Ghana: 'GH', Camerun: 'CM', Giappone: 'JP',
    'Corea del Sud': 'KR', Cina: 'CN', Messico: 'MX', Canada: 'CA', Australia: 'AU'
  };

  function staffRolesFor(sport) {
    var s = String(sport || '');
    if (/calcio/i.test(s) || /beach soccer/i.test(s)) return STAFF_ROLES_CALCIO.slice();
    if (/pallavolo|basket/i.test(s)) {
      return ['Allenatore', 'Allenatore in seconda', 'Preparatore atletico', 'Scout / Osservatore', 'Fisioterapista', 'Statistico', 'Team manager'];
    }
    return STAFF_ROLES_DEFAULT.slice();
  }

  function isStaffPreciseName(role) {
    var v = String(role || '').trim().toLowerCase();
    if (!v || v === 'staff') return false;
    return ALL_STAFF_ROLES.some(function (x) { return x.toLowerCase() === v; });
  }

  function identityKey(user) {
    return String((user && (user.email || user.id || user.username)) || 'anon').trim().toLowerCase();
  }

  function loadIdentities() {
    try { return JSON.parse(localStorage.getItem('elisee_role_identity') || '{}') || {}; } catch (_) { return {}; }
  }

  function storeIdentity(user) {
    if (!user) return;
    var map = loadIdentities();
    var precise = String(user.staffRole || '').trim();
    if (!precise && isStaffPreciseName(user.ruolo)) precise = user.ruolo;
    map[identityKey(user)] = {
      family: user.siteRoleFamily || (isStaffPreciseName(precise) || String(user.ruolo || '').toLowerCase() === 'staff' ? 'Staff' : ''),
      preciseRole: precise,
      sport: user.sport || '',
      complete: !!user.staffProfileComplete
    };
    try { localStorage.setItem('elisee_role_identity', JSON.stringify(map)); } catch (_) {}
  }

  window.isStaffPreciseRole = isStaffPreciseName;

  window.isPlayerSiteRole = function (userOrRole) {
    if (userOrRole && typeof userOrRole === 'object' && window.isStaffSiteRole(userOrRole)) return false;
    var raw = typeof userOrRole === 'string'
      ? userOrRole
      : ((userOrRole && (userOrRole.ruolo || userOrRole.role)) || (window.getActiveSiteRole && window.getActiveSiteRole()) || '');
    var v = String(raw).trim().toLowerCase();
    return v === 'giocatore' || v === 'calciatore' || v === 'portiere';
  };

  window.isStaffSiteRole = function (userOrRole) {
    if (typeof userOrRole === 'string') {
      var s = userOrRole.trim().toLowerCase();
      return s === 'staff' || isStaffPreciseName(userOrRole);
    }
    var user = userOrRole || readUser();
    if (!user) return false;
    if (String(user.siteRoleFamily || '').toLowerCase() === 'staff') return true;
    if (user.staffRole && String(user.staffRole).trim()) return true;
    var r = String(user.ruolo || user.role || '').trim();
    return r.toLowerCase() === 'staff' || isStaffPreciseName(r);
  };

  window.applyStaffIdentity = function (user) {
    if (!user || typeof user !== 'object') return user;
    var map = loadIdentities();
    var saved = map[identityKey(user)] || {};
    var family = String(user.siteRoleFamily || saved.family || '').trim();
    var precise = String(user.staffRole || saved.preciseRole || '').trim();
    var roleNow = String(user.ruolo || user.role || '').trim();
    if (!family && (roleNow.toLowerCase() === 'staff' || isStaffPreciseName(roleNow))) family = 'Staff';
    if (!precise && isStaffPreciseName(roleNow)) precise = roleNow;
    if (family === 'Staff' || isStaffPreciseName(precise) || roleNow.toLowerCase() === 'staff') {
      user.siteRoleFamily = 'Staff';
      if (precise && precise.toLowerCase() !== 'staff') {
        user.staffRole = precise;
        user.ruoloDettagliato = precise;
        user.ruolo = precise;
        user.role = precise;
        user.staffProfileComplete = true;
      } else if (!roleNow) {
        user.ruolo = 'Staff';
        user.role = 'Staff';
      }
    }
    return user;
  };

  window.getPreciseSiteRole = function (user) {
    user = window.applyStaffIdentity(user || readUser());
    if (user && user.staffRole && String(user.staffRole).toLowerCase() !== 'staff') return String(user.staffRole);
    return String((user && (user.ruolo || user.role)) || '').trim();
  };

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function persistUser(user, paint) {
    try {
      localStorage.setItem('elisee_active_user', JSON.stringify(user));
      localStorage.setItem('elisee_user_data', JSON.stringify(user));
      var pp = {};
      try { pp = JSON.parse(localStorage.getItem('elisee_profilo_personale') || '{}') || {}; } catch (_) {}
      pp.nome = user.nome; pp.cognome = user.cognome;
      pp.ruolo = user.staffRole || user.ruoloDettagliato || user.ruolo;
      pp.siteRoleFamily = user.siteRoleFamily || pp.siteRoleFamily;
      pp.staffRole = user.staffRole || pp.staffRole;
      pp.bio = user.bio;
      pp.photoDataUrl = user.fotoUrl || pp.photoDataUrl;
      localStorage.setItem('elisee_profilo_personale', JSON.stringify(pp));
      storeIdentity(user);
    } catch (_) {}
    if (paint && typeof window.paintLoggedInUser === 'function') {
      try { window.paintLoggedInUser(user); } catch (_) {}
    } else {
      var name = [user.nome, user.cognome].filter(Boolean).join(' ').trim();
      var nameEl = document.getElementById('user-name-display');
      if (nameEl && name) nameEl.textContent = name;
    }
  }

  function profileOf(user) {
    var p = (user && user.playerProfile) || {};
    var full = p.fullName || [user.nome, user.cognome].filter(Boolean).join(' ').trim();
    var year = p.birthYear || '';
    if (!year && user && user.dataNascita) {
      var m = String(user.dataNascita).match(/(19|20)\d{2}/);
      if (m) year = m[0];
    }
    var h = p.heightCm, w = p.weightKg, foot = p.foot || '';
    if ((h == null || h === '') && user && user.altezzaPeso) {
      var hm = String(user.altezzaPeso).match(/(\d{2,3})\s*cm/i);
      var wm = String(user.altezzaPeso).match(/(\d{2,3})\s*kg/i);
      var fm = String(user.altezzaPeso).match(/(destro|sinistro|ambidestro)/i);
      if (hm) h = hm[1];
      if (wm) w = wm[1];
      if (fm && !foot) foot = fm[1].charAt(0).toUpperCase() + fm[1].slice(1).toLowerCase();
    }
    var notify = p.notify || {};
    var prefs = (user && user.preferenzeNotifiche) || {};
    return {
      fullName: full,
      birthYear: String(year || ''),
      nationality: p.nationality || user.nazionalita || 'Italia',
      sport: p.sport || 'Calcio',
      fieldRole: p.fieldRole || user.ruoloDettagliato || '',
      bio: p.bio || user.bio || '',
      heightCm: h == null ? '' : String(h),
      weightKg: w == null ? '' : String(w),
      foot: foot,
      experiences: Array.isArray(p.experiences) ? p.experiences : [],
      interest: p.interest || { country: 'Italia', region: '', province: '', comune: '', city: '' },
      social: p.social || { instagram: '', facebook: '', tiktok: '', x: '' },
      notify: {
        opportunities: notify.opportunities !== false,
        messages: notify.messages !== false,
        email: notify.email != null ? !!notify.email : prefs.email !== false,
        marketing: notify.marketing != null ? !!notify.marketing : !!prefs.marketing
      }
    };
  }

  function fillSelect(sel, items, firstLabel, current) {
    if (!sel) return;
    var html = '<option value="">' + esc(firstLabel || 'Seleziona') + '</option>';
    (items || []).forEach(function (it) {
      html += '<option value="' + esc(it) + '">' + esc(it) + '</option>';
    });
    sel.innerHTML = html;
    if (current) sel.value = current;
    if (current && sel.value !== current) {
      sel.innerHTML = html + '<option value="' + esc(current) + '">' + esc(current) + '</option>';
      sel.value = current;
    }
  }

  function seasons() {
    var out = [];
    var y = new Date().getFullYear() + 1;
    for (var i = y; i >= 1998; i--) out.push((i - 1) + '/' + String(i).slice(2));
    return out;
  }

  function syncRoles(sport, current) {
    var roles = SPORTS[sport] || SPORTS.Altro;
    fillSelect(document.getElementById('es-pp-role'), roles, 'Seleziona ruolo', current);
  }

  function regions() { return Object.keys(GEO); }

  function provincesOf(region) {
    var r = GEO[region];
    return r ? Object.keys(r) : [];
  }

  function comuniOf(region, province) {
    var r = GEO[region];
    if (!r) return [];
    return r[province] || [];
  }

  function refreshLocalita(keep) {
    var country = (document.getElementById('es-pp-country') || {}).value || 'Italia';
    var loc = document.getElementById('es-pp-localita');
    var cityWrap = document.getElementById('es-pp-city-wrap');
    var isIt = country === 'Italia' || country === 'San Marino';
    if (loc) loc.hidden = !isIt;
    if (cityWrap) cityWrap.hidden = isIt;
    if (!isIt) return;
    var regionSel = document.getElementById('es-pp-region');
    var provSel = document.getElementById('es-pp-province');
    var list = document.getElementById('es-pp-comuni-list');
    var region = keep && keep.region ? keep.region : (regionSel && regionSel.value) || '';
    fillSelect(regionSel, regions(), 'Regione', region);
    var province = keep && keep.province ? keep.province : (provSel && provSel.value) || '';
    fillSelect(provSel, provincesOf(regionSel && regionSel.value), 'Provincia', province);
    var comuni = comuniOf(regionSel && regionSel.value, provSel && provSel.value);
    if (list) {
      list.innerHTML = comuni.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
    }
    if (keep && keep.comune) {
      var com = document.getElementById('es-pp-comune');
      if (com) com.value = keep.comune;
    }
  }

  function expRow(data) {
    data = data || {};
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><select class="es-pp-exp-season"></select></td>' +
      '<td><select class="es-pp-exp-sport"></select></td>' +
      '<td><input class="es-pp-exp-club" type="text" placeholder="Club" value="' + esc(data.club || '') + '"></td>' +
      '<td><select class="es-pp-exp-role"></select></td>' +
      '<td><select class="es-pp-exp-cat"></select></td>' +
      '<td class="es-pp-exp-del"><button type="button" class="es-pp-x" title="Rimuovi">&times;</button></td>';
    var seasonSel = tr.querySelector('.es-pp-exp-season');
    var sportSel = tr.querySelector('.es-pp-exp-sport');
    var roleSel = tr.querySelector('.es-pp-exp-role');
    var catSel = tr.querySelector('.es-pp-exp-cat');
    fillSelect(seasonSel, seasons(), 'Stagione', data.season || '');
    fillSelect(sportSel, Object.keys(SPORTS), 'Sport', data.sport || 'Calcio');
    fillSelect(roleSel, SPORTS[sportSel.value] || SPORTS.Calcio, 'Ruolo', data.role || '');
    fillSelect(catSel, CATEGORIES, 'Categoria', data.category || '');
    sportSel.addEventListener('change', function () {
      fillSelect(roleSel, SPORTS[sportSel.value] || SPORTS.Altro, 'Ruolo', roleSel.value);
      scheduleSave();
    });
    tr.querySelector('.es-pp-x').addEventListener('click', function () {
      tr.remove();
      syncExpEmpty();
      scheduleSave();
    });
    tr.querySelectorAll('input,select').forEach(function (el) {
      el.addEventListener('change', scheduleSave);
      el.addEventListener('input', scheduleSave);
    });
    return tr;
  }

  function syncExpEmpty() {
    var body = document.getElementById('es-pp-exp-body');
    var empty = document.getElementById('es-pp-exp-empty');
    if (empty) empty.hidden = !!(body && body.children.length);
  }

  function addExperience(data) {
    var body = document.getElementById('es-pp-exp-body');
    if (!body) return;
    body.appendChild(expRow(data));
    syncExpEmpty();
  }

  function collectExperiences() {
    var rows = document.querySelectorAll('#es-pp-exp-body tr');
    var out = [];
    rows.forEach(function (tr) {
      out.push({
        season: (tr.querySelector('.es-pp-exp-season') || {}).value || '',
        sport: (tr.querySelector('.es-pp-exp-sport') || {}).value || '',
        club: (tr.querySelector('.es-pp-exp-club') || {}).value || '',
        role: (tr.querySelector('.es-pp-exp-role') || {}).value || '',
        category: (tr.querySelector('.es-pp-exp-cat') || {}).value || ''
      });
    });
    return out;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function chk(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  function splitName(full) {
    var t = String(full || '').trim().replace(/\s+/g, ' ');
    if (!t) return { nome: '', cognome: '' };
    var i = t.indexOf(' ');
    if (i < 0) return { nome: t, cognome: '' };
    return { nome: t.slice(0, i), cognome: t.slice(i + 1) };
  }

  function paintPhoto(user) {
    var img = document.getElementById('es-pp-photo-img');
    var fb = document.getElementById('es-pp-photo-fallback');
    var src = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, user)) || (user && user.fotoUrl) || '';
    if (img && src) {
      img.src = src;
      img.hidden = false;
      if (fb) fb.hidden = true;
    } else {
      if (img) { img.removeAttribute('src'); img.hidden = true; }
      if (fb) fb.hidden = false;
    }
  }

  function collectProfile() {
    var names = splitName(val('es-pp-fullname'));
    var height = val('es-pp-height');
    var weight = val('es-pp-weight');
    var foot = val('es-pp-foot');
    var phys = [height ? height + ' cm' : '', weight ? weight + ' kg' : '', foot].filter(Boolean).join(' - ');
    return {
      fullName: val('es-pp-fullname'),
      birthYear: val('es-pp-birthyear'),
      nationality: val('es-pp-nation'),
      sport: val('es-pp-sport'),
      fieldRole: val('es-pp-role'),
      bio: val('es-pp-bio'),
      heightCm: height,
      weightKg: weight,
      foot: foot,
      experiences: collectExperiences(),
      interest: {
        country: val('es-pp-country') || 'Italia',
        region: val('es-pp-region'),
        province: val('es-pp-province'),
        comune: val('es-pp-comune'),
        city: val('es-pp-city')
      },
      social: {
        instagram: val('es-pp-ig'),
        facebook: val('es-pp-fb'),
        tiktok: val('es-pp-tt'),
        x: val('es-pp-x')
      },
      notify: {
        opportunities: chk('es-pp-n-opp'),
        messages: chk('es-pp-n-msg'),
        email: chk('es-pp-n-email'),
        marketing: chk('es-pp-n-mkt')
      },
      names: names,
      phys: phys
    };
  }

  function applyToUser(user, p, photo) {
    user.nome = p.names.nome || user.nome || '';
    user.cognome = p.names.cognome || user.cognome || '';
    if (p.birthYear) user.dataNascita = p.birthYear;
    user.nazionalita = p.nationality;
    user.bio = p.bio;
    user.ruoloDettagliato = p.fieldRole;
    user.sport = p.sport;
    user.altezzaPeso = p.phys;
    user.preferenzeNotifiche = {
      push: p.notify.messages,
      email: p.notify.email,
      marketing: p.notify.marketing
    };
    if (photo) user.fotoUrl = photo;
    user.playerProfile = {
      fullName: p.fullName,
      birthYear: p.birthYear,
      nationality: p.nationality,
      sport: p.sport,
      fieldRole: p.fieldRole,
      bio: p.bio,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      foot: p.foot,
      experiences: p.experiences,
      interest: p.interest,
      social: p.social,
      notify: p.notify
    };
    return user;
  }

  function saveNow(opts) {
    if (filling) return;
    filling = true;
    try {
      var user = readUser();
      var p = collectProfile();
      var photo = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, user)) || user.fotoUrl || '';
      applyToUser(user, p, photo);
      persistUser(user, !!(opts && opts.toast));
      if (opts && opts.toast && typeof window.showToast === 'function') {
        window.showToast('Profilo Player salvato.', 'success');
      }
    } finally {
      filling = false;
    }
  }

  function scheduleSave() {
    if (filling) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveNow(); }, 450);
  }

  function fillForm(user) {
    var root = document.getElementById('es-player-profile');
    if (!root) return;
    filling = true;
    var p = profileOf(user || readUser());
    var yearSel = document.getElementById('es-pp-birthyear');
    if (yearSel && !yearSel.dataset.ready) {
      var years = [];
      var y = new Date().getFullYear() - 5;
      for (var i = y; i >= 1950; i--) years.push(String(i));
      fillSelect(yearSel, years, 'Anno', p.birthYear);
      yearSel.dataset.ready = '1';
    } else if (yearSel) yearSel.value = p.birthYear || '';
    fillSelect(document.getElementById('es-pp-nation'), NATIONS, 'Nazionalità', p.nationality || 'Italia');
    fillSelect(document.getElementById('es-pp-sport'), Object.keys(SPORTS), 'Sport', p.sport || 'Calcio');
    syncRoles(p.sport || 'Calcio', p.fieldRole);
    var setV = function (id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; };
    var setC = function (id, v) { var el = document.getElementById(id); if (el) el.checked = !!v; };
    setV('es-pp-fullname', p.fullName);
    setV('es-pp-bio', p.bio);
    setV('es-pp-height', p.heightCm);
    setV('es-pp-weight', p.weightKg);
    setV('es-pp-foot', p.foot);
    fillSelect(document.getElementById('es-pp-country'), COUNTRIES, 'Paese', (p.interest && p.interest.country) || 'Italia');
    refreshLocalita(p.interest || {});
    setV('es-pp-city', (p.interest && p.interest.city) || '');
    setV('es-pp-ig', (p.social && p.social.instagram) || '');
    setV('es-pp-fb', (p.social && p.social.facebook) || '');
    setV('es-pp-tt', (p.social && p.social.tiktok) || '');
    setV('es-pp-x', (p.social && p.social.x) || '');
    setC('es-pp-n-opp', p.notify.opportunities);
    setC('es-pp-n-msg', p.notify.messages);
    setC('es-pp-n-email', p.notify.email);
    setC('es-pp-n-mkt', p.notify.marketing);
    var body = document.getElementById('es-pp-exp-body');
    if (body) {
      body.innerHTML = '';
      (p.experiences || []).forEach(function (ex) { addExperience(ex); });
      syncExpEmpty();
    }
    paintPhoto(user || readUser());
    filling = false;
  }

  var staffBound = false;
  var staffFilling = false;
  var staffSaveTimer = null;

  function nationLabel(n) {
    return ISO[n] ? (n + ' (' + ISO[n] + ')') : n;
  }
  function nationHint(n) {
    return ISO[n] ? (ISO[n] + ' ' + n + ' (' + ISO[n] + ')') : '';
  }
  function fillNationLike(sel, items, current) {
    if (!sel) return;
    var html = '<option value="">Seleziona</option>';
    (items || []).forEach(function (it) {
      html += '<option value="' + esc(it) + '">' + esc(nationLabel(it)) + '</option>';
    });
    sel.innerHTML = html;
    if (current) sel.value = current;
    if (current && sel.value !== current) {
      sel.innerHTML = html + '<option value="' + esc(current) + '">' + esc(nationLabel(current)) + '</option>';
      sel.value = current;
    }
  }

  function staffProfileOf(user) {
    var p = (user && user.staffProfile) || {};
    var full = p.fullName || [user.nome, user.cognome].filter(Boolean).join(' ').trim();
    var year = p.birthYear || '';
    if (!year && user && user.dataNascita) {
      var m = String(user.dataNascita).match(/(19|20)\d{2}/);
      if (m) year = m[0];
    }
    var notify = p.notify || {};
    var prefs = (user && user.preferenzeNotifiche) || {};
    return {
      fullName: full,
      birthYear: String(year || ''),
      nationality: p.nationality || user.nazionalita || 'Italia',
      sport: p.sport || user.sport || 'Calcio',
      fieldRole: p.fieldRole || user.staffRole || (isStaffPreciseName(user.ruoloDettagliato) ? user.ruoloDettagliato : '') || (isStaffPreciseName(user.ruolo) ? user.ruolo : ''),
      bio: p.bio || user.bio || '',
      experiences: Array.isArray(p.experiences) ? p.experiences : [],
      interest: p.interest || { country: 'Italia', region: '', province: '', comune: '', city: '' },
      social: p.social || { instagram: '', facebook: '', tiktok: '', x: '' },
      notify: { email: notify.email != null ? !!notify.email : !!prefs.email && prefs.email === true }
    };
  }

  function sval(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function schk(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  function refreshStaffLocalita(keep) {
    var country = sval('es-sp-country') || 'Italia';
    var loc = document.getElementById('es-sp-localita');
    var cityWrap = document.getElementById('es-sp-city-wrap');
    var hint = document.getElementById('es-sp-country-hint');
    if (hint) hint.textContent = nationHint(country);
    var isIt = country === 'Italia' || country === 'San Marino';
    if (loc) loc.hidden = !isIt;
    if (cityWrap) cityWrap.hidden = isIt;
    if (!isIt) return;
    var regionSel = document.getElementById('es-sp-region');
    var provSel = document.getElementById('es-sp-province');
    var comSel = document.getElementById('es-sp-comune');
    var region = (keep && keep.region) || (regionSel && regionSel.value) || '';
    fillSelect(regionSel, Object.keys(GEO), 'Seleziona', region);
    var province = (keep && keep.province) || (provSel && provSel.value) || '';
    var provs = provincesOf(regionSel && regionSel.value);
    fillSelect(provSel, provs, 'Seleziona', province);
    if (provSel) provSel.disabled = !provs.length;
    var comuni = comuniOf(regionSel && regionSel.value, provSel && provSel.value);
    var comune = (keep && keep.comune) || (comSel && comSel.value) || '';
    fillSelect(comSel, comuni, 'Seleziona', comune);
    if (comSel) comSel.disabled = !comuni.length;
  }

  function syncStaffRoles(sport, current) {
    fillSelect(document.getElementById('es-sp-role'), staffRolesFor(sport), 'Seleziona ruolo', current);
  }

  function syncStaffMissing() {
    var el = document.getElementById('es-sp-missing');
    if (!el) return;
    var miss = [];
    if (!sval('es-sp-fullname')) miss.push('nome e cognome');
    if (!sval('es-sp-birthyear')) miss.push('anno di nascita');
    if (!sval('es-sp-nation')) miss.push('nazionalità');
    if (!sval('es-sp-sport')) miss.push('sport');
    if (!sval('es-sp-role')) miss.push('ruolo staff');
    if (!miss.length) {
      el.hidden = true;
      el.textContent = '';
    } else {
      el.hidden = false;
      el.textContent = 'Campi mancanti: ' + miss.join(', ') + '.';
    }
  }

  function staffExpCard(data) {
    data = data || {};
    var wrap = document.createElement('div');
    wrap.className = 'es-sp-exp-card';
    wrap.innerHTML =
      '<button type="button" class="es-pp-x" title="Rimuovi">&times;</button>' +
      '<div class="es-pp-grid2">' +
        '<label class="es-pp-field"><span>Stagione</span><select class="es-sp-exp-season"></select></label>' +
        '<label class="es-pp-field"><span>Sport</span><select class="es-sp-exp-sport"></select></label>' +
      '</div>' +
      '<label class="es-pp-field"><span>Club</span><input class="es-sp-exp-club" type="text" placeholder="Es. ASD Carlentini" value="' + esc(data.club || '') + '"></label>' +
      '<div class="es-pp-grid2">' +
        '<label class="es-pp-field"><span>Ruolo</span><select class="es-sp-exp-role"></select></label>' +
        '<label class="es-pp-field"><span>Categoria</span><select class="es-sp-exp-cat"></select></label>' +
      '</div>';
    var seasonSel = wrap.querySelector('.es-sp-exp-season');
    var sportSel = wrap.querySelector('.es-sp-exp-sport');
    var roleSel = wrap.querySelector('.es-sp-exp-role');
    var catSel = wrap.querySelector('.es-sp-exp-cat');
    fillSelect(seasonSel, seasons(), 'Seleziona', data.season || '');
    fillSelect(sportSel, Object.keys(SPORTS), 'Seleziona', data.sport || '');
    fillSelect(roleSel, staffRolesFor(sportSel.value || sval('es-sp-sport') || 'Calcio'), 'Seleziona', data.role || '');
    fillSelect(catSel, CATEGORIES, 'Seleziona', data.category || '');
    catSel.disabled = !sportSel.value;
    sportSel.addEventListener('change', function () {
      fillSelect(roleSel, staffRolesFor(sportSel.value), 'Seleziona', roleSel.value);
      catSel.disabled = !sportSel.value;
      scheduleStaffSave();
    });
    wrap.querySelector('.es-pp-x').addEventListener('click', function () {
      var list = document.getElementById('es-sp-exp-list');
      if (list && list.children.length <= 1) {
        wrap.querySelectorAll('input,select').forEach(function (el) { el.value = ''; });
        catSel.disabled = true;
      } else wrap.remove();
      scheduleStaffSave();
    });
    wrap.querySelectorAll('input,select').forEach(function (el) {
      el.addEventListener('change', scheduleStaffSave);
      el.addEventListener('input', scheduleStaffSave);
    });
    return wrap;
  }

  function addStaffExperience(data) {
    var list = document.getElementById('es-sp-exp-list');
    if (!list) return;
    list.appendChild(staffExpCard(data));
  }

  function collectStaffExperiences() {
    var out = [];
    document.querySelectorAll('#es-sp-exp-list .es-sp-exp-card').forEach(function (card) {
      out.push({
        season: (card.querySelector('.es-sp-exp-season') || {}).value || '',
        sport: (card.querySelector('.es-sp-exp-sport') || {}).value || '',
        club: (card.querySelector('.es-sp-exp-club') || {}).value || '',
        role: (card.querySelector('.es-sp-exp-role') || {}).value || '',
        category: (card.querySelector('.es-sp-exp-cat') || {}).value || ''
      });
    });
    return out;
  }

  function collectStaffProfile() {
    return {
      fullName: sval('es-sp-fullname'),
      birthYear: sval('es-sp-birthyear'),
      nationality: sval('es-sp-nation'),
      sport: sval('es-sp-sport'),
      fieldRole: sval('es-sp-role'),
      bio: sval('es-sp-bio'),
      experiences: collectStaffExperiences(),
      interest: {
        country: sval('es-sp-country') || 'Italia',
        region: sval('es-sp-region'),
        province: sval('es-sp-province'),
        comune: sval('es-sp-comune'),
        city: sval('es-sp-city')
      },
      social: {
        instagram: sval('es-sp-ig'),
        facebook: sval('es-sp-fb'),
        tiktok: sval('es-sp-tt'),
        x: sval('es-sp-x')
      },
      notify: { email: schk('es-sp-n-email') },
      names: splitName(sval('es-sp-fullname'))
    };
  }

  function applyStaffToUser(user, p, photo) {
    user.nome = p.names.nome || user.nome || '';
    user.cognome = p.names.cognome || user.cognome || '';
    if (p.birthYear) user.dataNascita = p.birthYear;
    user.nazionalita = p.nationality;
    user.bio = p.bio;
    user.sport = p.sport;
    user.siteRoleFamily = 'Staff';
    user.preferenzeNotifiche = Object.assign({}, user.preferenzeNotifiche || {}, {
      email: p.notify.email,
      push: p.notify.email
    });
    if (photo) user.fotoUrl = photo;
    var complete = !!(p.fullName && p.birthYear && p.nationality && p.sport && p.fieldRole);
    user.staffProfileComplete = complete;
    if (p.fieldRole) {
      user.staffRole = p.fieldRole;
      user.ruoloDettagliato = p.fieldRole;
      if (complete) {
        user.ruolo = p.fieldRole;
        user.role = p.fieldRole;
      } else {
        user.ruolo = 'Staff';
        user.role = 'Staff';
      }
    } else {
      user.ruolo = 'Staff';
      user.role = 'Staff';
    }
    user.staffProfile = {
      fullName: p.fullName,
      birthYear: p.birthYear,
      nationality: p.nationality,
      sport: p.sport,
      fieldRole: p.fieldRole,
      bio: p.bio,
      experiences: p.experiences,
      interest: p.interest,
      social: p.social,
      notify: p.notify
    };
    storeIdentity(user);
    return user;
  }

  function saveStaffNow(opts) {
    if (staffFilling) return;
    staffFilling = true;
    try {
      var user = window.applyStaffIdentity(readUser());
      var p = collectStaffProfile();
      var photo = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, user)) || user.fotoUrl || '';
      applyStaffToUser(user, p, photo);
      persistUser(user, !!(opts && opts.toast));
      if (typeof window.updateNavbarUserUI === 'function') {
        try { window.updateNavbarUserUI(); } catch (_) {}
      }
      if (opts && opts.toast && typeof window.showToast === 'function') {
        var label = user.staffRole || 'Staff';
        window.showToast(user.staffProfileComplete
          ? ('Profilo salvato. Da ora verrai riconosciuto come ' + label + '.')
          : 'Profilo Staff salvato. Completa i campi obbligatori per il riconoscimento del ruolo.', 'success');
      }
      syncStaffMissing();
    } finally {
      staffFilling = false;
    }
  }

  function scheduleStaffSave() {
    if (staffFilling) return;
    syncStaffMissing();
    clearTimeout(staffSaveTimer);
    staffSaveTimer = setTimeout(function () { saveStaffNow(); }, 450);
  }

  function paintStaffPhoto(user) {
    var img = document.getElementById('es-sp-photo-img');
    var fb = document.getElementById('es-sp-photo-fallback');
    var src = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, user)) || (user && user.fotoUrl) || '';
    if (img && src) {
      img.src = src;
      img.hidden = false;
      if (fb) fb.hidden = true;
    } else {
      if (img) { img.removeAttribute('src'); img.hidden = true; }
      if (fb) fb.hidden = false;
    }
  }

  function fillStaffForm(user) {
    var root = document.getElementById('es-staff-profile');
    if (!root) return;
    staffFilling = true;
    user = window.applyStaffIdentity(user || readUser());
    var p = staffProfileOf(user);
    var yearSel = document.getElementById('es-sp-birthyear');
    if (yearSel && !yearSel.dataset.ready) {
      var years = [];
      for (var i = 2012; i >= 1930; i--) years.push(String(i));
      fillSelect(yearSel, years, 'Seleziona', p.birthYear);
      yearSel.dataset.ready = '1';
    } else if (yearSel) yearSel.value = p.birthYear || '';
    fillNationLike(document.getElementById('es-sp-nation'), NATIONS, p.nationality || 'Italia');
    var nh = document.getElementById('es-sp-nation-hint');
    if (nh) nh.textContent = nationHint(p.nationality || 'Italia');
    fillSelect(document.getElementById('es-sp-sport'), Object.keys(SPORTS), 'Seleziona', p.sport || 'Calcio');
    syncStaffRoles(p.sport || 'Calcio', p.fieldRole);
    var setV = function (id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; };
    var setC = function (id, v) { var el = document.getElementById(id); if (el) el.checked = !!v; };
    setV('es-sp-fullname', p.fullName);
    setV('es-sp-bio', p.bio);
    fillNationLike(document.getElementById('es-sp-country'), COUNTRIES, (p.interest && p.interest.country) || 'Italia');
    refreshStaffLocalita(p.interest || {});
    setV('es-sp-city', (p.interest && p.interest.city) || '');
    setV('es-sp-ig', (p.social && p.social.instagram) || '');
    setV('es-sp-fb', (p.social && p.social.facebook) || '');
    setV('es-sp-tt', (p.social && p.social.tiktok) || '');
    setV('es-sp-x', (p.social && p.social.x) || '');
    setC('es-sp-n-email', p.notify.email);
    var list = document.getElementById('es-sp-exp-list');
    if (list) {
      list.innerHTML = '';
      var exps = p.experiences && p.experiences.length ? p.experiences : [{}];
      exps.forEach(function (ex) { addStaffExperience(ex); });
    }
    paintStaffPhoto(user);
    syncStaffMissing();
    staffFilling = false;
  }

  function onStaffPhoto(file) {
    var err = document.getElementById('es-sp-photo-err');
    var showErr = function (msg) {
      if (err) { err.hidden = false; err.textContent = msg; }
      if (typeof window.showToast === 'function') window.showToast(msg, 'error');
    };
    if (window.validateProfilePhotoFile) {
      var check = window.validateProfilePhotoFile(file);
      if (!check.ok) { showErr(check.reason); return; }
    }
    var go = window.compressProfilePhoto
      ? window.compressProfilePhoto(file)
      : new Promise(function (res, rej) {
          var r = new FileReader();
          r.onload = function () { res(r.result); };
          r.onerror = rej;
          r.readAsDataURL(file);
        });
    go.then(function (dataUrl) {
      try { localStorage.setItem('elisee_profile_photo', dataUrl); } catch (_) {}
      window.__eliseePendingPhoto = dataUrl;
      var user = window.applyStaffIdentity(readUser());
      user.fotoUrl = dataUrl;
      persistUser(user);
      paintStaffPhoto(user);
      if (err) { err.hidden = true; err.textContent = ''; }
      if (typeof window.showToast === 'function') window.showToast('Foto aggiornata.', 'success');
    }).catch(function () {
      showErr('Impossibile leggere l\'immagine.');
    });
  }

  function bindStaff() {
    if (staffBound) return;
    var root = document.getElementById('es-staff-profile');
    if (!root) return;
    staffBound = true;
    var photoBtn = document.getElementById('es-sp-photo-btn');
    var photoInput = document.getElementById('es-sp-photo-input');
    if (photoBtn && photoInput) {
      photoBtn.addEventListener('click', function () { photoInput.click(); });
      photoInput.addEventListener('change', function () {
        if (photoInput.files && photoInput.files[0]) onStaffPhoto(photoInput.files[0]);
      });
    }
    var sport = document.getElementById('es-sp-sport');
    if (sport) sport.addEventListener('change', function () {
      syncStaffRoles(sport.value, '');
      scheduleStaffSave();
    });
    var nation = document.getElementById('es-sp-nation');
    if (nation) nation.addEventListener('change', function () {
      var nh = document.getElementById('es-sp-nation-hint');
      if (nh) nh.textContent = nationHint(nation.value);
      scheduleStaffSave();
    });
    var country = document.getElementById('es-sp-country');
    if (country) country.addEventListener('change', function () { refreshStaffLocalita(); scheduleStaffSave(); });
    var region = document.getElementById('es-sp-region');
    if (region) region.addEventListener('change', function () { refreshStaffLocalita(); scheduleStaffSave(); });
    var province = document.getElementById('es-sp-province');
    if (province) province.addEventListener('change', function () { refreshStaffLocalita(); scheduleStaffSave(); });
    var addBtn = document.getElementById('es-sp-exp-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      addStaffExperience({ sport: sval('es-sp-sport') || 'Calcio' });
      scheduleStaffSave();
    });
    var saveBtn = document.getElementById('es-sp-save');
    if (saveBtn) saveBtn.addEventListener('click', function () { saveStaffNow({ toast: true }); });
    root.addEventListener('input', scheduleStaffSave);
    root.addEventListener('change', scheduleStaffSave);
  }

  function notifsStoreKey(user) {
    user = user || readUser();
    return 'elisee_user_notifications:' + String((user && (user.email || user.id || user.username)) || 'anon').toLowerCase();
  }

  window.EliseeUserNotifs = {
    tab: 'profile',
    list: function (user) {
      try {
        var rows = JSON.parse(localStorage.getItem(notifsStoreKey(user)) || '[]');
        return Array.isArray(rows) ? rows : [];
      } catch (_) { return []; }
    },
    save: function (rows, user) {
      try { localStorage.setItem(notifsStoreKey(user), JSON.stringify(rows || [])); } catch (_) {}
    },
    unreadCount: function (user) {
      return this.list(user).filter(function (n) { return !n.read; }).length;
    },
    push: function (item, user) {
      var rows = this.list(user);
      rows.unshift({
        id: (item && item.id) || ('n-' + Date.now()),
        title: (item && item.title) || 'Notifica',
        body: (item && item.body) || '',
        at: (item && item.at) || new Date().toISOString(),
        read: !!(item && item.read)
      });
      if (rows.length > 80) rows.length = 80;
      this.save(rows, user);
      this.render(user);
      this.paintBadges(user);
      return rows[0];
    },
    markAllRead: function (user) {
      var rows = this.list(user).map(function (n) { return Object.assign({}, n, { read: true }); });
      this.save(rows, user);
      this.render(user);
      this.paintBadges(user);
    },
    paintBadges: function (user) {
      var n = this.unreadCount(user);
      var dot = document.getElementById('es-nav-bell-dot');
      var tabDot = document.getElementById('es-user-tab-dot');
      if (dot) dot.hidden = n < 1;
      if (tabDot) tabDot.hidden = n < 1;
    },
    render: function (user) {
      var empty = document.getElementById('es-user-notifs-empty');
      var list = document.getElementById('es-user-notifs-list');
      if (!empty || !list) return;
      var rows = this.list(user);
      if (!rows.length) {
        empty.hidden = false;
        empty.textContent = 'Nessuna notifica da mostrare.';
        list.hidden = true;
        list.innerHTML = '';
        return;
      }
      empty.hidden = true;
      list.hidden = false;
      list.innerHTML = rows.map(function (n) {
        var when = '';
        try {
          when = new Date(n.at).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (_) { when = ''; }
        return '<li class="es-un-item' + (n.read ? '' : ' is-unread') + '">' +
          '<strong>' + esc(n.title || 'Notifica') + '</strong>' +
          (n.body ? '<p>' + esc(n.body) + '</p>' : '') +
          (when ? '<time>' + esc(when) + '</time>' : '') +
          '</li>';
      }).join('');
    },
    applyTab: function () {
      var profileBtn = document.getElementById('es-user-tab-profile');
      var notifsBtn = document.getElementById('es-user-tab-notifs');
      var bell = document.getElementById('btn-nav-notifs');
      if (profileBtn) profileBtn.classList.toggle('is-on', this.tab !== 'notifs');
      if (notifsBtn) notifsBtn.classList.toggle('is-on', this.tab === 'notifs');
      if (bell) bell.classList.toggle('is-on', this.tab === 'notifs');
      if (typeof window.syncPlayerProfileView === 'function') window.syncPlayerProfileView();
    },
    showProfile: function () {
      this.tab = 'profile';
      this.applyTab();
    },
    showNotifs: function () {
      this.tab = 'notifs';
      this.markAllRead();
      this.applyTab();
    },
    bind: function () {
      var tabs = document.getElementById('es-user-tabs');
      if (tabs && !tabs.dataset.bound) {
        tabs.dataset.bound = '1';
        tabs.addEventListener('click', function (e) {
          var btn = e.target.closest('.es-user-tab');
          if (!btn) return;
          var tab = btn.getAttribute('data-tab');
          if (tab === 'notifs') window.EliseeUserNotifs.showNotifs();
          else if (tab === 'msgs') {
            if (window.openUserMessages) window.openUserMessages();
          } else if (tab === 'seguo') {
            if (window.openChiSegui) window.openChiSegui();
          } else if (tab === 'scopri') {
            if (window.openScopriProfili) window.openScopriProfili('staff');
          } else if (tab === 'secret') {
            if (window.openSecretList) window.openSecretList();
          } else if (tab === 'wall') {
            if (window.openTransferWall) window.openTransferWall();
          } else if (tab === 'tc') {
            if (window.EliseeTC && window.EliseeTC.open) window.EliseeTC.open();
          } else window.EliseeUserNotifs.showProfile();
        });
      }
      this.paintBadges();
      this.render();
    }
  };

  window.openUserNotifications = function () {
    window.__esOpenNotifs = true;
    window.EliseeUserNotifs.tab = 'notifs';
    if (typeof window.switchView === 'function') window.switchView('user-dossier', '#user-dossier-portal');
    setTimeout(function () { window.EliseeUserNotifs.showNotifs(); }, 20);
  };

  window.syncPlayerProfileView = function (user) {
    user = window.applyStaffIdentity(user || readUser());
    var isPlayer = window.isPlayerSiteRole(user);
    var isStaff = window.isStaffSiteRole(user);
    var notifsOn = window.EliseeUserNotifs && window.EliseeUserNotifs.tab === 'notifs';
    var group = document.getElementById('user-dossier-view-group');
    var portal = document.getElementById('user-dossier-portal');
    var profile = document.getElementById('es-player-profile');
    var staff = document.getElementById('es-staff-profile');
    var legacy = document.getElementById('dossier-legacy');
    var notifs = document.getElementById('es-user-notifs');
    var light = isPlayer || isStaff || notifsOn;
    if (group) {
      group.classList.toggle('is-player-area', isPlayer && !notifsOn);
      group.classList.toggle('is-staff-area', isStaff && !notifsOn);
      group.classList.toggle('is-notifs-area', notifsOn);
    }
    if (portal) {
      portal.classList.toggle('is-player-area', isPlayer && !notifsOn);
      portal.classList.toggle('is-staff-area', isStaff && !notifsOn);
      portal.classList.toggle('is-notifs-area', notifsOn);
    }
    try {
      var vis = group && group.style.display !== 'none';
      document.body.classList.toggle('es-player-on', light && vis);
      document.body.classList.toggle('es-staff-on', isStaff && vis && !notifsOn);
      document.body.classList.toggle('es-notifs-on', notifsOn && vis);
    } catch (_) {}
    if (notifs) {
      notifs.hidden = !notifsOn;
      if (notifsOn) notifs.removeAttribute('hidden');
    }
    if (profile) {
      profile.hidden = !isPlayer || notifsOn;
      if (isPlayer && !notifsOn) profile.removeAttribute('hidden');
    }
    if (staff) {
      staff.hidden = !isStaff || notifsOn;
      if (isStaff && !notifsOn) staff.removeAttribute('hidden');
    }
    if (legacy) {
      var hideLegacy = isPlayer || isStaff || notifsOn;
      legacy.hidden = hideLegacy;
      if (hideLegacy) legacy.setAttribute('hidden', '');
      else legacy.removeAttribute('hidden');
    }
    if (isPlayer) {
      bind();
      if (!filling && !notifsOn) fillForm(user);
      try {
        var dash = document.getElementById('es-pd');
        var host = document.getElementById('es-player-profile');
        if (!notifsOn && window.EliseePlayerDash && window.EliseePlayerDash.render) {
          window.EliseePlayerDash.render(user);
        } else {
          if (dash) dash.hidden = true;
          if (host) host.classList.remove('es-pd-on');
        }
      } catch (_) {}
    }
    if (isStaff) {
      bindStaff();
      if (!staffFilling && !notifsOn) fillStaffForm(user);
      try { if (window.EliseeMercato && window.EliseeMercato.paintStaffCard) window.EliseeMercato.paintStaffCard(); } catch (_) {}
      try {
        var cd = document.getElementById('es-cd');
        var dsd = document.getElementById('es-dsd');
        var prd = document.getElementById('es-prd');
        var vd = document.getElementById('es-vd');
        var sh = document.getElementById('es-staff-profile');
        var grp = document.getElementById('user-dossier-view-group');
        if (!notifsOn && window.EliseePresDash && window.EliseePresDash.isPres && window.EliseePresDash.isPres(user)) {
          window.EliseePresDash.render(user);
        } else if (!notifsOn && window.EliseeDsDash && window.EliseeDsDash.isDs && window.EliseeDsDash.isDs(user)) {
          window.EliseeDsDash.render(user);
        } else if (!notifsOn && window.EliseeViceDash && window.EliseeViceDash.isVice && window.EliseeViceDash.isVice(user)) {
          window.EliseeViceDash.render(user);
        } else if (!notifsOn && window.EliseeCoachDash && window.EliseeCoachDash.isCoach && window.EliseeCoachDash.isCoach(user)) {
          window.EliseeCoachDash.render(user);
        } else {
          if (cd) cd.hidden = true;
          if (dsd) dsd.hidden = true;
          if (prd) prd.hidden = true;
          if (vd) vd.hidden = true;
          if (sh) { sh.classList.remove('es-pd-on'); sh.classList.remove('es-ds-on'); sh.classList.remove('es-pres-on'); sh.classList.remove('es-vice-on'); }
          if (grp) { grp.classList.remove('is-coach-dash'); grp.classList.remove('is-ds-dash'); grp.classList.remove('is-pres-dash'); grp.classList.remove('is-vice-dash'); }
        }
      } catch (_) {}
    }
    if (window.EliseeUserNotifs) {
      window.EliseeUserNotifs.render(user);
      window.EliseeUserNotifs.paintBadges(user);
    }
  };

  function onPhoto(file) {
    var err = document.getElementById('es-pp-photo-err');
    var showErr = function (msg) {
      if (err) { err.hidden = false; err.textContent = msg; }
      if (typeof window.showToast === 'function') window.showToast(msg, 'error');
    };
    if (window.validateProfilePhotoFile) {
      var check = window.validateProfilePhotoFile(file);
      if (!check.ok) { showErr(check.reason); return; }
    }
    var go = window.compressProfilePhoto
      ? window.compressProfilePhoto(file)
      : new Promise(function (res, rej) {
          var r = new FileReader();
          r.onload = function () { res(r.result); };
          r.onerror = rej;
          r.readAsDataURL(file);
        });
    go.then(function (dataUrl) {
      try { localStorage.setItem('elisee_profile_photo', dataUrl); } catch (_) {}
      window.__eliseePendingPhoto = dataUrl;
      var user = readUser();
      user.fotoUrl = dataUrl;
      persistUser(user);
      paintPhoto(user);
      if (err) { err.hidden = true; err.textContent = ''; }
      if (typeof window.showToast === 'function') window.showToast('Foto aggiornata.', 'success');
    }).catch(function () {
      showErr('Impossibile leggere l\'immagine.');
    });
  }

  function bind() {
    if (bound) return;
    var root = document.getElementById('es-player-profile');
    if (!root) return;
    bound = true;

    var photoBtn = document.getElementById('es-pp-photo-btn');
    var photoInput = document.getElementById('es-pp-photo-input');
    if (photoBtn && photoInput) {
      photoBtn.addEventListener('click', function () { photoInput.click(); });
      photoInput.addEventListener('change', function () {
        if (photoInput.files && photoInput.files[0]) onPhoto(photoInput.files[0]);
      });
    }

    var sport = document.getElementById('es-pp-sport');
    if (sport) {
      sport.addEventListener('change', function () {
        syncRoles(sport.value, '');
        scheduleSave();
      });
    }
    var country = document.getElementById('es-pp-country');
    if (country) country.addEventListener('change', function () { refreshLocalita(); scheduleSave(); });
    var region = document.getElementById('es-pp-region');
    if (region) region.addEventListener('change', function () { refreshLocalita(); scheduleSave(); });
    var province = document.getElementById('es-pp-province');
    if (province) province.addEventListener('change', function () { refreshLocalita(); scheduleSave(); });

    var addBtn = document.getElementById('es-pp-exp-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      addExperience({ sport: val('es-pp-sport') || 'Calcio', role: val('es-pp-role') });
      scheduleSave();
    });

    var saveBtn = document.getElementById('es-pp-save');
    if (saveBtn) saveBtn.addEventListener('click', function () { saveNow({ toast: true }); });

    root.addEventListener('input', scheduleSave);
    root.addEventListener('change', scheduleSave);
  }

  function wrap(name, after) {
    var prev = window[name];
    if (typeof prev !== 'function' || prev.__esPp) return;
    window[name] = function () {
      var r = prev.apply(this, arguments);
      try { after.apply(this, arguments); } catch (_) {}
      return r;
    };
    window[name].__esPp = true;
  }

  function attachHooks() {
    wrap('applyRoleDossierInterface', function (user) { window.syncPlayerProfileView(user); });
    wrap('switchView', function (view) {
      if (view === 'user-dossier') {
        if (window.EliseeUserNotifs) {
          if (window.__esOpenNotifs) {
            window.EliseeUserNotifs.tab = 'notifs';
            window.__esOpenNotifs = false;
          } else {
            window.EliseeUserNotifs.tab = 'profile';
          }
        }
        setTimeout(function () { window.syncPlayerProfileView(); }, 0);
      } else try {
        document.body.classList.remove('es-player-on');
        document.body.classList.remove('es-staff-on');
        document.body.classList.remove('es-notifs-on');
      } catch (_) {}
    });
    wrap('confirmSiteRole', function () {
      try {
        var u = readUser();
        if (String(u.ruolo || '').toLowerCase() === 'staff') {
          u.siteRoleFamily = 'Staff';
          persistUser(u);
        }
      } catch (_) {}
      setTimeout(function () { window.syncPlayerProfileView(); }, 30);
    });
    if (typeof window.paintLoggedInUser === 'function' && !window.paintLoggedInUser.__esStaffId) {
      var prevPaint = window.paintLoggedInUser;
      window.paintLoggedInUser = function (user) {
        if (user && typeof user === 'object') user = window.applyStaffIdentity(user);
        var r = prevPaint.apply(this, arguments.length ? [user].concat([].slice.call(arguments, 1)) : arguments);
        try { window.syncPlayerProfileView(user); } catch (_) {}
        return r;
      };
      window.paintLoggedInUser.__esStaffId = true;
      window.paintLoggedInUser.__esPp = true;
    }
    if (window.EliseeAuth && typeof window.EliseeAuth.applySession === 'function' && !window.EliseeAuth.applySession.__esStaffId) {
      var prevApply = window.EliseeAuth.applySession;
      window.EliseeAuth.applySession = function (user, token) {
        if (user && typeof user === 'object') {
          var local = readUser();
          if (local && user.email && local.email && String(local.email).toLowerCase() === String(user.email).toLowerCase()) {
            user.staffRole = user.staffRole || local.staffRole;
            user.staffProfile = user.staffProfile || local.staffProfile;
            user.siteRoleFamily = user.siteRoleFamily || local.siteRoleFamily;
            user.staffProfileComplete = user.staffProfileComplete || local.staffProfileComplete;
            user.playerProfile = user.playerProfile || local.playerProfile;
          }
          user = window.applyStaffIdentity(user);
        }
        return prevApply.call(this, user, token);
      };
      window.EliseeAuth.applySession.__esStaffId = true;
    }
    if (typeof window.getActiveSiteRole === 'function' && !window.getActiveSiteRole.__esStaffId) {
      window.getActiveSiteRole = function () {
        return window.getPreciseSiteRole(readUser());
      };
      window.getActiveSiteRole.__esStaffId = true;
    }
  }

  function boot() {
    bind();
    if (window.EliseeUserNotifs) window.EliseeUserNotifs.bind();
    attachHooks();
    setTimeout(attachHooks, 0);
    setTimeout(attachHooks, 400);
    document.addEventListener('elisee:user-revealed', function (e) {
      window.syncPlayerProfileView(e && e.detail && e.detail.user);
    });
    window.syncPlayerProfileView();
  }

  attachHooks();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
