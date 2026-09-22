import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateCatalog, type CatalogName } from "./catalog-validation";

export async function readCatalog<K extends CatalogName>(kind: K) {
  const file = await readFile(path.join(process.cwd(), "data", `${kind}.json`), "utf8");
  return validateCatalog(kind, JSON.parse(file));
}
