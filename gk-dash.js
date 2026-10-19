/* ============================================================
   ELISEE SCOUT — AREA PREPARATORE PORTIERI
   Mostra solo i dati del profilo e gli appunti dell'utente (su questo dispositivo).
   Nessun dato inventato. Struttura comune: role-dash-honest.js
   ============================================================ */
(function () {
  'use strict';

  function userObj() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) { return {}; }
  }

  function isGk(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /portier|preparatore dei portieri|preparatore atletico dei portieri|allenatore dei portieri|gk/.test(blob);
  }

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.obsContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free agent' || st === 'free-agent' || st === 'indipendente') return false;
    if (st === 'contract' || st === 'under-contract') return true;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.qualifica || u.certificazione)) || '').trim();
  }

  var CFG = {
    "prefix": "gk",
    "area": "Area Preparatore Portieri",
    "roleLabel": "Preparatore dei portieri",
    "infoClass": "coach-info",
    "headerIco": "shield",
    "qualificaLabel": "Qualifica",
    "qualificaKeys": [
      "abilitazione",
      "qualifica",
      "certificazione",
      "staffProfile.licence"
    ],
    "alboLabel": "Tessera / matricola",
    "alboKeys": [
      "matricola",
      "tessera",
      "nTessera"
    ],
    "nextLabel": "Prossima seduta",
    "registerLabel": "Reparto portieri",
    "registerSub": "Si attiva con la rosa della squadra",
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "ico": "grid",
        "short": "",
        "kind": "soon"
      },
      {
        "id": "gk_room",
        "label": "Video briefing",
        "ico": "clock",
        "short": "Elenco dei video per i portieri",
        "kind": "notes",
        "title": "Video briefing",
        "text": "Tieni l’elenco dei video da rivedere con i portieri (titolo, tema, link).",
        "storeKey": "elisee_gk_video_v2",
        "addLabel": "Aggiungi video",
        "emptyText": "Nessun video in elenco.",
        "fields": [
          {
            "k": "titolo",
            "label": "Titolo",
            "ph": "Es. Uscite alte",
            "req": true,
            "long": false
          },
          {
            "k": "tema",
            "label": "Tema",
            "ph": "Es. 1 contro 1",
            "req": false,
            "long": false
          },
          {
            "k": "link",
            "label": "Link",
            "ph": "https://…",
            "req": false,
            "long": false
          }
        ]
      },
      {
        "id": "schede",
        "label": "Sedute tecniche",
        "ico": "file",
        "short": "Le tue sedute per i portieri",
        "kind": "notes",
        "title": "Sedute tecniche",
        "text": "Scrivi le sedute del reparto portieri.",
        "storeKey": "elisee_gk_sedute_v2",
        "addLabel": "Salva seduta",
        "emptyText": "Nessuna seduta salvata.",
        "fields": [
          {
            "k": "titolo",
            "label": "Titolo",
            "ph": "Es. Presa a terra",
            "req": true,
            "long": false
          },
          {
            "k": "focus",
            "label": "Focus",
            "ph": "Es. Reattività",
            "req": false,
            "long": false
          },
          {
            "k": "note",
            "label": "Esercizi e progressione",
            "ph": "",
            "req": false,
            "long": true
          }
        ]
      },
      {
        "id": "reattivita",
        "label": "Test e prestazioni",
        "ico": "bars",
        "short": "Test dei portieri",
        "kind": "soon",
        "text": "Test di reattività e statistiche dei portieri.",
        "why": "Riguarda dati fisici dei calciatori, spesso minori: si attiva con l’archivio squadra protetto, non nel browser."
      },
      {
        "id": "canale_mister",
        "label": "Canale allenatore",
        "ico": "users",
        "short": "Messaggi con l’allenatore",
        "kind": "links",
        "text": "Scrivi all’allenatore con i messaggi del sito.",
        "links": [
          {
            "label": "Apri i messaggi",
            "fn": "openUserMessages"
          }
        ]
      },
      {
        "id": "impostazioni",
        "label": "Profilo e qualifiche",
        "ico": "gear",
        "short": "",
        "kind": "soon"
      }
    ]
  };

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-gk');
  }

  function render(user) {
    user = user || userObj();
    if (!isGk(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-gk');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-gk';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-gk-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-gk-dash';
    document.body.classList.add('is-gk-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  window.EliseeGkDash = { render: render, isGk: isGk, inStaff: inStaff, underContract: inStaff, qualificaOf: qualificaOf };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try { var u = userObj(); if (isGk(u)) render(u); } catch (_) {}
    }
  });
  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try { var u = (d && d.user) || userObj(); if (isGk(u)) render(u); } catch (_) {}
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isGk()) setTimeout(render, 50);
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isGk()) setTimeout(render, 100);
  });
})();
