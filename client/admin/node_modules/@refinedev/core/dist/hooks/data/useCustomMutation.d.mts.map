import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { BaseRecord, CreateResponse, HttpError, MetaQuery, Prettify } from "../../contexts/data/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
interface UseCustomMutationConfig {
    headers?: {};
}
type useCustomMutationParams<TData, TError, TVariables> = {
    url: string;
    method: "post" | "put" | "patch" | "delete";
    values: TVariables;
    /**
     * Meta data for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     * Meta data for `dataProvider`
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    dataProviderName?: string;
    config?: UseCustomMutationConfig;
} & SuccessErrorNotification<CreateResponse<TData>, TError, Prettify<UseCustomMutationConfig & MetaQuery>>;
export type UseCustomMutationReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = UseMutationResult<CreateResponse<TData>, TError, useCustomMutationParams<TData, TError, TVariables>, unknown>;
export type UseCustomMutationProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<CreateResponse<TData>, TError, useCustomMutationParams<TData, TError, TVariables>, unknown>, "mutationFn" | "onError" | "onSuccess">;
} & UseLoadingOvertimeOptionsProps;
/**
 * `useCustomMutation` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for create mutations.
 *
 * It uses the `custom` method from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useCustomMutation} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useCustomMutation: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ mutationOptions, overtimeOptions, }?: UseCustomMutationProps<TData, TError, TVariables>) => UseCustomMutationReturnType<TData, TError, TVariables> & UseLoadingOvertimeReturnType;
export {};
//# sourceMappingURL=useCustomMutation.d.ts.map