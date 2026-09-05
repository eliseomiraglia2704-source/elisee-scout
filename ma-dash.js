/* Dashboard Match Analyst */
(function () {
  var AXES = [
    'Analisi Pre-Partita', 'Analisi Video', 'Report Statistici', 'Scouting Avversari',
    'Pattern Tattici', 'Supporto Staff Tecnico', 'Precisione Dati', 'Tempestività Consegna'
  ];
  var V2025 = [88, 92, 90, 94, 85, 93, 87, 91];
  var V2023 = [74, 78, 76, 80, 70, 81, 73, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isMa(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/\bosservatore\b/.test(blob) && !/match analyst|video analyst/.test(blob)) return false;
    return /match analyst|video analyst/.test(blob);
  }
  function maName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Match Analyst';
  }
  function initials(name) {
    var p = String(name || 'MA').trim().split(/\s+/);
    return ((p[0] || 'M').charAt(0) + (p[1] || p[0] || 'A').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }
  function polar(cx, cy, r, i, n, val) {
    var a = (-Math.PI / 2) + (i * 2 * Math.PI / n);
    var rr = r * (val / 100);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  }
  function poly(cx, cy, r, vals) {
    return vals.map(function (v, i) {
      var p = polar(cx, cy, r, i, vals.length, v);
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
  }
  function wedge(cx, cy, r, start, end, color) {
    var n = 24;
    var pts = [[cx, cy]];
    for (var i = 0; i <= n; i++) {
      var t = start + (end - start) * (i / n);
      pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    return '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z" fill="' + color + '" />';
  }
  function radarSvg() {
    var cx = 220, cy = 210, r = 150, n = AXES.length;
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi attività di match analysis">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(74,222,128,0.16)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(248,113,113,0.18)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(250,204,21,0.16)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(56,189,248,0.16)');
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.2)"/>';
      var lab = polar(cx, cy, r + 26, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="9">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.12)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }
  function spark(values, color) {
    var w = 120, h = 36, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var pts = values.map(function (v, i) {
      var x = (i / (values.length - 1)) * w;
      var y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="36"><polyline fill="none" stroke="' +
      color + '" stroke-width="2" points="' + pts + '"/></svg>';
  }
  function trendSvg() {
    var series = {
      '2023': [60, 66, 70, 72, 76, 80],
      '2024': [72, 76, 80, 84, 87, 90],
      '2025': [80, 84, 88, 91, 94, 97]
    };
    var cols = { '2023': '#38bdf8', '2024': '#4ade80', '2025': '#facc15' };
    var w = 240, h = 90;
    var html = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="90">';
    Object.keys(series).forEach(function (k) {
      var vals = series[k];
      var pts = vals.map(function (v, i) {
        return ((i / 5) * (w - 8) + 4).toFixed(1) + ',' + (h - 8 - (v / 100) * (h - 16)).toFixed(1);
      }).join(' ');
      html += '<polyline fill="none" stroke="' + cols[k] + '" stroke-width="2" points="' + pts + '"/>';
    });
    html += '</svg>';
    return html;
  }
  function ico(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
  }
  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === "function") {
      window.unmountAllRoleDashboards('es-mad');
    }
  }

  var QUALS = [
    'Match Analyst Video/Dati APF',
    'Corso FIGC Match Analysis',
    'Certificato SVideo-Analysis'
  ];
  var LAB_KEY = 'elisee_ma_lab_v1';
  var INBOX_KEY = 'elisee_ma_staff_inbox_v1';
  var TAGS_KEY = 'elisee_ma_card_tags_v1';
  var FEED_KEY = 'elisee_ma_public_feed_v1';

  function meKey() {
    var u = userObj();
    return String(u.email || u.id || u.username || '').trim().toLowerCase();
  }
  function slug(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
  }
  function loadMap(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveMap(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (_) {}
  }
  function inStaff(u) {
    u = u || userObj();
    var st = String(u.maContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'indipendente') return false;
    if (st === 'staff' || st === 'contract' || st === 'under-contract') return true;
    return !!(u.squadra || u.club);
  }
  function qualificaOf(u) {
    return String((u && (u.maQualifica || u.qualificaMa || u.certificazione)) || '').trim();
  }
  function loadLab() {
    try { return JSON.parse(localStorage.getItem(LAB_KEY) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveLab(obj) {
    try { localStorage.setItem(LAB_KEY, JSON.stringify(obj)); } catch (_) {}
  }
  function myLab() {
    var all = loadLab();
    var k = meKey() || '_guest';
    if (!all[k]) all[k] = { reports: [], heatmaps: [], gps: [], clips: [], tags: [] };
    ['reports', 'heatmaps', 'gps', 'clips', 'tags'].forEach(function (f) {
      if (!Array.isArray(all[k][f])) all[k][f] = [];
    });
    return all[k];
  }
  function persistLab(lab) {
    var all = loadLab();
    all[meKey() || '_guest'] = lab;
    saveLab(all);
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }
  function inboxForClub(club) {
    if (!String(club || '').trim()) return [];
    var map = loadMap(INBOX_KEY);
    var k = slug(club);
    return (map[k] && Array.isArray(map[k].items)) ? map[k].items : [];
  }
  function pushInbox(item) {
    var u = userObj();
    var club = String(u.squadra || u.club || '').trim();
    if (!club) return false;
    var map = loadMap(INBOX_KEY);
    var k = slug(club);
    if (!map[k] || !Array.isArray(map[k].items)) map[k] = { items: [] };
    map[k].items.unshift(item);
    map[k].updatedAt = new Date().toISOString();
    saveMap(INBOX_KEY, map);
    return true;
  }
  function tagsForPlayer(name) {
    var map = loadMap(TAGS_KEY);
    return map[slug(name)] || { badges: [], mention: null, adaptedRole: '', clips: [] };
  }
  function savePlayerTag(name, patch) {
    if (!name) return;
    var map = loadMap(TAGS_KEY);
    var k = slug(name);
    var cur = map[k] || { badges: [], mention: null, adaptedRole: '', clips: [] };
    if (patch.badge) {
      cur.badges = Array.isArray(cur.badges) ? cur.badges : [];
      cur.badges.unshift(patch.badge);
      cur.badges = cur.badges.slice(0, 8);
    }
    if (patch.mention) cur.mention = patch.mention;
    if (patch.adaptedRole) cur.adaptedRole = patch.adaptedRole;
    if (patch.clip) {
      cur.clips = Array.isArray(cur.clips) ? cur.clips : [];
      cur.clips.unshift(patch.clip);
      cur.clips = cur.clips.slice(0, 8);
    }
    map[k] = cur;
    saveMap(TAGS_KEY, map);
  }
  function pushPublic(item) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(FEED_KEY) || '[]') || []; } catch (_) { list = []; }
    if (!Array.isArray(list)) list = [];
    list.unshift(item);
    try { localStorage.setItem(FEED_KEY, JSON.stringify(list.slice(0, 40))); } catch (_) {}
  }
  function publicFeed() {
    try {
      var list = JSON.parse(localStorage.getItem(FEED_KEY) || '[]') || [];
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  }
  function overlayPitch(heatmaps) {
    var colors = ['#38bdf8', '#facc15', '#4ade80', '#f472b6', '#fb923c'];
    var html = '<svg class="es-ma-pitch" viewBox="0 0 360 220" role="img" aria-label="Sovrapposizione heatmap di squadra">';
    html += '<rect width="360" height="220" rx="8" fill="#166534"/>';
    html += '<rect x="8" y="8" width="344" height="204" fill="none" stroke="#ecfdf5" stroke-width="1.5"/>';
    html += '<line x1="180" y1="8" x2="180" y2="212" stroke="#ecfdf5" stroke-width="1"/>';
    html += '<circle cx="180" cy="110" r="28" fill="none" stroke="#ecfdf5"/>';
    html += '<rect x="8" y="70" width="36" height="80" fill="none" stroke="#ecfdf5"/>';
    html += '<rect x="316" y="70" width="36" height="80" fill="none" stroke="#ecfdf5"/>';
    var items = (heatmaps || []).filter(function (h) { return !h.overlay; }).slice(0, 5);
    if (!items.length) {
      html += '<ellipse cx="70" cy="110" rx="48" ry="70" fill="rgba(56,189,248,0.28)"/>';
      html += '<ellipse cx="180" cy="110" rx="40" ry="55" fill="rgba(250,204,21,0.22)"/>';
      html += '<ellipse cx="290" cy="110" rx="48" ry="70" fill="rgba(74,222,128,0.28)"/>';
    } else {
      items.forEach(function (h, i) {
        var col = colors[i % colors.length];
        var x = 70 + (i * 52) % 220;
        var y = 80 + (i % 3) * 28;
        html += '<ellipse cx="' + x + '" cy="' + y + '" rx="50" ry="44" fill="' + col + '" opacity="0.34"/>';
      });
    }
    html += '</svg>';
    return html;
  }
  function kindLabel(kind) {
    var raw = String(kind || '').trim();
    var k = raw.toLowerCase();
    if (k === 'focus') return 'Focus tattico';
    if (k === 'pillola') return 'Pillola tattica';
    if (k === 'avversario') return 'Studio avversario';
    if (k === 'gps') return 'GPS / carico';
    if (k === 'post-gara' || k === 'postgara' || k === 'post gara') return 'Post-gara';
    return raw;
  }

  function html(user) {
    var rec = (myLab().reports || []).slice(0, 8).map(function (r) {
      return { a: r.title, b: kindLabel(r.kind) || r.kind, c: r.channel === 'public' ? 'Pubblico' : 'Privato' };
    });
    if (!window.EliseeDashReal || typeof window.EliseeDashReal.shell !== 'function') {
      return '<div class="es-pd-empty">Dashboard Match Analyst non disponibile.</div>';
    }
    return window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Match Analyst',
      roleLabel: 'Match analyst',
      attr: 'ma',
      extraRail: '',
      radarTitle: 'Quadro tattico',
      workTitle: 'Laboratorio dati',
      workEmpty: 'Heatmap, GPS e clip si popolano dal laboratorio sotto.',
      registroTitle: 'Registro analisi',
      registroHeaders: ['Report', 'Tipo', 'Canale'],
      records: rec
    });
  }

  function extraHtml(user) {
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user) || 'Da indicare';
    var statusLbl = on ? 'In Staff Club' : 'Free Agent';
    var statusSub = on
      ? (club ? ('Collegato a ' + club + ' · Allenatore Capo e DS') : 'Staff tecnico del club')
      : 'Match Analyst Indipendente / Consulente Esterno';
    var lab = myLab();
    var reps = (lab.reports || []).slice(0, 6);
    var clips = (lab.clips || []).slice(0, 4);
    var heat = (lab.heatmaps || []).filter(function (h) { return !h.overlay; }).slice(0, 4);
    var gps = (lab.gps || []).slice(0, 4);
    var tags = (lab.tags || []).slice(0, 4);
    function lis(arr, emptyMsg) {
      if (!arr.length) return emptyMsg ? '<p class="es-ma-lead">' + emptyMsg + '</p>' : '';
      return '<ul class="es-ma-list">' + arr.map(function (x) {
        var chSafe = String(x.channel || '').toLowerCase() === 'public' ? 'public' : (x.channel ? 'private' : '');
        var ch = chSafe ? '<span class="es-ma-ch is-' + chSafe + '">' + (chSafe === 'public' ? 'Pubblico' : 'Privato') + '</span> ' : '';
        var label = (x.player && x.title) ? (x.player + ' · ' + x.title) : (x.title || x.player || x.tag || '');
        var sub = x.note || kindLabel(x.kind) || '';
        if (sub && label && sub === x.title) sub = '';
        return '<li>' + ch + '<b>' + esc(label) + '</b>' + (sub && sub !== label ? ' — ' + esc(sub) : '') + '</li>';
      }).join('') + '</ul>';
    }
    return '<div class="es-ma-extra">' +
      '<section class="es-pd-card es-ma-id">' +
        '<div class="es-pd-card-header"><h2>Identità, staff &amp; personal branding</h2>' +
        '<span class="es-ma-badge ' + (on ? 'is-on' : 'is-free') + '">' + esc(statusLbl) + '</span></div>' +
        '<p class="es-ma-lead">Credenziali professionali, specializzazione e legame con lo staff tecnico. I report pubblici alimentano il portfolio.</p>' +
        '<div class="es-ma-id-grid">' +
          '<div class="es-pd-ok"><span>Nome e cognome</span><b>' + esc(maName(user)) + '</b></div>' +
          '<div class="es-pd-ok"><span>Qualifica / certificazione</span><b>' + esc(qual) + '</b></div>' +
          '<div class="es-pd-ok"><span>Status contrattuale</span><b>' + esc(statusSub) + '</b></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-ma-perm">' +
        '<div class="es-pd-card-header"><h2>Attività e permessi</h2></div>' +
        '<ul class="es-ma-list">' +
          '<li><b>Inoltro report</b> — analisi all’Allenatore (sedute) e al DS (crescita in ottica calciomercato).</li>' +
          '<li><b>Tagging sulle Card</b> — badge tattici e posizioni secondarie/adattate in base alla gara. Il focus pubblico diventa <b>Menzione Speciale</b>.</li>' +
          '<li><b>Export dossier</b> — report grafici per briefing di squadra o curriculum.</li>' +
        '</ul>' +
        '<div class="es-ma-actions">' +
          '<button type="button" class="es-ma-btn ghost" data-ma="tag">Assegna badge tattico</button>' +
          '<button type="button" class="es-ma-btn ghost" data-ma="msgs">Messaggi staff</button>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-ma-lab">' +
        '<div class="es-pd-card-header"><h2>Laboratorio dati, tattica &amp; video</h2></div>' +
        '<p class="es-ma-lead">Hub operativo: da dati di campo a strategia tattica. Heatmap, GPS e clip restano il materiale di lavoro.</p>' +
        '<div class="es-ma-overlay">' + overlayPitch(lab.heatmaps) +
          '<p class="es-ma-lead">Sovrapposizione heatmap di squadra: ampiezza, uscite in pressione, densità centrale.</p></div>' +
        '<div class="es-ma-lab-grid">' +
          '<div><h3>1. Heatmap</h3><p class="es-ma-lead">Rifinitura tattica post-gara: convalida occupazione degli spazi e principi di gioco.</p>' +
            lis(heat, 'Nessuna heatmap validata.') +
            '<button type="button" class="es-ma-btn" data-ma="heatmap">Valida heatmap</button> ' +
            '<button type="button" class="es-ma-btn ghost" data-ma="overlay">Sovrapponi squadra</button></div>' +
          '<div><h3>2. GPS &amp; carico</h3><p class="es-ma-lead">Picchi fisici: velocità massima, sprint, accelerazioni, decelerazioni, metri ad alta intensità.</p>' +
            lis(gps, 'Nessun report GPS.') +
            '<button type="button" class="es-ma-btn" data-ma="gps">Invia report GPS allo staff</button></div>' +
          '<div><h3>3. Clip Hub</h3><p class="es-ma-lead">Tag: palle inattive, transizioni positive, costruzione dal basso. Studio avversario pre-gara.</p>' +
            lis(clips, 'Nessuna clip indicizzata.') +
            '<button type="button" class="es-ma-btn" data-ma="clip">Indicizza clip</button> ' +
            '<button type="button" class="es-ma-btn ghost" data-ma="opponent">Dossier avversario</button></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-ma-rep">' +
        '<div class="es-pd-card-header"><h2>Report privati vs pubblici</h2></div>' +
        '<p class="es-ma-lead"><b>Privati (in-house)</b> — solo Allenatore, DS e rosa: schemi pre-gara, punti deboli dell’avversario, calci d’angolo, dati fisici riservati. <b>Pubblici (portfolio)</b> — feed della piattaforma: focus sul calciatore, post-gara, pillole tattiche.</p>' +
        lis(reps, 'Nessun report creato.') +
        (tags.length ? '<p class="es-ma-lead"><b>Badge sulle Card</b></p>' + lis(tags, '') : '') +
        '<div class="es-ma-actions">' +
          '<button type="button" class="es-ma-btn" data-ma="rep-priv">Nuovo report privato</button>' +
          '<button type="button" class="es-ma-btn" data-ma="rep-pub">Nuovo report pubblico</button>' +
          '<button type="button" class="es-ma-btn ghost" data-ma="send-staff">Inoltra a DS e Allenatore</button>' +
          '<button type="button" class="es-ma-btn ghost" data-ma="export">Export dossier</button>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-ma-limits">' +
        '<div class="es-pd-card-header"><h2>Limiti di ruolo</h2></div>' +
        '<ul class="es-ma-list es-ma-limits-list">' +
          '<li>Non puoi modificare la rosa ufficiale o la struttura societaria (riservato a Presidente / Segretario).</li>' +
          '<li>Non puoi pubblicare annunci di calciomercato né gestire trattative di ingaggio ufficiali (riservato al DS).</li>' +
        '</ul>' +
      '</section>' +
    '</div>';
  }

  function fillExtra(host, user) {
    if (!host) return;
    var body = host.querySelector('.es-pd-body');
    if (!body) return;
    var old = body.querySelector('.es-ma-extra');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = extraHtml(user);
    if (!wrap.firstElementChild) return;
    body.appendChild(wrap.firstElementChild);
    var slot = host.querySelector('#es-pd-actions-slot');
    if (slot) {
      slot.innerHTML = '<button type="button" class="es-pd-edit" data-ma="rep-priv">Nuovo report</button>';
    }
  }

  function promptField(label, def) {
    var v = window.prompt(label, def || '');
    return v == null ? null : String(v).trim();
  }
  function addReport(channel) {
    var title = promptField('Titolo del report');
    if (!title) return;
    var kindRaw = promptField('Tipo: focus / post-gara / pillola', channel === 'public' ? 'focus' : 'post-gara');
    if (kindRaw == null) return;
    var kind = String(kindRaw || 'post-gara').toLowerCase();
    if (/focus/.test(kind)) kind = 'focus';
    else if (/pillola/.test(kind)) kind = 'pillola';
    else if (/avvers/.test(kind)) kind = 'avversario';
    else kind = 'post-gara';
    var note = promptField('Sintesi tattica');
    if (note == null) return;
    var player = '';
    if (kind === 'focus') {
      var plFocus = promptField('Calciatore in focus (tag sulla Card)');
      if (plFocus == null) return;
      player = plFocus;
    }
    var rec = {
      id: 'r-' + Date.now(),
      title: title,
      kind: kind,
      channel: channel,
      note: note,
      player: player,
      at: new Date().toISOString()
    };
    var lab = myLab();
    lab.reports.unshift(rec);
    persistLab(lab);
    if (channel === 'public') {
      pushPublic({
        title: title,
        kind: kind,
        note: note,
        player: player,
        from: meKey(),
        fromName: maName(userObj()),
        at: rec.at
      });
      if (player) {
        savePlayerTag(player, {
          mention: {
            title: title,
            note: note,
            analyst: maName(userObj()),
            at: rec.at
          }
        });
      }
    }
    toast(channel === 'public'
      ? (player ? 'Report pubblico: Menzione Speciale sulla Card di ' + player + '.' : 'Report pubblico in portfolio.')
      : 'Report privato in-house (Allenatore / DS / rosa).');
    render(userObj());
  }

  function openMaEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    var on = inStaff(user);
    var qNow = qualificaOf(user);
    var qOpts = QUALS.map(function (q) {
      return '<option value="' + esc(q) + '"' + (qNow === q ? ' selected' : '') + '>' + esc(q) + '</option>';
    }).join('');
    if (qNow && QUALS.indexOf(qNow) < 0) {
      qOpts = '<option value="' + esc(qNow) + '" selected>' + esc(qNow) + '</option>' + qOpts;
    }

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Match Analyst / Video Analyst</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-ma-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-ma-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-ma-role" value="Match Analyst / Video Analyst" readonly></div>' +
      '<div class="es-edit-field"><label>Qualifica / certificazione</label><select id="es-ma-qual">' +
        '<option value="">— seleziona —</option>' + qOpts + '</select></div>' +
      '<div class="es-edit-field"><label>Status contrattuale</label><select id="es-ma-contract">' +
        '<option value="staff"' + (on ? ' selected' : '') + '>In Staff Club</option>' +
        '<option value="free"' + (!on ? ' selected' : '') + '>Free Agent / Consulente Esterno</option>' +
      '</select></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-ma-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Consulente Esterno"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-ma-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Anagrafica</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-ma-nome').value.trim();
      var c = document.getElementById('es-ma-cognome').value.trim();
      var clb = document.getElementById('es-ma-club').value.trim();
      var bio = document.getElementById('es-ma-bio').value.trim();
      var qual = (document.getElementById('es-ma-qual') || {}).value || '';
      var ctr = (document.getElementById('es-ma-contract') || {}).value || 'free';
      if (ctr === 'staff' && !clb) {
        toast('In Staff Club richiede il club di appartenenza.', 'error');
        return;
      }

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;
      user.maQualifica = qual;
      user.qualificaMa = qual;
      user.maContract = ctr;
      user.contractStatus = ctr;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Match Analyst / Video Analyst salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.maBound === '1') return;
    host.dataset.maBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ma]');
      if (!b) return;
      var k = b.getAttribute('data-ma');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') { openMaEditModal(userObj()); return; }
      if (k === 'rep-priv') { addReport('private'); return; }
      if (k === 'rep-pub') { addReport('public'); return; }
      if (k === 'heatmap') {
        var pl = promptField('Calciatore della heatmap da validare');
        if (!pl) return;
        var lab = myLab();
        lab.heatmaps.unshift({ title: pl, note: 'Heatmap post-gara validata', at: new Date().toISOString() });
        persistLab(lab);
        toast('Heatmap validata: occupazione spazi e principi di gioco.');
        render(userObj());
        return;
      }
      if (k === 'overlay') {
        var labh = myLab();
        var nHeat = labh.heatmaps.filter(function (h) { return !h.overlay; }).length;
        if (!nHeat) {
          toast('Valida prima almeno una heatmap individuale.', 'error');
          return;
        }
        labh.heatmaps.unshift({
          title: 'Sovrapposizione squadra',
          note: 'Ampiezza, uscite in pressione, densità centrale',
          overlay: true,
          at: new Date().toISOString()
        });
        persistLab(labh);
        toast('Heatmap di squadra sovrapposta: ampiezza, pressione, densità centrale.');
        render(userObj());
        return;
      }
      if (k === 'gps') {
        var t = promptField('Titolo report GPS (picchi fisici / HSR)');
        if (!t) return;
        var noteG = promptField('Velocità max / sprint / accelerazioni / HSR');
        if (noteG == null) return;
        if (!noteG) noteG = 'Picchi fisici incrociati con la tattica';
        var labg = myLab();
        labg.gps.unshift({ title: t, note: noteG, at: new Date().toISOString() });
        persistLab(labg);
        if (inStaff()) {
          var gpsOk = pushInbox({
            id: 'gps-' + Date.now(),
            title: t,
            kind: 'gps',
            channel: 'private',
            note: noteG,
            from: meKey(),
            fromName: maName(userObj()),
            to: ['allenatore', 'preparatore'],
            at: new Date().toISOString()
          });
          toast(gpsOk
            ? 'Report GPS inviato all’Allenatore e al Preparatore atletico.'
            : 'Indica il club in anagrafica per inviare il GPS allo staff.', gpsOk ? 'success' : 'error');
        } else {
          toast('Report GPS salvato nel laboratorio. Passa a In Staff Club per inviarlo ad Allenatore e Preparatore.');
        }
        render(userObj());
        return;
      }
      if (k === 'clip') {
        var ct = promptField('Titolo clip (es. Transizioni positive)');
        if (!ct) return;
        var tag = promptField('Tag: palle inattive / transizioni / costruzione', 'transizioni');
        if (tag == null) return;
        if (!tag) tag = 'transizioni';
        var whoC = promptField('Calciatore collegato alla Card (opzionale)');
        if (whoC == null) return;
        var labc = myLab();
        labc.clips.unshift({ title: ct, kind: tag, player: whoC, at: new Date().toISOString() });
        persistLab(labc);
        if (whoC) {
          savePlayerTag(whoC, {
            clip: { title: ct, kind: tag, analyst: maName(userObj()), at: new Date().toISOString() }
          });
        }
        toast(whoC ? 'Clip indicizzata e collegata alla Card di ' + whoC + '.' : 'Clip indicizzata nel Clip Hub.');
        render(userObj());
        return;
      }
      if (k === 'opponent') {
        var opp = promptField('Squadra avversaria (dossier pre-gara)');
        if (!opp) return;
        var note = promptField('Punti deboli / calci d’angolo / occupazione');
        if (note == null) return;
        var labo = myLab();
        labo.reports.unshift({
          id: 'r-' + Date.now(),
          title: 'Pre-gara ' + opp,
          kind: 'avversario',
          channel: 'private',
          note: note,
          at: new Date().toISOString()
        });
        persistLab(labo);
        toast('Dossier avversario pronto da condividere con la rosa prima del weekend.');
        render(userObj());
        return;
      }
      if (k === 'send-staff') {
        var labS = myLab();
        if (!labS.reports.length) { toast('Crea prima un report.', 'error'); return; }
        if (!inStaff()) {
          toast('L’inoltro in-house richiede lo status In Staff Club.', 'error');
          return;
        }
        var lastR = labS.reports[0];
        var okSend = pushInbox({
          id: 'in-' + Date.now(),
          title: lastR.title,
          kind: lastR.kind,
          channel: 'private',
          note: lastR.note || '',
          player: lastR.player || '',
          from: meKey(),
          fromName: maName(userObj()),
          to: ['allenatore', 'ds'],
          at: new Date().toISOString()
        });
        toast(okSend
          ? 'Report inoltrato all’Allenatore (seduta) e al DS (valutazione / mercato).'
          : 'Indica il club in anagrafica per inoltrare allo staff.', okSend ? 'success' : 'error');
        return;
      }
      if (k === 'export') {
        var labE = myLab();
        var last = labE.reports[0];
        if (!last) { toast('Nessun dossier da esportare.', 'error'); return; }
        var blob = new Blob(
          ['ELISEE SCOUT — Dossier Match Analyst\n\n' + last.title + '\n' +
            kindLabel(last.kind) + ' · ' + (last.channel === 'public' ? 'Pubblico' : 'Privato') + '\n\n' +
            (last.note || '') + (last.player ? '\nCalciatore: ' + last.player : '')],
          { type: 'text/plain;charset=utf-8' }
        );
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dossier-match-analyst.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { try { URL.revokeObjectURL(a.href); } catch (_) {} }, 1500);
        toast('Dossier esportato per briefing / curriculum.');
        return;
      }
      if (k === 'tag') {
        var who = promptField('Calciatore da taggare sulla Card');
        if (!who) return;
        var badge = promptField('Badge tattico (es. Mezzala adattata)', 'Mezzala adattata');
        if (badge == null) return;
        if (!badge) badge = 'Badge tattico';
        var adapted = promptField('Posizione secondaria/adattata (vuoto = solo badge)', badge);
        if (adapted == null) return;
        var labt = myLab();
        labt.tags.unshift({ player: who, title: badge, note: adapted || 'Posizione secondaria/adattata', at: new Date().toISOString() });
        persistLab(labt);
        savePlayerTag(who, {
          badge: { title: badge, note: adapted, analyst: maName(userObj()), at: new Date().toISOString() },
          adaptedRole: adapted
        });
        toast('Badge tattico assegnato alla Card di ' + who + '.');
        render(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isMa(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-mad');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-mad';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    fillExtra(box, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';
    host.classList.add('es-ma-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');
    if (group) {
      group.classList.add('is-ma-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeMaDash = {
    render: render,
    isMa: isMa,
    inStaff: inStaff,
    inboxForClub: inboxForClub,
    tagsForPlayer: tagsForPlayer,
    publicFeed: publicFeed
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isMa(u)) render(u);
      } catch (_) {}
    }
  });
})();
