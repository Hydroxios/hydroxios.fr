import type { Metadata } from "next";
import ProjectPage from "../components/ProjectPage";

export const metadata: Metadata = {
  title: "Bots Discord",
  description: "Les bots Discord et automatisations créés par Hydroxios.",
};

export default function DiscordPage() {
  return (
    <ProjectPage
      category="Bots, intégrations et communautés"
      title="Discord"
      description="Des outils sur mesure pour modérer, connecter et faire vivre les communautés sans ajouter de friction."
      accent="#9b7cff"
    />
  );
}
