/**
 * ADMIN ONLY — Strumento di test interno, non visibile agli utenti standard.
 * ELISEE SCOUT — Simulatore Ruoli Creatore (Impersonate / Role QA Tool)
 * 
 * Riservato esclusivamente all'amministratore/creatore della piattaforma (Eliseo)
 * per entrare rapidamente nelle dashboard attive di ciascun ruolo a scopo di test,
 * QA, verifica funzionale e demo.
 */
(function () {
  'use strict';

  // Set di icone lineari outline SVG monocolore (stile minimale enterprise coerente con la piattaforma)
  var SVG_ICONS = {
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    coach: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    stopwatch: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M12 2v3"></path><path d="M18 5l-1.5 1.5"></path></svg>',
    activity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    briefcase: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    award: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    trending: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
    handshake: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5a3 3 0 0 1 0-4.24l1.41-1.41a3 3 0 0 1 4.24 0L14 8"></path><path d="M13 7l5 5a3 3 0 0 1 0 4.24l-1.41 1.41a3 3 0 0 1-4.24 0L10 16"></path></svg>',
    building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    sprout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M10 20c0-4 1-7 2-10"></path><path d="M12 10a5 5 0 0 1 5-5c0 3-2 5-5 5"></path><path d="M12 14a5 5 0 0 0-5-5c0 3 2 5 5 5"></path></svg>',
    fileText: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    package: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
    ticket: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    megaphone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
    target: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
    clipboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'
  };

  var ROLE_CATALOG = [
    {
      group: 'Atleti & Giocatori',
      iconSvg: SVG_ICONS.user,
      roles: [
        {
          key: 'giocatore',
          label: 'Calciatore / Giocatore',
          family: 'Giocatore',
          staffRole: '',
          iconSvg: SVG_ICONS.user,
          desc: 'Dashboard analitica v3.0, radar FIFA, performance e mercato'
        }
      ]
    },
    {
      group: 'Staff Tecnico',
      iconSvg: SVG_ICONS.coach,
      roles: [
        {
          key: 'allenatore',
          label: 'Allenatore',
          family: 'Staff',
          staffRole: 'Allenatore',
          iconSvg: SVG_ICONS.coach,
          desc: 'Discorso pre-partita, indice efficacia, lavagna e compliance'
        },
        {
          key: 'vice_allenatore',
          label: 'Vice Allenatore',
          family: 'Staff',
          staffRole: 'Allenatore in seconda',
          iconSvg: SVG_ICONS.users,
          desc: 'Contributo tecnico, registro sessioni e integrazione mister'
        },
        {
          key: 'scout',
          label: 'Scout / Osservatore',
          family: 'Staff',
          staffRole: 'Scout / Osservatore',
          iconSvg: SVG_ICONS.search,
          desc: 'Report scouting, Secret List stealth DS/Scout e radar talenti'
        },
        {
          key: 'match_analyst',
          label: 'Match Analyst',
          family: 'Staff',
          staffRole: 'Match analyst',
          iconSvg: SVG_ICONS.chart,
          desc: 'Video analisi, report tattico avversari e breakdown match'
        },
        {
          key: 'prep_portieri',
          label: 'Preparatore Portieri',
          family: 'Staff',
          staffRole: 'Preparatore dei portieri',
          iconSvg: SVG_ICONS.shield,
          desc: 'Analisi reattività estremi difensori, uscite e schemi'
        },
        {
          key: 'prep_atletico',
          label: 'Preparatore Atletico',
          family: 'Staff',
          staffRole: 'Preparatore atletico',
          iconSvg: SVG_ICONS.stopwatch,
          desc: 'Carichi GPS, test fisici, intensità e prevenzione carichi'
        }
      ]
    },
    {
      group: 'Staff Medico & Salute',
      iconSvg: SVG_ICONS.activity,
      roles: [
        {
          key: 'medico',
          label: 'Medico Sociale',
          family: 'Staff',
          staffRole: 'Medico sociale',
          iconSvg: SVG_ICONS.activity,
          desc: 'Registro sanitario, idoneità agonistica e visite mediche'
        },
        {
          key: 'fisioterapista',
          label: 'Fisioterapista',
          family: 'Staff',
          staffRole: 'Fisioterapista',
          iconSvg: SVG_ICONS.activity,
          desc: 'Registro trattamenti fisioterapici, terapie e recuperi'
        },
        {
          key: 'nutrizionista',
          label: 'Nutrizionista',
          family: 'Staff',
          staffRole: 'Nutrizionista',
          iconSvg: SVG_ICONS.activity,
          desc: 'Piani nutrizionali, idratazione gara e supplementi'
        }
      ]
    },
    {
      group: 'Dirigenza & Società',
      iconSvg: SVG_ICONS.building,
      roles: [
        {
          key: 'presidente',
          label: 'Presidente',
          family: 'Staff',
          staffRole: 'Presidente',
          iconSvg: SVG_ICONS.award,
          desc: 'Governance societaria, valore club, compliance e decisioni'
        },
        {
          key: 'dg',
          label: 'Direttore Generale',
          family: 'Staff',
          staffRole: 'Direttore generale',
          iconSvg: SVG_ICONS.briefcase,
          desc: 'Budget direzionale, operazioni, pianificazione e audit'
        },
        {
          key: 'ds',
          label: 'Direttore Sportivo (DS)',
          family: 'Staff',
          staffRole: 'Direttore sportivo',
          iconSvg: SVG_ICONS.trending,
          desc: 'Trattative mercato, Secret List stealth e valore rosa'
        },
        {
          key: 'agente',
          label: 'Procuratore / Agente FIFA',
          family: 'Staff',
          staffRole: 'Procuratore / Agente FIFA',
          iconSvg: SVG_ICONS.handshake,
          desc: 'Assistiti, mandati federali, rinnovi e clausole'
        },
        {
          key: 'tm',
          label: 'Team Manager',
          family: 'Staff',
          staffRole: 'Team manager',
          iconSvg: SVG_ICONS.clipboard,
          desc: 'Logistica gare, presenze, trasferte e coordinamento'
        },
        {
          key: 'settore_giovanile',
          label: 'Resp. Settore Giovanile',
          family: 'Staff',
          staffRole: 'Responsabile settore giovanile',
          iconSvg: SVG_ICONS.sprout,
          desc: 'Vivaio, sviluppo talenti, categorie giovanili e campus'
        },
        {
          key: 'segretario',
          label: 'Segretario Generale',
          family: 'Staff',
          staffRole: 'Segretario generale / Club Manager',
          iconSvg: SVG_ICONS.fileText,
          desc: 'Tesseramenti federali, verbali CDA e contratti'
        },
        {
          key: 'magazziniere',
          label: 'Magazziniere / Equipment',
          family: 'Staff',
          staffRole: 'Magazziniere / Equipment Manager',
          iconSvg: SVG_ICONS.package,
          desc: 'Kit gara, materiale tecnico, inventario e logistica magazzino'
        },
        {
          key: 'biglietteria',
          label: 'Resp. Biglietteria / SLO',
          family: 'Staff',
          staffRole: 'Responsabile biglietteria / tifoseria',
          iconSvg: SVG_ICONS.ticket,
          desc: 'Vendite botteghino, settore ospiti, fidelity e tifoseria'
        },
        {
          key: 'comunicazione',
          label: 'Ufficio Stampa',
          family: 'Staff',
          staffRole: 'Responsabile comunicazione / ufficio stampa',
          iconSvg: SVG_ICONS.megaphone,
          desc: 'Comunicati ufficiali, conferenze, rassegna stampa e media'
        },
        {
          key: 'marketing',
          label: 'Marketing & Commerciale',
          family: 'Staff',
          staffRole: 'Responsabile marketing / commerciale',
          iconSvg: SVG_ICONS.target,
          desc: 'Sponsorizzazioni, licensing, merchandising e revenue club'
        }
      ]
    },
    {
      group: 'Tifosi & Community',
      iconSvg: SVG_ICONS.heart,
      roles: [
        {
          key: 'tifoso',
          label: 'Tifoso / Spettatore',
          family: 'Tifoso',
          staffRole: '',
          iconSvg: SVG_ICONS.heart,
          desc: 'Passione, presenze stadio, cori, sticker e supporto club'
        }
      ]
    },
    {
      group: 'Società Sportiva',
      iconSvg: SVG_ICONS.shield,
      roles: [
        {
          key: 'club_tc',
          label: 'Club (Pannello Elisee Manager)',
          family: 'Società',
          staffRole: '',
          iconSvg: SVG_ICONS.shield,
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

  // Controllo severo dei permessi: accessibile solo dall'amministratore/creatore della piattaforma
  function isCreatorAdmin() {
    var u = getStoredUser();
    var email = String(u.email || localStorage.getItem('elisee_user_email') || '').toLowerCase().trim();
    return localStorage.getItem('elisee_admin_auth') === 'true' ||
           !!u.isCreator ||
           u.role === 'admin' ||
           u.siteRole === 'admin' ||
           /eliseomiraglia2704|admin@eliseescout\.it|elisee\.scout@platform-calcio\.it/.test(email);
  }

  function getActiveRoleInfo() {
    var u = getStoredUser();
    if (window.isTifosoSiteRole && window.isTifosoSiteRole(u)) return { label: 'Tifoso', key: 'tifoso', iconSvg: SVG_ICONS.heart };
    if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) return { label: 'Calciatore', key: 'giocatore', iconSvg: SVG_ICONS.user };
    if (u && (u.ruolo === 'Società' || u.role === 'Società' || u.siteRoleFamily === 'Società')) return { label: 'Club Elisee Manager', key: 'club_tc', iconSvg: SVG_ICONS.shield };
    var precise = String(u.staffRole || u.ruoloDettagliato || u.ruolo || u.role || 'Staff').trim();
    return { label: precise || 'Staff', key: 'staff', iconSvg: SVG_ICONS.briefcase };
  }

  function showToast(msg) {
    var toast = document.getElementById('es-creator-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'es-creator-toast';
      toast.className = 'es-creator-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span>' + SVG_ICONS.shield + '</span> <span>' + msg + '</span>';
    toast.classList.add('is-visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      if (toast) toast.classList.remove('is-visible');
    }, 2800);
  }

  function applyRole(roleKey) {
    if (!isCreatorAdmin()) {
      if (window.showToast) window.showToast('Accesso riservato all\'amministratore', 'warning');
      return;
    }

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

    // 1. Chiudi istanza del minigioco se aperta
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

    closeModal();
    showToast('Passato alla dashboard attiva: ' + targetRole.label);
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
              '<h2 id="es-creator-modal-title">Simulatore ruoli creatore</h2>' +
              '<p>Strumento interno riservato all\'amministratore — accesso rapido alle dashboard attive per test e verifica</p>' +
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
      html += '<div class="es-creator-category-title"><span>' + cat.iconSvg + '</span> <span>' + cat.group + '</span></div>';
      html += '<div class="es-creator-grid">';
      for (var j = 0; j < cat.roles.length; j++) {
        var r = cat.roles[j];
        var isCurrent = (curRole.label.toLowerCase() === r.label.toLowerCase()) || (r.staffRole && curRole.label.toLowerCase() === r.staffRole.toLowerCase());
        html += '<div class="es-creator-card' + (isCurrent ? ' is-active' : '') + '" data-role-key="' + r.key + '">';
        html += '<div class="es-creator-card-icon">' + r.iconSvg + '</div>';
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
    if (!isCreatorAdmin()) {
      if (window.showToast) window.showToast('Accesso riservato all\'amministratore', 'warning');
      return;
    }
    renderModal();
    var overlay = document.getElementById('es-creator-modal-overlay');
    if (overlay) overlay.classList.add('is-open');
  }

  function closeModal() {
    var overlay = document.getElementById('es-creator-modal-overlay');
    if (overlay) overlay.classList.remove('is-open');
  }

  // Esponi API globale (protetta da controllo admin)
  window.EliseeCreatorRole = {
    open: openModal,
    close: closeModal,
    setRole: applyRole,
    getCatalog: function () { return ROLE_CATALOG; },
    getActive: getActiveRoleInfo,
    isAdmin: isCreatorAdmin
  };
})();
