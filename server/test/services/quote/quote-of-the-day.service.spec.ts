import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Quote} from "@/types/quote.types";
import {DEFAULT_LANG} from "@/services/translate.service";

// Mock the D1Database
const mockDb = {
  bind: vi.fn(),
  prepare: vi.fn().mockResolvedValue({
    bind: vi.fn().mockResolvedValue({
      all: vi.fn().mockResolvedValue({ results: [] }),
    }),
  }),
  all: vi.fn(),
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

vi.mock("@/services/quote.service", async (importOriginal) => {
  const actualQuoteServices: any = await importOriginal();

  return {
    getAllQuotes: actualQuoteServices.getAllQuotes,
    validateQuoteInput: actualQuoteServices.validateQuoteInput,
    createQuote: actualQuoteServices.createQuote,
    updateQuote: actualQuoteServices.updateQuote,
    deleteQuote: actualQuoteServices.deleteQuote,
    getRandomQuote: actualQuoteServices.getRandomQuote,
    getQuoteOfTheDayOrRandom:actualQuoteServices.getQuoteOfTheDayOrRandom,
    getQuoteOfTheDay: actualQuoteServices.getQuoteOfTheDay,
    getQuoteById: vi.fn()
  };
});

import {getQuoteById} from '@/services/quote.service';
import {getQuoteOfTheDay} from '@/services/random-quotes.service';

vi.mock('@/services/translate.service', () => ({
  DEFAULT_LANG: 'en',
  translateText: vi.fn()
}));

describe('quote.service - Random Quote', () => {

  describe('getQuoteOfTheDay', () => {

    beforeEach(() => {
      vi.clearAllMocks(); // Reset mocks before each test
      // Reset prepare mock specifically if needed, as it's heavily used
      mockDb.prepare.mockClear();
    });

    it("returns the cached quote of the day if it exists", async () => {
      const mockQuote = { id: 1, quote: "Cached Quote", author: "Author", categoryId: 1 };

      // Mock kv.get to return the cached quote ID as a string
      vi.mocked(kv.get).mockResolvedValueOnce("1");


      // Mock getQuoteById to return the expected quote object
      // vi.mocked(getQuoteById).mockResolvedValueOnce(mockQuote as Quote);
      vi.mocked(getQuoteById).mockResolvedValue(mockQuote as Quote);

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(expect.stringMatching(/^qotd_\d{4}-\d{2}-\d{2}$/));
      expect(getQuoteById).toHaveBeenCalledWith(mockDb, 1, { lang: DEFAULT_LANG });
    });
  });
});