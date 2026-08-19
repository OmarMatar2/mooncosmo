import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { MoonButton } from '../../ui/moon-button/moon-button';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';

/**
 * Shown immediately after the quiz result is added to the cart and before the cart
 * review — never after the Shopify handoff, where the session is no longer ours.
 */
@Component({
  selector: 'upsell-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoonButton, PriceDisplay, ProductImage],
  templateUrl: './upsell-view.html',
  styleUrl: './upsell-view.scss',
})
export class UpsellView {
  readonly product = input.required<Product>();
  /**
   * Sensitivity notice rendered under the card. Null for skin types that do not need
   * it — the ViewModel decides, so the template has nothing to reason about.
   */
  readonly notice = input<string | null>(null);
  readonly accepted = output<void>();
  readonly declined = output<void>();
}
