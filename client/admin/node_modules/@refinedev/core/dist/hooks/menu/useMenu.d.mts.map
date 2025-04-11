import React from "react";
import { type FlatTreeItem } from "../../definitions/helpers/menu/create-tree";
type UseMenuReturnType = {
    defaultOpenKeys: string[];
    selectedKey: string;
    menuItems: TreeMenuItem[];
};
export type UseMenuProps = {
    meta?: Record<string, any>;
    hideOnMissingParameter?: boolean;
};
export type TreeMenuItem = Omit<FlatTreeItem, "label" | "route" | "children"> & {
    route?: string;
    icon?: React.ReactNode;
    label?: string;
    children: TreeMenuItem[];
};
/**
 * `useMenu` is used to get menu items of the default sidebar.
 * These items include a link to dashboard page (if it exists) and links to the user defined resources
 * (passed as children to {@link https://refine.dev/docs/core/components/refine-config `<Refine>`}).
 * This hook can also be used to build custom menus, which is also used by default sidebar to show menu items.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/ui/useMenu} for more details.
 */
export declare const useMenu: ({ meta, hideOnMissingParameter }?: UseMenuProps) => UseMenuReturnType;
export {};
//# sourceMappingURL=useMenu.d.ts.map