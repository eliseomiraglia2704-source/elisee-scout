/**
 * ELISEE SCOUT — Neutral Vector Badge Engine (Zero-Risk & IP Safe)
 * Genera stemmi e scudetti vettoriali SVG originali basati sui colori sociali
 * e sulla sigla del club, garantendo piena conformità legale senza marchi terzi.
 */
(function () {
  'use strict';

  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getAbbr(team) {
    if (!team) return 'ESC';
    if (team.abbr && String(team.abbr).trim()) {
      return String(team.abbr).trim().toUpperCase().slice(0, 4);
    }
    var name = String(team.name || team.id || 'ESC').trim().toUpperCase();
    // Rimozione prefissi comuni tipo FC, AC, US, SS, AS, ASD
    var clean = name.replace(/^(A\.?S\.?D?\.?|U\.?S\.?D?\.?|F\.?C\.?|A\.?C\.?|S\.?S\.?|G\.?S\.?)\s+/i, '');
    var parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 3) {
      return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase();
    } else if (parts.length === 2 && clean.length > 3) {
      return (parts[0].slice(0, 2) + parts[1][0]).toUpperCase();
    } else if (clean.length >= 3) {
      return clean.slice(0, 3).toUpperCase();
    }
    return (clean || 'ESC').slice(0, 3).toUpperCase();
  }

  function parseColor(col, fallback) {
    if (!col || typeof col !== 'string') return fallback || '#1e293b';
    col = col.trim();
    if (col.startsWith('#') || col.startsWith('rgb')) return col;
    return '#' + col;
  }

  /**
   * Genera il codice SVG puro per un badge di squadra
   * @param {Object} team - Oggetto squadra ({ name, abbr, primary, secondary, year })
   * @param {Object} [opts] - Opzioni ({ size: 128, shape: 'shield' | 'circle' })
   * @returns {string} Stringa SVG pronta per l'uso
   */
  function generateSvg(team, opts) {
    opts = opts || {};
    var size = opts.size;
    var shape = opts.shape || 'shield';
    var abbr = sanitize(opts.abbr || getAbbr(team));
    var p = parseColor(team && team.primary, '#0284c7');
    var s = parseColor(team && team.secondary, '#0f172a');
    var uid = 'eb_' + Math.random().toString(36).substring(2, 9);

    var wAttr = 'width="100%"';
    var hAttr = 'height="100%"';
    if (typeof size === 'number' || (typeof size === 'string' && size.indexOf('%') === -1)) {
      var n = parseInt(size, 10) || 100;
      wAttr = 'width="' + n + '"';
      hAttr = 'height="' + (shape === 'shield' ? Math.round(n * 1.2) : n) + '"';
    }

    if (shape === 'circle') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ' + wAttr + ' ' + hAttr + ' aria-label="' + sanitize((team && team.name) || abbr) + '">' +
        '<defs>' +
          '<radialGradient id="' + uid + '_rad" cx="35%" cy="30%" r="70%">' +
            '<stop offset="0%" stop-color="' + p + '" stop-opacity="0.95"/>' +
            '<stop offset="65%" stop-color="' + s + '" stop-opacity="0.98"/>' +
            '<stop offset="100%" stop-color="#050a14"/>' +
          '</radialGradient>' +
          '<linearGradient id="' + uid + '_rim" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>' +
            '<stop offset="50%" stop-color="' + p + '" stop-opacity="0.6"/>' +
            '<stop offset="100%" stop-color="#ffffff" stop-opacity="0.15"/>' +
          '</linearGradient>' +
          '<filter id="' + uid + '_sh" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>' +
          '</filter>' +
        '</defs>' +
        // Sfondo ombra
        '<circle cx="50" cy="50" r="46" fill="url(#' + uid + '_rad)" filter="url(#' + uid + '_sh)"/>' +
        // Anello concentrico bicolore
        '<circle cx="50" cy="50" r="44" fill="none" stroke="url(#' + uid + '_rim)" stroke-width="2"/>' +
        '<circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="3 3"/>' +
        // Stella decorativa superiore
        '<path d="M50 18 L51.5 22 L56 22 L52.5 24.5 L53.5 29 L50 26.5 L46.5 29 L47.5 24.5 L44 22 L48.5 22 Z" fill="' + p + '" opacity="0.85"/>' +
        // Testo sigla con ombra
        '<text x="50" y="58" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" ' +
          'font-family="Outfit, Inter, system-ui, sans-serif" font-weight="900" font-size="' + (abbr.length > 3 ? '22' : '26') + '" letter-spacing="0.08em" ' +
          'filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">' + abbr + '</text>' +
        // Riflesso superiore a mezzaluna
        '<path d="M12 42 A 44 44 0 0 1 88 42 A 44 26 0 0 0 12 42 Z" fill="#ffffff" opacity="0.07"/>' +
      '</svg>';
    }

    // Default: Scudetto moderno geometrico da competizione
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" ' + wAttr + ' ' + hAttr + ' aria-label="' + sanitize((team && team.name) || abbr) + '">' +
      '<defs>' +
        '<linearGradient id="' + uid + '_body" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="' + p + '" stop-opacity="0.95"/>' +
          '<stop offset="45%" stop-color="' + p + '" stop-opacity="0.8"/>' +
          '<stop offset="55%" stop-color="' + s + '" stop-opacity="0.85"/>' +
          '<stop offset="100%" stop-color="' + s + '" stop-opacity="0.98"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + uid + '_rim" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>' +
          '<stop offset="50%" stop-color="rgba(255,255,255,0.15)"/>' +
          '<stop offset="100%" stop-color="' + p + '" stop-opacity="0.4"/>' +
        '</linearGradient>' +
        '<filter id="' + uid + '_sh" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.65"/>' +
        '</filter>' +
      '</defs>' +
      // Sagoma scudetto principale
      '<path d="M50 4 C76 4 92 14 92 34 C92 78 50 114 50 114 C50 114 8 78 8 34 C8 14 24 4 50 4 Z" ' +
        'fill="url(#' + uid + '_body)" filter="url(#' + uid + '_sh)"/>' +
      // Partitura geometrica bicolore (metà destra ombreggiata per rilievo 3D)
      '<path d="M50 4 C76 4 92 14 92 34 C92 78 50 114 50 114 L50 4 Z" fill="rgba(0,0,0,0.18)"/>' +
      // Bordo scudetto elegante
      '<path d="M50 6 C74 6 89 15 89 34 C89 76 50 110 50 110 C50 110 11 76 11 34 C11 15 26 6 50 6 Z" ' +
        'fill="none" stroke="url(#' + uid + '_rim)" stroke-width="2.5"/>' +
      // Bordo interno sottile tratteggiato
      '<path d="M50 12 C70 12 83 20 83 35 C83 70 50 102 50 102 C50 102 17 70 17 35 C17 20 30 12 50 12 Z" ' +
        'fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3 3"/>' +
      // Barra/Corona orizzontale in alto
      '<path d="M26 22 L74 22" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>' +
      // Stella simbolica
      '<path d="M50 14 L51.5 18 L56 18 L52.5 20.5 L53.5 25 L50 22.5 L46.5 25 L47.5 20.5 L44 18 L48.5 18 Z" fill="#ffffff" opacity="0.85"/>' +
      // Sigla Club a lettere bold
      '<text x="50" y="58" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" ' +
        'font-family="Outfit, Inter, system-ui, sans-serif" font-weight="900" font-size="' + (abbr.length > 3 ? '22' : '26') + '" letter-spacing="0.08em" ' +
        'filter="drop-shadow(0 2px 5px rgba(0,0,0,0.85))">' + abbr + '</text>' +
      // Riflesso lucido superiore
      '<path d="M12 24 C24 10 76 10 88 24 C72 32 28 32 12 24 Z" fill="#ffffff" opacity="0.08"/>' +
    '</svg>';
  }

  /**
   * Converte l'SVG in Data URI per uso diretto in attributo img.src
   */
  function svgUri(team, opts) {
    var svg = generateSvg(team, opts);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /**
   * Monta direttamente il badge dentro un elemento contenitore
   */
  function mount(container, team, opts) {
    if (!container) return;
    container.innerHTML = generateSvg(team, opts);
  }

  window.EliseeBadge = {
    generateSvg: generateSvg,
    svgUri: svgUri,
    mount: mount,
    getAbbr: getAbbr
  };
})();
