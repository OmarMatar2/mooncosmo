import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AGE_OPTIONS,
  AGE_QUESTION,
  CONCERN_OPTIONS,
  CONCERN_QUESTION,
  RESULT_OPTIONS,
  RESULT_QUESTION,
  SKIN_TYPE_OPTIONS,
  SKIN_TYPE_QUESTION,
  TONE_OPTIONS,
  TONE_QUESTION,
  UPSELL_SENSITIVITY_NOTICE,
} from '../data/quiz.data';
import { getProduct } from '../data/products.data';
import { Product, ProductSlug, savings } from '../models/product.model';
import {
  AgeRange,
  DesiredResult,
  EMPTY_ANSWERS,
  PersistedQuizState,
  QuizAnswers,
  QuizOption,
  QuizStep,
  ScoredSlug,
  SkinConcern,
  SkinTone,
  SkinType,
  TOTAL_QUESTIONS,
} from '../models/quiz.model';
import {
  composeReason,
  needsSensitivityNotice,
  pickRoutineCompleter,
  recommendSlugs,
} from '../services/recommendation.engine';
import { CartService } from '../services/cart.service';
import { PersistenceService } from '../services/persistence.service';
import { QuizTimerService } from '../services/quiz-timer.service';
import { ToastService } from '../services/toast.service';

/** v2: the three-question state shape from v1 can never be restored into this quiz. */
export const QUIZ_STORAGE_KEY = 'mooncosmo-quiz-v2';

const AGE_VALUES = new Set<string>(AGE_OPTIONS.map((o) => o.value));
const TONE_VALUES = new Set<string>(TONE_OPTIONS.map((o) => o.value));
const SKIN_TYPE_VALUES = new Set<string>(SKIN_TYPE_OPTIONS.map((o) => o.value));
const CONCERN_VALUES = new Set<string>(CONCERN_OPTIONS.map((o) => o.value));
const RESULT_VALUES = new Set<string>(RESULT_OPTIONS.map((o) => o.value));
const STEP_VALUES = new Set<unknown>([1, 2, 3, 4, 5, 'analysis', 'result', 'upsell']);

function isPersistedQuizState(value: unknown): value is PersistedQuizState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as PersistedQuizState;
  if (!STEP_VALUES.has(candidate.step) || typeof candidate.upsellShown !== 'boolean') {
    return false;
  }
  const answers: unknown = candidate.answers;
  if (typeof answers !== 'object' || answers === null) {
    return false;
  }
  const a = answers as QuizAnswers;
  return (
    (a.age === null || AGE_VALUES.has(a.age)) &&
    (a.tone === null || TONE_VALUES.has(a.tone)) &&
    (a.skinType === null || SKIN_TYPE_VALUES.has(a.skinType)) &&
    (a.concern === null || CONCERN_VALUES.has(a.concern)) &&
    (a.result === null || RESULT_VALUES.has(a.result))
  );
}

export interface DisplayOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly swatch?: string;
  readonly selected: boolean;
}

/** A recommended product paired with its composed "why we chose this for you" copy. */
export interface RecommendationItem {
  readonly product: Product;
  readonly why: string;
}

/**
 * Owns every piece of quiz state. Components read its signals and call its methods;
 * they contain no quiz logic of their own.
 */
