import { test, expect, type Page } from '@playwright/test';
import { loginAs } from '../../../commands/admin/login.command';
import { ADMIN_BASE_URL } from '../../../utils/config';

let page: Page;

// Use serial mode to ensure login happens once before the test
test.describe.configure({ mode: 'serial' });

test.describe('Admin Home Page - Quote of the Day', () => {
  let quoteOfTheDayResponse;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage(); // Create page instance
    await loginAs(page, 'ADMIN'); // Login as Admin

    const getQuoteOfTheDayRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/qotd`) && request.method() === 'GET';
    });
    
    await page.goto(`${ADMIN_BASE_URL}/`); // Navigate to base URL

    await getQuoteOfTheDayRequest;

    quoteOfTheDayResponse = await (await getQuoteOfTheDayRequest).response();
    expect(quoteOfTheDayResponse.status()).toBe(200);

    await page.waitForURL((url) => {
      return url.pathname === '/';
    });
    
    await expect(page.locator("[data-testid='home-page']")).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should display the quote of the day on the home page', async () => {
    const quoteOfTheDay = await quoteOfTheDayResponse.json();
    
    const homePageContainer = page.locator("[data-testid='home-page']");
    const quoteTextLocator = homePageContainer.locator("[data-testid='quote-text']");
    const authorTextLocator = homePageContainer.locator("[data-testid='quote-author']");

    // Assert quote is visible and has text
    await expect(quoteTextLocator).toBeVisible();
    await expect(quoteTextLocator).toContainText(quoteOfTheDay.quote); 

    // Assert author is visible and has text
    await expect(authorTextLocator).toBeVisible();
    await expect(authorTextLocator).toContainText(quoteOfTheDay.author); 
  });
});
