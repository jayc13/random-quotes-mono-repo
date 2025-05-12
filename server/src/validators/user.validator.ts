import type { UpdateUserNameInput } from "@/types/user.types";
import { genericValidator } from "@/validators/generic.validator";

export const changeUserNameInputValidator = (
  input: UpdateUserNameInput,
): boolean => {
  return genericValidator(input, {
    name: { required: true, maxLength: 250, type: "string" },
  });
};
