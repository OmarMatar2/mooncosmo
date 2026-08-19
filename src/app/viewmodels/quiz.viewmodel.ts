import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  GOAL_OPTIONS,
  GOAL_QUESTION,
  RESULT_OPTIONS,
  RESULT_QUESTION,
  SKIN_TYPE_OPTIONS,
  SKIN_TYPE_QUESTION,
  UPSELL_SENSITIVITY_NOTICE,
} from '../data/quiz.data';
import { getProduct } from '../data/products.data';
import { Product, ProductSlug, savings } from '../models/product.model';
import {
  DesiredResult,
  EMPTY_ANSWERS,
  PersistedQuizState,
  QuizAnswers,
  QuizStep,
  SkinGoal,
  SkinType,
  TOTAL_QUESTIONS,
} from '../models/quiz.model';
import {
  composeReason,
  needsSensitivityNotice,
  pickUpsell,
  recommendSlugs,
} from '../services/recommendation.engine';
import { CartService } from '../services/cart.service';
import { PersistenceService } from '../services/persistence.service';
import { ToastService } from '../services/toast.service';

export const QUIZ_STORAGE_KEY = 'mooncosmo-quiz-v1';

const SKIN_TYPE_VALUES = new Set<string>(SKIN_TYPE_OPTIONS.map((o) => o.value));
const GOAL_VALUES = new Set<string>(GOAL_OPTIONS.map((o) => o.value));
const RESULT_VALUES = new Set<string>(RESULT_OPTIONS.map((o) => o.value));
const STEP_VALUES = new Set<unknown>([1, 2, 3, 'analysis', 'result', 'upsell']);

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
    (a.skinType === null || SKIN_TYPE_VALUES.has(a.skinType)) &&
    (a.goal === null || GOAL_VALUES.has(a.goal)) &&
    (a.result === null || RESULT_VALUES.has(a.result))
  );
}

export interface DisplayOption {
  readonly value: string;
  readonly label: string;
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

  // ---- Derived quiz shape --------------------------------------------------
  /** Every visitor answers all three questions — the total never adapts. */
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
        return SKIN_TYPE_QUESTION;
      case 2:
        return GOAL_QUESTION;
      case 3:
        return RESULT_QUESTION;
      default:
        return '';
    }
  });

  readonly currentOptions = computed<readonly DisplayOption[]>(() => {
    const answers = this._answers();
    switch (this._step()) {
      case 1:
        return SKIN_TYPE_OPTIONS.map((o) => ({ ...o, selected: o.value === answers.skinType }));
      case 2:
        return GOAL_OPTIONS.map((o) => ({ ...o, selected: o.value === answers.goal }));
      case 3:
        return RESULT_OPTIONS.map((o) => ({ ...o, selected: o.value === answers.result }));
      default:
        return [];
    }
  });

  readonly canAdvance = computed(() => this.hasAnswerForCurrentStep());

  // ---- Result --------------------------------------------------------------
  readonly recommendedSlugs = computed<readonly ProductSlug[]>(() =>
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

  private readonly upsellSlug = computed<ProductSlug | null>(() =>
    pickUpsell(this._answers(), this.cart.slugs()),
  );

  readonly upsellProduct = computed<Product | null>(() => {
    const slug = this.upsellSlug();
    return slug === null ? null : getProduct(slug);
  });

  /**
   * The menthol notice, shown beneath the upsell card for dry and sensitive skin only.
   * Null for every other skin type, which is what hides it.
   */
  readonly upsellNotice = computed<string | null>(() =>
    needsSensitivityNotice(this._answers().skinType, this.upsellSlug())
      ? UPSELL_SENSITIVITY_NOTICE
      : null,
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
  // Changing an earlier answer invalidates every later answer, so the engine
  // always recomputes from scratch.
  selectSkinType(skinType: SkinType): void {
    this._answers.update((a) =>
      a.skinType === skinType ? a : { ...a, skinType, goal: null, result: null },
    );
    this.persist();
  }

  selectGoal(goal: SkinGoal): void {
    this._answers.update((a) => (a.goal === goal ? a : { ...a, goal, result: null }));
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
        this.selectSkinType(value as SkinType);
        break;
      case 2:
        this.selectGoal(value as SkinGoal);
        break;
      case 3:
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
    this._direction.set('forward');
    switch (this._step()) {
      case 1:
        this._step.set(2);
        break;
      case 2:
        this._step.set(3);
        break;
      case 3:
        this._step.set('analysis');
        break;
      default:
        break;
    }
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

  /** Result CTA: add the recommendation, then move to the upsell (or straight to the cart). */
  addResultToCart(): void {
    const slugs = this.recommendedSlugs();
    if (slugs.length === 0) {
      return;
    }
    this.cart.addMany(slugs);
    this.toast.show(
      slugs.length > 1 ? 'Routine added to cart' : 'Added to cart',
      'View Cart',
      '/cart',
    );

    if (!this._upsellShown() && this.upsellProduct() !== null) {
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
    if (product !== null) {
      this.cart.add(product.slug);
      this.toast.show(`${product.name} added to cart`, 'View Cart', '/cart');
    }
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
        return a.skinType !== null;
      case 2:
        return a.goal !== null;
      case 3:
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

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
