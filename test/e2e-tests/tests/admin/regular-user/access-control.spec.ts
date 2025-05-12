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
  test('the sidebar displays all the allowed entries', async () => {
    const sideMenuOptions = await page.locator('aside ul li a').all();
    expect(sideMenuOptions.length).toBe(2);
    const homeOption = sideMenuOptions[0];
    expect(await homeOption.innerText()).toBe('Home');
    const apiKeysOption = sideMenuOptions[1];
    expect(await apiKeysOption.innerText()).toBe('API Keys');
  });
  test('/categories path requires admin login', async () => {
    await page.goto(`${ADMIN_BASE_URL}/categories`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible' });
    await page.getByTestId('home-page').waitFor({ state: 'visible' });
  });
  test('/quotes path requires admin login', async () => {
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible' });
    await page.getByTestId('home-page').waitFor({ state: 'visible' });
  });
});