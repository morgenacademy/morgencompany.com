const OFFERS = {
  online_basis: {
    key: 'online_basis',
    popupKey: 'basis',
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
    levelTo: 3,
    external: true,
  },
  basis: {
    key: 'basis',
    popupKey: 'basis',
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
    levelTo: 3,
  },
  teamworkshop: {
    key: 'teamworkshop',
    popupKey: 'teamworkshop',
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
    levelTo: 4,
  },
  workflows: {
    key: 'workflows',
    popupKey: 'workflows',
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
    levelTo: 5,
  },
  toolbuilding: {
    key: 'toolbuilding',
    popupKey: 'toolbuilding',
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
    levelTo: 5,
  },
  claudecode: {
    key: 'claudecode',
    popupKey: 'claudecode',
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
    levelTo: 5,
  },
  samenwerken: {
    key: 'samenwerken',
    popupKey: 'samenwerken',
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
    levelTo: 6,
  },
  managers: {
    key: 'managers',
    popupKey: 'managers',
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
    levelTo: 5,
  },
  masterclass: {
    key: 'masterclass',
    popupKey: 'masterclass',
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
    levelTo: 6,
  },
  chancesession: {
    key: 'chancesession',
    popupKey: 'chancesession',
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
    levelTo: 4,
  },
};

const audienceLabels = {
  team: 'Team of organisatie',
  management: 'Managementteam',
  pioneers: 'Kartrekkersgroep',
  organization: 'Organisatievraagstuk',
  myself: 'Individueel',
};

function getLevelFrom(aiUsage) {
  switch (aiUsage) {
    case 'regular':
      return 2;
    case 'advanced':
      return 3;
    case 'none':
    case 'occasional':
    default:
      return 1;
  }
}

function cloneOffer(key, answers, overrides = {}) {
  const offer = OFFERS[key];
  return {
    ...offer,
    ...overrides,
    audienceLabel: audienceLabels[answers.for_whom] || 'Team of organisatie',
    isTeam: answers.for_whom !== 'myself',
    levelFrom: overrides.levelFrom ?? getLevelFrom(answers.ai_usage),
    levelTo: overrides.levelTo ?? offer.levelTo,
  };
}

function makeNextPath(popupKey, title, desc) {
  return { popupKey, title, desc };
}

function buildBasisRoute(answers) {
  const desired = answers.desired_impact;
  let followUp =
    'Na deze training kunnen jullie de leerlijn verder op: bouwen, automatiseren of de stap naar agentic werken.';
  let nextPaths = [
    makeNextPath('toolbuilding', 'Bouwen met AI', 'Bouw een eerste eigen tool of prototype'),
    makeNextPath('workflows', 'Automatiseren met AI', 'Automatiseer handwerk tussen systemen'),
    makeNextPath('claudecode', 'Claude Code / Codex: de basis','Van chatvenster naar AI in je eigen map'),
  ];

  if (desired === 'systems_talk') {
    followUp =
      'Jullie willen uiteindelijk minder handwerk tussen systemen. Leg eerst de basis en pak daarna Automatiseren met AI erbij.';
    nextPaths = [
      makeNextPath('workflows', 'Automatiseren met AI', 'De logische vervolgstap zodra de basis staat'),
      makeNextPath('teamworkshop', 'Team-workshop', 'Zorg dat het hele team dezelfde werkwijze kiest'),
    ];
  }

  if (desired === 'build_tool') {
    followUp =
      'Jullie willen uiteindelijk een eigen tool of assistent bouwen. Start laagdrempelig en stap daarna in Bouwen met AI.';
    nextPaths = [
      makeNextPath('toolbuilding', 'Bouwen met AI', 'Bouw daarna een werkend prototype'),
      makeNextPath('claudecode', 'Claude Code / Codex: de basis','Serieuzer bouwen met Claude Code of Codex'),
    ];
  }

  if (desired === 'roadmap') {
    followUp =
      'Na de basis is het slim om teamafspraken en proceskeuzes te maken, zodat AI niet bij losse experimenten blijft.';
    nextPaths = [
      makeNextPath('teamworkshop', 'Team-workshop', 'Breng lijn en eigenaarschap in het team'),
      makeNextPath('managers', 'Mini masterclass', 'Betrek management bij koers en prioriteiten'),
    ];
  }

  return cloneOffer('basis', answers, {
    why:
      'Jullie willen laagdrempelig starten en eerst zorgen dat mensen in het team dezelfde basis hebben. Dan is een losse training de slimste eerste stap, en Basistraining AI de meest logische keuze.',
    followUp,
    nextPaths,
  });
}

