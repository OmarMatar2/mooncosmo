import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { savings } from '../../models/product.model';

/**
 * The single place prices are rendered: struck-through original, sale price, and a
 * "Save $X" badge. Used in the grid, quiz result, upsell, cart and package modal so
 * pricing never drifts between surfaces.
 */
@Component({
  selector: 'price-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <p class="price" [class.price--lg]="size() === 'lg'">
      <span class="price__was" aria-hidden="true">{{ originalPrice() | currency: 'USD' }}</span>
      <span class="price__now">{{ salePrice() | currency: 'USD' }}</span>
      <span class="visually-hidden">
        Was {{ originalPrice() | currency: 'USD' }}, now {{ salePrice() | currency: 'USD' }}
      </span>
      @if (showBadge() && saved() > 0) {
        <span class="price__badge">Save {{ saved() | currency: 'USD' }}</span>
      }
    </p>
  `,
  styleUrl: './price-display.scss',
})
export class PriceDisplay {
  readonly originalPrice = input.required<number>();
  readonly salePrice = input.required<number>();
  readonly size = input<'md' | 'lg'>('md');
  readonly showBadge = input(true);

  protected readonly saved = computed(() => savings(this.originalPrice(), this.salePrice()));
}
