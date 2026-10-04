---
description: Avvia il server di sviluppo locale in background o fornisce i riferimenti di preview per Elisee Scout.
---

# Preview

Gestisci la preview del sito:

1. **Server Locale**:
   - Il comando di avvio è:

     ```powershell
     python elisee_up.py
     ```

     oppure lanciare `APRI_SITO.bat`.
   - Per avviare il processo in background e continuare a lavorare nella sessione, usa la scorciatoia di Claude Code `Ctrl+B`.
   - Endpoint locale: `http://127.0.0.1:8080/`.
2. **Preview Vercel**:
   - URL di produzione: `https://elisee-scout.vercel.app`.
   - Ispezione build: `vercel inspect` (non eseguire `vercel --prod` senza conferma esplicita `ask`).
3. **Output**:
   - Mostra lo stato di raggiungibilità del server e il link cliccabile.
