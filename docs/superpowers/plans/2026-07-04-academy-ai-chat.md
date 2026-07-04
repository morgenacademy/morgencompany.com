# Academy AI-chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vervang de statische trainingwijzer-beslisboom op de Morgen Academy-pagina door een Claude-gestuurde chat-assistent die adviseert, feitvragen beantwoordt en op een advieskaart landt met CTA naar het aanvraagformulier.

**Architecture:** Vanilla-JS chat-widget in de bestaande site → Netlify Function (`/api/chat`) die de Anthropic API-key geheim houdt, streamt (SSE) en guardrails afdwingt → Claude Sonnet 5 met een `presenteer_advies` tool-call voor de advieskaart. De deterministische beslisboom vervalt; Claude ís de engine. De aanbod-data verhuist naar een gecureerde kennisbank. De oude wizard-bestanden blijven op schijf als beschikbaarheids-fallback.

**Tech Stack:** Statische HTML/CSS/JS-site op Netlify · Netlify Functions v2 (Node 20, ESM) · `@anthropic-ai/sdk` · Node built-in `node:test` voor unit-tests · SSE voor streaming.

**Belangrijk contextfeit:** De client-side conversatiegeschiedenis bevat **alleen** `{role, content: string}`-paren — nooit `tool_use`-blokken. De advieskaart is een UI-signaal, geen geschiedenis. Zo voorkomen we de "tool_use zonder tool_result"-400 bij een volgende beurt.

---

## Bestandsstructuur

| Pad | Nieuw/Wijzig | Verantwoordelijkheid |
|---|---|---|
| `package.json` | Nieuw | ESM-project, `@anthropic-ai/sdk`-dep, test-script |
| `netlify.toml` | Nieuw | publish-dir, functions-dir, esbuild-bundler |
| `_redirects` | Wijzig | `/api/chat` → function |
| `.gitignore` | Nieuw/Wijzig | `node_modules`, `.env`, `.netlify` |
| `netlify/functions/lib/kb.mjs` | Nieuw | Aanbod-catalogus + FAQ + `buildSystemPrompt()` + `buildCard()` (enige waarheidsbron) |
| `netlify/functions/lib/tool.mjs` | Nieuw | `presenteer_advies` tool-schema (enum uit KB) |
| `netlify/functions/lib/guards.mjs` | Nieuw | `validateChatRequest()` — request-validatie + caps |
| `netlify/functions/lib/sse.mjs` | Nieuw | `sse()` — SSE-frame-formatter |
| `netlify/functions/lib/*.test.mjs` | Nieuw | Unit-tests voor de pure modules |
| `netlify/functions/chat.mjs` | Nieuw | Handler: valideren → Claude streamen → SSE re-emit |
| `docs/academy-chat/chat.css` | Nieuw | Chat-UI-styling (hergebruikt kaart-classes uit trainingwijzer) |
| `docs/academy-chat/chat.js` | Nieuw | Widget: UI, verzenden, SSE consumeren, kaart + fallback renderen |
| `academy/index.html` | Wijzig | Stylesheet + script-swap (regels 37, 3002) |
| `index.html` | Wijzig | Idem (homepage bevat dezelfde sectie) |
| `docs/trainingwijzer/**` | Blijft | Ongewijzigd op schijf; dormant fallback |

---

## Task 1: Projectscaffolding (package.json, netlify.toml, gitignore)

**Files:**
- Create: `package.json`
- Create: `netlify.toml`
- Create: `.gitignore`
- Modify: `_redirects`

- [ ] **Step 1: Maak `package.json`**

```json
{
  "name": "morgencompany-site",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test netlify/functions/lib/"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.0"
  }
}
```

- [ ] **Step 2: Installeer dependencies**

Run: `npm install`
Expected: `node_modules/` aangemaakt, `package-lock.json` verschijnt, geen fouten.

- [ ] **Step 3: Maak `netlify.toml`**

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

- [ ] **Step 4: Maak `.gitignore`**

```gitignore
node_modules/
.env
.netlify/
```

