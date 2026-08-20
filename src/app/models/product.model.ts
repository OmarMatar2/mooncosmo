/** Stable identifier for a product. Used as the key in every matrix and in the cart. */
export type ProductSlug =
  | 'hibiscus-rosa-radiance-scrub'
  | 'lemon-mint-cucumber-scrub'
  | 'apricot-glow-scrub'
  | 'golden-radiance-scrub'
  | 'turmeric-glow-scrub'
  | 'minty-fresh-clay-mask';

export interface Product {
  readonly slug: ProductSlug;
  readonly name: string;
  /** Shopify variant id used to build the cart permalink. */
  readonly variantId: string;
  /** The size this variant ships as. */
  readonly size: string;
  /** Every size the master sheet lists for this product. */
  readonly availableSizes: readonly string[];
  readonly originalPrice: number;
  readonly salePrice: number;
  /**
   * The short line shown under the product across the site, taken from the flyer.
   * Also the benefit sentence in "why we chose this for you".
   */
  readonly description: string;
  /** The master sheet's full Product Description. */
  readonly fullDescription: string;
  /** The master sheet's Approved Claims, verbatim. Never add to these. */
  readonly benefits: readonly string[];
  /** The master sheet's full ingredient list, in its stated order. */
  readonly ingredients: readonly string[];
  /** The master sheet's Skin Type Recommendations. */
  readonly bestFor: string;
  readonly directions: string;
  readonly warning: string;
  readonly image: string;
  readonly imageAlt: string;
}

/** A variant id that still needs a real value before checkout can work. */
export const PLACEHOLDER_VARIANT_PREFIX = 'TODO_';

export function hasRealVariantId(product: Product): boolean {
  return product.variantId.length > 0 && !product.variantId.startsWith(PLACEHOLDER_VARIANT_PREFIX);
}

export function savings(originalPrice: number, salePrice: number): number {
  return Math.max(0, Math.round((originalPrice - salePrice) * 100) / 100);
}
