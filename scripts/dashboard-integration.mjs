// Runs only against a disposable production server and temporary catalogs.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { encode } from 'next-auth/jwt';

const dir = await mkdtemp(path.join(os.tmpdir(), 'hydroxios-integration-'));
const secret = randomBytes(32).toString('hex');
const allowed = '155715022192902144';
const origin = 'https://dashboard.test';
const port = 18081;
const base = `http://127.0.0.1:${port}`;
let server;
try {
  for (const kind of ['discord', 'minecraft', 'packs']) await writeFile(path.join(dir, `${kind}.json`), '[]\n');
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXTAUTH_URL: origin, NEXTAUTH_SECRET: secret, ADMIN_DISCORD_ID: allowed, DISCORD_CLIENT_ID: 'integration-fixture', DISCORD_CLIENT_SECRET: 'integration-fixture', CATALOG_DATA_DIR: dir },
  });
  let ready = false;
  server.stdout.on('data', chunk => { if (chunk.toString().includes('Ready')) ready = true; });
  server.stderr.resume();
  for (let i = 0; !ready && i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Test server failed to start. Check that port 18081 is free.');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert(ready, 'Test server startup timed out');
  const token = await encode({ secret, token: { discordId: allowed, name: 'Test owner' }, maxAge: 300 });
  const cookie = `__Secure-next-auth.session-token=${token}`;
  const endpoint = `${base}/api/dashboard/catalogs/discord`;
  assert.equal((await fetch(endpoint)).status, 401);
  const outsider = await encode({ secret, token: { discordId: '111111111111111111' }, maxAge: 300 });
  assert.equal((await fetch(endpoint, { headers: { cookie: `__Secure-next-auth.session-token=${outsider}` } })).status, 401);
  assert.equal((await fetch(endpoint, { headers: { cookie: '__Secure-next-auth.session-token=forged' } })).status, 401);
  const expired = await encode({ secret, token: { discordId: allowed }, maxAge: -300 });
  assert.equal((await fetch(endpoint, { headers: { cookie: `__Secure-next-auth.session-token=${expired}` } })).status, 401);
  assert.equal((await fetch(`${base}/dashboard`, { redirect: 'manual' })).status, 307);
  const dashboard = await fetch(`${base}/dashboard`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);
  assert((await dashboard.text()).includes('Catalogues'));
  assert.equal(dashboard.headers.get('x-frame-options'), 'DENY');
  const response = await fetch(endpoint, { headers: { cookie } });
  assert.equal(response.status, 200);
  const initial = await response.json();
  const entries = [{ id: 'integration-bot', name: 'Integration bot', description: 'Test only' }];
  const body = JSON.stringify({ entries, revision: initial.revision });
  const headers = { cookie, origin, 'Content-Type': 'application/json', 'X-Dashboard-Request': '1' };
  assert.equal((await fetch(endpoint, { method: 'PUT', headers: { ...headers, origin: 'https://evil.test' }, body })).status, 403);
  assert.equal((await fetch(endpoint, { method: 'PUT', headers: { ...headers, 'X-Dashboard-Request': '' }, body })).status, 403);
  assert.equal((await fetch(endpoint, { method: 'PUT', headers: { ...headers, cookie: '' }, body })).status, 401);
  assert.equal((await fetch(endpoint, { method: 'PUT', headers, body: 'broken json' })).status, 400);
  assert.equal((await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify({ entries: [{ id: 'bad' }], revision: initial.revision }) })).status, 400);
  assert.equal((await fetch(endpoint, { method: 'PUT', headers, body: 'x'.repeat(512 * 1024 + 1) })).status, 413);
  assert.equal((await fetch(`${base}/api/dashboard/catalogs/unknown`, { headers: { cookie } })).status, 404);
  const saved = await fetch(endpoint, { method: 'PUT', headers, body });
  assert.equal(saved.status, 200, await saved.text());
  assert.equal((await fetch(endpoint, { method: 'PUT', headers, body })).status, 409);
  const publicData = await (await fetch(`${base}/api/discord`)).json();
  assert.deepEqual(publicData.bots, entries);
  await writeFile(path.join(dir, 'discord.json'), JSON.stringify([{ id: 'invalid' }]));
  assert.equal((await fetch(endpoint, { headers: { cookie } })).status, 500);
  console.log('PASS: protected page/API, owner allowlist, forged/expired tokens, CSRF, validation, body limit, save, conflict and public catalog update.');
} finally {
  if (server && server.exitCode === null) { const stopped = once(server, 'exit'); server.kill(); await stopped; }
  // mkdtemp created this exact isolated directory; never use the repository data path.
  assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep));
  await rm(dir, { recursive: true, force: true });
}
