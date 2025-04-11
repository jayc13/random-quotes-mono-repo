import { type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { PermissionResponse } from "../../../contexts/auth/types";
export type UsePermissionsLegacyProps<TData = any, TParams extends Record<string, any> = Record<string, any>> = {
    v3LegacyAuthProviderCompatible: true;
    options?: UseQueryOptions<TData>;
    params?: TParams;
};
export type UsePermissionsProps<TData = PermissionResponse, TParams extends Record<string, any> = Record<string, any>> = {
    v3LegacyAuthProviderCompatible?: false;
    options?: UseQueryOptions<TData>;
    params?: TParams;
};
export type UsePermissionsCombinedProps<TData = any, TParams extends Record<string, any> = Record<string, any>> = {
    v3LegacyAuthProviderCompatible: boolean;
    options?: UseQueryOptions<TData> | UseQueryOptions<PermissionResponse>;
    params?: TParams;
};
export type UsePermissionsLegacyReturnType<TData = any> = UseQueryResult<TData, unknown>;
export type UsePermissionsReturnType<TData = PermissionResponse> = UseQueryResult<TData, unknown>;
export type UsePermissionsCombinedReturnType<TData = any> = UseQueryResult<TData, unknown> | UseQueryResult<PermissionResponse, unknown>;
export declare function usePermissions<TData = any, TParams extends Record<string, any> = Record<string, any>>(props: UsePermissionsLegacyProps<TData, TParams>): UsePermissionsLegacyReturnType<TData>;
export declare function usePermissions<TData = PermissionResponse, TParams extends Record<string, any> = Record<string, any>>(props?: UsePermissionsProps<TData, TParams>): UsePermissionsReturnType<TData>;
export declare function usePermissions<TData = any, TParams extends Record<string, any> = Record<string, any>>(props?: UsePermissionsCombinedProps<TData, TParams>): UsePermissionsCombinedReturnType<TData>;
//# sourceMappingURL=index.d.ts.map