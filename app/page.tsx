import Image from "next/image";
import NextLink from "next/link";
import type { CSSProperties } from "react";
import { Link } from "./types";
import Title from "./components/Title";

export default function Home() {

  const HERO_LINKS = [
    {
      label: "Mods / Plugins Minecraft",
      href: "/minecraft",
    },
    {
      label: "Bots Discord",
      href: "/discord-bots",
    },
  ]

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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center px-6 py-24 text-center bg-white dark:bg-black sm:px-10">
        <section className="flex w-full flex-col items-center gap-10">
          <div className="flex w-full max-w-3xl flex-col items-center gap-5">
            <Title/>
          </div>

          <div className="flex flew-row w-full gap-4 items-center justify-center">
            {HERO_LINKS.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden w-50 border border-white hover:bg-white bg-black p-2 transition-all duration-500 hover:shadow-lg/20 hover:shadow-white"
              >
                <span className="inline-flex text-sm font-medium text-white group-hover:text-black duration-500">
                  {link.label}
                </span>
              </NextLink>
            ))}
          </div>
        </section>
      </main>
      <div className="flex flex-row gap-4 mb-5 items-center justify-center">
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
