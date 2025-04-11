/// <reference types="react" />
import papaparse from "papaparse";
import type { BaseRecord, HttpError, MetaQuery } from "../../contexts/data/types";
import type { UseCreateReturnType } from "../../hooks/data/useCreate";
import type { UseCreateManyReturnType } from "../../hooks/data/useCreateMany";
import type { MapDataFn } from "../export/types";
export type ImportSuccessResult<TVariables, TData> = {
    request: TVariables[];
    type: "success";
    response: TData[];
};
export type ImportErrorResult<TVariables> = {
    request: TVariables[];
    type: "error";
    response: HttpError[];
};
export type OnFinishParams<TVariables, TData> = {
    succeeded: ImportSuccessResult<TVariables, TData>[];
    errored: ImportErrorResult<TVariables>[];
};
export type OnProgressParams = {
    totalAmount: number;
    processedAmount: number;
};
export type ImportOptions<TItem, TVariables = any, TData extends BaseRecord = BaseRecord> = {
    /**
     * Resource name for API data interactions.
     * @default Resource name that it reads from route
     * @deprecated `resourceName` is deprecated. Use `resource` instead.
     */
    resourceName?: string;
    /**
     * Resource name for API data interactions.
     * @default Resource name that it reads from route
     */
    resource?: string;
    /**
     * A mapping function that runs for every record. Mapped data will be included in the file contents.
     */
    mapData?: MapDataFn<TItem, TVariables>;
    /**
     * Custom Papa Parse options.
     * @type [`ParseConfig`](https://www.papaparse.com/docs)
     */
    paparseOptions?: papaparse.ParseConfig;
    /**
     * Requests batch size. If it is 1, all records are sent one by one. By default, it is [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) to send all records in one batch. If it is more than 1, `createMany` should be implemented on DataProvider.
     */
    batchSize?: number;
    /**
     * Called with errors and successful responses when all requests are sent.
     */
    onFinish?: (results: OnFinishParams<TVariables, TData>) => void;
    /**
     *  Metadata query for `dataProvider`
     */
    meta?: MetaQuery;
    /**
     *  Metadata query for `dataProvider`
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery;
    /**
     *  A callback function that returns a current state of uploading process.
     *
     *  Ex: `percentage = onProgressParams.processedAmount / onProgressParams.totalAmount * 100`
     */
    onProgress?: (onProgressParams: OnProgressParams) => void;
    /**
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     */
    dataProviderName?: string;
};
export type CreatedValuesType<TVariables, TData> = ImportSuccessResult<TVariables, TData> | ImportErrorResult<TVariables>;
export type HandleChangeType<TVariables, TData> = (onChangeParams: {
    file: Partial<File>;
}) => Promise<CreatedValuesType<TVariables, TData>[]>;
export type UseImportInputPropsType = {
    type: "file";
    accept: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export type UseImportReturnType<TData extends BaseRecord = BaseRecord, TVariables = {}, TError extends HttpError = HttpError> = {
    inputProps: UseImportInputPropsType;
    mutationResult: UseCreateReturnType<TData, TError, TVariables> | UseCreateManyReturnType<TData, TError, TVariables>;
    isLoading: boolean;
    handleChange: HandleChangeType<TVariables, TData>;
};
/**
 * `useImport` hook allows you to handle your csv import logic easily.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/import-export/useImport} for more details.
 *
 * @typeParam TItem - Interface of parsed csv data
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for mutation function
 *
 */
export declare const useImport: <TItem = any, TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = any>({ resourceName, resource: resourceFromProps, mapData, paparseOptions, batchSize, onFinish, meta, metaData, onProgress, dataProviderName, }?: ImportOptions<TItem, TVariables, TData>) => UseImportReturnType<TData, TVariables, TError>;
//# sourceMappingURL=index.d.ts.map