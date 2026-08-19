import { expect, test } from '@playwright/test';
import { CartPage } from './pages/cart.page';

test.describe('Shopping without the quiz', () => {
  test('add a package from the carousel, then check out', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/shop');

    await page.getByRole('button', { name: 'View The Glow Duo package details' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Hibiscus Rosa Radiance Scrub')).toBeVisible();
    await expect(dialog.getByText('Turmeric Glow Scrub')).toBeVisible();

    await dialog.getByRole('button', { name: 'Add Package to Cart' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('The Glow Duo added to cart')).toBeVisible();

    // Every product in the package becomes its own line item.
    await cart.goto();
    await expect(cart.lineItems).toHaveCount(2);

    const url = await cart.captureCheckoutUrl();
    expect(url).toBe(
      'https://mooncosmo.com/cart/43500755910690:1,43501244153890:1?ref=quiz-funnel',
    );
  });

  test('adding the same product twice increments quantity', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/shop');

    const add = page.getByRole('button', { name: 'Add Apricot Glow Scrub to cart' });
    await add.click();
    await add.click();

    await cart.goto();
    await expect(cart.lineItems).toHaveCount(1);
    await expect(page.getByLabel('Quantity of Apricot Glow Scrub', { exact: true })).toHaveText('2');
  });

  test('every product in the grid reaches a valid permalink', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/shop');

    await page.getByRole('button', { name: 'Add Minty Fresh Clay Mask to cart' }).click();
    await cart.goto();

    const url = await cart.captureCheckoutUrl();
    expect(url).toBe('https://mooncosmo.com/cart/43501304741922:1?ref=quiz-funnel');
    await expect(cart.error).toBeHidden();
  });

  test('the cart empty state offers the quiz and the product grid', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();

    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Take the Quiz' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Products' })).toBeVisible();
  });

  test('quantity stepper and remove update the totals', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/shop');
    await page.getByRole('button', { name: 'Add Golden Radiance Scrub to cart' }).click();

    await cart.goto();
    await page.getByRole('button', { name: 'Increase quantity of Golden Radiance Scrub' }).click();
    await expect(page.getByLabel('Quantity of Golden Radiance Scrub', { exact: true })).toHaveText('2');
    await expect(page.getByLabel('Order summary').getByText('$59.98')).toBeVisible();

    await page.getByRole('button', { name: 'Remove Golden Radiance Scrub from cart' }).click();
    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible();
  });

  test('the floating cart button appears once the cart is non-empty', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('link', { name: /View cart/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Add Turmeric Glow Scrub to cart' }).click();
    await expect(page.getByRole('link', { name: 'View cart, 1 item' })).toBeVisible();
  });
});

test.describe('Home ↔ shop navigation', () => {
  test('the hero secondary link reaches /shop and the brand mark comes back', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Discover What Your Skin Needs' })).toBeVisible();

    await page.getByRole('link', { name: 'Browse all products' }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByRole('heading', { name: 'All Products', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Packages Worth Sharing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Not Sure What To Choose?' })).toBeVisible();

    // The brand mark is the only navigation affordance back to the landing page.
    await page.getByRole('link', { name: 'MoonCosmo home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the shop quiz call to action sends visitors straight to the quiz', async ({ page }) => {
    await page.goto('/shop');
    await page.getByRole('link', { name: 'Find Your Match' }).click();
    await expect(page).toHaveURL(/\/quiz$/);
  });

  test('back from /shop restores the scroll position on /', async ({ page }) => {
    // A phone viewport: the landing page is short, and on a desktop window there is
    // nothing to scroll and so nothing to restore.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('heading', { name: 'How We Help' }).scrollIntoViewIfNeeded();
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(0);

    await page.getByRole('link', { name: 'Browse all products' }).click();
    await expect(page).toHaveURL(/\/shop$/);
    // Forward navigation starts at the top.
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(50);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrolled - 50);
  });
});

test.describe('Wholesale modal', () => {
  test('opens, traps focus, and closes on Escape', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: 'Wholesale Inquiries' });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Focus starts inside the dialog and stays inside while tabbing round.
    await expect(dialog.locator(':focus')).toHaveCount(1);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // Focus returns to the trigger.
    await expect(trigger).toBeFocused();
  });

  test('offers WhatsApp, call and email actions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Wholesale Inquiries' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/\d+\?text=/,
    );
    await expect(dialog.getByRole('link', { name: /^Call/ })).toHaveAttribute('href', /^tel:/);
    await expect(dialog.getByRole('link', { name: 'Email Us' })).toHaveAttribute(
      'href',
      /^mailto:.+\?subject=/,
    );
  });
});