- [ ] **Step 5: Voeg redirect toe aan `_redirects`**

Voeg deze regel bovenaan `_redirects` toe (vóór de bestaande regels):

```
/api/chat /.netlify/functions/chat 200
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json netlify.toml .gitignore _redirects
git commit -m "chore: scaffold Netlify Functions + Anthropic SDK for academy chat"
```

---

## Task 2: Kennisbank (`kb.mjs`) — aanbod-data + FAQ

De aanbod-data is gemigreerd uit `docs/trainingwijzer/engine.js` (`OFFERS`). Alleen de velden die de chat nodig heeft.

**Files:**
- Create: `netlify/functions/lib/kb.mjs`
- Test: `netlify/functions/lib/kb.test.mjs`

- [ ] **Step 1: Schrijf de falende test**

```js
// netlify/functions/lib/kb.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OFFERS, OFFER_KEYS, findOffer, buildSystemPrompt, buildCard } from './kb.mjs';

test('OFFER_KEYS bevat alle 10 aanbod-keys', () => {
  assert.equal(OFFER_KEYS.length, 10);
  assert.ok(OFFER_KEYS.includes('basis'));
  assert.ok(OFFER_KEYS.includes('masterclass'));
});

test('findOffer geeft het juiste aanbod terug', () => {
  const o = findOffer('basis');
  assert.equal(o.training, 'Basistraining AI');
  assert.ok(Array.isArray(o.bullets));
});

test('findOffer geeft null bij onbekende key', () => {
  assert.equal(findOffer('bestaat-niet'), null);
});

test('buildSystemPrompt bevat merknaam, aanbod en FAQ-instructie', () => {
  const p = buildSystemPrompt();
  assert.ok(p.includes('Morgen Academy'));
  assert.ok(p.includes('Basistraining AI'));
  assert.ok(p.includes('presenteer_advies'));
  assert.ok(p.includes('totmorgen@morgenacademy.nl'));
});

test('buildCard verrijkt een geldige tool-input tot een kaart', () => {
  const card = buildCard({ offer_key: 'basis', vervolg_keys: ['toolbuilding', 'workflows'] });
  assert.equal(card.training, 'Basistraining AI');
  assert.equal(card.vervolg.length, 2);
  assert.equal(card.vervolg[0].training, 'Bouwen met AI (vibecoding)');
});

test('buildCard negeert onbekende vervolg_keys', () => {
  const card = buildCard({ offer_key: 'basis', vervolg_keys: ['nep'] });
  assert.equal(card.vervolg.length, 0);
});
```

- [ ] **Step 2: Draai de test — moet falen**

Run: `node --test netlify/functions/lib/kb.test.mjs`
Expected: FAIL — `Cannot find module './kb.mjs'`

- [ ] **Step 3: Schrijf `kb.mjs`**

```js
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
```

- [ ] **Step 4: Draai de test — moet slagen**

Run: `node --test netlify/functions/lib/kb.test.mjs`
Expected: PASS — alle 6 tests groen.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/kb.mjs netlify/functions/lib/kb.test.mjs
git commit -m "feat: add academy chat knowledge base (offers + faq + system prompt)"
```

---

## Task 3: Tool-schema (`tool.mjs`)

**Files:**
- Create: `netlify/functions/lib/tool.mjs`
- Test: `netlify/functions/lib/tool.test.mjs`

- [ ] **Step 1: Schrijf de falende test**

```js
// netlify/functions/lib/tool.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presenteerAdviesTool } from './tool.mjs';
import { OFFER_KEYS } from './kb.mjs';

test('tool heet presenteer_advies en is strict', () => {
  assert.equal(presenteerAdviesTool.name, 'presenteer_advies');
  assert.equal(presenteerAdviesTool.strict, true);
});

test('offer_key enum bevat exact de KB-keys', () => {
  const enumKeys = presenteerAdviesTool.input_schema.properties.offer_key.enum;
  assert.deepEqual([...enumKeys].sort(), [...OFFER_KEYS].sort());
});

