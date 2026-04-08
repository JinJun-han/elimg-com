/**
 * patch_typing.js
 * 스트리밍 코드를 JSON + 타이핑 애니메이션으로 교체
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level\d_Lesson\d+\.html$/i.test(f)
);

// 타이핑 애니메이션 함수 (공통 helper - 헤드에 삽입)
const TYPE_FN = `
function _typeText(el, text, speed) {
  var i=0;
  function _next(){
    if(i<text.length){ el.textContent+=text[i++]; setTimeout(_next, speed); }
  }
  _next();
}`;

// Level 0 패턴: .then(async r=>{ ... }) → JSON 방식
const L0_STREAM_PATTERN = /\.then\(async r=>\{[\s\S]*?_rd=r\.body\.getReader[\s\S]*?\}\s*\)/;
const L0_JSON_NEW = `  .then(r=>r.json())
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
  })`;

// Level 1/2 패턴: var idx=this.msgs.push(...)..._rd=res.body.getReader...render(); → JSON 방식
const L12_STREAM_PATTERN = /var idx=this\.msgs\.push\(\{role:'assistant'[\s\S]*?_rd=res\.body\.getReader[\s\S]*?this\.loading = false;\s*\n\s*render\(\);/;
const L12_JSON_NEW = `      var data = await res.json();
      var reply = data.choices[0].message.content;
      this.loading = false;
      var _idx=this.msgs.push({role:'assistant',text:'',time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})})-1;
      render();
      var _full=reply, _i=0;
      var _t=setInterval(function(){
        if(_i<_full.length){_i++;AICHAT.msgs[_idx].text=_full.slice(0,_i);render();var _b=document.querySelector('.ai-msgbox');if(_b)_b.scrollTop=_b.scrollHeight;}
        else clearInterval(_t);
      },18);`;

let updated = 0;

files.forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Level 0: 스트리밍 → JSON+타이핑
  if (L0_STREAM_PATTERN.test(content)) {
    content = content.replace(L0_STREAM_PATTERN, L0_JSON_NEW);
    // 타이핑 함수 삽입 (</script> 직전)
    if (!content.includes('function _typeText')) {
      const insertBefore = 'function sendAI()';
      if (content.includes(insertBefore)) {
        content = content.replace(insertBefore, TYPE_FN + '\n' + insertBefore);
      }
    }
    changed = true;
  }

  // Level 1/2: 스트리밍 → JSON+타이핑
  if (L12_STREAM_PATTERN.test(content)) {
    content = content.replace(L12_STREAM_PATTERN, L12_JSON_NEW);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    updated++;
    process.stdout.write('✅ ' + file + '\n');
  } else {
    process.stdout.write('⏭  ' + file + ' (no match)\n');
  }
});

process.stdout.write('\nDone: ' + updated + ' updated\n');
