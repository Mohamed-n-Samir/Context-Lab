import type { ComponentType } from "react";
import { ThemeDemo } from "./theme-demo";
import { LanguageDemo } from "./language-demo";

/** Each Demo must mount its real provider and expose interactive consumers. */
export type ContextDemo = {
  id: string;
  name: string;
  description: string;
  tags: readonly string[];
  sourcePath: string;
  readmePath: string;
  Demo: ComponentType;
};

// Add entries only when the corresponding context and working demo exist.
export const contextDemos: readonly ContextDemo[] = [{
  id: "theme",
  name: "Theme",
  description: "Shared light and dark themes, persisted with useLocalStorage.",
  tags: ["theme", "dark", "light", "localStorage", "useLocalStorage"],
  sourcePath: "src/contexts/theme/theme-context.tsx",
  readmePath: "src/contexts/theme/README.md",
  Demo: ThemeDemo,
}, {
  id: "language",
  name: "Language / i18n",
  description: "Shared translations, saved language selection, and RTL support with i18next.",
  tags: ["language", "i18n", "i18next", "translation", "Arabic", "English", "RTL"],
  sourcePath: "src/contexts/language/language-context.tsx",
  readmePath: "src/contexts/language/README.md",
  Demo: LanguageDemo,
}];
