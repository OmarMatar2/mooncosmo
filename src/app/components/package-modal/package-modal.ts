import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PackageContents } from '../../viewmodels/shop.viewmodel';
import { MoonButton } from '../../ui/moon-button/moon-button';
import { MoonModal } from '../../ui/moon-modal/moon-modal';
import { PriceDisplay } from '../../ui/price-display/price-display';
import { ProductImage } from '../../ui/product-image/product-image';

@Component({
  selector: 'package-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, MoonButton, MoonModal, PriceDisplay, ProductImage],
  templateUrl: './package-modal.html',
  styleUrl: './package-modal.scss',
})
export class PackageModal {
  readonly contents = input.required<PackageContents>();
  readonly closed = output<void>();
  readonly addRequested = output<void>();
}
