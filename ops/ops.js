'use strict';
const $ = id => document.getElementById(id);
const purposes = { business: ['사업·교육', 'BUSINESS & EDUCATION'], visa: ['비자브릿지', 'VISA BRIDGE'], care: ['상담·돌봄', 'CARE & SUPPORT'], mission: ['선교·네트워크', 'MISSION & NETWORK'] };
const statuses = { new: '신규', review: '검토 대기', working: '진행 중', done: '완료' };
const demo = new URLSearchParams(location.search).get('demo') === '1';
let purpose = 'business', items = [], selected = null, cursor = null, ready = false, requestGeneration = 0;
const syncCursors = {};
const demoRecords = { business: [{ id: 'demo-business-1', title: '소규모 기업 AI 업무 교육 문의', message: '직원들이 안내문과 회의록을 작성하는 시간을 줄이고 싶습니다. 주 1회 실습 교육을 문의합니다.', contact: '검증용 예시 · 실제 연락처 없음', status: 'review', priority: 'normal' }, { id: 'demo-business-2', title: '근로자 한국어 수업 과정 상담', message: '근무 시간에 맞는 한국어 수업과 학습 자료를 찾고 있습니다.', contact: '', status: 'working', priority: 'normal' }], visa: [], care: [], mission: [] };
for (const [p, rows] of Object.entries(demoRecords)) rows.forEach(r => Object.assign(r, { purpose: p, createdAt: new Date().toISOString(), source: '검증용 예시', automation: { engine: 'rules-v1', summary: r.message, nextSteps: ['교육 목적과 참여 인원 확인', '가능한 일정 확인', '검토 후 회신'], draft: '문의해 주셔서 감사합니다. 요청 사항과 가능한 일정을 확인한 뒤 안내드리겠습니다.', externalAI: false } }));
function notice(message) { $('notice').textContent = message; }
function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
async function api(path, options = {}) {
  const response = await fetch('/api/ops/' + path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) { ready = false; items = []; selected = null; $('workspace').hidden = true; $('login').hidden = false; $('logout').hidden = true; if (!demo) location.replace('/ops/login'); }
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.');
  return data;
}
function enter() { $('login').hidden = true; $('workspace').hidden = false; $('logout').hidden = demo; $('mode').textContent = demo ? '검증용 예시' : '관리자 연결'; ready = true; }
function render() {
  $('purpose-caption').textContent = purposes[purpose][1]; $('purpose-title').textContent = purposes[purpose][0] + ' 요청';
  $('count-total').textContent = items.length;
  $('count-review').textContent = items.filter(r => ['new', 'review'].includes(r.status)).length;
  $('count-working').textContent = items.filter(r => r.status === 'working').length;
  $('count-done').textContent = items.filter(r => r.status === 'done').length;
  const query = $('search').value.toLowerCase(), filter = $('filter').value;
  const visible = items.filter(r => (filter === 'all' || r.status === filter) && [r.title, r.message, r.contact].join(' ').toLowerCase().includes(query));
  const list = $('requests'); list.replaceChildren(); $('result-count').textContent = visible.length + '건 표시';
  if (!visible.length) list.append(el('p', items.length ? '검색 조건에 맞는 요청이 없습니다.' : '아직 불러온 요청이 없습니다. 새 접수를 등록하거나 저장소 연결을 확인해 주세요.', 'empty'));
  for (const item of visible) {
    const card = el('button', undefined, 'request' + (selected === item.id ? ' selected' : '')); card.type = 'button';
    card.setAttribute('aria-pressed', String(selected === item.id));
    const meta = el('div', undefined, 'meta'); meta.append(el('span', statuses[item.status] || item.status, 'pill ' + item.status), el('span', item.priority === 'high' ? '우선 확인' : new Date(item.createdAt).toLocaleDateString('ko-KR'), item.priority === 'high' ? 'urgent' : ''));
    card.append(meta, el('h3', item.title), el('p', item.message.slice(0, 85)));
    card.addEventListener('click', () => { selected = item.id; render(); }); list.append(card);
  }
  $('more').hidden = !cursor; renderDetail();
}
function renderDetail() {
  const panel = $('detail'), item = items.find(r => r.id === selected); panel.replaceChildren();
  if (!item) { panel.append(el('p', '목록에서 요청을 선택해 주세요.', 'empty')); return; }
  panel.append(el('span', purposes[purpose][0], 'eyebrow'), el('h2', item.title), el('p', item.source + ' · ' + new Date(item.createdAt).toLocaleString('ko-KR'), 'detail-meta'));
  if (item.contact) panel.append(el('p', '연락 방법: ' + item.contact));
  if (item.applicantName) panel.append(el('p', '신청자: ' + item.applicantName));
  panel.append(el('h3', '접수 내용'), el('p', item.message), el('h3', '자동으로 정리한 다음 행동 · 규칙 기반'));
  const steps = el('ul'); (item.automation?.nextSteps || []).forEach(text => steps.append(el('li', text))); panel.append(steps);
  panel.append(el('h3', '회신 초안 · 대표 검토 필요'), el('div', item.automation?.draft || '초안이 없습니다.', 'draft'));
  const copy = el('button', '초안 복사', 'secondary'); copy.type = 'button'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(item.automation?.draft || ''); notice('초안을 복사했습니다. 외부로 발송하지 않았습니다.'); } catch { notice('복사 권한을 확인해 주세요. 초안 문구를 직접 선택해 복사할 수 있습니다.'); } }); panel.append(copy);
  const label = el('label', '처리 상태'); label.htmlFor = 'item-status'; label.className = 'footnote'; const select = el('select'); select.id = 'item-status';
  Object.entries(statuses).forEach(([value, text]) => { const option = el('option', text); option.value = value; select.append(option); }); select.value = item.status;
  select.addEventListener('change', async () => { const value = select.value; select.disabled = true; try { if (demo) item.status = value; else { const data = await api('requests?purpose=' + purpose, { method: 'PATCH', body: JSON.stringify({ id: item.id, status: value }) }); Object.assign(item, data.item); } render(); notice(demo ? '예시 상태를 변경했습니다. 서버에는 저장하지 않았습니다.' : '처리 상태를 저장했습니다.'); } catch (e) { select.value = item.status; notice(e.message); } finally { select.disabled = false; } }); panel.append(label, select);
}
async function load(append = false) {
  const generation = ++requestGeneration; $('refresh').disabled = true;
  if (!append) { items = []; selected = null; cursor = null; render(); }
  try {
    if (demo) { items = demoRecords[purpose]; cursor = null; }
    else { const data = await api('requests?purpose=' + purpose + (append && cursor ? '&cursor=' + encodeURIComponent(cursor) : '')); if (generation !== requestGeneration) return; const combined = append ? items.concat(data.items) : data.items; items = [...new Map(combined.map(r => [r.id, r])).values()]; cursor = data.cursor; }
    selected ||= items[0]?.id || null; render();
    notice(demo ? '검증용 예시입니다. 실제 개인정보·기존 신청 자료를 불러오지 않으며 변경 사항은 새로고침하면 사라집니다.' : '선택한 업무의 전용 저장소에서 불러왔습니다. 외부 AI 호출과 자동 발송은 꺼져 있습니다.');
  } catch (e) { if (generation === requestGeneration) { items = []; selected = null; cursor = null; render(); notice(e.message); } }
  finally { if (generation === requestGeneration) $('refresh').disabled = false; }
}
$('login-form').addEventListener('submit', async event => { event.preventDefault(); const key = $('admin-key').value; $('admin-key').value = ''; const button = event.currentTarget.querySelector('button'); button.disabled = true; try { await api('session', { method: 'POST', body: JSON.stringify({ key }) }); enter(); await load(); } catch (e) { notice(e.message); } finally { button.disabled = false; } });
$('logout').addEventListener('click', async () => { try { await api('session', { method: 'DELETE' }); ready = false; items = []; selected = null; render(); $('workspace').hidden = true; $('login').hidden = false; $('logout').hidden = true; $('mode').textContent = '로그아웃'; notice('로그아웃했습니다.'); location.replace('/ops/login'); } catch (e) { notice(e.message); } });
document.querySelectorAll('[data-purpose]').forEach(button => button.addEventListener('click', () => { purpose = button.dataset.purpose; document.querySelectorAll('[data-purpose]').forEach(b => b.classList.toggle('active', b === button)); $('search').value = ''; $('filter').value = 'all'; if (ready) load(); }));
$('search').addEventListener('input', render); $('filter').addEventListener('change', render); $('refresh').addEventListener('click', () => load()); $('more').addEventListener('click', () => load(true));
$('sync-leads').addEventListener('click', async () => {
  if (demo) { notice('검증용 예시에서는 실제 신청 자료를 불러오지 않습니다.'); return; }
  const activePurpose = purpose, button = $('sync-leads'), previousCursor = syncCursors[activePurpose]; button.disabled = true;
  try {
    const outcome = await api('sync?purpose=' + activePurpose + (previousCursor ? '&cursor=' + encodeURIComponent(previousCursor) : ''), { method: 'POST', body: '{}' });
    syncCursors[activePurpose] = outcome.failed ? previousCursor : outcome.cursor;
    if (purpose === activePurpose) await load();
    notice(purposes[activePurpose][0] + ': ' + outcome.scanned + '건 확인 · 새 연결 ' + outcome.imported + '건 · 기존 연결 ' + outcome.existing + '건. 미분류 ' + outcome.review + '건은 원본에 보존했습니다.' + (outcome.failed ? ' 실패 ' + outcome.failed + '건은 같은 페이지에서 다시 연동해 주세요.' : outcome.cursor ? ' 다음 신청 연동을 눌러 나머지를 계속 확인해 주세요.' : ' 현재 원본 목록의 끝까지 확인했습니다.') + ' 저장 반영에는 잠시 시간이 걸릴 수 있습니다.');
  } catch (e) { notice(e.message); }
  finally { button.disabled = false; button.textContent = syncCursors[purpose] ? '다음 신청 연동' : '상담 신청 연동'; }
});
$('new-request').addEventListener('click', () => { $('create-error').textContent = ''; $('create-purpose').textContent = purposes[purpose][0] + ' 전용 공간에 등록합니다.'; $('create-dialog').showModal(); });
$('close-dialog').addEventListener('click', () => $('create-dialog').close());
$('create-form').addEventListener('submit', async event => {
  event.preventDefault(); const input = Object.fromEntries(new FormData(event.currentTarget)); const button = $('save-request'); button.disabled = true;
  try {
    let item;
    if (demo) { item = { ...input, id: 'demo-' + Date.now() + '-' + Math.random().toString(36).slice(2), purpose, status: 'new', createdAt: new Date().toISOString(), source: '검증용 직접 등록', priority: /긴급|응급|위험/.test(input.title + input.message) ? 'high' : 'normal', automation: { engine: 'rules-v1', nextSteps: ['요청 내용과 일정 확인', '담당 전문가 검토 후 안내'], draft: '문의해 주셔서 감사합니다. 요청 사항을 확인한 뒤 안내드리겠습니다.', externalAI: false } }; demoRecords[purpose].unshift(item); }
    else item = (await api('requests?purpose=' + purpose, { method: 'POST', body: JSON.stringify(input) })).item;
    if (!demo) items.unshift(item); selected = item.id; render(); $('create-dialog').close(); event.target.reset(); notice(demo ? '예시를 등록했습니다. 서버 저장·AI 호출·발송은 하지 않았습니다.' : '접수와 규칙 기반 초안 생성을 완료했습니다. 회신 전 내용을 검토해 주세요.');
  } catch (e) { $('create-error').textContent = e.message; } finally { button.disabled = false; }
});
$('export').addEventListener('click', () => {
  const data = JSON.stringify({ schema: 'elimg-ops-v1', purpose, exportedAt: new Date().toISOString(), scope: '현재 불러온 목록만 포함', hasMore: Boolean(cursor), demo, items }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' })); const a = el('a'); a.href = url; a.download = 'elimg-' + purpose + '-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notice('현재 불러온 목록을 내보냈습니다. 개인정보가 포함될 수 있으므로 비공개로 보관해 주세요.');
});
if (demo) { enter(); load(); } else api('config').then(() => { enter(); return load(); }).catch(e => notice(e.message));

window.addEventListener('pageshow', event => { if (!demo && event.persisted) location.reload(); });
