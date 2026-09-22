import { readFile, writeFile, mkdir, open, rename, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

export const catalogNames = ['minecraft', 'discord', 'packs'];
export function catalogDirectory() {
  if (process.env.CATALOG_DATA_DIR) {
    if (!path.isAbsolute(process.env.CATALOG_DATA_DIR)) throw new Error('CATALOG_DATA_DIR doit être un chemin absolu.');
    // External persistent storage is provisioned separately from the build.
    return path.resolve(/* turbopackIgnore: true */ process.env.CATALOG_DATA_DIR);
  }
  return path.join(process.cwd(), 'data');
}
export function revisionOf(text) { return createHash('sha256').update(text).digest('hex'); }
export class StoreError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
function fileFor(kind, directory) {
  if (!catalogNames.includes(kind)) throw new StoreError('Catalogue inconnu.', 404);
  return path.join(directory, `${kind}.json`);
}
export async function snapshot(kind, directory = catalogDirectory()) {
  const raw = await readFile(fileFor(kind, directory), 'utf8');
  return { entries: JSON.parse(raw), revision: revisionOf(raw) };
}
export async function saveCatalog(kind, entries, revision, validate, directory = catalogDirectory()) {
  const file = fileFor(kind, directory);
  try { validate(kind, entries); } catch (error) { throw new StoreError(error.message, 400); }
  const content = JSON.stringify(entries, null, 2) + '\n';
  if (Buffer.byteLength(content) > 512 * 1024) throw new StoreError('Catalogue trop volumineux.', 413);
  const privateDir = path.join(directory, '.catalog-private');
  await mkdir(privateDir, { recursive: true, mode: 0o700 });
  const lockFile = path.join(privateDir, `${kind}.lock`);
  let lock;
  try { lock = await open(lockFile, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') throw new StoreError('Enregistrement en cours. Réessayez.', 409); throw error; }
  const temp = path.join(directory, `.${kind}-${randomUUID()}.tmp`);
  try {
    const previous = await readFile(file, 'utf8');
    if (revision !== revisionOf(previous)) throw new StoreError('Ce catalogue a changé. Rechargez avant de réessayer.', 409);
    await writeFile(path.join(privateDir, `${kind}-${Date.now()}-${randomUUID()}.json`), previous, { flag: 'wx', mode: 0o600 });
    const handle = await open(temp, 'wx', 0o600);
    try { await handle.writeFile(content, 'utf8'); await handle.sync(); } finally { await handle.close(); }
    if (revisionOf(await readFile(file, 'utf8')) !== revision) throw new StoreError('Modification externe détectée. Rechargez le catalogue.', 409);
    await rename(temp, file);
    return { entries, revision: revisionOf(content) };
  } finally {
    await unlink(temp).catch(() => {});
    await lock.close();
    await unlink(lockFile);
  }
}
