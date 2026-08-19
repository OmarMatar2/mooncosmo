import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PackageCarousel } from '../../components/package-carousel/package-carousel';
import { PackageModal } from '../../components/package-modal/package-modal';
import { ProductCard } from '../../components/product-card/product-card';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { ShopViewModel } from '../../viewmodels/shop.viewmodel';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PackageCarousel, PackageModal, ProductCard, SiteFooter],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {
  protected readonly vm = inject(ShopViewModel);
}
