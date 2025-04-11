import type { BaseKey, CrudFilter, CrudSort, MetaQuery, Pagination } from "../../../contexts/data/types";
import type { LiveEvent, LiveModeProps } from "../../../contexts/live/types";
export type UseResourceSubscriptionProps = {
    channel: string;
    params?: {
        ids?: BaseKey[];
        id?: BaseKey;
        /**
         * @deprecated `params.meta` is depcerated. Use `meta` directly from the root level instead.
         */
        meta?: MetaQuery;
        /**
         * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
         */
        metaData?: MetaQuery;
        pagination?: Pagination;
        /**
         * @deprecated `hasPagination` is deprecated, use `pagination.mode` instead.
         */
        hasPagination?: boolean;
        /**
         * @deprecated `sort` is deprecated. Use `sorters` instead.
         */
        sort?: CrudSort[];
        sorters?: CrudSort[];
        filters?: CrudFilter[];
        subscriptionType: "useList" | "useOne" | "useMany";
        [key: string]: any;
    };
    types: LiveEvent["type"][];
    resource?: string;
    enabled?: boolean;
    /**
     * @deprecated use `meta.dataProviderName` instead.
     */
    dataProviderName?: string;
    meta?: MetaQuery & {
        dataProviderName?: string;
    };
} & LiveModeProps;
export type PublishType = (event: LiveEvent) => void;
export declare const useResourceSubscription: ({ resource: resourceFromProp, params, channel, types, enabled, liveMode: liveModeFromProp, onLiveEvent, dataProviderName: dataProviderNameFromProps, meta, }: UseResourceSubscriptionProps) => void;
//# sourceMappingURL=index.d.ts.map