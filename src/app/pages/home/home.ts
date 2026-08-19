import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { ProductImage } from '../../ui/product-image/product-image';

/**
 * The landing page is presentation only: the hero invites the quiz and links on to
 * /shop, so there is no state to model and no ViewModel to inject.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductImage, SiteFooter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
