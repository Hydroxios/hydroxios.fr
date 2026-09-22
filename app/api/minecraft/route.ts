import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { MinecraftProject } from "@/app/types/minecraft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const file = await readFile(path.join(process.cwd(), "data", "minecraft.json"), "utf8");
        const projects: MinecraftProject[] = JSON.parse(file);

        if (!Array.isArray(projects)) {
            throw new Error("data/minecraft.json must contain an array");
        }

        return NextResponse.json({ projects }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load Minecraft projects:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des projets Minecraft." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
