---
name: elisee-scout-deploy
description: >
  Dopo OGNI modifica al sito Elisee Scout: aggiorna CONTINUA_DA_QUI.md,
  commit, push GitHub, vercel --prod su https://elisee-scout.vercel.app.
  Obbligatorio a fine task. Trigger: deploy, online, vercel, salva, pusha,
  pubblica, carica online, aggiorna il sito, ELISEE SCOUT SITO, fine modifica.
---

# Deploy + traccia Elisee Scout

Link pubblico: **https://elisee-scout.vercel.app**

Dopo **ogni** modifica, prima di chiudere il task:

1. Aggiorna `CONTINUA_DA_QUI.md` (data, ultimo commit, cosa è cambiato, diario). È il file da cui un altro account Grok riparte.
2. Se hai toccato CSS/JS/HTML, alza `?v=YYYYMMDD_…` in `index.html` e `CACHE` in `sw.js`.
3. Commit (escludi `data/autopilot/*`, `data/auth/*`, `data/manager/state.json`).
4. `git push origin main`
5. Dalla cartella del sito:

```powershell
Set-Location "C:\Users\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO"
vercel --prod
```

Se `C:\Users\...` non esiste: `D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO`.

6. Attendi `Aliased https://elisee-scout.vercel.app` e `Ready`. Confermalo all’utente.

Timeout deploy: almeno 5 minuti. Non usare `--yes`.

Push GitHub: se GCM è su `sfondiitaliani23-svg` può dare 403. Username: `eliseomiraglia2704-source`. Vercel non dipende dal push: pubblica comunque.

Non chiudere un task sul sito senza `vercel --prod`, salvo richiesta esplicita di saltare il deploy.
