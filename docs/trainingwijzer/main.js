import { questions } from './questions.js';
import { determineRoute } from './engine.js';
import { renderResult } from './results.js';

// ── App State ──
const state = {
  currentStep: -1, // -1 = welcome
  answers: {},
  direction: 'forward',
};

const app = document.getElementById('trainingwijzer-app');

// ── Rendering ──

function render() {
  const html =
    state.currentStep === -1
      ? renderWelcome()
      : state.currentStep < questions.length
        ? renderQuestion(state.currentStep)
        : renderResultScreen();

  transition(html);
}

function transition(html) {
  const dir = state.direction;
  app.classList.add(dir === 'forward' ? 'slide-out-left' : 'slide-out-right');

  setTimeout(() => {
    app.innerHTML = html;
    app.classList.remove('slide-out-left', 'slide-out-right');
    app.classList.add(dir === 'forward' ? 'slide-in-right' : 'slide-in-left');

    setTimeout(() => {
      app.classList.remove('slide-in-right', 'slide-in-left');
    }, 400);
  }, 250);
}

// ── Welcome Screen ──

function renderWelcome() {
  return `
    <div class="screen welcome-screen">
      <div class="welcome-content">
        <div class="welcome-badge">Morgen Academy</div>
        <h1 class="welcome-title">Ontdek jullie <span class="highlight">slimste start</span></h1>
        <p class="welcome-subtitle">
          Beantwoord een paar korte vragen en ontdek wat nu de slimste eerste stap is:
          een training op de leerlijn, een masterclass of eerst samen scherpte krijgen.
        </p>
        <button class="btn btn-primary btn-large" data-action="start">
          Start de routewijzer
        </button>
        <p class="welcome-note">Duurt ongeveer 1 minuut</p>
      </div>
      <div class="welcome-visual">
        <div class="route-preview">
          ${renderRoutePreview()}
        </div>
      </div>
    </div>
  `;
}

function renderRoutePreview() {
  const stops = [
    { label: 'Training', active: true },
    { label: 'Masterclass', active: false },
    { label: 'Begeleiding', active: false },
  ];
  return stops
    .map(
      (s, i) => `
    <div class="route-stop ${s.active ? 'active' : ''}">
      <div class="route-dot"></div>
      ${i < stops.length - 1 ? '<div class="route-connector"></div>' : ''}
      <span class="route-stop-label">${s.label}</span>
    </div>
  `
    )
    .join('');
}

// ── Question Screen ──

function renderQuestion(stepIndex) {
  const q = questions[stepIndex];
  const total = questions.length;
  const progress = ((stepIndex + 1) / total) * 100;
  const selectedAnswer = state.answers[q.id] || null;

  return `
    <div class="screen question-screen">
      <div class="question-header">
        ${stepIndex > 0 ? '<button class="tw-back-btn" data-action="back" aria-label="Vorige vraag">&larr;</button>' : '<div></div>'}
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${stepIndex + 1} / ${total}</span>
      </div>

      <div class="question-body">
        <h2 class="question-text">${q.question}</h2>
        <div class="options-grid ${q.options.length === 2 ? 'options-two' : ''}">
          ${q.options
            .map(
              (opt) => `
            <button
              class="option-card ${selectedAnswer === opt.id ? 'selected' : ''}"
              data-action="answer"
              data-question="${q.id}"
              data-answer="${opt.id}"
            >
              <span class="option-label">${opt.label}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

// ── Result Screen ──

function renderResultScreen() {
  const route = determineRoute(state.answers);
  return renderResult(route);
}

// ── Event Handling ──

app.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;

  switch (action) {
    case 'start':
      state.direction = 'forward';
      state.currentStep = 0;
      render();
      break;

    case 'answer':
      state.answers[btn.dataset.question] = btn.dataset.answer;
      state.direction = 'forward';
      state.currentStep++;
      render();
      break;

    case 'back':
      state.direction = 'backward';
      state.currentStep--;
      render();
      break;

    case 'restart':
      state.direction = 'backward';
      state.currentStep = -1;
      state.answers = {};
      render();
      break;
  }
});

// ── Initial Render ──
render();
