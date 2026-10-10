import Link from "next/link";

export function SiteHeader({ active = "library" }: { active?: "library" | "guide" }) {
  return (
    <header className="border-b border-[#e0e5dc] bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Context Lab home">
          <span className="grid size-10 place-items-center rounded-xl bg-[#263e32] font-mono text-lg font-bold text-[#dcefaf]" aria-hidden="true">{"{·}"}</span>
          <span className="text-lg font-bold tracking-tight">context<span className="font-normal text-[#7c887f]">lab</span><span className="ml-2 align-top text-xs text-[#8a967d]">/</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
          <Link href="/" aria-current={active === "library" ? "page" : undefined} className={active === "library" ? "font-semibold text-[#263e32]" : "text-[#69756c] hover:text-[#263e32]"}>Library</Link>
          <Link href="/guide" aria-current={active === "guide" ? "page" : undefined} className={active === "guide" ? "font-semibold text-[#263e32]" : "text-[#69756c] hover:text-[#263e32]"}>Getting started <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
