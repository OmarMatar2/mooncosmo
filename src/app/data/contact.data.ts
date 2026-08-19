/**
 * All outbound contact details live here.
 * TO SET THE PHONE / WHATSAPP / EMAIL: edit the four constants below.
 */

/** International format, digits only, no `+` — this is what wa.me expects. */
// TODO: replace with the real WhatsApp business number (digits only, e.g. 15551234567).
export const WHATSAPP_NUMBER = '10000000000';

/** Dialable number including the leading `+`. */
// TODO: replace with the real phone number.
export const PHONE_NUMBER = '+10000000000';

// TODO: replace with the real wholesale inbox.
export const WHOLESALE_EMAIL = 'support@mooncosmo.com';

// TODO: replace with the real customer support inbox.
export const SUPPORT_EMAIL = 'support@mooncosmo.com';

export const WHOLESALE_MESSAGE =
  "Hello MoonCosmo, I'd like to know more about wholesale pricing for my store.";
export const WHOLESALE_SUBJECT = 'Wholesale inquiry';

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHOLESALE_MESSAGE,
)}`;
export const PHONE_URL = `tel:${PHONE_NUMBER}`;
export const WHOLESALE_EMAIL_URL = `mailto:${WHOLESALE_EMAIL}?subject=${encodeURIComponent(
  WHOLESALE_SUBJECT,
)}`;

export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

// TODO: replace with the real social profile URLs.
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Facebook', url: 'https://web.facebook.com/profile.php?id=61560698184581&_rdc=1&_rdr' },
  { label: 'Instagram', url: 'https://www.instagram.com/mooncosmoshop?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==' },
  // { label: 'TikTok', url: 'https://tiktok.com/@mooncosmo' },
];

export interface PolicyLink {
  readonly label: string;
  readonly url: string;
}

/** Policy pages live on the Shopify store, not in this app. */
// TODO: confirm these Shopify policy page URLs match the live store.
export const POLICY_LINKS: readonly PolicyLink[] = [
  { label: 'Shipping Policy', url: 'https://mooncosmo.com/policies/shipping-policy' },
  { label: 'Refund Policy', url: 'https://mooncosmo.com/policies/refund-policy' },
  { label: 'Privacy Policy', url: 'https://mooncosmo.com/policies/privacy-policy' },
  { label: 'Terms of Service', url: 'https://mooncosmo.com/policies/terms-of-service' },
];

export const BRAND_BLURB =
  'Naturally derived face and body care, made in small batches. Gentle formulas, honest ingredients, and results your skin can feel.';

export const FREE_SHIPPING_NOTE = 'Free shipping on all orders.';
