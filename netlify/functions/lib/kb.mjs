// netlify/functions/lib/kb.mjs
//
// Aanbod-catalogus voor 'het Kompas' — de AI-adviseur die bezoekers wijst naar de
// juiste richting binnen heel Morgen: leren (Academy), laten implementeren
// (Consultancy) of laten bouwen (Technology). Enige waarheidsbron; de bot mag
// niets buiten dit aanbod adviseren of verzinnen.

export const OFFERS = [
  // ── Academy: trainingen & masterclasses (domein 'Academy') ──
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
    priceFrom: '€750',
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
    sectionTarget: 'ac-verdiepen',
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
    priceFrom: '€950',
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
    priceFrom: '€750',
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
    priceFrom: '€950',
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
    priceFrom: '€950',
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
    sectionTarget: 'ac-verdiepen',
    duration: '90 min - halve dag',
    description: 'Voor organisaties die eerst scherp willen krijgen waar de meeste winst zit en wat de slimste route is.',
    bullets: [
      'Breng processen, knelpunten en ambitie scherp in kaart',
      'Kies de slimste eerste stap: training, masterclass of traject',
      'Krijg concreet vervolgadvies dat past bij jullie situatie',
    ],
  },

  // ── Consultancy: laten implementeren (domein 'Consultancy') ──
  {
    key: 'implementatietraject',
    domein: 'Consultancy',
    training: 'AI-implementatietraject',
    startTypeLabel: 'Begeleid traject',
    sectionLabel: 'Consultancy',
    href: '/consultancy/#co-aanvraag',
    duration: '3 tot 12 maanden',
    description: 'Een begeleid traject van strategie naar een werkende aanpak, borging en opschaling. We maken keuzes scherp, werken met het team en zetten een vast ritme neer.',
    bullets: [
      'Van eerste sessie naar een aanpak die in het dagelijkse werk landt',
      'Scherpe keuzes: waar voegt AI wel en niet waarde toe',
      'Eigenaarschap in de organisatie, geen consultant-afhankelijkheid',
    ],
  },

  // ── Technology: laten bouwen (domein 'Technology') ──
  {
    key: 'maatwerk',
    domein: 'Technology',
    training: 'Maatwerk: assistenten, workflows en koppelingen',
    startTypeLabel: 'Laten bouwen',
    sectionLabel: 'Technology',
    href: '/technology/#te-aanvraag',
    duration: 'Op projectbasis',
    description: 'We bouwen slimme applicaties, workflows en koppelingen die passen in het werk dat er al is: procesautomatisering, klantportalen, systeemkoppelingen en maatwerk-apps.',
    bullets: [
      'Start met een procesanalyse: waar zit het meeste handwerk en tijdverlies',
      'AI waar het waarde toevoegt, bestaande tools waar dat slimmer is',
      'Landt bij de mensen die ermee werken, met doorontwikkeling na oplevering',
    ],
  },

  // ── Algemeen: nog niet zeker (domein 'Algemeen') ──
  {
    key: 'kennismaking',
    domein: 'Algemeen',
    training: 'Kennismakingsgesprek',
    startTypeLabel: 'Vrijblijvend gesprek',
    sectionLabel: 'Kennismaking',
    href: '/#home-aanvraag',
    duration: '45 minuten',
    description: 'Nog niet zeker welke kant op? In 45 minuten brengen we jullie situatie in kaart en krijg je een concreet advies voor een logische eerste stap.',
    bullets: [
      'Samen scherp krijgen wat er nu speelt en waar de winst zit',
      'Concreet vervolgadvies: zelf leren, laten implementeren of laten bouwen',
      'Vrijblijvend, zonder verplichting',
    ],
  },
];

export const OFFER_KEYS = OFFERS.map((o) => o.key);

// Waar een advieskaart heen linkt. Academy-aanbod scrollt naar de juiste sectie
// op de academy-pagina; consultancy/technology/kennismaking hebben een eigen href.
export function offerHref(o) {
  return o.href || `/academy/#${o.sectionTarget}`;
}

