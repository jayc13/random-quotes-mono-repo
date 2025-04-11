import { type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { CanParams, CanReturnType } from "../../../contexts/accessControl/types";
export type UseCanProps = CanParams & {
    /**
     * react-query's [useQuery](https://tanstack.com/query/v4/docs/reference/useQuery) options
     */
    queryOptions?: UseQueryOptions<CanReturnType>;
};
/**
 * `useCan` uses the `can` as the query function for `react-query`'s {@link https://react-query.tanstack.com/guides/queries `useQuery`}. It takes the parameters that `can` takes. It can also be configured with `queryOptions` for `useQuery`. Returns the result of `useQuery`.
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/accessControl/useCan} for more details.
 *
 * @typeParam CanParams {@link https://refine.dev/docs/core/interfaceReferences#canparams}
 * @typeParam CanReturnType {@link https://refine.dev/docs/core/interfaceReferences#canreturntype}
 *
 */
export declare const useCan: ({ action, resource, params, queryOptions: hookQueryOptions, }: UseCanProps) => UseQueryResult<CanReturnType>;
//# sourceMappingURL=index.d.ts.map