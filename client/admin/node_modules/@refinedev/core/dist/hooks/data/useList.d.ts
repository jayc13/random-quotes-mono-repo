import { type QueryObserverResult, type UseQueryOptions } from "@tanstack/react-query";
import type { BaseRecord, CrudFilter, CrudSort, GetListResponse, HttpError, MetaQuery, Pagination, Prettify } from "../../contexts/data/types";
import type { LiveModeProps } from "../../contexts/live/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export interface UseListConfig {
    pagination?: Pagination;
    hasPagination?: boolean;
    sort?: CrudSort[];
    filters?: CrudFilter[];
}
export type BaseListProps = {
    /**
     * Configuration for pagination, sorting and filtering
     * @type [`UseListConfig`](/docs/api-reference/core/hooks/data/useList/#config-parameters)
     * @deprecated `config` property is deprecated. Use `pagination`, `hasPagination`, `sorters` and `filters` instead.
     */
    config?: UseListConfig;
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
     * Meta data query for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     * Meta data query for `dataProvider`
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use
     */
    dataProviderName?: string;
};
export type UseListProps<TQueryFnData, TError, TData> = {
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * Tanstack Query's [useQuery](https://tanstack.com/query/v4/docs/reference/useQuery) options
     */
    queryOptions?: UseQueryOptions<GetListResponse<TQueryFnData>, TError, GetListResponse<TData>>;
} & BaseListProps & SuccessErrorNotification<GetListResponse<TData>, TError, Prettify<BaseListProps>> & LiveModeProps & UseLoadingOvertimeOptionsProps;
/**
 * `useList` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/guides/queries `useQuery`} used for retrieving items from a `resource` with pagination, sort, and filter configurations.
 *
 * It uses the `getList` method as the query function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useList} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useList: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData>({ resource: resourceFromProp, config, filters, hasPagination, pagination, sorters, queryOptions, successNotification, errorNotification, meta, metaData, liveMode, onLiveEvent, liveParams, dataProviderName, overtimeOptions, }?: UseListProps<TQueryFnData, TError, TData>) => QueryObserverResult<GetListResponse<TData>, TError> & UseLoadingOvertimeReturnType;
//# sourceMappingURL=useList.d.ts.map