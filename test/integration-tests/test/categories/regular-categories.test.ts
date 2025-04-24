import {describe, it} from 'mocha';
import {expect} from 'chai';
import request from 'supertest';
import {getUserAuthToken} from "../../src/utils/authentication.ts";
import {createCategory, deleteCategory} from "../../src/services/category.service.ts";
import {API_BASE_URL} from '../../src/utils/config.ts';

describe('Categories API Integration Tests - Regular User', () => {
  const server = request(API_BASE_URL);
  let token: string;
  let categoryId: number;
  let adminToken: string;

  before(async () => {
    token = await getUserAuthToken('REGULAR');
    adminToken = await getUserAuthToken('ADMIN');
    const newCategory = await createCategory({
      categoryName: `category-admin-${Date.now()}`
    }, {
      authToken: adminToken
    });
    categoryId = newCategory.id;
  });

  after(async () => {
    await deleteCategory({
      categoryId
    }, {
      authToken: adminToken
    });
  });

  it('should allow get the categories for regular users', async () => {
    const response = await server
      .get('/categories')
      .set('Authorization', token)

    expect(response.status).to.equal(200);
  });

  it('should not allow create categories for regular users', async () => {
    const newCategory = `category-${Date.now()}`
    const response = await server
      .post('/categories')
      .set('Authorization', token)
      .send({name: newCategory})

    expect(response.status).to.equal(403);
  });

  it('should not allow update categories for regular users', async () => {
    const updatedCategoryName = `updated-category-${Date.now()}`;
    const response = await server
      .put(`/categories/${categoryId}`)
      .set('Authorization', token)
      .send({name: updatedCategoryName});

    expect(response.status).to.equal(403);
  });

  it('should not allow delete categories for regular users', async () => {
    const response = await server
      .delete(`/categories/${categoryId}`)
      .set('Authorization', token);
    expect(response.status).to.equal(403);
  });
});