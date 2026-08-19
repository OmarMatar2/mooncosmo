import { describe, expect, it } from 'vitest';
import {
  MAX_RECOMMENDATIONS,
  TIE_BREAK_ORDER,
  composeReason,
  eligibleForSkinType,
  isEligible,
  needsSensitivityNotice,
  pickUpsell,
  rankedSlugs,
  recommendSlugs,
  scoreFor,
} from './recommendation.engine';
import { CANONICAL_ORDER, getProduct } from '../data/products.data';
import { ProductSlug } from '../models/product.model';
import { DesiredResult, QuizAnswers, SkinGoal, SkinType } from '../models/quiz.model';

const HIBISCUS: ProductSlug = 'hibiscus-rosa-radiance-scrub';
const LEMON: ProductSlug = 'lemon-mint-cucumber-scrub';
const TURMERIC: ProductSlug = 'turmeric-glow-scrub';
const GOLDEN: ProductSlug = 'golden-radiance-scrub';
const APRICOT: ProductSlug = 'apricot-glow-scrub';
const MINTY: ProductSlug = 'minty-fresh-clay-mask';

const SKIN_TYPES: readonly SkinType[] = ['oily', 'combination', 'normal', 'dry', 'sensitive'];
const GOALS: readonly SkinGoal[] = [
  'dullness',
  'texture',
  'dryness',
  'excess-oil',
  'tired',
  'glow',
];
const RESULTS: readonly DesiredResult[] = [
  'bright',
  'soft',
  'fresh',
  'clean',
  'smooth',
  'glowing',
];

function answers(skinType: SkinType, goal: SkinGoal, result: DesiredResult): QuizAnswers {
  return { skinType, goal, result };
}

/** Every one of the 5 × 6 × 6 = 180 answer paths. */
function allPaths(): QuizAnswers[] {
  const paths: QuizAnswers[] = [];
  for (const skinType of SKIN_TYPES) {
    for (const goal of GOALS) {
      for (const result of RESULTS) {
        paths.push(answers(skinType, goal, result));
      }
    }
  }
  return paths;
}

/**
 * The section 1a exclusion table, transcribed independently of the engine so the test
 * fails if the engine's own table is edited by mistake.
 */
const EXCLUDED: Readonly<Record<SkinType, readonly ProductSlug[]>> = {
  oily: [APRICOT],
  combination: [APRICOT],
  normal: [],
  dry: [TURMERIC, MINTY],
  sensitive: [LEMON, TURMERIC, MINTY],
};

describe('answer paths', () => {
  it('covers 180 combinations', () => {
    expect(allPaths()).toHaveLength(180);
  });

  it('returns between one and two products for every path', () => {
    for (const path of allPaths()) {
      const slugs = recommendSlugs(path);
      expect(slugs.length, JSON.stringify(path)).toBeGreaterThanOrEqual(1);
      expect(slugs.length, JSON.stringify(path)).toBeLessThanOrEqual(MAX_RECOMMENDATIONS);
    }
  });

  it('never returns the same product twice', () => {
    for (const path of allPaths()) {
      const slugs = recommendSlugs(path);
      expect(new Set(slugs).size, JSON.stringify(path)).toBe(slugs.length);
    }
  });

  it('returns nothing until all three questions are answered', () => {
    expect(recommendSlugs({ skinType: null, goal: null, result: null })).toEqual([]);
    expect(recommendSlugs({ skinType: 'oily', goal: null, result: null })).toEqual([]);
    expect(recommendSlugs({ skinType: 'oily', goal: 'dullness', result: null })).toEqual([]);
  });
});

