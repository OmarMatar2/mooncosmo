import { ProductPackage } from '../models/package.model';

/**
 * Placeholder bundles. The real line-up replaces these.
 *
 * TO DEFINE PACKAGES: edit this array. `products` lists the slugs that get added to
 * the cart as separate line items; `originalPrice` / `salePrice` are the bundle's own
 * numbers and are not derived from the products.
 */
// TODO: replace all four placeholder packages with the real bundles and their images.
export const PACKAGES: readonly ProductPackage[] = [
  {
    id: 'glow-duo',
    name: 'The Glow Duo',
    tagline: 'Two scrubs for a brighter-looking finish',
    description:
      'Our two brightening favourites in one set. Alternate them through the week to exfoliate gently and keep dull-looking skin looking fresh and even.',
    products: ['hibiscus-rosa-radiance-scrub', 'turmeric-glow-scrub'],
    originalPrice: 79.98,
    salePrice: 54.99,
    image: 'assets/packages/package-1.png',
    imageAlt: 'The Glow Duo package with two MoonCosmo scrub jars',
  },
  {
    id: 'fresh-start',
    name: 'Fresh Start Set',
    tagline: 'Cleanse, clarify, refresh',
    description:
      'Built for skin that gets oily by midday. The Lemon Mint Cucumber Scrub lifts away dead skin cells while the Minty Fresh Clay Mask draws out excess oil.',
    products: ['lemon-mint-cucumber-scrub', 'minty-fresh-clay-mask'],
    originalPrice: 74.98,
    salePrice: 52.99,
    image: 'assets/packages/package-2.png',
    imageAlt: 'Fresh Start Set with a scrub jar and a clay mask jar',
  },
  {
    id: 'soft-skin-ritual',
    name: 'Soft Skin Ritual',
    tagline: 'Exfoliate, then comfort',
    description:
      'A gentler pairing for skin that needs softening as much as smoothing. Apricot Kernel Oil and cocoa butter leave skin conditioned after every use.',
    products: ['apricot-glow-scrub', 'hibiscus-rosa-radiance-scrub'],
    originalPrice: 79.98,
    salePrice: 54.99,
    image: 'assets/packages/package-3.png',
    imageAlt: 'Soft Skin Ritual package with two MoonCosmo scrub jars',
  },
  {
    id: 'full-shelf',
    name: 'The Full Shelf',
    tagline: 'Every product we make',
    description:
      'All six MoonCosmo formulas together. The complete routine for anyone who wants to rotate by season, by mood, or by what their skin is asking for that week.',
    products: [
      'hibiscus-rosa-radiance-scrub',
      'lemon-mint-cucumber-scrub',
      'turmeric-glow-scrub',
      'golden-radiance-scrub',
      'apricot-glow-scrub',
      'minty-fresh-clay-mask',
    ],
    originalPrice: 234.94,
    salePrice: 149.99,
    image: 'assets/packages/package-4.png',
    imageAlt: 'The Full Shelf package with all six MoonCosmo products',
  },
] as const;
