import { Product, ProductSlug } from './product.model';

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;

/** What is persisted: only slug + quantity. Prices are always resolved from the data file. */
export interface CartLine {
  readonly slug: ProductSlug;
  readonly quantity: number;
}

/** A line with its product resolved, ready for rendering. */
export interface ResolvedCartLine {
  readonly slug: ProductSlug;
  readonly quantity: number;
  readonly product: Product;
  readonly lineOriginalTotal: number;
  readonly lineSaleTotal: number;
  readonly lineSavings: number;
}

export interface CartTotals {
  readonly itemCount: number;
  readonly originalSubtotal: number;
  readonly saleSubtotal: number;
  readonly totalSavings: number;
}
