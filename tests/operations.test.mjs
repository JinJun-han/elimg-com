import test from 'node:test';
import assert from 'node:assert/strict';
import { handleOperations } from '../server/operations.mjs';
import worker from '../operations-worker.mjs';

function kv() {
  const values = new Map();
  return { values, async get(k) { return values.get(k) ?? null; }, async put(k, v) { values.set(k, v); }, async list({ prefix, limit, cursor }) { const all = [...values.keys()].filter(k => k.startsWith(prefix)); const start = Number(cursor || 0); return { keys: all.slice(start, start + limit).map(name => ({ name })), list_complete: start + limit >= all.length, cursor: String(start + limit) }; } };
}
function environment() { return { OPS_ENABLED: 'true', ADMIN_KEY: 'test-owner-key', OPS_BUSINESS: kv(), OPS_VISA: kv(), OPS_CARE: kv(), OPS_MISSION: kv() }; }
const req = (path, options = {}) => new Request('https://elimg.com/api/ops/' + path, options);
async function login(env) {
  const response = await handleOperations(req('session', { method: 'POST', headers: { Origin: 'https://elimg.com' }, body: JSON.stringify({ key: env.ADMIN_KEY }) }), env);
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
  assert.equal((await handleOperations(req('config', { headers: { Cookie: 'elimg_ops=fake.signature' } }), env)).status, 401);
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
test('existing site routing survives and ops pages receive cache and frame protections', async () => {
  const env = { ASSETS: { async fetch(request) { return new Response(new URL(request.url).pathname); } } };
  assert.equal(await (await worker.fetch(new Request('https://elimg.com/'), env)).text(), '/');
  assert.equal((await worker.fetch(new Request('https://elimg.com/KIIP_Level1_Index.html'), env)).status, 307);
  const response = await worker.fetch(new Request('https://elimg.com/ops/'), env);
  assert.equal(await response.text(), '/ops/index.html'); assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
});
