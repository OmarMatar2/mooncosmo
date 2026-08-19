import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ResolvedCartLine } from '../../models/cart.model';
import { ProductSlug } from '../../models/product.model';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';
import { QuantityStepper } from '../../ui/quantity-stepper/quantity-stepper';

@Component({
  selector: 'cart-line-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PriceDisplay, ProductImage, QuantityStepper],
  template: `
    <div class="line">
      <div class="line__media">
        <product-image
          [src]="line().product.image"
          [alt]="line().product.imageAlt"
          [label]="line().product.name"
          [width]="160"
          [height]="160"
        />
      </div>

      <div class="line__body">
        <h3 class="line__name">{{ line().product.name }}</h3>
        <p class="line__size">{{ line().product.size }}</p>

        <div class="line__controls">
          <quantity-stepper
            [quantity]="line().quantity"
            [label]="line().product.name"
            (changed)="quantityChanged.emit($event)"
          />
          <button
            type="button"
            class="line__remove"
            [attr.aria-label]="'Remove ' + line().product.name + ' from cart'"
            (click)="removed.emit(line().slug)"
          >
            Remove
          </button>
        </div>
      </div>

      <div class="line__price">
        <price-display
          [originalPrice]="line().lineOriginalTotal"
          [salePrice]="line().lineSaleTotal"
          [showBadge]="false"
        />
      </div>
    </div>
  `,
  styleUrl: './cart-line-item.scss',
})
export class CartLineItem {
  readonly line = input.required<ResolvedCartLine>();
  readonly quantityChanged = output<number>();
  readonly removed = output<ProductSlug>();
}
