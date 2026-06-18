# StockMarketWave

Static starter landing page for `stockmarketwave.com`. Plain HTML/CSS/JS with **no build step, no package manager, and no external dependencies** (`index.html`, `styles.css`, `script.js`).

## Cursor Cloud specific instructions

- This is a fully static site. There are no dependencies to install, no lint config, no tests, and no build step. Python 3 is preinstalled and is all that is needed.
- Run the dev server from the repo root: `python3 -m http.server 8000`, then open `http://localhost:8000/`. See `README.md` for details.
- `script.js` provides the only client-side behavior: the mobile "Menu" nav toggle (`.nav-toggle` → toggles `.open` on `.nav-links`) and setting the footer copyright year via `new Date().getFullYear()`. The "Menu" toggle button is only visible at mobile widths; nav links are always shown on desktop.
- In-page navigation links/buttons are plain `#anchor` jumps (no router); they navigate instantly rather than via JS.
