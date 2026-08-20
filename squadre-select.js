/**
 * ELISEE SCOUT â€” Selettore Squadre stile EA Sports FC
 * Catalogo: Serie A/B/C/D + dilettanti. Loghi locali same-origin.
 */
(function () {
  'use strict';

  var TEAMS = [];
  var LEAGUE_ORDER = [];
  var CATALOG_READY = false;
  var CATALOG_LOADING = false;
  var CATALOG_URL = 'data/squadre/catalog.json?v=20260820_KITSALL';
  /** Cache-bust loghi/kit locali */
  var LOGO_V = '20260820_COMOW1';
  var VERIFIED_URL = 'data/squadre/verified-teams.json?v=20260806_VERIFY';
  var VERIFIED_IDS = {};
  var VERIFIED_NAMES = {};
  var BADGE_OK = 'immagini/verifica/badge-verificato.svg';
  var BADGE_NO = 'immagini/verifica/badge-non-verificato.svg';

  var TEAMS_FALLBACK = [
    {
      id: 'napoli',
      name: 'NAPOLI',
      country: 'ITALIA',
      league: 'SERIE A',
      city: 'NAPOLI',
      year: '1926',
      abbr: 'NAP',
      gender: 'm',
      pos: 1,
      pts: 0,
      played: 0,
      logo: 'immagini/squadre-loghi/napoli.png',
      primary: '#12a0d7',
      secondary: '#ffffff',
      home: { body: '#12a0d7', sleeve: '#12a0d7' },
      away: { body: '#ffffff', sleeve: '#12a0d7' }
    }
  ];

  var state = {
    gender: 'm',
    leagueIndex: 0,
    index: 0,
    kit: 'home', // home | away | third | fourth
    ready: false,
    focusZone: 'team' // team | kit
  };

  var KIT_LABELS = {
    'home': 'IN CASA',
    'away': 'OSPITI',
    'third': 'TERZA',
    'fourth': 'QUARTA',
    'fifth': 'QUINTA',
    'goalkeeper': 'PORTIERE (CASA)',
    'goalkeeper-home': 'PORTIERE (CASA)',
    'gk': 'PORTIERE (CASA)',
    'goalkeeper-away': 'PORTIERE (OSPITI)',
    'goalkeeper away': 'PORTIERE (OSPITI)',
    'gk-away': 'PORTIERE (OSPITI)',
    'goalkeeper-third': 'PORTIERE (TERZA)',
    'gk-third': 'PORTIERE (TERZA)',
    'polo': 'POLO',
    'polo-1': 'POLO',
    'polo-2': 'POLO 2',
    'polo-style': 'POLO (STYLE)',
    'polo-white': 'POLO (BIANCA)',
    'polo-black': 'POLO (NERA)',
    'polo-blue': 'POLO (BLU)',
    'polo-red': 'POLO (ROSSA)',
    'pre-match': 'PRE-MATCH',
    'pre-match-home': 'PRE-MATCH (CASA)',
    'pre-match-away': 'PRE-MATCH (OSPITI)',
    'pre-match-third': 'PRE-MATCH (TERZA)',
    'pre-partita': 'PRE-PARTITA',
    'pre-season': 'PRE-SEASON',
    'pre-season-home': 'PRE-SEASON (CASA)',
    'pre-season-away': 'PRE-SEASON (OSPITI)',
    'pre-stagione': 'PRE-STAGIONE',
    'retro': 'MAGLIA RETRO',
    'travel-shirt': 'MAGLIA VIAGGIO',
    'training': 'ALLENAMENTO',
    'training-1': 'ALLENAMENTO 1',
    'training-2': 'ALLENAMENTO 2',
    'training-3': 'ALLENAMENTO 3',
    'training-goalkeeper': 'ALLENAMENTO PORTIERE',
    'training-gk': 'ALLENAMENTO PORTIERE',
    'training-staff': 'ALLENAMENTO STAFF',
    'training-home': 'ALLENAMENTO (CASA)',
    'training-away': 'ALLENAMENTO (OSPITI)',
    'training-third': 'ALLENAMENTO (TERZA)',
    'winter-training': 'ALLENAMENTO INVERNALE',
    'winter-training-goalkeeper': 'ALLENAMENTO INVERNALE PORTIERE',
    'winter-training-staff': 'ALLENAMENTO INVERNALE STAFF',
    't-shirt': 'T-SHIRT',
    't-shirt-2': 'T-SHIRT 2',
    'goalkeper-away': 'PORTIERE (OSPITI)',
    'trining': 'ALLENAMENTO'
  };

  var KIT_ORDER = [
    'home', 'away', 'third', 'fourth', 'fifth',
    'goalkeeper', 'goalkeeper-home', 'goalkeeper-away', 'goalkeeper-third',
    'pre-match', 'pre-match-home', 'pre-match-away', 'pre-match-third',
    'polo', 'polo-1', 'polo-2', 'polo-white', 'polo-black',
    'training', 'training-1', 'training-2', 'training-3',
    'training-home', 'training-away', 'training-third',
    'training-goalkeeper', 'training-staff'
  ];

  function getKitLabel(key, fallbackLabel) {
    if (fallbackLabel) return fallbackLabel;
    if (!key) return 'IN CASA';
    var k = String(key).toLowerCase().trim().replace(/[\s_]+/g, '-');
    if (KIT_LABELS[k]) return KIT_LABELS[k];
    var cleaned = k.replace(/[-_]+/g, ' ').toUpperCase();
    cleaned = cleaned.replace('GOALKEEPER', 'PORTIERE').replace('GK', 'PORTIERE');
    return cleaned;
  }

  var PRELOAD_CACHE = {};

  function preloadKitsForTeam(team) {
    if (!team) return;
    var slots = kitSlotsFor(team);
    for (var i = 0; i < slots.length; i++) {
      var url = slots[i].url;
      if (url) {
        var fullUrl = logoUrl(url);
        if (!PRELOAD_CACHE[fullUrl]) {
          var img = new Image();
          img.decoding = 'async';
          img.src = fullUrl;
          PRELOAD_CACHE[fullUrl] = img;
        }
      }
    }
  }

  function preloadNeighborKits() {
    try {
      var list = filtered();
      if (!list || !list.length) return;
      var idx = state.index;
      // Pre-carica la squadra corrente subito
      preloadKitsForTeam(list[idx]);
      // Pre-carica la squadra successiva e precedente in modo graduale (senza intasare la rete mobile)
      var nextTeam = list[(idx + 1) % list.length];
      var prevTeam = list[(idx - 1 + list.length) % list.length];
      setTimeout(function () {
        if (nextTeam) preloadKitsForTeam(nextTeam);
        if (prevTeam) preloadKitsForTeam(prevTeam);
      }, 80);
    } catch (e) {}
  }

  /** Slot kit disponibili per la squadra (foto 2D e/o colori). */
  function kitSlotsFor(team) {
    var slots = [];
    var seenKey = {};
    var seenUrl = {};
    if (!team) return [{ key: 'home', label: 'IN CASA', url: '', colors: null }];

    function normKey(key) {
      return String(key || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
    }

    function addSlot(key, label, url, colors) {
      var k = normKey(key);
      var u = String(url || '').replace(/\\/g, '/');
      if (!k && !u) return;
      if (!k) k = 'kit-' + slots.length;
      if (seenKey[k]) return;
      if (u && seenUrl[u]) return;
      seenKey[k] = true;
      if (u) seenUrl[u] = true;
      slots.push({
        key: k,
        label: getKitLabel(k, label),
        url: u,
        colors: colors || null
      });
    }

    if (Array.isArray(team.kits) && team.kits.length) {
      for (var i = 0; i < team.kits.length; i++) {
        var item = team.kits[i];
        if (item && (item.url || item.key)) {
          addSlot(item.key || 'kit-' + i, item.label, item.url);
        }
      }
    }

    var extras = [
      ['home', team.kitHome],
      ['away', team.kitAway],
      ['third', team.kitThird],
      ['fourth', team.kitFourth],
      ['fifth', team.kitFifth],
      ['goalkeeper', team.kitGoalkeeper || team.kitGk],
      ['goalkeeper-away', team.kitGoalkeeperAway],
      ['goalkeeper-third', team.kitGoalkeeperThird],
      ['pre-match', team.kitPreMatch],
      ['pre-match-home', team.kitPreMatchHome],
      ['pre-match-away', team.kitPreMatchAway],
      ['pre-match-third', team.kitPreMatchThird],
      ['polo', team.kitPolo],
      ['polo-2', team.kitPolo2],
      ['training', team.kitTraining],
      ['training-1', team.kitTraining1],
      ['training-2', team.kitTraining2],
      ['training-3', team.kitTraining3],
      ['training-staff', team.kitTrainingStaff],
      ['training-goalkeeper', team.kitTrainingGoalkeeper],
      ['pre-season-home', team.kitPreSeasonHome]
    ];
    for (var e = 0; e < extras.length; e++) {
      if (extras[e][1]) addSlot(extras[e][0], '', extras[e][1]);
    }

    if (!slots.length) {
      addSlot('home', 'IN CASA', '', team.home || null);
      addSlot('away', 'OSPITI', '', team.away || null);
    }

    slots.sort(function (a, b) {
      var ia = KIT_ORDER.indexOf(a.key);
      var ib = KIT_ORDER.indexOf(b.key);
      if (ia < 0) ia = 80;
      if (ib < 0) ib = 80;
      if (ia !== ib) return ia - ib;
      return String(a.label).localeCompare(String(b.label));
    });
    return slots;
  }

  function ensureKitKey(team) {
    var slots = kitSlotsFor(team);
    var keys = slots.map(function (s) {
      return s.key;
    });
    if (keys.indexOf(state.kit) < 0) {
      state.kit = keys[0] || 'home';
    }
    return slots;
  }

  function renderKitDots(slots) {
    var host = document.querySelector('.es-sq-kit-dots');
    if (!host) return;
    var next = $('es-sq-kit-next');
    var dots = host.querySelectorAll('.es-sq-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].parentNode.removeChild(dots[i]);
    }
    var insertBefore = next || null;
    for (var j = 0; j < slots.length; j++) {
      (function (slotObj) {
        var span = document.createElement('span');
        span.className = 'es-sq-dot' + (slotObj.key === state.kit ? ' on' : '');
        span.setAttribute('data-kit', slotObj.key);
        span.setAttribute('aria-label', slotObj.label || getKitLabel(slotObj.key));
        span.setAttribute('title', slotObj.label || getKitLabel(slotObj.key));
        span.style.cursor = 'pointer';
        span.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var keys = slots.map(function (s) { return s.key; });
          var from = keys.indexOf(state.kit);
          var to = keys.indexOf(slotObj.key);
          if (to === from) return;
          var dir = 1;
          if (from >= 0 && to >= 0) {
            var fwd = (to - from + keys.length) % keys.length;
            var back = (from - to + keys.length) % keys.length;
            dir = fwd <= back ? 1 : -1;
          }
          playKitShift(dir);
          state.kit = slotObj.key;
          var team = current();
          if (team) applyKit(team);
        });
        if (insertBefore) host.insertBefore(span, insertBefore);
        else host.appendChild(span);
      })(slots[j]);
    }
  }

  function $(id) {
    return document.getElementById(id);
  }

  function applyCatalog(data) {
    if (!data || !Array.isArray(data.teams) || !data.teams.length) return false;
    TEAMS = data.teams;
    LEAGUE_ORDER = Array.isArray(data.leagueOrder) ? data.leagueOrder : [];
    CATALOG_READY = true;
    try {
      if (window.EliseeSquadreSelect) {
        window.EliseeSquadreSelect.catalogStats = data.stats || null;
      }
    } catch (e) {}
    return true;
  }

  function loadVerifiedList() {
    return fetch(VERIFIED_URL, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('verified ' + r.status);
        return r.json();
      })
      .then(function (data) {
        VERIFIED_IDS = {};
        VERIFIED_NAMES = {};
        var ids = (data && data.verifiedIds) || [];
        var names = (data && data.verifiedNames) || [];
        for (var i = 0; i < ids.length; i++) {
          if (ids[i]) VERIFIED_IDS[String(ids[i]).toLowerCase()] = true;
        }
        for (var j = 0; j < names.length; j++) {
          if (names[j]) VERIFIED_NAMES[String(names[j]).toUpperCase().trim()] = true;
        }
        // merge optional local overrides (admin / futuro)
        try {
          var loc = JSON.parse(localStorage.getItem('elisee_verified_teams_v1') || 'null');
          if (loc && Array.isArray(loc.ids)) {
            loc.ids.forEach(function (id) {
              if (id) VERIFIED_IDS[String(id).toLowerCase()] = true;
            });
          }
          if (loc && Array.isArray(loc.names)) {
            loc.names.forEach(function (nm) {
              if (nm) VERIFIED_NAMES[String(nm).toUpperCase().trim()] = true;
            });
          }
        } catch (e) {}
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function isTeamVerified(team) {
    if (!team) return false;
    // regola: verificato SOLO se la squadra fa parte del progetto ELISEE
    if (team.verified === true || team.eliseeVerified === true) return true;
    if (team.verified === false) return false;
    var id = String(team.id || '').toLowerCase();
    var name = String(team.name || '').toUpperCase().trim();
    if (id && VERIFIED_IDS[id]) return true;
    if (name && VERIFIED_NAMES[name]) return true;
    return false;
  }

  function updateVerifyBadge(team) {
    var badge = $('es-sq-verify-badge');
    if (!badge) return;
    var ok = isTeamVerified(team);
    badge.src = ok ? BADGE_OK : BADGE_NO;
    badge.alt = ok ? 'Verificato ELISEE' : 'Non verificato';
    badge.title = ok
      ? 'Verificato \u2014 la squadra fa parte del progetto ELISEE SCOUT'
      : 'Non verificato \u2014 la squadra non fa ancora parte del progetto ELISEE';
    badge.classList.toggle('is-verified', ok);
    badge.classList.toggle('is-unverified', !ok);
    badge.hidden = false;
  }

  function loadCatalog() {
    if (CATALOG_READY && TEAMS.length) return Promise.resolve(true);
    if (CATALOG_LOADING) {
      return new Promise(function (resolve) {
        var n = 0;
        var t = setInterval(function () {
          n += 1;
          if (CATALOG_READY || n > 40) {
            clearInterval(t);
            resolve(CATALOG_READY);
          }
        }, 50);
      });
    }
    CATALOG_LOADING = true;

    // Force fresh network fetch, purge legacy cache
    try {
      sessionStorage.removeItem('elisee_catalog_cache_v2');
      sessionStorage.removeItem('elisee_cat_fast_v1');
    } catch (e) {}

    return Promise.all([
      fetch(CATALOG_URL, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('catalog ' + r.status);
        return r.json();
      }),
      loadVerifiedList()
    ])
      .then(function (pair) {
        if (!applyCatalog(pair[0])) throw new Error('empty');
        return true;
      })
      .catch(function () {
        if (!TEAMS.length) {
          TEAMS = TEAMS_FALLBACK.slice();
          LEAGUE_ORDER = [];
        }
        return loadVerifiedList().then(function () {
          return false;
        });
      })
      .then(function (ok) {
        CATALOG_LOADING = false;
        return ok;
      });
  }

  function leaguesForGender() {
    var seen = {};
    var order = [];
    function push(lg) {
      if (!lg || seen[lg]) return;
      if (String(lg).toUpperCase().indexOf('(ARCHIVIO)') >= 0) return;
      var has = false;
      for (var i = 0; i < TEAMS.length; i++) {
        if (TEAMS[i].gender === state.gender && TEAMS[i].league === lg) {
          has = true;
          break;
        }
      }
      if (has) {
        seen[lg] = true;
        order.push(lg);
      }
    }
    if (LEAGUE_ORDER && LEAGUE_ORDER.length) {
      LEAGUE_ORDER.forEach(push);
    }
    TEAMS.forEach(function (t) {
      if (t.gender === state.gender) push(t.league);
    });
    return order;
  }

  function currentLeague() {
    var leagues = leaguesForGender();
    if (!leagues.length) return '';
    if (state.leagueIndex < 0) state.leagueIndex = leagues.length - 1;
    if (state.leagueIndex >= leagues.length) state.leagueIndex = 0;
    return leagues[state.leagueIndex];
  }

  function filtered() {
    var league = currentLeague();
    var list = TEAMS.filter(function (t) {
      return t.gender === state.gender && t.league === league;
    });
    list.sort(function (a, b) {
      var an = String(a && a.name ? a.name : '').toUpperCase();
      var bn = String(b && b.name ? b.name : '').toUpperCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
    return list;
  }

  function current() {
    var list = filtered();
    if (!list.length) return null;
    if (state.index < 0) state.index = list.length - 1;
    if (state.index >= list.length) state.index = 0;
    return list[state.index];
  }

  function updateStadiumPhoto(team) {
    var panel = $('es-sq-city-panel');
    var bg = $('es-sq-city-bg');
    if (!bg) return;
    var src = team && team.stadiumImage ? String(team.stadiumImage).trim() : '';
    if (!src) src = 'immagini/stadi/_default.jpg';
    var url = src.indexOf('?') >= 0 ? src : src + '?v=14';
    bg.style.backgroundImage = 'url("' + url.replace(/"/g, '') + '")';
    bg.onerror = null;
    if (panel) panel.classList.add('has-stadium-photo');
    // se l'immagine non carica, fallback default
    var probe = new Image();
    probe.onerror = function () {
      if (src.indexOf('_default') >= 0) return;
      bg.style.backgroundImage = 'url("immagini/stadi/_default.jpg?v=14")';
    };
    probe.src = url;
  }

  function positionHtml(team) {
    // Stagione in avvio: classifica a zero (niente punti fittizi)
    var pts = team && team.pts != null ? Number(team.pts) : 0;
    var played = team && team.played != null ? Number(team.played) : 0;
    if (isNaN(pts)) pts = 0;
    if (isNaN(played)) played = 0;
    if (played <= 0) {
      return '<div class="es-sq-pos-meta">0 pt · 0 gare</div>';
    }
    var pos = team.pos != null ? team.pos : '—';
    return (
      '<div class="es-sq-pos-main">' +
      '<span class="es-sq-pos-num">' +
      pos +
      '°</span>' +
      '<span class="es-sq-pos-label">in classifica</span>' +
      '</div>' +
      '<div class="es-sq-pos-meta">' +
      pts +
      ' pt · ' +
      played +
      ' gare</div>'
    );
  }

  function slotByOffset(slots, key, delta) {
    if (!slots || !slots.length) return null;
    var idx = 0;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].key === key) {
        idx = i;
        break;
      }
    }
    return slots[(idx + delta + slots.length) % slots.length];
  }

  function setGhostKit(btnId, imgId, slot, team) {
    var btn = $(btnId);
    var img = $(imgId);
    if (!btn || !img) return;
    if (!slot || !slot.url) {
      btn.hidden = true;
      btn.style.removeProperty('--kit-src');
      try {
        img.removeAttribute('src');
      } catch (e) {}
      return;
    }
    var targetSrc = logoUrl(slot.url);
    btn.style.setProperty('--kit-src', 'url("' + String(targetSrc).replace(/"/g, '') + '")');
    img.dataset.currentSrc = targetSrc;
    img.alt = ((team && team.name) || '') + ' ' + (slot.label || getKitLabel(slot.key));
    img.onerror = function () {
      if (this.dataset.currentSrc !== targetSrc) return;
      btn.hidden = true;
    };
    img.onload = function () {
      if (this.dataset.currentSrc !== targetSrc) return;
      btn.hidden = false;
    };
    img.src = targetSrc;
    btn.hidden = false;
    btn.setAttribute('data-kit', slot.key);
    btn.setAttribute('title', slot.label || getKitLabel(slot.key));
  }

  function updateKitGhosts(team, slots) {
    var stage = document.getElementById('es-sq-kit-stage');
    if (!slots || slots.length < 2) {
      if (stage) stage.classList.add('is-solo');
      setGhostKit('es-sq-kit-ghost-prev', 'es-sq-kit-prev-img', null, team);
      setGhostKit('es-sq-kit-ghost-next', 'es-sq-kit-next-img', null, team);
      return;
    }
    if (stage) stage.classList.remove('is-solo');
    setGhostKit('es-sq-kit-ghost-prev', 'es-sq-kit-prev-img', slotByOffset(slots, state.kit, -1), team);
    setGhostKit('es-sq-kit-ghost-next', 'es-sq-kit-next-img', slotByOffset(slots, state.kit, 1), team);
  }

  function playKitShift(dir) {
    var stage = document.getElementById('es-sq-kit-stage');
    if (!stage) return;
    var srcImg = $('es-sq-kit-img');
    var leave = $('es-sq-kit-leave');
    var leaveImg = $('es-sq-kit-leave-img');
    var title = $('es-sq-kit-title');
    if (leave && leaveImg && srcImg && srcImg.src && !srcImg.hidden) {
      leaveImg.src = srcImg.currentSrc || srcImg.src;
      leave.hidden = false;
    } else if (leave) {
      leave.hidden = true;
    }
    stage.classList.remove('is-kit-shift-prev', 'is-kit-shift-next');
    if (title) title.classList.remove('is-kit-title-swap');
    void stage.offsetWidth;
    stage.classList.add(dir < 0 ? 'is-kit-shift-next' : 'is-kit-shift-prev');
    if (title) title.classList.add('is-kit-title-swap');
    clearTimeout(playKitShift._t);
    playKitShift._t = setTimeout(function () {
      stage.classList.remove('is-kit-shift-prev', 'is-kit-shift-next');
      if (leave) leave.hidden = true;
      if (title) title.classList.remove('is-kit-title-swap');
    }, 580);
  }

  function syncGoldRing() {
    var card = document.querySelector('.es-sq-main');
    var svg = $('es-sq-gold-svg');
    var rect = $('es-sq-gold-rect');
    if (!card || !svg || !rect) return;
    var w = Math.max(120, card.clientWidth || 400);
    var h = Math.max(160, card.clientHeight || 420);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var pad = 3;
    rect.setAttribute('x', pad);
    rect.setAttribute('y', pad);
    rect.setAttribute('width', Math.max(20, w - pad * 2));
    rect.setAttribute('height', Math.max(20, h - pad * 2));
    rect.setAttribute('rx', 18);
    rect.setAttribute('ry', 18);
  }

  function playGoldSweep() {
    var card = document.querySelector('.es-sq-main');
    if (!card) return;
    syncGoldRing();
    card.classList.remove('is-gold-sweep');
    void card.offsetWidth;
    card.classList.add('is-gold-sweep');
    clearTimeout(playGoldSweep._t);
    playGoldSweep._t = setTimeout(function () {
      if (card) card.classList.remove('is-gold-sweep');
    }, 720);
  }

  function applyKit(team) {
    var slots = ensureKitKey(team);
    renderKitDots(slots);
    updateKitGhosts(team, slots);

    var slot = null;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].key === state.kit) {
        slot = slots[i];
        break;
      }
    }
    if (!slot) slot = slots[0] || { key: 'home', label: 'IN CASA', url: '' };

    var title = $('es-sq-kit-title');
    if (title) title.textContent = slot.label || getKitLabel(slot.key);

    var img = $('es-sq-kit-img');
    var vector = $('es-sq-kit-vector');
    var kitUrl = (slot && slot.url) || '';

    // 2D real kit photo (home / away / third / fourth / goalkeeper / apparel)
    if (img && kitUrl) {
      var targetSrc = logoUrl(kitUrl);
      img.dataset.currentSrc = targetSrc;
      img.hidden = false;
      img.classList.remove('is-hidden');
      img.decoding = 'async';
      img.alt = (team && team.name ? team.name : '') + ' ' + (slot.label || getKitLabel(slot.key));

      img.onerror = function () {
        if (this.dataset.currentSrc !== targetSrc) return;
        this.hidden = true;
        this.classList.add('is-hidden');
        if (vector) vector.hidden = false;
      };
      img.onload = function () {
        if (this.dataset.currentSrc !== targetSrc) return;
        this.hidden = false;
        this.classList.remove('is-hidden');
        if (vector) vector.hidden = true;
      };

      if (vector) vector.hidden = true;
      img.src = targetSrc;
      return;
    }

    if (img) {
      img.hidden = true;
      img.classList.add('is-hidden');
      try {
        img.removeAttribute('src');
      } catch (e) {}
    }
    if (vector) vector.hidden = false;

    // Fallback: color blocks
    var kit = null;
    if (state.kit === 'away') kit = team && team.away;
    else if (state.kit === 'home') kit = team && team.home;
    if (!kit) {
      var p = (team && team.primary) || '#1e3a5f';
      var s = (team && team.secondary) || '#ffffff';
      kit =
        state.kit === 'away'
          ? { body: s, sleeve: p }
          : { body: p, sleeve: p };
    }
    var body = $('es-sq-kit-body');
    var sl = $('es-sq-kit-sleeve-l');
    var sr = $('es-sq-kit-sleeve-r');
    if (body) body.style.background = kit.body || (team && team.primary) || '#1e3a5f';
    if (sl) sl.style.background = kit.sleeve || kit.body || (team && team.primary) || '#1e3a5f';
    if (sr) sr.style.background = kit.sleeve || kit.body || (team && team.primary) || '#1e3a5f';
  }

  function showFallback(abbr, team) {
    var img = $('es-sq-crest-img');
    var fb = $('es-sq-crest-fallback');
    if (img) {
      img.style.display = 'none';
      try {
        img.removeAttribute('src');
      } catch (e) {}
    }
    if (fb) {
      fb.hidden = false;
      fb.textContent = abbr || 'FC';
      var p = (team && team.primary) || '#1e3a5f';
      var s = (team && team.secondary) || '#0f172a';
      fb.style.background =
        'radial-gradient(circle at 30% 30%, ' + p + 'cc, ' + s + 'ee 70%, #0f172a)';
    }
  }

  /** Logo ufficiale lega da football-logos.cc (file locali) */
  function leagueLogoPath(leagueName) {
    var lg = String(leagueName || '').toUpperCase();
    if (lg.indexOf('FEMMINILE') >= 0) {
      if (lg.indexOf('PRIMAVERA 1') >= 0) {
        return 'immagini/squadre-loghi/primavera-1-femminile.png';
      }
      if (lg.indexOf('PRIMAVERA 2') >= 0) {
        return 'immagini/squadre-loghi/primavera-2-femminile.png';
      }
      if (lg.indexOf('SERIE A') >= 0) {
        return 'immagini/squadre-loghi/serie-a-femminile.png';
      }
      if (lg.indexOf('SERIE B') >= 0) {
        return 'immagini/squadre-loghi/serie-b-femminile.png';
      }
      if (lg.indexOf('SERIE C') >= 0) {
        return 'immagini/squadre-loghi/serie-c-femminile.png';
      }
    }
    if (lg.indexOf('SERIE A') === 0 && lg.indexOf('FEMMINILE') < 0) {
      return 'immagini/squadre-loghi/serie-a.png';
    }
    if (lg.indexOf('SERIE B') === 0 && lg.indexOf('FEMMINILE') < 0) {
      return 'immagini/squadre-loghi/serie-b.png';
    }
    if (lg.indexOf('SERIE C') === 0) {
      return 'immagini/squadre-loghi/serie-c.png';
    }
    if (lg.indexOf('SERIE D') === 0) {
      return 'immagini/squadre-loghi/serie-d.png';
    }
    if (lg.indexOf('PRIMAVERA 1') === 0) {
      return 'immagini/squadre-loghi/primavera-1.png';
    }
    if (lg.indexOf('PRIMAVERA 2') === 0) {
      return 'immagini/squadre-loghi/primavera-2.png';
    }
    if (lg.indexOf('PRIMAVERA 3') === 0) {
      return 'immagini/squadre-loghi/primavera-3.png';
    }
    if (lg.indexOf('PRIMAVERA 4') === 0) {
      return 'immagini/squadre-loghi/primavera-4.png';
    }
    return '';
  }

  function updateLeagueLogo(leagueName) {
    var img = $('es-sq-league-logo');
    if (!img) return;
    var src = leagueLogoPath(leagueName);
    if (!src) {
      img.hidden = true;
      img.classList.add('is-hidden');
      img.removeAttribute('src');
      img.alt = '';
      return;
    }
    var isWomen = String(leagueName || '').toUpperCase().indexOf('FEMMINILE') >= 0;
    img.classList.toggle('is-women', isWomen);
    img.hidden = false;
    img.classList.remove('is-hidden');
    img.alt = leagueName + ' logo';
    img.onerror = function () {
      this.hidden = true;
      this.classList.add('is-hidden');
    };
    img.onload = function () {
      this.hidden = false;
      this.classList.remove('is-hidden');
    };
    var bust = logoUrl(src);
    if (img.getAttribute('src') !== bust) {
      img.src = bust;
    }
  }

  function logoUrl(url) {
    if (!url) return '';
    var u = String(url);
    if (u.indexOf('?') >= 0) return u + '&v=' + LOGO_V;
    return u + '?v=' + LOGO_V;
  }

  function showLogo(url, team) {
    var img = $('es-sq-crest-img');
    var fb = $('es-sq-crest-fallback');
    if (!img) return;
    if (!url) {
      showFallback(team && team.abbr, team);
      return;
    }
    img.onerror = function () {
      showFallback(team && team.abbr, team);
    };
    img.onload = function () {
      this.style.display = 'block';
      if (fb) fb.hidden = true;
    };
    img.alt = (team && team.name ? team.name : '') + ' logo';
    img.decoding = 'async';
    try {
      img.removeAttribute('crossorigin');
      img.crossOrigin = null;
    } catch (e) {}
    img.referrerPolicy = 'no-referrer';
    img.src = logoUrl(url);
    img.style.display = 'block';
  }

  function render() {
    var team = current();
    var nameEl = $('es-sq-team-name');
    if (!team) {
      if (nameEl) {
        nameEl.textContent = CATALOG_LOADING || !TEAMS.length ? 'CARICAMENTO\u2026' : 'NESSUNA SQUADRA';
      }
      var leagueEmpty = $('es-sq-league');
      if (leagueEmpty) leagueEmpty.textContent = currentLeague() || '\u2014';
      return;
    }

    var crest = $('es-sq-crest');
    var starsEl = $('es-sq-stars');
    var leagueEl = $('es-sq-league');
    var countryEl = $('es-sq-country');
    var cityEl = $('es-sq-city');
    var stadiumEl = $('es-sq-stadium');
    var capacityEl = $('es-sq-capacity');
    var abbrEl = $('es-sq-crest-abbr');
    var yearEl = $('es-sq-crest-year');
    var counterEl = $('es-sq-counter');
    var league = currentLeague() || team.league || '';

    if (nameEl) nameEl.textContent = team.name;
    updateVerifyBadge(team);
    if (starsEl) starsEl.innerHTML = positionHtml(team);
    if (leagueEl) {
      leagueEl.textContent = league;
      leagueEl.setAttribute('title', league);
    }
    updateLeagueLogo(league);
    if (countryEl) countryEl.textContent = team.country || 'ITALIA';
    if (cityEl) cityEl.textContent = team.city || '—';
    if (stadiumEl) {
      stadiumEl.textContent = team.stadium || 'Stadio non disponibile';
      stadiumEl.setAttribute('title', team.stadium || '');
    }
    if (capacityEl) {
      var cap = team.capacity;
      if (cap != null && cap !== '' && !isNaN(Number(cap)) && Number(cap) > 0) {
        capacityEl.textContent = 'Capienza: ' + Number(cap).toLocaleString('it-IT');
      } else {
        capacityEl.textContent = 'Capienza: —';
      }
    }
    updateStadiumPhoto(team);
    if (abbrEl) abbrEl.textContent = team.abbr || '';
    if (yearEl) yearEl.textContent = team.year || '';

    var list = filtered();
    if (counterEl) {
      // Solo progressione squadre nella categoria (niente "CAT. x/y")
      counterEl.textContent = list.length ? state.index + 1 + ' / ' + list.length : '';
    }

    if (crest) {
      crest.style.background = 'transparent';
      var img = $('es-sq-crest-img');
      if (!img) {
        crest.innerHTML =
          '<img id="es-sq-crest-img" class="es-sq-crest-img" alt="" />' +
          '<div class="es-sq-crest-fallback" id="es-sq-crest-fallback" hidden></div>';
      }
      showLogo(team.logo || '', team);
    }
    applyKit(team);
    preloadNeighborKits();
  }

  function preloadLogosForCategory() {
    try {
      var list = filtered();
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var logo = list[i].logo;
        if (logo) {
          var fullLogo = logoUrl(logo);
          if (!PRELOAD_CACHE[fullLogo]) {
            var img = new Image();
            img.decoding = 'async';
            img.src = fullLogo;
            PRELOAD_CACHE[fullLogo] = img;
          }
        }
      }
    } catch (e) {}
  }

  function animThen(fn) {
    // Rendere istantaneo l'aggiornamento dello stato (0ms latenza)
    fn();
    var crest = $('es-sq-crest');
    if (crest) {
      crest.classList.add('is-anim');
      setTimeout(function () {
        crest.classList.remove('is-anim');
      }, 90);
    }
  }

  function next(dir) {
    var list = filtered();
    if (!list.length) return;
    animThen(function () {
      state.index = (state.index + dir + list.length) % list.length;
      state.kit = 'home';
      render();
      playGoldSweep();
    });
  }

  function setGender(g) {
    if (state.gender === g) return;
    state.gender = g;
    state.leagueIndex = 0;
    state.index = 0;
    state.kit = 'home';
    render();
    playGoldSweep();
  }

  function nextLeague(dir) {
    var leagues = leaguesForGender();
    if (!leagues.length) return;
    state.leagueIndex = (state.leagueIndex + dir + leagues.length) % leagues.length;
    state.index = 0;
    state.kit = 'home';
    render();
    playGoldSweep();
  }

  function selectLeagueByIndex(idx) {
    var leagues = leaguesForGender();
    if (!leagues.length) return;
    if (idx < 0 || idx >= leagues.length) return;
    state.leagueIndex = idx;
    state.index = 0;
    state.kit = 'home';
    closeLeaguePicker();
    render();
    playGoldSweep();
  }

  function selectLeagueByName(name) {
    var leagues = leaguesForGender();
    var i = leagues.indexOf(name);
    if (i < 0) {
      // match case-insensitive
      for (var k = 0; k < leagues.length; k++) {
        if (String(leagues[k]).toLowerCase() === String(name).toLowerCase()) {
          i = k;
          break;
        }
      }
    }
    if (i >= 0) selectLeagueByIndex(i);
  }

  function isPickerOpen() {
    var p = $('es-sq-league-picker');
    return p && !p.hidden && p.classList.contains('is-open');
  }

  function openLeaguePicker() {
    var picker = $('es-sq-league-picker');
    if (!picker) return;
    // fuori dalla card (overflow:hidden) così la lista può scendere tutta
    if (picker.parentNode !== document.body) {
      document.body.appendChild(picker);
    }
    buildLeaguePickerList('');
    picker.hidden = false;
    picker.removeAttribute('hidden');
    picker.style.display = 'flex';
    picker.setAttribute('aria-hidden', 'false');
    // force reflow then animate
    void picker.offsetWidth;
    picker.classList.add('is-open');
    var search = $('es-sq-league-search');
    if (search) {
      search.value = '';
      setTimeout(function () {
        try {
          search.focus();
        } catch (e) {}
      }, 80);
    }
    var pill = $('es-sq-league-pill');
    if (pill) pill.setAttribute('aria-expanded', 'true');
  }

  function closeLeaguePicker() {
    var picker = $('es-sq-league-picker');
    if (!picker) return;
    picker.classList.remove('is-open');
    picker.setAttribute('aria-hidden', 'true');
    var pill = $('es-sq-league-pill');
    if (pill) pill.setAttribute('aria-expanded', 'false');
    setTimeout(function () {
      if (picker && !picker.classList.contains('is-open')) {
        picker.hidden = true;
        picker.setAttribute('hidden', '');
        picker.style.display = 'none';
      }
    }, 220);
  }

  function buildLeaguePickerList(filter) {
    var listEl = $('es-sq-league-list');
    if (!listEl) return;
    var leagues = leaguesForGender();
    var q = String(filter || '')
      .trim()
      .toLowerCase();
    var current = currentLeague();
    var html = '';
    var count = 0;
    for (var i = 0; i < leagues.length; i++) {
      var lg = leagues[i];
      if (q && String(lg).toLowerCase().indexOf(q) < 0) continue;
      count += 1;
      var logo = leagueLogoPath(lg);
      var active = lg === current ? ' is-active' : '';
      // team count in league for current gender
      var nTeams = 0;
      for (var t = 0; t < TEAMS.length; t++) {
        if (TEAMS[t].gender === state.gender && TEAMS[t].league === lg) nTeams += 1;
      }
      // Una riga = griglia fissa: logo | nome | count | check (niente stack sovrapposto)
      html +=
        '<button type="button" class="es-sq-picker-item' +
        active +
        '" role="option" data-league-index="' +
        i +
        '" data-league="' +
        String(lg).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '') +
        '" aria-selected="' +
        (lg === current ? 'true' : 'false') +
        '">' +
        (logo
          ? '<img class="es-sq-picker-item-logo' +
            (String(lg).toUpperCase().indexOf('FEMMINILE') >= 0 ? ' is-women' : '') +
            '" src="' +
            logoUrl(logo) +
            '" alt="" width="28" height="28" loading="lazy" referrerpolicy="no-referrer" />'
          : '<span class="es-sq-picker-item-badge" aria-hidden="true">' +
            String(lg).charAt(0) +
            '</span>') +
        '<span class="es-sq-picker-item-name">' +
        lg +
        '</span>' +
        '<span class="es-sq-picker-item-meta">' +
        nTeams +
        '</span>' +
        (lg === current
          ? '<span class="es-sq-picker-item-check" aria-hidden="true">\u2713</span>'
          : '<span class="es-sq-picker-item-check es-sq-picker-item-check--empty" aria-hidden="true"></span>') +
        '</button>';
    }
    if (!count) {
      html =
        '<div class="es-sq-picker-empty">Nessuna categoria trovata. Prova un altro termine.</div>';
    }
    listEl.innerHTML = html;
    setPickerCursor(getPickerCursorIndex(), false);
  }

  function pickerItems() {
    var list = $('es-sq-league-list');
    if (!list) return [];
    return Array.prototype.slice.call(list.querySelectorAll('.es-sq-picker-item'));
  }

  function getPickerCursorIndex() {
    var items = pickerItems();
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i].classList.contains('is-cursor')) return i;
    }
    for (i = 0; i < items.length; i++) {
      if (items[i].classList.contains('is-active')) return i;
    }
    return items.length ? 0 : -1;
  }

  function setPickerCursor(idx, scroll) {
    var items = pickerItems();
    if (!items.length) return;
    if (idx < 0) idx = 0;
    if (idx >= items.length) idx = items.length - 1;
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-cursor', i === idx);
    }
    if (scroll !== false && items[idx] && items[idx].scrollIntoView) {
      try {
        items[idx].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch (e) {
        items[idx].scrollIntoView(false);
      }
    }
  }

  function movePickerCursor(dir) {
    var items = pickerItems();
    if (!items.length) return;
    var cur = getPickerCursorIndex();
    if (cur < 0) cur = 0;
    setPickerCursor(cur + dir, true);
  }

  function confirmPickerCursor() {
    var items = pickerItems();
    var i = getPickerCursorIndex();
    if (i < 0 || !items[i]) return;
    var idx = parseInt(items[i].getAttribute('data-league-index'), 10);
    if (!isNaN(idx)) selectLeagueByIndex(idx);
  }

  function selectTeam() {
    var team = current();
    if (!team) return;
    try {
      localStorage.setItem(
        'elisee_selected_squadra',
        JSON.stringify({
          id: team.id,
          name: team.name,
          league: team.league,
          city: team.city,
          stadium: team.stadium || '',
          capacity: team.capacity != null ? team.capacity : null,
          pos: team.pos,
          pts: team.pts,
          logo: team.logo || '',
          at: new Date().toISOString()
        })
      );
    } catch (e) {}
    if (typeof window.showToast === 'function') {
      window.showToast('Hai scelto ' + team.name, 'success');
    }
    document.dispatchEvent(new CustomEvent('elisee:squadra-selected', { detail: team }));
  }

  function bindOnce(el, ev, fn, key) {
    if (!el) return;
    var k = key || ev;
    if (el.dataset && el.dataset[k + 'Bound'] === '1') return;
    if (el.dataset) el.dataset[k + 'Bound'] = '1';
    el.addEventListener(ev, fn);
  }

  function addSwipeSupport(el, onSwipeLeft, onSwipeRight) {
    if (!el) return;
    if (el.dataset && el.dataset.swipeBound === '1') return;
    if (el.dataset) el.dataset.swipeBound = '1';

    var startX = 0;
    var startY = 0;
    var distX = 0;
    var distY = 0;

    el.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches.length) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      distX = 0;
      distY = 0;
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (!e.touches || !e.touches.length) return;
      distX = e.touches[0].clientX - startX;
      distY = e.touches[0].clientY - startY;
    }, { passive: true });

    el.addEventListener('touchend', function () {
      if (Math.abs(distX) >= 28 && Math.abs(distX) > Math.abs(distY) * 1.1) {
        if (distX < 0) {
          if (typeof onSwipeLeft === 'function') onSwipeLeft();
        } else {
          if (typeof onSwipeRight === 'function') onSwipeRight();
        }
      }
      startX = 0;
      startY = 0;
      distX = 0;
      distY = 0;
    }, { passive: true });
  }

  function bindUI() {
    if (!$('view-squadre') || !$('es-sq-team-name')) return false;

    bindOnce($('es-sq-prev'), 'click', function (e) {
      e.preventDefault();
      next(-1);
    }, 'sq');
    bindOnce($('es-sq-next'), 'click', function (e) {
      e.preventDefault();
      next(1);
    }, 'sq');
    bindOnce($('es-sq-league-prev'), 'click', function (e) {
      e.preventDefault();
      nextLeague(-1);
    }, 'sql');
    bindOnce($('es-sq-league-next'), 'click', function (e) {
      e.preventDefault();
      nextLeague(1);
    }, 'sql');

    // Pillola categoria â†’ apre tabella selezione
    bindOnce($('es-sq-league-pill'), 'click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isPickerOpen()) closeLeaguePicker();
      else openLeaguePicker();
    }, 'sqlpick');

    bindOnce($('es-sq-picker-close'), 'click', function (e) {
      e.preventDefault();
      closeLeaguePicker();
    }, 'sqlpick');
    bindOnce($('es-sq-picker-backdrop'), 'click', function (e) {
      e.preventDefault();
      closeLeaguePicker();
    }, 'sqlpick');

    var searchEl = $('es-sq-league-search');
    if (searchEl && searchEl.dataset.sqlSearchBound !== '1') {
      searchEl.dataset.sqlSearchBound = '1';
      searchEl.addEventListener('input', function () {
        buildLeaguePickerList(searchEl.value);
      });
      searchEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLeaguePicker();
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          movePickerCursor(1);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          movePickerCursor(-1);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          confirmPickerCursor();
        }
      });
    }

    var listEl = $('es-sq-league-list');
    if (listEl && listEl.dataset.sqlListBound !== '1') {
      listEl.dataset.sqlListBound = '1';
      listEl.addEventListener('mouseover', function (e) {
        var btn = e.target.closest('.es-sq-picker-item');
        if (!btn) return;
        var items = pickerItems();
        var i = items.indexOf(btn);
        if (i >= 0) setPickerCursor(i, false);
      });
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.es-sq-picker-item');
        if (!btn) return;
        e.preventDefault();
        var idx = parseInt(btn.getAttribute('data-league-index'), 10);
        if (!isNaN(idx)) selectLeagueByIndex(idx);
      });
    }

    if (!document.documentElement.dataset.esSqPickerEsc) {
      document.documentElement.dataset.esSqPickerEsc = '1';
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isPickerOpen()) {
          e.preventDefault();
          closeLeaguePicker();
        }
      });
    }

    document.querySelectorAll('input[name="es-sq-gender"]').forEach(function (r) {
      bindOnce(
        r,
        'change',
        function () {
          if (r.checked) setGender(r.value);
        },
        'sqg'
      );
    });

    function setFocusZone(zone) {
      state.focusZone = zone === 'kit' ? 'kit' : 'team';
      var kitEl = document.querySelector('.es-sq-kit-panel');
      var mainEl = document.querySelector('.es-sq-main');
      if (kitEl) kitEl.classList.toggle('is-focused', state.focusZone === 'kit');
      if (mainEl) mainEl.classList.toggle('is-focused', state.focusZone === 'team');
    }

    function focusKitPanel() {
      var kitEl = document.querySelector('.es-sq-kit-panel');
      setFocusZone('kit');
      if (kitEl && typeof kitEl.focus === 'function') {
        try {
          kitEl.focus({ preventScroll: true });
        } catch (err) {
          kitEl.focus();
        }
      }
    }

    function focusTeamPanel() {
      var mainEl = document.querySelector('.es-sq-main');
      setFocusZone('team');
      if (mainEl && typeof mainEl.focus === 'function') {
        try {
          mainEl.focus({ preventScroll: true });
        } catch (err) {
          mainEl.focus();
        }
      }
    }

    function cycleKit(dir) {
      var team = current();
      var slots = kitSlotsFor(team);
      if (!slots.length) return;
      var keys = slots.map(function (s) {
        return s.key;
      });
      var idx = keys.indexOf(state.kit);
      if (idx < 0) idx = 0;
      idx = (idx + dir + keys.length) % keys.length;
      state.kit = keys[idx];
      playKitShift(dir);
      if (team) applyKit(team);
    }
    bindOnce(
      $('es-sq-kit-prev'),
      'click',
      function (e) {
        if (e) e.preventDefault();
        cycleKit(-1);
      },
      'sq'
    );
    bindOnce(
      $('es-sq-kit-next'),
      'click',
      function (e) {
        if (e) e.preventDefault();
        cycleKit(1);
      },
      'sq'
    );
    bindOnce(
      $('es-sq-kit-ghost-prev'),
      'click',
      function (e) {
        if (e) e.preventDefault();
        cycleKit(-1);
      },
      'sqgprev'
    );
    bindOnce(
      $('es-sq-kit-ghost-next'),
      'click',
      function (e) {
        if (e) e.preventDefault();
        cycleKit(1);
      },
      'sqgnext'
    );
    bindOnce($('es-sq-select'), 'click', function (e) {
      e.preventDefault();
      selectTeam();
    }, 'sq');
    // Supporto Touch Swipe su dispositivi mobile (trascinamento con le dita per voltare divisa/club)
    var kitPanel = document.querySelector('.es-sq-kit-panel');
    if (kitPanel) {
      addSwipeSupport(kitPanel, function () { cycleKit(1); }, function () { cycleKit(-1); });
      bindOnce(kitPanel, 'pointerdown', function () {
        focusKitPanel();
      }, 'kitfocus');
      bindOnce(kitPanel, 'focus', function () {
        setFocusZone('kit');
      }, 'kitfocusin');
    }
    var kitImg = $('es-sq-kit-img');
    if (kitImg && kitImg.parentNode) {
      addSwipeSupport(kitImg.parentNode, function () { cycleKit(1); }, function () { cycleKit(-1); });
    }
    var mainCard = document.querySelector('.es-sq-main');
    if (mainCard) {
      addSwipeSupport(mainCard, function () { next(1); }, function () { next(-1); });
      bindOnce(mainCard, 'pointerdown', function () {
        focusTeamPanel();
      }, 'teamfocus');
      bindOnce(mainCard, 'focus', function () {
        setFocusZone('team');
      }, 'teamfocusin');
    }

    bindOnce(
      $('es-sq-back-bacheca'),
      'click',
      function (e) {
        e.preventDefault();
        if (window.switchView) window.switchView('bacheca', '#bacheca-annunci');
      },
      'sq'
    );

    if (!document.documentElement.dataset.esSqKeys) {
      document.documentElement.dataset.esSqKeys = '1';
      document.addEventListener('keydown', function (e) {
        var view = $('view-squadre');
        if (!view) return;
        var vis = window.getComputedStyle(view).display;
        if (vis === 'none') return;
        // Picker categorie aperto: ↑ ↓ spostano categoria per categoria
        if (isPickerOpen()) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            movePickerCursor(1);
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            movePickerCursor(-1);
            return;
          }
          if (e.key === 'Enter') {
            var tPick = e.target;
            if (tPick && tPick.closest && tPick.closest('.es-sq-picker-item')) return;
            e.preventDefault();
            confirmPickerCursor();
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            closeLeaguePicker();
            return;
          }
        }
        // Non intercettare se focus su input/textarea/select
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
          return;
        }
        // ← → = squadra, oppure divise se la sezione Divisa ha il focus
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          if (state.focusZone === 'kit') cycleKit(-1);
          else next(-1);
          return;
        }
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          if (state.focusZone === 'kit') cycleKit(1);
          else next(1);
          return;
        }
        // â†‘ â†“ LIBERE per lo scroll della pagina (non cambiano categoria)
        // Categoria: Ctrl+â†‘/â†“ oppure i pulsanti freccia "Categoria" a schermo
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (e.ctrlKey || e.altKey)) {
          e.preventDefault();
          nextLeague(e.key === 'ArrowUp' ? -1 : 1);
          return;
        }
        if (e.key === 'Enter') {
          if (t && t.closest && t.closest('button, a')) return;
          selectTeam();
        }
      });
    }

    state.ready = true;
    render();
    syncGoldRing();
    if (!document.documentElement.dataset.esSqGoldResize) {
      document.documentElement.dataset.esSqGoldResize = '1';
      window.addEventListener('resize', function () {
        syncGoldRing();
      });
    }
    return true;
  }

  function refresh() {
    return loadCatalog().then(function () {
      // clamp indexes
      var leagues = leaguesForGender();
      if (state.leagueIndex >= leagues.length) state.leagueIndex = 0;
      var list = filtered();
      if (state.index >= list.length) state.index = 0;
      bindUI();
      render();
      return true;
    });
  }

  function forceShow() {
    try {
      var v = $('view-squadre');
      if (v) {
        v.style.setProperty('display', 'block', 'important');
        v.hidden = false;
        v.style.setProperty('visibility', 'visible', 'important');
        v.style.setProperty('pointer-events', 'auto', 'important');
        v.style.setProperty('opacity', '1', 'important');
      }
    } catch (e) {}
    return refresh();
  }

  document.addEventListener('elisee:view-changed', function (ev) {
    var v = ev && ev.detail && ev.detail.view;
    var h = (ev && ev.detail && ev.detail.hash) || '';
    if (v === 'squadre' || (h && String(h).indexOf('squadre') >= 0)) {
      setTimeout(function () {
        forceShow();
      }, 20);
    }
  });

  window.EliseeSquadreSelect = {
    init: refresh,
    forceShow: forceShow,
    refresh: refresh,
    next: next,
    nextLeague: nextLeague,
    selectLeagueByIndex: selectLeagueByIndex,
    selectLeagueByName: selectLeagueByName,
    openLeaguePicker: openLeaguePicker,
    closeLeaguePicker: closeLeaguePicker,
    select: selectTeam,
    getSelected: current,
    isTeamVerified: isTeamVerified,
    loadCatalog: loadCatalog,
    get teams() {
      return TEAMS;
    },
    get leagueOrder() {
      return LEAGUE_ORDER;
    },
    get ready() {
      return CATALOG_READY;
    }
  };

  function boot() {
    refresh();
    setTimeout(function () {
      if ((location.hash || '').indexOf('squadre') >= 0) forceShow();
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
