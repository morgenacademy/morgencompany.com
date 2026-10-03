import { renderGroeiladder } from './groeiladder.js';

export function renderResult(route) {
  if (route.external) {
    return renderExternalResult(route);
  }

  const ladder = renderGroeiladder(route.levelFrom, route.levelTo);
  const followUpPaths = renderNextPaths(route.nextPaths);

  return `
    <div class="screen result-screen active">
      <div class="result-header">
        <div class="result-label">Jullie slimste start</div>
        <h1 class="result-title">${route.training}</h1>
        <p class="result-description">${route.description}</p>
        <div class="result-pills">
          <span class="result-pill">${route.startTypeLabel}</span>
          <span class="result-pill">${route.audienceLabel}</span>
        </div>
      </div>

      <div class="result-rationale">
        <p>${route.why}</p>
      </div>

      <div class="result-body">
        <div class="result-main">
          <div class="training-card">
            <div class="training-card-header">
              <h3 class="training-name">${route.training}</h3>
              <span class="training-duration">${route.duration}</span>
            </div>
            <ul class="training-bullets">
              ${route.bullets.map((b) => `<li>${b}</li>`).join('')}
            </ul>
            <div class="team-note">Beste eerste stap: ${route.startTypeLabel}</div>
            ${route.followUp ? `<div class="follow-up-note">${route.followUp}</div>` : ''}

            <div class="training-cta">
              <a href="javascript:void(0)" onclick="openTrainingPopup('${route.popupKey}')" class="btn btn-primary">Meer over dit aanbod</a>
              <a href="javascript:void(0)" onclick="scrollToId('${route.sectionTarget}')" class="btn btn-secondary">Bekijk ${route.sectionLabel.toLowerCase()}</a>
              <a href="mailto:totmorgen@morgenacademy.nl" class="btn btn-secondary">Stuur ons een bericht</a>
            </div>
          </div>
        </div>

        <div class="result-ladder">
          ${ladder}
        </div>
      </div>

      ${followUpPaths}

      <button class="restart-link" data-action="restart">Opnieuw beginnen</button>
    </div>
  `;
}

function renderExternalResult(route) {
  return `
    <div class="screen result-screen active">
      <div class="result-header">
        <div class="result-label">Jullie slimste start</div>
        <h1 class="result-title">${route.training}</h1>
        <p class="result-description">${route.description}</p>
        <div class="result-pills">
          <span class="result-pill">${route.startTypeLabel}</span>
          <span class="result-pill">${route.audienceLabel}</span>
        </div>
      </div>

      <div class="result-rationale">
        <p>${route.why}</p>
      </div>

      <div class="result-cta result-cta-centered">
        <a href="javascript:void(0)" onclick="goToAcademy('online')" class="btn btn-primary">Bekijk online aanbod</a>
        <a href="javascript:void(0)" onclick="openTrainingPopup('${route.popupKey}')" class="btn btn-secondary">Meer over de basistraining</a>
        <a href="mailto:totmorgen@morgenacademy.nl" class="btn btn-secondary">Stuur ons een bericht</a>
      </div>

      <button class="restart-link" data-action="restart">Opnieuw beginnen</button>
    </div>
  `;
}

function renderNextPaths(nextPaths = []) {
  if (!nextPaths.length) return '';

  return `
    <div class="follow-up-paths">
      <p class="follow-up-intro">Logische vervolgstappen:</p>
      <div class="follow-up-cards">
        ${nextPaths
          .map(
            (p) => `
          <div class="follow-up-card" onclick="openTrainingPopup('${p.popupKey}')" style="cursor:pointer">
            <div class="follow-up-card-title">${p.title}</div>
            <div class="follow-up-card-desc">${p.desc}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}
