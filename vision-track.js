/* Analisi del movimento sulle clip e sulle ricerche della bacheca.
   Misura i pixel che cambiano. Non stima km/h e non riconosce volti. */
(function () {
  var STORE = 'elisee_vision_clips_v1';
  var MAX_SECONDS = 8;
  var STEP = 0.5;
  var MAX_SAMPLES = 16;
  var W = 96;
  var H = 54;
  var DIFF = 18;

  var root = null;
  var listEl = null;
  var leadEl = null;
  var statusEl = null;
  var noteEl = null;
  var titleEl = null;
  var run = 0;
  var lastQuery = '';
  var filters = { alto: false, centro: false, early: false };

  var ZONE_CODE = [
    'alto-sinistra', 'alto-centro', 'alto-destra',
    'centro-sinistra', 'centro', 'centro-destra',
    'basso-sinistra', 'basso-centro', 'basso-destra'
  ];
  var ZONE_TAGS = {
    'alto-sinistra': ['alto', 'sinistra', 'top', 'left', 'arriba', 'izquierda', 'haut', 'gauche'],
    'alto-centro': ['alto', 'centro', 'top', 'center', 'arriba', 'centro', 'haut'],
    'alto-destra': ['alto', 'destra', 'top', 'right', 'arriba', 'derecha', 'haut', 'droite'],
    'centro-sinistra': ['centro', 'sinistra', 'center', 'left', 'izquierda', 'gauche'],
    'centro': ['centro', 'center', 'centre', 'central'],
    'centro-destra': ['centro', 'destra', 'center', 'right', 'derecha', 'droite'],
    'basso-sinistra': ['basso', 'sinistra', 'low', 'bottom', 'left', 'abajo', 'bas', 'gauche'],
    'basso-centro': ['basso', 'centro', 'low', 'bottom', 'center', 'abajo', 'bas'],
    'basso-destra': ['basso', 'destra', 'low', 'bottom', 'right', 'abajo', 'derecha', 'bas', 'droite']
  };
  var BAND_TAGS = {
    alto: ['alto', 'high', 'elevado', 'haut'],
    medio: ['medio', 'medium', 'moyen'],
    basso: ['basso', 'low', 'faible', 'bajo']
  };

  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var value = window.EliseeI18n.t(key);
        if (value && value !== key) return value;
      }
    } catch (e) {}
    return fallback;
  }

  function fold(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function hashKey(value) {
    var h = 5381;
    var text = String(value || '');
    for (var i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  function readUser() {
    try {
      var raw = localStorage.getItem('elisee_active_user');
      var user = raw ? JSON.parse(raw) : null;
      return user && typeof user === 'object' ? user : null;
    } catch (e) {
      return null;
    }
  }

  function accountKey() {
    var authed = false;
    try { authed = localStorage.getItem('elisee_user_auth') === 'true'; } catch (e) {}
    if (!authed) return 'guest';
    var user = readUser();
    var id = user ? String(user.id || user.email || user.username || '').trim().toLowerCase() : '';
    if (!id) return 'account';
    return 'u:' + hashKey(id);
  }

  function readStore() {
    try {
      var data = JSON.parse(localStorage.getItem(STORE) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (e) {
      return {};
    }
  }

  function loadClips() {
    var all = readStore();
    var list = all[accountKey()];
    return Array.isArray(list) ? list : [];
  }

  function saveClips(list) {
    var all = readStore();
    var next = list.slice(0, 12);
    all[accountKey()] = next;
    try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {}
    syncProfile(next);
    return next;
  }

  function syncProfile(list) {
    if (accountKey() === 'guest') return;
    var user = readUser();
    if (!user) return;
    user.visionTracks = list.slice(0, 12).map(function (clip) {
      return {
        id: clip.id,
        name: clip.name,
        band: clip.band,
        zone: clip.zone,
        motion: clip.motion,
        peak: clip.peak,
        duration: clip.duration,
        samples: clip.samples,
        at: clip.at
      };
    });
    try {
      var json = JSON.stringify(user);
      localStorage.setItem('elisee_active_user', json);
      localStorage.setItem('elisee_user_data', json);
    } catch (e) {}
  }

  function bandOf(mean) {
    if (mean >= 10) return 'alto';
    if (mean >= 3) return 'medio';
    return 'basso';
  }

  function zoneOf(weights) {
    var best = 0;
    var val = -1;
    for (var i = 0; i < weights.length; i++) {
      if (weights[i] > val) {
        val = weights[i];
        best = i;
      }
    }
    if (val <= 0) return { index: -1, name: '' };
    return { index: best, name: ZONE_CODE[best] || '' };
  }

  function summarizeSamples(meta, samples) {
    var weights = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var sum = 0;
    var n = 0;
    var peak = null;
    var track = [];
    (samples || []).forEach(function (sample) {
      var motion = Number(sample.motion) || 0;
      if (motion > 0) {
        sum += motion;
        n += 1;
        var idx = sample.zoneIndex;
        if (idx >= 0 && idx < 9) weights[idx] += motion;
      }
      if (!peak || motion > peak.motion) peak = sample;
      if (sample.x != null && sample.y != null) {
        track.push({ t: sample.t, x: sample.x, y: sample.y });
      }
    });
    var mean = n ? Math.round((sum / n) * 10) / 10 : 0;
    var zone = zoneOf(weights);
    return {
      id: String(meta.id || ''),
      name: String(meta.name || '').slice(0, 80),
      duration: Math.round((Number(meta.duration) || 0) * 10) / 10,
      width: meta.width || 0,
      height: meta.height || 0,
      samples: (samples || []).length,
      motion: mean,
      band: bandOf(mean),
      zone: zone.name,
      zoneIndex: zone.index,
      peak: peak ? peak.t : 0,
      track: track.slice(0, 8),
      at: meta.at || '',
      query: String(meta.query || '').slice(0, 120)
    };
  }

  function clipText(clip) {
    var tags = []
      .concat(BAND_TAGS[clip.band] || [])
      .concat(ZONE_TAGS[clip.zone] || [])
      .concat([clip.name, clip.zone, clip.band, clip.query]);
    return fold(tags.join(' '));
  }

  function matchClips(query, clips, active) {
    var list = Array.isArray(clips) ? clips.slice() : [];
    var flags = active || {};
    if (flags.alto) list = list.filter(function (clip) { return clip.band === 'alto'; });
    if (flags.centro) list = list.filter(function (clip) { return clip.zoneIndex === 4; });
    if (flags.early) list = list.filter(function (clip) { return Number(clip.peak) <= 2; });
    var tokens = fold(query).split(/[^a-z0-9]+/).filter(function (word) { return word.length >= 3; });
    if (!tokens.length) return list.slice(0, 5);
    return list.filter(function (clip) {
      var text = clipText(clip);
      return tokens.some(function (token) { return text.indexOf(token) >= 0; });
    }).slice(0, 5);
  }

  function currentQuery() {
    var input = document.getElementById('main-search-input');
    return input ? String(input.value || '').trim().slice(0, 120) : '';
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || '';
  }

  function show() {
    if (!root) return;
    var wasHidden = root.hidden;
    root.hidden = false;
    if (!wasHidden) return;
    var panel = document.getElementById('es-vision-panel');
    if (panel && panel.scrollIntoView) {
      try { panel.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
    }
  }

  function hide() {
    if (!root) return;
    root.hidden = true;
    var input = document.getElementById('main-search-input');
    if (input) {
      try { input.focus(); } catch (e) {}
    }
  }

  function zoneLabel(code) {
    if (!code) return tr('vision.zone.none', 'Nessuna zona dominante');
    return tr('vision.zone.' + code, code);
  }

  function paintFilters() {
    var box = document.getElementById('es-vision-filters');
    if (!box) return;
    [
      ['alto', 'vision.filter.alto', 'Movimento alto'],
      ['centro', 'vision.filter.centro', 'Zona centrale'],
      ['early', 'vision.filter.early', 'Picco iniziale']
    ].forEach(function (item) {
      var button = box.querySelector('[data-vision-filter="' + item[0] + '"]');
      if (!button) return;
      button.textContent = tr(item[1], item[2]);
      button.setAttribute('aria-pressed', filters[item[0]] ? 'true' : 'false');
      button.classList.toggle('is-on', !!filters[item[0]]);
    });
  }

  function render() {
    if (!listEl) return;
    var launch = document.getElementById('es-vision-launch');
    var closeBtn = document.getElementById('es-vision-close');
    if (titleEl) titleEl.textContent = tr('vision.title', 'Analisi del movimento');
    if (launch) launch.textContent = tr('vision.pick', 'Analizza una clip');
    if (closeBtn) closeBtn.textContent = tr('vision.close', 'Chiudi');
    if (noteEl) noteEl.textContent = tr('vision.note', 'Il video resta sul dispositivo. Si misura solo quanti pixel cambiano tra un fotogramma e l’altro, per i primi 8 secondi. Non calcola km/h e non riconosce volti.');
    if (leadEl) {
      leadEl.textContent = lastQuery
        ? tr('vision.lead', 'Ricerca collegata alle clip misurate su questo browser.') + ' ' + lastQuery
        : tr('vision.leadIdle', 'Le clip misurate su questo browser diventano filtri della ricerca.');
    }
    paintFilters();
    var rows = matchClips(lastQuery, loadClips(), filters);
    listEl.textContent = '';
    if (!rows.length) {
      var empty = document.createElement('li');
      empty.className = 'es-vision__empty';
      empty.textContent = tr('vision.empty', 'Nessuna clip misurata corrisponde a questa ricerca.');
      listEl.appendChild(empty);
      return;
    }
    rows.forEach(function (clip) {
      var li = document.createElement('li');
      li.className = 'es-vision__row';
      var name = document.createElement('p');
      name.className = 'es-vision__name';
      name.textContent = clip.name || tr('vision.clip', 'Clip');
      var meta = document.createElement('p');
      meta.className = 'es-vision__meta';
      meta.textContent = clip.duration + ' s · ' + clip.samples + ' ' + tr('vision.samples', 'fotogrammi')
        + ' · ' + tr('vision.motion', 'Movimento') + ' ' + clip.motion + '% · ' + tr('vision.band.' + clip.band, clip.band);
      var where = document.createElement('p');
      where.className = 'es-vision__meta';
      where.textContent = tr('vision.zoneLabel', 'Zona nel fotogramma') + ' ' + zoneLabel(clip.zone)
        + ' · ' + tr('vision.peak', 'Picco') + ' ' + clip.peak + ' s';
      li.appendChild(name);
      li.appendChild(meta);
      li.appendChild(where);
      if (clip.track && clip.track.length) {
        var trace = document.createElement('div');
        trace.className = 'es-vision__trace';
        var label = document.createElement('span');
        label.className = 'es-vision__trace-label';
        label.textContent = tr('vision.track', 'Traccia');
        trace.appendChild(label);
        clip.track.forEach(function (point) {
          var dot = document.createElement('span');
          dot.className = 'es-vision__dot';
          dot.style.setProperty('--x', String(Math.max(0, Math.min(100, point.x))));
          trace.appendChild(dot);
        });
        li.appendChild(trace);
      }
      listEl.appendChild(li);
    });
  }

  function openForQuery(query) {
    lastQuery = String(query || currentQuery() || '').slice(0, 120);
    show();
    render();
  }

  function fail(code) {
    var key = code === 'size' ? 'vision.badSize' : (code === 'type' ? 'vision.badType' : 'vision.badDecode');
    var fallback = code === 'size'
      ? 'La clip supera 80 MB.'
      : (code === 'type' ? 'Serve un video mp4, webm o mov.' : 'Il browser non riesce a leggere questo video.');
    setStatus(tr(key, fallback));
    show();
    render();
  }

  function remember(clip) {
    var list = loadClips().filter(function (item) { return item.id !== clip.id; });
    list.unshift(clip);
    saveClips(list);
    setStatus(tr('vision.done', 'Clip misurata. I numeri restano su questo browser.'));
    show();
    render();
  }

  function analyzeFile(file) {
    var my = ++run;
    if (!file) return Promise.reject(new Error('type'));
    var name = String(file.name || 'clip');
    var typeOk = /^video\//.test(file.type || '') || /\.(mp4|webm|mov)$/i.test(name);
    if (!typeOk) {
      fail('type');
      return Promise.reject(new Error('type'));
    }
    if (file.size > 80 * 1024 * 1024) {
      fail('size');
      return Promise.reject(new Error('size'));
    }
    show();
    setStatus(tr('vision.working', 'Lettura dei fotogrammi.'));
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var video = document.createElement('video');
      video.className = 'es-vision-probe';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = url;
      document.body.appendChild(video);
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d', { willReadFrequently: true });
      var samples = [];
      var prev = null;
      var settled = false;

      function cleanup() {
        try { URL.revokeObjectURL(url); } catch (e) {}
        try { video.removeAttribute('src'); video.load(); } catch (e2) {}
        if (video.parentNode) video.parentNode.removeChild(video);
      }
      function finish(err, clip) {
        if (settled) return;
        settled = true;
        cleanup();
        if (my !== run) return;
        if (err) {
          fail(err);
          reject(new Error(err));
          return;
        }
        remember(clip);
        resolve(clip);
      }
      video.addEventListener('error', function () { finish('decode'); });
      video.addEventListener('loadedmetadata', function () {
        var duration = video.duration;
        if (!isFinite(duration) || duration <= 0 || !ctx) {
          finish('decode');
          return;
        }
        var span = Math.min(duration, MAX_SECONDS);
        var times = [];
        var cursor = 0;
        while (cursor < span - 0.05 && times.length < MAX_SAMPLES) {
          times.push(Math.max(0, Math.min(cursor, duration - 0.05)));
          cursor += STEP;
        }
        if (!times.length) times.push(0);

        function grab(index) {
          if (my !== run) {
            settled = true;
            cleanup();
            return;
          }
          if (index >= times.length) {
            var meta = {
              id: hashKey(name + '|' + file.size),
              name: name,
              duration: duration,
              width: video.videoWidth || 0,
              height: video.videoHeight || 0,
              query: currentQuery(),
              at: new Date().toISOString()
            };
            finish(null, summarizeSamples(meta, samples));
            return;
          }
          var when = times[index];
          var done = false;
          var timer = setTimeout(function () { finish('decode'); }, 2500);
          function sampleFrame() {
            if (done) return;
            done = true;
            clearTimeout(timer);
            video.removeEventListener('seeked', sampleFrame);
            try {
              ctx.drawImage(video, 0, 0, W, H);
              var data = ctx.getImageData(0, 0, W, H).data;
              var gray = new Uint8Array(W * H);
              for (var p = 0, g = 0; p < data.length; p += 4, g++) {
                gray[g] = (data[p] * 0.3 + data[p + 1] * 0.59 + data[p + 2] * 0.11) | 0;
              }
              var zones = [0, 0, 0, 0, 0, 0, 0, 0, 0];
              var changed = 0;
              var cx = 0;
              var cy = 0;
              var mass = 0;
              if (prev) {
                for (var y = 0; y < H; y++) {
                  for (var x = 0; x < W; x++) {
                    var pos = y * W + x;
                    var delta = Math.abs(gray[pos] - prev[pos]);
                    if (delta > DIFF) {
                      changed += 1;
                      var zx = x < W / 3 ? 0 : (x < (2 * W) / 3 ? 1 : 2);
                      var zy = y < H / 3 ? 0 : (y < (2 * H) / 3 ? 1 : 2);
                      zones[zy * 3 + zx] += delta;
                      cx += x * delta;
                      cy += y * delta;
                      mass += delta;
                    }
                  }
                }
              }
              var zone = zoneOf(zones);
              samples.push({
                t: Math.round(when * 10) / 10,
                motion: prev ? Math.round((changed / (W * H)) * 1000) / 10 : 0,
                zoneIndex: zone.index,
                x: mass ? Math.round((cx / mass) / W * 100) : null,
                y: mass ? Math.round((cy / mass) / H * 100) : null
              });
              prev = gray;
              setStatus(tr('vision.frame', 'Fotogramma') + ' ' + (index + 1) + '/' + times.length);
              grab(index + 1);
            } catch (err) {
              finish('decode');
            }
          }
          video.addEventListener('seeked', sampleFrame);
          if (Math.abs((video.currentTime || 0) - when) < 0.04 && video.readyState >= 2) {
            sampleFrame();
            return;
          }
          try { video.currentTime = when; }
          catch (e) { finish('decode'); }
        }
        grab(0);
      });
    });
  }

  function onFile(ev) {
    var input = ev.target;
    var file = input && input.files && input.files[0];
    if (input) input.value = '';
    if (!file) return;
    analyzeFile(file).catch(function () {});
  }

  function onSearch(ev) {
    var detail = ev && ev.detail ? ev.detail : {};
    openForQuery(detail.q || currentQuery());
  }

  function onKey(ev) {
    if (!root || root.hidden || ev.key !== 'Escape') return;
    if (!root.contains(document.activeElement)) return;
    ev.preventDefault();
    hide();
  }

  function bindFilters() {
    var box = document.getElementById('es-vision-filters');
    if (!box) return;
    box.addEventListener('click', function (ev) {
      var button = ev.target.closest('[data-vision-filter]');
      if (!button) return;
      var key = button.getAttribute('data-vision-filter');
      if (!Object.prototype.hasOwnProperty.call(filters, key)) return;
      filters[key] = !filters[key];
      render();
    });
  }

  function bind() {
    root = document.getElementById('es-vision');
    listEl = document.getElementById('es-vision-list');
    leadEl = document.getElementById('es-vision-lead');
    statusEl = document.getElementById('es-vision-status');
    noteEl = document.getElementById('es-vision-note');
    titleEl = document.getElementById('es-vision-title');
    var launch = document.getElementById('es-vision-launch');
    var file = document.getElementById('es-vision-file');
    var closeBtn = document.getElementById('es-vision-close');
    if (launch && file) {
      launch.addEventListener('click', function () { file.click(); });
    }
    if (file) file.addEventListener('change', onFile);
    if (closeBtn) closeBtn.addEventListener('click', hide);
    document.addEventListener('elisee:scout-search', onSearch);
    document.addEventListener('elisee:lang-changed', render);
    document.addEventListener('keydown', onKey);
    bindFilters();
    var launchLabel = document.getElementById('es-vision-launch');
    if (launchLabel) launchLabel.textContent = tr('vision.pick', 'Analizza una clip');
  }

  var api = {
    bandOf: bandOf,
    zoneOf: zoneOf,
    summarizeSamples: summarizeSamples,
    matchClips: matchClips,
    analyzeFile: analyzeFile,
    openForQuery: openForQuery
  };
  if (typeof window !== 'undefined') window.EliseeVision = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
