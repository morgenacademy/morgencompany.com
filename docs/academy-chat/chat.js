// docs/academy-chat/chat.js
// Het Kompas: chat-widget die streamt met /api/chat.
//
// Multi-instance: elke mount (#trainingwijzer-app of [data-kompas]) krijgt zijn
// eigen initKompas()-closure met eigen state, zodat de widget zowel op de
// landingspagina als in de academy-sectie kan staan (zelfde document, SPA).
//
// Twee gescheiden datastructuren per instance:
// - state.log  : geordende UI-items {type:'user'|'bot', text} | {type:'card', card} | {type:'fallback'}
//                De log wordt altijd volledig uit state.log gerenderd, zodat kaarten
//                en fallbacks bewaard blijven (niet los in de DOM geappend en weggeveegd).
// - state.messages : schone conversatie voor de API — ALLEEN {role, content:string},
//                nooit tool-blokken en nooit lege content (voorkomt API-400).

const STARTERS = [
  'We willen zelf een tool of prototype bouwen.',
  'Ons team wil meer uit Claude Code halen.',
  'We willen een proces laten automatiseren of iets laten bouwen.',
  'We willen projectmanagement slimmer aanpakken met AI.',
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Mini-markdown voor bot-tekst: alleen **vet** en case-links. Eerst escapen
// (XSS-veilig), dan pas markering omzetten. Links zijn whitelisted: alleen
// interne /projecten-links (de bewijs-cases), altijd in een nieuw venster.
const SAFE_LINK = /^\/projecten\/(#[a-zA-Z0-9-]+)?$/;
const md = (s) =>
  esc(s)
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (m, label, href) =>
      SAFE_LINK.test(href)
        ? `<a href="${href}" target="_blank" rel="noopener" class="ac-case-link">${label}</a>`
        : label
    )
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

function itemHtml(item) {
  if (item.type === 'user') {
    return `<div class="ac-msg ac-msg-user">${esc(item.text)}</div>`;
  }
  if (item.type === 'bot') {
    return `<div class="ac-msg ac-msg-bot">${md(item.text)}</div>`;
  }
  if (item.type === 'card') return cardHtml(item.card);
  if (item.type === 'fallback') return fallbackHtml();
  return '';
}

// ── Gespreks-overdracht ──────────────────────────────────────────────
// Zodra het Kompas een advies geeft, bewaren we de samenvatting van het
// gesprek. Elk aanvraagformulier op de site vult die automatisch voor in,
// zodat de bezoeker het verhaal niet opnieuw hoeft te typen.

const HANDOFF_KEY = 'kompas-handoff';
const HANDOFF_TTL = 60 * 60 * 1000; // 1 uur

function saveHandoff(card) {
  if (!card.samenvatting) return;
  try {
    sessionStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({ training: card.training, samenvatting: card.samenvatting, ts: Date.now() })
    );
  } catch (e) {
    /* storage niet beschikbaar: prefill slaan we dan gewoon over */
  }
}

function readHandoff() {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.samenvatting || Date.now() - (data.ts || 0) > HANDOFF_TTL) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function handoffText(data) {
  return `Via het Kompas kwam ik uit bij: ${data.training}.\n\n${data.samenvatting}`;
}

// Vult de vraag-textarea van de aanvraagformulieren voor (alleen als die leeg is).
function prefillKompasForms() {
  const data = readHandoff();
  if (!data) return;
  document.querySelectorAll('#hm-vraag, #ac-vraag, #te-proces, #co-uitdaging').forEach((ta) => {
    if (ta && ta.value.trim() === '') ta.value = handoffText(data);
  });
}

function mailtoHref(card) {
  const subject = encodeURIComponent(`Aanvraag via het Kompas: ${card.training}`);
  const body = card.samenvatting
    ? `&body=${encodeURIComponent(handoffText({ training: card.training, samenvatting: card.samenvatting }))}`
    : '';
  return `mailto:totmorgen@morgenacademy.nl?subject=${subject}${body}`;
}

