/* Forza della password mentre si scrive. */
(function () {
  'use strict';
  var labels = { weak: 'Password debole', medium: 'Password media', strong: 'Password forte' };

  function level(password) {
    if (!password) return '';
    var n = -1;
    if (/[a-z]/.test(password)) n++;
    if (/[A-Z]/.test(password)) n++;
    if (/\d/.test(password)) n++;
    if (/[^a-zA-Z0-9]/.test(password)) n++;
    if (password.length >= 16) n++;
    if (n <= 0) return 'weak';
    if (n <= 2) return 'medium';
    return 'strong';
  }

  function paint(input) {
    var box = input.closest('.es-pwbox');
    if (!box) return;
    var bars = box.querySelector('.es-pwbars');
    var text = box.querySelector('.es-pwstrength');
    var strength = level(input.value);
    if (bars) bars.className = 'es-pwbars' + (strength ? ' ' + strength : '');
    if (text) text.textContent = strength ? labels[strength] : '';
  }

  function boot() {
    document.querySelectorAll('.es-pwbox input').forEach(function (input) {
      if (input.dataset.pwLive === '1') return;
      input.dataset.pwLive = '1';
      input.addEventListener('input', function () { paint(input); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
