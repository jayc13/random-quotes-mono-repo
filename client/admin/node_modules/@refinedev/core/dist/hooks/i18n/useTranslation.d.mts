/**
 * It combines `useTranslate`, `useSetLocale` and `useGetLocale` hooks for a better developer experience.
 * It returns `i18nProvider` methods under the hood.
 * @returns `translate` method to translate the texts.
 * @returns `changeLocale` method to change the locale
 * @returns `getLocale` method to get the current locale.
 *
 * @see {@link https://refine.dev/docs/i18n/i18n-provider/} for more details.
 */
export declare const useTranslation: () => {
    translate: {
        (key: string, options?: any, defaultMessage?: string | undefined): string;
        (key: string, defaultMessage?: string | undefined): string;
    };
    changeLocale: (lang: string) => any;
    getLocale: () => string | undefined;
};
//# sourceMappingURL=useTranslation.d.ts.map