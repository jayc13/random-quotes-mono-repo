import type { IResourceItem } from "../../../contexts/resource/types";
import type { Action } from "../../../contexts/router/types";
type UseToPathParams = {
    resource?: IResourceItem;
    action: Action;
    meta?: Record<string, unknown>;
    legacy?: boolean;
};
type GetToPathFn = (params: UseToPathParams) => string | undefined;
/**
 * Returns a function to get the route for a given action and resource.
 * If resource is not provided, it will use the resource from the route.
 * If the resource is not found, it will return undefined.
 * If the action is not found, it will return undefined.
 * `meta` can be provided to compose the routes with parameters. (Can be used for nested routes.)
 */
export declare const useGetToPath: () => GetToPathFn;
export {};
//# sourceMappingURL=index.d.ts.map