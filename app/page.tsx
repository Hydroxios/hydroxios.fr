import Image from "next/image";
import NextLink from "next/link";
import type { CSSProperties } from "react";
import { Link } from "./types";
import Title from "./components/Title";
import PcbBackground from "./components/PcbBackground";
import TwitchEmbed from "./components/TwitchEmbed";

export default function Home() {

  const LINKS :Link[] = [
    {
      label: "Youtube",
      href: "https://www.youtube.com/@Hydroxios",
      icon: "youtube.svg",
      color: "rgba(255, 0, 0, 0.55)",
      blank: true
    },
    {
      label: "Twitch",
      href: "https://www.twitch.tv/hydroxios",
      icon: "/twitch.svg",
      color: "rgba(145, 70, 255, 0.95)",
      blank: true
    },
    {
      label: "Github",
      href: "https://github.com/hydroxios",
      icon: "github.svg",
      blank: true
    },
    {
      label: "X",
      href: "https://x.com/Hydroxios",
      icon: "/x.svg",
      color: "rgba(255, 255, 255, 0.45)",
      blank: true
    }
  ]

  return (
    <div className="relative isolate flex min-h-screen flex-col flex-1 items-center justify-center overflow-hidden bg-black font-sans text-white">
      <PcbBackground />
      <div className="pointer-events-none absolute inset-0 z-[5] bg-black/38 backdrop-blur-[3px]" />
      <main className="relative z-10 flex flex-1 w-full max-w-[1720px] flex-col items-center justify-center px-6 py-0 text-center sm:px-10 lg:py-2">
        <section className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full max-w-3xl flex-col items-center gap-0">
            <Title/>
          </div>
          <TwitchEmbed />
        </section>
      </main>
      <div className="relative z-10 flex flex-row gap-4 mb-5 items-center justify-center">
          {LINKS.map((link) => 
            <NextLink
              key={link.label}
              href={link.href}
              target={link.blank === false ? undefined : "_blank"}
              rel={link.blank === false ? undefined : "noreferrer"}
              className="group cursor-pointer bg-transparent transition-all hover:scale-110"
              style={{ "--link-shadow": link.color ?? "rgba(255, 255, 255, 0.45)" } as CSSProperties}
              aria-label={link.label}
            >
              <Image 
                src={link.icon}
                alt={link.label} 
                height={32}
                width={32} 
                loading="eager" 
                className="transition-[filter] group-hover:[filter:drop-shadow(0_0_4px_var(--link-shadow))_drop-shadow(0_0_14px_var(--link-shadow))_drop-shadow(0_0_26px_var(--link-shadow))]"
              />
            </NextLink>
          )}
      </div>
    </div>
  );
}
