import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DEFAULT_LANG, translateText} from '@/services/translate.service';
import {getQuoteOfTheDay, getRandomQuote} from '@/services/random-quotes.service';
import {getQuoteById} from "@/services/quote.service";

// Mock the D1Database
const mockDb = {
  prepare: vi.fn()
  // Add other methods if they are used directly in the service
} as unknown as D1Database;

// Mock D1QB instance methods - use vi.fn() for each method used by the service
const mockQbMethods = {
  fetchAll: vi.fn().mockReturnThis(),
  execute: vi.fn() // The final execute call that returns results
};

// Mock the D1QB constructor to return our mock instance
vi.mock('workers-qb', () => {
  const D1QB = vi.fn(() => mockQbMethods); // Alias QB as D1QB if your code uses D1QB
  return {D1QB};
});

vi.mock("@/services/quote.service", async () => ({
  getQuoteById: vi.fn()
}));

vi.mock('@/services/translate.service', () => ({
  DEFAULT_LANG: 'en',
  translateText: vi.fn()
}));

const kv = {
  get: vi.fn(),
  put: vi.fn(),
} as unknown as KVNamespace;

describe('quote.service - Random Quote', () => {

  describe('getRandomQuote', () => {

    beforeEach(() => {
      vi.clearAllMocks(); // Reset mocks before each test
      // Reset prepare mock specifically if needed, as it's heavily used
      mockDb.prepare.mockClear();
    });

    const mockRawQuotes = [
      {QuoteId: 1, QuoteText: 'Quote 1', QuoteAuthor: 'Author 1', QuoteCategoryId: 1},
      {QuoteId: 2, QuoteText: 'Quote 2', QuoteAuthor: 'Author 2', QuoteCategoryId: 2},
      {QuoteId: 3, QuoteText: 'Quote 3', QuoteAuthor: 'Author 3', QuoteCategoryId: 1},
      {QuoteId: 4, QuoteText: 'fail-translation', QuoteAuthor: 'Author 4', QuoteCategoryId: 2}
    ];
    it('returns a random quote from the database', async () => {
      mockQbMethods.execute.mockResolvedValueOnce({results: [mockRawQuotes[0]]});
      const result = await getRandomQuote(mockDb);
      expect(result).toEqual({
        id: mockRawQuotes[0].QuoteCategoryId,
        quote: mockRawQuotes[0].QuoteText,
        author: mockRawQuotes[0].QuoteAuthor,
        categoryId: mockRawQuotes[0].QuoteCategoryId
      });
    });

    it('returns null if no quotes are found in the database', async () => {
      mockQbMethods.execute.mockResolvedValueOnce({results: []});
      const result = await getRandomQuote(mockDb);
      expect(result).toBeNull();
    });

    it('throws an error if the database query fails', async () => {
      mockQbMethods.execute.mockRejectedValueOnce(new Error('Database error'));
      await expect(getRandomQuote(mockDb)).rejects.toThrow('Database error');
    });

    it('handles unexpected database response gracefully', async () => {
      mockQbMethods.execute.mockResolvedValueOnce({results: null});
      const result = await getRandomQuote(mockDb);
      expect(result).toBeNull();
    });
    it('translates the quote if a different language is specified', async () => {
      mockQbMethods.execute.mockResolvedValueOnce({results: [mockRawQuotes[0]]});
      translateText.mockResolvedValueOnce('Translated Quote');

      const result = await getRandomQuote(mockDb, {lang: 'es'});
      expect(result).toEqual({
        id: mockRawQuotes[0].QuoteId,
        quote: 'Translated Quote',
        author: mockRawQuotes[0].QuoteAuthor,
        categoryId: mockRawQuotes[0].QuoteCategoryId,
      });
      expect(translateText).toHaveBeenCalledWith({
        text: mockRawQuotes[0].QuoteText,
        sourceLang: 'en',
        targetLang: 'es',
      });
    });

    it('logs an error if translation fails', async () => {
      mockQbMethods.execute.mockResolvedValueOnce({results: [mockRawQuotes[3]]});
      translateText.mockRejectedValueOnce(new Error('Translation error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      });

      const result = await getRandomQuote(mockDb, {lang: 'es'});
      expect(result).toEqual({
        id: mockRawQuotes[3].QuoteId,
        quote: mockRawQuotes[3].QuoteText,
        author: mockRawQuotes[3].QuoteAuthor,
        categoryId: mockRawQuotes[3].QuoteCategoryId,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Translation failed for quote ${mockRawQuotes[3].QuoteId}:`,
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
    it('should return a random quote with a specific categoryId', async () => {
      const categoryId = 1;
      const filteredQuotes = mockRawQuotes.filter(q => q.QuoteCategoryId === categoryId);
      mockQbMethods.execute.mockResolvedValueOnce({results: filteredQuotes});

      const result = await getRandomQuote(mockDb, {categoryId});

      expect(result).toEqual({
        id: filteredQuotes[0].QuoteId,
        quote: filteredQuotes[0].QuoteText,
        author: filteredQuotes[0].QuoteAuthor,
        categoryId: filteredQuotes[0].QuoteCategoryId,
      });
    });
  });

  describe('getQuoteOfTheDay', () => {

    beforeEach(async () => {
      vi.clearAllMocks(); // Reset mocks before each test
      vi.mocked(kv.put).mockImplementation(async () => {
      });
      mockQbMethods.execute.mockClear();
    });

    it("returns the cached quote of the day if it exists", async () => {
      const mockQuote = {id: 1, quote: "Cached Quote", author: "Author", categoryId: 1};

      vi.mocked(kv.get).mockResolvedValueOnce("1");
      vi.mocked(getQuoteById).mockResolvedValueOnce(mockQuote);

      const result = await getQuoteOfTheDay(mockDb, kv);

      expect(result).toEqual(mockQuote);
      expect(kv.get).toHaveBeenCalledWith(expect.stringMatching(/^qotd_\d{4}-\d{2}-\d{2}$/));
      expect(getQuoteById).toHaveBeenCalledWith(mockDb, 1, {lang: DEFAULT_LANG});
    });

    it("handles errors gracefully", async () => {
      vi.mocked(kv.get).mockResolvedValueOnce(null);
      const errorMessage = 'Database error';
      mockQbMethods.execute.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getQuoteOfTheDay(mockDb, kv)).rejects.toThrow(errorMessage);

      expect(kv.put).not.toHaveBeenCalled();
      expect(getQuoteById).toBeCalledTimes(0);
    });
  });
});