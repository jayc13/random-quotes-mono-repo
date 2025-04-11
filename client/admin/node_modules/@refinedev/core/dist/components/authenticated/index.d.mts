import React from "react";
export type AuthCheckParams = any;
export type AuthenticatedCommonProps = {
    /**
     * Unique key to identify the component.
     * This is required if you have multiple `Authenticated` components at the same level.
     * @required
     */
    key: React.Key;
    /**
     * Whether to redirect user if not logged in or not.
     * If not set, user will be redirected to `redirectTo` property of the `check` function's response.
     * This behavior is only available for new auth providers.
     * Legacy auth providers will redirect to `/login` by default if this property is not set.
     * If set to a string, user will be redirected to that string.
     *
     * This property only works if `fallback` is **not set**.
     */
    redirectOnFail?: string | true;
    /**
     * Whether to append current path to search params of the redirect url at `to` property.
     *
     * By default, `to` parameter is used by successful invocations of the `useLogin` hook.
     * If `to` present, it will be used as the redirect url after successful login.
     */
    appendCurrentPathToQuery?: boolean;
    /**
     * Content to show if user is not logged in.
     */
    fallback?: React.ReactNode;
    /**
     * Content to show while checking whether user is logged in or not.
     */
    loading?: React.ReactNode;
    /**
     * Content to show if user is logged in.
     */
    children?: React.ReactNode;
    /**
     * optional params to be passed to the Auth Provider's check method via the useIsAuthenticated hook.
     */
    params?: AuthCheckParams;
};
export type LegacyAuthenticatedProps = {
    v3LegacyAuthProviderCompatible: true;
} & AuthenticatedCommonProps;
export type AuthenticatedProps = {
    v3LegacyAuthProviderCompatible?: false;
} & AuthenticatedCommonProps;
/**
 * `<Authenticated>` is the component form of {@link https://refine.dev/docs/api-reference/core/hooks/auth/useAuthenticated `useAuthenticated`}. It internally uses `useAuthenticated` to provide it's functionality.
 *
 * @requires {@link https://react.dev/learn/rendering-lists#why-does-react-need-keys `key`} prop if you have multiple components at the same level.
 * In React, components don't automatically unmount and remount with prop changes, which is generally good for performance. However, for specific cases this can cause issues like unwanted content rendering (`fallback` or `children`). To solve this, assigning unique `key` values to each instance of component is necessary, forcing React to unmount and remount the component, rather than just updating its props.
 * @example
 *```tsx
 * <Authenticated key="dashboard">
 *   <h1>Dashboard Page</h1>
 * </Authenticated>
 *```
 *
 * @see {@link https://refine.dev/docs/core/components/auth/authenticated `<Authenticated>`} component for more details.
 */
export declare function Authenticated(props: LegacyAuthenticatedProps): JSX.Element | null;
/**
 * `<Authenticated>` is the component form of {@link https://refine.dev/docs/api-reference/core/hooks/auth/useAuthenticated `useAuthenticated`}. It internally uses `useAuthenticated` to provide it's functionality.
 *
 * @requires {@link https://react.dev/learn/rendering-lists#why-does-react-need-keys `key`} prop if you have multiple components at the same level.
 * In React, components don't automatically unmount and remount with prop changes, which is generally good for performance. However, for specific cases this can cause issues like unwanted content rendering (`fallback` or `children`). To solve this, assigning unique `key` values to each instance of component is necessary, forcing React to unmount and remount the component, rather than just updating its props.
 * @example
 *```tsx
 * <Authenticated key="dashboard">
 *   <h1>Dashboard Page</h1>
 * </Authenticated>
 *```
 *
 * @see {@link https://refine.dev/docs/core/components/auth/authenticated `<Authenticated>`} component for more details.
 */
export declare function Authenticated(props: AuthenticatedProps): JSX.Element | null;
//# sourceMappingURL=index.d.ts.map