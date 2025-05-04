import type { QuoteInput } from "@/types/quote.types";
import { genericValidator } from "@/validators/generic.validator";

export const quoteInputValidator = (input: QuoteInput): boolean => {
  return genericValidator(input, {
    quote: { required: true, maxLength: 250 },
    author: { required: true, maxLength: 100 },
    categoryId: { required: true, type: "number" },
  });
};
