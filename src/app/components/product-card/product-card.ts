import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { MoonButton } from '../../ui/moon-button/moon-button';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';

@Component({
  selector: 'product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoonButton, PriceDisplay, ProductImage],
  template: `
    <article class="card">
      <div class="card__media">
        <product-image
          [src]="product().image"
          [alt]="product().imageAlt"
          [label]="product().name"
          [eager]="eager()"
        />
      </div>

      <div class="card__body">
        <h3 class="card__name">{{ product().name }}</h3>
        <p class="card__benefit">{{ product().tagline }}</p>
        <p class="card__size">{{ product().size }}</p>

        <price-display
          [originalPrice]="product().originalPrice"
          [salePrice]="product().salePrice"
        />

        <moon-button
          class="card__cta"
          [full]="true"
          [ariaLabel]="'Add ' + product().name + ' to cart'"
          (pressed)="added.emit(product())"
        >
          Add to Cart
        </moon-button>
      </div>
    </article>
  `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly eager = input(false);
  readonly added = output<Product>();
}
