import { describe, expect, it } from 'vitest';
import {
  MAX_RECOMMENDATIONS,
  ROUTINE_COMPLETER_SLUG,
  TIE_BREAK_ORDER,
  composeReason,
  eligibleSlugs,
  isEligible,
  needsSensitivityNotice,
  pickRoutineCompleter,
  rankedSlugs,
  recommendSlugs,
  scoreFor,
} from './recommendation.engine';
import { AGE_OPTIONS } from '../data/quiz.data';
import { getProduct } from '../data/products.data';
import { ProductSlug } from '../models/product.model';
import {
  AgeRange,
  DesiredResult,
  QuizAnswers,
  ScoredSlug,
  SkinConcern,
  SkinTone,
  SkinType,
} from '../models/quiz.model';

const TONES: readonly SkinTone[] = ['fair', 'medium', 'tan', 'deep'];
const TYPES: readonly SkinType[] = ['normal', 'oily', 'combination', 'dry', 'sensitive'];
const CONCERNS: readonly SkinConcern[] = [
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
const AGES: readonly AgeRange[] = AGE_OPTIONS.map((o) => o.value);

const HIBISCUS = 'hibiscus-rosa-radiance-scrub';
const LEMON = 'lemon-mint-cucumber-scrub';
const TURMERIC = 'turmeric-glow-scrub';
const GOLDEN = 'golden-radiance-scrub';
const APRICOT = 'apricot-glow-scrub';
const MINTY: ProductSlug = 'minty-fresh-clay-mask';

/** The 720 scored paths: tone × type × concern × result. Age is deliberately absent. */
function everyPath(): QuizAnswers[] {
  const paths: QuizAnswers[] = [];
  for (const tone of TONES) {
    for (const skinType of TYPES) {
      for (const concern of CONCERNS) {
        for (const result of RESULTS) {
          paths.push({ age: '25-34', tone, skinType, concern, result });
        }
      }
    }
  }
  return paths;
}

const PATHS = everyPath();

function describePath(a: QuizAnswers): string {
  return `${a.tone}/${a.skinType}/${a.concern}/${a.result}`;
}

describe('the answer space', () => {
  it('is exactly 720 paths', () => {
    expect(PATHS).toHaveLength(720);
    expect(TONES.length * TYPES.length * CONCERNS.length * RESULTS.length).toBe(720);
  });
});

describe('recommendSlugs', () => {
  it('returns exactly two products on every one of the 720 paths', () => {
    const wrong = PATHS.filter((a) => recommendSlugs(a).length !== MAX_RECOMMENDATIONS).map(
      describePath,
    );
    expect(wrong).toEqual([]);
  });

  it('never returns the same product twice', () => {
    const duplicated = PATHS.filter((a) => new Set(recommendSlugs(a)).size !== 2).map(
      describePath,
    );
    expect(duplicated).toEqual([]);
  });

  it('never returns a product excluded by either filter', () => {
    const violations: string[] = [];
    for (const a of PATHS) {
      for (const slug of recommendSlugs(a)) {
        if (!isEligible(a.tone!, a.skinType!, slug)) {
          violations.push(`${describePath(a)} → ${slug}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('returns the two highest-scoring eligible products', () => {
    const violations: string[] = [];
    for (const a of PATHS) {
      const picked = recommendSlugs(a);
      const rest = eligibleSlugs(a.tone!, a.skinType!).filter((s) => !picked.includes(s));
      const lowestPicked = Math.min(
        ...picked.map((s) => scoreFor(s, a.skinType!, a.concern!, a.result!)),
      );
      for (const slug of rest) {
        if (scoreFor(slug, a.skinType!, a.concern!, a.result!) > lowestPicked) {
          violations.push(`${describePath(a)}: ${slug} outscores a picked product`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('is ordered best first', () => {
    const violations = PATHS.filter((a) => {
      const [first, second] = recommendSlugs(a);
      return (
        scoreFor(first, a.skinType!, a.concern!, a.result!) <
        scoreFor(second, a.skinType!, a.concern!, a.result!)
      );
    }).map(describePath);
    expect(violations).toEqual([]);
  });
});

describe('eligibility filters', () => {
  it('always leaves at least two products standing', () => {
    for (const tone of TONES) {
      for (const skinType of TYPES) {
        expect(eligibleSlugs(tone, skinType).length, `${tone}/${skinType}`).toBeGreaterThanOrEqual(
          2,
        );
      }
    }
  });

  it('never recommends Turmeric for fair or deep skin tone', () => {
    const violations = PATHS.filter(
      (a) => (a.tone === 'fair' || a.tone === 'deep') && recommendSlugs(a).includes(TURMERIC),
    ).map(describePath);
    expect(violations).toEqual([]);
  });

  it('never recommends Golden Radiance for medium or tan skin tone', () => {
    const violations = PATHS.filter(
      (a) => (a.tone === 'medium' || a.tone === 'tan') && recommendSlugs(a).includes(GOLDEN),
    ).map(describePath);
    expect(violations).toEqual([]);
  });

  it('never recommends Apricot for oily skin', () => {
    const violations = PATHS.filter(
      (a) => a.skinType === 'oily' && recommendSlugs(a).includes(APRICOT),
    ).map(describePath);
    expect(violations).toEqual([]);
  });

  it('never recommends Lemon Mint or Turmeric for dry or sensitive skin', () => {
    const violations = PATHS.filter((a) => {
      if (a.skinType !== 'dry' && a.skinType !== 'sensitive') {
        return false;
      }
      const picked = recommendSlugs(a);
      return picked.includes(LEMON) || picked.includes(TURMERIC);
    }).map(describePath);
    expect(violations).toEqual([]);
  });

  it('keeps Hibiscus eligible on every path — it is the universal fallback', () => {
    for (const tone of TONES) {
      for (const skinType of TYPES) {
        expect(isEligible(tone, skinType, HIBISCUS), `${tone}/${skinType}`).toBe(true);
      }
    }
  });
});

describe('the Minty Fresh Clay Mask', () => {
  it('never appears as a quiz recommendation', () => {
    const violations = PATHS.filter((a) =>
      (recommendSlugs(a) as readonly ProductSlug[]).includes(MINTY),
    ).map(describePath);
    expect(violations).toEqual([]);
  });

  it('never appears anywhere in the full ranking, not just the top two', () => {
    const violations = PATHS.filter((a) =>
      (rankedSlugs(a) as readonly ProductSlug[]).includes(MINTY),
    ).map(describePath);
    expect(violations).toEqual([]);
  });

  it('is absent from the tie-break order, which covers only scored products', () => {
    expect(TIE_BREAK_ORDER).toHaveLength(5);
    expect((TIE_BREAK_ORDER as readonly ProductSlug[]).includes(MINTY)).toBe(false);
  });

  it('is always the routine completer, on every path', () => {
    for (const a of PATHS) {
      expect(pickRoutineCompleter(), describePath(a)).toBe(MINTY);
    }
    expect(ROUTINE_COMPLETER_SLUG).toBe(MINTY);
  });
});

describe('age', () => {
  it('has no effect: paths differing only in age give identical results', () => {
    const violations: string[] = [];
    for (const base of PATHS) {
      const expected = recommendSlugs({ ...base, age: AGES[0] });
      for (const age of AGES.slice(1)) {
        const actual = recommendSlugs({ ...base, age });
        if (actual.join('|') !== expected.join('|')) {
          violations.push(`${describePath(base)} @ ${age}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('does not change the composed reason either', () => {
    for (const base of PATHS.slice(0, 60)) {
      const slug = recommendSlugs(base)[0];
      const first = composeReason({ ...base, age: AGES[0] }, slug);
      for (const age of AGES.slice(1)) {
        expect(composeReason({ ...base, age }, slug)).toBe(first);
      }
    }
  });

  it('is not required to produce a recommendation', () => {
    const withoutAge: QuizAnswers = {
      age: null,
      tone: 'medium',
      skinType: 'oily',
      concern: 'excess-oil',
      result: 'clean',
    };
    expect(recommendSlugs(withoutAge)).toHaveLength(2);
  });
});

describe('tie-breaking', () => {
  it('resolves every tie by TIE_BREAK_ORDER: Hibiscus → Apricot → Turmeric → Golden → Lemon', () => {
    expect(TIE_BREAK_ORDER).toEqual([HIBISCUS, APRICOT, TURMERIC, GOLDEN, LEMON]);
  });

  it('orders tied products by that priority on every path where a tie occurs', () => {
    const rank = new Map<ScoredSlug, number>(TIE_BREAK_ORDER.map((s, i) => [s, i]));
    const violations: string[] = [];
    let tiesSeen = 0;

    for (const a of PATHS) {
      const ranked = rankedSlugs(a);
      for (let i = 0; i < ranked.length - 1; i++) {
        const left = ranked[i];
        const right = ranked[i + 1];
        const same =
          scoreFor(left, a.skinType!, a.concern!, a.result!) ===
          scoreFor(right, a.skinType!, a.concern!, a.result!);
        if (!same) {
          continue;
        }
        tiesSeen++;
        if (rank.get(left)! > rank.get(right)!) {
          violations.push(`${describePath(a)}: ${left} before ${right}`);
        }
      }
    }

    expect(violations).toEqual([]);
    // Guards the assertion above against passing vacuously.
    expect(tiesSeen).toBeGreaterThan(0);
  });

  it('is deterministic — the same answers always give the same result', () => {
    for (const a of PATHS) {
      expect(recommendSlugs(a)).toEqual(recommendSlugs({ ...a }));
    }
  });
});

describe('needsSensitivityNotice', () => {
  it('is true for dry and sensitive skin only', () => {
    expect(needsSensitivityNotice('dry')).toBe(true);
    expect(needsSensitivityNotice('sensitive')).toBe(true);
    expect(needsSensitivityNotice('normal')).toBe(false);
    expect(needsSensitivityNotice('oily')).toBe(false);
    expect(needsSensitivityNotice('combination')).toBe(false);
    expect(needsSensitivityNotice(null)).toBe(false);
  });

  it('depends on nothing but skin type', () => {
    for (const a of PATHS) {
      const expected = a.skinType === 'dry' || a.skinType === 'sensitive';
      expect(needsSensitivityNotice(a.skinType), describePath(a)).toBe(expected);
    }
  });
});

describe('composeReason', () => {
  it('names the skin type, the concern and the product on every path', () => {
    for (const a of PATHS) {
      for (const slug of recommendSlugs(a)) {
        const why = composeReason(a, slug);
        expect(why, describePath(a)).toContain(getProduct(slug).name);
        expect(why).toContain('You told us');
        expect(why).toContain('so it suits your');
      }
    }
  });

  it('states the benefit using the product\'s approved description, never invented copy', () => {
    for (const a of PATHS.slice(0, 120)) {
      for (const slug of recommendSlugs(a)) {
        const product = getProduct(slug);
        const approved = product.description.replace(/\.$/, '');
        const lowered = approved.charAt(0).toLowerCase() + approved.slice(1);
        expect(composeReason(a, slug)).toContain(lowered);
      }
    }
  });

  it('mentions tone descriptively but never as a reason a product was chosen', () => {
    for (const a of PATHS) {
      const why = composeReason(a, recommendSlugs(a)[0]);
      expect(why).toContain(`with a ${a.tone} tone`);
      // The justification clause is about skin type alone. No phrasing may present a
      // product as being "for" a skin tone.
      for (const tone of TONES) {
        expect(why).not.toContain(`formulated for ${tone}`);
        expect(why).not.toContain(`suits your ${tone} tone`);
        expect(why).not.toContain(`for ${tone} skin tones`);
      }
    }
  });

  it('falls back to the plain description when the answers are incomplete', () => {
    const partial: QuizAnswers = {
      age: '18-24',
      tone: null,
      skinType: null,
      concern: null,
      result: null,
    };
    expect(composeReason(partial, HIBISCUS)).toBe(getProduct(HIBISCUS).description);
  });

  it('matches the shape given in the brief', () => {
    const answers: QuizAnswers = {
      age: '25-34',
      tone: 'medium',
      skinType: 'oily',
      concern: 'excess-oil',
      result: 'clean',
    };
    expect(composeReason(answers, TURMERIC)).toBe(
      'You told us your skin is oily with a medium tone, and that excess oil and clogged ' +
        'pores are your main concern. Turmeric Glow Scrub unclogs pores and helps brighten ' +
        "for a healthy, even-toned look — and it's formulated for normal to oily skin, so " +
        'it suits your oily skin.',
    );
  });
});

describe('incomplete answers', () => {
  it('produce no recommendation until every scoring question is answered', () => {
    expect(recommendSlugs({ age: null, tone: null, skinType: null, concern: null, result: null })).toEqual([]);
    expect(
      recommendSlugs({ age: '18-24', tone: 'fair', skinType: null, concern: null, result: null }),
    ).toEqual([]);
    expect(
      recommendSlugs({ age: '18-24', tone: 'fair', skinType: 'dry', concern: 'dryness', result: null }),
    ).toEqual([]);
  });
});
