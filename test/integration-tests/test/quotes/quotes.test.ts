import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import { API_BASE_URL } from '../../src/utils/config.ts';
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
      for (const quoteId of (new Set([...createdQuoteIds]))) {
         const res = await server
           .delete(`/quotes/${quoteId}`)
           .set('Authorization', adminToken);
          expect(res.status).to.be.equal(204);
      }
      
      // Delete category
      if (categoryId) {
        await deleteCategory({ categoryId }, { authToken: adminToken });
      }
    } catch (error) {
       console.error("Error in after hook:", error);
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
    expect(response.status).to.equal(400);
    expect(response.body).to.be.deep.equal({ error: 'Invalid categoryId format' });
  });

  // --- POST /quotes Tests ---
  describe('POST /quotes', () => {
    it('should create a new quote successfully', async () => {
      const newQuoteData = {
        quote: `A new test quote ${Date.now()}`,
        author: 'Test Author',
        categoryId: categoryId,
      };
      const response = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(newQuoteData);

      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('id').that.is.a('number');
      expect(response.body.quote).to.equal(newQuoteData.quote);
      expect(response.body.author).to.equal(newQuoteData.author);
      expect(response.body.categoryId).to.equal(newQuoteData.categoryId);

      // Add the ID to the list for cleanup
      if (response.body && response.body.id) {
        createdQuoteIds.push(response.body.id);
      }
    });

    it('should return 400 if quote field is missing', async () => {
      const invalidData = { author: 'Test Author', categoryId: categoryId };
      const response = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('quote'); 
    });

    it('should return 400 if author field is missing', async () => {
      const invalidData = { quote: 'Test Quote', categoryId: categoryId };
      const response = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('author'); 
    });

    it('should return 400 if categoryId field is missing', async () => {
      const invalidData = { quote: 'Test Quote', author: 'Test Author' };
      const response = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
       expect(response.body.error).to.contain('categoryId'); 
    });

    it('should return 400 if categoryId is not a number', async () => {
      const invalidData = {
        quote: 'Test Quote',
        author: 'Test Author',
        categoryId: 'abc', // Invalid type
      };
      const response = await server
        .post('/quotes')
        .set('Authorization', adminToken)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('categoryId'); 
    });

    it('should return 401/403 if authentication is missing', async () => {
       const newQuoteData = {
        quote: 'Another Test Quote',
        author: 'Test Author',
        categoryId: categoryId,
      };
      const response = await server
        .post('/quotes')
        .send(newQuoteData);

      expect(response.status).to.be.oneOf([401, 403]); 
    });
  });

  // --- PUT /quotes/:id Tests ---
  describe('PUT /quotes/:id', () => {
    it('should update an existing quote successfully', async () => {
      expect(createdQuoteIds.length).to.be.greaterThan(0, 'Cannot run update test: No quote IDs available from setup');
      const quoteIdToUpdate = createdQuoteIds[0];
      const updatePayload = {
        quote: `Updated Test Quote ${Date.now()}`,
        author: 'Updated Author',
        categoryId: categoryId, 
      };

      const response = await server
        .put(`/quotes/${quoteIdToUpdate}`)
        .set('Authorization', adminToken)
        .send(updatePayload);

      expect(response.status).to.equal(200, 'Expected status 200 for successful update');
      expect(response.body).to.be.an('object');
      expect(response.body.quote).to.equal(updatePayload.quote);
      expect(response.body.author).to.equal(updatePayload.author);
      expect(response.body.id).to.equal(quoteIdToUpdate);

      const verifyResponse = await server
        .get(`/quotes/${quoteIdToUpdate}`)
        .set('Authorization', adminToken);
      expect(verifyResponse.status).to.equal(200);
      expect(verifyResponse.body.quote).to.equal(updatePayload.quote);
    });

    it('should return 404 when trying to update a non-existent quote', async () => {
      const nonExistentQuoteId = 999999;
      const updatePayload = { quote: 'Update', author: 'N/A', categoryId: categoryId };
      const response = await server
        .put(`/quotes/${nonExistentQuoteId}`)
        .set('Authorization', adminToken)
        .send(updatePayload);
      expect(response.status).to.equal(404);
    });

    it('should return 400 for validation error (e.g., empty quote)', async () => {
       expect(createdQuoteIds.length).to.be.greaterThan(0, 'Cannot run validation test: No quote IDs available');
       const quoteIdToUpdate = createdQuoteIds[0];
       const invalidPayload = { quote: '', author: 'Valid', categoryId: categoryId };
       const response = await server
         .put(`/quotes/${quoteIdToUpdate}`)
         .set('Authorization', adminToken)
         .send(invalidPayload);
       expect(response.status).to.equal(400);
       expect(response.body).to.have.property('error');
    });

    it('should return 401/403 if authentication is missing', async () => {
      expect(createdQuoteIds.length).to.be.greaterThan(0, 'Cannot run auth test: No quote IDs available');
      const quoteIdToUpdate = createdQuoteIds[0];
      const updatePayload = { quote: 'Update attempt', author: 'Authless', categoryId: categoryId };
      const response = await server
        .put(`/quotes/${quoteIdToUpdate}`)
        .send(updatePayload);
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  // --- DELETE /quotes/:id Tests ---
  describe('DELETE /quotes/:id', () => {
    it('should delete an existing quote successfully', async () => {
      expect(createdQuoteIds.length).to.be.greaterThanOrEqual(2, 'Cannot run delete test: Need >= 2 quotes');
      const quoteIdToDelete = createdQuoteIds[1]; 
      const initialLength = createdQuoteIds.length;

      const deleteResponse = await server
        .delete(`/quotes/${quoteIdToDelete}`)
        .set('Authorization', adminToken);

      expect(deleteResponse.status).to.be.oneOf([200, 204]);

      const indexToDelete = createdQuoteIds.indexOf(quoteIdToDelete);
      expect(indexToDelete).to.not.equal(-1);
      if (indexToDelete > -1) createdQuoteIds.splice(indexToDelete, 1);
      expect(createdQuoteIds.length).to.equal(initialLength - 1);

      const verifyResponse = await server
        .get(`/quotes/${quoteIdToDelete}`)
        .set('Authorization', adminToken);
      expect(verifyResponse.status).to.equal(404);
    });

    it('should return 404 when trying to delete a non-existent quote', async () => {
      const allQuoteIdsResponse = await server
        .get('/quotes')
        .set('Authorization', adminToken);
      expect(allQuoteIdsResponse.status).to.equal(200);
      const allQuoteIds = allQuoteIdsResponse.body.map((quote: { id: number }) => quote.id);
      const nonExistentQuoteId = Math.max(...allQuoteIds) + 1000; // Ensure a non-existent ID
      const response = await server
        .delete(`/quotes/${nonExistentQuoteId}`)
        .set('Authorization', adminToken);
      expect(response.status).to.equal(404);
    });

    it('should return 401/403 if authentication is missing', async () => {
      expect(createdQuoteIds.length).to.be.greaterThan(0, 'Cannot run auth test: No quote IDs available');
      const quoteIdToAttemptDelete = createdQuoteIds[0]; 
      const response = await server
        .delete(`/quotes/${quoteIdToAttemptDelete}`);
      expect(response.status).to.be.oneOf([401, 403]);
    });
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
  });

  it('should fetch the quote of the day in a specific language (es)', async () => {
    const response = await server.get('/qotd?lang=es'); // No auth needed

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('id').that.is.a('number');
    expect(response.body).to.have.property('quote').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('author').that.is.a('string').and.is.not.empty;
    expect(response.body).to.have.property('categoryId').that.is.a('number');
  });

  // Further negative tests can be added here
});
