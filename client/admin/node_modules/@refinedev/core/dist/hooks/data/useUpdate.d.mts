import { type UseMutationOptions } from "@tanstack/react-query";
import type { BaseKey, BaseRecord, GetListResponse, GetManyResponse, GetOneResponse, HttpError, IQueryKeys, MetaQuery, MutationMode, PrevContext as UpdateContext, UpdateResponse } from "../../contexts/data/types";
import type { UseMutationResult } from "../../definitions/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type OptimisticUpdateMapType<TData, TVariables> = {
    list?: ((previous: GetListResponse<TData> | null | undefined, values: TVariables, id: BaseKey) => GetListResponse<TData> | null) | boolean;
    many?: ((previous: GetManyResponse<TData> | null | undefined, values: TVariables, id: BaseKey) => GetManyResponse<TData> | null) | boolean;
    detail?: ((previous: GetOneResponse<TData> | null | undefined, values: TVariables, id: BaseKey) => GetOneResponse<TData> | null) | boolean;
};
export type UpdateParams<TData, TError, TVariables> = {
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * id for mutation function
     */
    id?: BaseKey;
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
     * @default "default"
     */
    dataProviderName?: string;
    /**
     *  You can use it to manage the invalidations that will occur at the end of the mutation.
     */
    invalidates?: Array<keyof IQueryKeys>;
    /**
     * You can use it to customize the optimistic update logic.
     * @default {
     *   list: true,
     *   many: true,
     *   detail: true,
     * }
     */
    optimisticUpdateMap?: OptimisticUpdateMapType<TData, TVariables>;
} & SuccessErrorNotification<UpdateResponse<TData>, TError, {
    id: BaseKey;
    values: TVariables;
}>;
export type UseUpdateReturnType<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = UseMutationResult<UpdateResponse<TData>, TError, UpdateParams<TData, TError, TVariables>, UpdateContext<TData>> & UseLoadingOvertimeReturnType;
export type UseUpdateProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<UpdateResponse<TData>, TError, UpdateParams<TData, TError, TVariables>, UpdateContext<TData>>, "mutationFn" | "onMutate">;
} & UseLoadingOvertimeOptionsProps & UpdateParams<TData, TError, TVariables>;
/**
 * `useUpdate` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for update mutations.
 *
 * It uses `update` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useUpdate} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useUpdate: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ id: idFromProps, resource: resourceFromProps, values: valuesFromProps, dataProviderName: dataProviderNameFromProps, successNotification: successNotificationFromProps, errorNotification: errorNotificationFromProps, meta: metaFromProps, metaData: metaDataFromProps, mutationMode: mutationModeFromProps, undoableTimeout: undoableTimeoutFromProps, onCancel: onCancelFromProps, optimisticUpdateMap: optimisticUpdateMapFromProps, invalidates: invalidatesFromProps, mutationOptions, overtimeOptions, }?: UseUpdateProps<TData, TError, TVariables>) => UseUpdateReturnType<TData, TError, TVariables>;
//# sourceMappingURL=useUpdate.d.ts.map