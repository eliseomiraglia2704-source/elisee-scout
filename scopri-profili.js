/* Scopri profili — follow Ente / Club / Player / Staff + ricerca avanzata */
(function () {
  var REGIONS = ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'];
  var SPORTS = ['Calcio', 'Calcio a 5', 'Calcio a 7', 'Calcio a 8', 'Pallavolo', 'Basket', 'Rugby', 'Tennis'];
  var PAGE = 40;
  var CLUBS_URL = 'data/squadre/scopri-clubs.json?v=20260820_MAP1';

  var STAFF = [
    ['Eklit Farruky', 'Direttore Sportivo', 'Lombardia', 'Milano'],
    ['Lorenzo Lalle', 'Allenatore', 'Piemonte', 'Torino'],
    ['Andrea Mazza', 'Allenatore', 'Lombardia', 'Bergamo'],
    ['Mauro Aimo', 'Allenatore', 'Piemonte', 'Cuneo'],
    ['Giulia Conti', 'Match analyst', 'Lazio', 'Roma'],
    ['Elena Santoro', 'Preparatore atletico', 'Puglia', 'Foggia'],
    ['Stefano Ricci', 'Direttore Sportivo', 'Puglia', 'Cerignola'],
    ['Andrea Moretti', 'Scout / Osservatore', 'Campania', 'Napoli'],
    ['Chiara Greco', 'Fisioterapista', 'Veneto', 'Verona'],
    ['Paolo Gentile', 'Allenatore in seconda', 'Sicilia', 'Palermo'],
    ['Marco De Luca', 'Preparatore dei portieri', 'Toscana', 'Firenze'],
    ['Sara Bianchi', 'Mental coach', 'Emilia-Romagna', 'Bologna'],
    ['Luca Ferrero', 'Team manager', 'Liguria', 'Genova'],
    ['Francesca Riva', 'Medico sociale', 'Lombardia', 'Monza'],
    ['Davide Colombo', 'Video analyst', 'Lombardia', 'Milano'],
    ['Alessia Romano', 'Nutrizionista', 'Lazio', 'Latina'],
    ['Gianluca Serra', 'Allenatore', 'Sardegna', 'Cagliari'],
    ['Valentina Costa', 'Scout / Osservatore', 'Veneto', 'Venezia'],
    ['Roberto Marino', 'Direttore Sportivo', 'Campania', 'Salerno'],
    ['Martina Gallo', 'Preparatore atletico', 'Puglia', 'Bari'],
    ['Fabio Leone', 'Allenatore', 'Calabria', 'Catanzaro'],
    ['Ilaria Fontana', 'Match analyst', 'Piemonte', 'Novara'],
    ['Simone Vitale', 'Collaboratore tecnico', 'Marche', 'Ancona'],
    ['Paola Messina', 'Fisioterapista', 'Sicilia', 'Catania'],
    ['Enrico Barbera', 'Allenatore', 'Friuli-Venezia Giulia', 'Udine'],
    ['Claudia Neri', 'Team manager', 'Toscana', 'Pisa'],
    ['Michele Russo', 'Scout / Osservatore', 'Puglia', 'Lecce'],
    ['Anna Pellegrini', 'Preparatore atletico', 'Veneto', 'Padova'],
    ['Daniele Coppola', 'Allenatore in seconda', 'Campania', 'Caserta'],
    ['Elisa Morelli', 'Match analyst', 'Lombardia', 'Brescia'],
    ['Antonio Esposito', 'Direttore Sportivo', 'Campania', 'Napoli'],
    ['Giada Ferri', 'Fisioterapista', 'Emilia-Romagna', 'Parma'],
    ['Nicola Bianco', 'Allenatore', 'Basilicata', 'Potenza'],
    ['Federica Longo', 'Scout / Osservatore', 'Lazio', 'Roma'],
    ['Alessandro Conte', 'Preparatore dei portieri', 'Piemonte', 'Torino'],
    ['Marta Villa', 'Mental coach', 'Lombardia', 'Como'],
    ['Pietro Arena', 'Allenatore', 'Sicilia', 'Messina'],
    ['Silvia Monti', 'Nutrizionista', 'Toscana', 'Siena'],
    ['Carlo D Angelo', 'Team manager', 'Abruzzo', 'Pescara'],
    ['Beatrice Gatti', 'Match analyst', 'Veneto', 'Vicenza'],
    ['Luigi Parisi', 'Allenatore', 'Puglia', 'Taranto'],
    ['Noemi Greco', 'Fisioterapista', 'Calabria', 'Cosenza'],
    ['Vincenzo Amato', 'Direttore Sportivo', 'Sicilia', 'Trapani'],
    ['Greta Bellini', 'Scout / Osservatore', 'Emilia-Romagna', 'Modena'],
    ['Salvatore Piras', 'Allenatore', 'Sardegna', 'Sassari'],
    ['Irene Casale', 'Preparatore atletico', 'Lazio', 'Frosinone'],
    ['Matteo Barbieri', 'Video analyst', 'Lombardia', 'Varese'],
    ['Cristina Leone', 'Collaboratore tecnico', 'Piemonte', 'Alessandria'],
    ['Omar Haddad', 'Allenatore', 'Lombardia', 'Milano'],
    ['Giovanni Stabile', 'Dirigente accompagnatore', 'Puglia', 'San Severo'],
    ['Laura Pugliese', 'Segretario sportivo', 'Campania', 'Avellino'],
    ['Riccardo Napolitano', 'Allenatore', 'Molise', 'Campobasso']
  ];

  var PLAYERS = [
    ['Marco Rossi', 'Centravanti', 'Puglia', 'Foggia'],
    ['Lorenzo Bianchi', 'Centrocampista', 'Puglia', 'San Severo'],
    ['Matteo Ferrari', 'Difensore centrale', 'Puglia', 'Manfredonia'],
    ['Roberto Barbieri', 'Portiere', 'Puglia', 'Lucera'],
    ['Sara Esposito', 'Ala', 'Campania', 'Napoli'],
    ['Kevin Di Bari', 'Trequartista', 'Lazio', 'Roma'],
    ['Giulia Romano', 'Terzino', 'Lazio', 'Latina'],
    ['Andrea Conte', 'Mediano', 'Lombardia', 'Milano'],
    ['Francesco Greco', 'Centravanti', 'Sicilia', 'Palermo'],
    ['Martina Leone', 'Ala', 'Toscana', 'Firenze'],
    ['Davide Russo', 'Portiere', 'Veneto', 'Verona'],
    ['Alessia Fontana', 'Mezzala', 'Piemonte', 'Torino'],
    ['Nicola Vitale', 'Difensore centrale', 'Calabria', 'Cosenza'],
    ['Chiara Moretti', 'Seconda punta', 'Emilia-Romagna', 'Bologna'],
    ['Luca Gentile', 'Esterno', 'Campania', 'Salerno'],
    ['Elena Bianco', 'Portiere', 'Puglia', 'Bari'],
    ['Simone Riva', 'Trequartista', 'Lombardia', 'Bergamo'],
    ['Paola Serra', 'Centravanti', 'Sardegna', 'Cagliari'],
    ['Giuseppe Amato', 'Terzino', 'Sicilia', 'Catania'],
    ['Ilaria Gallo', 'Centrocampista', 'Marche', 'Ancona'],
    ['Fabio Neri', 'Ala', 'Liguria', 'Genova'],
    ['Valentina Costa', 'Difensore centrale', 'Veneto', 'Padova'],
    ['Antonio Pellegrini', 'Centravanti', 'Lazio', 'Roma'],
    ['Greta Ferri', 'Trequartista', 'Emilia-Romagna', 'Parma'],
    ['Michele Coppola', 'Portiere', 'Campania', 'Caserta'],
    ['Noemi Longo', 'Ala', 'Puglia', 'Lecce'],
    ['Daniele Monti', 'Mediano', 'Toscana', 'Pisa'],
    ['Beatrice Arena', 'Terzino', 'Sicilia', 'Messina'],
    ['Salvatore Parisi', 'Centravanti', 'Puglia', 'Taranto'],
    ['Irene Haddad', 'Mezzala', 'Lombardia', 'Como'],
    ['Omar Stabile', 'Portiere', 'Piemonte', 'Novara'],
    ['Laura Napolitano', 'Ala', 'Campania', 'Avellino'],
    ['Riccardo Casale', 'Difensore centrale', 'Lazio', 'Frosinone'],
    ['Marta Piras', 'Centravanti', 'Sardegna', 'Sassari'],
    ['Enrico Bellini', 'Trequartista', 'Emilia-Romagna', 'Modena'],
    ['Claudia Villa', 'Portiere', 'Lombardia', 'Varese']
  ];

  var ENTI = REGIONS.map(function (r) {
    return ['LND ' + r, 'Comitato regionale LND', r, r];
  }).concat([
    ['FIGC', 'Federazione', 'Lazio', 'Roma'],
    ['LND Nazionale', 'Lega Nazionale Dilettanti', 'Lazio', 'Roma'],
    ['Divisione Calcio Femminile', 'Ente federale', 'Lazio', 'Roma'],
    ['AIA', 'Associazione Italiana Arbitri', 'Lazio', 'Roma'],
    ['CSI Nazionale', 'Centro Sportivo Italiano', 'Lazio', 'Roma'],
    ['FIGC Settore Giovanile', 'Ente federale', 'Lazio', 'Roma']
  ]);

  var clubCache = null;
  var searchTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function slug(name, i, kind) {
    return String(kind || 'p') + '-' + String(name || 'x').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + i;
  }
  function pack(kind, rows, sportDefault) {
    return rows.map(function (r, i) {
      return {
        id: slug(r[0], i, kind),
        name: r[0],
        kind: kind,
        role: r[1],
        region: r[2],
        city: r[3],
        sport: sportDefault || 'Calcio',
        group: '',
        nation: 'IT',
        followers: 40 + ((r[0].length * 17 + i * 13) % 420),
        photo: ''
      };
    });
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function liveUserCard() {
    try {
      var u = userObj();
      var name = [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || '';
      if (!name && !u.email) return null;
      if (!name) name = u.email.split('@')[0];
      var family = String(u.siteRoleFamily || u.ruolo || u.role || '').toLowerCase();
      var kind = 'player';
      if (window.isStaffSiteRole && window.isStaffSiteRole(u)) kind = 'staff';
      else if (family.indexOf('ente') >= 0) kind = 'ente';
      else if (family.indexOf('squadra') >= 0 || family.indexOf('club') >= 0 || family.indexOf('societ') >= 0) kind = 'club';
      else if (family.indexOf('giocatore') >= 0 || family.indexOf('calciatore') >= 0 || family.indexOf('player') >= 0) kind = 'player';
      else if (family.indexOf('tifoso') >= 0) return null;
      var pp = u.staffProfile || u.playerProfile || {};
      var interest = pp.interest || {};
      var role = u.staffRole || u.ruoloDettagliato || pp.fieldRole || u.ruolo || kindLabel(kind);
      return {
        id: 'me-' + kind + '-' + String(u.email || u.id || 'local').toLowerCase(),
        name: name,
        kind: kind,
        role: role,
        region: interest.region || '',
        city: interest.comune || interest.city || '',
        sport: u.sport || pp.sport || 'Calcio',
        group: '',
        nation: 'IT',
        followers: 1,
        photo: (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, u)) || u.fotoUrl || '',
        isMe: true
      };
    } catch (_) { return null; }
  }
  function staticPeople() {
    return pack('staff', STAFF).concat(pack('player', PLAYERS), pack('ente', ENTI));
  }
  function catalog() {
    var all = staticPeople().concat(clubCache || []);
    var me = liveUserCard();
    if (me) {
      all = [me].concat(all.filter(function (p) { return p.id !== me.id && p.name.toLowerCase() !== me.name.toLowerCase(); }));
    }
    return all;
  }
  function meKey() {
    var u = userObj();
    return String(u.email || u.id || '').trim().toLowerCase();
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function followMap() {
    try { return JSON.parse(localStorage.getItem('elisee_social_following') || '{}') || {}; } catch (_) { return {}; }
  }
  function saveFollowMap(map) {
    try { localStorage.setItem('elisee_social_following', JSON.stringify(map)); } catch (_) {}
    try { localStorage.setItem('elisee_followed_users', JSON.stringify(followingIds())); } catch (_) {}
  }
  function followingIds() {
    var map = followMap();
    var k = meKey() || '_guest';
    var set = (map[k] && map[k].ids) || [];
    return Array.isArray(set) ? set.slice() : [];
  }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/);
    return ((p[0] || 'U').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }
  function mySport() {
    var u = userObj();
    return u.sport || (u.staffProfile && u.staffProfile.sport) || (u.playerProfile && u.playerProfile.sport) || 'Calcio';
  }
  function kindLabel(k) {
    if (k === 'staff') return 'Staff';
    if (k === 'player') return 'Player';
    if (k === 'club') return 'Club';
    if (k === 'ente') return 'ENTE';
    return k;
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function loadClubs(done) {
    if (clubCache) { if (done) done(); return; }
    fetch(CLUBS_URL).then(function (r) { return r.json(); }).then(function (j) {
      clubCache = (j.clubs || []).map(function (c, i) {
        return {
          id: 'club-' + (c.id || i),
          name: c.name,
          kind: 'club',
          role: c.group || c.league || 'Società',
          region: c.region || '',
          city: c.city || '',
          sport: c.sport || 'Calcio',
          group: c.group || '',
          league: c.league || '',
          nation: 'IT',
          followers: 30 + ((String(c.name).length * 11 + i * 7) % 900),
          photo: c.logo || '',
          lat: c.lat,
          lng: c.lng
        };
      });
      if (done) done();
    }).catch(function () {
      clubCache = pack('club', [
        ['ASD Foggia Calcio', 'Società', 'Puglia', 'Foggia'],
        ['US San Severo', 'Società', 'Puglia', 'San Severo']
      ]);
      if (done) done();
    });
  }

  function applyFilters(rows) {
    var s = window.EliseeScopri;
    var kind = s.filterKind || 'staff';
    var q = norm(s.q);
    var region = s.region || '';
    var sportSel = s.sport || 'all';
    var sportVal = sportSel === 'mine' ? mySport() : sportSel;
    var group = s.group || '';
    var role = norm(s.role);
    var city = norm(s.city);
    var onlyF = !!s.followingOnly;
    var followed = followingIds();
    return rows.filter(function (p) {
      if (kind && p.kind !== kind) return false;
      if (onlyF && followed.indexOf(p.id) < 0) return false;
      if (region && p.region !== region) return false;
      if (sportSel !== 'all' && p.sport && p.sport !== sportVal) return false;
      if (group && p.group !== group && p.role !== group) return false;
      if (role && norm(p.role).indexOf(role) < 0) return false;
      if (city && norm(p.city).indexOf(city) < 0) return false;
      if (q) {
        var hay = norm([p.name, p.city, p.role, p.sport, p.league, p.group, p.region].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function uniqueRoles(kind) {
    var set = {};
    catalog().forEach(function (p) {
      if (p.kind === kind && p.role) set[p.role] = 1;
    });
    return Object.keys(set).sort();
  }

  function fillAdvSelects() {
    var kind = window.EliseeScopri.filterKind;
    var roleSel = document.getElementById('es-sc-role');
    var groupSel = document.getElementById('es-sc-group');
    if (roleSel) {
      var roles = uniqueRoles(kind);
      var cur = window.EliseeScopri.role || '';
      roleSel.innerHTML = '<option value="">Tutti i ruoli</option>' + roles.map(function (r) {
        return '<option value="' + esc(r) + '">' + esc(r) + '</option>';
      }).join('');
      roleSel.value = cur;
      roleSel.parentElement.hidden = kind === 'club' || kind === 'ente';
    }
    if (groupSel) {
      var groups = ['Serie A', 'Serie B', 'Serie C', 'Serie D', 'Eccellenza', 'Promozione', 'Prima Categoria', 'Seconda Categoria', 'Terza Categoria', 'Giovanili', 'Femminile'];
      var gcur = window.EliseeScopri.group || '';
      groupSel.innerHTML = '<option value="">Tutte le categorie</option>' + groups.map(function (g) {
        return '<option value="' + esc(g) + '">' + esc(g) + '</option>';
      }).join('');
      groupSel.value = gcur;
      groupSel.parentElement.hidden = kind !== 'club';
    }
  }

  function cardHtml(p, followed) {
    var on = followed.indexOf(p.id) >= 0;
    var photo = p.photo
      ? '<img src="' + esc(p.photo) + '" alt="" onerror="this.remove()">'
      : esc(initials(p.name));
    var org = p.kind === 'club' || p.kind === 'ente';
    var sub = org
      ? ((p.city || p.region || '') + (p.sport ? ' · ' + p.sport : '') + (p.group ? ' · ' + p.group : ''))
      : ((p.sport ? p.sport + ' · ' : '') + (p.role || '') + (p.city ? ' · ' + p.city : ''));
    var btn = p.isMe
      ? '<button type="button" class="es-sc-follow" disabled>Sei tu</button>'
      : '<div class="es-sc-actions">' +
          '<button type="button" class="es-sc-follow' + (on ? ' is-on' : '') + '" data-follow="' + esc(p.id) + '">' + (on ? 'Segui già' : 'Segui') + '</button>' +
          '<button type="button" class="es-sc-msg" data-msg="' + esc(p.id) + '" data-msg-name="' + esc(p.name) + '" data-msg-kind="' + esc(p.kind) + '">Messaggia</button>' +
          '<button type="button" class="es-cs-their" data-see-follow="' + esc(p.id) + '" data-see-name="' + esc(p.name) + '">Chi segue</button>' +
        '</div>';
    return '<article class="es-sc-card' + (org ? ' is-org' : '') + '" data-id="' + esc(p.id) + '">' +
      '<div class="es-sc-ava">' + photo + '</div>' +
      '<div>' +
        '<h3 class="es-sc-name">' + esc(p.name) + '</h3>' +
        (org ? '' : '<span class="es-sc-pill">' + esc(kindLabel(p.kind)) + '</span> ') +
        '<p class="es-sc-sub">' + esc(sub.replace(/^\s·\s/, '')) + '</p>' +
      '</div>' + btn +
    '</article>';
  }

  window.EliseeScopri = {
    allProfiles: catalog,
    cardHtml: cardHtml,
    ensureClubs: loadClubs,
    filterKind: 'staff',
    region: '',
    sport: 'all',
    q: '',
    group: '',
    role: '',
    city: '',
    followingOnly: false,
    shown: PAGE,
    render: function () {
      var root = document.getElementById('es-sc-list');
      if (!root) return;
      fillAdvSelects();
      var followed = followingIds();
      var rows = applyFilters(catalog());
      var count = document.getElementById('es-sc-count-n');
      if (count) count.textContent = String(rows.length);
      var kindNow = this.filterKind;
      document.querySelectorAll('.es-sc-chip').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-kind') === kindNow);
      });
      if (!rows.length) {
        root.innerHTML = '<p class="es-sc-empty">Nessun profilo con questi filtri.</p>';
        return;
      }
      var slice = rows.slice(0, this.shown);
      var more = rows.length > slice.length
        ? '<button type="button" class="es-sc-more" id="es-sc-more">Mostra altri (' + (rows.length - slice.length) + ')</button>'
        : '';
      root.innerHTML = slice.map(function (p) { return cardHtml(p, followed); }).join('') + more;
    },
    follow: function (id) {
      if (!id) return;
      if (!isLogged()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        else if (typeof window.showToast === 'function') window.showToast('Accedi per seguire i profili.', 'error');
        return;
      }
      var person = catalog().filter(function (p) { return p.id === id; })[0];
      if (person && person.isMe) return;
      var map = followMap();
      var k = meKey();
      if (!map[k]) map[k] = { ids: [] };
      var ids = map[k].ids || [];
      var was = ids.indexOf(id) >= 0;
      if (was) ids = ids.filter(function (x) { return x !== id; });
      else ids.unshift(id);
      map[k].ids = ids;
      saveFollowMap(map);
      this.render();
      if (window.EliseeChiSegui && typeof window.EliseeChiSegui.render === 'function') {
        try { window.EliseeChiSegui.render(); } catch (_) {}
      }
      var name = person ? person.name : 'profilo';
      if (typeof window.showToast === 'function') {
        window.showToast(was ? ('Non segui più ' + name + '.') : ('Ora segui ' + name + '.'), 'success');
      }
      if (!was && window.EliseeUserNotifs && typeof window.EliseeUserNotifs.push === 'function') {
        window.EliseeUserNotifs.push({
          title: 'Ora segui ' + name,
          body: person ? ((person.city ? person.city + ' · ' : '') + (person.sport || person.role || '')) : 'ELISEE SCOUT'
        });
      }
    },
    setKind: function (kind) {
      this.filterKind = kind || 'staff';
      this.shown = PAGE;
      this.role = '';
      this.group = '';
      this.render();
    },
    resetAdv: function () {
      this.q = '';
      this.region = '';
      this.sport = 'all';
      this.group = '';
      this.role = '';
      this.city = '';
      this.followingOnly = false;
      this.shown = PAGE;
      var q = document.getElementById('es-sc-q');
      var geo = document.getElementById('es-sc-geo');
      var sport = document.getElementById('es-sc-sport');
      var city = document.getElementById('es-sc-city');
      var fol = document.getElementById('es-sc-following');
      if (q) q.value = '';
      if (geo) geo.value = '';
      if (sport) sport.value = 'all';
      if (city) city.value = '';
      if (fol) fol.checked = false;
      this.render();
    },
    bind: function () {
      var self = this;
      var portal = document.getElementById('scopri-portal');
      if (!portal || portal.dataset.bound === '1') return;
      portal.dataset.bound = '1';
      portal.addEventListener('click', function (e) {
        var chip = e.target.closest('.es-sc-chip');
        if (chip) { self.setKind(chip.getAttribute('data-kind')); return; }
        var more = e.target.closest('#es-sc-more');
        if (more) { self.shown += PAGE; self.render(); return; }
        var tog = e.target.closest('#es-sc-adv-toggle');
        if (tog) {
          var box = document.getElementById('es-sc-adv');
          if (box) box.hidden = !box.hidden;
          tog.classList.toggle('is-on', box && !box.hidden);
          return;
        }
        if (e.target.closest('#es-sc-reset')) { self.resetAdv(); return; }
        var btn = e.target.closest('[data-follow]');
        if (btn) { self.follow(btn.getAttribute('data-follow')); return; }
        var msg = e.target.closest('[data-msg]');
        if (msg && window.openB2BMessage) {
          window.openB2BMessage(msg.getAttribute('data-msg'), msg.getAttribute('data-msg-name'), msg.getAttribute('data-msg-kind'));
          return;
        }
        var see = e.target.closest('[data-see-follow]');
        if (see && window.openChiSegui) {
          window.openChiSegui(see.getAttribute('data-see-follow'), see.getAttribute('data-see-name'));
        }
      });
      var geo = document.getElementById('es-sc-geo');
      var sport = document.getElementById('es-sc-sport');
      if (geo) {
        geo.innerHTML = '<option value="">Tutta Italia</option>' + REGIONS.map(function (r) {
          return '<option value="' + esc(r) + '">' + esc(r) + '</option>';
        }).join('');
        geo.addEventListener('change', function () { self.region = geo.value; self.shown = PAGE; self.render(); });
      }
      if (sport) {
        sport.innerHTML = '<option value="all">Tutti gli sport</option><option value="mine">Il mio sport</option>' +
          SPORTS.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');
        sport.addEventListener('change', function () { self.sport = sport.value; self.shown = PAGE; self.render(); });
      }
      var q = document.getElementById('es-sc-q');
      if (q) {
        q.addEventListener('input', function () {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(function () {
            self.q = q.value.trim();
            self.shown = PAGE;
            self.render();
          }, 160);
        });
      }
      ['es-sc-group', 'es-sc-role', 'es-sc-city'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', function () {
          if (id === 'es-sc-group') self.group = el.value;
          if (id === 'es-sc-role') self.role = el.value;
          if (id === 'es-sc-city') self.city = el.value;
          self.shown = PAGE;
          self.render();
        });
        el.addEventListener('input', function () {
          if (id !== 'es-sc-city') return;
          self.city = el.value;
          self.shown = PAGE;
          self.render();
        });
      });
      var fol = document.getElementById('es-sc-following');
      if (fol) fol.addEventListener('change', function () {
        self.followingOnly = !!fol.checked;
        self.shown = PAGE;
        self.render();
      });
      loadClubs(function () { self.render(); });
      this.render();
    }
  };

  window.openScopriProfili = function (kind) {
    if (kind) window.EliseeScopri.filterKind = kind;
    window.EliseeScopri.shown = PAGE;
    if (typeof window.switchView === 'function') window.switchView('scopri', '#scopri-portal');
    setTimeout(function () {
      loadClubs(function () { window.EliseeScopri.render(); });
    }, 40);
  };

  function boot() {
    window.EliseeScopri.bind();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'scopri' || (d.hash && String(d.hash).indexOf('scopri') >= 0))) {
        loadClubs(function () { window.EliseeScopri.render(); });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
