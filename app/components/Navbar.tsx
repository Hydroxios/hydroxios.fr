import Image from "next/image";
import NextLink from "next/link";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/80 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between px-6 py-4 sm:px-10">
        <NextLink href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" aria-label="Accueil Hydroxios">
          <Image src="/logo.png" alt="" width={646} height={646} priority className="size-11 object-contain" />
          <span>Hydroxios</span>
        </NextLink>

        <nav aria-label="Navigation principale" className="flex items-center gap-5 text-sm text-white/55 sm:gap-7">
          <NextLink href="/#twitch" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Twitch</NextLink>
          <NextLink href="/#projets" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Projets</NextLink>
        </nav>
      </div>
    </header>
  );
}
