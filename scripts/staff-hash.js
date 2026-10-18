#!/usr/bin/env node
/**
 * Calcola l'hash della password iniziale di un account staff (api/auth/me.js).
 *
 * Uso: node scripts/staff-hash.js "PasswordNuova"
 *
 * Metti il risultato nella variabile Vercel STAFF_DEFAULT_HASHES, per esempio:
 *   {"email1@esempio.it":"<hash>","email2@esempio.it":"<hash>"}
 * Al primo accesso l'utente sceglie una password personale: da lì la password
 * iniziale non vale più.
 */
const crypto = require('crypto');
const pw = process.argv[2];
if (!pw) {
  console.error('Uso: node scripts/staff-hash.js "PasswordNuova"');
  process.exit(1);
}
console.log(crypto.pbkdf2Sync(String(pw), 'elisee-staff-v1', 120000, 32, 'sha256').toString('hex'));
