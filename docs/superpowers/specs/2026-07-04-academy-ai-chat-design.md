# Ontwerp: Trainingwijzer vervangen door AI-chat (Morgen Academy)

**Datum:** 2026-07-04
**Repo:** MorgenCompany.com (statische site, Netlify)
**Branch (nu):** feature/morgen-een-merk

## Aanleiding

De huidige trainingwijzer is een 4-vragen beslisboom (`docs/trainingwijzer/`, vanilla JS, volledig client-side). Hij mapt de antwoorden deterministisch naar één van ~11 aanbod-opties met vaste "waarom"- en "vervolg"-copy.

De drijfveer om te vervangen is **niet** dat de wijzer stuk is — hij werkt. De drijfveer is **positionering / dogfooding**: Morgen Academy is een AI-academy, en een statische beslisboom op die site voelt tegenstrijdig. Een echte AI-conversatie laat zien wat we bouwen en verkopen.

## Doel

Vervang de beslisboom-wijzer door een AI-chat die:
1. Echt AI voelt (vrije tekst, streamend antwoord, snapt nuance) — het is zelf de demo.
2. Bezoekers naar het juiste aanbod leidt (training, masterclass, begeleiding).
3. Feitvragen beantwoordt (prijzen, online/locatie, inhoud, AI Act) uit een gecureerde kennisbank.
4. Landt op een advieskaart met een CTA naar het bestaande aanvraagformulier.

## Scope-beslissingen (vastgesteld)

- **Model:** Claude API. (Exacte tier = open beslissing, zie onder.)
- **Breedte:** Academy-assistent — routeert én beantwoordt feitvragen, niet alleen een smalle router.
- **Brain:** Claude ís de engine. De deterministische beslisboom (`engine.js` → `determineRoute`) **vervalt**. Claude redeneert zelf over de aanbod-opties. Géén deterministische kruischeck (die zou de rigide 4-slot-invoer terugbrengen en botsingen creëren).
- **Advieskaart:** komt uit een **tool-call**, niet uit vrije tekst. Claude roept `presenteer_advies(offer_key, vervolg_keys[])` aan met een enum van échte offer-keys. Zo landt de bot nooit op een verzonnen training.
- **Conversie-eindpunt:** chat adviseert, bestaand aanvraagformulier vangt de lead. Geen leadcapture in de chat (geen PII in de chat, geen extra backend daarvoor).
- **Vangnet:** de deterministische boom komt **niet** in het brein. De oude wizard-files blijven wél staan als **beschikbaarheids-fallback** (API down, budget op, chat laadt niet) — verder dormant.
- **Netlify Functions:** worden geconfigureerd (kleine infra-stap; de site draait al op Netlify).

## Architectuur

```
Browser (chat-widget, vanilla JS)
   │  POST /api/chat  (berichtgeschiedenis)
   ▼
Netlify Function  (netlify/functions/chat)
   │  - houdt Anthropic API-key geheim (env var)
   │  - rate-limit per IP + max berichten per sessie + token-cap
   │  - streamt SSE terug naar de browser
   ▼
Claude API (streaming, tool use)
   ▲
   │  systeem-prompt = merk + gedrag + gecureerde kennisbank
```

### Componenten

| Component | Bestand(en) | Verantwoordelijkheid |
|---|---|---|
| Chat-widget | `docs/academy-chat/chat.js`, `chat.css` | Rendert chat-UI in de bestaande sectie, streamt tokens, rendert advieskaart uit tool-call, valt terug bij fout. Eén helder doel: UI + transport. |
| Netlify Function | `netlify/functions/chat.js` (of `.mts`) | Enige plek met de API-key. Proxyt naar Claude, streamt SSE, bewaakt rate-limit/token-cap. Eén helder doel: veilige proxy + guardrails. |
| Kennisbank | `docs/academy-chat/kb.js` (of `.md`) | Enige waarheidsbron: aanbod-catalogus (uit `engine.js` `OFFERS`) + handgeschreven FAQ. Puur data, geen logica. |
| Systeem-prompt | in de Function of `kb.js` | Merk-tone (morgen-schrijfstijl), gedragsregels, guardrails, injecteert de kennisbank. |

### De "brain" — kern

