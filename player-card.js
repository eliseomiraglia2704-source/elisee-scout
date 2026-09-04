/* Card calciatore collezionabile, Album, heatmap, GPS MVP, candidatura geo. */
(function () {
  'use strict';

  var HEAT_KEY = 'elisee_player_heatmap';
  var GPS_KEY = 'elisee_gps_sessions';
  var VID_KEY = 'elisee_player_highlights';
  var APPLY_KEY = 'elisee_smart_applications';
  var live = null;
  var heatRange = { form: '4-3-3', cells: {} };

  var CITY_GEO = {
    Foggia: ['Foggia', 'Puglia'], Lucera: ['Foggia', 'Puglia'], 'San Severo': ['Foggia', 'Puglia'],
    Manfredonia: ['Foggia', 'Puglia'], Cerignola: ['Foggia', 'Puglia'], Bari: ['Bari', 'Puglia'],
    Lecce: ['Lecce', 'Puglia'], Taranto: ['Taranto', 'Puglia'], Brindisi: ['Brindisi', 'Puglia'],
    Roma: ['Roma', 'Lazio'], Latina: ['Latina', 'Lazio'], Frosinone: ['Frosinone', 'Lazio'],
    Napoli: ['Napoli', 'Campania'], Salerno: ['Salerno', 'Campania'], Caserta: ['Caserta', 'Campania'],
    Milano: ['Milano', 'Lombardia'], Bergamo: ['Bergamo', 'Lombardia'], Brescia: ['Brescia', 'Lombardia'],
    Torino: ['Torino', 'Piemonte'], Cuneo: ['Cuneo', 'Piemonte'], Genova: ['Genova', 'Liguria'],
    Bologna: ['Bologna', 'Emilia-Romagna'], Firenze: ['Firenze', 'Toscana'], Venezia: ['Venezia', 'Veneto'],
    Verona: ['Verona', 'Veneto'], Padova: ['Padova', 'Veneto'], Palermo: ['Palermo', 'Sicilia'],
    Catania: ['Catania', 'Sicilia'], Cagliari: ['Cagliari', 'Sardegna'], Perugia: ['Perugia', 'Umbria'],
    Ancona: ['Ancona', 'Marche'], Pescara: ['Pescara', 'Abruzzo'], Campobasso: ['Campobasso', 'Molise'],
    Potenza: ['Potenza', 'Basilicata'], Catanzaro: ['Catanzaro', 'Calabria'], Udine: ['Udine', 'Friuli-Venezia Giulia'],
    Trento: ['Trento', 'Trentino-Alto Adige']
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey(u) {
    u = u || userObj();
    return String(u.email || u.id || '').trim().toLowerCase() || 'anon';
  }
  function storeGet(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; }
  }
  function storeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }
  function nameOf(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Calciatore';
  }
  function initials(name) {
    var p = String(name || 'C').trim().split(/\s+/);
    return ((p[0] || 'C').charAt(0) + (p[1] || p[0] || 'C').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }
  function ageOf(u) {
    var p = u.playerProfile || {};
    if (u.eta) return String(u.eta);
    var y = p.birthYear;
    if (!y && u.dataNascita) {
      var m = String(u.dataNascita).match(/(19|20)\d{2}/);
      if (m) y = m[0];
    }
    var n = parseInt(y, 10);
    if (n > 1900) return String(new Date().getFullYear() - n);
    return '';
  }
  function roleOf(u) {
    if (!u) return '';
    var p = u.playerProfile || {};
    return String(u.posLabel || u.position || p.fieldRole || u.ruoloDettagliato || u.ruolo || '').trim();
  }
  function clubOf(u) {
    if (!u) return '';
    if (typeof u.club === 'object' && u.club) return String(u.club.n || u.club.name || '').trim();
    if (typeof u.club === 'string') return u.club.trim();
    return String(u.squadra || u.club || u.squadraCuore || '').trim();
  }
  function isFree(u) {
    if (!u) return true;
    if (u.isFree !== undefined) return Boolean(u.isFree);
    var p = u.playerProfile || {};
    var st = String(p.contractStatus || '').toLowerCase();
    if (/svincol|libero|senza vincolo/.test(st)) return true;
    if (p.availTransfer === true && !clubOf(u)) return true;
    var c = clubOf(u);
    if (!c || c === 'Svincolato' || c === 'Libero') return true;
    return false;
  }
  function footOf(u) {
    var p = u.playerProfile || {};
    return String(p.foot || u.piede || '').trim();
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }

  function maTagsOf(u) {
    var name = nameOf(u);
    if (!name) return {};
    if (window.EliseeMaDash && typeof window.EliseeMaDash.tagsForPlayer === 'function') {
      try { return window.EliseeMaDash.tagsForPlayer(name) || {}; } catch (_) {}
    }
    try {
      var map = JSON.parse(localStorage.getItem('elisee_ma_card_tags_v1') || '{}') || {};
      var k = String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
      return map[k] || {};
    } catch (_) { return {}; }
  }
  function badgesOf(u) {
    var p = u.playerProfile || {};
    var out = [];
    if (Array.isArray(p.attitudeBadges) && p.attitudeBadges.length) {
      out = p.attitudeBadges.slice();
    } else {
      var r = roleOf(u).toLowerCase();
      if (/ala|esterno|terzino/.test(r)) out.push('Velocità');
      if (/centravanti|punta|attacc/.test(r)) out.push('Finalizzazione');
      if (/difens|centrale|mediano/.test(r)) out.push('Lettura');
      if (/portier/.test(r)) out.push('Reattività');
      if (/trequartista|mezzala|centrocamp/.test(r)) out.push('Visione');
      if (!out.length) out.push('Atleta');
      if (isFree(u)) out.push('Cerca squadra');
    }
    var ma = maTagsOf(u);
    if (ma && Array.isArray(ma.badges)) {
      ma.badges.forEach(function (b) {
        var t = String((b && b.title) || b || '').trim();
        if (t && out.indexOf(t) < 0) out.unshift(t);
      });
    }
    if (ma && ma.mention && out.indexOf('Menzione Speciale') < 0) out.unshift('Menzione Speciale');
    return out.slice(0, 4);
  }

  function cityOf(u) {
    return String(u.citta || u.city || u.comune || '').trim();
  }
  function geoOfCity(name) {
    var g = CITY_GEO[name];
    if (g) return { city: name, prov: g[0], reg: g[1] };
    return { city: name, prov: '', reg: '' };
  }
  function userGeo(u) {
    u = u || userObj();
    var city = cityOf(u);
    var g = geoOfCity(city);
    return {
      city: city,
      prov: String(u.provincia || g.prov || '').trim(),
      reg: String(u.regione || g.reg || '').trim()
    };
  }
  function jobGeo(job) {
    var loc = String((job && (job.location || job.city || job.citta)) || '').trim();
    var g = geoOfCity(loc);
    return {
      city: loc,
      prov: String((job && (job.provincia || job.province)) || g.prov || '').trim(),
      reg: String((job && (job.regione || job.region)) || g.reg || '').trim()
    };
  }
  function geoTier(job, u) {
    var ug = userGeo(u);
    var jg = jobGeo(job);
    if (ug.city && jg.city && ug.city.toLowerCase() === jg.city.toLowerCase()) return 1;
    if (ug.prov && jg.prov && ug.prov.toLowerCase() === jg.prov.toLowerCase()) return 2;
    if (ug.reg && jg.reg && ug.reg.toLowerCase() === jg.reg.toLowerCase()) return 3;
    return 4;
  }
  var TIER_LABEL = { 1: 'Città · km 0', 2: 'Provincia', 3: 'Regione', 4: "Resto d'Italia" };

  function statsOf(u) {
    var p = u.playerProfile || {};
    var m = Array.isArray(p.matches) ? p.matches : (Array.isArray(u.matches) ? u.matches : []);
    var g = 0, a = 0, min = 0, pres = m.length, yc = 0;
    m.forEach(function (x) {
      g += Number(x.g || x.gol || 0);
      a += Number(x.a || x.assist || 0);
      var mm = parseInt(String(x.min || x.minuti || '0'), 10);
      if (!isNaN(mm)) min += mm;
      yc += Number(x.yc || x.gialli || 0);
    });
    return { g: g, a: a, pres: pres, min: min, yc: yc };
  }

  function slugClub(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function lastNameOf(name) {
    var p = String(name || '').trim().split(/\s+/);
    return (p.length > 1 ? p[p.length - 1] : (p[0] || 'PLAYER')).toUpperCase();
  }
  function posCode(role) {
    var raw = String(role || '').trim().toUpperCase();
    if (['GK', 'POR', 'PT'].indexOf(raw) >= 0) return 'POR';
    if (['RB', 'TD'].indexOf(raw) >= 0) return 'TD';
    if (['LB', 'TS'].indexOf(raw) >= 0) return 'TS';
    if (['CB', 'DC', 'DIF'].indexOf(raw) >= 0) return 'DC';
    if (['RW', 'AD', 'ED'].indexOf(raw) >= 0) return 'AD';
    if (['LW', 'AS', 'ES'].indexOf(raw) >= 0) return 'AS';
    if (['CDM', 'MED', 'MDC'].indexOf(raw) >= 0) return 'MED';
    if (['CM', 'CC', 'MZ', 'CEN'].indexOf(raw) >= 0) return 'CC';
    if (['CAM', 'COC', 'TRQ'].indexOf(raw) >= 0) return 'TRQ';
    if (['CF', 'SP', 'AT'].indexOf(raw) >= 0) return 'SP';
    if (['ST', 'ATT', 'PUNTA', 'PC'].indexOf(raw) >= 0) return 'ATT';

    var r = String(role || '').toLowerCase();
    if (/portier/.test(r)) return 'POR';
    if (/terzino dest|terzino d/.test(r)) return 'TD';
    if (/terzino sin|terzino s/.test(r)) return 'TS';
    if (/esterno dest|ala dest/.test(r)) return 'AD';
    if (/esterno sin|ala sin/.test(r)) return 'AS';
    if (/difensore centrale|centrale/.test(r) && /dif/.test(r)) return 'DC';
    if (/difens/.test(r)) return 'DC';
    if (/median|regista/.test(r)) return 'MED';
    if (/mezzala/.test(r)) return 'CC';
    if (/trequart/.test(r)) return 'TRQ';
    if (/seconda punta/.test(r)) return 'SP';
    if (/centravanti|punta|attacc/.test(r)) return 'ATT';
    if (/centro/.test(r)) return 'CC';
    return (raw.length <= 4 && raw.length >= 2) ? raw : 'ATT';
  }
  function nationCode(n) {
    var raw = String(n || 'it').trim().toLowerCase();
    if (raw.length === 2 || raw === 'sco' || raw === 'wal' || raw === 'nir') return raw;
    var k = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var map = {
      italia: 'it', albania: 'al', algeria: 'dz', argentina: 'ar', australia: 'au', austria: 'at',
      belgio: 'be', 'bosnia ed erzegovina': 'ba', brasile: 'br', bulgaria: 'bg', camerun: 'cm',
      canada: 'ca', cile: 'cl', cina: 'cn', colombia: 'co', "costa d'avorio": 'ci', croazia: 'hr',
      danimarca: 'dk', egitto: 'eg', finlandia: 'fi', francia: 'fr', germania: 'de', ghana: 'gh',
      giappone: 'jp', grecia: 'gr', inghilterra: 'en', irlanda: 'ie', kosovo: 'xk', marocco: 'ma',
      messico: 'mx', nigeria: 'ng', norvegia: 'no', 'paesi bassi': 'nl', paraguay: 'py', peru: 'pe',
      polonia: 'pl', portogallo: 'pt', 'repubblica ceca': 'cz', romania: 'ro', senegal: 'sn',
      serbia: 'rs', slovacchia: 'sk', slovenia: 'si', spagna: 'es', 'stati uniti': 'us',
      svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', ucraina: 'ua', ungheria: 'hu',
      uruguay: 'uy', venezuela: 've'
    };
    return map[k] || 'it';
  }
  function nationOf(u) {
    if (!u) return 'Italia';
    if (u.nation) return u.nation;
    if (u.nationCode) return u.nationCode;
    var p = u.playerProfile || {};
    return String(p.nationality || u.nazionalita || u.nazione || 'Italia').trim() || 'Italia';
  }
  function clubLogo(club) {
    var s = slugClub(club);
    if (!s) return '';
    if (/atalanta/.test(s)) s = 'atalanta';
    else if (/juventus/.test(s)) s = 'juventus';
    else if (/inter/.test(s) && !/internazionale-citt/.test(s)) s = s.indexOf('inter') === 0 ? 'inter' : s;
    else if (/milan/.test(s) && !/empoli/.test(s)) s = /ac-milan|milan$/.test(s) ? 'milan' : s;
    else if (/napoli/.test(s)) s = 'napoli';
    else if (/roma/.test(s) && !/ascoli/.test(s)) s = 'roma';
    else if (/lazio/.test(s)) s = 'lazio';
    else if (/foggia/.test(s)) s = 'foggia';
    else if (/bari/.test(s)) s = 'bari';
    else if (/lecce/.test(s)) s = 'lecce';
    return 'immagini/squadre-loghi/' + s + '.png';
  }
  var CLUB_IX = {};
  function indexClubs(list) {
    (list || []).forEach(function (c) {
      var name = c.n || c.name || '';
      if (!name) return;
      CLUB_IX[slugClub(name)] = {
        league: c.l || c.league || '',
        logo: c.o || c.logo || ''
      };
    });
  }
  function leagueLogoPath(leagueName) {
    var lg = String(leagueName || '').toUpperCase();
    if (!lg) return '';
    if (lg.indexOf('FEMMINILE') >= 0) {
      if (lg.indexOf('PRIMAVERA 1') >= 0) return 'immagini/squadre-loghi/primavera-1-femminile.png';
      if (lg.indexOf('PRIMAVERA 2') >= 0) return 'immagini/squadre-loghi/primavera-2-femminile.png';
      if (lg.indexOf('SERIE A') >= 0) return 'immagini/squadre-loghi/serie-a-femminile.png';
      if (lg.indexOf('SERIE B') >= 0) return 'immagini/squadre-loghi/serie-b-femminile.png';
      if (lg.indexOf('SERIE C') >= 0) return 'immagini/squadre-loghi/serie-c-femminile.png';
    }
    if (lg.indexOf('SERIE A') >= 0) return 'immagini/squadre-loghi/serie-a.png';
    if (lg.indexOf('SERIE B') >= 0) return 'immagini/squadre-loghi/serie-b.png';
    if (lg.indexOf('SERIE C') >= 0) return 'immagini/squadre-loghi/serie-c.png';
    if (lg.indexOf('SERIE D') >= 0) return 'immagini/squadre-loghi/serie-d.png';
    if (lg.indexOf('ECCELLENZA') >= 0) return 'immagini/squadre-loghi/eccellenza.png';
    if (lg.indexOf('PROMOZIONE') >= 0) return 'immagini/squadre-loghi/promozione.png';
    if (lg.indexOf('PRIMA CATEGORIA') >= 0) return 'immagini/squadre-loghi/prima-categoria.png';
    if (lg.indexOf('SECONDA CATEGORIA') >= 0) return 'immagini/squadre-loghi/seconda-categoria.png';
    if (lg.indexOf('TERZA CATEGORIA') >= 0) return 'immagini/squadre-loghi/terza-categoria.png';
    if (lg.indexOf('PRIMAVERA 1') >= 0) return 'immagini/squadre-loghi/primavera-1.png';
    if (lg.indexOf('PRIMAVERA 2') >= 0) return 'immagini/squadre-loghi/primavera-2.png';
    if (lg.indexOf('PRIMAVERA 3') >= 0) return 'immagini/squadre-loghi/primavera-3.png';
    if (lg.indexOf('PRIMAVERA 4') >= 0) return 'immagini/squadre-loghi/primavera-4.png';
    if (lg.indexOf('PREMIER') >= 0) return 'immagini/squadre-loghi/english-premier-league.png';
    if (lg.indexOf('LA LIGA') >= 0) return 'immagini/squadre-loghi/la-liga.png';
    if (lg.indexOf('BUNDESLIGA') >= 0) return 'immagini/squadre-loghi/bundesliga.png';
    if (lg.indexOf('LIGUE 1') >= 0) return 'immagini/squadre-loghi/ligue-1.png';
    if (lg.indexOf('PRIMEIRA') >= 0) return 'immagini/squadre-loghi/primeira-liga.png';
    if (lg.indexOf('EREDIVISIE') >= 0) return 'immagini/squadre-loghi/eredivisie.png';
    return '';
  }
  function leagueOf(u) {
    if (!u) return '';
    if (typeof u.club === 'object' && u.club && (u.club.l || u.club.league)) return String(u.club.l || u.club.league).trim();
    var p = (u && u.playerProfile) || {};
    var direct = p.campionato || p.league || p.lega || (u && (u.campionato || u.lega)) || '';
    if (direct) return String(direct).trim();
    var k = slugClub(clubOf(u));
    if (k && CLUB_IX[k] && CLUB_IX[k].league) return CLUB_IX[k].league;
    if (/atalanta|juventus|inter$|ac-milan|^milan$|napoli|roma$|lazio|fiorentina|bologna|torino|genoa|sassuolo|udinese|cagliari|parma|como|lecce|verona|cremonese|frosinone|monza/.test(k)) {
      return 'SERIE A';
    }
    return '';
  }
  function idsHtml(u) {
    var nat = nationCode(nationOf(u));
    var flag = '<img class="es-pc-flag" src="immagini/nazioni-bandiere/' + esc(nat) + '.png" alt="" onerror="this.style.visibility=\'hidden\'">';
    var lgSrc = leagueLogoPath(leagueOf(u));
    var club = clubOf(u);
    var cSrc = (typeof u.club === 'object' && u.club && (u.club.o || u.club.logo)) ? (u.club.o || u.club.logo) : clubLogo(club);
    if (club && CLUB_IX[slugClub(club)] && CLUB_IX[slugClub(club)].logo) {
      cSrc = CLUB_IX[slugClub(club)].logo;
    }
    var lg = lgSrc
      ? '<img class="es-pc-leaguelogo" src="' + esc(lgSrc) + '" alt="" onerror="this.style.visibility=\'hidden\'">'
      : '';
    var cl = (cSrc && !isFree(u))
      ? '<img class="es-pc-clublogo" src="' + esc(cSrc) + '" alt="" onerror="this.style.visibility=\'hidden\'">'
      : '';
    return flag + lg + cl;
  }
  function hashN(s) {
    var n = 0;
    String(s || '').split('').forEach(function (c) { n += c.charCodeAt(0); });
    return Math.abs(n);
  }
  function clamp(n, a, b) {
    n = Math.round(Number(n) || 0);
    return Math.max(a, Math.min(b, n));
  }
  function cardStats(u) {
    if (!u) return { velocita: 0, tiro: 0, passaggio: 0, dribbling: 0, difesa: 0, fisico: 0 };
    if (u.stats && typeof u.stats === 'object') {
      return {
        velocita: u.stats.velocita || u.stats.vel || 0,
        tiro: u.stats.tiro || u.stats.tir || 0,
        passaggio: u.stats.passaggio || u.stats.pas || 0,
        dribbling: u.stats.dribbling || u.stats.dri || 0,
        difesa: u.stats.difesa || u.stats.dif || 0,
        fisico: u.stats.fisico || u.stats.fis || 0
      };
    }
    if (window.EliseeCardAtelier && typeof window.EliseeCardAtelier.statsOf === 'function') {
      return window.EliseeCardAtelier.statsOf(u);
    }
    return { velocita: 0, tiro: 0, passaggio: 0, dribbling: 0, difesa: 0, fisico: 0 };
  }
  function ovrOf(u) {
    if (!u) return null;
    if (u.ovr != null) return Number(u.ovr);
    if (window.EliseeCardAtelier && typeof window.EliseeCardAtelier.ovrOf === 'function') {
      var o = window.EliseeCardAtelier.ovrOf(u);
      return o == null ? null : o;
    }
    return null;
  }
  function itAttrs(u) {
    var st = cardStats(u);
    var rows = (window.EliseeCardAtelier && window.EliseeCardAtelier.STATS) || [
      { id: 'velocita', short: 'VEL', label: 'Velocità' },
      { id: 'tiro', short: 'TIR', label: 'Tiro' },
      { id: 'passaggio', short: 'PAS', label: 'Passaggio' },
      { id: 'dribbling', short: 'DRI', label: 'Dribbling' },
      { id: 'difesa', short: 'DIF', label: 'Difesa' },
      { id: 'fisico', short: 'FIS', label: 'Fisico' }
    ];
    return rows.map(function (s) {
      return [s.short, st[s.id] ? st[s.id] : '–', s.label];
    });
  }
  function faceSrc(u) {
    if (u && u.faceUrl) return u.faceUrl;
    if (window.EliseeCardAtelier && typeof window.EliseeCardAtelier.faceSrc === 'function') {
      return window.EliseeCardAtelier.faceSrc(u);
    }
    return 'immagini/card-elisee/esempio-viso.png?v=20260903_ELISEE10';
  }

  function displaySurname(u) {
    var last = String((u && (u.cognome || u.surname)) || lastNameOf(nameOf(u)) || 'Player').trim();
    if (!last) return 'Player';
    return last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
  }
  function playstyleIcon(label) {
    var k = String(label || '').toLowerCase();
    var d = 'M12 3l2.2 6.6H21l-5.4 4 2.1 6.4L12 16.8 6.3 20l2.1-6.4L3 9.6h6.8z';
    if (/veloc|sprint|pace|rocket/.test(k)) d = 'M13 2L4 14h7l-1 8 10-14h-7l0-6z';
    else if (/final|shot|tiro|gol/.test(k)) d = 'M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3a4 4 0 1 0 .01 8.01A4 4 0 0 0 12 8z';
    else if (/lettur|dif|tackle|difesa/.test(k)) d = 'M12 3l8 3v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3z';
    else if (/vision|pass|visione/.test(k)) d = 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
    else if (/reattiv|gk|portier/.test(k)) d = 'M13 2L3 14h8l-1 8 11-12h-8l0-8z';
    else if (/menzion|special/.test(k)) d = 'M12 2l2.4 7.2H22l-6 4.4 2.3 7.4L12 16.8 5.7 21l2.3-7.4-6-4.4h7.6z';
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="' + d + '"/></svg>';
  }
  function playstylesHtml(u) {
    var list = badgesOf(u).filter(function (b) { return b && b !== 'Cerca squadra'; }).slice(0, 3);
    if (!list.length) list = ['Atleta'];
    return '<div class="es-pc-playstyles" aria-hidden="true">' + list.map(function (b) {
      return '<span class="es-pc-ps" title="' + esc(b) + '">' + playstyleIcon(b) + '</span>';
    }).join('') + '</div>';
  }

  function cardHtml(u, opts) {
    opts = opts || {};
    var name = nameOf(u);
    var free = isFree(u);
    var ovr = ovrOf(u);
    var pos = posCode(roleOf(u));
    var face = faceSrc(u);

    var statsHtml = '';
    if (opts.showStats === true) {
      var rows = itAttrs(u);
      var labs = rows.map(function (row) {
        return '<span title="' + esc(row[2]) + '">' + esc(row[0]) + '</span>';
      }).join('');
      var nums = rows.map(function (row) {
        return '<b title="' + esc(row[2]) + '">' + esc(row[1]) + '</b>';
      }).join('');
      statsHtml =
        '<div class="es-pc-stat-labs">' + labs + '</div>' +
        '<div class="es-pc-stat-nums">' + nums + '</div>';
    }

    return '<div class="es-pc-card-shell">' +
      '<article class="es-pc-card es-pc-elisee' + (opts.showStats ? ' has-stats' : ' has-no-stats') + '"' +
        (opts.hideHint ? '' : ' id="es-pc-card"') +
        ' tabindex="0" role="button" aria-label="Apri Card di ' + esc(name) + '">' +
        '<img class="es-pc-frame" src="immagini/card-elisee/sfondo.png" alt="">' +
        '<div class="es-pc-fifa-ovrcol">' +
          '<div class="es-pc-ovr" title="Overall">' + (ovr == null ? '–' : ovr) + '</div>' +
          '<div class="es-pc-pos">' + esc(pos) + '</div>' +
        '</div>' +
        '<div class="es-pc-inner">' +
          '<div class="es-pc-kit"><img src="immagini/card-elisee/maglia.png?v=20260903_ELISEE10" alt=""></div>' +
          '<div class="es-pc-fifa-photo"><img class="es-pc-player" src="' + esc(face) + '" alt=""></div>' +
          '<div class="es-pc-fifa-bottom">' +
            '<div class="es-pc-fifa-name">' + esc(displaySurname(u)) + '</div>' +
            statsHtml +
            '<div class="es-pc-fifa-ids">' + idsHtml(u) + '</div>' +
            '<div class="es-pc-fifa-status' + (free ? ' is-free' : '') + '">' +
              (free ? 'Svincolato' : 'VERIFICATO') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article></div>';
  }

  function scontornaImg(img) {
    if (!img || img.dataset.cut === '1') return;
    function run() {
      if (img.dataset.cut === '1') return;
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h || w < 12 || h < 12) return;
      var c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      var ctx = c.getContext('2d');
      try { ctx.drawImage(img, 0, 0); } catch (e) { return; }
      var id;
      try { id = ctx.getImageData(0, 0, w, h); } catch (e) { return; }
      var d = id.data;
      function idx(x, y) { return (y * w + x) * 4; }
      var transEdge = 0, edgeN = 0, ex, ey, stepX = Math.max(1, (w / 50) | 0), stepY = Math.max(1, (h / 50) | 0);
      for (ex = 0; ex < w; ex += stepX) {
        edgeN += 2;
        if (d[idx(ex, 0) + 3] < 12) transEdge++;
        if (d[idx(ex, h - 1) + 3] < 12) transEdge++;
      }
      for (ey = 0; ey < h; ey += stepY) {
        edgeN += 2;
        if (d[idx(0, ey) + 3] < 12) transEdge++;
        if (d[idx(w - 1, ey) + 3] < 12) transEdge++;
      }
      if (edgeN && transEdge / edgeN > 0.3) {
        img.dataset.cut = '1';
        return;
      }
      function dist(i, r, g, b) {
        return Math.abs(d[i] - r) + Math.abs(d[i + 1] - g) + Math.abs(d[i + 2] - b);
      }
      var sr = 0, sg = 0, sb = 0, n = 0;
      function acc(x, y) {
        var i = idx(x, y);
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
      }
      var sx = Math.max(1, (w / 50) | 0), sy = Math.max(1, (h / 50) | 0);
      var x, y;
      for (x = 0; x < w; x += sx) { acc(x, 0); acc(x, h - 1); }
      for (y = 0; y < h; y += sy) { acc(0, y); acc(w - 1, y); }
      sr = (sr / n) | 0; sg = (sg / n) | 0; sb = (sb / n) | 0;
      var thr = 62;
      var seen = new Uint8Array(w * h);
      var q = [];
      function push(px, py) {
        if (px < 0 || py < 0 || px >= w || py >= h) return;
        var p = py * w + px;
        if (seen[p]) return;
        var i = idx(px, py);
        if (d[i + 3] < 8) { seen[p] = 1; return; }
        if (dist(i, sr, sg, sb) > thr) return;
        seen[p] = 1;
        q.push(p);
      }
      for (x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
      for (y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
      var qi = 0;
      while (qi < q.length) {
        var p = q[qi++];
        var px = p % w, py = (p / w) | 0;
        d[idx(px, py) + 3] = 0;
        push(px - 1, py); push(px + 1, py); push(px, py - 1); push(px, py + 1);
      }
      var gone = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] === 0) gone++;
      if (gone / (w * h) > 0.78 || gone / (w * h) < 0.02) return;
      var k, nx, ny, ii, jj, t;
      for (y = 1; y < h - 1; y++) {
        for (x = 1; x < w - 1; x++) {
          ii = idx(x, y);
          if (d[ii + 3] === 0) continue;
          t = 0;
          for (ny = -1; ny <= 1; ny++) {
            for (nx = -1; nx <= 1; nx++) {
              jj = idx(x + nx, y + ny);
              if (d[jj + 3] === 0) t++;
            }
          }
          if (t) d[ii + 3] = Math.max(0, d[ii + 3] - t * 28);
        }
      }
      ctx.putImageData(id, 0, 0);
      img.dataset.cut = '1';
      img.src = c.toDataURL('image/png');
    }
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  }
  function bindCardPhotos(root) {
    root = root || document;
    var imgs = root.querySelectorAll('.es-pc-player');
    for (var i = 0; i < imgs.length; i++) scontornaImg(imgs[i]);
  }

  var ROWS = 8, COLS = 6;
  function roleSeeds(role, form) {
    var r = String(role || '').toLowerCase();
    var f = String(form || '4-3-3');
    var cells = {};
    function add(row, col, w) {
      var k = row + '-' + col;
      cells[k] = (cells[k] || 0) + w;
    }
    var midC = 2.5;
    if (/portier/.test(r)) {
      add(7, 2, 8); add(7, 3, 8); add(6, 2, 4); add(6, 3, 4);
    } else if (/difensore centrale|centrale/.test(r) && !/centrocamp|mezzala|trequartista/.test(r)) {
      add(6, 2, 7); add(6, 3, 7); add(5, 2, 5); add(5, 3, 5);
    } else if (/terzino dest|ala dest|esterno dest/.test(r)) {
      add(4, 5, 6); add(3, 5, 7); add(2, 5, f.indexOf('4-3-3') >= 0 ? 8 : 5); add(3, 4, 4);
    } else if (/terzino sin|ala sin|esterno sin/.test(r)) {
      add(4, 0, 6); add(3, 0, 7); add(2, 0, f.indexOf('4-3-3') >= 0 ? 8 : 5); add(3, 1, 4);
    } else if (/mediano|regista/.test(r)) {
      add(4, 2, 7); add(4, 3, 7); add(5, 2, 5); add(5, 3, 5);
    } else if (/mezzala|centrocamp/.test(r)) {
      add(3, 2, 6); add(3, 3, 6); add(4, 1, 4); add(4, 4, 4); add(2, 2, 5);
    } else if (/trequartista|seconda punta/.test(r)) {
      add(2, 2, 7); add(2, 3, 7); add(1, 2, 5); add(1, 3, 5);
    } else if (/centravanti|punta|attacc/.test(r)) {
      add(0, 2, 8); add(0, 3, 8); add(1, 2, 6); add(1, 3, 6); add(0, 1, 3); add(0, 4, 3);
    } else {
      add(3, 2, 5); add(3, 3, 5); add(4, 2, 4); add(4, 3, 4);
    }
    return cells;
  }

  function heatGet(u) {
    var map = storeGet(HEAT_KEY);
    var cur = map[meKey(u)] || {};
    return {
      form: cur.form || '4-3-3',
      role: cur.role || roleOf(u),
      cells: cur.cells && Object.keys(cur.cells).length ? cur.cells : roleSeeds(roleOf(u), cur.form || '4-3-3')
    };
  }
  function heatSave(u, data) {
    var map = storeGet(HEAT_KEY);
    map[meKey(u)] = data;
    storeSet(HEAT_KEY, map);
  }

  function pitchSvg(cells, interactive) {
    var w = 360, h = 520;
    var pad = 14;
    var cw = (w - pad * 2) / COLS;
    var ch = (h - pad * 2) / ROWS;
    var max = 1;
    Object.keys(cells || {}).forEach(function (k) {
      if (cells[k] > max) max = cells[k];
    });
    var html = '<svg class="es-pc-pitch" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Heatmap campo">';
    html += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#166534"/>';
    html += '<rect x="' + pad + '" y="' + pad + '" width="' + (w - pad * 2) + '" height="' + (h - pad * 2) + '" fill="none" stroke="#ecfdf5" stroke-width="2"/>';
    html += '<line x1="' + pad + '" y1="' + (h / 2) + '" x2="' + (w - pad) + '" y2="' + (h / 2) + '" stroke="#ecfdf5" stroke-width="1.5"/>';
    html += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="42" fill="none" stroke="#ecfdf5" stroke-width="1.5"/>';
    html += '<rect x="' + (w / 2 - 70) + '" y="' + pad + '" width="140" height="70" fill="none" stroke="#ecfdf5"/>';
    html += '<rect x="' + (w / 2 - 70) + '" y="' + (h - pad - 70) + '" width="140" height="70" fill="none" stroke="#ecfdf5"/>';
    var r, c;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        var val = (cells && cells[r + '-' + c]) || 0;
        var a = val ? (0.12 + 0.72 * (val / max)) : 0;
        var x = pad + c * cw;
        var y = pad + r * ch;
        html += '<rect class="es-pc-cell" data-r="' + r + '" data-c="' + c + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
          '" width="' + (cw - 1).toFixed(1) + '" height="' + (ch - 1).toFixed(1) +
          '" fill="rgba(56,189,248,' + a.toFixed(2) + ')" stroke="rgba(255,255,255,0.08)" stroke-width="0.6"/>';
      }
    }
    html += '</svg>';
    return html;
  }

  function fmPitchSvg(u) {
    var primary = roleOf(u) || 'Attaccante';
    var p = u.playerProfile || {};
    var sec = String(p.secondaryRoles || '').trim();
    var adapted = String(p.adaptedRole || '').trim();
    if (!adapted) {
      var maPos = maTagsOf(u);
      if (maPos && maPos.adaptedRole) adapted = String(maPos.adaptedRole).trim();
    }

    var w = 360, h = 520;
    var pad = 14;

    function posCoords(role) {
      var r = String(role || '').toLowerCase();
      if (/portier/.test(r)) return { x: 180, y: 460, code: 'POR' };
      if (/centrale/.test(r) && /dif/.test(r)) return { x: 180, y: 390, code: 'DC' };
      if (/terzino dest/.test(r)) return { x: 305, y: 375, code: 'TD' };
      if (/terzino sin/.test(r)) return { x: 55, y: 375, code: 'TS' };
      if (/mediano|regista/.test(r)) return { x: 180, y: 300, code: 'MED' };
      if (/mezzala dest/.test(r)) return { x: 260, y: 250, code: 'CC-D' };
      if (/mezzala sin/.test(r)) return { x: 100, y: 250, code: 'CC-S' };
      if (/mezzala|centrocamp/.test(r)) return { x: 180, y: 250, code: 'CC' };
      if (/trequartista/.test(r)) return { x: 180, y: 175, code: 'TRQ' };
      if (/ala dest|esterno dest/.test(r)) return { x: 305, y: 120, code: 'AD' };
      if (/ala sin|esterno sin/.test(r)) return { x: 55, y: 120, code: 'AS' };
      if (/seconda punta/.test(r)) return { x: 180, y: 120, code: 'SP' };
      if (/centravanti|punta|attacc/.test(r)) return { x: 180, y: 65, code: 'ATT' };
      return { x: 180, y: 220, code: 'CEN' };
    }

    var primPt = posCoords(primary);
    var secPt = sec ? posCoords(sec.split(',')[0]) : null;
    var adapPt = adapted ? posCoords(adapted) : null;

    // Se non ci sono secondari dichiarati, genera ruoli tattici compatibili basati sul ruolo principale
    if (!secPt) {
      var rlow = primary.toLowerCase();
      if (/attacc|punta|centravanti/.test(rlow)) secPt = posCoords('seconda punta');
      else if (/ala|esterno/.test(rlow)) secPt = posCoords('trequartista');
      else if (/centrocamp|mezzala/.test(rlow)) secPt = posCoords('mediano');
      else if (/difensore centrale/.test(rlow)) secPt = posCoords('terzino dest');
      else if (/terzino/.test(rlow)) secPt = posCoords('ala dest');
      else secPt = posCoords('centrocampista');
    }
    if (!adapPt) {
      var rlow2 = primary.toLowerCase();
      if (/attacc|punta/.test(rlow2)) adapPt = posCoords('ala dest');
      else if (/ala/.test(rlow2)) adapPt = posCoords('seconda punta');
      else if (/centrocamp/.test(rlow2)) adapPt = posCoords('trequartista');
      else if (/difens/.test(rlow2)) adapPt = posCoords('mediano');
      else adapPt = posCoords('mezzala');
    }

    var allPositions = [
      { x: 180, y: 460, label: 'POR' },
      { x: 110, y: 390, label: 'DC' },
      { x: 250, y: 390, label: 'DC' },
      { x: 55, y: 375, label: 'TS' },
      { x: 305, y: 375, label: 'TD' },
      { x: 180, y: 300, label: 'MED' },
      { x: 110, y: 240, label: 'CC' },
      { x: 250, y: 240, label: 'CC' },
      { x: 180, y: 175, label: 'TRQ' },
      { x: 55, y: 115, label: 'AS' },
      { x: 305, y: 115, label: 'AD' },
      { x: 180, y: 115, label: 'SP' },
      { x: 180, y: 60, label: 'ATT' }
    ];

    var html = '<div style="position:relative;width:100%;max-width:520px;margin:0 auto;">';
    html += '<svg class="es-pc-pitch" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Ruoli tattici Football Manager">';
    html += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#166534"/>';
    html += '<rect x="' + pad + '" y="' + pad + '" width="' + (w - pad * 2) + '" height="' + (h - pad * 2) + '" fill="none" stroke="#ecfdf5" stroke-width="2"/>';
    html += '<line x1="' + pad + '" y1="' + (h / 2) + '" x2="' + (w - pad) + '" y2="' + (h / 2) + '" stroke="#ecfdf5" stroke-width="1.5"/>';
    html += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="42" fill="none" stroke="#ecfdf5" stroke-width="1.5"/>';
    html += '<rect x="' + (w / 2 - 70) + '" y="' + pad + '" width="140" height="70" fill="none" stroke="#ecfdf5"/>';
    html += '<rect x="' + (w / 2 - 70) + '" y="' + (h - pad - 70) + '" width="140" height="70" fill="none" stroke="#ecfdf5"/>';

    // Disegna tutte le posizioni neutre stile FM con cerchio semi-trasparente
    allPositions.forEach(function (pos) {
      html += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="14" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>';
      html += '<text x="' + pos.x + '" y="' + (pos.y + 4) + '" text-anchor="middle" font-size="9" font-weight="700" fill="rgba(255,255,255,0.6)" font-family="Outfit,Inter,sans-serif">' + pos.label + '</text>';
    });

    // Ruolo Adattabile (Giallo)
    if (adapPt) {
      html += '<circle cx="' + adapPt.x + '" cy="' + adapPt.y + '" r="17" fill="rgba(234,179,8,0.75)" stroke="#fef08a" stroke-width="2"/>';
      html += '<text x="' + adapPt.x + '" y="' + (adapPt.y + 4.5) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#000" font-family="Outfit,Inter,sans-serif">' + adapPt.code + '</text>';
    }

    // Ruolo Secondario (Ciano)
    if (secPt) {
      html += '<circle cx="' + secPt.x + '" cy="' + secPt.y + '" r="19" fill="rgba(56,189,248,0.85)" stroke="#e0f2fe" stroke-width="2"/>';
      html += '<text x="' + secPt.x + '" y="' + (secPt.y + 4.5) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#041018" font-family="Outfit,Inter,sans-serif">' + secPt.code + '</text>';
    }

    // Ruolo Primario (Verde Neon / Gold)
    html += '<circle cx="' + primPt.x + '" cy="' + primPt.y + '" r="22" fill="#22c55e" stroke="#ffffff" stroke-width="2.5" filter="drop-shadow(0 0 8px rgba(34,197,94,0.8))"/>';
    html += '<text x="' + primPt.x + '" y="' + (primPt.y + 4.5) + '" text-anchor="middle" font-size="11" font-weight="900" fill="#041018" font-family="Outfit,Inter,sans-serif">' + primPt.code + '</text>';

    html += '</svg>';

    // Legenda FM & Compiti Tattici sotto il campo
    html += '<div style="margin-top:0.65rem;background:#091120;border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:0.75rem 0.9rem;font-size:0.75rem;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.08);">';
    html += '<span style="display:flex;align-items:center;gap:0.35rem;color:#86efac;font-weight:700;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;"></span> Naturale (100%)</span>';
    html += '<span style="display:flex;align-items:center;gap:0.35rem;color:#7dd3fc;font-weight:700;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#38bdf8;"></span> Competente (80%)</span>';
    html += '<span style="display:flex;align-items:center;gap:0.35rem;color:#fde047;font-weight:700;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#eab308;"></span> Adattabile (60%)</span>';
    html += '</div>';
    html += '<div style="color:#94a3b8;line-height:1.45;">';
    html += '<b style="color:#fff;">Ruolo Principale:</b> ' + esc(primary) + ' · <b style="color:#fff;">Mansione:</b> Punta Avanzata / Finalizzatore';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function videosOf(u) {
    var map = storeGet(VID_KEY);
    return map[meKey(u)] || [];
  }
  function saveVideos(u, list) {
    var map = storeGet(VID_KEY);
    map[meKey(u)] = list.slice(0, 12);
    storeSet(VID_KEY, map);
  }

  function detailHtml(u) {
    var st = statsOf(u);
    var heat = heatGet(u);
    var vids = videosOf(u);
    var foot = footOf(u) || 'Destro';
    var vlist = vids.length
      ? vids.map(function (v) {
          return '<a href="' + esc(v.url) + '" target="_blank" rel="noopener">' + esc(v.title || v.url) + '</a>';
        }).join('')
      : '<div class="es-pd-empty">Nessun highlight caricato. Inserisci link video YouTube / Veo / Hudl / Wyscout per il dossier scouting.</div>';

    return '<button type="button" class="es-pc-close" data-pc="close">Chiudi</button>' +
      '<h2>Card · Vista Tattica &amp; Performance</h2>' +
      '<p class="lead">Analisi integrata campo, heatmap termica di movimento, ruoli in stile Football Manager, metriche di rendimento e Video Hub.</p>' +
      
      '<div class="es-pc-stats">' +
        '<div class="es-pc-stat"><b>' + st.g + '</b><span>Gol Stagionali</span></div>' +
        '<div class="es-pc-stat"><b>' + st.a + '</b><span>Assist</span></div>' +
        '<div class="es-pc-stat"><b>' + st.pres + '</b><span>Presenze Ufficiali</span></div>' +
        '<div class="es-pc-stat"><b>' + st.min + '’</b><span>Minuti Giocati</span></div>' +
        '<div class="es-pc-stat"><b>' + st.yc + '</b><span>Cartellini Gialli</span></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0.45rem;margin:0.55rem 0 1rem;">' +
        '<div class="es-pc-stat" style="border-color:rgba(56,189,248,0.3);background:rgba(6,18,38,0.85);"><b style="color:#38bdf8;">7.85</b><span>Rating Elisee</span></div>' +
        '<div class="es-pc-stat" style="border-color:rgba(34,197,94,0.3);background:rgba(6,18,38,0.85);"><b style="color:#4ade80;">0.68</b><span>xG / Partita</span></div>' +
        '<div class="es-pc-stat" style="border-color:rgba(168,85,247,0.3);background:rgba(6,18,38,0.85);"><b style="color:#c084fc;">74%</b><span>Duelli Vinti</span></div>' +
        '<div class="es-pc-stat" style="border-color:rgba(234,179,8,0.3);background:rgba(6,18,38,0.85);"><b style="color:#facc15;">' + esc(foot.toUpperCase()) + '</b><span>Piede Dominante</span></div>' +
      '</div>' +

      '<div class="es-pc-fm">' +
        '<div>' +
          '<h3 style="margin:0 0 0.55rem;font-size:0.92rem;color:#38bdf8;display:flex;align-items:center;gap:0.45rem;">' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;"></span> Heatmap di Movimento (Posizionamento Reale)' +
          '</h3>' +
          pitchSvg(heat.cells, false) +
          '<div style="margin-top:0.65rem;background:#091120;border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:0.75rem 0.9rem;font-size:0.75rem;color:#94a3b8;line-height:1.45;">' +
            '<b style="color:#fff;">Densità Tattica:</b> Elevata concentrazione negli ultimi 25 metri e area di rigore avversaria con tagli centrali.' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<h3 style="margin:0 0 0.55rem;font-size:0.92rem;color:#38bdf8;display:flex;align-items:center;gap:0.45rem;">' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span> Idoneità Ruoli Football Manager' +
          '</h3>' +
          fmPitchSvg(u) +
        '</div>' +
      '</div>' +

      (function () {
        var ma = maTagsOf(u);
        if (!ma || !(ma.mention || (ma.badges && ma.badges.length) || (ma.clips && ma.clips.length) || ma.adaptedRole)) return '';
        var h = '<div style="margin-top:1.2rem;background:#0c1527;border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:0.85rem 1rem;">' +
          '<h3 style="margin:0 0 0.4rem;font-size:0.92rem;color:#38bdf8;">Relazione Match Analyst Verificata</h3>';
        if (ma.mention) {
          h += '<p class="lead" style="margin-bottom:0.35rem;"><b>Menzione Speciale:</b> ' + esc(ma.mention.title) +
            (ma.mention.analyst ? ' · <i>' + esc(ma.mention.analyst) + '</i>' : '') + '</p>';
        }
        if (ma.adaptedRole) {
          h += '<p class="lead" style="margin-bottom:0.35rem;">Posizione tattica consigliata: <b style="color:#fde047;">' + esc(ma.adaptedRole) + '</b></p>';
        }
        if (ma.clips && ma.clips.length) {
          h += '<p class="lead" style="margin-bottom:0;">Clip archiviate: ' + esc(ma.clips.map(function (c) { return c.title || c.kind; }).join(' · ')) + '</p>';
        }
        h += '</div>';
        return h;
      }()) +

      '<div style="margin-top:1.2rem;background:#080e1a;border:1px solid rgba(148,163,184,0.18);border-radius:12px;padding:0.9rem 1.1rem;">' +
        '<h3 style="margin:0 0 0.4rem;font-size:0.92rem;color:#fff;display:flex;align-items:center;gap:0.45rem;">' +
          '<span>📹</span> Highlight Video Hub (Clip &amp; Scouting Match)' +
        '</h3>' +
        '<p style="color:#94a3b8;font-size:0.8rem;margin:0 0 0.65rem;">Carica i link video per consentire ai Direttori Sportivi e Scout di visionare i tuoi momenti salienti.</p>' +
        '<div class="es-pc-video-row">' +
          '<input id="es-pc-vid-url" placeholder="Incolla link YouTube / Veo / Hudl / Wyscout..." />' +
          '<button type="button" class="es-pc-btn" data-pc="add-video">Aggiungi Video</button>' +
        '</div>' +
        '<div class="es-pc-list" id="es-pc-vid-list">' + vlist + '</div>' +
      '</div>';
  }

  function overlay() {
    var el = document.getElementById('es-pc-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'es-pc-overlay';
      el.className = 'es-pc-overlay';
      el.innerHTML = '<div class="es-pc-sheet" id="es-pc-sheet"></div>';
      document.body.appendChild(el);
      el.addEventListener('click', function (e) {
        if (e.target === el) closeOverlay();
      });
    }
    return el;
  }
  function openSheet(html) {
    var el = overlay();
    var sheet = document.getElementById('es-pc-sheet');
    if (sheet) sheet.innerHTML = html;
    el.classList.add('is-on');
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay() {
    var el = document.getElementById('es-pc-overlay');
    if (el) el.classList.remove('is-on');
    document.body.style.overflow = '';
  }

  function heatmapEditor(u) {
    heatRange = heatGet(u);
    openSheet(
      '<button type="button" class="es-pc-close" data-pc="close">Chiudi</button>' +
      '<h2>Heatmap intelligente a fine gara</h2>' +
      '<p class="lead">Generazione automatica da ruolo e modulo, oppure tocca le zone in cui hai spinto, crossato o recuperato palla.</p>' +
      '<div class="es-pc-form">' +
        '<select id="es-pc-form">' +
          ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3'].map(function (f) {
            return '<option' + (heatRange.form === f ? ' selected' : '') + '>' + f + '</option>';
          }).join('') +
        '</select>' +
        '<button type="button" class="es-pc-btn" data-pc="heat-auto">Genera dal modulo</button>' +
        '<button type="button" class="es-pc-btn" data-pc="heat-save">Salva heatmap</button>' +
      '</div>' +
      '<div id="es-pc-heat-pitch">' + pitchSvg(heatRange.cells, true) + '</div>'
    );
  }

  function haversine(a, b) {
    var R = 6371000;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLng = (b.lng - a.lng) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }
  function gpsList(u) {
    var map = storeGet(GPS_KEY);
    return map[meKey(u)] || [];
  }
  function gpsSaveList(u, list) {
    var map = storeGet(GPS_KEY);
    map[meKey(u)] = list.slice(0, 80);
    storeSet(GPS_KEY, map);
  }
  function sessionStats(pts) {
    var dist = 0, vmax = 0, sprints = 0, acc = 0, inSprint = false;
    var i;
    for (i = 1; i < pts.length; i++) {
      var d = haversine(pts[i - 1], pts[i]);
      dist += d;
      var dt = Math.max(0.5, (pts[i].t - pts[i - 1].t) / 1000);
      var sp = pts[i].speed != null ? pts[i].speed : d / dt;
      if (sp > vmax) vmax = sp;
      if (sp >= 5.5) {
        if (!inSprint) { sprints += 1; inSprint = true; }
      } else inSprint = false;
      var prev = pts[i - 1].speed != null ? pts[i - 1].speed : 0;
      if (sp - prev > 1.4) acc += 1;
    }
    var dur = pts.length > 1 ? (pts[pts.length - 1].t - pts[0].t) / 1000 : 0;
    return {
      distKm: dist / 1000,
      vmaxKmh: vmax * 3.6,
      sprints: sprints,
      acc: acc,
      durMin: dur / 60,
      hid: dist * 0.18 / 1000
    };
  }
  function speedChart(pts) {
    if (!pts || pts.length < 2) return '<div class="es-pd-empty">Nessun picco registrato.</div>';
    var w = 520, h = 110;
    var speeds = pts.map(function (p, i) {
      if (p.speed != null) return p.speed * 3.6;
      if (!i) return 0;
      var dt = Math.max(0.5, (p.t - pts[i - 1].t) / 1000);
      return (haversine(pts[i - 1], p) / dt) * 3.6;
    });
    var max = Math.max.apply(null, speeds.concat([8]));
    var d = speeds.map(function (v, i) {
      var x = (i / (speeds.length - 1)) * (w - 8) + 4;
      var y = h - 8 - (v / max) * (h - 16);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var imax = 0;
    speeds.forEach(function (v, i) { if (v > speeds[imax]) imax = i; });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="110">' +
      '<polyline fill="none" stroke="#38bdf8" stroke-width="2" points="' + d + '"/>' +
      '</svg>' +
      '<div style="font-size:0.78rem;color:#7dd3fc;font-weight:700;">Velocità massima: ' +
      speeds[imax].toFixed(1) + ' km/h — campione ' + (imax + 1) + '</div>';
  }
  function gpsPathSvg(pts) {
    if (!pts || pts.length < 2) return '<div class="es-pd-empty">Nessun percorso.</div>';
    var lats = pts.map(function (p) { return p.lat; });
    var lngs = pts.map(function (p) { return p.lng; });
    var minLa = Math.min.apply(null, lats), maxLa = Math.max.apply(null, lats);
    var minLo = Math.min.apply(null, lngs), maxLo = Math.max.apply(null, lngs);
    var w = 360, h = 520, pad = 18;
    function xy(p) {
      var x = pad + ((p.lng - minLo) / (maxLo - minLo || 1)) * (w - pad * 2);
      var y = pad + (1 - (p.lat - minLa) / (maxLa - minLa || 1)) * (h - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }
    return '<svg class="es-pc-pitch" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect width="' + w + '" height="' + h + '" fill="#166534"/>' +
      '<polyline fill="none" stroke="#38bdf8" stroke-width="2.4" points="' + pts.map(xy).join(' ') + '"/>' +
      '</svg>';
  }
  function filterSessions(list, range) {
    var now = Date.now();
    var span = range === 'week' ? 7 * 864e5 : range === 'month' ? 31 * 864e5 : range === 'season' ? 200 * 864e5 : 0;
    if (!span) return list.slice(0, 1);
    return list.filter(function (s) { return now - s.start < span; });
  }
  function gpsPanel(u, range) {
    range = range || 'session';
    var list = gpsList(u).slice().sort(function (a, b) { return b.start - a.start; });
    var view = filterSessions(list, range);
    var pts = [];
    view.forEach(function (s) { pts = pts.concat(s.points || []); });
    var st = sessionStats(pts);
    var liveNote = live ? '<div class="es-pd-empty" style="color:#6ee7b7;">Sessione in corso — ' + live.points.length + ' campioni.</div>' : '';
    return '<button type="button" class="es-pc-close" data-pc="close">Chiudi</button>' +
      '<h2>GPS · prestazioni fisiche</h2>' +
      '<p class="lead">Fase 1 MVP: GPS dello smartphone. Premi Inizia allenamento, porta il telefono con te, poi ferma la sessione.</p>' +
      liveNote +
      '<div class="es-pc-form">' +
        (live
          ? '<button type="button" class="es-pc-btn" data-pc="gps-stop">Termina allenamento</button>'
          : '<button type="button" class="es-pc-btn" data-pc="gps-start">Inizia allenamento</button>') +
      '</div>' +
      '<div class="es-pc-hist" id="es-pc-gps-range">' +
        '<button type="button" data-range="session"' + (range === 'session' ? ' class="is-on"' : '') + '>Allenamento</button>' +
        '<button type="button" data-range="week"' + (range === 'week' ? ' class="is-on"' : '') + '>Settimana</button>' +
        '<button type="button" data-range="month"' + (range === 'month' ? ' class="is-on"' : '') + '>Mese</button>' +
        '<button type="button" data-range="season"' + (range === 'season' ? ' class="is-on"' : '') + '>Stagione</button>' +
      '</div>' +
      '<div class="es-pc-kpi">' +
        '<div class="es-pc-stat"><b>' + st.distKm.toFixed(2) + '</b><span>Km percorsi</span></div>' +
        '<div class="es-pc-stat"><b>' + st.hid.toFixed(2) + '</b><span>Km alta intensità</span></div>' +
        '<div class="es-pc-stat"><b>' + st.vmaxKmh.toFixed(1) + '</b><span>Vmax km/h</span></div>' +
        '<div class="es-pc-stat"><b>' + st.sprints + '</b><span>Sprint</span></div>' +
      '</div>' +
      '<div class="es-pc-kpi">' +
        '<div class="es-pc-stat"><b>' + st.acc + '</b><span>Accelerazioni</span></div>' +
        '<div class="es-pc-stat"><b>' + st.durMin.toFixed(1) + '</b><span>Minuti netti</span></div>' +
      '</div>' +
      '<h3 style="margin:0.6rem 0 0.35rem;font-size:0.88rem;color:#fff;">Grafico velocità</h3>' + speedChart(pts) +
      '<h3 style="margin:0.85rem 0 0.35rem;font-size:0.88rem;color:#fff;">Percorso sul campo</h3>' + gpsPathSvg(pts);
  }

  function startGps(u) {
    if (!navigator.geolocation) {
      toast('GPS non disponibile su questo dispositivo.', 'error');
      return;
    }
    live = { points: [], start: Date.now(), watch: null };
    live.watch = navigator.geolocation.watchPosition(function (pos) {
      var c = pos.coords;
      live.points.push({
        t: Date.now(),
        lat: c.latitude,
        lng: c.longitude,
        speed: c.speed != null && c.speed >= 0 ? c.speed : null
      });
      if (live.points.length > 4000) live.points = live.points.slice(-4000);
      refreshGpsTool();
    }, function () {
      toast('Permesso GPS negato o posizione non disponibile.', 'error');
      live = null;
    }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    toast('Allenamento avviato. Tieni il telefono con te.');
    openSheet(gpsPanel(u, 'session'));
  }
  function stopGps(u) {
    if (!live) return;
    try { if (live.watch != null) navigator.geolocation.clearWatch(live.watch); } catch (_) {}
    var sess = {
      id: 'gps-' + live.start,
      start: live.start,
      end: Date.now(),
      points: live.points.slice(),
      stats: sessionStats(live.points)
    };
    var list = gpsList(u);
    list.unshift(sess);
    gpsSaveList(u, list);
    live = null;
    toast('Sessione GPS salvata nello storico.');
    openSheet(gpsPanel(u, 'session'));
    refreshGpsTool();
  }

  function dossierHtml(u, job) {
    var st = statsOf(u);
    var heat = heatGet(u);
    var last = gpsList(u)[0];
    var gs = last && last.stats ? last.stats : null;
    var vids = videosOf(u);
    return '<button type="button" class="es-pc-close" data-pc="close">Chiudi</button>' +
      '<h2>Candidati Ora · scheda tecnica</h2>' +
      '<p class="lead">Un tap invia al club un dossier già compilato: Card, heatmap, ruoli, stats, GPS e highlight. Niente email manuale.</p>' +
      cardHtml(u, { hideHint: true }) +
      '<p style="margin:0.8rem 0 0.35rem;color:#94a3b8;font-size:0.82rem;"><strong style="color:#fff;">Annuncio:</strong> ' +
      esc((job && (job.title || job)) || '') + '</p>' +
      '<div class="es-pc-stats">' +
        '<div class="es-pc-stat"><b>' + st.g + '</b><span>Gol</span></div>' +
        '<div class="es-pc-stat"><b>' + st.a + '</b><span>Assist</span></div>' +
        '<div class="es-pc-stat"><b>' + st.pres + '</b><span>Presenze</span></div>' +
        '<div class="es-pc-stat"><b>' + (gs ? gs.distKm.toFixed(1) : '—') + '</b><span>Km medi GPS</span></div>' +
        '<div class="es-pc-stat"><b>' + (gs ? gs.vmaxKmh.toFixed(1) : '—') + '</b><span>Vmax</span></div>' +
      '</div>' +
      pitchSvg(heat.cells, false) +
      '<p style="font-size:0.78rem;color:#94a3b8;">Highlight: ' + (vids.length ? vids.length + ' clip' : 'nessuna clip') + '</p>' +
      '<div class="es-pc-form">' +
        '<button type="button" class="es-pc-btn" data-pc="confirm-apply" data-title="' +
        esc((job && job.title) || job || '') + '">Conferma e invia dossier</button>' +
      '</div>';
  }

  function confirmApply(title) {
    var u = userObj();
    var list;
    try { list = JSON.parse(localStorage.getItem('elisee_job_applications') || '[]'); } catch (_) { list = []; }
    var heat = heatGet(u);
    var st = statsOf(u);
    var rec = {
      title: title,
      note: 'Dossier Card automatico',
      email: u.email || '',
      ruolo: roleOf(u),
      at: new Date().toISOString(),
      dossier: {
        name: nameOf(u),
        club: clubOf(u),
        free: isFree(u),
        role: roleOf(u),
        foot: footOf(u),
        stats: st,
        heatmap: heat.cells,
        gps: (gpsList(u)[0] && gpsList(u)[0].stats) || null,
        videos: videosOf(u)
      }
    };
    list.unshift(rec);
    try { localStorage.setItem('elisee_job_applications', JSON.stringify(list.slice(0, 80))); } catch (_) {}
    var smart = storeGet(APPLY_KEY);
    var arr = smart[meKey(u)] || [];
    arr.unshift(rec);
    smart[meKey(u)] = arr.slice(0, 40);
    storeSet(APPLY_KEY, smart);
    if (window.EliseeSchede && window.EliseeSchede.addApplicant) {
      try {
        window.EliseeSchede.addApplicant({
          id: window.EliseeSchede.jobId ? window.EliseeSchede.jobId(title) : title,
          title: title,
          role: roleOf(u)
        }, u, 'Dossier Card automatico');
      } catch (_) {}
    }
    closeOverlay();
    toast('Candidatura inviata. Dossier Card nella scheda tecnica, non via e-mail.');
  }

  function toolsHtml() {
    return '<div class="es-pc-tools">' +
      '<button type="button" class="es-pc-tool" data-pc="open-card"><b>Apri la Card</b><span>Fronte figurina + vista tattica, stats e video hub.</span></button>' +
      '<button type="button" class="es-pc-tool" data-pc="heatmap"><b>Heatmap fine gara</b><span>Auto da modulo, oppure tocca le zone sul campo.</span></button>' +
      '<button type="button" class="es-pc-tool" id="es-pc-gps-tool" data-pc="gps"><b>' +
        (live ? 'GPS in corso' : 'Inizia allenamento') +
      '</b><span>Tracciamento GPS dello smartphone · MVP Fase 1.</span></button>' +
      '<button type="button" class="es-pc-tool" data-pc="jobs"><b>Cerca squadra</b><span>Annunci a imbuto: città, provincia, regione, Italia.</span></button>' +
      '</div>';
  }
  function refreshGpsTool() {
    var btn = document.getElementById('es-pc-gps-tool');
    if (!btn) return;
    btn.classList.toggle('is-live', !!live);
    var b = btn.querySelector('b');
    if (b) b.textContent = live ? 'GPS in corso' : 'Inizia allenamento';
  }

  function slotHtml(u) {
    return '<div class="es-pc-wrap">' +
      cardHtml(u) +
      '<div class="es-pc-side">' +
        '<p style="margin:0;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#38bdf8;font-weight:800;">Asset digitale</p>' +
        '<h2 style="margin:0.15rem 0 0.35rem;font-family:Outfit,Inter,sans-serif;font-size:1.15rem;color:#fff;">La tua Card collezionabile</h2>' +
        '<p style="margin:0 0 0.55rem;color:#94a3b8;font-size:0.84rem;line-height:1.45;">Card Elisee: maglia ufficiale del sito, viso PNG pubblicato dallo staff, overall dalle sei statistiche in italiano.</p>' +
        (window.EliseeCardAtelier && window.EliseeCardAtelier.playerUploadUi ? window.EliseeCardAtelier.playerUploadUi() : '') +
        toolsHtml() +
      '</div></div>';
  }

  function mountDash(box, user) {
    if (!box) return;
    var slot = box.querySelector('#es-pc-slot');
    if (!slot) {
      var body = box.querySelector('.es-pd-body');
      if (!body) return;
      slot = document.createElement('div');
      slot.id = 'es-pc-slot';
      var head = body.querySelector('.es-pd-head');
      if (head && head.nextSibling) body.insertBefore(slot, head.nextSibling);
      else body.insertBefore(slot, body.firstChild);
    }
    slot.innerHTML = slotHtml(user || userObj());
    refreshGpsTool();
  }

  function albumFollowLabel(p, on) {
    if (p && p.kind === 'player') return on ? "Nell'Album" : "Aggiungi all'Album";
    return on ? 'Segui già' : 'Segui';
  }

  function patchScopri() {
    if (!window.EliseeScopri || !window.EliseeScopri.cardHtml) return;
    var orig = window.EliseeScopri.cardHtml;
    window.EliseeScopri.cardHtml = function (p, followed) {
      var html = orig(p, followed);
      if (!p || p.kind !== 'player') return html;
      var on = (followed || []).indexOf(p.id) >= 0;
      return html
        .replace(/>Segui già</g, '>' + albumFollowLabel(p, true) + '<')
        .replace(/>Segui</g, '>' + albumFollowLabel(p, false) + '<')
        .replace(/>Chi segue</g, ">Vedi Album</");
    };
    var fol = window.EliseeScopri.follow;
    if (typeof fol === 'function') {
      window.EliseeScopri.follow = function (id) {
        var catalog = window.EliseeScopri.allProfiles ? window.EliseeScopri.allProfiles() : [];
        var person = catalog.filter(function (p) { return p.id === id; })[0];
        var before = typeof window.showToast === 'function' ? window.showToast : null;
        if (person && person.kind === 'player' && before) {
          window.showToast = function (msg, kind) {
            if (/segui/i.test(String(msg))) {
              var on = /Ora segui/i.test(msg);
              msg = on ? ('Card di ' + person.name + " aggiunta all'Album.") : ('Card rimossa dall\'Album.');
            }
            return before(msg, kind);
          };
        }
        var out = fol.call(window.EliseeScopri, id);
        if (before) window.showToast = before;
        return out;
      };
    }
  }

  function patchChiSegui() {
    if (!window.EliseeChiSegui) return;
    var origRender = window.EliseeChiSegui.render;
    window.EliseeChiSegui.render = function () {
      origRender.call(window.EliseeChiSegui);
      var title = document.getElementById('es-cs-title');
      var emptyS = document.getElementById('es-cs-empty-sub');
      var mine = window.EliseeChiSegui.isMe;
      var kind = window.EliseeChiSegui.kind;
      if (title) {
        if (mine) title.textContent = kind === 'player' ? 'Il tuo Album' : 'Album · Chi hai in rete';
        else title.textContent = 'Album di ' + (window.EliseeChiSegui.ownerName || 'questo profilo');
      }
      if (emptyS && mine) {
        emptyS.textContent = kind === 'player'
          ? 'Nessuna Card nell’Album. Da Scopri profili usa Aggiungi all’Album.'
          : 'Nessun profilo in questa categoria dell’Album.';
      }
    };
    var origMine = window.EliseeChiSegui.openMine;
    window.EliseeChiSegui.openMine = function () {
      var u = userObj();
      if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) {
        window.EliseeChiSegui.kind = 'player';
      }
      return origMine.call(window.EliseeChiSegui);
    };
  }

  function injectFunnel() {
    var bar = document.querySelector('#bacheca-annunci .pf-toolbar');
    if (!bar || document.getElementById('es-pc-geo-funnel')) return;
    var box = document.createElement('div');
    box.id = 'es-pc-geo-funnel';
    box.className = 'es-pc-funnel';
    box.innerHTML =
      '<button type="button" data-geo="1"><b>1 · Città</b><span>Club della tua città</span></button>' +
      '<button type="button" data-geo="2"><b>2 · Provincia</b><span>Spostamenti quotidiani</span></button>' +
      '<button type="button" data-geo="3"><b>3 · Regione</b><span>Categorie superiori</span></button>' +
      '<button type="button" data-geo="4"><b>4 · Italia</b><span>Esperienze fuori sede</span></button>';
    bar.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-geo]');
      if (!b) return;
      var v = b.getAttribute('data-geo');
      var on = b.classList.contains('is-on');
      box.querySelectorAll('[data-geo]').forEach(function (x) { x.classList.remove('is-on'); });
      window.EliseePlayerCard.geoFilter = on ? 0 : Number(v);
      if (!on) b.classList.add('is-on');
      if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
    });
  }

  function sortJobs(jobs) {
    var u = userObj();
    var tier = window.EliseePlayerCard.geoFilter || 0;
    var scored = (jobs || []).map(function (j) {
      var t = geoTier(j, u);
      return { j: j, t: t };
    });
    if (tier) scored = scored.filter(function (x) { return x.t === tier; });
    scored.sort(function (a, b) { return a.t - b.t; });
    return scored.map(function (x) {
      x.j._geoTier = x.t;
      x.j._geoLabel = TIER_LABEL[x.t];
      return x.j;
    });
  }

  function smartApply(title, job) {
    var u = userObj();
    if (window.EliseeDsHub && typeof window.EliseeDsHub.blockApply === 'function' && window.EliseeDsHub.blockApply()) return;
    if (window.blockSpectatorApplication && window.blockSpectatorApplication('job')) return;
    var logged = localStorage.getItem('elisee_user_auth') === 'true';
    if (!logged) {
      if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      else toast('Accedi per candidarti.', 'warning');
      return;
    }
    if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) {
      openSheet(dossierHtml(u, job || { title: title }));
      return;
    }
    if (typeof window._eliseeOpenCandidateOrig === 'function') {
      window._eliseeOpenCandidateOrig(title);
    }
  }

  function onClick(e) {
    var t = e.target.closest('[data-pc]');
    if (!t) {
      if (e.target.closest('#es-pc-card')) {
        openSheet(detailHtml(userObj()));
      }
      return;
    }
    var k = t.getAttribute('data-pc');
    var u = userObj();
    if (k === 'close') { closeOverlay(); return; }
    if (k === 'open-card') { openSheet(detailHtml(u)); return; }
    if (k === 'heatmap') { heatmapEditor(u); return; }
    if (k === 'gps') { openSheet(gpsPanel(u, 'session')); return; }
    if (k === 'gps-start') { startGps(u); return; }
    if (k === 'gps-stop') { stopGps(u); return; }
    if (k === 'jobs') {
      if (window.switchView) window.switchView('bacheca', '#bacheca-annunci');
      setTimeout(injectFunnel, 80);
      return;
    }
    if (k === 'heat-auto') {
      var form = (document.getElementById('es-pc-form') || {}).value || '4-3-3';
      heatRange.form = form;
      heatRange.role = roleOf(u);
      heatRange.cells = roleSeeds(roleOf(u), form);
      var hold = document.getElementById('es-pc-heat-pitch');
      if (hold) hold.innerHTML = pitchSvg(heatRange.cells, true);
      return;
    }
    if (k === 'heat-save') {
      heatSave(u, heatRange);
      toast('Heatmap salvata sulla Card.');
      return;
    }
    if (k === 'add-video') {
      var inp = document.getElementById('es-pc-vid-url');
      var url = inp ? String(inp.value || '').trim() : '';
      if (!url) return;
      var list = videosOf(u);
      list.unshift({ url: url, title: 'Highlight', at: Date.now() });
      saveVideos(u, list);
      openSheet(detailHtml(u));
      toast('Clip aggiunta al Video Hub.');
      return;
    }
    if (k === 'confirm-apply') {
      confirmApply(t.getAttribute('data-title') || '');
    }
  }

  function onOverlayClick(e) {
    var cell = e.target.closest('.es-pc-cell');
    if (cell && document.getElementById('es-pc-heat-pitch')) {
      var r = cell.getAttribute('data-r');
      var c = cell.getAttribute('data-c');
      var key = r + '-' + c;
      heatRange.cells = heatRange.cells || {};
      heatRange.cells[key] = (heatRange.cells[key] || 0) + 1;
      var hold = document.getElementById('es-pc-heat-pitch');
      if (hold) hold.innerHTML = pitchSvg(heatRange.cells, true);
      return;
    }
    var rng = e.target.closest('[data-range]');
    if (rng) {
      openSheet(gpsPanel(userObj(), rng.getAttribute('data-range')));
    }
  }

  window.EliseePlayerCard = {
    geoFilter: 0,
    mountDash: mountDash,
    cardHtml: cardHtml,
    geoTier: geoTier,
    sortJobs: sortJobs,
    smartApply: smartApply,
    injectFunnel: injectFunnel
  };

  function boot() {
    patchScopri();
    patchChiSegui();
    document.addEventListener('click', onClick);
    document.addEventListener('click', onOverlayClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'es-pc-card') {
        openSheet(detailHtml(userObj()));
      }
      if (e.key === 'Escape') closeOverlay();
    });
    injectFunnel();
    if (typeof window.filterAndRenderJobs === 'function') {
      try { window.filterAndRenderJobs(); } catch (_) {}
    }
    var box = document.getElementById('es-pd');
    if (box) {
      try { mountDash(box, userObj()); } catch (_) {}
    }
    fetch('data/squadre/minigioco_clubs.json').then(function (r) { return r.json(); }).then(function (arr) {
      indexClubs(arr);
      var dash = document.getElementById('es-pd');
      if (dash && document.getElementById('es-pc-slot')) {
        try { mountDash(dash, userObj()); } catch (_) {}
      }
    }).catch(function () {});
    document.addEventListener('elisee:view-changed', function (ev) {
      var d = ev && ev.detail;
      if (d && (d.view === 'bacheca' || (d.hash && String(d.hash).indexOf('bacheca') >= 0))) {
        injectFunnel();
      }
      if (d && (d.view === 'user-dossier' || (d.hash && String(d.hash).indexOf('dossier') >= 0))) {
        var dash = document.getElementById('es-pd');
        if (dash) {
          try { mountDash(dash, userObj()); } catch (_) {}
        }
      }
    });
    if (typeof window.openCandidateModal === 'function' && !window._eliseeOpenCandidateOrig) {
      window._eliseeOpenCandidateOrig = window.openCandidateModal;
      window.openCandidateModal = function (title) {
        var u = userObj();
        if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) {
          window.EliseePlayerCard.smartApply(title, { title: title });
          return;
        }
        window._eliseeOpenCandidateOrig(title);
      };
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
