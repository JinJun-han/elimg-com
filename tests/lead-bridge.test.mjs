import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../operations-worker.mjs';
import { classifyLead, mirrorLead, syncLegacyLeads } from '../server/lead-bridge.mjs';
import { prepareRequest, handleOperations } from '../server/operations.mjs';

function kv() {
  const values = new Map();
  return { values, async get(k) { return values.get(k) ?? null; }, async put(k, v) { values.set(k, v); }, async list({ prefix, limit, cursor }) { const keys = [...values.keys()].filter(k => k.startsWith(prefix)); const start = Number(cursor || 0); return { keys: keys.slice(start, start + limit).map(name => ({ name })), list_complete: start + limit >= keys.length, cursor: String(start + limit) }; } };
}
const envFor = () => ({ OPS_ENABLED: 'true', OPS_OWNER_KEY: 'owner-test-only-secret-at-least-32-characters', FEEDBACK: kv(), OPS_BUSINESS: kv(), OPS_VISA: kv(), OPS_CARE: kv(), OPS_MISSION: kv() });
async function cookieFor(env) {
  const response = await handleOperations(new Request('https://elimg.com/api/ops/session', { method: 'POST', headers: { Origin: 'https://elimg.com' }, body: JSON.stringify({ key: env.OPS_OWNER_KEY }) }), env);
  return response.headers.get('Set-Cookie').split(';')[0];
}
const ops = (cookie, path, method = 'GET', body) => new Request('https://elimg.com/api/ops/' + path, { method, headers: { Cookie: cookie, Origin: 'https://elimg.com' }, ...(body ? { body: JSON.stringify(body) } : {}) });

test('classifies only explicit enquiry types and leaves conflicting/free-text guesses for review', () => {
  assert.equal(classifyLead({ kind: 'AI아카데미 진단설문' }), 'business');
  assert.equal(classifyLead({ kind: '이주민 법무·행정' }), 'visa');
  assert.equal(classifyLead({ kind: '생활 지원' }), 'care');
  assert.equal(classifyLead({ kind: '선교·사역 협력' }), 'mission');
  assert.equal(classifyLead({ kind: '선교 교육' }), null);
  assert.equal(classifyLead({ kind: '기타 문의', message: '교육과 의료, 비자에 대한 내용' }), null);
});
test('public receipt remains authoritative and known enquiries reach only the intended private store', async () => {
  const env = envFor();
  const response = await worker.fetch(new Request('https://elimg.com/api/lead', { method: 'POST', body: JSON.stringify({ name: '검증용', contact: 'example@example.test', kind: 'AI 컨설팅·교육', message: '교육 일정을 문의합니다.', extra: { sensitive: 'do-not-copy' } }) }), env);
  assert.equal(response.status, 200); const receipt = await response.json(); assert.equal(receipt.ok, true);
  assert.ok(await env.FEEDBACK.get(receipt.key)); assert.equal(env.FEEDBACK.values.size, 1);
  assert.equal(env.OPS_BUSINESS.values.size, 1); assert.equal(env.OPS_VISA.values.size, 0); assert.equal(env.OPS_MISSION.values.size, 0);
  const item = JSON.parse([...env.OPS_BUSINESS.values.values()][0]);
  assert.equal(item.sourceLeadKey, receipt.key); assert.equal(item.applicantName, '검증용'); assert.equal(item.automation.externalAI, false); assert.equal(item.extra, undefined);
});
test('derived write failure does not reject the original submission and owner sync recovers it', async () => {
  const env = envFor(); env.OPS_BUSINESS.put = async () => { throw new Error('simulated KV failure'); };
  const response = await worker.fetch(new Request('https://elimg.com/api/lead', { method: 'POST', body: JSON.stringify({ contact: 'test', kind: '한국어 교육', message: '검증' }) }), env);
  assert.equal(response.status, 200); const receipt = await response.json(); assert.ok(await env.FEEDBACK.get(receipt.key));
  env.OPS_BUSINESS = kv();
  const outcome = await syncLegacyLeads(env, 'business', null, prepareRequest); assert.equal(outcome.imported, 1); assert.equal(env.OPS_BUSINESS.values.size, 1);
  assert.equal((await syncLegacyLeads(env, 'business', null, prepareRequest)).existing, 1);
  assert.equal(env.OPS_BUSINESS.values.size, 1);
});
test('replay uses a stable identity and cannot reset separately stored processing status', async () => {
  const env = envFor(), sourceKey = 'lead_123456789_abc12';
  const raw = JSON.stringify({ kind: 'AI 교육', contact: 'test', message: '검증', ts: '2026-11-04T00:00:00Z', status: 'contacted' });
  await env.FEEDBACK.put(sourceKey, raw);
  const mirrored = await mirrorLead(sourceKey, env, prepareRequest), cookie = await cookieFor(env);
  const updated = await handleOperations(ops(cookie, 'requests?purpose=business', 'PATCH', { id: mirrored.id, status: 'done' }), env);
  assert.equal(updated.status, 200);
  // Simulate a stale KV read by removing only the derived intake record.
  // Processing state is a separate key that the replay never overwrites.
  env.OPS_BUSINESS.values.delete('request:' + mirrored.id);
  const replay = await mirrorLead(sourceKey, env, prepareRequest); assert.equal(replay.id, mirrored.id);
  const list = await (await handleOperations(ops(cookie, 'requests?purpose=business'), env)).json();
  assert.equal(list.items.length, 1); assert.equal(list.items[0].status, 'done'); assert.equal(await env.FEEDBACK.get(sourceKey), raw);
});
test('unknown enquiries stay in original storage and sync requires owner authentication', async () => {
  const env = envFor(); await env.FEEDBACK.put('lead_123456789_abc12', JSON.stringify({ kind: '기타', message: '내용', contact: 'test' }));
  const denied = await handleOperations(ops('', 'sync?purpose=business', 'POST', {}), env); assert.equal(denied.status, 401);
  const outcome = await syncLegacyLeads(env, 'business', null, prepareRequest); assert.equal(outcome.review, 1); assert.equal(env.OPS_BUSINESS.values.size, 0); assert.equal(env.FEEDBACK.values.size, 1);
});
test('source pagination preserves remaining enquiries instead of silently truncating', async () => {
  const env = envFor();
  for (let i = 0; i < 51; i++) await env.FEEDBACK.put('lead_' + (123456789 + i) + '_abc12', JSON.stringify({ kind: '비자 행정', message: '검증', contact: 'test' }));
  const first = await syncLegacyLeads(env, 'visa', null, prepareRequest); assert.equal(first.scanned, 50); assert.ok(first.cursor);
  const second = await syncLegacyLeads(env, 'visa', first.cursor, prepareRequest); assert.equal(second.imported, 1); assert.equal(second.cursor, null); assert.equal(env.OPS_VISA.values.size, 51);
});
