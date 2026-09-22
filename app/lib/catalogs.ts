import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateCatalog, type CatalogName } from "./catalog-validation";
import { catalogDirectory } from "./catalog-store.mjs";

export async function readCatalog<K extends CatalogName>(kind: K) {
  const file = await readFile(path.join(catalogDirectory(), `${kind}.json`), "utf8");
  return validateCatalog(kind, JSON.parse(file));
}
