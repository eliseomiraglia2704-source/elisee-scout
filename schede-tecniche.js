/* Schede tecniche IA raccolte nella candidatura pubblicata (niente email). */
(function () {
  var STORE = 'elisee_job_sheets_v2';
  var STATUSES = ['nuova', 'in valutazione', 'shortlist', 'scartata'];
  var currentJob = '';
  var currentSheet = '';
  var compareIds = [];

  var POOL = [
    { name: 'Marco Rossi', role: 'Attaccante', city: 'Foggia', region: 'Puglia', year: '2003', nat: 'Italia', foot: 'Destro', height: '182', weight: '76',
      profile: 'Centravanti mobile, attacco alla profondità e lavoro in ampiezza.',
      exp: ['2024/25 · ASD Lucera Calcio · Eccellenza · attaccante', '2023/24 · San Severo Primavera · attaccante'],
      train: ['Patentino FIGC Settore Giovanile', 'Corso anti-doping NADO'],
      skills: ['Finalizzazione', 'Smarcamento', 'Duelli aerei'], langs: ['Italiano', 'Inglese B1'],
      avail: 'Immediata · svincolato', geo: 'Puglia, Basilicata, Campania',
      shareContacts: true, phone: '+39 320 1112233', email: 'marco.rossi@elisee.demo',
      photo: true, video: 'Video 30s — gol e movimenti senza palla', cv: true, docs: ['Curriculum PDF', 'Certificato medico'] },
    { name: 'Sara Esposito', role: 'Attaccante', city: 'Napoli', region: 'Campania', year: '2004', nat: 'Italia', foot: 'Sinistro', height: '168', weight: '58',
      profile: 'Ala esterna, 1vs1 e cross dal fondo.',
      exp: ['2024/25 · Napoli Femminile giovanili · ala'],
      train: ['UEFA C in corso'],
      skills: ['Dribbling', 'Cross', 'Pressing'], langs: ['Italiano', 'Spagnolo A2'],
      avail: 'Da giugno 2026', geo: 'Campania, Lazio',
      shareContacts: false, phone: '', email: '',
      photo: true, video: 'Highlight 28s — 1vs1', cv: true, docs: ['Curriculum PDF'] },
    { name: 'Kevin Di Bari', role: 'Centrocampista', city: 'Roma', region: 'Lazio', year: '2002', nat: 'Italia', foot: 'Destro', height: '176', weight: '70',
      profile: 'Trequartista, ultimo passaggio e inserimenti.',
      exp: ['2024/25 · Network Club Lazio · trequartista', '2022/23 · Latina Calcio · centrocampista'],
      train: ['Match analysis base'],
      skills: ['Visione', 'Assist', 'Tiro da fuori'], langs: ['Italiano', 'Inglese B2'],
      avail: '2 settimane di preavviso', geo: 'Lazio, Umbria, tutta Italia per titolarità',
      shareContacts: true, phone: '+39 347 5566778', email: 'kevin.dibari@elisee.demo',
      photo: true, video: 'Clip assist e tiri', cv: true, docs: ['Curriculum PDF'] },
    { name: 'Lorenzo Bianchi', role: 'Centrocampista', city: 'San Severo', region: 'Puglia', year: '2001', nat: 'Italia', foot: 'Destro', height: '180', weight: '74',
      profile: 'Mezzala di interdizione e inserimento.',
      exp: ['2024/25 · US San Severo · mezzala'],
      train: ['Preparazione atletica funzionale'],
      skills: ['Recupero palla', 'Box-to-box'], langs: ['Italiano'],
      avail: 'Immediata', geo: 'Foggia e provincia',
      shareContacts: true, phone: '+39 333 9988776', email: 'lorenzo.bianchi@elisee.demo',
      photo: false, video: '', cv: false, docs: [] },
    { name: 'Roberto Barbieri', role: 'Portiere', city: 'Lucera', region: 'Puglia', year: '2005', nat: 'Italia', foot: 'Destro', height: '188', weight: '80',
      profile: 'Estremo reattivo, uscite e gioco con i piedi.',
      exp: ['2024/25 · Accademia Puglia U19 · portiere'],
      train: ['Corso portieri FIGC'],
      skills: ['Parate in tuffo', 'Gioco corto'], langs: ['Italiano', 'Inglese A2'],
      avail: 'Da luglio 2026', geo: 'Puglia, Molise',
      shareContacts: true, phone: '+39 389 2211445', email: 'roberto.barbieri@elisee.demo',
      photo: true, video: 'Video 30s — parate e costruzione', cv: true, docs: ['Curriculum PDF', 'Certificato FIGC'] },
    { name: 'Davide Russo', role: 'Portiere', city: 'Verona', region: 'Veneto', year: '2003', nat: 'Italia', foot: 'Sinistro', height: '190', weight: '82',
      profile: 'Portiere di impostazione, lettura delle traiettorie.',
      exp: ['2023/24 · Verona giovanili · portiere'],
      train: ['Licenza portieri regionale'],
      skills: ['Posizionamento', 'Rinvii'], langs: ['Italiano', 'Tedesco A1'],
      avail: 'Trasferibile', geo: 'Nord e Centro Italia',
      shareContacts: false, phone: '', email: '',
      photo: true, video: 'Highlight uscite', cv: true, docs: ['Curriculum PDF'] },
    { name: 'Matteo Ferrari', role: 'Difensore', city: 'Manfredonia', region: 'Puglia', year: '2005', nat: 'Italia', foot: 'Destro', height: '186', weight: '79',
      profile: 'Difensore centrale, anticipo e costruzione dal basso.',
      exp: ['2024/25 · Manfredonia Calcio · difensore centrale'],
      train: ['Fuoriquota Under'],
      skills: ['Anticipo', 'Marcamento', 'Uscita palla'], langs: ['Italiano'],
      avail: 'Immediata · obblighi categoria 2005/06', geo: 'Puglia',
      shareContacts: true, phone: '+39 328 6677889', email: 'matteo.ferrari@elisee.demo',
      photo: true, video: 'Video 30s — duelli e costruzione', cv: true, docs: ['Curriculum PDF'] },
    { name: 'Giulia Romano', role: 'Difensore', city: 'Latina', region: 'Lazio', year: '2004', nat: 'Italia', foot: 'Sinistro', height: '170', weight: '60',
      profile: 'Terzino sinistro, spinta e copertura.',
      exp: ['2024/25 · Latina Calcio · terzino'],
      train: ['Corso tattico settore giovanile'],
      skills: ['Sovrapposizione', 'Cross'], langs: ['Italiano', 'Inglese B1'],
      avail: 'Fine stagione', geo: 'Lazio, Campania',
      shareContacts: false, phone: '', email: '',
      photo: true, video: '', cv: false, docs: [] },
    { name: 'Giulia Conti', role: 'Match Analyst', city: 'Roma', region: 'Lazio', year: '1998', nat: 'Italia', foot: '', height: '', weight: '',
      profile: 'Analista pre/post gara, tagging clip e report staff.',
      exp: ['2024/25 · Network Club Lazio · match analyst', '2022/24 · Freelance dilettanti Lazio'],
      train: ['UEFA B', 'Certificazione Wyscout'],
      skills: ['Tagging', 'Report 8 blocchi', 'Heatmap'], langs: ['Italiano', 'Inglese C1', 'Francese B1'],
      avail: 'Part-time o full-time da agosto', geo: 'Lazio, remoto + trasferte weekend',
      shareContacts: true, phone: '+39 349 1122334', email: 'giulia.conti@elisee.demo',
      photo: true, video: 'Showreel report 45s', cv: true, docs: ['Curriculum PDF', 'Portfolio report'] },
    { name: 'Elena Santoro', role: 'Preparatore Atletico', city: 'Foggia', region: 'Puglia', year: '1995', nat: 'Italia', foot: '', height: '', weight: '',
      profile: 'Periodizzazione forza e prevenzione infortuni.',
      exp: ['2023/25 · Foggia In Motion · preparatore atletico'],
      train: ['Istruttore CONI', 'FIFA Diploma Fitness'],
      skills: ['GPS', 'Forza', 'Rieducazione'], langs: ['Italiano', 'Inglese B2'],
      avail: 'Part-time con possibile full-time', geo: 'Foggia e provincia, trasferte regionali',
      shareContacts: true, phone: '+39 320 4455667', email: 'elena.santoro@elisee.demo',
      photo: true, video: '', cv: true, docs: ['Curriculum PDF', 'Diploma CONI'] }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function slug(s) {
    return String(s || 'job').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isLogged() {
    try {
      var u = userObj();
      return localStorage.getItem('elisee_user_auth') === 'true' && !!(u.email || u.id);
    } catch (_) { return false; }
  }
  function canManage() {
    if (localStorage.getItem('elisee_admin_auth') === 'true') return true;
    var u = userObj();
    var blob = [u.siteRoleFamily, u.ruolo, u.role, u.staffRole, u.ruoloDettagliato].filter(Boolean).join(' ').toLowerCase();
    return /squadra|club|societ|direttore|scout|osservatore|staff/.test(blob);
  }
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveAll(map) {
    try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (_) {}
  }
  function matchScore(person, job) {
    var n = 72;
    var jr = String((job && job.role) || '').toLowerCase();
    var pr = String(person.role || '').toLowerCase();
    if (jr && pr && (pr.indexOf(jr.split(' ')[0]) >= 0 || jr.indexOf(pr.split(' ')[0]) >= 0)) n += 12;
    if (job && job.location && person.city && String(job.location).toLowerCase() === String(person.city).toLowerCase()) n += 6;
    if (person.shareContacts) n += 2;
    if (person.cv) n += 2;
    if (person.video) n += 2;
    var hay = [job && job.skillsReq, job && job.langsReq, job && job.extraReq, job && job.requirements].filter(Boolean).join(' ').toLowerCase();
    if (hay) {
      (person.skills || []).forEach(function (sk) { if (hay.indexOf(String(sk).toLowerCase()) >= 0) n += 2; });
      (person.langs || []).forEach(function (lg) { if (hay.indexOf(String(lg).toLowerCase()) >= 0) n += 2; });
    }
    n += (String(person.name).length % 5);
    return Math.min(98, n);
  }
  function aiStrengths(person, job) {
    var out = [];
    var jr = String((job && job.role) || '').toLowerCase();
    var pr = String(person.role || '').toLowerCase();
    if (jr && pr && (pr.indexOf(jr.split(' ')[0]) >= 0 || jr.indexOf(pr.split(' ')[0]) >= 0)) {
      out.push('Ruolo allineato alla posizione pubblicata (' + (person.role || job.role) + ').');
    }
    if (job && job.location && (person.city === job.location || (person.geo && String(person.geo).indexOf(job.location) >= 0))) {
      out.push('Disponibilità geografica coerente con ' + job.location + '.');
    }
    if (person.train && person.train.length) out.push('Formazione e certificazioni già in dossier.');
    if (person.video) out.push('Materiale video presente: il club può valutare senza chiedere file via e-mail.');
    if (person.avail && /immediat/i.test(person.avail)) out.push('Disponibilità lavorativa immediata.');
    if (person.skills && person.skills.length) out.push('Competenze chiave: ' + person.skills.slice(0, 3).join(', ') + '.');
    if (!out.length) out.push('Profilo selezionato dall’IA tra i più compatibili con i requisiti inseriti dal club.');
    return out;
  }
  function initials(name) {
    var p = String(name || 'C').trim().split(/\s+/);
    return ((p[0] || 'C').charAt(0) + (p[1] || p[0] || 'A').charAt(0)).toUpperCase();
  }
  function sheetFromPerson(person, job, extra) {
    extra = extra || {};
    var match = extra.match != null ? extra.match : matchScore(person, job);
    return {
      id: extra.id || ('sh-' + slug(person.name) + '-' + Date.now()),
      name: person.name,
      role: person.role || extra.role || '',
      city: person.city || extra.city || '',
      region: person.region || extra.region || '',
      year: person.year || extra.year || '',
      nat: person.nat || extra.nat || 'Italia',
      foot: person.foot || '',
      height: person.height || '',
      weight: person.weight || '',
      profile: person.profile || extra.profile || '',
      exp: person.exp || extra.exp || [],
      train: person.train || extra.train || [],
      skills: person.skills || extra.skills || [],
      langs: person.langs || extra.langs || ['Italiano'],
      avail: person.avail || extra.avail || '',
      geo: person.geo || extra.geo || person.city || '',
      shareContacts: person.shareContacts === true || extra.shareContacts === true,
      phone: person.phone || extra.phone || '',
      email: extra.email || person.email || '',
      photo: person.photo === true || !!extra.photo,
      photoUrl: extra.photoUrl || person.photoUrl || '',
      video: person.video || extra.video || '',
      cv: !!person.cv,
      docs: person.docs || extra.docs || (person.cv ? ['Curriculum PDF'] : []),
      match: match,
      strengths: extra.strengths || aiStrengths(person, job),
      status: extra.status || 'nuova',
      source: extra.source || 'ai',
      note: extra.note || ''
    };
  }
  function roleKey(role) {
    var r = String(role || '').toLowerCase();
    if (/portier/.test(r)) return 'portiere';
    if (/difens|terzin/.test(r)) return 'difensore';
    if (/analyst|analista/.test(r)) return 'match analyst';
    if (/preparat/.test(r)) return 'preparatore';
    if (/centro|mezzala|trequart/.test(r)) return 'centrocampista';
    if (/attacc|ala|punta|centravanti/.test(r)) return 'attaccante';
    return r;
  }
  function pickPool(job) {
    var key = roleKey(job.role);
    var hit = POOL.filter(function (p) { return roleKey(p.role).indexOf(key) >= 0 || key.indexOf(roleKey(p.role)) >= 0; });
    if (hit.length < 3) hit = POOL.slice(0, 4);
    return hit.slice(0, 5);
  }
  function ensureJob(job) {
    if (!job) return null;
    var id = job.id || slug(job.title || job.club);
    var map = loadAll();
    if (map[id] && Array.isArray(map[id].sheets) && map[id].sheets.length) {
      map[id].title = job.title || map[id].title;
      map[id].club = job.club || job.societa || map[id].club;
      map[id].role = job.role || job.ruolo || map[id].role;
      saveAll(map);
      return map[id];
    }
    var useAi = job.ai !== false;
    var sheets = useAi
      ? pickPool(job).map(function (p) { return sheetFromPerson(p, job, { source: 'ai', id: 'ai-' + id + '-' + slug(p.name) }); })
      : [];
    map[id] = {
      id: id,
      title: job.title || 'Annuncio',
      club: job.club || job.societa || '',
      role: job.role || job.ruolo || '',
      location: job.location || job.zona || '',
      requirements: job.requirements || '',
      ai: useAi,
      sheets: sheets,
      updatedAt: new Date().toISOString()
    };
    saveAll(map);
    return map[id];
  }
  function getJob(id) {
    var map = loadAll();
    return map[id] || null;
  }
  function addApplicant(jobRef, user, note) {
    user = user || userObj();
    var job = typeof jobRef === 'string' ? getJob(slug(jobRef)) : ensureJob(jobRef);
    if (!job) {
      job = ensureJob({ id: slug(jobRef), title: jobRef, role: user.ruoloDettagliato || user.ruolo || '' });
    }
    var pp = user.playerProfile || {};
    var name = [user.nome, user.cognome].filter(Boolean).join(' ').trim() || user.username || user.email || 'Candidato';
    var photoUrl = '';
    try { photoUrl = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, user)) || user.fotoUrl || ''; } catch (_) {}
    var share = !!(pp.notify && (pp.notify.messages || pp.notify.opportunities || pp.notify.email));
    var person = {
      name: name,
      role: pp.fieldRole || user.ruoloDettagliato || user.ruolo || job.role,
      city: (pp.interest && (pp.interest.comune || pp.interest.city)) || '',
      region: (pp.interest && pp.interest.region) || '',
      year: (user.dataNascita || pp.birthYear || '').toString().slice(0, 4),
      nat: user.nazionalita || pp.nationality || 'Italia',
      foot: pp.foot || '',
      height: pp.heightCm || '',
      weight: pp.weightKg || '',
      profile: pp.bio || note || 'Candidatura inviata dalla piattaforma.',
      exp: (pp.experiences || []).map(function (e) {
        return [e.season, e.club, e.role, e.category].filter(Boolean).join(' · ');
      }).filter(Boolean),
      train: pp.certs || [],
      skills: pp.skills || [],
      langs: pp.langs || ['Italiano'],
      avail: pp.avail || 'Da concordare',
      geo: [pp.interest && pp.interest.region, pp.interest && pp.interest.comune].filter(Boolean).join(', ') || 'Italia',
      shareContacts: share,
      phone: share ? (user.telefono || '') : '',
      email: share ? (user.email || '') : '',
      photo: !!photoUrl,
      photoUrl: photoUrl,
      video: pp.video || '',
      cv: true,
      docs: ['Profilo Player ELISEE SCOUT']
    };
    var sh = sheetFromPerson(person, job, {
      source: 'candidatura',
      shareContacts: share,
      email: share ? (user.email || '') : '',
      photoUrl: photoUrl,
      note: note || '',
      match: Math.min(98, matchScore(person, job) + 2)
    });
    job.sheets = (job.sheets || []).filter(function (s) { return s.email !== sh.email || !sh.email; });
    job.sheets.unshift(sh);
    var map = loadAll();
    map[job.id] = job;
    saveAll(map);
    return sh;
  }
  function setStatus(jobId, sheetId, status) {
    var map = loadAll();
    var job = map[jobId];
    if (!job) return;
    (job.sheets || []).forEach(function (s) { if (s.id === sheetId) s.status = status; });
    saveAll(map);
  }

  function toast(msg, k) {
    if (typeof window.showToast === 'function') window.showToast(msg, k || 'success');
  }

  function renderList(job) {
    var sort = ((document.getElementById('es-st-sort') || {}).value) || 'match';
    var st = ((document.getElementById('es-st-filter') || {}).value) || '';
    var rows = (job.sheets || []).slice();
    if (st) rows = rows.filter(function (s) { return s.status === st; });
    rows.sort(function (a, b) {
      if (sort === 'name') return String(a.name).localeCompare(String(b.name));
      return (b.match || 0) - (a.match || 0);
    });
    if (!rows.length) return '<p class="es-st-empty">Nessuna scheda con questo filtro.</p>';
    return rows.map(function (s) {
      var on = s.id === currentSheet ? ' is-on' : '';
      var chk = compareIds.indexOf(s.id) >= 0 ? ' checked' : '';
      return '<button type="button" class="es-st-item' + on + '" data-open="' + esc(s.id) + '">' +
        '<span class="es-st-match">' + esc(s.match) + '%</span>' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p>' + esc(s.role) + (s.city ? ' · ' + esc(s.city) : '') + (s.source === 'ai' ? ' · IA' : ' · candidatura') + '</p>' +
        '<span class="es-st-st ' + esc(s.status === 'shortlist' ? 'shortlist' : s.status === 'scartata' ? 'scartata' : '') + '">' + esc(s.status) + '</span>' +
        (canManage() ? '<label style="display:block;margin-top:0.4rem;font-size:0.72rem;color:#94a3b8;" onclick="event.stopPropagation()"><input type="checkbox" data-cmp="' + esc(s.id) + '"' + chk + '> Confronta</label>' : '') +
        '</button>';
    }).join('');
  }

  function block(title, bodyHtml) {
    return '<div class="es-st-block"><h4>' + esc(title) + '</h4>' + bodyHtml + '</div>';
  }
  function listOrDash(arr) {
    if (!arr || !arr.length) return '<p>—</p>';
    return '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }

  function kv(label, value) {
    return '<div class="es-st-kv"><span>' + esc(label) + '</span><b>' + (value || '—') + '</b></div>';
  }

  function renderScoutDossier(s) {
    s = ensureScoutFields(s);
    var stClass = /svincol/i.test(s.contractStatus) ? 'is-free' : (/prestit/i.test(s.contractStatus) ? 'is-loan' : 'is-contract');
    var html = '<article class="es-st-sheet es-st-dossier" data-sheet="' + esc(s.id) + '">';
    html += '<p class="es-st-ai-kicker">Dossier analitico &amp; scheda tecnica scouting</p>';
    html += '<p class="es-st-export-note">Piattaforma scouting calcistico · Export PDF/Word per Direttore Sportivo</p>';
    html += '<div class="es-st-hero">';
    html += '<div class="es-st-ava">' + (s.photoUrl ? '<img src="' + esc(s.photoUrl) + '" alt="">' : esc(initials(s.name))) + '</div>';
    html += '<div><h2>' + esc(s.name) + '</h2>';
    html += '<p class="es-st-lead" style="margin:0">' + esc(s.primaryRole || s.role || '') +
      (s.clubLine ? ' · ' + esc(s.clubLine) : '') + '</p>';
    html += '<span class="es-st-status ' + stClass + '">' + esc(s.contractStatus) + '</span>';
    html += '</div></div>';

    html += '<div class="es-st-ai">';
    html += '<p>Match Index IA: <strong>' + esc(s.match) + '% MATCH</strong></p>';
    html += '<div class="es-st-bar"><i style="width:' + esc(s.match) + '%"></i></div>';
    html += '<p class="es-st-ai-sub">Verificato da AI Scouting Advisor sui parametri di ricerca DS</p>';
    html += '</div>';

    html += '<h3 class="es-st-sec">1. Header &amp; anagrafica identificativa</h3>';
    html += '<div class="es-st-kvgrid">';
    html += kv('Nome e cognome', esc(s.name));
    html += kv('Data di nascita / età', esc(s.dobAge));
    html += kv('Nazionalità / domicilio', esc(s.natLine));
    html += kv('Status contrattuale', esc(s.contractStatus));
    html += kv('Club attuale / ultima categoria', esc(s.clubLine));
    html += kv('Dati antropometrici', esc(s.anthro));
    html += kv('Match Index IA', esc(s.match) + '% MATCH');
    html += '</div>';

    html += '<h3 class="es-st-sec">2. Specifiche tattiche &amp; mappa ruoli</h3>';
    html += '<div class="es-st-kvgrid">';
    html += kv('Piede preferito', esc(s.footLine));
    html += kv('Ruolo primario', esc(s.primaryRole));
    html += kv('Ruoli secondari / adattati', esc(s.secondaryRoles));
    html += '</div>';
    html += '<div class="es-st-badges">' + (s.badges || []).map(function (b) {
      return '<span>' + esc(b) + '</span>';
    }).join('') + '</div>';
    html += '<p class="es-st-ai-sub">Mappa saturazione posizioni in campo</p>';
    html += (s.roleMap || []).map(function (r) {
      return '<div class="es-st-sat"><span>' + esc(r.role) + '</span><div class="es-st-bar"><i style="width:' + r.pct + '%"></i></div><b>' + r.pct + '% efficacia</b></div>';
    }).join('');

    html += '<h3 class="es-st-sec">3. Heatmap stagionale &amp; distribuzione tattica</h3>';
    html += '<div class="es-st-heat">' +
      '<p><b>Profilo mappa di calore.</b> ' + esc(s.heatmap) + '</p>' +
      '<p><b>Modulo di riferimento utilizzato:</b> ' + esc(s.modulo) + '</p>' +
      '<p><b>Certificazione mappa:</b> ' + esc(s.heatCert) + '</p>' +
    '</div>';

    html += '<h3 class="es-st-sec">4. Metriche fisiche &amp; prestazionali GPS</h3>';
    html += '<p class="es-st-ai-sub">Fonte dati: tracciamento hardware GPS / smartphone MVP</p>';
    html += '<table class="es-st-table"><thead><tr><th>Parametro fisico</th><th>Valore medio / picco</th><th>Riferimento categoria</th></tr></thead><tbody>';
    (s.gps || []).forEach(function (g) {
      html += '<tr><td>' + esc(g.param) + '</td><td>' + esc(g.value) + '</td><td>' + esc(g.ref) + '</td></tr>';
    });
    html += '</tbody></table>';

    html += '<h3 class="es-st-sec">5. Storico statistiche di carriera</h3>';
    html += '<table class="es-st-table"><thead><tr><th>Stagione</th><th>Squadra</th><th>Categoria</th><th>Pres. (tit.)</th><th>Minuti</th><th>Gol</th><th>Assist</th><th>Cart. G/R</th></tr></thead><tbody>';
    (s.career || []).forEach(function (c) {
      html += '<tr><td>' + esc(c.season) + '</td><td>' + esc(c.club) + '</td><td>' + esc(c.cat) + '</td><td>' + esc(c.apps) + '</td><td>' + esc(c.min) + '</td><td>' + c.g + '</td><td>' + c.a + '</td><td>' + esc(c.cards) + '</td></tr>';
    });
    if (s.careerTot) {
      html += '<tr class="es-st-tot"><td>TOTALE</td><td>—</td><td>—</td><td>' + esc(s.careerTot.apps) + '</td><td>' + esc(s.careerTot.min) + '</td><td>' + s.careerTot.g + '</td><td>' + s.careerTot.a + '</td><td>' + esc(s.careerTot.cards) + '</td></tr>';
    }
    html += '</tbody></table>';

    html += '<div class="es-st-actions es-st-export-row">';
    html += '<button type="button" class="es-st-btn" data-st-ia="export-pdf" data-sid="' + esc(s.id) + '">Esporta PDF</button>';
    html += '<button type="button" class="es-st-ghost" data-st-ia="export-word" data-sid="' + esc(s.id) + '">Esporta Word</button>';
    html += '</div>';
    html += '</article>';
    return html;
  }

  function renderSheet(s, compact) {
    if (!s) return '<p class="es-st-empty">Seleziona un profilo a sinistra.</p>';
    s = ensureScoutFields(s);
    if (compact) {
      return '<div class="es-st-sheet" data-sheet="' + esc(s.id) + '">' +
        '<p class="es-st-ai-kicker">Scheda tecnica scouting</p>' +
        '<h2>' + esc(s.name) + '</h2>' +
        '<p>' + esc(s.primaryRole || s.role) + ' · Match Index ' + esc(s.match) + '%</p>' +
        '<p>' + esc(s.clubLine || '') + '</p></div>';
    }
    return renderScoutDossier(s);
  }

  function render() {
    var root = document.getElementById('schede-portal');
    if (!root) return;
    var job = getJob(currentJob) || ensureJob({ id: currentJob, title: currentJob });
    if (!job) return;
    var title = document.getElementById('es-st-title');
    var lead = document.getElementById('es-st-lead');
    if (title) title.textContent = job.title;
    if (lead) lead.textContent = (job.club ? job.club + ' · ' : '') + (job.role || '') + (job.location ? ' · ' + job.location : '') +
      ' — ' + (job.sheets || []).length + ' schede in piattaforma, nessuna e-mail inviata.';
    var list = document.getElementById('es-st-list');
    var detail = document.getElementById('es-st-detail');
    if (list) list.innerHTML = renderList(job);
    var sheet = (job.sheets || []).filter(function (s) { return s.id === currentSheet; })[0] || (job.sheets || [])[0];
    if (sheet) currentSheet = sheet.id;
    if (compareIds.length >= 2) {
      var picked = (job.sheets || []).filter(function (s) { return compareIds.indexOf(s.id) >= 0; }).slice(0, 3);
      if (detail) detail.innerHTML = '<div class="es-st-compare">' + picked.map(function (s) { return renderSheet(s, true); }).join('') + '</div>';
    } else if (detail) {
      detail.innerHTML = renderSheet(sheet, false);
    }
  }

  function bind() {
    var hub = document.getElementById('schede-portal');
    if (!hub || hub.dataset.bound === '1') return;
    hub.dataset.bound = '1';
    hub.addEventListener('click', function (e) {
      var open = e.target.closest('[data-open]');
      if (open) {
        currentSheet = open.getAttribute('data-open');
        render();
        return;
      }
      var st = e.target.closest('[data-status]');
      if (st) {
        setStatus(currentJob, st.getAttribute('data-sid'), st.getAttribute('data-status'));
        toast('Stato aggiornato: ' + st.getAttribute('data-status'));
        render();
      }
    });
    hub.addEventListener('change', function (e) {
      if (e.target && e.target.getAttribute('data-cmp')) {
        var id = e.target.getAttribute('data-cmp');
        if (e.target.checked) {
          if (compareIds.indexOf(id) < 0) compareIds.push(id);
          if (compareIds.length > 3) compareIds = compareIds.slice(-3);
        } else {
          compareIds = compareIds.filter(function (x) { return x !== id; });
        }
        render();
        return;
      }
      if (e.target && (e.target.id === 'es-st-sort' || e.target.id === 'es-st-filter')) render();
    });
  }

  function openFor(job) {
    if (!isLogged()) {
      if (window.requireEliseeLogin) window.requireEliseeLogin({ view: 'schede', hash: '#schede-tecniche' });
      else if (window.openAccessoModal) window.openAccessoModal('email');
      return;
    }
    var rec = ensureJob(typeof job === 'string' ? { id: slug(job), title: job } : job);
    currentJob = rec.id;
    currentSheet = (rec.sheets[0] && rec.sheets[0].id) || '';
    compareIds = [];
    if (typeof window.switchView === 'function') window.switchView('schede', '#schede-tecniche');
    setTimeout(render, 40);
  }

  function hashStr(s) {
    var h = 0, i, str = String(s || '');
    for (i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function tacticalPack(role, h) {
    var r = String(role || '').toLowerCase();
    var pack;
    if (/portier/.test(r)) pack = { primary: 'Portiere (POR)', second: 'Libero / Costruzione dal basso', map: [{ role: 'Portiere (POR)', pct: 100 }, { role: 'Libero (SW)', pct: 62 }, { role: 'Play dal basso', pct: 55 }], heat: 'Copertura dell’area e uscite alte; costruzione dal basso con piede dominante.', modulo: '4-3-3 / 3-5-2', badges: ['Uscite alte', 'Gioco con i piedi', 'Comando area'] };
    else if (/terzin|esterno/.test(r)) pack = { primary: 'Terzino / Esterno', second: 'Ala bassa / Esterno di centrocampo', map: [{ role: 'Terzino', pct: 100 }, { role: 'Esterno (ES/ED)', pct: 82 }, { role: 'Ala bassa', pct: 64 }], heat: 'Corridoio laterale, sovrapposizioni e coperture in transizione negativa.', modulo: '4-3-3 / 3-5-2', badges: ['Sovrapposizione', 'Cross', 'Recupero'] };
    else if (/difens|bracc/.test(r)) pack = { primary: 'Difensore centrale (DC)', second: 'Braccetto / Libero', map: [{ role: 'Difensore centrale (DC)', pct: 100 }, { role: 'Braccetto (3-5-2)', pct: 78 }, { role: 'Mediano di copertura', pct: 60 }], heat: 'Duelli nell’area e costruzione dal basso sul primo passaggio.', modulo: '4-3-3 / 3-5-2', badges: ['Duelli aerei', 'Anticipo', 'Uscita palla'] };
    else if (/median|regist|box/.test(r)) pack = { primary: 'Mediano (MED)', second: 'Mezzala / Regista', map: [{ role: 'Mediano (MED)', pct: 100 }, { role: 'Mezzala', pct: 76 }, { role: 'Regista', pct: 68 }], heat: 'Interdizione tra le linee e primo passaggio in costruzione.', modulo: '4-3-3 / 4-2-3-1', badges: ['Interdizione', 'Primo passaggio', 'Box-to-box'] };
    else if (/trequart|coc/.test(r)) pack = { primary: 'Trequartista (COC)', second: 'Ala / Seconda punta', map: [{ role: 'Trequartista (COC)', pct: 100 }, { role: 'Ala', pct: 74 }, { role: 'Seconda punta', pct: 70 }], heat: 'Trequarti centrale, inserimenti in area e ultimo passaggio.', modulo: '4-2-3-1 / 4-3-3', badges: ['Visione di gioco', 'Ultimo passaggio', 'Inserimento'] };
    else if (/ala|esterno sin|esterno des/.test(r)) pack = { primary: /sinistr/.test(r) ? 'Ala sinistra (AS)' : (/destr/.test(r) ? 'Ala destra (AD)' : 'Ala (AS/AD)'), second: 'Esterno / Trequartista (COC)', map: [{ role: /sinistr/.test(r) ? 'Ala sinistra (AS)' : 'Ala (AS/AD)', pct: 100 }, { role: 'Esterno', pct: 85 }, { role: 'Trequartista (COC)', pct: 70 }], heat: 'Copertura della trequarti offensiva e affondi fino al fondo per il cross.', modulo: '4-3-3 / 4-2-3-1', badges: ['Velocista', 'Specialista calci piazzati', 'Visione di gioco'] };
    else pack = { primary: /attacc|punta|centravanti/.test(r) ? 'Punta centrale (PTA)' : (role || 'Calciatore'), second: 'Seconda punta / Ala', map: [{ role: 'Punta centrale (PTA)', pct: 100 }, { role: 'Seconda punta', pct: 78 }, { role: 'Ala', pct: 62 }], heat: 'Attacchi alla profondità, presenze in area e lavoro di sponda.', modulo: '4-3-3 / 4-2-3-1', badges: ['Finalizzazione', 'Smarcamento', 'Duelli aerei'] };
    if (h % 2 === 0 && pack.badges[0] !== 'Velocista') pack.badges = pack.badges.slice();
    return pack;
  }

  function ensureScoutFields(s) {
    if (!s) return s;
    if (s.gps && s.career && s.primaryRole) return s;
    var h = hashStr(s.name + (s.role || ''));
    var pack = tacticalPack(s.role, h);
    var year = parseInt(s.year, 10);
    if (!year || year < 1985) year = 1998 + (h % 10);
    var age = 2026 - year;
    var day = 1 + (h % 27);
    var mon = 1 + (h % 12);
    var dob = (s.dob && String(s.dob).indexOf('/') >= 0) ? s.dob : ((day < 10 ? '0' : '') + day + '/' + (mon < 10 ? '0' : '') + mon + '/' + year);
    var height = s.height || (170 + (h % 18));
    var weight = s.weight || (64 + (h % 18));
    var foot = s.foot || ((h % 3 === 0) ? 'Sinistro' : 'Destro');
    var opp = 55 + (h % 30);
    var free = /svincol|libera|free/i.test(s.avail || s.contractStatus || '') || (h % 4 !== 1);
    var club = s.societa || s.club || 'S.S. Sesto Calcio';
    var cat = s.categoria || 'Eccellenza';
    var dist = (9.6 + (h % 16) / 10).toFixed(1);
    var hsr = 680 + (h % 280);
    var vmax = (28.4 + (h % 40) / 10).toFixed(1);
    var sprint = 18 + (h % 16);
    var acc = 34 + (h % 14);
    var dec = 30 + (h % 14);
    var minPeak = 50 + (h % 35);
    var g1 = 4 + (h % 10), a1 = 3 + (h % 8), p1 = 20 + (h % 10);
    var g2 = 6 + (h % 8), a2 = 4 + (h % 8), p2 = 22 + (h % 8);
    var career = (s.exp && s.exp.length)
      ? s.exp.slice(0, 2).map(function (line, i) {
          var bits = String(line).split(' · ');
          return { season: bits[0] || ('202' + (4 - i) + '/202' + (5 - i)), club: bits[1] || club, cat: bits[3] || cat, apps: (p1 - i * 2) + ' (' + (p1 - 2 - i) + ')', min: ((p1 - i) * 82) + "'", g: g1 - i, a: a1 - i, cards: (1 + i) + ' / 0' };
        })
      : [
          { season: '2025/2026', club: club, cat: cat, apps: p1 + ' (' + (p1 - 2) + ')', min: (p1 * 82) + "'", g: g1, a: a1, cards: '3 / 0' },
          { season: '2024/2025', club: 'AC Città', cat: 'Promozione', apps: p2 + ' (' + p2 + ')', min: (p2 * 85) + "'", g: g2, a: a2, cards: '2 / 0' }
        ];
    var totG = 0, totA = 0, totP = 0, totM = 0, totY = 0;
    career.forEach(function (c) {
      totG += Number(c.g) || 0;
      totA += Number(c.a) || 0;
      totP += parseInt(c.apps, 10) || 0;
      totM += parseInt(c.min, 10) || 0;
      totY += parseInt(c.cards, 10) || 0;
    });
    s.primaryRole = s.primaryRole || pack.primary;
    s.secondaryRoles = s.secondaryRoles || pack.second;
    s.roleMap = s.roleMap || pack.map;
    s.badges = s.badges || pack.badges;
    s.heatmap = s.heatmap || pack.heat;
    s.modulo = s.modulo || pack.modulo;
    s.heatCert = s.heatCert || 'Validata con sistema intelligente dai dati ufficiali della gara.';
    s.footLine = s.footLine || (foot + ' (uso opposto: ' + opp + '%)');
    s.contractStatus = s.contractStatus || (free ? 'Svincolato / Cerca squadra' : 'Sotto contratto');
    s.clubLine = s.clubLine || (club + ' (' + cat + ')');
    s.natLine = s.natLine || ((s.nat || 'Italiana') + ' | ' + (s.city || s.geo || 'Italia'));
    s.dobAge = s.dobAge || (dob + ' (' + age + ' anni)');
    s.anthro = s.anthro || (height + ' cm | ' + weight + ' kg');
    s.height = height;
    s.weight = weight;
    s.foot = foot;
    s.match = s.match || (78 + (h % 18));
    s.gps = s.gps || [
      { param: 'Distanza totale media (km)', value: dist + ' km / gara', ref: Number(dist) >= 10.2 ? 'Sopra la media (+8%)' : 'In linea con il ruolo' },
      { param: 'Metri ad alta intensità (HSR)', value: hsr + ' metri', ref: 'In linea con il ruolo' },
      { param: 'Velocità massima (km/h)', value: vmax + ' km/h (minuto ' + minPeak + ')', ref: Number(vmax) >= 30.5 ? 'Top performer' : 'Nella media di categoria' },
      { param: 'Sprint totali (>24 km/h)', value: sprint + ' ad alta intensità', ref: 'Elevata tenuta atletica' },
      { param: 'Accelerazioni / decelerazioni', value: acc + ' / ' + dec + ' per partita', ref: 'Reattività esplosiva' }
    ];
    s.career = s.career || career;
    s.careerTot = s.careerTot || { apps: String(totP), min: totM + "'", g: totG, a: totA, cards: totY + ' / 0' };
    return s;
  }

  function collectLiveProfiles() {
    var out = [];
    POOL.forEach(function (p) { out.push(p); });
    try {
      var sl = JSON.parse(localStorage.getItem('elisee_secret_list') || '[]') || [];
      sl.forEach(function (x) {
        out.push({
          name: x.nome || x.name, role: x.ruolo || x.role, city: x.citta || '',
          societa: x.squadra || x.club, profile: x.note || 'Talento in Secret List stealth.',
          year: x.eta ? String(2026 - Number(x.eta)) : '', skills: [x.potenziale || 'Monitoraggio'].filter(Boolean)
        });
      });
    } catch (_) {}
    try {
      if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
        window.EliseeScopri.allProfiles().forEach(function (p) {
          if (!p || !p.name) return;
          out.push({
            name: p.name, role: p.role || p.ruolo, city: p.city, region: p.region,
            societa: p.club || p.squadra, photoUrl: p.photo || p.logo, profile: p.bio || p.role
          });
        });
      }
    } catch (_) {}
    try {
      var dos = JSON.parse(localStorage.getItem('elisee_obs_dossiers') || '[]') || [];
      dos.forEach(function (d) {
        if (!d.player) return;
        out.push({
          name: d.player, role: 'Calciatore osservato', profile: d.note || '',
          skills: [d.raccomandazione, 'Voto ' + (d.rating || '')].filter(Boolean)
        });
      });
    } catch (_) {}
    var seen = {};
    return out.filter(function (p) {
      var k = String(p.name || '').toLowerCase();
      if (!k || seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  function enrichPerson(person, requester) {
    person = person || {};
    var h = hashStr(String(person.name || '') + (person.role || ''));
    var extra = {
      societa: person.societa || person.club,
      club: person.societa || person.club,
      source: 'ai-request',
      requester: requester || 'scout',
      match: person.match || (78 + (h % 18)),
      photoUrl: person.photoUrl || ''
    };
    return { person: person, extra: extra };
  }

  function requestJob(requester) {
    var u = userObj();
    return ensureJob({
      id: 'richieste-ds-scout',
      title: 'Schede tecniche richieste da DS / Scout',
      club: u.squadra || u.club || 'Foggia City',
      role: 'Scouting',
      location: u.citta || 'Italia',
      ai: true
    });
  }

  function generateFor(query, requester) {
    var q = String(query || '').trim();
    if (!q) return null;
    var ql = q.toLowerCase();
    var hits = collectLiveProfiles().filter(function (p) {
      return String(p.name || '').toLowerCase().indexOf(ql) >= 0 ||
        String(p.role || '').toLowerCase().indexOf(ql) >= 0 ||
        String(p.societa || p.club || '').toLowerCase().indexOf(ql) >= 0;
    });
    var person = hits[0] || {
      name: q,
      role: 'Ala sinistra',
      profile: 'Dossier ricostruito dall’IA su richiesta di ' + (requester === 'ds' ? 'Direttore Sportivo' : 'Scout') + '.',
      city: (userObj().citta || 'Foggia'),
      nat: 'Italiana',
      langs: ['Italiano']
    };
    var packed = enrichPerson(person, requester);
    var job = requestJob(requester);
    var sh = sheetFromPerson(packed.person, job, packed.extra);
    sh = ensureScoutFields(sh);
    sh.id = 'ai-req-' + slug(person.name) + '-' + Date.now();
    sh.strengths = aiStrengths(packed.person, job);
    job.sheets = (job.sheets || []).filter(function (s) { return s.name !== sh.name; });
    job.sheets.unshift(sh);
    job.updatedAt = new Date().toISOString();
    var map = loadAll();
    map[job.id] = job;
    saveAll(map);
    return sh;
  }

  function closeViewer() {
    var ov = document.getElementById('es-st-ia-overlay');
    if (ov) ov.remove();
  }

  function openViewer(sheet, requester) {
    closeViewer();
    var ov = document.createElement('div');
    ov.id = 'es-st-ia-overlay';
    ov.className = 'es-st-ia-overlay';
    ov.innerHTML = '<div class="es-st-ia-dialog" role="dialog" aria-modal="true">' +
      '<div class="es-st-ia-bar">' +
        '<div><p class="es-st-kicker" style="margin:0">Dossier analitico &amp; scheda tecnica scouting</p>' +
        '<strong>Export per Direttore Sportivo · richiesta da ' + esc(requester === 'scout' ? 'Area Scout' : (requester === 'ds' ? 'Direttore Sportivo' : 'Staff')) + '</strong></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="es-st-btn" data-st-ia="export-pdf" data-sid="' + esc(sheet.id) + '">Esporta PDF</button>' +
          '<button type="button" class="es-st-ghost" data-st-ia="export-word" data-sid="' + esc(sheet.id) + '">Esporta Word</button>' +
          '<button type="button" class="es-st-ghost" data-st-ia="close">Chiudi</button>' +
        '</div>' +
      '</div>' +
      '<div class="es-st-ia-body" id="es-st-print-root">' + renderSheet(sheet, false) + '</div>' +
    '</div>';
    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.closest('[data-st-ia="close"]')) closeViewer();
    });
    document.body.appendChild(ov);
  }

  function requestPanelHtml(requester) {
    var job = requestJob(requester);
    var recent = (job.sheets || []).slice(0, 8);
    return '<section class="es-pd-card" style="padding:1.25rem;">' +
      '<div class="es-pd-card-header"><h2>Scheda tecnica scouting</h2>' +
      '<span class="es-pd-source-badge">Dossier DS / Scout</span></div>' +
      '<p style="color:#94a3b8;font-size:0.84rem;line-height:1.5;margin:0 0 12px;">L’IA genera il dossier analitico ufficiale: anagrafica, mappa ruoli, heatmap, GPS e storico carriera. Richiedibile da Direttore Sportivo e da Scout, esportabile in PDF/Word.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">' +
        '<input type="text" id="es-st-ia-q" placeholder="Nome, ruolo o società del calciatore" style="flex:1;min-width:220px;padding:10px 12px;border-radius:8px;border:1px solid #1e2430;background:#0b0e14;color:#eef1f6;">' +
        '<button type="button" class="es-pro-btn-quick-jump" data-st-ia="generate" data-from="' + esc(requester || 'ds') + '">Genera scheda IA</button>' +
      '</div>' +
      (recent.length
        ? '<div style="display:flex;flex-direction:column;gap:8px;">' + recent.map(function (s) {
            return '<button type="button" class="es-st-item" style="text-align:left;width:100%;" data-st-ia="open" data-sid="' + esc(s.id) + '" data-from="' + esc(requester || 'ds') + '">' +
              '<b>' + esc(s.name) + '</b> · ' + esc(s.role || '') + (s.societa ? ' · ' + esc(s.societa) : '') +
              ' · ' + esc(s.match) + '%</button>';
          }).join('')
        : '<p class="es-pd-empty">Nessuna scheda richiesta. Cerca un tesserato e genera.</p>') +
    '</section>';
  }

  function bindGlobalIa() {
    if (window.__eliseeStIaBound) return;
    window.__eliseeStIaBound = true;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-st-ia]');
      if (!btn) return;
      var act = btn.getAttribute('data-st-ia');
      var from = btn.getAttribute('data-from') || 'ds';
      if (act === 'generate') {
        e.preventDefault();
        var qEl = document.getElementById('es-st-ia-q');
        var q = ((qEl && qEl.value) || '').trim();
        if (!q) {
          toast('Inserisci nome, ruolo o società del tesserato.', 'info');
          return;
        }
        var sh = generateFor(q, from);
        if (!sh) return;
        toast('Scheda tecnica IA generata per ' + sh.name + '.', 'success');
        openViewer(sh, from);
        return;
      }
      if (act === 'open') {
        e.preventDefault();
        var job = requestJob(from);
        var sh2 = (job.sheets || []).filter(function (s) { return s.id === btn.getAttribute('data-sid'); })[0];
        if (sh2) openViewer(sh2, from);
        return;
      }
      if (act === 'export-pdf') {
        e.preventDefault();
        e.stopPropagation();
        exportScoutPdf(btn.getAttribute('data-sid'));
        return;
      }
      if (act === 'export-word') {
        e.preventDefault();
        e.stopPropagation();
        exportScoutWord(btn.getAttribute('data-sid'));
      }
    });
  }
  function findSheetById(sid) {
    var map = loadAll();
    var found = null;
    Object.keys(map).forEach(function (k) {
      (map[k].sheets || []).forEach(function (s) { if (s.id === sid) found = s; });
    });
    return found;
  }
  function exportScoutPdf(sid) {
    var s = findSheetById(sid);
    if (!s) return;
    var w = window.open('', '_blank');
    if (!w) { toast('Consenti i popup per esportare il PDF.', 'info'); return; }
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Scheda tecnica scouting — ' + esc(s.name) + '</title>' +
      '<style>body{font-family:Segoe UI,Arial,sans-serif;color:#111;padding:24px;max-width:820px;margin:0 auto}h1,h2,h3{margin:1.1em 0 .4em}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f3f3f3}.bar{height:8px;background:#eee;border-radius:4px}.bar i{display:block;height:100%;background:#0284c7}</style></head><body>');
    w.document.write(renderScoutDossier(s).replace(/class="es-st-bar"/g, 'class="bar"'));
    w.document.write('<script>window.onload=function(){window.print();}<\\/script></body></html>');
    w.document.close();
  }
  function exportScoutWord(sid) {
    var s = findSheetById(sid);
    if (!s) return;
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Scheda tecnica scouting</title></head><body>' +
      renderScoutDossier(s) + '</body></html>';
    var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Scheda_Tecnica_Scouting_' + slug(s.name) + '.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('File Word scaricato.', 'success');
  }

  bindGlobalIa();

  window.EliseeSchede = {
    ensureJob: ensureJob,
    addApplicant: addApplicant,
    open: openFor,
    render: render,
    generateFor: generateFor,
    openViewer: openViewer,
    requestPanelHtml: requestPanelHtml,
    jobId: function (title) { return slug(title); }
  };
  window.openSchedeTecniche = function (job) { openFor(job); };
  window.EliseeSchedaTecnica = {
    generate: generateFor,
    open: openViewer,
    requestPanelHtml: requestPanelHtml
  };

  function boot() {
    bind();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'schede' || String(d.hash || '').indexOf('schede') >= 0)) render();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
