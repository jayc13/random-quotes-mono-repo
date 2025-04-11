import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { BaseKey, BaseRecord, DeleteOneResponse, HttpError, IQueryKeys, MetaQuery, MutationMode, PrevContext as DeleteContext } from "../../contexts/data/types";
import type { SuccessErrorNotification } from "../../contexts/notification/types";
import { type UseLoadingOvertimeOptionsProps, type UseLoadingOvertimeReturnType } from "../useLoadingOvertime";
export type DeleteParams<TData, TError, TVariables> = {
    /**
     * id for mutation function
     */
    id: BaseKey;
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
} & SuccessErrorNotification<DeleteOneResponse<TData>, TError, BaseKey>;
export type UseDeleteReturnType<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = {}> = UseMutationResult<DeleteOneResponse<TData>, TError, DeleteParams<TData, TError, TVariables>, DeleteContext<TData>> & UseLoadingOvertimeReturnType;
export type UseDeleteProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    mutationOptions?: Omit<UseMutationOptions<DeleteOneResponse<TData>, TError, DeleteParams<TData, TError, TVariables>, DeleteContext<TData>>, "mutationFn" | "onError" | "onSuccess" | "onSettled" | "onMutate">;
} & UseLoadingOvertimeOptionsProps;
/**
 * `useDelete` is a modified version of `react-query`'s {@link https://react-query.tanstack.com/reference/useMutation `useMutation`} for delete mutations.
 *
 * It uses `deleteOne` method as mutation function from the `dataProvider` which is passed to `<Refine>`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/data/useDelete} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for params. default `{}`
 *
 */
export declare const useDelete: <TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}>({ mutationOptions, overtimeOptions, }?: UseDeleteProps<TData, TError, TVariables>) => UseDeleteReturnType<TData, TError, TVariables>;
//# sourceMappingURL=useDelete.d.ts.map