# Agenti Campionati · unità = GIRONE

## Piramide (regola fondamentale)

- **Serie C** = 3 gironi (A, B, C). Il vincitore del Girone A, del Girone B e del Girone C sale in **Serie B**.
- **Serie D** = gironi A–I. Il vincitore di **ogni** girone sale in **Serie C**.

Fonte unica nel sito: `piramide-italia.js` (`window.EliseePiramide`).

## Regola agenti
**10 agenti per ogni girone di ogni campionato.**

### Esempio Serie D (come nello screenshot Focus)
| Girone | Agenti |
|--------|--------|
| A | 10 |
| B | 10 |
| C | 10 |
| D | 10 |
| E | 10 |
| F | 10 |
| G | 10 |
| H | 10 |
| I | 10 |
| **Totale Serie D** | **90** |

## Totale flotta

| Campionato | Gironi | Agenti (×10) |
|------------|--------|--------------|
| Promozione | 39 | 390 |
| Terza Categoria | 37 | 370 |
| Prima Categoria | 31 | 310 |
| Seconda Categoria | 31 | 310 |
| Eccellenza | 28 | 280 |
| **Serie D** | **9** | **90** |
| Under 19 / Giovanili | 8 | 80 |
| Serie C | 3 | 30 |
| Femminile A+B | 2 | 20 |
| Serie A, B, Femminile C, C5, Quarta, Amatori, Coppe, Tornei, Svincolati | 16 | 160 |
| **TOTALE GIRONI** | **201** | |
| **TOTALE AGENTI CAMPIONATI** | | **2010** |

### Supervisori H24
- **2 supervisori per ogni girone** (Primary + Backup)
- 201 gironi × 2 = **402 supervisori**
- Controllano i 10 agenti del girone e li riattivano se si bloccano
- Visibili in **Area Admin → tab Agenti IA**

### Cluster ELISEE completo
- Piattaforma: **715**
- Campionati (10×girone): **2010**
- Supervisori H24 (2×girone): **402**
- **Totale: 3127**

## 10 ruoli (per ogni girone)
1. Organici & Squadre  
2. Struttura girone  
3. Calendario  
4. Classifica  
5. Marcatori  
6. Statistiche  
7. Cartellini & Disciplina  
8. Mercato & News  
9. Validatore anti-drift  
10. Orchestratore girone  

## Rigenerare
```bash
python _build_gironi_agents.py
```

## Pagina pubblica
`http://localhost:8765/agenti-campionati.html`
