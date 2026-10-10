# Language context with i18next

Shared language selection and translations for React or Next.js, built on
`i18next`, `react-i18next`, and this project's `useLocalStorage` hook. Includes
saved selection, first-visit browser-language detection, namespaces,
interpolation, pluralization, translation fallback, and RTL/LTR direction.

## Copy to another project

Install dependencies (tested here with i18next 26.4.3 and react-i18next 17.0.16):

```sh
npm install i18next react-i18next
```

Use React 18+ with TypeScript and modern browsers supporting Intl.PluralRules.
Keep these files and their relative layout, or adjust the hook import:

```text
src/
  contexts/language/language-context.tsx
  contexts/language/language-utils.ts
  hooks/use-local-storage/use-local-storage.ts
  hooks/use-local-storage/local-storage-store.ts
```

The portable source does not import Next.js, Tailwind, demo code, or project
aliases. Create your own dictionaries, or copy `src/locals/`
as an English/Arabic example. No global i18next singleton is required.

## Define resources in language folders

Copy `src/locals/` along with the context and hook if you want the example
English/Arabic dictionaries. Translations live in JSON rather than the demo code:

```text
src/locals/
  index.ts
  en/
    translation.json
    language-demo.json
  ar/
    translation.json
    language-demo.json
```

`translation.json` contains shared labels/messages. A `<page-name>.json` file
contains all translations for that specific page. Each filename is an i18next
namespace; `index.ts` imports and registers the files under their language codes.
Keep resource imports outside components so the instance stays stable.

```tsx
const { t } = useTranslation("language-demo");
t("title");
t("translation:selectLanguage");
```

The demo sets `defaultNamespace="language-demo"`, so its `useLanguage().t` defaults
to the page dictionary. Without that prop, the provider defaults to `translation`.
Use a namespace prefix to select another file from either hook.

To add a page, create `en/home.json` and `ar/home.json`, register them as `home` in
`locals/index.ts`, then call `useTranslation("home")`. To add a language, create
its code folder, import its JSON files, and add that code to the resource object.
See `src/locals/README.md` for the exact registration example and portability notes.

The examples below import `languageResources` from `locals/index.ts` as `resources`
and use the demo page's `language-demo:greeting` key.

## React usage

```tsx
import { LanguageProvider, useLanguage } from "./contexts/language/language-context";
import { useTranslation } from "react-i18next";
import { languageResources as resources } from "./locals";

function LanguagePicker() {
  const { language, supportedLanguages, setLanguage, isReady } = useLanguage();
  return <select disabled={!isReady} value={language}
    onChange={event => setLanguage(event.target.value)}>
    {supportedLanguages.map(code => <option key={code} value={code}>{code}</option>)}
  </select>;
}

function Welcome() {
  const { t } = useTranslation(); // Or useLanguage().t for the default namespace.
  return <p>{t("language-demo:greeting", { name: "Alex" })}</p>;
}

export default function App() {
  return <LanguageProvider resources={resources} fallbackLanguage="en">
    <LanguagePicker />
    <Welcome />
  </LanguageProvider>;
}
```

## Next.js App Router

Create a client boundary. Do not pass callback functions across the server/client
boundary; this provider's dictionaries are plain serializable data.

```tsx
// app/providers.tsx
"use client";
import type { ReactNode } from "react";
import { LanguageProvider } from "../contexts/language/language-context";
import { languageResources as resources } from "../locals";

export function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider resources={resources}>{children}</LanguageProvider>;
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
```

Mark components using `useLanguage()` or `useTranslation()` with `"use client"`.
Server Components passed as children keep their server-rendered text; translate
dynamic content in client consumers. This provider does not implement server-side
locale routing, localized metadata, or per-locale SEO.

## Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { LanguageProvider } from "../contexts/language/language-context";
import { languageResources as resources } from "../locals";

