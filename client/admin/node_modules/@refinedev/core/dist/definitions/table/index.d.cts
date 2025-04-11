import type { CrudFilter, CrudOperators, CrudSort, SortOrder } from "../../contexts/data/types";
export declare const parseTableParams: (url: string) => {
    parsedCurrent: number | "" | undefined;
    parsedPageSize: number | "" | undefined;
    parsedSorter: CrudSort[];
    parsedFilters: CrudFilter[];
};
export declare const parseTableParamsFromQuery: (params: any) => {
    parsedCurrent: number | "" | undefined;
    parsedPageSize: number | "" | undefined;
    parsedSorter: CrudSort[];
    parsedFilters: CrudFilter[];
};
/**
 * @internal This function is used to stringify table params from the useTable hook.
 */
export declare const stringifyTableParams: (params: {
    pagination?: {
        current?: number;
        pageSize?: number;
    };
    sorters: CrudSort[];
    filters: CrudFilter[];
    [key: string]: any;
}) => string;
export declare const compareFilters: (left: CrudFilter, right: CrudFilter) => boolean;
export declare const compareSorters: (left: CrudSort, right: CrudSort) => boolean;
export declare const unionFilters: (permanentFilter: CrudFilter[], newFilters: CrudFilter[], prevFilters?: CrudFilter[]) => CrudFilter[];
export declare const unionSorters: (permanentSorter: CrudSort[], newSorters: CrudSort[]) => CrudSort[];
export declare const setInitialFilters: (permanentFilter: CrudFilter[], defaultFilter: CrudFilter[]) => CrudFilter[];
export declare const setInitialSorters: (permanentSorter: CrudSort[], defaultSorter: CrudSort[]) => CrudSort[];
export declare const getDefaultSortOrder: (columnName: string, sorter?: CrudSort[]) => SortOrder | undefined;
export declare const getDefaultFilter: (columnName: string, filters?: CrudFilter[], operatorType?: CrudOperators) => CrudFilter["value"] | undefined;
//# sourceMappingURL=index.d.ts.map