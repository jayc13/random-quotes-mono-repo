import papaparse from "papaparse";
import type { BaseRecord, CrudFilter, CrudSort, MetaQuery } from "../../contexts/data/types";
import type { MapDataFn } from "./types";
export interface ExportOptions {
    filename?: string;
    fieldSeparator?: string;
    quoteStrings?: string;
    decimalSeparator?: string;
    showLabels?: boolean;
    showTitle?: boolean;
    title?: string;
    useTextFile?: boolean;
    useBom?: boolean;
    headers?: string[];
    useKeysAsHeaders?: boolean;
}
type UseExportOptionsType<TData extends BaseRecord = BaseRecord, TVariables = any> = {
    /**
     * Resource name for API data interactions
     * @default Resource name that it reads from route
     * @deprecated `resourceName` is deprecated. Use `resource` instead.
     */
    resourceName?: string;
    /**
     * Resource name for API data interactions
     * @default Resource name that it reads from route
     */
    resource?: string;
    /**
     * A mapping function that runs for every record. Mapped data will be included in the file contents
     */
    mapData?: MapDataFn<TData, TVariables>;
    /**
     *  Sorts records
     *  @deprecated `sorter` is deprecated. Use `sorters` instead.
     */
    sorter?: CrudSort[];
    /**
     *  Sorts records
     */
    sorters?: CrudSort[];
    /**
     *  Filters records
     */
    filters?: CrudFilter[];
    maxItemCount?: number;
    /**
     *  Requests to fetch data are made as batches by page size. By default, it is 20. Used for `getList` method of `DataProvider`
     */
    pageSize?: number;
    /**
     *  Used for exporting options
     *  @type [Options](https://github.com/alexcaza/export-to-csv)
     * @deprecated `exportOptions` is deprecated. Use `unparseConfig` instead.
     */
    exportOptions?: ExportOptions;
    /**
     *  Used for exporting options
     *  @type [UnparseConfig](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/papaparse)
     */
    unparseConfig?: papaparse.UnparseConfig;
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
     * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
     */
    dataProviderName?: string;
    /**
     *  Callback to handle error events of this hook
     */
    onError?: (error: any) => void;
    /**
     *  Whether to generate download of the CSV in browser environments, defaults to true.
     */
    download?: boolean;
};
type UseExportReturnType = {
    isLoading: boolean;
    triggerExport: () => Promise<string | undefined>;
};
/**
 * `useExport` hook allows you to make your resources exportable.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/import-export/useExport} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TVariables - Values for params.
 *
 */
export declare const useExport: <TData extends BaseRecord = BaseRecord, TVariables = any>({ resourceName, resource: resourceFromProps, sorter, sorters, filters, maxItemCount, pageSize, mapData, exportOptions, unparseConfig, meta, metaData, dataProviderName, onError, download, }?: UseExportOptionsType<TData, TVariables>) => UseExportReturnType;
export {};
//# sourceMappingURL=index.d.ts.map