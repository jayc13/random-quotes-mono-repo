import type { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import type { MutationMode } from "../../../contexts/data/types";
import type { LiveModeProps } from "../../../contexts/live/types";
import type { IRefineContextOptions, IRefineOptions } from "../../../contexts/refine/types";
type HandleRefineOptionsProps = {
    options?: IRefineOptions;
    mutationMode?: MutationMode;
    syncWithLocation?: boolean;
    warnWhenUnsavedChanges?: boolean;
    undoableTimeout?: number;
    liveMode?: LiveModeProps["liveMode"];
    disableTelemetry?: boolean;
    reactQueryClientConfig?: QueryClientConfig;
    reactQueryDevtoolConfig?: any | false;
};
type HandleRefineOptionsReturnValues = {
    optionsWithDefaults: IRefineContextOptions;
    disableTelemetryWithDefault: boolean;
    reactQueryWithDefaults: {
        clientConfig: QueryClientConfig | InstanceType<typeof QueryClient>;
        devtoolConfig: false | any;
    };
};
export declare const handleRefineOptions: ({ options, disableTelemetry, liveMode, mutationMode, reactQueryClientConfig, reactQueryDevtoolConfig, syncWithLocation, undoableTimeout, warnWhenUnsavedChanges, }?: HandleRefineOptionsProps) => HandleRefineOptionsReturnValues;
export {};
//# sourceMappingURL=index.d.ts.map