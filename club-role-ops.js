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
    if (!c || /atalanta|carlentini/i.test(c)) return 'Foggia City';
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
    var tessera = user.tessera || user.nTessera || 'FIGC-' + String(100000 + (String(user.email || 'x').length * 7919) % 800000);
    var incarico = user.inizioIncarico || user.dataInizio || '01/07/2025';
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
        '<div><dt>Società</dt><dd>' + esc(clubOf(user)) + '</dd></div>' +
        '<div><dt>Data di nascita</dt><dd>' + esc(dob) + '</dd></div>' +
        '<div><dt>Email</dt><dd>' + esc(user.email || '—') + '</dd></div>' +
        '<div><dt>Telefono</dt><dd>' + esc(user.telefono || user.phone || '—') + '</dd></div>' +
        '<div><dt>Inizio incarico</dt><dd>' + esc(incarico) + '</dd></div>' +
        '<div><dt>Foto profilo</dt><dd>' + (ph ? 'Caricata' : 'Non caricata') + '</dd></div>' +
      '</dl></div>');
  }

  /* ---------- seeds ---------- */
  function seedBroadcast() {
    return load('elisee_tm_broadcast', [
      { id: 'b1', title: 'Convocazione gara 22/09', body: 'Raduno 14:00 · pullman cancello sud.', sent: '16/09/2026 18:40', ok: 22, wait: 2 },
      { id: 'b2', title: 'Cambio orario allenamento mercoledì', body: 'Seduta spostata alle 17:30 per impegni scuola-lavoro.', sent: '15/09/2026 09:12', ok: 24, wait: 0 }
    ]);
  }
  function seedChecklist() {
    return load('elisee_tm_checklist', [
      { id: 'c1', evento: 'Gara casalinga 22/09', items: [
        { t: 'Convocazioni inviate', done: true }, { t: 'Materiale magazzino firmato', done: true },
        { t: 'Pullman confermato 13:15', done: false }, { t: 'Acqua e kit fisioterapia', done: false },
        { t: 'Distinta gara al segretario', done: false }
      ]}
    ]);
  }
  function seedTalent() {
    return load('elisee_yg_talent', [
      { nome: 'L. Moretti', cat: 'U17', fis: 7.6, tat: 8.1, scu: 7.2, nota: 'Pronto per allenamenti con U19' },
      { nome: 'A. Greco', cat: 'U15', fis: 6.8, tat: 7.4, scu: 8.5, nota: 'Crescita tattica costante' },
      { nome: 'M. Lanza', cat: 'U19', fis: 8.2, tat: 7.9, scu: 6.4, nota: 'Monitoraggio monte-ore formativo' }
    ]);
  }
  function seedYouthScout() {
    return load('elisee_yg_scout', [
      { nome: 'K. Di Bari', eta: 16, ruolo: 'Trequartista', zona: 'Capitanata', idx: 86 },
      { nome: 'S. Leone', eta: 15, ruolo: 'Terzino', zona: 'Bari', idx: 81 }
    ]);
  }
  function seedDeadlines() {
    return load('elisee_sg_deadlines', [
      { voce: 'Visite mediche U19', tipo: 'Sanitaria', data: '28/09/2026', stato: 'In scadenza' },
      { voce: 'Rinnovo 3 svincoli LND', tipo: 'Tesseramento', data: '30/09/2026', stato: 'Aperta' },
      { voce: 'Squalifica 1 gara — n. 8', tipo: 'Disciplinare', data: '22/09/2026', stato: 'Attiva' }
    ]);
  }
  function seedContracts() {
    return load('elisee_sg_contracts', [
      { nome: 'M. Rossi', tipo: 'Tesseramento dilettante', stato: 'Da depositare' },
      { nome: 'A. Conte', tipo: 'Rinnovo co.co.co.', stato: 'Istruttoria' }
    ]);
  }
  function seedEqReq() {
    return load('elisee_eq_requests', [
      { id: 'r1', chi: 'Prima squadra', voce: 'Nuovo paio di scarpini — n. 11', stato: 'in lavorazione' },
      { id: 'r2', chi: 'Staff atletico', voce: 'Integrazione cunei e palloni', stato: 'nuova' }
    ]);
  }
  function seedBudget() {
    return load('elisee_eq_budget', { totale: 18000, spese: [
      { voce: 'Kit gara Nike', importo: 4200 }, { voce: 'Palloni ufficiali', importo: 860 }
    ]});
  }
  function seedInv() {
    return load('elisee_eq_inv', [
      { sku: 'KIT-HOME-M', q: 24, assegnati: 22 }, { sku: 'PALLONE-GARA', q: 18, assegnati: 12 }, { sku: 'BORSA-MED', q: 2, assegnati: 1 }
    ]);
  }
  function seedAccrediti() {
    return load('elisee_pr_acc', [
      { id: 'a1', nome: 'Redazione Tuttocampo', stato: 'in verifica' },
      { id: 'a2', nome: 'FoggiaToday', stato: 'approvato' }
    ]);
  }
  function seedRassegna() {
    return load('elisee_pr_rassegna', [
      { fonte: 'Tuttocampo', titolo: 'Foggia City, focus Under e mercato', tono: 'neutro' },
      { fonte: 'Corriere dello Sport', titolo: 'Dilettanti, i fuoriquota più richiesti', tono: 'positivo' }
    ]);
  }
  function seedCrm() {
    return load('elisee_mk_crm', [
      { brand: 'Acqua Santa Croce', fase: 'Rinnovo', valore: '28.000' },
      { brand: 'Banca Capitanata', fase: 'Trattativa', valore: '12.000' }
    ]);
  }
  function seedStore() {
    return load('elisee_mk_store', { venditeOggi: 14, stock: 312, campagna: 'Maglia home 26/27 · +18%' });
  }

  var KM = {
    'Foggia|Bari': 132, 'Foggia|Napoli': 185, 'Foggia|Roma': 365, 'Foggia|Campobasso': 98,
    'Foggia|Lecce': 178, 'Foggia|Pescara': 172, 'Foggia|Salerno': 155
  };
  function kmOf(a, b) {
    var k1 = a + '|' + b, k2 = b + '|' + a;
    if (KM[k1]) return KM[k1];
    if (KM[k2]) return KM[k2];
    return 80 + ((a.length + b.length) * 7) % 220;
  }

  function tmBroadcast() {
    var rows = seedBroadcast();
    return card('Hub comunicazioni di squadra', 'Broadcast & push',
      '<p class="es-ops-lead">Messaggi a tutta la rosa e allo staff, con conferme di lettura in tempo reale.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="tm-send">Nuovo broadcast</button>' +
      '<div class="es-ops-list">' + rows.map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.title) + '</b><p>' + esc(r.body) + '</p>' +
          '<span>Inviato ' + esc(r.sent) + ' · Confermati ' + r.ok + ' · In attesa ' + r.wait + '</span></article>';
      }).join('') + '</div>');
  }
  function tmChecklist() {
    var packs = seedChecklist();
    return card('Builder checklist matchday & eventi', 'Spunta progressiva',
      '<p class="es-ops-lead">Checklist digitali per orari, materiale, consegne e convocazioni.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="tm-check-add">Nuova checklist</button>' +
      packs.map(function (p) {
        var n = p.items.length, d = p.items.filter(function (i) { return i.done; }).length;
        return '<div class="es-ops-item"><b>' + esc(p.evento) + '</b> <span>' + d + '/' + n + ' completati</span>' +
          p.items.map(function (it, i) {
            return '<label class="es-ops-check"><input type="checkbox" ' + (it.done ? 'checked' : '') +
              ' data-club-ops="tm-check-toggle" data-pid="' + esc(p.id) + '" data-i="' + i + '"> ' + esc(it.t) + '</label>';
          }).join('') + '</div>';
      }).join(''));
  }
  function tmLogistica() {
    return card('Calcolatore logistico spostamenti', 'Itinerari & distanze',
      '<p class="es-ops-lead">Percorsi, chilometri, tempi stimati e orario consigliato di partenza per ogni trasferta.</p>' +
      '<div class="es-ops-form">' +
        '<input id="es-ops-from" value="Foggia" placeholder="Partenza">' +
        '<input id="es-ops-to" placeholder="Destinazione (es. Bari)">' +
        '<input id="es-ops-kick" placeholder="Kick-off (es. 15:00)">' +
        '<button type="button" class="es-ops-btn" data-club-ops="tm-calc">Calcola itinerario</button>' +
      '</div><div id="es-ops-trip-out"></div>');
  }
  function tmKpi() {
    var chk = seedChecklist();
    var items = (chk[0] && chk[0].items) || [];
    var pct = items.length ? Math.round(100 * items.filter(function (i) { return i.done; }).length / items.length) : 0;
    var bc = seedBroadcast();
    var conf = bc.length ? Math.round(100 * bc[0].ok / (bc[0].ok + bc[0].wait || 1)) : 0;
    return card('Dashboard KPI squadra', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Conferme di lettura, checklist in tempo e puntualità trasferte: colpo d’occhio settimanale.</p>' +
      '<div class="es-ops-kpis">' +
        '<div><strong>' + conf + '%</strong><span>Conferme broadcast</span></div>' +
        '<div><strong>' + pct + '%</strong><span>Checklist matchday</span></div>' +
        '<div><strong>94%</strong><span>Puntualità trasferte</span></div>' +
      '</div>');
  }

  function ygTalent() {
    return card('Academy Talent Tracker', 'Fisica · tattica · scolastica',
      '<p class="es-ops-lead">Matrice di maturazione dei giovani tesserati per il passaggio in Prima Squadra.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="yg-add">Aggiungi atleta</button>' +
      '<table class="es-ops-table"><thead><tr><th>Atleta</th><th>Cat.</th><th>Fisica</th><th>Tattica</th><th>Scolastica</th><th>Nota</th></tr></thead><tbody>' +
      seedTalent().map(function (t) {
        return '<tr><td>' + esc(t.nome) + '</td><td>' + esc(t.cat) + '</td><td>' + t.fis + '</td><td>' + t.tat + '</td><td>' + t.scu + '</td><td>' + esc(t.nota) + '</td></tr>';
      }).join('') + '</tbody></table>');
  }
  function ygScout() {
    return card('Piattaforma di scouting giovanile', 'Territorio',
      '<p class="es-ops-lead">Archivio e indice di crescita dei profili osservati sul territorio.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="yg-scout-add">Nuova segnalazione</button>' +
      '<div class="es-ops-list">' + seedYouthScout().map(function (s) {
        return '<article class="es-ops-item"><b>' + esc(s.nome) + '</b> · ' + esc(s.ruolo) + ' · ' + s.eta + ' anni' +
          '<p>' + esc(s.zona) + ' · Indice crescita ' + s.idx + '/100</p></article>';
      }).join('') + '</div>');
  }
  function ygLibretto() {
    return card('Percorso formativo & libretto elettronico', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Fascicolo digitale: percorso sportivo, rendimento scolastico, note tutor, colloqui scuola-famiglia-club e monte-ore formativo.</p>' +
      '<div class="es-ops-item"><b>L. Moretti · U17</b><p>Sportivo: 18 sedute / 2 gare. Scolastico: media 7.2. Tutor: colloquio 25/09. Monte-ore formativo: 86% — alert sotto soglia 80%.</p></div>' +
      '<div class="es-ops-item"><b>M. Lanza · U19</b><p>Sportivo: inserimenti in Prima. Scolastico: 6.4. Alert monte-ore formativo sotto controllo settimanale.</p></div>');
  }

  function sgDeadlines() {
    return card('Alert automatico scadenze', 'Visite · svincoli · rinnovi · squalifiche',
      '<p class="es-ops-lead">Avvisi su visite mediche, svincoli, rinnovi e squalifiche.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="sg-dl-add">Nuova scadenza</button>' +
      '<table class="es-ops-table"><thead><tr><th>Voce</th><th>Tipo</th><th>Data</th><th>Stato</th></tr></thead><tbody>' +
      seedDeadlines().map(function (d) {
        return '<tr><td>' + esc(d.voce) + '</td><td>' + esc(d.tipo) + '</td><td>' + esc(d.data) + '</td><td>' + esc(d.stato) + '</td></tr>';
      }).join('') + '</tbody></table>');
  }
  function sgContracts() {
    return card('Gestore contratti & tesseramenti', 'Portali federali',
      '<p class="es-ops-lead">Caricamento accordi e documentazione verso LND / FIGC.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="sg-ct-add">Nuova pratica</button>' +
      '<div class="es-ops-list">' + seedContracts().map(function (c) {
        return '<article class="es-ops-item"><b>' + esc(c.nome) + '</b><p>' + esc(c.tipo) + ' · ' + esc(c.stato) + '</p>' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="sg-deposit">Prepara deposito federale</button></article>';
      }).join('') + '</div>');
  }
  function sgArchivio() {
    return card('Archivio documentale cloud con firma digitale', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Repository unico per contratti, referti e comunicazioni federali, con versione e permessi per ruolo.</p>' +
      '<div class="es-ops-item"><b>Contratto_Rossi_2026.pdf</b><p>v3 · firmato digitalmente · visibile Segretario, DS, Presidente</p></div>' +
      '<div class="es-ops-item"><b>Idoneita_U19_lotto-B.pdf</b><p>v1 · in attesa firma medico sociale</p></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="sg-doc">Carica documento</button>');
  }

  function eqRequests() {
    return card('Canale diretto richieste materiali', 'Atleti & staff',
      '<p class="es-ops-lead">Ricezione in tempo reale. Approva, rifiuta o metti in lavorazione ogni voce.</p>' +
      seedEqReq().map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.voce) + '</b><p>' + esc(r.chi) + ' · ' + esc(r.stato) + '</p>' +
          '<button type="button" class="es-ops-btn" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="approvata">Approva</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="in lavorazione">In lavorazione</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-st" data-id="' + esc(r.id) + '" data-st="rifiutata">Rifiuta</button></article>';
      }).join(''));
  }
  function eqBudget() {
    var b = seedBudget();
    var spent = b.spese.reduce(function (a, x) { return a + x.importo; }, 0);
    var rest = b.totale - spent;
    return card('Gestore budget & decurtazione spese', 'Saldo in tempo reale',
      '<p class="es-ops-lead">Budget stagionale pre-caricato. Ogni acquisto approvato decade dal totale.</p>' +
      '<div class="es-ops-kpis"><div><strong>€ ' + b.totale.toLocaleString('it-IT') + '</strong><span>Assegnato</span></div>' +
      '<div><strong>€ ' + spent.toLocaleString('it-IT') + '</strong><span>Speso</span></div>' +
      '<div><strong>€ ' + rest.toLocaleString('it-IT') + '</strong><span>Residuo</span></div></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="eq-spend">Registra acquisto</button>' +
      '<ul class="es-ops-ul">' + b.spese.map(function (s) {
        return '<li>' + esc(s.voce) + ' — € ' + s.importo.toLocaleString('it-IT') + '</li>';
      }).join('') + '</ul>');
  }
  function eqAudit() {
    var b = seedBudget();
    var spent = b.spese.reduce(function (a, x) { return a + x.importo; }, 0);
    return card('Trasparenza & audit Presidenza', 'Sola lettura DG / Presidente',
      '<p class="es-ops-lead">Collegamento in sola lettura: saldo, storico acquisti, registro richieste tesserati e staff.</p>' +
      '<p>Residuo visibile: <b>€ ' + (b.totale - spent).toLocaleString('it-IT') + '</b></p>' +
      '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="eq-audit-open">Apri vista Presidenza</button>');
  }
  function eqInv() {
    return card('Inventario digitale RFID / barcode', 'Giacenze e assegnazioni',
      '<p class="es-ops-lead">Scansione rapida: giacenze, kit assegnati, riassortimenti prima dell’esaurimento.</p>' +
      '<table class="es-ops-table"><thead><tr><th>SKU</th><th>Giacenza</th><th>Assegnati</th></tr></thead><tbody>' +
      seedInv().map(function (i) {
        return '<tr><td>' + esc(i.sku) + '</td><td>' + i.q + '</td><td>' + i.assegnati + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<button type="button" class="es-ops-btn" data-club-ops="eq-scan">Simula scansione barcode</button>');
  }
  function eqMaint() {
    return card('Resi & manutenzioni programmate', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Calendario preventivo: borse mediche, lavaggi tecnici, scarpini. Alert oltre soglia d’uso.</p>' +
      '<div class="es-ops-item"><b>Borsa medica A</b><p>Revisione 20/09 · storico 3 interventi · soglia ok</p></div>' +
      '<div class="es-ops-item"><b>Kit home n. 9</b><p>Lavaggi 41 · alert sostituzione consigliata</p></div>');
  }

  function btVarchi() {
    return card('Dashboard pressione varchi & affluenza', 'Matchday',
      '<p class="es-ops-lead">Flusso spettatori ai tornelli in tempo reale.</p>' +
      '<div class="es-ops-kpis"><div><strong>1.842</strong><span>Ingressi</span></div>' +
      '<div><strong>68%</strong><span>Riempimento</span></div>' +
      '<div><strong>4 min</strong><span>Coda media sud</span></div></div>' +
      '<div class="es-ops-item"><b>Varco Sud</b><p>Alta pressione · steward 6/6</p></div>' +
      '<div class="es-ops-item"><b>Varco Ospiti</b><p>Flusso regolare · protocollo GOS ok</p></div>');
  }
  function btSlo() {
    return card('Portale comunicazione tifosi (SLO Hub)', 'Ospiti e fan locali',
      '<p class="es-ops-lead">Logistica tifosi ospiti e collegamento con autorità nel matchday.</p>' +
      '<div class="es-ops-item"><b>Tifoseria ospite</b><p>Settore distinti nord · 120 pax · pullman 14:40</p></div>' +
      '<div class="es-ops-item"><b>Gruppo locale</b><p>Coreografia pre-gara autorizzata · briefing steward 13:00</p></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="bt-slo">Nuova nota SLO</button>');
  }
  function btTicket() {
    return card('Ticketing dinamico & antibagarinaggio', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Biglietti nominativi con QR univoco, prezzo per settore/affluenza, blocco trasferimenti sospetti.</p>' +
      '<div class="es-ops-item"><b>Tribuna · QR-FC-2291</b><p>Nominativo · prezzo dinamico € 18 · trasferimento bloccato (secondary market)</p></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="bt-issue">Emetti titolo nominativo</button>');
  }

  function prAcc() {
    return card('Accrediti Media Express', 'Ricezione · verifica · approvazione',
      '<p class="es-ops-lead">Pass giornalisti: verifica e approvazione in un click.</p>' +
      seedAccrediti().map(function (a) {
        return '<article class="es-ops-item"><b>' + esc(a.nome) + '</b><p>Stato: ' + esc(a.stato) + '</p>' +
          '<button type="button" class="es-ops-btn" data-club-ops="pr-acc" data-id="' + esc(a.id) + '" data-st="approvato">Approva</button> ' +
          '<button type="button" class="es-ops-btn es-ops-btn-ghost" data-club-ops="pr-acc" data-id="' + esc(a.id) + '" data-st="rifiutato">Rifiuta</button></article>';
      }).join('') +
      '<button type="button" class="es-ops-btn" data-club-ops="pr-acc-new">Nuova richiesta accredito</button>');
  }
  function prRassegna() {
    return card('Rassegna stampa & monitoring', 'Web e carta',
      '<p class="es-ops-lead">Aggregazione automatica delle citazioni sul club.</p>' +
      seedRassegna().map(function (r) {
        return '<article class="es-ops-item"><b>' + esc(r.titolo) + '</b><p>' + esc(r.fonte) + ' · tono ' + esc(r.tono) + '</p></article>';
      }).join(''));
  }
  function prCal() {
    return card('Content calendar & social scheduler', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Calendario editoriale condiviso, pubblicazione programmata, alert sovrapposizioni.</p>' +
      '<div class="es-ops-item"><b>21/09 13:00</b><p>Conferenza pre-gara · canali: sito, social, WhatsApp staff</p></div>' +
      '<div class="es-ops-item"><b>22/09 18:30</b><p>Note gara · alert: non sovrapporre a comunicato merchandising</p></div>' +
      '<button type="button" class="es-ops-btn" data-club-ops="pr-slot">Nuovo slot editoriale</button>');
  }

  function mkCrm() {
    return card('CRM commerciale & lead generation', 'Sponsor e rinnovi',
      '<p class="es-ops-lead">Traccia trattative, contratti in essere e rinnovi.</p>' +
      '<button type="button" class="es-ops-btn" data-club-ops="mk-lead">Nuovo lead</button>' +
      seedCrm().map(function (c) {
        return '<article class="es-ops-item"><b>' + esc(c.brand) + '</b><p>' + esc(c.fase) + ' · € ' + esc(c.valore) + '</p></article>';
      }).join(''));
  }
  function mkStore() {
    var s = seedStore();
    return card('Analytics store & merchandising', 'Vendite e stock',
      '<p class="es-ops-lead">Vendite in tempo reale, giacenze store, resa campagne.</p>' +
      '<div class="es-ops-kpis"><div><strong>' + s.venditeOggi + '</strong><span>Vendite oggi</span></div>' +
      '<div><strong>' + s.stock + '</strong><span>Pezzi in stock</span></div>' +
      '<div><strong>Live</strong><span>' + esc(s.campagna) + '</span></div></div>');
  }
  function mkLoyalty() {
    return card('Loyalty program tifosi a punti', 'Proposta manuale — attiva',
      '<p class="es-ops-lead">Acquisti store, abbonamenti e matchday diventano punti per gadget, esperienze e sconti sponsor.</p>' +
      '<div class="es-ops-kpis"><div><strong>1.204</strong><span>Tifosi iscritti</span></div>' +
      '<div><strong>86k</strong><span>Punti emessi</span></div>' +
      '<div><strong>12</strong><span>Premi riscattati settimana</span></div></div>');
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
    if (attr === 'bt') html += btVarchi();
    if (attr === 'mk') html += mkStore();
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
        toast('Iscrizione alla lista d’attesa di «' + (btn.getAttribute('data-mod') || 'modulo') + '» registrata.', 'success');
        return;
      }
      if (act === 'tm-send') {
        var t = prompt('Titolo del broadcast:');
        if (!t) return;
        var b = prompt('Testo del messaggio:') || '';
        var rows = seedBroadcast();
        rows.unshift({ id: 'b' + Date.now(), title: t, body: b, sent: 'Ora', ok: 0, wait: 24 });
        save('elisee_tm_broadcast', rows);
        toast('Broadcast inviato alla rosa e allo staff.', 'success');
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
        var ev = prompt('Nome evento (es. Gara 29/09):');
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
        var a = ((document.getElementById('es-ops-from') || {}).value || 'Foggia').trim();
        var b2 = ((document.getElementById('es-ops-to') || {}).value || '').trim();
        var ko = ((document.getElementById('es-ops-kick') || {}).value || '15:00').trim();
        if (!b2) { toast('Inserisci la destinazione.', 'info'); return; }
        var km = kmOf(a, b2);
        var min = Math.round(km / 72 * 60) + 25;
        var out = document.getElementById('es-ops-trip-out');
        if (out) out.innerHTML = '<div class="es-ops-item"><b>' + esc(a) + ' → ' + esc(b2) + '</b>' +
          '<p>' + km + ' km · tempo stimato ' + min + ' min (incluso margine operativo). Kick-off ' + esc(ko) +
          '. Partenza consigliata: almeno ' + Math.ceil(min / 60 + 1.5) + ' ore prima del fischio.</p></div>';
        return;
      }
      if (act === 'yg-add') {
        var n = prompt('Nome atleta vivaio:');
        if (!n) return;
        var list = seedTalent();
        list.push({ nome: n, cat: prompt('Categoria:', 'U17') || 'U17', fis: 7, tat: 7, scu: 7, nota: 'Inserito da Academy Tracker' });
        save('elisee_yg_talent', list);
        toast('Atleta aggiunto al Talent Tracker.', 'success');
        rerender();
        return;
      }
      if (act === 'yg-scout-add') {
        var ns = prompt('Nome profilo osservato:');
        if (!ns) return;
        var ys = seedYouthScout();
        ys.unshift({ nome: ns, eta: 16, ruolo: prompt('Ruolo:', 'Centrocampista') || 'Centrocampista', zona: 'Capitanata', idx: 80 });
        save('elisee_yg_scout', ys);
        toast('Segnalazione archiviata.', 'success');
        rerender();
        return;
      }
      if (act === 'sg-dl-add') {
        var v = prompt('Voce scadenza:');
        if (!v) return;
        var dl = seedDeadlines();
        dl.unshift({ voce: v, tipo: prompt('Tipo (Sanitaria/Tesseramento/Disciplinare):', 'Tesseramento') || 'Tesseramento', data: prompt('Data:', '30/09/2026') || '', stato: 'Aperta' });
        save('elisee_sg_deadlines', dl);
        toast('Scadenza inserita. Alert attivo.', 'success');
        rerender();
        return;
      }
      if (act === 'sg-ct-add' || act === 'sg-deposit' || act === 'sg-doc') {
        toast(act === 'sg-doc' ? 'Documento versionato in archivio cloud.' : 'Pratica pronta per il deposito sui portali federali.', 'success');
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
      if (act === 'eq-spend') {
        var voce = prompt('Voce acquisto:');
        if (!voce) return;
        var imp = Number(prompt('Importo €:', '250') || 0);
        var bd = seedBudget();
        bd.spese.push({ voce: voce, importo: imp });
        save('elisee_eq_budget', bd);
        toast('Spesa decurtata dal budget.', 'success');
        rerender();
        return;
      }
      if (act === 'eq-scan') { toast('Scansione barcode registrata. Giacenza aggiornata.', 'success'); return; }
      if (act === 'eq-audit-open') { toast('Vista sola lettura disponibile per Presidenza e Direzione Generale.', 'info'); return; }
      if (act === 'bt-slo') {
        var note = prompt('Nota SLO:');
        if (note) toast('Nota SLO registrata.', 'success');
        return;
      }
      if (act === 'bt-issue') { toast('Titolo nominativo emesso con QR univoco.', 'success'); return; }
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
        toast('Richiesta accredito ricevuta.', 'success');
        rerender();
        return;
      }
      if (act === 'pr-slot') { toast('Slot editoriale inserito nel calendario. Alert sovrapposizioni attivo.', 'success'); return; }
      if (act === 'mk-lead') {
        var br = prompt('Brand / sponsor:');
        if (!br) return;
        var crm = seedCrm();
        crm.unshift({ brand: br, fase: 'Lead', valore: prompt('Valore stimato €:', '8000') || '0' });
        save('elisee_mk_crm', crm);
        toast('Lead commerciale aperto.', 'success');
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
