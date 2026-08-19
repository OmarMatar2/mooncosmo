import { expect, test } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { QuizPage } from './pages/quiz.page';

const SENSITIVITY_NOTICE =
  'Contains menthol and mint oils — you may feel a cooling tingle. We recommend a patch test first.';

test.describe('Quiz funnel', () => {
  test('full path: quiz → result → upsell → cart → Shopify permalink', async ({ page }) => {
    const quiz = new QuizPage(page);
    const cart = new CartPage(page);

    await quiz.goto();
    await expect(quiz.progressLabel()).toHaveText('Question 1 of 3');

    await quiz.answer('Normal');
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 3');
    await quiz.answer('Dryness or lack of softness');
    await expect(quiz.progressLabel()).toHaveText('Question 3 of 3');
    await quiz.answer('Soft & moisturized');

    await quiz.waitForResult();
    // Apricot 1+3+3 = 7, Hibiscus 1+2+2 = 5.
    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hibiscus Rosa Radiance Scrub' }),
    ).toBeVisible();

    // The composed explanation names the skin type and the goal the visitor picked.
    await expect(page.getByRole('heading', { name: 'Why we chose this for you' })).toHaveCount(2);
    await expect(
      page.getByText(
        /You told us your skin is generally normal, and that dryness is what bothers you most\./,
      ).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();

    // The upsell comes before the cart, never after the Shopify handoff.
    await expect(page.getByRole('heading', { name: 'One More Thing…' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    // Normal skin gets no sensitivity notice.
    await expect(page.getByText(SENSITIVITY_NOTICE)).toHaveCount(0);
    await page.getByRole('button', { name: 'No, Thanks' }).click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(cart.lineItems).toHaveCount(2);

    const url = await cart.captureCheckoutUrl();
    expect(url).toMatch(/^https:\/\/mooncosmo\.com\/cart\/\d+:\d+(,\d+:\d+)*\?ref=quiz-funnel$/);
    expect(url).toContain('43501224001570:1');
  });

  test('accepting the upsell adds the Minty Fresh Clay Mask', async ({ page }) => {
    const quiz = new QuizPage(page);
    const cart = new CartPage(page);

    await quiz.goto();
    await quiz.answer('Oily');
    await quiz.answer('Dull-looking skin');
    await quiz.answer('Bright & radiant');
    await quiz.waitForResult();

    // Turmeric 2+3+2 = 7, Hibiscus 0+2+2 = 4.
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes, Add It' }).click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(cart.lineItems).toHaveCount(3);
  });

  test('sensitive skin excludes Lemon Mint, Turmeric and the mask from the result', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Sensitive');
    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();

    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hibiscus Rosa Radiance Scrub' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Lemon Mint Cucumber Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toHaveCount(0);
  });

  test('the mask is still upsold to sensitive skin, with the sensitivity notice', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Sensitive');
    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await expect(page.getByText(SENSITIVITY_NOTICE)).toBeVisible();
  });

  test('dry skin also sees the mask upsell and its notice', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Dry');
    await quiz.answer('Rough or uneven texture');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();

    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await expect(page.getByText(SENSITIVITY_NOTICE)).toBeVisible();
  });

  test('the upsell falls back when the quiz already recommended the mask', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Oily');
    await quiz.answer('Excess oil or clogged-looking pores');
    await quiz.answer('Clean & deeply cleansed');
    await quiz.waitForResult();

    // Minty 2+3+3 = 8, Turmeric 2+2+1 = 5 — the mask is in the recommendation itself.
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();

    // Next best eligible product not already in the cart: Lemon Mint 1+1+1 = 3,
    // tied with Hibiscus 0 and Golden 0 — Lemon Mint wins on score.
    await expect(page.getByRole('heading', { name: 'One More Thing…' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lemon Mint Cucumber Scrub' })).toBeVisible();
    // Oily skin never gets the notice, and the mask is not offered twice.
    await expect(page.getByText(SENSITIVITY_NOTICE)).toHaveCount(0);
  });

  test('going back and changing an answer changes the result', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Normal');
    await quiz.answer('Dull-looking skin');
    await expect(quiz.progressLabel()).toHaveText('Question 3 of 3');

    // Back to Q2, then back to Q1 — the earlier answer is still selected.
    await quiz.backButton.click();
    await quiz.backButton.click();
    await expect(quiz.option('Normal')).toHaveAttribute(
      'aria-checked',
      'true',
    );

    // Switching to Sensitive invalidates the later answers.
    await quiz.option('Sensitive').click();
    await quiz.nextButton.click();
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 3');
    await expect(quiz.nextButton).toBeDisabled(); // the old Q2 answer was cleared

    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
  });

  test('retaking the quiz clears the answers', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('Dry');
    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();

    await page.getByRole('button', { name: 'Retake the quiz' }).click();
    await expect(quiz.progressLabel()).toHaveText('Question 1 of 3');
    await expect(quiz.option('Dry')).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
