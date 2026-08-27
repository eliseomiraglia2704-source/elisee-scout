/* Chi segui — i tuoi seguiti e quelli degli altri utenti */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey() {
    var u = userObj();
    return String(u.email || u.id || '').trim().toLowerCase();
  }
  function meName() {
    var u = userObj();
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || u.email || 'Tu';
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function followMap() {
    try { return JSON.parse(localStorage.getItem('elisee_social_following') || '{}') || {}; } catch (_) { return {}; }
  }
  function catalog() {
    if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
      return window.EliseeScopri.allProfiles();
    }
    return [];
  }
  function byId(id) {
    var all = catalog();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function hash(s) {
    var h = 0, t = String(s || '');
    for (var i = 0; i < t.length; i++) h = ((h << 5) - h) + t.charCodeAt(i) | 0;
    return Math.abs(h);
  }
  function publicFollowingIds(ownerId) {
    var map = followMap();
    if (map[ownerId] && Array.isArray(map[ownerId].ids) && map[ownerId].ids.length) {
      return map[ownerId].ids.slice();
    }
    var all = catalog().filter(function (p) { return p.id !== ownerId && !p.isMe; });
    if (!all.length) return [];
    var n = 4 + (hash(ownerId) % 7);
    var out = [];
    var start = hash(ownerId) % all.length;
    for (var i = 0; i < all.length && out.length < n; i++) {
      out.push(all[(start + i * 7) % all.length].id);
    }
    return out;
  }
  function peopleFor(ids, kind) {
    var mine = isLogged() ? ((followMap()[meKey()] || {}).ids || []) : [];
    return ids.map(byId).filter(function (p) {
      if (!p) return false;
      if (kind && p.kind !== kind) return false;
      return true;
    }).map(function (p) {
      p = Object.assign({}, p);
      p._iFollow = mine.indexOf(p.id) >= 0;
      return p;
    });
  }

  window.EliseeChiSegui = {
    kind: 'ente',
    ownerId: '',
    ownerName: '',
    isMe: true,
    render: function () {
      var title = document.getElementById('es-cs-title');
      var empty = document.getElementById('es-cs-empty');
      var emptyT = document.getElementById('es-cs-empty-title');
      var emptyS = document.getElementById('es-cs-empty-sub');
      var list = document.getElementById('es-cs-list');
      var owner = this.ownerId || meKey();
      var mine = !this.ownerId || this.ownerId === meKey();
      this.isMe = mine;
      if (title) title.textContent = mine ? 'Album' : ('Album di ' + (this.ownerName || 'questo profilo'));
      document.querySelectorAll('#es-cs-chips .es-sc-chip').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-kind') === window.EliseeChiSegui.kind);
      });
      var ids = mine ? ((followMap()[meKey()] || {}).ids || []) : publicFollowingIds(owner);
      var rows = peopleFor(ids, this.kind);
      if (!rows.length) {
        if (empty) empty.hidden = false;
        if (emptyT) emptyT.textContent = 'Nessun profilo';
        if (emptyS) {
          emptyS.textContent = mine
            ? 'Nessuna Card nel tuo Album.'
            : 'Nessuna Card in questa categoria dell’Album.';
        }
        if (list) { list.hidden = true; list.innerHTML = ''; }
        return;
      }
      if (empty) empty.hidden = true;
      if (list) {
        list.hidden = false;
        var card = window.EliseeScopri && window.EliseeScopri.cardHtml
          ? function (p) { return window.EliseeScopri.cardHtml(p, rows.filter(function (x) { return x._iFollow; }).map(function (x) { return x.id; }).concat(p._iFollow ? [p.id] : [])); }
          : null;
        var followedMine = (followMap()[meKey()] || {}).ids || [];
        if (window.EliseeScopri && typeof window.EliseeScopri.cardHtml === 'function') {
          list.innerHTML = rows.map(function (p) {
            return window.EliseeScopri.cardHtml(p, followedMine) +
              '<button type="button" class="es-cs-their" data-see-follow="' + esc(p.id) + '" data-see-name="' + esc(p.name) + '">Vedi Album</button>';
          }).join('');
        } else {
          list.innerHTML = rows.map(function (p) {
            return '<article class="es-sc-card"><div class="es-sc-ava"></div><div><h3 class="es-sc-name">' + esc(p.name) + '</h3></div></article>';
          }).join('');
        }
      }
    },
    setKind: function (k) {
      this.kind = k || 'ente';
      this.render();
    },
    openMine: function () {
      if (!isLogged()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        return;
      }
      this.ownerId = meKey();
      this.ownerName = meName();
      this.kind = this.kind || 'ente';
      if (typeof window.switchView === 'function') window.switchView('seguo', '#seguo-portal');
      var self = this;
      var go = function () { self.render(); };
      if (window.EliseeScopri && window.EliseeScopri.ensureClubs) window.EliseeScopri.ensureClubs(go);
      else setTimeout(go, 40);
    },
    openOf: function (ownerId, ownerName) {
      if (!ownerId) { this.openMine(); return; }
      this.ownerId = ownerId;
      this.ownerName = ownerName || ownerId;
      if (typeof window.switchView === 'function') window.switchView('seguo', '#seguo-portal');
      var self = this;
      var go = function () { self.render(); };
      if (window.EliseeScopri && window.EliseeScopri.ensureClubs) window.EliseeScopri.ensureClubs(go);
      else setTimeout(go, 40);
    },
    bind: function () {
      var root = document.getElementById('seguo-portal');
      if (!root || root.dataset.bound === '1') return;
      root.dataset.bound = '1';
      var self = this;
      root.addEventListener('click', function (e) {
        var chip = e.target.closest('.es-sc-chip');
        if (chip) { self.setKind(chip.getAttribute('data-kind')); return; }
        var see = e.target.closest('[data-see-follow]');
        if (see) { self.openOf(see.getAttribute('data-see-follow'), see.getAttribute('data-see-name')); return; }
        var fol = e.target.closest('[data-follow]');
        if (fol && window.EliseeScopri) {
          window.EliseeScopri.follow(fol.getAttribute('data-follow'));
          setTimeout(function () { self.render(); }, 30);
          return;
        }
        var msg = e.target.closest('[data-msg]');
        if (msg && window.openB2BMessage) {
          window.openB2BMessage(msg.getAttribute('data-msg'), msg.getAttribute('data-msg-name'), msg.getAttribute('data-msg-kind'));
        }
      });
    }
  };

  window.openChiSegui = function (ownerId, ownerName) {
    if (ownerId) window.EliseeChiSegui.openOf(ownerId, ownerName);
    else window.EliseeChiSegui.openMine();
  };

  function boot() {
    window.EliseeChiSegui.bind();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'seguo' || (d.hash && String(d.hash).indexOf('seguo') >= 0))) {
        window.EliseeChiSegui.render();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
