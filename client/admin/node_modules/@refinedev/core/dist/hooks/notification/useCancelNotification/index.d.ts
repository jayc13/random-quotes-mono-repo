/// <reference types="react" />
import type { IUndoableQueue } from "../../../contexts/undoableQueue/types";
export type UseCancelNotificationType = () => {
    notifications: IUndoableQueue[];
    notificationDispatch: React.Dispatch<any>;
};
export declare const useCancelNotification: UseCancelNotificationType;
//# sourceMappingURL=index.d.ts.map