import { test, expect, type Page } from '@playwright/test';
import { loginAs } from '../../../commands/admin/login.command';
import { ADMIN_BASE_URL } from '../../../utils/config';

let page: Page;

// Use serial mode to ensure login happens once before the test
test.describe.configure({ mode: 'serial' });

test.describe('Admin Home Page - Quote of the Day', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage(); // Create page instance
    await loginAs(page, 'ADMIN'); // Login as Admin
    await page.goto(`${ADMIN_BASE_URL}/`); // Navigate to base URL

    // Wait for navigation to settle, potentially redirecting to /home
    // Check if the final URL is the home page (either '/' or '/home')
    await page.waitForURL((url) => {
      return url.pathname === '/' || url.pathname === '/home';
    });
    // Ensure the main home page container is loaded after login/redirect
    await expect(page.locator("[data-testid='home-page']")).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close(); // Close the page after tests
  });

  it('should display the quote of the day on the home page', async () => {
    const homePageContainer = page.locator("[data-testid='home-page']");

    // Optional: Wait for the API call to complete to ensure data is fetched
    await page.waitForResponse(response =>
      response.url().includes('/qotd') && response.status() === 200
    );

    // Locate the quote text element within the Card inside the home page container
    // Using a more specific locator based on the Ant Design structure observed in home.tsx
    const quoteTextLocator = homePageContainer.locator(".ant-card .ant-typography i"); // Targets the italic text within the card

    // Locate the author text element
    // Targeting the secondary text span within the card, usually below the quote
    const authorTextLocator = homePageContainer.locator(".ant-card .ant-typography.ant-typography-secondary");

    // Assert quote is visible and has text
    await expect(quoteTextLocator).toBeVisible();
    await expect(quoteTextLocator).not.toBeEmpty();
    // Check for the quote marks as well, as per the component structure
    await expect(quoteTextLocator).toContainText('"'); 

    // Assert author is visible and has text
    await expect(authorTextLocator).toBeVisible();
    await expect(authorTextLocator).not.toBeEmpty();
  });
});
