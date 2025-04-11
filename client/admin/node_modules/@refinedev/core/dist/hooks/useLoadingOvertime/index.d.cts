export type UseLoadingOvertimeRefineContext = Omit<UseLoadingOvertimeCoreProps, "isLoading" | "interval"> & Required<Pick<UseLoadingOvertimeCoreProps, "interval">>;
export type UseLoadingOvertimeOptionsProps = {
    overtimeOptions?: UseLoadingOvertimeCoreOptions;
};
export type UseLoadingOvertimeReturnType = {
    overtime: {
        elapsedTime?: number;
    };
};
type UseLoadingOvertimeCoreOptions = Omit<UseLoadingOvertimeCoreProps, "isLoading">;
type UseLoadingOvertimeCoreReturnType = {
    elapsedTime?: number;
};
export type UseLoadingOvertimeCoreProps = {
    /**
     * If true, the elapsed time will be calculated. If set to false; the elapsed time will be `undefined`.
     *
     * @default: true
     */
    enabled?: boolean;
    /**
     * The loading state. If true, the elapsed time will be calculated.
     */
    isLoading: boolean;
    /**
     * The interval in milliseconds. If the loading time exceeds this time, the `onInterval` callback will be called.
     * If not specified, the `interval` value from the `overtime` option of the `RefineProvider` will be used.
     *
     * @default: 1000 (1 second)
     */
    interval?: number;
    /**
     * The callback function that will be called when the loading time exceeds the specified time.
     * If not specified, the `onInterval` value from the `overtime` option of the `RefineProvider` will be used.
     *
     * @param elapsedInterval The elapsed time in milliseconds.
     */
    onInterval?: (elapsedInterval: number) => void;
};
/**
 * if you need to do something when the loading time exceeds the specified time, refine provides the `useLoadingOvertime` hook.
 * It returns the elapsed time in milliseconds.
 *
 * @example
 * const { elapsedTime } = useLoadingOvertime({
 *    isLoading,
 *    interval: 1000,
 *    onInterval(elapsedInterval) {
 *        console.log("loading overtime", elapsedInterval);
 *    },
 * });
 */
export declare const useLoadingOvertime: ({ enabled: enabledProp, isLoading, interval: intervalProp, onInterval: onIntervalProp, }: UseLoadingOvertimeCoreProps) => UseLoadingOvertimeCoreReturnType;
export {};
//# sourceMappingURL=index.d.ts.map