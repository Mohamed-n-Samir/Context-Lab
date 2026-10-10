import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const steps = [
  ["Request", "Describe the context you need", "Tell me the state, actions, and behavior you want. Each requested context gets portable source, its own README, and an interactive demo in this app."],
  ["Explore", "Use the actual provider", "Choose a context from the library. Its demo mounts the real provider and consumes the public hook so you can try updates and shared state. Reset demo remounts the provider to its initial state."],
  ["Copy", "Move it into your project", "Copy the context folder from src/contexts into your React or Next.js project. Follow its README to wrap your components with the provider and use the consumer hook. Any extra dependencies and version requirements will be listed there."],
  ["Integrate", "Choose your provider boundary", "In Next.js App Router, mount the provider through a client component and render that boundary from a layout or page. In Next.js Pages Router or another React app, wrap the relevant component tree. Components using context must be inside its provider."],
];

export default function GuidePage() {
  return <><SiteHeader active="guide" /><main className="mx-auto max-w-3xl px-6 py-14 sm:py-20"><Link href="/" className="text-sm text-[#71806a] hover:text-[#263e32]">← Back to the library</Link><p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[#839775]">Getting started</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">Your next context starts here.</h1><p className="mt-5 leading-7 text-[#71806a]">This app is the workbench. The contexts you request will be self-contained React modules you can bring into another project.</p><div className="mt-10 space-y-4">{steps.map(([label, title, description], index) => <section key={label} className="rounded-2xl border border-[#e0e5dc] bg-white p-6 sm:p-8"><p className="font-mono text-xs text-[#899e72]">0{index + 1} / {label}</p><h2 className="mt-3 text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-[#71806a]">{description}</p></section>)}</div><aside className="mt-6 rounded-xl border border-[#dbe5cd] bg-[#edf3e5] p-6"><h2 className="text-sm font-semibold">What every README will cover</h2><p className="mt-2 text-sm leading-6 text-[#71806a]">Files to copy, dependencies, provider setup, hook API, working usage examples, state flow, defaults, persistence where relevant, and limitations. Context code will stay independent of this demo’s styling and routing.</p></aside></main></>;
}
