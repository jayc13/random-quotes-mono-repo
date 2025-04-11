type EachResolve<TResolve, Response> = (result: TResolve, index: number) => Response;
type EachReject<TReject, Response> = (error: TReject, index: number) => Response;
export declare const sequentialPromises: <TResolve = unknown, TReject = unknown, TResolveResponse = unknown, TRejectResponse = unknown>(promises: (() => Promise<TResolve>)[], onEachResolve: EachResolve<TResolve, TResolveResponse>, onEachReject: EachReject<TReject, TRejectResponse>) => Promise<(TResolveResponse | TRejectResponse)[]>;
export {};
//# sourceMappingURL=index.d.ts.map