describe('question 1 eligibility filter', () => {
  it('excludes exactly the products marked ✗, for every skin type', () => {
    for (const skinType of SKIN_TYPES) {
      const eligible = eligibleForSkinType(skinType);
      for (const slug of CANONICAL_ORDER) {
        const shouldBeExcluded = EXCLUDED[skinType].includes(slug);
        expect(eligible.includes(slug), `${skinType}/${slug}`).toBe(!shouldBeExcluded);
        expect(isEligible(skinType, slug), `${skinType}/${slug}`).toBe(!shouldBeExcluded);
      }
    }
  });

  it('never recommends an excluded product on any of the 180 paths', () => {
    for (const path of allPaths()) {
      for (const slug of recommendSlugs(path)) {
        expect(EXCLUDED[path.skinType!], JSON.stringify(path)).not.toContain(slug);
      }
    }
  });

  it('is a hard exclusion, not a penalty: a top-scoring excluded product still loses', () => {
    // Minty Fresh scores 6 on dry + excess-oil + clean — the highest of any product on
    // that path — yet is filtered out entirely.
    const path = answers('dry', 'excess-oil', 'clean');
    expect(scoreFor(MINTY, 'dry', 'excess-oil', 'clean')).toBeGreaterThan(
      Math.max(...rankedSlugs(path).map((s) => scoreFor(s, 'dry', 'excess-oil', 'clean'))),
    );
    expect(recommendSlugs(path)).not.toContain(MINTY);
  });

  it('never gives dry or sensitive skin Minty Fresh or Turmeric', () => {
    for (const path of allPaths()) {
      if (path.skinType !== 'dry' && path.skinType !== 'sensitive') {
        continue;
      }
      const slugs = recommendSlugs(path);
      expect(slugs, JSON.stringify(path)).not.toContain(MINTY);
      expect(slugs, JSON.stringify(path)).not.toContain(TURMERIC);
    }
  });

  it('never gives sensitive skin Lemon Mint', () => {
    for (const path of allPaths()) {
      if (path.skinType === 'sensitive') {
        expect(recommendSlugs(path), JSON.stringify(path)).not.toContain(LEMON);
      }
    }
  });

  it('never gives oily or combination skin Apricot', () => {
    for (const path of allPaths()) {
      if (path.skinType !== 'oily' && path.skinType !== 'combination') {
        continue;
      }
      expect(recommendSlugs(path), JSON.stringify(path)).not.toContain(APRICOT);
    }
  });

  it('still returns two products for the most restrictive skin type', () => {
    // Sensitive keeps three products, so even there the top two are available.
    expect(eligibleForSkinType('sensitive')).toHaveLength(3);
    for (const goal of GOALS) {
      for (const result of RESULTS) {
        expect(recommendSlugs(answers('sensitive', goal, result))).toHaveLength(2);
      }
    }
  });
});

describe('scoring', () => {
  it('sums the Q1 bonus, Q2 points and Q3 points', () => {
    // Oily: Turmeric bonus +2, dullness +3, bright +2 = 7.
    expect(scoreFor(TURMERIC, 'oily', 'dullness', 'bright')).toBe(7);
    // Sensitive: Apricot bonus +2, dryness +3, soft +3 = 8.
    expect(scoreFor(APRICOT, 'sensitive', 'dryness', 'soft')).toBe(8);
    // Normal: Lemon Mint bonus +0, tired +3, fresh +3 = 6.
    expect(scoreFor(LEMON, 'normal', 'tired', 'fresh')).toBe(6);
  });

  it('orders the recommendation by descending score', () => {
    for (const path of allPaths()) {
      const { skinType, goal, result } = path;
      const scores = rankedSlugs(path).map((s) => scoreFor(s, skinType!, goal!, result!));
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1], JSON.stringify(path)).toBeGreaterThanOrEqual(scores[i]);
      }
    }
  });

  it('picks the two highest scorers', () => {
    const path = answers('oily', 'excess-oil', 'clean');
    // Minty 2+3+3 = 8, Turmeric 2+2+1 = 5, Lemon 1+1+1 = 3, Hibiscus 0, Golden 0.
    expect(recommendSlugs(path)).toEqual([MINTY, TURMERIC]);
  });
});

