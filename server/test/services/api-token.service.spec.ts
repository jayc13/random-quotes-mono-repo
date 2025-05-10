import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateApiToken,
  deleteApiToken,
  getUserApiTokens,
  validateApiTokenInput,
  validateApiToken,
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

// Helper to check ISO 8601 format
const isValidISO8601 = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return regex.test(dateString);
};

// Helper function to get expected ISO string for date comparisons
const getExpectedExpiresAtISO = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

describe('API Token Service', () => {
  const userId = 'auth0|user123';
  const tokenName = 'Test Token';
  const tokenId = 1;
  // Use a fixed date for predictable CreatedAt and ExpiresAt comparisons
  const fixedCurrentDate = new Date('2024-01-01T12:00:00.000Z');
  const fakeCreatedAt = fixedCurrentDate.toISOString();
  const plainTextToken = 'qtk_plainTextToken123';
  const fakeHashedToken = '6861736865645f746f6b656e5f76616c7565';


  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedCurrentDate);

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
     vi.useRealTimers(); // Restore real timers
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
    const defaultInput: ApiTokenInput = { name: tokenName };

    beforeEach(() => {
      mockRun.mockResolvedValue({ success: true, meta: { last_row_id: tokenId } });
    });

    it('should generate, hash, store, and return a new token with default 90-day expiration', async () => {
      const result = await generateApiToken(mockDb, userId, defaultInput);
      const expectedExpiresAt = new Date(fixedCurrentDate);
      expectedExpiresAt.setDate(fixedCurrentDate.getDate() + 90);

      expect(mockDigest).toHaveBeenCalledOnce();
      expect(mockPrepare).toHaveBeenCalledWith(
        'INSERT INTO ApiTokens (TokenName, HashedToken, UserId, CreatedAt, ExpiresAt) VALUES (?, ?, ?, ?, ?)',
      );
      const bindArgs = mockBind.mock.calls[0];
      expect(bindArgs[0]).toBe(tokenName);
      expect(bindArgs[1]).toBe(fakeHashedToken);
      expect(bindArgs[2]).toBe(userId);
      expect(isValidISO8601(bindArgs[3])).toBe(true); // CreatedAt
      expect(new Date(bindArgs[3]).toISOString()).toBe(fakeCreatedAt);
      expect(isValidISO8601(bindArgs[4])).toBe(true); // ExpiresAt
      expect(new Date(bindArgs[4]).toDateString()).toBe(expectedExpiresAt.toDateString());
      expect(mockRun).toHaveBeenCalledOnce();

      expect(result.id).toBe(tokenId);
      expect(result.name).toBe(tokenName);
      expect(result.userId).toBe(userId);
      expect(result.createdAt).toBe(fakeCreatedAt);
      expect(result.token.startsWith('qtk_')).toBe(true);
      expect(result.expiresAt).toBeDefined();
      expect(isValidISO8601(result.expiresAt)).toBe(true);
      expect(new Date(result.expiresAt!).toDateString()).toBe(expectedExpiresAt.toDateString());
    });

    const durationTestCases = [
      { duration: '1 day', days: 1 },
      { duration: '1 week', days: 7 },
      { duration: '30 days', days: 30 },
      { duration: '60 days', days: 60 },
      { duration: '90 days', days: 90 },
    ];

    durationTestCases.forEach(({ duration, days }) => {
      it(`should correctly calculate expiresAt for "${duration}"`, async () => {
        const input: ApiTokenInput = { name: tokenName, duration };
        const result = await generateApiToken(mockDb, userId, input);
        const expectedExpiresAt = new Date(fixedCurrentDate);
        expectedExpiresAt.setDate(fixedCurrentDate.getDate() + days);

        const bindArgs = mockBind.mock.calls[0];
        expect(isValidISO8601(bindArgs[4])).toBe(true);
        expect(new Date(bindArgs[4]).toDateString()).toBe(expectedExpiresAt.toDateString());
        expect(isValidISO8601(result.expiresAt)).toBe(true);
        expect(new Date(result.expiresAt!).toDateString()).toBe(expectedExpiresAt.toDateString());
      });
    });

    it('should default to 90 days for an invalid duration string', async () => {
      const input: ApiTokenInput = { name: tokenName, duration: 'invalid duration' };
      const result = await generateApiToken(mockDb, userId, input);
      const expectedExpiresAt = new Date(fixedCurrentDate);
      expectedExpiresAt.setDate(fixedCurrentDate.getDate() + 90);

      const bindArgs = mockBind.mock.calls[0];
      expect(isValidISO8601(bindArgs[4])).toBe(true);
      expect(new Date(bindArgs[4]).toDateString()).toBe(expectedExpiresAt.toDateString());
      expect(isValidISO8601(result.expiresAt)).toBe(true);
      expect(new Date(result.expiresAt!).toDateString()).toBe(expectedExpiresAt.toDateString());
    });


    it('should throw error for invalid input (e.g., empty name)', async () => {
       const invalidInput: ApiTokenInput = { name: ' ' };
       await expect(generateApiToken(mockDb, userId, invalidInput))
           .rejects.toThrow('Invalid API token input: Name is required.');
       expect(mockPrepare).not.toHaveBeenCalled();
    });

     it('should throw error if database insert fails to return ID', async () => {
      mockRun.mockResolvedValue({ success: true, meta: { last_row_id: null } });
      await expect(generateApiToken(mockDb, userId, defaultInput))
        .rejects.toThrow('Failed to create API token: Could not retrieve last row ID.');
      expect(mockPrepare).toHaveBeenCalledOnce(); // Still tries to insert
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
    it('should return a list of user tokens including expiresAt', async () => {
      const futureExpiresAt = getExpectedExpiresAtISO(30);
      const pastExpiresAt = getExpectedExpiresAtISO(-30);

      const mockTokenRecords = [
        { TokenId: 1, TokenName: 'Token 1', HashedToken: 'hash1', UserId: userId, CreatedAt: fakeCreatedAt, ExpiresAt: futureExpiresAt },
        { TokenId: 2, TokenName: 'Token 2', HashedToken: 'hash2', UserId: userId, CreatedAt: fakeCreatedAt, ExpiresAt: pastExpiresAt },
        { TokenId: 3, TokenName: 'Token 3', HashedToken: 'hash3', UserId: userId, CreatedAt: fakeCreatedAt, ExpiresAt: null }, // Token with null ExpiresAt
      ];
      mockAll.mockResolvedValue({ results: mockTokenRecords });

      const result = await getUserApiTokens(mockDb, userId);

      expect(mockPrepare).toHaveBeenCalledWith(
        'SELECT TokenId, TokenName, UserId, CreatedAt, ExpiresAt FROM ApiTokens WHERE UserId = ? ORDER BY CreatedAt DESC',
      );
      expect(mockBind).toHaveBeenCalledWith(userId);
      expect(mockAll).toHaveBeenCalledOnce();

      expect(result.length).toBe(3);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Token 1',
        userId: userId,
        createdAt: fakeCreatedAt,
        expiresAt: futureExpiresAt,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Token 2',
        userId: userId,
        createdAt: fakeCreatedAt,
        expiresAt: pastExpiresAt,
      });
      expect(result[2]).toEqual({
        id: 3,
        name: 'Token 3',
        userId: userId,
        createdAt: fakeCreatedAt,
        expiresAt: null, // Ensure null is passed through
      });
      expect(result[0]).not.toHaveProperty('HashedToken');
    });

    // Other getUserApiTokens tests (empty array, null results) remain similar but ensure ExpiresAt is handled if columns are returned
     it('should return an empty array if user has no tokens', async () => {
      mockAll.mockResolvedValue({ results: [] });
      const result = await getUserApiTokens(mockDb, userId);
      expect(result.length).toBe(0);
    });
  });

  describe('validateApiToken', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    beforeEach(() => {
        consoleWarnSpy.mockClear();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it('should return true for a valid, non-expired token', async () => {
      const futureExpiresAt = getExpectedExpiresAtISO(10); // Expires in 10 days
      mockFirst.mockResolvedValue({ TokenId: tokenId, ExpiresAt: futureExpiresAt });

      const isValid = await validateApiToken(plainTextToken, mockDb);

      expect(mockDigest).toHaveBeenCalledOnce();
      expect(mockPrepare).toHaveBeenCalledWith('SELECT TokenId, ExpiresAt FROM ApiTokens WHERE HashedToken = ?');
      expect(mockFirst).toHaveBeenCalledOnce();
      expect(isValid).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return false for an expired token', async () => {
      const pastExpiresAt = getExpectedExpiresAtISO(-10); // Expired 10 days ago
      mockFirst.mockResolvedValue({ TokenId: tokenId, ExpiresAt: pastExpiresAt });

      const isValid = await validateApiToken(plainTextToken, mockDb);

      expect(isValid).toBe(false);
      expect(mockPrepare).toHaveBeenCalledWith('SELECT TokenId, ExpiresAt FROM ApiTokens WHERE HashedToken = ?');
      expect(consoleWarnSpy).toHaveBeenCalledWith(`validateApiToken: Token ID ${tokenId} has expired.`);
    });

    it('should return true for a token with null ExpiresAt (if hash matches)', async () => {
      // This scenario assumes a token somehow exists in DB without an ExpiresAt,
      // or ExpiresAt is explicitly null. The current service logic always sets it.
      mockFirst.mockResolvedValue({ TokenId: tokenId, ExpiresAt: null });

      const isValid = await validateApiToken(plainTextToken, mockDb);
      expect(isValid).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith('SELECT TokenId, ExpiresAt FROM ApiTokens WHERE HashedToken = ?');
      expect(consoleWarnSpy).not.toHaveBeenCalled(); // No expiry warning
    });
    
    it('should return true for a token with undefined ExpiresAt (if hash matches)', async () => {
      // Similar to null, testing resilience.
      mockFirst.mockResolvedValue({ TokenId: tokenId, ExpiresAt: undefined });

      const isValid = await validateApiToken(plainTextToken, mockDb);
      expect(isValid).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith('SELECT TokenId, ExpiresAt FROM ApiTokens WHERE HashedToken = ?');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });


    it('should return false for an invalid token (not found in DB)', async () => {
      mockFirst.mockResolvedValue(undefined);
      const isValid = await validateApiToken(plainTextToken, mockDb);
      expect(isValid).toBe(false);
      expect(mockPrepare).toHaveBeenCalledWith('SELECT TokenId, ExpiresAt FROM ApiTokens WHERE HashedToken = ?');
    });

    it('should return false for an empty token string and not call DB', async () => {
      const isValid = await validateApiToken('', mockDb);
      expect(isValid).toBe(false);
      expect(mockDigest).not.toHaveBeenCalled();
      expect(mockPrepare).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith("validateApiToken: Attempted to validate an empty or invalid token string.");
    });

    // Other tests for validateApiToken (empty/null/undefined token, hashing fails, DB query fails) remain largely the same.
    // Ensure they still pass and that mockPrepare uses the updated SQL if it gets that far.

    it('should return false and log error if hashing fails', async () => {
        mockDigest.mockRejectedValue(new Error('Hashing failed'));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const isValid = await validateApiToken(plainTextToken, mockDb);
        expect(isValid).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith("validateApiToken: Error during token validation:", expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
  });
});
