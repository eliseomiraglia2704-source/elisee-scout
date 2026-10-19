/* ============================================================
   ELISEE SCOUT — AREA MEDICO SOCIALE
   Mostra solo i dati del profilo. Le funzioni con dati sanitari dei tesserati
   restano "In arrivo": non si salvano nel browser (GDPR art. 9).
   Struttura comune: role-dash-honest.js
   ============================================================ */
(function () {
  'use strict';

  function userObj() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) { return {}; }
  }

  function isMedico(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /medico|sanitari|dottor|medico sociale|responsabile sanitario|medico dello sport/.test(blob);
  }

  var CFG = {
    "prefix": "med",
    "area": "Area Medico Sociale",
    "roleLabel": "Medico sociale",
    "infoClass": "doc-info",
    "headerIco": "pulse",
    "qualificaLabel": "Specializzazione",
    "qualificaKeys": [
      "medQualifica",
      "qualificaMedico",
      "certificazione",
      "staffProfile.licence"
    ],
    "alboLabel": "Iscrizione Ordine dei Medici",
    "alboKeys": [
      "albo",
      "iscrizioneAlbo",
      "ordineMedici"
    ],
    "nextLabel": "Prossima visita",
    "registerLabel": "Registro sanitario",
    "privacyNote": "I dati di salute dei calciatori sono dati particolari (GDPR art. 9) e spesso riguardano minori. Per questo non vengono salvati nel browser: il registro si attiva solo con l’archivio squadra protetto e con l’accesso limitato allo staff sanitario.",
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "ico": "grid",
        "short": "",
        "kind": "soon",
        "text": ""
      },
      {
        "id": "visite",
        "label": "Visite e controlli",
        "ico": "cal",
        "short": "Calendario visite",
        "kind": "soon",
        "text": "Calendario di visite e controlli periodici dei tesserati.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "infortuni",
        "label": "Infortuni e diagnosi",
        "ico": "pulse",
        "short": "Storico infortuni",
        "kind": "soon",
        "text": "Registro degli infortuni con diagnosi e tempi di recupero.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "idoneita",
        "label": "Idoneità agonistica",
        "ico": "shield",
        "short": "Scadenze dei certificati",
        "kind": "soon",
        "text": "Scadenze dei certificati di idoneità agonistica.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "prescrizioni",
        "label": "Prescrizioni e fisioterapia",
        "ico": "file",
        "short": "Indicazioni per il fisioterapista",
        "kind": "soon",
        "text": "Indicazioni al fisioterapista e piani di recupero.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "rtp",
        "label": "Ritorno in campo",
        "ico": "bars",
        "short": "Via libera al rientro",
        "kind": "soon",
        "text": "Valutazione e via libera al rientro in campo dopo un infortunio.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "canale",
        "label": "Canale staff",
        "ico": "users",
        "short": "Messaggi con lo staff",
        "kind": "soon",
        "text": "Messaggi con fisioterapista, preparatore e allenatore.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "impostazioni",
        "label": "Profilo e qualifiche",
        "ico": "gear",
        "short": "",
        "kind": "soon",
        "text": ""
      }
    ]
  };

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-md');
  }

  function renderHub(user) {
    user = user || userObj();
    if (!isMedico(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-md');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-md';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-med-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-med-dash';
    document.body.classList.add('is-med-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  function boot() {
    var u = userObj();
    if (!isMedico(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isMedico(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isMedico(u)) renderHub(u); });
  // syncPlayerProfileView (player-profile.js) cerca window.EliseeMedDash.
  window.EliseeMedDash = { render: renderHub, isMedico: isMedico };
  window.elisee_medHub = window.EliseeMedDash;
})();
