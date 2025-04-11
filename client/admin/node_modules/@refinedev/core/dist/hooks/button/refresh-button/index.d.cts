import type { BaseKey } from "../../../contexts/data/types";
export type RefreshButtonProps = {
    resource?: string;
    id?: BaseKey;
    dataProviderName?: string;
    meta?: Record<string, unknown>;
};
export type RefreshButtonValues = {
    onClick: () => void;
    label: string;
    loading: boolean;
};
export declare function useRefreshButton(props: RefreshButtonProps): RefreshButtonValues;
//# sourceMappingURL=index.d.ts.map