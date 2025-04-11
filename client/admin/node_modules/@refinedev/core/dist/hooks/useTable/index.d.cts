import React from "react";
import type { QueryObserverResult, UseQueryOptions } from "@tanstack/react-query";
import type { BaseRecord, CrudFilter, CrudSort, GetListResponse, HttpError, MetaQuery, Pagination, Prettify } from "../../contexts/data/types";
import type { LiveModeProps } from "../../contexts/live/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import type { BaseListProps } from "../data/useList";
import type { UseLoadingOvertimeOptionsProps, UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
type SetFilterBehavior = "merge" | "replace";
export type useTableProps<TQueryFnData, TError, TData> = {
    /**
     * Resource name for API data interactions
     * @default Resource name that it reads from route
     */
    resource?: string;
    /**
     * Configuration for pagination
     */
    pagination?: Pagination;
    /**
     * Initial page index
     * @default 1
     * @deprecated `initialCurrent` property is deprecated. Use `pagination.current` instead.
     */
    initialCurrent?: number;
    /**
     * Initial number of items per page
     * @default 10
     * @deprecated `initialPageSize` property is deprecated. Use `pagination.pageSize` instead.
     */
    initialPageSize?: number;
    /**
     * Sort configs
     */
    sorters?: {
        /**
         * Initial sorter state
         */
        initial?: CrudSort[];
        /**
         * Default and unchangeable sorter state
         *  @default `[]`
         */
        permanent?: CrudSort[];
        /**
         * Whether to use server side sorting or not.
         * @default "server"
         */
        mode?: "server" | "off";
    };
    /**
     * Initial sorter state
     * @deprecated `initialSorter` property is deprecated. Use `sorters.initial` instead.
     */
    initialSorter?: CrudSort[];
    /**
     * Default and unchangeable sorter state
     *  @default `[]`
     *  @deprecated `permanentSorter` property is deprecated. Use `sorters.permanent` instead.
     */
    permanentSorter?: CrudSort[];
    /**
     * Filter configs
     */
    filters?: {
        /**
         * Initial filter state
         */
        initial?: CrudFilter[];
        /**
         * Default and unchangeable filter state
         *  @default `[]`
         */
        permanent?: CrudFilter[];
        /**
         * Default behavior of the `setFilters` function
         * @default `"merge"`
         */
        defaultBehavior?: SetFilterBehavior;
        /**
         * Whether to use server side filter or not.
         * @default "server"
         */
        mode?: "server" | "off";
    };
    /**
     * Initial filter state
     * @deprecated `initialFilter` property is deprecated. Use `filters.initial` instead.
     */
    initialFilter?: CrudFilter[];
    /**
     * Default and unchangeable filter state
     * @default `[]`
     * @deprecated `permanentFilter` property is deprecated. Use `filters.permanent` instead.
     */
    permanentFilter?: CrudFilter[];
    /**
     * Default behavior of the `setFilters` function
     * @default `"merge"`
     * @deprecated `defaultSetFilterBehavior` property is deprecated. Use `filters.defaultBehavior` instead.
     */
    defaultSetFilterBehavior?: SetFilterBehavior;
    /**
     * Whether to use server side pagination or not.
     * @default `true`
     * @deprecated `hasPagination` property is deprecated. Use `pagination.mode` instead.
     */
    hasPagination?: boolean;
    /**
     * Sortings, filters, page index and records shown per page are tracked by browser history
     * @default Value set in [Refine](/docs/api-reference/core/components/refine-config/#syncwithlocation). If a custom resource is given, it will be `false`
     */
    syncWithLocation?: boolean;
    /**
     * react-query's [useQuery](https://tanstack.com/query/v4/docs/reference/useQuery) options
     */
    queryOptions?: UseQueryOptions<GetListResponse<TQueryFnData>, TError, GetListResponse<TData>>;
    /**
     * Metadata query for dataProvider
     */
    meta?: MetaQuery;
    /**
     * Metadata query for dataProvider
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     */
    dataProviderName?: string;
} & SuccessErrorNotification<GetListResponse<TData>, TError, Prettify<BaseListProps>> & LiveModeProps & UseLoadingOvertimeOptionsProps;
type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;
type SyncWithLocationParams = {
    pagination: {
        current?: number;
        pageSize?: number;
    };
    /**
     * @deprecated `sorter` is deprecated. Use `sorters` instead.
     */
    sorter?: CrudSort[];
    sorters: CrudSort[];
    filters: CrudFilter[];
};
export type useTableReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError> = {
    tableQuery: QueryObserverResult<GetListResponse<TData>, TError>;
    /**
     * @deprecated `tableQueryResult` is deprecated. Use `tableQuery` instead.
     */
    tableQueryResult: QueryObserverResult<GetListResponse<TData>, TError>;
    /**
     * @deprecated `sorter` is deprecated. Use `sorters` instead.
     */
    sorter: CrudSort[];
    sorters: CrudSort[];
    /**
     * @deprecated `setSorter` is deprecated. Use `setSorters` instead.
     */
    setSorter: (sorter: CrudSort[]) => void;
    setSorters: (sorter: CrudSort[]) => void;
    filters: CrudFilter[];
    setFilters: ((filters: CrudFilter[], behavior?: SetFilterBehavior) => void) & ((setter: (prevFilters: CrudFilter[]) => CrudFilter[]) => void);
    createLinkForSyncWithLocation: (params: SyncWithLocationParams) => string;
    current: number;
    setCurrent: ReactSetState<useTableReturnType["current"]>;
    pageSize: number;
    setPageSize: ReactSetState<useTableReturnType["pageSize"]>;
    pageCount: number;
} & UseLoadingOvertimeReturnType;
export declare function useTable<TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData>({ initialCurrent, initialPageSize, hasPagination, pagination, initialSorter, permanentSorter, defaultSetFilterBehavior, initialFilter, permanentFilter, filters: filtersFromProp, sorters: sortersFromProp, syncWithLocation: syncWithLocationProp, resource: resourceFromProp, successNotification, errorNotification, queryOptions, liveMode: liveModeFromProp, onLiveEvent, liveParams, meta, metaData, dataProviderName, overtimeOptions, }?: useTableProps<TQueryFnData, TError, TData>): useTableReturnType<TData, TError>;
export {};
//# sourceMappingURL=index.d.ts.map