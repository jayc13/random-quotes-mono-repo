import type { QueryObserverResult, UseQueryOptions } from "@tanstack/react-query";
import type { BaseKey, BaseOption, BaseRecord, CrudFilter, CrudSort, GetListResponse, GetManyResponse, HttpError, MetaQuery, Pagination, Prettify } from "../../contexts/data/types";
import type { LiveModeProps } from "../../contexts/live/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import type { BaseListProps } from "../data/useList";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type SelectedOptionsOrder = "in-place" | "selected-first";
export type UseSelectProps<TQueryFnData, TError, TData> = {
    /**
     * Resource name for API data interactions
     */
    resource: string;
    /**
     * Set the option's label value
     * @default `"title"`
     */
    optionLabel?: (keyof TData extends string ? keyof TData : never) | ((item: TData) => string);
    /**
     * Set the option's value
     * @default `"id"`
     */
    optionValue?: (keyof TData extends string ? keyof TData : never) | ((item: TData) => string);
    /**
     * Field name to search for.
     * @description If provided `optionLabel` is a string, uses `optionLabel`'s value.
     * @default `"title"`
     * @example
     * // when optionLabel is string.
     * useSelect({ optionLabel: "name" })
     * // uses `name` field.
     * @example
     * // when optionLabel is function.
     * useSelect({ optionLabel: (field) => field.description })
     * // uses `title`, since `optionLabel` is a function.
     */
    searchField?: keyof TData extends string ? keyof TData : never;
    /**
     * Allow us to sort the options
     * @deprecated Use `sorters` instead
     */
    sort?: CrudSort[];
    /**
     * Allow us to sort the options
     */
    sorters?: CrudSort[];
    /**
     * Resource name for API data interactions
     */
    filters?: CrudFilter[];
    /**
     * Adds extra `options`
     */
    defaultValue?: BaseKey | BaseKey[];
    /**
     * Allow us to sort the selection options
     * @default `in-place`
     */
    selectedOptionsOrder?: SelectedOptionsOrder;
    /**
     * The number of milliseconds to delay
     * @default `300`
     */
    debounce?: number;
    /**
     * react-query [useQuery](https://react-query.tanstack.com/reference/useQuery) options
     */
    queryOptions?: UseQueryOptions<GetListResponse<TQueryFnData>, TError, GetListResponse<TData>>;
    /**
     * Pagination option from [`useList()`](/docs/api-reference/core/hooks/data/useList/)
     * @type {  current?: number; pageSize?: number;}
     * @default `undefined`
     */
    pagination?: Prettify<Omit<Pagination, "mode"> & {
        /**
         * Whether to use server side pagination or not.
         * @default "off"
         */
        mode?: Pagination["mode"];
    }>;
    /**
     * Disabling pagination option from [`useList()`](/docs/api-reference/core/hooks/data/useList/)
     * @type boolean
     * @default `false`
     * @deprecated `hasPagination` is deprecated, use `pagination.mode` instead.
     */
    hasPagination?: boolean;
    /**
     * react-query [useQuery](https://react-query.tanstack.com/reference/useQuery) options
     */
    defaultValueQueryOptions?: UseQueryOptions<GetManyResponse<TQueryFnData>, TError>;
    /**
     * If defined, this callback allows us to override all filters for every search request.
     * @default `undefined`
     */
    onSearch?: (value: string) => CrudFilter[];
    /**
     * Additional meta data to pass to the `useMany` from the data provider
     */
    meta?: MetaQuery;
    /**
     * Additional meta data to pass to the `useMany` from the data provider
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     * @default `default`
     */
    dataProviderName?: string;
    /**
     * Amount of records to fetch in select box list.
     * @deprecated use [`pagination`](https://refine.dev/docs/api-reference/core/interfaceReferences/#pagination) instead
     * @default `undefined`
     */
    fetchSize?: number;
} & SuccessErrorNotification<GetListResponse<TData>, TError, Prettify<BaseListProps>> & LiveModeProps & UseLoadingOvertimeOptionsProps;
export type UseSelectReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TOption extends BaseOption = BaseOption> = {
    query: QueryObserverResult<GetListResponse<TData>, TError>;
    defaultValueQuery: QueryObserverResult<GetManyResponse<TData>>;
    /**
     * @deprecated Use `query` instead
     */
    queryResult: QueryObserverResult<GetListResponse<TData>, TError>;
    /**
     * @deprecated Use `defaultValueQuery` instead
     */
    defaultValueQueryResult: QueryObserverResult<GetManyResponse<TData>>;
    onSearch: (value: string) => void;
    options: TOption[];
} & UseLoadingOvertimeReturnType;
/**
 * `useSelect` hook is used to fetch data from the dataProvider and return the options for the select box.
 *
 * It uses `getList` method as query function from the dataProvider that is
 * passed to {@link https://refine.dev/docs/api-reference/core/components/refine-config/ `<Refine>`}.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/useSelect} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useSelect: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData, TOption extends BaseOption = BaseOption>(props: UseSelectProps<TQueryFnData, TError, TData>) => UseSelectReturnType<TData, TError, TOption>;
//# sourceMappingURL=index.d.ts.map