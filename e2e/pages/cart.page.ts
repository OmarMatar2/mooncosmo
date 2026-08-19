import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly checkoutButton: Locator;
  readonly lineItems: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.lineItems = page.locator('cart-line-item');
    this.error = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  /**
   * Clicks Checkout and returns the Shopify URL the app navigated to. The request is
   * aborted at the network layer, so Shopify is never actually loaded.
   */
  async captureCheckoutUrl(): Promise<string> {
    await this.page.route('https://mooncosmo.com/**', (route) => route.abort());
    const request = this.page.waitForRequest((req) =>
      req.url().startsWith('https://mooncosmo.com/cart/'),
    );
    await this.checkoutButton.click();
    return (await request).url();
  }
}
