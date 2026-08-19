import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { COSMETIC_DISCLAIMER } from '../../data/products.data';
import { MoonButton } from '../../ui/moon-button/moon-button';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';
import { RecommendationItem } from '../../viewmodels/quiz.viewmodel';

@Component({
  selector: 'result-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, MoonButton, PriceDisplay, ProductImage],
  templateUrl: './result-view.html',
  styleUrl: './result-view.scss',
})
export class ResultView {
  /** Each item carries its product and the already-composed "why we chose this" copy. */
  readonly items = input.required<readonly RecommendationItem[]>();
  readonly originalTotal = input.required<number>();
  readonly saleTotal = input.required<number>();
  readonly totalSavings = input.required<number>();

  readonly addRequested = output<void>();
  readonly retakeRequested = output<void>();

  protected readonly disclaimer = COSMETIC_DISCLAIMER;
  protected readonly isRoutine = computed(() => this.items().length > 1);
  protected readonly ctaLabel = computed(() =>
    this.isRoutine() ? 'Add Routine to Cart' : 'Add to Cart',
  );
}
