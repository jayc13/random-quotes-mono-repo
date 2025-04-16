import {describe, it} from 'mocha';
import {expect} from 'chai';
import request from 'supertest';
import {getUserAuthToken} from "../../src/utils/authentication.ts";
import {createCategory} from "../../src/services/category.service.ts";

const API_BASE_URL: string = 'http://localhost:8787';

describe('Categories API Integration Tests - No Auth User', () => {
  const server = request(API_BASE_URL);
  let categoryId: number;

  before(async () => {
    const adminToken: string = await getUserAuthToken('ADMIN');
    const newCategory = await createCategory({
      categoryName: `category-admin-${Date.now()}`
    }, {
      authToken: adminToken
    });
    categoryId = newCategory.id;
  });

  it('should not allow get the categories for no authenticated users', async () => {
    const response = await server
      .get('/categories');

    expect(response.status).to.equal(401);
  });

  it('should not allow create categories for no authenticated users', async () => {
    const newCategory = `category-${Date.now()}`
    const response = await server
      .post('/categories')
      .send({name: newCategory})

    expect(response.status).to.equal(401);

    categoryId = response.body.id;
  });

  it('should not allow update categories for no authenticated users', async () => {
    const updatedCategoryName = `updated-category-${Date.now()}`;
    const response = await server
      .put(`/categories/${categoryId}`)
      .send({name: updatedCategoryName});

    expect(response.status).to.equal(401);
  });

  it('should not allow delete categories for no authenticated users', async () => {
    const response = await server
      .delete(`/categories/${categoryId}`);
    expect(response.status).to.equal(401);
  });
});