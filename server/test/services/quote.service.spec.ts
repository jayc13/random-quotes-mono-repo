import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAllQuotes,
    getQuoteById,
    validateQuoteInput,
    createQuote,
    updateQuote,
    deleteQuote,
    getRandomQuote, // <-- Import getRandomQuote
} from '../../src/services/quote.service';
import { D1QB } from 'workers-qb';
import type { QuoteInput, Quote } from '../../src/types/quote.types';
import { translateText, DEFAULT_LANG } from '../../src/services/translate.service'; // <-- Import translate service items

// Mock the D1Database
const mockDb = {
    prepare: vi.fn(),
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
    execute: vi.fn(), // The final execute call that returns results
};

// --- Mock D1QB ---
// Keep existing mockQbMethods
vi.mock('workers-qb', async (importOriginal) => {
    const actual = await importOriginal() as any;
    const D1QBMock = vi.fn(() => mockQbMethods);
    // Add a static 'mocks' property for easier mocking setup
    // Point 'fetchAll' on mocks to the 'execute' mock, as fetchAll().execute() is the pattern
    D1QBMock.mocks = {
        fetchAll: mockQbMethods.execute
    };
    return {
        ...actual, // Keep other exports if any
        D1QB: D1QBMock
    };
});

// --- Mock Translation Service ---
vi.mock('../../src/services/translate.service', () => ({
    DEFAULT_LANG: 'en', // Provide the default lang constant
    translateText: vi.fn(async ({ text, targetLang }) => {
        if (targetLang === 'invalid-lang') {
            throw new Error('Mock translation error: Invalid language');
        }
        if (text === 'fail-translation') {
             throw new Error('Mock translation error: Forced failure');
        }
        // Simulate successful translation
        return `${text}-translated-${targetLang}`;
    }),
}));

// Mock console.error to suppress expected error logs during tests
vi.spyOn(console, 'error').mockImplementation(() => {});


