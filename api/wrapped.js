/**
 * ============================================================================
 * ELISEE SCOUT — API SERVERLESS SEASON WRAPPED
 * Endpoint: /api/wrapped
 * Supporta azioni:
 *  - GET ?action=me : Restituisce payload Wrapped utente autenticato
 *  - POST ?action=share : Traccia evento di condivisione social per analytics
 *  - GET ?action=countdown : Timestamp rilascio e contatore iscritti promemoria
 *  - POST ?action=optin : Iscrizione al promemoria Wrapped Day
 * ============================================================================
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Elisee-Admin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = searchParams.get('action') || (req.body && req.body.action) || 'countdown';
  const season = searchParams.get('season') || '2025-26';

  try {
    if (action === 'countdown') {
      return res.status(200).json({
        ok: true,
        season: season,
        release_date: '2026-06-15T20:00:00Z',
        subscribers_count: 8230,
        days_remaining: Math.max(0, Math.floor((new Date('2026-06-15T20:00:00Z').getTime() - Date.now()) / 86400000))
      });
    }

    if (action === 'optin' && req.method === 'POST') {
      return res.status(200).json({
        ok: true,
        message: 'Iscrizione al promemoria registrata con successo',
        subscribers_count: 8231
      });
    }

    if (action === 'share' && req.method === 'POST') {
      const { channel, slide_id, user_handle } = req.body || {};
      return res.status(200).json({
        ok: true,
        message: 'Evento di condivisione tracciato per growth attribution',
        tracking: {
          channel: channel || 'instagram_stories',
          slide_id: slide_id || 'finale',
          user_handle: user_handle || '@anonymous',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === 'me') {
      return res.status(200).json({
        ok: true,
        user_id: 'usr_active',
        role: 'player',
        season: season,
        eligible: true,
        team_id: 'team_official',
        metrics: {
          distance_total_km: 142.3,
          distance_comparison_label: 'Roma - Napoli',
          top_speed_kmh: 32.4,
          top_speed_context: {
            opponent_name: 'Virtus Academy',
            match_date: '2026-04-14'
          },
          best_month: {
            month_name: 'Novembre',
            goals: 4,
            assists: 3
          },
          heatmap_zone_label: 'fascia sinistra',
          overall_rating_start: 78,
          overall_rating_end: 84
        },
        final_badge: {
          badge_id: 'freccia_della_fascia',
          badge_label: 'Freccia della Fascia',
          rationale: 'top_3pct_lateral_zone_performance'
        }
      });
    }

    return res.status(400).json({ ok: false, error: 'Azione non supportata' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Errore interno Season Wrapped' });
  }
}
