/**
 * 남은 5개 파일 nav에 목차 링크 직접 추가
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const FIXES = [
  {
    file: 'HanwhaOcean_Level2_Lesson13.html',
    old:  `return \`<div class="nav"><div><div class="nav-title">초급 2-13과</div><div class="nav-sub">Beginner Level 2 Lesson 13</div></div><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>\``,
    new:  `return \`<div class="nav"><a href="HanwhaOcean_Level2_Index.html" style="text-decoration:none;color:inherit"><div><div class="nav-title">초급 2-13과</div><div class="nav-sub">← Level 2 목차 · Contents</div></div></a><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>\``,
  },
  {
    file: 'HanwhaOcean_Level2_Lesson14.html',
    old:  `return \`<div class="nav"><div><div class="nav-title">한화오션</div><div class="nav-sub">Hanwha Ocean</div></div><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>\``,
    new:  `return \`<div class="nav"><a href="HanwhaOcean_Level2_Index.html" style="text-decoration:none;color:inherit"><div><div class="nav-title">한화오션</div><div class="nav-sub">← Level 2 목차 · Contents</div></div></a><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>\``,
  },
  {
    file: 'HanwhaOcean_Level2_Lesson15.html',
    old:  `return \`<div class="nav"><div><div class="nav-title">한화오션 한국어교육</div><div class="nav-sub">Hanwha Ocean Korean Education</div></div><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>`,
    new:  `return \`<div class="nav"><a href="HanwhaOcean_Level2_Index.html" style="text-decoration:none;color:inherit"><div><div class="nav-title">한화오션 한국어교육</div><div class="nav-sub">← Level 2 목차 · Contents</div></div></a><button class="nav-btn" onclick="setState({menuOpen:!state.menuOpen})">☰</button></div>`,
  },
  {
    file: 'HanwhaOcean_Level2_Lesson17.html',
    old:  `<div class="nav-title">초급 2-17과 · Beginner Level 2 Lesson 17</div><div class="nav-sub">면접을 준비해요 · Preparing for an Interview</div>`,
    new:  `<div class="nav-title">초급 2-17과 · Beginner Level 2 Lesson 17</div><div class="nav-sub"><a href="HanwhaOcean_Level2_Index.html" style="color:#8899BB">← Level 2 목차 · Contents</a></div>`,
  },
  {
    file: 'HanwhaOcean_Level2_Lesson20.html',
    old:  `const nextLink = 'HanwhaOcean_Level1_Index.html';`,
    new:  `const nextLink = 'HanwhaOcean_Level2_Index.html';`,
  },
];

let done = 0;
for (const {file, old, new: replacement} of FIXES) {
  const fpath = path.join(dir, file);
  let content = fs.readFileSync(fpath, 'utf8');
  if (content.includes(old)) {
    content = content.replace(old, replacement);
    fs.writeFileSync(fpath, content, 'utf8');
    console.log(`  [OK] ${file}`);
    done++;
  } else {
    console.log(`  [WARN] ${file} — 패턴 못 찾음`);
  }
}
console.log(`\n✅ 완료: ${done}개`);
