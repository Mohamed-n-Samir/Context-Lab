# Theme context

A portable light/dark theme provider built on the reusable `useLocalStorage`
hook. React 18+ with TypeScript is supported. No Next.js, Tailwind, or third-party
runtime dependency beyond React and React DOM is needed.

## Files to copy

Preserve this relative structure (or adjust the hook import):

```text
src/
  contexts/theme/theme-context.tsx
  hooks/use-local-storage/use-local-storage.ts
  hooks/use-local-storage/local-storage-store.ts
```

The hook has its own README in `src/hooks/use-local-storage/README.md`. Copy both
source files from that folder along with the theme file. The demo is optional
and is not a dependency.

## Basic React usage

```tsx
import { ThemeProvider, useTheme } from "./contexts/theme/theme-context";
import "./theme.css";

function ThemeButton() {
  const { theme, toggleTheme, setTheme, isReady, storageError } = useTheme();
  return <>
    <button disabled={!isReady} onClick={toggleTheme}>Toggle {theme}</button>
    <button disabled={!isReady} onClick={() => setTheme("dark")}>Dark</button>
    {storageError && <p>Your choice could not be saved.</p>}
  </>;
}

export default function App() {
  return <ThemeProvider className="app-theme">
    <ThemeButton />
    <main>Every component here shares the same theme.</main>
  </ThemeProvider>;
}
```

## Next.js App Router

Create a client boundary:

```tsx
// app/providers.tsx
"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "../contexts/theme/theme-context";

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider className="app-theme">{children}</ThemeProvider>;
}
```

Render it inside the body of your root layout:

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
```

Any component calling `useTheme()` must be a client component (`"use client"`).
Server-rendered children can still inherit the provider wrapper's CSS variables.
Place the provider outside changing routes if you want one persistent instance.

## Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { ThemeProvider } from "../contexts/theme/theme-context";
import "../styles/theme.css";

export default function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider className="app-theme"><Component {...pageProps} /></ThemeProvider>;
}
```

## Style every wrapped component

The provider renders a `div` with `data-theme="light"` or `data-theme="dark"`.
It also sets native `color-scheme` once ready. Add your own CSS:

```css
.app-theme[data-theme="light"] {
  --surface: #ffffff;
  --text: #172017;
  --accent: #335d39;
}
.app-theme[data-theme="dark"] {
  --surface: #172017;
  --text: #ecf5e8;
  --accent: #b0d894;
}
.app-theme {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text);
}
.card { background: var(--surface); color: var(--text); }
.action { background: var(--accent); }
```

CSS variables inherit through the wrapper. With Tailwind, you can use
`bg-[var(--surface)] text-[var(--text)]`, or define your own data-theme variant.
Existing Tailwind `dark:` classes based on system media queries will need to be
configured to use the wrapper attribute if you want this provider to control them.

For conditional rendering or component-specific styles, read `theme` from
`useTheme()` and choose classes/styles based on it. The provider does not change
hard-coded colors automatically and does not mutate `<html>` or `<body>`.
Its wrapper is a real div, so account for it in grid/flex layouts. Portals outside
the wrapper retain React context but do not inherit its CSS variables.

## Provider and hook API

| Provider prop | Default | Meaning |
| --- | --- | --- |
| `children` | Required | Components sharing theme |
| `storageKey` | `"theme"` | localStorage key; demo uses `"context-lab:theme"` |
| `className` | None | CSS class on the wrapper |
| `style` | None | Inline wrapper styles; provider manages `colorScheme` |
| `crossfade` | `true` | Crossfade rendered themes over 420ms; use false to disable |

`useTheme()` returns:

| Field | Meaning |
| --- | --- |
| `theme` | `"light"` or `"dark"` |
| `setTheme(theme)` | Set and persist a specific theme |
| `toggleTheme()` | Toggle and persist using the latest value |
| `isReady` | Browser storage initialization completed |
| `storageError` | Storage failure or null |

Calling `useTheme()` outside a provider throws a descriptive error. Invalid
runtime values passed to `setTheme` are rejected. Providers with the same key
synchronize; use different keys for independent regions. Nested providers override
React context; use CSS variables on each wrapper for independent styles.

## Exactly how initialization and updates work

1. The server and first hydration render use light with `isReady=false`. No
   localStorage or matchMedia access happens during rendering.
2. The hook checks the saved JSON value first. Only `"light"` and `"dark"` are
   valid. A saved value always wins, even if it differs from the system preference.
3. If absent, malformed, or invalid, the hook calls `getSystemTheme()` once for
   that initialization. A dark media preference chooses dark; otherwise light.
   It immediately saves the choice as JSON (e.g. the raw stored string is
   `"dark"`, including JSON quotes). An older unquoted value such as raw `dark`
   is invalid JSON and will be replaced.
4. `isReady` becomes true. Consumers share that theme and the wrapper updates
   `data-theme` and `color-scheme`. No listener follows later system changes.
5. Toggling uses a functional update in the custom hook. Each setter checks the
   latest persisted theme and writes the new one immediately. All descendants
   reading this context update together; other same-key instances/tabs synchronize.
6. Reloads/remounts read the saved choice and do not consult the system. Removing
   the key explicitly starts a fresh first-run initialization on the next mount.

The app's demo shows multiple consumers, direct light/dark selection and toggles
from different children. Reset demo remounts the provider but preserves storage.
To simulate a fresh visit, delete only `context-lab:theme` in browser storage and
reload. To try a saved preference overriding the system, choose the opposite
theme and reload.

## Theme transitions

`setTheme()` and `toggleTheme()` crossfade the old and new rendered wrapper using
the browser View Transition API. The wrapper has a unique transition name, so
its background, text, icons, and child styles fade together. React DOM's
`flushSync` is used only for the snapshot callback to ensure the new theme is
rendered before capture. No duplicated interactive component trees are mounted.

Older browsers without view-transition CSS support use a 420ms transition of
colors instead. Reduced-motion users get immediate updates. Setting
`crossfade={false}` disables these animations. Initialization and external storage
events update directly; the crossfade is for this provider's theme actions. Call
theme actions from event handlers, not during rendering or effects, because the
snapshot callback flushes React updates synchronously.

Rapid toggles skip the previous animation and still apply every requested update.
The provider cleans up active animations on unmount. If the browser skips an
animation (for example, in a hidden tab), the theme still updates and persists.
The provider embeds scoped transition CSS in a style element; sites with a strict
Content Security Policy need to permit that style or adapt it to their stylesheet.

## SSR and storage limits

The deterministic fallback avoids hydration mismatches but can briefly show light
before the saved theme loads. Controls should be disabled until `isReady`, as in
the demo. If you require no visible initial theme flash, render a neutral loading
shell until ready or add an app-specific pre-paint script; that is not part of this
portable scoped provider.

If storage is unavailable, initialization still chooses the system theme and
updates work in memory, with `storageError` exposed. Saving cannot be guaranteed
when the browser blocks it. Clear the error on a successful later write. Defaults
and cross-tab behavior follow the hook README. All storage is origin-specific.
