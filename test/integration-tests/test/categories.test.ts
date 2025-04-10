import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';

const API_BASE_URL:string = 'http://localhost:8787';

describe('Categories API Integration Tests', () => {
  const server = request(API_BASE_URL);

  it('should return a list of categories', async () => {
    const response = await server.get('/categories')

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should create a new category', async () => {
    const { body: allCategories } = await server.get('/categories');

    const newCategory = `category-${Date.now()}`
    const response = await server
      .post('/categories')
      .send({ name: newCategory });

    expect(response.status).to.equal(201);

    expect(response.body).to.be.an('object');
    expect(response.body).deep.equal({
      id: allCategories[allCategories.length - 1].id + 1,
      name: newCategory
    })
  });

  it('should update an existing category', async () => {
    const updatedCategoryName = `updated-category-${Date.now()}`;
    const categoryIdToUpdate = 1;

    const response = await server
      .put(`/categories/${categoryIdToUpdate}`)
      .send({ name: updatedCategoryName });

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.id).to.equal(categoryIdToUpdate);
    expect(response.body.name).to.equal(updatedCategoryName);
  });

  it('should delete an existing category', async () => {
    const categoryIdToDelete = 2;
    const response = await server.delete(`/categories/${categoryIdToDelete}`);
    expect(response.status).to.equal(204);
  });
});