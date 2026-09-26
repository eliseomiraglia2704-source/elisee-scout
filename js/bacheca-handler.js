// HEROUX35 – Bacheca Handler Zero-Latency
window.EliseeBacheca = {
  init: () => {
    document.querySelectorAll('.bacheca-container .filter-group select').forEach(select => {
      select.addEventListener('change', () => {
        console.log(`[HEROUX35] Filtro cambiato: ${select.value}`);
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Filtro applicato: ' + select.value, 1200);
        }
      });
    });

    document.querySelectorAll('.bacheca-container .opportunita-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.menu-item')) return;
        card.classList.toggle('selected');
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX || card.getBoundingClientRect().left + 40, e.clientY || card.getBoundingClientRect().top + 20);
        }
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          const isSel = card.classList.contains('selected');
          window.EliseeSuccessSystem.showToast(isSel ? 'Opportunità aggiunta alla selezione' : 'Opportunità rimossa', 1500);
        }
      });
    });

    document.querySelectorAll('.bacheca-container .menu-item').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.transform = 'scale(1.1)'; });
      item.addEventListener('mouseleave', () => { item.style.transform = 'scale(1)'; });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
        if (window.EliseeActionMenu && typeof window.EliseeActionMenu.open === 'function') {
          window.EliseeActionMenu.open(e.clientX, e.clientY);
        } else if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Opzioni annuncio aperte', 1400);
        }
      });
    });

    console.log('[HEROUX35] EliseeBacheca initialized (<40ms)');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EliseeBacheca.init());
} else {
  EliseeBacheca.init();
}
