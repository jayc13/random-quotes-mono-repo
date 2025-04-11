import { type UseMutationOptions } from "@tanstack/react-query";
import type { BaseRecord, CreateResponse, HttpError, IQueryKeys, MetaQuery } from "../../contexts/data/types";
import type { UseMutationResult } from "../../definitions/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type UseCreateParams<TData, TError, TVariables> = {
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * Values for mutation function
     */
    values?: TVariables;
    /**
     * Meta data for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     * Meta data for `dataProvider`
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     */
    dataProviderName?: string;
    /**
     * You can use it to manage the invalidations that will occur at the end of the mutation.
     */
    invalidates?: Array<keyof IQueryKeys>;
} & SuccessErrorNotification<CreateResponse<TData>, TError, TVariables>;
export type UseCreateReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = UseMutationResult<CreateResponse<TData>, TError, UseCreateParams<TData, TError, TVariables>, unknown>;
export type UseCreateProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<CreateResponse<TData>, TError, UseCreateParams<TData, TError, TVariables>, unknown>, "mutationFn">;
} & UseLoadingOvertimeOptionsProps & UseCreateParams<TData, TError, TVariables>;
/**
 * `useCreate` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for create mutations.
 *
 * It uses `create` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useCreate} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useCreate: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ resource: resourceFromProps, values: valuesFromProps, dataProviderName: dataProviderNameFromProps, successNotification: successNotificationFromProps, errorNotification: errorNotificationFromProps, invalidates: invalidatesFromProps, meta: metaFromProps, metaData: metaDataFromProps, mutationOptions, overtimeOptions, }?: UseCreateProps<TData, TError, TVariables>) => UseCreateReturnType<TData, TError, TVariables> & UseLoadingOvertimeReturnType;
//# sourceMappingURL=useCreate.d.ts.map