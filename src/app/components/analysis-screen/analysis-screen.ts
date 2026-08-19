import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  output,
  signal,
} from '@angular/core';
import {
  ANALYSIS_DURATION_MS,
  ANALYSIS_DURATION_REDUCED_MS,
  ANALYSIS_MESSAGES,
} from '../../data/quiz.data';

/**
 * Brief analysis beat before the result. The bar is animated with requestAnimationFrame
 * so it fills continuously rather than jumping between steps.
 */
@Component({
  selector: 'analysis-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="an">
      <div class="an__moon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <path d="M32 4a20 20 0 1 0 12 36A24 24 0 0 1 32 4Z" fill="currentColor" />
        </svg>
      </div>

      <p class="an__message" aria-live="polite">{{ message() }}</p>

      <div
        class="an__rail"
        role="progressbar"
        aria-label="Analyzing your answers"
        [attr.aria-valuenow]="percent()"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="an__fill" [style.width.%]="percent()"></span>
      </div>
    </div>
  `,
  styleUrl: './analysis-screen.scss',
})
export class AnalysisScreen implements OnInit, OnDestroy {
  readonly finished = output<void>();

  private readonly progress = signal(0);
  private frame = 0;
  private done = false;

  protected readonly percent = computed(() => Math.round(this.progress() * 100));

  protected readonly message = computed(() => {
    const index = Math.min(
      ANALYSIS_MESSAGES.length - 1,
      Math.floor(this.progress() * ANALYSIS_MESSAGES.length),
    );
    return ANALYSIS_MESSAGES[index];
  });

  ngOnInit(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? ANALYSIS_DURATION_REDUCED_MS : ANALYSIS_DURATION_MS;
    const start = performance.now();

    const tick = (now: number): void => {
      const elapsed = now - start;
      const value = Math.min(1, elapsed / duration);
      this.progress.set(value);

      if (value < 1) {
        this.frame = requestAnimationFrame(tick);
      } else if (!this.done) {
        this.done = true;
        this.finished.emit();
      }
    };

    this.frame = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }
}
