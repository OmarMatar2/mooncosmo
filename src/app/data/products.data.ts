import { Product, ProductSlug } from '../models/product.model';

/**
 * Product content comes from exactly two sources, and nowhere else:
 *
 *  - `description` — the flyer's first sentence, which is the short line shown under
 *    each product on the site. The flyer's trailing "Ideal for…" clauses are
 *    deliberately dropped: their skin-type claims contradict the master sheet's own
 *    Skin Type Recommendations, and carrying both would make the site contradict
 *    itself. `bestFor` is the master sheet's classification and is authoritative.
 *  - everything else — the PRODUCT MASTER SHEET
 *    (docs/Moon Cosmetics PRODUCT MASTER SHEET.pdf), quoted verbatim.
 *
 * `benefits` are the master sheet's Approved Claims, word for word. Do not add to
 * them, reword them, or infer new ones: the "why we chose this for you" copy and the
 * result cards both read from here, so anything invented here becomes a claim the
 * brand has not approved.
 *
 * This is display order only — the recommendation tie-break order lives in
 * TIE_BREAK_ORDER in recommendation.engine.ts.
 *
 * TO UPDATE PRICES: edit `originalPrice` / `salePrice` here — every price on the site
 * is derived from these two numbers.
 * TO ADD SHOPIFY VARIANT IDS: edit `variantId` here. Any value starting with `TODO_`
 * blocks checkout with a visible error rather than producing a broken permalink.
 */
