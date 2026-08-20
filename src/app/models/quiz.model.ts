import { ProductSlug } from './product.model';

/**
 * The five scrubs are the only products the quiz ever scores. The Minty Fresh Clay
 * Mask is deliberately absent: it is the routine completer (see ROUTINE_COMPLETER_SLUG)
 * and never a quiz recommendation. Because every scoring table below is keyed by this
 * type, the compiler — not a test — is what keeps the mask out of the scoring paths.
 */
export type ScoredSlug = Exclude<ProductSlug, 'minty-fresh-clay-mask'>;

/** Q1 — collected for copy and future analytics. Never scored, never filtering. */
export type AgeRange = 'under-18' | '18-24' | '25-34' | '35-44' | '45-plus';

/** Q2 — hard-filters product eligibility. Contributes no points. */
export type SkinTone = 'fair' | 'medium' | 'tan' | 'deep';

/** Q3 — hard-filters eligibility and adds a suitability bonus. */
export type SkinType = 'normal' | 'oily' | 'combination' | 'dry' | 'sensitive';

/** Q4 — what the visitor most wants to improve. Scored, never filtering. */
export type SkinConcern = 'dullness' | 'texture' | 'dryness' | 'excess-oil' | 'tired' | 'glow';

/** Q5 — how they want their skin to look and feel afterward. Scored, never filtering. */
export type DesiredResult = 'bright' | 'soft' | 'fresh' | 'clean' | 'smooth' | 'glowing';

export interface QuizAnswers {
  readonly age: AgeRange | null;
  readonly tone: SkinTone | null;
  readonly skinType: SkinType | null;
  readonly concern: SkinConcern | null;
  readonly result: DesiredResult | null;
}

export const EMPTY_ANSWERS: QuizAnswers = {
  age: null,
  tone: null,
  skinType: null,
  concern: null,
  result: null,
};

/** Steps 1–5 are questions; then the analysis animation, then the result and upsell. */
export type QuizStep = 1 | 2 | 3 | 4 | 5 | 'analysis' | 'result' | 'upsell';

/** Every visitor answers all five questions — there are no conditional branches. */
export const TOTAL_QUESTIONS = 5;

export const QUESTION_STEPS: readonly QuizStep[] = [1, 2, 3, 4, 5];

export interface QuizOption<T extends string> {
  readonly value: T;
  readonly label: string;
  /** Secondary line under the label, e.g. "burns easily, rarely tans". */
  readonly description?: string;
  /** CSS color for the skin-tone swatch. Only the tone question sets this. */
  readonly swatch?: string;
}

export interface PersistedQuizState {
  readonly step: QuizStep;
  readonly answers: QuizAnswers;
  readonly upsellShown: boolean;
}

/** A recommended product together with its composed "why we chose this" copy. */
export interface RecommendedProduct {
  readonly slug: ScoredSlug;
  readonly why: string;
}
