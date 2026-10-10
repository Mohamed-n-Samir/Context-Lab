"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n, Resource, TFunction } from "i18next";
import { useLocalStorage } from "../../hooks/use-local-storage/use-local-storage";
import { createLanguageInstance, resolveLanguage } from "./language-utils";

export type LanguageContextValue = {
  language: string;
  supportedLanguages: readonly string[];
  setLanguage: (language: string) => void;
  direction: "ltr" | "rtl";
  t: TFunction;
  i18n: i18n;
  isReady: boolean;
  storageError: Error | null;
};

export type LanguageProviderProps = {
  children: ReactNode;
  resources: Resource;
  fallbackLanguage?: string;
  defaultNamespace?: string;
  storageKey?: string;
  detectBrowserLanguage?: boolean;
  className?: string;
  style?: CSSProperties;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children, resources, fallbackLanguage = "en", defaultNamespace = "translation", storageKey = "language", detectBrowserLanguage = true, className, style }: LanguageProviderProps) {
  const instance = useMemo(() => createLanguageInstance(resources, fallbackLanguage, defaultNamespace), [resources, fallbackLanguage, defaultNamespace]);
  const supportedLanguages = useMemo(() => Object.keys(resources), [resources]);
  const validate = useCallback((value: unknown): value is string => typeof value === "string" && supportedLanguages.includes(value), [supportedLanguages]);
  const getInitialValue = useCallback(() => detectBrowserLanguage
    ? resolveLanguage(navigator.languages?.length ? navigator.languages : [navigator.language], supportedLanguages, fallbackLanguage)
    : fallbackLanguage, [detectBrowserLanguage, supportedLanguages, fallbackLanguage]);
  const { value: savedLanguage, setValue, isReady: storageReady, error } = useLocalStorage(storageKey, fallbackLanguage, { validate, getInitialValue });

  const subscribe = useCallback((listener: () => void) => {
    instance.on("languageChanged", listener);
    return () => { instance.off("languageChanged", listener); };
  }, [instance]);
  const getSnapshot = useCallback(() => instance.language, [instance]);
  const getServerSnapshot = useCallback(() => fallbackLanguage, [fallbackLanguage]);
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (storageReady && instance.language !== savedLanguage) void instance.changeLanguage(savedLanguage);
  }, [instance, savedLanguage, storageReady]);

  const setLanguage = useCallback((next: string) => {
    if (!validate(next)) throw new Error(`Unsupported language "${next}". Choose one of: ${supportedLanguages.join(", ")}.`);
    setValue(next);
    void instance.changeLanguage(next);
  }, [setValue, instance, validate, supportedLanguages]);
  const direction = instance.dir(language);
  const t = useMemo(() => instance.getFixedT(language, defaultNamespace), [instance, language, defaultNamespace]);
  const value = useMemo(() => ({ language, supportedLanguages, setLanguage, direction, t, i18n: instance, isReady: storageReady && language === savedLanguage, storageError: error }), [language, supportedLanguages, setLanguage, direction, t, instance, storageReady, savedLanguage, error]);

  return <LanguageContext.Provider value={value}>
    <I18nextProvider i18n={instance} defaultNS={defaultNamespace}>
      <div lang={language} dir={direction} data-language={language} className={className} style={style}>{children}</div>
    </I18nextProvider>
  </LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside a LanguageProvider.");
  return context;
}