describe('tie-breaking', () => {
  it('uses the fixed priority order', () => {
    expect(TIE_BREAK_ORDER).toEqual([TURMERIC, HIBISCUS, APRICOT, GOLDEN, LEMON, MINTY]);
  });

  it('resolves equal scores by that order on every path', () => {
    for (const path of allPaths()) {
      const { skinType, goal, result } = path;
      const ranked = rankedSlugs(path);
      for (let i = 1; i < ranked.length; i++) {
        const previous = ranked[i - 1];
        const current = ranked[i];
        if (scoreFor(previous, skinType!, goal!, result!) !== scoreFor(current, skinType!, goal!, result!)) {
          continue;
        }
        expect(
          TIE_BREAK_ORDER.indexOf(previous),
          `${JSON.stringify(path)}: ${previous} before ${current}`,
        ).toBeLessThan(TIE_BREAK_ORDER.indexOf(current));
      }
    }
  });

  it('prefers Turmeric over Hibiscus at an equal score', () => {
    // Combination + glow + bright ties Turmeric 1+2+2 = 5 with Hibiscus 1+2+2 = 5.
    // Golden outscores both at 1+3+3 = 7, so the tie decides second place, not first.
    const path = answers('combination', 'glow', 'bright');
    expect(scoreFor(TURMERIC, 'combination', 'glow', 'bright')).toBe(
      scoreFor(HIBISCUS, 'combination', 'glow', 'bright'),
    );
    const ranked = rankedSlugs(path);
    expect(ranked.indexOf(TURMERIC)).toBeLessThan(ranked.indexOf(HIBISCUS));
    expect(recommendSlugs(path)).toEqual([GOLDEN, TURMERIC]);
  });

  it('prefers Apricot over Golden at an equal score', () => {
    // Sensitive + texture + smooth: Apricot 2+2+1 = 5, Golden 1+2+2 = 5.
    expect(scoreFor(APRICOT, 'sensitive', 'texture', 'smooth')).toBe(
      scoreFor(GOLDEN, 'sensitive', 'texture', 'smooth'),
    );
    const ranked = rankedSlugs(answers('sensitive', 'texture', 'smooth'));
    expect(ranked.indexOf(APRICOT)).toBeLessThan(ranked.indexOf(GOLDEN));
  });

  it('is deterministic — repeated calls give identical results', () => {
    for (const path of allPaths()) {
      expect(recommendSlugs(path)).toEqual(recommendSlugs(path));
    }
  });
});

describe('upsell', () => {
  it('is Minty Fresh on every path where the quiz did not recommend it', () => {
    for (const path of allPaths()) {
      const cart = recommendSlugs(path);
      if (cart.includes(MINTY)) {
        continue;
      }
      expect(pickUpsell(path, cart), JSON.stringify(path)).toBe(MINTY);
    }
  });

  it('offers Minty Fresh to dry and sensitive skin, despite the quiz exclusion', () => {
    for (const skinType of ['dry', 'sensitive'] as const) {
      for (const goal of GOALS) {
        for (const result of RESULTS) {
          const path = answers(skinType, goal, result);
          expect(pickUpsell(path, recommendSlugs(path))).toBe(MINTY);
        }
      }
    }
  });

  it('falls back to the highest-scoring remaining product when Minty was recommended', () => {
    for (const path of allPaths()) {
      const cart = recommendSlugs(path);
      if (!cart.includes(MINTY)) {
        continue;
      }
      const upsell = pickUpsell(path, cart);
      const remaining = rankedSlugs(path).filter((slug) => !cart.includes(slug));
      expect(upsell, JSON.stringify(path)).toBe(remaining[0] ?? null);
      expect(cart, JSON.stringify(path)).not.toContain(upsell);
    }
  });

  it('never offers a product already in the cart', () => {
    for (const path of allPaths()) {
      const cart = recommendSlugs(path);
      const upsell = pickUpsell(path, cart);
      expect(cart, JSON.stringify(path)).not.toContain(upsell);
    }
  });

  it('never offers a product excluded for that skin type as the fallback', () => {
    for (const path of allPaths()) {
      const cart = recommendSlugs(path);
      const upsell = pickUpsell(path, cart);
      if (upsell === null || upsell === MINTY) {
        continue;
      }
      expect(EXCLUDED[path.skinType!], JSON.stringify(path)).not.toContain(upsell);
    }
  });

  it('returns null once nothing is left to offer', () => {
    const path = answers('sensitive', 'dryness', 'soft');
    const everything: ProductSlug[] = [...CANONICAL_ORDER];
    expect(pickUpsell(path, everything)).toBeNull();
  });
});

