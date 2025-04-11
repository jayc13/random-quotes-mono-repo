import type { BaseKey } from "../../../contexts/data/types";
type ParametrizedDataActions = "list" | "infinite";
type IdRequiredDataActions = "one";
type IdsRequiredDataActions = "many";
type DataMutationActions = "custom" | "customMutation" | "create" | "createMany" | "update" | "updateMany" | "delete" | "deleteMany";
type AuthActionType = "login" | "logout" | "identity" | "register" | "forgotPassword" | "check" | "onError" | "permissions" | "updatePassword";
type AuditActionType = "list" | "log" | "rename";
type IdType = BaseKey;
type IdsType = IdType[];
type ParamsType = any;
type KeySegment = string | IdType | IdsType | ParamsType;
export declare function arrayFindIndex<T>(array: T[], slice: T[]): number;
export declare function arrayReplace<T>(array: T[], partToBeReplaced: T[], newPart: T[]): T[];
export declare function stripUndefined(segments: KeySegment[]): any[];
declare class BaseKeyBuilder {
    segments: KeySegment[];
    constructor(segments?: KeySegment[]);
    key(): any[];
    legacy(): any[];
    get(legacy?: boolean): any[];
}
declare class ParamsKeyBuilder extends BaseKeyBuilder {
    params(paramsValue?: ParamsType): BaseKeyBuilder;
}
declare class DataIdRequiringKeyBuilder extends BaseKeyBuilder {
    id(idValue?: IdType): ParamsKeyBuilder;
}
declare class DataIdsRequiringKeyBuilder extends BaseKeyBuilder {
    ids(...idsValue: IdsType): ParamsKeyBuilder;
}
declare class DataResourceKeyBuilder extends BaseKeyBuilder {
    action(actionType: ParametrizedDataActions): ParamsKeyBuilder;
    action(actionType: IdRequiredDataActions): DataIdRequiringKeyBuilder;
    action(actionType: IdsRequiredDataActions): DataIdsRequiringKeyBuilder;
}
declare class DataKeyBuilder extends BaseKeyBuilder {
    resource(resourceName?: string): DataResourceKeyBuilder;
    mutation(mutationName: DataMutationActions): ParamsKeyBuilder;
}
declare class AuthKeyBuilder extends BaseKeyBuilder {
    action(actionType: AuthActionType): ParamsKeyBuilder;
}
declare class AccessResourceKeyBuilder extends BaseKeyBuilder {
    action(resourceName: string): ParamsKeyBuilder;
}
declare class AccessKeyBuilder extends BaseKeyBuilder {
    resource(resourceName?: string): AccessResourceKeyBuilder;
}
declare class AuditActionKeyBuilder extends BaseKeyBuilder {
    action(actionType: Extract<AuditActionType, "list">): ParamsKeyBuilder;
}
declare class AuditKeyBuilder extends BaseKeyBuilder {
    resource(resourceName?: string): AuditActionKeyBuilder;
    action(actionType: Extract<AuditActionType, "rename" | "log">): ParamsKeyBuilder;
}
export declare class KeyBuilder extends BaseKeyBuilder {
    data(name?: string): DataKeyBuilder;
    auth(): AuthKeyBuilder;
    access(): AccessKeyBuilder;
    audit(): AuditKeyBuilder;
}
export declare const keys: () => KeyBuilder;
export {};
//# sourceMappingURL=index.d.ts.map