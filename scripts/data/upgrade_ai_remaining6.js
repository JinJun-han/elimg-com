/**
 * 나머지 6개 파일 — 다른 whitespace 패턴 처리
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const FILES = [
  'HanwhaOcean_Level2_Lesson11.html',
  'HanwhaOcean_Level2_Lesson14.html',
  'HanwhaOcean_Level2_Lesson15.html',
  'HanwhaOcean_Level2_Lesson17.html',
  'HanwhaOcean_Level2_Lesson18.html',
  'HanwhaOcean_Level2_Lesson20.html',
];

const ANCHOR_START = `function renderAI() {`;
const ANCHOR_END = `🤖 Powered by Pollinations AI · 무료 · Free forever</p>`;

// upgrade_ai_gstack.js 에서 복사한 NEW_AI_CODE
const NEW_AI_CODE = fs.readFileSync(path.join(dir, 'upgrade_ai_gstack.js'), 'utf8');
// NEW_AI_CODE 내에서 NEW_AI_CODE 상수 내용만 추출
const newCodeMatch = NEW_AI_CODE.match(/const NEW_AI_CODE = `([\s\S]+?)`;\n\n\/\/ ─── 파일/);
if (!newCodeMatch) {
  console.error('NEW_AI_CODE 추출 실패');
  process.exit(1);
}
const REPLACEMENT = newCodeMatch[1];

let updated = 0;

for (const fname of FILES) {
  const fpath = path.join(dir, fname);
  try {
    let content = fs.readFileSync(fpath, 'utf8');

    if (content.includes('에이전틱 G스택')) {
      console.log(`  [SKIP] ${fname} — 이미 업그레이드됨`);
      continue;
    }

    // renderAI() 시작 위치
    const startIdx = content.indexOf(ANCHOR_START);
    if (startIdx === -1) { console.log(`  [WARN] ${fname} — renderAI 없음`); continue; }

    // Powered by Pollinations... 위치
    const anchorEndIdx = content.indexOf(ANCHOR_END, startIdx);
    if (anchorEndIdx === -1) { console.log(`  [WARN] ${fname} — 끝 마커 없음`); continue; }

    // 끝 마커 이후 ` }` 패턴 찾기 (유연하게)
    // `</p>` 이후 `}` 가 나오는 위치
    const afterAnchor = content.slice(anchorEndIdx + ANCHOR_END.length);
    // </p>` 또는 </p>\n  ` 이후 \n} 찾기
    const closeMatch = afterAnchor.match(/^[`\n\s;]*\n\}/);
    if (!closeMatch) { console.log(`  [WARN] ${fname} — 함수 닫기 위치 찾기 실패`); continue; }

    const endPos = anchorEndIdx + ANCHOR_END.length + closeMatch[0].length;
    const before = content.slice(0, startIdx);
    const after = content.slice(endPos);

    const newContent = before + REPLACEMENT + after;
    if (newContent === content) { console.log(`  [SKIP] ${fname} — 변경 없음`); continue; }

    fs.writeFileSync(fpath, newContent, 'utf8');
    console.log(`  [OK]   ${fname}`);
    updated++;
  } catch(e) {
    console.log(`  [ERR]  ${fname}: ${e.message}`);
  }
}

console.log(`\n✅ 완료: ${updated}개`);
