/* Elisee Scout — struttura comune per le dashboard di ruolo senza dati inventati.
 * Mostra solo i dati del profilo. Le funzioni che trattano dati sanitari o di altri tesserati
 * restano "In arrivo" finché non c'è l'archivio squadra protetto (mai nel browser). */
(function () {
  'use strict';

  var ICO = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    bars: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8 7 17M17 7l2.8-2.8"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    plane: '<path d="M2 16l20-8-20-8v6l14 2-14 2z"/>',
    apple: '<path d="M12 20c-4 0-7-3-7-8 0-3 2-5 4-5 1.2 0 2 .6 3 .6s1.8-.6 3-.6c2 0 4 2 4 5 0 5-3 8-7 8z"/><path d="M12 7c0-2 1-4 3-4"/>'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function val(v) { return v == null ? '' : String(v).trim(); }
  function svg(d, size) {
    size = size || 16;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICO[d] || d || ICO.grid) + '</svg>';
  }
  function nameOf(u, fb) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || fb || '';
  }
  function initials(name) {
    var p = String(name || 'ES').trim().split(/\s+/);
    return ((p[0] || 'E').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }
  function clubOf(u) { return val(u.squadra || u.club); }
  function pick(u, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = k.indexOf('.') > 0 ? (u[k.split('.')[0]] || {})[k.split('.')[1]] : u[k];
      if (val(v)) return val(v);
    }
    return '';
  }
  function completion(u, cfg) {
    var checks = [u.nome, u.cognome, clubOf(u), pick(u, cfg.qualificaKeys || []), u.email,
      (u.docsAttachedAt || u.badgeDocumentUrl || u.badgeSelfieUrl)];
    return Math.round(100 * checks.filter(function (x) { return !!val(x); }).length / checks.length);
  }

  function card(p, title, ico, badge, inner) {
    return '<section class="es-' + p + '-card">' +
      '<div class="es-' + p + '-card-head"><h2 class="es-' + p + '-card-title">' + svg(ico, 17) + '<span>' + esc(title) + '</span></h2>' +
      (badge ? '<span class="es-' + p + '-badge-tag ' + (badge.tone || 'cyan') + '">' + esc(badge.text) + '</span>' : '') +
      '</div>' + inner + '</section>';
  }

  function tabDashboard(cfg, u) {
    var p = cfg.prefix;
    var name = nameOf(u, cfg.roleLabel);
    var pct = completion(u, cfg);
    var qual = pick(u, cfg.qualificaKeys || []) || 'Non inserita';
    var albo = pick(u, cfg.alboKeys || []) || 'Non inserita';
    var club = clubOf(u);
    var profile = card(p, 'Profilo', 'users', { text: club ? 'In staff' : 'Senza squadra', tone: club ? 'emerald' : 'cyan' },
      '<div class="es-' + p + '-profile-row">' +
        '<div class="es-' + p + '-avatar-fallback">' + esc(initials(name)) + '</div>' +
        '<div class="es-' + p + '-user-meta"><b class="es-' + p + '-user-name">' + esc(name) + '</b>' +
        '<span class="es-rdh-sub">' + esc(cfg.roleLabel) + ' · ' + esc(club || 'Squadra non inserita') + '</span></div>' +
      '</div>' +
      '<div class="es-rdh-progress"><div class="es-rdh-progress-row"><span>Completamento profilo</span><b>' + pct + '%</b></div>' +
        '<progress class="es-rdh-bar" max="100" value="' + pct + '"></progress></div>' +
      '<div class="es-' + p + '-cred-grid">' +
        '<div class="es-' + p + '-cred-item"><span>' + esc(cfg.qualificaLabel || 'Qualifica') + '</span><b>' + esc(qual) + '</b></div>' +
        '<div class="es-' + p + '-cred-item"><span>' + esc(cfg.alboLabel || 'Iscrizione albo') + '</span><b>' + esc(albo) + '</b></div>' +
      '</div>' +
      '<div class="es-' + p + '-quick-actions"><button type="button" class="es-' + p + '-quick-btn" data-rdh-act="edit">Modifica profilo</button></div>');
    var tools = card(p, 'Cosa trovi in quest’area', 'grid', null,
      '<div class="es-' + p + '-actions-grid">' +
      cfg.tabs.filter(function (t) { return t.id !== 'dashboard' && t.id !== 'impostazioni'; }).map(function (t) {
        return '<button type="button" class="es-' + p + '-action-card" data-rdh-nav="' + esc(t.id) + '">' +
          '<div class="es-' + p + '-action-icon">' + svg(t.ico, 18) + '</div>' +
          '<div class="es-' + p + '-action-text"><b>' + esc(t.label) + '</b><span>' + esc(t.short || '') + '</span></div></button>';
      }).join('') + '</div>');
    var note = cfg.privacyNote
      ? card(p, 'Dati sanitari e privacy', 'shield', { text: 'GDPR art. 9', tone: 'amber' },
        '<p class="es-rdh-lead">' + esc(cfg.privacyNote) + '</p>')
      : '';
    return '<div class="es-' + p + '-grid-2col">' + profile + tools + '</div>' + note;
  }

  function tabSoon(cfg, t) {
    var p = cfg.prefix;
    return card(p, t.title || t.label, t.ico, { text: 'In arrivo', tone: 'amber' },
      '<p class="es-rdh-lead">' + esc(t.text || '') + '</p>' +
      (t.why ? '<p class="es-rdh-note">' + esc(t.why) + '</p>' : '') +
      '<div class="es-rdh-empty">Nessun dato da mostrare.</div>');
  }

  function tabInfo(cfg, t) {
    var p = cfg.prefix;
    return card(p, t.title || t.label, t.ico, { text: 'Guida', tone: 'cyan' },
      '<p class="es-rdh-lead">' + esc(t.text || '') + '</p>' +
      '<ul class="es-rdh-list">' + (t.items || []).map(function (it) {
        return '<li><b>' + esc(it.t) + '</b><span>' + esc(it.d) + '</span></li>';
      }).join('') + '</ul>');
  }

  function loadList(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; }
  }
  function saveList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (_) { return false; }
  }

  // Appunti di lavoro dell'utente: restano su questo dispositivo e il sito lo dice.
  function tabNotes(cfg, t) {
    var p = cfg.prefix;
    var rows = loadList(t.storeKey);
    var form = '<form class="es-rdh-form" data-rdh-form="' + esc(t.id) + '">' +
      (t.fields || []).map(function (f) {
        var tag = f.long
          ? '<textarea name="' + esc(f.k) + '" rows="3" placeholder="' + esc(f.ph || '') + '"' + (f.req ? ' required' : '') + '></textarea>'
          : '<input name="' + esc(f.k) + '" placeholder="' + esc(f.ph || '') + '"' + (f.req ? ' required' : '') + '>';
        return '<label class="es-rdh-field' + (f.long ? ' is-long' : '') + '"><span>' + esc(f.label) + '</span>' + tag + '</label>';
      }).join('') +
      '<div class="es-rdh-form-actions"><button type="submit" class="es-' + p + '-quick-btn">' + esc(t.addLabel || 'Aggiungi') + '</button></div>' +
      '</form>';
    var list = rows.length
      ? '<ul class="es-rdh-notes">' + rows.map(function (r) {
          var main = r[(t.fields[0] || {}).k] || '';
          var rest = (t.fields || []).slice(1).map(function (f) {
            return r[f.k] ? '<span><b>' + esc(f.label) + ':</b> ' + esc(r[f.k]) + '</span>' : '';
          }).join('');
          return '<li><div><strong>' + esc(main) + '</strong>' + rest + '<small>' + esc(r.at || '') + '</small></div>' +
            '<button type="button" class="es-rdh-del" data-rdh-del="' + esc(t.id) + '" data-id="' + esc(r.id) + '" aria-label="Elimina">Elimina</button></li>';
        }).join('') + '</ul>'
      : '<div class="es-rdh-empty">' + esc(t.emptyText || 'Ancora niente qui.') + '</div>';
    return card(p, t.title || t.label, t.ico, { text: 'Su questo dispositivo', tone: 'cyan' },
      '<p class="es-rdh-lead">' + esc(t.text || '') + '</p>' +
      '<p class="es-rdh-note">Gli appunti restano salvati solo su questo dispositivo. Non inserire dati sanitari o recapiti di altre persone.</p>' +
      form + list);
  }

  function tabLinks(cfg, t) {
    var p = cfg.prefix;
    return card(p, t.title || t.label, t.ico, null,
      '<p class="es-rdh-lead">' + esc(t.text || '') + '</p>' +
      '<div class="es-' + p + '-quick-actions">' + (t.links || []).map(function (l, i) {
        return '<button type="button" class="es-' + p + '-quick-btn" data-rdh-link="' + esc(t.id) + '" data-i="' + i + '">' + esc(l.label) + '</button>';
      }).join('') + '</div>');
  }

  function tabProfile(cfg, u) {
    var p = cfg.prefix;
    var rows = [['Nome e cognome', nameOf(u)], ['Ruolo', cfg.roleLabel], ['Squadra', clubOf(u)],
      [cfg.qualificaLabel || 'Qualifica', pick(u, cfg.qualificaKeys || [])],
      [cfg.alboLabel || 'Iscrizione albo', pick(u, cfg.alboKeys || [])],
      ['Email', val(u.email)]];
    return card(p, 'Profilo e qualifiche', 'gear', null,
      '<div class="es-' + p + '-cred-grid">' + rows.map(function (r) {
        return '<div class="es-' + p + '-cred-item"><span>' + esc(r[0]) + '</span><b>' + esc(r[1] || 'Non inserito') + '</b></div>';
      }).join('') + '</div>' +
      '<p class="es-rdh-note">Le qualifiche le inserisci tu nel profilo. Elisee Scout non le verifica presso albi o federazioni.</p>' +
      '<div class="es-' + p + '-quick-actions"><button type="button" class="es-' + p + '-quick-btn" data-rdh-act="edit">Modifica profilo</button></div>');
  }

  function tabContent(cfg, id, u) {
    if (id === 'dashboard') return tabDashboard(cfg, u);
    if (id === 'impostazioni') return tabProfile(cfg, u);
    var t = cfg.tabs.filter(function (x) { return x.id === id; })[0];
    if (!t) return tabDashboard(cfg, u);
    if (t.kind === 'info') return tabInfo(cfg, t);
    if (t.kind === 'notes') return tabNotes(cfg, t);
    if (t.kind === 'links') return tabLinks(cfg, t);
    return tabSoon(cfg, t);
  }

  function html(cfg, u, active) {
    var p = cfg.prefix;
    var name = nameOf(u, cfg.roleLabel);
    var club = clubOf(u);
    var licence = [pick(u, cfg.qualificaKeys || []), pick(u, cfg.alboKeys || [])].filter(Boolean).join(' · ') || 'Qualifica non inserita';
    var pct = completion(u, cfg);
    var side = cfg.tabs.map(function (t) {
      return '<button type="button" class="es-' + p + '-side-btn' + (t.id === active ? ' is-active' : '') + '" data-rdh-nav="' + esc(t.id) + '">' + svg(t.ico) + '<span>' + esc(t.label) + '</span></button>';
    }).join('');
    var tabs = cfg.tabs.filter(function (t) { return t.id !== 'impostazioni'; }).map(function (t) {
      return '<button type="button" class="es-' + p + '-tab-btn' + (t.id === active ? ' is-active' : '') + '" data-rdh-nav="' + esc(t.id) + '">' + svg(t.ico, 14) + esc(t.label) + '</button>';
    }).join('');
    return '<div class="es-' + p + '-shell">' +
      '<aside class="es-' + p + '-sidebar" data-rdh-sidebar>' +
        '<div class="es-' + p + '-brand-header"><div class="es-' + p + '-brand-title">ELISEE <span>SCOUT</span></div><div class="es-' + p + '-brand-sub">' + esc(cfg.area) + '</div></div>' +
        '<nav class="es-' + p + '-sidebar-nav">' + side + '</nav>' +
        '<div class="es-' + p + '-sidebar-badge"><div class="es-' + p + '-sidebar-club-card">' +
          '<span class="es-pro-crest-ico">' + svg('shield', 18) + '</span>' +
          '<div><strong>' + esc(club || 'Squadra non inserita') + '</strong><span>' + esc(cfg.roleLabel) + '</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-' + p + '-main">' +
        '<div class="es-' + p + '-dash-header">' +
          '<div class="es-' + p + '-header-top-row">' +
            '<button type="button" class="es-' + p + '-mobile-menu-btn" data-rdh-act="menu" aria-label="Menu">' + svg('<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>', 18) + '</button>' +
            '<div class="es-' + p + '-header-identity">' +
              '<div class="es-' + p + '-header-block">' +
                '<div class="es-' + p + '-licence-badge">' + svg(cfg.headerIco || 'star', 24) + '</div>' +
                '<div class="es-' + p + '-' + (cfg.infoClass || 'doc-info') + '"><strong>' + esc(name) + '</strong><span class="role">' + esc(cfg.roleLabel) + '</span><p class="sub">' + esc(licence) + '</p></div>' +
              '</div>' +
              '<div class="es-' + p + '-header-sep"></div>' +
              '<div class="es-' + p + '-header-block es-' + p + '-club-info"><span class="es-pro-crest-ico">' + svg('shield', 22) + '</span>' +
                '<div><strong>' + esc(club || 'Squadra non inserita') + '</strong><span>' + esc(cfg.area) + '</span></div></div>' +
            '</div>' +
            '<button type="button" class="es-' + p + '-btn-quick-jump" data-rdh-act="edit">Modifica profilo &#8594;</button>' +
          '</div>' +
          '<div class="es-' + p + '-header-match-row">' +
            '<div class="es-' + p + '-target-box"><p class="label">' + esc(cfg.nextLabel || 'Prossimo impegno') + '</p><strong>Nessun impegno in programma</strong><span>Si aggiorna con il calendario del club</span></div>' +
            '<div class="es-' + p + '-target-box"><p class="label">' + esc(cfg.registerLabel || 'Registro') + '</p><strong>In arrivo</strong><span>' + esc(cfg.registerSub || 'Si attiva con l’archivio squadra protetto') + '</span></div>' +
            '<div class="es-' + p + '-target-box"><p class="label">Profilo</p><strong>' + pct + '% completo</strong><span>' + (pct >= 100 ? 'Tutti i dati inseriti' : 'Completa i dati mancanti') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<nav class="es-' + p + '-nav-tabs">' + tabs + '</nav>' +
        '<div data-rdh-content>' + tabContent(cfg, active, u) + '</div>' +
      '</main>' +
    '</div>';
  }

  function openEdit() {
    if (typeof window.openEditUserModal === 'function') window.openEditUserModal();
    else if (typeof window.switchView === 'function') window.switchView('user-dossier');
  }

  function tabById(cfg, id) {
    return cfg.tabs.filter(function (x) { return x.id === id; })[0];
  }
  function runLink(l) {
    if (l.fn && typeof window[l.fn] === 'function') { window[l.fn](); return; }
    if (l.view && typeof window.switchView === 'function') { window.switchView(l.view, l.hash || ''); return; }
    if (typeof window.showToast === 'function') window.showToast('Sezione non disponibile in questa pagina.', 'info');
  }

  function mount(box, cfg, u) {
    var state = box.__rdh || (box.__rdh = { active: 'dashboard' });
    function refresh() {
      var c = box.querySelector('[data-rdh-content]');
      if (c) c.innerHTML = tabContent(cfg, state.active, box.__rdhUser || u);
    }
    box.innerHTML = html(cfg, u, state.active);
    if (box.__rdhBound) return;
    box.__rdhBound = true;
    box.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-rdh-form]');
      if (!f) return;
      e.preventDefault();
      var tf = tabById(cfg, f.getAttribute('data-rdh-form'));
      if (!tf) return;
      var row = { id: 'n' + Date.now(), at: new Date().toLocaleString('it-IT') };
      (tf.fields || []).forEach(function (fd) {
        var el = f.elements[fd.k];
        row[fd.k] = el ? String(el.value || '').trim().slice(0, 2000) : '';
      });
      if (!row[(tf.fields[0] || {}).k]) return;
      var list = loadList(tf.storeKey);
      list.unshift(row);
      if (saveList(tf.storeKey, list.slice(0, 200)) && typeof window.showToast === 'function') {
        window.showToast('Salvato su questo dispositivo.', 'success');
      }
      refresh();
    });
    box.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-rdh-nav]');
      if (nav) {
        state.active = nav.getAttribute('data-rdh-nav');
        var c = box.querySelector('[data-rdh-content]');
        if (c) c.innerHTML = tabContent(cfg, state.active, box.__rdhUser || u);
        box.querySelectorAll('[data-rdh-nav]').forEach(function (b) {
          if (b.closest('[data-rdh-content]')) return;
          b.classList.toggle('is-active', b.getAttribute('data-rdh-nav') === state.active);
        });
        var sb = box.querySelector('[data-rdh-sidebar]');
        if (sb) sb.classList.remove('is-open');
        return;
      }
      var del = e.target.closest('[data-rdh-del]');
      if (del) {
        var td = tabById(cfg, del.getAttribute('data-rdh-del'));
        if (td && window.confirm('Eliminare questa voce?')) {
          saveList(td.storeKey, loadList(td.storeKey).filter(function (r) { return String(r.id) !== del.getAttribute('data-id'); }));
          refresh();
        }
        return;
      }
      var link = e.target.closest('[data-rdh-link]');
      if (link) {
        var tl = tabById(cfg, link.getAttribute('data-rdh-link'));
        var l = tl && tl.links && tl.links[Number(link.getAttribute('data-i'))];
        if (l) runLink(l);
        return;
      }
      var act = e.target.closest('[data-rdh-act]');
      if (!act) return;
      var a = act.getAttribute('data-rdh-act');
      if (a === 'menu') {
        var side = box.querySelector('[data-rdh-sidebar]');
        if (side) side.classList.toggle('is-open');
      } else if (a === 'edit') {
        openEdit();
      }
    });
  }

  window.EliseeRoleHonest = {
    mount: function (box, cfg, u) { box.__rdhUser = u; mount(box, cfg, u); },
    esc: esc
  };
})();
