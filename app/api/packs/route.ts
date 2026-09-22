import { readCatalog } from "@/app/lib/catalogs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const packs = await readCatalog("packs");

        return NextResponse.json({ packs }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load packs:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des packs." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
