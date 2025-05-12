import {test, expect, Page} from '@playwright/test';
import {loginAs} from '../../../commands/admin/login.command';
import {
  createCategory,
  deleteCategory,
} from '../../../services/category.service';
import {ADMIN_BASE_URL, API_BASE_URL} from '../../../utils/config';

test.describe.configure({mode: 'serial'});

let page: Page;
let quoteId: string;
let categoryId: string;
const categoryName: string = `Test Category ${Date.now()}`;
let authenticationToken: string;

test.describe('Admin Quotes Page', () => {
  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    authenticationToken = await loginAs(page, 'ADMIN');
    const category = await createCategory({
      categoryName,
    }, {
      authToken: authenticationToken,
    });
    categoryId = category.id;
    await page.goto(`${ADMIN_BASE_URL}/quotes`);
  });

  test.afterAll(async () => {
    await deleteCategory({
      categoryId,
    }, {
      authToken: authenticationToken,
    });
  });
  test('should display quotes list', async () => {
    // Check if the quotes table is visible
    await expect(page.locator('#quotes-table table')).toBeVisible();

    // Verify at least one quote is listed
    const rows = await page.locator('#quotes-table table tbody tr').all();
    expect(rows.length).toBeGreaterThan(0);
  });
  test('should allow admin to create an existing quote', async () => {
    const newQuote:string = `This is a new quote ${Date.now()}`;
    const newAuthor = `Author ${Date.now()}`;
    // Click on "Add Category" button
    await page.click('button#add-quote-btn');

    // Fill out the form
    await page.fill('[data-testid="create-quote-modal"] [data-testid="quoteQuote"]', newQuote);
    await page.fill('[data-testid="create-quote-modal"] [data-testid="quoteAuthor"] input', newAuthor);
    await page.locator('[data-testid="create-quote-modal"] [data-testid="quoteCategoryId"] div.ant-form-item-control').click();
    await page.waitForTimeout(400);
    await page.keyboard.type(categoryName);
    await page.waitForTimeout(400);
    await page.keyboard.press("Enter");

    const createQuotesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes`) && request.method() === 'POST';
    });

    const getAllQuotesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes`) && request.method() === 'GET';
    });

    const getAllCategoriesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/categories`) && request.method() === 'GET';
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for the request to complete
    await Promise.all([
      createQuotesRequest,
      getAllQuotesRequest,
      getAllCategoriesRequest,
    ]);

    const createQuoteResponse = await (await createQuotesRequest).response();

    expect(createQuoteResponse.status()).toBe(201);
    const createQuoteBody = await createQuoteResponse.json();

    expect(createQuoteBody.quote).toEqual(newQuote);
    expect(createQuoteBody.author).toEqual(newAuthor);
    expect(createQuoteBody.categoryId).toEqual(categoryId);
    expect(createQuoteBody.id).toBeDefined();
    quoteId = createQuoteBody.id;

    // Check if the new quote is displayed in the table
    const quoteIsPresent = await isQuoteByIdDisplayed(quoteId);
    expect(quoteIsPresent).toBeTruthy();
  });

  test('should allow admin to edit an existing quote', async () => {
    const editedQuote:string = `This is an updated quote ${Date.now()}`;
    const editedAuthor = `Updated author ${Date.now()}`;
    const editButton = page.getByTestId(`edit-quote-${quoteId}`);

    await expect(editButton).toBeVisible();
    await editButton.click();

    // Fill out the form
    await page.fill('[data-testid="edit-quote-modal"] [data-testid="quoteQuote"]', editedQuote);
    await page.fill('[data-testid="edit-quote-modal"] [data-testid="quoteAuthor"] input', editedAuthor);

    const updateQuotesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes/${quoteId}`) && request.method() === 'PATCH';
    });

    const getAllQuotesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes`) && request.method() === 'GET';
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for the request to complete
    await Promise.all([
      updateQuotesRequest,
      getAllQuotesRequest,
    ]);

    const updateQuoteResponse = await (await updateQuotesRequest).response();

    expect(updateQuoteResponse.status()).toBe(200);
    const updateQuoteBody = await updateQuoteResponse.json();

    expect(updateQuoteBody.quote).toEqual(editedQuote);
    expect(updateQuoteBody.author).toEqual(editedAuthor);
    expect(updateQuoteBody.categoryId).toEqual(categoryId);
    expect(updateQuoteBody.id).toEqual(quoteId)

    // Check if the new quote is displayed in the table
    const quoteIsPresent = await isQuoteByIdDisplayed(quoteId);
    expect(quoteIsPresent).toBeTruthy();
  });

  test('should allow admin to delete a quote', async () => {
    const deleteButton = page.getByTestId(`delete-quote-${quoteId}`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const deleteQuoteRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes/${quoteId}`) && request.method() === 'DELETE';
    });

    const getAllCategoriesRequest = page.waitForRequest((request) => {
      return request.url().includes(`${API_BASE_URL}/quotes`) && request.method() === 'GET';
    });

    // Confirm the deletion
    await page.locator('[role="tooltip"] button').filter({hasText: 'Delete'}).click();

    await Promise.all([
      deleteQuoteRequest,
      getAllCategoriesRequest,
    ]);

    const deleteQuoteResponse = await (await deleteQuoteRequest).response();

    expect(deleteQuoteResponse.status()).toBe(204);
  });
});

async function isQuoteByIdDisplayed(id: string): Promise<boolean> {
  const quoteRow = page.locator(`#quotes-table tr[data-row-key="${id}"]`);
  const isRowVisible = await quoteRow.isVisible();
  if (!isRowVisible) {
    // Navigate to the next page
    const lastPage = page.locator('ul.ant-pagination li.ant-pagination-item').last();
    const lastPageCssClasses = await lastPage.getAttribute('class');
    if (lastPageCssClasses.includes('ant-pagination-item-active')) {
      // If the last page is already active, we need to go back to the first page
      return false;
    } else {
      const getAllCategoriesRequest = page.waitForRequest((request) => {
        return request.url().includes(`${API_BASE_URL}/quotes`) && request.method() === 'GET';
      });
      await lastPage.click();
      await getAllCategoriesRequest;
      return isQuoteByIdDisplayed(id);
    }
  }
  return true;
}