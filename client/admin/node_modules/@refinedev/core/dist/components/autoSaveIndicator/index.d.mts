import React from "react";
import type { BaseRecord, HttpError } from "../../contexts/data/types";
import type { AutoSaveIndicatorElements } from "../../hooks/form/types";
import type { UseUpdateReturnType } from "../../hooks/data/useUpdate";
export type AutoSaveIndicatorProps<TData extends BaseRecord = BaseRecord, TError extends HttpError = HttpError, TVariables = {}> = {
    /**
     * The data returned by the update request.
     */
    data?: UseUpdateReturnType<TData, TError, TVariables>["data"];
    /**
     * The error returned by the update request.
     */
    error?: UseUpdateReturnType<TData, TError, TVariables>["error"];
    /**
     * The status of the update request.
     */
    status: UseUpdateReturnType<TData, TError, TVariables>["status"];
    /**
     * The elements to display for each status.
     */
    elements?: AutoSaveIndicatorElements;
};
export declare const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps>;
//# sourceMappingURL=index.d.ts.map