/* Mappa club — pin con stemmi, geolocalizzazione club e coordinamento catalogo squadre */
(function () {
  'use strict';

  var REGISTERED_URL = 'data/squadre/verified-teams.json?v=20261001_FIX15';
  var COMUNI_URL = 'data/geo/comuni-coord.json?v=20261001_FIX15';
  var MAX_PINS = 3500;
  var clubs = null;
  var activeFilter = 'all';
  var comuniIndex = null;
  var comuniLoad = null;

  function isSerieAToEccellenza(c) {
    if (!c) return false;
    var l = (c.league || c.group || '').trim().toUpperCase();
    if (!l) return false;
    if (l.indexOf('PRIMAVERA') !== -1 || l.indexOf('ARCHIVIO') !== -1 || l.indexOf('U19') !== -1 || l.indexOf('UNDER') !== -1) {
      return false;
    }
    if (l.indexOf('FEMMINILE') !== -1 || (c.gender && String(c.gender).toLowerCase() === 'f')) {
      return false;
    }
    if (l.indexOf('ECCELLENZA') !== -1) return true;
    if (/^SERIE\s+[ABCD](\s|$|—|-)/i.test(l)) return true;
    return false;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var value = window.EliseeI18n.t(key);
        if (value && value !== key) return value;
      }
    } catch (_) {}
    return fallback;
  }
  function meKey() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      return String(u.email || u.id || '').trim().toLowerCase();
    } catch (_) { return ''; }
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {}; } catch (_) { return {}; }
  }
  function getGeoOverrides() {
    try { return JSON.parse(localStorage.getItem('elisee_club_geo_overrides') || '{}') || {}; } catch (_) { return {}; }
  }
  function saveGeoOverride(clubId, geo) {
    try {
      var all = getGeoOverrides();
      all[clubId] = geo;
      localStorage.setItem('elisee_club_geo_overrides', JSON.stringify(all));
      localStorage.setItem('elisee_club_geo', JSON.stringify(geo));
      var u = getStoredUser();
      u.clubGeo = geo;
      localStorage.setItem('elisee_active_user', JSON.stringify(u));
    } catch (_) {}
  }
  function myClubGeo() {
    try {
      var u = getStoredUser();
      if (u.clubGeo && u.clubGeo.lat) return u.clubGeo;
      var raw = localStorage.getItem('elisee_club_geo');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function initials(name) {
    var p = String(name || 'C').trim().split(/\s+/);
    return ((p[0] || 'C').charAt(0) + (p[1] || p[0] || 'L').charAt(0)).toUpperCase();
  }

  function normPlace(s) {
    return String(s || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function loadComuniIndex() {
    if (comuniIndex) return Promise.resolve(comuniIndex);
    if (comuniLoad) return comuniLoad;
    comuniLoad = fetch(COMUNI_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        var byName = {};
        var byProv = {};
        (rows || []).forEach(function (row) {
          var hit = { name: row[0], prov: row[1], lat: row[2], lng: row[3], region: row[4] };
          var key = normPlace(hit.name);
          if (!byName[key]) byName[key] = [];
          byName[key].push(hit);
          byProv[key + '|' + String(hit.prov || '').toLowerCase()] = hit;
        });
        comuniIndex = { byName: byName, byProv: byProv, rows: rows || [] };
        return comuniIndex;
      })
      .catch(function () {
        comuniIndex = { byName: {}, byProv: {}, rows: [] };
        return comuniIndex;
      });
    return comuniLoad;
  }

  function matchComune(idx, query) {
    var raw = String(query || '').trim();
    if (!raw || !idx) return null;
    var prov = '';
    var namePart = raw;
    var tagged = raw.match(/^(.*)\(([A-Za-z]{2})\)\s*$/);
    if (tagged) {
      namePart = tagged[1].trim();
      prov = tagged[2].toLowerCase();
    }
    var key = normPlace(namePart);
    if (prov && idx.byProv[key + '|' + prov]) return idx.byProv[key + '|' + prov];
    var list = idx.byName[key] || [];
    if (list.length === 1) return list[0];
    return null;
  }

  function lookupComune(query) {
    return loadComuniIndex().then(function (idx) { return matchComune(idx, query); });
  }

  function knownRegion(name) {
    if (!name || typeof REGION_CENTERS === 'undefined') return '';
    var keys = Object.keys(REGION_CENTERS);
    var q = String(name).trim().toLowerCase();
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === q) return keys[i];
    }
    return '';
  }

  function readLocalRegistered() {
    try {
      var loc = JSON.parse(localStorage.getItem('elisee_registered_teams_v1') || '[]');
      return Array.isArray(loc) ? loc.filter(function (t) { return t && t.id && t.id !== 'barletta'; }) : [];
    } catch (_) { return []; }
  }

  function writeLocalRegistered(list) {
    try { localStorage.setItem('elisee_registered_teams_v1', JSON.stringify(list)); } catch (_) {}
  }

  function upsertLocalRegistered(team) {
    if (!team || !team.id) return;
    var list = readLocalRegistered();
    var idx = -1;
    var want = normPlace(team.name);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === team.id || (want && normPlace(list[i].name) === want)) idx = i;
    }
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], team);
    else list.push(team);
    writeLocalRegistered(list);
  }

  function invalidateClubs() { clubs = null; }

  function loadClubs(done) {
    if (clubs) { done(clubs); return; }
    Promise.all([
      fetch(REGISTERED_URL, { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return { registeredTeams: [] }; }),
      loadComuniIndex()
    ]).then(function (pair) {
      var data = pair[0];
      var idx = pair[1];
      var base = (data && Array.isArray(data.registeredTeams)) ? data.registeredTeams.slice() : [];
      var seen = {};
      base.forEach(function (t) { if (t && t.id) seen[String(t.id).toLowerCase()] = true; });
      readLocalRegistered().forEach(function (t) {
        var id = String(t.id).toLowerCase();
        if (!seen[id]) {
          seen[id] = true;
          base.push(t);
          return;
        }
        for (var i = 0; i < base.length; i++) {
          if (String(base[i].id).toLowerCase() !== id) continue;
          if (typeof t.lat === 'number') base[i].lat = t.lat;
          if (typeof t.lng === 'number') base[i].lng = t.lng;
          if (t.region) base[i].region = t.region;
          if (t.city) base[i].city = t.city;
          if (t.stadium) base[i].stadium = t.stadium;
        }
      });
      var overrides = getGeoOverrides();
      base.forEach(function (c) {
        if (!c) return;
        var pinned = false;
        if (c.id && overrides[c.id]) {
          var o = overrides[c.id];
          if (typeof o.lat === 'number' && typeof o.lng === 'number') {
            c.lat = o.lat;
            c.lng = o.lng;
            pinned = true;
          }
          if (o.stadium) c.stadium = o.stadium;
          if (o.city) c.city = o.city;
          if (o.region) c.region = o.region;
        }
        var hit = c.city ? matchComune(idx, c.city) : null;
        if (hit) {
          c.region = hit.region;
          if (!pinned) {
            c.lat = hit.lat;
            c.lng = hit.lng;
          }
        } else {
          c.region = knownRegion(c.region) || '';
        }
      });
      clubs = base.filter(function (c) { return c && c.id && c.name; });
      done(clubs);
    }).catch(function () {
      clubs = [];
      done(clubs);
    });
  }

  function fillCityDatalist(listEl) {
    return loadComuniIndex().then(function (idx) {
      if (!listEl || listEl.childNodes.length) return idx;
      var frag = document.createDocumentFragment();
      idx.rows.forEach(function (row) {
        var opt = document.createElement('option');
        opt.value = row[0] + ' (' + row[1] + ')';
        frag.appendChild(opt);
      });
      listEl.appendChild(frag);
      return idx;
    });
  }

  window.EliseeComuniGeo = {
    lookup: lookupComune,
    fillCityDatalist: fillCityDatalist
  };

  function syncClubsSentence(n) {
    var label = document.querySelector('[data-i18n="map.clubs"]');
    if (!label || !window.EliseeI18n || typeof window.EliseeI18n.t !== 'function') return;
    var key = n === 1 ? 'map.clubsOne' : 'map.clubs';
    var text = window.EliseeI18n.t(key);
    if (text && text !== key) label.textContent = text;
  }

  function logoBust(u) {
    if (!u) return '';
    if (u.indexOf('?v=') !== -1 || u.indexOf('&v=') !== -1) return u;
    return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'v=20260908_ECCLAZIO4';
  }

  function pinIcon(c) {
    var logoUrl = c.logo || (c.id ? 'immagini/squadre-loghi/' + c.id + '.png' : '');
    logoUrl = logoBust(logoUrl);
    var inner = logoUrl
      ? '<img src="' + esc(logoUrl) + '" alt="" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'' + esc(initials(c.name)) + '\';">'
      : esc(initials(c.name));
    return L.divIcon({
      className: 'es-map-ico',
      html: '<div class="es-map-pin" title="' + esc(c.name) + '">' + inner + '</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });
  }

  function socialId(c) {
    var id = String(c.id || '');
    return id.indexOf('club-') === 0 ? id : ('club-' + id);
  }

  function popupHtml(c) {
    var sid = socialId(c);
    var logoUrl = c.logo || (c.id ? 'immagini/squadre-loghi/' + c.id + '.png' : '');
    logoUrl = logoBust(logoUrl);
    var logoImg = logoUrl
      ? '<img src="' + esc(logoUrl) + '" alt="" style="width:36px; height:36px; object-fit:contain; border-radius:8px; background:rgba(15,23,42,0.8); padding:3px; border:1px solid rgba(59,125,255,0.3);">'
      : '';
    var stadia = c.stadium ? ('<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Stadio: ' + esc(c.stadium) + '</div>') : '';
    return '<div class="es-map-pop">' +
      '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem; justify-content:center;">' +
        logoImg +
        '<div style="text-align:left;">' +
          '<strong style="display:block; font-size:0.92rem; color:#0f172a; line-height:1.2;">' + esc(c.name) + '</strong>' +
          '<span style="font-size:0.75rem; color:#3b7dff; font-weight:700;">' + esc(c.league || c.group || 'Club registrato') + '</span>' +
        '</div>' +
      '</div>' +
      '<span>' + esc(c.city || 'Italia') + (c.region ? ' (' + esc(c.region) + ')' : '') + '</span>' +
      stadia +
      '<div class="es-sc-actions" style="margin-top:0.6rem; display:flex; flex-wrap:wrap; gap:0.35rem; justify-content:center;">' +
        '<button type="button" class="btn-map-select" data-map-team="' + esc(c.id) + '" data-map-team-name="' + esc(c.name) + '" style="background:#3b7dff; color:#fff; border:none; border-radius:8px; padding:0.35rem 0.65rem; font-size:0.75rem; font-weight:700; cursor:pointer;">Vedi nel Selettore</button>' +
        '<button type="button" class="es-sc-follow" data-map-follow="' + esc(sid) + '" style="border-radius:8px; padding:0.35rem 0.6rem; font-size:0.75rem;">Segui</button>' +
        '<button type="button" class="es-sc-msg" data-map-msg="' + esc(sid) + '" data-map-name="' + esc(c.name) + '" style="border-radius:8px; padding:0.35rem 0.6rem; font-size:0.75rem;">Messaggia</button>' +
      '</div></div>';
  }

  // =====================================================================
  // MODALE GEOLOCALIZZAZIONE CLUB
  // =====================================================================
  function openGeoModal(prefillClub) {
    var existing = document.getElementById('es-club-geo-modal');
    if (existing) existing.remove();

    var pinSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>';
    var closeSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    loadClubs(function (allClubs) {
      var u = getStoredUser();
      var defName = prefillClub ? (prefillClub.name || '') : (u.clubName || u.squadra || '');
      var defCity = prefillClub ? (prefillClub.city || '') : (u.citta || u.city || '');
      var defStadium = prefillClub ? (prefillClub.stadium || '') : (u.stadio || '');
      var defLat = prefillClub && prefillClub.lat ? prefillClub.lat : (u.clubGeo && u.clubGeo.lat ? u.clubGeo.lat : '');
      var defLng = prefillClub && prefillClub.lng ? prefillClub.lng : (u.clubGeo && u.clubGeo.lng ? u.clubGeo.lng : '');
      var pinned = false;

      var modal = document.createElement('div');
      modal.id = 'es-club-geo-modal';
      modal.className = 'es-geo-modal-backdrop';
      modal.innerHTML =
        '<div class="es-geo-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="es-geo-title">' +
          '<div class="es-geo-modal-header">' +
            '<div class="es-geo-modal-intro">' +
              '<span class="es-geo-pin" aria-hidden="true">' + pinSvg + '</span>' +
              '<div>' +
                '<h3 id="es-geo-title" data-i18n="geo.title">' + esc(tr('geo.title', 'Geolocalizzazione club e sede')) + '</h3>' +
                '<p data-i18n="geo.lead">' + esc(tr('geo.lead', 'Posiziona o perfeziona lo stadio, la sede e le coordinate del club sulla mappa.')) + '</p>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-geo-close-btn" id="btn-close-geo-modal" data-i18n-aria="geo.close" aria-label="' + esc(tr('geo.close', 'Chiudi')) + '">' + closeSvg + '</button>' +
          '</div>' +
          '<form id="form-club-geo" class="es-geo-form">' +
            '<div class="es-geo-field">' +
              '<label for="geo-club-search" data-i18n="geo.club">' + esc(tr('geo.club', 'Seleziona o cerca la squadra')) + '</label>' +
              '<input type="text" id="geo-club-search" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="geo-club-suggest" aria-autocomplete="list" required data-i18n-placeholder="geo.clubPh" placeholder="' + esc(tr('geo.clubPh', 'Digita il nome del club, ad esempio Foggia')) + '" value="' + esc(defName) + '">' +
              '<div id="geo-club-suggest" class="es-geo-suggest" role="listbox" hidden></div>' +
            '</div>' +
            '<div class="es-geo-grid">' +
              '<div class="es-geo-field">' +
                '<label for="geo-club-city" data-i18n="geo.city">' + esc(tr('geo.city', 'Città natale del club')) + '</label>' +
                '<input type="text" id="geo-club-city" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="geo-city-suggest" aria-autocomplete="list" required data-i18n-placeholder="geo.cityPh" placeholder="' + esc(tr('geo.cityPh', 'Es. Foggia (FG)')) + '" value="' + esc(defCity) + '">' +
                '<div id="geo-city-suggest" class="es-geo-suggest" role="listbox" hidden></div>' +
              '</div>' +
              '<div class="es-geo-field">' +
                '<label for="geo-club-stadium" data-i18n="geo.stadium">' + esc(tr('geo.stadium', 'Stadio o centro sportivo')) + '</label>' +
                '<input type="text" id="geo-club-stadium" autocomplete="off" data-i18n-placeholder="geo.stadiumPh" placeholder="' + esc(tr('geo.stadiumPh', 'Es. Stadio Comunale')) + '" value="' + esc(defStadium) + '">' +
              '</div>' +
            '</div>' +
            '<div class="es-geo-coords">' +
              '<div class="es-geo-coords__head">' +
                '<span data-i18n="geo.coords">' + esc(tr('geo.coords', 'Coordinate geografiche (WGS84)')) + '</span>' +
                '<button type="button" id="btn-detect-gps" class="es-geo-gps">' +
                  pinSvg +
                  '<span class="es-geo-gps__label" data-i18n="geo.gps">' + esc(tr('geo.gps', 'Rileva con GPS')) + '</span>' +
                '</button>' +
              '</div>' +
              '<div class="es-geo-grid">' +
                '<div class="es-geo-field">' +
                  '<label for="geo-club-lat" data-i18n="geo.lat">' + esc(tr('geo.lat', 'Latitudine')) + '</label>' +
                  '<input type="number" step="any" inputmode="decimal" id="geo-club-lat" data-i18n-placeholder="geo.latPh" placeholder="' + esc(tr('geo.latPh', 'Es. 40.4764')) + '" value="' + esc(defLat) + '">' +
                '</div>' +
                '<div class="es-geo-field">' +
                  '<label for="geo-club-lng" data-i18n="geo.lng">' + esc(tr('geo.lng', 'Longitudine')) + '</label>' +
                  '<input type="number" step="any" inputmode="decimal" id="geo-club-lng" data-i18n-placeholder="geo.lngPh" placeholder="' + esc(tr('geo.lngPh', 'Es. 17.2341')) + '" value="' + esc(defLng) + '">' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<p id="geo-modal-msg" class="es-geo-msg" role="status" hidden></p>' +
            '<div class="es-geo-actions">' +
              '<button type="button" class="es-geo-btn es-geo-btn--ghost" id="btn-cancel-geo" data-i18n="geo.cancel">' + esc(tr('geo.cancel', 'Annulla')) + '</button>' +
              '<button type="submit" class="es-geo-btn es-geo-btn--save" data-i18n="geo.save">' + esc(tr('geo.save', 'Salva e posiziona sulla mappa')) + '</button>' +
            '</div>' +
          '</form>' +
        '</div>';

      document.body.appendChild(modal);

      var searchInput = document.getElementById('geo-club-search');
      var cityInput = document.getElementById('geo-club-city');
      var stadiumInput = document.getElementById('geo-club-stadium');
      var latInput = document.getElementById('geo-club-lat');
      var lngInput = document.getElementById('geo-club-lng');
      var clubList = document.getElementById('geo-club-suggest');
      var cityList = document.getElementById('geo-city-suggest');

      function showMsg(text, isError) {
        var el = document.getElementById('geo-modal-msg');
        if (!el) return;
        el.hidden = !text;
        el.textContent = text || '';
        el.classList.toggle('is-error', !!isError);
      }

      function setCoords(lat, lng, lock) {
        if (!latInput || !lngInput) return;
        var la = Number(lat);
        var ln = Number(lng);
        if (!isFinite(la) || !isFinite(ln)) return;
        latInput.value = la.toFixed(5);
        lngInput.value = ln.toFixed(5);
        if (lock) pinned = true;
      }

      function readCoords() {
        var la = parseFloat(latInput && latInput.value);
        var ln = parseFloat(lngInput && lngInput.value);
        if (!isFinite(la) || !isFinite(ln)) return null;
        if (la < -90 || la > 90 || ln < -180 || ln > 180) return null;
        return { lat: la, lng: ln };
      }

      function applyCityHit(hit, movePin) {
        if (!hit || !cityInput) return;
        cityInput.value = hit.name + ' (' + hit.prov + ')';
        cityInput.dataset.region = hit.region || '';
        cityInput.dataset.cityOk = '1';
        if (movePin) {
          pinned = false;
          setCoords(hit.lat, hit.lng, false);
        }
      }

      function bindSuggest(input, listEl, provider) {
        var active = -1;
        function close() {
          listEl.hidden = true;
          listEl.innerHTML = '';
          active = -1;
          input.setAttribute('aria-expanded', 'false');
        }
        function paint(items) {
          listEl.innerHTML = '';
          active = -1;
          if (!items.length) {
            close();
            return;
          }
          items.forEach(function (item) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'es-geo-suggest__item';
            btn.setAttribute('role', 'option');
            btn.innerHTML = '<span class="es-geo-suggest__label">' + esc(item.label) + '</span>' +
              (item.meta ? '<span class="es-geo-suggest__meta">' + esc(item.meta) + '</span>' : '');
            btn.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
            btn.addEventListener('click', function () {
              provider.onPick(item);
              close();
            });
            listEl.appendChild(btn);
          });
          listEl.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
        function move(delta) {
          var buttons = listEl.querySelectorAll('.es-geo-suggest__item');
          if (!buttons.length) return;
          active = (active + delta + buttons.length) % buttons.length;
          Array.prototype.forEach.call(buttons, function (btn, i) {
            btn.classList.toggle('is-active', i === active);
          });
          if (buttons[active].scrollIntoView) buttons[active].scrollIntoView({ block: 'nearest' });
        }
        input.addEventListener('input', function () {
          if (provider.onType) provider.onType();
          var q = input.value.trim();
          if (q.length < 2) {
            close();
            return;
          }
          paint(provider.filter(q).slice(0, 8));
        });
        input.addEventListener('keydown', function (ev) {
          if (listEl.hidden) return;
          if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            move(1);
          } else if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            move(-1);
          } else if (ev.key === 'Enter' && active >= 0) {
            var buttons = listEl.querySelectorAll('.es-geo-suggest__item');
            if (buttons[active]) {
              ev.preventDefault();
              buttons[active].click();
            }
          } else if (ev.key === 'Escape') {
            ev.preventDefault();
            ev.stopPropagation();
            close();
          }
        });
        input.addEventListener('blur', function () {
          setTimeout(function () {
            if (document.activeElement && listEl.contains(document.activeElement)) return;
            close();
          }, 140);
        });
        return { close: close };
      }

      function filterClubs(q) {
        var n = normPlace(q);
        if (n.length < 2) return [];
        var starts = [];
        var contains = [];
        for (var i = 0; i < allClubs.length; i++) {
          var club = allClubs[i];
          var name = normPlace(club.name);
          var city = normPlace(club.city);
          var item = { label: club.name, meta: club.city || club.league || '', club: club };
          if (name.indexOf(n) === 0) starts.push(item);
          else if (name.indexOf(n) !== -1 || (city && city.indexOf(n) !== -1)) contains.push(item);
          if (starts.length >= 8) break;
        }
        return starts.concat(contains);
      }

      function filterCities(q) {
        if (!comuniIndex || !comuniIndex.rows) return [];
        var n = normPlace(q);
        if (n.length < 2) return [];
        var starts = [];
        var contains = [];
        var rows = comuniIndex.rows;
        for (var i = 0; i < rows.length; i++) {
          var name = normPlace(rows[i][0]);
          var item = {
            label: rows[i][0] + ' (' + rows[i][1] + ')',
            meta: rows[i][4] || '',
            hit: { name: rows[i][0], prov: rows[i][1], lat: rows[i][2], lng: rows[i][3], region: rows[i][4] }
          };
          if (name.indexOf(n) === 0) starts.push(item);
          else if (starts.length < 8 && name.indexOf(n) !== -1) contains.push(item);
          if (starts.length >= 8) break;
        }
        return starts.concat(contains);
      }

      bindSuggest(searchInput, clubList, {
        filter: filterClubs,
        onType: function () { delete searchInput.dataset.clubId; },
        onPick: function (item) {
          var club = item.club;
          var hasPin = typeof club.lat === 'number' && typeof club.lng === 'number';
          searchInput.value = club.name;
          searchInput.dataset.clubId = club.id || '';
          if (stadiumInput && club.stadium) stadiumInput.value = club.stadium;
          if (hasPin) setCoords(club.lat, club.lng, true);
          if (club.city) {
            lookupComune(club.city).then(function (hit) {
              if (!document.body.contains(modal)) return;
              if (hit) applyCityHit(hit, !hasPin);
              else if (cityInput) cityInput.value = club.city;
            });
          }
          showMsg('');
        }
      });

      bindSuggest(cityInput, cityList, {
        filter: filterCities,
        onType: function () { delete cityInput.dataset.cityOk; },
        onPick: function (item) {
          applyCityHit(item.hit, true);
          showMsg('');
        }
      });

      cityInput.addEventListener('change', function () {
        lookupComune(cityInput.value).then(function (hit) {
          if (!hit || !document.body.contains(modal)) return;
          applyCityHit(hit, !pinned);
        });
      });

      latInput.addEventListener('input', function () { pinned = true; });
      lngInput.addEventListener('input', function () { pinned = true; });

      var btnGps = document.getElementById('btn-detect-gps');
      var gpsLabel = btnGps ? btnGps.querySelector('.es-geo-gps__label') : null;
      if (btnGps) {
        btnGps.addEventListener('click', function () {
          if (!navigator.geolocation) {
            showMsg(tr('geo.noGps', 'Questo browser non rileva la posizione.'), true);
            return;
          }
          btnGps.disabled = true;
          if (gpsLabel) gpsLabel.textContent = tr('geo.gpsBusy', 'Rilevamento in corso');
          navigator.geolocation.getCurrentPosition(function (pos) {
            if (!document.body.contains(modal)) return;
            setCoords(pos.coords.latitude, pos.coords.longitude, true);
            btnGps.disabled = false;
            if (gpsLabel) gpsLabel.textContent = tr('geo.gpsOk', 'Posizione rilevata');
            showMsg('');
            setTimeout(function () {
              if (gpsLabel && document.body.contains(modal)) gpsLabel.textContent = tr('geo.gps', 'Rileva con GPS');
            }, 2200);
          }, function () {
            btnGps.disabled = false;
            if (gpsLabel) gpsLabel.textContent = tr('geo.gps', 'Rileva con GPS');
            showMsg(tr('geo.gpsFail', 'Posizione non disponibile. Controlla il permesso del browser oppure inserisci le coordinate.'), true);
          }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        });
      }

      function closeModal() {
        modal.classList.remove('is-open');
        document.removeEventListener('keydown', onKey);
        setTimeout(function () { if (modal.parentElement) modal.remove(); }, 200);
      }

      function onKey(ev) {
        if (ev.key !== 'Escape' || !modal.classList.contains('is-open')) return;
        closeModal();
      }

      document.getElementById('btn-close-geo-modal').addEventListener('click', closeModal);
      document.getElementById('btn-cancel-geo').addEventListener('click', closeModal);
      modal.addEventListener('click', function (ev) { if (ev.target === modal) closeModal(); });
      document.addEventListener('keydown', onKey);

      var form = document.getElementById('form-club-geo');
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var rawClub = searchInput.value.trim();
        var city = cityInput.value.trim();
        var stadium = stadiumInput.value.trim();
        if (!rawClub) {
          showMsg(tr('geo.needClub', 'Indica il nome del club.'), true);
          searchInput.focus();
          return;
        }
        lookupComune(city).then(function (hit) {
          if (!document.body.contains(modal)) return;
          if (!hit) {
            showMsg(tr('geo.needCity', 'Scegli la città natale dall’elenco dei comuni, così il club entra nella regione giusta.'), true);
            cityInput.focus();
            return;
          }
          var typed = readCoords();
          var lat = typed ? typed.lat : hit.lat;
          var lng = typed ? typed.lng : hit.lng;
          if (!isFinite(lat) || !isFinite(lng)) {
            showMsg(tr('geo.needCoords', 'Servono latitudine e longitudine valide, oppure la città natale.'), true);
            return;
          }
          applyCityHit(hit, false);

          var found = null;
          var wantedId = searchInput.dataset.clubId || '';
          var wantedName = normPlace(rawClub);
          for (var i = 0; i < allClubs.length; i++) {
            if (wantedId && String(allClubs[i].id) === wantedId) { found = allClubs[i]; break; }
            if (normPlace(allClubs[i].name) === wantedName) found = allClubs[i];
          }

          var clubId = found ? found.id : ('club-' + (rawClub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()));
          var clubName = found ? found.name : rawClub;
          var geoData = {
            id: clubId,
            name: clubName,
            city: hit.name + ' (' + hit.prov + ')',
            stadium: stadium,
            lat: lat,
            lng: lng,
            region: hit.region,
            league: found && found.league ? found.league : 'AMATORIALE',
            country: 'ITALIA',
            verified: true,
            eliseeVerified: true,
            updatedAt: new Date().toISOString()
          };

          saveGeoOverride(clubId, geoData);
          upsertLocalRegistered(geoData);
          invalidateClubs();
          closeModal();

          if (window.showToast) {
            window.showToast(clubName + tr('geo.placed', ' collocato a ') + hit.name + ' (' + hit.region + ').', 'success');
          }
          if (window.EliseeClubMap && window.EliseeClubMap.refresh) window.EliseeClubMap.refresh();
          setTimeout(function () {
            if (window.EliseeClubMap && window.EliseeClubMap.map) {
              window.EliseeClubMap.map.flyTo([lat, lng], 12, { duration: 1.2 });
            }
          }, 350);
        });
      });

      if (searchInput) searchInput.focus();
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
    });
  }

  // MAP ENGINE
  // =====================================================================
  var REGION_CENTERS = {
    'Lombardia': { coords: [45.65, 9.75], zoom: 8 },
    'Sicilia': { coords: [37.60, 14.15], zoom: 8 },
    'Lazio': { coords: [41.90, 12.60], zoom: 8 },
    'Campania': { coords: [40.85, 14.80], zoom: 8 },
    'Emilia-Romagna': { coords: [44.50, 11.30], zoom: 8 },
    'Puglia': { coords: [41.10, 16.60], zoom: 8 },
    'Toscana': { coords: [43.40, 11.20], zoom: 8 },
    'Veneto': { coords: [45.45, 11.90], zoom: 8 },
    'Piemonte': { coords: [45.10, 7.80], zoom: 8 },
    'Marche': { coords: [43.35, 13.20], zoom: 8 },
    'Abruzzo': { coords: [42.30, 13.80], zoom: 8 },
    'Calabria': { coords: [39.00, 16.40], zoom: 8 },
    'Sardegna': { coords: [40.10, 9.10], zoom: 8 },
    'Liguria': { coords: [44.30, 8.85], zoom: 8 },
    'Umbria': { coords: [42.95, 12.50], zoom: 9 },
    'Friuli-Venezia Giulia': { coords: [46.10, 13.15], zoom: 8 },
    'Basilicata': { coords: [40.55, 16.05], zoom: 8 },
    'Trentino-Alto Adige': { coords: [46.40, 11.35], zoom: 8 },
    'Molise': { coords: [41.65, 14.65], zoom: 9 },
    'Valle d\'Aosta': { coords: [45.75, 7.35], zoom: 9 }
  };

  var clubMarkersMap = {};

  var regionState = { expandedRegion: null, showAllTeams: {} };
  var lastRegionCounts = {};

  function getTeamsForRegion(regione) {
    var source = clubs || window.__eliseeScopriClubs || [];
    if (!source || !source.length) return [];
    var target = (regione || '').trim().toLowerCase();
    var list = source.filter(function (c) {
      return (c.region || '').trim().toLowerCase() === target && typeof c.lat === 'number' && typeof c.lng === 'number';
    });

    list.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' });
    });

    return list;
  }

  function teamsPanelHTML(regione, totalCount) {
    var squadre = getTeamsForRegion(regione);
    var count = squadre.length || totalCount;
    var maxInitial = 40;
    var showAll = !!regionState.showAllTeams[regione];
    var displayed = showAll ? squadre : squadre.slice(0, maxInitial);

    var listHtml = '';
    if (displayed && displayed.length) {
      listHtml = '<div class="es-region-teams__list-wrap"><div class="es-region-teams__list">' +
        displayed.map(function (c) {
          var logoUrl = c.logo || (c.id ? 'immagini/squadre-loghi/' + c.id + '.png' : '');
          logoUrl = logoBust(logoUrl);
          var logoImg = logoUrl
            ? '<img src="' + esc(logoUrl) + '" alt="" class="es-region-team-logo" onerror="this.style.display=\'none\';">'
            : '';
          var infoTitle = esc(c.name + (c.city ? ' (' + c.city + ')' : '') + (c.league ? ' — ' + c.league : ''));
          return '<button type="button" class="es-region-team-chip" data-team-id="' + esc(c.id) + '" data-team-name="' + esc(c.name) + '" title="' + infoTitle + '">' +
            logoImg +
            '<span class="es-region-team-name">' + esc(c.name) + '</span>' +
          '</button>';
        }).join('') +
      '</div></div>';

      if (squadre.length > maxInitial) {
        if (!showAll) {
          listHtml += '<div style="margin-top:14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
            '<button type="button" class="es-region-show-more-btn" data-show-all="' + esc(regione) + '">' +
              'Mostra tutte le ' + squadre.length + ' squadre' +
            '</button>' +
            '<p class="es-region-teams__note" style="margin-top:0;">Prime ' + maxInitial + ' squadre registrate, in ordine alfabetico.</p>' +
          '</div>';
        } else {
          listHtml += '<div style="margin-top:14px;">' +
            '<button type="button" class="es-region-show-more-btn" data-show-less="' + esc(regione) + '">' +
              'Mostra meno squadre' +
            '</button>' +
          '</div>';
        }
      }
    } else {
      listHtml = '<p class="es-region-teams__note">Nessun club registrato in questa regione.</p>';
    }

    return (
      '<div class="es-region-teams" role="region" aria-label="Squadre in ' + esc(regione) + '">' +
        '<div class="es-region-teams__head">' +
          '<h3>Squadre in ' + esc(regione) + ' <span>(' + count + (count === 1 ? ' club registrato' : ' club registrati') + ')</span></h3>' +
          '<button type="button" class="es-region-teams__close" data-close="' + esc(regione) + '" aria-label="Chiudi pannello squadre">✕</button>' +
        '</div>' +
        listHtml +
      '</div>'
    );
  }

  function renderRegionsGrid(counts) {
    if (counts) lastRegionCounts = counts;
    else counts = lastRegionCounts;

    var host = document.getElementById('es-map-regions-grid');
    if (!host) return;
    var keys = Object.keys(REGION_CENTERS).sort(function (a, b) {
      return (counts[b] || 0) - (counts[a] || 0);
    });

    var maxVal = 1;
    keys.forEach(function (k) {
      var n = counts[k] || 0;
      if (n > maxVal) maxVal = n;
    });

    var html = '';
    keys.forEach(function (reg) {
      var num = counts[reg] || 0;
      var pct = Math.max(3, Math.round((num / maxVal) * 100));
      var isOpen = regionState.expandedRegion === reg;
      var card = '<button type="button" class="es-region-card es-map-reg-card' + (isOpen ? ' is-selected is-open' : '') + '" data-regione="' + esc(reg) + '" aria-label="' + esc(reg) + ', ' + num + ' club" ' + (isOpen ? 'aria-expanded="true"' : 'aria-expanded="false"') + '>' +
        '<div class="es-region-card__header">' +
          '<p class="es-region-card__name es-map-reg-card__name">' + esc(reg) + '</p>' +
          '<p class="es-region-card__count es-map-reg-card__count">' + num.toLocaleString('it-IT') + '<span>club</span></p>' +
        '</div>' +
        '<div class="es-region-card__bar-track" aria-hidden="true">' +
          '<div class="es-region-card__bar" style="width:' + pct + '%;"></div>' +
        '</div>' +
      '</button>';
      html += card + (isOpen ? teamsPanelHTML(reg, num) : '');
    });
    host.innerHTML = html;
    var covered = 0;
    keys.forEach(function (k) { if ((counts[k] || 0) > 0) covered++; });
    var covEl = document.getElementById('es-map-regions-count');
    if (covEl) covEl.textContent = String(covered);

    host.onclick = function (e) {
      var closeBtn = e.target.closest('[data-close]');
      if (closeBtn) {
        regionState.expandedRegion = null;
        renderRegionsGrid();
        return;
      }

      var showAllBtn = e.target.closest('[data-show-all]');
      if (showAllBtn) {
        var regAll = showAllBtn.getAttribute('data-show-all');
        regionState.showAllTeams[regAll] = true;
        renderRegionsGrid();
        return;
      }

      var showLessBtn = e.target.closest('[data-show-less]');
      if (showLessBtn) {
        var regLess = showLessBtn.getAttribute('data-show-less');
        regionState.showAllTeams[regLess] = false;
        renderRegionsGrid();
        return;
      }

      var teamChip = e.target.closest('.es-region-team-chip') || e.target.closest('[data-team]');
      if (teamChip) {
        var teamId = teamChip.getAttribute('data-team-id') || '';
        var tName = teamChip.getAttribute('data-team-name') || teamChip.getAttribute('data-team') || '';
        loadClubs(function (all) {
          var found = all.find(function (c) {
            if (teamId && c.id === teamId) return true;
            if (tName) {
              var q = tName.toLowerCase();
              var cn = (c.name || '').toLowerCase();
              return cn === q || cn.indexOf(q) !== -1 || q.indexOf(cn) !== -1;
            }
            return false;
          });
          if (found && window.EliseeClubMap && window.EliseeClubMap.map) {
            window.EliseeClubMap.map.flyTo([found.lat, found.lng], 14, { duration: 1.2 });
            var mk = clubMarkersMap[found.id];
            if (mk) {
              setTimeout(function () { mk.openPopup(); }, 1200);
            }
            if (window.showToast) {
              window.showToast('Mappa inquadrata su ' + found.name, 'info');
            }
          }
        });
        return;
      }

      var btn = e.target.closest('.es-region-card');
      if (!btn) return;
      var r = btn.getAttribute('data-regione');
      if (!r) return;

      // 1. Centra la mappa sulla regione
      if (window.EliseeClubMap) {
        window.EliseeClubMap.flyToRegion(r, false);
      }

      // 2. Apri/chiudi pannello squadre della regione
      regionState.expandedRegion = (regionState.expandedRegion === r) ? null : r;
      renderRegionsGrid();
    };
  }

  /* Ricerca club autocomplete - ricostruita con vera sorgente dati e centratura mappa */
  var searchBound = false;
  function initClubSearch() {
    if (searchBound) return;
    var input = document.getElementById('club-search') || document.getElementById('es-map-search-input');
    var clearBtn = document.getElementById('club-search-clear') || document.getElementById('es-map-search-clear');
    var resultsBox = document.getElementById('club-search-results') || document.getElementById('es-map-search-dropdown');
    if (!input || !resultsBox) return;
    searchBound = true;

    var searchContainer = input.closest('.es-map-search');
    if (searchContainer && typeof L !== 'undefined' && L.DomEvent) {
      L.DomEvent.disableClickPropagation(searchContainer);
      L.DomEvent.disableScrollPropagation(searchContainer);
    }

    function renderResults(query) {
      if (!query) {
        resultsBox.classList.remove('is-open');
        resultsBox.innerHTML = '';
        _updateSearchCount(0, false);
        _updateSearchOverflow();
        return;
      }
      var q = query.toLowerCase();
      loadClubs(function (all) {
        var match = [];
        for (var i = 0; i < all.length; i++) {
          var c = all[i];
          var nome = (c.name || '').toLowerCase();
          var comune = (c.city || '').toLowerCase();
          var regione = (c.region || '').toLowerCase();
          if (nome.indexOf(q) !== -1 || comune.indexOf(q) !== -1 || regione.indexOf(q) !== -1) {
            match.push(c);
            if (match.length >= 10) break;
          }
        }

        if (!match.length) {
          resultsBox.innerHTML = '<div class="es-map-search__empty">Nessun club trovato per &ldquo;' + esc(query) + '&rdquo;</div>';
          _updateSearchCount(0, false);
        } else {
          resultsBox.innerHTML = match.map(function (c) {
            var meta = esc(c.city ? (c.city + (c.region ? ' (' + c.region + ')' : '')) : (c.region || ''));
            return (
              '<div class="es-map-search__result" data-club-id="' + esc(c.id) + '" data-nome="' + esc(c.name) + '" tabindex="-1" role="option">' +
                '<span class="es-map-search__result-name">' + esc(c.name) + '</span>' +
                '<span class="es-map-search__result-meta">' + meta + '</span>' +
              '</div>'
            );
          }).join('');
          _updateSearchCount(match.length, true);
        }
        _focusedIdx = -1;
        resultsBox.classList.add('is-open');
        _updateSearchOverflow();
      });
    }

    /* Aggiorna la pill contatore nella barra ricerca */
    function _updateSearchCount(n, visible) {
      var pill = document.getElementById('es-map-search-count');
      if (!pill) return;
      pill.textContent = n;
      pill.classList.toggle('is-visible', visible && n > 0);
    }

    /* Aggiorna la fade-bottom mask in base allo scroll reale */
    function _updateSearchOverflow() {
      if (!searchContainer) return;
      var isOverflow = resultsBox.scrollHeight > resultsBox.clientHeight + 4;
      searchContainer.classList.toggle('has-overflow', isOverflow);
    }

    resultsBox.addEventListener('scroll', _updateSearchOverflow);

    /* Indice riga con focus da tastiera */
    var _focusedIdx = -1;

    function _getFocusableItems() {
      return Array.prototype.slice.call(resultsBox.querySelectorAll('.es-map-search__result'));
    }

    function _setFocused(idx) {
      var items = _getFocusableItems();
      items.forEach(function (el) { el.classList.remove('is-focused'); });
      if (idx >= 0 && idx < items.length) {
        items[idx].classList.add('is-focused');
        items[idx].scrollIntoView({ block: 'nearest' });
        _focusedIdx = idx;
      } else {
        _focusedIdx = -1;
      }
    }

    /* Debounce sull'input - evita chiamate eccessive a loadClubs */
    var _debounceTimer = null;
    input.addEventListener('input', function (e) {
      var val = e.target.value.trim();
      if (clearBtn) clearBtn.classList.toggle('is-visible', !!val);
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(function () {
        renderResults(val);
      }, 250);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) renderResults(input.value.trim());
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.es-map-search') && !e.target.closest('#es-map-search-container')) {
        resultsBox.classList.remove('is-open');
        _updateSearchCount(0, false);
      }
    });

    resultsBox.addEventListener('click', function (e) {
      var item = e.target.closest('.es-map-search__result');
      if (!item) return;
      _selectItem(item);
    });

    function _selectItem(item) {
      var clubId = item.getAttribute('data-club-id');
      var clubNome = item.getAttribute('data-nome');
      input.value = clubNome;
      resultsBox.classList.remove('is-open');
      _updateSearchCount(0, false);
      if (clearBtn) clearBtn.classList.add('is-visible');

      loadClubs(function (all) {
        var found = all.find(function (c) {
          return (clubId && String(c.id) === String(clubId)) || (c.name && c.name.toLowerCase() === clubNome.toLowerCase());
        });
        if (!found || typeof found.lat !== 'number' || typeof found.lng !== 'number') return;

        if (window.EliseeClubMap && window.EliseeClubMap.map) {
          var map = window.EliseeClubMap.map;
          var cluster = window.EliseeClubMap.cluster;
          var mk = clubMarkersMap[found.id];

          if (cluster && mk) {
            cluster.zoomToShowLayer(mk, function () {
              mk.openPopup();
            });
          } else {
            map.flyTo([found.lat, found.lng], 14, { duration: 1.2 });
            if (mk) {
              setTimeout(function () { mk.openPopup(); }, 1200);
            }
          }
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.classList.remove('is-visible');
        resultsBox.classList.remove('is-open');
        _updateSearchCount(0, false);
        input.focus();
      });
    }

    /* Navigazione tastiera: arrowDown/Up tra i risultati, Enter per selezionare, Escape per chiudere */
    input.addEventListener('keydown', function (e) {
      var items = _getFocusableItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _setFocused(Math.min(_focusedIdx + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _setFocused(Math.max(_focusedIdx - 1, 0));
      } else if (e.key === 'Enter') {
        if (_focusedIdx >= 0 && items[_focusedIdx]) {
          e.preventDefault();
          _selectItem(items[_focusedIdx]);
        }
      } else if (e.key === 'Escape') {
        resultsBox.classList.remove('is-open');
        _updateSearchCount(0, false);
        input.blur();
      }
    });

    /* Escape globale: chiude anche il pannello regione aperto */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (regionState && regionState.expandedRegion) {
        regionState.expandedRegion = null;
        renderRegionsGrid();
      }
    });
  }

  window.EliseeClubMap = {
    map: null,
    cluster: null,
    hqLayer: null,
    ready: false,
    ensure: function () {
      var el = document.getElementById('es-map-canvas');
      if (!el || typeof L === 'undefined') return;
      if (this.map) {
        setTimeout(function () { window.EliseeClubMap.map.invalidateSize(); }, 60);
        return;
      }
      this.map = L.map(el, { zoomControl: true, scrollWheelZoom: true, attributionControl: false }).setView([42.2, 12.8], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(this.map);

      this.cluster = L.markerClusterGroup({
        maxClusterRadius: 88,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: function (cluster) {
          var n = cluster.getChildCount();
          return L.divIcon({
            html: '<div class="es-map-cluster" role="button" tabindex="0" aria-label="Cluster con ' + n + ' club">' + n + '</div>',
            className: 'es-map-cluster-wrap',
            iconSize: [46, 46]
          });
        }
      });
      this.map.addLayer(this.cluster);

      initClubSearch();

      var self = this;
      var portal = document.getElementById('mappa-portal');
      if (portal && !portal.dataset.mapBound) {
        portal.dataset.mapBound = '1';
        portal.addEventListener('click', function (e) {
          var sel = e.target.closest('[data-map-team]');
          if (sel) {
            var teamId = sel.getAttribute('data-map-team') || '';
            var teamName = sel.getAttribute('data-map-team-name') || '';
            var targetId = teamId || teamName;
            if (window.EliseeSquadreSelect) {
              if (typeof window.EliseeSquadreSelect.selectTeamById === 'function') {
                window.EliseeSquadreSelect.selectTeamById(targetId);
              } else if (typeof window.EliseeSquadreSelect.selectTeam === 'function') {
                window.EliseeSquadreSelect.selectTeam(targetId);
              }
            }
            if (window.switchView) {
              window.switchView('squadre', '#squadre-portal?team=' + encodeURIComponent(targetId));
              setTimeout(function () {
                if (window.EliseeSquadreSelect) {
                  if (typeof window.EliseeSquadreSelect.selectTeamById === 'function') {
                    window.EliseeSquadreSelect.selectTeamById(targetId);
                  } else if (typeof window.EliseeSquadreSelect.selectTeam === 'function') {
                    window.EliseeSquadreSelect.selectTeam(targetId);
                  }
                }
              }, 100);
            }
            return;
          }
          var f = e.target.closest('[data-map-follow]');
          if (f && window.EliseeScopri) {
            window.EliseeScopri.follow(f.getAttribute('data-map-follow'));
            return;
          }
          var m = e.target.closest('[data-map-msg]');
          if (m && window.openB2BMessage) {
            window.openB2BMessage(m.getAttribute('data-map-msg'), m.getAttribute('data-map-name'), 'club');
          }
        });
      }
      this.ready = true;
      setTimeout(function () { self.map.invalidateSize(); }, 80);
    },
    refresh: function (categoryFilter) {
      var self = this;
      this.ensure();
      if (!this.map || !this.cluster) return;

      if (categoryFilter) activeFilter = categoryFilter;

      loadClubs(function (rows) {
        self.cluster.clearLayers();
        clubMarkersMap = {};
        var overrides = getGeoOverrides();

        var filtered = rows.filter(function (c) {
          if (typeof c.lat !== 'number' || typeof c.lng !== 'number' || !knownRegion(c.region)) return false;
          if (activeFilter === 'all') return true;
          var grp = (c.group || c.league || '').toLowerCase();
          return grp.indexOf(activeFilter.toLowerCase()) >= 0;
        });

        var count = 0;
        filtered.slice(0, MAX_PINS).forEach(function (c) {
          var mk = L.marker([c.lat, c.lng], { icon: pinIcon(c), title: c.name });
          mk.bindPopup(popupHtml(c), { maxWidth: 260 });
          mk.bindTooltip(esc(c.name) + (c.city ? ' (' + esc(c.city) + ')' : ''), {
            direction: 'top',
            offset: [0, -22],
            className: 'es-map-tooltip'
          });
          self.cluster.addLayer(mk);
          if (c.id) clubMarkersMap[c.id] = mk;
          count++;
        });

        // HQ rimosso
        if (self.hqLayer) {
          try { self.map.removeLayer(self.hqLayer); } catch (_) {}
          self.hqLayer = null;
        }

        var geo = myClubGeo();
        var alreadyPinned = geo && rows.some(function (c) {
          return (geo.id && c.id === geo.id) || (typeof geo.lat === 'number' && c.lat === geo.lat && c.lng === geo.lng);
        });
        if (geo && geo.lat && !alreadyPinned) {
          var you = L.circleMarker([geo.lat, geo.lng], {
            radius: 12, color: '#1e2430', fillColor: '#3b7dff', fillOpacity: 0.95, weight: 3
          }).bindPopup('<div style="text-align:center;"><strong>' + esc(geo.name || 'Il tuo club') + '</strong><br><span style="font-size:0.8rem; color:#3b7dff;">Sede geolocalizzata ufficialmente</span></div>');
          self.cluster.addLayer(you);
        }

        var placed = filtered;
        var nEl = document.getElementById('es-map-count');
        if (nEl) {
          try { nEl.textContent = placed.length.toLocaleString('it-IT'); }
          catch (_) { nEl.textContent = String(placed.length); }
        }
        syncClubsSentence(placed.length);

        var regionCounts = {};
        Object.keys(REGION_CENTERS).forEach(function (k) { regionCounts[k] = 0; });
        placed.forEach(function (c) {
          var reg = knownRegion(c.region);
          if (reg) regionCounts[reg] += 1;
        });
        renderRegionsGrid(regionCounts);

        setTimeout(function () { if (self.map) self.map.invalidateSize(); }, 120);
      });
    },
    flyToRegion: function (regionName, shouldScroll) {
      var cfg = REGION_CENTERS[regionName];
      if (cfg && this.map) {
        this.map.flyTo(cfg.coords, cfg.zoom, { duration: 1.2 });

        document.querySelectorAll('.es-region-card').forEach(function (c) {
          if (c.getAttribute('data-regione') === regionName) {
            c.classList.add('is-selected');
            c.setAttribute('aria-selected', 'true');
          } else {
            c.classList.remove('is-selected');
            c.removeAttribute('aria-selected');
          }
        });

        if (shouldScroll) {
          var root = document.getElementById('mappa-portal');
          if (root) {
            root.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        if (window.showToast) {
          window.showToast('Mappa inquadrata su ' + regionName, 'info');
        }
      }
    },
    resetView: function () {
      if (this.map) {
        this.map.flyTo([42.2, 12.8], 6, { duration: 1.2 });
      }
      regionState.expandedRegion = null;
      renderRegionsGrid();

      document.querySelectorAll('.es-region-card').forEach(function (c) {
        c.classList.remove('is-selected');
        c.removeAttribute('aria-selected');
      });
      var input = document.getElementById('club-search') || document.getElementById('es-map-search-input');
      if (input) input.value = '';
      var clearBtn = document.getElementById('club-search-clear') || document.getElementById('es-map-search-clear');
      if (clearBtn) {
        clearBtn.classList.remove('is-visible');
        clearBtn.hidden = true;
      }
      var dd = document.getElementById('club-search-results') || document.getElementById('es-map-search-dropdown');
      if (dd) {
        dd.classList.remove('is-open');
        dd.hidden = true;
      }

      var root = document.getElementById('mappa-portal');
      if (root) {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.showToast) {
        window.showToast('Visuale ripristinata su tutta Italia', 'info');
      }
    },
    open: function () {
      if (typeof window.switchView === 'function') window.switchView('mappa', '#mappa-portal');
      document.body.classList.add('is-view-mappa');
      try {
        document.querySelectorAll('.nav-link, .es-m-tab-item').forEach(function (l) { l.classList.remove('active'); });
        var ml = document.querySelector('.nav-link[data-view="mappa"]');
        if (ml) ml.classList.add('active');
        var mt = document.querySelector('.es-m-tab-item[data-view="mappa"]');
        if (mt) mt.classList.add('active');
      } catch (_) {}
      var self = this;
      setTimeout(function () { self.refresh(); }, 80);
    },
    openGeoModal: function (club) {
      openGeoModal(club);
    },
    setGeo: function () {
      openGeoModal();
    },
    toggleFull: function () {
      var root = document.getElementById('mappa-portal');
      if (!root) return;
      root.classList.toggle('is-full');
      var self = this;
      setTimeout(function () { if (self.map) self.map.invalidateSize(); }, 80);
    }
  };

  window.openClubMap = function () { window.EliseeClubMap.open(); };
  window.openClubGeoModal = function (c) { window.EliseeClubMap.openGeoModal(c); };

  function boot() {
    document.addEventListener('elisee:lang-changed', function () {
      var nEl = document.getElementById('es-map-count');
      if (!nEl) return;
      var n = parseInt(String(nEl.textContent).replace(/[^\d]/g, ''), 10);
      if (isNaN(n)) return;
      syncClubsSentence(n);
    });
    document.addEventListener('elisee:club-registered', function () {
      invalidateClubs();
      if (window.EliseeClubMap && window.EliseeClubMap.refresh) window.EliseeClubMap.refresh();
    });
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'mappa' || (d.hash && String(d.hash).indexOf('mappa') >= 0))) {
        document.body.classList.add('is-view-mappa');
        setTimeout(function () { window.EliseeClubMap.refresh(); }, 60);
      } else {
        document.body.classList.remove('is-view-mappa');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