export const PRODUCTS: readonly Product[] = [
  {
    slug: 'hibiscus-rosa-radiance-scrub',
    name: 'Hibiscus Rosa Radiance Scrub',
    variantId: '43500755910690',
    size: '400 ml',
    availableSizes: ['400 ml'],
    originalPrice: 39.99,
    salePrice: 29.99,
    description: 'Protects and preserves collagen to promote a youthful glow.',
    fullDescription:
      'A face and body scrub formulated to gently exfoliate and refresh the skin. Enriched with Hibiscus Rosa-Sinensis Flower, Cocoa Butter, Glycerin, and Vitamin E to help leave skin feeling smooth, soft, and conditioned.',
    benefits: [
      'Gently exfoliates skin',
      'Helps remove dead skin cells',
      'Helps improve the appearance of dull skin',
      'Promotes smoother-looking skin',
      'Helps reveal a brighter-looking complexion',
      'Hydrates and conditions skin',
      'Provides antioxidant support',
      'Promotes a healthy-looking, radiant appearance',
    ],
    ingredients: [
      'Water (Aqua)',
      'Stearic Acid',
      'Walnut Shell',
      'Cetyl Alcohol',
      'Glycerin',
      'Lactic Acid',
      'Sodium Laureth Sulfate',
      'Parfum',
      'Hibiscus Rosa-Sinensis Flower',
      'Titanium Dioxide',
      'Isopropyl Myristate',
      'Paraffinum Liquidum EU',
      'Cacao Butter',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol (Vitamin E)',
    ],
    bestFor: 'Normal to oily skin',
    directions:
      'Apply to wet skin and massage gently in circular motions. Rinse thoroughly with warm water. Use 1–2 times weekly.',
    warning:
      'For external use only. Avoid contact with eyes. If irritation occurs, discontinue use. Patch test before first use.',
    image: 'assets/products/hibiscus-rosa-radiance-scrub.webp',
    imageAlt: 'Jar of Hibiscus Rosa Radiance Scrub surrounded by fresh hibiscus flowers',
  },
  {
    slug: 'lemon-mint-cucumber-scrub',
    name: 'Lemon Mint Cucumber Scrub',
    variantId: '43501160071202',
    size: '400 ml',
    availableSizes: ['400 ml'],
    originalPrice: 39.99,
    salePrice: 29.99,
    description: 'Moisturizes and nourishes dry skin while brightening and hydrating.',
    fullDescription:
      'A refreshing face and body scrub designed to exfoliate, cleanse, and leave skin feeling refreshed and conditioned.',
    benefits: [
      'Gently exfoliates skin',
      'Helps remove dead skin cells',
      'Refreshes and revitalizes skin',
      'Helps improve skin texture',
      'Helps reveal smoother-looking skin',
      'Hydrates and conditions skin',
      'Promotes a healthy-looking complexion',
    ],
    ingredients: [
      'Water (Aqua)',
      'Stearic Acid',
      'Walnut Shell',
      'Cetyl Alcohol',
      'Glycerine',
      'Lactic Acid',
      'Sodium Laureth Sulfate',
      'Parfum',
      'Apricot Kernel Oil PEG-40 Ester',
      'Titanium Dioxide',
      'Isopropyl Myristate',
      'Paraffinum Liquidum EU',
      'Cacao Butter',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol Vitamin E',
      'Ascorbic Acid',
    ],
    bestFor: 'Normal to oily skin',
    directions:
      'Apply to wet skin and massage gently in circular motions. Rinse thoroughly. Use 1–2 times weekly.',
    warning:
      'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Patch test before first use.',
    image: 'assets/products/lemon-mint-cucumber-scrub.webp',
    imageAlt: 'Jar of Lemon Mint Cucumber Scrub with fresh lemon, mint and cucumber',
  },
  {
    slug: 'turmeric-glow-scrub',
    name: 'Turmeric Glow Scrub',
    variantId: '43501244153890',
    size: '400 ml',
    availableSizes: ['400 ml'],
    originalPrice: 39.99,
    salePrice: 29.99,
    description: 'Unclogs pores and helps brighten for a healthy, even-toned look.',
    fullDescription:
      'A face and body scrub formulated to gently exfoliate while helping improve the appearance of dull skin for a healthy-looking glow.',
    benefits: [
      'Gently exfoliates skin',
      'Helps improve skin texture',
      'Helps remove dead skin cells',
      'Helps improve the appearance of dull skin',
      'Promotes a healthy-looking glow',
      'Cleanses and refreshes skin',
      'Hydrates and conditions skin',
    ],
    ingredients: [
      'Water (Aqua)',
      'Stearic Acid',
      'Walnut Shell',
      'Cetyl Alcohol',
      'Glycerin',
      'Lactic Acid',
      'Sodium Laureth Sulfate',
      'Parfum',
      'Curcumin',
      'Titanium Dioxide',
      'Isopropyl Myristate',
      'Paraffinum Liquidum EU',
      'Cacao Butter',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol (Vitamin E)',
      'Ascorbic Acid',
    ],
    bestFor: 'Normal to oily skin',
    directions:
      'Apply to wet skin and massage gently in circular motions. Rinse thoroughly. Use 1–2 times weekly.',
    warning:
      'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Patch test before first use.',
    image: 'assets/products/turmeric-glow-scrub.webp',
    imageAlt: 'Jar of Turmeric Glow Scrub with turmeric root and golden powder',
  },
  {
    slug: 'golden-radiance-scrub',
    name: 'Golden Radiance Scrub',
    variantId: '43500603080738',
    size: '400 ml',
    availableSizes: ['400 ml'],
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Exfoliates with natural ingredients while offering skin protection and a radiant finish.',
    fullDescription:
      'A face and body scrub designed to exfoliate and leave skin feeling smooth, refreshed, and radiant-looking.',
    benefits: [
      'Gently exfoliates skin',
      'Helps remove dead skin cells',
      'Helps improve skin texture',
      'Promotes smoother-looking skin',
      'Helps reveal a radiant-looking complexion',
      'Hydrates and conditions skin',
      'Leaves skin feeling refreshed',
    ],
    ingredients: [
      'Water (Aqua)',
      'Stearic Acid',
      'Walnut Shell',
      'Cetyl Alcohol',
      'Glycerin',
      'Lactic Acid',
      'Sodium Laureth Sulfate',
      'Parfum',
      'Titanium Dioxide',
      'Isopropyl Myristate',
      'Paraffinum Liquidum EU',
      'Cacao Butter',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol (Vitamin E)',
      'Mica',
    ],
    bestFor: 'Normal to oily skin',
    directions:
      'Apply to wet skin and massage gently in circular motions. Rinse thoroughly. Use 1–2 times weekly.',
    warning:
      'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Patch test before first use.',
    image: 'assets/products/golden-radiance-scrub.webp',
    imageAlt: 'Jar of Golden Radiance Scrub with a soft golden shimmer',
  },
  {
    slug: 'apricot-glow-scrub',
    name: 'Apricot Glow Scrub',
    variantId: '43501224001570',
    size: '400 ml',
    availableSizes: ['400 ml'],
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Rich in vitamins and antioxidants to fight signs of aging and defend against environmental damage.',
    fullDescription:
      'A face and body scrub formulated to gently exfoliate while helping leave skin feeling soft, smooth, moisturized, and refreshed.',
    benefits: [
      'Gently exfoliates skin',
      'Helps remove dead skin cells',
      'Helps improve skin texture',
      'Helps soften skin',
      'Helps moisturize and condition skin',
      'Promotes a healthy-looking glow',
      'Leaves skin feeling refreshed',
    ],
    ingredients: [
      'Water (Aqua)',
      'Stearic Acid',
      'Walnut Shell',
      'Cetyl Alcohol',
      'Glycerin',
      'Lactic Acid',
      'Sodium Laureth Sulfate',
      'Parfum',
      'Apricot Kernel Oil PEG-40 Ester',
      'Titanium Dioxide',
      'Isopropyl Myristate',
      'Paraffinum Liquidum EU',
      'Cacao Butter',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol (Vitamin E)',
    ],
    bestFor: 'Normal to dry skin',
    directions:
      'Apply to wet skin and massage gently in circular motions. Rinse thoroughly. Use 1–2 times weekly.',
    warning:
      'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Patch test before first use.',
    image: 'assets/products/apricot-glow-scrub.webp',
    imageAlt: 'Jar of Apricot Glow Scrub with fresh apricots',
  },
  {
    slug: 'minty-fresh-clay-mask',
    name: 'Minty Fresh Clay Mask',
    // The master sheet lists 200 ml and 400 ml. Only the 400 ml variant id exists in
    // Shopify today, so that is the one sold and the one offered as the routine
    // completer. TODO: add the 200 ml variant id when it exists — as an additional
    // entry, never by overwriting the id below — and select it by size.
    variantId: '43501304741922',
    size: '200 ml',
    availableSizes: ['200 ml', '400 ml'],
    originalPrice: 34.99,
    salePrice: 29.99,
    description:
      'Revitalize your skin with our minty fresh clay mask, infused with mint and rosemary oils.',
    fullDescription:
      'A refreshing clay mask formulated with Bentonite clay, Menthol, Seaweed Extract, Panthenol, Rosemary Oil, and Spearmint Oil to leave skin feeling clean, refreshed, and revitalized.',
    benefits: [
      'Clarifies skin',
      'Helps absorb excess oil',
      'Deep-cleansing clay mask',
      'Leaves skin feeling refreshed',
      'Provides a cooling sensation',
      'Helps improve the appearance of pores',
      'Helps calm the appearance of redness',
      'Promotes a refreshed-looking complexion',
    ],
    ingredients: [
      'Water (Aqua)',
      'Cetyl Alcohol',
      'Glycerin',
      'Lactic Acid',
      'Paraffinum Liquidum EU',
      'Titanium Dioxide',
      'Bentonite',
      'Menthol Crystal',
      'Sodium Laureth Sulfate',
      'Parfum (Fragrance)',
      'Panthenol',
      'Seaweed Extract',
      'Rosemary (Rosmarinus Officinalis) Oil',
      'Spearmint Oil',
      'Propylene Glycol',
      'Phenoxyethanol',
      'Tocopherol (Vitamin E)',
    ],
    bestFor: 'Normal to oily skin',
    directions:
      'Apply an even layer to clean skin. Allow to dry. Rinse thoroughly with warm water. Use as directed.',
    warning:
      'For external use only. Avoid contact with eyes. A temporary cooling or tingling sensation may occur due to menthol and mint oils. Discontinue use if irritation occurs. Patch test before first use.',
    image: 'assets/products/minty-fresh-clay-mask.webp',
    imageAlt: 'Jar of Minty Fresh Clay Mask with fresh spearmint leaves',
  },
] as const;

const PRODUCT_BY_SLUG = new Map<ProductSlug, Product>(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: ProductSlug): Product {
  const product = PRODUCT_BY_SLUG.get(slug);
  if (!product) {
    throw new Error(`Unknown product slug: ${slug}`);
  }
  return product;
}

export function findProduct(slug: string): Product | undefined {
  return PRODUCT_BY_SLUG.get(slug as ProductSlug);
}

/** Canonical display ordering. Not a tie-break: see TIE_BREAK_ORDER in the engine. */
export const CANONICAL_ORDER: readonly ProductSlug[] = PRODUCTS.map((p) => p.slug);

/** The disclaimer shown on the results page. */
export const COSMETIC_DISCLAIMER =
  'This is a general cosmetic recommendation, not medical advice.';
