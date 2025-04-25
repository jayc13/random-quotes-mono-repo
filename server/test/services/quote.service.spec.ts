import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getQuoteOfTheDayOrRandom, getRandomQuote } from '@/services/quote.service'; // Import both
import { translateText, DEFAULT_LANG } from '@/services/translate.service';
import type { Quote } from '@/types/quote.types';
import type { KVNamespace } from '@cloudflare/workers-types';

// Mock dependencies
vi.mock('@/services/translate.service'); // Mock the translation service

// Mock the getRandomQuote function specifically (as it's called internally)
// We need to mock the module it's exported from
vi.mock('@/services/quote.service', async (importOriginal) => {
    // Keep original implementations for other functions if needed
    const actual = await importOriginal<typeof import('@/services/quote.service')>()
    return {
        ...actual, // Keep other exports like getQuoteOfTheDayOrRandom itself
        getRandomQuote: vi.fn(), // Mock only getRandomQuote
    }
});


// Mock KVNamespace
const mockKvStore = new Map<string, string>();
const mockKv: KVNamespace = {
    get: vi.fn((key) => Promise.resolve(mockKvStore.get(key) ?? null)),
    put: vi.fn((key, value, options) => {
        mockKvStore.set(key, value);
        // Basic TTL simulation for testing if needed, Vitest fake timers might be better
        if (options && typeof options.expirationTtl === 'number' && options.expirationTtl > 0) {
            // console.log(`KV PUT: ${key} with TTL ${options.expirationTtl}s`);
        } else if (options && typeof options.expiration === 'number' && options.expiration > 0) {
             // console.log(`KV PUT: ${key} with expiration ${new Date(options.expiration * 1000)}`);
        } else {
             // console.log(`KV PUT: ${key} with no expiry`);
        }
        return Promise.resolve();
    }),
    // Add other methods if needed, like delete, list, etc.
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
};

// Mock D1Database (simple object sufficient as getRandomQuote is mocked)
const mockDb = {} as D1Database;

