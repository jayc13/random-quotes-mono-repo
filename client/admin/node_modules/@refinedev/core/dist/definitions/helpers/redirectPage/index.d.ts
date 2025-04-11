import type { IRefineContextOptions } from "../../../contexts/refine/types";
import type { Action } from "../../../contexts/router/types";
import type { RedirectAction } from "../../../hooks/form/types";
type RedirectPageProps = {
    redirectFromProps?: RedirectAction;
    action: Action;
    redirectOptions: IRefineContextOptions["redirect"];
};
export declare const redirectPage: ({ redirectFromProps, action, redirectOptions, }: RedirectPageProps) => RedirectAction;
export {};
//# sourceMappingURL=index.d.ts.map