test('vervolg_keys is een array met dezelfde enum', () => {
  const items = presenteerAdviesTool.input_schema.properties.vervolg_keys.items;
  assert.deepEqual([...items.enum].sort(), [...OFFER_KEYS].sort());
});

test('schema staat geen extra properties toe', () => {
  assert.equal(presenteerAdviesTool.input_schema.additionalProperties, false);
});
```

- [ ] **Step 2: Draai de test — moet falen**

Run: `node --test netlify/functions/lib/tool.test.mjs`
Expected: FAIL — `Cannot find module './tool.mjs'`

- [ ] **Step 3: Schrijf `tool.mjs`**

```js
// netlify/functions/lib/tool.mjs
import { OFFER_KEYS } from './kb.mjs';

export const presenteerAdviesTool = {
  name: 'presenteer_advies',
  description:
    'Toon de bezoeker een advieskaart met het best passende Morgen Academy-aanbod. Roep dit aan zodra je genoeg weet om te adviseren.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      offer_key: {
        type: 'string',
        enum: OFFER_KEYS,
        description: 'De key van het best passende aanbod.',
      },
      vervolg_keys: {
        type: 'array',
        description: '0 tot 2 logische vervolgstappen na dit aanbod.',
        items: { type: 'string', enum: OFFER_KEYS },
      },
    },
    required: ['offer_key', 'vervolg_keys'],
    additionalProperties: false,
  },
};
```

- [ ] **Step 4: Draai de test — moet slagen**

Run: `node --test netlify/functions/lib/tool.test.mjs`
Expected: PASS — alle 4 tests groen.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/tool.mjs netlify/functions/lib/tool.test.mjs
git commit -m "feat: add presenteer_advies tool schema"
```

---

## Task 4: Guardrails (`guards.mjs`) + SSE-formatter (`sse.mjs`)

**Files:**
- Create: `netlify/functions/lib/guards.mjs`
- Create: `netlify/functions/lib/sse.mjs`
- Test: `netlify/functions/lib/guards.test.mjs`
- Test: `netlify/functions/lib/sse.test.mjs`

- [ ] **Step 1: Schrijf de falende tests**

```js
// netlify/functions/lib/guards.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateChatRequest, MAX_MESSAGES, MAX_LEN } from './guards.mjs';

test('geldig verzoek wordt geaccepteerd', () => {
  const r = validateChatRequest({ messages: [{ role: 'user', content: 'hoi' }] });
  assert.equal(r.ok, true);
});

test('ontbrekende messages faalt', () => {
  assert.equal(validateChatRequest({}).ok, false);
});

test('lege messages faalt', () => {
  assert.equal(validateChatRequest({ messages: [] }).ok, false);
});

test('te veel berichten faalt', () => {
  const messages = Array.from({ length: MAX_MESSAGES + 1 }, () => ({ role: 'user', content: 'x' }));
  assert.equal(validateChatRequest({ messages }).ok, false);
});

test('te lang bericht faalt', () => {
  const messages = [{ role: 'user', content: 'x'.repeat(MAX_LEN + 1) }];
  assert.equal(validateChatRequest({ messages }).ok, false);
});

test('ongeldige rol faalt', () => {
  assert.equal(validateChatRequest({ messages: [{ role: 'system', content: 'x' }] }).ok, false);
});

test('niet-string content faalt', () => {
  assert.equal(validateChatRequest({ messages: [{ role: 'user', content: 42 }] }).ok, false);
});
```

```js
// netlify/functions/lib/sse.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sse } from './sse.mjs';

test('sse formatteert een object als data-frame', () => {
  assert.equal(sse({ type: 'text', text: 'hoi' }), 'data: {"type":"text","text":"hoi"}\n\n');
});
```

- [ ] **Step 2: Draai de tests — moeten falen**

Run: `node --test netlify/functions/lib/guards.test.mjs netlify/functions/lib/sse.test.mjs`
Expected: FAIL — modules niet gevonden.

- [ ] **Step 3: Schrijf `guards.mjs` en `sse.mjs`**

