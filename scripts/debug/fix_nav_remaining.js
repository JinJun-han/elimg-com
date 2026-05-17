/**
 * Level2 nav 패턴 수정 — 이모지가 다른 파일들 처리
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// 이미 목차 링크가 없는 Level2 파일들 (WARN이 나왔던 파일들)
const FILES = [
  'HanwhaOcean_Level2_Lesson12.html',
  'HanwhaOcean_Level2_Lesson13.html',
  'HanwhaOcean_Level2_Lesson14.html',
  'HanwhaOcean_Level2_Lesson15.html',
  'HanwhaOcean_Level2_Lesson16.html',
  'HanwhaOcean_Level2_Lesson17.html',
  'HanwhaOcean_Level2_Lesson20.html',
];

// 정규식: 이모지가 뭐든 매칭
const NAV_REGEX = /<div style="display:flex;align-items:center;gap:8px">\s*<span style="font-size:18px">[^<]+<\/span>\s*<div><div class="nav-title">한화오션 한국어교육<\/div><div class="nav-sub">Hanwha Ocean Korean Education<\/div><\/div>\s*<\/div>/;

const NAV_NEW = `<a href="HanwhaOcean_Level2_Index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit" title="목차로 돌아가기">
      <span style="font-size:18px">📋</span>
      <div><div class="nav-title">한화오션 한국어교육</div><div class="nav-sub">← Level 2 목차 · Contents</div></div>
    </a>`;

let done = 0;
for (const fname of FILES) {
  const fpath = path.join(dir, fname);
  let content = fs.readFileSync(fpath, 'utf8');
  if (NAV_REGEX.test(content)) {
    content = content.replace(NAV_REGEX, NAV_NEW);
    fs.writeFileSync(fpath, content, 'utf8');
    console.log(`  [OK] ${fname}`);
    done++;
  } else {
    console.log(`  [WARN] ${fname} — 여전히 패턴 못 찾음`);
  }
}
console.log(`\n✅ 완료: ${done}개`);
