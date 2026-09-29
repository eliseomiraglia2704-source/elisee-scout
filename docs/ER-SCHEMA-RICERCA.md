# Schema ER — Entità e Relazioni della Ricerca (Elisee Scout)

Documento di riferimento architetturale per le entità coinvolte nelle ricerche, nei filtri e nelle candidature di Elisee Scout.

---

## 1. Diagramma Entità-Relazione (ER)

```mermaid
erDiagram
    CLUB ||--o{ ANNUNCIO : "pubblica (1:N)"
    CLUB ||--o{ ROSA_CALCIATORE : "tessera (1:N)"
    CLUB ||--o{ CANDIDATURA_MANAGER : "riceve (1:N)"
    CLUB ||--o{ PARTITA : "disputa (1:N)"
    
    UTENTE_PROFILO ||--o{ ANNUNCIO : "pubblica come atleta/privato (1:N)"
    UTENTE_PROFILO ||--o{ CANDIDATURA_ANNUNCIO : "invia (1:N)"
    UTENTE_PROFILO ||--o{ CANDIDATURA_MANAGER : "invia (1:N)"
    UTENTE_PROFILO ||--o{ SCHEDA_TECNICA : "possiede (1:1)"
    
    ANNUNCIO ||--o{ CANDIDATURA_ANNUNCIO : "riceve (1:N)"
    CANDIDATURA_ANNUNCIO ||--|| SCHEDA_TECNICA : "allega dossier IA (1:1)"

    CLUB {
        string id PK "Identificatore univoco stabile (es. UUID o slug normalizzato)"
        string nome "Denominazione ufficiale club (FIGC/LND)"
        string citta "Comune sede"
        string provincia "Sigla provincia (es. FG, BA, RM)"
        string regione "Regione italiana"
        string categoria "Campionato (Serie A .. Eccellenza .. Terza Cat)"
        float lat "Coordinata latitudine stadio"
        float lng "Coordinata longitudine stadio"
        string logo_url "Percorso logo club"
        string stadio "Nome impianto sportivo"
        int capienza "Capienza spettatori"
    }

    UTENTE_PROFILO {
        string id PK "ID utente univoco (es. u_xxx o UUID Supabase)"
        string email "Email univoca account"
        string nome "Nome di battesimo"
        string cognome "Cognome"
        date data_nascita "Data di nascita ISO YYYY-MM-DD"
        string ruolo_primario "Ruolo sportivo primario (enum)"
        string piede "Piede dominante (Destro/Sinistro/Ambidestro)"
        string stato_tesseramento "Svincolato / Tesserato / In cerca"
        string club_id FK "Riferimento al Club di appartenenza (se tesserato)"
        string livello_autorizzazione "Tifoso / Calciatore / Staff / DS / Scout / Admin"
        boolean verificato "Documento di identità approvato"
    }

    ANNUNCIO {
        string id PK "ID univoco annuncio (es. ann-YYYYMMDD-hash)"
        string categoria "Tipo annuncio (7 categorie: cerco_squadra, cerco_giocatore, ecc.)"
        string titolo "Titolo sintetico dell'opportunità"
        string descrizione "Testo descrittivo condizioni e requisiti"
        string autore_id FK "ID profilo utente che ha inserito l'annuncio"
        string club_id FK "ID del club di riferimento (opzionale se inserito da calciatore)"
        string ruolo "Ruolo ricercato o offerto (enum normalizzato)"
        string zona_citta "Comune geografico di riferimento"
        string zona_provincia "Provincia"
        string zona_regione "Regione"
        int raggio_km "Raggio di disponibilità territoriale (km)"
        boolean under "Fuoriquota Under riservato"
        boolean housing "Disponibilità vitto e alloggio"
        boolean svincolato "Riservato o aperto a svincolati"
        string stato "attivo | chiuso | scaduto"
        timestamp data_creazione "Data e ora di pubblicazione ISO"
        timestamp data_scadenza "Data di scadenza automatica ISO"
    }

    CANDIDATURA_ANNUNCIO {
        string id PK "ID univoco candidatura"
        string annuncio_id FK "Riferimento all'annuncio"
        string profilo_id FK "Riferimento al profilo candidato"
        string stato "nuova | in valutazione | shortlist | scartata"
        string note "Messaggio di presentazione o motivazione"
        timestamp created_at "Data invio candidatura"
    }

    SCHEDA_TECNICA {
        string id PK "ID univoco scheda tecnica"
        string candidatura_id FK "Riferimento alla candidatura o al profilo"
        int match_score "Punteggio di affinità calcolato dall'IA (0-100)"
        string heatmap "Mappa termica di rendimento"
        json metriche_atletiche "Dati telemetria GPS (HSR, sprint, distanza)"
        json attributi_tecnici "Valutazioni tecniche per ruolo"
        string video_url "Link highlight o video provino"
        string cv_url "Documento curriculum sportivo"
    }

    CANDIDATURA_MANAGER {
        string id PK "ID univoco richiesta di gestione club"
        string team_id FK "ID del club da gestire"
        string email "Email del richiedente"
        string name "Nome e cognome richiedente"
        string role_at_club "Ruolo ricoperto presso la società"
        string motivation "Motivazione della richiesta"
        string status "pending | accepted | declined"
        timestamp created_at "Data richiesta"
    }
```

---

## 2. Regole di Integrità Referenziale

1. **Club (`club_id`)**:
   - Ogni riferimento a `club_id` in annunci, candidature, rose e formazioni deve corrispondere a un record esistente in `CLUB`.
   - Se un annuncio è pubblicato da un atleta svincolato (`cerco_squadra`), il campo `club_id` è nullo (`NULL`), mentre `autore_id` è obbligatorio.

2. **Unicità delle Candidature (Anti-Duplicazione)**:
   - È vietata la doppia candidatura attiva per la stessa coppia `(annuncio_id, profilo_id)`. Vincolo: `UNIQUE(annuncio_id, profilo_id)`.
   - Per le richieste di gestione club: `UNIQUE(team_id, email, status='pending')`.

3. **Separazione tra Fonte di Verità e Cache di Lettura**:
   - **Fonte di Verità (Master)**: Record normalizzati con chiavi esterne.
   - **Cache di Lettura (KV / Elastic / In-Memory)**: Documento denormalizzato contenente i campi del Club (`nome`, `logo`, `citta`, `categoria`) pre-innestati all'interno dell'oggetto dell'annuncio per garantire ricerche a latenza ultra-bassa (<20ms).
