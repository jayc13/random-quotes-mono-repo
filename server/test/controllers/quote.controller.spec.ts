import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  getRandomQuoteHandler,
  getQuoteOfTheDayHandler,
  getAllQuotesHandler,
  getQuoteByIdHandler,
  createQuoteHandler,
  updateQuoteHandler,
  deleteQuoteHandler,
} from '@/controllers/quote.controller';
import {
  getQuoteOfTheDayOrRandom,
  getQuoteOfTheDay,
} from '@/services/random-quotes.service';
import {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
} from '@/services/quote.service';
import {quoteInputValidator} from '@/validators/quote.validator';
import type {Env} from '@/index';
import {getSupportedLanguages, DEFAULT_LANG} from '@/services/translate.service';
import type {Quote} from '@/types/quote.types';

// Mock services
vi.mock('@/services/quote.service');
vi.mock('@/services/random-quotes.service');
vi.mock('@/services/translate.service');
vi.mock('@/validators/quote.validator');

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
});

// Mock D1Database and KVNamespace (needed for Env)
const mockDb = {} as D1Database;
const mockKv = {get: vi.fn(), put: vi.fn()} as unknown as KVNamespace; // Simple mock for KV

// Create mock Env
const mockEnv: Env = {
  DB: mockDb,
  QUOTES_KV: mockKv,
  AUTH0_DOMAIN: 'test-domain',
  AUTH0_CLIENT_ID: 'test-client-id',
};

const MOCK_IP = '1.2.3.4';
const mockQuoteData: Quote = {
  id: 1,
  quote: 'Test Quote',
  author: 'Test Author',
  categoryId: 1,
};
const mockNewQuotePayload = {
  quote: 'New Test Quote',
  author: 'New Test Author',
  categoryId: 3,
};
const mockCreatedQuoteData: Quote = {
  id: 100, // Assuming a new ID is assigned
  ...mockNewQuotePayload,
};
const mockUpdatedQuoteData: Quote = {
  id: 1,
  quote: 'Updated Test Quote',
  author: 'Updated Test Author',
  categoryId: 2,
};
const mockSupportedLanguages = ['en', 'es'];

