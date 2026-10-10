# Translation dictionaries

One folder per language code; one JSON file per page or namespace:

```text
locals/
  index.ts
  en/
    translation.json      Shared labels and messages
    language-demo.json    Language demo page
  ar/
    translation.json
    language-demo.json
```

`translation.json` holds reusable text shared by pages. `<page-name>.json` holds
that page's translations. Keep the same filenames and key names across languages,
except plural suffixes: Arabic needs more plural categories than English.

## Use a page's translations

```tsx
const { t } = useTranslation("language-demo");
t("title");                         // locals/<language>/language-demo.json
t("translation:selectLanguage");    // locals/<language>/translation.json
```

The provider receives `languageResources` imported from this folder. Its default
namespace is `translation`; the demo explicitly sets `defaultNamespace="language-demo"`
so `useLanguage().t("title")` selects the demo page. You can also use
`useLanguage().t("language-demo:title")` from a provider with another default.

## Add a page

1. Create `en/home.json` and `ar/home.json` with the page's matching keys.
2. Import both in `index.ts` and register them under the `home` namespace:

```ts
import enHome from "./en/home.json" with { type: "json" };
import arHome from "./ar/home.json" with { type: "json" };

// Add to the existing resource object:
// en: { translation: enTranslation, "language-demo": enLanguageDemo, home: enHome }
// ar: { translation: arTranslation, "language-demo": arLanguageDemo, home: arHome }
```

3. In the page's client components, call `useTranslation("home")`.

## Add a language

Create a language-code folder such as `fr`, translate the same JSON files, import
them into `index.ts`, and add a `fr` resource entry containing its namespaces.
The provider automatically includes registered resource languages. Add a label to
your language picker as needed; the demo picker currently offers English/Arabic.

Files are registered explicitly for portability across Next.js and React build
tools. Adding a file alone does not load it. All registered JSON is bundled; this
does not fetch dictionaries at runtime. Enable TypeScript's `resolveJsonModule`
in a destination project. JSON import attributes also let the existing Node tests
load the same dictionaries; if your bundler uses plain JSON imports, remove the
`with { type: "json" }` attributes as appropriate for that environment.
