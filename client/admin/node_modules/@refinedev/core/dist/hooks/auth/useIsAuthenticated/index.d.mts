import { type UseQueryResult } from "@tanstack/react-query";
import type { CheckResponse } from "../../../contexts/auth/types";
export type UseIsAuthenticatedLegacyProps = {
    v3LegacyAuthProviderCompatible: true;
    params?: any;
};
export type UseIsAuthenticatedProps = {
    v3LegacyAuthProviderCompatible?: false;
    params?: any;
};
export type UseIsAuthenticatedCombinedProps = {
    v3LegacyAuthProviderCompatible: boolean;
    params?: any;
};
export type UseIsAuthenticatedLegacyReturnType = UseQueryResult<any, any>;
export type UseIsAuthenticatedReturnType = UseQueryResult<CheckResponse, any>;
export type UseIsAuthenticatedCombinedReturnType = UseQueryResult<CheckResponse | any, any>;
export declare function useIsAuthenticated(props: UseIsAuthenticatedLegacyProps): UseIsAuthenticatedLegacyReturnType;
export declare function useIsAuthenticated(props?: UseIsAuthenticatedProps): UseIsAuthenticatedReturnType;
export declare function useIsAuthenticated(props?: UseIsAuthenticatedCombinedProps): UseIsAuthenticatedCombinedReturnType;
/**
 * @deprecated `useAuthenticated` is deprecated with refine@4, use `useIsAuthenticated` instead, however, we still support `useAuthenticated` for backward compatibility.
 */
export declare const useAuthenticated: typeof useIsAuthenticated;
//# sourceMappingURL=index.d.ts.map