import React, { type PropsWithChildren } from "react";
import type { DataProvider, DataProviders } from "./types";
export declare const defaultDataProvider: DataProviders;
export declare const DataContext: React.Context<DataProviders>;
type Props = PropsWithChildren<{
    dataProvider?: DataProvider | DataProviders;
}>;
export declare const DataContextProvider: React.FC<Props>;
export {};
//# sourceMappingURL=index.d.ts.map