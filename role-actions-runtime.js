/**
 * ELISEE SCOUT — Azioni rapide per ruolo (riquadro nelle dashboard con .es-pd-grid).
 *
 * Ogni azione fa una cosa vera:
 * - go:    apre una sezione che esiste già nel sito;
 * - notes: modulo semplice salvato solo su questo dispositivo, con elenco e cancellazione;
 * - mail:  apre l'e-mail al supporto con l'oggetto già scritto;
 * - soon:  funzione non ancora disponibile, lo dice chiaramente.
 * Nessun dato precompilato. I dati sanitari non si salvano qui (servono archivi protetti).
 * Stili in role-actions.css. Testi tradotti da dash-i18n.js (radice #es-ra-modal).
 */
(function () {
  'use strict';

  var SUPPORT_MAIL = 'areaeliseescout@gmail.com';
  var SOON_HEALTH = 'In arrivo. I dati sanitari richiedono un archivio protetto, non questo dispositivo.';

  function f(k, label, type) { return { k: k, label: label, type: type || 'text' }; }
  function go(id, label, icon, desc, target) { return { id: id, label: label, icon: icon, desc: desc, kind: 'go', target: target }; }
  function notes(id, label, icon, desc, fields) { return { id: id, label: label, icon: icon, desc: desc, kind: 'notes', fields: fields }; }
  function soon(id, label, icon, desc) { return { id: id, label: label, icon: icon, desc: desc, kind: 'soon' }; }
  function mail(id, label, icon, desc, subject) { return { id: id, label: label, icon: icon, desc: desc, kind: 'mail', subject: subject }; }

  var A_SCHEDE = function (p) { return go('act-' + p + '-hub-schede', 'Schede tecniche', 'schede', 'Consulta e confronta le schede ricevute.', 'schede'); };
  var A_RECRUIT = function (p) { return go('act-' + p + '-recruit', 'Pubblica candidatura', 'recruit', 'Apri una posizione per giocatori o staff.', 'pubblica'); };
  var A_GUIDE = function (p) { return go('act-' + p + '-guide-pub', 'Guida: come pubblicare una candidatura', 'guide', 'Cosa scrivere nei due blocchi del modulo.', 'guida'); };
  var A_EVENT = function (p) {
    return notes('act-' + p + '-event', 'Eventi di selezione', 'event', 'Segna provini e open day del club.', [
      f('titolo', 'Titolo'), f('data', 'Data', 'date'), f('ora', 'Ora', 'time'), f('luogo', 'Luogo'), f('annate', 'Annate'), f('posti', 'Posti', 'number')
    ]);
  };
  var A_DELEG = function (p) {
    return notes('act-' + p + '-deleg', 'Deleghe con scadenza', 'time', 'Segna chi è delegato, per cosa e fino a quando.', [
      f('delegato', 'Delegato'), f('poteri', 'Per cosa'), f('scadenza', 'Scadenza', 'date')
    ]);
  };
  var A_VERBALI = function (p) {
    return notes('act-' + p + '-minutes', 'Registro verbali', 'doc', 'Numero, data e decisioni delle riunioni.', [
      f('numero', 'Numero verbale'), f('data', 'Data', 'date'), f('odg', 'Ordine del giorno', 'textarea'), f('esito', 'Esito')
    ]);
  };
  var A_LOAD = function (p) { return soon('act-' + p + '-load', 'Carico segnalazioni', 'chart', 'Si attiva quando ricevi segnalazioni dagli osservatori.'); };
  var A_IMPORT = function (p) { return soon('act-' + p + '-import', 'Import da foglio di calcolo', 'upload', 'Caricamento di file CSV ed Excel. In arrivo.'); };
  var A_DEAL = function (p) {
    return notes('act-' + p + '-deal', 'Accordi e contratti', 'edit', 'Segna controparte, scadenza e note degli accordi.', [
      f('controparte', 'Calciatore o club'), f('scadenza', 'Scadenza', 'date'), f('note', 'Note', 'textarea')
    ]);
  };

  var ROLE_ACTIONS_MAP = {
    giocatore: { title: 'Azioni possibili — Calciatore', actions: [
      go('act-edit-player', 'Aggiorna anagrafica e preferenze', 'edit', 'Apri il modulo del tuo profilo.', 'edit'),
      go('act-consent-ai', 'Consenso profilo comportamentale', 'lock', 'Attiva o revoca il consenso.', 'consent'),
      mail('act-art22', 'Chiedi una revisione umana (art. 22 GDPR)', 'shield', 'Si apre un’e-mail al supporto.', 'Richiesta di revisione umana (art. 22 GDPR)'),
      go('act-export-data', 'Scarica i tuoi dati (GDPR)', 'download', 'File con i dati del tuo profilo.', 'export'),
      go('act-minigioco', 'Minigioco carriera', 'activity', 'Apri il minigioco.', 'minigioco')
    ] },
    allenatore: { title: 'Azioni possibili — Allenatore', actions: [
      notes('act-coach-speech', 'Discorso pre-partita', 'voice', 'Scrivi e conserva i tuoi discorsi.', [f('partita', 'Partita'), f('testo', 'Testo', 'textarea')]),
      notes('act-coach-sessions', 'Sedute di allenamento', 'time', 'Data, tema e durata delle sedute.', [f('data', 'Data', 'date'), f('tema', 'Tema'), f('durata', 'Durata (minuti)', 'number'), f('note', 'Note', 'textarea')]),
      notes('act-coach-load', 'Carichi di lavoro', 'activity', 'Fatica percepita media (RPE) per seduta.', [f('data', 'Data', 'date'), f('rpe', 'RPE medio (1-10)', 'number'), f('note', 'Note', 'textarea')]),
      notes('act-coach-export', 'Note per lo staff', 'doc', 'Appunti da condividere con lo staff.', [f('titolo', 'Titolo'), f('testo', 'Testo', 'textarea')])
    ] },
    vice_allenatore: { title: 'Azioni possibili — Vice allenatore', actions: [
      notes('act-vice-log', 'Contributo tecnico', 'share', 'Reparto e lavoro svolto.', [f('data', 'Data', 'date'), f('reparto', 'Reparto'), f('note', 'Note', 'textarea')]),
      notes('act-vice-indiv', 'Sedute individuali', 'time', 'Lavoro personalizzato con un calciatore.', [f('data', 'Data', 'date'), f('calciatore', 'Calciatore'), f('obiettivo', 'Obiettivo'), f('esito', 'Esito')]),
      notes('act-vice-share', 'Nota per l’allenatore', 'share', 'Prepara la nota. L’invio diretto è in arrivo.', [f('oggetto', 'Oggetto'), f('testo', 'Testo', 'textarea')])
    ] },
    scout: { title: 'Azioni possibili — Osservatore', actions: [
      A_SCHEDE('scout'),
      notes('act-scout-mobile', 'Scheda partita', 'mobile', 'Appunti rapidi durante la gara.', [f('calciatore', 'Calciatore'), f('ruolo', 'Ruolo'), f('partita', 'Partita'), f('voto', 'Voto (1-10)', 'number'), f('note', 'Note', 'textarea')]),
      soon('act-scout-voice', 'Dettatura note vocali', 'voice', 'In arrivo.'),
      soon('act-scout-geo', 'Gare vicino a te', 'geo', 'In arrivo.'),
      notes('act-scout-delegate', 'Copertura in assenza', 'share', 'Chi segue le tue gare quando sei assente.', [f('collega', 'Collega'), f('dal', 'Dal', 'date'), f('al', 'Al', 'date'), f('partite', 'Partite', 'textarea')]),
      go('act-scout-secret', 'Secret List', 'lock', 'Lista riservata dei profili seguiti.', 'secret')
    ] },
    match_analyst: { title: 'Azioni possibili — Match analyst', actions: [
      A_SCHEDE('ma'),
      notes('act-ma-report8', 'Report partita', 'doc', 'Le fasi di gioco in un unico report.', [f('partita', 'Partita'), f('costruzione', 'Costruzione', 'textarea'), f('transizioni', 'Transizioni', 'textarea'), f('palle', 'Palle inattive', 'textarea'), f('note', 'Note', 'textarea')]),
      soon('act-ma-heatmap', 'Mappa di calore', 'chart', 'Si attiva quando carichi i dati di tracciamento della partita.'),
      soon('act-ma-compare', 'Confronto giocatori', 'chart', 'Si attiva con i dati delle partite.')
    ] },
    ds: { title: 'Azioni possibili — Direttore sportivo', actions: [
      A_SCHEDE('ds'), A_RECRUIT('ds'), A_GUIDE('ds'),
      go('act-ds-secret', 'Secret List', 'lock', 'Lista riservata dei profili seguiti.', 'secret'),
      go('act-ds-wall', 'Wall trattative chiuse', 'deal', 'Bacheca dei trasferimenti ufficializzati.', 'wall'),
      A_LOAD('ds'), A_IMPORT('ds'), A_DEAL('ds')
    ] },
    agente: { title: 'Azioni possibili — Procuratore', actions: [
      A_SCHEDE('ag'),
      notes('act-ag-shortlist', 'Shortlist svincolati', 'list', 'Calciatori senza contratto da proporre.', [f('nome', 'Nome'), f('ruolo', 'Ruolo'), f('anno', 'Anno di nascita', 'number'), f('note', 'Note', 'textarea')]),
      notes('act-ag-contact', 'Registro contatti', 'share', 'Club sentiti, referente ed esito.', [f('club', 'Club'), f('referente', 'Referente'), f('data', 'Data', 'date'), f('esito', 'Esito')]),
      notes('act-ag-plan', 'Gare da vedere', 'geo', 'Partite che vuoi andare a vedere.', [f('partita', 'Partita'), f('data', 'Data', 'date'), f('luogo', 'Luogo')])
    ] },
    presidente: { title: 'Azioni possibili — Presidente', actions: [
      A_SCHEDE('pres'), A_RECRUIT('pres'), A_GUIDE('pres'), A_EVENT('pres'), A_DELEG('pres'), A_VERBALI('pres'), A_LOAD('pres'), A_IMPORT('pres')
    ] },
    dg: { title: 'Azioni possibili — Direttore generale', actions: [
      A_SCHEDE('dg'), A_RECRUIT('dg'), A_GUIDE('dg'), A_EVENT('dg'), A_DELEG('dg'),
      notes('act-dg-budget', 'Budget e spese', 'chart', 'Voci di spesa e importi.', [f('voce', 'Voce'), f('importo', 'Importo (€)', 'number'), f('note', 'Note', 'textarea')]),
      A_LOAD('dg')
    ] },
    medico: { title: 'Azioni possibili — Staff medico', actions: [
      soon('act-med-clearance', 'Registro idoneità agonistica', 'shield', SOON_HEALTH),
      soon('act-med-visit', 'Visite mediche', 'doc', SOON_HEALTH),
      soon('act-med-recovery', 'Tempi di recupero', 'time', SOON_HEALTH)
    ] },
    fisioterapista: { title: 'Azioni possibili — Fisioterapista', actions: [
      soon('act-fisio-treat', 'Registro trattamenti', 'doc', SOON_HEALTH),
      soon('act-fisio-rehab', 'Scheda recupero infortunio', 'activity', SOON_HEALTH),
      soon('act-fisio-notify', 'Via libera al rientro', 'share', SOON_HEALTH)
    ] },
    nutrizionista: { title: 'Azioni possibili — Nutrizionista', actions: [
      soon('act-nu-plan', 'Piano nutrizionale', 'doc', SOON_HEALTH),
      soon('act-nu-hydra', 'Idratazione pre-gara', 'time', SOON_HEALTH)
    ] },
    prep_portieri: { title: 'Azioni possibili — Preparatore dei portieri', actions: [
      notes('act-gk-react', 'Test dei portieri', 'activity', 'Esercizio e risultato per portiere.', [f('data', 'Data', 'date'), f('portiere', 'Portiere'), f('esercizio', 'Esercizio'), f('esito', 'Esito')]),
      notes('act-gk-exits', 'Uscite e respinte', 'list', 'Appunti partita per partita.', [f('partita', 'Partita'), f('note', 'Note', 'textarea')]),
      notes('act-gk-setpieces', 'Palle inattive difensive', 'schede', 'Schemi su corner e punizioni.', [f('titolo', 'Titolo'), f('descrizione', 'Descrizione', 'textarea')])
    ] },
    prep_atletico: { title: 'Azioni possibili — Preparatore atletico', actions: [
      soon('act-at-gps', 'Dati GPS', 'activity', 'Si attiva con i dati GPS della squadra.'),
      notes('act-at-test', 'Test fisici', 'list', 'Test periodici e risultati.', [f('data', 'Data', 'date'), f('test', 'Test'), f('risultato', 'Risultato'), f('note', 'Note', 'textarea')]),
      notes('act-at-prev', 'Fatica percepita (RPE)', 'chart', 'RPE medio per seduta.', [f('data', 'Data', 'date'), f('rpe', 'RPE medio (1-10)', 'number'), f('note', 'Note', 'textarea')])
    ] },
    settore_giovanile: { title: 'Azioni possibili — Settore giovanile', actions: [
      A_SCHEDE('yg'), A_RECRUIT('yg'), A_GUIDE('yg'),
      mail('act-yg-consent', 'Verifica consenso dei genitori', 'shield', 'Si apre un’e-mail al supporto.', 'Verifica consenso genitoriale'),
      mail('act-yg-oppose', 'Oscura il profilo di un minore', 'shield', 'Si apre un’e-mail al supporto.', 'Richiesta di oscuramento profilo minore'),
      A_EVENT('yg'),
      soon('act-yg-radar', 'Crescita del vivaio', 'chart', 'Si attiva con i dati delle squadre giovanili.')
    ] },
    tm: { title: 'Azioni possibili — Team manager', actions: [
      notes('act-tm-conv', 'Convocazioni', 'list', 'Partita, ritrovo e convocati.', [f('partita', 'Partita'), f('data', 'Data', 'date'), f('ritrovo', 'Ritrovo'), f('convocati', 'Convocati', 'textarea')]),
      notes('act-tm-trip', 'Trasferte', 'geo', 'Destinazione, partenza e mezzo.', [f('destinazione', 'Destinazione'), f('partenza', 'Partenza'), f('mezzo', 'Mezzo'), f('note', 'Note', 'textarea')]),
      notes('act-tm-pres', 'Presenze', 'list', 'Presenti e assenti per giorno.', [f('data', 'Data', 'date'), f('presenti', 'Presenti', 'textarea'), f('assenti', 'Assenti', 'textarea')])
    ] },
    segretario: { title: 'Azioni possibili — Segretario generale', actions: [
      A_SCHEDE('sg'), A_RECRUIT('sg'), A_GUIDE('sg'),
      notes('act-sg-tess', 'Tesseramenti', 'doc', 'Pratiche in corso e stato.', [f('calciatore', 'Calciatore'), f('pratica', 'Tipo di pratica'), f('stato', 'Stato')]),
      A_VERBALI('sg'), A_DEAL('sg')
    ] },
    magazziniere: { title: 'Azioni possibili — Magazziniere', actions: [
      notes('act-eq-kits', 'Inventario', 'list', 'Articoli e quantità in magazzino.', [f('articolo', 'Articolo'), f('quantita', 'Quantità', 'number'), f('note', 'Note')]),
      notes('act-eq-assign', 'Materiale consegnato', 'share', 'Chi ha ricevuto cosa.', [f('calciatore', 'Calciatore'), f('materiale', 'Materiale'), f('data', 'Data', 'date')]),
      notes('act-eq-order', 'Riordini', 'upload', 'Articoli da riordinare.', [f('articolo', 'Articolo'), f('quantita', 'Quantità', 'number'), f('urgenza', 'Urgenza')])
    ] },
    biglietteria: { title: 'Azioni possibili — Biglietteria', actions: [
      notes('act-bt-sales', 'Prezzi dei biglietti', 'list', 'Prezzi per partita e settore.', [f('partita', 'Partita'), f('settore', 'Settore'), f('prezzo', 'Prezzo (€)', 'number')]),
      notes('act-bt-slo', 'Settore ospiti', 'shield', 'Capienza e note per la gara.', [f('partita', 'Partita'), f('capienza', 'Capienza', 'number'), f('note', 'Note', 'textarea')]),
      notes('act-bt-rep', 'Incassi', 'chart', 'Spettatori e incasso per partita.', [f('partita', 'Partita'), f('spettatori', 'Spettatori', 'number'), f('incasso', 'Incasso (€)', 'number')])
    ] },
    comunicazione: { title: 'Azioni possibili — Ufficio stampa', actions: [
      notes('act-pr-release', 'Bozze di comunicati', 'doc', 'Scrivi e conserva i comunicati.', [f('titolo', 'Titolo'), f('testo', 'Testo', 'textarea')]),
      notes('act-pr-press', 'Rassegna stampa', 'list', 'Articoli usciti sul club.', [f('testata', 'Testata'), f('titolo', 'Titolo'), f('link', 'Link', 'url')]),
      notes('act-pr-conf', 'Conferenze stampa', 'voice', 'Data, luogo e chi parla.', [f('data', 'Data', 'date'), f('luogo', 'Luogo'), f('intervenuti', 'Intervenuti')])
    ] },
    marketing: { title: 'Azioni possibili — Marketing', actions: [
      notes('act-mk-spon', 'Proposte sponsor', 'deal', 'Aziende contattate e stato.', [f('azienda', 'Azienda'), f('pacchetto', 'Pacchetto'), f('stato', 'Stato')]),
      notes('act-mk-merch', 'Merchandising', 'list', 'Articoli, prezzi e pezzi.', [f('articolo', 'Articolo'), f('prezzo', 'Prezzo (€)', 'number'), f('pezzi', 'Pezzi', 'number')]),
      notes('act-mk-rev', 'Ricavi', 'chart', 'Voci di ricavo e importi.', [f('voce', 'Voce'), f('importo', 'Importo (€)', 'number')])
    ] },
    tifoso: { title: 'Azioni possibili — Tifoso', actions: [
      soon('act-tf-card', 'Tessera digitale', 'doc', 'In arrivo.'),
      soon('act-tf-checkin', 'Presenze allo stadio', 'geo', 'In arrivo.'),
      soon('act-tf-follow', 'Segui la tua squadra', 'activity', 'In arrivo.')
    ] },
    giornalista: { title: 'Azioni possibili — Giornalista', actions: [
      go('act-gd-article', 'Scrivi un articolo', 'edit', 'Apri la tua area articoli.', 'giorn'),
      go('act-gd-poll', 'Apri un sondaggio', 'chart', 'Apri la tua area sondaggi.', 'giorn'),
      go('act-gd-video', 'Carica un video', 'upload', 'Apri la tua area video.', 'giorn'),
      go('act-gd-feed', 'Feed stampa', 'doc', 'Articoli pubblicati sul sito.', 'feed')
    ] },
    club_tc: { title: 'Azioni possibili — Club', actions: [
      A_SCHEDE('tc'), A_RECRUIT('tc'), A_GUIDE('tc'), A_EVENT('tc'), A_DELEG('tc'), A_LOAD('tc'), A_IMPORT('tc'),
      go('act-tc-enroll', 'Iscrizioni online', 'list', 'Apri il pannello del club.', 'tc')
    ] }
  };

  /* ---------- utilità ---------- */

  function toast(msg, type) {
    if (typeof window.showToast === 'function') window.showToast(msg, type || 'success');
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function activeUser() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }

  function notesKey() {
    var u = activeUser();
    return 'elisee_role_notes:' + String(u.email || 'anon').toLowerCase();
  }
  function readNotes(actionId) {
    try {
      var all = JSON.parse(localStorage.getItem(notesKey()) || '{}') || {};
      return Array.isArray(all[actionId]) ? all[actionId] : [];
    } catch (_) { return []; }
  }
  function writeNotes(actionId, list) {
    try {
      var all = JSON.parse(localStorage.getItem(notesKey()) || '{}') || {};
      all[actionId] = list.slice(0, 200);
      localStorage.setItem(notesKey(), JSON.stringify(all));
      return true;
    } catch (_) { return false; }
  }

  /* ---------- finestra ---------- */

  function closeModal() {
    var m = document.getElementById('es-ra-modal');
    if (m) m.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') closeModal(); }

  function openModal(title, bodyHtml) {
    closeModal();
    var bd = document.createElement('div');
    bd.id = 'es-ra-modal';
    bd.className = 'es-ra-backdrop';
    bd.innerHTML = '<div class="es-ra-box" role="dialog" aria-modal="true" aria-labelledby="es-ra-title">' +
      '<div class="es-ra-head"><h2 class="es-ra-h" id="es-ra-title">' + esc(title) + '</h2>' +
      '<button type="button" class="es-ra-x" aria-label="Chiudi" title="Chiudi">&times;</button></div>' +
      '<div class="es-ra-body">' + bodyHtml + '</div></div>';
    document.body.appendChild(bd);
    bd.addEventListener('click', function (e) { if (e.target === bd) closeModal(); });
    bd.querySelector('.es-ra-x').addEventListener('click', closeModal);
    document.addEventListener('keydown', onKey);
    var first = bd.querySelector('input, textarea, .es-ra-btn--primary') || bd.querySelector('.es-ra-x');
    try { first.focus(); } catch (_) {}
    return bd;
  }

  function fieldHtml(fd, actionId) {
    var id = 'es-ra-f-' + actionId + '-' + fd.k;
    var input = fd.type === 'textarea'
      ? '<textarea id="' + id + '" name="' + fd.k + '" rows="3"></textarea>'
      : '<input id="' + id + '" name="' + fd.k + '" type="' + fd.type + '"' + (fd.type === 'number' ? ' step="any" min="0"' : '') + '>';
    return '<div class="es-ra-field' + (fd.type === 'textarea' ? ' es-ra-field--full' : '') + '">' +
      '<label for="' + id + '">' + esc(fd.label) + '</label>' + input + '</div>';
  }

  function listHtml(act) {
    var items = readNotes(act.id);
    if (!items.length) return '<p class="es-ra-empty">Nessuna voce salvata.</p>';
    return items.map(function (it) {
      var rows = act.fields.map(function (fd) {
        var v = it.values && it.values[fd.k];
        if (v === undefined || v === null || String(v).trim() === '') return '';
        var val = fd.type === 'url' && /^https?:\/\//i.test(v)
          ? '<a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">' + esc(v) + '</a>'
          : esc(v);
        return '<div class="es-ra-row"><span class="es-ra-k">' + esc(fd.label) + '</span><span class="es-ra-v">' + val + '</span></div>';
      }).join('');
      return '<div class="es-ra-item"><div class="es-ra-item-main">' + rows + '</div>' +
        '<div class="es-ra-item-side"><span class="es-ra-date">' + esc(it.at || '') + '</span>' +
        '<button type="button" class="es-ra-del" data-ra-del="' + esc(it.id) + '">Elimina</button></div></div>';
    }).join('');
  }

  function openNotes(act) {
    var body = '<p class="es-ra-hint"><span>' + esc(act.desc) + '</span> <span>Salvato solo su questo dispositivo.</span></p>' +
      '<form class="es-ra-form" novalidate>' + act.fields.map(function (fd) { return fieldHtml(fd, act.id); }).join('') +
      '<div class="es-ra-form-foot"><button type="submit" class="es-ra-btn es-ra-btn--primary">Salva</button></div></form>' +
      '<h3 class="es-ra-sub">Voci salvate</h3><div class="es-ra-list">' + listHtml(act) + '</div>';
    var bd = openModal(act.label, body);
    var form = bd.querySelector('.es-ra-form');
    var list = bd.querySelector('.es-ra-list');

    function bindDel() {
      list.querySelectorAll('[data-ra-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-ra-del');
          writeNotes(act.id, readNotes(act.id).filter(function (x) { return x.id !== id; }));
          list.innerHTML = listHtml(act);
          bindDel();
          toast('Voce eliminata.', 'info');
        });
      });
    }
    bindDel();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {};
      var filled = false;
      act.fields.forEach(function (fd) {
        var el = form.querySelector('[name="' + fd.k + '"]');
        var v = el ? String(el.value || '').trim() : '';
        values[fd.k] = v;
        if (v) filled = true;
      });
      if (!filled) { toast('Compila almeno un campo.', 'error'); return; }
      var items = readNotes(act.id);
      items.unshift({ id: 'n' + Date.now().toString(36), at: new Date().toLocaleDateString('it-IT'), values: values });
      if (!writeNotes(act.id, items)) { toast('Salvataggio non riuscito su questo dispositivo.', 'error'); return; }
      form.reset();
      list.innerHTML = listHtml(act);
      bindDel();
      toast('Salvato su questo dispositivo.');
    });
  }

  function openSoon(act) {
    openModal(act.label, '<span class="es-ra-badge">In arrivo</span><p class="es-ra-hint">' + esc(act.desc) + '</p>');
  }

  function openGuide() {
    var body = '<p class="es-ra-hint">Il modulo «Pubblica candidatura» ha due blocchi. Compilali entrambi.</p>' +
      '<div class="es-ra-cols">' +
        '<div class="es-ra-col"><h3 class="es-ra-sub">1. Cosa offriamo</h3><ul class="es-ra-ul">' +
          '<li>Tipo di incarico: tesseramento, provino, staff, stage.</li>' +
          '<li>Rimborso o compenso, se previsto.</li>' +
          '<li>Durata: stagione, più stagioni o breve periodo.</li>' +
          '<li>Giorni e orari degli allenamenti.</li>' +
          '<li>Altro che offrite: kit, vitto, alloggio.</li>' +
        '</ul></div>' +
        '<div class="es-ra-col"><h3 class="es-ra-sub">2. Cosa richiediamo</h3><ul class="es-ra-ul">' +
          '<li>Ruolo in campo o nello staff.</li>' +
          '<li>Caratteristiche tecniche e fisiche.</li>' +
          '<li>Esperienza nella categoria.</li>' +
          '<li>Qualifiche e patentini, se servono.</li>' +
          '<li>Disponibilità e zona.</li>' +
        '</ul></div>' +
      '</div>' +
      '<p class="es-ra-hint">Se attivi «Selezione IA», i profili compatibili restano collegati all’annuncio.</p>' +
      '<div class="es-ra-form-foot"><button type="button" class="es-ra-btn es-ra-btn--primary" data-ra-open-pub>Apri il modulo</button></div>';
    var bd = openModal('Come pubblicare una candidatura', body);
    bd.querySelector('[data-ra-open-pub]').addEventListener('click', function () {
      closeModal();
      openPubblica();
    });
  }

  function openPubblica() {
    if (typeof window.openPubblicaAnnuncioModal === 'function') window.openPubblicaAnnuncioModal();
    else toast('Modulo non disponibile, riprova.', 'error');
  }

  function view(name, hash) {
    if (typeof window.switchView === 'function') { window.switchView(name, hash); return true; }
    toast('Sezione non disponibile, riprova.', 'error');
    return false;
  }

  function runGo(act) {
    switch (act.target) {
      case 'edit': {
        var editBtn = document.querySelector('.es-pd-edit, [data-pd="edit"]');
        if (editBtn) editBtn.click();
        else if (typeof window.openEditUserModal === 'function') window.openEditUserModal();
        break;
      }
      case 'consent':
        try {
          var cur = localStorage.getItem('elisee_ai_consent') === 'true';
          localStorage.setItem('elisee_ai_consent', !cur ? 'true' : 'false');
          toast(!cur ? 'Consenso profilo comportamentale attivato.' : 'Consenso profilo comportamentale revocato.');
        } catch (_) {}
        break;
      case 'export': {
        var u = activeUser();
        var blob = new Blob([JSON.stringify(u, null, 2)], { type: 'application/json;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'elisee-scout-dati-profilo.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast('File con i tuoi dati scaricato.');
        break;
      }
      case 'minigioco':
        if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
        else if (window.openMinigiocoCarriera) window.openMinigiocoCarriera();
        break;
      case 'schede': view('schede', '#schede-tecniche'); break;
      case 'pubblica': openPubblica(); break;
      case 'guida': openGuide(); break;
      case 'secret': view('mercato', '#secret-list'); break;
      case 'wall': view('mercato', '#wall-trasferimenti'); break;
      case 'tc': view('tc', '#tc-portal'); break;
      case 'giorn':
        if (window.EliseeGiornDash && window.EliseeGiornDash.render) window.EliseeGiornDash.render();
        else view('user-dossier', '#user-dossier-portal');
        break;
      case 'feed':
        if (window.openStampaFeed) window.openStampaFeed();
        else view('stampa', '#stampa-portal');
        break;
    }
  }

  function runAction(act) {
    if (act.kind === 'notes') openNotes(act);
    else if (act.kind === 'soon') openSoon(act);
    else if (act.kind === 'mail') {
      window.location.href = 'mailto:' + SUPPORT_MAIL + '?subject=' + encodeURIComponent(act.subject);
      toast('Si apre la tua app di posta.', 'info');
    } else runGo(act);
  }

  /* ---------- ruolo ---------- */

  function resolveRoleKey(u) {
    u = u || activeUser();
    var sim = null;
    try { sim = localStorage.getItem('elisee_creator_sim_role'); } catch (_) {}
    if (sim && ROLE_ACTIONS_MAP[sim]) return sim;

    if (window.isGiornalistaSiteRole && window.isGiornalistaSiteRole(u)) return 'giornalista';
    if (window.isTifosoSiteRole && window.isTifosoSiteRole(u)) return 'tifoso';
    if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) return 'giocatore';
    if (u && (u.ruolo === 'Società' || u.role === 'Società' || u.siteRoleFamily === 'Società')) return 'club_tc';

    var staff = String(u.staffRole || u.ruoloDettagliato || '').toLowerCase();
    if (staff.includes('osservatore') || staff.includes('scout')) return 'scout';
    if (staff.includes('match') || staff.includes('video analyst')) return 'match_analyst';
    if (staff.includes('seconda') || staff.includes('vice')) return 'vice_allenatore';
    if (staff.includes('allenatore')) return 'allenatore';
    if (staff.includes('sportivo')) return 'ds';
    if (staff.includes('procuratore') || staff.includes('agente')) return 'agente';
    if (staff.includes('presidente')) return 'presidente';
    if (staff.includes('generale') && staff.includes('direttore')) return 'dg';
    if (staff.includes('medico')) return 'medico';
    if (staff.includes('fisio')) return 'fisioterapista';
    if (staff.includes('nutri')) return 'nutrizionista';
    if (staff.includes('portieri')) return 'prep_portieri';
    if (staff.includes('atletico')) return 'prep_atletico';
    if (staff.includes('giovanile')) return 'settore_giovanile';
    if (staff.includes('team manager')) return 'tm';
    if (staff.includes('segretario')) return 'segretario';
    if (staff.includes('magazziniere')) return 'magazziniere';
    if (staff.includes('biglietteria')) return 'biglietteria';
    if (staff.includes('stampa') || staff.includes('comunicazione')) return 'comunicazione';
    if (staff.includes('marketing')) return 'marketing';
    return 'scout';
  }

  /* ---------- icone ---------- */

  var ICONS = {
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    voice: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
    schede: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    time: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mobile: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    geo: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    share: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    deal: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    recruit: '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    guide: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    event: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
  };
  function icon(name) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.time) + '</svg>';
  }

  var KIND_TAG = { soon: 'In arrivo', mail: 'E-mail' };

  /* ---------- riquadro ---------- */

  function injectActionsCard() {
    var grids = document.querySelectorAll('.es-pd-grid');
    if (!grids.length) return;
    var roleKey = resolveRoleKey();
    var roleData = ROLE_ACTIONS_MAP[roleKey] || ROLE_ACTIONS_MAP.scout;

    grids.forEach(function (grid) {
      var existing = grid.querySelector('.es-pd-actions-card');
      if (existing) existing.remove();

      var card = document.createElement('section');
      card.className = 'es-pd-card es-pd-actions-card es-ra-card';
      var html = '<div class="es-ra-card-head">' +
        '<div class="es-ra-card-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' +
        '<h2>' + esc(roleData.title) + '</h2></div>' +
        '<span class="es-ra-card-badge">Strumenti</span></div><div class="es-ra-grid">';
      roleData.actions.forEach(function (act) {
        html += '<button type="button" class="es-ra-act" data-act-id="' + esc(act.id) + '">' +
          '<span class="es-ra-ico">' + icon(act.icon) + '</span>' +
          '<span class="es-ra-txt"><span class="es-ra-label">' + esc(act.label) + '</span>' +
          '<span class="es-ra-desc">' + esc(act.desc) + '</span>' +
          (KIND_TAG[act.kind] ? '<span class="es-ra-tag">' + KIND_TAG[act.kind] + '</span>' : '') +
          '</span></button>';
      });
      html += '</div>';
      card.innerHTML = html;

      var slot = grid.querySelector('#es-pd-actions-slot') || document.getElementById('es-pd-actions-slot');
      (slot || grid).appendChild(card);

      card.querySelectorAll('.es-ra-act').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var id = b.getAttribute('data-act-id');
          var act = roleData.actions.filter(function (x) { return x.id === id; })[0];
          if (act) runAction(act);
        });
      });
    });
  }

  // Vecchi dati di esempio salvati dalla versione precedente: nessuno li legge più.
  try {
    ['elisee_medical_clearances_log', 'elisee_club_selection_events', 'elisee_roles_actions_log'].forEach(function (k) { localStorage.removeItem(k); });
  } catch (_) {}

  window.injectRoleActions = injectActionsCard;

  document.addEventListener('elisee:view-changed', function () { setTimeout(injectActionsCard, 80); });
  document.addEventListener('DOMContentLoaded', function () { setTimeout(injectActionsCard, 200); });

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType === 1 && !node.closest('.es-pd-actions-card') &&
            (node.classList.contains('es-pd') || node.querySelector('.es-pd-grid'))) {
          setTimeout(injectActionsCard, 50);
          return;
        }
      }
    }
  });
  function observe() { observer.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) observe();
  else document.addEventListener('DOMContentLoaded', observe);
})();
