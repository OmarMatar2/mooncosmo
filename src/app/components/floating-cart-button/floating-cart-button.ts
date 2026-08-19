import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { CartService } from '../../services/cart.service';

/**
 * Visible on every page once the cart has something in it — except on the cart page
 * itself, where it is redundant and would sit on top of the Checkout button.
 */
@Component({
  selector: 'floating-cart-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (visible()) {
      <a class="fab" routerLink="/cart" [attr.aria-label]="label()">
        <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6 7h12l-1 12H7L6 7Zm3 0a3 3 0 0 1 6 0"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="fab__badge" aria-hidden="true">{{ count() }}</span>
      </a>
    }
  `,
  styleUrl: './floating-cart-button.scss',
})
export class FloatingCartButton {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  private readonly onCartPage = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/cart')),
    ),
    { initialValue: this.router.url.startsWith('/cart') },
  );

  protected readonly count = this.cart.itemCount;
  protected readonly visible = computed(() => this.count() > 0 && !this.onCartPage());
  protected readonly label = computed(() => {
    const n = this.count();
    return `View cart, ${n} ${n === 1 ? 'item' : 'items'}`;
  });
}
