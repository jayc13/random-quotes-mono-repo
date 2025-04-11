import { type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { LogParams } from "../../../contexts/auditLog/types";
import type { BaseKey } from "../../../contexts/data/types";
type LogRenameData = {
    resource?: string;
} | undefined;
export type UseLogReturnType<TLogData, TLogRenameData> = {
    log: UseMutationResult<TLogData, Error, LogParams>;
    rename: UseMutationResult<TLogRenameData, Error, {
        id: BaseKey;
        name: string;
    }>;
};
export type UseLogMutationProps<TLogData, TLogRenameData extends LogRenameData = LogRenameData> = {
    logMutationOptions?: Omit<UseMutationOptions<TLogData, Error, LogParams, unknown>, "mutationFn">;
    renameMutationOptions?: Omit<UseMutationOptions<TLogRenameData, Error, {
        id: BaseKey;
        name: string;
    }, unknown>, "mutationFn" | "onSuccess">;
};
/**
 * useLog is used to `create` a new and `rename` the existing audit log.
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/audit-log/useLog} for more details.
 */
export declare const useLog: <TLogData, TLogRenameData extends LogRenameData = LogRenameData>({ logMutationOptions, renameMutationOptions, }?: UseLogMutationProps<TLogData, TLogRenameData>) => UseLogReturnType<TLogData, TLogRenameData>;
export {};
//# sourceMappingURL=index.d.ts.map