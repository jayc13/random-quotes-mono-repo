import type { ResourceActionRoute } from "./get-action-routes-from-resource";
/**
 * Picks the most eligible route from the given matched routes.
 * - If there's only one route, it returns it.
 * - If there's more than one route, it picks the best non-greedy match.
 */
export declare const pickMatchedRoute: (routes: ResourceActionRoute[]) => ResourceActionRoute | undefined;
//# sourceMappingURL=pick-matched-route.d.ts.map