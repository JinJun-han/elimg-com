/**
 * 모든 HTML 파일의 AI fetch 코드를 /api/chat 엔드포인트로 업데이트
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

let updated = 0, skipped = 0;

// ── Pattern 1: HanwhaOcean 파일들 (POST, data.choices[0].message.content 방식) ──
const HW_OLD = `      var sysP = 'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.';
      var url = 'https://text.pollinations.ai/openai';
      var res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

const HW_NEW = `      var sysP = 'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.';
      var url = '/api/chat';
      var res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

// ── Pattern 2: KIIP_Level0_Lesson1.html ───────────────────────────────
const K0_OLD = `      const sysP='You are a Korean language tutor for complete beginners learning Hangul (Korean alphabet). Students are at KIIP Level 0 — they cannot read Korean yet. Always: 1) Keep answers SHORT and SIMPLE 2) Include romanization (pronunciation guide) 3) Give English translations 4) Use encouragement. Focus on consonants, vowels, and syllable formation.';
      const url='https://text.pollinations.ai/openai';
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      const data=await res.json();
      const reply=data.choices[0].message.content;`;

const K0_NEW = `      const sysP='You are a Korean language tutor for complete beginners learning Hangul (Korean alphabet). Students are at KIIP Level 0 — they cannot read Korean yet. Always: 1) Keep answers SHORT and SIMPLE 2) Include romanization (pronunciation guide) 3) Give English translations 4) Use encouragement. Focus on consonants, vowels, and syllable formation.';
      const url='/api/chat';
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      const data=await res.json();
      const reply=data.choices[0].message.content;`;

// ── Pattern 3: KIIP_Level3_Lesson1.html ───────────────────────────────
const K3_OLD = `      var url = 'https://text.pollinations.ai/openai';
      var res  = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:sys},{role:'user',content:text}]})});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

const K3_NEW = `      var url = '/api/chat';
      var res  = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sys},{role:'user',content:text}]})});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var reply = data.choices[0].message.content;`;

function processFile(fpath, oldStr, newStr) {
  try {
    let content = fs.readFileSync(fpath, 'utf8');
    if (!content.includes(oldStr)) return false;
    const newContent = content.replace(oldStr, newStr);
    if (newContent === content) return false;
    fs.writeFileSync(fpath, newContent, 'utf8');
    return true;
  } catch(e) {
    console.log(`  [ERR] ${path.basename(fpath)}: ${e.message}`);
    return null;
  }
}

// HanwhaOcean 40개
const hwFiles = fs.readdirSync(dir).filter(f => f.match(/^HanwhaOcean.*\.html$/));
console.log(`\nHanwhaOcean ${hwFiles.length}개 파일 처리 중...`);
for (const f of hwFiles) {
  const r = processFile(path.join(dir, f), HW_OLD, HW_NEW);
  if (r) { console.log(`  [OK]   ${f}`); updated++; }
  else if (r === false) { skipped++; }
}

// KIIP Level0
const r0 = processFile(path.join(dir, 'KIIP_Level0_Lesson1.html'), K0_OLD, K0_NEW);
if (r0) { console.log(`  [OK]   KIIP_Level0_Lesson1.html`); updated++; }

// KIIP Level3
const r3 = processFile(path.join(dir, 'KIIP_Level3_Lesson1.html'), K3_OLD, K3_NEW);
if (r3) { console.log(`  [OK]   KIIP_Level3_Lesson1.html`); updated++; }

console.log(`\n✅ 완료: 업데이트 ${updated}개 | 스킵 ${skipped}개`);
