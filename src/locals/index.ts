import type { Resource } from "i18next";
import enTranslation from "./en/translation.json" with { type: "json" };
import enLanguageDemo from "./en/language-demo.json" with { type: "json" };
import arTranslation from "./ar/translation.json" with { type: "json" };
import arLanguageDemo from "./ar/language-demo.json" with { type: "json" };

// Each filename becomes an i18next namespace. Register new pages/languages here.
export const languageResources = {
  en: { translation: enTranslation, "language-demo": enLanguageDemo },
  ar: { translation: arTranslation, "language-demo": arLanguageDemo },
} satisfies Resource;
