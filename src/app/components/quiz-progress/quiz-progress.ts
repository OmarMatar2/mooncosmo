import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The signature flourish: a thin olive line that fills across the top with a crescent
 * moon marker sliding along it. Everything else on the quiz stays calm.
 */
@Component({
  selector: 'quiz-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qp">
      <div
        class="qp__rail"
        role="progressbar"
        [attr.aria-valuenow]="percent()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="label()"
      >
        <span class="qp__fill" [style.width.%]="percent()"></span>
        <span class="qp__moon" [style.left.%]="percent()">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M16 2a10 10 0 1 0 6 18A12 12 0 0 1 16 2Z" fill="currentColor" />
          </svg>
        </span>
      </div>
      <p class="qp__label">{{ label() }}</p>
    </div>
  `,
  styleUrl: './quiz-progress.scss',
})
export class QuizProgress {
  /** 0–1. */
  readonly fraction = input.required<number>();
  readonly label = input.required<string>();

  protected readonly percent = computed(() =>
    Math.round(Math.min(1, Math.max(0, this.fraction())) * 100),
  );
}
