import type { Metadata } from "next";
import ProjectPage from "../components/ProjectPage";
import { CatalogSection, CatalogCard, CatalogAction } from "../components/Catalog";
import { readCatalog } from "../lib/catalogs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minecraft",
  description: "Les mods, plugins et outils Minecraft créés par Hydroxios.",
};

export default async function MinecraftPage() {
  const [projects, packs] = await Promise.all([readCatalog("minecraft"), readCatalog("packs")]);
  return (
    <ProjectPage
      title="Minecraft"
      accent="minecraft"
    >
      <nav className="flex flex-wrap gap-2 [&_a]:border [&_a]:border-white/20 [&_a]:px-4 [&_a]:py-3 [&_a]:text-sm [&_a:hover]:border-[var(--accent)] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-cyan-200" aria-label="Ressources Minecraft"><a href="#creations">Mods & plugins</a><a href="#packs">Packs</a></nav>
      {projects.some(project => project.demo) && <p className="mt-6 text-sm text-slate-400">Démo : projets fictifs, sans téléchargement.</p>}
      <CatalogSection id="creations" title="Mods & plugins" count={projects.length}>
        {projects.map(project => <CatalogCard compact key={project.id} name={project.name} icon={project.icon} category={project.type === "mod" ? "Mod" : "Plugin"} description={project.description} demo={project.demo}>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs [&_div]:flex [&_div]:gap-1 [&_dt]:text-slate-400 [&_dd]:wrap-anywhere"><div><dt>Version</dt><dd>{project.version}</dd></div><div><dt>Minecraft</dt><dd>{project.minecraft}</dd></div><div><dt>Plateforme</dt><dd>{project.loader.type} {project.loader.version}</dd></div></dl>
          <CatalogAction compact href={project.demo ? undefined : project.download}>{project.demo ? "Démo · indisponible" : project.download ? `Télécharger ${project.name}` : "Téléchargement à venir"}</CatalogAction>
        </CatalogCard>)}
      </CatalogSection>
      <CatalogSection id="packs" title="Packs Minecraft" count={packs.length}>
        {packs.map(pack => <CatalogCard compact key={pack.id} name={pack.name} icon={pack.icon} category="Pack" description={pack.description} demo={pack.demo}>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs [&_div]:flex [&_div]:gap-1 [&_dt]:text-slate-400 [&_dd]:wrap-anywhere"><div><dt>Version</dt><dd>{pack.version}</dd></div><div><dt>Minecraft</dt><dd>{pack.minecraft}</dd></div><div><dt>Plateforme</dt><dd>{pack.loader.type} {pack.loader.version}</dd></div><div><dt>Archive</dt><dd>{pack.archive.size ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(pack.archive.size / 1048576)} Mio` : "À confirmer"}</dd></div></dl>
          {pack.demo ? null : <details className="mt-4 text-xs text-slate-300 [&_summary]:cursor-pointer [&_summary]:py-2 [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-cyan-200 [&_code]:block [&_code]:pt-2 [&_code]:wrap-anywhere"><summary>Vérifier l’intégrité (SHA256)</summary><code>{pack.archive.sha256}</code></details>}
          <CatalogAction compact href={pack.demo ? undefined : pack.archive.url}>{pack.demo ? "Archive en préparation" : `Télécharger ${pack.name}`}</CatalogAction>
        </CatalogCard>)}
      </CatalogSection>
    </ProjectPage>
  );
}
