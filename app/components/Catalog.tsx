import type { ReactNode } from "react";
import ProjectIcon from "./ProjectIcon";

export function CatalogSection({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  return <section id={id} className="mt-14 scroll-mt-24" aria-labelledby={`${id}-title`}>
    <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-white/15 pb-4 [&_h2]:text-2xl [&_h2]:font-semibold"><h2 id={`${id}-title`}>{title}</h2><span className="font-mono text-xs tracking-wider text-[var(--accent)]">{String(count).padStart(2, "0")}</span></div>
    {count ? <div className="grid gap-5 md:grid-cols-2">{children}</div> : <p className="mt-6 border-l-2 border-[var(--accent)] bg-white/5 p-5 text-sm leading-7 text-slate-300">Aucune ressource pour le moment.</p>}
  </section>;
}

export function CatalogCard({ name, category, icon, description, demo, compact = false, children }: { name: string; category: string; icon?: string; description?: string; demo?: boolean; compact?: boolean; children: ReactNode }) {
  const fallback = category === "Bot Discord" ? "/projects/fireteam-maker.svg" : category === "Pack" ? "/projects/hxpack.svg" : category === "Plugin" ? "/projects/server-compass.svg" : "/projects/default.svg";
  return <article className={`flex min-w-0 flex-col border border-white/15 border-t-2 border-t-[var(--accent)] bg-[#080d10]/95 ${compact ? "p-4" : "p-5 md:p-7"}`}>
    <div className="flex items-center justify-between gap-4 font-mono text-xs tracking-wider text-[var(--accent)]">{category}{demo && <span className="border border-white/25 px-2 py-1 text-slate-300">Démo</span>}</div>
    <div className={`${compact ? "mt-3 gap-3" : "mt-4 gap-4"} flex items-center`}>
      <ProjectIcon key={icon ?? fallback} src={icon} fallback={fallback} compact={compact} />
      <h3 className={`${compact ? "text-lg" : "text-2xl"} min-w-0 font-semibold wrap-anywhere`}>{name}</h3>
    </div>
    {description && <p className={`${compact ? "mt-2 leading-5" : "mt-4 leading-7"} text-sm text-slate-300`}>{description}</p>}
    {children}
  </article>;
}

export function CatalogAction({ href, compact = false, children }: { href?: string; compact?: boolean; children: ReactNode }) {
  return href ? <a className={`${compact ? "mt-3" : "mt-6"} flex min-h-11 items-center justify-between gap-4 bg-[var(--accent,#58f0b5)] px-4 py-3 text-sm font-semibold text-[#071411] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200`} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a> : <p className={`${compact ? "mt-3 pt-2 text-xs" : "mt-6 pt-4 text-sm"} border-t border-white/15 text-slate-400`}>{children}</p>;
}
