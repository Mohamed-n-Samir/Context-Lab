export type LocalStorageOptions<T> = {
  /** Runtime validation of parsed JSON. Invalid values are replaced. */
  validate?: (value: unknown) => value is T;
  /** Runs in the browser only, when no valid saved value exists. */
  getInitialValue?: () => T;
};

export type StorageSnapshot<T> = {
  value: T;
  isReady: boolean;
  error: Error | null;
};

const CHANGE_EVENT = "reusable-contexts:local-storage";

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/** No browser access until subscribe or setValue is called. */
export function createLocalStorageStore<T>(key: string, initialValue: T, options: LocalStorageOptions<T> = {}) {
  const serverSnapshot: StorageSnapshot<T> = { value: initialValue, isReady: false, error: null };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();

  function publish(value: T, error: Error | null = null) {
    snapshot = { value, isReady: true, error };
    listeners.forEach((listener) => listener());
  }

  function write(value: T) {
    let error: Error | null = null;
    try {
      const json = JSON.stringify(value);
      if (json === undefined) throw new Error("useLocalStorage requires a JSON-serializable value.");
      window.localStorage.setItem(key, json);
    } catch (cause) {
      error = asError(cause);
    }
    publish(value, error);
    // Native storage events do not fire in the document that performed the write.
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key, value, error } }));
  }

  function read(): { found: true; value: T } | { found: false } {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      let value: unknown;
      try { value = JSON.parse(raw); } catch { return { found: false }; }
      if (!options.validate || options.validate(value)) return { found: true, value: value as T };
    }
    return { found: false };
  }

  function initialize() {
    if (typeof window === "undefined") return;
    try {
      const saved = read();
      if (saved.found) { publish(saved.value); return; }
    } catch (cause) {
      // Storage may be blocked; still resolve the browser default once in memory.
      let value = initialValue;
      try { value = options.getInitialValue?.() ?? initialValue; } catch { /* Keep fallback. */ }
      publish(value, asError(cause));
      return;
    }
    let value = initialValue;
    try { value = options.getInitialValue?.() ?? initialValue; } catch { /* Keep fallback. */ }
    write(value); // Persist even before the first user interaction.
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      try { if (event.storageArea !== window.localStorage) return; } catch { return; }
      initialize();
    };
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T; error: Error | null }>).detail;
      if (detail.key === key && (!options.validate || options.validate(detail.value))) publish(detail.value, detail.error);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, onChange);
    if (!snapshot.isReady) initialize();
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }

  function setValue(update: T | ((previous: T) => T)) {
    if (typeof window === "undefined") return;
    if (!snapshot.isReady) initialize();
    let previous = snapshot.value;
    // Always prefer the latest persisted value, including another tab's write.
    // After a failed write, retain our newer in-memory value until storage recovers.
    if (!snapshot.error) {
      try { const saved = read(); if (saved.found) previous = saved.value; } catch { /* Use memory. */ }
    }
    const next = typeof update === "function" ? (update as (value: T) => T)(previous) : update;
    if (options.validate && !options.validate(next)) throw new Error(`Invalid value for localStorage key "${key}".`);
    write(next);
  }

  return { subscribe, getSnapshot: () => snapshot, getServerSnapshot: () => serverSnapshot, setValue };
}
