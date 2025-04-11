import type { IResourceItem } from "../../../contexts/resource/types";
import type { Action } from "../../../contexts/router/types";
export type ResourceActionRoute = {
    action: Action;
    resource: IResourceItem;
    route: string;
};
/**
 * This function returns all the routes for available actions for a resource.
 * - If the action is a function, it means we're fallbacking to default path for the action
 * - If the action is a string, it means we don't have the component, but we have the route
 * - If the action is an object, it means we have the component and the route
 * - It will return an array of objects with the action, the resource and the route
 */
export declare const getActionRoutesFromResource: (resource: IResourceItem, resources: IResourceItem[], legacy?: boolean) => ResourceActionRoute[];
//# sourceMappingURL=get-action-routes-from-resource.d.ts.map