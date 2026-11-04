import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../contact-intake.js', import.meta.url), 'utf8');
function setup(fetch) {
  const fields = Object.fromEntries(['cf-name','cf-contact','cf-type','cf-msg','cf-country','cf-consent','cfStatus','cfSent'].map(id => [id, { value: '', textContent: '', checked: false, style: {} }]));
  fields['cf-name'].value = '검증용'; fields['cf-contact'].value = 'example@example.test'; fields['cf-type'].value = 'AI 교육'; fields['cf-consent'].checked = true;
  const button = { disabled: false, textContent: '상담 신청' }, window = {};
  const context = vm.createContext({ window, document: { getElementById: id => fields[id], querySelector: () => button }, location: { pathname: '/' }, fetch });
  vm.runInContext(source, context); return { fields, button, submit: window.submitForm };
}
test('no successful receipt is displayed unless the backend confirms durable storage', async () => {
  const failed = setup(async () => ({ ok: false, async json() { return { ok: false }; } })); await failed.submit();
  assert.equal(failed.fields.cfSent.style.display, 'none'); assert.match(failed.fields.cfStatus.textContent, /저장 완료를 확인하지 못했습니다/); assert.equal(failed.button.disabled, false);
  const malformed = setup(async () => ({ ok: true, async json() { return {}; } })); await malformed.submit(); assert.equal(malformed.fields.cfSent.style.display, 'none');
  let body;
  const saved = setup(async (url, init) => { assert.equal(url, '/api/lead'); body = JSON.parse(init.body); return { ok: true, async json() { return { ok: true, key: 'lead_123_abc' }; } }; });
  await saved.submit(); assert.equal(saved.fields.cfSent.style.display, 'block'); assert.equal(saved.button.disabled, true); assert.equal(body.extra.consentPersonalInfo, true);
});
test('missing consent blocks transmission and repeated clicks do not send concurrent copies', async () => {
  let calls = 0, release;
  const state = setup(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  state.fields['cf-consent'].checked = false; await state.submit(); assert.equal(calls, 0);
  state.fields['cf-consent'].checked = true;
  const pending = state.submit(); await state.submit(); assert.equal(calls, 1);
  release({ ok: true, async json() { return { ok: true, key: 'lead_123_abc' }; } }); await pending;
});
