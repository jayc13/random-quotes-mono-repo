import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createQuote,
	deleteQuote,
	getQuoteById,
	updateQuote,
} from '@/services/quote.service';
import type { Quote, QuoteInput } from '@/types/quote.types';
import { translateText, DEFAULT_LANG } from '@/services/translate.service';

// Mock the D1Database
const mockDb = {
	all: vi.fn(),
	prepare: vi.fn()
	// Add other methods if they are used directly in the service
} as unknown as D1Database;

// Mock D1QB instance methods - use vi.fn() for each method used by the service
const mockQbMethods = {
	all: vi.fn(),
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

vi.mock('@/services/translate.service', () => ({
	DEFAULT_LANG: 'en',
	translateText: vi.fn()
}));

describe('quote.service - Basic Operations', () => {

	describe('getQuoteById', () => {
		it('should correctly map quote fields', async () => {
			const mockDbQuote = {
				QuoteId: 1,
				QuoteText: 'Test quote',
				QuoteAuthor: 'Author',
				QuoteCategoryId: 2
			};
			const mockAllFn = vi.fn().mockResolvedValue({ results: [mockDbQuote] });
			const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
			mockDb.prepare.mockReturnValue({ bind: mockBindFn });

			const result = await getQuoteById(mockDb, 1);

			expect(result).toEqual({
				id: 1,
				quote: 'Test quote',
				author: 'Author',
				categoryId: 2
			});
		});

		it('should handle errors during database query', async () => {
			const quoteId = 500;
			const errorMessage = 'Database query failed';
			const mockAllFn = vi.fn().mockRejectedValue(new Error(errorMessage));
			const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
			mockDb.prepare.mockReturnValue({ bind: mockBindFn });

			await expect(getQuoteById(mockDb, quoteId)).rejects.toThrow(errorMessage);
		});

		it('should return null for non-existent quote', async () => {
			const mockAllFn = vi.fn().mockResolvedValue({ results: [] });
			const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
			mockDb.prepare.mockReturnValue({ bind: mockBindFn });

			const result = await getQuoteById(mockDb, 999);

			expect(result).toBeNull();
		});

		it('should correctly map quote fields', async () => {
			const mockQuote = {
				QuoteId: 1,
				QuoteText: "Test quote",
				QuoteAuthor: "Author",
				QuoteCategoryId: 2
			};
			const mockAllFn = vi.fn().mockResolvedValue({ results: [mockQuote] });
			const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
			mockDb.prepare.mockReturnValue({ bind: mockBindFn });

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

		it("translates the quote when a different language is provided", async () => {

			const mockQuote = {
				QuoteId: 1,
				QuoteText: "Test quote",
				QuoteAuthor: "Author",
				QuoteCategoryId: 2
			};
			const mockAllFn = vi.fn().mockResolvedValue({ results: [mockQuote] });
			const mockBindFn = vi.fn().mockReturnValue({ all: mockAllFn });
			mockDb.prepare.mockReturnValue({ bind: mockBindFn });

			// Mock the translation function to return a translated quote
			(translateText as jest.Mock).mockResolvedValueOnce("Translated quote");

			const result = await getQuoteById(mockDb, 1, { lang: "es" });

			expect(translateText).toHaveBeenCalledWith({
				text: "Test quote",
				sourceLang: DEFAULT_LANG,
				targetLang: "es",
			});
			expect(result).toEqual({
				id: 1,
				quote: "Translated quote",
				author: "Author",
				categoryId: 2,
			});
		});

		it("logs an error and returns the original quote if translation fails", async () => {
			mockDb.all.mockResolvedValueOnce({
				results: [
					{
						QuoteId: 1,
						QuoteText: "Test quote",
						QuoteAuthor: "Author",
						QuoteCategoryId: 2,
					},
				],
			});
			(translateText as jest.Mock).mockRejectedValueOnce(new Error("Translation error"));

			const result = await getQuoteById(mockDb, 1, { lang: "es" });

			expect(result).toEqual({
				id: 1,
				quote: "Test quote",
				author: "Author",
				categoryId: 2,
			});
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
			};
			await expect(createQuote(mockDb, invalidInput)).rejects.toThrow();
		});
	});

	describe('updateQuote', () => {
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
		it('should throw error for invalid input', async () => {
			const invalidInput = {
				quote: "",
				author: "",
				categoryId: 1
			};
			await expect(updateQuote(mockDb, 1, invalidInput)).rejects.toThrow();
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
	});
});