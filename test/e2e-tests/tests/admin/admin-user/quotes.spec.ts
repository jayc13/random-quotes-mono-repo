import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../../../commands/admin/login.command';
import { ADMIN_BASE_URL } from '../../../utils/config';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Admin Quotes Page', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, 'ADMIN');
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
  });

  test('should display the quotes table', async () => {
    // Check if the quotes table is visible
    const table = page.locator('#quotes-table table');
    await expect(table).toBeVisible();
  });

  test('should allow admin to search for a quote', async () => {
    // Enter search text
    const searchInput = page.locator('input#searchQuotes');
    await searchInput.fill('Mindfulness');
    await searchInput.press('Enter');

    // Verify search results
    const results = page.locator('#quotes-table table tbody tr');
    await expect(results).not.toBeEmpty();
    await expect(results.first()).toContainText('Mindfulness');
  });

  test('should allow admin to add a new quote', async () => {
    // Click the "Add Quote" button
    await page.click('button#addQuote');

    // Fill out the form
    await page.fill('input#quoteText', 'Mindfulness is the key to happiness.');
    await page.fill('input#quoteAuthor', 'Unknown');
    await page.selectOption('select#quoteCategory', '5');

    // Submit the form
    await page.click('button#saveQuote');

    // Verify the new quote is added
    const newQuote = page.locator('#quotes-table table tbody tr:last-child');
    await expect(newQuote).toContainText('Mindfulness is the key to happiness.');
  });

  test('should allow admin to edit an existing quote', async () => {
    // Click the "Edit" button for the first quote
    await page.click('#quotes-table table tbody tr:first-child button.editQuote');

    // Update the quote text
    const quoteTextInput = page.locator('input#quoteText');
    await quoteTextInput.fill('Updated quote text');

    // Save changes
    await page.click('button#saveQuote');

    // Verify the quote is updated
    const updatedQuote = page.locator('#quotes-table table tbody tr:first-child');
    await expect(updatedQuote).toContainText('Updated quote text');
  });

  test('should allow admin to delete a quote', async () => {
    // Click the "Delete" button for the first quote
    await page.click('#quotes-table table tbody tr:first-child button.deleteQuote');

    // Confirm deletion
    await page.click('button#confirmDelete');

    // Verify the quote is deleted
    const deletedQuote = page.locator('#quotes-table table tbody tr:first-child');
    await expect(deletedQuote).not.toContainText('Mindfulness');
  });
});