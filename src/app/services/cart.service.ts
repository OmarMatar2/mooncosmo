import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CartLine,
  CartTotals,
  MAX_QUANTITY,
  MIN_QUANTITY,
  ResolvedCartLine,
} from '../models/cart.model';
import { ProductSlug, savings } from '../models/product.model';
import { findProduct, getProduct } from '../data/products.data';
import { PersistenceService } from './persistence.service';

const CART_STORAGE_KEY = 'mooncosmo-cart-v1';

function isCartLineArray(value: unknown): value is CartLine[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartLine).slug === 'string' &&
        typeof (item as CartLine).quantity === 'number' &&
        findProduct((item as CartLine).slug) !== undefined,
    )
  );
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity)));
}

/**
 * ViewModel-layer state for the cart. Owns the only mutable cart state in the app and
 * mirrors it to localStorage on every change.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly persistence = inject(PersistenceService);

  private readonly _lines = signal<readonly CartLine[]>(this.restore());
  readonly lines = this._lines.asReadonly();

  readonly resolvedLines = computed<readonly ResolvedCartLine[]>(() =>
    this._lines().map((line) => {
      const product = getProduct(line.slug);
      const lineOriginalTotal = round(product.originalPrice * line.quantity);
      const lineSaleTotal = round(product.salePrice * line.quantity);
      return {
        slug: line.slug,
        quantity: line.quantity,
        product,
        lineOriginalTotal,
        lineSaleTotal,
        lineSavings: round(lineOriginalTotal - lineSaleTotal),
      };
    }),
  );

  readonly totals = computed<CartTotals>(() => {
    const lines = this.resolvedLines();
    const originalSubtotal = round(lines.reduce((sum, l) => sum + l.lineOriginalTotal, 0));
    const saleSubtotal = round(lines.reduce((sum, l) => sum + l.lineSaleTotal, 0));
    return {
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      originalSubtotal,
      saleSubtotal,
      totalSavings: savings(originalSubtotal, saleSubtotal),
    };
  });

  readonly itemCount = computed(() => this.totals().itemCount);
  readonly isEmpty = computed(() => this._lines().length === 0);
  readonly slugs = computed<readonly ProductSlug[]>(() => this._lines().map((l) => l.slug));

  /**
   * Writes through synchronously on every mutation. An effect would flush after the
   * current task, which loses the change if the visitor navigates away immediately
   * after clicking "Add to Cart".
   */
  private commit(next: (lines: readonly CartLine[]) => readonly CartLine[]): void {
    this._lines.update(next);
    this.persistence.write(CART_STORAGE_KEY, this._lines());
  }

  contains(slug: ProductSlug): boolean {
    return this._lines().some((line) => line.slug === slug);
  }

  /** Adding a product already in the cart increments its quantity instead of duplicating. */
  add(slug: ProductSlug, quantity = 1): void {
    this.commit((lines) => {
      const existing = lines.find((line) => line.slug === slug);
      if (!existing) {
        return [...lines, { slug, quantity: clampQuantity(quantity) }];
      }
      return lines.map((line) =>
        line.slug === slug
          ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
          : line,
      );
    });
  }

  addMany(slugs: readonly ProductSlug[]): void {
    for (const slug of slugs) {
      this.add(slug);
    }
  }

  setQuantity(slug: ProductSlug, quantity: number): void {
    this.commit((lines) =>
      lines.map((line) =>
        line.slug === slug ? { ...line, quantity: clampQuantity(quantity) } : line,
      ),
    );
  }

  remove(slug: ProductSlug): void {
    this.commit((lines) => lines.filter((line) => line.slug !== slug));
  }

  clear(): void {
    this.commit(() => []);
  }

  private restore(): readonly CartLine[] {
    const stored = this.persistence.read(CART_STORAGE_KEY, isCartLineArray);
    if (!stored) {
      return [];
    }
    // Collapse any duplicates and clamp quantities that were tampered with.
    const merged = new Map<ProductSlug, number>();
    for (const line of stored) {
      const slug = line.slug;
      merged.set(slug, clampQuantity((merged.get(slug) ?? 0) + line.quantity));
    }
    return [...merged].map(([slug, quantity]) => ({ slug, quantity }));
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
