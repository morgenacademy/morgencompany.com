// docs/academy-chat/chat.js
// Widget: mount in #trainingwijzer-app, streamt met /api/chat.
//
// Twee gescheiden datastructuren:
// - state.log  : geordende UI-items {type:'user'|'bot', text} | {type:'card', card} | {type:'fallback'}
//                De log wordt altijd volledig uit state.log gerenderd, zodat kaarten
//                en fallbacks bewaard blijven (niet los in de DOM geappend en weggeveegd).
// - state.messages : schone conversatie voor de API — ALLEEN {role, content:string},
//                nooit tool-blokken en nooit lege content (voorkomt API-400).

const mount = document.getElementById('trainingwijzer-app');
const state = { log: [], messages: [], busy: false };

const STARTERS = [
  'We staan aan het begin en willen praktisch met AI aan de slag.',
  'We willen zelf een tool of prototype bouwen.',
  'Wat kost een teamtraining?',
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Globale hook voor de fallback-knop (inline onclick, want de log wordt via innerHTML gerenderd).
window.acLoadLegacy = () => import('/docs/trainingwijzer/main.js');

function render() {
  mount.innerHTML = `
    <div class="ac-chat">
      <div class="ac-chat-log" id="ac-log"></div>
      ${state.log.length === 0 ? renderStarters() : ''}
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

function itemHtml(item) {
  if (item.type === 'user' || item.type === 'bot') {
    return `<div class="ac-msg ac-msg-${item.type}">${esc(item.text)}</div>`;
  }
  if (item.type === 'card') return cardHtml(item.card);
  if (item.type === 'fallback') return fallbackHtml();
  return '';
}

function drawLog() {
  const log = document.getElementById('ac-log');
  if (!log) return;
  log.innerHTML = state.log.map(itemHtml).join('');
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
        drawLog();
      } else if (evt.type === 'error') {
        throw new Error(evt.message || 'chat error');
      }
    }
  }
}

function cardHtml(card) {
  const vervolg = (card.vervolg || [])
    .map(
      (v) =>
        `<div class="follow-up-card" onclick="scrollToId('${v.sectionTarget}')" style="cursor:pointer">
           <div class="follow-up-card-title">${esc(v.training)}</div>
           <div class="follow-up-card-desc">${esc(v.description)}</div>
         </div>`
    )
    .join('');

  return `
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
}

function fallbackHtml() {
  return `
    <div class="ac-fallback">
      <p>De AI-wijzer is even niet bereikbaar. Je kunt direct een aanvraag doen of ons mailen — we reageren meestal binnen 24 uur.</p>
      <div class="ac-card-cta">
        <a href="javascript:void(0)" onclick="scrollToId('ac-aanvraag')" class="btn btn-primary">Naar het aanvraagformulier</a>
        <a href="mailto:totmorgen@morgenacademy.nl" class="btn btn-secondary">Stuur ons een bericht</a>
        <a href="javascript:void(0)" onclick="acLoadLegacy()" class="btn btn-secondary">Gebruik de oude routewijzer</a>
      </div>
    </div>`;
}

if (mount) render();
