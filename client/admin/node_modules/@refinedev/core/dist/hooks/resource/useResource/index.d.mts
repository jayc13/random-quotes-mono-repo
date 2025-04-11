import type { BaseKey } from "../../../contexts/data/types";
import type { IResourceItem } from "../../../contexts/resource/types";
import type { Action } from "../../../contexts/router/types";
export type UseResourceLegacyProps = {
    /**
     * Determines which resource to use for redirection
     * @deprecated resourceName deprecated. Use resourceNameOrRouteName instead # https://github.com/refinedev/refine/issues/1618
     */
    resourceName?: string;
    /**
     * Determines which resource to use for redirection
     * @default Resource name that it reads from route
     */
    resourceNameOrRouteName?: string;
    /**
     * Adds id to the end of the URL
     * @deprecated resourceName deprecated. Use resourceNameOrRouteName instead # https://github.com/refinedev/refine/issues/1618
     */
    recordItemId?: BaseKey;
};
/**
 * Matches the resource by identifier.
 * If not provided, the resource from the route will be returned.
 * If your resource does not explicitly define an identifier, the resource name will be used.
 */
export type UseResourceParam = string | undefined;
type SelectReturnType<T extends boolean> = T extends true ? {
    resource: IResourceItem;
    identifier: string;
} : {
    resource: IResourceItem;
    identifier: string;
} | undefined;
export type UseResourceReturnType = {
    resources: IResourceItem[];
    resource?: IResourceItem;
    /**
     * @deprecated Use `resource.name` instead when you need to get the resource name.
     */
    resourceName?: string;
    /**
     * @deprecated This value may not always reflect the correct "id" value. Use `useResourceParams` to obtain the calculated "id"` or `useParsed` to obtain the id from the route instead.
     */
    id?: BaseKey;
    /**
     * @deprecated This value may not always reflect the correct "action" value. Use `useResourceParams` to obtain the calculated "action" or `useParsed` to obtain the action from the route instead.
     */
    action?: Action;
    select: <T extends boolean = true>(resourceName: string, force?: T) => SelectReturnType<T>;
    identifier?: string;
};
type UseResourceReturnTypeWithResource = UseResourceReturnType & {
    resource: IResourceItem;
    identifier: string;
};
/**
 * @deprecated Use `useResource` with `identifier` property instead. (`identifier` does not check by route name in new router)
 */
export declare function useResource(props: UseResourceLegacyProps): UseResourceReturnType;
export declare function useResource(): UseResourceReturnType;
export declare function useResource<TIdentifier = UseResourceParam>(identifier: TIdentifier): TIdentifier extends NonNullable<UseResourceParam> ? UseResourceReturnTypeWithResource : UseResourceReturnType;
export {};
//# sourceMappingURL=index.d.ts.map