/**
 * patch_streaming.js
 * Level 0~2 레슨 파일의 AI 채팅을 스트리밍 방식으로 업데이트
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level\d_Lesson\d+\.html$/i.test(f)
);

// ── 스트리밍 reader 코드 (Level 1/2 공통) ──────────────────
const STREAM_L12 = `      var idx=this.msgs.push({role:'assistant',text:'⏳',time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})})-1;render();
      var _rd=res.body.getReader(),_dc=new TextDecoder(),_bf='';
      for(;;){var _ch=await _rd.read();if(_ch.done)break;_bf+=_dc.decode(_ch.value,{stream:true});var _ls=_bf.split('\\n');_bf=_ls.pop();for(var _l of _ls){if(!_l.startsWith('data:')||_l.includes('[DONE]'))continue;try{var _c=JSON.parse(_l.slice(5));if(_c.response){if(this.msgs[idx].text==='⏳')this.msgs[idx].text='';this.msgs[idx].text+=_c.response;render();var _b=document.querySelector('.ai-msgbox');if(_b)_b.scrollTop=_b.scrollHeight;}}catch(_e){}}}
      this.loading = false;
      render();`;

// ── 스트리밍 reader 코드 (Level 0 .then 체인) ──────────────
const STREAM_L0_THEN = `  .then(async r=>{
    document.getElementById('ai-loading')?.remove();
    const _el=document.createElement('div');
    _el.className='bubble bubble-left';_el.style.marginBottom='8px';
    _el.innerHTML='<b>AI 선생님:</b> <span></span>';
    chat.appendChild(_el);
    const _sp=_el.querySelector('span');
    const _rd=r.body.getReader(),_dc=new TextDecoder();
    let _bf='';
    for(;;){const{done,value}=await _rd.read();if(done)break;_bf+=_dc.decode(value,{stream:true});const _ls=_bf.split('\\n');_bf=_ls.pop();for(const _l of _ls){if(!_l.startsWith('data:')||_l.includes('[DONE]'))continue;try{const _c=JSON.parse(_l.slice(5));if(_c.response){_sp.textContent+=_c.response;chat.scrollTop=chat.scrollHeight;}}catch(_e){}}}
  })`;

let updated = 0, skipped = 0;

files.forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // ── Level 0: .then(r=>r.json()) 체인 교체 ──────────────
  // 패턴: .then(r=>r.json())\n  .then(d=>{...(ai-loading remove + reply + innerHTML)...})
  const l0Pattern = /\.then\(r=>r\.json\(\)\)\s*\n\s*\.then\(d=>\{[\s\S]*?document\.getElementById\('ai-loading'\)\?\.remove\(\);[\s\S]*?chat\.innerHTML[\s\S]*?\}\)/;
  if (l0Pattern.test(content)) {
    content = content.replace(l0Pattern, STREAM_L0_THEN);
    changed = true;
  }

  // ── Level 1/2: await res.json() 블록 교체 ────────────
  // 패턴: var data = await res.json();\n...\n this.addMsg('assistant', reply);
  const l12Pattern = /var data = await res\.json\(\);\s*\n\s*var reply = data\.choices\[0\]\.message\.content;\s*\n\s*this\.loading = false;\s*\n\s*this\.addMsg\('assistant', reply\);/;
  if (l12Pattern.test(content)) {
    content = content.replace(l12Pattern, STREAM_L12);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    updated++;
    process.stdout.write('✅ ' + file + '\n');
  } else {
    // 이미 적용됐거나 패턴 불일치
    if (content.includes('_rd=res.body.getReader') || content.includes('_rd=r.body.getReader')) {
      skipped++;
      process.stdout.write('⏭  ' + file + ' (already patched)\n');
    } else {
      process.stdout.write('⚠️  ' + file + ' (pattern not found)\n');
    }
  }
});

process.stdout.write('\nDone: ' + updated + ' updated, ' + skipped + ' skipped\n');
