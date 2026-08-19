import { Product, ProductSlug } from '../models/product.model';

const SCRUB_DIRECTIONS =
  'Apply to wet skin and massage gently in circular motions. Rinse thoroughly with warm water. Use 1–2 times weekly.';
const MASK_DIRECTIONS =
  'Apply an even layer to clean skin, allow to dry, then rinse thoroughly with warm water.';

const BASE_WARNING =
  'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Patch test before first use.';
const MASK_WARNING = `${BASE_WARNING} A temporary cooling or tingling sensation may occur due to menthol and mint oils.`;

/**
 * The canonical product list. This is display order only — the recommendation and
 * upsell tie-break order lives in TIE_BREAK_ORDER in recommendation.engine.ts.
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
    tagline: 'Protect and preserve collagen | Youthful glow',
    variantId: '43500755910690',
    size: '400 ml',
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Hibiscus is a skincare powerhouse, packed with antioxidants and natural acids that promote a radiant complexion. It gently exfoliates, supports collagen preservation, and helps reduce fine lines, leaving skin firm, hydrated, and glowing.',
    benefits: [
      'Gently exfoliates',
      'Removes dead skin cells',
      'Improves the look of dull skin',
      'Reveals a brighter-looking complexion',
      'Hydrates and conditions',
      'Antioxidant support',
    ],
    keyIngredients: ['Hibiscus Flower', 'Cocoa Butter', 'Glycerin', 'Vitamin E'],
    bestFor: 'Normal to oily skin',
    directions: SCRUB_DIRECTIONS,
    warning: BASE_WARNING,
    image: 'assets/products/hibiscus-rosa-radiance-scrub.webp',
    imageAlt: 'Jar of Hibiscus Rosa Radiance Scrub surrounded by fresh hibiscus flowers',
  },
  {
    slug: 'lemon-mint-cucumber-scrub',
    name: 'Lemon Mint Cucumber Scrub',
    tagline: 'Moisturize and nourish dry skin | Brighten | Hydrate',
    variantId: '43501160071202',
    size: '400 ml',
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      "Mint soothes and revitalizes while reducing inflammation, cucumber's antioxidants and high water content hydrate and nourish, and lemon's vitamin C brightens and detoxifies.",
    benefits: [
      'Gently exfoliates',
      'Removes dead skin cells',
      'Refreshes and revitalizes',
      'Improves skin texture',
      'Hydrates and conditions',
    ],
    keyIngredients: ['Apricot Kernel Oil', 'Vitamin E', 'Vitamin C'],
    bestFor: 'Normal to oily skin',
    directions: SCRUB_DIRECTIONS,
    warning: BASE_WARNING,
    image: 'assets/products/lemon-mint-cucumber-scrub.webp',
    imageAlt: 'Jar of Lemon Mint Cucumber Scrub with fresh lemon, mint and cucumber',
  },
  {
    slug: 'turmeric-glow-scrub',
    name: 'Turmeric Glow Scrub',
    tagline: 'Unclogged pores | Brightens | Healthy glow',
    variantId: '43501244153890',
    size: '400 ml',
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Turmeric acts as a natural reset for your skin — calming redness, defending against environmental stress, and revealing a glow from within.',
    benefits: [
      'Gently exfoliates',
      'Improves skin texture',
      'Removes dead skin cells',
      'Improves the look of dull skin',
      'Promotes a healthy-looking glow',
    ],
    keyIngredients: ['Curcumin', 'Cocoa Butter', 'Vitamin E', 'Vitamin C'],
    bestFor: 'Normal to oily skin',
    directions: SCRUB_DIRECTIONS,
    warning: BASE_WARNING,
    image: 'assets/products/turmeric-glow-scrub.webp',
    imageAlt: 'Jar of Turmeric Glow Scrub with turmeric root and golden powder',
  },
  {
    slug: 'golden-radiance-scrub',
    name: 'Golden Radiance Scrub',
    tagline: 'Exfoliate for radiant skin | Natural Ingredients | Skin protection',
    variantId: '43500603080738',
    size: '400 ml',
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Gold stimulates circulation, supports skin elasticity, and protects against environmental damage, revealing a naturally luminous, youthful look.',
    benefits: [
      'Gently exfoliates',
      'Removes dead skin cells',
      'Improves skin texture',
      'Promotes smoother-looking skin',
      'Reveals a radiant-looking complexion',
    ],
    keyIngredients: ['Mica', 'Cocoa Butter', 'Vitamin E'],
    bestFor: 'Normal to oily skin',
    directions: SCRUB_DIRECTIONS,
    warning: BASE_WARNING,
    image: 'assets/products/golden-radiance-scrub.webp',
    imageAlt: 'Jar of Golden Radiance Scrub with a soft golden shimmer',
  },
  {
    slug: 'apricot-glow-scrub',
    name: 'Apricot Glow Scrub',
    tagline: 'Vitamins and antioxidant-rich | Defend against aging | Environmental damage',
    variantId: '43501224001570',
    size: '400 ml',
    originalPrice: 39.99,
    salePrice: 29.99,
    description:
      'Apricot is rich in vitamins and antioxidants that nourish, soften and brighten, while its natural exfoliating properties lift away dead skin cells and its moisturizing benefits keep skin smooth, supple and radiant.',
    benefits: [
      'Gently exfoliates',
      'Removes dead skin cells',
      'Softens skin',
      'Moisturizes and conditions',
      'Promotes a healthy-looking glow',
    ],
    keyIngredients: ['Apricot Kernel Oil', 'Cocoa Butter', 'Vitamin E'],
    bestFor: 'Normal to dry skin',
    directions: SCRUB_DIRECTIONS,
    warning: BASE_WARNING,
    image: 'assets/products/apricot-glow-scrub.webp',
    imageAlt: 'Jar of Apricot Glow Scrub with fresh apricots',
  },
  {
    slug: 'minty-fresh-clay-mask',
    name: 'Minty Fresh Clay Mask',
    tagline: 'Brightening | Clarifies skin | Calm redness',
    variantId: '43501304741922',
    size: '400 ml',
    originalPrice: 34.99,
    salePrice: 29.99,
    description:
      'Mint is known for its antibacterial and anti-inflammatory properties, making it effective at addressing breakouts and calming irritation, while its high antioxidant content helps reduce dark circles and brighten skin.',
    benefits: [
      'Clarifies skin',
      'Absorbs excess oil',
      'Deep cleansing',
      'Cooling sensation',
      'Improves the look of pores',
      'Calms the look of redness',
    ],
    keyIngredients: [
      'Bentonite Clay',
      'Menthol',
      'Seaweed Extract',
      'Panthenol',
      'Rosemary Oil',
      'Spearmint Oil',
    ],
    bestFor: 'Normal to oily skin',
    directions: MASK_DIRECTIONS,
    warning: MASK_WARNING,
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
