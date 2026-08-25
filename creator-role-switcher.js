/**
 * ELISEE SCOUT — Simulatore Ruoli Creatore
 * Consente al creatore del sito di passare istantaneamente da un ruolo all'altro
 * mostrando direttamente l'area registrata e attiva (dashboard, KPI, moduli e report).
 */
(function () {
  'use strict';

  var ROLE_CATALOG = [
    {
      group: 'Atleti & Giocatori',
      icon: '⚽',
      roles: [
        {
          key: 'giocatore',
          label: 'Calciatore / Giocatore',
          family: 'Giocatore',
          staffRole: '',
          icon: '🏃',
          desc: 'Dashboard analitica v3.0, radar FIFA, performance e mercato'
        }
      ]
    },
    {
      group: 'Staff Tecnico',
      icon: '📋',
      roles: [
        {
          key: 'allenatore',
          label: 'Allenatore',
          family: 'Staff',
          staffRole: 'Allenatore',
          icon: '👔',
          desc: 'Discorso pre-partita, indice efficacia, lavagna e compliance'
        },
        {
          key: 'vice_allenatore',
          label: 'Vice Allenatore',
          family: 'Staff',
          staffRole: 'Allenatore in seconda',
          icon: '🤝',
          desc: 'Contributo tecnico, registro sessioni e integrazione mister'
        },
        {
          key: 'scout',
          label: 'Scout / Osservatore',
          family: 'Staff',
          staffRole: 'Scout / Osservatore',
          icon: '🔭',
          desc: 'Report scouting, Secret List stealth DS/Scout e radar talenti'
        },
        {
          key: 'match_analyst',
          label: 'Match Analyst',
          family: 'Staff',
          staffRole: 'Match analyst',
          icon: '📊',
          desc: 'Video analisi, report tattico avversari e breakdown match'
        },
        {
          key: 'prep_portieri',
          label: 'Preparatore Portieri',
          family: 'Staff',
          staffRole: 'Preparatore dei portieri',
          icon: '🧤',
          desc: 'Analisi reattività estremi difensori, uscite e schemi'
        },
        {
          key: 'prep_atletico',
          label: 'Preparatore Atletico',
          family: 'Staff',
          staffRole: 'Preparatore atletico',
          icon: '⚡',
          desc: 'Carichi GPS, test fisici, intensità e prevenzione carichi'
        }
      ]
    },
    {
      group: 'Staff Medico & Salute',
      icon: '🏥',
      roles: [
        {
          key: 'medico',
          label: 'Medico Sociale',
          family: 'Staff',
          staffRole: 'Medico sociale',
          icon: '🩺',
          desc: 'Registro sanitario, idoneità agonistica e visite mediche'
        },
        {
          key: 'fisioterapista',
          label: 'Fisioterapista',
          family: 'Staff',
          staffRole: 'Fisioterapista',
          icon: '🩹',
          desc: 'Registro trattamenti fisioterapici, terapie e recuperi'
        },
        {
          key: 'nutrizionista',
          label: 'Nutrizionista',
          family: 'Staff',
          staffRole: 'Nutrizionista',
          icon: '🥗',
          desc: 'Piani nutrizionali, idratazione gara e supplementi'
        }
      ]
    },
    {
      group: 'Dirigenza & Società',
      icon: '🏛️',
      roles: [
        {
          key: 'presidente',
          label: 'Presidente',
          family: 'Staff',
          staffRole: 'Presidente',
          icon: '👑',
          desc: 'Governance societaria, valore club, compliance e decisioni'
        },
        {
          key: 'dg',
          label: 'Direttore Generale',
          family: 'Staff',
          staffRole: 'Direttore generale',
          icon: '💼',
          desc: 'Budget direzionale, operazioni, pianificazione e audit'
        },
        {
          key: 'ds',
          label: 'Direttore Sportivo (DS)',
          family: 'Staff',
          staffRole: 'Direttore sportivo',
          icon: '📈',
          desc: 'Trattative mercato, Secret List stealth e valore rosa'
        },
        {
          key: 'agente',
          label: 'Procuratore / Agente FIFA',
          family: 'Staff',
          staffRole: 'Procuratore / Agente FIFA',
          icon: '🤝',
          desc: 'Assistiti, mandati federali, rinnovi e clausole'
        },
        {
          key: 'tm',
          label: 'Team Manager',
          family: 'Staff',
          staffRole: 'Team manager',
          icon: '🏟️',
          desc: 'Logistica gare, presenze, trasferte e coordinamento'
        },
        {
          key: 'settore_giovanile',
          label: 'Resp. Settore Giovanile',
          family: 'Staff',
          staffRole: 'Responsabile settore giovanile',
          icon: '🌱',
          desc: 'Vivaio, sviluppo talenti, categorie giovanili e campus'
        },
        {
          key: 'segretario',
          label: 'Segretario Generale',
          family: 'Staff',
          staffRole: 'Segretario generale / Club Manager',
          icon: '🏢',
          desc: 'Tesseramenti federali, verbali CDA e contratti'
        },
        {
          key: 'magazziniere',
          label: 'Magazziniere / Equipment',
          family: 'Staff',
          staffRole: 'Magazziniere / Equipment Manager',
          icon: '📦',
          desc: 'Kit gara, materiale tecnico, inventario e logistica magazzino'
        },
        {
          key: 'biglietteria',
          label: 'Resp. Biglietteria / SLO',
          family: 'Staff',
          staffRole: 'Responsabile biglietteria / tifoseria',
          icon: '🎫',
          desc: 'Vendite botteghino, settore ospiti, fidelity e tifoseria'
        },
        {
          key: 'comunicazione',
          label: 'Ufficio Stampa',
          family: 'Staff',
          staffRole: 'Responsabile comunicazione / ufficio stampa',
          icon: '📣',
          desc: 'Comunicati ufficiali, conferenze, rassegna stampa e media'
        },
        {
          key: 'marketing',
          label: 'Marketing & Commerciale',
          family: 'Staff',
          staffRole: 'Responsabile marketing / commerciale',
          icon: '🎯',
          desc: 'Sponsorizzazioni, licensing, merchandising e revenue club'
        }
      ]
    },
    {
      group: 'Tifosi & Community',
      icon: '❤️',
      roles: [
        {
          key: 'tifoso',
          label: 'Tifoso / Spettatore',
          family: 'Tifoso',
          staffRole: '',
          icon: '🎟️',
          desc: 'Passione, presenze stadio, cori, sticker e supporto club'
        }
      ]
    },
    {
      group: 'Società Sportiva',
      icon: '🛡️',
      roles: [
        {
          key: 'club_tc',
          label: 'Club (Pannello Elisee Manager)',
          family: 'Società',
          staffRole: '',
          icon: '📋',
          desc: 'Iscrizioni online, quote, soci, presenze e verbali societari'
        }
      ]
    }
  ];

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function getActiveRoleInfo() {
    var u = getStoredUser();
    if (window.isTifosoSiteRole && window.isTifosoSiteRole(u)) return { label: 'Tifoso', key: 'tifoso', icon: '🎟️' };
    if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) return { label: 'Calciatore', key: 'giocatore', icon: '🏃' };
    if (u && (u.ruolo === 'Società' || u.role === 'Società' || u.siteRoleFamily === 'Società')) return { label: 'Club Elisee Manager', key: 'club_tc', icon: '🛡️' };
    var precise = String(u.staffRole || u.ruoloDettagliato || u.ruolo || u.role || 'Staff').trim();
    return { label: precise || 'Staff', key: 'staff', icon: '👔' };
  }

  function showToast(msg) {
    var toast = document.getElementById('es-creator-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'es-creator-toast';
      toast.className = 'es-creator-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span>⚡</span> <span>' + msg + '</span>';
    toast.classList.add('is-visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      if (toast) toast.classList.remove('is-visible');
    }, 2800);
  }

  function applyRole(roleKey) {
    var targetRole = null;
    for (var i = 0; i < ROLE_CATALOG.length; i++) {
      for (var j = 0; j < ROLE_CATALOG[i].roles.length; j++) {
        if (ROLE_CATALOG[i].roles[j].key === roleKey) {
          targetRole = ROLE_CATALOG[i].roles[j];
          break;
        }
      }
      if (targetRole) break;
    }
    if (!targetRole) return;

    var cur = getStoredUser();
    var nowIso = new Date().toISOString();

    // Costruiamo un profilo utente completo e attivo per Eliseo
    var updated = {
      id: cur.id || 'eliseo_creator',
      nome: cur.nome || 'Eliseo',
      cognome: cur.cognome || 'Miraglia',
      email: cur.email || 'eliseo.miraglia@eliseescout.it',
      username: cur.username || 'eliseo_miraglia',
      verified: true,
      antiFakeVerified: true,
      badgeVerificaStato: 'approved',
      docsAttachedAt: cur.docsAttachedAt || nowIso,
      badgeDocumentUrl: 'data:simulated/doc',
      badgeSelfieUrl: 'data:simulated/selfie',
      isCreator: true,
      sport: 'Calcio',
      squadraCuore: 'Atalanta',
      club: 'Atalanta',
      created_at: cur.created_at || nowIso,
      updated_at: nowIso
    };

    if (targetRole.key === 'club_tc') {
      updated.siteRoleFamily = 'Società';
      updated.ruolo = 'Società';
      updated.role = 'Società';
      updated.staffRole = '';
      updated.staffProfileComplete = true;
      updated.profileCompleted = true;
      updated.team = 'Atalanta';
    } else if (targetRole.key === 'giocatore') {
      updated.siteRoleFamily = 'Giocatore';
      updated.ruolo = 'Giocatore';
      updated.role = 'Giocatore';
      updated.staffRole = '';
      updated.ruoloDettagliato = 'Attaccante';
      updated.fieldRole = 'Attaccante';
      updated.staffProfileComplete = false;
      updated.profileCompleted = true;
      updated.pos = 10;
      updated.overall = 88;
      updated.pac = 86;
      updated.sho = 89;
      updated.pas = 84;
      updated.dri = 88;
      updated.def = 48;
      updated.phy = 78;
    } else if (targetRole.key === 'tifoso') {
      updated.siteRoleFamily = 'Tifoso';
      updated.ruolo = 'Tifoso';
      updated.role = 'Tifoso';
      updated.staffRole = '';
      updated.ruoloDettagliato = 'Tifoso';
      updated.staffProfileComplete = false;
      updated.profileCompleted = true;
    } else {
      // Qualsiasi ruolo di staff
      updated.siteRoleFamily = 'Staff';
      updated.ruolo = 'Staff';
      updated.role = 'Staff';
      updated.staffRole = targetRole.staffRole;
      updated.ruoloDettagliato = targetRole.staffRole;
      updated.staffProfileComplete = true;
      updated.profileCompleted = true;
      updated.licenza = targetRole.staffRole === 'Allenatore' ? 'UEFA Pro' : 'Federale';
      updated.anniEsperienza = '12';
    }

    // 1. Chiudi categoricamente qualsiasi istanza del minigioco aperta
    try {
      if (window.EliseeMinigioco && typeof window.EliseeMinigioco.close === 'function') {
        window.EliseeMinigioco.close();
      }
    } catch (_) {}
    try {
      sessionStorage.removeItem('elisee_auth_return');
      localStorage.removeItem('elisee_auth_return');
    } catch (_) {}
    var mgRoot = document.getElementById('es-mg-root');
    if (mgRoot) {
      mgRoot.classList.remove('is-open', 'open', 'active');
      mgRoot.setAttribute('hidden', '');
      mgRoot.style.setProperty('display', 'none', 'important');
    }
    document.documentElement.classList.remove('es-mg-open');
    document.body.classList.remove('es-mg-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // 2. Salvataggio localStorage unificato
    try {
      localStorage.setItem('elisee_active_user', JSON.stringify(updated));
      localStorage.setItem('elisee_user_data', JSON.stringify(updated));
      localStorage.setItem('elisee_user_auth', 'true');
      localStorage.setItem('elisee_creator_sim_role', roleKey);
    } catch (_) {}

    // 3. Sincronizza mappa identità staff/ruolo
    try {
      var identities = JSON.parse(localStorage.getItem('elisee_role_identity') || '{}') || {};
      var emKey = String(updated.email || updated.id || 'anon').trim().toLowerCase();
      identities[emKey] = {
        family: updated.siteRoleFamily,
        preciseRole: updated.staffRole || (updated.siteRoleFamily === 'Staff' ? targetRole.label : ''),
        sport: 'Calcio',
        complete: true
      };
      localStorage.setItem('elisee_role_identity', JSON.stringify(identities));
    } catch (_) {}

    // 4. Ripulisci classi contrastanti da #user-dossier-view-group
    var grp = document.getElementById('user-dossier-view-group');
    if (grp) {
      grp.className = '';
      grp.id = 'user-dossier-view-group';
      if (targetRole.key === 'giocatore') grp.classList.add('is-player-area');
      else if (targetRole.key === 'tifoso') grp.classList.add('is-tifoso-area');
      else if (targetRole.family === 'Staff') grp.classList.add('is-staff-area');
    }

    // 5. Aggiorna interfaccia utente
    if (typeof window.saveActiveUser === 'function') {
      window.saveActiveUser(updated);
    }
    if (typeof window.syncPlayerProfileView === 'function') {
      window.syncPlayerProfileView(updated);
    }
    if (typeof window.paintLoggedInUser === 'function') {
      window.paintLoggedInUser(updated);
    }

    function renderDirectDashboard(key, u) {
      if (typeof window.syncPlayerProfileView === 'function') {
        try { window.syncPlayerProfileView(u); } catch (_) {}
      }
      if (key === 'giocatore' && window.EliseePlayerDash && window.EliseePlayerDash.render) window.EliseePlayerDash.render(u);
      else if (key === 'allenatore' && window.EliseeCoachDash && window.EliseeCoachDash.render) window.EliseeCoachDash.render(u);
      else if (key === 'vice_allenatore' && window.EliseeViceDash && window.EliseeViceDash.render) window.EliseeViceDash.render(u);
      else if (key === 'scout' && window.EliseeObsDash && window.EliseeObsDash.render) window.EliseeObsDash.render(u);
      else if (key === 'match_analyst' && window.EliseeMaDash && window.EliseeMaDash.render) window.EliseeMaDash.render(u);
      else if (key === 'prep_portieri' && window.EliseeGkDash && window.EliseeGkDash.render) window.EliseeGkDash.render(u);
      else if (key === 'prep_atletico' && window.EliseeAtDash && window.EliseeAtDash.render) window.EliseeAtDash.render(u);
      else if (key === 'medico' && window.EliseeMedDash && window.EliseeMedDash.render) window.EliseeMedDash.render(u);
      else if (key === 'fisioterapista' && window.EliseeFisioDash && window.EliseeFisioDash.render) window.EliseeFisioDash.render(u);
      else if (key === 'nutrizionista' && window.EliseeNuDash && window.EliseeNuDash.render) window.EliseeNuDash.render(u);
      else if (key === 'presidente' && window.EliseePresDash && window.EliseePresDash.render) window.EliseePresDash.render(u);
      else if (key === 'dg' && window.EliseeDgDash && window.EliseeDgDash.render) window.EliseeDgDash.render(u);
      else if (key === 'ds' && window.EliseeDsDash && window.EliseeDsDash.render) window.EliseeDsDash.render(u);
      else if (key === 'agente' && window.EliseeAgDash && window.EliseeAgDash.render) window.EliseeAgDash.render(u);
      else if (key === 'tm' && window.EliseeTmDash && window.EliseeTmDash.render) window.EliseeTmDash.render(u);
      else if (key === 'settore_giovanile' && window.EliseeYgDash && window.EliseeYgDash.render) window.EliseeYgDash.render(u);
      else if (key === 'segretario' && window.EliseeSgDash && window.EliseeSgDash.render) window.EliseeSgDash.render(u);
      else if (key === 'magazziniere' && window.EliseeEqDash && window.EliseeEqDash.render) window.EliseeEqDash.render(u);
      else if (key === 'biglietteria' && window.EliseeBtDash && window.EliseeBtDash.render) window.EliseeBtDash.render(u);
      else if (key === 'comunicazione' && window.EliseePrDash && window.EliseePrDash.render) window.EliseePrDash.render(u);
      else if (key === 'marketing' && window.EliseeMkDash && window.EliseeMkDash.render) window.EliseeMkDash.render(u);
      else if (key === 'tifoso' && window.EliseeTifosoDash && window.EliseeTifosoDash.render) window.EliseeTifosoDash.render(u);
    }

    // 6. Navigazione mirata alla vista corretta
    if (targetRole.key === 'club_tc') {
      if (typeof window.switchView === 'function') window.switchView('tc', '#tc-portal');
      if (window.EliseeTC && window.EliseeTC.render) window.EliseeTC.render();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      if (typeof window.switchView === 'function') window.switchView('user-dossier', '#user-dossier-portal');
      renderDirectDashboard(targetRole.key, updated);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setTimeout(function () {
        renderDirectDashboard(targetRole.key, updated);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        var p = document.getElementById('user-dossier-portal');
        if (p) p.scrollTop = 0;
      }, 60);
    }

    updateTriggerLabel();
    closeModal();
    showToast('Passato all\'area attiva: ' + targetRole.label);
  }

  function updateTriggerLabel() {
    var info = getActiveRoleInfo();
    var labelEl = document.getElementById('es-creator-trigger-role');
    if (labelEl) labelEl.textContent = info.label;
  }

  function renderModal() {
    var overlay = document.getElementById('es-creator-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'es-creator-modal-overlay';
      overlay.className = 'es-creator-modal-overlay';
      overlay.innerHTML =
        '<div class="es-creator-modal" role="dialog" aria-modal="true" aria-labelledby="es-creator-modal-title">' +
          '<div class="es-creator-modal-head">' +
            '<div class="es-creator-modal-title-wrap">' +
              '<h2 id="es-creator-modal-title">⚡ Simulatore Ruoli Creatore</h2>' +
              '<p>Seleziona un ruolo per entrare subito nella sua dashboard attiva (post-registrazione)</p>' +
            '</div>' +
            '<button type="button" class="es-creator-modal-close" id="es-creator-modal-close" aria-label="Chiudi">&times;</button>' +
          '</div>' +
          '<div class="es-creator-modal-body" id="es-creator-modal-body"></div>' +
        '</div>';
      document.body.appendChild(overlay);

      var closeBtn = document.getElementById('es-creator-modal-close');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    var body = document.getElementById('es-creator-modal-body');
    if (!body) return;

    var curRole = getActiveRoleInfo();
    var html = '';

    for (var i = 0; i < ROLE_CATALOG.length; i++) {
      var cat = ROLE_CATALOG[i];
      html += '<div class="es-creator-category">';
      html += '<div class="es-creator-category-title"><span>' + cat.icon + '</span> <span>' + cat.group + '</span></div>';
      html += '<div class="es-creator-grid">';
      for (var j = 0; j < cat.roles.length; j++) {
        var r = cat.roles[j];
        var isCurrent = (curRole.label.toLowerCase() === r.label.toLowerCase()) || (r.staffRole && curRole.label.toLowerCase() === r.staffRole.toLowerCase());
        html += '<div class="es-creator-card' + (isCurrent ? ' is-active' : '') + '" data-role-key="' + r.key + '">';
        html += '<div class="es-creator-card-icon">' + r.icon + '</div>';
        html += '<div class="es-creator-card-info">';
        html += '<div class="es-creator-card-name">' + r.label + '</div>';
        html += '<div class="es-creator-card-desc">' + r.desc + '</div>';
        html += '</div>';
        if (isCurrent) {
          html += '<span class="es-creator-card-badge">Attivo</span>';
        }
        html += '</div>';
      }
      html += '</div>';
      html += '</div>';
    }

    body.innerHTML = html;

    var cards = body.querySelectorAll('.es-creator-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var k = card.getAttribute('data-role-key');
        if (k) applyRole(k);
      });
    });
  }

  function openModal() {
    renderModal();
    var overlay = document.getElementById('es-creator-modal-overlay');
    if (overlay) overlay.classList.add('is-open');
  }

  function closeModal() {
    var overlay = document.getElementById('es-creator-modal-overlay');
    if (overlay) overlay.classList.remove('is-open');
  }

  function initTrigger() {
    var trigger = document.getElementById('es-creator-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = 'es-creator-trigger';
      trigger.className = 'es-creator-trigger';
      trigger.setAttribute('title', 'Simulatore Ruoli Creatore — Clicca per cambiare ruolo');
      trigger.innerHTML =
        '<span class="es-creator-trigger-icon">⚡</span>' +
        '<span>Ruolo Creatore: <strong id="es-creator-trigger-role" class="es-creator-trigger-role">Caricamento...</strong></span>';
      document.body.appendChild(trigger);
      trigger.addEventListener('click', openModal);
    }
    updateTriggerLabel();
  }

  // Esponi API globale per il creatore
  window.EliseeCreatorRole = {
    open: openModal,
    close: closeModal,
    setRole: applyRole,
    getCatalog: function () { return ROLE_CATALOG; },
    getActive: getActiveRoleInfo
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrigger);
  } else {
    initTrigger();
  }
})();
