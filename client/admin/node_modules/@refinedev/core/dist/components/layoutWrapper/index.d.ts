import React from "react";
import type { LayoutProps, TitleProps } from "../../contexts/refine/types";
export interface LayoutWrapperProps {
    /**
     * Outer component that renders other components
     * @default *
     */
    Layout?: React.FC<LayoutProps>;
    /**
     * [Custom sider to use](/api-reference/core/components/refine-config.md#sider)
     * @default *
     */
    Sider?: React.FC;
    /**
     * [Custom header to use](/api-reference/core/components/refine-config.md#header)
     * @default *
     */
    Header?: React.FC;
    /**
     * [Custom title to use](/api-reference/core/components/refine-config.md#title)
     * @default *
     */
    Title?: React.FC<TitleProps>;
    /**
     * [Custom footer to use](/api-reference/core/components/refine-config.md#footer)
     * @default *
     */
    Footer?: React.FC;
    /**
     * [Custom off layout area to use](/api-reference/core/components/refine-config.md#offlayoutarea)
     * @default *
     */
    OffLayoutArea?: React.FC;
    children: React.ReactNode;
}
/**
 * `<LayoutWrapper>` wraps its contents in **refine's** layout with all customizations made in {@link https://refine.dev/docs/core/components/refine-config `<Refine>`} component.
 * It is the default layout used in resource pages.
 * It can be used in custom pages to use global layout.
 *
 * @see {@link https://refine.dev/docs/core/components/layout-wrapper} for more details.
 *
 * @deprecated This component is obsolete and only works with the legacy router providers.
 */
export declare const LayoutWrapper: React.FC<LayoutWrapperProps>;
//# sourceMappingURL=index.d.ts.map