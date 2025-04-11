import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AuthActionResponse, TForgotPasswordData } from "../../../contexts/auth/types";
import type { RefineError } from "../../../contexts/data/types";
export type UseForgotPasswordLegacyProps<TVariables> = {
    v3LegacyAuthProviderCompatible: true;
    mutationOptions?: Omit<UseMutationOptions<TForgotPasswordData, Error | RefineError, TVariables, unknown>, "mutationFn" | "onError" | "onSuccess">;
};
export type UseForgotPasswordProps<TVariables> = {
    v3LegacyAuthProviderCompatible?: false;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseForgotPasswordCombinedProps<TVariables> = {
    v3LegacyAuthProviderCompatible: boolean;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse | TForgotPasswordData, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseForgotPasswordLegacyReturnType<TVariables> = UseMutationResult<TForgotPasswordData, Error | RefineError, TVariables, unknown>;
export type UseForgotPasswordReturnType<TVariables> = UseMutationResult<AuthActionResponse, Error | RefineError, TVariables, unknown>;
export type UseForgotPasswordCombinedReturnType<TVariables> = UseMutationResult<AuthActionResponse | TForgotPasswordData, Error | RefineError, TVariables, unknown>;
export declare function useForgotPassword<TVariables = {}>(props: UseForgotPasswordLegacyProps<TVariables>): UseForgotPasswordLegacyReturnType<TVariables>;
export declare function useForgotPassword<TVariables = {}>(props?: UseForgotPasswordProps<TVariables>): UseForgotPasswordReturnType<TVariables>;
export declare function useForgotPassword<TVariables = {}>(props?: UseForgotPasswordCombinedProps<TVariables>): UseForgotPasswordCombinedReturnType<TVariables>;
//# sourceMappingURL=index.d.ts.map