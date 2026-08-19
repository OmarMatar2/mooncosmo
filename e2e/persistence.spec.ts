import { expect, test } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { QuizPage } from './pages/quiz.page';

test.describe('State survives a reload', () => {
  test('at every quiz step', async ({ page }) => {
    const quiz = new QuizPage(page);
    await quiz.goto();

    await quiz.answer('Normal');
    await page.reload();
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 3');

    await quiz.answer('Rough or uneven texture');
    await page.reload();
    await expect(quiz.progressLabel()).toHaveText('Question 3 of 3');

    await quiz.answer('Smooth & polished');
    await quiz.waitForResult();

    // The result survives too.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your MoonCosmo Match' })).toBeVisible();
  });

  test('keeps a previous answer selected after going back and reloading', async ({ page }) => {
    const quiz = new QuizPage(page);
    await quiz.goto();

    await quiz.answer('Combination (oily in some areas, normal in others)');
    await quiz.answer('Rough or uneven texture');
    await quiz.backButton.click();
    await page.reload();

    // Back lands on Q2, whose answer survived both the navigation and the reload.
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 3');
    await expect(quiz.option('Rough or uneven texture')).toHaveAttribute('aria-checked', 'true');

    // …and so did Q1's.
    await quiz.backButton.click();
    await expect(
      quiz.option('Combination (oily in some areas, normal in others)'),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('cart contents survive a reload', async ({ page }) => {
    const cart = new CartPage(page);

    await page.goto('/shop');
    await page
      .getByRole('button', { name: 'Add Hibiscus Rosa Radiance Scrub to cart' })
      .click();

    await cart.goto();
    await expect(cart.lineItems).toHaveCount(1);

    await page.reload();
    await expect(cart.lineItems).toHaveCount(1);
  });

  test('the upsell is shown only once per session', async ({ page }) => {
    const quiz = new QuizPage(page);
    await quiz.goto();

    await quiz.answer('Dry');
    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'One More Thing…' })).toBeVisible();

    // Reloading on the upsell step must not restart the funnel.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'One More Thing…' })).toBeVisible();

    await page.getByRole('button', { name: 'No, Thanks' }).click();
    await expect(page).toHaveURL(/\/cart$/);

    // Returning to the result and adding again goes straight to the cart.
    await page.goto('/quiz');
    await expect(page.getByRole('heading', { name: 'Your MoonCosmo Match' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page).toHaveURL(/\/cart$/);
  });
});
