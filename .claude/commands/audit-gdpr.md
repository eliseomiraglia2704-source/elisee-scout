---
description: Esegue un audit di conformità GDPR e tutela minori sul git diff corrente, verificando che non vi siano alterazioni a campi anagrafici, calcolo età o consensi.
---

# Audit GDPR

Attiva il subagent `gdpr-reviewer` ed esamina il diff delle modifiche correnti:

1. **Scansione Diff**:
   - Esegui `git diff` e analizza le righe aggiunte/modificate.
2. **Controlli di Conformità**:
   - Sono stati modificati input di date di nascita (`#reg-dob`, `#es-slide-dob`)?
   - È stata alterata la funzione `isMinor()` in `app.js` o il calcolo del compimento dei 18 anni?
   - È preservato il formato di data ISO `YYYY-MM-DD`?
   - Sono stati toccati i campi per il consenso del tutore legale o l'informativa ex art. 13 GDPR?
   - Il timer di 30 giorni anti-fake (`verifica-account.js`) è rimasto invariato?
3. **Output**:
   - Genera un report di conformità (CONFORME / SENSIBILE / BLOCCO CRITICO).
   - Se il diff tocca aree anagrafiche, elenca le precauzioni necessarie e richiedi l'approvazione del piano prima del commit.
