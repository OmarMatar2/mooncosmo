import { getProduct } from '../data/products.data';
import {
  BENEFIT_CONNECTORS,
  CONCERN_FRAGMENTS,
  SKIN_TONE_FRAGMENTS,
  SKIN_TYPE_FRAGMENTS,
  SKIN_TYPE_LABELS,
} from '../data/quiz.data';
import { Product, ProductSlug } from '../models/product.model';
import {
  DesiredResult,
  QuizAnswers,
  ScoredSlug,
  SkinConcern,
  SkinTone,
  SkinType,
} from '../models/quiz.model';

/**
 * Pure recommendation logic. No Angular, no state, no side effects — everything here
 * is a function of its arguments, so all 720 answer paths are exhaustively testable.
 *
 * TO MODIFY THE RECOMMENDATION: edit the five tables below. TONE_ELIGIBILITY and
 * TYPE_ELIGIBILITY are hard filters — a product excluded by *either* can never be
 * recommended, whatever it scores. TYPE_BONUS, CONCERN_POINTS and RESULT_POINTS are
 * additive. TIE_BREAK_ORDER resolves equal scores. Nothing else needs to change.
 *
 * Age (Q1) appears nowhere in this file, by design: it is collected for copy and
 * analytics and has no influence on the result.
 */

const HIBISCUS = 'hibiscus-rosa-radiance-scrub' satisfies ScoredSlug;
const LEMON = 'lemon-mint-cucumber-scrub' satisfies ScoredSlug;
const TURMERIC = 'turmeric-glow-scrub' satisfies ScoredSlug;
const GOLDEN = 'golden-radiance-scrub' satisfies ScoredSlug;
const APRICOT = 'apricot-glow-scrub' satisfies ScoredSlug;

/**
 * The routine completer, offered unconditionally after every result. It is not a
 * ScoredSlug, so it cannot be written into any table below — the mask's exclusion
 * from the quiz is enforced by the type system rather than by convention.
 *
 * TODO: this is the 400 ml entry. The brief calls for the 200 ml variant, which does
 * not yet exist in products.data.ts; add it there (never overwriting an existing id)
 * and select it by size, then point this at it.
 */
export const ROUTINE_COMPLETER_SLUG: ProductSlug = 'minty-fresh-clay-mask';

/** Exactly this many products are recommended. */
export const MAX_RECOMMENDATIONS = 2;

type ScoreRow = Readonly<Record<ScoredSlug, number>>;
type FilterRow = Readonly<Record<ScoredSlug, boolean>>;

/** Q2 eligibility. A hard exclusion, not a score penalty. */
const TONE_ELIGIBILITY: Readonly<Record<SkinTone, FilterRow>> = {
  fair:   { [HIBISCUS]: true, [LEMON]: true, [TURMERIC]: false, [GOLDEN]: true,  [APRICOT]: true },
  medium: { [HIBISCUS]: true, [LEMON]: true, [TURMERIC]: true,  [GOLDEN]: false, [APRICOT]: true },
  tan:    { [HIBISCUS]: true, [LEMON]: true, [TURMERIC]: true,  [GOLDEN]: false, [APRICOT]: true },
  deep:   { [HIBISCUS]: true, [LEMON]: true, [TURMERIC]: false, [GOLDEN]: true,  [APRICOT]: true },
};

/** Q3 eligibility. Applied together with TONE_ELIGIBILITY — both must pass. */
const TYPE_ELIGIBILITY: Readonly<Record<SkinType, FilterRow>> = {
  normal:      { [HIBISCUS]: true, [LEMON]: true,  [TURMERIC]: true,  [GOLDEN]: true, [APRICOT]: true },
  oily:        { [HIBISCUS]: true, [LEMON]: true,  [TURMERIC]: true,  [GOLDEN]: true, [APRICOT]: false },
  combination: { [HIBISCUS]: true, [LEMON]: true,  [TURMERIC]: true,  [GOLDEN]: true, [APRICOT]: true },
  dry:         { [HIBISCUS]: true, [LEMON]: false, [TURMERIC]: false, [GOLDEN]: true, [APRICOT]: true },
  sensitive:   { [HIBISCUS]: true, [LEMON]: false, [TURMERIC]: false, [GOLDEN]: true, [APRICOT]: true },
};

/**
 * Q3 suitability bonus, added only to products that survive both filters. Cells for
 * type-ineligible products are written as 0 — they are never read, but keeping the
 * record total is what lets the compiler catch a missing product.
 */
const TYPE_BONUS: Readonly<Record<SkinType, ScoreRow>> = {
  normal:      { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 1, [GOLDEN]: 1, [APRICOT]: 1 },
  oily:        { [HIBISCUS]: 0, [LEMON]: 2, [TURMERIC]: 2, [GOLDEN]: 1, [APRICOT]: 0 },
  combination: { [HIBISCUS]: 1, [LEMON]: 1, [TURMERIC]: 1, [GOLDEN]: 2, [APRICOT]: 1 },
  dry:         { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 1, [APRICOT]: 3 },
  sensitive:   { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 1, [APRICOT]: 2 },
};

/** Q4 — main concern. */
const CONCERN_POINTS: Readonly<Record<SkinConcern, ScoreRow>> = {
  dullness:     { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 3, [GOLDEN]: 2, [APRICOT]: 0 },
  texture:      { [HIBISCUS]: 1, [LEMON]: 2, [TURMERIC]: 1, [GOLDEN]: 2, [APRICOT]: 2 },
  dryness:      { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 0, [GOLDEN]: 0, [APRICOT]: 3 },
  'excess-oil': { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 3, [GOLDEN]: 0, [APRICOT]: 0 },
  tired:        { [HIBISCUS]: 0, [LEMON]: 3, [TURMERIC]: 1, [GOLDEN]: 1, [APRICOT]: 1 },
  glow:         { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 3, [APRICOT]: 1 },
};

