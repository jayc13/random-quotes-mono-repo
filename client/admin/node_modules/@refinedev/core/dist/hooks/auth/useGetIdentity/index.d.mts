import { type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IdentityResponse } from "../../../contexts/auth/types";
export type UseGetIdentityLegacyProps<TData> = {
    v3LegacyAuthProviderCompatible: true;
    queryOptions?: UseQueryOptions<TData>;
};
export type UseGetIdentityProps<TData = IdentityResponse> = {
    v3LegacyAuthProviderCompatible?: false;
    queryOptions?: UseQueryOptions<TData>;
};
export type UseGetIdentityCombinedProps<TData = any> = {
    v3LegacyAuthProviderCompatible: boolean;
    queryOptions?: UseQueryOptions<TData> | UseQueryOptions<IdentityResponse>;
};
export type UseGetIdentityLegacyReturnType<TData> = UseQueryResult<TData, unknown>;
export type UseGetIdentityReturnType<TData = IdentityResponse> = UseQueryResult<TData, unknown>;
export type UsePermissionsCombinedReturnType<TData = any> = UseQueryResult<TData, unknown> | UseQueryResult<IdentityResponse, unknown>;
export declare function useGetIdentity<TData = any>(props: UseGetIdentityLegacyProps<TData>): UseGetIdentityLegacyReturnType<TData>;
export declare function useGetIdentity<TData = IdentityResponse>(props?: UseGetIdentityProps<TData>): UseGetIdentityReturnType<TData>;
export declare function useGetIdentity<TData = any>(props?: UseGetIdentityCombinedProps<TData>): UsePermissionsCombinedReturnType<TData>;
//# sourceMappingURL=index.d.ts.map