"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createLocalStorageStore, type LocalStorageOptions } from "./local-storage-store";

export type { LocalStorageOptions } from "./local-storage-store";

export function useLocalStorage<T>(key: string, initialValue: T, options: LocalStorageOptions<T> = {}) {
  const { validate, getInitialValue } = options;
  const store = useMemo(
    () => createLocalStorageStore(key, initialValue, { validate, getInitialValue }),
    [key, initialValue, validate, getInitialValue],
  );
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...snapshot, setValue: store.setValue };
}
