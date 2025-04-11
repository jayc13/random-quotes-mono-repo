/**
 * @returns authProvider or legacyAuthProvider if provided, otherwise null
 * @internal
 * NOTE: Will be removed in v5
 */
export declare const useActiveAuthProvider: () => {
    isProvided?: boolean | undefined;
    login?: ((params: any) => Promise<import("../../..").AuthActionResponse>) | undefined;
    logout?: ((params: any) => Promise<import("../../..").AuthActionResponse>) | undefined;
    check?: ((params?: any) => Promise<import("../../..").CheckResponse>) | undefined;
    onError?: ((error: any) => Promise<import("../../..").OnErrorResponse>) | undefined;
    register?: ((params: any) => Promise<import("../../..").AuthActionResponse>) | undefined;
    forgotPassword?: ((params: any) => Promise<import("../../..").AuthActionResponse>) | undefined;
    updatePassword?: ((params: any) => Promise<import("../../..").AuthActionResponse>) | undefined;
    getPermissions?: ((params?: Record<string, any> | undefined) => Promise<unknown>) | undefined;
    getIdentity?: ((params?: any) => Promise<unknown>) | undefined;
    isLegacy: boolean;
} | {
    check: ((params?: any) => Promise<any>) | undefined;
    onError: ((error: any) => Promise<void>) | undefined;
    getIdentity: ((params?: any) => Promise<any>) | undefined;
    isProvided?: boolean | undefined;
    login?: ((params: any) => Promise<import("../../../contexts/auth/types").TLoginData>) | undefined;
    register?: ((params: any) => Promise<import("../../../contexts/auth/types").TRegisterData>) | undefined;
    forgotPassword?: ((params: any) => Promise<import("../../../contexts/auth/types").TForgotPasswordData>) | undefined;
    updatePassword?: ((params: any) => Promise<import("../../../contexts/auth/types").TUpdatePasswordData>) | undefined;
    logout?: ((params: any) => Promise<import("../../../contexts/auth/types").TLogoutData>) | undefined;
    checkAuth?: ((params?: any) => Promise<any>) | undefined;
    checkError?: ((error: any) => Promise<void>) | undefined;
    getPermissions?: ((params?: Record<string, any> | undefined) => Promise<any>) | undefined;
    getUserIdentity?: ((params?: any) => Promise<any>) | undefined;
    isLegacy: boolean;
} | null;
//# sourceMappingURL=index.d.ts.map