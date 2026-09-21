import Image from "next/image";
import NextLink from "next/link";
import type { CSSProperties } from "react";
import PcbBackground from "./PcbBackground";

type ProjectPageProps = {
  category: string;
  title: string;
  description: string;
  accent: string;
};

export default function ProjectPage({ category, title, description, accent }: ProjectPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white" style={{ "--accent": accent } as CSSProperties}>
      <PcbBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/62" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_42%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <NextLink href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          <Image src="/logo.png" alt="" width={646} height={646} priority className="size-11 object-contain" />
          <span>Hydroxios</span>
        </NextLink>
        <NextLink href="/" className="text-sm text-white/45 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Retour</NextLink>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-4xl items-center px-6 pb-20 pt-8 sm:px-10">
        <section>
          <p className="text-sm font-medium text-[var(--accent)]">{category}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/58">{description}</p>
          <div className="mt-12 border-t border-white/15 pt-6">
            <h2 className="text-lg font-medium">Page en préparation</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">Les projets et ressources seront ajoutés prochainement.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
