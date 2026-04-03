const fs = require('fs');
const path = require('path');
const dir = __dirname;

let updated = 0, skipped = 0, errors = 0;

// ── Pattern 1: HanwhaOcean 40개 파일 ──────────────────────────────────
const HW_OLD = `    var sys = encodeURIComponent('You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.');
    try {
      var url = 'https://text.pollinations.ai/' + encodeURIComponent(text) + '?model=openai&system=' + sys;
      var res = await fetch(url);
      var reply = await res.text();`;

const HW_NEW = `    try {
      var sysP = 'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.';
      var url = 'https://text.pollinations.ai/openai';
      var res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

// ── Pattern 2: KIIP_Level0_Lesson1.html ───────────────────────────────
const K0_OLD = `    const sys=encodeURIComponent('You are a Korean language tutor for complete beginners learning Hangul (Korean alphabet). Students are at KIIP Level 0 — they cannot read Korean yet. Always: 1) Keep answers SHORT and SIMPLE 2) Include romanization (pronunciation guide) 3) Give English translations 4) Use encouragement. Focus on consonants, vowels, and syllable formation.');
    try{
      const url='https://text.pollinations.ai/'+encodeURIComponent(text)+'?model=openai&system='+sys;
      const res=await fetch(url);
      const reply=await res.text();`;

const K0_NEW = `    try{
      const sysP='You are a Korean language tutor for complete beginners learning Hangul (Korean alphabet). Students are at KIIP Level 0 — they cannot read Korean yet. Always: 1) Keep answers SHORT and SIMPLE 2) Include romanization (pronunciation guide) 3) Give English translations 4) Use encouragement. Focus on consonants, vowels, and syllable formation.';
      const url='https://text.pollinations.ai/openai';
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      const data=await res.json();
      const reply=data.choices[0].message.content;`;

// ── Pattern 3: KIIP_Level3_Lesson1.html (URL만 교체) ──────────────────
const K3_OLD = `      var url = 'https://text.pollinations.ai/' + encodeURIComponent(text)
              + '?model=openai&system=' + encodeURIComponent(sys)
              + '&seed=42';
      var res  = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var reply = await res.text();`;

const K3_NEW = `      var url = 'https://text.pollinations.ai/openai';
      var res  = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sys},{role:'user',content:text}]})});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

// ── 파일 처리 함수 ────────────────────────────────────────────────────
function processFile(fpath, oldStr, newStr) {
  try {
    let content = fs.readFileSync(fpath, 'utf8');
    if (!content.includes(oldStr)) return false; // 패턴 없음
    const updated = content.replace(oldStr, newStr);
    if (updated === content) return false;
    fs.writeFileSync(fpath, updated, 'utf8');
    return true;
  } catch(e) {
    console.log(`  [ERR] ${path.basename(fpath)}: ${e.message}`);
    errors++;
    return null;
  }
}

// ── HanwhaOcean 40개 ──────────────────────────────────────────────────
const files = fs.readdirSync(dir).filter(f => f.match(/^HanwhaOcean.*\.html$/));
console.log(`\nHanwhaOcean 파일: ${files.length}개`);
for (const fname of files) {
  const fpath = path.join(dir, fname);
  const result = processFile(fpath, HW_OLD, HW_NEW);
  if (result === true) { console.log(`  [OK]  ${fname}`); updated++; }
  else if (result === false) { console.log(`  [SKIP] ${fname} — 패턴 없음`); skipped++; }
}

// ── KIIP_Level0_Lesson1.html ──────────────────────────────────────────
console.log(`\nKIIP Level0 Lesson1`);
const k0 = processFile(path.join(dir, 'KIIP_Level0_Lesson1.html'), K0_OLD, K0_NEW);
if (k0 === true) { console.log(`  [OK]  KIIP_Level0_Lesson1.html`); updated++; }
else if (k0 === false) { console.log(`  [SKIP] KIIP_Level0_Lesson1.html`); skipped++; }

// ── KIIP_Level3_Lesson1.html ──────────────────────────────────────────
console.log(`\nKIIP Level3 Lesson1`);
const k3 = processFile(path.join(dir, 'KIIP_Level3_Lesson1.html'), K3_OLD, K3_NEW);
if (k3 === true) { console.log(`  [OK]  KIIP_Level3_Lesson1.html`); updated++; }
else if (k3 === false) { console.log(`  [SKIP] KIIP_Level3_Lesson1.html`); skipped++; }

console.log(`\n✅ 완료: 업데이트 ${updated}개 | 스킵 ${skipped}개 | 오류 ${errors}개`);
