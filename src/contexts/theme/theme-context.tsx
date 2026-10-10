"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useLocalStorage } from "../../hooks/use-local-storage/use-local-storage";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isReady: boolean;
  storageError: Error | null;
};

export type ThemeProviderProps = {
  children: ReactNode;
  storageKey?: string;
  className?: string;
  style?: CSSProperties;
  /** Fade old and new rendered themes; respects prefers-reduced-motion. */
  crossfade?: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function getSystemTheme(): Theme {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children, storageKey = "theme", className, style, crossfade = true }: ThemeProviderProps) {
  const transitionName = `theme-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const activeTransition = useRef<ViewTransition | null>(null);
  const { value: theme, setValue, isReady, error } = useLocalStorage<Theme>(storageKey, "light", {
    validate: isTheme,
    getInitialValue: getSystemTheme,
  });
  useEffect(() => () => activeTransition.current?.skipTransition(), []);

  const updateTheme = useCallback((update: Theme | ((previous: Theme) => Theme)) => {
    if (!crossfade || typeof document.startViewTransition !== "function" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(update);
      return;
    }
    activeTransition.current?.skipTransition();
    // The browser must capture the new rendered palette, not a queued React update.
    const transition = document.startViewTransition(() => flushSync(() => setValue(update)));
    activeTransition.current = transition;
    // A skipped animation can reject ready; theme/storage updates still run.
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).finally(() => {
      if (activeTransition.current === transition) activeTransition.current = null;
    });
  }, [crossfade, setValue]);
  const setTheme = useCallback((next: Theme) => updateTheme(next), [updateTheme]);
  const toggleTheme = useCallback(() => updateTheme((previous) => previous === "dark" ? "light" : "dark"), [updateTheme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme, isReady, storageError: error }), [theme, setTheme, toggleTheme, isReady, error]);

  return <ThemeContext.Provider value={value}>
    {crossfade && <style>{`
      ::view-transition { pointer-events: none; }
      ::view-transition-group(${transitionName}) { animation-duration: 200ms; animation-timing-function: ease-in-out; }
      ::view-transition-old(${transitionName}), ::view-transition-new(${transitionName}) { animation-duration: 200ms; animation-timing-function: ease-in-out; }
      @supports not (view-transition-name: none) {
        [data-theme-crossfade="${transitionName}"][data-theme-ready="true"],
        [data-theme-crossfade="${transitionName}"][data-theme-ready="true"] * {
          transition-property: background-color, color, border-color, outline-color, fill, stroke;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-group(${transitionName}), ::view-transition-old(${transitionName}), ::view-transition-new(${transitionName}) { animation-duration: 0s; }
        [data-theme-crossfade="${transitionName}"], [data-theme-crossfade="${transitionName}"] * { transition-duration: 0s; }
      }
    `}</style>}
    <div data-theme={theme} data-theme-ready={isReady} data-theme-crossfade={crossfade ? transitionName : undefined} className={className} style={{ ...style, colorScheme: isReady ? theme : undefined, viewTransitionName: crossfade ? transitionName : undefined }}>{children}</div>
  </ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider.");
  return context;
}
