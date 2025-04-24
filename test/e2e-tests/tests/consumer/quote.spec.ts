import { test, expect } from '@playwright/test';
import {CONSUMER_BASE_URL} from "../../utils/config";

test.describe('Consumer App: Quote Page', () => {
  test('should display the main heading and a quote in the default language', async ({ page }) => {
    await page.goto(CONSUMER_BASE_URL);

    // Check for the main heading
    await expect(page.getByTestId('main-heading')).toHaveText('Your daily dose of inspiration.');

    const quoteText = page.getByTestId('quote');
    await expect(quoteText).toBeVisible();
    await expect(quoteText).not.toBeEmpty(); // Ensure there's some text

    const quoteAuthor = page.getByTestId('author');
    await expect(quoteAuthor).toBeVisible();
    await expect(quoteAuthor).not.toBeEmpty(); // Ensure there's some text
  });

  test('should allow changing the language and display a quote', async ({ page }) => {
    await page.goto(CONSUMER_BASE_URL);

    // Locate and click the language dropdown
    const langDropdownButton = page.getByTestId('lang-selector-button');
    await expect(langDropdownButton).toBeVisible();
    await langDropdownButton.click();

    // Locate and click the Spanish language option
    const spanishOption = page.getByTestId('lang-selector-es')
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Wait for the page to reload/navigate after language change
    await page.waitForURL('**/*?lang=es'); // Wait for the URL to contain ?lang=es

    // Verify the URL has the correct language parameter
    expect(page.url()).toContain('?lang=es');

    const quoteText = page.getByTestId('quote');
    await expect(quoteText).toBeVisible();
    await expect(quoteText).not.toBeEmpty();

    const quoteAuthor = page.getByTestId('author');
    await expect(quoteAuthor).toBeVisible();
    await expect(quoteAuthor).not.toBeEmpty();
  });
});
