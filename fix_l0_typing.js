/**
 * fix_l0_typing.js
 * Level 0 파일의 손상된 fetch 체인 정리
 * 현재 상태: .then(d=>{...});[잔여 스트리밍 코드]...})\n.catch(...)
 * 목표 상태: .then(r=>r.json()).then(d=>{...타이핑...}).catch(...)
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level0_Lesson\d+\.html$/i.test(f)
);

// 새 fetch 체인: JSON + 타이핑 애니메이션
const NEW_FETCH_TAIL = `  .then(r=>r.json())
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

const TYPE_FN = `
function _typeText(el, text, speed) {
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

  // fetch() ... 끝까지 교체
  // fetch 시작점 찾기
  const fetchStart = content.indexOf("  fetch('/api/chat', {");
  if (fetchStart < 0) {
    process.stdout.write('⚠️  ' + file + ' (no fetch found)\n');
    return;
  }

  // .catch 뒤의 세미콜론까지 끝점 찾기
  // 패턴: .catch(()=>{ ... });  마지막 }); 찾기
  // fetch 다음의 첫 번째 "});" 또는 마지막 catch 이후 "});"
  const afterFetch = content.slice(fetchStart);

  // .catch(()=>{...}); 찾기
  const catchMatch = afterFetch.match(/\.catch\(.*?\{[\s\S]*?\}\s*\)\s*;/);
  if (!catchMatch) {
    process.stdout.write('⚠️  ' + file + ' (no catch found)\n');
    return;
  }

  const catchEnd = fetchStart + afterFetch.indexOf(catchMatch[0]) + catchMatch[0].length;
  const fetchBlock = content.slice(fetchStart, catchEnd);

  // fetch 블록에서 fetch(...))} 부분만 추출 (첫번째 }) 까지)
  // fetch('/api/chat', {...})  - 이 부분만 유지
  const fetchCallEnd = fetchBlock.indexOf('\n  )');
  const fetchCallOnly = fetchBlock.slice(0, fetchCallEnd + 4); // includes \n  )

  // 새 내용으로 교체
  const newBlock = fetchCallOnly + '\n' + NEW_FETCH_TAIL;

  content = content.slice(0, fetchStart) + newBlock + content.slice(catchEnd);

  // _typeText 함수 삽입 (없는 경우)
  if (!content.includes('function _typeText')) {
    const insertBefore = 'function sendAI()';
    if (content.includes(insertBefore)) {
      content = content.replace(insertBefore, TYPE_FN + insertBefore);
    }
  }

  fs.writeFileSync(fp, content, 'utf8');
  updated++;
  process.stdout.write('✅ ' + file + '\n');
});

process.stdout.write('\nDone: ' + updated + ' updated\n');