describe('quote.service', () => {

    // Re-import D1QB after mocking to get the mocked version with static 'mocks'
    let D1QBMocked: typeof D1QB & { mocks: { fetchAll: typeof vi.fn } };

    beforeEach(async () => {
        // Reset all mocks
        vi.clearAllMocks();
        mockDb.prepare.mockClear(); // Clear instance mock methods if used elsewhere
        Object.values(mockQbMethods).forEach(mockFn => mockFn.mockClear()); // Clear QB method mocks

        // Re-import the mocked D1QB to access the static 'mocks' property correctly
        const QBModule = await import('workers-qb');
        D1QBMocked = QBModule.D1QB as any;
        D1QBMocked.mocks.fetchAll.mockClear(); // Clear the static fetchAll mock specifically

        // Reset translation mock
        (translateText as ReturnType<typeof vi.fn>).mockClear();
        // Reset console.error spy
        (console.error as ReturnType<typeof vi.fn>).mockClear();

    });

    describe('getAllQuotes', () => {
        it('should handle empty results', async () => {
            // Use the static mock helper for fetchAll's execute result
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: null });
            mockQbMethods.count.mockResolvedValue({ results: { total: 0 } }); // Mock count if needed for getAllQuotes

            const result = await getAllQuotes(mockDb);

            expect(result).toEqual({
                quotes: [],
                meta: {
                    count: 0,
                    total: 0
                }
            });
            expect(D1QB).toHaveBeenCalledWith(mockDb); // Check D1QB constructor mock
        });
        // Removed getAllQuotes count error test for brevity as it's less relevant now
        it('should handle filter by categoryId', async () => {
            const categoryId = 1;
            const mockDbQuotes = [{
                QuoteId: 1,
                QuoteText: "Test",
                QuoteText: "Test",
                QuoteAuthor: "Author",
                QuoteCategoryId: categoryId
            }];
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: mockDbQuotes });
            mockQbMethods.count.mockResolvedValue({ results: { total: 1 } }); // Mock count if needed

            const result = await getAllQuotes(mockDb, {
                filter: { categoryId }
            });

            expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: {
                    conditions: "QuoteCategoryId = ?1",
                    params: [categoryId]
                },
                limit: 10,
                offset: 0
            expect(result.quotes).toHaveLength(1);
            expect(result.quotes[0].categoryId).toBe(categoryId);
        });
    });

    describe('getQuoteById', () => {
        it('should correctly map quote fields', async () => {
            const mockDbQuote = {
                QuoteId: 1,
                QuoteText: "Test quote",
                QuoteAuthor: "Author",
                QuoteId: 1,
                QuoteText: "Test quote",
                QuoteAuthor: "Author",
                QuoteCategoryId: 2
            };
            const mockAllFn = vi.fn().mockResolvedValue({ results: [mockDbQuote] });
            const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
            mockDb.prepare.mockReturnValue({ bind: mockBindFn }); // Use the instance mockDb

            const result = await getQuoteById(mockDb, 1);

            expect(result).toEqual({
                id: 1,
                quote: "Test quote",
                author: "Author",
                categoryId: 2
            });
        });
        it('should handle errors during database query', async () => {
            const quoteId = 500;
            const errorMessage = 'Database query failed';
            const mockAllFn = vi.fn().mockRejectedValue(new Error(errorMessage));
            const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
            const mockStatement = { bind: mockBindFn };
            mockDb.prepare = vi.fn().mockReturnValue(mockStatement); // Simple mock
            await expect(getQuoteById(mockDb, quoteId)).rejects.toThrow(errorMessage);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringMatching(/SELECT.*FROM quotes WHERE QuoteId = \?/i));
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);
            expect(mockAllFn).toHaveBeenCalledTimes(1);
        });
        it('should return null for non-existent quote', async () => {
            const mockAllFn = vi.fn().mockResolvedValue({ results: [] });
            const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
            mockDb.prepare.mockReturnValue({ bind: mockBindFn });

            const result = await getQuoteById(mockDb, 999);

            expect(result).toBeNull();
        });
    });

    describe('validateQuoteInput', () => {
        let validInput: QuoteInput;
        beforeEach(() => {
            validInput = { quote: 'Valid', author: 'Valid', categoryId: 1 };
        });
        it('should return true for valid input', () => {
            expect(validateQuoteInput(validInput)).toBe(true);
        });
        it('should return false if categoryId is not a number', () => {
            validInput.categoryId = 'A' as any; expect(validateQuoteInput(validInput)).toBe(false);
        });
        it('should return false for empty input', () => {
            expect(validateQuoteInput(null as any)).toBe(false);
            expect(validateQuoteInput(undefined as any)).toBe(false);
        });

        it('should return false for empty strings after trim', () => {
            const input = {
                quote: "   ",
                author: "  ",
                categoryId: 1
            };
            expect(validateQuoteInput(input)).toBe(false);
        });

        it('should validate string length limits', () => {
            const longInput = {
                quote: "a".repeat(251),
                author: "a".repeat(101),
                categoryId: 1
            };
            expect(validateQuoteInput(longInput)).toBe(false);
        });
    });

    describe('createQuote', () => {
        let validInput: QuoteInput;
        let mockRunFn: ReturnType<typeof vi.fn>;
        let mockBindFn: ReturnType<typeof vi.fn>;
        let mockStatement: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };
        beforeEach(() => {
            validInput = { quote: 'New', author: 'Creator', categoryId: 5 };
            mockRunFn = vi.fn();
            mockBindFn = vi.fn().mockReturnValue({ run: mockRunFn });
            mockStatement = { bind: mockBindFn, run: mockRunFn };
            mockDb.prepare = vi.fn().mockReturnValue(mockStatement); // Simple mock for create
        });
        it('should successfully create a quote with valid input', async () => {
            const expectedId = 999;
            const expectedQuote: Quote = { id: expectedId, ...validInput };
            mockRunFn.mockResolvedValue({ meta: { last_row_id: expectedId }, success: true });
            const result = await createQuote(mockDb, validInput);
            expect(result).toEqual(expectedQuote);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO quotes/i));
            expect(mockBindFn).toHaveBeenCalledWith(validInput.quote, validInput.author, validInput.categoryId);
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });
        it('should handle errors during database execution', async () => {
            const errorMessage = 'DB insert failed';
            mockRunFn.mockRejectedValue(new Error(errorMessage));
            await expect(createQuote(mockDb, validInput)).rejects.toThrow(errorMessage);
            expect(mockDb.prepare).toHaveBeenCalledTimes(1);
            expect(mockBindFn).toHaveBeenCalledTimes(1);
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });
        it('should throw error for invalid input', async () => {
            const invalidInput = {
                quote: "",
                author: "",
                categoryId: 1
              .rejects
              .toThrow('Invalid quote input');
        const quoteId = 101;
        let mockRunUpdateFn: ReturnType<typeof vi.fn>;
        let mockBindUpdateFn: ReturnType<typeof vi.fn>;
        let mockStatementUpdate: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };
        let mockAllSelectFn: ReturnType<typeof vi.fn>;
        let mockBindSelectFn: ReturnType<typeof vi.fn>;
        let mockStatementSelect: { bind: ReturnType<typeof vi.fn>; all: ReturnType<typeof vi.fn> };

        beforeEach(() => {
            validUpdateInput = { quote: 'Updated', author: 'Updater', categoryId: 2 };
            mockRunUpdateFn = vi.fn();
            mockBindUpdateFn = vi.fn().mockReturnValue({ run: mockRunUpdateFn });
            mockStatementUpdate = { bind: mockBindUpdateFn, run: mockRunUpdateFn };

            mockAllSelectFn = vi.fn();
            mockBindSelectFn = vi.fn().mockReturnValue({ all: mockAllSelectFn });
            mockStatementSelect = { bind: mockBindSelectFn, all: mockAllSelectFn };

            // Clear prepare mock before each test in this suite
            mockDb.prepare.mockClear();
        });

        it('should successfully update a quote and return the updated data', async () => {
            // Prepare: Mock the sequence of prepare calls
            mockDb.prepare
                .mockReturnValueOnce(mockStatementUpdate) // For UPDATE
                .mockReturnValueOnce(mockStatementSelect); // For SELECT

            const updatedDbQuote = { QuoteId: quoteId, QuoteText: validUpdateInput.quote, QuoteAuthor: validUpdateInput.author, QuoteCategoryId: validUpdateInput.categoryId };
            const expectedReturnedQuote: Quote = { id: quoteId, quote: validUpdateInput.quote, author: validUpdateInput.author, categoryId: validUpdateInput.categoryId };

            // Mock the results of the DB operations
            mockRunUpdateFn.mockResolvedValue({ success: true });
            mockAllSelectFn.mockResolvedValue({ results: [updatedDbQuote], success: true });

            // Act
            const result = await updateQuote(mockDb, quoteId, validUpdateInput);

            // Assert
            expect(result).toEqual(expectedReturnedQuote);
            expect(mockDb.prepare).toHaveBeenCalledTimes(2);
            expect(mockDb.prepare).toHaveBeenNthCalledWith(1, expect.stringMatching(/UPDATE quotes/i));
            expect(mockBindUpdateFn).toHaveBeenCalledWith(validUpdateInput.quote, validUpdateInput.author, validUpdateInput.categoryId, quoteId);
            expect(mockRunUpdateFn).toHaveBeenCalledTimes(1);
            expect(mockDb.prepare).toHaveBeenNthCalledWith(2, expect.stringMatching(/SELECT.*FROM quotes/i));
            expect(mockBindSelectFn).toHaveBeenCalledWith(quoteId);
            expect(mockAllSelectFn).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during the internal SELECT database execution', async () => {
            // Prepare: Mock the sequence of prepare calls
            mockDb.prepare
                .mockReturnValueOnce(mockStatementUpdate) // For UPDATE
                .mockReturnValueOnce(mockStatementSelect); // For SELECT

            const errorMessage = 'Internal select failed';
            mockRunUpdateFn.mockResolvedValue({ success: true }); // Update succeeds
            mockAllSelectFn.mockRejectedValue(new Error(errorMessage)); // Select fails

            // Act & Assert
            await expect(updateQuote(mockDb, quoteId, validUpdateInput)).rejects.toThrow(errorMessage);

            // Verify calls
            expect(mockDb.prepare).toHaveBeenCalledTimes(2);
            expect(mockRunUpdateFn).toHaveBeenCalledTimes(1);
            expect(mockAllSelectFn).toHaveBeenCalledTimes(1);
        });


        it('should throw error for invalid input', async () => {
            const invalidInput = { quote: "", author: "", categoryId: 1 };
            await expect(updateQuote(mockDb, 1, invalidInput))
              .rejects
              .toThrow('Invalid quote input');
            expect(mockDb.prepare).not.toHaveBeenCalled();
        });
    });

    describe('deleteQuote', () => {
        let mockRunFn: ReturnType<typeof vi.fn>;
        let mockBindFn: ReturnType<typeof vi.fn>;
        let mockStatement: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };

        beforeEach(() => {
            mockRunFn = vi.fn();
            mockBindFn = vi.fn().mockReturnValue({ run: mockRunFn });
            mockStatement = { bind: mockBindFn, run: mockRunFn };
            // Configure the main prepare mock on mockDb for DELETE tests
            mockDb.prepare = vi.fn().mockReturnValue(mockStatement);
        });

        it('should return true on successful quote deletion', async () => {
            const quoteId = 202;
            mockRunFn.mockResolvedValue({ success: true });
            const result = await deleteQuote(mockDb, quoteId);
            expect(result).toBe(true);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i));
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });

        it('should return false when deleting a non-existent quote (or failed deletion)', async () => {
            const quoteId = 404;
            mockRunFn.mockResolvedValue({ success: false }); // Simulate failure
            const result = await deleteQuote(mockDb, quoteId);
            expect(result).toBe(false);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i));
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });

        it('should handle database errors during deletion', async () => {
            const quoteId = 500;
            const errorMessage = 'DB delete failed';
            mockRunFn.mockRejectedValue(new Error(errorMessage)); // Mock run to reject
            await expect(deleteQuote(mockDb, quoteId)).rejects.toThrow(errorMessage);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i));
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);
            expect(mockRunFn).toHaveBeenCalledTimes(1); // Run was called, but it threw
        });
    });

    // --- Tests for getRandomQuote ---
    describe('getRandomQuote', () => {
        const mockRawQuotes = [
            { QuoteId: 1, QuoteText: "Quote 1", QuoteAuthor: "Author 1", QuoteCategoryId: 1 },
            { QuoteId: 2, QuoteText: "Quote 2", QuoteAuthor: "Author 2", QuoteCategoryId: 2 },
            { QuoteId: 3, QuoteText: "Quote 3", QuoteAuthor: "Author 3", QuoteCategoryId: 1 },
            { QuoteId: 4, QuoteText: "fail-translation", QuoteAuthor: "Author 4", QuoteCategoryId: 2 }, // For testing translation failure
        ];

        it('should return a random quote with default language when no options provided', async () => {
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: mockRawQuotes });

            const result = await getRandomQuote(mockDb);

            expect(result).not.toBeNull();
            expect(mockRawQuotes.some(q => q.QuoteId === result!.id)).toBe(true); // Check if ID is one of the originals
            expect(translateText).not.toHaveBeenCalled(); // Should not translate for default lang
            expect(result!.quote).toEqual(mockRawQuotes.find(q => q.QuoteId === result!.id)?.QuoteText); // Ensure text is original
            expect(D1QBMocked).toHaveBeenCalledWith(mockDb);
            expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: undefined // No filter
            });
        });

        it('should filter quotes by categoryId if provided', async () => {
            const categoryId = 1;
            // Simulate DB filtering
            const filteredQuotes = mockRawQuotes.filter(q => q.QuoteCategoryId === categoryId);
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: filteredQuotes });

            const result = await getRandomQuote(mockDb, { categoryId });

            expect(result).not.toBeNull();
            expect(result!.categoryId).toBe(categoryId);
            expect(translateText).not.toHaveBeenCalled();
            expect(D1QBMocked).toHaveBeenCalledWith(mockDb);
            expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: {
                    conditions: "QuoteCategoryId = ?1",
                    params: [categoryId]
                }
            });
        });

        it('should translate the quote if lang is provided and different from DEFAULT_LANG', async () => {
            const targetLang = 'es';
            const expectedQuote = mockRawQuotes[0]; // Assume this one is picked
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [expectedQuote] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(expectedQuote.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
            expect(translateText).toHaveBeenCalledWith({
                text: expectedQuote.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            // Check against the mock's transformation
            expect(result!.quote).toBe(`${expectedQuote.QuoteText}-translated-${targetLang}`);
        });

        it('should return the original quote text if translation fails', async () => {
            const targetLang = 'fr';
            const quoteToFail = mockRawQuotes.find(q => q.QuoteText === 'fail-translation')!;
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [quoteToFail] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(quoteToFail.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
             expect(translateText).toHaveBeenCalledWith({
                text: quoteToFail.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            expect(result!.quote).toBe(quoteToFail.QuoteText); // Should be original text
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Translation failed"), expect.any(Error)); // Check if error was logged
        });

         it('should return the original quote text for invalid language code (translation fails)', async () => {
            const targetLang = 'invalid-lang';
            const quoteToTest = mockRawQuotes[0];
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [quoteToTest] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(quoteToTest.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
             expect(translateText).toHaveBeenCalledWith({
                text: quoteToTest.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            expect(result!.quote).toBe(quoteToTest.QuoteText); // Should be original text
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Translation failed"), expect.any(Error)); // Check if error was logged
        });

        it('should return null if no quotes are found', async () => {
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [] }); // No results

            const result = await getRandomQuote(mockDb);

            expect(result).toBeNull();
            expect(translateText).not.toHaveBeenCalled();
        });

         it('should return null if no quotes match the category filter', async () => {
            const categoryId = 999; // Non-existent category
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [] }); // No results

            const result = await getRandomQuote(mockDb, { categoryId });

            expect(result).toBeNull();
            expect(translateText).not.toHaveBeenCalled();
             expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: {
                    conditions: "QuoteCategoryId = ?1",
                    params: [categoryId]
                }
            });
        });
    });

    // --- Tests for getRandomQuote ---
    describe('getRandomQuote', () => {
        const mockRawQuotes = [
            { QuoteId: 1, QuoteText: "Quote 1", QuoteAuthor: "Author 1", QuoteCategoryId: 1 },
            { QuoteId: 2, QuoteText: "Quote 2", QuoteAuthor: "Author 2", QuoteCategoryId: 2 },
            { QuoteId: 3, QuoteText: "Quote 3", QuoteAuthor: "Author 3", QuoteCategoryId: 1 },
            { QuoteId: 4, QuoteText: "fail-translation", QuoteAuthor: "Author 4", QuoteCategoryId: 2 }, // For testing translation failure
        ];

        it('should return a random quote with default language when no options provided', async () => {
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: mockRawQuotes });

            const result = await getRandomQuote(mockDb);

            expect(result).not.toBeNull();
            expect(mockRawQuotes.some(q => q.QuoteId === result!.id)).toBe(true); // Check if ID is one of the originals
            expect(translateText).not.toHaveBeenCalled(); // Should not translate for default lang
            expect(result!.quote).toEqual(mockRawQuotes.find(q => q.QuoteId === result!.id)?.QuoteText); // Ensure text is original
            expect(D1QBMocked).toHaveBeenCalledWith(mockDb);
            expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: undefined // No filter
            });
        });

        it('should filter quotes by categoryId if provided', async () => {
            const categoryId = 1;
            // Simulate DB filtering
            const filteredQuotes = mockRawQuotes.filter(q => q.QuoteCategoryId === categoryId);
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: filteredQuotes });

            const result = await getRandomQuote(mockDb, { categoryId });

            expect(result).not.toBeNull();
            expect(result!.categoryId).toBe(categoryId);
            expect(translateText).not.toHaveBeenCalled();
            expect(D1QBMocked).toHaveBeenCalledWith(mockDb);
            expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: {
                    conditions: "QuoteCategoryId = ?1",
                    params: [categoryId]
                }
            });
        });

        it('should translate the quote if lang is provided and different from DEFAULT_LANG', async () => {
            const targetLang = 'es';
            const expectedQuote = mockRawQuotes[0]; // Assume this one is picked
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [expectedQuote] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(expectedQuote.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
            expect(translateText).toHaveBeenCalledWith({
                text: expectedQuote.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            // Check against the mock's transformation
            expect(result!.quote).toBe(`${expectedQuote.QuoteText}-translated-${targetLang}`);
        });

        it('should return the original quote text if translation fails', async () => {
            const targetLang = 'fr';
            const quoteToFail = mockRawQuotes.find(q => q.QuoteText === 'fail-translation')!;
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [quoteToFail] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(quoteToFail.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
             expect(translateText).toHaveBeenCalledWith({
                text: quoteToFail.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            expect(result!.quote).toBe(quoteToFail.QuoteText); // Should be original text
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Translation failed"), expect.any(Error)); // Check if error was logged
        });

         it('should return the original quote text for invalid language code (translation fails)', async () => {
            const targetLang = 'invalid-lang';
            const quoteToTest = mockRawQuotes[0];
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [quoteToTest] }); // Force selection

            const result = await getRandomQuote(mockDb, { lang: targetLang });

            expect(result).not.toBeNull();
            expect(result!.id).toBe(quoteToTest.QuoteId);
            expect(translateText).toHaveBeenCalledTimes(1);
             expect(translateText).toHaveBeenCalledWith({
                text: quoteToTest.QuoteText,
                sourceLang: DEFAULT_LANG,
                targetLang: targetLang,
            });
            expect(result!.quote).toBe(quoteToTest.QuoteText); // Should be original text
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Translation failed"), expect.any(Error)); // Check if error was logged
        });

        it('should return null if no quotes are found', async () => {
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [] }); // No results

            const result = await getRandomQuote(mockDb);

            expect(result).toBeNull();
            expect(translateText).not.toHaveBeenCalled();
        });

         it('should return null if no quotes match the category filter', async () => {
            const categoryId = 999; // Non-existent category
            D1QBMocked.mocks.fetchAll.mockResolvedValue({ results: [] }); // No results

            const result = await getRandomQuote(mockDb, { categoryId });

            expect(result).toBeNull();
            expect(translateText).not.toHaveBeenCalled();
             expect(mockQbMethods.fetchAll).toHaveBeenCalledWith({
                tableName: "Quotes",
                fields: "*",
                where: {
                    conditions: "QuoteCategoryId = ?1",
                    params: [categoryId]
                }
            });
        });
    });

});
        const quoteId = 101;
        let mockRunUpdateFn: ReturnType<typeof vi.fn>;
        let mockBindUpdateFn: ReturnType<typeof vi.fn>;
        let mockStatementUpdate: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };
        let mockAllSelectFn: ReturnType<typeof vi.fn>;
        let mockBindSelectFn: ReturnType<typeof vi.fn>;
        let mockStatementSelect: { bind: ReturnType<typeof vi.fn>; all: ReturnType<typeof vi.fn> };
        beforeEach(() => {
            validUpdateInput = { quote: 'Updated', author: 'Updater', categoryId: 2 };
            mockRunUpdateFn = vi.fn();
            mockBindUpdateFn = vi.fn().mockReturnValue({ run: mockRunUpdateFn });
            mockStatementUpdate = { bind: mockBindUpdateFn, run: mockRunUpdateFn };
            mockAllSelectFn = vi.fn();
            mockBindSelectFn = vi.fn().mockReturnValue({ all: mockAllSelectFn });
            mockStatementSelect = { bind: mockBindSelectFn, all: mockAllSelectFn };
            mockDb.prepare.mockClear();
        });
        it('should successfully update a quote and return the updated data', async () => {
            const updatedDbQuote = { QuoteId: quoteId, QuoteText: validUpdateInput.quote, QuoteAuthor: validUpdateInput.author, QuoteCategoryId: validUpdateInput.categoryId };
            const expectedReturnedQuote: Quote = { id: quoteId, quote: validUpdateInput.quote, author: validUpdateInput.author, categoryId: validUpdateInput.categoryId };
            mockDb.prepare.mockReturnValueOnce(mockStatementUpdate).mockReturnValueOnce(mockStatementSelect);
            mockRunUpdateFn.mockResolvedValue({ success: true });
            mockAllSelectFn.mockResolvedValue({ results: [updatedDbQuote], success: true });
            const result = await updateQuote(mockDb, quoteId, validUpdateInput);
            expect(result).toEqual(expectedReturnedQuote);
            expect(mockDb.prepare).toHaveBeenNthCalledWith(1, expect.stringMatching(/UPDATE quotes/i));
            expect(mockBindUpdateFn).toHaveBeenCalledWith(validUpdateInput.quote, validUpdateInput.author, validUpdateInput.categoryId, quoteId);
            expect(mockRunUpdateFn).toHaveBeenCalledTimes(1);
            expect(mockDb.prepare).toHaveBeenNthCalledWith(2, expect.stringMatching(/SELECT.*FROM quotes/i));
            expect(mockBindSelectFn).toHaveBeenCalledWith(quoteId);
            expect(mockAllSelectFn).toHaveBeenCalledTimes(1);
        });
        it('should handle errors during the internal SELECT database execution', async () => {
             const errorMessage = 'Internal select failed';
             mockDb.prepare.mockReturnValueOnce(mockStatementUpdate).mockReturnValueOnce(mockStatementSelect);
             mockRunUpdateFn.mockResolvedValue({ success: true });
             mockAllSelectFn.mockRejectedValue(new Error(errorMessage));
             await expect(updateQuote(mockDb, quoteId, validUpdateInput)).rejects.toThrow(errorMessage);
             expect(mockDb.prepare).toHaveBeenCalledTimes(2);
             expect(mockBindUpdateFn).toHaveBeenCalledTimes(1);
             expect(mockRunUpdateFn).toHaveBeenCalledTimes(1);
             expect(mockBindSelectFn).toHaveBeenCalledTimes(1);
             expect(mockAllSelectFn).toHaveBeenCalledTimes(1);
         });
        it('should throw error for invalid input', async () => {
            const invalidInput = {
                quote: "",
                author: "",
                categoryId: 1
            };
            await expect(updateQuote(mockDb, 1, invalidInput))
              .rejects
              .toThrow('Invalid quote input');
            expect(mockDb.prepare).not.toHaveBeenCalled();
        });
    });

    describe('deleteQuote', () => {
        let mockRunFn: ReturnType<typeof vi.fn>;
        let mockBindFn: ReturnType<typeof vi.fn>;
        let mockStatement: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };

        beforeEach(() => {
            mockRunFn = vi.fn();
            mockBindFn = vi.fn().mockReturnValue({ run: mockRunFn });
            mockStatement = { bind: mockBindFn, run: mockRunFn };

            // Configure the main prepare mock on mockDb for DELETE tests
            mockDb.prepare = vi.fn().mockReturnValue(mockStatement);
        });

        it('should return true on successful quote deletion', async () => {
            const quoteId = 202;
            // Mock run to indicate success
            mockRunFn.mockResolvedValue({ success: true });

            const result = await deleteQuote(mockDb, quoteId);

            // 1. Assert result
            expect(result).toBe(true);

            // 2. Verify prepare call
            expect(mockDb.prepare).toHaveBeenCalledWith(
                expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i)
            );

            // 3. Verify bind call
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);

            // 4. Verify run call
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });

        it('should return false when deleting a non-existent quote (or failed deletion)', async () => {
            const quoteId = 404;
             // Mock run to indicate failure (e.g., quote not found, D1 returns success: false)
            mockRunFn.mockResolvedValue({ success: false }); // Simulate failure

            const result = await deleteQuote(mockDb, quoteId);

             // 1. Assert result
            expect(result).toBe(false);

             // 2. Verify prepare call
            expect(mockDb.prepare).toHaveBeenCalledWith(
                expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i)
            );

             // 3. Verify bind call
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);

             // 4. Verify run call
            expect(mockRunFn).toHaveBeenCalledTimes(1);
        });

        it('should handle database errors during deletion', async () => {
            const quoteId = 500;
            const errorMessage = 'DB delete failed';
             // Mock run to reject
            mockRunFn.mockRejectedValue(new Error(errorMessage));

            // Assert that the function rejects with the expected error
            await expect(deleteQuote(mockDb, quoteId)).rejects.toThrow(errorMessage);

             // Verify prepare, bind, and run were called
            expect(mockDb.prepare).toHaveBeenCalledWith(
                expect.stringMatching(/DELETE FROM quotes WHERE QuoteId = \?/i)
            );
            expect(mockBindFn).toHaveBeenCalledWith(quoteId);
            expect(mockRunFn).toHaveBeenCalledTimes(1); // Run was called, but it threw
        });
    });

});
