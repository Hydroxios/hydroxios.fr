import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const file = await readFile(path.join(process.cwd(), "data", "packs.json"), "utf8");
        const packs: unknown = JSON.parse(file);

        if (!Array.isArray(packs)) {
            throw new Error("data/packs.json must contain an array");
        }

        return NextResponse.json({ packs }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load packs:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des packs." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
