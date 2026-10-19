/* ============================================================
   ELISEE SCOUT — AREA OSSERVATORE / SCOUT
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

  function isObs(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/match analyst|video analyst/.test(blob) && !/\bosservatore\b/.test(blob) && !/scout\s*\/\s*osservatore/.test(blob)) return false;
    return /scout\s*\/\s*osservatore|\bosservatore\b|\bscout\b/.test(blob);
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
    "prefix": "obs",
    "area": "Area Osservatore",
    "roleLabel": "Scout / Osservatore",
    "infoClass": "scout-info",
    "headerIco": "star",
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
    "nextLabel": "Prossima gara da visionare",
    "registerLabel": "Osservazioni",
    "registerSub": "Le tue relazioni sono nella sezione Relazioni",
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "ico": "grid",
        "short": "",
        "kind": "soon"
      },
      {
        "id": "secret_list",
        "label": "Secret List",
        "ico": "star",
        "short": "Lista riservata dei profili seguiti",
        "kind": "links",
        "text": "La Secret List è riservata: i calciatori non ricevono notifiche. Si apre nell’Hub Mercato.",
        "links": [
          {
            "label": "Apri la Secret List",
            "fn": "openSecretList"
          },
          {
            "label": "Wall trasferimenti",
            "fn": "openTransferWall"
          }
        ]
      },
      {
        "id": "dossier",
        "label": "Relazioni",
        "ico": "file",
        "short": "Le tue relazioni sulle gare",
        "kind": "notes",
        "title": "Relazioni di osservazione",
        "text": "Scrivi le relazioni sulle gare visionate. Per i minorenni usa solo le iniziali.",
        "storeKey": "elisee_obs_relazioni_v2",
        "addLabel": "Salva relazione",
        "emptyText": "Nessuna relazione salvata.",
        "fields": [
          {
            "k": "profilo",
            "label": "Calciatore",
            "ph": "Nome o iniziali",
            "req": true,
            "long": false
          },
          {
            "k": "gara",
            "label": "Gara visionata",
            "ph": "Es. Squadra A - Squadra B",
            "req": false,
            "long": false
          },
          {
            "k": "note",
            "label": "Relazione",
            "ph": "",
            "req": false,
            "long": true
          }
        ]
      },
      {
        "id": "database",
        "label": "Ricerca profili",
        "ico": "users",
        "short": "Profili pubblici del sito",
        "kind": "links",
        "text": "Cerca i profili pubblici dei calciatori iscritti.",
        "links": [
          {
            "label": "Apri la ricerca profili",
            "view": "scopri",
            "hash": "#scopri-profili"
          }
        ]
      },
      {
        "id": "gare",
        "label": "Gare da visionare",
        "ico": "cal",
        "short": "Il tuo calendario",
        "kind": "notes",
        "title": "Gare da visionare",
        "text": "Segna le gare che vuoi andare a vedere.",
        "storeKey": "elisee_obs_gare_v2",
        "addLabel": "Aggiungi gara",
        "emptyText": "Nessuna gara in programma.",
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
            "label": "Data e ora",
            "ph": "gg/mm/aaaa 15:00",
            "req": false,
            "long": false
          },
          {
            "k": "luogo",
            "label": "Campo",
            "ph": "",
            "req": false,
            "long": false
          }
        ]
      },
      {
        "id": "canale_ds",
        "label": "Canale direttore sportivo",
        "ico": "users",
        "short": "Messaggi con il DS",
        "kind": "links",
        "text": "Scrivi al direttore sportivo con i messaggi del sito.",
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-od');
  }

  function render(user) {
    user = user || userObj();
    if (!isObs(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-od');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-od';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-obs-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-obs-dash';
    document.body.classList.add('is-obs-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  window.EliseeObsDash = { render: render, isObs: isObs, inStaff: inStaff, underContract: inStaff, qualificaOf: qualificaOf };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try { var u = userObj(); if (isObs(u)) render(u); } catch (_) {}
    }
  });
  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try { var u = (d && d.user) || userObj(); if (isObs(u)) render(u); } catch (_) {}
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isObs()) setTimeout(render, 50);
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isObs()) setTimeout(render, 100);
  });
})();
