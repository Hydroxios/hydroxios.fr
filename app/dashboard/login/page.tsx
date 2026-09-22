import { redirect } from "next/navigation";
import { adminSession, authConfigured } from "@/app/lib/admin-auth";
import AuthButton from "../AuthButton";

export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await adminSession()) redirect("/dashboard");
  const { error } = await searchParams;
  return <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-md items-center px-6 py-16">
    <section className="w-full border border-white/15 border-t-2 border-t-[var(--accent)] bg-[#080d10]/95 p-8">
      <p className="text-xs uppercase tracking-widest text-[var(--accent)]">Hydroxios · Administration</p>
      <h1 className="mt-3 text-2xl font-semibold">Dashboard</h1>
      <p className="mb-6 mt-2 text-sm text-zinc-400">Connexion réservée au propriétaire.</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-300">Connexion refusée ou expirée. Utilisez le compte autorisé.</p>}
      {authConfigured() ? <AuthButton /> : <p className="text-sm text-zinc-400">Connexion indisponible pour le moment.</p>}
    </section>
  </div>;
}
