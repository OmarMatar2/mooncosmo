import { expect, test } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { QuizPage } from './pages/quiz.page';

const SENSITIVITY_NOTICE =
  'Contains menthol and mint oils — you may feel a cooling tingle. We recommend a patch test first.';

test.describe('Quiz funnel', () => {
  test('full path: quiz → result → routine completer → cart → Shopify permalink', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);
    const cart = new CartPage(page);

    await quiz.goto();
    await expect(quiz.progressLabel()).toHaveText('Question 1 of 5');

    await quiz.answer('25–34');
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 5');
    await quiz.answer('Fair');
    await expect(quiz.progressLabel()).toHaveText('Question 3 of 5');
    await quiz.answer('Normal');
    await expect(quiz.progressLabel()).toHaveText('Question 4 of 5');
    await quiz.answer('Dryness or lack of softness');
    await expect(quiz.progressLabel()).toHaveText('Question 5 of 5');
    await quiz.answer('Soft & moisturized');

    await quiz.waitForResult();
    // Apricot 1+3+3 = 7, Hibiscus 0+1+1 = 2.
    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hibiscus Rosa Radiance Scrub' }),
    ).toBeVisible();

    // The composed explanation names the skin type and the concern the visitor picked,
    // and describes their tone without presenting it as a reason.
    await expect(page.getByRole('heading', { name: 'Why we chose this for you' })).toHaveCount(2);
    await expect(
      page
        .getByText(
          /You told us your skin is generally normal with a fair tone, and that dryness and a lack of softness are your main concern\./,
        )
        .first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();

    // The routine completer comes before the cart, never after the Shopify handoff.
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

  test('accepting the routine completer adds the Minty Fresh Clay Mask', async ({ page }) => {
    const quiz = new QuizPage(page);
    const cart = new CartPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Medium',
      skinType: 'Oily',
      concern: 'Dull-looking skin',
      result: 'Bright & radiant',
    });
    await quiz.waitForResult();

    // Turmeric 2+3+2 = 7, Hibiscus 0+1+1 = 2.
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes, Add It' }).click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(cart.lineItems).toHaveCount(3);
  });

  test('the mask is never a quiz recommendation, even on the path that most suits it', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Medium',
      skinType: 'Oily',
      concern: 'Excess oil or clogged-looking pores',
      result: 'Clean & deeply cleansed',
    });
    await quiz.waitForResult();

    // Turmeric 2+3+2 = 7, Lemon Mint 2+1+1 = 4. The mask scores nothing: it is not in
    // the quiz at all.
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lemon Mint Cucumber Scrub' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toHaveCount(0);

    // It is offered afterwards, unconditionally, as the routine completer.
    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await expect(page.getByText(SENSITIVITY_NOTICE)).toHaveCount(0);
  });

  test('sensitive skin excludes Lemon Mint and Turmeric from the result', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Medium',
      skinType: 'Sensitive',
      concern: 'Dryness or lack of softness',
      result: 'Soft & moisturized',
    });
    await quiz.waitForResult();

    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hibiscus Rosa Radiance Scrub' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Lemon Mint Cucumber Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toHaveCount(0);
  });

  test('the mask is still offered to sensitive skin, with the sensitivity notice', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Medium',
      skinType: 'Sensitive',
      concern: 'Dryness or lack of softness',
      result: 'Soft & moisturized',
    });
    await quiz.waitForResult();

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await expect(page.getByText(SENSITIVITY_NOTICE)).toBeVisible();
  });

  test('dry skin also sees the mask and its notice', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Fair',
      skinType: 'Dry',
      concern: 'Rough or uneven texture',
      result: 'Soft & moisturized',
    });
    await quiz.waitForResult();

    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Add Routine to Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Minty Fresh Clay Mask' })).toBeVisible();
    await expect(page.getByText(SENSITIVITY_NOTICE)).toBeVisible();
  });

  test('skin tone filters the result: Turmeric is out for fair, Golden for medium', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Fair',
      skinType: 'Oily',
      concern: 'Dull-looking skin',
      result: 'Bright & radiant',
    });
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Golden Radiance Scrub' })).toBeVisible();

    await page.getByRole('button', { name: 'Retake the quiz' }).click();
    await quiz.complete({
      tone: 'Medium',
      skinType: 'Oily',
      concern: 'Dull-looking skin',
      result: 'Bright & radiant',
    });
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Golden Radiance Scrub' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();
  });

  test('changing a filter answer invalidates the later answers and the result', async ({
    page,
  }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('25–34');
    await quiz.answer('Medium');
    await quiz.answer('Normal');
    await quiz.answer('Dull-looking skin');
    await expect(quiz.progressLabel()).toHaveText('Question 5 of 5');

    // Back to Q4, then Q3 — the earlier answer is still selected.
    await quiz.backButton.click();
    await quiz.backButton.click();
    await expect(quiz.option('Normal')).toHaveAttribute('aria-checked', 'true');

    // Switching skin type invalidates every answer after it.
    await quiz.option('Sensitive').click();
    await quiz.nextButton.click();
    await expect(quiz.progressLabel()).toHaveText('Question 4 of 5');
    await expect(quiz.nextButton).toBeDisabled(); // the old Q4 answer was cleared

    await quiz.answer('Dryness or lack of softness');
    await quiz.answer('Soft & moisturized');
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Apricot Glow Scrub' })).toBeVisible();
  });

  test('changing the tone answer clears the skin type too', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.answer('25–34');
    await quiz.answer('Medium');
    await quiz.answer('Oily');
    await expect(quiz.progressLabel()).toHaveText('Question 4 of 5');

    await quiz.backButton.click();
    await quiz.backButton.click();
    await expect(quiz.progressLabel()).toHaveText('Question 2 of 5');

    await quiz.option('Deep').click();
    await quiz.nextButton.click();
    await expect(quiz.progressLabel()).toHaveText('Question 3 of 5');
    await expect(quiz.nextButton).toBeDisabled();
  });

  test('the age answer does not change the recommendation', async ({ page }) => {
    const quiz = new QuizPage(page);
    const path = {
      tone: 'Medium',
      skinType: 'Oily',
      concern: 'Dull-looking skin',
      result: 'Bright & radiant',
    } as const;

    await quiz.goto();
    await quiz.complete({ age: 'Under 18', ...path });
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();

    await page.getByRole('button', { name: 'Retake the quiz' }).click();
    await quiz.complete({ age: '45 and above', ...path });
    await quiz.waitForResult();
    await expect(page.getByRole('heading', { name: 'Turmeric Glow Scrub' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hibiscus Rosa Radiance Scrub' }),
    ).toBeVisible();
  });

  test('retaking the quiz clears the answers', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.complete({
      tone: 'Fair',
      skinType: 'Dry',
      concern: 'Dryness or lack of softness',
      result: 'Soft & moisturized',
    });
    await quiz.waitForResult();

    await page.getByRole('button', { name: 'Retake the quiz' }).click();
    await expect(quiz.progressLabel()).toHaveText('Question 1 of 5');
    await expect(quiz.option('25–34')).toHaveAttribute('aria-checked', 'false');
  });
});
