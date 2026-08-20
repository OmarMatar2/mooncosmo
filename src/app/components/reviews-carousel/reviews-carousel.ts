import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { findProduct } from '../../data/products.data';
import { Review, starStates } from '../../models/review.model';

interface DisplayReview {
  readonly review: Review;
  readonly productName: string;
  readonly stars: readonly boolean[];
  readonly ratingLabel: string;
}

/**
 * Reviews across the whole range, in one list — deliberately not grouped by product,
 * so the section reads as "what customers say about MoonCosmo" rather than as six
 * separate product widgets. Each card names the product it refers to instead.
 *
 * Scroll-snap on mobile, grid from md up: the same native, library-free approach as
 * the packages carousel.
 */
@Component({
  selector: 'reviews-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews-carousel.html',
  styleUrl: './reviews-carousel.scss',
})
export class ReviewsCarousel {
  readonly reviews = input.required<readonly Review[]>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly activeIndex = signal(0);

  /** Resolves each review's product name once, so the template stays declarative. */
  protected readonly items = computed<readonly DisplayReview[]>(() =>
    this.reviews().map((review) => ({
      review,
      productName: findProduct(review.productSlug)?.name ?? '',
      stars: starStates(review.rating),
      ratingLabel: `${review.rating} out of 5 stars`,
    })),
  );

  /** Scroll position is the source of truth for the dot indicators. */
  protected onScroll(): void {
    const el = this.track().nativeElement;
    const cards = this.cards();
    if (cards.length === 0) {
      return;
    }
    const left = el.scrollLeft;
    let nearest = 0;
    let smallest = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - el.offsetLeft - left);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    this.activeIndex.set(nearest);
  }

  protected goTo(index: number): void {
    const cards = this.cards();
    const clamped = Math.min(cards.length - 1, Math.max(0, index));
    cards[clamped]?.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    this.activeIndex.set(clamped);
  }

  private cards(): HTMLElement[] {
    return Array.from(this.track().nativeElement.querySelectorAll<HTMLElement>('.review'));
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
