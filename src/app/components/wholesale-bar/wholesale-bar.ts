import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MoonModal } from '../../ui/moon-modal/moon-modal';
import { PHONE_NUMBER, PHONE_URL, WHATSAPP_URL, WHOLESALE_EMAIL, WHOLESALE_EMAIL_URL } from '../../data/contact.data';

/**
 * The only fixed element on the site, and the only navigation affordance: the brand
 * mark is the way back to / from every other route. There is no navigation menu.
 * Open/close is local view state; the contact details come from contact.data.ts.
 *
 * The bar also publishes its own rendered height to `--wholesale-bar-height` on the
 * root element. Anything anchored beneath a fixed bar has to know how tall it is, and
 * the height is not knowable from CSS: it depends on the rendered type size and on
 * env(safe-area-inset-top), which the bar absorbs through its own padding. The toast
 * host and the page shell both read the published value.
 */
@Component({
  selector: 'wholesale-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoonModal, RouterLink],
  templateUrl: './wholesale-bar.html',
  styleUrl: './wholesale-bar.scss',
})
export class WholesaleBar implements OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private observer?: ResizeObserver;

  protected readonly open = signal(false);

  protected readonly whatsappUrl = WHATSAPP_URL;
  protected readonly phoneUrl = PHONE_URL;
  protected readonly phoneNumber = PHONE_NUMBER;
  protected readonly emailUrl = WHOLESALE_EMAIL_URL;
  protected readonly email = WHOLESALE_EMAIL;

  constructor() {
    // afterNextRender never runs on the server, so the static token value is what
    // SSR and the first paint use.
    afterNextRender(() => {
      const bar = this.host.nativeElement.querySelector<HTMLElement>('.bar');
      if (bar === null) {
        return;
      }
      const publish = (): void => {
        const height = bar.getBoundingClientRect().height;
        this.document.documentElement.style.setProperty(
          '--wholesale-bar-height',
          `${Math.round(height)}px`,
        );
      };
      publish();
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(publish);
        this.observer.observe(bar);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected show(): void {
    this.open.set(true);
  }

  protected hide(): void {
    this.open.set(false);
  }
}
