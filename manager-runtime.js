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
        html = '<section class="es-manager"><div class="es-manager__container">' +
          '<nav class="es-breadcrumb">' +
            '<a href="#squadre-portal" data-mgr-close>Squadre</a>' +
            '<span>/</span>' +
            '<span class="current">Candidatura Manager</span>' +
            '<button type="button" class="es-mgr-close-btn" data-mgr-close title="Chiudi">✕</button>' +
          '</nav>' +
          '<h1 class="es-manager__title">Candidatura Elisee Manager</h1>' +
          '<p class="es-manager__intro">Apri prima una squadra dalla Bacheca o da Seleziona Squadre, poi candidati come Manager.</p>' +
          '<div class="es-form-actions"><button type="button" class="es-btn-cancel" data-mgr-close>Chiudi</button></div>' +
          '</div></section>';
        root.innerHTML = html;
        return;
      }

      var abbr = (team.abbr || teamName.slice(0, 3) || 'ES').toUpperCase();
      var leagueText = team.league || 'Amatoriale';
      var cityText = team.city || 'Foggia';
      var logoSrc = team.logo || '';
      if (!logoSrc && (teamId === 'foggia-city' || String(teamName).toUpperCase().indexOf('FOGGIA CITY') >= 0)) {
        logoSrc = 'immagini/squadre-loghi/foggia-city.png';
      }

      var crestHtml = '';
      if (logoSrc) {
        crestHtml = '<img src="' + esc(logoSrc) + '" alt="' + esc(teamName) + '" onerror="this.style.display=\'none\';this.parentElement.textContent=\'' + esc(abbr.slice(0, 3)) + '\';" />';
      } else {
        crestHtml = esc(abbr.slice(0, 3));
      }

      html = '<section class="es-manager">' +
        '<div class="es-manager__container">' +

          '<nav class="es-breadcrumb">' +
            '<a href="#squadre-portal" data-mgr-close>Squadre</a>' +
            '<span>/</span>' +
            '<a href="#squadre-portal" data-mgr-close>' + esc(teamName) + '</a>' +
            '<span>/</span>' +
            '<span class="current">Candidatura Manager</span>' +
            '<button type="button" class="es-mgr-close-btn" data-mgr-close title="Chiudi">✕</button>' +
          '</nav>' +

          '<h1 class="es-manager__title">Candidatura Elisee Manager</h1>' +
          '<p class="es-manager__intro">Un ruolo editoriale a tutti gli effetti: chi diventa Elisee Manager racconta la squadra ogni giorno, con la supervisione del nostro team prima di ogni pubblicazione.</p>' +

          '<div class="es-manager__layout">' +

            '<!-- ===== Sidebar ===== -->' +
            '<aside class="es-side">' +

              '<div class="es-team-card">' +
                '<div class="es-team-card__crest">' + crestHtml + '</div>' +
                '<p class="es-team-card__label">Squadra</p>' +
                '<p class="es-team-card__name">' + esc(teamName) + '</p>' +
                '<div class="es-team-card__meta">' +
                  '<div><dt>Categoria</dt><dd>' + esc(leagueText) + '</dd></div>' +
                  '<div><dt>Territorio</dt><dd>' + esc(cityText) + '</dd></div>' +
                '</div>' +
              '</div>' +

              '<div class="es-timeline">' +
                '<p class="es-timeline__label">Percorso in 3 fasi</p>' +
                '<div class="es-tl-item">' +
                  '<h4>Mese di prova</h4>' +
                  '<p>30 giorni di pubblicazioni costanti dedicate alla squadra.</p>' +
                '</div>' +
                '<div class="es-tl-item">' +
                  '<h4>Verifica editoriale</h4>' +
                  '<p>Ogni contenuto viene rivisto dagli Admin prima di andare online.</p>' +
                '</div>' +
                '<div class="es-tl-item">' +
                  '<h4>Circolo Manager</h4>' +
                  '<p>Al termine del periodo, accesso al canale riservato con aggiornamenti diretti dagli Admin.</p>' +
                '</div>' +
              '</div>' +

              '<div class="es-callout">' +
                '<p>"È solo un mese, ma un mese di costanza."</p>' +
                '<span>Non chiediamo perfezione: chiediamo continuità.</span>' +
              '</div>' +

            '</aside>' +

            '<!-- ===== Right column ===== -->' +
            '<div class="es-mgr-main-col">';

      if (mgr) {
        html += '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">★</span><h2>Elisee Manager Ufficiale</h2></div>' +
          '<p class="es-manager__intro" style="margin-bottom:18px;">Sei <strong>Elisee Manager</strong> accreditato per questa società. Puoi gestire la società e proporre modifiche aggiornate.</p>' +
          '<div class="es-form-actions" style="margin-bottom:28px;">' +
            '<button type="button" class="es-btn-submit" id="es-mgr-open-tc">Apri pannello Elisee Manager</button>' +
            '<button type="button" class="es-btn-cancel" data-mgr-close>Chiudi</button>' +
          '</div>' +
          '</div>' +
          proposeFormHtml(team);
      } else if (pend) {
        html += '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">●</span><h2>Stato Candidatura</h2></div>' +
          '<p class="es-manager__intro" style="margin-bottom:20px;">Candidatura Elisee Manager già inviata il <strong>' + esc((pend.createdAt || '').slice(0, 10)) + '</strong>.<br>Attualmente nel mese di prova sotto valutazione del team di redazione ed Admin.</p>' +
          '<div class="es-form-actions">' +
            '<button type="button" class="es-btn-cancel" data-mgr-close>Chiudi</button>' +
          '</div>' +
          '</div>';
      } else {
        html += applyFormHtml(team, id);
      }

      html += myListHtml(me);
      html += '</div>' + // chiude es-mgr-main-col
        '</div>' + // chiude es-manager__layout
        '</div></section>'; // chiude es-manager__container ed es-manager

      root.innerHTML = html;
      bindOverlay(team);
    });
  }

  function applyFormHtml(team, id) {
    var phone = (user() || {}).telefono || (user() || {}).phone || '';
    var city = team.city || 'Foggia';
    return (
      '<form id="es-mgr-apply">' +

        '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">01</span><h2>Dati di contatto</h2></div>' +
          '<div class="es-form-grid">' +
            '<div class="es-field">' +
              '<label>Nome e cognome <span class="req">*</span></label>' +
              '<input name="name" type="text" required value="' + esc(id.name) + '" placeholder="Mario Rossi" />' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Email account <span class="req">*</span></label>' +
              '<input name="email" type="email" required value="' + esc(id.email) + '" placeholder="nome.cognome@email.com" />' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Telefono <span class="req">*</span></label>' +
              '<input name="phone" type="tel" required value="' + esc(phone) + '" placeholder="+39 333 1234567" />' +
              '<p class="es-field__hint">Necessario per l\'accesso al Circolo Manager al superamento del mese di prova.</p>' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Ruolo nel club / società <span class="req">*</span></label>' +
              '<select name="roleAtClub" required>' +
                '<option value="">Seleziona ruolo</option>' +
                '<option value="Dirigente">Dirigente</option>' +
                '<option value="Staff tecnico">Staff tecnico</option>' +
                '<option value="Giocatore">Giocatore</option>' +
                '<option value="Esterno / appassionato">Esterno / appassionato</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">02</span><h2>Territorio</h2></div>' +
          '<div class="es-form-grid">' +
            '<div class="es-field es-field--full">' +
              '<label>Città e territorio di riferimento <span class="req">*</span></label>' +
              '<input name="city" type="text" required value="' + esc(city) + '" placeholder="Foggia" />' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">03</span><h2>Motivazione</h2></div>' +
          '<div class="es-form-grid">' +
            '<div class="es-field es-field--full">' +
              '<label>Piano di pubblicazione per i 30 giorni <span class="req">*</span></label>' +
              '<textarea name="motivation" required placeholder="Racconta perché vuoi rappresentare la squadra e come pensi di organizzare i contenuti: risultati, formazioni, rose, eventi."></textarea>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-section" style="margin-bottom: 0;">' +
          '<div class="es-section__head"><span class="es-section__num">04</span><h2>Conferma</h2></div>' +
          '<label class="es-consent">' +
            '<input type="checkbox" name="trialAccept" id="decl" required />' +
            '<span>Confermo l\'impegno alla pubblicazione quotidiana durante il mese di prova, soggetta a verifica editoriale, e autorizzo l\'inserimento del mio recapito nel Circolo Manager al superamento del periodo di prova.</span>' +
          '</label>' +
          '<div class="es-form-actions">' +
            '<button type="submit" class="es-btn-submit">Invia candidatura</button>' +
            '<button type="button" class="es-btn-cancel" data-mgr-close>Annulla</button>' +
          '</div>' +
          '<p class="es-mgr-msg" id="es-mgr-apply-msg"></p>' +
        '</div>' +

      '</form>'
    );
  }

  function proposeFormHtml(team) {
    return (
      '<form id="es-mgr-propose">' +
        '<div class="es-section">' +
          '<div class="es-section__head"><span class="es-section__num">PROPOSTA</span><h2>Modifica Dati Societari</h2></div>' +
          '<div class="es-form-grid">' +
            '<div class="es-field">' +
              '<label>Città</label>' +
              '<input name="city" placeholder="' + esc(team.city || '') + '" value="' + esc(team.city || '') + '" />' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Stadio</label>' +
              '<input name="stadium" placeholder="' + esc(team.stadium || '') + '" value="' + esc(team.stadium || '') + '" />' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Capienza</label>' +
              '<input name="capacity" placeholder="' + esc(team.capacity || '') + '" value="' + esc(team.capacity || '') + '" />' +
            '</div>' +
            '<div class="es-field">' +
              '<label>Anno fondazione</label>' +
              '<input name="year" placeholder="' + esc(team.year || '') + '" value="' + esc(team.year || '') + '" />' +
            '</div>' +
            '<div class="es-field es-field--full">' +
              '<label>Logo (URL o percorso)</label>' +
              '<input name="logo" placeholder="https://… oppure percorso locale" value="' + esc(team.logo || '') + '" />' +
            '</div>' +
            '<div class="es-field es-field--full">' +
              '<label>Nome squadra</label>' +
              '<input name="name" placeholder="' + esc(team.name || '') + '" value="' + esc(team.name || '') + '" />' +
            '</div>' +
            '<div class="es-field es-field--full">' +
              '<label>Nota per lo staff Elisee</label>' +
              '<textarea name="note" placeholder="Spiega la modifica proposta (fonte ufficiale, data, motivazione)."></textarea>' +
            '</div>' +
          '</div>' +
          '<div class="es-form-actions">' +
            '<button type="submit" class="es-btn-submit">Invia proposta</button>' +
            '<button type="button" class="es-btn-cancel" data-mgr-close>Chiudi</button>' +
          '</div>' +
          '<p class="es-mgr-msg" id="es-mgr-prop-msg"></p>' +
        '</div>' +
      '</form>'
    );
  }

  function myListHtml(me) {
    var apps = (me && me.applications) || [];
    var props = (me && me.proposals) || [];
    var lineups = (me && me.lineups) || [];
    if (!apps.length && !props.length && !lineups.length) return '';
    var html = '<div class="es-section" style="margin-top: 36px;">' +
      '<div class="es-section__head"><span class="es-section__num">ARCHIVIO</span><h2>Le tue richieste</h2></div>';
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
    html += '</div>';
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
        if (!d.phone || !d.phone.trim()) {
          msg.className = 'es-mgr-msg is-bad';
          msg.textContent = 'Il numero di telefono è obbligatorio per l\'accesso al Gruppo WhatsApp VIP Club.';
          return;
        }
        apiPost({
          action: 'apply',
          teamId: team.id,
          teamName: team.name,
          league: team.league || '',
          name: d.name,
          email: d.email,
          phone: d.phone,
          city: d.city,
          roleAtClub: d.roleAtClub,
          motivation: d.motivation,
          trialMonthAccepted: true
        }).then(function (res) {
          if (!res || !res.ok) {
            msg.className = 'es-mgr-msg is-bad';
            msg.textContent = errText(res);
            return;
          }
          msg.className = 'es-mgr-msg is-ok';
          msg.textContent = 'Candidatura Elisee Manager registrata! Iniziato il mese di prova (30 giorni di pubblicazione sotto verifica Admin). A superamento della prova verrai aggiunto al Gruppo WhatsApp VIP Club.';
          if (typeof window.showToast === 'function') {
            window.showToast('Candidatura inviata! Mese di prova avviato con verifica Admin & accesso WhatsApp VIP.', 'success');
          }
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
      '<div id="es-mgr-body"></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-mgr-close]') != null) closeOverlay();
    });
  }

  function ensureSquadreButton() {
    var actions = document.querySelector('.es-sq-actions');
    if (!actions || $('es-sq-mgr-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'es-sq-mgr-btn';
    btn.className = 'btn btn-outline-pill es-sq-mgr-btn';
    btn.textContent = 'Diventa Elisee Manager';
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
      var stats = dash.querySelector('#es-cc-legacy-stats') || dash.querySelector('[style*="grid-template-columns:repeat(5,1fr)"]');
      if (stats && stats.parentNode) stats.parentNode.insertBefore(box, stats);
      else dash.appendChild(box);
    }
    var statsRow = document.querySelector('#es-cc-legacy-stats') || document.querySelector('#admin-authenticated-dashboard [style*="grid-template-columns:repeat(5,1fr)"]');
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
    if (document.hidden) return;
    ensureSquadreButton();
    ensureAdminUi();
    syncBadge();
  }, 10000);

  window.EliseeManager = { open: openOverlay, close: closeOverlay, refreshAdmin: renderAdmin };
})();
