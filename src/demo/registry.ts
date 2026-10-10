import type { ComponentType } from "react";
import { ThemeDemo } from "./theme-demo";

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
}];
