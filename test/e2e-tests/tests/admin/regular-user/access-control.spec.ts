import { test, expect, Page } from '@playwright/test';
import { ADMIN_BASE_URL } from '../../../utils/config';
import { loginAs } from '../../../commands/admin/login.command';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Regular users - Access Control', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, 'REGULAR');
  });
  test('only the home page is accessible after login', async () => {
    await onlyHomePageAccessible(page);
  });
  test('/categories path requires admin login', async () => {
    await page.goto(`${ADMIN_BASE_URL}/categories`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible', timeout: 3 * 60 * 1000 });
    await onlyHomePageAccessible(page);
  });
  test('/quotes path requires admin login', async () => {
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible', timeout: 3 * 60 * 1000 });
    await onlyHomePageAccessible(page);
  });
});

async function onlyHomePageAccessible(page: Page) {
  const sideMenuOptions = await page.locator('aside ul li a').all();
  expect(sideMenuOptions.length).toBe(1);
  const homeOption = sideMenuOptions[0];
  expect(await homeOption.innerText()).toBe('Home');
}