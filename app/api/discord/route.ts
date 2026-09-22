import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Bot } from "@/app/types/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const file = await readFile(path.join(process.cwd(), "data", "discord.json"), "utf8");
        const bots: Bot[] = JSON.parse(file);

        if (!Array.isArray(bots)) {
            throw new Error("data/discord.json must contain an array");
        }

        return NextResponse.json({ bots }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to load Discord bots:", error);
        return NextResponse.json(
            { error: "Impossible de charger la liste des bots." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
