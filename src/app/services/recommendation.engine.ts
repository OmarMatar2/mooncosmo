import { getProduct } from '../data/products.data';
import { GOAL_FRAGMENTS, SKIN_TYPE_FRAGMENTS } from '../data/quiz.data';
import { Product, ProductSlug } from '../models/product.model';
import { DesiredResult, QuizAnswers, SkinGoal, SkinType } from '../models/quiz.model';

/**
 * Pure recommendation logic. No Angular, no state, no side effects — everything here
 * is a function of its arguments so all 180 answer paths can be exhaustively tested.
 *
 * TO MODIFY THE RECOMMENDATION: edit the four tables below. ELIGIBILITY is a hard
 * filter (an excluded product can never be recommended, whatever it scores);
 * SKIN_TYPE_BONUS, GOAL_POINTS and RESULT_POINTS are additive scores. TIE_BREAK_ORDER
 * resolves equal scores. Nothing else needs to change.
 */

const HIBISCUS: ProductSlug = 'hibiscus-rosa-radiance-scrub';
const LEMON: ProductSlug = 'lemon-mint-cucumber-scrub';
const TURMERIC: ProductSlug = 'turmeric-glow-scrub';
const GOLDEN: ProductSlug = 'golden-radiance-scrub';
const APRICOT: ProductSlug = 'apricot-glow-scrub';
const MINTY: ProductSlug = 'minty-fresh-clay-mask';

/** The upsell product, offered to every skin type — see pickUpsell. */
export const UPSELL_SLUG: ProductSlug = MINTY;

/** At most this many products are recommended. */
export const MAX_RECOMMENDATIONS = 2;

type ProductScores = Readonly<Record<ProductSlug, number>>;

/**
 * Question 1 eligibility filter. `false` removes the product from consideration
 * entirely — this is a hard exclusion, not a score penalty.
 */
const ELIGIBILITY: Readonly<Record<SkinType, Readonly<Record<ProductSlug, boolean>>>> = {
  oily: {
    [HIBISCUS]: true,
    [LEMON]: true,
    [TURMERIC]: true,
    [GOLDEN]: true,
    [APRICOT]: false,
    [MINTY]: true,
  },
  combination: {
    [HIBISCUS]: true,
    [LEMON]: true,
    [TURMERIC]: true,
    [GOLDEN]: true,
    [APRICOT]: false,
    [MINTY]: true,
  },
  normal: {
    [HIBISCUS]: true,
    [LEMON]: true,
    [TURMERIC]: true,
    [GOLDEN]: true,
    [APRICOT]: true,
    [MINTY]: true,
  },
  dry: {
    [HIBISCUS]: true,
    [LEMON]: true,
    [TURMERIC]: false,
    [GOLDEN]: true,
    [APRICOT]: true,
    [MINTY]: false,
  },
  sensitive: {
    [HIBISCUS]: true,
    [LEMON]: false,
    [TURMERIC]: false,
    [GOLDEN]: true,
    [APRICOT]: true,
    [MINTY]: false,
  },
};

/**
 * Question 1 suitability bonus. Entries for products excluded by ELIGIBILITY are
 * never read; they are written as 0 so the record stays total.
 */
const SKIN_TYPE_BONUS: Readonly<Record<SkinType, ProductScores>> = {
  oily: { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 2, [GOLDEN]: 0, [APRICOT]: 0, [MINTY]: 2 },
  combination: { [HIBISCUS]: 1, [LEMON]: 1, [TURMERIC]: 1, [GOLDEN]: 1, [APRICOT]: 0, [MINTY]: 1 },
  normal: { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 1, [APRICOT]: 1, [MINTY]: 0 },
  dry: { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 0, [APRICOT]: 2, [MINTY]: 0 },
  sensitive: { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 1, [APRICOT]: 2, [MINTY]: 0 },
};

/** Question 2 — skin goal. */
const GOAL_POINTS: Readonly<Record<SkinGoal, ProductScores>> = {
  dullness: { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 3, [GOLDEN]: 1, [APRICOT]: 0, [MINTY]: 0 },
  texture: { [HIBISCUS]: 1, [LEMON]: 2, [TURMERIC]: 1, [GOLDEN]: 2, [APRICOT]: 2, [MINTY]: 0 },
  dryness: { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 0, [APRICOT]: 3, [MINTY]: 0 },
  'excess-oil': { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 2, [GOLDEN]: 0, [APRICOT]: 0, [MINTY]: 3 },
  tired: { [HIBISCUS]: 0, [LEMON]: 3, [TURMERIC]: 1, [GOLDEN]: 1, [APRICOT]: 1, [MINTY]: 2 },
  glow: { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 3, [APRICOT]: 1, [MINTY]: 0 },
};

