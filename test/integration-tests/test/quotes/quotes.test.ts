import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import { API_BASE_URL } from '../../src/utils/config.ts';
// Assuming quote service functions exist similar to category ones
// import { createQuote, deleteQuote } from '../../src/services/quote.service.ts';
import { createCategory, deleteCategory } from '../../src/services/category.service.ts';
import { getUserAuthToken } from '../../src/utils/authentication.ts';

describe('Quotes API Integration Tests', () => {
  const server = request(API_BASE_URL);
  let adminToken: string;
  let categoryId: number;
  const createdQuoteIds: number[] = []; // Use an array to store multiple quote IDs

  before(async () => {
    try {
      adminToken = await getUserAuthToken('ADMIN');
      
      // Create a category
      const categoryName = `test-cat-${Date.now()}`;
      const newCategory = await createCategory({ categoryName }, { authToken: adminToken });
      categoryId = newCategory.id;

      // Create quotes associated with the category
      const quote1Data = { quote: 'Test Quote 1', author: 'Author 1', categoryId: categoryId };
      const quote2Data = { quote: 'Test Quote 2', author: 'Author 2', categoryId: categoryId };

      const res1 = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(quote1Data);
      expect(res1.status).to.be.oneOf([200, 201]); // Allow 200 or 201 for creation
      if (res1.body && res1.body.id) createdQuoteIds.push(res1.body.id);
      
      const res2 = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(quote2Data);
       expect(res2.status).to.be.oneOf([200, 201]);
       if (res2.body && res2.body.id) createdQuoteIds.push(res2.body.id);

       if (createdQuoteIds.length !== 2) {
         throw new Error('Failed to create both quotes in setup');
       }

    } catch (error) {
      console.error("Error in before hook:", error);
      throw error; // Re-throw to fail the suite if setup fails
    }
  });

  after(async () => {
    try {
      // Delete quotes first (due to potential FK constraints)
      for (const quoteId of createdQuoteIds) {
         const res = await server
           .delete(`/quotes/${quoteId}`)
           .set('Authorization', adminToken);
          // Check for 200 or 204 (No Content)
          expect(res.status).to.be.oneOf([200, 204]); 
      }
      
      // Delete category
      if (categoryId) {
        await deleteCategory({ categoryId }, { authToken: adminToken });
      }
    } catch (error) {
       console.error("Error in after hook:", error);
       // Don't re-throw in after hook to allow other tests/suites to run
    }
  });

  it('should fetch all quotes successfully', async () => {
    const response = await server.get('/quotes').set('Authorization', adminToken); // Assuming '/quotes' is the correct endpoint

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    // Optionally check if the created quotes are present
  });

  it('should fetch quotes filtered by a valid categoryId', async () => {
    const response = await server
      .get(`/quotes?categoryId=${categoryId}`)
      .set('Authorization', adminToken);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.equal(createdQuoteIds.length); // Should match the number created

    // Verify each quote belongs to the correct category
    response.body.forEach((quote: any) => {
      expect(quote.categoryId).to.equal(categoryId);
      expect(createdQuoteIds).to.include(quote.id); // Ensure the returned quotes are the ones we created
    });
  });

  it('should return an empty array when filtering by a non-existent categoryId', async () => {
    const nonExistentCategoryId = 999999; // An ID that is unlikely to exist
    const response = await server
      .get(`/quotes?categoryId=${nonExistentCategoryId}`)
      .set('Authorization', adminToken);
    
    expect(response.status).to.equal(200); // Expect success status code
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.equal(0); // Expect no quotes to be returned
  });

  it('should handle invalid categoryId format gracefully', async () => {
    const invalidCategoryId = 'abc'; // Invalid format
    const response = await server.get(`/quotes?categoryId=${invalidCategoryId}`)
      .set('Authorization', adminToken);
    expect(response.status).to.equal(200); // Expect success status code (graceful handling)
    expect(response.body).to.be.an('array'); 
    // We cannot be certain about the content without knowing how NaN/0 is handled
    // Asserting it's an array is a safe minimum expectation.
    // If specific behavior is known (e.g., returns quotes with categoryId 0), 
    // add more specific assertions here.
  });

  // --- Quote of the Day Tests ---

  it('should fetch the quote of the day successfully (default language)', async () => {
    const response = await server.get('/qotd'); // No auth needed for public route

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('id').that.is.a('number');
    expect(response.body).to.have.property('quote').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('author').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('categoryId').that.is.a('number');
    // Note: We cannot easily assert the *content* as it changes daily/by request context
  });

  it('should fetch the quote of the day in a specific language (es)', async () => {
    const response = await server.get('/qotd?lang=es'); // No auth needed

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('id').that.is.a('number');
    expect(response.body).to.have.property('quote').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('author').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('categoryId').that.is.a('number');
    // As noted, asserting the exact translated content is difficult here.
    // We are primarily testing that the endpoint accepts the param and returns the correct structure.
  });

  // Further negative tests can be added here
});
