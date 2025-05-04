import type { CategoryInput } from "@/types/category.types";
import { genericValidator } from "@/validators/generic.validator";

export const categoryInputValidator = (input: CategoryInput): boolean => {
  return genericValidator(input, {
    name: { required: true, maxLength: 250, type: "string" },
  });
};
