import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AuthActionResponse, TLogoutData } from "../../../contexts/auth/types";
import type { RefineError } from "../../../contexts/data/types";
type Variables = {
    redirectPath?: string | false;
};
export type UseLogoutLegacyProps<TVariables> = {
    v3LegacyAuthProviderCompatible: true;
    mutationOptions?: Omit<UseMutationOptions<TLogoutData, Error | RefineError, (TVariables & Variables) | void, unknown>, "mutationFn" | "onError" | "onSuccess">;
};
export type UseLogoutProps<TVariables> = {
    v3LegacyAuthProviderCompatible?: false;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse, Error | RefineError, (TVariables & Variables) | void, unknown>, "mutationFn">;
};
export type UseLogoutCombinedProps<TVariables> = {
    v3LegacyAuthProviderCompatible: boolean;
    mutationOptions?: Omit<UseMutationOptions<AuthActionResponse | TLogoutData, Error | RefineError, (TVariables & Variables) | void, unknown>, "mutationFn">;
};
export type UseLogoutLegacyReturnType<TVariables> = UseMutationResult<TLogoutData, Error | RefineError, (TVariables & Variables) | void, unknown>;
export type UseLogoutReturnType<TVariables> = UseMutationResult<AuthActionResponse, Error | RefineError, (TVariables & Variables) | void, unknown>;
export type UseLogoutCombinedReturnType<TVariables> = UseMutationResult<AuthActionResponse | TLogoutData, Error | RefineError, (TVariables & Variables) | void, unknown>;
export declare function useLogout<TVariables = {}>(props: UseLogoutLegacyProps<TVariables>): UseLogoutLegacyReturnType<TVariables>;
export declare function useLogout<TVariables = {}>(props?: UseLogoutProps<TVariables>): UseLogoutReturnType<TVariables>;
export declare function useLogout<TVariables = {}>(props?: UseLogoutCombinedProps<TVariables>): UseLogoutCombinedReturnType<TVariables>;
export {};
//# sourceMappingURL=index.d.ts.map