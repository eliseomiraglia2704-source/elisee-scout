# ELISEE SCOUT — Documentazione e Hub Integrazioni

## PDF consolidato (dimensioni ridotte)

| File | Pagine | Note |
|------|--------|------|
| **Elisee_Scout_COMPLETO_consolidato.pdf** | 341 | Unione di Business Plan + Agenti Task Estesi + Integrazioni 2 + Integrazioni 3 (~0,82 MB, ~12% in meno della somma) |

Sorgenti originali (conservati):
- Elisee_Scout.pdf
- ELISEE_SCOUT_Agenti_IA_Task_Estesi.pdf
- Elisee_Scout_Integrazioni (2).pdf
- Elisee_Scout_Integrazioni_3.pdf
- Elisee_Scout_backup_pre_workflow.pdf (solo backup, non nel consolidato)

## Runtime sul sito

Aprire il sito in HTTPS locale, poi:

1. **Nav** → pulsante **Ops Hub**
2. **Admin** (Control Center) → card **Hub Integrazioni**
3. Menu utente → **Ops Hub Integrazioni**
4. Console: `EliseeIntegrazioni.open()`

Moduli implementati (client-side / localStorage):
- Simulatore Carriera (consenso, bivi, radar, percorso, fine stagione)
- Selettore Squadra
- Eventi selezione + QR + consenso minori
- Match Analyst report 8 blocchi
- Azioni per ruolo (campione)
- Admin blocchi graduati + report Privacy Officer + log append-only
- Catalogo 50 agenti carriera + 9 Ops I3
- KPI operativi I3 §6.10

File tecnici:
- integrazioni-runtime.js
- integrazioni.css

## Avvio

```powershell
cd "D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO"
.\avvia-https.ps1
# https://127.0.0.1:8443/
```

## AutoPilot Mission Control (orchestrazione totale)

**Problema risolto:** molti moduli IA (cluster 715, campionati, supervisori, GDPR, War Room, Hub Integrazioni) partivano separati e non erano gestibili da un unico punto.

**Soluzione:** `autopilot-runtime.js` + `autopilot.css`

### Cosa fa in automatico
1. Avvia e tiene online tutte le flotte abilitate
2. Health-check periodico + **auto-heal** (riavvio se una flotta si ferma)
3. Job operativi ciclici: escalation anomalie, eventi QR, riesami blocchi, Art.22, KPI, campionati, duplicati
4. Scan periodico War Room DOM
5. Log unificato + export JSON

### Come gestirlo
- Chip flottante in basso a destra: **AutoPilot ON**
- Nav: **AutoPilot**
- Admin: card **Mission Control IA**
- Console: `EliseeAutoPilot.open()` / `.getStatus()` / `.stop()` / `.forceCycle()`

### Config (localStorage `elisee_autopilot_cfg_v1`)
- `enabled`, `autoStartOnLoad`, intervalli health/ops/war
- `fleets.*` on/off per ciascuna flotta
- `autoHeal`

Default: **tutto ON all'avvio pagina**.

---

## Backend AutoPilot 24/7 (stack completo)

### Architettura
```
Browser UI (AutoPilot Mission Control)
        │  HTTPS same-origin
        ▼
https_server.py  ──►  /api/autopilot/*  ──►  workers/autopilot_engine.py
        │                                         │
        │                                         ├─ flotte logiche (cluster, campionati, GDPR…)
        │                                         ├─ job ops (eventi, blocchi, integrity…)
        │                                         └─ subprocess tuttocampo_sync.py
        ▼
   file statici del sito
```

Il backend **resta vivo finché il processo Python è avviato**, anche con browser chiuso.

### Avvio consigliato
```powershell
cd "D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO"
.\avvia-tutto.ps1
# oppure: python https_server.py
```

Solo motore (senza sito):
```powershell
python workers\autopilot_headless.py
```

### API (stesso host HTTPS)
| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/api/autopilot/status` | Stato completo |
| GET | `/api/autopilot/health` | Health rapido |
| GET | `/api/autopilot/log?limit=80` | Log backend |
| POST | `/api/autopilot/start` | Avvia |
| POST | `/api/autopilot/stop` | Stop |
| POST | `/api/autopilot/force-cycle` | Ciclo forzato |
| POST | `/api/autopilot/fleet/{id}` | `{"enabled":true}` |
| POST | `/api/autopilot/bridge` | Push snapshot da localStorage |
| POST | `/api/autopilot/config` | Patch config |

### Persistenza
- `data/autopilot/state.json`
- `data/autopilot/log.jsonl`
- `data/autopilot/bridge_*.json` (dal browser)
- `data/campionati/latest.json` (Tuttocampo)

### Console browser
```js
EliseeAutoPilot.backend.poll()
EliseeAutoPilot.backend.start()
EliseeAutoPilot.backend.force()
EliseeAutoPilot.backend.pushBridge()
```
