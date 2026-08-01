const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname);
const port = Number(process.argv[2] || 8000);
const publicMockupBase = (process.env.MOCKUP_PUBLIC_BASE || 'https://bettersite.co.nz').replace(/\/$/, '');

const cleanRedirects = new Map([
  ['/index.html', '/'],
  ['/work.html', '/work'],
  ['/services.html', '/pricing#website-projects'],
  ['/why-choose-us.html', '/why-choose-us'],
  ['/pricing.html', '/pricing'],
  ['/care-plans.html', '/pricing#care-plans'],
  ['/about.html', '/why-choose-us'],
  ['/faq.html', '/faq'],
  ['/contact.html', '/contact'],
  ['/request.html', '/request'],
  ['/free-website-mockup.html', '/request'],
  ['/thanks.html', '/thanks'],
  ['/small-business-website-design-nz.html', '/small-business-website-design-nz'],
  ['/affordable-web-design-nz.html', '/affordable-web-design-nz'],
  ['/website-design-pricing-nz.html', '/website-design-pricing-nz'],
  ['/website-redesign-nz.html', '/website-redesign-nz'],
  ['/privacy-policy.html', '/privacy-policy'],
  ['/terms-of-service.html', '/terms-of-service'],
  ['/hosting-care-terms.html', '/hosting-care-terms'],
  ['/refunds-cancellations.html', '/refunds-cancellations'],
  ['/acceptable-use.html', '/acceptable-use'],
  ['/cookie-policy.html', '/cookie-policy'],
  ['/accessibility.html', '/accessibility'],
]);

const legacyRedirects = new Map([
  ['/about', '/why-choose-us'],
  ['/services', '/pricing#website-projects'],
  ['/care-plans', '/pricing#care-plans'],
  ['/free-website-mockup', '/request'],
]);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function setNoCacheHeaders(response) {
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
}

function safePathname(url) {
  try {
    return decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
}

function resolveFile(pathname) {
  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;

  try {
    if (fs.statSync(candidate).isDirectory()) {
      const indexFile = path.join(candidate, 'index.html');
      if (fs.existsSync(indexFile)) return indexFile;
    } else {
      return candidate;
    }
  } catch {
    if (!path.extname(candidate)) {
      const htmlFile = `${candidate}.html`;
      if (fs.existsSync(htmlFile)) return htmlFile;
    }
  }

  return null;
}

function sendFile(request, response, file, status = 200) {
  const body = fs.readFileSync(file);
  setNoCacheHeaders(response);
  response.statusCode = status;
  response.setHeader('Content-Type', mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Content-Length', body.length);
  if (request.method === 'HEAD') return response.end();
  response.end(body);
}

function readMockups() {
  const mockupRoot = path.join(root, 'mockup');
  if (!fs.existsSync(mockupRoot)) return [];

  return fs.readdirSync(mockupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^(?:[a-z0-9]+(?:-[a-z0-9]+)*-)?\d{12}$/.test(entry.name))
    .map((entry) => {
      const indexFile = path.join(mockupRoot, entry.name, 'index.html');
      if (!fs.existsSync(indexFile)) return null;
      const html = fs.readFileSync(indexFile, 'utf8');
      const title = (html.match(/<meta\s+name=["']mockup-client["']\s+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<title>(.*?)<\/title>/is)?.[1])
        ?.replace(/\s+[—|-]\s+Private website preview.*$/i, '')
        ?.replace(/&amp;/g, '&')
        ?.replace(/&lt;/g, '<')
        ?.replace(/&gt;/g, '>')
        ?.replace(/&quot;/g, '"')
        ?.replace(/&#39;/g, "'")
        ?.trim() || `Mockup ${entry.name}`;
      return {
        id: entry.name,
        name: title,
        updated: fs.statSync(indexFile).mtime.toISOString(),
        localUrl: `/mockup/${entry.name}/`,
        shareUrl: `${publicMockupBase}/mockup/${entry.name}/`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
  const pathname = safePathname(requestUrl);
  if (!pathname) {
    response.writeHead(400);
    return response.end('Bad request');
  }

  if (pathname === '/__mockups') {
    const body = Buffer.from(JSON.stringify({ mockups: readMockups() }));
    setNoCacheHeaders(response);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Content-Length', body.length);
    if (request.method === 'HEAD') return response.end();
    return response.end(body);
  }

  const redirectTarget = cleanRedirects.get(pathname) || legacyRedirects.get(pathname);
  if (redirectTarget) {
    const query = requestUrl.search || '';
    const [redirectPath, redirectFragment] = redirectTarget.split('#', 2);
    const location = `${redirectPath}${query}${redirectFragment ? `#${redirectFragment}` : ''}`;
    setNoCacheHeaders(response);
    response.writeHead(301, { Location: location, 'Content-Length': '0' });
    return response.end();
  }

  if (/^\/mockups?\//.test(pathname)) {
    response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    response.setHeader('Referrer-Policy', 'no-referrer');
  }

  const file = resolveFile(pathname);
  if (file) return sendFile(request, response, file);

  const notFound = path.join(root, '404.html');
  if (fs.existsSync(notFound)) return sendFile(request, response, notFound, 404);
  response.writeHead(404);
  response.end('File not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving Better Site at http://127.0.0.1:${port}/`);
  console.log('Clean URLs and missing URLs are supported. Press Ctrl+C to stop.');
});
