import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { isAdmin, validWriteOrigin } from '../app/lib/admin-policy.ts';
import { snapshot, saveCatalog } from '../app/lib/catalog-store.mjs';
import { validateCatalog } from '../app/lib/catalog-validation.ts';
import { catalogFingerprint } from '../app/lib/catalog-draft.ts';

test('draft detects actual changes and ignores object key ordering', () => {
  const saved = [{ id: 'bot', name: 'Bot', extra: { a: 1, b: 2 } }];
  const reordered = [{ extra: { b: 2, a: 1 }, name: 'Bot', id: 'bot' }];
  assert.equal(catalogFingerprint(saved), catalogFingerprint(reordered));
  const edited = structuredClone(saved);
  edited[0].name = 'Edited';
  assert.notEqual(catalogFingerprint(saved), catalogFingerprint(edited));
  edited[0].name = 'Bot';
  assert.equal(catalogFingerprint(saved), catalogFingerprint(edited));
  assert.notEqual(catalogFingerprint(saved), catalogFingerprint([]));
});

test('exact Discord allowlist, no fallback access', () => {
  assert.equal(isAdmin('155715022192902144', '155715022192902144'), true);
  for (const id of [null, '', 'other', 155715022192902144]) assert.equal(isAdmin(id, '155715022192902144'), false);
  assert.equal(isAdmin('', ''), false);
});
test('writes require the exact configured origin', () => {
  const url = 'https://hydroxios.fr';
  assert.equal(validWriteOrigin(url, url), true);
  for (const origin of [null, 'null', 'http://hydroxios.fr', 'https://hydroxios.fr.evil.test', 'https://evil.test']) assert.equal(validWriteOrigin(origin, url), false);
  assert.equal(validWriteOrigin(url, ''), false);
});
test('catalog saves validate, back up, reject conflicts and traversal', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'hydroxios-store-'));
  try {
    await writeFile(path.join(dir, 'discord.json'), '[]\n');
    const before = await snapshot('discord', dir);
    const entries = [{ id: 'bot', name: 'Bot', extra: { preserved: true } }];
    const saved = await saveCatalog('discord', entries, before.revision, validateCatalog, dir);
    assert.deepEqual((await snapshot('discord', dir)).entries, entries);
    const backups = await readdir(path.join(dir, '.catalog-private'));
    assert.equal(backups.filter(file => file.endsWith('.json')).length, 1);
    assert.equal(await readFile(path.join(dir, '.catalog-private', backups[0]), 'utf8'), '[]\n');
    await assert.rejects(saveCatalog('discord', [], before.revision, validateCatalog, dir), { status: 409 });
    await assert.rejects(saveCatalog('discord', [{ id: 'bad' }], saved.revision, validateCatalog, dir), { status: 400 });
    await assert.rejects(snapshot('../discord', dir), { status: 404 });
    const attempts = await Promise.allSettled([saveCatalog('discord', [], saved.revision, validateCatalog, dir), saveCatalog('discord', [], saved.revision, validateCatalog, dir)]);
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
