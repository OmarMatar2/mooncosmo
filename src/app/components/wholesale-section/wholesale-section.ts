import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MoonModal } from '../../ui/moon-modal/moon-modal';
import {
  // PHONE_NUMBER,
  // PHONE_URL,
  // WHATSAPP_URL,
  WHOLESALE_EMAIL,
  WHOLESALE_EMAIL_URL,
} from '../../data/contact.data';

/**
 * The wholesale pitch, sat at the foot of the landing page above the footer. It used
 * to be a button in the fixed header; the dialog and its three contact routes moved
 * here wholesale rather than being copied, so this is still the only place in the app
 * that markup exists. The generic `moon-modal` supplies the dialog behaviour — focus
 * trap, Escape, restore — and is not reimplemented here.
 *
 * Open/close is local view state, so there is no ViewModel: nothing outside this
 * component needs to know whether the dialog is showing. The contact details all come
 * from contact.data.ts.
 */
@Component({
  selector: 'wholesale-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoonModal],
  templateUrl: './wholesale-section.html',
  styleUrl: './wholesale-section.scss',
})
export class WholesaleSection {
  protected readonly open = signal(false);

  // protected readonly whatsappUrl = WHATSAPP_URL;
  // protected readonly phoneUrl = PHONE_URL;
  // protected readonly phoneNumber = PHONE_NUMBER;
  protected readonly emailUrl = WHOLESALE_EMAIL_URL;
  protected readonly email = WHOLESALE_EMAIL;

  protected show(): void {
    this.open.set(true);
  }

  protected hide(): void {
    this.open.set(false);
  }
}
