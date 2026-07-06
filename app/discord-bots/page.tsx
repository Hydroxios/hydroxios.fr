import NextLink from "next/link";

export default function DiscordBotsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20 text-center text-zinc-950 dark:bg-black dark:text-white">
      <div className="flex max-w-2xl flex-col items-center gap-5">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-400">
          Discord
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Bots Discord
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
          Cette page regroupera mes bots Discord, automatisations et integrations.
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
