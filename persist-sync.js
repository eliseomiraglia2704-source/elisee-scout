/* Sincronizza club/rosa e Card Elisee con /api/manager (KV). */
(function () {
  'use strict';

  var SUPABASE_URL = (window.ELISEE_SUPABASE_URL || 'https://uautnlmnpxgbajtucuko.supabase.co').replace(/\/$/, '');
  var SUPABASE_ANON = window.ELISEE_SUPABASE_ANON || 'sb_publishable_1e-KMVmQHAf9GduUTMKn8Q_9ibW1BK_';
  var timers = {};

  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {}; } catch (_) { return {}; }
  }
  function clubKey(u) {
    u = u || userObj();
    var club = String(u.squadra || u.club || u.clubName || u.societa || 'club').trim().toLowerCase();
    club = club.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'club';
    return club.slice(0, 80);
  }
  function authHeader() {
    try {
      var auth = JSON.parse(localStorage.getItem('elisee_auth_session') || '{}');
      if (auth && auth.access_token) return auth.access_token;
    } catch (_) {}
    return SUPABASE_ANON;
  }
  function debounce(name, fn, ms) {
    clearTimeout(timers[name]);
    timers[name] = setTimeout(fn, ms || 500);
  }
  function tsOf(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    return Date.parse(obj.lastUpdatedAt || obj.updatedAt || obj.savedAt || obj.at || '') || 0;
  }

  function apiPath(kind, key) {
    var q = '/api/manager?path=' + encodeURIComponent(kind);
    if (key) q += '&key=' + encodeURIComponent(key);
    return q;
  }
  function pushDoc(kind, payload) {
    return fetch(apiPath(kind), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }); }).catch(function () { return {}; });
  }
  function pullDoc(kind, key) {
    return fetch(apiPath(kind, key))
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function dataUrlToBlob(dataUrl) {
    var m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return null;
    var bin = atob(m[2]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: m[1] || 'image/png' });
  }

  function uploadPng(email, kind, dataUrl) {
    if (!dataUrl) return Promise.resolve('');
    if (/^https?:\/\//i.test(dataUrl)) return Promise.resolve(dataUrl);
    var blob = dataUrlToBlob(dataUrl);
    if (!blob) return Promise.resolve(dataUrl);
    var safe = String(email || 'user').replace(/[^a-z0-9@._-]+/gi, '_') + '-' + kind + '-' + Date.now() + '.png';
    var filePath = 'cards/' + safe;
    var url = SUPABASE_URL + '/storage/v1/object/staff-allegati/' + filePath;
    return fetch(url, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: 'Bearer ' + authHeader(),
        'Content-Type': 'image/png'
      },
      body: blob
    }).then(function (res) {
      if (!res.ok) return dataUrl;
      return SUPABASE_URL + '/storage/v1/object/public/staff-allegati/' + filePath;
    }).catch(function () { return dataUrl; });
  }

  function pushClub(data) {
    if (!data || typeof data !== 'object') return;
    debounce('club', function () {
      pushDoc('club', { key: clubKey(), data: data });
    });
  }
  function pullClub(cb) {
    pullDoc('club', clubKey()).then(function (j) {
      if (!j || !j.ok || !j.data) { if (cb) cb(null); return; }
      var local = null;
      try { local = JSON.parse(localStorage.getItem('elisee_pres_club_master_v3') || 'null'); } catch (_) {}
      if (!local || tsOf(j.data) >= tsOf(local) || (j.updatedAt && Date.parse(j.updatedAt) >= tsOf(local))) {
        try {
          localStorage.setItem('elisee_pres_club_master_v3', JSON.stringify(j.data));
          localStorage.setItem('elisee_pres_club_master_v2', JSON.stringify(j.data));
        } catch (_) {}
        if (cb) cb(j.data);
        return;
      }
      if (cb) cb(local);
    });
  }

  function pushCoach(data) {
    if (!data || typeof data !== 'object') return;
    data.updatedAt = new Date().toISOString();
    debounce('coach', function () {
      pushDoc('coach', { key: clubKey(), data: data });
    });
  }
  function pullCoach(cb) {
    pullDoc('coach', clubKey()).then(function (j) {
      if (!j || !j.ok || !j.data) { if (cb) cb(null); return; }
      var local = null;
      try { local = JSON.parse(localStorage.getItem('elisee_coach_data') || 'null'); } catch (_) {}
      if (!local || tsOf(j.data) >= tsOf(local) || (j.updatedAt && Date.parse(j.updatedAt) >= tsOf(local))) {
        try { localStorage.setItem('elisee_coach_data', JSON.stringify(j.data)); } catch (_) {}
        if (cb) cb(j.data);
        return;
      }
      if (cb) cb(local);
    });
  }

  function lightenCardMap(map) {
    var out = {};
    Object.keys(map || {}).forEach(function (k) {
      var row = Object.assign({}, map[k]);
      ['originalPng', 'draftPng', 'facePng'].forEach(function (f) {
        if (typeof row[f] === 'string' && row[f].indexOf('data:') === 0 && row[f + 'Url']) {
          row[f] = row[f + 'Url'];
        } else if (typeof row[f] === 'string' && row[f].indexOf('data:') === 0 && row[f].length > 40000) {
          delete row[f];
        }
      });
      out[k] = row;
    });
    return out;
  }

  function pushCard() {
    debounce('card', function () {
      var inbox = {};
      var published = {};
      var stats = {};
      try { inbox = JSON.parse(localStorage.getItem('elisee_card_inbox_v1') || '{}') || {}; } catch (_) {}
      try { published = JSON.parse(localStorage.getItem('elisee_card_published_v1') || '{}') || {}; } catch (_) {}
      try { stats = JSON.parse(localStorage.getItem('elisee_card_stats_v1') || '{}') || {}; } catch (_) {}
      var jobs = [];
      Object.keys(inbox).forEach(function (k) {
        var row = inbox[k] || {};
        ['originalPng', 'draftPng'].forEach(function (f) {
          if (row[f] && String(row[f]).indexOf('data:') === 0) {
            jobs.push(uploadPng(k, f, row[f]).then(function (url) {
              if (url && url.indexOf('http') === 0) {
                row[f + 'Url'] = url;
                if (url !== row[f]) row[f] = url;
              }
            }));
          }
        });
      });
      Object.keys(published).forEach(function (k) {
        var row = published[k] || {};
        if (row.facePng && String(row.facePng).indexOf('data:') === 0) {
          jobs.push(uploadPng(k, 'face', row.facePng).then(function (url) {
            if (url && url.indexOf('http') === 0) {
              row.facePngUrl = url;
              row.facePng = url;
            }
          }));
        }
      });
      Promise.all(jobs).then(function () {
        try {
          localStorage.setItem('elisee_card_inbox_v1', JSON.stringify(inbox));
          localStorage.setItem('elisee_card_published_v1', JSON.stringify(published));
        } catch (_) {}
        pushDoc('card', {
          inbox: lightenCardMap(inbox),
          published: lightenCardMap(published),
          stats: stats
        });
      });
    }, 700);
  }

  function mergeMaps(local, remote) {
    var out = Object.assign({}, local || {});
    Object.keys(remote || {}).forEach(function (k) {
      var a = local && local[k];
      var b = remote[k];
      if (!a) out[k] = b;
      else if (tsOf(b) >= tsOf(a)) out[k] = Object.assign({}, a, b);
    });
    return out;
  }

  function pullCard(cb) {
    pullDoc('card').then(function (j) {
      if (!j || !j.ok) { if (cb) cb(false); return; }
      var inbox = {};
      var published = {};
      var stats = {};
      try { inbox = JSON.parse(localStorage.getItem('elisee_card_inbox_v1') || '{}') || {}; } catch (_) {}
      try { published = JSON.parse(localStorage.getItem('elisee_card_published_v1') || '{}') || {}; } catch (_) {}
      try { stats = JSON.parse(localStorage.getItem('elisee_card_stats_v1') || '{}') || {}; } catch (_) {}
      inbox = mergeMaps(inbox, j.inbox);
      published = mergeMaps(published, j.published);
      stats = mergeMaps(stats, j.stats);
      try {
        localStorage.setItem('elisee_card_inbox_v1', JSON.stringify(inbox));
        localStorage.setItem('elisee_card_published_v1', JSON.stringify(published));
        localStorage.setItem('elisee_card_stats_v1', JSON.stringify(stats));
      } catch (_) {}
      if (cb) cb(true);
    });
  }

  window.EliseePersist = {
    clubKey: clubKey,
    pushClub: pushClub,
    pullClub: pullClub,
    pushCoach: pushCoach,
    pullCoach: pullCoach,
    pushCard: pushCard,
    pullCard: pullCard,
    uploadPng: uploadPng
  };
})();
