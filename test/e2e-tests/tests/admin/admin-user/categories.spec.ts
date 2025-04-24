import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../../../commands/admin/login.command';
import {ADMIN_BASE_URL, API_BASE_URL} from '../../../utils/config';

test.describe.configure({ mode: 'serial' });

let page: Page;
let categoryId: string;

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
    const categoryName = `New Category ${Date.now()}`;
    // Click on "Add Category" button
    await page.click('button#add-category-btn');

    // Fill out the form
    await page.fill('[data-testid="create-category-modal"] [data-testid="categoryName"] input', categoryName);

    const createCategoryRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories`) && request.method() === 'POST';
    });

    const getAllCategoriesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories`) && request.method() === 'GET';
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for the request to complete
    await Promise.all([
      createCategoryRequest,
      getAllCategoriesRequest,
    ]);

    const createCategoryResponse = await (await createCategoryRequest).response();

    expect(createCategoryResponse.status()).toBe(201);
    const createCategoryBody = await createCategoryResponse.json();

    expect(createCategoryBody.name).toEqual(categoryName);
    expect(createCategoryBody.id).toBeDefined();
    categoryId = createCategoryBody.id;

    // Check if the new category is displayed in the table

    const categoryRow = await isCategoryByIdDisplayed(categoryId);
    expect(categoryRow).toBeTruthy();
  });

  test('should allow editing a category', async () => {
    const newCategoryName = `Updated Category ${Date.now()}`;
    const editButton = page.getByTestId(`edit-category-${categoryId}`);

    await expect(editButton).toBeVisible();
    await editButton.click();

    // Update the category name
    await page.fill('[data-testid="edit-category-modal"] [data-testid="categoryName"] input', newCategoryName);

    const editCategoryRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories/${categoryId}`) && request.method() === 'PATCH';
    });

    const getAllCategoriesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories`) && request.method() === 'GET';
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for the request to complete
    await Promise.all([
      editCategoryRequest,
      getAllCategoriesRequest,
    ]);

    const editCategoryResponse = await (await editCategoryRequest).response();

    expect(editCategoryResponse.status()).toBe(200);
    const editCategoryBody = await editCategoryResponse.json();

    expect(editCategoryBody.name).toEqual(newCategoryName);
    expect(editCategoryBody.id).toEqual(categoryId);

    const categoryRow = await isCategoryByIdDisplayed(categoryId);
    expect(categoryRow).toBeTruthy();
  });

  test('should allow deleting a category', async () => {
    const deleteButton = page.getByTestId(`delete-category-${categoryId}`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const deleteCategoryRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories/${categoryId}`) && request.method() === 'DELETE';
    });

    const getAllCategoriesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories`) && request.method() === 'GET';
    });

    // Confirm the deletion
    await page.locator('[role="tooltip"] button').filter({hasText: 'Delete'}).click();

    await Promise.all([
      deleteCategoryRequest,
      getAllCategoriesRequest,
    ]);

    const deleteCategoryResponse = await (await deleteCategoryRequest).response();

    expect(deleteCategoryResponse.status()).toBe(204);

    const categoryRow = await isCategoryByIdDisplayed(categoryId);
    expect(categoryRow).toBeFalsy();
  });
});

async function isCategoryByIdDisplayed(id: string): Promise<boolean> {
  const categoryRow = page.locator(`#categories-table tr[data-row-key="${id}"]`);
  const isRowVisible = await categoryRow.isVisible();
  if (!isRowVisible) {
    // Navigate to the next page
    const nextPageButton = page.locator('li[title="Next Page"][aria-disabled="false"] button');
    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      return isCategoryByIdDisplayed(id);
    } else {
      return false;
    }
  }
  return true;
}