import { describe, expect, it } from 'vitest';
import { genericValidator } from '@/validators/generic.validator';

describe('Generic Validator', () => {
  describe('genericValidator', () => {
    it('returns true for valid input matching all rules', () => {
      const input = { name: 'test', age: 30 };
      const rules = {
        name: { required: true, type: 'string', maxLength: 10 },
        age: { required: true, type: 'number' },
      };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns false if the input object is null', () => {
      const rules = { name: { required: true } };
      const result = genericValidator(null, rules);
      expect(result).toBe(false);
    });

    it('returns false if the input object is undefined', () => {
      const rules = { name: { required: true } };
      const result = genericValidator(undefined, rules);
      expect(result).toBe(false);
    });

    it('returns false if a required field is missing', () => {
      const input = { age: 30 };
      const rules = { name: { required: true } };
      // @ts-ignore Testing missing property
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns false if a required string field is empty', () => {
      const input = { name: '' };
      const rules = { name: { required: true, type: 'string' } };
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns false if a required string field contains only whitespace', () => {
      const input = { name: '   ' };
      const rules = { name: { required: true, type: 'string' } };
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns true if a non-required string field is empty', () => {
      const input = { name: '' };
      const rules = { name: { required: false, type: 'string' } };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns false if a string field exceeds maxLength', () => {
      const input = { name: 'toolongstring' };
      const rules = { name: { maxLength: 5 } };
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns true if a string field meets maxLength', () => {
      const input = { name: 'short' };
      const rules = { name: { maxLength: 5 } };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns false if a field has the wrong type', () => {
      const input = { age: 'thirty' }; // age is string, rule expects number
      const rules = { age: { type: 'number' } };
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns true for valid input with mixed rule types (object and function)', () => {
      const input = { name: 'test', value: 15 };
      const rules = {
        name: { required: true, type: 'string' },
        value: (val: { name: string, value: number }) => typeof val === 'number' && val > 10,
      };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns false if a custom validation function returns false', () => {
      const input = { value: 5 };
      const rules = {
        value: (val: unknown) => typeof val === 'number' && val > 10,
      };
      const result = genericValidator(input, rules);
      expect(result).toBe(false);
    });

    it('returns true if the rules object is empty', () => {
      const input = { name: 'test' };
      const rules = {};
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns true if a field is not required and is missing', () => {
      const input = { age: 30 };
      const rules = {
        name: { required: false, type: 'string' },
        age: { type: 'number' },
      };
      // @ts-ignore Testing missing optional property
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns true if a field is not required and is null', () => {
      const input = { name: null, age: 30 };
      const rules = {
        name: { required: false, type: 'string' },
        age: { type: 'number' },
      };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('returns true if a field is not required and is undefined', () => {
      const input = { name: undefined, age: 30 };
      const rules = {
        name: { required: false, type: 'string' },
        age: { type: 'number' },
      };
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('ignores maxLength rule for non-string types', () => {
      const input = { count: 123456 };
      const rules = { count: { type: 'number', maxLength: 3 } }; // maxLength should be ignored
      const result = genericValidator(input, rules);
      expect(result).toBe(true);
    });

    it('correctly validates required non-string types (e.g., number)', () => {
      const inputValid = { count: 0 };
      const inputInvalidNull = { count: null };
      const inputInvalidUndefined = { count: undefined };
      const rules = { count: { required: true, type: 'number' } };

      expect(genericValidator(inputValid, rules)).toBe(true);
      // @ts-ignore Testing null required property
      expect(genericValidator(inputInvalidNull, rules)).toBe(false);
      // @ts-ignore Testing undefined required property
      expect(genericValidator(inputInvalidUndefined, rules)).toBe(false);
    });

    it('handles boolean type correctly', () => {
      const inputValid = { isActive: true };
      const inputInvalid = { isActive: 'true' };
      const rules = { isActive: { required: true, type: 'boolean' } };

      expect(genericValidator(inputValid, rules)).toBe(true);
      expect(genericValidator(inputInvalid, rules)).toBe(false);
    });

    it('handles object type correctly', () => {
      const inputValid = { data: { key: 'value' } };
      const inputInvalid = { data: 'not an object' };
      const rules = { data: { required: true, type: 'object' } };

      expect(genericValidator(inputValid, rules)).toBe(true);
      expect(genericValidator(inputInvalid, rules)).toBe(false);
    });
  });
});