import { test, expect, Page } from '@playwright/test';
import { ADMIN_BASE_URL } from '../../../utils/config';
import { loginAs } from '../../../commands/admin/login.command';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Admin User Access Control', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, 'ADMIN');
  });
  test('the sidebar displays all entries', async () => {
    const sideMenuOptions = await page.locator('aside ul li a').all();
    expect(sideMenuOptions.length).toBe(4);

    const homeOption = sideMenuOptions[0];
    expect(await homeOption.innerText()).toBe('Home');

    const categoriesOption = sideMenuOptions[1];
    expect(await categoriesOption.innerText()).toBe('Categories');

    const quotesOption = sideMenuOptions[2];
    expect(await quotesOption.innerText()).toBe('Quotes');

    const apiKeysOption = sideMenuOptions[3];
    expect(await apiKeysOption.innerText()).toBe('API Keys');
  });
  test('the categories page is accessible', async () => {
    await page.goto(`${ADMIN_BASE_URL}/categories`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible' });
    const categoriesPage = page.getByTestId('categories-page');
    await categoriesPage.waitFor({ state: 'visible' });
    expect(await categoriesPage.isVisible()).toBe(true);
  });
  test('the quotes page is accessible', async () => {
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible' });
    const quotesPage = page.getByTestId('quotes-page');
    await quotesPage.waitFor({ state: 'visible' });
    expect(await quotesPage.isVisible()).toBe(true);
  });
  test('the API keys page is accessible', async () => {
    await page.goto(`${ADMIN_BASE_URL}/api-keys`);
    const mainContainer =  page.locator('header');
    await mainContainer.waitFor({ state: 'visible' });
    const apiKeysPage = page.getByTestId('api-keys-page');
    await apiKeysPage.waitFor({ state: 'visible' });
    expect(await apiKeysPage.isVisible()).toBe(true);
  });
});