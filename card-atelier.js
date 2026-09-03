/* Card Elisee — inbox viso PNG, atelier staff, pubblicazione. */
(function () {
  'use strict';

  var INBOX_KEY = 'elisee_card_inbox_v1';
  var PUB_KEY = 'elisee_card_published_v1';
  var STATS_KEY = 'elisee_card_stats_v1';
  var STATS = [
    { id: 'velocita', short: 'VEL', label: 'Velocità' },
    { id: 'tiro', short: 'TIR', label: 'Tiro' },
    { id: 'passaggio', short: 'PAS', label: 'Passaggio' },
    { id: 'dribbling', short: 'DRI', label: 'Dribbling' },
    { id: 'difesa', short: 'DIF', label: 'Difesa' },
    { id: 'fisico', short: 'FIS', label: 'Fisico' }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }
  function isAdmin() {
    try { return localStorage.getItem('elisee_admin_auth') === 'true'; } catch (_) { return false; }
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey(u) {
    u = u || userObj();
    return String(u.email || u.id || u.username || '').trim().toLowerCase() || '';
  }
  function loadMap(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveMap(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (_) {
      toast('Spazio pieno: il PNG è troppo pesante.', 'error');
    }
  }
  function isPngFile(file) {
    if (!file) return false;
    var t = String(file.type || '').toLowerCase();
    var n = String(file.name || '').toLowerCase();
    return t === 'image/png' || /\.png$/.test(n);
  }
  function isPngData(url) {
    return /^data:image\/png/i.test(String(url || ''));
  }
  function readPng(file) {
    return new Promise(function (res, rej) {
      if (!isPngFile(file)) {
        rej(new Error('Solo file PNG.'));
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        rej(new Error('PNG massimo 4 MB.'));
        return;
      }
      var r = new FileReader();
      r.onload = function () {
        var s = String(r.result || '');
        if (!isPngData(s)) { rej(new Error('Il file non è un PNG valido.')); return; }
        res(s);
      };
      r.onerror = function () { rej(new Error('Lettura fallita.')); };
      r.readAsDataURL(file);
    });
  }
  function clampStat(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(99, n));
  }
  function emptyStats() {
    var o = {};
    STATS.forEach(function (s) { o[s.id] = 0; });
    return o;
  }
  function statsOf(u) {
    var k = meKey(u);
    var map = loadMap(STATS_KEY);
    var cur = (k && map[k]) ? map[k] : {};
    var p = (u && u.playerProfile) || {};
    var out = emptyStats();
    STATS.forEach(function (s) {
      out[s.id] = clampStat(cur[s.id] || p[s.id] || p[s.short.toLowerCase()] || 0);
    });
    return out;
  }
  function setStats(u, vals) {
    var k = meKey(u);
    if (!k) return;
    var map = loadMap(STATS_KEY);
    var st = emptyStats();
    STATS.forEach(function (s) { st[s.id] = clampStat(vals && vals[s.id]); });
    map[k] = st;
    saveMap(STATS_KEY, map);
    return st;
  }
  function ovrOf(u) {
    var st = statsOf(u);
    var vals = STATS.map(function (s) { return st[s.id]; });
    if (vals.some(function (v) { return v < 1; })) return null;
    var sum = 0;
    vals.forEach(function (v) { sum += v; });
    return Math.max(1, Math.min(99, Math.round(sum / 6)));
  }
  function inboxAll() { return loadMap(INBOX_KEY); }
  function publishedAll() { return loadMap(PUB_KEY); }
  function publishedOf(u) {
    var k = meKey(u);
    return (k && publishedAll()[k]) || null;
  }
  function faceSrc(u) {
    var pub = publishedOf(u);
    if (pub && pub.facePng && isPngData(pub.facePng)) return pub.facePng;
    return 'immagini/card-elisee/esempio-viso.png?v=20260903_ELISEE9';
  }
  function isPublished(u) { return !!(publishedOf(u) && publishedOf(u).facePng); }

  function submitOriginal(file, u) {
    u = u || userObj();
    var k = meKey(u);
    if (!k) return Promise.reject(new Error('Accedi per inviare il viso.'));
    return readPng(file).then(function (dataUrl) {
      var map = inboxAll();
      map[k] = {
        email: k,
        name: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || k,
        originalPng: dataUrl,
        fileName: file.name || 'viso.png',
        at: new Date().toISOString(),
        status: 'pending',
        draftPng: ''
      };
      saveMap(INBOX_KEY, map);
      try { document.dispatchEvent(new CustomEvent('elisee:card-inbox')); } catch (_) {}
      return map[k];
    });
  }

  function peoplePool() {
    var out = [];
    var seen = {};
    function add(p) {
      if (!p) return;
      var k = String(p.email || p.id || '').trim().toLowerCase();
      if (!k || seen[k]) return;
      seen[k] = 1;
      out.push({
        email: k,
        name: p.name || [p.nome, p.cognome].filter(Boolean).join(' ').trim() || k,
        role: p.role || p.ruolo || ''
      });
    }
    var inbox = inboxAll();
    Object.keys(inbox).forEach(function (k) { add(inbox[k]); });
    var pub = publishedAll();
    Object.keys(pub).forEach(function (k) { add({ email: k, name: (pub[k] && pub[k].name) || k }); });
    add(userObj());
    try {
      if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
        window.EliseeScopri.allProfiles().forEach(add);
      }
    } catch (_) {}
    return out;
  }

  function searchPeople(q) {
    q = String(q || '').trim().toLowerCase();
    var rows = peoplePool();
    if (!q) return rows.slice(0, 24);
    return rows.filter(function (p) {
      return (p.name + ' ' + p.email + ' ' + p.role).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 24);
  }

  function setDraft(email, dataUrl) {
    var map = inboxAll();
    if (!map[email]) {
      map[email] = { email: email, name: email, originalPng: '', fileName: '', at: new Date().toISOString(), status: 'ready', draftPng: dataUrl };
    } else {
      map[email].draftPng = dataUrl;
      map[email].status = 'ready';
    }
    saveMap(INBOX_KEY, map);
  }

  function publish(email, staffName) {
    var map = inboxAll();
    var row = map[email];
    var png = row && (row.draftPng || row.originalPng);
    if (!png || !isPngData(png)) return { ok: false, reason: 'Carica prima un PNG dalla voce «Carica l\'immagine».' };
    var pub = publishedAll();
    pub[email] = {
      facePng: png,
      name: (row && row.name) || email,
      savedAt: new Date().toISOString(),
      staff: staffName || 'Staff Elisee'
    };
    saveMap(PUB_KEY, pub);
    if (row) {
      row.status = 'published';
      map[email] = row;
      saveMap(INBOX_KEY, map);
    }
    try { document.dispatchEvent(new CustomEvent('elisee:card-published', { detail: { email: email } })); } catch (_) {}
    return { ok: true };
  }

  function downloadData(dataUrl, filename) {
    if (!dataUrl) return;
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'viso.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function copyData(dataUrl) {
    if (!dataUrl) return Promise.reject();
    function fallback() {
      try {
        navigator.clipboard.writeText(dataUrl);
        return Promise.resolve();
      } catch (e) { return Promise.reject(e); }
    }
    if (!navigator.clipboard || !window.ClipboardItem) return fallback();
    return fetch(dataUrl).then(function (r) { return r.blob(); }).then(function (blob) {
      return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    }).catch(fallback);
  }

  var selected = '';

  function pendingCount() {
    var map = inboxAll();
    var n = 0;
    Object.keys(map).forEach(function (k) {
      if (map[k] && map[k].status !== 'published') n++;
    });
    return n;
  }

  function paintBadge() {
    var el = document.getElementById('es-card-pending-n');
    if (el) el.textContent = String(pendingCount());
    var chipN = document.getElementById('es-card-chip-n');
    if (chipN) {
      var n = pendingCount();
      chipN.textContent = n ? String(n) : '';
      chipN.hidden = !n;
    }
  }

  function renderStaffList(q) {
    var box = document.getElementById('es-card-staff-list');
    if (!box) return;
    var rows = searchPeople(q);
    var inbox = inboxAll();
    var pub = publishedAll();
    if (!rows.length) {
      box.innerHTML = '<p class="es-card-empty">Nessun utente trovato.</p>';
      return;
    }
    box.innerHTML = rows.map(function (p) {
      var row = inbox[p.email] || {};
      var st = row.status || (pub[p.email] ? 'published' : '');
      var lbl = st === 'published' ? 'Pubblicata' : (st === 'ready' ? 'PNG caricato, da salvare' : (st === 'pending' ? 'In attesa' : 'Nessun invio'));
      return '<button type="button" class="es-card-user' + (selected === p.email ? ' is-on' : '') + '" data-card-user="' + esc(p.email) + '">' +
        '<b>' + esc(p.name) + '</b><span>' + esc(p.email) + '</span><i>' + esc(lbl) + '</i></button>';
    }).join('');
  }

  function renderStaffDetail() {
    var box = document.getElementById('es-card-staff-detail');
    if (!box) return;
    if (!selected) {
      box.innerHTML = '<p class="es-card-empty">Cerca un utente e selezionalo.</p>';
      return;
    }
    var inbox = inboxAll();
    var pub = publishedAll();
    var row = inbox[selected] || { email: selected, name: selected };
    var published = pub[selected];
    var orig = row.originalPng || '';
    var draft = row.draftPng || '';
    var face = (published && published.facePng) || '';
    box.innerHTML =
      '<div class="es-card-detail-head"><h3>' + esc(row.name || selected) + '</h3><p>' + esc(selected) + '</p></div>' +
      '<div class="es-card-thumbs">' +
        '<div><span>Originale utente</span>' +
          (orig ? '<img src="' + orig + '" alt="originale">' : '<p>Nessun PNG inviato.</p>') +
        '</div>' +
        '<div><span>PNG staff (bozza)</span>' +
          (draft ? '<img src="' + draft + '" alt="bozza">' : '<p>Non caricato.</p>') +
        '</div>' +
        '<div><span>Pubblicata</span>' +
          (face ? '<img src="' + face + '" alt="pubblicata">' : '<p>Non ancora salvata.</p>') +
        '</div>' +
      '</div>' +
      '<div class="es-card-staff-actions">' +
        '<button type="button" class="es-card-btn" data-card-act="dl" ' + (orig ? '' : 'disabled') + '>Scarica originale</button>' +
        '<button type="button" class="es-card-btn" data-card-act="copy" ' + (orig ? '' : 'disabled') + '>Copia originale</button>' +
        '<label class="es-card-btn is-file">Carica l\'immagine' +
          '<input type="file" accept="image/png,.png" hidden id="es-card-staff-file">' +
        '</label>' +
        '<button type="button" class="es-card-btn is-save" data-card-act="save">Salva</button>' +
      '</div>' +
      '<p class="es-card-hint">Solo PNG. Dopo «Carica l\'immagine» premi <b>Salva</b>: senza salvataggio la Card pubblica non cambia.</p>';
  }

  function ensureAdminUi() {
    if (!isAdmin()) return;
    var chips = document.querySelector('.pf-gov-bar .pf-chips');
    if (chips && !document.getElementById('btn-show-card-atelier')) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gov-btn pf-chip-btn';
      b.id = 'btn-show-card-atelier';
      b.innerHTML = 'Card Elisee <span id="es-card-chip-n" class="es-card-chip-n" hidden></span>';
      chips.appendChild(b);
      b.addEventListener('click', function () {
        chips.querySelectorAll('.gov-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var wrap = document.getElementById('es-card-admin-wrap');
        if (wrap) wrap.style.display = 'block';
        var mgr = document.getElementById('es-mgr-admin-wrap');
        if (mgr) mgr.style.display = 'none';
        renderStaffList((document.getElementById('es-card-staff-q') || {}).value || '');
        renderStaffDetail();
        paintBadge();
      });
    }
    var dash = document.getElementById('admin-authenticated-dashboard');
    if (dash && !document.getElementById('es-card-admin-wrap')) {
      var box = document.createElement('div');
      box.id = 'es-card-admin-wrap';
      box.style.display = 'none';
      box.innerHTML =
        '<div class="wr-admin-trigger-card es-card-admin" style="margin-top:1.25rem;border-color:rgba(56,189,248,0.35);">' +
          '<p class="es-mgr-kicker">Atelier Card</p>' +
          '<h3 style="margin:0 0 0.4rem;color:#fff;">Portale riservato · viso PNG</h3>' +
          '<p style="margin:0 0 0.6rem;color:#cbd5e1;font-size:0.88rem;">Cerca l\'utente, scarica o copia il PNG originale, carica la versione Elisee e <b>Salva</b> per pubblicare la Card.</p>' +
          '<p style="margin:0 0 0.8rem;color:#7dd3fc;font-size:0.8rem;">In attesa: <b id="es-card-pending-n">0</b></p>' +
          '<input id="es-card-staff-q" type="search" placeholder="Cerca utente (nome o email)…" class="es-card-search">' +
          '<div class="es-card-staff-grid">' +
            '<div id="es-card-staff-list" class="es-card-staff-list"></div>' +
            '<div id="es-card-staff-detail" class="es-card-staff-detail"></div>' +
          '</div>' +
        '</div>';
      dash.appendChild(box);
    }
    paintBadge();
  }

  function bindAdmin() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      var id = t && t.id;
      if (id === 'btn-show-manager' || id === 'btn-show-admin' || id === 'btn-show-privacy' || id === 'btn-show-autopilot') {
        var wrap = document.getElementById('es-card-admin-wrap');
        if (wrap) wrap.style.display = 'none';
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'es-card-staff-q') renderStaffList(e.target.value);
    });
    document.addEventListener('click', function (e) {
      var u = e.target.closest('[data-card-user]');
      if (u) {
        selected = u.getAttribute('data-card-user');
        renderStaffList((document.getElementById('es-card-staff-q') || {}).value || '');
        renderStaffDetail();
        return;
      }
      var act = e.target.closest('[data-card-act]');
      if (!act || !selected) return;
      var k = act.getAttribute('data-card-act');
      var row = inboxAll()[selected] || {};
      if (k === 'dl') downloadData(row.originalPng, 'viso-' + selected.replace(/[^a-z0-9]+/g, '-') + '.png');
      if (k === 'copy') {
        copyData(row.originalPng).then(function () { toast('Immagine copiata.'); }).catch(function () { toast('Copia non riuscita.', 'error'); });
      }
      if (k === 'save') {
        var r = publish(selected, meKey() || 'Staff');
        if (!r.ok) { toast(r.reason, 'error'); return; }
        toast('Card salvata: ora è visibile a tutti.');
        renderStaffList((document.getElementById('es-card-staff-q') || {}).value || '');
        renderStaffDetail();
        paintBadge();
        try {
          if (window.EliseePlayerCard && window.EliseePlayerCard.mountDash) {
            var box = document.getElementById('es-pd');
            if (box) window.EliseePlayerCard.mountDash(box, userObj());
          }
        } catch (_) {}
      }
    });
    document.addEventListener('change', function (e) {
      if (!e.target || e.target.id !== 'es-card-staff-file') return;
      var f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!f || !selected) return;
      readPng(f).then(function (url) {
        setDraft(selected, url);
        toast('PNG caricato. Premi Salva per pubblicare.');
        renderStaffDetail();
        renderStaffList((document.getElementById('es-card-staff-q') || {}).value || '');
        paintBadge();
      }).catch(function (err) { toast(err.message || 'Solo PNG.', 'error'); });
    });
  }

  function playerUploadUi() {
    var st = statsOf(userObj());
    var pub = isPublished(userObj());
    var k = meKey();
    var row = k ? inboxAll()[k] : null;
    var status = pub ? 'Card pubblicata dallo staff.' : (row && row.status === 'pending' ? 'PNG in attesa dello staff Elisee.' : (row && row.status === 'ready' ? 'Staff ha caricato un PNG: in attesa di Salva.' : 'Nessun PNG inviato.'));
    var fields = STATS.map(function (s) {
      return '<label class="es-card-statf"><span>' + esc(s.label) + '</span>' +
        '<input type="number" min="1" max="99" data-card-stat="' + s.id + '" value="' + (st[s.id] || '') + '" placeholder="1–99"></label>';
    }).join('');
    return '<div class="es-card-player-box">' +
      '<p class="es-card-kicker">Card Elisee</p>' +
      '<p class="es-card-status-line">' + esc(status) + '</p>' +
      '<div class="es-card-stats-edit">' + fields + '</div>' +
      '<button type="button" class="es-card-btn" id="es-card-save-stats">Salva statistiche</button>' +
      '<label class="es-card-btn is-file">Carica viso PNG' +
        '<input type="file" accept="image/png,.png" hidden id="es-card-player-file">' +
      '</label>' +
      '<p class="es-card-hint">Solo PNG. Lo staff riceve il file, lo rielabora e lo pubblica con Salva.</p>' +
    '</div>';
  }

  window.EliseeCardAtelier = {
    STATS: STATS,
    statsOf: statsOf,
    setStats: setStats,
    ovrOf: ovrOf,
    faceSrc: faceSrc,
    isPublished: isPublished,
    submitOriginal: submitOriginal,
    playerUploadUi: playerUploadUi,
    pendingCount: pendingCount
  };

  document.addEventListener('change', function (e) {
    if (!e.target || e.target.id !== 'es-card-player-file') return;
    var f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    submitOriginal(f, userObj()).then(function () {
      toast('PNG inviato allo staff Elisee Scout.');
      try {
        if (window.EliseePlayerCard && window.EliseePlayerCard.mountDash) {
          var box = document.getElementById('es-pd');
          if (box) window.EliseePlayerCard.mountDash(box, userObj());
        }
      } catch (_) {}
    }).catch(function (err) { toast(err.message || 'Solo PNG.', 'error'); });
  });
  document.addEventListener('click', function (e) {
    if (!e.target || e.target.id !== 'es-card-save-stats') return;
    var vals = {};
    document.querySelectorAll('[data-card-stat]').forEach(function (inp) {
      vals[inp.getAttribute('data-card-stat')] = inp.value;
    });
    setStats(userObj(), vals);
    toast('Statistiche salvate. L\'overall si aggiorna sulla Card.');
    try {
      if (window.EliseePlayerCard && window.EliseePlayerCard.mountDash) {
        var box = document.getElementById('es-pd');
        if (box) window.EliseePlayerCard.mountDash(box, userObj());
      }
    } catch (_) {}
  });
  document.addEventListener('elisee:card-inbox', paintBadge);

  function boot() {
    ensureAdminUi();
    bindAdmin();
    paintBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('elisee:view-changed', function () { ensureAdminUi(); paintBadge(); });
})();
