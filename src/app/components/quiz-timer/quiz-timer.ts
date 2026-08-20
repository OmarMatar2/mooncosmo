import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * A quiet reassurance timer, sat beside the progress line. Deliberately not a
 * countdown: no red, no alarm, no growth as it nears zero. It reports the time left
 * and, when the allowance runs out, offers more.
 */
@Component({
  selector: 'quiz-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qt">
      <p class="qt__clock">
        <svg class="qt__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.3" />
          <path d="M12 7.5V12l3 1.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
        <span class="qt__time">{{ label() }}</span>
        <span class="qt__hint">Take your time</span>
      </p>

      <!-- Both the automatic note and the extend prompt announce politely; neither
           steals focus, because the visitor is mid-question. -->
      <div class="qt__message" role="status" aria-live="polite">
        @if (message(); as text) {
          <span class="qt__message-text">{{ text }}</span>
          @if (canExtend()) {
            <button type="button" class="qt__extend" (click)="extended.emit()">
              Add 5 minutes
            </button>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './quiz-timer.scss',
})
export class QuizTimer {
  readonly label = input.required<string>();
  readonly message = input<string | null>(null);
  readonly canExtend = input(false);
  readonly extended = output<void>();
}
