import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createApiTokenHandler,
  deleteApiTokenHandler,
  getUserApiTokensHandler,
} from '@/controllers/api-token.controller';
import * as ApiTokenService from '@/services/api-token.service';
import type { Env } from '@/index'; // Assuming Env type is needed for context
import type { User } from '@/middlewares/authentication.middleware';
import type { ApiTokenInfo, NewApiToken } from '@/types/api-token.types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';


// Mock the entire service module
vi.mock('@/services/api-token.service');

describe('API Token Controller', () => {
  const mockUserId = 'auth0|user123';
  const mockTokenId = 1;
  const mockTokenName = 'Test Token';
  const mockPlainTextToken = 'qtk_mockgeneratedtoken12345';
  const mockHashedToken = 'hashed_mock_token';
  const mockCreatedAt = new Date().toISOString();

  // Mock service functions
  const mockGenerateApiToken = vi.mocked(ApiTokenService.generateApiToken);
  const mockDeleteApiToken = vi.mocked(ApiTokenService.deleteApiToken);
  const mockGetUserApiTokens = vi.mocked(ApiTokenService.getUserApiTokens);


  // Mock environment and context
  const mockEnv = {
    DB: {} as D1Database, // Mock D1Database as needed, maybe pass the service mock?
    // Add other Env properties if used by handlers directly (unlikely here)
  } as Env;

  const mockUser: User = { sub: mockUserId, name: 'Test User', email: 'test@example.com' };

  const createMockContext = (user: User | null = mockUser): ExecutionContext => ({
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
    // Simple mock for props, assuming middleware sets user here
    // Adjust based on actual middleware implementation
    // @ts-ignore // Ignore type error for simplistic mock
    props: { user },
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  // --- createApiTokenHandler ---
  describe('createApiTokenHandler', () => {
    it('should create a token and return 201 with token details', async () => {
      const requestBody = { name: mockTokenName };
      const mockRequest = new Request('http://localhost/api-tokens', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const mockCtx = createMockContext();

      const newApiToken: NewApiToken = {
        id: mockTokenId,
        name: mockTokenName,
        hashedToken: mockHashedToken, // Service returns this, but controller returns plain text
        userId: mockUserId,
        createdAt: mockCreatedAt,
        token: mockPlainTextToken, // This is included in the response
      };
      mockGenerateApiToken.mockResolvedValue(newApiToken);

      const response = await createApiTokenHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      expect(ApiTokenService.generateApiToken).toHaveBeenCalledWith(
        mockEnv.DB,
        mockUserId,
        requestBody,
      );
      expect(response.status).toBe(201);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('access-control-allow-origin')).toBe(DEFAULT_CORS_HEADERS['access-control-allow-origin']);
      expect(responseBody).toEqual(newApiToken); // Ensure plain text token is returned
    });

    it('should return 400 for invalid JSON body', async () => {
      const mockRequest = new Request('http://localhost/api-tokens', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });
      const mockCtx = createMockContext();

      const response = await createApiTokenHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Bad Request');
      expect(responseBody.message).toContain('Invalid JSON');
      expect(ApiTokenService.generateApiToken).not.toHaveBeenCalled();
    });

     it('should return 400 for missing token name', async () => {
      const requestBody = { name: ' ' }; // Invalid name
      const mockRequest = new Request('http://localhost/api-tokens', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const mockCtx = createMockContext();

      // Mock the service to throw the validation error (though controller also validates)
       mockGenerateApiToken.mockRejectedValue(new Error('Invalid API token input: Name is required.'));


      const response = await createApiTokenHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      // The controller's own validation should catch this before calling the service in this case
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Bad Request');
      expect(responseBody.message).toContain('Invalid input: Token name is required');
      expect(ApiTokenService.generateApiToken).not.toHaveBeenCalled();
    });

    it('should return 401 if user ID is not found in context', async () => {
        const requestBody = { name: mockTokenName };
        const mockRequest = new Request('http://localhost/api-tokens', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: { 'Content-Type': 'application/json' },
        });
        const mockCtx = createMockContext(null); // No user in context

        const response = await createApiTokenHandler(mockRequest, mockEnv, mockCtx);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody.error).toBe('Unauthorized');
        expect(ApiTokenService.generateApiToken).not.toHaveBeenCalled();
    });

    it('should return 500 if service throws an unexpected error', async () => {
       const requestBody = { name: mockTokenName };
       const mockRequest = new Request('http://localhost/api-tokens', {
         method: 'POST',
         body: JSON.stringify(requestBody),
         headers: { 'Content-Type': 'application/json' },
       });
       const mockCtx = createMockContext();
       const errorMessage = 'Database connection failed';
       mockGenerateApiToken.mockRejectedValue(new Error(errorMessage));

       const response = await createApiTokenHandler(mockRequest, mockEnv, mockCtx);
       const responseBody = await response.json();

       expect(response.status).toBe(500);
       expect(responseBody.error).toBe('Internal Server Error');
       expect(responseBody.message).toBe(errorMessage);
       expect(ApiTokenService.generateApiToken).toHaveBeenCalledOnce();
    });
  });

  // --- getUserApiTokensHandler ---
  describe('getUserApiTokensHandler', () => {
    it('should return a list of tokens and status 200', async () => {
      const mockRequest = new Request('http://localhost/api-tokens', { method: 'GET' });
      const mockCtx = createMockContext();
      const mockTokens: ApiTokenInfo[] = [
        { id: 1, name: 'Token 1', userId: mockUserId, createdAt: mockCreatedAt },
        { id: 2, name: 'Token 2', userId: mockUserId, createdAt: mockCreatedAt },
      ];
      mockGetUserApiTokens.mockResolvedValue(mockTokens);

      const response = await getUserApiTokensHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      expect(ApiTokenService.getUserApiTokens).toHaveBeenCalledWith(mockEnv.DB, mockUserId);
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockTokens);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('content-range')).toBe(`apitokens 0-${mockTokens.length}/${mockTokens.length}`);
      expect(response.headers.get('x-total-count')).toBe(`${mockTokens.length}`);
    });

    it('should return an empty list and status 200 if no tokens found', async () => {
      const mockRequest = new Request('http://localhost/api-tokens', { method: 'GET' });
      const mockCtx = createMockContext();
      mockGetUserApiTokens.mockResolvedValue([]); // Service returns empty array

      const response = await getUserApiTokensHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      expect(ApiTokenService.getUserApiTokens).toHaveBeenCalledWith(mockEnv.DB, mockUserId);
      expect(response.status).toBe(200);
      expect(responseBody).toEqual([]);
      expect(response.headers.get('content-range')).toBe(`apitokens 0-0/0`);
       expect(response.headers.get('x-total-count')).toBe(`0`);
    });

     it('should return 401 if user ID is not found in context', async () => {
        const mockRequest = new Request('http://localhost/api-tokens', { method: 'GET' });
        const mockCtx = createMockContext(null); // No user

        const response = await getUserApiTokensHandler(mockRequest, mockEnv, mockCtx);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody.error).toBe('Unauthorized');
        expect(ApiTokenService.getUserApiTokens).not.toHaveBeenCalled();
    });

     it('should return 500 if service throws an error', async () => {
      const mockRequest = new Request('http://localhost/api-tokens', { method: 'GET' });
      const mockCtx = createMockContext();
      const errorMessage = 'Failed to query database';
      mockGetUserApiTokens.mockRejectedValue(new Error(errorMessage));

      const response = await getUserApiTokensHandler(mockRequest, mockEnv, mockCtx);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('Internal Server Error');
       expect(responseBody.message).toBe('Failed to retrieve API tokens.'); // Controller's generic message
      expect(ApiTokenService.getUserApiTokens).toHaveBeenCalledOnce();
    });
  });

  // --- deleteApiTokenHandler ---
  describe('deleteApiTokenHandler', () => {
    it('should delete a token and return 200 with the deleted ID', async () => {
      const mockRequest = new Request(`http://localhost/api-tokens/${mockTokenId}`, { method: 'DELETE' });
      const mockCtx = createMockContext();
      mockDeleteApiToken.mockResolvedValue(true); // Service confirms deletion

      const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, mockTokenId);
      const responseBody = await response.json();

      expect(ApiTokenService.deleteApiToken).toHaveBeenCalledWith(mockEnv.DB, mockUserId, mockTokenId);
      expect(response.status).toBe(200);
      expect(responseBody).toEqual({ id: mockTokenId }); // react-admin expects the deleted record/id
       expect(response.headers.get('access-control-allow-origin')).toBe(DEFAULT_CORS_HEADERS['access-control-allow-origin']);
    });

    it('should return 404 if service indicates token not found or not owned', async () => {
      const mockRequest = new Request(`http://localhost/api-tokens/${mockTokenId}`, { method: 'DELETE' });
      const mockCtx = createMockContext();
      mockDeleteApiToken.mockResolvedValue(false); // Service indicates deletion failed (not found/owned)

      const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, mockTokenId);
      const responseBody = await response.json();

      expect(ApiTokenService.deleteApiToken).toHaveBeenCalledWith(mockEnv.DB, mockUserId, mockTokenId);
      expect(response.status).toBe(404);
      expect(responseBody.error).toBe('Not Found');
      expect(responseBody.message).toContain('API Token not found or you do not have permission');
    });

     it('should return 400 for invalid token ID (NaN)', async () => {
        const invalidTokenId = NaN;
        const mockRequest = new Request(`http://localhost/api-tokens/abc`, { method: 'DELETE' }); // URL reflects invalid ID
        const mockCtx = createMockContext();

        const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, invalidTokenId);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toContain('Invalid Token ID');
        expect(ApiTokenService.deleteApiToken).not.toHaveBeenCalled();
    });

     it('should return 400 for invalid token ID (zero)', async () => {
        const invalidTokenId = 0;
        const mockRequest = new Request(`http://localhost/api-tokens/0`, { method: 'DELETE' });
        const mockCtx = createMockContext();

        const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, invalidTokenId);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
         expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toContain('Invalid Token ID');
        expect(ApiTokenService.deleteApiToken).not.toHaveBeenCalled();
    });

     it('should return 401 if user ID is not found in context', async () => {
        const mockRequest = new Request(`http://localhost/api-tokens/${mockTokenId}`, { method: 'DELETE' });
        const mockCtx = createMockContext(null); // No user

        const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, mockTokenId);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody.error).toBe('Unauthorized');
        expect(ApiTokenService.deleteApiToken).not.toHaveBeenCalled();
    });

    it('should return 500 if service throws an unexpected error', async () => {
      const mockRequest = new Request(`http://localhost/api-tokens/${mockTokenId}`, { method: 'DELETE' });
      const mockCtx = createMockContext();
      const errorMessage = 'Database error during delete';
      mockDeleteApiToken.mockRejectedValue(new Error(errorMessage));

      const response = await deleteApiTokenHandler(mockRequest, mockEnv, mockCtx, mockTokenId);
      const responseBody = await response.json();

      expect(ApiTokenService.deleteApiToken).toHaveBeenCalledWith(mockEnv.DB, mockUserId, mockTokenId);
      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('Internal Server Error');
      expect(responseBody.message).toBe('Failed to delete API token.'); // Controller's generic message
    });
  });
});
