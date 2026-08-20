import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PackageCarousel } from '../../components/package-carousel/package-carousel';
import { PackageModal } from '../../components/package-modal/package-modal';
import { ProductCard } from '../../components/product-card/product-card';
import { ReviewsCarousel } from '../../components/reviews-carousel/reviews-carousel';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { WholesaleSection } from '../../components/wholesale-section/wholesale-section';
import { REVIEWS, REVIEWS_HEADING } from '../../data/reviews.data';
import { ProductImage } from '../../ui/product-image/product-image';
import { ShopViewModel } from '../../viewmodels/shop.viewmodel';

/**
 * The landing page carries the whole catalogue: hero, product grid, packages, reviews
 * and the wholesale pitch. Product and package state lives in ShopViewModel; the only
 * data the page owns outright is the static review list, which the template uses to
 * decide whether the reviews section renders at all.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ProductImage,
    ProductCard,
    PackageCarousel,
    PackageModal,
    ReviewsCarousel,
    WholesaleSection,
    SiteFooter,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly vm = inject(ShopViewModel);

  /** Static data — the template hides the whole section when this is empty. */
  protected readonly reviews = REVIEWS;
  protected readonly reviewsHeading = REVIEWS_HEADING;
}
