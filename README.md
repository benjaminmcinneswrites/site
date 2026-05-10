# Better Site

Personal multi-page static website for Better Site by Benjamin McInnes.

## Pages

- `index.html` - home page with the free homepage mockup offer and personal positioning.
- `work.html` - demo concept sites and portfolio placeholder cards.
- `services.html` - website design, hosting, care plans, and target industries.
- `why-choose-us.html` - why choose Better Site instead of a DIY website builder.
- `pricing.html` - starter, standard, and care plan pricing.
- `care-plans.html` - monthly hosting, support, backup, edit, and care plan options.
- `process.html` - four-step free homepage mockup process.
- `about.html` - Benjamin McInnes personal about page.
- `faq.html` - common questions and answers.
- `contact.html` - simple contact page with a frontend-only contact form.
- `request.html` - free homepage mockup request form.
- `404.html` - page not found screen for missing URLs.
- `demo/tradie/index.html` - tradie concept page.
- `demo/workshop/index.html` - mechanic/workshop concept page.
- `demo/wellness/index.html` - wellness/appointment concept page.
- `demo/retail/index.html` - retail/brand concept page.
- `demo/cafe/index.html` - cafe/hospitality concept page.

## Shared Files

- `styles.css` - dark/light theme, responsive layouts, cards, forms, and demo styling.
- `script.js` - theme switcher, mobile menu, sticky header, reveal animations, footer year, and form validation.
- `assets/images/logo.png` - logo used for the site brand mark and favicon.
- `.htaccess` and `_redirects` - common static-host fallbacks for sending missing URLs to `404.html`.

## 404 Behaviour

GitHub Pages automatically serves `404.html` for missing hosted URLs when this file is in the published site root. When opening files directly with `file://`, a browser cannot intercept a made-up missing file path, so open `404.html` directly to preview the design locally.

To test the designed 404 locally, use the included server instead of `python -m http.server`:

```powershell
python local-server.py
```

Then visit a missing URL such as `http://127.0.0.1:8000/dfgdg.html`.

If port `8000` is already being used, choose another port:

```powershell
python local-server.py 8001
```

## Customisation

- Name/brand: search for `Better Site` and `Benjamin McInnes`.
- Email: search for `hello@benjaminmcinnes.co.nz`.
- Pricing: search for `From $599`, `From $999`, and `From $19/month`.
- Portfolio placeholders: search for `Portfolio Project 1` and `Portfolio Project 2`.
- Form success message: edit `script.js`.

Open `index.html` directly in a browser, or run a simple local server from this folder.
