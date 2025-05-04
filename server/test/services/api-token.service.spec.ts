import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateApiToken,
  deleteApiToken,
  getUserApiTokens,
  validateApiTokenInput,
} from '@/services/api-token.service';
import type { ApiTokenInput } from '@/types/api-token.types';

// Mock D1Database
const mockRun = vi.fn();
const mockAll = vi.fn();
const mockFirst = vi.fn();
const mockBind = vi.fn(() => ({
  run: mockRun,
  all: mockAll,
  first: mockFirst,
}));
const mockPrepare = vi.fn(() => ({
  bind: mockBind,
}));
const mockDb = {
  prepare: mockPrepare,
} as unknown as D1Database; // Type assertion for mocking

// Mock crypto.subtle.digest
const mockDigest = vi.fn();
const originalCrypto = globalThis.crypto; // Store original crypto

describe('API Token Service', () => {
  const userId = 'auth0|user123';
  const tokenName = 'Test Token';
  const tokenId = 1;
  const fakeHashedToken = 'hashed_token_value';
  const fakeCreatedAt = new Date().toISOString();

  beforeEach(() => {
    // Setup crypto mock before each test
    globalThis.crypto = {
        ...originalCrypto, // Keep other crypto properties if needed
        subtle: {
            ...originalCrypto?.subtle,
            digest: mockDigest,
        },
        // Simple mock for random token generation if needed, or rely on format check
        randomUUID: () => 'mock-random-uuid-part', // Example if UUID is used
    } as Crypto;

    mockDigest.mockResolvedValue(new TextEncoder().encode(fakeHashedToken).buffer); // Mock digest to return a fixed hash buffer

    // Reset mocks
    mockRun.mockClear();
    mockAll.mockClear();
    mockFirst.mockClear();
    mockBind.mockClear();
    mockPrepare.mockClear();
    mockDigest.mockClear();
  });

  afterEach(() => {
     // Restore original crypto object
     globalThis.crypto = originalCrypto;
     vi.restoreAllMocks(); // Restore any other vi mocks
  });

  // --- validateApiTokenInput ---
  describe('validateApiTokenInput', () => {
    it('should return true for valid input', () => {
      expect(validateApiTokenInput({ name: 'Valid Name' })).toBe(true);
    });
    it('should return false for empty name', () => {
      expect(validateApiTokenInput({ name: '' })).toBe(false);
    });
     it('should return false for name with only whitespace', () => {
      expect(validateApiTokenInput({ name: '   ' })).toBe(false);
    });
    it('should return false for missing name property', () => {
        expect(validateApiTokenInput({} as ApiTokenInput)).toBe(false);
    });
    it('should return false for null input', () => {
        expect(validateApiTokenInput(null as any)).toBe(false);
    });
     it('should return false for undefined input', () => {
        expect(validateApiTokenInput(undefined as any)).toBe(false);
    });
  });

  // --- generateApiToken ---
  describe('generateApiToken', () => {
    it('should generate, hash, store, and return a new token', async () => {
      const input: ApiTokenInput = { name: tokenName };
      // Mock successful insert returning the last row ID
      mockRun.mockResolvedValue({ success: true, meta: { last_row_id: tokenId } });

      const result = await generateApiToken(mockDb, userId, input);

      // Check hashing was called
      expect(mockDigest).toHaveBeenCalledOnce();
      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array)); // Verify algorithm and data type

      // Check database insert
      expect(mockPrepare).toHaveBeenCalledWith(
        'INSERT INTO ApiTokens (TokenName, HashedToken, UserId, CreatedAt) VALUES (?, ?, ?, ?)',
      );
      expect(mockRun).toHaveBeenCalledOnce();

      // Check result structure
      expect(result).toBeDefined();
      expect(result.id).toBe(tokenId);
      expect(result.name).toBe(tokenName);
      expect(result.userId).toBe(userId);
      expect(result.createdAt).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.token.startsWith('qtk_')).toBe(true); // Check prefix
      expect(result.token.length).toBeGreaterThan(32); // Check reasonable length
    });

    it('should throw error for invalid input', async () => {
       const invalidInput: ApiTokenInput = { name: ' ' }; // Invalid name
       await expect(generateApiToken(mockDb, userId, invalidInput))
           .rejects.toThrow('Invalid API token input: Name is required.');
       expect(mockPrepare).not.toHaveBeenCalled(); // Ensure DB wasn't touched
    });

     it('should throw error if database insert fails to return ID', async () => {
      const input: ApiTokenInput = { name: tokenName };
      // Simulate DB returning no last_row_id
      mockRun.mockResolvedValue({ success: true, meta: { last_row_id: null } });

      await expect(generateApiToken(mockDb, userId, input))
        .rejects.toThrow('Failed to create API token: Could not retrieve last row ID.');

      // Ensure it still tried to insert
      expect(mockPrepare).toHaveBeenCalledOnce();
      expect(mockBind).toHaveBeenCalledOnce();
      expect(mockRun).toHaveBeenCalledOnce();
    });
  });

  // --- deleteApiToken ---
  describe('deleteApiToken', () => {
    it('should delete a token successfully if found and owned by user', async () => {
      // Mock finding the token
      mockFirst.mockResolvedValue({ TokenId: tokenId });
      // Mock successful delete
      mockRun.mockResolvedValue({ success: true });

      const result = await deleteApiToken(mockDb, userId, tokenId);

      // Check token existence/ownership query
      expect(mockPrepare).toHaveBeenCalledWith(
         'SELECT TokenId FROM ApiTokens WHERE TokenId = ? AND UserId = ?'
      );
      expect(mockBind).toHaveBeenCalledWith(tokenId, userId);
      expect(mockFirst).toHaveBeenCalledOnce();

      // Check delete query
      expect(mockPrepare).toHaveBeenCalledWith(
        'DELETE FROM ApiTokens WHERE TokenId = ? AND UserId = ?',
      );
      expect(mockBind).toHaveBeenCalledWith(tokenId, userId);
      expect(mockRun).toHaveBeenCalledOnce(); // Called for the delete operation

      expect(result).toBe(true);
    });

    it('should return false if token is not found', async () => {
      // Mock not finding the token
      mockFirst.mockResolvedValue(undefined); // Or null, depending on D1 behavior

      const result = await deleteApiToken(mockDb, userId, 999); // Non-existent ID

      // Check token existence/ownership query
      expect(mockPrepare).toHaveBeenCalledWith(
         'SELECT TokenId FROM ApiTokens WHERE TokenId = ? AND UserId = ?'
      );
      expect(mockBind).toHaveBeenCalledWith(999, userId);
      expect(mockFirst).toHaveBeenCalledOnce();

      // Ensure delete query was NOT called
      expect(mockRun).not.toHaveBeenCalled();

      expect(result).toBe(false);
    });

    it('should return false if token belongs to another user', async () => {
      const otherUserId = 'auth0|otheruser';
      // Mock finding the token, but the service call uses the correct userId
      mockFirst.mockResolvedValue(undefined); // Simulate the WHERE clause filtering it out

      const result = await deleteApiToken(mockDb, userId, tokenId);

      // Check token existence/ownership query with the correct user ID
      expect(mockPrepare).toHaveBeenCalledWith(
         'SELECT TokenId FROM ApiTokens WHERE TokenId = ? AND UserId = ?'
      );
      expect(mockBind).toHaveBeenCalledWith(tokenId, userId);
      expect(mockFirst).toHaveBeenCalledOnce();

      // Ensure delete query was NOT called
      expect(mockRun).not.toHaveBeenCalled();

      expect(result).toBe(false);
    });
  });

  // --- getUserApiTokens ---
  describe('getUserApiTokens', () => {
    it('should return a list of user tokens without hashes', async () => {
      const mockTokenRecords = [
        { TokenId: 1, TokenName: 'Token 1', HashedToken: 'hash1', UserId: userId, CreatedAt: fakeCreatedAt },
        { TokenId: 2, TokenName: 'Token 2', HashedToken: 'hash2', UserId: userId, CreatedAt: fakeCreatedAt },
      ];
      // Mock successful select returning records
      mockAll.mockResolvedValue({ results: mockTokenRecords });

      const result = await getUserApiTokens(mockDb, userId);

      // Check database select query
      expect(mockPrepare).toHaveBeenCalledWith(
        'SELECT TokenId, TokenName, UserId, CreatedAt FROM ApiTokens WHERE UserId = ? ORDER BY CreatedAt DESC',
      );
      expect(mockBind).toHaveBeenCalledWith(userId);
      expect(mockAll).toHaveBeenCalledOnce();

      // Check result structure and content
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Token 1',
        userId: userId,
        createdAt: fakeCreatedAt,
      });
       expect(result[1]).toEqual({
        id: 2,
        name: 'Token 2',
        userId: userId,
        createdAt: fakeCreatedAt,
      });
      // Ensure hashedToken is NOT present
      expect(result[0]).not.toHaveProperty('hashedToken');
      expect(result[0]).not.toHaveProperty('HashedToken'); // Check backend field name too
      expect(result[0]).not.toHaveProperty('TokenId'); // Check backend field name is mapped
    });

     it('should return an empty array if user has no tokens', async () => {
      // Mock database returning no results
      mockAll.mockResolvedValue({ results: [] });

      const result = await getUserApiTokens(mockDb, userId);

      expect(mockPrepare).toHaveBeenCalledOnce();
      expect(mockBind).toHaveBeenCalledWith(userId);
      expect(mockAll).toHaveBeenCalledOnce();

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

     it('should return an empty array if database results are null/undefined', async () => {
      // Mock database returning null or undefined results
      mockAll.mockResolvedValue({ results: null }); // Or undefined

      const result = await getUserApiTokens(mockDb, userId);

      expect(mockPrepare).toHaveBeenCalledOnce();
      expect(mockBind).toHaveBeenCalledWith(userId);
      expect(mockAll).toHaveBeenCalledOnce();

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
});