1. Systeem-prompt bevat de volledige aanbod-catalogus (11 opties met `training`, `description`, `bullets`, `duration`, `sectionTarget`) + FAQ.
2. Claude converseert vrij, verzamelt signalen (voor wie, hoe ver met AI, wat nu nodig).
3. Zodra Claude genoeg weet, roept hij de tool `presenteer_advies` aan:
   - `offer_key`: enum van de échte offer-keys (`online_basis`, `basis`, `teamworkshop`, `workflows`, `toolbuilding`, `claudecode`, `samenwerken`, `managers`, `masterclass`, `chancesession`).
   - `vervolg_keys`: 0–2 logische vervolgstappen (dezelfde enum).
4. Frontend vangt de tool-call en rendert de advieskaart + CTA-knop naar het aanvraagformulier, in dezelfde stijl als de huidige resultaatkaart.

De aanbod-data (`OFFERS` uit `engine.js`) blijft dus behouden — hij verhuist naar de kennisbank. Alleen de beslisboom-logica (`determineRoute` en de `buildXRoute`-functies) vervalt.

## Guardrails, kosten en fallback

- **Systeem-prompt:** alleen Morgen Academy-scope; geen prijzen/voorwaarden verzinnen buiten de kennisbank → bij twijfel verwijzen naar contact (`totmorgen@morgenacademy.nl`); off-topic beleefd terugbuigen.
- **Kosten/misbruik:** rate-limit per IP + max berichten per sessie + `max_tokens`-cap in de Function. Voor lage latency: extended thinking uit of op lage effort (dit is een router, geen diep redeneerprobleem).
- **Fallback:** bij API-fout, rate-limit of budget-op toont de Function/widget een nette melding + directe link naar het aanvraagformulier. De oude wizard-files (`docs/trainingwijzer/`) blijven staan als stille noodrem: gegarandeerde bodem, kost niets extra.

## Wat blijft, wat vervalt

**Vervalt (uit het actieve pad):**
- `docs/trainingwijzer/main.js` — beslisboom-navigatie
- `docs/trainingwijzer/questions.js` — vaste vragen
- `docs/trainingwijzer/engine.js` — `determineRoute` + `buildXRoute`-logica
- `docs/trainingwijzer/results.js`, `groeiladder.js` — voor zover niet hergebruikt

**Blijft / hergebruikt:**
- `OFFERS`-data → verhuist naar `kb.js`
- Kaart-styling uit `docs/trainingwijzer/style.css` (advieskaart-look)
- Bestaand aanvraagformulier + alle `nav()`/`scrollToId()`-links naar de sectie
- Volledige `docs/trainingwijzer/`-map blijft fysiek staan als beschikbaarheids-fallback

## Portabiliteit (één-merk-consolidatie)

De één-merk-consolidatie loopt (academy verhuist naar de academy.nl React-repo, canonical `academy.morgencompany.com`). De widget wordt daarom als losse module gebouwd: geen harde afhankelijkheid van deze statische pagina, zodat hij mee kan naar de React-repo. De Netlify Function is los herbruikbaar.

## Prerequisites

- Anthropic API-key + billing geregeld (bevestigd aanwezig; door gebruiker in te stellen als env var op Netlify).
- Netlify Functions ingeschakeld op het project.

## Model (besloten)

**Claude Sonnet 5** (`claude-sonnet-5`) — $3 / $15 per 1M tokens (intro $2 / $10 t/m 2026-08-31). Balans tussen redenering, tool use en streaming-snelheid; geschikt voor een publieke pagina met volume.

Overwogen alternatieven, voor de volledigheid: Haiku 4.5 ($1/$5, sneller/goedkoper maar minder "wow") en Opus 4.8 ($5/$25, premium maar duur per gesprek). Sonnet 5 is het startpunt; na meten kan de tier worden bijgesteld.

Aandachtspunten voor de implementatie (uit de Claude-API-richtlijnen):
- Sonnet 5 zet **adaptive thinking standaard aan** als `thinking` wordt weggelaten. Voor lage latency op deze router: expliciet `thinking: {type: "disabled"}` of lage `effort` overwegen.
- Nieuwe tokenizer (~30% meer tokens dan Sonnet 4.6) — relevant voor kosten- en token-budgetberekening.
- `max_tokens` bij streaming ruim genoeg zetten; advieskaart komt via strict tool use.

## Openstaand voor implementatieplan

- Exacte Netlify Functions-runtime (Node vs edge) en of streaming (SSE) volledig ondersteund wordt of dat een non-streaming fallback nodig is.
- Precieze rate-limit-drempels.
- Definitieve tekst systeem-prompt (via morgen-schrijfstijl) en FAQ-inhoud.
