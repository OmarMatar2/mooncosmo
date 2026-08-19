# Assets

Every path here is referenced from `src/app/data/*.data.ts`. Files are copied to
`/assets/**` at build time (configured in `angular.json`).

**Missing files never break the page**: `ui/product-image` catches the load error and
renders a soft blush panel with the product name instead of a broken-image icon. That
means you can ship before the photography is final.

## products/ — 800 × 800

Referenced by `image` in `src/app/data/products.data.ts`. Currently `.webp`; any web
format works as long as the filename in the data file matches.

| File | Product |
|---|---|
| `hibiscus-rosa-radiance-scrub.webp` | Hibiscus Rosa Radiance Scrub |
| `lemon-mint-cucumber-scrub.webp` | Lemon Mint Cucumber Scrub |
| `apricot-glow-scrub.webp` | Apricot Glow Scrub |
| `golden-radiance-scrub.webp` | Golden Radiance Scrub |
| `turmeric-glow-scrub.webp` | Turmeric Glow Scrub |
| `minty-fresh-clay-mask.webp` | Minty Fresh Clay Mask |

Square works best — media frames are 4:3 or 1:1 and the image is centre-cropped
(`object-fit: cover`). Photographs with their own background are fine. If you swap in
transparent cut-outs, they sit on the blush ground behind them; add the `contain`
class to a `<product-image>` to letterbox rather than crop.

## packages/ — 1000 × 800  *(not yet supplied)*

`package-1.png` … `package-4.png`, referenced by `image` in `packages.data.ts`.
These do not exist yet, so the packages carousel on `/shop` currently shows the blush
placeholder.

## hero/ — 1600 × 1200  *(not yet supplied)*

`hero.png`. The home hero currently points at
`assets/products/hibiscus-rosa-radiance-scrub.webp` as a stand-in — change the `src`
in `src/app/pages/home/home.html` once a dedicated hero image exists.

## logo/ — *(not yet supplied)*

`logo.svg`, `logo-mark.svg`. The footer currently draws an inline SVG wordmark; swap it
in `src/app/components/site-footer/site-footer.html`.

## icons/

Empty by design — all icons are inline SVG in the components that use them, so they
inherit `currentColor` and cost no extra requests.

## fonts/ — self-hosted, no CDN

Fraunces (headings) and Inter (body), weights 400/500/600/700, `.woff2` only. Declared
in `src/styles/_typography.scss`. Sourced from the `@fontsource/fraunces` and
`@fontsource/inter` dev dependencies; to refresh them:

```sh
for w in 400 500 600 700; do
  cp node_modules/@fontsource/fraunces/files/fraunces-latin-$w-normal.woff2 src/assets/fonts/
  cp node_modules/@fontsource/inter/files/inter-latin-$w-normal.woff2 src/assets/fonts/
done
```
