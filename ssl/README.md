# SSL/TLS — Elisee Scout

## Stato

| Ambiente | Protocollo | Certificato |
|----------|------------|-------------|
| **Locale (dev)** | HTTPS TLS 1.2 / 1.3 | Self-signed (`ssl/cert.pem` + `ssl/key.pem`) |
| **Produzione** | HTTPS TLS 1.2 / 1.3 | Let's Encrypt o certificato commerciale |

Il sito statico **deve** essere servito solo su HTTPS: cifratura del canale, integrità e trust browser.

## Avvio locale

```powershell
cd "D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO"

# 1) (opzionale) rigenera certificati
python ssl\generate_certs.py

# 2) avvia server HTTPS
python https_server.py
```

Oppure:

```powershell
.\avvia-https.ps1
```

Apri: **https://127.0.0.1:8443/**

- Porta HTTPS: `8443`
- Porta HTTP: `8765` → redirect 301 verso HTTPS
- Al primo accesso il browser avvisa (cert self-signed): Avanzate → Procedi a localhost

### Dipendenze

```powershell
python -m pip install cryptography   # solo per generate_certs.py
```

`https_server.py` usa solo la libreria standard Python (`ssl`, `http.server`).

## Cosa implementa il server

1. **TLS 1.2 minimo / TLS 1.3** se disponibile
2. **Cipher suite** moderne (ECDHE+AESGCM, CHACHA20)
3. **Security headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy` (script/style CDN ammessi)
   - `Permissions-Policy`
   - HSTS con `max-age=0` in locale (evita lock-in su cert non fidato)

## Produzione (consigliato)

### Opzione A — Reverse proxy (Nginx / Caddy / IIS)

1. Termina TLS sul proxy (Let's Encrypt automatico con Caddy o certbot).
2. Proxy verso file statici o origin interno.
3. Abilita HSTS reale:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Opzione B — Certbot (Linux)

```bash
sudo certbot certonly --webroot -w /var/www/elisee -d scouting.tuodominio.it
# cert: /etc/letsencrypt/live/.../fullchain.pem
# key:  /etc/letsencrypt/live/.../privkey.pem
```

Copia o monta i file al posto di `ssl/cert.pem` e `ssl/key.pem`, oppure punta il proxy a quei path.

### Opzione C — Hosting statico

Netlify, Cloudflare Pages, Vercel, Azure Static Web Apps forniscono **HTTPS automatico**.

## Sicurezza file

- **Non committare** `key.pem` in repository pubblici.
- In `.gitignore` è incluso `ssl/key.pem` (e opzionalmente `cert.pem`).
- Rigenera i certificati se la chiave è esposta:

```powershell
python ssl\generate_certs.py
```

## Verifica

```powershell
# handshake TLS
python -c "import ssl,socket; c=ssl.create_default_context(); c.check_hostname=False; c.verify_mode=ssl.CERT_NONE; s=c.wrap_socket(socket.create_connection(('127.0.0.1',8443)),server_hostname='localhost'); print(s.version(), s.cipher()); s.close()"
```

Oppure apri DevTools → Security: deve risultare connessione HTTPS (con avviso trust se self-signed).
