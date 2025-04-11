import type { UseFormProps, UseFormReturnType } from "./types";
import type { BaseRecord, HttpError } from "../../contexts/data/types";
export type { ActionParams, UseFormProps, UseFormReturnType, AutoSaveIndicatorElements, AutoSaveProps, AutoSaveReturnType, FormAction, RedirectAction, RedirectionTypes, FormWithSyncWithLocationParams, } from "./types";
/**
 * This hook orchestrates Refine's data hooks to create, edit, and clone data. It also provides a set of features to make it easier for users to implement their real world needs and handle edge cases such as redirects, invalidation, auto-save and more.
 *
 * @see {@link https://refine.dev/docs/data/hooks/use-form} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/core/interface-references/#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/core/interface-references/#httperror `HttpError`}
 * @typeParam TVariables - Values for params. default `{}`
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/core/interface-references/#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 * @typeParam TResponse - Result data returned by the mutation function. Extends {@link https://refine.dev/docs/core/interface-references/#baserecord `BaseRecord`}. Defaults to `TData`
 * @typeParam TResponseError - Custom error object that extends {@link https://refine.dev/docs/core/interface-references/#httperror `HttpError`}. Defaults to `TError`
 *
 */
export declare const useForm: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}, TData extends BaseRecord = TQueryFnData, TResponse extends BaseRecord = TData, TResponseError extends HttpError = TError>(props?: UseFormProps<TQueryFnData, TError, TVariables, TData, TResponse, TResponseError>) => UseFormReturnType<TQueryFnData, TError, TVariables, TData, TResponse, TResponseError>;
//# sourceMappingURL=index.d.ts.map