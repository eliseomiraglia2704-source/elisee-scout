/* ============================================================
   ELISEE SCOUT — AREA MATCH ANALYST
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

  function isMa(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /match analyst|video analyst/.test(blob);
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
    "prefix": "ma",
    "area": "Area Match Analyst",
    "roleLabel": "Match analyst",
    "infoClass": "analyst-info",
    "headerIco": "bars",
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
    "nextLabel": "Prossima gara da analizzare",
    "registerLabel": "Dati partita",
    "registerSub": "Si attiva con il calendario del club",
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "ico": "grid",
        "short": "",
        "kind": "soon"
      },
      {
        "id": "reports",
        "label": "Report partita",
        "ico": "file",
        "short": "I tuoi report",
        "kind": "notes",
        "title": "Report partita",
        "text": "Scrivi i report delle partite analizzate.",
        "storeKey": "elisee_ma_report_v2",
        "addLabel": "Salva report",
        "emptyText": "Nessun report salvato.",
        "fields": [
          {
            "k": "gara",
            "label": "Partita",
            "ph": "Es. Squadra A - Squadra B",
            "req": true,
            "long": false
          },
          {
            "k": "data",
            "label": "Data",
            "ph": "gg/mm/aaaa",
            "req": false,
            "long": false
          },
          {
            "k": "note",
            "label": "Analisi",
            "ph": "",
            "req": false,
            "long": true
          }
        ]
      },
      {
        "id": "clips",
        "label": "Clip video",
        "ico": "clock",
        "short": "Elenco delle clip",
        "kind": "notes",
        "title": "Clip video",
        "text": "Tieni l’elenco delle clip da mostrare allo staff (titolo, tema, link).",
        "storeKey": "elisee_ma_clip_v2",
        "addLabel": "Aggiungi clip",
        "emptyText": "Nessuna clip in elenco.",
        "fields": [
          {
            "k": "titolo",
            "label": "Titolo",
            "ph": "Es. Pressione alta",
            "req": true,
            "long": false
          },
          {
            "k": "tema",
            "label": "Tema",
            "ph": "Es. Fase difensiva",
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
        "id": "heatmap",
        "label": "Mappe di calore",
        "ico": "pulse",
        "short": "Posizioni in campo",
        "kind": "soon",
        "text": "Mappe di calore e posizioni medie dai dati di tracciamento.",
        "why": "Si attiva quando carichi i dati di tracciamento della partita."
      },
      {
        "id": "comparatore",
        "label": "Confronto calciatori",
        "ico": "bars",
        "short": "Confronto tra profili",
        "kind": "links",
        "text": "Confronta i profili pubblici dei calciatori dalla ricerca del sito.",
        "links": [
          {
            "label": "Apri la ricerca profili",
            "view": "scopri",
            "hash": "#scopri-profili"
          }
        ]
      },
      {
        "id": "canale_staff",
        "label": "Canale staff",
        "ico": "users",
        "short": "Messaggi con lo staff",
        "kind": "links",
        "text": "Scrivi allo staff con i messaggi del sito.",
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-mad');
  }

  function render(user) {
    user = user || userObj();
    if (!isMa(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-mad');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-mad';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-ma-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-ma-dash';
    document.body.classList.add('is-ma-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  window.EliseeMaDash = { render: render, isMa: isMa, inStaff: inStaff, underContract: inStaff, qualificaOf: qualificaOf };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try { var u = userObj(); if (isMa(u)) render(u); } catch (_) {}
    }
  });
  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try { var u = (d && d.user) || userObj(); if (isMa(u)) render(u); } catch (_) {}
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isMa()) setTimeout(render, 50);
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isMa()) setTimeout(render, 100);
  });
})();
