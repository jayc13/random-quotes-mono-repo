import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getQuoteOfTheDayOrRandom, getRandomQuote, getQuoteById } from '@/services/quote.service';
import { translateText, DEFAULT_LANG } from '@/services/translate.service';
import type { Quote } from '@/types/quote.types';

vi.mock('@/services/translate.service');
vi.mock('@/services/quote.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/quote.service')>();
  return {
    ...actual,
    getRandomQuote: vi.fn(),
    getQuoteById: vi.fn(), // Add mock for getQuoteById
  };
});

const mockKvStore = new Map<string, string>();
const mockKv: KVNamespace = {
  get: vi.fn((key, type) => {
    if (type === "arrayBuffer") {
      return Promise.resolve(null);
    }
    return Promise.resolve(mockKvStore.get(key) ?? null);
  }),
  put: vi.fn((key, value, options) => {
    const valueString = typeof value === "string" ? value : JSON.stringify(value);
    mockKvStore.set(key, valueString);
    return Promise.resolve();
  }),
  delete: vi.fn(),
  list: vi.fn(),
  getWithMetadata: vi.fn(),
};

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
  execute: vi.fn().mockReturnThis(),
};

// Mock the D1QB constructor to return our mock instance
vi.mock('workers-qb', () => {
  const D1QB = vi.fn(() => mockQbMethods); // Alias QB as D1QB if your code uses D1QB
  return { D1QB };
});

const MOCK_DATE = '2024-01-15';
const MOCK_ISO_DATE = `${MOCK_DATE}T10:00:00.000Z`;

