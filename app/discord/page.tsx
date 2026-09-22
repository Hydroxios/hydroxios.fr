import type { Metadata } from "next";
import ProjectPage from "../components/ProjectPage";
import { CatalogSection, CatalogCard, CatalogAction } from "../components/Catalog";
import { readCatalog } from "../lib/catalogs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bots Discord",
  description: "Les bots Discord et automatisations créés par Hydroxios.",
};

export default async function DiscordPage() {
  const bots = await readCatalog("discord");
  return (
    <ProjectPage
      title="Discord"
      accent="discord"
    >
      <CatalogSection id="bots" title="Les bots" count={bots.length}>
        {bots.map(bot => <CatalogCard key={bot.id} name={bot.name} icon={bot.icon} category="Bot Discord" description={bot.description}>
          {bot.version && <p className="mt-4 text-sm leading-7 text-slate-300">Version {bot.version}</p>}
          <CatalogAction href={bot.url}>{bot.url ? `Ajouter ${bot.name} à Discord` : "Invitation à venir"}</CatalogAction>
        </CatalogCard>)}
      </CatalogSection>
    </ProjectPage>
  );
}
