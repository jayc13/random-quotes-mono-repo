import { type UseMutationResult } from "@tanstack/react-query";
import type { OnErrorResponse } from "../../../contexts/auth/types";
export type UseOnErrorLegacyProps = {
    v3LegacyAuthProviderCompatible: true;
};
export type UseOnErrorProps = {
    v3LegacyAuthProviderCompatible?: false;
};
export type UseOnErrorCombinedProps = {
    v3LegacyAuthProviderCompatible: boolean;
};
export type UseOnErrorLegacyReturnType = UseMutationResult<void, string | undefined, any, unknown>;
export type UseOnErrorReturnType = UseMutationResult<OnErrorResponse, unknown, unknown, unknown>;
export type UseOnErrorCombinedReturnType = UseMutationResult<OnErrorResponse | void, unknown, unknown, unknown>;
export declare function useOnError(props: UseOnErrorLegacyProps): UseOnErrorLegacyReturnType;
export declare function useOnError(props?: UseOnErrorProps): UseOnErrorReturnType;
export declare function useOnError(props?: UseOnErrorCombinedProps): UseOnErrorCombinedReturnType;
/**
 * @deprecated `useCheckError` is deprecated with refine@4, use `useOnError` instead, however, we still support `useCheckError` for backward compatibility.
 */
export declare const useCheckError: typeof useOnError;
//# sourceMappingURL=index.d.ts.map