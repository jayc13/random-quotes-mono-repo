import type { IRefineContextOptions } from "../../contexts/refine/types";
type UseSyncWithLocationType = () => {
    syncWithLocation: IRefineContextOptions["syncWithLocation"];
};
/**
 * List query parameter values can be edited manually by typing directly in the URL.
 * To activate this feature `syncWithLocation` needs to be set to `true`.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/components/refine-config/#syncwithlocation} for more details.
 */
export declare const useSyncWithLocation: UseSyncWithLocationType;
export {};
//# sourceMappingURL=useSyncWithLocation.d.ts.map