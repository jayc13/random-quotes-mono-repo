import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getQuoteOfTheDayOrRandom, getRandomQuote } from '@/services/quote.service';
import { translateText, DEFAULT_LANG } from '@/services/translate.service';
import type { Quote } from '@/types/quote.types';

vi.mock('@/services/translate.service');
vi.mock('@/services/quote.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/quote.service')>();
  return {
    ...actual,
    getRandomQuote: vi.fn(),
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
});