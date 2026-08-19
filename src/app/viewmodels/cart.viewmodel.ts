import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductSlug } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ShopifyService } from '../services/shopify.service';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class CartViewModel {
  private readonly cart = inject(CartService);
  private readonly shopify = inject(ShopifyService);
  private readonly toast = inject(ToastService);

  readonly lines = this.cart.resolvedLines;
  readonly totals = this.cart.totals;
  readonly isEmpty = this.cart.isEmpty;

  private readonly _checkoutError = signal<string | null>(null);
  readonly checkoutError = this._checkoutError.asReadonly();

  readonly canCheckout = computed(() => !this.isEmpty());

  setQuantity(slug: ProductSlug, quantity: number): void {
    this.cart.setQuantity(slug, quantity);
    this._checkoutError.set(null);
  }

  remove(slug: ProductSlug): void {
    this.cart.remove(slug);
    this._checkoutError.set(null);
    this.toast.show('Removed from cart');
  }

  clear(): void {
    this.cart.clear();
    this._checkoutError.set(null);
  }

  /** Builds the permalink and leaves for Shopify. Blocks on a bad variant id. */
  checkout(): void {
    const result = this.shopify.buildCheckoutUrl(this.lines());
    if (!result.ok) {
      this._checkoutError.set(result.error);
      return;
    }
    this._checkoutError.set(null);
    this.shopify.goToCheckout(result.url);
  }
}
