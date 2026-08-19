import { ProductSlug } from './product.model';

/** Q1 — hard-filters product eligibility and adds a small suitability bonus. */
export type SkinType = 'oily' | 'combination' | 'normal' | 'dry' | 'sensitive';

/** Q2 — what the visitor wants to improve. Scored, never filtering. */
export type SkinGoal = 'dullness' | 'texture' | 'dryness' | 'excess-oil' | 'tired' | 'glow';

/** Q3 — how they want their skin to look and feel afterward. Scored, never filtering. */
export type DesiredResult = 'bright' | 'soft' | 'fresh' | 'clean' | 'smooth' | 'glowing';

export interface QuizAnswers {
  readonly skinType: SkinType | null;
  readonly goal: SkinGoal | null;
  readonly result: DesiredResult | null;
}

export const EMPTY_ANSWERS: QuizAnswers = {
  skinType: null,
  goal: null,
  result: null,
};

/** Steps 1–3 are questions; then the analysis animation, then the result and upsell. */
export type QuizStep = 1 | 2 | 3 | 'analysis' | 'result' | 'upsell';

/** Every visitor answers all three questions — there is no conditional branch. */
export const TOTAL_QUESTIONS = 3;

export interface QuizOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface PersistedQuizState {
  readonly step: QuizStep;
  readonly answers: QuizAnswers;
  readonly upsellShown: boolean;
}

/** A recommended product together with its composed "why we chose this" copy. */
export interface RecommendedProduct {
  readonly slug: ProductSlug;
  readonly why: string;
}
