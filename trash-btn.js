/* Cestino animato. Il click non elimina account né dati. */
(function () {
  'use strict';
  var btn = document.getElementById('es-trash');
  if (!btn) return;
  var label = btn.querySelector('.es-trash-txt');
  var base = label ? label.textContent : 'Elimina';
  btn.addEventListener('click', function () {
    if (btn.classList.contains('is-deleting')) return;
    btn.classList.add('is-deleting');
    if (label) label.textContent = 'Elimina';
    setTimeout(function () {
      btn.classList.remove('is-deleting');
      if (label) label.textContent = base;
    }, 2500);
  });
})();
