# useLocalStorage

A typed, reusable React hook for JSON state in localStorage. React 18+ and
TypeScript are supported; no third-party dependencies are required. It uses
`useSyncExternalStore` to synchronize with browser storage without reading or
writing browser APIs during server rendering.

## Copy to another project

Copy this entire folder: `use-local-storage.ts` and `local-storage-store.ts` must
stay together. Keep the relative import between them. No Next.js or Tailwind
imports are used. The `"use client"` directive works in Next.js and is harmless
in ordinary React projects.

```tsx
"use client";
import { useLocalStorage } from "./hooks/use-local-storage/use-local-storage";

export function Counter() {
  const { value, setValue, isReady, error } = useLocalStorage<number>("count", 0);
  return (
    <div>
      <button disabled={!isReady} onClick={() => setValue(n => n + 1)}>
        Count: {value}
      </button>
      {error && <p>Could not save: {error.message}</p>}
    </div>
  );
}
```

Use this component normally in React or Next.js Pages Router. In App Router,
import it into a server page/layout as a client component. Hooks themselves may
only be called by client components.

## API

`useLocalStorage<T>(key, initialValue, options?)` returns an object:

| Field | Meaning |
| --- | --- |
| `value: T` | Current value; initially the server-safe fallback |
| `setValue(valueOrUpdater)` | Set directly or compute from the latest value |
| `isReady: boolean` | Browser initialization completed, even if persistence failed |
| `error: Error \| null` | Most recent storage read/write failure, or null |

Options:

- `validate?: (value: unknown) => value is T`: validate parsed JSON at runtime.
  Without it, JSON is trusted as T; TypeScript alone cannot validate storage.
- `getInitialValue?: () => T`: a browser-only fallback resolver. Called only if
  the saved value is missing or invalid (or storage cannot be read). Useful for
  resolving system preferences. Keep it synchronous and return valid JSON data.

Use stable identities for object/array fallbacks and option callbacks: define
them outside your component or use `useMemo`/`useCallback`. Changing the key,
fallback identity, or callback identity intentionally recreates the store and
reads the new configuration. An inline options object is fine when its callbacks
are stable. All hook instances sharing a key should use the same data schema.

## How it works

1. Creating a store has no browser side effects. Server rendering and the first
   hydration render return the exact same fallback snapshot with `isReady=false`.
2. On subscription in the browser, it reads localStorage first, parses JSON, and
   validates the result if a validator is supplied. Values such as false, zero,
   empty strings, and null are preserved rather than treated as absent.
3. If no valid value exists, it resolves the fallback and **saves immediately**.
   A malformed/invalid saved value is replaced. No click is required to persist.
4. Setters read the current saved value before functional updates, then write
   synchronously and notify React. Failed writes preserve the newer in-memory
   value; subsequent updates use that value and retry saving.
5. Native `storage` events synchronize other tabs. A custom event synchronizes
   hook instances in the same document, including updates that only succeed in
   memory. Subscriptions clean up on unmount. Snapshots remain stable between
   actual changes, which is required by `useSyncExternalStore`.
6. Removing a key (or clearing storage) in another tab resolves and persists the
   default again. Removing it directly in the same tab does not trigger a native
   event: remount the hook to reinitialize, or use this hook's setter for updates.

## Limits

- Use JSON-compatible data. Dates become strings; functions, undefined, BigInt,
  circular objects, and custom class instances cannot be round-tripped reliably.
- Storage belongs to an origin. Changes from different origins are independent.
- Direct same-tab localStorage writes outside this hook do not notify it.
- Concurrent updates across tabs are last-write-wins; localStorage is not an
  atomic database. Functional updates are atomic within one synchronous call.
- If storage is blocked/full, state still works in memory and `error` reports
  why persistence failed. Persistence across reloads cannot work in that case.
- The fallback can briefly display before hydration completes. Gate dependent
  controls/content with `isReady` when needed.
