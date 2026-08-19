import { expect, type Locator, type Page } from '@playwright/test';

export class QuizPage {
  readonly heading: Locator;
  readonly options: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly progress: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.options = page.getByRole('radio');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.progress = page.getByRole('progressbar');
  }

  async goto(): Promise<void> {
    await this.page.goto('/quiz');
    await expect(this.heading).toBeVisible();
  }

  /**
   * Exact matching: several option labels contain each other as substrings
   * ("Oily" inside "Combination (oily in some areas, normal in others)").
   */
  async answer(label: string | RegExp): Promise<void> {
    await this.page.getByRole('radio', { name: label, exact: true }).click();
    await expect(this.nextButton).toBeEnabled();
    await this.nextButton.click();
  }

  /** Waits for the analysis animation to hand over to the result. */
  async waitForResult(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Your MoonCosmo Match' })).toBeVisible({
      timeout: 15_000,
    });
  }

  option(label: string): Locator {
    return this.page.getByRole('radio', { name: label, exact: true });
  }

  progressLabel(): Locator {
    return this.page.getByText(/Question \d of \d/);
  }
}
