# MoonCosmo

A static, client-side Angular landing page with a skincare recommendation quiz and a
local cart that hands off to Shopify Checkout.

**Three constraints hold throughout the codebase:**

1. **No backend.** No `HttpClient`, no `fetch`, no SSR. All data lives in static
   TypeScript files under `src/app/data/`; all state lives in signals and
   `localStorage`. The build output is pure static files.
2. **English only.** `<html lang="en" dir="ltr">`, no i18n layer, no language toggle.
3. **No payment or shipping details are ever collected.** There is no checkout form.
   The last step on this site is a cart review with one button that leaves for Shopify.

---

## Run and build

```sh
npm install
npm start                      # dev server on http://localhost:4200
npm run build                  # production build → dist/mooncosmo/browser
npm run test:unit              # unit tests (Vitest)
npm run e2e                    # end-to-end tests (Playwright, Chromium + WebKit)
```

`npm run e2e` starts its own dev server on port 4300. First run only:
`npx playwright install chromium webkit`.

### Deploying to Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist/mooncosmo/browser`

`public/_redirects` contains `/*  /index.html  200` so client-side routes
(`/shop`, `/quiz`, `/cart`) resolve on a hard refresh.

---

## Where to change things

| I want to… | Edit |
|---|---|
| **Update prices** | `src/app/data/products.data.ts` — `originalPrice` / `salePrice`. Every price, strikethrough, savings badge and cart total is derived from these two numbers. |
| **Add Shopify variant IDs** | `src/app/data/products.data.ts` — `variantId`. Any value starting with `TODO_` blocks checkout with a visible error instead of building a broken permalink. |
| **Define packages** | `src/app/data/packages.data.ts`. `products` lists the slugs added to the cart as separate line items; the bundle's `originalPrice`/`salePrice` are its own numbers, not derived from the products. |
| **Set phone / WhatsApp / email** | `src/app/data/contact.data.ts` — also social links, Shopify policy page URLs, and the footer blurb. |
| **Point at a different Shopify store** | `src/app/data/shopify.config.ts` — `STORE_DOMAIN`. |
| **Change quiz wording** | `src/app/data/quiz.data.ts` — question titles, answer labels, tone swatches, the "why we chose this" fragments, analysis messages, animation duration. |
| **Replace the placeholder reviews** | `src/app/data/reviews.data.ts` — every entry is a marked placeholder. Empty the array and the home-page section hides itself. |
| **Edit product copy** | `src/app/data/products.data.ts` — `description` is the flyer line; everything else is the PRODUCT MASTER SHEET verbatim. `benefits` are approved claims: never add to or reword them. |
| **Modify the recommendation tables** | `src/app/services/recommendation.engine.ts` — see below. |
| **Swap assets** | `src/assets/README.md` documents every file and its dimensions. |
| **Adjust the visual system** | `src/styles/_tokens.scss` — colours, type scale, spacing, radii, z-index ladder, breakpoints. |

### Modifying the recommendation logic

The quiz is **five questions, all always shown** — there are no conditional branches
and no skipped steps:

| # | Question | Role |
|---|---|---|
| 1 | Age | Cosmetic only — collected, never scored |
| 2 | Skin tone | Hard filter |
| 3 | Skin type | Hard filter + suitability bonus |
| 4 | Main concern | Points |
| 5 | Desired result | Points |

Five tables in `src/app/services/recommendation.engine.ts` drive everything:

- **`TONE_ELIGIBILITY[tone][slug]`** and **`TYPE_ELIGIBILITY[skinType][slug]`** — hard
  filters. A product excluded by *either* can never be recommended, whatever it scores.
- **`TYPE_BONUS`**, **`CONCERN_POINTS`**, **`RESULT_POINTS`** — additive scores.
- **`TIE_BREAK_ORDER`** — resolves equal scores, so every path is deterministic.

`score = TYPE_BONUS + CONCERN_POINTS + RESULT_POINTS`; the top two eligible products
are returned. Nothing else needs to change when you edit a table.

Two invariants are worth knowing:

- **Age never affects the result.** It appears in no table in the engine — the file
  does not even import the type. `recommendation.engine.spec.ts` asserts that any two
  paths differing only in age give identical output.
- **The Minty Fresh Clay Mask is not in the quiz at all.** The scoring tables are keyed
  by `ScoredSlug`, which excludes it by construction, so the compiler — not a test —
  is what keeps it out of every scoring path. It is the unconditional *routine
  completer* offered after the result, with a menthol sensitivity notice for dry and
  sensitive skin.