function cardHtml(card) {
  const vervolg = (card.vervolg || [])
    .map(
      (v) =>
        `<div class="ac-followup" onclick="location.href='${v.href}'">
           <div class="ac-followup-title">${esc(v.training)}</div>
           <div class="ac-followup-desc">${esc(v.description)}</div>
         </div>`
    )
    .join('');

  return `
    <div class="ac-card">
      <div class="ac-card-head">
        <h3 class="ac-card-title">${esc(card.training)}</h3>
        <span class="ac-card-duration">${esc(card.duration)}</span>
      </div>
      ${card.waarom ? `<p class="ac-card-why">${md(card.waarom)}</p>` : ''}
      <ul class="ac-card-bullets">${card.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <div class="ac-card-cta">
        <a href="${card.href}" class="ac-btn ac-btn-primary">Bekijk deze stap</a>
        <a href="${mailtoHref(card)}" class="ac-btn ac-btn-secondary">Stuur ons een bericht</a>
      </div>
      ${card.samenvatting ? '<p class="ac-card-handoff">Je verhaal nemen we mee: het aanvraagformulier staat alvast voor je ingevuld.</p>' : ''}
      ${vervolg ? `<div class="ac-followups"><p class="ac-followups-intro">Logische vervolgstappen</p><div class="ac-followups-grid">${vervolg}</div></div>` : ''}
    </div>`;
}

function fallbackHtml() {
  return `
    <div class="ac-fallback">
      <p>Het Kompas is even niet bereikbaar. Je kunt direct een gesprek aanvragen of ons mailen. We reageren meestal binnen een werkdag.</p>
      <div class="ac-card-cta">
        <a href="/#home-aanvraag" class="ac-btn ac-btn-primary">Plan een kennismakingsgesprek</a>
        <a href="mailto:totmorgen@morgenacademy.nl" class="ac-btn ac-btn-secondary">Stuur ons een bericht</a>
      </div>
    </div>`;
}

function initKompas(mount) {
  const state = { log: [], messages: [], busy: false, touched: false };

  function render() {
    mount.innerHTML = `
      <div class="ac-chat">
        <div class="ac-chat-log"></div>
        ${state.log.length === 0 ? renderStarters() : ''}
        <div class="ac-input-row">
          <input class="ac-input" type="text" placeholder="Stel je vraag of beschrijf je situatie…" ${state.busy ? 'disabled' : ''} />
          <button class="ac-send" ${state.busy ? 'disabled' : ''}>Verstuur</button>
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
    const log = mount.querySelector('.ac-chat-log');
    if (!log) return;
    log.innerHTML = state.log.map(itemHtml).join('');
    log.scrollTop = log.scrollHeight;
  }

  function wire() {
    const input = mount.querySelector('.ac-input');
    const send = mount.querySelector('.ac-send');
    send.addEventListener('click', () => submit(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit(input.value);
    });
    mount.querySelectorAll('[data-starter]').forEach((btn) =>
      btn.addEventListener('click', () => submit(STARTERS[Number(btn.dataset.starter)]))
    );
    // Alleen focussen als de bezoeker deze instance al gebruikt — anders steelt
    // de widget de paginafocus bij laden (er staan er twee in het document).
    if (state.touched && !state.busy) input.focus();
  }

  async function submit(text) {
    const value = (text || '').trim();
    if (!value || state.busy) return;

    state.touched = true;
    state.log.push({ type: 'user', text: value });
    state.messages.push({ role: 'user', content: value });
    state.busy = true;
    render();

    // Bot-bubble die we live vullen. Zit in de log, nog NIET in state.messages.
    const botItem = { type: 'bot', text: '' };
    state.log.push(botItem);
    drawLog();

    let errored = false;
    try {
      await streamReply(botItem);
    } catch (err) {
      console.error(err);
      errored = true;
    } finally {
      if (botItem.text.trim() === '') {
        // Lege reply (fout, of alleen een tool-call): bubble weg uit de log en
        // niet naar de API-historie — anders faalt de volgende call op lege content.
        const i = state.log.indexOf(botItem);
        if (i !== -1) state.log.splice(i, 1);
      } else {
        state.messages.push({ role: 'assistant', content: botItem.text });
      }
      if (errored) state.log.push({ type: 'fallback' });
      state.busy = false;
      render();
    }
  }

  async function streamReply(botItem) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: state.messages }),
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
          botItem.text += evt.text;
          drawLog();
        } else if (evt.type === 'advies') {
          state.log.push({ type: 'card', card: evt.card });
          saveHandoff(evt.card);
          prefillKompasForms(); // formulier op dezelfde pagina meteen voorinvullen
          drawLog();
        } else if (evt.type === 'error') {
          throw new Error(evt.message || 'chat error');
        }
      }
    }
  }

  render();
}

document.querySelectorAll('#trainingwijzer-app, [data-kompas]').forEach(initKompas);

// Cross-page overdracht: kwam de bezoeker via een advieskaart op een andere
// pagina (consultancy/technology) of scrollt die zelf naar het formulier,
// dan staat het verhaal er al.
prefillKompasForms();
