import { Injectable } from '@angular/core';
import { CART_PERMALINK_BASE, CHECKOUT_REF } from '../data/shopify.config';
import { ResolvedCartLine } from '../models/cart.model';
import { hasRealVariantId } from '../models/product.model';

export type CheckoutResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string };

/**
 * Builds the Shopify cart permalink and hands the session over.
 *
 * This is the only place the app leaves for Shopify. It never fetches anything from
 * Shopify: no prices, no stock, no product data.
 */
@Injectable({ providedIn: 'root' })
export class ShopifyService {
  /**
   * https://{store}/cart/{variantId}:{qty},{variantId}:{qty}?ref=quiz-funnel
   * Returns an error instead of a URL when any line has a placeholder variant id,
   * so a broken permalink can never reach Shopify.
   */
  buildCheckoutUrl(lines: readonly ResolvedCartLine[]): CheckoutResult {
    if (lines.length === 0) {
      return { ok: false, error: 'Your cart is empty.' };
    }

    const missing = lines.filter((line) => !hasRealVariantId(line.product));
    if (missing.length > 0) {
      const names = missing.map((line) => line.product.name).join(', ');
      return {
        ok: false,
        error: `Checkout is unavailable because ${names} ${
          missing.length === 1 ? 'is' : 'are'
        } not linked to the store yet. Please remove ${
          missing.length === 1 ? 'it' : 'them'
        } or contact us to order.`,
      };
    }

    const items = lines
      .map((line) => `${line.product.variantId}:${line.quantity}`)
      .join(',');

    return { ok: true, url: `${CART_PERMALINK_BASE}/${items}?ref=${CHECKOUT_REF}` };
  }

  /** Same-tab navigation: this is a checkout handoff, not a link to elsewhere. */
  goToCheckout(url: string): void {
    window.location.assign(url);
  }
}