describe('Quote Controllers', () => {
  beforeEach(() => {
    // Reset mocks and provide default implementations
    vi.mocked(getQuoteOfTheDayOrRandom).mockResolvedValue(mockQuoteData);
    vi.mocked(getQuoteOfTheDay).mockResolvedValue(mockQuoteData);
    vi.mocked(getSupportedLanguages).mockReturnValue(mockSupportedLanguages);
    vi.mocked(getAllQuotes).mockResolvedValue({quotes: [mockQuoteData], meta: {count: 1, total: 1}});
    vi.mocked(getQuoteById).mockResolvedValue(mockQuoteData);
    vi.mocked(createQuote).mockResolvedValue(mockQuoteData);
    vi.mocked(updateQuote).mockResolvedValue(mockQuoteData);
    vi.mocked(deleteQuote).mockResolvedValue(true);
    vi.mocked(quoteInputValidator).mockReturnValue(true); // Default to valid input
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomQuoteHandler', () => {
    const MOCK_IP = '1.2.3.4';
    const mockQuoteData: Quote = {
      id: 1,
      quote: 'Test Quote',
      author: 'Test Author',
      categoryId: 1,
    };
    const mockSupportedLanguages = ['en', 'es'];

    beforeEach(() => {
      // Reset mocks and provide default implementations
      vi.mocked(getQuoteOfTheDayOrRandom).mockResolvedValue(mockQuoteData); // Mock the new service function
      vi.mocked(getSupportedLanguages).mockReturnValue(mockSupportedLanguages);
      consoleErrorSpy.mockClear();
    });

    afterEach(() => {
      vi.clearAllMocks(); // Use clearAllMocks to avoid potential mock conflicts between describe blocks
    });

    it('should call getQuoteOfTheDayOrRandom with correct parameters (IP, DB, KV, defaults)', async () => {
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv); // Pass mockEnv
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(0); // Not called if lang is default
    });

    it('should use "unknown" IP if header is missing', async () => {
      const mockRequest = new Request('http://test.com/random'); // No IP header
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, 'unknown', {
        categoryId: undefined,
        lang: DEFAULT_LANG,
      });
    });

    it('should call getQuoteOfTheDayOrRandom with specified supported language', async () => {
      const mockRequest = new Request('http://test.com/random?lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getQuoteOfTheDayOrRandom with default language when an unsupported language is provided', async () => {
      const mockRequest = new Request('http://test.com/random?lang=fr', { // 'fr' is not in mockSupportedLanguages
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: DEFAULT_LANG, // Falls back to DEFAULT_LANG
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getQuoteOfTheDayOrRandom with categoryId and specified supported language', async () => {
      const mockRequest = new Request('http://test.com/random?categoryId=123&lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: 123,
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid categoryId gracefully (NaN becomes undefined)', async () => {
      const mockRequest = new Request('http://test.com/random?categoryId=abc&lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined, // NaN parsed to undefined
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if getQuoteOfTheDayOrRandom returns null', async () => {
      vi.mocked(getQuoteOfTheDayOrRandom).mockResolvedValue(null);
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('No quote found');
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getQuoteOfTheDayOrRandom throws an error', async () => {
      const errorMessage = 'KV connection error';
      vi.mocked(getQuoteOfTheDayOrRandom).mockRejectedValue(new Error(errorMessage));
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('internal error');
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
    });
    it('should call getQuoteOfTheDayOrRandom with correct parameters (IP, DB, KV, defaults)', async () => {
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(0);
    });

    it('should use "unknown" IP if header is missing', async () => {
      const mockRequest = new Request('http://test.com/random');
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, 'unknown', {
        categoryId: undefined,
        lang: DEFAULT_LANG,
      });
    });

    it('should call getQuoteOfTheDayOrRandom with specified supported language', async () => {
      const mockRequest = new Request('http://test.com/random?lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getQuoteOfTheDayOrRandom with default language when an unsupported language is provided', async () => {
      const mockRequest = new Request('http://test.com/random?lang=fr', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getQuoteOfTheDayOrRandom with categoryId and specified supported language', async () => {
      const mockRequest = new Request('http://test.com/random?categoryId=123&lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: 123,
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid categoryId gracefully (NaN becomes undefined)', async () => {
      const mockRequest = new Request('http://test.com/random?categoryId=abc&lang=es', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      await getRandomQuoteHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, MOCK_IP, {
        categoryId: undefined,
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if getQuoteOfTheDayOrRandom returns null', async () => {
      vi.mocked(getQuoteOfTheDayOrRandom).mockResolvedValue(null);
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('No quote found');
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getQuoteOfTheDayOrRandom throws an error', async () => {
      const errorMessage = 'KV connection error';
      vi.mocked(getQuoteOfTheDayOrRandom).mockRejectedValue(new Error(errorMessage));
      const mockRequest = new Request('http://test.com/random', {
        headers: {'CF-Connecting-IP': MOCK_IP}
      });
      const response = await getRandomQuoteHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('internal error');
      expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('getQuoteOfTheDayHandler', () => {
    const mockQuoteData: Quote = {
      id: 2,
      quote: 'Quote of the Day',
      author: 'Daily Author',
      categoryId: 2,
    };
    const mockSupportedLanguages = ['en', 'es'];

    beforeEach(() => {
      // Reset mocks and provide default implementations before each test in this block
      vi.mocked(getQuoteOfTheDay).mockResolvedValue(mockQuoteData);
      vi.mocked(getSupportedLanguages).mockReturnValue(mockSupportedLanguages);
      consoleErrorSpy.mockClear(); // Clear console spy specific to this block's tests
    });

    afterEach(() => {
      // Clear mock history after each test in this block
      vi.clearAllMocks();
    });

    it('should return 200 and quote when successful (default lang)', async () => {
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(0); // Not called if lang param missing
    });

    it('should return 200 and quote when successful (supported lang)', async () => {
      const mockRequest = new Request('http://test.com/qotd?lang=es');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should use default language when an unsupported language is provided', async () => {
      const mockRequest = new Request('http://test.com/qotd?lang=fr'); // fr is not supported
      await getQuoteOfTheDayHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: DEFAULT_LANG, // Falls back to default
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if getQuoteOfTheDay returns null', async () => {
      vi.mocked(getQuoteOfTheDay).mockResolvedValue(null);
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Could not retrieve the quote of the day');
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
    });

    it('should return 500 and log error if getQuoteOfTheDay throws an error', async () => {
      const errorMessage = 'Database connection error';
      vi.mocked(getQuoteOfTheDay).mockRejectedValue(new Error(errorMessage));
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('internal error occurred');
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Check if console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in getQuoteOfTheDayHandler'), expect.any(Error));
    });
    it('should return 200 and quote when successful (default lang)', async () => {
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(0);
    });

    it('should return 200 and quote when successful (supported lang)', async () => {
      const mockRequest = new Request('http://test.com/qotd?lang=es');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: 'es',
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should use default language when an unsupported language is provided', async () => {
      const mockRequest = new Request('http://test.com/qotd?lang=fr');
      await getQuoteOfTheDayHandler(mockRequest, mockEnv);

      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(getQuoteOfTheDay).toHaveBeenCalledWith(mockEnv.DB, mockEnv.QUOTES_KV, {
        lang: DEFAULT_LANG,
      });
      expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if getQuoteOfTheDay returns null', async () => {
      vi.mocked(getQuoteOfTheDay).mockResolvedValue(null);
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Could not retrieve the quote of the day');
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
    });

    it('should return 500 and log error if getQuoteOfTheDay throws an error', async () => {
      const errorMessage = 'Database connection error';
      vi.mocked(getQuoteOfTheDay).mockRejectedValue(new Error(errorMessage));
      const mockRequest = new Request('http://test.com/qotd');
      const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('internal error occurred');
      expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in getQuoteOfTheDayHandler'), expect.any(Error));
    });
  });

  describe('getAllQuotesHandler', () => {
    it('should return 200 and quotes with default pagination and no category', async () => {
      const mockRequest = new Request('http://test.com/quotes');
      const response = await getAllQuotesHandler(mockRequest, mockDb);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Range')).toBe('quotes 0-10/1');
      expect(response.headers.get('X-Total-Count')).toBe('1');
      expect(responseBody).toEqual([mockQuoteData]);
      expect(getAllQuotes).toHaveBeenCalledTimes(1);
      expect(getAllQuotes).toHaveBeenCalledWith(mockDb, {
        pagination: { limit: 10, offset: 0 },
        filter: { categoryId: 0 }, // Default categoryId is 0
      });
    });

    it('should return 200 and quotes with specified pagination and category', async () => {
      const mockRequest = new Request('http://test.com/quotes?_start=5&_end=15&categoryId=5');
      vi.mocked(getAllQuotes).mockResolvedValue({ quotes: [mockQuoteData, mockQuoteData], meta: { count: 2, total: 20 } });
      const response = await getAllQuotesHandler(mockRequest, mockDb);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Range')).toBe('quotes 5-15/2');
      expect(response.headers.get('X-Total-Count')).toBe('20');
      expect(responseBody).toEqual([mockQuoteData, mockQuoteData]);
      expect(getAllQuotes).toHaveBeenCalledTimes(1);
      expect(getAllQuotes).toHaveBeenCalledWith(mockDb, {
        pagination: { limit: 10, offset: 5 },
        filter: { categoryId: 5 },
      });
    });

    it('should return 400 if categoryId format is invalid', async () => {
      const mockRequest = new Request('http://test.com/quotes?categoryId=abc');
      const response = await getAllQuotesHandler(mockRequest, mockDb);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid categoryId format');
      expect(getAllQuotes).not.toHaveBeenCalled();
    });
  });

  describe('getQuoteByIdHandler', () => {
    const quoteIdToFind = 1;
    const nonExistentQuoteId = 999;

    it('should return 200 and the quote if found', async () => {
      vi.mocked(getQuoteById).mockResolvedValue(mockQuoteData);

      const response = await getQuoteByIdHandler(mockDb, quoteIdToFind);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockQuoteData);
      expect(getQuoteById).toHaveBeenCalledTimes(1);
      expect(getQuoteById).toHaveBeenCalledWith(mockDb, quoteIdToFind);
    });

    it('should return 404 Not Found if the quote does not exist', async () => {
      vi.mocked(getQuoteById).mockResolvedValue(null); // Mock quote not found

      const response = await getQuoteByIdHandler(mockDb, nonExistentQuoteId);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Quote not found');
      expect(getQuoteById).toHaveBeenCalledTimes(1);
      expect(getQuoteById).toHaveBeenCalledWith(mockDb, nonExistentQuoteId);
    });
  });

  describe('createQuoteHandler', () => {
    const invalidCreatePayload = {
      quote: '', // Invalid quote
      author: 'Test Author',
      categoryId: 1,
    };

    it('should return 201 and the created quote on successful creation', async () => {
      vi.mocked(quoteInputValidator).mockReturnValue(true);
      vi.mocked(createQuote).mockResolvedValue(mockCreatedQuoteData);

      const response = await createQuoteHandler(mockDb, mockNewQuotePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual(mockCreatedQuoteData);
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(quoteInputValidator).toHaveBeenCalledWith(mockNewQuotePayload);
      expect(createQuote).toHaveBeenCalledTimes(1);
      expect(createQuote).toHaveBeenCalledWith(mockDb, mockNewQuotePayload);
    });

    it('should return 400 if input validation fails', async () => {
      vi.mocked(quoteInputValidator).mockReturnValue(false); // Mock validation failure

      const response = await createQuoteHandler(mockDb, invalidCreatePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid request body');
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(quoteInputValidator).toHaveBeenCalledWith(invalidCreatePayload);
      expect(createQuote).not.toHaveBeenCalled(); // Service should not be called
    });

    it('should return 500 Internal Server Error if the create service throws an error', async () => {
      const errorMessage = 'Database insertion failed';
      vi.mocked(quoteInputValidator).mockReturnValue(true);
      vi.mocked(createQuote).mockRejectedValue(new Error(errorMessage)); // Mock service error

      const response = await createQuoteHandler(mockDb, mockNewQuotePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toBe('Internal Server Error');
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(createQuote).toHaveBeenCalledTimes(1);
      expect(createQuote).toHaveBeenCalledWith(mockDb, mockNewQuotePayload);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Check if error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in createQuoteHandler'), expect.any(Error));
    });
  });

  describe('updateQuoteHandler', () => {
    const quoteIdToUpdate = 1;
    const validUpdatePayload = {
      quote: 'Updated Test Quote',
      author: 'Updated Test Author',
      categoryId: 2,
    };
    const invalidUpdatePayload = {
      quote: '', // Invalid quote
      author: 'Test Author',
      categoryId: 1,
    };

    it('should return 200 and the updated quote on successful update', async () => {
      vi.mocked(quoteInputValidator).mockReturnValue(true);
      vi.mocked(updateQuote).mockResolvedValue(mockUpdatedQuoteData);

      const response = await updateQuoteHandler(mockDb, quoteIdToUpdate, validUpdatePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockUpdatedQuoteData);
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(quoteInputValidator).toHaveBeenCalledWith(validUpdatePayload);
      expect(updateQuote).toHaveBeenCalledTimes(1);
      expect(updateQuote).toHaveBeenCalledWith(mockDb, quoteIdToUpdate, validUpdatePayload);
    });

    it('should return 400 if input validation fails', async () => {
      vi.mocked(quoteInputValidator).mockReturnValue(false); // Mock validation failure

      const response = await updateQuoteHandler(mockDb, quoteIdToUpdate, invalidUpdatePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid request body');
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(quoteInputValidator).toHaveBeenCalledWith(invalidUpdatePayload);
      expect(updateQuote).not.toHaveBeenCalled(); // Service should not be called
    });

    it('should return 404 Not Found if the quote to update does not exist', async () => {
      vi.mocked(quoteInputValidator).mockReturnValue(true);
      vi.mocked(updateQuote).mockResolvedValue(null); // Mock quote not found by service

      const response = await updateQuoteHandler(mockDb, quoteIdToUpdate, validUpdatePayload);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Quote not found');
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(updateQuote).toHaveBeenCalledTimes(1);
      expect(updateQuote).toHaveBeenCalledWith(mockDb, quoteIdToUpdate, validUpdatePayload);
    });

    it('should return 500 Internal Server Error if the update service throws an error', async () => {
      const errorMessage = 'Database update failed';
      vi.mocked(quoteInputValidator).mockReturnValue(true);
      vi.mocked(updateQuote).mockRejectedValue(new Error(errorMessage)); // Mock service error

      const response = await updateQuoteHandler(mockDb, quoteIdToUpdate, validUpdatePayload);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toBe('Internal Server Error');
      expect(quoteInputValidator).toHaveBeenCalledTimes(1);
      expect(updateQuote).toHaveBeenCalledTimes(1);
      expect(updateQuote).toHaveBeenCalledWith(mockDb, quoteIdToUpdate, validUpdatePayload);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Check if error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in updateQuoteHandler'), expect.any(Error));
    });
  });

  describe('deleteQuoteHandler', () => {
    const quoteIdToDelete = 99;

    it('should return 204 No Content on successful deletion', async () => {
      vi.mocked(deleteQuote).mockResolvedValue(true); // Mock successful deletion

      const response = await deleteQuoteHandler(mockDb, quoteIdToDelete);

      expect(response.status).toBe(204);
      expect(await response.text()).toBe(''); // No body for 204
      expect(deleteQuote).toHaveBeenCalledTimes(1);
      expect(deleteQuote).toHaveBeenCalledWith(mockDb, quoteIdToDelete);
    });

    it('should return 404 Not Found if the quote does not exist', async () => {
      vi.mocked(deleteQuote).mockResolvedValue(false); // Mock quote not found

      const response = await deleteQuoteHandler(mockDb, quoteIdToDelete);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Quote not found');
      expect(deleteQuote).toHaveBeenCalledTimes(1);
      expect(deleteQuote).toHaveBeenCalledWith(mockDb, quoteIdToDelete);
    });
  });
});