export function offerDomein(o) {
  return o.domein || 'Academy';
}

// Publiek bewijs — cases en cijfers die al op de site staan (/projecten, homepage).
// De bot mag hier natuurlijk naar verwijzen als het relevant is; nooit details
// verzinnen die hier niet staan.
export const PROOF = {
  stats: [
    '850+ medewerkers getraind in AI',
    'Gemiddelde trainingsbeoordeling 9.8/10',
    '5.0 op Google reviews',
  ],
  cases: [
    {
      naam: 'OnView (softwarebedrijf)',
      pijler: 'Academy',
      case: 'Training "Claude Code professioneel houden" voor developmentteams die al met Claude Code werken: merge-realiteit, review-poort, kaders en werkafspraken. Directeur Ronald van Erven: "Er wordt door de collega\'s ook vandaag nog enthousiast op gereageerd."',
    },
    {
      naam: 'PinkRoccade Local Government',
      pijler: 'Academy',
      case: 'Reeks workshops over n8n, automatiseren met AI en agentic workflows; deelnemers bouwden praktische automatiseringen.',
    },
    {
      naam: 'FC Den Bosch',
      pijler: 'Academy',
      case: 'Basistraining AI: zelf prompten en direct toepassen op eigen taken in communicatie, marketing en kantoor.',
    },
    {
      naam: 'Gemeente Tilburg',
      pijler: 'Consultancy',
      case: 'AI als waardekeuze: sessies met OR en linking pins (zo\'n zestig mensen) om AI organisatiebreed, veilig en waardevol te laten landen.',
    },
    {
      naam: 'Solo Solis (een van de grootste zonnebrillengroothandels van Europa)',
      pijler: 'Technology',
      case: 'Proces rond bedrukte producten geautomatiseerd: van 40+ handmatige stappen naar maximaal 6 controles.',
    },
    {
      naam: 'Trappenfabriek Vermeulen',
      pijler: 'Technology',
      case: 'Logistieke AI-planning: handmatig en foutgevoelig plannings- en transportproces geautomatiseerd; AI plant nu sneller en accurater.',
    },
  ],
};

