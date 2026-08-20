import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { PersistenceService } from './persistence.service';

export const TIMER_STORAGE_KEY = 'mooncosmo-quiz-timer-v1';

/** The first allowance, granted when the visitor starts the quiz. */
export const INITIAL_ALLOWANCE_MS = 10 * 60 * 1000;
/** Every extension after that, whether automatic or asked for. */
export const EXTENSION_MS = 5 * 60 * 1000;
/** How often the remaining time is recomputed. */
const TICK_MS = 1000;

export const AUTO_EXTENSION_MESSAGE =
  "No rush — we've added 5 more minutes. Take your time.";
export const EXTENSION_PROMPT_MESSAGE = 'Still thinking it over? We can add 5 more minutes.';

/** What survives a reload. Elapsed time is derived from `startedAt`, never counted. */
interface PersistedTimerState {
  readonly startedAt: number;
  readonly allowanceMs: number;
  readonly stopped: boolean;
}

function isPersistedTimerState(value: unknown): value is PersistedTimerState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const c = value as PersistedTimerState;
  return (
    typeof c.startedAt === 'number' &&
    Number.isFinite(c.startedAt) &&
    typeof c.allowanceMs === 'number' &&
    c.allowanceMs >= INITIAL_ALLOWANCE_MS &&
    typeof c.stopped === 'boolean'
  );
}

/** Nothing is shown, a "we added 5 minutes" note is shown, or an extend prompt is. */
export type TimerPhase = 'running' | 'auto-extended' | 'awaiting-extension';

/**
 * A reassurance timer, not a deadline. It never blocks, never resets quiz progress and
 * never navigates: the first expiry silently grants 5 more minutes, and every expiry
 * after that asks whether the visitor would like 5 more. It runs from the moment the
 * quiz CTA is clicked until the products reach the cart.
 *
 * Elapsed time is always `now - startedAt`, so a reload, a backgrounded tab or a
 * throttled interval cannot make the timer drift or restart.
 */
@Injectable({ providedIn: 'root' })
export class QuizTimerService {
  private readonly persistence = inject(PersistenceService);

  private readonly _startedAt = signal<number | null>(null);
  private readonly _allowanceMs = signal(INITIAL_ALLOWANCE_MS);
  private readonly _stopped = signal(false);
  private readonly _now = signal(Date.now());

  private handle: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const stored = this.persistence.read(TIMER_STORAGE_KEY, isPersistedTimerState);
    if (stored) {
      this._startedAt.set(stored.startedAt);
      this._allowanceMs.set(stored.allowanceMs);
      this._stopped.set(stored.stopped);
      if (!stored.stopped) {
        this.startTicking();
      }
    }
    inject(DestroyRef).onDestroy(() => this.stopTicking());
  }

  readonly isRunning = computed(() => this._startedAt() !== null && !this._stopped());

  /** Milliseconds left in the current allowance. Never negative. */
  readonly remainingMs = computed(() => {
    const startedAt = this._startedAt();
    if (startedAt === null || this._stopped()) {
      return this._allowanceMs();
    }
    return Math.max(0, startedAt + this._allowanceMs() - this._now());
  });

  /** "9:58" — the display is deliberately plain, with no urgency styling. */
  readonly remainingLabel = computed(() => {
    const total = Math.ceil(this.remainingMs() / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  /**
   * How many allowances have been granted beyond the first. 0 while the initial ten
   * minutes are running; 1 after the automatic extension; and so on.
   */
  readonly extensionCount = computed(
    () => (this._allowanceMs() - INITIAL_ALLOWANCE_MS) / EXTENSION_MS,
  );

  /**
   * The first expiry extends itself and simply says so. Every later expiry waits for
   * the visitor to ask, which is what makes this reassurance rather than pressure.
   */
  readonly phase = computed<TimerPhase>(() => {
    if (!this.isRunning()) {
      return 'running';
    }
    if (this.remainingMs() > 0) {
      return this.extensionCount() > 0 ? 'auto-extended' : 'running';
    }
    return 'awaiting-extension';
  });

  /** The message under the timer, or null when there is nothing to say. */
  readonly message = computed<string | null>(() => {
    switch (this.phase()) {
      case 'auto-extended':
        return AUTO_EXTENSION_MESSAGE;
      case 'awaiting-extension':
        return EXTENSION_PROMPT_MESSAGE;
      default:
        return null;
    }
  });

  readonly canExtend = computed(() => this.phase() === 'awaiting-extension');

  /**
   * Called when the visitor clicks the quiz CTA. Starting again while already running
   * is a no-op, so returning to /quiz mid-quiz does not restart the clock.
   */
  start(): void {
    if (this._startedAt() !== null && !this._stopped()) {
      return;
    }
    this._startedAt.set(Date.now());
    this._allowanceMs.set(INITIAL_ALLOWANCE_MS);
    this._stopped.set(false);
    this._now.set(Date.now());
    this.persist();
    this.startTicking();
  }

  /** Grants another 5 minutes. Used by both the automatic and the asked-for extension. */
  extend(): void {
    if (!this.isRunning()) {
      return;
    }
    this._allowanceMs.update((ms) => ms + EXTENSION_MS);
    this.persist();
    this.tick();
  }

  /** Called once the products reach the cart. The timer stops for good. */
  stop(): void {
    if (this._startedAt() === null && this._stopped()) {
      return;
    }
    this._stopped.set(true);
    this.stopTicking();
    this.persist();
  }

  /** Clears the timer entirely — used when the quiz is retaken from scratch. */
  reset(): void {
    this.stopTicking();
    this._startedAt.set(null);
    this._allowanceMs.set(INITIAL_ALLOWANCE_MS);
    this._stopped.set(false);
    this.persistence.remove(TIMER_STORAGE_KEY);
  }

  private startTicking(): void {
    if (this.handle !== null) {
      return;
    }
    this.tick();
    this.handle = setInterval(() => this.tick(), TICK_MS);
  }

  private stopTicking(): void {
    if (this.handle !== null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }

  /**
   * The single place time advances. The first expiry auto-extends here; later ones
   * fall through and leave `phase` at 'awaiting-extension' until the visitor acts.
   */
  private tick(): void {
    this._now.set(Date.now());
    if (this.isRunning() && this.remainingMs() === 0 && this.extensionCount() === 0) {
      this.extend();
    }
  }

  private persist(): void {
    const startedAt = this._startedAt();
    if (startedAt === null) {
      return;
    }
    const state: PersistedTimerState = {
      startedAt,
      allowanceMs: this._allowanceMs(),
      stopped: this._stopped(),
    };
    this.persistence.write(TIMER_STORAGE_KEY, state);
  }
}
