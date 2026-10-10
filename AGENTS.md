# Context Lab conventions

This project builds reusable React contexts on user request. Do not add a context
before it is requested.

For every new context, follow the rules in README.md: self-contained React code
under src/contexts/<name>, a README in that folder with React and both Next.js
router integration examples and internal behavior details, and an interactive
demo that mounts the real provider. Register it in src/demo/registry.ts.

Portable source must not depend on Next.js, Tailwind, project aliases, or demo
code. Use relative internal imports, document dependencies and supported versions,
and handle browser APIs safely for server rendering. Demonstrate the actual API.

Run npm run lint, npm run typecheck, and npm run build after changes. Add behavior
checks when they meaningfully validate the context being implemented.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
