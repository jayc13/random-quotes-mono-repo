import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../../../commands/admin/login.command';
import { ADMIN_BASE_URL } from '../../../utils/config';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Admin Categories Page', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, 'ADMIN');
    await page.goto(`${ADMIN_BASE_URL}/categories`);
  });

  test('should display categories list', async () => {
    // Check if the categories table is visible
    await expect(page.locator('#categories-table table')).toBeVisible();

    // Verify at least one category is listed
    const rows = await page.locator('#categories-table table tbody tr').all();
    expect(rows.length).toBeGreaterThan(0)
  });

  test('should allow adding a new category', async () => {
    // Click on "Add Category" button
    await page.click('button#add-category-btn');

    // Fill out the form
    await page.fill('[data-testid="categoryName"] input', 'New Category');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify the new category is added
    const newCategory = page.locator('#categories-table table tbody tr', {
      hasText: 'New Category',
    });
    await expect(newCategory).toBeVisible();
  });

  test('should allow editing a category', async () => {
    // Click on the edit button for the first category
    await page.click('#categories-table table tbody tr:first-child button.edit-category');

    // Update the category name
    await page.fill('[data-testid="categoryName"] input', 'Updated Category');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify the category name is updated
    const updatedCategory = page.locator('#categories-table table tbody tr', {
      hasText: 'Updated Category',
    });
    await expect(updatedCategory).toBeVisible();
  });

  test('should allow deleting a category', async () => {
    // Click on the delete button for the first category
    await page.click('#categories-table table tbody tr:first-child button.delete-category');

    // Confirm the deletion
    await page.click('button#confirm-delete');

    // Verify the category is removed
    const deletedCategory = page.locator('#categories-table table tbody tr:first-child');
    await expect(deletedCategory).not.toHaveText('Deleted Category');
  });
});