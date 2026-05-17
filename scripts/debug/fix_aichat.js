const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/kodhj/elimg-com';

// The AICHAT code to insert between ]; and "if (!b || this.loading)"
const AICHAT_CODE = `var AICHAT = {
  msgs: [],
  loading: false,
  input: '',
  addMsg: function(role, text) {
    this.msgs.push({ role, text, time: new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}) });
    render();
    setTimeout(function(){
      var box = document.querySelector('.ai-msgbox');
      if(box) box.scrollTop = box.scrollHeight;
    }, 50);
  },
  quickSend: function(idx) {
    var b = AI_QUICK_BTNS[idx];
`;

// Pattern to search for (end of AI_QUICK_BTNS array + orphaned quickSend code)
const SEARCH = `];\n    if (!b || this.loading) return;`;
const REPLACE = `];\n${AICHAT_CODE}    if (!b || this.loading) return;`;

// Get all HanwhaOcean lesson files
const files = fs.readdirSync(dir)
  .filter(f => f.match(/^HanwhaOcean_Level[012]_Lesson\d+\.html$/))
  .sort();

let fixed = 0, already = 0, notFound = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  if (content.includes('var AICHAT')) {
    already++;
    console.log('SKIP (already has AICHAT):', file);
    continue;
  }
  
  if (content.includes(SEARCH)) {
    content = content.replace(SEARCH, REPLACE);
    fs.writeFileSync(fp, content);
    fixed++;
    console.log('FIXED:', file);
  } else {
    notFound++;
    console.log('NOT FOUND pattern in:', file);
  }
}

console.log(`\nDone: fixed=${fixed}, already_ok=${already}, not_found=${notFound}`);
