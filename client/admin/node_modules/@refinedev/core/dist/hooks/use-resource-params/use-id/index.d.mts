import type { BaseKey } from "../../../contexts/data/types";
/**
 * Returns the id from the router regardless of the router type.
 * In legacy routers, `useParsed` won't work and in the new router bindings, `useParams` won't work.
 * To make it easier to get the id from the router, this hook can be used.
 *
 * Additionally, if an id is provided as a parameter, it will be used instead of the inferred id.
 *
 * @internal usage only
 */
export declare const useId: (id?: BaseKey) => BaseKey | undefined;
//# sourceMappingURL=index.d.ts.map