import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAllQuotes,
    getQuoteById,
    validateQuoteInput,
    createQuote,
    updateQuote,
    deleteQuote,
} from '../../src/services/quote.service';
import { D1QB, QB } from 'workers-qb'; // Import D1QB & QB if it's used for mocking
import { QuoteInput, Quote } from '../../src/models/models'; // Import QuoteInput and Quote

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

// Mock the D1QB constructor to return our mock instance
vi.mock('workers-qb', () => {
    const QB = vi.fn(() => mockQbMethods); // Mock the QB class constructor
    const D1QB = QB; // Alias QB as D1QB if your code uses D1QB
    return { QB, D1QB };
});


describe('quote.service', () => {

    beforeEach(() => {
        vi.clearAllMocks(); // Reset mocks before each test
        // Reset prepare mock specifically if needed, as it's heavily used
        mockDb.prepare.mockClear();
    });

    describe('getAllQuotes', () => {
        // [ ... existing getAllQuotes tests ... ]
        it('should handle errors during count query', async () => {
            const mockQuotes = [{ id: 1, text: 'Quote 1' }];
            const errorMessage = 'Count query error';
            mockQbMethods.execute.mockResolvedValueOnce({ results: mockQuotes, success: true });
            mockQbMethods.execute.mockRejectedValueOnce(new Error(errorMessage));
            await expect(getAllQuotes(mockDb)).rejects.toThrow(errorMessage);
            expect(QB).toHaveBeenCalledWith(mockDb);
            expect(mockQbMethods.fetchAll).toHaveBeenCalledTimes(1);
            expect(mockQbMethods.count).toHaveBeenCalledTimes(1);
            expect(mockQbMethods.execute).toHaveBeenCalledTimes(2);
        });
    });

    describe('getQuoteById', () => {
        // [ ... existing getQuoteById tests ... ]
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
    });

    describe('validateQuoteInput', () => {
        // [ ... existing validateQuoteInput tests ... ]
        const MAX_QUOTE_LENGTH = 250;
        const MAX_AUTHOR_LENGTH = 100;
        let validInput: QuoteInput;
        beforeEach(() => { validInput = { quote: 'Valid', author: 'Valid', categoryId: 1 }; });
        it('should return true for valid input', () => { expect(validateQuoteInput(validInput)).toBe(true); });
        it('should return false if categoryId is not a number', () => { validInput.categoryId = '1' as any; expect(validateQuoteInput(validInput)).toBe(false); });
    });

    describe('createQuote', () => {
        // [ ... existing createQuote tests ... ]
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
    });

    describe('updateQuote', () => {
        // [ ... existing updateQuote tests ... ]
        let validUpdateInput: QuoteInput;
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
    });

    // --- NEW TESTS FOR deleteQuote ---
    describe('deleteQuote', () => {
        let mockRunFn: ReturnType<typeof vi.fn>;
        let mockBindFn: ReturnType<typeof vi.fn>;
        let mockStatement: { bind: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn> };

        beforeEach(() => {
            // Setup mock chain for db.prepare().bind().run()
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
    // --- END NEW TESTS ---

});