describe('getQuoteOfTheDayOrRandom', () => {
  const mockUserIp = '192.168.1.1';
  const mockQuote: Quote = { id: 1, quote: 'Test QotD', author: 'Author', categoryId: 1 };
  const mockRandomQuote: Quote = { id: 2, quote: 'Random Quote', author: 'Random Author', categoryId: 2 };
  const userKey = `qotd_requested_${mockUserIp}_${MOCK_DATE}`;
  const dailyKey = `qotd_${MOCK_DATE}`;
  const dailyKeyCat = `qotd_${MOCK_DATE}_cat${mockQuote.categoryId}`;



  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
    // Reset prepare mock specifically if needed, as it's heavily used
    mockDb.prepare.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_ISO_DATE));
    mockKvStore.clear();
    vi.clearAllMocks();

    vi.mocked(getRandomQuote).mockResolvedValue(mockQuote);
    vi.mocked(translateText).mockImplementation(async ({ text }) => text);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch a new quote, cache it, and set user flag on first request when QotD is not cached', async () => {
    mockQbMethods.execute.mockResolvedValue({ results: [{ QuoteId: 1, QuoteText: 'Test QotD', QuoteAuthor: 'Author', QuoteCategoryId: 1 }] });
    vi.mocked(getRandomQuote).mockResolvedValue(mockQuote);
    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    expect(result).toEqual(mockQuote);
    // expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
    expect(mockKv.put).toHaveBeenCalledTimes(2);
    expect(mockKv.put).toHaveBeenCalledWith(dailyKey, "1", { expirationTtl: 86400 });
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
  });

  it('should call getRandomQuote directly when categoryId is provided', async () => {
    const options = { categoryId: 5 };
    const mockCategorizedQuote: Quote = { id: 3, quote: 'Categorized Quote', author: 'Cat Author', categoryId: 5 };
    vi.mocked(getRandomQuote).mockResolvedValue(mockCategorizedQuote); // Mock specific return for this test

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, options);

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, options); // Verify categoryId was passed
    expect(mockKv.get).not.toHaveBeenCalled(); // KV should not be checked for daily quote
    expect(result).toEqual(mockCategorizedQuote);
  });

  it('should call getRandomQuote directly if user has already requested QotD today', async () => {
    // Mock KV.get to simulate user flag being set
    vi.mocked(mockKv.get).mockImplementation(async (key) => {
      if (key === userKey) {
        return "1"; // User flag exists
      }
      return null; // Other keys (like dailyKey) return null
    });
    // Mock getRandomQuote to return a distinct random quote
    vi.mocked(getRandomQuote).mockResolvedValue(mockRandomQuote);

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Verify KV get was called only for the user key
    expect(mockKv.get).toHaveBeenCalledTimes(1);
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).not.toHaveBeenCalledWith(dailyKey); // Should not check for daily key

    // Verify getRandomQuote was called
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, undefined); // Called without category options

    // Verify the result is the random quote
    expect(result).toEqual(mockRandomQuote);
  });

  it('should return cached QotD and set user flag if QotD is cached and user has not requested', async () => {
    const cachedQuoteId = '1'; // Matches mockQuote.id

    // Mock KV.get: user flag null, daily key has cached ID
    vi.mocked(mockKv.get).mockImplementation(async (key) => {
      if (key === userKey) {
        return null; // User has not requested today
      }
      if (key === dailyKey) {
        return cachedQuoteId; // QotD is cached
      }
      return null;
    });

    // Mock getQuoteById to return the specific quote when called with the cached ID
    vi.mocked(getQuoteById).mockResolvedValue(mockQuote);
    // Mock getRandomQuote just in case (should not be called)
    vi.mocked(getRandomQuote).mockResolvedValue(mockRandomQuote);

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
    expect(getRandomQuote).not.toHaveBeenCalled();
    expect(getQuoteById).toHaveBeenCalledTimes(1);
    // Check arguments for getQuoteById carefully
    expect(getQuoteById).toHaveBeenCalledWith(mockDb, Number(cachedQuoteId), { lang: DEFAULT_LANG });
    expect(mockKv.put).toHaveBeenCalledTimes(1); // Only user flag should be set
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
    expect(result).toEqual(mockQuote); // Should return the cached quote details
  });

  it('should call getQuoteById with correct lang when QotD is cached and lang is specified', async () => {
    const cachedQuoteId = '1';
    const options = { lang: 'es' };
    // Mock KV.get: user flag null, daily key has cached ID
    vi.mocked(mockKv.get).mockImplementation(async (key) => {
      if (key === userKey) return null;
      if (key === dailyKey) return cachedQuoteId;
      return null;
    });
    vi.mocked(getQuoteById).mockResolvedValue(mockQuote); // Assume getQuoteById handles translation internally or returns pre-translated

    await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, options);

    expect(getQuoteById).toHaveBeenCalledTimes(1);
    expect(getQuoteById).toHaveBeenCalledWith(mockDb, Number(cachedQuoteId), options); // lang: 'es' passed
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
    expect(getRandomQuote).not.toHaveBeenCalled();
    expect(translateText).not.toHaveBeenCalled(); // Should not be called directly here
  });

  it('should call getRandomQuote with correct lang when user already requested and lang is specified', async () => {
    const options = { lang: 'fr' };
    // Mock KV.get: user flag is set
    vi.mocked(mockKv.get).mockImplementation(async (key) => (key === userKey ? "1" : null));
    vi.mocked(getRandomQuote).mockResolvedValue(mockRandomQuote); // Assume getRandomQuote handles translation or returns pre-translated

    await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, options);

    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).not.toHaveBeenCalledWith(dailyKey);
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, options); // lang: 'fr' passed
    expect(translateText).not.toHaveBeenCalled(); // Should not be called directly here
  });

  it('should fallback to getRandomQuote and log error if kv.get(dailyKey) fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const kvGetError = new Error('KV get failed');

    // Mock KV.get: user null, daily throws error
    vi.mocked(mockKv.get).mockImplementation(async (key) => {
      if (key === userKey) {
        return null;
      }
      if (key === dailyKey) {
        throw kvGetError;
      }
      return null;
    });

    // Mock getRandomQuote to return the fallback quote
    vi.mocked(getRandomQuote).mockResolvedValue(mockRandomQuote);

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
    expect(console.error).toHaveBeenCalled(); // Use .toHaveBeenCalled() or .toHaveBeenCalledWith(expect.stringContaining(...), kvGetError)
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, undefined); // Called without options
    expect(mockKv.put).toHaveBeenCalledWith(dailyKey, mockRandomQuote.id.toString(), { expirationTtl: 86400 }); // Cache the new quote ID
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 }); // Set user flag
    expect(result).toEqual(mockRandomQuote); // Should return the fallback quote

    // Restore the spy
    consoleErrorSpy.mockRestore();
  });

  it('should return quote and log error if kv.put(dailyKey) fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const kvPutDailyError = new Error('KV put daily failed');

    // Mock KV.get: user null, daily null
    vi.mocked(mockKv.get).mockResolvedValue(null);
    // Mock getRandomQuote to provide the quote
    vi.mocked(getRandomQuote).mockResolvedValue(mockQuote);

    // Mock KV.put to fail only for dailyKey
    vi.mocked(mockKv.put).mockImplementation(async (key, value, options) => {
      if (key === dailyKey) {
        throw kvPutDailyError;
      }
      // Simulate successful put for other keys (userKey)
      const valueString = typeof value === "string" ? value : JSON.stringify(value);
      mockKvStore.set(key, valueString);
      return Promise.resolve();
    });

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(mockKv.put).toHaveBeenCalledWith(dailyKey, mockQuote.id.toString(), { expirationTtl: 86400 });
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
    expect(console.error).toHaveBeenCalled(); // Check error was logged
    expect(result).toEqual(mockQuote); // Should still return the fetched quote

    // Restore spy
    consoleErrorSpy.mockRestore();
  });


  it('should return quote and log error if kv.put(userKey) fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const kvPutUserError = new Error('KV put user failed');

    // Mock KV.get: user null, daily null
    vi.mocked(mockKv.get).mockResolvedValue(null);
    // Mock getRandomQuote to provide the quote
    vi.mocked(getRandomQuote).mockResolvedValue(mockQuote);

    // Mock KV.put to fail only for userKey
    vi.mocked(mockKv.put).mockImplementation(async (key, value, options) => {
      if (key === userKey) {
        throw kvPutUserError;
      }
       // Simulate successful put for other keys (dailyKey)
      const valueString = typeof value === "string" ? value : JSON.stringify(value);
      mockKvStore.set(key, valueString);
      return Promise.resolve();
    });

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(mockKv.put).toHaveBeenCalledWith(dailyKey, mockQuote.id.toString(), { expirationTtl: 86400 });
    expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
    expect(console.error).toHaveBeenCalled(); // Check error was logged
    expect(result).toEqual(mockQuote); // Should still return the fetched quote

     // Restore spy
    consoleErrorSpy.mockRestore();
  });

  it('should return null if initial getRandomQuote fails', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock KV.get: user null, daily null
    vi.mocked(mockKv.get).mockResolvedValue(null);
    // Mock getRandomQuote to fail (return null)
    vi.mocked(getRandomQuote).mockResolvedValue(null);

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    expect(mockKv.put).not.toHaveBeenCalled(); // Should not cache anything if quote fetch failed
    expect(result).toBeNull(); // Should return null
    expect(console.log).toHaveBeenCalled(); // Check log message (optional: check content)

    // Restore spy
    consoleLogSpy.mockRestore();
  });

  it('should fallback to getRandomQuote if getQuoteById fails', async () => {
    const cachedQuoteId = '1';
    const getByIdError = new Error('GetById failed');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock KV.get: user null, daily key has cached ID
    vi.mocked(mockKv.get).mockImplementation(async (key) => {
      if (key === userKey) return null;
      if (key === dailyKey) return cachedQuoteId;
      return null;
    });

    // Mock getQuoteById to throw an error
    vi.mocked(getQuoteById).mockRejectedValue(getByIdError);
    // Mock getRandomQuote for the fallback
    vi.mocked(getRandomQuote).mockResolvedValue(mockRandomQuote);

    const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

    // Assertions
    expect(mockKv.get).toHaveBeenCalledWith(userKey);
    expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
    expect(getQuoteById).toHaveBeenCalledTimes(1);
    expect(getQuoteById).toHaveBeenCalledWith(mockDb, Number(cachedQuoteId), { lang: DEFAULT_LANG });
    expect(console.error).toHaveBeenCalled(); // Check error was logged
    expect(getRandomQuote).toHaveBeenCalledTimes(1); // Fallback called
    expect(result).toEqual(mockRandomQuote); // Should return the fallback quote

    // Restore spy
    consoleErrorSpy.mockRestore(); // Use spyName.mockRestore()
  });
});