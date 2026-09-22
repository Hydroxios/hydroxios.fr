"use client";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { primaryStyle } from "./styles";

export default function AuthButton({ logout = false }: { logout?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return <div><button disabled={busy} onClick={async () => {
    setBusy(true); setError(false);
    try {
      if (logout) await signOut({ callbackUrl: "/dashboard/login" });
      else await signIn("discord", { callbackUrl: "/dashboard" });
    } catch { setError(true); setBusy(false); }
  }} className={primaryStyle}>{busy ? "Connexion…" : logout ? "Déconnexion" : "Continuer avec Discord"}</button>{error && <p role="alert" className="mt-2 text-sm text-red-300">Connexion impossible. Réessayez.</p>}</div>;
}
