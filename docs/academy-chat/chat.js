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
