import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { BaseKey, BaseRecord, DeleteManyResponse, HttpError, IQueryKeys, MetaQuery, MutationMode, PrevContext as DeleteContext } from "../../contexts/data/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type DeleteManyParams<TData, TError, TVariables> = {
    /**
     * ids for mutation function
     */
    ids: BaseKey[];
    /**
     * Resource name for API data interactions
     */
    resource: string;
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
     * Metadata query for dataProvider
     */
    meta?: MetaQuery;
    /**
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
     * Values for mutation function
     */
    values?: TVariables;
} & SuccessErrorNotification<DeleteManyResponse<TData>, TError, BaseKey[]>;
export type UseDeleteManyReturnType<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = {}> = UseMutationResult<DeleteManyResponse<TData>, TError, DeleteManyParams<TData, TError, TVariables>, unknown> & UseLoadingOvertimeReturnType;
export type UseDeleteManyProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<DeleteManyResponse<TData>, TError, DeleteManyParams<TData, TError, TVariables>, DeleteContext<TData>>, "mutationFn" | "onError" | "onSuccess" | "onSettled" | "onMutate">;
} & UseLoadingOvertimeOptionsProps;
/**
 * `useDeleteMany` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for multiple delete mutations.
 *
 * It uses `deleteMany` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useDeleteMany} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/core/interfaceReferences#httperror `HttpError`}
 * @typeParam TVariables - Values for params. default `{}`
 *
 */
export declare const useDeleteMany: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ mutationOptions, overtimeOptions, }?: UseDeleteManyProps<TData, TError, TVariables>) => UseDeleteManyReturnType<TData, TError, TVariables>;
//# sourceMappingURL=useDeleteMany.d.ts.map