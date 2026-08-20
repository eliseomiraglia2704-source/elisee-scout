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

  window.isPlayerSiteRole = function (userOrRole) {
    var raw = typeof userOrRole === 'string'
      ? userOrRole
      : ((userOrRole && (userOrRole.ruolo || userOrRole.role)) || (window.getActiveSiteRole && window.getActiveSiteRole()) || '');
    var v = String(raw).trim().toLowerCase();
    return v === 'giocatore' || v === 'calciatore' || v === 'portiere';
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
      pp.nome = user.nome; pp.cognome = user.cognome; pp.ruolo = user.ruolo; pp.bio = user.bio;
      pp.photoDataUrl = user.fotoUrl || pp.photoDataUrl;
      localStorage.setItem('elisee_profilo_personale', JSON.stringify(pp));
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

  window.syncPlayerProfileView = function (user) {
    user = user || readUser();
    var isPlayer = window.isPlayerSiteRole(user);
    var group = document.getElementById('user-dossier-view-group');
    var portal = document.getElementById('user-dossier-portal');
    var profile = document.getElementById('es-player-profile');
    var legacy = document.getElementById('dossier-legacy');
    if (group) group.classList.toggle('is-player-area', isPlayer);
    if (portal) portal.classList.toggle('is-player-area', isPlayer);
    try { document.body.classList.toggle('es-player-on', isPlayer && group && group.style.display !== 'none'); } catch (_) {}
    if (profile) {
      profile.hidden = !isPlayer;
      if (isPlayer) profile.removeAttribute('hidden');
    }
    if (legacy) {
      legacy.hidden = isPlayer;
      if (isPlayer) legacy.setAttribute('hidden', '');
      else legacy.removeAttribute('hidden');
    }
    if (isPlayer) {
      bind();
      if (!filling) fillForm(user);
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
      if (view === 'user-dossier') setTimeout(function () { window.syncPlayerProfileView(); }, 0);
      else try { document.body.classList.remove('es-player-on'); } catch (_) {}
    });
    wrap('confirmSiteRole', function () { setTimeout(function () { window.syncPlayerProfileView(); }, 30); });
    wrap('paintLoggedInUser', function (user) { window.syncPlayerProfileView(user); });
  }

  function boot() {
    bind();
    attachHooks();
    setTimeout(attachHooks, 0);
    setTimeout(attachHooks, 400);
    document.addEventListener('elisee:user-revealed', function (e) {
      window.syncPlayerProfileView(e && e.detail && e.detail.user);
    });
    window.syncPlayerProfileView();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
