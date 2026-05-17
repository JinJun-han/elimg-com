const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/kodhj/elimg-com';
const files = fs.readdirSync(dir).filter(f => f.match(/^KIIP_Level\d+_Lesson\d+\.html$/));

let totalFixed = 0;
let fileFixed = 0;

files.forEach(fname => {
  const fpath = path.join(dir, fname);
  let content = fs.readFileSync(fpath, 'utf8');
  let original = content;
  let changes = 0;

  // ── Pattern 1: Level0 GET (template literal with encodeURIComponent) ──────
  // FROM: const res=await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai&system=${encodeURIComponent(sysP)}&json=false`);
  //       const reply=await res.text();
  // TO:   const res=await fetch('/api/chat',{method:'POST',...});
  //       const data=await res.json(); const reply=data.choices[0].message.content;
  content = content.replace(
    /const res\s*=\s*await fetch\(`https:\/\/text\.pollinations\.ai\/\$\{encodeURIComponent\(([^)]+)\)\}\?model=openai&system=\$\{encodeURIComponent\(([^)]+)\)\}&json=false`\);\s*\n(\s*)const reply\s*=\s*await res\.text\(\);/g,
    (match, textVar, sysVar, indent) => {
      changes++;
      return `const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:${sysVar}},{role:'user',content:${textVar}}]})});\n${indent}const data=await res.json();\n${indent}const reply=data.choices[0].message.content;`;
    }
  );

  // ── Pattern 2a: POST with var, sysP, text ────────────────────────────────
  // var res = await fetch('https://text.pollinations.ai/', {method:'POST',...,content:sysP},{role:'user',content:text}],model:'openai',seed:42})});
  // var reply = await res.text();
  content = content.replace(
    /var res\s*=\s*await fetch\('https:\/\/text\.pollinations\.ai\/',\s*\{method:'POST',headers:\{'Content-Type':'application\/json'\},body:JSON\.stringify\(\{messages:\[\{role:'system',content:(sysP|sys)\},\{role:'user',content:(text|q|msg)\}],model:'openai',seed:42\}\)\}\);\s*\n(\s*)var reply\s*=\s*await res\.text\(\);/g,
    (match, sysVar, textVar, indent) => {
      changes++;
      return `var res = await fetch('/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:${sysVar}},{role:'user',content:${textVar}}]})});\n${indent}var data = await res.json();\n${indent}var reply = data.choices[0].message.content;`;
    }
  );

  // ── Pattern 2b: POST with var, sysP, text — compact (no spaces) ──────────
  content = content.replace(
    /var res=await fetch\('https:\/\/text\.pollinations\.ai\/',\{method:'POST',headers:\{'Content-Type':'application\/json'\},body:JSON\.stringify\(\{messages:\[\{role:'system',content:(sysP|sys)\},\{role:'user',content:(text|q|msg)\}],model:'openai',seed:42\}\)\}\);\s*\n(\s*)var reply=await res\.text\(\);/g,
    (match, sysVar, textVar, indent) => {
      changes++;
      return `var res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:${sysVar}},{role:'user',content:${textVar}}]})});\n${indent}var data=await res.json();\n${indent}var reply=data.choices[0].message.content;`;
    }
  );

  // ── Pattern 2c: POST with const, sysP, msg||text ─────────────────────────
  content = content.replace(
    /const res\s*=\s*await fetch\('https:\/\/text\.pollinations\.ai\/',\s*\{method:'POST',headers:\{'Content-Type':'application\/json'\},body:JSON\.stringify\(\{messages:\[\{role:'system',content:(sysP|sys)\},\{role:'user',content:msg\|\|text\}],model:'openai',seed:42\}\)\}\);\s*\n(\s*)const reply\s*=\s*await res\.text\(\);/g,
    (match, sysVar, indent) => {
      changes++;
      return `const res = await fetch('/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:${sysVar}},{role:'user',content:msg||text}]})});\n${indent}const data = await res.json();\n${indent}const reply = data.choices[0].message.content;`;
    }
  );

  // ── Pattern 2d: GET template literal with ${model} variable ──────────────
  content = content.replace(
    /const res\s*=\s*await fetch\(`https:\/\/text\.pollinations\.ai\/\$\{encodeURIComponent\(([^)]+)\)\}\?model=\$\{[^}]+\}&system=\$\{encodeURIComponent\(([^)]+)\)\}&json=false`\);\s*\n(\s*)const reply\s*=\s*await res\.text\(\);/g,
    (match, textVar, sysVar, indent) => {
      changes++;
      return `const res = await fetch('/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:${sysVar}},{role:'user',content:${textVar}}]})});\n${indent}const data = await res.json();\n${indent}const reply = data.choices[0].message.content;`;
    }
  );

  // ── Pattern 3: POST with const, inline system string (Level4_Lesson7 style) ─
  // const res=await fetch('https://text.pollinations.ai/',{...,content:'...'},{role:'user',content:q}],model:'openai',seed:42})});
  // const reply=await res.text();
  content = content.replace(
    /const res\s*=\s*await fetch\('https:\/\/text\.pollinations\.ai\/',\{method:'POST',headers:\{'Content-Type':'application\/json'\},body:JSON\.stringify\(\{messages:\[\{role:'system',content:'([^']+)'\},\{role:'user',content:([^}]+)\}],model:'openai',seed:42\}\)\}\);\s*\n(\s*)const reply\s*=\s*await res\.text\(\);/g,
    (match, sysContent, textVar, indent) => {
      changes++;
      return `const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:'${sysContent}'},{role:'user',content:${textVar.trim()}}]})});\n${indent}const data=await res.json();\n${indent}const reply=data.choices[0].message.content;`;
    }
  );

  // ── Pattern 4: Fix any remaining `data.content||data.message||` lines ─────
  // If the original Level4_Lesson7 pattern used data.content, update to use reply
  content = content.replace(
    /AICHAT\.add\('bot',data\.content\|\|data\.message\|\|'[^']+'\)/g,
    (match) => {
      changes++;
      return `AICHAT.add('bot',reply||'답변을 가져올 수 없습니다.')`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(fpath, content, 'utf8');
    fileFixed++;
    totalFixed += changes;
    console.log(`✅ Fixed ${fname} (${changes} change(s))`);
  } else {
    // Check if pollinations still present
    if (content.includes('pollinations')) {
      console.log(`⚠️  STILL HAS POLLINATIONS: ${fname}`);
    }
  }
});

console.log(`\n🎉 Done! Fixed ${fileFixed} files, ${totalFixed} total replacements.`);

// Check any remaining pollinations references
const remaining = files.filter(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  return c.includes('pollinations');
});
if (remaining.length > 0) {
  console.log('\n⚠️  Files still containing pollinations:');
  remaining.forEach(f => console.log('  -', f));
} else {
  console.log('✅ No remaining pollinations references!');
}
