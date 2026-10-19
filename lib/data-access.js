/**
 * ELISEE SCOUT — Chi può leggere e scrivere i documenti condivisi in /api/manager.
 *
 * Regole comuni:
 * - staff = token firmato admin o privacy (lib/admin-token-verify).
 * - utente = sessione valida (Bearer elisee_auth_token): l'email viene dal token,
 *   mai dal corpo della richiesta.
 * - Un visitatore non legge dati personali.
 * - Nessuna richiesta non-staff può cancellare o sovrascrivere dati di altri.
 *
 * Le funzioni sono pure: ricevono il documento salvato e restituiscono
 * il documento da salvare o la vista da mandare al browser.
 */

const MAX_QUEUE = 400;

function lower(v) {
  return String(v || '').trim().toLowerCase();
}

function clone(v) {
  return v == null ? v : JSON.parse(JSON.stringify(v));
}

/* ---------- Code GDPR (reclami, richieste) e pratiche Ambassador ---------- */

function queueView(list, who) {
  const arr = Array.isArray(list) ? list : [];
  if (who.staff) return arr;
  if (!who.email) return [];
  return arr.filter(function (r) { return r && lower(r._owner) === who.email; });
}

/**
 * Unisce le righe inviate da un non-staff alla coda salvata.
 * Può aggiungere righe nuove (id mai visto) e modificare solo le proprie.
 */
function queueMerge(saved, incoming, who) {
  const out = Array.isArray(saved) ? saved.slice() : [];
  if (!Array.isArray(incoming)) return out;
  const byId = {};
  out.forEach(function (r, i) { if (r && r.id != null) byId[String(r.id)] = i; });
  incoming.slice(0, 50).forEach(function (row) {
    if (!row || typeof row !== 'object' || row.id == null) return;
    const id = String(row.id).slice(0, 120);
    const clean = Object.assign({}, row, { id: id });
    delete clean._owner;
    if (id in byId) {
      const cur = out[byId[id]];
      if (!who.email || lower(cur && cur._owner) !== who.email) return;
      out[byId[id]] = Object.assign({}, cur, clean, { _owner: cur._owner });
      return;
    }
    if (out.length >= MAX_QUEUE) return;
    clean._owner = who.email || '';
    clean._receivedAt = new Date().toISOString();
    out.unshift(clean);
    byId[id] = -1;
  });
  return out;
}

/* ---------- Card Elisee ---------- */

function cardView(doc, who) {
  const d = doc || {};
  const inbox = d.inbox || {};
  let visibleInbox = {};
  if (who.staff) visibleInbox = inbox;
  else if (who.email && inbox[who.email]) visibleInbox[who.email] = inbox[who.email];
  return { inbox: visibleInbox, published: d.published || {}, stats: d.stats || {} };
}

function cardMerge(doc, body, who) {
  const d = Object.assign({ inbox: {}, published: {}, stats: {} }, doc || {});
  const b = body || {};
  if (who.staff) {
    if (b.inbox && typeof b.inbox === 'object') d.inbox = Object.assign({}, d.inbox, b.inbox);
    if (b.published && typeof b.published === 'object') d.published = Object.assign({}, d.published, b.published);
    if (b.stats && typeof b.stats === 'object') d.stats = Object.assign({}, d.stats, b.stats);
    return d;
  }
  // Un utente può solo inviare la propria richiesta di card.
  if (who.email && b.inbox && typeof b.inbox === 'object') {
    Object.keys(b.inbox).forEach(function (k) {
      if (lower(k) !== who.email) return;
      const row = b.inbox[k];
      if (row && typeof row === 'object') d.inbox = Object.assign({}, d.inbox, { [who.email]: Object.assign({}, row, { email: who.email }) });
    });
  }
  return d;
}

/* ---------- Dati club (Presidente) e rosa allenatore ---------- */

function clubCanAccess(row, who, membri) {
  if (who.staff) return true;
  if (!who.email) return false;
  if (!row || !row.owner) return true;
  if (lower(row.owner) === who.email) return true;
  return Array.isArray(membri) && membri.map(lower).indexOf(who.email) >= 0;
}

/* ---------- Schede tecniche delle candidature ---------- */

function stripSheet(s) {
  const o = Object.assign({}, s);
  delete o.applicantEmail;
  return o;
}

