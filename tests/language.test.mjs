import assert from "node:assert/strict";
import { test } from "node:test";
import { createLanguageInstance, resolveLanguage } from "../src/contexts/language/language-utils.ts";
import { languageResources } from "../src/locals/index.ts";

test("browser language matches exact locale, base language, then supported variant", () => {
  assert.equal(resolveLanguage(["ar-EG"], ["en", "ar"], "en"), "ar");
  assert.equal(resolveLanguage(["EN_us"], ["en-US", "en"], "en"), "en-US");
  assert.equal(resolveLanguage(["en-GB"], ["en-US", "en"], "en"), "en");
  assert.equal(resolveLanguage(["en-GB"], ["en-US"], "en-US"), "en-US");
  assert.equal(resolveLanguage(["fr", "ar-EG"], ["en", "ar"], "en"), "ar");
  assert.equal(resolveLanguage(["de"], ["en", "ar"], "en"), "en");
});

test("bundled i18next initialization is synchronous and supports interpolation", () => {
  const instance = createLanguageInstance(languageResources, "en", "language-demo");
  assert.equal(instance.isInitialized, true);
  assert.equal(instance.language, "en");
  assert.equal(instance.t("greeting", { name: "Alex" }), "Welcome, Alex!");
  assert.equal(instance.t("translation:selectLanguage"), "Choose language");
  assert.equal(instance.dir(), "ltr");
});

test("switching language changes translations and direction", async () => {
  const instance = createLanguageInstance(languageResources, "en", "language-demo");
  const notifications = [];
  instance.on("languageChanged", (language) => notifications.push(language));
  await instance.changeLanguage("ar");
  assert.equal(instance.t("greeting", { name: "Alex" }), "أهلًا، Alex!");
  assert.equal(instance.dir(), "rtl");
  assert.deepEqual(notifications, ["ar"]);
});

test("Arabic plural categories and English singular/plural are correct", async () => {
  const instance = createLanguageInstance(languageResources, "en", "language-demo");
  assert.equal(instance.t("articles", { count: 1 }), "You have 1 article saved.");
  assert.equal(instance.t("articles", { count: 2 }), "You have 2 articles saved.");
  await instance.changeLanguage("ar");
  const examples = [
    [0, "ليس لديك أي مقالات محفوظة."],
    [1, "لديك مقال واحد محفوظ."],
    [2, "لديك مقالان محفوظان."],
    [3, "لديك 3 مقالات محفوظة."],
    [11, "لديك 11 مقالًا محفوظًا."],
    [100, "لديك 100 مقال محفوظ."],
  ];
  for (const [count, expected] of examples) assert.equal(instance.t("articles", { count }), expected);
});

test("missing translations use fallback and missing keys return their key", async () => {
  const instance = createLanguageInstance({ en: { translation: { onlyEnglish: "Fallback" } }, ar: { translation: {} } }, "en");
  await instance.changeLanguage("ar");
  assert.equal(instance.t("onlyEnglish"), "Fallback");
  assert.equal(instance.t("absent"), "absent");
});

test("providers use independent language instances rather than a global singleton", async () => {
  const first = createLanguageInstance(languageResources, "en", "language-demo");
  const second = createLanguageInstance(languageResources, "en", "language-demo");
  await first.changeLanguage("ar");
  assert.equal(first.language, "ar");
  assert.equal(second.language, "en");
  assert.equal(second.t("greeting", { name: "Alex" }), "Welcome, Alex!");
});

test("custom namespaces work and unsupported fallbacks fail clearly", () => {
  const instance = createLanguageInstance({ fr: { common: { hello: "Bonjour" }, checkout: { total: "Total" } } }, "fr", "common");
  assert.equal(instance.t("hello"), "Bonjour");
  assert.equal(instance.t("checkout:total"), "Total");
  assert.throws(() => createLanguageInstance(languageResources, "de"), /fallbackLanguage must exist/);
});
