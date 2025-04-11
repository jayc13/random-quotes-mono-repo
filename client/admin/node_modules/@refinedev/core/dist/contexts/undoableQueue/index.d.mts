import React, { type PropsWithChildren } from "react";
import { type IUndoableQueue, type IUndoableQueueContext } from "./types";
export declare const UndoableQueueContext: React.Context<IUndoableQueueContext>;
export declare const undoableQueueReducer: (state: IUndoableQueue[], action: any) => any[];
export declare const UndoableQueueContextProvider: React.FC<PropsWithChildren>;
//# sourceMappingURL=index.d.ts.map