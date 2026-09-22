import Image from "next/image";
import NextLink from "next/link";
import PcbBackground from "./components/PcbBackground";
import TwitchEmbed from "./components/TwitchEmbed";
import type { Link } from "./types";

const SOCIAL_LINKS: (Link & { className: string })[] = [
  { label: "YouTube", href: "https://www.youtube.com/@Hydroxios", icon: "/youtube.svg", className: "[--link-shadow:rgba(255,0,0,0.7)]"},
  { label: "Twitch", href: "https://www.twitch.tv/hydroxios", icon: "/twitch.svg", className: "[--link-shadow:rgba(145,70,255,0.95)]"},
  { label: "GitHub", href: "https://github.com/hydroxios", icon: "/github.svg", className: "[--link-shadow:rgba(255,255,255,0.6)]"},
  { label: "X", href: "https://x.com/Hydroxios", icon: "/x.svg", className: "[--link-shadow:rgba(255,255,255,0.6)]"},
];

const PROJECTS = [
  {
    title: "Minecraft",
    description: "Mods, plugins et outils pour Minecraft.",
    href: "/minecraft",
    className: "[--project-accent:#58f0b5]",
  },
  {
    title: "Discord",
    description: "Bots et intégrations pour les communautés Discord.",
    href: "/discord",
    className: "[--project-accent:#9b7cff]",
  },
] as const;

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-76px)] flex-col overflow-x-hidden bg-black text-white selection:bg-cyan-200 selection:text-black">
      <PcbBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/48" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_50%_25%,transparent_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.78)_100%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 pb-8 sm:px-10 mt-20">
        <section id="twitch" className="scroll-mt-24">
          <TwitchEmbed />
        </section>

        <section id="projets" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="projects-title">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 id="projects-title" className="text-2xl font-semibold">Projets</h2>
              <p className="mt-1 text-sm text-white/45">Quelques domaines sur lesquels je travaille.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PROJECTS.map((project) => (
              <NextLink
                key={project.href}
                href={project.href}
                className={`${project.className} group relative overflow-hidden border border-white/15 bg-black/35 p-6 transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 motion-reduce:transform-none sm:p-7`}
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--project-accent)] via-[var(--project-accent)]/60 to-transparent" />
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[var(--project-accent)]">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/48">{project.description}</p>
                  </div>
                  <span aria-hidden="true" className="mt-1 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white motion-reduce:transform-none">→</span>
                </div>
              </NextLink>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center justify-between gap-5 px-6 py-5 sm:px-10">
        <p className="text-xs text-white/30">© {new Date().getFullYear()} Hydroxios</p>
        <div className="flex items-center gap-1" aria-label="Réseaux sociaux">
          {SOCIAL_LINKS.map((link) => (
            <NextLink
              key={link.label}
              href={link.href}
              target={"_blank"}
              rel={"noreferrer"}
              className={`${link.className} group grid size-10 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200`}
              aria-label={link.label}
            >
              <Image src={link.icon} alt="" width={24} height={link.label === "X" ? 25 : 24} className="opacity-60 transition-[filter,opacity,transform] group-hover:scale-110 group-hover:opacity-100 group-hover:[filter:drop-shadow(0_0_8px_var(--link-shadow))] motion-reduce:transform-none" />
            </NextLink>
          ))}
        </div>
      </footer>
    </div>
  );
}
