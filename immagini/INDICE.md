# ELISEE SCOUT — Libreria immagini

Cartella: `immagini/`

## Convenzione (semplificata)

### Tu
1. Metti le **nuove immagini** nella sottocartella giusta (anche con nome tipo `image (6).jpg` o `IMG_1234.png`)
2. Scrivi all’assistente: **Aggiorna**

### L’assistente / lo script
1. Rinomina automaticamente al **nome ufficiale** della cartella  
2. Sincronizza `corrente/`  
3. Aggiorna i `?v=` (cache) in HTML/CSS/JS  
4. **Non** genera immagini nuove  

Script: `immagini/aggiorna-immagini.ps1`

---

| Cartella | Uso | Nome ufficiale (dopo aggiorna) |
|---|---|---|
| 01-home-hero | Hero Home | `hero-workspace.jpg` |
| 02-chi-siamo-ritratto | Chi siamo | `about-portrait.jpg` |
| 03-calciatore-ritratto | Atleta | `footballer-portrait.svg` |
| 04-workspace-scout | Workspace | `scout-workspace.svg` |
| 05-logo-scout | Logo | `logo-scout.svg` |
| 06-placeholder-utente | Avatar | `user-placeholder.svg` |
| 07-auth-google | Google | `google-logo.svg` |
| 08-auth-apple | Apple | `apple-logo.svg` |
| 09-auth-spid-logo | SPID | `spid-logo.svg` |
| 10-auth-spid-posteid | Poste ID | `spid-posteid.svg` |
| 11-auth-spid-intesa | Intesa | `spid-intesa.svg` |
| 12-auth-spid-aruba | Aruba | `spid-aruba.svg` |
| 13-auth-spid-tim | TIM | `spid-tim.svg` |
| 14-auth-spid-namirial | Namirial | `spid-namirial.svg` |
| 15-auth-spid-infocert | InfoCert | `spid-infocert.svg` |

## Struttura di ogni sottocartella
- root della cartella = file usato dal sito (dopo rinomina)
- `corrente/` = copia attiva
- `originali/` = backup
- `modifiche/` = bozze / file grezzi che hai scaricato
