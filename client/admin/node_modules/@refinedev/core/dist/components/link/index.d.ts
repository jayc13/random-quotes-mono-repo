import React, { type Ref } from "react";
import type { GoConfigWithResource } from "../../hooks/router/use-go";
type LinkPropsWithGo = {
    go: Omit<GoConfigWithResource, "type">;
};
type LinkPropsWithTo = {
    to: string;
};
export type LinkProps<TProps = {}> = React.PropsWithChildren<(LinkPropsWithGo | LinkPropsWithTo) & TProps>;
/**
 * @param to The path to navigate to.
 * @param go The useGo.go params to navigate to. If `to` provided, this will be ignored.
 * @returns routerProvider.Link if it is provided, otherwise an anchor tag.
 */
declare const LinkComponent: <TProps = {}>(props: LinkProps<TProps>, ref: Ref<Element>) => React.JSX.Element;
export declare const Link: <T = {}>(props: LinkProps<T> & {
    ref?: Ref<Element>;
}) => ReturnType<typeof LinkComponent>;
export {};
//# sourceMappingURL=index.d.ts.map