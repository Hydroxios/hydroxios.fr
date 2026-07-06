import NextLink from "next/link";

export default function MinecraftPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20 text-center text-zinc-950 dark:bg-black dark:text-white">
      <div className="flex max-w-2xl flex-col items-center gap-5">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-500">
          Minecraft
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Mods & plugins Minecraft
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
          Cette page regroupera mes mods, plugins et outils Minecraft.
        </p>
        <NextLink
          href="/"
          className="mt-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Retour
        </NextLink>
      </div>
    </main>
  );
}
