import React from "react";
/**
 * This context is used to determine which router to use.
 *
 * This is a temporary solution until we remove the legacy router.
 */
export declare const RouterPickerContext: React.Context<"legacy" | "new">;
export declare const RouterPickerProvider: React.Provider<"legacy" | "new">;
/**
 * This is a temporary hook to determine which router to use.
 * It will be removed once the legacy router is removed.
 * @internal This is an internal hook.
 */
export declare const useRouterType: () => "legacy" | "new";
//# sourceMappingURL=index.d.ts.map