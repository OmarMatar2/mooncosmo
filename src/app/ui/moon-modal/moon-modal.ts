import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

/**
 * WebKit does not focus a <button> when it is clicked, so document.activeElement is
 * often <body> at the moment a dialog opens and there is nothing to restore focus to
 * on close. Recording the last pointer-activated control gives every modal a reliable
 * trigger to return to, in every engine.
 */
let lastPointerTrigger: HTMLElement | null = null;
if (typeof document !== 'undefined') {
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      lastPointerTrigger =
        target instanceof Element
          ? target.closest<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
          : null;
    },
    true,
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog shell: focus trap, ESC to close, click-outside to close, and
 * focus returned to whatever was focused when it opened.
 *
 * Rendered only while open (the caller uses @if), so opening is a fresh instance.
 */
@Component({
  selector: 'moon-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moon-modal.html',
  styleUrl: './moon-modal.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class MoonModal implements OnDestroy {
  readonly titleText = input.required<string>();
  readonly labelledBy = input('moon-modal-title');
  readonly closed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly trigger = MoonModal.resolveTrigger();
  private readonly previousBodyOverflow = document.body.style.overflow;

  constructor() {
    document.body.style.overflow = 'hidden';
    afterNextRender(() => this.focusFirst());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
    this.trigger?.focus?.();
  }

  private static resolveTrigger(): HTMLElement | null {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      return active;
    }
    return lastPointerTrigger;
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    this.closed.emit();
  }

  /** Click on the scrim — but not on the panel — closes. */
  protected onScrimPointer(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  /**
   * Tab is handled entirely here rather than only at the boundaries: WebKit skips
   * links when tabbing by default, which would otherwise walk focus straight out of
   * the dialog. Moving focus ourselves keeps the trap identical in every engine.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    event.preventDefault();

    const items = this.focusable();
    if (items.length === 0) {
      return;
    }

    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = event.shiftKey ? -1 : 1;
    const next = current === -1 ? 0 : (current + step + items.length) % items.length;
    items[next].focus();
  }

  protected close(): void {
    this.closed.emit();
  }

  private focusable(): HTMLElement[] {
    return Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
  }

  private focusFirst(): void {
    const items = this.focusable();
    if (items.length > 0) {
      items[0].focus();
    } else {
      this.host.nativeElement.querySelector<HTMLElement>('[tabindex]')?.focus();
    }
  }
}
