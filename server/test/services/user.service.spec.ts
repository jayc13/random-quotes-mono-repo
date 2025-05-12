import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { D1Database, D1Result } from '@cloudflare/workers-types';
import * as userService from '../../src/services/user.service'; // Adjusted path
import type { NamePartsRequestBody } from '../../src/services/user.service'; // Adjusted path

// Mock D1Database
const mockExec = vi.fn();
const mockPrepare = vi.fn();
const mockBind = vi.fn();
const mockRun = vi.fn();
const mockFirst = vi.fn();
const mockAll = vi.fn();

const mockD1 = {
  prepare: mockPrepare,
  exec: mockExec,
  dump: async () => new ArrayBuffer(0), // Placeholder for dump
  batch: async () => [] as D1Result[], // Placeholder for batch
} as unknown as D1Database;

beforeEach(() => {
  vi.resetAllMocks();
  mockPrepare.mockReturnValue({ bind: mockBind });
  mockBind.mockReturnValue({ run: mockRun, first: mockFirst, all: mockAll });
});

describe('User Service', () => {
  describe('updateUserName', () => {
    it('should successfully update user name parts', async () => {
      mockRun.mockResolvedValueOnce({ success: true, meta: {} } as D1Result);
      const nameParts: NamePartsRequestBody = { given_name: 'Test', family_name: 'User' };
      const result = await userService.updateUserName(mockD1, 'user123', nameParts);
      expect(result).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Users SET GivenName = ?, FamilyName = ? WHERE Auth0UserId = ?'));
      expect(mockBind).toHaveBeenCalledWith('Test', 'User', 'user123');
    });

    it('should return false if no name parts are provided', async () => {
      const result = await userService.updateUserName(mockD1, 'user123', {});
      expect(result).toBe(false);
      expect(mockPrepare).not.toHaveBeenCalled();
    });

    it('should handle D1 errors during update', async () => {
      mockRun.mockRejectedValueOnce(new Error('D1 error'));
      const nameParts: NamePartsRequestBody = { given_name: 'Test' };
      const result = await userService.updateUserName(mockD1, 'user123', nameParts);
      expect(result).toBe(false);
    });
     it('should log warning if Users table does not exist and return false', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      mockRun.mockRejectedValueOnce(new Error('no such table: Users'));
      const nameParts: NamePartsRequestBody = { given_name: 'Test' };
      const result = await userService.updateUserName(mockD1, 'user123', nameParts);
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Table 'Users' does not exist"));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('sendForgotPasswordEmail', () => {
    it('should simulate sending an email and return true', async () => {
      // Service currently just logs and returns true
      const consoleLogSpy = vi.spyOn(console, 'log');
      const result = await userService.sendForgotPasswordEmail(mockD1, 'test@example.com');
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('Simulating sending password reset email to: test@example.com');
      consoleLogSpy.mockRestore();
    });

    it('should return false if no email is provided', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const result = await userService.sendForgotPasswordEmail(mockD1, '');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('sendForgotPasswordEmail: No email provided.');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteUserAccount', () => {
    it('should successfully delete user account and their API tokens', async () => {
      // Mock successful deletion of API tokens
      mockRun.mockResolvedValueOnce({ success: true, meta: { changes: 1 } } as D1Result); // For ApiTokens deletion
      // Mock successful deletion from Users table
      mockRun.mockResolvedValueOnce({ success: true, meta: { changes: 1 } } as D1Result); // For Users table deletion

      const consoleLogSpy = vi.spyOn(console, 'log');
      const result = await userService.deleteUserAccount(mockD1, 'user123');

      expect(result).toBe(true);
      // Check ApiTokens deletion
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM ApiTokens WHERE UserId = ?'));
      expect(mockBind).toHaveBeenCalledWith('user123');
      // Check Users table deletion
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM Users WHERE Auth0UserId = ?'));
      expect(mockBind).toHaveBeenCalledWith('user123');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('User account deletion process completed for userId: user123'));
      consoleLogSpy.mockRestore();
    });

    it('should return false if userId is not provided', async () => {
       const consoleErrorSpy = vi.spyOn(console, 'error');
      const result = await userService.deleteUserAccount(mockD1, '');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('deleteUserAccount: No userId provided.');
      consoleErrorSpy.mockRestore();
    });

    it('should handle errors during API token deletion but still attempt user deletion (simulated)', async () => {
      mockRun.mockRejectedValueOnce(new Error('D1 error deleting tokens')); // Error for ApiTokens
      mockRun.mockResolvedValueOnce({ success: true, meta: { changes: 1 } } as D1Result); // Success for Users table

      const consoleErrorSpy = vi.spyOn(console, 'error');
      const result = await userService.deleteUserAccount(mockD1, 'user123');

      expect(result).toBe(true); // Still true due to Auth0 simulation being primary
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error deleting API tokens for user user123 from D1:'));
      // Ensure Users table deletion was still attempted
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM Users WHERE Auth0UserId = ?'));
      consoleErrorSpy.mockRestore();
    });

    it('should handle errors during local Users table deletion', async () => {
      mockRun.mockResolvedValueOnce({ success: true, meta: { changes: 1 } } as D1Result); // Success for ApiTokens
      mockRun.mockRejectedValueOnce(new Error('D1 error deleting from Users table')); // Error for Users table

      const consoleErrorSpy = vi.spyOn(console, 'error');
      const result = await userService.deleteUserAccount(mockD1, 'user123');
      expect(result).toBe(true); // Still true
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Error deleting user user123 from local 'Users' table:"));
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getUserById', () => {
    it('should return user data if found', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', name: 'Test User' };
      mockFirst.mockResolvedValueOnce(mockUser);
      const user = await userService.getUserById(mockD1, 'user123');
      expect(user).toEqual(mockUser);
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('SELECT Auth0UserId as id, Email, GivenName, FamilyName, Nickname, FullName as name FROM Users WHERE Auth0UserId = ?'));
      expect(mockBind).toHaveBeenCalledWith('user123');
    });

    it('should return null if user not found', async () => {
      mockFirst.mockResolvedValueOnce(null);
      const user = await userService.getUserById(mockD1, 'user404');
      expect(user).toBeNull();
    });

    it('should return null and log warning if Users table does not exist', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      mockFirst.mockRejectedValueOnce(new Error('no such table: Users'));
      const user = await userService.getUserById(mockD1, 'user123');
      expect(user).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Table 'Users' does not exist. Cannot fetch user."));
      consoleWarnSpy.mockRestore();
    });
  });
});
