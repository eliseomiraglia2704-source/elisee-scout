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
    var sheets = pickPool(job).map(function (p) { return sheetFromPerson(p, job, { source: 'ai', id: 'ai-' + id + '-' + slug(p.name) }); });
    map[id] = {
      id: id,
      title: job.title || 'Annuncio',
      club: job.club || job.societa || '',
      role: job.role || job.ruolo || '',
      location: job.location || job.zona || '',
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

  function renderSheet(s, compact) {
    if (!s) return '<p class="es-st-empty">Seleziona un profilo a sinistra.</p>';
    var phys = [s.height ? s.height + ' cm' : '', s.weight ? s.weight + ' kg' : '', s.foot].filter(Boolean).join(' · ');
    var contacts = s.shareContacts
      ? ('<p>' + (s.email ? 'E-mail: ' + esc(s.email) : '') + (s.phone ? (s.email ? '<br>' : '') + 'Tel: ' + esc(s.phone) : '') +
        (!s.email && !s.phone ? 'Autorizzati, da richiedere in chat B2B.' : '') + '</p>')
      : '<p class="es-st-locked">Contatti non autorizzati dal candidato. Usare Messaggia in piattaforma.</p>';
    var media = '';
    if (s.photoUrl) media += '<div class="es-st-media-item"><img src="' + esc(s.photoUrl) + '" alt=""></div>';
    else if (s.photo) media += '<div class="es-st-media-item es-st-ava">' + esc(initials(s.name)) + '</div>';
    if (s.video) media += '<div class="es-st-media-item is-video">▶ ' + esc(s.video) + '</div>';
    if (!media) media = '<p>Nessuna foto o video nel profilo.</p>';
    else media = '<div class="es-st-media">' + media + '</div>';
    var html = '<div class="es-st-sheet" data-sheet="' + esc(s.id) + '">';
    html += '<p class="es-st-ai-kicker">Scheda tecnica generata dall’IA</p>';
    html += '<div class="es-st-hero">';
    html += '<div class="es-st-ava">' + (s.photoUrl ? '<img src="' + esc(s.photoUrl) + '" alt="">' : esc(initials(s.name))) + '</div>';
    html += '<div><h2>' + esc(s.name) + '</h2>';
    html += '<p class="es-st-lead" style="margin:0">' + esc(s.role) + (s.city ? ' · ' + esc(s.city) : '') +
      (s.region ? ' · ' + esc(s.region) : '') + '</p></div></div>';
    html += '<div class="es-st-ai">';
    html += '<p>Compatibilità con la posizione: <strong>' + esc(s.match) + '%</strong></p>';
    html += '<div class="es-st-bar"><i style="width:' + esc(s.match) + '%"></i></div>';
    html += '<p class="es-st-ai-sub">Punti di forza rispetto ai requisiti del club</p>';
    html += listOrDash(s.strengths);
    html += '</div>';
    if (compact) {
      html += '<div class="es-st-grid">';
      html += block('Profilo', '<p>' + esc(s.profile || s.role) + '</p>');
      html += block('Disponibilità', '<p>' + esc(s.avail || '—') + (s.geo ? '<br>' + esc(s.geo) : '') + '</p>');
      html += '</div></div>';
      return html;
    }
    html += '<div class="es-st-grid">';
    html += block('Dati anagrafici', '<p>' + esc(s.name) + '<br>' +
      (s.year ? 'Anno di nascita ' + esc(s.year) + ' · ' : '') + esc(s.nat || 'Italia') +
      (phys ? '<br>' + esc(phys) : '') + '</p>');
    html += block('Ruolo e profilo professionale', '<p>' + esc(s.profile || s.role) + '</p>');
    html += block('Contatti', contacts);
    html += block('Lingue', listOrDash(s.langs));
    html += block('Esperienze sportive e professionali', listOrDash(s.exp));
    html += block('Formazione, qualifiche e certificazioni', listOrDash(s.train));
    html += block('Competenze tecniche e specialistiche', listOrDash(s.skills));
    html += block('Disponibilità lavorativa e geografica', '<p>' +
      esc(s.avail || 'Non indicata') + (s.geo ? '<br>Aree: ' + esc(s.geo) : '') + '</p>');
    html += block('Curriculum e documenti allegati', '<p>' + (s.cv || (s.docs && s.docs.length)
      ? esc((s.docs && s.docs.length ? s.docs.join(', ') : 'Curriculum allegato'))
      : 'Nessun allegato caricato dal candidato') + '</p>');
    html += block('Foto e video del profilo', media);
    html += '</div>';
    if (s.note) html += '<p style="margin:0.8rem 0 0;color:#94a3b8;font-size:0.86rem">Nota candidatura: ' + esc(s.note) + '</p>';
    if (canManage()) {
      html += '<div class="es-st-actions">';
      STATUSES.forEach(function (st) {
        html += '<button type="button" class="' + (s.status === st ? 'es-st-btn' : 'es-st-ghost') + '" data-status="' + esc(st) + '" data-sid="' + esc(s.id) + '">' + esc(st) + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
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

  window.EliseeSchede = {
    ensureJob: ensureJob,
    addApplicant: addApplicant,
    open: openFor,
    render: render,
    jobId: function (title) { return slug(title); }
  };
  window.openSchedeTecniche = function (job) { openFor(job); };

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