All 720 paths (4 tones × 5 types × 6 concerns × 6 results) are asserted exhaustively in
`recommendation.engine.spec.ts`: every one returns exactly two products, and no path
ever returns a product excluded by either filter.

`src/app/services/recommendation.engine.spec.ts` asserts all 30 skin-type × need
combinations against the source table and walks every reachable path to prove the
result is always 1 or 2 products. Change a table and the failing test tells you exactly
what moved.

---

## Architecture

Angular 22, standalone components only, `OnPush` everywhere, signals for all state, no
NgRx, strict TypeScript. Strict MVVM:

- **Model** — `models/` (interfaces) and `data/` (static content).
- **ViewModel** — `viewmodels/` and `services/`: `@Injectable`s holding state and
  business logic, exposing `readonly` signals plus methods.
- **View** — `pages/`, `components/`, `ui/`: inject a ViewModel, render, call methods.
  No business logic in component classes, no computation in templates.

```
src/app/
  models/       product · quiz · cart · package interfaces
  data/         products · packages · quiz · contact · shopify config
  services/     recommendation.engine (pure) · cart · shopify · persistence ·
                toast · meta-description
  viewmodels/   shop · quiz · cart
  guards/       quiz-state.guard — repairs invalid persisted state, else redirects to /
  pages/        home · shop · quiz · cart   (lazy-loaded routes)
  components/   feature components
  ui/           moon-button · moon-modal · price-display · toast-host ·
                quantity-stepper · product-image
src/styles/     _tokens · _mixins · _typography · _reset · _buttons
```

### Routes

| Route | Contains |
|---|---|
| `/` | Hero + quiz invitation, customer reviews, footer. Presentation only, so `Home` has no ViewModel. |
| `/shop` | Page header, packages carousel, product grid, footer. Backed by `ShopViewModel`. |
| `/quiz` | The five questions, the session timer, the result, and the routine completer. Guarded by `quizStateGuard`. |
| `/cart` | Cart review and the single Shopify handoff. |

The site has no navigation menu. The wholesale bar's brand mark is the link back to
`/` from every route, the hero's "Skip the quiz" link is the way in to `/shop`, and the
cart's empty state links to both. Scrolling uses
`withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`, so browser Back
returns to `/` at the position you left it and a forward navigation starts at the top.

Each route's `<title>` comes from its `title`; its `<meta name="description">` comes
from `data.description` in `app.routes.ts`, applied by `MetaDescriptionService`.
Routes without one fall back to the description in `index.html`.

### Notable decisions

- **`price-display` is the only place prices are rendered**, so the strikethrough +
  sale + savings badge stay identical in the grid, quiz result, upsell, cart and
  package modal.
- **Persistence writes through synchronously** (not from an `effect`). An effect
  flushes after the current task, which loses the write when a click navigates away
  immediately after "Add to Cart".
- **The upsell runs before the cart review, never after the Shopify handoff** — once
  the session leaves for Shopify, it is not ours to interrupt. It is shown once per
  session, recorded in `localStorage`.
- **The carousel is native CSS scroll-snap.** No library, no drag handlers; the arrows
  and dots only reflect and nudge the browser's own scrolling.
- **`--rose-text` exists because `--rose` (#D4808A) is 2.9:1 on white** and fails WCAG
  AA for small text. Rose stays for large price figures and badge backgrounds; small
  rose text uses `--rose-text` (#A84E58, 5.3:1).

### Storage keys

| Key | Contents |
|---|---|
| `mooncosmo-cart-v1` | Line items: product slug + quantity only. Prices are always re-resolved from `products.data.ts`, so a price change applies to carts already in progress. |
| `mooncosmo-quiz-v2` | Current step, all five answers, and whether the routine completer has been shown. |
| `mooncosmo-quiz-timer-v1` | When the session timer started, its current allowance, and whether it has stopped. Elapsed time is always derived from the stored start, so a reload never restarts it. |

Both are validated on read; anything malformed is discarded rather than trusted.

---

## Testing

- **Unit** (`npm run test:unit`) — 56 tests. The recommendation engine is the
  highest-value surface and is covered exhaustively; `shopify.service.spec.ts` pins the
  cart permalink format.
- **E2E** (`npm run e2e`) — 130 tests across Chromium and WebKit at seven viewports
  (320×568 … 2560×1440). Covers the full funnel to a correctly formed Shopify
  permalink (the request is intercepted, Shopify is never loaded), the question-4 skip
  path, back-navigation, reload at every step, home ↔ shop navigation and scroll
  restoration, the wholesale modal's focus trap, keyboard-only operation, absence of horizontal overflow, and an `elementFromPoint`
  probe asserting every quiz option is genuinely on top — the guard against an overlay
  regression silently covering a control.
