import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { DisplayOption } from '../../viewmodels/quiz.viewmodel';
import { MoonButton } from '../../ui/moon-button/moon-button';

/**
 * One question per screen. Options are real buttons in a radiogroup so the whole quiz
 * is operable from the keyboard.
 */
@Component({
  selector: 'quiz-question',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoonButton],
  templateUrl: './quiz-question.html',
  styleUrl: './quiz-question.scss',
  host: {
    '[class.is-back]': "direction() === 'back'",
    // A CSS animation only restarts when its animation-name changes, so alternate
    // between two identical keyframe sets as the question changes. This re-triggers
    // the slide without destroying and recreating the view.
    '[class.is-alt]': 'isAlt()',
  },
})
export class QuizQuestion {
  readonly titleText = input.required<string>();
  readonly options = input.required<readonly DisplayOption[]>();
  readonly canAdvance = input(false);
  readonly canGoBack = input(false);
  readonly direction = input<'forward' | 'back'>('forward');
  /** Changes whenever the question changes; re-triggers the slide animation. */
  readonly animationKey = input<string | number>('');

  readonly selected = output<string>();
  readonly next = output<void>();
  readonly back = output<void>();

  private readonly group = viewChild.required<ElementRef<HTMLElement>>('group');
  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');
  private seenFirstQuestion = false;

  protected readonly isAlt = computed(() => {
    const key = this.animationKey();
    return (typeof key === 'number' ? key : key.length) % 2 === 1;
  });

  /** Roving tabindex: the selected option, else the first, is the single tab stop. */
  protected readonly focusIndex = computed(() => {
    const index = this.options().findIndex((o) => o.selected);
    return index === -1 ? 0 : index;
  });

  constructor() {
    // Moving between questions replaces the content in place, so focus has to be
    // moved deliberately: screen readers announce the new question and keyboard
    // users continue from the top of it rather than from a stale button.
    afterRenderEffect(() => {
      this.animationKey();
      untracked(() => {
        if (this.seenFirstQuestion) {
          this.title().nativeElement.focus();
        }
        this.seenFirstQuestion = true;
      });
    });
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    const last = options.length - 1;
    let target: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = index === 0 ? last : index - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selected.emit(options[target].value);
    this.buttons()[target]?.focus();
  }

  private buttons(): HTMLElement[] {
    return Array.from(this.group().nativeElement.querySelectorAll<HTMLElement>('.option'));
  }
}
