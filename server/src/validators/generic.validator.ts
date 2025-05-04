import { type } from "node:os";

type ValidationRule = {
  required?: boolean;
  maxLength?: number;
  type?:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "function"
    | "undefined"
    | "symbol"
    | "bigint";
};

type RuleDefinition = ValidationRule | ((value: unknown) => boolean);

export const genericValidator = <T>(
  input: T,
  rules: Record<string, RuleDefinition>,
): boolean => {
  if (input === null || input === undefined) {
    return false;
  }
  for (const [key, rule] of Object.entries(rules)) {
    if (!rule) {
      continue;
    }
    // @ts-ignore
    const value: unknown = input[key];

    if (typeof rule === "function") {
      const isValid = rule(value);
      if (!isValid) {
        return false;
      }
      continue;
    }

    // Type guard to ensure rule is a ValidationRule object
    if (typeof rule !== "object") {
      // Handle cases where rule is neither a function nor a valid object if necessary
      // Or assume it's always either a function or a ValidationRule object based on RuleDefinition
      continue;
    }

    if (
      rule.required &&
      (value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === ""))
    ) {
      return false;
    }

    if (
      rule.maxLength !== undefined && // Check if maxLength is defined
      typeof value === "string" &&
      value.length > rule.maxLength
    ) {
      return false;
    }

    if (rule.type && typeof rule.type === "string") {
      // The list of valid typeof values is already enforced by the ValidationRule type
      // No need for validTypeofValues array and check
      if (typeof value !== rule.type) {
        return false;
      }
    }
  }

  return true;
};