function buildChanceRoute(answers) {
  let nextPaths = [
    makeNextPath('basis', 'Basistraining AI', 'Als er eerst een brede teambasis nodig is'),
    makeNextPath('managers', 'Mini masterclass', 'Als management eerst richting en kaders moet bepalen'),
    makeNextPath('masterclass', '4-daagse masterclass', 'Als een kartrekkersgroep na de basis direct wil doorpakken'),
  ];

  if (answers.for_whom === 'team') {
    nextPaths = [
      makeNextPath('teamworkshop', 'Team-workshop', 'Als proces, lijn en teamafstemming centraal staan'),
      makeNextPath('workflows', 'Automatiseren met AI', 'Als systemen slimmer moeten samenwerken'),
      makeNextPath('toolbuilding', 'Bouwen met AI', 'Als er een eigen tool of prototype moet komen'),
    ];
  }

  return cloneOffer('chancesession', answers, {
    why:
      'Jullie vraag zit nu nog vóór de trainingskeuze. Eerst scherp krijgen waar de meeste winst zit voorkomt dat je te vroeg in een standaardvorm stapt die niet past bij jullie echte behoefte.',
    followUp:
      'De richtingssessie eindigt niet met losse inspiratie, maar met een concreet advies over welke training, masterclass of begeleiding logisch is.',
    nextPaths,
  });
}

function buildManagementRoute(answers) {
  return cloneOffer('managers', answers, {
    why:
      'Management heeft nu vooral richting nodig, maar wil ook zelf ervaren hoe AI helpt in voorbereiding, analyse en besluitvorming. Daarom is een compacte masterclass hier slimmer dan meteen een losse vaardigheidstraining.',
    followUp:
      'Vanuit deze sessie kun je gericht kiezen voor een teamtraining, een richtingssessie of een verdiepend programma voor een kartrekkersgroep.',
    nextPaths: [
      makeNextPath('chancesession', 'AI-richtingssessie', 'Breng organisatiebrede kansen en prioriteiten scherp in kaart'),
      makeNextPath('masterclass', '4-daagse masterclass', 'Ga met een kartrekkersgroep verdiepend aan de slag'),
      makeNextPath('basis', 'Basistraining AI', 'Zet daarna de brede teambasis neer'),
    ],
  });
}

function buildMasterclassRoute(answers) {
  return cloneOffer('masterclass', answers, {
    why:
      'Niet iedereen hoeft in jullie organisatie alles te kunnen bouwen of automatiseren. Jullie willen juist een kleine kartrekkersgroep vormen van mensen die al een basis hebben en dit verder trekken in processen, teams en implementatie. Dan past een masterclass beter dan een losse training.',
    followUp:
      'Na de masterclass is vaak een begeleid implementatietraject of een gerichte vervolgtraining logisch om het verder te laten landen buiten de kartrekkersgroep zelf.',
    nextPaths: [
      makeNextPath('chancesession', 'AI-richtingssessie', 'Koppel de inzichten aan een bredere organisatiekeuze'),
      makeNextPath('workflows', 'Automatiseren met AI', 'Verdiep op procesautomatisering'),
      makeNextPath('samenwerken', 'Samenwerken met AI', 'Werk als team professioneel met Claude Code'),
    ],
  });
}

function buildTeamWorkshopRoute(answers) {
  const nextPaths =
    answers.desired_impact === 'systems_talk'
      ? [
          makeNextPath('workflows', 'Automatiseren met AI', 'Automatiseer daarna de processen die jullie kiezen'),
          makeNextPath('basis', 'Basistraining AI', 'Geef het hele team dezelfde basis in gebruik'),
        ]
      : answers.desired_impact === 'build_tool'
        ? [
            makeNextPath('toolbuilding', 'Bouwen met AI', 'Ga daarna een eerste prototype bouwen'),
            makeNextPath('basis', 'Basistraining AI', 'Leg eerst de brede teambasis waar nodig'),
          ]
        : [
            makeNextPath('basis', 'Basistraining AI', 'Zorg dat iedereen dezelfde taal en basis heeft'),
            makeNextPath('workflows', 'Automatiseren met AI', 'Koppel proceskeuzes aan automatisering'),
          ];

  return cloneOffer('teamworkshop', answers, {
    why:
      'De vraag zit nu minder in losse AI-skills en meer in proces, lijn en eigenaarschap. Daarom is de Team-workshop de slimste eerste stap: samen kiezen wat slimmer moet en wat daar wel of niet bij helpt.',
    followUp:
      'Vanuit deze workshop kunnen 1 of 2 kartrekkers veel gerichter door naar een bouw- of automatiseringstraining.',
    nextPaths,
  });
}

function buildWorkflowRoute(answers) {
  return cloneOffer('workflows', answers, {
    why:
      'Jullie gebruiken AI al vaker en de grootste winst zit in minder handwerk tussen systemen. Dan is Automatiseren met AI de juiste training: concreet genoeg om iets werkends neer te zetten, zonder meteen een heel traject te starten.',
    followUp:
      'Na deze training kun je het automatiseringswerk verder uitbouwen, of de stap maken naar agentic werken met Claude Code of Codex.',
    nextPaths: [
      makeNextPath('claudecode', 'Claude Code / Codex: de basis','Laat AI werken in je eigen mappen'),
      makeNextPath('teamworkshop', 'Team-workshop', 'Breng ook teamafspraken en proceskeuzes in lijn'),
    ],
  });
}

