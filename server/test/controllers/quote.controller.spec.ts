import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRandomQuoteHandler } from '@/controllers/quote.controller';
import { getRandomQuote } from '@/services/quote.service';
import { getSupportedLanguages } from '@/services/translate.service';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';
import type { Quote } from '@/types/quote.types';

// Mock services
vi.mock('@/services/quote.service');
vi.mock('@/services/translate.service');

// Mock console.error
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock D1Database (simple object sufficient as service is mocked)
const mockDb = {} as D1Database;

describe('getRandomQuoteHandler', () => {
    const mockQuoteData: Quote = {
        id: 1,
        quote: 'Test Quote',
        author: 'Test Author',
        categoryId: 1,
    };
    const mockSupportedLanguages = ['en', 'es'];

    beforeEach(() => {
        // Reset mocks and provide default implementations
        vi.mocked(getRandomQuote).mockResolvedValue(mockQuoteData);
        vi.mocked(getSupportedLanguages).mockReturnValue(mockSupportedLanguages);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should call getRandomQuote with default language when no lang param is provided', async () => {
        const mockRequest = new Request('http://test.com/random');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toEqual(mockQuoteData);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {
            categoryId: undefined,
            lang: 'en', // DEFAULT_LANG
        });
        expect(getSupportedLanguages).toHaveBeenCalledTimes(0);
    });

    it('should call getRandomQuote with the specified supported language', async () => {
        const mockRequest = new Request('http://test.com/random?lang=es');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);

        expect(response.status).toBe(200);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {
            categoryId: undefined,
            lang: 'es',
        });
        expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getRandomQuote with default language when an unsupported language is provided', async () => {
        const mockRequest = new Request('http://test.com/random?lang=fr'); // 'fr' is not in mockSupportedLanguages
        const response = await getRandomQuoteHandler(mockRequest, mockDb);

        expect(response.status).toBe(200);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {
            categoryId: undefined,
            lang: 'en', // Falls back to DEFAULT_LANG
        });
        expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should call getRandomQuote with categoryId and specified supported language', async () => {
        const mockRequest = new Request('http://test.com/random?categoryId=123&lang=es');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);

        expect(response.status).toBe(200);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {
            categoryId: 123,
            lang: 'es',
        });
        expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

     it('should handle invalid categoryId gracefully (NaN becomes undefined)', async () => {
        const mockRequest = new Request('http://test.com/random?categoryId=abc&lang=es');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);

        expect(response.status).toBe(200);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, {
            categoryId: undefined, // NaN parsed to undefined
            lang: 'es',
        });
        expect(getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if getRandomQuote returns null', async () => {
        vi.mocked(getRandomQuote).mockResolvedValue(null);
        const mockRequest = new Request('http://test.com/random');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);
        const responseBody = await response.json();

        expect(response.status).toBe(404);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('No quote found');
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getRandomQuote throws an error', async () => {
        const errorMessage = 'Database connection error';
        vi.mocked(getRandomQuote).mockRejectedValue(new Error(errorMessage));
        const mockRequest = new Request('http://test.com/random');
        const response = await getRandomQuoteHandler(mockRequest, mockDb);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('internal error');
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
    });
});
