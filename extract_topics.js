const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\kodhj\\elimg-com';

[1, 2].forEach(level => {
  console.log(`\n=== LEVEL ${level} ===`);
  for (let lesson = 1; lesson <= 20; lesson++) {
    const file = path.join(dir, `HanwhaOcean_Level${level}_Lesson${lesson}.html`);
    if (!fs.existsSync(file)) continue;
    const c = fs.readFileSync(file, 'utf8');
    // Extract sysP
    const m = c.match(/var sysP = ['`]([^'`]{10,300})/);
    const sysP = m ? m[1].slice(0, 160).replace(/\n/g, ' ') : '(not found)';
    // Extract page title
    const t = c.match(/<title>([^<]+)<\/title>/);
    const title = t ? t[1] : '';
    console.log(`L${level}-L${lesson}: ${title}`);
    console.log(`  sysP: ${sysP}`);
  }
});