// Mock Date
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
        vi.useFakeTimers();
        vi.setSystemTime(new Date(MOCK_ISO_DATE));
        mockKvStore.clear();
        vi.clearAllMocks(); // Clear mocks between tests

        // Default mock implementations
        vi.mocked(getRandomQuote).mockResolvedValue(mockQuote); // Default QotD candidate
        vi.mocked(translateText).mockImplementation(async ({ text }) => text); // Default: no translation change
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should fetch a new quote, cache it, and set user flag on first request when QotD is not cached', async () => {
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote); // This will be the new QotD

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockQuote);
        // Called once to fetch the new QotD
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined });
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledWith(userKey); // Check user flag first
        expect(mockKv.get).toHaveBeenCalledWith(dailyKey); // Check daily cache
        expect(mockKv.put).toHaveBeenCalledTimes(2); // Called for daily cache and user flag
        expect(mockKv.put).toHaveBeenCalledWith(dailyKey, JSON.stringify(mockQuote), { expirationTtl: 86400 });
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
        expect(translateText).not.toHaveBeenCalled(); // Default lang
    });

     it('should fetch a new quote with category, cache it, and set user flag on first request when QotD is not cached', async () => {
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote); // This will be the new QotD
        const categoryId = mockQuote.categoryId;

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, { categoryId });

        expect(result).toEqual(mockQuote);
        // Called once to fetch the new QotD
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: categoryId });
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledWith(userKey); // Check user flag first
        expect(mockKv.get).toHaveBeenCalledWith(dailyKeyCat); // Check daily cache with category
        expect(mockKv.put).toHaveBeenCalledTimes(2); // Called for daily cache and user flag
        expect(mockKv.put).toHaveBeenCalledWith(dailyKeyCat, JSON.stringify(mockQuote), { expirationTtl: 86400 });
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
        expect(translateText).not.toHaveBeenCalled();
    });


    it('should return cached QotD and set user flag on first request when QotD is cached', async () => {
        mockKvStore.set(dailyKey, JSON.stringify(mockQuote)); // Pre-cache the quote

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockQuote);
        expect(getRandomQuote).not.toHaveBeenCalled(); // Should not fetch from DB
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
        expect(mockKv.put).toHaveBeenCalledTimes(1); // Only for user flag
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
        expect(translateText).not.toHaveBeenCalled();
    });

    it('should return random quote on subsequent request (user flag exists)', async () => {
        mockKvStore.set(userKey, "1"); // User already requested
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockRandomQuote); // Mock the random quote call

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockRandomQuote);
        expect(getRandomQuote).toHaveBeenCalledTimes(1); // Called once for the random quote
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined, lang: DEFAULT_LANG }); // Called for random
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledTimes(1);
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.put).not.toHaveBeenCalled(); // No writes on subsequent request
        expect(translateText).not.toHaveBeenCalled();
    });

     it('should return random quote with category on subsequent request', async () => {
        mockKvStore.set(userKey, "1"); // User already requested
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockRandomQuote); // Mock the random quote call
        const categoryId = 5;

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, { categoryId });

        expect(result).toEqual(mockRandomQuote);
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: categoryId, lang: DEFAULT_LANG }); // Called for random with category
        expect(mockKv.get).toHaveBeenCalledTimes(1);
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.put).not.toHaveBeenCalled();
        expect(translateText).not.toHaveBeenCalled();
    });


    it('should return null if getRandomQuote returns null when fetching new QotD', async () => {
        vi.mocked(getRandomQuote).mockResolvedValueOnce(null); // No quote found

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toBeNull();
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined });
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.get).toHaveBeenCalledWith(dailyKey);
        expect(mockKv.put).not.toHaveBeenCalled(); // Nothing to cache or flag
        expect(translateText).not.toHaveBeenCalled();
    });

     it('should return null if getRandomQuote returns null on subsequent request', async () => {
        mockKvStore.set(userKey, "1"); // User already requested
        vi.mocked(getRandomQuote).mockResolvedValueOnce(null); // No random quote found

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toBeNull();
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined, lang: DEFAULT_LANG });
        // Check KV calls
        expect(mockKv.get).toHaveBeenCalledTimes(1);
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.put).not.toHaveBeenCalled();
        expect(translateText).not.toHaveBeenCalled();
    });

    it('should call translateText if lang option is provided (cached QotD)', async () => {
        const targetLang = 'es';
        const translatedQuoteText = 'Translated Quote';
        mockKvStore.set(dailyKey, JSON.stringify(mockQuote));
        vi.mocked(translateText).mockResolvedValueOnce(translatedQuoteText);

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, { lang: targetLang });

        expect(result?.quote).toBe(translatedQuoteText);
        expect(translateText).toHaveBeenCalledTimes(1);
        expect(translateText).toHaveBeenCalledWith({
            text: mockQuote.quote,
            sourceLang: DEFAULT_LANG,
            targetLang: targetLang,
        });
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 }); // User flag still set
        expect(getRandomQuote).not.toHaveBeenCalled();
    });

     it('should call translateText if lang option is provided (new QotD)', async () => {
        const targetLang = 'fr';
        const translatedQuoteText = 'French Quote';
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote); // Fetched as new QotD
        vi.mocked(translateText).mockResolvedValueOnce(translatedQuoteText);

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, { lang: targetLang });

        expect(result?.quote).toBe(translatedQuoteText);
        expect(translateText).toHaveBeenCalledTimes(1);
        expect(translateText).toHaveBeenCalledWith({
            text: mockQuote.quote,
            sourceLang: DEFAULT_LANG,
            targetLang: targetLang,
        });
        expect(getRandomQuote).toHaveBeenCalledTimes(1); // Called to get the QotD
        expect(mockKv.put).toHaveBeenCalledWith(dailyKey, JSON.stringify(mockQuote), { expirationTtl: 86400 });
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
    });

     it('should call translateText if lang option is provided (subsequent random request)', async () => {
        const targetLang = 'de';
        const translatedQuoteText = 'German Quote';
        mockKvStore.set(userKey, "1"); // User already requested
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockRandomQuote); // Fetched as random
        vi.mocked(translateText).mockResolvedValueOnce(translatedQuoteText); // Mock translate for the random quote call

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp, { lang: targetLang });

        expect(result?.quote).toBe(translatedQuoteText);
        // getRandomQuote itself handles translation when lang is passed,
        // so getQuoteOfTheDayOrRandom should pass the lang option correctly.
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined, lang: targetLang });
        // translateText should NOT be called directly by getQuoteOfTheDayOrRandom in this case
        expect(translateText).not.toHaveBeenCalled();
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.put).not.toHaveBeenCalled();
    });

     it('should fallback to getRandomQuote if kv.get(userKey) fails', async () => {
        const kvError = new Error('KV GET Error');
        // Make the first call (userKey check) fail
        vi.mocked(mockKv.get).mockImplementation(async (key) => {
            if (key === userKey) throw kvError;
            return mockKvStore.get(key) ?? null;
        });
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockRandomQuote); // Mock fallback call

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockRandomQuote);
        expect(getRandomQuote).toHaveBeenCalledTimes(1); // Called for fallback
        expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: undefined, lang: DEFAULT_LANG });
        expect(mockKv.get).toHaveBeenCalledTimes(1); // Attempted user key get
        expect(mockKv.get).toHaveBeenCalledWith(userKey);
        expect(mockKv.put).not.toHaveBeenCalled(); // Should not write if error occurred early
    });

     it('should proceed without user flag if kv.put(userKey) fails (cached QotD)', async () => {
        const kvPutError = new Error('KV PUT Error');
        mockKvStore.set(dailyKey, JSON.stringify(mockQuote)); // Pre-cache
        vi.mocked(mockKv.put).mockImplementation(async (key) => { // Make put fail only for userKey
             if (key === userKey) throw kvPutError;
             mockKvStore.set(key, "dummy"); // Simulate success for other puts if any
        });

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockQuote); // Still returns the cached quote
        expect(mockKv.put).toHaveBeenCalledTimes(1); // Attempted user flag put
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
        expect(getRandomQuote).not.toHaveBeenCalled();
    });

     it('should proceed without caching if kv.put(dailyKey) fails (new QotD)', async () => {
        const kvPutError = new Error('KV PUT Error');
        vi.mocked(getRandomQuote).mockResolvedValueOnce(mockQuote); // Fetch new
        vi.mocked(mockKv.put).mockImplementation(async (key, value, options) => { // Make put fail only for dailyKey
            if (key === dailyKey) throw kvPutError;
            mockKvStore.set(key, value); // Store userKey successfully
        });

        const result = await getQuoteOfTheDayOrRandom(mockDb, mockKv, mockUserIp);

        expect(result).toEqual(mockQuote); // Still returns the newly fetched quote
        expect(mockKv.put).toHaveBeenCalledTimes(2); // Attempted both puts
        expect(mockKv.put).toHaveBeenCalledWith(dailyKey, JSON.stringify(mockQuote), { expirationTtl: 86400 });
        expect(mockKv.put).toHaveBeenCalledWith(userKey, "1", { expirationTtl: 86400 });
        expect(mockKvStore.has(dailyKey)).toBe(false); // Daily key failed
        expect(mockKvStore.get(userKey)).toBe("1"); // User key succeeded
        expect(getRandomQuote).toHaveBeenCalledTimes(1);
    });

});

// Note: No need to add describe('getRandomQuote') here as it's mocked.
// If you wanted to test the *original* getRandomQuote, you'd need a separate
// test file or more complex mocking setup.