```js
// netlify/functions/lib/guards.mjs
export const MAX_MESSAGES = 24;
export const MAX_LEN = 2000;
const ROLES = new Set(['user', 'assistant']);

export function validateChatRequest(body) {
  if (!body || !Array.isArray(body.messages)) {
    return { ok: false, error: 'messages ontbreekt of is geen array' };
  }
  const { messages } = body;
  if (messages.length < 1 || messages.length > MAX_MESSAGES) {
    return { ok: false, error: `messages moet 1 tot ${MAX_MESSAGES} items hebben` };
  }
  for (const m of messages) {
    if (!m || !ROLES.has(m.role) || typeof m.content !== 'string') {
      return { ok: false, error: 'elk bericht heeft role (user|assistant) en string content' };
    }
    if (m.content.length < 1 || m.content.length > MAX_LEN) {
      return { ok: false, error: `content moet 1 tot ${MAX_LEN} tekens zijn` };
    }
  }
  return { ok: true };
}
```

```js
// netlify/functions/lib/sse.mjs
export function sse(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}
```

- [ ] **Step 4: Draai de tests — moeten slagen**

Run: `node --test netlify/functions/lib/guards.test.mjs netlify/functions/lib/sse.test.mjs`
Expected: PASS — alle tests groen.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/guards.mjs netlify/functions/lib/sse.mjs netlify/functions/lib/guards.test.mjs netlify/functions/lib/sse.test.mjs
git commit -m "feat: add request guardrails and SSE formatter"
```

---

## Task 5: Chat-handler (`chat.mjs`)

Integratie van de pure modules met de Anthropic SDK. Wordt lokaal via `netlify dev` geverifieerd (geen unit-test; hij belt de echte API).

**Files:**
- Create: `netlify/functions/chat.mjs`

- [ ] **Step 1: Schrijf `chat.mjs`**

```js
// netlify/functions/chat.mjs
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildCard } from './lib/kb.mjs';
import { presenteerAdviesTool } from './lib/tool.mjs';
import { validateChatRequest } from './lib/guards.mjs';
import { sse } from './lib/sse.mjs';

const client = new Anthropic(); // leest ANTHROPIC_API_KEY uit env

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const check = validateChatRequest(body);
  if (!check.ok) return json({ error: check.error }, 400);

  const system = buildSystemPrompt();
  const messages = body.messages;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(sse(obj)));
      try {
        const claude = client.messages.stream({
          model: 'claude-sonnet-5',
          max_tokens: 1024,
          thinking: { type: 'disabled' },
          system,
          tools: [presenteerAdviesTool],
          messages,
        });

        claude.on('text', (delta) => send({ type: 'text', text: delta }));

        const final = await claude.finalMessage();
        const toolUse = final.content.find(
          (b) => b.type === 'tool_use' && b.name === 'presenteer_advies'
        );
        if (toolUse) {
          const card = buildCard(toolUse.input);
          if (card) send({ type: 'advies', card });
        }
        send({ type: 'done' });
      } catch (err) {
        console.error('chat error', err);
        send({ type: 'error', message: 'chat_unavailable' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    },
  });
};
```

- [ ] **Step 2: Zet lokaal de API-key**

Maak een `.env` in de repo-root (staat in `.gitignore`, wordt NIET gecommit):

```
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 3: Start Netlify dev en verifieer de function**

