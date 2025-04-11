import type { BaseKey, MetaDataQuery } from "../../contexts/data/types";
import type { IResourceItem } from "../../contexts/resource/types";
export type HistoryType = "push" | "replace";
/**
 * `refine` uses {@link https://reactrouter.com/en/main/hooks/use-navigate#usenavigate `React Router`} and comes with all redirects out of the box.
 * It allows you to manage your routing operations in refine.
 * Using this hook, you can manage all the routing operations of your application very easily.
 *
 * @internal This is an internal hook of refine. Do not use it directly.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/navigation/useNavigation} for more details.
 */
export declare const useNavigation: () => {
    create: (resource: string | IResourceItem, type?: HistoryType, meta?: MetaDataQuery) => void;
    createUrl: (resource: string | IResourceItem, meta?: MetaDataQuery) => string;
    edit: (resource: string | IResourceItem, id: BaseKey, type?: HistoryType, meta?: MetaDataQuery) => void;
    editUrl: (resource: string | IResourceItem, id: BaseKey, meta?: MetaDataQuery) => string;
    clone: (resource: string | IResourceItem, id: BaseKey, type?: HistoryType, meta?: MetaDataQuery) => void;
    cloneUrl: (resource: string | IResourceItem, id: BaseKey, meta?: MetaDataQuery) => string;
    show: (resource: string | IResourceItem, id: BaseKey, type?: HistoryType, meta?: MetaDataQuery) => void;
    showUrl: (resource: string | IResourceItem, id: BaseKey, meta?: MetaDataQuery) => string;
    list: (resource: string | IResourceItem, type?: HistoryType, meta?: MetaDataQuery) => void;
    listUrl: (resource: string | IResourceItem, meta?: MetaDataQuery) => string;
    push: (path: string, ...rest: unknown[]) => void;
    replace: (path: string, ...rest: unknown[]) => void;
    goBack: () => void;
};
//# sourceMappingURL=index.d.ts.map