export default function App({ Component, pageProps }: AppProps) {
  return <LanguageProvider resources={resources}>
    <Component {...pageProps} />
  </LanguageProvider>;
}
```

## Provider API

| Prop | Default | Behavior |
| --- | --- | --- |
| `children` | Required | Components sharing language and i18next instance |
| `resources` | Required | Bundled i18next resource object, stable identity |
| `fallbackLanguage` | `"en"` | Initial SSR language and missing-translation fallback; must exist in resources |
| `defaultNamespace` | `"translation"` | Default dictionary used by t |
| `storageKey` | `"language"` | JSON language key; demo uses `"context-lab:language"` |
| `detectBrowserLanguage` | `true` | Use browser preference only when no valid saved language exists |
| `className`, `style` | None | Applied to the real div wrapper |

Changing resource identity, fallback language, or default namespace recreates
the isolated i18next instance. Keep configuration stable in normal use.

## useLanguage API

| Field | Behavior |
| --- | --- |
| `language` | Active language code |
| `supportedLanguages` | Codes from resources |
| `setLanguage(code)` | Validate, persist, and change the shared language |
| `direction` | `"ltr"` or `"rtl"`, resolved by i18next |
| `t` | Translation function fixed to the active language and default namespace |
| `i18n` | Underlying isolated instance, for inspection/advanced APIs |
| `isReady` | Saved/default language resolved and i18next synchronized |
| `storageError` | Storage failure, or null |

Calling the hook outside the provider throws. Unsupported codes passed to
`setLanguage` throw synchronously. Use exact configured codes such as `en` or
`en-US`; regional matching is used for browser detection, not explicit setters.
Use `setLanguage()` for changes instead of calling `i18n.changeLanguage()`
directly; the latter bypasses persistence and can leave readiness out of sync.

`useTranslation("checkout")` and `<Trans>` work below the nested I18nextProvider.
Add `checkout` to your resources to use that namespace. `t("namespace:key")`
also selects a namespace. Missing translations use fallbackLanguage; missing keys
in both languages display the key. Supply `count` for plural selection and named
options for interpolation. Render plain interpolation through React; do not put
untrusted translation output into dangerouslySetInnerHTML.

## Exactly how it works

1. Each provider creates its own i18next instance with bundled dictionaries and
   synchronous initialization (`initAsync: false`). No backend fetch, browser
   detector plugin, or shared singleton is used. This prevents language changes
   leaking between providers or SSR requests.
2. SSR and initial hydration use fallbackLanguage. Browser APIs are accessed only
   after subscription through useLocalStorage, preventing hydration mismatches.
3. The hook checks storage first and validates the JSON value against configured
   codes. A valid saved language wins over the browser preference.
4. If absent or invalid, detection tries navigator.languages in preference order.
   For each code it tries exact locale, base language, then a supported regional
   variant. Unsupported preferences fall through to fallbackLanguage. Disable
   detection to always seed fallbackLanguage. The first choice is saved immediately.
5. An effect synchronizes the saved choice to the isolated i18next instance.
   The context subscribes to languageChanged with useSyncExternalStore; t and
   the wrapper's lang/dir use the active language, and isReady confirms convergence.
6. setLanguage writes through useLocalStorage and changes the instance. All
   context consumers and react-i18next consumers rerender. Native storage events
   synchronize other tabs; same-document hook instances use a custom event.
7. Reload/reset reads the saved language. Later browser-preference changes do not
   override it. Deleting the key and remounting performs first-visit detection again.

## Direction, styling, and scope

The wrapper sets `lang`, `dir`, and `data-language`. Arabic and other RTL languages
get right-to-left direction automatically. Prefer CSS logical properties such as
`margin-inline-start`, `padding-inline`, and `text-align: start` so layouts follow
direction. Tailwind's start/end utilities can do the same.

The wrapper does not mutate document.documentElement, html/body attributes, or
translate hard-coded text. Wrap the full app if you want all client consumers to
share language. Portals keep React context but need their own lang/dir attributes
when rendered outside the wrapper. Account for the wrapper div in grid/flex layouts.
Providers using the same storage key should share the same supported languages;
use separate keys for independent scopes. You may nest this provider with the theme
provider in either order.

## Demo and limitations

Select **Language / i18n** in Context Lab. Try English/Arabic, change the name for
interpolation, add/remove articles for plural forms, and switch from the nested
child. Reset demo remounts the provider and clears demo name/count state but keeps
the saved language. Reload also preserves it.

There may be a brief fallback-language display while storage loads; use isReady
to show a neutral loading shell when needed. Blocked/full storage still allows
in-memory language changes and reports storageError. Direct storage writes in
the same document do not notify the hook; reload/remount to pick them up.
See the hook README for JSON format and synchronization limits.

This provider bundles resources; it does not support asynchronous backend plugins
or lazy translation loading. All dictionaries ship to the client. For URL-based
localization, server-only translations, or large lazy-loaded catalogs, add an
appropriate application-specific i18n integration.

Official references: [i18next API](https://www.i18next.com/overview/api),
[configuration](https://www.i18next.com/overview/configuration-options),
[I18nextProvider](https://react.i18next.com/latest/i18nextprovider),
[useTranslation](https://react.i18next.com/latest/usetranslation-hook).

