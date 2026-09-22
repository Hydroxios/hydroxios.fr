import { readCatalog } from "@/app/lib/catalogs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const bots = await readCatalog("discord");

        return NextResponse.json({ bots }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load Discord bots:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des bots." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
