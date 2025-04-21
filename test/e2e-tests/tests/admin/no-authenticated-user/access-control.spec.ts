import { test, expect } from '@playwright/test';
import { ADMIN_BASE_URL } from '../../../utils/config';

test.describe('Non authenticated users - Access Control', () => {
  test('login is required', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL);
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
  });
  test('/categories path requires login', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/categories`);
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
  });
  test('/quotes path requires login', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
  });
});