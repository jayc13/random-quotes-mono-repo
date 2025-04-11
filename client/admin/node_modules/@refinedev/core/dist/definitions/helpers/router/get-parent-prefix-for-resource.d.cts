import type { ResourceProps } from "../../../contexts/resource/types";
/**
 * Returns the parent prefix for a resource
 * - If `legacy` is provided, the computation is based on the `route` option of the resource
 */
export declare const getParentPrefixForResource: (resource: ResourceProps, resources: ResourceProps[], legacy?: boolean) => string | undefined;
//# sourceMappingURL=get-parent-prefix-for-resource.d.ts.map