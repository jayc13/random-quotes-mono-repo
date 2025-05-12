import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userController from '../../src/controllers/user.controller';
import * as userService from '../../src/services/user.service';
import type { NamePartsRequestBody } from '../../src/services/user.service';
import type { Env } from '../../src/types/env.types'; 
// itty-router json and error are used by the controller, but we test the Response object directly.

// Mock the userService using the path from the instructions
vi.mock('../../src/services/user.service', () => ({
  updateUserName: vi.fn(),
  sendForgotPasswordEmail: vi.fn(),
  deleteUserAccount: vi.fn(),
  getUserById: vi.fn(), 
}));

// Define mock request, env, and ctx objects as per instructions
const mockRequest = (body: any = null, props: any = {}) => ({
  json: async () => {
    // Specific check for the "invalid json" test case
    if (body === "invalid json") {
      throw new Error("Invalid JSON");
    }
    return body;
  },
  props: props,
  url: 'http://localhost/test',
  method: 'POST', // Default method
  headers: new Headers(),
  cf: {}, // Cloudflare-specific properties
  signal: new AbortController().signal,
  arrayBuffer: async () => new ArrayBuffer(0),
  formData: async () => new FormData(),
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  clone: () => ({ ...mockRequest(body, props) }), // Basic clone
} as any); // Typecast as any to simplify, ensure structure matches AuthenticatedRequest

const mockEnv = {
  DB: {} as any, // Mock D1 database dependency
} as Env;

const mockCtx = {} as ExecutionContext; // Mock ExecutionContext

describe('User Controller', () => {
  describe('updateUserNameHandler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully update user name and return 200', async () => {
      const requestBody: NamePartsRequestBody = { given_name: 'NewName' };
      const req = mockRequest(requestBody, { user: { sub: 'user123' } });
      vi.mocked(userService.updateUserName).mockResolvedValueOnce(true);

      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();

      expect(userService.updateUserName).toHaveBeenCalledWith(mockEnv.DB, 'user123', requestBody);
      expect(response.status).toBe(200);
      expect(respBody.success).toBe(true);
      expect(respBody.message).toContain('User name updated successfully');
    });

    it('should return 404 if user service fails to update', async () => {
      const requestBody: NamePartsRequestBody = { given_name: 'NewName' };
      const req = mockRequest(requestBody, { user: { sub: 'user123' } });
      vi.mocked(userService.updateUserName).mockResolvedValueOnce(false);

      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
            
      expect(response.status).toBe(404);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('User not found or update failed');
    });

    it('should return 401 if user ID is missing', async () => {
      const req = mockRequest({ given_name: 'NewName' }, { user: {} }); // No sub
      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(401);
      expect(respBody.error).toContain('Unauthorized. User ID not found.');
    });
          
    it('should return 400 if request body is invalid', async () => {
      const req = mockRequest("invalid json", { user: { sub: 'user123' } });
      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(400);
      expect(respBody.error).toContain('Invalid request body');
    });

    it('should return 400 if no valid name parts are provided', async () => {
      const req = mockRequest({ invalid_part: 'some_value' }, { user: { sub: 'user123' } });
      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(400);
      expect(respBody.error).toContain('Invalid request body. At least one valid name part');
    });

    it('should return 500 for unexpected errors during update', async () => {
      const requestBody: NamePartsRequestBody = { given_name: 'NewName' };
      const req = mockRequest(requestBody, { user: { sub: 'user123' } });
      vi.mocked(userService.updateUserName).mockRejectedValueOnce(new Error('Unexpected service error'));

      const response = await userController.updateUserNameHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
            
      expect(response.status).toBe(500);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('An unexpected error occurred');
    });
  });

  describe('sendForgotPasswordEmailHandler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully initiate password reset and return 200', async () => {
      const req = mockRequest(null, { user: { sub: 'user123', email: 'test@example.com' } });
      vi.mocked(userService.sendForgotPasswordEmail).mockResolvedValueOnce(true);

      const response = await userController.sendForgotPasswordEmailHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();

      expect(userService.sendForgotPasswordEmail).toHaveBeenCalledWith(mockEnv.DB, 'test@example.com');
      expect(response.status).toBe(200);
      expect(respBody.success).toBe(true);
      expect(respBody.message).toContain('password reset email has been sent');
    });

    it('should return 500 if service fails', async () => {
      const req = mockRequest(null, { user: { sub: 'user123', email: 'test@example.com' } });
      vi.mocked(userService.sendForgotPasswordEmail).mockResolvedValueOnce(false);
            
      const response = await userController.sendForgotPasswordEmailHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();

      expect(response.status).toBe(500);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('Failed to initiate password reset process.');
    });
          
    it('should return 401 if user ID is missing', async () => {
      const req = mockRequest(null, { user: { email: 'test@example.com' } }); // No sub
      const response = await userController.sendForgotPasswordEmailHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(401);
      expect(respBody.error).toContain('Unauthorized. User identifier not found.');
    });

    it('should return 400 if user email is missing from token', async () => {
      const req = mockRequest(null, { user: { sub: 'user123' } }); // No email
      const response = await userController.sendForgotPasswordEmailHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(400);
      expect(respBody.error).toContain('User email not found in token.');
    });

    it('should return 500 for unexpected errors during password reset', async () => {
      const req = mockRequest(null, { user: { sub: 'user123', email: 'test@example.com' } });
      vi.mocked(userService.sendForgotPasswordEmail).mockRejectedValueOnce(new Error('Unexpected service error'));

      const response = await userController.sendForgotPasswordEmailHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
            
      expect(response.status).toBe(500);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('An unexpected error occurred');
    });
  });

  describe('deleteUserAccountHandler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully delete user account and return 200', async () => {
      const req = mockRequest(null, { user: { sub: 'user123' } });
      vi.mocked(userService.deleteUserAccount).mockResolvedValueOnce(true);

      const response = await userController.deleteUserAccountHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();

      expect(userService.deleteUserAccount).toHaveBeenCalledWith(mockEnv.DB, 'user123');
      expect(response.status).toBe(200);
      expect(respBody.success).toBe(true);
      expect(respBody.message).toContain('User account user123 and associated API tokens have been successfully processed for deletion.');
    });

    it('should return 404 if service fails to delete', async () => {
      const req = mockRequest(null, { user: { sub: 'user123' } });
      vi.mocked(userService.deleteUserAccount).mockResolvedValueOnce(false);
            
      const response = await userController.deleteUserAccountHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();

      expect(response.status).toBe(404);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('User account deletion failed or user not found.');
    });

    it('should return 401 if user ID is missing', async () => {
      const req = mockRequest(null, { user: {} }); // No sub
      const response = await userController.deleteUserAccountHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
      expect(response.status).toBe(401);
      expect(respBody.error).toContain('Unauthorized. User ID not found.');
    });

    it('should return 500 for unexpected errors during account deletion', async () => {
      const req = mockRequest(null, { user: { sub: 'user123' } });
      vi.mocked(userService.deleteUserAccount).mockRejectedValueOnce(new Error('Unexpected service error'));

      const response = await userController.deleteUserAccountHandler(req, mockEnv, mockCtx);
      const respBody = await response.json();
            
      expect(response.status).toBe(500);
      expect(respBody.success).toBe(false);
      expect(respBody.error).toContain('An unexpected error occurred');
    });
  });
});