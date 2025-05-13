import {describe, it, before} from 'mocha';
import {expect} from 'chai';
import request from 'supertest';
import {getUserAuthToken} from '../../src/utils/authentication.ts';
import {API_BASE_URL} from '../../src/utils/config.ts';


describe('Access Control with API Token', () => {
  const req = request(API_BASE_URL);
  let adminToken: string;
  let regularToken: string;
  let adminApiToken: string;
  let regularApiToken: string;
  let adminApiKeyId: string;
  let regularApiKeyId: string;

  const testConfig = [
    {
      name: 'Admin API Token',
      token: '',
    },
    // {
    //   name: 'Regular API Token',
    //   token: '',
    // }
  ];

  before(async () => {
    // Get auth tokens for different user roles
    adminToken = await getUserAuthToken('ADMIN');
    regularToken = await getUserAuthToken('REGULAR');

    // Helper function to create API token
    const createApiToken = async (authToken, role) => {
      const response = await req
        .post('/api-tokens')
        .set('Authorization', authToken)
        .send({name: `api-token-${role}-test-${Date.now()}`});

      expect(response.status).to.equal(201);

      return {
        id: response.body.id,
        token: response.body.token
      };
    };

    // Create tokens for both user types
    const adminResult = await createApiToken(adminToken, 'admin');
    adminApiKeyId = adminResult.id;
    adminApiToken = adminResult.token;

    const regularResult = await createApiToken(regularToken, 'regular');
    regularApiKeyId = regularResult.id;
    regularApiToken = regularResult.token;

    testConfig[0].token = adminApiToken;
    // testConfig[1].token = regularApiToken;
  });

  after(async () => {
    // Clean up - delete the API token
    if (adminApiKeyId) {
      await req
        .delete(`/api-tokens/${adminApiKeyId}`)
        .set('Authorization', adminToken);
    }
    if (regularApiKeyId) {
      await req
        .delete(`/api-tokens/${regularApiKeyId}`)
        .set('Authorization', regularToken);
    }
  });

  for (const testConfigElement of testConfig) {
    describe(`Access Control with ${testConfigElement.name}`, () => {

      describe('API Token in Headers', () => {
        it('should allow access to protected endpoint with valid API token in header', async () => {
          const apiToken = testConfigElement.token;

          const response = await req
            .get('/random')
            .set('API-Token', apiToken);

          expect(response.status).to.not.equal(401);
        });

        it('should reject access with invalid API token in header', async () => {
          const response = await req
            .get('/random')
            .set('API-Token', 'invalid-token-value');

          expect(response.status).to.equal(401);
        });
      });

      describe('API Token as Query Parameter', () => {
        it('should allow access to protected endpoint with valid API token as query param', async () => {
          const apiToken = testConfigElement.token;
          const response = await req
            .get(`/random?api-token=${apiToken}`);

          expect(response.status).to.not.equal(401);
        });

        it('should reject access with invalid API token as query param', async () => {
          const response = await req
            .get('/random?api-token=invalid-token-value');

          expect(response.status).to.equal(401);
        });
      });

      describe('Access Control With Different Origins', () => {
        it('should allow access from allowed origin with valid API token', async () => {
          const apiToken = testConfigElement.token;
          const response = await req
            .get('/random')
            .set('Origin', 'https://allowed-domain.com')
            .set('API-Token', apiToken);

          expect(response.status).to.not.equal(401);
        });

        it.skip('should reject access from disallowed origin even with valid API token', async () => {
          const apiToken = testConfigElement.token;
          const response = await req
            .get('/random')
            .set('Origin', 'https://malicious-domain.com')
            .set('API-Token', apiToken);

          // This test depends on how your application handles CORS violations
          // It might return 401, 403, or another status code
          expect([401, 403]).to.include(response.status);
        });
      });
    });
  }
});