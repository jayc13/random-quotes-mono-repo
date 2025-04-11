import { type InvalidateOptions, type InvalidateQueryFilters } from "@tanstack/react-query";
import type { BaseKey, IQueryKeys } from "../../contexts/data/types";
export type UseInvalidateProp = {
    resource?: string;
    id?: BaseKey;
    dataProviderName?: string;
    invalidates: Array<keyof IQueryKeys> | false;
    invalidationFilters?: InvalidateQueryFilters;
    invalidationOptions?: InvalidateOptions;
};
export declare const useInvalidate: () => ((props: UseInvalidateProp) => Promise<void>);
//# sourceMappingURL=index.d.ts.map