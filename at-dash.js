/* ============================================================
   ELISEE SCOUT — AREA PREPARATORE ATLETICO
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

  function isAt(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/portier/.test(blob)) return false;
    return /preparatore atletico|\batletico\b|\bperformance coach\b/.test(blob);
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
    "prefix": "at",
    "area": "Area Preparatore Atletico",
    "roleLabel": "Preparatore atletico",
    "infoClass": "coach-info",
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
    "nextLabel": "Prossima seduta",
    "registerLabel": "Carichi di lavoro",
    "registerSub": "Si attiva con i dati GPS della squadra",
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "ico": "grid",
        "short": "",
        "kind": "soon"
      },
      {
        "id": "gps",
        "label": "Carichi e GPS",
        "ico": "pulse",
        "short": "Carichi di lavoro della squadra",
        "kind": "soon",
        "text": "Carichi di allenamento e dati GPS dei calciatori, con rapporto carico acuto/cronico.",
        "why": "Riguarda dati fisici dei calciatori, spesso minori: si attiva con l’archivio squadra protetto, non nel browser."
      },
      {
        "id": "schede",
        "label": "Schede di lavoro",
        "ico": "file",
        "short": "Le tue sedute e i programmi",
        "kind": "notes",
        "title": "Schede di lavoro",
        "text": "Scrivi le tue sedute: forza, resistenza, riatletizzazione. Senza nomi di calciatori.",
        "storeKey": "elisee_at_schede_v2",
        "addLabel": "Salva scheda",
        "emptyText": "Nessuna scheda salvata.",
        "fields": [
          {
            "k": "titolo",
            "label": "Titolo",
            "ph": "Es. Forza arti inferiori",
            "req": true,
            "long": false
          },
          {
            "k": "focus",
            "label": "Obiettivo",
            "ph": "Es. Prevenzione",
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
        "id": "test",
        "label": "Test fisici",
        "ico": "bars",
        "short": "Test periodici della rosa",
        "kind": "soon",
        "text": "Test periodici (sprint, salto, Yo-Yo) dei calciatori.",
        "why": "Riguarda dati fisici dei calciatori, spesso minori: si attiva con l’archivio squadra protetto, non nel browser."
      },
      {
        "id": "canale",
        "label": "Canale staff",
        "ico": "users",
        "short": "Messaggi con lo staff",
        "kind": "links",
        "text": "Scrivi all’allenatore e allo staff con i messaggi del sito.",
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-atd');
  }

  function render(user) {
    user = user || userObj();
    if (!isAt(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-atd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-atd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-at-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-at-dash';
    document.body.classList.add('is-at-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  window.EliseeAtDash = { render: render, isAt: isAt, inStaff: inStaff, underContract: inStaff, qualificaOf: qualificaOf };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try { var u = userObj(); if (isAt(u)) render(u); } catch (_) {}
    }
  });
  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try { var u = (d && d.user) || userObj(); if (isAt(u)) render(u); } catch (_) {}
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isAt()) setTimeout(render, 50);
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isAt()) setTimeout(render, 100);
  });
})();
