---
description: Scansiona i fogli di stile del progetto rilevando l'uso di !important, regole duplicate, selettori orfani e stili inline.
arguments:
  - name: target
    description: File o cartella specifica da analizzare (default 'tutto il progetto')
    required: false
---

# Pulisci CSS

Attiva il subagent `css-cleaner` ed esegui la scansione del CSS per il target `$ARGUMENTS` (o per l'intero repository):

1. **Scansione `!important`**:
   - Individua tutte le righe contenenti `!important` nei file `.css`.
   - Per ciascuna, determina se può essere sostituita aumentando la specificità di classe o riordinando i file nel `<head>`.
2. **Scansione Stili Inline**:
   - Cerca attributi `style="..."` all'interno di `index.html` o nei moduli JS con stringhe template HTML.
3. **Selettori Orfani**:
   - Cerca classi CSS definite che non hanno alcun match nel markup HTML né negli script JS.
4. **Output**:
   - Genera una proposta di bonifica suddivisa per file, con codice attuale e snippet suggerito per la correzione pulita.
   - Non applicare modifiche senza approvazione esplicita.
