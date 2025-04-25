import { test, expect, devices } from '@playwright/test';
import {CONSUMER_BASE_URL} from "../../utils/config";


// Define mobile viewports to test
const mobileViewports = [
  { name: 'iPhone 11', viewport: devices['iPhone 11'].viewport },
  { name: 'Pixel 5', viewport: devices['Pixel 5'].viewport },
  // Add more devices if needed
  // { name: 'Galaxy S9+', viewport: devices['Galaxy S9+'].viewport },
];

test.describe('Consumer Home Page Mobile Layout', () => {
  for (const { name, viewport } of mobileViewports) {
    test.describe(`Viewport: ${name}`, () => {
      // Use the specific mobile viewport for tests in this describe block
      test.use({ viewport });

      test('should display all main elements correctly', async ({ page }) => {
        await page.goto(CONSUMER_BASE_URL);

        // Assert visibility of main elements
        await expect(page.locator('[data-testid="main-heading"]')).toBeVisible();
        await expect(page.locator('[data-testid="lang-selector-button"]')).toBeVisible();
        await expect(page.locator('[data-testid="category-selector-button"]')).toBeVisible();
        await expect(page.locator('[data-testid="new-quote-button"]')).toBeVisible();
        await expect(page.locator('label.swap input.theme-controller')).toBeVisible(); // More specific selector for ThemeController input
        await expect(page.locator('[data-testid="quote"]')).toBeVisible();
        await expect(page.locator('[data-testid="author"]')).toBeVisible();

        // Optional: Basic overlap check (can be brittle)
        // This is a very basic check. More robust checks might involve getting bounding boxes.
        const langButtonBox = await page.locator('[data-testid="lang-selector-button"]').boundingBox();
        const categoryButtonBox = await page.locator('[data-testid="category-selector-button"]').boundingBox();
        const quoteBox = await page.locator('[data-testid="quote"]').boundingBox();
        const refreshButtonBox = await page.locator('[data-testid="new-quote-button"]').boundingBox();
        const themeControllerBox = await page.locator('label.swap').boundingBox(); // Use label for bounding box

        expect(langButtonBox).toBeTruthy();
        expect(categoryButtonBox).toBeTruthy();
        expect(quoteBox).toBeTruthy();
        expect(refreshButtonBox).toBeTruthy();
        expect(themeControllerBox).toBeTruthy();

        // Check top controls are roughly aligned and not overlapping quote
        if (langButtonBox && categoryButtonBox && quoteBox) {
          expect(langButtonBox.y).toBeLessThan(quoteBox.y);
          expect(categoryButtonBox.y).toBeLessThan(quoteBox.y);
          // Check they don't overlap horizontally (simple check)
          expect(langButtonBox.x + langButtonBox.width).toBeLessThan(categoryButtonBox.x);
        }

         // Check bottom controls are roughly aligned and below quote
        if (refreshButtonBox && themeControllerBox && quoteBox) {
           expect(refreshButtonBox.y).toBeGreaterThan(quoteBox.y + quoteBox.height);
           expect(themeControllerBox.y).toBeGreaterThan(quoteBox.y + quoteBox.height);
           // Check they don't overlap horizontally (simple check)
           expect(refreshButtonBox.x + refreshButtonBox.width).toBeLessThan(themeControllerBox.x);
        }
      });
    });
  }
});