function buildToolRoute(answers) {
  return cloneOffer('toolbuilding', answers, {
    why:
      'Jullie willen niet alleen beter prompten, maar echt iets bouwen. Omdat er al voldoende basis is, is Bouwen met AI de slimste eerste stap om snel van idee naar prototype te gaan.',
    followUp:
      'Als het prototype werkt, volgt vaak de vraag hoe je serieuzer bouwt en hoe je het borgt of opschaalt.',
    nextPaths: [
      makeNextPath('workflows', 'Automatiseren met AI', 'Koppel wat je bouwt aan je systemen'),
      makeNextPath('claudecode', 'Claude Code / Codex: de basis','Serieuzer bouwen met Claude Code of Codex'),
    ],
  });
}

function buildClaudeCodeRoute(answers) {
  return cloneOffer('claudecode', answers, {
    why:
      'Jullie gebruiken AI al regelmatig via het chatvenster. De grootste sprong zit dan niet in nóg beter prompten, maar in de stap naar agentic werken: AI die in je eigen mappen werkt, context onthoudt en werk uitvoert.',
    followUp:
      'Zodra meer mensen zo werken, wordt samenwerken de volgende vraag: afspraken, review en borging. Daar gaat Haal meer uit Claude Code over.',
    nextPaths: [
      makeNextPath('samenwerken', 'Samenwerken met AI', 'Haal meer uit Claude Code als team'),
      makeNextPath('teamworkshop', 'Team-workshop', 'Kies samen welke processen dit het eerst raakt'),
    ],
  });
}

function buildSamenwerkenRoute(answers) {
  return cloneOffer('samenwerken', answers, {
    why:
      'Er wordt bij jullie al gebouwd en geautomatiseerd met AI. Dan zit de winst niet in een basistraining, maar in verdieping en samenwerken: sneller worden zonder kwaliteit, review en beheer te verliezen.',
    followUp:
      'Vanuit deze training volgen vaak concrete werkafspraken en een plan voor borging in het bredere team of de organisatie.',
    nextPaths: [
      makeNextPath('trajectory', 'Begeleid implementatietraject', 'Borg en schaal de werkwijze in de organisatie'),
      makeNextPath('chancesession', 'AI-richtingssessie', 'Bepaal waar de volgende winst zit'),
    ],
  });
}

export function determineRoute(answers) {
  const levelFrom = getLevelFrom(answers.ai_usage);

  if (answers.for_whom === 'myself') {
    return cloneOffer('online_basis', answers, {
      why:
        'Je zoekt een laagdrempelige individuele instap. Dan is het slimmer om direct online te starten dan een incompany route te kiezen die voor teams bedoeld is.',
      followUp:
        'Wil je later met een team verder, dan kun je altijd nog door naar een losse training of incompany sessie.',
      nextPaths: [],
      levelFrom,
    });
  }

  if (answers.for_whom === 'organization' || answers.need_now === 'clarity') {
    return buildChanceRoute(answers);
  }

  if (answers.for_whom === 'management' || answers.desired_impact === 'roadmap') {
    return buildManagementRoute(answers);
  }

  if (answers.for_whom === 'pioneers') {
    if (answers.ai_usage === 'none' && answers.need_now === 'skills') {
      return buildBasisRoute(answers);
    }
    if (answers.desired_impact === 'explore') {
      return buildChanceRoute(answers);
    }
    return buildMasterclassRoute(answers);
  }

  if (answers.need_now === 'alignment') {
    return buildTeamWorkshopRoute(answers);
  }

  if (answers.need_now === 'build') {
    if (answers.desired_impact === 'systems_talk') {
      return levelFrom >= 2 ? buildWorkflowRoute(answers) : buildBasisRoute(answers);
    }
    if (answers.desired_impact === 'build_tool') {
      return levelFrom >= 2 ? buildToolRoute(answers) : buildBasisRoute(answers);
    }
  }

  if (answers.need_now === 'skills') {
    if (answers.ai_usage === 'advanced') return buildSamenwerkenRoute(answers);
    if (answers.ai_usage === 'regular') return buildClaudeCodeRoute(answers);
    return buildBasisRoute(answers);
  }

  if (answers.desired_impact === 'systems_talk') {
    return levelFrom >= 2 ? buildWorkflowRoute(answers) : buildBasisRoute(answers);
  }

  if (answers.desired_impact === 'build_tool') {
    return levelFrom >= 2 ? buildToolRoute(answers) : buildBasisRoute(answers);
  }

  if (answers.ai_usage === 'advanced') return buildSamenwerkenRoute(answers);
  if (answers.ai_usage === 'regular') return buildClaudeCodeRoute(answers);

  return buildBasisRoute(answers);
}
