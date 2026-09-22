"use client";

import { useEffect, useRef } from "react";
import { buttonStyle, primaryStyle } from "./styles";

export default function ConfirmDialog({ deleting, busy, error, onCancel, onDiscard, onSave }: {
  deleting: boolean;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const secondary = buttonStyle;
  return <dialog ref={ref} aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md border border-white/20 border-t-2 border-t-[var(--accent)] bg-[#080d10] p-6 text-white shadow-2xl backdrop:bg-[#030609]/80 backdrop:backdrop-blur-md">
    <div aria-hidden="true" className={`mb-5 grid size-10 place-items-center border text-lg ${deleting ? "border-red-300/20 bg-red-300/10 text-red-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{deleting ? "−" : "!"}</div>
    <h2 id="confirm-title" className="text-lg font-semibold">{deleting ? "Supprimer ce projet ?" : "Enregistrer les modifications ?"}</h2>
    <p id="confirm-description" className="mt-2 text-sm leading-6 text-zinc-400">{deleting ? "La suppression sera appliquée à l’enregistrement." : "Vos changements n’ont pas encore été enregistrés."}</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-2">
      <button autoFocus disabled={busy} className={secondary} onClick={onCancel}>Annuler</button>
      <button disabled={busy} className={`${secondary} ${deleting ? "border-red-300/30 text-red-300" : ""}`} onClick={onDiscard}>{deleting ? "Supprimer" : "Quitter sans enregistrer"}</button>
      {!deleting && <button disabled={busy} onClick={onSave} className={primaryStyle}>{busy ? "Enregistrement…" : "Enregistrer et continuer"}</button>}
    </div>
  </dialog>;
}
