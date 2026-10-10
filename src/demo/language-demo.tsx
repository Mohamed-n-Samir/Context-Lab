"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageProvider, useLanguage } from "../contexts/language/language-context";
import { languageResources } from "../locals";

export function LanguageDemo() {
  return <LanguageProvider resources={languageResources} storageKey="context-lab:language" className="language-demo"><LanguageControls /><ReadingList /><LanguageChild /></LanguageProvider>;
}

function LanguageControls() {
  const { language, setLanguage, direction, t, isReady, storageError } = useLanguage();
  const [name, setName] = useState("Alex");
  return <section className="language-panel">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest opacity-65">{t("language-demo:eyebrow")}</p><h3 className="mt-2 text-lg font-semibold">{t("title")}</h3></div><span role="status" className="rounded-full border border-current/20 px-3 py-1 font-mono text-xs">{language} · {direction}</span></div>
    <p className="mt-3 text-sm leading-6 opacity-75">{t("language-demo:description")}</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium">{t("selectLanguage")}<select aria-label="Demo language" disabled={!isReady} value={language} onChange={(event) => setLanguage(event.target.value)} className="language-input mt-2"><option value="en">English</option><option value="ar">العربية</option></select></label><label className="text-xs font-medium">{t("nameLabel")}<input aria-label="Demo name" value={name} onChange={(event) => setName(event.target.value)} className="language-input mt-2" /></label></div>
    <p className="mt-5 text-lg font-semibold">{t("language-demo:greeting", { name })}</p>
    <p className="mt-3 text-xs leading-5 opacity-65">{t("saved")}</p>
    {storageError && <p role="alert" className="mt-3 text-sm">Storage unavailable: {storageError.message}</p>}
  </section>;
}

function ReadingList() {
  const { t } = useTranslation();
  const [count, setCount] = useState(1);
  return <article className="language-panel mt-4"><h4 className="font-semibold">{t("language-demo:cardTitle")}</h4><p className="mt-2 text-xs leading-5 opacity-65">{t("language-demo:cardDescription")}</p><p aria-live="polite" className="mt-4 text-sm font-medium">{t("articles", { count })}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setCount((value) => value + 1)} className="language-button">{t("language-demo:addArticle")}</button><button disabled={count === 0} onClick={() => setCount((value) => Math.max(0, value - 1))} className="language-button">{t("removeArticle")}</button><span className="self-center font-mono text-xs opacity-65">count: {count}</span></div></article>;
}

function LanguageChild() {
  const { language, direction, setLanguage, t, isReady } = useLanguage();
  return <section className="language-panel mt-4"><p className="text-xs leading-5">{t("language-demo:nested", { language, direction })}</p><button disabled={!isReady} onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="language-button mt-4">{t("switchLanguage")}</button></section>;
}
