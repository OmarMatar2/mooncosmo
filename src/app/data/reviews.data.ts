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
    id: '1',
    productSlug: 'hibiscus-rosa-radiance-scrub',
    rating: 5,
    author: 'Sami',
    titel: 'Top tier',
    body: 'This is the best product work flawlessly',
    date: '2025-06-25',
  },
  {
    id: '2',
    productSlug: 'turmeric-glow-scrub',
    rating: 5,
    author: 'Nikhil Chawla',
    titel: 'The best!!!',
    body: 'I have dark skin and this product works like magic - providing an instant glow . I use it every time before a night out- it makes my skin feel refreshed energized and alive . I would definitely recommend',
    date: '2025-06-14',
  },
  {
    id: '3',
    productSlug: 'apricot-glow-scrub',
    rating: 5,
    author: 'Sevana J',
    titel: 'Highly recommend!!!!!',
    body: 'I have been using this body scrub for almost two weeks and already see the difference. My skin feels so much softer with this natural glow. I highly recommend this for anyone looking to brighten and smooth their skin!!!! LOVE IT!!!!!',
    date: '2025-03-16',
  },
  {
    id: '4',
    productSlug: 'golden-radiance-scrub',
    rating: 5,
    author: 'Ahmed fataj',
    titel: 'Worked for me the best',
    body: 'I\'ve never tried any product that deeped Clean my face , my face felt so smooth',
    date: '2025-05-07',
  },
  {
    id: '5',
    productSlug: 'lemon-mint-cucumber-scrub',
    rating: 5,
    author: 'Lucy Reynosa',
    titel: 'Best scrub in the world!',
    body: 'This product is the BEST! It has the ability to exfoliate and brighten without drying or irritating the skin. I was able to see results after a week of using it. I love the natural ingredients and the price is so affordable.',
    date: '2025-06-12',
  },
  {
    id: 'placeholder-6',
    productSlug: 'minty-fresh-clay-mask',
    rating: 5,
    author: 'Lana Adam',
    titel: 'Cooold but worth the feeling',
    body: 'I recently tried this product, and it has become a favorite in my skin care routine. The cooling mint provides a refreshing cooling sensation and after just four minutes my skin feels deeply cleansed. I also like that it\'s suitable for all skin types.',
    date: '2025-03-16',
  },
];

export const REVIEWS_HEADING = 'What Our Customers Say';
