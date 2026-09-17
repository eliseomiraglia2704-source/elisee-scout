/* Elisee Scout — Bacheca: 7 categorie, filtro query, form dinamico. */
(function () {
  'use strict';

  var STORE = 'elisee_user_jobs';
  var CATS = [
    'cerco_squadra', 'cerco_giocatore', 'cerco_allenatore',
    'cerco_arbitro', 'cerco_amichevole', 'cerco_sponsor', 'calciomercato'
  ];
  var LABEL = {
    cerco_squadra: 'Cerco Squadra',
    cerco_giocatore: 'Cerco Giocatore',
    cerco_allenatore: 'Cerco Allenatore',
    cerco_arbitro: 'Cerco Arbitro',
    cerco_amichevole: 'Cerco Amichevole',
    cerco_sponsor: 'Cerco Sponsor',
    calciomercato: 'Calciomercato'
  };
  var HINT = {
    cerco_squadra: 'Calciatore o tesserato che cerca un club.',
    cerco_giocatore: 'Club che cerca un profilo in campo.',
    cerco_allenatore: 'Società che cerca mister o staff tecnico.',
    cerco_arbitro: 'Gara o campionato che cerca un direttore di gara.',
    cerco_amichevole: 'Squadra disponibile per una amichevole.',
    cerco_sponsor: 'Club in cerca di partner commerciale.',
    calciomercato: 'Cessione, prestito o svincolo.'
  };
  var ICO = {
    cerco_squadra: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    cerco_giocatore: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
    cerco_allenatore: '<circle cx="12" cy="12" r="3"/><path d="M5.5 5.5 8 8"/><path d="M18.5 5.5 16 8"/><path d="M5.5 18.5 8 16"/><path d="M18.5 18.5 16 16"/><circle cx="12" cy="12" r="9"/>',
    cerco_arbitro: '<rect x="6" y="3" width="12" height="18" rx="1"/><path d="M6 12h12"/>',
    cerco_amichevole: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2.4"/>',
    cerco_sponsor: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M7 16H6a4 4 0 1 1 0-8h1"/><line x1="7" y1="12" x2="17" y2="12"/>',
    calciomercato: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'
  };

  var wizardCat = '';
  var wizardStep = 1;

  function svg(cat, size) {
    size = size || 16;
    return '<svg class="es-ann-ico" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[cat] || ICO.calciomercato) + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'info');
    else alert(msg);
  }
  function isLogged() {
    try {
      return localStorage.getItem('elisee_user_auth') === 'true' ||
        localStorage.getItem('elisee_creator_mode') === 'true' ||
        localStorage.getItem('elisee_admin_auth') === 'true';
    } catch (_) { return false; }
  }
  function authorId() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
      return String(u.email || u.id || u.username || '').trim() || (localStorage.getItem('elisee_anon_id') || '');
    } catch (_) { return ''; }
  }
  function authorClub() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      return String(u.club || u.squadra || [u.nome, u.cognome].filter(Boolean).join(' ') || '').trim();
    } catch (_) { return ''; }
  }

  function infer(job) {
    var existing = String((job && (job.categoria || job.annuncioCategoria)) || '').trim();
    if (CATS.indexOf(existing) >= 0) return existing;
    var blob = [
      job && job.title, job && job.titolo, job && job.role, job && job.ruolo,
      job && job.description, job && job.desc, job && job.category, job && job.incarico
    ].join(' ').toLowerCase();
    if (/amichevol/.test(blob)) return 'cerco_amichevole';
    if (/arbitro|arbitragg|direttore di gara/.test(blob)) return 'cerco_arbitro';
    if (/sponsor|cartellonist|main sponsor/.test(blob)) return 'cerco_sponsor';
    if (/cessione|prestito|svincolo|calciomercato|trattativa chiusa/.test(blob)) return 'calciomercato';
    if (/cerco squadra|cerca squadra|cercasi squadra|senza club/.test(blob)) return 'cerco_squadra';
    if (/allenatore|mister|uefa [abc]|preparatore|match analyst|fisioterapista|staff tecnico/.test(blob)) return 'cerco_allenatore';
    if (/cercasi|cerco|ingaggio|tesseramento|attaccante|centrocampista|difensore|portiere/.test(blob)) return 'cerco_giocatore';
    return 'calciomercato';
  }

  function relativeWhen(iso) {
    if (!iso) return 'Oggi';
    var t = Date.parse(iso);
    if (!t) return String(iso);
    var d = Math.round((Date.now() - t) / 86400000);
    if (d <= 0) return 'Oggi';
    if (d === 1) return 'Ieri';
    if (d < 7) return d + ' giorni fa';
    if (d < 14) return '1 settimana fa';
    return Math.round(d / 7) + ' settimane fa';
  }

  function normalize(job) {
    job = job || {};
    var cat = infer(job);
    var title = job.titolo || job.title || '';
    var desc = job.descrizione || job.desc || job.description || '';
    var citta = job.zona_citta || job.zona || job.location || '';
    var ruolo = job.ruolo || job.ruolo_cercato || job.ruolo_campo || job.role || '';
    var league = job.categoria_club || job.categoria_squadra || job.categoria_attuale || job.livello || job.category || '';
    if (CATS.indexOf(String(league)) >= 0) league = job.category || job.livello || '';
    var stato = job.stato || 'attivo';
    if (job.data_scadenza) {
      var exp = Date.parse(job.data_scadenza);
      if (exp && exp < Date.now() && stato === 'attivo') stato = 'scaduto';
    }
    return {
      id: job.id || ('ann-' + String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      categoria: cat,
      titolo: title,
      title: title,
      descrizione: desc,
      description: desc,
      autore_id: job.autore_id || '',
      societa: job.societa || job.club || '',
      club: job.societa || job.club || '',
      zona_citta: citta,
      zona_provincia: job.zona_provincia || '',
      zona_regione: job.zona_regione || '',
      location: citta || job.zona_provincia || job.zona_regione || '',
      zona: citta,
      data_creazione: job.data_creazione || job.createdAt || '',
      data_scadenza: job.data_scadenza || '',
      stato: stato,
      role: ruolo,
      ruolo: ruolo,
      ruolo_campo: job.ruolo_campo || (cat === 'cerco_squadra' ? ruolo : ''),
      eta: job.eta,
      categoria_attuale: job.categoria_attuale || '',
      disponibilita: job.disponibilita || (job.svincolato ? 'svincolato' : ''),
      ruolo_cercato: job.ruolo_cercato || (cat === 'cerco_giocatore' ? ruolo : ''),
      categoria_club: job.categoria_club || '',
      eta_min: job.eta_min,
      eta_max: job.eta_max,
      esperienza_richiesta: job.esperienza_richiesta || job.esperienza || '',
      categoria_squadra: job.categoria_squadra || '',
      livello: job.livello || '',
      qualifica_richiesta: job.qualifica_richiesta || job.qualifiche || '',
      livello_gare: job.livello_gare || '',
      data_gara: job.data_gara || '',
      ricorrente: !!job.ricorrente,
      rimborso_spese: !!job.rimborso_spese,
      periodo_disponibile: job.periodo_disponibile || '',
      campo_disponibile: !!job.campo_disponibile,
      tipo_sponsorizzazione: job.tipo_sponsorizzazione || '',
      club_categoria: job.club_categoria || '',
      budget_fascia: job.budget_fascia || job.compenso || '',
      tipo_operazione: job.tipo_operazione || '',
      condizioni: job.condizioni || job.extra || '',
      category: league,
      under: !!job.under,
      housing: !!(job.housing || (job.benefit && /alloggio|vitto/i.test(job.benefit))),
      svincolato: !!(job.svincolato || job.disponibilita === 'svincolato'),
      raggio: job.raggio == null ? 4 : Number(job.raggio) || 4,
      quando: job.quando || relativeWhen(job.data_creazione || job.createdAt),
      ai: job.ai !== false,
      matchScore: job.matchScore || (job.ai === false ? 'Manuale' : 'IA')
    };
  }

  function extraJobs() {
    return [
      {
        id: 'ann-cerco-squadra-1', categoria: 'cerco_squadra', title: 'Centrocampista svincolato cerca squadra',
        role: 'Centrocampista', club: 'Profilo individuale', location: 'Foggia', category: 'Eccellenza',
        description: '2002, mezzala box-to-box, svincolato. Disponibile per provino in provincia.',
        ruolo_campo: 'Centrocampista', eta: 24, categoria_attuale: 'Eccellenza', disponibilita: 'svincolato',
        svincolato: true, raggio: 2, quando: 'Ieri'
      },
      {
        id: 'ann-cerco-allenatore-1', categoria: 'cerco_allenatore', title: 'Cercasi allenatore UEFA B — Promozione',
        role: 'Allenatore', club: 'ASD Lucera Calcio', location: 'Lucera', category: 'Promozione',
        description: 'Prima squadra Promozione. Richiesta UEFA B e disponibilità serale.',
        categoria_squadra: 'Prima squadra', livello: 'Promozione', qualifica_richiesta: 'UEFA B',
        raggio: 2, quando: '2 giorni fa'
      },
      {
        id: 'ann-cerco-arbitro-1', categoria: 'cerco_arbitro', title: 'Arbitro per campionato amatoriale domenicale',
        role: 'Arbitro', club: 'Foggia City', location: 'Foggia', category: 'Amatoriale',
        description: 'Gare domenicali, rimborso spese. Possibile impegno ricorrente.',
        livello_gare: 'Amatoriale', ricorrente: true, rimborso_spese: true, raggio: 1, quando: '4 giorni fa'
      },
      {
        id: 'ann-amichevole-1', categoria: 'cerco_amichevole', title: 'Amichevole Prima Squadra — fine settembre',
        role: 'Squadra', club: 'US San Severo', location: 'San Severo', category: 'Eccellenza',
        description: 'Cercasi avversario di livello simile. Campo disponibile il sabato pomeriggio.',
        categoria_squadra: 'Eccellenza', periodo_disponibile: '20–30 settembre 2026', campo_disponibile: true,
        raggio: 2, quando: 'Oggi'
      },
      {
        id: 'ann-sponsor-1', categoria: 'cerco_sponsor', title: 'Sponsor maglia stagione 2026/27',
        role: 'Sponsor', club: 'Foggia City', location: 'Foggia', category: 'Amatoriale',
        description: 'Spazio maglia home e cartellonistica stadio. Fascia da definire.',
        tipo_sponsorizzazione: 'maglia', club_categoria: 'Amatoriale', budget_fascia: 'Da definire',
        raggio: 1, quando: '5 giorni fa'
      },
      {
        id: 'ann-mercato-1', categoria: 'calciomercato', title: 'Cessione attaccante Under 23',
        role: 'Attaccante', club: 'ASD Virtus Foggia', location: 'Foggia', category: 'Serie D',
        description: 'Punta 2004, contratto in scadenza. Valutiamo cessione o prestito con diritto.',
        tipo_operazione: 'cessione', ruolo: 'Attaccante', categoria_squadra: 'Serie D',
        condizioni: 'Cessione o prestito con diritto di riscatto', raggio: 3, quando: '3 giorni fa'
      }
    ];
  }

  function badgeHtml(cat) {
    cat = infer({ categoria: cat });
    return '<span class="es-cat-badge" data-cat="' + esc(cat) + '">' + svg(cat, 14) + '<span>' + esc(LABEL[cat] || cat) + '</span></span>';
  }

  function populateDropdown() {
    var menu = document.querySelector('#dropdown-category .dropdown-options-menu');
    if (!menu || menu.dataset.annCats === '1') return;
    menu.dataset.annCats = '1';
    var html = '<div class="dropdown-option selected" data-value="all">Tutte le categorie</div>';
    CATS.forEach(function (c) {
      html += '<div class="dropdown-option" data-value="' + c + '">' + svg(c, 14) + '<span>' + LABEL[c] + '</span></div>';
    });
    menu.innerHTML = html;
    menu.querySelectorAll('.dropdown-option').forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        menu.querySelectorAll('.dropdown-option').forEach(function (o) { o.classList.remove('selected'); });
        option.classList.add('selected');
        var span = document.getElementById('category-selected-text');
        if (span) span.textContent = option.getAttribute('data-value') === 'all' ? 'Tutte le categorie' : (LABEL[option.getAttribute('data-value')] || option.textContent.trim());
        var dd = document.getElementById('dropdown-category');
        if (dd) dd.classList.remove('open');
        writeCatParam(option.getAttribute('data-value'));
        if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
      });
    });
  }

  function readCatParam() {
    try {
      var p = new URLSearchParams(window.location.search);
      var v = p.get('cat') || p.get('annCat') || '';
      if (CATS.indexOf(v) >= 0) return v;
      var hash = String(window.location.hash || '');
      var m = hash.match(/[?&]cat=([a-z_]+)/i);
      if (m && CATS.indexOf(m[1]) >= 0) return m[1];
    } catch (_) {}
    return '';
  }

  function writeCatParam(cat) {
    try {
      var u = new URL(window.location.href);
      if (!cat || cat === 'all') u.searchParams.delete('cat');
      else u.searchParams.set('cat', cat);
      history.replaceState({}, '', u.pathname + u.search + u.hash);
    } catch (_) {}
  }

  function applyCatParam() {
    var cat = readCatParam();
    if (!cat) return;
    var dd = document.getElementById('dropdown-category');
    if (!dd) return;
    dd.querySelectorAll('.dropdown-option').forEach(function (o) { o.classList.remove('selected'); });
    var opt = dd.querySelector('.dropdown-option[data-value="' + cat + '"]');
    if (opt) {
      opt.classList.add('selected');
      var span = document.getElementById('category-selected-text');
      if (span) span.textContent = LABEL[cat];
    }
  }

  function syncCatParam(catVal) {
    writeCatParam(catVal);
  }

  function field(id, label, inputHtml, required) {
    return '<label class="es-pub-field">' + esc(label) + (required ? ' *' : '') + inputHtml +
      '<span class="es-ann-err" data-err="' + id + '" hidden></span></label>';
  }
  function input(id, type, ph) {
    return '<input type="' + type + '" id="' + id + '" class="pf-input" placeholder="' + esc(ph || '') + '">';
  }
  function select(id, opts) {
    var h = '<select id="' + id + '" class="pf-input"><option value="">Seleziona</option>';
    opts.forEach(function (o) {
      var v = typeof o === 'string' ? o : o.v;
      var l = typeof o === 'string' ? o : o.l;
      h += '<option value="' + esc(v) + '">' + esc(l) + '</option>';
    });
    return h + '</select>';
  }
  function area(id, ph) {
    return '<textarea id="' + id + '" class="pf-input" rows="3" placeholder="' + esc(ph || '') + '"></textarea>';
  }
  function check(id, label) {
    return '<label class="es-pub-ai"><input type="checkbox" id="' + id + '"><span>' + esc(label) + '</span></label>';
  }

  var LEAGUES = ['Serie D', 'Eccellenza', 'Promozione', 'Prima Categoria', 'Seconda Categoria', 'Terza Categoria', 'Juniores', 'Under 19', 'Under 17', 'Amatoriale'];
  var RUOLI = ['Attaccante', 'Centrocampista', 'Difensore', 'Portiere', 'Ala', 'Regista', 'Terzino'];

  function specificFields(cat) {
    if (cat === 'cerco_squadra') {
      return field('ann-ruolo_campo', 'Ruolo in campo', select('ann-ruolo_campo', RUOLI), true) +
        field('ann-eta', 'Età', input('ann-eta', 'number', 'Es. 23'), true) +
        field('ann-categoria_attuale', 'Categoria attuale', select('ann-categoria_attuale', LEAGUES), true) +
        field('ann-disponibilita', 'Disponibilità', select('ann-disponibilita', [{ v: 'svincolato', l: 'Svincolato' }, { v: 'tesserato', l: 'Tesserato' }]), true);
    }
    if (cat === 'cerco_giocatore') {
      return field('ann-ruolo_cercato', 'Ruolo cercato', select('ann-ruolo_cercato', RUOLI), true) +
        field('ann-categoria_club', 'Categoria del club', select('ann-categoria_club', LEAGUES), true) +
        '<div class="es-pub-grid2">' +
          field('ann-eta_min', 'Età minima', input('ann-eta_min', 'number', 'Es. 18')) +
          field('ann-eta_max', 'Età massima', input('ann-eta_max', 'number', 'Es. 28')) +
        '</div>' +
        field('ann-esperienza_richiesta', 'Esperienza richiesta', input('ann-esperienza_richiesta', 'text', 'Es. 2 stagioni in Eccellenza'));
    }
    if (cat === 'cerco_allenatore') {
      return field('ann-categoria_squadra', 'Categoria squadra', select('ann-categoria_squadra', LEAGUES), true) +
        field('ann-livello', 'Livello', select('ann-livello', LEAGUES), true) +
        field('ann-qualifica_richiesta', 'Qualifica richiesta', select('ann-qualifica_richiesta', ['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'Licenza D', 'Allenatore dilettanti']), true);
    }
    if (cat === 'cerco_arbitro') {
      return field('ann-livello_gare', 'Livello gare', select('ann-livello_gare', ['Amatoriale', 'Terza Categoria', 'Seconda Categoria', 'Prima Categoria', 'Promozione', 'Eccellenza']), true) +
        field('ann-data_gara', 'Data gara', input('ann-data_gara', 'date')) +
        check('ann-ricorrente', 'Impegno ricorrente') +
        check('ann-rimborso_spese', 'Rimborso spese');
    }
    if (cat === 'cerco_amichevole') {
      return field('ann-categoria_squadra', 'Categoria squadra', select('ann-categoria_squadra', LEAGUES), true) +
        field('ann-periodo_disponibile', 'Periodo disponibile', input('ann-periodo_disponibile', 'text', 'Es. 20–30 settembre 2026'), true) +
        check('ann-campo_disponibile', 'Campo disponibile');
    }
    if (cat === 'cerco_sponsor') {
      return field('ann-tipo_sponsorizzazione', 'Tipo sponsorizzazione', select('ann-tipo_sponsorizzazione', [
        { v: 'maglia', l: 'Maglia' }, { v: 'cartellonistica', l: 'Cartellonistica' },
        { v: 'eventi', l: 'Eventi' }, { v: 'altro', l: 'Altro' }
      ]), true) +
        field('ann-club_categoria', 'Categoria club', select('ann-club_categoria', LEAGUES), true) +
        field('ann-budget_fascia', 'Fascia budget', select('ann-budget_fascia', ['Da definire', 'Fino a 1.000 €', '1.000–5.000 €', 'Oltre 5.000 €']));
    }
    if (cat === 'calciomercato') {
      return field('ann-tipo_operazione', 'Tipo operazione', select('ann-tipo_operazione', [
        { v: 'cessione', l: 'Cessione' }, { v: 'prestito', l: 'Prestito' }, { v: 'svincolo', l: 'Svincolo' }
      ]), true) +
        field('ann-ruolo', 'Ruolo', select('ann-ruolo', RUOLI), true) +
        field('ann-categoria_squadra', 'Categoria squadra', select('ann-categoria_squadra', LEAGUES), true) +
        field('ann-condizioni', 'Condizioni', area('ann-condizioni', 'Es. prestito con diritto di riscatto'));
    }
    return '';
  }

  function renderStep1() {
    var cards = CATS.map(function (c) {
      return '<button type="button" class="es-ann-catcard" data-ann-cat="' + c + '">' +
        svg(c, 22) + '<strong>' + esc(LABEL[c]) + '</strong><span>' + esc(HINT[c]) + '</span></button>';
    }).join('');
    return '<p class="es-pub-intro">Scegli la categoria. I campi del passo successivo si adattano al tipo di annuncio.</p>' +
      '<div class="es-ann-catgrid">' + cards + '</div>';
  }

  function renderStep2(cat) {
    return '<p class="es-pub-kicker">' + svg(cat, 16) + ' ' + esc(LABEL[cat]) + '</p>' +
      '<p class="es-pub-intro">' + esc(HINT[cat]) + '</p>' +
      '<div class="es-pub-grid2">' +
        field('ann-titolo', 'Titolo', input('ann-titolo', 'text', 'Es. ' + LABEL[cat]), true) +
        field('ann-societa', 'Autore / club', input('ann-societa', 'text', 'Nome visibile in bacheca')) +
      '</div>' +
      field('ann-descrizione', 'Descrizione', area('ann-descrizione', 'Descrivi la richiesta in modo chiaro.'), true) +
      '<div class="es-pub-grid2">' +
        field('ann-zona_citta', 'Città', input('ann-zona_citta', 'text', 'Es. Foggia'), true) +
        field('ann-zona_provincia', 'Provincia', input('ann-zona_provincia', 'text', 'Es. FG')) +
      '</div>' +
      '<div class="es-pub-grid2">' +
        field('ann-zona_regione', 'Regione', input('ann-zona_regione', 'text', 'Es. Puglia')) +
        field('ann-data_scadenza', 'Scadenza (opzionale)', input('ann-data_scadenza', 'date')) +
      '</div>' +
      '<fieldset class="es-pub-box"><legend>Dettagli ' + esc(LABEL[cat]) + '</legend>' + specificFields(cat) + '</fieldset>' +
      '<label class="es-pub-ai"><input type="checkbox" id="ann-ai" checked><span><strong>Selezione IA</strong> — se attiva, i profili compatibili restano collegati all’annuncio.</span></label>';
  }

  function paintWizard() {
    var form = document.getElementById('form-pubblica-annuncio');
    if (!form) return;
    var body = wizardStep === 1 ? renderStep1() : renderStep2(wizardCat);
    var actions = wizardStep === 1
      ? '<button type="button" class="btn btn-outline-pill" id="ann-cancel">Annulla</button>'
      : '<button type="button" class="btn btn-outline-pill" id="ann-back">Indietro</button>' +
        '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="ann-submit">Pubblica annuncio</button>';
    form.innerHTML = body + '<div class="es-pub-actions">' + actions + '</div>';
    form.querySelectorAll('[data-ann-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wizardCat = btn.getAttribute('data-ann-cat');
        wizardStep = 2;
        paintWizard();
      });
    });
    var cancel = document.getElementById('ann-cancel');
    if (cancel) cancel.addEventListener('click', closeModal);
    var back = document.getElementById('ann-back');
    if (back) back.addEventListener('click', function () { wizardStep = 1; paintWizard(); });
    var submit = document.getElementById('ann-submit');
    if (submit) submit.addEventListener('click', submitForm);
    var soc = document.getElementById('ann-societa');
    if (soc && !soc.value) soc.value = authorClub();
  }

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return !!el.checked;
    if (el.type === 'number') return el.value === '' ? '' : Number(el.value);
    return String(el.value || '').trim();
  }
  function showErr(id, msg) {
    var el = document.querySelector('[data-err="' + id + '"]');
    if (el) { el.hidden = !msg; el.textContent = msg || ''; }
    var inp = document.getElementById(id);
    if (inp) inp.classList.toggle('is-invalid', !!msg);
  }

  function requiredOf(cat) {
    var base = [
      { id: 'ann-titolo', key: 'titolo', msg: 'Inserisci un titolo.' },
      { id: 'ann-descrizione', key: 'descrizione', msg: 'Inserisci una descrizione.' },
      { id: 'ann-zona_citta', key: 'zona_citta', msg: 'Indica la città.' }
    ];
    var spec = {
      cerco_squadra: [
        { id: 'ann-ruolo_campo', key: 'ruolo_campo', msg: 'Seleziona il ruolo.' },
        { id: 'ann-eta', key: 'eta', msg: 'Indica l’età (14–55).' },
        { id: 'ann-categoria_attuale', key: 'categoria_attuale', msg: 'Seleziona la categoria.' },
        { id: 'ann-disponibilita', key: 'disponibilita', msg: 'Seleziona la disponibilità.' }
      ],
      cerco_giocatore: [
        { id: 'ann-ruolo_cercato', key: 'ruolo_cercato', msg: 'Seleziona il ruolo cercato.' },
        { id: 'ann-categoria_club', key: 'categoria_club', msg: 'Seleziona la categoria del club.' }
      ],
      cerco_allenatore: [
        { id: 'ann-categoria_squadra', key: 'categoria_squadra', msg: 'Seleziona la categoria squadra.' },
        { id: 'ann-livello', key: 'livello', msg: 'Seleziona il livello.' },
        { id: 'ann-qualifica_richiesta', key: 'qualifica_richiesta', msg: 'Seleziona la qualifica.' }
      ],
      cerco_arbitro: [
        { id: 'ann-livello_gare', key: 'livello_gare', msg: 'Seleziona il livello gare.' }
      ],
      cerco_amichevole: [
        { id: 'ann-categoria_squadra', key: 'categoria_squadra', msg: 'Seleziona la categoria.' },
        { id: 'ann-periodo_disponibile', key: 'periodo_disponibile', msg: 'Indica il periodo.' }
      ],
      cerco_sponsor: [
        { id: 'ann-tipo_sponsorizzazione', key: 'tipo_sponsorizzazione', msg: 'Seleziona il tipo.' },
        { id: 'ann-club_categoria', key: 'club_categoria', msg: 'Seleziona la categoria club.' }
      ],
      calciomercato: [
        { id: 'ann-tipo_operazione', key: 'tipo_operazione', msg: 'Seleziona il tipo di operazione.' },
        { id: 'ann-ruolo', key: 'ruolo', msg: 'Seleziona il ruolo.' },
        { id: 'ann-categoria_squadra', key: 'categoria_squadra', msg: 'Seleziona la categoria.' }
      ]
    };
    return base.concat(spec[cat] || []);
  }

  function collectPayload() {
    var cat = wizardCat;
    var payload = {
      id: 'ann-' + Date.now(),
      categoria: cat,
      titolo: val('ann-titolo'),
      title: val('ann-titolo'),
      descrizione: val('ann-descrizione'),
      desc: val('ann-descrizione'),
      societa: val('ann-societa') || authorClub() || 'Annuncio',
      club: val('ann-societa') || authorClub() || 'Annuncio',
      zona_citta: val('ann-zona_citta'),
      zona: val('ann-zona_citta'),
      location: val('ann-zona_citta'),
      zona_provincia: val('ann-zona_provincia'),
      zona_regione: val('ann-zona_regione'),
      data_scadenza: val('ann-data_scadenza'),
      data_creazione: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      stato: 'attivo',
      autore_id: authorId(),
      ai: document.getElementById('ann-ai') ? document.getElementById('ann-ai').checked : true,
      ruolo_campo: val('ann-ruolo_campo'),
      eta: val('ann-eta'),
      categoria_attuale: val('ann-categoria_attuale'),
      disponibilita: val('ann-disponibilita'),
      ruolo_cercato: val('ann-ruolo_cercato'),
      categoria_club: val('ann-categoria_club'),
      eta_min: val('ann-eta_min'),
      eta_max: val('ann-eta_max'),
      esperienza_richiesta: val('ann-esperienza_richiesta'),
      categoria_squadra: val('ann-categoria_squadra'),
      livello: val('ann-livello'),
      qualifica_richiesta: val('ann-qualifica_richiesta'),
      livello_gare: val('ann-livello_gare'),
      data_gara: val('ann-data_gara'),
      ricorrente: val('ann-ricorrente'),
      rimborso_spese: val('ann-rimborso_spese'),
      periodo_disponibile: val('ann-periodo_disponibile'),
      campo_disponibile: val('ann-campo_disponibile'),
      tipo_sponsorizzazione: val('ann-tipo_sponsorizzazione'),
      club_categoria: val('ann-club_categoria'),
      budget_fascia: val('ann-budget_fascia'),
      tipo_operazione: val('ann-tipo_operazione'),
      ruolo: val('ann-ruolo') || val('ann-ruolo_cercato') || val('ann-ruolo_campo'),
      condizioni: val('ann-condizioni'),
      raggio: 4
    };
    payload.category = payload.categoria_club || payload.categoria_squadra || payload.categoria_attuale || payload.livello || payload.club_categoria || '';
    payload.svincolato = payload.disponibilita === 'svincolato' || payload.tipo_operazione === 'svincolo';
    return payload;
  }

  function validateClient(payload) {
    var ok = true;
    requiredOf(payload.categoria).forEach(function (f) {
      showErr(f.id, '');
      var v = payload[f.key];
      if (v === true || v === false) return;
      if (f.key === 'eta') {
        var n = Number(v);
        if (!Number.isFinite(n) || n < 14 || n > 55) { showErr(f.id, f.msg); ok = false; }
        return;
      }
      if (v === 0) return;
      if (v == null || String(v).trim() === '') { showErr(f.id, f.msg); ok = false; }
    });
    return ok;
  }

  function persistLocal(item) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(STORE) || '[]') || []; } catch (_) { list = []; }
    list = list.filter(function (x) { return x && x.id !== item.id; });
    list.unshift(item);
    localStorage.setItem(STORE, JSON.stringify(list.slice(0, 80)));
  }

  function mergeRemote(items) {
    if (!Array.isArray(items) || !items.length) return;
    var local = [];
    try { local = JSON.parse(localStorage.getItem(STORE) || '[]') || []; } catch (_) { local = []; }
    var byId = {};
    local.forEach(function (j) { if (j && j.id) byId[j.id] = j; });
    items.forEach(function (j) {
      if (!j || !j.id) return;
      var cur = byId[j.id];
      var rt = Date.parse(j.data_creazione || j.createdAt || '') || 0;
      var lt = cur ? (Date.parse(cur.data_creazione || cur.createdAt || '') || 0) : 0;
      if (!cur || rt >= lt) byId[j.id] = j;
    });
    var next = Object.keys(byId).map(function (k) { return byId[k]; });
    next.sort(function (a, b) {
      return (Date.parse(b.data_creazione || b.createdAt || '') || 0) - (Date.parse(a.data_creazione || a.createdAt || '') || 0);
    });
    localStorage.setItem(STORE, JSON.stringify(next.slice(0, 80)));
  }

  function pullRemote() {
    fetch('/api/bacheca')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && Array.isArray(j.items)) {
          mergeRemote(j.items);
          if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
        }
      })
      .catch(function () {});
  }

  function migrateExisting() {
    try {
      var list = JSON.parse(localStorage.getItem(STORE) || '[]') || [];
      var changed = false;
      list = list.map(function (j) {
        var n = normalize(j);
        if (j.categoria !== n.categoria) changed = true;
        j.categoria = n.categoria;
        if (!j.titolo && n.titolo) j.titolo = n.titolo;
        if (!j.zona_citta && n.zona_citta) j.zona_citta = n.zona_citta;
        if (!j.stato) j.stato = 'attivo';
        return j;
      });
      if (changed) localStorage.setItem(STORE, JSON.stringify(list));
    } catch (_) {}
  }

  function submitForm() {
    var payload = collectPayload();
    if (!validateClient(payload)) {
      toast('Completa i campi obbligatori evidenziati.', 'error');
      return;
    }
    persistLocal(payload);
    fetch('/api/bacheca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) {
        toast('Salvato in locale. Sincronizzazione server in attesa.', 'warning');
        return {};
      }
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      if (j && j.ok === false && j.fields && j.fields.length) {
        toast('Il server ha rifiutato alcuni campi: ' + j.fields.join(', '), 'error');
      } else if (j && j.ok) {
        toast('Annuncio sincronizzato sul cloud.', 'success');
      }
    }).catch(function () {
      toast('Salvato in locale (offline). Verrà sincronizzato non appena torna la linea.', 'warning');
    });
    if (window.EliseeSchede && window.EliseeSchede.ensureJob) {
      try {
        window.EliseeSchede.ensureJob({
          id: payload.id,
          title: payload.titolo,
          club: payload.societa,
          role: payload.ruolo,
          location: payload.zona_citta,
          ai: payload.ai
        });
      } catch (_) {}
    }
    closeModal();
    if (typeof window.switchView === 'function') window.switchView('bacheca', '#bacheca-annunci');
    setTimeout(function () {
      writeCatParam(payload.categoria);
      applyCatParam();
      if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
      if (typeof window.trackEliseeActivity === 'function') window.trackEliseeActivity('candidatura', { nome: payload.societa || payload.titolo });
      toast('Annuncio pubblicato in «' + LABEL[payload.categoria] + '».', 'success');
      var jobs = document.getElementById('jobs-container');
      if (jobs) jobs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function openModal() {
    if (!isLogged()) {
      toast('Accedi per pubblicare un annuncio.', 'error');
      if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      return;
    }
    wizardCat = '';
    wizardStep = 1;
    var modal = document.getElementById('modal-pubblica-annuncio');
    if (!modal) { toast('Modulo annuncio non trovato.', 'error'); return; }
    var kicker = modal.querySelector('.portfolio-kicker');
    if (kicker) kicker.textContent = 'Bacheca annunci';
    var h3 = document.getElementById('pubblica-annuncio-title');
    if (h3) h3.textContent = 'Nuovo annuncio';
    paintWizard();
    modal.classList.add('is-open', 'open', 'active');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    modal.style.setProperty('z-index', '99999', 'important');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modal = document.getElementById('modal-pubblica-annuncio');
    if (!modal) return;
    modal.classList.remove('is-open', 'open', 'active');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
    document.body.style.overflow = '';
    wizardStep = 1;
    wizardCat = '';
  }

  function patchCtas() {
    var pub = document.getElementById('btn-bacheca-pubblica');
    if (pub) {
      pub.textContent = 'Nuovo annuncio';
      pub.setAttribute('title', 'Pubblica un nuovo annuncio');
    }
    var req = document.getElementById('btn-pubblica-richiesta');
    if (req) req.textContent = 'Nuovo annuncio';
    var lead = document.querySelector('#bacheca-annunci .pf-lead');
    if (lead) lead.textContent = 'Sette categorie di annuncio, filtrabili per ruolo, zona e raggio. Pubblica in due passi.';
  }

  var booted = false;
  function boot() {
    migrateExisting();
    patchCtas();
    populateDropdown();
    applyCatParam();
    window.openPubblicaAnnuncioModal = openModal;
    window.closePubblicaAnnuncioModal = closeModal;
    window.onPubblicaCandidatura = openModal;
    pullRemote();
    if (!booted) {
      booted = true;
      if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
    }
  }

  window.EliseeBacheca = {
    CATS: CATS,
    LABEL: LABEL,
    infer: infer,
    normalize: normalize,
    extraJobs: extraJobs,
    badgeHtml: badgeHtml,
    applyCatParam: applyCatParam,
    syncCatParam: syncCatParam,
    open: openModal,
    close: closeModal
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
})();
