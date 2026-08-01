const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const siteRoot = path.resolve(__dirname, '..');
const mockupRoot = path.join(siteRoot, 'mockup');
const publicBase = (process.env.MOCKUP_PUBLIC_BASE || 'https://bettersite.co.nz').replace(/\/$/, '');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const clientName = args.filter((argument) => argument !== '--dry-run').join(' ').trim() || 'New client';

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'client';
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function randomNumericId() {
  let id = '';
  while (id.length < 12) {
    for (const byte of crypto.randomBytes(12)) {
      if (byte < 250) id += String(byte % 10);
      if (id.length === 12) break;
    }
  }
  return id;
}

const clientSlug = slugify(clientName);
let id = randomNumericId();
let folderName = `${clientSlug}-${id}`;
while (fs.existsSync(path.join(mockupRoot, folderName))) {
  id = randomNumericId();
  folderName = `${clientSlug}-${id}`;
}

const destination = path.join(mockupRoot, folderName);
const safeClientName = escapeHtml(clientName);
const indexHtml = `<!doctype html>
<html lang="en-NZ">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="referrer" content="no-referrer">
  <meta name="mockup-client" content="${safeClientName}">
  <title>${safeClientName} — Private website preview</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <p class="eyebrow">Private design preview</p>
    <h1>${safeClientName}</h1>
    <p class="intro">Your custom website mockup is ready to be built in this private preview space.</p>
  </main>
</body>
</html>
`;

const stylesCss = `:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #102a3a;
  background: #f6f9f7;
}

* { box-sizing: border-box; }

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: radial-gradient(circle at top, #edf6f2, #f6f9f7 48%);
}

main {
  width: min(680px, 100%);
  padding: clamp(32px, 7vw, 72px);
  border: 1px solid #d8e6e1;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(16, 42, 58, 0.12);
}

.eyebrow {
  margin: 0 0 16px;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.25rem, 8vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.intro {
  max-width: 540px;
  margin: 24px 0 0;
  color: #60727c;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
}
`;

if (!dryRun) {
  fs.mkdirSync(mockupRoot, { recursive: true });
  fs.mkdirSync(destination, { recursive: false });
  fs.writeFileSync(path.join(destination, 'index.html'), indexHtml, { flag: 'wx' });
  fs.writeFileSync(path.join(destination, 'styles.css'), stylesCss, { flag: 'wx' });
}

console.log(dryRun ? 'Mockup dry run (no files created)' : 'Mockup created');
console.log(`Client: ${clientName}`);
console.log(`Folder: mockup/${folderName}/`);
console.log(`Local:  http://127.0.0.1:8000/mockup/${folderName}/`);
console.log(`Share:  ${publicBase}/mockup/${folderName}/`);
