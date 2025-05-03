import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getQuoteOfTheDayHandler } from '@/controllers/quote.controller'; // Import the handler
import { getQuoteOfTheDay } from '@/services/random-quotes.service'; // Import the service function
import type { Env } from '@/index';
import { getSupportedLanguages, DEFAULT_LANG } from '@/services/translate.service'; // Import language utils
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';
import type { Quote } from '@/types/quote.types';

// Mock services
vi.mock('@/services/random-quotes.service'); // Mock the module containing getQuoteOfTheDay
vi.mock('@/services/translate.service'); // Mock translate service for getSupportedLanguages

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock D1Database and KVNamespace (needed for Env)
const mockDb = {} as D1Database;
const mockKv = { get: vi.fn(), put: vi.fn() } as unknown as KVNamespace; // Simple mock for KV

// Create mock Env
const mockEnv: Env = {
    DB: mockDb,
    QUOTES_KV: mockKv,
    AUTH0_DOMAIN: 'test-domain',
    AUTH0_CLIENT_ID: 'test-client-id',
};


describe('getQuoteOfTheDayHandler', () => {
    const mockQuoteData: Quote = {
        id: 2,
        quote: 'Quote of the Day',
        author: 'Daily Author',
        categoryId: 2,
    };
    const mockSupportedLanguages = ['en', 'es'];

    beforeEach(() => {
        // Reset mocks and provide default implementations before each test
        vi.mocked(getQuoteOfTheDay).mockResolvedValue(mockQuoteData);
        vi.mocked(getSupportedLanguages).mockReturnValue(mockSupportedLanguages);
        consoleErrorSpy.mockClear();
    });

    afterEach(() => {
        // Clear mock history after each test
        vi.clearAllMocks();
    });

    it('should return 200 and quote when successful (default lang)', async () => {
        const mockRequest = new Request('http://test.com/qotd');
        const response = await getQuoteOfTheDayHandler(mockRequest, mockEnv);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
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
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
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
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
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
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('internal error occurred');
        expect(getQuoteOfTheDay).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Check if console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in getQuoteOfTheDayHandler'), expect.any(Error));
    });
});
