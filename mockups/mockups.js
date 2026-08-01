const grid = document.querySelector('[data-mockup-grid]');
const status = document.querySelector('[data-local-status]');
const toast = document.querySelector('[data-toast]');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

async function copyText(value, message) {
  try {
    await navigator.clipboard.writeText(value);
    showToast(message);
  } catch {
    showToast('Copy failed — select and copy it manually.');
  }
}

function createIcon(path) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}

function renderMockups(mockups) {
  if (!mockups.length) {
    grid.innerHTML = '<div class="empty-card"><div><strong>No mockups yet.</strong><p>Run the command above, or ask Codex to create a client mockup. A private business-name and 12-digit URL will be generated automatically.</p></div></div>';
    return;
  }

  grid.replaceChildren();
  for (const mockup of mockups) {
    const card = document.createElement('article');
    card.className = 'mockup-card';

    const heading = document.createElement('h3');
    heading.textContent = mockup.name;
    const id = document.createElement('p');
    id.className = 'mockup-id';
    id.textContent = mockup.id;
    const date = document.createElement('p');
    date.className = 'mockup-date';
    date.textContent = `Updated ${new Intl.DateTimeFormat('en-NZ', { dateStyle: 'medium' }).format(new Date(mockup.updated))}`;

    const actions = document.createElement('div');
    actions.className = 'mockup-actions';
    const open = document.createElement('a');
    open.className = 'mockup-link';
    open.href = mockup.localUrl;
    open.target = '_blank';
    open.rel = 'noopener';
    open.innerHTML = `${createIcon('M14 5h5v5m0-5-9 9M5 8v11h11v-5')}<span>Open</span>`;
    const copy = document.createElement('button');
    copy.className = 'copy-link';
    copy.type = 'button';
    copy.innerHTML = `${createIcon('M9 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm-5 7H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1')}<span>Copy link</span>`;
    copy.addEventListener('click', () => copyText(mockup.shareUrl, 'Client link copied.'));
    actions.append(open, copy);
    card.append(heading, id, date, actions);
    grid.append(card);
  }
}

document.querySelector('[data-copy-command]').addEventListener('click', () => {
  copyText('npm run mockup:new -- "Client name"', 'Creation command copied.');
});

fetch('/__mockups', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Local endpoint unavailable');
    return response.json();
  })
  .then((data) => {
    status.textContent = `${data.mockups.length} local mockup${data.mockups.length === 1 ? '' : 's'}`;
    renderMockups(data.mockups);
  })
  .catch(() => {
    status.textContent = 'Private listing hidden on the live site';
    grid.innerHTML = '<div class="empty-card"><div><strong>Your client links stay private.</strong><p>The mockup library only appears while you run this site locally. Individual preview URLs still work for clients, but this page never publishes their directory.</p></div></div>';
  });
