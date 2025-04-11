import React, { type DetailedHTMLProps, type HTMLAttributes, type FormHTMLAttributes } from "react";
import type { AuthPageProps } from "./types";
export type DivPropsType = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type FormPropsType = DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
export type AuthProps = AuthPageProps<DivPropsType, DivPropsType, FormPropsType>;
/**
 * **refine** has a default auth page form which is served on `/login` route when the `authProvider` configuration is provided.
 * @param title is not implemented yet.
 * @see {@link https://refine.dev/docs/api-reference/core/components/auth-page/} for more details.
 */
export declare const AuthPage: React.FC<AuthProps>;
//# sourceMappingURL=index.d.ts.map