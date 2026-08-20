/**
 * ELISEE SCOUT — Manager Elisee Scout (proposte modifica squadre).
 */
(function () {
  'use strict';

  var API = '/api/manager';
  var meCache = null;
  var adminCache = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function token() {
    try { return localStorage.getItem('elisee_auth_token') || ''; } catch (e) { return ''; }
  }
  function user() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || 'null'); }
    catch (e) { return null; }
  }
  function isAdmin() {
    try { return localStorage.getItem('elisee_admin_auth') === 'true'; } catch (e) { return false; }
  }
  function localLineups() {
    try { return JSON.parse(localStorage.getItem('elisee_lineup_proposals') || '[]') || []; } catch (e) { return []; }
  }
  function saveLocalLineups(rows) {
    try { localStorage.setItem('elisee_lineup_proposals', JSON.stringify(rows || [])); } catch (e) {}
  }
  function mergeLocalLineups(apiRows) {
    var out = (apiRows || []).slice();
    var seen = {};
    out.forEach(function (r) {
      if (!r) return;
      if (r.id) seen[r.id] = 1;
      if (r.teamId) {
        seen['t:' + r.teamId + ':' + String(r.email || '').toLowerCase() + ':' + (r.status || '')] = 1;
      }
    });
    localLineups().forEach(function (r) {
      if (!r) return;
      if (r.id && seen[r.id]) return;
      var k = 't:' + r.teamId + ':' + String(r.email || '').toLowerCase() + ':' + (r.status || '');
      if (seen[k]) return;
      out.push(r);
    });
    return out;
  }
  function applyOfficialLocal(row) {
    if (!row || !row.teamId) return;
    var official = {
      teamId: row.teamId,
      teamName: row.teamName,
      module: row.module,
      slots: row.slots || {},
      updatedAt: new Date().toISOString()
    };
    try {
      var off = JSON.parse(localStorage.getItem('elisee_official_xi') || '{}') || {};
      off[row.teamId] = official;
      localStorage.setItem('elisee_official_xi', JSON.stringify(off));
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('elisee:lineup-official', { detail: official })); } catch (e) {}
  }
  function headers(admin) {
    var h = { 'Content-Type': 'application/json' };
    var tok = token();
    if (tok) h.Authorization = 'Bearer ' + tok;
    if (admin) h['X-Elisee-Admin'] = 'admin123';
    return h;
  }
  function currentTeam() {
    try {
      var api = window.EliseeSquadreSelect;
      if (api && typeof api.getSelected === 'function') {
        var t = api.getSelected();
        if (t) return t;
      }
    } catch (e) {}
    var name = ($('es-sq-team-name') || {}).textContent || '';
    var league = ($('es-sq-league') || {}).textContent || '';
    var city = ($('es-sq-city') || {}).textContent || '';
    var stadium = ($('es-sq-stadium') || {}).textContent || '';
    return name ? { name: name, league: league, city: city, stadium: stadium } : null;
  }

  function apiGet(view, email) {
    var q = '?view=' + encodeURIComponent(view || 'me');
    if (email) q += '&email=' + encodeURIComponent(email);
    return fetch(API + q, { headers: headers(view === 'admin'), credentials: 'same-origin' })
      .then(function (r) { return r.json(); });
  }
  function apiPost(body, admin) {
    return fetch(API, {
      method: 'POST',
      headers: headers(!!admin),
      credentials: 'same-origin',
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
  }

  function ident() {
    var u = user() || {};
    var name = [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.email || '';
    return { name: name, email: u.email || '', userId: u.id || '' };
  }

  function statusLabel(s) {
    if (s === 'accepted') return 'Accettata';
    if (s === 'declined') return 'Declinata';
    return 'In attesa';
  }

  function openOverlay() {
    var el = $('es-mgr-overlay');
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderOverlay();
  }
  function closeOverlay() {
    var el = $('es-mgr-overlay');
    if (el) el.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function loadMe(then) {
    var id = ident();
    apiGet('me', id.email).then(function (data) {
      if (data && data.ok) meCache = data;
      else meCache = { applications: [], proposals: [], lineups: [], teams: [] };
      meCache.lineups = mergeLocalLineups(meCache.lineups || []).filter(function (r) {
        return !id.email || String(r.email || '').toLowerCase() === String(id.email).toLowerCase();
      });
      if (then) then(meCache);
    }).catch(function () {
      meCache = {
        applications: [],
        proposals: [],
        lineups: mergeLocalLineups([]).filter(function (r) {
          return !id.email || String(r.email || '').toLowerCase() === String(id.email).toLowerCase();
        }),
        teams: []
      };
      if (then) then(meCache);
    });
  }

  function isMgrOf(teamId) {
    if (!meCache || !meCache.teams) return false;
    return meCache.teams.some(function (t) { return t.teamId === teamId; });
  }
  function pendingApp(teamId) {
    if (!meCache || !meCache.applications) return null;
    return meCache.applications.filter(function (a) {
      return a.teamId === teamId && a.status === 'pending';
    })[0] || null;
  }

  function renderOverlay() {
    var root = $('es-mgr-body');
    if (!root) return;
    var team = currentTeam() || {};
    var teamId = team.id || team.teamId || '';
    var teamName = team.name || '';
    var id = ident();
    loadMe(function (me) {
      var mgr = teamId && isMgrOf(teamId);
      var pend = teamId && pendingApp(teamId);
      var html = '';
      if (!teamId && !teamName) {
        html = '<p class="es-mgr-lead">Apri prima una squadra dalla Bacheca, poi candidati come Manager.</p>';
        root.innerHTML = html;
        return;
      }
      html += '<p class="es-mgr-kicker">Squadra</p><h2>' + esc(teamName) + '</h2>';
      html += '<p class="es-mgr-lead">' + esc(team.league || '') + (team.city ? ' · ' + esc(team.city) : '') + '</p>';

      if (mgr) {
        html += '<p class="es-mgr-msg is-ok">Sei Manager Elisee Scout di questa squadra. Puoi proporre una modifica: noi la accettiamo o la decliniamo.</p>';
        html += '<div class="es-mgr-actions" style="margin-bottom:1rem;"><button type="button" class="btn btn-outline-pill pf-btn-solid" id="es-mgr-open-tc">Apri pannello TC Manager</button></div>';
        html += proposeFormHtml(team);
      } else if (pend) {
        html += '<p class="es-mgr-msg">Candidatura già inviata il ' + esc((pend.createdAt || '').slice(0, 10)) + '. In attesa di accettazione.</p>';
      } else {
        html += applyFormHtml(team, id);
      }

      html += myListHtml(me);
      root.innerHTML = html;
      bindOverlay(team);
    });
  }

  function applyFormHtml(team, id) {
    return (
      '<form id="es-mgr-apply">' +
      '<div class="es-mgr-row">' +
      '<div class="es-mgr-field"><label>Nome e cognome *</label><input name="name" required value="' + esc(id.name) + '"></div>' +
      '<div class="es-mgr-field"><label>Email *</label><input name="email" type="email" required value="' + esc(id.email) + '"></div>' +
      '</div>' +
      '<div class="es-mgr-row">' +
      '<div class="es-mgr-field"><label>Telefono</label><input name="phone"></div>' +
      '<div class="es-mgr-field"><label>Ruolo nel club *</label>' +
      '<select name="roleAtClub" required>' +
      '<option value="">Seleziona</option>' +
      '<option>Presidente</option><option>Direttore sportivo</option>' +
      '<option>Dirigente</option><option>Segretario</option>' +
      '<option>Allenatore</option><option>Collaboratore</option>' +
      '<option>Altro</option>' +
      '</select></div></div>' +
      '<div class="es-mgr-field"><label>Perché vuoi gestire questa squadra? *</label>' +
      '<textarea name="motivation" required placeholder="Es. sono il dirigente della società e voglio tenere aggiornati stemma, stadio e dati ufficiali."></textarea></div>' +
      '<div class="es-mgr-actions">' +
      '<button type="submit" class="btn btn-outline-pill pf-btn-solid">Invia candidatura</button>' +
      '<button type="button" class="btn btn-outline-pill" data-mgr-close>Chiudi</button>' +
      '</div><p class="es-mgr-msg" id="es-mgr-apply-msg"></p></form>'
    );
  }

  function proposeFormHtml(team) {
    return (
      '<form id="es-mgr-propose">' +
      '<div class="es-mgr-row">' +
      '<div class="es-mgr-field"><label>Città</label><input name="city" placeholder="' + esc(team.city || '') + '"></div>' +
      '<div class="es-mgr-field"><label>Stadio</label><input name="stadium" placeholder="' + esc(team.stadium || '') + '"></div>' +
      '</div>' +
      '<div class="es-mgr-row">' +
      '<div class="es-mgr-field"><label>Capienza</label><input name="capacity" placeholder="' + esc(team.capacity || '') + '"></div>' +
      '<div class="es-mgr-field"><label>Anno fondazione</label><input name="year" placeholder="' + esc(team.year || '') + '"></div>' +
      '</div>' +
      '<div class="es-mgr-field"><label>Logo (URL)</label><input name="logo" placeholder="https://… oppure percorso locale"></div>' +
      '<div class="es-mgr-field"><label>Nome squadra</label><input name="name" placeholder="' + esc(team.name || '') + '"></div>' +
      '<div class="es-mgr-field"><label>Nota per lo staff Elisee</label><textarea name="note" placeholder="Spiega la modifica (fonte, data, perché)."></textarea></div>' +
      '<div class="es-mgr-actions">' +
      '<button type="submit" class="btn btn-outline-pill pf-btn-solid">Invia proposta</button>' +
      '<button type="button" class="btn btn-outline-pill" data-mgr-close>Chiudi</button>' +
      '</div><p class="es-mgr-msg" id="es-mgr-prop-msg"></p></form>'
    );
  }

  function myListHtml(me) {
    var apps = (me && me.applications) || [];
    var props = (me && me.proposals) || [];
    var lineups = (me && me.lineups) || [];
    if (!apps.length && !props.length && !lineups.length) return '';
    var html = '<hr style="border:0;border-top:1px solid rgba(148,163,184,0.18);margin:1.1rem 0;">';
    html += '<p class="es-mgr-kicker">Le tue richieste</p>';
    apps.forEach(function (a) {
      html += '<div class="es-mgr-card"><h4>' + esc(a.teamName) +
        ' <span class="es-mgr-status is-' + esc(a.status) + '">' + statusLabel(a.status) + '</span></h4>' +
        '<p>Candidatura manager · ' + esc(a.roleAtClub || '') + '</p></div>';
    });
    props.forEach(function (p) {
      html += '<div class="es-mgr-card"><h4>' + esc(p.teamName) +
        ' <span class="es-mgr-status is-' + esc(p.status) + '">' + statusLabel(p.status) + '</span></h4>' +
        '<p>' + esc(Object.keys(p.changes || {}).join(', ') || 'Modifica') + '</p></div>';
    });
    lineups.forEach(function (l) {
      html += '<div class="es-mgr-card"><h4>' + esc(l.teamName) +
        ' <span class="es-mgr-status is-' + esc(l.status) + '">' + statusLabel(l.status) + '</span></h4>' +
        '<p>Formazione · ' + esc(l.previousModule || '—') + ' → ' + esc(l.module || '') + '</p></div>';
    });
    return html;
  }

  function formData(form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      o[el.name] = el.value;
    });
    return o;
  }

  function bindOverlay(team) {
    var tcBtn = $('es-mgr-open-tc');
    if (tcBtn) {
      tcBtn.onclick = function () {
        closeOverlay();
        if (window.EliseeTC && window.EliseeTC.open) window.EliseeTC.open(team);
      };
    }
    var apply = $('es-mgr-apply');
    var propose = $('es-mgr-propose');
    if (apply) {
      apply.onsubmit = function (e) {
        e.preventDefault();
        var d = formData(apply);
        var msg = $('es-mgr-apply-msg');
        apiPost({
          action: 'apply',
          teamId: team.id,
          teamName: team.name,
          league: team.league || '',
          name: d.name,
          email: d.email,
          phone: d.phone,
          roleAtClub: d.roleAtClub,
          motivation: d.motivation
        }).then(function (res) {
          if (!res || !res.ok) {
            msg.className = 'es-mgr-msg is-bad';
            msg.textContent = errText(res);
            return;
          }
          msg.className = 'es-mgr-msg is-ok';
          msg.textContent = 'Candidatura inviata. La revisioniamo e ti aggiorniamo.';
          loadMe(function () { renderOverlay(); syncBadge(); });
        }).catch(function () {
          msg.className = 'es-mgr-msg is-bad';
          msg.textContent = 'Server non raggiungibile. Avvia il sito locale (8080) e riprova.';
        });
      };
    }
    if (propose) {
      propose.onsubmit = function (e) {
        e.preventDefault();
        var d = formData(propose);
        var idn = ident();
        var changes = {};
        ['city', 'stadium', 'capacity', 'year', 'logo', 'name'].forEach(function (k) {
          if (d[k] && String(d[k]).trim()) changes[k] = d[k].trim();
        });
        var msg = $('es-mgr-prop-msg');
        apiPost({
          action: 'propose',
          teamId: team.id,
          teamName: team.name,
          league: team.league || '',
          name: idn.name,
          email: idn.email,
          changes: changes,
          note: d.note || ''
        }).then(function (res) {
          if (!res || !res.ok) {
            msg.className = 'es-mgr-msg is-bad';
            msg.textContent = errText(res);
            return;
          }
          msg.className = 'es-mgr-msg is-ok';
          msg.textContent = 'Proposta inviata. La accettiamo o la decliniamo dall\'area admin.';
          loadMe(function () { renderOverlay(); });
        }).catch(function () {
          msg.className = 'es-mgr-msg is-bad';
          msg.textContent = 'Server non raggiungibile. Avvia il sito locale (8080) e riprova.';
        });
      };
    }
  }

  function errText(res) {
    var map = {
      squadra_mancante: 'Seleziona una squadra.',
      nome_email_obbligatori: 'Nome e email sono obbligatori.',
      motivazione_troppo_corta: 'Scrivi una motivazione più chiara (almeno una frase).',
      gia_manager: 'Sei già manager di questa squadra.',
      candidatura_gia_inviata: 'Hai già una candidatura in attesa.',
      non_sei_manager: 'Solo i Manager accettati possono proporre modifiche.',
      nessuna_modifica: 'Inserisci almeno un campo da cambiare.',
      admin_richiesto: 'Serve l\'accesso admin.',
      squadra_o_modulo_mancante: 'Scegli squadra e modulo.',
      proposta_formazione_gia_inviata: 'Hai già un suggerimento di formazione in attesa per questa squadra.'
    };
    return (res && map[res.error]) || (res && res.error) || 'Invio non riuscito.';
  }

  function syncBadge() {
    var title = $('es-sq-team-name');
    var team = currentTeam() || {};
    var old = document.querySelector('.es-mgr-badge');
    if (old) old.remove();
    if (!title || !team.id || !isMgrOf(team.id)) return;
    var b = document.createElement('span');
    b.className = 'es-mgr-badge';
    b.textContent = 'Manager Elisee';
    title.appendChild(b);
  }

  function renderAdmin() {
    var host = $('es-mgr-admin-panel');
    if (!host || !isAdmin()) return;
    apiGet('admin').then(function (data) {
      if (!data || !data.ok) {
        host.innerHTML = '<p class="es-mgr-empty">Inbox Manager non disponibile. Avvia il server locale.</p>';
        return;
      }
      adminCache = data;
      var c = data.counts || {};
      var mergedL = mergeLocalLineups(data.lineups || []);
      var pendingL = mergedL.filter(function (r) { return r.status === 'pending'; }).length;
      var html = '<div class="es-mgr-admin-grid">';
      html += '<div><p class="es-mgr-kicker">Candidature (' + (c.applicationsPending || 0) + ' in attesa)</p>';
      html += listAdmin(data.applications || [], 'application');
      html += '</div><div><p class="es-mgr-kicker">Proposte modifica (' + (c.proposalsPending || 0) + ' in attesa)</p>';
      html += listAdmin(data.proposals || [], 'proposal');
      html += '</div><div><p class="es-mgr-kicker">Formazioni / moduli (' + pendingL + ' in attesa)</p>';
      html += listAdmin(mergedL, 'lineup');
      html += '</div></div>';
      host.innerHTML = html;
      var n = $('stat-mgr-pending');
      if (n) n.textContent = String((c.applicationsPending || 0) + (c.proposalsPending || 0) + pendingL);
    }).catch(function () {
      var loc = mergeLocalLineups([]);
      var pendingL = loc.filter(function (r) { return r.status === 'pending'; }).length;
      host.innerHTML = '<p class="es-mgr-empty">Inbox API non raggiungibile. Mostriamo le proposte formazione locali.</p>' +
        '<p class="es-mgr-kicker">Formazioni / moduli (' + pendingL + ' in attesa)</p>' +
        listAdmin(loc, 'lineup');
    });
  }

  function listAdmin(rows, kind) {
    if (!rows.length) return '<p class="es-mgr-empty">Nessuna voce.</p>';
    return rows.map(function (r) {
      var extra = '';
      if (kind === 'proposal') {
        extra = '<p>' + esc(JSON.stringify(r.changes || {})) + '</p>';
        if (r.note) extra += '<p>Nota: ' + esc(r.note) + '</p>';
      } else if (kind === 'lineup') {
        extra = '<p>Modulo: <strong>' + esc(r.previousModule || '—') + '</strong> → <strong>' + esc(r.module || '') + '</strong></p>';
        extra += '<p>' + esc(r.name || '') + ' · ' + esc(r.email || '') + '</p>';
        if (r.note) extra += '<p>Nota: ' + esc(r.note) + '</p>';
        extra += '<p>' + esc((r.createdAt || '').slice(0, 16).replace('T', ' ')) + '</p>';
      } else {
        extra = '<p>' + esc(r.roleAtClub || '') + ' · ' + esc(r.email || '') + '</p><p>' + esc(r.motivation || '') + '</p>';
      }
      var btns = r.status === 'pending'
        ? '<div class="es-mgr-actions">' +
          '<button type="button" class="btn btn-outline-pill pf-btn-solid" data-mgr-decide="1" data-kind="' + kind + '" data-id="' + esc(r.id) + '">Accetta</button>' +
          '<button type="button" class="btn btn-outline-pill" data-mgr-decide="0" data-kind="' + kind + '" data-id="' + esc(r.id) + '">Declina</button>' +
          '</div>'
        : '';
      return '<div class="es-mgr-card"><h4>' + esc(r.teamName || '') +
        ' <span class="es-mgr-status is-' + esc(r.status) + '">' + statusLabel(r.status) + '</span></h4>' +
        extra + btns + '</div>';
    }).join('');
  }

  function decide(kind, id, accept) {
    var comment = accept ? '' : (window.prompt('Motivo del rifiuto (facoltativo)') || '');
    var cached = null;
    if (kind === 'lineup') {
      cached = mergeLocalLineups((adminCache && adminCache.lineups) || []).filter(function (r) {
        return r && r.id === id;
      })[0] || null;
    }
    function stampLocal(rowHint) {
      if (kind !== 'lineup') return;
      var rows = localLineups().map(function (r) {
        var same = r.id === id || (rowHint && r.teamId === rowHint.teamId &&
          String(r.email || '').toLowerCase() === String(rowHint.email || '').toLowerCase() &&
          r.status === 'pending');
        if (!same) return r;
        r.status = accept ? 'accepted' : 'declined';
        r.adminComment = comment;
        return r;
      });
      saveLocalLineups(rows);
      if (accept && rowHint) applyOfficialLocal(rowHint);
    }
    apiPost({ action: 'decide', kind: kind, id: id, accept: !!accept, comment: comment }, true)
      .then(function (res) {
        stampLocal((res && res.item) || cached);
        if (!res || !res.ok) {
          if (kind === 'lineup') { renderAdmin(); return; }
          window.alert(errText(res));
          return;
        }
        renderAdmin();
      })
      .catch(function () {
        stampLocal(cached);
        if (kind === 'lineup') renderAdmin();
      });
  }

  function ensureOverlay() {
    if ($('es-mgr-overlay')) return;
    var wrap = document.createElement('div');
    wrap.id = 'es-mgr-overlay';
    wrap.className = 'es-mgr-overlay';
    wrap.innerHTML =
      '<div class="es-mgr-sheet" role="dialog" aria-modal="true">' +
      '<button type="button" class="es-mgr-close" data-mgr-close aria-label="Chiudi">&times;</button>' +
      '<p class="es-mgr-kicker">Elisee Scout</p>' +
      '<h2>Manager Elisee Scout</h2>' +
      '<p class="es-mgr-lead">Come i TC Manager di Tuttocampo: proponi correzioni su stemma, stadio e anagrafica. Noi accettiamo o decliniamo.</p>' +
      '<div id="es-mgr-body"></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.getAttribute('data-mgr-close') != null) closeOverlay();
    });
  }

  function ensureSquadreButton() {
    var actions = document.querySelector('.es-sq-actions');
    if (!actions || $('es-sq-mgr-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'es-sq-mgr-btn';
    btn.className = 'btn btn-outline-pill es-sq-mgr-btn';
    btn.textContent = 'Diventa Manager Elisee Scout';
    btn.onclick = function () { openOverlay(); };
    actions.appendChild(btn);
  }

  function ensureAdminUi() {
    var chips = document.querySelector('.pf-gov-bar .pf-chips');
    if (chips && !$('btn-show-manager')) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gov-btn pf-chip-btn';
      b.id = 'btn-show-manager';
      b.textContent = 'Manager Elisee';
      chips.appendChild(b);
      b.addEventListener('click', function () {
        chips.querySelectorAll('.gov-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var panel = $('es-mgr-admin-wrap');
        if (panel) panel.style.display = 'block';
        renderAdmin();
      });
    }
    var dash = $('admin-authenticated-dashboard');
    if (dash && !$('es-mgr-admin-wrap')) {
      var box = document.createElement('div');
      box.id = 'es-mgr-admin-wrap';
      box.style.display = 'none';
      box.innerHTML =
        '<div class="wr-admin-trigger-card" style="margin-top:1.25rem;border-color:rgba(56,189,248,0.35);">' +
        '<p class="es-mgr-kicker">Governance squadre</p>' +
        '<h3 style="margin:0 0 0.4rem;color:#fff;">Inbox Manager Elisee Scout</h3>' +
        '<p style="margin:0 0 0.6rem;color:#cbd5e1;font-size:0.88rem;">Candidature manager, correzioni squadra e suggerimenti di modulo/XI: Accetta per pubblicare, Declina per chiudere.</p>' +
        '<div id="es-mgr-admin-panel"></div></div>';
      var stats = dash.querySelector('[style*="grid-template-columns:repeat(5,1fr)"]');
      if (stats && stats.parentNode) stats.parentNode.insertBefore(box, stats);
      else dash.appendChild(box);
    }
    var statsRow = document.querySelector('#admin-authenticated-dashboard [style*="grid-template-columns:repeat(5,1fr)"]');
    if (statsRow && !$('stat-mgr-pending')) {
      var cell = document.createElement('div');
      cell.style.cssText = 'background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.22);border-radius:12px;padding:1rem;text-align:center;';
      cell.innerHTML = '<div id="stat-mgr-pending" style="font-size:1.9rem;font-weight:900;color:#38bdf8;">0</div>' +
        '<div style="font-size:0.72rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-top:0.25rem;">Manager in attesa</div>';
      statsRow.appendChild(cell);
    }
  }

  document.addEventListener('click', function (e) {
    var d = e.target.closest('[data-mgr-decide]');
    if (!d) return;
    decide(d.getAttribute('data-kind'), d.getAttribute('data-id'), d.getAttribute('data-mgr-decide') === '1');
  });

  function boot() {
    ensureOverlay();
    ensureSquadreButton();
    ensureAdminUi();
    var openBtn = $('es-sq-mgr-btn');
    if (openBtn && !openBtn.dataset.mgrBound) {
      openBtn.dataset.mgrBound = '1';
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openOverlay();
      });
    }
    var adminBtn = $('btn-show-manager');
    if (adminBtn && !adminBtn.dataset.mgrBound) {
      adminBtn.dataset.mgrBound = '1';
      adminBtn.addEventListener('click', function () {
        document.querySelectorAll('.pf-gov-bar .gov-btn').forEach(function (x) { x.classList.remove('active'); });
        adminBtn.classList.add('active');
        var panel = $('es-mgr-admin-wrap');
        if (panel) panel.style.display = 'block';
        renderAdmin();
      });
    }
    ['btn-show-admin', 'btn-show-privacy', 'btn-show-autopilot'].forEach(function (id) {
      var el = $(id);
      if (!el || el.dataset.mgrHideBound) return;
      el.dataset.mgrHideBound = '1';
      el.addEventListener('click', function () {
        var panel = $('es-mgr-admin-wrap');
        if (panel) panel.style.display = 'none';
        if (adminBtn) adminBtn.classList.remove('active');
      });
    });
    loadMe(function () { syncBadge(); if (isAdmin()) renderAdmin(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('hashchange', function () {
    ensureSquadreButton();
    syncBadge();
  });
  setInterval(function () {
    ensureSquadreButton();
    ensureAdminUi();
    syncBadge();
  }, 2500);

  window.EliseeManager = { open: openOverlay, close: closeOverlay, refreshAdmin: renderAdmin };
})();