Run: `npx netlify dev` (installeert zo nodig de Netlify CLI; draait de statische site + functions op http://localhost:8888)

Test de function met curl in een tweede terminal:

```bash
curl -N -X POST http://localhost:8888/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"We zijn een team dat net begint met AI en praktisch aan de slag wil."}]}'
```

Expected: een stroom `data: {"type":"text",...}`-frames, gevolgd door `data: {"type":"advies","card":{...}}` met `"training":"Basistraining AI"` (of vergelijkbaar), en tot slot `data: {"type":"done"}`.

- [ ] **Step 4: Verifieer de foutafhandeling**

Test een ongeldig verzoek:

```bash
curl -s -X POST http://localhost:8888/api/chat -H 'content-type: application/json' -d '{}'
```

Expected: HTTP 400 met `{"error":"messages ontbreekt of is geen array"}`.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/chat.mjs
git commit -m "feat: add streaming chat handler wired to Claude Sonnet 5"
```

---

## Task 6: Chat-widget styling (`chat.css`)

Hergebruikt de kaart-classes uit `docs/trainingwijzer/style.css` (`.training-card`, `.training-bullets`, `.btn`, `.btn-primary`, `.btn-secondary`); alleen chat-specifieke UI is nieuw.

**Files:**
- Create: `docs/academy-chat/chat.css`

- [ ] **Step 1: Schrijf `chat.css`**

```css
/* docs/academy-chat/chat.css */
.ac-chat {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ac-chat-log {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 220px;
}
.ac-msg {
  padding: 0.75rem 1rem;
  border-radius: 14px;
  line-height: 1.5;
  max-width: 85%;
  white-space: pre-wrap;
}
.ac-msg-user {
  align-self: flex-end;
  background: var(--pink, #e0218a);
  color: #fff;
}
.ac-msg-bot {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
}
.ac-starters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.ac-starter {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: inherit;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
}
.ac-starter:hover {
  border-color: var(--pink, #e0218a);
}
.ac-input-row {
  display: flex;
  gap: 0.5rem;
}
.ac-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: inherit;
  font: inherit;
}
.ac-send {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: none;
  background: var(--pink, #e0218a);
  color: #fff;
  cursor: pointer;
  font: inherit;
}
.ac-send:disabled {
  opacity: 0.5;
  cursor: default;
}
.ac-typing::after {
  content: '\2026';
  animation: ac-blink 1.2s steps(3, end) infinite;
}
@keyframes ac-blink {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}
.ac-card-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.ac-fallback {
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/academy-chat/chat.css
git commit -m "feat: add academy chat widget styling"
```

---

## Task 7: Chat-widget logica (`chat.js`)

**Files:**
- Create: `docs/academy-chat/chat.js`

- [ ] **Step 1: Schrijf `chat.js`**

```js
// docs/academy-chat/chat.js
// Widget: mount in #trainingwijzer-app, streamt met /api/chat.
// Geschiedenis bevat ALLEEN {role, content:string} — nooit tool-blokken.

const mount = document.getElementById('trainingwijzer-app');
const state = { messages: [], busy: false };

const STARTERS = [
  'We staan aan het begin en willen praktisch met AI aan de slag.',
  'We willen zelf een tool of prototype bouwen.',
  'Wat kost een teamtraining?',
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function render() {
  mount.innerHTML = `
    <div class="ac-chat">
      <div class="ac-chat-log" id="ac-log"></div>
      ${state.messages.length === 0 ? renderStarters() : ''}
      <div class="ac-input-row">
        <input class="ac-input" id="ac-input" type="text" placeholder="Stel je vraag of beschrijf je situatie…" ${state.busy ? 'disabled' : ''} />
        <button class="ac-send" id="ac-send" ${state.busy ? 'disabled' : ''}>Verstuur</button>
      </div>
    </div>`;
  drawLog();
  wire();
}

function renderStarters() {
  return `<div class="ac-starters">${STARTERS.map(
    (s, i) => `<button class="ac-starter" data-starter="${i}">${esc(s)}</button>`
  ).join('')}</div>`;
}

function drawLog() {
  const log = document.getElementById('ac-log');
  if (!log) return;
  log.innerHTML = state.messages
    .map((m) => `<div class="ac-msg ac-msg-${m.role === 'user' ? 'user' : 'bot'}">${esc(m.content)}</div>`)
    .join('');
  log.scrollTop = log.scrollHeight;
}

function wire() {
  const input = document.getElementById('ac-input');
  const send = document.getElementById('ac-send');
  send.addEventListener('click', () => submit(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit(input.value);
  });
  mount.querySelectorAll('[data-starter]').forEach((btn) =>
    btn.addEventListener('click', () => submit(STARTERS[Number(btn.dataset.starter)]))
  );
  if (!state.busy) input.focus();
}

async function submit(text) {
  const value = (text || '').trim();
  if (!value || state.busy) return;

  state.messages.push({ role: 'user', content: value });
  state.busy = true;
  render();

  // Lege bot-bubble die we live vullen.
  const botIndex = state.messages.push({ role: 'assistant', content: '' }) - 1;
  drawLog();

  try {
    await streamReply(botIndex);
  } catch (err) {
    console.error(err);
    renderFallback();
  } finally {
    state.busy = false;
    render();
  }
}

async function streamReply(botIndex) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: state.messages.slice(0, botIndex) }),
  });
  if (!res.ok || !res.body) throw new Error('chat unavailable');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop();
    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith('data:')) continue;
      const evt = JSON.parse(line.slice(5).trim());
      if (evt.type === 'text') {
        state.messages[botIndex].content += evt.text;
        drawLog();
      } else if (evt.type === 'advies') {
        renderCard(evt.card);
      } else if (evt.type === 'error') {
        throw new Error(evt.message || 'chat error');
      }
    }
  }
}

