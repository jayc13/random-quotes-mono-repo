import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AuthActionResponse, TLoginData, TRegisterData } from "../../../contexts/auth/types";
import type { RefineError } from "../../../contexts/data/types";
export type UseRegisterLegacyProps<TVariables> = {
    v3LegacyAuthProviderCompatible: true;
    mutationOptions?: Omit<UseMutationOptions<TRegisterData, Error | RefineError, TVariables, unknown>, "mutationFn" | "onError" | "onSuccess">;
};
export type UseRegisterProps<TVariables> = {
    v3LegacyAuthProviderCompatible?: false;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseRegisterCombinedProps<TVariables> = {
    v3LegacyAuthProviderCompatible: boolean;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse | TRegisterData, Error | RefineError, TVariables, unknown>, "mutationFn">;
};
export type UseRegisterLegacyReturnType<TVariables> = UseMutationResult<TRegisterData, Error | RefineError, TVariables, unknown>;
export type UseRegisterReturnType<TVariables> = UseMutationResult<AuthActionResponse, Error | RefineError, TVariables, unknown>;
export type UseRegisterCombinedReturnType<TVariables> = UseMutationResult<AuthActionResponse | TLoginData, Error | RefineError, TVariables, unknown>;
export declare function useRegister<TVariables = {}>(props: UseRegisterLegacyProps<TVariables>): UseRegisterLegacyReturnType<TVariables>;
export declare function useRegister<TVariables = {}>(props?: UseRegisterProps<TVariables>): UseRegisterReturnType<TVariables>;
export declare function useRegister<TVariables = {}>(props?: UseRegisterCombinedProps<TVariables>): UseRegisterCombinedReturnType<TVariables>;
//# sourceMappingURL=index.d.ts.map