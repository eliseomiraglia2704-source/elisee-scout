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
  function defaultSeedItems() {
    return [
      {
        id: 'st-seed-1',
        type: 'article',
        status: 'approved',
        authorName: 'Redazione Elisee Scout',
        authorEmail: 'stampa@elisee-scout.it',
        title: 'Focus Calciomercato Dilettanti & Serie D: i giovani emergenti del Sud e Nord Italia',
        body: 'Inizio di stagione entusiasmante sui campi della Serie D e dei massimi campionati regionali di Eccellenza. Cresce l’attenzione dei Direttori Sportivi e degli Osservatori sui fuoriquota classe 2005, 2006 e 2007 che stanno trascinando le rispettive squadre. Ecco l’analisi tattica e i dati prestazionali elaborati dalla piattaforma.',
        geo: { level: 'nazionale', value: 'Italia' },
        tags: [
          { kind: 'club', id: 'cl-foggia', name: 'Calcio Foggia 1920' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'st-seed-2',
        type: 'poll',
        status: 'approved',
        authorName: 'Eliseo Miraglia (Editoriale Sportivo)',
        authorEmail: 'eliseomiraglia2704@gmail.com',
        title: 'Sondaggio: Quale girone di Serie D esprimerà il maggior numero di talenti per il professionismo?',
        body: 'Vota il girone più competitivo e tecnico della stagione secondo la tua visione di scouting.',
        geo: { level: 'nazionale', value: 'Italia' },
        pollOptions: [
          { text: 'Girone H (Puglia, Campania, Basilicata)', votes: 98 },
          { text: 'Girone D (Emilia-Romagna, Toscana, Lombardia)', votes: 74 },
          { text: 'Girone I (Sicilia, Calabria, Campania)', votes: 63 },
          { text: 'Girone A/B (Piemonte, Liguria, Lombardia)', votes: 55 }
        ],
        tags: [
          { kind: 'club', id: 'cl-serie-d', name: 'Serie D Italia' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
      },
      {
        id: 'st-seed-3',
        type: 'article',
        status: 'approved',
        authorName: 'Ufficio Stampa & Scouting Territoriale',
        authorEmail: 'scout.territorio@elisee-scout.it',
        title: 'Guida al Tesseramento Fuoriquota, Premi di Preparazione e Svincoli',
        body: 'Tutto quello che c’è da sapere sulle finestre di trasferimento, le tutele legali per calciatori dilettanti e l’utilizzo dell’IA per il matching tra società e atleti svincolati.',
        geo: { level: 'regione', value: 'Puglia' },
        tags: [],
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ];
  }

  function loadItems() {
    try {
      var rows = JSON.parse(localStorage.getItem(STORE) || '[]');
      if (Array.isArray(rows) && rows.length > 0) return rows;
      var seeds = defaultSeedItems();
      saveItems(seeds);
      return seeds;
    } catch (_) { return defaultSeedItems(); }
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
    box.removeAttribute('hidden');
    box.style.display = 'block';
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

  var activeMacroTab = 'rassegna'; // 'rassegna' | 'ufficiostampa'
  var activeCategory = 'all'; // 'all' | 'mercato' | 'club' | 'giovanile' | 'riforma' | 'competizioni'
  var rassegnaSearchQ = '';

  var RASSEGNA_ITEMS = [
    {
      id: 'rs-1',
      category: 'mercato',
      categoryLabel: 'Mercato',
      title: 'Serie D & Eccellenza: i fuoriquota più richiesti e le strategie di mercato',
      excerpt: 'Riflettori puntati sui migliori prospetti under classe 2005, 2006 e 2007. I Direttori Sportivi monitorano costantemente il rendimento atletico e i report di scouting per i trasferimenti stagionali.',
      source: 'Sky Sport Calcio',
      sourceUrl: 'https://sport.sky.it/calcio',
      date: '07 Set 2026',
      tag: { kind: 'club', id: 'cl-foggia', name: 'Calcio Foggia 1920' }
    },
    {
      id: 'rs-2',
      category: 'riforma',
      categoryLabel: 'Riforma dello Sport',
      title: 'Lavoro Sportivo nei Dilettanti: vademecum operativo su contratti, tutele e compensi',
      excerpt: 'Pubblicate le circolari applicative per atleti, istruttori e collaboratori gestionali: tutte le disposizioni su premi di preparazione, svincoli e semplificazioni telematiche.',
      source: 'FIGC / LND Ufficiale',
      sourceUrl: 'https://www.lnd.it',
      date: '06 Set 2026',
      tag: null
    },
    {
      id: 'rs-3',
      category: 'giovanile',
      categoryLabel: 'Settore Giovanile',
      title: 'Juniores e Under 17: la crescita dei vivai italiani e l\'impatto dei dati GPS',
      excerpt: 'L\'analisi dei campionati giovanili evidenzia un incremento dell\'intensità di gioco e un utilizzo capillare della match analysis per la prevenzione e la crescita tecnica dei talenti.',
      source: 'Notiziario del Calcio',
      sourceUrl: 'https://www.notiziariocalcio.com',
      date: '05 Set 2026',
      tag: null
    },
    {
      id: 'rs-4',
      category: 'club',
      categoryLabel: 'Club',
      title: 'Modelli di Gestione Sostenibile: digitalizzazione e strutture nei campionati regionali',
      excerpt: 'Focus sulle società virtuose che investono nell\'innovazione e nella valorizzazione del territorio per garantire continuità sportiva ed equilibrio economico.',
      source: 'Calcio e Finanza',
      sourceUrl: 'https://www.calcioefinanza.it',
      date: '04 Set 2026',
      tag: { kind: 'club', id: 'cl-serie-d', name: 'Lega Nazionale Dilettanti' }
    },
    {
      id: 'rs-5',
      category: 'competizioni',
      categoryLabel: 'Competizioni',
      title: 'Coppa Italia e Campionati Nazionali: regolamenti, date chiave e format promozioni',
      excerpt: 'Definito il quadro della fase a eliminazione diretta e i criteri di accesso agli spareggi promozione tra le prime classificate dei massimi tornei dilettantistici.',
      source: 'La Gazzetta dello Sport',
      sourceUrl: 'https://www.gazzetta.it/Calcio',
      date: '03 Set 2026',
      tag: null
    },
    {
      id: 'rs-6',
      category: 'mercato',
      categoryLabel: 'Mercato',
      title: 'Trattative e Secret List: come gli scout professionisti scovano talenti nei dilettanti',
      excerpt: 'Il passaggio dal calcio regionale ai campionati professionistici: interviste ai responsabili scouting sull\'impiego di dossier digitali e video analitici.',
      source: 'TuttoCampo.it',
      sourceUrl: 'https://www.tuttocampo.it',
      date: '02 Set 2026',
      tag: null
    }
  ];

  var COMUNICATI_UFFICIALI = [
    {
      id: 'com-04',
      date: '05 SET 2026',
      title: 'Comunicato Ufficiale N. 04/2026 — Rilascio Elisee Scout v3.0 e Rete Anti-Fake',
      text: 'Presentazione ufficiale della release di produzione della piattaforma: integrati 3.130 agenti IA, dossier verificati con verifica dell\'identità a doppio fattore e conformità GDPR Art. 22.',
      docTitle: 'Scarica PDF (240 KB)'
    },
    {
      id: 'com-03',
      date: '28 AGO 2026',
      title: 'Comunicato Ufficiale N. 03/2026 — Protocollo di Digitalizzazione Calcio Territoriale',
      text: 'Accordo per la standardizzazione dei report prestazionali GPS e delle schede tecniche condivise per club di Serie D, Eccellenza e Promozione.',
      docTitle: 'Scarica PDF (180 KB)'
    },
    {
      id: 'com-02',
      date: '15 AGO 2026',
      title: 'Comunicato Ufficiale N. 02/2026 — Linee Guida per il Trattamento Dati Biometrici',
      text: 'Approvato il documento programmatico sulla tutela dei dati sanitari, atletici e delle metriche video con crittografia end-to-end e chat referente privacy.',
      docTitle: 'Scarica PDF (310 KB)'
    },
    {
      id: 'com-01',
      date: '01 AGO 2026',
      title: 'Comunicato Ufficiale N. 01/2026 — Apertura Accreditamenti Stampa e Media Kit 2026/27',
      text: 'Attivazione del desk giornalisti con rilascio del pacchetto di asset grafici ufficiali, linee guida brand e canali dedicati per interviste.',
      docTitle: 'Scarica PDF (150 KB)'
    }
  ];

  var MEDIA_KIT_ITEMS = [
    {
      id: 'mk-1',
      icon: '🎨',
      title: 'Loghi Ufficiali & Brand Asset',
      desc: 'Pacchetto loghi vettoriali SVG, versioni Dark e Light in PNG ad altissima risoluzione con trasparenza e favicon ufficiali.',
      meta: 'ZIP · 2.4 MB',
      file: 'immagini/logo/logo-site.png'
    },
    {
      id: 'mk-2',
      icon: '📱',
      title: 'Screenshot UI & Mockup HD',
      desc: 'Catture in risoluzione 4K dell\'interfaccia: dashboard scouting, bacheca annunci di reclutamento e dossier analitico calciatore.',
      meta: 'ZIP · 8.1 MB',
      file: 'immagini/01-home-hero/hero-workspace.jpg'
    },
    {
      id: 'mk-3',
      icon: '📄',
      title: 'Executive One-Pager & Factsheet',
      desc: 'Presentazione corporate in formato PDF: metriche di piattaforma, 3.130 agenti IA, copertura dei campionati e standard di sicurezza.',
      meta: 'PDF · 1.2 MB',
      file: '#'
    },
    {
      id: 'mk-4',
      icon: '📘',
      title: 'Brand & Editorial Guidelines',
      desc: 'Linee guida d\'uso del marchio, palette colori ufficiali (HEX/Pantone), tipografia Outfit/Inter e regole di attribuzione stampa.',
      meta: 'PDF · 950 KB',
      file: '#'
    }
  ];

  function renderRassegnaCards(items) {
    if (!items || items.length === 0) {
      return '<div class="es-empty is-active es-st-empty" id="articles-empty">' +
        '<h3>Nessun articolo corrisponde alla ricerca</h3>' +
        '<p>Prova a rimuovere il filtro categoria o a usare una parola chiave diversa.</p>' +
        '</div>';
    }
    return items.map(function (it) {
      var catClass = 'cat-' + (it.category || 'mercato');
      var tagHtml = '';
      if (it.tag && it.tag.name && it.tag.kind === 'club') {
        tagHtml = '<span class="es-article__internal-link">' +
          'Club · ' + esc(it.tag.name) + '</span>';
      }
      return '<article class="es-st-card">' +
        '<div class="es-st-card-top">' +
        '<span class="es-st-badge-cat ' + esc(catClass) + '">' + esc(it.categoryLabel || it.category) + '</span>' +
        '<span class="es-st-card-date">' + esc(it.date) + '</span>' +
        '</div>' +
        '<h3>' + esc(it.title) + '</h3>' +
        '<p class="es-st-excerpt">' + esc(it.excerpt) + '</p>' +
        '<div class="es-st-card-footer">' +
        '<span class="es-st-source-badge">' +
        esc(it.source) +
        '</span>' +
        tagHtml +
        '<a href="' + esc(it.sourceUrl) + '" target="_blank" rel="noopener noreferrer" class="es-st-read-more" title="Apri l\'articolo originale su ' + esc(it.source) + '">' +
        'Leggi tutto ↗' +
        '</a>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function renderUfficioStampaHTML() {
    // Blocco 1: Comunicati Ufficiali (stile Chi siamo con divisori)
    var comHtml = COMUNICATI_UFFICIALI.map(function (c) {
      return '<div class="es-us-release-row">' +
        '<div><span class="es-us-date-pill">' + esc(c.date) + '</span></div>' +
        '<div class="es-us-release-content">' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<p>' + esc(c.text) + '</p>' +
        '</div>' +
        '<div class="es-us-release-action">' +
        '<button type="button" class="es-us-btn-doc" onclick="if(window.showToast)window.showToast(\'Download comunicato: ' + esc(c.title).replace(/'/g, "\\'") + '\', \'info\');">' +
        '📄 ' + esc(c.docTitle) + '</button>' +
        '</div>' +
        '</div>';
    }).join('');

    // Blocco 2: Media Kit (griglia card)
    var kitHtml = MEDIA_KIT_ITEMS.map(function (m) {
      return '<div class="es-us-kit-card">' +
        '<div class="es-us-kit-icon-wrap">' + m.icon + '</div>' +
        '<h4>' + esc(m.title) + '</h4>' +
        '<p>' + esc(m.desc) + '</p>' +
        '<div class="es-us-kit-meta">' +
        '<span>' + esc(m.meta) + '</span>' +
        '<span style="color:#38bdf8;">Pronto al download</span>' +
        '</div>' +
        '<a href="' + esc(m.file) + '" download class="es-us-btn-download" onclick="if(window.showToast)window.showToast(\'Download avviato: ' + esc(m.title).replace(/'/g, "\\'") + '\', \'success\');">' +
        '⬇ Scarica Asset' +
        '</a>' +
        '</div>';
    }).join('');

    // Blocco 3: Contatti Stampa (blocco unico)
    var contactHtml = '<div class="es-us-contact-box">' +
      '<div style="border-bottom:1px solid rgba(56,189,248,0.2); padding-bottom:0.85rem;">' +
      '<span class="es-st-kicker">Relazioni Esterne & Accrediti</span>' +
      '<h3 style="margin:0.25rem 0 0; color:#fff; font-size:1.35rem; font-weight:800;">Desk Stampa & Media Relations</h3>' +
      '<p style="margin:0.35rem 0 0; color:#94a3b8; font-size:0.88rem;">Canale riservato a giornalisti, testate sportive, redazioni TV e content creator accreditati.</p>' +
      '</div>' +
      '<div class="es-us-contact-grid">' +
      '<div class="es-us-contact-item">' +
      '<span class="es-us-contact-label">Email Ufficio Stampa</span>' +
      '<div class="es-us-email-row">' +
      '<a href="mailto:elisee.scout@platform-calcio.it" style="color:#38bdf8; text-decoration:none; font-weight:700; font-size:0.95rem;">elisee.scout@platform-calcio.it</a>' +
      '<button type="button" class="es-us-copy-btn" onclick="navigator.clipboard.writeText(\'elisee.scout@platform-calcio.it\'); if(window.showToast)window.showToast(\'Email stampa copiata negli appunti!\', \'success\');">Copia</button>' +
      '</div>' +
      '<span class="es-us-contact-sub">Canale prioritario per comunicazioni e rettifiche</span>' +
      '</div>' +
      '<div class="es-us-contact-item">' +
      '<span class="es-us-contact-label">Tempi di Risposta</span>' +
      '<span class="es-us-contact-val">Entro 4-6 ore</span>' +
      '<span class="es-us-contact-sub">Garantiti per redazioni e testate registrate</span>' +
      '</div>' +
      '<div class="es-us-contact-item">' +
      '<span class="es-us-contact-label">Sede & Desk Operativo</span>' +
      '<span class="es-us-contact-val">Italia (Roma / Foggia / Milano)</span>' +
      '<span class="es-us-contact-sub">Desk digitale H24 per comunicati e materiali</span>' +
      '</div>' +
      '<div class="es-us-contact-item">' +
      '<span class="es-us-contact-label">Richiesta Interviste & Dati</span>' +
      '<a href="mailto:elisee.scout@platform-calcio.it?subject=Richiesta%20Intervista%20/%20Dati%20Scouting" class="es-us-btn-download" style="margin-top:0.2rem; text-align:center;">' +
      '✉ Richiedi Intervista o Dati' +
      '</a>' +
      '</div>' +
      '</div>' +
      '</div>';

    return '<div class="es-us-block">' +
      '<div class="es-us-block-head">' +
      '<h2><span>📜</span> Comunicati Ufficiali</h2>' +
      '<p>Documenti e note istituzionali rilasciate da Elisee Scout</p>' +
      '</div>' +
      '<div class="es-us-releases-list">' + comHtml + '</div>' +
      '</div>' +
      '<div class="es-us-block">' +
      '<div class="es-us-block-head">' +
      '<h2><span>📦</span> Media Kit Ufficiale</h2>' +
      '<p>Asset grafici, presentazioni aziendali e linee guida brand per la stampa</p>' +
      '</div>' +
      '<div class="es-us-kit-grid">' + kitHtml + '</div>' +
      '</div>' +
      '<div class="es-us-block" style="margin-bottom:0;">' +
      '<div class="es-us-block-head">' +
      '<h2><span>📞</span> Contatti Stampa</h2>' +
      '<p>Canali diretti per giornalisti, redazioni e media partner</p>' +
      '</div>' +
      contactHtml +
      '</div>';
  }

  function renderFeed(host) {
    host = host || document.getElementById('stampa-portal');
    if (!host) return;

    var filteredRassegna = RASSEGNA_ITEMS.slice();
    if (activeCategory && activeCategory !== 'all') {
      filteredRassegna = filteredRassegna.filter(function (it) {
        return it.category === activeCategory;
      });
    }
    if (rassegnaSearchQ) {
      var sq = rassegnaSearchQ.toLowerCase();
      filteredRassegna = filteredRassegna.filter(function (it) {
        return (it.title + ' ' + it.excerpt + ' ' + it.source + ' ' + (it.categoryLabel || '')).toLowerCase().indexOf(sq) >= 0;
      });
    }

    var macroTabsHtml = '<div class="es-stampa-nav-wrap">' +
      '<div class="es-stampa-nav" role="tablist">' +
      '<button type="button" class="es-stampa-tab ' + (activeMacroTab === 'rassegna' ? 'is-active' : '') + '" data-st-macro="rassegna">' +
      'Rassegna Stampa' +
      '</button>' +
      '<button type="button" class="es-stampa-tab ' + (activeMacroTab === 'ufficiostampa' ? 'is-active' : '') + '" data-st-macro="ufficiostampa">' +
      'Ufficio Stampa & Media Kit' +
      '</button>' +
      '</div>' +
      '</div>';

    var bodyContent = '';
    if (activeMacroTab === 'rassegna') {
      bodyContent = '<div class="es-st-toolbar-row">' +
        '<div class="es-st-search-bar">' +
        '<span style="color:#38bdf8; margin-right:0.45rem; font-size:1rem;">🔍</span>' +
        '<input type="text" id="es-st-search-input" placeholder="Cerca nella rassegna stampa per titolo, parola chiave o fonte..." value="' + esc(rassegnaSearchQ) + '" autocomplete="off">' +
        '</div>' +
        '<div class="es-st-category-pills">' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'all' ? 'is-active' : '') + '" data-st-cat="all">Tutte le notizie</button>' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'mercato' ? 'is-active' : '') + '" data-st-cat="mercato">Mercato</button>' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'club' ? 'is-active' : '') + '" data-st-cat="club">Club</button>' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'giovanile' ? 'is-active' : '') + '" data-st-cat="giovanile">Settore giovanile</button>' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'riforma' ? 'is-active' : '') + '" data-st-cat="riforma">Riforma dello Sport</button>' +
        '<button type="button" class="es-st-cat-btn ' + (activeCategory === 'competizioni' ? 'is-active' : '') + '" data-st-cat="competizioni">Competizioni</button>' +
        '</div>' +
        '</div>' +
        '<div class="es-st-grid">' + renderRassegnaCards(filteredRassegna) + '</div>' +
        '<div class="es-st-copyright-notice">' +
        '<strong>Nota sul Copyright Editoriale</strong>: La rassegna stampa aggrega estratti brevi a scopo informativo nel rispetto dei diritti editoriali, rimandando con link diretto alla fonte originale.' +
        '</div>';
    } else {
      bodyContent = renderUfficioStampaHTML();
    }

    host.innerHTML = '<div class="es-st-wrap">' +
      '<div class="es-st-header">' +
      '<span class="es-st-kicker">Elisee Scout · Media Room</span>' +
      '<h1>Area Stampa & Comunicazione</h1>' +
      '<p class="es-st-sub">Rassegna di attualità calcistica per utenti e desk ufficiale con comunicati, media kit e contatti per le redazioni.</p>' +
      macroTabsHtml +
      '</div>' +
      bodyContent +
      '</div>';

    if (!host.dataset.stBound) {
      host.dataset.stBound = '1';
      host.addEventListener('click', onFeedClick);
      host.addEventListener('input', function (e) {
        if (e.target && e.target.id === 'es-st-search-input') {
          rassegnaSearchQ = e.target.value;
          renderFeed(host);
          var newInput = document.getElementById('es-st-search-input');
          if (newInput) {
            newInput.focus();
            newInput.setSelectionRange(newInput.value.length, newInput.value.length);
          }
        }
      });
    }
  }

  function onFeedClick(e) {
    var macroBtn = e.target.closest('[data-st-macro]');
    if (macroBtn) {
      activeMacroTab = macroBtn.getAttribute('data-st-macro') || 'rassegna';
      renderFeed();
      return;
    }

    var catBtn = e.target.closest('[data-st-cat]');
    if (catBtn) {
      activeCategory = catBtn.getAttribute('data-st-cat') || 'all';
      renderFeed();
      return;
    }

    var tag = e.target.closest('[data-st-tag]');
    if (tag) {
      try { openTag(JSON.parse(decodeURIComponent(tag.getAttribute('data-st-tag') || ''))); } catch (_) {}
      return;
    }
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
    box.removeAttribute('hidden');
    box.style.display = 'block';
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
