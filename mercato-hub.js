/* Hub Mercato B2B: Secret List stealth (DS/Scout) + Wall trattative chiuse */
(function () {
  var LIST_KEY = 'elisee_secret_lists_v1';
  var WALL_KEY = 'elisee_transfer_wall_v1';
  var CLUBS_URL = 'data/squadre/scopri-clubs.json?v=20260820_MKT1';
  var LINES = [
    { id: 'POR', label: 'Portieri' },
    { id: 'DIF', label: 'Difensori' },
    { id: 'CEN', label: 'Centrocampisti' },
    { id: 'ATT', label: 'Attaccanti' }
  ];
  var STATUSES = ['Svincolato', 'In scadenza', 'Tesserato', 'In trattativa'];
  var PRIOS = [
    { id: '1', label: 'Priorità alta' },
    { id: '2', label: 'Monitoraggio' },
    { id: '3', label: 'Watch' }
  ];
  var clubCache = [];
  var tab = 'secret';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey() {
    var u = userObj();
    return String(u.email || u.id || u.username || '').trim().toLowerCase();
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function roleBlob(u) {
    u = u || userObj();
    return [
      u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily,
      u.staffProfile && u.staffProfile.fieldRole
    ].filter(Boolean).join(' ').toLowerCase();
  }
  function canUseSecretList(u) {
    u = u || userObj();
    if (localStorage.getItem('elisee_admin_auth') === 'true') return true;
    var blob = roleBlob(u);
    if (/direttore sportivo|scout|osservatore|dirigente/.test(blob)) return true;
    if (/\bsquadra\b|\bclub\b|societ/.test(blob)) return true;
    return false;
  }
  function needLogin(hash) {
    if (isLogged()) return false;
    if (window.requireEliseeLogin) {
      window.requireEliseeLogin({ view: 'mercato', hash: hash || '#mercato-hub' });
    } else if (typeof window.openAccessoModal === 'function') {
      window.openAccessoModal('email');
    }
    return true;
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
    else try { console.info(msg); } catch (_) {}
  }
  function slug(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function lineOf(role) {
    var r = String(role || '').toLowerCase();
    if (/portier/.test(r)) return 'POR';
    if (/difens|terzin|centrale|stopper|braccetto/.test(r)) return 'DIF';
    if (/centro|median|mezzala|trequart|interno|regista/.test(r)) return 'CEN';
    return 'ATT';
  }
  function posCode(role) {
    var r = String(role || '').toLowerCase();
    if (/portier/.test(r)) return 'POR';
    if (/terzin/.test(r)) return 'TE';
    if (/difens|centrale/.test(r)) return 'DC';
    if (/median/.test(r)) return 'MDC';
    if (/mezzala|interno/.test(r)) return 'CC';
    if (/trequart/.test(r)) return 'COC';
    if (/\bala\b/.test(r)) return 'AL';
    if (/seconda punta/.test(r)) return 'SP';
    if (/centravanti|punta/.test(r)) return 'ATT';
    return 'CAL';
  }
  function ovrOf(name) {
    var n = 0;
    String(name || '').split('').forEach(function (c) { n += c.charCodeAt(0); });
    return 64 + (n % 15);
  }
  function loadMap(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveMap(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (_) {}
  }
  function myList() {
    var map = loadMap(LIST_KEY);
    var k = meKey() || '_guest';
    if (!map[k] || !Array.isArray(map[k].items)) map[k] = { items: [] };
    return map[k].items;
  }
  function saveList(items) {
    var map = loadMap(LIST_KEY);
    var k = meKey() || '_guest';
    map[k] = { items: items, updatedAt: new Date().toISOString() };
    saveMap(LIST_KEY, map);
  }
  function wallItems() {
    try {
      var rows = JSON.parse(localStorage.getItem(WALL_KEY) || 'null');
      if (Array.isArray(rows) && rows.length) return rows;
    } catch (_) {}
    var seed = defaultWall();
    try { localStorage.setItem(WALL_KEY, JSON.stringify(seed)); } catch (_) {}
    return seed;
  }
  function saveWall(rows) {
    try { localStorage.setItem(WALL_KEY, JSON.stringify(rows)); } catch (_) {}
  }
  function kitUrl(club) {
    var s = slug(club);
    if (!s) return '';
    if (s.indexOf('audace') >= 0 || s.indexOf('cerignola') >= 0) s = 'audace-cerignola';
    else if (s.indexOf('foggia') >= 0) s = 'foggia';
    else if (s.indexOf('bari') >= 0) s = 'bari';
    else if (s.indexOf('lecce') >= 0) s = 'lecce';
    else if (s.indexOf('catania') >= 0) s = 'catania';
    else if (s.indexOf('avellino') >= 0) s = 'avellino';
    else if (s.indexOf('benevento') >= 0) s = 'benevento';
    return 'immagini/kits-2d/' + s + '/home.png';
  }
  function logoUrl(club) {
    var found = clubCache.filter(function (c) {
      return String(c.name || '').toLowerCase() === String(club || '').toLowerCase();
    })[0];
    if (found && found.logo) return found.logo;
    return 'immagini/squadre-loghi/' + slug(club).replace(/^a-c-/, '').replace(/^us-/, '').replace(/^asd-/, '') + '.png';
  }
  function defaultWall() {
    var now = Date.now();
    function ago(h) { return new Date(now - h * 3600000).toISOString(); }
    return [
      { id: 'w-seed-1', player: 'Marco Rossi', role: 'Centravanti', from: 'Svincolato', to: 'Audace Cerignola', at: ago(2), seed: true },
      { id: 'w-seed-2', player: 'Sara Esposito', role: 'Ala', from: 'Svincolato', to: 'SSC Bari', at: ago(6), seed: true },
      { id: 'w-seed-3', player: 'Kevin Di Bari', role: 'Trequartista', from: 'Svincolato', to: 'Calcio Foggia 1920', at: ago(14), seed: true },
      { id: 'w-seed-4', player: 'Francesco Greco', role: 'Centravanti', from: 'Svincolato', to: 'Catania FC', at: ago(28), seed: true },
      { id: 'w-seed-5', player: 'Noemi Longo', role: 'Ala', from: 'Svincolato', to: 'US Lecce', at: ago(40), seed: true }
    ];
  }
  function peoplePool() {
    try {
      if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
        return window.EliseeScopri.allProfiles().filter(function (p) { return p.kind === 'player'; });
      }
    } catch (_) {}
    return [
      { id: 'p-marco-rossi-0', name: 'Marco Rossi', role: 'Centravanti', city: 'Foggia', region: 'Puglia' },
      { id: 'p-lorenzo-bianchi-1', name: 'Lorenzo Bianchi', role: 'Centrocampista', city: 'San Severo', region: 'Puglia' },
      { id: 'p-sara-esposito-4', name: 'Sara Esposito', role: 'Ala', city: 'Napoli', region: 'Campania' },
      { id: 'p-kevin-di-bari-5', name: 'Kevin Di Bari', role: 'Trequartista', city: 'Roma', region: 'Lazio' }
    ];
  }
  function alreadyIn(id, name) {
    return myList().some(function (x) {
      return x.playerId === id || String(x.name).toLowerCase() === String(name || '').toLowerCase();
    });
  }

  function addStealth(player, extras) {
    extras = extras || {};
    if (!isLogged()) {
      needLogin('#mercato-hub');
      return false;
    }
    if (!canUseSecretList()) {
      toast('Secret List riservata a Direttori Sportivi e Scout.', 'error');
      return false;
    }
    if (!player || !player.name) return false;
    if (alreadyIn(player.id, player.name)) {
      toast(player.name + ' è già in Secret List. Nessuna notifica inviata.', 'success');
      return true;
    }
    var items = myList();
    items.unshift({
      id: 'sl-' + Date.now(),
      playerId: player.id || slug(player.name),
      name: player.name,
      role: player.role || 'Calciatore',
      city: player.city || '',
      region: player.region || '',
      photo: player.photo || '',
      priority: extras.priority || '2',
      status: extras.status || 'Svincolato',
      notes: extras.notes || '',
      addedAt: new Date().toISOString()
    });
    saveList(items);
    toast('Aggiunto in Secret List in modalità stealth. Nessuna notifica a atleta, procuratore o altri club.', 'success');
    try { paintStaffCard(); } catch (_) {}
    return true;
  }

  function fmtWhen(iso) {
    try {
      return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (_) { return ''; }
  }

  function renderSecret() {
    var lock = document.getElementById('es-mk-lock');
    var ok = document.getElementById('es-mk-secret-ok');
    var cols = document.getElementById('es-mk-cols');
    if (!cols) return;
    var allowed = canUseSecretList();
    var banner = document.getElementById('es-mk-stealth-banner');
    if (lock) lock.hidden = allowed;
    if (ok) ok.hidden = !allowed;
    if (banner) banner.hidden = !allowed;
    if (!allowed) return;
    var q = ((document.getElementById('es-mk-q') || {}).value || '').toLowerCase();
    var prio = ((document.getElementById('es-mk-prio') || {}).value || '');
    var items = myList().filter(function (it) {
      if (prio && it.priority !== prio) return false;
      if (q && [it.name, it.role, it.city, it.notes].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var html = '';
    LINES.forEach(function (ln) {
      var col = items.filter(function (it) { return lineOf(it.role) === ln.id; });
      html += '<section class="es-mk-col"><h3>' + ln.label + ' <b>' + col.length + '</b></h3>';
      if (!col.length) html += '<p class="es-mk-empty-col">Nessun target.</p>';
      col.forEach(function (it) {
        var pr = PRIOS.filter(function (p) { return p.id === it.priority; })[0];
        html += '<article class="es-mk-card is-p' + esc(it.priority) + '" data-id="' + esc(it.id) + '">' +
          '<div class="es-mk-card-top"><div><h4>' + esc(it.name) + '</h4>' +
          '<p>' + esc(it.role) + (it.city ? ' · ' + esc(it.city) : '') + '</p></div>' +
          '<span class="es-mk-prio p' + esc(it.priority) + '">' + esc(pr ? pr.label : 'Watch') + '</span></div>' +
          '<span class="es-mk-status">' + esc(it.status) + '</span>' +
          '<textarea class="es-mk-note" data-note="' + esc(it.id) + '" placeholder="Note private (solo tu)">' + esc(it.notes) + '</textarea>' +
          '<div class="es-mk-card-actions">' +
          '<button type="button" data-prio="' + esc(it.id) + '">Priorità</button>' +
          '<button type="button" data-status="' + esc(it.id) + '">Status</button>' +
          '<button type="button" data-official="' + esc(it.id) + '">Ufficializza</button>' +
          '<button type="button" class="danger" data-del="' + esc(it.id) + '">Togli</button>' +
          '</div></article>';
      });
      html += '</section>';
    });
    cols.innerHTML = html;
  }

  function paintPicker(q) {
    var box = document.getElementById('es-mk-pick-list');
    if (!box) return;
    var nq = String(q || '').toLowerCase();
    var rows = peoplePool().filter(function (p) {
      if (alreadyIn(p.id, p.name)) return false;
      if (!nq) return true;
      return [p.name, p.role, p.city].join(' ').toLowerCase().indexOf(nq) >= 0;
    }).slice(0, 18);
    if (!rows.length) {
      box.innerHTML = '<p class="es-mk-empty-col">Nessun profilo da aggiungere.</p>';
      return;
    }
    box.innerHTML = rows.map(function (p) {
      return '<button type="button" class="es-mk-pick" data-add-id="' + esc(p.id) + '" data-add-name="' + esc(p.name) + '" data-add-role="' + esc(p.role || '') + '" data-add-city="' + esc(p.city || '') + '">' +
        '<span><strong>' + esc(p.name) + '</strong><span>' + esc((p.role || '') + (p.city ? ' · ' + p.city : '')) + '</span></span></button>';
    }).join('');
  }

  function dealHtml(d, newest) {
    var kit = kitUrl(d.to);
    var logo = logoUrl(d.to);
    var last = lastName(d.player);
    return '<article class="es-mk-deal' + (newest ? ' is-new' : '') + '">' +
      '<div class="es-mk-deal-ribbon">Ufficiale · Calciomercato Elisee</div>' +
      '<div class="es-mk-deal-grid">' +
        '<div class="es-mk-fifa">' +
          (kit ? '<div class="es-mk-fifa-kit" style="background-image:url(\'' + esc(kit) + '\')"></div>' : '') +
          '<div class="es-mk-fifa-meta"><div class="es-mk-ovr">' + ovrOf(d.player) + '</div><div class="es-mk-pos">' + esc(posCode(d.role)) + '</div></div>' +
          '<div class="es-mk-fifa-name">' + esc(last) + '</div>' +
          '<div class="es-mk-stamp">TRASFERITO</div>' +
        '</div>' +
        '<div class="es-mk-kit-hero">' +
          (kit ? '<img src="' + esc(kit) + '" alt="Maglia ' + esc(d.to) + '" onerror="this.parentNode.style.display=\'none\'">' : '') +
          '<div class="es-mk-stamp">TRASFERITO</div>' +
        '</div>' +
        '<div class="es-mk-deal-body">' +
          '<p class="es-mk-breaking">Breaking</p>' +
          '<h3>' + esc(d.player) + ' è un nuovo giocatore</h3>' +
          '<div class="es-mk-path">' +
            '<span>' + esc(d.from || 'Svincolato') + '</span><em>→</em>' +
            '<img src="' + esc(logo) + '" alt="" width="28" height="28" style="width:28px;height:28px;object-fit:contain" onerror="this.style.display=\'none\'">' +
            '<span>' + esc(d.to) + '</span>' +
          '</div>' +
          '<p class="es-mk-deal-meta">' + esc(d.role || 'Calciatore') + ' · ' + esc(fmtWhen(d.at)) + '</p>' +
        '</div>' +
      '</div></article>';
  }
  function lastName(name) {
    var p = String(name || '').trim().split(/\s+/);
    return p.length > 1 ? p[p.length - 1] : (p[0] || 'PLAYER');
  }

  function renderWall() {
    var root = document.getElementById('es-mk-wall');
    if (!root) return;
    var rows = wallItems().slice().sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    var ticker = rows.slice(0, 8).map(function (d) {
      return 'TRASFERITO  ·  ' + d.player + ' → ' + d.to;
    }).join('     ★     ');
    var html = '<p class="es-mk-live"><i></i> Feed in tempo reale · tab notizie di mercato</p>';
    if (ticker) html += '<div class="es-mk-ticker" aria-hidden="true"><span>' + esc(ticker + '     ★     ' + ticker) + '</span></div>';
    html += '<div class="es-mk-toolbar">' +
      '<button type="button" class="es-mk-btn" id="es-mk-official-open">Ufficializza accordo</button>' +
      '</div>';
    html += '<form class="es-mk-form" id="es-mk-official-form" hidden>' +
      '<label>Calciatore<input name="player" required placeholder="Nome e cognome"></label>' +
      '<label>Ruolo<input name="role" placeholder="Centravanti, Ala…"></label>' +
      '<label>Da (club o Svincolato)<input name="from" value="Svincolato"></label>' +
      '<label>Nuovo club<input name="to" required placeholder="Società di destinazione" list="es-mk-clubs"></label>' +
      '<datalist id="es-mk-clubs"></datalist>' +
      '<div class="span2"><button type="submit" class="es-mk-btn">Pubblica sul Wall</button></div>' +
      '</form>';
    if (!rows.length) html += '<p class="es-mk-empty-col">Nessuna trattativa chiusa per ora.</p>';
    html += '<div class="es-mk-feed">' + rows.map(function (d, i) { return dealHtml(d, i === 0); }).join('') + '</div>';
    root.innerHTML = html;
    var dl = document.getElementById('es-mk-clubs');
    if (dl) {
      dl.innerHTML = clubCache.slice(0, 80).map(function (c) {
        return '<option value="' + esc(c.name) + '">';
      }).join('');
    }
  }

  function officialize(payload) {
    if (!isLogged()) {
      needLogin('#wall-trasferimenti');
      return;
    }
    var row = {
      id: 'w-' + Date.now(),
      player: payload.player,
      role: payload.role || 'Calciatore',
      from: payload.from || 'Svincolato',
      to: payload.to,
      at: new Date().toISOString(),
      by: meKey()
    };
    var rows = wallItems();
    rows.unshift(row);
    saveWall(rows);
    toast('Trattativa ufficializzata sul Wall. ' + row.player + ' → ' + row.to, 'success');
    tab = 'wall';
    render();
  }

  function setTab(next) {
    tab = next === 'wall' ? 'wall' : 'secret';
    if (tab === 'secret' && !isLogged()) {
      needLogin('#mercato-hub');
    }
    var sec = document.getElementById('es-mk-secret');
    var wall = document.getElementById('es-mk-wall');
    if (sec) sec.hidden = tab !== 'secret';
    if (wall) wall.hidden = tab !== 'wall';
    document.querySelectorAll('.es-mk-tab').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-mk') === tab);
    });
    var kicker = document.getElementById('es-mk-kicker');
    var title = document.getElementById('es-mk-title');
    var lead = document.getElementById('es-mk-lead');
    if (tab === 'wall') {
      if (kicker) kicker.textContent = 'Calciomercato';
      if (title) title.textContent = 'Wall delle trattative chiuse';
      if (lead) lead.textContent = 'Come il tab notizie di FIFA: quando società e atleta svincolato chiudono, la card con la nuova maglia e la scritta TRASFERITO va in feed.';
      renderWall();
    } else {
      if (kicker) kicker.textContent = 'Hub Mercato';
      if (title) title.textContent = 'Secret List';
      if (lead) lead.textContent = 'Lista riservata stile Football Manager: organizza i target per ruolo e priorità. Inserimento stealth, senza allertare atleta, procuratore o club concorrenti.';
      renderSecret();
    }
  }

  function render() {
    setTab(tab);
  }

  function cyclePrio(id) {
    var items = myList();
    items.forEach(function (it) {
      if (it.id !== id) return;
      it.priority = it.priority === '1' ? '2' : it.priority === '2' ? '3' : '1';
    });
    saveList(items);
    renderSecret();
  }
  function cycleStatus(id) {
    var items = myList();
    items.forEach(function (it) {
      if (it.id !== id) return;
      var i = STATUSES.indexOf(it.status);
      it.status = STATUSES[(i + 1) % STATUSES.length];
    });
    saveList(items);
    renderSecret();
  }

  function bind() {
    var hub = document.getElementById('mercato-hub');
    if (!hub || hub.dataset.bound === '1') return;
    hub.dataset.bound = '1';
    hub.addEventListener('click', function (e) {
      var ttab = e.target.closest('.es-mk-tab');
      if (ttab) {
        var next = ttab.getAttribute('data-mk');
        if (typeof window.switchView === 'function') {
          window.switchView('mercato', next === 'wall' ? '#wall-trasferimenti' : '#mercato-hub');
        } else setTab(next);
        return;
      }
      if (e.target.closest('#es-mk-add')) {
        var picker = document.getElementById('es-mk-picker');
        if (picker) {
          picker.hidden = !picker.hidden;
          if (!picker.hidden) paintPicker('');
        }
        return;
      }
      var add = e.target.closest('[data-add-id]');
      if (add) {
        addStealth({
          id: add.getAttribute('data-add-id'),
          name: add.getAttribute('data-add-name'),
          role: add.getAttribute('data-add-role'),
          city: add.getAttribute('data-add-city')
        });
        renderSecret();
        return;
      }
      var del = e.target.closest('[data-del]');
      if (del) {
        saveList(myList().filter(function (it) { return it.id !== del.getAttribute('data-del'); }));
        renderSecret();
        return;
      }
      var pr = e.target.closest('[data-prio]');
      if (pr) { cyclePrio(pr.getAttribute('data-prio')); return; }
      var st = e.target.closest('[data-status]');
      if (st) { cycleStatus(st.getAttribute('data-status')); return; }
      var off = e.target.closest('[data-official]');
      if (off) {
        var it = myList().filter(function (x) { return x.id === off.getAttribute('data-official'); })[0];
        if (!it) return;
        tab = 'wall';
        render();
        var form = document.getElementById('es-mk-official-form');
        if (form) {
          form.hidden = false;
          if (form.player) form.player.value = it.name;
          if (form.role) form.role.value = it.role || '';
          if (form.from) form.from.value = it.status === 'Svincolato' ? 'Svincolato' : (it.status || 'Svincolato');
          if (form.to) form.to.focus();
        }
        return;
      }
      if (e.target.closest('#es-mk-official-open')) {
        var form = document.getElementById('es-mk-official-form');
        if (form) form.hidden = !form.hidden;
      }
    });
    hub.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'es-mk-q') renderSecret();
      if (e.target && e.target.id === 'es-mk-prio') renderSecret();
      if (e.target && e.target.id === 'es-mk-pick-q') paintPicker(e.target.value);
      if (e.target && e.target.getAttribute('data-note')) {
        var id = e.target.getAttribute('data-note');
        var val = e.target.value;
        var items = myList();
        items.forEach(function (it) { if (it.id === id) it.notes = val; });
        saveList(items);
      }
    });
    hub.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'es-mk-prio') renderSecret();
    });
    hub.addEventListener('submit', function (e) {
      var form = e.target.closest('#es-mk-official-form');
      if (!form) return;
      e.preventDefault();
      officialize({
        player: form.player.value.trim(),
        role: form.role.value.trim(),
        from: form.from.value.trim() || 'Svincolato',
        to: form.to.value.trim()
      });
    });
  }

  function loadClubs(done) {
    if (clubCache.length) { if (done) done(); return; }
    fetch(CLUBS_URL).then(function (r) { return r.json(); }).then(function (j) {
      clubCache = j.clubs || [];
      if (done) done();
    }).catch(function () { clubCache = []; if (done) done(); });
  }

  function openHub(which) {
    tab = which === 'wall' ? 'wall' : 'secret';
    if (tab === 'secret' && needLogin('#mercato-hub')) return;
    if (typeof window.switchView === 'function') {
      window.switchView('mercato', tab === 'wall' ? '#wall-trasferimenti' : '#mercato-hub');
    }
    setTimeout(function () {
      loadClubs(function () { render(); });
    }, 30);
  }

  function paintStaffCard() {
    var card = document.getElementById('es-sp-secret-card');
    var nEl = document.getElementById('es-sp-secret-n');
    var tabBtn = document.getElementById('es-user-tab-secret');
    var ok = canUseSecretList() && isLogged();
    if (card) card.hidden = !ok;
    if (nEl) {
      var n = myList().length;
      nEl.textContent = n === 0 ? 'Nessun target. Aggiungili in stealth, senza allertare nessuno.' : (n + (n === 1 ? ' target in lista' : ' target in lista'));
    }
    if (tabBtn) tabBtn.hidden = !ok;
  }

  window.EliseeMercato = {
    open: openHub,
    addStealth: addStealth,
    canUseSecretList: canUseSecretList,
    alreadyIn: alreadyIn,
    render: render,
    setTab: setTab,
    paintStaffCard: paintStaffCard
  };
  window.openSecretList = function () { openHub('secret'); };
  window.openTransferWall = function () { openHub('wall'); };

  function boot() {
    bind();
    loadClubs();
    paintStaffCard();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      var h = String((d && d.hash) || '');
      if (d && (d.view === 'mercato' || h.indexOf('mercato') >= 0 || h.indexOf('wall-trasferimenti') >= 0 || h.indexOf('secret-list') >= 0)) {
        tab = (h.indexOf('wall') >= 0) ? 'wall' : 'secret';
        loadClubs(function () { render(); });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