/** Q5 — desired result. */
const RESULT_POINTS: Readonly<Record<DesiredResult, ScoreRow>> = {
  bright:  { [HIBISCUS]: 1, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 3, [APRICOT]: 0 },
  soft:    { [HIBISCUS]: 1, [LEMON]: 1, [TURMERIC]: 0, [GOLDEN]: 0, [APRICOT]: 3 },
  fresh:   { [HIBISCUS]: 0, [LEMON]: 3, [TURMERIC]: 1, [GOLDEN]: 0, [APRICOT]: 1 },
  clean:   { [HIBISCUS]: 0, [LEMON]: 1, [TURMERIC]: 2, [GOLDEN]: 0, [APRICOT]: 0 },
  smooth:  { [HIBISCUS]: 1, [LEMON]: 2, [TURMERIC]: 2, [GOLDEN]: 2, [APRICOT]: 1 },
  glowing: { [HIBISCUS]: 2, [LEMON]: 0, [TURMERIC]: 2, [GOLDEN]: 2, [APRICOT]: 1 },
};

/** Fixed priority applied to equal scores, so every path resolves deterministically. */
export const TIE_BREAK_ORDER: readonly ScoredSlug[] = [
  HIBISCUS,
  APRICOT,
  TURMERIC,
  GOLDEN,
  LEMON,
];

const TIE_BREAK_RANK = new Map<ScoredSlug, number>(
  TIE_BREAK_ORDER.map((slug, index) => [slug, index]),
);

/** A product is eligible only if it passes both filters. */
export function isEligible(tone: SkinTone, skinType: SkinType, slug: ScoredSlug): boolean {
  return TONE_ELIGIBILITY[tone][slug] && TYPE_ELIGIBILITY[skinType][slug];
}

/** Products surviving both filters, in tie-break order. Never fewer than two. */
export function eligibleSlugs(tone: SkinTone, skinType: SkinType): ScoredSlug[] {
  return TIE_BREAK_ORDER.filter((slug) => isEligible(tone, skinType, slug));
}

/** Q3 bonus + Q4 points + Q5 points. Eligibility is applied separately. */
export function scoreFor(
  slug: ScoredSlug,
  skinType: SkinType,
  concern: SkinConcern,
  result: DesiredResult,
): number {
  return (
    TYPE_BONUS[skinType][slug] + CONCERN_POINTS[concern][slug] + RESULT_POINTS[result][slug]
  );
}

/**
 * Every eligible product, best first. Ties break by TIE_BREAK_ORDER, so the ordering
 * is total and the result never depends on sort stability.
 */
export function rankedSlugs(answers: QuizAnswers): ScoredSlug[] {
  const { tone, skinType, concern, result } = answers;
  if (tone === null || skinType === null || concern === null || result === null) {
    return [];
  }
  return eligibleSlugs(tone, skinType).sort((a, b) => {
    const delta = scoreFor(b, skinType, concern, result) - scoreFor(a, skinType, concern, result);
    return delta !== 0 ? delta : TIE_BREAK_RANK.get(a)! - TIE_BREAK_RANK.get(b)!;
  });
}

/** The recommendation: the top two eligible products. */
export function recommendSlugs(answers: QuizAnswers): ScoredSlug[] {
  return rankedSlugs(answers).slice(0, MAX_RECOMMENDATIONS);
}

/** The final recommendation as full products. */
export function recommend(answers: QuizAnswers): Product[] {
  return recommendSlugs(answers).map(getProduct);
}

/**
 * "Why we chose this for you", composed from answer-keyed fragments plus the product's
 * own approved description — never from hand-written per-path variants.
 *
 * The benefit sentence is the product's approved copy verbatim, so this can never
 * assert a claim the master sheet does not make. Tone appears in the opening
 * description only; the reasoning clause names skin type alone, so no product is ever
 * presented as being "for" a particular skin tone.
 */
export function composeReason(answers: QuizAnswers, slug: ScoredSlug): string {
  const { tone, skinType, concern } = answers;
  const product = getProduct(slug);
  if (tone === null || skinType === null || concern === null) {
    return product.description;
  }
  const opening = `You told us ${SKIN_TYPE_FRAGMENTS[skinType]} ${SKIN_TONE_FRAGMENTS[tone]}, and that ${CONCERN_FRAGMENTS[concern]}.`;
  const connector = BENEFIT_CONNECTORS[slug];
  const lead = connector === '' ? product.name : `${product.name} ${connector}`;
  const benefit = `${lead} ${lowerFirst(product.description)}`;
  const suitability = `and it's formulated for ${lowerFirst(product.bestFor)}, so it suits your ${SKIN_TYPE_LABELS[skinType]} skin.`;
  return `${opening} ${stripFullStop(benefit)} — ${suitability}`;
}

/**
 * The routine completer is unconditional: the mask is never a quiz recommendation, so
 * there is no "already recommended" case to fall back from.
 */
export function pickRoutineCompleter(): ProductSlug {
  return ROUTINE_COMPLETER_SLUG;
}

/** The menthol notice belongs under the completer card for dry and sensitive skin only. */
export function needsSensitivityNotice(skinType: SkinType | null): boolean {
  return skinType === 'dry' || skinType === 'sensitive';
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stripFullStop(text: string): string {
  return text.replace(/\.$/, '');
}
