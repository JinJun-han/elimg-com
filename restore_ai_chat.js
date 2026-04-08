/**
 * 앱 내 AI 채팅 복원 + 외부 AI를 선택사항(optional)으로 변경
 * - 로그인 불필요 채팅을 다시 추가
 * - Gemini/Claude는 "선택사항 · Optional" 섹션으로 변경
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const ALL_FILES = [
  ...Array.from({length:20},(_,i)=>`HanwhaOcean_Level1_Lesson${i+1}.html`),
  ...Array.from({length:20},(_,i)=>`HanwhaOcean_Level2_Lesson${i+1}.html`),
];

// 배너 끝 ~ 외부 AI 시작 사이에 삽입할 인앱 AI 채팅 UI
const CHAT_UI = `
  <!-- 앱 내 AI 채팅 — 로그인 불필요 -->
  <div class="card" style="margin-bottom:10px;border:2px solid #2E75B6">
    <div class="section-label" style="background:#1E3A5F">⚡ AI 채팅 · 로그인 불필요 · No Login Needed</div>
    <div style="font-size:12px;color:#555;margin:6px 0 10px;line-height:1.6">
      계정 없이 바로 AI에게 질문하세요<br>
      <span style="font-size:11px;color:#2E75B6">Ask AI directly — no login needed · Free</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      \${AI_QUICK_BTNS.map(function(b,i){return \`
        <button onclick="AICHAT.quickSend(\${i})"
          style="background:#f0f7ff;border:1px solid #2E75B6;color:#1E3A5F;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
          \${b.emoji} \${b.label}
        </button>\`;}).join('')}
    </div>
    <div class="ai-msgbox" style="background:#fff;border-radius:12px;border:1px solid #e8edf2;min-height:120px;max-height:300px;overflow-y:auto;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px">
      \${AICHAT.msgs.length === 0
        ? \`<div style="text-align:center;color:#aaa;padding:24px 16px;font-size:12px">
            💡 버튼을 누르거나 아래에 입력하세요<br>
            <span style="font-size:11px">Tap a button above or type below</span>
          </div>\`
        : AICHAT.msgs.map(function(m){ return \`
          <div style="align-self:\${m.role==='user'?'flex-end':'flex-start'};max-width:90%">
            <div style="background:\${m.role==='user'?'#2E75B6':'#f0f7ff'};color:\${m.role==='user'?'#fff':'#1E3A5F'};border-radius:\${m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'};padding:10px 13px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word">\${m.text}</div>
            <div style="font-size:10px;color:#aaa;margin-top:3px;text-align:\${m.role==='user'?'right':'left'}">\${m.time}</div>
          </div>\`;}).join('')}
      \${AICHAT.loading ? \`<div style="align-self:flex-start;background:#f0f7ff;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:13px;color:#2E75B6">⏳ AI가 답하는 중... / Generating...</div>\` : ''}
    </div>
    <div style="display:flex;gap:8px">
      <input id="ai-input" type="text" placeholder="한국어 질문 / Ask a question..."
        style="flex:1;padding:12px 14px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;font-family:inherit;outline:none"
        onfocus="this.style.borderColor='#2E75B6'" onblur="this.style.borderColor='#e5e7eb'"
        onkeydown="if(event.key==='Enter'){AICHAT.input=this.value;AICHAT.send();}">
      <button onclick="AICHAT.input=document.getElementById('ai-input').value;AICHAT.send()"
        style="background:#2E75B6;color:#fff;border-radius:10px;padding:0 18px;font-size:20px;min-width:52px;font-family:inherit;cursor:pointer;border:none">➤</button>
    </div>
    <div style="font-size:10px;color:#aaa;margin-top:6px;text-align:center">Enter로 전송 · 🆓 완전 무료 · No account needed</div>
  </div>

`;

// 외부 AI 섹션 제목을 "선택사항"으로 변경
const EXT_AI_OLD = `  <!-- 외부 AI 가이드 -->
  <div class="card" style="margin-bottom:10px">
    <div class="section-label">🌐 외부 AI 서비스 · External AI</div>
    <div style="font-size:11px;color:#888;margin:6px 0 8px">더 강력한 AI로 깊이 있게 학습하세요</div>`;

const EXT_AI_NEW = `  <!-- 외부 AI 가이드 — 선택사항 -->
  <div class="card" style="margin-bottom:10px">
    <div class="section-label" style="background:#6b7280">🌐 외부 AI · 선택사항 · Optional</div>
    <div style="font-size:11px;color:#888;margin:6px 0 8px">더 강력한 AI로 깊이 있게 학습 (로그인 필요 / Login required)</div>`;

// 삽입 위치: 배너 끝 빈 줄 이후, <!-- 외부 AI 가이드 --> 바로 앞
const INSERT_BEFORE = `\n\n  <!-- 외부 AI 가이드 -->`;
const INSERT_BEFORE_ALT = `\n\n  <!-- 외부 AI 가이드 — 선택사항 -->`;

let done = 0;
for (const fname of ALL_FILES) {
  const fpath = path.join(dir, fname);
  if (!fs.existsSync(fpath)) { console.log(`  [SKIP] ${fname}`); continue; }
  let content = fs.readFileSync(fpath, 'utf8');
  let changes = 0;

  // 이미 복원되어 있으면 스킵
  if (content.includes('AI 채팅 · 로그인 불필요')) {
    console.log(`  [SKIP] ${fname} — 이미 복원됨`);
    done++;
    continue;
  }

  // 1) 채팅 UI 삽입 — <!-- 외부 AI 가이드 --> 바로 앞
  const insertIdx = content.indexOf('\n\n  <!-- 외부 AI 가이드 -->');
  if (insertIdx !== -1) {
    content = content.slice(0, insertIdx) + CHAT_UI.trimEnd() + content.slice(insertIdx);
    changes++;
  } else {
    console.log(`  [WARN] ${fname} — 삽입 위치 못 찾음`);
  }

  // 2) 외부 AI 섹션 제목 "선택사항"으로 변경
  if (content.includes(EXT_AI_OLD)) {
    content = content.replace(EXT_AI_OLD, EXT_AI_NEW);
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(fpath, content, 'utf8');
    console.log(`  [OK] ${fname} — ${changes}개 변경`);
    done++;
  } else {
    console.log(`  [WARN] ${fname} — 변경 없음`);
  }
}
console.log(`\n✅ 완료: ${done}개 파일`);
