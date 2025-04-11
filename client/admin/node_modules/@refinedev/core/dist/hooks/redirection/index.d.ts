import type { BaseKey, MetaDataQuery } from "../../contexts/data/types";
import type { IResourceItem } from "../../contexts/resource/types";
import type { RedirectAction } from "../form/types";
export type UseRedirectionAfterSubmissionType = () => (options: {
    redirect: RedirectAction;
    resource?: IResourceItem;
    id?: BaseKey;
    meta?: MetaDataQuery;
}) => void;
export declare const useRedirectionAfterSubmission: UseRedirectionAfterSubmissionType;
//# sourceMappingURL=index.d.ts.map