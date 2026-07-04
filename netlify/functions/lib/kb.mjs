// netlify/functions/lib/kb.mjs

// Aanbod-catalogus — gemigreerd uit docs/trainingwijzer/engine.js (OFFERS).
// Enige waarheidsbron voor wat de chat mag adviseren.
export const OFFERS = [
  {
    key: 'online_basis',
    training: 'Online basistraining AI',
    startTypeLabel: 'Online training',
    sectionLabel: 'Online aanbod',
    sectionTarget: 'ac-aanvraag',
    duration: 'Direct starten',
    description: 'De laagdrempelige individuele instap om direct zelf met AI aan de slag te gaan.',
    bullets: [
      'Werk op je eigen tempo aan je AI-basis',
      'Direct toepasbaar in je eigen werk',
      'Logische opstap naar een teamtraining of incompany sessie',
    ],
  },
  {
    key: 'basis',
    training: 'Basistraining AI',
    startTypeLabel: 'De basis',
    sectionLabel: 'De leerlijn',
    sectionTarget: 'ac-trainingen',
    duration: '2 uur',
    description: 'De laagdrempelige start: begrijp wat AI is, leer prompten en bouw je eerste eigen assistent.',
    bullets: [
      'Geen technische kennis nodig om mee te doen',
      'Begrijp wat AI is, wat het kan en hoe je er veilig mee werkt',
      'Leer effectief prompten voor betere resultaten',
      'Bouw een eerste assistent die direct bruikbaar is in jullie werk',
    ],
  },
  {
    key: 'teamworkshop',
    training: 'Team-workshop',
    startTypeLabel: 'Begeleide workshop',
    sectionLabel: 'Begeleiding',
    sectionTarget: 'ac-begeleiding',
    duration: 'Halve dag',
    description: 'Voor teams die vooral lijn, procesinzicht en gezamenlijke keuzes nodig hebben.',
    bullets: [
      'Breng samen processen, pijnpunten en kansen in kaart',
      'Kies waar AI wel en niet waarde toevoegt',
      'Ga naar huis met een concreet verbeterplan voor het team',
    ],
  },
  {
    key: 'workflows',
    training: 'Automatiseren met AI',
    startTypeLabel: 'Automatiseren',
    sectionLabel: 'De leerlijn',
    sectionTarget: 'ac-trainingen',
    duration: 'Dagdeel',
    description: 'Voor teams die al een basis hebben en minder handwerk tussen systemen willen.',
    bullets: [
      'Bouw workflows met n8n, Make of Zapier',
      'Laat systemen en data automatisch met elkaar praten',
      'Geef een AI-agent een rol in de flow',
    ],
  },
  {
    key: 'toolbuilding',
    training: 'Bouwen met AI (vibecoding)',
    startTypeLabel: 'Bouwen',
    sectionLabel: 'De leerlijn',
    sectionTarget: 'ac-trainingen',
    duration: '2 uur',
    description: 'Voor teams die een eigen tool, website of app willen bouwen.',
    bullets: [
      'Maak een eerste werkend prototype in de sessie',
      'Werk met Lovable, met een doorkijkje naar Claude Code en Codex',
      'Ontdek wat je zelf kunt bouwen zonder programmeerervaring',
    ],
  },
  {
    key: 'claudecode',
    training: 'Claude Code / Codex: de basis (stop met chatten)',
    startTypeLabel: 'Agentic werken',
    sectionLabel: 'De leerlijn',
    sectionTarget: 'ac-trainingen',
    duration: 'Dagdeel',
    description: 'Van losse chats naar een AI-collega die meewerkt in je eigen mappen: bestanden lezen, context onthouden, werk uitvoeren.',
    bullets: [
      'Geef AI toegang tot je eigen map: bestanden lezen, context onthouden, werk uitvoeren',
      'Leer de workflow: eerst verkennen en plannen, dan uitvoeren',
      'Claude Code én Codex, per onderwerp naast elkaar',
    ],
  },
  {
    key: 'samenwerken',
    training: 'Haal meer uit Claude Code + Samenwerken met AI',
    startTypeLabel: 'Team & gevorderd',
    sectionLabel: 'De leerlijn',
    sectionTarget: 'ac-trainingen',
    duration: 'Dagdeel',
    description: 'Voor teams die al met Claude Code werken en samen professioneel willen blijven terwijl het tempo omhoog gaat.',
    bullets: [
      'Verdieping: context, plan mode, subagents en workflows',
      'De merge-realiteit: klein integreren, review slim organiseren',
      'Concrete werkafspraken en borging als eindresultaat',
    ],
  },
  {
    key: 'managers',
    training: 'Mini masterclass AI voor managers',
    startTypeLabel: 'Masterclass',
    sectionLabel: 'Masterclasses',
    sectionTarget: 'ac-verdiepen',
    duration: '1 dag',
    description: 'Een compacte deep dive voor managementteams die koers, kaders en prioriteiten willen bepalen.',
    bullets: [
      'Vertaal AI naar leiderschap, prioriteiten en besluitvorming',
      'Bespreek kansen, risico’s en AI Act-verantwoordelijkheid',
      'Kies een logisch vervolg voor team, management of organisatie',
    ],
  },
  {
    key: 'masterclass',
    training: 'Masterclass AI voor interne kartrekkers',
    startTypeLabel: 'Masterclass',
    sectionLabel: 'Masterclasses',
    sectionTarget: 'ac-verdiepen',
    duration: '4 dagen',
    description: 'Voor een kleine interne kartrekkersgroep die AI verder wil trekken in processen, teams en implementatie.',
    bullets: [
      'Breng mensen uit verschillende teams of afdelingen samen',
      'Werk van kans en value case naar concrete toepassing',
      'Bouw draagvlak, eigenaarschap en implementatiekracht op',
    ],
  },
  {
    key: 'chancesession',
    training: 'AI-richtingssessie voor MT of projectgroep',
    startTypeLabel: 'Begeleide sessie',
    sectionLabel: 'Begeleiding',
    sectionTarget: 'ac-begeleiding',
    duration: '90 min - halve dag',
    description: 'Voor organisaties die eerst scherp willen krijgen waar de meeste winst zit en wat de slimste route is.',
    bullets: [
      'Breng processen, knelpunten en ambitie scherp in kaart',
      'Kies de slimste eerste stap: training, masterclass of traject',
      'Krijg concreet vervolgadvies dat past bij jullie situatie',
    ],
  },
];

