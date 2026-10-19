/* ============================================================
   ELISEE SCOUT — AREA NUTRIZIONISTA
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

  function isNutrizionista(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /nutri|diet|dietista|biologo nutrizionista/.test(blob);
  }

  var CFG = {
    "prefix": "med",
    "area": "Area Nutrizionista",
    "roleLabel": "Nutrizionista",
    "infoClass": "doc-info",
    "headerIco": "apple",
    "qualificaLabel": "Qualifica",
    "qualificaKeys": [
      "nuQualifica",
      "qualificaNutri",
      "certificazione",
      "staffProfile.licence"
    ],
    "alboLabel": "Iscrizione albo",
    "alboKeys": [
      "albo",
      "iscrizioneAlbo",
      "nuAlbo"
    ],
    "nextLabel": "Prossimo colloquio",
    "registerLabel": "Piani nutrizionali",
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
        "id": "piani",
        "label": "Piani nutrizionali",
        "ico": "file",
        "short": "Piani per atleta",
        "kind": "soon",
        "text": "Piani alimentari personalizzati per ogni atleta.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "composizione",
        "label": "Composizione corporea",
        "ico": "bars",
        "short": "Misure e BIA",
        "kind": "soon",
        "text": "Misure di composizione corporea (BIA, plicometria) nel tempo.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "integrazione",
        "label": "Integrazione",
        "ico": "star",
        "short": "Integratori e controlli antidoping",
        "kind": "soon",
        "text": "Integratori usati dagli atleti, con verifica sulla lista delle sostanze vietate.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "trasferte",
        "label": "Trasferte e ritiri",
        "ico": "plane",
        "short": "Pasti in trasferta",
        "kind": "soon",
        "text": "Organizzazione dei pasti in trasferta e durante i ritiri.",
        "why": "Si attiva con il calendario del club."
      },
      {
        "id": "canale",
        "label": "Canale staff",
        "ico": "users",
        "short": "Messaggi con lo staff",
        "kind": "soon",
        "text": "Messaggi con medico, preparatore e allenatore.",
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-nu');
  }

  function renderHub(user) {
    user = user || userObj();
    if (!isNutrizionista(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-nu');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-nu';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-nu-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-nu-dash';
    document.body.classList.add('is-nu-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  function boot() {
    var u = userObj();
    if (!isNutrizionista(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isNutrizionista(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isNutrizionista(u)) renderHub(u); });
  // syncPlayerProfileView (player-profile.js) cerca window.EliseeNuDash.
  window.EliseeNuDash = { render: renderHub, isNu: isNutrizionista };
  window.elisee_nuHub = window.EliseeNuDash;
})();
