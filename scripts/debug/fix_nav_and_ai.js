/**
 * 두 가지 수정:
 * 1. 네비게이션: 상단 nav에 목차 링크 추가 (Level1 → Level1_Index, Level2 → Level2_Index)
 * 2. AI 채팅 섹션 제거: GROQ_API_KEY 미설정으로 작동 안 함
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const LEVEL1_FILES = Array.from({length:20},(_,i)=>`HanwhaOcean_Level1_Lesson${i+1}.html`);
const LEVEL2_FILES = Array.from({length:20},(_,i)=>`HanwhaOcean_Level2_Lesson${i+1}.html`);

// ── 1. AI 채팅 섹션 (API 필요) 제거 ────────────────────────────────────────────
// 제거 범위: <!-- 앱 내 AI 채팅 --> 부터 <!-- 외부 AI 가이드 --> 직전까지
const AI_CHAT_START = `\n  <!-- 앱 내 AI 채팅 -->`;
const AI_CHAT_END   = `\n\n  <!-- 외부 AI 가이드 -->`;

function removeAiChat(content) {
  const s = content.indexOf(AI_CHAT_START);
  const e = content.indexOf(AI_CHAT_END);
  if (s === -1 || e === -1 || s >= e) return null;
  return content.slice(0, s) + content.slice(e);
}

// ── 2. 네비게이션에 목차 링크 추가 ──────────────────────────────────────────────
// 현재 nav 왼쪽 div를 앵커로 교체
const NAV_OLD = `<div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:18px">⚓</span>
      <div><div class="nav-title">한화오션 한국어교육</div><div class="nav-sub">Hanwha Ocean Korean Education</div></div>
    </div>`;

function makeNavNew(indexFile, level) {
  return `<a href="${indexFile}" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit" title="목차로 돌아가기">
      <span style="font-size:18px">📋</span>
      <div><div class="nav-title">한화오션 한국어교육</div><div class="nav-sub">← ${level} 목차 · Contents</div></div>
    </a>`;
}

// ── 실행 ────────────────────────────────────────────────────────────────────────
function process(fname, indexFile, level) {
  const fpath = path.join(dir, fname);
  if (!fs.existsSync(fpath)) { console.log(`  [SKIP] ${fname} — 파일 없음`); return; }
  let content = fs.readFileSync(fpath, 'utf8');
  let changes = 0;

  // AI 채팅 제거
  const removed = removeAiChat(content);
  if (removed !== null) { content = removed; changes++; }
  else { console.log(`  [WARN] ${fname} — AI 채팅 섹션 못 찾음`); }

  // 네비 목차 링크
  if (content.includes(NAV_OLD)) {
    content = content.replace(NAV_OLD, makeNavNew(indexFile, level));
    changes++;
  } else {
    console.log(`  [WARN] ${fname} — nav 패턴 못 찾음`);
  }

  fs.writeFileSync(fpath, content, 'utf8');
  console.log(`  [OK] ${fname} — ${changes}개 수정`);
}

let done = 0;
for (const f of LEVEL1_FILES) { try { process(f,'HanwhaOcean_Level1_Index.html','Level 1'); done++; } catch(e){ console.log(`  [ERR] ${f}: ${e.message}`); } }
for (const f of LEVEL2_FILES) { try { process(f,'HanwhaOcean_Level2_Index.html','Level 2'); done++; } catch(e){ console.log(`  [ERR] ${f}: ${e.message}`); } }
console.log(`\n✅ 완료: ${done}개 파일`);