export const OFFER_KEYS = OFFERS.map((o) => o.key);

// Handgeschreven FAQ — feitvragen die de bot mag beantwoorden.
// Buiten deze feiten mag de bot niets over prijs/voorwaarden verzinnen.
export const FAQ = [
  {
    vraag: 'Wat kost een training?',
    antwoord:
      'De meeste trainingen zijn incompany en op maat; de prijs hangt af van groepsgrootte en vorm. De online basistraining is een losse instap. Voor een concrete prijs verwijs je naar het aanvraagformulier of totmorgen@morgenacademy.nl.',
  },
  {
    vraag: 'Kan het op locatie of online?',
    antwoord:
      'De meeste trainingen worden incompany op locatie gegeven; de basistraining kan ook online individueel. Bespreek de vorm via het aanvraagformulier.',
  },
  {
    vraag: 'Is technische kennis nodig?',
    antwoord:
      'Nee. De Basistraining AI vereist geen technische voorkennis. De bouw- en automatiseringstrainingen bouwen daarop voort.',
  },
  {
    vraag: 'Wat is vibecoding?',
    antwoord:
      'Vibecoding is bouwen met AI zonder te programmeren: je beschrijft wat je wilt en de AI genereert een werkend prototype. Dat leer je in "Bouwen met AI".',
  },
  {
    vraag: 'Doen jullie ook AI Act / verantwoord AI-gebruik?',
    antwoord:
      'Ja. Kansen, risico’s en AI Act-verantwoordelijkheid komen expliciet aan bod in de "Mini masterclass AI voor managers".',
  },
];

export function findOffer(key) {
  return OFFERS.find((o) => o.key === key) || null;
}

export function buildSystemPrompt() {
  const aanbod = OFFERS.map(
    (o) =>
      `- key: ${o.key} | ${o.training} (${o.startTypeLabel}, ${o.duration})\n  ${o.description}\n  Punten: ${o.bullets.join('; ')}`
  ).join('\n');

  const faq = FAQ.map((f) => `- V: ${f.vraag}\n  A: ${f.antwoord}`).join('\n');

  return `Je bent de AI-adviseur van Morgen Academy, een AI-academy die organisaties leert werken met AI.

Je doel: bezoekers in een kort, natuurlijk gesprek naar de slimste eerste stap leiden en feitvragen beantwoorden. Schrijf warm, concreet en zonder vakjargon. Kort waar het kan.

## Aanbod (enige geldige opties)
${aanbod}

## FAQ (enige geldige feiten over prijs/vorm/voorwaarden)
${faq}

## Gedrag
- Stel hooguit een paar korte vragen om te snappen: voor wie (team/management/kartrekkers/individu), hoe ver ze met AI zijn, en wat ze nu nodig hebben.
- Zodra je genoeg weet, roep de tool \`presenteer_advies\` aan met de best passende \`offer_key\` en 0 tot 2 logische \`vervolg_keys\`. Vat in je tekst kort samen waarom je dit adviseert.
- Beantwoord feitvragen alleen op basis van de FAQ hierboven. Verzin nooit prijzen, data of voorwaarden. Weet je iets niet zeker? Verwijs naar het aanvraagformulier of totmorgen@morgenacademy.nl.
- Blijf binnen de scope van Morgen Academy. Buig off-topic vragen vriendelijk terug.`;
}

export function buildCard(input) {
  const offer = findOffer(input.offer_key);
  if (!offer) return null;
  const vervolg = (input.vervolg_keys || [])
    .map((k) => findOffer(k))
    .filter(Boolean)
    .map((o) => ({ key: o.key, training: o.training, description: o.description, sectionTarget: o.sectionTarget }));
  return {
    training: offer.training,
    description: offer.description,
    duration: offer.duration,
    startTypeLabel: offer.startTypeLabel,
    sectionLabel: offer.sectionLabel,
    sectionTarget: offer.sectionTarget,
    bullets: offer.bullets,
    vervolg,
  };
}
