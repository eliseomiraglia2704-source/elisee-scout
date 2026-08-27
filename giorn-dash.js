/* Dashboard Giornalista / Content Creator — redazione, sondaggi, hub video, coda staff */
(function () {
  'use strict';

  var STORE = 'elisee_stampa_items';
  var CLUBS_URL = 'data/squadre/scopri-clubs.json?v=20260827_GIORN1';
  var CHECKS = [
    { id: 'tone', label: 'Tono rispettoso verso club, atleti e tifosi' },
    { id: 'sources', label: 'Fonti citate o verificabili' },
    { id: 'respect', label: 'Nessun attacco personale a società o atleti' },
    { id: 'truth', label: 'Niente diffamazione, fake news o contenuti non verificati' }
  ];
  var GEO = {
    'Abruzzo': ['Chieti', "L'Aquila", 'Pescara', 'Teramo'],
    'Basilicata': ['Matera', 'Potenza'],
    'Calabria': ['Catanzaro', 'Cosenza', 'Crotone', 'Reggio Calabria', 'Vibo Valentia'],
    'Campania': ['Avellino', 'Benevento', 'Caserta', 'Napoli', 'Salerno'],
    'Emilia-Romagna': ['Bologna', 'Ferrara', 'Forlì-Cesena', 'Modena', 'Parma', 'Piacenza', 'Ravenna', 'Reggio Emilia', 'Rimini'],
    'Friuli-Venezia Giulia': ['Gorizia', 'Pordenone', 'Trieste', 'Udine'],
    Lazio: ['Frosinone', 'Latina', 'Rieti', 'Roma', 'Viterbo'],
    Liguria: ['Genova', 'Imperia', 'La Spezia', 'Savona'],
    Lombardia: ['Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Milano', 'Monza', 'Pavia', 'Sondrio', 'Varese'],
    Marche: ['Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro e Urbino'],
    Molise: ['Campobasso', 'Isernia'],
    Piemonte: ['Alessandria', 'Asti', 'Biella', 'Cuneo', 'Novara', 'Torino', 'Verbano-Cusio-Ossola', 'Vercelli'],
    Puglia: ['Bari', 'Barletta-Andria-Trani', 'Brindisi', 'Foggia', 'Lecce', 'Taranto'],
    Sardegna: ['Cagliari', 'Nuoro', 'Oristano', 'Sassari', 'Sud Sardegna'],
    Sicilia: ['Agrigento', 'Caltanissetta', 'Catania', 'Enna', 'Messina', 'Palermo', 'Ragusa', 'Siracusa', 'Trapani'],
    Toscana: ['Arezzo', 'Firenze', 'Grosseto', 'Livorno', 'Lucca', 'Massa-Carrara', 'Pisa', 'Pistoia', 'Prato', 'Siena'],
    'Trentino-Alto Adige': ['Bolzano', 'Trento'],
    Umbria: ['Perugia', 'Terni'],
    "Valle d'Aosta": ['Aosta'],
    Veneto: ['Belluno', 'Padova', 'Rovigo', 'Treviso', 'Venezia', 'Verona', 'Vicenza']
  };
  var PLAYERS = [
    ['Marco Rossi', 'Centravanti', 'Foggia'],
    ['Lorenzo Bianchi', 'Centrocampista', 'San Severo'],
    ['Matteo Ferrari', 'Difensore', 'Manfredonia'],
    ['Roberto Barbieri', 'Portiere', 'Lucera'],
    ['Sara Esposito', 'Ala', 'Napoli'],
    ['Kevin Di Bari', 'Trequartista', 'Roma'],
    ['Andrea Conte', 'Mediano', 'Milano'],
    ['Francesco Greco', 'Centravanti', 'Palermo'],
    ['Davide Russo', 'Portiere', 'Verona'],
    ['Elena Bianco', 'Portiere', 'Bari']
  ];

  var clubCache = null;
  var composerTags = [];
  var composerType = 'article';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function emailOf(u) {
    return String((u && (u.email || u.id || u.username)) || '').trim().toLowerCase();
  }
  function isGiorn(u) {
    if (window.isGiornalistaSiteRole) return window.isGiornalistaSiteRole(u || userObj());
    u = u || userObj();
    var blob = [u.siteRoleFamily, u.ruolo, u.role].filter(Boolean).join(' ').toLowerCase();
    return /giornalista|content creator|content-creator/.test(blob);
  }
  function isPressVerified(u) {
    u = u || userObj();
    if (!isGiorn(u)) return false;
    return String(u.badgeVerificaStato || '') === 'approved' || !!u.pressVerified;
  }
  function isStaffMod(u) {
    u = u || userObj();
    if (window.isStaffSiteRole && window.isStaffSiteRole(u)) return true;
    try {
      if (localStorage.getItem('elisee_admin_auth') === 'true') return true;
    } catch (_) {}
    var em = emailOf(u);
    return em.indexOf('eliseomiraglia2704') >= 0;
  }
  function giornName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Giornalista';
  }
  function loadItems() {
    try {
      var rows = JSON.parse(localStorage.getItem(STORE) || '[]');
      return Array.isArray(rows) ? rows : [];
    } catch (_) { return []; }
  }
  function saveItems(rows) {
    try { localStorage.setItem(STORE, JSON.stringify(rows || [])); } catch (_) {}
  }
  function uid() {
    return 'st-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function nowIso() { return new Date().toISOString(); }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) { return ''; }
  }
  function statusLabel(st) {
    if (st === 'approved') return 'Approvato';
    if (st === 'rejected') return 'Rifiutato';
    if (st === 'pending') return 'In attesa di approvazione';
    return 'Bozza';
  }
  function notifyAuthor(item, title, body) {
    if (!window.EliseeUserNotifs || !item || !item.authorEmail) return;
    try {
      window.EliseeUserNotifs.push({ title: title, body: body }, { email: item.authorEmail });
    } catch (_) {}
  }
  function loadClubs(done) {
    if (clubCache) { if (done) done(clubCache); return; }
    fetch(CLUBS_URL).then(function (r) { return r.json(); }).then(function (j) {
      clubCache = j.clubs || [];
      if (done) done(clubCache);
    }).catch(function () {
      clubCache = [];
      if (done) done(clubCache);
    });
  }
  function searchTags(q) {
    q = String(q || '').trim().toLowerCase();
    if (q.length < 2) return [];
    var out = [];
    PLAYERS.forEach(function (p) {
      if (p[0].toLowerCase().indexOf(q) >= 0 || p[2].toLowerCase().indexOf(q) >= 0) {
        out.push({ kind: 'player', id: 'pl-' + p[0], name: p[0], extra: p[1] + ' · ' + p[2] });
      }
    });
    var u = userObj();
    var me = giornName(u);
    if (me && me.toLowerCase().indexOf(q) >= 0) {
      out.unshift({ kind: 'player', id: 'me', name: me, extra: 'Profilo sul sito' });
    }
    (clubCache || []).forEach(function (c) {
      var hay = ((c.name || '') + ' ' + (c.city || '') + ' ' + (c.league || '')).toLowerCase();
      if (hay.indexOf(q) >= 0) {
        out.push({ kind: 'club', id: c.id, name: c.name, extra: (c.city || '') + (c.league ? ' · ' + c.league : ''), logo: c.logo || '' });
      }
    });
    return out.slice(0, 12);
  }
  function geoText(g) {
    if (!g) return 'Nazionale';
    if (g.level === 'nazionale') return 'Nazionale';
    if (g.level === 'regione') return g.region || 'Regione';
    if (g.level === 'provincia') return [g.province, g.region].filter(Boolean).join(' · ');
    return [g.city, g.province, g.region].filter(Boolean).join(' · ') || 'Città';
  }
  function videoHtml(url) {
    url = String(url || '').trim();
    if (!url) return '';
    var yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
    if (yt) {
      return '<div class="es-st-video"><iframe src="https://www.youtube.com/embed/' + esc(yt[1]) + '" allowfullscreen title="Video"></iframe></div>';
    }
    var vm = url.match(/vimeo\.com\/(\d+)/i);
    if (vm) {
      return '<div class="es-st-video"><iframe src="https://player.vimeo.com/video/' + esc(vm[1]) + '" allowfullscreen title="Video"></iframe></div>';
    }
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
      return '<div class="es-st-video"><video controls src="' + esc(url) + '"></video></div>';
    }
    return '<p class="es-st-meta"><a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:#38bdf8">Apri video</a></p>';
  }
  function ico(d) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  function pressBadge(u) {
    if (isPressVerified(u)) {
      return '<span class="es-gd-badge">Stampa / Giornalista Verificato</span>';
    }
    return '<span class="es-gd-badge is-wait">In attesa di verifica stampa</span>';
  }
  function regionOptions(sel) {
    return '<option value="">Regione</option>' + Object.keys(GEO).map(function (r) {
      return '<option value="' + esc(r) + '"' + (sel === r ? ' selected' : '') + '>' + esc(r) + '</option>';
    }).join('');
  }
  function provinceOptions(region, sel) {
    var list = GEO[region] || [];
    return '<option value="">Provincia</option>' + list.map(function (p) {
      return '<option value="' + esc(p) + '"' + (sel === p ? ' selected' : '') + '>' + esc(p) + '</option>';
    }).join('');
  }

  function html(user) {
    var verified = isPressVerified(user);
    var mine = loadItems().filter(function (it) { return it.authorEmail === emailOf(user); });
    var pendingN = mine.filter(function (it) { return it.status === 'pending'; }).length;
    var identity = window.EliseeDashReal && window.EliseeDashReal.identityCard
      ? window.EliseeDashReal.identityCard(user, 'Giornalista / Content Creator')
      : '';
    var comply = window.EliseeDashReal && window.EliseeDashReal.compliance
      ? window.EliseeDashReal.compliance(user)
      : '';

    return '<aside class="es-pd-rail">' +
      '<button type="button" data-gd="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-gd="dash" title="Redazione">' + ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') + '</button>' +
      '<button type="button" data-gd="feed" title="Feed Stampa">' + ico('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/>') + '</button>' +
      '<button type="button" data-gd="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-gd="edit" title="Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Redazione</h1><strong>Giornalista: ' + esc(giornName(user)) + '</strong>' + pressBadge(user) + '</div>' +
      '<div class="es-pd-grid">' +

      '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
        identity +
        '<section class="es-pd-card">' +
          '<div class="es-pd-card-header"><h2>Badge stampa</h2><span class="es-pd-source-badge">' + (verified ? 'Validato' : 'Da completare') + '</span></div>' +
          (verified
            ? '<div class="es-pd-empty" style="padding-top:0">Il badge ciano <b style="color:#38bdf8">Stampa / Giornalista Verificato</b> è attivo. Puoi inviare articoli, sondaggi e video in coda staff.</div>'
            : '<div class="es-pd-empty" style="padding-top:0">Solo gli account con badge <b style="color:#38bdf8">Stampa / Giornalista Verificato</b> possono mandare contenuti in pubblicazione. Completa documento e selfie anti-fake.</div>') +
          '<div class="es-pd-empty">In coda: ' + pendingN + ' · Pubblicati: ' + mine.filter(function (it) { return it.status === 'approved'; }).length + '</div>' +
        '</section>' +
        '<div id="es-pd-actions-slot"></div>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
        '<section class="es-pd-card">' +
          '<div class="es-pd-card-header"><h2>Nuovo contenuto</h2><span class="es-pd-source-badge">Sito</span></div>' +
          '<div class="es-gd-tabs">' +
            '<button type="button" class="is-on" data-gd-type="article">Articolo</button>' +
            '<button type="button" data-gd-type="poll">Sondaggio</button>' +
            '<button type="button" data-gd-type="video">Hub video</button>' +
          '</div>' +
          '<div class="es-gd-field"><label>Titolo</label><input id="es-gd-title" maxlength="140" placeholder="Es. Il portiere della provincia"></div>' +
          '<div class="es-gd-field" data-gd-block="article"><label>Testo</label><textarea id="es-gd-body" placeholder="Scrivi l\'articolo. Tagga calciatori e club qui sotto."></textarea></div>' +
          '<div class="es-gd-field" data-gd-block="poll" hidden><label>Opzioni sondaggio (una per riga)</label><textarea id="es-gd-poll" placeholder="Es.\nMiglior portiere provincia\nMiglior attaccante del weekend"></textarea></div>' +
          '<div class="es-gd-field" data-gd-block="video" hidden><label>URL video</label><input id="es-gd-video" placeholder="YouTube, Vimeo o file .mp4"></div>' +
          '<div class="es-gd-field" data-gd-block="video" hidden><label>Tipo colonna</label>' +
            '<select id="es-gd-vkind"><option value="pre">Intervista pre-partita</option><option value="post">Intervista post-partita</option><option value="signing">Nuovo acquisto</option><option value="column">Rubrica settimanale per ruolo</option></select></div>' +
          '<div class="es-gd-field"><label>Tag schede (giocatore / club)</label>' +
            '<input id="es-gd-tagq" placeholder="Cerca calciatore o società">' +
            '<div class="es-gd-suggest" id="es-gd-suggest" hidden></div>' +
            '<div class="es-gd-tags" id="es-gd-tags"></div></div>' +
          '<div class="es-gd-field"><label>Copertura geografica</label>' +
            '<select id="es-gd-glevel"><option value="citta">Città</option><option value="provincia">Provincia</option><option value="regione">Regione</option><option value="nazionale">Nazionale</option></select></div>' +
          '<div class="es-gd-field" id="es-gd-greg-wrap"><label>Regione</label><select id="es-gd-greg">' + regionOptions('') + '</select></div>' +
          '<div class="es-gd-field" id="es-gd-gprov-wrap"><label>Provincia</label><select id="es-gd-gprov">' + provinceOptions('', '') + '</select></div>' +
          '<div class="es-gd-field" id="es-gd-gcity-wrap"><label>Città</label><input id="es-gd-gcity" placeholder="Comune"></div>' +
          '<div style="margin:0.4rem 0 0.2rem;font-size:0.68rem;color:#94a3b8;font-weight:800;letter-spacing:0.05em;text-transform:uppercase">Checklist editoriale</div>' +
          CHECKS.map(function (c) {
            return '<label class="es-gd-check"><input type="checkbox" data-gd-check="' + c.id + '"><span>' + esc(c.label) + '</span></label>';
          }).join('') +
          '<button type="button" class="es-gd-submit" id="es-gd-send"' + (verified ? '' : ' disabled') + '>Invia in approvazione</button>' +
          '<button type="button" class="es-gd-ghost" id="es-gd-draft">Salva bozza</button>' +
          (verified ? '' : '<p class="es-pd-empty">La pubblicazione è bloccata finché lo staff non convalida il badge stampa.</p>') +
        '</section>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:0.85rem">' +
        '<section class="es-pd-card es-pd-comply">' +
          '<div class="es-pd-card-header"><h2>Verifica &amp; compliance</h2>' +
          '<span class="es-pd-source-badge">' + (String(user.badgeVerificaStato || '') === 'approved' ? 'Validato' : 'Da completare') + '</span></div>' +
          comply +
        '</section>' +
        '<section class="es-pd-card">' +
          '<div class="es-pd-card-header"><h2>I miei contenuti</h2><span class="es-pd-source-badge">' + (mine.length ? mine.length : 'Vuoto') + '</span></div>' +
          (mine.length ? mine.slice(0, 12).map(itemCard).join('') : '<div class="es-pd-empty">Nessun pezzo in redazione. Il feed pubblico si popola dopo l\'approvazione dello staff.</div>') +
        '</section>' +
      '</div>' +

      '</div></div>';
  }

  function itemCard(it) {
    var note = it.staffNote ? '<p>Note staff: ' + esc(it.staffNote) + '</p>' : '';
    return '<article class="es-gd-item"><b>' + esc(it.title || 'Senza titolo') + '</b>' +
      '<p>' + esc((it.type === 'poll' ? 'Sondaggio' : it.type === 'video' ? 'Video' : 'Articolo') + ' · ' + geoText(it.geo)) + '</p>' +
      '<span class="es-gd-st is-' + esc(it.status || 'draft') + '">' + esc(statusLabel(it.status)) + '</span>' +
      note + '</article>';
  }

  function readComposer() {
    var level = (document.getElementById('es-gd-glevel') || {}).value || 'citta';
    var region = (document.getElementById('es-gd-greg') || {}).value || '';
    var province = (document.getElementById('es-gd-gprov') || {}).value || '';
    var city = ((document.getElementById('es-gd-gcity') || {}).value || '').trim();
    var pollRaw = ((document.getElementById('es-gd-poll') || {}).value || '');
    var checks = {};
    CHECKS.forEach(function (c) {
      var el = document.querySelector('[data-gd-check="' + c.id + '"]');
      checks[c.id] = !!(el && el.checked);
    });
    return {
      type: composerType,
      title: ((document.getElementById('es-gd-title') || {}).value || '').trim(),
      body: ((document.getElementById('es-gd-body') || {}).value || '').trim(),
      videoUrl: ((document.getElementById('es-gd-video') || {}).value || '').trim(),
      videoKind: ((document.getElementById('es-gd-vkind') || {}).value || 'pre'),
      tags: composerTags.slice(),
      geo: { level: level, region: region, province: province, city: city },
      pollOptions: pollRaw.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (t) {
        return { text: t, votes: 0 };
      }),
      checks: checks
    };
  }
  function allChecks(obj) {
    return CHECKS.every(function (c) { return obj && obj.checks && obj.checks[c.id]; });
  }
  function persistContent(asDraft) {
    var u = userObj();
    if (!isGiorn(u)) return;
    var data = readComposer();
    if (!data.title) {
      if (typeof window.showToast === 'function') window.showToast('Inserisci un titolo.', 'error');
      return;
    }
    if (data.type === 'poll' && data.pollOptions.length < 2) {
      if (typeof window.showToast === 'function') window.showToast('Il sondaggio richiede almeno due opzioni.', 'error');
      return;
    }
    if (data.type === 'video' && !data.videoUrl) {
      if (typeof window.showToast === 'function') window.showToast('Inserisci l\'URL del video.', 'error');
      return;
    }
    if (!asDraft && !isPressVerified(u)) {
      if (typeof window.showToast === 'function') window.showToast('Serve il badge Stampa / Giornalista Verificato.', 'error');
      return;
    }
    if (!asDraft && !allChecks(data)) {
      if (typeof window.showToast === 'function') window.showToast('Completa la checklist editoriale prima di inviare.', 'error');
      return;
    }
    var rows = loadItems();
    var item = {
      id: uid(),
      type: data.type,
      title: data.title,
      body: data.body,
      videoUrl: data.videoUrl,
      videoKind: data.videoKind,
      tags: data.tags,
      geo: data.geo,
      pollOptions: data.pollOptions,
      voters: {},
      checks: data.checks,
      authorEmail: emailOf(u),
      authorName: giornName(u),
      status: asDraft ? 'draft' : 'pending',
      staffNote: '',
      history: [{ at: nowIso(), by: emailOf(u), action: asDraft ? 'draft' : 'submit', note: '' }],
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    rows.unshift(item);
    saveItems(rows);
    if (typeof window.showToast === 'function') {
      window.showToast(asDraft ? 'Bozza salvata.' : 'Inviato. In attesa di approvazione dello staff.', 'success');
    }
    if (!asDraft) {
      try {
        if (window.EliseeUserNotifs) {
          window.EliseeUserNotifs.push({
            title: 'Contenuto in coda',
            body: '"' + item.title + '" è in attesa di approvazione.'
          }, u);
        }
      } catch (_) {}
    }
    composerTags = [];
    render(u);
  }

  function paintTags() {
    var box = document.getElementById('es-gd-tags');
    if (!box) return;
    box.innerHTML = composerTags.map(function (t, i) {
      return '<span class="es-gd-chip">' + esc(t.kind === 'club' ? 'Club' : 'Scheda') + ' · ' + esc(t.name) +
        ' <button type="button" data-gd-untag="' + i + '">×</button></span>';
    }).join('');
  }
  function syncGeoFields() {
    var level = (document.getElementById('es-gd-glevel') || {}).value || 'citta';
    var greg = document.getElementById('es-gd-greg-wrap');
    var gprov = document.getElementById('es-gd-gprov-wrap');
    var gcity = document.getElementById('es-gd-gcity-wrap');
    if (greg) greg.hidden = level === 'nazionale';
    if (gprov) gprov.hidden = level === 'nazionale' || level === 'regione';
    if (gcity) gcity.hidden = level !== 'citta';
  }
  function bindDash(host) {
    if (!host || host.dataset.gdBound === '1') return;
    host.dataset.gdBound = '1';
    host.addEventListener('click', function (e) {
      var rail = e.target.closest('[data-gd]');
      if (rail) {
        var k = rail.getAttribute('data-gd');
        if (k === 'home' && window.switchView) window.switchView('home', '#hero');
        if (k === 'feed') openFeed();
        if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
        if (k === 'edit') openEditModal(userObj());
        return;
      }
      var typ = e.target.closest('[data-gd-type]');
      if (typ) {
        composerType = typ.getAttribute('data-gd-type');
        host.querySelectorAll('[data-gd-type]').forEach(function (b) {
          b.classList.toggle('is-on', b === typ);
        });
        host.querySelectorAll('[data-gd-block]').forEach(function (el) {
          var need = el.getAttribute('data-gd-block');
          el.hidden = !(need === 'article' && composerType === 'article' || need === composerType);
        });
        return;
      }
      var un = e.target.closest('[data-gd-untag]');
      if (un) {
        composerTags.splice(parseInt(un.getAttribute('data-gd-untag'), 10) || 0, 1);
        paintTags();
        return;
      }
      var sug = e.target.closest('[data-gd-pick]');
      if (sug) {
        try {
          var t = JSON.parse(decodeURIComponent(sug.getAttribute('data-gd-pick') || ''));
          if (t && t.name && !composerTags.some(function (x) { return x.id === t.id && x.kind === t.kind; })) {
            composerTags.push(t);
            paintTags();
          }
        } catch (_) {}
        var box = document.getElementById('es-gd-suggest');
        if (box) box.hidden = true;
        return;
      }
      if (e.target.id === 'es-gd-send') persistContent(false);
      if (e.target.id === 'es-gd-draft') persistContent(true);
    });
    host.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'es-gd-tagq') {
        var hits = searchTags(e.target.value);
        var box = document.getElementById('es-gd-suggest');
        if (!box) return;
        if (!hits.length) { box.hidden = true; box.innerHTML = ''; return; }
        box.hidden = false;
        box.innerHTML = hits.map(function (t) {
          return '<button type="button" data-gd-pick="' + encodeURIComponent(JSON.stringify({ kind: t.kind, id: t.id, name: t.name })) + '">' +
            esc(t.name) + ' <span style="color:#94a3b8">' + esc(t.extra || t.kind) + '</span></button>';
        }).join('');
      }
    });
    host.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'es-gd-glevel') syncGeoFields();
      if (e.target && e.target.id === 'es-gd-greg') {
        var sel = document.getElementById('es-gd-gprov');
        if (sel) sel.innerHTML = provinceOptions(e.target.value, '');
      }
    });
  }

  function openEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head"><h2>Anagrafica giornalista</h2>' +
      '<button type="button" class="es-edit-modal-close">&times;</button></div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-gd-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-gd-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Testata / media</label><input id="es-gd-outlet" value="' + esc(user.pressOutlet || '') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio</label><textarea id="es-gd-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
      '</div><div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">Salva</button></div></div>';
    document.body.appendChild(backdrop);
    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      user.nome = document.getElementById('es-gd-nome').value.trim() || user.nome;
      user.cognome = document.getElementById('es-gd-cognome').value.trim() || user.cognome;
      user.pressOutlet = document.getElementById('es-gd-outlet').value.trim();
      user.bio = document.getElementById('es-gd-bio').value.trim();
      user.fullName = [user.nome, user.cognome].filter(Boolean).join(' ');
      try { localStorage.setItem('elisee_active_user', JSON.stringify(user)); } catch (_) {}
      close();
      if (typeof window.showToast === 'function') window.showToast('Anagrafica giornalista salvata.', 'success');
      render(user);
    });
  }

  function openTag(tag) {
    if (!tag) return;
    if (tag.kind === 'club') {
      if (typeof window.switchView === 'function') window.switchView('squadre', '#squadre-portal');
      if (typeof window.showToast === 'function') window.showToast('Scheda club: ' + tag.name, 'success');
      return;
    }
    if (typeof window.openScopriProfili === 'function') window.openScopriProfili('player');
    else if (typeof window.switchView === 'function') window.switchView('scopri', '#scopri-portal');
    if (typeof window.showToast === 'function') window.showToast('Scheda calciatore: ' + tag.name, 'success');
  }

  function feedCard(it) {
    var tags = (it.tags || []).map(function (t) {
      return '<button type="button" class="es-gd-chip" data-st-tag="' + encodeURIComponent(JSON.stringify({ kind: t.kind, id: t.id, name: t.name })) + '">' +
        esc(t.kind === 'club' ? 'Club' : 'Scheda') + ' · ' + esc(t.name) + '</button>';
    }).join(' ');
    var poll = '';
    if (it.type === 'poll' && it.pollOptions) {
      var total = it.pollOptions.reduce(function (a, o) { return a + (o.votes || 0); }, 0);
      poll = '<div class="es-st-poll">' + it.pollOptions.map(function (o, i) {
        var pct = total ? Math.round((o.votes || 0) * 100 / total) : 0;
        return '<button type="button" data-st-vote="' + esc(it.id) + '" data-st-opt="' + i + '">' + esc(o.text) +
          ' <span style="color:#38bdf8;float:right">' + pct + '% · ' + (o.votes || 0) + '</span></button>';
      }).join('') + '</div>';
    }
    var video = it.type === 'video' ? videoHtml(it.videoUrl) : '';
    var kind = it.type === 'poll' ? 'Sondaggio' : (it.type === 'video' ? 'Video' : 'Articolo');
    return '<article class="es-st-card">' +
      '<div class="es-st-meta">' + esc(kind) + ' · ' + esc(geoText(it.geo)) + ' · ' + esc(it.authorName || 'Redazione') +
      ' · ' + esc(fmtDate(it.createdAt)) + '</div>' +
      '<h3>' + esc(it.title) + '</h3>' +
      (it.body ? '<div class="es-st-body">' + esc(it.body) + '</div>' : '') +
      (tags ? '<div class="es-gd-tags" style="margin-top:0.7rem">' + tags + '</div>' : '') +
      poll + video +
      '</article>';
  }

  function renderFeed(host) {
    host = host || document.getElementById('stampa-portal');
    if (!host) return;
    var u = userObj();
    var q = ((document.getElementById('es-st-q') || {}).value || '').toLowerCase();
    var geo = ((document.getElementById('es-st-geo') || {}).value || '');
    var kind = ((document.getElementById('es-st-kind') || {}).value || '');
    var rows = loadItems().filter(function (it) { return it.status === 'approved'; });
    if (kind) rows = rows.filter(function (it) { return it.type === kind; });
    if (geo) rows = rows.filter(function (it) { return geoText(it.geo).toLowerCase().indexOf(geo.toLowerCase()) >= 0 || (it.geo && it.geo.level === geo); });
    if (q) rows = rows.filter(function (it) {
      return (it.title + ' ' + (it.body || '') + ' ' + (it.authorName || '')).toLowerCase().indexOf(q) >= 0;
    });
    var staffBtn = isStaffMod(u)
      ? '<button type="button" class="es-gd-ghost" style="width:auto;padding:0.45rem 0.9rem" id="es-st-open-mod">Pannello moderazione</button>'
      : '';
    var list = rows.length ? rows.map(feedCard).join('') : '<div class="es-st-empty">Nessun contenuto approvato. La redazione locale apparirà qui dopo il via libera dello staff.</div>';
    host.innerHTML = '<div class="es-st-wrap">' +
      '<p class="es-st-kicker">Elisee Scout</p>' +
      '<h1>Stampa locale</h1>' +
      '<p class="es-st-sub">Articoli, sondaggi e video del territorio. Clicca una scheda per aprire il calciatore o il club.</p>' +
      '<div class="es-st-toolbar">' +
      '<input id="es-st-q" placeholder="Cerca titolo, testo, autore" value="' + esc((document.getElementById('es-st-q') || {}).value || '') + '">' +
      '<select id="es-st-kind"><option value="">Tutti i formati</option><option value="article">Articoli</option><option value="poll">Sondaggi</option><option value="video">Video</option></select>' +
      '<select id="es-st-geo"><option value="">Copertura</option><option value="citta">Città</option><option value="provincia">Provincia</option><option value="regione">Regione</option><option value="nazionale">Nazionale</option></select>' +
      staffBtn +
      '</div>' + list + '</div>';
    var kEl = document.getElementById('es-st-kind');
    if (kEl) kEl.value = kind;
    var gEl = document.getElementById('es-st-geo');
    if (gEl) gEl.value = geo;
    if (!host.dataset.stBound) {
      host.dataset.stBound = '1';
      host.addEventListener('click', onFeedClick);
      host.addEventListener('change', function (e) {
        if (e.target && (e.target.id === 'es-st-kind' || e.target.id === 'es-st-geo')) renderFeed(host);
      });
      host.addEventListener('input', function (e) {
        if (e.target && e.target.id === 'es-st-q') renderFeed(host);
      });
    }
  }
  function onFeedClick(e) {
    if (e.target && e.target.id === 'es-st-open-mod') {
      openModeration();
      return;
    }
    var tag = e.target.closest('[data-st-tag]');
    if (tag) {
      try { openTag(JSON.parse(decodeURIComponent(tag.getAttribute('data-st-tag') || ''))); } catch (_) {}
      return;
    }
    var vote = e.target.closest('[data-st-vote]');
    if (vote) {
      votePoll(vote.getAttribute('data-st-vote'), parseInt(vote.getAttribute('data-st-opt'), 10) || 0);
    }
  }
  function votePoll(id, opt) {
    var u = userObj();
    var em = emailOf(u);
    if (!em) {
      if (typeof window.showToast === 'function') window.showToast('Accedi per votare il sondaggio.', 'error');
      return;
    }
    var rows = loadItems();
    var it = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) it = rows[i];
    if (!it || !it.pollOptions || !it.pollOptions[opt]) return;
    it.voters = it.voters || {};
    if (it.voters[em] != null) {
      if (typeof window.showToast === 'function') window.showToast('Hai già votato questo sondaggio.', 'error');
      return;
    }
    it.voters[em] = opt;
    it.pollOptions[opt].votes = (it.pollOptions[opt].votes || 0) + 1;
    it.updatedAt = nowIso();
    saveItems(rows);
    renderFeed();
  }

  function openModeration() {
    if (!isStaffMod()) {
      if (typeof window.showToast === 'function') window.showToast('La coda è riservata allo staff.', 'error');
      return;
    }
    var old = document.getElementById('es-st-mod');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.className = 'es-st-mod';
    wrap.id = 'es-st-mod';
    wrap.innerHTML = moderationHtml('pending');
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) wrap.remove();
      if (e.target && e.target.getAttribute('data-st-close') === '1') wrap.remove();
      var fil = e.target.closest('[data-st-filter]');
      if (fil) {
        wrap.innerHTML = moderationHtml(fil.getAttribute('data-st-filter'));
        return;
      }
      var ok = e.target.closest('[data-st-approve]');
      if (ok) decide(ok.getAttribute('data-st-approve'), 'approved', wrap);
      var no = e.target.closest('[data-st-reject]');
      if (no) decide(no.getAttribute('data-st-reject'), 'rejected', wrap);
    });
  }
  function moderationHtml(filter) {
    filter = filter || 'pending';
    var rows = loadItems().filter(function (it) {
      if (filter === 'all') return it.status !== 'draft';
      return it.status === filter;
    });
    var list = rows.length ? rows.map(function (it) {
      var hist = (it.history || []).map(function (h) {
        return esc(h.action) + ' · ' + esc(fmtDate(h.at));
      }).join(' · ');
      return '<article class="es-st-card">' +
        '<div class="es-st-meta">' + esc(statusLabel(it.status)) + ' · ' + esc(it.authorName) + ' · ' + esc(geoText(it.geo)) + '</div>' +
        '<h3>' + esc(it.title) + '</h3>' +
        (it.body ? '<div class="es-st-body">' + esc(it.body.slice(0, 420)) + '</div>' : '') +
        '<p class="es-st-meta">Tracciabilità: ' + (hist || 'invio iniziale') + '</p>' +
        CHECKS.map(function (c) {
          return '<label class="es-gd-check"><input type="checkbox" data-st-ck="' + esc(it.id) + '-' + c.id + '"><span>' + esc(c.label) + '</span></label>';
        }).join('') +
        '<textarea class="es-st-note" id="note-' + esc(it.id) + '" placeholder="Note per l\'autore (obbligatorie in caso di rifiuto)">' + esc(it.staffNote || '') + '</textarea>' +
        '<div class="es-st-mod-actions">' +
        '<button type="button" class="es-st-ok" data-st-approve="' + esc(it.id) + '">Approva</button>' +
        '<button type="button" class="es-st-no" data-st-reject="' + esc(it.id) + '">Rifiuta / revisione</button>' +
        '</div></article>';
    }).join('') : '<div class="es-st-empty">Nessun contenuto in questo stato.</div>';
    return '<div class="es-st-mod-sheet">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem">' +
      '<h2>Coda stampa</h2>' +
      '<button type="button" class="es-gd-ghost" style="width:auto" data-st-close="1">Chiudi</button></div>' +
      '<div class="es-gd-tabs" style="margin-top:0.6rem">' +
      '<button type="button" class="' + (filter === 'pending' ? 'is-on' : '') + '" data-st-filter="pending">In attesa</button>' +
      '<button type="button" class="' + (filter === 'approved' ? 'is-on' : '') + '" data-st-filter="approved">Approvati</button>' +
      '<button type="button" class="' + (filter === 'rejected' ? 'is-on' : '') + '" data-st-filter="rejected">Rifiutati</button>' +
      '<button type="button" class="' + (filter === 'all' ? 'is-on' : '') + '" data-st-filter="all">Storico</button>' +
      '</div>' + list + '</div>';
  }
  function decide(id, status, wrap) {
    var rows = loadItems();
    var it = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) it = rows[i];
    if (!it) return;
    var noteEl = document.getElementById('note-' + id);
    var note = noteEl ? noteEl.value.trim() : '';
    if (status === 'approved') {
      var missing = CHECKS.some(function (c) {
        var el = document.querySelector('[data-st-ck="' + id + '-' + c.id + '"]');
        return !(el && el.checked);
      });
      if (missing) {
        if (typeof window.showToast === 'function') window.showToast('Completa la checklist editoriale prima di approvare.', 'error');
        return;
      }
    }
    if (status === 'rejected' && !note) {
      if (typeof window.showToast === 'function') window.showToast('Scrivi il motivo del rifiuto o della revisione.', 'error');
      return;
    }
    var staff = userObj();
    it.status = status;
    it.staffNote = note;
    it.updatedAt = nowIso();
    it.history = it.history || [];
    it.history.push({ at: nowIso(), by: emailOf(staff) || 'staff', action: status, note: note });
    saveItems(rows);
    notifyAuthor(
      it,
      status === 'approved' ? 'Contenuto approvato' : 'Contenuto rifiutato',
      status === 'approved'
        ? '"' + it.title + '" è online nel feed Stampa.'
        : '"' + it.title + '" è stato rifiutato. Note: ' + note
    );
    if (typeof window.showToast === 'function') {
      window.showToast(status === 'approved' ? 'Pubblicato sul sito.' : 'Rifiuto inviato all\'autore.', 'success');
    }
    if (wrap) wrap.innerHTML = moderationHtml(status === 'approved' ? 'approved' : 'rejected');
    renderFeed();
  }

  function openFeed() {
    if (typeof window.switchView === 'function') window.switchView('stampa', '#stampa-portal');
    else renderFeed();
  }

  function render(user) {
    user = user || userObj();
    if (!isGiorn(user)) return;
    if (typeof window.unmountAllRoleDashboards === 'function') {
      try { window.unmountAllRoleDashboards('es-gd'); } catch (_) {}
    }
    var host = document.getElementById('es-giorn-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-gd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-gd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    composerType = 'article';
    composerTags = [];
    box.innerHTML = html(user);
    box.hidden = false;
    host.hidden = false;
    host.removeAttribute('hidden');
    host.classList.add('es-gd-on');
    if (group) {
      group.classList.add('is-gd-dash', 'is-giorn-area');
      group.classList.remove('is-player-area', 'is-staff-area', 'is-tifoso-area');
    }
    bindDash(host);
    syncGeoFields();
    loadClubs();
    try {
      if (window.EliseeRoleActions && window.EliseeRoleActions.mount) window.EliseeRoleActions.mount(user);
    } catch (_) {}
  }

  window.EliseeGiornDash = {
    render: render,
    isGiorn: isGiorn,
    isPressVerified: isPressVerified,
    openFeed: openFeed,
    openModeration: openModeration,
    renderFeed: renderFeed
  };
  window.openStampaFeed = openFeed;
  window.openStampaModerazione = openModeration;

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try { var u = userObj(); if (isGiorn(u)) render(u); } catch (_) {}
    }
    if (d && (d.view === 'stampa' || (d.hash && String(d.hash).indexOf('stampa') >= 0))) {
      loadClubs(function () { renderFeed(); });
    }
  });
})();
