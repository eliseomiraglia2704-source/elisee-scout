ELISEE SCOUT — Manager Elisee Scout
===================================
Candidature manager, proposte anagrafica squadra, suggerimenti modulo/XI.

File generato dal server:
  data/manager/state.json  (gitignored; su Vercel è /tmp, effimero)

Admin: area riservata → chip "Manager Elisee" → tre colonne:
  Candidature | Proposte modifica | Formazioni / moduli
Accetta / Declina.
Accettare una proposta anagrafica scrive i campi in data/squadre/catalog.json.
Accettare una formazione la rende ufficiale (officialLineups + localStorage elisee_official_xi).

Contratto API: GET/POST /api/manager
  view=me | view=admin | view=official&teamId=
  action=apply | propose | propose-lineup | decide (kind=application|proposal|lineup)
