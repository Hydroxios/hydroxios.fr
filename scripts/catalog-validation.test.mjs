import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog } from '../app/lib/catalog-validation.ts';

test('accepte les URL PNG et les icônes absentes, refuse les autres sources', () => {
  const bot = { id: 'test', name: 'Test' };
  for (const icon of [undefined, '', 'https://cdn.example.com/icon.png?v=2', 'https://cdn.example.com/ICON.PNG']) {
    assert.doesNotThrow(() => validateCatalog('discord', [{ ...bot, icon }]));
  }
  for (const icon of ['javascript:alert(1)', 'https://example.com/icon.svg', '/projects/default.svg', 42]) {
    assert.throws(() => validateCatalog('discord', [{ ...bot, icon }]));
  }
});

test('les catalogues publiés respectent les schémas', async () => {
  for (const kind of ['minecraft', 'discord', 'packs']) {
    const data = JSON.parse(await readFile(new URL(`../data/${kind}.json`, import.meta.url), 'utf8'));
    assert.deepEqual(validateCatalog(kind, data), data);
  }
});
test('refuse les structures, identifiants et liens invalides', () => {
  const bot = { id: 'fireteam-maker', name: 'FireteamMaker' };
  for (const input of [{}, [null], [{ ...bot, name: '' }], [bot, bot], [{ ...bot, url: 'javascript:alert(1)' }], [{ ...bot, url: 'https://user:pass@example.com' }]]) {
    assert.throws(() => validateCatalog('discord', input));
  }
  assert.deepEqual(validateCatalog('discord', [bot]), [bot]);
});
test('exige une archive complète pour un pack publié et autorise une démo explicite', () => {
  const pack = { id: 'test-pack', name: 'Test', version: '1.0', minecraft: '1.20.1', loader: { type: 'forge', version: '47' }, archive: { url: 'https://example.com/pack.zip' } };
  assert.throws(() => validateCatalog('packs', [pack]));
  assert.doesNotThrow(() => validateCatalog('packs', [{ ...pack, demo: true }]));
  const complete = { ...pack, archive: { ...pack.archive, sha256: 'a'.repeat(64), size: 1024 } };
  assert.doesNotThrow(() => validateCatalog('packs', [complete]));
  for (const archive of [{ ...complete.archive, sha256: '...' }, { ...complete.archive, size: -1 }, { ...complete.archive, size: 1.2 }]) assert.throws(() => validateCatalog('packs', [{ ...complete, archive }]));
  assert.throws(() => validateCatalog('packs', [{ ...pack, demo: 'true' }]));
});
test('vérifie le type de projet et sa plateforme', () => {
  const project = { id: 'test', name: 'Test', version: '1', minecraft: '1.20.1', type: 'mod', loader: { type: 'forge', version: '47' } };
  assert.doesNotThrow(() => validateCatalog('minecraft', [project]));
  assert.throws(() => validateCatalog('minecraft', [{ ...project, type: 'other' }]));
  assert.throws(() => validateCatalog('minecraft', [{ ...project, loader: {} }]));
});
