"use client";

import { useEffect, useRef, useState } from "react";
import { catalogFingerprint } from "../lib/catalog-draft";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ProjectIcon from "../components/ProjectIcon";
import ConfirmDialog from "./ConfirmDialog";
import { fieldStyle as control, buttonStyle as button, primaryStyle } from "./styles";

type Entry = Record<string, unknown>;
type Kind = "minecraft" | "discord" | "packs";
type Pending = { type: "load"; kind: Kind } | { type: "delete" } | { type: "logout" } | { type: "navigate"; url: string };
const catalogs: { id: Kind; title: string }[] = [{ id: "minecraft", title: "Minecraft" }, { id: "discord", title: "Discord" }, { id: "packs", title: "Packs" }];

function read(item: Entry, field: string): string {
  const [key, child] = field.split(".");
  const value = child ? (item[key] as Entry | undefined)?.[child] : item[key];
  return value === undefined || value === null ? "" : String(value);
}

export default function CatalogEditor({ userName }: { userName: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("minecraft");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [revision, setRevision] = useState("");
  const [selected, setSelected] = useState(0);
  const [savedEntries, setSavedEntries] = useState<Entry[]>([]);
  const allowLeave = useRef(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const item = entries[selected];
  const dirty = !loading && catalogFingerprint(entries) !== catalogFingerprint(savedEntries);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/dashboard/catalogs/${kind}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error ?? "Lecture impossible.");
      setEntries(data.entries); setSavedEntries(data.entries); setRevision(data.revision); setSelected(0);
    }).catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [kind, reload]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { if (!allowLeave.current) event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  useEffect(() => {
    const guard = (event: MouseEvent) => {
      if ((!dirty && !saving) || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.href === window.location.href) return;
      event.preventDefault(); event.stopPropagation();
      if (!saving) setPending({ type: "navigate", url: anchor.href });
    };
    document.addEventListener("click", guard, true);
    return () => document.removeEventListener("click", guard, true);
  }, [dirty, saving]);

  function load(next: Kind) {
    if (saving) return;
    if (dirty) { setPending({ type: "load", kind: next }); return; }
    changeCatalog(next);
  }
  function changeCatalog(next: Kind) {
    allowLeave.current = false;
    setLoading(true); setSavedEntries([]); setRevision(""); setError(""); setMessage(""); setQuery(""); setEntries([]); setKind(next); setReload(value => value + 1);
  }
  async function proceed(action: Pending) {
    setPending(null);
    if (action.type === "delete") {
      setEntries(entries.filter((_, index) => index !== selected)); setSelected(Math.max(0, selected - 1)); setMessage("");
    } else if (action.type === "load") changeCatalog(action.kind);
    else {
      if (action.type === "logout") {
        try {
          await signOut({ redirect: false, callbackUrl: "/dashboard/login" });
          allowLeave.current = true;
          router.push("/dashboard/login");
        }
        catch { setError("Déconnexion impossible. Réessayez."); }
      } else {
        allowLeave.current = true;
        if (new URL(action.url).origin === window.location.origin) router.push(action.url);
        else window.location.assign(action.url);
      }
    }
  }
  function update(field: string, value: unknown) {
    allowLeave.current = false;
    setEntries(previous => previous.map((entry, index) => {
      if (index !== selected) return entry;
      const copy = structuredClone(entry);
      const [key, child] = field.split(".");
      const target = child ? (copy[key] = { ...(copy[key] as Entry ?? {}) }) as Entry : copy;
      if (value === "") delete target[child ?? key]; else target[child ?? key] = value;
      return copy;
    }));
    setMessage("");
  }
  function field(name: string, label: string, multiline = false) {
    return <label key={name} className={`flex flex-col gap-2 text-xs font-medium tracking-wide text-white/60 ${multiline ? "sm:col-span-2" : ""}`}>
      {label}
      {multiline ? <textarea className={`${control} min-h-24 resize-y`} value={read(item, name)} onChange={event => update(name, event.target.value)} /> : <input className={control} value={read(item, name)} inputMode={name === "archive.size" ? "numeric" : undefined} onChange={event => {
        const value = event.target.value;
        update(name, name === "archive.size" && /^\d+$/.test(value) ? Number(value) : value);
      }} />}
    </label>;
  }
  function add(duplicate = false) {
    allowLeave.current = false;
    const entry: Entry = duplicate ? structuredClone(item) : { name: "Nouveau projet" };
    entry.id = `projet-${crypto.randomUUID().slice(0, 8)}`;
    if (!duplicate && kind !== "discord") Object.assign(entry, { version: "0.1.0", demo: true, loader: { type: "", version: "" } });
    if (!duplicate && kind === "minecraft") entry.type = "mod";
    if (!duplicate && kind === "packs") entry.archive = { url: "" };
    if (duplicate) entry.name = `${entry.name} (copie)`;
    setEntries([...entries, entry]); setSelected(entries.length); setMessage(""); setQuery("");
  }
  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/dashboard/catalogs/${kind}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Dashboard-Request": "1" }, body: JSON.stringify({ entries, revision }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      setEntries(data.entries); setSavedEntries(data.entries); setRevision(data.revision); setMessage("Enregistré.");
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Enregistrement impossible."); return false; }
    finally { setSaving(false); }
  }

  return <div className={kind === "discord" ? "pb-20 [--accent:#9b7cff]" : "pb-20 [--accent:#58f0b5]"}>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">Espace privé</p><h1 className="text-2xl font-semibold tracking-tight">Catalogues</h1></div><div className="flex items-center gap-4"><span className="text-sm text-white/60">{userName}</span><button className={button} disabled={saving} onClick={() => { if (dirty) setPending({ type: "logout" }); else void proceed({ type: "logout" }); }}>Déconnexion</button></div></header>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><nav aria-label="Catalogues" className="flex flex-wrap gap-2">{catalogs.map(tab => <button key={tab.id} disabled={saving} onClick={() => { if (tab.id !== kind) load(tab.id); }} aria-current={kind === tab.id ? "page" : undefined} className={`min-h-11 cursor-pointer border px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:opacity-40 ${kind === tab.id ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-white/20 bg-black/35 text-white/60 hover:border-white/40 hover:text-white"}`}>{tab.title}</button>)}</nav><button className={button} disabled={loading || saving} onClick={() => load(kind)}>Recharger</button></div>
    {error && !pending && <p role="alert" className="mb-4 border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</p>}
    {loading ? <p role="status" className="py-12 text-sm text-white/60">Chargement…</p> : <div className="grid overflow-hidden border border-white/15 border-t-2 border-t-[var(--accent)] bg-[#080d10]/95 md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-black/35 p-3 md:border-r md:border-b-0">
        <div className="mb-3 flex items-center justify-between px-1"><span className="text-xs text-white/45">{entries.length} projets</span><button className="min-h-10 cursor-pointer border border-white/20 bg-black/35 px-3 text-sm text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-cyan-200 disabled:opacity-40" disabled={saving || !revision} onClick={() => add()}>+ Ajouter</button></div>
        <input aria-label="Rechercher un projet" placeholder="Rechercher…" value={query} onChange={event => setQuery(event.target.value)} className={`${control} mb-3`} />
        <ul className="max-h-60 space-y-1 overflow-y-auto md:max-h-[65vh]">{entries.map((entry, index) => String(entry.name ?? "").toLocaleLowerCase().includes(query.toLocaleLowerCase()) && <li key={index}><button disabled={saving} onClick={() => setSelected(index)} aria-pressed={selected === index} className={`flex w-full items-center gap-3 border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-cyan-200 ${selected === index ? "border-[var(--accent)] bg-white/5" : "border-transparent hover:bg-white/5"}`}><ProjectIcon key={String(entry.icon ?? "")} src={typeof entry.icon === "string" && /^https?:\/\//.test(entry.icon) ? entry.icon : undefined} fallback="/projects/default.svg" compact /><span className="min-w-0"><span className="block truncate font-medium">{String(entry.name || "Sans nom")}</span><span className="mt-1 block truncate text-xs text-white/45">{String(entry.id ?? "")}</span></span></button></li>)}</ul>
        {!entries.some(entry => String(entry.name ?? "").toLocaleLowerCase().includes(query.toLocaleLowerCase())) && <p className="p-3 text-sm text-white/45">{entries.length ? "Aucun résultat." : "Aucun projet."}</p>}
      </aside>
      {item ? <fieldset disabled={saving} className="min-w-0 p-5 sm:p-7"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5"><h2 className="text-lg font-semibold">{String(item.name || "Nouveau projet")}</h2><div className="flex gap-2"><button className={button} onClick={() => add(true)}>Dupliquer</button><button className={`${button} text-red-300`} onClick={() => { setError(""); setPending({ type: "delete" }); }}>Supprimer</button></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("name", "Nom")}{field("id", "Identifiant")}{field("description", "Description", true)}{field("icon", "URL de l’icône PNG")}{field("version", "Version")}
          {kind === "discord" ? field("url", "Invitation Discord") : <>
            {field("minecraft", "Version Minecraft")}{field("loader.type", "Plateforme")}{field("loader.version", "Version de la plateforme")}
            {kind === "minecraft" && <label className="flex flex-col gap-2 text-xs text-white/60">Type<select className={control} value={read(item, "type")} onChange={event => update("type", event.target.value)}><option value="mod">Mod</option><option value="plugin">Plugin</option></select></label>}
            <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-300 sm:col-span-2"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={item.demo === true} onChange={event => update("demo", event.target.checked)} />Démo · téléchargement désactivé</label>
            {kind === "minecraft" ? field("download", "URL de téléchargement") : <>{field("archive.url", "URL de l’archive")}{field("archive.sha256", "SHA256")}{field("archive.size", "Taille en octets")}</>}
          </>}
        </div>
      </fieldset> : <div className="grid min-h-64 place-items-center border border-dashed border-white/15 text-sm text-white/45">Ajoutez votre premier projet.</div>}
    </div>}
    <p role="status" className="sr-only">{saving ? "Enregistrement…" : dirty ? "Modifications non enregistrées" : message}</p>
    <div className={`fixed right-4 bottom-4 z-30 transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none sm:right-8 sm:bottom-6 ${dirty ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-3 opacity-0"}`} inert={!dirty} aria-hidden={!dirty}>
      <button className={primaryStyle + " shadow-lg shadow-black/40"} disabled={saving || loading} onClick={() => void save()}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
    </div>
    {pending && <ConfirmDialog deleting={pending.type === "delete"} busy={saving} error={error} onCancel={() => setPending(null)} onDiscard={() => void proceed(pending)} onSave={async () => { if (await save()) await proceed(pending); }} />}
  </div>;
}
