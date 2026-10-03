/**
 * Renders an animated growth ladder (groeiladder) showing
 * the user's current level and where the training takes them.
 * Styled as a visual route / path with descriptions per step.
 */

const LEVELS = [
  {
    level: 1,
    label: 'Exploratie & Experimenteren',
    desc: 'Gevoel krijgen bij wat kan, spelen met AI',
  },
  {
    level: 2,
    label: 'Dagelijks werken met AI',
    desc: 'AI als vast hulpmiddel in je werk',
  },
  {
    level: 3,
    label: 'Herbruikbare assistenten en flows',
    desc: 'Prompts vastleggen en standaardiseren',
  },
  {
    level: 4,
    label: 'Procesintegratie',
    desc: 'Werkprocessen koppelen aan tools en data',
    isAgentic: true,
  },
  {
    level: 5,
    label: 'Maatwerk & Automatisering',
    desc: 'Agents die zelfstandig taken uitvoeren',
    isAgentic: true,
  },
  {
    level: 6,
    label: 'Strategische transformatie',
    desc: 'AI ingebed in strategie en cultuur',
  },
];

export function renderGroeiladder(levelFrom, levelTo) {
  if (levelTo === null) return '';

  const stepsHtml = LEVELS.map((lvl) => {
    const isFrom = lvl.level === levelFrom;
    const isTo = lvl.level === levelTo;
    const isOnRoute = lvl.level >= levelFrom && lvl.level <= levelTo;
    const isBetween = isOnRoute && !isFrom && !isTo;

    let markerClass = 'ladder-step';
    if (isOnRoute) markerClass += ' on-route';
    if (isFrom) markerClass += ' level-from';
    if (isTo) markerClass += ' level-to';
    if (isBetween) markerClass += ' level-between';

    const animDelay = Math.max(0, (lvl.level - levelFrom) * 0.12);

    // Build the marker (dot + connecting line)
    const dot = `<div class="ladder-dot"><span class="ladder-num">${lvl.level}</span></div>`;
    const line = lvl.level < 6 ? '<div class="ladder-line"></div>' : '';

    // Build the content
    const badge = lvl.isAgentic && isOnRoute
      ? '<span class="ladder-badge">Agentic AI</span>'
      : '';
    const tag = isFrom
      ? '<span class="ladder-tag ladder-tag-from">Jullie staan hier</span>'
      : isTo
        ? '<span class="ladder-tag ladder-tag-to">Hier brengen we jullie</span>'
        : '';

    return `
      <div class="${markerClass}" style="--anim-delay: ${animDelay}s">
        <div class="ladder-marker">
          ${dot}
          ${line}
        </div>
        <div class="ladder-content">
          <div class="ladder-label-row">
            <span class="ladder-label">${lvl.label}</span>
            ${badge}
          </div>
          <span class="ladder-desc">${lvl.desc}</span>
          ${tag}
        </div>
      </div>
    `;
  }).reverse().join('');

  return `
    <div class="groeiladder" role="img" aria-label="Groeipad van level ${levelFrom} naar level ${levelTo}">
      <div class="ladder-title">Jullie groeipad</div>
      <div class="ladder-steps">
        ${stepsHtml}
      </div>
    </div>
  `;
}
