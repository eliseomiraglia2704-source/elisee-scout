/**
 * ELISEE SCOUT — i18n
 * Lingua predefinita: Italiano. Preferenza in localStorage `elisee_lang`.
 */
(function () {
  const STORAGE_KEY = 'elisee_lang';
  const SUPPORTED = ['it', 'en', 'es', 'fr'];

  const LABELS = {
    it: 'IT',
    en: 'EN',
    es: 'ES',
    fr: 'FR'
  };

  const DICT = {
    it: {
      'nav.home': 'Home',
      'nav.about': 'Chi siamo',
      'nav.resume': 'Curriculum',
      'nav.portfolio': 'Bacheca',
      'nav.network': 'Network',
      'nav.ambassador': 'Ambassador',
      'nav.minigame': 'Minigiochi',
      'nav.elisee_world': 'Minigiochi',
      'nav.login': 'Accedi',
      'nav.signup': 'Iscriviti',
      'hero.role': 'Piattaforma di Recruitment Calcio',
      'home.aboutTitle': 'Digitalizziamo il\ncalciomercato dilettantistico',
      'home.aboutText': 'ELISEE SCOUT connette calciatori, societa, scout e staff tecnico in Italia con dossier verificati, dati GPS, video highlights e compliance GDPR.',
      'home.learnMore': 'Scopri di più',
      'home.resumeText': 'Metriche atletiche, governance anti-fake, badge di verifica e roadmap di conformità pre-lancio.',
      'home.statPillars': 'Pillar strategici',
      'home.statAgents': 'Agenti IA',
      'home.statGdpr': 'Privacy al primo posto',
      'home.statItaly': 'Focus dilettanti',
      'home.openResume': 'Apri curriculum',
      'home.portfolioTitle': 'Cosa puoi fare sulla piattaforma',
      'home.cardBacheca': 'Bacheca Annunci',
      'home.cardBachecaDesc': 'Provini, ingaggi e richieste di staff per dilettanti e giovanili.',
      'home.cardNetwork': 'Network Persone',
      'home.cardNetworkDesc': 'Trova calciatori, allenatori, scout e procuratori nella tua zona.',
      'home.cardDossier': 'Dossier e metriche',
      'home.cardDossierDesc': 'GPS, video 30s, status legale e badge di verifica anti-fake.',
      'home.cardAmbDesc': 'Programma di rappresentanza e contratto digitale firmabile.',
      'home.joinKicker': 'Unisciti',
      'home.joinTitle': 'Entra nella community',
      'home.joinText': 'Accedi con Google, Apple, SPID o email. Crea il tuo profilo scout in pochi secondi.',
      'home.emailBtn': 'Accedi con email',
      'about.pageTitle': 'CHI SIAMO',
      'about.bio1': 'ELISEE SCOUT è la piattaforma di recruitment calcistico nata per digitalizzare il mercato dilettantistico, giovanile e svincolati in Italia.',
      'about.bio2': 'Connettiamo calciatori, società, scout e staff tecnico con dossier verificati, dati GPS, video highlights e compliance GDPR. La nostra forza è la fiducia: zero fake account, opportunità reali, mai un rischio.',
      'about.city': 'Italia · Puglia',
      'about.address': 'Digital HQ · Foggia & Network Nazionale',
      'about.heroLine1': 'CHI',
      'about.heroLine2': 'SIAMO',
      'about.storyBtn': 'La storia',
      'about.rolesBtn': 'I ruoli',
      'about.nextKicker': 'Prossimo passo',
      'about.nextTitle': 'Esplora Curriculum e Bacheca',
      'about.nextText': 'Metriche, pillar strategici e bacheca annunci live — sempre nella stessa esperienza cinematografica.',
      'resume.title': 'Pillar e competenze della piattaforma',
      'resume.sub': '1.386 pillar strategici · 715 agenti IA · focus dilettanti Italia',
      'resume.skills': 'Competenze piattaforma',
      'resume.languages': 'Lingue coperte',
      'resume.soft': 'Pillar trasversali',
      'resume.softLine': 'Fiducia · Anti-fake · Fiducia giovanile · Trasparenza · Network',
      'resume.roadmap': 'Roadmap ed esperienza',
      'resume.edu': 'Formazione e conformità',
      'resume.eduSub': 'Roadmap fiscale, privacy, pagamenti e posizione rispetto alla normativa sugli agenti sportivi',
      'resume.canDo': 'Cosa possiamo fare?',
      'resume.can1': 'Dossier atleta + GPS + video clip',
      'resume.can2': 'Bacheca provini e staff tecnico',
      'resume.can3': 'Cerca Under / svincolati certificati',
      'resume.can4': 'Network scout e procuratori',
      'resume.can5': 'Quiz cultura calcistica e skill',
      'resume.can6': 'Ambassador e firma digitale',
      'resume.domain': 'Competenze di settore',
      'resume.dom1': 'Scouting dilettanti · Serie D / Eccellenza',
      'resume.dom2': 'Minutaggio Under · Indice De Rossi',
      'resume.dom3': 'Safeguarding · Consenso genitori',
      'resume.dom4': 'Match Analyst · Preparatori · DS',
      'resume.badges': 'Badge di fiducia',
      'resume.focus': 'Focus',
      'resume.tl1t': 'ELISEE SCOUT — Build piattaforma live',
      'resume.tl1r': 'Prodotto · Governance · Fiducia',
      'resume.tl1p': '1.386 pillar, pannello admin anti-fake, badge verifica, dossier atleta e bacheca reclutamento dilettanti.',
      'resume.tl2t': 'Business Plan e 715 Agenti IA',
      'resume.tl2r': 'Strategia · Agenti IA',
      'resume.tl2p': 'Estensione pillar 351–1386, agenti di orchestrazione, missione voci del calcio italiano e conformità pre-lancio.',
      'resume.tl3t': 'Nucleo Pillar 01–50',
      'resume.tl3r': 'MVP Scouting',
      'resume.tl3p': 'Passaporto digitale, svincoli Art. 107/108, video 30s, matchmaking club–atleta, ricerca Under fuoriquota.',
      'resume.tl4t': 'Concept marketplace calcio',
      'resume.tl4r': 'Ricerca · Market fit',
      'resume.tl4p': 'Analisi del gap dilettanti/giovanili vs professionismo: WhatsApp e Facebook come “mercato” da digitalizzare.',
      'bacheca.title': 'Bacheca reclutamento'
    },
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.resume': 'Resume',
      'nav.portfolio': 'Board',
      'nav.network': 'Network',
      'nav.ambassador': 'Ambassador',
      'nav.minigame': 'Minigames',
      'nav.elisee_world': 'Minigames',
      'nav.login': 'Log in',
      'nav.signup': 'Sign up',
      'hero.role': 'Football Recruitment Platform',
      'home.aboutTitle': 'Digitizing the\namateur football market',
      'home.aboutText': 'ELISEE SCOUT connects players, clubs, scouts and technical staff in Italy with verified dossiers, GPS data, highlight videos and GDPR compliance.',
      'home.learnMore': 'Learn more',
      'home.resumeText': 'Athletic metrics, anti-fake governance, verification badges and pre-launch compliance roadmap.',
      'home.statPillars': 'Strategic pillars',
      'home.statAgents': 'AI agents',
      'home.statGdpr': 'Privacy first',
      'home.statItaly': 'Amateur focus',
      'home.openResume': 'Open resume',
      'home.portfolioTitle': 'What you can do on the platform',
      'home.cardBacheca': 'Jobs board',
      'home.cardBachecaDesc': 'Trials, contracts and staff requests for amateur and youth football.',
      'home.cardNetwork': 'People network',
      'home.cardNetworkDesc': 'Find players, coaches, scouts and agents in your area.',
      'home.cardDossier': 'Dossier & metrics',
      'home.cardDossierDesc': 'GPS, 30s video, legal status and anti-fake verification badges.',
      'home.cardAmbDesc': 'Ambassador programme and signable digital contract.',
      'home.joinKicker': 'Join',
      'home.joinTitle': 'Join the community',
      'home.joinText': 'Sign in with Google, Apple, SPID or email. Create your scout profile in seconds.',
      'home.emailBtn': 'Sign in with email',
      'about.pageTitle': 'ABOUT',
      'about.bio1': 'ELISEE SCOUT is the football recruitment platform built to digitize the amateur, youth and free-agent market in Italy.',
      'about.bio2': 'We connect players, clubs, scouts and technical staff with verified dossiers, GPS data, highlight videos and GDPR compliance. Our greatest strength is trust: zero fake accounts, real opportunities, never a risk.',
      'about.city': 'Italy · Apulia',
      'about.address': 'Digital HQ · Foggia & National Network',
      'about.heroLine1': 'WHO',
      'about.heroLine2': 'WE ARE',
      'about.storyBtn': 'Our story',
      'about.rolesBtn': 'Roles',
      'about.nextKicker': 'Next step',
      'about.nextTitle': 'Explore Resume and Board',
      'about.nextText': 'Metrics, strategic pillars and live job board — same cinematic experience.',
      'resume.title': 'Platform pillars & skills',
      'resume.sub': '1,386 strategic pillars · 715 AI agents · Italian amateur focus',
      'resume.skills': 'Platform skills',
      'resume.languages': 'Coverage languages',
      'resume.soft': 'Cross-cutting pillars',
      'resume.softLine': 'Trust · Anti-fake · Youth confidence · Transparency · Network',
      'resume.roadmap': 'Roadmap & experience',
      'resume.edu': 'Education & compliance',
      'resume.eduSub': 'Tax, privacy, payments roadmap and positioning vs sports agent regulation',
      'resume.canDo': 'What can we do?',
      'resume.can1': 'Athlete dossier + GPS + video clips',
      'resume.can2': 'Trials board & technical staff',
      'resume.can3': 'Search Under / certified free agents',
      'resume.can4': 'Scout & agent network',
      'resume.can5': 'Football culture quizzes & skills',
      'resume.can6': 'Ambassador & digital signature',
      'resume.domain': 'Domain skills',
      'resume.dom1': 'Amateur scouting · Serie D / Eccellenza',
      'resume.dom2': 'Youth minutes · De Rossi Index',
      'resume.dom3': 'Safeguarding · Parental consent',
      'resume.dom4': 'Match analyst · Coaches · Sporting director',
      'resume.badges': 'Trust badges',
      'resume.focus': 'Focus',
      'resume.tl1t': 'ELISEE SCOUT — Live platform build',
      'resume.tl1r': 'Product · Governance · Trust',
      'resume.tl1p': '1,386 pillars, anti-fake admin panel, verification badges, athlete dossier and amateur recruitment board.',
      'resume.tl2t': 'Business plan & 715 AI agents',
      'resume.tl2r': 'Strategy · AI agents',
      'resume.tl2p': 'Pillars 351–1386 extension, orchestration agents, Italian football mission and pre-launch compliance.',
      'resume.tl3t': 'Core pillars 01–50',
      'resume.tl3r': 'Scouting MVP',
      'resume.tl3p': 'Digital passport, Art. 107/108 free agents, 30s video, club–player matchmaking, Under search.',
      'resume.tl4t': 'Football marketplace concept',
      'resume.tl4r': 'Research · Market fit',
      'resume.tl4p': 'Gap analysis amateur/youth vs pro: WhatsApp and Facebook as the “market” to digitize.',
      'bacheca.title': 'Recruitment board'
    },
    es: {
      'nav.home': 'Inicio',
      'nav.about': 'Quiénes somos',
      'nav.resume': 'Currículum',
      'nav.portfolio': 'Tablón',
      'nav.network': 'Red',
      'nav.ambassador': 'Embajador',
      'nav.minigame': 'Minijuegos',
      'nav.elisee_world': 'Minijuegos',
      'nav.login': 'Acceder',
      'nav.signup': 'Registrarse',
      'hero.role': 'Plataforma de recruitment de fútbol',
      'home.aboutTitle': 'Digitalizamos el\nmercado de fútbol amateur',
      'home.aboutText': 'ELISEE SCOUT conecta jugadores, clubes, ojeadores y staff tecnico en Italia con dossiers verificados, datos GPS, videos highlights y cumplimiento GDPR.',
      'home.learnMore': 'Saber más',
      'home.resumeText': 'Métricas atléticas, gobernanza anti-fake, badges de verificación y hoja de ruta de cumplimiento.',
      'home.statPillars': 'Pilares estratégicos',
      'home.statAgents': 'Agentes IA',
      'home.statGdpr': 'Privacidad primero',
      'home.statItaly': 'Enfoque amateur',
      'home.openResume': 'Abrir currículum',
      'home.portfolioTitle': 'Qué puedes hacer en la plataforma',
      'home.cardBacheca': 'Tablón de anuncios',
      'home.cardBachecaDesc': 'Pruebas, fichajes y staff para amateur y juveniles.',
      'home.cardNetwork': 'Red de personas',
      'home.cardNetworkDesc': 'Encuentra jugadores, entrenadores, ojeadores y agentes en tu zona.',
      'home.cardDossier': 'Dossier y métricas',
      'home.cardDossierDesc': 'GPS, vídeo 30s, estado legal y badges anti-fake.',
      'home.cardAmbDesc': 'Programa de embajadores y contrato digital.',
      'home.joinKicker': 'Únete',
      'home.joinTitle': 'Entra en la comunidad',
      'home.joinText': 'Accede con Google, Apple, SPID o email. Crea tu perfil scout en segundos.',
      'home.emailBtn': 'Acceder con email',
      'about.pageTitle': 'QUIÉNES SOMOS',
      'about.bio1': 'ELISEE SCOUT es la plataforma de recruitment futbolístico creada para digitalizar el mercado amateur, juvenil y de agentes libres en Italia.',
      'about.bio2': 'Conectamos jugadores, clubes, ojeadores y staff técnico con dossiers verificados, datos GPS, vídeos highlights y cumplimiento GDPR. Nuestra fuerza es la confianza: cero cuentas fake, oportunidades reales, nunca un riesgo.',
      'about.city': 'Italia · Apulia',
      'about.address': 'Digital HQ · Foggia y Red Nacional',
      'about.heroLine1': 'QUIÉNES',
      'about.heroLine2': 'SOMOS',
      'about.storyBtn': 'La historia',
      'about.rolesBtn': 'Los roles',
      'about.nextKicker': 'Siguiente paso',
      'about.nextTitle': 'Explora Currículum y Tablón',
      'about.nextText': 'Métricas, pilares y tablón en vivo — misma experiencia cinematográfica.',
      'resume.title': 'Pilares y competencias de la plataforma',
      'resume.sub': '1.386 pilares · 715 agentes IA · foco amateur Italia',
      'resume.skills': 'Competencias de plataforma',
      'resume.languages': 'Idiomas cubiertos',
      'resume.soft': 'Pilares transversales',
      'resume.softLine': 'Confianza · Anti-fake · Confianza juvenil · Transparencia · Red',
      'resume.roadmap': 'Hoja de ruta y experiencia',
      'resume.edu': 'Formación y cumplimiento',
      'resume.eduSub': 'Fiscalidad, privacidad, pagos y posición frente a la normativa de agentes',
      'resume.canDo': '¿Qué podemos hacer?',
      'resume.can1': 'Dossier atleta + GPS + vídeo',
      'resume.can2': 'Tablón de pruebas y staff técnico',
      'resume.can3': 'Buscar Under / libres certificados',
      'resume.can4': 'Red de ojeadores y agentes',
      'resume.can5': 'Quiz de cultura futbolística',
      'resume.can6': 'Embajador y firma digital',
      'resume.domain': 'Competencias del sector',
      'resume.dom1': 'Scouting amateur · Serie D / Eccellenza',
      'resume.dom2': 'Minutos Under · Índice De Rossi',
      'resume.dom3': 'Safeguarding · Consentimiento parental',
      'resume.dom4': 'Match analyst · Preparadores · DS',
      'resume.badges': 'Badges de confianza',
      'resume.focus': 'Enfoque',
      'resume.tl1t': 'ELISEE SCOUT — Build plataforma live',
      'resume.tl1r': 'Producto · Gobernanza · Confianza',
      'resume.tl1p': '1.386 pilares, panel admin anti-fake, badges, dossier y tablón de reclutamiento amateur.',
      'resume.tl2t': 'Business plan y 715 agentes IA',
      'resume.tl2r': 'Estrategia · Agentes IA',
      'resume.tl2p': 'Extensión de pilares 351–1386, agentes de orquestación y cumplimiento pre-lanzamiento.',
      'resume.tl3t': 'Núcleo pilares 01–50',
      'resume.tl3r': 'MVP scouting',
      'resume.tl3p': 'Pasaporte digital, Art. 107/108, vídeo 30s, matchmaking club–jugador, búsqueda Under.',
      'resume.tl4t': 'Concepto marketplace de fútbol',
      'resume.tl4r': 'Investigación · Market fit',
      'resume.tl4p': 'Análisis del gap amateur/juvenil vs pro: WhatsApp y Facebook como “mercado” a digitalizar.',
      'bacheca.title': 'Tablón de reclutamiento'
    },
    fr: {
      'nav.home': 'Accueil',
      'nav.about': 'À propos',
      'nav.resume': 'CV',
      'nav.portfolio': 'Tableau',
      'nav.network': 'Réseau',
      'nav.ambassador': 'Ambassadeur',
      'nav.minigame': 'Mini-jeux',
      'nav.elisee_world': 'Mini-jeux',
      'nav.login': 'Connexion',
      'nav.signup': "S'inscrire",
      'hero.role': 'Plateforme de recruitment football',
      'home.aboutTitle': 'Digitalisons le\nmarché du football amateur',
      'home.aboutText': 'ELISEE SCOUT relie joueurs, clubs, scouts et staff technique en Italie avec des dossiers verifies, le GPS, des videos highlights et la conformite RGPD.',
      'home.learnMore': 'En savoir plus',
      'home.resumeText': 'Métriques athlétiques, gouvernance anti-fake, badges de vérification et feuille de route conformité.',
      'home.statPillars': 'Piliers stratégiques',
      'home.statAgents': 'Agents IA',
      'home.statGdpr': 'Confidentialité d’abord',
      'home.statItaly': 'Focus amateur',
      'home.openResume': 'Ouvrir le CV',
      'home.portfolioTitle': 'Ce que vous pouvez faire',
      'home.cardBacheca': 'Tableau d’annonces',
      'home.cardBachecaDesc': 'Essais, contrats et staff pour amateurs et jeunes.',
      'home.cardNetwork': 'Réseau de personnes',
      'home.cardNetworkDesc': 'Trouvez joueurs, coachs, scouts et agents près de chez vous.',
      'home.cardDossier': 'Dossier et métriques',
      'home.cardDossierDesc': 'GPS, vidéo 30s, statut légal et badges anti-fake.',
      'home.cardAmbDesc': 'Programme ambassadeur et contrat numérique.',
      'home.joinKicker': 'Rejoindre',
      'home.joinTitle': 'Entrez dans la communauté',
      'home.joinText': 'Connectez-vous avec Google, Apple, SPID ou e-mail. Créez votre profil en quelques secondes.',
      'home.emailBtn': 'Connexion par e-mail',
      'about.pageTitle': 'À PROPOS',
      'about.bio1': 'ELISEE SCOUT est la plateforme de recruitment football créée pour digitaliser le marché amateur, jeunes et agents libres en Italie.',
      'about.bio2': 'Nous relions joueurs, clubs, scouts et staff technique avec dossiers vérifiés, données GPS, vidéos highlights et conformité RGPD. Notre force est la confiance : zéro faux comptes, opportunités réelles, jamais un risque.',
      'about.city': 'Italie · Pouilles',
      'about.address': 'Digital HQ · Foggia & Réseau national',
      'about.heroLine1': 'QUI',
      'about.heroLine2': 'SOMMES-NOUS',
      'about.storyBtn': 'L’histoire',
      'about.rolesBtn': 'Les rôles',
      'about.nextKicker': 'Étape suivante',
      'about.nextTitle': 'Explorer CV et Tableau',
      'about.nextText': 'Métriques, piliers et tableau d’annonces live — même expérience cinématique.',
      'resume.title': 'Piliers et compétences de la plateforme',
      'resume.sub': '1 386 piliers · 715 agents IA · focus amateur Italie',
      'resume.skills': 'Compétences plateforme',
      'resume.languages': 'Langues couvertes',
      'resume.soft': 'Piliers transversaux',
      'resume.softLine': 'Confiance · Anti-fake · Confiance jeunesse · Transparence · Réseau',
      'resume.roadmap': 'Feuille de route et expérience',
      'resume.edu': 'Formation et conformité',
      'resume.eduSub': 'Fiscalité, confidentialité, paiements et position face à la réglementation des agents',
      'resume.canDo': 'Que pouvons-nous faire ?',
      'resume.can1': 'Dossier athlète + GPS + clips vidéo',
      'resume.can2': 'Tableau d’essais et staff technique',
      'resume.can3': 'Recherche Under / libres certifiés',
      'resume.can4': 'Réseau scouts et agents',
      'resume.can5': 'Quiz culture football et skills',
      'resume.can6': 'Ambassadeur et signature numérique',
      'resume.domain': 'Compétences métier',
      'resume.dom1': 'Scouting amateur · Serie D / Eccellenza',
      'resume.dom2': 'Minutes Under · Indice De Rossi',
      'resume.dom3': 'Safeguarding · Consentement parental',
      'resume.dom4': 'Match analyst · Préparateurs · DS',
      'resume.badges': 'Badges de confiance',
      'resume.focus': 'Focus',
      'resume.tl1t': 'ELISEE SCOUT — Build plateforme live',
      'resume.tl1r': 'Produit · Gouvernance · Confiance',
      'resume.tl1p': '1 386 piliers, panneau admin anti-fake, badges, dossier et tableau de recrutement amateur.',
      'resume.tl2t': 'Business plan et 715 agents IA',
      'resume.tl2r': 'Stratégie · Agents IA',
      'resume.tl2p': 'Extension piliers 351–1386, agents d’orchestration et conformité pré-lancement.',
      'resume.tl3t': 'Noyau piliers 01–50',
      'resume.tl3r': 'MVP scouting',
      'resume.tl3p': 'Passeport numérique, Art. 107/108, vidéo 30s, matchmaking club–joueur, recherche Under.',
      'resume.tl4t': 'Concept marketplace football',
      'resume.tl4r': 'Recherche · Market fit',
      'resume.tl4p': 'Analyse du gap amateur/jeunes vs pro : WhatsApp et Facebook comme « marché » à digitaliser.',
      'bacheca.title': 'Tableau de recrutement'
    }
  };

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return 'it';
  }

  function t(key, lang) {
    const L = lang || getLang();
    return (DICT[L] && DICT[L][key]) || (DICT.it && DICT.it[key]) || key;
  }

  function applyLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'it';
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      let text = t(key, lang);
      if (text.indexOf('\n') !== -1) {
        el.innerHTML = text.split('\n').join('<br>');
      } else {
        // Preserve leading icon if present
        const icon = el.querySelector('i[data-lucide], svg');
        if (icon && el.childNodes.length > 1) {
          el.childNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) n.textContent = '';
          });
          // Keep icons, set text after
          const icons = Array.from(el.querySelectorAll('i[data-lucide], svg')).map((n) => n.outerHTML).join('');
          el.innerHTML = icons + ' ' + text;
        } else {
          el.textContent = text;
        }
      }
    });

    const label = document.getElementById('lang-current-label');
    if (label) label.textContent = LABELS[lang] || lang.toUpperCase();

    document.querySelectorAll('#lang-switcher .nav-lang-item').forEach((opt) => {
      opt.classList.toggle('is-active', opt.getAttribute('data-lang') === lang);
    });

    closeLangMenu();

    document.dispatchEvent(
      new CustomEvent('elisee:lang-changed', { detail: { lang } })
    );
    if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
      window.EliseeAICluster.logEvent(
        'comms',
        `Lingua interfaccia impostata su ${String(lang).toUpperCase()}`,
        { source: 'i18n' }
      );
    }

    if (window.lucide) lucide.createIcons();
  }

  function closeLangMenu() {
    const root = document.getElementById('lang-switcher');
    const menu = document.getElementById('lang-switcher-menu');
    const btn = document.getElementById('lang-switcher-btn');
    if (root) root.classList.remove('is-open');
    if (menu) {
      menu.hidden = true;
      menu.setAttribute('hidden', '');
    }
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openLangMenu() {
    const root = document.getElementById('lang-switcher');
    const menu = document.getElementById('lang-switcher-menu');
    const btn = document.getElementById('lang-switcher-btn');
    if (root) root.classList.add('is-open');
    if (menu) {
      menu.hidden = false;
      menu.removeAttribute('hidden');
    }
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (window.lucide) lucide.createIcons();
  }

  function initLangSwitcher() {
    const root = document.getElementById('lang-switcher');
    const btn = document.getElementById('lang-switcher-btn');
    const menu = document.getElementById('lang-switcher-menu');
    if (!root || !btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menu.hidden || menu.hasAttribute('hidden')) openLangMenu();
      else closeLangMenu();
    });

    menu.querySelectorAll('.nav-lang-item').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyLanguage(opt.getAttribute('data-lang'));
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#lang-switcher')) closeLangMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangMenu();
    });
  }

  window.EliseeI18n = {
    t,
    getLang,
    setLang: applyLanguage,
    applyLanguage
  };

  document.addEventListener('DOMContentLoaded', () => {
    initLangSwitcher();
    applyLanguage(getLang());
  });
})();
