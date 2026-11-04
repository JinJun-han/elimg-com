import { syncLegacyLeads } from './lead-bridge.mjs';
const PURPOSES = Object.freeze({ business: 'OPS_BUSINESS', visa: 'OPS_VISA', care: 'OPS_CARE', mission: 'OPS_MISSION' });
const STATUSES = new Set(['new', 'review', 'working', 'done']);
const encoder = new TextEncoder();
const COOKIE = '__Host-elimg_ops';
const securityHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { ...securityHeaders, ...headers } });
const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const b64 = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const unb64 = text => Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - text.length % 4) % 4)), c => c.charCodeAt(0));
async function hmacKey(secret) { return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
async function equalSecret(a, b) {
  const key = await hmacKey('elimg-login-comparison');
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(a));
  return crypto.subtle.verify('HMAC', key, digest, encoder.encode(b));
}
async function signSession(secret) {
  const payload = b64(encoder.encode(JSON.stringify({ role: 'owner', exp: Date.now() + 60 * 60 * 1000, nonce: crypto.randomUUID() })));
  return payload + '.' + b64(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload))));
}
async function authenticated(request, secret) {
  try {
    const token = (request.headers.get('Cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (!token || token.length > 1024) return false;
    const [payload, signature, extra] = token.split('.');
    if (extra || !signature || !await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64(signature), encoder.encode(payload))) return false;
    const data = JSON.parse(new TextDecoder().decode(unb64(payload)));
    return data.role === 'owner' && Number.isFinite(data.exp) && data.exp > Date.now() && data.exp <= Date.now() + 3601000;
  } catch { return false; }
}
export function operationsAvailable(env) { return env.OPS_ENABLED === 'true' && typeof env.OPS_OWNER_KEY === 'string' && env.OPS_OWNER_KEY.length >= 32; }
export async function isOwnerAuthenticated(request, env) { return operationsAvailable(env) && authenticated(request, env.OPS_OWNER_KEY); }
function sessionCookie(value, maxAge) { return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }
async function readBody(request) {
  const raw = await request.text();
  if (encoder.encode(raw).byteLength > 16000) throw new Error('body-too-large');
  return JSON.parse(raw);
}
export function prepareRequest(input, purpose, now = new Date().toISOString()) {
  const title = clean(input.title, 160), message = clean(input.message, 3000);
  if (!title || !message) throw new Error('required-fields');
  const urgent = /긴급|응급|위험|폭력|urgent|emergency/i.test(title + ' ' + message);
  const language = /[а-яё]/i.test(message) ? '러시아어 확인 필요' : /[\u3040-\u30ff]/.test(message) ? '일본어 확인 필요' : /[가-힣]/.test(message) ? '한국어 포함' : '언어 확인 필요';
  const steps = purpose === 'visa' ? ['담당 행정사 검토 요청', '체류자격·신청 목적 확인', '검토 후 안내'] : purpose === 'care' ? ['안전과 긴급성 직접 확인', '필요한 전문기관 확인', '상담 후 후속 일정 기록'] : purpose === 'mission' ? ['요청 기관·지역 확인', '연결 대상 확인', '공유 동의 후 연결'] : ['요청 목적·일정 확인', '교육·컨설팅 범위 정리', '검토 후 회신'];
  return { id: crypto.randomUUID(), purpose, title, message, contact: clean(input.contact, 160), source: clean(input.source, 160) || '운영실 직접 등록', status: 'new', priority: urgent ? 'high' : 'normal', language, createdAt: now, updatedAt: now, automation: { engine: 'rules-v1', state: 'review-required', summary: message.slice(0, 180), nextSteps: steps, draft: '문의해 주셔서 감사합니다. 보내주신 내용을 접수했습니다. 담당자가 요청 사항을 확인한 뒤 안내드리겠습니다.', externalAI: false }, revision: 1 };
}
export async function handleOperations(request, env) {
  const url = new URL(request.url), path = url.pathname;
  if (!operationsAvailable(env)) return json({ error: '운영실이 비활성 상태이거나 전용 인증 설정이 필요합니다.' }, 503);
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) return json({ error: '허용되지 않은 요청입니다.' }, 405);
  if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: '같은 사이트에서만 요청할 수 있습니다.' }, 403);
  if (path === '/api/ops/session' && request.method === 'POST') {
    try {
      const input = await readBody(request);
      if (!await equalSecret(clean(input.key, 512), env.OPS_OWNER_KEY)) return json({ error: '관리자 키가 일치하지 않습니다.' }, 401);
      return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(await signSession(env.OPS_OWNER_KEY), 3600) });
    } catch { return json({ error: '인증 요청 형식을 확인해 주세요.' }, 400); }
  }
  if (!await isOwnerAuthenticated(request, env)) return json({ error: '관리자 로그인이 필요합니다.' }, 401);
  if (path === '/api/ops/session' && request.method === 'DELETE') return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
  if (path === '/api/ops/config' && request.method === 'GET') return json({ owner: true, purposes: Object.keys(PURPOSES).map(p => ({ purpose: p, ready: Boolean(env[PURPOSES[p]]) })), externalAI: false });
  if (path === '/api/ops/sync' && request.method === 'POST') {
    try {
      const outcome = await syncLegacyLeads(env, url.searchParams.get('purpose'), url.searchParams.get('cursor'), prepareRequest);
      if (outcome.error) return json({ error: outcome.error === 'invalid-purpose' ? '업무 분야를 확인해 주세요.' : '원본 또는 전용 저장소 연결이 필요합니다.' }, outcome.error === 'invalid-purpose' ? 400 : 503);
      return json(outcome);
    } catch { return json({ error: '접수 연동에 실패했습니다. 원본 신청은 유지됩니다.' }, 503); }
  }
  if (path !== '/api/ops/requests') return json({ error: '경로를 찾을 수 없습니다.' }, 404);
  const purpose = url.searchParams.get('purpose');
  if (!Object.hasOwn(PURPOSES, purpose)) return json({ error: '업무 분야를 지정해 주세요.' }, 400);
  const db = env[PURPOSES[purpose]];
  if (!db) return json({ error: '이 업무의 전용 저장소가 연결되지 않았습니다.' }, 503);
  try {
    if (request.method === 'GET') {
      const page = await db.list({ prefix: 'request:', limit: 100, ...(url.searchParams.get('cursor') ? { cursor: url.searchParams.get('cursor') } : {}) });
      const values = await Promise.all(page.keys.map(k => db.get(k.name)));
      const items = await Promise.all(values.filter(Boolean).map(v => JSON.parse(v)).filter(v => v.purpose === purpose).map(async item => {
        if (!item.sourceLeadKey) return item;
        const state = await db.get('state:' + item.id);
        return state ? { ...item, ...JSON.parse(state), id: item.id, purpose: item.purpose } : item;
      }));
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json({ items, cursor: page.list_complete ? null : page.cursor, consistency: 'KV 반영에 지연이 있을 수 있습니다.' });
    }
    if (request.method === 'POST') {
      const item = prepareRequest(await readBody(request), purpose);
      await db.put('request:' + item.id, JSON.stringify(item));
      return json({ item }, 201);
    }
    if (request.method === 'PATCH') {
      const input = await readBody(request);
      if (!/^[a-f0-9-]{36}$/.test(String(input.id)) || !STATUSES.has(input.status)) return json({ error: '처리 상태를 확인해 주세요.' }, 400);
      const raw = await db.get('request:' + input.id);
      if (!raw) return json({ error: '접수 내역을 찾을 수 없습니다.' }, 404);
      const item = JSON.parse(raw);
      if (item.purpose !== purpose) return json({ error: '업무 분야가 일치하지 않습니다.' }, 403);
      const previous = item.sourceLeadKey ? await db.get('state:' + item.id) : null;
      const state = previous ? JSON.parse(previous) : item;
      item.status = input.status; item.updatedAt = new Date().toISOString(); item.revision = (state.revision || 1) + 1;
      if (item.sourceLeadKey) await db.put('state:' + item.id, JSON.stringify({ status: item.status, updatedAt: item.updatedAt, revision: item.revision }));
      else await db.put('request:' + item.id, JSON.stringify(item));
      return json({ item });
    }
    return json({ error: '이 화면에서는 자료를 삭제하지 않습니다.' }, 405);
  } catch (error) {
    if (error.message === 'required-fields' || error instanceof SyntaxError || error.message === 'body-too-large') return json({ error: '제목·요청 내용을 확인해 주세요. 최대 16KB입니다.' }, 400);
    return json({ error: '저장소 처리에 실패했습니다. 저장 완료 여부를 확인한 뒤 다시 시도해 주세요.' }, 503);
  }
}
