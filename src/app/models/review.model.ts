import { ProductSlug } from './product.model';

/** A customer review of a single product, shown on the home page across all products. */
export interface Review {
  readonly id: string;
  readonly productSlug: ProductSlug;
  /** Whole stars, 1–5. */
  readonly rating: number;
  readonly author: string;
  readonly titel: string;
  readonly body: string;
  /** ISO date, when known. Reviews without one simply omit the date line. */
  readonly date?: string;
}

export const MAX_RATING = 5;

/** Star positions for a rating, so the template renders a list rather than branching. */
export function starStates(rating: number): readonly boolean[] {
  const filled = Math.min(MAX_RATING, Math.max(0, Math.round(rating)));
  return Array.from({ length: MAX_RATING }, (_, i) => i < filled);
}
