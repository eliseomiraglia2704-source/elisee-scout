/* Messaggi B2B — thread tra utenti (non notifiche di sistema) */
(function () {
  var STORE = 'elisee_b2b_threads_v1';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function me() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey() {
    var u = me();
    return String(u.email || u.id || u.username || '').trim().toLowerCase();
  }
  function meName() {
    var u = me();
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || u.email || 'Tu';
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function needLogin() {
    if (isLogged()) return false;
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    else if (typeof window.showToast === 'function') window.showToast('Accedi per scrivere agli altri utenti.', 'error');
    else alert('Accedi per scrivere agli altri utenti.');
    return true;
  }
  function initials(name) {
    var p = String(name || 'U').trim().split(/\s+/);
    return ((p[0] || 'U').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{"threads":{}}') || { threads: {} }; } catch (_) { return { threads: {} }; }
  }
  function save(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (_) {}
  }
  function pairId(a, b) {
    var x = [String(a), String(b)].sort();
    return 'th-' + x[0] + '__' + x[1];
  }
  function fmt(iso) {
    try {
      return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (_) { return ''; }
  }

  function myThreads() {
    var k = meKey();
    var all = load().threads || {};
    var out = [];
    Object.keys(all).forEach(function (id) {
      var t = all[id];
      if (!t) return;
      if (t.a === k || t.b === k) out.push(t);
    });
    out.sort(function (x, y) { return String(y.updatedAt || '').localeCompare(String(x.updatedAt || '')); });
    return out;
  }

  function peerOf(t) {
    var k = meKey();
    if (t.a === k) return { id: t.b, name: t.bName || t.b };
    return { id: t.a, name: t.aName || t.a };
  }

  function unreadCount() {
    var k = meKey();
    var n = 0;
    myThreads().forEach(function (t) {
      (t.messages || []).forEach(function (m) {
        if (m.from !== k && !m.read) n++;
      });
    });
    return n;
  }

  window.EliseeB2B = {
    activeId: '',
    paintBadges: function () {
      var n = isLogged() ? unreadCount() : 0;
      var dot = document.getElementById('es-nav-mail-dot');
      var tab = document.getElementById('es-user-tab-msg-dot');
      if (dot) dot.hidden = n < 1;
      if (tab) tab.hidden = n < 1;
    },
    ensureThread: function (peerId, peerName, peerKind) {
      var k = meKey();
      if (!k || !peerId || peerId === k) return null;
      var id = pairId(k, peerId);
      var data = load();
      if (!data.threads[id]) {
        data.threads[id] = {
          id: id,
          a: k,
          b: String(peerId),
          aName: meName(),
          bName: peerName || peerId,
          kind: peerKind || 'staff',
          messages: [],
          updatedAt: new Date().toISOString()
        };
        save(data);
      } else if (peerName && data.threads[id].b === String(peerId)) {
        data.threads[id].bName = peerName;
        save(data);
      }
      return data.threads[id];
    },
    send: function (threadId, text) {
      text = String(text || '').trim();
      if (!text) return;
      var k = meKey();
      var data = load();
      var t = data.threads[threadId];
      if (!t) return;
      t.messages = t.messages || [];
      t.messages.push({ from: k, text: text, at: new Date().toISOString(), read: true });
      t.updatedAt = new Date().toISOString();
      save(data);
      this.renderThread(threadId);
      this.paintBadges();
    },
    markRead: function (threadId) {
      var k = meKey();
      var data = load();
      var t = data.threads[threadId];
      if (!t) return;
      (t.messages || []).forEach(function (m) { if (m.from !== k) m.read = true; });
      save(data);
      this.paintBadges();
    },
    renderInbox: function () {
      this.activeId = '';
      var empty = document.getElementById('es-msg-empty');
      var list = document.getElementById('es-msg-list');
      var thread = document.getElementById('es-msg-thread');
      var inbox = document.getElementById('es-msg-inbox');
      if (thread) thread.hidden = true;
      if (inbox) inbox.hidden = false;
      var rows = isLogged() ? myThreads() : [];
      if (!rows.length) {
        if (empty) { empty.hidden = false; empty.textContent = 'Nessun thread disponibile.'; }
        if (list) { list.hidden = true; list.innerHTML = ''; }
        this.paintBadges();
        return;
      }
      if (empty) empty.hidden = true;
      if (list) {
        list.hidden = false;
        list.innerHTML = rows.map(function (t) {
          var p = peerOf(t);
          var last = (t.messages || [])[t.messages.length - 1];
          var unread = (t.messages || []).some(function (m) { return m.from !== meKey() && !m.read; });
          var preview = last ? last.text : 'Nuova conversazione';
          return '<li><button type="button" class="es-msg-row' + (unread ? ' is-unread' : '') + '" data-open-thread="' + esc(t.id) + '">' +
            '<span class="es-msg-ava">' + esc(initials(p.name)) + '</span>' +
            '<span><strong>' + esc(p.name) + '</strong><p>' + esc(preview) + '</p></span>' +
            '<time>' + esc(last ? fmt(last.at) : '') + '</time>' +
            '</button></li>';
        }).join('');
      }
      this.paintBadges();
    },
    renderThread: function (id) {
      var data = load();
      var t = data.threads[id];
      if (!t) { this.renderInbox(); return; }
      this.activeId = id;
      this.markRead(id);
      t = load().threads[id];
      var inbox = document.getElementById('es-msg-inbox');
      var thread = document.getElementById('es-msg-thread');
      var nameEl = document.getElementById('es-msg-peer');
      var box = document.getElementById('es-msg-bubbles');
      if (inbox) inbox.hidden = true;
      if (thread) thread.hidden = false;
      var p = peerOf(t);
      if (nameEl) nameEl.textContent = p.name;
      var k = meKey();
      if (box) {
        if (!(t.messages || []).length) {
          box.innerHTML = '<p class="es-msg-empty">Nessun messaggio. Scrivi per avviare il contatto B2B.</p>';
        } else {
          box.innerHTML = t.messages.map(function (m) {
            return '<div class="es-msg-b ' + (m.from === k ? 'me' : 'them') + '">' +
              esc(m.text) + '<small>' + esc(fmt(m.at)) + '</small></div>';
          }).join('');
          box.scrollTop = box.scrollHeight;
        }
      }
      var inp = document.getElementById('es-msg-input');
      if (inp) setTimeout(function () { try { inp.focus(); } catch (_) {} }, 30);
    },
    openInbox: function () {
      if (needLogin()) return;
      this.activeId = '';
      if (typeof window.switchView === 'function') window.switchView('messaggi', '#messaggi-portal');
      var self = this;
      setTimeout(function () { self.renderInbox(); }, 30);
    },
    openWith: function (peerId, peerName, peerKind) {
      if (needLogin()) return;
      if (!peerId) { this.openInbox(); return; }
      var t = this.ensureThread(peerId, peerName, peerKind);
      if (!t) return;
      if (typeof window.switchView === 'function') window.switchView('messaggi', '#messaggi-portal');
      var self = this;
      setTimeout(function () { self.renderThread(t.id); }, 40);
    },
    bind: function () {
      var portal = document.getElementById('messaggi-portal');
      if (!portal || portal.dataset.bound === '1') return;
      portal.dataset.bound = '1';
      var self = this;
      portal.addEventListener('click', function (e) {
        var open = e.target.closest('[data-open-thread]');
        if (open) { self.renderThread(open.getAttribute('data-open-thread')); return; }
        if (e.target.closest('#es-msg-back')) { self.renderInbox(); }
      });
      var form = document.getElementById('es-msg-form');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var inp = document.getElementById('es-msg-input');
          var text = inp ? inp.value : '';
          if (self.activeId) self.send(self.activeId, text);
          if (inp) inp.value = '';
        });
      }
      this.paintBadges();
    }
  };

  window.openUserMessages = function () {
    window.EliseeB2B.openInbox();
  };
  window.openB2BMessage = function (peerId, peerName, peerKind) {
    window.EliseeB2B.openWith(peerId, peerName, peerKind);
  };

  function boot() {
    window.EliseeB2B.bind();
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (!d) return;
      if (d.view === 'messaggi' || (d.hash && String(d.hash).indexOf('messaggi') >= 0)) {
        if (window.EliseeB2B.activeId) window.EliseeB2B.renderThread(window.EliseeB2B.activeId);
        else window.EliseeB2B.renderInbox();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
