import {describe, expect, it, vi} from 'vitest';
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	updateCategory
} from '@/services/category.service';

describe('category.service', () => {
	const mockDb = {
		prepare: vi.fn(),
	} as unknown as D1Database;

	it('getAllCategories returns all categories', async () => {
		mockDb.prepare.mockReturnValueOnce({
			all: vi.fn().mockResolvedValueOnce({
				results: [
					{CategoryId: 1, CategoryName: 'Category 1'},
					{CategoryId: 2, CategoryName: 'Category 2'},
				],
			}),
		});

		const categories = await getAllCategories(mockDb);
		expect(categories).toEqual([
			{id: 1, name: 'Category 1'},
			{id: 2, name: 'Category 2'},
		]);
	});

	it('getCategoryById returns the correct category', async () => {
		mockDb.prepare.mockReturnValueOnce({
			bind: vi.fn().mockReturnValueOnce({
				all: vi.fn().mockResolvedValueOnce({
					results: [{CategoryId: 1, CategoryName: 'Category 1'}],
				}),
			}),
		});

		const category = await getCategoryById(mockDb, 1);
		expect(category).toEqual({id: 1, name: 'Category 1'});
	});

	it('getCategoryById returns null if category does not exist', async () => {
		mockDb.prepare.mockReturnValueOnce({
			bind: vi.fn().mockReturnValueOnce({
				all: vi.fn().mockResolvedValueOnce({results: []}),
			}),
		});

		const category = await getCategoryById(mockDb, 999);
		expect(category).toBeNull();
	});

	it('createCategory creates a new category and returns it', async () => {
		mockDb.prepare.mockReturnValueOnce({
			bind: vi.fn().mockReturnValueOnce({
				run: vi.fn().mockResolvedValueOnce({
					meta: {last_row_id: 1},
				}),
			}),
		});

		const category = await createCategory(mockDb, {name: 'New Category'});
		expect(category).toEqual({id: 1, name: 'New Category'});
	});

	it('createCategory throws an error for invalid input', async () => {
		await expect(createCategory(mockDb, {name: ''})).rejects.toThrow();
	});

	it('updateCategory updates an existing category and returns it', async () => {
		mockDb.prepare
			.mockReturnValueOnce({
				bind: vi.fn().mockReturnValueOnce({
					run: vi.fn().mockResolvedValueOnce({}),
				}),
			})
			.mockReturnValueOnce({
				bind: vi.fn().mockReturnValueOnce({
					all: vi.fn().mockResolvedValueOnce({
						results: [{CategoryId: 1, CategoryName: 'Updated Category'}],
					}),
				}),
			});

		const category = await updateCategory(mockDb, 1, {name: 'Updated Category'});
		expect(category).toEqual({id: 1, name: 'Updated Category'});
	});

	it('updateCategory throws an error for invalid input', async () => {
		await expect(updateCategory(mockDb, 1, {name: ''})).rejects.toThrow();
	});

	it('deleteCategory deletes a category and returns true', async () => {
		mockDb.prepare.mockReturnValueOnce({
			bind: vi.fn().mockReturnValueOnce({
				run: vi.fn().mockResolvedValueOnce({success: true}),
			}),
		});

		const result = await deleteCategory(mockDb, 1);
		expect(result).toBe(true);
	});

	it('deleteCategory returns false if deletion fails', async () => {
		mockDb.prepare.mockReturnValueOnce({
			bind: vi.fn().mockReturnValueOnce({
				run: vi.fn().mockResolvedValueOnce({success: false}),
			}),
		});

		const result = await deleteCategory(mockDb, 999);
		expect(result).toBe(false);
	});
});
