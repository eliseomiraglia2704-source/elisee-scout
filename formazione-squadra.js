/* Formazione videogioco — XI sul campo dopo Seleziona squadra */
(function () {
  var FIRST = ['Marco', 'Luca', 'Andrea', 'Davide', 'Matteo', 'Simone', 'Alessandro', 'Francesco', 'Lorenzo', 'Nicola', 'Giulia', 'Sara', 'Martina', 'Chiara', 'Elena'];
  var LAST = ['Rossi', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Gallo', 'Conti', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Ferrara', 'Rizzo', 'Lombardi', 'Greco', 'Esposito', 'Ferrari', 'Marino'];
  var MODULES = {
    '4-3-3': [
      { id: 'LW', l: 'AS', t: '16%', left: '16%' },
      { id: 'ST', l: 'ATT', t: '12%', left: '50%' },
      { id: 'RW', l: 'AD', t: '16%', left: '84%' },
      { id: 'CM1', l: 'CC', t: '40%', left: '26%' },
      { id: 'CM2', l: 'MED', t: '44%', left: '50%' },
      { id: 'CM3', l: 'CC', t: '40%', left: '74%' },
      { id: 'LB', l: 'TS', t: '68%', left: '16%' },
      { id: 'CB1', l: 'DC', t: '72%', left: '38%' },
      { id: 'CB2', l: 'DC', t: '72%', left: '62%' },
      { id: 'RB', l: 'TD', t: '68%', left: '84%' },
      { id: 'GK', l: 'POR', t: '90%', left: '50%' }
    ],
    '4-2-3-1': [
      { id: 'ST', l: 'ATT', t: '12%', left: '50%' },
      { id: 'LW', l: 'AS', t: '28%', left: '18%' },
      { id: 'CAM', l: 'TRQ', t: '30%', left: '50%' },
      { id: 'RW', l: 'AD', t: '28%', left: '82%' },
      { id: 'CDM1', l: 'MED', t: '50%', left: '34%' },
      { id: 'CDM2', l: 'MED', t: '50%', left: '66%' },
      { id: 'LB', l: 'TS', t: '70%', left: '16%' },
      { id: 'CB1', l: 'DC', t: '74%', left: '38%' },
      { id: 'CB2', l: 'DC', t: '74%', left: '62%' },
      { id: 'RB', l: 'TD', t: '70%', left: '84%' },
      { id: 'GK', l: 'POR', t: '90%', left: '50%' }
    ],
    '4-4-2': [
      { id: 'ST1', l: 'ATT', t: '14%', left: '38%' },
      { id: 'ST2', l: 'ATT', t: '14%', left: '62%' },
      { id: 'LM', l: 'ES', t: '38%', left: '16%' },
      { id: 'CM1', l: 'CC', t: '42%', left: '38%' },
      { id: 'CM2', l: 'CC', t: '42%', left: '62%' },
      { id: 'RM', l: 'ED', t: '38%', left: '84%' },
      { id: 'LB', l: 'TS', t: '68%', left: '16%' },
      { id: 'CB1', l: 'DC', t: '72%', left: '38%' },
      { id: 'CB2', l: 'DC', t: '72%', left: '62%' },
      { id: 'RB', l: 'TD', t: '68%', left: '84%' },
      { id: 'GK', l: 'POR', t: '90%', left: '50%' }
    ],
    '3-5-2': [
      { id: 'ST1', l: 'ATT', t: '13%', left: '38%' },
      { id: 'ST2', l: 'ATT', t: '13%', left: '62%' },
      { id: 'LM', l: 'ES', t: '36%', left: '14%' },
      { id: 'CM1', l: 'CC', t: '40%', left: '34%' },
      { id: 'CM2', l: 'MED', t: '44%', left: '50%' },
      { id: 'CM3', l: 'CC', t: '40%', left: '66%' },
      { id: 'RM', l: 'ED', t: '36%', left: '86%' },
      { id: 'CB1', l: 'DC', t: '70%', left: '28%' },
      { id: 'CB2', l: 'DC', t: '74%', left: '50%' },
      { id: 'CB3', l: 'DC', t: '70%', left: '72%' },
      { id: 'GK', l: 'POR', t: '90%', left: '50%' }
    ]
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hash(s) {
    var h = 0, t = String(s || '');
    for (var i = 0; i < t.length; i++) h = ((h << 5) - h) + t.charCodeAt(i) | 0;
    return Math.abs(h);
  }
  function user() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey() {
    var u = user();
    return String(u.email || u.id || '').trim().toLowerCase();
  }
  function meName() {
    var u = user();
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Tu';
  }
  function isLogged() {
    try { return localStorage.getItem('elisee_user_auth') === 'true' && !!meKey(); } catch (_) { return false; }
  }
  function isPlayer() {
    var u = user();
    return window.isPlayerSiteRole ? window.isPlayerSiteRole(u) : /giocatore|calciatore|portiere/i.test(String(u.ruolo || ''));
  }
  function loadXi(teamId) {
    try {
      var all = JSON.parse(localStorage.getItem('elisee_team_xi') || '{}') || {};
      return all[teamId] || { module: '4-3-3', slots: {} };
    } catch (_) { return { module: '4-3-3', slots: {} }; }
  }
  function saveXi(teamId, data) {
    try {
      var all = JSON.parse(localStorage.getItem('elisee_team_xi') || '{}') || {};
      all[teamId] = data;
      localStorage.setItem('elisee_team_xi', JSON.stringify(all));
    } catch (_) {}
  }
  function leagueOvr(league) {
    var s = String(league || '').toUpperCase();
    if (s.indexOf('SERIE A') === 0 && s.indexOf('FEMMINILE') < 0) return [78, 93];
    if (s.indexOf('SERIE B') === 0) return [72, 85];
    if (s.indexOf('SERIE C') === 0) return [66, 79];
    if (s.indexOf('SERIE D') === 0) return [60, 74];
    if (s.indexOf('ECCELLENZA') >= 0) return [55, 70];
    return [50, 66];
  }
  function genPlayer(team, slot, i) {
    var h = hash((team.id || team.name) + slot.id + i);
    var ovrR = leagueOvr(team.league);
    var ovr = ovrR[0] + (h % (ovrR[1] - ovrR[0] + 1));
    var fn = FIRST[h % FIRST.length];
    var ln = LAST[(h >> 3) % LAST.length];
    return {
      id: 'gen-' + team.id + '-' + slot.id,
      name: fn + ' ' + ln,
      short: ln,
      ovr: ovr,
      pos: slot.l,
      num: 1 + (h % 28),
      generated: true
    };
  }
  function initials(name) {
    var p = String(name || 'P').trim().split(/\s+/);
    return ((p[0] || 'P').charAt(0) + (p[1] || p[0] || 'L').charAt(0)).toUpperCase();
  }

  window.EliseeFormazione = {
    team: null,
    selected: null,
    module: '4-3-3',
    open: function (team) {
      this.team = team || (window.EliseeSquadreSelect && window.EliseeSquadreSelect.getSelected && window.EliseeSquadreSelect.getSelected());
      if (!this.team) return;
      var saved = loadXi(this.team.id);
      this.module = saved.module || '4-3-3';
      this.selected = null;
      if (typeof window.switchView === 'function') window.switchView('formazione', '#formazione-portal');
      var self = this;
      setTimeout(function () { self.render(); }, 40);
    },
    setModule: function (m) {
      if (!MODULES[m] || !this.team) return;
      this.module = m;
      var data = loadXi(this.team.id);
      data.module = m;
      saveXi(this.team.id, data);
      this.render();
    },
    pick: function (slotId) {
      this.selected = slotId;
      this.render();
    },
    claim: function () {
      if (!this.team || !this.selected) return;
      if (!isLogged()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        return;
      }
      if (!isPlayer()) {
        if (typeof window.showToast === 'function') window.showToast('Solo i Giocatori possono entrare in formazione.', 'error');
        return;
      }
      var data = loadXi(this.team.id);
      data.slots = data.slots || {};
      var u = user();
      var ovrR = leagueOvr(this.team.league);
      data.slots[this.selected] = {
        userKey: meKey(),
        name: meName(),
        short: (u.cognome || meName().split(' ').pop() || 'Tu'),
        ovr: ovrR[0] + 8,
        photo: (window.getStoredProfilePhoto && window.getStoredProfilePhoto(null, u)) || u.fotoUrl || '',
        mine: true
      };
      data.module = this.module;
      saveXi(this.team.id, data);
      if (typeof window.showToast === 'function') window.showToast('Sei in campo con ' + this.team.name + '.', 'success');
      this.render();
    },
    render: function () {
      var team = this.team;
      if (!team) return;
      var nameEl = document.getElementById('es-xi-name');
      var leagueEl = document.getElementById('es-xi-league');
      var logoEl = document.getElementById('es-xi-logo');
      if (nameEl) nameEl.textContent = team.name || '';
      if (leagueEl) leagueEl.textContent = team.league || '';
      if (logoEl) {
        if (team.logo) { logoEl.src = team.logo; logoEl.hidden = false; }
        else logoEl.hidden = true;
      }
      document.querySelectorAll('.es-xi-mod').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-mod') === window.EliseeFormazione.module);
      });
      var slots = MODULES[this.module] || MODULES['4-3-3'];
      var data = loadXi(team.id);
      var pitch = document.getElementById('es-xi-slots');
      var me = meKey();
      if (pitch) {
        pitch.innerHTML = slots.map(function (s, i) {
          var claimed = (data.slots || {})[s.id];
          var p = claimed ? {
            name: claimed.name,
            short: claimed.short || claimed.name,
            ovr: claimed.ovr || 70,
            photo: claimed.photo || '',
            mine: claimed.userKey === me
          } : genPlayer(team, s, i);
          var on = window.EliseeFormazione.selected === s.id;
          var empty = !claimed && false;
          return '<button type="button" class="es-xi-slot' + (on ? ' is-on' : '') + (p.mine ? ' is-mine' : '') + (empty ? ' es-xi-empty' : '') + '" data-slot="' + s.id + '" style="top:' + s.t + ';left:' + s.left + '">' +
            '<div class="es-xi-card">' +
              '<div class="es-xi-ovr">' + p.ovr + '</div>' +
              '<div class="es-xi-pos">' + s.l + '</div>' +
              '<div class="es-xi-ava">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : esc(initials(p.name))) + '</div>' +
              '<div class="es-xi-nm">' + esc(p.short || p.name) + '</div>' +
            '</div></button>';
        }).join('');
      }
      var panel = document.getElementById('es-xi-info');
      var slot = slots.filter(function (s) { return s.id === window.EliseeFormazione.selected; })[0] || slots[1];
      var claimed = (data.slots || {})[slot.id];
      var p = claimed || genPlayer(team, slot, slots.indexOf(slot));
      if (panel) {
        var mine = claimed && claimed.userKey === me;
        panel.innerHTML = '<h2>' + esc(p.name) + ' · ' + slot.l + '</h2>' +
          '<p>OVR ' + (p.ovr || claimed && claimed.ovr || '—') + ' · ' + esc(team.name) + ' · modulo ' + esc(this.module) + '</p>' +
          '<div class="es-xi-actions">' +
            (mine
              ? '<button type="button" class="es-xi-fol" disabled>Sei tu in campo</button>'
              : '<button type="button" class="es-xi-go" id="es-xi-claim">Candidati in questo ruolo</button>') +
            '<button type="button" class="es-xi-msg" id="es-xi-msg">Messaggia</button>' +
            '<button type="button" class="es-xi-fol" id="es-xi-fol">Segui</button>' +
          '</div>';
      }
    },
    bind: function () {
      var root = document.getElementById('formazione-portal');
      if (!root || root.dataset.bound === '1') return;
      root.dataset.bound = '1';
      var self = this;
      root.addEventListener('click', function (e) {
        var mod = e.target.closest('.es-xi-mod');
        if (mod) { self.setModule(mod.getAttribute('data-mod')); return; }
        var slot = e.target.closest('[data-slot]');
        if (slot) { self.pick(slot.getAttribute('data-slot')); return; }
        if (e.target.closest('#es-xi-claim')) { self.claim(); return; }
        if (e.target.closest('#es-xi-msg') && window.openB2BMessage && self.team) {
          window.openB2BMessage('club-' + self.team.id, self.team.name, 'club');
          return;
        }
        if (e.target.closest('#es-xi-fol') && window.EliseeScopri && self.team) {
          window.EliseeScopri.follow('club-' + self.team.id);
        }
      });
    }
  };

  window.openTeamFormation = function (team) {
    window.EliseeFormazione.open(team);
  };

  function boot() {
    window.EliseeFormazione.bind();
    document.addEventListener('elisee:squadra-selected', function (e) {
      window.EliseeFormazione.open(e && e.detail);
    });
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (d && (d.view === 'formazione' || (d.hash && String(d.hash).indexOf('formazione') >= 0))) {
        window.EliseeFormazione.render();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
