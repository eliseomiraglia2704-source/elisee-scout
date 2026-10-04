---
name: gdpr-minori
description: Protocollo normativo e tecnico per la gestione di dati personali, tutela dei minori (Under 18), consenso genitoriale e verifica documentale. Attivare SEMPRE prima di modificare form, input di registrazione, date di nascita o gestione utenti.
---

# Skill: Protezione Dati Personali, Tutela Minori & Anti-Fake

Riferimento normativo: Art. 8, 13 e 30 del Regolamento UE 2016/679 (GDPR) e D.Lgs. 36/2021 (Riforma del Lavoro Sportivo).

## 1. Classificazione "Modifica Sensibile"

Qualsiasi intervento sul codice che tocchi:

- Campi data di nascita (`#reg-dob`, `#es-slide-dob`, input anagrafici)
- Calcolo della maggiore o minore età (funzione `isMinor()` in `app.js`)
- Moduli di consenso genitoriale / tutore legale
- Caricamento documenti di identità (`verifica-account.js`)
- Tabella trattative private o Secret List

è categorizzato come **SENSIBILE**. È severamente vietato modificare il codice prima che il piano sia stato esplicitamente approvato dall'utente.

## 2. Preservazione del Formato ISO `YYYY-MM-DD`

I sistemi di verifica dell'età (`isMinor()`) si basano su stringhe di data conformi allo standard ISO `YYYY-MM-DD`.

- Quando si introducono componenti di visualizzazione formattata (es. `gg/mm/aaaa`), l'evento `change` o `input` emesso verso il form deve SEMPRE sincronizzare l'input nativo con il valore ISO valido.
- Non alterare i nomi degli attributi `name="dob"`, `id="reg-dob"` o i selettori utilizzati dagli script di verifica.

## 3. Flusso Tutela Minori (Under 18)

- Se l'età calcolata è inferiore a 18 anni:
  1. È obbligatorio mostrare i campi aggiuntivi per il nominativo, codice fiscale e indirizzo email del genitore o tutore legale.
  2. Nessun dato di contatto diretto del minore (telefono o email personale) deve essere reso pubblico nella bacheca o nel profilo senza il consenso del tutore.
  3. L'informativa specifica ex art. 13 GDPR per minori deve essere presentata con linguaggio comprensibile e chiaro.

## 4. Workflow Anti-Fake Account (30 Giorni)

- Dopo l'assegnazione di un ruolo non-Tifoso (es. Calciatore, Allenatore, DS, Scout), l'utente ha 30 giorni di tempo per allegare documento di riconoscimento + selfie di verifica (`verifica-account.js`).
- Durante questo periodo, l'interfaccia mostra avvisi persistenti.
- Allo scadere dei 30 giorni senza verifica, l'account viene automaticamente congelato. Non eludere o disattivare mai questo controllo di sicurezza.
