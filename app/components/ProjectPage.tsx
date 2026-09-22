import type { CSSProperties, ReactNode } from "react";
import PcbBackground from "./PcbBackground";

type ProjectPageProps = {
  title: string;
  accent: string;
  children: ReactNode;
};

export default function ProjectPage({ title, accent, children }: ProjectPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-black text-white" style={{ "--accent": accent } as CSSProperties}>
      <PcbBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/62" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_42%)]" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-6 sm:px-10 sm:pt-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
