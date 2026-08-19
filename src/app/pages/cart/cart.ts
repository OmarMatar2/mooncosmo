import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartLineItem } from '../../components/cart-line-item/cart-line-item';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { MoonButton } from '../../ui/moon-button/moon-button';
import { CartViewModel } from '../../viewmodels/cart.viewmodel';

/**
 * Review only. There is no checkout form here — no address fields, no card fields.
 * Shopify collects all of that after the handoff.
 */
@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, CartLineItem, MoonButton, SiteFooter],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  protected readonly vm = inject(CartViewModel);
}
