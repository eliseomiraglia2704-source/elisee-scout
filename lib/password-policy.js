/** Criteri password Elisee Scout: 8+ / maiuscola / numero / speciale. */
const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function checkPasswordPolicy(val) {
  const v = String(val || '');
  const len = v.length >= 8;
  const upper = /[A-Z]/.test(v);
  const num = /[0-9]/.test(v);
  const special = SPECIAL.test(v);
  const ok = len && upper && num && special;
  let message = '';
  if (!len) message = 'La password deve avere almeno 8 caratteri.';
  else if (!upper) message = 'La password deve contenere almeno una lettera maiuscola.';
  else if (!num) message = 'La password deve contenere almeno un numero.';
  else if (!special) message = 'La password deve contenere almeno un carattere speciale (es. . ! @ #).';
  return { ok: ok, len: len, upper: upper, num: num, special: special, message: message };
}

module.exports = { checkPasswordPolicy, SPECIAL };