/**
 * owners: mappa jobId → email dell'autore dell'annuncio in bacheca (se esiste).
 */
function jobOwner(job, jobId, owners) {
  if (owners && owners[jobId]) return lower(owners[jobId]);
  return lower(job && job.ownerEmail);
}

function schedeView(map, who, owners) {
  const out = {};
  if (!who.email && !who.staff) return out;
  Object.keys(map || {}).forEach(function (id) {
    const job = map[id];
    if (!job || typeof job !== 'object') return;
    if (who.staff) { out[id] = job; return; }
    const owner = jobOwner(job, id, owners);
    const copy = Object.assign({}, job);
    delete copy.ownerEmail;
    if (owner === who.email) {
      copy.sheets = (job.sheets || []).map(stripSheet);
      copy.mine = true;
      out[id] = copy;
      return;
    }
    const own = (job.sheets || []).filter(function (s) { return lower(s && s.applicantEmail) === who.email; });
    if (!own.length) return;
    copy.sheets = own.map(stripSheet);
    out[id] = copy;
  });
  return out;
}

function sanitizeJob(job) {
  const o = Object.assign({}, job || {});
  delete o.ownerEmail;
  delete o.mine;
  if (!Array.isArray(o.sheets)) o.sheets = [];
  o.sheets = o.sheets.slice(0, 200).filter(function (s) { return s && typeof s === 'object'; });
  return o;
}

function schedeMerge(map, incoming, who, owners) {
  const out = Object.assign({}, map || {});
  if (who.staff) {
    Object.keys(incoming || {}).forEach(function (id) {
      const prev = out[id] || {};
      const next = Object.assign({}, incoming[id]);
      if (prev.ownerEmail && !next.ownerEmail) next.ownerEmail = prev.ownerEmail;
      out[id] = next;
    });
    return out;
  }
  if (!who.email) return out;
  Object.keys(incoming || {}).slice(0, 60).forEach(function (rawId) {
    const id = String(rawId).slice(0, 120);
    const job = incoming[rawId];
    if (!job || typeof job !== 'object') return;
    const prev = out[id];
    const owner = prev ? jobOwner(prev, id, owners) : lower(owners && owners[id]);

    if (!prev && (!owner || owner === who.email)) {
      const fresh = sanitizeJob(job);
      fresh.id = id;
      fresh.ownerEmail = who.email;
      out[id] = fresh;
      return;
    }

    if (owner === who.email) {
      // Il titolare aggiorna l'annuncio; le email dei candidati restano quelle salvate.
      const keep = {};
      ((prev && prev.sheets) || []).forEach(function (s) { if (s && s.id) keep[s.id] = s.applicantEmail; });
      const next = sanitizeJob(job);
      next.id = id;
      next.ownerEmail = owner;
      next.sheets = next.sheets.map(function (s) {
        const o = stripSheet(s);
        if (keep[o.id]) o.applicantEmail = keep[o.id];
        return o;
      });
      out[id] = next;
      return;
    }

    // Candidato: aggiunge o aggiorna solo la propria scheda.
    const base = prev ? Object.assign({}, prev) : Object.assign(sanitizeJob(job), { id: id, ownerEmail: owner, sheets: [] });
    const others = (base.sheets || []).filter(function (s) { return lower(s && s.applicantEmail) !== who.email; });
    const mine = (job.sheets || []).filter(function (s) {
      if (!s || typeof s !== 'object') return false;
      if (s.source !== 'candidatura') return false;
      const existing = (base.sheets || []).find(function (x) { return x && x.id === s.id; });
      return !existing || lower(existing.applicantEmail) === who.email;
    }).slice(0, 1).map(function (s) {
      const o = stripSheet(s);
      const existing = (base.sheets || []).find(function (x) { return x && x.id === o.id; });
      o.applicantEmail = who.email;
      o.status = existing && existing.status ? existing.status : 'nuova';
      return o;
    });
    if (!mine.length) return;
    base.sheets = mine.concat(others).slice(0, 200);
    base.updatedAt = new Date().toISOString();
    out[id] = base;
  });
  return out;
}

module.exports = {
  queueView, queueMerge,
  cardView, cardMerge,
  clubCanAccess,
  schedeView, schedeMerge,
  lower, clone
};
