/**
 * Shopify handoff configuration.
 * TO POINT AT A DIFFERENT STORE: change STORE_DOMAIN.
 */

// TODO: confirm this is the live storefront domain (no protocol, no trailing slash).
export const STORE_DOMAIN = 'mooncosmo.com';

/** Attribution tag appended to the cart permalink for Shopify's conversion summary. */
export const CHECKOUT_REF = 'quiz-funnel';

export const CART_PERMALINK_BASE = `https://${STORE_DOMAIN}/cart`;