describe('sensitivity notice', () => {
  it('appears for dry and sensitive skin when the upsell is the mask', () => {
    for (const path of allPaths()) {
      const upsell = pickUpsell(path, recommendSlugs(path));
      const expected = path.skinType === 'dry' || path.skinType === 'sensitive';
      expect(needsSensitivityNotice(path.skinType, upsell), JSON.stringify(path)).toBe(expected);
    }
  });

  it('never appears for oily, combination or normal skin', () => {
    for (const path of allPaths()) {
      if (path.skinType === 'dry' || path.skinType === 'sensitive') {
        continue;
      }
      const upsell = pickUpsell(path, recommendSlugs(path));
      expect(needsSensitivityNotice(path.skinType, upsell), JSON.stringify(path)).toBe(false);
    }
  });

  it('does not appear when the upsell fell back to something other than the mask', () => {
    expect(needsSensitivityNotice('dry', APRICOT)).toBe(false);
    expect(needsSensitivityNotice('sensitive', HIBISCUS)).toBe(false);
  });
});

describe('composed "why we chose this for you" copy', () => {
  it('joins the skin-type fragment, the goal fragment and the official description', () => {
    expect(composeReason(answers('oily', 'excess-oil', 'clean'), MINTY)).toBe(
      'You told us your skin tends to be oily, and that excess oil and clogged-looking ' +
        'pores are your main concern. Mint is known for its antibacterial and ' +
        'anti-inflammatory properties, making it effective at addressing breakouts and ' +
        'calming irritation, while its high antioxidant content helps reduce dark ' +
        'circles and brighten skin.',
    );

    expect(composeReason(answers('sensitive', 'dryness', 'soft'), APRICOT)).toBe(
      'You told us your skin is sensitive, and that dryness is what bothers you most. ' +
        'Apricot is rich in vitamins and antioxidants that nourish, soften and brighten, ' +
        'while its natural exfoliating properties lift away dead skin cells and its ' +
        'moisturizing benefits keep skin smooth, supple and radiant.',
    );

    expect(composeReason(answers('combination', 'dullness', 'bright'), TURMERIC)).toBe(
      'You told us your skin is combination — oily in some areas, normal in others, and ' +
        'that dullness is what bothers you most. Turmeric acts as a natural reset for ' +
        'your skin — calming redness, defending against environmental stress, and ' +
        'revealing a glow from within.',
    );

    expect(composeReason(answers('dry', 'tired', 'fresh'), HIBISCUS)).toBe(
      'You told us your skin tends to be dry, and that your skin has been looking tired. ' +
        'Hibiscus is a skincare powerhouse, packed with antioxidants and natural acids ' +
        'that promote a radiant complexion. It gently exfoliates, supports collagen ' +
        'preservation, and helps reduce fine lines, leaving skin firm, hydrated, and glowing.',
    );

    expect(composeReason(answers('normal', 'glow', 'glowing'), GOLDEN)).toBe(
      "You told us your skin is generally normal, and that you're after a healthy-looking " +
        'glow. Gold stimulates circulation, supports skin elasticity, and protects ' +
        'against environmental damage, revealing a naturally luminous, youthful look.',
    );
  });

  it('ends every composed reason with the product’s own description', () => {
    for (const path of allPaths()) {
      for (const slug of recommendSlugs(path)) {
        expect(composeReason(path, slug), JSON.stringify(path)).toContain(
          getProduct(slug).description,
        );
      }
    }
  });

  it('reads as a single sentence — the skin-type full stop becomes a comma', () => {
    for (const path of allPaths()) {
      for (const slug of recommendSlugs(path)) {
        expect(composeReason(path, slug)).not.toContain('. and that');
      }
    }
  });

  it('falls back to the bare description when answers are incomplete', () => {
    expect(composeReason({ skinType: null, goal: null, result: null }, MINTY)).toBe(
      getProduct(MINTY).description,
    );
  });
});
