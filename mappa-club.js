/* Mappa club — pin con stemmi */
(function () {
  var CLUBS_URL = 'data/squadre/scopri-clubs.json?v=20260820_MAP1';
  var MAX_PINS = 900;
  var clubs = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
  function isClubUser() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      var r = String(u.siteRoleFamily || u.ruolo || '').toLowerCase();
      return r.indexOf('squadra') >= 0 || r.indexOf('club') >= 0 || r.indexOf('societ') >= 0;
    } catch (_) { return false; }
  }
  function myClubGeo() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      if (u.clubGeo && u.clubGeo.lat) return u.clubGeo;
      var raw = localStorage.getItem('elisee_club_geo');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function saveClubGeo(geo) {
    try {
      localStorage.setItem('elisee_club_geo', JSON.stringify(geo));
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      u.clubGeo = geo;
      localStorage.setItem('elisee_active_user', JSON.stringify(u));
    } catch (_) {}
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
    fetch(CLUBS_URL).then(function (r) { return r.json(); }).then(function (j) {
      clubs = (j.clubs || []).filter(function (c) {
        return typeof c.lat === 'number' && typeof c.lng === 'number';
      });
      done(clubs);
    }).catch(function () { clubs = []; done(clubs); });
  }

  function pinIcon(c) {
    var inner = c.logo
      ? '<img src="' + esc(c.logo) + '" alt="">'
      : esc(initials(c.name));
    return L.divIcon({
      className: 'es-map-ico',
      html: '<div class="es-map-pin">' + inner + '</div>',
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
    return '<div class="es-map-pop">' +
      '<strong>' + esc(c.name) + '</strong>' +
      '<span>' + esc((c.city || '') + (c.sport ? ' · ' + c.sport : '')) + '</span>' +
      '<div class="es-sc-actions">' +
        '<button type="button" class="es-sc-follow" data-map-follow="' + esc(sid) + '">Segui</button>' +
        '<button type="button" class="es-sc-msg" data-map-msg="' + esc(sid) + '" data-map-name="' + esc(c.name) + '">Messaggia</button>' +
      '</div></div>';
  }

  window.EliseeClubMap = {
    map: null,
    cluster: null,
    ready: false,
    ensure: function () {
      var el = document.getElementById('es-map-canvas');
      if (!el || typeof L === 'undefined') return;
      if (this.map) {
        setTimeout(function () { window.EliseeClubMap.map.invalidateSize(); }, 60);
        return;
      }
      this.map = L.map(el, { zoomControl: true, scrollWheelZoom: true }).setView([42.6, 12.5], 6);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18
      }).addTo(this.map);
      this.cluster = L.markerClusterGroup({
        maxClusterRadius: 52,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: function (cluster) {
          var n = cluster.getChildCount();
          return L.divIcon({
            html: '<div class="es-map-cluster">' + n + '</div>',
            className: 'es-map-cluster-wrap',
            iconSize: [46, 46]
          });
        }
      });
      this.map.addLayer(this.cluster);
      var self = this;
      var portal = document.getElementById('mappa-portal');
      if (portal && !portal.dataset.mapBound) {
        portal.dataset.mapBound = '1';
        portal.addEventListener('click', function (e) {
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
    refresh: function () {
      var self = this;
      this.ensure();
      if (!this.map || !this.cluster) return;
      loadClubs(function (rows) {
        self.cluster.clearLayers();
        var withLogo = [];
        var rest = [];
        rows.forEach(function (c) {
          if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return;
          if (c.logo) withLogo.push(c);
          else rest.push(c);
        });
        var pick = withLogo.concat(rest).slice(0, MAX_PINS);
        pick.forEach(function (c) {
          var mk = L.marker([c.lat, c.lng], { icon: pinIcon(c), title: c.name });
          mk.bindPopup(popupHtml(c), { maxWidth: 240 });
          self.cluster.addLayer(mk);
        });
        var geo = myClubGeo();
        if (geo && geo.lat) {
          var you = L.circleMarker([geo.lat, geo.lng], {
            radius: 11, color: '#0d4f73', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 3
          }).bindPopup('<strong>Il tuo club</strong><br>Posizione impostata da te.');
          self.cluster.addLayer(you);
          pick.push({ id: 'me' });
        }
        var nEl = document.getElementById('es-map-count');
        if (nEl) nEl.textContent = String(pick.length);
        setTimeout(function () { if (self.map) self.map.invalidateSize(); }, 120);
      });
    },
    open: function () {
      if (typeof window.switchView === 'function') window.switchView('mappa', '#mappa-portal');
      var self = this;
      setTimeout(function () { self.refresh(); }, 80);
    },
    setGeo: function () {
      if (!isLogged()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        return;
      }
      if (!navigator.geolocation) {
        if (typeof window.showToast === 'function') window.showToast('Geolocalizzazione non disponibile su questo dispositivo.', 'error');
        return;
      }
      var self = this;
      navigator.geolocation.getCurrentPosition(function (pos) {
        saveClubGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, at: new Date().toISOString() });
        if (typeof window.showToast === 'function') window.showToast('Posizione del club salvata sulla mappa.', 'success');
        self.refresh();
      }, function () {
        if (typeof window.showToast === 'function') window.showToast('Permesso posizione negato. Attivalo dal browser.', 'error');
      }, { enableHighAccuracy: true, timeout: 12000 });
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

  function boot() {
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'mappa' || (d.hash && String(d.hash).indexOf('mappa') >= 0))) {
        setTimeout(function () { window.EliseeClubMap.refresh(); }, 60);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
