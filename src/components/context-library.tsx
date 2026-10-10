"use client";

import { useState } from "react";
import Link from "next/link";
import { contextDemos } from "@/demo/registry";
import { SiteHeader } from "./site-header";

export function ContextLibrary() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(contextDemos[0]?.id ?? null);
  const [resetKey, setResetKey] = useState(0);
  const filtered = contextDemos.filter((context) =>
    [context.name, context.description, ...context.tags].join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const selected = contextDemos.find((context) => context.id === selectedId);
  const Demo = selected?.Demo;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#73806a]">
          <span className="size-2 rounded-full bg-[#8ca869]" /> Your context workspace
        </div>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Small contexts.<br /><span className="text-[#839775]">Endless possibilities.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6b776e]">Build once. Bring it anywhere. Your collection of reusable React contexts, with a place to try every one.</p>
          </div>
          <span className="w-fit rounded-full border border-[#dce3d5] bg-[#eef3e8] px-4 py-2 text-xs font-medium text-[#5d7051]">React + Next.js compatible</span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]">
          <section aria-labelledby="library-title" className="overflow-hidden rounded-2xl border border-[#e0e5dc] bg-white">
            <div className="border-b border-[#edf0e9] p-5">
              <div className="flex items-center justify-between">
                <h2 id="library-title" className="text-sm font-semibold">Context library</h2>
                <span className="rounded-md bg-[#f1f4ed] px-2 py-1 font-mono text-xs text-[#71806a]">{contextDemos.length.toString().padStart(2, "0")}</span>
              </div>
              <label className="mt-5 flex items-center gap-2 rounded-lg border border-[#e1e6dc] bg-[#fafbf8] px-3 py-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0 text-[#8b9783]" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
                <span className="sr-only">Search contexts</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a context…" className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-[#97a08f]" />
              </label>
            </div>
            <div className="min-h-64 p-4">
              {filtered.length > 0 ? (
                <ul className="space-y-2">{filtered.map((context) => (
                  <li key={context.id}><button onClick={() => { setSelectedId(context.id); setResetKey(0); }} aria-pressed={selectedId === context.id} className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedId === context.id ? "border-[#a8be8c] bg-[#f1f6e9]" : "border-[#e4e9de] hover:bg-[#f7f9f2]"}`}>
                    <span className="block text-sm font-semibold">{context.name}</span>
                    <span className="mt-2 block text-xs leading-5 text-[#71806a]">{context.description}</span>
                  </button></li>
                ))}</ul>
              ) : (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto grid size-10 place-items-center rounded-xl border border-dashed border-[#ccd6c3] text-lg text-[#91a081]" aria-hidden="true">+</span>
                  <p role="status" className="mt-4 text-sm font-medium">{contextDemos.length ? "No matching contexts" : "A fresh start"}</p>
                  <p className="mt-2 text-xs leading-5 text-[#89947f]">{contextDemos.length ? "Try another name or keyword." : "Your contexts will appear here as we build them."}</p>
                </div>
              )}
            </div>
            <div className="border-t border-[#edf0e9] px-5 py-4 text-xs text-[#89947f]">{contextDemos.length} contexts · Ready to grow</div>
          </section>

          <section aria-labelledby="demo-title" className="flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-[#e0e5dc] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] px-6 py-4">
              <h2 id="demo-title" className="flex items-center gap-2 text-sm font-semibold"><span className="text-[#9aaa8c]" aria-hidden="true">◉</span> {selected ? selected.name : "Live playground"}</h2>
              {selected ? <button onClick={() => setResetKey((key) => key + 1)} className="rounded-md border border-[#dce3d5] px-3 py-1.5 text-xs hover:bg-[#f1f4ed]">Reset demo</button> : <span className="font-mono text-[11px] text-[#99a38f]">WAITING FOR FIRST CONTEXT</span>}
            </div>
            <div className="flex flex-1 flex-col bg-[radial-gradient(#dfe5d8_1px,transparent_1px)] [background-size:18px_18px]">
              {Demo ? <div className="m-6 rounded-xl border border-[#e0e5dc] bg-white p-6"><Demo key={`${selectedId}-${resetKey}`} /></div> : (
                <div className="m-auto max-w-md px-6 py-14 text-center">
                  <div className="relative mx-auto mb-7 grid size-20 place-items-center rounded-2xl border border-[#d9e2ce] bg-[#f0f5e8] font-mono text-3xl text-[#7b9363] shadow-[0_8px_30px_-15px_#78905e]" aria-hidden="true">{"{ }"}<span className="absolute -bottom-2 -right-2 grid size-7 place-items-center rounded-lg border-4 border-white bg-[#d8e8b9] text-sm text-[#456032]">+</span></div>
                  <h3 className="text-xl font-semibold tracking-tight">Room for your first context</h3>
                  <p className="mt-3 text-sm leading-6 text-[#7c8874]">Ask for a context in chat. Once it’s added, select it here to explore a working demo and try its behavior.</p>
                  <Link href="/guide" className="mt-6 inline-flex items-center gap-3 rounded-lg bg-[#293f32] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#3b5744]">Explore the setup <span aria-hidden="true">→</span></Link>
                </div>
              )}
            </div>
            <div className="border-t border-[#edf0e9] px-6 py-3 text-xs text-[#87917f]">{selected ? `Source: ${selected.sourcePath} · Guide: ${selected.readmePath}` : "Every context comes with an interactive demo and its own README."}</div>
          </section>
        </div>

        <section aria-label="How this library works" className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Request a context", "Tell me what state or behavior you want to share."],
            ["02", "Try it here", "Explore the real provider through an interactive demo."],
            ["03", "Make it yours", "Copy the source and follow its README in your project."],
          ].map(([number, title, description]) => <div key={number} className="rounded-xl border border-[#e0e5dc] bg-[#f0f3eb] p-5"><span className="font-mono text-xs text-[#8a9a78]">{number} /</span><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#7a8671]">{description}</p></div>)}
        </section>
        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[#e0e5dc] pt-5 text-xs text-[#89947f]"><span>A little less boilerplate. A little more building.</span><span>Next.js · React · Tailwind CSS</span></footer>
      </main>
    </>
  );
}
