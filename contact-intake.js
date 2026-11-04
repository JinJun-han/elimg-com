'use strict';
(() => {
  let sending = false;
  window.submitForm = async function () {
    if (sending) return;
    const field = id => document.getElementById(id);
    const status = field('cfStatus'), button = document.querySelector('.cf-submit');
    const name = field('cf-name').value.trim(), contact = field('cf-contact').value.trim(), kind = field('cf-type').value;
    field('cfSent').style.display = 'none';
    if (!name || !contact || !kind) { status.textContent = '이름·연락처·문의 유형을 입력해 주세요.'; return; }
    if (!field('cf-consent').checked) { status.textContent = '상담 접수를 위한 개인정보 수집·이용 동의를 확인해 주세요.'; return; }
    const payload = { name: name.slice(0, 50), contact: contact.slice(0, 100), kind, message: field('cf-msg').value.trim().slice(0, 1000), from: location.pathname, extra: { country: field('cf-country').value, consentPersonalInfo: true, consentVersion: 'contact-v1' } };
    sending = true; button.disabled = true; status.textContent = '신청을 저장하고 있습니다…';
    try {
      const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const receipt = await response.json().catch(() => ({}));
      if (!response.ok || receipt.ok !== true || !receipt.key) throw new Error('not-confirmed');
      status.textContent = '';
      field('cfSent').textContent = '신청이 저장되었습니다. 담당자가 내용을 확인한 뒤 연락드리겠습니다.';
      field('cfSent').style.display = 'block';
      button.textContent = '접수 완료'; button.disabled = true;
    } catch {
      status.textContent = '저장 완료를 확인하지 못했습니다. 중복 접수 가능성이 있으므로 잠시 후 확인하거나 전화·카카오 채널로 문의해 주세요.';
      button.disabled = false;
    } finally { sending = false; }
  };
})();
