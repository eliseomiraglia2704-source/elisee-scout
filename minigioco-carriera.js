/**
 * ELISEE SCOUT — Minigioco Carriera
 * UI/flusso allineato al simulatore di carriera (genere Copero): landing, nazionalità,
 * ruolo su campo, timeline OVR + finestre di trasferimento.
 * Contenuti originali (dilettantismo IT + pro Italia). Nessun asset Copero copiato.
 */
(function () {
  'use strict';

  var LS = {
    career: 'elisee_career_sim_v3',
    consent: 'elisee_career_consent_v1',
    publishPref: 'elisee_career_publish_pref_v1',
    savePref: 'elisee_career_save_pref_v1',
    publicFeed: 'elisee_career_public_feed_v1'
  };

  var state = {
    step: 'hub', // hub | landing | nation | position | identity | career
    mode: 'normal', // intense | normal | express
    nation: 'Italia',
    nationCode: 'IT',
    position: null,
    surname: '',
    number: 10,
    foot: 'right', // left | right
    player: null,
    clubs: null,
    nationFilter: '',
    publishPublic: false,
    saveToAccount: true
  };

  var MODES = {
    intense: { label: 'Intensa', hint: '1 decisione per stagione: esperienza immersiva.', stepYears: 1 },
    normal: { label: 'Normale', hint: 'Decisioni ogni 2 stagioni: esperienza equilibrata.', stepYears: 2 },
    express: { label: 'Espressa', hint: 'Decisioni ogni 3 stagioni: percorso più rapido.', stepYears: 3 }
  };

  // o = logo path (football-logos.cc / nazioni-loghi); f = fallback emoji
  var NATIONS = [
    // EUROPA
    { n: 'Italia', c: 'IT', o: 'immagini/nazioni-loghi/it.png', f: '🇮🇹' },
    { n: 'Germania', c: 'DE', o: 'immagini/nazioni-loghi/de.png', f: '🇩🇪' },
    { n: 'Francia', c: 'FR', o: 'immagini/nazioni-loghi/fr.png', f: '🇫🇷' },
    { n: 'Spagna', c: 'ES', o: 'immagini/nazioni-loghi/es.png', f: '🇪🇸' },
    { n: 'Portogallo', c: 'PT', o: 'immagini/nazioni-loghi/pt.png', f: '🇵🇹' },
    { n: 'Inghilterra', c: 'EN', o: 'immagini/nazioni-loghi/en.png', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { n: 'Paesi Bassi', c: 'NL', o: 'immagini/nazioni-loghi/nl.png', f: '🇳🇱' },
    { n: 'Belgio', c: 'BE', o: 'immagini/nazioni-loghi/be.png', f: '🇧🇪' },
    { n: 'Croazia', c: 'HR', o: 'immagini/nazioni-loghi/hr.png', f: '🇭🇷' },
    { n: 'Polonia', c: 'PL', o: 'immagini/nazioni-loghi/pl.png', f: '🇵🇱' },
    { n: 'Serbia', c: 'RS', o: 'immagini/nazioni-loghi/rs.png', f: '🇷🇸' },
    { n: 'Svizzera', c: 'CH', o: 'immagini/nazioni-loghi/ch.png', f: '🇨🇭' },
    { n: 'Austria', c: 'AT', o: 'immagini/nazioni-loghi/at.png', f: '🇦🇹' },
    { n: 'Romania', c: 'RO', o: 'immagini/nazioni-loghi/ro.png', f: '🇷🇴' },
    { n: 'Albania', c: 'AL', o: 'immagini/nazioni-loghi/al.png', f: '🇦🇱' },
    { n: 'Turchia', c: 'TR', o: 'immagini/nazioni-loghi/tr.png', f: '🇹🇷' },
    { n: 'Scozia', c: 'SCO', o: 'immagini/nazioni-loghi/sco.png', f: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { n: 'Galles', c: 'WAL', o: 'immagini/nazioni-loghi/wal.png', f: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { n: 'Irlanda del Nord', c: 'NIR', o: '', f: '🇬🇧' },
    { n: 'Irlanda', c: 'IE', o: '', f: '🇮🇪' },
    { n: 'Ungheria', c: 'HU', o: '', f: '🇭🇺' },
    { n: 'Repubblica Ceca', c: 'CZ', o: '', f: '🇨🇿' },
    { n: 'Slovacchia', c: 'SK', o: '', f: '🇸🇰' },
    { n: 'Slovenia', c: 'SI', o: '', f: '🇸🇮' },
    { n: 'Grecia', c: 'GR', o: '', f: '🇬🇷' },
    { n: 'Bulgaria', c: 'BG', o: '', f: '🇧🇬' },
    { n: 'Ucraina', c: 'UA', o: '', f: '🇺🇦' },
    { n: 'Russia', c: 'RU', o: '', f: '🇷🇺' },
    { n: 'Norvegia', c: 'NO', o: '', f: '🇳🇴' },
    { n: 'Svezia', c: 'SE', o: '', f: '🇸🇪' },
    { n: 'Danimarca', c: 'DK', o: '', f: '🇩🇰' },
    { n: 'Finlandia', c: 'FI', o: '', f: '🇫🇮' },
    { n: 'Islanda', c: 'IS', o: '', f: '🇮🇸' },
    { n: 'Bosnia', c: 'BA', o: '', f: '🇧🇦' },
    { n: 'Montenegro', c: 'ME', o: '', f: '🇲🇪' },
    { n: 'Macedonia del Nord', c: 'MK', o: '', f: '🇲🇰' },
    { n: 'Kosovo', c: 'XK', o: '', f: '🇽🇰' },
    { n: 'Cipro', c: 'CY', o: '', f: '🇨🇾' },
    { n: 'Lussemburgo', c: 'LU', o: '', f: '🇱🇺' },
    { n: 'Moldavia', c: 'MD', o: '', f: '🇲🇩' },
    { n: 'Bielorussia', c: 'BY', o: '', f: '🇧🇾' },
    { n: 'Georgia', c: 'GE', o: '', f: '🇬🇪' },
    { n: 'Armenia', c: 'AM', o: '', f: '🇦🇲' },
    { n: 'Azerbaijan', c: 'AZ', o: '', f: '🇦🇿' },
    { n: 'Israele', c: 'IL', o: '', f: '🇮🇱' },
    { n: 'Lettonia', c: 'LV', o: '', f: '🇱🇻' },
    { n: 'Lituania', c: 'LT', o: '', f: '🇱🇹' },
    { n: 'Estonia', c: 'EE', o: '', f: '🇪🇪' },
    { n: 'Malta', c: 'MT', o: '', f: '🇲🇹' },
    { n: 'Andorra', c: 'AD', o: '', f: '🇦🇩' },
    { n: 'San Marino', c: 'SM', o: '', f: '🇸🇲' },
    { n: 'Liechtenstein', c: 'LI', o: '', f: '🇱🇮' },
    { n: 'Gibilterra', c: 'GI', o: '', f: '🇬🇮' },
    { n: 'Kazakistan', c: 'KZ', o: '', f: '🇰🇿' },
    { n: 'Portogallo', c: 'PT', o: 'immagini/nazioni-loghi/pt.png', f: '🇵🇹' },
    // AMERICHE
    { n: 'Brasile', c: 'BR', o: 'immagini/nazioni-loghi/br.png', f: '🇧🇷' },
    { n: 'Argentina', c: 'AR', o: 'immagini/nazioni-loghi/ar.png', f: '🇦🇷' },
    { n: 'Uruguay', c: 'UY', o: 'immagini/nazioni-loghi/uy.png', f: '🇺🇾' },
    { n: 'Cile', c: 'CL', o: 'immagini/nazioni-loghi/cl.png', f: '🇨🇱' },
    { n: 'Colombia', c: 'CO', o: 'immagini/nazioni-loghi/co.png', f: '🇨🇴' },
    { n: 'Messico', c: 'MX', o: 'immagini/nazioni-loghi/mx.png', f: '🇲🇽' },
    { n: 'Stati Uniti', c: 'US', o: 'immagini/nazioni-loghi/us.png', f: '🇺🇸' },
    { n: 'Ecuador', c: 'EC', o: '', f: '🇪🇨' },
    { n: 'Paraguay', c: 'PY', o: '', f: '🇵🇾' },
    { n: 'Bolivia', c: 'BO', o: '', f: '🇧🇴' },
    { n: 'Perù', c: 'PE', o: '', f: '🇵🇪' },
    { n: 'Venezuela', c: 'VE', o: '', f: '🇻🇪' },
    { n: 'Panama', c: 'PA', o: '', f: '🇵🇦' },
    { n: 'Costa Rica', c: 'CR', o: '', f: '🇨🇷' },
    { n: 'Honduras', c: 'HN', o: '', f: '🇭🇳' },
    { n: 'El Salvador', c: 'SV', o: '', f: '🇸🇻' },
    { n: 'Guatemala', c: 'GT', o: '', f: '🇬🇹' },
    { n: 'Nicaragua', c: 'NI', o: '', f: '🇳🇮' },
    { n: 'Jamaica', c: 'JM', o: '', f: '🇯🇲' },
    { n: 'Trinidad e Tobago', c: 'TT', o: '', f: '🇹🇹' },
    { n: 'Haiti', c: 'HT', o: '', f: '🇭🇹' },
    { n: 'Cuba', c: 'CU', o: '', f: '🇨🇺' },
    { n: 'Rep. Dominicana', c: 'DO', o: '', f: '🇩🇴' },
    { n: 'Canada', c: 'CA', o: '', f: '🇨🇦' },
    { n: 'Curaçao', c: 'CW', o: '', f: '🇨🇼' },
    { n: 'Suriname', c: 'SR', o: '', f: '🇸🇷' },
    { n: 'Guyana', c: 'GY', o: '', f: '🇬🇾' },
    // AFRICA
    { n: 'Nigeria', c: 'NG', o: 'immagini/nazioni-loghi/ng.png', f: '🇳🇬' },
    { n: 'Senegal', c: 'SN', o: 'immagini/nazioni-loghi/sn.png', f: '🇸🇳' },
    { n: 'Marocco', c: 'MA', o: 'immagini/nazioni-loghi/ma.png', f: '🇲🇦' },
    { n: 'Egitto', c: 'EG', o: '', f: '🇪🇬' },
    { n: 'Ghana', c: 'GH', o: '', f: '🇬🇭' },
    { n: 'Costa d\'Avorio', c: 'CI', o: '', f: '🇨🇮' },
    { n: 'Camerun', c: 'CM', o: '', f: '🇨🇲' },
    { n: 'Algeria', c: 'DZ', o: '', f: '🇩🇿' },
    { n: 'Tunisia', c: 'TN', o: '', f: '🇹🇳' },
    { n: 'Mali', c: 'ML', o: '', f: '🇲🇱' },
    { n: 'Burkina Faso', c: 'BF', o: '', f: '🇧🇫' },
    { n: 'Guinea', c: 'GN', o: '', f: '🇬🇳' },
    { n: 'Congo DR', c: 'CD', o: '', f: '🇨🇩' },
    { n: 'Zambia', c: 'ZM', o: '', f: '🇿🇲' },
    { n: 'Zimbabwe', c: 'ZW', o: '', f: '🇿🇼' },
    { n: 'Tanzania', c: 'TZ', o: '', f: '🇹🇿' },
    { n: 'Uganda', c: 'UG', o: '', f: '🇺🇬' },
    { n: 'Kenya', c: 'KE', o: '', f: '🇰🇪' },
    { n: 'Mozambico', c: 'MZ', o: '', f: '🇲🇿' },
    { n: 'Gabon', c: 'GA', o: '', f: '🇬🇦' },
    { n: 'Angola', c: 'AO', o: '', f: '🇦🇴' },
    { n: 'Etiopia', c: 'ET', o: '', f: '🇪🇹' },
    { n: 'Sudan', c: 'SD', o: '', f: '🇸🇩' },
    { n: 'Libia', c: 'LY', o: '', f: '🇱🇾' },
    { n: 'Togo', c: 'TG', o: '', f: '🇹🇬' },
    { n: 'Benin', c: 'BJ', o: '', f: '🇧🇯' },
    { n: 'Sudafrica', c: 'ZA', o: '', f: '🇿🇦' },
    { n: 'Capo Verde', c: 'CV', o: '', f: '🇨🇻' },
    { n: 'Guinea Equatoriale', c: 'GQ', o: '', f: '🇬🇶' },
    { n: 'Gambia', c: 'GM', o: '', f: '🇬🇲' },
    { n: 'Sierra Leone', c: 'SL', o: '', f: '🇸🇱' },
    { n: 'Liberia', c: 'LR', o: '', f: '🇱🇷' },
    { n: 'Madagascar', c: 'MG', o: '', f: '🇲🇬' },
    { n: 'Ruanda', c: 'RW', o: '', f: '🇷🇼' },
    { n: 'Namibia', c: 'NA', o: '', f: '🇳🇦' },
    { n: 'Botswana', c: 'BW', o: '', f: '🇧🇼' },
    // ASIA
    { n: 'Giappone', c: 'JP', o: 'immagini/nazioni-loghi/jp.png', f: '🇯🇵' },
    { n: 'Corea del Sud', c: 'KR', o: 'immagini/nazioni-loghi/kr.png', f: '🇰🇷' },
    { n: 'Cina', c: 'CN', o: '', f: '🇨🇳' },
    { n: 'Arabia Saudita', c: 'SA', o: '', f: '🇸🇦' },
    { n: 'Iran', c: 'IR', o: '', f: '🇮🇷' },
    { n: 'Iraq', c: 'IQ', o: '', f: '🇮🇶' },
    { n: 'Siria', c: 'SY', o: '', f: '🇸🇾' },
    { n: 'Giordania', c: 'JO', o: '', f: '🇯🇴' },
    { n: 'Emirati Arabi', c: 'AE', o: '', f: '🇦🇪' },
    { n: 'Qatar', c: 'QA', o: '', f: '🇶🇦' },
    { n: 'Bahrain', c: 'BH', o: '', f: '🇧🇭' },
    { n: 'Kuwait', c: 'KW', o: '', f: '🇰🇼' },
    { n: 'Oman', c: 'OM', o: '', f: '🇴🇲' },
    { n: 'Uzbekistan', c: 'UZ', o: '', f: '🇺🇿' },
    { n: 'India', c: 'IN', o: '', f: '🇮🇳' },
    { n: 'Pakistan', c: 'PK', o: '', f: '🇵🇰' },
    { n: 'Bangladesh', c: 'BD', o: '', f: '🇧🇩' },
    { n: 'Vietnam', c: 'VN', o: '', f: '🇻🇳' },
    { n: 'Thailandia', c: 'TH', o: '', f: '🇹🇭' },
    { n: 'Indonesia', c: 'ID', o: '', f: '🇮🇩' },
    { n: 'Filippine', c: 'PH', o: '', f: '🇵🇭' },
    { n: 'Malaysia', c: 'MY', o: '', f: '🇲🇾' },
    { n: 'Singapore', c: 'SG', o: '', f: '🇸🇬' },
    { n: 'Myanmar', c: 'MM', o: '', f: '🇲🇲' },
    { n: 'Cambogia', c: 'KH', o: '', f: '🇰🇭' },
    { n: 'Libano', c: 'LB', o: '', f: '🇱🇧' },
    { n: 'Palestina', c: 'PS', o: '', f: '🇵🇸' },
    { n: 'Yemen', c: 'YE', o: '', f: '🇾🇪' },
    { n: 'Corea del Nord', c: 'KP', o: '', f: '🇰🇵' },
    { n: 'Mongolia', c: 'MN', o: '', f: '🇲🇳' },
    { n: 'Afghanistan', c: 'AF', o: '', f: '🇦🇫' },
    { n: 'Nepal', c: 'NP', o: '', f: '🇳🇵' },
    { n: 'Sri Lanka', c: 'LK', o: '', f: '🇱🇰' },
    { n: 'Tagikistan', c: 'TJ', o: '', f: '🇹🇯' },
    { n: 'Turkmenistan', c: 'TM', o: '', f: '🇹🇲' },
    { n: 'Kirghizistan', c: 'KG', o: '', f: '🇰🇬' },
    // OCEANIA
    { n: 'Australia', c: 'AU', o: '', f: '🇦🇺' },
    { n: 'Nuova Zelanda', c: 'NZ', o: '', f: '🇳🇿' },
    { n: 'Fiji', c: 'FJ', o: '', f: '🇫🇯' },
    { n: 'Papua Nuova Guinea', c: 'PG', o: '', f: '🇵🇬' },
    { n: 'Tahiti', c: 'PF', o: '', f: '🇵🇫' },
    { n: 'Vanuatu', c: 'VU', o: '', f: '🇻🇺' },
    { n: 'Samoa', c: 'WS', o: '', f: '🇼🇸' },
    { n: 'Salomone', c: 'SB', o: '', f: '🇸🇧' }
  ].filter(function(n, i, arr) {
    // rimuovi duplicati per codice
    return arr.findIndex(function(x) { return x.c === n.c; }) === i;
  });

  // pitch positions (top = attack); etichette IT richieste (id EN per logica)
  var POSITIONS = [
    { id: 'ST', label: 'ATT', top: '8%', left: '50%' },
    { id: 'LW', label: 'AS', top: '18%', left: '18%' },
    { id: 'RW', label: 'AD', top: '18%', left: '82%' },
    { id: 'CAM', label: 'TRQ', top: '32%', left: '50%' },
    { id: 'LM', label: 'ES', top: '46%', left: '16%' },
    { id: 'CM', label: 'CC', top: '48%', left: '50%' },
    { id: 'RM', label: 'ED', top: '46%', left: '84%' },
    { id: 'CDM', label: 'MED', top: '62%', left: '50%' },
    { id: 'LB', label: 'TS', top: '76%', left: '20%' },
    { id: 'CB', label: 'DC', top: '78%', left: '50%' },
    { id: 'RB', label: 'TD', top: '76%', left: '80%' },
    { id: 'GK', label: 'POR', top: '92%', left: '50%' }
  ];

  function isWide() {
    try {
      return window.matchMedia('(min-width: 960px)').matches;
    } catch (e) {
      return (window.innerWidth || 0) >= 960;
    }
  }

  function posLabel(id) {
    var p = POSITIONS.find(function (x) {
      return x.id === id;
    });
    return p ? p.label : id || '—';
  }

  var TOP_WORLD_CLUBS = [
    { n: 'MANCHESTER CITY', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/manchester-city.png', t: 1, world: 1 },
    { n: 'LIVERPOOL', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/liverpool.png', t: 1, world: 1 },
    { n: 'ARSENAL', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/arsenal.png', t: 1, world: 1 },
    { n: 'CHELSEA', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/chelsea.png', t: 1, world: 1 },
    { n: 'MANCHESTER UNITED', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/manchester-united.png', t: 1, world: 1 },
    { n: 'TOTTENHAM', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/tottenham-hotspur.png', t: 1, world: 1 },
    { n: 'NEWCASTLE', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/newcastle-united.png', t: 1, world: 1 },
    { n: 'REAL MADRID', l: 'LA LIGA', o: 'immagini/squadre-loghi/real-madrid.png', t: 1, world: 1 },
    { n: 'BARCELONA', l: 'LA LIGA', o: 'immagini/squadre-loghi/barcelona.png', t: 1, world: 1 },
    { n: 'ATLETICO MADRID', l: 'LA LIGA', o: 'immagini/squadre-loghi/atletico-madrid.png', t: 1, world: 1 },
    { n: 'ATHLETIC CLUB', l: 'LA LIGA', o: 'immagini/squadre-loghi/athletic-club.png', t: 1, world: 1 },
    { n: 'REAL SOCIEDAD', l: 'LA LIGA', o: 'immagini/squadre-loghi/real-sociedad.png', t: 1, world: 1 },
    { n: 'VILLARREAL', l: 'LA LIGA', o: 'immagini/squadre-loghi/villarreal.png', t: 1, world: 1 },
    { n: 'BAYERN MONACO', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/bayern-munich.png', t: 1, world: 1 },
    { n: 'BORUSSIA DORTMUND', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/borussia-dortmund.png', t: 1, world: 1 },
    { n: 'RB LEIPZIG', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/rb-leipzig.png', t: 1, world: 1 },
    { n: 'BAYER LEVERKUSEN', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/bayer-leverkusen.png', t: 1, world: 1 },
    { n: 'EINTRACHT FRANCOFORTE', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/eintracht-frankfurt.png', t: 1, world: 1 },
    { n: 'PSG', l: 'LIGUE 1', o: 'immagini/squadre-loghi/paris-saint-germain.png', t: 1, world: 1 },
    { n: 'OLYMPIQUE MARSEILLE', l: 'LIGUE 1', o: 'immagini/squadre-loghi/olympique-marseille.png', t: 1, world: 1 },
    { n: 'MONACO', l: 'LIGUE 1', o: 'immagini/squadre-loghi/as-monaco.png', t: 1, world: 1 },
    { n: 'LYON', l: 'LIGUE 1', o: 'immagini/squadre-loghi/olympique-lyonnais.png', t: 1, world: 1 },
    { n: 'LILLE', l: 'LIGUE 1', o: 'immagini/squadre-loghi/lille.png', t: 1, world: 1 },
    { n: 'BENFICA', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/benfica.png', t: 1, world: 1 },
    { n: 'PORTO', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/fc-porto.png', t: 1, world: 1 },
    { n: 'SPORTING CP', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/sporting-cp.png', t: 1, world: 1 },
    { n: 'BRAGA', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/sc-braga.png', t: 1, world: 1 },
    { n: 'AJAX', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/ajax.png', t: 1, world: 1 },
    { n: 'PSV', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/psv.png', t: 1, world: 1 },
    { n: 'FEYENOORD', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/feyenoord.png', t: 1, world: 1 },
    { n: 'AZ ALKMAAR', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/az-alkmaar.png', t: 1, world: 1 },
    { n: 'FLAMENGO', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/flamengo.png', t: 1, world: 1 },
    { n: 'PALMEIRAS', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/palmeiras.png', t: 1, world: 1 },
    { n: 'SAO PAULO', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/sao-paulo.png', t: 1, world: 1 },
    { n: 'CORINTHIANS', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/corinthians.png', t: 1, world: 1 },
    { n: 'FLUMINENSE', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/fluminense.png', t: 1, world: 1 },
    { n: 'BOCA JUNIORS', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/boca-juniors.png', t: 1, world: 1 },
    { n: 'RIVER PLATE', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/river-plate.png', t: 1, world: 1 },
    { n: 'RACING CLUB', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/racing-club.png', t: 1, world: 1 },
    { n: 'INDEPENDIENTE', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/independiente.png', t: 1, world: 1 },
    { n: 'CLUB AMERICA', l: 'LIGA MX', o: 'immagini/squadre-loghi/club-america.png', t: 1, world: 1 },
    { n: 'CHIVAS', l: 'LIGA MX', o: 'immagini/squadre-loghi/chivas.png', t: 1, world: 1 },
    { n: 'MONTERREY', l: 'LIGA MX', o: 'immagini/squadre-loghi/monterrey.png', t: 1, world: 1 },
    { n: 'TIGRES', l: 'LIGA MX', o: 'immagini/squadre-loghi/tigres.png', t: 1, world: 1 }
  ];

  function mergeWorldClubs(list) {
    var have = {};
    (list || []).forEach(function (c) {
      if (c && c.n) have[String(c.n).toUpperCase()] = true;
    });
    TOP_WORLD_CLUBS.forEach(function (c) {
      if (!have[c.n]) list.push(Object.assign({}, c));
    });
    return list;
  }

  function nationListHtml() {
    var q = (state.nationFilter || '').toLowerCase();
    var list = NATIONS.filter(function (n) {
      return !q || n.n.toLowerCase().indexOf(q) >= 0;
    });
    return list
      .map(function (n) {
        var on = n.n === state.nation ? ' is-on' : '';
        var logo = n.o
          ? '<img class="es-mg-nation-logo" src="' +
            esc(n.o) +
            '?v=20260807" alt="" width="28" height="28" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.hidden=false;" />' +
            '<span class="es-mg-flag" hidden>' +
            (n.f || '') +
            '</span>'
          : '<span class="es-mg-flag">' + (n.f || '') + '</span>';
        return (
          '<button type="button" class="es-mg-nation' +
          on +
          '" data-n="' +
          esc(n.n) +
          '" data-c="' +
          esc(n.c) +
          '">' +
          logo +
          '<span class="es-mg-nation-name">' +
          esc(n.n) +
          '</span></button>'
        );
      })
      .join('');
  }

  function fieldHtml() {
    return (
      '<div class="es-mg-field" id="es-mg-field">' +
      POSITIONS.map(function (p) {
        var on = state.position === p.id ? ' is-on' : '';
        return (
          '<button type="button" class="es-mg-pos-btn' +
          on +
          '" data-pos="' +
          p.id +
          '" style="top:' +
          p.top +
          ';left:' +
          p.left +
          '">' +
          p.label +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function goAfterLanding() {
    if (isWide()) renderIdentity();
    else renderNation();
  }

  var root = null;

  function $(sel, el) {
    return (el || document).querySelector(sel);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function load(k, f) {
    try {
      var r = localStorage.getItem(k);
      return r ? JSON.parse(r) : f;
    } catch (e) {
      return f;
    }
  }
  function saveAccountHint(on) {
    if (on) {
      return 'La partita resta sul tuo account e potrai riprenderla al prossimo accesso. Soprattutto servir\u00e0 alle societ\u00e0, ai club e a tutto il personale gi\u00e0 preannunciato: direttori sportivi, fisioterapisti, direttori tecnici, match analyst, AD/DG, allenatore in seconda, preparatore dei portieri, team manager e addetto stampa / social media manager, sia figure interne al club sia attualmente svincolate.';
    }
    return 'La partita non viene salvata sull\'account: se chiudi o aggiorni la pagina la perdi e il personale indicato non potr\u00e0 leggerla.';
  }

  function loadSavePref() {
    try {
      var raw = localStorage.getItem(LS.savePref);
      if (raw === '0') return false;
      return true;
    } catch (e) {
      return true;
    }
  }

  function setSavePref(on) {
    state.saveToAccount = !!on;
    try {
      localStorage.setItem(LS.savePref, on ? '1' : '0');
    } catch (e) {}
  }

  function accountCareerKey() {
    var user = getActiveAccount() || {};
    var uid = String(user.id || user.email || user.username || '').trim();
    return uid ? 'elisee_career_account_' + uid : '';
  }

  function save(k, v) {
    if (k === LS.career && isAccountLogged() && !state.saveToAccount) {
      state.player = v;
      return;
    }
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
    if (k === LS.career) {
      try {
        var ak = accountCareerKey();
        if (ak && state.saveToAccount) localStorage.setItem(ak, JSON.stringify(v));
      } catch (e2) {}
      syncPublicCareer(v);
    }
  }

  function inspectPlayerIdentity() {
    var info = {
      userAuth: false,
      adminAuth: false,
      privacyAuth: false,
      hasActiveUser: false,
      registeredMatch: false,
      email: '',
      username: '',
      logged: false,
      registered: false
    };
    try {
      info.userAuth = localStorage.getItem('elisee_user_auth') === 'true';
      info.adminAuth = localStorage.getItem('elisee_admin_auth') === 'true';
      info.privacyAuth = localStorage.getItem('elisee_privacy_auth') === 'true';
      var raw =
        localStorage.getItem('elisee_active_user') ||
        localStorage.getItem('elisee_user_data') ||
        localStorage.getItem('elisee_user');
      var user = raw ? JSON.parse(raw) : null;
      if (user && typeof user === 'object') {
        info.hasActiveUser = true;
        info.email = String(user.email || '').toLowerCase();
        info.username = String(user.username || user.nome || '');
      info.displayName = String(
        ((user.nome || '') + ' ' + (user.cognome || '')).trim() ||
          user.username ||
          (user.email || '').split('@')[0] ||
          ''
      );
      }
      var regs = JSON.parse(localStorage.getItem('elisee_registered_users') || '[]');
      if (Array.isArray(regs) && info.email) {
        info.registeredMatch = regs.some(function (u) {
          return String((u && u.email) || '').toLowerCase() === info.email;
        });
      }
    } catch (e) {}
    info.logged = !!(info.userAuth || info.adminAuth || info.hasActiveUser);
    info.registered = !!(info.logged && (info.hasActiveUser || info.registeredMatch));
    return info;
  }

  function isAccountLogged() {
    return inspectPlayerIdentity().logged;
  }

  function getActiveAccount() {
    try {
      var raw =
        localStorage.getItem('elisee_active_user') ||
        localStorage.getItem('elisee_user_data') ||
        localStorage.getItem('elisee_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function notifyAgentsUserStatus(reason) {
    var idn = inspectPlayerIdentity();
    var status = idn.registered
      ? 'UTENTE REGISTRATO e in sessione'
      : idn.logged
        ? 'sessione attiva, profilo da verificare'
        : 'UTENTE NON REGISTRATO / non autenticato';
    var detail =
      status +
      ' · email=' +
      (idn.email || 'n/d') +
      ' · user=' +
      (idn.username || 'n/d') +
      ' · ' +
      (reason || '');
    var swarms = ['antifake', 'support', 'matchmaking', 'scouting', 'privacy', 'legal', 'market', 'orchestrate'];
    try {
      if (window.EliseeAICluster && typeof EliseeAICluster.logEvent === 'function') {
        for (var i = 0; i < swarms.length; i++) {
          EliseeAICluster.logEvent(swarms[i], 'Verifica identità pre-partita: ' + detail, {
            source: 'minigioco-carriera',
            registered: idn.registered,
            logged: idn.logged
          });
        }
      }
    } catch (e) {}
    return idn;
  }

  function loadPublishPref() {
    try {
      return localStorage.getItem(LS.publishPref) === '1';
    } catch (e) {
      return false;
    }
  }

  function setPublishPref(on) {
    state.publishPublic = !!on;
    try {
      localStorage.setItem(LS.publishPref, on ? '1' : '0');
    } catch (e) {}
    syncPublicCareer(state.player || load(LS.career, null));
  }

  function syncPublicCareer(player) {
    if (!isAccountLogged()) return;
    var user = getActiveAccount() || {};
    var uid = String(user.id || user.email || user.username || 'account');
    var feed = load(LS.publicFeed, []);
    if (!Array.isArray(feed)) feed = [];
    var idx = -1;
    for (var i = 0; i < feed.length; i++) {
      if (feed[i] && String(feed[i].userId) === uid) {
        idx = i;
        break;
      }
    }
    if (!state.publishPublic) {
      if (idx >= 0) {
        feed[idx].public = false;
        feed[idx].updatedAt = new Date().toISOString();
        saveRaw(LS.publicFeed, feed);
      }
      return;
    }
    var rec = {
      userId: uid,
      username: user.username || user.nome || 'Utente ELISEE',
      name: ((user.nome || '') + ' ' + (user.cognome || '')).trim(),
      email: user.email || '',
      public: true,
      status: player && player.history && player.history.length ? (player.age >= 38 ? 'finished' : 'in_progress') : 'ready',
      createdAt: idx >= 0 && feed[idx].createdAt ? feed[idx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      player: player || null
    };
    if (idx >= 0) feed[idx] = rec;
    else feed.unshift(rec);
    saveRaw(LS.publicFeed, feed.slice(0, 200));
  }

  function saveRaw(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  function getPublicCareers() {
    var feed = load(LS.publicFeed, []);
    if (!Array.isArray(feed)) return [];
    return feed.filter(function (x) {
      return x && x.public;
    });
  }
  function toast(m, t) {
    if (typeof window.showToast === 'function') window.showToast(m, t || 'success');
  }
  function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function ensureRoot() {
    root = document.getElementById('es-mg-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'es-mg-root';
    root.className = 'es-mg-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    document.body.appendChild(root);
    return root;
  }

  function lockPageScroll(on) {
    try {
      if (on) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('es-mg-open');
        document.body.classList.add('es-mg-open');
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.classList.remove('es-mg-open');
        document.body.classList.remove('es-mg-open');
      }
    } catch (e) {}
  }

  function rememberPrevPage() {
    try {
      var h = String(location.hash || '#hero');
      var v = '';
      try {
        v = localStorage.getItem('elisee_view') || '';
      } catch (e2) {}
      if (h.indexOf('minigioco') >= 0 || v === 'minigioco') return;
      sessionStorage.setItem('elisee_mg_prev_hash', h);
      sessionStorage.setItem('elisee_mg_prev_view', v || 'home');
    } catch (e) {}
  }

  var introTimer = null;
  var INTRO_SRC = 'immagini/minigioco/intro.mp4?v=20260813_HQ2';

  (function preloadIntroVideo() {
    try {
      var pre = document.createElement('video');
      pre.preload = 'auto';
      pre.muted = true;
      pre.playsInline = true;
      pre.src = INTRO_SRC;
      pre.load();
      window.__esMgIntroPreload = pre;
    } catch (e) {}
  })();

  function clearIntroTimer() {
    if (introTimer) {
      clearTimeout(introTimer);
      introTimer = null;
    }
  }

  function playOpenIntro(then) {
    ensureRoot();
    if (root.classList.contains('is-open') && !root.querySelector('.es-mg-intro')) {
      if (typeof then === 'function') then();
      return;
    }
    clearIntroTimer();
    openShell(
      '<div class="es-mg-intro" id="es-mg-intro" aria-label="Caricamento Minigioco">' +
        '<video class="es-mg-intro-video" id="es-mg-intro-video" autoplay muted playsinline preload="auto" disablePictureInPicture></video>' +
        '<div class="es-mg-intro-logo" aria-hidden="true">' +
        '<img src="immagini/logo/logo-site.png?v=20260731_LOGO" alt="" />' +
        '<span class="es-mg-intro-word">ELISEE <em>SCOUT</em></span>' +
        '</div>' +
        '</div>'
    );
    var v = document.getElementById('es-mg-intro-video');
    if (v) {
      v.src = INTRO_SRC;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.preload = 'auto';
      try {
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.disablePictureInPicture = true;
      } catch (e) {}
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
    introTimer = setTimeout(function () {
      introTimer = null;
      if (v) {
        try {
          v.pause();
        } catch (e) {}
      }
      if (typeof then === 'function') then();
    }, 3000);
  }

  function close() {
    clearIntroTimer();
    if (!root) return;
    root.classList.remove('is-open');
    root.innerHTML = '';
    try {
      root.style.removeProperty('display');
      root.style.removeProperty('visibility');
      root.style.removeProperty('opacity');
      root.style.removeProperty('pointer-events');
    } catch (e) {}
    lockPageScroll(false);
  }

  function leaveMinigioco() {
    close();
    var h = String(location.hash || '');
    if (h.indexOf('minigioco') >= 0) {
      try {
        if (window.history && window.history.length > 1) {
          history.back();
          return;
        }
      } catch (e) {}
    }
    var view = 'home';
    var hash = '#hero';
    try {
      view = sessionStorage.getItem('elisee_mg_prev_view') || 'home';
      hash = sessionStorage.getItem('elisee_mg_prev_hash') || '#hero';
    } catch (e2) {}
    if (view === 'minigioco') {
      view = 'home';
      hash = '#hero';
    }
    if (typeof window.switchView === 'function') {
      window.switchView(view, hash);
    }
  }

  function openShell(html) {
    ensureRoot();
    root.innerHTML = html;
    root.classList.add('is-open');
    root.hidden = false;
    root.removeAttribute('hidden');
    root.style.setProperty('display', 'flex', 'important');
    root.style.setProperty('visibility', 'visible', 'important');
    root.style.setProperty('opacity', '1', 'important');
    root.style.setProperty('pointer-events', 'auto', 'important');
    root.style.setProperty('z-index', '999995', 'important');
    lockPageScroll(true);
  }

  function topBar(rightExtra) {
    return (
      '<div class="es-mg-top">' +
      '<div class="es-mg-brand">' +
      '<img class="es-mg-brand-logo" src="immagini/logo/logo-site.png?v=20260731_LOGO_CLEAN" alt="ELISEE SCOUT" width="32" height="32" />' +
      '<span class="es-mg-brand-text">elisee scout</span>' +
      '</div>' +
      '<div class="es-mg-top-actions">' +
      (rightExtra || '') +
      '<button type="button" class="es-mg-close" id="es-mg-x">Chiudi</button>' +
      '</div></div>'
    );
  }

  function goHomeFromMinigioco() {
    close();
    if (typeof window.switchView === 'function') {
      window.switchView('home', '#hero');
    } else {
      try {
        location.hash = '#hero';
      } catch (e) {}
    }
  }

  function topBarHub(extraRight) {
    return (
      '<div class="es-mg-top es-mg-top--hub">' +
      '<button type="button" class="es-mg-hub-menubar" id="es-mg-home" title="Torna alla Homepage">' +
      '<img class="es-mg-brand-logo" src="immagini/logo/logo-site.png?v=20260731_LOGO_CLEAN" alt="" width="26" height="26" />' +
      '<strong>Minigioco</strong>' +
      '</button>' +
      '<div class="es-mg-hub-top-actions">' +
      (extraRight || '') +
      '<button type="button" class="es-mg-close" id="es-mg-x">Chiudi</button>' +
      '</div></div>'
    );
  }

  function bindClose() {
    var x = document.getElementById('es-mg-x');
    if (x) x.onclick = leaveMinigioco;
    var home = document.getElementById('es-mg-home');
    if (home) home.onclick = goHomeFromMinigioco;
  }

  function stepYears() {
    return (MODES[state.mode] || MODES.normal).stepYears;
  }

  // ---------- LOAD CLUBS ----------
  function loadClubs(cb) {
    if (state.clubs && state.catalogByName && Object.keys(state.catalogByName).length) {
      cb(state.clubs);
      return;
    }
    fetch('data/squadre/minigioco_clubs.json?v=20260814_QA10', { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        state.clubs = mergeWorldClubs(Array.isArray(data) ? data : []);
        rememberCatalog(state.clubs);
        if (state.player && !playerIsUnsigned(state.player)) restoreLeagueBoard(state.player);
        else resetClubsToCatalog();
        repairClubTiers();
        cb(state.clubs);
      })
      .catch(function () {
        state.clubs = mergeWorldClubs([
          { n: 'JUVENTUS', l: 'SERIE A', o: 'immagini/squadre-loghi/juventus.png', t: 1 },
          { n: 'MILAN', l: 'SERIE A', o: 'immagini/squadre-loghi/milan.png', t: 1 },
          { n: 'INTER', l: 'SERIE A', o: 'immagini/squadre-loghi/inter.png', t: 1 },
          { n: 'NAPOLI', l: 'SERIE A', o: 'immagini/squadre-loghi/napoli.png', t: 1 },
          { n: 'ROMA', l: 'SERIE A', o: 'immagini/squadre-loghi/roma.png', t: 1 },
          { n: 'PALERMO', l: 'SERIE B', o: 'immagini/squadre-loghi/palermo.png', t: 2 },
          { n: 'BARI', l: 'SERIE B', o: 'immagini/squadre-loghi/bari.png', t: 2 },
          { n: 'PADOVA', l: 'SERIE B', o: 'immagini/squadre-loghi/padova.png', t: 2 },
          { n: 'CATANZARO', l: 'SERIE B', o: 'immagini/squadre-loghi/catanzaro.png', t: 2 },
          { n: 'PERUGIA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/perugia.png', t: 3 },
          { n: 'LATINA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/latina.png', t: 3 }
        ]);
        rememberCatalog(state.clubs);
        if (state.player && !playerIsUnsigned(state.player)) restoreLeagueBoard(state.player);
        else resetClubsToCatalog();
        repairClubTiers();
        cb(state.clubs);
      });
  }

  function playerIsUnsigned(p) {
    if (!p || !p.history || !p.history.length) return true;
    return isUnsignedRow(p.history[p.history.length - 1]);
  }

  function rememberCatalog(list) {
    state.catalogByName = state.catalogByName || {};
    (list || []).forEach(function (c) {
      if (!c || !c.n || c.world) return;
      var key = String(c.n).toUpperCase();
      if (!state.catalogByName[key]) {
        state.catalogByName[key] = {
          t: Number(c.t) || clubLeagueTier(c),
          l: c.l,
          dg: c.dg || c.catalogDGirone || ''
        };
      }
      var snap = state.catalogByName[key];
      c.catalogT = snap.t;
      c.catalogL = snap.l;
      c.catalogDGirone = snap.dg || c.dg || '';
      if (c.homeTier == null) c.homeTier = snap.t;
    });
  }

  function stampHomeTiers(list) {
    rememberCatalog(list);
  }

  function resetClubsToCatalog() {
    var map = state.catalogByName || {};
    (state.clubs || []).forEach(function (c) {
      if (!c || c.world) return;
      var snap = map[String(c.n || '').toUpperCase()];
      var destT = snap ? snap.t : (c.catalogT != null ? c.catalogT : Number(c.homeTier) || clubLeagueTier(c));
      var destL = snap ? snap.l : (c.catalogL || labelForItalianTier(c, destT));
      c.t = destT;
      c.l = destL;
      c.catalogT = destT;
      c.catalogL = destL;
      if (snap && snap.dg) c.catalogDGirone = snap.dg;
      c.homeTier = destT;
      c.justPromoted = false;
      c.justRelegated = false;
      c.promotedFromGirone = '';
      c.promotedFromTier = 0;
    });
  }

  function clubsByCatalogTier(t) {
    var want = Number(t);
    return (state.clubs || []).filter(function (c) {
      if (!c || c.world) return false;
      var cat = c.catalogT != null ? Number(c.catalogT) : Number(c.homeTier);
      return cat === want;
    });
  }

  var CAN_REACH_A = [
    'INTER', 'MILAN', 'JUVENTUS', 'NAPOLI', 'ROMA', 'LAZIO', 'ATALANTA', 'FIORENTINA', 'BOLOGNA',
    'TORINO', 'UDINESE', 'GENOA', 'CAGLIARI', 'LECCE', 'EMPOLI', 'VERONA', 'VENEZIA', 'SASSUOLO',
    'PARMA', 'MONZA', 'COMO', 'FROSINONE', 'PALERMO', 'SAMPDORIA', 'PISA', 'CREMONESE', 'CESENA',
    'CATANZARO', 'BARI', 'SPEZIA', 'SALERNITANA', 'BRESCIA'
  ];
  var CAN_REACH_B = [
    'PADOVA', 'VICENZA', 'PERUGIA', 'PESCARA', 'CATANIA', 'AVELLINO', 'REGGIANA', 'COSENZA',
    'CROTONE', 'FOGGIA', 'MODENA', 'SUDTIROL', 'MANTOVA', 'ASCOLI', 'AREZZO', 'LIVORNO',
    'SIENA', 'REGGINA', 'PIACENZA', 'MESSINA', 'NOCERINA', 'TARANTO', 'VIRTUS FRANCAVILLA',
    'JUVE STABIA', 'CARRARESE', 'ENTELLA', 'LATINA', 'CITTADELLA', 'TERNANA', 'SPAL',
    'TRIESTINA', 'PORDENONE', 'BENEVENTO', 'POTENZA', 'MONOPOLI', 'JUVE STABIA'
  ];

  function clubStoria(c) {
    if (typeof window !== 'undefined' && window.EliseeClubStoria) {
      return window.EliseeClubStoria.profile(c);
    }
    var home = Number(c && c.homeTier != null ? c.homeTier : (c && c.t) || 4);
    if (c && c.world) return { home: 1, floor: 1, ceil: 1, rel: 0.02, promo: 0, stay: 0.98 };
    if (home <= 1) return { home: 1, floor: 2, ceil: 1, rel: 0.08, promo: 0.7, stay: 0.85 };
    if (home === 2) return { home: 2, floor: 3, ceil: 1, rel: 0.16, promo: 0.2, stay: 0.7 };
    if (home === 3) return { home: 3, floor: 4, ceil: 2, rel: 0.16, promo: 0.1, stay: 0.7 };
    return { home: 4, floor: 4, ceil: 3, rel: 0.04, promo: 0.06, stay: 0.9 };
  }

  function maxTierForClub(c) {
    return clubStoria(c).ceil;
  }

  function canReachTier(c, destTier) {
    return maxTierForClub(c) <= destTier;
  }

  function isLegalTier(c, destTier) {
    if (typeof window !== 'undefined' && window.EliseeClubStoria && window.EliseeClubStoria.legalTier) {
      return window.EliseeClubStoria.legalTier(c, destTier);
    }
    var st = clubStoria(c);
    var t = Number(destTier);
    return t >= st.ceil && t <= st.floor;
  }

  function clampClubToHistory(c) {
    return guardClub(c, false);
  }

  function guardClub(c, atStart) {
    if (!c || c.world || c.isFree) return c;
    var now = clubLeagueTier(c);
    var dest = now;
    var S = typeof window !== 'undefined' ? window.EliseeClubStoria : null;
    if (S && S.enforce) {
      var en = S.enforce(c, now, !!atStart);
      dest = en.t;
      c.t = dest;
      c.l = en.l;
    } else {
      var st = clubStoria(c);
      if (atStart && c.catalogT != null) dest = Number(c.catalogT);
      else if (now < st.ceil || now > st.floor) dest = st.home;
      c.t = dest;
      c.l = labelForItalianTier(c, dest);
    }
    if (dest !== now) {
      c.justPromoted = false;
      c.justRelegated = false;
      c.promotedFromGirone = '';
      c.promotedFromTier = 0;
    }
    if (Number(c.t) === 3) {
      var g = String(c.l || '').toUpperCase().match(/GIR(?:ONE|\.)\s*([A-I])/);
      if (g && 'ABC'.indexOf(g[1]) < 0) {
        c.l = 'SERIE C · GIRONE ' + (window.EliseeClubStoria && window.EliseeClubStoria.serieCGirone
          ? window.EliseeClubStoria.serieCGirone(g[1])
          : 'A');
      }
    }
    return c;
  }

  function isBigYouthClub(c) {
    if (!c) return false;
    if (c.world) return true;
    var n = String(c.n || '').toUpperCase();
    return /JUVENTUS|INTER|MILAN|NAPOLI|ROMA|LAZIO|ATALANTA|FIORENTINA|BARCELONA|REAL MADRID|BAYERN|MANCHESTER|LIVERPOOL|CHELSEA|ARSENAL|PSG|AJAX|BENFICA|PORTO|SPORTING/.test(n);
  }

  function repairClubTiers() {
    (state.clubs || []).forEach(function (c) {
      if (c.homeTier == null) c.homeTier = Number(c.t) || clubLeagueTier(c);
      clampClubToHistory(c);
    });
  }

  function clubsByTier(t) {
    var want = Number(t);
    return (state.clubs || []).filter(function (c) {
      return clubLeagueTier(c) === want && isLegalTier(c, want);
    });
  }

  function startOvr() {
    return 49;
  }

  var STAFF_ROLES =
    'Direttori Sportivi, Fisioterapisti, Direttori Tecnici, Match Analyst, Amministratore Delegato (AD) / Direttore Generale (DG), Allenatore in seconda, Preparatore dei portieri, Team Manager, Addetto stampa / Social Media Manager';

  function activateCareerAgents(reason) {
    try {
      if (window.EliseeAICluster) {
        if (!EliseeAICluster.isOnline || !EliseeAICluster.isOnline()) {
          if (typeof EliseeAICluster.boot === 'function') EliseeAICluster.boot();
          else if (typeof EliseeAICluster.forceReboot === 'function') EliseeAICluster.forceReboot();
        }
        if (typeof EliseeAICluster.logEvent === 'function') {
          EliseeAICluster.logEvent(
            'matchmaking',
            'Agenti IA attivi: statistiche carriera pronte per società/club iscritte o in iscrizione. ' + (reason || ''),
            { source: 'minigioco-carriera' }
          );
          EliseeAICluster.logEvent(
            'scouting',
            'Pipeline statistiche carriera verso club (stesse figure interne) e figure svincolate: ' + STAFF_ROLES,
            { source: 'minigioco-carriera' }
          );
          EliseeAICluster.logEvent(
            'market',
            'Briefing automatico carriera per staff di club e staff svincolato',
            { source: 'minigioco-carriera' }
          );
        }
      }
      if (window.EliseeAutoPilot && typeof EliseeAutoPilot.start === 'function') {
        EliseeAutoPilot.start();
      }
      try {
        var jobs = load('elisee_career_stats_briefings_v1', []);
        if (!Array.isArray(jobs)) jobs = [];
        jobs.unshift({
          at: new Date().toISOString(),
          reason: reason || 'hub',
          targets: {
            clubs: 'società/club iscritte o in iscrizione — stesse figure interne al club',
            unaffiliated: STAFF_ROLES,
            internalSameRoles: true
          },
          agents: ['matchmaking', 'scouting', 'market']
        });
        saveRaw('elisee_career_stats_briefings_v1', jobs.slice(0, 80));
      } catch (e2) {}
    } catch (e) {}
  }

  function publishBlockHtml() {
    var logged = isAccountLogged();
    var concept =
      '<div class="es-mg-hub-concept">' +
      '<p>I dati della carriera vengono <strong>salvati</strong> e trasformati in <strong>statistiche</strong>: i nostri <strong>agenti IA</strong> si attivano subito, le elaborano e le presentano in automatico alle <strong>società e ai club</strong> già iscritti o che si iscriveranno, in modo che possano vederle sia le <strong>stesse figure interne al club</strong>, sia quelle <strong>attualmente svincolate</strong> — Direttori Sportivi, Fisioterapisti, Direttori Tecnici, Match Analyst, Amministratore Delegato (AD) / Direttore Generale (DG), Allenatore in seconda, Preparatore dei portieri, Team Manager e Addetto stampa / Social Media Manager.</p>' +
      '</div>';
    if (logged) {
      return (
        concept +
        '<label class="es-mg-hub-publish" id="es-mg-hub-publish">' +
        '<input type="checkbox" id="es-mg-publish-check"' +
        (state.publishPublic ? ' checked' : '') +
        ' />' +
        '<span>Salva e rendi <strong>pubblica</strong> questa carriera sul mio account <em>prima di iniziare</em>, visibile a club, staff interno e figure svincolate.</span>' +
        '</label>'
      );
    }
    return (
      concept +
      '<p class="es-mg-hub-publish-hint">Accedi o registrati per <strong>salvare</strong> la carriera sul tuo account e renderla <strong>pubblica già prima di iniziare</strong>.</p>'
    );
  }

  // ---------- HUB minigiochi (macroarea, 2 card stile EA FC) ----------
  function renderHub() {
    state.step = 'hub';
    state.publishPublic = loadPublishPref();
    var idn = notifyAgentsUserStatus('apertura hub Carriera Giocatore');
    activateCareerAgents('apertura hub Carriera Giocatore');
    var authBtns = !idn.logged
      ? '<div class="es-mg-hub-auth" id="es-mg-hub-auth">' +
        '<button type="button" class="es-mg-hub-auth-in" id="es-mg-hub-login">Accedi</button>' +
        '<button type="button" class="es-mg-hub-auth-up" id="es-mg-hub-register">Registrati</button>' +
        '</div>'
      : '<div class="es-mg-user-chip" id="es-mg-user-chip">' +
        String(idn.displayName || idn.username || idn.email || 'Account').replace(/</g, '') +
        '</div>';
    openShell(
      topBarHub(authBtns) +
        '<div class="es-mg-hub">' +
        '<div class="es-mg-hub-bg" aria-hidden="true"></div>' +
        '<div class="es-mg-hub-shade" aria-hidden="true"></div>' +
        '<div class="es-mg-hub-stage">' +
        '<div class="es-mg-hub-card is-on" id="es-mg-hub-career" role="button" tabindex="0" aria-pressed="true">' +
        '<span class="es-mg-hub-icon" aria-hidden="true">' +
        '<img class="es-mg-hub-boot" src="immagini/minigioco/scarpa-calcio-white.png?v=20260813_BOOT" alt="" />' +
        '</span>' +
        '<span class="es-mg-hub-title">Carriera Giocatore</span>' +
        '<span class="es-mg-hub-tags">Serie D (A–I) → Serie C (A/B/C) → Serie B · Top 10 mondiali</span>' +
        '<span class="es-mg-hub-desc">Regola fondamentale: in <strong>Serie C</strong> ci sono 3 gironi (A, B, C): chi vince il proprio girone sale in <strong>Serie B</strong>. In <strong>Serie D</strong> vale lo stesso per ogni girone (A–I): il vincitore sale in <strong>Serie C</strong>. Poi puoi arrivare in Serie A e nei 10 campionati top mondiali.</span>' +
        publishBlockHtml() +
        '</div>' +
        '<div class="es-mg-hub-card is-empty" id="es-mg-hub-slot" aria-disabled="true" aria-label="Slot giochi in arrivo">' +
        '<span class="es-mg-hub-empty" aria-hidden="true"></span>' +
        '</div>' +
        '</div>' +
        '<div class="es-mg-hub-playwrap">' +
        '<div class="es-mg-hub-playcol">' +
        '<button type="button" class="es-mg-hub-play" id="es-mg-hub-play">Gioca</button>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    bindClose();
    var chk = document.getElementById('es-mg-publish-check');
    if (chk) {
      chk.checked = !!state.publishPublic;
      chk.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      chk.addEventListener('change', function () {
        setPublishPref(!!chk.checked);
        if (chk.checked) activateCareerAgents('pubblicazione carriera su account');
        toast(
          chk.checked
            ? 'Carriera pubblica: gli agenti IA la presentano a club e figure svincolate'
            : 'Carriera non più pubblica',
          'success'
        );
      });
    }
    var pub = document.getElementById('es-mg-hub-publish');
    if (pub) {
      pub.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
    function enterCareer() {
      activateCareerAgents('avvio simulazione carriera');
      loadClubs(function () {
        renderLanding();
      });
    }
    var career = document.getElementById('es-mg-hub-career');
    var play = document.getElementById('es-mg-hub-play');
    if (career) {
      career.onclick = enterCareer;
      career.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          enterCareer();
        }
      };
    }
    if (play) play.onclick = enterCareer;
    bindHubAuthButtons();
  }

  function raiseAuthModal(el) {
    if (!el) return;
    el.style.setProperty('z-index', '1000010', 'important');
  }

  function watchAuthThenRefreshHub() {
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (isAccountLogged() && state.step === 'hub') {
        clearInterval(t);
        notifyAgentsUserStatus('accesso/registrazione completati dal hub');
        renderHub();
      }
      if (n > 90) clearInterval(t);
    }, 400);
  }

  function bindHubAuthButtons() {
    var login = document.getElementById('es-mg-hub-login');
    var reg = document.getElementById('es-mg-hub-register');
    if (login) {
      login.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        notifyAgentsUserStatus('click Accedi da hub, utente non autenticato');
        if (typeof window.openAccessoModal === 'function') {
          window.openAccessoModal('email');
        } else if (typeof window.switchView === 'function') {
          window.switchView('account', '#account-portal');
        }
        raiseAuthModal(document.getElementById('modal-accesso-unificato'));
        watchAuthThenRefreshHub();
      };
    }
    if (reg) {
      reg.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        notifyAgentsUserStatus('click Registrati da hub, utente non autenticato');
        if (typeof window.openRegistrazioneModal === 'function') {
          window.openRegistrazioneModal();
        }
        raiseAuthModal(document.getElementById('modal-registrazione'));
        watchAuthThenRefreshHub();
      };
    }
  }

  // ---------- LANDING ----------
  function renderLanding() {
    state.step = 'landing';
    state.saveToAccount = loadSavePref();
    var m = MODES[state.mode] || MODES.normal;
    var userChip = '';
    try {
      if (isAccountLogged()) {
        var u = {};
        try { u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (e1) {}
        var nm = ((u.nome || '') + ' ' + (u.cognome || '')).trim() || u.username || u.email || 'Account';
        userChip = '<div class="es-mg-user-chip">' + String(nm).replace(/</g, '') + '</div>';
      }
    } catch (e0) {}
    openShell(
      topBar(
        '<div class="es-mg-lang" aria-label="Lingua">' +
          '<button type="button" class="is-on">IT</button>' +
          '<button type="button">EN</button>' +
          '<button type="button">ES</button>' +
          '</div>' +
          userChip
      ) +
        '<div class="es-mg-landing">' +
        '<div class="es-mg-landing-split">' +
        '<div class="es-mg-hero-card es-mg-hero-photo" aria-hidden="true">' +
        '<img class="es-mg-hero-img" src="immagini/minigioco/landing-hero.jpg?v=20260813_HERO" alt="" width="800" height="1000" />' +
        '</div>' +
        '<div class="es-mg-landing-copy">' +
        '<div class="es-mg-kicker">MINIGIOCHI ELISEE</div>' +
        '<h1 class="es-mg-title-center">Costruisci la tua<br />carriera calcistica</h1>' +
        '<p class="es-mg-desc-center">Scegli la tua origine, prendi decisioni chiave e lascia che il destino tracci un percorso unico di trofei, statistiche e momenti decisivi.</p>' +
        '<div class="es-mg-modes es-mg-modes-center" role="group">' +
        ['intense', 'normal', 'express']
          .map(function (k) {
            return (
              '<button type="button" class="es-mg-mode' +
              (state.mode === k ? ' is-on' : '') +
              '" data-mode="' +
              k +
              '">' +
              MODES[k].label +
              '</button>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="es-mg-mode-hint es-mg-hint-center" id="es-mg-hint">' +
        esc(m.hint) +
        '</p>' +
        '<div class="es-mg-landing-actions">' +
        '<button type="button" class="es-mg-btn-full primary" id="es-mg-start">Inizia carriera</button>' +
        '<button type="button" class="es-mg-btn-full ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-help-round" id="es-mg-help" aria-label="Informazioni">?</button>' +
        '</div>' +
        '<p class="es-mg-help-pop" id="es-mg-help-pop" hidden>Serie C: Girone A Nord, Girone B Centro, Girone C Sud. Chi sale o scende in C entra subito nel girone della propria area. Serie D: gironi A–I, il vincitore sale in C nel girone geografico giusto. Overall da 49, +8 / −4 a stagione.</p>' +
        (isAccountLogged()
          ? '<div class="es-mg-save-opt" id="es-mg-save-opt">' +
            '<p class="es-mg-save-label">Salva la partita sul tuo account</p>' +
            '<div class="es-mg-save-toggle" role="group" aria-label="Salva sul account">' +
            '<button type="button" class="es-mg-save-btn' +
            (state.saveToAccount ? ' is-on' : '') +
            '" data-save="1">Si</button>' +
            '<button type="button" class="es-mg-save-btn' +
            (!state.saveToAccount ? ' is-on' : '') +
            '" data-save="0">No</button>' +
            '</div>' +
            '<p class="es-mg-save-hint" id="es-mg-save-hint">' +
            saveAccountHint(state.saveToAccount) +
            '</p></div>'
          : '') +
        '</div></div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderHub;
    document.getElementById('es-mg-start').onclick = function () {
      loadClubs(function () {
        goAfterLanding();
      });
    };
    var help = document.getElementById('es-mg-help');
    var pop = document.getElementById('es-mg-help-pop');
    if (help && pop) {
      help.onclick = function () {
        pop.hidden = !pop.hidden;
      };
    }
    root.querySelectorAll('.es-mg-mode').forEach(function (btn) {
      btn.onclick = function () {
        state.mode = btn.getAttribute('data-mode') || 'normal';
        renderLanding();
      };
    });
    root.querySelectorAll('.es-mg-save-btn').forEach(function (btn) {
      btn.onclick = function () {
        setSavePref(btn.getAttribute('data-save') === '1');
        root.querySelectorAll('.es-mg-save-btn').forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
        });
        var hint = document.getElementById('es-mg-save-hint');
        if (hint) {
          hint.textContent = saveAccountHint(state.saveToAccount);
        }
      };
    });
  }

  // ---------- IDENTITY (desktop 3 colonne, stile layout wide) ----------
  /** Kit 2D nazionale (SS style) in base al paese scelto */
  function nationKitSrc(code) {
    var c = String(code || state.nationCode || 'IT').toLowerCase();
    return 'immagini/kits-2d-nazioni/' + c + '/home.png?v=20260807_REALNAT';
  }

  function jerseyHtml() {
    var code = state.nationCode || 'IT';
    var src = nationKitSrc(code);
    return (
      '<div class="es-mg-kit" aria-hidden="true">' +
      '<div class="es-mg-kit-photo">' +
      '<img class="es-mg-kit-img" id="es-mg-kit-img" src="' +
      esc(src) +
      '" width="220" height="220" alt="Kit ' +
      esc(state.nation || '') +
      '" draggable="false" onerror="this.style.opacity=0.35" />' +
      '</div>' +
      '<div class="es-mg-kit-caption">' +
      esc(state.nation || 'Nazionale') +
      ' · kit casa</div></div>'
    );
  }

  function renderIdentity(focusSel) {
    state.step = 'identity';
    var num = state.number || 10;
    var canConfirm = !!(state.nation && state.position);
    openShell(
      topBar() +
        '<div class="es-mg-identity">' +
        '<h2 class="es-mg-identity-title">Definisci la tua identità</h2>' +
        '<div class="es-mg-identity-grid">' +
        /* col 1 — Identità */
        '<section class="es-mg-id-col es-mg-id-player">' +
        '<h3 class="es-mg-col-title">Identità</h3>' +
        jerseyHtml() +
        '<div class="es-mg-id-fields">' +
        '<label class="es-mg-field-lab"><span>COGNOME</span>' +
        '<input type="text" class="es-mg-input" id="es-mg-surname" maxlength="16" placeholder="COGNOME" value="' +
        esc(state.surname || '') +
        '" autocomplete="off" /></label>' +
        '<label class="es-mg-field-lab es-mg-field-num"><span>NUMERO</span>' +
        '<input type="number" class="es-mg-input" id="es-mg-number" min="1" max="99" value="' +
        esc(String(num)) +
        '" /></label>' +
        '</div>' +
        '<div class="es-mg-foot-wrap">' +
        '<span class="es-mg-field-lab-txt">PIEDE PREFERITO</span>' +
        '<div class="es-mg-foot-btns" role="group">' +
        '<button type="button" class="es-mg-foot' +
        (state.foot === 'left' ? ' is-on' : '') +
        '" data-foot="left">Sinistro</button>' +
        '<button type="button" class="es-mg-foot' +
        (state.foot === 'right' ? ' is-on' : '') +
        '" data-foot="right">Destro</button>' +
        '</div></div>' +
        '</section>' +
        /* col 2 — Nazionalità */
        '<section class="es-mg-id-col es-mg-id-nation">' +
        '<h3 class="es-mg-col-title">Nazionalità</h3>' +
        '<div class="es-mg-search-wrap">' +
        '<input type="search" class="es-mg-search" id="es-mg-nation-q" placeholder="Cerca nazione" value="' +
        esc(state.nationFilter) +
        '" />' +
        '</div>' +
        '<div class="es-mg-nation-grid es-mg-nation-grid-wide" id="es-mg-nations">' +
        nationListHtml() +
        '</div></section>' +
        /* col 3 — Ruolo */
        '<section class="es-mg-id-col es-mg-id-pos">' +
        '<h3 class="es-mg-col-title">Ruolo</h3>' +
        '<div class="es-mg-field-wrap es-mg-field-wrap-wide">' +
        fieldHtml() +
        '</div></section>' +
        '</div>' +
        '<div class="es-mg-identity-foot">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-confirm"' +
        (canConfirm ? '' : ' disabled') +
        '>Conferma identità</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderLanding;
    document.getElementById('es-mg-confirm').onclick = function () {
      if (!state.nation || !state.position) return;
      syncIdentityInputs();
      createPlayer();
      renderCareer(true);
    };
    bindIdentityControls(focusSel);
  }

  function syncIdentityInputs() {
    var sn = document.getElementById('es-mg-surname');
    var nu = document.getElementById('es-mg-number');
    if (sn) state.surname = String(sn.value || '').trim();
    if (nu) {
      var n = parseInt(nu.value, 10);
      if (isNaN(n) || n < 1) n = 10;
      if (n > 99) n = 99;
      state.number = n;
    }
  }

  function bindIdentityControls(focusSel) {
    var sn = document.getElementById('es-mg-surname');
    var nu = document.getElementById('es-mg-number');
    var jn = root.querySelector('.es-mg-jersey-name');
    var jnum = root.querySelector('.es-mg-jersey-num');
    function paintJersey() {
      if (jn) jn.textContent = ((sn && sn.value) || 'COGNOME').toUpperCase().slice(0, 12);
      if (jnum) {
        var n = parseInt(nu && nu.value, 10);
        jnum.textContent = String(isNaN(n) ? 10 : Math.min(99, Math.max(1, n)));
      }
    }
    if (sn) {
      sn.oninput = paintJersey;
      sn.onblur = function () {
        state.surname = String(sn.value || '').trim();
      };
    }
    if (nu) {
      nu.oninput = function () {
        paintJersey();
        var n = parseInt(nu.value, 10);
        if (!isNaN(n)) state.number = Math.min(99, Math.max(1, n));
      };
    }
    root.querySelectorAll('.es-mg-foot').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.foot = btn.getAttribute('data-foot') || 'right';
        renderIdentity('#es-mg-surname');
      };
    });
    var inp = document.getElementById('es-mg-nation-q');
    if (inp) {
      inp.oninput = function () {
        syncIdentityInputs();
        state.nationFilter = inp.value;
        renderIdentity('#es-mg-nation-q');
      };
    }
    root.querySelectorAll('.es-mg-nation').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.nation = btn.getAttribute('data-n');
        state.nationCode = btn.getAttribute('data-c');
        renderIdentity();
      };
    });
    root.querySelectorAll('.es-mg-pos-btn').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.position = btn.getAttribute('data-pos');
        renderIdentity();
      };
    });
    if (focusSel) {
      var el = root.querySelector(focusSel);
      if (el) {
        el.focus();
        try {
          if (el.setSelectionRange && el.value != null) el.setSelectionRange(el.value.length, el.value.length);
        } catch (e) {}
      }
    }
  }

  // ---------- NATION (mobile step) ----------
  function renderNation() {
    if (isWide()) {
      renderIdentity();
      return;
    }
    state.step = 'nation';
    openShell(
      topBar() +
        '<div class="es-mg-step">' +
        '<h2 class="es-mg-step-title">Nazionalità</h2>' +
        '<div class="es-mg-progress"><span style="width:33%"></span></div>' +
        '<div class="es-mg-search-wrap">' +
        '<input type="search" class="es-mg-search" id="es-mg-nation-q" placeholder="Cerca nazione" value="' +
        esc(state.nationFilter) +
        '" />' +
        '</div>' +
        '<div class="es-mg-nation-grid" id="es-mg-nations">' +
        nationListHtml() +
        '</div>' +
        '<div class="es-mg-footer-btns">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-continue"' +
        (state.nation ? '' : ' disabled') +
        '>Continua</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderLanding;
    var cont = document.getElementById('es-mg-continue');
    cont.onclick = function () {
      if (!state.nation) return;
      renderPosition();
    };
    var inp = document.getElementById('es-mg-nation-q');
    inp.oninput = function () {
      state.nationFilter = inp.value;
      renderNation();
      var el = document.getElementById('es-mg-nation-q');
      if (el) {
        el.focus();
        try {
          el.setSelectionRange(el.value.length, el.value.length);
        } catch (e) {}
      }
    };
    root.querySelectorAll('.es-mg-nation').forEach(function (btn) {
      btn.onclick = function () {
        state.nation = btn.getAttribute('data-n');
        state.nationCode = btn.getAttribute('data-c');
        renderNation();
      };
    });
  }

  // ---------- POSITION (mobile step) ----------
  function renderPosition() {
    if (isWide()) {
      renderIdentity();
      return;
    }
    state.step = 'position';
    openShell(
      topBar() +
        '<div class="es-mg-step">' +
        '<h2 class="es-mg-step-title">Ruolo</h2>' +
        '<div class="es-mg-progress"><span style="width:66%"></span></div>' +
        '<div class="es-mg-field-wrap">' +
        fieldHtml() +
        '</div>' +
        '<div class="es-mg-footer-btns">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-confirm"' +
        (state.position ? '' : ' disabled') +
        '>Conferma identità</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderNation;
    document.getElementById('es-mg-confirm').onclick = function () {
      if (!state.position) return;
      createPlayer();
      renderCareer(true);
    };
    root.querySelectorAll('.es-mg-pos-btn').forEach(function (btn) {
      btn.onclick = function () {
        state.position = btn.getAttribute('data-pos');
        renderPosition();
      };
    });
  }

  function clubLeagueTier(club) {
    var league = String((club && (club.l || club.league)) || '').toUpperCase();
    if (league.indexOf('SERIE D') >= 0) return 4;
    if (league.indexOf('SERIE C') >= 0) return 3;
    if (league.indexOf('SERIE B') >= 0) return 2;
    if (league.indexOf('SERIE A') >= 0) return 1;
    if (/PREMIER LEAGUE|LA LIGA|BUNDESLIGA|LIGUE 1|PRIMEIRA LIGA|EREDIVISIE|BRASILEIRAO|LIGA ARGENTINA|LIGA MX/.test(league)) return 1;
    if (/CHAMPIONSHIP|SEGUNDA|LIGUE 2|2\.\s*BUNDESLIGA/.test(league)) return 2;
    if (/TERZA CATEGORIA|ECCELLENZA|PROMOZIONE/.test(league)) return 4;
    return (club && club.t) ? Number(club.t) : 4;
  }

  function liveClub(club) {
    if (!club || !club.n) return club;
    var name = String(club.n).toUpperCase();
    var found = (state.clubs || []).filter(function (c) {
      return String(c.n || '').toUpperCase() === name;
    })[0];
    if (!found) {
      clampClubToHistory(club);
      return club;
    }
    clampClubToHistory(found);
    var out = Object.assign({}, found);
    if (club.isLoan) out.isLoan = true;
    if (club.isStay) out.isStay = true;
    if (club.isPromoted) out.isPromoted = true;
    if (club.isRelegated) out.isRelegated = true;
    return out;
  }

  function labelForItalianTier(club, t, atStart) {
    if (t === 3 && !atStart && typeof window !== 'undefined' && window.EliseePiramide && window.EliseePiramide.labelSerieC) {
      return window.EliseePiramide.labelSerieC(club);
    }
    if (typeof window !== 'undefined' && window.EliseeClubStoria && window.EliseeClubStoria.labelFor) {
      return window.EliseeClubStoria.labelFor(club, t, atStart);
    }
    if (t === 1) return 'SERIE A';
    if (t === 2) return 'SERIE B';
    if (t === 3) return 'SERIE C · GIRONE A';
    return 'SERIE D · GIRONE A';
  }

  function isItalianPyramid(club) {
    if (!club || club.world) return false;
    var l = String(club.l || '').toUpperCase();
    return l.indexOf('SERIE') >= 0;
  }

  var _PIR = (typeof window !== 'undefined' && window.EliseePiramide) ? window.EliseePiramide : null;
  var SERIE_C_GIRONI = (_PIR && _PIR.SERIE_C_GIRONI) ? _PIR.SERIE_C_GIRONI.slice() : ['A', 'B', 'C'];
  var SERIE_D_GIRONI = (_PIR && _PIR.SERIE_D_GIRONI) ? _PIR.SERIE_D_GIRONI.slice() : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  function clubGironeLetter(club) {
    var tier = clubLeagueTier(club);
    var l = String((club && (club.l || club.league)) || '').toUpperCase();
    var m = l.match(/GIR(?:ONE|\.)\s*([A-I])/);
    var letter = m ? m[1] : '';
    if (!letter) {
      var g = getGironeForClub(club && club.n, tier === 3);
      var m2 = String(g || '').toUpperCase().match(/([A-I])/);
      letter = m2 ? m2[1] : 'A';
    }
    if (tier === 3 && SERIE_C_GIRONI.indexOf(letter) < 0) letter = 'A';
    return letter || 'A';
  }

  var LIKELY_PROMOTE_C = [];
  var LIKELY_PROMOTE_D = [];

  function clubNameHit(club, list) {
    var n = String((club && club.n) || '').toUpperCase();
    if (!n) return false;
    for (var i = 0; i < list.length; i++) {
      if (n.indexOf(list[i]) >= 0) return true;
    }
    return false;
  }

  function weightedPickN(arr, n, weightFn) {
    var bag = arr.slice();
    var out = [];
    while (out.length < n && bag.length) {
      var weights = [];
      var total = 0;
      for (var i = 0; i < bag.length; i++) {
        var w = weightFn(bag[i]);
        if (w < 0) w = 0;
        weights.push(w);
        total += w;
      }
      if (total <= 0) break;
      var r = Math.random() * total;
      var acc = 0;
      var idx = 0;
      for (var j = 0; j < bag.length; j++) {
        acc += weights[j];
        if (r <= acc) {
          idx = j;
          break;
        }
      }
      out.push(bag.splice(idx, 1)[0]);
    }
    return out;
  }

  function evolveItalianLeagues() {
    (state.clubs || []).forEach(function (c) {
      c.justPromoted = false;
      c.justRelegated = false;
    });
    function pool(t) {
      return (state.clubs || []).filter(function (c) {
        return Number(c.t) === t && isItalianPyramid(c);
      });
    }
    function move(c, t, up, fromGirone) {
      if (!isLegalTier(c, t)) return;
      var fromTier = Number(c.t);
      var fromG = fromGirone || clubGironeLetter(c);
      c.t = t;
      c.l = labelForItalianTier(c, t);
      c.justPromoted = !!up;
      c.justRelegated = !up;
      if (up) {
        c.promotedFromGirone = fromG;
        c.promotedFromTier = fromTier;
      } else {
        c.promotedFromGirone = '';
        c.promotedFromTier = 0;
      }
    }
    function poolGirone(t, letter) {
      return pool(t).filter(function (c) {
        return clubGironeLetter(c) === letter;
      });
    }
    function promoteGironeWinner(fromTier, letter, toTier) {
      var g = poolGirone(fromTier, letter).filter(function (c) { return isLegalTier(c, toTier); });
      if (!g.length) g = pool(fromTier).filter(function (c) { return !c.justPromoted && isLegalTier(c, toTier); });
      var pick = weightedPickN(g, 1, function (c) {
        if (typeof window !== 'undefined' && window.EliseeClubStoria) {
          return window.EliseeClubStoria.promoteWeight(c, fromTier);
        }
        return clubStoria(c).promo || 0.1;
      })[0];
      if (pick) {
        move(pick, toTier, true, letter);
        attachGironeWinnerTrophy(pick, fromTier, letter);
      }
    }
    weightedPickN(pool(2).filter(function (c) { return isLegalTier(c, 1); }), 2, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.promoteWeight(c, 2) : 0.1) * 100;
    }).forEach(function (c) { move(c, 1, true); });
    weightedPickN(pool(1).filter(function (c) { return isLegalTier(c, 2); }), 3, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 1) : 0) * 100;
    }).forEach(function (c) { move(c, 2, false); });
    SERIE_C_GIRONI.forEach(function (g) {
      promoteGironeWinner(3, g, 2);
    });
    weightedPickN(pool(2).filter(function (c) { return !c.justPromoted && isLegalTier(c, 3); }), SERIE_C_GIRONI.length, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 2) : 0.1) * 100;
    }).forEach(function (c) { move(c, 3, false); });
    SERIE_D_GIRONI.forEach(function (g) {
      promoteGironeWinner(4, g, 3);
    });
    SERIE_C_GIRONI.forEach(function (g) {
      var gPool = poolGirone(3, g).filter(function (c) { return !c.justPromoted && isLegalTier(c, 4); });
      var nDown = 3;
      weightedPickN(gPool, nDown, function (c) {
        return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 3) : 0.1) * 100;
      }).forEach(function (c) { move(c, 4, false); });
    });
    repairClubTiers();
  }

  function attachGironeWinnerTrophy(club, fromTier, letter) {
    var p = state.player;
    if (!p || !p.history || !p.history.length || !club) return;
    var last = p.history[p.history.length - 1];
    if (!last || String(last.club || '').toUpperCase() !== String(club.n || '').toUpperCase()) return;
    var key = '';
    if (fromTier === 3) {
      key = letter === 'B' ? 'serie_c_b' : letter === 'C' ? 'serie_c_c' : 'serie_c_a';
    } else if (fromTier === 4) {
      key = 'serie_d';
    }
    if (!key) return;
    last.trophyList = last.trophyList || [];
    if (last.trophyList.indexOf(key) < 0) last.trophyList.push(key);
    last.trophies = last.trophyList.length;
  }

  function snapshotLeagueBoard(p) {
    if (!p) return;
    p.leagueBoard = (state.clubs || []).map(function (c) {
      return {
        n: c.n,
        t: c.t,
        l: c.l,
        jp: !!c.justPromoted,
        jr: !!c.justRelegated,
        pg: c.promotedFromGirone || '',
        pt: c.promotedFromTier || 0
      };
    });
  }

  function restoreLeagueBoard(p) {
    if (!p || !p.leagueBoard || !state.clubs) return;
    var map = {};
    p.leagueBoard.forEach(function (r) {
      if (r && r.n) map[String(r.n).toUpperCase()] = r;
    });
    state.clubs.forEach(function (c) {
      var r = map[String(c.n || '').toUpperCase()];
      if (!r) return;
      var want = Number(r.t);
      if (!isLegalTier(c, want)) {
        guardClub(c, false);
        return;
      }
      c.t = want;
      c.l = r.l && Number(c.t) === 3 && /GIR(?:ONE|\.)\s*[D-I]/.test(String(r.l).toUpperCase())
        ? labelForItalianTier(c, want)
        : (r.l || labelForItalianTier(c, want));
      c.justPromoted = !!r.jp;
      c.justRelegated = !!r.jr;
      c.promotedFromGirone = r.pg || '';
      c.promotedFromTier = r.pt || 0;
      guardClub(c, false);
    });
  }

  function clubPrestige(club) {
    var n = String((club && club.n) || '').toUpperCase();
    if (!n || n === 'SVINCOLATO') return 0.35;
    var table = [
      ['REAL MADRID', 1.62], ['BARCELONA', 1.58], ['BAYERN', 1.55], ['MANCHESTER CITY', 1.58],
      ['LIVERPOOL', 1.48], ['PSG', 1.5], ['JUVENTUS', 1.52], ['INTER', 1.48], ['MILAN', 1.46],
      ['NAPOLI', 1.38], ['ROMA', 1.3], ['LAZIO', 1.26], ['ATALANTA', 1.24], ['FIORENTINA', 1.16],
      ['SAMPORIA', 1.08], ['TORINO', 1.1], ['BOLOGNA', 1.12], ['UDINESE', 1.02],
      ['GENOA', 1.04], ['CAGLIARI', 1.0], ['LECCE', 0.96], ['EMPOLI', 0.94],
      ['ASCOLI', 0.82], ['REGGIANA', 0.8], ['PRO SESTO', 0.68], ['PESCARA', 0.84],
      ['PALERMO', 0.9], ['PARMA', 0.92], ['VENEZIA', 0.88], ['BARI', 0.86]
    ];
    for (var i = 0; i < table.length; i++) {
      if (n.indexOf(table[i][0]) >= 0) return table[i][1];
    }
    var t = clubLeagueTier(club);
    if (t === 1) return 1.0;
    if (t === 2) return 0.78;
    if (t === 3) return 0.6;
    return 0.48;
  }

  function calcRealisticValueM(ovr, age, club) {
    if (!club || club.isFree || String(club.n || '') === 'Svincolato') {
      return 0.02;
    }
    var tier = clubLeagueTier(club);
    var o = Math.max(40, Math.min(92, Number(ovr) || 49));
    var a = Number(age) || 20;
    var ageMul = 1;
    if (a <= 18) ageMul = 0.72;
    else if (a <= 22) ageMul = 1.05;
    else if (a <= 27) ageMul = 1.1;
    else if (a <= 30) ageMul = 1;
    else if (a <= 33) ageMul = 0.68;
    else ageMul = Math.max(0.28, 0.5 - (a - 33) * 0.05);
    var v;
    if (tier >= 4) {
      v = 0.02 + ((o - 45) / 25) * 0.05 * ageMul;
      if (v > 0.075) v = 0.075;
      if (v < 0.015) v = 0.015;
    } else if (tier === 3) {
      v = 0.04 + ((o - 48) / 26) * 0.1 * ageMul;
      if (v > 0.15) v = 0.15;
      if (v < 0.025) v = 0.025;
    } else if (tier === 2) {
      v = 0.12 + Math.pow(Math.max(0, o - 55) / 28, 1.55) * 2.5 * ageMul;
      if (v > 3) v = 3;
      if (v < 0.08) v = 0.08;
    } else {
      v = 0.35 + Math.pow(Math.max(0, o - 60) / 32, 2.05) * 72 * ageMul * clubPrestige(club);
      if (v > 90) v = 90;
      if (v < 0.2) v = 0.2;
    }
    return Math.round(v * 1000) / 1000;
  }

  function isUnsignedRow(rec) {
    if (!rec) return true;
    return !!(rec.isFree || rec.club === 'Svincolato' || rec.club === 'Libre');
  }

  function createPlayer() {
    resetClubsToCatalog();
    var starters = clubsByCatalogTier(3).concat(clubsByCatalogTier(4));
    if (!starters.length) starters = clubsByCatalogTier(2);
    if (!starters.length) starters = state.clubs || [];
    var ovr = startOvr();
    var age = 16;
    var num = parseInt(state.number, 10);
    if (isNaN(num) || num < 1 || num > 99) num = rand(2, 99);
    
    // Inizializza come SVINCOLATO (Libre) a 16 anni
    var freeClub = { n: 'Svincolato', l: 'In cerca della 1ª squadra', o: '', t: 4, isFree: true };
    state.player = {
      age: age,
      position: state.position,
      posLabel: posLabel(state.position),
      nation: state.nation,
      nationCode: state.nationCode,
      surname: (state.surname || '').trim() || 'Giocatore',
      foot: state.foot === 'left' ? 'left' : 'right',
      ovr: ovr,
      valueM: 0.025,
      number: num,
      club: freeClub,
      history: [
        {
          age: age,
          club: 'Svincolato',
          logo: '',
          league: 'In cerca della 1ª squadra',
          ovr: ovr,
          apps: 0,
          goals: 0,
          assists: 0,
          trophies: 0,
          isFree: true
        }
      ],
      caps: 0,
      natGoals: 0,
      natAst: 0,
      mode: state.mode
    };
    save(LS.career, state.player);
    save(LS.consent, true);
  }

  var TROPHY_DIR = 'immagini/minigioco/loghi-trofei/';
  function trophyImg(file, name) {
    return TROPHY_DIR + file + '?v=20260813_TROPHY';
  }
  function trophyIconHtml(key, cls) {
    var t = TROPHIES_MAP[key];
    if (!t) return '';
    var klass = cls || 'es-mg-trophy-img';
    if (t.img) {
      return '<img class="' + klass + '" src="' + t.img + '" alt="' + esc(t.name) + '" title="' + esc(t.name) + '" onerror="var s=this.getAttribute(\'src\')||\'\';if(/\\.jpg/.test(s)){this.onerror=null;this.src=s.replace(/\\.jpg/,\'.png\');}" />';
    }
    return '<span class="' + klass + '" title="' + esc(t.name) + '">' + (t.svg || '') + '</span>';
  }
  // ---------- DEFINIZIONE TROFEI (file in loghi-trofei) ----------
  var TROPHIES_MAP = {
    ballon_dor: { name: "Pallone d'Oro", cat: "Individuale", img: trophyImg('pallone-doro.jpg') },
    world_cup: { name: "Mondiale FIFA", cat: "Internazionale", img: trophyImg('mondiale.jpg') },
    euro_cup: { name: "UEFA Europei", cat: "Internazionale", img: trophyImg('europei.jpg') },
    club_world_cup: { name: "Mondiale per Club", cat: "Internazionale", img: trophyImg('mondiale-club.jpg') },
    champions_league: { name: "UEFA Champions League", cat: "Europeo", img: trophyImg('champions-league.jpg') },
    europa_league: { name: "UEFA Europa League", cat: "Europeo", img: trophyImg('europa-league.jpg') },
    conference_league: { name: "UEFA Conference League", cat: "Europeo", img: trophyImg('conference-league.jpg') },
    supercoppa_euro: { name: "UEFA Supercoppa", cat: "Europeo", img: trophyImg('supercoppa-uefa.jpg') },
    player_of_year: { name: "Giocatore dell'Anno", cat: "Individuale", img: trophyImg('giocatore-anno.jpg') },
    serie_a: { name: "Serie A Scudetto", cat: "Nazionale", img: trophyImg('serie-a.jpg') },
    serie_b: { name: "Serie B Ali della Vittoria", cat: "Nazionale", img: trophyImg('serie-b.jpg') },
    coppa_italia: { name: "Coppa Italia", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    supercoppa_italia: { name: "Supercoppa Italia", cat: "Nazionale", img: trophyImg('supercoppa-italia.jpg') },
    serie_c_a: { name: "Serie C - Girone A", cat: "Lega Pro", img: trophyImg('serie-c-a.jpg') },
    serie_c_b: { name: "Serie C - Girone B", cat: "Lega Pro", img: trophyImg('serie-c-b.jpg') },
    serie_c_c: { name: "Serie C - Girone C", cat: "Lega Pro", img: trophyImg('serie-c-c.jpg') },
    coppa_serie_c: { name: "Coppa Italia Serie C", cat: "Lega Pro", img: trophyImg('coppa-serie-c.jpg') },
    supercoppa_serie_c: { name: "Supercoppa Serie C", cat: "Lega Pro", img: trophyImg('supercoppa-serie-c.jpg') },
    serie_d: { name: "Serie D Campionato", cat: "Dilettanti", img: trophyImg('serie-d.jpg') },
    coppa_serie_d: { name: "Coppa Italia Serie D", cat: "Dilettanti", img: trophyImg('coppa-serie-d.jpg') },
    premier: { name: "Premier League", cat: "Nazionale", img: 'immagini/squadre-loghi/english-premier-league.png?v=20260814_COMP' },
    laliga: { name: "La Liga", cat: "Nazionale", img: 'immagini/squadre-loghi/la-liga.png?v=20260814_COMP' },
    bundesliga: { name: "Bundesliga", cat: "Nazionale", img: 'immagini/squadre-loghi/bundesliga.png?v=20260814_COMP' },
    ligue1: { name: "Ligue 1", cat: "Nazionale", img: 'immagini/squadre-loghi/ligue-1.png?v=20260814_COMP' },
    primeira: { name: "Primeira Liga", cat: "Nazionale", img: 'immagini/squadre-loghi/primeira-liga.png?v=20260814_COMP' },
    eredivisie: { name: "Eredivisie", cat: "Nazionale", img: 'immagini/squadre-loghi/eredivisie.png?v=20260814_COMP' },
    brasileirao: { name: "Brasileirao", cat: "Nazionale", img: trophyImg('serie-a.jpg') },
    liga_arg: { name: "Liga Argentina", cat: "Nazionale", img: trophyImg('serie-a.jpg') },
    liga_mx: { name: "Liga MX", cat: "Nazionale", img: 'immagini/squadre-loghi/liga-mx.png?v=20260814_COMP' },
    fa_cup: { name: "FA Cup", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    copa_del_rey: { name: "Copa del Rey", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    dfb_pokal: { name: "DFB Pokal", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    coupe_france: { name: "Coupe de France", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    taca_portugal: { name: "Taca de Portugal", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    knvb_cup: { name: "KNVB Beker", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    copa_brasil: { name: "Copa do Brasil", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    copa_argentina: { name: "Copa Argentina", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') },
    copa_mx: { name: "Copa MX", cat: "Nazionale", img: trophyImg('coppa-italia.jpg') }
  };

  function seasonYearOf(age) {
    return 2026 + Math.max(0, (age || 16) - 16);
  }

  function leagueTitleKey(league) {
    var u = String(league || '').toUpperCase();
    if (u.indexOf('PREMIER') >= 0) return 'premier';
    if (u.indexOf('LA LIGA') >= 0) return 'laliga';
    if (u.indexOf('BUNDESLIGA') >= 0) return 'bundesliga';
    if (u.indexOf('LIGUE 1') >= 0) return 'ligue1';
    if (u.indexOf('PRIMEIRA') >= 0) return 'primeira';
    if (u.indexOf('EREDIVISIE') >= 0) return 'eredivisie';
    if (u.indexOf('BRASILEIRAO') >= 0) return 'brasileirao';
    if (u.indexOf('LIGA ARGENTINA') >= 0) return 'liga_arg';
    if (u.indexOf('LIGA MX') >= 0) return 'liga_mx';
    if (u.indexOf('SERIE A') >= 0) return 'serie_a';
    if (u.indexOf('SERIE B') >= 0) return 'serie_b';
    if (u.indexOf('SERIE C') >= 0) {
      if (u.indexOf('GIRONE B') >= 0) return 'serie_c_b';
      if (u.indexOf('GIRONE C') >= 0) return 'serie_c_c';
      return 'serie_c_a';
    }
    if (u.indexOf('SERIE D') >= 0) return 'serie_d';
    return '';
  }

  function leagueCupKey(league) {
    var u = String(league || '').toUpperCase();
    if (u.indexOf('PREMIER') >= 0) return 'fa_cup';
    if (u.indexOf('LA LIGA') >= 0) return 'copa_del_rey';
    if (u.indexOf('BUNDESLIGA') >= 0) return 'dfb_pokal';
    if (u.indexOf('LIGUE 1') >= 0) return 'coupe_france';
    if (u.indexOf('PRIMEIRA') >= 0) return 'taca_portugal';
    if (u.indexOf('EREDIVISIE') >= 0) return 'knvb_cup';
    if (u.indexOf('BRASILEIRAO') >= 0) return 'copa_brasil';
    if (u.indexOf('LIGA ARGENTINA') >= 0) return 'copa_argentina';
    if (u.indexOf('LIGA MX') >= 0) return 'copa_mx';
    if (u.indexOf('SERIE A') >= 0 || u.indexOf('SERIE B') >= 0) return 'coppa_italia';
    if (u.indexOf('SERIE C') >= 0) return 'coppa_serie_c';
    if (u.indexOf('SERIE D') >= 0) return 'coppa_serie_d';
    return '';
  }

  function generateSeasonTrophies(p, club, newOvr, stats, age) {
    var trophies = [];
    var league = String((club && (club.l || club.league)) || '');
    var tier = clubLeagueTier(club);
    var apps = (stats && stats.apps) || 0;
    var ga = ((stats && stats.goals) || 0) + ((stats && stats.assists) || 0);
    var title = leagueTitleKey(league);
    var cup = leagueCupKey(league);
    var titleChance = tier === 4 ? 0.08 : tier === 3 ? 0.06 : tier === 2 ? 0.04 : 0.03;
    if (newOvr >= (tier === 1 ? 86 : tier === 2 ? 74 : tier === 3 ? 64 : 58) && apps >= 24 && Math.random() < titleChance) {
      if (title) trophies.push(title);
    }
    if (apps >= 18 && Math.random() < (tier === 1 ? 0.05 : 0.08)) {
      if (cup) trophies.push(cup);
      if (cup === 'coppa_italia' && Math.random() < 0.25) trophies.push('supercoppa_italia');
      if (cup === 'coppa_serie_c' && Math.random() < 0.2) trophies.push('supercoppa_serie_c');
    }
    if (tier === 1 && newOvr >= 87 && apps >= 26 && Math.random() < 0.04) {
      trophies.push('champions_league');
      if (Math.random() < 0.35) trophies.push('supercoppa_euro');
      if (Math.random() < 0.25) trophies.push('club_world_cup');
    } else if (tier === 1 && newOvr >= 82 && Math.random() < 0.05) {
      trophies.push('europa_league');
    } else if (tier === 1 && newOvr >= 76 && Math.random() < 0.05) {
      trophies.push('conference_league');
    }
    if (newOvr >= 90 && ga >= 20 && Math.random() < 0.03) trophies.push('ballon_dor');
    if (newOvr >= 86 && ga >= 14 && Math.random() < 0.04) trophies.push('player_of_year');
    var year = seasonYearOf(age);
    if ((p.caps || 0) >= 8 && newOvr >= 84) {
      if (year % 4 === 2 && Math.random() < 0.12) trophies.push('world_cup');
      if (year % 4 === 0 && Math.random() < 0.12) trophies.push('euro_cup');
    }
    return trophies;
  }

  function seasonPerformance(p, club, age) {
    var pos = p.position || 'CM';
    var ovr = p.ovr;
    var tier = clubLeagueTier(club);
    var par = tier === 1 ? 78 : tier === 2 ? 68 : tier === 3 ? 60 : 54;
    var rel = ovr - par;
    var apps = 24 + Math.round(rel * 0.55);
    if (age <= 17) apps -= 10;
    else if (age <= 19) apps -= 4;
    else if (age >= 35) apps -= 8;
    else if (age >= 33) apps -= 4;
    apps += rand(-4, 4);
    if (p.eventMods && p.eventMods.appsMul) {
      apps = Math.round(apps * p.eventMods.appsMul);
    }
    if (apps < 3) apps = 3;
    if (apps > 38) apps = 38;
    var gRate = 0.06;
    var aRate = 0.06;
    if (pos === 'ST') { gRate = 0.38; aRate = 0.12; }
    else if (pos === 'LW' || pos === 'RW') { gRate = 0.22; aRate = 0.18; }
    else if (pos === 'CAM') { gRate = 0.16; aRate = 0.22; }
    else if (pos === 'CM' || pos === 'LM' || pos === 'RM') { gRate = 0.08; aRate = 0.12; }
    else if (pos === 'CDM') { gRate = 0.04; aRate = 0.08; }
    else if (pos === 'LB' || pos === 'RB') { gRate = 0.03; aRate = 0.1; }
    else if (pos === 'CB') { gRate = 0.03; aRate = 0.03; }
    else if (pos === 'GK') { gRate = 0; aRate = 0; }
    var form = 0.78 + Math.max(-0.22, Math.min(0.4, rel * 0.03));
    var goals = pos === 'GK' ? 0 : Math.max(0, Math.round(apps * gRate * form + rand(-2, 2)));
    var assists = pos === 'GK' ? 0 : Math.max(0, Math.round(apps * aRate * form + rand(-2, 2)));
    return { apps: apps, goals: goals, assists: assists };
  }

  function expectedGA(pos, apps) {
    if (pos === 'ST') return apps * 0.42;
    if (pos === 'LW' || pos === 'RW' || pos === 'CAM') return apps * 0.32;
    if (pos === 'CM' || pos === 'LM' || pos === 'RM') return apps * 0.16;
    if (pos === 'GK') return 0;
    return apps * 0.1;
  }

  function leagueParOvr(club) {
    var tier = clubLeagueTier(club);
    return tier === 1 ? 78 : tier === 2 ? 68 : tier === 3 ? 60 : 54;
  }

  function isYouthContext(p, club, age) {
    return (age || 16) <= 19 && (p.ovr || 49) < leagueParOvr(club) - 6;
  }

  function seasonFormScore(p, club, stats, age) {
    var apps = stats.apps || 0;
    var ga = (stats.goals || 0) + (stats.assists || 0);
    var exp = expectedGA(p.position, Math.max(apps, 8));
    var perf = ga - exp;
    var score = 0;
    var youth = isYouthContext(p, club, age);
    if (youth) {
      if (apps >= 12) score += 2;
      else if (apps >= 6) score += 1;
    } else {
      if (apps >= 30) score += 2;
      else if (apps >= 20) score += 1;
      else if (apps < 10) score -= 1;
    }
    if (perf >= 5) score += 3;
    else if (perf >= 2) score += 2;
    else if (perf >= 0) score += 1;
    else if (perf <= -5) score -= 2;
    else if (perf <= -2) score -= 1;
    return score;
  }

  function jumpFromForm(score, age) {
    if (age >= 34 && Math.random() < 0.8) {
      return Math.random() < 0.45 ? 2 : 1;
    }
    if (score >= 5) return Math.random() < 0.55 ? -2 : -1;
    if (score >= 3) return -1;
    if (score >= 1) return Math.random() < 0.28 ? -1 : 0;
    if (score <= -3) return Math.random() < 0.5 ? 2 : 1;
    if (score <= -1) return 1;
    return 0;
  }

  function clampTier(t) {
    if (t < 1) return 1;
    if (t > 4) return 4;
    return t;
  }

  function bestCaseMods(age) {
    var extraGames = age >= 32 ? Math.random() < 0.62 : Math.random() < 0.38;
    if (extraGames) return { appsMul: age <= 25 ? 1.3 : 1.2 };
    if (age <= 22) return { ovrBonus: Math.random() < 0.72 ? 2 : 1 };
    if (age <= 31) return { ovrBonus: Math.random() < 0.45 ? 2 : 1 };
    return { ovrBonus: 1 };
  }

  function suspendMods(age) {
    var mods = { suspended: true };
    if (Math.random() >= 0.9) return mods;
    if (age >= 32) mods.ovrBonus = -2;
    else if (age <= 22) mods.ovrBonus = Math.random() < 0.7 ? -1 : -2;
    else mods.ovrBonus = Math.random() < 0.5 ? -1 : -2;
    return mods;
  }

  var CAREER_EVENTS = [
    {
      id: 'social',
      type: 'choice',
      title: 'Post polemico',
      text: 'Tuo zio critica la squadra sui social.',
      left: {
        choice: 'uncle',
        name: 'Stai con tuo zio',
        img: 'immagini/minigioco/dilemma-zio.jpg?v=20260813_DEC',
        pill: 'Meno minuti in questa stagione',
        mods: { appsMul: 0.62 }
      },
      right: {
        choice: 'club',
        name: 'Stai con il club',
        img: 'immagini/minigioco/dilemma-club.jpg?v=20260813_DEC',
        pill: '-2 OVR temporaneo: resti male con tuo zio',
        mods: { ovrTemp: -2 }
      }
    },
    {
      id: 'tattoo',
      type: 'spin',
      title: 'Tatuaggio gigante',
      text: 'Uno studio di tatuaggi ti propone un\'aquila enorme sul petto.',
      yesName: 'Accetta',
      yesImg: 'immagini/minigioco/dilemma-tatuaggio-si.jpg?v=20260813_DEC',
      noName: 'Rifiuta',
      noImg: 'immagini/minigioco/dilemma-tatuaggio-no.jpg?v=20260813_DEC',
      goodChance: 0.7,
      goodPill: '+1 / +2 OVR oppure pi\u00f9 partite',
      badPill: 'Si infetta: sospeso'
    },
    {
      id: 'coach',
      type: 'spin',
      title: 'Lite con l\'allenatore',
      text: 'In allenamento alzi la voce col mister davanti a tutto lo spogliatoio.',
      yesName: 'Tieni il punto',
      yesImg: 'immagini/minigioco/dilemma-allenatore.jpg?v=20260813_DEC',
      noName: 'Ti scusi',
      noImg: 'immagini/minigioco/dilemma-allenatore-scusa.jpg?v=20260813_DEC',
      goodChance: 0.68,
      goodPill: 'Lo spogliatoio ti segue: +OVR o pi\u00f9 minuti',
      badPill: 'Il club ti sospende'
    },
    {
      id: 'night',
      type: 'spin',
      title: 'Serata fuori',
      text: 'I compagni ti trascinano in discoteca la vigilia di una partita importante.',
      yesName: 'Esci lo stesso',
      yesImg: 'immagini/minigioco/dilemma-serata.jpg?v=20260813_DEC',
      noName: 'Resti a casa',
      noImg: 'immagini/minigioco/dilemma-casa.jpg?v=20260813_DEC',
      goodChance: 0.35,
      goodPill: 'Carica extra: +OVR o pi\u00f9 partite',
      badPill: 'Indisciplina: sospeso'
    },
    {
      id: 'tackle',
      type: 'spin',
      title: 'Intervento durissimo',
      text: 'Puoi chiudere una pratica con una scivolata al limite del regolamento.',
      yesName: 'Vai a colpo sicuro',
      yesImg: 'immagini/minigioco/dilemma-intervento.jpg?v=20260813_DEC',
      noName: 'Gioca pulito',
      noImg: 'immagini/minigioco/dilemma-fairplay.jpg?v=20260813_DEC',
      goodChance: 0.67,
      goodPill: 'Il mister ti tiene titolare',
      badPill: 'Squalifica / sospeso'
    },
    {
      id: 'press',
      type: 'spin',
      title: 'Intervista infuocata',
      text: 'Un giornalista ti spinge a attaccare la societa in diretta.',
      yesName: 'Parli chiaro',
      yesImg: 'immagini/minigioco/dilemma-intervista.jpg?v=20260813_DEC',
      noName: 'Glissi',
      noImg: 'immagini/minigioco/dilemma-no-comment.jpg?v=20260813_DEC',
      goodChance: 0.64,
      goodPill: 'Leadership: +OVR o pi\u00f9 spazio',
      badPill: 'Il club ti mette fuori rosa'
    },
    {
      id: 'agent',
      type: 'choice',
      resolve: 'market',
      title: 'Cambio procuratore',
      text: 'Il contratto col tuo procuratore \u00e8 in scadenza. Puoi tenerlo o cambiarlo: la scelta non sposta overall n\u00e9 minuti. A decidere sar\u00e0 solo la stagione che giochi dopo.',
      left: {
        choice: 'keep-agent',
        name: 'Tieni il procuratore',
        img: 'immagini/minigioco/dilemma-procuratore-tieni.jpg?v=20260813_DEC',
        pill: 'Non cambia nulla'
      },
      right: {
        choice: 'change-agent',
        name: 'Cambia procuratore',
        img: 'immagini/minigioco/dilemma-procuratore-cambia.jpg?v=20260813_DEC',
        pill: 'Non cambia nulla'
      }
    }
  ];

  function careerEventById(id) {
    var i;
    for (i = 0; i < CAREER_EVENTS.length; i++) {
      if (CAREER_EVENTS[i].id === id) return CAREER_EVENTS[i];
    }
    return CAREER_EVENTS[0];
  }

  function pickCareerEvent() {
    return CAREER_EVENTS[rand(0, CAREER_EVENTS.length - 1)].id;
  }

  function renderDilemmaBox(ev, animateNew) {
    var spin = ev.type === 'spin';
    var html =
      '<div class="es-mg-dilemma' + (animateNew ? ' slide-up' : '') + '" id="es-mg-dilemma-box" data-event="' + ev.id + '">' +
      '<h3>' + ev.title + '</h3>' +
      '<p>' + ev.text + '</p>' +
      '<div class="es-mg-dilemma-grid">';
    if (spin) {
      html +=
        '<button type="button" class="es-mg-dilemma-card" data-choice="spin-yes">' +
        '<span class="es-mg-dilemma-name">' + ev.yesName + '</span>' +
        '<span class="es-mg-dilemma-photo"><img src="' + ev.yesImg + '" alt="' + ev.yesName + '"></span>' +
        '<span class="es-mg-dilemma-pills">' +
        '<span class="es-mg-dilemma-pill is-ok" id="es-mg-tat-ok">' + ev.goodPill + ' · ' + Math.round(ev.goodChance * 100) + '%</span>' +
        '<span class="es-mg-dilemma-pill is-bad" id="es-mg-tat-bad">' + ev.badPill + ' · ' + Math.round((1 - ev.goodChance) * 100) + '%</span>' +
        '</span></button>' +
        '<button type="button" class="es-mg-dilemma-card" data-choice="spin-no">' +
        '<span class="es-mg-dilemma-name">' + ev.noName + '</span>' +
        '<span class="es-mg-dilemma-photo"><img src="' + ev.noImg + '" alt="' + ev.noName + '"></span>' +
        '<span class="es-mg-dilemma-pill is-mute">Non succede nulla</span>' +
        '</button>';
    } else {
      html +=
        '<button type="button" class="es-mg-dilemma-card" data-choice="' + ev.left.choice + '">' +
        '<span class="es-mg-dilemma-name">' + ev.left.name + '</span>' +
        '<span class="es-mg-dilemma-photo"><img src="' + ev.left.img + '" alt="' + ev.left.name + '"></span>' +
        '<span class="es-mg-dilemma-pill">' + ev.left.pill + '</span>' +
        '</button>' +
        '<button type="button" class="es-mg-dilemma-card" data-choice="' + ev.right.choice + '">' +
        '<span class="es-mg-dilemma-name">' + ev.right.name + '</span>' +
        '<span class="es-mg-dilemma-photo"><img src="' + ev.right.img + '" alt="' + ev.right.name + '"></span>' +
        '<span class="es-mg-dilemma-pill">' + ev.right.pill + '</span>' +
        '</button>';
    }
    html += '</div></div>';
    return html;
  }

  function ovrDeltaFromSeason(p, club, stats, dropping, age) {
    var apps = stats.apps;
    var ga = stats.goals + stats.assists;
    var exp = expectedGA(p.position, apps);
    var perf = ga - exp;
    var youth = isYouthContext(p, club, age);
    var delta = 0;
    if (youth) {
      if (apps >= 10) delta += 1;
    } else if (apps >= 30) delta += 1;
    else if (apps >= 20) delta += 0;
    else if (apps >= 12) delta -= 1;
    else delta -= 2;
    if (perf >= 6) delta += 3;
    else if (perf >= 3) delta += 2;
    else if (perf >= 1) delta += 1;
    else if (perf <= -5) delta -= 2;
    else if (perf <= -2) delta -= 1;
    if (age <= 22) delta += rand(1, 3);
    else if (age <= 25) delta += rand(0, 2);
    else if (age <= 31) delta += rand(-1, 1);
    if (age >= 34) {
      if (Math.random() < 0.8) delta = -rand(2, 4);
      else delta = Math.min(0, delta);
    } else if (age >= 32) {
      delta = Math.min(0, delta);
    }
    if (dropping) delta = Math.min(0, delta);
    if (delta > 8) delta = 8;
    if (delta < -4) delta = -4;
    return delta;
  }

  function seasonSim(p, selectedOffer) {
    var years = stepYears();
    var last = p.history[p.history.length - 1];
    var firstClub = isUnsignedRow(last);
    var club = liveClub(selectedOffer) || selectedOffer;
    var prevTier = firstClub ? 4 : clubLeagueTier(p.club || last);
    var fromDilemma = !!(p.eventMods && (p.eventMods.appsMul || p.eventMods.ovrTemp || p.eventMods.ovrBonus || p.eventMods.suspended));
    if (fromDilemma) years = 1;
    if (p.ovrRestore) {
      p.ovr += p.ovrRestore;
      p.ovrRestore = 0;
    }

    for (var y = 0; y < years; y++) {
      var seasonAge = firstClub ? 16 + y : ((p.age || 16) + 1);
      club = liveClub(club) || club;
      var newTier = clubLeagueTier(club);
      var dropping = newTier > prevTier;
      var stats = seasonPerformance(p, club, seasonAge);
      var suspended = !!(p.eventMods && p.eventMods.suspended);
      if (suspended) {
        stats.apps = 0;
        stats.goals = 0;
        stats.assists = 0;
      }
      var delta = suspended ? 0 : ovrDeltaFromSeason(p, club, stats, dropping, seasonAge);
      var newOvr = p.ovr + delta;
      if (p.eventMods && p.eventMods.ovrTemp) {
        newOvr += p.eventMods.ovrTemp;
        p.ovrRestore = -p.eventMods.ovrTemp;
      }
      if (p.eventMods && typeof p.eventMods.ovrBonus === 'number') {
        newOvr += p.eventMods.ovrBonus;
      }
      if (newOvr < 40) newOvr = 40;
      if (newOvr > 92) newOvr = 92;
      var seasonTrophyKeys = generateSeasonTrophies(p, club, newOvr, stats, seasonAge);
      var row = {
        age: seasonAge,
        club: (club && club.n) || 'Svincolato',
        logo: (club && club.o) || '',
        league: (club && club.l) || '',
        ovr: newOvr,
        apps: stats.apps,
        goals: stats.goals,
        assists: stats.assists,
        trophies: seasonTrophyKeys.length,
        trophyList: seasonTrophyKeys,
        isLoan: !!(selectedOffer && selectedOffer.isLoan),
        isFree: false,
        suspended: !!(p.eventMods && p.eventMods.suspended)
      };
      if (firstClub && y === 0) p.history[p.history.length - 1] = row;
      else p.history.push(row);
      p.age = seasonAge;
      p.ovr = newOvr;
      p.club = club;
      p.valueM = calcRealisticValueM(newOvr, seasonAge, club);
      p.lastForm = seasonFormScore(p, club, stats, seasonAge);
      p.lastJump = jumpFromForm(p.lastForm, seasonAge);
      row.form = p.lastForm;
      row.jump = p.lastJump;
      if (
        !suspended &&
        seasonAge >= 21 &&
        newOvr >= 80 &&
        newTier === 1 &&
        !isYouthContext(p, club, seasonAge) &&
        Math.random() < 0.18
      ) {
        p.caps = (p.caps || 0) + rand(1, 2);
        if (/ST|LW|RW|CAM/.test(p.position) && Math.random() < 0.4) p.natGoals = (p.natGoals || 0) + 1;
        if (Math.random() < 0.35) p.natAst = (p.natAst || 0) + 1;
      }
      evolveItalianLeagues();
      repairClubTiers();
      club = liveClub(club) || club;
      prevTier = clubLeagueTier(club);
      firstClub = false;
    }
    p.eventMods = null;
    if (!fromDilemma && p.age < 37 && p.age >= 17 && Math.random() < 0.35) {
      p.pendingDilemma = pickCareerEvent();
    } else {
      p.pendingDilemma = null;
    }
    snapshotLeagueBoard(p);
  }

  function takeUniqueClub(used, pool) {
    var avail = (pool || []).filter(function (c) {
      return c && c.n && !used[c.n];
    });
    if (!avail.length) return null;
    var c = pick(avail);
    used[c.n] = true;
    return c;
  }

  function fillOffers(used, offers, need) {
    var all = state.clubs || [];
    while (offers.length < need) {
      var extra = takeUniqueClub(used, all);
      if (!extra) break;
      offers.push(extra);
    }
    return offers;
  }

  function markYouthOffer(club, age) {
    if (!club) return club;
    var out = Object.assign({}, club);
    if ((age || 16) <= 19 && isYouthContext({ ovr: 49 }, out, age || 16)) {
      out.isYouth = true;
    }
    return out;
  }

  function sanitizeOfferClub(c) {
    if (!c) return c;
    var out = Object.assign({}, c);
    guardClub(out, false);
    return out;
  }

  function assertStartOffer(o) {
    if (!o) return o;
    guardClub(o, true);
    if (o.catalogT != null && Number(o.t) !== Number(o.catalogT)) {
      o.t = Number(o.catalogT);
      o.l = o.catalogL || labelForItalianTier(o, o.t);
    }
    o.isYouth = Number(o.t) === 1 && isBigYouthClub(o);
    return o;
  }

  function transferOffers(p) {
    var last = p.history[p.history.length - 1];
    var isFirstStep = isUnsignedRow(last);
    var used = {};
    var offers = [];

    if (isFirstStep) {
      resetClubsToCatalog();
      var aPool = clubsByCatalogTier(1).filter(isBigYouthClub);
      if (!aPool.length) aPool = clubsByCatalogTier(1);
      var a = takeUniqueClub(used, aPool);
      if (a) {
        a = Object.assign({}, a);
        a.t = 1;
        a.l = a.catalogL || a.l || 'SERIE A';
        a.isYouth = true;
        offers.push(a);
      }
      var mid = takeUniqueClub(used, clubsByCatalogTier(2));
      if (!mid) mid = takeUniqueClub(used, clubsByCatalogTier(3));
      if (mid) {
        mid = Object.assign({}, mid);
        mid.t = mid.catalogT != null ? mid.catalogT : clubLeagueTier(mid);
        mid.l = mid.catalogL || mid.l;
        mid.isYouth = false;
        offers.push(mid);
      }
      var low = takeUniqueClub(used, clubsByCatalogTier(4));
      if (low) {
        low = Object.assign({}, low);
        low.t = 4;
        low.l = low.catalogL || low.l;
        low.isYouth = false;
        offers.push(low);
      }
      return fillFirstOffers(used, offers).map(assertStartOffer);
    }

    var cur = liveClub(p.club) || p.club;
    var curT = clubLeagueTier(cur);
    if (cur && cur.n) {
      used[cur.n] = true;
      var stay = Object.assign({}, cur);
      stay.isStay = true;
      if (cur.justPromoted) stay.isPromoted = true;
      if (cur.justRelegated) stay.isRelegated = true;
      if (isYouthContext(p, stay, p.age)) stay.isYouth = true;
      offers.push(stay);
    }

    var jump = typeof p.lastJump === 'number' ? p.lastJump : jumpFromForm(p.lastForm || 0, p.age);
    if (p.age >= 34 && Math.random() < 0.8) {
      jump = Math.max(jump, Math.random() < 0.45 ? 2 : 1);
    }
    var target = clampTier(curT + jump);
    var alt = jump < 0
      ? clampTier(target - 1)
      : jump > 0
        ? clampTier(target + 1)
        : clampTier(curT + (Math.random() < 0.5 ? -1 : 1));
    if (alt === target) alt = clampTier(target + (jump <= 0 ? 1 : -1));

    var promoPool = (state.clubs || []).filter(function (c) {
      return c.justPromoted && c.n && !used[c.n] && isLegalTier(c, clubLeagueTier(c));
    });
    if (promoPool.length && offers.length < 3 && jump <= 0) {
      var pc = takeUniqueClub(used, promoPool);
      if (pc) {
        pc = Object.assign({}, pc);
        pc.isPromoted = true;
        if (jump <= -2) pc.isDoubleJump = true;
        offers.push(pc);
      }
    }

    var want = [target, alt];
    var filled = fillOffersFromTiers(used, offers, 3, want);
    filled.forEach(function (o) {
      if (o.isStay) return;
      var t = clubLeagueTier(o);
      if (t <= curT - 2) o.isDoubleJump = true;
      else if (t >= curT + 2) o.isDoubleDrop = true;
      else if (t < curT) o.isJumpUp = true;
      else if (t > curT) o.isJumpDown = true;
      o.isYouth = t === 1 && isBigYouthClub(o) && isYouthContext(p, o, p.age);
      if (o.isYouth) {
        o.isLoan = false;
      } else if (p.age <= 21 && t < curT) {
        o.isLoan = true;
      } else if (p.age <= 23 && t <= curT && p.ovr < leagueParOvr(o) - 8) {
        o.isLoan = Math.random() < 0.6;
      } else {
        o.isLoan = false;
      }
    });
    return filled.map(sanitizeOfferClub);
  }

  function fillFirstOffers(used, offers) {
    var order = [1, 2, 4, 3];
    var i = 0;
    while (offers.length < 3 && i < 12) {
      var c = takeUniqueClub(used, clubsByCatalogTier(order[Math.min(i, order.length - 1)]));
      if (!c) {
        i++;
        continue;
      }
      c = Object.assign({}, c);
      c.t = c.catalogT != null ? c.catalogT : clubLeagueTier(c);
      c.l = c.catalogL || c.l;
      c.isYouth = Number(c.t) === 1 && isBigYouthClub(c);
      offers.push(c);
      i++;
    }
    return offers.slice(0, 3);
  }

  function fillOffersFromTiers(used, offers, need, tiers) {
    var i = 0;
    while (offers.length < need && i < 12) {
      var t = (tiers && tiers[Math.min(i, tiers.length - 1)]) || 4;
      var c = takeUniqueClub(used, clubsByTier(t));
      if (!c) c = takeUniqueClub(used, clubsByTier(Math.min(4, t + 1)));
      if (!c) c = takeUniqueClub(used, state.clubs);
      if (!c) break;
      offers.push(c);
      i++;
    }
    return offers.slice(0, need);
  }

  function getGironeForClub(clubName, isSerieC) {
    var name = String(clubName || '').toUpperCase();
    var charCode = 0;
    for (var i = 0; i < name.length; i++) charCode += name.charCodeAt(i);
    if (isSerieC) {
      var gironiC = ['Girone A', 'Girone B', 'Girone C'];
      return gironiC[charCode % 3];
    } else {
      var gironiD = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E', 'Girone F', 'Girone G', 'Girone H', 'Girone I'];
      return gironiD[charCode % 9];
    }
  }

  function shortLeague(l, clubName) {
    l = String(l || '').trim();
    if (!l) return '';
    var upper = l.toUpperCase();
    if (upper.indexOf('SERIE A') === 0) return 'Serie A';
    if (upper.indexOf('SERIE B') === 0) return 'Serie B';
    
    if (upper.indexOf('SERIE C') === 0) {
      var girMatchC = l.match(/GIR(?:ONE|\.)\s*([A-I])/i);
      var letterC = girMatchC ? girMatchC[1].toUpperCase() : 'A';
      if (letterC !== 'A' && letterC !== 'B' && letterC !== 'C') {
        letterC = window.EliseeClubStoria && window.EliseeClubStoria.serieCGirone
          ? window.EliseeClubStoria.serieCGirone(letterC)
          : 'A';
      }
      return 'Serie C · Gir. ' + letterC;
    }
    
    if (upper.indexOf('SERIE D') === 0) {
      var girMatchD = l.match(/GIRONE\s+([A-I0-9]+)/i);
      if (girMatchD) {
        return 'Serie D · Gir. ' + girMatchD[1].toUpperCase();
      }
      var fallbackGirD = getGironeForClub(clubName || l, false);
      return 'Serie D · ' + fallbackGirD.replace('Girone', 'Gir.');
    }
    if (upper.indexOf('PREMIER') >= 0) return 'Premier League';
    if (upper.indexOf('LA LIGA') >= 0) return 'La Liga';
    if (upper.indexOf('BUNDESLIGA') >= 0) return 'Bundesliga';
    if (upper.indexOf('LIGUE 1') >= 0) return 'Ligue 1';
    if (upper.indexOf('PRIMEIRA') >= 0) return 'Primeira Liga';
    if (upper.indexOf('EREDIVISIE') >= 0) return 'Eredivisie';
    if (upper.indexOf('BRASILEIRAO') >= 0) return 'Brasileirao';
    if (upper.indexOf('LIGA ARGENTINA') >= 0) return 'Liga Argentina';
    if (upper.indexOf('LIGA MX') >= 0) return 'Liga MX';
    
    return l.length > 25 ? l.slice(0, 25) : l;
  }

  function getLeagueLogoImg(l) {
    l = String(l || '').toUpperCase();
    var src = '';
    var alt = 'Lega';
    if (l.indexOf('SERIE A') >= 0) {
      src = 'immagini/squadre-loghi/serie-a.png';
      alt = 'Serie A';
    } else if (l.indexOf('SERIE B') >= 0) {
      src = 'immagini/squadre-loghi/serie-b.png';
      alt = 'Serie B';
    } else if (l.indexOf('SERIE C') >= 0) {
      src = 'immagini/squadre-loghi/serie-c.png';
      alt = 'Serie C';
    } else if (l.indexOf('SERIE D') >= 0) {
      src = 'immagini/squadre-loghi/serie-d.png';
      alt = 'Serie D';
    } else if (l.indexOf('PREMIER') >= 0) {
      src = 'immagini/squadre-loghi/english-premier-league.png';
      alt = 'Premier League';
    } else if (l.indexOf('LA LIGA') >= 0) {
      src = 'immagini/squadre-loghi/la-liga.png';
      alt = 'La Liga';
    } else if (l.indexOf('BUNDESLIGA') >= 0) {
      src = 'immagini/squadre-loghi/bundesliga.png';
      alt = 'Bundesliga';
    } else if (l.indexOf('LIGUE 1') >= 0) {
      src = 'immagini/squadre-loghi/ligue-1.png';
      alt = 'Ligue 1';
    } else if (l.indexOf('PRIMEIRA') >= 0) {
      src = 'immagini/squadre-loghi/primeira-liga.png';
      alt = 'Primeira Liga';
    } else if (l.indexOf('EREDIVISIE') >= 0) {
      src = 'immagini/squadre-loghi/eredivisie.png';
      alt = 'Eredivisie';
    } else if (l.indexOf('LIGA MX') >= 0) {
      src = 'immagini/squadre-loghi/liga-mx.png';
      alt = 'Liga MX';
    }
    if (src) {
      return (
        '<img class="es-mg-league-logo-img" src="' +
        esc(src) +
        '?v=20260808" alt="' +
        esc(alt) +
        '" onerror="this.style.display=\'none\';" />'
      );
    }
    return '';
  }

  var PITCH_SVG = '<svg class="es-mg-icon-pitch" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><circle cx="12" cy="12" r="3"></circle></svg>';

  function clubCardTone(name) {
    var s = String(name || '');
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var hues = [350, 220, 150, 0, 270, 30, 200, 340, 210, 25, 195];
    var hue = hues[h % hues.length];
    return 'linear-gradient(180deg, hsla(' + hue + ',42%,18%,1), hsla(' + hue + ',38%,9%,1))';
  }

  function renderCareerSummary() {
    state.step = 'summary';
    var p = state.player || load(LS.career, null);
    if (!p) {
      renderLanding();
      return;
    }
    var totApps = (p.history || []).reduce(function (a, b) { return a + (b.apps || 0); }, 0);
    var totGoals = (p.history || []).reduce(function (a, b) { return a + (b.goals || 0); }, 0);
    var totAssists = (p.history || []).reduce(function (a, b) { return a + (b.assists || 0); }, 0);
    var clubsMap = {};
    var clubOrder = [];
    var individual = [];
    (p.history || []).forEach(function (h) {
      if (!h || h.isFree || h.club === 'Svincolato') return;
      if (!clubsMap[h.club]) {
        clubsMap[h.club] = { name: h.club, logo: h.logo || '', apps: 0, goals: 0, assists: 0, trophies: [] };
        clubOrder.push(h.club);
      }
      var c = clubsMap[h.club];
      c.apps += h.apps || 0;
      c.goals += h.goals || 0;
      c.assists += h.assists || 0;
      (h.trophyList || []).forEach(function (k) {
        var def = TROPHIES_MAP[k];
        if (!def) return;
        if (def.cat === 'Individuale') {
          if (individual.indexOf(k) < 0) individual.push(k);
        } else {
          c.trophies.push(k);
        }
      });
    });
    var awardsHtml = individual.length
      ? individual.map(function (k) {
          return trophyIconHtml(k, 'es-mg-trophy-img');
        }).join('')
      : '<div class="es-mg-sum-empty">Vetrina vuota</div>';
    var clubsHtml = clubOrder.map(function (name) {
      var c = clubsMap[name];
      var cups = c.trophies.map(function (k) {
        return trophyIconHtml(k, 'es-mg-trophy-img');
      }).join('');
      return (
        '<div class="es-mg-sum-club" style="background:' + clubCardTone(c.name) + '">' +
        (c.logo ? '<img src="' + esc(c.logo) + '" alt="" onerror="this.style.display=\'none\'">' : '<div style="height:54px"></div>') +
        '<div class="es-mg-sum-club-name">' + esc(c.name) + '</div>' +
        '<div class="es-mg-sum-club-stats">' +
        '<div><span>PR</span><b>' + c.apps + '</b></div>' +
        '<div><span>GOL</span><b>' + c.goals + '</b></div>' +
        '<div><span>ASS</span><b>' + c.assists + '</b></div>' +
        '</div>' +
        (cups ? '<div class="es-mg-sum-awards-row">' + cups + '</div>' : '') +
        '</div>'
      );
    }).join('');
    var userChip = '';
    try {
      if (isAccountLogged()) {
        var uu = getActiveAccount() || {};
        var nn = ((uu.nome || '') + ' ' + (uu.cognome || '')).trim() || uu.username || 'Account';
        userChip = '<div class="es-mg-user-chip">' + String(nn).replace(/</g, '') + '</div>';
      }
    } catch (e0) {}
    openShell(
      '<button type="button" class="es-mg-float-close" id="es-mg-x">Chiudi</button>' +
        '<div class="es-mg-sum">' +
        '<div class="es-mg-sum-board">' +
        '<div class="es-mg-sum-top">' +
        '<div class="es-mg-sum-card es-mg-sum-player">' +
        '<p class="es-mg-sum-kicker">Carriera conclusa</p>' +
        '<h2 class="es-mg-sum-name">' + esc(p.surname || 'Giocatore') + '</h2>' +
        '<div class="es-mg-sum-player-row">' +
        '<div>' +
        '<span class="es-mg-tag">#' + p.number + '</span> ' +
        '<span class="es-mg-tag green">' + esc(p.posLabel || posLabel(p.position) || '') + '</span>' +
        '<div class="es-mg-sum-val" style="margin-top:0.55rem">VALORE<b>\u20ac' + formatValue(p.valueM) + '</b></div>' +
        '</div>' +
        '<div class="es-mg-sum-ovr c' + ovrColor(p.ovr) + '"><span>OVR</span><strong>' + p.ovr + '</strong></div>' +
        '</div>' +
        '<div class="es-mg-sum-stats">' +
        '<div><span>PR</span><b>' + totApps + '</b></div>' +
        '<div><span>GOL</span><b>' + totGoals + '</b></div>' +
        '<div><span>ASS</span><b>' + totAssists + '</b></div>' +
        '</div></div>' +
        '<div class="es-mg-sum-card es-mg-sum-nat">' +
        '<p class="es-mg-sum-kicker">Nazionale</p>' +
        '<h2 class="es-mg-sum-name" style="font-size:1.25rem">' + flagOf(p.nationCode) + ' ' + esc(p.nation || 'Italia') + '</h2>' +
        '<div class="es-mg-sum-stats">' +
        '<div><span>PR</span><b>' + (p.caps || 0) + '</b></div>' +
        '<div><span>GOL</span><b>' + (p.natGoals || 0) + '</b></div>' +
        '<div><span>ASS</span><b>' + (p.natAst || 0) + '</b></div>' +
        '</div>' +
        '<div class="es-mg-sum-empty">Vetrina vuota</div>' +
        '</div>' +
        '<div class="es-mg-sum-card es-mg-sum-awards">' +
        '<p class="es-mg-sum-kicker">Premi individuali</p>' +
        (individual.length ? '<div class="es-mg-sum-awards-row">' + awardsHtml + '</div>' : awardsHtml) +
        '</div></div>' +
        '<div class="es-mg-sum-clubs">' + clubsHtml + '</div>' +
        '<div class="es-mg-sum-foot">' +
        '<button type="button" class="es-mg-btn-full ghost" id="es-mg-restart">Gioca di nuovo</button>' +
        '</div></div></div>'
    );
    bindClose();
    var restart = document.getElementById('es-mg-restart');
    if (restart) {
      restart.onclick = function () {
        state.player = null;
        state.position = null;
        renderLanding();
      };
    }
  }

  // ---------- CAREER ----------
  function renderCareer(animateNew) {
    state.step = 'career';
    var p = state.player || load(LS.career, null);
    if (!p) {
      renderLanding();
      return;
    }
    state.player = p;
    var lastPre = p.history && p.history[p.history.length - 1];
    var isFirstStep = isUnsignedRow(lastPre);
    if (isFirstStep) {
      resetClubsToCatalog();
    } else {
      restoreLeagueBoard(p);
      repairClubTiers();
    }
    if (p.club && !p.club.isFree) {
      p.club = liveClub(p.club) || p.club;
      clampClubToHistory(p.club);
    }
    if (!isFirstStep && state.clubs && state.clubs.length) snapshotLeagueBoard(p);
    if ((p.age || 16) < 21 || (p.ovr || 0) < 78) {
      p.caps = 0;
      p.natGoals = 0;
      p.natAst = 0;
    }
    p.valueM = calcRealisticValueM(p.ovr, p.age, p.club);
    var last = lastPre;
    var offers = transferOffers(p);
    
    var totApps = p.history.reduce(function (a, b) { return a + (b.apps || 0); }, 0);
    var totGoals = p.history.reduce(function (a, b) { return a + (b.goals || 0); }, 0);
    var totAssists = p.history.reduce(function (a, b) { return a + (b.assists || 0); }, 0);

    // Raccogli tutti i trofei vinte nelle stagioni
    var allTrophies = [];
    p.history.forEach(function(h) {
      if (h.trophyList && h.trophyList.length) {
        allTrophies = allTrophies.concat(h.trophyList);
      }
    });
    var totTrophies = allTrophies.length;

    // Genera l'HTML per la Vitrina (Bacheca Trofei del Giocatore)
    var vitrinaHtml = '';
    if (!allTrophies.length) {
      vitrinaHtml = '<div class="es-mg-vitrina-empty"><span class="es-mg-vit-icon">🏆</span> Vetrina vuota</div>';
    } else {
      var trophyCounts = {};
      allTrophies.forEach(function(k) {
        trophyCounts[k] = (trophyCounts[k] || 0) + 1;
      });
      var trophyItemsHtml = Object.keys(trophyCounts).map(function(k) {
        var tDef = TROPHIES_MAP[k] || { name: k };
        var cnt = trophyCounts[k];
        return '<div class="es-mg-vitrina-item" title="' + esc(tDef.name) + (cnt > 1 ? ' (' + cnt + 'x)' : '') + '">' +
               trophyIconHtml(k, 'es-mg-trophy-img') +
               (cnt > 1 ? '<span class="es-mg-vitrina-count">' + cnt + '</span>' : '') +
               '</div>';
      }).join('');
      vitrinaHtml = '<div class="es-mg-vitrina-shelf">' + trophyItemsHtml + '</div>';
    }

    var rows = p.history
      .map(function (h, idx) {
        var isLast = idx === p.history.length - 1;
        var transferred = idx > 0 && h.club !== p.history[idx - 1].club;
        var loanMove = !!(h.isLoan && transferred);
        
        var cupsSvgHtml = '';
        if (h.trophyList && h.trophyList.length) {
          cupsSvgHtml = ' <span class="es-mg-row-trophies">' + h.trophyList.map(function(k) {
            return trophyIconHtml(k, 'es-mg-mini-trophy');
          }).join('') + '</span>';
        }
        
        var isFreeRow = h.isFree || h.club === 'Svincolato';
        var clubContent = isFreeRow
          ? '<span class="es-mg-free-tag"><span class="es-mg-qmark">?</span> Svincolato</span>'
          : (loanMove ? '<span class="es-mg-transfer-icon" title="Prestito">↳</span>' : '') +
            (h.logo
              ? '<img src="' + esc(h.logo) + '" alt="" class="es-mg-club-logo" onerror="this.style.display=\'none\'" />'
              : '') +
            '<span>' + esc(h.club) + (h.suspended ? ' <small class="es-mg-suspend-badge">Sospeso</small>' : '') + (h.isLoan ? ' <small class="es-mg-loan-badge">Prestito</small>' : '') + cupsSvgHtml + '</span>';
        var prevOvr = idx > 0 ? p.history[idx - 1].ovr : h.ovr;
        var ageTone = h.ovr > prevOvr ? ' up' : (h.ovr < prevOvr ? ' down' : '');

        return (
          '<div class="es-mg-row' +
          (isLast && animateNew ? ' is-new' : '') +
          (isLast ? ' is-current' : '') +
          '">' +
          '<div class="es-mg-row-age"><span class="es-mg-age-pill' + ageTone + '">' + h.age + '</span></div>' +
          '<div class="es-mg-row-club">' + clubContent + '</div>' +
          '<div class="es-mg-row-ovr"><span class="es-mg-ovr-pill c' + ovrColor(h.ovr) + '">' + h.ovr + '</span></div>' +
          '<div class="es-mg-row-stat" title="Presenze">' + (isFreeRow ? '—' : h.apps) + '</div>' +
          '<div class="es-mg-row-stat" title="Gol">' + (isFreeRow ? '—' : h.goals) + '</div>' +
          '<div class="es-mg-row-stat" title="Assist">' + (isFreeRow ? '—' : h.assists) + '</div>' +
          '</div>'
        );
      })
      .join('');

    if (p.age < 38) {
      var nextAge = (p.age || 16) + 1;
      var pendingTxt = p.pendingDilemma && !isFirstStep ? 'Decisione di carriera\u2026' : 'Scegliendo squadra\u2026';
      rows +=
        '<div class="es-mg-row is-pending">' +
        '<div class="es-mg-row-age">' + nextAge + '</div>' +
        '<div class="es-mg-row-club"><span class="es-mg-muted"><span class="es-mg-qmark">?</span> ' + pendingTxt + '</span></div>' +
        '<div class="es-mg-row-ovr"><span class="es-mg-ovr-pill">—</span></div>' +
        '<div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div>' +
        '</div>';
    }

    var offerHtml = offers
      .map(function (o, i) {
        var stay = !!(o.isStay || (p.club && o.n === p.club.n && !isFirstStep));
        var btnTitle = isFirstStep
          ? 'Firma per'
          : stay
            ? 'Resta a'
            : o.isLoan
              ? 'In prestito a'
              : 'Acquisto:';
        o = isFirstStep ? assertStartOffer(Object.assign({}, o)) : sanitizeOfferClub(o);
        var formattedLeague = shortLeague(o.l, o.n);
        var leagueLogoTag = getLeagueLogoImg(o.l);
        var extraBadge = '';
        if (o.isYouth) extraBadge += '<span class="es-mg-offer-badge-youth">Settore giovanile</span>';
        else if (o.isLoan) extraBadge += '<span class="es-mg-offer-badge-loan">PRESTITO</span>';
        else if (!stay && !isFirstStep) extraBadge += '<span class="es-mg-offer-badge-buy">ACQUISTO</span>';
        if (o.isPromoted) {
          var promoTxt = 'Promossa';
          if (o.promotedFromGirone && o.promotedFromTier === 3) {
            promoTxt = (_PIR && _PIR.promoteLabel)
              ? _PIR.promoteLabel('C', o.promotedFromGirone)
              : ('Vince C Gir. ' + o.promotedFromGirone + ' \u2192 B');
          } else if (o.promotedFromGirone && o.promotedFromTier === 4) {
            promoTxt = (_PIR && _PIR.promoteLabel)
              ? _PIR.promoteLabel('D', o.promotedFromGirone)
              : ('Vince D Gir. ' + o.promotedFromGirone + ' \u2192 C');
          }
          extraBadge += '<span class="es-mg-offer-badge-up">' + promoTxt + '</span>';
        } else if (o.isRelegated) {
          extraBadge += '<span class="es-mg-offer-badge-down">Retrocessa</span>';
        } else if (o.isDoubleJump) {
          extraBadge += '<span class="es-mg-offer-badge-up">Doppio salto</span>';
        } else if (o.isJumpUp) {
          extraBadge += '<span class="es-mg-offer-badge-up">Salto di categoria</span>';
        } else if (o.isDoubleDrop) {
          extraBadge += '<span class="es-mg-offer-badge-down">Doppio calo</span>';
        } else if (o.isJumpDown) {
          extraBadge += '<span class="es-mg-offer-badge-down">Calo di categoria</span>';
        }
        return (
          '<button type="button" class="es-mg-offer' + (o.isLoan ? ' is-loan-offer' : '') + (o.isPromoted ? ' is-promo-offer' : '') + '" data-idx="' + i + '">' +
          '<span class="es-mg-offer-title">' + btnTitle + ' <b>' + esc(o.n) + '</b></span>' +
          '<span class="es-mg-offer-logo-wrap">' +
          (o.o
            ? '<img src="' + esc(o.o) + '" alt="" class="es-mg-offer-logo" onerror="this.style.display=\'none\'" />'
            : '<span class="es-mg-offer-fallback"><span class="es-mg-qmark">?</span></span>') +
          '</span>' +
          '<span class="es-mg-offer-league">' + leagueLogoTag + ' ' + esc(formattedLeague) + '</span>' +
          '<span class="es-mg-offer-badges">' + extraBadge + '</span>' +
          '</button>'
        );
      })
      .join('');

    // Titolo e descrizione del box trasferimenti
    var transferBoxTitle = isFirstStep ? 'OFFERTA DAL SETTORE GIOVANILE' : 'Finestra di mercato';
    var transferBoxDesc = isFirstStep
      ? 'Anche le big hanno il settore giovanile. Puoi firmare per una Primavera di Serie A o per un club di categoria più bassa, e poi restare a crescere oppure cambiare.'
      : 'Puoi restare o cambiare. In Serie C il vincitore di ogni girone (A, B, C) sale in Serie B; in Serie D il vincitore di ogni girone sale in Serie C.';

    // Club display in player card
    var isCurrentFree = last.isFree || last.club === 'Svincolato';
    var clubDisplayCard = isCurrentFree
      ? '<div class="es-mg-player-club svincolato-card"><span class="es-mg-qmark-lg">?</span> <strong>Svincolato</strong></div>'
      : '<div class="es-mg-player-club">' +
        (last.logo ? '<img src="' + esc(last.logo) + '" alt="" onerror="this.style.display=\'none\'" />' : '') +
        '<strong>' + esc(last.club) + '</strong>' +
        (last.isLoan ? ' <span class="es-mg-loan-tag">In Prestito</span>' : '') +
        '</div>';

    var userChip = '';
    try {
      if (isAccountLogged()) {
        var uu = getActiveAccount() || {};
        var nn = ((uu.nome || '') + ' ' + (uu.cognome || '')).trim() || uu.username || uu.email || 'Account';
        userChip = '<div class="es-mg-user-chip">' + String(nn).replace(/</g, '') + '</div>';
      }
    } catch (eChip) {}
    var leftBottom;
    if (p.age >= 38) {
      leftBottom =
        '<div class="es-mg-career-end">' +
        '<img src="immagini/minigioco/landing-hero.jpg?v=20260813_HERO" alt="">' +
        '<div class="es-mg-career-end-copy">' +
        '<h3>La tua carriera è arrivata alla fine</h3>' +
        '<div class="es-mg-career-end-btns">' +
        '<button type="button" class="es-mg-btn-full primary" id="es-mg-summary">Vedi riepilogo</button>' +
        '<button type="button" class="es-mg-btn-full ghost" id="es-mg-restart">Gioca di nuovo</button>' +
        '</div></div></div>';
    } else if (p.pendingDilemma && !isFirstStep) {
      leftBottom = renderDilemmaBox(careerEventById(p.pendingDilemma), animateNew);
    } else {
      leftBottom =
        '<div class="es-mg-transfer es-mg-cantera-box' + (animateNew ? ' slide-up' : '') + '">' +
        '<h3>' + transferBoxTitle + '</h3>' +
        '<p>' + transferBoxDesc + '</p>' +
        '<div class="es-mg-offers es-mg-offers-grid">' + offerHtml + '</div></div>';
    }
    openShell(
      '<button type="button" class="es-mg-float-close" id="es-mg-x">Chiudi</button>' +
        '<div class="es-mg-career">' +
        '<div class="es-mg-career-board">' +
        '<div class="es-mg-career-left">' +
        '<div class="es-mg-player-card' + (animateNew ? ' pop' : '') + '">' +
        '<div class="es-mg-player-card-top">' +
        '<div class="es-mg-ovr-big c' + ovrColor(p.ovr) + '"><span>OVR</span><strong>' + p.ovr + '</strong></div>' +
        '<div class="es-mg-player-meta">' +
        '<div class="es-mg-player-tags">' +
        '<span class="es-mg-tag">' + flagOf(p.nationCode) + ' ' + esc(p.nationCode || 'IT') + '</span>' +
        '<span class="es-mg-tag green">#' + p.number + '</span>' +
        '<span class="es-mg-tag green" title="' + esc(p.posLabel || posLabel(p.position) || p.position) + '">' + esc(p.posLabel || posLabel(p.position) || p.position) + '</span>' +
        (p.foot ? '<span class="es-mg-tag">' + (p.foot === 'left' ? 'Piede sinistro' : 'Piede destro') + '</span>' : '') +
        '</div>' +
        '<div class="es-mg-player-name">' + esc(p.surname || 'Giocatore') + '</div>' +
        clubDisplayCard +
        '</div>' +
        '<div class="es-mg-player-side">' +
        '<div>ETÀ <b>' + p.age + '</b></div>' +
        '<div>VALORE <b>€' + formatValue(p.valueM) + '</b></div>' +
        '</div>' +
        '</div>' +
        /* Totali carriera con icona campetto da calcio per PJ */
        '<div class="es-mg-tot-stats">' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">PR</span><b>' + PITCH_SVG + ' ' + totApps + '</b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">GOL</span><b>⚽ ' + totGoals + '</b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">ASS</span><b>🅐 ' + totAssists + '</b></div>' +
        '</div>' +
        /* Vitrina dei trofei in stile Copero */
        '<div class="es-mg-vitrina-container">' + vitrinaHtml + '</div>' +
        '</div>' +
        leftBottom +
        '</div>' +
        '<div class="es-mg-career-right">' +
        '<div class="es-mg-right-header">' +
        '<button type="button" class="es-mg-tot-icon-blue" id="es-mg-tot-btn" title="Vedi Risultati Accumulati Totali">' +
        '🏆 <span class="es-mg-badge-num">' + totTrophies + '</span>' +
        '</button>' +
        '</div>' +
        '<div class="es-mg-timeline-head">' +
        '<span>ET\u00c0</span><span>CLUB</span><span>OVR</span><span title="Presenze">PR</span><span title="Gol">GOL</span><span title="Assist">ASS</span>' +
        '</div>' +
        '<div class="es-mg-timeline" id="es-mg-timeline">' + rows + '</div>' +
        '<div class="es-mg-natbar">' +
        '<span>' + flagOf(p.nationCode) + ' ' + esc(p.nation) + '</span>' +
        '<span>' + ((p.caps || 0) > 0
          ? (p.caps + ' pres. naz. · ⚽ ' + (p.natGoals || 0) + ' · 🅐 ' + (p.natAst || 0))
          : 'Nazionale: non convocato') + '</span>' +
        '</div>' +
        '</div></div></div>'
    );
    bindClose();
    var restart = document.getElementById('es-mg-restart');
    if (restart)
      restart.onclick = function () {
        state.player = null;
        state.position = null;
        renderLanding();
      };
    var summary = document.getElementById('es-mg-summary');
    if (summary) {
      summary.onclick = function () {
        renderCareerSummary();
      };
    }
    
    // Bottone icona azzurre risultati accumulati
    var totBtn = document.getElementById('es-mg-tot-btn');
    if (totBtn) {
      totBtn.onclick = function () {
        toast('🏆 Risultati Accumulati: ' + totApps + ' Presenze, ' + totGoals + ' Gol, ' + totAssists + ' Assist, ' + totTrophies + ' Trofei!', 'info');
      };
    }

    function finishDilemmaSeason() {
      var stayClub = liveClub(p.club) || p.club;
      if (!stayClub || !stayClub.n) return;
      seasonSim(p, stayClub);
      save(LS.career, p);
      renderCareer(true);
      setTimeout(function () {
        var tl = document.getElementById('es-mg-timeline');
        if (tl) tl.scrollTop = tl.scrollHeight;
      }, 80);
    }

    function playTattooSpin(winOk, done) {
      var ok = document.getElementById('es-mg-tat-ok');
      var bad = document.getElementById('es-mg-tat-bad');
      if (!ok || !bad) {
        done();
        return;
      }
      var steps = 11 + rand(0, 4);
      if (winOk && steps % 2 === 0) steps++;
      if (!winOk && steps % 2 === 1) steps++;
      var i = 0;
      function tick() {
        var onOk = i % 2 === 0;
        ok.classList.toggle('is-pulse', onOk);
        bad.classList.toggle('is-pulse', !onOk);
        i++;
        if (i >= steps) {
          ok.classList.toggle('is-pulse', !!winOk);
          bad.classList.toggle('is-pulse', !winOk);
          ok.classList.toggle('is-win', !!winOk);
          bad.classList.toggle('is-win', !winOk);
          setTimeout(done, 750);
          return;
        }
        setTimeout(tick, 110 + i * 48);
      }
      tick();
    }

    root.querySelectorAll('.es-mg-dilemma-card').forEach(function (btn) {
      btn.onclick = function () {
        if (btn.getAttribute('data-busy') === '1') return;
        var choice = btn.getAttribute('data-choice');
        if (choice === 'spin-no') {
          p.pendingDilemma = null;
          save(LS.career, p);
          renderCareer(true);
          return;
        }
        if (choice === 'spin-yes') {
          btn.setAttribute('data-busy', '1');
          var wrap = document.getElementById('es-mg-dilemma-box');
          if (wrap) wrap.classList.add('is-spinning');
          root.querySelectorAll('.es-mg-dilemma-card').forEach(function (b) {
            b.disabled = true;
          });
          var ev = careerEventById((wrap && wrap.getAttribute('data-event')) || p.pendingDilemma);
          var winOk = Math.random() < (ev.goodChance || 0.68);
          playTattooSpin(winOk, function () {
            p.pendingDilemma = null;
            p.eventMods = winOk ? bestCaseMods(p.age) : suspendMods(p.age);
            finishDilemmaSeason();
          });
          return;
        }
        var evChoice = careerEventById(p.pendingDilemma);
        p.pendingDilemma = null;
        if (evChoice.resolve === 'market') {
          if (choice === 'change-agent') p.agent = 'nuovo';
          else if (choice === 'keep-agent') p.agent = 'stesso';
          save(LS.career, p);
          renderCareer(true);
          return;
        }
        if (evChoice.left && choice === evChoice.left.choice) p.eventMods = evChoice.left.mods;
        else if (evChoice.right && choice === evChoice.right.choice) p.eventMods = evChoice.right.mods;
        else if (choice === 'uncle') p.eventMods = { appsMul: 0.62 };
        else p.eventMods = { ovrTemp: -2 };
        finishDilemmaSeason();
      };
    });
    root.querySelectorAll('.es-mg-offer').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var offer = offers[idx];
        if (!offer) return;
        
        // Applica sim e club scelto
        seasonSim(p, offer);
        
        save(LS.career, p);
        renderCareer(true);
        
        // scroll timeline
        setTimeout(function () {
          var tl = document.getElementById('es-mg-timeline');
          if (tl) tl.scrollTop = tl.scrollHeight;
        }, 80);
      };
    });
    setTimeout(function () {
      var tl = document.getElementById('es-mg-timeline');
      if (tl) tl.scrollTop = tl.scrollHeight;
    }, 50);
  }

  function ovrColor(o) {
    if (o >= 85) return 'gold';
    if (o >= 75) return 'yellow';
    if (o >= 65) return 'orange';
    return 'bronze';
  }
  function flagOf(code) {
    var n = NATIONS.find(function (x) {
      return x.c === code;
    });
    if (!n) return '🏳️';
    if (n.o) {
      return (
        '<img class="es-mg-inline-logo" src="' +
        esc(n.o) +
        '?v=20260807" alt="" width="18" height="18" onerror="this.outerHTML=\'' +
        (n.f || '') +
        '\'" />'
      );
    }
    return n.f || '🏳️';
  }

  function formatValue(m) {
    if (m >= 1) return (Math.round(m * 10) / 10).toString().replace('.', ',') + 'M';
    return Math.round(m * 1000) + 'K';
  }

  function open() {
    try {
      var saved = load(LS.career, null);
      if (saved && saved.history && saved.history.length && saved.age < 38) {
        // resume option: always show landing; user can continue later if we add button
        state.player = saved;
        if (saved.mode) state.mode = saved.mode;
        if (saved.position) state.position = saved.position;
        if (saved.nation) state.nation = saved.nation;
      }
    } catch (e) {}
    rememberPrevPage();
    playOpenIntro(function () {
      try {
        renderHub();
      } catch (e) {
        console.error('EliseeMinigioco.open', e);
      }
    });
  }

  function openCareer() {
    try {
      var saved = load(LS.career, null);
      if (saved && saved.history && saved.history.length && saved.age < 38) {
        state.player = saved;
        if (saved.mode) state.mode = saved.mode;
        if (saved.position) state.position = saved.position;
        if (saved.nation) state.nation = saved.nation;
      }
    } catch (e) {}
    loadClubs(function () {
      renderLanding();
    });
  }

  window.openMinigiocoCarriera = open;
  window.EliseeMinigioco = {
    open: open,
    openHub: renderHub,
    openCareer: openCareer,
    close: close,
    getPublicCareers: getPublicCareers,
    version: '2026-08-13_HUB'
  };

  document.addEventListener('elisee:user-revealed', function () {
    if (state.step === 'hub') {
      try { renderHub(); } catch (e) {}
    }
  });

  // hook existing API if integrazioni already defined later — also patch now
  function bindNavOpen() {
    var nav = document.getElementById('nav-minigioco');
    if (nav && nav.dataset.mgHubBound !== '1') {
      nav.dataset.mgHubBound = '1';
      nav.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          open();
        },
        true
      );
    }
    if (document.documentElement.dataset.mgHashBound === '1') return;
    document.documentElement.dataset.mgHashBound = '1';
    function fromHash() {
      var h = String(location.hash || '');
      if (h.indexOf('minigioco') >= 0) {
        if (!root || !root.classList.contains('is-open')) open();
      } else if (root && root.classList.contains('is-open')) {
        close();
      }
    }
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('popstate', fromHash);
    if (String(location.hash || '').indexOf('minigioco') >= 0) {
      setTimeout(fromHash, 40);
    }
  }

  function bootHubHooks() {
    bindNavOpen();
    window.openMinigiocoCarriera = open;
    if (window.EliseeIntegrazioni) {
      window.EliseeIntegrazioni.openCareer = open;
      window.EliseeIntegrazioni.openMinigioco = open;
      window.EliseeIntegrazioni.closeMinigioco = close;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootHubHooks);
  } else {
    bootHubHooks();
  }
})();
