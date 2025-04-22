import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	getAllQuotes,
} from '@/services/quote.service';
import { D1QB } from 'workers-qb';

// Mock the D1Database
const mockDb = {
	prepare: vi.fn(),
	// Add other methods if they are used directly in the service
} as unknown as D1Database;

// Mock D1QB instance methods - use vi.fn() for each method used by the service
const mockQbMethods = {
	fetchAll: vi.fn().mockReturnThis(),
	count: vi.fn(),
	limit: vi.fn().mockReturnThis(),
	offset: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	execute: vi.fn(), // The final execute call that returns results
};

// Mock the D1QB constructor to return our mock instance
vi.mock('workers-qb', () => {
	const D1QB = vi.fn(() => mockQbMethods); // Alias QB as D1QB if your code uses D1QB
	return { D1QB };
});

describe('quote.service - List Quotes', () => {

	beforeEach(() => {
		vi.clearAllMocks(); // Reset mocks before each test
		// Reset prepare mock specifically if needed, as it's heavily used
		mockDb.prepare.mockClear();
	});

	describe('getAllQuotes', () => {
		it('should handle empty results', async () => {
			mockQbMethods.execute.mockResolvedValue({ results: null });
			mockQbMethods.count.mockResolvedValue({ results: { total: 0 } });

			const result = await getAllQuotes(mockDb);

			expect(result).toEqual({
				quotes: [],
				meta: {
					count: 0,
					total: 0
				}
			});
		});
		it('should handle errors during count query', async () => {
			const errorMessage = 'Count query error';
			mockQbMethods.execute.mockRejectedValueOnce(new Error(errorMessage));
			await expect(getAllQuotes(mockDb)).rejects.toThrow(errorMessage);

			expect(D1QB).toHaveBeenCalledWith(mockDb);
			expect(mockQbMethods.fetchAll).toHaveBeenCalledTimes(1);
			expect(mockQbMethods.count).toHaveBeenCalledTimes(1);
			expect(mockQbMethods.execute).toHaveBeenCalledTimes(1);
		});
		it('should handle exception if count query fails', async () => {
			mockQbMethods.count.mockResolvedValueOnce({ results: null });
			await getAllQuotes(mockDb);

			expect(D1QB).toHaveBeenCalledWith(mockDb);
			expect(mockQbMethods.fetchAll).toHaveBeenCalledTimes(1);
			expect(mockQbMethods.count).toHaveBeenCalledTimes(1);
			expect(mockQbMethods.execute).toHaveBeenCalledTimes(1);
		});
		it('should handle filter by categoryId', async () => {
			const categoryId = 1;
			const mockQuotes = [{
				QuoteId: 1,
				QuoteText: "Test",
				QuoteAuthor: "Author",
				QuoteCategoryId: categoryId
			}];

			mockQbMethods.execute.mockResolvedValue({ results: mockQuotes });
			mockQbMethods.count.mockResolvedValue({ results: { total: 1 } });

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
			});
			expect(result.quotes).toHaveLength(1);
		});
	});
});