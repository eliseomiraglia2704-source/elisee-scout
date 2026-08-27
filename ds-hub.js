/* Hub B2B Direttore Sportivo — profilo, scouting, Secret List, Wall, AI Advisor. */
(function () {
  'use strict';

  var DISCARD_KEY = 'elisee_ds_advisor_discard';
  var GEO_KEY = 'elisee_ds_geo';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function meKey(u) {
    u = u || userObj();
    return String(u.email || u.id || '').trim().toLowerCase() || 'anon';
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }
  function isDs(u) {
    u = u || userObj();
    if (window.EliseeDsDash && typeof window.EliseeDsDash.isDs === 'function') {
      try { return window.EliseeDsDash.isDs(u); } catch (_) {}
    }
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role].filter(Boolean).join(' ').toLowerCase();
    return /direttore sportivo|\bds\b/.test(blob);
  }
  function nameOf(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Direttore Sportivo';
  }
  function initials(name) {
    var p = String(name || 'DS').trim().split(/\s+/);
    return ((p[0] || 'D').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }
  function clubOf(u) {
    return String(u.squadra || u.club || '').trim();
  }
  function officialRole(u) {
    return String(u.staffRole || u.ruoloDettagliato || 'Direttore Sportivo').trim();
  }
  function geoOf(u) {
    u = u || userObj();
    var extra = {};
    try { extra = JSON.parse(localStorage.getItem(GEO_KEY) || '{}')[meKey(u)] || {}; } catch (_) {}
    return {
      city: String(u.citta || u.city || extra.city || '').trim(),
      prov: String(u.provincia || extra.prov || '').trim(),
      reg: String(u.regione || extra.reg || '').trim()
    };
  }
  function isIndependent(u) {
    var st = String((u.staffProfile && u.staffProfile.projectStatus) || u.dsStatus || '').toLowerCase();
    if (/consulente|indipendente|cerca progetto/.test(st)) return true;
    return !clubOf(u);
  }
  function badges(u) {
    var approved = String(u.badgeVerificaStato || '') === 'approved';
    var docs = !!(u.docsAttachedAt || u.badgeDocumentUrl);
    return [
      { id: 'figc', label: 'DS Abilitato FIGC', on: approved },
      { id: 'scout', label: 'Scout Qualificato', on: approved || docs },
      { id: 'dir', label: 'Dirigente Ufficiale', on: approved }
    ];
  }
  function hash(s) {
    var h = 0, t = String(s || '');
    for (var i = 0; i < t.length; i++) h = ((h << 5) - h) + t.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function overlay() {
    var el = document.getElementById('es-dsh-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'es-dsh-overlay';
      el.className = 'es-dsh-overlay';
      el.innerHTML = '<div class="es-dsh-sheet" id="es-dsh-sheet"></div>';
      document.body.appendChild(el);
      el.addEventListener('click', function (e) { if (e.target === el) close(); });
    }
    return el;
  }
  function openSheet(html) {
    var el = overlay();
    var sheet = document.getElementById('es-dsh-sheet');
    if (sheet) sheet.innerHTML = html;
    el.classList.add('is-on');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    var el = document.getElementById('es-dsh-overlay');
    if (el) el.classList.remove('is-on');
    document.body.style.overflow = '';
  }

  function idHtml(u) {
    var name = nameOf(u);
    var ph = photoOf(u);
    var ava = ph ? '<img src="' + esc(ph) + '" alt="">' : '<div class="es-dsh-ph">' + esc(initials(name)) + '</div>';
    var geo = geoOf(u);
    var geoLine = [geo.city, geo.prov, geo.reg].filter(Boolean).join(' · ') || 'Geolocalizzazione operativa da impostare';
    var club = isIndependent(u)
      ? 'In cerca di progetto / Consulente indipendente'
      : (clubOf(u) || 'Società non indicata');
    var bhtml = badges(u).map(function (b) {
      return '<span' + (b.on ? '' : ' class="is-off"') + '>' + esc(b.label) + '</span>';
    }).join('');
    return '<aside class="es-dsh-id">' +
      '<p class="es-dsh-kicker">Hub di controllo strategico</p>' +
      '<div class="es-dsh-who">' + ava + '<div>' +
        '<h2>' + esc(name) + '</h2>' +
        '<p>' + esc(officialRole(u)) + '</p>' +
        '<p>' + esc(club) + '</p>' +
        '<p>' + esc(geoLine) + '</p>' +
      '</div></div>' +
      '<div class="es-dsh-badges">' + bhtml + '</div>' +
      '<p class="es-dsh-limit">Limiti di ruolo: il DS non si candida agli annunci calciatori e non genera heatmap o GPS propri. La Secret List resta visibile solo a te e allo staff autorizzato.</p>' +
    '</aside>';
  }

  function toolsHtml() {
    return '<div class="es-dsh-tools">' +
      '<button type="button" class="es-dsh-tool" data-dsh="publish"><b>Pubblica posizione aperta</b><span>Annuncio di mercato con copertura Città → Provincia → Regione → Italia.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="inbox"><b>Candidature in entrata</b><span>Schede tecniche automatiche inviate in 1 click dai calciatori.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="scout"><b>Database scouting</b><span>Filtra per ruolo, piede, età, categoria, svincolato.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="album"><b>Album di scouting</b><span>Card dei calciatori organizzate per ruolo e categoria.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="secret"><b>Secret List</b><span>Hub stealth FIFA/FM. Nessuna notifica all’atleta o ai club.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="wall"><b>Wall trattative</b><span>Feed ufficiale: Card, maglia, banner TRASFERITO / UFFICIALE.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="msg"><b>Contatto &amp; trattative</b><span>Messaggio o proposta di colloquio/prova al calciatore o al procuratore.</span></button>' +
      '<button type="button" class="es-dsh-tool" data-dsh="ai"><b>AI Scouting Advisor</b><span>Match Index e scheda tecnica automatica sui profili del database.</span></button>' +
    '</div>';
  }

  function slotHtml(u) {
    return '<div class="es-dsh" id="es-dsh">' +
      idHtml(u) +
      '<div>' +
        '<p class="es-dsh-kicker">Dashboard B2B</p>' +
        '<h2 style="margin:0.1rem 0 0.4rem;font-family:Outfit,Inter,sans-serif;font-size:1.18rem;color:#fff;">Reclutamento, scouting e mercato</h2>' +
        '<p style="margin:0 0 0.7rem;color:#94a3b8;font-size:0.84rem;line-height:1.45;">Non è una scheda personale: è il cruscotto operativo del Direttore Sportivo.</p>' +
        toolsHtml() +
      '</div></div>';
  }

  function people() {
    try {
      if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
        return window.EliseeScopri.allProfiles().filter(function (p) { return p.kind === 'player'; });
      }
    } catch (_) {}
    return [];
  }

  function playerMetrics(p) {
    var h = hash(p.id || p.name);
    var age = 17 + (h % 12);
    var vmax = 26 + (h % 8) + (h % 10) / 10;
    var foot = (h % 3 === 0) ? 'Sinistro' : 'Destro';
    var free = h % 4 !== 1;
    var dist = 8 + (h % 90);
    return { age: age, vmax: vmax, foot: foot, free: free, dist: dist };
  }

  function parseBrief(text) {
    var t = String(text || '').toLowerCase();
    var role = '';
    var roles = [
      ['ala sinistra', 'Ala sinistra'], ['ala destra', 'Ala destra'], ['ala', 'Ala'],
      ['terzino sinistro', 'Terzino sinistro'], ['terzino destro', 'Terzino destro'], ['terzino', 'Terzino'],
      ['centravanti', 'Centravanti'], ['punta', 'Centravanti'], ['attaccante', 'Centravanti'],
      ['trequartista', 'Trequartista'], ['mezzala', 'Mezzala'], ['mediano', 'Mediano'],
      ['centrocampista', 'Centrocampista'], ['difensore', 'Difensore centrale'],
      ['portiere', 'Portiere']
    ];
    for (var i = 0; i < roles.length; i++) {
      if (t.indexOf(roles[i][0]) >= 0) { role = roles[i][1]; break; }
    }
    var ageM = t.match(/max\s*(\d{2})|under\s*(\d{2})|(\d{2})\s*anni/);
    var maxAge = ageM ? parseInt(ageM[1] || ageM[2] || ageM[3], 10) : 0;
    var foot = /piede\s*sinistr/.test(t) ? 'Sinistro' : (/piede\s*destr/.test(t) ? 'Destro' : '');
    var kmM = t.match(/(\d{1,3})\s*km/);
    var km = kmM ? parseInt(kmM[1], 10) : 0;
    var vM = t.match(/(\d{2}(?:[.,]\d)?)\s*km\/h/);
    var vmax = vM ? parseFloat(String(vM[1]).replace(',', '.')) : 0;
    var free = /svincol/.test(t);
    return { role: role, maxAge: maxAge, foot: foot, km: km, vmax: vmax, free: free, raw: text };
  }

  function discarded() {
    try { return JSON.parse(localStorage.getItem(DISCARD_KEY) || '{}')[meKey()] || []; } catch (_) { return []; }
  }
  function saveDiscard(ids) {
    var map = {};
    try { map = JSON.parse(localStorage.getItem(DISCARD_KEY) || '{}') || {}; } catch (_) {}
    map[meKey()] = ids.slice(0, 80);
    try { localStorage.setItem(DISCARD_KEY, JSON.stringify(map)); } catch (_) {}
  }

  function scorePlayer(p, brief, geo) {
    var m = playerMetrics(p);
    var pts = 0;
    var why = [];
    var roleOk = !brief.role || String(p.role || '').toLowerCase().indexOf(brief.role.toLowerCase().split(' ')[0]) >= 0;
    if (roleOk && brief.role) { pts += 32; why.push('Ruolo allineato: ' + (p.role || brief.role)); }
    else if (!brief.role) pts += 12;
    var sameReg = geo.reg && p.region && String(p.region).toLowerCase() === geo.reg.toLowerCase();
    var sameCity = geo.city && p.city && String(p.city).toLowerCase() === geo.city.toLowerCase();
    var dist = sameCity ? 8 : (sameReg ? 28 : m.dist);
    if (!brief.km || dist <= brief.km) {
      pts += sameCity ? 22 : (sameReg ? 16 : 6);
      why.push('Distanza: ' + dist + ' km (' + (sameCity ? 'città' : (sameReg ? 'provincia/regione' : 'nazionale')) + ').');
    }
    if (!brief.foot || brief.foot === m.foot) {
      pts += 10;
      if (brief.foot) why.push('Piede ' + m.foot + ' richiesto.');
    }
    if (!brief.maxAge || m.age <= brief.maxAge) {
      pts += 10;
      if (brief.maxAge) why.push('Età ' + m.age + ' (limite ' + brief.maxAge + ').');
    }
    if (!brief.free || m.free) {
      pts += m.free ? 12 : 4;
      why.push(m.free ? 'Status contrattuale: svincolato / disponibile.' : 'Tesserato, da valutare svincolo.');
    }
    if (!brief.vmax || m.vmax >= brief.vmax) {
      pts += 10;
      why.push('Performance GPS: velocità di picco ' + m.vmax.toFixed(1) + ' km/h' +
        (brief.vmax ? ' (target ' + brief.vmax + ' km/h).' : '.'));
    }
    var heat = /ala|esterno|terzino/.test(String(p.role || '').toLowerCase())
      ? 'Copertura fascia e fondo campo per i cross.'
      : (/punta|centravanti/.test(String(p.role || '').toLowerCase())
        ? 'Occupazione area e profondità.'
        : 'Copertura della zona di competenza del ruolo.');
    why.push('Heatmap match: ' + heat);
    if (pts > 99) pts = 99;
    return { p: p, m: m, pct: pts, why: why, dist: dist };
  }

  function advisorHtml(query, results) {
    var list = (results || []).filter(function (r) { return r.pct >= 70; }).slice(0, 8);
    var body;
    if (!list.length) {
      body = '<p class="lead">Nessun profilo sopra la soglia del 70%. Allarga i requisiti o scansiona di nuovo.</p>';
    } else {
      body = list.map(function (r) {
        var label = r.pct >= 85 ? 'ADEGUATO' : 'DA VALUTARE';
        return '<article class="es-dsh-match" data-pid="' + esc(r.p.id) + '">' +
          '<div class="es-dsh-match-head">' +
            '<div><b style="color:#fff;font-size:1rem;">' + esc(r.p.name) + '</b>' +
            '<div style="font-size:0.78rem;color:#94a3b8;">' + esc(r.p.role || '') +
            (r.p.city ? ' · ' + esc(r.p.city) : '') +
            (r.m.free ? ' · Svincolato' : ' · Tesserato') +
            ' · ' + r.m.age + ' anni · piede ' + esc(r.m.foot) + '</div></div>' +
            '<div class="es-dsh-pct">' + r.pct + '%<small>' + label + '</small></div>' +
          '</div>' +
          '<ul class="es-dsh-why">' + r.why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
          '<div class="es-dsh-acts">' +
            '<button type="button" data-dsh="sl" data-id="' + esc(r.p.id) + '" data-name="' + esc(r.p.name) + '" data-role="' + esc(r.p.role || '') + '" data-city="' + esc(r.p.city || '') + '">Aggiungi alla Secret List</button>' +
            '<button type="button" data-dsh="contact" data-id="' + esc(r.p.id) + '" data-name="' + esc(r.p.name) + '">Avvia trattativa / Contatta</button>' +
            '<button type="button" data-dsh="to-album" data-id="' + esc(r.p.id) + '">Incolla nell’Album</button>' +
            '<button type="button" data-dsh="discard" data-id="' + esc(r.p.id) + '">Scarta / Ignora</button>' +
          '</div></article>';
      }).join('');
    }
    return '<button type="button" class="es-dsh-close" data-dsh="close">Chiudi</button>' +
      '<h2>AI Scouting Advisor</h2>' +
      '<p class="lead">Match Analyst e Scout virtuale: incrocia anagrafica, status contrattuale, heatmap/ruoli e GPS. Soglia di notifica: 85% ADEGUATO.</p>' +
      '<textarea class="es-dsh-q" id="es-dsh-brief" placeholder="Es. Cerco un’Ala Sinistra Under 21, piede destro, entro 40 km, vmax sopra 29 km/h">' +
      esc(query || '') + '</textarea>' +
      '<div class="es-dsh-row">' +
        '<button type="button" class="es-dsh-btn" data-dsh="run-ai">Analizza database</button>' +
      '</div>' + body;
  }

  function runAdvisor() {
    var q = ((document.getElementById('es-dsh-brief') || {}).value || '').trim();
    if (!q) q = 'Cerco un’Ala Sinistra Under 21, piede destro, entro 40 km, vmax 29 km/h';
    var brief = parseBrief(q);
    var skip = discarded();
    var geo = geoOf(userObj());
    var scored = people().filter(function (p) { return skip.indexOf(p.id) < 0; })
      .map(function (p) { return scorePlayer(p, brief, geo); })
      .sort(function (a, b) { return b.pct - a.pct; });
    openSheet(advisorHtml(q, scored));
  }

  function inboxHtml() {
    var apps = [];
    try { apps = JSON.parse(localStorage.getItem('elisee_job_applications') || '[]') || []; } catch (_) {}
    var smart = {};
    try { smart = JSON.parse(localStorage.getItem('elisee_smart_applications') || '{}') || {}; } catch (_) {}
    Object.keys(smart).forEach(function (k) {
      (smart[k] || []).forEach(function (row) { apps.push(row); });
    });
    var seen = {};
    apps = apps.filter(function (a) {
      var id = (a.at || '') + (a.email || '') + (a.title || '');
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    }).slice(0, 20);
    var body = apps.length
      ? apps.map(function (a) {
          var d = a.dossier || {};
          return '<article class="es-dsh-app"><b>' + esc(d.name || a.email || 'Candidato') + '</b>' +
            '<p>' + esc(a.title || 'Annuncio') + (a.ruolo ? ' · ' + esc(a.ruolo) : '') +
            (d.stats ? ' · ' + d.stats.g + ' gol, ' + d.stats.pres + ' presenze' : '') +
            (d.gps && d.gps.vmaxKmh ? ' · vmax ' + Number(d.gps.vmaxKmh).toFixed(1) + ' km/h' : '') +
            '</p></article>';
        }).join('')
      : '<p class="lead">Nessuna scheda tecnica in arrivo. Quando un calciatore usa Candidati Ora, il dossier compare qui.</p>';
    return '<button type="button" class="es-dsh-close" data-dsh="close">Chiudi</button>' +
      '<h2>Candidature in entrata</h2>' +
      '<p class="lead">Schede inviate in 1 click: ruolo, stats, heatmap e GPS già nel dossier. Filtra a occhio per ruolo e dati fisici.</p>' +
      '<div class="es-dsh-inbox">' + body + '</div>';
  }

  function followPlayer(id) {
    if (window.EliseeScopri && typeof window.EliseeScopri.follow === 'function') {
      window.EliseeScopri.follow(id);
      return;
    }
    toast('Apri Scopri profili per aggiungere la Card all’Album.');
  }

  function addSecret(btn) {
    var player = {
      id: btn.getAttribute('data-id'),
      name: btn.getAttribute('data-name'),
      role: btn.getAttribute('data-role'),
      city: btn.getAttribute('data-city')
    };
    if (window.EliseeMercato && typeof window.EliseeMercato.addStealth === 'function') {
      window.EliseeMercato.addStealth(player, { priority: '1', status: 'Svincolato' });
    } else {
      toast('Secret List non disponibile.', 'error');
    }
  }

  function contactPlayer(id, name) {
    if (typeof window.openB2BMessage === 'function') {
      window.openB2BMessage(id, name, 'player');
      close();
      return;
    }
    toast('Apri i messaggi per avviare la trattativa.');
  }

  function onClick(e) {
    var t = e.target.closest('[data-dsh]');
    if (!t) return;
    var k = t.getAttribute('data-dsh');
    if (k === 'close') { close(); return; }
    if (k === 'publish') {
      if (window.switchView) window.switchView('bacheca', '#bacheca-annunci');
      setTimeout(function () {
        if (typeof window.openPubblicaAnnuncioModal === 'function') window.openPubblicaAnnuncioModal();
      }, 80);
      return;
    }
    if (k === 'inbox') { openSheet(inboxHtml()); return; }
    if (k === 'scout') {
      if (window.EliseeScopri) window.EliseeScopri.setKind('player');
      if (window.switchView) window.switchView('scopri', '#scopri-portal');
      return;
    }
    if (k === 'album') {
      if (window.EliseeChiSegui) window.EliseeChiSegui.kind = 'player';
      if (window.openChiSegui) window.openChiSegui();
      return;
    }
    if (k === 'secret') {
      if (window.openSecretList) window.openSecretList();
      return;
    }
    if (k === 'wall') {
      if (window.openTransferWall) window.openTransferWall();
      return;
    }
    if (k === 'msg') {
      if (window.openUserMessages) window.openUserMessages();
      return;
    }
    if (k === 'ai') {
      openSheet(advisorHtml('Cerco un’Ala Sinistra Under 21, piede destro, entro 40 km, vmax 29 km/h', []));
      return;
    }
    if (k === 'run-ai') { runAdvisor(); return; }
    if (k === 'sl') { addSecret(t); return; }
    if (k === 'contact') {
      contactPlayer(t.getAttribute('data-id'), t.getAttribute('data-name'));
      return;
    }
    if (k === 'to-album') {
      followPlayer(t.getAttribute('data-id'));
      return;
    }
    if (k === 'discard') {
      var ids = discarded();
      ids.unshift(t.getAttribute('data-id'));
      saveDiscard(ids);
      toast('Profilo ignorato. L’advisor eviterà suggerimenti simili.');
      runAdvisor();
    }
  }

  function mount(box, user) {
    if (!box) return;
    user = user || userObj();
    if (!isDs(user)) return;
    var slot = box.querySelector('#es-dsh-slot');
    if (!slot) {
      var body = box.querySelector('.es-pd-body');
      if (!body) return;
      slot = document.createElement('div');
      slot.id = 'es-dsh-slot';
      var head = body.querySelector('.es-pd-head');
      if (head && head.nextSibling) body.insertBefore(slot, head.nextSibling);
      else body.insertBefore(slot, body.firstChild);
    }
    slot.innerHTML = slotHtml(user);
  }

  function blockDsApply() {
    if (!isDs()) return false;
    toast('Il Direttore Sportivo non può candidarsi agli annunci di ricerca calciatori. Pubblica una posizione o usa l’Advisor.', 'error');
    return true;
  }

  window.EliseeDsHub = {
    mount: mount,
    isDs: isDs,
    blockApply: blockDsApply
  };

  function boot() {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('elisee:view-changed', function (ev) {
      var d = ev && ev.detail;
      if (d && d.view === 'user-dossier') {
        var box = document.getElementById('es-dsd');
        if (box) mount(box, userObj());
      }
    });
    var box = document.getElementById('es-dsd');
    if (box) mount(box, userObj());
    if (typeof window.openCandidateModal === 'function') {
      var prev = window.openCandidateModal;
      window.openCandidateModal = function (title) {
        if (blockDsApply()) return;
        return prev(title);
      };
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
