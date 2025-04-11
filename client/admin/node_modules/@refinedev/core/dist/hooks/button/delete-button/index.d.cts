import type { BaseKey, DeleteOneResponse } from "../../../contexts/data/types";
import type { CanReturnType } from "../../../contexts/accessControl/types";
import type { DeleteParams } from "../../data/useDelete";
export type DeleteButtonProps = {
    resource?: string;
    id?: BaseKey;
    dataProviderName?: string;
    meta?: Record<string, unknown>;
    accessControl?: {
        enabled?: boolean;
        hideIfUnauthorized?: boolean;
    };
    onSuccess?: (value: DeleteOneResponse) => void;
} & Pick<DeleteParams<any, any, any>, "mutationMode" | "successNotification" | "errorNotification" | "invalidates">;
export type DeleteButtonValues = {
    label: string;
    title: string;
    hidden: boolean;
    loading: boolean;
    disabled: boolean;
    canAccess: CanReturnType | undefined;
    confirmOkLabel: string;
    cancelLabel: string;
    confirmTitle: string;
    onConfirm: () => void;
};
export declare function useDeleteButton(props: DeleteButtonProps): DeleteButtonValues;
//# sourceMappingURL=index.d.ts.map