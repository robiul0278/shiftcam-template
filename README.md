# ShiftCam Static Site

A 7-page static demo of shiftcam.com (mobile filmmaking gear). No build step, no package.json, no dependencies — just static HTML + Tailwind CDN + vanilla JS.

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage (hero, best sellers, categories, brand, SuperZoom, collections, gear guide, testimonials, gallery, FAQ, features) |
| `pages/shop.html` | Shop by Device — product listing with device tabs, category/phone filters, sort and price range |
| `pages/product-page.html` | ProGrip SuperZoom Kit — gallery, lens variants, add-ons, mount picker, FAQ |
| `pages/cart.html` | Cart — quantity steppers, remove, free-shipping progress, order summary |
| `pages/checkout.html` | Checkout — order summary + contact/delivery/shipping/payment form |
| `pages/contact-us.html` | Contact — form + email/social sidebar |
| `404.html` | Not-found page — simple centered design. **Must stay at the site root**: static servers only serve a root-level `404.html` for unknown URLs |

## Running Locally

This site **requires a local server** — it will not work via `file://` because it uses:
- `data-include` partials (navbar, footer, sections loaded at runtime via JS)
- Tailwind CSS via CDN (classes resolve at runtime)
- Lucide icons (initialized via `lucide.createIcons()` in `js/main.js`)

### Start the server

```bash
npx --yes serve -l 8000 .
```

Then open **http://localhost:8000/** in your browser.

> **Note:** Python is not installed in this environment. Node v24 is available.

## Project Structure

```
index.html           — Homepage (loads partials via data-include)
404.html             — Not-found page (loads shared chrome via data-include)
pages/               — shop.html, product-page.html, cart.html, checkout.html, contact-us.html
components/          — announcement-bar.html, navbar.html, footer.html, cart-drawer.html (shared chrome)
sections/            — 11 homepage partials (hero, best-sellers, …)
js/main.js           — shared behaviour: partials, toast, sliders, accordions, navbar
images/              — all media (kebab-case filenames, no gaps)
AGENTS.md            — contributor conventions (linking, partials, static-demo rules)
```

## Key Conventions

- **Partials**: pages inject `components/*.html` via `[data-include]`; homepage additionally injects `sections/*.html`. Do not rename partial files. Inline `<script>` inside a partial never runs — put behaviour in `js/main.js`.
- **Cross-links**: root-relative (`/pages/shop.html`, `/#faq`) inside shared chrome and sections; `./page.html` between sibling files in `pages/`.
- **Images**: `./images/` from root, `../images/` from `pages/`.
- **Forms/Cart**: static demos — `data-static-note` / `data-static-form` show a toast via `js/main.js`. Shop filters, PDP options and cart math work client-side only; checkout is hardcoded display.
- **Lucide**: pinned UMD build `lucide@1.48.0` (never `@latest`).

## Verification

Serve the site, then check for broken local references:

```bash
node -e '
const fs=require("fs"),path=require("path");
const files=["index.html","404.html",...fs.readdirSync("pages").map(f=>"pages/"+f)];
const attr=/(?:href|src|data-include)="([^"]+)"/g;let bad=0;
for(const f of files){const s=fs.readFileSync(f,"utf8");let m;
 while((m=attr.exec(s))){const u=m[1].split("#")[0];if(!u||/^(https?:|\/\/|mailto:|tel:|data:)/.test(u))continue;
 const p=path.normalize(u.startsWith("/")?u.slice(1):path.join(path.dirname(f),u));
 if(!fs.existsSync(p)){bad++;console.log("MISSING: "+f+" -> "+u);}}}
console.log(bad+" missing");'
```

All local `href`/`src`/`data-include` references resolve; every `<img>` has a file on disk.
# shiftcam-template
