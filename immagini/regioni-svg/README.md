# Icone SVG Regioni Italiane

Cartella dedicata alle icone SVG precise delle regioni italiane, usate nel minigioco carriera (schermata selezione regione Eccellenza/Promozione).

## Come sostituire un'icona

1. Crea/scarica il tuo SVG con il nome esatto elencato sotto
2. Sovrascrivilo qui nella cartella `immagini/regioni-svg/`
3. Il minigioco lo utilizzerà automaticamente tramite `regionSvgIcon()` in `minigioco-carriera.js`

## File presenti

| File | Regione | Usata per |
|------|---------|-----------|
| `abruzzo.svg` | Abruzzo | Eccellenza Abruzzo |
| `basilicata.svg` | Basilicata | Eccellenza Basilicata |
| `calabria.svg` | Calabria | Eccellenza Calabria |
| `campania.svg` | Campania | Eccellenza Campania |
| `emilia-romagna.svg` | Emilia-Romagna | Eccellenza Emilia-Romagna |
| `friuli-venezia-giulia.svg` | Friuli-Venezia Giulia | Eccellenza Friuli-V.G. |
| `lazio.svg` | Lazio | Eccellenza Lazio |
| `liguria.svg` | Liguria | Eccellenza Liguria |
| `lombardia.svg` | Lombardia | Eccellenza Lombardia |
| `marche.svg` | Marche | Eccellenza Marche |
| `molise.svg` | Molise | Eccellenza Molise |
| `piemonte.svg` | Piemonte | Eccellenza Piemonte/VDA |
| `puglia.svg` | Puglia | Eccellenza Puglia |
| `sardegna.svg` | Sardegna | Eccellenza Sardegna |
| `sicilia.svg` | Sicilia | Eccellenza Sicilia |
| `toscana.svg` | Toscana | Eccellenza Toscana |
| `trentino-alto-adige.svg` | Trentino-Alto Adige | Eccellenza Trentino-A.A. |
| `umbria.svg` | Umbria | Eccellenza Umbria |
| `valle-d-aosta.svg` | Valle d'Aosta | Eccellenza VDA |
| `veneto.svg` | Veneto | Eccellenza Veneto |

## Come sono usati

In `minigioco-carriera.js`, la funzione `regionSvgIcon(regionName, color)` legge
questi file come SVG inline. Per sostituire un'icona con una sagoma geografica precisa:

1. Scarica un SVG vettoriale della sagoma della regione (es. da Wikipedia o Natural Earth)
2. Semplifica i path se necessario (max 2KB)
3. Rinominalo esattamente come indicato sopra
4. Sostituisci il file nella cartella
5. Aggiorna il codice in `minigioco-carriera.js` nella funzione `regionSvgIcon()` per usare un `<img>` tag o un fetch inline
