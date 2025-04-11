import { type QueryObserverResult, type UseQueryOptions } from "@tanstack/react-query";
import type { BaseRecord, CrudFilter, CrudSort, CustomResponse, HttpError, MetaQuery, Prettify } from "../../contexts/data/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
interface UseCustomConfig<TQuery, TPayload> {
    /**
     * @deprecated `sort` is deprecated, use `sorters` instead.
     */
    sort?: CrudSort[];
    sorters?: CrudSort[];
    filters?: CrudFilter[];
    query?: TQuery;
    payload?: TPayload;
    headers?: {};
}
export type UseCustomProps<TQueryFnData, TError, TQuery, TPayload, TData> = {
    /**
     * request's URL
     */
    url: string;
    /**
     * request's method (`GET`, `POST`, etc.)
     */
    method: "get" | "delete" | "head" | "options" | "post" | "put" | "patch";
    /**
     * The config of your request. You can send headers, payload, query, filters and sorters using this field
     */
    config?: UseCustomConfig<TQuery, TPayload>;
    /**
     * react-query's [useQuery](https://tanstack.com/query/v4/docs/reference/useQuery) options"
     */
    queryOptions?: UseQueryOptions<CustomResponse<TQueryFnData>, TError, CustomResponse<TData>>;
    /**
     * meta data for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     * meta data for `dataProvider`
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     */
    dataProviderName?: string;
} & SuccessErrorNotification<CustomResponse<TData>, TError, Prettify<UseCustomConfig<TQuery, TPayload> & MetaQuery>> & UseLoadingOvertimeOptionsProps;
/**
 * `useCustom` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/guides/queries `useQuery`} used for custom requests.
 *
 * It uses the `custom` method from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useCustom} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TQuery - Values for query params
 * @typeParam TPayload - Values for params
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useCustom: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TQuery = unknown, TPayload = unknown, TData extends BaseRecord = TQueryFnData>({ url, method, config, queryOptions, successNotification, errorNotification, meta, metaData, dataProviderName, overtimeOptions, }: UseCustomProps<TQueryFnData, TError, TQuery, TPayload, TData>) => QueryObserverResult<CustomResponse<TData>, TError> & UseLoadingOvertimeReturnType;
export {};
//# sourceMappingURL=useCustom.d.ts.map