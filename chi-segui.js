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
      var subtitle = document.getElementById('es-cs-subtitle');
      var empty = document.getElementById('profiles-empty') || document.getElementById('es-cs-empty');
      var emptyT = document.getElementById('es-cs-empty-title');
      var emptyS = document.getElementById('es-cs-empty-sub');
      var list = document.getElementById('profiles-grid') || document.getElementById('es-cs-list');
      var owner = this.ownerId || meKey();
      var mine = !this.ownerId || this.ownerId === meKey();
      this.isMe = mine;
      
      if (title) title.textContent = mine ? 'Album' : ('Album di ' + (this.ownerName || 'questo profilo'));
      if (subtitle) {
        subtitle.textContent = mine
          ? 'Chi hai in rete — enti, club, giocatori e staff che segui o hai salvato su Elisee Scout.'
          : ('I collegamenti e i profili seguiti da ' + (this.ownerName || 'questo utente') + ' su Elisee Scout.');
      }

      var currentKind = this.kind || 'ente';
      document.querySelectorAll('#es-cs-chips button, .es-tabs button').forEach(function (b) {
        var k = b.getAttribute('data-cat') || b.getAttribute('data-kind');
        var active = (k === currentKind);
        b.classList.toggle('is-active', active);
        b.classList.toggle('is-on', active);
      });

      var ids = mine ? ((followMap()[meKey()] || {}).ids || []) : publicFollowingIds(owner);
      var rows = peopleFor(ids, currentKind);

      function initials(nome) {
        return String(nome || '').trim().split(/\s+/).map(function (p) { return p.charAt(0); }).slice(0, 2).join('').toUpperCase() || 'ES';
      }

      function cardHTML(p) {
        var ini = initials(p.name || p.nome);
        var nome = esc(p.name || p.nome || 'Profilo');
        var meta = esc(p.role || p.ruolo || p.cat || p.categoria || p.meta || (currentKind.toUpperCase()));
        var pid = esc(p.id || '');
        return (
          '<div class="es-profile-card">' +
            '<div class="es-profile-card__avatar">' + ini + '</div>' +
            '<p class="es-profile-card__name">' + nome + '</p>' +
            '<p class="es-profile-card__meta">' + meta + '</p>' +
            '<button type="button" class="es-profile-card__btn" data-see-dossier="' + pid + '" data-see-name="' + nome + '">Visualizza profilo</button>' +
          '</div>'
        );
      }

      if (!rows.length) {
        if (empty) {
          empty.hidden = false;
          empty.classList.add('is-active');
          empty.style.display = 'block';
        }
        if (emptyT) emptyT.textContent = "Nessun profilo in questa categoria dell'Album";
        if (emptyS) {
          emptyS.textContent = mine
            ? "Non hai ancora salvato nessun profilo qui. Esplora la Bacheca o la Mappa per trovare club, giocatori e staff da seguire."
            : "Questo profilo non ha ancora collegamenti in questa categoria dell'Album.";
        }
        if (list) {
          list.hidden = true;
          list.style.display = 'none';
          list.innerHTML = '';
        }
        return;
      }

      if (empty) {
        empty.hidden = true;
        empty.classList.remove('is-active');
        empty.style.display = 'none';
      }
      if (list) {
        list.hidden = false;
        list.style.display = 'grid';
        list.innerHTML = rows.map(cardHTML).join('');
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
        var tabBtn = e.target.closest('#es-cs-chips button, .es-tabs button');
        if (tabBtn) {
          e.preventDefault();
          var k = tabBtn.getAttribute('data-cat') || tabBtn.getAttribute('data-kind');
          self.setKind(k);
          return;
        }

        var bachecaCta = e.target.closest('#es-empty-bacheca-btn, .es-empty__actions .es-btn--primary');
        if (bachecaCta) {
          e.preventDefault();
          if (typeof window.switchView === 'function') window.switchView('bacheca', '#bacheca-annunci');
          else window.location.hash = '#bacheca-annunci';
          return;
        }

        var mappaCta = e.target.closest('#es-empty-mappa-btn, .es-empty__actions .es-btn--secondary');
        if (mappaCta) {
          e.preventDefault();
          if (typeof window.openClubMap === 'function') window.openClubMap();
          else if (typeof window.switchView === 'function') window.switchView('mappa', '#mappa-portal');
          else window.location.hash = '#mappa-portal';
          return;
        }

        var seeDossier = e.target.closest('[data-see-dossier]');
        if (seeDossier) {
          var did = seeDossier.getAttribute('data-see-dossier');
          var dname = seeDossier.getAttribute('data-see-name');
          if (typeof window.openUserDossierModal === 'function') {
            window.openUserDossierModal(did, dname);
          } else if (typeof window.switchView === 'function') {
            window.switchView('user-dossier', '#user-dossier-portal?id=' + encodeURIComponent(did));
          }
          return;
        }

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
