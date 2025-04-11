import { type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { HttpError, MetaQuery } from "../../../contexts/data/types";
export type UseLogProps<TQueryFnData, TError, TData> = {
    resource: string;
    action?: string;
    meta?: Record<number | string, any>;
    author?: Record<number | string, any>;
    queryOptions?: UseQueryOptions<TQueryFnData, TError, TData>;
    metaData?: MetaQuery;
};
/**
 * useLogList is used to get and filter audit logs.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/audit-log/useLogList} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function.
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Defaults to `TQueryFnData`
 *
 */
export declare const useLogList: <TQueryFnData = any, TError extends HttpError = HttpError, TData = TQueryFnData>({ resource, action, meta, author, metaData, queryOptions, }: UseLogProps<TQueryFnData, TError, TData>) => UseQueryResult<TData>;
//# sourceMappingURL=index.d.ts.map