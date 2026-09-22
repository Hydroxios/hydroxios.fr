import type { Bot } from "../types/discord";
import type { MinecraftProject } from "../types/minecraft";
import type { Pack } from "../types/pack";

type Catalogs = { discord: Bot; minecraft: MinecraftProject; packs: Pack };
export type CatalogName = keyof Catalogs;

function object(value: unknown, at: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${at}: objet attendu`);
  return value as Record<string, unknown>;
}
function text(value: unknown, at: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${at}: texte requis`);
}
function url(value: unknown, at: string) {
  text(value, at);
  const parsed = new URL(value);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(`${at}: URL HTTP(S) sans identifiants requise`);
}
export function validateCatalog<K extends CatalogName>(kind: K, input: unknown): Catalogs[K][] {
  if (!Array.isArray(input)) throw new Error(`${kind}: tableau attendu`);
  const ids = new Set<string>();
  for (const [index, value] of input.entries()) {
    const at = `${kind}[${index}]`;
    const item = object(value, at);
    for (const key of ["id", "name"]) text(item[key], `${at}.${key}`);
    if (kind !== "discord" || item.version !== undefined) text(item.version, `${at}.version`);
    if (item.demo !== undefined && typeof item.demo !== "boolean") throw new Error(`${at}.demo: booléen attendu`);
    const id = item.id as string;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`${at}: identifiant invalide ou dupliqué`);
    ids.add(id);
    if (item.icon !== undefined && item.icon !== "") {
      url(item.icon, `${at}.icon`);
      if (!new URL(item.icon as string).pathname.toLowerCase().endsWith(".png")) throw new Error(`${at}.icon: URL PNG attendue`);
    }
    if (item.description !== undefined) text(item.description, `${at}.description`);
    if (kind === "discord") {
      if (item.url !== undefined) url(item.url, `${at}.url`);
    } else {
      text(item.minecraft, `${at}.minecraft`);
      const loader = object(item.loader, `${at}.loader`);
      text(loader.type, `${at}.loader.type`);
      text(loader.version, `${at}.loader.version`);
      if (kind === "minecraft") {
        if (item.type !== "mod" && item.type !== "plugin") throw new Error(`${at}.type: mod ou plugin attendu`);
        if (item.download !== undefined) url(item.download, `${at}.download`);
      } else {
        const archive = object(item.archive, `${at}.archive`);
        url(archive.url, `${at}.archive.url`);
        if ((item.demo !== true || archive.sha256 !== undefined) && (typeof archive.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(archive.sha256))) throw new Error(`${at}.archive.sha256: empreinte SHA256 invalide`);
        if ((item.demo !== true || archive.size !== undefined) && (typeof archive.size !== "number" || !Number.isSafeInteger(archive.size) || archive.size <= 0)) throw new Error(`${at}.archive.size: taille positive entière requise`);
      }
    }
  }
  return input as Catalogs[K][];
}
