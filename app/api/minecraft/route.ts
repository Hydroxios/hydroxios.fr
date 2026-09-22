import { readCatalog } from "@/app/lib/catalogs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const projects = await readCatalog("minecraft");

        return NextResponse.json({ projects }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load Minecraft projects:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des projets Minecraft." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
