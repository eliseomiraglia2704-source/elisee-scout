/* Pannello TC Manager — iscrizioni, quote, ruoli, calendario, documenti, soci */
(function () {
  var STORE = 'elisee_tc_panel_v1';
  var ROLES = ['Atleta', 'Genitore', 'Allenatore', 'Dirigente', 'Collaboratore'];
  var FEE_TYPES = ['Iscrizione', 'Quota mensile', 'Kit / materiale', 'Rinnovo tesseramento'];
  var EV_TYPES = ['Allenamento', 'Provino', 'Evento scouting', 'Partita', 'Assemblea'];
  var DOCS = [
    { id: 'mod-iscr', name: 'Modulo di iscrizione', body: 'Modulo iscrizione società / squadra.' },
    { id: 'cert-med', name: 'Certificato medico agonistico', body: 'Scadenza certificato medico.' },
    { id: 'delega', name: 'Delega genitore', body: 'Delega per minori.' },
    { id: 'privacy', name: 'Informativa privacy GDPR', body: 'Consenso trattamento dati.' }
  ];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function nowIso() { return new Date().toISOString(); }
  function uid(p) { return (p || 'tc') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function user() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function logged() {
    if (window.isEliseeLoggedIn) return window.isEliseeLoggedIn();
    try { return localStorage.getItem('elisee_user_auth') === 'true'; } catch (_) { return false; }
  }
  function siteRole() {
    var u = user();
    return String((u.siteRoleFamily || u.ruolo || u.role || '')).trim();
  }
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveAll(all) {
    try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (_) {}
  }
  function emptyState(team) {
    return {
      teamId: team.id,
      teamName: team.name || '',
      league: team.league || '',
      enrollments: [],
      members: [],
      fees: [],
      events: [],
      attendance: {},
      docs: [],
      comms: [],
      minutes: [],
      society: { name: team.name || '', cf: '', sede: team.city || '' }
    };
  }
  function stateOf(team) {
    var all = loadAll();
    var id = String(team && team.id || '');
    if (!id) return emptyState({ id: '', name: '' });
    if (!all[id]) {
      all[id] = emptyState(team);
      saveAll(all);
    }
    var st = all[id];
    ['enrollments', 'members', 'fees', 'events', 'docs', 'comms', 'minutes'].forEach(function (k) {
      if (!Array.isArray(st[k])) st[k] = [];
    });
    if (!st.attendance || typeof st.attendance !== 'object') st.attendance = {};
    if (!st.society) st.society = { name: team.name || '', cf: '', sede: team.city || '' };
    return st;
  }
  function put(team, st) {
    var all = loadAll();
    all[String(team.id)] = st;
    saveAll(all);
  }
  function currentTeam() {
    try {
      if (window.EliseeSquadreSelect && window.EliseeSquadreSelect.getSelected) {
        var t = window.EliseeSquadreSelect.getSelected();
        if (t && t.id) return t;
      }
    } catch (_) {}
    try {
      var s = JSON.parse(localStorage.getItem('elisee_selected_squadra') || 'null');
      if (s && s.id) return s;
    } catch (_) {}
    return null;
  }
  function teamById(id) {
    id = String(id || '');
    try {
      var list = (window.EliseeSquadreSelect && window.EliseeSquadreSelect.teams) || [];
      for (var i = 0; i < list.length; i++) if (String(list[i].id) === id) return list[i];
    } catch (_) {}
    var cur = currentTeam();
    if (cur && String(cur.id) === id) return cur;
    return { id: id, name: id, league: '', city: '' };
  }
  function shareUrl(team) {
    var base = (location.origin || '') + (location.pathname || '/');
    return base + '#iscrizione-portal?team=' + encodeURIComponent(team.id);
  }
  function hashTeamId() {
    var h = String(location.hash || '');
    var q = '';
    if (h.indexOf('?') >= 0) q = h.slice(h.indexOf('?') + 1);
    else if (location.search) q = String(location.search).replace(/^\?/, '');
    var p = new URLSearchParams(q);
    return String(p.get('team') || p.get('t') || '').trim();
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('it-IT'); } catch (_) { return String(iso).slice(0, 10); }
  }
  function addDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function canStaff() {
    if (!logged()) return false;
    var r = siteRole().toLowerCase();
    if (r === 'tifoso' || r === 'spettatore') return false;
    return true;
  }
  function myMember(st) {
    var em = String((user().email || '')).toLowerCase();
    if (!em) return null;
    return (st.members || []).filter(function (m) { return String(m.email || '').toLowerCase() === em; })[0] || null;
  }
  function notify(title, body, email) {
    var u = user();
    if (window.EliseeUserNotifs && window.EliseeUserNotifs.push && u && u.email) {
      var same = !email || String(email).toLowerCase() === String(u.email).toLowerCase();
      if (same) window.EliseeUserNotifs.push({ title: title, body: body }, u);
    }
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }

  var UI = {
    team: null,
    tab: 'iscrizioni',
    memberMode: false
  };

  function tabsFor() {
    if (UI.memberMode) {
      var role = (myMember(stateOf(UI.team)) || {}).role || 'Atleta';
      if (role === 'Allenatore') return ['calendario', 'presenze', 'comms', 'atleti'];
      if (role === 'Dirigente') return ['iscrizioni', 'quote', 'comms', 'calendario', 'docs', 'atleti', 'soci'];
      if (role === 'Collaboratore') return ['calendario', 'docs', 'comms'];
      if (role === 'Genitore') return ['atleti', 'quote', 'docs', 'calendario'];
      return ['atleti', 'quote', 'docs', 'calendario'];
    }
    return ['iscrizioni', 'quote', 'comms', 'calendario', 'docs', 'atleti', 'soci'];
  }

  function render() {
    var team = UI.team;
    if (!team) return;
    var st = stateOf(team);
    var nameEl = $('es-tc-team');
    var leagueEl = $('es-tc-league');
    if (nameEl) nameEl.textContent = team.name || 'Squadra';
    if (leagueEl) leagueEl.textContent = (team.league || '') + (team.city ? ' · ' + team.city : '');
    var tabs = tabsFor();
    if (tabs.indexOf(UI.tab) < 0) UI.tab = tabs[0];
    var tabBar = $('es-tc-tabs');
    if (tabBar) {
      var labels = {
        iscrizioni: 'Iscrizioni',
        quote: 'Quote',
        comms: 'Comunicazioni',
        calendario: 'Calendario',
        presenze: 'Presenze',
        docs: 'Documenti',
        atleti: 'Profilo atleta',
        soci: 'Soci / verbali'
      };
      tabBar.innerHTML = tabs.map(function (t) {
        return '<button type="button" class="es-tc-tab' + (UI.tab === t ? ' is-on' : '') + '" data-tc-tab="' + t + '">' + (labels[t] || t) + '</button>';
      }).join('');
    }
    var body = $('es-tc-body');
    if (!body) return;
    var html = '';
    if (UI.tab === 'iscrizioni') html = viewIscrizioni(st, team);
    else if (UI.tab === 'quote') html = viewQuote(st);
    else if (UI.tab === 'comms') html = viewComms(st);
    else if (UI.tab === 'calendario' || UI.tab === 'presenze') html = viewCal(st);
    else if (UI.tab === 'docs') html = viewDocs(st);
    else if (UI.tab === 'atleti') html = viewAtleti(st);
    else html = viewSoci(st, team);
    body.innerHTML = html;
    runReminders(st, team);
  }

  function viewIscrizioni(st, team) {
    var url = shareUrl(team);
    var pending = st.enrollments.filter(function (e) { return e.status === 'pending'; });
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Modulo online condivisibile</h2>';
    html += '<p class="es-tc-muted">Sostituisce i moduli cartacei. Chiunque abbia il link può iscrivere un atleta o un tesserato.</p>';
    html += '<p class="es-tc-share" id="es-tc-share">' + esc(url) + '</p>';
    html += '<div class="es-tc-actions"><button type="button" class="es-tc-go" data-tc="copy-link">Copia link</button>';
    html += '<button type="button" class="es-tc-ghost" data-tc="open-form">Apri modulo</button></div></div>';
    html += '<div class="es-tc-card"><h2>Iscrizioni in arrivo (' + pending.length + ')</h2>';
    if (!st.enrollments.length) html += '<p class="es-tc-muted">Nessuna iscrizione ancora. Condividi il link.</p>';
    else {
      html += '<ul class="es-tc-list">';
      st.enrollments.forEach(function (e) {
        html += '<li class="es-tc-item"><strong>' + esc(e.nome) + ' ' + esc(e.cognome) + '</strong>';
        html += '<p>' + esc(e.role) + ' · ' + esc(e.email) + ' · CF ' + esc(e.cf || '—') + '</p>';
        html += '<p>Stato: ' + esc(e.status) + ' · ' + fmtDate(e.createdAt) + '</p>';
        if (e.status === 'pending') {
          html += '<div class="es-tc-actions"><button type="button" class="es-tc-go" data-tc="acc-enr" data-id="' + esc(e.id) + '">Accetta in anagrafica</button>';
          html += '<button type="button" class="es-tc-ghost" data-tc="dec-enr" data-id="' + esc(e.id) + '">Rifiuta</button></div>';
        }
        html += '</li>';
      });
      html += '</ul>';
    }
    html += '</div></div>';
    html += '<div class="es-tc-card" style="margin-top:1rem"><h2>Anagrafica tesserati (' + st.members.length + ')</h2>';
    if (!st.members.length) html += '<p class="es-tc-muted">Accetta un’iscrizione per popolare l’anagrafica completa.</p>';
    else {
      html += '<table class="es-tc-table"><thead><tr><th>Nome</th><th>Ruolo</th><th>Nascita</th><th>CF</th><th>Contatti</th></tr></thead><tbody>';
      st.members.forEach(function (m) {
        html += '<tr><td>' + esc(m.nome) + ' ' + esc(m.cognome) + '</td><td>' + esc(m.role) + '</td><td>' + esc(m.dob || '—') + '</td><td>' + esc(m.cf || '—') + '</td><td>' + esc(m.email) + '<br>' + esc(m.phone || '') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    return html;
  }

  function viewQuote(st) {
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Registra incasso</h2>';
    html += '<div class="es-tc-field"><span>Tesserato</span><select id="es-tc-fee-member">' + memberOptions(st) + '</select></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Tipo quota</span><select id="es-tc-fee-type">';
    FEE_TYPES.forEach(function (t) { html += '<option>' + t + '</option>'; });
    html += '</select></div><div class="es-tc-field"><span>Importo €</span><input id="es-tc-fee-amt" type="number" min="0" step="1" value="80"></div></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Scadenza</span><input id="es-tc-fee-due" type="date" value="' + addDays(15) + '"></div>';
    html += '<div class="es-tc-field"><span>Metodo</span><select id="es-tc-fee-method"><option>Carta (pannello)</option><option>Bonifico</option><option>Contanti</option></select></div></div>';
    html += '<div class="es-tc-actions"><button type="button" class="es-tc-go" data-tc="add-fee">Crea quota</button>';
    html += '<button type="button" class="es-tc-ghost" data-tc="pay-fee-new">Crea e incassa ora</button>';
    html += '<button type="button" class="es-tc-ghost" data-tc="remind-fees">Promemoria insoluti</button></div></div>';
    html += '<div class="es-tc-card"><h2>Storico quote</h2>' + feeTable(st) + '</div></div>';
    return html;
  }

  function feeStatus(f) {
    if (f.paidAt) return '<span class="es-tc-ok">Pagata</span>';
    var due = Date.parse(f.due + 'T00:00:00');
    if (due && due < Date.now()) return '<span class="es-tc-bad">Insoluta</span>';
    return '<span class="es-tc-warn">In scadenza</span>';
  }

  function feeTable(st) {
    if (!st.fees.length) return '<p class="es-tc-muted">Nessuna quota registrata.</p>';
    var map = {};
    st.members.forEach(function (m) { map[m.id] = m; });
    var html = '<table class="es-tc-table"><thead><tr><th>Tesserato</th><th>Tipo</th><th>€</th><th>Scadenza</th><th>Stato</th><th></th></tr></thead><tbody>';
    st.fees.slice().reverse().forEach(function (f) {
      var m = map[f.memberId] || {};
      html += '<tr><td>' + esc((m.nome || '') + ' ' + (m.cognome || '')) + '</td><td>' + esc(f.type) + '</td><td>' + esc(f.amount) + '</td><td>' + esc(f.due) + '</td><td>' + feeStatus(f) + '</td><td>';
      if (!f.paidAt) html += '<button type="button" class="es-tc-ghost" data-tc="pay-fee" data-id="' + esc(f.id) + '">Incassa</button>';
      html += '</td></tr>';
    });
    return html + '</tbody></table>';
  }

  function memberOptions(st) {
    if (!st.members.length) return '<option value="">Nessun tesserato</option>';
    return st.members.map(function (m) {
      return '<option value="' + esc(m.id) + '">' + esc(m.nome) + ' ' + esc(m.cognome) + ' (' + esc(m.role) + ')</option>';
    }).join('');
  }

  function viewComms(st) {
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Invia comunicazione</h2>';
    html += '<p class="es-tc-muted">Email automatiche verso atleti, genitori, allenatori e dirigenti. Ognuno riceve solo se appartiene al ruolo scelto.</p>';
    html += '<div class="es-tc-field"><span>Destinatari</span><select id="es-tc-comm-role"><option value="tutti">Tutti i tesserati</option>';
    ROLES.forEach(function (r) { html += '<option>' + r + '</option>'; });
    html += '</select></div>';
    html += '<div class="es-tc-field"><span>Oggetto</span><input id="es-tc-comm-sub" placeholder="Es. Allenamento spostato"></div>';
    html += '<div class="es-tc-field"><span>Messaggio</span><textarea id="es-tc-comm-body" rows="4" placeholder="Testo email"></textarea></div>';
    html += '<button type="button" class="es-tc-go" data-tc="send-comm">Invia email di ruolo</button></div>';
    html += '<div class="es-tc-card"><h2>Registro invii</h2>';
    if (!st.comms.length) html += '<p class="es-tc-muted">Nessuna comunicazione ancora.</p>';
    else {
      html += '<ul class="es-tc-list">';
      st.comms.slice(0, 20).forEach(function (c) {
        html += '<li class="es-tc-item"><strong>' + esc(c.subject) + '</strong><p>A: ' + esc(c.role) + ' · ' + (c.count || 0) + ' destinatari · ' + fmtDate(c.at) + '</p></li>';
      });
      html += '</ul>';
    }
    html += '</div></div>';
    html += '<div class="es-tc-card" style="margin-top:1rem"><h2>Aree riservate per ruolo</h2>';
    html += '<p class="es-tc-muted">Atleta, genitore, allenatore, dirigente e collaboratore vedono solo le sezioni del pannello pertinenti al loro ruolo, dopo accesso con la stessa email usata in iscrizione.</p></div>';
    return html;
  }

  function viewCal(st) {
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Nuova attività</h2>';
    html += '<div class="es-tc-field"><span>Tipo</span><select id="es-tc-ev-type">';
    EV_TYPES.forEach(function (t) { html += '<option>' + t + '</option>'; });
    html += '</select></div>';
    html += '<div class="es-tc-field"><span>Titolo</span><input id="es-tc-ev-title" placeholder="Es. Allenamento U15"></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Data</span><input id="es-tc-ev-date" type="date" value="' + addDays(0) + '"></div>';
    html += '<div class="es-tc-field"><span>Ora</span><input id="es-tc-ev-time" type="time" value="17:30"></div></div>';
    html += '<div class="es-tc-field"><span>Luogo</span><input id="es-tc-ev-place" placeholder="Campo / impianto"></div>';
    html += '<button type="button" class="es-tc-go" data-tc="add-ev">Salva in calendario</button></div>';
    html += '<div class="es-tc-card"><h2>Calendario e presenze</h2>';
    if (!st.events.length) html += '<p class="es-tc-muted">Nessuna attività. Aggiungi allenamenti, provini o eventi scouting.</p>';
    else {
      st.events.slice().reverse().forEach(function (ev) {
        html += '<div class="es-tc-item"><strong>' + esc(ev.type) + ' · ' + esc(ev.title) + '</strong>';
        html += '<p>' + esc(ev.date) + ' ' + esc(ev.time || '') + ' · ' + esc(ev.place || '') + '</p>';
        html += '<div class="es-tc-att">';
        st.members.forEach(function (m) {
          var v = (st.attendance[ev.id] || {})[m.id] || '';
          html += '<button type="button" class="es-tc-ghost" data-tc="att" data-ev="' + esc(ev.id) + '" data-m="' + esc(m.id) + '">' +
            esc(m.nome) + ' ' + (v ? '(' + v + ')' : '') + '</button>';
        });
        if (!st.members.length) html += '<p class="es-tc-muted">Serve anagrafica per tracciare presenze.</p>';
        html += '</div></div>';
      });
    }
    html += '</div></div>';
    return html;
  }

  function viewDocs(st) {
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Moduli precompilati</h2><ul class="es-tc-list">';
    DOCS.forEach(function (d) {
      html += '<li class="es-tc-item"><strong>' + esc(d.name) + '</strong><p>' + esc(d.body) + '</p>';
      html += '<div class="es-tc-actions"><button type="button" class="es-tc-ghost" data-tc="dl-tpl" data-id="' + d.id + '">Scarica</button></div></li>';
    });
    html += '</ul></div><div class="es-tc-card"><h2>Carica documento tesserato</h2>';
    html += '<div class="es-tc-field"><span>Tesserato</span><select id="es-tc-doc-m">' + memberOptions(st) + '</select></div>';
    html += '<div class="es-tc-field"><span>Tipo</span><select id="es-tc-doc-t">';
    DOCS.forEach(function (d) { html += '<option>' + d.name + '</option>'; });
    html += '<option>Altro</option></select></div>';
    html += '<div class="es-tc-field"><span>Scadenza (certificati / rinnovi)</span><input id="es-tc-doc-exp" type="date"></div>';
    html += '<div class="es-tc-field"><span>File</span><input id="es-tc-doc-file" type="file"></div>';
    html += '<button type="button" class="es-tc-go" data-tc="add-doc">Archivia</button></div></div>';
    html += '<div class="es-tc-card" style="margin-top:1rem"><h2>Scadenzario automatico</h2>' + deadlineList(st) + '</div>';
    html += '<div class="es-tc-card" style="margin-top:1rem"><h2>Archivio caricato</h2>';
    if (!st.docs.length) html += '<p class="es-tc-muted">Nessun documento caricato.</p>';
    else {
      html += '<ul class="es-tc-list">';
      st.docs.slice().reverse().forEach(function (d) {
        html += '<li class="es-tc-item"><strong>' + esc(d.type) + '</strong><p>' + esc(d.memberName) + ' · file ' + esc(d.fileName) + (d.expires ? ' · scade ' + esc(d.expires) : '') + '</p></li>';
      });
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  function deadlineList(st) {
    var rows = [];
    st.docs.forEach(function (d) {
      if (d.expires) rows.push({ who: d.memberName, what: d.type, when: d.expires });
    });
    st.fees.forEach(function (f) {
      if (!f.paidAt) {
        var m = st.members.filter(function (x) { return x.id === f.memberId; })[0] || {};
        rows.push({ who: (m.nome || '') + ' ' + (m.cognome || ''), what: 'Quota ' + f.type, when: f.due });
      }
    });
    rows.sort(function (a, b) { return String(a.when).localeCompare(String(b.when)); });
    if (!rows.length) return '<p class="es-tc-muted">Nessuna scadenza. Le date di certificati medici e rinnovi quote compaiono qui.</p>';
    var html = '<ul class="es-tc-list">';
    rows.forEach(function (r) {
      var past = Date.parse(r.when + 'T00:00:00') < Date.now();
      html += '<li class="es-tc-item"><strong>' + esc(r.who) + '</strong><p class="' + (past ? 'es-tc-bad' : 'es-tc-warn') + '">' + esc(r.what) + ' · ' + esc(r.when) + (past ? ' (scaduto)' : '') + '</p></li>';
    });
    return html + '</ul>';
  }

  function viewAtleti(st) {
    var mine = UI.memberMode ? myMember(st) : null;
    var list = mine ? [mine] : st.members.filter(function (m) { return m.role === 'Atleta' || !m.role; });
    if (mine && mine.role === 'Genitore') list = st.members.filter(function (m) { return m.parentEmail && String(m.parentEmail).toLowerCase() === String(mine.email).toLowerCase() || m.id === mine.id; });
    var html = '<div class="es-tc-card"><h2>Profilo atleta / storico</h2>';
    html += '<p class="es-tc-muted">Si aggancia al dossier scouting Elisee se l’email del tesserato coincide con l’account sul sito.</p>';
    if (!list.length) html += '<p class="es-tc-muted">Nessun atleta in anagrafica.</p>';
    list.forEach(function (m) {
      var att = attendanceRate(st, m.id);
      var paid = st.fees.filter(function (f) { return f.memberId === m.id && f.paidAt; }).length;
      var due = st.fees.filter(function (f) { return f.memberId === m.id && !f.paidAt; }).length;
      html += '<div class="es-tc-item"><strong>' + esc(m.nome) + ' ' + esc(m.cognome) + '</strong>';
      html += '<p>' + esc(m.role) + ' · ' + esc(m.email) + ' · CF ' + esc(m.cf || '—') + '</p>';
      html += '<p>Presenze: ' + att + '% · Quote pagate: ' + paid + ' · aperte: ' + due + '</p>';
      html += '<p>Nato ' + esc(m.dob || '—') + ' a ' + esc(m.pob || '—') + ' · residenza ' + esc(m.address || '—') + '</p>';
      if (m.email) html += '<div class="es-tc-actions"><button type="button" class="es-tc-ghost" data-tc="open-scout" data-email="' + esc(m.email) + '">Apri dossier scouting</button></div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function attendanceRate(st, memberId) {
    var tot = 0, ok = 0;
    st.events.forEach(function (ev) {
      var v = (st.attendance[ev.id] || {})[memberId];
      if (!v) return;
      tot++;
      if (v === 'presente') ok++;
    });
    if (!tot) return 0;
    return Math.round((ok / tot) * 100);
  }

  function viewSoci(st, team) {
    var html = '<div class="es-tc-grid"><div class="es-tc-card"><h2>Registro soci digitale</h2>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Ragione sociale</span><input id="es-tc-soc-name" value="' + esc(st.society.name || team.name || '') + '"></div>';
    html += '<div class="es-tc-field"><span>Codice fiscale / P.IVA</span><input id="es-tc-soc-cf" value="' + esc(st.society.cf || '') + '"></div></div>';
    html += '<div class="es-tc-field"><span>Sede</span><input id="es-tc-soc-sede" value="' + esc(st.society.sede || '') + '"></div>';
    html += '<button type="button" class="es-tc-go" data-tc="save-soc">Salva società</button>';
    html += '<p class="es-tc-muted" style="margin-top:0.8rem">Soci da anagrafica: ' + st.members.length + '</p></div>';
    html += '<div class="es-tc-card"><h2>Verbale assemblea</h2>';
    html += '<div class="es-tc-field"><span>Data assemblea</span><input id="es-tc-min-date" type="date" value="' + addDays(0) + '"></div>';
    html += '<div class="es-tc-field"><span>Ordine del giorno</span><textarea id="es-tc-min-odg" rows="3" placeholder="1. ...\n2. ..."></textarea></div>';
    html += '<div class="es-tc-field"><span>Delibere</span><textarea id="es-tc-min-del" rows="3"></textarea></div>';
    html += '<button type="button" class="es-tc-go" data-tc="gen-min">Genera verbale</button></div></div>';
    if (st.minutes.length) {
      html += '<div class="es-tc-card" style="margin-top:1rem"><h2>Verbali generati</h2><ul class="es-tc-list">';
      st.minutes.slice().reverse().forEach(function (m) {
        html += '<li class="es-tc-item"><strong>Assemblea ' + esc(m.date) + '</strong><p>' + esc((m.odg || '').slice(0, 140)) + '</p>';
        html += '<button type="button" class="es-tc-ghost" data-tc="dl-min" data-id="' + esc(m.id) + '">Scarica</button></li>';
      });
      html += '</ul></div>';
    }
    return html;
  }

  function acceptEnrollment(id) {
    var st = stateOf(UI.team);
    var e = st.enrollments.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    e.status = 'accepted';
    var mem = {
      id: uid('m'),
      nome: e.nome,
      cognome: e.cognome,
      dob: e.dob,
      pob: e.pob,
      cf: e.cf,
      address: e.address,
      email: e.email,
      phone: e.phone,
      role: e.role,
      parentEmail: e.parentEmail || '',
      createdAt: nowIso()
    };
    st.members.unshift(mem);
    st.fees.unshift({
      id: uid('f'),
      memberId: mem.id,
      type: 'Iscrizione',
      amount: e.quota || 80,
      due: addDays(10),
      paidAt: '',
      method: '',
      status: 'pending'
    });
    put(UI.team, st);
    notify('Iscrizione accettata', mem.nome + ' ' + mem.cognome + ' è in anagrafica.', mem.email);
    toast('Tesserato aggiunto in anagrafica.');
    render();
  }

  function runReminders(st, team) {
    var today = addDays(0);
    var due = st.fees.filter(function (f) { return !f.paidAt && f.due && f.due <= addDays(7); });
    if (!due.length) return;
    var key = 'elisee_tc_remind_' + team.id + '_' + today;
    try { if (sessionStorage.getItem(key) === '1') return; sessionStorage.setItem(key, '1'); } catch (_) {}
    notify('Quote in scadenza', due.length + ' quota/e in scadenza o insoluta/e per ' + (team.name || 'la squadra') + '.');
  }

  function downloadText(name, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  function onClick(e) {
    var btn = e.target.closest('[data-tc]');
    if (!btn || !UI.team) return;
    var act = btn.getAttribute('data-tc');
    var st = stateOf(UI.team);
    if (act === 'copy-link') {
      var url = shareUrl(UI.team);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url);
      toast('Link iscrizione copiato.');
      return;
    }
    if (act === 'open-form') {
      if (window.switchView) window.switchView('iscrizione', '#iscrizione-portal?team=' + encodeURIComponent(UI.team.id));
      setTimeout(function () { renderPublicForm(UI.team); bindPublic(); }, 50);
      return;
    }
    if (act === 'acc-enr') { acceptEnrollment(btn.getAttribute('data-id')); return; }
    if (act === 'dec-enr') {
      st.enrollments.forEach(function (x) { if (x.id === btn.getAttribute('data-id')) x.status = 'declined'; });
      put(UI.team, st); render(); return;
    }
    if (act === 'add-fee' || act === 'pay-fee-new') {
      var mid = ($('es-tc-fee-member') || {}).value;
      if (!mid) { toast('Serve almeno un tesserato.', 'error'); return; }
      var fee = {
        id: uid('f'),
        memberId: mid,
        type: ($('es-tc-fee-type') || {}).value,
        amount: Number(($('es-tc-fee-amt') || {}).value || 0),
        due: ($('es-tc-fee-due') || {}).value,
        paidAt: act === 'pay-fee-new' ? nowIso() : '',
        method: ($('es-tc-fee-method') || {}).value,
        status: act === 'pay-fee-new' ? 'paid' : 'pending'
      };
      st.fees.unshift(fee);
      put(UI.team, st);
      toast(act === 'pay-fee-new' ? 'Incasso registrato.' : 'Quota creata.');
      render(); return;
    }
    if (act === 'pay-fee') {
      st.fees.forEach(function (f) {
        if (f.id === btn.getAttribute('data-id')) { f.paidAt = nowIso(); f.status = 'paid'; }
      });
      put(UI.team, st); toast('Incasso registrato.'); render(); return;
    }
    if (act === 'remind-fees') {
      var n = 0;
      st.fees.forEach(function (f) {
        if (f.paidAt) return;
        var m = st.members.filter(function (x) { return x.id === f.memberId; })[0];
        if (!m) return;
        n++;
        st.comms.unshift({ id: uid('c'), role: m.role, subject: 'Promemoria quota ' + f.type, count: 1, at: nowIso(), body: 'Quota di €' + f.amount + ' in scadenza il ' + f.due });
        notify('Promemoria quota', 'Quota ' + f.type + ' di €' + f.amount + ' in scadenza il ' + f.due, m.email);
      });
      put(UI.team, st);
      toast(n ? ('Promemoria inviati: ' + n) : 'Nessuna quota aperta.');
      render(); return;
    }
    if (act === 'send-comm') {
      var role = ($('es-tc-comm-role') || {}).value || 'tutti';
      var sub = String(($('es-tc-comm-sub') || {}).value || '').trim();
      var body = String(($('es-tc-comm-body') || {}).value || '').trim();
      if (!sub || !body) { toast('Oggetto e messaggio obbligatori.', 'error'); return; }
      var dest = st.members.filter(function (m) { return role === 'tutti' || m.role === role; });
      dest.forEach(function (m) { notify(sub, body, m.email); });
      st.comms.unshift({ id: uid('c'), role: role, subject: sub, body: body, count: dest.length, at: nowIso() });
      put(UI.team, st);
      toast('Comunicazione inviata a ' + dest.length + ' destinatari.');
      render(); return;
    }
    if (act === 'add-ev') {
      var title = String(($('es-tc-ev-title') || {}).value || '').trim();
      if (!title) { toast('Inserisci un titolo.', 'error'); return; }
      st.events.unshift({
        id: uid('e'),
        type: ($('es-tc-ev-type') || {}).value,
        title: title,
        date: ($('es-tc-ev-date') || {}).value,
        time: ($('es-tc-ev-time') || {}).value,
        place: ($('es-tc-ev-place') || {}).value
      });
      put(UI.team, st); toast('Attività in calendario.'); render(); return;
    }
    if (act === 'att') {
      var ev = btn.getAttribute('data-ev');
      var mid = btn.getAttribute('data-m');
      if (!st.attendance[ev]) st.attendance[ev] = {};
      var cur = st.attendance[ev][mid] || '';
      st.attendance[ev][mid] = cur === 'presente' ? 'assente' : (cur === 'assente' ? 'giustificato' : 'presente');
      put(UI.team, st); render(); return;
    }
    if (act === 'dl-tpl') {
      var tpl = DOCS.filter(function (d) { return d.id === btn.getAttribute('data-id'); })[0];
      if (!tpl) return;
      downloadText(tpl.id + '.txt', 'ELISEE SCOUT — ' + (UI.team.name || '') + '\n' + tpl.name + '\n\n' + tpl.body + '\n\nSocietà: ' + (st.society.name || UI.team.name) + '\nData: ' + fmtDate(nowIso()));
      return;
    }
    if (act === 'add-doc') {
      var mid2 = ($('es-tc-doc-m') || {}).value;
      var file = $('es-tc-doc-file');
      var m = st.members.filter(function (x) { return x.id === mid2; })[0];
      if (!m) { toast('Scegli un tesserato.', 'error'); return; }
      st.docs.unshift({
        id: uid('d'),
        memberId: m.id,
        memberName: m.nome + ' ' + m.cognome,
        type: ($('es-tc-doc-t') || {}).value,
        expires: ($('es-tc-doc-exp') || {}).value,
        fileName: (file && file.files && file.files[0] && file.files[0].name) || 'documento.pdf',
        at: nowIso()
      });
      put(UI.team, st); toast('Documento in archivio.'); render(); return;
    }
    if (act === 'open-scout') {
      if (window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      toast('Dossier scouting: usa l’area account se l’atleta ha lo stesso indirizzo email.');
      return;
    }
    if (act === 'save-soc') {
      st.society = {
        name: ($('es-tc-soc-name') || {}).value,
        cf: ($('es-tc-soc-cf') || {}).value,
        sede: ($('es-tc-soc-sede') || {}).value
      };
      put(UI.team, st); toast('Società salvata.'); render(); return;
    }
    if (act === 'gen-min') {
      var date = ($('es-tc-min-date') || {}).value;
      var odg = ($('es-tc-min-odg') || {}).value;
      var del = ($('es-tc-min-del') || {}).value;
      var present = st.members.map(function (m) { return m.nome + ' ' + m.cognome + ' (' + m.role + ')'; }).join(', ');
      var text = 'VERBALE ASSEMBLEA SOCI\n' + (st.society.name || UI.team.name) + '\nData: ' + date + '\nSede: ' + (st.society.sede || '') + '\n\nPresenti:\n' + (present || '—') + '\n\nOrdine del giorno:\n' + odg + '\n\nDelibere:\n' + del + '\n\nGenerato da Elisee Scout — Pannello TC Manager\n';
      var row = { id: uid('v'), date: date, odg: odg, del: del, text: text, at: nowIso() };
      st.minutes.unshift(row);
      put(UI.team, st);
      downloadText('verbale-assemblea-' + date + '.txt', text);
      toast('Verbale generato.');
      render(); return;
    }
    if (act === 'dl-min') {
      var min = st.minutes.filter(function (x) { return x.id === btn.getAttribute('data-id'); })[0];
      if (min) downloadText('verbale-assemblea-' + min.date + '.txt', min.text || '');
    }
  }

  function renderPublicForm(team) {
    var box = $('es-iscr-form');
    var title = $('es-iscr-team');
    if (title) title.textContent = team.name || 'Iscrizione';
    var sub = $('es-iscr-sub');
    if (sub) sub.textContent = (team.league || '') + (team.city ? ' · ' + team.city : '');
    if (!box) return;
    var html = '<div class="es-tc-row"><div class="es-tc-field"><span>Nome *</span><input name="nome" required></div><div class="es-tc-field"><span>Cognome *</span><input name="cognome" required></div></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Data di nascita</span><input name="dob" type="date"></div><div class="es-tc-field"><span>Luogo di nascita</span><input name="pob"></div></div>';
    html += '<div class="es-tc-field"><span>Codice fiscale</span><input name="cf" maxlength="16"></div>';
    html += '<div class="es-tc-field"><span>Residenza</span><input name="address" placeholder="Via, CAP, città"></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Email *</span><input name="email" type="email" required></div><div class="es-tc-field"><span>Telefono</span><input name="phone"></div></div>';
    html += '<div class="es-tc-row"><div class="es-tc-field"><span>Ruolo *</span><select name="role">';
    ROLES.forEach(function (r) { html += '<option>' + r + '</option>'; });
    html += '</select></div><div class="es-tc-field"><span>Email genitore (minori)</span><input name="parentEmail" type="email"></div></div>';
    html += '<div class="es-tc-field"><span>Quota prevista €</span><input name="quota" type="number" value="80" min="0"></div>';
    html += '<label class="es-tc-field" style="flex-direction:row;align-items:center;gap:0.5rem"><input type="checkbox" name="gdpr" required> <span>Acconsento al trattamento dei dati (GDPR) *</span></label>';
    html += '<button type="submit" class="es-tc-go">Invia iscrizione</button>';
    box.innerHTML = html;
  }

  function bindPublic() {
    var form = $('es-iscr-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = hashTeamId() || (UI.team && UI.team.id);
      if (!id) { toast('Link iscrizione non valido.', 'error'); return; }
      var team = teamById(id);
      var st = stateOf(team);
      var fd = new FormData(form);
      var row = {
        id: uid('en'),
        status: 'pending',
        createdAt: nowIso(),
        nome: fd.get('nome'),
        cognome: fd.get('cognome'),
        dob: fd.get('dob'),
        pob: fd.get('pob'),
        cf: fd.get('cf'),
        address: fd.get('address'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        role: fd.get('role'),
        parentEmail: fd.get('parentEmail'),
        quota: Number(fd.get('quota') || 80)
      };
      st.enrollments.unshift(row);
      put(team, st);
      toast('Iscrizione inviata. Lo staff la accetta dal pannello TC.');
      form.reset();
    });
  }

  function openPanel(team) {
    if (!logged()) {
      if (window.requireEliseeLogin) window.requireEliseeLogin({ view: 'tc', hash: '#tc-portal' });
      else if (window.openAccessoModal) window.openAccessoModal('email');
      return;
    }
    team = team || currentTeam();
    if (!team || !team.id) {
      toast('Seleziona prima una squadra dalla Bacheca.', 'error');
      if (window.switchView) window.switchView('squadre', '#squadre-portal');
      return;
    }
    UI.team = team;
    var mem = myMember(stateOf(team));
    var r = siteRole().toLowerCase();
    UI.memberMode = !!(mem && (mem.role === 'Atleta' || mem.role === 'Genitore' || mem.role === 'Collaboratore') && r !== 'ente' && r !== 'squadra' && r !== 'staff');
    if (!canStaff() && !UI.memberMode) {
      toast('Il pannello TC è per staff di società o tesserati iscritti.', 'error');
      return;
    }
    UI.tab = tabsFor()[0];
    if (window.switchView) window.switchView('tc', '#tc-portal');
    setTimeout(render, 40);
  }

  function paintPublic() {
    var id = hashTeamId() || (UI.team && UI.team.id) || (currentTeam() && currentTeam().id);
    if (!id) return;
    var team = teamById(id);
    UI.team = team;
    renderPublicForm(team);
    bindPublic();
  }

  function bindPanel() {
    var root = $('tc-portal');
    if (root && root.dataset.bound !== '1') {
      root.dataset.bound = '1';
      root.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-tc-tab]');
        if (tab) { UI.tab = tab.getAttribute('data-tc-tab'); render(); return; }
        onClick(e);
      });
    }
    bindPublic();
  }

  window.EliseeTC = {
    open: openPanel,
    render: render,
    paintPublic: paintPublic,
    canStaff: canStaff
  };

  function boot() {
    bindPanel();
    var btn = $('es-sq-tc-btn');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () { openPanel(currentTeam()); });
    }
    document.addEventListener('elisee:view-changed', function (e) {
      var d = e && e.detail;
      if (!d) return;
      if (d.view === 'tc' || (d.hash && String(d.hash).indexOf('tc-portal') >= 0)) {
        if (!UI.team) UI.team = currentTeam();
        if (UI.team) render();
      }
      if (d.view === 'iscrizione' || (d.hash && String(d.hash).indexOf('iscrizione') >= 0)) paintPublic();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