/** Question 3 — desired result. */
const RESULT_POINTS: Readonly<Record<DesiredResult, ProductScores>> = {
  bright: { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 3, [APRICOT]: 0, [MINTY]: 0 },
  soft: { [HIBISCUS]: 2, [LEMON]: 1, [TURMERIC]: 0, [GOLDEN]: 0, [APRICOT]: 3, [MINTY]: 0 },
  fresh: { [HIBISCUS]: 0, [LEMON]: 3, [TURMERIC]: 1, [GOLDEN]: 0, [APRICOT]: 1, [MINTY]: 2 },
  clean: { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 1, [GOLDEN]: 0, [APRICOT]: 0, [MINTY]: 3 },
  smooth: { [HIBISCUS]: 1, [LEMON]: 2, [TURMERIC]: 2, [GOLDEN]: 2, [APRICOT]: 1, [MINTY]: 0 },
  glowing: { [HIBISCUS]: 3, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 2, [APRICOT]: 1, [MINTY]: 0 },
};

/** Fixed priority applied to equal scores, so every path resolves deterministically. */
export const TIE_BREAK_ORDER: readonly ProductSlug[] = [
  TURMERIC,
  HIBISCUS,
  APRICOT,
  GOLDEN,
  LEMON,
  MINTY,
];

const TIE_BREAK_RANK = new Map<ProductSlug, number>(
  TIE_BREAK_ORDER.map((slug, index) => [slug, index]),
);

/** Products that survive the question 1 filter, in tie-break order. */
export function eligibleForSkinType(skinType: SkinType): ProductSlug[] {
  return TIE_BREAK_ORDER.filter((slug) => ELIGIBILITY[skinType][slug]);
}

export function isEligible(skinType: SkinType, slug: ProductSlug): boolean {
  return ELIGIBILITY[skinType][slug];
}

/** Q1 bonus + Q2 points + Q3 points. Eligibility is applied separately. */
export function scoreFor(
  slug: ProductSlug,
  skinType: SkinType,
  goal: SkinGoal,
  result: DesiredResult,
): number {
  return SKIN_TYPE_BONUS[skinType][slug] + GOAL_POINTS[goal][slug] + RESULT_POINTS[result][slug];
}

/**
 * Every eligible product, best first. Ties break by TIE_BREAK_ORDER, so the ordering
 * is total and the result never depends on sort stability.
 */
export function rankedSlugs(answers: QuizAnswers): ProductSlug[] {
  const { skinType, goal, result } = answers;
  if (skinType === null || goal === null || result === null) {
    return [];
  }
  return eligibleForSkinType(skinType).sort((a, b) => {
    const delta = scoreFor(b, skinType, goal, result) - scoreFor(a, skinType, goal, result);
    return delta !== 0 ? delta : TIE_BREAK_RANK.get(a)! - TIE_BREAK_RANK.get(b)!;
  });
}

/**
 * The recommendation: the top two eligible products, or the single one when the
 * question 1 filter leaves only one standing. Never empty for a complete answer set.
 */
export function recommendSlugs(answers: QuizAnswers): ProductSlug[] {
  return rankedSlugs(answers).slice(0, MAX_RECOMMENDATIONS);
}

/** The final recommendation as full products. */
export function recommend(answers: QuizAnswers): Product[] {
  return recommendSlugs(answers).map(getProduct);
}

/**
 * "Why we chose this for you", composed from the two answer-keyed fragments and the
 * product's own official description rather than from 180 hand-written variants.
 */
export function composeReason(answers: QuizAnswers, slug: ProductSlug): string {
  const { skinType, goal } = answers;
  const product = getProduct(slug);
  if (skinType === null || goal === null) {
    return product.description;
  }
  // The stored skin-type fragment ends in a full stop so it reads on its own; swap it
  // for a comma so the goal clause continues the same sentence.
  const opening = SKIN_TYPE_FRAGMENTS[skinType].replace(/\.$/, ',');
  return `${opening} ${GOAL_FRAGMENTS[goal]} ${product.description}`;
}

/**
 * Upsell selection:
 *  - always the Minty Fresh Clay Mask, for every skin type — including Dry and
 *    Sensitive, where it is excluded from the quiz recommendation. This is deliberate;
 *    those visitors get a sensitivity notice instead (see needsSensitivityNotice).
 *  - if it is already in the cart — which is exactly the case where the quiz itself
 *    recommended it — fall back to the highest-scoring eligible product not yet in the
 *    cart, using the same scoring and tie-break order.
 *  - null when nothing is left to offer, which skips the upsell step.
 */
export function pickUpsell(
  answers: QuizAnswers,
  cartSlugs: readonly ProductSlug[],
): ProductSlug | null {
  const inCart = new Set(cartSlugs);
  if (!inCart.has(UPSELL_SLUG)) {
    return UPSELL_SLUG;
  }
  return rankedSlugs(answers).find((slug) => !inCart.has(slug)) ?? null;
}

/** The menthol notice belongs under the upsell card for dry and sensitive skin only. */
export function needsSensitivityNotice(
  skinType: SkinType | null,
  upsellSlug: ProductSlug | null,
): boolean {
  return upsellSlug === MINTY && (skinType === 'dry' || skinType === 'sensitive');
}
