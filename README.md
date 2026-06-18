# StockMarketWave

Starter repository for `stockmarketwave.com`, a future stock market calculators,
tools, comparison, and investing insights website.

## Current status

This branch contains a static starter landing page with:

- Mobile-first responsive homepage
- Planned calculator sections
- Future roadmap sections
- Accessible mobile navigation
- Plain CSS and JavaScript files for direct static hosting
- No external dependencies

## Project structure

```text
.
├── index.html
├── styles.css
└── script.js
```

### Code organization

- `index.html` keeps content in semantic sections: header, hero, calculators,
  tools, roadmap, status, and footer.
- `styles.css` is plain CSS, organized with numbered sections for design tokens,
  base styles, layout, components, page sections, and responsive rules.
- `script.js` stores navigation, header, and footer behavior.

Plain CSS is used instead of SCSS so Hostinger can serve uploaded files directly
without any compile/build step.

## Run locally

Use any static file server. For example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

These files can be deployed to Hostinger, Vercel, Netlify, Cloudflare Pages, or
any static hosting provider.

For Hostinger file manager, upload:

- `index.html`
- `styles.css`
- `script.js`

Make sure the final structure in `public_html` is:

```text
public_html/
├── index.html
├── styles.css
└── script.js
```

## Disclaimer

StockMarketWave is planned for educational tools and informational content only.
It should not be presented as financial advice.
