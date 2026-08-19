import { Injectable, computed, inject, signal } from '@angular/core';
import { PACKAGES } from '../data/packages.data';
import { PRODUCTS, getProduct } from '../data/products.data';
import { ProductPackage } from '../models/package.model';
import { Product, ProductSlug } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';

export interface PackageContents {
  readonly package: ProductPackage;
  readonly items: readonly Product[];
  readonly savings: number;
}

@Injectable({ providedIn: 'root' })
export class ShopViewModel {
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly products = PRODUCTS;
  readonly packages = PACKAGES;

  private readonly _openPackageId = signal<string | null>(null);

  readonly openPackage = computed<PackageContents | null>(() => {
    const id = this._openPackageId();
    if (id === null) {
      return null;
    }
    const pkg = PACKAGES.find((p) => p.id === id);
    if (!pkg) {
      return null;
    }
    return {
      package: pkg,
      items: pkg.products.map(getProduct),
      savings: Math.round((pkg.originalPrice - pkg.salePrice) * 100) / 100,
    };
  });

  showPackage(id: string): void {
    this._openPackageId.set(id);
  }

  closePackage(): void {
    this._openPackageId.set(null);
  }

  addProduct(slug: ProductSlug): void {
    this.cart.add(slug);
    this.toast.show('Added to cart', 'View Cart', '/cart');
  }

  /** Every product in the package becomes its own cart line item. */
  addPackageToCart(pkg: ProductPackage): void {
    this.cart.addMany(pkg.products);
    this.closePackage();
    this.toast.show(`${pkg.name} added to cart`, 'View Cart', '/cart');
  }
}
