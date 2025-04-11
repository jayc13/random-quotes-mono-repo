type DebouncedFunction<T extends (...args: any) => any> = {
    (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
    flush: () => void;
    cancel: () => void;
};
/**
 * Debounces sync and async functions with given wait time. The debounced function returns a promise which can be awaited or catched.
 * Only the last call of the debounced function will resolve or reject.
 * Previous calls will be rejected with the given cancelReason.
 *
 * The original debounce function doesn't work well with async functions,
 * It won't return a promise to resolve/reject and therefore it's not possible to await the result.
 * This will always return a promise to handle and await the result.
 * Previous calls will be rejected immediately after a new call made.
 */
export declare const asyncDebounce: <T extends (...args: any[]) => any>(func: T, wait?: number, cancelReason?: string) => DebouncedFunction<T>;
export {};
//# sourceMappingURL=index.d.ts.map