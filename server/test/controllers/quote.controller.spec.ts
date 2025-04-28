import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRandomQuoteHandler } from '@/controllers/quote.controller';
import { getQuoteOfTheDayOrRandom } from '@/services/random-quotes.service';
import type { Env } from '@/index';
import { getSupportedLanguages, DEFAULT_LANG } from '@/services/translate.service'; // Import DEFAULT_LANG
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';
import type { Quote } from '@/types/quote.types';

// Mock services
vi.mock('@/services/quote.service');
vi.mock('@/services/random-quotes.service');
vi.mock('@/services/translate.service');

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock D1Database and KVNamespace (needed for Env)
const mockDb = {} as D1Database;
const mockKv = { get: vi.fn(), put: vi.fn() } as unknown as KVNamespace; // Simple mock for KV

// Create mock Env
const mockEnv: Env = {
    DB: mockDb,
    QUOTES_KV: mockKv,
    // Add other Env properties if they exist and are needed, e.g., AUTH0...
    AUTH0_DOMAIN: 'test-domain',
    AUTH0_CLIENT_ID: 'test-client-id',
};


describe('getRandomQuoteHandler (QotD Integration)', () => {
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
        vi.restoreAllMocks(); // Use restoreAllMocks instead of clearAllMocks if using spyOn
    });

    it('should call getQuoteOfTheDayOrRandom with correct parameters (IP, DB, KV, defaults)', async () => {
        const mockRequest = new Request('http://test.com/random', {
            headers: { 'CF-Connecting-IP': MOCK_IP }
        });
        const response = await getRandomQuoteHandler(mockRequest, mockEnv); // Pass mockEnv
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
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
             headers: { 'CF-Connecting-IP': MOCK_IP }
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
             headers: { 'CF-Connecting-IP': MOCK_IP }
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
             headers: { 'CF-Connecting-IP': MOCK_IP }
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
             headers: { 'CF-Connecting-IP': MOCK_IP }
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
             headers: { 'CF-Connecting-IP': MOCK_IP }
        });
        const response = await getRandomQuoteHandler(mockRequest, mockEnv);
        const responseBody = await response.json();

        expect(response.status).toBe(404);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('No quote found');
        expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getQuoteOfTheDayOrRandom throws an error', async () => {
        const errorMessage = 'KV connection error';
        vi.mocked(getQuoteOfTheDayOrRandom).mockRejectedValue(new Error(errorMessage));
        const mockRequest = new Request('http://test.com/random', {
            headers: { 'CF-Connecting-IP': MOCK_IP }
        });
        const response = await getRandomQuoteHandler(mockRequest, mockEnv);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('internal error');
        expect(getQuoteOfTheDayOrRandom).toHaveBeenCalledTimes(1);
    });
});
