/**
 * Prepares the route params by checking the existing params and meta data.
 * Meta data is prioritized over params.
 * Params are prioritized over predetermined id, action and resource.
 * This means, we can use `meta` for user supplied params (both manually or from the query string)
 */
export declare const prepareRouteParams: <TRouteParams extends Record<string, unknown> = Record<string, unknown>>(routeParams: (keyof TRouteParams)[], meta?: Record<string, unknown>) => Partial<TRouteParams>;
//# sourceMappingURL=prepare-route-params.d.ts.map