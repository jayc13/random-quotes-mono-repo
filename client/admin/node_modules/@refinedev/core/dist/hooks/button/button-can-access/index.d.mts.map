import type { CanReturnType } from "../../../contexts/accessControl/types";
import type { IResourceItem } from "../../../contexts/resource/types";
import type { Action } from "../../../contexts/router/types";
import type { BaseKey } from "../../../contexts/data/types";
type ButtonCanAccessProps = {
    action: Action | "delete";
    resource?: IResourceItem;
    id?: BaseKey;
    accessControl?: {
        enabled?: boolean;
        hideIfUnauthorized?: boolean;
    };
};
type ButtonCanAccessValues = {
    title: string;
    hidden: boolean;
    disabled: boolean;
    canAccess: CanReturnType | undefined;
};
export declare const useButtonCanAccess: (props: ButtonCanAccessProps) => ButtonCanAccessValues;
export {};
//# sourceMappingURL=index.d.ts.map