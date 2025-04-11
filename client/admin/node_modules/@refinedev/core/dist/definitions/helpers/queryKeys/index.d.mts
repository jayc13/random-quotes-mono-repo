import type { IQueryKeys, MetaQuery } from "../../../contexts/data/types";
/**
 * @deprecated `queryKeys` is deprecated. Please use `keys` instead.
 */
export declare const queryKeys: (resource?: string, dataProviderName?: string, meta?: MetaQuery, metaData?: MetaQuery | undefined) => IQueryKeys;
export declare const queryKeysReplacement: (preferLegacyKeys?: boolean) => (resource?: string, dataProviderName?: string, meta?: MetaQuery, metaData?: MetaQuery | undefined) => IQueryKeys;
//# sourceMappingURL=index.d.ts.map