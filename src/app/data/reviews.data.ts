// TODO: replace with real reviews from mooncosmo.com product pages
//
// Every entry below is a PLACEHOLDER and is written to be unmistakable as one — the
// authors are named "Placeholder" and the bodies say so outright. Nothing here is a
// real customer, a real quote, or a real rating. Replace the whole array; do not edit
// these in place, or a half-replaced list will read as genuine.
//
// The home-page section reads its length: empty the array and the section removes
// itself rather than rendering an empty shell.

import { Review } from '../models/review.model';

export const REVIEWS: readonly Review[] = [
  {
    id: 'placeholder-1',
    productSlug: 'hibiscus-rosa-radiance-scrub',
    rating: 5,
    author: 'Placeholder Reviewer 1',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
  {
    id: 'placeholder-2',
    productSlug: 'turmeric-glow-scrub',
    rating: 5,
    author: 'Placeholder Reviewer 2',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
  {
    id: 'placeholder-3',
    productSlug: 'apricot-glow-scrub',
    rating: 4,
    author: 'Placeholder Reviewer 3',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
  {
    id: 'placeholder-4',
    productSlug: 'golden-radiance-scrub',
    rating: 5,
    author: 'Placeholder Reviewer 4',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
  {
    id: 'placeholder-5',
    productSlug: 'lemon-mint-cucumber-scrub',
    rating: 4,
    author: 'Placeholder Reviewer 5',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
  {
    id: 'placeholder-6',
    productSlug: 'minty-fresh-clay-mask',
    rating: 5,
    author: 'Placeholder Reviewer 6',
    body: 'PLACEHOLDER — paste the real review text for this product here.',
    date: '2026-01-01',
  },
];

export const REVIEWS_HEADING = 'What Our Customers Say';
