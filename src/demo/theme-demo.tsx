"use client";

import { ThemeProvider, useTheme } from "../contexts/theme/theme-context";

export function ThemeDemo() {
    return (
        <ThemeProvider storageKey="context-lab:theme" className="theme-demo">
            <ThemeControls />
            <PreviewCard />
            <NestedConsumer />
            <p className="p-7 theme-panel mt-4">hello i am :::::::::</p>
        </ThemeProvider>
    );
}

function ThemeControls() {
    const { theme, setTheme, toggleTheme, isReady, storageError } = useTheme();
    return (
        <section className="theme-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest opacity-65">
                        Theme context
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">
                        One choice. Every component.
                    </h3>
                </div>
                <span
                    role="status"
                    className="rounded-full border border-current/20 px-3 py-1 text-xs"
                >
                    {isReady ? `Active: ${theme}` : "Loading saved theme…"}
                </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
                <button
                    disabled={!isReady}
                    onClick={toggleTheme}
                    className="theme-button"
                >
                    Toggle theme
                </button>
                <button
                    disabled={!isReady}
                    aria-pressed={theme === "light"}
                    onClick={() => setTheme("light")}
                    className="theme-button"
                >
                    Light
                </button>
                <button
                    disabled={!isReady}
                    aria-pressed={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    className="theme-button"
                >
                    Dark
                </button>
            </div>
            <p className="mt-4 text-xs leading-5 opacity-75">
                Saved under <code>context-lab:theme</code>. Reload or reset this
                demo: your choice stays. System preference is used only if no
                valid saved theme exists.
            </p>
            {storageError && (
                <p role="alert" className="mt-3 text-sm">
                    Storage unavailable: {storageError.message} Theme changes
                    still work for this session.
                </p>
            )}
        </section>
    );
}

function PreviewCard() {
    const { theme } = useTheme();
    return (
        <article className="theme-panel mt-4">
            <p className="text-xs uppercase tracking-widest opacity-65">
                Independent consumer
            </p>
            <h4 className="mt-2 font-semibold">A calmer place to build</h4>
            <p className="mt-2 text-sm leading-6 opacity-75">
                This card reads <code>useTheme()</code> and currently sees{" "}
                <strong>{theme}</strong>. Its background and text inherit the
                wrapper’s theme variables.
            </p>
            <div className="mt-5 flex items-center gap-3">
                <span
                    className="grid size-10 place-items-center rounded-xl bg-current/10"
                    aria-hidden="true"
                >
                    {theme === "dark" ? "☾" : "☀"}
                </span>
                <span className="text-sm">
                    {theme === "dark"
                        ? "Evening workspace"
                        : "Daytime workspace"}
                </span>
            </div>
        </article>
    );
}

function NestedConsumer() {
    const { theme, toggleTheme, isReady } = useTheme();
    return (
        <div className="theme-panel mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs">
                Another child sees <strong>{theme}</strong>.
            </p>
            <button
                disabled={!isReady}
                onClick={toggleTheme}
                className="theme-button"
            >
                Toggle from this child
            </button>
        </div>
    );
}