@Injectable({ providedIn: 'root' })
export class QuizViewModel {
  private readonly persistence = inject(PersistenceService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly timer = inject(QuizTimerService);

  private readonly restored = this.restore();

  private readonly _step = signal<QuizStep>(this.restored.step);
  private readonly _answers = signal<QuizAnswers>(this.restored.answers);
  private readonly _upsellShown = signal<boolean>(this.restored.upsellShown);
  /** Drives the slide direction of the question transition. */
  private readonly _direction = signal<'forward' | 'back'>('forward');

  readonly step = this._step.asReadonly();
  readonly answers = this._answers.asReadonly();
  readonly direction = this._direction.asReadonly();
  readonly upsellShown = this._upsellShown.asReadonly();

  // ---- Session timer -------------------------------------------------------
  readonly timerRunning = this.timer.isRunning;
  readonly timerLabel = this.timer.remainingLabel;
  readonly timerMessage = this.timer.message;
  readonly timerCanExtend = this.timer.canExtend;

  /** Called when the visitor arrives on the quiz. Idempotent — see QuizTimerService.start. */
  startTimer(): void {
    this.timer.start();
  }

  extendTimer(): void {
    this.timer.extend();
  }

  // ---- Derived quiz shape --------------------------------------------------
  /** Every visitor answers all five questions — the total never adapts. */
  readonly totalQuestions = TOTAL_QUESTIONS;

  readonly currentQuestionNumber = computed(() => {
    const step = this._step();
    return typeof step === 'number' ? step : TOTAL_QUESTIONS;
  });

  readonly progressLabel = computed(
    () => `Question ${this.currentQuestionNumber()} of ${TOTAL_QUESTIONS}`,
  );

  /** 0–1, used to place the crescent marker on the progress line. */
  readonly progressFraction = computed(() => {
    const step = this._step();
    if (typeof step !== 'number') {
      return 1;
    }
    const answered = this.hasAnswerForCurrentStep() ? 1 : 0;
    return Math.min(1, (step - 1 + answered) / TOTAL_QUESTIONS);
  });

  readonly isQuestionStep = computed(() => typeof this._step() === 'number');
  readonly canGoBack = computed(() => {
    const step = this._step();
    return typeof step === 'number' && step > 1;
  });

  // ---- Question content ----------------------------------------------------
  readonly questionTitle = computed(() => {
    switch (this._step()) {
      case 1:
        return AGE_QUESTION;
      case 2:
        return TONE_QUESTION;
      case 3:
        return SKIN_TYPE_QUESTION;
      case 4:
        return CONCERN_QUESTION;
      case 5:
        return RESULT_QUESTION;
      default:
        return '';
    }
  });

  readonly currentOptions = computed<readonly DisplayOption[]>(() => {
    const a = this._answers();
    switch (this._step()) {
      case 1:
        return mark(AGE_OPTIONS, a.age);
      case 2:
        return mark(TONE_OPTIONS, a.tone);
      case 3:
        return mark(SKIN_TYPE_OPTIONS, a.skinType);
      case 4:
        return mark(CONCERN_OPTIONS, a.concern);
      case 5:
        return mark(RESULT_OPTIONS, a.result);
      default:
        return [];
    }
  });

  readonly canAdvance = computed(() => this.hasAnswerForCurrentStep());

  // ---- Result --------------------------------------------------------------
  readonly recommendedSlugs = computed<readonly ScoredSlug[]>(() =>
    recommendSlugs(this._answers()),
  );

  readonly recommendedProducts = computed<readonly Product[]>(() =>
    this.recommendedSlugs().map(getProduct),
  );

  /**
   * The result cards. The "why we chose this for you" copy is composed here, in the
   * ViewModel, so the template only ever renders a finished string.
   */
  readonly recommendationItems = computed<readonly RecommendationItem[]>(() => {
    const answers = this._answers();
    return this.recommendedSlugs().map((slug) => ({
      product: getProduct(slug),
      why: composeReason(answers, slug),
    }));
  });

  readonly resultOriginalTotal = computed(() =>
    round(this.recommendedProducts().reduce((sum, p) => sum + p.originalPrice, 0)),
  );
  readonly resultSaleTotal = computed(() =>
    round(this.recommendedProducts().reduce((sum, p) => sum + p.salePrice, 0)),
  );
  readonly resultSavings = computed(() =>
    savings(this.resultOriginalTotal(), this.resultSaleTotal()),
  );

  /**
   * The routine completer is unconditional — the clay mask is excluded from the quiz,
   * so it can never already be a recommendation and there is no fallback to pick.
   */
  private readonly upsellSlug: ProductSlug = pickRoutineCompleter();

  readonly upsellProduct = computed<Product>(() => getProduct(this.upsellSlug));

  /**
   * The menthol notice, shown beneath the completer card for dry and sensitive skin
   * only. Null for every other skin type, which is what hides it.
   */
  readonly upsellNotice = computed<string | null>(() =>
    needsSensitivityNotice(this._answers().skinType) ? UPSELL_SENSITIVITY_NOTICE : null,
  );

  /** True when the persisted state could never produce a result — used by the route guard. */
  readonly hasValidState = computed(() => {
    const step = this._step();
    if (typeof step === 'number') {
      return true;
    }
    return this.recommendedSlugs().length > 0;
  });

  /**
   * Written through synchronously rather than from an effect: an effect flushes after
   * the current task, which loses the update when a click navigates away immediately.
   */
  private persist(): void {
    const state: PersistedQuizState = {
      step: this._step(),
      answers: this._answers(),
      upsellShown: this._upsellShown(),
    };
    this.persistence.write(QUIZ_STORAGE_KEY, state);
  }

  // ---- Answering -----------------------------------------------------------
  // Changing an earlier answer invalidates every later answer, so the engine always
  // recomputes from scratch — filters included, which is why tone and skin type clear
  // everything after them rather than only the scored answers.
  selectAge(age: AgeRange): void {
    this._answers.update((a) =>
      a.age === age
        ? a
        : { age, tone: null, skinType: null, concern: null, result: null },
    );
    this.persist();
  }

  selectTone(tone: SkinTone): void {
    this._answers.update((a) =>
      a.tone === tone ? a : { ...a, tone, skinType: null, concern: null, result: null },
    );
    this.persist();
  }

  selectSkinType(skinType: SkinType): void {
    this._answers.update((a) =>
      a.skinType === skinType ? a : { ...a, skinType, concern: null, result: null },
    );
    this.persist();
  }

  selectConcern(concern: SkinConcern): void {
    this._answers.update((a) => (a.concern === concern ? a : { ...a, concern, result: null }));
    this.persist();
  }

  selectResult(result: DesiredResult): void {
    this._answers.update((a) => ({ ...a, result }));
    this.persist();
  }

  /** Dispatches by current step so the view only has to hand back the raw value. */
  select(value: string): void {
    switch (this._step()) {
      case 1:
        this.selectAge(value as AgeRange);
        break;
      case 2:
        this.selectTone(value as SkinTone);
        break;
      case 3:
        this.selectSkinType(value as SkinType);
        break;
      case 4:
        this.selectConcern(value as SkinConcern);
        break;
      case 5:
        this.selectResult(value as DesiredResult);
        break;
      default:
        break;
    }
  }

  // ---- Navigation ----------------------------------------------------------
  next(): void {
    if (!this.canAdvance()) {
      return;
    }
    const step = this._step();
    if (typeof step !== 'number') {
      return;
    }
    this._direction.set('forward');
    this._step.set(step === TOTAL_QUESTIONS ? 'analysis' : ((step + 1) as QuizStep));
    this.persist();
  }

  back(): void {
    const step = this._step();
    if (typeof step !== 'number' || step === 1) {
      return;
    }
    this._direction.set('back');
    this._step.set((step - 1) as QuizStep);
    this.persist();
  }

  /** Called by the analysis screen when its animation finishes. */
  finishAnalysis(): void {
    if (this._step() === 'analysis') {
      this._direction.set('forward');
      this._step.set('result');
      this.persist();
    }
  }

  /** Result CTA: add the recommendation, then move to the upsell. */
  addResultToCart(): void {
    const slugs = this.recommendedSlugs();
    if (slugs.length === 0) {
      return;
    }
    this.cart.addMany(slugs);
    // The products have reached the cart: the reassurance timer has done its job.
    this.timer.stop();
    this.toast.show(
      slugs.length > 1 ? 'Routine added to cart' : 'Added to cart',
      'View Cart',
      '/cart',
    );

    if (!this._upsellShown()) {
      this._upsellShown.set(true);
      this._direction.set('forward');
      this._step.set('upsell');
      this.persist();
      return;
    }
    void this.router.navigate(['/cart']);
  }

  acceptUpsell(): void {
    const product = this.upsellProduct();
    this.cart.add(product.slug);
    this.toast.show(`${product.name} added to cart`, 'View Cart', '/cart');
    this.leaveUpsell();
  }

  declineUpsell(): void {
    this.leaveUpsell();
  }

  /** The upsell is a one-time step: returning to /quiz shows the result again. */
  private leaveUpsell(): void {
    this._step.set('result');
    this.persist();
    void this.router.navigate(['/cart']);
  }

  /** "Retake the quiz" — clears answers and starts over. The cart is untouched. */
  reset(): void {
    this._answers.set(EMPTY_ANSWERS);
    this._upsellShown.set(false);
    this._direction.set('forward');
    this._step.set(1);
    this.persist();
    this.timer.reset();
    this.timer.start();
  }

  /** Repairs state that cannot produce a result, e.g. hand-edited localStorage. */
  repairInvalidState(): void {
    if (!this.hasValidState()) {
      this.reset();
    }
  }

  private hasAnswerForCurrentStep(): boolean {
    const a = this._answers();
    switch (this._step()) {
      case 1:
        return a.age !== null;
      case 2:
        return a.tone !== null;
      case 3:
        return a.skinType !== null;
      case 4:
        return a.concern !== null;
      case 5:
        return a.result !== null;
      default:
        return true;
    }
  }

  private restore(): PersistedQuizState {
    const stored = this.persistence.read(QUIZ_STORAGE_KEY, isPersistedQuizState);
    if (!stored) {
      return { step: 1, answers: EMPTY_ANSWERS, upsellShown: false };
    }
    return stored;
  }
}

function mark<T extends string>(
  options: readonly QuizOption<T>[],
  selected: T | null,
): readonly DisplayOption[] {
  return options.map((o) => ({ ...o, selected: o.value === selected }));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
