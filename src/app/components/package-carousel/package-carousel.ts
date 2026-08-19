import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductPackage } from '../../models/package.model';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';

/**
 * Native CSS scroll-snap carousel. No library, no drag handlers — the browser does
 * the scrolling; this class only reflects position (dots) and drives the optional
 * desktop arrows and roving keyboard focus.
 */
@Component({
  selector: 'package-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, PriceDisplay, ProductImage],
  templateUrl: './package-carousel.html',
  styleUrl: './package-carousel.scss',
})
export class PackageCarousel {
  readonly packages = input.required<readonly ProductPackage[]>();
  readonly opened = output<ProductPackage>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly activeIndex = signal(0);

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

  protected scrollBy(delta: number): void {
    this.goTo(this.activeIndex() + delta);
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

  /** Arrow keys move focus between cards, which also scrolls them into view. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    let target: number | null = null;
    if (event.key === 'ArrowRight') {
      target = index + 1;
    } else if (event.key === 'ArrowLeft') {
      target = index - 1;
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = this.cards().length - 1;
    }

    if (target === null) {
      return;
    }
    event.preventDefault();
    const cards = this.cards();
    const clamped = Math.min(cards.length - 1, Math.max(0, target));
    cards[clamped]?.focus();
    this.activeIndex.set(clamped);
  }

  private cards(): HTMLElement[] {
    return Array.from(this.track().nativeElement.querySelectorAll<HTMLElement>('.pkg'));
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
