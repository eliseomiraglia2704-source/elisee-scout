/* Scopri profili — follow staff (e altri ruoli) come social */
(function () {
  var REGIONS = ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'];
  var SPORTS = ['Calcio', 'Calcio a 5', 'Pallavolo', 'Basket', 'Rugby', 'Tennis'];

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
    ['Carlo D’Angelo', 'Team manager', 'Abruzzo', 'Pescara'],
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
    ['Kevin Di Bari', 'Trequartista', 'Lazio', 'Roma']
  ];
  var CLUBS = [
    ['ASD Foggia Calcio', 'Società', 'Puglia', 'Foggia'],
    ['US San Severo', 'Società', 'Puglia', 'San Severo'],
    ['Audace Cerignola', 'Società', 'Puglia', 'Cerignola'],
    ['Polisportiva Bari Sud', 'Società', 'Puglia', 'Bari']
  ];
  var ENTI = [
    ['LND Puglia', 'Ente federale', 'Puglia', 'Bari'],
    ['Comitato Regionale Campania', 'Ente federale', 'Campania', 'Napoli'],
    ['FIGC Lazio', 'Ente federale', 'Lazio', 'Roma']
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slug(name, i) {
    return 'stf-' + String(name || 'x').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + i;
  }

  function pack(kind, rows, sportDefault) {
    return rows.map(function (r, i) {
      return {
        id: slug(r[0], i) + '-' + kind,
        name: r[0],
        kind: kind,
        role: r[1],
        region: r[2],
        city: r[3],
        sport: sportDefault || 'Calcio',
        nation: 'IT',
        followers: 40 + ((r[0].length * 17 + i * 13) % 420)
      };
    });
  }

  function liveStaffFromUser() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      if (!(window.isStaffSiteRole && window.isStaffSiteRole(u))) return null;
      var name = [u.nome, u.cognome].filter(Boolean).join(' ').trim();
      if (!name) name = u.username || u.email || 'Utente Staff';
      var role = u.staffRole || u.ruoloDettagliato || 'Staff';
      if (String(role).toLowerCase() === 'staff') role = 'Staff';
      var interest = (u.staffProfile && u.staffProfile.interest) || {};
      return {
        id: 'me-staff-' + String(u.email || u.id || 'local').toLowerCase(),
        name: name,
        kind: 'staff',
        role: role,
        region: interest.region || '',
        city: interest.comune || interest.city || '',
        sport: u.sport || (u.staffProfile && u.staffProfile.sport) || 'Calcio',
        nation: 'IT',
        followers: 1,
        photo: (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, u)) || u.fotoUrl || '',
        isMe: true
      };
    } catch (_) { return null; }
  }

  function catalog() {
    var all = pack('staff', STAFF).concat(pack('player', PLAYERS), pack('club', CLUBS), pack('ente', ENTI));
    var me = liveStaffFromUser();
    if (me) {
      all = [me].concat(all.filter(function (p) { return p.name.toLowerCase() !== me.name.toLowerCase(); }));
    }
    return all;
  }

  function meKey() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      return String(u.email || u.id || '').trim().toLowerCase();
    } catch (_) { return ''; }
  }

  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }

  function followMap() {
    try { return JSON.parse(localStorage.getItem('elisee_social_following') || '{}') || {}; } catch (_) { return {}; }
  }

  function saveFollowMap(map) {
    try { localStorage.setItem('elisee_social_following', JSON.stringify(map)); } catch (_) {}
    var ids = followingIds();
    try { localStorage.setItem('elisee_followed_users', JSON.stringify(ids)); } catch (_) {}
  }

  function followingIds() {
    var map = followMap();
    var k = meKey() || '_guest';
    var set = (map[k] && map[k].ids) || [];
    return Array.isArray(set) ? set.slice() : [];
  }

  function isFollowing(id) {
    return followingIds().indexOf(id) >= 0;
  }

  function initials(name) {
    var p = String(name || '').trim().split(/\s+/);
    var a = (p[0] || 'U').charAt(0);
    var b = (p[1] || p[0] || 'S').charAt(0);
    return (a + b).toUpperCase();
  }

  function mySport() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      return u.sport || (u.staffProfile && u.staffProfile.sport) || (u.playerProfile && u.playerProfile.sport) || 'Calcio';
    } catch (_) { return 'Calcio'; }
  }

  function kindLabel(k) {
    if (k === 'staff') return 'Staff';
    if (k === 'player') return 'Player';
    if (k === 'club') return 'Club';
    if (k === 'ente') return 'ENTE';
    return k;
  }

  window.EliseeScopri = {
    filterKind: 'staff',
    region: '',
    sport: 'mine',
    render: function () {
      var root = document.getElementById('es-sc-list');
      if (!root) return;
      var kind = this.filterKind || 'staff';
      var region = this.region || '';
      var sportSel = this.sport || 'mine';
      var sportVal = sportSel === 'mine' ? mySport() : sportSel;
      var followed = followingIds();
      var rows = catalog().filter(function (p) {
        if (kind && p.kind !== kind) return false;
        if (region && p.region !== region) return false;
        if (sportSel !== 'all' && p.sport && p.sport !== sportVal && p.kind !== 'ente' && p.kind !== 'club') return false;
        return true;
      });
      var count = document.getElementById('es-sc-count-n');
      if (count) count.textContent = String(rows.length);
      document.querySelectorAll('.es-sc-chip').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-kind') === kind);
      });
      if (!rows.length) {
        root.innerHTML = '<p class="es-sc-empty">Nessun profilo con questi filtri.</p>';
        return;
      }
      root.innerHTML = rows.map(function (p) {
        var on = followed.indexOf(p.id) >= 0;
        var nFollow = p.followers + (on && !p.isMe ? 1 : 0);
        var photo = p.photo
          ? '<img src="' + esc(p.photo) + '" alt="">'
          : esc(initials(p.name));
        var btn = p.isMe
          ? '<button type="button" class="es-sc-follow" disabled>Sei tu</button>'
          : '<div class="es-sc-actions">' +
              '<button type="button" class="es-sc-follow' + (on ? ' is-on' : '') + '" data-follow="' + esc(p.id) + '">' + (on ? 'Segui già' : 'Segui') + '</button>' +
              '<button type="button" class="es-sc-msg" data-msg="' + esc(p.id) + '" data-msg-name="' + esc(p.name) + '" data-msg-kind="' + esc(p.kind) + '">Messaggia</button>' +
            '</div>';
        var flag = p.nation === 'IT' ? '🇮🇹 IT' : (p.nation || '');
        var line = (p.sport ? p.sport + ' · ' : '') + p.role;
        return '<article class="es-sc-card" data-id="' + esc(p.id) + '">' +
          '<div class="es-sc-ava">' + photo + '</div>' +
          '<div>' +
            '<h3 class="es-sc-name">' + esc(p.name) + '</h3>' +
            '<div class="es-sc-meta">' +
              '<span class="es-sc-pill">' + esc(kindLabel(p.kind)) + '</span>' +
              '<span>' + flag + '</span>' +
              '<span class="es-sc-line">' + esc(line) + (p.city ? ' · ' + esc(p.city) : '') + '</span>' +
              '<span>' + nFollow + ' follower</span>' +
            '</div>' +
          '</div>' + btn +
        '</article>';
      }).join('');
    },
    follow: function (id) {
      if (!id) return;
      if (!isLogged()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        else if (typeof window.showToast === 'function') window.showToast('Accedi per seguire i profili.', 'error');
        else alert('Accedi per seguire i profili.');
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
      var name = person ? person.name : 'profilo';
      if (typeof window.showToast === 'function') {
        window.showToast(was ? ('Non segui più ' + name + '.') : ('Ora segui ' + name + '.'), 'success');
      }
      if (!was && window.EliseeUserNotifs && typeof window.EliseeUserNotifs.push === 'function') {
        window.EliseeUserNotifs.push({
          title: 'Ora segui ' + name,
          body: person ? (person.sport + ' · ' + person.role) : 'Staff ELISEE SCOUT'
        });
      }
    },
    setKind: function (kind) {
      this.filterKind = kind || 'staff';
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
        var btn = e.target.closest('[data-follow]');
        if (btn) { self.follow(btn.getAttribute('data-follow')); return; }
        var msg = e.target.closest('[data-msg]');
        if (msg && window.openB2BMessage) {
          window.openB2BMessage(msg.getAttribute('data-msg'), msg.getAttribute('data-msg-name'), msg.getAttribute('data-msg-kind'));
        }
      });
      var geo = document.getElementById('es-sc-geo');
      var sport = document.getElementById('es-sc-sport');
      if (geo) {
        geo.innerHTML = '<option value="">Tutta Italia</option>' + REGIONS.map(function (r) {
          return '<option value="' + esc(r) + '">' + esc(r) + '</option>';
        }).join('');
        geo.addEventListener('change', function () { self.region = geo.value; self.render(); });
      }
      if (sport) {
        sport.innerHTML = '<option value="mine">Il mio sport</option><option value="all">Tutti gli sport</option>' +
          SPORTS.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');
        sport.addEventListener('change', function () { self.sport = sport.value; self.render(); });
      }
      this.render();
    }
  };

  window.openScopriProfili = function (kind) {
    if (kind) window.EliseeScopri.filterKind = kind;
    if (typeof window.switchView === 'function') window.switchView('scopri', '#scopri-portal');
    setTimeout(function () { window.EliseeScopri.render(); }, 40);
  };

  function boot() {
    window.EliseeScopri.bind();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'scopri' || (d.hash && String(d.hash).indexOf('scopri') >= 0))) {
        window.EliseeScopri.render();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
