import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BRAND_BLURB,
  FREE_SHIPPING_NOTE,
  POLICY_LINKS,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
} from '../../data/contact.data';

@Component({
  selector: 'site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly blurb = BRAND_BLURB;
  protected readonly email = SUPPORT_EMAIL;
  protected readonly socials = SOCIAL_LINKS;
  protected readonly policies = POLICY_LINKS;
  protected readonly shippingNote = FREE_SHIPPING_NOTE;
  protected readonly year = new Date().getFullYear();
}
