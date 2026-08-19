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
  readonly tagline: string;
  /** Shopify variant id used to build the cart permalink. */
  readonly variantId: string;
  readonly size: string;
  readonly originalPrice: number;
  readonly salePrice: number;
  readonly description: string;
  readonly benefits: readonly string[];
  readonly keyIngredients: readonly string[];
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
