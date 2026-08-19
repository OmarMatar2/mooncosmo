import { ProductSlug } from './product.model';

export interface ProductPackage {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** Every slug listed here is added to the cart as its own line item. */
  readonly products: readonly ProductSlug[];
  readonly originalPrice: number;
  readonly salePrice: number;
  readonly image: string;
  readonly imageAlt: string;
}
