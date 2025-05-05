import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import { getUserAuthToken } from '../../src/utils/authentication.ts';
import {API_BASE_URL} from '../../src/utils/config.ts';

describe('API Keys Integration Tests', () => {
  const req = request(API_BASE_URL);
  let token: string; // Admin token
  let regularUserToken: string; // Regular user token
  let apiKeyId: string;
  let apiKeyValue: string; // Note: The actual key value might not be returned by the API for security reasons

  before(async () => {
    // Fetch tokens for different user roles
    [token, regularUserToken] = await Promise.all([
      getUserAuthToken('ADMIN'),
      getUserAuthToken('REGULAR'),
    ]);
  });

  it('should create a new API key', async () => {
    const keyName = `test-key-${Date.now()}`;
    const response = await req
      .post('/api-tokens')
      .set('Authorization', token)
      .send({ name: keyName });

    expect(response.status).to.equal(201);
    expect(response.body).to.be.an('object');
    expect(response.body.name).to.equal(keyName);
    expect(response.body).to.have.property('userId').that.is.a('string');
    expect(response.body).to.have.property('createdAt').that.is.a('string');
    expect(response.body).to.have.property('token').that.is.a('string');

    // Store the key details for later tests
    apiKeyId = response.body.id;
    apiKeyValue = response.body.token; // Store the key value if needed, though listing might not return it
  });

  it('should return a list of API keys', async () => {
    const response = await req
      .get('/api-tokens')
      .set('Authorization', token);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').that.is.not.empty;

    // Find the key created in the previous test
    const foundKey = response.body.find((key: any) => key.id === apiKeyId);
    expect(foundKey).to.exist;
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

  // Insufficient Permissions (Regular User)
  it('should return 403 when creating a key as REGULAR user', async () => {
    const response = await req
      .post('/api-tokens')
      .set('Authorization', regularUserToken)
      .send({ name: 'regular-user-test' });
    expect(response.status).to.equal(403);
  });

  it('should return 403 when listing keys as REGULAR user', async () => {
    const response = await req
      .get('/api-tokens')
      .set('Authorization', regularUserToken);
    expect(response.status).to.equal(403);
  });

  it('should return 403 when getting a specific key as REGULAR user', async () => {
    if (!apiKeyId) {
      throw new Error('API Key ID not available. Cannot run REGULAR user GET test.');
    }
    const response = await req
      .get(`/api-tokens/${apiKeyId}`)
      .set('Authorization', regularUserToken);
    expect(response.status).to.equal(403);
  });

  it('should return 403 when deleting a key as REGULAR user', async () => {
    if (!apiKeyId) {
      throw new Error('API Key ID not available. Cannot run REGULAR user DELETE test.');
    }
    const response = await req
      .delete(`/api-tokens/${apiKeyId}`)
      .set('Authorization', regularUserToken);
    expect(response.status).to.equal(403);
  });

  // --- Admin User Deletion (should be last or after checks needing the key) ---
  it('should delete an API key (as ADMIN)', async () => {
    if (!apiKeyId) {
      // Skip the test or throw an error if apiKeyId wasn't set by the create test
      // this.skip(); // Uncomment if you want to skip instead of failing
      throw new Error('API Key ID not available from create test. Cannot proceed.');
    }

    // Delete the key
    const deleteResponse = await req
      .delete(`/api-tokens/${apiKeyId}`)
      .set('Authorization', token);

    // Assuming DELETE returns 204 No Content on success
    expect(deleteResponse.status).to.equal(204);

    // Verify the key is actually deleted
    const verifyResponse = await req
      .get(`/api-tokens/${apiKeyId}`)
      .set('Authorization', token);

    expect(verifyResponse.status).to.equal(404);
  });
});
