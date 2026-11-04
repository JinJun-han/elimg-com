const STORES = { business: 'OPS_BUSINESS', visa: 'OPS_VISA', care: 'OPS_CARE', mission: 'OPS_MISSION' };

// Use the submitted enquiry type, not free-text medical/legal/religious details.
// Conflicting or unknown types remain in the original inbox for owner review.
export function classifyLead(lead) {
  const kind = String(lead.kind || '');
  const matches = [];
  if (/비자|법무|행정|귀화/.test(kind)) matches.push('visa');
  if (/돌봄|복지|의료|심리|생활.*지원/.test(kind)) matches.push('care');
  if (/선교|사역|교회|기도/.test(kind)) matches.push('mission');
  if (/교육|아카데미|KIIP|한국어|컨설팅|웹사이트|기업|창업|비즈니스|프리미엄|요금제/.test(kind)) matches.push('business');
  return matches.length === 1 ? matches[0] : null;
}

async function sourceId(key) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('elimg-legacy-lead:' + key)));
  const hex = [...digest].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function mirrorLead(key, env, prepare, requiredPurpose = null) {
  if (!/^lead_[0-9]+_[a-z0-9]+$/.test(String(key))) return { result: 'invalid' };
  if (!env.FEEDBACK) return { result: 'source-unavailable' };
  const raw = await env.FEEDBACK.get(key);
  if (!raw) return { result: 'missing' };
  let source;
  try { source = JSON.parse(raw); } catch { return { result: 'invalid' }; }
  const purpose = classifyLead(source);
  if (!purpose) return { result: 'review' };
  if (requiredPurpose && purpose !== requiredPurpose) return { result: 'other-purpose' };
  const db = env[STORES[purpose]];
  if (!db) return { result: 'store-unavailable', purpose };
  const id = await sourceId(key);
  if (await db.get('request:' + id)) return { result: 'existing', purpose, id };
  const timestamp = typeof source.ts === 'string' && Number.isFinite(Date.parse(source.ts)) ? new Date(source.ts).toISOString() : new Date().toISOString();
  const item = prepare({ title: String(source.kind).slice(0, 120), message: source.message || '신청이 접수되었습니다. 상세 요청은 직접 확인해 주세요.', contact: source.contact, source: source.from || 'elimg.com 상담 신청' }, purpose, timestamp);
  item.id = id;
  item.sourceLeadKey = key;
  item.applicantName = String(source.name || '').slice(0, 80);
  item.legacyStatus = String(source.status || 'new').slice(0, 40);
  item.status = ({ new: 'new', contacted: 'working', proposal: 'working', won: 'done', lost: 'done' })[item.legacyStatus] || 'new';
  // Never copy arbitrary extra payloads or write owner workflow state here.
  await db.put('request:' + id, JSON.stringify(item));
  return { result: 'imported', purpose, id };
}

export async function syncLegacyLeads(env, purpose, cursor, prepare) {
  if (!Object.hasOwn(STORES, purpose)) return { error: 'invalid-purpose' };
  if (!env.FEEDBACK || !env[STORES[purpose]]) return { error: 'store-unavailable' };
  const page = await env.FEEDBACK.list({ prefix: 'lead_', limit: 50, ...(cursor ? { cursor } : {}) });
  const counts = { imported: 0, existing: 0, review: 0, skipped: 0, failed: 0 };
  for (const key of page.keys) {
    try {
      const outcome = await mirrorLead(key.name, env, prepare, purpose);
      if (Object.hasOwn(counts, outcome.result)) counts[outcome.result]++;
      else if (outcome.result === 'store-unavailable') counts.failed++;
      else counts.skipped++;
    } catch { counts.failed++; }
  }
  return { ...counts, scanned: page.keys.length, cursor: page.list_complete ? null : page.cursor };
}
