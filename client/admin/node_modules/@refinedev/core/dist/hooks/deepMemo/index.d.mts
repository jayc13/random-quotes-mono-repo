import React from "react";
/**
 * Hook that memoizes the given dependency array and checks the consecutive calls with deep equality and returns the same value as the first call if dependencies are not changed.
 * @internal
 */
export declare const useDeepMemo: <T>(fn: () => T, dependencies: React.DependencyList) => T;
//# sourceMappingURL=index.d.ts.map