function renderCard(card) {
  const log = document.getElementById('ac-log');
  if (!log) return;
  const vervolg = (card.vervolg || [])
    .map(
      (v) =>
        `<div class="follow-up-card" onclick="scrollToId('${v.sectionTarget}')" style="cursor:pointer">
           <div class="follow-up-card-title">${esc(v.training)}</div>
           <div class="follow-up-card-desc">${esc(v.description)}</div>
         </div>`
    )
    .join('');

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="training-card">
      <div class="training-card-header">
        <h3 class="training-name">${esc(card.training)}</h3>
        <span class="training-duration">${esc(card.duration)}</span>
      </div>
      <ul class="training-bullets">${card.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <div class="ac-card-cta">
        <a href="javascript:void(0)" onclick="scrollToId('ac-aanvraag')" class="btn btn-primary">Vraag dit aan</a>
        <a href="javascript:void(0)" onclick="scrollToId('${card.sectionTarget}')" class="btn btn-secondary">Bekijk ${esc(card.sectionLabel.toLowerCase())}</a>
        <a href="mailto:totmorgen@morgenacademy.nl" class="btn btn-secondary">Stuur ons een bericht</a>
      </div>
      ${vervolg ? `<div class="follow-up-paths"><p class="follow-up-intro">Logische vervolgstappen:</p><div class="follow-up-cards">${vervolg}</div></div>` : ''}
    </div>`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function renderFallback() {
  const log = document.getElementById('ac-log');
  if (!log) return;
  const el = document.createElement('div');
  el.className = 'ac-fallback';
  el.innerHTML = `
    <p>De AI-wijzer is even niet bereikbaar. Je kunt direct een aanvraag doen of ons mailen — we reageren meestal binnen 24 uur.</p>
    <div class="ac-card-cta">
      <a href="javascript:void(0)" onclick="scrollToId('ac-aanvraag')" class="btn btn-primary">Naar het aanvraagformulier</a>
      <a href="mailto:totmorgen@morgenacademy.nl" class="btn btn-secondary">Stuur ons een bericht</a>
      <a href="javascript:void(0)" id="ac-legacy" class="btn btn-secondary">Gebruik de oude routewijzer</a>
    </div>`;
  log.appendChild(el);
  const legacy = el.querySelector('#ac-legacy');
  legacy.addEventListener('click', () => import('/docs/trainingwijzer/main.js'));
}

if (mount) render();
```

- [ ] **Step 2: Commit**

```bash
git add docs/academy-chat/chat.js
git commit -m "feat: add academy chat widget (streaming UI + advies card + fallback)"
```

---

## Task 8: Widget inhaken in de pagina's

Vervang de trainingwijzer-assets door de chat-assets. De mount-id `trainingwijzer-app` en alle `nav()`/`scrollToId()`-verwijzingen blijven ongewijzigd — de chat rendert in dezelfde plek. Het niet meer laden van `main.js` schakelt de oude wizard uit; de bestanden blijven op schijf als fallback (dynamisch geladen bij een storing).

**Files:**
- Modify: `academy/index.html` (regels 37, 3002)
- Modify: `index.html` (dezelfde twee plekken — verifieer de regelnummers)

- [ ] **Step 1: Voeg in `academy/index.html` de chat-stylesheet toe (regel 37)**

Vervang:

```html
<link rel="stylesheet" href="/docs/trainingwijzer/style.css">
```

door (trainingwijzer-style blijft nodig voor de kaart-classes; chat-style erbij):

```html
<link rel="stylesheet" href="/docs/trainingwijzer/style.css">
<link rel="stylesheet" href="/docs/academy-chat/chat.css">
```

- [ ] **Step 2: Swap in `academy/index.html` het script (regel 3002)**

Vervang:

```html
<script type="module" src="/docs/trainingwijzer/main.js"></script>
```

door:

```html
<script type="module" src="/docs/academy-chat/chat.js"></script>
```

- [ ] **Step 3: Pas dezelfde twee wijzigingen toe in `index.html`**

Zoek de plekken op (regelnummers kunnen afwijken):

Run: `grep -n "docs/trainingwijzer/style.css\|docs/trainingwijzer/main.js" index.html`
Expected: twee treffers.

Pas ze identiek aan Step 1 en Step 2 aan (stylesheet erbij, script-src swap).

- [ ] **Step 4: Verifieer met Netlify dev**

Run: `npx netlify dev` en open http://localhost:8888/academy/ (en http://localhost:8888/ ).

Controleer handmatig:
- De trainingwijzer-sectie toont nu de chat (invoerveld + startknoppen), niet de oude vragen.
- Een startknop of eigen bericht levert een streamend antwoord.
- De bot landt op een advieskaart met "Vraag dit aan" (scrollt naar het formulier), "Bekijk [sectie]" en een mailto.
- De bestaande "Start de routewijzer"-knoppen en menulinks scrollen nog steeds naar de sectie.

- [ ] **Step 5: Commit**

```bash
git add academy/index.html index.html
git commit -m "feat: swap trainingwijzer for AI chat widget on academy + homepage"
```

---

## Task 9: Per-IP rate limiting via Netlify Blobs

De caps uit Task 4 begrenzen kosten per gesprek. Deze taak voegt een grove per-IP-limiet toe tegen misbruik. Optioneel te deferren als je snel wilt shippen; de per-request caps zijn dan de enige verdediging.

**Files:**
- Create: `netlify/functions/lib/ratelimit.mjs`
- Modify: `netlify/functions/chat.mjs`

- [ ] **Step 1: Schrijf `ratelimit.mjs`**

```js
// netlify/functions/lib/ratelimit.mjs
import { getStore } from '@netlify/blobs';

const WINDOW_MS = 60 * 60 * 1000; // 1 uur
const MAX_PER_WINDOW = 40; // max verzoeken per IP per uur

// now wordt geïnjecteerd zodat dit testbaar blijft.
export async function checkRateLimit(ip, now = Date.now()) {
  if (!ip) return { ok: true };
  const store = getStore('chat-ratelimit');
  const raw = await store.get(ip, { type: 'json' });
  const hits = Array.isArray(raw) ? raw.filter((t) => now - t < WINDOW_MS) : [];
  if (hits.length >= MAX_PER_WINDOW) return { ok: false };
  hits.push(now);
  await store.setJSON(ip, hits);
  return { ok: true };
}
```

- [ ] **Step 2: Voeg `@netlify/blobs` toe**

Run: `npm install @netlify/blobs`
Expected: dependency toegevoegd aan `package.json`.

- [ ] **Step 3: Haak rate limiting in `chat.mjs`**

Voeg bovenaan de imports toe:

```js
import { checkRateLimit } from './lib/ratelimit.mjs';
```

Voeg direct ná de `validateChatRequest`-check (vóór het opbouwen van `system`) toe:

```js
  const ip = req.headers.get('x-nf-client-connection-ip') || '';
  const limit = await checkRateLimit(ip);
  if (!limit.ok) return json({ error: 'te veel verzoeken, probeer het later opnieuw' }, 429);
```

- [ ] **Step 4: Verifieer**

Run: `npx netlify dev` en stuur snel meer dan 40 verzoeken naar `/api/chat` met dezelfde bron.
Expected: na de limiet HTTP 429. (Bij een laag testvolume: verlaag `MAX_PER_WINDOW` tijdelijk naar 2 om het gedrag te zien, en zet het daarna terug.)

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/ratelimit.mjs netlify/functions/chat.mjs package.json package-lock.json
git commit -m "feat: add per-IP rate limiting via Netlify Blobs"
```

---

## Task 10: Volledige testrun + deploy-voorbereiding

**Files:**
- (geen nieuwe bestanden)

- [ ] **Step 1: Draai alle unit-tests**

Run: `npm test`
Expected: alle tests in `netlify/functions/lib/` groen.

- [ ] **Step 2: End-to-end via Netlify dev**

Run: `npx netlify dev`, open `/academy/`, voer een volledig gesprek: begin-situatie beschrijven → advieskaart → een feitvraag stellen ("Wat kost een teamtraining?") → controleer dat de bot naar contact/formulier verwijst en niets over prijs verzint.

- [ ] **Step 3: Zet de productie-env var**

Zet in de Netlify-projectinstellingen (UI, niet in de repo) de environment variable `ANTHROPIC_API_KEY`. Bevestig dat de key NIET in de git-historie staat: `git log -p | grep -i "sk-ant"` moet leeg zijn.

- [ ] **Step 4: Merge/deploy**

Volg de reguliere flow om `feature/morgen-een-merk` te deployen. Netlify installeert de function-dependencies automatisch bij de build.

---

## Self-review (uitgevoerd)

**Spec-dekking:**
- Echt-AI-gevoel / streaming → Task 5 (SSE) + Task 7 (live rendering). ✓
- Academy-assistent (routeert + feitvragen) → `buildSystemPrompt` met FAQ, Task 2. ✓
- Claude als engine, beslisboom vervalt → geen `determineRoute`; systeem-prompt + tool, Task 2/3/5. ✓
- Advieskaart via tool-call → Task 3 (`presenteer_advies`) + Task 5 (`buildCard`) + Task 7 (render). ✓
- Chat adviseert, formulier vangt → CTA `scrollToId('ac-aanvraag')`, Task 7. ✓
- Backend houdt key geheim + guardrails → Task 1/4/5/9. ✓
- Fallback (oude wizard dormant) → script-swap Task 8 + `renderFallback` met `import('/docs/trainingwijzer/main.js')` Task 7. ✓
- Kennisbank als enige waarheidsbron, `OFFERS` hergebruikt → Task 2. ✓
- Portabiliteit (losse module) → widget hangt alleen aan mount-id + globale `scrollToId`; function is los. ✓
- Model Sonnet 5, thinking uit voor latency → Task 5. ✓

**Placeholder-scan:** geen TBD/TODO; alle code-stappen bevatten volledige code. Aanbod-data volledig uitgeschreven in Task 2.

**Type-consistentie:** `OFFER_KEYS` (kb) → enum (tool) → `buildCard` (kb) → `card`-velden (`training`, `duration`, `bullets`, `sectionTarget`, `sectionLabel`, `vervolg[].training/description/sectionTarget`) consistent gebruikt in `chat.js` `renderCard`. SSE-event-types (`text`/`advies`/`error`/`done`) consistent tussen `chat.mjs` en `chat.js`.

**Bekende aandachtspunten voor de uitvoerder:**
- Regelnummers in `index.html` (Task 8 Step 3) verifiëren met grep — de homepage kan afwijken van `academy/index.html`.
- SDK-versie in `package.json` (`^0.70.0`) is een richtwaarde; `npm install @anthropic-ai/sdk@latest` en de streaming-API (`client.messages.stream`, `.on('text')`, `.finalMessage()`) verifiëren.
- Aanwezigheid van een sectie met id `ac-aanvraag` (aanvraagformulier) in de pagina bevestigen; anders het juiste CTA-doel kiezen.
