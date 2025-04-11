/// <reference types="react" />
export interface UseCascadeSearchConfig<T> {
    list: ((...args: any) => T | Promise<T>)[];
}
export declare const useCascadeSearch: <T>({ list, }: UseCascadeSearchConfig<T>) => {
    search: (index: number, ...args: any) => void;
    responseDataList: T[];
    loadingList: boolean[];
    setResponseDataList: import("react").Dispatch<import("react").SetStateAction<T[]>>;
};
