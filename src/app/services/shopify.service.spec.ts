import { describe, expect, it } from 'vitest';
import { ShopifyService } from './shopify.service';
import { PRODUCTS, getProduct } from '../data/products.data';
import { ResolvedCartLine } from '../models/cart.model';
import { ProductSlug } from '../models/product.model';

function line(slug: ProductSlug, quantity: number): ResolvedCartLine {
  const product = getProduct(slug);
  return {
    slug,
    quantity,
    product,
    lineOriginalTotal: product.originalPrice * quantity,
    lineSaleTotal: product.salePrice * quantity,
    lineSavings: (product.originalPrice - product.salePrice) * quantity,
  };
}

describe('ShopifyService.buildCheckoutUrl', () => {
  const service = new ShopifyService();

  it('builds a cart permalink with variantId:quantity pairs and the ref tag', () => {
    const result = service.buildCheckoutUrl([
      line('hibiscus-rosa-radiance-scrub', 1),
      line('turmeric-glow-scrub', 2),
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toBe(
        'https://mooncosmo.com/cart/43500755910690:1,43501244153890:2?ref=quiz-funnel',
      );
    }
  });

  it('refuses an empty cart', () => {
    const result = service.buildCheckoutUrl([]);
    expect(result.ok).toBe(false);
  });

  // Every catalogue product has a real variant id today, so the guard is exercised
  // against a synthesised line rather than a slug that would go stale on the next
  // data edit.
  it('blocks checkout rather than emitting a placeholder variant id', () => {
    const placeholder = line('minty-fresh-clay-mask', 1);
    const result = service.buildCheckoutUrl([
      {
        ...placeholder,
        product: { ...placeholder.product, variantId: 'TODO_MINTY_FRESH' },
      },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Minty Fresh Clay Mask');
    }
  });

  it('every catalogue product is linked to the store', () => {
    const result = service.buildCheckoutUrl(PRODUCTS.map((p) => line(p.slug, 1)));
    expect(result.ok).toBe(true);
  });
});
