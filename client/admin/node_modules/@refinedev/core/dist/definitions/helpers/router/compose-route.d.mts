import type { MetaQuery } from "../../../contexts/data/types";
import type { ParseResponse } from "../../../contexts/router/types";
/**
 * This function will compose a route with the given params and meta.
 * - A route can have parameters like (eg: /users/:id)
 * - First we pick the route params from the route (eg: [id])
 * - Then we prepare the route params with the given params and meta (eg: { id: 1 })
 * - Then we replace the route params with the prepared route params (eg: /users/1)
 */
export declare const composeRoute: (designatedRoute: string, resourceMeta?: MetaQuery, parsed?: ParseResponse, meta?: Record<string, unknown>) => string;
//# sourceMappingURL=compose-route.d.ts.map