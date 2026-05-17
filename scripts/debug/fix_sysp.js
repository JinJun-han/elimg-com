const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/kodhj/elimg-com';

const files = fs.readdirSync(dir)
  .filter(f => f.match(/^HanwhaOcean_Level[012]_Lesson\d+\.html$/))
  .sort();

let fixed = 0, unchanged = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Fix: literal newline before LESSON: inside sysP string
  // Pattern: '...English.\nLESSON:...' -> '...English. LESSON:...'
  const original = content;
  
  // Replace literal newline between the sysP content and LESSON: marker
  content = content.replace(/var sysP = '([^']*)\n(LESSON:[^']+)';/g, function(match, p1, p2) {
    return "var sysP = '" + p1.trimEnd() + ' ' + p2 + "';";
  });
  
  if (content !== original) {
    fs.writeFileSync(fp, content);
    fixed++;
    console.log('FIXED sysP:', file);
  } else {
    unchanged++;
  }
}

console.log('\nDone: fixed=' + fixed + ', unchanged=' + unchanged);
