# StockMarketWave

Starter repository for `stockmarketwave.com`, a future stock market calculators,
tools, comparison, and investing insights website.

## Current status

This branch contains a static starter landing page with:

- Mobile-first responsive homepage
- Planned calculator sections
- Future roadmap sections
- Accessible mobile navigation
- Structured CSS and JavaScript assets
- No external dependencies

## Project structure

```text
.
├── index.html
└── assets
    ├── css
    │   ├── main.css
    │   ├── 01-tokens.css
    │   ├── 02-base.css
    │   ├── 03-layout.css
    │   ├── 04-components.css
    │   ├── 05-sections.css
    │   └── 06-responsive.css
    └── js
        └── main.js
```

### Code organization

- `index.html` keeps content in semantic sections: header, hero, calculators,
  tools, roadmap, status, and footer.
- `assets/css/01-tokens.css` stores shared design values.
- `assets/css/02-base.css` stores reset and global element styles.
- `assets/css/03-layout.css` stores containers, grids, and page shell layout.
- `assets/css/04-components.css` stores reusable UI components.
- `assets/css/05-sections.css` stores homepage section-specific styles.
- `assets/css/06-responsive.css` stores mobile-first breakpoint rules.
- `assets/js/main.js` stores navigation, header, and footer behavior.

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
- `assets/`

Make sure the final structure in `public_html` is:

```text
public_html/
├── index.html
└── assets/
    ├── css/
    └── js/
```

## Disclaimer

StockMarketWave is planned for educational tools and informational content only.
It should not be presented as financial advice.
