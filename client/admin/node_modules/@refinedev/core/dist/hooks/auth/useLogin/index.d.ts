import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AuthActionResponse, TLoginData } from "../../../contexts/auth/types";
import type { RefineError } from "../../../contexts/data/types";
export type UseLoginLegacyProps<TVariables> = {
    v3LegacyAuthProviderCompatible: true;
    mutationOptions?: Omit<UseMutationOptions<TLoginData, Error | RefineError, TVariables, unknown>, "mutationFn" | "onError" | "onSuccess">;
};
export type UseLoginProps<TVariables> = {
    v3LegacyAuthProviderCompatible?: false;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseLoginCombinedProps<TVariables> = {
    v3LegacyAuthProviderCompatible: boolean;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse | TLoginData, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseLoginLegacyReturnType<TVariables> = UseMutationResult<TLoginData, Error | RefineError, TVariables, unknown>;
export type UseLoginReturnType<TVariables> = UseMutationResult<AuthActionResponse, Error | RefineError, TVariables, unknown>;
export type UseLoginCombinedReturnType<TVariables> = UseMutationResult<AuthActionResponse | TLoginData, Error | RefineError, TVariables, unknown>;
export declare function useLogin<TVariables = {}>(props: UseLoginLegacyProps<TVariables>): UseLoginLegacyReturnType<TVariables>;
export declare function useLogin<TVariables = {}>(props?: UseLoginProps<TVariables>): UseLoginReturnType<TVariables>;
export declare function useLogin<TVariables = {}>(props?: UseLoginCombinedProps<TVariables>): UseLoginCombinedReturnType<TVariables>;
//# sourceMappingURL=index.d.ts.map