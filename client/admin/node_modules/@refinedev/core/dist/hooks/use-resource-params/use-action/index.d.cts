import type { Action } from "../../../contexts/router/types";
/**
 * Returns the action from the router regardless of the router type.
 * In legacy routers, `useParsed` won't work and in the new router bindings, `useParams` won't work.
 * To make it easier to get the action from the router, this hook can be used.
 *
 * Additionally, if an action is provided as a parameter, it will be used instead of the inferred action.
 *
 * @internal usage only
 */
export declare const useAction: (action?: Action) => Action | undefined;
//# sourceMappingURL=index.d.ts.map