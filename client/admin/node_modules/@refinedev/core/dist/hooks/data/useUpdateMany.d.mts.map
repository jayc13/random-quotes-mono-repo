import { type UseMutationOptions } from "@tanstack/react-query";
import type { BaseKey, BaseRecord, GetListResponse, GetManyResponse, GetOneResponse, HttpError, IQueryKeys, MetaQuery, MutationMode, PrevContext as UpdateContext, UpdateManyResponse } from "../../contexts/data/types";
import type { UseMutationResult } from "../../definitions/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
export type OptimisticUpdateManyMapType<TData, TVariables> = {
    list?: ((previous: GetListResponse<TData> | null | undefined, values: TVariables, ids: BaseKey[]) => GetListResponse<TData> | null) | boolean;
    many?: ((previous: GetManyResponse<TData> | null | undefined, values: TVariables, ids: BaseKey[]) => GetManyResponse<TData> | null) | boolean;
    detail?: ((previous: GetOneResponse<TData> | null | undefined, values: TVariables, id: BaseKey) => GetOneResponse<TData> | null) | boolean;
};
export type UpdateManyParams<TData, TError, TVariables> = {
    /**
     * ids for mutation function
     */
    ids?: BaseKey[];
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * [Determines when mutations are executed](/docs/advanced-tutorials/mutation-mode/)
     */
    mutationMode?: MutationMode;
    /**
     * Duration in ms to wait before executing the mutation when `mutationMode = "undoable"`
     */
    undoableTimeout?: number;
    /**
     * Provides a function to cancel the mutation when `mutationMode = "undoable"`
     */
    onCancel?: (cancelMutation: () => void) => void;
    /**
     * Values for mutation function
     */
    values?: TVariables;
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
     * @default "default"
     */
    dataProviderName?: string;
    /**
     *  You can use it to manage the invalidations that will occur at the end of the mutation.
     */
    invalidates?: Array<keyof IQueryKeys>;
    /**
     * You can use it to manage the invalidations that will occur at the end of the mutation.
     * @default {
     *   list: true,
     *   many: true,
     *   detail: true,
     * }
     */
    optimisticUpdateMap?: OptimisticUpdateManyMapType<TData, TVariables>;
} & SuccessErrorNotification<UpdateManyResponse<TData>, TError, {
    ids: BaseKey[];
    values: TVariables;
}>;
export type UseUpdateManyReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = UseMutationResult<UpdateManyResponse<TData>, TError, UpdateManyParams<TData, TError, TVariables>, UpdateContext<TData>> & UseLoadingOvertimeReturnType;
export type UseUpdateManyProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<UpdateManyResponse<TData>, TError, UpdateManyParams<TData, TError, TVariables>, UpdateContext<TData>>, "mutationFn" | "onMutate">;
} & UseLoadingOvertimeOptionsProps & UpdateManyParams<TData, TError, TVariables>;
/**
 * `useUpdateMany` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for multiple update mutations.
 *
 * It uses `updateMany` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useUpdateMany} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useUpdateMany: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ ids: idsFromProps, resource: resourceFromProps, values: valuesFromProps, dataProviderName: dataProviderNameFromProps, successNotification: successNotificationFromProps, errorNotification: errorNotificationFromProps, meta: metaFromProps, metaData: metaDataFromProps, mutationMode: mutationModeFromProps, undoableTimeout: undoableTimeoutFromProps, onCancel: onCancelFromProps, optimisticUpdateMap: optimisticUpdateMapFromProps, invalidates: invalidatesFromProps, mutationOptions, overtimeOptions, }?: UseUpdateManyProps<TData, TError, TVariables>) => UseUpdateManyReturnType<TData, TError, TVariables>;
//# sourceMappingURL=useUpdateMany.d.ts.map