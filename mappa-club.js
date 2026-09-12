/* Mappa club — pin con stemmi, geolocalizzazione club e coordinamento catalogo squadre */
(function () {
  'use strict';

  var CLUBS_URL = 'data/squadre/scopri-clubs.json?v=20260908_ECCLAZIO4';
  var MAX_PINS = 3500;
  var clubs = null;
  var activeFilter = 'all';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

  function loadClubs(done) {
    if (clubs) { done(clubs); return; }
    if (window.__eliseeScopriClubs && window.__eliseeScopriClubs.length) {
      clubs = window.__eliseeScopriClubs;
      done(clubs);
      return;
    }
    fetch(CLUBS_URL)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var base = (j.clubs || []).filter(function (c) {
          return typeof c.lat === 'number' && typeof c.lng === 'number';
        });
        var overrides = getGeoOverrides();
        base.forEach(function (c) {
          if (c && c.id && overrides[c.id]) {
            c.lat = overrides[c.id].lat;
            c.lng = overrides[c.id].lng;
            if (overrides[c.id].stadium) c.stadium = overrides[c.id].stadium;
            if (overrides[c.id].city) c.city = overrides[c.id].city;
          }
        });
        clubs = base;
        window.__eliseeScopriClubs = clubs;
        done(clubs);
      })
      .catch(function () {
        clubs = [];
        done(clubs);
      });
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
          '<span style="font-size:0.75rem; color:#3b7dff; font-weight:700;">' + esc(c.league || c.group || 'Club Ufficiale') + '</span>' +
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

    loadClubs(function (allClubs) {
      var u = getStoredUser();
      var defName = prefillClub ? (prefillClub.name || '') : (u.clubName || u.squadra || '');
      var defCity = prefillClub ? (prefillClub.city || '') : (u.citta || u.city || '');
      var defStadium = prefillClub ? (prefillClub.stadium || '') : (u.stadio || '');
      var defLat = prefillClub && prefillClub.lat ? prefillClub.lat : (u.clubGeo && u.clubGeo.lat ? u.clubGeo.lat : '');
      var defLng = prefillClub && prefillClub.lng ? prefillClub.lng : (u.clubGeo && u.clubGeo.lng ? u.clubGeo.lng : '');

      var modal = document.createElement('div');
      modal.id = 'es-club-geo-modal';
      modal.className = 'es-geo-modal-backdrop';
      modal.innerHTML =
        '<div class="es-geo-modal-sheet" role="dialog" aria-modal="true">' +
          '<div class="es-geo-modal-header">' +
            '<div style="display:flex; align-items:center; gap:0.6rem;">' +
              '<span style="font-size:1.4rem;">📍</span>' +
              '<div>' +
                '<h3 style="margin:0; color:#38bdf8; font-size:1.05rem; font-weight:800;">Geolocalizzazione Club &amp; Sede</h3>' +
                '<p style="margin:0.15rem 0 0; color:#94a3b8; font-size:0.78rem;">Posiziona o perfeziona lo stadio, la sede e le coordinate del Club sulla mappa.</p>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-geo-close-btn" id="btn-close-geo-modal">&times;</button>' +
          '</div>' +

          '<form id="form-club-geo" style="margin-top:1rem; display:flex; flex-direction:column; gap:0.85rem;">' +
            '<div>' +
              '<label style="display:block; color:#cbd5e1; font-size:0.8rem; font-weight:700; margin-bottom:0.35rem;">Seleziona o Cerca Squadra nel Database *</label>' +
              '<input type="text" id="geo-club-search" list="geo-club-list" required placeholder="Digita il nome del club (es. Foggia, Nardò, Taranto...)" value="' + esc(defName) + '" style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.85); border:1.5px solid rgba(56,189,248,0.4); border-radius:10px; padding:0.65rem 0.85rem; color:#fff; font-size:0.88rem; font-family:inherit;">' +
              '<datalist id="geo-club-list"></datalist>' +
            '</div>' +

            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">' +
              '<div>' +
                '<label style="display:block; color:#cbd5e1; font-size:0.8rem; font-weight:700; margin-bottom:0.35rem;">Città / Comune *</label>' +
                '<input type="text" id="geo-club-city" required placeholder="Es. Taranto, Foggia" value="' + esc(defCity) + '" style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:0.6rem 0.8rem; color:#fff; font-size:0.85rem; font-family:inherit;">' +
              '</div>' +
              '<div>' +
                '<label style="display:block; color:#cbd5e1; font-size:0.8rem; font-weight:700; margin-bottom:0.35rem;">Stadio / Centro Sportivo</label>' +
                '<input type="text" id="geo-club-stadium" placeholder="Es. Stadio Comunale" value="' + esc(defStadium) + '" style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:0.6rem 0.8rem; color:#fff; font-size:0.85rem; font-family:inherit;">' +
              '</div>' +
            '</div>' +

            '<div style="background:rgba(2,132,199,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:10px; padding:0.8rem; margin:0.2rem 0;">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">' +
                '<span style="color:#7dd3fc; font-size:0.8rem; font-weight:700;">Coordinate Geografiche (WGS84)</span>' +
                '<button type="button" id="btn-detect-gps" style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; border-radius:8px; padding:0.3rem 0.65rem; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:0.3rem;">' +
                  '<span>📍</span> Rileva con GPS' +
                '</button>' +
              '</div>' +
              '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">' +
                '<div>' +
                  '<label style="display:block; color:#94a3b8; font-size:0.75rem; margin-bottom:0.25rem;">Latitudine *</label>' +
                  '<input type="number" step="any" id="geo-club-lat" required placeholder="Es. 40.4764" value="' + esc(defLat) + '" style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:0.55rem 0.75rem; color:#38bdf8; font-weight:700; font-size:0.85rem; font-family:inherit;">' +
                '</div>' +
                '<div>' +
                  '<label style="display:block; color:#94a3b8; font-size:0.75rem; margin-bottom:0.25rem;">Longitudine *</label>' +
                  '<input type="number" step="any" id="geo-club-lng" required placeholder="Es. 17.2341" value="' + esc(defLng) + '" style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:0.55rem 0.75rem; color:#38bdf8; font-weight:700; font-size:0.85rem; font-family:inherit;">' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:flex-end; gap:0.6rem; margin-top:0.4rem;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-cancel-geo">Annulla</button>' +
              '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#0284c7; color:#fff; border-color:#38bdf8; font-weight:800;">Salva e Posiziona sulla Mappa</button>' +
            '</div>' +
            '<p id="geo-modal-msg" style="display:none; margin:0.3rem 0 0; font-size:0.8rem; font-weight:600; text-align:center;"></p>' +
          '</form>' +
        '</div>';

      document.body.appendChild(modal);

      // Popola datalist con le squadre del catalogo
      var datalist = document.getElementById('geo-club-list');
      if (datalist && allClubs) {
        allClubs.slice(0, 1200).forEach(function (c) {
          var opt = document.createElement('option');
          opt.value = c.name + (c.city ? ' (' + c.city + ')' : '');
          opt.dataset.id = c.id;
          opt.dataset.lat = c.lat;
          opt.dataset.lng = c.lng;
          opt.dataset.city = c.city || '';
          opt.dataset.stadium = c.stadium || '';
          datalist.appendChild(opt);
        });
      }

      var searchInput = document.getElementById('geo-club-search');
      if (searchInput) {
        searchInput.addEventListener('change', function () {
          var val = this.value.trim().toLowerCase();
          var found = allClubs.find(function (c) {
            return c.name.toLowerCase() === val || (c.name + ' (' + (c.city || '') + ')').toLowerCase() === val;
          });
          if (found) {
            if (found.city) document.getElementById('geo-club-city').value = found.city;
            if (found.stadium) document.getElementById('geo-club-stadium').value = found.stadium;
            if (found.lat) document.getElementById('geo-club-lat').value = found.lat;
            if (found.lng) document.getElementById('geo-club-lng').value = found.lng;
          }
        });
      }

      // GPS detect button
      var btnGps = document.getElementById('btn-detect-gps');
      if (btnGps) {
        btnGps.addEventListener('click', function () {
          if (!navigator.geolocation) {
            alert('Geolocalizzazione non supportata dal tuo browser.');
            return;
          }
          btnGps.textContent = '⏳ Rilevamento in corso...';
          navigator.geolocation.getCurrentPosition(function (pos) {
            document.getElementById('geo-club-lat').value = pos.coords.latitude.toFixed(5);
            document.getElementById('geo-club-lng').value = pos.coords.longitude.toFixed(5);
            btnGps.innerHTML = '<span>✅</span> Posizione Rilevata';
            setTimeout(function () { btnGps.innerHTML = '<span>📍</span> Rileva con GPS'; }, 3000);
          }, function (err) {
            btnGps.innerHTML = '<span>📍</span> Rileva con GPS';
            alert('Impossibile rilevare la posizione: autorizzazione negata o segnale GPS debole.');
          }, { enableHighAccuracy: true, timeout: 10000 });
        });
      }

      function closeModal() {
        modal.classList.remove('is-open');
        setTimeout(function () { if (modal.parentElement) modal.remove(); }, 200);
      }

      document.getElementById('btn-close-geo-modal').onclick = closeModal;
      document.getElementById('btn-cancel-geo').onclick = closeModal;
      modal.onclick = function (e) { if (e.target === modal) closeModal(); };

      // Submit
      var form = document.getElementById('form-club-geo');
      if (form) {
        form.onsubmit = function (e) {
          e.preventDefault();
          var rawClub = document.getElementById('geo-club-search').value.trim();
          var city = document.getElementById('geo-club-city').value.trim();
          var stadium = document.getElementById('geo-club-stadium').value.trim();
          var lat = parseFloat(document.getElementById('geo-club-lat').value);
          var lng = parseFloat(document.getElementById('geo-club-lng').value);

          if (isNaN(lat) || isNaN(lng)) {
            alert('Inserisci coordinate geografiche valide.');
            return;
          }

          var found = allClubs.find(function (c) {
            return c.name.toLowerCase() === rawClub.toLowerCase() ||
                   rawClub.toLowerCase().indexOf(c.name.toLowerCase()) >= 0;
          });

          var clubId = found ? found.id : ('club-custom-' + Date.now());
          var clubName = found ? found.name : rawClub;

          var geoData = {
            id: clubId,
            name: clubName,
            city: city,
            stadium: stadium,
            lat: lat,
            lng: lng,
            updatedAt: new Date().toISOString()
          };

          saveGeoOverride(clubId, geoData);

          if (found) {
            found.lat = lat;
            found.lng = lng;
            found.city = city;
            if (stadium) found.stadium = stadium;
          } else {
            allClubs.unshift(geoData);
          }

          closeModal();

          if (window.showToast) {
            window.showToast('📍 Geolocalizzazione per ' + clubName + ' salvata con successo!', 'success');
          }

          window.EliseeClubMap.refresh();
          setTimeout(function () {
            if (window.EliseeClubMap.map) {
              window.EliseeClubMap.map.flyTo([lat, lng], 13, { duration: 1.2 });
            }
          }, 300);
        };
      }

      requestAnimationFrame(function () { modal.classList.add('is-open'); });
    });
  }

  // =====================================================================
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

  function renderRegionsGrid(counts) {
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
      html += '<button type="button" class="es-region-card es-map-reg-card" data-regione="' + esc(reg) + '" aria-label="' + esc(reg) + ', ' + num + ' club">' +
        '<div class="es-region-card__header">' +
          '<p class="es-region-card__name es-map-reg-card__name">' + esc(reg) + '</p>' +
          '<p class="es-region-card__count es-map-reg-card__count">' + num.toLocaleString('it-IT') + '<span>club</span></p>' +
        '</div>' +
        '<div class="es-region-card__bar-track" aria-hidden="true">' +
          '<div class="es-region-card__bar" style="width:' + pct + '%;"></div>' +
        '</div>' +
      '</button>';
    });
    host.innerHTML = html;

    host.onclick = function (e) {
      var btn = e.target.closest('.es-region-card');
      if (!btn) return;
      var r = btn.getAttribute('data-regione');
      if (r && window.EliseeClubMap) {
        window.EliseeClubMap.flyToRegion(r);
      }
    };
  }

  /* Ricerca club autocomplete — ricostruita con vera sorgente dati e centratura mappa */
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
        } else {
          resultsBox.innerHTML = match.map(function (c) {
            var meta = esc(c.city ? (c.city + (c.region ? ' (' + c.region + ')' : '')) : (c.region || ''));
            return (
              '<div class="es-map-search__result" data-club-id="' + esc(c.id) + '" data-nome="' + esc(c.name) + '">' +
                '<span class="es-map-search__result-name">' + esc(c.name) + '</span>' +
                '<span class="es-map-search__result-meta">' + meta + '</span>' +
              '</div>'
            );
          }).join('');
        }
        resultsBox.classList.add('is-open');
      });
    }

    input.addEventListener('input', function (e) {
      var val = e.target.value.trim();
      if (clearBtn) clearBtn.classList.toggle('is-visible', !!val);
      renderResults(val);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) renderResults(input.value.trim());
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.es-map-search') && !e.target.closest('#es-map-search-container')) {
        resultsBox.classList.remove('is-open');
      }
    });

    resultsBox.addEventListener('click', function (e) {
      var item = e.target.closest('.es-map-search__result');
      if (!item) return;
      var clubId = item.getAttribute('data-club-id');
      var clubNome = item.getAttribute('data-nome');
      input.value = clubNome;
      resultsBox.classList.remove('is-open');

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
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.classList.remove('is-visible');
        resultsBox.classList.remove('is-open');
        input.focus();
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        resultsBox.classList.remove('is-open');
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
      this.map = L.map(el, { zoomControl: true, scrollWheelZoom: true }).setView([42.2, 12.8], 6);
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
          if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return false;
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
        if (geo && geo.lat) {
          var you = L.circleMarker([geo.lat, geo.lng], {
            radius: 12, color: '#1e2430', fillColor: '#3b7dff', fillOpacity: 0.95, weight: 3
          }).bindPopup('<div style="text-align:center;"><strong>' + esc(geo.name || 'Il tuo club') + '</strong><br><span style="font-size:0.8rem; color:#3b7dff;">Sede geolocalizzata ufficialmente</span></div>');
          self.cluster.addLayer(you);
        }

        var nEl = document.getElementById('es-map-count');
        if (nEl) {
          try {
            nEl.textContent = rows.length.toLocaleString('it-IT');
          } catch (_) {
            nEl.textContent = String(rows.length);
          }
        }

        // Calcola e renderizza classifica regionale
        var regionCounts = {};
        rows.forEach(function (c) {
          var reg = c.region || 'Altra Regione';
          regionCounts[reg] = (regionCounts[reg] || 0) + 1;
        });
        renderRegionsGrid(regionCounts);

        setTimeout(function () { if (self.map) self.map.invalidateSize(); }, 120);
      });
    },
    flyToRegion: function (regionName) {
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

        var root = document.getElementById('mappa-portal');
        if (root) {
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
