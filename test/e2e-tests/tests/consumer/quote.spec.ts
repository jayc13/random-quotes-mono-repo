import { test, expect } from '@playwright/test';

// Assuming consumer app runs on port 5173 - adjust if necessary
const CONSUMER_APP_URL = process.env.CONSUMER_APP_URL || 'http://localhost:5173';

test.describe('Consumer App: Quote Page', () => {
  test('should display the main heading and a quote in the default language', async ({ page }) => {
    await page.goto(CONSUMER_APP_URL);

    // Check for the main heading
    await expect(page.locator('h1')).toHaveText('Your daily dose of inspiration.');

    // Check for the quote card elements
    const quoteCard = page.locator('.card');
    await expect(quoteCard).toBeVisible();

    const quoteText = quoteCard.locator('.card-title');
    await expect(quoteText).toBeVisible();
    await expect(quoteText).not.toBeEmpty(); // Ensure there's some text

    const quoteAuthor = quoteCard.locator('p'); // Assuming author is in a <p> tag
    await expect(quoteAuthor).toBeVisible();
    await expect(quoteAuthor).not.toBeEmpty(); // Ensure there's some text
  });

  test('should allow changing the language and display a quote', async ({ page }) => {
    await page.goto(CONSUMER_APP_URL);

    // Locate and click the language dropdown
    const langDropdownButton = page.locator('.dropdown button.btn'); // Adjust selector if needed
    await expect(langDropdownButton).toBeVisible();
    await langDropdownButton.click();

    // Locate and click the Spanish language option
    // Using a locator that finds the button by its text content (the flag)
    const spanishOption = page.locator('.dropdown-content button.btn', { hasText: '🇪🇸' });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Wait for the page to reload/navigate after language change
    await page.waitForURL('**/*?lang=es'); // Wait for the URL to contain ?lang=es

    // Verify the URL has the correct language parameter
    expect(page.url()).toContain('?lang=es');

    // Re-check for the quote card elements (content might differ, but elements should be there)
    const quoteCard = page.locator('.card');
    await expect(quoteCard).toBeVisible();

    const quoteText = quoteCard.locator('.card-title');
    await expect(quoteText).toBeVisible();
    await expect(quoteText).not.toBeEmpty();

    const quoteAuthor = quoteCard.locator('p');
    await expect(quoteAuthor).toBeVisible();
    await expect(quoteAuthor).not.toBeEmpty();
  });
});
