import { expect, test, type Page } from '@playwright/test';
import { VIEWPORTS } from '../playwright.config';

const ROUTES = ['/', '/shop', '/quiz', '/cart'] as const;

/**
 * Two-part check, because `scrollWidth` alone lies here: the packages carousel is a
 * horizontal scroller, and its off-screen cards inflate the ancestor scrollWidth even
 * though they are clipped and unreachable.
 *
 *  1. the page must not actually scroll sideways, and
 *  2. no element outside a horizontal scroller may extend past the viewport — which is
 *     what `overflow-x: hidden` on body would otherwise quietly mask.
 */
async function hasHorizontalOverflow(page: Page): Promise<string | false> {
  return page.evaluate(() => {
    // `behavior: 'instant'` is load-bearing: the reset sets `scroll-behavior: smooth`
    // on html, so a default scrollTo animates and window.scrollX still reads 0 on the
    // next line — the check silently passed however far the page could actually pan.
    window.scrollTo({ left: 400, top: window.scrollY, behavior: 'instant' });
    const scrolled = window.scrollX;
    window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' });
    if (scrolled > 0) {
      return `page scrolled horizontally to ${scrolled}px`;
    }

    const width = document.documentElement.clientWidth;
    const isScroller = (el: Element): boolean => {
      const overflowX = getComputedStyle(el).overflowX;
      return overflowX === 'auto' || overflowX === 'scroll';
    };

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      let ancestor: Element | null = el.parentElement;
      let inScroller = false;
      while (ancestor && ancestor !== document.body) {
        if (isScroller(ancestor)) {
          inScroller = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (inScroller) {
        continue;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && (rect.right > width + 1 || rect.left < -1)) {
        return `${el.tagName.toLowerCase()}.${el.className} spans ${Math.round(
          rect.left,
        )}–${Math.round(rect.right)} in a ${width}px viewport`;
      }
    }
    return false;
  });
}

/**
 * The overlay guard: a decorative layer sitting on top of a control is the classic
 * failure in this layout, and it is invisible to a normal click assertion because
 * Playwright scrolls and force-clicks. elementFromPoint asks the browser what is
 * actually on top at that pixel.
 */
async function isTopmostAtCentre(page: Page, selector: string, index: number): Promise<boolean> {
  // Centre the element first: an element partly below the fold is off-screen, not
  // covered, and elementFromPoint cannot tell the difference.
  await page.evaluate(
    ({ selector, index }) => {
      document.querySelectorAll(selector)[index]?.scrollIntoView({
        block: 'center',
        behavior: 'instant' as ScrollBehavior,
      });
    },
    { selector, index },
  );

  return page.evaluate(
    ({ selector, index }) => {
      const el = document.querySelectorAll(selector)[index];
      if (!(el instanceof HTMLElement)) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return hit === el || el.contains(hit);
    },
    { selector, index },
  );
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`viewport: ${name} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport });

    test('no horizontal overflow on any route', async ({ page }) => {
      for (const route of ROUTES) {
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();
        expect(await hasHorizontalOverflow(page), `overflow on ${route}`).toBe(false);
      }
    });

    test('every quiz option is actually clickable', async ({ page }) => {
      await page.goto('/quiz');
      const options = page.getByRole('radio');
      const count = await options.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        expect(
          await isTopmostAtCentre(page, '[role="radio"]', i),
          `option ${i} is covered by another element`,
        ).toBe(true);
      }

      // And the real click works end to end.
      await options.first().click();
      await expect(options.first()).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    test('the primary quiz button is reachable without scrolling past it', async ({ page }) => {
      await page.goto('/quiz');
      await page.getByRole('radio').first().click();

      const next = page.getByRole('button', { name: 'Next' });
      await expect(next).toBeInViewport();
    });

    test('the wholesale bar stays visible and its button clickable', async ({ page }) => {
      await page.goto('/');
      const trigger = page.getByRole('button', { name: 'Wholesale Inquiries' });
      await expect(trigger).toBeInViewport();

      await page.mouse.wheel(0, 1200);
      await expect(trigger).toBeInViewport();
      expect(await isTopmostAtCentre(page, '.bar__cta', 0)).toBe(true);
    });

    test('package cards are reachable and open the detail modal', async ({ page }) => {
      await page.goto('/shop');
      const firstCard = page.getByRole('button', { name: /View .+ package details/ }).first();
      await firstCard.scrollIntoViewIfNeeded();
      await firstCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      // The CTA is pinned to the bottom of the scrolling panel, so it is reachable
      // without scrolling the package list first.
      await expect(dialog.getByRole('button', { name: 'Add Package to Cart' })).toBeInViewport();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test('the cart summary and checkout stay reachable with items', async ({ page }) => {
      await page.goto('/shop');
      await page.getByRole('button', { name: 'Add Apricot Glow Scrub to cart' }).click();
      await page.goto('/cart');

      // The "Added to cart" toast is transient; dismiss it so the assertion below
      // measures the layout rather than a notification that is about to disappear.
      const dismiss = page.getByRole('button', { name: 'Dismiss notification' });
      if (await dismiss.count()) {
        await dismiss.first().click();
      }

      const checkout = page.getByRole('button', { name: 'Checkout' });
      await expect(checkout).toBeInViewport();
      expect(await isTopmostAtCentre(page, 'moon-button button', 0)).toBe(true);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });
}

test.describe('keyboard-only operation', () => {
  test('completes the quiz, adds to cart and reaches checkout without a mouse', async ({
    page,
  }) => {
    await page.goto('/quiz');

    const next = page.getByRole('button', { name: 'Next' });
    // `press` does not wait for the button to become enabled, so wait explicitly:
    // Next is disabled until the current question is answered.
    const pressNext = async (): Promise<void> => {
      await expect(next).toBeEnabled();
      await next.press('Enter');
    };

    // Q1 — arrow keys move and select within the radiogroup.
    await page.getByRole('radio').first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');

    await pressNext();
    await expect(page.getByText('Question 2 of 3')).toBeVisible();

    await page
      .getByRole('radio', { name: 'Rough or uneven texture', exact: true })
      .press('Enter');
    await pressNext();

    await page.getByRole('radio', { name: 'Smooth & polished', exact: true }).press('Enter');
    await pressNext();

    await expect(page.getByRole('heading', { name: 'Your MoonCosmo Match' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Add Routine to Cart' }).press('Enter');
    await page.getByRole('button', { name: 'No, Thanks' }).press('Enter');
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeEnabled();
  });
});
