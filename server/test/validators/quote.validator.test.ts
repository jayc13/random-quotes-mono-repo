import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  quoteInputValidator,
} from '@/validators/quote.validator';
import type { QuoteInput } from '@/types/quote.types';


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

describe('Validators - Quote', () => {
  describe('quoteInputValidator', () => {
    let validInput: QuoteInput;
    beforeEach(() => {
      validInput = { quote: 'Valid', author: 'Valid', categoryId: 1 };
    });
    it('should return true for valid input', () => {
      expect(quoteInputValidator(validInput)).toBe(true);
    });
    it('should return false if categoryId is not a number', () => {
      validInput.categoryId = 'A' as any; expect(quoteInputValidator(validInput)).toBe(false);
    });
    it('should return false for empty input', () => {
      expect(quoteInputValidator(null as any)).toBe(false);
      expect(quoteInputValidator(undefined as any)).toBe(false);
    });

    it('should return false for empty strings after trim', () => {
      const input = {
        quote: "   ",
        author: "  ",
        categoryId: 1
      };
      expect(quoteInputValidator(input)).toBe(false);
    });

    it('should validate string length limits', () => {
      const longInput = {
        quote: "a".repeat(251),
        author: "a".repeat(101),
        categoryId: 1
      };
      expect(quoteInputValidator(longInput)).toBe(false);
    });
  });
});