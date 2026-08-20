ELISEE SCOUT — Auth reale
=========================

Email + password
  Registrazione e accesso passano da:
    POST /api/auth/register
    POST /api/auth/login
  Gli account sono in data/auth/users.json (password hash PBKDF2, mai in chiaro).

Google (opzionale)
  1. Google Cloud Console → API e servizi → Credenziali → ID client OAuth 2.0
  2. Tipo: applicazione Web
  3. Origini JavaScript autorizzate: http://127.0.0.1:8080
  4. Incolla il Client ID in data/auth/config.json → "googleClientId"
  5. Riavvia elisee_up.py
