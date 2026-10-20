/**
 * ELISEE SCOUT — Dati della gestione squadra (Allenatore e Vice Allenatore).
 *
 * Il nome `EliseeSupabase` resta per compatibilità con coach-dash.js e
 * vice-dash.js, ma i dati non passano più da Supabase: il browser chiama
 * /api/squadra, che controlla il login e l'appartenenza alla squadra e salva
 * nel database del sito (Upstash). Senza login non si legge né si scrive nulla.
 */
(function () {
  'use strict';

  var API = '/api/squadra';

  function authToken() {
    try { return localStorage.getItem('elisee_auth_token') || ''; } catch (_) { return ''; }
  }

  function activeUser() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function clubNameOf(user) {
    user = user || {};
    return String(user.squadra || user.club || user.teamName || user.squadraAttuale || '').trim();
  }

  // coach-dash.js e vice-dash.js usano ancora un vecchio ID fisso come ripiego:
  // lo sostituiamo con la squadra del profilo.
  var LEGACY_DEFAULT_ID = 'f0661a00-0000-4000-8000-000000000001';

  async function call(method, clubId, col, body) {
    if (clubId === LEGACY_DEFAULT_ID) clubId = clubNameOf(activeUser());
    var tok = authToken();
    if (!tok || !clubId) return { ok: false, status: 401, error: 'login_richiesto', data: null };
    var url = API + '?club=' + encodeURIComponent(clubId) + (col ? '&col=' + encodeURIComponent(col) : '');
    var opts = { method: method, headers: { Authorization: 'Bearer ' + tok } };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    try {
      var res = await fetch(url, opts);
      var json = null;
      try { json = await res.json(); } catch (_) { json = null; }
      if (!res.ok || !json || !json.ok) {
        return { ok: false, status: res.status, error: (json && (json.message || json.error)) || ('HTTP ' + res.status), data: null };
      }
      return { ok: true, status: res.status, data: json };
    } catch (e) {
      return { ok: false, status: 0, error: e.message, data: null };
    }
  }

  async function list(clubId, col) {
    var r = await call('GET', clubId, col);
    return r.ok && r.data && Array.isArray(r.data.items) ? r.data.items : [];
  }

  async function save(clubId, col, item) {
    var r = await call('POST', clubId, col, { item: item });
    if (r.ok) return { ok: true, status: r.status, data: [r.data.item] };
    return r;
  }

  function byDate(field, dir) {
    return function (a, b) {
      var x = Date.parse(a[field] || '') || 0;
      var y = Date.parse(b[field] || '') || 0;
      return dir === 'desc' ? y - x : x - y;
    };
  }

  // ============================================================
  // SQUADRA DELL'UTENTE
  // ============================================================
  // Restituisce il nome della squadra del profilo (il server la identifica da lì).
  // Se il profilo non ha una squadra restituisce null: nessuna squadra di ripiego.
  async function resolveClubId(user) {
    var name = clubNameOf(user || activeUser());
    return name || null;
  }

  // ============================================================
  // PARTITE
  // ============================================================
  async function getPartite(clubId) {
    return (await list(clubId, 'partite')).sort(byDate('data_ora', 'asc'));
  }

  async function getProssimaPartita(clubId) {
    var all = await getPartite(clubId);
    var now = Date.now();
    var future = all.filter(function (p) { return (Date.parse(p.data_ora || '') || 0) >= now; });
    if (future.length) return future[0];
    var next = all.filter(function (p) { return p.stato === 'prossima'; });
    return next[0] || null;
  }

  // ============================================================
  // ALLENAMENTI
  // ============================================================
  async function getAllenamenti(clubId) {
    return (await list(clubId, 'allenamenti')).sort(byDate('data_ora', 'desc'));
  }

  async function getUltimaSeduta(clubId) {
    var all = await getAllenamenti(clubId);
    var done = all.filter(function (a) { return a.stato === 'completata'; });
    return done[0] || all[0] || null;
  }

  async function getSedutaOdierna(clubId) {
    var all = await getAllenamenti(clubId);
    var d = new Date();
    var start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var end = start + 86400000;
    var today = all.filter(function (a) {
      var t = Date.parse(a.data_ora || '') || 0;
      return t >= start && t < end;
    }).sort(byDate('data_ora', 'asc'));
    return today[0] || null;
  }

  // ============================================================
  // ROSA
  // ============================================================
  async function getRosa(clubId) {
    return (await list(clubId, 'rosa')).sort(function (a, b) {
      return String(a.ruolo || '').localeCompare(String(b.ruolo || '')) ||
        String(a.cognome || '').localeCompare(String(b.cognome || ''));
    });
  }

  async function getDisponibilitaRosa(clubId) {
    var rosa = await getRosa(clubId);
    var totale = rosa.length;
    var disponibili = 0, infortunati = 0, squalificati = 0, differenziati = 0;
    var indisponibiliLista = [];
    rosa.forEach(function (g) {
      var st = String(g.stato || 'disponibile').toLowerCase();
      if (st === 'disponibile') {
        disponibili++;
      } else {
        if (st === 'infortunato') infortunati++;
        else if (st === 'squalificato') squalificati++;
        else differenziati++;
        indisponibiliLista.push(g);
      }
    });
    return {
      totale: totale,
      disponibili: disponibili,
      infortunati: infortunati,
      squalificati: squalificati,
      differenziati: differenziati,
      indisponibiliTotale: totale - disponibili,
      percentuale: totale > 0 ? Math.round((disponibili / totale) * 100) : 0,
      indisponibiliLista: indisponibiliLista
    };
  }

  async function addCalciatore(clubId, player) {
    clubId = clubId || (await resolveClubId());
    if (!clubId) return { ok: false, error: 'Imposta la tua squadra nel profilo.' };
    player = player || {};
    return save(clubId, 'rosa', {
      nome: player.nome || player.name || '',
      cognome: player.cognome || '',
      numero_maglia: parseInt(player.numero_maglia || player.num, 10) || 1,
      ruolo: player.ruolo || player.role || 'Calciatore',
      // Formato ISO YYYY-MM-DD conservato così com'è.
      data_nascita: player.data_nascita || player.dob || null,
      luogo_nascita: player.luogo_nascita || player.pob || null,
      codice_fiscale: player.codice_fiscale || player.cf || null,
      email: player.email || null,
      stato: player.stato || 'disponibile'
    });
  }

  // ============================================================
  // CARICO SETTIMANALE (dalle presenze, oppure dagli allenamenti)
  // ============================================================
  async function getCaricoSettimanale(clubId) {
    if (!clubId) return { mediaSettimanale: 0, giorni: [], acwr: '—', stato: 'In attesa dati' };
    var weekAgo = Date.now() - 7 * 86400000;
    var names = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    var giorniMap = { Lun: [], Mar: [], Mer: [], Gio: [], Ven: [], Sab: [], Dom: [] };
    var sum = 0, count = 0;

    var allenamenti = await getAllenamenti(clubId);
    var recent = allenamenti.filter(function (a) { return (Date.parse(a.data_ora || '') || 0) >= weekAgo; });
    var byId = {};
    recent.forEach(function (a) { if (a.id) byId[a.id] = a; });

    var presenze = await list(clubId, 'presenze_allenamento');
    presenze.forEach(function (row) {
      var al = byId[row.allenamento_id];
      if (!al || !row.presente) return;
      var c = parseFloat(row.carico_individuale) || 0;
      if (c <= 0) return;
      sum += c; count++;
      var day = names[new Date(al.data_ora).getDay()];
      if (giorniMap[day]) giorniMap[day].push(c);
    });

    if (count === 0) {
      recent.forEach(function (al) {
        var raw = String(al.carico_percepito || '').toLowerCase().trim();
        // Senza fatica percepita indicata la seduta non entra nella media.
        if (!raw) return;
        var val = raw === 'alto' ? 85 : (raw === 'basso' ? 50 : (raw === 'medio' ? 70 : (/^\d+$/.test(raw) ? parseInt(raw, 10) : 0)));
        if (!val) return;
        sum += val; count++;
        var day = names[new Date(al.data_ora).getDay()];
        if (giorniMap[day]) giorniMap[day].push(val);
      });
    }

    var avg = count > 0 ? Math.round(sum / count) : 0;
    return {
      mediaSettimanale: avg,
      giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(function (d) {
        var arr = giorniMap[d];
        return { day: d, val: arr.length ? Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) : 0 };
      }),
      acwr: '—',
      stato: avg === 0 ? 'In attesa dati GPS' : (avg >= 70 && avg <= 88 ? 'Ottimale' : (avg > 88 ? 'Rischio sovraccarico' : 'Scarico'))
    };
  }

  // ============================================================
  // STAFF, REPORT, EVENTI, IMPEGNI
  // ============================================================
  async function getStaff(clubId, ruolo) {
    var all = await list(clubId, 'staff');
    if (ruolo) all = all.filter(function (s) { return s.ruolo === ruolo; });
    return all.sort(function (a, b) { return String(a.cognome || '').localeCompare(String(b.cognome || '')); });
  }

  async function getReportStaff(clubId, staffId) {
    var all = (await list(clubId, 'report')).sort(byDate('created_at', 'desc'));
    if (!staffId) return all;
    return all.filter(function (rep) {
      return rep.mittente_id === staffId || rep.destinatario_id === staffId || !rep.destinatario_id;
    });
  }

  async function getEventiLog(clubId) {
    return (await list(clubId, 'eventi_log')).sort(byDate('created_at', 'desc')).slice(0, 8);
  }

  async function getImpegniStaff(clubId) {
    var now = Date.now();
    return (await list(clubId, 'impegni_staff'))
      .filter(function (i) { return (Date.parse(i.data_ora || '') || 0) >= now; })
      .sort(byDate('data_ora', 'asc'))
      .slice(0, 6);
  }

  // ============================================================
  // ALLEGATI — salvati nell'archivio della squadra, solo per i membri.
  // Il file viaggia a pezzi (max 1 MB a richiesta). Limite 4 MB.
  // ============================================================
  var FILE_MAX = 4 * 1024 * 1024;
  var PART_CHARS = 700000;

  function readAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { var s = String(r.result || ''); resolve(s.slice(s.indexOf(',') + 1)); };
      r.onerror = function () { reject(new Error('Lettura del file non riuscita')); };
      r.readAsDataURL(file);
    });
  }

  var FILE_ERRORS = {
    tipo_non_ammesso: 'Tipo di file non ammesso. Usa PDF, immagini, CSV, JSON, GPX/FIT o documenti Office.',
    file_troppo_grande: 'Il file supera 4 MB. Per i video carica un link.',
    non_membro: 'Non fai parte dello staff di questa squadra.',
    login_richiesto: 'Accedi di nuovo per caricare file.'
  };

  async function uploadFileAllegato(clubId, categoria, entitaId, file, staffId, visibilita, onProgress) {
    if (!file) return { ok: false, error: 'Nessun file selezionato.' };
    if (file.size > FILE_MAX) return { ok: false, error: FILE_ERRORS.file_troppo_grande };
    var b64;
    try { b64 = await readAsBase64(file); } catch (e) { return { ok: false, error: e.message }; }
    var parts = [];
    for (var i = 0; i < b64.length; i += PART_CHARS) parts.push(b64.slice(i, i + PART_CHARS));
    var fileId = 'f-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    var meta = { name: file.name, size: file.size, type: file.type || '', categoria: categoria || 'altro', entita_id: entitaId || '', visibilita: visibilita || [] };
    for (var n = 0; n < parts.length; n++) {
      var r = await call('POST', clubId, 'file_allegati', { chunk: { fileId: fileId, index: n, total: parts.length, data: parts[n], meta: meta } });
      if (!r.ok) return { ok: false, error: FILE_ERRORS[r.error] || r.error || 'Caricamento non riuscito.' };
      if (typeof onProgress === 'function') onProgress(Math.round(100 * (n + 1) / parts.length));
      if (n === parts.length - 1) return { ok: true, item: r.data && r.data.item };
    }
    return { ok: false, error: 'Caricamento non riuscito.' };
  }

  async function downloadFileAllegato(clubId, fileId, fileName) {
    var tok = authToken();
    if (clubId === LEGACY_DEFAULT_ID || !clubId) clubId = clubNameOf(activeUser());
    if (!tok || !clubId) return { ok: false, error: FILE_ERRORS.login_richiesto };
    var out = '';
    var parts = 1;
    for (var n = 0; n < parts; n++) {
      var url = API + '?club=' + encodeURIComponent(clubId) + '&col=file_allegati&file=' + encodeURIComponent(fileId) + '&part=' + n;
      var res = await fetch(url, { headers: { Authorization: 'Bearer ' + tok } });
      var json = null;
      try { json = await res.json(); } catch (_) {}
      if (!res.ok || !json || !json.ok) return { ok: false, error: (json && (json.message || json.error)) || ('HTTP ' + res.status) };
      parts = json.parts || 1;
      out += json.data;
    }
    var bin = atob(out);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var blob = new Blob([bytes]);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName || 'allegato';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return { ok: true };
  }

  async function removeFileAllegato(clubId, fileId) {
    return call('POST', clubId, 'file_allegati', { removeId: fileId });
  }

  // Pulsanti «Scarica» negli elenchi allegati delle dashboard: <button data-sq-dl="id" data-sq-name="nome">.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sq-dl]');
    if (!b) return;
    e.preventDefault();
    b.disabled = true;
    downloadFileAllegato(clubNameOf(activeUser()), b.getAttribute('data-sq-dl'), b.getAttribute('data-sq-name')).then(function (r) {
      b.disabled = false;
      if (!r.ok && typeof window.showToast === 'function') window.showToast('Download non riuscito: ' + r.error, 'error');
    });
  });

  async function getFileAllegati(clubId, categoria, entitaId) {
    var all = await list(clubId, 'file_allegati');
    if (categoria) all = all.filter(function (f) { return f.categoria === categoria; });
    if (entitaId) all = all.filter(function (f) { return f.entita_id === entitaId; });
    return all.sort(byDate('created_at', 'desc'));
  }

  // ============================================================
  // SCHEMI TATTICI & DOSSIER TATTICO
  // ============================================================
  async function saveSchemaTattico(clubId, schemaData) {
    if (!clubId || !schemaData) return { ok: false };
    return save(clubId, 'schemi_tattici', {
      id: schemaData.id || ('st-' + Date.now()),
      nome: schemaData.nome || 'Schema Tattico',
      modulo: schemaData.modulo || '4-3-3',
      pins: schemaData.pins || [],
      frecce: schemaData.frecce || [],
      zone: schemaData.zone || [],
      autore: schemaData.autore || 'Mister',
      created_at: schemaData.created_at || new Date().toISOString()
    });
  }

  async function getSchemiTattici(clubId) {
    return (await list(clubId, 'schemi_tattici')).sort(byDate('created_at', 'desc'));
  }

  async function saveDossierTattico(clubId, matchId, dossierData) {
    if (!clubId || !matchId || !dossierData) return { ok: false };
    return save(clubId, 'dossier_tattico', {
      partita_id: matchId,
      avversario: dossierData.avversario || 'Avversario',
      punti_forza: dossierData.puntiForza || '',
      punti_deboli: dossierData.puntiDeboli || '',
      giocatori_chiave: dossierData.giocatoriChiave || '',
      palle_inattive: dossierData.palleInattive || '',
      note_mister: dossierData.noteMister || ''
    });
  }

  async function getDossierTattico(clubId, matchId) {
    if (!clubId || !matchId) return null;
    var all = await list(clubId, 'dossier_tattico');
    return all.filter(function (d) { return d.partita_id === matchId; })[0] || null;
  }

  // Salvataggio generico: partite, allenamenti, report (stesso id = aggiornamento).
  async function saveItem(clubId, col, item) {
    var r = await call('POST', clubId, col, { item: item });
    if (r.ok) return { ok: true, status: r.status, item: r.data.item };
    return r;
  }
  async function removeItem(clubId, col, id) {
    return call('POST', clubId, col, { removeId: id });
  }

  // Nome squadra, se sei il titolare (titolare: true) e, solo per lui, l'elenco dei membri.
  async function getSquadraInfo(clubId) {
    return call('GET', clubId, '');
  }

  // Solo il titolare della squadra può aggiungere o togliere membri dello staff.
  async function addMembro(clubId, email) {
    return call('POST', clubId, 'membri', { email: email });
  }
  async function removeMembro(clubId, email) {
    return call('POST', clubId, 'membri', { email: email, remove: true });
  }

  window.EliseeSupabase = {
    resolveClubId: resolveClubId,
    getPartite: getPartite,
    getProssimaPartita: getProssimaPartita,
    getAllenamenti: getAllenamenti,
    getUltimaSeduta: getUltimaSeduta,
    getSedutaOdierna: getSedutaOdierna,
    getRosa: getRosa,
    getDisponibilitaRosa: getDisponibilitaRosa,
    addCalciatore: addCalciatore,
    getCaricoSettimanale: getCaricoSettimanale,
    getReportStaff: getReportStaff,
    getEventiLog: getEventiLog,
    getImpegniStaff: getImpegniStaff,
    uploadFileAllegato: uploadFileAllegato,
    downloadFileAllegato: downloadFileAllegato,
    removeFileAllegato: removeFileAllegato,
    getFileAllegati: getFileAllegati,
    getStaff: getStaff,
    saveSchemaTattico: saveSchemaTattico,
    getSchemiTattici: getSchemiTattici,
    saveDossierTattico: saveDossierTattico,
    getDossierTattico: getDossierTattico,
    getSquadraInfo: getSquadraInfo,
    saveItem: saveItem,
    removeItem: removeItem,
    addMembro: addMembro,
    removeMembro: removeMembro
  };
})();
