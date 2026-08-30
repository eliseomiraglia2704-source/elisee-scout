/**
 * ELISEE SCOUT — Flotta Agenti Campionati (Tuttocampo)
 *
 * UNITÀ = GIRONE (non la sola categoria).
 * CERVELLO: window.EliseePiramide.BRAIN
 *   Serie C: vincitore di ogni girone (A Nord, B Centro, C Sud) → Serie B.
 *   Serie D: vincitore di ogni girone A–I → Serie C.
 * Esempio: Serie D ha 9 gironi (A–I) → 9 × 10 = 90 agenti solo per Serie D.
 *
 * Totale: 10 ruoli × 201 gironi = 2010 agenti campionati.
 *
 * Breakdown:
//   Promozione: 39 gironi → 390 agenti
//   Terza Categoria: 37 gironi → 370 agenti
//   Prima Categoria: 31 gironi → 310 agenti
//   Seconda Categoria: 31 gironi → 310 agenti
//   Eccellenza: 28 gironi → 280 agenti
//   Serie D: 9 gironi → 90 agenti
//   Under 19 / Giovanili: 8 gironi → 80 agenti
//   Serie C: 3 gironi → 30 agenti
//   Femminile: 2 gironi → 20 agenti
//   Serie A: 1 gironi → 10 agenti
//   Serie B: 1 gironi → 10 agenti
//   Femminile Serie C: 1 gironi → 10 agenti
//   Calcio a 5 Serie A: 1 gironi → 10 agenti
//   Calcio a 5 Serie A2: 1 gironi → 10 agenti
//   Calcio a 5 Serie B: 1 gironi → 10 agenti
//   Calcio a 5 Serie C1: 1 gironi → 10 agenti
//   Calcio a 5 Serie C2: 1 gironi → 10 agenti
//   Quarta Categoria: 1 gironi → 10 agenti
//   Amatori: 1 gironi → 10 agenti
//   Coppe dilettanti: 1 gironi → 10 agenti
//   Tornei: 1 gironi → 10 agenti
//   Svincolati / Bacheca: 1 gironi → 10 agenti
 *
 * Generato da _build_gironi_agents.py — non editare a mano i gironi.
 */
