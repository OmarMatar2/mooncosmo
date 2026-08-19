import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type MoonButtonVariant = 'primary' | 'outline' | 'ghost' | 'quiet';

@Component({
  selector: 'moon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="classes()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
      (click)="pressed.emit()"
    >
      <ng-content />
    </button>
  `,
  host: { '[class.is-full]': 'full()' },
  styles: `
    :host {
      display: inline-flex;
      max-width: 100%;
    }
    :host(.is-full) {
      display: flex;
      width: 100%;
    }
  `,
})
export class MoonButton {
  readonly variant = input<MoonButtonVariant>('primary');
  readonly size = input<'md' | 'lg'>('md');
  readonly full = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');
  readonly ariaLabel = input('');

  readonly pressed = output<void>();

  protected readonly classes = computed(() => {
    const parts = ['moon-btn', `moon-btn--${this.variant()}`];
    if (this.size() === 'lg') {
      parts.push('moon-btn--lg');
    }
    if (this.full()) {
      parts.push('moon-btn--full');
    }
    return parts.join(' ');
  });
}
