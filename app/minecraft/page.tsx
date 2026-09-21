import type { Metadata } from "next";
import ProjectPage from "../components/ProjectPage";

export const metadata: Metadata = {
  title: "Minecraft",
  description: "Les mods, plugins et outils Minecraft créés par Hydroxios.",
};

export default function MinecraftPage() {
  return (
    <ProjectPage
      category="Mods, plugins et outils"
      title="Minecraft"
      description="Un laboratoire pour imaginer de nouvelles mécaniques, automatiser les serveurs et fabriquer des expériences qui prolongent le jeu."
      accent="#58f0b5"
    />
  );
}
