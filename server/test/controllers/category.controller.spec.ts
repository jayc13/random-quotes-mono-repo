import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getAllCategoriesHandler,
  createCategoryHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '@/controllers/category.controller';
import * as categoryService from '@/services/category.service';

vi.mock('@/services/category.service');

describe('category.controller', () => {
  const mockDb = {} as D1Database;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategoriesHandler', () => {
    it('returns all categories with correct headers', async () => {
      const mockCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];
      vi.spyOn(categoryService, 'getAllCategories').mockResolvedValue(mockCategories);

      const response = await getAllCategoriesHandler(mockDb);
      const data = await response.json();

      expect(data).toEqual(mockCategories);
      expect(response.headers.get('Content-Range')).toBe('categories 0-2/2');
      expect(response.headers.get('X-Total-Count')).toBe('2');
    });
  });

  describe('createCategoryHandler', () => {
    it('creates a valid category', async () => {
      const newCategory = { name: 'New Category' };
      const createdCategory = { id: 1, name: 'New Category' };
      vi.spyOn(categoryService, 'createCategory').mockResolvedValue(createdCategory);

      const response = await createCategoryHandler(mockDb, newCategory);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdCategory);
    });

    it('returns 400 for invalid category input', async () => {
      const invalidCategory = { name: '' };

      const response = await createCategoryHandler(mockDb, invalidCategory);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request body');
    });
  });

  describe('getCategoryByIdHandler', () => {
    it('returns category when found', async () => {
      const category = { id: 1, name: 'Category 1' };
      vi.spyOn(categoryService, 'getCategoryById').mockResolvedValue(category);

      const response = await getCategoryByIdHandler(mockDb, 1);
      const data = await response.json();

      expect(data).toEqual(category);
    });

    it('returns 404 when category not found', async () => {
      vi.spyOn(categoryService, 'getCategoryById').mockResolvedValue(null);

      const response = await getCategoryByIdHandler(mockDb, 999);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Category not found');
    });
  });

  describe('updateCategoryHandler', () => {
    it('updates a valid category', async () => {
      const updatedCategory = { id: 1, name: 'Updated Category' };
      vi.spyOn(categoryService, 'updateCategory').mockResolvedValue(updatedCategory);

      const response = await updateCategoryHandler(mockDb, 1, { name: 'Updated Category' });
      const data = await response.json();

      expect(data).toEqual(updatedCategory);
    });

    it('returns 400 for invalid category input', async () => {
      const response = await updateCategoryHandler(mockDb, 1, { name: '' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request body');
    });

    it('returns 404 when category not found', async () => {
      vi.spyOn(categoryService, 'updateCategory').mockResolvedValue(null);

      const response = await updateCategoryHandler(mockDb, 999, { name: 'Valid Name' });

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Category not found');
    });
  });

  describe('deleteCategoryHandler', () => {
    it('returns 204 on successful deletion', async () => {
      vi.spyOn(categoryService, 'deleteCategory').mockResolvedValue(true);

      const response = await deleteCategoryHandler(mockDb, 1);

      expect(response.status).toBe(204);
    });

    it('sets correct CORS headers', async () => {
      vi.spyOn(categoryService, 'deleteCategory').mockResolvedValue(true);

      const response = await deleteCategoryHandler(mockDb, 1);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Headers')).toBeTruthy();
    });
  });
});