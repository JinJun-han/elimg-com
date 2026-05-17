/**
 * fix_l0_final.js — Level 0 AI 채팅 코드 완전 재작성
 * fetch 호출부터 catch까지 통째로 교체
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level0_Lesson\d+\.html$/i.test(f)
);

const TYPE_FN = `function _typeText(el, text, speed) {
  var i=0;
  function _next(){
    if(i<text.length){ el.textContent+=text[i++]; setTimeout(_next, speed); }
  }
  _next();
}
`;

let updated = 0;

files.forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');

  // fetch 시작 위치
  const fetchMarker = "  fetch('/api/chat', {";
  const fetchStart = content.indexOf(fetchMarker);
  if (fetchStart < 0) {
    process.stdout.write('⚠️  ' + file + ' (no fetch found)\n');
    return;
  }

  // fetch 호출의 끝: method, headers, body, }) 패턴으로 끝나는 위치
  // fetch('/api/chat', { ... }) 다음의 \n  }) 를 찾아야 함
  // 실제 패턴: body: JSON.stringify({...})\n  })
  const afterFetch = content.slice(fetchStart);

  // JSON.stringify(...)}) 이후의 줄바꿈+공백+}) 찾기
  const bodyEnd = afterFetch.indexOf("JSON.stringify({messages:");
  if (bodyEnd < 0) {
    process.stdout.write('⚠️  ' + file + ' (no JSON.stringify found)\n');
    return;
  }

  // body 라인 이후의 첫 번째 \n  }) 찾기 (fetch 클로징)
  const afterBody = afterFetch.slice(bodyEnd);
  const fetchClose = afterBody.indexOf('\n  })');
  if (fetchClose < 0) {
    process.stdout.write('⚠️  ' + file + ' (no fetch close found)\n');
    return;
  }

  // fetch 호출 블록 끝 = fetchStart + bodyEnd + fetchClose + '\n  })'.length
  const fetchBlockEnd = fetchStart + bodyEnd + fetchClose + 5; // '\n  })' = 5 chars
  const fetchCallBlock = content.slice(fetchStart, fetchBlockEnd);

  // sendAI 함수 끝 찾기 (}\n\n 패턴)
  const afterFetchBlock = content.slice(fetchBlockEnd);
  // .catch(()=>{ ... }); 까지 찾기
  const catchPattern = /\s*\.catch\(\(\)=>\{[\s\S]*?\}\s*\)\s*;/;
  const catchMatch = afterFetchBlock.match(catchPattern);
  if (!catchMatch) {
    process.stdout.write('⚠️  ' + file + ' (no catch found)\n');
    return;
  }

  const fetchFullEnd = fetchBlockEnd + catchMatch.index + catchMatch[0].length;

  // 시스템 프롬프트 추출 (systemPrompt = `...`)
  const sysMatch = content.match(/const systemPrompt = `([^`]+)`/);
  const sysPrompt = sysMatch ? sysMatch[1] : 'You are a Korean tutor.';

  // 새 fetch 블록
  const newFetchBlock = `fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({messages:[{role:'system',content:systemPrompt},{role:'user',content:msg}]})
  })
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('ai-loading')?.remove();
    const reply = d.choices?.[0]?.message?.content || '죄송합니다, 다시 시도해 주세요.';
    const _el=document.createElement('div');
    _el.className='bubble bubble-left';_el.style.marginBottom='8px';
    _el.innerHTML='<b>AI 선생님:</b> <span></span>';
    chat.appendChild(_el);
    const _sp=_el.querySelector('span');
    _typeText(_sp, reply, 18);
    chat.scrollTop=chat.scrollHeight;
  })
  .catch(()=>{
    document.getElementById('ai-loading')?.remove();
    chat.innerHTML += \`<div class="bubble bubble-left" style="color:#e00;margin-bottom:8px">연결 오류. 다시 시도해 주세요.</div>\`;
  });`;

  // 전체 치환
  content = content.slice(0, fetchStart) + '  ' + newFetchBlock + content.slice(fetchFullEnd);

  // _typeText 함수 삽입
  if (!content.includes('function _typeText')) {
    content = content.replace('function sendAI()', TYPE_FN + 'function sendAI()');
  }

  fs.writeFileSync(fp, content, 'utf8');
  updated++;
  process.stdout.write('✅ ' + file + '\n');
});

process.stdout.write('\nDone: ' + updated + ' updated\n');
