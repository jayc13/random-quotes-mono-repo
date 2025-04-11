import type { UseShowProps, UseShowReturnType } from "./types";
import type { BaseRecord, HttpError } from "../../contexts/data/types";
export type { UseShowProps, UseShowReturnType, useShowProps, useShowReturnType, } from "./types";
/**
 * `useShow` hook allows you to fetch the desired record.
 * It uses `getOne` method as query function from the dataProvider that is
 * passed to {@link https://refine.dev/docs/core/refine-component `<Refine>`}.
 *
 * @see {@link https://refine.dev/docs/data/hooks/use-show} for more details.
 *
 * @typeParam TQueryFnData - Result data returned by the query function. Extends {@link https://refine.dev/docs/core/interface-references/#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/core/interface-references/#httperror `HttpError`}
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/core/interface-references/#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 *
 */
export declare const useShow: <TQueryFnData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TData extends BaseRecord = TQueryFnData>({ resource: resourceFromProp, id, meta, metaData, queryOptions, overtimeOptions, ...useOneProps }?: UseShowProps<TQueryFnData, TError, TData>) => UseShowReturnType<TData, TError>;
//# sourceMappingURL=index.d.ts.map