(function () {
  'use strict';

  var STORAGE_DATA = 'elisee_campionati_data_v3_gironi';
  var STORAGE_STATE = 'elisee_campionati_agents_v3_gironi';
  var LOG_MAX = 200;
  var TICK_MS = 10000; // allineato al refresh dati automatico (10s)
  var SOURCE_BASE = 'https://www.tuttocampo.it';

  /** 10 ruoli per OGNI girone */
  var ROLES = [
    { key: 'organici', name: 'Organici & Squadre', domain: 'teams', action: 'Aggiorna elenco società del girone', pathHint: 'Squadre' },
    { key: 'gironi', name: 'Struttura girone', domain: 'groups', action: 'Verifica composizione e confini del girone', pathHint: 'Risultati' },
    { key: 'calendario', name: 'Calendario', domain: 'calendar', action: 'Sincronizza calendario e giornate del girone', pathHint: 'Calendario' },
    { key: 'classifica', name: 'Classifica', domain: 'standings', action: 'Aggiorna classifica del girone', pathHint: 'Classifica' },
    { key: 'marcatori', name: 'Marcatori', domain: 'scorers', action: 'Aggiorna marcatori del girone', pathHint: 'Marcatori' },
    { key: 'statistiche', name: 'Statistiche', domain: 'stats', action: 'Elabora statistiche del girone', pathHint: 'Statistiche' },
    { key: 'cartellini', name: 'Cartellini & Disciplina', domain: 'discipline', action: 'Monitora cartellini del girone', pathHint: 'Cartellini' },
    { key: 'mercato', name: 'Mercato & News', domain: 'market', action: 'Rileva news e mercato del girone', pathHint: 'News' },
    { key: 'validatore', name: 'Validatore anti-drift', domain: 'validate', action: 'Confronta fonte vs snapshot del girone', pathHint: 'Squadre' },
    { key: 'orchestratore', name: 'Orchestratore girone', domain: 'orchestrate', action: 'Coordina i 9 ruoli e pubblica snapshot del girone', pathHint: '' },
  ];

  /**
   * Ogni riga = 1 girone di 1 campionato → 10 agenti dedicati.
   * Fonte: focus.html + gironi extra professionisti/C5/altro.
   */
  var GIRONI = [
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'A', title: 'Girone A', area: 'Piemonte · Liguria · area Varese / Milano NW' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'B', title: 'Girone B', area: 'Lombardia · area bergamasca / milanese' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'C', title: 'Girone C', area: 'Veneto · Friuli-Venezia Giulia · Trentino-Alto Adige' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'D', title: 'Girone D', area: 'Emilia-Romagna · Lombardia sud/est · Toscana nord' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'E', title: 'Girone E', area: 'Toscana · Umbria · centro' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'F', title: 'Girone F', area: 'Marche · Abruzzo · Molise · Lazio sud-est' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'G', title: 'Girone G', area: 'Lazio · Sardegna · Campania nord' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'H', title: 'Girone H', area: 'Campania · Puglia · Basilicata' },
    { campionatoId: 'serie-d', campionato: 'Serie D', gironeId: 'I', title: 'Girone I', area: 'Sicilia · Calabria' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'lombardia-a', title: 'Lombardia · Girone A', area: 'Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'lombardia-b', title: 'Lombardia · Girone B', area: 'Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'lombardia-c', title: 'Lombardia · Girone C', area: 'Eccellenza · gironi A–C ufficiali 2026/27 (CR Lombardia)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'piemonte-a', title: 'Piemonte / VdA · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'piemonte-b', title: 'Piemonte / VdA · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'veneto-a', title: 'Veneto · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'veneto-b', title: 'Veneto · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'fvg', title: 'Friuli-Venezia Giulia', area: 'Eccellenza · girone unico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'trentino', title: 'Trentino-Alto Adige', area: 'Eccellenza · girone unico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'liguria', title: 'Liguria', area: 'Eccellenza · girone unico 2026/27' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'emilia-a', title: 'Emilia-Romagna · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'emilia-b', title: 'Emilia-Romagna · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'toscana-a', title: 'Toscana · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'toscana-b', title: 'Toscana · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'marche', title: 'Marche', area: 'Eccellenza · organico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'umbria', title: 'Umbria', area: 'Eccellenza · girone unico ufficiale 2026/27 (16 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'lazio-a', title: 'Lazio · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'lazio-b', title: 'Lazio · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'abruzzo', title: 'Abruzzo', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'molise', title: 'Molise', area: 'Eccellenza · organico ufficiale 2026/27 (15 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'campania-a', title: 'Campania · Girone A', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'campania-b', title: 'Campania · Girone B', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'puglia', title: 'Puglia', area: 'Eccellenza · organico ufficiale 2026/27 (18 squadre)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'basilicata', title: 'Basilicata', area: 'Eccellenza · girone unico 2026/27' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'calabria', title: 'Calabria', area: 'Eccellenza · organico ufficiale 2026/27 (CR Calabria)' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'sicilia-a', title: 'Sicilia · Girone A', area: 'Eccellenza · 2 gironi 2026/27' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'sicilia-b', title: 'Sicilia · Girone B', area: 'Eccellenza · 2 gironi 2026/27' },
    { campionatoId: 'eccellenza', campionato: 'Eccellenza', gironeId: 'sardegna', title: 'Sardegna', area: 'Eccellenza · girone unico 2026/27' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'calabria-a', title: 'Calabria · Girone A', area: 'Promozione · organico ufficiale 2026/27' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'calabria-b', title: 'Calabria · Girone B', area: 'Promozione · organico ufficiale 2026/27' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'puglia-a', title: 'Puglia · Girone A', area: 'Promozione · aventi diritto 2026/27 (LND/dp24/Tuttocampo)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'puglia-b', title: 'Puglia · Girone B', area: 'Promozione · aventi diritto 2026/27 (LND/dp24/Tuttocampo)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lombardia-a', title: 'Lombardia · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lombardia-b', title: 'Lombardia · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lombardia-c', title: 'Lombardia · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lombardia-d', title: 'Lombardia · Girone D', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lazio-a', title: 'Lazio · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lazio-b', title: 'Lazio · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'lazio-c', title: 'Lazio · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'campania-a', title: 'Campania · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'campania-b', title: 'Campania · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'campania-c', title: 'Campania · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'toscana-a', title: 'Toscana · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'toscana-b', title: 'Toscana · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'toscana-c', title: 'Toscana · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'veneto-a', title: 'Veneto · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'veneto-b', title: 'Veneto · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'veneto-c', title: 'Veneto · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'emilia-a', title: 'Emilia-Romagna · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'emilia-b', title: 'Emilia-Romagna · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'emilia-c', title: 'Emilia-Romagna · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'piemonte-a', title: 'Piemonte · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'piemonte-b', title: 'Piemonte · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'sicilia-a', title: 'Sicilia · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'sicilia-b', title: 'Sicilia · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'sicilia-c', title: 'Sicilia · Girone C', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'marche-a', title: 'Marche · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'marche-b', title: 'Marche · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'abruzzo-a', title: 'Abruzzo · Girone A', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'abruzzo-b', title: 'Abruzzo · Girone B', area: 'Promozione · gironi regionali 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'liguria', title: 'Liguria', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'basilicata', title: 'Basilicata', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'umbria', title: 'Umbria', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'molise', title: 'Molise', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'sardegna', title: 'Sardegna', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'fvg', title: 'Friuli-Venezia Giulia', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'promozione', campionato: 'Promozione', gironeId: 'trentino', title: 'Trentino-Alto Adige', area: 'Promozione · stagione 2026/27 (iscrizioni / aventi diritto, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'puglia', title: 'Puglia', area: 'Prima Categoria · aventi diritto 2026/27 completi (LND/dp24)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'calabria-a', title: 'Calabria · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'calabria-b', title: 'Calabria · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'basilicata', title: 'Basilicata', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'campania-a', title: 'Campania · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'campania-b', title: 'Campania · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'lazio-a', title: 'Lazio · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'lazio-b', title: 'Lazio · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'toscana-a', title: 'Toscana · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'toscana-b', title: 'Toscana · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'lombardia-a', title: 'Lombardia · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'lombardia-b', title: 'Lombardia · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'lombardia-c', title: 'Lombardia · Girone C', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'emilia-a', title: 'Emilia-Romagna · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'emilia-b', title: 'Emilia-Romagna · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'veneto-a', title: 'Veneto · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'veneto-b', title: 'Veneto · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'piemonte-a', title: 'Piemonte · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'piemonte-b', title: 'Piemonte · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'liguria', title: 'Liguria', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'sicilia-a', title: 'Sicilia · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'sicilia-b', title: 'Sicilia · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'sardegna', title: 'Sardegna', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'abruzzo-a', title: 'Abruzzo · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'abruzzo-b', title: 'Abruzzo · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'marche-a', title: 'Marche · Girone A', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'marche-b', title: 'Marche · Girone B', area: 'Prima Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'umbria', title: 'Umbria', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'molise', title: 'Molise', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'fvg', title: 'Friuli-Venezia Giulia', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'prima-cat', campionato: 'Prima Categoria', gironeId: 'trentino', title: 'Trentino-Alto Adige', area: 'Prima Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'puglia', title: 'Puglia', area: 'Seconda Categoria · aventi diritto 2026/27 completi (LND/dp24)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'calabria-a', title: 'Calabria · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'calabria-b', title: 'Calabria · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'basilicata', title: 'Basilicata', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'campania-a', title: 'Campania · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'campania-b', title: 'Campania · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'lazio-a', title: 'Lazio · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'lazio-b', title: 'Lazio · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'toscana-a', title: 'Toscana · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'toscana-b', title: 'Toscana · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'lombardia-a', title: 'Lombardia · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'lombardia-b', title: 'Lombardia · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'lombardia-c', title: 'Lombardia · Girone C', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'emilia-a', title: 'Emilia-Romagna · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'emilia-b', title: 'Emilia-Romagna · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'veneto-a', title: 'Veneto · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'veneto-b', title: 'Veneto · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'piemonte-a', title: 'Piemonte · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'piemonte-b', title: 'Piemonte · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'liguria', title: 'Liguria', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'sicilia-a', title: 'Sicilia · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'sicilia-b', title: 'Sicilia · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'sardegna', title: 'Sardegna', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'abruzzo-a', title: 'Abruzzo · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'abruzzo-b', title: 'Abruzzo · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'marche-a', title: 'Marche · Girone A', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'marche-b', title: 'Marche · Girone B', area: 'Seconda Categoria · gironi regionali 2026/27 (estratto iscrizioni, in aggiornamento)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'umbria', title: 'Umbria', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'molise', title: 'Molise', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'fvg', title: 'Friuli-Venezia Giulia', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'seconda-cat', campionato: 'Seconda Categoria', gironeId: 'trentino', title: 'Trentino-Alto Adige', area: 'Seconda Categoria · stagione 2026/27 (estratto iscrizioni / panorama dilettanti)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-ba', title: 'Puglia · Bari', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-br', title: 'Puglia · Brindisi', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-fg', title: 'Puglia · Foggia', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-le', title: 'Puglia · Lecce', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-mg', title: 'Puglia · Maglie', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-ta', title: 'Puglia · Taranto', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'puglia-bt', title: 'Puglia · Trani / BAT', area: 'Terza Categoria · aventi diritto 2026/27 (dp24)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'calabria-a', title: 'Calabria · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'calabria-b', title: 'Calabria · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'campania-a', title: 'Campania · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'campania-b', title: 'Campania · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'lazio-a', title: 'Lazio · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'lazio-b', title: 'Lazio · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'toscana-a', title: 'Toscana · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'toscana-b', title: 'Toscana · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'lombardia-a', title: 'Lombardia · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'lombardia-b', title: 'Lombardia · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'lombardia-c', title: 'Lombardia · Girone C', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'emilia-a', title: 'Emilia-Romagna · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'emilia-b', title: 'Emilia-Romagna · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'veneto-a', title: 'Veneto · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'veneto-b', title: 'Veneto · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'piemonte-a', title: 'Piemonte · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'piemonte-b', title: 'Piemonte · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'liguria', title: 'Liguria', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'sicilia-a', title: 'Sicilia · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'sicilia-b', title: 'Sicilia · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'sardegna', title: 'Sardegna', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'abruzzo-a', title: 'Abruzzo · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'abruzzo-b', title: 'Abruzzo · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'marche-a', title: 'Marche · Girone A', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'marche-b', title: 'Marche · Girone B', area: 'Terza Categoria · gironi 2026/27 (estratto, in aggiornamento)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'umbria', title: 'Umbria', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'molise', title: 'Molise', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'basilicata', title: 'Basilicata', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'fvg', title: 'Friuli-Venezia Giulia', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'terza-cat', campionato: 'Terza Categoria', gironeId: 'trentino', title: 'Trentino-Alto Adige', area: 'Terza Categoria · 2026/27 (estratto provinciale/regionale)' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'juniores-naz', title: 'Juniores Nazionali U19', area: 'Iscrizione d\'ufficio società Serie D · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'nord-ovest', title: 'Nord-Ovest (Piemonte · Liguria · Lombardia)', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'nord-est', title: 'Nord-Est (Veneto · FVG · Trentino)', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'emilia', title: 'Emilia-Romagna', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'centro', title: 'Centro (Toscana · Umbria · Marche · Lazio)', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'abruzzo-molise', title: 'Abruzzo · Molise', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'sud', title: 'Sud (Campania · Puglia · Basilicata · Calabria)', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'under-19', campionato: 'Under 19 / Giovanili', gironeId: 'isole', title: 'Isole (Sicilia · Sardegna)', area: 'Settore giovanile / Juniores · 2026/27' },
    { campionatoId: 'femminile', campionato: 'Femminile', gironeId: 'serie-a', title: 'Serie A Femminile', area: 'Organico ufficiale 2026/27 · 12 squadre' },
    { campionatoId: 'femminile', campionato: 'Femminile', gironeId: 'serie-b', title: 'Serie B Femminile', area: 'Organico ufficiale 2026/27 · 14 squadre' },
    { campionatoId: 'serie-a', campionato: 'Serie A', gironeId: 'unico', title: 'Girone unico', area: 'Professionisti · 2026/27' },
    { campionatoId: 'serie-b', campionato: 'Serie B', gironeId: 'unico', title: 'Girone unico', area: 'Professionisti · 2026/27' },
    { campionatoId: 'serie-c', campionato: 'Serie C', gironeId: 'A', title: 'Girone A', area: 'Professionisti · 2026/27' },
    { campionatoId: 'serie-c', campionato: 'Serie C', gironeId: 'B', title: 'Girone B', area: 'Professionisti · 2026/27' },
    { campionatoId: 'serie-c', campionato: 'Serie C', gironeId: 'C', title: 'Girone C', area: 'Professionisti · 2026/27' },
    { campionatoId: 'femminile-c', campionato: 'Femminile Serie C', gironeId: 'unico', title: 'Girone unico', area: 'Femminile · 2026/27' },
    { campionatoId: 'c5-a', campionato: 'Calcio a 5 Serie A', gironeId: 'unico', title: 'Girone unico', area: 'Calcio a 5 · 2026/27' },
    { campionatoId: 'c5-a2', campionato: 'Calcio a 5 Serie A2', gironeId: 'unico', title: 'Girone unico', area: 'Calcio a 5 · 2026/27' },
    { campionatoId: 'c5-b', campionato: 'Calcio a 5 Serie B', gironeId: 'unico', title: 'Girone unico', area: 'Calcio a 5 · 2026/27' },
    { campionatoId: 'c5-c1', campionato: 'Calcio a 5 Serie C1', gironeId: 'unico', title: 'Girone unico', area: 'Calcio a 5 · 2026/27' },
    { campionatoId: 'c5-c2', campionato: 'Calcio a 5 Serie C2', gironeId: 'unico', title: 'Girone unico', area: 'Calcio a 5 · 2026/27' },
    { campionatoId: 'quarta-cat', campionato: 'Quarta Categoria', gironeId: 'unico', title: 'Girone unico / ambiti', area: 'Dilettanti · 2026/27' },
    { campionatoId: 'amatori', campionato: 'Amatori', gironeId: 'unico', title: 'Ambito nazionale', area: 'Amatori · 2026/27' },
    { campionatoId: 'coppe', campionato: 'Coppe dilettanti', gironeId: 'unico', title: 'Ambito nazionale', area: 'Coppe · 2026/27' },
    { campionatoId: 'tornei', campionato: 'Tornei', gironeId: 'unico', title: 'Ambito nazionale', area: 'Tornei · 2026/27' },
    { campionatoId: 'svincolati', campionato: 'Svincolati / Bacheca', gironeId: 'nazionale', title: 'Ambito nazionale', area: 'Bacheca Tuttocampo / ELISEE' },
  ];

  var agents = [];
  var dataStore = { version: 3, unit: 'girone', updatedAt: null, gironi: {} };
  var log = [];
  var cursor = 0;
  var running = false;
  var timer = null;
  var startedAt = null;
  var cycleCount = 0;

  function codeFor(g, roleKey, roleIndex) {
    var c = String(g.campionatoId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    var gr = String(g.gironeId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    var r = roleKey.slice(0, 3).toUpperCase();
    return 'TC-' + c + '-' + gr + '-' + r + '-' + String(roleIndex).padStart(2, '0');
  }

  function tcUrl(g, role) {
    var camp = g.campionatoId;
    var map = {
      'serie-d': 'SerieD',
      eccellenza: 'Eccellenza',
      promozione: 'Promozione',
      'prima-cat': 'PrimaCategoria',
      'seconda-cat': 'SecondaCategoria',
      'terza-cat': 'TerzaCategoria',
      'under-19': 'JunioresRegionaliU19',
      femminile: 'FemminileSerieA',
      'serie-a': 'SerieA',
      'serie-b': 'SerieB',
      'serie-c': 'SerieC',
      'femminile-c': 'FemminileSerieC',
      'c5-a': 'CalcioA5SerieA',
      'c5-a2': 'CalcioA5SerieA2',
      'c5-b': 'CalcioA5SerieB',
      'c5-c1': 'CalcioA5SerieC1',
      'c5-c2': 'CalcioA5SerieC2',
      'quarta-cat': 'QuartaCategoria',
      amatori: 'Amatori',
      svincolati: 'BachecaAnnunciCalcio'
    };
    var family = map[camp] || 'SerieD';
    var view = role.pathHint || 'Squadre';
    var gid = g.gironeId;
    // Serie D: gironi A–I
    if (camp === 'serie-d' && /^[A-I]$/i.test(gid)) {
      return SOURCE_BASE + '/Italia/SerieD/Girone' + gid.toUpperCase() + '/' + (view || 'Squadre');
    }
    if (camp === 'serie-c' && /^[ABC]$/i.test(gid)) {
      return SOURCE_BASE + '/Italia/SerieC/Girone' + gid.toUpperCase() + '/' + (view || 'Squadre');
    }
    if (camp === 'svincolati') {
      return SOURCE_BASE + '/Italia/BachecaAnnunciCalcio';
    }
    // default: region-ish from girone id prefix
    var reg = 'Italia';
    var low = String(gid).toLowerCase();
    if (low.indexOf('puglia') === 0 || low.indexOf('pug') === 0) reg = 'Puglia';
    else if (low.indexOf('calabria') === 0) reg = 'Calabria';
    else if (low.indexOf('lombardia') === 0) reg = 'Lombardia';
    else if (low.indexOf('lazio') === 0) reg = 'Lazio';
    else if (low.indexOf('toscana') === 0) reg = 'Toscana';
    else if (low.indexOf('campania') === 0) reg = 'Campania';
    else if (low.indexOf('sicilia') === 0) reg = 'Sicilia';
    else if (low.indexOf('veneto') === 0) reg = 'Veneto';
    else if (low.indexOf('emilia') === 0) reg = 'Emilia-Romagna';
    else if (low.indexOf('piemonte') === 0) reg = 'Piemonte';
    else if (low.indexOf('marche') === 0) reg = 'Marche';
    else if (low.indexOf('abruzzo') === 0) reg = 'Abruzzo';
    else if (low.indexOf('liguria') === 0) reg = 'Liguria';
    else if (low.indexOf('umbria') === 0) reg = 'Umbria';
    else if (low.indexOf('molise') === 0) reg = 'Molise';
    else if (low.indexOf('sardegna') === 0 || low === 'sardegna') reg = 'Sardegna';
    else if (low.indexOf('basilicata') === 0) reg = 'Basilicata';
    else if (low.indexOf('fvg') === 0) reg = 'Friuli-Venezia-Giulia';
    else if (low.indexOf('trentino') === 0) reg = 'Trentino';

    var letter = (low.match(/-([a-d])$/) || [])[1];
    if (letter) {
      return SOURCE_BASE + '/' + reg + '/' + family + '/Girone' + letter.toUpperCase() + '/' + (view || 'Squadre');
    }
    return SOURCE_BASE + '/' + reg + '/' + family + '/' + (view || 'Squadre');
  }

  function buildFleet() {
    agents = [];
    var n = 0;
    GIRONI.forEach(function (g) {
      ROLES.forEach(function (role, ri) {
        n += 1;
        agents.push({
          id: g.campionatoId + ':' + g.gironeId + ':' + role.key,
          code: codeFor(g, role.key, ri + 1),
          index: n,
          campionatoId: g.campionatoId,
          campionato: g.campionato,
          gironeId: g.gironeId,
          gironeTitle: g.title,
          area: g.area,
          roleKey: role.key,
          roleName: role.name,
          domain: role.domain,
          action: role.action,
          pathHint: role.pathHint,
          status: 'idle',
          lastRun: null,
          lastOk: null,
          lastError: null,
          ops: 0,
          sourceUrl: null
        });
      });
    });
    return agents;
  }

  function bucketKey(g) {
    return g.campionatoId + '::' + g.gironeId;
  }

  function ensureBucket(g) {
    var k = typeof g === 'string' ? g : bucketKey(g);
    if (!dataStore.gironi[k]) {
      dataStore.gironi[k] = {
        teams: [],
        calendar: [],
        standings: [],
        scorers: [],
        stats: {},
        discipline: [],
        market: [],
        meta: { lastSync: null, source: SOURCE_BASE, errors: 0, ok: 0 }
      };
    }
    return dataStore.gironi[k];
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_DATA);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.gironi) dataStore = parsed;
      }
    } catch (_) {}
  }

  function save() {
    dataStore.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_DATA, JSON.stringify(dataStore));
      localStorage.setItem(
        STORAGE_STATE,
        JSON.stringify({
          running: running,
          cycleCount: cycleCount,
          startedAt: startedAt,
          totalAgents: agents.length,
          totalGironi: GIRONI.length
        })
      );
    } catch (_) {}
  }

  function pushLog(entry) {
    log.unshift(
      Object.assign({ t: new Date().toISOString(), tLabel: new Date().toLocaleTimeString('it-IT') }, entry)
    );
    if (log.length > LOG_MAX) log.length = LOG_MAX;
    document.dispatchEvent(new CustomEvent('elisee:campionati-agent-log', { detail: entry }));
    renderPublicIfAny();
  }

  function findGirone(campId, gironeId) {
    for (var i = 0; i < GIRONI.length; i++) {
      if (GIRONI[i].campionatoId === campId && GIRONI[i].gironeId === gironeId) return GIRONI[i];
    }
    return null;
  }

  // Circuit breaker: se il server locale è giù, non spammiamo fetch (console rossa)
  var offlineUntil = 0;
  var OFFLINE_COOLDOWN_MS = 45000;
  var lastLocalJson = null;

  function markOffline() {
    offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
  }

  function isOffline() {
    return Date.now() < offlineUntil;
  }

  function fetchSource(url) {
    // MAI fetch diretto a tuttocampo.it dal browser (CORS).
    // Se server offline → solo cache in-memory, zero rete.
    if (isOffline()) {
      if (lastLocalJson) return Promise.resolve({ ok: true, json: lastLocalJson, via: 'memory-cache' });
      return Promise.resolve({ ok: false, via: 'cache', reason: 'server-offline' });
    }
    var localUrl = 'data/campionati/latest.json?t=' + Date.now();
    return fetch(localUrl, { method: 'GET', credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('no local');
        return r.json();
      })
      .then(function (json) {
        lastLocalJson = json;
        offlineUntil = 0;
        return { ok: true, json: json, via: 'local-json' };
      })
      .catch(function () {
        // Un solo retry proxy; se fallisce → cooldown (niente cascade ERR_CONNECTION_REFUSED)
        var proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
        return fetch(proxyUrl, { method: 'GET', credentials: 'same-origin', cache: 'no-store' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            offlineUntil = 0;
            return res.text();
          })
          .then(function (html) {
            return { ok: true, html: html, via: 'proxy-live' };
          })
          .catch(function () {
            markOffline();
            if (lastLocalJson) return { ok: true, json: lastLocalJson, via: 'memory-cache' };
            return { ok: false, via: 'cache', reason: 'offline-or-worker' };
          });
      });
  }

  function applyUpdate(agent, g, payload) {
    var bucket = ensureBucket(g);
    var now = new Date().toISOString();
    bucket.meta.lastSync = now;
    bucket.meta.source = agent.sourceUrl || SOURCE_BASE;
    if (payload.via === 'cache' || payload.ok === false) {
      bucket.meta.errors += 1;
      bucket.meta.heartbeat = now;
      return { applied: 'heartbeat-cache', count: (bucket.teams && bucket.teams.length) || 0 };
    }
    bucket.meta.ok += 1;
    if (agent.domain === 'orchestrate') {
      bucket.meta.publishedAt = now;
      document.dispatchEvent(
        new CustomEvent('elisee:campionati-girone-updated', {
          detail: { campionatoId: g.campionatoId, gironeId: g.gironeId, bucket: bucket }
        })
      );
      return { applied: 'publish', count: 1 };
    }
    if (agent.domain === 'validate') {
      bucket.meta.lastValidate = now;
      return { applied: 'validate', count: (bucket.teams && bucket.teams.length) || 0 };
    }
    // soft touch domains
    var key = agent.domain;
    if (key === 'stats') {
      bucket.stats = bucket.stats || {};
      bucket.stats.updatedAt = now;
      bucket.stats.source = agent.sourceUrl;
    } else if (key === 'teams' || key === 'groups') {
      bucket.meta.touchTeams = now;
    } else {
      var arrKey =
        key === 'calendar'
          ? 'calendar'
          : key === 'standings'
            ? 'standings'
            : key === 'scorers'
              ? 'scorers'
              : key === 'discipline'
                ? 'discipline'
                : 'market';
      bucket[arrKey] = bucket[arrKey] || [];
      bucket[arrKey].push({ updatedAt: now, source: agent.sourceUrl });
      if (bucket[arrKey].length > 40) bucket[arrKey] = bucket[arrKey].slice(-40);
    }
    return { applied: key + '-touch', count: 1 };
  }

  function runAgent(agent) {
    var g = findGirone(agent.campionatoId, agent.gironeId);
    if (!g) return Promise.resolve(null);
    var role = null;
    for (var i = 0; i < ROLES.length; i++) {
      if (ROLES[i].key === agent.roleKey) role = ROLES[i];
    }
    if (!role) return Promise.resolve(null);

    agent.status = 'running';
    agent.lastRun = new Date().toISOString();
    agent.sourceUrl = tcUrl(g, role);
    var t0 = performance.now();

    return fetchSource(agent.sourceUrl).then(function (payload) {
      var result = applyUpdate(agent, g, payload);
      agent.ops += 1;
      agent.status = payload.ok || payload.via === 'cache' ? 'ok' : 'warn';
      if (agent.status === 'ok') agent.lastOk = agent.lastRun;
      agent.lastError = payload.ok === false ? payload.reason || 'fetch-failed' : null;
      var latency = Math.round(performance.now() - t0);

      pushLog({
        agent: agent.code,
        campionato: g.campionato,
        girone: g.title,
        role: role.name,
        action: role.action,
        url: agent.sourceUrl,
        via: payload.via,
        applied: result.applied,
        count: result.count,
        latencyMs: latency,
        status: agent.status
      });

      if (window.EliseeAICluster && typeof window.EliseeAICluster.logEvent === 'function') {
        window.EliseeAICluster.logEvent(
          'campionati',
          agent.code + ' · ' + g.campionato + ' · ' + g.title + ' · ' + role.action,
          { source: 'campionati-agents', latencyMs: latency, agent: agent.code }
        );
      }
      save();
      return result;
    });
  }

  function tick() {
    if (!running || !agents.length) return;
    var agent = agents[cursor % agents.length];
    cursor += 1;
    if (cursor % agents.length === 0) cycleCount += 1;
    runAgent(agent).catch(function (err) {
      agent.status = 'error';
      agent.lastError = String(err && err.message ? err.message : err);
      pushLog({
        agent: agent.code,
        campionato: agent.campionato,
        girone: agent.gironeTitle,
        role: agent.roleName,
        action: 'Errore ciclo',
        status: 'error',
        error: agent.lastError
      });
      save();
    });
  }

  function start(opts) {
    if (running) return getSummary();
    buildFleet();
    load();
    running = true;
    startedAt = new Date().toISOString();
    cursor = 0;
    pushLog({
      agent: 'TC-SYS-BOOT',
      campionato: 'Sistema',
      girone: '—',
      role: 'Boot',
      action:
        'Avvio flotta ' +
        agents.length +
        ' agenti = 10 ruoli × ' +
        GIRONI.length +
        ' gironi (es. Serie D 9×10=90)',
      status: 'ok'
    });
    var i = 0;
    function warm() {
      if (i >= Math.min(agents.length, 20)) {
        timer = setInterval(tick, (opts && opts.intervalMs) || TICK_MS);
        return;
      }
      runAgent(agents[i]);
      i += 1;
      setTimeout(warm, 120);
    }
    warm();
    save();
    renderPublicIfAny();
    return getSummary();
  }

  function stop() {
    running = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    pushLog({
      agent: 'TC-SYS-STOP',
      campionato: 'Sistema',
      girone: '—',
      role: 'Stop',
      action: 'Arresto flotta agenti per girone',
      status: 'ok'
    });
    save();
  }

  function getSummary() {
    var byCamp = {};
    GIRONI.forEach(function (g) {
      if (!byCamp[g.campionato]) {
        byCamp[g.campionato] = { campionato: g.campionato, gironi: 0, agents: 0, ops: 0 };
      }
      byCamp[g.campionato].gironi += 1;
      byCamp[g.campionato].agents += ROLES.length;
    });
    agents.forEach(function (a) {
      if (byCamp[a.campionato]) byCamp[a.campionato].ops += a.ops;
    });
    var list = Object.keys(byCamp)
      .map(function (k) {
        return byCamp[k];
      })
      .sort(function (a, b) {
        return b.gironi - a.gironi;
      });

    return {
      unit: 'girone',
      totalAgents: agents.length || GIRONI.length * ROLES.length,
      rolesPerGirone: ROLES.length,
      totalGironi: GIRONI.length,
      formula: ROLES.length + ' agenti × ' + GIRONI.length + ' gironi = ' + (GIRONI.length * ROLES.length),
      exampleSerieD: {
        gironi: 9,
        agents: 90,
        note: 'Serie D: Gironi A–I → 9 × 10 = 90 agenti'
      },
      running: running,
      cycleCount: cycleCount,
      startedAt: startedAt,
      updatedAt: dataStore.updatedAt,
      source: SOURCE_BASE,
      byCampionato: list,
      roles: ROLES.map(function (r) {
        return { key: r.key, name: r.name, domain: r.domain };
      })
    };
  }

  function getAgents() {
    return agents.slice();
  }
  function getLog() {
    return log.slice();
  }
  function getGironi() {
    return GIRONI.slice();
  }

  function getAgentsForGirone(campionatoId, gironeId) {
    return agents.filter(function (a) {
      return a.campionatoId === campionatoId && a.gironeId === gironeId;
    });
  }

  function findAgentById(id) {
    for (var i = 0; i < agents.length; i++) {
      if (agents[i].id === id || agents[i].code === id) return agents[i];
    }
    return null;
  }

  /**
   * Riattiva un agente bloccato (chiamato dai Supervisori H24).
   */
  function reactivateAgent(agentId, reason) {
    var agent = findAgentById(agentId);
    if (!agent) return Promise.resolve(null);
    var prev = agent.status;
    agent.status = 'idle';
    agent.lastError = null;
    agent.reactivatedAt = new Date().toISOString();
    agent.reactivateCount = (agent.reactivateCount || 0) + 1;
    pushLog({
      agent: agent.code,
      campionato: agent.campionato,
      girone: agent.gironeTitle,
      role: agent.roleName,
      action: 'Riattivazione istantanea' + (reason ? ' · ' + reason : '') + ' (era: ' + prev + ')',
      status: 'ok',
      via: 'supervisor'
    });
    document.dispatchEvent(
      new CustomEvent('elisee:campionati-agent-reactivated', {
        detail: { agent: agent, reason: reason || 'manual', previousStatus: prev }
      })
    );
    return runAgent(agent);
  }

  function setAgentStatus(agentId, status, errorMsg) {
    var agent = findAgentById(agentId);
    if (!agent) return;
    agent.status = status;
    if (errorMsg) agent.lastError = errorMsg;
    if (status === 'error') agent.lastError = errorMsg || agent.lastError || 'blocked';
    save();
  }

  function renderPublicIfAny() {
    var root = document.getElementById('campionati-agents-public');
    if (!root) return;
    var summary = getSummary();
    var feed = log
      .slice(0, 30)
      .map(function (e) {
        return (
          '<div class="ca-feed-row">' +
          '<span class="ca-time">' +
          (e.tLabel || '') +
          '</span>' +
          '<span class="ca-agent">' +
          (e.agent || '') +
          '</span>' +
          '<span class="ca-cat">' +
          (e.campionato || '') +
          ' · ' +
          (e.girone || '') +
          '</span>' +
          '<span class="ca-act">' +
          (e.action || '') +
          (e.via ? ' · <em>' + e.via + '</em>' : '') +
          '</span>' +
          '<span class="ca-st ca-st-' +
          (e.status || 'ok') +
          '">' +
          (e.status || '') +
          '</span></div>'
        );
      })
      .join('');

    var cards = (summary.byCampionato || [])
      .map(function (c) {
        return (
          '<article class="ca-card">' +
          '<h3>' +
          c.campionato +
          '</h3>' +
          '<p class="ca-metric"><strong>' +
          c.gironi +
          '</strong> gironi</p>' +
          '<p class="ca-metric"><strong>' +
          c.agents +
          '</strong> agenti <span style="color:#94a3b8;font-weight:600;font-size:0.85rem">(×10)</span></p>' +
          '<p class="ca-sub">Ops: ' +
          c.ops +
          '</p></article>'
        );
      })
      .join('');

    // Sample agents table (first 80 + note)
    var sample = agents.slice(0, 80);
    var tableRows = sample
      .map(function (a) {
        return (
          '<tr><td>' +
          a.code +
          '</td><td>' +
          a.campionato +
          '</td><td>' +
          a.gironeTitle +
          '</td><td>' +
          a.roleName +
          '</td><td>' +
          a.status +
          '</td><td>' +
          a.ops +
          '</td></tr>'
        );
      })
      .join('');

    root.innerHTML =
      '<section class="ca-hero">' +
      '<p class="ca-kicker">ELISEE SCOUT · Flotta pubblica · unità = GIRONE</p>' +
      '<h1>Agenti Campionati Tuttocampo</h1>' +
      '<p class="ca-lead"><strong>' +
      summary.formula +
      '</strong>. Esempio: Serie D ha 9 gironi (A–I) → <strong>90 agenti</strong> solo per quel campionato. Poi lo stesso per ogni girone di ogni altro campionato.</p>' +
      '<div class="ca-stats">' +
      '<div><strong>' +
      summary.totalAgents +
      '</strong><span>Agenti totali</span></div>' +
      '<div><strong>' +
      summary.totalGironi +
      '</strong><span>Gironi coperti</span></div>' +
      '<div><strong>' +
      summary.rolesPerGirone +
      '</strong><span>Ruoli / girone</span></div>' +
      '<div><strong>90</strong><span>Solo Serie D (9×10)</span></div>' +
      '<div><strong>' +
      (summary.running ? 'LIVE' : 'OFF') +
      '</strong><span>Stato flotta</span></div>' +
      '<div><strong>' +
      summary.cycleCount +
      '</strong><span>Cicli completi</span></div>' +
      '</div></section>' +
      '<section class="ca-panel"><h2>Agenti per campionato (gironi × 10)</h2><div class="ca-grid">' +
      cards +
      '</div></section>' +
      '<section class="ca-panel"><h2>Attività in tempo reale</h2><div class="ca-feed">' +
      (feed || '<p class="ca-empty">In attesa del primo ciclo…</p>') +
      '</div></section>' +
      '<section class="ca-panel"><h2>Registro agenti (anteprima 80 di ' +
      agents.length +
      ')</h2>' +
      '<div class="ca-table-wrap"><table class="ca-table"><thead><tr>' +
      '<th>Codice</th><th>Campionato</th><th>Girone</th><th>Ruolo</th><th>Stato</th><th>Ops</th>' +
      '</tr></thead><tbody>' +
      tableRows +
      '</tbody></table></div>' +
      '<p class="ca-sub" style="margin-top:0.75rem">Registro completo in memoria: ' +
      agents.length +
      ' agenti (10 per ogni girone).</p></section>';
  }

  var api = {
    TOTAL: function () {
      return agents.length || GIRONI.length * ROLES.length;
    },
    ROLES: ROLES,
    GIRONI: GIRONI,
    start: start,
    stop: stop,
    tick: tick,
    getSummary: getSummary,
    getAgents: getAgents,
    getAgentsForGirone: getAgentsForGirone,
    getLog: getLog,
    getGironi: getGironi,
    reactivateAgent: reactivateAgent,
    setAgentStatus: setAgentStatus,
    findAgentById: findAgentById,
    isRunning: function () {
      return running;
    },
    renderPublic: renderPublicIfAny,
    SOURCE: SOURCE_BASE
  };

  window.EliseeCampionatiAgents = api;

  function boot() {
    buildFleet();
    load();
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
