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
    publicFeed: 'elisee_career_public_feed_v1',
    identity: 'elisee_career_identity_v1'
  };

  var state = {
    step: 'closed', // closed | hub | landing | nation | position | identity | career
    mode: 'normal', // intense | normal | express
    gender: 'm', // 'm' | 'f'
    trialGender: 'm', // 'm' | 'f'
    nation: 'Italia',
    nationCode: 'IT',
    position: null,
    surname: '',
    number: 10,
    foot: 'right', // left | right
    player: null,
    clubs: null,
    nationFilter: '',
    trialCategory: null, // null | number
    trialGirone: null,   // null | string (es. 'A', 'B', 'C')
    trialRegion: null,   // null | string (es. 'PUGLIA')
    trialFilter: '',
    trialClub: null,
    trialResult: null,
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
  NATIONS.forEach(function (n) {
    n.o = 'immagini/nazioni-loghi/' + String(n.c || '').toLowerCase() + '.png';
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

  var TOP_WORLD_MALE_CLUBS = [
    { n: 'MANCHESTER CITY', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/manchester-city.png', t: 1, world: 1, g: 'm' },
    { n: 'LIVERPOOL', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/liverpool.png', t: 1, world: 1, g: 'm' },
    { n: 'ARSENAL', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/arsenal.png', t: 1, world: 1, g: 'm' },
    { n: 'CHELSEA', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/chelsea.png', t: 1, world: 1, g: 'm' },
    { n: 'MANCHESTER UNITED', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/manchester-united.png', t: 1, world: 1, g: 'm' },
    { n: 'TOTTENHAM', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/tottenham-hotspur.png', t: 1, world: 1, g: 'm' },
    { n: 'NEWCASTLE', l: 'PREMIER LEAGUE', o: 'immagini/squadre-loghi/newcastle-united.png', t: 1, world: 1, g: 'm' },
    { n: 'REAL MADRID', l: 'LA LIGA', o: 'immagini/squadre-loghi/real-madrid.png', t: 1, world: 1, g: 'm' },
    { n: 'BARCELONA', l: 'LA LIGA', o: 'immagini/squadre-loghi/barcelona.png', t: 1, world: 1, g: 'm' },
    { n: 'ATLETICO MADRID', l: 'LA LIGA', o: 'immagini/squadre-loghi/atletico-madrid.png', t: 1, world: 1, g: 'm' },
    { n: 'ATHLETIC CLUB', l: 'LA LIGA', o: 'immagini/squadre-loghi/athletic-club.png', t: 1, world: 1, g: 'm' },
    { n: 'REAL SOCIEDAD', l: 'LA LIGA', o: 'immagini/squadre-loghi/real-sociedad.png', t: 1, world: 1, g: 'm' },
    { n: 'VILLARREAL', l: 'LA LIGA', o: 'immagini/squadre-loghi/villarreal.png', t: 1, world: 1, g: 'm' },
    { n: 'BAYERN MONACO', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/bayern-munich.png', t: 1, world: 1, g: 'm' },
    { n: 'BORUSSIA DORTMUND', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/borussia-dortmund.png', t: 1, world: 1, g: 'm' },
    { n: 'RB LEIPZIG', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/rb-leipzig.png', t: 1, world: 1, g: 'm' },
    { n: 'BAYER LEVERKUSEN', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/bayer-leverkusen.png', t: 1, world: 1, g: 'm' },
    { n: 'EINTRACHT FRANCOFORTE', l: 'BUNDESLIGA', o: 'immagini/squadre-loghi/eintracht-frankfurt.png', t: 1, world: 1, g: 'm' },
    { n: 'PSG', l: 'LIGUE 1', o: 'immagini/squadre-loghi/paris-saint-germain.png', t: 1, world: 1, g: 'm' },
    { n: 'OLYMPIQUE MARSEILLE', l: 'LIGUE 1', o: 'immagini/squadre-loghi/olympique-marseille.png', t: 1, world: 1, g: 'm' },
    { n: 'MONACO', l: 'LIGUE 1', o: 'immagini/squadre-loghi/as-monaco.png', t: 1, world: 1, g: 'm' },
    { n: 'LYON', l: 'LIGUE 1', o: 'immagini/squadre-loghi/olympique-lyonnais.png', t: 1, world: 1, g: 'm' },
    { n: 'LILLE', l: 'LIGUE 1', o: 'immagini/squadre-loghi/lille.png', t: 1, world: 1, g: 'm' },
    { n: 'BENFICA', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/benfica.png', t: 1, world: 1, g: 'm' },
    { n: 'PORTO', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/fc-porto.png', t: 1, world: 1, g: 'm' },
    { n: 'SPORTING CP', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/sporting-cp.png', t: 1, world: 1, g: 'm' },
    { n: 'BRAGA', l: 'PRIMEIRA LIGA', o: 'immagini/squadre-loghi/sc-braga.png', t: 1, world: 1, g: 'm' },
    { n: 'AJAX', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/ajax.png', t: 1, world: 1, g: 'm' },
    { n: 'PSV', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/psv.png', t: 1, world: 1, g: 'm' },
    { n: 'FEYENOORD', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/feyenoord.png', t: 1, world: 1, g: 'm' },
    { n: 'AZ ALKMAAR', l: 'EREDIVISIE', o: 'immagini/squadre-loghi/az-alkmaar.png', t: 1, world: 1, g: 'm' },
    { n: 'FLAMENGO', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/flamengo.png', t: 1, world: 1, g: 'm' },
    { n: 'PALMEIRAS', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/palmeiras.png', t: 1, world: 1, g: 'm' },
    { n: 'SAO PAULO', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/sao-paulo.png', t: 1, world: 1, g: 'm' },
    { n: 'CORINTHIANS', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/corinthians.png', t: 1, world: 1, g: 'm' },
    { n: 'FLUMINENSE', l: 'BRASILEIRAO', o: 'immagini/squadre-loghi/fluminense.png', t: 1, world: 1, g: 'm' },
    { n: 'BOCA JUNIORS', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/boca-juniors.png', t: 1, world: 1, g: 'm' },
    { n: 'RIVER PLATE', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/river-plate.png', t: 1, world: 1, g: 'm' },
    { n: 'RACING CLUB', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/racing-club.png', t: 1, world: 1, g: 'm' },
    { n: 'INDEPENDIENTE', l: 'LIGA ARGENTINA', o: 'immagini/squadre-loghi/independiente.png', t: 1, world: 1, g: 'm' },
    { n: 'CLUB AMERICA', l: 'LIGA MX', o: 'immagini/squadre-loghi/club-america.png', t: 1, world: 1, g: 'm' },
    { n: 'CHIVAS', l: 'LIGA MX', o: 'immagini/squadre-loghi/chivas.png', t: 1, world: 1, g: 'm' },
    { n: 'MONTERREY', l: 'LIGA MX', o: 'immagini/squadre-loghi/monterrey.png', t: 1, world: 1, g: 'm' },
    { n: 'TIGRES', l: 'LIGA MX', o: 'immagini/squadre-loghi/tigres.png', t: 1, world: 1, g: 'm' }
  ];

  var TOP_WORLD_FEMALE_CLUBS = [
    { n: 'BARCELONA FEMENÍ', l: 'LIGA F', o: 'immagini/squadre-loghi/barcelona.png', t: 1, world: 1, g: 'f' },
    { n: 'OLYMPIQUE LYONNAIS FÉMININ', l: 'PREMIÈRE LIGUE', o: 'immagini/squadre-loghi/olympique-lyonnais.png', t: 1, world: 1, g: 'f' },
    { n: 'CHELSEA WOMEN', l: 'WOMEN\'S SUPER LEAGUE', o: 'immagini/squadre-loghi/chelsea.png', t: 1, world: 1, g: 'f' },
    { n: 'ARSENAL WOMEN', l: 'WOMEN\'S SUPER LEAGUE', o: 'immagini/squadre-loghi/arsenal.png', t: 1, world: 1, g: 'f' },
    { n: 'MANCHESTER CITY WOMEN', l: 'WOMEN\'S SUPER LEAGUE', o: 'immagini/squadre-loghi/manchester-city.png', t: 1, world: 1, g: 'f' },
    { n: 'PSG FÉMININ', l: 'PREMIÈRE LIGUE', o: 'immagini/squadre-loghi/paris-saint-germain.png', t: 1, world: 1, g: 'f' },
    { n: 'BAYERN FRAUEN', l: 'FRAUEN-BUNDESLIGA', o: 'immagini/squadre-loghi/bayern-munich.png', t: 1, world: 1, g: 'f' },
    { n: 'WOLFSBURG FRAUEN', l: 'FRAUEN-BUNDESLIGA', o: 'immagini/squadre-loghi/wolfsburg.png', t: 1, world: 1, g: 'f' },
    { n: 'REAL MADRID FEMENINO', l: 'LIGA F', o: 'immagini/squadre-loghi/real-madrid.png', t: 1, world: 1, g: 'f' },
    { n: 'ATLETICO MADRID FEMENINO', l: 'LIGA F', o: 'immagini/squadre-loghi/atletico-madrid.png', t: 1, world: 1, g: 'f' }
  ];

  var TOP_WORLD_CLUBS = TOP_WORLD_MALE_CLUBS.concat(TOP_WORLD_FEMALE_CLUBS);

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
            '?v=20260814_CAP" alt="" width="28" height="28" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.hidden=false;" />' +
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
    /* Stesso schermo identità su tutti i dispositivi: su mobile
       le 3 colonne si impilano via CSS, niente flusso spezzato. */
    renderIdentity();
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

  function rememberedSurname() {
    try {
      var pref = load(LS.identity, null);
      if (pref && String(pref.surname || '').trim().length >= 2) {
        return String(pref.surname).trim();
      }
    } catch (e) {}
    try {
      var saved = load(LS.career, null);
      if (saved && String(saved.surname || '').trim().length >= 2) {
        return String(saved.surname).trim();
      }
    } catch (e2) {}
    try {
      var u = getActiveAccount() || {};
      if (String(u.cognome || '').trim().length >= 2) return String(u.cognome).trim();
    } catch (e3) {}
    return '';
  }

  function rememberSurname(name) {
    name = String(name || '').trim();
    if (name.length < 2) return;
    state.surname = name;
    rememberIdentity();
  }

  function rememberIdentity() {
    try {
      var prev = load(LS.identity, {}) || {};
      if (typeof prev !== 'object' || !prev) prev = {};
      var sn = String(state.surname || '').trim();
      if (sn.length >= 2) prev.surname = sn;
      if (state.number) prev.number = state.number;
      if (state.foot) prev.foot = state.foot;
      if (state.gender) prev.gender = state.gender;
      if (state.trialGender) prev.gender = state.trialGender;
      if (state.nation) prev.nation = state.nation;
      if (state.nationCode) prev.nationCode = state.nationCode;
      if (state.position) prev.position = state.position;
      saveRaw(LS.identity, prev);
    } catch (e) {}
  }

  function hydrateIdentity() {
    var pref = null;
    try {
      pref = load(LS.identity, null);
    } catch (e) {
      pref = null;
    }
    if (!pref || typeof pref !== 'object') pref = {};
    if (String(state.surname || '').trim().length < 2) {
      var s = rememberedSurname();
      if (s) state.surname = s;
    }
    if (pref.number && !state._idHydrated) {
      var n = parseInt(pref.number, 10);
      if (!isNaN(n) && n >= 1 && n <= 99) state.number = n;
    }
    if (pref.foot && !state._idHydrated) state.foot = pref.foot === 'left' ? 'left' : 'right';
    if (pref.gender && !state._idHydrated) {
      state.gender = pref.gender === 'f' ? 'f' : 'm';
      state.trialGender = state.gender;
    }
    if (pref.nation && !state._idHydrated) {
      state.nation = pref.nation;
      state.nationCode = pref.nationCode || state.nationCode;
    }
    if (!state.position && pref.position) state.position = pref.position;
    state._idHydrated = true;
  }

  function liveSavedCareer() {
    var saved = null;
    try {
      saved = state.player && state.player.history && state.player.history.length
        ? state.player
        : load(LS.career, null);
    } catch (e) {
      saved = null;
    }
    if (!saved || !saved.history || !saved.history.length) return null;
    if ((saved.age || 16) >= 38) return null;
    return saved;
  }

  function savedCareerLabel(p) {
    if (!p) return '';
    var club = (p.club && p.club.n) || (p.history && p.history.length ? p.history[p.history.length - 1].club : '');
    var bits = [(p.surname || 'Giocatore') + ', ' + (p.age || 16) + ' anni'];
    if (club && club !== 'Svincolato') bits.push(club);
    bits.push('OVR ' + (p.ovr || 49));
    return bits.join(' · ');
  }

  function wipeCareerSave() {
    state.player = null;
    try {
      localStorage.removeItem(LS.career);
      var ak = accountCareerKey();
      if (ak) localStorage.removeItem(ak);
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
    state.step = 'closed';
    if (root) {
      root.classList.remove('is-open');
      root.innerHTML = '';
      try {
        root.style.setProperty('display', 'none', 'important');
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('opacity', '0', 'important');
        root.style.setProperty('pointer-events', 'none', 'important');
      } catch (e) {}
    }
    lockPageScroll(false);
  }

  function leaveMinigioco() {
    close();
    var view = 'home';
    var hash = '#hero';
    try {
      view = sessionStorage.getItem('elisee_mg_prev_view') || 'home';
      hash = sessionStorage.getItem('elisee_mg_prev_hash') || '#hero';
    } catch (e2) {}
    if (!view || view === 'minigioco') {
      view = 'home';
      hash = '#hero';
    }
    if (typeof window.switchView === 'function') {
      window.switchView(view, hash);
    } else {
      try {
        location.hash = hash;
      } catch (e3) {}
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
      '<button type="button" class="es-mg-close" id="es-mg-x">Indietro</button>' +
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
      '<button type="button" class="es-mg-close" id="es-mg-x">Indietro</button>' +
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
    if (state.clubs && state.clubs.length > 500 && state.catalogByName && Object.keys(state.catalogByName).length > 100) {
      if (typeof cb === 'function') cb(state.clubs);
      return;
    }
    fetch('data/squadre/catalog.json?v=20260830_ALPHALEAGUES', { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var rawTeams = Array.isArray(data) ? data : (data && data.teams ? data.teams : []);
        var list = rawTeams.map(function (t) {
          var l = String(t.league || t.l || '').toUpperCase();
          var nUpper = String(t.name || t.n || '').toUpperCase();
          var isF = t.gender === 'f' || l.indexOf('FEMMINIL') >= 0 || nUpper.indexOf(' WOMEN') >= 0 || nUpper.indexOf(' FEMMINIL') >= 0;
          var g = isF ? 'f' : 'm';
          var tier = 5;
          if (t.t != null && typeof t.t === 'number') {
            tier = t.t;
          } else if (isF) {
            if (l.indexOf('PRIMAVERA') >= 0 || l.indexOf('JUNIORES') >= 0 || nUpper.indexOf(' U19') >= 0 || nUpper.indexOf(' U20') >= 0) tier = 10;
            else if (l.indexOf('SERIE A') >= 0) tier = 1;
            else if (l.indexOf('SERIE B') >= 0) tier = 2;
            else if (l.indexOf('SERIE C') >= 0) tier = 3;
            else if (l.indexOf('ECCELLENZA') >= 0) tier = 4;
            else if (l.indexOf('PROMOZIONE') >= 0) tier = 5;
            else tier = 5;
          } else {
            if (l.indexOf('PRIMAVERA') >= 0 || l.indexOf('JUNIORES') >= 0 || nUpper.indexOf(' U19') >= 0 || nUpper.indexOf(' U20') >= 0) tier = 10;
            else if (l.indexOf('SERIE A') >= 0) tier = 1;
            else if (l.indexOf('SERIE B') >= 0) tier = 2;
            else if (l.indexOf('SERIE C') >= 0) tier = 3;
            else if (l.indexOf('SERIE D') >= 0) tier = 4;
            else if (l.indexOf('ECCELLENZA') >= 0) tier = 5;
            else if (l.indexOf('PROMOZIONE') >= 0) tier = 6;
            else if (l.indexOf('PRIMA CATEGORIA') >= 0) tier = 7;
            else if (l.indexOf('SECONDA CATEGORIA') >= 0) tier = 8;
            else if (l.indexOf('TERZA CATEGORIA') >= 0) tier = 9;
            else tier = 5;
          }
          return {
            n: t.name || t.n,
            l: t.league || t.l || '',
            o: t.logo || t.o || '',
            city: t.city || '',
            t: tier,
            g: g,
            homeTier: tier,
            catalogT: tier,
            catalogL: t.league || t.l || ''
          };
        });
        state.clubs = mergeWorldClubs(list);
        rememberCatalog(state.clubs);
        if (state.player && !playerIsUnsigned(state.player)) restoreLeagueBoard(state.player);
        else resetClubsToCatalog();
        repairClubTiers();
        if (typeof cb === 'function') cb(state.clubs);
      })
      .catch(function () {
        fetch('data/squadre/minigioco_clubs.json?v=20260830_ECCVENA1', { cache: 'no-store' })
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            state.clubs = mergeWorldClubs(Array.isArray(data) ? data : []);
            rememberCatalog(state.clubs);
            if (state.player && !playerIsUnsigned(state.player)) restoreLeagueBoard(state.player);
            else resetClubsToCatalog();
            repairClubTiers();
            if (typeof cb === 'function') cb(state.clubs);
          })
          .catch(function () {
            state.clubs = mergeWorldClubs([
              { n: 'JUVENTUS', l: 'SERIE A', o: 'immagini/squadre-loghi/juventus.png', t: 1, g: 'm' },
              { n: 'MILAN', l: 'SERIE A', o: 'immagini/squadre-loghi/milan.png', t: 1, g: 'm' },
              { n: 'INTER', l: 'SERIE A', o: 'immagini/squadre-loghi/inter.png', t: 1, g: 'm' },
              { n: 'NAPOLI', l: 'SERIE A', o: 'immagini/squadre-loghi/napoli.png', t: 1, g: 'm' },
              { n: 'ROMA', l: 'SERIE A', o: 'immagini/squadre-loghi/roma.png', t: 1, g: 'm' },
              { n: 'PALERMO', l: 'SERIE B', o: 'immagini/squadre-loghi/palermo.png', t: 2, g: 'm' },
              { n: 'BARI', l: 'SERIE B', o: 'immagini/squadre-loghi/bari.png', t: 2, g: 'm' },
              { n: 'PADOVA', l: 'SERIE B', o: 'immagini/squadre-loghi/padova.png', t: 2, g: 'm' },
              { n: 'CATANZARO', l: 'SERIE B', o: 'immagini/squadre-loghi/catanzaro.png', t: 2, g: 'm' },
              { n: 'PERUGIA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/perugia.png', t: 3, g: 'm' },
              { n: 'LATINA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/latina.png', t: 3, g: 'm' }
            ]);
            rememberCatalog(state.clubs);
            if (state.player && !playerIsUnsigned(state.player)) restoreLeagueBoard(state.player);
            else resetClubsToCatalog();
            repairClubTiers();
            if (typeof cb === 'function') cb(state.clubs);
          });
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
      c.justFailed = false;
      c.promotedFromGirone = '';
      c.promotedFromTier = 0;
      c.failed = false;
      c.failedFrom = 0;
      c.rebuild = '';
      c.isLoan = false;
      c.championPromoted = false;
      c.earnedCeil = null;
    });
  }

  function clubsByCatalogTier(t, gender) {
    var want = Number(t);
    var targetG = gender || (state.player && state.player.gender) || state.trialGender || 'm';
    return (state.clubs || []).filter(function (c) {
      if (!c || c.world) return false;
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== targetG) return false;
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
    if (!c) return false;
    var t = Number(destTier);
    if (isYouthClub(c)) return false;
    if (isU23Club(c)) {
      if (t === 1) return false; // Seconde squadre U23 possono salire massimo in Serie B (tier 2), mai Serie A (tier 1)
      if (t < 2 || t > 4) return false;
      return true;
    }
    if (c.earnedCeil != null) {
      var stE = clubStoria(c);
      var ceilE = Math.min(Number(stE.ceil) || t, Number(c.earnedCeil));
      var floorE = Number(stE.floor) || 9;
      if (t >= ceilE && t <= floorE) return true;
    }
    if (typeof window !== 'undefined' && window.EliseeClubStoria && window.EliseeClubStoria.legalTier) {
      return window.EliseeClubStoria.legalTier(c, destTier);
    }
    var st = clubStoria(c);
    return t >= st.ceil && t <= st.floor;
  }

  function clampClubToHistory(c) {
    return guardClub(c, false);
  }

  function guardClub(c, atStart) {
    /* Tier 11 (Primavera 1) e 12 (Primavera 2): gestiti da youthClubPower, non dalla storia seniores */
    if (!c || c.world || c.isFree || isYouthClub(c) || Number(c.t) === 11 || Number(c.t) === 12) return c;
    if (c.championPromoted && c.justPromoted) return c;
    var now = clubLeagueTier(c);
    if (c.earnedCeil != null) {
      var stKeep = clubStoria(c);
      var ceilKeep = Math.min(Number(stKeep.ceil) || now, Number(c.earnedCeil));
      var floorKeep = Number(stKeep.floor) || 9;
      if (now >= ceilKeep && now <= floorKeep) return c;
    }
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

  var U23_PARENTS = {
    'JUVENTUS U23': 'JUVENTUS',
    'JUVENTUS NEXT GEN': 'JUVENTUS',
    'INTER U23': 'INTER',
    'MILAN U23': 'MILAN',
    'MILAN FUTURO': 'MILAN',
    'ATALANTA U23': 'ATALANTA'
  };

  function isU23Club(c) {
    var n = String((c && c.n) || c || '').toUpperCase();
    return /U23|NEXT GEN|UNDER 23|FUTURO/.test(n);
  }

  function isYouthClub(c) {
    if (!c) return false;
    if (isU23Club(c)) return false;
    var n = String((c && c.n) || c || '').toUpperCase();
    var l = String((c && (c.l || c.league)) || '').toUpperCase();
    if (/\b(U19|U20|UNDER\s*19|UNDER\s*20|PRIMAVERA|JUNIORES|BERRETTI|ALLIEVI)\b/.test(n)) return true;
    if (l.indexOf('PRIMAVERA') >= 0 || l.indexOf('JUNIORES') >= 0 || l.indexOf('UNDER 19') >= 0 || l.indexOf('UNDER 20') >= 0) return true;
    return false;
  }

  function isU19Club(c) {
    if (!c) return false;
    if (isU23Club(c)) return false;
    var n = String((c && c.n) || c || '').toUpperCase();
    var l = String((c && (c.l || c.league)) || '').toUpperCase();
    return /\b(U19|UNDER\s*19)\b/.test(n) || l.indexOf('U19') >= 0 || l.indexOf('UNDER 19') >= 0;
  }

  function isU20Club(c) {
    if (!c) return false;
    if (isU23Club(c)) return false;
    var n = String((c && c.n) || c || '').toUpperCase();
    var l = String((c && (c.l || c.league)) || '').toUpperCase();
    return /\b(U20|UNDER\s*20)\b/.test(n) || l.indexOf('U20') >= 0 || l.indexOf('UNDER 20') >= 0;
  }

  function u23ParentName(c) {
    var n = String((c && c.n) || c || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (U23_PARENTS[n]) return U23_PARENTS[n];
    var stripped = n.replace(/\s*(U23|NEXT GEN|UNDER 23|FUTURO)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped && stripped !== n ? stripped : '';
  }

  function findFirstTeam(youthOrU23) {
    if (!youthOrU23) return null;
    var parent = u23ParentName(youthOrU23);
    var n = String((youthOrU23 && youthOrU23.n) || youthOrU23 || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (!parent) {
      parent = n.replace(/\s*(U19|U20|UNDER\s*19|UNDER\s*20|PRIMAVERA|JUNIORES|BERRETTI|ALLIEVI)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (!parent || parent === n) return null;
    var hit = (state.clubs || []).filter(function (c) {
      return c && String(c.n || '').toUpperCase() === parent && !isYouthClub(c) && !isU23Club(c);
    })[0];
    return hit || null;
  }

  function canCallUpFromU23(p, u23) {
    if (!p || !isU23Club(u23)) return false;
    var age = p.age || 16;
    var ovr = Number(p.ovr) || 49;
    if (age > 24) return false;
    var tier = clubLeagueTier(u23);
    if (tier >= 4) return age <= 21 && ovr >= 58;
    if (age <= 21 && ovr >= 56) return true;
    if (age <= 23 && ovr >= 60) return true;
    if (age <= 24 && ovr >= 64) return true;
    return (p.lastForm || 0) >= 3 && age <= 23;
  }

  function makeCallUpOffer(p, u23, used) {
    var first = findFirstTeam(u23);
    if (!first || (used && used[first.n])) return null;
    var out = Object.assign({}, liveClub(first) || first);
    out.isCallUp = true;
    out.isYouth = false;
    out.isLoan = false;
    out.isJumpUp = true;
    out.isU23 = false;
    if (used) used[out.n] = true;
    return out;
  }

  function isBigYouthClub(c) {
    if (!c) return false;
    if (isU23Club(c)) return false;
    if (c.world) return true;
    var n = String(c.n || '').toUpperCase();
    return /JUVENTUS|INTER|MILAN|NAPOLI|ROMA|LAZIO|ATALANTA|FIORENTINA|BARCELONA|REAL MADRID|BAYERN|MANCHESTER|LIVERPOOL|CHELSEA|ARSENAL|PSG|AJAX|BENFICA|PORTO|SPORTING/.test(n);
  }

  function isAcademyProspect(p) {
    return !!(p && p.academyOrigin && (p.age || 16) <= 22);
  }

  function isTopClubOfTier(c, t) {
    if (!c || c.world) return false;
    var n = String(c.n || '').toUpperCase();
    var want = Number(t);
    if (clubLeagueTier(c) !== want) return false;
    if (want === 2) {
      return (
        /PALERMO|PARMA|SAMPDORIA|GENOA|VERONA|BARI|SPEZIA|PISA|BRESCIA|CREMONESE|SALERNITANA|VENEZIA|MONZA|EMPOLI|LECCE|SASSUOLO|FROSINONE|CAGLIARI|TORINO|UDINESE|BOLOGNA|NAPOLI|FIORENTINA/.test(n) ||
        clubPrestige(c) >= 0.86 ||
        (c.catalogT != null && Number(c.catalogT) <= 2)
      );
    }
    if (want === 3) {
      return (
        /PADOVA|VICENZA|AVELLINO|CATANZARO|CESENA|FOGGIA|BENEVENTO|PERUGIA|PESCARA|REGGIANA|COSENZA|SUDTIROL|MANTOVA|ASCOLI|JUVE STABIA|SPEZIA|BARI|PALERMO|PARMA|SALERNITANA|REGGINA/.test(n) ||
        (c.catalogT != null && Number(c.catalogT) <= 2) ||
        clubPrestige(c) >= 0.8
      );
    }
    return isBigYouthClub(c);
  }

  function takeTopOfTier(used, t, p) {
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var age = (p && p.age) || 16;
    var pool = (state.clubs || []).filter(function (c) {
      if (!c || !c.n || used[c.n]) return false;
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== pGender) return false;
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
      if (pGender === 'm' && !isTopClubOfTier(c, t)) return false;
      if (p && !playerFitsClub(p, c, {
        allowYouth: (p.age || 16) <= 19,
        academyPath: isAcademyProspect(p)
      })) return false;
      return true;
    });
    if (!pool.length) return null;
    pool.sort(function (a, b) {
      return clubPrestige(b) - clubPrestige(a);
    });
    var c = takeUniqueClub(used, pool.slice(0, Math.min(8, pool.length)));
    return c ? Object.assign({}, c) : null;
  }

  function failLandingTier(c) {
    var floor = 5;
    if (typeof window !== 'undefined' && window.EliseeClubStoria && window.EliseeClubStoria.profile) {
      floor = Number(window.EliseeClubStoria.profile(c).floor) || 5;
    }
    var dest = 4;
    if (floor >= 5 && Math.random() < 0.38) dest = 5;
    if (dest > floor) dest = floor >= 4 ? 4 : floor;
    if (dest < 4 && isLegalTier(c, 4)) dest = 4;
    else if (dest < 4 && isLegalTier(c, 5)) dest = 5;
    return dest;
  }

  function applyFailLanding(c) {
    if (!c) return false;
    var dest = failLandingTier(c);
    if (!isLegalTier(c, dest)) {
      if (isLegalTier(c, 4)) dest = 4;
      else if (isLegalTier(c, 5)) dest = 5;
      else return false;
    }
    c.t = dest;
    c.l = labelForItalianTier(c, dest);
    c.justPromoted = false;
    c.justRelegated = true;
    return true;
  }

  function repairClubTiers() {
    (state.clubs || []).forEach(function (c) {
      if (c.homeTier == null) c.homeTier = Number(c.t) || clubLeagueTier(c);
      if (c.failed && clubLeagueTier(c) < 4) applyFailLanding(c);
      clampClubToHistory(c);
      if (c.failed && clubLeagueTier(c) < 4) applyFailLanding(c);
    });
  }

  function scrubHistoryFailMarks(p) {
    if (!p || !p.history) return;
    var prev = null;
    p.history.forEach(function (h) {
      if (!h) return;
      if (
        h.failed &&
        prev &&
        prev.failed &&
        String(prev.club || '').toUpperCase() === String(h.club || '').toUpperCase()
      ) {
        h.failed = false;
      }
      prev = h;
    });
  }

  function clubsByTier(t, gender) {
    var want = Number(t);
    var targetG = gender || (state.player && state.player.gender) || state.trialGender || 'm';
    var age = (state.player && state.player.age) || 16;
    return (state.clubs || []).filter(function (c) {
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== targetG) return false;
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
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
      '<p>La carriera si <strong>salva</strong> e può essere vista da club e staff iscritti.</p>' +
      '</div>';
    if (logged) {
      return (
        concept +
        '<label class="es-mg-hub-publish" id="es-mg-hub-publish">' +
        '<input type="checkbox" id="es-mg-publish-check"' +
        (state.publishPublic ? ' checked' : '') +
        ' />' +
        '<span>Rendi <strong>pubblica</strong> la carriera sul mio account.</span>' +
        '</label>'
      );
    }
    return (
      concept +
      '<p class="es-mg-hub-publish-hint">Accedi per salvare la carriera sul tuo account.</p>'
    );
  }

  // ---------- HUB minigiochi (macroarea, 2 card stile EA FC) ----------
  function renderHub() {
    state.step = 'hub';
    state.publishPublic = loadPublishPref();
    hydrateIdentity();
    var savedNow = liveSavedCareer();
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
        '<span class="es-mg-hub-desc">In <strong>Serie D</strong> e <strong>Serie C</strong> sale chi vince il girone. Poi Serie B, Serie A e i top mondiali.</span>' +
        publishBlockHtml() +
        '</div>' +
        '<div class="es-mg-hub-card is-soon" id="es-mg-hub-pokemon" role="button" tabindex="0" aria-label="Pokemon Calcistico, prossimamente">' +
        '<span class="es-mg-hub-soon">Prossimamente</span>' +
        '<span class="es-mg-hub-icon es-mg-hub-icon-pkmn" aria-hidden="true">' +
        '<svg viewBox="0 0 64 64" fill="none">' +
        '<circle cx="32" cy="32" r="22" stroke="#e2e8f0" stroke-width="3"/>' +
        '<path d="M10 32h44" stroke="#e2e8f0" stroke-width="3"/>' +
        '<path d="M10 32a22 22 0 0 1 44 0" fill="rgba(56,189,248,0.35)"/>' +
        '<circle cx="32" cy="32" r="7.5" fill="#0b1220" stroke="#e2e8f0" stroke-width="3"/>' +
        '<circle cx="32" cy="32" r="3.2" fill="#38bdf8"/>' +
        '<path d="M22 18l3 4M42 18l-3 4M18 44l4-2M46 44l-4-2" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</span>' +
        '<span class="es-mg-hub-title">Pokemon Calcistico</span>' +
        '<span class="es-mg-hub-tags">Collezione · Sfide · Evoluzioni in campo</span>' +
        '<span class="es-mg-hub-desc">Nuovo minigioco in lavorazione: creature calcistiche, allenatori e partite.</span>' +
        '<div class="es-mg-hub-concept">' +
        '<p>Lo stiamo creando: <strong>uscirà in futuro</strong> su Elisee Scout.</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="es-mg-hub-playwrap' + (savedNow ? ' is-split' : '') + '">' +
        (savedNow
          ? '<div class="es-mg-hub-playcol">' +
            '<button type="button" class="es-mg-hub-play" id="es-mg-hub-continue">Continua</button>' +
            '<span class="es-mg-hub-continue-meta">' + esc(savedCareerLabel(savedNow)) + '</span>' +
            '</div>' +
            '<div class="es-mg-hub-playcol">' +
            '<button type="button" class="es-mg-hub-play es-mg-hub-play-ghost" id="es-mg-hub-new">Nuova carriera</button>' +
            '</div>'
          : '<div class="es-mg-hub-playcol">' +
            '<button type="button" class="es-mg-hub-play" id="es-mg-hub-play">Gioca</button>' +
            '</div>') +
        '</div>' +
        '<div class="es-mg-confirm-mask" id="es-mg-new-mask" hidden>' +
        '<div class="es-mg-confirm-box" role="dialog" aria-modal="true">' +
        '<p>Vuoi davvero cancellare <strong>' + esc(savedNow ? savedCareerLabel(savedNow) : 'questa carriera') + '</strong>?</p>' +
        '<div class="es-mg-confirm-btns">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-new-no">No</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-new-yes">Sì, nuova carriera</button>' +
        '</div></div></div>' +
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
    function enterNewCareer() {
      activateCareerAgents('avvio simulazione carriera');
      hydrateIdentity();
      loadClubs(function () {
        renderLanding();
      });
    }
    function continueCareer() {
      var saved = liveSavedCareer();
      if (!saved) {
        enterNewCareer();
        return;
      }
      activateCareerAgents('ripresa carriera');
      state.player = saved;
      if (saved.mode) state.mode = saved.mode;
      if (saved.position) state.position = saved.position;
      if (saved.nation) state.nation = saved.nation;
      if (saved.nationCode) state.nationCode = saved.nationCode;
      if (saved.surname) rememberSurname(saved.surname);
      loadClubs(function () {
        renderCareer(false);
      });
    }
    function askNewCareer() {
      if (!liveSavedCareer()) {
        enterNewCareer();
        return;
      }
      var mask = document.getElementById('es-mg-new-mask');
      if (mask) mask.hidden = false;
    }
    var career = document.getElementById('es-mg-hub-career');
    var pkmn = document.getElementById('es-mg-hub-pokemon');
    if (pkmn) {
      var soonMsg = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof window.showToast === 'function') {
          window.showToast('Pokemon Calcistico: prossimamente. Ci stiamo lavorando.', 'info');
        }
      };
      pkmn.onclick = soonMsg;
      pkmn.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') soonMsg(e);
      };
    }
    var play = document.getElementById('es-mg-hub-play');
    var cont = document.getElementById('es-mg-hub-continue');
    var neu = document.getElementById('es-mg-hub-new');
    var noBtn = document.getElementById('es-mg-new-no');
    var yesBtn = document.getElementById('es-mg-new-yes');
    if (career) {
      career.onclick = savedNow ? continueCareer : enterNewCareer;
      career.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (savedNow) continueCareer();
          else enterNewCareer();
        }
      };
    }
    if (play) play.onclick = enterNewCareer;
    if (cont) cont.onclick = continueCareer;
    if (neu) neu.onclick = askNewCareer;
    if (noBtn) {
      noBtn.onclick = function () {
        var mask = document.getElementById('es-mg-new-mask');
        if (mask) mask.hidden = true;
      };
    }
    if (yesBtn) {
      yesBtn.onclick = function () {
        wipeCareerSave();
        hydrateIdentity();
        enterNewCareer();
      };
    }
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
        '</div>' +
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

  function liveSurname() {
    var sn = document.getElementById('es-mg-surname');
    if (sn) return String(sn.value || '').trim();
    return String(state.surname || '').trim();
  }

  function identityReady() {
    return !!(liveSurname().length >= 2 && state.foot && state.nation && state.position);
  }

  function refreshConfirmBtn() {
    var btn = document.getElementById('es-mg-confirm');
    if (!btn) return;
    var ok = identityReady();
    btn.disabled = !ok;
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
    btn.classList.toggle('is-ready', ok);
    btn.title = ok ? 'Avvia la carriera' : 'Completa cognome, piede, nazionalità e ruolo';
  }

  function renderIdentity(focusSel) {
    state.step = 'identity';
    hydrateIdentity();
    var num = state.number || 10;
    var canConfirm = identityReady();
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
        '<div class="es-mg-gender-wrap" style="margin-top:0.75rem;">' +
        '<span class="es-mg-field-lab-txt">TIPO CARRIERA</span>' +
        '<div class="es-mg-gender-btns" role="group" style="display:flex;gap:0.4rem;">' +
        '<button type="button" class="es-mg-gender-toggle es-mg-foot' +
        (state.trialGender !== 'f' ? ' is-on' : '') +
        '" data-gender="m" style="flex:1;">⚽ Maschile</button>' +
        '<button type="button" class="es-mg-gender-toggle es-mg-foot' +
        (state.trialGender === 'f' ? ' is-on is-fem' : '') +
        '" data-gender="f" style="flex:1;">👩 Femminile</button>' +
        '</div>' +
        '<div class="es-mg-gender-sub" style="font-size:0.72rem;color:#94a3b8;margin-top:0.3rem;line-height:1.25;">' +
        (state.trialGender === 'f' ? '🌸 Carriera Femminile: campionati e squadre solo femminili.' : '⚽ Carriera Maschile: campionati e squadre solo maschili.') +
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
      syncIdentityInputs();
      rememberIdentity();
      if (!identityReady()) {
        refreshConfirmBtn();
        return;
      }
      if (!createPlayer()) return;
      loadClubs(function () {
        renderTrial();
      });
    };
    bindIdentityControls(focusSel);
  }

  function maleSymbolSvg(w, h, color) {
    w = w || 18;
    h = h || 18;
    color = color || '#2563eb';
    return '<svg viewBox="0 0 100 100" width="' + w + '" height="' + h + '" style="vertical-align:middle;display:inline-block;flex-shrink:0;" aria-hidden="true"><path fill="' + color + '" d="M58 10 h32 v32 h-10 v-14.94 L58.54 48.52 a28 28 0 1 1 -7.07 -7.07 L72.94 20 H58 V10 z M38 34 a18 18 0 1 0 0 36 a18 18 0 0 0 0 -36 z"/></svg>';
  }

  function femaleSymbolSvg(w, h, color) {
    w = w || 18;
    h = h || 18;
    color = color || '#e11d48';
    return '<svg viewBox="0 0 100 100" width="' + w + '" height="' + h + '" style="vertical-align:middle;display:inline-block;flex-shrink:0;" aria-hidden="true"><path fill="' + color + '" d="M50 10 a28 28 0 0 1 7.07 55.08 V72 h14 v10 H57.07 v12 h-14.14 V82 H28.93 V72 h14 V65.08 A28 28 0 0 1 50 10 z M50 20 a18 18 0 1 0 0 36 a18 18 0 0 0 0 -36 z"/></svg>';
  }

  var MALE_CATEGORIES = [
    { id: 1, name: 'Serie A', sub: '1ª Divisione Professionistica', badge: '1ª DIV', ovr: '76 – 93', logo: 'immagini/squadre-loghi/serie-a.png', color: '#38bdf8' },
    { id: 2, name: 'Serie B', sub: '2ª Divisione Professionistica', badge: '2ª DIV', ovr: '59 – 75', logo: 'immagini/squadre-loghi/serie-b.png', color: '#ef4444' },
    { id: 3, name: 'Serie C', sub: '3ª Divisione Professionistica (Gironi A/B/C)', badge: '3ª DIV', ovr: '43 – 58', logo: 'immagini/squadre-loghi/serie-c.png', color: '#f97316' },
    { id: 4, name: 'Serie D', sub: '4ª Divisione Nazionale LND (9 Gironi)', badge: '4ª DIV', ovr: '30 – 42', logo: 'immagini/squadre-loghi/serie-d.png', color: '#22c55e' },
    { id: 5, name: 'Eccellenza', sub: '5ª Divisione Regionale LND', badge: '5ª DIV', ovr: '24 – 29', logo: 'immagini/squadre-loghi/eccellenza.png', color: '#38bdf8' },
    { id: 6, name: 'Promozione', sub: '6ª Divisione Regionale LND', badge: '6ª DIV', ovr: '19 – 23', logo: 'immagini/squadre-loghi/promozione.png', color: '#a855f7' },
    { id: 7, name: 'Prima Categoria', sub: '7ª Divisione Regionale/Provinciale', badge: '7ª DIV', ovr: '12 – 18', logo: 'immagini/squadre-loghi/prima-categoria.png', color: '#06b6d4' },
    { id: 8, name: 'Seconda Categoria', sub: '8ª Divisione Provinciale', badge: '8ª DIV', ovr: '5 – 11', logo: 'immagini/squadre-loghi/seconda-categoria.png', color: '#64748b' },
    { id: 9, name: 'Terza Categoria', sub: '9ª Divisione Provinciale', badge: '9ª DIV', ovr: '0 – 4', logo: 'immagini/squadre-loghi/terza-categoria.png', color: '#475569' },
    { id: 11, name: 'Primavera 1', sub: 'Campionato Giovanile U19/20 · Vertice Nazionale', badge: 'PRIM 1', ovr: '50 – 68', logo: 'immagini/squadre-loghi/serie-a.png', color: '#facc15', isYouth: true },
    { id: 12, name: 'Primavera 2', sub: 'Campionato Giovanile U19/20 · Gironi A/B', badge: 'PRIM 2', ovr: '40 – 55', logo: 'immagini/squadre-loghi/serie-b.png', color: '#fb923c', isYouth: true }
  ];

  var FEMALE_CATEGORIES = [
    { id: 1, name: 'Serie A Femminile', sub: '1ª Divisione Femminile Professionistica', badge: '1ª DIV', ovr: '76 – 93', logo: 'immagini/squadre-loghi/serie-a-femminile.png', color: '#ec4899' },
    { id: 2, name: 'Serie B Femminile', sub: '2ª Divisione Femminile Nazionale', badge: '2ª DIV', ovr: '59 – 75', logo: 'immagini/squadre-loghi/serie-b-femminile.png', color: '#f43f5e' },
    { id: 3, name: 'Serie C Femminile', sub: '3ª Divisione Femminile (Gironi Nazionali)', badge: '3ª DIV', ovr: '43 – 58', logo: 'immagini/squadre-loghi/serie-c-femminile.png', color: '#fb7185' },
    { id: 5, name: 'Eccellenza Femminile', sub: 'Campionati Regionali Femminili', badge: '4ª DIV', ovr: '24 – 29', logo: 'immagini/squadre-loghi/eccellenza.png', color: '#e879f9' },
    { id: 6, name: 'Promozione Femminile', sub: 'Campionati Territoriali Femminili', badge: '5ª DIV', ovr: '19 – 23', logo: 'immagini/squadre-loghi/promozione.png', color: '#d946ef' },
    { id: 11, name: 'Primavera Femminile', sub: 'Settore Giovanile Femminile U19', badge: 'U19', ovr: '50 – 68', logo: 'immagini/squadre-loghi/serie-a-femminile.png', color: '#c084fc' }
  ];

  function trialChance(club) {
    if (!club) return 0;
    if (club.world) return 0.07;
    if (isU23Club(club)) return 0.44;
    var t = clubLeagueTier(club);
    if (t >= 5) return 0.85;
    if (t === 4) return 0.72;
    if (t === 3) return 0.58;
    if (t === 2) return 0.42;
    if (isBigYouthClub(club)) return 0.25;
    return 0.18;
  }

  function trialCategoryGridHtml() {
    var isFem = state.trialGender === 'f';
    var cats = isFem ? FEMALE_CATEGORIES : MALE_CATEGORIES;
    var counts = {};
    (state.clubs || []).forEach(function (c) {
      if (!c || !c.n || c.isFree || c.world) return;
      var cFem = c.g === 'f' || String(c.l || '').toUpperCase().indexOf('FEMMINILE') >= 0;
      if (isFem !== cFem) return;
      var t = Number(c.t) || clubLeagueTier(c);
      counts[t] = (counts[t] || 0) + 1;
    });

    return (
      '<div class="es-mg-cat-grid">' +
      cats.map(function (cat) {
        var numTeams = counts[cat.id] || (isFem ? 12 : 20);
        var logoImgHtml = cat.logo
          ? '<img src="' + cat.logo + '" alt="' + esc(cat.name) + '" class="es-mg-cat-logo-img" onerror="this.style.display=\'none\';" />'
          : '<span class="es-mg-cat-icon">' + (cat.icon || '⚽') + '</span>';
        return (
          '<button type="button" class="es-mg-cat-card" data-cat="' + cat.id + '" style="--cat-color:' + cat.color + '">' +
          '<div class="es-mg-cat-top">' +
          '<span class="es-mg-cat-icon-wrap">' + logoImgHtml + '</span>' +
          '<span class="es-mg-cat-badge">' + cat.badge + '</span>' +
          '</div>' +
          '<div class="es-mg-cat-name">' + esc(cat.name) + '</div>' +
          '<div class="es-mg-cat-sub">' + esc(cat.sub) + '</div>' +
          '<div class="es-mg-cat-footer">' +
          '<span class="es-mg-cat-ovr">Livello <b>' + cat.ovr + '</b></span>' +
          '<span class="es-mg-cat-teams">' + numTeams + ' squadre</span>' +
          '</div>' +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  /* ---- Mappa immagini delle regioni italiane (da immagini/regioni-svg/) ---- */
  var REGION_IMG_MAP = {
    'Piemonte': 'immagini/regioni-svg/piemonte.png',
    'Valle d\'Aosta': 'immagini/regioni-svg/valle-daosta.png',
    'Lombardia': 'immagini/regioni-svg/lombardia.png',
    'Trentino-A.A.': 'immagini/regioni-svg/trentino-alto-adige.png',
    'Veneto': 'immagini/regioni-svg/veneto.png',
    'Friuli-V.G.': 'immagini/regioni-svg/friuli-venezia-giulia.png',
    'Liguria': 'immagini/regioni-svg/liguria.png',
    'Emilia-Romagna': 'immagini/regioni-svg/emilia-romagna.png',
    'Toscana': 'immagini/regioni-svg/toscana.png',
    'Umbria': 'immagini/regioni-svg/umbria.png',
    'Marche': 'immagini/regioni-svg/marche.png',
    'Lazio': 'immagini/regioni-svg/lazio.png',
    'Abruzzo': 'immagini/regioni-svg/abruzzo.png',
    'Molise': 'immagini/regioni-svg/molise.png',
    'Campania': 'immagini/regioni-svg/campania.png',
    'Puglia': 'immagini/regioni-svg/puglia.png',
    'Basilicata': 'immagini/regioni-svg/basilicata.png',
    'Calabria': 'immagini/regioni-svg/calabria.png',
    'Sicilia': 'immagini/regioni-svg/sicilia.png',
    'Sardegna': 'immagini/regioni-svg/sardegna.png'
  };

  /* ---- SVG/IMG icons per le regioni italiane ---- */
  function regionSvgIcon(regionName, color) {
    var imgSrc = REGION_IMG_MAP[regionName];
    if (imgSrc) {
      return '<img src="' + imgSrc + '" alt="' + esc(regionName) + '" class="es-mg-region-img" onerror="this.style.display=\'none\'" />';
    }
    var c = color || '#38bdf8';
    return '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="' + c + '" opacity="0.3"/><circle cx="16" cy="16" r="5" fill="' + c + '"/></svg>';
  }

  /* SVG per le lettere dei gironi (A-I) */
  function gironeSvgIcon(letter, color) {
    var c = color || '#38bdf8';
    return '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="16" cy="16" r="13" fill="' + c + '" opacity="0.15"/>' +
      '<circle cx="16" cy="16" r="10" stroke="' + c + '" stroke-width="1.5" fill="none" opacity="0.5"/>' +
      '<line x1="16" y1="3" x2="16" y2="6" stroke="' + c + '" stroke-width="2" opacity="0.7"/>' +
      '<line x1="16" y1="26" x2="16" y2="29" stroke="' + c + '" stroke-width="2" opacity="0.7"/>' +
      '<line x1="3" y1="16" x2="6" y2="16" stroke="' + c + '" stroke-width="2" opacity="0.7"/>' +
      '<line x1="26" y1="16" x2="29" y2="16" stroke="' + c + '" stroke-width="2" opacity="0.7"/>' +
      '<text x="16" y="21" text-anchor="middle" font-size="12" font-weight="bold" font-family="Arial,sans-serif" fill="' + c + '">' + (letter || 'G') + '</text>' +
      '</svg>';
  }

  /* ---- Mappa regioni italiane (per Eccellenza e categorie regionali) ---- */
  var IT_REGIONS = [
    { n: 'Piemonte',           e: 'Piemonte',       col: '#22c55e', k: ['PIEMONTE'] },
    { n: 'Valle d\'Aosta',      e: 'Valle d\'Aosta', col: '#16a34a', k: ['VALLE'] },
    { n: 'Lombardia',          e: 'Lombardia',      col: '#2563eb', k: ['LOMBARDIA'] },
    { n: 'Trentino-A.A.',      e: 'Trentino-A.A.', col: '#0891b2', k: ['TRENTINO','ALTO ADIGE','TRENTINO-ALTO ADIGE','VDA'] },
    { n: 'Veneto',             e: 'Veneto',         col: '#0284c7', k: ['VENETO'] },
    { n: 'Friuli-V.G.',        e: 'Friuli-V.G.',    col: '#0ea5e9', k: ['FRIULI','FRIULI-VENEZIA'] },
    { n: 'Liguria',            e: 'Liguria',        col: '#06b6d4', k: ['LIGURIA'] },
    { n: 'Emilia-Romagna',     e: 'Emilia-Romagna', col: '#f97316', k: ['EMILIA','EMILIA-ROMAGNA','ROMAGNA'] },
    { n: 'Toscana',            e: 'Toscana',        col: '#16a34a', k: ['TOSCANA'] },
    { n: 'Umbria',             e: 'Umbria',         col: '#65a30d', k: ['UMBRIA'] },
    { n: 'Marche',             e: 'Marche',         col: '#84cc16', k: ['MARCHE'] },
    { n: 'Lazio',              e: 'Lazio',          col: '#eab308', k: ['LAZIO'] },
    { n: 'Abruzzo',            e: 'Abruzzo',        col: '#f59e0b', k: ['ABRUZZO'] },
    { n: 'Molise',             e: 'Molise',         col: '#d97706', k: ['MOLISE'] },
    { n: 'Campania',           e: 'Campania',       col: '#ef4444', k: ['CAMPANIA'] },
    { n: 'Puglia',             e: 'Puglia',         col: '#dc2626', k: ['PUGLIA'] },
    { n: 'Basilicata',         e: 'Basilicata',     col: '#c2410c', k: ['BASILICATA'] },
    { n: 'Calabria',           e: 'Calabria',       col: '#b91c1c', k: ['CALABRIA'] },
    { n: 'Sicilia',            e: 'Sicilia',        col: '#f97316', k: ['SICILIA'] },
    { n: 'Sardegna',           e: 'Sardegna',       col: '#7c3aed', k: ['SARDEGNA'] }
  ];

  /* Estrae la chiave regione da c.l (es. "Eccellenza · PUGLIA · Girone A" → "PUGLIA") */
  function clubRegionKey(c) {
    var l = String(c.l || '').toUpperCase();
    /* rimuovi prefisso categoria */
    l = l.replace(/^(ECCELLENZA|PROMOZIONE|PRIMA CATEGORIA|SECONDA CATEGORIA|TERZA CATEGORIA)[\s·.\-]*/i, '');
    /* prendi la prima parola significativa */
    var parts = l.split(/[·.\-,/\s]+/);
    /* cerca match nelle keys delle regioni */
    for (var ri = 0; ri < IT_REGIONS.length; ri++) {
      for (var ki = 0; ki < IT_REGIONS[ri].k.length; ki++) {
        var kw = IT_REGIONS[ri].k[ki].toUpperCase();
        if (l.indexOf(kw) >= 0) return IT_REGIONS[ri].n;
      }
    }
    /* fallback: usa la prima parola */
    return parts[0] || 'Altro';
  }

  /* Tier regionali: tier >= 5 */
  function isRegionalTier(tid) { return tid != null && Number(tid) >= 5; }

  /* Estrae il girone da c.l (es. "SERIE C · GIRONE A" o "Serie C - Gir. A" -> "A") */
  function clubGironeKey(c) {
    if (!c) return null;
    var l = String(c.l || '').toUpperCase();
    var gm = l.match(/GIRONE\s+([A-Z])/i) || l.match(/GIR\.?\s*([A-Z])/i);
    if (gm) return gm[1].toUpperCase();
    return null;
  }

  /* Ritorna la lista dei gironi per una categoria (es. ['A', 'B', 'C'] per Serie C) */
  function categoryGironiList(catId, isFem) {
    if (catId == null) return [];
    var gMap = {};
    (state.clubs || []).forEach(function (c) {
      if (!c || !c.n || c.isFree || c.world) return;
      var cFem = c.g === 'f' || String(c.l || '').toUpperCase().indexOf('FEMMINILE') >= 0;
      if (isFem !== cFem) return;
      var t = Number(c.t) || clubLeagueTier(c);
      if (t !== catId) return;
      var g = clubGironeKey(c);
      if (g) gMap[g] = (gMap[g] || 0) + 1;
    });
    var keys = Object.keys(gMap).sort();
    return keys.map(function (k) {
      return { g: k, count: gMap[k] };
    });
  }

  /* Determina se una categoria usa gironi (es. Serie C con 3 gironi, Serie D con 9 gironi) */
  function isGironeTier(catId, isFem) {
    if (catId == null) return false;
    if (isRegionalTier(catId)) return false;
    var list = categoryGironiList(catId, isFem);
    return list.length >= 2;
  }

  function trialGironeGridHtml() {
    var isFem = state.trialGender === 'f';
    var catId = state.trialCategory;
    var gironi = categoryGironiList(catId, isFem);

    var SERIE_C_META = {
      'A': { desc: 'Nord · Nord-Ovest', color: '#38bdf8', icon: '⚡' },
      'B': { desc: 'Centro · Adriatico', color: '#a855f7', icon: '🔥' },
      'C': { desc: 'Sud · Isole', color: '#f97316', icon: '☀️' }
    };

    var SERIE_D_META = {
      'A': { desc: 'Piemonte, Liguria, VDA & Lombardia', color: '#38bdf8', icon: '⚡' },
      'B': { desc: 'Lombardia & Veneto', color: '#a855f7', icon: '🔥' },
      'C': { desc: 'Veneto, Friuli-V.G. & Trentino-A.A.', color: '#06b6d4', icon: '🏰' },
      'D': { desc: 'Emilia-Romagna, Toscana & Lombardia', color: '#22c55e', icon: '🌲' },
      'E': { desc: 'Toscana, Umbria & Lazio', color: '#84cc16', icon: '🌿' },
      'F': { desc: 'Marche, Abruzzo, Molise & Lazio', color: '#eab308', icon: '🌾' },
      'G': { desc: 'Lazio, Sardegna & Campania', color: '#ec4899', icon: '🏝️' },
      'H': { desc: 'Puglia, Basilicata & Campania', color: '#ef4444', icon: '🌋' },
      'I': { desc: 'Calabria, Sicilia & Campania', color: '#f97316', icon: '☀️' }
    };

    var metaSource = catId === 4 ? SERIE_D_META : SERIE_C_META;

    if (!gironi.length) {
      return '<div class="es-mg-muted" style="padding:1rem;color:#94a3b8;text-align:center;">Nessun girone disponibile in questa categoria.</div>';
    }

    return (
      '<div class="es-mg-girone-grid">' +
      gironi.map(function (item) {
        var g = item.g;
        var n = item.count;
        var meta = metaSource[g] || { desc: 'Girone ' + g, color: '#38bdf8', icon: '⚽' };
        return (
          '<button type="button" class="es-mg-girone-card" data-girone="' + esc(g) + '" style="--gir-color:' + meta.color + '">' +
          '<div class="es-mg-girone-top">' +
          '<span class="es-mg-girone-badge">GIRONE ' + esc(g) + '</span>' +
          '<span class="es-mg-girone-icon">' + gironeSvgIcon(g, meta.color) + '</span>' +
          '</div>' +
          '<div class="es-mg-girone-desc">' + esc(meta.desc) + '</div>' +
          '<div class="es-mg-girone-footer">' +
          '<span class="es-mg-girone-count">' + n + ' squadr' + (n === 1 ? 'a' : 'e') + '</span>' +
          '<span class="es-mg-girone-arrow">Vedi squadre →</span>' +
          '</div>' +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function trialRegionGridHtml() {
    var isFem = state.trialGender === 'f';
    var catId = state.trialCategory;
    /* conta club per regione */
    var counts = {};
    var gironiMap = {}; // regione → Set gironi
    (state.clubs || []).forEach(function(c) {
      if (!c || !c.n || c.isFree || c.world) return;
      var cFem = c.g === 'f' || String(c.l || '').toUpperCase().indexOf('FEMMINILE') >= 0;
      if (isFem !== cFem) return;
      var t = Number(c.t) || clubLeagueTier(c);
      if (t !== catId) return;
      var rk = clubRegionKey(c);
      counts[rk] = (counts[rk] || 0) + 1;
      /* estrai girone se presente */
      var gm = String(c.l || '').match(/GIRONE\s+([A-Z])/i);
      if (gm) {
        if (!gironiMap[rk]) gironiMap[rk] = {};
        gironiMap[rk][gm[1].toUpperCase()] = true;
      }
    });

    /* ordina regioni per conteggio desc */
    var regions = IT_REGIONS.filter(function(r) { return counts[r.n] > 0; });
    /* aggiungi eventuali regioni non mappate */
    Object.keys(counts).forEach(function(k) {
      if (!regions.some(function(r) { return r.n === k; })) {
        regions.push({ n: k, e: '📍', col: '#64748b', k: [] });
      }
    });
    /* ordina regioni in ordine alfabetico A-Z */
    regions.sort(function(a, b) { return String(a.n).localeCompare(String(b.n), 'it'); });

    if (!regions.length) return '<div class="es-mg-muted" style="padding:1rem;color:#94a3b8;text-align:center;">Nessuna squadra in questa categoria.</div>';

    return '<div class="es-mg-region-grid">' +
      regions.map(function(r) {
        var n = counts[r.n] || 0;
        var gKeys = gironiMap[r.n] ? Object.keys(gironiMap[r.n]).sort() : [];
        var girStr = gKeys.length ? 'Gironi: ' + gKeys.join(', ') : '';
        return '<button type="button" class="es-mg-region-card" data-region="' + esc(r.n) + '" style="--rc-color:' + r.col + '">' +
          '<div class="es-mg-region-flag">' + regionSvgIcon(r.n, r.col) + '</div>' +
          '<div class="es-mg-region-name">' + esc(r.n) + '</div>' +
          '<div class="es-mg-region-count">' + n + ' squadr' + (n === 1 ? 'a' : 'e') + '</div>' +
          (girStr ? '<div class="es-mg-region-gironi">' + esc(girStr) + '</div>' : '') +
          '</button>';
      }).join('') +
      '</div>';
  }

  function trialClubListHtml() {
    var q = String(state.trialFilter || '').toLowerCase().trim();
    var isFem = state.trialGender === 'f';
    var catId = state.trialCategory;

    var list = (state.clubs || []).filter(function (c) {
      if (!c || !c.n || c.isFree || c.world) return false;
      var cFem = c.g === 'f' || String(c.l || '').toUpperCase().indexOf('FEMMINILE') >= 0;
      if (isFem !== cFem) return false;
      var t = Number(c.t) || clubLeagueTier(c);
      if (catId != null && t !== catId) return false;
      /* filtro girone */
      if (isGironeTier(catId, isFem) && state.trialGirone) {
        if (clubGironeKey(c) !== state.trialGirone) return false;
      }
      /* filtro regione: solo per tier regionali */
      if (isRegionalTier(catId) && state.trialRegion) {
        if (clubRegionKey(c) !== state.trialRegion) return false;
      }
      if (!q) return true;
      var hay = (c.n + ' ' + (c.l || '') + ' ' + (c.city || '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });

    list.sort(function (a, b) {
      return String(a.n).localeCompare(String(b.n), 'it');
    });

    /* Dedup per nome: previene duplicati visivi se state.clubs contiene voci ripetute */
    var seen = {};
    list = list.filter(function (c) {
      var key = String(c.n).toUpperCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });

    if (!list.length) return '<div class="es-mg-muted" style="padding:1.5rem;text-align:center;color:#94a3b8;">Nessuna squadra trovata per i criteri selezionati.</div>';

    return list.slice(0, 500).map(function (c) {
      var on = state.trialClub && state.trialClub.n === c.n ? ' is-on' : '';
      var city = c.city ? '<span class="es-mg-trial-city">' + esc(c.city) + '</span>' : '';
      return (
        '<button type="button" class="es-mg-trial-club' + on + '" data-club="' + esc(c.n) + '">' +
        (c.o ? '<img src="' + esc(c.o) + '" alt="" class="es-mg-trial-logo" onerror="this.style.display=\'none\'">' : '<span class="es-mg-trial-logo"></span>') +
        '<span class="es-mg-trial-txt">' +
        '<span class="es-mg-trial-name">' + esc(c.n) + '</span>' +
        '<span class="es-mg-trial-lg">' + esc(shortLeague(c.l, c.n) || c.l || '') + '</span>' +
        city +
        '</span></button>'
      );
    }).join('');
  }

  function renderTrial() {
    state.step = 'trial';
    if (!state.clubs || !state.clubs.length) {
      loadClubs(function () {
        renderTrial();
      });
      return;
    }
    var picked = state.trialClub;
    var result = state.trialResult;
    var isFem = state.trialGender === 'f';
    var catId = state.trialCategory;
    var cats = isFem ? FEMALE_CATEGORIES : MALE_CATEGORIES;
    var currentCatObj = cats.filter(function (c) { return c.id === catId; })[0];

    var body;
    if (result) {
      var ok = !!result.ok;
      body =
        '<div class="es-mg-trial-result ' + (ok ? 'is-ok' : 'is-bad') + '">' +
        (result.club && result.club.o
          ? '<img src="' + esc(result.club.o) + '" alt="" class="es-mg-trial-result-logo">'
          : '') +
        '<h3>' + (ok ? '🎉 Provino superato!' : '❌ Provino non superato') + '</h3>' +
        '<p>' + (ok
          ? ('<strong>' + esc(result.club.n) + '</strong> ti prende dopo ' + result.weeks + ' settiman' + (result.weeks === 1 ? 'a' : 'e') + ' di provino! Inizierai la carriera con questa squadra.')
          : ('<strong>' + esc(result.club.n) + '</strong> non ti ha tesserato. Puoi scegliere un\'altra squadra/categoria oppure procedere con le tre offerte da svincolato.')) +
        '</p>' +
        '<div class="es-mg-trial-actions" style="justify-content:center;">' +
        (ok
          ? '<button type="button" class="es-mg-btn-full primary" id="es-mg-trial-go">Inizia la carriera</button>'
          : '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-retry">Scegli altra squadra</button>' +
            '<button type="button" class="es-mg-btn-half primary" id="es-mg-trial-go">Vedi le offerte</button>') +
        '</div></div>';
    } else if (catId == null) {
      /* FASE 1: Selezione Genere e Categoria */
      body =
        '<div class="es-mg-gender-tabs">' +
        '<button type="button" class="es-mg-gender-tab' + (!isFem ? ' is-on' : '') + '" data-gender="m">' + maleSymbolSvg(18, 18, !isFem ? '#041019' : '#2563eb') + ' Calcio Maschile (9 Categorie)</button>' +
        '<button type="button" class="es-mg-gender-tab is-fem' + (isFem ? ' is-on' : '') + '" data-gender="f">' + femaleSymbolSvg(18, 18, isFem ? '#ffffff' : '#e11d48') + ' Calcio Femminile (6 Categorie)</button>' +
        '</div>' +
        trialCategoryGridHtml() +
        '<div class="es-mg-trial-actions" style="margin-top:1rem;">' +
        '<button type="button" class="es-mg-btn-full ghost" id="es-mg-trial-skip">Salta provino, vai alle offerte</button>' +
        '</div>';
    } else if (isGironeTier(catId, isFem) && !state.trialGirone) {
      /* FASE 1.5A: Selezione Girone (es. Serie C con Gironi A, B, C o Serie D con 9 gironi) */
      var catLogoGirone = currentCatObj && currentCatObj.logo
        ? '<img src="' + currentCatObj.logo + '" class="es-mg-cat-logo-img" alt="" />'
        : (currentCatObj ? currentCatObj.icon : '⚽');
      var gironiCount = categoryGironiList(catId, isFem).length;
      body =
        '<div class="es-mg-cat-selected-bar">' +
        '<div class="es-mg-cat-selected-info">' +
        '<span class="es-mg-cat-selected-icon">' + catLogoGirone + '</span>' +
        '<div>' +
        '<div class="es-mg-cat-selected-name">' + esc(currentCatObj ? currentCatObj.name : 'Categoria') + '</div>' +
        '<div class="es-mg-cat-selected-ovr">Scegli il girone (' + gironiCount + ' gironi disponibili)</div>' +
        '</div></div>' +
        '<button type="button" class="es-mg-btn-change-cat" id="es-mg-trial-back-cat">← Categorie</button>' +
        '</div>' +
        trialGironeGridHtml() +
        '<div class="es-mg-trial-actions" style="margin-top:0.75rem;">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-back-cat2">← Categorie</button>' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-skip">Salta alle offerte</button>' +
        '</div>';
    } else if (isRegionalTier(catId) && !state.trialRegion) {
      /* FASE 1.5B: Selezione Regione (solo per Eccellenza / categorie regionali) */
      var catLogoRegion = currentCatObj && currentCatObj.logo
        ? '<img src="' + currentCatObj.logo + '" class="es-mg-cat-logo-img" alt="" />'
        : (currentCatObj ? currentCatObj.icon : '⚽');
      body =
        '<div class="es-mg-cat-selected-bar">' +
        '<div class="es-mg-cat-selected-info">' +
        '<span class="es-mg-cat-selected-icon">' + catLogoRegion + '</span>' +
        '<div>' +
        '<div class="es-mg-cat-selected-name">' + esc(currentCatObj ? currentCatObj.name : 'Categoria') + '</div>' +
        '<div class="es-mg-cat-selected-ovr">Scegli la regione</div>' +
        '</div></div>' +
        '<button type="button" class="es-mg-btn-change-cat" id="es-mg-trial-back-cat">← Categorie</button>' +
        '</div>' +
        trialRegionGridHtml() +
        '<div class="es-mg-trial-actions" style="margin-top:0.75rem;">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-back-cat2">← Categorie</button>' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-skip">Salta alle offerte</button>' +
        '</div>';
    } else {
      /* FASE 2: Selezione Squadra nella Categoria/Girone Scelto */
      var catLogoHeader = currentCatObj && currentCatObj.logo
        ? '<img src="' + currentCatObj.logo + '" class="es-mg-cat-logo-img" alt="" />'
        : (currentCatObj ? currentCatObj.icon : '⚽');
      
      var girLabel = (isGironeTier(catId, isFem) && state.trialGirone) ? ' · Girone ' + esc(state.trialGirone) : '';
      var regLabel = (isRegionalTier(catId) && state.trialRegion) ? ' · ' + esc(state.trialRegion) : '';
      var catFullName = esc(currentCatObj ? currentCatObj.name : 'Categoria') + girLabel + regLabel;

      var subLabel = (isRegionalTier(catId) && state.trialRegion)
        ? esc(state.trialRegion)
        : (state.trialGirone
          ? 'Girone ' + esc(state.trialGirone) + ' · Overall: ' + esc(currentCatObj ? currentCatObj.ovr : '')
          : 'Overall categoria: ' + esc(currentCatObj ? currentCatObj.ovr : ''));

      var backBtnLabel = (isGironeTier(catId, isFem) && state.trialGirone)
        ? '← Gironi'
        : (isRegionalTier(catId) && state.trialRegion ? '← Regioni' : '← Categorie');

      body =
        '<div class="es-mg-cat-selected-bar">' +
        '<div class="es-mg-cat-selected-info">' +
        '<span class="es-mg-cat-selected-icon">' + catLogoHeader + '</span>' +
        '<div>' +
        '<div class="es-mg-cat-selected-name">' + catFullName + '</div>' +
        '<div class="es-mg-cat-selected-ovr">' + subLabel + '</div>' +
        '</div></div>' +
        '<div style="display:flex;gap:0.4rem;">' +
        (isGironeTier(catId, isFem) && state.trialGirone
          ? '<button type="button" class="es-mg-btn-change-cat" id="es-mg-trial-back-girone">← Gironi</button>'
          : '') +
        (isRegionalTier(catId) && state.trialRegion
          ? '<button type="button" class="es-mg-btn-change-cat" id="es-mg-trial-back-region">← Regioni</button>'
          : '') +
        '<button type="button" class="es-mg-btn-change-cat" id="es-mg-trial-back-cat">← Categorie</button>' +
        '</div>' +
        '</div>' +
        '<div class="es-mg-search-wrap">' +
        '<input type="search" class="es-mg-search" id="es-mg-trial-q" placeholder="Cerca squadra in ' + catFullName + ', città..." value="' +
        esc(state.trialFilter || '') +
        '" /></div>' +
        '<div class="es-mg-trial-list" id="es-mg-trial-list">' + trialClubListHtml() + '</div>' +
        '<div class="es-mg-trial-actions">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-back-cat2">' + backBtnLabel + '</button>' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-trial-skip">Salta alle offerte</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-trial-run"' +
        (picked ? '' : ' disabled') +
        '>Fai il provino' + (picked ? ' a ' + esc(picked.n) : '') + '</button>' +
        '</div>';
    }

    var leadText = catId == null
      ? 'Seleziona se competere nel Calcio Maschile o Femminile, quindi scegli la categoria di partenza per sostenere il tuo provino.'
      : (isGironeTier(catId, isFem) && !state.trialGirone
        ? 'Scegli il girone desiderato di ' + esc(currentCatObj ? currentCatObj.name : 'campionato') + ' per visualizzare l\'elenco delle squadre partecipanti.'
        : (isRegionalTier(catId) && !state.trialRegion
          ? 'Scegli la regione di competenza per visualizzare le squadre disponibili.'
          : 'Scegli la squadra in cui vuoi sostenere 1 o 2 settimane di provino. Se superi il provino, la tua carriera inizierà da qui!'));

    var pageTitle = catId == null
      ? 'Provino · Scegli la Categoria'
      : (isGironeTier(catId, isFem) && !state.trialGirone
        ? ('Provino · ' + esc(currentCatObj ? currentCatObj.name : 'Campionato') + ' · Gironi')
        : (isGironeTier(catId, isFem) && state.trialGirone
          ? ('Provino · ' + esc(currentCatObj ? currentCatObj.name : 'Campionato') + ' · Girone ' + esc(state.trialGirone))
          : (isRegionalTier(catId) && !state.trialRegion
            ? ('Provino · ' + esc(currentCatObj ? currentCatObj.name : 'Categoria') + ' · Regioni')
            : (isRegionalTier(catId) && state.trialRegion
              ? ('Provino · ' + esc(currentCatObj ? currentCatObj.name : 'Categoria') + ' · ' + esc(state.trialRegion))
              : ('Provino · ' + esc(currentCatObj ? currentCatObj.name : 'Squadre'))))));

    openShell(
      topBar() +
        '<div class="es-mg-trial">' +
        '<h2 class="es-mg-identity-title">' + pageTitle + '</h2>' +
        '<p class="es-mg-trial-lead">' + leadText + '</p>' +
        body +
        '</div>'
    );
    bindClose();

    // 1. Switch genere
    root.querySelectorAll('.es-mg-gender-tab').forEach(function (btn) {
      btn.onclick = function () {
        var g = btn.getAttribute('data-gender') || 'm';
        state.trialGender = g;
        state.gender = g;
        state.trialCategory = null;
        state.trialGirone = null;
        state.trialRegion = null;
        state.trialClub = null;
        state.trialFilter = '';
        rememberIdentity();
        renderTrial();
      };
    });

    // 2. Click categoria
    root.querySelectorAll('.es-mg-cat-card').forEach(function (btn) {
      btn.onclick = function () {
        var cid = parseInt(btn.getAttribute('data-cat'), 10);
        state.trialCategory = cid;
        state.trialGirone = null;
        state.trialRegion = null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    });

    // 3. Torna a categorie
    var backCat = document.getElementById('es-mg-trial-back-cat');
    if (backCat) {
      backCat.onclick = function () {
        state.trialCategory = null;
        state.trialGirone = null;
        state.trialRegion = null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    }
    var backCat2 = document.getElementById('es-mg-trial-back-cat2');
    if (backCat2) {
      backCat2.onclick = function () {
        if (isGironeTier(state.trialCategory, state.trialGender === 'f') && state.trialGirone) {
          state.trialGirone = null;
          state.trialClub = null;
          state.trialFilter = '';
        } else if (isRegionalTier(state.trialCategory) && state.trialRegion) {
          state.trialRegion = null;
          state.trialClub = null;
          state.trialFilter = '';
        } else {
          state.trialCategory = null;
          state.trialGirone = null;
          state.trialRegion = null;
          state.trialClub = null;
          state.trialFilter = '';
        }
        renderTrial();
      };
    }
    var backGirone = document.getElementById('es-mg-trial-back-girone');
    if (backGirone) {
      backGirone.onclick = function () {
        state.trialGirone = null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    }
    var backRegion = document.getElementById('es-mg-trial-back-region');
    if (backRegion) {
      backRegion.onclick = function () {
        state.trialRegion = null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    }

    // 3b. Click girone
    root.querySelectorAll('.es-mg-girone-card').forEach(function (btn) {
      btn.onclick = function () {
        state.trialGirone = btn.getAttribute('data-girone') || null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    });

    // 3c. Click regione
    root.querySelectorAll('.es-mg-region-card').forEach(function (btn) {
      btn.onclick = function () {
        state.trialRegion = btn.getAttribute('data-region') || null;
        state.trialClub = null;
        state.trialFilter = '';
        renderTrial();
      };
    });

    // 4. Ricerca squadra
    var q = document.getElementById('es-mg-trial-q');
    if (q) {
      q.oninput = function () {
        state.trialFilter = q.value;
        var list = document.getElementById('es-mg-trial-list');
        if (list) list.innerHTML = trialClubListHtml();
        bindTrialClubs();
      };
    }

    // 5. Click squadra
    function bindTrialClubs() {
      root.querySelectorAll('.es-mg-trial-club').forEach(function (btn) {
        btn.onclick = function () {
          var name = btn.getAttribute('data-club');
          var found = (state.clubs || []).filter(function (c) {
            return c && c.n === name;
          })[0];
          state.trialClub = found ? Object.assign({}, found) : null;
          renderTrial();
        };
      });
    }
    bindTrialClubs();

    // 6. Salta alle offerte da svincolato
    var skip = document.getElementById('es-mg-trial-skip');
    if (skip) {
      skip.onclick = function () {
        state.trialClub = null;
        state.trialResult = null;
        state.trialCategory = null;
        state.trialGirone = null;
        state.trialRegion = null;
        renderCareer(false);
      };
    }

    // 7. Riprova da esito provino
    var retry = document.getElementById('es-mg-trial-retry');
    if (retry) {
      retry.onclick = function () {
        state.trialResult = null;
        state.trialClub = null;
        renderTrial();
      };
    }

    // 8. Esegui provino
    var run = document.getElementById('es-mg-trial-run');
    if (run) {
      run.onclick = function () {
        if (!state.trialClub) return;
        var weeks = Math.random() < 0.55 ? 1 : 2;
        var ok = Math.random() < trialChance(state.trialClub);
        state.trialResult = { club: state.trialClub, weeks: weeks, ok: ok };
        renderTrial();
      };
    }

    // 9. Procedi a inizio carriera
    var go = document.getElementById('es-mg-trial-go');
    if (go) {
      go.onclick = function () {
        var res = state.trialResult;
        var club = res && res.club;
        state.trialResult = null;
        state.trialClub = null;
        state.trialCategory = null;
        state.trialGirone = null;
        state.trialRegion = null;
        if (res && res.ok && club && state.player) {
          club = Object.assign({}, club);
          club.isLoan = false;
          var tier = clubLeagueTier(club);
          var r = CATEGORY_OVR_RANGES[tier] || CATEGORY_OVR_RANGES[4];
          state.player.ovr = Math.min(r.max, Math.max(r.min, Math.round(r.min + (r.max - r.min) * 0.45)));
          if (clubLeagueTier(club) === 1 && isBigYouthClub(club) && !isU23Club(club) && (state.player.ovr || 49) < 60) {
            club.isYouth = true;
          }
          seasonSim(state.player, club);
          save(LS.career, state.player);
          renderCareer(true);
          return;
        }
        if (state.player) state.player.trialFailed = res && res.club ? res.club.n : '';
        renderCareer(false);
      };
    }
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
      sn.oninput = function () {
        paintJersey();
        state.surname = String(sn.value || '').trim();
        rememberSurname(state.surname);
        refreshConfirmBtn();
      };
      sn.onblur = function () {
        state.surname = String(sn.value || '').trim();
        rememberSurname(state.surname);
        refreshConfirmBtn();
      };
    }
    if (nu) {
      nu.oninput = function () {
        paintJersey();
        var n = parseInt(nu.value, 10);
        if (!isNaN(n)) state.number = Math.min(99, Math.max(1, n));
      };
    }
    root.querySelectorAll('.es-mg-foot:not(.es-mg-gender-toggle)').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.foot = btn.getAttribute('data-foot') || 'right';
        rememberIdentity();
        renderIdentity('#es-mg-surname');
      };
    });
    root.querySelectorAll('.es-mg-gender-toggle').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.trialGender = btn.getAttribute('data-gender') || 'm';
        state.gender = state.trialGender;
        state.trialCategory = null;
        state.trialClub = null;
        rememberIdentity();
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
        rememberIdentity();
        renderIdentity();
      };
    });
    root.querySelectorAll('.es-mg-pos-btn').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.position = btn.getAttribute('data-pos');
        rememberIdentity();
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
      if (!identityReady()) {
        renderIdentity('#es-mg-surname');
        return;
      }
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
    if (isYouthClub(club)) {
      var yt = Number(club && (club.catalogT != null ? club.catalogT : club.t));
      if (yt === 11 || yt === 12) return yt;
      var ylg = String((club && (club.l || club.league)) || '').toUpperCase();
      if (ylg.indexOf('PRIMAVERA 2') >= 0) return 12;
      return 11;
    }
    var league = String((club && (club.l || club.league)) || '').toUpperCase();
    if (league.indexOf('TERZA CATEGORIA') >= 0) return 9;
    if (league.indexOf('SECONDA CATEGORIA') >= 0) return 8;
    if (league.indexOf('PRIMA CATEGORIA') >= 0) return 7;
    if (league.indexOf('PROMOZIONE') >= 0) return 6;
    if (league.indexOf('ECCELLENZA') >= 0) return 5;
    if (league.indexOf('SERIE D') >= 0) return 4;
    if (league.indexOf('SERIE C') >= 0) return 3;
    if (league.indexOf('SERIE B') >= 0) return 2;
    if (league.indexOf('SERIE A') >= 0) return 1;
    if (/PREMIER LEAGUE|LA LIGA|BUNDESLIGA|LIGUE 1|PRIMEIRA LIGA|EREDIVISIE|BRASILEIRAO|LIGA ARGENTINA|LIGA MX/.test(league)) return 1;
    if (/CHAMPIONSHIP|SEGUNDA|LIGUE 2|2\.\s*BUNDESLIGA/.test(league)) return 2;
    return (club && club.t) ? Number(club.t) : 4;
  }

  function findLiveClub(name) {
    var key = String(name || '').toUpperCase();
    if (!key) return null;
    var hit = null;
    (state.clubs || []).some(function (c) {
      if (String(c.n || '').toUpperCase() === key) {
        hit = c;
        return true;
      }
      return false;
    });
    return hit;
  }

  function leagueTrophyWonTier(keys) {
    var list = keys || [];
    function has(k) { return list.indexOf(k) >= 0; }
    if (has('terza_categoria')) return 9;
    if (has('seconda_categoria')) return 8;
    if (has('prima_categoria')) return 7;
    if (has('promozione') || has('promozione_femminile')) return 6;
    if (has('eccellenza') || has('eccellenza_femminile')) return 5;
    if (has('serie_d')) return 4;
    if (has('serie_c') || has('serie_c_a') || has('serie_c_b') || has('serie_c_c') || has('serie_c_femminile')) return 3;
    if (has('serie_b') || has('serie_b_femminile')) return 2;
    if (has('primavera2_promozione')) return 12;
    return 0;
  }

  function applyChampionPromotion(club, trophyKeys) {
    if (!club || club.isFree || club.n === 'Svincolato' || club.world) return false;
    var wonT = leagueTrophyWonTier(trophyKeys);
    if (!(wonT > 1)) return false;
    var toTier = wonT === 12 ? 11 : wonT - 1;
    if (toTier < 1) return false;
    if (isU23Club(club) && toTier < 2) return false;
    var live = findLiveClub(club.n);
    var target = live || club;
    var fromT = Number(target.t) || clubLeagueTier(target) || wonT;
    if (target.justPromoted && Number(target.t) === toTier) {
      target.championPromoted = true;
      if (target.earnedCeil == null || toTier < Number(target.earnedCeil)) target.earnedCeil = toTier;
    } else {
      target.t = toTier;
      if (wonT === 12) target.l = 'PRIMAVERA 1';
      else if (isItalianPyramid(target) || /SERIE|ECCELLENZA|PROMOZIONE|CATEGORIA/i.test(String(target.l || ''))) {
        target.l = labelForItalianTier(target, toTier);
      }
      target.justPromoted = true;
      target.justRelegated = false;
      target.justFailed = false;
      target.failed = false;
      target.championPromoted = true;
      target.promotedFromTier = fromT;
      if (target.earnedCeil == null || toTier < Number(target.earnedCeil)) target.earnedCeil = toTier;
    }
    club.t = target.t;
    club.l = target.l;
    club.justPromoted = true;
    club.justRelegated = false;
    club.justFailed = false;
    club.failed = false;
    club.championPromoted = true;
    club.promotedFromTier = target.promotedFromTier || fromT;
    club.earnedCeil = target.earnedCeil;
    return true;
  }

  function liveClub(club) {
    if (!club || !club.n) return club;
    var name = String(club.n).toUpperCase();
    var found = (state.clubs || []).filter(function (c) {
      return String(c.n || '').toUpperCase() === name;
    })[0];
    if (!found) {
      if (!club.championPromoted) clampClubToHistory(club);
      return club;
    }
    if (!found.championPromoted) clampClubToHistory(found);
    var out = Object.assign({}, found);
    if (club.isLoan) out.isLoan = true;
    if (club.isStay) out.isStay = true;
    /* Promossa/Retro: solo il movimento di QUESTA stagione, non il ricordo del contratto. */
    out.isPromoted = !!found.justPromoted;
    out.isRelegated = !!found.justRelegated;
    out.failed = !!found.justFailed || !!found.failed;
    out.justFailed = !!found.justFailed;
    if (found.rebuild) out.rebuild = found.rebuild;
    return out;
  }

  function labelForItalianTier(club, t, atStart) {
    if (t === 3 && !atStart && typeof window !== 'undefined' && window.EliseePiramide && window.EliseePiramide.labelSerieC) {
      return window.EliseePiramide.labelSerieC(club);
    }
    if (t === 4 && !atStart && typeof window !== 'undefined' && window.EliseePiramide && window.EliseePiramide.labelSerieD) {
      return window.EliseePiramide.labelSerieD(club);
    }
    if (typeof window !== 'undefined' && window.EliseeClubStoria && window.EliseeClubStoria.labelFor) {
      return window.EliseeClubStoria.labelFor(club, t, atStart);
    }
    if (t === 1) return 'SERIE A';
    if (t === 2) return 'SERIE B';
    if (t === 3) return 'SERIE C · GIRONE A';
    if (t === 4) {
      // Fallback geolocation for Serie D when EliseePiramide not available
      var cName4 = String((club && (club.n || club.name || club.city)) || '').toUpperCase();
      var cLeague4 = String((club && (club.catalogL || club.l)) || '').toUpperCase();
      var dGirone = 'A';
      if (cLeague4.indexOf('PUGLIA') >= 0 || cLeague4.indexOf('BASILICATA') >= 0 || cLeague4.indexOf('CAMPANIA') >= 0) dGirone = 'H';
      else if (cLeague4.indexOf('CALABRIA') >= 0 || cLeague4.indexOf('SICILIA') >= 0) dGirone = 'I';
      else if (cLeague4.indexOf('LAZIO') >= 0 || cLeague4.indexOf('SARDEGNA') >= 0) dGirone = 'G';
      else if (cLeague4.indexOf('TOSCANA') >= 0 || cLeague4.indexOf('UMBRIA') >= 0) dGirone = 'E';
      else if (cLeague4.indexOf('MARCHE') >= 0 || cLeague4.indexOf('ABRUZZO') >= 0) dGirone = 'F';
      else if (cLeague4.indexOf('EMILIA') >= 0 || cLeague4.indexOf('ROMAGNA') >= 0) dGirone = 'D';
      else if (cLeague4.indexOf('VENETO') >= 0 || cLeague4.indexOf('FRIULI') >= 0 || cLeague4.indexOf('TRENTINO') >= 0) dGirone = 'C';
      else if (cLeague4.indexOf('LOMBARDIA') >= 0) dGirone = 'B';
      else if (cLeague4.indexOf('PIEMONTE') >= 0 || cLeague4.indexOf('LIGURIA') >= 0 || cLeague4.indexOf('VALLE D') >= 0) dGirone = 'A';
      else if (/TORINO|CUNEO|FOSSANO|CHIERI|CARMAGNOLA|DRONERO|ASTI|NOVARA|VERCELLI|MONREGALE|MORETTA|OVADA|VANCHIGLIA|GAVI/.test(cName4)) dGirone = 'A';
      else if (/BARI|FOGGIA|TARANTO|LECCE|BRINDISI|ANDRIA|BITONTO|TRANI|CERIGNOLA|ALTAMURA|FRANCAVILLA|FASANO|UGENTO|TAURISANO|SQUINZANO|NOVOLI|GALATINA|CANOSA|RACALE|ACQUAVIVA|MAGLIE|SPINAZZOLA|OSTUNI|POLIMNIA/.test(cName4)) dGirone = 'H';
      else if (/CATANIA|PALERMO|MESSINA|SIRACUSA|TRAPANI|RAGUSA|COSENZA|CROTONE|CATANZARO|REGGIO CALABRIA|LAMEZIA/.test(cName4)) dGirone = 'I';
      return 'SERIE D · GIRONE ' + dGirone;
    }
    if (t === 5) {
      var raw = String((club && (club.catalogL || club.l)) || '');
      if (raw.toUpperCase().indexOf('ECCELLENZA') === 0) return raw;
      return 'ECCELLENZA';
    }
    if (t === 6) return 'PROMOZIONE';
    if (t === 7) return 'PRIMA CATEGORIA';
    if (t === 8) return 'SECONDA CATEGORIA';
    if (t === 9) return 'TERZA CATEGORIA';
    if (t === 11) return 'PRIMAVERA 1';
    if (t === 12) return 'PRIMAVERA 2';
    return 'ECCELLENZA';
  }

  function isItalianPyramid(club) {
    if (!club || club.world || isYouthClub(club)) return false;
    var l = String(club.l || '').toUpperCase();
    return l.indexOf('SERIE') >= 0 || l.indexOf('ECCELLENZA') >= 0 || l.indexOf('PROMOZIONE') >= 0 || l.indexOf('PRIMA CATEGORIA') >= 0 || l.indexOf('SECONDA CATEGORIA') >= 0 || l.indexOf('TERZA CATEGORIA') >= 0;
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
      c.justFailed = false;
      c.failed = false;
      c.failedFrom = 0;
      c.rebuild = '';
      c._evoFrom = Number(c.t);
    });
    if (window.EliseeClubStoria && window.EliseeClubStoria.maybeFail) {
      (state.clubs || []).forEach(function (c) {
        if (!isItalianPyramid(c) || c.failed) return;
        var hit = window.EliseeClubStoria.maybeFail(c);
        if (hit) move(c, hit.dest, false, '', true);
      });
    }
    function pool(t) {
      var pGender = (state.player && state.player.gender) || state.trialGender || 'm';
      return (state.clubs || []).filter(function (c) {
        var cG = c.g === 'f' ? 'f' : 'm';
        return cG === pGender && Number(c.t) === t && isItalianPyramid(c);
      });
    }
    function stillIdle(c) {
      return c && !c.justPromoted && !c.justRelegated && !c.justFailed && !c.failed;
    }
    function move(c, t, up, fromGirone, isFail) {
      if (!isFail && !stillIdle(c)) return;
      if (isFail) {
        t = failLandingTier(c);
        if (!isLegalTier(c, t)) {
          if (isLegalTier(c, 4)) t = 4;
          else if (isLegalTier(c, 5)) t = 5;
          else return;
        }
      } else if (!isLegalTier(c, t)) {
        return;
      }
      var fromTier = Number(c.t);
      if (!isFail && Math.abs(t - fromTier) > 1) return;
      var fromG = fromGirone || clubGironeLetter(c);
      c.t = t;
      c.l = labelForItalianTier(c, t);
      c.justPromoted = !!up;
      c.justRelegated = !up;
      if (isFail) {
        c.failed = true;
        c.justFailed = true;
        c.failedFrom = fromTier;
        var historic = /PARMA|FIORENTINA|NAPOLI|PALERMO|SIENA|CATANIA|AREZZO|CESENA|REGGINA|BARI|FROSINONE/.test(String(c.n || '').toUpperCase());
        c.rebuild = Math.random() < (historic ? 0.48 : 0.3) ? 'forte' : 'debole';
        c.justPromoted = false;
        c.justRelegated = true;
      }
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
      var g = poolGirone(fromTier, letter).filter(function (c) { return stillIdle(c) && isLegalTier(c, toTier); });
      if (!g.length) g = pool(fromTier).filter(function (c) { return stillIdle(c) && isLegalTier(c, toTier); });
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
    weightedPickN(pool(2).filter(function (c) { return stillIdle(c) && isLegalTier(c, 1) && !isU23Club(c); }), 2, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.promoteWeight(c, 2) : 0.1) * 100;
    }).forEach(function (c) {
      move(c, 1, true);
      attachGironeWinnerTrophy(c, 2, '');
    });
    weightedPickN(pool(1).filter(function (c) { return stillIdle(c) && isLegalTier(c, 2); }), 3, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 1) : 0) * 100;
    }).forEach(function (c) { move(c, 2, false); });
    SERIE_C_GIRONI.forEach(function (g) {
      promoteGironeWinner(3, g, 2);
    });
    weightedPickN(pool(2).filter(function (c) { return stillIdle(c) && isLegalTier(c, 3); }), SERIE_C_GIRONI.length, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 2) : 0.1) * 100;
    }).forEach(function (c) { move(c, 3, false); });
    SERIE_D_GIRONI.forEach(function (g) {
      promoteGironeWinner(4, g, 3);
    });
    SERIE_C_GIRONI.forEach(function (g) {
      var gPool = poolGirone(3, g).filter(function (c) { return stillIdle(c) && isLegalTier(c, 4); });
      var nDown = 3;
      weightedPickN(gPool, nDown, function (c) {
        return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 3) : 0.1) * 100;
      }).forEach(function (c) { move(c, 4, false); });
    });
    weightedPickN(pool(4).filter(function (c) { return stillIdle(c) && isLegalTier(c, 5); }), 4, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.relegateWeight(c, 4) : 0.08) * 100;
    }).forEach(function (c) { move(c, 5, false); });
    weightedPickN(pool(5).filter(function (c) { return stillIdle(c) && isLegalTier(c, 4); }), 4, function (c) {
      return (window.EliseeClubStoria ? window.EliseeClubStoria.promoteWeight(c, 5) : 0.12) * 100;
    }).forEach(function (c) {
      move(c, 4, true);
      attachGironeWinnerTrophy(c, 5, '');
    });
    (state.clubs || []).forEach(function (c) {
      var from = Number(c._evoFrom);
      var now = Number(c.t);
      if (from && now - from > 1 && !c.justFailed) {
        c.t = from;
        if (applyFailLanding(c)) {
          c.failed = true;
          c.justFailed = true;
          c.failedFrom = from;
          c.justPromoted = false;
          c.justRelegated = true;
          if (!c.rebuild) c.rebuild = Math.random() < 0.3 ? 'forte' : 'debole';
        } else {
          c.t = Math.min(from + 1, 5);
          c.l = labelForItalianTier(c, c.t);
          c.justRelegated = true;
          c.justPromoted = false;
        }
      } else if (from && from - now > 1 && !c.justFailed) {
        c.t = from - 1;
        c.l = labelForItalianTier(c, c.t);
        c.justPromoted = true;
        c.justRelegated = false;
      }
      delete c._evoFrom;
    });
    repairClubTiers();
  }

  function attachGironeWinnerTrophy(club, fromTier, letter) {
    var p = state.player;
    if (!p || !p.history || !p.history.length || !club) return;
    var last = p.history[p.history.length - 1];
    if (!last || String(last.club || '').toUpperCase() !== String(club.n || '').toUpperCase()) return;
    var isF = (p.gender === 'f') || (club.g === 'f');
    var key = '';
    if (fromTier === 2) key = isF ? 'serie_b_femminile' : 'serie_b';
    else if (fromTier === 3) {
      if (isF) key = 'serie_c_femminile';
      else key = letter === 'B' ? 'serie_c_b' : letter === 'C' ? 'serie_c_c' : 'serie_c_a';
    } else if (fromTier === 4) key = 'serie_d';
    else if (fromTier === 5) key = isF ? 'eccellenza_femminile' : 'eccellenza';
    else if (fromTier === 6) key = isF ? 'promozione_femminile' : 'promozione';
    else if (fromTier === 7) key = 'prima_categoria';
    else if (fromTier === 8) key = 'seconda_categoria';
    else if (fromTier === 9) key = 'terza_categoria';
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
        jf: !!c.justFailed,
        pg: c.promotedFromGirone || '',
        pt: c.promotedFromTier || 0,
        fl: !!c.failed,
        ff: c.failedFrom || 0,
        rb: c.rebuild || '',
        ec: c.earnedCeil == null ? null : Number(c.earnedCeil),
        cp: !!c.championPromoted
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
        c.justPromoted = false;
        c.justRelegated = false;
        c.justFailed = false;
        c.failed = false;
        c.failedFrom = 0;
        c.rebuild = '';
        return;
      }
      c.t = want;
      c.l = r.l && Number(c.t) === 3 && /GIR(?:ONE|\.)\s*[D-I]/.test(String(r.l).toUpperCase())
        ? labelForItalianTier(c, want)
        : (r.l || labelForItalianTier(c, want));
      c.justPromoted = !!r.jp;
      c.justRelegated = !!r.jr;
      c.justFailed = !!r.jf || !!r.fl;
      c.promotedFromGirone = r.pg || '';
      c.promotedFromTier = r.pt || 0;
      c.failed = !!r.fl || !!r.jf;
      c.failedFrom = r.ff || 0;
      c.rebuild = r.rb || '';
      c.earnedCeil = r.ec == null ? c.earnedCeil : r.ec;
      c.championPromoted = !!r.cp;
      if (c.failed && clubLeagueTier(c) < 4) applyFailLanding(c);
      guardClub(c, false);
    });
  }

  function clubPrestige(club) {
    var n = String((club && club.n) || '').toUpperCase();
    if (!n || n === 'SVINCOLATO') return 0.35;
    if (isU23Club(club)) {
      var tU = clubLeagueTier(club);
      return tU === 3 ? 0.62 : 0.5;
    }
    var table = [
      ['REAL MADRID', 1.62], ['BARCELONA', 1.58], ['BAYERN', 1.55], ['MANCHESTER CITY', 1.58],
      ['LIVERPOOL', 1.48], ['PSG', 1.5], ['JUVENTUS', 1.52], ['INTER', 1.48], ['MILAN', 1.46],
      ['NAPOLI', 1.38], ['ROMA', 1.3], ['LAZIO', 1.26], ['ATALANTA', 1.24], ['FIORENTINA', 1.16],
      ['SAMPDORIA', 1.08], ['TORINO', 1.1], ['BOLOGNA', 1.12], ['UDINESE', 1.02],
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

  var CATEGORY_OVR_RANGES = {
    1:  { name: 'Serie A',            min: 76, max: 93, label: 'min. 76 / max. 93' },
    2:  { name: 'Serie B',            min: 59, max: 75, label: 'min. 59 / max. 75' },
    3:  { name: 'Serie C',            min: 43, max: 58, label: 'min. 43 / max. 58' },
    4:  { name: 'Serie D',            min: 30, max: 42, label: 'min. 30 / max. 42' },
    5:  { name: 'Eccellenza',         min: 24, max: 29, label: 'min. 24 / max. 29' },
    6:  { name: 'Promozione',         min: 19, max: 23, label: 'min. 19 / max. 23' },
    7:  { name: 'Prima Categoria',    min: 12, max: 18, label: 'min. 12 / max. 18' },
    8:  { name: 'Seconda Categoria',  min:  5, max: 11, label: 'min. 5 / max. 11'  },
    9:  { name: 'Terza Categoria',    min:  0, max:  4, label: 'min. 0 / max. 4'   },
    /* Campionati giovanili — l'OVR riflette il livello del singolo prospetto */
    10: { name: 'Primavera',          min: 50, max: 68, label: 'min. 50 / max. 68' },
    11: { name: 'Primavera 1',        min: 50, max: 68, label: 'min. 50 / max. 68' },
    12: { name: 'Primavera 2',        min: 40, max: 55, label: 'min. 40 / max. 55' }
  };

  var CATEGORY_PRICE_RANGES = {
    1:  { name: 'Serie A',           min: 5.0,     max: 150.0,    minLabel: '5 Mln.€',   maxLabel: '150 Mln.€'  },
    2:  { name: 'Serie B',           min: 0.250,   max: 4.90,     minLabel: '250 mila€', maxLabel: '4,9 Mln.€'  },
    3:  { name: 'Serie C',           min: 0.050,   max: 0.249,    minLabel: '50 mila€',  maxLabel: '249 mila€'  },
    4:  { name: 'Serie D',           min: 0.0099,  max: 0.049,    minLabel: '9,9 mila€', maxLabel: '49 mila€'   },
    5:  { name: 'Eccellenza',        min: 0.00090, max: 0.010,    minLabel: '900€',       maxLabel: '10 mila€'   },
    6:  { name: 'Promozione',        min: 0.00045, max: 0.000899, minLabel: '450€',       maxLabel: '899€'       },
    7:  { name: 'Prima Categoria',   min: 0.00030, max: 0.000449, minLabel: '300€',       maxLabel: '449€'       },
    8:  { name: 'Seconda Categoria', min: 0.00010, max: 0.000299, minLabel: '100€',       maxLabel: '299€'       },
    9:  { name: 'Terza Categoria',   min: 0.00001, max: 0.000100, minLabel: '10€',        maxLabel: '100€'       },
    /* Primavera: ingaggio simbolico — stipendi base giovani */
    11: { name: 'Primavera 1',       min: 0.00050, max: 0.002,    minLabel: '500€',       maxLabel: '2.000€'     },
    12: { name: 'Primavera 2',       min: 0.00020, max: 0.000499, minLabel: '200€',       maxLabel: '499€'       }
  };

  function calcRealisticValueM(ovr, age, club) {
    if (!club || club.isFree || String(club.n || '') === 'Svincolato') {
      return 0.00005; // 50€ base per svincolato
    }
    var tier = clubLeagueTier(club);
    var range = CATEGORY_PRICE_RANGES[tier] || CATEGORY_PRICE_RANGES[4];
    var minVal = range.min;
    var maxVal = range.max;

    var o = Math.max(40, Math.min(99, Number(ovr) || 50));
    var a = Number(age) || 20;

    // Modificatore per età
    var ageMul = 1;
    if (a <= 18) ageMul = 0.88;
    else if (a <= 23) ageMul = 1.06;
    else if (a <= 28) ageMul = 1.10;
    else if (a <= 31) ageMul = 1.0;
    else if (a <= 34) ageMul = 0.90;
    else ageMul = Math.max(0.72, 0.86 - (a - 34) * 0.035);

    // Parametro medio OVR per tier
    var parOvr = tier === 1 ? 78 : tier === 2 ? 68 : tier === 3 ? 60 : tier === 4 ? 54 : tier === 5 ? 50 : 46;
    var ovrProg = Math.max(0, Math.min(1, (o - (parOvr - 15)) / 30));

    var prestigeMul = (tier === 1) ? clubPrestige(club) : 1;
    var v = minVal + (maxVal - minVal) * Math.pow(ovrProg, 1.35) * ageMul * (0.9 + 0.1 * prestigeMul);

    if (v < minVal) v = minVal;
    if (v > maxVal) v = maxVal;

    return Math.round(v * 1000000) / 1000000;
  }

  function isUnsignedRow(rec) {
    if (!rec) return true;
    return !!(rec.isFree || rec.club === 'Svincolato' || rec.club === 'Libre');
  }

  function createPlayer() {
    if (!identityReady()) return false;
    resetClubsToCatalog();
    var pGender = state.gender || state.trialGender || 'm';
    var starters = clubsByCatalogTier(3, pGender).concat(clubsByCatalogTier(4, pGender));
    if (!starters.length) starters = clubsByCatalogTier(2, pGender);
    if (!starters.length) starters = (state.clubs || []).filter(function (c) { return (c.g === 'f' ? 'f' : 'm') === pGender; });
    var ovr = startOvr();
    var age = 16;
    var num = parseInt(state.number, 10);
    if (isNaN(num) || num < 1 || num > 99) num = rand(2, 99);
    
    // Inizializza come SVINCOLATO (Libre) a 16 anni
    var freeClub = { n: 'Svincolato', l: 'In cerca della 1ª squadra', o: '', t: pGender === 'f' ? 3 : 4, isFree: true, g: pGender };
    state.player = {
      gender: pGender,
      age: age,
      position: state.position,
      posLabel: posLabel(state.position),
      nation: state.nation,
      nationCode: state.nationCode,
      surname: (function () {
        var sn = (state.surname || '').trim();
        rememberSurname(sn);
        return sn;
      })(),
      foot: state.foot === 'left' ? 'left' : 'right',
      ovr: ovr,
      hiddenPot: 74 + rand(0, 5),
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
      u19Caps: 0,
      u19Goals: 0,
      u21Caps: 0,
      u21Goals: 0,
      contractYears: 0,
      wageWeek: 0,
      frozenOffers: null,
      pendingDeal: null,
      pendingRoleChange: null,
      pendingCaptain: null,
      isCaptain: false,
      captainClub: '',
      roleChanged: false,
      mode: state.mode
    };
    rememberIdentity();
    save(LS.career, state.player);
    save(LS.consent, true);
    return true;
  }

  var TROPHY_DIR = 'immagini/minigioco/loghi-trofei/';
  function trophyImg(file) {
    return TROPHY_DIR + file + '?v=20260823_TROPHY';
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
  // ---------- DEFINIZIONE TROFEI (file in loghi-trofei/Nazione) ----------
  var TROPHIES_MAP = {
    // ITALIA
    supercoppa_italia: { name: "Supercoppa Italia", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/supercoppa-italia.png') },
    coppa_italia: { name: "Coppa Italia", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/coppa-italia.png') },
    motm_serie_a: { name: "Man Of the Match Serie A", cat: "Individuale", nazione: "Italia", img: trophyImg('Italia/man-of-the-match-serie-a.png') },
    serie_a: { name: "Serie A", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/serie-a.png') },
    serie_b: { name: "Serie B", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/serie-b.png') },
    supercoppa_serie_c: { name: "Supercoppa di Serie C", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/supercoppa-serie-c.png') },
    coppa_serie_c: { name: "Coppa Italia Serie C", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/coppa-serie-c.png') },
    serie_c: { name: "Serie C", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/serie-c-a.png') },
    serie_c_a: { name: "Serie C (Girone A)", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/serie-c-a.png') },
    serie_c_b: { name: "Serie C (Girone B)", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/serie-c-b.png') },
    serie_c_c: { name: "Serie C (Girone C)", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/serie-c-c.png') },
    supercoppa_serie_d: { name: "Supercoppa di Serie D", cat: "Dilettanti", nazione: "Italia", img: trophyImg('Italia/coppa-serie-d.png') },
    coppa_serie_d: { name: "Coppa Italia Serie D", cat: "Dilettanti", nazione: "Italia", img: trophyImg('Italia/coppa-serie-d.png') },
    serie_d: { name: "Serie D", cat: "Dilettanti", nazione: "Italia", img: trophyImg('serie-d.jpg') },
    coppa_eccellenza: { name: "Coppa Eccellenza", cat: "Dilettanti", nazione: "Italia", img: trophyImg('Italia/coppa-eccellenza.png') },
    eccellenza: { name: "Eccellenza", cat: "Dilettanti", nazione: "Italia", img: trophyImg('eccellenza.jpg') },
    promozione: { name: "Promozione", cat: "Dilettanti", nazione: "Italia", img: trophyImg('promozione.jpg') },
    prima_categoria: { name: "Prima Categoria", cat: "Dilettanti", nazione: "Italia", img: trophyImg('prima-categoria.jpg') },
    seconda_categoria: { name: "Seconda Categoria", cat: "Dilettanti", nazione: "Italia", img: trophyImg('seconda-categoria.jpg') },
    terza_categoria: { name: "Terza Categoria", cat: "Dilettanti", nazione: "Italia", img: trophyImg('terza-categoria.jpg') },

    // FEMMINILE ITALIA & INTERNAZIONALE
    serie_a_femminile: { name: "Serie A Femminile", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/serie-a.png') },
    serie_b_femminile: { name: "Serie B Femminile", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/serie-b.png') },
    serie_c_femminile: { name: "Serie C Femminile", cat: "Lega Pro", nazione: "Italia", img: trophyImg('Italia/serie-c-a.png') },
    eccellenza_femminile: { name: "Eccellenza Femminile", cat: "Dilettanti", nazione: "Italia", img: trophyImg('eccellenza.jpg') },
    promozione_femminile: { name: "Promozione Femminile", cat: "Dilettanti", nazione: "Italia", img: trophyImg('promozione.jpg') },
    primavera_femminile: { name: "Primavera Femminile", cat: "Giovanili", nazione: "Italia", img: trophyImg('prima-categoria.jpg') },
    coppa_italia_femminile: { name: "Coppa Italia Femminile", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/coppa-italia.png') },
    supercoppa_femminile: { name: "Supercoppa Italiana Femminile", cat: "Nazionale", nazione: "Italia", img: trophyImg('Italia/supercoppa-italia.png') },
    womens_champions_league: { name: "Women's Champions League", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/champions-league.png') },
    ballon_dor_feminin: { name: "Ballon d'Or Féminin", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/pallone-doro.png') },
    world_cup_women: { name: "Mondiali Femminili", cat: "Internazionale", nazione: "Mondo", img: trophyImg('Internazionali/mondiale.png') },
    euro_cup_women: { name: "Europei Femminili", cat: "Internazionale", nazione: "Mondo", img: trophyImg('Internazionali/europei.png') },

    // MONDO / INTERNAZIONALI
    ballon_dor: { name: "Pallone d'oro", desc: "Miglior giocatore che ha avuto più prestazioni ottimali in tutta la stagione calcistica", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/pallone-doro.png') },
    scarpa_doro: { name: "Scarpa d'oro", desc: "Miglior realizzatore di tutti i top campionati", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/scarpa-doro.png') },
    world_cup: { name: "Mondiali", cat: "Internazionale", nazione: "Mondo", img: trophyImg('Internazionali/mondiale.png') },
    euro_cup: { name: "Europei", cat: "Internazionale", nazione: "Mondo", img: trophyImg('Internazionali/europei.png') },
    club_world_cup: { name: "Mondiale per Club", cat: "Internazionale", nazione: "Mondo", img: trophyImg('Internazionali/mondiale-club.png') },
    champions_league: { name: "Champions League", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/champions-league.png') },
    europa_league: { name: "Europa League", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/europa-league.png') },
    conference_league: { name: "Conference League", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/conference-league.png') },
    supercoppa_uefa: { name: "Supercoppa UEFA", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/supercoppa-uefa.png') },
    supercoppa_euro: { name: "Supercoppa UEFA", cat: "Europeo", nazione: "Mondo", img: trophyImg('Internazionali/supercoppa-uefa.png') },
    guanto_doro: { name: "Guanto d'oro", desc: "Miglior portiere", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/guanto-doro.png') },
    motm_cl: { name: "Man Of the Match Champions League", desc: "Migliore in campo della UEFA Champions League", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/man-of-the-match (Migliore-in-campo-della-uefa-champions-league).png') },
    motm_world_cup: { name: "Michelob ULTRA Superior Player of the Match", desc: "Migliore in campo di una gara dei mondiali", cat: "Individuale", nazione: "Mondo", img: trophyImg('Internazionali/Michelob ULTRA Superior-player-of-the-match -trophy.png') },
    player_of_year: { name: "Giocatore dell'Anno", cat: "Individuale", nazione: "Mondo", img: trophyImg('giocatore-anno.jpg') },

    // FRANCIA
    ligue1: { name: "Ligue 1", cat: "Nazionale", nazione: "Francia", img: trophyImg('Francia/ligue-1.png') },
    coupe_france: { name: "Coupe De France", cat: "Nazionale", nazione: "Francia", img: trophyImg('Francia/coupe-de-france.png') },

    // GERMANIA
    bundesliga: { name: "Bundesliga", cat: "Nazionale", nazione: "Germania", img: trophyImg('Germania/bundesliga.png') },
    dfb_pokal: { name: "DFB Pokal (Coppa di Germania)", cat: "Nazionale", nazione: "Germania", img: trophyImg('Germania/dfb-pokal-coppa-di-germania.png') },
    dfl_supercup: { name: "DFL Supercup (Supercoppa di Germania)", cat: "Nazionale", nazione: "Germania", img: trophyImg('Germania/dfl-supercup-supercoppa-di-germania.png') },

    // INGHILTERRA
    efl_cup: { name: "EFL Cup", cat: "Nazionale", nazione: "Inghilterra", img: trophyImg('Inghilterra/efl-cup.png') },
    fa_community_shield: { name: "FA Community Shield", cat: "Nazionale", nazione: "Inghilterra", img: trophyImg('Inghilterra/fa-community-shield.png') },
    fa_cup: { name: "FA Cup", cat: "Nazionale", nazione: "Inghilterra", img: trophyImg('Inghilterra/fa-cup.png') },
    motm_premier: { name: "Man Of The Match Premier League", cat: "Individuale", nazione: "Inghilterra", img: trophyImg('Inghilterra/man-of-the-match-premier-league.png') },
    premier: { name: "Premier League", cat: "Nazionale", nazione: "Inghilterra", img: trophyImg('Inghilterra/premier-league.png') },

    // SPAGNA
    copa_del_rey: { name: "Copa del Rey (Coppa Spagnola)", cat: "Nazionale", nazione: "Spagna", img: trophyImg('Spagna/copa-del-rey-coppa-spagnola.png') },
    laliga: { name: "La Liga", cat: "Nazionale", nazione: "Spagna", img: trophyImg('Spagna/la-liga.png') },
    supercopa_espana: { name: "Supercopa de Espana", cat: "Nazionale", nazione: "Spagna", img: trophyImg('Spagna/supercopa-de-espana.png') },

    // ALTRI MONDIALI / CAMPIONATI
    primeira: { name: "Primeira Liga", cat: "Nazionale", img: 'immagini/squadre-loghi/primeira-liga.png?v=20260814_COMP' },
    eredivisie: { name: "Eredivisie", cat: "Nazionale", img: 'immagini/squadre-loghi/eredivisie.png?v=20260814_COMP' },
    brasileirao: { name: "Brasileirao", cat: "Nazionale", img: trophyImg('Italia/serie-a.png') },
    liga_arg: { name: "Liga Argentina", cat: "Nazionale", img: trophyImg('Italia/serie-a.png') },
    liga_mx: { name: "Liga MX", cat: "Nazionale", img: 'immagini/squadre-loghi/liga-mx.png?v=20260814_COMP' },
    taca_portugal: { name: "Taca de Portugal", cat: "Nazionale", img: trophyImg('Italia/coppa-italia.png') },
    knvb_cup: { name: "KNVB Beker", cat: "Nazionale", img: trophyImg('Italia/coppa-italia.png') },
    copa_brasil: { name: "Copa do Brasil", cat: "Nazionale", img: trophyImg('Italia/coppa-italia.png') },
    copa_argentina: { name: "Copa Argentina", cat: "Nazionale", img: trophyImg('Italia/coppa-italia.png') },
    copa_mx: { name: "Copa MX", cat: "Nazionale", img: trophyImg('Italia/coppa-italia.png') }
  };

  function seasonYearOf(age) {
    return 2026 + Math.max(0, (age || 16) - 16);
  }

  function leagueTitleKey(league, gender) {
    var u = String(league || '').toUpperCase();
    var isF = gender === 'f' || u.indexOf('FEMMINIL') >= 0;
    if (isF) {
      if (u.indexOf('SERIE A') >= 0) return 'serie_a_femminile';
      if (u.indexOf('SERIE B') >= 0) return 'serie_b_femminile';
      if (u.indexOf('SERIE C') >= 0) return 'serie_c_femminile';
      if (u.indexOf('ECCELLENZA') >= 0) return 'eccellenza_femminile';
      if (u.indexOf('PROMOZIONE') >= 0) return 'promozione_femminile';
      if (u.indexOf('PRIMAVERA') >= 0) return 'primavera_femminile';
      return 'serie_a_femminile';
    }
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
    if (u.indexOf('ECCELLENZA') >= 0) return 'eccellenza';
    if (u.indexOf('PROMOZIONE') >= 0) return 'promozione';
    if (u.indexOf('PRIMA CATEGORIA') >= 0) return 'prima_categoria';
    if (u.indexOf('SECONDA CATEGORIA') >= 0) return 'seconda_categoria';
    if (u.indexOf('TERZA CATEGORIA') >= 0) return 'terza_categoria';
    return '';
  }

  function leagueCupKey(league, gender) {
    var u = String(league || '').toUpperCase();
    var isF = gender === 'f' || u.indexOf('FEMMINIL') >= 0;
    if (isF) {
      if (u.indexOf('SERIE A') >= 0 || u.indexOf('SERIE B') >= 0) return 'coppa_italia_femminile';
      return '';
    }
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
    if (u.indexOf('ECCELLENZA') >= 0) return 'coppa_eccellenza';
    return '';
  }

  /* ── YOUTH ACADEMY POWER ─────────────────────────────────────────────────────
     Forza del settore giovanile, indipendente dalla prima squadra.
     Scala 0.0 – 1.0 (1.0 = vivaio elite mondiale, 0.1 = minimo).
     Usata da youthClubPower() per simulare promozioni/retrocessioni Primavera.
  ─────────────────────────────────────────────────────────────────────────── */
  var YOUTH_ACADEMY_POWER = [
    /* Vivai Elite (Primavera 1 storici, molti nazionali prodotti) */
    ['ATALANTA',     0.94], ['INTER',        0.92], ['JUVENTUS',    0.90],
    ['MILAN',        0.88], ['ROMA',         0.86], ['FIORENTINA',  0.84],
    ['SAMPDORIA',    0.82], ['LAZIO',        0.80], ['NAPOLI',      0.82],
    ['TORINO',       0.78], ['BOLOGNA',      0.76], ['UDINESE',     0.74],
    /* Vivai Medi-Alti (competitivi in P1/P2) */
    ['CREMONESE',    0.72], ['SÜDTIROL',     0.70], ['SUDTIROL',    0.70],
    ['VICENZA',      0.68], ['L.R. VICENZA', 0.68], ['REGGIANA',    0.66],
    ['VENEZIA',      0.65], ['PISA',         0.64], ['SPEZIA',      0.64],
    ['FROSINONE',    0.63], ['PESCARA',      0.62], ['PERUGIA',     0.62],
    ['PALERMO',      0.61], ['BARI',         0.68], ['SALERNITANA', 0.66],
    ['PARMA',        0.70], ['GENOA',        0.72], ['CAGLIARI',    0.68],
    ['LECCE',        0.60], ['EMPOLI',       0.65], ['VERONA',      0.63],
    ['SASSUOLO',     0.70], ['CESENA',       0.58], ['MONZA',       0.60],
    ['COMO',         0.58], ['BRESCIA',      0.62], ['CATANZARO',   0.60],
    ['COSENZA',      0.58], ['BENEVENTO',    0.58], ['AVELLINO',    0.56],
    ['PADOVA',       0.62], ['CITTADELLA',   0.60], ['MODENA',      0.60],
    ['MANTOVA',      0.58], ['ASCOLI',       0.52], ['MONOPOLI',    0.46],
    ['LATINA',       0.42], ['LECCO',        0.45], ['RENATE',      0.40],
    ['ENTELLA',      0.44], ['VIRTUS ENTELLA',0.44], ['PRO VERCELLI',0.48],
    ['UNION BRESCIA',0.42]
  ];

  /* Ritorna la forza accademia youth di un club (0.1 – 0.94).
     Usa YOUTH_ACADEMY_POWER; fallback su tier della prima squadra. */
  function youthClubPower(club) {
    if (!club) return 0.10;
    /* Usa il campo dedicato se già impostato in catalogo (es. yp: 0.72) */
    if (typeof club.yp === 'number') return club.yp;
    var n = String(club.n || '').toUpperCase().replace(/\s*(U19|U20|PRIMAVERA|PRIM\.?)\s*/g, ' ').trim();
    for (var i = 0; i < YOUTH_ACADEMY_POWER.length; i++) {
      if (n.indexOf(YOUTH_ACADEMY_POWER[i][0]) >= 0) return YOUTH_ACADEMY_POWER[i][1];
    }
    /* Fallback: usa il tier della prima squadra come proxy */
    var t = clubLeagueTier(club);
    if (t === 1) return 0.62;
    if (t === 2) return 0.50;
    if (t === 3) return 0.40;
    return 0.30;
  }

  function clubTrophyPower(club) {
    if (!club) return 0.12;
    var n = String(club.n || '').toUpperCase();
    if (isU23Club(club)) return 0.1;
    if (/REAL MADRID|BARCELONA|BAYERN|MANCHESTER CITY|LIVERPOOL|PSG/.test(n)) return 0.94;
    if (/JUVENTUS|INTER|MILAN|ARSENAL|CHELSEA|ATLETICO|NAPOLI/.test(n)) return 0.82;
    if (/TOTTENHAM|DORTMUND|LEIPZIG|BENFICA|PORTO|AJAX|ATLÉTICO/.test(n)) return 0.7;
    if (/ROMA|LAZIO|ATALANTA|FIORENTINA|SEVILLA|LEVERKUSEN|MILAN/.test(n)) return 0.58;
    var t = clubLeagueTier(club);
    var pr = clubPrestige(club);
    if (club.world || t === 1) return Math.min(0.62, 0.28 + (pr - 0.9) * 0.4);
    if (t === 2) return 0.2 + (pr >= 0.86 ? 0.08 : 0);
    if (t === 3) return 0.16;
    return 0.1;
  }

  function generateSeasonTrophies(p, club, newOvr, stats, age) {
    var trophies = [];
    if (!club) return trophies;
    /* — PERCORSO GIOVANILE: tier 11 (Primavera 1) e 12 (Primavera 2) — */
    var tier = clubLeagueTier(club);
    if (tier === 11 || tier === 12) {
      return generateYouthSeasonOutcome(p, club, newOvr, stats, age, tier);
    }
    var isF = (p && p.gender === 'f') || (club && club.g === 'f');
    var league = club.l || club.league || '';
    var apps = (stats && stats.apps) || 0;
    var goals = (stats && stats.goals) || 0;
    var ga = goals + ((stats && stats.assists) || 0);
    var isGK = (p && p.position === 'GK');
    var title = leagueTitleKey(league, isF ? 'f' : 'm');
    var cup = leagueCupKey(league, isF ? 'f' : 'm');
    var power = clubTrophyPower(club);
    if (p && p.isCaptain) power = Math.min(1, power + 0.04);
    if (apps < 8 || (p && p.eventMods && p.eventMods.suspended)) return trophies;

    /* Stagioni consecutive in Serie A (serve per sbloccare coppe europee realisticamente) */
    var seasonsInA = 0;
    if (p && p.history) {
      var hist = p.history;
      for (var hi = hist.length - 1; hi >= 0; hi--) {
        var row = hist[hi];
        if (!row || !row.club) break;
        var rTier = row.tier || clubLeagueTierByLabel(row.league || '');
        if (rTier === 1) { seasonsInA++; } else { break; }
      }
    }

    var titleChance = (tier === 1 ? 0.055 : tier === 2 ? 0.08 : 0.11) + power * (tier === 1 ? 0.22 : 0.12);
    if (title && Math.random() < titleChance) {
      trophies.push(title);
      /* Supercoppe / tornei collegati */
      if (title === 'premier' && Math.random() < 0.35) trophies.push('fa_community_shield');
      if (title === 'laliga' && Math.random() < 0.35) trophies.push('supercopa_espana');
      if (title === 'bundesliga' && Math.random() < 0.35) trophies.push('dfl_supercup');
      if (title === 'serie_a' && Math.random() < 0.35) trophies.push('supercoppa_italia');
      if (title === 'serie_a_femminile' && Math.random() < 0.35) trophies.push('supercoppa_femminile');
      if (/serie_c/.test(title) && Math.random() < 0.30) trophies.push('supercoppa_serie_c');
      if (title === 'serie_d' && Math.random() < 0.25) trophies.push('supercoppa_serie_d');
    }

    /* Coppa Italia: solo se tier <= 2 (A o B partecipano); prob ridotta per squadre deboli.
       Una neopromossa in A (power ~0.28) ha ~3% di chance, una big storica (power 0.8+) ~15%. */
    var cupChance;
    if (cup === 'coppa_italia' || cup === 'coppa_italia_femminile') {
      /* Neopromosse: penalità se è il 1° anno in Serie A */
      var seasonsMalus = seasonsInA <= 1 ? 0.45 : (seasonsInA <= 2 ? 0.70 : 1.0);
      cupChance = (0.02 + power * 0.13) * seasonsMalus;
    } else {
      cupChance = 0.08 + power * 0.12;
    }
    if (cup && Math.random() < cupChance) {
      trophies.push(cup);
      if (cup === 'coppa_italia' && Math.random() < 0.28 + power * 0.15 && trophies.indexOf('supercoppa_italia') < 0) trophies.push('supercoppa_italia');
      if (cup === 'coppa_italia_femminile' && Math.random() < 0.28 + power * 0.15 && trophies.indexOf('supercoppa_femminile') < 0) trophies.push('supercoppa_femminile');
      if (cup === 'coppa_serie_c' && Math.random() < 0.22 && trophies.indexOf('supercoppa_serie_c') < 0) trophies.push('supercoppa_serie_c');
      if (cup === 'coppa_serie_d' && Math.random() < 0.20 && trophies.indexOf('supercoppa_serie_d') < 0) trophies.push('supercoppa_serie_d');
      if (cup === 'dfb_pokal' && Math.random() < 0.30 && trophies.indexOf('dfl_supercup') < 0) trophies.push('dfl_supercup');
      if (cup === 'copa_del_rey' && Math.random() < 0.30 && trophies.indexOf('supercopa_espana') < 0) trophies.push('supercopa_espana');
      if (cup === 'fa_cup') {
        if (Math.random() < 0.35 && trophies.indexOf('fa_community_shield') < 0) trophies.push('fa_community_shield');
        if (Math.random() < 0.28) trophies.push('efl_cup');
      }
    }

    if (tier === 1 || (club && club.world)) {
      /* Champions League: impossible per neopromosse (<2 stagioni in A) e squadre deboli.
         Prob: elite big (power 0.94) ~20%; big storiche (0.82) ~13%; mid-A (0.58) ~5%;
         neopromossa (0.28, 1a stagione) → 0% (bloccata da seasonsInA); 2a stagione ~2%. */
      var clBase = power * 0.22;
      if ((newOvr || 49) < 68) clBase *= 0.4;
      if (apps < 16) clBase *= 0.55;
      /* Neopromosse: blocco duro per i primi 2 anni */
      if (seasonsInA <= 1) clBase = 0;
      else if (seasonsInA <= 2) clBase *= 0.35;
      else if (seasonsInA <= 3) clBase *= 0.65;
      /* Serve power minimo 0.5 per sognare la CL */
      if (power < 0.50) clBase = 0;
      if (Math.random() < clBase) {
        trophies.push(isF ? 'womens_champions_league' : 'champions_league');
        if (!isF && Math.random() < 0.32) trophies.push('supercoppa_uefa');
        /* Mondiale per Club: solo squadre di altissimo livello (power elite + OVR >= 84) */
        if (!isF && power >= 0.75 && newOvr >= 84 && Math.random() < 0.18) trophies.push('club_world_cup');
        if (!isF && newOvr >= 80 && Math.random() < 0.25) trophies.push('motm_cl');
      } else if (!isF && seasonsInA >= 2 && Math.random() < 0.06 + power * 0.08) {
        /* Europa League: almeno 2 stagioni in A */
        trophies.push('europa_league');
      } else if (!isF && seasonsInA >= 1 && Math.random() < 0.06 + (1 - power) * 0.04) {
        /* Conference League: accessibile anche al 1° anno ma rara */
        trophies.push('conference_league');
      }

      /* Man of the Match di campionato */
      if (title === 'serie_a' && newOvr >= 78 && Math.random() < 0.20) trophies.push('motm_serie_a');
      if (title === 'premier' && newOvr >= 80 && Math.random() < 0.20) trophies.push('motm_premier');

      /* Scarpa d'oro per capocannoniere top */
      if (!isGK && goals >= 24 && newOvr >= 85 && Math.random() < 0.12) {
        trophies.push('scarpa_doro');
      }
      /* Guanto d'oro per portieri */
      if (isGK && newOvr >= 84 && apps >= 28 && Math.random() < 0.15) {
        trophies.push('guanto_doro');
      }
    }

    /* Pallone d'Oro / Giocatore dell'anno */
    if (newOvr >= 88 && (ga >= 18 || (isGK && newOvr >= 90)) && Math.random() < 0.045) trophies.push(isF ? 'ballon_dor_feminin' : 'ballon_dor');
    if (!isF && newOvr >= 84 && (ga >= 12 || (isGK && newOvr >= 86)) && Math.random() < 0.055) trophies.push('player_of_year');

    var year = seasonYearOf(age);
    if ((p.caps || 0) >= 8 && newOvr >= 82) {
      if (year % 4 === 2 && Math.random() < 0.16) {
        trophies.push('world_cup');
        if (newOvr >= 85 && Math.random() < 0.30) trophies.push('motm_world_cup');
      }
      if (year % 4 === 0 && Math.random() < 0.16) {
        trophies.push('euro_cup');
      }
    }
    return trophies;
  }

  /* Helper: ricava il tier dal label campionato (fallback per storia) */
  function clubLeagueTierByLabel(label) {
    var u = String(label || '').toUpperCase();
    if (u.indexOf('PRIMAVERA 1') >= 0 || u.indexOf('PRIM 1') >= 0) return 11;
    if (u.indexOf('PRIMAVERA 2') >= 0 || u.indexOf('PRIM 2') >= 0) return 12;
    if (u.indexOf('SERIE A') >= 0) return 1;
    if (u.indexOf('SERIE B') >= 0) return 2;
    if (u.indexOf('SERIE C') >= 0) return 3;
    if (u.indexOf('SERIE D') >= 0) return 4;
    if (u.indexOf('ECCELLENZA') >= 0) return 5;
    return 6;
  }

  /* ── YOUTH SEASON OUTCOME (Primavera 1 e Primavera 2) ────────────────────────────
     Sostituisce generateSeasonTrophies per i tier giovanili.
     Determina:
       - Trofei: scudetto_primavera (P1), coppa_primavera (P1/P2)
       - Movimento di categoria: promozione P2→P1, retrocessione P1→P2 o P2→P3
     La probabilità è basata su youthClubPower (vivaio) + OVR giocatore,
     senza considerare i criteri seniores (storia prima squadra).
  ─────────────────────────────────────────────────────────────────────────── */
  function generateYouthSeasonOutcome(p, club, newOvr, stats, age, tier) {
    var trophies = [];
    var apps = (stats && stats.apps) || 0;
    if (apps < 5) return trophies; /* troppo poco giocato */

    var yp = youthClubPower(club); /* forza vivaio 0.1–0.94 */
    /* Contributo individuale del prospetto: OVR relativo al range P1/P2 */
    var ovrRef = tier === 11 ? 60 : 48; /* media OVR per tier */
    var ovrBonus = Math.max(-0.15, Math.min(0.20, (newOvr - ovrRef) / 80));
    var strength = Math.max(0.05, Math.min(0.99, yp + ovrBonus));

    if (tier === 11) {
      /* — Primavera 1 —
         Nessuna promozione (vertice). Solo playoff Scudetto e retrocessione. */
      var playoffChance = 0.10 + strength * 0.35; /* qualificazione top-6 playoff */
      if (Math.random() < playoffChance) {
        trophies.push('primavera_playoff');
        /* Scudetto Primavera: vinto solo dalle elite */
        if (strength >= 0.75 && Math.random() < 0.20 + (strength - 0.75) * 0.30) {
          trophies.push('scudetto_primavera');
        }
      }
      /* Coppa Italia Primavera */
      if (Math.random() < 0.04 + strength * 0.10) trophies.push('coppa_primavera');
      /* Retrocessione in Primavera 2: vivaio debole o prospetto fuori livello */
      var relChance = Math.max(0, 0.28 - strength * 0.28);
      if (Math.random() < relChance) {
        trophies.push('_youth_relegation_to_12'); /* marker interno: retrocede P2 */
        if (club) { club.t = 12; club.l = (club.l || '').replace('PRIMAVERA 1', 'PRIMAVERA 2 · GIRONE A'); }
      }
    } else {
      /* — Primavera 2 (Gironi A / B) —
         Promozione in P1 tramite piazzamento/playoff; retrocessione in P3. */
      /* Promozione in Primavera 1 */
      var promoChance = 0.05 + strength * 0.40;
      /* Penalizzazione per primo anno in P2 */
      var seasonsInP2 = 0;
      if (p && p.history) {
        for (var hi2 = p.history.length - 1; hi2 >= 0; hi2--) {
          var r2 = p.history[hi2];
          if (!r2 || !r2.club) break;
          var r2tier = r2.tier || clubLeagueTierByLabel(r2.league || '');
          if (r2tier === 12) { seasonsInP2++; } else { break; }
        }
      }
      if (seasonsInP2 === 0) promoChance *= 0.70; /* primo anno: leggermente più difficile */
      if (Math.random() < promoChance) {
        trophies.push('primavera2_promozione'); /* promosso in Primavera 1 */
        if (club) { club.t = 11; club.l = 'PRIMAVERA 1'; club.justPromoted = true; }
      }
      /* Coppa Primavera 2 */
      if (Math.random() < 0.05 + strength * 0.10) trophies.push('coppa_primavera_2');
      /* Retrocessione in Primavera 3 */
      var rel2Chance = Math.max(0, 0.30 - strength * 0.30);
      if (Math.random() < rel2Chance) {
        trophies.push('_youth_relegation_to_p3'); /* marker interno: retrocede P3 */
      }
    }
    return trophies;
  }

  function seasonPerformance(p, club, age) {
    var pos = p.position || 'CM';
    var ovr = p.ovr;
    var tier = clubLeagueTier(club);
    /* Par OVR per tier: aggiunto supporto Primavera 1/2 */
    var par = tier === 1 ? 78 : tier === 2 ? 68 : tier === 3 ? 60
            : tier === 11 ? 58 : tier === 12 ? 46 : 54;
    var rel = ovr - par;
    var apps = 24 + Math.round(rel * 0.55);
    if (age <= 17) apps -= isAcademyProspect(p) ? 6 : 10;
    else if (age <= 19) apps -= isAcademyProspect(p) ? 1 : 4;
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
    var r = CATEGORY_OVR_RANGES[tier] || CATEGORY_OVR_RANGES[4];
    return Math.round((r.min + r.max) / 2);
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
    if (age >= 34 && Math.random() < 0.75) return 1;
    if (score >= 5) return -1;
    if (score >= 3) return Math.random() < 0.7 ? -1 : 0;
    if (score >= 1) return Math.random() < 0.22 ? -1 : 0;
    if (score <= -3) return 1;
    if (score <= -1) return Math.random() < 0.65 ? 1 : 0;
    return 0;
  }

  function clampTier(t) {
    t = Number(t) || 4;
    if (t === 11 || t === 12) return t;
    if (t < 1) return 1;
    if (t > 9) return 9;
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

  function pickCareerEvent(p) {
    p = p || state.player || {};
    var used = p.seenDilemmas || [];
    var last = p.lastDilemmaId || '';
    var pool = CAREER_EVENTS.filter(function (e) {
      return used.indexOf(e.id) < 0;
    });
    if (!pool.length) {
      pool = CAREER_EVENTS.filter(function (e) {
        return e.id !== last;
      });
      used = [];
    }
    if (!pool.length) pool = CAREER_EVENTS.slice();
    var ev = pool[rand(0, pool.length - 1)];
    p.seenDilemmas = used.concat([ev.id]);
    p.lastDilemmaId = ev.id;
    p.lastDilemmaAge = p.age;
    return ev.id;
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

  function careerPotential(p, club) {
    var pot = Number(p && p.hiddenPot);
    if (!(pot >= 60)) {
      pot = 74 + rand(0, 5);
      if (p && p.academyOrigin) pot = Math.max(pot, 80 + rand(0, 3));
    }
    var best = Number(p && p.ovr) || 49;
    var aGood = 0;
    (p && p.history ? p.history : []).forEach(function (h) {
      if (!h) return;
      if (h.ovr > best) best = h.ovr;
      if (clubLeagueTier({ l: h.league, t: h.t }) === 1 && (h.apps || 0) >= 16) aGood += 1;
    });
    if (clubLeagueTier(club) === 1) pot = Math.max(pot, 86);
    if (aGood >= 1) pot = Math.max(pot, 88);
    if (aGood >= 2 && best >= 76) pot = Math.max(pot, 89);
    if (aGood >= 3 && best >= 80) pot = Math.max(pot, 90);
    if (aGood >= 5 && best >= 82) pot = Math.max(pot, 92);
    if (aGood >= 7 && best >= 86) pot = 94;
    pot = Math.min(94, pot);
    if (p) p.hiddenPot = pot;
    return pot;
  }

  function ovrDeltaFromSeason(p, club, stats, dropping, age) {
    var apps = stats.apps || 0;
    var ga = (stats.goals || 0) + (stats.assists || 0);
    var exp = expectedGA(p.position, Math.max(apps, 1));
    var perf = ga - exp;
    var youth = isYouthContext(p, club, age);
    var ovr = Number(p.ovr) || 49;
    var pot = careerPotential(p, club);
    var gap = pot - ovr;
    var delta = 0;
    if (age <= 19) {
      if (gap >= 20) delta = rand(3, 5);
      else if (gap >= 10) delta = rand(2, 4);
      else delta = rand(1, 2);
    } else if (age <= 22) {
      if (gap >= 15) delta = rand(2, 4);
      else if (gap >= 6) delta = rand(1, 3);
      else delta = Math.random() < 0.55 ? 1 : 0;
    } else if (age <= 25) {
      if (gap >= 12) delta = rand(2, 3);
      else if (gap >= 5) delta = rand(1, 2);
      else if (gap > 0) delta = Math.random() < 0.6 ? 1 : 0;
    } else if (age <= 28) {
      if (gap >= 6) delta = rand(1, 2);
      else if (gap > 0) delta = Math.random() < 0.72 ? 1 : 0;
    } else if (age <= 31) {
      if (gap >= 4) delta = Math.random() < 0.58 ? 1 : 0;
      else if (gap > 0) delta = Math.random() < 0.48 ? 1 : 0;
    }
    if (youth && apps >= 10) delta += 1;
    else if (!youth && apps >= 28 && perf >= 2) delta += 1;
    else if (!youth && apps < 8 && age < 32) delta -= 1;
    if (perf >= 5) delta += 1;
    else if (perf <= -5) delta -= 1;
    if (age >= 34) delta = -rand(2, 4);
    else if (age >= 32) delta = Math.min(-1, delta);
    if (dropping) delta = Math.min(0, delta);
    if (ovr + delta > pot) {
      if (
        clubLeagueTier(club) === 1 &&
        apps >= 22 &&
        perf >= 2 &&
        pot < 94 &&
        Math.random() < 0.32
      ) {
        p.hiddenPot = Math.min(94, pot + 1);
        delta = Math.min(delta, p.hiddenPot - ovr);
      } else {
        delta = Math.min(delta, Math.max(0, pot - ovr));
      }
    }
    if (delta > 8) delta = 8;
    if (delta < -4) delta = -4;
    return delta;
  }

  function repairCareerOvrAndTier(p) {
    if (!p) return;
    if (p.history && p.history.length) {
      p.history.forEach(function (h) {
        if (!h) return;
        var hTier = clubLeagueTier({ l: h.league, t: h.t, n: h.club });
        var hR = CATEGORY_OVR_RANGES[hTier] || CATEGORY_OVR_RANGES[4];
        if (h.ovr > hR.max) h.ovr = hR.max;
        if (h.ovr < hR.min && !h.isFree && h.club !== 'Svincolato') h.ovr = hR.min;
      });
    }
    if (p.club && !p.club.isFree && p.club.n !== 'Svincolato') {
      var curTier = clubLeagueTier(p.club);
      var curRange = CATEGORY_OVR_RANGES[curTier] || CATEGORY_OVR_RANGES[4];
      if (p.ovr > curRange.max) p.ovr = curRange.max;
      if (p.ovr < curRange.min) p.ovr = curRange.min;
    }
    p.valueM = calcRealisticValueM(p.ovr, p.age, p.club);
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
    if (isPendingFailMarket(p)) {
      applyFailMarketMove(p, selectedOffer);
    }
    if (selectedOffer) {
      if (typeof selectedOffer.signedWage === 'number') p.wageWeek = selectedOffer.signedWage;
      else if (selectedOffer.deal) p.wageWeek = selectedOffer.deal.wage;
      if (typeof selectedOffer.signedYears === 'number') p.contractYears = selectedOffer.signedYears;
      else if (selectedOffer.deal) p.contractYears = selectedOffer.deal.years;
    }
    p.frozenOffers = null;
    p.pendingDeal = null;

    for (var y = 0; y < years; y++) {
      var seasonAge = firstClub ? 16 + y : ((p.age || 16) + 1);
      club = liveClub(club) || club;
      if (firstClub && y === 0 && selectedOffer && selectedOffer.isYouth && isBigYouthClub(selectedOffer)) {
        p.academyOrigin = true;
        p.academyClub = selectedOffer.n || '';
        p.hiddenPot = Math.max(Number(p.hiddenPot) || 0, 80 + rand(0, 4));
      }
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
      var tierRange = CATEGORY_OVR_RANGES[newTier] || CATEGORY_OVR_RANGES[4];
      if (newOvr > tierRange.max) newOvr = tierRange.max;
      if (newOvr < tierRange.min && !club.isFree && club.n !== 'Svincolato') newOvr = tierRange.min;
      if (newOvr < 0) newOvr = 0;
      if (newOvr > 93) newOvr = 93;
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
        failed: false,
        rebuild: '',
        isFree: false,
        suspended: !!(p.eventMods && p.eventMods.suspended)
      };
      if (firstClub && y === 0) p.history[p.history.length - 1] = row;
      else p.history.push(row);
      p.age = seasonAge;
      p.ovr = newOvr;
      p.club = club;
      if (p.isCaptain && p.captainClub && String((club && club.n) || '').toUpperCase() !== String(p.captainClub).toUpperCase()) {
        p.isCaptain = false;
        p.captainClub = '';
      }
      if (p.club) {
        p.club.isPromoted = false;
        p.club.isRelegated = false;
      }
      p.valueM = calcRealisticValueM(newOvr, seasonAge, club);
      p.lastForm = seasonFormScore(p, club, stats, seasonAge);
      p.lastJump = jumpFromForm(p.lastForm, seasonAge);
      row.form = p.lastForm;
      row.jump = p.lastJump;
      if (
        !suspended &&
        seasonAge >= 21 &&
        newOvr >= 78 &&
        newTier === 1 &&
        !isYouthContext(p, club, seasonAge) &&
        Math.random() < 0.18
      ) {
        p.caps = (p.caps || 0) + rand(1, 2);
        if (/ST|LW|RW|CAM/.test(p.position) && Math.random() < 0.4) p.natGoals = (p.natGoals || 0) + 1;
        if (Math.random() < 0.35) p.natAst = (p.natAst || 0) + 1;
      }
      awardYouthCaps(p, club, stats, seasonAge, newOvr, newTier);
      evolveItalianLeagues();
      repairClubTiers();
      applyChampionPromotion(club, seasonTrophyKeys);
      p.club = club;
      var syncedChamp = findLiveClub(club && club.n);
      if (syncedChamp) {
        club.t = syncedChamp.t;
        club.l = syncedChamp.l;
        club.justPromoted = !!syncedChamp.justPromoted;
        club.justRelegated = !!syncedChamp.justRelegated;
        club.justFailed = !!syncedChamp.justFailed;
        club.failed = !!syncedChamp.failed;
        club.championPromoted = !!syncedChamp.championPromoted;
        club.earnedCeil = syncedChamp.earnedCeil;
        club.promotedFromTier = syncedChamp.promotedFromTier || 0;
        p.club = club;
      }
      row.recap = seasonRecapText(club, stats, {
        callUp: !!(selectedOffer && selectedOffer.isCallUp && y === 0)
      });
      if (p.contractYears > 0) p.contractYears -= 1;
      if (club && club.justFailed) {
        row.failed = true;
        row.rebuild = club.rebuild || '';
        row.clubMoved = true;
        p.pendingDilemma = null;
        p.pendingRoleChange = null;
        prevTier = clubLeagueTier(club);
        firstClub = false;
        break;
      }
      if (club && (club.justPromoted || club.justRelegated)) {
        row.clubMoved = true;
        row.promoted = !!club.justPromoted;
        row.relegated = !!club.justRelegated;
        p.pendingDilemma = null;
        p.pendingRoleChange = null;
        prevTier = clubLeagueTier(club);
        firstClub = false;
        break;
      }
      prevTier = clubLeagueTier(club);
      firstClub = false;
    }
    p.eventMods = null;
    var lastRow = p.history[p.history.length - 1];
    if (lastRow && (lastRow.failed || lastRow.clubMoved)) {
      p.pendingDilemma = null;
      p.pendingRoleChange = null;
      p.pendingCaptain = null;
    } else {
      maybeQueueCaptain(p);
      if (p.pendingCaptain) {
        p.pendingDilemma = null;
        p.pendingRoleChange = null;
      } else {
      maybeQueueRoleChange(p);
      if (p.pendingRoleChange) {
        p.pendingDilemma = null;
      } else {
        var yearsSince = p.lastDilemmaAge ? p.age - p.lastDilemmaAge : 99;
        var dilemmaChance = state.mode === 'intense' ? 0.16 : state.mode === 'express' ? 0.1 : 0.13;
        if (
          !fromDilemma &&
          p.age >= 18 &&
          p.age < 36 &&
          yearsSince >= 3 &&
          Math.random() < dilemmaChance
        ) {
          p.pendingDilemma = pickCareerEvent(p);
        } else {
          p.pendingDilemma = null;
        }
      }
      }
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

  function fillOffers(used, offers, need, p) {
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var all = (state.clubs || []).filter(function (c) {
      var cG = c.g === 'f' ? 'f' : 'm';
      return cG === pGender;
    });
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

  function stampSeasonMoveBadge(o) {
    if (!o) return o;
    o.isPromoted = !!o.justPromoted;
    o.isRelegated = !!o.justRelegated;
    return o;
  }

  function sanitizeOfferClub(c) {
    if (!c) return c;
    var out = Object.assign({}, c);
    var keepFail = !!(out.failed || out.justFailed);
    var failT = Number(out.t);
    var failL = out.l;
    var rebuild = out.rebuild;
    guardClub(out, false);
    if (keepFail) {
      out.failed = true;
      out.justFailed = !!c.justFailed || !!out.justFailed;
      if (rebuild) out.rebuild = rebuild;
      if (failT >= 4) {
        out.t = failT;
        out.l = failL || labelForItalianTier(out, failT);
      }
    }
    return stampSeasonMoveBadge(out);
  }

  function assertStartOffer(o) {
    if (!o) return o;
    guardClub(o, true);
    if (o.catalogT != null && Number(o.t) !== Number(o.catalogT)) {
      o.t = Number(o.catalogT);
      o.l = o.catalogL || labelForItalianTier(o, o.t);
    }
    o.isYouth = Number(o.t) === 10 || isYouthClub(o);
    o.isLoan = false;
    return o;
  }

  function minOvrForClub(c) {
    if (!c) return 30;
    if (isU23Club(c)) return 48;
    var n = String(c.n || '').toUpperCase();
    if (c.world) {
      if (/REAL MADRID|BARCELONA|BAYERN|MANCHESTER CITY|LIVERPOOL|PSG/.test(n)) return 86;
      if (/ARSENAL|CHELSEA|MANCHESTER UNITED|ATLETICO|TOTTENHAM|BAYER|NAPOLI/.test(n)) return 80;
      return 76;
    }
    var t = clubLeagueTier(c);
    var r = CATEGORY_OVR_RANGES[t] || CATEGORY_OVR_RANGES[4];
    var pr = clubPrestige(c);
    if (t === 1) return pr >= 1.3 ? 84 : pr >= 1.05 ? 80 : 76;
    return r.min;
  }

  function maxOvrForClub(c) {
    if (!c) return 93;
    if (c.world) return 94;
    if (isU23Club(c)) return 68;
    var t = clubLeagueTier(c);
    var r = CATEGORY_OVR_RANGES[t] || CATEGORY_OVR_RANGES[4];
    return r.max;
  }

  function playerFitsClub(p, c, opts) {
    if (!c || !p) return false;
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var cGender = (c && c.g === 'f') ? 'f' : 'm';
    if (pGender !== cGender) return false;
    var age = p.age || 16;

    // Regola 1: Under 19 / Under 20 / Primavera solo se l'età lo permette
    if (isYouthClub(c)) {
      if (isU19Club(c) && age > 19) return false;
      if (age > 20) return false;
    }
    // Regola U23: massimo 23 anni
    if (isU23Club(c) && age > 23) return false;

    // Se si è oltre l'età consentita, non è permesso nemmeno il rinnovo/permanenza (stay)
    if (opts && opts.stay) {
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
      return true;
    }
    if (opts && opts.callUp) return true;

    if (c.world && age < 21) return false;
    if (c.world && clubLeagueTier(p.club) > 1) return false;
    var o = Number(p.ovr) || 49;
    var min = minOvrForClub(c);
    var max = maxOvrForClub(c);
    var youth = opts && opts.allowYouth && isBigYouthClub(c) && age <= 19 && !isU23Club(c);
    if (youth) min = Math.max(45, min - 24);
    if (opts && opts.academyPath && isAcademyProspect(p) && clubLeagueTier(c) >= 2) {
      min = Math.min(min, 50);
    }
    if (o < min) return false;
    if (o > max) return false;
    return true;
  }

  function lastPlayedTier(p) {
    var last = p && p.history && p.history[p.history.length - 1];
    if (!last) return 0;
    return clubLeagueTier({ l: last.league, t: last.t });
  }

  function isPendingFailMarket(p) {
    if (!p || !p.history || !p.history.length) return false;
    var last = p.history[p.history.length - 1];
    if (!last || last.failSettled || isUnsignedRow(last)) return false;
    if (last.failed) return true;
    var club = liveClub(p.club) || p.club;
    if (club && (club.justFailed || club.failed)) return true;
    var playedT = lastPlayedTier(p);
    var nowT = clubLeagueTier(club);
    return !!(playedT && nowT >= playedT + 2);
  }

  function failMarketTargetOvr(p, offer) {
    var cur = Number(p && p.ovr) || 49;
    var destMax = maxOvrForClub(offer);
    var destMin = minOvrForClub(offer);
    var destPar = leagueParOvr(offer);
    var destT = clubLeagueTier(offer);
    if (destT >= 5) destPar = Math.min(destPar, 48);
    else if (destT >= 4) destPar = Math.min(destPar, 52);
    var stay = !!(offer && (offer.isStay || offer.failed));
    var target;
    if (stay) {
      target = Math.min(destPar - 2, destMax - 6);
      if (offer && offer.rebuild === 'forte') target = Math.min(destPar + 2, destMax - 3);
      var floorDrop = offer && offer.rebuild === 'forte' ? 8 : 12;
      if (target > cur - floorDrop) target = cur - floorDrop;
    } else if (cur > destMax) {
      target = destMax - 1;
    } else if (cur < destMin) {
      target = destMin;
    } else if (cur > destPar + 6) {
      target = Math.max(destPar + 4, destMax - 3);
    } else {
      target = cur;
    }
    if (target < destMin) target = destMin;
    if (target > destMax) target = destMax;
    if (target < 0) target = 0;
    if (target > 94) target = 94;
    return Math.round(target);
  }

  function failMarketValue(p, offer, newOvr) {
    var v = calcRealisticValueM(newOvr, (p && p.age) || 20, offer);
    if (offer && (offer.isStay || offer.failed)) {
      v = Math.round(v * 0.42 * 1000) / 1000;
      var floor = clubLeagueTier(offer) >= 4 ? 0.008 : 0.015;
      if (v < floor) v = floor;
    }
    return v;
  }

  function failMarketPreview(p, offer) {
    var fromOvr = Number(p && p.ovr) || 49;
    var fromValue = Number(p && p.valueM);
    if (!(fromValue > 0)) fromValue = calcRealisticValueM(fromOvr, (p && p.age) || 20, p && p.club);
    var ovr = failMarketTargetOvr(p, offer);
    return {
      ovr: ovr,
      value: failMarketValue(p, offer, ovr),
      fromOvr: fromOvr,
      fromValue: fromValue
    };
  }

  function applyFailMarketMove(p, offer) {
    var hit = failMarketPreview(p, offer);
    p.ovr = hit.ovr;
    p.valueM = hit.value;
    var last = p.history && p.history[p.history.length - 1];
    if (last) last.failSettled = true;
    return hit;
  }

  function pickFailMarketClub(used, t, p) {
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var age = (p && p.age) || 16;
    var top = takeTopOfTier(used, t, p);
    if (top && !top.failed && !top.justFailed && !top.world && (top.g === 'f' ? 'f' : 'm') === pGender) return Object.assign({}, top);
    var pool = clubsByTier(t, pGender).filter(function (c) {
      if (!c || !c.n || used[c.n] || c.world || c.failed || c.justFailed || !isItalianPyramid(c)) return false;
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== pGender) return false;
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
      if (p && !playerFitsClub(p, c, {})) return false;
      return true;
    });
    var c = takeUniqueClub(used, pool);
    return c ? Object.assign({}, c) : null;
  }

  function fillFailMarketOffers(p, stay, used) {
    var offers = [stay];
    if (isU23Club(stay)) {
      var failCall = makeCallUpOffer(p, stay, used);
      if (failCall) offers.push(failCall);
    }
    var landT = clubLeagueTier(stay);
    var fromT = Number(stay.failedFrom) || lastPlayedTier(p) || landT;
    var want = [];
    if (fromT <= 2 && landT >= 4) {
      want.push(3, 2);
    } else {
      if (landT > 1) want.push(landT - 1);
      want.push(landT);
    }
    var i;
    for (i = 0; i < want.length && offers.length < 3; i++) {
      var c = pickFailMarketClub(used, clampTier(want[i]), p);
      if (!c) continue;
      c = stampSeasonMoveBadge(c);
      c.isLoan = false;
      c.failOffer = true;
      if (clubLeagueTier(c) < landT) c.isJumpUp = true;
      else if (clubLeagueTier(c) > landT) c.isJumpDown = true;
      offers.push(sanitizeOfferClub(c));
    }
    var fallback = [3, 4, 2, 5, 1];
    for (i = 0; offers.length < 3 && i < fallback.length; i++) {
      if (want.indexOf(fallback[i]) >= 0) continue;
      var extra = pickFailMarketClub(used, fallback[i], p);
      if (!extra) continue;
      extra = stampSeasonMoveBadge(extra);
      extra.isLoan = false;
      extra.failOffer = true;
      offers.push(sanitizeOfferClub(extra));
    }
    return offers.slice(0, 3);
  }

  function weeklyWage(ovr, age, club, opts) {
    opts = opts || {};
    var tier = clubLeagueTier(club);
    var o = Number(ovr) || 25;
    var a = Number(age) || 20;
    var base;
    if (opts.isYouth) base = 30 + Math.max(0, o - 20) * 3;
    else if (club && club.isFree) base = 0;
    else if (tier >= 9) base = 10;
    else if (tier === 8) base = 15 + Math.max(0, o - 5) * 2;
    else if (tier === 7) base = 25 + Math.max(0, o - 12) * 3;
    else if (tier === 6) base = 40 + Math.max(0, o - 19) * 4;
    else if (tier === 5) base = 60 + Math.max(0, o - 24) * 5;
    else if (tier === 4) base = 120 + Math.max(0, o - 30) * 10;
    else if (tier === 3) base = 350 + Math.max(0, o - 43) * 25;
    else if (tier === 2) base = 1500 + Math.pow(Math.max(0, o - 59), 1.35) * 60;
    else base = 4200 + Math.pow(Math.max(0, o - 76), 1.55) * 200 * clubPrestige(club);
    if (a <= 18) base *= 0.52;
    else if (a <= 21) base *= 0.72;
    else if (a >= 34) base *= 0.68;
    if (opts.isLoan) base *= 0.55;
    if (club && (club.failed || club.justFailed)) base *= 0.42;
    if (base <= 0) return 0;
    return Math.max(10, Math.round(base / 5) * 5);
  }

  function offerContractYears(p, offer) {
    if (!offer) return 2;
    if (offer.isLoan || offer.isYouth) return 1;
    var a = (p && p.age) || 16;
    if (a <= 18) return 3;
    if (a <= 23) return 4;
    if (a <= 29) return 3;
    if (a <= 33) return 2;
    return 1;
  }

  function attachOfferDeal(p, offer) {
    if (!offer) return offer;
    var open = weeklyWage(p.ovr, p.age, offer, offer);
    var years = offerContractYears(p, offer);
    var buy = !offer.isStay && !offer.isLoan;
    offer.deal = {
      wage: open,
      years: years,
      minWage: Math.max(50, Math.round(open * 0.82 / 10) * 10),
      maxWage: Math.round(open * (offer.isStay ? 1.18 : buy ? 1.38 : 1.16) / 10) * 10,
      minYears: 1,
      maxYears: offer.isLoan || offer.isYouth ? 1 : 5
    };
    return offer;
  }

  function formatWage(w) {
    w = Math.round(Number(w) || 0);
    if (w <= 0) return '0/sett';
    if (w >= 1000) {
      var k = w / 1000;
      var t = k >= 10 || w % 1000 === 0 ? String(Math.round(k)) : k.toFixed(1).replace('.', ',');
      return t + 'K/sett';
    }
    return w + '/sett';
  }

  function offerPreview(p, offer) {
    if (isPendingFailMarket(p)) return failMarketPreview(p, offer);
    var fromOvr = Number(p && p.ovr) || 49;
    var fromValue = Number(p && p.valueM);
    if (!(fromValue > 0)) fromValue = calcRealisticValueM(fromOvr, (p && p.age) || 16, p && p.club);
    var ovr = fromOvr;
    if (offer && !offer.isStay && !offer.isYouth && !offer.isLoan) {
      var destMax = maxOvrForClub(offer);
      if (ovr > destMax) ovr = destMax;
    }
    return {
      fromOvr: fromOvr,
      ovr: ovr,
      fromValue: fromValue,
      value: calcRealisticValueM(ovr, (p && p.age) || 16, offer)
    };
  }

  function getMarketOffers(p) {
    if (p.frozenOffers && p.frozenOffers.length) {
      var curClub = liveClub(p.club) || p.club;
      var stayFr = null;
      var hasCall = false;
      var iFr;
      for (iFr = 0; iFr < p.frozenOffers.length; iFr++) {
        if (p.frozenOffers[iFr] && p.frozenOffers[iFr].isStay) stayFr = p.frozenOffers[iFr];
        if (p.frozenOffers[iFr] && p.frozenOffers[iFr].isCallUp) hasCall = true;
      }
      var staleStay = stayFr && curClub && clubLeagueTier(stayFr) !== clubLeagueTier(curClub);
      var missCall = isU23Club(curClub) && canCallUpFromU23(p, curClub) && !hasCall;
      if (!staleStay && !missCall) return p.frozenOffers;
      p.frozenOffers = null;
    }
    var offers = transferOffers(p);
    offers.forEach(function (o) {
      attachOfferDeal(p, o);
      if (
        o.isStay &&
        (p.contractYears > 0) &&
        !o.failed &&
        !isPendingFailMarket(p)
      ) {
        o.deal.years = p.contractYears;
        o.deal.wage = p.wageWeek || o.deal.wage;
        o.deal.maxYears = p.contractYears;
        o.deal.maxWage = o.deal.wage;
        o.existingContract = true;
      }
    });
    p.frozenOffers = offers;
    return offers;
  }

  function startDeal(p, offer) {
    attachOfferDeal(p, offer);
    var cap = isCaptainOf(p, offer);
    if (cap && offer.deal) {
      offer.deal.maxWage = offer.deal.wage;
    }
    return {
      offer: offer,
      wage: offer.deal.wage,
      years: offer.deal.years,
      round: 0,
      maxRounds: offer.isStay || offer.isYouth || cap ? 2 : 3,
      status: 'open',
      captainLock: cap,
      note: cap
        ? 'Sei il capitano: lo stipendio è quello chiesto dal club, niente aumenti.'
        : offer.isCallUp
          ? 'Salto dalla seconda squadra alla prima. Puoi accettare o trattare l\'ingaggio.'
          : offer.isStay
            ? 'Rinnovo: puoi accettare o chiedere un po\' di più.'
            : 'Il club ha fatto un\'offerta. Accetta o contrattare.'
    };
  }

  function resolveDealAsk(dealState, kind) {
    var offer = dealState.offer || {};
    var spec = offer.deal || {};
    var wage = Number(dealState.wage) || spec.wage || 100;
    var years = Number(dealState.years) || spec.years || 2;
    var maxW = spec.maxWage || Math.round(wage * 1.3);
    var maxY = spec.maxYears || 5;
    var round = (dealState.round || 0) + 1;
    var maxR = dealState.maxRounds || 3;
    var note = '';
    var status = 'open';
    if (kind === 'money') {
      if (dealState.captainLock) {
        return {
          offer: offer,
          wage: wage,
          years: years,
          round: dealState.round || 0,
          maxRounds: maxR,
          status: 'open',
          captainLock: true,
          note: 'Da capitano non puoi chiedere di più: resti alle condizioni del club.'
        };
      }
      var want = Math.round(wage * 1.18 / 10) * 10;
      if (want <= maxW) {
        wage = want;
        note = 'Il club accetta l\'aumento.';
        status = 'open';
      } else if (round < maxR) {
        wage = maxW;
        note = 'Il club non va oltre: ultima offerta ' + formatWage(maxW) + '.';
      } else {
        status = 'withdrawn';
        note = 'Trattativa saltata: il club ritira l\'offerta.';
      }
    } else if (kind === 'years') {
      if (years < maxY) {
        years += 1;
        note = 'Il club accetta un anno in più.';
      } else if (round >= maxR) {
        status = 'withdrawn';
        note = 'Trattativa saltata: troppe richieste.';
      } else {
        note = 'Il club non allunga oltre ' + maxY + ' anni.';
      }
    }
    return {
      offer: offer,
      wage: wage,
      years: years,
      round: round,
      maxRounds: maxR,
      status: status,
      captainLock: !!dealState.captainLock,
      note: note
    };
  }

  var ROLE_SHIFT = {
    LB: { id: 'LM', from: 'TS', to: 'ES' },
    RB: { id: 'RM', from: 'TD', to: 'ED' },
    CB: { id: 'CDM', from: 'DC', to: 'MED' },
    CDM: { id: 'CM', from: 'MED', to: 'CC' },
    CM: { id: 'CAM', from: 'CC', to: 'TRQ' },
    LM: { id: 'LW', from: 'ES', to: 'AS' },
    RM: { id: 'RW', from: 'ED', to: 'AD' },
    CAM: { id: 'ST', from: 'TRQ', to: 'ATT' },
    LW: { id: 'ST', from: 'AS', to: 'ATT' },
    RW: { id: 'ST', from: 'AD', to: 'ATT' }
  };

  function isCaptainOf(p, offer) {
    if (!p || !p.isCaptain || !p.captainClub || !offer) return false;
    return String(offer.n || '').toUpperCase() === String(p.captainClub || '').toUpperCase();
  }

  function maybeQueueCaptain(p) {
    if (!p || p.pendingCaptain || p.pendingRoleChange || p.pendingDilemma) return;
    var clubName = p.club && p.club.n;
    if (!clubName || clubName === 'Svincolato') return;
    if (p.isCaptain && String(p.captainClub || '').toUpperCase() === String(clubName).toUpperCase()) return;
    var age = p.age || 16;
    if (age < 23 || age > 34) return;
    var appsHere = 0;
    (p.history || []).forEach(function (h) {
      if (h && String(h.club || '').toUpperCase() === String(clubName).toUpperCase()) {
        appsHere += h.apps || 0;
      }
    });
    if (appsHere < 35) return;
    if (Math.random() > 0.16) return;
    p.pendingCaptain = { club: clubName };
  }

  function maybeQueueRoleChange(p) {
    if (!p || p.roleChanged || p.pendingRoleChange) return;
    var age = p.age || 16;
    if (age < 23 || age > 28) return;
    if (p.position === 'GK' || !ROLE_SHIFT[p.position]) return;
    var apps = (p.history || []).reduce(function (a, h) { return a + (h && h.apps ? h.apps : 0); }, 0);
    if (apps < 80) return;
    if (Math.random() > 0.12) return;
    p.pendingRoleChange = ROLE_SHIFT[p.position];
  }

  function seasonRecapText(club, stats, extra) {
    extra = extra || {};
    var apps = (stats && stats.apps) || 0;
    var role = apps >= 26 ? 'Titolare' : apps >= 16 ? 'In rosa' : 'Poco utilizzato';
    var move;
    if (extra.callUp) move = 'passato in prima squadra';
    else if (club && club.justFailed) move = 'il club è fallito';
    else if (club && club.justPromoted) move = 'il club è stato promosso';
    else if (club && club.justRelegated) move = 'il club è retrocesso';
    else move = 'il club è rimasto in ' + shortLeague((club && club.l) || '', (club && club.n) || '');
    return role + ', ' + apps + ' partite, ' + move;
  }

  function awardYouthCaps(p, club, stats, age, newOvr, newTier) {
    var apps = (stats && stats.apps) || 0;
    if (apps < 8 || (p.eventMods && p.eventMods.suspended)) return;
    if (age <= 19 && newOvr >= 52 && Math.random() < 0.28) {
      p.u19Caps = (p.u19Caps || 0) + rand(1, 3);
      if (Math.random() < 0.22) p.u19Goals = (p.u19Goals || 0) + 1;
    }
    if (age >= 18 && age <= 21 && newOvr >= 58 && (newTier <= 3 || newOvr >= 64) && Math.random() < 0.2) {
      p.u21Caps = (p.u21Caps || 0) + rand(1, 2);
      if (Math.random() < 0.18) p.u21Goals = (p.u21Goals || 0) + 1;
    }
  }

  function nationalBarText(p) {
    var bits = [];
    var isF = (p && p.gender === 'f');
    if ((p.caps || 0) > 0) {
      bits.push(p.caps + (isF ? ' pres. naz. femm.' : ' pres. naz.') + ' · ⚽ ' + (p.natGoals || 0) + ' · 🅐 ' + (p.natAst || 0));
    }
    if ((p.u21Caps || 0) > 0) bits.push((isF ? 'U23 ' : 'U21 ') + p.u21Caps + ' pres.');
    if ((p.u19Caps || 0) > 0) bits.push('U19 ' + p.u19Caps + ' pres.');
    return bits.length ? bits.join(' · ') : (isF ? 'Nazionale Femminile: non convocata' : 'Nazionale: non convocato');
  }

  function poolFits(p, tier, used, opts) {
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var age = (p && p.age) || 16;
    return (state.clubs || []).filter(function (c) {
      if (!c || !c.n || used[c.n]) return false;
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== pGender) return false;
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
      if (clubLeagueTier(c) !== Number(tier)) return false;
      if (!isLegalTier(c, Number(tier)) && !c.world) return false;
      return playerFitsClub(p, c, opts);
    });
  }

  function transferOffers(p) {
    var last = p.history[p.history.length - 1];
    var isFirstStep = isUnsignedRow(last);
    var used = {};
    var offers = [];
    var pGender = (p && p.gender) || state.trialGender || 'm';

    if (isFirstStep) {
      resetClubsToCatalog();
      var youthPool = clubsByCatalogTier(10, pGender).filter(function (c) {
        return !c.world;
      });
      var a = takeUniqueClub(used, youthPool);
      if (a) {
        a = Object.assign({}, a);
        a.t = 10;
        a.l = a.catalogL || a.l || (pGender === 'f' ? 'PRIMAVERA FEMMINILE' : 'PRIMAVERA 1');
        a.isYouth = true;
        a.isLoan = false;
        offers.push(a);
      }
      var eccTier = pGender === 'f' ? 4 : 5;
      var ecc = takeUniqueClub(used, clubsByCatalogTier(eccTier, pGender));
      if (ecc) {
        ecc = Object.assign({}, ecc);
        ecc.t = eccTier;
        ecc.l = ecc.catalogL || ecc.l;
        ecc.isYouth = false;
        ecc.isLoan = false;
        offers.push(ecc);
      }
      var dTier = pGender === 'f' ? 3 : 4;
      var dClub = takeUniqueClub(used, clubsByCatalogTier(dTier, pGender));
      if (dClub) {
        dClub = Object.assign({}, dClub);
        dClub.t = dTier;
        dClub.l = dClub.catalogL || dClub.l;
        dClub.isYouth = false;
        dClub.isLoan = false;
        offers.push(dClub);
      }
      return fillFirstOffers(used, offers, p).map(assertStartOffer);
    }

    var cur = liveClub(p.club) || p.club;
    var curT = clubLeagueTier(cur);
    var age = p.age || 16;
    var isOverYouth = isYouthClub(cur) && (age > 20 || (isU19Club(cur) && age > 19));
    var isOverU23 = isU23Club(cur) && age > 23;

    if (cur && cur.n && !isOverYouth && !isOverU23) {
      used[cur.n] = true;
      var stay = Object.assign({}, cur);
      stay.isStay = true;
      stampSeasonMoveBadge(stay);
      if (cur.failed || cur.justFailed) stay.failed = true;
      var playedT = last ? clubLeagueTier({ l: last.league, t: last.t }) : 0;
      var nowT = clubLeagueTier(stay);
      if (playedT && nowT >= playedT + 2) {
        stay.failed = true;
        stay.justFailed = true;
        stay.isRelegated = false;
        stay.isPromoted = false;
        if (!stay.rebuild) stay.rebuild = cur.rebuild || 'debole';
        if (cur && !cur.failed) {
          cur.failed = true;
          cur.justFailed = true;
          cur.rebuild = stay.rebuild;
        }
      }
      if (isU23Club(stay)) {
        stay.isU23 = true;
        stay.isYouth = false;
      } else if (isYouthContext(p, stay, p.age)) {
        stay.isYouth = true;
      }
      offers.push(stay);
      if (isPendingFailMarket(p) || stay.failed) {
        return fillFailMarketOffers(p, stay, used);
      }
      if (isU23Club(cur) && canCallUpFromU23(p, cur) && offers.length < 3) {
        var callUp = makeCallUpOffer(p, cur, used);
        if (callUp) offers.push(callUp);
      }
    } else if (cur && cur.n && (isOverYouth || isOverU23)) {
      used[cur.n] = true;
      var parentClub = findFirstTeam(cur);
      if (parentClub && !used[parentClub.n]) {
        var callUpOffer = makeCallUpOffer(p, cur, used);
        if (callUpOffer) offers.push(callUpOffer);
      }
    }

    var jump = typeof p.lastJump === 'number' ? p.lastJump : jumpFromForm(p.lastForm || 0, p.age);
    if (jump > 1) jump = 1;
    if (jump < -1) jump = -1;
    var par = leagueParOvr(cur);
    var center = curT;
    if ((p.ovr || 49) >= par + 4) center = clampTier(curT - 1);
    else if ((p.ovr || 49) <= par - 8) center = clampTier(curT + 1);
    var target = clampTier(center + jump);
    if (Math.abs(target - curT) > 1) target = clampTier(curT + (target < curT ? -1 : 1));

    var band = [curT, target].filter(function (t, i, arr) { return arr.indexOf(t) === i; });
    if (band.length === 1) {
      var side = jump !== 0 ? clampTier(curT + jump) : clampTier(curT + (Math.random() < 0.45 ? 1 : 0));
      if (side !== band[0] && Math.abs(side - curT) <= 1) band.push(side);
    }
    if (isAcademyProspect(p)) {
      band = band.filter(function (t) { return t <= 3; });
      if (curT === 1 && band.indexOf(2) < 0) band.push(2);
      if (curT === 1 && (p.ovr || 49) < 56 && band.indexOf(3) < 0) band.push(3);
      if (!band.length) band = [2];
    }

    var promoPool = (state.clubs || []).filter(function (c) {
      if (!c.justPromoted || !c.n || used[c.n]) return false;
      var cG = c.g === 'f' ? 'f' : 'm';
      if (cG !== pGender) return false;
      if (isYouthClub(c) && (age > 20 || (isU19Club(c) && age > 19))) return false;
      if (isU23Club(c) && age > 23) return false;
      var t = clubLeagueTier(c);
      if (band.indexOf(t) < 0) return false;
      return playerFitsClub(p, c, { allowYouth: age <= 19 });
    });
    if (promoPool.length && offers.length < 3 && jump <= 0) {
      var pc = takeUniqueClub(used, promoPool);
      if (pc) {
        pc = stampSeasonMoveBadge(Object.assign({}, pc));
        offers.push(pc);
      }
    }

    if (isAcademyProspect(p) && offers.length < 3) {
      if (curT === 1 || jump > 0) {
        var topB = takeTopOfTier(used, 2, p);
        if (topB) {
          topB.isLoan = (p.age || 16) <= 21;
          offers.push(topB);
        }
      }
      if (offers.length < 3 && (curT >= 2 || (p.ovr || 49) < 56)) {
        var topC = takeTopOfTier(used, 3, p);
        if (topC) {
          topC.isLoan = (p.age || 16) <= 21 && curT === 1;
          offers.push(topC);
        }
      }
    }

    var filled = fillOffersFromTiers(used, offers, 3, band, p);
    filled.forEach(function (o) {
      if (o.isStay) return;
      if (o.isCallUp) {
        o.isYouth = false;
        o.isLoan = false;
        o.isJumpUp = true;
        return;
      }
      var t = clubLeagueTier(o);
      if (t < curT) o.isJumpUp = true;
      else if (t > curT) o.isJumpDown = true;
      o.isYouth = t === 1 && isBigYouthClub(o) && isYouthContext(p, o, p.age) && !isU23Club(o);
      if (o.isYouth) o.isLoan = false;
      else if (p.age <= 21 && t < curT) o.isLoan = true;
      else if (p.age <= 23 && t <= curT && p.ovr < leagueParOvr(o) - 8) o.isLoan = Math.random() < 0.55;
      else o.isLoan = false;
    });
    return filled.map(sanitizeOfferClub);
  }

  function fillFirstOffers(used, offers, p) {
    var pGender = (p && p.gender) || state.trialGender || 'm';
    var order = pGender === 'f' ? [10, 4, 3, 2] : [10, 5, 4, 3];
    var i = 0;
    while (offers.length < 3 && i < 16) {
      var pool = clubsByCatalogTier(order[Math.min(i, order.length - 1)], pGender);
      var c = takeUniqueClub(used, pool);
      if (!c) {
        i++;
        continue;
      }
      if (c.world) continue;
      c = Object.assign({}, c);
      c.t = c.catalogT != null ? c.catalogT : clubLeagueTier(c);
      c.l = c.catalogL || c.l;
      c.isYouth = Number(c.t) === 10 || isYouthClub(c);
      c.isLoan = false;
      offers.push(c);
      i++;
    }
    return offers.slice(0, 3);
  }

  function fillOffersFromTiers(used, offers, need, tiers, p) {
    var i = 0;
    var safe = (tiers && tiers.length) ? tiers.slice() : [4];
    var age = (p && p.age) || 16;
    while (offers.length < need && i < 16) {
      var t = safe[Math.min(i, safe.length - 1)];
      if (p && isAcademyProspect(p) && (t === 2 || t === 3)) {
        var topPick = takeTopOfTier(used, t, p);
        if (topPick) {
          offers.push(topPick);
          i++;
          continue;
        }
      }
      var pool = p ? poolFits(p, t, used, { allowYouth: age <= 19, academyPath: isAcademyProspect(p) }) : clubsByTier(t);
      var c = takeUniqueClub(used, pool);
      if (!c && i >= safe.length) {
        var near = safe[0];
        c = takeUniqueClub(used, p ? poolFits(p, near, used, { allowYouth: age <= 19 }) : clubsByTier(near));
      }
      if (c) offers.push(c);
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
    if (upper.indexOf('ECCELLENZA') === 0) {
      var restE = l.replace(/^ECCELLENZA\s*[·.]\s*/i, '').trim();
      return restE && restE.toUpperCase() !== 'ECCELLENZA' ? 'Eccellenza · ' + restE : 'Eccellenza';
    }
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
    } else if (l.indexOf('ECCELLENZA') >= 0) {
      src = 'immagini/squadre-loghi/eccellenza.png';
      alt = 'Eccellenza';
    } else if (l.indexOf('PROMOZIONE') >= 0) {
      src = 'immagini/squadre-loghi/promozione.png';
      alt = 'Promozione';
    } else if (l.indexOf('PRIMA CATEGORIA') >= 0) {
      src = 'immagini/squadre-loghi/prima-categoria.png';
      alt = 'Prima Categoria';
    } else if (l.indexOf('SECONDA CATEGORIA') >= 0) {
      src = 'immagini/squadre-loghi/seconda-categoria.png';
      alt = 'Seconda Categoria';
    } else if (l.indexOf('TERZA CATEGORIA') >= 0) {
      src = 'immagini/squadre-loghi/terza-categoria.png';
      alt = 'Terza Categoria';
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
        '?v=20260827_TCATLND1" alt="' +
        esc(alt) +
        '" onerror="this.style.display=\'none\';" />'
      );
    }
    return '';
  }

  var PITCH_SVG = '<svg class="es-mg-icon-pitch" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><circle cx="12" cy="12" r="3"></circle></svg>';

  function clubCardTone(name) {
    var n = String(name || '').toUpperCase();
    var map = [
      ['MILAN', 'linear-gradient(180deg,#6e1822 0%,#2a0a10 100%)'],
      ['INTER', 'linear-gradient(180deg,#12305f 0%,#0a162c 100%)'],
      ['JUVENTUS', 'linear-gradient(180deg,#2c2c2c 0%,#111111 100%)'],
      ['NAPOLI', 'linear-gradient(180deg,#0f4e8a 0%,#0a2444 100%)'],
      ['ROMA', 'linear-gradient(180deg,#6b1d1d 0%,#2a0e0e 100%)'],
      ['LAZIO', 'linear-gradient(180deg,#1a4a7a 0%,#0c2238 100%)'],
      ['ATALANTA', 'linear-gradient(180deg,#173a6b 0%,#0b1628 100%)'],
      ['FIORENTINA', 'linear-gradient(180deg,#4a2a78 0%,#1c1233 100%)'],
      ['SAMPDORIA', 'linear-gradient(180deg,#143a6b 0%,#0b1a30 100%)'],
      ['TORINO', 'linear-gradient(180deg,#6b1c24 0%,#2a0c10 100%)'],
      ['BOLOGNA', 'linear-gradient(180deg,#6b1824 0%,#1f0a10 100%)'],
      ['UDINESE', 'linear-gradient(180deg,#1c3a38 0%,#0c1818 100%)'],
      ['EMPOLI', 'linear-gradient(180deg,#1a3f73 0%,#0c1c34 100%)'],
      ['PARMA', 'linear-gradient(180deg,#3a2e12 0%,#1a1408 100%)'],
      ['GENOA', 'linear-gradient(180deg,#6b1820 0%,#220a0e 100%)'],
      ['CAGLIARI', 'linear-gradient(180deg,#6b1c1c 0%,#240c0c 100%)'],
      ['LECCE', 'linear-gradient(180deg,#5a4a12 0%,#241c08 100%)'],
      ['MONACO', 'linear-gradient(180deg,#6b1820 0%,#2a0c10 100%)'],
      ['DORTMUND', 'linear-gradient(180deg,#5a4308 0%,#1c1606 100%)'],
      ['MONTERREY', 'linear-gradient(180deg,#14283f 0%,#0a1420 100%)'],
      ['ATLETICO', 'linear-gradient(180deg,#6b1824 0%,#240a10 100%)'],
      ['AVELLINO', 'linear-gradient(180deg,#145232 0%,#0a2416 100%)'],
      ['CATANZARO', 'linear-gradient(180deg,#5a2a10 0%,#241208 100%)'],
      ['MODENA', 'linear-gradient(180deg,#4a3a0c 0%,#1c1606 100%)'],
      ['ASCOLI', 'linear-gradient(180deg,#3a3010 0%,#161208 100%)'],
      ['PALERMO', 'linear-gradient(180deg,#4a1a4a 0%,#1c0c1c 100%)'],
      ['CHIEVO', 'linear-gradient(180deg,#4a3a0c 0%,#1a1606 100%)']
    ];
    var i;
    for (i = 0; i < map.length; i++) {
      if (n.indexOf(map[i][0]) >= 0) return map[i][1];
    }
    var h = 0;
    for (i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    var hues = [350, 220, 150, 0, 270, 30, 200, 340, 210, 25, 195];
    var hue = hues[h % hues.length];
    return 'linear-gradient(180deg, hsla(' + hue + ',48%,16%,1), hsla(' + hue + ',42%,8%,1))';
  }

  function renderCareerSummary() {
    state.step = 'summary';
    var p = state.player || load(LS.career, null);
    if (!p) {
      renderLanding();
      return;
    }
    repairCareerOvrAndTier(p);
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
        (c.logo
          ? '<img class="es-mg-sum-club-mark" src="' + esc(c.logo) + '" alt="" aria-hidden="true">'
          : '') +
        '<div class="es-mg-sum-club-top">' +
        (c.logo
          ? '<img class="es-mg-sum-club-logo" src="' + esc(c.logo) + '" alt="" onerror="this.style.display=\'none\'">'
          : '<div class="es-mg-sum-club-logo"></div>') +
        '<div class="es-mg-sum-club-name">' + esc(c.name) + '</div>' +
        '</div>' +
        '<div class="es-mg-sum-club-bottom">' +
        '<div class="es-mg-sum-club-stats">' +
        '<div><span>PR</span><b>' + c.apps + '</b></div>' +
        '<div><span>GOL</span><b>' + c.goals + '</b></div>' +
        '<div><span>ASS</span><b>' + c.assists + '</b></div>' +
        '</div>' +
        (cups ? '<div class="es-mg-sum-club-cups">' + cups + '</div>' : '') +
        '</div></div>'
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
      '<button type="button" class="es-mg-float-close" id="es-mg-x">Indietro</button>' +
        '<div class="es-mg-sum">' +
        '<div class="es-mg-sum-board">' +
        '<div class="es-mg-sum-top">' +
        '<div class="es-mg-sum-card es-mg-sum-player">' +
        '<div class="es-mg-sum-player-head">' +
        '<div>' +
        '<p class="es-mg-sum-kicker">Carriera conclusa</p>' +
        '<h2 class="es-mg-sum-name">' + esc(p.surname || 'Giocatore') + '</h2>' +
        '<div class="es-mg-sum-tags">' +
        '<span class="es-mg-tag">#' + p.number + '</span>' +
        '<span class="es-mg-tag green">' + esc(p.posLabel || posLabel(p.position) || '') + '</span>' +
        '</div></div>' +
        '<div class="es-mg-sum-player-meta">' +
        '<div class="es-mg-sum-val">VALORE<b>\u20ac' + formatValue(p.valueM) + '</b></div>' +
        '<div class="es-mg-sum-ovr c' + ovrColor(p.ovr) + '"><span>OVR</span><strong>' + p.ovr + '</strong></div>' +
        '</div></div>' +
        '<div class="es-mg-sum-stats">' +
        '<div><span>PR</span><b>' + totApps + '</b></div>' +
        '<div><span>GOL</span><b>' + totGoals + '</b></div>' +
        '<div><span>ASS</span><b>' + totAssists + '</b></div>' +
        '</div></div>' +
        '<div class="es-mg-sum-card es-mg-sum-nat">' +
        '<p class="es-mg-sum-kicker">Nazionale</p>' +
        '<h2 class="es-mg-sum-name es-mg-sum-nat-name">' + flagOf(p.nationCode) + ' ' + esc(p.nation || 'Italia') + '</h2>' +
        '<div class="es-mg-sum-stats">' +
        '<div><span>PR</span><b>' + (p.caps || 0) + '</b></div>' +
        '<div><span>GOL</span><b>' + (p.natGoals || 0) + '</b></div>' +
        '<div><span>ASS</span><b>' + (p.natAst || 0) + '</b></div>' +
        '</div>' +
        ((p.u21Caps || p.u19Caps)
          ? '<div class="es-mg-sum-youthcaps">U21 ' + (p.u21Caps || 0) + ' · U19 ' + (p.u19Caps || 0) + '</div>'
          : '') +
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
        if (!window.confirm('Vuoi davvero cancellare ' + savedCareerLabel(p) + '?')) return;
        wipeCareerSave();
        state.position = null;
        hydrateIdentity();
        renderLanding();
      };
    }
  }

  // ---------- CAREER ----------
  function renderCareer(animateNew) {
    state.step = 'career';
    if (root && root.classList) root.classList.remove('is-resolving');
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
      scrubHistoryFailMarks(p);
      repairCareerOvrAndTier(p);
    }
    if (p.club && !p.club.isFree) {
      p.club = liveClub(p.club) || p.club;
      clampClubToHistory(p.club);
    }
    if (!isFirstStep && state.clubs && state.clubs.length) snapshotLeagueBoard(p);
    if ((p.age || 16) < 21) {
      p.caps = 0;
      p.natGoals = 0;
      p.natAst = 0;
    }
    repairCareerOvrAndTier(p);
    p.valueM = calcRealisticValueM(p.ovr, p.age, p.club);
    var last = lastPre;
    var offers = getMarketOffers(p);
    
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
          : (loanMove || h.isLoan ? '<span class="es-mg-transfer-icon" title="Prestito">↳</span>' : '') +
            (h.logo
              ? '<img src="' + esc(h.logo) + '" alt="" class="es-mg-club-logo" onerror="this.style.display=\'none\'" />'
              : '') +
            '<span class="es-mg-row-clubname" title="' + esc(h.club) + '">' + esc(h.club) + '</span>' +
            (h.suspended ? '<span class="es-mg-row-mark is-sus" title="Sospeso">S</span>' : '') +
            (h.failed ? '<span class="es-mg-row-mark is-fail" title="Fallita' + (h.rebuild === 'forte' ? ' · progetto forte' : h.rebuild === 'debole' ? ' · progetto debole' : '') + '">F</span>' : '') +
            cupsSvgHtml +
            (h.recap ? '<span class="es-mg-row-recap">' + esc(h.recap) + '</span>' : '');
        var prevOvr = idx > 0 ? p.history[idx - 1].ovr : h.ovr;
        var ageTone = ' c' + ovrColor(h.ovr);
        var newRows = animateNew ? Math.max(1, stepYears()) : 0;
        var isFresh = animateNew && !isFreeRow && idx >= p.history.length - newRows;

        return (
          '<div class="es-mg-row' +
          (isFresh ? ' is-new' : '') +
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
      var pendingTxt = p.pendingDeal
        ? 'In trattativa\u2026'
        : p.pendingCaptain && !isFirstStep
          ? 'Fascia di capitano\u2026'
          : p.pendingRoleChange && !isFirstStep
            ? 'Cambio ruolo\u2026'
            : p.pendingDilemma && !isFirstStep
              ? 'Decisione di carriera\u2026'
              : 'Scegliendo squadra\u2026';
      rows +=
        '<div class="es-mg-row is-pending">' +
        '<div class="es-mg-row-age">' + nextAge + '</div>' +
        '<div class="es-mg-row-club"><span class="es-mg-muted"><span class="es-mg-qmark">?</span> ' + pendingTxt + '</span></div>' +
        '<div class="es-mg-row-ovr"><span class="es-mg-ovr-pill">—</span></div>' +
        '<div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div>' +
        '</div>';
    }

    var failMkt = !isFirstStep && isPendingFailMarket(p);
    var offerHtml = offers
      .map(function (o, i) {
        var stay = !!(o.isStay || (p.club && o.n === p.club.n && !isFirstStep));
        var btnTitle = isFirstStep
          ? 'Firma per'
          : stay
            ? 'Resta a'
            : o.isCallUp
              ? 'Prima squadra'
              : o.isLoan
                ? 'In prestito a'
                : 'Acquisto:';
        o = isFirstStep ? assertStartOffer(Object.assign({}, o)) : sanitizeOfferClub(o);
        if (isFirstStep) o.isLoan = false;
        var formattedLeague = shortLeague(o.l, o.n);
        var leagueLogoTag = getLeagueLogoImg(o.l);
        var badges = [];
        if (o.failed) {
          badges.push('<span class="es-mg-offer-badge-fail">Fallita</span>');
          badges.push(o.rebuild === 'forte'
            ? '<span class="es-mg-offer-badge-up">Progetto forte</span>'
            : '<span class="es-mg-offer-badge-down">Progetto debole</span>');
        } else {
          if (o.isCallUp) badges.push('<span class="es-mg-offer-badge-up">Salto in A</span>');
          else if (isCaptainOf(p, o) && stay) badges.push('<span class="es-mg-offer-badge-up">Capitano</span>');
          else if (o.existingContract) badges.push('<span class="es-mg-offer-badge-youth">In contratto</span>');
          else if (isU23Club(o)) badges.push('<span class="es-mg-offer-badge-u23">Seconda squadra</span>');
          else if (o.isYouth) badges.push('<span class="es-mg-offer-badge-youth">Giovanili</span>');
          else if (o.isLoan) badges.push('<span class="es-mg-offer-badge-loan">Prestito</span>');
          else if (!stay && !isFirstStep) badges.push('<span class="es-mg-offer-badge-buy">Acquisto</span>');
          if (o.isPromoted) badges.push('<span class="es-mg-offer-badge-up">Promossa</span>');
          else if (o.isRelegated) badges.push('<span class="es-mg-offer-badge-down">Retrocessa</span>');
          else if (o.isJumpUp) badges.push('<span class="es-mg-offer-badge-up">Salto</span>');
          else if (o.isJumpDown) badges.push('<span class="es-mg-offer-badge-down">Calo</span>');
        }
        var extraBadge = badges.slice(0, 2).join('');
        var failLine = o.failed ? ('Fallita · ora ' + formattedLeague) : formattedLeague;
        var prevw = offerPreview(p, o);
        var dO = prevw.ovr - prevw.fromOvr;
        var dV = prevw.value - prevw.fromValue;
        var oCls = dO < 0 ? 'is-down' : dO > 0 ? 'is-up' : 'is-flat';
        var vCls = dV < 0 ? 'is-down' : dV > 0 ? 'is-up' : 'is-flat';
        if (!o.deal) attachOfferDeal(p, o);
        var deal = o.deal || {};
        var adjustHtml =
          '<span class="es-mg-offer-adjust">' +
          '<span class="' + oCls + '">OVR ' + prevw.fromOvr + ' \u2192 ' + prevw.ovr + '</span>' +
          '<span class="' + vCls + '">\u20ac' + formatValue(prevw.fromValue) + ' \u2192 \u20ac' + formatValue(prevw.value) + '</span>' +
          '<span class="is-flat">' + (deal.years || 1) + ' anni · €' + formatWage(deal.wage) + '</span>' +
          '</span>';
        return (
          '<button type="button" class="es-mg-offer' + (o.isLoan ? ' is-loan-offer' : '') + (o.isPromoted ? ' is-promo-offer' : '') + (o.failed ? ' is-fail-offer' : '') + (failMkt && !stay ? ' is-fail-alt' : '') + '" data-idx="' + i + '">' +
          '<span class="es-mg-offer-title">' + btnTitle + ' <b>' + esc(o.n) + '</b></span>' +
          '<span class="es-mg-offer-logo-wrap">' +
          (o.o
            ? '<img src="' + esc(o.o) + '" alt="" class="es-mg-offer-logo" onerror="this.style.display=\'none\'" />'
            : '<span class="es-mg-offer-fallback"><span class="es-mg-qmark">?</span></span>') +
          '</span>' +
          '<span class="es-mg-offer-league">' + leagueLogoTag + ' ' + esc(failLine) + '</span>' +
          '<span class="es-mg-offer-badges">' + extraBadge + '</span>' +
          adjustHtml +
          '</button>'
        );
      })
      .join('');

    // Titolo e descrizione del box trasferimenti
    var transferBoxTitle = isFirstStep ? 'OFFERTA DAL SETTORE GIOVANILE' : failMkt ? 'Squadra fallita' : 'Finestra di mercato';
    var transferBoxDesc = isFirstStep
      ? (p.trialFailed
          ? ('Il provino a ' + p.trialFailed + ' non è andato a buon fine. Ecco tre offerte da svincolato.')
          : 'Anche le big hanno il settore giovanile. Puoi firmare per una Primavera di Serie A o per un club di categoria più bassa, e poi restare a crescere oppure cambiare.')
      : failMkt
        ? 'La società è fallita. Se resti, overall e valore crollano. Altrimenti regola overall e prezzo sulle offerte delle altre competizioni.'
        : '';

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
    function renderDealBox(deal, animate) {
      var o = deal.offer || {};
      var title = o.isStay ? 'Rinnovo contratto' : o.isLoan ? 'Trattativa prestito' : 'Trattativa';
      return (
        '<div class="es-mg-transfer es-mg-cantera-box es-mg-deal-box' + (animate ? ' slide-up' : '') + '">' +
        '<h3>' + title + '</h3>' +
        '<p>Contratto con <strong>' + esc(o.n || 'Club') + '</strong></p>' +
        '<div class="es-mg-deal-terms">' +
        '<span>' + (deal.years || 1) + ' anni</span>' +
        '<span>€' + formatWage(deal.wage) + '</span>' +
        '</div>' +
        (deal.note ? '<p class="es-mg-deal-note">' + esc(deal.note) + '</p>' : '') +
        (deal.status === 'withdrawn'
          ? '<div class="es-mg-deal-actions"><button type="button" class="es-mg-btn-half ghost" id="es-mg-deal-back">Altre offerte</button></div>'
          : '<div class="es-mg-deal-actions">' +
            '<button type="button" class="es-mg-btn-half primary" id="es-mg-deal-ok">Accetta</button>' +
            (deal.captainLock
              ? ''
              : '<button type="button" class="es-mg-btn-half ghost" id="es-mg-deal-money">Chiedi più soldi</button>') +
            '<button type="button" class="es-mg-btn-half ghost" id="es-mg-deal-years">Chiedi +1 anno</button>' +
            '<button type="button" class="es-mg-btn-half ghost" id="es-mg-deal-no">Rifiuta</button>' +
            '</div>') +
        '</div>'
      );
    }
    function renderCaptainBox(cap, animate) {
      return (
        '<div class="es-mg-dilemma' + (animate ? ' slide-up' : '') + '" id="es-mg-cap-box">' +
        '<h3>Fascia di capitano</h3>' +
        '<p><strong>' + esc(cap.club || '') + '</strong> ti offre la fascia. Se accetti, resti alle condizioni del club: <strong>niente aumento di stipendio</strong>.</p>' +
        '<div class="es-mg-dilemma-grid">' +
        '<button type="button" class="es-mg-dilemma-card" data-captain="yes">' +
        '<span class="es-mg-dilemma-name">Accetta la fascia</span>' +
        '<span class="es-mg-dilemma-pill">Capitano, stipendio del club</span></button>' +
        '<button type="button" class="es-mg-dilemma-card" data-captain="no">' +
        '<span class="es-mg-dilemma-name">Rifiuta</span>' +
        '<span class="es-mg-dilemma-pill is-mute">Restano le trattative normali</span></button>' +
        '</div></div>'
      );
    }
    function renderRoleBox(shift, animate) {
      return (
        '<div class="es-mg-dilemma' + (animate ? ' slide-up' : '') + '" id="es-mg-role-box">' +
        '<h3>Cambio ruolo</h3>' +
        '<p>L\'allenatore ti vede meglio da <strong>' + esc(shift.to) + '</strong> invece che da ' + esc(shift.from) + '.</p>' +
        '<div class="es-mg-dilemma-grid">' +
        '<button type="button" class="es-mg-dilemma-card" data-role="keep">' +
        '<span class="es-mg-dilemma-name">Resta ' + esc(shift.from) + '</span>' +
        '<span class="es-mg-dilemma-pill is-mute">Nessun cambio</span></button>' +
        '<button type="button" class="es-mg-dilemma-card" data-role="change">' +
        '<span class="es-mg-dilemma-name">Diventa ' + esc(shift.to) + '</span>' +
        '<span class="es-mg-dilemma-pill">Nuovo ruolo in campo</span></button>' +
        '</div></div>'
      );
    }
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
    } else if (p.pendingDeal && p.pendingDeal.offer) {
      leftBottom = renderDealBox(p.pendingDeal, animateNew);
    } else if (p.pendingCaptain && !isFirstStep) {
      leftBottom = renderCaptainBox(p.pendingCaptain, animateNew);
    } else if (p.pendingRoleChange && !isFirstStep) {
      leftBottom = renderRoleBox(p.pendingRoleChange, animateNew);
    } else if (p.pendingDilemma && !isFirstStep) {
      leftBottom = renderDilemmaBox(careerEventById(p.pendingDilemma), animateNew);
    } else {
      leftBottom =
        '<div class="es-mg-transfer es-mg-cantera-box' + (animateNew ? ' slide-up' : '') + (failMkt ? ' is-fail-market' : '') + '">' +
        '<h3>' + transferBoxTitle + '</h3>' +
        (transferBoxDesc ? '<p>' + transferBoxDesc + '</p>' : '') +
        '<div class="es-mg-offers es-mg-offers-grid">' + offerHtml + '</div></div>';
    }
    openShell(
      '<button type="button" class="es-mg-float-close" id="es-mg-x">Indietro</button>' +
        (animateNew ? '<div class="es-mg-season-flash" aria-hidden="true"></div>' : '') +
        '<div class="es-mg-career">' +
        '<div class="es-mg-career-board">' +
        '<div class="es-mg-career-left">' +
        '<div class="es-mg-player-card' + (animateNew ? ' pop' : '') + '">' +
        '<div class="es-mg-player-card-top">' +
        '<div class="es-mg-ovr-big c' + ovrColor(p.ovr) + (animateNew ? ' is-pop' : '') + '" id="es-mg-ovr-big"><span>OVR</span><strong id="es-mg-ovr-num">' + p.ovr + '</strong></div>' +
        '<div class="es-mg-player-meta">' +
        '<div class="es-mg-player-tags">' +
        '<span class="es-mg-tag">' + flagOf(p.nationCode) + ' ' + esc(p.nationCode || 'IT') + '</span>' +
        '<span class="es-mg-tag green">#' + p.number + '</span>' +
        '<span class="es-mg-tag green" title="' + esc(p.posLabel || posLabel(p.position) || p.position) + '">' + esc(p.posLabel || posLabel(p.position) || p.position) + '</span>' +
        (p.isCaptain ? '<span class="es-mg-tag green" title="Capitano">C</span>' : '') +
        (p.foot ? '<span class="es-mg-tag">' + (p.foot === 'left' ? 'Piede sinistro' : 'Piede destro') + '</span>' : '') +
        (p.gender === 'f' ? '<span class="es-mg-tag is-fem" style="background:#ec4899;color:#fff;border-color:#db2777;">' + femaleSymbolSvg(15, 15, '#fff') + ' Femminile</span>' : '<span class="es-mg-tag" style="background:#0284c7;color:#fff;border-color:#0369a1;">' + maleSymbolSvg(15, 15, '#fff') + ' Maschile</span>') +
        '</div>' +
        '<div class="es-mg-player-name">' + esc(p.surname || 'Giocatore') + '</div>' +
        clubDisplayCard +
        '</div>' +
        '<div class="es-mg-player-side">' +
        '<div>ETÀ <b>' + p.age + '</b></div>' +
        '<div>VALORE <b>€' + formatValue(p.valueM) + '</b></div>' +
        (p.wageWeek
          ? '<div>INGAGGIO <b>€' + formatWage(p.wageWeek) + '</b></div>'
          : '') +
        (p.contractYears
          ? '<div>CONTRATTO <b>' + p.contractYears + (p.contractYears === 1 ? ' anno' : ' anni') + '</b></div>'
          : '') +
        '</div>' +
        '</div>' +
        /* Totali carriera con icona campetto da calcio per PJ */
        '<div class="es-mg-tot-stats">' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">PR</span><b>' + PITCH_SVG + ' <span id="es-mg-tot-apps">' + totApps + '</span></b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">GOL</span><b>⚽ <span id="es-mg-tot-gls">' + totGoals + '</span></b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">ASS</span><b>🅐 <span id="es-mg-tot-ast">' + totAssists + '</span></b></div>' +
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
        '<span>' + esc(nationalBarText(p)) + '</span>' +
        '</div>' +
        '</div></div></div>'
    );
    bindClose();
    function playPickedOffer(offer) {
      if (root.classList && root.classList.contains('is-resolving')) return;
      root.classList.add('is-resolving');
      var prevOvr = p.ovr;
      var prevApps = totApps;
      var prevG = totGoals;
      var prevA = totAssists;
      setTimeout(function () {
        try {
          seasonSim(p, offer);
          save(LS.career, p);
          renderCareer(true);
          tickNumber(document.getElementById('es-mg-ovr-num'), prevOvr, p.ovr, 480);
          tickNumber(document.getElementById('es-mg-tot-apps'), prevApps, p.history.reduce(function (a, b) { return a + (b.apps || 0); }, 0), 520);
          tickNumber(document.getElementById('es-mg-tot-gls'), prevG, p.history.reduce(function (a, b) { return a + (b.goals || 0); }, 0), 520);
          tickNumber(document.getElementById('es-mg-tot-ast'), prevA, p.history.reduce(function (a, b) { return a + (b.assists || 0); }, 0), 520);
        } catch (errPick) {
          if (root && root.classList) root.classList.remove('is-resolving');
        }
        setTimeout(function () {
          var tl = document.getElementById('es-mg-timeline');
          if (tl) tl.scrollTop = tl.scrollHeight;
        }, 80);
      }, 220);
    }
    function confirmWipeAndRestart() {
      if (!window.confirm('Vuoi davvero cancellare ' + savedCareerLabel(p) + '?')) return;
      wipeCareerSave();
      state.position = null;
      hydrateIdentity();
      renderLanding();
    }
    var restart = document.getElementById('es-mg-restart');
    if (restart) restart.onclick = confirmWipeAndRestart;
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
      var steps = 5 + rand(0, 2);
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
          setTimeout(done, 220);
          return;
        }
        setTimeout(tick, 55);
      }
      tick();
    }

    root.querySelectorAll('.es-mg-dilemma-card').forEach(function (btn) {
      btn.onclick = function () {
        if (btn.getAttribute('data-role')) return;
        if (btn.getAttribute('data-captain')) return;
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
        if (root.classList && root.classList.contains('is-resolving')) return;
        var stay = !!(offer.isStay || (p.club && offer.n === p.club.n && !isFirstStep));
        var skipNego = stay && (p.contractYears > 0) && !offer.failed && !isPendingFailMarket(p);
        if (skipNego) {
          btn.classList.add('is-picked');
          playPickedOffer(offer);
          return;
        }
        attachOfferDeal(p, offer);
        p.pendingDeal = startDeal(p, offer);
        save(LS.career, p);
        renderCareer(false);
      };
    });
    var dealOk = document.getElementById('es-mg-deal-ok');
    var dealMoney = document.getElementById('es-mg-deal-money');
    var dealYears = document.getElementById('es-mg-deal-years');
    var dealNo = document.getElementById('es-mg-deal-no');
    var dealBack = document.getElementById('es-mg-deal-back');
    if (dealOk && p.pendingDeal) {
      dealOk.onclick = function () {
        var d = p.pendingDeal;
        var offer = d.offer;
        offer.signedWage = d.wage;
        offer.signedYears = d.years;
        p.pendingDeal = null;
        playPickedOffer(offer);
      };
    }
    if (dealMoney && p.pendingDeal) {
      dealMoney.onclick = function () {
        p.pendingDeal = resolveDealAsk(p.pendingDeal, 'money');
        if (p.pendingDeal.status === 'withdrawn') {
          p.frozenOffers = (p.frozenOffers || []).filter(function (o) {
            return o.n !== (p.pendingDeal.offer && p.pendingDeal.offer.n);
          });
        }
        save(LS.career, p);
        renderCareer(false);
      };
    }
    if (dealYears && p.pendingDeal) {
      dealYears.onclick = function () {
        p.pendingDeal = resolveDealAsk(p.pendingDeal, 'years');
        if (p.pendingDeal.status === 'withdrawn') {
          p.frozenOffers = (p.frozenOffers || []).filter(function (o) {
            return o.n !== (p.pendingDeal.offer && p.pendingDeal.offer.n);
          });
        }
        save(LS.career, p);
        renderCareer(false);
      };
    }
    function backToOffers() {
      p.pendingDeal = null;
      save(LS.career, p);
      renderCareer(false);
    }
    if (dealNo) dealNo.onclick = backToOffers;
    if (dealBack) dealBack.onclick = backToOffers;
    root.querySelectorAll('[data-captain]').forEach(function (btn) {
      btn.onclick = function () {
        if (btn.getAttribute('data-captain') === 'yes' && p.pendingCaptain) {
          p.isCaptain = true;
          p.captainClub = p.pendingCaptain.club || (p.club && p.club.n) || '';
        }
        p.pendingCaptain = null;
        save(LS.career, p);
        renderCareer(false);
      };
    });
    root.querySelectorAll('[data-role]').forEach(function (btn) {
      btn.onclick = function () {
        var shift = p.pendingRoleChange;
        if (btn.getAttribute('data-role') === 'change' && shift) {
          p.position = shift.id;
          p.posLabel = posLabel(shift.id);
          p.roleChanged = true;
        }
        p.pendingRoleChange = null;
        save(LS.career, p);
        renderCareer(false);
      };
    });
    setTimeout(function () {
      var tl = document.getElementById('es-mg-timeline');
      if (tl) tl.scrollTop = tl.scrollHeight;
    }, 50);
  }

  function ovrColor(o) {
    o = Number(o) || 0;
    if (o >= 76) return 'blue';
    if (o >= 59) return 'red';
    if (o >= 43) return 'orange';
    if (o >= 30) return 'green';
    return 'bronze';
  }

  function tickNumber(el, from, to, ms) {
    if (!el) return;
    from = Number(from) || 0;
    to = Number(to) || 0;
    if (from === to) {
      el.textContent = String(to);
      return;
    }
    var start = Date.now();
    el.classList.add('is-tick');
    function step() {
      var p = Math.min(1, (Date.now() - start) / (ms || 420));
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.classList.remove('is-tick');
    }
    requestAnimationFrame(step);
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
        '?v=20260814_CAP" alt="" width="18" height="18" onerror="this.outerHTML=\'' +
        (n.f || '') +
        '\'" />'
      );
    }
    return n.f || '🏳️';
  }

  function formatValue(m) {
    var valEur = Math.round((Number(m) || 0) * 1000000);
    if (valEur >= 1000000) {
      var mln = valEur / 1000000;
      var str = (Math.round(mln * 10) / 10).toString().replace('.', ',');
      return str + ' Mln.€';
    }
    if (valEur >= 1000) {
      var k = valEur / 1000;
      var strK = (Math.round(k * 10) / 10).toString().replace('.', ',');
      return strK + ' mila€';
    }
    return Math.max(10, valEur) + '€';
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
        if (saved.surname) rememberSurname(saved.surname);
      }
    } catch (e) {}
    hydrateIdentity();
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
        if (saved.surname) rememberSurname(saved.surname);
      }
    } catch (e) {}
    hydrateIdentity();
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
    failMarket: {
      pending: isPendingFailMarket,
      preview: failMarketPreview,
      targetOvr: failMarketTargetOvr,
      apply: applyFailMarketMove
    },
    identity: {
      remember: rememberSurname,
      hydrate: hydrateIdentity,
      load: rememberedSurname
    },
    deal: {
      wage: weeklyWage,
      years: offerContractYears,
      attach: attachOfferDeal,
      start: startDeal,
      ask: resolveDealAsk,
      preview: offerPreview,
      formatWage: formatWage
    },
    u23: {
      isU23: isU23Club,
      parent: u23ParentName,
      canCallUp: canCallUpFromU23
    },
    fits: playerFitsClub,
    transferOffers: transferOffers,
    championPromo: {
      wonTier: leagueTrophyWonTier,
      apply: applyChampionPromotion
    },
    setClubs: function (list) { state.clubs = list || []; },
    version: '2026-08-20_MKT2'
  };

  document.addEventListener('elisee:user-revealed', function () {
    if (root && root.classList.contains('is-open') && state.step === 'hub') {
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
