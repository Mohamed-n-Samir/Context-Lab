import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createLocalStorageStore } from "../src/hooks/use-local-storage/local-storage-store.ts";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

beforeEach(() => {
  globalThis.window = Object.assign(new EventTarget(), { localStorage: new MemoryStorage() });
});

const validate = (value) => value === "dark" || value === "light";

test("server snapshot is deterministic and creating a store never accesses the browser", () => {
  delete globalThis.window;
  const store = createLocalStorageStore("theme", "light", { getInitialValue: () => { throw Error("browser access"); } });
  assert.deepEqual(store.getServerSnapshot(), { value: "light", isReady: false, error: null });
  assert.equal(store.getSnapshot(), store.getServerSnapshot());
});

test("missing theme resolves system once and saves immediately, including Strict Mode resubscribe", () => {
  let calls = 0;
  const store = createLocalStorageStore("theme", "light", { validate, getInitialValue: () => { calls++; return "dark"; } });
  const cleanup = store.subscribe(() => {});
  assert.equal(store.getSnapshot().value, "dark");
  assert.equal(window.localStorage.getItem("theme"), '"dark"');
  cleanup();
  store.subscribe(() => {})();
  store.setValue((previous) => previous === "dark" ? "light" : "dark");
  store.setValue((previous) => previous === "dark" ? "light" : "dark");
  assert.equal(calls, 1);
  assert.equal(store.getSnapshot().value, "dark");
  assert.equal(store.getServerSnapshot().value, "light");
});

test("saved theme wins without consulting system and survives remount", () => {
  window.localStorage.setItem("theme", '"light"');
  const options = { validate, getInitialValue: () => { throw Error("must not consult system"); } };
  const first = createLocalStorageStore("theme", "dark", options);
  first.subscribe(() => {})();
  assert.equal(first.getSnapshot().value, "light");
  first.setValue("dark");
  const remount = createLocalStorageStore("theme", "light", options);
  remount.subscribe(() => {})();
  assert.equal(remount.getSnapshot().value, "dark");
});

test("malformed JSON and invalid theme values are repaired and persisted", () => {
  for (const raw of ["broken{", '"purple"', "null", "false", "0"]) {
    window.localStorage.setItem("theme", raw);
    const store = createLocalStorageStore("theme", "light", { validate, getInitialValue: () => "dark" });
    store.subscribe(() => {})();
    assert.equal(store.getSnapshot().value, "dark");
    assert.equal(window.localStorage.getItem("theme"), '"dark"');
  }
});

test("generic JSON values retain false, zero, empty string, null, arrays and objects", () => {
  for (const value of [false, 0, "", null, [1, 2], { count: 3 }]) {
    window.localStorage.setItem("value", JSON.stringify(value));
    const store = createLocalStorageStore("value", "fallback");
    store.subscribe(() => {})();
    assert.deepEqual(store.getSnapshot().value, value);
    assert.equal(store.getSnapshot(), store.getSnapshot());
  }
});

test("same-tab instances synchronize and cleanup removes notifications", () => {
  const first = createLocalStorageStore("theme", "light", { validate });
  const second = createLocalStorageStore("theme", "light", { validate });
  const cleanupFirst = first.subscribe(() => {});
  let notifications = 0;
  const cleanupSecond = second.subscribe(() => notifications++);
  first.setValue("dark");
  assert.equal(second.getSnapshot().value, "dark");
  second.setValue((previous) => previous === "dark" ? "light" : "dark");
  assert.equal(first.getSnapshot().value, "light");
  cleanupSecond();
  const before = notifications;
  first.setValue("dark");
  assert.equal(notifications, before);
  cleanupFirst();
});

test("cross-tab updates read storage and ignore other keys or sessionStorage", () => {
  const store = createLocalStorageStore("theme", "light", { validate });
  const cleanup = store.subscribe(() => {});
  window.localStorage.setItem("theme", '"dark"');
  function dispatch(key, storageArea = window.localStorage) {
    const event = new Event("storage");
    Object.assign(event, { key, storageArea });
    window.dispatchEvent(event);
  }
  dispatch("other");
  assert.equal(store.getSnapshot().value, "light");
  dispatch("theme", new MemoryStorage());
  assert.equal(store.getSnapshot().value, "light");
  dispatch("theme");
  assert.equal(store.getSnapshot().value, "dark");
  window.localStorage.removeItem("theme");
  dispatch(null);
  assert.equal(window.localStorage.getItem("theme"), '"light"');
  cleanup();
});

test("functional updates check the latest saved value", () => {
  const store = createLocalStorageStore("count", 0);
  store.subscribe(() => {})();
  window.localStorage.setItem("count", "41");
  store.setValue((previous) => previous + 1);
  assert.equal(store.getSnapshot().value, 42);
});

test("blocked storage still resolves default and allows session updates", () => {
  const failure = new Error("Storage blocked");
  Object.defineProperty(window, "localStorage", { get() { throw failure; } });
  const store = createLocalStorageStore("theme", "light", { validate, getInitialValue: () => "dark" });
  store.subscribe(() => {})();
  assert.equal(store.getSnapshot().value, "dark");
  assert.equal(store.getSnapshot().error, failure);
  store.setValue("light");
  assert.equal(store.getSnapshot().value, "light");
  store.setValue((previous) => previous === "light" ? "dark" : "light");
  assert.equal(store.getSnapshot().value, "dark");
});

test("failed writes keep newer memory state and recover when storage works", () => {
  const storage = window.localStorage;
  storage.setItem("count", "0");
  const store = createLocalStorageStore("count", 0);
  store.subscribe(() => {})();
  storage.setItem = () => { throw Error("Quota exceeded"); };
  store.setValue((previous) => previous + 1);
  store.setValue((previous) => previous + 1);
  assert.equal(store.getSnapshot().value, 2);
  assert.ok(store.getSnapshot().error);
  storage.setItem = MemoryStorage.prototype.setItem;
  store.setValue((previous) => previous + 1);
  assert.equal(storage.getItem("count"), "3");
  assert.equal(store.getSnapshot().error, null);
});

test("invalid updates are rejected and unserializable data reports a persistence error", () => {
  const theme = createLocalStorageStore("theme", "light", { validate });
  theme.subscribe(() => {})();
  assert.throws(() => theme.setValue("purple"), /Invalid value/);
  assert.equal(theme.getSnapshot().value, "light");
  const store = createLocalStorageStore("value", null);
  store.subscribe(() => {})();
  const circular = {}; circular.self = circular;
  store.setValue(circular);
  assert.ok(store.getSnapshot().error);
});
