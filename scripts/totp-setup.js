#!/usr/bin/env node
/**
 * Genera una chiave 2FA (TOTP) per l'accesso staff di Elisee Scout.
 *
 * Uso:
 *   node scripts/totp-setup.js            → chiave per il ruolo admin
 *   node scripts/totp-setup.js privacy    → chiave per il Responsabile Privacy
 *
 * Poi:
 *   1. In Google/Microsoft Authenticator: "Aggiungi account" → "Inserisci chiave".
 *      Nome: Elisee Scout. Chiave: quella stampata. Tipo: basata sul tempo.
 *   2. Su Vercel aggiungi la variabile ADMIN_TOTP_SECRET (o PRIVACY_TOTP_SECRET)
 *      con la stessa chiave, poi rifai il deploy.
 *   3. Per il server locale (elisee_up.py) aggiungi la stessa riga nel file .env.
 *
 * La chiave è un segreto: non salvarla in file del repository.
 */
const crypto = require('crypto');

const role = String(process.argv[2] || 'admin').toLowerCase() === 'privacy' ? 'privacy' : 'admin';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const bytes = crypto.randomBytes(20);

let bits = 0;
let value = 0;
let secret = '';
for (const b of bytes) {
  value = (value << 8) | b;
  bits += 8;
  while (bits >= 5) {
    secret += alphabet[(value >>> (bits - 5)) & 31];
    bits -= 5;
  }
}
if (bits > 0) secret += alphabet[(value << (5 - bits)) & 31];

const envName = role === 'privacy' ? 'PRIVACY_TOTP_SECRET' : 'ADMIN_TOTP_SECRET';
const label = encodeURIComponent('Elisee Scout:' + role);
const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent('Elisee Scout')}&algorithm=SHA1&digits=6&period=30`;

console.log('');
console.log('Ruolo:            ' + role);
console.log('Chiave 2FA:       ' + secret.replace(/(.{4})/g, '$1 ').trim());
console.log('Variabile Vercel: ' + envName + '=' + secret);
console.log('URI (per QR):     ' + uri);
console.log('');
