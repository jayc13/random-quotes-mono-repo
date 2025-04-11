/// <reference types="react" />
export interface UseSearchResultConfig<T, S> {
    search?: (requestData: S) => Promise<T> | T;
    autoFirstSearch?: boolean;
    defaultRequestData?: S | (() => Promise<S> | S);
}
export declare const useSearchResult: <T, S>({ search, autoFirstSearch, defaultRequestData, }: UseSearchResultConfig<T, S>) => {
    loading: boolean;
    requestData: S;
    setRequestData: import("react").Dispatch<import("react").SetStateAction<S>>;
    responseData: T;
    defaultRequestDataLoading: boolean;
    search: (data: S) => Promise<void>;
};
