import { adminSession } from "@/app/lib/admin-auth";
import { validWriteOrigin } from "@/app/lib/admin-policy";
import { catalogNames, snapshot, saveCatalog, StoreError } from "@/app/lib/catalog-store.mjs";
import { validateCatalog, type CatalogName } from "@/app/lib/catalog-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ kind: string }> };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function GET(_request: Request, context: Context) {
  if (!await adminSession()) return reply({ error: "Accès refusé." }, 401);
  const { kind } = await context.params;
  if (!catalogNames.includes(kind)) return reply({ error: "Catalogue inconnu." }, 404);
  try {
    const data = await snapshot(kind);
    validateCatalog(kind as CatalogName, data.entries);
    return reply(data);
  }
  catch { return reply({ error: "Lecture impossible." }, 500); }
}

export async function PUT(request: Request, context: Context) {
  if (!await adminSession()) return reply({ error: "Accès refusé." }, 401);
  if (!validWriteOrigin(request.headers.get("origin")) || request.headers.get("x-dashboard-request") !== "1") return reply({ error: "Origine refusée." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply({ error: "JSON requis." }, 415);
  const { kind } = await context.params;
  if (!catalogNames.includes(kind)) return reply({ error: "Catalogue inconnu." }, 404);
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Corps requis." }, 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512 * 1024) { await reader.cancel(); return reply({ error: "Requête trop volumineuse." }, 413); }
      chunks.push(value);
    }
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return reply({ error: "JSON invalide." }, 400); }
    if (!body || typeof body.revision !== "string" || !/^[a-f0-9]{64}$/.test(body.revision)) return reply({ error: "Révision requise." }, 400);
    return reply(await saveCatalog(kind, body.entries, body.revision, (name: CatalogName, entries: unknown) => validateCatalog(name, entries)));
  } catch (error) {
    if (error instanceof StoreError) return reply({ error: error.message }, error.status);
    console.error("Catalog write failed", error);
    return reply({ error: "Enregistrement impossible." }, 500);
  } finally { reader.releaseLock(); }
}
