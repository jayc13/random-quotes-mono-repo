import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getRandomQuote} from '@/services/quote.service';

// Mock the D1Database
const mockDb = {
  prepare: vi.fn()
  // Add other methods if they are used directly in the service
} as unknown as D1Database;

// Mock D1QB instance methods - use vi.fn() for each method used by the service
const mockQbMethods = {
  fetchAll: vi.fn().mockReturnThis(),
  count: vi.fn().mockReturnThis(), // count returns QB, not the result directly
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  execute: vi.fn() // The final execute call that returns results
};

// Mock the D1QB constructor to return our mock instance
vi.mock('workers-qb', () => {
  const D1QB = vi.fn(() => mockQbMethods); // Alias QB as D1QB if your code uses D1QB
  return {D1QB};
});

const kv = {
  get: vi.fn(),
  put: vi.fn(),
} as unknown as KVNamespace;

const mockUserIp = '127.0.0.1';
const MOCK_DATE = '2023-10-01';

vi.mock('@/services/quote.service', () => ({
  getQuoteOfTheDay: vi.fn(),
  getRandomQuote: vi.fn(),
}));

vi.mock('@/services/translate.service', () => ({
  DEFAULT_LANG: 'en',
  translateText: vi.fn()
}));

describe('quote.service - Random Quote', () => {

  describe('getQuoteOfTheDayOrRandom', () => {

    beforeEach(() => {
      vi.clearAllMocks(); // Reset mocks before each test
      // Reset prepare mock specifically if needed, as it's heavily used
      mockDb.prepare.mockClear();
    });

    it('returns the cached quote of the day if it exists in KV', async () => {
      const mockQuoteId = '123';
      const mockQuote: Quote = {id: 123, quote: 'Cached Quote', author: 'Author', categoryId: 1};

      vi.mocked(kv.get).mockResolvedValueOnce(mockQuoteId);
      vi.mocked(getQuoteById).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`);
      expect(getQuoteById).toHaveBeenCalledWith(mockDb, 123, {lang: DEFAULT_LANG});
    });

    it('fetches a new quote of the day if no cached quote exists', async () => {
      const mockQuote: Quote = {id: 456, quote: 'New Quote', author: 'Author', categoryId: 2};

      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {lang: DEFAULT_LANG});
      expect(kv.put).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`, '456', {expirationTtl: 86400});
    });

    it('returns null if no cached quote exists and no new quote can be fetched', async () => {
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getRandomQuote).mockResolvedValueOnce(null);

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toBeNull();
      expect(kv.get).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {lang: DEFAULT_LANG});
      expect(kv.put).not.toHaveBeenCalled();
    });

    it('handles errors when caching the new quote of the day', async () => {
      const mockQuote: Quote = {id: 789, quote: 'Error Quote', author: 'Author', categoryId: 3};

      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);
      vi.mocked(kv.put).mockRejectedValueOnce(new Error('KV Error'));

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {lang: DEFAULT_LANG});
      expect(kv.put).toHaveBeenCalledWith(`qotd_${MOCK_DATE}`, '789', {expirationTtl: 86400});
    });

    it('handles failure when kv.get fails to retrieve user flag', async () => {
      vi.mocked(kv.get).mockRejectedValueOnce(new Error('KV Error'));
      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toBeNull();
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
    });

    it('falls back to random quote when getQuoteOfTheDay returns null', async () => {
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(null);
      vi.mocked(getRandomQuote).mockResolvedValueOnce({ id: 1, quote: 'Random Quote', author: 'Author', categoryId: 1 });

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toEqual({ id: 1, quote: 'Random Quote', author: 'Author', categoryId: 1 });
      expect(getQuoteOfTheDay).toHaveBeenCalled();
      expect(getRandomQuote).toHaveBeenCalled();
    });

    it('handles failure when kv.put fails to set user flag', async () => {
      const mockQuote = { id: 1, quote: 'Quote of the Day', author: 'Author', categoryId: 1 };
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(mockQuote);
      vi.mocked(kv.put).mockRejectedValueOnce(new Error('KV Error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toEqual(mockQuote);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error setting user flag in KV'), expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('bypasses QotD logic when categoryId is provided', async () => {
      const mockQuote = { id: 2, quote: 'Category Quote', author: 'Author', categoryId: 2 };
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp, { categoryId: 2 });
      expect(result).toEqual(mockQuote);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 2 });
      expect(kv.get).not.toHaveBeenCalled();
      expect(kv.put).not.toHaveBeenCalled();
    });

  });

  describe('getQuoteOfTheDayOrRandom', () => {

    beforeEach(() => {
      vi.clearAllMocks(); // Reset mocks before each test
      // Reset prepare mock specifically if needed, as it's heavily used
      mockDb.prepare.mockClear();
    });

    it('returns the quote of the day if user has not requested and QotD exists', async () => {
      const mockQuote: Quote = { id: 1, quote: 'Quote of the Day', author: 'Author', categoryId: 1 };

      vi.mocked(kv.get).mockResolvedValueOnce(null); // User has not requested
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockDb, kv, undefined);
      expect(kv.put).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`, "1", { expirationTtl: 86400 });
    });

    it('returns a random quote if user has already requested QotD', async () => {
      const mockQuote: Quote = { id: 2, quote: 'Random Quote', author: 'Author', categoryId: 2 };

      vi.mocked(kv.get).mockResolvedValueOnce("1"); // User has already requested
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, undefined);
      expect(kv.put).not.toHaveBeenCalled();
    });

    it('returns a random quote if QotD does not exist', async () => {
      const mockQuote: Quote = { id: 3, quote: 'Fallback Random Quote', author: 'Author', categoryId: 3 };

      vi.mocked(kv.get).mockResolvedValueOnce(null); // User has not requested
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(null); // No QotD
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockDb, kv, undefined);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, undefined);
      expect(kv.put).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`, "1", { expirationTtl: 86400 });
    });

    it('returns a random quote for a specific category if categoryId is provided', async () => {
      const mockQuote: Quote = { id: 4, quote: 'Category Quote', author: 'Author', categoryId: 4 };

      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp, { categoryId: 4 });

      expect(result).toEqual(mockQuote);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 4 });
      expect(kv.get).not.toHaveBeenCalled();
      expect(kv.put).not.toHaveBeenCalled();
    });

    it('logs an error if setting the user flag in KV fails', async () => {
      const mockQuote: Quote = { id: 5, quote: 'Quote of the Day', author: 'Author', categoryId: 5 };

      vi.mocked(kv.get).mockResolvedValueOnce(null); // User has not requested
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(mockQuote);
      vi.mocked(kv.put).mockRejectedValueOnce(new Error('KV Error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockDb, kv, undefined);
      expect(kv.put).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`, "1", { expirationTtl: 86400 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error setting user flag in KV'), expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
    it('handles failure when kv.get fails to retrieve user flag', async () => {
      vi.mocked(kv.get).mockRejectedValueOnce(new Error('KV Error'));
      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toBeNull();
      expect(kv.get).toHaveBeenCalledWith(`qotd_requested_${mockUserIp}_${MOCK_DATE}`);
    });

    it('falls back to random quote when getQuoteOfTheDay returns null', async () => {
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(null);
      vi.mocked(getRandomQuote).mockResolvedValueOnce({ id: 1, quote: 'Random Quote', author: 'Author', categoryId: 1 });

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toEqual({ id: 1, quote: 'Random Quote', author: 'Author', categoryId: 1 });
      expect(getQuoteOfTheDay).toHaveBeenCalled();
      expect(getRandomQuote).toHaveBeenCalled();
    });

    it('handles failure when kv.put fails to set user flag', async () => {
      const mockQuote = { id: 1, quote: 'Quote of the Day', author: 'Author', categoryId: 1 };
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      vi.mocked(getQuoteOfTheDay).mockResolvedValueOnce(mockQuote);
      vi.mocked(kv.put).mockRejectedValueOnce(new Error('KV Error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp);
      expect(result).toEqual(mockQuote);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error setting user flag in KV'), expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('bypasses QotD logic when categoryId is provided', async () => {
      const mockQuote = { id: 2, quote: 'Category Quote', author: 'Author', categoryId: 2 };
      vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDayOrRandom(mockDb, kv, mockUserIp, { categoryId: 2 });
      expect(result).toEqual(mockQuote);
      expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 2 });
      expect(kv.get).not.toHaveBeenCalled();
      expect(kv.put).not.toHaveBeenCalled();
    });
  });

});