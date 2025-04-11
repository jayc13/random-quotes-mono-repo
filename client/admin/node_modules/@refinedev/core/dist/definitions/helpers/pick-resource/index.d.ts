import type { IResourceItem } from "../../../contexts/resource/types";
/**
 * Picks the resource based on the provided identifier.
 * Identifier fallbacks to `name` if `identifier` is not explicitly provided to the resource.
 * If legacy is true, then resource is matched by `route` first and then by `name`.
 */
export declare const pickResource: (identifier?: string, resources?: IResourceItem[], legacy?: boolean) => IResourceItem | undefined;
//# sourceMappingURL=index.d.ts.map