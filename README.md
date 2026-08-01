# Better Site

Static website for Better Site by Benjamin.

## Main files

- `index.html` is the homepage.
- `7347546bac0a.css` contains the shared site styling.
- `941ef33d4ed0.js` contains shared interactions, transitions, form checks, and UI helpers.
- `assets/r/` contains live image assets used by the site.
- `demo/` contains linked concept/demo pages shown from the portfolio.
- `mockup/<business-name>-<12-digit-id>/` contains unlisted client previews. Create one with `npm run mockup:new -- "Client name"`.
- `/mockups/` is a non-indexed workspace page. Its client library is only populated by the local development server and is never published as a public directory.
- `local-server.py` previews the site locally with clean URLs and the custom 404 page.
- `llms.txt`, `llms-full.txt`, `ai.txt`, `humans.txt`, `site-summary.txt`, `services.txt`, `pricing.txt`, and `faq.txt` provide crawler-friendly plain-text context for search engines, AI assistants, and future maintainers.
- `robots.txt` and `sitemap.xml` provide crawl guidance and canonical public page references for `https://bettersite.co.nz`.

Generated screenshots, local logs, and Python cache files are ignored by `.gitignore`.

## Client mockup workflow

Run `npm run mockup:new -- "Client name"`, then build the design inside the generated folder. The command prints both the local preview URL and the production link to paste into a DM or email. Run `node local-server.js 8000` and open `http://127.0.0.1:8000/mockups/` to see and copy all local client links.
