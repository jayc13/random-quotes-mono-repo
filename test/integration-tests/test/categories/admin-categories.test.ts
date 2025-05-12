import {describe, it} from 'mocha';
import {expect} from 'chai';
import request from 'supertest';
import {getUserAuthToken} from "../../src/utils/authentication.ts";
import {API_BASE_URL} from '../../src/utils/config.ts';

describe('Categories API Integration Tests', () => {
  const server = request(API_BASE_URL);
  let token: string;
  let categoryId: number;

  before(async () => {
    token = await getUserAuthToken('ADMIN');
  });

  it('should return a list of categories', async () => {
    const response = await server
      .get('/categories')
      .set('Authorization', token)

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should create a new category', async () => {
    const newCategory = `category-${Date.now()}`
    const response = await server
      .post('/categories')
      .set('Authorization', token)
      .send({name: newCategory})

    expect(response.status).to.equal(201);

    expect(response.body).to.be.an('object');

    expect(response.body.name).to.equal(newCategory);
    expect(response.body).to.have.property('id');
    expect(response.body.id).to.be.a('number');

    categoryId = response.body.id;
  });

  it('should update an existing category', async () => {
    const updatedCategoryName = `updated-category-${Date.now()}`;
    const categoryIdToUpdate = categoryId;

    const response = await server
      .put(`/categories/${categoryIdToUpdate}`)
      .set('Authorization', token)
      .send({ name: updatedCategoryName });

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.id).to.equal(categoryIdToUpdate);
    expect(response.body.name).to.equal(updatedCategoryName);
  });

  it('should delete an existing category', async () => {
    const response = await server
      .delete(`/categories/${categoryId}`)
      .set('Authorization', token);
    expect(response.status).to.equal(204);
  });
});