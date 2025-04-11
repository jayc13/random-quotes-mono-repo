import type { BaseKey } from "../../../contexts/data/types";
import type { IResourceItem } from "../../../contexts/resource/types";
import type { Action, GoConfig as GoConfigBase } from "../../../contexts/router/types";
type ResourceWithoutId = {
    /**
     *  The name or identifier of the resource.
     */
    resource: string;
    action: Extract<Action, "create" | "list">;
    id?: never;
    meta?: Record<string, unknown>;
};
type ResourceWithId = {
    /**
     *  The name or identifier of the resource.
     */
    resource: string;
    action: Extract<Action, "edit" | "show" | "clone">;
    id: BaseKey;
    meta?: Record<string, unknown>;
};
export type Resource = ResourceWithoutId | ResourceWithId;
export type GoConfigWithResource = Omit<GoConfigBase, "to"> & {
    to?: GoConfigBase["to"] | Resource;
};
export declare const useGo: () => (config: GoConfigWithResource | GoConfigBase) => string | void;
/**
 * handle errors for resource
 * @internal
 */
export declare const handleResourceErrors: (to: Resource, resource: IResourceItem) => void;
export {};
//# sourceMappingURL=index.d.ts.map