import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import { getUserAuthToken } from '../../src/utils/authentication.ts';
import {API_BASE_URL} from '../../src/utils/config.ts';

describe('API Keys Integration Tests', () => {
  const req = request(API_BASE_URL);
  let adminToken: string; // Admin adminToken
  let regularUserToken: string; // Regular user adminToken
  let apiKeyId: string;
  let apiKeyValue: string; // Note: The actual key value might not be returned by the API for security reasons

  before(async () => {
    // Fetch tokens for different user roles
    [adminToken, regularUserToken] = await Promise.all([
      getUserAuthToken('ADMIN'),
      getUserAuthToken('REGULAR'),
    ]);
  });

  describe('Admin User Tests', async () => {
    it('should create a new API key for admin user', async () => {
      const keyName = `test-key-admin-${Date.now()}`;
      const response = await req
        .post('/api-tokens')
        .set('Authorization', adminToken)
        .send({ name: keyName });

      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body.name).to.equal(keyName);
      expect(response.body).to.have.property('userId').that.is.a('string');
      expect(response.body).to.have.property('createdAt').that.is.a('string');
      expect(response.body).to.have.property('token').that.is.a('string');

      // Store the key details for later tests
      apiKeyId = response.body.id;
      apiKeyValue = response.body.token;
    });

    it('should return a list of API keys for admin user', async () => {
      const response = await req
        .get('/api-tokens')
        .set('Authorization', adminToken);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array').that.is.not.empty;

      // Find the key created in the previous test
      const foundKey = response.body.find((key: any) => key.id === apiKeyId);
      expect(foundKey).to.exist;
    });

    it('should delete an API key for admin user', async () => {
      if (!apiKeyId) {
        throw new Error('API Key ID not available from create test. Cannot proceed.');
      }

      // Delete the key
      const deleteResponse = await req
        .delete(`/api-tokens/${apiKeyId}`)
        .set('Authorization', adminToken);

      // Assuming DELETE returns 204 No Content on success
      expect(deleteResponse.status).to.equal(204);

      // Verify the key is actually deleted
      const verifyResponse = await req
        .get(`/api-tokens/${apiKeyId}`)
        .set('Authorization', adminToken);

      expect(verifyResponse.status).to.equal(404);
    });
  });

  describe('Regular User Tests', () => {
    it('should create a new API key for regular user', async () => {
      const keyName = `test-key-regular-${Date.now()}`;
      const response = await req
        .post('/api-tokens')
        .set('Authorization', regularUserToken)
        .send({ name: keyName });

      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body.name).to.equal(keyName);
      expect(response.body).to.have.property('userId').that.is.a('string');
      expect(response.body).to.have.property('createdAt').that.is.a('string');
      expect(response.body).to.have.property('token').that.is.a('string');

      // Store the key details for later tests
      apiKeyId = response.body.id;
      apiKeyValue = response.body.token;
    });

    it('should return a list of API keys for regular user', async () => {
      const response = await req
        .get('/api-tokens')
        .set('Authorization', regularUserToken);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array').that.is.not.empty;

      // Find the key created in the previous test
      const foundKey = response.body.find((key: any) => key.id === apiKeyId);
      expect(foundKey).to.exist;
    });

    it('should delete an API key for regular user', async () => {
      if (!apiKeyId) {
        throw new Error('API Key ID not available from create test. Cannot proceed.');
      }

      // Delete the key
      const deleteResponse = await req
        .delete(`/api-tokens/${apiKeyId}`)
        .set('Authorization', regularUserToken);

      // Assuming DELETE returns 204 No Content on success
      expect(deleteResponse.status).to.equal(204);

      // Verify the key is actually deleted
      const verifyResponse = await req
        .get(`/api-tokens/${apiKeyId}`)
        .set('Authorization', regularUserToken);

      expect(verifyResponse.status).to.equal(404);
    });
  });

  // --- Authorization Tests ---

  // No Authentication
  it('should return 401 when creating a key without auth', async () => {
    const response = await req
      .post('/api-tokens')
      .send({ name: 'no-auth-test' });
    expect(response.status).to.equal(401);
  });

  it('should return 401 when listing keys without auth', async () => {
    const response = await req.get('/api-tokens');
    expect(response.status).to.equal(401);
  });
});

