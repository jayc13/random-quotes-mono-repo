import React from "react";
export type BreadcrumbsType = {
    label: string;
    href?: string;
    icon?: React.ReactNode;
};
type UseBreadcrumbReturnType = {
    breadcrumbs: BreadcrumbsType[];
};
type UseBreadcrumbProps = {
    /**
     * Additional params to be used in the route generation process.
     */
    meta?: Record<string, string | number>;
};
export declare const useBreadcrumb: ({ meta: metaFromProps, }?: UseBreadcrumbProps) => UseBreadcrumbReturnType;
export {};
//# sourceMappingURL=index.d.ts.map