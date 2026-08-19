import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Image with a graceful fallback: when the file is missing, a soft blush panel with
 * the product name is shown instead of a broken-image icon.
 */
@Component({
  selector: 'product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (failed()) {
      <div class="fallback" role="img" [attr.aria-label]="alt()">
        <svg class="fallback__moon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path
            d="M26 4a16 16 0 1 0 10 28A18 18 0 0 1 26 4Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
        <span class="fallback__name">{{ label() }}</span>
      </div>
    } @else {
      <img
        [src]="src()"
        [alt]="alt()"
        [width]="width()"
        [height]="height()"
        [loading]="eager() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="eager() ? 'high' : null"
        [attr.decoding]="eager() ? 'sync' : 'async'"
        (error)="failed.set(true)"
      />
    }
  `,
  styleUrl: './product-image.scss',
})
export class ProductImage {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly label = input('');
  readonly width = input(800);
  readonly height = input(800);
  /** Above-the-fold images opt out of lazy loading. */
  readonly eager = input(false);

  protected readonly failed = signal(false);
}
