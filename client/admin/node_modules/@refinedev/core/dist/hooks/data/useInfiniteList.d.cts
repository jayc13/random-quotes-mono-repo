import { type InfiniteData, type InfiniteQueryObserverResult, type UseInfiniteQueryOptions } from "@tanstack/react-query";
import type { BaseRecord, CrudFilter, CrudSort, GetListResponse, HttpError, MetaQuery, Pagination, Prettify } from "../../contexts/data/types";
import type { LiveModeProps } from "../../contexts/live/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export interface UseInfiniteListConfig {
    pagination?: Pagination;
    hasPagination?: boolean;
    sort?: CrudSort[];
    filters?: CrudFilter[];
}
type BaseInfiniteListProps = {
    /**
     *  Metadata query for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     *  Metadata query for `dataProvider`
     *  @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * Configuration for pagination, sorting and filtering
     * @type [`useInfiniteListConfig`](/docs/api-reference/core/hooks/data/useInfiniteList/#config-parameters)
     * @deprecated `config` property is deprecated. Use `pagination`, `hasPagination`, `sorters` and `filters` instead.
     */
    config?: UseInfiniteListConfig;
    /**
     * Pagination properties
     */
    pagination?: Pagination;
    /**
     * Whether to use server-side pagination or not
     * @deprecated `hasPagination` property is deprecated. Use `pagination.mode` instead.
     */
    hasPagination?: boolean;
    /**
     * Sorter parameters
     */
    sorters?: CrudSort[];
    /**
     * Filter parameters
     */
    filters?: CrudFilter[];
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use
     */
    dataProviderName?: string;
};
export type UseInfiniteListProps<TQueryFnData, TError, TData> = {
    /**
     * Resource name for API data interactions
     */
    resource: string;
    /**
     * Tanstack Query's [useInfiniteQuery](https://tanstack.com/query/v4/docs/react/reference/useInfiniteQuery) options
     */
    queryOptions?: UseInfiniteQueryOptions<GetListResponse<TQueryFnData>, TError, GetListResponse<TData>>;
} & BaseInfiniteListProps & SuccessErrorNotification<InfiniteData<GetListResponse<TData>>, TError, Prettify<BaseInfiniteListProps>> & LiveModeProps & UseLoadingOvertimeOptionsProps;
/**
 * `useInfiniteList` is a modified version of `react-query`'s {@link https://tanstack.com/query/latest/docs/react/guides/infinite-queries `useInfiniteQuery`} used for retrieving items from a `resource` with pagination, sort, and filter configurations.
 *
 * It uses the `getList` method as the query function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useInfiniteList} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useInfiniteList: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData>({ resource: resourceFromProp, config, filters, hasPagination, pagination, sorters, queryOptions, successNotification, errorNotification, meta, metaData, liveMode, onLiveEvent, liveParams, dataProviderName, overtimeOptions, }: UseInfiniteListProps<TQueryFnData, TError, TData>) => InfiniteQueryObserverResult<GetListResponse<TData>, TError> & UseLoadingOvertimeReturnType;
export {};
//# sourceMappingURL=useInfiniteList.d.ts.map