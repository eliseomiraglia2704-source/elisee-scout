/**
 * ELISEE SCOUT — Client Supabase Area Staff Tecnico
 * Connessione database (PostgREST) + Supabase Storage (staff-allegati)
 * Gestione dati reali per Allenatore e Vice Allenatore
 */
(function () {
  'use strict';

  var SUPABASE_URL = (window.ELISEE_SUPABASE_URL || 'https://uautnlmnpxgbajtucuko.supabase.co').replace(/\/$/, '');
  var SUPABASE_ANON = window.ELISEE_SUPABASE_ANON || 'sb_publishable_1e-KMVmQHAf9GduUTMKn8Q_9ibW1BK_';
  var STORAGE_BUCKET = 'staff-allegati';

  // ID fisso/deterministico di fallback per il club di default (Foggia City) se non presente UUID
  var DEFAULT_CLUB_ID = 'f0661a00-0000-4000-8000-000000000001';

  function getAuthToken() {
    try {
      var auth = JSON.parse(localStorage.getItem('elisee_auth_session') || localStorage.getItem('supabase_auth_token') || '{}');
      if (auth && auth.access_token) return auth.access_token;
    } catch (_) {}
    return SUPABASE_ANON;
  }

  function getHeaders(extraHeaders) {
    var token = getAuthToken();
    var h = {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + (token || SUPABASE_ANON),
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    if (extraHeaders) {
      for (var k in extraHeaders) {
        if (Object.prototype.hasOwnProperty.call(extraHeaders, k)) {
          h[k] = extraHeaders[k];
        }
      }
    }
    return h;
  }

  async function apiFetch(endpoint, options) {
    options = options || {};
    var url = SUPABASE_URL + '/rest/v1' + endpoint;
    options.headers = getHeaders(options.headers);
    try {
      var res = await fetch(url, options);
      if (!res.ok) {
        var errText = await res.text();
        console.warn('[EliseeSupabase] HTTP ' + res.status + ' on ' + endpoint, errText);
        return { ok: false, status: res.status, error: errText, data: null };
      }
      var json = null;
      try { json = await res.json(); } catch (_) { json = null; }
      return { ok: true, status: res.status, data: json };
    } catch (e) {
      console.warn('[EliseeSupabase] Network error on ' + endpoint, e);
      return { ok: false, status: 0, error: e.message, data: null };
    }
  }

  // ============================================================
  // CLUB & STAFF RESOLVER
  // ============================================================
  async function resolveClubId(user) {
    user = user || {};
    if (user.club_id && /^[0-9a-f-]{36}$/i.test(user.club_id)) {
      return user.club_id;
    }
    var clubName = user.squadra || user.club || 'Foggia City';
    // Cerca per nome
    var r = await apiFetch('/club?nome=eq.' + encodeURIComponent(clubName) + '&select=id,nome,categoria&limit=1');
    if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
      return r.data[0].id;
    }
    // Prova a inserire il club se non esiste
    var ins = await apiFetch('/club', {
      method: 'POST',
      body: JSON.stringify({
        id: DEFAULT_CLUB_ID,
        nome: clubName,
        categoria: user.categoria || 'Amatoriale · Foggia',
        citta: user.sede || 'Foggia'
      })
    });
    if (ins.ok && Array.isArray(ins.data) && ins.data[0]) {
      return ins.data[0].id;
    }
    return DEFAULT_CLUB_ID;
  }

  // ============================================================
  // PARTITE (Calendario & Prossima Gara)
  // ============================================================
  async function getPartite(clubId) {
    if (!clubId) return [];
    var r = await apiFetch('/partite?club_id=eq.' + encodeURIComponent(clubId) + '&order=data_ora.asc');
    if (r.ok && Array.isArray(r.data)) {
      return r.data;
    }
    return [];
  }

  async function getProssimaPartita(clubId) {
    if (!clubId) return null;
    var nowIso = new Date().toISOString();
    // Prende la prima partita con data futura oppure con stato 'prossima'
    var r = await apiFetch('/partite?club_id=eq.' + encodeURIComponent(clubId) + '&data_ora=gte.' + encodeURIComponent(nowIso) + '&order=data_ora.asc&limit=1');
    if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
      return r.data[0];
    }
    // Se non trova future, cerca per stato 'prossima'
    var r2 = await apiFetch('/partite?club_id=eq.' + encodeURIComponent(clubId) + '&stato=eq.prossima&order=data_ora.asc&limit=1');
    if (r2.ok && Array.isArray(r2.data) && r2.data.length > 0) {
      return r2.data[0];
    }
    return null;
  }

  // ============================================================
  // ALLENAMENTI (Sedute, Odierna, Ultima)
  // ============================================================
  async function getAllenamenti(clubId) {
    if (!clubId) return [];
    var r = await apiFetch('/allenamenti?club_id=eq.' + encodeURIComponent(clubId) + '&order=data_ora.desc');
    if (r.ok && Array.isArray(r.data)) {
      return r.data;
    }
    return [];
  }

  async function getUltimaSeduta(clubId) {
    if (!clubId) return null;
    var r = await apiFetch('/allenamenti?club_id=eq.' + encodeURIComponent(clubId) + '&stato=eq.completata&order=data_ora.desc&limit=1');
    if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
      return r.data[0];
    }
    // Fallback generico su ordine decrescente
    var r2 = await apiFetch('/allenamenti?club_id=eq.' + encodeURIComponent(clubId) + '&order=data_ora.desc&limit=1');
    if (r2.ok && Array.isArray(r2.data) && r2.data.length > 0) {
      return r2.data[0];
    }
    return null;
  }

  async function getSedutaOdierna(clubId) {
    if (!clubId) return null;
    var d = new Date();
    var startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    var endDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();
    var r = await apiFetch('/allenamenti?club_id=eq.' + encodeURIComponent(clubId) + '&data_ora=gte.' + encodeURIComponent(startDay) + '&data_ora=lte.' + encodeURIComponent(endDay) + '&order=data_ora.asc&limit=1');
    if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
      return r.data[0];
    }
    return null;
  }

  // ============================================================
  // ROSA (Disponibilità Giocatori, Infortuni, Squalifiche)
  // ============================================================
  async function getRosa(clubId) {
    if (!clubId) return [];
    var r = await apiFetch('/rosa?club_id=eq.' + encodeURIComponent(clubId) + '&order=ruolo.asc,cognome.asc');
    if (r.ok && Array.isArray(r.data)) {
      return r.data;
    }
    return [];
  }

  async function getDisponibilitaRosa(clubId) {
    var rosa = await getRosa(clubId);
    var totale = rosa.length;
    var disponibili = 0;
    var infortunati = 0;
    var squalificati = 0;
    var differenziati = 0;
    var indisponibiliLista = [];

    rosa.forEach(function (g) {
      var st = (g.stato || 'disponibile').toLowerCase();
      if (st === 'disponibile') {
        disponibili++;
      } else {
        if (st === 'infortunato') infortunati++;
        else if (st === 'squalificato') squalificati++;
        else differenziati++;
        indisponibiliLista.push(g);
      }
    });

    var perc = totale > 0 ? Math.round((disponibili / totale) * 100) : 0;
    return {
      totale: totale,
      disponibili: disponibili,
      infortunati: infortunati,
      squalificati: squalificati,
      differenziati: differenziati,
      indisponibiliTotale: totale - disponibili,
      percentuale: perc,
      indisponibiliLista: indisponibiliLista
    };
  }

  async function addCalciatore(clubId, player) {
    if (!clubId) clubId = DEFAULT_CLUB_ID;
    var payload = {
      club_id: clubId,
      nome: player.nome || player.name || '',
      cognome: player.cognome || '',
      numero_maglia: parseInt(player.numero_maglia || player.num) || 1,
      ruolo: player.ruolo || player.role || 'Calciatore',
      data_nascita: player.data_nascita || player.dob || null,
      luogo_nascita: player.luogo_nascita || player.pob || null,
      codice_fiscale: player.codice_fiscale || player.cf || null,
      email: player.email || null,
      stato: player.stato || 'disponibile'
    };
    return await apiFetch('/rosa', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // ============================================================
  // CARICHI SETTIMANALI & PREPARAZIONE GARA (Aggregati da presenze o allenamenti)
  // ============================================================
  async function getCaricoSettimanale(clubId) {
    if (!clubId) return { mediaSettimanale: 0, giorni: [], acwr: '1.00', stato: 'In attesa dati' };
    var setteGiorniFa = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    var giorniMap = { 'Lun': [], 'Mar': [], 'Mer': [], 'Gio': [], 'Ven': [], 'Sab': [], 'Dom': [] };
    var weekdayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    var sum = 0;
    var count = 0;

    // 1. Prova da presenze_allenamento
    var r = await apiFetch('/presenze_allenamento?select=carico_individuale,presente,allenamenti!inner(data_ora,club_id)&allenamenti.club_id=eq.' + encodeURIComponent(clubId) + '&allenamenti.data_ora=gte.' + encodeURIComponent(setteGiorniFa));
    if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
      r.data.forEach(function (row) {
        if (!row.presente) return;
        var c = parseFloat(row.carico_individuale) || 0;
        if (c > 0) {
          sum += c;
          count++;
          var dt = new Date(row.allenamenti.data_ora);
          var dayName = weekdayNames[dt.getDay()];
          if (giorniMap[dayName]) giorniMap[dayName].push(c);
        }
      });
    }

    // 2. Fallback su tabella allenamenti se presenze è vuota
    if (count === 0) {
      var rAll = await apiFetch('/allenamenti?club_id=eq.' + encodeURIComponent(clubId) + '&data_ora=gte.' + encodeURIComponent(setteGiorniFa) + '&order=data_ora.asc');
      if (rAll.ok && Array.isArray(rAll.data) && rAll.data.length > 0) {
        rAll.data.forEach(function (al) {
          var val = 70;
          var rawC = String(al.carico_percepito || '').toLowerCase();
          if (rawC === 'alto') val = 85;
          else if (rawC === 'basso') val = 50;
          else if (/^\d+$/.test(rawC)) val = parseInt(rawC, 10);
          
          sum += val;
          count++;
          var dt = new Date(al.data_ora);
          var dayName = weekdayNames[dt.getDay()];
          if (giorniMap[dayName]) giorniMap[dayName].push(val);
        });
      }
    }

    var avg = count > 0 ? Math.round(sum / count) : 0;
    var chartDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(function (d) {
      var arr = giorniMap[d] || [];
      var dAvg = arr.length > 0 ? Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) : 0;
      return { day: d, val: dAvg };
    });

    var acwr = avg > 0 ? (avg / 75).toFixed(2) : '1.00';
    var statoCarico = avg === 0 ? 'In attesa dati GPS' : (avg >= 70 && avg <= 88 ? 'Ottimale' : (avg > 88 ? 'Rischio sovraccarico' : 'Scarico'));

    return {
      mediaSettimanale: avg,
      giorni: chartDays,
      acwr: acwr,
      stato: statoCarico
    };
  }

  // ============================================================
  // STAFF (Allenatore, Vice Allenatore, Match Analyst, Medico)
  // ============================================================
  async function getStaff(clubId, ruolo) {
    if (!clubId) return [];
    var q = '/staff?club_id=eq.' + encodeURIComponent(clubId);
    if (ruolo) q += '&ruolo=eq.' + encodeURIComponent(ruolo);
    q += '&order=cognome.asc';
    var r = await apiFetch(q);
    if (r.ok && Array.isArray(r.data)) return r.data;
    return [];
  }

  // ============================================================
  // REPORT STAFF & MEDICI
  // ============================================================
  async function getReportStaff(clubId, staffId, userRole) {
    if (!clubId) return [];
    var endpoint = '/report?club_id=eq.' + encodeURIComponent(clubId) + '&order=created_at.desc';
    var r = await apiFetch(endpoint);
    if (r.ok && Array.isArray(r.data)) {
      // Se staffId è presente, mostra i report inviati, ricevuti, o destinati al proprio ruolo
      if (staffId) {
        return r.data.filter(function (rep) {
          return rep.mittente_id === staffId || rep.destinatario_id === staffId || !rep.destinatario_id;
        });
      }
      return r.data;
    }
    return [];
  }

  // ============================================================
  // EVENTI LOG & NOTIFICHE
  // ============================================================
  async function getEventiLog(clubId) {
    if (!clubId) return [];
    var r = await apiFetch('/eventi_log?club_id=eq.' + encodeURIComponent(clubId) + '&order=created_at.desc&limit=8');
    if (r.ok && Array.isArray(r.data)) {
      return r.data;
    }
    return [];
  }

  // ============================================================
  // IMPEGNI STAFF
  // ============================================================
  async function getImpegniStaff(clubId) {
    if (!clubId) return [];
    var nowIso = new Date().toISOString();
    var r = await apiFetch('/impegni_staff?club_id=eq.' + encodeURIComponent(clubId) + '&data_ora=gte.' + encodeURIComponent(nowIso) + '&order=data_ora.asc&limit=6');
    if (r.ok && Array.isArray(r.data)) {
      return r.data;
    }
    return [];
  }

  // ============================================================
  // SUPABASE STORAGE: UPLOAD & FILE ALLEGATI
  // ============================================================
  async function uploadFileAllegato(clubId, categoria, entitaId, file, staffId, visibileA) {
    if (!clubId || !file) return { ok: false, error: 'Parametri mancanti' };
    visibileA = visibileA || ['allenatore', 'vice_allenatore'];
    
    // Convenzione path: staff-allegati/{club_id}/{categoria}/{entita_id}/{timestamp}_{filename}
    var cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var filePath = clubId + '/' + categoria + '/' + entitaId + '/' + Date.now() + '_' + cleanName;
    var storageUrl = SUPABASE_URL + '/storage/v1/object/' + STORAGE_BUCKET + '/' + filePath;

    try {
      var uploadRes = await fetch(storageUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + getAuthToken(),
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (!uploadRes.ok) {
        var err = await uploadRes.text();
        return { ok: false, error: err };
      }

      var publicUrl = SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET + '/' + filePath;

      // Inserisce metadato in tabella file_allegati
      var metaRes = await apiFetch('/file_allegati', {
        method: 'POST',
        body: JSON.stringify({
          club_id: clubId,
          entita_tipo: categoria === 'gps' ? 'allenamento' : (categoria === 'video_analisi' ? 'partita' : 'giocatore'),
          entita_id: entitaId,
          categoria: categoria,
          file_url: publicUrl,
          caricato_da: staffId || null,
          visibile_a: visibileA
        })
      });

      return { ok: true, url: publicUrl, data: metaRes.data ? metaRes.data[0] : null };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function getFileAllegati(clubId, categoria, entitaId) {
    if (!clubId) return [];
    var q = '/file_allegati?club_id=eq.' + encodeURIComponent(clubId);
    if (categoria) q += '&categoria=eq.' + encodeURIComponent(categoria);
    if (entitaId) q += '&entita_id=eq.' + encodeURIComponent(entitaId);
    q += '&order=created_at.desc';
    var r = await apiFetch(q);
    if (r.ok && Array.isArray(r.data)) return r.data;
    return [];
  }

  // ============================================================
  // EXPORT GLOBALE
  // ============================================================
  window.EliseeSupabase = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON,
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
    getFileAllegati: getFileAllegati,
    getStaff: getStaff,
    apiFetch: apiFetch
  };

})();
