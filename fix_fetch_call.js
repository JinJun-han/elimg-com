/**
 * fix_fetch_call.js
 * "  f\n  .then(r=>r.json())" 패턴을 완전한 fetch 호출로 교체
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level0_Lesson\d+\.html$/i.test(f)
);

// 잘린 fetch + then 패턴
const BROKEN_PATTERN = /  f\s*\n\s*\.then\(r=>r\.json\(\)\)/;

// 완전한 fetch 호출로 교체
const FULL_FETCH = `  fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({messages:[{role:'system',content:systemPrompt},{role:'user',content:msg}]})
  })
  .then(r=>r.json())`;

let updated = 0;
files.forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (BROKEN_PATTERN.test(content)) {
    content = content.replace(BROKEN_PATTERN, FULL_FETCH);
    fs.writeFileSync(fp, content, 'utf8');
    updated++;
    process.stdout.write('✅ ' + file + '\n');
  } else {
    process.stdout.write('⏭  ' + file + '\n');
  }
});
process.stdout.write('\nDone: ' + updated + '\n');
