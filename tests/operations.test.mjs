import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleOperations } from '../server/operations.mjs';
import worker from '../operations-worker.mjs';

function kv() {
  const values = new Map();
  return { values, async get(k) { return values.get(k) ?? null; }, async put(k, v) { values.set(k, v); }, async list({ prefix, limit, cursor }) { const all = [...values.keys()].filter(k => k.startsWith(prefix)); const start = Number(cursor || 0); return { keys: all.slice(start, start + limit).map(name => ({ name })), list_complete: start + limit >= all.length, cursor: String(start + limit) }; } };
}
function environment() { return { OPS_ENABLED: 'true', ADMIN_KEY: 'legacy-test-key', OPS_OWNER_KEY: 'owner-only-test-key-at-least-32-chars', OPS_BUSINESS: kv(), OPS_VISA: kv(), OPS_CARE: kv(), OPS_MISSION: kv() }; }
const req = (path, options = {}) => new Request('https://elimg.com/api/ops/' + path, options);
async function login(env) {
  const response = await handleOperations(req('session', { method: 'POST', headers: { Origin: 'https://elimg.com' }, body: JSON.stringify({ key: env.OPS_OWNER_KEY }) }), env);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Strict/);
  return response.headers.get('Set-Cookie').split(';')[0];
}
async function action(env, cookie, purpose, method, body) {
  return handleOperations(req('requests?purpose=' + purpose, { method, headers: { Cookie: cookie, Origin: 'https://elimg.com' }, ...(body ? { body: JSON.stringify(body) } : {}) }), env);
}
test('disabled and missing-secret environments fail closed', async () => {
  assert.equal((await handleOperations(req('config'), {})).status, 503);
  assert.equal((await handleOperations(req('config'), { OPS_ENABLED: 'true' })).status, 503);
  assert.equal((await handleOperations(req('config'), environment())).status, 401);
});
test('bad credentials, forged sessions and cross-site writes cannot access data', async () => {
  const env = environment();
  assert.equal((await handleOperations(req('session', { method: 'POST', headers: { Origin: 'https://elimg.com' }, body: '{"key":"wrong"}' }), env)).status, 401);
  assert.equal((await handleOperations(req('config', { headers: { Cookie: '__Host-elimg_ops=fake.signature' } }), env)).status, 401);
  const cookie = await login(env);
  assert.equal((await handleOperations(req('requests?purpose=business', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://other.example' }, body: '{}' }), env)).status, 403);
  assert.equal(env.OPS_BUSINESS.values.size, 0);
});
test('records persist in purpose-specific storage and generate review-only drafts', async () => {
  const env = environment(), cookie = await login(env);
  const saved = await action(env, cookie, 'business', 'POST', { title: 'AI 교육 요청', contact: 'example@example.test', message: '긴급하게 교육 일정을 확인하고 싶습니다.' });
  assert.equal(saved.status, 201);
  const { item } = await saved.json();
  assert.equal(item.priority, 'high'); assert.equal(item.automation.externalAI, false); assert.equal(item.automation.state, 'review-required');
  assert.equal(env.OPS_BUSINESS.values.size, 1); assert.equal(env.OPS_VISA.values.size, 0);
  assert.equal((await (await action(env, cookie, 'visa', 'GET')).json()).items.length, 0);
  assert.equal((await action(env, cookie, 'visa', 'PATCH', { id: item.id, status: 'done' })).status, 404);
  assert.equal((await action(env, cookie, 'business', 'PATCH', { id: item.id, status: 'done' })).status, 200);
  const list = await action(env, cookie, 'business', 'GET');
  assert.equal(list.headers.get('Cache-Control'), 'no-store'); assert.equal(list.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal((await list.json()).items[0].status, 'done');
});
test('unknown purposes, missing storage, invalid records and deletion are rejected', async () => {
  const env = environment(), cookie = await login(env);
  assert.equal((await action(env, cookie, '__proto__', 'GET')).status, 400);
  delete env.OPS_CARE; assert.equal((await action(env, cookie, 'care', 'GET')).status, 503);
  assert.equal((await action(env, cookie, 'business', 'POST', { title: '', message: '' })).status, 400);
  assert.equal((await action(env, cookie, 'business', 'DELETE')).status, 405);
  assert.equal((await action(env, cookie, 'business', 'PATCH', { id: 'x', status: 'done' })).status, 400);
});
test('pagination exposes a cursor instead of silently losing requests over 100', async () => {
  const env = environment(), cookie = await login(env);
  for (let i = 0; i < 101; i++) await env.OPS_BUSINESS.put('request:' + i, JSON.stringify({ id: String(i), purpose: 'business', createdAt: new Date().toISOString() }));
  const first = await (await action(env, cookie, 'business', 'GET')).json(); assert.equal(first.items.length, 100); assert.ok(first.cursor);
  const next = await handleOperations(req('requests?purpose=business&cursor=' + first.cursor, { headers: { Cookie: cookie } }), env);
  const second = await next.json(); assert.equal(second.items.length, 1); assert.equal(second.cursor, null);
});
test('public site routing survives while every private asset requires a session', async () => {
  let assetCalls = 0;
  const env = { ...environment(), ASSETS: { async fetch(request) { assetCalls++; return new Response(new URL(request.url).pathname); } } };
  assert.equal(await (await worker.fetch(new Request('https://elimg.com/'), env)).text(), '/');
  assert.equal((await worker.fetch(new Request('https://elimg.com/KIIP_Level1_Index.html'), env)).status, 307);
  for (const path of ['/ops', '/ops/', '/ops/index.html', '/ops/?demo=1', '/ops/index.html?demo=1']) {
    const response = await worker.fetch(new Request('https://elimg.com' + path), env);
    assert.equal(response.status, 303); assert.equal(response.headers.get('Location'), '/ops/login');
    assert.equal(await response.text(), '');
  }
  for (const path of ['/ops/ops.js', '/ops/ops.css', '/ops/arbitrary.html']) {
    const response = await worker.fetch(new Request('https://elimg.com' + path), env);
    assert.equal(response.status, 401); assert.doesNotMatch(await response.text(), /demoRecords|사업·교육/);
  }
  assert.equal(assetCalls, 1, 'private files must never be served through the public asset binding');
  const cookie = await login(env);
  const response = await worker.fetch(new Request('https://elimg.com/ops/', { headers: { Cookie: cookie } }), env);
  assert.equal(response.status, 200); assert.match(await response.text(), /ELIMG 운영실/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  const js = await worker.fetch(new Request('https://elimg.com/ops/ops.js', { headers: { Cookie: cookie } }), env);
  assert.equal(js.status, 200); assert.match(js.headers.get('Content-Type'), /javascript/);
  const head = await worker.fetch(new Request('https://elimg.com/ops/', { method: 'HEAD', headers: { Cookie: cookie } }), env);
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
});
test('owner-only login is separate from the old shared admin key', async () => {
  const env = environment();
  const request = key => new Request('https://elimg.com/ops/login', { method: 'POST', headers: { Origin: 'https://elimg.com', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key }) });
  assert.equal((await worker.fetch(request(env.ADMIN_KEY), env)).status, 401);
  assert.equal((await worker.fetch(request(env.OPS_OWNER_KEY), env)).status, 303);
  const response = await worker.fetch(request(env.OPS_OWNER_KEY), env);
  assert.match(response.headers.get('Set-Cookie'), /^__Host-elimg_ops=/);
  assert.match(response.headers.get('Set-Cookie'), /Path=\//);
  const loginForm = await worker.fetch(new Request('https://elimg.com/ops/login'), env);
  const html = await loginForm.text();
  assert.match(html, /소유자 전용 운영실/); assert.doesNotMatch(html, /접수 목록|demoRecords|count-total/);
  assert.doesNotMatch(html, new RegExp(env.OPS_OWNER_KEY));
  assert.equal((await worker.fetch(new Request('https://elimg.com/ops/'), { ...env, OPS_OWNER_KEY: '' })).status, 503);
  assert.equal((await worker.fetch(new Request('https://elimg.com/ops/'), { ...env, OPS_OWNER_KEY: 'short' })).status, 503);
});
test('expired sessions, changed secrets, and post-logout browser access are rejected', async () => {
  const env = environment(), cookie = await login(env);
  assert.equal((await worker.fetch(new Request('https://elimg.com/ops/', { headers: { Cookie: cookie } }), { ...env, OPS_OWNER_KEY: 'different-owner-only-key-at-least-32-chars' })).status, 303);
  const originalNow = Date.now;
  try {
    const future = originalNow() + 61 * 60 * 1000;
    Date.now = () => future;
    assert.equal((await handleOperations(req('config', { headers: { Cookie: cookie } }), env)).status, 401);
  } finally { Date.now = originalNow; }
  const logout = await handleOperations(req('session', { method: 'DELETE', headers: { Cookie: cookie, Origin: 'https://elimg.com' } }), env);
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal((await worker.fetch(new Request('https://elimg.com/ops/'), env)).status, 303);
});

test('deployment configuration excludes private files and runs authentication before asset routing', () => {
  const ignore = readFileSync(new URL('../.assetsignore', import.meta.url), 'utf8');
  assert.match(ignore, /^ops\/$/m); assert.match(ignore, /^server\/$/m);
  const config = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.match(config, /run_worker_first\s*=\s*\["\/ops", "\/ops\/\*", "\/api\/ops\/\*"\]/);
});
