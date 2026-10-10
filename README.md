# Context Lab

A Next.js app with Tailwind CSS for building and trying portable React contexts.
Each requested context includes portable source, documentation, and an
interactive demo using the actual provider.

## Run locally

Requires Node.js 20.9 or later and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The library and playground live at `/`; the setup
guide lives at `/guide`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm start` serves the production app after building it.

## Project structure

```text
src/
  app/                  Next.js routes and Tailwind styles
  components/           Demo app interface
  contexts/             Portable contexts, one folder per context
  hooks/                Reusable hooks with their own documentation
  locals/               Language folders with shared and page-specific JSON
  demo/
    registry.ts         Available contexts and their demo components
```

## Rules for each future context

1. Put the portable implementation in `src/contexts/<context-name>/`.
2. Keep it independent of Next.js imports, project aliases, demo components,
   and Tailwind. Use relative imports within the folder. Document any necessary
   external dependency and supported React versions.
3. Add `"use client"` to provider/hook modules for Next.js App Router support.
   Keep browser APIs out of module initialization and render; access them in
   effects or event handlers with appropriate guards and hydration handling.
4. Export a typed provider and consumer hook. Explain the behavior of a consumer
   outside the provider and choose a clear failure or documented default.
5. Include a `README.md` in that context's folder covering:
   - purpose, files to copy, prerequisites and dependencies;
   - integration examples for React, Next.js App Router, and Pages Router;
   - provider props, public types, hook state/actions, and working examples;
   - how state changes flow from provider to consumers;
   - defaults, cleanup, persistence/SSR behavior where relevant, and limitations.
6. Build a client demo in `src/demo/<context-name>-demo.tsx`. Mount the real
   provider and use its exported hook in interactive consumers. Include controls
   to try the important behaviors and meaningful error/edge states.
7. Register the demo in `src/demo/registry.ts` with its name, description, tags,
   source path, README path, and `Demo` component. The library renders registered
   demos automatically. Reset demo remounts the demo, including its provider;
   persisted data, if any, needs a separate explicit clear control.
8. Verify lint, types, production build, and meaningful context behavior.

## Using a context elsewhere

Copy the complete context folder into the destination project. Follow that
folder's README, install its declared dependencies, and mount its provider above
all consumers. The demo app itself does not need to be copied.

React Context requires React and client-rendered consumers. Compatibility with
particular React versions and environment constraints will be documented for
each implementation; framework independence does not promise every historical
React or Next.js release.

## Available now

- **Theme**: light/dark context using localStorage, with a one-time system
  preference fallback. See `src/contexts/theme/README.md`.
- **useLocalStorage**: generic persisted JSON state hook. See
  `src/hooks/use-local-storage/README.md`.
- **Language / i18n**: isolated i18next instance, persisted language, browser
  preference fallback, translations and RTL/LTR support. See
  `src/contexts/language/README.md`.

The theme demo is selected by default in the playground. `npm test` verifies the
storage behavior with Node's built-in test runner (Node 22.18+ or 24+). The app
itself requires Node 20.9+.
