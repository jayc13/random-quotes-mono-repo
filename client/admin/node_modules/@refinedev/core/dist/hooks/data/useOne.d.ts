import { type QueryObserverResult, type UseQueryOptions } from "@tanstack/react-query";
import type { BaseKey, BaseRecord, GetOneResponse, HttpError, MetaQuery, Prettify } from "../../contexts/data/types";
import type { LiveModeProps } from "../../contexts/live/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type UseOneProps<TQueryFnData, TError, TData> = {
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * id of the item in the resource
     * @type [`BaseKey`](/docs/api-reference/core/interfaceReferences/#basekey)
     */
    id?: BaseKey;
    /**
     * react-query's [useQuery](https://tanstack.com/query/v4/docs/reference/useQuery) options
     */
    queryOptions?: UseQueryOptions<GetOneResponse<TQueryFnData>, TError, GetOneResponse<TData>>;
    /**
     * Metadata query for `dataProvider`,
     */
    meta?: MetaQuery;
    /**
     * Meta data query for `dataProvider`,
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     * @default `"default"``
     */
    dataProviderName?: string;
} & SuccessErrorNotification<GetOneResponse<TData>, TError, Prettify<{
    id?: BaseKey;
} & MetaQuery>> & LiveModeProps & UseLoadingOvertimeOptionsProps;
/**
 * `useOne` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/guides/queries `useQuery`} used for retrieving single items from a `resource`.
 *
 * It uses `getOne` method as query function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useOne} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useOne: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData>({ resource: resourceFromProp, id, queryOptions, successNotification, errorNotification, meta, metaData, liveMode, onLiveEvent, liveParams, dataProviderName, overtimeOptions, }: UseOneProps<TQueryFnData, TError, TData>) => QueryObserverResult<GetOneResponse<TData>, TError> & UseLoadingOvertimeReturnType;
//# sourceMappingURL=useOne.d.ts.map