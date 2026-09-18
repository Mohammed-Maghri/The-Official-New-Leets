const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, imports, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
    { exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; }, process: { env: { SECRET_KEY: 'test', INTRA_TOKEN: 'https://fixture.test' } }, console, TextEncoder, ...globals });
  return exports;
}

test('signature management authenticates, authorizes, validates and lists grants without replacing roles', async () => {
  const recipients = new Map();
  let authorized = true, targetExists = true, queries = 0;
  const pool = { query: async (sql, values) => {
    queries++;
    if (sql.includes('FROM leets.vip')) return { rowCount: authorized ? 1 : 0 };
    if (sql.startsWith('INSERT')) { if (!recipients.has(values[0])) recipients.set(values[0], { login: values[0], granted_by: values[1] }); }
    if (sql.startsWith('DELETE')) recipients.delete(values[0]);
    return { rows: [...recipients.values()] };
  }};
  const api = load('src/app/api/signature-profiles/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => ({ data, status: options?.status || 200 }) } },
    jose: { jwtVerify: async token => { if (token !== 'valid') throw new Error('invalid'); return { payload: { token: 'encrypted' } }; } },
    zod: require('zod'), '../auth/type.auth': { DecryptionFunction: () => 'access' },
    '@/utils/signatureProfiles': { signaturePool: pool, signatureSchema: 'CREATE TABLE fixture' },
  }, { fetch: async url => url.endsWith('/me') ? { ok: true, json: async () => ({ login: 'admin' }) } : { ok: targetExists, status: targetExists ? 200 : 404, json: async () => ({ login: 'student' }) } });
  const req = (method, login, token = 'valid') => ({ method, cookies: { get: () => token ? { value: token } : undefined }, json: async () => ({ login }) });
  assert.equal((await api.GET(req('GET', null, null))).status, 401);
  assert.equal((await api.GET(req('GET', null, 'invalid'))).status, 401);
  assert.equal(queries, 0);
  authorized = false;
  for (const method of ['GET', 'POST', 'DELETE']) assert.equal((await api[method](req(method, 'student'))).status, 403);
  assert.equal(recipients.size, 0);
  authorized = true;
  assert.equal((await api.POST(req('POST', "bad';--"))).status, 400);
  targetExists = false;
  assert.equal((await api.POST(req('POST', 'student'))).status, 404);
  targetExists = true;
  assert.equal((await api.POST(req('POST', ' Student '))).status, 200);
  await api.POST(req('POST', 'student'));
  assert.equal(recipients.size, 1);
  const listed = await api.GET(req('GET'));
  assert.equal(listed.data.recipients[0].login, 'student');
  assert.equal(listed.data.recipients[0].granted_by, 'admin');
  await api.DELETE(req('DELETE', 'student'));
  assert.equal((await api.GET(req('GET'))).data.recipients.length, 0);
});

test('fresh signature overlay preserves badges and reflects revocation on cached cards', async () => {
  let enabled = true, missing = false;
  const module = load('src/utils/signatureProfiles.ts', { pg: { Pool: class { async query() { if (missing) throw { code: '42P01' }; return { rows: enabled ? [{ login: 'student' }] : [] }; } } } });
  const cached = [{ login: 'student', badge: { type: 'vip', name: 'VIP' } }, { login: 'other' }];
  let users = await module.withSignatureProfiles(cached);
  assert.equal(users[0].signatureProfile, true);
  assert.equal(users[0].badge.type, 'vip');
  assert.equal(users[1].signatureProfile, false);
  assert.equal(cached[0].signatureProfile, undefined);
  enabled = false;
  users = await module.withSignatureProfiles(users);
  assert.equal(users[0].signatureProfile, false);
  missing = true;
  assert.equal((await module.withSignatureProfiles(cached))[0].signatureProfile, false);
});
