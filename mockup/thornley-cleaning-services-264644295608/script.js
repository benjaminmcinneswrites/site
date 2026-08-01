const serviceComparison = document.querySelector('[data-service-comparison]');
const serviceOptions = [...document.querySelectorAll('[data-service-option]')];
const serviceSummary = document.querySelector('[data-service-summary]');

function selectService(option) {
  serviceComparison.dataset.activeIndex = option.dataset.index;
  serviceSummary.textContent = option.dataset.summary;

  for (const candidate of serviceOptions) {
    const isSelected = candidate === option;
    candidate.closest('.service-option').classList.toggle('is-active', isSelected);
    candidate.setAttribute('aria-pressed', String(isSelected));
  }
}

for (const option of serviceOptions) {
  option.addEventListener('pointerenter', () => selectService(option));
  option.addEventListener('focus', () => selectService(option));
  option.addEventListener('click', () => selectService(option));
}

const cleanReveal = document.querySelector('[data-clean-reveal]');
const cleanHero = document.querySelector('[data-clean-hero]');
const revealStage = document.querySelector('[data-reveal-stage]');
const revealControl = document.querySelector('[data-reveal-control]');
const scrollRevealMode = window.matchMedia('(max-width: 820px)');
let revealFrame = 0;

function setReveal(value) {
  const boundedValue = Math.min(100, Math.max(0, Number(value)));
  const nextValue = Math.round(boundedValue * 100) / 100;
  cleanReveal.style.setProperty('--reveal', `${nextValue}%`);
  revealControl.value = String(nextValue);
  revealControl.setAttribute('aria-valuetext', `${Math.round(nextValue)} percent clean`);
}

function setRevealFromPointer(event) {
  const bounds = revealStage.getBoundingClientRect();
  setReveal(((event.clientX - bounds.left) / bounds.width) * 100);
}

function usesScrollReveal() {
  return scrollRevealMode.matches;
}

function updateScrollReveal() {
  revealFrame = 0;
  if (!usesScrollReveal()) return;

  const heroBounds = cleanHero.getBoundingClientRect();
  const revealDistance = cleanHero.offsetHeight - window.innerHeight;
  const progress = revealDistance > 0 ? -heroBounds.top / revealDistance : 1;
  setReveal(progress * 100);
}

function scheduleScrollReveal() {
  if (!usesScrollReveal() || revealFrame) return;
  revealFrame = window.requestAnimationFrame(updateScrollReveal);
}

function syncRevealMode() {
  revealControl.disabled = false;

  if (scrollRevealMode.matches) {
    updateScrollReveal();
  } else {
    setReveal(50);
  }
}

revealStage.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse' && !usesScrollReveal()) {
    setRevealFromPointer(event);
  }
});

revealStage.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'mouse' && !usesScrollReveal()) {
    setRevealFromPointer(event);
  }
});

revealControl.addEventListener('input', () => {
  if (!usesScrollReveal()) setReveal(revealControl.value);
});

window.addEventListener('scroll', scheduleScrollReveal, { passive: true });
window.addEventListener('resize', scheduleScrollReveal);

for (const mediaQuery of [scrollRevealMode]) {
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', syncRevealMode);
  } else {
    mediaQuery.addListener(syncRevealMode);
  }
}

syncRevealMode();

const frequencyField = document.querySelector('[data-frequency-field]');
const scheduleSelector = document.querySelector('[data-schedule-selector]');

frequencyField.addEventListener('change', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.name === 'frequency') {
    scheduleSelector.dataset.position = event.target.value;
  }
});

const mockForm = document.querySelector('[data-mock-form]');

mockForm.addEventListener('submit', (event) => {
  // Intentionally disabled: this visual mockup must never send or store form information.
  event.preventDefault();
});
