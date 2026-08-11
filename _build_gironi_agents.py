# -*- coding: utf-8 -*-
"""
Genera campionati-agents.js con 10 agenti PER OGNI GIRONE di ogni campionato.
Fonte gironi: focus.html (SERIE_D, ECCELLENZA, …) + gironi extra pro/C5.
"""
from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parent
FOCUS = ROOT / "focus.html"
OUT = ROOT / "campionati-agents.js"
SUMMARY = ROOT / "data" / "campionati" / "gironi-summary.json"

ROLES = [
    ("organici", "Organici & Squadre", "teams", "Aggiorna elenco società del girone", "Squadre"),
    ("gironi", "Struttura girone", "groups", "Verifica composizione e confini del girone", "Risultati"),
    ("calendario", "Calendario", "calendar", "Sincronizza calendario e giornate del girone", "Calendario"),
    ("classifica", "Classifica", "standings", "Aggiorna classifica del girone", "Classifica"),
    ("marcatori", "Marcatori", "scorers", "Aggiorna marcatori del girone", "Marcatori"),
    ("statistiche", "Statistiche", "stats", "Elabora statistiche del girone", "Statistiche"),
    ("cartellini", "Cartellini & Disciplina", "discipline", "Monitora cartellini del girone", "Cartellini"),
    ("mercato", "Mercato & News", "market", "Rileva news e mercato del girone", "News"),
    ("validatore", "Validatore anti-drift", "validate", "Confronta fonte vs snapshot del girone", "Squadre"),
    ("orchestratore", "Orchestratore girone", "orchestrate", "Coordina i 9 ruoli e pubblica snapshot del girone", ""),
]


