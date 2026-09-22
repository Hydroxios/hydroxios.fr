import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfigured, authOptions } from "@/app/lib/admin-auth";

const handler = NextAuth(authOptions);
export const runtime = "nodejs";
async function authHandler(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!authConfigured()) return Response.json({ error: "Connexion non configurée." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const response = await handler(request, context);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
export { authHandler as GET, authHandler as POST };
