/// <reference types="react" />
export declare const useRouterContext: () => {
    useHistory: () => any;
    useLocation: () => any;
    useParams: <Params extends { [K in keyof Params]?: string | undefined; } = {}>() => Params;
    Prompt: import("react").FC<import("../..").PromptProps>;
    Link: import("react").FC<any>;
    routes: any;
};
//# sourceMappingURL=useRouterContext.d.ts.map