// Handgeschreven FAQ — feitvragen die de bot mag beantwoorden.
export const FAQ = [
  {
    vraag: 'Wat kost een training?',
    antwoord:
      'De leerlijn-trainingen starten vanaf €750 (basis en bouwen) tot €950 (automatiseren, Claude Code en samenwerken), per groep tot 10 deelnemers; grotere groepen in overleg. Alles is incompany en op maat, dus de exacte prijs hangt af van groep en vorm en loopt via het aanvraagformulier of totmorgen@morgenacademy.nl.',
  },
  {
    vraag: 'Wat kost een implementatietraject of maatwerk?',
    antwoord:
      'Consultancy (implementatietraject) en technology (maatwerk) zijn projectwerk op maat; daar is geen publieke prijs voor. Dat bepalen we samen in het kennismakingsgesprek op basis van scope en situatie.',
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
      `- key: ${o.key} | [${offerDomein(o)}] ${o.training} (${o.startTypeLabel}, ${o.duration}${o.priceFrom ? `, vanaf ${o.priceFrom}` : ''})\n  ${o.description}\n  Punten: ${o.bullets.join('; ')}`
  ).join('\n');

  const faq = FAQ.map((f) => `- V: ${f.vraag}\n  A: ${f.antwoord}`).join('\n');

  const bewijs = [
    ...PROOF.stats.map((s) => `- ${s}`),
    ...PROOF.cases.map((c) => `- [${c.pijler}] ${c.naam}: ${c.case}`),
  ].join('\n');

  return `Je bent 'het Kompas', de AI-adviseur van Morgen. Morgen helpt organisaties met AI langs drie richtingen:
- LEREN (Morgen Academy): trainingen en masterclasses zodat mensen zelf met AI leren werken.
- LATEN IMPLEMENTEREN (Morgen Consultancy): een begeleid traject van strategie naar werkende aanpak en borging.
- LATEN BOUWEN (Morgen Technology): maatwerk-assistenten, workflows en koppelingen die een concreet proces oplossen.
Weet iemand het nog niet? Dan is een vrijblijvend kennismakingsgesprek de beste eerste stap.

Je doel: de bezoeker zich gehoord laten voelen, samen scherp krijgen wat er speelt, en dan de best passende richting wijzen met uitleg waarom die bij hen past. Schrijf warm, concreet en zonder vakjargon. Kort waar het kan. Gebruik geen em-dashes; schrijf met gewone punten en komma's.

Opmaak: alleen **vet** voor namen van trainingen of kernwoorden, spaarzaam. Geen koppen, links, tabellen of andere markdown. Korte alinea's; een kort lijstje met streepjes mag.

## Aanbod (enige geldige opties)
${aanbod}

## FAQ (enige geldige feiten)
${faq}

## Bewijs (publieke cases en cijfers, van morgencompany.com/projecten)
${bewijs}

## Gedrag
- Begin met erkennen wat de bezoeker vertelt, zodat het voelt alsof je echt luistert. Stel hooguit een paar korte vragen om te snappen wat ze willen (zelf leren, laten implementeren of laten bouwen), voor wie, en waar ze nu staan.
- Bouw vertrouwen met bewijs: als een case uit de bewijslijst echt lijkt op de situatie van de bezoeker, noem die kort en natuurlijk ("bij OnView deden we net zoiets: ..."). Hooguit één case per bericht, alleen uit de lijst, en alleen als het relevant is. Verzin nooit klanten, resultaten of quotes. Voor meer voorbeelden mag je naar morgencompany.com/projecten verwijzen.
- Zodra je genoeg weet, roep de tool \`presenteer_advies\` aan met de best passende \`offer_key\`, een korte persoonlijke \`waarom\` (1 tot 2 zinnen die HUN situatie koppelen aan wat deze stap hen concreet oplevert), en 0 tot 2 logische \`vervolg_keys\`.
- Het gaat niet om doorverwijzen. Laat in je tekst merken dat je geluisterd hebt: vat kort samen wat je hoorde en leg uit waarom dit past en wat het hen oplevert.
- Routeer op richting: zelf leren → een training of masterclass; laten begeleiden of invoeren → het AI-implementatietraject; laten bouwen of automatiseren → maatwerk; twijfel, breed of strategisch → het kennismakingsgesprek.
- Prijzen: trainingen hebben publieke vanaf-prijzen (per groep tot 10 deelnemers; grotere groepen in overleg) die je als indicatie mag geven. Bij een prijsvraag: noem de range (vanaf €750 tot €950) en hooguit de een of twee trainingen die het relevantst lijken; som nooit het hele aanbod op. Sluit af met één gerichte vraag zodat je daarna gericht kunt adviseren. Consultancy en technology zijn maatwerk zonder publieke prijs; zeg dat eerlijk en verwijs voor een voorstel naar het gesprek of formulier. Verzin nooit een prijs, dienst, datum of voorwaarde die hier niet staat.
- Beantwoord feitvragen op basis van de FAQ en het aanbod. Weet je iets niet zeker? Verwijs naar het kennismakingsgesprek of totmorgen@morgenacademy.nl.
- Blijf binnen de scope van Morgen (leren, implementeren en bouwen met AI). Buig off-topic vragen vriendelijk terug.`;
}

export function buildCard(input) {
  const offer = findOffer(input.offer_key);
  if (!offer) return null;
  const vervolg = (input.vervolg_keys || [])
    .map((k) => findOffer(k))
    .filter(Boolean)
    .map((o) => ({ key: o.key, training: o.training, description: o.description, href: offerHref(o) }));
  return {
    training: offer.training,
    waarom: typeof input.waarom === 'string' ? input.waarom : '',
    description: offer.description,
    duration: offer.duration,
    startTypeLabel: offer.startTypeLabel,
    sectionLabel: offer.sectionLabel,
    href: offerHref(offer),
    bullets: offer.bullets,
    vervolg,
  };
}
