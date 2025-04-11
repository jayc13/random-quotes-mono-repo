import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { UpdatePasswordFormTypes } from "../../../components/pages/auth/types";
import type { AuthActionResponse, TUpdatePasswordData } from "../../../contexts/auth/types";
import type { RefineError } from "../../../contexts/data/types";
export type UseUpdatePasswordLegacyProps<TVariables extends UpdatePasswordFormTypes> = {
    v3LegacyAuthProviderCompatible: true;
    mutationOptions?: Omit<UseMutationOptions<TUpdatePasswordData, Error | RefineError, TVariables, unknown>, "mutationFn" | "onError" | "onSuccess">;
};
export type UseUpdatePasswordProps<TVariables extends UpdatePasswordFormTypes> = {
    v3LegacyAuthProviderCompatible?: false;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseUpdatePasswordCombinedProps<TVariables extends UpdatePasswordFormTypes> = {
    v3LegacyAuthProviderCompatible: boolean;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse | TUpdatePasswordData, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseUpdatePasswordLegacyReturnType<TVariables extends UpdatePasswordFormTypes> = UseMutationResult<TUpdatePasswordData, Error | RefineError, TVariables, unknown>;
export type UseUpdatePasswordReturnType<TVariables extends UpdatePasswordFormTypes> = UseMutationResult<AuthActionResponse, Error | RefineError, TVariables, unknown>;
export type UseUpdatePasswordCombinedReturnType<TVariables extends UpdatePasswordFormTypes> = UseMutationResult<AuthActionResponse | TUpdatePasswordData, Error | RefineError, TVariables, unknown>;
export declare function useUpdatePassword<TVariables extends UpdatePasswordFormTypes>(props: UseUpdatePasswordLegacyProps<TVariables>): UseUpdatePasswordLegacyReturnType<TVariables>;
export declare function useUpdatePassword<TVariables extends UpdatePasswordFormTypes>(props?: UseUpdatePasswordProps<TVariables>): UseUpdatePasswordReturnType<TVariables>;
export declare function useUpdatePassword<TVariables extends UpdatePasswordFormTypes>(props?: UseUpdatePasswordCombinedProps<TVariables>): UseUpdatePasswordCombinedReturnType<TVariables>;
//# sourceMappingURL=index.d.ts.map