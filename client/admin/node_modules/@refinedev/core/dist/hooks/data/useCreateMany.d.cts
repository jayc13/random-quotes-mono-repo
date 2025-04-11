import { type UseMutationOptions } from "@tanstack/react-query";
import type { BaseRecord, CreateManyResponse, HttpError, IQueryKeys, MetaQuery } from "../../contexts/data/types";
import type { UseMutationResult } from "../../definitions/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type UseCreateManyParams<TData, TError, TVariables> = {
    resource?: string;
    values?: TVariables[];
    meta?: MetaQuery;
    metaData?: MetaQuery;
    dataProviderName?: string;
    invalidates?: Array<keyof IQueryKeys>;
} & SuccessErrorNotification<CreateManyResponse<TData>, TError, TVariables[]>;
export type UseCreateManyReturnType<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = {}> = UseMutationResult<CreateManyResponse<TData>, TError, UseCreateManyParams<TData, TError, TVariables>, unknown>;
export type UseCreateManyProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<CreateManyResponse<TData>, TError, UseCreateManyParams<TData, TError, TVariables>>, "mutationFn">;
} & UseLoadingOvertimeOptionsProps & UseCreateManyParams<TData, TError, TVariables>;
/**
 * `useCreateMany` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for multiple create mutations.
 *
 * It uses `createMany` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useCreateMany} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useCreateMany: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ resource: resourceFromProps, values: valuesFromProps, dataProviderName: dataProviderNameFromProps, successNotification: successNotificationFromProps, errorNotification: errorNotificationFromProps, meta: metaFromProps, metaData: metaDataFromProps, invalidates: invalidatesFromProps, mutationOptions, overtimeOptions, }?: UseCreateManyProps<TData, TError, TVariables>) => UseCreateManyReturnType<TData, TError, TVariables> & UseLoadingOvertimeReturnType;
//# sourceMappingURL=useCreateMany.d.ts.map