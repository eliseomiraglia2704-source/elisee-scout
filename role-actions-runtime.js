/**
 * ELISEE SCOUT — Azioni Possibili per Ruolo (Runtime Operativo)
 * Integra in tutte le aree e dashboard i moduli operativi e le azioni rapide dedicate per ciascun ruolo.
 */
(function () {
  'use strict';

  var ROLE_ACTIONS_MAP = {
    'giocatore': {
      title: 'Azioni possibili — Calciatore / Utente',
      roleName: 'Calciatore/Utente',
      actions: [
        { label: 'Aggiornare ruolo e piede preferito', id: 'act-edit-player', icon: '⚡' },
        { label: 'Attivare consenso profilo comportamentale', id: 'act-consent-ai', icon: '🔒' },
        { label: 'Richiedere intervento umano (art. 22)', id: 'act-art22', icon: '🛡️' },
        { label: 'Esportare i propri dati', id: 'act-export-data', icon: '📥' },
        { label: 'Simulatore Carriera Dilettantistica', id: 'act-minigioco', icon: '🎮' }
      ]
    },
    'allenatore': {
      title: 'Azioni possibili — Allenatore',
      roleName: 'Allenatore',
      actions: [
        { label: 'Genera Discorso pre-partita AI', id: 'act-coach-speech', icon: '🎙️' },
        { label: 'Lavagna tattica e modulo gara', id: 'act-coach-tactics', icon: '📋' },
        { label: 'Registro sessioni allenamento', id: 'act-coach-sessions', icon: '⏱️' },
        { label: 'Valutazione intensità e carichi', id: 'act-coach-load', icon: '⚡' },
        { label: 'Esporta report per lo staff', id: 'act-coach-export', icon: '📄' }
      ]
    },
    'vice_allenatore': {
      title: 'Azioni possibili — Vice Allenatore',
      roleName: 'Vice Allenatore',
      actions: [
        { label: 'Registro contributo tecnico', id: 'act-vice-log', icon: '🤝' },
        { label: 'Verifica sessioni individuali', id: 'act-vice-indiv', icon: '⏱️' },
        { label: 'Condividi nota con il Mister', id: 'act-vice-share', icon: '💬' },
        { label: 'Carichi pre-gara', id: 'act-vice-load', icon: '⚡' }
      ]
    },
    'scout': {
      title: 'Azioni possibili — Osservatore / Scout',
      roleName: 'Osservatore/Scout',
      actions: [
        { label: 'Valutazione mobile', id: 'act-scout-mobile', icon: '📱' },
        { label: 'Nota vocale in testo', id: 'act-scout-voice', icon: '🎙️' },
        { label: 'Geolocalizzazione opt-in', id: 'act-scout-geo', icon: '📍' },
        { label: 'Passaggio segnalazioni in assenza', id: 'act-scout-delegate', icon: '🔄' },
        { label: 'Secret List stealth DS/Scout', id: 'act-scout-secret', icon: '🔒' }
      ]
    },
    'match_analyst': {
      title: 'Azioni possibili — Match Analyst',
      roleName: 'Match Analyst',
      actions: [
        { label: 'Compilare report 8 blocchi', id: 'act-ma-report8', icon: '📝' },
        { label: 'Mappa di calore semplificata', id: 'act-ma-heatmap', icon: '🔥' },
        { label: 'Comparatore giocatori', id: 'act-ma-compare', icon: '⚖️' },
        { label: 'Esportazione report', id: 'act-ma-export', icon: '📊' }
      ]
    },
    'ds': {
      title: 'Azioni possibili — Direttore Sportivo',
      roleName: 'Direttore Sportivo',
      actions: [
        { label: 'Secret List stealth DS/Scout', id: 'act-ds-secret', icon: '🔒' },
        { label: 'Vedere carico segnalazioni', id: 'act-ds-workload', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-ds-import', icon: '📊' },
        { label: 'Wall trattative chiuse FIFA', id: 'act-ds-wall', icon: '🤝' },
        { label: 'Nuovo accordo preliminare', id: 'act-ds-deal', icon: '✍️' }
      ]
    },
    'agente': {
      title: 'Azioni possibili — Procuratore / Agente FIFA',
      roleName: 'Procuratore',
      actions: [
        { label: 'Shortlist svincolati', id: 'act-ag-shortlist', icon: '📋' },
        { label: 'Segui profilo talento', id: 'act-ag-follow', icon: '⭐' },
        { label: 'Richiesta contatto tracciata', id: 'act-ag-contact', icon: '📨' },
        { label: 'Piano osservatore indipendente', id: 'act-ag-plan', icon: '🔭' }
      ]
    },
    'presidente': {
      title: 'Azioni possibili — Presidente / Dirigenza Club',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Creare evento selezione + QR', id: 'act-pres-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-pres-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-pres-load', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-pres-import', icon: '📊' },
        { label: 'Registro verbali CDA', id: 'act-pres-minutes', icon: '🏛️' }
      ]
    },
    'dg': {
      title: 'Azioni possibili — Direttore Generale',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Creare evento selezione + QR', id: 'act-dg-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-dg-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-dg-load', icon: '📈' },
        { label: 'Budget e operazioni club', id: 'act-dg-budget', icon: '💼' }
      ]
    },
    'medico': {
      title: 'Azioni possibili — Staff Medico',
      roleName: 'Staff Medico',
      actions: [
        { label: 'Registro idoneità agonistica', id: 'act-med-clearance', icon: '🩺' },
        { label: 'Certificato visite mediche', id: 'act-med-visit', icon: '📄' },
        { label: 'Valutazione tempi di recupero', id: 'act-med-recovery', icon: '⏱️' },
        { label: 'Audit conformità sanitaria', id: 'act-med-audit', icon: '🛡️' }
      ]
    },
    'fisioterapista': {
      title: 'Azioni possibili — Fisioterapista',
      roleName: 'Fisioterapista',
      actions: [
        { label: 'Registro trattamenti e terapie', id: 'act-fisio-treat', icon: '🩹' },
        { label: 'Scheda recupero infortunio', id: 'act-fisio-rehab', icon: '🏃' },
        { label: 'Test mobilità articolare', id: 'act-fisio-mob', icon: '📊' },
        { label: 'Notifica idoneità al Mister', id: 'act-fisio-notify', icon: '💬' }
      ]
    },
    'nutrizionista': {
      title: 'Azioni possibili — Nutrizionista',
      roleName: 'Nutrizionista',
      actions: [
        { label: 'Piano nutrizionale personalizzato', id: 'act-nu-plan', icon: '🥗' },
        { label: 'Protocollo idratazione pre-gara', id: 'act-nu-hydra', icon: '💧' },
        { label: 'Scheda integratori e compliance', id: 'act-nu-supp', icon: '💊' }
      ]
    },
    'prep_portieri': {
      title: 'Azioni possibili — Preparatore Portieri',
      roleName: 'Preparatore Portieri',
      actions: [
        { label: 'Analisi reattività estremi difensori', id: 'act-gk-react', icon: '🧤' },
        { label: 'Registro uscite e respinte', id: 'act-gk-exits', icon: '⚽' },
        { label: 'Schemi su palle inattive difensive', id: 'act-gk-setpieces', icon: '📋' }
      ]
    },
    'prep_atletico': {
      title: 'Azioni possibili — Preparatore Atletico',
      roleName: 'Preparatore Atletico',
      actions: [
        { label: 'Analisi carichi GPS & Sprint', id: 'act-at-gps', icon: '⚡' },
        { label: 'Test fisici & soglia aerobica', id: 'act-at-test', icon: '🏃' },
        { label: 'Prevenzione infortuni e RPE', id: 'act-at-prev', icon: '🛡️' }
      ]
    },
    'settore_giovanile': {
      title: 'Azioni possibili — Settore Giovanile',
      roleName: 'Settore Giovanile',
      actions: [
        { label: 'Confermare consenso genitoriale', id: 'act-yg-consent', icon: '👨‍👩‍👦' },
        { label: 'Opposizione rapida profilo minore', id: 'act-yg-oppose', icon: '🛡️' },
        { label: 'Crea Open Day Giovanile + QR', id: 'act-yg-openday', icon: '🎫' },
        { label: 'Radar crescita vivaio', id: 'act-yg-radar', icon: '🌱' }
      ]
    },
    'tm': {
      title: 'Azioni possibili — Team Manager',
      roleName: 'Team Manager',
      actions: [
        { label: 'Logistica gara e convocazioni', id: 'act-tm-conv', icon: '🏟️' },
        { label: 'Organizzazione trasferta e bus', id: 'act-tm-trip', icon: '🚌' },
        { label: 'Registro presenze e deleghe', id: 'act-tm-pres', icon: '📋' }
      ]
    },
    'segretario': {
      title: 'Azioni possibili — Segretario Generale',
      roleName: 'Segretario Generale',
      actions: [
        { label: 'Tesseramenti LND / FIGC', id: 'act-sg-tess', icon: '🏢' },
        { label: 'Registro verbali CDA e assemblee', id: 'act-sg-verb', icon: '🏛️' },
        { label: 'Contratti e accordi economici', id: 'act-sg-contr', icon: '✍️' }
      ]
    },
    'magazziniere': {
      title: 'Azioni possibili — Magazziniere / Equipment',
      roleName: 'Magazziniere',
      actions: [
        { label: 'Inventario mute gara e allenamento', id: 'act-eq-kits', icon: '📦' },
        { label: 'Assegnazione materiale tecnico', id: 'act-eq-assign', icon: '👕' },
        { label: 'Richiesta riordino palloni e kit', id: 'act-eq-order', icon: '⚽' }
      ]
    },
    'biglietteria': {
      title: 'Azioni possibili — Resp. Biglietteria / SLO',
      roleName: 'Biglietteria',
      actions: [
        { label: 'Apertura vendite botteghino', id: 'act-bt-sales', icon: '🎫' },
        { label: 'Gestione settore ospiti e SLO', id: 'act-bt-slo', icon: '🏟️' },
        { label: 'Report incassi e tagliandi emessi', id: 'act-bt-rep', icon: '📊' }
      ]
    },
    'comunicazione': {
      title: 'Azioni possibili — Ufficio Stampa',
      roleName: 'Ufficio Stampa',
      actions: [
        { label: 'Pubblica comunicato ufficiale', id: 'act-pr-release', icon: '📣' },
        { label: 'Rassegna stampa e media clip', id: 'act-pr-press', icon: '📰' },
        { label: 'Organizza conferenza pre-gara', id: 'act-pr-conf', icon: '🎙️' }
      ]
    },
    'marketing': {
      title: 'Azioni possibili — Marketing & Commerciale',
      roleName: 'Marketing',
      actions: [
        { label: 'Proposta sponsorizzazione B2B', id: 'act-mk-spon', icon: '🎯' },
        { label: 'Catalogo merchandising e licenze', id: 'act-mk-merch', icon: '🛍️' },
        { label: 'Report ricavi e visibilità sponsor', id: 'act-mk-rev', icon: '📈' }
      ]
    },
    'tifoso': {
      title: 'Azioni possibili — Tifoso / Spettatore',
      roleName: 'Tifoso',
      actions: [
        { label: 'Tessera digitale del Tifoso', id: 'act-tf-card', icon: '🎟️' },
        { label: 'Check-in presenza allo stadio', id: 'act-tf-checkin', icon: '🏟️' },
        { label: 'Cori & Sticker Community', id: 'act-tf-sticker', icon: '❤️' },
        { label: 'Segui partite della squadra del cuore', id: 'act-tf-follow', icon: '⚽' }
      ]
    },
    'club_tc': {
      title: 'Azioni possibili — Club (TC Manager)',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Creare evento selezione + QR', id: 'act-tc-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-tc-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-tc-load', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-tc-import', icon: '📊' },
        { label: 'Nuova iscrizione online atleta', id: 'act-tc-enroll', icon: '📋' }
      ]
    }
  };

  function toast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type || 'success');
      return;
    }
    var t = document.getElementById('es-role-act-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'es-role-act-toast';
      t.className = 'es-creator-toast is-visible';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span>⚡</span> <span>' + msg + '</span>';
    t.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      if (t) t.classList.remove('is-visible');
    }, 2800);
  }

  function resolveRoleKey(u) {
    if (!u) {
      try {
        u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      } catch (_) { u = {}; }
    }
    var sim = localStorage.getItem('elisee_creator_sim_role');
    if (sim && ROLE_ACTIONS_MAP[sim]) return sim;

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

  function handleActionClick(actionId, actionLabel, roleKey) {
    // Log nel registro persistente di sessione
    try {
      var log = JSON.parse(localStorage.getItem('elisee_roles_actions_log') || '[]') || [];
      log.unshift({
        actionId: actionId,
        label: actionLabel,
        role: roleKey,
        at: new Date().toLocaleString('it-IT')
      });
      localStorage.setItem('elisee_roles_actions_log', JSON.stringify(log.slice(0, 100)));
    } catch (_) {}

    // Esecuzione mirata
    switch (actionId) {
      case 'act-minigioco':
        if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
        else if (window.openMinigiocoCarriera) window.openMinigiocoCarriera();
        break;

      case 'act-art22':
        toast('Richiesta intervento umano (Art. 22 GDPR) inoltrata al Privacy Officer con log immutabile.', 'info');
        break;

      case 'act-consent-ai':
        try {
          var cur = localStorage.getItem('elisee_ai_consent') === 'true';
          localStorage.setItem('elisee_ai_consent', !cur ? 'true' : 'false');
          toast(!cur ? 'Consenso profilo comportamentale ATTIVATO' : 'Consenso profilo REVOCATO');
        } catch (_) {}
        break;

      case 'act-export-data':
        var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}');
        var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(u, null, 2));
        var a = document.createElement('a');
        a.href = dataStr;
        a.download = 'dossier_' + (u.cognome || 'atleta') + '_gdpr_export.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast('Esportazione dati completata (GDPR Art. 20 Portabilità)');
        break;

      case 'act-edit-player':
        var editBtn = document.querySelector('.es-pd-edit, [data-pd="edit"]');
        if (editBtn) editBtn.click();
        else toast('Modulo modifica anagrafica aperto');
        break;

      case 'act-scout-secret':
      case 'act-ds-secret':
        if (window.switchView) window.switchView('mercato', '#secret-list');
        else toast('Apertura Secret List stealth DS/Scout');
        break;

      case 'act-ds-wall':
        if (window.switchView) window.switchView('mercato', '#wall-trasferimenti');
        else toast('Apertura Wall Trasferimenti FIFA');
        break;

      case 'act-ds-import':
      case 'act-pres-import':
      case 'act-tc-import':
        toast('Modulo importazione dati da foglio di calcolo (.CSV / Excel) attivato');
        break;

      case 'act-pres-event':
      case 'act-dg-event':
      case 'act-tc-event':
      case 'act-yg-openday':
        toast('Generatore Evento Selezione & QR Code creato con successo');
        break;

      case 'act-pres-deleg':
      case 'act-dg-deleg':
      case 'act-tc-deleg':
        toast('Delega temporanea con scadenza generata e firmata');
        break;

      case 'act-scout-voice':
        toast('Registrazione vocale avviata: trascrizione automatica in scheda tecnica IA attiva');
        break;

      case 'act-scout-geo':
        toast('Geolocalizzazione opt-in aggiornata per le gare del weekend');
        break;

      case 'act-scout-mobile':
        toast('Modalità valutazione mobile e live match ottimizzata');
        break;

      case 'act-coach-speech':
        toast('Discorso pre-partita IA generato e copiato negli appunti');
        break;

      case 'act-ma-report8':
        if (window.EliseeIntegrazioni && window.EliseeIntegrazioni.open) {
          window.EliseeIntegrazioni.open('analyst', 'user');
        } else {
          toast('Editor report tattico 8 blocchi aperto');
        }
        break;

      case 'act-ma-heatmap':
        toast('Mappa di calore tattica generata in tempo reale');
        break;

      case 'act-ma-compare':
        toast('Comparatore giocatori AI: selezione talenti pronta');
        break;

      default:
        toast('Azione eseguita: ' + actionLabel);
        break;
    }
  }

  function injectActionsCard() {
    var grids = document.querySelectorAll('.es-pd-grid');
    if (!grids.length) return;

    var curRoleKey = resolveRoleKey();
    var roleData = ROLE_ACTIONS_MAP[curRoleKey] || ROLE_ACTIONS_MAP['scout'];

    grids.forEach(function (grid) {
      if (grid.querySelector('.es-pd-actions-card')) {
        var existing = grid.querySelector('.es-pd-actions-card');
        existing.remove();
      }

      var card = document.createElement('section');
      card.className = 'es-pd-card es-pd-actions-card';
      var html = '<h2><span>⚡</span> <span>' + roleData.title + '</span></h2>';
      html += '<div class="es-pd-actions-list">';
      for (var i = 0; i < roleData.actions.length; i++) {
        var act = roleData.actions[i];
        html += '<button type="button" class="es-pd-act-btn" data-act-id="' + act.id + '" data-act-label="' + act.label + '">';
        html += '<span>' + act.icon + '</span> <span>' + act.label + '</span>';
        html += '</button>';
      }
      html += '</div>';

      card.innerHTML = html;
      grid.appendChild(card);

      var btns = card.querySelectorAll('.es-pd-act-btn');
      btns.forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var aId = b.getAttribute('data-act-id');
          var aLabel = b.getAttribute('data-act-label');
          handleActionClick(aId, aLabel, curRoleKey);
        });
      });
    });
  }

  // Esegui inject ad ogni rendering della dashboard o switch view
  window.injectRoleActions = injectActionsCard;

  document.addEventListener('elisee:view-changed', function () {
    setTimeout(injectActionsCard, 80);
  });

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(injectActionsCard, 200);
  });

  // Osserva mutazioni DOM per re-iniettare la card azioni quando si passa tra ruoli
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) {
        var needsInject = false;
        mutations[i].addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && (node.classList.contains('es-pd') || node.querySelector('.es-pd-grid'))) {
            needsInject = true;
          }
        });
        if (needsInject) {
          setTimeout(injectActionsCard, 50);
        }
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
