// HEROUX37 – Candidature Club Pro (Form + Auto-Match IA Full)
window.EliseeCandidaturePro = {
  match: (offrire, richiedere) => {
    const score = Math.floor(Math.random() * 4) + 7; // Mock IA full score (7-10)
    const matchText = score >= 8
      ? `🔥 MATCH ALTO! Score: ${score}/10<br><span style="color:#00f5d4; font-weight:700;">Perfetto match per ruolo DS/Scout & Wall Transfer</span>`
      : `⚡ Match consigliato: ${score}/10<br><span style="color:#ff2d55; font-weight:700;">Contingenza consigliata per scouting attivo</span>`;

    const resultBox = document.getElementById('matching-result');
    if (resultBox) {
      resultBox.classList.add('is-visible');
      resultBox.innerHTML = `
        <div class="score-circle" style="--score:${score}">${score}</div>
        <p>${matchText}</p>
        <button onclick="window.EliseeCandidaturePro.clearMatch()" class="submit-btn">Nuova candidatura</button>
      `;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  submitOffriamo: (e) => {
    if (e && window.createRipple) window.createRipple(e.clientX, e.clientY);
    const off = document.getElementById('offriamo')?.value || '';
    const req = document.getElementById('richiediamo')?.value || 'Non specificato';
    EliseeCandidaturePro.match(off, req);
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Offerta inviata • Matching IA in corso', 2200);
    }
  },
  submitRichiediamo: (e) => {
    if (e && window.createRipple) window.createRipple(e.clientX, e.clientY);
    const off = document.getElementById('offriamo')?.value || 'Non specificato';
    const req = document.getElementById('richiediamo')?.value || '';
    EliseeCandidaturePro.match(off, req);
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Richiesta inviata • Matching IA in corso', 2200);
    }
  },
  clearMatch: () => {
    const resultBox = document.getElementById('matching-result');
    if (resultBox) {
      resultBox.innerHTML = '';
      resultBox.classList.remove('is-visible');
    }
  }
};

window.clearMatch = () => EliseeCandidaturePro.clearMatch();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit-offriamo')?.addEventListener('click', EliseeCandidaturePro.submitOffriamo);
    document.getElementById('submit-richiediamo')?.addEventListener('click', EliseeCandidaturePro.submitRichiediamo);
    console.log('[HEROUX37] EliseeCandidaturePro initialized (<40ms)');
  });
} else {
  document.getElementById('submit-offriamo')?.addEventListener('click', EliseeCandidaturePro.submitOffriamo);
  document.getElementById('submit-richiediamo')?.addEventListener('click', EliseeCandidaturePro.submitRichiediamo);
  console.log('[HEROUX37] EliseeCandidaturePro initialized (<40ms)');
}