def extract_gironi():
    js = FOCUS.read_text(encoding="utf-8")
    mapping = [
        ("SERIE_D", "serie-d", "Serie D"),
        ("ECCELLENZA", "eccellenza", "Eccellenza"),
        ("PROMOZIONE", "promozione", "Promozione"),
        ("PRIMA_CAT", "prima-cat", "Prima Categoria"),
        ("SECONDA_CAT", "seconda-cat", "Seconda Categoria"),
        ("TERZA_CAT", "terza-cat", "Terza Categoria"),
        ("UNDER19", "under-19", "Under 19 / Giovanili"),
        ("FEMMINILE", "femminile", "Femminile"),
    ]
    gironi = []
    for varname, camp_id, camp_title in mapping:
        m = re.search(r"var " + varname + r" = (\[.*?\n  \];)", js, re.S)
        if not m:
            continue
        block = m.group(1)
        for gm in re.finditer(
            r"G\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'",
            block,
        ):
            gid = gm.group(1)
            title = gm.group(2).replace("\\'", "'")
            area = gm.group(3).replace("\\'", "'")
            gironi.append(
                {
                    "campionatoId": camp_id,
                    "campionato": camp_title,
                    "gironeId": gid,
                    "title": title,
                    "area": area,
                }
            )

    # Extra campionati/gironi Tuttocampo non nel Focus UI
    extras = [
        ("serie-a", "Serie A", "unico", "Girone unico", "Professionisti · 2026/27"),
        ("serie-b", "Serie B", "unico", "Girone unico", "Professionisti · 2026/27"),
        ("serie-c", "Serie C", "A", "Girone A", "Professionisti · 2026/27"),
        ("serie-c", "Serie C", "B", "Girone B", "Professionisti · 2026/27"),
        ("serie-c", "Serie C", "C", "Girone C", "Professionisti · 2026/27"),
        ("femminile-c", "Femminile Serie C", "unico", "Girone unico", "Femminile · 2026/27"),
        ("c5-a", "Calcio a 5 Serie A", "unico", "Girone unico", "Calcio a 5 · 2026/27"),
        ("c5-a2", "Calcio a 5 Serie A2", "unico", "Girone unico", "Calcio a 5 · 2026/27"),
        ("c5-b", "Calcio a 5 Serie B", "unico", "Girone unico", "Calcio a 5 · 2026/27"),
        ("c5-c1", "Calcio a 5 Serie C1", "unico", "Girone unico", "Calcio a 5 · 2026/27"),
        ("c5-c2", "Calcio a 5 Serie C2", "unico", "Girone unico", "Calcio a 5 · 2026/27"),
        ("quarta-cat", "Quarta Categoria", "unico", "Girone unico / ambiti", "Dilettanti · 2026/27"),
        ("amatori", "Amatori", "unico", "Ambito nazionale", "Amatori · 2026/27"),
        ("coppe", "Coppe dilettanti", "unico", "Ambito nazionale", "Coppe · 2026/27"),
        ("tornei", "Tornei", "unico", "Ambito nazionale", "Tornei · 2026/27"),
        ("svincolati", "Svincolati / Bacheca", "nazionale", "Ambito nazionale", "Bacheca Tuttocampo / ELISEE"),
    ]
    for camp_id, camp_title, gid, title, area in extras:
        gironi.append(
            {
                "campionatoId": camp_id,
                "campionato": camp_title,
                "gironeId": gid,
                "title": title,
                "area": area,
            }
        )
    return gironi


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def main():
    gironi = extract_gironi()
    n_gironi = len(gironi)
    n_roles = len(ROLES)
    n_agents = n_gironi * n_roles

    # breakdown by campionato
    by_camp = {}
    for g in gironi:
        by_camp.setdefault(g["campionato"], []).append(g)

    summary = {
        "unit": "girone",
        "rolesPerGirone": n_roles,
        "totalGironi": n_gironi,
        "totalAgents": n_agents,
        "formula": f"{n_roles} agenti × {n_gironi} gironi = {n_agents}",
        "byCampionato": {
            k: {"gironi": len(v), "agenti": len(v) * n_roles}
            for k, v in sorted(by_camp.items(), key=lambda x: -len(x[1]))
        },
        "example": {
            "Serie D": {
                "gironi": len(by_camp.get("Serie D", [])),
                "agenti": len(by_camp.get("Serie D", [])) * n_roles,
                "note": "9 gironi A–I × 10 agenti = 90",
            }
        },
    }
    SUMMARY.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    # Emit JS gironi array
    gironi_js_lines = []
    for g in gironi:
        gironi_js_lines.append(
            "    { campionatoId: '%s', campionato: '%s', gironeId: '%s', title: '%s', area: '%s' },"
            % (
                js_escape(g["campionatoId"]),
                js_escape(g["campionato"]),
                js_escape(g["gironeId"]),
                js_escape(g["title"]),
                js_escape(g["area"]),
            )
        )

    roles_js = []
    for key, name, domain, action, hint in ROLES:
        roles_js.append(
            "    { key: '%s', name: '%s', domain: '%s', action: '%s', pathHint: '%s' },"
            % (key, js_escape(name), domain, js_escape(action), js_escape(hint))
        )

    # Build summary table for HTML comment
    rows = []
    for camp, gs in sorted(by_camp.items(), key=lambda x: -len(x[1])):
        rows.append(f"//   {camp}: {len(gs)} gironi → {len(gs)*n_roles} agenti")

    content = f"""/**
 * ELISEE SCOUT — Flotta Agenti Campionati (Tuttocampo)
 *
 * UNITÀ = GIRONE (non la sola categoria).
 * Esempio: Serie D ha 9 gironi (A–I) → 9 × 10 = 90 agenti solo per Serie D.
 *
 * Totale: {n_roles} ruoli × {n_gironi} gironi = {n_agents} agenti campionati.
 *
 * Breakdown:
{chr(10).join(rows)}
 *
 * Generato da _build_gironi_agents.py — non editare a mano i gironi.
 */
(function () {{
  'use strict';

  var STORAGE_DATA = 'elisee_campionati_data_v3_gironi';
  var STORAGE_STATE = 'elisee_campionati_agents_v3_gironi';
  var LOG_MAX = 200;
  var TICK_MS = 3500;
  var SOURCE_BASE = 'https://www.tuttocampo.it';

  /** 10 ruoli per OGNI girone */
  var ROLES = [
{chr(10).join(roles_js)}
  ];

  /**
   * Ogni riga = 1 girone di 1 campionato → 10 agenti dedicati.
   * Fonte: focus.html + gironi extra professionisti/C5/altro.
   */
  var GIRONI = [
{chr(10).join(gironi_js_lines)}
  ];

  var agents = [];
  var dataStore = {{ version: 3, unit: 'girone', updatedAt: null, gironi: {{}} }};
  var log = [];
  var cursor = 0;
  var running = false;
  var timer = null;
  var startedAt = null;
  var cycleCount = 0;

  function codeFor(g, roleKey, roleIndex) {{
    var c = String(g.campionatoId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    var gr = String(g.gironeId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    var r = roleKey.slice(0, 3).toUpperCase();
    return 'TC-' + c + '-' + gr + '-' + r + '-' + String(roleIndex).padStart(2, '0');
  }}

  function tcUrl(g, role) {{
    var camp = g.campionatoId;
    var map = {{
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
    }};
    var family = map[camp] || 'SerieD';
    var view = role.pathHint || 'Squadre';
    var gid = g.gironeId;
    // Serie D: gironi A–I
    if (camp === 'serie-d' && /^[A-I]$/i.test(gid)) {{
      return SOURCE_BASE + '/Italia/SerieD/Girone' + gid.toUpperCase() + '/' + (view || 'Squadre');
    }}
    if (camp === 'serie-c' && /^[ABC]$/i.test(gid)) {{
      return SOURCE_BASE + '/Italia/SerieC/Girone' + gid.toUpperCase() + '/' + (view || 'Squadre');
    }}
    if (camp === 'svincolati') {{
      return SOURCE_BASE + '/Italia/BachecaAnnunciCalcio';
    }}
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
    if (letter) {{
      return SOURCE_BASE + '/' + reg + '/' + family + '/Girone' + letter.toUpperCase() + '/' + (view || 'Squadre');
    }}
    return SOURCE_BASE + '/' + reg + '/' + family + '/' + (view || 'Squadre');
  }}

  function buildFleet() {{
    agents = [];
    var n = 0;
    GIRONI.forEach(function (g) {{
      ROLES.forEach(function (role, ri) {{
        n += 1;
        agents.push({{
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
        }});
      }});
    }});
    return agents;
  }}

  function bucketKey(g) {{
    return g.campionatoId + '::' + g.gironeId;
  }}

  function ensureBucket(g) {{
    var k = typeof g === 'string' ? g : bucketKey(g);
    if (!dataStore.gironi[k]) {{
      dataStore.gironi[k] = {{
        teams: [],
        calendar: [],
        standings: [],
        scorers: [],
        stats: {{}},
        discipline: [],
        market: [],
        meta: {{ lastSync: null, source: SOURCE_BASE, errors: 0, ok: 0 }}
      }};
    }}
    return dataStore.gironi[k];
  }}

  function load() {{
    try {{
      var raw = localStorage.getItem(STORAGE_DATA);
      if (raw) {{
        var parsed = JSON.parse(raw);
        if (parsed && parsed.gironi) dataStore = parsed;
      }}
    }} catch (_) {{}}
  }}

  function save() {{
    dataStore.updatedAt = new Date().toISOString();
    try {{
      localStorage.setItem(STORAGE_DATA, JSON.stringify(dataStore));
      localStorage.setItem(
        STORAGE_STATE,
        JSON.stringify({{
          running: running,
          cycleCount: cycleCount,
          startedAt: startedAt,
          totalAgents: agents.length,
          totalGironi: GIRONI.length
        }})
      );
    }} catch (_) {{}}
  }}

  function pushLog(entry) {{
    log.unshift(
      Object.assign({{ t: new Date().toISOString(), tLabel: new Date().toLocaleTimeString('it-IT') }}, entry)
    );
    if (log.length > LOG_MAX) log.length = LOG_MAX;
    document.dispatchEvent(new CustomEvent('elisee:campionati-agent-log', {{ detail: entry }}));
    renderPublicIfAny();
  }}

  function findGirone(campId, gironeId) {{
    for (var i = 0; i < GIRONI.length; i++) {{
      if (GIRONI[i].campionatoId === campId && GIRONI[i].gironeId === gironeId) return GIRONI[i];
    }}
    return null;
  }}

  function fetchSource(url) {{
    // MAI fetch diretto cross-origin (CORS). Local JSON worker → proxy same-origin.
    var localUrl = 'data/campionati/latest.json?t=' + Date.now();
    return fetch(localUrl, {{ method: 'GET', credentials: 'same-origin', cache: 'no-store' }})
      .then(function (r) {{
        if (!r.ok) throw new Error('no local');
        return r.json();
      }})
      .then(function (json) {{
        return {{ ok: true, json: json, via: 'local-json' }};
      }})
      .catch(function () {{
        var proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
        return fetch(proxyUrl, {{ method: 'GET', credentials: 'same-origin', cache: 'no-store' }})
          .then(function (res) {{
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
          }})
          .then(function (html) {{
            return {{ ok: true, html: html, via: 'proxy-live' }};
          }})
          .catch(function () {{
            return {{ ok: false, via: 'cache', reason: 'offline-or-worker' }};
          }});
      }});
  }}

  function applyUpdate(agent, g, payload) {{
    var bucket = ensureBucket(g);
    var now = new Date().toISOString();
    bucket.meta.lastSync = now;
    bucket.meta.source = agent.sourceUrl || SOURCE_BASE;
    if (payload.via === 'cache' || payload.ok === false) {{
      bucket.meta.errors += 1;
      bucket.meta.heartbeat = now;
      return {{ applied: 'heartbeat-cache', count: (bucket.teams && bucket.teams.length) || 0 }};
    }}
    bucket.meta.ok += 1;
    if (agent.domain === 'orchestrate') {{
      bucket.meta.publishedAt = now;
      document.dispatchEvent(
        new CustomEvent('elisee:campionati-girone-updated', {{
          detail: {{ campionatoId: g.campionatoId, gironeId: g.gironeId, bucket: bucket }}
        }})
      );
      return {{ applied: 'publish', count: 1 }};
    }}
    if (agent.domain === 'validate') {{
      bucket.meta.lastValidate = now;
      return {{ applied: 'validate', count: (bucket.teams && bucket.teams.length) || 0 }};
    }}
    // soft touch domains
    var key = agent.domain;
    if (key === 'stats') {{
      bucket.stats = bucket.stats || {{}};
      bucket.stats.updatedAt = now;
      bucket.stats.source = agent.sourceUrl;
    }} else if (key === 'teams' || key === 'groups') {{
      bucket.meta.touchTeams = now;
    }} else {{
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
      bucket[arrKey].push({{ updatedAt: now, source: agent.sourceUrl }});
      if (bucket[arrKey].length > 40) bucket[arrKey] = bucket[arrKey].slice(-40);
    }}
    return {{ applied: key + '-touch', count: 1 }};
  }}

  function runAgent(agent) {{
    var g = findGirone(agent.campionatoId, agent.gironeId);
    if (!g) return Promise.resolve(null);
    var role = null;
    for (var i = 0; i < ROLES.length; i++) {{
      if (ROLES[i].key === agent.roleKey) role = ROLES[i];
    }}
    if (!role) return Promise.resolve(null);

    agent.status = 'running';
    agent.lastRun = new Date().toISOString();
    agent.sourceUrl = tcUrl(g, role);
    var t0 = performance.now();

    return fetchSource(agent.sourceUrl).then(function (payload) {{
      var result = applyUpdate(agent, g, payload);
      agent.ops += 1;
      agent.status = payload.ok || payload.via === 'cache' ? 'ok' : 'warn';
      if (agent.status === 'ok') agent.lastOk = agent.lastRun;
      agent.lastError = payload.ok === false ? payload.reason || 'fetch-failed' : null;
      var latency = Math.round(performance.now() - t0);

      pushLog({{
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
      }});

      if (window.EliseeAICluster && typeof window.EliseeAICluster.logEvent === 'function') {{
        window.EliseeAICluster.logEvent(
          'campionati',
          agent.code + ' · ' + g.campionato + ' · ' + g.title + ' · ' + role.action,
          {{ source: 'campionati-agents', latencyMs: latency, agent: agent.code }}
        );
      }}
      save();
      return result;
    }});
  }}

  function tick() {{
    if (!running || !agents.length) return;
    var agent = agents[cursor % agents.length];
    cursor += 1;
    if (cursor % agents.length === 0) cycleCount += 1;
    runAgent(agent).catch(function (err) {{
      agent.status = 'error';
      agent.lastError = String(err && err.message ? err.message : err);
      pushLog({{
        agent: agent.code,
        campionato: agent.campionato,
        girone: agent.gironeTitle,
        role: agent.roleName,
        action: 'Errore ciclo',
        status: 'error',
        error: agent.lastError
      }});
      save();
    }});
  }}

  function start(opts) {{
    if (running) return getSummary();
    buildFleet();
    load();
    running = true;
    startedAt = new Date().toISOString();
    cursor = 0;
    pushLog({{
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
    }});
    var i = 0;
    function warm() {{
      if (i >= Math.min(agents.length, 20)) {{
        timer = setInterval(tick, (opts && opts.intervalMs) || TICK_MS);
        return;
      }}
      runAgent(agents[i]);
      i += 1;
      setTimeout(warm, 120);
    }}
    warm();
    save();
    renderPublicIfAny();
    return getSummary();
  }}

  function stop() {{
    running = false;
    if (timer) {{
      clearInterval(timer);
      timer = null;
    }}
    pushLog({{
      agent: 'TC-SYS-STOP',
      campionato: 'Sistema',
      girone: '—',
      role: 'Stop',
      action: 'Arresto flotta agenti per girone',
      status: 'ok'
    }});
    save();
  }}

  function getSummary() {{
    var byCamp = {{}};
    GIRONI.forEach(function (g) {{
      if (!byCamp[g.campionato]) {{
        byCamp[g.campionato] = {{ campionato: g.campionato, gironi: 0, agents: 0, ops: 0 }};
      }}
      byCamp[g.campionato].gironi += 1;
      byCamp[g.campionato].agents += ROLES.length;
    }});
    agents.forEach(function (a) {{
      if (byCamp[a.campionato]) byCamp[a.campionato].ops += a.ops;
    }});
    var list = Object.keys(byCamp)
      .map(function (k) {{
        return byCamp[k];
      }})
      .sort(function (a, b) {{
        return b.gironi - a.gironi;
      }});

    return {{
      unit: 'girone',
      totalAgents: agents.length || GIRONI.length * ROLES.length,
      rolesPerGirone: ROLES.length,
      totalGironi: GIRONI.length,
      formula: ROLES.length + ' agenti × ' + GIRONI.length + ' gironi = ' + (GIRONI.length * ROLES.length),
      exampleSerieD: {{
        gironi: 9,
        agents: 90,
        note: 'Serie D: Gironi A–I → 9 × 10 = 90 agenti'
      }},
      running: running,
      cycleCount: cycleCount,
      startedAt: startedAt,
      updatedAt: dataStore.updatedAt,
      source: SOURCE_BASE,
      byCampionato: list,
      roles: ROLES.map(function (r) {{
        return {{ key: r.key, name: r.name, domain: r.domain }};
      }})
    }};
  }}

  function getAgents() {{
    return agents.slice();
  }}
  function getLog() {{
    return log.slice();
  }}
  function getGironi() {{
    return GIRONI.slice();
  }}

  function renderPublicIfAny() {{
    var root = document.getElementById('campionati-agents-public');
    if (!root) return;
    var summary = getSummary();
    var feed = log
      .slice(0, 30)
      .map(function (e) {{
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
      }})
      .join('');

    var cards = (summary.byCampionato || [])
      .map(function (c) {{
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
      }})
      .join('');

    // Sample agents table (first 80 + note)
    var sample = agents.slice(0, 80);
    var tableRows = sample
      .map(function (a) {{
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
      }})
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
  }}

  var api = {{
    TOTAL: function () {{
      return agents.length || GIRONI.length * ROLES.length;
    }},
    ROLES: ROLES,
    GIRONI: GIRONI,
    start: start,
    stop: stop,
    tick: tick,
    getSummary: getSummary,
    getAgents: getAgents,
    getLog: getLog,
    getGironi: getGironi,
    renderPublic: renderPublicIfAny,
    SOURCE: SOURCE_BASE
  }};

  window.EliseeCampionatiAgents = api;

  function boot() {{
    buildFleet();
    load();
    start();
  }}

  if (document.readyState === 'loading') {{
    document.addEventListener('DOMContentLoaded', boot);
  }} else {{
    boot();
  }}
}})();
"""

    OUT.write_text(content, encoding="utf-8")
    print("Wrote", OUT)
    print("Gironi:", n_gironi)
    print("Agents:", n_agents)
    print("Formula:", summary["formula"])
    print("By campionato:")
    for k, v in summary["byCampionato"].items():
        print(f"  {k}: {v['gironi']} gironi → {v['agenti']} agenti")


if __name__ == "__main__":
    main()
