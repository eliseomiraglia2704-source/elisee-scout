/* ============================================================
   ELISEE SCOUT — AREA FISIOTERAPISTA
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

  function isFisio(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /fisio|fisioterap|massagg|osteopat|massofisioterapista/.test(blob);
  }

  var CFG = {
    "prefix": "med",
    "area": "Area Fisioterapista",
    "roleLabel": "Fisioterapista",
    "infoClass": "doc-info",
    "headerIco": "star",
    "qualificaLabel": "Qualifica",
    "qualificaKeys": [
      "fisioQualifica",
      "qualificaFisio",
      "certificazione",
      "staffProfile.licence"
    ],
    "alboLabel": "Iscrizione albo",
    "alboKeys": [
      "albo",
      "iscrizioneAlbo",
      "fisioAlbo"
    ],
    "nextLabel": "Prossima seduta",
    "registerLabel": "Registro trattamenti",
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
        "id": "trattamenti",
        "label": "Registro trattamenti",
        "ico": "cal",
        "short": "Sedute e fasi di recupero",
        "kind": "soon",
        "text": "Registro delle sedute di fisioterapia: atleta, tipo di trattamento, fase e stato.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "protocolli",
        "label": "Protocolli riabilitativi",
        "ico": "file",
        "short": "Percorsi di recupero per fasi",
        "kind": "soon",
        "text": "Protocolli di recupero per fasi, da concordare con il medico sociale.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "valutazione",
        "label": "Valutazione ROM e test",
        "ico": "bars",
        "short": "Misure e test funzionali",
        "kind": "soon",
        "text": "Misure di mobilità articolare e test funzionali per il ritorno in campo.",
        "why": "Contiene dati sanitari dei tesserati: si attiva con l’archivio squadra protetto."
      },
      {
        "id": "tecniche",
        "label": "Tecniche e strumenti",
        "ico": "clock",
        "short": "Guida alle tecniche",
        "kind": "info",
        "text": "Elenco generale delle tecniche più usate in fisioterapia sportiva. Non indica le attrezzature del tuo club.",
        "title": "Tecniche di riferimento",
        "items": [
          {
            "t": "Tecarterapia",
            "d": "Correnti capacitive e resistive per la riparazione dei tessuti."
          },
          {
            "t": "TENS ed elettrostimolazione",
            "d": "Controllo del dolore e stimolazione muscolare."
          },
          {
            "t": "Ultrasuoni",
            "d": "Effetto termico e meccanico su tendini e legamenti."
          },
          {
            "t": "Taping",
            "d": "Supporto al movimento e alla decompressione dei tessuti."
          },
          {
            "t": "Crioterapia e idroterapia",
            "d": "Gestione dell’infiammazione e lavoro in acqua."
          },
          {
            "t": "Terapia manuale",
            "d": "Mobilizzazioni e tecniche manuali."
          }
        ]
      },
      {
        "id": "canale",
        "label": "Canale staff",
        "ico": "users",
        "short": "Messaggi con medico e allenatori",
        "kind": "soon",
        "text": "Messaggi con medico sociale e staff tecnico sullo stato dei recuperi.",
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-fisio');
  }

  function renderHub(user) {
    user = user || userObj();
    if (!isFisio(user) || !window.EliseeRoleHonest) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-fisio');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-fisio';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-fisio-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-fisio-dash';
    document.body.classList.add('is-fisio-mode');
    window.EliseeRoleHonest.mount(box, CFG, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
  }

  function boot() {
    var u = userObj();
    if (!isFisio(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isFisio(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isFisio(u)) renderHub(u); });
  // syncPlayerProfileView (player-profile.js) cerca window.EliseeFisioDash.
  window.EliseeFisioDash = { render: renderHub, isFisio: isFisio };
  window.elisee_fisioHub = window.EliseeFisioDash;
})();
