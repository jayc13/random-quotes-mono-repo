import React from "react";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { CanReturnType } from "../../contexts/accessControl/types";
import type { BaseKey } from "../../contexts/data/types";
import type { IResourceItem, ITreeMenu } from "../../contexts/resource/types";
type CanParams = {
    resource?: IResourceItem & {
        children?: ITreeMenu[];
    };
    id?: BaseKey;
    [key: string]: any;
};
type OnUnauthorizedProps = {
    resource?: string;
    reason?: string;
    action: string;
    params: CanParams;
};
type CanAccessBaseProps = {
    /**
     * Resource name for API data interactions
     */
    resource?: string;
    /**
     * Intended action on resource
     */
    action: string;
    /**
     * Parameters associated with the resource
     * @type { resource?: [IResourceItem](https://refine.dev/docs/api-reference/core/interfaceReferences/#canparams), id?: [BaseKey](https://refine.dev/docs/api-reference/core/interfaceReferences/#basekey), [key: string]: any }
     */
    params?: CanParams;
    /**
     * Content to show if access control returns `false`
     */
    fallback?: React.ReactNode;
    /**
     * Callback function to be called if access control returns `can: false`
     */
    onUnauthorized?: (props: OnUnauthorizedProps) => void;
    children: React.ReactNode;
    queryOptions?: UseQueryOptions<CanReturnType>;
};
type CanAccessWithoutParamsProps = {
    [key in Exclude<keyof CanAccessBaseProps, "fallback" | "children">]?: undefined;
} & {
    [key in "fallback" | "children"]?: CanAccessBaseProps[key];
};
export type CanAccessProps = CanAccessBaseProps | CanAccessWithoutParamsProps;
export declare const CanAccess: React.FC<CanAccessProps>;
export {};
//# sourceMappingURL=index.d.ts.map