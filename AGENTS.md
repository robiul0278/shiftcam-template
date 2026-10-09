# ShiftCam Static Site — AGENTS.md

A 7-page static demo of shiftcam.com (mobile filmmaking gear). No package.json, no build, no framework — vanilla HTML + Tailwind CDN + one JS file.

## Pages (only these 7)

| File | Page |
|---|---|
| `index.html` | Homepage (shell that injects `components/` + `sections/` partials) |
| `pages/shop.html` | Shop by Device (product listing: device tabs, filters, sort, price range) |
| `pages/product-page.html` | Single product (ProGrip SuperZoom Kit: gallery, variants, add-ons, mount picker) |
| `pages/cart.html` | Cart (qty steppers, remove, order summary with local recompute) |
| `pages/checkout.html` | Checkout (Shopify-style: summary aside + contact/delivery/shipping/payment form) |
| `pages/contact-us.html` | Contact (form + email/social sidebar) |
| `404.html` | Not-found page |

## Serving the site

- **Must use a local server**: `npx --yes serve -l 8000 .` (Node v24 present; Python is not installed).
- **`file://` URLs do NOT work** — `data-include` partials, Tailwind CDN and lucide init all require a server context served from the repo root.

## HTML partials (`data-include`)

- `index.html`, every `pages/*.html` file and `404.html` load shared chrome via `[data-include]` (`components/announcement-bar.html`, `components/navbar.html`, `components/footer.html`). `checkout.html` intentionally loads **no** chrome (minimal header only, standard for checkout).
- `js/main.js` fetches these at runtime: `const load = async el => { const r = await fetch(el.dataset.include); el.outerHTML = await r.text() }`.
- **Inline `<script>` inside a partial never executes** (injected via `outerHTML`) — all behaviour must live in `js/main.js` or in a `<script>` on the real page. `sections/gallery.html`, `sections/features.html` and `components/footer.html` previously had dead inline scripts; their logic now lives in `main.js`.
- **Do not rename partial files** — they are referenced by exact string in `data-include` attributes.

## JavaScript

- `js/main.js` — shared behaviour on every page except none: partial loading, `lucide.createIcons()` (guarded), static-demo toast (`[data-static-note]` / `[data-static-form]`, exposed as `window.showStaticToast`), mobile menu, footer accordion, generic `[data-slider]` carousels, FAQ accordion, hero carousel, announcement slider, gallery arrow visibility, features slider, testimonial slider (guarded when absent), SuperZoom tab filter, awards marquee, scroll-aware navbar. All blocks no-op gracefully when their elements are missing (interior pages).
- Page-local `<script>` blocks (run on the real page, not injected): shop filtering/sorting (`pages/shop.html`), PDP option selection (`pages/product-page.html`), cart math (`pages/cart.html`).
- **No bundler, no framework** — vanilla JS only.

## CSS

- Tailwind via CDN `https://cdn.tailwindcss.com` — classes resolve at runtime.
- Each page `<head>` carries an inline `tailwind.config` (Inter + `ink` color). Only `pages/checkout.html` additionally uses `<style type="text/tailwindcss">` (`@apply` component classes).
- **Do not remove the Tailwind CDN script** or the inline `tailwind.config` block.
- Lucide is pinned: `https://unpkg.com/lucide@1.48.0/dist/umd/lucide.min.js` (never `@latest`).

## Images (`images/`)

- Filenames are lowercase kebab-case. Product shots live in `images/product/`, campaign renders in `images/superzoom/`, the rest grouped by section (`hero/`, `empower/`, `blog/`, `gallery/`, `testimonial/`, `award-logo/`), plus two collection banners at root.
- Path prefix: `./images/<file>` from root pages, `../images/<file>` from `pages/`. Shared chrome partials (`components/`) contain **no** `<img>` tags, so they inject safely at any depth.
- There are no missing/placeholder images: every `<img>` resolves to a file on disk.

## Cross-linking conventions

- Links **inside shared chrome** (`components/navbar.html`, `components/footer.html`) and homepage sections are **root-relative** (`/pages/shop.html`, `/#guide`) so they work identically from `/`, `/pages/*` and `/404.html`.
- Links **inside `pages/`** use `./<page>.html` for siblings and `/` for home.
- Product/collection/blog tiles with no dedicated page point at the closest in-scope page (`/pages/shop.html`, `/pages/product-page.html`, `/#faq`); policy/legal links stay `href="#"` (out of scope).

## Forms & cart (static demo)

- There is **no backend and no persistent cart state**. `data-static-form` intercepts submit and shows a toast; `data-static-note` shows a toast on click.
- Working client-side only: shop filters/sort/price, PDP variant+mount selection (mount required before the demo "Add to cart" toast), cart qty/remove/totals recompute.
- Checkout totals, discount code, shipping options and payment fields are hardcoded display values.
