/* Elisee Scout — funzioni dedicate del Manuale Profili Organizzativi Club (set 2026). */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function load(key, fallback) {
    try {
      var raw = JSON.parse(localStorage.getItem(key) || 'null');
      if (raw != null) return raw;
    } catch (_) {}
    return fallback;
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function clubOf(u) {
    u = u || userObj();
    var c = String(u.squadra || u.club || '').trim();
    return c;
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || (u && u.fotoUrl) || '';
    } catch (_) {}
    return (u && u.fotoUrl) || '';
  }
  function card(title, badge, inner) {
    return '<section class="es-pd-card es-ops-card" style="padding:1.2rem;">' +
      '<div class="es-pd-card-header"><h2>' + title + '</h2>' +
      (badge ? '<span class="es-pd-source-badge">' + badge + '</span>' : '') + '</div>' +
      inner + '</section>';
  }
  function comingSoon(title, body) {
    return card(title, 'Coming soon / Beta',
      '<p class="es-ops-lead">' + body + '</p>' +
      '<button type="button" class="es-ops-btn" disabled>Funzione in lista d’attesa</button> ' +
      '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="waitlist" data-mod="' + esc(title) + '">Iscriviti alla lista d’attesa</button>');
  }
  function anagraficaHtml(user, roleLabel) {
    user = user || userObj();
    var ph = photoOf(user);
    var tessera = user.tessera || user.nTessera || '—';
    var incarico = user.inizioIncarico || user.dataInizio || '—';
    var dob = user.dataNascita || user.dob || '—';
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="" class="es-ops-ava">'
      : '<div class="es-ops-ava es-ops-ava-fb">' + esc(((user.nome || 'U').charAt(0) + (user.cognome || 'T').charAt(0)).toUpperCase()) + '</div>';
    return card('Scheda anagrafica tesserato', 'Manuale club',
      '<div class="es-ops-ana">' + ava +
      '<dl class="es-ops-dl">' +
        '<div><dt>Nome</dt><dd>' + esc(user.nome || '—') + '</dd></div>' +
        '<div><dt>Cognome</dt><dd>' + esc(user.cognome || '—') + '</dd></div>' +
        '<div><dt>Ruolo</dt><dd>' + esc(roleLabel || user.staffRole || '—') + '</dd></div>' +
        '<div><dt>N° tessera</dt><dd>' + esc(tessera) + '</dd></div>' +
        '<div><dt>Società</dt><dd>' + esc(clubOf(user) || '—') + '</dd></div>' +
        '<div><dt>Data di nascita</dt><dd>' + esc(dob) + '</dd></div>' +
        '<div><dt>Email</dt><dd>' + esc(user.email || '—') + '</dd></div>' +
        '<div><dt>Telefono</dt><dd>' + esc(user.telefono || user.phone || '—') + '</dd></div>' +
        '<div><dt>Inizio incarico</dt><dd>' + esc(incarico) + '</dd></div>' +
        '<div><dt>Foto profilo</dt><dd>' + (ph ? 'Caricata' : 'Non caricata') + '</dd></div>' +
      '</dl></div>');
  }

  /* ---------- dati salvati dall'utente (solo su questo dispositivo, niente esempi precaricati) ---------- */
  function list(key) {
    var v = load(key, []);
    return Array.isArray(v) ? v : [];
  }
  function seedBroadcast() { return list('elisee_tm_broadcast'); }
  function seedChecklist() { return list('elisee_tm_checklist'); }
  function seedDeadlines() { return list('elisee_sg_deadlines'); }
  function seedContracts() { return list('elisee_sg_contracts'); }
  function seedEqReq() { return list('elisee_eq_requests'); }
  function seedBudget() {
    var b = load('elisee_eq_budget', null);
    if (!b || typeof b !== 'object') b = {};
    return { totale: Number(b.totale) || 0, spese: Array.isArray(b.spese) ? b.spese : [] };
  }
  function seedInv() { return list('elisee_eq_inv'); }
  function seedAccrediti() { return list('elisee_pr_acc'); }
  function seedRassegna() { return list('elisee_pr_rassegna'); }
  function seedSlots() { return list('elisee_pr_slots'); }
  function seedSlo() { return list('elisee_bt_slo'); }
  function seedCrm() { return list('elisee_mk_crm'); }
  function emptyLine(msg) {
    return '<p class="es-ops-empty">' + esc(msg) + '</p>';
  }
  function euro(n) {
    return '€ ' + Number(n || 0).toLocaleString('it-IT');
  }

  // Distanze stradali approssimate solo per le tratte note; per le altre si inseriscono a mano.
  var KM = {
    'foggia|bari': 132, 'foggia|napoli': 185, 'foggia|roma': 365, 'foggia|campobasso': 98,
    'foggia|lecce': 178, 'foggia|pescara': 172, 'foggia|salerno': 155
  };
  function kmOf(a, b) {
    a = String(a || '').trim().toLowerCase();
    b = String(b || '').trim().toLowerCase();
    return KM[a + '|' + b] || KM[b + '|' + a] || 0;
  }

  function tmBroadcast() {
    var rows = seedBroadcast();
    return card('Hub comunicazioni di squadra', 'Bozze',
      '<p class="es-ops-lead">Scrivi le comunicazioni per rosa e staff. Per ora restano salvate su questo dispositivo: l’invio automatico non è ancora attivo.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="tm-send">Nuova comunicazione</button>' +
      '<div class="es-ops-list">' + (rows.length ? rows.map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.title) + '</b><p>' + esc(r.body) + '</p>' +
          '<span>Scritta ' + esc(r.sent || '') + '</span></article>';
      }).join('') : emptyLine('Nessuna comunicazione salvata.')) + '</div>');
  }
  function tmChecklist() {
    var packs = seedChecklist();
    return card('Builder checklist matchday & eventi', 'Spunta progressiva',
      '<p class="es-ops-lead">Checklist digitali per orari, materiale, consegne e convocazioni.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="tm-check-add">Nuova checklist</button>' +
      (packs.length ? packs.map(function (p) {
        var n = p.items.length, d = p.items.filter(function (i) { return i.done; }).length;
        return '<div class="es-ops-item"><b>' + esc(p.evento) + '</b> <span>' + d + '/' + n + ' completati</span>' +
          p.items.map(function (it, i) {
            return '<label class="es-ops-check"><input type="checkbox" ' + (it.done ? 'checked' : '') +
              ' data-club-ops="tm-check-toggle" data-pid="' + esc(p.id) + '" data-i="' + i + '"> ' + esc(it.t) + '</label>';
          }).join('') + '</div>';
      }).join('') : emptyLine('Nessuna checklist creata.')));
  }
  function tmLogistica() {
    return card('Calcolatore logistico spostamenti', 'Itinerari & distanze',
      '<p class="es-ops-lead">Inserisci partenza, arrivo e orario della gara. Se la tratta non è in elenco, scrivi tu i chilometri.</p>' +
      '<div class="es-ops-form">' +
        '<input id="es-ops-from" placeholder="Partenza (es. Foggia)">' +
        '<input id="es-ops-to" placeholder="Destinazione (es. Bari)">' +
        '<input id="es-ops-km" inputmode="numeric" placeholder="Km (se li conosci)">' +
        '<input id="es-ops-kick" placeholder="Orario gara (es. 15:00)">' +
        '<button type="button" class="es-ops-btn" data-club-ops="tm-calc">Calcola itinerario</button>' +
      '</div><div id="es-ops-trip-out"></div>');
  }
  function tmKpi() {
    var chk = seedChecklist();
    var items = [];
    chk.forEach(function (p) { items = items.concat(p.items || []); });
    var pct = items.length ? Math.round(100 * items.filter(function (i) { return i.done; }).length / items.length) + '%' : '—';
    return card('Dashboard KPI squadra', 'Dai tuoi dati',
      '<p class="es-ops-lead">Riepilogo calcolato da comunicazioni e checklist che hai salvato.</p>' +
      '<div class="es-ops-kpis">' +
        '<div><strong>' + seedBroadcast().length + '</strong><span>Comunicazioni</span></div>' +
        '<div><strong>' + chk.length + '</strong><span>Checklist</span></div>' +
        '<div><strong>' + pct + '</strong><span>Voci completate</span></div>' +
      '</div>');
  }

  // Settore giovanile: dati di minori. Non si salvano nel browser: arrivano con l'archivio squadra protetto.
  function ygTalent() {
    return comingSoon('Academy Talent Tracker', 'Matrice di crescita dei giovani tesserati. I dati dei ragazzi sono di minori: la funzione si attiva solo con l’archivio squadra protetto, non sul singolo dispositivo.');
  }
  function ygScout() {
    return comingSoon('Piattaforma di scouting giovanile', 'Archivio dei profili osservati sul territorio. Si attiva con l’archivio squadra protetto, perché riguarda minori.');
  }
  function ygLibretto() {
    return comingSoon('Percorso formativo & libretto elettronico', 'Fascicolo digitale con percorso sportivo e scolastico. Si attiva con l’archivio squadra protetto e il consenso dei genitori.');
  }

  function sgDeadlines() {
    var rows = seedDeadlines();
    return card('Alert automatico scadenze', 'Visite · svincoli · rinnovi · squalifiche',
      '<p class="es-ops-lead">Segna le scadenze di visite mediche, svincoli, rinnovi e squalifiche.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="sg-dl-add">Nuova scadenza</button>' +
      (rows.length ? '<table class="es-ops-table"><thead><tr><th>Voce</th><th>Tipo</th><th>Data</th><th>Stato</th></tr></thead><tbody>' +
      rows.map(function (d) {
        return '<tr><td>' + esc(d.voce) + '</td><td>' + esc(d.tipo) + '</td><td>' + esc(d.data) + '</td><td>' + esc(d.stato) + '</td></tr>';
      }).join('') + '</tbody></table>' : emptyLine('Nessuna scadenza inserita.')));
  }
  function sgContracts() {
    var rows = seedContracts();
    return card('Gestore contratti & tesseramenti', 'Pratiche',
      '<p class="es-ops-lead">Elenco delle pratiche da preparare. Il deposito sui portali federali si fa dai portali ufficiali.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="sg-ct-add">Nuova pratica</button>' +
      '<div class="es-ops-list">' + (rows.length ? rows.map(function (c) {
        return '<article class="es-ops-item"><b>' + esc(c.nome) + '</b><p>' + esc(c.tipo) + ' · ' + esc(c.stato) + '</p></article>';
      }).join('') : emptyLine('Nessuna pratica inserita.')) + '</div>');
  }
  function sgArchivio() {
    return comingSoon('Archivio documentale cloud con firma digitale', 'Archivio unico per contratti, referti e comunicazioni federali, con versioni e permessi per ruolo.');
  }

  function eqRequests() {
    var rows = seedEqReq();
    return card('Canale diretto richieste materiali', 'Atleti & staff',
      '<p class="es-ops-lead">Segna le richieste di materiale e il loro stato.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="eq-req-add">Nuova richiesta</button>' +
      (rows.length ? rows.map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.voce) + '</b><p>' + esc(r.chi) + ' · ' + esc(r.stato) + '</p>' +
          '<button type="button" class="es-ops-btn" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="approvata">Approva</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="in lavorazione">In lavorazione</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="rifiutata">Rifiuta</button></article>';
      }).join('') : emptyLine('Nessuna richiesta.')));
  }
  function eqBudget() {
    var b = seedBudget();
    var spent = b.spese.reduce(function (a, x) { return a + (Number(x.importo) || 0); }, 0);
    if (!b.totale && !b.spese.length) {
      return card('Gestore budget & decurtazione spese', 'Da impostare',
        '<p class="es-ops-lead">Imposta il budget della stagione. Ogni acquisto che registri viene sottratto dal totale.</p>' +
        '<button type="button" class="es-ops-btn" data-club-ops="eq-budget-set">Imposta budget</button>');
    }
    return card('Gestore budget & decurtazione spese', 'Dai tuoi dati',
      '<p class="es-ops-lead">Ogni acquisto registrato viene sottratto dal totale.</p>' +
      '<div class="es-ops-kpis"><div><strong>' + euro(b.totale) + '</strong><span>Assegnato</span></div>' +
      '<div><strong>' + euro(spent) + '</strong><span>Speso</span></div>' +
      '<div><strong>' + euro(b.totale - spent) + '</strong><span>Residuo</span></div></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="eq-spend">Registra acquisto</button> ' +
      '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-budget-set">Modifica budget</button>' +
      '<ul class="es-ops-ul">' + b.spese.map(function (s) {
        return '<li>' + esc(s.voce) + ' — ' + euro(s.importo) + '</li>';
      }).join('') + '</ul>');
  }
  function eqAudit() {
    return comingSoon('Trasparenza & audit Presidenza', 'Vista in sola lettura di saldo e acquisti per Presidente e Direttore generale.');
  }
  function eqInv() {
    var rows = seedInv();
    return card('Inventario materiali', 'Giacenze e assegnazioni',
      '<p class="es-ops-lead">Segna giacenze e materiale assegnato.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="eq-inv-add">Aggiungi articolo</button>' +
      (rows.length ? '<table class="es-ops-table"><thead><tr><th>Articolo</th><th>Giacenza</th><th>Assegnati</th></tr></thead><tbody>' +
      rows.map(function (i) {
        return '<tr><td>' + esc(i.sku) + '</td><td>' + esc(i.q) + '</td><td>' + esc(i.assegnati) + '</td></tr>';
      }).join('') + '</tbody></table>' : emptyLine('Nessun articolo in inventario.')));
  }
  function eqMaint() {
    return comingSoon('Resi & manutenzioni programmate', 'Calendario di revisioni per borse mediche, lavaggi tecnici e scarpini, con avvisi oltre la soglia d’uso.');
  }

  function btVarchi() {
    return comingSoon('Dashboard pressione varchi & affluenza', 'Flusso degli spettatori ai tornelli. Si attiva quando lo stadio collega il sistema di controllo accessi.');
  }
  function btSlo() {
    var rows = seedSlo();
    return card('Portale comunicazione tifosi (SLO Hub)', 'Note',
      '<p class="es-ops-lead">Note su tifosi ospiti e locali per il giorno della gara.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="bt-slo">Nuova nota</button>' +
      (rows.length ? rows.map(function (r) {
        return '<div class="es-ops-item"><p>' + esc(r.nota) + '</p><span>' + esc(r.data || '') + '</span></div>';
      }).join('') : emptyLine('Nessuna nota.')));
  }
  function btTicket() {
    return comingSoon('Ticketing dinamico & antibagarinaggio', 'Biglietti nominativi con QR univoco e blocco dei trasferimenti sospetti.');
  }

  function prAcc() {
    var rows = seedAccrediti();
    return card('Accrediti media', 'Verifica · approvazione',
      '<p class="es-ops-lead">Richieste di accredito dei giornalisti.</p>' +
      (rows.length ? rows.map(function (a) {
        return '<article class="es-ops-item"><b>' + esc(a.nome) + '</b><p>Stato: ' + esc(a.stato) + '</p>' +
          '<button type="button" class="es-ops-btn" data-club-ops="pr-acc" data-id="' + esc(a.id) + '" data-st="approvato">Approva</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="pr-acc" data-id="' + esc(a.id) + '" data-st="rifiutato">Rifiuta</button></article>';
      }).join('') : emptyLine('Nessuna richiesta di accredito.')) +
      '<button type="button" class="es-ops-btn" data-club-ops="pr-acc-new">Nuova richiesta accredito</button>');
  }
  function prRassegna() {
    var rows = seedRassegna();
    return card('Rassegna stampa', 'Articoli sul club',
      '<p class="es-ops-lead">Raccogli gli articoli che parlano del club.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="pr-ras-add">Aggiungi articolo</button>' +
      (rows.length ? rows.map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.titolo) + '</b><p>' + esc(r.fonte) + '</p></article>';
      }).join('') : emptyLine('Nessun articolo salvato.')));
  }
  function prCal() {
    var rows = seedSlots();
    return card('Calendario editoriale', 'Uscite programmate',
      '<p class="es-ops-lead">Pianifica comunicati e post.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="pr-slot">Nuova uscita</button>' +
      (rows.length ? rows.map(function (r) {
        return '<div class="es-ops-item"><b>' + esc(r.quando) + '</b><p>' + esc(r.cosa) + '</p></div>';
      }).join('') : emptyLine('Nessuna uscita programmata.')));
  }

  function mkCrm() {
    var rows = seedCrm();
    return card('CRM commerciale', 'Sponsor e rinnovi',
      '<p class="es-ops-lead">Traccia trattative, contratti in essere e rinnovi.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="mk-lead">Nuovo contatto</button>' +
      (rows.length ? rows.map(function (c) {
        return '<article class="es-ops-item"><b>' + esc(c.brand) + '</b><p>' + esc(c.fase) + (c.valore ? ' · € ' + esc(c.valore) : '') + '</p></article>';
      }).join('') : emptyLine('Nessun contatto commerciale.')));
  }
  function mkStore() {
    return comingSoon('Analytics store & merchandising', 'Vendite e giacenze dello store. Si attiva collegando lo shop del club.');
  }
  function mkLoyalty() {
    return comingSoon('Loyalty program tifosi a punti', 'Acquisti, abbonamenti e presenze allo stadio diventano punti per premi e sconti.');
  }

  var MISSION = {
    tm: 'Punto di riferimento organizzativo della squadra: comunicazioni, logistica, materiali e presenze, perché ogni impegno agonistico si svolga senza intoppi.',
    yg: 'Pianifica e supervisiona la crescita tecnica, umana ed educativa dei giovani tesserati, costruendo il vivaio della società.',
    sg: 'Custode della conformità normativa e amministrativa del club verso Leghe e Federazione.',
    eq: 'Garante dell’efficienza logistica dei materiali tecnici da allenamento e da gara, budget compreso.',
    bt: 'Sovrintende alla vendita dei titoli d’accesso e cura le relazioni tra club e tifoseria organizzata/locale.',
    pr: 'Gestisce la comunicazione istituzionale e le relazioni del club con i mass media.',
    mk: 'Sviluppa le entrate del club con sponsorizzazioni, partnership e merchandising.'
  };

  function dashboard(attr, user) {
    var roleMap = { tm: 'Team manager', yg: 'Responsabile Settore Giovanile', sg: 'Segretario generale', eq: 'Magazziniere / Equipment Manager', bt: 'Responsabile biglietteria / SLO', pr: 'Ufficio stampa', mk: 'Marketing e commerciale' };
    var html = card('Ruolo & mission', 'Manuale club 09/2026', '<p class="es-ops-lead">' + esc(MISSION[attr] || '') + '</p>');
    if (attr === 'tm') html += tmKpi();
    if (attr === 'eq') html += eqBudget();
    html += anagraficaHtml(user, roleMap[attr]);
    return html;
  }

  function panel(attr, tab, user) {
    window.__clubOpsAttr = attr;
    user = user || userObj();
    if (tab === 'anagrafica') return anagraficaHtml(user, { tm: 'Team manager', yg: 'Responsabile Settore Giovanile', sg: 'Segretario generale', eq: 'Magazziniere', bt: 'Responsabile biglietteria / SLO', pr: 'Ufficio stampa', mk: 'Marketing e commerciale' }[attr]);
    if (attr === 'tm') {
      if (tab === 'broadcast') return tmBroadcast();
      if (tab === 'checklist') return tmChecklist();
      if (tab === 'logistica') return tmLogistica();
      if (tab === 'convenzioni') return comingSoon('Hub prenotazioni & convenzioni strutture', 'Ricerca e prenotazione di hotel, centri sportivi, ristoranti e vettori convenzionati, tariffe agevolate e fatturazione centralizzata. Predisposto per il rilascio in beta.');
      if (tab === 'kpi' || tab === 'radar') return tmKpi();
    }
    if (attr === 'yg') {
      if (tab === 'categorie' || tab === 'talent') return ygTalent();
      if (tab === 'promozioni' || tab === 'scoutingyg') return ygScout();
      if (tab === 'famiglie' || tab === 'libretto') return ygLibretto();
      if (tab === 'radar') return ygTalent();
    }
    if (attr === 'sg') {
      if (tab === 'scadenze') return sgDeadlines();
      if (tab === 'tesseramenti' || tab === 'pratiche') return sgContracts();
      if (tab === 'archivio' || tab === 'radar') return sgArchivio();
    }
    if (attr === 'eq') {
      if (tab === 'ordini' || tab === 'richieste') return eqRequests();
      if (tab === 'kit' || tab === 'budget') return eqBudget();
      if (tab === 'audit') return eqAudit();
      if (tab === 'inventario') return eqInv();
      if (tab === 'manutenzione' || tab === 'radar') return eqMaint();
    }
    if (attr === 'bt') {
      if (tab === 'vendite' || tab === 'varchi') return btVarchi();
      if (tab === 'slo') return btSlo();
      if (tab === 'settori' || tab === 'ticketing') return btTicket();
      if (tab === 'radar') return btVarchi();
    }
    if (attr === 'pr') {
      if (tab === 'accrediti') return prAcc();
      if (tab === 'social' || tab === 'rassegna') return prRassegna();
      if (tab === 'comunicati' || tab === 'calendario') return prCal();
      if (tab === 'radar') return prRassegna();
    }
    if (attr === 'mk') {
      if (tab === 'sponsor' || tab === 'crm') return mkCrm();
      if (tab === 'merch' || tab === 'store') return mkStore();
      if (tab === 'hospitality' || tab === 'loyalty') return mkLoyalty();
      if (tab === 'radar') return mkCrm();
    }
    return '';
  }

  function bindOnce() {
    if (window.__eliseeClubOpsBound) return;
    window.__eliseeClubOpsBound = true;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-club-ops]');
      if (!btn) return;
      var act = btn.getAttribute('data-club-ops');
      if (act === 'waitlist') {
        var wl = list('elisee_ops_waitlist');
        var mod = btn.getAttribute('data-mod') || 'modulo';
        if (wl.indexOf(mod) < 0) wl.push(mod);
        save('elisee_ops_waitlist', wl);
        toast('Interesse per «' + mod + '» annotato.', 'success');
        return;
      }
      if (act === 'tm-send') {
        var t = prompt('Titolo della comunicazione:');
        if (!t) return;
        var b = prompt('Testo del messaggio:') || '';
        var rows = seedBroadcast();
        rows.unshift({ id: 'b' + Date.now(), title: t, body: b, sent: new Date().toLocaleString('it-IT') });
        save('elisee_tm_broadcast', rows);
        toast('Comunicazione salvata su questo dispositivo.', 'success');
        rerender();
        return;
      }
      if (act === 'tm-check-toggle') {
        var packs = seedChecklist();
        var pid = btn.getAttribute('data-pid');
        var i = Number(btn.getAttribute('data-i'));
        packs.forEach(function (p) {
          if (p.id === pid && p.items[i]) p.items[i].done = !p.items[i].done;
        });
        save('elisee_tm_checklist', packs);
        rerender();
        return;
      }
      if (act === 'tm-check-add') {
        var ev = prompt('Nome evento (es. Gara di domenica):');
        if (!ev) return;
        var packs2 = seedChecklist();
        packs2.unshift({ id: 'c' + Date.now(), evento: ev, items: [
          { t: 'Convocazioni', done: false }, { t: 'Materiale', done: false }, { t: 'Trasporto', done: false }
        ]});
        save('elisee_tm_checklist', packs2);
        toast('Checklist creata.', 'success');
        rerender();
        return;
      }
      if (act === 'tm-calc') {
        var a = ((document.getElementById('es-ops-from') || {}).value || '').trim();
        var b2 = ((document.getElementById('es-ops-to') || {}).value || '').trim();
        var kmIn = Number(((document.getElementById('es-ops-km') || {}).value || '').replace(',', '.'));
        var ko = ((document.getElementById('es-ops-kick') || {}).value || '').trim();
        if (!a || !b2) { toast('Inserisci partenza e destinazione.', 'info'); return; }
        var km = kmIn > 0 ? kmIn : kmOf(a, b2);
        var out = document.getElementById('es-ops-trip-out');
        if (!km) {
          if (out) out.innerHTML = '<div class="es-ops-item"><p>Tratta non in elenco: scrivi i chilometri per calcolare i tempi.</p></div>';
          return;
        }
        var min = Math.round(km / 72 * 60) + 25;
        if (out) out.innerHTML = '<div class="es-ops-item"><b>' + esc(a) + ' → ' + esc(b2) + '</b>' +
          '<p>' + Math.round(km) + ' km · circa ' + min + ' min con margine. ' + (ko ? 'Gara alle ' + esc(ko) + '. ' : '') +
          'Partenza consigliata: almeno ' + Math.ceil(min / 60 + 1.5) + ' ore prima del fischio.</p></div>';
        return;
      }
      if (act === 'sg-dl-add') {
        var v = prompt('Voce scadenza:');
        if (!v) return;
        var dl = seedDeadlines();
        dl.unshift({ voce: v, tipo: prompt('Tipo (Sanitaria/Tesseramento/Disciplinare):', 'Tesseramento') || 'Tesseramento', data: prompt('Data (gg/mm/aaaa):') || '', stato: 'Aperta' });
        save('elisee_sg_deadlines', dl);
        toast('Scadenza inserita.', 'success');
        rerender();
        return;
      }
      if (act === 'sg-ct-add') {
        var cn = prompt('Nome tesserato o pratica:');
        if (!cn) return;
        var ct = seedContracts();
        ct.unshift({ nome: cn, tipo: prompt('Tipo di pratica:', 'Tesseramento') || 'Tesseramento', stato: 'Da preparare' });
        save('elisee_sg_contracts', ct);
        toast('Pratica inserita.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-req-add') {
        var rv = prompt('Materiale richiesto:');
        if (!rv) return;
        var rq = seedEqReq();
        rq.unshift({ id: 'r' + Date.now(), chi: prompt('Chi lo richiede:', 'Prima squadra') || '', voce: rv, stato: 'nuova' });
        save('elisee_eq_requests', rq);
        toast('Richiesta inserita.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-st') {
        var reqs = seedEqReq();
        var id = btn.getAttribute('data-id');
        var st = btn.getAttribute('data-st');
        reqs.forEach(function (r) { if (r.id === id) r.stato = st; });
        save('elisee_eq_requests', reqs);
        toast('Richiesta aggiornata: ' + st + '.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-budget-set') {
        var bs = seedBudget();
        var tot = Number(String(prompt('Budget della stagione (€):', bs.totale ? String(bs.totale) : '') || '').replace(/\./g, '').replace(',', '.'));
        if (!(tot >= 0)) return;
        bs.totale = tot;
        save('elisee_eq_budget', bs);
        toast('Budget salvato.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-spend') {
        var voce = prompt('Voce acquisto:');
        if (!voce) return;
        var imp = Number(String(prompt('Importo €:') || '').replace(',', '.'));
        if (!(imp > 0)) return;
        var bd = seedBudget();
        bd.spese.push({ voce: voce, importo: imp });
        save('elisee_eq_budget', bd);
        toast('Spesa sottratta dal budget.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-inv-add') {
        var sku = prompt('Articolo:');
        if (!sku) return;
        var inv = seedInv();
        inv.push({ sku: sku, q: Number(prompt('Quantità in magazzino:', '0')) || 0, assegnati: Number(prompt('Quantità assegnata:', '0')) || 0 });
        save('elisee_eq_inv', inv);
        toast('Articolo aggiunto.', 'success');
        rerender();
        return;
      }
      if (act === 'bt-slo') {
        var note = prompt('Nota:');
        if (!note) return;
        var slo = seedSlo();
        slo.unshift({ nota: note, data: new Date().toLocaleString('it-IT') });
        save('elisee_bt_slo', slo);
        toast('Nota salvata.', 'success');
        rerender();
        return;
      }
      if (act === 'pr-acc') {
        var acc = seedAccrediti();
        var aid = btn.getAttribute('data-id');
        var ast = btn.getAttribute('data-st');
        acc.forEach(function (a) { if (a.id === aid) a.stato = ast; });
        save('elisee_pr_acc', acc);
        toast('Accredito ' + ast + '.', 'success');
        rerender();
        return;
      }
      if (act === 'pr-acc-new') {
        var red = prompt('Testata / giornalista:');
        if (!red) return;
        var acc2 = seedAccrediti();
        acc2.unshift({ id: 'a' + Date.now(), nome: red, stato: 'in verifica' });
        save('elisee_pr_acc', acc2);
        toast('Richiesta di accredito inserita.', 'success');
        rerender();
        return;
      }
      if (act === 'pr-ras-add') {
        var tit = prompt('Titolo dell’articolo:');
        if (!tit) return;
        var ras = seedRassegna();
        ras.unshift({ titolo: tit, fonte: prompt('Testata:') || '' });
        save('elisee_pr_rassegna', ras);
        toast('Articolo salvato.', 'success');
        rerender();
        return;
      }
      if (act === 'pr-slot') {
        var q = prompt('Quando (es. 21/09 13:00):');
        if (!q) return;
        var sl = seedSlots();
        sl.unshift({ quando: q, cosa: prompt('Cosa esce:') || '' });
        save('elisee_pr_slots', sl);
        toast('Uscita inserita nel calendario.', 'success');
        rerender();
        return;
      }
      if (act === 'mk-lead') {
        var br = prompt('Brand / sponsor:');
        if (!br) return;
        var crm = seedCrm();
        crm.unshift({ brand: br, fase: 'Contatto', valore: prompt('Valore stimato € (facoltativo):') || '' });
        save('elisee_mk_crm', crm);
        toast('Contatto commerciale aggiunto.', 'success');
        rerender();
      }
    });
  }

  function rerender() {
    var panelEl = document.querySelector('.es-pro-panel:not([hidden])');
    var attr = window.__clubOpsAttr;
    if (panelEl && attr) {
      var tab = panelEl.getAttribute('data-pro-panel');
      var html = panel(attr, tab, userObj());
      if (html) panelEl.innerHTML = html;
      return;
    }
    document.dispatchEvent(new CustomEvent('elisee:roleChanged'));
  }

  bindOnce();
  window.EliseeClubOps = { panel: panel, dashboard: dashboard, anagraficaHtml: anagraficaHtml };
})();
