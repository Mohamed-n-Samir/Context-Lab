import { createInstance, type Resource } from "i18next";

/** Match full locale first, then its base language, then a supported variant. */
export function resolveLanguage(preferences: readonly string[], supported: readonly string[], fallback: string): string {
  for (const preference of preferences) {
    const normalized = preference.replaceAll("_", "-").toLowerCase();
    const exact = supported.find((language) => language.toLowerCase() === normalized);
    if (exact) return exact;
    const base = normalized.split("-")[0];
    const match = supported.find((language) => language.toLowerCase() === base)
      ?? supported.find((language) => language.toLowerCase().split("-")[0] === base);
    if (match) return match;
  }
  return fallback;
}

export function createLanguageInstance(resources: Resource, fallbackLanguage: string, defaultNamespace = "translation") {
  if (!Object.hasOwn(resources, fallbackLanguage)) throw new Error("LanguageProvider fallbackLanguage must exist in resources.");
  const instance = createInstance();
  // Bundled dictionaries initialize synchronously, including during SSR.
  // No singleton or initReactI18next global registration is used.
  void instance.init({
    resources,
    lng: fallbackLanguage,
    fallbackLng: fallbackLanguage,
    supportedLngs: Object.keys(resources),
    ns: [...new Set(Object.values(resources).flatMap((namespaces) => Object.keys(namespaces)))],
    defaultNS: defaultNamespace,
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}
