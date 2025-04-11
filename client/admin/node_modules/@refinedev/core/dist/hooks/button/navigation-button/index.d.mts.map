import React from "react";
import type { BaseKey } from "../../../contexts/data/types";
import type { Action } from "../../../contexts/router/types";
import type { CanReturnType } from "../../../contexts/accessControl/types";
export type NavigationButtonProps = {
    action: Action;
    id?: BaseKey;
    resource?: string;
    meta?: Record<string, unknown>;
    accessControl?: {
        enabled?: boolean;
        hideIfUnauthorized?: boolean;
    };
};
export type NavigationButtonValues = {
    to: string;
    label: string;
    disabled: boolean;
    title: string;
    hidden: boolean;
    canAccess: CanReturnType | undefined;
    LinkComponent: React.ComponentType<React.PropsWithChildren<{
        [prop: string]: any;
        to: string;
    }>>;
};
export declare function useNavigationButton(props: NavigationButtonProps): NavigationButtonValues;
//# sourceMappingURL=index.d.ts.map